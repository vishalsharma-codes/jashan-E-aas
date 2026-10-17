import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { eventCategories } from "@/lib/categoryData";
import { CategoryMindmap } from "./outerCategory/CategoryMindmap";

import agriculturalImg from "./outerCategory/categoryImages/agricultural-rural-events.jpg";
import automotiveImg from "./outerCategory/categoryImages/automotive-events.jpg";
import charityImg from "./outerCategory/categoryImages/charity-ngo-events.jpg";
import communityImg from "./outerCategory/categoryImages/community-events.jpg";
import concertsImg from "./outerCategory/categoryImages/concerts-shows.jpg";
import corporateImg from "./outerCategory/categoryImages/corporate-events.jpg";
import educationalImg from "./outerCategory/categoryImages/educational-events.jpg";
import exhibitionsImg from "./outerCategory/categoryImages/exhibitions-expos.jpg";
import fashionImg from "./outerCategory/categoryImages/fashion-lifestyle.jpg";
import festivalsImg from "./outerCategory/categoryImages/festivals-melas.jpg";
import filmImg from "./outerCategory/categoryImages/film-media-events.jpg";
import governmentImg from "./outerCategory/categoryImages/government-events.jpg";
import healthImg from "./outerCategory/categoryImages/health-wellness.jpg";
import hospitalityImg from "./outerCategory/categoryImages/hospitality-fnb.jpg";
import religiousImg from "./outerCategory/categoryImages/religious-spiritual.jpg";
import socialImg from "./outerCategory/categoryImages/social-parties.jpg";
import sportsImg from "./outerCategory/categoryImages/sports-events.jpg";
import techImg from "./outerCategory/categoryImages/tech-innovation.jpg";
import virtualImg from "./outerCategory/categoryImages/virtual-hybrid-events.jpg";
import weddingsImg from "./outerCategory/categoryImages/weddings.jpg";

const categoryImageMap: Record<string, string> = {
  "agricultural rural events": agriculturalImg,
  "agriculture rural events": agriculturalImg,
  "automotive events": automotiveImg,
  "charity ngo events": charityImg,
  "charity and ngo events": charityImg,
  "community events": communityImg,
  "concerts shows": concertsImg,
  "corporate events": corporateImg,
  "educational events": educationalImg,
  "exhibitions expos": exhibitionsImg,
  "fashion lifestyle": fashionImg,
  "fashion and lifestyle": fashionImg,
  "festivals melas": festivalsImg,
  "film media events": filmImg,
  "government events": governmentImg,
  "health wellness": healthImg,
  "hospitality fnb": hospitalityImg,
  "hospitality food beverage": hospitalityImg,
  "religious spiritual": religiousImg,
  "social parties": socialImg,
  "sports events": sportsImg,
  "tech innovation": techImg,
  "technology innovation": techImg,
  "virtual hybrid events": virtualImg,
  weddings: weddingsImg,
};

const normalizeName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, " ").trim().replace(/\s+/g, " ");

const getCategoryImage = (name: string): string | undefined => {
  const normalized = normalizeName(name);

  if (categoryImageMap[normalized]) {
    return categoryImageMap[normalized];
  }

  // Allow a match when a category name contains a longer descriptive suffix.
  const matchingKey = Object.keys(categoryImageMap).find(
    (key) => normalized.includes(key) || key.includes(normalized)
  );

  return matchingKey ? categoryImageMap[matchingKey] : undefined;
};

// ============================================================
// AUTO-SCROLL SETTINGS
// ============================================================

const SCROLL_SPEED = 40; // pixels per second (constant)
const PAUSE_EASE_MS = 250; // how softly it slows/resumes on hover
const NUDGE_EASE_MS = 220; // how softly the arrow buttons glide

export const EventCategories = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null); // clipping window
  const trackRef = useRef<HTMLDivElement>(null); // the moving strip
  const firstSetRef = useRef<HTMLDivElement>(null); // one full copy of the cards

  const isPausedRef = useRef(false);
  const nudgeRef = useRef(0); // pending px from the arrow buttons

  useEffect(() => {
    const track = trackRef.current;
    const firstSet = firstSetRef.current;
    if (!track || !firstSet) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frameId = 0;
    let previousTime = 0;
    let offset = 0; // float position, never rounded
    let currentSpeed = reduceMotion ? 0 : SCROLL_SPEED;

    const animate = (time: number) => {
      if (previousTime !== 0) {
        const dt = Math.min(time - previousTime, 50);

        // Ease the speed toward the target so hover pause/resume is smooth.
        const targetSpeed =
          isPausedRef.current || reduceMotion ? 0 : SCROLL_SPEED;
        currentSpeed +=
          (targetSpeed - currentSpeed) * (1 - Math.exp(-dt / PAUSE_EASE_MS));

        offset += (currentSpeed * dt) / 1000;

        // Glide any pending arrow-button movement.
        if (Math.abs(nudgeRef.current) > 0.5) {
          const step = nudgeRef.current * (1 - Math.exp(-dt / NUDGE_EASE_MS));
          nudgeRef.current -= step;
          offset += step;
        } else {
          nudgeRef.current = 0;
        }

        // Seamless loop: wrap by exactly one set width, in either direction.
        const loopWidth = firstSet.offsetWidth;
        if (loopWidth > 0) {
          offset = ((offset % loopWidth) + loopWidth) % loopWidth;
        }

        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      previousTime = time;
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, []);

  const slideCategories = (direction: "left" | "right") => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const distance = viewport.clientWidth / 2;
    nudgeRef.current += direction === "right" ? distance : -distance;
  };

  const pauseScroll = () => {
    isPausedRef.current = true;
  };

  const resumeScroll = () => {
    isPausedRef.current = false;
  };

  // One full copy of the cards. The second copy is decorative (aria-hidden).
  const renderSet = (isCopy: boolean) => (
    <div
      ref={isCopy ? undefined : firstSetRef}
      aria-hidden={isCopy || undefined}
      className="flex shrink-0 gap-6 pr-6"
    >
      {eventCategories.map((category) => {
        const image = getCategoryImage(category.name);

        return (
          <div
            key={`${isCopy ? "copy" : "main"}-${category.id}`}
            className="flex w-[220px] shrink-0 justify-center sm:w-[240px] lg:w-[260px]"
          >
            <Link
              to={`/category/${category.id}`}
              tabIndex={isCopy ? -1 : undefined}
              draggable={false}
              className="group flex w-full flex-col items-center text-center"
            >
              <div
                className="relative mb-4 aspect-square w-44 overflow-hidden rounded-full border border-white/10 bg-white/5 transition-all duration-500 group-hover:scale-105 group-hover:border-gold group-hover:shadow-[0_0_28px_rgba(212,175,55,0.22)] sm:w-48 lg:w-52"
                style={
                  image
                    ? {
                        backgroundImage: `linear-gradient(to top, rgba(15,15,18,0.25), transparent 45%), url("${image}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <div className="absolute inset-2 rounded-full border border-white/15 transition-colors duration-300 group-hover:border-gold/50" />
              </div>

              <h3 className="font-display text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-gold sm:text-lg">
                {category.name}
              </h3>

              <p className="mt-2 max-w-[200px] text-xs leading-5 text-muted-foreground">
                {category.subCategories
                  .slice(0, 2)
                  .map((subCategory) => subCategory.name)
                  .join(" · ")}
              </p>
            </Link>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <section id="categories" className="bg-charcoal-light/50 py-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium uppercase tracking-wider text-gold">
                Browse by Event Type
              </span>
              <Sparkles className="h-5 w-5 text-gold" />
            </div>

            <h2 className="mb-4 font-display text-4xl text-foreground md:text-5xl">
              Every Event,{" "}
              <span className="text-gradient-gold">Every Vendor</span>
            </h2>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              20 comprehensive event categories · 100+ sub-types · 15,000+
              verified vendors across India
            </p>
          </motion.div>

          <div className="w-full">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold md:text-base">
                Event Categories
              </h3>


<button
  type="button"
  onClick={() => setIsCategoryOpen(true)}
  className="group inline-flex items-center gap-2 whitespace-nowrap font-display text-sm font-semibold text-gold transition-colors duration-300 hover:text-gold/60 sm:text-base"
>
  View All Categories
  <span className="transition-transform duration-300 group-hover:translate-x-1">
    →
  </span>
</button>

            </div>

            {/* AUTO-SCROLLING STRIP */}
            <div
              ref={viewportRef}
              onMouseEnter={pauseScroll}
              onMouseLeave={resumeScroll}
              onTouchStart={pauseScroll}
              onTouchEnd={resumeScroll}
              onFocusCapture={pauseScroll}
              onBlurCapture={resumeScroll}
              className="overflow-hidden pb-4"
            >
              <div
                ref={trackRef}
                className="flex w-max will-change-transform"
              >
                {renderSet(false)}
                {renderSet(true)}
              </div>
            </div>

            
          </div>
        </div>
      </section>

      <CategoryMindmap
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
      />
    </>
  );
};
