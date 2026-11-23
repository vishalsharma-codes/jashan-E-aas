import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { registerAiRoutes } from "./chatRoute.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("ENV check:", {
  hasGemini: Boolean(process.env.GEMINI_API_KEY),
  hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
  hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "EveBuddy API" });
});

registerAiRoutes(app);

app.listen(PORT, () => {
  console.log(`EveBuddy API running at http://localhost:${PORT}`);
});
