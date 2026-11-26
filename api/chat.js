// api/chat.js  (Vercel serverless function)
import { GoogleGenAI } from "@google/genai";
import {
  generate,
  toolDeclarations,
  executeTool,
  collectCards,
} from "../server/aiTools.js";

export const config = { maxDuration: 60 };

const SYSTEM_INSTRUCTION = `
You are Eve, the intelligent, friendly event-planning assistant
for Jashan-E-Aas, an event marketplace.

PASTE YOUR FULL SYSTEM PROMPT HERE (personality, tone, event knowledge).

STRICT RULES ABOUT VENDORS:
- You know NO vendors by yourself. Every vendor, package and price must come from a tool result (search_website_catalog, get_vendor_full_profile, build_party_bundle).
- Whenever the user asks to find, suggest, compare or show vendors, packages or prices, call a tool FIRST. If you don't know the category or budget, still call search_website_catalog with what you have.
- Never invent or guess vendor names, prices or packages. Only mention vendors that a tool returned.
- If a tool returns nothing, say plainly that no matching vendors are listed right now and suggest changing budget or category.
- The app shows vendor cards itself, so in text just give a short intro and one or two highlights.

Keep replies under 80 words unless the user asks for a detailed plan.
Do not use markdown formatting (no ** or #). Use plain text with simple - bullets and short lines.
Today's date is ${new Date().toISOString().slice(0, 10)}.
`;

const MAX_TOOL_ROUNDS = 4;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    const { message, history = [] } = req.body ?? {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter((item) => item && ["user", "model"].includes(item.role))
          .slice(-10)
          .map((item) => {
            const text =
              typeof item.text === "string"
                ? item.text
                : Array.isArray(item.parts)
                  ? item.parts.map((part) => part?.text || "").join("")
                  : "";
            return { role: item.role, parts: [{ text: text.slice(0, 3000) }] };
          })
          .filter((item) => item.parts[0].text.trim())
      : [];

    const ai = new GoogleGenAI({ apiKey });
    const contents = [...safeHistory, { role: "user", parts: [{ text: message.trim() }] }];
    const cardStore = new Map();
    let reply = "";

    const t0 = Date.now();
    const withTimeout = (p, ms, label) => {
      let timer;
      return Promise.race([
        p,
        new Promise((_, rej) => {
          timer = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
        }),
      ]).finally(() => clearTimeout(timer));
    };

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      if (Date.now() - t0 > 45000) throw new Error(`Gave up after ${Date.now() - t0}ms at round ${round}`);
      console.log(`round ${round}: calling Gemini at ${Date.now() - t0}ms`);
      const response = await generate(ai, {
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: toolDeclarations }],
          maxOutputTokens: 1024,
          temperature: 0.4,
          httpOptions: { timeout: 20000 }, // fail fast instead of hanging for 60s
        },
      });

      const calls = response.functionCalls || [];
      if (!calls.length) {
        reply = response.text || "";
        break;
      }

      // Keep the model's own turn (includes the function calls) in the history.
      contents.push(response.candidates[0].content);

      const responseParts = [];
      for (const call of calls) {
        let result;
        try {
          console.log(`tool ${call.name} start`, JSON.stringify(call.args || {}));
          result = await withTimeout(executeTool(call.name, call.args || {}), 15000, `tool ${call.name}`);
          collectCards(call.name, result, cardStore);
          console.log(`tool ${call.name} ok at ${Date.now() - t0}ms`);
        } catch (err) {
          console.error(`tool ${call.name} failed:`, err);
          result = { error: String(err?.message || err).slice(0, 300) };
        }
        // Cards come from the DB; the model only needs a slim copy (no image URLs).
        const slim =
          result == null
            ? result
            : JSON.parse(
                JSON.stringify(result, (k, v) =>
                  k === "portfolio_image_urls" || k === "image_url" ? undefined : v
                )
              );
        responseParts.push({
          functionResponse: { name: call.name, response: { result: slim } },
        });
      }
      contents.push({ role: "user", parts: responseParts });
    }

    if (!reply) reply = "Sorry, I couldn't put that together. Please try again.";

    return res.status(200).json({ reply, text: reply, cards: Array.from(cardStore.values()) });
  } catch (error) {
    console.error("Gemini request failed:", error);
    return res.status(500).json({
      error: "EveBuddy couldn't respond.",
      detail: String(error?.message || error).slice(0, 300),
    });
  }
}
