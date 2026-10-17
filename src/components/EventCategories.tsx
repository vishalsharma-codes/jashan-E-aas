import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { eventCategories } from "@/lib/categoryData";
import weddingsImg from "./outerCategory/categoryImages/weddings.jpg";
import corporateImg from "./outerCategory/categoryImages/corporate-events.jpg";
import socialImg from "./outerCategory/categoryImages/social-parties.jpg";
import educationalImg from "./outerCategory/categoryImages/educational-events.jpg"; 
import concertsImg from "./outerCategory/categoryImages/concerts-shows.jpg";
import religiousImg from "./outerCategory/categoryImages/religious-spiritual.jpg"; 
import { CategoryMindmap } from "./outerCategory/CategoryMindmap";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ALL_QUICK_TYPES = [
  "Weddings", "Corporate", "Birthdays", "Concerts", "Religious", "College Fests",
  "Sports Events", "Fashion Shows", "Tech Events", "Charity Events",
];

const categoryImageMap: Record<string, string> = {
  "Weddings": weddingsImg,
  "Corporate Events": corporateImg,
  "Social Parties": socialImg,
  "Educational Events": educationalImg,
  "Concerts & Shows": concertsImg,
  "Religious & Spiritual": religiousImg,
};

export const EventCategories = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

const slideCategories = (direction: "left" | "right") => {
  if (!sliderRef.current) return;

  sliderRef.current.scrollBy({
    left:
      direction === "right"
        ? sliderRef.current.clientWidth / 2
        : -sliderRef.current.clientWidth / 2,
    behavior: "smooth",
  });
};

  return (
    <>
      <section className="py-10 bg-charcoal-light/50" id="categories">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="text-gold font-medium uppercase tracking-wider text-sm">Browse by Event Type</span>
            <Sparkles className="w-5 h-5 text-gold" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Every Event, <span className="text-gradient-gold">Every Vendor</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            20 comprehensive event categories · 100+ sub-types · 15,000+ verified vendors across India
          </p>
        </motion.div>


{/* Event Categories Slider */}
<div className="w-full">
  {/* Heading and slider controls */}
  <div className="mb-6 flex items-center justify-between gap-3">
    <h3 className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-gold">
      Event Categories
    </h3>

    <div className="flex items-center gap-2">
      <button
        onClick={() => slideCategories("left")}
        aria-label="Previous categories"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={() => slideCategories("right")}
        aria-label="Next categories"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  </div>

  {/* Horizontal slider */}
  <div
    ref={sliderRef}
    className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {eventCategories.slice(0, 6).map((category, index) => (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06 }}
        className="flex w-[calc((100%-4.5rem)/4)] min-w-[220px] shrink-0 snap-start justify-center"
      >
        <Link
          to={`/category/${category.id}`}
          className="group flex w-full flex-col items-center text-center"
        >
          {/* Circular image */}
          <div
            className="relative mb-4 aspect-square w-36 sm:w-40 lg:w-44 overflow-hidden rounded-full border border-white/10 transition-all duration-500 group-hover:scale-105 group-hover:border-gold group-hover:shadow-[0_0_28px_rgba(212,175,55,0.22)]"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(15,15,18,0.25), transparent 45%), url("${categoryImageMap[category.name]}")`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }}
          >
            <div className="absolute inset-2 rounded-full border border-white/15 transition-colors duration-300 group-hover:border-gold/50" />
          </div>

          <h3 className="font-display text-base sm:text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-gold">
            {category.name}
          </h3>

          <p className="mt-2 max-w-[200px] text-xs leading-5 text-muted-foreground">
            {category.subCategories
              .slice(0, 2)
              .map((subCategory) => subCategory.name)
              .join(" · ")}
          </p>
        </Link>
      </motion.div>
    ))}

    {/* View Other Categories — after the first six */}
   
<div className="flex w-[220px] shrink-0 snap-start items-center justify-center px-4">
  <button
    onClick={() => setIsCategoryOpen(true)}
    className="group inline-flex items-center gap-2 whitespace-nowrap font-display text-lg font-semibold text-gold transition-colors duration-300 hover:text-gold/60"
  >
    View Other Categories
    <span className="transition-transform duration-300 group-hover:translate-x-1">
      →
    </span>
  </button>
</div>

  </div>
</div>

<CategoryMindmap
  isOpen={isCategoryOpen}
  onClose={() => setIsCategoryOpen(false)}
/>

      </div>
      </section>

      <CategoryMindmap
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
      />
    </>
  );
};