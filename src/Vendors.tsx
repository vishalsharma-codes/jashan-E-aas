import { useMemo, useState } from "react";
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
import { vendors, type Vendor } from "@/lib/vendorData";

const GOLD = "#E9B638";

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
  const match = price.match(/[\d,]+/);
  return match ? Number(match[0].replace(/,/g, "")) : 0;
};

function getVendorImage(vendor: Vendor, index: number) {
  const category = vendor.category.toLowerCase();
  if (category.includes("photo")) return PHOTO_POOL[1];
  if (category.includes("cater")) return PHOTO_POOL[2];
  if (category.includes("dj") || category.includes("band") || category.includes("music")) return PHOTO_POOL[3 + (index % 3 === 0 ? 0 : 2)];
  if (category.includes("makeup") || category.includes("beauty")) return PHOTO_POOL[4];
  if (category.includes("venue")) return PHOTO_POOL[6];
  if (category.includes("event manager") || category.includes("corporate")) return PHOTO_POOL[7];
  return PHOTO_POOL[index % PHOTO_POOL.length];
}

function VendorImage({ vendor, index, className = "" }: { vendor: Vendor; index: number; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-zinc-900 ${className}`}
      style={{ backgroundImage: `linear-gradient(0deg, rgba(4,8,10,.65), transparent 55%), url("${getVendorImage(vendor, index)}")`, backgroundSize: "cover", backgroundPosition: "center" }}
    />
  );
}

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
      className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1317] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-[0_18px_45px_rgba(0,0,0,.28)]"
    >
      <div className={`relative ${compact ? "h-32" : "h-36"}`}>
        <VendorImage vendor={vendor} index={index} className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
        <button
          type="button"
          aria-label={saved ? "Remove saved vendor" : "Save vendor"}
          onClick={() => onToggleSaved(vendor.id)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur hover:border-amber-300 hover:text-amber-300"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
        {vendor.isVerified && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-black/65 px-2 py-1 text-[10px] font-semibold text-amber-300 backdrop-blur">
            <CheckCircle className="h-3 w-3" /> Verified
          </span>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex min-w-0 items-start gap-2">
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${vendor.gradient} text-xs font-bold text-white`}>
            {vendor.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-white transition-colors group-hover:text-amber-300">{vendor.name}</h3>
            <p className="mt-0.5 truncate text-xs text-zinc-400">{vendor.category}</p>
          </div>
          {vendor.isVerified && <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-amber-400" />}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-current" /> <b>{vendor.rating}</b> <span className="text-zinc-500">({vendor.reviews})</span></span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{vendor.location}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{vendor.eventsCompleted} events</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{vendor.responseTime}</span>
        </div>

        <div className="mt-3 flex min-h-6 flex-wrap gap-1">
          {vendor.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="border border-white/5 bg-[#20282d] px-2 py-0.5 text-[10px] font-normal text-zinc-300">{tag}</Badge>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
          <span className="text-sm font-extrabold text-amber-300">{vendor.price}</span>
          <div className="flex items-center gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={() => onProfile(vendor)} className="h-8 border-amber-400/30 bg-transparent px-2.5 text-[11px] text-amber-300 hover:bg-amber-300/10 hover:text-amber-200">View Profile</Button>
            <Button type="button" size="sm" onClick={() => onBook(vendor)} className="h-8 bg-gradient-to-r from-amber-300 to-yellow-500 px-3 text-[11px] font-bold text-zinc-950 hover:brightness-105"><Zap className="mr-1 h-3 w-3" />Book</Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CarouselSection({
  title,
  subtitle,
  items,
  onBook,
  onProfile,
  savedIds,
  onToggleSaved,
  onViewAll,
}: {
  title: string;
  subtitle: string;
  items: Vendor[];
  onBook: (vendor: Vendor) => void;
  onProfile: (vendor: Vendor) => void;
  savedIds: Set<string>;
  onToggleSaved: (id: string) => void;
  onViewAll: () => void;
}) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const visible = items.length > 0 ? [...items.slice(scrollIndex), ...items.slice(0, scrollIndex)] : [];
  const shift = (dir: number) => setScrollIndex((current) => items.length ? (current + dir + items.length) % items.length : 0);

  return (
    <section className="mb-7">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onViewAll} className="hidden text-xs font-semibold text-amber-300 transition hover:text-amber-200 sm:block">View All <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button>
          <button type="button" aria-label={`Previous ${title}`} onClick={() => shift(-1)} className="grid h-8 w-8 place-items-center rounded-full border border-amber-400/50 text-amber-300 transition hover:bg-amber-300 hover:text-black"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" aria-label={`Next ${title}`} onClick={() => shift(1)} className="grid h-8 w-8 place-items-center rounded-full border border-amber-400/50 text-amber-300 transition hover:bg-amber-300 hover:text-black"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      {items.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {visible.slice(0, 6).map((vendor, index) => (
            <VendorCard key={`${title}-${vendor.id}`} vendor={vendor} index={index} compact onBook={onBook} onProfile={onProfile} saved={savedIds.has(vendor.id)} onToggleSaved={onToggleSaved} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[.02] p-6 text-sm text-zinc-400">No vendors to show in this section yet.</div>
      )}
    </section>
  );
}

const Vendors = () => {
  const [searchParams] = useSearchParams();
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
      case "price-low": result = [...result].sort((a, b) => priceNumber(a.price) - priceNumber(b.price)); break;
      case "price-high": result = [...result].sort((a, b) => priceNumber(b.price) - priceNumber(a.price)); break;
      default: result = [...result].sort((a, b) => Number(b.isVerified) - Number(a.isVerified) || b.rating - a.rating);
    }
    return result;
  }, [searchQuery, activeCategory, activeEvent, city, minRating, verifiedOnly, sortBy]);

  const topRated = useMemo(() => [...vendors].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 12), []);
  const featured = vendors.find((vendor) => vendor.isVerified) ?? vendors[0];
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
    <div className="min-h-screen overflow-x-hidden bg-[#080d10] text-white">
      <DynamicBackground />
      <Navbar />

      <main className="relative z-10 pb-12 pt-20">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="relative mb-4 overflow-hidden rounded-3xl border border-white/10 bg-[#0a1013]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(188,122,25,.18),transparent_45%)]" />
            <div className="relative grid min-h-[320px] grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:p-8">
              <div className="z-10">
                <p className="text-[10px] font-bold tracking-[.28em] text-amber-300 sm:text-xs">FIND · COMPARE · BOOK</p>
                <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl">
                  Exceptional Vendors<br /><span className="text-amber-300">for Every Celebration</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                  From dream weddings to grand corporate events — find verified professionals who make your moments unforgettable.
                </p>
                <form onSubmit={(event) => { event.preventDefault(); openAllVendors(); }} className="mt-5 flex max-w-2xl items-center gap-2 rounded-full border border-white/25 bg-black/35 p-1.5 pl-4 backdrop-blur">
                  <Search className="h-4 w-4 shrink-0 text-zinc-300" />
                  <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by organiser name, event type, or vendor name..." className="h-10 min-w-0 border-0 bg-transparent text-xs text-white shadow-none placeholder:text-zinc-500 focus-visible:ring-0 sm:text-sm" />
                  {searchQuery && <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-white"><X className="h-4 w-4" /></button>}
                  <Button type="submit" className="h-10 shrink-0 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 px-5 font-bold text-black hover:brightness-105">Search <Search className="ml-2 h-4 w-4" /></Button>
                </form>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-400 sm:text-xs">
                  <span><b className="text-amber-300">✦</b> Verified Vendors</span>
                  <span><b className="text-amber-300">₹</b> Transparent Pricing</span>
                  <span><b className="text-amber-300">★</b> Real Reviews</span>
                  <span><b className="text-amber-300">✓</b> Secure Booking</span>
                </div>
              </div>
              <div className="grid h-52 grid-cols-[1.35fr_1fr] grid-rows-2 gap-2 sm:h-64 lg:h-[250px]">
                <div className="relative row-span-2 overflow-hidden rounded-2xl border border-white/10">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.5),transparent 60%),url("${PHOTO_POOL[0]}")` }} />
                  <div className="absolute bottom-4 left-4"><span className="rounded-full border border-amber-300/40 bg-black/45 px-3 py-1 text-[10px] text-amber-200">EDITOR'S PICK</span><p className="mt-2 font-serif text-lg sm:text-2xl">Moments worth<br />celebrating</p></div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.2),transparent),url("${PHOTO_POOL[6]}")` }} />
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.2),transparent),url("${PHOTO_POOL[3]}")` }} />
              </div>
            </div>
          </section>

          {/* Event type selector */}
          <section className="mb-7 border-b border-white/8 pb-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {EVENT_TYPES.map(({ label, icon: Icon }) => (
                <button key={label} type="button" onClick={() => { setActiveEvent(label); openAllVendors(); }} className={`flex min-w-[76px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-4 py-3 transition-all ${activeEvent === label ? "border-amber-300 bg-gradient-to-br from-amber-300 to-yellow-500 text-black shadow-[0_8px_25px_rgba(234,179,8,.15)]" : "border-white/5 bg-[#10171b] text-zinc-300 hover:border-amber-300/50 hover:text-amber-200"}`}>
                  <Icon className="h-5 w-5" />
                  <span className="whitespace-nowrap text-[11px] font-semibold">{label}</span>
                </button>
              ))}
              <button type="button" onClick={() => setCategoryOpen(true)} aria-label="Browse all vendor categories" className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-amber-300/60 text-amber-300 hover:bg-amber-300 hover:text-black"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </section>

          {/* All Vendors carousel */}
          <CarouselSection
            title="All Vendors"
            subtitle="Explore our verified vendors across different event types"
            items={filtered.slice(0, 18)}
            onBook={handleBook}
            onProfile={setProfileVendor}
            savedIds={savedIds}
            onToggleSaved={toggleSaved}
            onViewAll={openAllVendors}
          />

          {/* Top rated carousel */}
          <CarouselSection
            title="Top Rated Vendors"
            subtitle="Handpicked professionals with the highest ratings from our community"
            items={topRated}
            onBook={handleBook}
            onProfile={setProfileVendor}
            savedIds={savedIds}
            onToggleSaved={toggleSaved}
            onViewAll={openAllVendors}
          />

          {/* Featured vendor */}
          {featured && (
            <section className="mb-9">
              <div className="mb-3">
                <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">Featured Vendor</h2>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Our special partner for this season</p>
              </div>
              <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-[#0d1317] lg:grid-cols-[1.1fr_1fr]">
                <div className="relative min-h-[220px] lg:min-h-[260px]">
                  <VendorImage vendor={featured} index={0} className="absolute inset-0" />
                  <span className="absolute left-4 top-4 rounded-md bg-gradient-to-r from-amber-300 to-yellow-500 px-3 py-1.5 text-[11px] font-extrabold text-black">✦ Featured Partner</span>
                </div>
                <div className="flex flex-col justify-center p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{featured.name} {featured.isVerified && <CheckCircle className="inline h-4 w-4 text-amber-300" />}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{featured.category}</p>
                    </div>
                    <button type="button" aria-label="Save featured vendor" onClick={() => toggleSaved(featured.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-zinc-300 hover:border-amber-300 hover:text-amber-300"><Heart className={`h-4 w-4 ${savedIds.has(featured.id) ? "fill-rose-500 text-rose-500" : ""}`} /></button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3.5 w-3.5 fill-current" /> {featured.rating} ({featured.reviews})</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{featured.location}</span>
                    <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{featured.eventsCompleted} events</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.responseTime}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">{featured.tags.slice(0, 4).map((tag) => <Badge key={tag} variant="secondary" className="border border-white/5 bg-[#20282d] text-[10px] text-zinc-200">{tag}</Badge>)}</div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="text-lg font-extrabold text-amber-300">{featured.price}</span>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setProfileVendor(featured)} className="border-amber-300/40 bg-transparent text-amber-300 hover:bg-amber-300/10">View Profile</Button>
                      <Button type="button" onClick={() => handleBook(featured)} className="bg-gradient-to-r from-amber-300 to-yellow-500 font-bold text-black hover:brightness-105">Book Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Full directory */}
          <section id="all-vendors" className="scroll-mt-24 border-t border-white/10 pt-7">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[.25em] text-amber-300">FIND YOUR PERFECT MATCH</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-white sm:text-3xl">Browse All Vendors</h2>
                <p className="mt-1 text-sm text-zinc-400">Showing <span className="font-semibold text-amber-300">{filtered.length}</span> of {vendors.length} vendors</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setCategoryOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#11181c] px-3 py-2 text-sm text-zinc-200 hover:border-amber-300/50"><Grid2X2 className="h-4 w-4 text-amber-300" /> Categories</button>
                <button type="button" onClick={() => setFilterOpen((open) => !open)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filterOpen || activeFilterCount ? "border-amber-300/50 bg-amber-300/10 text-amber-200" : "border-white/10 bg-[#11181c] text-zinc-200"}`}><SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && <span className="rounded-full bg-amber-300 px-1.5 text-xs font-bold text-black">{activeFilterCount}</span>}</button>
                <div className="relative">
                  <button type="button" onClick={() => setSortOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#11181c] px-3 py-2 text-sm text-zinc-200">Sort: {SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "Relevance"} <ChevronDown className="h-4 w-4" /></button>
                  <AnimatePresence>
                    {sortOpen && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#11181c] shadow-2xl">
                      {SORT_OPTIONS.map((option) => <button type="button" key={option.value} onClick={() => { setSortBy(option.value); setSortOpen(false); }} className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 ${sortBy === option.value ? "text-amber-300" : "text-zinc-300"}`}>{option.label}</button>)}
                    </motion.div>}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {filterOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-[#10171b] p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="text-xs font-semibold text-zinc-400">CITY
                    <select value={city} onChange={(event) => setCity(event.target.value)} className="mt-2 block w-full rounded-lg border border-white/10 bg-[#080d10] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/60">
                      {["All Cities", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Surat", "Goa", "Kochi"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-zinc-400">MINIMUM RATING
                    <select value={minRating} onChange={(event) => setMinRating(event.target.value)} className="mt-2 block w-full rounded-lg border border-white/10 bg-[#080d10] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/60">
                      <option value="0">All Ratings</option><option value="4.8">4.8+ stars</option><option value="4.5">4.5+ stars</option><option value="4">4.0+ stars</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 self-end rounded-lg border border-white/10 bg-[#080d10] px-3 py-3 text-sm text-zinc-200">
                    <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-amber-400" /> Verified vendors only
                  </label>
                  <div className="flex items-end gap-2"><Button type="button" onClick={clearFilters} variant="outline" className="border-white/15 bg-transparent text-zinc-300 hover:text-white">Clear all</Button><Button type="button" onClick={() => setFilterOpen(false)} className="bg-amber-300 font-bold text-black hover:bg-amber-200">Apply</Button></div>
                </div>
              </motion.div>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-zinc-500">Category:</span>
              {SERVICE_CATEGORIES.slice(0, 8).map((category) => <button type="button" key={category.label} onClick={() => setActiveCategory(category.match)} className={`rounded-full border px-3 py-1.5 text-xs transition ${activeCategory === category.match ? "border-amber-300 bg-amber-300 text-black" : "border-white/10 bg-[#10171b] text-zinc-300 hover:border-amber-300/50"}`}>{category.label}</button>)}
              <button type="button" onClick={() => setCategoryOpen(true)} className="rounded-full border border-amber-300/30 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10">More categories +</button>
              {(activeCategory !== "All" || activeEvent !== "All Events" || searchQuery || activeFilterCount > 0) && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-rose-300 hover:bg-rose-400/10"><X className="h-3 w-3" /> Clear</button>}
            </div>

            {filtered.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((vendor, index) => (
                  <div key={vendor.id} className="relative">
                    {bookedVendorId === vendor.id && <div className="absolute inset-x-0 top-0 z-20 rounded-t-2xl bg-emerald-600 px-2 py-1 text-center text-xs font-bold text-white">✓ Token paid — booking confirmed</div>}
                    <VendorCard vendor={vendor} index={index} onBook={handleBook} onProfile={setProfileVendor} saved={savedIds.has(vendor.id)} onToggleSaved={toggleSaved} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#0d1317] py-16 text-center">
                <Search className="mx-auto h-10 w-10 text-zinc-600" /><h3 className="mt-4 text-lg font-semibold">No vendors found</h3><p className="mt-1 text-sm text-zinc-400">Try changing your search or filters.</p><Button type="button" onClick={clearFilters} className="mt-4 bg-amber-300 font-bold text-black hover:bg-amber-200">Clear Filters</Button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* All category popup */}
      <AnimatePresence>
        {categoryOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setCategoryOpen(false); }}>
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-amber-300/25 bg-[#0c1216] p-5 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[10px] font-bold tracking-[.25em] text-amber-300">FIND YOUR PERFECT TEAM</p><h2 className="mt-2 font-serif text-2xl text-white sm:text-3xl">Explore All Categories</h2><p className="mt-1 text-sm text-zinc-400">Choose a service to discover the right professionals.</p></div>
                <button type="button" onClick={() => setCategoryOpen(false)} aria-label="Close categories" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-zinc-300 hover:border-amber-300 hover:text-amber-300"><X className="h-4 w-4" /></button>
              </div>
              <div className="relative mt-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><Input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Search categories..." className="border-white/10 bg-[#131b20] pl-10 text-white placeholder:text-zinc-500" /></div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {categoryItems.map(({ label, icon: Icon, match }) => (
                  <button type="button" key={label} onClick={() => { setActiveCategory(match); setCategoryOpen(false); setCategorySearch(""); document.getElementById("all-vendors")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className={`flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-left transition ${activeCategory === match ? "border-amber-300/70 bg-amber-300/10" : "border-white/8 bg-white/[.025] hover:border-amber-300/50 hover:bg-amber-300/[.06]"}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${activeCategory === match ? "bg-amber-300 text-black" : "bg-[#20282d] text-amber-300"}`}><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block text-xs font-semibold text-white sm:text-sm">{label}</span><span className="mt-1 block text-[10px] text-zinc-500">{match === "All" ? "Browse every service" : "Explore professionals"}</span></span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><p className="text-xs text-zinc-500">{categoryItems.length} categories available</p><Button type="button" onClick={() => { setActiveCategory("All"); setActiveEvent("All Events"); setCategoryOpen(false); setCategorySearch(""); }} className="bg-gradient-to-r from-amber-300 to-yellow-500 font-bold text-black hover:brightness-105">Show All Vendors</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor profile modal */}
      <AnimatePresence>
        {profileVendor && (
          <motion.div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileVendor(null); }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d1317]">
              <div className="relative h-56"><VendorImage vendor={profileVendor} index={0} className="absolute inset-0" /><button type="button" onClick={() => setProfileVendor(null)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"><X className="h-4 w-4" /></button><span className="absolute bottom-4 left-5 rounded-full bg-black/65 px-3 py-1 text-xs text-amber-300">{profileVendor.isVerified ? "✓ Platform Verified" : "Vendor Profile"}</span></div>
              <div className="p-5 sm:p-6"><h2 className="text-2xl font-bold text-white">{profileVendor.name}</h2><p className="mt-1 text-sm text-zinc-400">{profileVendor.category} · {profileVendor.location}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-300"><span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3.5 w-3.5 fill-current" /> {profileVendor.rating} ({profileVendor.reviews} reviews)</span><span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {profileVendor.eventsCompleted} events</span><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Replies {profileVendor.responseTime}</span></div><p className="mt-4 text-sm leading-6 text-zinc-300">{profileVendor.description}</p><div className="mt-4 flex flex-wrap gap-2">{profileVendor.tags.map((tag) => <Badge key={tag} variant="secondary" className="bg-[#20282d] text-zinc-200">{tag}</Badge>)}</div><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5"><div><p className="text-xs text-zinc-500">Starting package</p><p className="mt-1 text-xl font-extrabold text-amber-300">{profileVendor.price}</p></div><Button type="button" onClick={() => handleBook(profileVendor)} className="bg-gradient-to-r from-amber-300 to-yellow-500 font-bold text-black hover:brightness-105"><Zap className="mr-2 h-4 w-4" /> Book This Vendor</Button></div></div>
            </motion.div>
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
