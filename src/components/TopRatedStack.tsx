import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  MapPin,
  Star,
  Tag,
} from "lucide-react";

/* Top Rated — infinite horizontal stack (Blush Peach theme)
   New card slides in from the side, tilted, over the previous one.
   Swipe / drag / horizontal wheel / arrows / dots + autoplay. */

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

const CREAM = "#FFF6F2";
const PEACH = "#FFC9B0";
const ROSE = "#C44A68";

const WAVE =
  "M0,0 H1440 V30 C1260,80 1140,0 960,30 C780,60 660,70 480,40 C300,10 160,60 0,30 Z";

function Headline({ name, city }: { name: string; city: string }) {
  const short = name.split(/\s[—–-]\s/)[0].trim().toUpperCase();
  const first = short.charAt(0);
  const rest = short.slice(1);
  const size =
    short.length > 34
      ? "clamp(1.6rem,3.6vw,3.2rem)"
      : short.length > 22
      ? "clamp(1.9rem,4.8vw,4.4rem)"
      : "clamp(2.4rem,7.2vw,6.6rem)";
  return (
    <h3
      style={{ fontSize: size }}
      className="break-words font-[Figtree] font-extrabold leading-[0.95] tracking-tight text-white drop-shadow-[0_6px_30px_rgba(74,52,64,0.55)]"
    >
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
}: {
  v: StackVendor;
  index: number;
  total: number;
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
      {/* soft plum tint keeps white text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A3440]/75 via-[#4A3440]/15 to-[#4A3440]/35" />

      <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 md:px-14 md:py-12">
        {/* top row */}
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 rounded-full border border-white/40 bg-[#4A3440]/35 px-4 py-1.5 font-[Figtree] text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
            <span style={{ color: PEACH }}>#{index + 1}</span>
            Top rated
          </span>
          <span className="rounded-full border border-white/40 bg-[#4A3440]/40 px-3 py-1.5 font-[Instrument_Serif] text-xl text-white/90 backdrop-blur">
            {String(index + 1).padStart(2, "0")}
            <span className="text-white/60"> / {String(total).padStart(2, "0")}</span>
          </span>
        </div>

        {/* headline */}
        <motion.div
          variants={{
            enter: { y: 150, opacity: 0 },
            center: {
              y: 0,
              opacity: 1,
              transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
            },
            exit: { y: 0, opacity: 1 },
          }}
          className="max-w-[1100px]"
        >
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
        <div className="flex flex-col gap-6 pb-6 md:flex-row md:items-end md:justify-between">
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
            draggable={false}
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

export function TopRatedStack({
  vendors,
  max = 5,
  autoplayMs = 5000,
  pauseOnHover = false,
}: {
  vendors: StackVendor[];
  max?: number;
  autoplayMs?: number;
  pauseOnHover?: boolean;
}) {
  const list = vendors.slice(0, max);
  const n = list.length;
  const reduce = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [dragging, setDragging] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);
  const wheelLockRef = useRef(0);

  const next = useCallback(() => {
    setDir(1);
    setIndex((i) => (i + 1) % n);
  }, [n]);
  const prev = useCallback(() => {
    setDir(-1);
    setIndex((i) => (i - 1 + n) % n);
  }, [n]);
  const goTo = (i: number) => {
    if (i === index) return;
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };

  const paused = dragging || hidden || (pauseOnHover && hover);

  // autoplay — plain timer, restarts after every change (auto or manual)
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setTimeout(next, autoplayMs);
    return () => clearTimeout(t);
  }, [n, paused, index, next, autoplayMs]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // horizontal wheel / trackpad swipe (vertical scroll stays normal)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 20) return;
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLockRef.current < 800) return;
      wheelLockRef.current = now;
      if (e.deltaX > 0) next();
      else prev();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  const slideVariants: Variants = {
    enter: (d: number) => ({
      x: reduce ? 0 : d > 0 ? "100%" : "-100%",
      rotate: reduce ? 0 : d > 0 ? 3.2 : -3.2,
      scale: 1,
      opacity: reduce ? 0 : 1,
      zIndex: 2,
    }),
    center: {
      x: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      zIndex: 2,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: 0,
      rotate: 0,
      scale: reduce ? 1 : 0.92,
      opacity: 1,
      zIndex: 1,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (n === 0) return null;
  const v = list[index];

  return (
    <section className="relative bg-[#FFF6F2]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;800&family=Instrument+Serif:ital@0;1&family=UnifrakturCook:wght@700&display=swap');
        @keyframes tr-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

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
              Top Rated <span className="italic text-[#C44A68]">This Month</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous vendor"
                  className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-[#FFC9B0]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next vendor"
                  className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-[#FFC9B0]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
            <Link
              to="/vendors"
              className="inline-flex items-center rounded-md border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/10"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* stage */}
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Top rated vendors"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onPanStart={() => {
          movedRef.current = false;
          setDragging(true);
        }}
        onPan={(_, info) => {
          if (Math.abs(info.offset.x) > 8) movedRef.current = true;
        }}
        onPanEnd={(_, info) => {
          setDragging(false);
          if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
            if (info.offset.x < -60 || info.velocity.x < -500) next();
            else if (info.offset.x > 60 || info.velocity.x > 500) prev();
          }
          setTimeout(() => (movedRef.current = false), 0);
        }}
        onClickCapture={(e) => {
          if (movedRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        style={{ touchAction: "pan-y" }}
        className="relative h-screen min-h-[620px] w-full select-none overflow-hidden bg-[#FFF6F2] outline-none"
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={v.id}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${n}`}
            style={{ transformOrigin: "left top", willChange: "transform" }}
            className="absolute inset-0 overflow-hidden rounded-t-[2rem] border-t border-white/60 bg-[#FFF6F2] shadow-[0_-30px_60px_-20px_rgba(196,74,104,0.35)]"
          >
            <PanelBody v={v} index={index} total={n} />
            {/* when covered, the card fades into cream */}
            <motion.div
              variants={{
                enter: { opacity: 0 },
                center: { opacity: 0 },
                exit: { opacity: reduce ? 0 : 0.6 },
              }}
              style={{ backgroundColor: CREAM }}
              className="pointer-events-none absolute inset-0 z-20"
            />
          </motion.div>
        </AnimatePresence>

        {/* wavy edges */}
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-12 w-full"
          style={{ fill: CREAM }}
        >
          <path d={WAVE} />
        </svg>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-12 w-full -scale-y-100"
          style={{ fill: CREAM }}
        >
          <path d={WAVE} />
        </svg>
      </div>

      {/* dots */}
      {n > 1 && (
        <div className="flex items-center justify-center gap-2 pb-12 pt-6">
          {list.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to vendor ${i + 1}`}
                aria-current={active}
                className="relative h-2 overflow-hidden rounded-full transition-all duration-500"
                style={{ width: active ? 56 : 8, backgroundColor: "rgba(196,74,104,0.22)" }}
              >
                {active && (
                  <span
                    key={index}
                    className="absolute inset-0 origin-left"
                    style={{
                      backgroundColor: ROSE,
                      animation: `tr-fill ${autoplayMs}ms linear forwards`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TopRatedStack;