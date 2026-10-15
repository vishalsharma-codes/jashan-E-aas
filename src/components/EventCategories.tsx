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
import { useState } from "react";

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

  return (
    <>
      <section className="py-20 bg-charcoal-light/50" id="categories">
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

<div className="w-full">
  {/* Explore All at the top-right */}
{/* Section heading and View All link */}
<div className="mb-4 flex items-center justify-between">
  <h3 className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-gold">
    EVENT CATEGORIES
  </h3>

  <button
  onClick={() => setIsCategoryOpen(true)}
  className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:text-gold/60"
>
  View all Event Categories →
</button>
</div>

{/* First 4 categories in 2 columns */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {eventCategories.slice(0, 4).map((category, index) => (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08 }}
      >
        <Link
  to={`/category/${category.id}`}
  className="group relative flex min-h-48 w-full items-end overflow-hidden rounded-xl border border-border p-5 transition-all duration-300 hover:border-gold/60"
  style={{
   backgroundImage: `linear-gradient(to top, rgba(15,15,18,0.95), rgba(15,15,18,0.15)), url("${categoryImageMap[category.name]}")`,
    backgroundSize: "cover",
    backgroundPosition: "center 25%",
  }}
>
  <div className="relative z-10 text-left">
    <h3 className="font-semibold text-base md:text-lg text-white transition-colors group-hover:text-gold">
      {category.name}
    </h3>

    <p className="mt-2 text-xs leading-6 text-white/80">
      {category.subCategories
        .slice(0, 3)
        .map((subCategory) => subCategory.name)
        .join(" · ")}
    </p>
  </div>
</Link>
      </motion.div>
    ))}
  </div>
</div>



        {/* Quick-filter tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2 mt-12"
        >
          <span className="text-muted-foreground text-sm mr-1">Popular searches:</span>
          {ALL_QUICK_TYPES.map((type) => (
            <Link
              key={type}
              to={`/vendors?type=${encodeURIComponent(type)}`}
              className="px-4 py-1.5 rounded-full bg-secondary text-foreground/80 text-sm font-medium border border-border hover:border-gold/50 hover:text-gold transition-colors"
            >
              {type}
            </Link>
          ))}
        </motion.div>
      </div>
      </section>

      <CategoryMindmap
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
      />
    </>
  );
};