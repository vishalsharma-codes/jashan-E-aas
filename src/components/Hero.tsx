import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, Search, MapPin, ChevronDown, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const eventTypes = ["Wedding", "Corporate", "College Fest", "Birthday", "Concert", "Religious", "Sangeet", "Conference"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Jaipur", "Kolkata", "Goa", "Ahmedabad"];

// min / max are kept so the Vendors page can filter with them later (null = no limit).
const GUEST_OPTIONS = [
  { label: "Any size", min: null, max: null },
  { label: "Under 50", min: 0, max: 49 },
  { label: "50 – 100", min: 50, max: 100 },
  { label: "100 – 200", min: 100, max: 200 },
  { label: "200 – 300", min: 200, max: 300 },
  { label: "300 – 500", min: 300, max: 500 },
  { label: "500 – 1,000", min: 500, max: 1000 },
  { label: "1,000+", min: 1000, max: null },
];

const BUDGET_OPTIONS = [
  { label: "Any budget", min: null, max: null },
  { label: "Under ₹1 Lakh", min: 0, max: 100000 },
  { label: "₹1 – 5 Lakh", min: 100000, max: 500000 },
  { label: "₹5 – 10 Lakh", min: 500000, max: 1000000 },
  { label: "₹10 – 25 Lakh", min: 1000000, max: 2500000 },
  { label: "₹25 – 50 Lakh", min: 2500000, max: 5000000 },
  { label: "₹50 Lakh – 1 Crore", min: 5000000, max: 10000000 },
  { label: "₹1 Crore+", min: 10000000, max: null },
];

// Scroll box for the dropdown lists. `data-lenis-prevent` (on the element) lets the mouse wheel scroll inside it.
const LIST_CLASS =
  "absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-xl shadow-[0_14px_36px_-14px_rgba(196,74,104,0.35)] z-50 py-1 max-h-56 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(196,74,104,0.4)_transparent]";

const TRIGGER_CLASS =
  "w-full h-12 flex items-center gap-2 px-3 rounded-lg bg-secondary/70 text-sm text-foreground hover:bg-secondary transition-colors";

const ITEM_CLASS =
  "w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold transition-colors";

// Soft drifting colour glows behind the hero (Blush Peach)
const ORBS = [
  { color: "255,200,212", left: "12%", top: "22%", size: 520, dur: 18 },
  { color: "255,222,196", left: "86%", top: "18%", size: 460, dur: 22 },
  { color: "246,205,236", left: "55%", top: "88%", size: 560, dur: 26 },
];

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedGuests, setSelectedGuests] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

  const [cityOpen, setCityOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const navigate = useNavigate();

  const closeAllMenus = () => {
    setCityOpen(false);
    setTypeOpen(false);
    setGuestsOpen(false);
    setBudgetOpen(false);
  };

  // Sparkles: positions are created once (they used to jump every time a dropdown opened)
  const sparkles = useMemo(
    () =>
      Array.from({ length: 22 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        dur: 3 + Math.random() * 3,
        delay: Math.random() * 2,
        size: Math.random() > 0.7 ? 6 : 4,
      })),
    []
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedType) params.set("type", selectedType);

    const guests = GUEST_OPTIONS.find((g) => g.label === selectedGuests);
    if (guests) {
      params.set("guests", guests.label);
      if (guests.min !== null) params.set("guests_min", String(guests.min));
      if (guests.max !== null) params.set("guests_max", String(guests.max));
    }

    const budget = BUDGET_OPTIONS.find((b) => b.label === selectedBudget);
    if (budget) {
      params.set("budget", budget.label);
      if (budget.min !== null) params.set("budget_min", String(budget.min));
      if (budget.max !== null) params.set("budget_max", String(budget.max));
    }

    navigate(`/vendors?${params.toString()}`);
  };

  // One toggle for every dropdown: closes the others, then flips this one.
  const toggle = (setter: (v: boolean) => void, current: boolean) => {
    closeAllMenus();
    setter(!current);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Soft cream base + drifting pastel glows (replaces the old cream + dark overlay) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF6F2] via-[#FFF1EC] to-[#FFE9E6] pointer-events-none" aria-hidden="true" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {ORBS.map((o, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: o.left,
              top: o.top,
              width: o.size,
              height: o.size,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, rgba(${o.color},0.75) 0%, rgba(${o.color},0.28) 55%, transparent 75%)`,
              filter: "blur(60px)",
            }}
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 25, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* little twinkles */}
        {sparkles.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gold/50"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ y: [0, -14, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-gold/25 mb-8 shadow-sm"
          >
            <Star className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold font-medium">India's Premier Cinematic Event Marketplace</span>
          </motion.div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-3 leading-tight">
            <span className="text-gradient-gold">Jashan-E-Aas</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-light tracking-widest mb-4">जश्न-ए-आस — The Joy of Possibilities</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground mb-6 leading-tight">
            Your Event. Your Vendors. <span className="text-gradient-gold">Zero Compromise.</span>
          </h2>

          {/* ── SEARCH BAR ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="max-w-5xl mx-auto mb-10"
          >
            <div
              className="bg-white/80 backdrop-blur-md border border-gold/20 rounded-2xl p-2 shadow-[0_18px_50px_-18px_rgba(196,74,104,0.35)]"
              onClick={closeAllMenus}
            >
              {/* Row 1: keyword + search */}
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Photographer, DJ, Caterer…"
                    className="pl-10 h-12 bg-transparent border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button
                  onClick={handleSearch}
                  className="h-12 px-6 bg-gold hover:bg-gold-dark text-primary-foreground font-semibold shrink-0"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Row 2: filters */}
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {/* City */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggle(setCityOpen, cityOpen)} className={TRIGGER_CLASS}>
                    <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{selectedCity || "Select City"}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
                  </button>
                  {cityOpen && (
                    <div data-lenis-prevent className={LIST_CLASS}>
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                          className={ITEM_CLASS}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event type */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggle(setTypeOpen, typeOpen)} className={TRIGGER_CLASS}>
                    <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{selectedType || "Event Type"}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${typeOpen ? "rotate-180" : ""}`} />
                  </button>
                  {typeOpen && (
                    <div data-lenis-prevent className={LIST_CLASS}>
                      {eventTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => { setSelectedType(type); setTypeOpen(false); }}
                          className={ITEM_CLASS}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Number of guests */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggle(setGuestsOpen, guestsOpen)} className={TRIGGER_CLASS}>
                    <Users className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{selectedGuests || "No. of Guests"}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${guestsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {guestsOpen && (
                    <div data-lenis-prevent className={LIST_CLASS}>
                      {GUEST_OPTIONS.map((g) => (
                        <button
                          key={g.label}
                          onClick={() => {
                            setSelectedGuests(g.min === null && g.max === null ? "" : g.label);
                            setGuestsOpen(false);
                          }}
                          className={ITEM_CLASS}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggle(setBudgetOpen, budgetOpen)} className={TRIGGER_CLASS}>
                    <Wallet className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{selectedBudget || "Budget"}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${budgetOpen ? "rotate-180" : ""}`} />
                  </button>
                  {budgetOpen && (
                    <div data-lenis-prevent className={LIST_CLASS}>
                      {BUDGET_OPTIONS.map((b) => (
                        <button
                          key={b.label}
                          onClick={() => {
                            setSelectedBudget(b.min === null && b.max === null ? "" : b.label);
                            setBudgetOpen(false);
                          }}
                          className={ITEM_CLASS}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick search pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {["Wedding Photographer", "DJ in Mumbai", "Caterer Delhi", "Decorator Bangalore"].map((term) => (
                <button
                  key={term}
                  onClick={() => { setSearchQuery(term); }}
                  className="text-xs text-gold hover:text-gold-dark bg-white/50 border border-gold/30 hover:border-gold/60 rounded-full px-3 py-1 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
          {/* ─────────────────────────────────────────────────── */}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => navigate("/vendors")}
              className="h-14 px-8 bg-primary hover:bg-gold-dark text-primary-foreground font-semibold text-lg glow-gold"
            >
              Explore All Vendors
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/for-partners")}
              className="h-14 px-8 bg-white/50 border-gold/50 text-foreground hover:bg-gold/10 font-semibold text-lg"
            >
              List Your Business
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};