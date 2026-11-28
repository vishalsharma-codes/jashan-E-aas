import { orderedServices } from "./categoryTaxonomy";

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const norm = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();

export interface ParsedLabel { id: string; title: string; detail: string[]; raw: string }

export function parseLabel(raw: string): ParsedLabel {
  const m = raw.match(/^(.*?)\s*\((.*)\)\s*$/);
  const title = (m ? m[1] : raw).trim();
  const detail = m ? m[2].split(",").map((s) => s.trim()).filter(Boolean) : [];
  return { id: slugify(title), title, detail, raw };
}

export const parseAll = (labels: string[]) => labels.map(parseLabel);

export const EVENT_SERVICE_HINTS: Record<string, Record<string, string[]>> = {
  "CAT-01": {
    "engagement-ceremonies": ["planner", "venue", "decor", "cater", "photograph", "makeup", "jewel", "invitation", "cake", "anchor", "stage", "favors"],
    "mehandi-and-henna-function": ["mehandi", "henna", "decor", "cater", "photograph", "entertainment", "dj", "tent", "furniture"],
    "sangeet-and-musical-night": ["choreograph", "dj", "live bands", "sound", "anchor", "entertainment", "stage", "decor", "cater", "bartender", "photograph"],
    "haldi-ceremony": ["decor", "photograph", "cater", "pandit", "tent", "furniture", "favors"],
    "bachelor-bachelorette-parties": ["venue", "dj", "bartender", "cater", "photograph", "entertainment", "transportation", "photo booth", "decor"],
    "bridal-shower": ["decor", "cater", "cake", "photograph", "favors", "entertainment", "venue"],
    "wedding-reception": ["planner", "venue", "decor", "cater", "photograph", "dj", "live bands", "sound", "anchor", "stage", "cake", "bartender", "valet", "fireworks", "photo booth", "furniture", "tent"],
    "cocktail-party": ["venue", "bartender", "dj", "live bands", "sound", "decor", "cater", "photograph", "furniture"],
    "tilak-shagun-ceremony": ["pandit", "decor", "cater", "photograph", "astrolog", "favors", "trousseau"],
    "main-wedding-ceremony": ["pandit", "astrolog", "planner", "venue", "decor", "cater", "photograph", "bridal", "groom", "jewel", "makeup", "mehandi", "transportation", "tent", "stage", "furniture", "sound", "anchor", "drone", "fireworks", "stationery"],
    "bidaai-ceremony": ["transportation", "photograph", "decor", "drone"],
    "post-wedding-rituals": ["pandit", "decor", "cater", "photograph", "astrolog", "trousseau"],
    "anniversary-celebrations": ["venue", "decor", "cater", "cake", "photograph", "dj", "anchor"],
    "vow-renewal-ceremonies": ["pandit", "venue", "decor", "photograph", "makeup", "cake", "stationery"],
  },
};

export function splitServices(categoryId: string, eventIds: string[]) {
  const all = orderedServices(categoryId);
  const hints = EVENT_SERVICE_HINTS[categoryId];
  if (!hints || eventIds.length === 0) return { suggested: all, others: [] as string[] };
  const keys = new Set<string>();
  for (const id of eventIds) (hints[id] ?? []).forEach((k) => keys.add(norm(k)));
  if (keys.size === 0) return { suggested: all, others: [] as string[] };
  const suggested = all.filter((s) => [...keys].some((k) => norm(s).includes(k)));
  return { suggested, others: all.filter((s) => !suggested.includes(s)) };
}
