// api/chat.js  (Vercel serverless function)
// Uses the exact same chat logic as the local Express server.
import { chatHandler, chatErrorResponse } from '../server/chatRoute.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const out = await chatHandler(req.body ?? {});
    return res.status(200).json(out);
  } catch (e) {
    console.error('[/api/chat]', e);
    const { status, body } = chatErrorResponse(e);
    return res.status(status).json(body);
  }
}