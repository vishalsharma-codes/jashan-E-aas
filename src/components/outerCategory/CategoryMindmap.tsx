import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventCategories, EventCategory, SubCategory } from "@/lib/categoryData";
import { useNavigate } from "react-router-dom";
import NetworkBackground from "./NetworkBackground";
import WeddingSubcategoryCards, { WeddingHeader } from "./subCategory";
import WeddingStyleCards from "./subCategory/wedding";
import DynamicSubcategoryCards from "./subCategory/DynamicSubcategoryCards";
import CategorySubcategoryCards from "./categoryDesign/CategorySubcategoryCards";

import weddingImage from "./categoryImages/weddings.jpg";
import corporateImage from "./categoryImages/corporate-events.jpg";
import socialPartiesImage from "./categoryImages/social-parties.jpg";
import educationalImage from "./categoryImages/educational-events.jpg";
import concertsImage from "./categoryImages/concerts-shows.jpg";
import religiousImage from "./categoryImages/religious-spiritual.jpg";
import exhibitionsImage from "./categoryImages/exhibitions-expos.jpg";
import sportsImage from "./categoryImages/sports-events.jpg";
import governmentImage from "./categoryImages/government-events.jpg";
import charityImage from "./categoryImages/charity-ngo-events.jpg";
import fashionImage from "./categoryImages/fashion-lifestyle.jpg";
import virtualImage from "./categoryImages/virtual-hybrid-events.jpg";
import festivalsImage from "./categoryImages/festivals-melas.jpg";
import hospitalityImage from "./categoryImages/hospitality-fnb.jpg";
import filmImage from "./categoryImages/film-media-events.jpg";
import techImage from "./categoryImages/tech-innovation.jpg";
import wellnessImage from "./categoryImages/health-wellness.jpg";
import communityImage from "./categoryImages/community-events.jpg";
import agricultureImage from "./categoryImages/agricultural-rural-events.jpg";
import automotiveImage from "./categoryImages/automotive-events.jpg";

interface CategoryMindmapProps {
  isOpen: boolean;
  onClose: () => void;
}

type Stage =
  | "idle"
  | "curtain-close"
  | "title"
  | "curtain-open"
  | "categories"
  | "subcategories"
  | "services"
  | "categoryStyles";

const categoryImages: Record<string, string> = {
  "Weddings": weddingImage,
  "Corporate Events": corporateImage,
  "Social Parties": socialPartiesImage,
  "Educational Events": educationalImage,
  "Concerts & Shows": concertsImage,
  "Religious & Spiritual": religiousImage,
  "Exhibitions & Expos": exhibitionsImage,
  "Sports Events": sportsImage,
  "Government Events": governmentImage,
  "Charity & NGO Events": charityImage,
  "Fashion & Lifestyle": fashionImage,
  "Virtual & Hybrid Events": virtualImage,
  "Festivals & Melas": festivalsImage,
  "Hospitality & F&B": hospitalityImage,
  "Film & Media Events": filmImage,
  "Tech & Innovation": techImage,
  "Health & Wellness": wellnessImage,
  "Community Events": communityImage,
  "Agricultural & Rural Events": agricultureImage,
  "Automotive Events": automotiveImage,
};

// Categories that use their own premium subcategory page
const premiumCategories = Object.keys(categoryImages);

// Shows a gradient instead of a broken-image icon when a picture fails to load
const CategoryImage = ({
  src,
  alt,
  gradient,
  zoomed,
}: {
  src?: string;
  alt: string;
  gradient?: string;
  zoomed: boolean;
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient ?? "from-[#3a2a0a] to-[#0d0d12]"}`}
      />
    );
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="absolute inset-0 w-full h-full object-cover"
      animate={{ scale: zoomed ? 1.13 : 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    />
  );
};

export const CategoryMindmap = ({ isOpen, onClose }: CategoryMindmapProps) => {
  const [stage, setStage] = useState<Stage>("idle");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [focusingId, setFocusingId] = useState<string | null>(null);
  const [fastReturn, setFastReturn] = useState(false);
  const navigate = useNavigate();

  // ---- browser Back support -------------------------------------------
  // While the overlay is open we keep ONE extra history entry. Pressing the
  // browser Back button then steps back inside the overlay instead of leaving
  // the page (which used to jump to the Jhalak page).
  const stageRef = useRef<Stage>("idle");
  stageRef.current = stage;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const sentinelRef = useRef(false); // is our extra history entry active?
  const ignorePopRef = useRef(false); // skip the popstate we cause ourselves

  const pushSentinel = () => {
    window.history.pushState({ ...(window.history.state ?? {}), mindmap: true }, "");
    sentinelRef.current = true;
  };

  // lock page scroll behind the overlay (fixes the double scrollbar)
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const previous = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous.html;
      body.style.overflow = previous.body;
    };
  }, [isOpen]);

  // history entry + browser Back handling
  useEffect(() => {
    if (!isOpen) return;

    if (!sentinelRef.current) pushSentinel();

    const onPop = (e: PopStateEvent) => {
      if (ignorePopRef.current) {
        ignorePopRef.current = false;
        return;
      }
      if (e.state?.mindmap) {
        sentinelRef.current = true; // browser Forward landed on our entry
        return;
      }
      if (!sentinelRef.current) return;
      sentinelRef.current = false; // our entry was just popped

      const current = stageRef.current;
      if (current === "categoryStyles" || current === "services") {
        pushSentinel();
        setSelectedSubCategory(null);
        setStage("subcategories");
      } else if (current === "subcategories") {
        pushSentinel();
        setFastReturn(true);
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        setFocusingId(null);
        setStage("categories");
        setTimeout(() => setFastReturn(false), 150);
      } else {
        setStage("idle");
        setTimeout(() => onCloseRef.current(), 500);
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isOpen]);

  // ---- opening animation ------------------------------------------------
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
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  const handleClose = () => {
    setStage("idle");
    if (sentinelRef.current) {
      sentinelRef.current = false;
      ignorePopRef.current = true;
      window.history.back(); // remove our extra history entry
    }
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

    if (selectedCategory?.name && premiumCategories.includes(selectedCategory.name)) {
      setStage("categoryStyles");
      return;
    }

    setStage("services");
  };

  const goToVendors = (url: string) => {
    // replace our extra history entry, so Back from the vendors page
    // returns straight to the page the overlay was opened on
    const hadSentinel = sentinelRef.current;
    sentinelRef.current = false;
    navigate(url, { replace: hadSentinel });
    onClose();
  };

  const handleServiceClick = (service: string) => {
    goToVendors(
      `/vendors?category=${selectedCategory?.id}&service=${encodeURIComponent(service)}`
    );
  };

  const goBackToCategories = () => {
    // Disable shared layout animation while returning
    setFastReturn(true);

    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setFocusingId(null);
    setStage("categories");

    // Re-enable it after the category grid is restored
    setTimeout(() => {
      setFastReturn(false);
    }, 150);
  };

  const goBackToSubCategories = () => {
    setSelectedSubCategory(null);
    setStage("subcategories");
  };

  // The Back button in the header
  const handleBack = () => {
    if (stage === "categories") {
      handleClose();
      return;
    }
    if (sentinelRef.current) {
      window.history.back(); // the popstate handler steps back one level
      return;
    }
    if (stage === "services" || stage === "categoryStyles") goBackToSubCategories();
    else goBackToCategories();
  };

  if (!isOpen && stage === "idle") return null;

  const showChrome =
    stage === "categories" ||
    stage === "subcategories" ||
    stage === "services" ||
    stage === "categoryStyles";

  const curtainsOpen = showChrome || stage === "curtain-open";

  return (
    <AnimatePresence>
      {(isOpen || stage === "curtain-close") && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Base background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(circle at 15% 15%, rgba(212,175,55,0.10), transparent 30%),
                radial-gradient(circle at 85% 20%, rgba(139,0,0,0.06), transparent 30%),
                radial-gradient(circle at 50% 100%, rgba(212,175,55,0.06), transparent 35%),
                linear-gradient(135deg, #030303 0%, #0a0a0c 50%, #10090b 100%)
              `,
            }}
          />

          {/* Network / constellation background */}
          <div className="absolute inset-0 z-[1] pointer-events-none">
            <NetworkBackground />
          </div>

          {/* Spotlight during title */}
          <AnimatePresence>
            {stage === "title" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.25) 0%, rgba(139,0,0,0.1) 40%, transparent 70%)",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-center px-8"
                >
                  <p className="text-gold/60 text-sm uppercase tracking-widest mb-3 font-medium">
                    Jashan-E-Aas
                  </p>
                  <h2
                    className="font-serif text-4xl md:text-6xl font-bold text-gold"
                    style={{ textShadow: "0 0 40px rgba(212,175,55,0.5)" }}
                  >
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
            className="absolute top-0 left-0 bottom-0 w-1/2 z-20 origin-left overflow-hidden pointer-events-none"
            initial={{ x: 0 }}
            animate={{ x: curtainsOpen ? "-100%" : 0 }}
            transition={{
              duration: 0.72,
              ease: [0.4, 0, 0.2, 1],
              delay: stage === "curtain-open" ? 0.1 : 0,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, #3d0000 0%, #8b0000 25%, #6b0000 50%, #8b0000 75%, #3d0000 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(212,175,55,0.15) 18px, rgba(212,175,55,0.15) 20px)",
              }}
            />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 flex flex-col items-center gap-1"
                style={{ left: `${12 + i * 10}%` }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gold shadow-md"
                  style={{ boxShadow: "0 0 6px rgba(212,175,55,0.8)" }}
                />
                <div
                  className="w-px bg-gradient-to-b from-gold/80 to-gold/20"
                  style={{ height: `${30 + (i % 3) * 20}px` }}
                />
              </div>
            ))}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-gold/30 to-transparent" />
          </motion.div>

          {/* ── RIGHT CURTAIN ── */}
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-1/2 z-20 origin-right overflow-hidden pointer-events-none"
            initial={{ x: 0 }}
            animate={{ x: curtainsOpen ? "100%" : 0 }}
            transition={{
              duration: 0.72,
              ease: [0.4, 0, 0.2, 1],
              delay: stage === "curtain-open" ? 0.1 : 0,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, #3d0000 0%, #8b0000 25%, #6b0000 50%, #8b0000 75%, #3d0000 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(212,175,55,0.15) 18px, rgba(212,175,55,0.15) 20px)",
              }}
            />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 flex flex-col items-center gap-1"
                style={{ left: `${8 + i * 11}%` }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gold shadow-md"
                  style={{ boxShadow: "0 0 6px rgba(212,175,55,0.8)" }}
                />
                <div
                  className="w-px bg-gradient-to-b from-gold/80 to-gold/20"
                  style={{ height: `${25 + (i % 4) * 15}px` }}
                />
              </div>
            ))}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-gold/30 to-transparent" />
          </motion.div>

          {/* ── MAIN CONTENT AREA ── */}
          <div className="absolute inset-0 z-10 flex flex-col overflow-hidden">
            {/* Header */}
            <AnimatePresence>
              {showChrome && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-3"
                >
                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:text-gold"
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
                  {stage !== "subcategories" && (
                    <p className="text-gold/50 text-xs uppercase tracking-widest hidden sm:block">
                      {stage === "categories" ? "Select Event Type" : "Pick a Service"}
                    </p>
                  )}

                  {/* Close */}
                  <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="w-9 h-9 rounded-full bg-card/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold/40 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable content: the only scroll area on the page */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-24 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.45)_transparent]"
            >
              <AnimatePresence mode="wait">
                {/* ── CATEGORIES GRID (with layoutId + focus-fade) ── */}
                {stage === "categories" && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                    className="pt-8"
                  >
                    <LayoutGroup>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5 md:gap-7 mt-4">
                        {eventCategories.map((category, index) => (
                          <motion.div
                            key={category.id}
                            layoutId={fastReturn ? undefined : `cat-${category.id}`}
                            initial={fastReturn ? false : { opacity: 0, y: -50, scale: 0.85 }}
                            animate={{
                              opacity: focusingId && focusingId !== category.id ? 0 : 1,
                              y: 0,
                              scale: focusingId === category.id ? 1.12 : 1,
                              filter:
                                focusingId && focusingId !== category.id
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
                              default: {
                                delay: fastReturn ? 0 : index * 0.055,
                                type: "spring",
                                stiffness: 200,
                                damping: 18,
                              },
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

                            {/* ───────── CATEGORY IMAGE CARD ───────── */}
                            <motion.div
                              animate={{
                                boxShadow:
                                  hoveredCategory === category.id || focusingId === category.id
                                    ? "0 0 35px rgba(212,175,55,0.45)"
                                    : "none",
                                scale: hoveredCategory === category.id ? 1.04 : 1,
                              }}
                              transition={{ duration: 0.25 }}
                              className="relative overflow-hidden rounded-2xl bg-black border border-white/10"
                            >
                              {/* Image (falls back to a gradient if it cannot load) */}
                              <CategoryImage
                                src={categoryImages[category.name]}
                                alt={category.name}
                                gradient={category.gradient}
                                zoomed={hoveredCategory === category.id}
                              />

                              {/* Dark overall overlay */}
                              <div className="absolute inset-0 bg-black/25" />

                              {/* Bottom black gradient */}
                              <div
                                className="absolute inset-0"
                                style={{
                                  background:
                                    "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.72) 28%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.05) 100%)",
                                }}
                              />

                              {/* Hover glow */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredCategory === category.id ? 1 : 0 }}
                                transition={{ duration: 0.25 }}
                                className="absolute inset-0 bg-gradient-to-t from-gold/15 via-transparent to-transparent pointer-events-none"
                              />

                              {/* Category information */}
                              <div className="relative z-10 min-h-[150px] sm:min-h-[165px] md:min-h-[180px] flex flex-col justify-end p-4 md:p-5">
                                <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.25em] text-gold mb-2">
                                  CATEGORY {String(index + 1).padStart(2, "0")}
                                </span>

                                <div className="flex items-end justify-between gap-3">
                                  <div>
                                    <h3 className="font-serif text-white text-lg md:text-xl lg:text-[21px] leading-tight drop-shadow-lg">
                                      {category.name}
                                    </h3>
                                    <p className="text-[10px] text-white/55 mt-1">
                                      {category.subCategories.length} types
                                    </p>
                                  </div>

                                  <motion.div
                                    animate={{ x: hoveredCategory === category.id ? 6 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-shrink-0 text-gold text-2xl leading-none mb-1"
                                  >
                                    →
                                  </motion.div>
                                </div>
                              </div>

                              {/* Subtle border highlight */}
                              <motion.div
                                animate={{ opacity: hoveredCategory === category.id ? 1 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 rounded-2xl border border-gold/70 pointer-events-none"
                              />
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </LayoutGroup>
                  </motion.div>
                )}

                {/* ── SUBCATEGORIES ── */}
                {stage === "subcategories" && selectedCategory && (
                  <motion.div
                    key="subcategories"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center pt-2 pb-20"
                  >
                    {/* CENTRAL WEDDING HEADER */}
                    {selectedCategory.name === "Weddings" && (
                      <div className="mb-30">
                        <WeddingHeader />
                      </div>
                    )}

                    {/* SUBCATEGORY CARDS */}
                    {selectedCategory.name === "Weddings" ? (
                      <WeddingSubcategoryCards
                        subcategories={selectedCategory.subCategories}
                        onSelect={handleSubCategoryClick}
                      />
                    ) : (
                      <CategorySubcategoryCards
                        categoryName={selectedCategory.name}
                        subcategories={selectedCategory.subCategories}
                        onSelect={handleSubCategoryClick}
                      />
                    )}
                  </motion.div>
                )}

                {/* ── PREMIUM CATEGORY STYLE PAGE ── */}
                {stage === "categoryStyles" && selectedSubCategory && (
                  <motion.div
                    key={`categoryStyles-${selectedCategory?.name}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    className="relative w-full"
                  >
                    {selectedCategory?.name === "Weddings" ? (
                      <WeddingStyleCards
                        subcategories={selectedSubCategory.services.map((service) => ({
                          name: service,
                          services: [],
                        }))}
                        onSelect={(subcategory) => handleServiceClick(subcategory.name)}
                      />
                    ) : (
                      <DynamicSubcategoryCards
                        categoryName={selectedSubCategory.name}
                        subcategories={selectedSubCategory.services.map((service) => ({
                          name: service,
                          services: [],
                        }))}
                        onSelect={(subcategory) => handleServiceClick(subcategory.name)}
                      />
                    )}
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
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedCategory?.gradient} flex items-center justify-center shadow-lg`}
                      >
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
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
                        onClick={() => goToVendors(`/vendors?category=${selectedCategory?.id}`)}
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
            {showChrome && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-crimson/40 to-transparent pointer-events-none z-10"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
