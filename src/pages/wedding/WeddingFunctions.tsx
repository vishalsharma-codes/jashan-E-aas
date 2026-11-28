import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ImageCard from "@/components/wedding/ImageCard";
import { PageHeading, StickyAction, goldBtn } from "@/components/wedding/WeddingFlowLayout";
import { useWeddingFlow } from "@/context/WeddingFlowContext";
import { DEFAULT_FUNCTION_IDS, FUNCTIONS } from "@/lib/weddingTaxonomy";
import { FUNCTION_IMAGES } from "@/lib/weddingImages";

/** Tier 3 - 14 sub-events, multi-select. At least one required; Main Wedding Ceremony preselected on first arrival. */
export default function WeddingFunctions() {
  const navigate = useNavigate();
  const { format, functionIds, hasFunctionsParam, setFunctionIds, path } = useWeddingFlow();

  useEffect(() => {
    if (!hasFunctionsParam) setFunctionIds(DEFAULT_FUNCTION_IDS, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!format) return <Navigate to="/weddings" replace />;

  const all = FUNCTIONS.map((f) => f.id);
  const allSelected = functionIds.length === all.length;
  const toggle = (id: number) =>
    setFunctionIds(functionIds.includes(id) ? functionIds.filter((x) => x !== id) : [...functionIds, id]);

  return (
    <>
      <PageHeading eyebrow="Step 3" title="Select Wedding Functions" sub="Which celebrations are you planning? Choose at least one." />

      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => setFunctionIds(allSelected ? [] : all)}
          className="rounded-lg border border-[#d4af37]/50 px-4 py-2 text-sm text-[#d4af37] transition hover:bg-[#d4af37]/10"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FUNCTIONS.map((f, i) => (
          <ImageCard
            key={f.id}
            index={i}
            multi
            selected={functionIds.includes(f.id)}
            title={f.name}
            subtitle={f.subtitle}
            image={FUNCTION_IMAGES[f.id]}
            onClick={() => toggle(f.id)}
          />
        ))}
      </div>

      <StickyAction>
        <span className="text-sm text-white/70">{functionIds.length} of {all.length} selected</span>
        <button type="button" className={goldBtn} disabled={!functionIds.length} onClick={() => navigate(path("services"))}>
          Continue to Services
        </button>
      </StickyAction>
    </>
  );
}
