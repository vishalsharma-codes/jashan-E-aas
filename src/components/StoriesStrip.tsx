import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star } from "lucide-react";

export interface Story {
  name: string;
  event: string;
  text: string;
  rating: number;
  avatar: string;
  gradient: string; // fallback when the photo is missing
  image: string; // e.g. "/images/stories/priya-arjun.jpg"
}

/**
 * Row of photo cards. At rest every card is a small image tile.
 * Hover (or tap on mobile) makes that card grow wider + taller,
 * zooms its photo and slides the testimonial text in. The others shrink slightly.
 */
export function StoriesStrip({ stories }: { stories: Story[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      className="mx-auto flex max-w-5xl flex-col gap-4 md:h-[500px] md:flex-row md:items-center"
      onMouseLeave={() => setActive(null)}
    >
      {stories.map((s, i) => {
        const isActive = active === i;
        const someActive = active !== null;

        return (
          <motion.article
            key={s.name}
            tabIndex={0}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(isActive ? null : i)}
            initial={false}
            animate={{
              height: isActive ? 440 : someActive ? 270 : 300,
              flexGrow: isActive ? 2.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-gold md:basis-0"
          >
            {/* fallback gradient (visible if the image is missing) */}
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />

            {/* photo – zooms when active */}
            <motion.img
              src={s.image}
              alt={s.name}
              loading="lazy"
              draggable={false}
              onError={(e) => (e.currentTarget.style.display = "none")}
              animate={{ scale: isActive ? 1.12 : 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* dark overlay – gets stronger when text shows */}
            <motion.div
              animate={{ opacity: isActive ? 1 : 0.55 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10"
            />

            <div className="relative flex h-full flex-col justify-end p-5">
              {/* quote text – only on the active card */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="mb-4"
                  >
                    <Quote className="mb-2 h-7 w-7 text-gold/70" />
                    <p className="text-sm italic leading-relaxed text-white/90">
                      “{s.text}”
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* name row – always visible */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${s.gradient} text-sm font-bold text-white ring-2 ring-white/20`}
                >
                  {s.avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{s.name}</p>
                  <p className="truncate text-xs text-white/60">{s.event}</p>
                </div>
                <div className="ml-auto flex shrink-0">
                  {Array.from({ length: s.rating }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-gold text-gold" />
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
