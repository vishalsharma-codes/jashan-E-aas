import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Calendar, DollarSign, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const eventTypes = [
  "Wedding",
  "Corporate",
  "College Fest",
  "Birthday Party",
  "Concert",
  "Religious",
];

export const RedCarpetSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [budget, setBudget] = useState([50000]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate sparkles when opening
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        const newSparkle = {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        };
        setSparkles((prev) => [...prev.slice(-15), newSparkle]);
      }, 200);

      return () => clearInterval(interval);
    }
    setSparkles([]);
    return undefined;
  }, [isOpen]);

  return (
    <div className="fixed top-4 right-4 z-40" ref={containerRef}>
      {/* Search trigger button */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold"
          >
            <Search className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Red carpet search panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 48, opacity: 0 }}
            animate={{ 
              width: "min(500px, calc(100vw - 2rem))", 
              opacity: 1,
              transition: {
                width: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.3 }
              }
            }}
            exit={{ 
              width: 48, 
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            className="relative overflow-hidden rounded-2xl"
          >
            {/* Red velvet background */}
            <div className="bg-gradient-to-b from-[#FFD9C7] to-[#FBD3DC] absolute inset-0" />
            
            {/* Gold border effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-gold/30" />
            
            {/* Sparkle effects */}
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute w-2 h-2 pointer-events-none"
                style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
              >
                <Sparkles className="w-full h-full text-gold" />
              </motion.div>
            ))}

            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-2xl text-gold"
                >
                  Find Your Event
                </motion.h3>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-crimson-light/20 transition-colors"
                >
                  <X className="w-5 h-5 text-gold" />
                </motion.button>
              </div>

              {/* Search input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="relative mb-6"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/60" />
                <Input
                  placeholder="Search vendors, venues..."
                  className="pl-10 bg-background/20 border-gold/30 text-foreground placeholder:text-foreground/50 h-12 focus:border-gold"
                />
              </motion.div>

              {/* Event type chips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <label className="text-sm text-gold/80 mb-2 block font-medium">Event Type</label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type === selectedType ? "" : type)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedType === type
                          ? "bg-gold text-primary-foreground"
                          : "bg-background/20 text-foreground/80 hover:bg-background/30 border border-gold/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Budget slider */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-6"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gold/80 font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget
                  </label>
                  <span className="text-gold font-semibold">
                    ₹{budget[0].toLocaleString()}+
                  </span>
                </div>
                <Slider
                  value={budget}
                  onValueChange={setBudget}
                  min={10000}
                  max={1000000}
                  step={10000}
                  className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold [&_.bg-primary]:bg-gold"
                />
              </motion.div>

              {/* Date picker placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <Button
                  variant="outline"
                  className="w-full h-12 border-gold/30 bg-background/20 text-foreground/80 hover:bg-background/30 hover:text-foreground justify-start"
                >
                  <Calendar className="w-5 h-5 mr-2 text-gold" />
                  Select Event Date
                </Button>
              </motion.div>

              {/* Search button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Button
                  className="w-full h-12 bg-gold hover:bg-gold-light text-primary-foreground font-semibold text-lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Events
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
