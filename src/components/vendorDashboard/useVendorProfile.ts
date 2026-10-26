import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EMPTY_PRIVATE, emptyProfile, type VendorPrivate, type VendorProfileRow } from "@/lib/vendorOptions";

export type SaveFn = (
  patch: Partial<VendorProfileRow>,
  privPatch?: Partial<VendorPrivate>,
) => Promise<{ error: { message: string } | null }>;

export function useVendorProfile(userId?: string, defaultName = "") {
  const [profile, setProfile] = useState<VendorProfileRow | null>(null);
  const [priv, setPriv] = useState<VendorPrivate>(EMPTY_PRIVATE);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const [p, pr] = await Promise.all([
      supabase.from("vendor_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("vendor_private").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    setProfile(p.data ? { ...emptyProfile(userId), ...p.data } : null);
    setPriv({ ...EMPTY_PRIVATE, ...(pr.data ?? {}) });
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const save: SaveFn = async (patch, privPatch) => {
    if (!userId) return { error: { message: "You are signed out. Sign in again." } };
    const next = { ...(profile ?? emptyProfile(userId, defaultName)), ...patch, user_id: userId };
    // rating and review count are controlled by the server
    const { rating: _r, reviews_count: _c, ...payload } = next as any;
    const r1 = await supabase.from("vendor_profiles").upsert(payload, { onConflict: "user_id" }).select().single();
    if (r1.error) return { error: r1.error };
    setProfile({ ...next, ...r1.data });

    if (privPatch) {
      const merged = { ...priv, ...privPatch, user_id: userId };
      const r2 = await supabase.from("vendor_private").upsert(merged, { onConflict: "user_id" });
      if (r2.error) return { error: r2.error };
      setPriv({ ...priv, ...privPatch });
    }
    return { error: null };
  };

  return { profile, priv, loading, save, reload: load };
}