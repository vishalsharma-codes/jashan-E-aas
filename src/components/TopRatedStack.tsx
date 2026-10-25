import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, MapPin, Star, Tag } from "lucide-react";

/* Top Rated — sticky tilted stack (Blush Peach theme)
   Desktop: one sticky full-screen panel per vendor.
   Mobile / reduced-motion: same panels as a plain vertical list. */

export interface StackVendor {
  id: string | number;
  name: string;
  location: string;
  rating: number | string;
  reviews?: number | string;
  price: string;
  category?: string;
  gradient: string; // tailwind "from-x to-y"
  initials?: string;
  isVerified?: boolean;
  portfolio: {
    id: string | number;
    emoji?: string;
    gradient?: string;
    image?: string; // optional real photo
  }[];
}

/* Blush Peach tokens used in this file */
const CREAM = "#FFF6F2";
const PEACH = "#FFC9B0"; // accent text on photo panels
const ROSE = "#C44A68";

const WAVE =
  "M0,0 H1440 V30 C1260,80 1140,0 960,30 C780,60 660,70 480,40 C300,10 160,60 0,30 Z";

function useStackEnabled() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setOn(wide.matches && !reduce.matches);
    upd();
    wide.addEventListener("change", upd);
    reduce.addEventListener("change", upd);
    return () => {
      wide.removeEventListener("change", upd);
      reduce.removeEventListener("change", upd);
    };
  }, []);
  return on;
}

function Headline({ name, city }: { name: string; city: string }) {
  const short = name.split(/\s[—–-]\s/)[0].trim().toUpperCase();
  const first = short.charAt(0);
  const rest = short.slice(1);
  return (
    <h3 className="break-words font-[Figtree] text-[clamp(2.4rem,7.2vw,6.6rem)] font-extrabold leading-[0.95] tracking-tight text-white drop-shadow-[0_6px_30px_rgba(74,52,64,0.55)]">
      <span className="mr-[0.04em] font-[UnifrakturCook] font-normal">{first}</span>
      {rest}
      <span className="mx-[0.25em] font-[Instrument_Serif] font-normal italic text-[#FFC9B0]">
        ×
      </span>
      <span className="font-[Instrument_Serif] font-normal italic text-white/90">
        {city}
      </span>
    </h3>
  );
}

function PanelBody({
  v,
  index,
  total,
  headlineY,
  onJumpToLast,
}: {
  v: StackVendor;
  index: number;
  total: number;
  headlineY?: MotionValue<number>;
  onJumpToLast?: () => void;
}) {
  const cover = v.portfolio[0];
  const bgGradient = cover?.gradient ?? v.gradient;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {cover?.image ? (
        <img
          src={cover.image}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`}>
          <span className="absolute -right-10 top-1/2 -translate-y-1/2 select-none text-[28rem] leading-none opacity-[0.13] blur-[2px]">
            {cover?.emoji}
          </span>
        </div>
      )}
      {/* soft plum tint (instead of pure black) keeps white text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A3440]/75 via-[#4A3440]/15 to-[#4A3440]/35" />

      <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 md:px-14 md:py-12">
        {/* top row */}
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 rounded-full border border-white/40 bg-[#4A3440]/35 px-4 py-1.5 font-[Figtree] text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
            <span style={{ color: PEACH }}>#{index + 1}</span>
            Top rated
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onJumpToLast}
              aria-label={`Jump to the last card, card ${total} of ${total}`}
              title="Jump to the last card in this section"
              className="rounded-full border border-white/40 bg-[#4A3440]/40 px-3 py-1.5 font-[Instrument_Serif] text-xl text-white/90 backdrop-blur transition hover:border-[#FFC9B0] hover:text-[#FFC9B0] focus:outline-none focus:ring-2 focus:ring-[#FFC9B0]"
            >
              {String(index + 1).padStart(2, "0")}
              <span className="text-white/60"> / {String(total).padStart(2, "0")}</span>
            </button>
            <button
              type="button"
              onClick={onJumpToLast}
              className="rounded-full border border-white/40 bg-[#4A3440]/40 px-4 py-2 font-[Figtree] text-xs font-semibold uppercase tracking-wider text-white transition hover:border-white hover:bg-white hover:text-[#C44A68] focus:outline-none focus:ring-2 focus:ring-[#FFC9B0]"
            >
              Skip <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* headline */}
        <motion.div style={{ y: headlineY }} className="max-w-[1100px]">
          <Headline name={v.name} city={v.location} />
          <div className="mt-6 flex flex-wrap items-center gap-2.5 font-[Figtree] text-sm text-white">
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 backdrop-blur">
              <Star className="h-3.5 w-3.5" style={{ fill: PEACH, color: PEACH }} />
              <b>{v.rating}</b>
              {v.reviews !== undefined && <span className="text-white/70">({v.reviews})</span>}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 backdrop-blur">
              <Tag className="h-3.5 w-3.5" style={{ color: PEACH }} />
              {v.price}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 backdrop-blur">
              <MapPin className="h-3.5 w-3.5" style={{ color: PEACH }} />
              {v.location}
            </span>
            {v.category && (
              <span className="rounded-full bg-white/20 px-3.5 py-1.5 backdrop-blur">
                {v.category}
              </span>
            )}
            {v.isVerified && (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-1.5 font-semibold text-emerald-700 backdrop-blur">
                <CheckCircle className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </div>
        </motion.div>

        {/* bottom row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-3">
            {v.portfolio.slice(0, 4).map((p, k) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className={`relative flex h-28 w-20 items-center justify-center overflow-hidden rounded-t-full rounded-b-lg border border-white/60 shadow-xl md:h-36 md:w-24 ${
                  k % 2 ? "mt-4" : ""
                }`}
              >
                {p.image ? (
                  <img src={p.image} alt="" draggable={false} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                      p.gradient ?? v.gradient
                    } text-3xl`}
                  >
                    {p.emoji}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <Link
            to={`/vendors?vendor=${v.id}`}
            className="group inline-flex items-center gap-3 self-start rounded-full bg-[#C44A68] px-7 py-3.5 font-[Figtree] text-sm font-bold uppercase tracking-wider text-white transition-all hover:gap-5 hover:bg-white hover:text-[#C44A68] md:self-auto"
          >
            View profile
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StackPanel({
  v,
  index,
  total,
  progress,
  onJumpToLast,
}: {
  v: StackVendor;
  index: number;
  total: number;
  progress: MotionValue<number>;
  onJumpToLast?: () => void;
}) {
  const steps = Math.max(total - 1, 1);
  const first = index === 0;
  const last = index === total - 1;

  const inA = first ? 0 : (index - 1) / steps;
  const inB = first ? 1 : index / steps;
  const outA = last ? 0 : index / steps;
  const outB = last ? 1 : (index + 1) / steps;

  const rotateRaw = useTransform(progress, [inA, inB], first ? [0, 0] : [3.2, 0], { clamp: true });
  const rotate = useSpring(rotateRaw, { stiffness: 140, damping: 22, mass: 0.4 });
  const scaleRaw = useTransform(progress, [outA, outB], last ? [1, 1] : [1, 0.92], { clamp: true });
  const scale = useSpring(scaleRaw, { stiffness: 140, damping: 22, mass: 0.4 });
  const dim = useTransform(progress, [outA, outB], last ? [0, 0] : [0, 0.6], { clamp: true });
  const headlineY = useTransform(progress, [inA, inB], first ? [0, 0] : [150, 0], { clamp: true });

  return (
    <motion.div
      style={{
        rotate,
        scale,
        transformOrigin: "left top",
        zIndex: index + 1,
        willChange: "transform",
      }}
      id={last ? "top-rated-last-card" : undefined}
      className={`sticky top-0 h-screen w-full overflow-hidden bg-[#FFF6F2] shadow-[0_-30px_60px_-20px_rgba(196,74,104,0.35)] ${
        first ? "" : "rounded-t-[2rem] border-t border-white/60"
      }`}
    >
      <PanelBody v={v} index={index} total={total} headlineY={headlineY} onJumpToLast={onJumpToLast} />
      {/* when covered, the panel fades into cream instead of black */}
      <motion.div
        style={{ opacity: dim, backgroundColor: CREAM }}
        className="pointer-events-none absolute inset-0"
      />
      {first && (
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 w-full"
          style={{ fill: CREAM }}
        >
          <path d={WAVE} />
        </svg>
      )}
      {last && (
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-12 w-full -scale-y-100"
          style={{ fill: CREAM }}
        >
          <path d={WAVE} />
        </svg>
      )}
    </motion.div>
  );
}

export function TopRatedStack({
  vendors,
  max = 5,
}: {
  vendors: StackVendor[];
  max?: number;
}) {
  const list = vendors.slice(0, max);
  const enabled = useStackEnabled();
  const wrapRef = useRef<HTMLDivElement>(null);
  const jumpToLast = () => {
    if (enabled && wrapRef.current) {
      const sectionTop = wrapRef.current.getBoundingClientRect().top + window.scrollY;
      const lastPanelTop = sectionTop + wrapRef.current.offsetHeight - window.innerHeight;
      window.scrollTo({ top: Math.max(0, lastPanelTop), behavior: "smooth" });
      return;
    }
    const lastCard = document.getElementById("top-rated-last-card");
    lastCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="relative bg-[#FFF6F2]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;800&family=Instrument+Serif:ital@0;1&family=UnifrakturCook:wght@700&display=swap');`}</style>

      {/* heading */}
      <div className="container mx-auto px-4 pb-10 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-gold">
              Highest rated
            </p>
            <h2 className="font-[Instrument_Serif] text-4xl text-foreground md:text-6xl">
              Top Rated{" "}
              <span className="italic text-[#C44A68]">This Month</span>
            </h2>
          </div>
          <Link
            to="/vendors"
            className="inline-flex items-center rounded-md border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/10"
          >
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {enabled ? (
        <div ref={wrapRef} style={{ height: `${list.length * 100}vh` }} className="relative">
          {list.map((v, i) => (
            <StackPanel
              key={v.id}
              v={v}
              index={i}
              total={list.length}
              progress={scrollYProgress}
              onJumpToLast={jumpToLast}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 pb-16">
          {list.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              id={i === list.length - 1 ? "top-rated-last-card" : undefined}
              className="min-h-[560px] overflow-hidden rounded-3xl"
            >
              <PanelBody v={v} index={i} total={list.length} onJumpToLast={jumpToLast} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TopRatedStack;