/**
 * Vendor availability helper.
 *
 * HOW IT WORKS
 * 1. Real data (use this once the vendor dashboard saves it). Add ONE of these to a vendor:
 *      availableDates?: string[]   // "YYYY-MM-DD" days the vendor is free (allow-list)
 *      blockedDates?:  string[]    // "YYYY-MM-DD" days the vendor is busy (block-list)
 * 2. A vendor with neither field is treated as free on every day.
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

export function isVendorFree(v: VendorLike, iso: string): boolean {
  if (v.availableDates) return v.availableDates.includes(iso);
  if (v.blockedDates) return !v.blockedDates.includes(iso);
  return true; // no availability data saved means the vendor has not blocked any day
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