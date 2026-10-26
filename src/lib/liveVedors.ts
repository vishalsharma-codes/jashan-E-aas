import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toLiveVendor, type LiveVendor } from "@/lib/vendorOptions";

/** Approved vendors from Supabase, shaped like the mock vendors in vendorData.ts. */
export function useLiveVendors(): LiveVendor[] {
  const [live, setLive] = useState<LiveVendor[]>([]);

  useEffect(() => {
    let off = false;
    (async () => {
      const { data: rows } = await supabase.from("vendor_profiles").select("*").eq("status", "approved");
      if (off || !rows?.length) return;
      const ids = rows.map((r: any) => r.user_id);
      const [pf, bd] = await Promise.all([
        supabase.from("vendor_portfolio").select("id, vendor_id, image_url, title, event_type").in("vendor_id", ids).order("created_at", { ascending: false }),
        supabase.from("vendor_blocked_dates").select("vendor_id, day").in("vendor_id", ids),
      ]);
      if (off) return;
      setLive(
        rows.map((r: any) =>
          toLiveVendor(
            r,
            (pf.data ?? []).filter((p: any) => p.vendor_id === r.user_id),
            (bd.data ?? []).filter((b: any) => b.vendor_id === r.user_id).map((b: any) => b.day),
          ),
        ),
      );
    })();
    return () => { off = true; };
  }, []);

  return live;
}