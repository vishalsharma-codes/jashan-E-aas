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
  Palette,
  Landmark,
  CalendarDays,
  Camera,
  Utensils,
  Music,
  MapPin,
  Church,
  Mail,
  WandSparkles,
  Heart,
  Users,
  Scissors,
  Video,
  ChefHat,
  Mic2,
  Car,
  Ticket,
  Star,
  Circle,
} from "lucide-react";

// ============================================================
// LOAD ALL SUBCATEGORY IMAGES AUTOMATICALLY
// ============================================================

const imageModules = import.meta.glob(
  "../subCategoryImages/**/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

// ============================================================
// TYPES
// ============================================================

interface SubCategoryProps {
  categoryName: string;
  subcategories: SubCategory[];
  onSelect: (subcategory: SubCategory) => void;
}

// ============================================================
// NORMALIZE NAME
// ============================================================

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================================
// FIND IMAGE AUTOMATICALLY
// ============================================================

function getImage(name: string) {
  // Special filename mappings
  const imageMap: Record<string, string> = {
    "Theme-Based Weddings": "theme-based-weddings.jpg.jpeg",
    "Culture-Based Weddings": "culture-based-weddings.jpg.jpeg",

    "Hindu Wedding": "hindu-wedding.jpg.jpeg",
    "Muslim Nikah": "muslim-nikah-wedding.jpg.jpeg",
    "Sikh Anand Karaj": "sikh-anand-karaj-wedding.jpg.jpeg",
    "Christian Wedding": "christian-wedding.jpg.jpeg",
    "Jain Wedding": "jain-wedding.jpg.jpeg",
    "Buddhist Wedding": "buddhist-wedding.jpg.jpeg",
    "Parsi Wedding": "parsi-wedding.jpg.jpeg",
    "Inter-faith Wedding": "interfaith-wedding.jpg.jpeg",
  };

  // Use exact mapping if available
  if (imageMap[name]) {
    const target = imageMap[name];

    const found = Object.entries(imageModules).find(([path]) =>
      path.toLowerCase().endsWith(target.toLowerCase())
    );

    if (found) {
      return found[1];
    }
  }

  // Generic filename matching for other categories
  const normalized = normalizeName(name);

  const entries = Object.entries(imageModules);

  const exact = entries.find(([path]) => {
    const filename = path
      .split("/")
      .pop()
      ?.toLowerCase()
      .replace(/\.(jpg|jpeg|png|webp)$/i, "");

    return filename === normalized;
  });

  if (exact) {
    return exact[1];
  }

  const partial = entries.find(([path]) => {
    const filename = path
      .split("/")
      .pop()
      ?.toLowerCase();

    return filename?.startsWith(normalized);
  });

  if (partial) {
    return partial[1];
  }

  return undefined;
}

// ============================================================
// CATEGORY ICONS
// ============================================================

const icons: ElementType[] = [
  Umbrella,
  Flower2,
  Gem,
  Crown,
  Sparkles,
  Leaf,
  Square,
  TreePine,
  Building2,
  Palette,
  Landmark,
  CalendarDays,
  Camera,
  Utensils,
  Music,
  MapPin,
  Church,
  Mail,
  WandSparkles,
  Heart,
  Users,
  Scissors,
  Video,
  ChefHat,
  Mic2,
  Car,
  Ticket,
  Star,
  Circle,
];

// ============================================================
// DESCRIPTIONS
// ============================================================

const descriptions: Record<string, string> = {
  "Beach Wedding":
    "Romantic celebrations by the sea",

  "Garden Wedding":
    "Elegant celebrations surrounded by nature",

  "Vintage Wedding":
    "Timeless elegance with classic charm",

  "Royal Wedding":
    "Grand celebrations with royal elegance",

  "Bohemian Wedding":
    "Free-spirited and artistic celebrations",

  "Rustic Wedding":
    "Warm, natural and intimate celebrations",

  "Modern Minimalist":
    "Clean, elegant and contemporary style",

  "Forest Wedding":
    "Magical celebrations surrounded by forests",

  "Rooftop Wedding":
    "Modern celebrations with stunning city views",

  "Hindu Wedding":
    "Traditional ceremonies rich in culture and rituals",

  "Muslim Nikah":
    "Elegant Nikah ceremonies and celebrations",

  "Sikh Anand Karaj":
    "Beautiful Anand Karaj celebrations",

  "Christian Wedding":
    "Elegant Christian wedding ceremonies",

  "Jain Wedding":
    "Traditional Jain wedding celebrations",

  "Buddhist Wedding":
    "Peaceful and meaningful Buddhist ceremonies",

  "Parsi Wedding":
    "Traditional Parsi wedding celebrations",

  "Inter-faith Wedding":
    "Beautiful celebrations bringing traditions together",
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DynamicSubcategoryCards({
  categoryName,
  subcategories,
  onSelect,
}: SubCategoryProps) {

  // ----------------------------------------------------------
  // CIRCLE IMAGE
  // ----------------------------------------------------------

  const categoryImage = getImage(categoryName);

  return (
    <div className="relative min-h-screen w-full overflow-y-auto px-6 pb-16">

      {/* ======================================================
          TOP HEADER
      ====================================================== */}

      <div className="relative z-10 flex flex-col items-center text-center pt-6">

        {/* Decorative line */}

        <div className="flex items-center gap-5 mb-3">

          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />

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

            {categoryImage ? (
              <img
                src={categoryImage}
                alt={categoryName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <Circle className="w-12 h-12 text-[#d4af37]" />
              </div>
            )}

          </div>

          {/* Decorative ring */}

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

        {/* ==================================================
            CATEGORY NAME
        ================================================== */}

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
          {categoryName}
        </p>

        {/* ==================================================
            MAIN HEADING
        ================================================== */}

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
          Plan Your Perfect Event
        </h1>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <p
          className="
            mt-3
            max-w-2xl
            text-white/60
            text-sm
            md:text-base
          "
        >
          Explore exceptional event experiences and discover trusted
            vendors for every part of your celebration.
        </p>

      </div>

      {/* ======================================================
          DIVIDER
      ====================================================== */}

      <div className="flex items-center justify-center gap-4 my-7">

        <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#d4af37]/60" />

        <div className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]" />

        <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#d4af37]/60" />

      </div>

      {/* ======================================================
          CARDS
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

          const image = getImage(subcategory.name);

          const Icon = icons[index % icons.length];

          const description =
            descriptions[subcategory.name] ||
            `Professional ${subcategory.name.toLowerCase()} services`;

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
                  IMAGE
              ================================================== */}

              {image && (
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
              )}

              {/* ==================================================
                  DARK OVERLAY
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
                  HOVER GLOW
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
                  CONTENT
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

    </div>
  );
}