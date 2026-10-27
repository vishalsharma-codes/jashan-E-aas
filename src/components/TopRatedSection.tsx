
import { useMemo } from "react";
import { useLiveVendors, homeSectionOf } from "@/lib/liveVedors";
import type { LiveVendor } from "@/lib/vendorOptions";
import { TopRatedStack, type StackVendor } from "./TopRatedStack";

function toStackVendor(v: LiveVendor): StackVendor {
  // Prefer cover images, then portfolio images, then the logo.
  const urls: string[] = [
    ...(v.coverUrls ?? []),
    ...((v.portfolio ?? []) as any[])
      .map((p) => p?.imageUrl)
      .filter(Boolean),
    ...(v.logoUrl ? [v.logoUrl] : []),
  ];

  const unique = Array.from(new Set(urls));

  return {
    id: v.id,
    name: v.name,
    location: v.location,
    rating: v.reviews > 0 ? v.rating : "New",
    reviews: v.reviews > 0 ? v.reviews : undefined,
    price: v.price,
    category: v.category,
    gradient: v.gradient,
    initials: v.initials,
    isVerified: v.isVerified,
    portfolio: unique.length
      ? unique
          .slice(0, 4)
          .map((image, i) => ({
            id: `${v.id}-${i}`,
            image,
          }))
      : [
          {
            id: `${v.id}-fallback`,
            gradient: v.gradient,
            emoji: "📷",
          },
        ],
  };
}

export function TopRatedSection({
  max = 10,
}: {
  max?: number;
}) {
  const { vendors, loading } = useLiveVendors();

  const items = useMemo(
    () =>
      homeSectionOf(vendors, "top_rated", max).map(toStackVendor),
    [vendors, max]
  );

  // Hide the section while loading or when no vendors are assigned.
  if (loading || items.length === 0) return null;

  return <TopRatedStack vendors={items} max={max} />;
}

export default TopRatedSection;
