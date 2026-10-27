
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toLiveVendor, type LiveVendor } from "@/lib/vendorOptions";

export interface LiveVendorsState {
  /** Approved vendors from Supabase. Empty until vendors register and get approved. */
  vendors: LiveVendor[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/* ───────── Homepage section helpers ───────── */

const norm = (s: unknown) =>
  String(s).trim().toLowerCase().replace(/[\s-]+/g, "_");

const sectionsOf = (v: LiveVendor): string[] => {
  const val = (v as any).raw?.home_sections;
  return Array.isArray(val) ? val.map(norm) : [];
};

const rankOf = (v: LiveVendor) => {
  const n = Number((v as any).raw?.home_rank);
  return Number.isFinite(n) ? n : 999;
};

/**
 * Approved vendors from Supabase (vendor_profiles + their portfolio and blocked dates).
 * This is the only source of vendor data for customer-facing pages.
 */
export function useLiveVendors(): LiveVendorsState {
  const [vendors, setVendors] = useState<LiveVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    const { data: rows, error: e1 } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("status", "approved");

    if (e1) {
      setError(e1.message);
      setVendors([]);
      setLoading(false);
      return;
    }

    if (!rows?.length) {
      setVendors([]);
      setLoading(false);
      return;
    }

    const ids = rows.map((r: any) => r.user_id);

    const [pf, bd] = await Promise.all([
      supabase
        .from("vendor_portfolio")
        .select("id, vendor_id, image_url, title, event_type")
        .in("vendor_id", ids)
        .order("created_at", { ascending: false }),

      supabase
        .from("vendor_blocked_dates")
        .select("vendor_id, day")
        .in("vendor_id", ids),
    ]);

    setVendors(
      rows.map((r: any) =>
        toLiveVendor(
          r,
          (pf.data ?? []).filter((p: any) => p.vendor_id === r.user_id),
          (bd.data ?? [])
            .filter((b: any) => b.vendor_id === r.user_id)
            .map((b: any) => b.day),
        ),
      ),
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    let off = false;

    void load();

    // Refresh when a vendor profile changes.
    const ch = supabase
      .channel(`public-vendor-profiles-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_profiles",
        },
        () => {
          if (!off) void load();
        },
      )
      .subscribe();

    return () => {
      off = true;
      void supabase.removeChannel(ch);
    };
  }, [load]);

  return { vendors, loading, error, reload: load };
}

/* ───────── Vendor selectors ───────── */

export const topRatedOf = (list: LiveVendor[], n = 8) =>
  [...list]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, n);

export const featuredOf = (list: LiveVendor[], n = 6) =>
  [...list]
    .sort(
      (a, b) =>
        Number(b.isVerified) - Number(a.isVerified) ||
        b.rating - a.rating,
    )
    .slice(0, n);

export const byCategoryId = (list: LiveVendor[], categoryId: string) =>
  list.filter((v) => v.categoryId === categoryId);

/**
 * Only vendors assigned to a homepage section in Supabase,
 * ordered by home_rank, then rating.
 */
export const homeSectionOf = (
  list: LiveVendor[],
  key: string,
  n = 20,
) =>
  list
    .filter((v) => sectionsOf(v).includes(norm(key)))
    .sort((a, b) => rankOf(a) - rankOf(b) || b.rating - a.rating)
    .slice(0, n);
