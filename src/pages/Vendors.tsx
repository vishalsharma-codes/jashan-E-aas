import { useCallback,useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Search, Star, MapPin, CheckCircle, Clock, Briefcase, ChevronLeft,
  ChevronRight, ChevronDown, X, Heart, Grid2X2, ArrowUpRight, Zap,
  CalendarDays, Camera, Utensils, Flower2, Music2, Building2, Sparkles,
  PartyPopper, Gem, Mic2, Cake, Lightbulb, HandHeart, SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { UpiPaymentModal } from "@/components/UpiPayment";
import { DynamicBackground } from "@/components/DynamicBackground";
import { emptyProfile, type LiveVendor as Vendor, type VendorProfileRow } from "@/lib/vendorOptions";
import { useLiveVendors } from "@/lib/liveVedors";
import { AutoScrollMarquee, type AutoScrollMarqueeHandle } from "@/components/AutoScrollMarquee";
import { VendorProfileView } from "@/components/vendor/VendorProfileView";

/* Blush Peach theme
   plum text #4A1230 / #4A3440 · rose accent #C44A68 · light rose #E0708A / #F4A6B8
   cream surfaces #FFF6F2 / #FFF1EC / #FFFBF8 · soft pink chip #F9DDE3 */

/* ------------------------------------------------------------------ *
 *  HOMEPAGE SECTIONS (you decide which vendor appears where)
 *
 *  "Top Rated Vendors" and "Featured Vendor" are ALWAYS shown on the page.
 *  They stay EMPTY until you assign vendors to them in Supabase.
 *  Every vendor still appears in "All Vendors" and "Browse All Vendors".
 *
 *  Run once in the Supabase SQL editor:
 *     alter table vendors
 *       add column if not exists home_sections text[] not null default '{}',
 *       add column if not exists home_rank     int    not null default 999;
 *
 *  Assign a vendor (home_sections accepts: featured, top_rated, or both):
 *     update vendors set home_sections = '{featured,top_rated}', home_rank = 1 where id = '<vendor-id>';
 *     update vendors set home_sections = '{top_rated}',          home_rank = 2 where id = '<vendor-id>';
 *
 *  Remove a vendor from the sections:
 *     update vendors set home_sections = '{}', home_rank = 999 where id = '<vendor-id>';
 *
 *  Lower home_rank = shown first. The columns are read from `vendor.raw`
 *  (the full DB row). If useLiveVendors maps a column list instead of
 *  select("*"), add both columns there.
 * ------------------------------------------------------------------ */
const SECTION_KEYS = {
  featured: "featured",
  topRated: "top_rated",
} as const;

const getSections = (v: Vendor): string[] => {
  const value = (v as any).raw?.home_sections;
  return Array.isArray(value) ? value : [];
};
const getRank = (v: Vendor): number => {
  const value = Number((v as any).raw?.home_rank);
  return Number.isFinite(value) ? value : 999;
};
const vendorsForSection = (list: Vendor[], key: string) =>
  list
    .filter((v) => getSections(v).includes(key))
    .sort((a, b) => getRank(a) - getRank(b) || b.rating - a.rating);

const SERVICE_CATEGORIES = [
  { label: "All Vendors", icon: Sparkles, match: "All" },
  { label: "Wedding Planner", icon: Gem, match: "Wedding Planner" },
  { label: "Photographer", icon: Camera, match: "Photographer" },
  { label: "Caterer", icon: Utensils, match: "Caterer" },
  { label: "Decorator", icon: Flower2, match: "Decorator" },
  { label: "Bridal Makeup", icon: Sparkles, match: "Bridal Makeup" },
  { label: "DJ Services", icon: Music2, match: "DJ Services" },
  { label: "Live Band", icon: Mic2, match: "Live Band" },
  { label: "Lighting", icon: Lightbulb, match: "Lighting Designer" },
  { label: "Event Manager", icon: CalendarDays, match: "Event Manager" },
  { label: "Venue", icon: Building2, match: "Venue" },
  { label: "Mehendi Artist", icon: HandHeart, match: "Mehendi Artist" },
  { label: "Birthday Planner", icon: Cake, match: "Birthday" },
  { label: "Corporate Events", icon: Briefcase, match: "Corporate" },
  { label: "Entertainment", icon: PartyPopper, match: "Entertainment" },
];

const EVENT_TYPES = [
  { label: "All Events", icon: Grid2X2 },
  { label: "Wedding", icon: Gem },
  { label: "Birthday", icon: Cake },
  { label: "Corporate", icon: Building2 },
  { label: "Engagement", icon: Heart },
  { label: "Haldi", icon: Flower2 },
  { label: "Mehendi", icon: HandHeart },
  { label: "Anniversary", icon: Gem },
  { label: "Baby Shower", icon: Sparkles },
  { label: "Fashion Show", icon: Sparkles },
  { label: "Concert", icon: Music2 },
  { label: "Exhibition", icon: Building2 },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const PHOTO_POOL = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85",
];

const priceNumber = (price: string) => {
  // Understand Indian price labels such as ₹25K, ₹1.5L and ₹600–₹2,200/plate.
  // Sort by the first amount shown in a price range.
  const match = price.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|l|k)?/i);
  if (!match) return 0;

  const amount = Number(match[1]);
  const unit = (match[2] || "").toLowerCase();

  if (unit === "k") return amount * 1_000;
  if (["l", "lakh", "lac"].includes(unit)) return amount * 100_000;
  if (["cr", "crore"].includes(unit)) return amount * 10_000_000;
  return amount;
};

function getVendorImage(vendor: Vendor, index: number) {
  const real = vendor.coverUrls?.[0] || (vendor.portfolio?.[0] as any)?.imageUrl || vendor.logoUrl;
  if (real) return real;
  const category = vendor.category.toLowerCase();
  if (category.includes("photo")) return PHOTO_POOL[1];
  if (category.includes("cater")) return PHOTO_POOL[2];
  if (category.includes("dj") || category.includes("band") || category.includes("music")) return PHOTO_POOL[3 + (index % 3 === 0 ? 0 : 2)];
  if (category.includes("makeup") || category.includes("beauty")) return PHOTO_POOL[4];
  if (category.includes("venue")) return PHOTO_POOL[6];
  if (category.includes("event manager") || category.includes("corporate")) return PHOTO_POOL[7];
  return PHOTO_POOL[index % PHOTO_POOL.length];
}

/** Builds the full public profile the new profile page needs from the card-shaped vendor.
 *  `raw` (the full database row, added in toLiveVendor) wins when it is present. */
function profileFromVendor(v: Vendor): VendorProfileRow {
  const raw = (((v as any).raw ?? {}) as Partial<VendorProfileRow>);
  const base: VendorProfileRow = {
    ...emptyProfile(v.id, v.name),
    category: v.category,
    category_id: v.categoryId,
    subcategory: v.subcategory === v.category ? "" : v.subcategory,
    description: v.description,
    tags: v.tags,
    specialties: v.specialties,
    home_city: v.location,
    cities: v.cities,
    price_min: v.priceMin,
    price_max: v.priceMax,
    years_experience: v.yearsExperience,
    events_completed: v.eventsCompleted,
    response_time: v.responseTime,
    rating: v.rating,
    reviews_count: v.reviews,
    verification_status: v.isVerified ? "verified" : "unverified",
    logo_url: v.logoUrl ?? "",
    cover_urls: v.coverUrls ?? [],
  };
  // ignore null / undefined columns so the defaults above survive
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== null && value !== undefined));
  return { ...base, ...cleaned } as VendorProfileRow;
}

// NOTE: no "relative" here. Callers pass "absolute inset-0", and "relative" would override it
// and collapse the image to zero height (this was why the card photos were blank).
function VendorImage({ vendor, index, className = "" }: { vendor: Vendor; index: number; className?: string }) {
  return (
    <div
      className={`overflow-hidden bg-[#F9DDE3] ${className}`}
      style={{ backgroundImage: `linear-gradient(0deg, rgba(40,10,24,.55), transparent 55%), url("${getVendorImage(vendor, index)}")`, backgroundSize: "cover", backgroundPosition: "center" }}
    />
  );
}

/**
 * One card used everywhere (carousels + grid). Every block has a fixed height
 * and the footer is pinned to the bottom, so all cards come out the same size
 * whether or not a vendor has events, tags or a long price.
 */
function VendorCard({
  vendor,
  index,
  onBook,
  onProfile,
  saved,
  onToggleSaved,
  compact = false,
}: {
  vendor: Vendor;
  index: number;
  onBook: (vendor: Vendor) => void;
  onProfile: (vendor: Vendor) => void;
  saved: boolean;
  onToggleSaved: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.18) }}
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#C44A68]/20 bg-[#FFFBF8] transition-all duration-300 hover:-translate-y-1 hover:border-[#C44A68]/50 hover:shadow-[0_18px_45px_rgba(196,74,104,.22)]"
    >
      {/* same image height on every card */}
      <div className="relative h-36 shrink-0">
        <VendorImage vendor={vendor} index={index} className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
        <button
          type="button"
          aria-label={saved ? "Remove saved vendor" : "Save vendor"}
          onClick={() => onToggleSaved(vendor.id)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur hover:border-[#F4A6B8] hover:text-[#F4A6B8]"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
        {vendor.isVerified && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-[#F4A6B8]/40 bg-black/60 px-2 py-1 text-[10px] font-semibold text-[#F4A6B8] backdrop-blur">
            <CheckCircle className="h-3 w-3" /> Verified
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex min-w-0 items-start gap-2">
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${vendor.gradient} text-xs font-bold text-white`}>
            {vendor.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-[#4A1230] transition-colors group-hover:text-[#C44A68]" title={vendor.name}>{vendor.name}</h3>
            <p className="mt-0.5 truncate text-xs text-[#4A3440]/70">{vendor.category}</p>
          </div>
          {vendor.isVerified && <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-[#C44A68]" />}
        </div>

        {/* rating + city (single line, never wraps) */}
        <div className="mt-3 flex h-4 items-center gap-x-3 overflow-hidden whitespace-nowrap text-[11px] text-[#4A3440]/70">
          <span className="inline-flex shrink-0 items-center gap-1 text-[#C44A68]">
            <Star className="h-3 w-3 fill-current" />
            {vendor.reviews > 0
              ? <><b>{vendor.rating}</b> <span className="text-[#4A3440]/60">({vendor.reviews})</span></>
              : <b>New</b>}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{vendor.location}</span></span>
        </div>

        {/* events + response time: row is ALWAYS rendered at a fixed height */}
        <div className="mt-2 flex h-4 items-center gap-x-3 overflow-hidden whitespace-nowrap text-[11px] text-[#4A3440]/60">
          {vendor.eventsCompleted > 0 && <span className="inline-flex shrink-0 items-center gap-1"><Briefcase className="h-3 w-3" />{vendor.eventsCompleted} events</span>}
          <span className="inline-flex shrink-0 items-center gap-1"><Clock className="h-3 w-3" />{vendor.responseTime}</span>
        </div>

        {/* tags: fixed height, never wraps onto a second line */}
        <div className="mt-3 flex h-6 flex-nowrap gap-1 overflow-hidden">
          {vendor.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="shrink-0 border border-[#C44A68]/10 bg-[#F9DDE3] px-2 py-0.5 text-[10px] font-normal text-[#4A3440]">{tag}</Badge>
          ))}
        </div>

        {/* mt-auto pins the footer to the bottom of the card */}
        <div className="mt-auto border-t border-[#C44A68]/15 pt-3">
          <p className="truncate text-sm font-extrabold text-[#C44A68]" title={vendor.price}>{vendor.price}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onProfile(vendor)} className="h-8 border-[#C44A68]/30 bg-transparent px-2.5 text-[11px] text-[#C44A68] hover:bg-[#C44A68]/10 hover:text-[#A8385A]">View Profile</Button>
            <Button type="button" size="sm" onClick={() => onBook(vendor)} className="h-8 bg-gradient-to-r from-[#E0708A] to-[#C44A68] px-3 text-[11px] font-bold text-white hover:brightness-105"><Zap className="mr-1 h-3 w-3" />Book</Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CarouselSection({
  title, subtitle, items, onBook, onProfile, savedIds, onToggleSaved, onViewAll,
  direction = "right-to-left",
  emptyMessage = "No vendors to show in this section yet.",
}: {
  title: string;
  subtitle: string;
  items: Vendor[];
  onBook: (vendor: Vendor) => void;
  onProfile: (vendor: Vendor) => void;
  savedIds: Set<string>;
  onToggleSaved: (id: string) => void;
  onViewAll: () => void;
  direction?: "right-to-left" | "left-to-right";
  emptyMessage?: string;
}) {
  const marqueeRef = useRef<AutoScrollMarqueeHandle>(null);
  const hasItems = items.length > 0;

  return (
    <section className="mb-7">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-[#4A1230] sm:text-2xl">{title}</h2>
          <p className="mt-1 text-xs text-[#4A3440]/70 sm:text-sm">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onViewAll} className="inline-flex items-center whitespace-nowrap text-xs font-semibold text-[#C44A68] transition hover:text-[#A8385A]">View All <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button>
          {hasItems && (
            <>
              <button type="button" aria-label={`Previous ${title}`} onClick={() => marqueeRef.current?.nudge("left")} className="grid h-8 w-8 place-items-center rounded-full border border-[#C44A68]/50 text-[#C44A68] transition hover:bg-[#C44A68] hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" aria-label={`Next ${title}`} onClick={() => marqueeRef.current?.nudge("right")} className="grid h-8 w-8 place-items-center rounded-full border border-[#C44A68]/50 text-[#C44A68] transition hover:bg-[#C44A68] hover:text-white"><ChevronRight className="h-4 w-4" /></button>
            </>
          )}
        </div>
      </div>

      {hasItems ? (
        <AutoScrollMarquee ref={marqueeRef} speed={40} gap={12} direction={direction} className="-mx-1 px-1 pb-3 pt-1">
          {items.slice(0, 10).map((vendor, index) => (
            // flex => the card stretches to the row height; fixed width => identical to the grid cards
            <div key={`${title}-${vendor.id}`} className="flex w-[265px] shrink-0">
              <VendorCard
                vendor={vendor}
                index={index}
                compact
                onBook={onBook}
                onProfile={onProfile}
                saved={savedIds.has(vendor.id)}
                onToggleSaved={onToggleSaved}
              />
            </div>
          ))}
        </AutoScrollMarquee>
      ) : (
        <div className="flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#C44A68]/30 bg-white/50 p-6 text-center">
          <Sparkles className="h-6 w-6 text-[#C44A68]/60" />
          <p className="mt-2 text-sm text-[#4A3440]/70">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

const Vendors = () => {
  const [searchParams] = useSearchParams();
  const { vendors, loading: vendorsLoading, error: vendorsError } = useLiveVendors();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeEvent, setActiveEvent] = useState("All Events");
  const [sortBy, setSortBy] = useState("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [city, setCity] = useState("All Cities");
  const [minRating, setMinRating] = useState("0");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [bookingVendor, setBookingVendor] = useState<Vendor | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bookedVendorId, setBookedVendorId] = useState<string | null>(null);
  const [profileVendor, setProfileVendor] = useState<Vendor | null>(null);

  const handleBook = (vendor: Vendor) => {
    setProfileVendor(null);
    setBookingVendor(vendor);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setBookedVendorId(bookingVendor?.id ?? null);
    setPaymentOpen(false);
  };

  const toggleSaved = (id: string) => {
    setSavedIds((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = vendors.filter((vendor) => {
      const searchable = [vendor.name, vendor.category, vendor.location, vendor.description, ...vendor.tags].join(" ").toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = activeCategory === "All" || vendor.category.toLowerCase().includes(activeCategory.toLowerCase());
      const matchesCity = city === "All Cities" || vendor.location.toLowerCase().includes(city.toLowerCase());
      const matchesRating = vendor.rating >= Number(minRating);
      const matchesVerified = !verifiedOnly || vendor.isVerified;
      const eventText = `${vendor.category} ${vendor.description} ${vendor.tags.join(" ")}`.toLowerCase();
      const eventKeyword = activeEvent === "All Events" ? "" : activeEvent.toLowerCase();
      const matchesEvent = !eventKeyword || eventText.includes(eventKeyword) ||
        (activeEvent === "Wedding" && /wedding|bridal|mehendi|decor|flor|venue|photograph/.test(eventText)) ||
        (activeEvent === "Engagement" && /wedding|bridal|event|photograph/.test(eventText)) ||
        (activeEvent === "Haldi" && /wedding|bridal|decor|flor|makeup/.test(eventText)) ||
        (activeEvent === "Mehendi" && /mehendi|bridal|wedding/.test(eventText)) ||
        (activeEvent === "Anniversary" && /wedding|event|photograph|decor/.test(eventText)) ||
        (activeEvent === "Baby Shower" && /event|decor|cater|photograph/.test(eventText)) ||
        (activeEvent === "Fashion Show" && /makeup|photograph|lighting|production|event/.test(eventText)) ||
        (activeEvent === "Exhibition" && /corporate|event|production|lighting/.test(eventText));
      return matchesSearch && matchesCategory && matchesCity && matchesRating && matchesVerified && matchesEvent;
    });

    switch (sortBy) {
      case "rating": result = [...result].sort((a, b) => b.rating - a.rating); break;
      case "reviews": result = [...result].sort((a, b) => b.reviews - a.reviews); break;
      case "price-low":
        result = [...result].sort((a, b) => (a.priceMin ?? priceNumber(a.price)) - (b.priceMin ?? priceNumber(b.price)));
        break;
      case "price-high":
        result = [...result].sort((a, b) => (b.priceMin ?? priceNumber(b.price)) - (a.priceMin ?? priceNumber(a.price)));
        break;
      default: result = [...result].sort((a, b) => Number(b.isVerified) - Number(a.isVerified) || b.rating - a.rating);
    }
    return result;
  }, [vendors, searchQuery, activeCategory, activeEvent, city, minRating, verifiedOnly, sortBy]);

  // Curated homepage sections: only vendors you assigned via home_sections (Supabase), ordered by home_rank.
  // The sections are always rendered; they show an empty state until you assign vendors.
  const topRated = useMemo(() => vendorsForSection(vendors, SECTION_KEYS.topRated).slice(0, 10), [vendors]);
  const featuredList = useMemo(() => vendorsForSection(vendors, SECTION_KEYS.featured), [vendors]);
  const featured = featuredList[0]; // the big spotlight card shows the first featured vendor

  // Deep link from /vendors?vendor=<id> (vendor dashboard "View public profile", compare page)
  const wantedVendor = searchParams.get("vendor");
  useEffect(() => {
    if (!wantedVendor) return;
    const match = vendors.find((v) => v.id === wantedVendor);
    if (match) setProfileVendor(match);
  }, [wantedVendor, vendors]);

  // Escape closes the profile; the page behind it stops scrolling while it is open
  useEffect(() => {
    if (!profileVendor) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setProfileVendor(null); };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = previous; };
  }, [profileVendor]);

  const profileRow = useMemo(() => (profileVendor ? profileFromVendor(profileVendor) : null), [profileVendor]);
  const activeFilterCount = Number(city !== "All Cities") + Number(minRating !== "0") + Number(verifiedOnly);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setActiveEvent("All Events");
    setCity("All Cities");
    setMinRating("0");
    setVerifiedOnly(false);
    setSortBy("relevance");
  };

  const categoryItems = SERVICE_CATEGORIES.filter((category) =>
    category.label.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const openAllVendors = () => {
    setActiveCategory("All");
    setActiveEvent("All Events");
    document.getElementById("all-vendors")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#FFF6F2] text-[#4A1230]">
      <DynamicBackground />
      <Navbar />

      <main className="relative z-10 pb-12 pt-20">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="relative mb-4 overflow-hidden rounded-3xl border border-[#C44A68]/20 bg-[#FFF1EC]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(196,74,104,.14),transparent_45%)]" />
            <div className="relative grid min-h-[320px] grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:p-8">
              <div className="z-10">
                <p className="text-[10px] font-bold tracking-[.28em] text-[#C44A68] sm:text-xs">FIND · COMPARE · BOOK</p>
                <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.05] tracking-tight text-[#4A1230] sm:text-5xl xl:text-6xl">
                  Exceptional Vendors<br /><span className="text-[#C44A68]">for Every Celebration</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#4A3440]/70 sm:text-base">
                  From dream weddings to grand corporate events — find verified professionals who make your moments unforgettable.
                </p>
                <form onSubmit={(event) => { event.preventDefault(); openAllVendors(); }} className="mt-5 flex max-w-2xl items-center gap-2 rounded-full border border-[#C44A68]/30 bg-white/70 p-1.5 pl-4 backdrop-blur">
                  <Search className="h-4 w-4 shrink-0 text-[#4A3440]/70" />
                  <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by organiser name, event type, or vendor name..." className="h-10 min-w-0 border-0 bg-transparent text-xs text-[#4A1230] shadow-none placeholder:text-[#4A3440]/50 focus-visible:ring-0 sm:text-sm" />
                  {searchQuery && <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")} className="text-[#4A3440]/70 hover:text-[#4A1230]"><X className="h-4 w-4" /></button>}
                  <Button type="submit" className="h-10 shrink-0 rounded-full bg-gradient-to-r from-[#E0708A] to-[#C44A68] px-5 font-bold text-white hover:brightness-105">Search <Search className="ml-2 h-4 w-4" /></Button>
                </form>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#4A3440]/70 sm:text-xs">
                  <span><b className="text-[#C44A68]">✦</b> Verified Vendors</span>
                  <span><b className="text-[#C44A68]">₹</b> Transparent Pricing</span>
                  <span><b className="text-[#C44A68]">★</b> Real Reviews</span>
                  <span><b className="text-[#C44A68]">✓</b> Secure Booking</span>
                </div>
              </div>
              <div className="grid h-52 grid-cols-[1.35fr_1fr] grid-rows-2 gap-2 sm:h-64 lg:h-[250px]">
                <div className="relative row-span-2 overflow-hidden rounded-2xl border border-[#C44A68]/20">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg,rgba(40,10,24,.6),transparent 60%),url("${PHOTO_POOL[0]}")` }} />
                  <div className="absolute bottom-4 left-4 text-white"><span className="rounded-full border border-[#F4A6B8]/50 bg-black/45 px-3 py-1 text-[10px] text-[#F4A6B8]">EDITOR'S PICK</span><p className="mt-2 font-serif text-lg text-white sm:text-2xl">Moments worth<br />celebrating</p></div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#C44A68]/20 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.15),transparent),url("${PHOTO_POOL[6]}")` }} />
                <div className="overflow-hidden rounded-2xl border border-[#C44A68]/20 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.15),transparent),url("${PHOTO_POOL[3]}")` }} />
              </div>
            </div>
          </section>

          {/* Event type selector */}
          <section className="mb-7 border-b border-[#C44A68]/15 pb-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {EVENT_TYPES.map(({ label, icon: Icon }) => (
                <button key={label} type="button" onClick={() => { setActiveEvent(label); openAllVendors(); }} className={`flex min-w-[76px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-4 py-3 transition-all ${activeEvent === label ? "border-[#E0708A] bg-gradient-to-br from-[#E0708A] to-[#C44A68] text-white shadow-[0_8px_25px_rgba(196,74,104,.25)]" : "border-[#C44A68]/10 bg-[#FFF1EC] text-[#4A3440] hover:border-[#C44A68]/50 hover:text-[#C44A68]"}`}>
                  <Icon className="h-5 w-5" />
                  <span className="whitespace-nowrap text-[11px] font-semibold">{label}</span>
                </button>
              ))}
              <button type="button" onClick={() => setCategoryOpen(true)} aria-label="Browse all vendor categories" className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#C44A68]/60 text-[#C44A68] hover:bg-[#C44A68] hover:text-white"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </section>

          {/* All Vendors carousel (follows the filters above) */}
          <CarouselSection
            title="All Vendors"
            subtitle="Explore our verified vendors across different event types"
            items={filtered.slice(0, 10)}
            onBook={handleBook}
            onProfile={setProfileVendor}
            savedIds={savedIds}
            onToggleSaved={toggleSaved}
            onViewAll={openAllVendors}
            direction="right-to-left"
          />

          {/* Top rated carousel: ALWAYS shown. Only vendors with "top_rated" in home_sections appear; empty until you assign some. */}
          <CarouselSection
            title="Top Rated Vendors"
            subtitle="Handpicked professionals with the highest ratings from our community"
            items={topRated}
            onBook={handleBook}
            onProfile={setProfileVendor}
            savedIds={savedIds}
            onToggleSaved={toggleSaved}
            onViewAll={openAllVendors}
            direction="left-to-right"
            emptyMessage="No top rated vendors have been selected yet. They will appear here soon."
          />

          {/* Featured vendor: ALWAYS shown. First vendor with "featured" in home_sections; empty until you assign one. */}
          <section className="mb-9">
            <div className="mb-3">
              <h2 className="font-serif text-xl font-semibold text-[#4A1230] sm:text-2xl">Featured Vendor</h2>
              <p className="mt-1 text-xs text-[#4A3440]/70 sm:text-sm">Our special partner for this season</p>
            </div>
            {featured ? (
              <div className="grid overflow-hidden rounded-2xl border border-[#C44A68]/20 bg-[#FFFBF8] lg:grid-cols-[1.1fr_1fr]">
                <div className="relative min-h-[220px] lg:min-h-[260px]">
                  <VendorImage vendor={featured} index={0} className="absolute inset-0" />
                  <span className="absolute left-4 top-4 rounded-md bg-gradient-to-r from-[#E0708A] to-[#C44A68] px-3 py-1.5 text-[11px] font-extrabold text-white">✦ Featured Partner</span>
                </div>
                <div className="flex flex-col justify-center p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#4A1230]">{featured.name} {featured.isVerified && <CheckCircle className="inline h-4 w-4 text-[#C44A68]" />}</h3>
                      <p className="mt-1 text-sm text-[#4A3440]/70">{featured.category}</p>
                    </div>
                    <button type="button" aria-label="Save featured vendor" onClick={() => toggleSaved(featured.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#C44A68]/25 text-[#4A3440] hover:border-[#C44A68] hover:text-[#C44A68]"><Heart className={`h-4 w-4 ${savedIds.has(featured.id) ? "fill-rose-500 text-rose-500" : ""}`} /></button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#4A3440]/70">
                    <span className="inline-flex items-center gap-1 text-[#C44A68]"><Star className="h-3.5 w-3.5 fill-current" /> {featured.reviews > 0 ? `${featured.rating} (${featured.reviews})` : "New"}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{featured.location}</span>
                    {featured.eventsCompleted > 0 && <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{featured.eventsCompleted} events</span>}
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.responseTime}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">{featured.tags.slice(0, 4).map((tag) => <Badge key={tag} variant="secondary" className="border border-[#C44A68]/10 bg-[#F9DDE3] text-[10px] text-[#4A3440]">{tag}</Badge>)}</div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#C44A68]/20 pt-4">
                    <span className="text-lg font-extrabold text-[#C44A68]">{featured.price}</span>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setProfileVendor(featured)} className="border-[#C44A68]/40 bg-transparent text-[#C44A68] hover:bg-[#C44A68]/10">View Profile</Button>
                      <Button type="button" onClick={() => handleBook(featured)} className="bg-gradient-to-r from-[#E0708A] to-[#C44A68] font-bold text-white hover:brightness-105">Book Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#C44A68]/30 bg-white/50 p-6 text-center">
                <Sparkles className="h-7 w-7 text-[#C44A68]/60" />
                <p className="mt-2 text-sm text-[#4A3440]/70">No featured vendor has been selected yet. Our season's special partner will appear here soon.</p>
              </div>
            )}
          </section>

          {/* Full directory: EVERY vendor always appears here */}
          <section id="all-vendors" className="scroll-mt-24 border-t border-[#C44A68]/20 pt-7">
            <div className="sticky top-20 z-20 -mx-4 mb-4 flex flex-col gap-4 border-b border-[#C44A68]/20 bg-[#FFF6F2]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
              <div>
                <p className="text-[10px] font-bold tracking-[.25em] text-[#C44A68]">FIND YOUR PERFECT MATCH</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#4A1230] sm:text-3xl">Browse All Vendors</h2>
                <p className="mt-1 text-sm text-[#4A3440]/70">Showing <span className="font-semibold text-[#C44A68]">{filtered.length}</span> of {vendors.length} vendors</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setCategoryOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#C44A68]/20 bg-[#FFF1EC] px-3 py-2 text-sm text-[#4A3440] hover:border-[#C44A68]/50"><Grid2X2 className="h-4 w-4 text-[#C44A68]" /> Categories</button>
                <button type="button" onClick={() => setFilterOpen((open) => !open)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filterOpen || activeFilterCount ? "border-[#C44A68]/50 bg-[#C44A68]/10 text-[#A8385A]" : "border-[#C44A68]/20 bg-[#FFF1EC] text-[#4A3440]"}`}><SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && <span className="rounded-full bg-[#C44A68] px-1.5 text-xs font-bold text-white">{activeFilterCount}</span>}</button>
                <div className="relative">
                  <button type="button" onClick={() => setSortOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg border border-[#C44A68]/20 bg-[#FFF1EC] px-3 py-2 text-sm text-[#4A3440]">Sort: {SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "Relevance"} <ChevronDown className="h-4 w-4" /></button>
                  <AnimatePresence>
                    {sortOpen && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-[#C44A68]/20 bg-[#FFFBF8] shadow-2xl">
                      {SORT_OPTIONS.map((option) => <button type="button" key={option.value} onClick={() => { setSortBy(option.value); setSortOpen(false); }} className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-[#C44A68]/10 ${sortBy === option.value ? "font-semibold text-[#C44A68]" : "text-[#4A3440]"}`}>{option.label}</button>)}
                    </motion.div>}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {filterOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden rounded-2xl border border-[#C44A68]/20 bg-[#FFF1EC] p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="text-xs font-semibold text-[#4A3440]/70">CITY
                    <select value={city} onChange={(event) => setCity(event.target.value)} className="mt-2 block w-full rounded-lg border border-[#C44A68]/20 bg-[#FFFBF8] px-3 py-2.5 text-sm text-[#4A1230] outline-none focus:border-[#C44A68]/60">
                      {["All Cities", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Surat", "Goa", "Kochi"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-[#4A3440]/70">MINIMUM RATING
                    <select value={minRating} onChange={(event) => setMinRating(event.target.value)} className="mt-2 block w-full rounded-lg border border-[#C44A68]/20 bg-[#FFFBF8] px-3 py-2.5 text-sm text-[#4A1230] outline-none focus:border-[#C44A68]/60">
                      <option value="0">All Ratings</option><option value="4.8">4.8+ stars</option><option value="4.5">4.5+ stars</option><option value="4">4.0+ stars</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 self-end rounded-lg border border-[#C44A68]/20 bg-[#FFFBF8] px-3 py-3 text-sm text-[#4A3440]">
                    <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-[#C44A68]" /> Verified vendors only
                  </label>
                  <div className="flex items-end gap-2"><Button type="button" onClick={clearFilters} variant="outline" className="border-[#C44A68]/25 bg-transparent text-[#4A3440] hover:text-[#4A1230]">Clear all</Button><Button type="button" onClick={() => setFilterOpen(false)} className="bg-[#C44A68] font-bold text-white hover:bg-[#A8385A]">Apply</Button></div>
                </div>
              </motion.div>
            )}

            {vendorsLoading ? (
              <div className="rounded-2xl border border-[#C44A68]/20 bg-[#FFFBF8] py-16 text-center text-sm text-[#4A3440]/70">Loading vendors…</div>
            ) : vendorsError ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 py-12 text-center text-sm text-red-700">Could not load vendors: {vendorsError}</div>
            ) : vendors.length === 0 ? (
              <div className="rounded-2xl border border-[#C44A68]/20 bg-[#FFFBF8] py-16 text-center">
                <Search className="mx-auto h-10 w-10 text-[#4A3440]/40" /><h3 className="mt-4 text-lg font-semibold text-[#4A1230]">No vendors have joined yet</h3><p className="mt-1 text-sm text-[#4A3440]/70">Approved vendors will appear here as soon as they go live.</p>
              </div>
            ) : filtered.length ? (
              // Same 265px card width as the carousels; items-stretch + h-full keeps every card the same height
              <div className="grid items-stretch gap-4 [grid-template-columns:repeat(auto-fill,minmax(265px,1fr))]">
                {filtered.map((vendor, index) => (
                  <div key={vendor.id} className="relative h-full">
                    {bookedVendorId === vendor.id && <div className="absolute inset-x-0 top-0 z-20 rounded-t-2xl bg-emerald-600 px-2 py-1 text-center text-xs font-bold text-white">✓ Token paid — booking confirmed</div>}
                    <VendorCard vendor={vendor} index={index} onBook={handleBook} onProfile={setProfileVendor} saved={savedIds.has(vendor.id)} onToggleSaved={toggleSaved} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#C44A68]/20 bg-[#FFFBF8] py-16 text-center">
                <Search className="mx-auto h-10 w-10 text-[#4A3440]/40" /><h3 className="mt-4 text-lg font-semibold text-[#4A1230]">No vendors found</h3><p className="mt-1 text-sm text-[#4A3440]/70">Try changing your search or filters.</p><Button type="button" onClick={clearFilters} className="mt-4 bg-[#C44A68] font-bold text-white hover:bg-[#A8385A]">Clear Filters</Button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* All category popup */}
      <AnimatePresence>
        {categoryOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4A1230]/40 p-3 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setCategoryOpen(false); }}>
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#C44A68]/25 bg-[#FFFBF8] p-5 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[10px] font-bold tracking-[.25em] text-[#C44A68]">FIND YOUR PERFECT TEAM</p><h2 className="mt-2 font-serif text-2xl text-[#4A1230] sm:text-3xl">Explore All Categories</h2><p className="mt-1 text-sm text-[#4A3440]/70">Choose a service to discover the right professionals.</p></div>
                <button type="button" onClick={() => setCategoryOpen(false)} aria-label="Close categories" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#C44A68]/20 text-[#4A3440] hover:border-[#C44A68] hover:text-[#C44A68]"><X className="h-4 w-4" /></button>
              </div>
              <div className="relative mt-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A3440]/60" /><Input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Search categories..." className="border-[#C44A68]/20 bg-[#FFF1EC] pl-10 text-[#4A1230] placeholder:text-[#4A3440]/50" /></div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {categoryItems.map(({ label, icon: Icon, match }) => (
                  <button type="button" key={label} onClick={() => { setActiveCategory(match); setCategoryOpen(false); setCategorySearch(""); document.getElementById("all-vendors")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className={`flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-left transition ${activeCategory === match ? "border-[#C44A68]/70 bg-[#C44A68]/10" : "border-[#C44A68]/15 bg-white/50 hover:border-[#C44A68]/50 hover:bg-[#C44A68]/[.06]"}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${activeCategory === match ? "bg-[#C44A68] text-white" : "bg-[#F9DDE3] text-[#C44A68]"}`}><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block text-xs font-semibold text-[#4A1230] sm:text-sm">{label}</span><span className="mt-1 block text-[10px] text-[#4A3440]/60">{match === "All" ? "Browse every service" : "Explore professionals"}</span></span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#C44A68]/20 pt-4"><p className="text-xs text-[#4A3440]/60">{categoryItems.length} categories available</p><Button type="button" onClick={() => { setActiveCategory("All"); setActiveEvent("All Events"); setCategoryOpen(false); setCategorySearch(""); }} className="bg-gradient-to-r from-[#E0708A] to-[#C44A68] font-bold text-white hover:brightness-105">Show All Vendors</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full vendor profile (replaces the old small popup) */}
      <AnimatePresence>
        {profileVendor && profileRow && (
          <motion.div
            key="vendor-profile"
            data-profile-scroll
            role="dialog"
            aria-label={`${profileVendor.name} profile`}
            className="fixed inset-0 z-[110] overflow-y-auto overscroll-contain bg-[#FFF6F2]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          ><div>
            <div className="sticky top-0 z-30 border-b border-[#C44A68]/15 bg-[#FFF6F2]/95 backdrop-blur">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <button type="button" onClick={() => setProfileVendor(null)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C44A68] hover:text-[#A8385A]">
                  <ChevronLeft className="h-4 w-4" /> Back to vendors
                </button>
                <button type="button" onClick={() => setProfileVendor(null)} aria-label="Close profile" className="grid h-9 w-9 place-items-center rounded-full border border-[#C44A68]/25 text-[#4A3440] hover:border-[#C44A68] hover:text-[#C44A68]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
                        <div className="mx-auto max-w-5xl px-4 py-6">
              <VendorProfileView profile={profileRow} onBook={() => handleBook(profileVendor)} />
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {bookingVendor && (
        <UpiPaymentModal
          isOpen={paymentOpen}
          amount={Math.round(bookingVendor.priceMin * 0.15)}
          description={`Token booking for ${bookingVendor.category}`}
          vendorName={bookingVendor.name}
          phase="Token Payment (15% of base price)"
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentOpen(false)}
        />
      )}

      <Footer />
      <EveBuddy />
    </div>
  );
};

export default Vendors;