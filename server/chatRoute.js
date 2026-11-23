// =====================================================================
// server/chatRoute.js
// Replaces the old POST /api/chat and adds POST /api/portfolio/tag.
// Reply shape: { reply, text, vendors: [...] }
// =====================================================================
import { Type } from '@google/genai';
import { getAI, generate, toolDeclarations, executeTool, collectCards, tagPortfolioRow } from './aiTools.js';

const MAX_TOOL_STEPS = 5;

const systemPrompt = (today) => `You are Eve, the friendly assistant of Jashan-E-Aas, an Indian marketplace for event vendors.
Today's date is ${today}. Money is in rupees: write amounts like ₹1,50,000 (Indian digit grouping).

How you work:
- For any question about vendors, packages, prices, availability, portfolios or budgets you MUST call a tool first. Never answer those from memory.
- search_website_catalog finds vendors and packages. get_vendor_full_profile gives details of one vendor. build_party_bundle picks several services inside one total budget.
- Only mention vendor names, package names, prices, inclusions and images that appear in tool results. Never invent or estimate a vendor, a price or an image link. If nothing matches, say so and suggest changing the budget, keywords or date.
- If you really cannot search without the budget or the kind of service, ask one short question. Otherwise search straight away.
- Turn relative dates ("next Saturday") into YYYY-MM-DD before calling a tool.
- Keep replies short and warm (3 to 6 sentences). Recommend at most 3 options and say why each fits, using its inclusions and portfolio.
- Never mention tool names, the database or internal ids to the customer.
- For general questions (how the site works, event ideas) answer helpfully without tools.`;

// Accepts { messages: [...] } or { message, history: [...] }
// Each item can look like { role, text } / { role, content } / { sender, text }
function toContents(body = {}) {
  const raw = Array.isArray(body.messages)
    ? body.messages
    : [
        ...(Array.isArray(body.history) ? body.history : []),
        ...(body.message ? [{ role: 'user', text: body.message }] : []),
      ];

  const contents = raw
    .map((m) => {
      const text = m.text ?? m.content ?? m.parts?.[0]?.text ?? '';
      const who = String(m.role ?? m.sender ?? '').toLowerCase();
      const isEve = ['assistant', 'model', 'eve', 'bot', 'ai'].includes(who);
      return { role: isEve ? 'model' : 'user', parts: [{ text: String(text) }] };
    })
    .filter((c) => c.parts[0].text.trim())
    .slice(-12);

  while (contents.length && contents[0].role === 'model') contents.shift();
  return contents;
}

const finalSchema = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { vendor_id: { type: Type.STRING }, package_id: { type: Type.STRING } },
        required: ['vendor_id', 'package_id'],
      },
    },
  },
  required: ['reply', 'recommendations'],
};

export function registerAiRoutes(app) {
  app.post('/api/chat', async (req, res) => {
    try {
      const contents = toContents(req.body);
      if (!contents.length) return res.status(400).json({ error: 'No message provided' });

      const ai = getAI();
      const today = new Date().toISOString().slice(0, 10);
      const transcript = contents
        .slice(-6)
        .map((c) => `${c.role === 'user' ? 'Customer' : 'Eve'}: ${c.parts[0].text}`)
        .join('\n');

      const cards = new Map();
      const toolLog = [];
      let usedTools = false;

      for (let step = 0; step < MAX_TOOL_STEPS; step++) {
        const response = await generate(ai, {
          contents,
          config: {
            systemInstruction: systemPrompt(today),
            tools: [{ functionDeclarations: toolDeclarations }],
            temperature: 0.3,
          },
        });

        const calls = response.functionCalls;
        if (!calls || !calls.length) {
          if (!usedTools) {
            const reply = response.text || 'Sorry, I could not think of an answer. Please try again.';
            return res.json({ reply, text: reply, vendors: [] });
          }
          break;
        }

        usedTools = true;
        contents.push(response.candidates[0].content);

        const parts = [];
        for (const call of calls) {
          let result;
          try {
            result = await executeTool(call.name, call.args || {});
            collectCards(call.name, result, cards);
          } catch (e) {
            console.error(`[tool ${call.name}]`, e.message);
            result = { error: e.message };
          }
          toolLog.push({ tool: call.name, args: call.args || {}, result });
          parts.push({
            functionResponse: { name: call.name, ...(call.id ? { id: call.id } : {}), response: { result } },
          });
        }
        contents.push({ role: 'user', parts });
      }

      const facts = JSON.stringify(toolLog).slice(0, 24000);
      const final = await generate(ai, {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Conversation so far:\n${transcript}\n\nVERIFIED DATABASE RESULTS (the only facts you may use):\n${facts}\n\nWrite Eve's final answer for the customer. Return JSON with:\n- "reply": your friendly answer (3-6 sentences). Mention only vendors, packages, prices and inclusions that appear in the verified results. If the results are empty or contain an error, say nothing matched and suggest changing budget, keywords or date.\n- "recommendations": up to 3 items, each with the exact vendor_id and package_id copied from the verified results (empty array if none).`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: systemPrompt(today),
          responseMimeType: 'application/json',
          responseSchema: finalSchema,
          temperature: 0.3,
        },
      });

      let parsed;
      try {
        parsed = JSON.parse(final.text);
      } catch {
        parsed = { reply: final.text || 'Sorry, something went wrong. Please try again.', recommendations: [] };
      }

      const vendorsToShow = Array.from(cards.values());
      return res.json({ reply: parsed.reply, text: parsed.reply, vendors: vendorsToShow });
    } catch (e) {
      console.error('[/api/chat]', e);
      const busy = e?.status === 503 || e?.status === 429;
      return res.status(busy ? 503 : 500).json({
        error: busy
          ? 'Eve is busy right now. Please try again in a minute.'
          : 'Eve is unavailable right now. Please try again.',
      });
    }
  });

  app.post('/api/portfolio/tag', async (req, res) => {
    try {
      const { portfolio_id } = req.body || {};
      if (!portfolio_id) return res.status(400).json({ ok: false, error: 'portfolio_id is required' });
      const out = await tagPortfolioRow(portfolio_id);
      return res.json({ ok: true, ...out });
    } catch (e) {
      console.error('[/api/portfolio/tag]', e.message);
      return res.status(500).json({ ok: false, error: e.message });
    }
  });
}
