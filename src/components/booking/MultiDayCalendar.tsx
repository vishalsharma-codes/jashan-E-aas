import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

export const MAX_DAYS = 6;
const MONTHS_AHEAD = 24; // calendar can go exactly 2 years past the current month

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const formatDay = (iso: string, withWeekday = false) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(withWeekday ? { weekday: "short" } : {}),
  });

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthLabel = (d: Date) => d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

interface Props {
  value: string[];                  // selected "YYYY-MM-DD" days, sorted
  onChange: (dates: string[]) => void;
  max?: number;
}

/** Compact month calendar: tap up to `max` separate days. Hover (or tap) the month title to jump to any month in the next 2 years. */
export function MultiDayCalendar({ value, onChange, max = MAX_DAYS }: Props) {
  const today = toISO(new Date());

  // every month the user may browse: this month … this month + 24
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_AHEAD + 1 }, (_, i) => new Date(now.getFullYear(), now.getMonth() + i, 1));
  }, []);
  const first = months[0];
  const last = months[months.length - 1];

  const [cursor, setCursor] = useState(() => {
    const d = value[0] ? new Date(`${value[0]}T00:00:00`) : new Date();
    const c = new Date(d.getFullYear(), d.getMonth(), 1);
    return c < first ? first : c > last ? last : c;
  });
  const [listOpen, setListOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // when the list opens, scroll the current month into the middle of it
  useEffect(() => {
    if (listOpen && listRef.current && activeRef.current) {
      listRef.current.scrollTop = activeRef.current.offsetTop - listRef.current.clientHeight / 2 + 16;
    }
  }, [listOpen]);

  const cells = useMemo(() => {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const out: (string | null)[] = Array(firstDay.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(toISO(new Date(cursor.getFullYear(), cursor.getMonth(), d)));
    return out;
  }, [cursor]);

  const toggle = (iso: string) => {
    if (value.includes(iso)) return onChange(value.filter((d) => d !== iso));
    if (value.length >= max) {
      toast.error(`You can select up to ${max} days`, { description: "Remove a day to pick a different one." });
      return;
    }
    onChange([...value, iso].sort());
  };

  const atFirst = cursor.getTime() <= first.getTime();
  const atLast = cursor.getTime() >= last.getTime();
  const step = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <div className="mx-auto w-full max-w-[300px] rounded-2xl border border-border bg-muted/40 p-3">
      {/* month header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          disabled={atFirst}
          onClick={() => step(-1)}
          className="rounded-full p-1 hover:bg-gold/10 disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* month + year, with a hover/tap dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setListOpen(true)}
          onMouseLeave={() => setListOpen(false)}
        >
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={listOpen}
            className="flex items-center gap-1 rounded-md px-2 py-1 font-serif text-sm font-semibold hover:bg-gold/10"
          >
            {monthLabel(cursor)}
            <ChevronDown className={`h-3.5 w-3.5 text-gold transition-transform ${listOpen ? "rotate-180" : ""}`} />
          </button>

          {listOpen && (
            <div className="absolute left-1/2 top-full z-30 -translate-x-1/2 pt-1">
              <div
                ref={listRef}
                data-lenis-prevent
                role="listbox"
                className="max-h-52 w-44 overflow-y-auto rounded-xl border border-gold/30 bg-card p-1 shadow-2xl [scrollbar-width:thin]"
              >
                {months.map((m) => {
                  const isCur = m.getTime() === cursor.getTime();
                  return (
                    <button
                      key={m.getTime()}
                      ref={isCur ? activeRef : undefined}
                      type="button"
                      role="option"
                      aria-selected={isCur}
                      onClick={() => { setCursor(m); setListOpen(false); }}
                      className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                        isCur ? "bg-gold font-semibold text-background" : "hover:bg-gold/10"
                      }`}
                    >
                      {monthLabel(m)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={atLast}
          onClick={() => step(1)}
          className="rounded-full p-1 hover:bg-gold/10 disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* grid */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">{w}</div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e${i}`} />;
          const past = iso < today;
          const on = value.includes(iso);
          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              onClick={() => toggle(iso)}
              className={`h-8 rounded-md text-xs transition-all ${
                on
                  ? "bg-gold font-bold text-background shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  : past
                  ? "cursor-not-allowed text-muted-foreground/30"
                  : iso === today
                  ? "border border-gold/60 hover:bg-gold/10"
                  : "hover:bg-gold/10"
              }`}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>

      {/* selected chips */}
      <div className="mt-3 border-t border-border pt-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            <span className="font-semibold text-gold">{value.length}</span> / {max} days selected
          </span>
          {value.length > 0 && (
            <button type="button" onClick={() => onChange([])} className="hover:text-gold">Clear all</button>
          )}
        </div>
        {value.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/70">Tap one day, or up to {max} days for multi-day functions.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {value.map((d) => (
              <span key={d} className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[11px] text-gold">
                {formatDay(d, true)}
                <button type="button" onClick={() => toggle(d)} aria-label={`Remove ${d}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}