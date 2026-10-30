import { GoogleGenAI } from "@google/genai";

export const config = { maxDuration: 30 };

const SYSTEM_INSTRUCTION = `
You are Eve, the intelligent, friendly event-planning assistant
for Jashan-E-Aas, an event marketplace.

PASTE YOUR FULL SYSTEM PROMPT HERE.
Keep replies under 80 words unless the user asks for a detailed plan.
Do not use markdown formatting (no ** or #). Use plain text with simple - bullets and short lines.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");
      return res.status(500).json({
        error: "Gemini API key is not configured on the server.",
      });
    }

    const { message, history = [] } = req.body ?? {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    // Accept both { text } and Gemini { parts: [{ text }] } history formats.
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

            return {
              role: item.role,
              parts: [{ text: text.slice(0, 3000) }],
            };
          })
          .filter((item) => item.parts[0].text.trim())
      : [];

    const ai = new GoogleGenAI({ apiKey });
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

    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    try {
      for await (const chunk of stream) {
        if (chunk.text) res.write(chunk.text);
        const reason = chunk.candidates?.[0]?.finishReason;
        if (reason) console.log("finishReason:", reason);
      }
      return res.end();
    } catch (streamError) {
      console.error("Gemini streaming failed:", streamError);
      // Headers/body may already be sent, so a JSON status response is no longer possible.
      if (!res.writableEnded) res.end("\n\nEve encountered a streaming error. Please try again.");
    }
  } catch (error) {
    console.error("Gemini request failed:", error);
    return res.status(500).json({
      error: "EveBuddy couldn't respond.",
      detail: String(error?.message || error).slice(0, 300),
    });
  }
}