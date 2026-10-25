import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/* Auto-load every image in outerCategory/categoryImages (adjust the path if your
   folder is elsewhere relative to THIS file). */
const found = import.meta.glob(
  "./outerCategory/categoryImages/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default" }
) as Record<string, string>;

/* Finds an image whose file name contains the keyword, e.g. "wedding" */
const pick = (key: string) =>
  Object.entries(found).find(([path]) =>
    path.toLowerCase().includes(key.toLowerCase())
  )?.[1] ?? "";

/* ------------------------------------------------------------------ */
/* 1. DATA                                                             */
/* ------------------------------------------------------------------ */
export type Category = {
  slug: string;
  name: string;
  subtitle: string;
  image: string;
};

const CATEGORIES: Category[] = [
  { slug: "agricultural", name: "Agricultural & Rural", subtitle: "Fairs · Livestock · Rural Shows", image: pick("agri") },
  { slug: "automotive", name: "Automotive Events", subtitle: "Auto Shows · Launches · Rallies", image: pick("auto") },
  { slug: "weddings", name: "Weddings", subtitle: "Theme-Based · Culture-Based", image: pick("wedding") },
  { slug: "corporate", name: "Corporate Events", subtitle: "Conferences · Launches · Activations", image: pick("corporate") },
  { slug: "social", name: "Social Parties", subtitle: "Birthdays · Kids Party", image: pick("social") },
  { slug: "concerts", name: "Concerts & Music", subtitle: "Live Shows · Festivals", image: pick("concert") },
  { slug: "religious", name: "Religious Events", subtitle: "Pujas · Satsang · Jagrans", image: pick("religio") },
];

/* ------------------------------------------------------------------ */
/* 2. TWEAK THE CURVE HERE                                             */
/* ------------------------------------------------------------------ */
const TILT = 34;      // degrees each side card turns toward the centre
const LIFT = 70;      // px the outer cards drop -> the curved "smile" line
const DEPTH = 170;    // px the outer cards come toward you (cylinder feel)

export default function CategoryCarousel({
  categories = CATEGORIES,
  onSelect,
  autoPlay = true,
  speed = 45,
  pauseOnHover = false,
}: {
  categories?: Category[];
  onSelect?: (c: Category) => void;
  autoPlay?: boolean;
  speed?: number; // px per second
  pauseOnHover?: boolean;
}) {
  const n = categories.length;
  const loop = [...categories, ...categories, ...categories];

  const scroller = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const raf = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeRef = useRef(n);
  const paused = useRef(false);
  const pos = useRef(0);
  const holdUntil = useRef(0);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [active, setActive] = useState(n);

  const slot = (g: number) => items.current[g]?.parentElement as HTMLElement | null;

  const centerLeft = (g: number) => {
    const el = scroller.current;
    const t = slot(g);
    if (!el || !t) return 0;
    return t.offsetLeft - el.clientWidth / 2 + t.clientWidth / 2;
  };

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const centre = box.left + box.width / 2;
    let best = 0;
    let bestDist = Infinity;

    items.current.forEach((node, i) => {
      if (!node) return;
      const r = node.parentElement!.getBoundingClientRect();
      const d = (r.left + r.width / 2 - centre) / (box.width / 2);
      const c = Math.max(-1.5, Math.min(1.5, d));
      const abs = Math.abs(c);

      node.style.transform = `translate3d(0, ${c * c * LIFT}px, ${abs * DEPTH}px) rotateY(${-c * TILT}deg)`;
      node.style.opacity = String(1 - Math.min(abs, 1.5) * 0.18);

      if (abs < bestDist) {
        bestDist = abs;
        best = i;
      }
    });
    activeRef.current = best;
    setActive((p) => (p === best ? p : best));
  }, []);

  const normalize = useCallback(() => {
    const el = scroller.current;
    if (!el || drag.current.down) return;
    const w = centerLeft(2 * n) - centerLeft(n);
    const pitch = w / n;
    if (el.scrollLeft < centerLeft(n) - pitch / 2) el.scrollLeft += w;
    else if (el.scrollLeft >= centerLeft(2 * n) - pitch / 2) el.scrollLeft -= w;
  }, [n]);

  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(update);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(normalize, 150);
  };

  const goTo = useCallback((g: number, smooth = true) => {
    if (smooth) holdUntil.current = performance.now() + 1400;
    scroller.current?.scrollTo({
      left: centerLeft(g),
      behavior: smooth ? "smooth" : "auto",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    goTo(n, false);
    update();
  }, [n, goTo, update]);

  useEffect(() => {
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf.current);
      clearTimeout(idleTimer.current);
    };
  }, [update]);

  /* ---------- Auto scroll (continuous, endless) ---------- */
  useEffect(() => {
    if (!autoPlay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = performance.now();
    let id = 0;

    const tick = (t: number) => {
      const dt = Math.min(t - last, 50);
      last = t;
      const el = scroller.current;
      if (el) {
        if (Math.abs(el.scrollLeft - pos.current) > 2) pos.current = el.scrollLeft;

        if (!paused.current && !drag.current.down && t > holdUntil.current && !document.hidden) {
          pos.current += (speed * dt) / 1000;
          const w = centerLeft(2 * n) - centerLeft(n);
          const lo = centerLeft(n) - w / n / 2;
          const hi = centerLeft(2 * n) - w / n / 2;
          if (pos.current >= hi) pos.current -= w;
          else if (pos.current < lo) pos.current += w;
          el.scrollLeft = pos.current;
        }
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [autoPlay, speed, n]); // eslint-disable-line react-hooks/exhaustive-deps

  const pause = () => (paused.current = true);
  const resume = () => (paused.current = false);

  const step = (dir: 1 | -1) => {
    normalize();
    goTo(activeRef.current + dir);
  };

  const jumpToDot = (i: number) => {
    const cur = activeRef.current;
    goTo(cur - (cur % n) + i);
  };

  const down = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = scroller.current!;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    el.style.scrollSnapType = "none";
  };
  const move = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    scroller.current!.scrollLeft = drag.current.startLeft - dx;
  };
  const up = () => {
    if (!drag.current.down) return;
    drag.current.down = false;
    scroller.current!.style.scrollSnapType = "";
    if (drag.current.moved) goTo(activeRef.current);
    setTimeout(() => (drag.current.moved = false), 0);
  };

  const click = (c: Category, g: number) => {
    if (drag.current.moved) return;
    if (g !== activeRef.current) return goTo(g);
    onSelect ? onSelect(c) : (window.location.href = `/category/${c.slug}`);
  };

  return (
    /* Blush Peach: cream background, plum text, rose accent */
    <section className="relative overflow-hidden bg-[#FFF6F2] py-20 text-[#4A3440]">
      {/* soft peach glow behind the cards */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFC9B0]/40 blur-[120px]" />

      {/* ---------- Heading ---------- */}
      <header className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C44A68]">
          ✦ Browse by event type ✦
        </p>
        <h2 className="mt-4 font-serif text-4xl md:text-6xl">
          Every Event,{" "}
          <span className="italic text-[#C44A68]">Every Vendor</span>
        </h2>
        {/* <p className="mt-4 text-sm text-[#4A3440]/70 md:text-base">
          20 event categories · 100+ sub-types · 15,000+ verified vendors across India
        </p> */}
      </header>

      {/* ---------- Carousel ---------- */}
      <div
        className="relative mt-12"
        style={{ perspective: "1200px" }}
        onMouseEnter={pauseOnHover ? pause : undefined}
        onMouseLeave={pauseOnHover ? resume : undefined}
        onTouchStart={pause}
        onTouchEnd={() => setTimeout(resume, 2500)}
      >
        <div
          ref={scroller}
          onScroll={onScroll}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="relative flex gap-1 overflow-x-auto px-[calc(50%-130px)] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-[calc(50%-160px)]"
          style={{ cursor: "grab" }}
        >
          {loop.map((c, g) => {
            const isActive = g === active;
            return (
              <div
                key={`${c.slug}-${g}`}
                className="w-[260px] shrink-0 md:w-[320px]"
              >
                <div
                  ref={(node) => {
                    items.current[g] = node;
                  }}
                  onClick={() => click(c, g)}
                  className={`group relative aspect-[3/4] cursor-pointer select-none overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-300 will-change-transform ${
                    isActive
                      ? "border-[#C44A68]/70 shadow-[0_20px_60px_-15px_rgba(196,74,104,0.45)]"
                      : "border-[#C44A68]/15"
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {!c.image && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFD9C7] via-[#FBD3DC] to-[#FFF6F2]" />
                  )}
                  <img
                    src={c.image || undefined}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    alt={c.name}
                    draggable={false}
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${c.image ? "" : "hidden"}`}
                  />
                  {/* soft plum fade so the white text stays readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A3440]/85 via-[#4A3440]/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3
                      className={`font-serif text-xl leading-tight transition-colors ${
                        isActive ? "text-[#FFC9B0]" : "text-white"
                      }`}
                    >
                      {c.name}
                    </h3>
                    <p className="mt-1 text-xs text-white/80">{c.subtitle}</p>
                    <span
                      className={`mt-3 inline-block text-xs font-semibold text-[#FFC9B0] transition-all duration-300 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                      }`}
                    >
                      Explore vendors →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(["prev", "next"] as const).map((d) => (
          <button
            key={d}
            aria-label={d === "prev" ? "Previous category" : "Next category"}
            onClick={() => step(d === "prev" ? -1 : 1)}
            className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#C44A68]/30 bg-white/85 text-xl text-[#C44A68] shadow-md backdrop-blur transition hover:border-[#C44A68] hover:bg-[#C44A68] hover:text-white md:flex ${
              d === "prev" ? "left-6" : "right-6"
            }`}
          >
            {d === "prev" ? "←" : "→"}
          </button>
        ))}
      </div>

      {/* ---------- Dots + View all ---------- */}
      <div className="relative mt-4 flex flex-col items-center gap-5">
        <div className="flex gap-2">
          {categories.map((c, i) => (
            <button
              key={c.slug}
              aria-label={c.name}
              onClick={() => jumpToDot(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active % n ? "w-8 bg-[#C44A68]" : "w-1.5 bg-[#4A3440]/25"
              }`}
            />
          ))}
        </div>
        <a
          href="/categories"
          className="font-serif text-sm font-semibold text-[#C44A68] hover:underline"
        >
          View All Categories →
        </a>
      </div>
    </section>
  );
}