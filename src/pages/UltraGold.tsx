import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Star, Shield, Zap, Camera, Palette } from "lucide-react";

const customerBenefits = [
  { icon: "👑", title: "Dedicated Event Director", desc: "A human expert assigned exclusively to your event — available 24/7, manages everything on your behalf." },
  { icon: "📋", title: "Curated Vendor Lists", desc: "Hand-selected top 3 vendors in every category, personally vetted by our Ultra Gold team." },
  { icon: "🔍", title: "White-Glove Vetting", desc: "We meet every vendor in person, verify their recent work, and sign NDAs for confidentiality." },
  { icon: "🏛️", title: "AR Venue Tours", desc: "Walk through shortlisted venues in augmented reality before you ever visit in person." },
  { icon: "📞", title: "Concierge Service", desc: "24/7 phone line staffed by senior event professionals — not bots." },
  { icon: "📖", title: "Post-Event Legacy Album", desc: "A premium physical album plus a cinematic highlight reel delivered 30 days after your event." },
];

const vendorBenefits = [
  { icon: "🥇", title: "Exclusive Gold Listing", desc: "Featured in the top spot for your category in your city — always." },
  { icon: "🏅", title: "Gold Badge", desc: "Prominent verification badge that signals elite status to all clients on the platform." },
  { icon: "🔒", title: "Sealed Private Bidding", desc: "Access to private high-value event briefs not shown to regular vendors." },
  { icon: "💰", title: "Advance Payment Guarantee", desc: "30% advance guaranteed within 24 hours of booking confirmation — no chasing." },
  { icon: "📰", title: "Magazine Feature", desc: "Annual feature in our Jashan-E-Aas Vendor Spotlight digital magazine." },
  { icon: "🎯", title: "Zero Competition Bidding", desc: "For Ultra Gold events, you're the only vendor in your category presented to the client." },
];

const eliteCategories = [
  { icon: "📸", name: "Luxury Wedding Photography" },
  { icon: "🎥", name: "Cinematic Videography" },
  { icon: "🌸", name: "Premium Floral Design" },
  { icon: "🏰", name: "Heritage Venue Curators" },
  { icon: "👗", name: "Couture Bridal Wear" },
  { icon: "💎", name: "Fine Jewellery & Rentals" },
  { icon: "🍽️", name: "Michelin-Standard Catering" },
  { icon: "🎵", name: "Live Orchestra & Artists" },
  { icon: "✈️", name: "Destination Event Planners" },
  { icon: "🎪", name: "Luxury Event Architects" },
  { icon: "🚗", name: "Vintage & Luxury Vehicles" },
  { icon: "🎆", name: "Pyrotechnics Specialists" },
  { icon: "💆", name: "Luxury Spa & Wellness" },
  { icon: "🧁", name: "Artisan Cake Designers" },
  { icon: "🎭", name: "Celebrity Entertainment" },
  { icon: "🌿", name: "Eco-Luxury Specialists" },
  { icon: "🏨", name: "Five-Star Hotel Coordinators" },
  { icon: "🎨", name: "Installation Artists" },
];

const tiers = [
  {
    name: "Standard",
    price: "Free",
    color: "from-muted to-muted/50",
    border: "border-border",
    features: ["Browse 12,000+ vendors", "EveBuddy AI assistant", "Standard booking protection", "Phase payment system"],
    cta: "Get Started",
    href: "/vendors",
  },
  {
    name: "Gold",
    price: "₹2,499/mo",
    color: "from-yellow-600/20 to-yellow-800/10",
    border: "border-yellow-500/50",
    badge: "Popular",
    features: ["Everything in Standard", "Priority EveBuddy responses", "Early access to new vendors", "Dedicated chat support", "8% loyalty discount"],
    cta: "Go Gold",
    href: "/auth",
  },
  {
    name: "Ultra Gold",
    price: "₹25,000/yr",
    color: "from-gold/30 to-gold/5",
    border: "border-gold",
    badge: "Elite",
    features: ["Dedicated Event Director", "White-glove vendor vetting", "AR venue tours", "24/7 concierge line", "Legacy post-event album", "Zero competition bidding", "Private event briefs"],
    cta: "Apply for Ultra Gold",
    href: "/auth",
    highlight: true,
  },
];

export default function UltraGold() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.18) 0%, transparent 60%)"
        }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Crown className="w-16 h-16 text-gold" style={{ filter: "drop-shadow(0 0 24px rgba(212,175,55,0.6))" }} />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-gold/20"
              />
            </div>
          </div>
          <Badge className="bg-gold/20 text-gold border-gold/40 mb-4">By Invitation & Application</Badge>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4">
            <span className="text-gradient-gold">Ultra Gold</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            India's most exclusive event planning experience. For those who believe their event deserves nothing less than perfect.
          </p>
          <p className="text-gold font-medium text-sm">3% luxury service fee · ₹25,000/yr vendor membership</p>
        </motion.div>
      </section>

      {/* Customer Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold text-sm uppercase tracking-widest mb-2">For Event Hosts</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">White-Glove Planning Experience</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {customerBenefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-gradient-to-br from-gold/10 to-card border border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-colors"
              >
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Benefits */}
      <section className="py-16 bg-charcoal-light/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold text-sm uppercase tracking-widest mb-2">For Elite Vendors</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Become a Gold Partner</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {vendorBenefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-gold/40 transition-colors"
              >
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 18 Elite Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-gold text-sm uppercase tracking-widest mb-2">Eligible Specialisms</p>
            <h2 className="font-serif text-3xl font-bold">18 Elite Vendor Categories</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {eliteCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-gold/15 rounded-xl p-3 text-center hover:border-gold/40 transition-colors"
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <p className="text-xs text-muted-foreground leading-tight">{cat.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 bg-charcoal-light/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Choose Your Experience</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl bg-gradient-to-br ${tier.color} border ${tier.border} p-7 ${tier.highlight ? "scale-105 shadow-2xl" : ""}`}
                style={tier.highlight ? { boxShadow: "0 0 60px rgba(212,175,55,0.2)" } : {}}
              >
                {tier.badge && (
                  <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 ${tier.highlight ? "bg-gold text-background" : "bg-muted text-foreground"}`}>
                    {tier.badge}
                  </Badge>
                )}
                <h3 className={`font-serif text-2xl font-bold mb-1 ${tier.highlight ? "text-gold" : ""}`}>{tier.name}</h3>
                <p className="text-3xl font-bold mb-5">{tier.price}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlight ? "text-gold" : "text-emerald-400"}`} />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${tier.highlight ? "bg-gold hover:bg-gold-dark text-background glow-gold" : ""}`}
                  variant={tier.highlight ? "default" : "outline"}
                >
                  <Link to={tier.href}>{tier.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <EveBuddy />
    </div>
  );
}
