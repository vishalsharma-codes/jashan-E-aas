import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { toast } from "sonner"; // swap for your toast hook if you don't use sonner
import { supabase } from "@/integrations/supabase/client"; // adjust path to your client
import { PageHeading, StickyAction, goldBtn } from "@/components/wedding/WeddingFlowLayout";
import { useWeddingFlow } from "@/context/WeddingFlowContext";
import { useWeddingVendors } from "@/hooks/useWeddingVendors";
import { getService } from "@/lib/weddingTaxonomy";
import { bookingUrl, vendorMatchesServices, vendorServiceIds, type FlowVendor } from "@/lib/vendorMatch";

const MAX_COMPARE = 3;
const BUDGETS = [
  { label: "Any budget", min: 0, max: Infinity },
  { label: "Under ₹50k", min: 0, max: 50_000 },
  { label: "₹50k - ₹2L", min: 50_000, max: 200_000 },
  { label: "₹2L - ₹5L", min: 200_000, max: 500_000 },
  { label: "₹5L+", min: 500_000, max: Infinity },
];
export const inr = (n: number | null) => (n == null ? "On request" : `₹${n.toLocaleString("en-IN")}`);

function NotifyMe({ serviceId, format, variant }: { serviceId: number; format?: string; variant?: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
    setBusy(true);
    const { error } = await (supabase as any)
      .from("vendor_notify_requests")
      .insert({ service_id: serviceId, email, format: format ?? null, variant: variant ?? null });
    setBusy(false);
    if (error) return toast.error("Couldn't save. Try again.");
    toast.success("We'll notify you when vendors join.");
    setOpen(false);
  };

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 rounded-lg border border-[#d4af37]/60 px-4 py-1.5 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
        Notify me
      </button>
    );
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-[#d4af37]" />
      <button type="button" disabled={busy} onClick={submit} className="rounded-lg bg-[#d4af37] px-4 py-1.5 text-sm font-semibold text-black disabled:opacity-50">
        {busy ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1 text-sm text-[#f0c94a]">
      <Star className="h-4 w-4 fill-[#f0c94a]" /> {value ? value.toFixed(1) : "New"}
    </span>
  );
}

/** Matching vendors. Replace <VendorCard> body with your existing marketplace card if you prefer. */
export default function WeddingVendors() {
  const navigate = useNavigate();
  const { format, formatId, variantId, functionIds, serviceIds, vendorIds, setVendorIds, path } = useWeddingFlow();
  const { vendors, loading } = useWeddingVendors();

  const [svc, setSvc] = useState<number | 0>(0);
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState(0);
  const [minRating, setMinRating] = useState(0);

  const activeServices = svc ? [svc] : serviceIds;

  const matched = useMemo(() => vendors.filter((v) => vendorMatchesServices(v, serviceIds)), [vendors, serviceIds]);
  const cities = useMemo(() => Array.from(new Set(matched.map((v) => v.city).filter(Boolean))).sort(), [matched]);
  const uncovered = useMemo(
    () => serviceIds.filter((id) => !vendors.some((v) => vendorMatchesServices(v, [id]))),
    [vendors, serviceIds],
  );

  const list = useMemo(() => {
    const b = BUDGETS[budget];
    return matched.filter(
      (v) =>
        vendorMatchesServices(v, activeServices) &&
        (!city || v.city === city) &&
        v.rating >= minRating &&
        (budget === 0 || (v.priceFrom != null && v.priceFrom >= b.min && v.priceFrom < b.max)),
    );
  }, [matched, activeServices, city, minRating, budget]);

  if (!format) return <Navigate to="/weddings" replace />;
  if (!serviceIds.length) return <Navigate to={path("services")} replace />;

  const toggle = (id: string) =>
    setVendorIds(
      vendorIds.includes(id)
        ? vendorIds.filter((x) => x !== id)
        : vendorIds.length < MAX_COMPARE ? [...vendorIds, id] : vendorIds,
    );

  const book = (v: FlowVendor) => {
    const own = vendorServiceIds(v);
    const svcs = serviceIds.filter((s) => own.includes(s));
    navigate(bookingUrl(v.id, { format: formatId, variant: variantId, functions: functionIds, services: svcs.length ? svcs : serviceIds }));
  };

  const sel = "rounded-lg border border-white/15 bg-[#17181f] px-3 py-2 text-sm outline-none focus:border-[#d4af37]";

  return (
    <>
      <PageHeading eyebrow="Step 5" title="Matching Vendors" sub="Select up to 3 vendors to compare side by side." />

      <div className="mb-6 flex flex-wrap gap-3">
        <select className={sel} value={svc} onChange={(e) => setSvc(Number(e.target.value))}>
          <option value={0}>All selected services</option>
          {serviceIds.map((id) => <option key={id} value={id}>{getService(id)?.name}</option>)}
        </select>
        <select className={sel} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
          {BUDGETS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}
        </select>
        <select className={sel} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
          {[0, 3, 4, 4.5].map((r) => <option key={r} value={r}>{r ? `${r}★ & up` : "Any rating"}</option>)}
        </select>
      </div>

      {loading && <p className="text-center text-white/50">Loading vendors...</p>}

      {!loading && uncovered.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uncovered.map((id) => (
            <div key={id} className="rounded-2xl border border-dashed border-[#d4af37]/40 p-5 text-center">
              <p className="font-serif text-lg">No vendors yet for {getService(id)?.name}</p>
              <NotifyMe serviceId={id} format={formatId} variant={variantId} />
            </div>
          ))}
        </div>
      )}

      {!loading && list.length === 0 && uncovered.length < serviceIds.length && (
        <p className="py-10 text-center text-white/50">No vendors match these filters. Try widening them.</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((v) => {
          const on = vendorIds.includes(v.id);
          const disabled = !on && vendorIds.length >= MAX_COMPARE;
          const tags = vendorServiceIds(v).filter((s) => serviceIds.includes(s)).slice(0, 3);
          return (
            <article key={v.id} className={`overflow-hidden rounded-2xl border bg-[#17181f] transition ${on ? "border-[#d4af37]" : "border-[#d4af37]/25"}`}>
              <div className="relative h-40 bg-gradient-to-br from-[#4a3410] to-[#0d0d12]">
                {v.image && <img src={v.image} alt={v.name} loading="lazy" className="h-full w-full object-cover" />}
                <label className={`absolute right-3 top-3 flex items-center gap-2 rounded-md bg-black/70 px-2 py-1 text-xs ${disabled ? "opacity-50" : "cursor-pointer"}`}>
                  <input type="checkbox" checked={on} disabled={disabled} onChange={() => toggle(v.id)} className="accent-[#d4af37]" />
                  Compare
                </label>
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg leading-tight">{v.name}</h3>
                  <Stars value={v.rating} />
                </div>
                <p className="text-xs text-white/55">{[v.category, v.city].filter(Boolean).join(" · ")}</p>
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => <span key={t} className="rounded-full bg-[#d4af37]/15 px-2 py-0.5 text-[10px] text-[#f0c94a]">{getService(t)?.name}</span>)}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-[#f0c94a]">From {inr(v.priceFrom)}</span>
                  <button type="button" onClick={() => book(v)} className="rounded-lg bg-[#d4af37] px-4 py-1.5 text-sm font-semibold text-black hover:bg-[#f0c94a]">Book</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {vendorIds.length > 0 && (
        <StickyAction>
          <span className="text-sm text-white/70">{vendorIds.length} of {MAX_COMPARE} selected</span>
          <button type="button" className={goldBtn} disabled={vendorIds.length < 2} onClick={() => navigate(path("compare"))}>
            Compare ({vendorIds.length})
          </button>
        </StickyAction>
      )}
    </>
  );
}
