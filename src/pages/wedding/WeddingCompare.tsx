import { Navigate, useNavigate } from "react-router-dom";
import { PageHeading } from "@/components/wedding/WeddingFlowLayout";
import { useWeddingFlow } from "@/context/WeddingFlowContext";
import { useWeddingVendors } from "@/hooks/useWeddingVendors";
import { getService } from "@/lib/weddingTaxonomy";
import { bookingUrl, vendorServiceIds } from "@/lib/vendorMatch";
import { inr } from "./WeddingVendors";

/** Side-by-side comparison of up to 3 vendors; ids live in ?v= so refresh keeps them. */
export default function WeddingCompare() {
  const navigate = useNavigate();
  const { formatId, variantId, functionIds, serviceIds, vendorIds, setVendorIds, path } = useWeddingFlow();
  const { vendors, loading } = useWeddingVendors();

  const picked = vendorIds.map((id) => vendors.find((v) => v.id === id)).filter(Boolean) as typeof vendors;

  if (!vendorIds.length) return <Navigate to={formatId ? path("vendors") : "/weddings"} replace />;
  if (loading && !picked.length) return <p className="text-center text-white/50">Loading...</p>;

  const rows: { label: string; cell: (v: (typeof vendors)[number]) => React.ReactNode }[] = [
    { label: "Starting price", cell: (v) => inr(v.priceFrom) },
    { label: "Rating", cell: (v) => (v.rating ? `${v.rating.toFixed(1)} ★` : "New") },
    { label: "Packages", cell: (v) => (v.packages.length ? v.packages.join(", ") : "Ask vendor") },
    { label: "Availability", cell: (v) => v.availability },
    { label: "Location", cell: (v) => v.city || "-" },
    {
      label: "Covers your services",
      cell: (v) => {
        const own = vendorServiceIds(v).filter((s) => serviceIds.includes(s));
        return own.length ? own.map((s) => getService(s)?.name).join(", ") : "-";
      },
    },
  ];

  const book = (id: string, own: number[]) =>
    navigate(bookingUrl(id, {
      format: formatId, variant: variantId, functions: functionIds,
      services: own.filter((s) => serviceIds.includes(s)).length ? own.filter((s) => serviceIds.includes(s)) : serviceIds,
    }));

  return (
    <>
      <PageHeading eyebrow="Step 6" title="Compare and Book" />
      <div className="overflow-x-auto rounded-2xl border border-[#d4af37]/30">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="bg-[#d4af37]/10">
              <th className="w-44 p-4 font-normal text-white/50" />
              {picked.map((v) => (
                <th key={v.id} className="p-4 align-top">
                  <p className="font-serif text-lg text-[#f0c94a]">{v.name}</p>
                  <p className="text-xs font-normal text-white/50">{v.category}</p>
                  <button type="button" onClick={() => setVendorIds(vendorIds.filter((x) => x !== v.id))} className="mt-1 text-xs font-normal text-white/50 underline hover:text-white">
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-white/10">
                <td className="p-4 text-white/50">{r.label}</td>
                {picked.map((v) => <td key={v.id} className="p-4">{r.cell(v)}</td>)}
              </tr>
            ))}
            <tr className="border-t border-white/10">
              <td className="p-4" />
              {picked.map((v) => (
                <td key={v.id} className="p-4">
                  <button type="button" onClick={() => book(v.id, vendorServiceIds(v))} className="rounded-lg bg-[#d4af37] px-5 py-2 font-semibold text-black hover:bg-[#f0c94a]">
                    Book
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
