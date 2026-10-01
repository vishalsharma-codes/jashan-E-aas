import { useMemo } from "react";
import type { ElementType } from "react";
import type { SubCategory } from "@/lib/categoryData";

import {
  ArrowRight,
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
  Star,
  TreePine,
  Building2,
  Globe,
  GraduationCap,
  Dumbbell,
  Film,
  Cpu,
  Leaf,
  Tractor,
} from "lucide-react";

interface DynamicSubcategoryCardsProps {
  categoryName: string;
  subcategories: SubCategory[];
  onSelect: (subcategory: SubCategory) => void;
}

/* ============================================================
   IMAGE LOADING

   Loads EVERY image under subCategoryImages, including:
   all/, Concert/, corporateEvent/, educational/,
   government_event/, religious/, socialParty/, wedding/

   Absolute path (starts with "/") is resolved from the Vite
   project root, so it works no matter where this component
   file lives.
============================================================ */

const imageModules = import.meta.glob(
  "/src/components/outerCategory/subCategoryImages/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  {
    eager: true,
    import: "default",
  }
) as Record<string, string>;

/* Header images (kept as before) */
const categoryImageModules = import.meta.glob(
  "../categoryImages/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  {
    eager: true,
    import: "default",
  }
) as Record<string, string>;

/* ============================================================
   CATEGORY -> FOLDER MAP

   Images inside the matching folder get a boost.
   Tech & Innovation has no folder, so it relies on "all".
============================================================ */

const categoryFolders: Record<string, string[]> = {
  "Tech & Innovation": ["all"],
  "Government Events": ["government_event", "all"],
  "Concerts & Shows": ["Concert", "all"],
  "Corporate Events": ["corporateEvent", "all"],
  "Educational Events": ["educational", "all"],
  "Religious Events": ["religious", "all"],
  "Social Parties": ["socialParty", "all"],
  Weddings: ["wedding", "all"],
};

/* ============================================================
   NORMALIZATION
============================================================ */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.(jpg|jpeg|png|webp)$/i, "")
    .replace(/\d{8,}/g, " ")
    .replace(/&/g, " and ")
    .replace(/[\/\\()]/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value: string): string {
  return normalize(value).replace(/\s+/g, "");
}

function getFileName(path: string): string {
  return (
    path
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      ?.replace(/\.(jpg|jpeg|png|webp)$/i, "") || ""
  );
}

function getFolder(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  const idx = parts.lastIndexOf("subCategoryImages");
  return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "";
}

/* Very small plural stemmer: hackathons -> hackathon */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) {
    return word.slice(0, -3) + "y";
  }
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

/* ============================================================
   STOP WORDS
============================================================ */

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "event",
  "events",
  "service",
  "services",
  "professional",
  "premium",
  "setup",
  "organizer",
  "organiser",
  "provider",
  "planner",
  "artist",
  "specialist",
  "specialists",
  "all",
  "eventual",
  "your",
  "adults",
  "adult",
  "guests",
  "people",
  "attendees",
]);

function meaningfulWords(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length >= 3 && !stopWords.has(word))
    .map(stem);
}

/* ============================================================
   IMAGE INDEX
============================================================ */

type IndexedImage = {
  path: string;
  url: string;
  folder: string;
  fileName: string;
  compactName: string;
  words: Set<string>;
};

const indexedImages: IndexedImage[] = Object.entries(imageModules).map(
  ([path, url]) => ({
    path,
    url,
    folder: getFolder(path),
    fileName: normalize(getFileName(path)),
    compactName: compact(getFileName(path)),
    words: new Set(meaningfulWords(getFileName(path))),
  })
);

if (!indexedImages.length) {
  console.error(
    "[SUBCATEGORY IMAGES] Vite found 0 images. Check the glob path at the top of this file."
  );
} else {
  console.log(
    `%c[SUBCATEGORY IMAGES] ${indexedImages.length} images loaded`,
    "color:#d4af37;font-weight:bold"
  );
}

/* ============================================================
   SCORING
============================================================ */

function scoreImage(image: IndexedImage, text: string): number {
  const target = normalize(text);
  if (!target) return 0;

  const targetCompact = compact(text);
  let score = 0;

  if (image.fileName.includes(target)) score += 1000;

  if (
    targetCompact.length >= 8 &&
    image.compactName.includes(targetCompact)
  ) {
    score += 800;
  }

  const words = meaningfulWords(text);

  for (const word of words) {
    if (image.words.has(word)) {
      score += 100;
    } else if (image.fileName.includes(word)) {
      score += 35;
    }
  }

  if (words.length >= 2) {
    const phrase = `${words[0]} ${words[1]}`;
    if (image.fileName.includes(phrase)) score += 200;
  }

  return score;
}

/* ============================================================
   CATEGORY KEYWORDS (secondary boost)
============================================================ */

const categoryKeywords: Record<string, string[]> = {
  "Tech & Innovation": [
    "tech",
    "technology",
    "ai",
    "artificial intelligence",
    "machine learning",
    "blockchain",
    "cybersecurity",
    "coding",
    "hackathon",
    "robotics",
    "software",
    "developer",
    "startup",
    "innovation",
    "gaming",
    "cloud",
    "data science",
    "iot",
    "vr",
    "ar",
  ],
  "Government Events": [
    "government",
    "official",
    "national",
    "political",
    "public",
    "parade",
    "inauguration",
    "diplomatic",
    "security",
    "press conference",
  ],
  "Concerts & Shows": [
    "concert",
    "performer",
    "musician",
    "dj",
    "stage",
    "festival",
    "show",
  ],
  "Corporate Events": [
    "corporate",
    "conference",
    "business",
    "company",
    "seminar",
    "meeting",
    "trade",
    "expo",
  ],
  "Educational Events": [
    "education",
    "educational",
    "student",
    "university",
    "college",
    "graduation",
    "academic",
    "workshop",
    "campus",
  ],
  "Religious Events": [
    "religious",
    "temple",
    "church",
    "mosque",
    "gurdwara",
    "priest",
    "devotee",
    "ceremony",
    "spiritual",
  ],
  "Social Parties": [
    "party",
    "birthday",
    "family",
    "celebration",
    "kids",
    "baby",
    "reunion",
    "balloon",
    "catering",
  ],
  Weddings: [
    "wedding",
    "bride",
    "groom",
    "bridal",
    "marriage",
    "mehndi",
    "decor",
    "floral",
    "catering",
  ],
};

/* ============================================================
   PICK IMAGES FOR ALL CARDS IN ONE PASS

   - searches ALL folders
   - boosts images from the category's own folder
   - avoids using the same image twice when possible
============================================================ */

function pickImagesForCategory(
  categoryName: string,
  subcategories: SubCategory[]
): (string | undefined)[] {
  if (!indexedImages.length) {
    return subcategories.map(() => undefined);
  }

  const folders = categoryFolders[categoryName] ?? ["all"];
  const specificFolders = folders.filter((f) => f !== "all");

  const keywords = [
    ...(categoryKeywords[categoryName] ?? []),
    ...meaningfulWords(categoryName),
  ]
    .map(normalize)
    .filter((k) => k.length >= 3);

  const used = new Set<string>();
  const results: (string | undefined)[] = [];

  subcategories.forEach((subcategory, cardIndex) => {
    const searchTexts = [subcategory.name, ...(subcategory.services ?? [])];

    const scored = indexedImages.map((image) => {
      let base = 0;

      for (const text of searchTexts) {
        base = Math.max(base, scoreImage(image, text));
      }

      let score = base;

      for (const keyword of keywords) {
        if (image.fileName.includes(keyword)) score += 15;
      }

      /* Folder boost */
      if (specificFolders.includes(image.folder)) {
        score += base > 0 ? 300 : 20;
      }

      return { image, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    if (best && best.score > 0) {
      /* Prefer an unused image that is nearly as good */
      const alternative = scored
        .slice(0, 8)
        .find(
          (c) =>
            !used.has(c.image.url) && c.score >= best.score * 0.6
        );

      const chosen = alternative ?? best;
      used.add(chosen.image.url);
      results.push(chosen.image.url);
      return;
    }

    /* Fallback: deterministic, prefer category folder */
    const pool = indexedImages.filter((img) =>
      specificFolders.includes(img.folder)
    );
    const source = pool.length ? pool : indexedImages;
    const fallback = source[cardIndex % source.length];

    console.warn(
      `[IMAGE FALLBACK] ${categoryName} → ${subcategory.name} → ${getFileName(fallback.path)}`
    );

    used.add(fallback.url);
    results.push(fallback.url);
  });

  return results;
}

/* ============================================================
   CATEGORY HEADER IMAGE
============================================================ */

function getMainCategoryImage(categoryName: string): string | undefined {
  const target = normalize(categoryName);

  let best: { url: string; score: number } | undefined;

  for (const [path, url] of Object.entries(categoryImageModules)) {
    const filename = normalize(getFileName(path));
    let score = 0;

    if (filename.includes(target)) score += 1000;

    for (const word of meaningfulWords(categoryName)) {
      if (filename.includes(word)) score += 100;
    }

    if (!best || score > best.score) best = { url, score };
  }

  if (best && best.score > 0) return best.url;

  /* Fallback from the big collection */
  const categoryWords = categoryKeywords[categoryName] ?? [];
  const folders = (categoryFolders[categoryName] ?? []).filter(
    (f) => f !== "all"
  );

  let fallback: { url: string; score: number } | undefined;

  for (const image of indexedImages) {
    let score = folders.includes(image.folder) ? 5 : 0;

    for (const word of categoryWords) {
      const w = normalize(word);
      if (w.length >= 3 && image.fileName.includes(w)) score += 10;
    }

    if (!fallback || score > fallback.score) {
      fallback = { url: image.url, score };
    }
  }

  return fallback?.url;
}

/* ============================================================
   ICONS
============================================================ */

const icons: ElementType[] = [
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
  Star,
  TreePine,
  Building2,
  Globe,
  GraduationCap,
  Dumbbell,
  Film,
  Cpu,
  Leaf,
  Tractor,
];

/* ============================================================
   DESCRIPTIONS
============================================================ */

const descriptions: Record<string, string> = {
  "Tech Conferences & Summits":
    "Technology conferences, summits and innovation gatherings.",
  "Hackathons & Competitions":
    "Hackathons, coding competitions and developer challenges.",
  "Startups & Innovation":
    "Startup showcases, investor meets and innovation experiences.",
  "Product Launches":
    "Professional technology product and software launch events.",
  "Tech Infrastructure":
    "High-performance technology, connectivity and event infrastructure.",
  "Production & Media":
    "Professional AV, staging, streaming, photography and media production.",
  "National Celebrations":
    "Professional services for national and official celebrations.",
  "Political & Public Events":
    "Public meetings, campaigns and large-scale civic events.",
  "Government Functions":
    "Formal government ceremonies, functions and official programs.",
  "Production & Security":
    "Production, protocol, security and crowd-management solutions.",
  "Broadcast & Media":
    "Official documentation, broadcasting and media management.",
  "Logistics & Support":
    "Transportation, accommodation, catering and event support.",
  "Conferences & Seminars":
    "Professional conferences, seminars and business gatherings.",
  "Product Launches & Brand Activations":
    "Memorable product launches and high-impact brand experiences.",
  "Trade Shows & Exhibitions":
    "Exhibitions, trade shows and professional showcase experiences.",
  "Team Building & Retreats":
    "Engaging corporate team experiences and company retreats.",
  "Audio Visual & Tech":
    "Professional AV, lighting, sound and event technology.",
  "Hospitality & Catering":
    "Premium hospitality and catering for corporate occasions.",
  "Virtual & Hybrid Events":
    "Seamless virtual and hybrid event experiences.",
  "Awards & Celebrations":
    "Elegant corporate awards, recognition and celebration events.",
  "Birthday Parties":
    "Celebrate unforgettable birthdays with creative party experiences.",
  "Kids Party Specialists":
    "Fun-filled entertainment and experiences designed for children.",
  "Party Essentials":
    "Everything you need to create a memorable celebration.",
  "Baby & Family Events":
    "Beautiful celebrations for babies, families and special milestones.",
  "Reunion & Milestone Events":
    "Celebrate reunions, anniversaries, graduations and milestones.",
  "Theme & Concept Parties":
    "Creative themed celebrations designed around your unique concept.",
};

/* ============================================================
   COMPONENT
============================================================ */

export default function DynamicSubcategoryCards({
  categoryName,
  subcategories,
  onSelect,
}: DynamicSubcategoryCardsProps) {
  const categoryImage = getMainCategoryImage(categoryName);

  const cardImages = useMemo(
    () => pickImagesForCategory(categoryName, subcategories),
    [categoryName, subcategories]
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent px-5 pb-16">
      {/* HEADER */}
      <div className="relative z-10 flex flex-col items-center justify-center pb-8 pt-10 text-center">
        <div className="relative mb-5 flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-full border border-[#d4af37] bg-black shadow-[0_0_45px_rgba(212,175,55,0.25)]">
          {categoryImage ? (
            <img
              src={categoryImage}
              alt={categoryName}
              className="h-full w-full object-cover"
            />
          ) : (
            <Globe className="h-12 w-12 text-[#d4af37]" />
          )}
        </div>

        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
          {categoryName}
        </p>

        <h1 className="max-w-5xl font-serif text-4xl font-bold leading-tight text-white md:text-5xl">
          Plan Your Perfect{" "}
          {categoryName.replace(" Events", "").replace(" & F&B", "")} Event
        </h1>

        <p className="mt-4 max-w-3xl text-sm text-white/60 md:text-base">
          Discover trusted professionals and premium services for every part of
          your event.
        </p>

        <div className="mt-7 flex items-center gap-4">
          <div className="h-px w-16 bg-[#d4af37]/50" />
          <div className="h-1.5 w-1.5 rotate-45 bg-[#d4af37]" />
          <div className="h-px w-16 bg-[#d4af37]/50" />
        </div>
      </div>

      {/* SUBCATEGORY CARDS */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {subcategories.map((subcategory, index) => {
          const image = cardImages[index];
          const Icon = icons[index % icons.length];

          const description =
            descriptions[subcategory.name] ||
            `Professional ${subcategory.name.toLowerCase()} services.`;

          return (
            <button
              key={subcategory.name}
              type="button"
              onClick={() => onSelect(subcategory)}
              className="group relative h-[190px] overflow-hidden rounded-2xl border border-[#d4af37]/50 bg-black text-left shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-[0_0_35px_rgba(212,175,55,0.25)] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              {/* IMAGE */}
              {image && (
                <img
                  src={image}
                  alt={subcategory.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="eager"
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

              {/* HOVER GLOW */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.20),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* CONTENT */}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4af37]/70 bg-black/70 backdrop-blur-md transition-all duration-300 group-hover:bg-[#d4af37]">
                      <Icon className="h-5 w-5 text-[#d4af37] transition-colors duration-300 group-hover:text-black" />
                    </div>

                    <h3 className="font-serif text-lg font-semibold leading-tight text-white drop-shadow-lg">
                      {subcategory.name}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-xs text-white/65">
                      {description}
                    </p>

                    <p className="mt-1 text-[11px] text-[#d4af37]">
                      {subcategory.services?.length ?? 0} services
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/70 bg-black/60 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#d4af37]">
                    <ArrowRight className="h-5 w-5 text-[#d4af37] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-black" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* BROWSE ALL */}
      <div className="relative z-10 mt-8 flex justify-center">
        <button
          type="button"
          className="rounded-xl bg-[#d4af37] px-7 py-3 font-serif text-sm font-semibold text-black shadow-[0_0_30px_rgba(212,175,55,0.18)] transition-all duration-300 hover:scale-105 hover:bg-[#e4c04b]"
        >
          Browse All {categoryName} Vendors
          <span className="ml-2">→</span>
        </button>
      </div>

      {/* BOTTOM TAGLINE */}
      <div className="relative z-10 mt-7 flex items-center justify-center gap-4 text-[9px] uppercase tracking-[0.35em] text-[#d4af37]/60">
        <span className="h-px w-16 bg-[#d4af37]/30" />
        <span>Professional Events • Trusted Vendors</span>
        <span className="h-px w-16 bg-[#d4af37]/30" />
      </div>
    </div>
  );
}