import type { LiveVendor as Vendor } from "@/lib/vendorOptions";

export type HeroFilters = { query?: string; city?: string; event?: string; guests?: string; budget?: string };

const norm = (s: string) => s.replace(/[\s–—-]/g, "").toLowerCase();
const L = 100_000;

const GUESTS: Record<string, [number, number]> = {
  [norm("Under 50")]: [0, 49], [norm("50 – 100")]: [50, 100], [norm("100 – 200")]: [100, 200],
  [norm("200 – 300")]: [200, 300], [norm("300 – 500")]: [300, 500],
  [norm("500 – 1000")]: [500, 1000], [norm("1000+")]: [1000, Infinity],
};
const BUDGETS: Record<string, [number, number]> = {
  [norm("Under ₹1 Lakh")]: [0, 1 * L], [norm("₹1 – 5 Lakh")]: [1 * L, 5 * L],
  [norm("₹5 – 10 Lakh")]: [5 * L, 10 * L], [norm("₹10 – 25 Lakh")]: [10 * L, 25 * L],
  [norm("₹25 – 50 Lakh")]: [25 * L, 50 * L], [norm("Above ₹50 Lakh")]: [50 * L, Infinity],
};
const EVENT_RX: Record<string, RegExp> = {
  wedding: /wedding|bridal|mehendi|decor|flor|venue|photograph/,
  engagement: /wedding|bridal|event|photograph/,
  haldi: /wedding|bridal|decor|flor|makeup/,
  mehendi: /mehendi|bridal|wedding/,
  anniversary: /wedding|event|photograph|decor/,
  babyshower: /event|decor|cater|photograph/,
  fashionshow: /makeup|photograph|lighting|production|event/,
  exhibition: /corporate|event|production|lighting/,
  collegefest: /college|fest|concert|dj|band|lighting|production|entertain|event/,
  religious: /religious|puja|pooja|catering|decor|flor|event|priest/,
};

const isSet = (v?: string, placeholder?: RegExp) => !!v && !placeholder?.test(v);
const cityOn = (c?: string) => isSet(c, /^(select city|all cities)$/i);
const eventOn = (e?: string) => isSet(e, /^(event type|all events)$/i);
const guestsOn = (g?: string) => !!g && !!GUESTS[norm(g)];
const budgetOn = (b?: string) => !!b && !!BUDGETS[norm(b)];

export const hasActiveFilters = (f: HeroFilters) =>
  !!f.query?.trim() || cityOn(f.city) || eventOn(f.event) || guestsOn(f.guests) || budgetOn(f.budget);

export function vendorMatches(v: Vendor, f: HeroFilters): boolean {
  const raw = (v as any).raw ?? {};
  const text = `${v.category} ${v.description} ${v.tags.join(" ")}`.toLowerCase();

  const q = f.query?.trim().toLowerCase();
  if (q && ![v.name, v.category, v.location, v.description, ...v.tags].join(" ").toLowerCase().includes(q)) return false;

  if (cityOn(f.city)) {
    const k = f.city!.toLowerCase();
    if (!v.location.toLowerCase().includes(k) && !(v.cities ?? []).some((c: string) => c.toLowerCase().includes(k))) return false;
  }
  if (eventOn(f.event)) {
    const k = f.event!.toLowerCase();
    const rx = EVENT_RX[norm(f.event!)];
    if (!text.includes(k) && !(rx && rx.test(text))) return false;
  }
  if (guestsOn(f.guests)) {
    const [gMin, gMax] = GUESTS[norm(f.guests!)];
    const lo = Number(raw.guests_min ?? raw.min_guests ?? raw.capacity_min) || 0;
    const hi = Number(raw.guests_max ?? raw.max_guests ?? raw.capacity_max ?? raw.capacity) || Infinity;
    const hasRange = lo > 0 || hi !== Infinity;
    if (hasRange && !(lo <= gMax && hi >= gMin)) return false;
  }
  if (budgetOn(f.budget)) {
    const [bMin, bMax] = BUDGETS[norm(f.budget!)];
    const vMin = v.priceMin ?? 0;
    const vMax = v.priceMax && v.priceMax >= vMin ? v.priceMax : vMin;
    if (vMin !== 0 && !(vMin <= bMax && vMax >= bMin)) return false;
  }
  return true;
}