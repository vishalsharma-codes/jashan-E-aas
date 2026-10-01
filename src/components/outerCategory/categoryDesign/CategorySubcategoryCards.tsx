import { useMemo } from "react";
import type { ElementType } from "react";
import type { SubCategory } from "@/lib/categoryData";

import {
  Presentation,
  Rocket,
  Store,
  Users,
  Monitor,
  Utensils,
  Video,
  Trophy,
  Palette,
  Landmark,
  CalendarDays,
  Camera,
  Flower2,
  Music,
  MapPin,
  Church,
  Mail,
  WandSparkles,
  Heart,
  Scissors,
  ChefHat,
  Mic2,
  Car,
  Ticket,
  Globe,
} from "lucide-react";

// ============================================================
// PROPS
// ============================================================

interface CategorySubcategoryProps {
  categoryName: string;
  subcategories: SubCategory[];
  onSelect: (subcategory: SubCategory) => void;
}

// ============================================================
// LOAD CATEGORY MAIN IMAGES
// Folder: src/components/outerCategory/categoryImages/
// ============================================================

const categoryImageModules = import.meta.glob(
  "../categoryImages/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

// ============================================================
// LOAD ALL SUBCATEGORY IMAGES (every folder, absolute path)
// Folder: src/components/outerCategory/subCategoryImages/**
// ============================================================

const subcategoryImageModules = import.meta.glob(
  "/src/components/outerCategory/subCategoryImages/**/*.{jpg,jpeg,png,webp,avif,gif,jfif,JPG,JPEG,PNG,WEBP}",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

// Used by the main (circle) image lookup
function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================================
// TEXT HELPERS
// ============================================================

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/\.(jpg|jpeg|png|webp|avif|gif|jfif)/g, " ")
    .replace(/\d{6,}/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(word: string) {
  if (word.length > 4 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss"))
    return word.slice(0, -1);
  return word;
}

const stopWords = new Set([
  "the", "and", "for", "with", "from", "event", "service", "professional",
  "premium", "setup", "organizer", "organiser", "provider", "planner",
  "artist", "specialist", "all", "your", "adult", "guest", "people",
  "attendee", "during", "using", "into", "their", "performing",
]);

function meaningfulWords(value: string) {
  return normalizeText(value)
    .split(" ")
    .map(stem)
    .filter((w) => w.length >= 3 && !stopWords.has(w));
}

// ============================================================
// INDEX EVERY IMAGE ONCE
// ============================================================

function getFolder(path: string) {
  const parts = path.split("/");
  const i = parts.lastIndexOf("subCategoryImages");
  return i >= 0 && parts[i + 1] ? parts[i + 1] : "";
}

const indexedImages = Object.entries(subcategoryImageModules).map(
  ([path, url]) => {
    const file = path.split("/").pop() || "";
    return {
      url,
      path,
      folder: getFolder(path),
      name: normalizeText(file),
      words: new Set(meaningfulWords(file)),
    };
  }
);

if (indexedImages.length === 0) {
  console.error(
    "[SUBCATEGORY IMAGES] 0 images found. Check the glob path in CategorySubcategoryCards.tsx and restart Vite."
  );
} else {
  console.log(`[SUBCATEGORY IMAGES] ${indexedImages.length} images loaded`);
}

// Category -> its own image folder (categories not listed use "all" only)
const categoryFolders: Record<string, string> = {
  Weddings: "wedding",
  "Corporate Events": "corporateEvent",
  "Social Parties": "socialParty",
  "Educational Events": "educational",
  "Concerts & Shows": "Concert",
  "Religious & Spiritual": "religious",
  "Government Events": "government_event",
};

// ============================================================
// SCORING
// ============================================================

function scoreImage(
  image: (typeof indexedImages)[number],
  text: string
): number {
  const target = normalizeText(text);
  if (!target) return 0;

  let score = 0;

  if (image.name.includes(target)) score += 1000;

  const words = meaningfulWords(text);

  for (const word of words) {
    if (image.words.has(word)) score += 100;
    else if (image.name.includes(word)) score += 35;
  }

  if (words.length >= 2) {
    const phrase = `${words[0]} ${words[1]}`;
    if (image.name.includes(phrase)) score += 200;
  }

  return score;
}

// ============================================================
// PICK AN IMAGE FOR EVERY CARD IN A CATEGORY
// Searches ALL folders, boosts the category's own folder,
// and avoids repeating an image when possible.
// ============================================================

function pickImages(
  categoryName: string,
  subcategories: SubCategory[]
): (string | undefined)[] {
  if (!indexedImages.length) return subcategories.map(() => undefined);

  const ownFolder = categoryFolders[categoryName];
  const used = new Set<string>();

  return subcategories.map((subcategory, cardIndex) => {
    const texts = [subcategory.name, ...(subcategory.services ?? [])];

    const scored = indexedImages
      .map((image) => {
        let base = 0;

        for (const text of texts) {
          base = Math.max(base, scoreImage(image, text));
        }

        let score = base;
        if (ownFolder && image.folder === ownFolder) {
          score += base > 0 ? 300 : 0;
        }

        return { image, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0];

    if (best && best.score > 0) {
      const alt = scored
        .slice(0, 10)
        .find((c) => !used.has(c.image.url) && c.score >= best.score * 0.6);
      const chosen = alt ?? best;
      used.add(chosen.image.url);
      return chosen.image.url;
    }

    // Fallback so a card is never black
    const pool = ownFolder
      ? indexedImages.filter((i) => i.folder === ownFolder)
      : indexedImages;
    const source = pool.length ? pool : indexedImages;
    const fallback = source[cardIndex % source.length];

    console.warn(`[IMAGE FALLBACK] ${categoryName} → ${subcategory.name}`);

    used.add(fallback.url);
    return fallback.url;
  });
}

const fallbackIcons: ElementType[] = [
  Presentation, Rocket, Store, Users, Monitor, Utensils, Video, Trophy,
  Palette, Landmark, CalendarDays, Camera, Flower2, Music, MapPin, Church,
  Mail, WandSparkles, Heart, Scissors, ChefHat, Mic2, Car, Ticket,
];

// ============================================================
// CATEGORY CONFIG
// ============================================================

type CategoryConfigEntry = {
  label: string;
  heading: string;
  description: string;
  imageFolder?: string;
  imageKeywords?: Record<string, string[]>;
  mainImageKeywords: string[];
  icons?: Record<string, ElementType>;
  browseText: string;
};

const categoryConfig: Record<string, CategoryConfigEntry> = {
  Weddings: {
    label: "WEDDINGS",
    heading: "Plan Your Perfect Wedding",
    description:
      "Explore wedding services and trusted vendors for every part of your celebration.",
    mainImageKeywords: [
      "weddingMain",
      "weddings-main",
      "wedding-main",
      "weddings",
    ],
    browseText: "Browse All Wedding Vendors",
  },

  "Corporate Events": {
    label: "CORPORATE EVENTS",
    heading: "Plan Your Perfect Corporate Event",
    description:
      "Discover professional event services and trusted vendors for every business occasion.",
    imageFolder: "corporateEvent",
    mainImageKeywords: ["corporate-events-main"],
    imageKeywords: {
      "Conferences & Seminars": ["conferences-seminars"],
      "Product Launches & Brand Activations": ["product-launches"],
      "Trade Shows & Exhibitions": ["trade-shows-exhibitions"],
      "Team Building & Retreats": ["team-building-retreats"],
      "Audio Visual & Tech": ["audio-visual-tech"],
      "Hospitality & Catering": ["hospitality-catering"],
      "Virtual & Hybrid Events": ["virtual-hybrid-events"],
      "Awards & Celebrations": ["awards-celebrations"],
    },
    icons: {
      "Conferences & Seminars": Presentation,
      "Product Launches & Brand Activations": Rocket,
      "Trade Shows & Exhibitions": Store,
      "Team Building & Retreats": Users,
      "Audio Visual & Tech": Monitor,
      "Hospitality & Catering": Utensils,
      "Virtual & Hybrid Events": Video,
      "Awards & Celebrations": Trophy,
    },
    browseText: "Browse All Corporate Vendors",
  },

  "Social Parties": {
    label: "SOCIAL PARTIES",
    heading: "Plan Your Perfect Social Event",
    description:
      "Create unforgettable social celebrations with trusted event professionals.",
    imageFolder: "socialParty",
    mainImageKeywords: [
      "social-parties-main",
      "social-party-main",
      "social-parties",
      "birthday-parties",
    ],
    imageKeywords: {
      "Birthday Parties": ["birthday-parties", "birthday-party", "birthday"],
      "Kids Party Specialists": [
        "kids-party-specialists",
        "kids-party",
        "kids",
      ],
      "Party Essentials": ["party-essentials", "party-essential"],
      "Baby & Family Events": [
        "baby-family-events",
        "baby-family",
        "baby",
        "family",
      ],
      "Reunion & Milestone Events": [
        "reunion-milestone-events",
        "reunion",
        "milestone",
      ],
      "Theme & Concept Parties": ["theme-concept-parties", "theme", "concept"],
    },
    browseText: "Browse All Social Event Vendors",
  },

  "Educational Events": {
    label: "EDUCATIONAL EVENTS",
    heading: "Plan Your Perfect Educational Event",
    description:
      "Discover professional services for conferences, workshops, seminars and academic events.",
    mainImageKeywords: [
      "educational-events-main",
      "educational-event-main",
      "educational-events",
    ],
    browseText: "Browse All Educational Event Vendors",
  },

  "Concerts & Shows": {
    label: "CONCERTS & SHOWS",
    heading: "Plan Your Perfect Concert or Show",
    description:
      "Bring unforgettable performances to life with professional event services.",
    mainImageKeywords: [
      "concerts-shows-main",
      "concerts-main",
      "concerts-shows",
    ],
    browseText: "Browse All Concert Vendors",
  },

  "Religious & Spiritual": {
    label: "RELIGIOUS & SPIRITUAL",
    heading: "Plan Your Perfect Religious Event",
    description:
      "Trusted services for meaningful religious, spiritual and cultural gatherings.",
    mainImageKeywords: [
      "religious-spiritual-main",
      "religious-main",
      "religious-spiritual",
    ],
    browseText: "Browse All Religious Event Vendors",
  },

  "Exhibitions & Expos": {
    label: "EXHIBITIONS & EXPOS",
    heading: "Plan Your Perfect Exhibition",
    description:
      "Professional exhibition, expo and trade event services from trusted vendors.",
    mainImageKeywords: [
      "exhibitions-expos-main",
      "exhibitions-main",
      "exhibitions-expos",
    ],
    browseText: "Browse All Exhibition Vendors",
  },

  "Sports Events": {
    label: "SPORTS EVENTS",
    heading: "Plan Your Perfect Sports Event",
    description:
      "Complete event services for tournaments, competitions and sporting experiences.",
    mainImageKeywords: [
      "sports-events-main",
      "sports-event-main",
      "sports-events",
    ],
    browseText: "Browse All Sports Event Vendors",
  },

  "Government Events": {
    label: "GOVERNMENT EVENTS",
    heading: "Plan Your Perfect Government Event",
    description:
      "Professional event solutions for official ceremonies, conferences and public events.",
    mainImageKeywords: [
      "government-events-main",
      "government-event-main",
      "government-events",
    ],
    browseText: "Browse All Government Event Vendors",
  },

  "Charity & NGO Events": {
    label: "CHARITY & NGO EVENTS",
    heading: "Plan Your Perfect Charity Event",
    description:
      "Meaningful event services for fundraisers, NGO programs and community initiatives.",
    mainImageKeywords: [
      "charity-ngo-events-main",
      "charity-events-main",
      "charity-ngo-events",
    ],
    browseText: "Browse All Charity Event Vendors",
  },

  "Fashion & Lifestyle": {
    label: "FASHION & LIFESTYLE",
    heading: "Plan Your Perfect Fashion Event",
    description:
      "Premium services for fashion shows, launches, lifestyle events and experiences.",
    mainImageKeywords: [
      "fashion-lifestyle-main",
      "fashion-main",
      "fashion-lifestyle",
    ],
    browseText: "Browse All Fashion Event Vendors",
  },

  "Virtual & Hybrid Events": {
    label: "VIRTUAL & HYBRID EVENTS",
    heading: "Plan Your Perfect Virtual Event",
    description:
      "Professional technology and production services for virtual and hybrid experiences.",
    mainImageKeywords: [
      "virtual-hybrid-events-main",
      "virtual-events-main",
      "virtual-hybrid-events",
    ],
    browseText: "Browse All Virtual Event Vendors",
  },

  "Festivals & Melas": {
    label: "FESTIVALS & MELAS",
    heading: "Plan Your Perfect Festival",
    description:
      "Complete event solutions for festivals, melas and large-scale cultural celebrations.",
    mainImageKeywords: [
      "festivals-melas-main",
      "festivals-main",
      "festivals-melas",
    ],
    browseText: "Browse All Festival Vendors",
  },

  "Hospitality & F&B": {
    label: "HOSPITALITY & F&B",
    heading: "Plan Your Perfect Hospitality Event",
    description:
      "Premium hospitality, food and beverage services for memorable experiences.",
    mainImageKeywords: [
      "hospitality-fnb-main",
      "hospitality-main",
      "hospitality-fnb",
    ],
    browseText: "Browse All Hospitality Vendors",
  },

  "Film & Media Events": {
    label: "FILM & MEDIA EVENTS",
    heading: "Plan Your Perfect Media Event",
    description:
      "Professional production, media and event services for film and entertainment projects.",
    mainImageKeywords: [
      "film-media-events-main",
      "film-events-main",
      "film-media-events",
    ],
    browseText: "Browse All Media Vendors",
  },

  "Tech & Innovation": {
    label: "TECH & INNOVATION",
    heading: "Plan Your Perfect Tech Event",
    description:
      "Professional event solutions for technology conferences, launches and innovation events.",
    mainImageKeywords: [
      "tech-innovation-main",
      "tech-events-main",
      "tech-innovation",
    ],
    browseText: "Browse All Tech Event Vendors",
  },

  "Health & Wellness": {
    label: "HEALTH & WELLNESS",
    heading: "Plan Your Perfect Wellness Event",
    description:
      "Create meaningful health, fitness and wellness experiences with trusted professionals.",
    mainImageKeywords: [
      "health-wellness-main",
      "wellness-main",
      "health-wellness",
    ],
    browseText: "Browse All Wellness Vendors",
  },

  "Community Events": {
    label: "COMMUNITY EVENTS",
    heading: "Plan Your Perfect Community Event",
    description:
      "Professional services for community gatherings, social initiatives and public programs.",
    mainImageKeywords: [
      "community-events-main",
      "community-event-main",
      "community-events",
    ],
    browseText: "Browse All Community Event Vendors",
  },

  "Agricultural & Rural Events": {
    label: "AGRICULTURAL & RURAL EVENTS",
    heading: "Plan Your Perfect Rural Event",
    description:
      "Complete event solutions for agricultural exhibitions, rural programs and community gatherings.",
    mainImageKeywords: [
      "agricultural-rural-events-main",
      "agricultural-events-main",
      "agricultural-rural-events",
    ],
    browseText: "Browse All Agricultural Event Vendors",
  },

  "Automotive Events": {
    label: "AUTOMOTIVE EVENTS",
    heading: "Plan Your Perfect Automotive Event",
    description:
      "Premium event services for automotive launches, exhibitions and enthusiast experiences.",
    mainImageKeywords: [
      "automotive-events-main",
      "automotive-event-main",
      "automotive-events",
    ],
    browseText: "Browse All Automotive Vendors",
  },
};

// ============================================================
// FIND MAIN CATEGORY IMAGE
// Searches ONLY inside src/components/outerCategory/categoryImages/
// ============================================================

function getCategoryMainImage(categoryName: string) {
  const config = categoryConfig[categoryName];
  if (!config) return undefined;

  const entries = Object.entries(categoryImageModules);

  for (const keyword of config.mainImageKeywords) {
    const normalizedKeyword = normalizeName(keyword);

    const found = entries.find(([path]) => {
      const filename = path
        .split("/")
        .pop()
        ?.toLowerCase()
        .replace(/\.(jpg|jpeg|png|webp)$/i, "");

      if (!filename) return false;

      const normalizedFilename = normalizeName(filename);

      return (
        normalizedFilename === normalizedKeyword ||
        normalizedFilename.includes(normalizedKeyword)
      );
    });

    if (found) return found[1];
  }

  // Fallback: search using the category name itself
  const normalizedCategory = normalizeName(categoryName);

  const fallback = entries.find(([path]) => {
    const filename = path
      .split("/")
      .pop()
      ?.toLowerCase()
      .replace(/\.(jpg|jpeg|png|webp)$/i, "");

    if (!filename) return false;

    return normalizeName(filename).includes(normalizedCategory);
  });

  return fallback?.[1];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CategorySubcategoryCards({
  categoryName,
  subcategories,
  onSelect,
}: CategorySubcategoryProps) {
  const config: CategoryConfigEntry = categoryConfig[categoryName] ?? {
    label: categoryName.toUpperCase(),
    heading: `Plan Your Perfect ${categoryName}`,
    description:
      "Discover professional services and trusted vendors for your event.",
    mainImageKeywords: [],
    browseText: `Browse All ${categoryName} Vendors`,
  };

  const categoryImage = getCategoryMainImage(categoryName);

  const cardImages = useMemo(
    () => pickImages(categoryName, subcategories),
    [categoryName, subcategories]
  );

  return (
    <div className="relative min-h-screen w-full overflow-y-auto px-6 pb-16">
      {/* HEADER */}
      <div className="relative z-10 flex flex-col items-center text-center pt-6">
        {/* Decorative lines */}
        <div className="flex items-center gap-5 mb-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]" />
        </div>

        {/* CIRCLE IMAGE */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-[#d4af37]/20 blur-2xl scale-125" />

          <div className="relative w-[150px] h-[150px] md:w-[165px] md:h-[165px] rounded-full overflow-hidden border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.35)] bg-black">
            {categoryImage ? (
              <img
                src={categoryImage}
                alt={categoryName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Globe className="w-12 h-12 text-[#d4af37]" />
              </div>
            )}
          </div>

          <div className="absolute -inset-3 rounded-full border border-[#d4af37]/20 pointer-events-none" />
        </div>

        {/* CATEGORY LABEL */}
        <p className="text-[#d4af37] text-[13px] font-semibold tracking-[0.35em] uppercase mb-2">
          {config.label}
        </p>

        {/* MAIN HEADING */}
        <h1 className="font-serif text-white text-3xl md:text-5xl font-semibold leading-tight drop-shadow-xl">
          {config.heading}
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-3 max-w-2xl text-white/60 text-sm md:text-base">
          {config.description}
        </p>
      </div>

      {/* DIVIDER */}
      <div className="flex items-center justify-center gap-4 my-7">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#d4af37]/60" />
        <div className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]" />
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#d4af37]/60" />
      </div>

      {/* SUBCATEGORY CARDS */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {subcategories.map((subcategory, index) => {
          const image = cardImages[index];

          const Icon =
            config.icons?.[subcategory.name] ||
            fallbackIcons[index % fallbackIcons.length];

          return (
            <button
              key={subcategory.name}
              type="button"
              onClick={() => onSelect(subcategory)}
              className="group relative h-[205px] overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#090909] text-left transition-all duration-500 hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-[0_20px_55px_rgba(212,175,55,0.18)]"
            >
              {/* IMAGE */}
              {image && (
                <img
                  src={image}
                  alt={subcategory.name}
                  loading="eager"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(event) => {
                    console.error(
                      "[IMAGE ERROR]",
                      subcategory.name,
                      event.currentTarget.src
                    );
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}

              {/* DARK OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />

              {/* GOLD HOVER GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18),transparent_65%)]" />

              {/* CONTENT */}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    {/* ICON */}
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4af37]/60 bg-black/70 backdrop-blur-md transition-all duration-300 group-hover:bg-[#d4af37]">
                      <Icon className="h-5 w-5 text-[#d4af37] transition-colors duration-300 group-hover:text-black" />
                    </div>

                    {/* TITLE */}
                    <h3 className="font-serif text-lg font-semibold leading-tight text-white drop-shadow-lg">
                      {subcategory.name}
                    </h3>

                    {/* SERVICES */}
                    <p className="mt-1 text-[11px] text-[#d4af37]">
                      {subcategory.services?.length ?? 0} services
                    </p>
                  </div>

                  {/* ARROW */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/70 bg-black/60 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#d4af37]">
                    <span className="text-xl text-[#d4af37] transition-all duration-300 group-hover:text-black group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* BROWSE ALL VENDORS */}
      <div className="relative z-10 flex justify-center mt-10">
        <button
          type="button"
          className="group flex items-center gap-3 rounded-xl border border-[#d4af37] bg-[#d4af37] px-8 py-3 font-serif text-sm font-semibold text-black shadow-[0_0_30px_rgba(212,175,55,0.20)] transition-all duration-300 hover:bg-[#f0c94a] hover:shadow-[0_0_40px_rgba(212,175,55,0.35)]"
        >
          {config.browseText}
          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

      {/* BOTTOM TAGLINE */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-7">
        <div className="h-px w-20 bg-[#d4af37]/40" />
        <p className="text-[9px] uppercase tracking-[0.5em] text-[#d4af37]/60">
          Professional Events · Trusted Vendors
        </p>
        <div className="h-px w-20 bg-[#d4af37]/40" />
      </div>
    </div>
  );
}