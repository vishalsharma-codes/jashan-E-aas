import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  image?: string;
  index?: number;
  /** multi-select mode: shows a checkbox badge instead of an arrow */
  multi?: boolean;
  selected?: boolean;
  onClick: () => void;
};

/** Same look as the existing Wedding subcategory cards (gold border, dark overlay, hover zoom). */
export default function ImageCard({ title, subtitle, image, index = 0, multi, selected, onClick }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={multi ? !!selected : undefined}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35 }}
      className={`group relative h-[190px] w-full overflow-hidden rounded-2xl border bg-[#17181f] text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:border-[#d4af37] ${
        selected ? "border-[#d4af37] ring-2 ring-[#d4af37]/60" : "border-[#d4af37]/30 hover:border-[#d4af37]"
      }`}
    >
      {image && !failed ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a3410] via-[#1c1510] to-[#0d0d12]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_70%)]" />

      <div className="absolute inset-0 flex items-end justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold leading-tight text-white drop-shadow-lg">{title}</h3>
          {subtitle && <p className="mt-1 line-clamp-2 text-xs text-white/65">{subtitle}</p>}
        </div>
        {multi ? (
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
              selected ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-white/40 bg-black/50 text-transparent"
            }`}
          >
            <Check className="h-4 w-4" />
          </span>
        ) : (
          <ArrowRight className="mb-1 h-5 w-5 shrink-0 text-[#d4af37] transition-transform duration-300 group-hover:translate-x-2" />
        )}
      </div>
    </motion.button>
  );
}
