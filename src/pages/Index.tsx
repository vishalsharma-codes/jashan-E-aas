import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, MapPin, CheckCircle, ArrowRight, Quote, TrendingUp, Zap, Shield, Clock, CreditCard,ClipboardPenLine,
  Search,
  MessagesSquare,
  ShieldCheck, } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { EventCategories } from "@/components/EventCategories";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { RopePull } from "@/components/RopePull";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpiPaymentModal } from "@/components/UpiPayment";
import { DynamicBackground } from "@/components/DynamicBackground";
import { getFeaturedVendors, getTopRatedVendors } from "@/lib/vendorData";

const featuredVendors = getFeaturedVendors();
const topVendors = getTopRatedVendors();

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

const platformStats = [
  { label: "Verified Vendors", value: "12,000+", icon: "✅" },
  { label: "Events Hosted", value: "2.4L+", icon: "🎪" },
  { label: "Cities Covered", value: "50+", icon: "📍" },
  { label: "Happy Clients", value: "50,000+", icon: "😊" },
  { label: "Escrow Processed", value: "₹120 Cr+", icon: "🔒" },
  { label: "Avg Rating", value: "4.9 ⭐", icon: "🌟" },
];

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
  },
  {
    name: "Kavitha Rajan",
    event: "Corporate Gala, Bangalore",
    text: "Organised a 600-person gala for our company in under 2 weeks. The vendor quality was exceptional and EveBuddy saved us hours of back-and-forth.",
    rating: 5,
    avatar: "KR",
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    name: "Rohan Mehta",
    event: "College Fest, IIT Bombay",
    text: "We needed 8 different vendors for our tech fest. Jashan-E-Aas got them all coordinated within our student budget. Absolute lifesaver.",
    rating: 5,
    avatar: "RM",
    gradient: "from-emerald-600 to-teal-700",
  },
];

const trendingSearches = [
  "Wedding Photographers Mumbai", "DJ for Sangeet", "Mehandi Artist Delhi",
  "Destination Wedding Planner", "Corporate Venue Bangalore", "Candid Photography",
  "Theme Birthday Decorator", "Drone Photography", "Live Band for Reception",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      {/* Hero with integrated search */}
      <Hero />

      {/* ── TRUST STATS BAR ─────────────────────────────────
      <section className="py-4 bg-charcoal border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            {[
              { icon: "✅", text: "12,000+ Verified Vendors" },
              { icon: "🔒", text: "Escrow-Protected Payments" },
              { icon: "🤖", text: "AI-Powered EveBuddy" },
              { icon: "⭐", text: "4.9 Avg Rating" },
              { icon: "🛡️", text: "Zero Fraud Guarantee" },
              { icon: "📍", text: "50+ Cities Covered" },
            ].map((s) => (
              <span key={s.text} className="flex items-center gap-1.5 text-muted-foreground">
                <span>{s.icon}</span>
                <span>{s.text}</span>
              </span>
            ))}
          </div>
        </div>
      </section> */}

      {/* Categories */}
      <EventCategories />

      {/* ── FEATURED VENDORS ─────────────────────────────── */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-gold text-sm font-medium uppercase tracking-wider mb-2">Hand-picked for you</p>
              <h2 className="font-display text-3xl md:text-4xl text-foreground">
                Featured <span className="text-gradient-gold">Vendors</span>
              </h2>
            </div>
            <Button asChild variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 hidden sm:flex">
              <Link to="/vendors">View All <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVendors.map((vendor, i) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/50 transition-all group"
              >
                {/* Portfolio strip */}
                <div className="flex gap-1 h-28 overflow-hidden">
                  {vendor.portfolio.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className={`flex-1 bg-gradient-to-br ${p.gradient} flex items-center justify-center text-3xl opacity-80 group-hover:opacity-100 transition-opacity`}
                    >
                      {p.emoji}
                    </div>
                  ))}
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${vendor.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {vendor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-foreground group-hover:text-gold transition-colors truncate">
                          {vendor.name}
                        </h3>
                        {vendor.isVerified && <CheckCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{vendor.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                      <span className="font-semibold">{vendor.rating}</span>
                      <span className="text-muted-foreground">({vendor.reviews})</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />{vendor.location}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {vendor.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gold">{vendor.price}</span>
                    <Button asChild size="sm" className="bg-gold hover:bg-gold-dark text-background">
                      <Link to={`/vendors?vendor=${vendor.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button asChild variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
              <Link to="/vendors">View All Vendors <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-10 bg-charcoal-light/40" id="how">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">Simple. Fast. Reliable.</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              How <span className="text-gradient-gold">Jashan-E-Aas</span> Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="mb-4 flex justify-center">
  <step.icon className="h-8 w-8 text-gold" strokeWidth={1.8} />
</div>
                <div className="text-gold/30 font-bold text-5xl absolute top-4 right-4 font-display leading-none">
                  {step.step}
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 justify-center mt-10">
            {quickLinks.map((ql, i) => (
              <motion.div
                key={ql.label}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={ql.href}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors"
                >
                  <span>{ql.icon}</span>
                  {ql.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP RATED VENDORS STRIP ──────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-gold text-sm font-medium uppercase tracking-wider mb-2">Highest rated</p>
              <h2 className="font-display text-3xl text-foreground">
                Top Rated <span className="text-gradient-gold">This Month</span>
              </h2>
            </div>
          </motion.div>

          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: "max-content" }}>
              {topVendors.map((vendor, i) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-2xl p-4 w-64 flex-shrink-0 hover:border-gold/50 transition-all group"
                >
                  {/* Mini portfolio */}
                  <div className="flex gap-1 h-20 rounded-xl overflow-hidden mb-4">
                    {vendor.portfolio.slice(0, 2).map((p) => (
                      <div key={p.id} className={`flex-1 bg-gradient-to-br ${p.gradient} flex items-center justify-center text-2xl opacity-80`}>
                        {p.emoji}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${vendor.gradient} flex items-center justify-center text-white font-bold text-xs`}>
                      {vendor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground group-hover:text-gold transition-colors truncate">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span className="font-bold">{vendor.rating}</span>
                    </span>
                    <span className="text-gold font-semibold text-xs">{vendor.price.split("–")[0].trim()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING SEARCHES ──────────────────────────────
      <section className="py-12 bg-charcoal-light/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-5"
          >
            <TrendingUp className="w-5 h-5 text-gold" />
            <h3 className="font-semibold text-foreground">Trending right now</h3>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term, i) => (
              <motion.div
                key={term}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/vendors?q=${encodeURIComponent(term)}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-full text-sm text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors group"
                >
                  <TrendingUp className="w-3 h-3 text-crimson group-hover:text-gold transition-colors" />
                  {term}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-10 bg-charcoal-light/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">What our clients say</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              Real Stories, <span className="text-gradient-gold">Real Events</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 relative"
              >
                <Quote className="w-8 h-8 text-gold/20 mb-4" />
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.event}</p>
                  </div>
                  <div className="ml-auto flex">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 text-gold fill-gold" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE ACTIVITY TICKER ────────────────────────── */}
      <section className="py-14 bg-charcoal-light/30">
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
                      <MapPin className="w-2.5 h-2.5" />{item.city}
                    </span>
                    <span className="text-[10px] text-emerald-500">{item.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITY EXPLORER ────────────────────────────────── */}
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

      {/* ── PLATFORM STATS ─────────────────────────────────
      <section className="py-16 bg-gradient-to-br from-gold/8 via-charcoal to-crimson/5 border-y border-gold/15">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {platformStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-3xl">{s.icon}</span>
                <span className="font-display text-2xl font-bold text-gold">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── UPI SECURE PAYMENT CTA ───────────────────────── */}
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
                <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Secured by UPI Escrow</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                Pay with <span className="text-emerald-400">Confidence</span>
              </h2>
              <p className="text-muted-foreground text-sm mb-5 max-w-md leading-relaxed">
                All vendor payments are held in escrow and released only after your event is successfully delivered. Every rupee is protected via UPI — instant, traceable, and safe.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                {[
                  { icon: <Zap className="w-4 h-4 text-gold" />, text: "Instant UPI payments" },
                  { icon: <Shield className="w-4 h-4 text-emerald-400" />, text: "Escrow-protected" },
                  { icon: <Clock className="w-4 h-4 text-blue-400" />, text: "Refund in 24h if cancelled" },
                  { icon: <CreditCard className="w-4 h-4 text-purple-400" />, text: "No card needed" },
                ].map((f, j) => (
                  <span key={j} className="flex items-center gap-1.5">{f.icon}{f.text}</span>
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

            {/* Mini UPI badge */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3 bg-card border border-emerald-500/20 rounded-2xl p-6 min-w-[200px]">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-3xl">🔒</div>
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

      {/* ── CTA BANNER ───────────────────────────────────── */}
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
              Join 50,000+ event hosts who trust Jashan-E-Aas to find the best vendors across India. Zero fraud. Every rupee protected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-14 px-8 bg-gold hover:bg-gold-dark text-background font-semibold text-lg glow-gold">
                <Link to="/vendors">Find Vendors Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 border-gold/50 hover:bg-gold/10">
                <Link to="/for-partners">List Your Business</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo UPI Payment Modal */}
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
