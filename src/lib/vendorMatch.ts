import { SERVICES } from "./weddingTaxonomy";

/** Normalised vendor shape used by the wedding flow. Maps both static and Supabase rows. */
export type FlowVendor = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  priceFrom: number | null;
  packages: string[];
  availability: string;
  image: string;
  serviceIds: number[];
  raw: any;
};

const num = (x: unknown): number | null => {
  if (typeof x === "number" && !Number.isNaN(x)) return x;
  if (typeof x === "string") {
    const n = parseInt(x.replace(/[^\d]/g, ""), 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
};

export function normalizeVendor(r: any): FlowVendor {
  const packages = r.packages ?? r.package_names ?? r.plans ?? [];
  return {
    id: String(r.id ?? r.slug ?? r.name),
    name: r.name ?? r.business_name ?? r.title ?? "Vendor",
    category: r.category ?? r.category_name ?? r.type ?? "",
    city: r.city ?? r.location ?? "",
    rating: Number(r.rating ?? r.avg_rating ?? 0) || 0,
    priceFrom: num(r.price_from ?? r.priceFrom ?? r.starting_price ?? r.price ?? r.price_min),
    packages: Array.isArray(packages)
      ? packages.map((p: any) => (typeof p === "string" ? p : p?.name ?? p?.title ?? "")).filter(Boolean)
      : [],
    availability: r.availability ?? (r.available === false ? "Unavailable" : "Available"),
    image: r.image ?? r.image_url ?? r.cover_image ?? r.avatar ?? "",
    serviceIds: Array.isArray(r.service_ids) ? r.service_ids.map(Number) : [],
    raw: r,
  };
}

const clean = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

function kwHit(text: string, kw: string): boolean {
  if (kw.includes(" ")) return text.includes(kw);
  return text.split(" ").some((w) => w === kw || (kw.length > 3 && w.startsWith(kw)));
}

/** service ids a vendor serves: explicit service_ids first, keyword fallback on category (+ tags) */
export function vendorServiceIds(v: FlowVendor): number[] {
  if (v.serviceIds.length) return v.serviceIds;
  const tags = Array.isArray(v.raw?.tags) ? v.raw.tags.join(" ") : "";
  const text = clean(`${v.category} ${tags}`);
  if (!text) return [];
  return SERVICES.filter((s) => s.keywords.some((k) => kwHit(text, k))).map((s) => s.id);
}

export function vendorMatchesServices(v: FlowVendor, serviceIds: number[]): boolean {
  if (!serviceIds.length) return true;
  const own = vendorServiceIds(v);
  return serviceIds.some((id) => own.includes(id));
}

/** Booking handoff. Adjust BOOKING_PATH to your existing route. */
export const BOOKING_PATH = (vendorId: string) => `/book/${vendorId}`;

export function bookingUrl(
  vendorId: string,
  meta: { format?: string; variant?: string; functions: number[]; services: number[] },
) {
  const q = new URLSearchParams();
  if (meta.format) q.set("format", meta.format);
  if (meta.variant) q.set("variant", meta.variant);
  if (meta.functions.length) q.set("functions", meta.functions.join(","));
  if (meta.services.length) q.set("service", meta.services.join(","));
  return `${BOOKING_PATH(vendorId)}?${q.toString()}`;
}
