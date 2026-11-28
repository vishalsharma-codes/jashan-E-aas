import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ImageCard from "@/components/wedding/ImageCard";
import { PageHeading } from "@/components/wedding/WeddingFlowLayout";
import { useWeddingFlow } from "@/context/WeddingFlowContext";
import { ALL_VARIANT } from "@/lib/weddingTaxonomy";
import { pickImage } from "@/lib/weddingImages";

/** Tier 2b - variants of the chosen format. Formats with no variants never render this. */
export default function WeddingVariants() {
  const navigate = useNavigate();
  const { format, path } = useWeddingFlow();
  const [showMore, setShowMore] = useState(false);

  if (!format) return <Navigate to="/weddings" replace />;
  if (!format.variants.length) return <Navigate to={path("functions", { variant: ALL_VARIANT })} replace />;

  const list = showMore ? [...format.variants, ...(format.moreVariants ?? [])] : format.variants;

  return (
    <>
      <PageHeading eyebrow={format.name} title="Select Your Variant" sub="Choose the one that fits best, or skip if you're still deciding." />

      <div className="mx-auto grid max-w-[1450px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((v, i) => (
          <ImageCard
            key={v.id}
            index={i}
            title={v.name}
            image={pickImage(`${v.id}-wedding`, ...format.imageKeys)}
            onClick={() => navigate(path("functions", { variant: v.id }))}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {!!format.moreVariants?.length && (
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            className="rounded-xl border border-[#d4af37]/50 px-6 py-2.5 text-sm text-[#d4af37] transition hover:bg-[#d4af37]/10"
          >
            {showMore ? "Fewer themes" : "More themes"}
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(path("functions", { variant: ALL_VARIANT }))}
          className="rounded-xl border border-white/20 px-6 py-2.5 text-sm text-white/70 transition hover:border-[#d4af37] hover:text-[#d4af37]"
        >
          Not sure yet - show everything
        </button>
      </div>
    </>
  );
}
