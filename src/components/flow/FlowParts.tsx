import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/* Blush Peach tokens - change here to retheme every step */
export const C = { bg: "#FFF6F2", ink: "#4A3440", rose: "#C44A68", peach: "#FFC9B0" };

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Your selection" className="flex flex-wrap items-center gap-1 text-sm text-[#4A3440]/70">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
          {it.to ? (
            <Link to={it.to} className="hover:text-[#C44A68] hover:underline">{it.label}</Link>
          ) : (
            <span className="font-medium text-[#4A3440]">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function StepHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <header className="mt-6 max-w-2xl">
      <h1 className="font-serif text-3xl md:text-5xl text-[#4A3440]">{title}</h1>
      {desc && <p className="mt-3 text-[#4A3440]/70">{desc}</p>}
    </header>
  );
}

interface CardProps {
  title: string;
  subtitle?: string;
  chips?: string[];
  image?: string;
  hue?: number;
  selected?: boolean;
  multi?: boolean;
  onClick: () => void;
}

/** One card for every tier: formats, variants and sub-events. */
export function OptionCard({ title, subtitle, chips, image, hue = 12, selected, multi, onClick }: CardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      aria-pressed={multi ? !!selected : undefined}
      className={`group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C44A68] ${
        selected ? "border-[#C44A68] shadow-[0_16px_40px_-16px_rgba(196,74,104,0.55)]" : "border-[#C44A68]/15"
      }`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 90% 88%), hsl(${(hue + 30) % 360} 80% 94%))` }}
    >
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          draggable={false}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A3440]/85 via-[#4A3440]/15 to-transparent" />

      {multi && (
        <span
          className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
            selected ? "border-[#C44A68] bg-[#C44A68] text-white" : "border-white/80 bg-white/30 text-transparent"
          }`}
        >
          <Check className="h-4 w-4" />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-serif text-lg leading-tight text-white md:text-xl">{title}</h3>
        {subtitle && <p className="mt-1 line-clamp-1 text-xs text-white/80">{subtitle}</p>}
        {chips && chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {chips.slice(0, 4).map((c) => (
              <span key={c} className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] text-white backdrop-blur">{c}</span>
            ))}
            {chips.length > 4 && <span className="px-1 text-[11px] text-white/80">+{chips.length - 4}</span>}
          </div>
        )}
      </div>
    </motion.button>
  );
}

/** Stays at the bottom: Back, a live count and Continue. Continue works with zero picks. */
export function StickyBar({
  summary, onBack, onContinue, continueLabel = "Continue", extra,
}: { summary: string; onBack: () => void; onContinue: () => void; continueLabel?: string; extra?: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#C44A68]/15 bg-[#FFF6F2]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button onClick={onBack} className="flex items-center gap-1 rounded-full px-3 py-2 text-sm text-[#4A3440] hover:bg-[#C44A68]/10">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="hidden flex-1 truncate text-center text-sm text-[#4A3440]/75 sm:block">{summary}</p>
        <div className="flex items-center gap-2">
          {extra}
          <button
            onClick={onContinue}
            className="flex items-center gap-2 rounded-full bg-[#C44A68] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#a83a56]"
          >
            {continueLabel} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ServiceChip({ label, detail, selected, onClick }: { label: string; detail?: string[]; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C44A68] ${
        selected ? "border-[#C44A68] bg-[#C44A68]/10" : "border-[#C44A68]/15 bg-white hover:border-[#C44A68]/50"
      }`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[#C44A68] bg-[#C44A68] text-white" : "border-[#4A3440]/30 text-transparent"}`}>
        <Check className="h-3 w-3" />
      </span>
      <span>
        <span className="block text-sm font-medium text-[#4A3440]">{label}</span>
        {detail && detail.length > 0 && <span className="mt-0.5 block text-xs text-[#4A3440]/60">{detail.join(", ")}</span>}
      </span>
    </button>
  );
}
