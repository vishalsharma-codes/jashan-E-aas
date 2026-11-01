import raw from "./taxonomy.json";

export type Category = { id: string; name: string; leadTime: string; scope: string; subCategories: string[]; subEvents: string[] };
export type Service = { id: string; name: string; options: string[]; categories: string[] };

export const CATEGORIES = raw.categories as Category[];
export const SERVICES = raw.services as Service[]; // already sorted: most widely used first

const SHORT_OVERRIDE: Record<string, string> = {
  "CAT-11": "Fashion & Lifestyle", "CAT-12": "Virtual & Hybrid", "CAT-15": "Film & Media",
  "CAT-16": "Technology", "CAT-17": "Health & Wellness", "CAT-03": "Social Parties",
};
export const shortCategory = (c: Category) =>
  SHORT_OVERRIDE[c.id] ?? c.name.replace(/ (&|and) .*$/, "").replace(/ Events?$/, "").trim();

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const getServiceByName = (name: string) => SERVICES.find((s) => s.name === name);

/** Everyday words vendors type -> the word used in the taxonomy. */
const SYN: Record<string, string> = {
  mehndi: "mehandi", mehendi: "mehandi", henna: "mehandi", priest: "pandit", maharaj: "pandit", purohit: "pandit",
  band: "musicians", singer: "entertainment", singers: "entertainment", dancer: "entertainment", dance: "choreographers",
  flower: "florists", flowers: "florists", decor: "decorators", decoration: "decorators", decorator: "decorators",
  food: "catering", caterer: "catering", cook: "catering", halwai: "catering", photo: "photographers", photographer: "photographers",
  video: "videographers", camera: "photographers", light: "lighting", lights: "lighting", mc: "emcee", host: "emcee",
  makeup: "makeup", mua: "makeup", car: "transportation", cab: "transportation", bus: "transportation", guard: "security",
  bouncer: "security", planner: "planners", manager: "planners", invite: "invitation", card: "invitation", jewellery: "jewelry",
  lehenga: "wear", dress: "wear", clothes: "wear", cleaning: "housekeeping", bar: "bartending", tent: "tent", stage: "stage",
};
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map((w) => SYN[w] ?? w);
const haystack = (s: Service) => (s.name + " " + s.options.join(" ")).toLowerCase();

/** Type-ahead. Every typed word must appear somewhere in the service name or its options. */
export function searchServices(q: string, limit = 10): Service[] {
  const w = words(q);
  if (!w.length) return SERVICES.slice(0, limit);
  return SERVICES.filter((s) => { const h = haystack(s); return w.every((x) => h.includes(x)); }).slice(0, limit);
}

function lev(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Typo-tolerant "did you mean": "photografer" -> Photographers & Videographers, "caterng" -> Catering & Food. */
export function suggestServices(q: string, limit = 6): Service[] {
  const typed = words(q).filter((w) => w.length > 2);
  if (!typed.length) return [];
  const scored = SERVICES.map((s) => {
    const hw = [...new Set(haystack(s).split(/[^a-z0-9]+/).filter((w) => w.length > 1))];
    let total = 0;
    for (const t of typed) {
      const allowed = Math.max(1, Math.floor(t.length / 3));
      const best = Math.min(...hw.map((h) => Math.min(lev(t, h), lev(t, h.slice(0, t.length)) + 1)));
      if (best > allowed) return { s, score: 0 };
      total += 1 - best / (t.length + 1);
    }
    return { s, score: total / typed.length + Math.min(s.categories.length, 10) / 100 };
  });
  return scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.s);
}

/** Auto-select: every category that lists any of the chosen services. */
export function categoriesForServices(names: string[]): string[] {
  const hit = new Set<string>();
  names.forEach((n) => getServiceByName(n)?.categories.forEach((c) => hit.add(c)));
  return CATEGORIES.map((c) => c.id).filter((id) => hit.has(id));
}

export const subEventKey = (catId: string, event: string) => `${catId}:${event}`;
export const allSubEvents = (catIds: string[]) =>
  catIds.flatMap((id) => (getCategory(id)?.subEvents ?? []).map((e) => subEventKey(id, e)));

/** Specialties come from the brackets in the blueprint, e.g. (Candid, Drone, Pre-wedding, Cinematic). */
export const optionsFor = (names: string[]) => [...new Set(names.flatMap((n) => getServiceByName(n)?.options ?? []))];

/** Fallback suggestions for services without brackets: the formats of the first category. */
export const formatsFor = (catIds: string[]) =>
  (getCategory(catIds[0])?.subCategories ?? []).map((s) => s.replace(/\s*\(.*\)/, "")).slice(0, 6);

export function specialityLine(names: string[], catIds: string[]): string {
  if (!names[0]) return "";
  const cats = catIds.map(getCategory).filter(Boolean).slice(0, 2).map((c) => shortCategory(c!).toLowerCase());
  if (!cats.length) return names[0];
  return `${names[0]} for ${cats.join(" & ")}${catIds.length > 2 ? " & more" : ""}`;
}

/** Keeps the existing event_types column (the 24 legacy chips used by search and filters) filled. */
const LEGACY: Record<string, string[]> = {
  "CAT-01": ["Wedding"], "CAT-02": ["Corporate", "Conference", "Product Launch"],
  "CAT-03": ["Birthday", "Baby Shower", "Anniversary", "Social Party"], "CAT-04": ["College Fest"],
  "CAT-05": ["Concert"], "CAT-06": ["Religious / Puja"], "CAT-07": ["Exhibition"], "CAT-08": ["Sports Event"],
  "CAT-10": ["Charity / NGO"], "CAT-11": ["Fashion Show"], "CAT-12": ["Virtual / Hybrid"],
  "CAT-13": ["Festival / Mela"], "CAT-16": ["Tech Event"], "CAT-17": ["Wellness Retreat"],
};
const WEDDING_PARTS: [RegExp, string][] = [[/engagement/i, "Engagement"], [/mehandi|henna/i, "Mehendi"], [/sangeet/i, "Sangeet"],
  [/haldi/i, "Haldi"], [/reception/i, "Reception"], [/anniversary/i, "Anniversary"]];
export function legacyEventTypes(catIds: string[], subEvents: string[]): string[] {
  const out = new Set<string>();
  catIds.forEach((id) => (LEGACY[id] ?? []).forEach((e) => out.add(e)));
  if (catIds.includes("CAT-01"))
    subEvents.filter((k) => k.startsWith("CAT-01:")).forEach((k) => WEDDING_PARTS.forEach(([rx, e]) => rx.test(k) && out.add(e)));
  return [...out];
}

// You can add more words in the SYN list near the top of the search code in taxonomy.ts. Each line is typed word: "word used in the taxonomy".