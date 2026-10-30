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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are Eve, the intelligent, friendly event-planning assistant
for Jashan-E-Aas, an event marketplace.

PASTE YOUR FULL SYSTEM PROMPT HERE.
Keep replies under 80 words unless the user asks for a detailed plan.
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

    const safeHistory = Array.isArray(history)
      ? history
          .filter((item) => item && ["user", "model"].includes(item.role))
          .slice(-10)
          .map((item) => {
            const text =
              typeof item.text === "string"
                ? item.text
                : Array.isArray(item.parts)
                  ? item.parts.map((p) => p?.text || "").join("")
                  : "";
            return { role: item.role, parts: [{ text: text.slice(0, 3000) }] };
          })
          .filter((item) => item.parts[0].text.trim())
      : [];

    const stream = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: [
        ...safeHistory,
        { role: "user", parts: [{ text: message.trim() }] },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 500,
      },
    });

    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.flushHeaders?.();

    try {
      for await (const chunk of stream) {
        if (chunk.text) res.write(chunk.text);
      }
      return res.end();
    } catch (streamError) {
      console.error("Gemini streaming failed:", streamError);
      if (!res.writableEnded) {
        res.end("\n\nEve encountered a streaming error. Please try again.");
      }
    }
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    if (!res.headersSent) {
      res.status(500).json({
        error: "EveBuddy couldn't respond.",
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