import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventCategories, EventCategory, SubCategory } from "@/lib/categoryData";
import { useNavigate } from "react-router-dom";

interface CategoryMindmapProps {
  isOpen: boolean;
  onClose: () => void;
}

type Stage = "idle" | "curtain-close" | "title" | "curtain-open" | "categories" | "subcategories" | "services";

export const CategoryMindmap = ({ isOpen, onClose }: CategoryMindmapProps) => {
  const [stage, setStage] = useState<Stage>("idle");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const [focusingId, setFocusingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setStage("idle");
      return;
    }
    setStage("curtain-close");
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setHoveredCategory(null);
    setFocusingId(null);

    const t1 = setTimeout(() => setStage("title"), 620);
    const t2 = setTimeout(() => setStage("curtain-open"), 1060);
    const t3 = setTimeout(() => setStage("categories"), 1780);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isOpen]);

  const handleClose = () => {
    setStage("idle");
    setTimeout(onClose, 500);
  };

  const handleCategoryClick = (cat: EventCategory) => {
    setFocusingId(cat.id);
    // Short pause so dimming is visible, then layoutId flies the card to center
    setTimeout(() => {
      setSelectedCategory(cat);
      setSelectedSubCategory(null);
      setStage("subcategories");
      setFocusingId(null);
    }, 380);
  };

  const handleSubCategoryClick = (sub: SubCategory) => {
    setSelectedSubCategory(sub);
    setStage("services");
  };

  const handleServiceClick = (service: string) => {
    navigate(`/vendors?category=${selectedCategory?.id}&service=${encodeURIComponent(service)}`);
    onClose();
  };

  const goBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setFocusingId(null);
    setStage("categories");
  };

  const goBackToSubCategories = () => {
    setSelectedSubCategory(null);
    setStage("subcategories");
  };

  if (!isOpen && stage === "idle") return null;

  const numCols = (n: number) => n <= 3 ? n : n <= 6 ? 3 : n <= 8 ? 4 : 3;

  return (
    <AnimatePresence>
      {(isOpen || stage === "curtain-close") && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Base backdrop */}
          <div className="absolute inset-0 bg-black" />

          {/* Spotlight during title */}
          <AnimatePresence>
            {stage === "title" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.25) 0%, rgba(139,0,0,0.1) 40%, transparent 70%)" }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-center px-8"
                >
                  <p className="text-gold/60 text-sm uppercase tracking-widest mb-3 font-medium">Jashan-E-Aas</p>
                  <h2 className="font-serif text-4xl md:text-6xl font-bold text-gold" style={{ textShadow: "0 0 40px rgba(212,175,55,0.5)" }}>
                    What kind of event
                  </h2>
                  <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mt-2">
                    are you planning?
                  </h2>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── LEFT CURTAIN ── */}
          <motion.div
            className="absolute top-0 left-0 bottom-0 w-1/2 z-20 origin-left overflow-hidden"
            initial={{ x: 0 }}
            animate={{
              x: stage === "curtain-open" || stage === "categories" || stage === "subcategories" || stage === "services"
                ? "-100%" : 0,
            }}
            transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1], delay: stage === "curtain-open" ? 0.1 : 0 }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #3d0000 0%, #8b0000 25%, #6b0000 50%, #8b0000 75%, #3d0000 100%)" }} />
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(212,175,55,0.15) 18px, rgba(212,175,55,0.15) 20px)" }} />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute bottom-0 flex flex-col items-center gap-1" style={{ left: `${12 + i * 10}%` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-md" style={{ boxShadow: "0 0 6px rgba(212,175,55,0.8)" }} />
                <div className="w-px bg-gradient-to-b from-gold/80 to-gold/20" style={{ height: `${30 + (i % 3) * 20}px` }} />
              </div>
            ))}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-gold/30 to-transparent" />
          </motion.div>

          {/* ── RIGHT CURTAIN ── */}
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-1/2 z-20 origin-right overflow-hidden"
            initial={{ x: 0 }}
            animate={{
              x: stage === "curtain-open" || stage === "categories" || stage === "subcategories" || stage === "services"
                ? "100%" : 0,
            }}
            transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1], delay: stage === "curtain-open" ? 0.1 : 0 }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #3d0000 0%, #8b0000 25%, #6b0000 50%, #8b0000 75%, #3d0000 100%)" }} />
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(212,175,55,0.15) 18px, rgba(212,175,55,0.15) 20px)" }} />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute bottom-0 flex flex-col items-center gap-1" style={{ left: `${8 + i * 11}%` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-md" style={{ boxShadow: "0 0 6px rgba(212,175,55,0.8)" }} />
                <div className="w-px bg-gradient-to-b from-gold/80 to-gold/20" style={{ height: `${25 + (i % 4) * 15}px` }} />
              </div>
            ))}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-gold/30 to-transparent" />
          </motion.div>

          {/* ── MAIN CONTENT AREA ── */}
          <div className="absolute inset-0 z-10 flex flex-col overflow-hidden">
            {/* Header */}
            <AnimatePresence>
              {(stage === "categories" || stage === "subcategories" || stage === "services") && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-3"
                >
                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={stage === "categories" ? handleClose : stage === "services" ? goBackToSubCategories : goBackToCategories}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {stage === "categories" ? "Close" : "Back"}
                    </button>
                    {selectedCategory && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                        <button
                          onClick={goBackToCategories}
                          className="text-muted-foreground hover:text-gold transition-colors"
                        >
                          {selectedCategory.name}
                        </button>
                      </>
                    )}
                    {selectedSubCategory && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                        <span className="text-gold font-medium">{selectedSubCategory.name}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-gold/50 text-xs uppercase tracking-widest hidden sm:block">
                    {stage === "categories" ? "Select Event Type" : stage === "subcategories" ? "Choose Subcategory" : "Pick a Service"}
                  </p>

                  {/* Close */}
                  <button
                    onClick={handleClose}
                    className="w-9 h-9 rounded-full bg-card/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold/40 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8">
              <AnimatePresence mode="wait">

                {/* ── CATEGORIES GRID (with layoutId + focus-fade) ── */}
                {stage === "categories" && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                    className="pt-4"
                  >
                    <LayoutGroup>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {eventCategories.map((category, index) => (
                          <motion.div
                            key={category.id}
                            layoutId={`cat-${category.id}`}
                            initial={{ opacity: 0, y: -50, scale: 0.85 }}
                            animate={{
                              opacity: focusingId && focusingId !== category.id ? 0 : 1,
                              y: 0,
                              scale: focusingId === category.id ? 1.12 : 1,
                              filter: focusingId && focusingId !== category.id
                                ? "brightness(0.15) blur(3px)"
                                : hoveredCategory && hoveredCategory !== category.id
                                  ? "brightness(0.5)"
                                  : "brightness(1)",
                              zIndex: focusingId === category.id ? 40 : 1,
                            }}
                            transition={{
                              opacity: { duration: 0.28 },
                              filter: { duration: 0.2 },
                              scale: { duration: 0.28 },
                              default: { delay: index * 0.055, type: "spring", stiffness: 200, damping: 18 },
                            }}
                            className="relative group cursor-pointer focus:outline-none"
                            onHoverStart={() => !focusingId && setHoveredCategory(category.id)}
                            onHoverEnd={() => setHoveredCategory(null)}
                            onClick={() => handleCategoryClick(category)}
                            style={{ position: "relative" }}
                          >
                            {/* Rope above */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                              <div className="w-px h-4 bg-gradient-to-b from-gold/80 to-gold/20" />
                              <motion.div
                                animate={{ rotate: [0, 8, -8, 0] }}
                                transition={{ repeat: Infinity, duration: 2.5 + (index % 3) * 0.5 }}
                                className="w-2.5 h-2.5 rounded-full bg-gold shadow-md"
                                style={{ boxShadow: "0 0 6px rgba(212,175,55,0.7)" }}
                              />
                            </div>

                            {/* Card */}
                            <motion.div
                              animate={{
                                boxShadow: hoveredCategory === category.id || focusingId === category.id
                                  ? "0 0 28px rgba(212,175,55,0.55)"
                                  : "none",
                                scale: hoveredCategory === category.id ? 1.05 : 1,
                              }}
                              transition={{ duration: 0.18 }}
                              className={`rounded-2xl bg-gradient-to-b ${category.gradient} p-0.5 shadow-lg`}
                            >
                              <div className="bg-card rounded-[14px] py-5 px-3 flex flex-col items-center gap-2">
                                <span className="text-4xl drop-shadow-md">{category.icon}</span>
                                <span className="font-semibold text-sm text-center leading-tight">{category.name}</span>
                                <span className="text-[10px] text-muted-foreground">{category.subCategories.length} types</span>
                              </div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </LayoutGroup>
                  </motion.div>
                )}

                {/* ── SUBCATEGORIES (tree mindmap with layoutId central node) ── */}
                {stage === "subcategories" && selectedCategory && (
                  <motion.div
                    key="subcategories"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center pt-2"
                  >
                    {/* ── CENTRAL NODE (receives layoutId animation from grid) ── */}
                    <LayoutGroup>
                      <motion.div
                        layoutId={`cat-${selectedCategory.id}`}
                        className="relative flex flex-col items-center mb-0"
                        transition={{ type: "spring", stiffness: 240, damping: 26 }}
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 22 }}
                          className={`w-32 h-32 rounded-full bg-gradient-to-br ${selectedCategory.gradient} flex flex-col items-center justify-center shadow-2xl relative`}
                          style={{ boxShadow: "0 0 50px rgba(212,175,55,0.35), 0 0 0 2px rgba(212,175,55,0.2)" }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ repeat: Infinity, duration: 2.4 }}
                            className="absolute inset-0 rounded-full border-2 border-gold/50 pointer-events-none"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.35, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ repeat: Infinity, duration: 2.4, delay: 0.6 }}
                            className="absolute inset-[-12px] rounded-full border border-gold/20 pointer-events-none"
                          />
                          <span className="text-5xl drop-shadow-lg">{selectedCategory.icon}</span>
                          <span className="text-[11px] font-bold text-white/90 mt-1 px-2 text-center leading-tight">
                            {selectedCategory.name}
                          </span>
                        </motion.div>
                      </motion.div>
                    </LayoutGroup>

                    {/* ── TREE CONNECTOR ── */}
                    <div className="flex flex-col items-center w-full max-w-4xl">
                      {/* Vertical stem from node */}
                      <motion.div
                        className="w-px bg-gradient-to-b from-gold/70 to-gold/30"
                        initial={{ height: 0 }}
                        animate={{ height: 28 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                      />

                      {/* Horizontal hub line */}
                      <motion.div
                        className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent w-full"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                        style={{ transformOrigin: "center" }}
                      />

                      {/* Subcategory cards with individual stems */}
                      <div
                        className={`grid gap-x-4 gap-y-0 w-full mt-0 ${
                          selectedCategory.subCategories.length <= 3
                            ? "grid-cols-3"
                            : selectedCategory.subCategories.length <= 4
                              ? "grid-cols-2 sm:grid-cols-4"
                              : "grid-cols-2 sm:grid-cols-3"
                        }`}
                      >
                        {selectedCategory.subCategories.map((sub, index) => (
                          <div key={sub.name} className="flex flex-col items-center">
                            {/* Vertical stem from hub to card */}
                            <motion.div
                              className="w-px bg-gradient-to-b from-gold/50 to-gold/15"
                              initial={{ height: 0 }}
                              animate={{ height: 28 }}
                              transition={{ delay: 0.55 + index * 0.05, duration: 0.28 }}
                            />

                            {/* Subcategory card */}
                            <motion.button
                              initial={{ opacity: 0, y: 16, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: 0.55 + index * 0.07, type: "spring", stiffness: 200, damping: 18 }}
                              onHoverStart={() => setHoveredSub(sub.name)}
                              onHoverEnd={() => setHoveredSub(null)}
                              onClick={() => handleSubCategoryClick(sub)}
                              className="w-full group focus:outline-none focus:ring-2 focus:ring-gold rounded-xl mb-4"
                            >
                              <motion.div
                                animate={{
                                  filter: hoveredSub && hoveredSub !== sub.name ? "brightness(0.4) blur(1px)" : "brightness(1)",
                                  borderColor: hoveredSub === sub.name ? "rgba(212,175,55,0.85)" : "rgba(255,255,255,0.07)",
                                  boxShadow: hoveredSub === sub.name
                                    ? "0 0 28px rgba(212,175,55,0.28), 0 0 0 1px rgba(212,175,55,0.45)"
                                    : "none",
                                  scale: hoveredSub === sub.name ? 1.04 : 1,
                                }}
                                transition={{ duration: 0.18 }}
                                className="bg-card border rounded-xl p-4 text-left relative overflow-hidden"
                              >
                                {hoveredSub === sub.name && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute top-0 right-0 w-20 h-20 bg-gold/5 rounded-bl-full pointer-events-none"
                                  />
                                )}
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-sm leading-tight">{sub.name}</h3>
                                  <ChevronRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                </div>

                                <AnimatePresence>
                                  {hoveredSub === sub.name ? (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="flex flex-wrap gap-1 mt-1 overflow-hidden"
                                    >
                                      {sub.services.slice(0, 6).map((svc, i) => (
                                        <motion.span
                                          key={svc}
                                          initial={{ opacity: 0, scale: 0.7, x: -6 }}
                                          animate={{ opacity: 1, scale: 1, x: 0 }}
                                          transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 14 }}
                                          className="text-[10px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full"
                                        >
                                          {svc}
                                        </motion.span>
                                      ))}
                                      {sub.services.length > 6 && (
                                        <span className="text-[10px] text-muted-foreground px-1 self-center">
                                          +{sub.services.length - 6} more
                                        </span>
                                      )}
                                    </motion.div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      {sub.services.length} services
                                    </p>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── SERVICES ── */}
                {stage === "services" && selectedSubCategory && (
                  <motion.div
                    key="services"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                  >
                    {/* Mini category node at top */}
                    <div className="flex items-center justify-center gap-3 mb-6 mt-2">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedCategory?.gradient} flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl">{selectedCategory?.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{selectedCategory?.name}</p>
                        <p className="font-bold text-sm text-gold">{selectedSubCategory.name}</p>
                      </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mb-5">
                      Tap a service to find verified vendors
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedSubCategory.services.map((service, index) => (
                        <motion.button
                          key={service}
                          initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 12 }}
                          whileHover={{ scale: 1.06, y: -3 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleServiceClick(service)}
                          className={`p-4 rounded-xl bg-gradient-to-br ${selectedCategory?.gradient} text-white font-medium text-sm shadow-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-gold`}
                        >
                          {service}
                        </motion.button>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <Button
                        onClick={() => navigate(`/vendors?category=${selectedCategory?.id}`)}
                        className="bg-gold hover:bg-gold-dark text-background"
                      >
                        Browse All {selectedCategory?.name} Vendors
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Edge fringe strips */}
          <AnimatePresence>
            {(stage === "categories" || stage === "subcategories" || stage === "services") && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-crimson/40 to-transparent pointer-events-none z-10"
                />
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-crimson/40 to-transparent pointer-events-none z-10"
                />
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
