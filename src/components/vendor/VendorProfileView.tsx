import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp, BadgeCheck, Briefcase, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Heart, Images, MapPin, MessageCircle, Plane, Share2, ShieldCheck, Sparkles, Star, Users, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewForm } from "@/components/vendor/ReviewForm";
import { gradientFor, initialsOf, inr, priceLabel, type VendorProfileRow } from "@/lib/vendorOptions";

/** Customer-facing vendor profile. Tabs switch content; the profile itself does not scroll-spy. */

export interface PublicReview { id: string; author: string; rating: number; text: string; created_at: string }

export interface BookingSelection {
  packageId: string | null; packageName: string; price: number;
  date: string; endDate: string; guests: number; eventType: string;
}

interface Pkg { id: string; name: string; price: number; description: string; inclusions: string[]; is_popular: boolean }
interface Shot { id: string; image_url: string; title: string; event_type: string }
interface Photo { src: string; title: string }

const EASE = [0.22, 1, 0.36, 1] as const;
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const longDate = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

/** trims, capitalises the first letter and removes case-insensitive duplicates ("lucknow" + "Lucknow") */
const tidy = (xs: string[]) => {
  const seen = new Set<string>();
  return xs.map((s) => s.trim()).filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .filter((s) => { const k = s.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
};

/* ───────── small building blocks ───────── */

function Reveal({ children, delay = 0, y = 18, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}>{children}</motion.div>;
}

function CountUp({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  return <span>{to.toFixed(decimals)}{suffix}</span>;
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <Reveal className="mb-6">
        <p className="text-[10px] font-bold tracking-[.28em] text-[#C44A68]">{eyebrow}</p>
        <h2 className="mt-1.5 font-serif text-2xl font-bold text-[#4A1230] sm:text-3xl">{title}</h2>
        <motion.span className="mt-3 block h-[3px] origin-left rounded-full bg-gradient-to-r from-[#E0708A] to-[#F4A6B8]"
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} style={{ width: 56 }} />
      </Reveal>
    </div>
  );
}

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-[#C44A68]/15 bg-[#F9DDE3] px-3 py-1 text-xs font-medium text-[#4A3440]">{children}</span>
);

/* ───────── availability calendar (pick a date) ───────── */

function Calendar({ blocked, minNotice, value, onPick }: { blocked: Set<string>; minNotice: number; value: string; onPick: (d: string) => void }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const y = month.getFullYear(), m = month.getMonth();
  const todayIso = iso(new Date());
  const earliest = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + minNotice); return iso(d); }, [minNotice]);
  const days = Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => iso(new Date(y, m, i + 1)));
  const cells = [...Array(new Date(y, m, 1).getDay()).fill(null), ...days] as (string | null)[];
  const freeCount = days.filter((d) => !blocked.has(d) && d >= earliest).length;
  const atStart = y === new Date().getFullYear() && m === new Date().getMonth();

  return (
    <div className="max-w-md rounded-3xl border border-[#C44A68]/15 bg-[#FFFBF8] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" disabled={atStart} aria-label="Previous month" onClick={() => setMonth(new Date(y, m - 1, 1))}
          className="grid h-9 w-9 place-items-center rounded-full border border-[#C44A68]/25 text-[#C44A68] transition hover:bg-[#C44A68] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#C44A68]"><ChevronLeft className="h-4 w-4" /></button>
        <div className="text-center">
          <p className="font-serif text-lg font-bold text-[#4A1230]">{month.toLocaleString("en-IN", { month: "long", year: "numeric" })}</p>
          <p className="text-[11px] text-[#4A3440]/60">{freeCount} free {freeCount === 1 ? "day" : "days"} this month</p>
        </div>
        <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(y, m + 1, 1))}
          className="grid h-9 w-9 place-items-center rounded-full border border-[#C44A68]/25 text-[#C44A68] transition hover:bg-[#C44A68] hover:text-white"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#4A3440]/50">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
      <AnimatePresence mode="wait">
        <motion.div key={`${y}-${m}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} />;
            const taken = blocked.has(day), tooSoon = day < earliest, picked = day === value;
            const cls = picked ? "bg-gradient-to-br from-[#E0708A] to-[#C44A68] font-bold text-white shadow-md"
              : taken ? "bg-red-500/10 text-red-600 line-through"
              : tooSoon ? "text-[#4A3440]/30"
              : "bg-[#F9DDE3]/70 font-medium text-[#4A1230] hover:bg-[#F4A6B8]";
            return (
              <button key={day} type="button" disabled={taken || tooSoon} onClick={() => onPick(day)}
                title={taken ? "Booked" : tooSoon ? "Too soon to book" : "Available"}
                className={`grid aspect-square place-items-center rounded-xl text-sm transition ${cls} ${day === todayIso && !picked ? "ring-1 ring-[#C44A68]" : ""}`}>
                {Number(day.slice(8))}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#4A3440]/70">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-[#F4A6B8]" />Available</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-red-500/30" />Booked</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-[#C44A68]" />Your date</span>
      </div>
    </div>
  );
}

/* ───────── lightbox with swipe + thumbnails ───────── */

function Lightbox({ photos, index, setIndex, onClose }: { photos: Photo[]; index: number; setIndex: (i: number) => void; onClose: () => void }) {
  const n = photos.length;
  const [dir, setDir] = useState(1);
  const go = (d: number) => { setDir(d); setIndex((index + d + n) % n); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k, true);
    return () => window.removeEventListener("keydown", k, true);
  });
  const ph = photos[index];
  if (!ph) return null;
  return (
    <motion.div role="dialog" aria-label="Photo viewer" className="fixed inset-0 z-[140] flex flex-col bg-[#1d0612]/95 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm text-white/80">{index + 1} / {n}</span>
        <button type="button" aria-label="Close" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X className="h-5 w-5" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        {n > 1 && <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/25 sm:left-6"><ChevronLeft className="h-6 w-6" /></button>}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.img key={ph.src} src={ph.src} alt={ph.title} custom={dir} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
            onDragEnd={(_, info) => { if (info.offset.x < -70) go(1); else if (info.offset.x > 70) go(-1); }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, x: dir * 60, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.28, ease: EASE }} className="max-h-full max-w-full cursor-grab rounded-xl object-contain active:cursor-grabbing" />
        </AnimatePresence>
        {n > 1 && <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/25 sm:right-6"><ChevronRight className="h-6 w-6" /></button>}
      </div>
      <div className="px-4 pb-4 pt-3" onClick={(e) => e.stopPropagation()}>
        {ph.title && <p className="mb-2 text-center text-sm text-white/80">{ph.title}</p>}
        {n > 1 && (
          <div className="mx-auto flex max-w-full justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
            {photos.map((t, i) => (
              <button key={`${t.src}-${i}`} type="button" onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }} aria-label={`Photo ${i + 1}`}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === index ? "border-[#F4A6B8]" : "border-transparent opacity-50 hover:opacity-100"}`}>
                <img src={t.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ───────── main view ───────── */

export function VendorProfileView({ profile: p, reviews: reviewsProp = [], onBook, onMessage, saved = false, onToggleSaved, profileUrl }: {
  profile: VendorProfileRow;
  profileUrl?: string;
  reviews?: PublicReview[];
  onBook: (selection?: BookingSelection) => void;
  onMessage?: (selection?: BookingSelection) => void;
  saved?: boolean;
  onToggleSaved?: () => void;
}) {
  const reduced = useReducedMotion();

  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [fetchedReviews, setFetchedReviews] = useState<PublicReview[]>([]);
  const [cover, setCover] = useState(0);
  const [hoverHero, setHoverHero] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [lb, setLb] = useState<{ list: Photo[]; i: number } | null>(null);
  const [pkgId, setPkgId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [eventType, setEventType] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checked, setChecked] = useState(false);
  const [moreAbout, setMoreAbout] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [active, setActive] = useState<"about" | "packages" | "portfolio" | "services" | "areas" | "availability" | "reviews" | "faq">("about");
  const [toast, setToast] = useState("");


  const flash = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(""), 2200); };

  /* data */
  useEffect(() => {
    let off = false;
    void (async () => {
      const [a, b, c, d] = await Promise.all([
        supabase.from("vendor_packages").select("id,name,price,description,inclusions,is_popular").eq("vendor_id", p.user_id).order("price"),
        supabase.from("vendor_portfolio").select("id,image_url,title,event_type").eq("vendor_id", p.user_id).order("created_at", { ascending: false }),
        supabase.from("vendor_blocked_dates").select("day").eq("vendor_id", p.user_id),
        reviewsProp.length ? Promise.resolve({ data: null }) : supabase.from("vendor_reviews").select("*").eq("vendor_id", p.user_id).order("created_at", { ascending: false }).limit(20),
      ]);
      if (off) return;
      setPkgs((a.data ?? []).map((k: any) => ({ ...k, inclusions: k.inclusions ?? [] })));
      setShots(b.data ?? []);
      setBlocked(new Set((c.data ?? []).map((r: any) => r.day)));
      // vendor_reviews column names differ between projects, so map defensively
      setFetchedReviews(((d as any).data ?? []).map((r: any, i: number) => ({
        id: String(r.id ?? i),
        author: r.author ?? r.customer_name ?? r.reviewer_name ?? r.name ?? "Guest",
        rating: Number(r.rating ?? 0),
        text: r.text ?? r.comment ?? r.review ?? r.content ?? "",
        created_at: r.created_at ?? "",
      })));
    })();
    return () => { off = true; };
  }, [p.user_id, reviewsProp.length]);

  const reviews = reviewsProp.length ? reviewsProp : fetchedReviews;

  // freeze page scrolling while the lightbox is open
  useEffect(() => {
    if (!lb) return;
    // The lightbox is modal; no page-level smooth-scroll instance is used.
  }, [lb]);

  const tabs = [
    { id: "about", label: "About" },
    { id: "packages", label: "Packages" },
    { id: "portfolio", label: "Portfolio" },
    { id: "services", label: "Services" },
    { id: "areas", label: "Areas" },
    { id: "availability", label: "Availability" },
    { id: "reviews", label: "Reviews" },
    { id: "faq", label: "FAQ" },
  ] as const;

  /* derived */
  const covers = p.cover_urls ?? [];
  const cities = tidy(p.cities ?? []);
  const home = tidy([p.home_city])[0] ?? "";
  const tags = (((p as any).tags ?? []) as string[]).slice(0, 6);
  const rated = p.reviews_count > 0;
  const eventTags = useMemo(() => Array.from(new Set(shots.map((s) => s.event_type).filter(Boolean))), [shots]);
  const shown = filter === "All" ? shots : shots.filter((s) => s.event_type === filter);
  const visible = showAll ? shown : shown.slice(0, 9);
  const heroPhotos: Photo[] = useMemo(() => {
    const all: Photo[] = [...covers.map((c) => ({ src: c, title: `${p.business_name} cover` })), ...shots.map((s) => ({ src: s.image_url, title: s.title || s.event_type }))];
    return all.filter((ph, i) => all.findIndex((x) => x.src === ph.src) === i);
  }, [covers, shots, p.business_name]);
  const hasServices = (p.event_types?.length ?? 0) > 0 || (p.specialties?.length ?? 0) > 0 || (p.languages?.length ?? 0) > 0;


  // cover slider auto-advance
  useEffect(() => {
    if (covers.length < 2 || hoverHero || reduced) return;
    const t = window.setInterval(() => setCover((c) => (c + 1) % covers.length), 5500);
    return () => window.clearInterval(t);
  }, [covers.length, hoverHero, reduced]);

  /* booking state */
  const selectedPkg = pkgs.find((k) => k.id === pkgId) ?? null;
  const basePrice = selectedPkg?.price ?? p.price_min;
  const earliest = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + (p.min_notice_days || 0)); return iso(d); }, [p.min_notice_days]);
  const rangeDays = (a: string, b: string) => {
    const out: string[] = [];
    const d = new Date(`${a}T00:00:00`), e = new Date(`${b}T00:00:00`);
    for (let n = 0; d <= e && n < 60; n++) { out.push(iso(d)); d.setDate(d.getDate() + 1); }
    return out;
  };
  const lastDay = endDate || date;
  const clashes = date && lastDay >= date ? rangeDays(date, lastDay).filter((d) => blocked.has(d)) : [];
  const dateState: "none" | "free" | "booked" | "soon" | "invalid" =
    !date ? "none" : endDate && endDate < date ? "invalid" : clashes.length ? "booked" : date < earliest ? "soon" : "free";
  const selection: BookingSelection = {
    packageId: selectedPkg?.id ?? null, packageName: selectedPkg?.name ?? "Starting package", price: basePrice,
    date, endDate, guests: Number(guests) || 0, eventType,
  };
  const cancelLabel = p.cancellation_policy?.split(":")[0];
  const cancelText = p.cancellation_policy?.split(":").slice(1).join(":").trim();

  const share = async () => {
    const url = `${window.location.origin}${profileUrl ?? `/vendors?vendor=${p.user_id}`}`;
    try {
      if (navigator.share) { await navigator.share({ title: p.business_name, text: `Check out ${p.business_name} on Jashan-E-Aas`, url }); return; }
    } catch (e) { if ((e as Error).name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); flash("Link copied to clipboard"); } catch { flash("Could not copy the link"); }
  };

  const stats = [
    { icon: Star, node: rated ? <CountUp to={p.rating} decimals={1} /> : "New", l: rated ? `${p.reviews_count} reviews` : "On Jashan-E-Aas" },
    p.years_experience > 0 && { icon: Briefcase, node: <CountUp to={p.years_experience} suffix="+" />, l: p.years_experience === 1 ? "Year experience" : "Years experience" },
    p.events_completed > 0 && { icon: CalendarDays, node: <CountUp to={p.events_completed} suffix="+" />, l: "Events done" },
    p.team_size > 0 && { icon: Users, node: <CountUp to={p.team_size} />, l: "Team size" },
    p.response_time && { icon: Clock, node: <span className="text-xl">{p.response_time}</span>, l: "Typical reply" },
  ].filter(Boolean) as { icon: React.ElementType; node: React.ReactNode; l: string }[];

  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => Math.round(r.rating) === s).length }));
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : p.rating;

  const faqs = [
    { q: "How does booking work?", a: `Pick your dates, check availability, then tap "Contact me" to chat with the vendor. They will share a final quote, and you can confirm the booking from the chat.` },
    cancelLabel && { q: "What is the cancellation policy?", a: `${cancelLabel} cancellation: ${cancelText}` },
    p.min_notice_days > 0 && { q: "How early should I book?", a: `This vendor needs at least ${p.min_notice_days} days of notice before your event. Dates inside that window are greyed out in the calendar.` },
    { q: "Where should I chat and pay?", a: "Keep all chats and payments on Jashan-E-Aas so you have a record if anything needs to be sorted out." },
  ].filter(Boolean) as { q: string; a: string }[];

  /* Desktop booking card stays alongside the active tab content. */
  const card = (
    <div className="rounded-3xl border border-[#C44A68]/20 bg-[#FFFBF8] p-5 shadow-[0_24px_70px_rgba(196,74,104,.14)]">
      <p className="text-[10px] font-bold tracking-[.28em] text-[#C44A68]">{selectedPkg ? "SELECTED PACKAGE" : "STARTING AT"}</p>
      <p className="mt-1 font-serif text-3xl font-bold text-[#C44A68]">
        {selectedPkg ? `₹${inr(selectedPkg.price)}` : priceLabel(p.price_min, p.price_max, p.price_unit)}
      </p>
      {selectedPkg && <p className="text-xs text-[#4A3440]/70">{selectedPkg.name}</p>}

      {onMessage && (
        <button type="button" onClick={() => onMessage(selection)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E0708A] to-[#C44A68] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(196,74,104,.35)] transition hover:brightness-105">
          <MessageCircle className="h-4 w-4" />Contact me
        </button>
      )}

      <div className="mt-5 border-t border-[#C44A68]/15 pt-4">
        <p className="font-serif text-lg font-bold text-[#4A1230]">Check availability</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-[#4A3440]/70">Start date
            <input type="date" min={earliest} value={date}
              onChange={(e) => { setDate(e.target.value); setChecked(false); }}
              className="mt-1 block w-full rounded-xl border border-[#C44A68]/20 bg-white/70 px-2 py-2 text-sm text-[#4A1230] outline-none focus:border-[#C44A68]" />
          </label>
          <label className="text-xs font-semibold text-[#4A3440]/70">End date
            <input type="date" min={date || earliest} value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setChecked(false); }}
              className="mt-1 block w-full rounded-xl border border-[#C44A68]/20 bg-white/70 px-2 py-2 text-sm text-[#4A1230] outline-none focus:border-[#C44A68]" />
          </label>
          <label className="text-xs font-semibold text-[#4A3440]/70">Guests
            <input type="number" min={1} inputMode="numeric" placeholder="e.g. 150" value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-[#C44A68]/20 bg-white/70 px-3 py-2 text-sm text-[#4A1230] outline-none focus:border-[#C44A68]" />
          </label>
          <label className="text-xs font-semibold text-[#4A3440]/70">Event type
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-[#C44A68]/20 bg-white/70 px-2 py-2 text-sm text-[#4A1230] outline-none focus:border-[#C44A68]">
              <option value="">Select</option>
              {(p.event_types ?? []).map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <button type="button" disabled={!date} onClick={() => setChecked(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#C44A68]/40 px-4 py-2.5 text-sm font-semibold text-[#C44A68] transition hover:bg-[#C44A68]/10 disabled:cursor-not-allowed disabled:opacity-50">
          <CalendarDays className="h-4 w-4" />Check availability
        </button>

        <AnimatePresence mode="wait">
          {checked && dateState !== "none" && (
            <motion.p key={dateState + date + endDate} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mt-3 rounded-xl px-3 py-2 text-xs font-medium ${dateState === "free" ? "bg-emerald-500/10 text-emerald-700" : dateState === "soon" || dateState === "invalid" ? "bg-amber-500/10 text-amber-700" : "bg-red-500/10 text-red-600"}`}>
              {dateState === "free" && `Available ${longDate(date)}${endDate && endDate !== date ? ` to ${longDate(endDate)}` : ""}. Tap "Contact me" to confirm with the vendor.`}
              {dateState === "booked" && `Not available: ${clashes.length} ${clashes.length === 1 ? "day is" : "days are"} already booked in this range.`}
              {dateState === "soon" && `Needs at least ${p.min_notice_days} days notice. Pick a later date.`}
              {dateState === "invalid" && "End date must be after the start date."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <ul className="mt-4 space-y-2 text-xs text-[#4A3440]/75">
        {p.min_notice_days > 0 && <li className="flex gap-2"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C44A68]" />Contact at least {p.min_notice_days} days before your event.</li>}
        {cancelLabel && <li className="flex gap-2"><X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C44A68]" />{cancelLabel} cancellation: {cancelText}</li>}
        <li className="flex gap-2"><BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C44A68]" />The quote is agreed with the vendor. Keep chats on the platform.</li>
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#FFF6F1]">
      <div className="mx-auto w-full max-w-[1000px] px-4 pb-16">

      {/* ───── hero ───── */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}
        onMouseEnter={() => setHoverHero(true)} onMouseLeave={() => setHoverHero(false)}
        className="relative mt-4 h-[360px] overflow-hidden rounded-3xl border border-[#C44A68]/20 bg-[#F9DDE3]">
        <motion.div className="absolute inset-0">
          <AnimatePresence initial={false}>
            {covers.length ? (
              <motion.img key={covers[cover] ?? covers[0]} src={covers[cover] ?? covers[0]} alt={`${p.business_name} cover`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0 h-full w-full object-cover" />
            ) : <div className={`absolute inset-0 bg-gradient-to-br ${gradientFor(p.user_id)}`} />}
          </AnimatePresence>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a0a1a]/90 via-[#2a0a1a]/20 to-[#2a0a1a]/25" />

        {/* top actions */}
        <div className="absolute right-3 top-3 z-10 flex gap-2 sm:right-5 sm:top-5">
          {heroPhotos.length > 0 && (
            <button type="button" onClick={() => setLb({ list: heroPhotos, i: 0 })}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60">
              <Images className="h-4 w-4" />{heroPhotos.length} {heroPhotos.length === 1 ? "photo" : "photos"}
            </button>
          )}
          <button type="button" onClick={share} aria-label="Share" className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition hover:bg-black/60"><Share2 className="h-4 w-4" /></button>
          {onToggleSaved && (
            <button type="button" onClick={onToggleSaved} aria-label={saved ? "Remove from shortlist" : "Shortlist"} className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition hover:bg-black/60">
              <motion.span key={String(saved)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
                <Heart className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
              </motion.span>
            </button>
          )}
        </div>

        {/* slider arrows + dots */}
        {covers.length > 1 && (
          <>
            <button type="button" aria-label="Previous cover" onClick={() => setCover((cover - 1 + covers.length) % covers.length)} className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/55 sm:grid"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="Next cover" onClick={() => setCover((cover + 1) % covers.length)} className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/55 sm:grid"><ChevronRight className="h-5 w-5" /></button>
            <div className="absolute bottom-4 right-5 z-10 flex gap-1.5">
              {covers.map((u, i) => <button key={u} type="button" aria-label={`Show cover ${i + 1}`} onClick={() => setCover(i)} className={`h-1.5 rounded-full transition-all ${i === cover ? "w-6 bg-[#F4A6B8]" : "w-1.5 bg-white/60"}`} />)}
            </div>
          </>
        )}

        {/* title block */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-8">
          <div className="flex items-end gap-4">
            {p.logo_url
              ? <img src={p.logo_url} alt="" className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white/70 object-cover shadow-xl sm:h-20 sm:w-20" />
              : <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-white/70 bg-gradient-to-br ${gradientFor(p.user_id)} text-xl font-bold shadow-xl sm:h-20 sm:w-20`}>{initialsOf(p.business_name)}</span>}
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                {p.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full border border-[#F4A6B8]/50 bg-black/45 px-2.5 py-0.5 text-[11px] font-semibold text-[#F4A6B8] backdrop-blur"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur">{[p.category, p.subcategory].filter(Boolean).join(" · ")}</span>
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight drop-shadow sm:text-5xl">{p.business_name}</h1>
              {p.tagline && <p className="mt-1 text-sm text-white/85 sm:text-base">{p.tagline}</p>}
            </div>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/85 sm:text-sm">
            {home && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{home}</span>}
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#F4A6B8] text-[#F4A6B8]" />{rated ? `${p.rating.toFixed(1)} (${p.reviews_count} reviews)` : "New on Jashan-E-Aas"}</span>
            {p.response_time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Replies {p.response_time}</span>}
          </p>
        </div>
      </motion.section>

      {/* ───── stats strip ───── */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ icon: I, node, l }, i) => (
          <Reveal key={l} delay={i * 0.06} y={18}>
            <div className="h-full rounded-2xl border border-[#C44A68]/15 bg-[#FFF1EC] px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[#C44A68]/40 hover:shadow-[0_12px_30px_rgba(196,74,104,.12)]">
              <I className="mb-1.5 h-4 w-4 text-[#C44A68]" />
              <p className="font-serif text-2xl font-bold text-[#4A1230]">{node}</p>
              <p className="text-xs text-[#4A3440]/65">{l}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Tabs switch the visible panel; the overlay handles page scrolling. */}
      <div className="mt-6 flex items-center justify-between gap-2 border-b border-rose-100 pb-2">
        <div className="flex min-w-0 gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setActive(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${active === t.id ? "bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow" : "text-[#4a2c3a] hover:bg-rose-50"}`}>
              {t.label}
            </button>
          ))}
        </div>
        {onMessage && <button type="button" onClick={() => onMessage(selection)} className="shrink-0 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white">Contact me</button>}
      </div>

      <div className="mt-6 grid gap-6 pb-4 md:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {/* mobile booking card */}
          

          {/* about */}
          <section style={{ display: active === "about" ? "block" : "none" }}>
            <SectionHead eyebrow="WHO THEY ARE" title={`About ${p.business_name}`} />
            <Reveal>
              <p className={`max-w-prose whitespace-pre-line leading-relaxed text-[#4A3440] ${!moreAbout && p.description.length > 260 ? "line-clamp-5" : ""}`}>{p.description}</p>
              {p.description.length > 260 && (
                <button type="button" onClick={() => setMoreAbout((v) => !v)} className="mt-2 text-sm font-semibold text-[#C44A68] hover:text-[#A8385A]">{moreAbout ? "Show less" : "Read more"}</button>
              )}
              {tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{tags.map((t) => <Chip key={t}>{t}</Chip>)}</div>}
            </Reveal>
          </section>

          {/* packages */}
          {pkgs.length > 0 && (
            <section style={{ display: active === "packages" ? "block" : "none" }}>
              <SectionHead eyebrow="PRICING" title="Packages" />
              <div className="grid gap-4 sm:grid-cols-2">
                {pkgs.map((k, i) => (
                  <Reveal key={k.id} delay={i * 0.07}>
                    <motion.article whileHover={{ y: -5 }} className={`relative flex h-full flex-col rounded-3xl border p-5 transition-shadow hover:shadow-[0_20px_50px_rgba(196,74,104,.18)] ${pkgId === k.id ? "border-[#C44A68] bg-[#C44A68]/[.06]" : k.is_popular ? "border-[#E0708A] bg-gradient-to-br from-[#FFF1EC] to-[#F9DDE3]/60" : "border-[#C44A68]/15 bg-[#FFFBF8]"}`}>
                      {k.is_popular && <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#E0708A] to-[#C44A68] px-3 py-1 text-[11px] font-bold text-white shadow"><Sparkles className="h-3 w-3" />Popular</span>}
                      <h3 className="font-serif text-xl font-bold text-[#4A1230]">{k.name}</h3>
                      <p className="mt-1 text-2xl font-extrabold text-[#C44A68]">₹{inr(k.price)}</p>
                      {k.description && <p className="mt-2 text-sm text-[#4A3440]/75">{k.description}</p>}
                      <ul className="mt-4 space-y-1.5 text-sm text-[#4A3440]">
                        {k.inclusions.map((inc) => <li key={inc} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C44A68]" />{inc}</li>)}
                      </ul>
                      <button type="button" onClick={() => { setPkgId(pkgId === k.id ? null : k.id); flash(pkgId === k.id ? "Package removed" : `${k.name} selected`); }}
                        className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition ${pkgId === k.id ? "bg-[#C44A68] text-white" : "border border-[#C44A68]/40 text-[#C44A68] hover:bg-[#C44A68]/10"} mt-auto`}>
                        {pkgId === k.id ? "Selected ✓" : "Select this package"}
                      </button>
                    </motion.article>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* portfolio */}
          {shots.length > 0 && (
            <section style={{ display: active === "portfolio" ? "block" : "none" }}>
              <SectionHead eyebrow="THEIR WORK" title={`Portfolio (${shots.length})`} />
              {eventTags.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {["All", ...eventTags].map((t) => (
                    <button key={t} type="button" onClick={() => { setFilter(t); setShowAll(false); }}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${filter === t ? "border-[#C44A68] bg-[#C44A68] text-white" : "border-[#C44A68]/20 bg-[#FFF1EC] text-[#4A3440] hover:border-[#C44A68]/60"}`}>{t}</button>
                  ))}
                </div>
              )}
              <div className="grid auto-rows-[120px] grid-cols-2 gap-2 [grid-auto-flow:dense] sm:auto-rows-[160px] sm:grid-cols-3">
                {visible.map((s, i) => (
                  <motion.button key={s.id} layout type="button" initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                    transition={{ duration: 0.45, delay: (i % 3) * 0.05, ease: EASE }}
                    onClick={() => setLb({ list: shown.map((x) => ({ src: x.image_url, title: x.title || x.event_type })), i })}
                    className={`group relative overflow-hidden rounded-2xl ${i % 7 === 0 ? "col-span-2 row-span-2" : ""}`}>
                    <img src={s.image_url} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#2a0a1a]/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    {s.event_type && <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] text-white backdrop-blur">{s.event_type}</span>}
                  </motion.button>
                ))}
              </div>
              {shown.length > 9 && (
                <div className="mt-5 text-center">
                  <button type="button" onClick={() => setShowAll((v) => !v)} className="rounded-full border border-[#C44A68]/40 px-6 py-2 text-sm font-semibold text-[#C44A68] transition hover:bg-[#C44A68] hover:text-white">
                    {showAll ? "Show fewer" : `View ${shown.length - 9} more`}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* services */}
          {hasServices && (
            <section style={{ display: active === "services" ? "block" : "none" }}>
              <SectionHead eyebrow="WHAT THEY DO" title="Services & specialities" />
              <div className="space-y-6">
                {[
                  { label: "Events they cover", items: p.event_types ?? [] },
                  { label: "Specialties", items: tidy(p.specialties ?? []) },
                  { label: "Languages", items: p.languages ?? [] },
                ].filter((g) => g.items.length > 0).map((g, gi) => (
                  <Reveal key={g.label} delay={gi * 0.08}>
                    <p className="mb-2 text-sm font-semibold text-[#4A3440]/70">{g.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((t, i) => (
                        <motion.span key={t} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.035, duration: 0.35 }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#C44A68]/15 bg-[#F9DDE3] px-3 py-1.5 text-xs font-medium text-[#4A3440]"><Check className="h-3 w-3 text-[#C44A68]" />{t}</motion.span>
                      ))}
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* areas */}
          <section style={{ display: active === "areas" ? "block" : "none" }}>
            <SectionHead eyebrow="WHERE THEY WORK" title="Service areas" />
            <Reveal>
              <p className="mb-3 text-sm text-[#4A3440]/70">Based in <b className="text-[#4A1230]">{home}</b></p>
              <div className="flex flex-wrap gap-2">{cities.map((c) => <Chip key={c}>{c}</Chip>)}</div>
              {p.travels_for_destination && <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C44A68]/10 px-4 py-2 text-sm font-medium text-[#A8385A]"><Plane className="h-4 w-4" />Also travels for destination events</p>}
              {home && (
                <div className="mt-5 overflow-hidden rounded-3xl border border-[#C44A68]/15">
                  <iframe title={`Map of ${home}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full sm:h-72"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(home)}&output=embed`} />
                </div>
              )}
            </Reveal>
          </section>

          {/* availability */}
          <section style={{ display: active === "availability" ? "block" : "none" }}>
            <SectionHead eyebrow="PLAN YOUR DATE" title="Availability" />
            <Reveal>
              <Calendar blocked={blocked} minNotice={p.min_notice_days || 0} value={date} onPick={(d) => { setDate(d); setChecked(false); flash(`${longDate(d)} selected`); }} />
              <p className="mt-3 text-xs text-[#4A3440]/60">Tap a free day to use it in the booking box.</p>
            </Reveal>
          </section>

          {/* reviews */}
          <section style={{ display: active === "reviews" ? "block" : "none" }}>
            <SectionHead eyebrow="WHAT CLIENTS SAY" title={rated ? `Reviews (${p.reviews_count})` : "Reviews"} />
            <ReviewForm
              vendorId={p.user_id}
              vendorName={p.business_name}
              onSaved={(r) => {
                setFetchedReviews((prev) => [r, ...prev.filter((x) => x.id !== r.id)]);
                flash("Thanks! Your review is live");
              }}
            />
            {reviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                <Reveal>
                  <div className="rounded-3xl border border-[#C44A68]/15 bg-[#FFF1EC] p-5 text-center">
                    <p className="font-serif text-5xl font-bold text-[#C44A68]">{avg.toFixed(1)}</p>
                    <div className="mt-1 flex justify-center gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= Math.round(avg) ? "fill-[#E0708A] text-[#E0708A]" : "text-[#C44A68]/25"}`} />)}</div>
                    <div className="mt-4 space-y-1.5">
                      {dist.map(({ s, n }) => (
                        <div key={s} className="flex items-center gap-2 text-[11px] text-[#4A3440]/70">
                          <span className="w-2">{s}</span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F9DDE3]">
                            <motion.span className="block h-full origin-left rounded-full bg-gradient-to-r from-[#E0708A] to-[#C44A68]" initial={{ scaleX: 0 }} whileInView={{ scaleX: reviews.length ? n / reviews.length : 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} />
                          </span>
                          <span className="w-4 text-right">{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
                <ul className="space-y-3">
                  {reviews.map((r, i) => (
                    <Reveal key={r.id} delay={i * 0.05} y={16}>
                      <li className="list-none rounded-2xl border border-[#C44A68]/15 bg-[#FFFBF8] p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2 font-semibold text-[#4A1230]">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#E0708A] to-[#C44A68] text-xs font-bold text-white">{initialsOf(r.author)}</span>{r.author}
                          </span>
                          <span className="flex items-center gap-1 text-[#C44A68]"><Star className="h-3.5 w-3.5 fill-current" />{r.rating.toFixed(1)}</span>
                        </div>
                        {r.text && <p className="mt-2 text-sm leading-relaxed text-[#4A3440]/80">{r.text}</p>}
                        {r.created_at && <p className="mt-2 text-[11px] text-[#4A3440]/50">{new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>}
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </div>
            ) : (
              <Reveal>
                <div className="rounded-3xl border border-dashed border-[#C44A68]/30 bg-white/50 p-8 text-center">
                  <Star className="mx-auto h-7 w-7 text-[#C44A68]/50" />
                  <p className="mt-2 text-sm text-[#4A3440]/70">No reviews yet. Be the first to review {p.business_name}.</p>
                </div>
              </Reveal>
            )}
          </section>

          {/* faq */}
          <section style={{ display: active === "faq" ? "block" : "none" }}>
            <SectionHead eyebrow="GOOD TO KNOW" title="Frequently asked" />
            <div className="space-y-2">
              {faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.05} y={14}>
                  <div className="overflow-hidden rounded-2xl border border-[#C44A68]/15 bg-[#FFFBF8]">
                    <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-[#4A1230]">
                      {f.q}
                      <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} className="text-[#C44A68]"><ChevronDown className="h-4 w-4" /></motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                          <p className="px-4 pb-4 text-sm leading-relaxed text-[#4A3440]/75">{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </div>

        {/* Desktop booking card */}
        <aside className="hidden md:sticky md:top-20 md:block md:self-start">{card}</aside>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-24 left-1/2 z-[150] -translate-x-1/2 rounded-full bg-[#4A1230] px-5 py-2.5 text-sm font-medium text-white shadow-2xl lg:bottom-8">{toast}</motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lb && <Lightbox photos={lb.list} index={lb.i} setIndex={(i) => setLb({ ...lb, i })} onClose={() => setLb(null)} />}
      </AnimatePresence>
      </div>
    </div>
  );
}