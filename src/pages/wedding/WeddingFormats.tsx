import { useNavigate } from "react-router-dom";
import ImageCard from "@/components/wedding/ImageCard";
import { PageHeading } from "@/components/wedding/WeddingFlowLayout";
import { useWeddingFlow } from "@/context/WeddingFlowContext";
import { ALL_VARIANT, FORMATS } from "@/lib/weddingTaxonomy";
import { pickImage } from "@/lib/weddingImages";

/** Tier 2 - six wedding formats */
export default function WeddingFormats() {
  const navigate = useNavigate();
  const { path } = useWeddingFlow();

  return (
    <>
      <PageHeading
        eyebrow="Weddings"
        title="Choose Your Wedding Format"
        sub="Pick the style of celebration. Next we'll narrow down the variant, functions and services."
      />
      <div className="mx-auto grid max-w-[1450px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FORMATS.map((f, i) => (
          <ImageCard
            key={f.id}
            index={i}
            title={f.name}
            subtitle={f.tagline}
            image={pickImage(...f.imageKeys, "weddingMain")}
            onClick={() =>
              navigate(
                f.variants.length
                  ? path("variants", { format: f.id })
                  : path("functions", { format: f.id, variant: ALL_VARIANT }), // auto-skip variants
              )
            }
          />
        ))}
      </div>
    </>
  );
}
