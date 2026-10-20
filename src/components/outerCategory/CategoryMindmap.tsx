import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventCategories, EventCategory, SubCategory } from "@/lib/categoryData";
import { useNavigate } from "react-router-dom";
import NetworkBackground from "./NetworkBackground";
import WeddingSubcategoryCards from "./subCategory";
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

// ─────────────────────────────────────────────────────────────
// MOSAIC ARRANGEMENT
// Edit this to match your own layout.
//   key   = category name
//   value = Tailwind grid span classes (columns / rows it covers)
// Every category that is not listed is a normal 1×1 card.
// The grid is 2 columns on phones and 4 columns from md up.
// ─────────────────────────────────────────────────────────────
const CARD_SPANS: Record<string, string> = {
  Weddings: "col-span-2 row-span-2",
};

// The 3 small names shown on a card BEFORE hover.
// Categories not listed use their first 3 sub-type names.
const PREVIEW_CHIPS: Record<string, string[]> = {
  Weddings: ["Sangeet", "Mehendi", "Haldi"],
};

// Shows a gradient instead of a broken-image icon when a picture fails to load
const CategoryImage = ({
  src,
  alt,
  gradient,
  className = "",
}: {
  src?: string;
  alt: string;
  gradient?: string;
  className?: string;
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
    <img
      src={src}
      alt={alt}
      decoding="async"
      onError={() => setFailed(true)}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
};

// ─────────────────────────────────────────────────────────────
// One mosaic card
//   The golden frame never moves.
//   Hover: the normal face tilts away (up and back),
//          the sub-type list face rises from below.
//   Touch screens: first tap shows the list, second tap opens.
// ─────────────────────────────────────────────────────────────
interface CategoryCardProps {
  category: EventCategory;
  index: number;
  big: boolean;
  query: string;
  onOpen: (category: EventCategory, rect: DOMRect) => void;
  onOpenSub: (category: EventCategory, sub: SubCategory) => void;
}

const CategoryCard = ({ category, index, big, query, onOpen, onOpenSub }: CategoryCardProps) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();

  const previewNames =
    PREVIEW_CHIPS[category.name] ?? category.subCategories.slice(0, 3).map((s) => s.name);
  const moreCount = Math.max(0, category.subCategories.length - previewNames.length);

  const isTouch = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  const open = () => {
    if (ref.current) onOpen(category, ref.current.getBoundingClientRect());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 12) * 0.04 }}
      className={CARD_SPANS[category.name] ?? ""}
      style={{ perspective: 1000 }}
    >
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`Open ${category.name}`}
        onMouseEnter={() => !isTouch() && setHovered(true)}
        onMouseLeave={() => !isTouch() && setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovered(false);
        }}
        onClick={() => {
          if (isTouch() && !hovered) {
            setHovered(true);
            return;
          }
          open();
        }}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            open();
          }
        }}
        className={`group relative h-full w-full cursor-pointer rounded-2xl border-2 p-1.5 transition-[border-color,box-shadow] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          hovered
            ? "border-gold shadow-[0_0_34px_rgba(212,175,55,0.45)]"
            : "border-gold/40 shadow-[0_0_14px_rgba(212,175,55,0.12)]"
        }`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
          {/* ───────── FRONT FACE (tilts away on hover) ───────── */}
          <motion.div
            className="absolute inset-0"
            style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
            animate={
              hovered
                ? { rotateX: -80, y: -40, opacity: 0, scale: 0.94 }
                : { rotateX: 0, y: 0, opacity: 1, scale: 1 }
            }
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <CategoryImage
              src={categoryImages[category.name]}
              alt={category.name}
              gradient={category.gradient}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.7) 36%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.25) 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col p-3 sm:p-4">
              <div
                className={`mb-2 flex items-center justify-center rounded-xl border border-gold/70 bg-black/70 shadow-[0_0_14px_rgba(212,175,55,0.3)] ${
                  big ? "h-16 w-16 text-4xl" : "h-10 w-10 text-2xl"
                }`}
              >
                {category.icon}
              </div>
              <div className="flex items-end justify-between gap-2">
                <h3
                  className={`font-serif leading-tight text-white drop-shadow-lg ${
                    big ? "text-3xl sm:text-4xl" : "text-base sm:text-lg"
                  }`}
                >
                  {category.name}
                </h3>
                <span className="text-lg leading-none text-gold">→</span>
              </div>
              <div className="mt-2 flex min-w-0 gap-1.5 overflow-hidden">
                {previewNames.slice(0, big ? 3 : 2).map((name) => (
                  <span
                    key={name}
                    className="min-w-0 shrink truncate rounded-full border border-white/25 bg-black/50 px-2.5 py-1 text-[10px] text-white sm:text-xs"
                  >
                    {name}
                  </span>
                ))}
                {moreCount > 0 && (
                  <span className="shrink-0 rounded-full border border-gold/60 bg-gold/10 px-2.5 py-1 text-[10px] font-medium text-gold sm:text-xs">
                    +{moreCount + (big ? 0 : 1)} more
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* ───────── BACK FACE (rises from below on hover) ───────── */}
          <motion.div
            className="absolute inset-0 flex flex-col"
            style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
            initial={false}
            animate={
              hovered
                ? { rotateX: 0, y: "0%", opacity: 1 }
                : { rotateX: 70, y: "100%", opacity: 0 }
            }
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <CategoryImage
              src={categoryImages[category.name]}
              alt=""
              gradient={category.gradient}
              className="scale-110 blur-[2px]"
            />
            <div className="absolute inset-0 bg-black/80" />

            <div
              className={`relative z-10 flex min-h-0 flex-1 flex-col p-3 sm:p-4 ${
                hovered ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <h3 className="truncate font-serif text-base text-gold sm:text-lg">
                  {category.name}
                </h3>
              </div>

              <div
                onWheel={(e) => e.stopPropagation()}
                className="flex min-h-0 flex-1 flex-wrap content-start gap-1.5 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.45)_transparent]"
              >
                {category.subCategories.map((sub, i) => {
                  const match = q && sub.name.toLowerCase().includes(q);
                  return (
                    <button
                      key={sub.name}
                      type="button"
                      tabIndex={hovered ? 0 : -1}
                      onClick={(e) => {
                        e.stopPropagation();
                        open();
                      }}
                      style={{
                        animation: hovered
                          ? `cm-chip-in 0.3s ease-out ${Math.min(i, 14) * 25 + 150}ms both`
                          : undefined,
                      }}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-xs ${
                        match
                          ? "border-gold bg-gold/25 text-gold"
                          : "border-gold/40 bg-black/60 text-white/90 hover:border-gold hover:bg-gold/15 hover:text-gold"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                      {sub.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-gold sm:text-xs">
                <span className="text-white/50">Pick a type, or</span>
                <span className="font-medium">Open all →</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const CategoryMindmap = ({ isOpen, onClose }: CategoryMindmapProps) => {
  const [stage, setStage] = useState<Stage>("idle");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // ---- browser Back support -------------------------------------------
  // While the overlay is open we keep ONE extra history entry. Pressing the
  // browser Back button then steps back inside the overlay instead of leaving
  // the page.
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

  // Search: matches category names, sub-type names and services
  const q = query.trim().toLowerCase();
  const items = useMemo(() => {
    if (!q) return eventCategories;
    return eventCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subCategories.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.services.some((sv) => sv.toLowerCase().includes(q))
        )
    );
  }, [q]);

  // lock page scroll behind the overlay
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
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        setStage("categories");
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
    setOriginRect(null);
    setQuery("");

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

  // Opens the category panel (it grows out of the clicked card)
  const handleCategoryClick = (cat: EventCategory, rect: DOMRect) => {
    setOriginRect(rect);
    setSelectedCategory(cat);
    setSelectedSubCategory(null);
    setStage("subcategories");
  };

  // Goes straight to a sub-type (from the names shown on hover)
  const enterSubCategory = (cat: EventCategory, sub: SubCategory) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(sub);
    setStage(premiumCategories.includes(cat.name) ? "categoryStyles" : "services");
  };

  const handleSubCategoryClick = (sub: SubCategory) => {
    if (selectedCategory) enterSubCategory(selectedCategory, sub);
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
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setStage("categories");
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

  // Keyboard: Esc goes back one level
  const handleBackRef = useRef(handleBack);
  handleBackRef.current = handleBack;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const s = stageRef.current;
      if (e.key === "Escape") {
        if (s === "categories" || s === "subcategories" || s === "services" || s === "categoryStyles") {
          handleBackRef.current();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!isOpen && stage === "idle") return null;

  const showChrome =
    stage === "categories" ||
    stage === "subcategories" ||
    stage === "services" ||
    stage === "categoryStyles";

  const showBoard = stage === "categories" || stage === "subcategories";
  const curtainsOpen = showChrome || stage === "curtain-open";

  // Where the panel grows from (the card that was clicked)
  const panelFrom =
    originRect && typeof window !== "undefined"
      ? {
          opacity: 0,
          scale: 0.4,
          x: originRect.left + originRect.width / 2 - window.innerWidth / 2,
          y: originRect.top + originRect.height / 2 - window.innerHeight / 2,
        }
      : { opacity: 0, scale: 0.9, x: 0, y: 20 };

  return (
    <AnimatePresence>
      {(isOpen || stage === "curtain-close") && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <style>{`@keyframes cm-chip-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

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
                    {selectedCategory && stage !== "subcategories" && (
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

            {/* ── MOSAIC BOARD ── */}
            {showBoard && (
              <motion.div
                key="board"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex min-h-0 flex-1 flex-col items-stretch gap-3 px-2 sm:px-3 transition-[filter] duration-300 ${
                  stage === "subcategories" ? "pointer-events-none blur-[3px] brightness-50" : ""
                }`}
              >
                {/* Search */}
                <div className="relative w-full max-w-md flex-shrink-0">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="I'm planning a… (wedding, birthday, concert)"
                    className="w-full rounded-full border border-gold/30 bg-black/60 py-2.5 pl-11 pr-10 text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/60 hover:text-gold"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Cards */}
                <div
                  data-lenis-prevent
                  className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-1 pb-4 pt-1 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.45)_transparent]"
                >
                  {items.length > 0 ? (
                    
<div className="mx-auto grid w-full max-w-none grid-cols-2 auto-rows-[180px] grid-flow-dense gap-3 sm:auto-rows-[210px] sm:gap-4 lg:grid-cols-4 xl:grid-cols-4">

                      {items.map((c, i) => (
                        <CategoryCard
                          key={c.id}
                          category={c}
                          index={i}
                          big={!!CARD_SPANS[c.name]}
                          query={query}
                          onOpen={handleCategoryClick}
                          onOpenSub={enterSubCategory}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="pt-16 text-center">
                      <p className="text-white/70">No event type matches "{query}".</p>
                      <Button
                        onClick={() => setQuery("")}
                        className="mt-4 bg-gold text-background hover:bg-gold-dark"
                      >
                        Show all categories
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── OTHER STAGES (scrollable) ── */}
            {!showBoard && (
              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-24 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.45)_transparent]"
              >
                <AnimatePresence mode="wait">
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
            )}

            {/* ── EXPAND-IN-PLACE PANEL (the board stays behind, blurred) ── */}
            <AnimatePresence>
              {stage === "subcategories" && selectedCategory && (
                <motion.div
                  key="panel-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-3 sm:p-6"
                  onClick={handleBack}
                >
                  <motion.div
                    initial={panelFrom}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={panelFrom}
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-label={selectedCategory.name}
                    className="relative flex max-h-[90vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-3xl border border-gold/40 bg-[#0b0b0f] shadow-[0_0_80px_rgba(212,175,55,0.25)]"
                  >
                    {/* Banner: photo + icon in border + name */}
                    <div className="relative h-40 flex-shrink-0 overflow-hidden sm:h-52">
                      <CategoryImage
                        src={categoryImages[selectedCategory.name]}
                        alt={selectedCategory.name}
                        gradient={selectedCategory.gradient}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-black/55 to-black/20" />
                      <button
                        onClick={handleBack}
                        aria-label="Close panel"
                        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 transition-colors hover:border-gold hover:text-gold"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-4 left-5 right-16 flex items-end gap-4">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-gold/70 bg-black/70 text-4xl shadow-[0_0_18px_rgba(212,175,55,0.3)]">
                          {selectedCategory.icon}
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-serif text-3xl leading-tight text-white sm:text-4xl">
                            {selectedCategory.name}
                          </h2>
                          <p className="mt-1 text-sm text-white/70">
                            {selectedCategory.subCategories.length} sub-types · pick one to find
                            verified vendors
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sub-type tiles (reuses your existing card designs) */}
                    <div
                      data-lenis-prevent
                      className="flex-1 overflow-y-auto overscroll-contain px-2 pb-4 pt-5 sm:px-4 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.45)_transparent]"
                    >
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
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
