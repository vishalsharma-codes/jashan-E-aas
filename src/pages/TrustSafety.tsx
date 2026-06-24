import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Shield, CheckCircle, AlertTriangle, Eye, Lock, Zap, Phone, FileText, Star } from "lucide-react";

const verificationLevels = [
  { level: 1, label: "ID Verification", desc: "Government-issued photo ID checked against live selfie via AI", icon: "🪪", done: true },
  { level: 2, label: "Business Registration", desc: "GST certificate, trade licence, or incorporation document", icon: "🏢", done: true },
  { level: 3, label: "Physical Address", desc: "Verified via in-person visit or geo-tagged photos from our team", icon: "📍", done: true },
  { level: 4, label: "Bank Account", desc: "Linked bank account verified — ensures real identity and payment security", icon: "🏦", done: true },
  { level: 5, label: "Reference Checks", desc: "3 verified client references checked by our team", icon: "💬", done: false },
  { level: 6, label: "Background Check Badge", desc: "Criminal record check via partner agency — premium badge awarded", icon: "🛡️", done: false },
];

const trustFeatures = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Escrow Payment Protection",
    desc: "100% of all payments are held securely in escrow. Vendors only receive funds when milestones are confirmed — not a rupee before.",
    color: "text-gold",
    bg: "from-gold/15 to-gold/5",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Emergency Vendor Replacement",
    desc: "If a vendor cancels within 7 days, our platform triggers an SOS re-bid round. We find a replacement within hours, not days.",
    color: "text-crimson",
    bg: "from-crimson/15 to-crimson/5",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Dispute Resolution System",
    desc: "EveBuddy mediates initial disputes. If unresolved, our dedicated human team steps in within 48 hours. All evidence reviewed fairly.",
    color: "text-blue-400",
    bg: "from-blue-500/15 to-blue-500/5",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Review Authenticity",
    desc: "Reviews only allowed post-event with a valid booking ID. AI detects and removes fake reviews. Vendors cannot delete real reviews.",
    color: "text-emerald-400",
    bg: "from-emerald-500/15 to-emerald-500/5",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Safe Communication",
    desc: "Phone numbers are hidden until booking is confirmed. All messages pass through safety filters. Block or report any vendor instantly.",
    color: "text-purple-400",
    bg: "from-purple-500/15 to-purple-500/5",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Composite Vendor Rating",
    desc: "Star rating alone isn't enough. Our score combines: review quality + response time + completion rate + repeat client rate.",
    color: "text-amber-400",
    bg: "from-amber-500/15 to-amber-500/5",
  },
];

const vendorSLAs = [
  { rule: "If vendor fails to respond within 24 hrs", action: "Inquiry auto-forwards to next best match" },
  { rule: "If vendor misses 3 scheduled calls", action: "Badge downgraded, listing deprioritised" },
  { rule: "If vendor cancels within 7 days", action: "Emergency SOS + full refund + vendor penalty strike" },
  { rule: "If review is flagged as fake", action: "AI + human review, removal if confirmed" },
  { rule: "If payment dispute raised", action: "EveBuddy mediation + human team in 48 hrs" },
];

export default function TrustSafety() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 60%)"
        }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-gold" style={{ filter: "drop-shadow(0 0 16px rgba(212,175,55,0.5))" }} />
          </div>
          <p className="text-gold text-sm uppercase tracking-widest mb-3">Your Safety First</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Trust & <span className="text-gradient-gold">Safety</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every vendor is verified. Every payment is protected. Every dispute is resolved. This is how we've achieved ₹0 lost to fraud.
          </p>
        </motion.div>
      </section>

      {/* Vendor Verification Levels */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold">Multi-Level Vendor Verification</h2>
            <p className="text-muted-foreground mt-2">Every vendor goes through a rigorous 6-step verification process.</p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />

            <div className="space-y-4">
              {verificationLevels.map((level, i) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-5 pl-2"
                >
                  {/* Circle with level */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${level.done ? "bg-gold text-background" : "bg-card border-2 border-gold/30 text-muted-foreground"}`}>
                    {level.done ? <CheckCircle className="w-5 h-5" /> : level.level}
                  </div>

                  <div className="flex-1 bg-card border border-border rounded-2xl p-4 hover:border-gold/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{level.icon}</span>
                      <span className="font-semibold text-sm">{level.label}</span>
                      {!level.done && <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Premium Only</span>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{level.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Features Grid */}
      <section className="py-12 bg-charcoal-light/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold">How We Protect You</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {trustFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`bg-gradient-to-br ${f.bg} border border-white/10 rounded-2xl p-6`}
              >
                <div className={`${f.color} mb-3`}>{f.icon}</div>
                <h3 className="font-bold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor SLAs */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 text-center">
            <h2 className="font-serif text-3xl font-bold">Vendor Accountability Rules</h2>
            <p className="text-muted-foreground mt-2">We hold vendors to strict standards. Here's what happens when they don't meet them.</p>
          </motion.div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {vendorSLAs.map((sla, i) => (
              <div key={i} className={`flex flex-col sm:flex-row gap-3 px-6 py-4 ${i !== vendorSLAs.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex items-start gap-2 sm:w-1/2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{sla.rule}</span>
                </div>
                <div className="flex items-start gap-2 sm:w-1/2 sm:border-l sm:border-border sm:pl-4">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{sla.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Insurance */}
      <section className="py-12 bg-charcoal-light/30">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-gold/10 to-card border border-gold/30 rounded-3xl p-10">
              <div className="text-5xl mb-4">🛡️</div>
              <h2 className="font-serif text-2xl font-bold mb-2">One-Click Event Insurance</h2>
              <p className="text-muted-foreground text-sm mb-6">
                At checkout, add event insurance from our partner insurer. Covers vendor no-shows, accidental damage, event cancellation due to emergencies, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {["Vendor no-shows", "Accidental damage", "Emergency cancellation", "Natural disasters", "Venue damage"].map((item) => (
                  <span key={item} className="text-xs bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full">{item}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Insurance adds approximately 1–2% to your total event cost. Underwritten by IRDAI-registered insurers.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <EveBuddy />
    </div>
  );
}
