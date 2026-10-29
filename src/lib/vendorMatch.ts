import type { LiveVendor as Vendor } from "@/lib/vendorOptions";
import { estimate, guestsFromLabel as guestsFromHeroLabel } from "@/lib/guestPricing";

export type HeroFilters = { query?: string; city?: string; event?: string; guests?: string; budget?: string };

const norm = (s: string) => s.replace(/[\s–—-]/g, "").toLowerCase();

const UNIT = (u?: string) => (/cr/i.test(u ?? "") ? 1e7 : /^(l|lakh|lac)$/i.test(u ?? "") ? 1e5 : /^k$/i.test(u ?? "") ? 1e3 : 1);

// Reads labels such as "Under ₹1 Lakh", "₹1 – 5 Lakh", "₹50 Lakh – 1 Crore", and "₹1 Crore+".
export function parseBudget(label?: string): [number, number] | null {
  if (!label) return null;
  const s = label.replace(/,/g, "");
  const re = /(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|l|k)?/gi;
  const nums: { v: number; u?: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) nums.push({ v: Number(m[1]), u: m[2] });
  if (!nums.length) return null;
  const lastUnit = [...nums].reverse().find((n) => n.u)?.u;
  const val = (n: { v: number; u?: string }) => n.v * UNIT(n.u ?? lastUnit);
  const first = val(nums[0]);
  if (nums.length >= 2) return [first, val(nums[1])];
  if (/under|below|up\s?to/i.test(s)) return [0, first];
  if (/above|over|more|\+/.test(s)) return [first, Infinity];
  return [first, first];
}

// Target point: midpoint of a range, cap for "Under X", floor for "X+".
const budgetTarget = ([lo, hi]: [number, number]) =>
  hi === Infinity ? lo : lo === 0 ? hi : (lo + hi) / 2;

export function sortByBudget<T extends Vendor>(list: T[], label?: string, guests = 0): T[] {
  const range = parseBudget(label);
  if (!range) return list;
  const target = budgetTarget(range);
  const gap = (v: T) => {
    const e = estimate(v, guests);
    if (!e.min) return Infinity;
    return Math.abs((e.min + e.max) / 2 - target);
  };
  return [...list].sort((a, b) => gap(a) - gap(b));
}

const GUESTS: Record<string, [number, number]> = {
  [norm("Under 50")]: [0, 49], [norm("50 – 100")]: [50, 100], [norm("100 – 200")]: [100, 200],
  [norm("200 – 300")]: [200, 300], [norm("300 – 500")]: [300, 500],
  [norm("500 – 1000")]: [500, 1000], [norm("1000+")]: [1000, Infinity],
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
const budgetOn = (b?: string) => !!b && !!parseBudget(b);

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
    const [bMin, bMax] = parseBudget(f.budget)!;
    const e = estimate(v, guestsFromHeroLabel(f.guests));
    if (e.min !== 0 && !(e.min <= bMax && e.max >= bMin)) return false;
  }
  return true;
}
