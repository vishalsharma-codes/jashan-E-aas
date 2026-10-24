import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Star, Users, Calendar, Search, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import weddingVideo from "@/assets/homepage/Palace_wedding.mp4";
import corporateVideo from "@/assets/homepage/Corporate_conference.mp4";
import concertVideo from "@/assets/homepage/Musicians_performing.mp4";

const eventTypes = ["Wedding", "Corporate", "College Fest", "Birthday", "Concert", "Religious", "Sangeet", "Conference"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Jaipur", "Kolkata", "Goa", "Ahmedabad"];

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedType) params.set("type", selectedType);
    navigate(`/vendors?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

    {/* Solid cream background */}
<div
  className="absolute inset-0 bg-[#F8EEDC]"
  aria-hidden="true"
/>

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-[#101114]/65 pointer-events-none" />

    {/* Cinematic gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#101114]/45 via-[#101114]/30 to-[#101114]/90 pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/40"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 80),
            }}
            animate={{ y: [null, -20, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-crimson/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8"
          >
            <Star className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold font-medium">India's Premier Cinematic Event Marketplace</span>
          </motion.div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-3 leading-tight">
            <span className="text-gradient-gold">Jashan-E-Aas</span>
          </h1>
          <p className="text-gold/50 text-sm md:text-base font-light tracking-widest mb-4">जश्न-ए-आस — The Joy of Possibilities</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground mb-6 leading-tight">
            Your Event. Your Vendors. <span className="text-gradient-gold">Zero Compromise.</span>
          </h2>

          {/* <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            12,000+ verified vendors. AI-powered EveBuddy. Escrow-protected payments. India's most trusted event marketplace.
          </p> */}

          {/* ── SEARCH BAR ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="max-w-3xl mx-auto mb-10"
          >
            <div
              className="bg-card/80 backdrop-blur-md border border-gold/20 rounded-2xl p-2 shadow-2xl"
              onClick={() => { setCityOpen(false); setTypeOpen(false); }}
            >
              <div className="flex flex-col md:flex-row gap-2">
                {/* Keyword */}
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

                {/* City dropdown */}
                <div className="relative md:w-44" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setCityOpen(!cityOpen); setTypeOpen(false); }}
                    className="w-full h-12 flex items-center gap-2 px-3 rounded-lg bg-secondary/50 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{selectedCity || "Select City"}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
                  </button>
                  {cityOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-xl shadow-xl z-50 py-1 max-h-56 overflow-y-auto">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event type dropdown */}
                <div className="relative md:w-44" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setTypeOpen(!typeOpen); setCityOpen(false); }}
                    className="w-full h-12 flex items-center gap-2 px-3 rounded-lg bg-secondary/50 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{selectedType || "Event Type"}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${typeOpen ? "rotate-180" : ""}`} />
                  </button>
                  {typeOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-xl shadow-xl z-50 py-1">
                      {eventTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => { setSelectedType(type); setTypeOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold transition-colors"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search button */}
                <Button
                  onClick={handleSearch}
                  className="h-12 px-6 bg-gold hover:bg-gold-dark text-background font-semibold shrink-0"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Quick search pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {["Wedding Photographer", "DJ in Mumbai", "Caterer Delhi", "Decorator Bangalore"].map((term) => (
                <button
                  key={term}
                  onClick={() => { setSearchQuery(term); }}
                  className="text-xs text-gold/80 hover:text-gold border border-gold/20 hover:border-gold/50 rounded-full px-3 py-1 transition-colors"
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
              className="h-14 px-8 bg-primary hover:bg-gold-light text-primary-foreground font-semibold text-lg glow-gold"
            >
              Explore All Vendors
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/for-partners")}
              className="h-14 px-8 border-gold/50 text-foreground hover:bg-gold/10 font-semibold text-lg"
            >
              List Your Business
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            {/* {[
              { icon: Users, value: "15K+", label: "Verified Vendors" },
              { icon: Calendar, value: "50K+", label: "Events Planned" },
              { icon: Star, value: "4.9", label: "Average Rating" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-display text-foreground mb-1">
                  <Icon className="w-6 h-6 text-gold" />
                  {value}
                </div>
                <p className="text-muted-foreground text-sm">{label}</p>
              </div>
            ))} */}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            {/* <span className="text-sm">Scroll to explore</span> */}
            {/* <ArrowDown className="w-5 h-5" /> */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
