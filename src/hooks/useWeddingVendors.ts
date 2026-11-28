import { useMemo } from "react";
import { useLiveVendors } from "@/lib/liveVedors";
import { normalizeVendor, type FlowVendor } from "@/lib/vendorMatch";

/** Static vendors + live Supabase vendors, merged by id (live wins), normalised for the flow. */
export function useWeddingVendors(): { vendors: FlowVendor[]; loading: boolean } {
  const { vendors: liveVendors, loading } = useLiveVendors();
  const vendors = useMemo(() => liveVendors.map((live) => {
    const row = live.raw as any;
    return normalizeVendor({
      ...row,
      id: row?.user_id ?? live.id,
      name: row?.business_name ?? live.name,
      category: row?.category ?? live.category,
      city: row?.city ?? row?.home_city ?? live.location,
      rating: row?.rating ?? live.rating,
      price_from: row?.price_from ?? row?.starting_price ?? row?.price ?? row?.price_min ?? live.priceMin,
      packages: row?.packages ?? row?.package_names ?? row?.plans ?? [],
      availability: row?.availability ?? row?.availability_status,
      image: row?.image ?? row?.image_url ?? row?.cover_image ?? live.coverUrls?.[0] ?? live.logoUrl,
      service_ids: row?.service_ids ?? [],
    });
  }), [liveVendors]);
  return { vendors, loading };
}
