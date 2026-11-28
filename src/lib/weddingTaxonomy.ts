/**
 * Single source of truth for the Weddings flow (CAT-01, 4-tier taxonomy).
 * No labels are hardcoded in components - everything comes from here.
 */

export const ALL_VARIANT = "all"; // sentinel :variant for formats with no variants
export const RESERVED_FORMAT_IDS = ["compare"] as const;

/* ---------------- Tier 2: formats + variants ---------------- */

export type Variant = { id: string; name: string };

export type WeddingFormat = {
  id: "theme" | "culture" | "destination" | "luxury" | "budget" | "eco";
  name: string;
  tagline: string;
  /** substrings tried (in order) against filenames in subCategoryImages/wedding */
  imageKeys: string[];
  variants: Variant[];
  /** hidden by default; shown under a "More themes" toggle */
  moreVariants?: Variant[];
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const v = (names: string[]): Variant[] => names.map((name) => ({ id: slugify(name), name }));

export const FORMATS: readonly WeddingFormat[] = [
  {
    id: "theme",
    name: "Theme-Based Weddings",
    tagline: "Beach · Garden · Vintage · Royal",
    imageKeys: ["theme-based-weddings"],
    variants: v(["Beach", "Garden", "Vintage", "Royal", "Rustic", "Bohemian"]),
    moreVariants: v(["Modern Minimalist", "Forest", "Rooftop"]),
  },
  {
    id: "culture",
    name: "Culture-Based Weddings",
    tagline: "Hindu · Muslim · Sikh · Christian & more",
    imageKeys: ["culture-based-weddings"],
    variants: v(["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Inter-faith"]),
  },
  {
    id: "destination",
    name: "Destination Weddings",
    tagline: "International · Hill Stations · Beach · Forts",
    imageKeys: ["destination", "resort", "venue-logistics"],
    variants: v(["International", "Domestic Hill Stations", "Beach", "Heritage Forts"]),
  },
  {
    id: "luxury",
    name: "Luxury Weddings",
    tagline: "Grand, bespoke, no-compromise",
    imageKeys: ["luxury", "royal-wedding"],
    variants: [],
  },
  {
    id: "budget",
    name: "Budget / Intimate Weddings",
    tagline: "Small guest list, smart spends",
    imageKeys: ["budget", "intimate", "garden-wedding"],
    variants: [],
  },
  {
    id: "eco",
    name: "Eco-Friendly / Sustainable Weddings",
    tagline: "Green choices, zero-waste ideas",
    imageKeys: ["eco", "forest-wedding"],
    variants: [],
  },
] as const;

export const getFormat = (id?: string | null) => FORMATS.find((f) => f.id === id);

export const getVariant = (formatId?: string | null, variantId?: string | null) => {
  const f = getFormat(formatId);
  if (!f || !variantId || variantId === ALL_VARIANT) return undefined;
  return [...f.variants, ...(f.moreVariants ?? [])].find((x) => x.id === variantId);
};

/* ---------------- Tier 3: functions (14) ---------------- */

export type WeddingFunction = { id: number; slug: string; name: string; subtitle?: string };

const fn = (id: number, name: string, subtitle?: string): WeddingFunction => ({
  id,
  slug: slugify(name),
  name,
  subtitle,
});

export const FUNCTIONS: readonly WeddingFunction[] = [
  fn(1, "Engagement Ceremonies", "Sagai, Ring Ceremony, Roka"),
  fn(2, "Mehandi & Henna Function"),
  fn(3, "Sangeet & Musical Night"),
  fn(4, "Haldi Ceremony"),
  fn(5, "Bachelor / Bachelorette Parties"),
  fn(6, "Bridal Shower"),
  fn(7, "Wedding Reception"),
  fn(8, "Cocktail Party"),
  fn(9, "Tilak / Shagun Ceremony"),
  fn(10, "Main Wedding Ceremony", "Phera, Nikah, Anand Karaj, Mass"),
  fn(11, "Bidaai Ceremony"),
  fn(12, "Post-Wedding Rituals", "Griha Pravesh, Mu Dikhai"),
  fn(13, "Anniversary Celebrations"),
  fn(14, "Vow Renewal Ceremonies"),
];

export const DEFAULT_FUNCTION_IDS = [10]; // Main Wedding Ceremony preselected on first arrival

/* ---------------- Tier 4: services (33) ---------------- */

export type GroupId =
  | "photo" | "decor" | "catering" | "bridal" | "entertainment"
  | "venue" | "priest" | "invites" | "effects" | "planning";

export const SERVICE_GROUPS: readonly { id: GroupId; name: string }[] = [
  { id: "planning", name: "Planning & Mehandi" },
  { id: "venue", name: "Venue & Logistics" },
  { id: "decor", name: "Decor & Florals" },
  { id: "catering", name: "Catering & Food" },
  { id: "photo", name: "Photography & Video" },
  { id: "bridal", name: "Bridal & Grooming" },
  { id: "entertainment", name: "Entertainment & Artists" },
  { id: "priest", name: "Priest & Rituals" },
  { id: "invites", name: "Invitations & Stationery" },
  { id: "effects", name: "Special Effects" },
];

export type WeddingService = {
  id: number;
  slug: string;
  name: string;
  subtitle?: string;
  group: GroupId;
  /** used only as fallback when a vendor has no service_ids */
  keywords: string[];
};

const sv = (
  id: number, name: string, group: GroupId, keywords: string[], subtitle?: string,
): WeddingService => ({ id, slug: slugify(name), name, subtitle, group, keywords });

export const SERVICES: readonly WeddingService[] = [
  sv(1, "Wedding Planners & Coordinators", "planning", ["planner", "coordinator", "planning"]),
  sv(2, "Venue Providers", "venue", ["venue", "banquet", "hotel", "resort", "farmhouse"], "Banquet Halls, Hotels, Resorts, Farmhouses, Destination"),
  sv(3, "Decorators & Florists", "decor", ["decor", "decorator", "floral", "florist", "flower", "mandap"], "Stage, Entry Gates, Theme Decor"),
  sv(4, "Caterers & Food Services", "catering", ["cater", "food", "cuisine", "chaat"], "Multi-cuisine, Live Counters, Desserts"),
  sv(5, "Photographers & Videographers", "photo", ["photograph", "videograph", "photo", "video", "candid", "cinematic"], "Candid, Drone, Pre-wedding, Cinematic"),
  sv(6, "Bridal Makeup Artists & Hair Stylists", "bridal", ["makeup", "bridal makeup", "hair"]),
  sv(7, "Groom Makeup & Styling", "bridal", ["groom", "sherwani"]),
  sv(8, "Mehandi Artists", "planning", ["mehandi", "mehendi", "mehndi", "henna"], "Traditional, Arabic, Indo-Western"),
  sv(9, "Bridal Wear Designers & Boutiques", "bridal", ["bridal wear", "boutique", "lehenga", "designer"]),
  sv(10, "Jewelry Designers & Rental", "bridal", ["jewel", "jewellery", "jewelry"]),
  sv(11, "Wedding Invitation Designers & Printers", "invites", ["invitation", "invite", "card"], "Digital, Physical, Video"),
  sv(12, "Choreographers", "entertainment", ["choreograph", "dance trainer"], "Sangeet, Couple Dance"),
  sv(13, "DJs & Music Systems", "entertainment", ["dj", "music system"]),
  sv(14, "Live Bands & Musicians", "entertainment", ["band", "musician", "live music"], "Classical, Bollywood, Fusion"),
  sv(15, "Sound & Lighting Technicians", "entertainment", ["sound", "lighting", "technician"]),
  sv(16, "Anchor / Emcee Services", "entertainment", ["anchor", "emcee", "mc"]),
  sv(17, "Entertainment Artists", "entertainment", ["singer", "dancer", "artist", "entertain"], "Singers, Dancers"),
  sv(18, "Wedding Favors & Gift Services", "invites", ["favor", "favour", "gift", "hamper"]),
  sv(19, "Trousseau Packers & Decorators", "bridal", ["trousseau"]),
  sv(20, "Wedding Cake Designers", "catering", ["cake"]),
  sv(21, "Bartenders & Beverage Services", "catering", ["bartend", "beverage", "mocktail", "cocktail"]),
  sv(22, "Tent & Canopy Providers", "decor", ["tent", "canopy"]),
  sv(23, "Furniture & Seating Arrangements", "decor", ["furniture", "seating"]),
  sv(24, "Stage Setup & Backdrop Services", "decor", ["stage", "backdrop"]),
  sv(25, "Transportation Services", "venue", ["transport", "car rental", "vintage car", "luxury car", "baggi", "horse"], "Luxury Cars, Vintage Cars, Baggi"),
  sv(26, "Valet Parking Services", "venue", ["valet", "parking"]),
  sv(27, "Pandit / Priest / Officiant", "priest", ["pandit", "priest", "qazi", "maulvi", "pastor", "granthi", "officiant"], "Hindu, Muslim Qazi, Christian Pastor, Sikh Granthi"),
  sv(28, "Wedding Stationery", "invites", ["stationery", "signage", "menu"], "Signage, Menu Cards"),
  sv(29, "Fireworks & Special Effects", "effects", ["firework", "pyro", "special effect", "spark", "confetti", "fog"]),
  sv(30, "Drone Services", "photo", ["drone"]),
  sv(31, "Photo Booth Services", "photo", ["photo booth"]),
  sv(32, "Henna Bar Setup", "planning", ["henna bar"]),
  sv(33, "Astrologers & Muhurat Services", "priest", ["astrolog", "muhurat"]),
];

export const getService = (id: number) => SERVICES.find((s) => s.id === id);

/* ---------------- Hints only - never auto-selected ---------------- */

export const FUNCTION_SERVICE_HINTS: Record<number, number[]> = {
  1: [1, 3, 5, 11, 20],
  2: [8, 32, 4, 13],
  3: [12, 13, 14, 15, 16, 17],
  4: [3, 5, 4],
  5: [21, 13, 5, 2],
  6: [3, 4, 20, 31],
  7: [4, 20, 21, 13, 16, 2],
  8: [21, 13, 14, 3],
  9: [27, 18, 3],
  10: [27, 33, 3, 24, 5, 9, 6],
  11: [25, 5, 3],
  12: [27, 3, 4],
  13: [4, 20, 5, 3],
  14: [27, 5, 3, 20],
};

export const hintedServiceIds = (functionIds: number[]): number[] =>
  Array.from(new Set(functionIds.flatMap((f) => FUNCTION_SERVICE_HINTS[f] ?? [])));