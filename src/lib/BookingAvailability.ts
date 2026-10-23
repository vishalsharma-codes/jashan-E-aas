/**
 * Vendor availability helper.
 *
 * HOW IT WORKS
 * 1. Real data (use this once the vendor dashboard saves it). Add ONE of these to a vendor:
 *      availableDates?: string[]   // "YYYY-MM-DD" days the vendor is free (allow-list)
 *      blockedDates?:  string[]    // "YYYY-MM-DD" days the vendor is busy (block-list)
 * 2. Until a vendor has either field, a stable DEMO pattern is used (~75% of days free)
 *    so you can see and test the whole flow today.
 *
 * LATER: in the vendor dashboard, let the vendor pick dates on the same calendar and save
 * them to that vendor's row (e.g. a `vendor_availability` table). Load them into the vendor
 * object and this file needs no other change.
 */
export type AvailabilityStatus = "full" | "partial" | "none";

export interface VendorLike {
  id: string;
  availableDates?: string[];
  blockedDates?: string[];
}

// small stable hash so the demo pattern never changes between renders
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export function isVendorFree(v: VendorLike, iso: string): boolean {
  if (v.availableDates) return v.availableDates.includes(iso);
  if (v.blockedDates) return !v.blockedDates.includes(iso);
  return hash(`${v.id}|${iso}`) % 100 < 75; // demo data
}

export function checkVendorAvailability(v: VendorLike, dates: string[]) {
  const freeDays = dates.filter((d) => isVendorFree(v, d));
  const busyDays = dates.filter((d) => !isVendorFree(v, d));
  const status: AvailabilityStatus =
    dates.length === 0 ? "none"
    : busyDays.length === 0 ? "full"
    : freeDays.length === 0 ? "none"
    : "partial";
  return { freeDays, busyDays, status };
}