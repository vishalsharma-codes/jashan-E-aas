// =====================================================================
// server/aiTools.js
// Tools Gemini can call, plus Gemini-vision tagging of portfolio photos.
// Uses ES modules (import/export). Needs Node 18+.
// =====================================================================
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export const MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_MODEL = 'gemini-3.8-flash';

// Clients are created lazily so dotenv has already loaded server/.env
let _supabase;
let _ai;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to server/.env');
    }
    _supabase = createClient(url, key, { auth: { persistSession: false } });
  }
  return _supabase;
}

export function getAI() {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Add GEMINI_API_KEY to server/.env');
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

export async function generate(ai, params, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      return await ai.models.generateContent({
        ...params,
        model: i === tries - 1 ? FALLBACK_MODEL : MODEL,
      });
    } catch (e) {
      const retryable = e?.status === 503 || e?.status === 429;
      if (!retryable || i === tries - 1) throw e;
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** i));
    }
  }
}

// ---------------------------------------------------------------------
// 1) Tool declarations (what Gemini is allowed to call)
// ---------------------------------------------------------------------
export const toolDeclarations = [
  {
    name: 'search_website_catalog',
    description:
      'Search verified vendors and their packages on Jashan-E-Aas. Use for any request to find, suggest or compare vendors, packages or prices. Returns packages with price, inclusions, rating and portfolio image URLs.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        budget: { type: Type.NUMBER, description: 'Maximum package price in INR, e.g. 150000' },
        category: {
          type: Type.STRING,
          description: 'One vendor category as a short word, e.g. "catering", "photography", "sound", "decor"',
        },
        keywords: {
          type: Type.STRING,
          description: 'Space-separated style/feature words, e.g. "gold plate live counters neon stage"',
        },
        event_date: { type: Type.STRING, description: 'Event date as YYYY-MM-DD, to skip vendors blocked that day' },
      },
    },
  },
  {
    name: 'get_vendor_full_profile',
    description:
      'Get all packages, portfolio images and reviews of ONE vendor. Use after a search when the customer wants more detail about a vendor.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        vendor_id: { type: Type.STRING, description: 'vendor_id exactly as returned by search_website_catalog' },
      },
      required: ['vendor_id'],
    },
  },
  {
    name: 'build_party_bundle',
    description:
      'Pick one verified vendor per category (e.g. caterer + photographer + sound) so that the total price stays within the total budget.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        total_budget: { type: Type.NUMBER, description: 'Total budget in INR for all services together' },
        needed_categories: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Categories needed, e.g. ["catering", "photography", "sound"] (max 5)',
        },
        event_date: { type: Type.STRING, description: 'Event date as YYYY-MM-DD (optional)' },
      },
      required: ['total_budget', 'needed_categories'],
    },
  },
];

// ---------------------------------------------------------------------
// 2) Tool executors (what runs on YOUR server against Supabase)
// ---------------------------------------------------------------------
async function rpc(fn, args) {
  const { data, error } = await getSupabase().rpc(fn, args);
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data;
}

const cleanDate = (d) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null);
const cleanNum = (n) => (Number.isFinite(Number(n)) && n !== null && n !== '' ? Number(n) : null);

async function searchCatalog({ budget, category, keywords, event_date }, limit = 6) {
  return rpc('search_vendors_for_ai', {
    p_max_budget: cleanNum(budget),
    p_category: category || null,
    p_keywords: keywords || null,
    p_event_date: cleanDate(event_date),
    p_limit: limit,
  });
}

async function buildBundle({ total_budget, needed_categories, event_date }) {
  const budget = Number(total_budget);
  if (!Number.isFinite(budget) || budget <= 0) throw new Error('total_budget must be a positive number');
  const cats = (Array.isArray(needed_categories) ? needed_categories : []).slice(0, 5);

  const options = [];
  for (const category of cats) {
    const rows = await searchCatalog({ budget, category, event_date }, 5);
    options.push({ category, rows });
  }
  const missing = options.filter((o) => !o.rows.length).map((o) => o.category);
  const usable = options.filter((o) => o.rows.length);

  // Try every combination (max 5 x 5 x 5 x 5 x 5) and keep the best one under budget:
  // highest total rating first, then lowest total cost.
  let best = null;
  const walk = (i, picked, cost, score) => {
    if (cost > budget) return;
    if (i === usable.length) {
      if (!best || score > best.score || (score === best.score && cost < best.cost)) {
        best = { picked: [...picked], cost, score };
      }
      return;
    }
    for (const row of usable[i].rows) {
      walk(
        i + 1,
        [...picked, { requested_category: usable[i].category, ...row }],
        cost + Number(row.package_price),
        score + Number(row.avg_rating || 0)
      );
    }
  };
  if (usable.length) walk(0, [], 0, 0);

  return {
    total_budget: budget,
    total_cost: best ? best.cost : null,
    bundle: best ? best.picked : [],
    categories_without_match: missing,
    note: best ? undefined : 'No combination of verified packages fits within this budget.',
  };
}

export async function executeTool(name, args = {}) {
  switch (name) {
    case 'search_website_catalog':
      return searchCatalog(args, 6);
    case 'get_vendor_full_profile':
      return rpc('get_vendor_full_profile', { p_vendor_id: String(args.vendor_id ?? '') });
    case 'build_party_bundle':
      return buildBundle(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ---------------------------------------------------------------------
// 3) Collect real vendor cards from tool results (what the chat UI shows)
//    Cards always come from the database, never from the model's text.
// ---------------------------------------------------------------------
function normalizeCard(c) {
  return {
    vendor_id: String(c.vendor_id),
    package_id: c.package_id == null ? null : String(c.package_id),
    business_name: c.business_name ?? '',
    category: c.category ?? '',
    package_name: c.package_name ?? '',
    package_price: c.package_price == null ? null : (Number(c.package_price) || 0),
    inclusions: c.inclusions ?? [],
    portfolio_image_urls: Array.isArray(c.portfolio_image_urls) ? c.portfolio_image_urls.slice(0, 3) : [],
    avg_rating: Number(c.avg_rating) || 0,
    review_count: Number(c.review_count) || 0,
  };
}

export function collectCards(toolName, result, store) {
  const add = (c) => {
    if (c?.vendor_id == null) return;
    store.set(`${c.vendor_id}-${c.package_id || 'custom'}`, normalizeCard(c));
  };

  if (toolName === 'search_website_catalog' && Array.isArray(result)) {
    result.forEach(add);
  } else if (toolName === 'build_party_bundle' && Array.isArray(result?.bundle)) {
    result.bundle.forEach(add);
  } else if (toolName === 'get_vendor_full_profile' && result?.profile) {
    const imgs = (result.portfolio || []).map((p) => p.image_url).filter(Boolean).slice(0, 3);
    const ratings = (result.reviews || []).map((r) => Number(r.rating)).filter((n) => Number.isFinite(n));
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    (result.packages || []).forEach((pk) =>
      add({
        vendor_id: result.profile.id,
        package_id: pk.id,
        business_name: result.profile.business_name,
        category: result.profile.category,
        package_name: pk.name,
        package_price: pk.price,
        inclusions: pk.inclusions,
        portfolio_image_urls: imgs,
        avg_rating: Math.round(avg * 10) / 10,
        review_count: ratings.length,
      })
    );
  }
}

// ---------------------------------------------------------------------
// 4) Auto-tag a portfolio photo with Gemini vision
// ---------------------------------------------------------------------
const TAG_PROMPT = `You are cataloguing event-vendor portfolio photos for an Indian event marketplace.
Look at the photo and return JSON only:
- event_type: the single best fit, e.g. "Wedding", "Birthday", "Corporate Event", "College Fest", "Engagement", "Baby Shower", "Anniversary", "Festival", "Other"
- ai_tags: 6 to 12 short lowercase tags describing what is visible (decor style, flowers, colours, lighting, stage, food, setting, indoor/outdoor, day/night)
- ai_summary: ONE sentence on the setup quality and approximate scale (small/medium/large).
Describe only what you can actually see.`;

export async function tagPortfolioImage(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Could not download image (${res.status})`);
  const mimeType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
  const data = Buffer.from(await res.arrayBuffer()).toString('base64');

  const response = await generate(getAI(), {
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data } }, { text: TAG_PROMPT }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          event_type: { type: Type.STRING },
          ai_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          ai_summary: { type: Type.STRING },
        },
        required: ['event_type', 'ai_tags', 'ai_summary'],
      },
      temperature: 0.2,
    },
  });

  const out = JSON.parse(response.text);
  return {
    event_type: String(out.event_type || 'Other').trim(),
    ai_tags: (out.ai_tags || []).map((t) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 12),
    ai_summary: String(out.ai_summary || '').trim(),
  };
}

// Tags one vendor_portfolio row and saves the result. Skips rows already tagged.
export async function tagPortfolioRow(portfolioId, { force = false } = {}) {
  const sb = getSupabase();
  const { data: row, error } = await sb
    .from('vendor_portfolio')
    .select('id, image_url, event_type, ai_tagged_at')
    .eq('id', portfolioId)
    .single();
  if (error || !row) throw new Error(error?.message || 'Portfolio row not found');
  if (!row.image_url) throw new Error('This row has no image_url');
  if (row.ai_tagged_at && !force) return { skipped: true };

  const tags = await tagPortfolioImage(row.image_url);
  const patch = {
    ai_tags: tags.ai_tags,
    ai_summary: tags.ai_summary,
    ai_tagged_at: new Date().toISOString(),
  };
  if (!row.event_type) patch.event_type = tags.event_type; // never overwrite what the vendor typed

  const { error: upErr } = await sb.from('vendor_portfolio').update(patch).eq('id', portfolioId);
  if (upErr) throw new Error(upErr.message);
  return { skipped: false, ...patch };
}
