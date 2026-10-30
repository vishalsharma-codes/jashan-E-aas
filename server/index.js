import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY. Check your server/.env file.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_INSTRUCTION = `
You are Eve, the intelligent, friendly event-planning assistant for Jashan-E-Aas, an event marketplace.

YOUR ROLE:
- Help users plan weddings, birthdays, college festivals, concerts, farewell parties, DJ nights, corporate events, and other celebrations.
- Understand the user's latest message in the context of the entire conversation.
- Maintain the current conversation topic. Never restart the conversation or introduce yourself again unless the user explicitly asks who you are.
- If a user says something like "plan my college event", immediately acknowledge that they want to plan a college event and help them move forward.
- If the user changes the event type, acknowledge the new event type and continue naturally.

CONVERSATION STYLE:
- Be warm, professional, conversational, and concise.
- Do not give a generic greeting in every response.
- Do not repeat questions the user has already answered.
- Ask one or two relevant questions at a time, rather than presenting a long questionnaire.
- Collect details progressively: event type, location, date, guest count, budget, theme, and preferences.
- If the user has provided only an event type, ask for the most useful missing detail first.
- If the user's message contains a typo, understand the intended meaning without unnecessarily correcting them.
- Provide practical suggestions when enough information is available.

ACCURACY:
- Never invent vendor availability, prices, bookings, or confirmations.
- Clearly distinguish suggestions and estimates from verified information.
- If a request is ambiguous, ask a concise clarifying question.
- Always respond to the user's latest message directly and use the conversation history to maintain continuity.
- Keep replies under 80 words unless the user asks for a detailed plan.
- Do not use markdown formatting (no ** or #). Use plain text with simple - bullets and short lines.
`;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "EveBuddy API" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    // Accept both history formats:
    // { role: "user" | "model", text: "..." }
    // { role: "user" | "model", parts: [{ text: "..." }] }
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "model"].includes(item.role) &&
              (typeof item.text === "string" ||
                (Array.isArray(item.parts) &&
                  typeof item.parts[0]?.text === "string"))
          )
          .slice(-10)
          .map((item) => {
            const text =
              typeof item.text === "string"
                ? item.text
                : item.parts[0].text;

            return {
              role: item.role,
              parts: [{ text: text.slice(0, 3000) }],
            };
          })
      : [];

    const stream = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: [
        ...safeHistory,
        { role: "user", parts: [{ text: message.trim() }] },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingLevel: "low" },
      },
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
      const reason = chunk.candidates?.[0]?.finishReason;
      if (reason) console.log("finishReason:", reason);
    }

    res.end();
  } catch (error) {
    console.error("Gemini request failed:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "EveBuddy couldn't respond. Please try again.",
        detail: String(error?.message || error).slice(0, 300),
      });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`EveBuddy API running at http://localhost:${PORT}`);
});