import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Quote,
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
import { getFeaturedVendors, getTopRatedVendors } from "@/lib/vendorData";
import { StackSection } from "@/components/StackSection";
import CategoryCarousel from "@/components/CategoryCarousel";
import { HowItWorksTimeline } from "@/components/HowItWorksTimeline";
import { TopRatedStack } from "@/components/TopRatedStack"; // ← NEW
import { StoriesStrip } from "@/components/StoriesStrip";

const featuredVendors = getFeaturedVendors();
const topVendors = getTopRatedVendors();

/* ── Profession themes (matched by keyword in vendor.category) ── */
const professionThemes = [
  { match: /photo|video|cinema|film/i, emoji: "📸", gradient: "from-rose-700 to-pink-900", badge: "bg-rose-100 text-rose-700" },
  { match: /design|decor|floral|light/i, emoji: "🎨", gradient: "from-fuchsia-700 to-purple-900", badge: "bg-fuchsia-100 text-fuchsia-700" },
  { match: /cater|food|chef|cake/i, emoji: "🍛", gradient: "from-orange-600 to-red-900", badge: "bg-orange-100 text-orange-700" },
  { match: /dj|music|band|singer|sound/i, emoji: "🎧", gradient: "from-indigo-600 to-blue-900", badge: "bg-indigo-100 text-indigo-700" },
  { match: /makeup|beauty|mehndi|bridal/i, emoji: "💄", gradient: "from-pink-600 to-rose-900", badge: "bg-pink-100 text-pink-700" },
  { match: /venue|hall|resort|banquet/i, emoji: "🏰", gradient: "from-amber-600 to-yellow-900", badge: "bg-amber-100 text-amber-700" },
  { match: /plan|corporate|manage/i, emoji: "🗂️", gradient: "from-emerald-600 to-teal-900", badge: "bg-emerald-100 text-emerald-700" },
];
const defaultTheme = {
  emoji: "🎉",
  gradient: "from-neutral-600 to-neutral-900",
  badge: "bg-neutral-200 text-neutral-700",
};
const getTheme = (category: string) =>
  professionThemes.find((t) => t.match.test(category)) ?? defaultTheme;

// group vendors by profession so same-work vendors sit together
const sortedFeatured = [...featuredVendors].sort((a, b) =>
  a.category.localeCompare(b.category)
);

const liveActivity = [
  { time: "2 min ago", action: "Wedding booked", vendor: "Royal Celebrations", city: "Mumbai", emoji: "💍" },
  { time: "5 min ago", action: "Payment confirmed", vendor: "Pixel Perfect Studios", city: "Bangalore", emoji: "📸" },
  { time: "9 min ago", action: "Enquiry sent", vendor: "Spice Route Catering", city: "Delhi", emoji: "🍛" },
  { time: "12 min ago", action: "Review posted", vendor: "Sound & Fury DJ", city: "Goa", emoji: "🎧" },
  { time: "18 min ago", action: "Booking confirmed", vendor: "The Grand Band Project", city: "Chennai", emoji: "🎺" },
  { time: "24 min ago", action: "Pre-wedding shoot booked", vendor: "Moments That Last", city: "Jaipur", emoji: "🏯" },
  { time: "31 min ago", action: "Token paid (UPI)", vendor: "Lumiere Light Design", city: "Delhi", emoji: "✨" },
  { time: "45 min ago", action: "Corporate event booked", vendor: "EventCraft Corporate", city: "Bangalore", emoji: "🏢" },
];

const cityData = [
  { city: "Mumbai", events: "4,200+", emoji: "🌊", color: "from-blue-900/60 to-blue-800/40", vendors: 312 },
  { city: "Delhi", events: "3,800+", emoji: "🏛️", color: "from-orange-900/60 to-red-800/40", vendors: 289 },
  { city: "Bangalore", events: "2,900+", emoji: "🌿", color: "from-green-900/60 to-teal-800/40", vendors: 245 },
  { city: "Hyderabad", events: "1,800+", emoji: "🕌", color: "from-purple-900/60 to-violet-800/40", vendors: 178 },
  { city: "Chennai", events: "1,600+", emoji: "🛕", color: "from-amber-900/60 to-orange-800/40", vendors: 156 },
  { city: "Jaipur", events: "1,400+", emoji: "🏯", color: "from-rose-900/60 to-pink-800/40", vendors: 134 },
  { city: "Goa", events: "1,200+", emoji: "🌴", color: "from-cyan-900/60 to-teal-800/40", vendors: 112 },
  { city: "Kolkata", events: "1,100+", emoji: "🎭", color: "from-yellow-900/60 to-amber-800/40", vendors: 98 },
];

/* Add  image: "/images/step1.jpg"  to any step to show a real photo
   instead of the gradient + icon panel. */
const howItWorks = [
  {
    step: "01",
    title: "Tell Us Your Vision",
    desc: "Share your event type, date, location & budget. Our smart matching does the rest.",
    icon: ClipboardPenLine,
  },
  {
    step: "02",
    title: "Browse Curated Vendors",
    desc: "Get a personalised list of verified vendors with portfolios, reviews & pricing.",
    icon: Search,
  },
  {
    step: "03",
    title: "Compare & Connect",
    desc: "Chat directly, request quotes, and compare side-by-side on every metric.",
    icon: MessagesSquare,
  },
  {
    step: "04",
    title: "Book With Confidence",
    desc: "Secure your vendor with our protected booking system & event guarantee.",
    icon: ShieldCheck,
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

const quickLinks = [
  { label: "How It Works", href: "/how-it-works", icon: "🎯" },
  { label: "Trust & Safety", href: "/trust-safety", icon: "🛡️" },
  { label: "Rewards", href: "/rewards", icon: "🎁" },
  { label: "Community", href: "/community", icon: "👥" },
  { label: "Ultra Gold", href: "/ultra-gold", icon: "👑" },
  { label: "Compare Vendors", href: "/compare", icon: "⚖️" },
];

export default function Index() {
  const [demoPayOpen, setDemoPayOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeRef = useRef(0);

  /* ── Featured vendors auto-scroll + active profession detection ── */
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const SPEED = 40; // px per second
    const n = sortedFeatured.length;
    let pos = el.scrollLeft;
    let last = performance.now();
    let raf = 0;

    const detectActive = () => {
      const left = el.getBoundingClientRect().left;
      for (let i = 0; i < el.children.length; i++) {
        const r = (el.children[i] as HTMLElement).getBoundingClientRect();
        // first card whose centre is still on screen
        if (r.left + r.width / 2 > left + 10) {
          const idx = i % n;
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActiveIdx(idx);
          }
          break;
        }
      }
    };

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!pausedRef.current && !reduced) {
        const first = el.children[0] as HTMLElement | undefined;
        const clone = el.children[n] as HTMLElement | undefined;

        if (first && clone) {
          // width of one full set of cards
          const period = clone.offsetLeft - first.offsetLeft;
          pos += SPEED * dt;
          if (pos >= period) pos -= period; // seamless loop
          el.scrollLeft = pos;
        }
      } else {
        pos = el.scrollLeft; // stay in sync while user scrolls / uses arrows
      }
      detectActive();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* 1 ── HERO */}
        <StackSection first className="bg-background">
          <DynamicBackground />
          <Hero />
        </StackSection>

        <div className="relative z-20 bg-black">
          {/* 2 ── CATEGORIES */}
          <CategoryCarousel />

          {/* 3 ── FEATURED VENDORS */}
          <section className="relative overflow-hidden bg-[#E9DFFB] py-28">
            {/* wavy top edge */}
            <svg
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full fill-black"
            >
              <path d="M0,0 H1440 V30 C1260,80 1140,0 960,30 C780,60 660,70 480,40 C300,10 160,60 0,30 Z" />
            </svg>
            {/* wavy bottom edge */}
            <svg
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full -scale-y-100 fill-black"
            >
              <path d="M0,0 H1440 V30 C1260,80 1140,0 960,30 C780,60 660,70 480,40 C300,10 160,60 0,30 Z" />
            </svg>

            <div className="container relative mx-auto px-4">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
                {/* LEFT: big feature card (changes with the profession on screen) */}
                {sortedFeatured[activeIdx] &&
                  (() => {
                    const v = sortedFeatured[activeIdx];
                    const theme = getTheme(v.category);
                    return (
                      <Link
                        to={`/vendors?vendor=${v.id}`}
                        className="group relative flex h-[320px] w-full shrink-0 items-center justify-center overflow-hidden rounded-md lg:h-auto lg:w-[400px]"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={v.category}
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${theme.gradient}`}
                          >
                            <span className="text-8xl opacity-90 transition-transform duration-500 group-hover:scale-110">
                              {theme.emoji}
                            </span>
                          </motion.div>
                        </AnimatePresence>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-black">
                          {v.category}
                        </span>
                        <p className="absolute bottom-4 left-4 font-display text-lg leading-tight text-white">
                          Explore<br />{v.category}
                        </p>
                        <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center bg-white/90 text-black">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    );
                  })()}

                {/* RIGHT: title + auto-scrolling cards */}
                <div className="min-w-0 flex-1">
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
                        onClick={() => scrollRef.current?.scrollBy({ left: -480, behavior: "smooth" })}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => scrollRef.current?.scrollBy({ left: 480, behavior: "smooth" })}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10"
                        aria-label="Next"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>

                  <div
                    ref={scrollRef}
                    onMouseEnter={() => (pausedRef.current = true)}
                    onMouseLeave={() => (pausedRef.current = false)}
                    onTouchStart={() => (pausedRef.current = true)}
                    onTouchEnd={() => setTimeout(() => (pausedRef.current = false), 1500)}
                    className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {[...sortedFeatured, ...sortedFeatured].map((vendor, i) => {
                      const cover = vendor.portfolio[0];
                      const isClone = i >= sortedFeatured.length;
                      const theme = getTheme(vendor.category);
                      return (
                        <div
                          key={`${vendor.id}-${i}`}
                          aria-hidden={isClone}
                          className="w-[220px] shrink-0 rounded-md bg-[#f6f1e7] p-2 text-neutral-900 shadow-lg"
                        >
                          <div
                            className={`relative flex h-[200px] items-center justify-center rounded-sm bg-gradient-to-br ${
                              cover?.gradient ?? vendor.gradient
                            } text-6xl`}
                          >
                            {cover?.emoji}
                            <span
                              className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${theme.badge}`}
                            >
                              <span>{theme.emoji}</span>
                              {vendor.category}
                            </span>
                          </div>
                          <div className="px-1 pb-1 pt-3">
                            <div className="flex items-center gap-1.5">
                              <h3 className="truncate font-display text-sm font-bold">{vendor.name}</h3>
                              {vendor.isVerified && (
                                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                              )}
                            </div>
                            <p className="truncate text-xs text-neutral-500">
                              {vendor.category} · {vendor.location}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span className="font-semibold">{vendor.rating}</span>
                              <span className="text-neutral-500">({vendor.reviews})</span>
                            </div>
                            <p className="mt-2 text-sm font-bold text-amber-700">{vendor.price}</p>
                            <Link
                              to={`/vendors?vendor=${vendor.id}`}
                              draggable={false}
                              tabIndex={isClone ? -1 : 0}
                              className="mt-3 block rounded-sm bg-gold py-2 text-center text-xs font-semibold uppercase tracking-wide text-background hover:bg-gold-dark"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-right">
                    <Link to="/vendors" className="inline-flex items-center text-sm text-gold hover:underline">
                      View All Vendors <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4 ── HOW IT WORKS  (REPLACED: sage-green scroll timeline) */}
          <HowItWorksTimeline steps={howItWorks} quickLinks={quickLinks} />

          {/* 5 ── TOP RATED VENDORS  (REPLACED: sticky tilted stack) */}
          <TopRatedStack vendors={topVendors} />

          {/* 6 ── TESTIMONIALS */}
          <StoriesStrip stories={testimonials} />

          {/* 7 ── LIVE ACTIVITY */}
          <section className="py-14">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <h3 className="font-semibold text-foreground">Live Activity</h3>
                <span className="text-xs text-muted-foreground">Real-time bookings across India</span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {liveActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card border border-border rounded-xl p-3 flex items-start gap-3 hover:border-emerald-500/30 transition-all"
                  >
                    <span className="text-xl mt-0.5">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.vendor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MapPin className="w-2.5 h-2.5" />
                          {item.city}
                        </span>
                        <span className="text-[10px] text-emerald-500">{item.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 8 ── CITY EXPLORER */}
          <section className="py-10">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">Events Everywhere</p>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">
                  Explore by <span className="text-gradient-gold">City</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cityData.map((c, i) => (
                  <motion.div
                    key={c.city}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 18 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                  >
                    <Link
                      to={`/vendors?city=${encodeURIComponent(c.city)}`}
                      className={`block bg-gradient-to-br ${c.color} border border-white/10 rounded-2xl p-5 text-center hover:border-gold/40 transition-all group`}
                    >
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{c.emoji}</div>
                      <h3 className="font-bold text-foreground text-sm mb-1">{c.city}</h3>
                      <p className="text-[11px] text-gold font-medium">{c.events} events</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.vendors} vendors</p>
                    </Link>
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
                className="bg-gradient-to-br from-emerald-950/60 via-card to-teal-950/40 border border-emerald-500/25 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
                      Secured by UPI Escrow
                    </span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                    Pay with <span className="text-emerald-400">Confidence</span>
                  </h2>
                  <p className="text-muted-foreground text-sm mb-5 max-w-md leading-relaxed">
                    All vendor payments are held in escrow and released only after your event is successfully
                    delivered. Every rupee is protected via UPI — instant, traceable, and safe.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    {[
                      { icon: <Zap className="w-4 h-4 text-gold" />, text: "Instant UPI payments" },
                      { icon: <Shield className="w-4 h-4 text-emerald-400" />, text: "Escrow-protected" },
                      { icon: <Clock className="w-4 h-4 text-blue-400" />, text: "Refund in 24h if cancelled" },
                      { icon: <CreditCard className="w-4 h-4 text-purple-400" />, text: "No card needed" },
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
                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 font-semibold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Try Demo Payment
                  </Button>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center gap-3 bg-card border border-emerald-500/20 rounded-2xl p-6 min-w-[200px]">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-3xl">
                    🔒
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground text-sm">UPI Escrow Active</p>
                    <p className="text-xs text-muted-foreground mt-1">8373901813@fam</p>
                    <div className="mt-2 flex items-center gap-1 justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-medium">Always Online</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">₹120 Cr+ processed safely</p>
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
                className="bg-gradient-to-br from-gold/15 via-card to-crimson/10 border border-gold/30 rounded-3xl p-12 text-center"
              >
                <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
                  Ready to Plan Your <span className="text-gradient-gold">Dream Event?</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Join 50,000+ event hosts who trust Jashan-E-Aas to find the best vendors across India. Zero
                  fraud. Every rupee protected.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 bg-gold hover:bg-gold-dark text-background font-semibold text-lg glow-gold"
                  >
                    <Link to="/vendors">Find Vendors Now</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 border-gold/50 hover:bg-gold/10"
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
        vendorName="Royal Celebrations"
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
