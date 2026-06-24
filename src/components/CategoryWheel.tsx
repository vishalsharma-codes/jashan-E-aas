import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Briefcase, GraduationCap, PartyPopper, Music, Church, Star, Sparkles } from "lucide-react";

const categories = [
  { id: "wedding", label: "Weddings", icon: Heart, color: "from-rose-500 to-pink-600" },
  { id: "corporate", label: "Corporate", icon: Briefcase, color: "from-blue-500 to-indigo-600" },
  { id: "education", label: "Education", icon: GraduationCap, color: "from-emerald-500 to-teal-600" },
  { id: "party", label: "Parties", icon: PartyPopper, color: "from-amber-500 to-orange-600" },
  { id: "concert", label: "Concerts", icon: Music, color: "from-purple-500 to-violet-600" },
  { id: "religious", label: "Religious", icon: Church, color: "from-cyan-500 to-sky-600" },
];

interface CategoryWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoryId: string) => void;
}

export const CategoryWheel = ({ isOpen, onClose, onSelect }: CategoryWheelProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Curtain effect - Left */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-0 w-1/2 h-full velvet-texture border-r-4 border-gold/50"
          >
            {/* Gold tassels */}
            <div className="absolute right-0 top-0 h-full flex flex-col justify-evenly pr-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="w-3 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-b-full"
                />
              ))}
            </div>
          </motion.div>

          {/* Curtain effect - Right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 w-1/2 h-full velvet-texture border-l-4 border-gold/50"
          >
            {/* Gold tassels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-evenly pl-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="w-3 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-b-full"
                />
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-4xl px-4"
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="absolute -top-16 right-4 p-3 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
            >
              <X className="w-6 h-6 text-gold" />
            </motion.button>

            {/* Header */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl md:text-5xl text-gold mb-3">
                Choose Your Event
              </h2>
              <p className="text-foreground/70 text-lg">
                Select a category to explore our curated vendors
              </p>
            </motion.div>

            {/* Category grid - Mind map style */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onHoverStart={() => setHoveredCategory(category.id)}
                    onHoverEnd={() => setHoveredCategory(null)}
                    onClick={() => onSelect(category.id)}
                    className="group relative"
                  >
                    {/* Tent/curtain shape */}
                    <div className={`
                      relative overflow-hidden rounded-2xl p-6 
                      bg-gradient-to-br ${category.color}
                      transition-all duration-300
                      ${hoveredCategory === category.id ? "scale-105 shadow-2xl" : "shadow-lg"}
                    `}>
                      {/* Decorative top */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                          <Star className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-4 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background/20 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-foreground" />
                        </div>
                        <h3 className="font-display text-xl text-foreground font-semibold">
                          {category.label}
                        </h3>
                      </div>

                      {/* Hover sparkles */}
                      <AnimatePresence>
                        {hoveredCategory === category.id && (
                          <>
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                  scale: 1, 
                                  opacity: [0, 1, 0],
                                  x: (Math.random() - 0.5) * 50,
                                  y: (Math.random() - 0.5) * 50,
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="absolute"
                                style={{
                                  left: `${20 + Math.random() * 60}%`,
                                  top: `${20 + Math.random() * 60}%`,
                                }}
                              >
                                <Sparkles className="w-4 h-4 text-gold" />
                              </motion.div>
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
