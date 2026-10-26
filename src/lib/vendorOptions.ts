import type { Vendor } from "@/lib/vendorData";

/* ───────── Options (mirror what the customer side already uses) ───────── */

export const SERVICE_GROUPS: { id: string; label: string; services: string[] }[] = [
  { id: "wedding", label: "Wedding & Bridal", services: ["Wedding Planner", "Floral Designer", "Mandap Decorator", "Tent & Draping Specialist", "Photographer", "Videographer", "Mehendi Artist", "Bridal Makeup", "Caterer", "Cake Designer", "Dhol Players", "Band & Shehnai", "Choreographer", "Lighting Designer", "Venue", "Invitation Designer", "Trousseau Packing", "Transport & Logistics", "DJ Services"] },
  { id: "corporate", label: "Corporate", services: ["Event Manager", "AV & Production", "Exhibition Stall Designer", "Keynote Speaker", "Anchor / MC", "Photographer", "Caterer"] },
  { id: "birthday", label: "Birthday & Kids", services: ["Party Decorator", "Cake Designer", "Kids Entertainer", "Photographer", "Caterer"] },
  { id: "social-party", label: "Social Parties", services: ["Event Decorator", "DJ Services", "Caterer", "Venue", "Floral Designer", "Bartending Services"] },
  { id: "concert", label: "Concerts & Music", services: ["DJ Services", "Live Band", "Lighting Designer", "Sound Engineer", "Stage Production"] },
  { id: "educational", label: "College & Education", services: ["Event Manager", "Tech Fest Organizer", "DJ Services", "Stage Production"] },
  { id: "religious", label: "Religious & Spiritual", services: ["Hindu Pandit", "Nikah Ceremony Organizer", "Shabad Kirtan Group", "Event Decorator", "Caterer"] },
  { id: "festivals", label: "Festivals & Melas", services: ["Festival Organizer", "Pandal Artist", "Event Decorator", "Lighting Designer"] },
  { id: "sports", label: "Sports Events", services: ["Marathon Planner", "Tournament Organizer", "Event Manager"] },
  { id: "fashion-lifestyle", label: "Fashion & Lifestyle", services: ["Fashion Show Organizer", "Pageant Organizer", "Makeup Artist", "Photographer"] },
  { id: "technology", label: "Technology Events", services: ["Tech Event Organizer", "Hackathon Organizer", "AV & Production"] },
  { id: "health-wellness", label: "Health & Wellness", services: ["Yoga Retreat Organizer", "Wellness Event Planner"] },
  { id: "charity", label: "Charity & NGO", services: ["NGO Fundraiser Organizer", "Event Manager"] },
  { id: "virtual", label: "Virtual & Hybrid", services: ["Hybrid Event Producer", "Live Streaming Studio"] },
  { id: "hospitality", label: "Food & Hospitality", services: ["Celebrity Chef Booking", "Bartending Services", "Caterer"] },
  { id: "film-media", label: "Film & Media", services: ["Film Premiere Organizer", "Videographer", "Photographer"] },
];

export const EVENT_TYPE_OPTIONS = ["Wedding", "Engagement", "Haldi", "Mehendi", "Sangeet", "Reception", "Anniversary", "Birthday", "Baby Shower", "Corporate", "Conference", "Product Launch", "Concert", "College Fest", "Religious / Puja", "Festival / Mela", "Sports Event", "Fashion Show", "Wellness Retreat", "Social Party", "Tech Event", "Exhibition", "Charity / NGO", "Virtual / Hybrid"];

export const CITY_OPTIONS = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Jaipur", "Kolkata", "Goa", "Ahmedabad", "Surat", "Kochi", "Lucknow", "Kanpur", "Chandigarh", "Udaipur", "Indore", "Bhopal", "Nagpur", "Varanasi", "Amritsar", "Patna", "Noida", "Gurugram"];

export const LANGUAGE_OPTIONS = ["Hindi", "English", "Punjabi", "Gujarati", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam", "Urdu"];

export const RESPONSE_TIMES = ["< 1 hr", "< 2 hrs", "< 3 hrs", "< 4 hrs", "< 6 hrs", "< 12 hrs"];

export type PriceUnit = "per_event" | "per_day" | "per_plate" | "per_card";
export const PRICE_UNITS: { value: PriceUnit; label: string; suffix: string }[] = [
  { value: "per_event", label: "Per event", suffix: "" },
  { value: "per_day", label: "Per day", suffix: "/day" },
  { value: "per_plate", label: "Per plate", suffix: "/plate" },
  { value: "per_card", label: "Per card or piece", suffix: "/card" },
];

export const CANCELLATION_PRESETS = [
  "Flexible: full refund of advance up to 30 days before the event.",
  "Moderate: 50% refund up to 15 days before the event.",
  "Strict: advance is non-refundable after booking confirmation.",
];

/* ───────── Types ───────── */

export interface VendorProfileRow {
  user_id: string;
  business_name: string;
  tagline: string;
  description: string;
  category: string;
  category_id: string;
  subcategory: string;
  event_types: string[];
  specialties: string[];
  tags: string[];
  languages: string[];
  home_city: string;
  cities: string[];
  travels_for_destination: boolean;
  years_experience: number;
  events_completed: number;
  team_size: number;
  price_min: number;
  price_max: number;
  price_unit: PriceUnit;
  min_notice_days: number;
  response_time: string;
  cancellation_policy: string;
  logo_url: string;
  cover_urls: string[];
  onboarded: boolean;
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  status: "draft" | "pending_review" | "approved" | "rejected";
  rating: number;
  reviews_count: number;
}

export interface VendorPrivate {
  phone: string;
  whatsapp: string;
  contact_email: string;
  instagram: string;
  website: string;
  business_type: string;
  gst_number: string;
  upi_id: string;
  account_holder: string;
  bank_name: string;
  ifsc: string;
  account_number: string;
}

export const EMPTY_PRIVATE: VendorPrivate = {
  phone: "", whatsapp: "", contact_email: "", instagram: "", website: "",
  business_type: "individual", gst_number: "", upi_id: "", account_holder: "",
  bank_name: "", ifsc: "", account_number: "",
};

export const emptyProfile = (userId: string, name = ""): VendorProfileRow => ({
  user_id: userId, business_name: name, tagline: "", description: "",
  category: "", category_id: "wedding", subcategory: "",
  event_types: [], specialties: [], tags: [], languages: ["Hindi", "English"],
  home_city: "", cities: [], travels_for_destination: false,
  years_experience: 0, events_completed: 0, team_size: 1,
  price_min: 0, price_max: 0, price_unit: "per_event",
  min_notice_days: 7, response_time: "< 4 hrs", cancellation_policy: "",
  logo_url: "", cover_urls: [], onboarded: false,
  verification_status: "unverified", status: "draft", rating: 0, reviews_count: 0,
});

/* ───────── Helpers ───────── */

export const inr = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n || 0));

export const shortINR = (n: number) => {
  if (n >= 10_000_000) return `₹${+(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000) return `₹${+(n / 100_000).toFixed(2)}L`;
  if (n >= 10_000 && n % 1000 === 0) return `₹${n / 1000}K`;
  return `₹${inr(n)}`;
};

export const priceLabel = (min: number, max: number, unit: PriceUnit = "per_event") => {
  const suffix = PRICE_UNITS.find((u) => u.value === unit)?.suffix ?? "";
  if (!min && !max) return "Price on request";
  return `${shortINR(min)} – ${shortINR(max || min)}${suffix}`;
};

export const initialsOf = (name: string) =>
  name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "V";

// Full class names are written out so Tailwind keeps them.
const GRADIENTS = [
  "from-rose-600 to-pink-700", "from-pink-600 to-rose-700", "from-indigo-600 to-blue-700",
  "from-green-600 to-emerald-700", "from-violet-600 to-purple-700", "from-amber-600 to-yellow-700",
  "from-orange-600 to-red-700", "from-sky-600 to-blue-700", "from-teal-600 to-cyan-700",
  "from-fuchsia-600 to-purple-700",
];
export const gradientFor = (seed: string) => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
};

/* ───────── Profile checklist (drives the progress bar + "Submit for review") ───────── */

export interface CheckItem { key: string; label: string; done: boolean; required: boolean; tab: string }

export function profileChecklist(
  p: VendorProfileRow,
  pv: VendorPrivate,
  c: { portfolio: number; packages: number; docs: number },
): CheckItem[] {
  return [
    { key: "name", label: "Business name and a description of 40+ characters", done: p.business_name.trim().length > 1 && p.description.trim().length >= 40, required: true, tab: "profile" },
    { key: "service", label: "Service category and event types", done: !!p.category && p.event_types.length > 0, required: true, tab: "profile" },
    { key: "city", label: "Home city and cities you serve", done: !!p.home_city && p.cities.length > 0, required: true, tab: "profile" },
    { key: "price", label: "Starting and maximum price", done: p.price_min > 0 && p.price_max >= p.price_min, required: true, tab: "profile" },
    { key: "payout", label: "UPI ID for payouts and a phone number", done: pv.upi_id.includes("@") && pv.phone.replace(/\D/g, "").length >= 10, required: true, tab: "settings" },
    { key: "logo", label: "Logo", done: !!p.logo_url, required: false, tab: "profile" },
    { key: "cover", label: "At least one cover image", done: p.cover_urls.length > 0, required: false, tab: "profile" },
    { key: "portfolio", label: "Four or more portfolio photos", done: c.portfolio >= 4, required: true, tab: "portfolio" },
    { key: "package", label: "At least one package", done: c.packages > 0, required: false, tab: "packages" },
    { key: "specialties", label: "Two or more specialties", done: p.specialties.length >= 2, required: false, tab: "profile" },
    { key: "docs", label: "ID proof uploaded for the Verified badge", done: c.docs > 0, required: false, tab: "settings" },
  ];
}

/* ───────── Convert a DB vendor into the shape the customer pages already use ───────── */

export type LiveVendor = Vendor & {
  blockedDates: string[];
  logoUrl: string;
  coverUrls: string[];
  isLive: true;
};

export function toLiveVendor(row: any, portfolioRows: any[] = [], blocked: string[] = []): LiveVendor {
  const cities: string[] = row.cities?.length ? row.cities : row.home_city ? [row.home_city] : [];
  return {
    id: row.user_id,
    name: row.business_name,
    category: row.category,
    categoryId: row.category_id,
    subcategory: row.subcategory || row.category,
    rating: Number(row.rating) || 0,
    reviews: row.reviews_count ?? 0,
    location: row.home_city,
    cities,
    price: priceLabel(row.price_min, row.price_max, row.price_unit),
    priceMin: row.price_min,
    priceMax: row.price_max,
    initials: initialsOf(row.business_name),
    gradient: gradientFor(row.user_id),
    tags: row.tags?.length ? row.tags : (row.specialties ?? []).slice(0, 3),
    description: row.description,
    isVerified: row.verification_status === "verified",
    yearsExperience: row.years_experience,
    eventsCompleted: row.events_completed,
    responseTime: row.response_time,
    specialties: row.specialties ?? [],
    portfolio: portfolioRows.slice(0, 8).map((r) => ({
      id: r.id, title: r.title || "Portfolio", gradient: gradientFor(r.id), emoji: "📸",
      category: row.category, eventType: r.event_type || "Event",
      imageUrl: r.image_url,
    })) as any,
    blockedDates: blocked,
    logoUrl: row.logo_url,
    coverUrls: row.cover_urls ?? [],
    isLive: true,
  };
}