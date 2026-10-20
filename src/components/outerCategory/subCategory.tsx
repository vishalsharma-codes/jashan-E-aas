import { useState } from "react";
import type { ElementType } from "react";
import type { SubCategory } from "@/lib/categoryData";

import {
  Palette,
  Landmark,
  CalendarDays,
  Camera,
  Flower2,
  Utensils,
  Sparkles,
  Music,
  MapPin,
  Mail,
  WandSparkles,
  Church,
  ArrowRight,
} from "lucide-react";

import weddingMain from "./subCategoryImages/wedding/weddingMain.png";
import themeWeddingImage from "./subCategoryImages/wedding/theme-based-weddings.jpg.jpeg";
import cultureWeddingImage from "./subCategoryImages/wedding/culture-based-weddings.jpg.jpeg";
import preWeddingImage from "./subCategoryImages/wedding/pre-wedding-ceremonies.jpg.jpeg";
import photographyImage from "./subCategoryImages/wedding/photography-video.jpg.jpeg";
import decorImage from "./subCategoryImages/wedding/decor-florals.jpg.jpeg";
import cateringImage from "./subCategoryImages/wedding/catering-food.jpg.jpeg";
import bridalImage from "./subCategoryImages/wedding/bridal-grooming.jpg.jpeg";
import entertainmentImage from "./subCategoryImages/wedding/entertainment-artists.jpg.jpeg";
import venueImage from "./subCategoryImages/wedding/venue-logistics.jpg.jpeg";
import priestRitualsImage from "./subCategoryImages/wedding/priest-rituals.png";
import invitationsImage from "./subCategoryImages/wedding/invitations-stationery.jpg.jpeg";
import specialEffectsImage from "./subCategoryImages/wedding/special-effects.jpg.jpeg";

interface SubCategoryProps {
  subcategories: SubCategory[];
  onSelect: (subcategory: SubCategory) => void;
}

const weddingImages = [
  themeWeddingImage,
  cultureWeddingImage,
  preWeddingImage,
  photographyImage,
  decorImage,
  cateringImage,
  bridalImage,
  entertainmentImage,
  venueImage,
  priestRitualsImage,
  invitationsImage,
  specialEffectsImage,
];

const weddingIcons: ElementType[] = [
  Palette,
  Landmark,
  CalendarDays,
  Camera,
  Flower2,
  Utensils,
  Sparkles,
  Music,
  MapPin,
  Church,
  Mail,
  WandSparkles,
];

// Shows a warm gradient instead of a broken-image icon and alt text
// when a picture is missing or cannot be decoded.
const CardImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#4a3410] via-[#1c1510] to-[#0d0d12]" />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
    />
  );
};

export default function WeddingSubcategoryCards({
  subcategories,
  onSelect,
}: SubCategoryProps) {
  return (
    <div
      className="
        relative
        z-10
        mx-auto
        grid
        w-full
        max-w-[1600px]
        grid-cols-1
        gap-x-5
        gap-y-5
        px-4
        pb-8
        sm:grid-cols-2
        lg:grid-cols-4
      "
    >
      {subcategories.map((subcategory, index) => {
        const Icon = weddingIcons[index] || Palette;

        return (
          <button
            key={subcategory.name}
            type="button"
            onClick={() => onSelect(subcategory)}
            className="
              group
              relative
              h-[180px]
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-[#d4af37]/30
              bg-[#17181f]
              text-left
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#d4af37]
              hover:shadow-[0_15px_45px_rgba(0,0,0,0.6)]
              focus:outline-none
              focus-visible:border-[#d4af37]
            "
          >
            {/* Background image */}
            <CardImage src={weddingImages[index]} alt={subcategory.name} />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />

            {/* Hover glow */}
            <div
              className="
                absolute
                inset-0
                opacity-0
                group-hover:opacity-100
                transition-opacity
                duration-300
                bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_70%)]
              "
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  {/* Icon */}
                  <div
                    className="
                      w-11
                      h-11
                      rounded-lg
                      bg-black/70
                      border
                      border-white/20
                      backdrop-blur-sm
                      flex
                      items-center
                      justify-center
                      mb-3
                      group-hover:border-[#d4af37]
                      transition-all
                    "
                  >
                    <Icon className="w-6 h-6 text-[#d4af37]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-white text-[18px] font-semibold leading-tight drop-shadow-lg">
                    {subcategory.name}
                  </h3>

                  {/* Services */}
                  <p className="text-white/60 text-xs mt-1">
                    {subcategory.services?.length ?? 0} services
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight
                  className="
                    w-5
                    h-5
                    text-[#d4af37]
                    mb-1
                    transition-transform
                    duration-300
                    group-hover:translate-x-2
                  "
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function WeddingHeader() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Wedding image */}
      <div
        className="
          relative
          w-[190px]
          h-[190px]
          rounded-full
          overflow-hidden
          border-2
          border-[#d4af37]
          shadow-[0_0_40px_rgba(212,175,55,0.4)]
        "
      >
        {failed ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4a3410] to-[#0d0d12]">
            <Flower2 className="h-16 w-16 text-[#d4af37]" />
          </div>
        ) : (
          <img
            src={weddingMain}
            alt="Weddings"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* WEDDINGS */}
      <p className="mt-4 text-[#d4af37] text-[15px] font-semibold tracking-[0.3em] uppercase">
        WEDDINGS
      </p>

      {/* Main heading */}
      <h1 className="mt-1 font-serif text-white text-4xl md:text-5xl font-semibold leading-tight">
        Plan Your Perfect Wedding
      </h1>

      {/* Description */}
      <p className="mt-2 text-white/65 text-base max-w-2xl">
        Explore wedding services and find trusted vendors for every part of your celebration.
      </p>
    </div>
  );
}
