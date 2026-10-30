import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are Eve, the intelligent, friendly event-planning assistant
for Jashan-E-Aas, an event marketplace.

PASTE YOUR FULL SYSTEM PROMPT HERE.
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

    const ai = new GoogleGenAI({ apiKey });

    const { message, history = [] } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    // Accept both frontend history formats.
    const safeHistory = Array.isArray(history)
      ? history
          .filter((item) =>
            item &&
            ["user", "model"].includes(item.role)
          )
          .slice(-10)
          .map((item) => {
            const text =
              typeof item.text === "string"
                ? item.text
                : Array.isArray(item.parts)
                  ? item.parts
                      .map((part) => part?.text || "")
                      .join("")
                  : "";

            return {
              role: item.role,
              parts: [{ text: text.slice(0, 3000) }],
            };
          })
          .filter((item) => item.parts[0].text.trim())
      : [];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...safeHistory,
        {
          role: "user",
          parts: [{ text: message.trim() }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 1000,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    return res.status(200).json({
      reply:
        response.text ||
        "I couldn't generate a reply. Please try again.",
    });

  } catch (error) {
    console.error("Gemini request failed:", error);

    return res.status(500).json({
      error: "EveBuddy couldn't respond. Please try again.",
    });
  }
}