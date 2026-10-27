import {  useCallback,useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Zap,
  Shield,
  Clock,
  CreditCard,
  ClipboardPenLine,
  Search,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { RopePull } from "@/components/RopePull";
import { Button } from "@/components/ui/button";
import { UpiPaymentModal } from "@/components/UpiPayment";
import { DynamicBackground } from "@/components/DynamicBackground";
import { useLiveVendors, homeSectionOf, topRatedOf } from "@/lib/liveVedors";
import { StackSection } from "@/components/StackSection";
import CategoryCarousel from "@/components/CategoryCarousel";
import { HowItWorksTimeline } from "@/components/HowItWorksTimeline";
import { TopRatedStack } from "@/components/TopRatedStack";
import { StoriesStrip } from "@/components/StoriesStrip";
import LogoBackground from "@/components/LogoBackground";
import TopRatedSection from "@/components/TopRatedSection";


/* ── Profession themes (matched by keyword in vendor.category) ──
   Softer, warmer gradients so they sit well on the Blush Peach page. */
const professionThemes = [
  { match: /photo|video|cinema|film/i, emoji: "📸", gradient: "from-rose-400 to-pink-600", badge: "bg-rose-100 text-rose-700" },
  { match: /design|decor|floral|light/i, emoji: "🎨", gradient: "from-fuchsia-400 to-purple-600", badge: "bg-fuchsia-100 text-fuchsia-700" },
  { match: /cater|food|chef|cake/i, emoji: "🍛", gradient: "from-orange-400 to-red-500", badge: "bg-orange-100 text-orange-700" },
  { match: /dj|music|band|singer|sound/i, emoji: "🎧", gradient: "from-indigo-400 to-blue-600", badge: "bg-indigo-100 text-indigo-700" },
  { match: /makeup|beauty|mehndi|bridal/i, emoji: "💄", gradient: "from-pink-400 to-rose-600", badge: "bg-pink-100 text-pink-700" },
  { match: /venue|hall|resort|banquet/i, emoji: "🏰", gradient: "from-amber-400 to-orange-600", badge: "bg-amber-100 text-amber-700" },
  { match: /plan|corporate|manage/i, emoji: "🗂️", gradient: "from-emerald-400 to-teal-600", badge: "bg-emerald-100 text-emerald-700" },
];
const defaultTheme = {
  emoji: "🎉",
  gradient: "from-rose-300 to-orange-400",
  badge: "bg-rose-100 text-rose-700",
};
const getTheme = (category: string) =>
  professionThemes.find((t) => t.match.test(category)) ?? defaultTheme;



const COMING_SOON_TINT = "from-[#4A3440]/60 to-[#4A3440]/40";

const cityData: {
  city: string;
  image: string;
  color?: string;
  comingSoon?: boolean;
}[] = [
  { city: "Mumbai", image: "/city/mumbai.jpeg", color: COMING_SOON_TINT, comingSoon: true },
  { city: "Delhi", image: "/city/delhi.jpeg" },
  { city: "Bangalore", image: "/city/bangalore.jpeg", color: COMING_SOON_TINT, comingSoon: true },
  { city: "Hyderabad", image: "/city/hyderabad.jpeg", color: COMING_SOON_TINT, comingSoon: true },
  { city: "Lucknow", image: "/city/lucknow.jpg", color: COMING_SOON_TINT, comingSoon: true },
  { city: "Jaipur", image: "/city/jaipur.jpeg", color: COMING_SOON_TINT, comingSoon: true },
  { city: "Goa", image: "/city/goa.jpeg", color: COMING_SOON_TINT, comingSoon: true },
  { city: "Kolkata", image: "/city/kolkata.jpeg", color: COMING_SOON_TINT, comingSoon: true },
];

const howItWorks = [
  {
    step: "01",
    title: "Tell Us Your Vision",
    desc: "Share your event type, date, location & budget. Our smart matching does the rest.",
    icon: ClipboardPenLine,
    image: "/HowItWorks/vision.jpg",
    imageFit: "cover",
  },
  {
    step: "02",
    title: "Browse Curated Vendors",
    desc: "Get a personalised list of verified vendors with portfolios, reviews & pricing.",
    icon: Search,
    image: "/HowItWorks/vendor.jpg",
    imageFit: "cover",
  },
  {
    step: "03",
    title: "Compare & Connect",
    desc: "Chat directly, request quotes, and compare side-by-side on every metric.",
    icon: MessagesSquare,
    image: "/HowItWorks/compare.jpg",
    imageFit: "cover",
  },
  {
    step: "04",
    title: "Book With Confidence",
    desc: "Secure your vendor with our protected booking system & event guarantee.",
    icon: ShieldCheck,
    image: "/HowItWorks/book.jpg",
    imageFit: "cover",
  },
];

const testimonials = [
  {
    name: "Priya & Arjun Sharma",
    event: "Wedding, Mumbai 2026",
    text: "Jashan-E-Aas found us our dream photographer, decorator AND caterer — all in one afternoon. The whole wedding was flawless. Cannot recommend enough!",
    rating: 5,
    avatar: "PA",
    gradient: "from-rose-600 to-pink-700",
    image: "/testimonials/1.jpg",
  },
  {
    name: "Kavitha Rajan",
    event: "Corporate Gala, Bangalore",
    text: "Organised a 600-person gala for our company in under 2 weeks. The vendor quality was exceptional and EveBuddy saved us hours of back-and-forth.",
    rating: 5,
    avatar: "KR",
    gradient: "from-blue-600 to-indigo-700",
    image: "/testimonials/2.jpg",
  },
  {
    name: "Rohan Mehta",
    event: "College Fest, IIT Bombay",
    text: "We needed 8 different vendors for our tech fest. Jashan-E-Aas got them all coordinated within our student budget. Absolute lifesaver.",
    rating: 5,
    avatar: "RM",
    gradient: "from-emerald-600 to-teal-700",
    image: "/testimonials/3.jpg",
  },
];

const quickLinks: { label: string; href: string; icon: string }[] = [];

/* Wavy edge path + the page cream so the waves blend into the background */
const WAVE =
  "M0,0 H1440 V30 C1260,80 1140,0 960,30 C780,60 660,70 480,40 C300,10 160,60 0,30 Z";
const CREAM = "#FFF6F2";

export default function Index() {
  const navigate = useNavigate();
  const { vendors: liveVendors } = useLiveVendors();
  // Only show vendors explicitly assigned to the "featured" homepage section.
  // homeSectionOf orders them by home_rank, then rating; no fallback vendors are added.
  // Include all vendors assigned to the "featured" homepage section.
  // homeSectionOf keeps them ordered by home_rank, then rating.
  const sortedFeatured = useMemo(
    () => homeSectionOf(liveVendors, "featured"),
    [liveVendors],
  );

  const topVendors = useMemo(() => topRatedOf(liveVendors, 8), [liveVendors]);
  const [demoPayOpen, setDemoPayOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeRef = useRef(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [paused, setPaused] = useState(false);
const featuredCount = sortedFeatured.length;

const goToFeatured = useCallback(
  (i: number) => {
    if (!featuredCount) return;
    const idx = ((i % featuredCount) + featuredCount) % featuredCount; // loops forever
    setActiveIdx(idx);

    const c = scrollRef.current;
    const card = c?.children[idx] as HTMLElement | undefined;
    if (c && card && c.scrollWidth > c.clientWidth + 1) {
      const left =
        c.scrollLeft +
        card.getBoundingClientRect().left -
        c.getBoundingClientRect().left;
      c.scrollTo({ left, behavior: "smooth" });
    }
  },
  [featuredCount],
);

// autoscroll: moves the active card (and the big image) every 4s
useEffect(() => {
  if (featuredCount < 2 || paused) return;
  const t = setTimeout(() => goToFeatured(activeIdx + 1), 4000);
  return () => clearTimeout(t);
}, [featuredCount, paused, activeIdx, goToFeatured]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || sortedFeatured.length < 2) return;

    const SPEED = 32; // px per second; slow enough to read each card
    let direction = 1;
    let last = performance.now();
    let raf = 0;

    const detectActive = () => {
      const container = el.getBoundingClientRect();
      const targetX = container.left + Math.min(container.width * 0.25, 120);
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      Array.from(el.children).forEach((child, index) => {
        const rect = (child as HTMLElement).getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(center - targetX);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex !== activeRef.current) {
        activeRef.current = nearestIndex;
        setActiveIdx(nearestIndex);
      }
    };

    const tick = (now: number) => {
      // Read the current position each frame so manual arrow clicks still work.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);

      if (maxScroll > 0) {
        let next = el.scrollLeft + direction * SPEED * dt;

        // Bounce at either end instead of duplicating vendor cards or stopping.
        if (next >= maxScroll) {
          next = maxScroll;
          direction = -1;
        } else if (next <= 0) {
          next = 0;
          direction = 1;
        }

        el.scrollLeft = next;
      }

      detectActive();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sortedFeatured]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Faint logo overlay across the WHOLE page (above sections, ignores clicks) */}
      <LogoBackground
        variant="depth"
        opacity={0.22}
        className="!z-30 mix-blend-multiply"
      />
      <Navbar />

      <main>
        {/* 1 ── HERO */}
        <StackSection first className="bg-background">
          <DynamicBackground />
          <Hero />
        </StackSection>

        <div className="relative z-20 bg-background">
          {/* 2 ── CATEGORIES */}
          <CategoryCarousel />

          

{/* 3 ── FEATURED VENDORS */}
{sortedFeatured.length > 0 && (
  <section className="relative overflow-hidden bg-[#FFE3D6] py-28">
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full"
      style={{ fill: CREAM }}
    >
      <path d={WAVE} />
    </svg>

    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full -scale-y-100"
      style={{ fill: CREAM }}
    >
      <path d={WAVE} />
    </svg>

    <div className="container relative mx-auto px-4">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">

        {/* LEFT: big image, follows the active card */}
        {(() => {
          const index = Math.min(activeIdx, sortedFeatured.length - 1);
          const v = sortedFeatured[index];
          const theme = getTheme(v.category);

          const cover = v.portfolio?.find((p: any) => p?.imageUrl || p?.image);
          const image =
            cover?.imageUrl || cover?.image || v.coverUrls?.[0] || v.logoUrl;

          return (
            <Link
              to={`/vendors?vendor=${v.id}`}
              className="group relative flex h-[320px] w-full shrink-0 items-center justify-center overflow-hidden rounded-md lg:h-auto lg:min-h-[480px] lg:w-[400px] lg:self-stretch"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${theme.gradient}`}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`${v.name} portfolio`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-8xl opacity-90">{theme.emoji}</span>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-[#4A3440]/85 via-[#4A3440]/10 to-transparent" />

              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#4A3440]">
                {v.category}
              </span>

              <div className="absolute bottom-4 left-4 right-14 text-white">
                <p className="font-display text-xl leading-tight">{v.name}</p>
                <p className="mt-1 text-sm text-white/80">Explore {v.category}</p>
              </div>

              <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center bg-white/90 text-[#C44A68]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })()}

        {/* RIGHT: heading and vendor carousel */}
        <div
          className="min-w-0 flex-1"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex items-end justify-between"
          >
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gold">
                Hand-picked for you
              </p>
              <h2 className="font-display text-3xl text-foreground md:text-4xl">
                Featured <span className="text-gradient-gold">Vendors</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToFeatured(activeIdx - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10"
                aria-label="Previous vendor"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => goToFeatured(activeIdx + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10"
                aria-label="Next vendor"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sortedFeatured.map((vendor, i) => {
              const cover = vendor.portfolio?.find((p: any) => p?.imageUrl || p?.image);
              const theme = getTheme(vendor.category);
              const image =
                cover?.imageUrl || cover?.image || vendor.coverUrls?.[0] || vendor.logoUrl;

              return (
                <div
                  key={vendor.id}
                  onClick={() => goToFeatured(i)}
                  className={`w-[220px] shrink-0 cursor-pointer rounded-md bg-[#FFFBF8] p-2 text-[#4A3440] shadow-[0_8px_24px_-8px_rgba(196,74,104,0.35)] transition ${
                    i === activeIdx ? "ring-2 ring-[#C44A68]" : ""
                  }`}
                >
                  <div
                    className={`relative flex h-[200px] items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br ${cover?.gradient ?? vendor.gradient}`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`${vendor.name} portfolio`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">{cover?.emoji ?? "📸"}</span>
                    )}

                    <span
                      className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${theme.badge}`}
                    >
                      <span>{theme.emoji}</span>
                      {vendor.category}
                    </span>
                  </div>

                  <div className="px-1 pb-1 pt-3">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-display text-sm font-bold">
                        {vendor.name}
                      </h3>
                      {vendor.isVerified && (
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#C44A68]" />
                      )}
                    </div>

                    <p className="truncate text-xs text-[#4A3440]/70">
                      {vendor.category} · {vendor.location}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="font-semibold">{vendor.rating}</span>
                      <span className="text-[#4A3440]/70">({vendor.reviews})</span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-[#C44A68]">
                      {vendor.price}
                    </p>

                    <Link
                      to={`/vendors?vendor=${vendor.id}`}
                      draggable={false}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 block rounded-sm bg-gold py-2 text-center text-xs font-semibold uppercase tracking-wide text-white hover:bg-gold-dark"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-right">
            <Link
              to="/vendors"
              className="inline-flex items-center text-sm text-gold hover:underline"
            >
              View All Vendors
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
)}



          {/* 4 ── HOW IT WORKS */}
          <HowItWorksTimeline steps={howItWorks} quickLinks={quickLinks} />

          {/* 5 ── TOP RATED VENDORS */}
          {topVendors.length > 0 && <TopRatedSection />}

          {/* 6 ── TESTIMONIALS */}
          <StoriesStrip stories={testimonials} />

          {/* 7 ── LIVE ACTIVITY */}
          {/* <section className="py-14">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-6 flex items-center gap-3"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <h3 className="font-semibold text-foreground">Live Activity</h3>
                <span className="text-xs text-muted-foreground">Real-time bookings across India</span>
              </motion.div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {liveActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-emerald-500/40"
                  >
                    <span className="mt-0.5 text-xl">{item.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">{item.action}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.vendor}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5" />
                          {item.city}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-700">{item.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section> */}

          {/* 8 ── CITY EXPLORER */}
          <section className="py-10">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 text-center"
              >
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gold">Events Everywhere</p>
                <h2 className="font-display text-3xl text-foreground md:text-4xl">
                  Explore by <span className="text-gradient-gold">City</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {cityData.map((c, i) => (
                  <motion.div
                    key={c.city}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={c.comingSoon ? undefined : { y: -6, scale: 1.02 }}
                    onClick={c.comingSoon ? undefined : () => navigate(`/vendors?city=${c.city}`)}
                    className={`group relative h-48 overflow-hidden rounded-2xl border border-[#C44A68]/20 ${
                      c.comingSoon ? "cursor-default" : "cursor-pointer hover:border-gold/60"
                    }`}
                  >
                    <img
                      src={c.image}
                      alt={c.city}
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
                        c.comingSoon ? "" : "group-hover:scale-110"
                      }`}
                    />

                    {/* City colour tint (only for coming-soon cards) */}
                    {c.color && <div className={`absolute inset-0 bg-gradient-to-t ${c.color}`} />}

                    {/* Plum fade so the white city name is readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4A3440]/80 via-[#4A3440]/15 to-transparent" />

                    {c.comingSoon && (
                      <div className="pointer-events-none absolute inset-0 bg-[#4A3440]/30" />
                    )}

                    <div className="absolute bottom-0 p-4">
                      <h3 className="font-display text-xl text-white">{c.city}</h3>
                    </div>

                    {c.comingSoon && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-[#C44A68] backdrop-blur">
                        Coming Soon
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 9 ── UPI SECURE PAYMENT */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-8 rounded-3xl border border-emerald-600/25 bg-gradient-to-br from-emerald-100 via-card to-teal-100 p-10 md:flex-row"
              >
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-700" />
                    <span className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                      Secured by UPI Escrow
                    </span>
                  </div>
                  <h2 className="mb-3 font-display text-2xl text-foreground md:text-3xl">
                    Pay with <span className="text-emerald-700">Confidence</span>
                  </h2>
                  <p className="mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    All vendor payments are held in escrow and released only after your event is successfully
                    delivered. Every rupee is protected via UPI — instant, traceable, and safe.
                  </p>
                  <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {[
                      { icon: <Zap className="h-4 w-4 text-gold" />, text: "Instant UPI payments" },
                      { icon: <Shield className="h-4 w-4 text-emerald-700" />, text: "Escrow-protected" },
                      { icon: <Clock className="h-4 w-4 text-blue-600" />, text: "Refund in 24h if cancelled" },
                      { icon: <CreditCard className="h-4 w-4 text-purple-600" />, text: "No card needed" },
                    ].map((f, j) => (
                      <span key={j} className="flex items-center gap-1.5">
                        {f.icon}
                        {f.text}
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={() => setDemoPayOpen(true)}
                    size="lg"
                    className="h-12 bg-emerald-600 px-8 font-semibold text-white hover:bg-emerald-700"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Try Demo Payment
                  </Button>
                </div>

                <div className="flex min-w-[200px] flex-shrink-0 flex-col items-center gap-3 rounded-2xl border border-emerald-600/20 bg-card p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-600/30 bg-emerald-500/10 text-3xl">
                    🔒
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">UPI Escrow Active</p>
                    <p className="mt-1 text-xs text-muted-foreground">8373901813@fam</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-medium text-emerald-700">Always Online</span>
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground">₹120 Cr+ processed safely</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* 10 ── CTA BANNER */}
          <section className="py-10">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-gold/30 bg-gradient-to-br from-[#FFD9C7] via-card to-[#FBD3DC] p-12 text-center"
              >
                <h2 className="mb-4 font-display text-3xl text-foreground md:text-5xl">
                  Ready to Plan Your <span className="text-gradient-gold">Dream Event?</span>
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                  Join 50,000+ event hosts who trust Jashan-E-Aas to find the best vendors across India. Zero
                  fraud. Every rupee protected.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="glow-gold h-14 bg-gold px-8 text-lg font-semibold text-white hover:bg-gold-dark"
                  >
                    <Link to="/vendors">Find Vendors Now</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 border-gold/50 px-8 hover:bg-gold/10"
                  >
                    <Link to="/for-partners">List Your Business</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>

      <UpiPaymentModal
        isOpen={demoPayOpen}
        amount={1}
        description="Demo token booking — Jashan-E-Aas"
        vendorName="Jashan-E-Aas"
        phase="Demo Token Payment (₹1)"
        onSuccess={() => setDemoPayOpen(false)}
        onClose={() => setDemoPayOpen(false)}
      />

      <Footer />
      <EveBuddy />
      <RopePull />
    </div>
  );
}