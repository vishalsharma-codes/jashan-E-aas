import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventCategories, EventCategory, SubCategory } from "@/lib/categoryData";

/**
 * Horizontal accordion for the "Select event type" screen.
 *  - Collapsed panels: dim, greyscale slivers with the name written vertically
 *  - Active panel: widens, turns full colour, shows sub-type chips + Explore
 *  - Auto-scrolls through the categories; pauses while you hover / focus it
 *  - Hover or focus activates a panel; click opens your existing sub-type popup
 *  - Touch screens: first tap expands a panel, second tap opens it
 */
interface Props {
  items: EventCategory[];
  query: string;
  setQuery: (q: string) => void;
  images: Record<string, string>;
  paused?: boolean; // pass true while the popup is open
  onOpen: (category: EventCategory, rect: DOMRect) => void;
  onOpenSub: (category: EventCategory, sub: SubCategory) => void;
}

const COLLAPSED = 56; // px width of a collapsed sliver

const PanelImage = ({ src, alt, gradient, className = "" }: {
  src?: string; alt: string; gradient?: string; className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`absolute inset-0 bg-gradient-to-br ${gradient ?? "from-[#3a2a0a] to-[#0d0d12]"}`} />;
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

export default function CategoryShowcase({
  items, query, setQuery, images, paused = false, onOpen, onOpenSub,
}: Props) {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false); // pointer / focus is inside the strip
  const rowRef = useRef<HTMLDivElement>(null);

  // headline numbers computed from your real data
  const totals = useMemo(() => {
    const subs = eventCategories.reduce((n, c) => n + c.subCategories.length, 0);
    const services = eventCategories.reduce(
      (n, c) => n + c.subCategories.reduce((m, s) => m + s.services.length, 0), 0);
    return { cats: eventCategories.length, subs, services };
  }, []);

  // keep index valid when search filters the list
  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [items.length, active]);

  // auto-scroll
  useEffect(() => {
    if (paused || hold || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % items.length), 3800);
    return () => clearInterval(t);
  }, [paused, hold, items.length]);

  // on narrow screens the row scrolls sideways: keep the active panel centred
  useEffect(() => {
    const row = rowRef.current;
    const el = row?.children[active] as HTMLElement | undefined;
    if (!row || !el) return;
    const id = setTimeout(() => {
      row.scrollTo({
        left: el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2,
        behavior: "smooth",
      });
    }, 250);
    return () => clearTimeout(id);
  }, [active, items.length]);

  const isTouch = () => window.matchMedia("(hover: none)").matches;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-2 sm:px-4">
      {/* ───────── Intro text ───────── */}
      <div className="flex flex-shrink-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-gold sm:text-4xl lg:text-5xl">
            What kind of event
            <span className="block text-white">are you planning?</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/65 sm:text-base">
            Choose an event type to see what it covers, then pick a sub-type to find verified vendors
            for every part of your celebration.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/80 sm:text-sm">
            {[
              `${totals.cats} event types`,
              `${totals.subs} sub-types`,
              `${totals.services}+ services`,
              "Verified vendors only",
            ].map((t) => (
              <span key={t} className="rounded-full border border-gold/30 bg-black/50 px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md flex-shrink-0 md:w-96">
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
      </div>

      {/* ───────── Accordion strip ───────── */}
      {items.length === 0 ? (
        <div className="pt-16 text-center">
          <p className="text-white/70">No event type matches "{query}".</p>
          <Button onClick={() => setQuery("")} className="mt-4 bg-gold text-background hover:bg-gold-dark">
            Show all categories
          </Button>
        </div>
      ) : (
        <>
          <div
            ref={rowRef}
            data-lenis-prevent
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
            }}
            className="flex min-h-[300px] flex-1 gap-2 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((c, i) => {
              const on = i === active;
              const shown = c.subCategories.slice(0, 4);
              const extra = c.subCategories.length - shown.length;
              const serviceCount = c.subCategories.reduce((n, s) => n + s.services.length, 0);

              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${c.name}`}
                  onMouseEnter={() => !isTouch() && setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={(e) => {
                    if (isTouch() && !on) {
                      setActive(i);
                      return;
                    }
                    onOpen(c, e.currentTarget.getBoundingClientRect());
                  }}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onOpen(c, e.currentTarget.getBoundingClientRect());
                    }
                  }}
                  style={{
                    flex: on ? `9 1 ${COLLAPSED}px` : `1 1 ${COLLAPSED}px`,
                    minWidth: on ? "min(420px, 78vw)" : COLLAPSED,
                  }}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 bg-black transition-[flex,min-width,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,0.8,0.22,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    on
                      ? "border-gold shadow-[0_0_34px_rgba(212,175,55,0.45)]"
                      : "border-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.1)] hover:border-gold/60"
                  }`}
                >
                  {/* photo: greyscale when collapsed, colour when active */}
                  <PanelImage
                    src={images[c.name]}
                    alt={c.name}
                    gradient={c.gradient}
                    className={`transition-[filter,transform] duration-700 ${
                      on ? "scale-100" : "scale-110 brightness-50 grayscale"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/15" />

                  {/* collapsed: small icon + vertical name */}
                  <div
                    className={`absolute inset-x-0 top-3 flex justify-center text-xl transition-opacity duration-300 ${
                      on ? "opacity-0" : "opacity-90"
                    }`}
                  >
                    {c.icon}
                  </div>
                  <span
                    className={`absolute bottom-5 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap font-serif text-base tracking-wide text-white/90 transition-opacity duration-200 [writing-mode:vertical-rl] ${
                      on ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    {c.name}
                  </span>

                  {/* active: details */}
                  <div
                    className={`absolute inset-x-0 bottom-0 flex min-w-[340px] flex-col gap-3 p-5 transition-all duration-500 sm:p-7 ${
                      on ? "translate-y-0 opacity-100 delay-300" : "pointer-events-none translate-y-4 opacity-0"
                    }`}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/70 bg-black/70 text-3xl shadow-[0_0_14px_rgba(212,175,55,0.3)]">
                      {c.icon}
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl leading-tight text-white drop-shadow-lg sm:text-4xl">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/70">
                        {c.subCategories.length} sub-types · {serviceCount} services
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pr-14">
                      {shown.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          tabIndex={on ? 0 : -1}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSub(c, s);
                          }}
                          className="rounded-full border border-white/25 bg-black/55 px-3 py-1 text-xs text-white transition-colors hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          {s.name}
                        </button>
                      ))}
                      {extra > 0 && (
                        <span className="rounded-full border border-gold/60 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                          +{extra} more
                        </span>
                      )}
                    </div>
                    <span
                      aria-hidden
                      className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full border border-gold text-lg text-gold transition-colors group-hover:bg-gold group-hover:text-black sm:bottom-7 sm:right-7"
                    >
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ───────── Footer: progress dots + hint ───────── */}
          <div className="flex flex-shrink-0 items-center justify-between gap-4 pb-1">
            <p className="hidden text-xs text-white/45 sm:block">
              Hover a panel to preview it, click to explore its sub-types.
            </p>
            <div className="flex items-center gap-1.5">
              {items.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`Show ${c.name}`}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === active ? "w-8 bg-gold" : "w-1.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
