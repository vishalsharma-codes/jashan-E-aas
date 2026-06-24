import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle, Send, MapPin, Calendar, DollarSign, Users, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { eventCategories } from "@/lib/categoryData";
import { vendors } from "@/lib/vendorData";

interface EveBuddyChatProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "welcome" | "category" | "subcategory" | "services" | "date" | "city" | "budget" | "guests" | "requirements" | "results";

interface EventPlan {
  category?: string;
  categoryId?: string;
  subcategory?: string;
  services: string[];
  date?: string;
  city?: string;
  budget?: string;
  guests?: string;
  requirements?: string;
}

const cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Surat", "Lucknow", "Chandigarh", "Goa", "Kochi", "Indore"];
const budgetRanges = ["Under ₹50,000", "₹50K – ₹2 Lakh", "₹2L – ₹5 Lakh", "₹5L – ₹15 Lakh", "₹15L – ₹50 Lakh", "₹50 Lakh+"];
const guestCounts = ["Under 50", "50 – 100", "100 – 300", "300 – 500", "500 – 1000", "1000+"];

const STEP_ORDER: Step[] = ["welcome", "category", "subcategory", "services", "date", "city", "budget", "guests", "requirements", "results"];

const progressPercent = (step: Step) => {
  const idx = STEP_ORDER.indexOf(step);
  return Math.round((idx / (STEP_ORDER.length - 1)) * 100);
};

export const EveBuddyChat = ({ isOpen, onClose }: EveBuddyChatProps) => {
  const [step, setStep] = useState<Step>("welcome");
  const [plan, setPlan] = useState<EventPlan>({ services: [] });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [proposalSent, setProposalSent] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, 50);
  };

  const goTo = (s: Step) => { setStep(s); scrollTop(); };

  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) goTo(STEP_ORDER[idx - 1]);
  };

  const selectedCategory = eventCategories.find(c => c.id === plan.categoryId);
  const selectedSubCat = selectedCategory?.subCategories.find(s => s.name === plan.subcategory);

  const matchedVendors = vendors.filter(v => {
    const catMatch = !plan.categoryId || v.category.toLowerCase().includes(plan.categoryId.replace(/-/g, " ")) ||
      (plan.services.length > 0 && plan.services.some(s =>
        v.tags.some(t => t.toLowerCase().includes(s.toLowerCase().split(" ")[0]))
      ));
    const cityMatch = !plan.city || v.location.toLowerCase().includes(plan.city.toLowerCase());
    return catMatch || cityMatch;
  }).slice(0, 6);

  const displayVendors = matchedVendors.length > 0 ? matchedVendors : vendors.slice(0, 5);

  const handleSendProposal = (vendorId: string) => setProposalSent(prev => [...prev, vendorId]);

  const resetChat = () => {
    setStep("welcome"); setPlan({ services: [] });
    setSelectedServices([]); setProposalSent([]);
  };

  const toggleService = (service: string) =>
    setSelectedServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-24 right-4 w-[420px] max-w-[calc(100vw-2rem)] h-[640px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-background text-sm">Eve Buddy AI ✨</h3>
                <p className="text-xs text-background/80">Your Personal Event Planner</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {step !== "welcome" && (
                <button onClick={resetChat} className="text-background/70 hover:text-background text-xs underline">
                  Restart
                </button>
              )}
              <button onClick={onClose} className="text-background hover:bg-background/20 rounded-lg p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {step !== "welcome" && step !== "results" && (
            <div className="h-1 bg-muted flex-shrink-0">
              <motion.div
                className="h-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--crimson))]"
                animate={{ width: `${progressPercent(step)}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="p-5">
              <AnimatePresence mode="wait">

                {/* ─── WELCOME ─── */}
                {step === "welcome" && (
                  <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-3">🎪</div>
                      <h2 className="text-2xl font-serif font-bold mb-2">Namaste! I'm Eve Buddy</h2>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Tell me about your event and I'll find the{" "}
                        <span className="text-[hsl(var(--gold))] font-semibold">perfect vendors</span> from our verified network — personalised just for you.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { emoji: "💍", label: "Plan a Wedding", id: "wedding", cat: "Weddings" },
                        { emoji: "🎂", label: "Birthday Party", id: "social-party", cat: "Social Parties" },
                        { emoji: "🏢", label: "Corporate Event", id: "corporate", cat: "Corporate Events" },
                        { emoji: "🎤", label: "Concert / Show", id: "concert", cat: "Concerts & Shows" },
                      ].map(({ emoji, label, id, cat }) => (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setPlan({ ...plan, category: cat, categoryId: id }); goTo("subcategory"); }}
                          className="bg-muted hover:bg-muted/70 border border-border hover:border-[hsl(var(--gold))]/50 rounded-xl p-3 text-left transition-all"
                        >
                          <div className="text-2xl mb-1">{emoji}</div>
                          <div className="text-sm font-medium">{label}</div>
                        </motion.button>
                      ))}
                    </div>
                    <Button
                      onClick={() => goTo("category")}
                      className="w-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] text-background font-semibold"
                    >
                      Browse All 20 Event Types <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                )}

                {/* ─── CATEGORY ─── */}
                {step === "category" && (
                  <motion.div key="category" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></button>
                      <div>
                        <h3 className="font-bold text-lg">What type of event?</h3>
                        <p className="text-xs text-muted-foreground">Select one to continue</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {eventCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setPlan({ ...plan, category: cat.name, categoryId: cat.id }); goTo("subcategory"); }}
                          className="flex items-center gap-2 bg-muted hover:bg-muted/70 border border-border hover:border-[hsl(var(--gold))]/50 rounded-xl p-3 text-left transition-all"
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-xs font-medium leading-tight">{cat.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ─── SUBCATEGORY ─── */}
                {step === "subcategory" && selectedCategory && (
                  <motion.div key="subcategory" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></button>
                      <div>
                        <h3 className="font-bold text-lg">{selectedCategory.icon} {selectedCategory.name}</h3>
                        <p className="text-xs text-muted-foreground">What kind specifically?</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedCategory.subCategories.map((sub) => (
                        <motion.button
                          key={sub.name}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setPlan({ ...plan, subcategory: sub.name }); setSelectedServices([]); goTo("services"); }}
                          className={`px-4 py-2 rounded-full text-sm border transition-all ${
                            plan.subcategory === sub.name
                              ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]"
                              : "bg-muted border-border hover:border-[hsl(var(--gold))]/60 hover:text-[hsl(var(--gold))]"
                          }`}
                        >
                          {sub.name}
                        </motion.button>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => { setPlan({ ...plan, subcategory: "General" }); goTo("date"); }} className="w-full text-sm border-dashed">
                      Skip — I'll specify later
                    </Button>
                  </motion.div>
                )}

                {/* ─── SERVICES ─── */}
                {step === "services" && selectedSubCat && (
                  <motion.div key="services" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></button>
                      <div>
                        <h3 className="font-bold text-lg">Services needed</h3>
                        <p className="text-xs text-muted-foreground">Pick all that apply for {selectedSubCat.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedSubCat.services.map((service) => (
                        <motion.button
                          key={service}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => toggleService(service)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                            selectedServices.includes(service)
                              ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]"
                              : "bg-muted border-border hover:border-[hsl(var(--gold))]/60"
                          }`}
                        >
                          {selectedServices.includes(service) && <CheckCircle className="w-3 h-3" />}
                          {service}
                        </motion.button>
                      ))}
                    </div>
                    <Button
                      onClick={() => { setPlan({ ...plan, services: selectedServices }); goTo("date"); }}
                      disabled={selectedServices.length === 0}
                      className="w-full bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-dark))] text-background"
                    >
                      Continue ({selectedServices.length} selected) <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <button onClick={() => { setPlan({ ...plan, services: [] }); goTo("date"); }} className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground py-1">
                      Skip this step
                    </button>
                  </motion.div>
                )}

                {/* ─── DATE ─── */}
                {step === "date" && (
                  <motion.div key="date" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></button>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-[hsl(var(--gold))]" /> When is your event?</h3>
                        <p className="text-xs text-muted-foreground">Helps vendors check availability</p>
                      </div>
                    </div>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={typeof plan.date === "string" && plan.date.match(/^\d{4}/) ? plan.date : ""}
                      onChange={(e) => setPlan({ ...plan, date: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground focus:outline-none focus:border-[hsl(var(--gold))] text-sm mb-3"
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["Next Weekend", "This Month", "Next Month", "3 Months Away", "6 Months Away", "1 Year Away"].map(label => (
                        <button
                          key={label}
                          onClick={() => setPlan({ ...plan, date: label })}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                            plan.date === label ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]" : "bg-muted border-border hover:border-[hsl(var(--gold))]/60"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <Button onClick={() => goTo("city")} disabled={!plan.date} className="w-full bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-dark))] text-background">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <button onClick={() => goTo("city")} className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground py-1">Skip</button>
                  </motion.div>
                )}

                {/* ─── CITY ─── */}
                {step === "city" && (
                  <motion.div key="city" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></button>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-[hsl(var(--gold))]" /> Event location?</h3>
                        <p className="text-xs text-muted-foreground">Helps us find nearby vendors</p>
                      </div>
                    </div>
                    <Input placeholder="Type your city..." value={plan.city || ""} onChange={(e) => setPlan({ ...plan, city: e.target.value })} className="mb-3" />
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cities.map(city => (
                        <button
                          key={city}
                          onClick={() => setPlan({ ...plan, city })}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                            plan.city === city ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]" : "bg-muted border-border hover:border-[hsl(var(--gold))]/60"
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                    <Button onClick={() => goTo("budget")} disabled={!plan.city} className="w-full bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-dark))] text-background">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <button onClick={() => goTo("budget")} className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground py-1">Skip</button>
                  </motion.div>
                )}

                {/* ─── BUDGET ─── */}
                {step === "budget" && (
                  <motion.div key="budget" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></button>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-[hsl(var(--gold))]" /> Your budget range?</h3>
                        <p className="text-xs text-muted-foreground">Helps vendors send the right proposals</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {budgetRanges.map(range => (
                        <motion.button
                          key={range}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setPlan({ ...plan, budget: range })}
                          className={`p-3 rounded-xl text-sm border font-medium text-left transition-all ${
                            plan.budget === range ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]" : "bg-muted border-border hover:border-[hsl(var(--gold))]/60"
                          }`}
                        >
                          {range}
                        </motion.button>
                      ))}
                    </div>
                    <Button onClick={() => goTo("guests")} disabled={!plan.budget} className="w-full bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-dark))] text-background">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                )}

                {/* ─── GUESTS ─── */}
                {step === "guests" && (
                  <motion.div key="guests" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></button>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-[hsl(var(--gold))]" /> Expected guests?</h3>
                        <p className="text-xs text-muted-foreground">For venue & catering estimates</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {guestCounts.map(count => (
                        <motion.button
                          key={count}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setPlan({ ...plan, guests: count })}
                          className={`p-3 rounded-xl text-sm border font-medium transition-all ${
                            plan.guests === count ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]" : "bg-muted border-border hover:border-[hsl(var(--gold))]/60"
                          }`}
                        >
                          {count} guests
                        </motion.button>
                      ))}
                    </div>
                    <Button onClick={() => goTo("requirements")} disabled={!plan.guests} className="w-full bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-dark))] text-background">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                )}

                {/* ─── REQUIREMENTS ─── */}
                {step === "requirements" && (
                  <motion.div key="requirements" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></button>
                      <div>
                        <h3 className="font-bold text-lg">Anything special? ✨</h3>
                        <p className="text-xs text-muted-foreground">Theme, requests, or paste a reference link</p>
                      </div>
                    </div>
                    <textarea
                      className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground focus:outline-none focus:border-[hsl(var(--gold))] text-sm resize-none h-28 mb-3"
                      placeholder="E.g. Royal Rajasthani theme, halal catering, outdoor stage, drone shots required..."
                      value={plan.requirements || ""}
                      onChange={(e) => setPlan({ ...plan, requirements: e.target.value })}
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["Drone Photography", "Outdoor Setup", "Live Streaming", "Halal Catering", "Vegetarian Only", "Celebrity Performance", "Budget-Friendly", "Luxury Setup"].map(req => (
                        <button
                          key={req}
                          onClick={() => setPlan({ ...plan, requirements: (plan.requirements ? plan.requirements + ", " : "") + req })}
                          className="px-3 py-1 rounded-full text-xs bg-muted border border-border hover:border-[hsl(var(--gold))]/60 transition-all"
                        >
                          + {req}
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={() => goTo("results")}
                      className="w-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--crimson))] text-background font-semibold"
                    >
                      <Zap className="w-4 h-4 mr-2" /> Find My Perfect Vendors!
                    </Button>
                    <button onClick={() => goTo("results")} className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground py-1">
                      Skip & find vendors now
                    </button>
                  </motion.div>
                )}

                {/* ─── RESULTS ─── */}
                {step === "results" && (
                  <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-[hsl(var(--gold))]/10 to-[hsl(var(--crimson))]/10 border border-[hsl(var(--gold))]/30 rounded-xl p-4 mb-5">
                      <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[hsl(var(--gold))]" /> Your Event Brief
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {plan.category && <span>🎪 <b className="text-foreground">{plan.category}</b></span>}
                        {plan.subcategory && <span>📌 {plan.subcategory}</span>}
                        {plan.date && <span>📅 {plan.date}</span>}
                        {plan.city && <span>📍 {plan.city}</span>}
                        {plan.budget && <span>💰 {plan.budget}</span>}
                        {plan.guests && <span>👥 {plan.guests}</span>}
                        {plan.services.length > 0 && (
                          <span className="col-span-2">🎯 {plan.services.slice(0, 3).join(", ")}{plan.services.length > 3 ? ` +${plan.services.length - 3}` : ""}</span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-base mb-3">
                      ✅ {displayVendors.length} vendors matched for you
                    </h3>

                    <div className="space-y-3">
                      {displayVendors.map((vendor, i) => (
                        <motion.div
                          key={vendor.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="bg-muted border border-border rounded-xl p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${vendor.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                              {vendor.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="font-semibold text-sm truncate">{vendor.name}</span>
                                {vendor.isVerified && <CheckCircle className="w-3 h-3 text-[hsl(var(--gold))] flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{vendor.category} · {vendor.location}</p>
                              <div className="flex items-center gap-2 text-xs mt-1">
                                <span className="flex items-center gap-0.5 text-[hsl(var(--gold))]">
                                  <Star className="w-3 h-3 fill-[hsl(var(--gold))]" />{vendor.rating}
                                </span>
                                <span className="text-muted-foreground">({vendor.reviews} reviews)</span>
                                <span className="font-semibold text-[hsl(var(--gold))]">{vendor.price}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {proposalSent.includes(vendor.id) ? (
                              <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium">
                                <CheckCircle className="w-3.5 h-3.5" /> Proposal Sent!
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSendProposal(vendor.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-dark))] text-background text-xs font-semibold transition-all"
                              >
                                <Send className="w-3 h-3" /> Send Proposal
                              </button>
                            )}
                            <button className="px-3 py-1.5 rounded-lg border border-border hover:border-[hsl(var(--gold))]/50 text-xs text-muted-foreground hover:text-foreground transition-all">
                              View
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button
                      onClick={resetChat}
                      className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-xl transition-all hover:border-[hsl(var(--gold))]/40"
                    >
                      Start a new search
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
