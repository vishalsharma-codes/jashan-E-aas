import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Check, Search } from "lucide-react";
import { PageHeading, StickyAction, goldBtn } from "@/components/wedding/WeddingFlowLayout";
import { useWeddingFlow } from "@/context/WeddingFlowContext";
import { SERVICES, SERVICE_GROUPS, getService, hintedServiceIds, type GroupId, type WeddingService } from "@/lib/weddingTaxonomy";
import { eventCategories } from "@/lib/categoryData";

/** Tier 4 - 33 services, multi-select chips grouped into the legacy groups. Hints are suggestions only. */
const LEGACY_FILTER_GROUPS: Record<string, GroupId[]> = {
  "Theme-Based Weddings": ["decor", "venue"],
  "Culture-Based Weddings": ["priest", "catering", "decor"],
  "Pre-Wedding Ceremonies": ["planning", "photo", "entertainment"],
  "Photography & Video": ["photo"],
  "Decor & Florals": ["decor"],
  "Catering & Food": ["catering"],
  "Bridal & Grooming": ["bridal"],
  "Entertainment & Artists": ["entertainment", "effects"],
  "Venue & Logistics": ["venue"],
  "Priest & Rituals": ["priest"],
  "Invitations & Stationery": ["invites"],
  "Special Effects": ["effects", "photo"],
};

const legacyWeddingFilters = eventCategories.find((category) => category.id === "wedding")?.subCategories ?? [];

export default function WeddingServices() {
  const navigate = useNavigate();
  const { format, functionIds, serviceIds, setServiceIds, path } = useWeddingFlow();
  const [q, setQ] = useState("");
  const [legacyFilter, setLegacyFilter] = useState("All services");

  const suggested = useMemo(
    () => hintedServiceIds(functionIds).map(getService).filter(Boolean) as WeddingService[],
    [functionIds],
  );

  if (!format) return <Navigate to="/weddings" replace />;

  const toggle = (id: number) =>
    setServiceIds(serviceIds.includes(id) ? serviceIds.filter((x) => x !== id) : [...serviceIds, id]);

  const needle = q.trim().toLowerCase();
  const legacyLabels = legacyWeddingFilters.map((group) =>
    group.name.includes("Florals") && !group.name.startsWith("Decor") ? "Decor & Florals" : group.name
  );
  const matches = (s: WeddingService) => {
    const matchesText = !needle || `${s.name} ${s.subtitle ?? ""}`.toLowerCase().includes(needle);
    const groups = LEGACY_FILTER_GROUPS[legacyFilter];
    return matchesText && (!groups || groups.includes(s.group));
  };

  const Chip = ({ s }: { s: WeddingService }) => {
    const on = serviceIds.includes(s.id);
    return (
      <button
        type="button"
        onClick={() => toggle(s.id)}
        aria-pressed={on}
        className={`flex items-start gap-2 rounded-xl border px-4 py-2.5 text-left transition ${
          on ? "border-[#d4af37] bg-[#d4af37]/15" : "border-white/15 bg-white/5 hover:border-[#d4af37]/60"
        }`}
      >
        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${on ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-white/40"}`}>
          {on && <Check className="h-3 w-3" />}
        </span>
        <span>
          <span className="block text-sm font-medium">{s.name}</span>
          {s.subtitle && <span className="block text-[11px] text-white/50">{s.subtitle}</span>}
        </span>
      </button>
    );
  };

  return (
    <>
      <PageHeading eyebrow="Step 4" title="Select Required Services" sub="Pick every vendor service you need. We'll match vendors next." />

      <div className="mx-auto mb-8 flex max-w-2xl items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services (e.g. mehandi, DJ, cake)"
            className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#d4af37]"
          />
        </div>
        <span className="whitespace-nowrap text-sm text-[#f0c94a]">{serviceIds.length} selected</span>
      </div>

      <div className="mx-auto mb-7 flex max-w-5xl flex-wrap justify-center gap-2">
        <button
          type="button"
          aria-pressed={legacyFilter === "All services"}
          onClick={() => setLegacyFilter("All services")}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${legacyFilter === "All services" ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-white/20 text-white/70 hover:border-[#d4af37]"}`}
        >
          All services
        </button>
        {legacyWeddingFilters.map((group, index) => {
          const label = legacyLabels[index];
          return (
            <button
              key={group.name}
              type="button"
              aria-pressed={legacyFilter === label}
              onClick={() => setLegacyFilter(legacyFilter === label ? "All services" : label)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${legacyFilter === label ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-white/20 text-white/70 hover:border-[#d4af37]"}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {!needle && suggested.filter(matches).length > 0 && (
        <section className="mb-8 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-5">
          <h2 className="mb-3 font-serif text-lg text-[#d4af37]">Suggested for your functions</h2>
          <div className="flex flex-wrap gap-2">{suggested.filter(matches).map((s) => <Chip key={s.id} s={s} />)}</div>
        </section>
      )}

      <div className="space-y-8">
        {SERVICE_GROUPS.map((g) => {
          const list = SERVICES.filter((s) => s.group === g.id && matches(s));
          if (!list.length) return null;
          return (
            <section key={g.id}>
              <h2 className="mb-3 font-serif text-lg text-[#d4af37]">{g.name}</h2>
              <div className="flex flex-wrap gap-2">{list.map((s) => <Chip key={s.id} s={s} />)}</div>
            </section>
          );
        })}
        {needle && !SERVICES.some(matches) && <p className="text-center text-white/50">No services match "{q}".</p>}
      </div>

      <StickyAction>
        <span className="text-sm text-white/70">{serviceIds.length} service{serviceIds.length === 1 ? "" : "s"} selected</span>
        <button type="button" className={goldBtn} disabled={!serviceIds.length} onClick={() => navigate(path("vendors"))}>
          Find Matching Vendors
        </button>
      </StickyAction>
    </>
  );
}
