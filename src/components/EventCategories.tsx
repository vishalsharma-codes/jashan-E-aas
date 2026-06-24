import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { eventCategories } from "@/lib/categoryData";

const ALL_QUICK_TYPES = [
  "Weddings", "Corporate", "Birthdays", "Concerts", "Religious", "College Fests",
  "Sports Events", "Fashion Shows", "Tech Events", "Charity Events",
];

export const EventCategories = () => {
  return (
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {eventCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -5, transition: { duration: 0.18 } }}
            >
              <Link
                to={`/category/${category.id}`}
                className="group relative flex flex-col items-center p-4 rounded-2xl bg-card border border-border hover:border-gold/50 transition-all duration-300 h-full"
              >
                <div className="absolute inset-0 rounded-2xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Gradient icon tile */}
                <div className={`relative w-14 h-14 mb-3 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>

                <h3 className="font-semibold text-xs text-center text-foreground group-hover:text-gold transition-colors leading-tight">
                  {category.name}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {category.subCategories.length} sub-types
                </p>

                {/* Arrow on hover */}
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-2.5 h-2.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
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
  );
};
