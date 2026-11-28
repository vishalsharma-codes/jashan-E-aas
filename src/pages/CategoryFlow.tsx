/**
 * One page component for ALL 20 categories.
 *
 *   /category/:slug                      -> formats        (tier 2)
 *   /category/:slug/:formatId            -> variants       (skipped if the format has none)
 *   /category/:slug/:formatId/events     -> sub-events     (tier 3, multi-select)
 *   /category/:slug/:formatId/services   -> vendor services(tier 4, multi-select)
 *   /category/:slug/:formatId/vendors    -> matching vendors
 */
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

import { getCategory, groupVendorsByService, type TaxonomyCategory } from "@/lib/categoryTaxonomy";
import { parseAll, parseLabel, splitServices, type ParsedLabel } from "@/lib/taxonomyFlow";
import { useFlow } from "@/lib/flowStore";
import { categoryImage, itemImage } from "@/lib/flowImages";
import { useLiveVendors } from "@/lib/liveVedors";
import { Breadcrumb, OptionCard, ServiceChip, StepHeader, StickyBar } from "@/components/flow/FlowParts";

export type Step = "formats" | "variants" | "events" | "services" | "vendors";

/* How your existing vendor records name their service(s). Change this one line to fit vendorData. */
const getVendorServices = (v: any): string | string[] | undefined =>
  v.services ?? v.raw?.services ?? v.service ?? v.subcategory ?? v.category ?? v.serviceType;

const hueFor = (i: number) => (i * 37 + 10) % 360;

export default function CategoryFlow({ step }: { step: Step }) {
  const { slug = "", formatId = "" } = useParams();
  if (slug === "weddings" || slug === "wedding") return <Navigate to="/weddings" replace />;
  const cat = getCategory(slug);
  if (!cat) return <div className="p-10 text-[#4A3440]">Category not found. <Link className="underline" to="/categories">See all categories</Link></div>;

  const formats = parseAll(cat.formats);
  const format = formatId ? formats.find((f) => f.id === formatId) : undefined;
  if (formatId && !format) return <Navigate to={`/category/${cat.slug}`} replace />;

  return (
    <main className="min-h-screen bg-[#FFF6F2] px-4 pb-32 pt-8 text-[#4A3440]">
      <div className="mx-auto max-w-6xl">
        <Crumbs cat={cat} format={format} step={step} />
        {step === "formats" && <FormatsStep cat={cat} formats={formats} />}
        {format && step === "variants" && <VariantsStep cat={cat} format={format} />}
        {format && step === "events" && <EventsStep cat={cat} format={format} />}
        {format && step === "services" && <ServicesStep cat={cat} format={format} />}
        {format && step === "vendors" && <VendorsStep cat={cat} format={format} />}
      </div>
    </main>
  );
}

/* ---------------- breadcrumb ---------------- */
function Crumbs({ cat, format, step }: { cat: TaxonomyCategory; format?: ParsedLabel; step: Step }) {
  const flow = useFlow();
  const base = `/category/${cat.slug}`;
  const sel = format ? flow.get(`${cat.slug}/${format.id}`) : undefined;
  const items: { label: string; to?: string }[] = [{ label: "Home", to: "/" }, { label: cat.shortName, to: base }];
  if (format) items.push({ label: format.title, to: `${base}/${format.id}` });
  if (sel?.variant) items.push({ label: sel.variant, to: `${base}/${format!.id}` });
  const tail: Partial<Record<Step, string>> = { events: "Sub-events", services: "Services", vendors: "Vendors" };
  if (tail[step]) items.push({ label: tail[step]! });
  return <Breadcrumb items={items} />;
}

/* ---------------- tier 2: formats ---------------- */
function FormatsStep({ cat, formats }: { cat: TaxonomyCategory; formats: ParsedLabel[] }) {
  const nav = useNavigate();
  const base = `/category/${cat.slug}`;
  return (
    <>
      <StepHeader title={cat.name} desc={cat.scope} />
      <p className="mt-6 text-sm font-medium">Pick a type of {cat.shortName.toLowerCase()} event</p>
      <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {formats.map((f, i) => (
          <OptionCard
            key={f.id}
            title={f.title}
            subtitle={f.detail.length ? f.detail.join(" · ") : undefined}
            image={itemImage(cat.slug, f.id) || categoryImage(cat.slug)}
            hue={hueFor(i)}
            onClick={() => nav(f.detail.length ? `${base}/${f.id}` : `${base}/${f.id}/events`)}
          />
        ))}
      </div>
    </>
  );
}

/* ---------------- tier 2b: variants (read from the brackets in the format name) ---------------- */
function VariantsStep({ cat, format }: { cat: TaxonomyCategory; format: ParsedLabel }) {
  const nav = useNavigate();
  const flow = useFlow();
  const key = `${cat.slug}/${format.id}`;
  const base = `/category/${cat.slug}/${format.id}`;
  if (format.detail.length === 0) return <Navigate to={`${base}/events`} replace />;

  const pick = (v?: string) => { flow.setVariant(key, v); nav(`${base}/events`); };
  return (
    <>
      <StepHeader title={format.title} desc="Choose a style, or skip if you are still deciding." />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {format.detail.map((v, i) => (
          <OptionCard
            key={v}
            title={v}
            image={itemImage(cat.slug, `${format.id}-${parseLabel(v).id}`) || itemImage(cat.slug, format.id) || categoryImage(cat.slug)}
            hue={hueFor(i + 3)}
            selected={flow.get(key).variant === v}
            onClick={() => pick(v)}
          />
        ))}
      </div>
      <StickyBar summary="One style at a time" onBack={() => nav(`/category/${cat.slug}`)} onContinue={() => pick(undefined)} continueLabel="Skip, I'm flexible" />
    </>
  );
}

/* ---------------- tier 3: sub-events (multi-select) ---------------- */
function EventsStep({ cat, format }: { cat: TaxonomyCategory; format: ParsedLabel }) {
  const nav = useNavigate();
  const flow = useFlow();
  const key = `${cat.slug}/${format.id}`;
  const base = `/category/${cat.slug}/${format.id}`;
  const events = parseAll(cat.subEvents);
  const sel = flow.get(key);

  return (
    <>
      <StepHeader title="Which events are you planning?" desc="Select as many as you need. You can continue without picking any." />
      <div className="mt-4 flex gap-3 text-sm">
        <button className="text-[#C44A68] hover:underline" onClick={() => flow.setMany(key, "events", events.map((e) => e.id))}>Select all</button>
        <button className="text-[#4A3440]/70 hover:underline" onClick={() => flow.setMany(key, "events", [])}>Clear</button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => (
          <OptionCard
            key={e.id}
            title={e.title}
            chips={e.detail}
            image={itemImage(cat.slug, e.id) || categoryImage(cat.slug)}
            hue={hueFor(i + 5)}
            multi
            selected={sel.events.includes(e.id)}
            onClick={() => flow.toggle(key, "events", e.id)}
          />
        ))}
      </div>
      <StickyBar
        summary={sel.events.length ? `${sel.events.length} selected` : "Nothing selected yet"}
        onBack={() => nav(format.detail.length ? `/category/${cat.slug}/${format.id}` : `/category/${cat.slug}`)}
        onContinue={() => nav(`${base}/services`)}
      />
    </>
  );
}

/* ---------------- tier 4: services (multi-select) ---------------- */
function ServicesStep({ cat, format }: { cat: TaxonomyCategory; format: ParsedLabel }) {
  const nav = useNavigate();
  const flow = useFlow();
  const [showMore, setShowMore] = useState(false);
  const key = `${cat.slug}/${format.id}`;
  const base = `/category/${cat.slug}/${format.id}`;
  const sel = flow.get(key);
  const { suggested, others } = splitServices(cat.id, sel.events);

  const chip = (s: string) => {
    const p = parseLabel(s);
    return <ServiceChip key={s} label={p.title} detail={p.detail} selected={sel.services.includes(s)} onClick={() => flow.toggle(key, "services", s)} />;
  };

  return (
    <>
      <StepHeader
        title="Which vendors do you need?"
        desc={others.length ? "Suggested for the events you picked. Open the full list for anything else." : "Select every service you want to book."}
      />
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{suggested.map(chip)}</div>

      {others.length > 0 && (
        <>
          <button onClick={() => setShowMore((v) => !v)} className="mt-6 text-sm font-medium text-[#C44A68] hover:underline">
            {showMore ? "Hide other services" : `Show ${others.length} more services`}
          </button>
          {showMore && <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{others.map(chip)}</div>}
        </>
      )}

      <StickyBar
        summary={sel.services.length ? `${sel.services.length} service${sel.services.length > 1 ? "s" : ""} selected` : "No services selected - we'll show all vendors"}
        onBack={() => nav(`${base}/events`)}
        onContinue={() => nav(`${base}/vendors`)}
        continueLabel="Show vendors"
      />
    </>
  );
}

/* ---------------- vendors ---------------- */
function VendorsStep({ cat, format }: { cat: TaxonomyCategory; format: ParsedLabel }) {
  const nav = useNavigate();
  const flow = useFlow();
  const { vendors: liveVendors, loading } = useLiveVendors();
  const key = `${cat.slug}/${format.id}`;
  const sel = flow.get(key);

  const categoryVendors = liveVendors.filter((vendor) => vendor.categoryId === cat.id);
  const sections = groupVendorsByService(categoryVendors, cat.id, getVendorServices).filter(
    (s) => sel.services.length === 0 || sel.services.includes(s.service)
  );

  return (
    <>
      <StepHeader title="Matching vendors" desc={sel.services.length ? `Showing vendors for ${sel.services.length} selected service(s).` : "Showing every vendor in this category."} />
      {loading && <p className="mt-6 text-sm text-[#4A3440]/70">Loading vendors…</p>}
      {sections.length === 0 && (
        <p className="mt-10 rounded-xl bg-white p-6 text-sm">
          No vendors have listed these services yet. Go back and try another service, or browse all vendors.
        </p>
      )}
      {sections.map((sec) => (
        <section key={sec.service} className="mt-8">
          <h2 className="font-serif text-2xl">{parseLabel(sec.service).title}</h2>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sec.vendors.map((v: any, i: number) => (
              <VendorMini key={v.id ?? v.slug ?? i} v={v} />
            ))}
          </div>
        </section>
      ))}
      <StickyBar summary="" onBack={() => nav(`/category/${cat.slug}/${format.id}/services`)} onContinue={() => nav("/vendors")} continueLabel="Browse all vendors" />
    </>
  );
}

/** Minimal card. Swap for your existing <VendorCard vendor={v} /> if you prefer. */
function VendorMini({ v }: { v: any }) {
  const img = v.image ?? v.profileImage ?? v.avatar ?? v.logoUrl ?? v.portfolio?.[0]?.imageUrl ?? v.portfolio?.[0]?.image;
  const price = v.startingPrice ?? v.price;
  return (
    <Link to={`/vendors/${v.slug ?? v.id}`} className="overflow-hidden rounded-2xl border border-[#C44A68]/15 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[16/10] bg-[#FFC9B0]/40">
        {img && <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg">{v.name}</h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-[#4A3440]/70">
          {(v.city ?? v.location) && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city ?? v.location}</span>}
          {v.rating != null && <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-[#C44A68] text-[#C44A68]" />{v.rating}</span>}
        </div>
        {price != null && <p className="mt-2 text-sm font-medium text-[#C44A68]">Starting {typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : price}</p>}
      </div>
    </Link>
  );
}
