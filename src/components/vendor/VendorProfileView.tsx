import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck, Briefcase, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, MapPin,
  MessageCircle, ShieldCheck, Star, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { gradientFor, initialsOf, inr, priceLabel, type VendorProfileRow } from "@/lib/vendorOptions";

/**
 * Customer-facing vendor profile. Shows ONLY public fields.
 * Never reads vendor_private (phone, UPI, bank, documents) or escrow data.
 * Sections with no data are hidden, so a new vendor never shows empty boxes.
 *
 * Usage (page or inside your modal body):
 *   <VendorProfileView profile={vendor} onBook={() => ...} onMessage={() => ...} />
 */

export interface PublicReview { id: string; author: string; rating: number; text: string; created_at: string }

interface Pkg { id: string; name: string; price: number; description: string; inclusions: string[]; is_popular: boolean }
interface Shot { id: string; image_url: string; title: string; event_type: string }

const TOKEN_PCT = 0.15;
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** trims, capitalises the first letter and removes case-insensitive duplicates ("lucknow" + "Lucknow") */
const tidy = (xs: string[]) => {
  const seen = new Set<string>();
  return xs.map((s) => s.trim()).filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .filter((s) => { const k = s.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-t border-border py-7 first:border-t-0 first:pt-0">
    <h2 className="mb-4 font-serif text-xl font-bold">{title}</h2>
    {children}
  </section>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs">{children}</span>
);

/* ───────── read-only availability ───────── */

function FreeDaysCalendar({ blocked, minNotice }: { blocked: Set<string>; minNotice: number }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const y = month.getFullYear(), m = month.getMonth();
  const earliest = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + minNotice); return iso(d); }, [minNotice]);
  const cells = [
    ...Array(new Date(y, m, 1).getDay()).fill(null),
    ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => iso(new Date(y, m, i + 1))),
  ] as (string | null)[];
  const atStart = y === new Date().getFullYear() && m === new Date().getMonth();

  return (
    <div className="max-w-sm">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" disabled={atStart} aria-label="Previous month" onClick={() => setMonth(new Date(y, m - 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-border hover:border-gold disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
        <p className="font-serif font-bold">{month.toLocaleString("en-IN", { month: "long", year: "numeric" })}</p>
        <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(y, m + 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-border hover:border-gold"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const taken = blocked.has(day);
          const tooSoon = day < earliest;
          const cls = taken ? "bg-red-500/10 text-red-600 line-through"
            : tooSoon ? "text-muted-foreground/40" : "bg-gold/10 font-medium text-foreground";
          return <span key={day} className={`grid aspect-square place-items-center rounded-lg text-sm ${cls}`}
            title={taken ? "Booked" : tooSoon ? "Too soon to book" : "Available"}>{Number(day.slice(8))}</span>;
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-gold/20" />Available</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-red-500/20" />Booked</span>
        {minNotice > 0 && <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-border" />Too soon</span>}
      </div>
    </div>
  );
}

/* ───────── main view ───────── */

export function VendorProfileView({ profile: p, reviews = [], onBook, onMessage }: {
  profile: VendorProfileRow; reviews?: PublicReview[]; onBook: () => void; onMessage?: () => void;
}) {
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [cover, setCover] = useState(0);
  const [filter, setFilter] = useState("All");
  const [light, setLight] = useState<number | null>(null);

  useEffect(() => {
    let off = false;
    void (async () => {
      const [a, b, c] = await Promise.all([
        supabase.from("vendor_packages").select("id,name,price,description,inclusions,is_popular").eq("vendor_id", p.user_id).order("price"),
        supabase.from("vendor_portfolio").select("id,image_url,title,event_type").eq("vendor_id", p.user_id).order("created_at", { ascending: false }),
        supabase.from("vendor_blocked_dates").select("day").eq("vendor_id", p.user_id),
      ]);
      if (off) return;
      setPkgs(a.data ?? []); setShots(b.data ?? []); setBlocked(new Set((c.data ?? []).map((r: any) => r.day)));
    })();
    return () => { off = true; };
  }, [p.user_id]);

  const eventTags = useMemo(() => Array.from(new Set(shots.map((s) => s.event_type).filter(Boolean))), [shots]);
  const shown = filter === "All" ? shots : shots.filter((s) => s.event_type === filter);

  useEffect(() => {
    if (light === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLight(null);
      if (e.key === "ArrowRight") setLight((i) => (i === null ? i : (i + 1) % shown.length));
      if (e.key === "ArrowLeft") setLight((i) => (i === null ? i : (i - 1 + shown.length) % shown.length));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [light, shown.length]);

  const covers = p.cover_urls ?? [];
  const cities = tidy(p.cities ?? []);
  const stats = [
    p.years_experience > 0 && { icon: Briefcase, v: `${p.years_experience} yr${p.years_experience === 1 ? "" : "s"}`, l: "Experience" },
    p.events_completed > 0 && { icon: CalendarDays, v: String(p.events_completed), l: p.events_completed === 1 ? "Event done" : "Events done" },
    p.team_size > 0 && { icon: Users, v: String(p.team_size), l: "Team size" },
  ].filter(Boolean) as { icon: React.ElementType; v: string; l: string }[];
  const token = Math.round(p.price_min * TOKEN_PCT);
  const cancelLabel = p.cancellation_policy?.split(":")[0];
  const rated = p.reviews_count > 0;

  return (
    <div className="pb-24 lg:pb-0">
      {/* cover gallery */}
      <div className="overflow-hidden rounded-2xl border border-border">
        {covers.length ? <img src={covers[cover] ?? covers[0]} alt={`${p.business_name} cover`} className="aspect-[16/7] w-full object-cover" />
          : <div className={`aspect-[16/7] w-full bg-gradient-to-br ${gradientFor(p.user_id)}`} />}
      </div>
      {covers.length > 1 && (
        <div className="mt-2 flex gap-2">
          {covers.map((u, i) => (
            <button key={u} type="button" onClick={() => setCover(i)} aria-label={`Show cover ${i + 1}`}
              className={`overflow-hidden rounded-lg border-2 ${i === cover ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <img src={u} alt="" className="h-14 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* header */}
      <header className="mt-6 flex items-start gap-4">
        {p.logo_url ? <img src={p.logo_url} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
          : <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradientFor(p.user_id)} text-xl font-bold text-white`}>{initialsOf(p.business_name)}</span>}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">{p.business_name}</h1>
            {p.verification_status === "verified" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>
            )}
          </div>
          {p.tagline && <p className="mt-0.5 text-muted-foreground">{p.tagline}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{[p.category, p.subcategory].filter(Boolean).join(", ")}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tidy([p.home_city])[0]}</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{rated ? `${p.rating.toFixed(1)} (${p.reviews_count})` : "New on Jashan-E-Aas"}</span>
            {p.response_time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Replies {p.response_time}</span>}
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <Section title="About">
            <p className="max-w-prose whitespace-pre-line leading-relaxed">{p.description}</p>
            {stats.length > 0 && (
              <dl className="mt-5 grid grid-cols-3 gap-3">
                {stats.map(({ icon: I, v, l }) => (
                  <div key={l} className="rounded-xl bg-muted px-3 py-3">
                    <I className="mb-1 h-4 w-4 text-gold" />
                    <dt className="sr-only">{l}</dt>
                    <dd className="font-serif text-lg font-bold">{v}</dd>
                    <p className="text-xs text-muted-foreground">{l}</p>
                  </div>
                ))}
              </dl>
            )}
          </Section>

          {pkgs.length > 0 && (
            <Section title="Packages">
              <div className="grid gap-4 sm:grid-cols-2">
                {pkgs.map((k) => (
                  <article key={k.id} className={`rounded-2xl border p-4 ${k.is_popular ? "border-gold bg-gold/5" : "border-border"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-bold">{k.name}</h3>
                      {k.is_popular && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-background">Popular</span>}
                    </div>
                    <p className="text-xl font-bold text-gold">₹{inr(k.price)}</p>
                    {k.description && <p className="mt-1 text-sm text-muted-foreground">{k.description}</p>}
                    <ul className="mt-3 space-y-1 text-sm">
                      {k.inclusions.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{i}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            </Section>
          )}

          {shots.length > 0 && (
            <Section title="Portfolio">
              {eventTags.length > 1 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {["All", ...eventTags].map((t) => (
                    <button key={t} type="button" onClick={() => setFilter(t)}
                      className={`rounded-full border px-3 py-1 text-xs ${filter === t ? "border-gold bg-gold text-background" : "border-border bg-muted hover:border-gold/60"}`}>{t}</button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {shown.map((s, i) => (
                  <button key={s.id} type="button" onClick={() => setLight(i)} className="group relative overflow-hidden rounded-xl">
                    <img src={s.image_url} alt={s.title} loading="lazy" className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
                    {s.event_type && <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-left text-xs text-white">{s.event_type}</span>}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {(p.event_types?.length > 0 || p.specialties?.length > 0 || p.languages?.length > 0) && (
            <Section title="What they work on">
              {p.event_types?.length > 0 && (<><p className="mb-2 text-sm text-muted-foreground">Events</p><div className="mb-4 flex flex-wrap gap-2">{p.event_types.map((t) => <Chip key={t}>{t}</Chip>)}</div></>)}
              {p.specialties?.length > 0 && (<><p className="mb-2 text-sm text-muted-foreground">Specialties</p><div className="mb-4 flex flex-wrap gap-2">{tidy(p.specialties).map((t) => <Chip key={t}>{t}</Chip>)}</div></>)}
              {p.languages?.length > 0 && (<><p className="mb-2 text-sm text-muted-foreground">Languages</p><div className="flex flex-wrap gap-2">{p.languages.map((t) => <Chip key={t}>{t}</Chip>)}</div></>)}
            </Section>
          )}

          <Section title="Where they work">
            <p className="mb-2 text-sm text-muted-foreground">Based in {tidy([p.home_city])[0]}</p>
            <div className="flex flex-wrap gap-2">{cities.map((c) => <Chip key={c}>{c}</Chip>)}</div>
            {p.travels_for_destination && <p className="mt-3 text-sm">Also travels for destination events.</p>}
          </Section>

          <Section title="Availability">
            <FreeDaysCalendar blocked={blocked} minNotice={p.min_notice_days} />
          </Section>

          {reviews.length > 0 && (
            <Section title={`Reviews (${p.reviews_count})`}>
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{r.author}</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{r.rating.toFixed(1)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* booking box */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div>
              <p className="text-xs text-muted-foreground">Starting package</p>
              <p className="font-serif text-2xl font-bold text-gold">{priceLabel(p.price_min, p.price_max, p.price_unit)}</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />Pay a 15% token (₹{inr(token)} at the starting price). It is held in escrow until the vendor confirms.</li>
              {p.min_notice_days > 0 && <li className="flex gap-2"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold" />Book at least {p.min_notice_days} days before your event.</li>}
              {cancelLabel && <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{cancelLabel} cancellation: {p.cancellation_policy.split(":").slice(1).join(":").trim()}</li>}
            </ul>
            <Button onClick={onBook} className="w-full bg-gold font-semibold text-background hover:bg-gold-dark">Book this vendor</Button>
            {onMessage && <Button onClick={onMessage} variant="outline" className="w-full"><MessageCircle className="mr-2 h-4 w-4" />Message in Baatein</Button>}
            <p className="text-xs text-muted-foreground">Final quote is agreed with the vendor. Keep chats and payments on the platform.</p>
          </div>
        </aside>
      </div>

      {/* mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden safe-area-bottom">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">Starting at</p>
          <p className="truncate font-bold text-gold">{priceLabel(p.price_min, p.price_max, p.price_unit)}</p>
        </div>
        <div className="flex gap-2">
          {onMessage && <Button onClick={onMessage} variant="outline" size="icon" aria-label="Message"><MessageCircle className="h-4 w-4" /></Button>}
          <Button onClick={onBook} className="bg-gold font-semibold text-background hover:bg-gold-dark">Book this vendor</Button>
        </div>
      </div>

      {/* lightbox */}
      {light !== null && shown[light] && (
        <div role="dialog" aria-label="Portfolio photo" className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={() => setLight(null)}>
          <button type="button" aria-label="Close" className="absolute right-4 top-4 text-white"><X className="h-6 w-6" /></button>
          {shown.length > 1 && (
            <>
              <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setLight((light - 1 + shown.length) % shown.length); }} className="absolute left-3 text-white"><ChevronLeft className="h-8 w-8" /></button>
              <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); setLight((light + 1) % shown.length); }} className="absolute right-3 text-white"><ChevronRight className="h-8 w-8" /></button>
            </>
          )}
          <img src={shown[light].image_url} alt={shown[light].title} className="max-h-[85vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}