import type { ElementType } from "react";
import type { SubCategory } from "@/lib/categoryData";

import {
  Umbrella,
  Flower2,
  Gem,
  Crown,
  Sparkles,
  Leaf,
  Square,
  TreePine,
  Building2,
  ArrowRight,
} from "lucide-react";

// ============================================================
// IMAGES
// ============================================================

import themeBasedWeddingImage from "../subCategoryImages/wedding/theme-based-weddings.jpg.jpeg";
import beachWedding from "../subCategoryImages/wedding/beach-wedding.jpg.jpeg";
import gardenWedding from "../subCategoryImages/wedding/garden-wedding.jpg.jpeg";
import vintageWedding from "../subCategoryImages/wedding/vintage-wedding.jpg.jpeg";
import royalWedding from "../subCategoryImages/wedding/royal-wedding.jpg.jpeg";
import bohemianWedding from "../subCategoryImages/wedding/bohemian-wedding.jpg.jpeg";
import rusticWedding from "../subCategoryImages/wedding/rustic-wedding.jpg.jpeg";
import modernMinimalistWedding from "../subCategoryImages/wedding/modern-minimalist-wedding.jpg.jpeg";
import forestWedding from "../subCategoryImages/wedding/forest-wedding.jpg.jpeg";
import rooftopWedding from "../subCategoryImages/wedding/rooftop-wedding.jpg.jpeg";

// ============================================================
// PROPS
// ============================================================

interface SubCategoryProps {
  subcategories: SubCategory[];
  onSelect: (subcategory: SubCategory) => void;
}

// ============================================================
// IMAGE + ICON DATA
// ============================================================

const weddingImages = [
  beachWedding,
  gardenWedding,
  vintageWedding,
  royalWedding,
  bohemianWedding,
  rusticWedding,
  modernMinimalistWedding,
  forestWedding,
  rooftopWedding,
];

const weddingIcons: ElementType[] = [
  Umbrella,
  Flower2,
  Gem,
  Crown,
  Sparkles,
  Leaf,
  Square,
  TreePine,
  Building2,
];

// ============================================================
// CARD DESCRIPTIONS
// ============================================================

const weddingDescriptions = [
  "Romantic celebrations by the sea",
  "Elegant celebrations surrounded by nature",
  "Timeless elegance with classic charm",
  "Grand celebrations with royal elegance",
  "Free-spirited and artistic celebrations",
  "Warm, natural and intimate celebrations",
  "Clean, elegant and contemporary style",
  "Magical celebrations surrounded by forests",
  "Modern celebrations with stunning city views",
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function WeddingSubcategoryCards({
  subcategories,
  onSelect,
}: SubCategoryProps) {
  return (
    <div className="relative min-h-screen w-full overflow-y-auto px-6 pb-16">

      {/* ======================================================
          TOP HEADER
      ====================================================== */}

      <div className="relative z-10 flex flex-col items-center text-center pt-6">

        {/* Decorative top line */}
        <div className="flex items-center gap-5 mb-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />

          {/* <span className="text-[#d4af37] text-[11px] tracking-[0.45em] uppercase">
            Weddings
          </span> */}

          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]" />
        </div>

        {/* ==================================================
            CIRCLE IMAGE
        ================================================== */}

        <div className="relative mb-4">

          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-[#d4af37]/20 blur-2xl scale-125" />

          {/* Circle */}
          <div
            className="
              relative
              w-[150px]
              h-[150px]
              md:w-[165px]
              md:h-[165px]
              rounded-full
              overflow-hidden
              border-2
              border-[#d4af37]
              shadow-[0_0_35px_rgba(212,175,55,0.35)]
            "
          >
            <img
              src={themeBasedWeddingImage}
              alt="Wedding"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Small decorative ring */}
          <div
            className="
              absolute
              -inset-3
              rounded-full
              border
              border-[#d4af37]/20
              pointer-events-none
            "
          />
        </div>

        {/* Category label */}

<p 
  className=" 
    text-[#d4af37] 
    text-[13px] 
    font-semibold 
    tracking-[0.35em] 
    uppercase 
    mb-2 
  " 
> 
  THEME-BASED WEDDINGS 
</p>

        {/* Main heading */}

        <h1
          className="
            font-serif
            text-white
            text-3xl
            md:text-5xl
            font-semibold
            leading-tight
            drop-shadow-xl
          "
        >
          Plan Your Perfect Wedding
        </h1>

        {/* Description */}

        <p
          className="
            mt-3
            max-w-2xl
            text-white/60
            text-sm
            md:text-base
          "
        >
          Explore beautiful wedding styles and discover trusted vendors
          for every part of your celebration.
        </p>

      </div>

      {/* ======================================================
          DECORATIVE DIVIDER
      ====================================================== */}

      <div className="flex items-center justify-center gap-4 my-7">

        <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#d4af37]/60" />

        <div className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]" />

        <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#d4af37]/60" />

      </div>

      {/* ======================================================
          WEDDING STYLE CARDS
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1450px]
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-5
        "
      >

        {subcategories.map((subcategory, index) => {

          const image = weddingImages[index % weddingImages.length];

          const Icon =
            weddingIcons[index % weddingIcons.length];

          const description =
            weddingDescriptions[index % weddingDescriptions.length];

          return (
            <button
              key={subcategory.name}
              type="button"
              onClick={() => onSelect(subcategory)}
              className="
                group
                relative
                h-[205px]
                overflow-hidden
                rounded-2xl
                border
                border-[#d4af37]/40
                bg-[#090909]
                text-left
                transition-all
                duration-500
                hover:-translate-y-1
                hover:border-[#d4af37]
                hover:shadow-[0_20px_55px_rgba(212,175,55,0.18)]
              "
            >

              {/* ==================================================
                  BACKGROUND IMAGE
              ================================================== */}

              <img
                src={image}
                alt={subcategory.name}
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-110
                "
              />

              {/* ==================================================
                  DARK GRADIENT
              ================================================== */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black
                  via-black/65
                  to-black/10
                "
              />

              {/* ==================================================
                  GOLD HOVER GLOW
              ================================================== */}

              <div
                className="
                  absolute
                  inset-0
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-500
                  bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18),transparent_65%)]
                "
              />

              {/* ==================================================
                  CARD CONTENT
              ================================================== */}

              <div className="absolute inset-0 flex flex-col justify-end p-5">

                <div className="flex items-end justify-between gap-3">

                  <div>

                    {/* ICON */}

                    <div
                      className="
                        mb-3
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-[#d4af37]/60
                        bg-black/70
                        backdrop-blur-md
                        transition-all
                        duration-300
                        group-hover:bg-[#d4af37]
                      "
                    >
                      <Icon
                        className="
                          h-5
                          w-5
                          text-[#d4af37]
                          transition-colors
                          duration-300
                          group-hover:text-black
                        "
                      />
                    </div>

                    {/* TITLE */}

                    <h3
                      className="
                        font-serif
                        text-lg
                        font-semibold
                        leading-tight
                        text-white
                        drop-shadow-lg
                      "
                    >
                      {subcategory.name}
                    </h3>

                    {/* DESCRIPTION */}

                    <p
                      className="
                        mt-1
                        text-xs
                        text-white/65
                        line-clamp-1
                      "
                    >
                      {description}
                    </p>

                    {/* SERVICES */}

                    <p
                      className="
                        mt-1
                        text-[11px]
                        text-[#d4af37]
                      "
                    >
                      {subcategory.services?.length ?? 0} services
                    </p>

                  </div>

                  {/* ==================================================
                      ARROW
                  ================================================== */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#d4af37]/70
                      bg-black/60
                      backdrop-blur-sm
                      transition-all
                      duration-300
                      group-hover:bg-[#d4af37]
                    "
                  >
                    <ArrowRight
                      className="
                        h-5
                        w-5
                        text-[#d4af37]
                        transition-all
                        duration-300
                        group-hover:text-black
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>

                </div>

              </div>

            </button>
          );
        })}

      </div>

      {/* ======================================================
          BROWSE ALL VENDORS
      ====================================================== */}

      <div className="relative z-10 flex justify-center mt-10">

        <button
          type="button"
          className="
            group
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-[#d4af37]
            bg-[#d4af37]
            px-8
            py-3
            font-serif
            text-sm
            font-semibold
            text-black
            shadow-[0_0_30px_rgba(212,175,55,0.20)]
            transition-all
            duration-300
            hover:bg-[#f0c94a]
            hover:shadow-[0_0_40px_rgba(212,175,55,0.35)]
          "
        >
          Browse All Wedding Vendors

          <ArrowRight
            className="
              h-4
              w-4
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />

        </button>

      </div>

      {/* ======================================================
          BOTTOM TAGLINE
      ====================================================== */}

      <div className="relative z-10 flex items-center justify-center gap-4 mt-7">

        <div className="h-px w-20 bg-[#d4af37]/40" />

        <p
          className="
            text-[9px]
            uppercase
            tracking-[0.5em]
            text-[#d4af37]/60
          "
        >
          Beautiful Moments · Trusted Vendors
        </p>

        <div className="h-px w-20 bg-[#d4af37]/40" />

      </div>

    </div>
  );
}
