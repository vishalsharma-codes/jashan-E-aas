import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are Eve, the intelligent, friendly event-planning assistant for Jashan-E-Aas, an event marketplace.
... (paste your full prompt here, without the WritingBlock tags)
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter((i) => i && ["user", "model"].includes(i.role) && typeof i.text === "string")
          .slice(-10)
          .map((i) => ({ role: i.role, parts: [{ text: i.text.slice(0, 3000) }] }))
      : [];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [...safeHistory, { role: "user", parts: [{ text: message.trim() }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 1000,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    res.status(200).json({
      reply: response.text || "I couldn't generate a reply. Please try again.",
    });
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    res.status(500).json({ error: "EveBuddy couldn't respond. Please try again." });
  }
}