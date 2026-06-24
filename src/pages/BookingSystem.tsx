import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpiPaymentModal } from "@/components/UpiPayment";
import {
  AlertTriangle, CheckCircle, Clock, Shield, CreditCard,
  ChevronDown, ChevronUp, Star, MapPin, CalendarDays, Users,
  ArrowRight, ArrowLeft, Sparkles, Lock, Zap, CheckSquare
} from "lucide-react";
import { vendors } from "@/lib/vendorData";

const bookingTimelines = [
  { type: "Royal/Luxury Wedding", min: "6 months", rec: "12–18 months", urgency: "high" },
  { type: "Standard Wedding (200–500 guests)", min: "3 months", rec: "6–9 months", urgency: "high" },
  { type: "Intimate Wedding (<50 guests)", min: "1 month", rec: "3–4 months", urgency: "medium" },
  { type: "Destination Wedding", min: "6 months", rec: "12 months", urgency: "high" },
  { type: "Engagement Ceremony", min: "3 weeks", rec: "2–3 months", urgency: "medium" },
  { type: "Mehandi Ceremony", min: "1 week", rec: "1 month", urgency: "low" },
  { type: "Corporate Conference (500+ pax)", min: "2 months", rec: "4–6 months", urgency: "high" },
  { type: "Product Launch", min: "1 month", rec: "2–3 months", urgency: "medium" },
  { type: "Birthday Party — Kids", min: "1 week", rec: "2–3 weeks", urgency: "low" },
  { type: "Concert/Live Performance", min: "1 month", rec: "3–6 months", urgency: "high" },
  { type: "College Fest", min: "1 month", rec: "3–4 months", urgency: "medium" },
  { type: "Baby Shower", min: "1 week", rec: "2–3 weeks", urgency: "low" },
  { type: "Surprise Party", min: "3–5 days", rec: "1–2 weeks", urgency: "low" },
  { type: "Virtual/Hybrid Event", min: "1 week", rec: "3–4 weeks", urgency: "low" },
];

const paymentPhases = [
  { phase: "Token / Booking Amount", when: "At time of booking confirmation", percent: "10–20%", trigger: "Both parties sign digital agreement", who: "Auto-deducted from customer", icon: "🤝", color: "from-blue-500/20 to-blue-900/10" },
  { phase: "Advance Payment", when: "30 days before event", percent: "25–30%", trigger: "Vendor submits proof of preparations", who: "Platform releases to vendor", icon: "📋", color: "from-gold/20 to-gold/5" },
  { phase: "Mid-Milestone Payment", when: "15 days before event", percent: "20–25%", trigger: "Site visit done / materials confirmed", who: "Customer approves release", icon: "🏗️", color: "from-purple-500/20 to-purple-900/10" },
  { phase: "Pre-Event Balance", when: "1–3 days before event", percent: "20%", trigger: "Day-before confirmation call", who: "Auto-release after verification", icon: "📞", color: "from-orange-500/20 to-orange-900/10" },
  { phase: "Final Settlement", when: "Within 48 hrs after event", percent: "5–10%", trigger: "Customer confirms satisfactory completion", who: "Customer marks complete / auto-releases in 72 hrs", icon: "✅", color: "from-emerald-500/20 to-emerald-900/10" },
  { phase: "Security Deposit (Refundable)", when: "Held throughout", percent: "5% extra", trigger: "Property damage risk coverage", who: "Auto-return in 7 days if no dispute", icon: "🔒", color: "from-muted/30 to-muted/10" },
];

const refundPolicy = [
  { when: "90+ days before event", refund: "80% refund", color: "text-emerald-400" },
  { when: "60–89 days before event", refund: "60% refund", color: "text-emerald-400" },
  { when: "30–59 days before event", refund: "40% refund", color: "text-amber-400" },
  { when: "15–29 days before event", refund: "20% refund", color: "text-amber-400" },
  { when: "Less than 15 days", refund: "No refund", color: "text-red-400" },
];

const eventPaymentStructures = [
  { event: "Wedding (Large)", structure: "20% token → 30% advance (60 days) → 30% mid (15 days) → 20% final" },
  { event: "Wedding (Intimate)", structure: "25% token → 50% advance (30 days) → 25% final" },
  { event: "Corporate Event", structure: "30% token → 40% advance (45 days) → 30% final" },
  { event: "Concert/Show", structure: "40% token → 40% advance (30 days) → 20% final" },
  { event: "Birthday Party", structure: "30% token → 70% advance (7 days)" },
  { event: "Last-Minute Booking", structure: "60% upfront → 40% post-event" },
];

const STEPS = ["Event Type", "Select Vendor", "Date & Details", "Review", "Payment"];

type BookingStep = 0 | 1 | 2 | 3 | 4 | 5;

interface BookingState {
  eventType: string;
  vendorId: string;
  date: string;
  guests: string;
  city: string;
  requirements: string;
  agreed: boolean;
}

const EVENT_TYPES = [
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "corporate", label: "Corporate", emoji: "🏢" },
  { id: "birthday", label: "Birthday Party", emoji: "🎂" },
  { id: "concert", label: "Concert / Show", emoji: "🎤" },
  { id: "educational", label: "College Fest", emoji: "🎓" },
  { id: "religious", label: "Religious / Puja", emoji: "🪔" },
  { id: "festivals", label: "Festival / Mela", emoji: "🎪" },
  { id: "sports", label: "Sports Event", emoji: "🏆" },
  { id: "fashion-lifestyle", label: "Fashion Show", emoji: "👗" },
  { id: "health-wellness", label: "Wellness Retreat", emoji: "🧘" },
  { id: "social-party", label: "Social Party", emoji: "🎉" },
  { id: "technology", label: "Tech Event", emoji: "💡" },
];

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Jaipur", "Kolkata", "Goa", "Ahmedabad", "Surat", "Kochi"];
const GUEST_OPTIONS = ["< 50", "50–100", "100–200", "200–500", "500–1000", "1000+"];

export default function BookingSystem() {
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"guide" | "wizard">("wizard");
  const [step, setStep] = useState<BookingStep>(0);
  const [booking, setBooking] = useState<BookingState>({
    eventType: "", vendorId: "", date: "", guests: "", city: "", requirements: "", agreed: false
  });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const selectedVendor = vendors.find(v => v.id === booking.vendorId);
  const filteredVendors = booking.eventType
    ? vendors.filter(v => v.categoryId === booking.eventType).slice(0, 12)
    : vendors.slice(0, 12);

  const tokenAmount = selectedVendor ? Math.round(selectedVendor.priceMin * 0.15) : 0;

  const handleNext = () => setStep(s => Math.min(s + 1, 4) as BookingStep);
  const handleBack = () => setStep(s => Math.max(s - 1, 0) as BookingStep);

  const handlePaymentSuccess = (txnId: string) => {
    setPaymentOpen(false);
    setBookingId(`JEA-${Date.now().toString().slice(-8)}`);
    setBookingDone(true);
  };

  const canProceed = () => {
    if (step === 0) return !!booking.eventType;
    if (step === 1) return !!booking.vendorId;
    if (step === 2) return !!booking.date && !!booking.city && !!booking.guests;
    if (step === 3) return booking.agreed;
    return true;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 60%)"
        }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 text-center">
          <p className="text-gold text-sm uppercase tracking-widest mb-3">Transparent & Protected</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Booking & <span className="text-gradient-gold">Payment System</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Book verified vendors, pay via UPI escrow, and enjoy complete peace of mind.
          </p>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab("wizard")}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === "wizard" ? "bg-gold text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              <Zap className="w-4 h-4 inline mr-1.5" />Book a Vendor Now
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === "guide" ? "bg-gold text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              <Shield className="w-4 h-4 inline mr-1.5" />Booking & Payment Guide
            </button>
          </div>
        </motion.div>
      </section>

      <AnimatePresence mode="wait">
        {/* ─── BOOKING WIZARD ─── */}
        {activeTab === "wizard" && (
          <motion.div key="wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-20">
            <div className="container mx-auto px-4 max-w-3xl">
              {!bookingDone ? (
                <>
                  {/* Progress Steps */}
                  <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
                    {STEPS.map((label, i) => (
                      <div key={label} className="flex items-center">
                        <div className={`flex flex-col items-center gap-1 ${i <= step ? "opacity-100" : "opacity-40"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-gold text-background" : "bg-muted text-muted-foreground"}`}>
                            {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-8 md:w-12 h-0.5 mx-1 mb-4 transition-all ${i < step ? "bg-emerald-500" : "bg-border"}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card border border-border rounded-2xl p-6 shadow-lg"
                  >

                    {/* ── STEP 0: Event Type ── */}
                    {step === 0 && (
                      <div>
                        <h2 className="font-serif text-2xl font-bold mb-1">What kind of event?</h2>
                        <p className="text-muted-foreground text-sm mb-6">Select your event type to see matching vendors</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {EVENT_TYPES.map((et) => (
                            <motion.button
                              key={et.id}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setBooking({ ...booking, eventType: et.id, vendorId: "" })}
                              className={`p-3 rounded-xl border text-center transition-all ${booking.eventType === et.id ? "bg-gold/10 border-gold text-gold" : "bg-muted border-border hover:border-gold/40"}`}
                            >
                              <div className="text-2xl mb-1">{et.emoji}</div>
                              <div className="text-xs font-medium leading-tight">{et.label}</div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── STEP 1: Select Vendor ── */}
                    {step === 1 && (
                      <div>
                        <h2 className="font-serif text-2xl font-bold mb-1">Choose your vendor</h2>
                        <p className="text-muted-foreground text-sm mb-4">
                          {filteredVendors.length} verified vendors for{" "}
                          <span className="text-gold">{EVENT_TYPES.find(e => e.id === booking.eventType)?.label || "your event"}</span>
                        </p>
                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                          {filteredVendors.map((v) => (
                            <motion.button
                              key={v.id}
                              whileHover={{ scale: 1.01 }}
                              onClick={() => setBooking({ ...booking, vendorId: v.id })}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${booking.vendorId === v.id ? "bg-gold/10 border-gold" : "bg-muted/40 border-border hover:border-gold/40"}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                  {v.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="font-bold text-sm">{v.name}</span>
                                    {v.isVerified && <CheckCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{v.category} · {v.location}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1 text-xs">
                                      <Star className="w-3 h-3 text-gold fill-gold" />
                                      <span className="font-semibold">{v.rating}</span>
                                      <span className="text-muted-foreground">({v.reviews})</span>
                                    </span>
                                    <span className="text-xs text-gold font-semibold">{v.price}</span>
                                  </div>
                                </div>
                                {booking.vendorId === v.id && (
                                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── STEP 2: Date & Details ── */}
                    {step === 2 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="font-serif text-2xl font-bold mb-1">Event details</h2>
                          <p className="text-muted-foreground text-sm">Tell us about your event</p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4 text-gold" /> Event Date
                          </label>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={booking.date}
                            onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground focus:outline-none focus:border-gold text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gold" /> Event City
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {CITIES.map(city => (
                              <button
                                key={city}
                                onClick={() => setBooking({ ...booking, city })}
                                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${booking.city === city ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/60"}`}
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-gold" /> Expected Guests
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {GUEST_OPTIONS.map(g => (
                              <button
                                key={g}
                                onClick={() => setBooking({ ...booking, guests: g })}
                                className={`py-2 rounded-xl text-sm border transition-all ${booking.guests === g ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/60"}`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold mb-2 block">Special Requirements (optional)</label>
                          <textarea
                            rows={3}
                            value={booking.requirements}
                            onChange={(e) => setBooking({ ...booking, requirements: e.target.value })}
                            placeholder="E.g. outdoor setup, halal catering, drone coverage..."
                            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground focus:outline-none focus:border-gold text-sm resize-none placeholder:text-muted-foreground/50"
                          />
                        </div>
                      </div>
                    )}

                    {/* ── STEP 3: Review ── */}
                    {step === 3 && selectedVendor && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="font-serif text-2xl font-bold mb-1">Review your booking</h2>
                          <p className="text-muted-foreground text-sm">Confirm all details before proceeding to payment</p>
                        </div>

                        {/* Vendor Summary */}
                        <div className="bg-muted/50 border border-border rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedVendor.gradient} flex items-center justify-center text-white font-bold`}>
                              {selectedVendor.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold">{selectedVendor.name}</span>
                                {selectedVendor.isVerified && <CheckCircle className="w-4 h-4 text-gold" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{selectedVendor.category}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-background/50 rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Event Type</p>
                              <p className="font-medium">{EVENT_TYPES.find(e => e.id === booking.eventType)?.label}</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Event Date</p>
                              <p className="font-medium">{booking.date}</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Location</p>
                              <p className="font-medium">{booking.city}</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Guests</p>
                              <p className="font-medium">{booking.guests}</p>
                            </div>
                          </div>
                          {booking.requirements && (
                            <div className="mt-2 bg-background/50 rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Requirements</p>
                              <p className="text-sm">{booking.requirements}</p>
                            </div>
                          )}
                        </div>

                        {/* Payment Breakdown */}
                        <div className="bg-gradient-to-r from-gold/10 to-crimson/10 border border-gold/30 rounded-xl p-4">
                          <h3 className="font-bold mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gold" /> Payment Plan
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vendor Price Range</span>
                              <span className="font-semibold">{selectedVendor.price}</span>
                            </div>
                            <div className="flex justify-between border-t border-gold/20 pt-2">
                              <span className="text-gold font-semibold">Token (15% today)</span>
                              <span className="text-gold font-bold text-lg">₹{new Intl.NumberFormat("en-IN").format(tokenAmount)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Balance paid in milestones as per Jashan-E-Aas escrow policy</p>
                          </div>
                        </div>

                        {/* T&C */}
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={booking.agreed}
                            onChange={(e) => setBooking({ ...booking, agreed: e.target.checked })}
                            className="mt-0.5 w-4 h-4 accent-gold"
                          />
                          <span className="text-sm text-muted-foreground">
                            I agree to the{" "}
                            <span className="text-gold underline cursor-pointer">Booking Terms & Conditions</span>
                            {" "}and understand that the token amount is protected by Jashan-E-Aas escrow.
                          </span>
                        </label>

                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">Your token payment is 100% refundable if the vendor cancels or underperforms.</p>
                        </div>
                      </div>
                    )}

                    {/* ── STEP 4: Payment ── */}
                    {step === 4 && selectedVendor && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="font-serif text-2xl font-bold mb-1">Secure Your Booking</h2>
                          <p className="text-muted-foreground text-sm">Pay the token amount to confirm your booking</p>
                        </div>

                        <div className="bg-gradient-to-r from-gold/10 to-crimson/10 border border-gold/30 rounded-2xl p-5 text-center">
                          <p className="text-muted-foreground text-sm mb-1">Token Payment (15% of base price)</p>
                          <p className="text-4xl font-bold text-gold mb-1">
                            ₹{new Intl.NumberFormat("en-IN").format(tokenAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">to secure {selectedVendor.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { icon: "🔒", label: "Escrow Protected" },
                            { icon: "↩️", label: "Refund Policy Applies" },
                            { icon: "⚡", label: "Instant Confirmation" },
                            { icon: "🛡️", label: "Dispute Protection" },
                          ].map(f => (
                            <div key={f.label} className="flex items-center gap-2 bg-muted rounded-xl p-3 text-xs">
                              <span>{f.icon}</span>
                              <span className="font-medium">{f.label}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={() => setPaymentOpen(true)}
                          size="lg"
                          className="w-full h-14 bg-gradient-to-r from-gold to-gold-dark text-background font-bold text-lg"
                        >
                          <Lock className="w-5 h-5 mr-2" />
                          Pay ₹{new Intl.NumberFormat("en-IN").format(tokenAmount)} via UPI
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                          Powered by Jashan-E-Aas Escrow • UPI • Zero extra charges
                        </p>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                      {step > 0 && (
                        <Button variant="outline" onClick={handleBack} className="flex items-center gap-1.5">
                          <ArrowLeft className="w-4 h-4" /> Back
                        </Button>
                      )}
                      {step < 4 && (
                        <Button
                          onClick={handleNext}
                          disabled={!canProceed()}
                          className="flex-1 bg-gold hover:bg-gold-dark text-background font-semibold flex items-center justify-center gap-1.5"
                        >
                          {step === 3 ? "Proceed to Payment" : "Continue"}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </>
              ) : (
                /* ── BOOKING SUCCESS ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                  </motion.div>

                  <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <span className="text-xs text-gold font-semibold">Booking Confirmed!</span>
                  </div>

                  <h2 className="font-serif text-3xl font-bold mt-3 mb-2">जश्न मुबारक! 🎉</h2>
                  <p className="text-muted-foreground mb-6">Your event is in expert hands</p>

                  <div className="bg-muted rounded-2xl p-5 text-left mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Booking ID</span>
                      <span className="font-mono font-bold text-gold">{bookingId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vendor</span>
                      <span className="font-semibold">{selectedVendor?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Event Date</span>
                      <span className="font-semibold">{booking.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">City</span>
                      <span className="font-semibold">{booking.city}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-3">
                      <span className="text-muted-foreground">Token Paid</span>
                      <span className="font-bold text-emerald-400">₹{new Intl.NumberFormat("en-IN").format(tokenAmount)} ✓</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <p className="flex items-center gap-2 justify-center"><Clock className="w-4 h-4 text-gold" /> Vendor confirmation within 2 hours</p>
                    <p className="flex items-center gap-2 justify-center"><Shield className="w-4 h-4 text-emerald-400" /> Funds held safely in Jashan-E-Aas escrow</p>
                    <p className="flex items-center gap-2 justify-center"><CheckSquare className="w-4 h-4 text-blue-400" /> Booking contract sent to your email</p>
                  </div>

                  <Button
                    onClick={() => { setBookingDone(false); setStep(0); setBooking({ eventType: "", vendorId: "", date: "", guests: "", city: "", requirements: "", agreed: false }); }}
                    className="w-full bg-gold hover:bg-gold-dark text-background font-semibold"
                  >
                    Book Another Vendor
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── GUIDE TAB ─── */}
        {activeTab === "guide" && (
          <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-20">

            {/* Advance Booking Guide */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
                  <h2 className="font-serif text-3xl font-bold mb-2">Advance Booking Guide</h2>
                  <p className="text-muted-foreground">Know when to book based on your event type — the platform warns you automatically.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-sm font-semibold text-emerald-400">Ideal Timing</span></div>
                    <p className="text-sm text-muted-foreground">You have plenty of time. Full vendor availability. Best prices.</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-amber-400" /><span className="text-sm font-semibold text-amber-400">Cutting It Close</span></div>
                    <p className="text-sm text-muted-foreground">"This date is within the recommended advance booking period. Availability will be limited."</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-sm font-semibold text-red-400">Emergency Mode</span></div>
                    <p className="text-sm text-muted-foreground">"Very few vendors available. Consider our Emergency Vendor service." — Platform surcharge applies.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {bookingTimelines.map((item, i) => (
                    <motion.div
                      key={item.type}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedTimeline(expandedTimeline === item.type ? null : item.type)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${item.urgency === "high" ? "bg-red-400" : item.urgency === "medium" ? "bg-amber-400" : "bg-emerald-400"}`} />
                          <span className="font-medium text-sm">{item.type}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Min: <span className="text-foreground font-medium">{item.min}</span></span>
                            <span>Recommended: <span className="text-gold font-medium">{item.rec}</span></span>
                          </div>
                          {expandedTimeline === item.type ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedTimeline === item.type && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-4 flex gap-6 text-sm sm:hidden">
                              <div>Min: <span className="text-foreground font-medium">{item.min}</span></div>
                              <div>Recommended: <span className="text-gold font-medium">{item.rec}</span></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Payment Architecture */}
            <section className="py-12 bg-charcoal-light/30">
              <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
                  <h2 className="font-serif text-3xl font-bold mb-2">Phase Payment Architecture</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">Your money is held safely in escrow and released only when milestones are met.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
                  {paymentPhases.map((phase, i) => (
                    <motion.div
                      key={phase.phase}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className={`bg-gradient-to-br ${phase.color} border border-white/10 rounded-2xl p-5`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{phase.icon}</span>
                        <div>
                          <p className="font-bold text-sm">{phase.phase}</p>
                          <p className="text-gold font-bold">{phase.percent}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1"><Clock className="w-3 h-3 inline mr-1" />{phase.when}</p>
                      <p className="text-xs text-muted-foreground mb-1"><CheckCircle className="w-3 h-3 inline mr-1 text-emerald-400" />{phase.trigger}</p>
                      <p className="text-xs text-gold/80">{phase.who}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="max-w-3xl mx-auto">
                  <h3 className="font-bold text-lg mb-4 text-center">Event-Specific Payment Plans</h3>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {eventPaymentStructures.map((e, i) => (
                      <div key={e.event} className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 px-5 py-4 ${i !== eventPaymentStructures.length - 1 ? "border-b border-border" : ""}`}>
                        <span className="font-semibold text-sm min-w-[160px]">{e.event}</span>
                        <span className="text-xs text-muted-foreground">{e.structure}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="py-12">
              <div className="container mx-auto px-4 max-w-2xl">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="font-serif text-3xl font-bold mb-6 text-center">Cancellation & Refund Policy</h2>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
                    {refundPolicy.map((r, i) => (
                      <div key={r.when} className={`flex items-center justify-between px-6 py-4 ${i !== refundPolicy.length - 1 ? "border-b border-border" : ""}`}>
                        <span className="text-sm text-muted-foreground">{r.when}</span>
                        <span className={`font-bold text-sm ${r.color}`}>{r.refund}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />Platform fee (2–5%) is non-refundable in all cases.</p>
                    <p className="flex items-start gap-2"><Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />Vendor cancellations trigger automatic full refund + penalty to vendor + emergency replacement protocol.</p>
                  </div>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPI Payment Modal */}
      {selectedVendor && (
        <UpiPaymentModal
          isOpen={paymentOpen}
          amount={tokenAmount}
          description={`Token payment for ${EVENT_TYPES.find(e => e.id === booking.eventType)?.label || "event"}`}
          vendorName={selectedVendor.name}
          phase="Token / Booking Amount (15%)"
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentOpen(false)}
        />
      )}

      <Footer />
      <EveBuddy />
    </div>
  );
}
