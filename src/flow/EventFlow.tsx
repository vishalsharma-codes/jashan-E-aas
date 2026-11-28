// src/flow/EventFlow.tsx
// One data-driven flow for ALL 20 categories (weddings included):
// Format > Variant > Functions > Services > Vendors > Compare
// Data comes only from "@/lib/eventTaxonomy" (generated from the docx).
import { useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Search } from "lucide-react";
import { getCategory, type TaxCategory, type TaxItem } from "@/lib/eventTaxonomy";
import { useLiveVendors } from "@/lib/liveVedors";

/* ------------------------------------------------------------------ helpers */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const csv = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const STEPS = ["Format", "Variant", "Functions", "Services", "Vendors", "Compare"];

// Optional: card images per category slug. Fill with the images you already use on the overlay.
const categoryImageFiles = import.meta.glob("../components/outerCategory/categoryImages/*.{jpg,jpeg,png,webp,avif}", { eager: true, import: "default" }) as Record<string, string>;
const weddingThemeFiles = import.meta.glob("../components/outerCategory/subCategoryImages/wedding/*.{jpg,jpeg,png,webp,avif}", { eager: true, import: "default" }) as Record<string, string>;
const themeImage = (name: string) => {
  const key = name.toLowerCase().replace(/\s+/g, "-");
  const path = Object.keys(weddingThemeFiles).find((candidate) => candidate.toLowerCase().includes(`${key}-wedding`));
  return path ? weddingThemeFiles[path] : undefined;
};
const imageById: Record<string, string> = {
  "CAT-01": "weddings", "CAT-02": "corporate-events", "CAT-03": "social-parties", "CAT-04": "educational-events",
  "CAT-05": "concerts-shows", "CAT-06": "religious-spiritual", "CAT-07": "exhibitions-expos", "CAT-08": "sports-events",
  "CAT-09": "government-events", "CAT-10": "charity-ngo-events", "CAT-11": "fashion-lifestyle", "CAT-12": "virtual-hybrid-events",
  "CAT-13": "festivals-melas", "CAT-14": "hospitality-fnb", "CAT-15": "film-media-events", "CAT-16": "tech-innovation",
  "CAT-17": "health-wellness", "CAT-18": "community-events", "CAT-19": "agricultural-rural-events", "CAT-20": "automotive-events",
};
export const CATEGORY_IMAGES: Record<string, string> = Object.fromEntries(Object.entries(imageById).map(([id, file]) => {
  const path = Object.keys(categoryImageFiles).find((candidate) => candidate.toLowerCase().endsWith(`/${file}.jpg`));
  return [getCategory(id)?.slug ?? id, path ? categoryImageFiles[path] : ""];
}));

function useCat() {
  const { category = "", format = "", variant = "all" } = useParams();
  const cat = getCategory(category);
  const fmt = cat?.formats.find((f) => f.id === format);
  const variantName = fmt?.variants.find((v) => slug(v) === variant);
  const base = `/events/${category}/${format}/${variant}`;
  return { cat, fmt, variant, variantName, base, category, format };
}

/* ------------------------------------------------------------------ shell */
function Shell({
  step, cat, title, subtitle, children, footer,
}: { step: number; cat: TaxCategory; title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="mx-auto max-w-6xl px-6 pb-32 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-[#d4af37]/60 px-4 py-2 text-sm text-[#d4af37]">
            <ArrowLeft size={16} /> Back
          </button>
          {STEPS.map((s, i) => (
            <span key={s}
              className={`rounded-full border px-3 py-1 text-xs ${i + 1 === step
                ? "border-[#d4af37] bg-[#d4af37] font-semibold text-black"
                : "border-white/15 text-white/60"}`}>
              {i + 1}. {s}
            </span>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d4af37]">{cat.name}</p>
          <h1 className="mt-3 font-serif text-4xl font-bold md:text-5xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-3 max-w-2xl text-white/60">{subtitle}</p>}
        </div>
        <div className="mt-10">{children}</div>
      </div>
      {footer}
    </div>
  );
}

function PickCard({ title, sub, image, onClick }: { title: string; sub?: string; image?: string; onClick: () => void }) {
  return (
    <div role="link" tabIndex={0} onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onClick())}
      className="group relative h-48 cursor-pointer overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-[#2a1a22] to-[#12121a] transition hover:border-[#d4af37]">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
        <div>
          <h3 className="font-serif text-xl font-bold">{title}</h3>
          {sub && <p className="mt-1 text-xs text-white/70">{sub}</p>}
        </div>
        <ArrowRight className="text-[#d4af37]" size={20} />
      </div>
    </div>
  );
}

function StickyBar({ left, label, disabled, onClick }: { left: string; label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0b0b10]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-sm text-white/70">{left}</span>
        <button disabled={disabled} onClick={onClick}
          className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-40">
          {label}
        </button>
      </div>
    </div>
  );
}

function MultiGrid({ items, selected, toggle }: { items: TaxItem[]; selected: string[]; toggle: (id: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const on = selected.includes(it.id);
        return (
          <button key={it.id} onClick={() => toggle(it.id)}
            className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition ${on
              ? "border-[#d4af37] bg-[#d4af37]/10" : "border-white/10 hover:border-white/30"}`}>
            <span>
              <span className="block text-sm font-medium">{it.name}</span>
              {it.detail && <span className="mt-1 block text-xs text-white/50">{it.detail}</span>}
            </span>
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${on
              ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-white/30"}`}>
              {on && <Check size={12} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ steps */
function FormatStep() {
  const { category = "" } = useParams();
  const cat = getCategory(category);
  const navigate = useNavigate();
  if (!cat) return <Navigate to="/" replace />;
  return (
    <Shell step={1} cat={cat} title={`Choose Your ${cat.name.split("&")[0].trim()} Format`}
      subtitle={`Pick the type of event. Next we'll narrow down the variant, functions and services. Typical lead time: ${cat.leadTime}.`}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cat.formats.map((f) => (
          <PickCard key={f.id} title={f.name}
            sub={f.variants.length ? f.variants.slice(0, 4).join(" · ") + (f.variants.length > 4 ? " & more" : "") : undefined}
            image={CATEGORY_IMAGES[cat.slug]}
            onClick={() => navigate(f.variants.length ? `/events/${cat.slug}/${f.id}` : `/events/${cat.slug}/${f.id}/all/functions`)} />
        ))}
      </div>
    </Shell>
  );
}

function VariantStep() {
  const { cat, fmt } = useCat();
  const navigate = useNavigate();
  const [showMoreThemes, setShowMoreThemes] = useState(false);
  if (!cat || !fmt) return <Navigate to="/" replace />;
  // no variants -> skip this screen
  if (!fmt.variants.length) return <Navigate to={`/events/${cat.slug}/${fmt.id}/all/functions`} replace />;
  return (
    <Shell step={2} cat={cat} title={`Select ${fmt.name.replace(/s$/, "")} Variant`}>
      {fmt.moreVariants?.length ? <div className="mb-5 flex justify-end"><button className="text-sm text-[#d4af37]" onClick={() => setShowMoreThemes((value) => !value)}>{showMoreThemes ? "Fewer themes" : "More themes"}</button></div> : null}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[...fmt.variants, ...(showMoreThemes ? fmt.moreVariants ?? [] : [])].map((v) => (
          <PickCard key={v} title={v} image={themeImage(v) ?? CATEGORY_IMAGES[cat.slug]}
            onClick={() => navigate(`/events/${cat.slug}/${fmt.id}/${slug(v)}/functions`)} />
        ))}
      </div>
    </Shell>
  );
}

function useSelection(key: "f" | "s") {
  const [sp, setSp] = useSearchParams();
  const selected = csv(sp.get(key));
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    const p = new URLSearchParams(sp);
    next.length ? p.set(key, next.join(",")) : p.delete(key);
    setSp(p, { replace: true });
  };
  const setAll = (ids: string[]) => {
    const p = new URLSearchParams(sp);
    ids.length ? p.set(key, ids.join(",")) : p.delete(key);
    setSp(p, { replace: true });
  };
  return { selected, toggle, setAll, sp };
}

function FunctionsStep() {
  const { cat, base } = useCat();
  const navigate = useNavigate();
  const { selected, toggle, setAll, sp } = useSelection("f");
  if (!cat) return <Navigate to="/" replace />;
  // CAT-01..CAT-06 need at least one function; the rest (4-5 phases) are optional
  const required = Number(cat.id.split("-")[1]) <= 6;
  const all = cat.functions.map((f) => f.id);
  return (
    <Shell step={3} cat={cat} title={required ? "Select Functions" : "Select Sub-events"}
      subtitle="Choose every sub-event you want to plan."
      footer={<StickyBar left={`${selected.length} selected`} label="Continue to services"
        disabled={required && selected.length === 0}
        onClick={() => navigate(`${base}/services?${sp.toString()}`)} />}>
      <div className="mb-4 flex justify-end">
        <button className="text-sm text-[#d4af37]" onClick={() => setAll(selected.length === all.length ? [] : all)}>
          {selected.length === all.length ? "Clear all" : "Select all"}
        </button>
      </div>
      <MultiGrid items={cat.functions} selected={selected} toggle={toggle} />
    </Shell>
  );
}

function ServicesStep() {
  const { cat, base } = useCat();
  const navigate = useNavigate();
  const { selected, toggle, sp } = useSelection("s");
  const [q, setQ] = useState("");
  if (!cat) return <Navigate to="/" replace />;
  const list = cat.services.filter((s) => norm(s.name + " " + (s.detail ?? "")).includes(norm(q)));
  return (
    <Shell step={4} cat={cat} title="Select Required Services"
      subtitle={`${cat.services.length} vendor services available for this event type.`}
      footer={<StickyBar left={`${selected.length} selected`} label="Find vendors"
        disabled={selected.length === 0}
        onClick={() => navigate(`${base}/vendors?${sp.toString()}`)} />}>
      <div className="relative mx-auto mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-3 text-white/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#d4af37]" />
      </div>
      <MultiGrid items={list} selected={selected} toggle={toggle} />
    </Shell>
  );
}

/* ------------------------------------------------------------------ vendors */
// Adjust field names to your vendor shape. Prefers exact taxonomy ids (service_ids),
// then falls back to keyword matching on the vendor's text fields.
function vendorMatches(v: any, selected: TaxItem[]) {
  const raw = v.raw ?? {};
  const explicit = Array.isArray(raw.service_ids) ? raw.service_ids.map(String) : [];
  if (explicit.length && selected.some((service) => explicit.includes(service.id))) return true;
  const hay = norm([v.category, v.subcategory, v.name, raw.business_name, raw.category, raw.subcategory, raw.description,
    ...(raw.services ?? []), ...(raw.tags ?? []), ...(raw.specialties ?? [])].filter(Boolean).join(" "));
  return selected.some((s) => norm(s.name).split(" ").filter((w) => w.length > 3).some((w) => hay.includes(w)));
}
const vId = (v: any) => String(v.id ?? v.slug ?? v.name);
const vName = (v: any) => v.name ?? v.raw?.business_name ?? "Vendor";
const profileSlug = (v: any) => `${slug(vName(v))}-${v.id}`;

function VendorsStep() {
  const { cat } = useCat();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const { vendors: liveVendors, loading } = useLiveVendors();
  const serviceIds = csv(sp.get("s"));
  const compare = csv(sp.get("c"));
  const selected = useMemo(() => cat?.services.filter((s) => serviceIds.includes(s.id)) ?? [], [cat, serviceIds.join(",")]);
  const results = useMemo(() => liveVendors.filter((v: any) => {
    const categoryIds: string[] = v.raw?.category_ids ?? [];
    const categoryText = `${v.category} ${v.subcategory} ${v.raw?.category_id ?? ""}`.toLowerCase().replace(/s\b/g, "");
    const categoryLabel = `${cat?.shortName ?? ""} ${cat?.name ?? ""} ${cat?.slug.split("-").join(" ") ?? ""}`.toLowerCase().replace(/s\b/g, "");
    const categoryMatch = categoryIds.includes(cat?.id ?? "") || categoryText.includes(categoryLabel.split(" ")[0]);
    return categoryMatch && vendorMatches(v, selected);
  }), [liveVendors, selected, cat]);
  if (!cat) return <Navigate to="/" replace />;

  const toggleCompare = (id: string) => {
    const next = compare.includes(id) ? compare.filter((x) => x !== id) : compare.length < 3 ? [...compare, id] : compare;
    const p = new URLSearchParams(sp);
    next.length ? p.set("c", next.join(",")) : p.delete("c");
    setSp(p, { replace: true });
  };

  return (
    <Shell step={5} cat={cat} title="Matching Vendors"
      subtitle={`Showing vendors for: ${selected.map((s) => s.name).join(", ")}`}
      footer={compare.length ? <StickyBar left={`${compare.length} of 3 selected`} label={`Compare (${compare.length})`}
        disabled={compare.length < 2}
        onClick={() => navigate(`/events/${cat.slug}/compare?c=${compare.join(",")}`)} /> : undefined}>
      {loading ? <p className="py-12 text-center text-white/60">Loading vendors…</p> : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/60">
          No vendors yet for these services. Try fewer services, or check back soon.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((v) => {
            const id = vId(v);
            const on = compare.includes(id);
            return (
              <div key={id} className={`rounded-2xl border p-5 ${on ? "border-[#d4af37]" : "border-white/10"}`}>
                <h3 className="font-serif text-lg font-bold">{vName(v)}</h3>
                <p className="mt-1 text-sm text-white/60">{[v.location, v.category].filter(Boolean).join(" · ")}</p>
                {v.rating != null && <p className="mt-2 text-sm text-[#d4af37]">★ {v.rating}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input type="checkbox" checked={on} onChange={() => toggleCompare(id)} /> Compare
                  </label>
                  <button onClick={() => navigate(`/vendors/${profileSlug(v)}`)}
                    className="rounded-lg border border-[#d4af37]/60 px-3 py-1.5 text-xs text-[#d4af37]">View</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

function CompareStep() {
  const { cat } = useCat();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const { vendors: liveVendors } = useLiveVendors();
  const ids = csv(sp.get("c"));
  if (!cat) return <Navigate to="/" replace />;
  const list = liveVendors.filter((v: any) => ids.includes(vId(v)));
  const rows: [string, (v: any) => React.ReactNode][] = [
    ["Rating", (v) => v.rating ?? "-"],
    ["City", (v) => v.location ?? "-"],
    ["Starting price", (v) => v.price ?? "-"],
    ["Packages", (v) => v.packages?.length ?? "-"],
  ];
  return (
    <Shell step={6} cat={cat} title="Compare and Book">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr><th className="p-3 text-left text-white/50" />
              {list.map((v) => <th key={vId(v)} className="p-3 text-left font-serif text-lg">{vName(v)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} className="border-t border-white/10">
                <td className="p-3 text-white/50">{label}</td>
                {list.map((v) => <td key={vId(v)} className="p-3">{fn(v)}</td>)}
              </tr>
            ))}
            <tr className="border-t border-white/10">
              <td />
              {list.map((v) => (
                <td key={vId(v)} className="p-3">
                  <button onClick={() => navigate(`/book/${v.id}`)}
                    className="rounded-xl bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black">Book</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ routes */
export default function EventFlow() {
  return (
    <Routes>
      <Route path=":category" element={<FormatStep />} />
      <Route path=":category/compare" element={<CompareStep />} />
      <Route path=":category/:format" element={<VariantStep />} />
      <Route path=":category/:format/:variant/functions" element={<FunctionsStep />} />
      <Route path=":category/:format/:variant/services" element={<ServicesStep />} />
      <Route path=":category/:format/:variant/vendors" element={<VendorsStep />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
