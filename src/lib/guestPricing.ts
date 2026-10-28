import type { LiveVendor as Vendor } from "@/lib/vendorOptions";

export const isPerGuest = (v: Vendor) => {
  const raw = (v as any).raw ?? {};
  const unit = String(raw.price_unit ?? raw.price_type ?? raw.pricing_unit ?? v.price ?? "");
  return /plate|person|head|guest/i.test(unit);
};

export const guestLimits = (v: Vendor) => {
  const raw = (v as any).raw ?? {};
  const min = Number(raw.min_guests) || 0;
  const max = Number(raw.max_guests) || 0;
  return min || max ? { min, max } : null;
};

// "Under 50" -> 50, "50 – 100" -> 100, "1000+" -> 1000, "Any size" -> 0
export const guestsFromLabel = (label?: string) => {
  const nums = (label ?? "").replace(/,/g, "").match(/\d+/g)?.map(Number) ?? [];
  if (!nums.length) return 0;
  return /under|\+|above/i.test(label!) ? nums[0] : nums[nums.length - 1];
};

export const capacityOk = (v: Vendor, guests: number) => {
  const l = guestLimits(v);
  if (!guests || !l) return true;
  return (!l.max || guests <= l.max) && (!l.min || guests >= l.min);
};

export const estimate = (v: Vendor, guests: number) => {
  const min = v.priceMin ?? 0;
  const max = v.priceMax && v.priceMax >= min ? v.priceMax : min;
  if (!guests || !isPerGuest(v)) return { min, max, scaled: false };
  return { min: min * guests, max: max * guests, scaled: true };
};

export const inr = (n: number) =>
  n >= 1e7 ? `₹${+(n / 1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹${+(n / 1e5).toFixed(2)}L` : `₹${Math.round(n).toLocaleString("en-IN")}`;