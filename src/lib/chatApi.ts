import { supabase } from "./chatClient";

export interface VendorRef {
  /** The vendor's AUTH user id (auth.users.id), not a vendors-table id. */
  userId: string;
  name: string;
  avatar?: string | null;
  service?: string | null;
}

/** Finds the existing chat with this vendor, or creates it. Returns the conversation id. */
export async function getOrCreateConversation(
  me: { id: string; name: string },
  vendor: VendorRef
): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", me.id)
    .eq("vendor_id", vendor.userId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      customer_id: me.id,
      vendor_id: vendor.userId,
      customer_name: me.name,
      vendor_name: vendor.name,
      vendor_avatar: vendor.avatar ?? null,
      vendor_service: vendor.service ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}
