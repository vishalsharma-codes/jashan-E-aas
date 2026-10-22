import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

// Quick-pick chips (same event types as your subcategory image folders)
const QUICK_FILTERS = [
  "Wedding",
  "Concert",
  "Corporate Event",
  "Educational",
  "Government Event",
  "Religious",
  "Social Party",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  resultCount?: number;
}

/** Search icon for the Jhalak header. Tap it to open the bar; type or pick a chip. */
export function ReelSearch({ value, onChange, resultCount }: Props) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-center transition-colors ${value ? "text-gold" : "text-white hover:text-gold"}`}
        aria-label="Search reels"
        title="Search reels"
      >
        <Search className="h-6 w-6 drop-shadow" />
      </button>

      {open && (
        <div className="fixed top-14 inset-x-0 z-50 px-4">
          <div className="mx-auto max-w-md rounded-2xl border border-gold/30 bg-black/90 backdrop-blur p-3 shadow-2xl">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 h-10 focus-within:ring-1 focus-within:ring-gold/60">
              <Search className="w-4 h-4 text-white/60 shrink-0" />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search wedding, concert, decor, photographer…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
              />
              {value && (
                <button onClick={() => onChange("")} aria-label="Clear search" className="text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {QUICK_FILTERS.map((f) => {
                const active = value.trim().toLowerCase() === f.toLowerCase();
                return (
                  <button
                    key={f}
                    onClick={() => onChange(active ? "" : f)}
                    className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      active ? "bg-gold text-black border-gold" : "border-gold/40 text-gold hover:bg-gold/10"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {value && typeof resultCount === "number" && (
              <p className="mt-2 text-xs text-white/60">
                {resultCount} reel{resultCount === 1 ? "" : "s"} found
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}