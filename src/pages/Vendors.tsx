import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search, Star, MapPin, Filter, ArrowLeft, CheckCircle, Clock, Briefcase,
  ChevronDown, X, SlidersHorizontal, TrendingUp, ArrowUpDown, Zap
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

const SERVICE_TYPES = ["All", "Wedding Planner", "Photographer", "DJ Services", "Caterer", "Lighting Designer", "Live Band", "Bridal Makeup", "AV & Production", "Event Manager", "Venue", "Anchor / MC", "Decorator", "Mehendi Artist", "Choreographer", "Florist"];
const CITIES = ["All Cities", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Surat", "Goa", "Kochi"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating-high", label: "Rating: High to Low" },
  { value: "reviews-most", label: "Most Reviewed" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "response-fast", label: "Fastest Response" },
];
const RATING_OPTIONS = [
  { value: 0, label: "All Ratings" },
  { value: 4.8, label: "4.8+ ⭐" },
  { value: 4.5, label: "4.5+ ⭐" },
  { value: 4.0, label: "4.0+ ⭐" },
];
const EXPERIENCE_LEVELS = ["Any", "0–2 yrs", "3–5 yrs", "5–10 yrs", "10+ yrs"];
const RESPONSE_TIMES = ["Any", "< 1 hr", "< 4 hrs", "< 24 hrs"];
const PAYMENT_OPTIONS = ["Any", "UPI", "Card", "Bank Transfer", "Cash", "EMI"];
const PORTFOLIO_TYPES = ["Any", "Wedding", "Corporate", "Entertainment", "Outdoor", "Studio"];
const GENDER_PREF = ["Any", "Male", "Female", "Team/Both"];
const SPECIAL_BADGES = [
  { id: "verified", label: "Platform Verified" },
  { id: "ultraGold", label: "Ultra Gold Partner" },
  { id: "emergency", label: "Emergency Available" },
  { id: "topRated", label: "Top Rated" },
];

const parsePriceMin = (price: string): number => {
  const match = price.match(/[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/,/g, ""));
};

const VendorCard = ({ vendor, index, onBook }: { vendor: Vendor; index: number; onBook: (v: Vendor) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    className="bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/50 hover:shadow-lg transition-all group"
  >
    <div className="flex gap-0.5 h-28 overflow-hidden">
      {vendor.portfolio.slice(0, 4).map((p) => (
        <div
          key={p.id}
          className={`flex-1 bg-gradient-to-br ${p.gradient} flex items-center justify-center text-3xl opacity-80 group-hover:opacity-100 transition-opacity`}
        >
          {p.emoji}
        </div>
      ))}
    </div>

    <div className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${vendor.gradient} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
          {vendor.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-bold text-foreground group-hover:text-gold transition-colors truncate text-sm">{vendor.name}</h3>
            {vendor.isVerified && <CheckCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">{vendor.category}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs mb-2">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-gold fill-gold" />
          <span className="font-semibold">{vendor.rating}</span>
          <span className="text-muted-foreground">({vendor.reviews})</span>
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3" />{vendor.location}
        </span>
      </div>

      <div className="flex gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vendor.eventsCompleted} events</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{vendor.responseTime}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {vendor.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold text-gold text-sm flex-1">{vendor.price}</span>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 border-gold/30 text-gold hover:bg-gold/10 px-3"
        >
          View Profile
        </Button>
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); onBook(vendor); }}
          className="bg-gold hover:bg-gold-dark text-background text-xs h-8 px-3 flex items-center gap-1"
        >
          <Zap className="w-3 h-3" />Book
        </Button>
      </div>
    </div>
  </motion.div>
);

const Vendors = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState("relevance");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [bookingVendor, setBookingVendor] = useState<Vendor | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bookedVendorId, setBookedVendorId] = useState<string | null>(null);

  const handleBook = (vendor: Vendor) => {
    setBookingVendor(vendor);
    setPaymentOpen(true);
  };
  const handlePaymentSuccess = () => {
    setBookedVendorId(bookingVendor?.id ?? null);
    setPaymentOpen(false);
  };
  // Advanced filters
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(500000);
  const [experienceLevel, setExperienceLevel] = useState("Any");
  const [responseTime, setResponseTime] = useState("Any");
  const [paymentOption, setPaymentOption] = useState("Any");
  const [portfolioType, setPortfolioType] = useState("Any");
  const [genderPref, setGenderPref] = useState("Any");
  const [activeBadges, setActiveBadges] = useState<string[]>([]);
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);

  const toggleBadge = (id: string) =>
    setActiveBadges(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  const activeFiltersCount = [
    activeCategory !== "All",
    selectedCity !== "All Cities",
    minRating > 0,
    verifiedOnly,
    experienceLevel !== "Any",
    responseTime !== "Any",
    paymentOption !== "Any",
    portfolioType !== "Any",
    genderPref !== "Any",
    activeBadges.length > 0,
    budgetMin > 0 || budgetMax < 500000,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = vendors.filter((v) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || (
        v.name.toLowerCase().includes(query) ||
        v.category.toLowerCase().includes(query) ||
        v.location.toLowerCase().includes(query) ||
        v.tags.some(t => t.toLowerCase().includes(query)) ||
        v.description.toLowerCase().includes(query)
      );
      const matchesCategory = activeCategory === "All" || v.category === activeCategory;
      const matchesCity = selectedCity === "All Cities" || v.location.toLowerCase().includes(selectedCity.toLowerCase());
      const matchesRating = v.rating >= minRating;
      const matchesVerified = !verifiedOnly || v.isVerified;
      const priceNum = parsePriceMin(v.price);
      const matchesBudget = priceNum >= budgetMin && (budgetMax >= 500000 || priceNum <= budgetMax);
      const matchesBadge = activeBadges.length === 0 || activeBadges.every(b => {
        if (b === "verified") return v.isVerified;
        if (b === "topRated") return v.rating >= 4.8;
        return true;
      });
      return matchesSearch && matchesCategory && matchesCity && matchesRating && matchesVerified && matchesBudget && matchesBadge;
    });

    switch (sortBy) {
      case "rating-high": return [...result].sort((a, b) => b.rating - a.rating);
      case "reviews-most": return [...result].sort((a, b) => b.reviews - a.reviews);
      case "price-low": return [...result].sort((a, b) => parsePriceMin(a.price) - parsePriceMin(b.price));
      case "price-high": return [...result].sort((a, b) => parsePriceMin(b.price) - parsePriceMin(a.price));
      case "response-fast": return [...result].sort((a, b) => {
        const aH = parseInt(a.responseTime) || 99;
        const bH = parseInt(b.responseTime) || 99;
        return aH - bH;
      });
      default: return [...result].sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0) || b.rating - a.rating);
    }
  }, [searchQuery, activeCategory, selectedCity, sortBy, minRating, verifiedOnly, budgetMin, budgetMax, activeBadges]);

  const clearFilters = () => {
    setActiveCategory("All");
    setSelectedCity("All Cities");
    setMinRating(0);
    setVerifiedOnly(false);
    setSortBy("relevance");
    setSearchQuery("");
    setBudgetMin(0);
    setBudgetMax(500000);
    setExperienceLevel("Any");
    setResponseTime("Any");
    setPaymentOption("Any");
    setPortfolioType("Any");
    setGenderPref("Any");
    setActiveBadges([]);
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || "Sort";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold mb-3 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-0.5">All Vendors</h1>
                <p className="text-muted-foreground text-sm">
                  Showing <span className="text-gold font-semibold">{filtered.length}</span> of {vendors.length} verified vendors
                  {searchQuery && <span> for "<span className="text-foreground">{searchQuery}</span>"</span>}
                </p>
              </div>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-crimson hover:text-crimson/80 flex items-center gap-1 border border-crimson/30 px-3 py-1.5 rounded-full">
                  <X className="w-3 h-3" /> Clear all filters ({activeFiltersCount})
                </button>
              )}
            </div>
          </motion.div>

          {/* Search + Sort + Filter Controls */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors, categories, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card hover:border-gold/40 text-sm transition-all whitespace-nowrap"
              >
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between ${sortBy === opt.value ? "text-gold bg-gold/5" : "text-foreground"}`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <CheckCircle className="w-3.5 h-3.5 text-gold" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-all ${showFilters || activeFiltersCount > 0 ? "border-gold bg-gold/10 text-gold" : "border-border bg-card hover:border-gold/40"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-gold text-background text-xs font-bold flex items-center justify-center">{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Expandable Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-gold" /> Advanced Filters
                    </h3>
                    {activeFiltersCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-crimson hover:text-crimson/80 flex items-center gap-1">
                        <X className="w-3 h-3" /> Clear all ({activeFiltersCount})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Budget Range */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                        💰 Budget Range (₹)
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-foreground">
                          <span>₹{(budgetMin / 1000).toFixed(0)}K</span>
                          <span className="text-muted-foreground">—</span>
                          <span>{budgetMax >= 500000 ? "No limit" : `₹${(budgetMax / 1000).toFixed(0)}K`}</span>
                        </div>
                        <div className="space-y-1">
                          <input type="range" min={0} max={500000} step={5000} value={budgetMin}
                            onChange={e => setBudgetMin(Number(e.target.value))}
                            className="w-full accent-gold h-1 rounded-full" />
                          <input type="range" min={0} max={500000} step={5000} value={budgetMax}
                            onChange={e => setBudgetMax(Number(e.target.value))}
                            className="w-full accent-gold h-1 rounded-full" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[["Under ₹25K", 0, 25000], ["₹25K–₹1L", 25000, 100000], ["₹1L–₹2.5L", 100000, 250000], ["₹2.5L+", 250000, 500000]].map(([label, mn, mx]) => (
                            <button key={label as string}
                              onClick={() => { setBudgetMin(mn as number); setBudgetMax(mx as number); }}
                              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${budgetMin === mn && budgetMax === mx ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/50"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* City + Rating */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          <MapPin className="w-3 h-3 inline mr-1" />City
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {["All Cities", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Jaipur", "Goa"].map(city => (
                            <button key={city} onClick={() => setSelectedCity(city)}
                              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${selectedCity === city ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/50"}`}>
                              {city === "All Cities" ? "All" : city}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          ⭐ Min Rating
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {RATING_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => setMinRating(opt.value)}
                              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${minRating === opt.value ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/50"}`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Experience + Response + Gender */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          🏆 Experience
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {EXPERIENCE_LEVELS.map(lvl => (
                            <button key={lvl} onClick={() => setExperienceLevel(lvl)}
                              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${experienceLevel === lvl ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/50"}`}>
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          ⚡ Response Time
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {RESPONSE_TIMES.map(rt => (
                            <button key={rt} onClick={() => setResponseTime(rt)}
                              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${responseTime === rt ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/50"}`}>
                              {rt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          👤 Gender Preference
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {GENDER_PREF.map(g => (
                            <button key={g} onClick={() => setGenderPref(g)}
                              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${genderPref === g ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/50"}`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Badges + Payment + Portfolio */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          🏅 Special Badges
                        </label>
                        <div className="space-y-1.5">
                          {SPECIAL_BADGES.map(badge => (
                            <label key={badge.id} className="flex items-center gap-2 cursor-pointer group">
                              <div onClick={() => toggleBadge(badge.id)}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${activeBadges.includes(badge.id) ? "bg-gold border-gold" : "border-border hover:border-gold/50"}`}>
                                {activeBadges.includes(badge.id) && <CheckCircle className="w-2.5 h-2.5 text-background" />}
                              </div>
                              <span className="text-xs text-foreground group-hover:text-gold transition-colors">{badge.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          💳 Payment Options
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {PAYMENT_OPTIONS.map(p => (
                            <button key={p} onClick={() => setPaymentOption(p)}
                              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${paymentOption === p ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/50"}`}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          📸 Portfolio Type
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {PORTFOLIO_TYPES.map(pt => (
                            <button key={pt} onClick={() => setPortfolioType(pt)}
                              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${portfolioType === pt ? "bg-gold text-background border-gold" : "bg-muted border-border hover:border-gold/50"}`}>
                              {pt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Verified toggle */}
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div onClick={() => setVerifiedOnly(!verifiedOnly)}
                            className={`w-9 h-5 rounded-full transition-all relative ${verifiedOnly ? "bg-gold" : "bg-muted-foreground/30"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${verifiedOnly ? "left-4" : "left-0.5"}`} />
                          </div>
                          <span className="text-xs text-foreground">Verified vendors only</span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Active Filter Tags */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
                      {activeCategory !== "All" && <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-full">{activeCategory} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setActiveCategory("All")} /></span>}
                      {selectedCity !== "All Cities" && <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-full">{selectedCity} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setSelectedCity("All Cities")} /></span>}
                      {minRating > 0 && <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-full">{minRating}+ ⭐ <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setMinRating(0)} /></span>}
                      {verifiedOnly && <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-full">Verified ✓ <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setVerifiedOnly(false)} /></span>}
                      {(budgetMin > 0 || budgetMax < 500000) && <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-full">₹{(budgetMin/1000).toFixed(0)}K–{budgetMax>=500000?"∞":`₹${(budgetMax/1000).toFixed(0)}K`} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => { setBudgetMin(0); setBudgetMax(500000); }} /></span>}
                      {experienceLevel !== "Any" && <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-full">{experienceLevel} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setExperienceLevel("Any")} /></span>}
                      {genderPref !== "Any" && <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-full">{genderPref} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setGenderPref("Any")} /></span>}
                      {activeBadges.map(b => <span key={b} className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-full">{SPECIAL_BADGES.find(sb => sb.id === b)?.label} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggleBadge(b)} /></span>)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Pills — Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {SERVICE_TYPES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-gold text-background border-gold"
                    : "bg-transparent text-muted-foreground border-border hover:border-gold/50 hover:text-gold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Layout: Sidebar + Grid */}
          <div className="flex gap-6">

            {/* Left Sidebar (desktop only) */}
            <div className="hidden lg:block w-60 flex-shrink-0 space-y-4">
              {/* Service Type */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">🎭 Service Type</h3>
                <div className="space-y-0.5 max-h-72 overflow-y-auto">
                  {SERVICE_TYPES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all flex items-center justify-between ${
                        activeCategory === cat ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}>
                      {cat}
                      {activeCategory === cat && <CheckCircle className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3">💰 Budget (₹)</h3>
                <div className="space-y-2">
                  {[["Under ₹25K", 0, 25000], ["₹25K–₹1L", 25000, 100000], ["₹1L–₹2.5L", 100000, 250000], ["₹2.5L–₹5L", 250000, 500000], ["No Limit", 0, 500000]].map(([label, mn, mx]) => (
                    <button key={label as string} onClick={() => { setBudgetMin(mn as number); setBudgetMax(mx as number); }}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${budgetMin === mn && budgetMax === mx ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted text-muted-foreground"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3">⭐ Customer Rating</h3>
                <div className="space-y-1">
                  {RATING_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setMinRating(opt.value)}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                        minRating === opt.value ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted text-muted-foreground"
                      }`}>
                      <Star className={`w-3.5 h-3.5 ${minRating === opt.value ? "fill-gold text-gold" : ""}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Badges */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3">🏅 Badges & Status</h3>
                <div className="space-y-2">
                  {SPECIAL_BADGES.map(badge => (
                    <label key={badge.id} className="flex items-center gap-2 cursor-pointer group">
                      <div onClick={() => toggleBadge(badge.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${activeBadges.includes(badge.id) ? "bg-gold border-gold" : "border-border group-hover:border-gold/50"}`}>
                        {activeBadges.includes(badge.id) && <CheckCircle className="w-2.5 h-2.5 text-background" />}
                      </div>
                      <span className="text-xs text-foreground group-hover:text-gold transition-colors">{badge.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className={`w-8 h-4 rounded-full transition-all relative flex-shrink-0 ${verifiedOnly ? "bg-gold" : "bg-muted-foreground/30"}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${verifiedOnly ? "left-4" : "left-0.5"}`} />
                    </div>
                    <span className="text-xs text-foreground">Verified Only</span>
                  </label>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3">⚡ Response Time</h3>
                <div className="space-y-1">
                  {RESPONSE_TIMES.map(rt => (
                    <button key={rt} onClick={() => setResponseTime(rt)}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${responseTime === rt ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted text-muted-foreground"}`}>
                      {rt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3">👤 Gender Pref.</h3>
                <div className="space-y-1">
                  {GENDER_PREF.map(g => (
                    <button key={g} onClick={() => setGenderPref(g)}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${genderPref === g ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted text-muted-foreground"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3">💳 Payment Options</h3>
                <div className="space-y-1">
                  {PAYMENT_OPTIONS.map(p => (
                    <button key={p} onClick={() => setPaymentOption(p)}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${paymentOption === p ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted text-muted-foreground"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 min-w-0">
              {filtered.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                    <span>{filtered.length} results</span>
                    <span className="flex items-center gap-1">
                      Sorted by: <span className="text-gold font-medium">{currentSortLabel}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((vendor, index) => (
                      <motion.div
                        key={vendor.id}
                        className="relative"
                        onHoverStart={() => setHoveredVendor(vendor.id)}
                        onHoverEnd={() => setHoveredVendor(null)}
                        animate={{
                          opacity: hoveredVendor && hoveredVendor !== vendor.id ? 0.38 : 1,
                          scale: hoveredVendor === vendor.id ? 1.02 : 1,
                          filter: hoveredVendor && hoveredVendor !== vendor.id
                            ? "brightness(0.55) blur(1px)"
                            : "brightness(1) blur(0px)",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {bookedVendorId === vendor.id && (
                          <div className="absolute inset-x-0 top-0 z-10 bg-emerald-500 text-white text-xs font-bold text-center py-1 rounded-t-2xl flex items-center justify-center gap-1">
                            ✅ Token Paid — Booking Confirmed!
                          </div>
                        )}
                        <VendorCard vendor={vendor} index={index} onBook={handleBook} />
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <p className="text-5xl mb-4">🔍</p>
                  <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
                  <p className="text-muted-foreground text-sm mb-4">Try adjusting your search term or filters</p>
                  <Button className="bg-gold text-background" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* UPI Booking Payment Modal */}
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
