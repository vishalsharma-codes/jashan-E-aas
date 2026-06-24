import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Star, Zap, Globe, Target, Clock, AlertTriangle, DollarSign } from "lucide-react";

const steps = [
  {
    num: "01",
    label: "TELL",
    title: "Tell Us Your Vision",
    tagline: "Book confidently. Tell us everything.",
    desc: "Share your event type, date, city & budget in 2 minutes. EveBuddy listens like a best friend who happens to know every vendor in India.",
    customerFear: "What if no one understands what I want?",
    platformResponse: "EveBuddy asks the right questions, understands cultural nuances, and remembers every detail.",
    icon: "✍️",
    color: "from-gold/30 to-gold/5",
    accent: "text-gold",
    animation: "confetti",
  },
  {
    num: "02",
    label: "DISCOVER",
    title: "Discover Perfect Vendors",
    tagline: "Find them. Vet them. Compare them.",
    desc: "Get a personalised list of verified vendors with full portfolios, real reviews & transparent pricing. Every vendor is background-checked.",
    customerFear: "What if I pick the wrong vendor?",
    platformResponse: "Our verification system checks ID, business registration, and references. You see their real work, real reviews.",
    icon: "🔍",
    color: "from-crimson/30 to-crimson/5",
    accent: "text-crimson",
    animation: "search",
  },
  {
    num: "03",
    label: "CONNECT",
    title: "Connect & Negotiate",
    tagline: "Chat, call, compare — on your terms.",
    desc: "Video call vendors directly, request quotes, compare proposals side-by-side. EveBuddy tells you if a price is fair.",
    customerFear: "What if a vendor overcharges me?",
    platformResponse: "EveBuddy has data on thousands of bookings. She flags high quotes and suggests fair alternatives.",
    icon: "💬",
    color: "from-blue-500/20 to-blue-500/5",
    accent: "text-blue-400",
    animation: "chat",
  },
  {
    num: "04",
    label: "CELEBRATE",
    title: "Book & Celebrate",
    tagline: "Pay in safe phases. Celebrate freely.",
    desc: "Pay in secure phases — your money is held safely until your vendor delivers. On your event day, everything runs like it was always going to be perfect.",
    customerFear: "What if I pay and the vendor disappears?",
    platformResponse: "Every rupee is held in escrow. Vendors only receive payment when milestones are met. Zero fraud, guaranteed.",
    icon: "🎉",
    color: "from-emerald-500/20 to-emerald-500/5",
    accent: "text-emerald-400",
    animation: "celebrate",
  },
];

const eveFeatureCards = [
  {
    front: { icon: "🎯", text: "'I'll plan your entire budget'" },
    back: "Tell Eve your total budget + what you need. She'll split it into 4–5 smart plans and show you real vendors in each price range. You pick what feels right.",
  },
  {
    front: { icon: "📞", text: "'I'll find AND contact vendors for you'" },
    back: "In Agent Mode, Eve searches vendors, sends inquiries, collects quotes, compares them, and schedules your meetings — you just approve the final choices.",
  },
  {
    front: { icon: "📅", text: "'I'll remind you so you forget nothing'" },
    back: "From the moment you book your first vendor, Eve creates a 60-day countdown checklist with daily reminders so nothing falls through the cracks.",
  },
  {
    front: { icon: "🆘", text: "'Vendor cancelled? I'll fix it in hours'" },
    back: "If a vendor cancels close to your event, Eve immediately finds available replacements, contacts them urgently, and presents you confirmed alternatives — no panic needed.",
  },
  {
    front: { icon: "💰", text: "'I know fair prices. I'll protect you.'" },
    back: "Eve has data on thousands of bookings. She flags if a quote seems too high and suggests alternatives so you never overpay.",
  },
  {
    front: { icon: "🌐", text: "'I speak your language'" },
    back: "Eve speaks Hindi, Punjabi, Tamil, Bengali, Telugu, Marathi, and more. Plan your event in the language you are most comfortable in.",
  },
];

function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  if (isInView && count < value) {
    const step = Math.ceil(value / 60);
    setTimeout(() => setCount(Math.min(count + step, value)), 16);
  }

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-gold tabular-nums">
        {count.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1 max-w-[140px] mx-auto">{label}</div>
    </div>
  );
}

function FlipCard({ card }: { card: typeof eveFeatureCards[0] }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="relative h-40 cursor-pointer"
      style={{ perspective: "800px" }}
      onClick={() => setFlipped(!flipped)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full relative"
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-card border border-gold/20 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-4xl">{card.front.icon}</span>
          <p className="text-sm font-semibold text-center text-gold">{card.front.text}</p>
          <span className="text-xs text-muted-foreground">— EveBuddy</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-2xl flex items-center justify-center p-5"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-sm text-center text-foreground leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 70%)"
        }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4">
          <p className="text-gold text-sm uppercase tracking-widest mb-3 font-medium">Why Jashan-E-Aas</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">
            We turn <span className="text-gradient-gold">event stress</span><br />into event joy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            India's most trusted event marketplace. 12,000+ verified vendors, zero fraud, and an AI assistant that works harder than anyone you've ever hired.
          </p>
        </motion.div>
      </section>

      {/* 4-Step Psychology Flow */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col md:flex-row gap-8 items-center mb-16 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
            >
              {/* Visual side */}
              <div className={`flex-1 rounded-3xl bg-gradient-to-br ${step.color} border border-white/5 p-10 flex flex-col items-center justify-center min-h-56`}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                  className="text-8xl mb-4"
                >
                  {step.icon}
                </motion.div>
                <div className={`text-7xl font-bold opacity-20 font-display ${step.accent}`}>{step.num}</div>
              </div>

              {/* Text side */}
              <div className="flex-1 space-y-4">
                <div className={`text-xs uppercase tracking-widest font-bold ${step.accent}`}>Step {step.num} — {step.label}</div>
                <h2 className="font-serif text-3xl font-bold">{step.title}</h2>
                <p className="text-gold/80 font-medium italic">"{step.tagline}"</p>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>

                {/* Fear → Response */}
                <div className="bg-card/50 border border-border rounded-2xl p-4 space-y-3 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground italic">"{step.customerFear}"</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{step.platformResponse}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EveBuddy Feature Flip Cards */}
      <section className="py-16 bg-charcoal-light/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-gold text-sm uppercase tracking-widest mb-2">Your AI Event Partner</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              What <span className="text-gradient-gold">EveBuddy</span> Can Do For You
            </h2>
            <p className="text-muted-foreground mt-2">Hover or tap each card to learn more</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {eveFeatureCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <FlipCard card={card} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-gold text-sm uppercase tracking-widest mb-2">Trust Through Numbers</p>
            <h2 className="font-serif text-3xl font-bold">The Platform That Delivers</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto bg-card/50 border border-gold/20 rounded-3xl p-8">
            <StatCounter value={12000} label="Verified Vendors Across India" suffix="+" />
            <StatCounter value={48000} label="Events Successfully Completed" suffix="+" />
            <StatCounter value={4.8} label="Average Vendor Rating" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold">₹0</div>
              <div className="text-sm text-muted-foreground mt-1 max-w-[140px] mx-auto">Lost to Fraud — Ever</div>
            </div>
            <StatCounter value={96} label="Customers Booked Again" suffix="%" />
          </div>
        </div>
      </section>

      {/* For Vendors Section */}
      <section className="py-16 bg-charcoal-light/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-gold/10 via-card to-crimson/10 border border-gold/30 p-10 text-center">
            <p className="text-gold text-sm uppercase tracking-widest mb-3">For Vendors</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
              Stop chasing clients.<br />Let EveBuddy Agent work for you <span className="text-gold">24/7</span>.
            </h2>
            <p className="text-muted-foreground mb-2">
              Your portfolio, your pricing, your pace. We just make sure the right clients find you first.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4 mb-6">
              {[
                { icon: <Target className="w-4 h-4" />, text: "Verified client leads" },
                { icon: <Zap className="w-4 h-4" />, text: "Agent Mode finds you bookings" },
                { icon: <Clock className="w-4 h-4" />, text: "24/7 automated follow-ups" },
                { icon: <DollarSign className="w-4 h-4" />, text: "Guaranteed payment via escrow" },
                { icon: <Star className="w-4 h-4" />, text: "Build your reputation fast" },
                { icon: <Globe className="w-4 h-4" />, text: "Pan-India visibility" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-card/60 border border-border px-3 py-2 rounded-full">
                  <span className="text-gold">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-background font-semibold">
              <Link to="/for-partners">List Your Services — Free to Start</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Safety Promise */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-gold/40 bg-gradient-to-b from-[#1a0a0a] to-card text-center p-12"
          >
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(139,0,0,0.5), transparent 70%)"
            }} />
            <div className="text-6xl mb-6">🏛️</div>
            <p className="text-gold text-sm uppercase tracking-widest mb-5 font-medium">The Jashan-E-Aas Promise</p>
            <blockquote className="text-lg md:text-xl text-foreground leading-relaxed font-light space-y-2 mb-6">
              <p>We do not let you pay until your vendor earns it.</p>
              <p>We do not let a vendor take your money and disappear.</p>
              <p className="text-gold font-medium">Every rupee you pay is protected until your event day proves it was worth it.</p>
              <p>That is the Jashan-E-Aas promise.</p>
            </blockquote>
            <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-background font-semibold glow-gold">
              <Link to="/vendors">Start Planning Your Event</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
      <EveBuddy />
    </div>
  );
}
