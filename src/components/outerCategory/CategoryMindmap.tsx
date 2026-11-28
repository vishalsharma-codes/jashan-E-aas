import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { CATEGORIES } from "@/lib/eventTaxonomy";
import { categoryRoute } from "@/flow/categoryRoutes";

const images = import.meta.glob("./categoryImages/*.{jpg,jpeg,png,webp,avif}", { eager: true, import: "default" }) as Record<string, string>;
const imageFile: Record<string, string> = {
  "CAT-01": "weddings", "CAT-02": "corporate-events", "CAT-03": "social-parties", "CAT-04": "educational-events",
  "CAT-05": "concerts-shows", "CAT-06": "religious-spiritual", "CAT-07": "exhibitions-expos", "CAT-08": "sports-events",
  "CAT-09": "government-events", "CAT-10": "charity-ngo-events", "CAT-11": "fashion-lifestyle", "CAT-12": "virtual-hybrid-events",
  "CAT-13": "festivals-melas", "CAT-14": "hospitality-fnb", "CAT-15": "film-media-events", "CAT-16": "tech-innovation",
  "CAT-17": "health-wellness", "CAT-18": "community-events", "CAT-19": "agricultural-rural-events", "CAT-20": "automotive-events",
};

export function CategoryMindmap({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.filter((category) => !q || `${category.name} ${category.shortName} ${category.functions.map((f) => f.name).join(" ")}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!window.history.state?.mindmap) window.history.pushState({ ...(window.history.state ?? {}), mindmap: true }, "");
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      if (!event.state?.mindmap && isOpen) onClose();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const close = () => {
    onClose();
    if (window.history.state?.mindmap) window.history.back();
  };
  const go = (label: string) => {
    const to = categoryRoute(label) ?? "/events";
    onClose();
    navigate(to, { state: { fromEventTypeOverlay: true } });
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#09090d]/95 p-4 text-white backdrop-blur-md sm:p-8" role="dialog" aria-modal="true" aria-label="Select Event Type">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[.3em] text-[#d4af37]">Plan an occasion</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">Select Event Type</h2></div>
          <button onClick={close} aria-label="Close" className="rounded-full border border-white/20 p-3 hover:bg-white/10"><X /></button>
        </div>
        <div className="relative mb-6 max-w-md"><Search size={17} className="absolute left-3 top-3 text-white/50" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search categories or event types" className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 outline-none focus:border-[#d4af37]" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const file = imageFile[category.id];
            const imagePath = Object.keys(images).find((path) => path.toLowerCase().endsWith(`/${file}.jpg`));
            const image = imagePath ? images[imagePath] : "";
            const chips = category.functions.slice(0, 3).map((f) => f.name.split("(")[0].trim());
            return <div key={category.id} role="link" tabIndex={0} onClick={() => go(category.shortName)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(category.shortName); } }} className="group relative flex min-h-52 cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#30232a] to-[#121219] p-5 transition hover:border-[#d4af37]">
              {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition group-hover:scale-105" />}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              <div className="pointer-events-none relative"><h3 className="font-serif text-2xl font-semibold">{category.shortName}</h3><div className="mt-3 flex flex-wrap gap-2">{chips.map((chip) => <span key={chip} className="rounded-full border border-white/30 px-2.5 py-1 text-xs text-white/85">{chip}</span>)}{category.functions.length > 3 && <span className="rounded-full border border-[#d4af37]/50 px-2.5 py-1 text-xs text-[#f0d775]">+{category.functions.length - 3} more</span>}</div></div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
