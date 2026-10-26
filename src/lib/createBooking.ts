import { supabase } from "@/integrations/supabase/client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface NewBooking {
  bookingCode: string;
  vendorId: string;      // only live vendors (uuid) can receive bookings; mock vendors are skipped
  eventType: string;
  dates: string[];       // "YYYY-MM-DD"
  city: string;
  guests: string;
  requirements: string;
  estimate: number;
  token: number;
}

/** Call this right after the UPI token payment succeeds. Never throws. */
export async function saveBooking(b: NewBooking): Promise<{ saved: boolean; error?: string }> {
  if (!UUID.test(b.vendorId)) return { saved: false };
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) return { saved: false, error: "Not signed in" };

  const { error } = await supabase.from("bookings").insert({
    booking_code: b.bookingCode,
    customer_id: user.id,
    vendor_id: b.vendorId,
    event_type: b.eventType,
    event_dates: b.dates,
    city: b.city,
    guests: b.guests,
    requirements: b.requirements,
    estimated_total: b.estimate,
    token_amount: b.token,
    payment_status: "token_paid",
    status: "pending",
  });
  return error ? { saved: false, error: error.message } : { saved: true };
}