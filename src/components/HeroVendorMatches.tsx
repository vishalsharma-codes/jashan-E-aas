import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, CheckCircle, ArrowUpRight } from "lucide-react";
import { useLiveVendors } from "@/lib/liveVedors";
import { vendorMatches, type HeroFilters } from "@/lib/vendorMatch";

export function HeroVendorMatches({ filters, onSeeAll }: { filters: HeroFilters; onSeeAll: () => void }) {
  const { vendors, loading } = useLiveVendors();
  const navigate = useNavigate();
  const matches = useMemo(() => vendors.filter((v) => vendorMatches(v, filters)), [vendors, filters]);

  if (loading) return <p className="mt-4 text-center text-xs text-[#4A3440]/70">Finding vendors…</p>;

  if (matches.length === 0) {
    return (
      <div className="mx-auto mt-4 w-full max-w-3xl rounded-2xl border border-dashed border-[#C44A68]/30 bg-white/60 py-6 text-center text-sm font-medium text-[#4A3440]/80 backdrop-blur">
        No vendor found
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 w-full max-w-3xl">
      <div className="mb-2 flex items-center justify-between px-1 text-xs">
        <span className="font-semibold text-[#4A1230]">{matches.length} vendor{matches.length > 1 ? "s" : ""} available</span>
        <button type="button" onClick={onSeeAll} className="inline-flex items-center font-semibold text-[#C44A68] hover:text-[#A8385A]">
          View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {matches.slice(0, 12).map((v) => {
          const img = v.coverUrls?.[0] || (v.portfolio?.[0] as any)?.imageUrl || v.logoUrl;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => navigate(`/vendors?vendor=${v.id}`)}
              className="group w-[210px] shrink-0 overflow-hidden rounded-2xl border border-[#C44A68]/20 bg-[#FFFBF8] text-left transition hover:-translate-y-0.5 hover:border-[#C44A68]/50 hover:shadow-[0_12px_30px_rgba(196,74,104,.2)]"
            >
              <div className="h-24 bg-[#F9DDE3] bg-cover bg-center" style={img ? { backgroundImage: `url("${img}")` } : undefined} />
              <div className="p-3">
                <div className="flex items-center gap-1">
                  <h3 className="truncate text-sm font-bold text-[#4A1230] group-hover:text-[#C44A68]">{v.name}</h3>
                  {v.isVerified && <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#C44A68]" />}
                </div>
                <p className="truncate text-[11px] text-[#4A3440]/70">{v.category}</p>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[#4A3440]/70">
                  <span className="inline-flex items-center gap-1 text-[#C44A68]"><Star className="h-3 w-3 fill-current" />{v.reviews > 0 ? v.rating : "New"}</span>
                  <span className="inline-flex min-w-0 items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{v.location}</span></span>
                </div>
                <p className="mt-1.5 truncate text-xs font-extrabold text-[#C44A68]">{v.price}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}