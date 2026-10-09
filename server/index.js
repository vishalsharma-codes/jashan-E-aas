
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
          .filter(
            (item) =>
              item &&
              ["user", "model"].includes(item.role) &&
              typeof item.text === "string"
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            parts: [{ text: item.text.slice(0, 3000) }],
          }))
      : [];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        ...safeHistory,
        { role: "user", parts: [{ text: message.trim() }] },
      ],
      config: {
        systemInstruction: `
You are Eve, the friendly event-planning assistant for Jashan-E-Aas.
Help visitors plan weddings, birthdays, corporate events and concerts.
Ask useful questions about their location, date, guest count, budget
and preferred style. Keep replies helpful and concise.
Never claim a booking is confirmed or a vendor is available without
verified information.
`,
        maxOutputTokens: 500,
      },
    });

    res.json({
      reply: response.text || "I couldn't generate a reply. Please try again.",
    });
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    res.status(500).json({
      error: "EveBuddy couldn't respond. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`EveBuddy API running at http://localhost:${PORT}`);
});
