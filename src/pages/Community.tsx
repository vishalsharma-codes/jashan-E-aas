import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { ReactNode, ChangeEvent, FormEvent, ButtonHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import {
  Users, Heart, MessageSquare, Calendar, Plus, MapPin, Lock, Globe,
  X, Search, Check, Minus, Send, CheckCircle2, ShieldCheck,
  Image as ImageIcon, Tag, TrendingUp, Star,
} from "lucide-react";

/* ----------------------------- Types & data ----------------------------- */

type TabKey = "communities" | "events" | "feed";
type Membership = "joined" | "pending";

interface Community {
  id: string;
  icon: string;
  type: string;
  name: string;
  members: number;
  admin: string;
  purpose: string;
  tags: string[];
  banner: string; // CSS background used when there is no cover photo
  cover?: string; // cover photo URL or /public path
  avatar?: string; // profile picture URL or /public path
  isVerified: boolean;
  posts: number;
  city: string;
  isPrivate?: boolean;
  featured?: "large" | "trending";
}

interface EventItem {
  id: string;
  title: string;
  organizer: string;
  community: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  price: number;
  capacity: number;
  filled: number;
  location: string;
  icon: string;
  banner: string;
  image?: string; // optional real 16:9 photo
}

interface Comment {
  author: string;
  text: string;
}

interface PostMedia {
  url: string;
  type: "image" | "video";
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  gradient: string;
  community: string;
  time: string;
  content: string;
  likes: number;
  comments: Comment[];
  commentCount: number;
  tags: string[];
  media?: PostMedia;
  event?: string;
  location?: string;
}

/* Rich CSS "photo-like" banners, used until real cover photos are supplied */
const BANNERS = {
  golden:
    "radial-gradient(circle at 78% 22%, rgba(255,214,120,.95) 0, rgba(255,170,60,.45) 14%, transparent 38%), radial-gradient(circle at 20% 80%, rgba(255,255,255,.12), transparent 40%), linear-gradient(135deg,#0f1b3d,#27407a 55%,#b0702d)",
  floral:
    "radial-gradient(circle at 20% 30%, rgba(255,214,225,.9), transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,160,120,.7), transparent 40%), radial-gradient(circle at 60% 20%, rgba(255,230,160,.6), transparent 30%), linear-gradient(135deg,#8B1E3F,#c2416a 60%,#f0a07a)",
  city:
    "radial-gradient(circle at 15% 85%, rgba(255,190,90,.6), transparent 30%), radial-gradient(circle at 85% 20%, rgba(120,170,255,.4), transparent 35%), linear-gradient(135deg,#14161f,#2b3045 60%,#4a3b2a)",
  eco:
    "radial-gradient(circle at 80% 25%, rgba(190,255,200,.6), transparent 35%), linear-gradient(135deg,#0f3d2e,#1f7a55 60%,#9bc77a)",
  stage:
    "conic-gradient(from 200deg at 50% -10%, transparent 0 20deg, rgba(255,120,220,.55) 30deg, transparent 50deg, rgba(120,150,255,.55) 70deg, transparent 90deg, rgba(255,200,100,.5) 110deg, transparent 130deg), linear-gradient(180deg,#1a0b2e,#3b1d63)",
  private: "linear-gradient(135deg,#2a2626,#4a4240)",
  gold:
    "radial-gradient(circle at 75% 30%, rgba(255,245,200,.8), transparent 35%), linear-gradient(135deg,#7a5a1e,#d4af37 60%,#f3e2a9)",
};

const TYPE_STYLES: Record<string, { icon: string; banner: string }> = {
  "Vendor Community": { icon: "📸", banner: BANNERS.golden },
  "Event Category": { icon: "💒", banner: BANNERS.floral },
  "City Community": { icon: "🏢", banner: BANNERS.city },
  "Interest Community": { icon: "🌿", banner: BANNERS.eco },
  "Private Planning Group": { icon: "🔒", banner: BANNERS.private },
};
const COMMUNITY_TYPES = Object.keys(TYPE_STYLES);

/* Placeholder stock photos (keyword based). Replace with your own files in /public when ready. */
const photo = (keywords: string, lock: number, w = 900, h = 400) =>
  `https://picsum.photos/seed/${keywords.split(",")[0]}-${lock}/${w}/${h}`;
const face = (n: number) => `https://i.pravatar.cc/80?img=${n}`;
const TYPE_PHOTO_KEYWORDS: Record<string, [string, string]> = {
  "Vendor Community": ["photography,camera", "camera,lens"],
  "Event Category": ["wedding,decoration", "wedding,flowers"],
  "City Community": ["conference,event", "office,building"],
  "Interest Community": ["garden,plants", "leaves,green"],
  "Private Planning Group": ["family,celebration", "family,home"],
};

const initialCommunities: Community[] = [
  {
    id: "c2", icon: "💒", type: "Event Category", name: "Wedding Planning India", members: 4230,
    admin: "Platform Moderator",
    purpose: "Wedding planning tips, vendor recommendations and real experiences from couples and planners across India.",
    tags: ["Weddings", "All India", "Tips"], banner: BANNERS.floral,
    cover: photo("wedding,decoration", 21), avatar: photo("wedding,flowers", 22, 200, 200),
    isVerified: true, posts: 1890, city: "Pan India", featured: "large",
  },
  {
    id: "c1", icon: "📸", type: "Vendor Community", name: "Delhi Photographers Guild", members: 847,
    admin: "Rohan Kapoor Photography",
    purpose: "Showcase work, discuss industry, refer clients to each other",
    tags: ["Photography", "Delhi", "Networking"], banner: BANNERS.golden,
    cover: photo("photography,camera", 23), avatar: photo("camera,lens", 24, 200, 200),
    isVerified: true, posts: 234, city: "Delhi", featured: "trending",
  },
  {
    id: "c3", icon: "🏢", type: "City Community", name: "Mumbai Corporate Events", members: 1560,
    admin: "EventPro Mumbai",
    purpose: "Local vendor recommendations, Mumbai event trends, venue reviews",
    tags: ["Corporate", "Mumbai", "Venues"], banner: BANNERS.city,
    cover: photo("conference,event", 25), avatar: photo("office,building", 26, 200, 200),
    isVerified: true, posts: 567, city: "Mumbai",
  },
  {
    id: "c4", icon: "🌿", type: "Interest Community", name: "Eco-Friendly Events", members: 329,
    admin: "GreenEvent Collective",
    purpose: "DIY decoration, sustainable vendor lists, zero-waste event ideas",
    tags: ["Eco", "Sustainable", "DIY"], banner: BANNERS.eco,
    cover: photo("garden,plants", 27), avatar: photo("leaves,green", 28, 200, 200),
    isVerified: false, posts: 89, city: "All India",
  },
  {
    id: "c5", icon: "🎵", type: "Vendor Community", name: "Choreographers Network India", members: 612,
    admin: "National Dance Association",
    purpose: "Performer community — share reels, find collaborators, discuss rates",
    tags: ["Dance", "Performance", "Sangeet"], banner: BANNERS.stage,
    cover: photo("dance,stage", 29), avatar: photo("dancer,performance", 30, 200, 200),
    isVerified: true, posts: 443, city: "Pan India",
  },
  {
    id: "c6", icon: "🔒", type: "Private Planning Group", name: "Sharma-Mehta Wedding 2026", members: 12,
    admin: "Priya Sharma",
    purpose: "Private group for family + selected vendors to co-plan the wedding",
    tags: ["Private", "Wedding", "Family"], banner: BANNERS.private,
    cover: photo("family,celebration", 31), avatar: photo("family,home", 32, 200, 200),
    isVerified: false, posts: 56, city: "Jaipur", isPrivate: true,
  },
];

const initialEvents: EventItem[] = [
  {
    id: "e1", title: "Photography Workshop — Golden Hour Portraits", organizer: "Rohan Kapoor Photography",
    community: "Delhi Photographers Guild", date: "2026-11-21", time: "4:00 PM", price: 1500,
    capacity: 20, filled: 14, location: "Lodhi Garden, Delhi", icon: "📸", banner: BANNERS.golden,
    image: photo("photography,portrait", 41, 800, 450),
  },
  {
    id: "e2", title: "Pre-Wedding Vendor Speed Dating", organizer: "EventPro Mumbai",
    community: "Mumbai Corporate Events", date: "2026-11-28", time: "11:00 AM", price: 500,
    capacity: 50, filled: 38, location: "The Leela, Mumbai", icon: "💑", banner: BANNERS.floral,
    image: photo("wedding,vendors", 42, 800, 450),
  },
  {
    id: "e3", title: "Sangeet Choreography Group Session", organizer: "Natya Academy",
    community: "Choreographers Network India", date: "2026-12-05", time: "6:00 PM", price: 2000,
    capacity: 30, filled: 30, location: "Andheri West, Mumbai", icon: "💃", banner: BANNERS.stage,
    image: photo("dance,sangeet", 43, 800, 450),
  },
  {
    id: "e4", title: "Wedding Exhibition — Venue & Decor Showcase", organizer: "Wedding Planning India",
    community: "Wedding Planning India", date: "2026-12-12", time: "10:00 AM", price: 0,
    capacity: 200, filled: 87, location: "Pragati Maidan, Delhi", icon: "🏛️", banner: BANNERS.gold,
    image: photo("wedding,venue", 44, 800, 450),
  },
];

const initialPosts: Post[] = [
  {
    id: "p1", author: "Kavitha Nair", avatar: "KN", gradient: "linear-gradient(135deg,#f472b6,#be185d)",
    community: "Wedding Planning India", time: "2h ago",
    content: "Finally found the perfect mehandi artist in Kochi after searching for 3 months! Her Arabic style is absolutely stunning. DM me for her contact — she has slots for December.",
    likes: 47, comments: [], commentCount: 12, tags: ["Mehandi", "Kochi", "Recommendation"],
    location: "Kochi, Kerala",
  },
  {
    id: "p2", author: "Arun Photography", avatar: "AP", gradient: "linear-gradient(135deg,#3b82f6,#4338ca)",
    community: "Delhi Photographers Guild", time: "5h ago",
    content: "Shooting tip of the week: For golden hour sangeet shots, position the couple with the light source at 45° behind them. Creates that magical rim lighting every bride loves. See sample shot in comments 📸",
    likes: 89, comments: [], commentCount: 23, tags: ["Photography", "Tip", "Sangeet"],
    event: "Photography Workshop — Golden Hour Portraits",
  },
  {
    id: "p3", author: "Green Events India", avatar: "GE", gradient: "linear-gradient(135deg,#10b981,#0f766e)",
    community: "Eco-Friendly Events", time: "1d ago",
    content: "We just completed a zero-waste Diwali corporate event for 300 guests. Total waste: 2.3 kg. Traditional events generate 50+ kg for same size. AMA in comments!",
    likes: 134, comments: [], commentCount: 45, tags: ["Eco", "Corporate", "ZeroWaste"],
  },
];

const CURRENT_USER = "You";

/* ------------------------------ Helpers ----------------------------- */

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#f472b6,#be185d)",
  "linear-gradient(135deg,#60a5fa,#4338ca)",
  "linear-gradient(135deg,#34d399,#0f766e)",
  "linear-gradient(135deg,#fbbf24,#b45309)",
  "linear-gradient(135deg,#a78bfa,#6d28d9)",
  "linear-gradient(135deg,#fb923c,#c2410c)",
];
const SAMPLE_PEOPLE = [
  "Aarav Mehta", "Isha Verma", "Rohan Kapoor", "Sneha Iyer", "Kabir Singh",
  "Meera Nair", "Vikram Rao", "Anjali Gupta", "Dev Malhotra", "Priya Shah",
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const parseISO = (iso: string) => new Date(`${iso}T00:00:00`);
const monthShort = (iso: string) => parseISO(iso).toLocaleString("en-IN", { month: "short" }).toUpperCase();
const dayNum = (iso: string) => parseISO(iso).getDate();
const dateFull = (iso: string) =>
  parseISO(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const FACE_IMGS = [12, 5, 33, 47, 15, 32, 60, 26, 52, 9];

function FaceAvatar({ name, idx, size }: { name: string; idx: number; size: number }) {
  const [failed, setFailed] = useState(false);
  const base = "rounded-full ring-2 ring-white -ml-2 first:ml-0 shrink-0 object-cover";
  if (failed) {
    return (
      <span
        title={name}
        className={`${base} flex items-center justify-center text-white font-bold`}
        style={{ width: size, height: size, fontSize: size * 0.36, background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
      >
        {initialsOf(name)}
      </span>
    );
  }
  return (
    <img
      src={face(FACE_IMGS[idx % FACE_IMGS.length])}
      alt={name}
      title={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={base}
      style={{ width: size, height: size }}
    />
  );
}

function Facepile({ seed, total, max = 4, size = 28 }: { seed: string; total: number; max?: number; size?: number }) {
  const shown = Math.min(max, total);
  const start = hash(seed) % SAMPLE_PEOPLE.length;
  return (
    <div className="flex items-center">
      {Array.from({ length: shown }).map((_, i) => {
        const name = SAMPLE_PEOPLE[(start + i) % SAMPLE_PEOPLE.length];
        return (
          <FaceAvatar key={i} name={name} idx={(start + i) % SAMPLE_PEOPLE.length} size={size} />
        );
      })}
      {total > shown && (
        <span
          className="rounded-full ring-2 ring-white bg-[#F5EFE6] text-[#1A1818] font-bold flex items-center justify-center -ml-2"
          style={{ height: size, minWidth: size, padding: "0 6px", fontSize: size * 0.36 }}
        >
          +{(total - shown).toLocaleString("en-IN")}
        </span>
      )}
    </div>
  );
}

function Cover({ src, bg, className = "", children, fallback }: { src?: string; bg: string; className?: string; children?: ReactNode; fallback?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: bg }}>
      {src && !failed && (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {(!src || failed) && fallback}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
      {children}
    </div>
  );
}

function LogoAvatar({ src, icon, className }: { src?: string; icon: string; className: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`${className} rounded-full bg-white ring-4 ring-white shadow-md flex items-center justify-center overflow-hidden shrink-0`}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover" />
      ) : (
        icon
      )}
    </span>
  );
}

function Btn({
  variant = "primary", size = "md", className = "", ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "soft"; size?: "sm" | "md" }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-semibold rounded-full transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F]/40";
  const sizes = { sm: "text-xs px-4 h-8", md: "text-sm px-6 h-11" };
  const variants = {
    primary: "bg-[#8B1E3F] text-white hover:bg-[#721831] shadow-[0_6px_16px_-6px_rgba(139,30,63,0.55)]",
    outline: "bg-white text-[#1A1818] border border-[#1A1818]/20 hover:border-[#1A1818]/50 hover:bg-[#F5EFE6]",
    ghost: "bg-transparent text-[#5E5754] hover:text-[#1A1818] hover:bg-[#F5EFE6]",
    soft: "bg-[#F5EFE6] text-[#8B1E3F] hover:bg-[#EDE3D3]",
  };
  return <button type="button" className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

function EscrowBadge({ label = "Escrow protected" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F3EC] text-[#1F6B45] text-[11px] font-semibold px-2.5 py-1">
      <ShieldCheck className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1818]/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white text-[#1A1818] rounded-2xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]"
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="cm-serif text-xl font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-[#F5EFE6] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputCls =
  "w-full bg-white border border-[#E9E1D5] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1818] placeholder:text-[#8A827E] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/25 focus:border-[#8B1E3F]/50";
const cardShadow =
  "shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03]";
const cardHover =
  "hover:shadow-[0_14px_36px_-10px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 transition-all duration-300";

const pill = (active: boolean) =>
  `text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
    active
      ? "bg-[#1A1818] text-white shadow-sm"
      : "bg-white text-[#3D3735] border border-[#E9E1D5] hover:border-[#1A1818]/40"
  }`;

/* --------------------------------- Page --------------------------------- */

export default function Community() {
  const [activeTab, setActiveTab] = useState<TabKey>("communities");
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const [membership, setMembership] = useState<Record<string, Membership>>({});
  const [bookings, setBookings] = useState<Record<string, number>>({});
  const [waitlist, setWaitlist] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [feedFilter, setFeedFilter] = useState<"all" | "mine">("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);
  const [seats, setSeats] = useState(1);

  const emptyForm = { name: "", type: COMMUNITY_TYPES[0], city: "", purpose: "", tags: "", isPrivate: false };
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // composer
  const [composerText, setComposerText] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerCommunity, setComposerCommunity] = useState("");
  const [composerMedia, setComposerMedia] = useState<PostMedia | null>(null);
  const [composerEvent, setComposerEvent] = useState("");
  const [composerLocation, setComposerLocation] = useState("");
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const listRef = useRef<HTMLDivElement>(null);

  /* ---------------------------- Derived values ---------------------------- */

  const filteredCommunities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return communities.filter((c) => {
      const matchType = typeFilter === "All" || c.type === typeFilter;
      const matchSearch =
        !q || [c.name, c.purpose, c.city, c.type, ...c.tags].some((s) => s.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [communities, search, typeFilter]);

  const totalMembers = communities.reduce((s, c) => s + c.members, 0);
  const joinedCommunities = communities.filter((c) => membership[c.id] === "joined");
  const joinedNames = new Set(joinedCommunities.map((c) => c.name));
  const visiblePosts = feedFilter === "mine" ? posts.filter((p) => joinedNames.has(p.community)) : posts;

  const detailCommunity = communities.find((c) => c.id === detailId) || null;
  const bookingEvent = events.find((e) => e.id === bookingEventId) || null;

  useEffect(() => {
    if (!composerCommunity && joinedCommunities.length) setComposerCommunity(joinedCommunities[0].name);
    if (composerCommunity && !joinedNames.has(composerCommunity)) {
      setComposerCommunity(joinedCommunities[0]?.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membership, communities]);

  /* ------------------------------ Communities ----------------------------- */

  const adjustMembers = (id: string, delta: number) =>
    setCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, members: Math.max(0, c.members + delta) } : c)));

  const handleMembership = (c: Community) => {
    const status = membership[c.id];
    if (status === "joined") {
      setMembership((m) => { const n = { ...m }; delete n[c.id]; return n; });
      adjustMembers(c.id, -1);
      toast(`You left ${c.name}`);
    } else if (status === "pending") {
      setMembership((m) => { const n = { ...m }; delete n[c.id]; return n; });
      toast("Join request cancelled");
    } else if (c.isPrivate) {
      setMembership((m) => ({ ...m, [c.id]: "pending" }));
      toast(`Request sent to ${c.admin}`);
    } else {
      setMembership((m) => ({ ...m, [c.id]: "joined" }));
      adjustMembers(c.id, 1);
      toast(`Welcome to ${c.name}! 🎉`);
    }
  };

  const membershipLabel = (c: Community) => {
    const s = membership[c.id];
    if (s === "joined") return "Joined ✓";
    if (s === "pending") return "Requested";
    return c.isPrivate ? "Request" : "Join";
  };
  const membershipVariant = (c: Community) =>
    membership[c.id] === "joined" ? "soft" : membership[c.id] === "pending" ? "outline" : "primary";

  const handleBrowseAll = () => {
    setActiveTab("communities");
    setSearch("");
    setTypeFilter("All");
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleCreateCommunity = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) return setFormError("Community name must be at least 3 characters.");
    if (form.purpose.trim().length < 10) return setFormError("Please describe the purpose (at least 10 characters).");
    if (communities.some((c) => c.name.toLowerCase() === form.name.trim().toLowerCase()))
      return setFormError("A community with this name already exists.");

    const style = TYPE_STYLES[form.type];
    const isPrivate = form.isPrivate || form.type === "Private Planning Group";
    const newCommunity: Community = {
      id: `c-${Date.now()}`,
      icon: isPrivate ? "🔒" : style.icon,
      type: form.type,
      name: form.name.trim(),
      members: 1,
      admin: CURRENT_USER,
      purpose: form.purpose.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5),
      banner: isPrivate ? BANNERS.private : style.banner,
      cover: photo((TYPE_PHOTO_KEYWORDS[form.type] || TYPE_PHOTO_KEYWORDS["Interest Community"])[0], hash(form.name) % 1000),
      avatar: photo((TYPE_PHOTO_KEYWORDS[form.type] || TYPE_PHOTO_KEYWORDS["Interest Community"])[1], hash(form.name + "a") % 1000, 200, 200),
      isVerified: false,
      posts: 0,
      city: form.city.trim() || "All India",
      isPrivate,
    };
    setCommunities((cs) => [newCommunity, ...cs]);
    setMembership((m) => ({ ...m, [newCommunity.id]: "joined" }));
    setForm(emptyForm);
    setFormError("");
    setCreateOpen(false);
    setActiveTab("communities");
    setSearch("");
    setTypeFilter("All");
    toast(`"${newCommunity.name}" created 🎉`);
  };

  /* --------------------------------- Events ------------------------------- */

  const openBooking = (ev: EventItem) => {
    if (bookings[ev.id]) return;
    if (ev.filled >= ev.capacity) {
      const on = !waitlist[ev.id];
      setWaitlist((w) => ({ ...w, [ev.id]: on }));
      toast(on ? "You're on the waitlist — we'll notify you if a spot opens" : "Removed from waitlist");
      return;
    }
    setSeats(1);
    setBookingEventId(ev.id);
  };

  const confirmBooking = () => {
    if (!bookingEvent) return;
    setBookings((b) => ({ ...b, [bookingEvent.id]: seats }));
    setEvents((es) => es.map((e) => (e.id === bookingEvent.id ? { ...e, filled: e.filled + seats } : e)));
    toast(
      bookingEvent.price === 0
        ? `Registered for ${bookingEvent.title}`
        : `Booked ${seats} seat${seats > 1 ? "s" : ""} — ₹${(seats * bookingEvent.price).toLocaleString("en-IN")} held in escrow`
    );
    setBookingEventId(null);
  };

  const cancelBooking = (ev: EventItem) => {
    const n = bookings[ev.id];
    if (!n) return;
    setBookings((b) => { const x = { ...b }; delete x[ev.id]; return x; });
    setEvents((es) => es.map((e) => (e.id === ev.id ? { ...e, filled: Math.max(0, e.filled - n) } : e)));
    toast("Booking cancelled — escrow refunded");
  };

  /* ---------------------------------- Feed -------------------------------- */

  const toggleLike = (id: string) => {
    const was = !!liked[id];
    setLiked((l) => ({ ...l, [id]: !was }));
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, likes: p.likes + (was ? -1 : 1) } : p)));
  };

  const addComment = (id: string) => {
    const text = (commentDrafts[id] || "").trim();
    if (!text) return;
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, comments: [...p.comments, { author: CURRENT_USER, text }], commentCount: p.commentCount + 1 }
          : p
      )
    );
    setCommentDrafts((d) => ({ ...d, [id]: "" }));
  };

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const isVideo = f.type.startsWith("video/");
    const isImage = f.type.startsWith("image/");
    if (!isImage && !isVideo) return toast("Please choose an image or video");
    const maxMb = isVideo ? 25 : 8;
    if (f.size > maxMb * 1024 * 1024) return toast(`File too large (max ${maxMb} MB)`);
    if (composerMedia) URL.revokeObjectURL(composerMedia.url);
    setComposerMedia({ url: URL.createObjectURL(f), type: isVideo ? "video" : "image" });
    setComposerOpen(true);
  };

  const removeMedia = () => {
    if (composerMedia) URL.revokeObjectURL(composerMedia.url);
    setComposerMedia(null);
  };

  const resetComposer = (keepMedia = false) => {
    setComposerText("");
    setComposerEvent("");
    setComposerLocation("");
    setShowEventPicker(false);
    setShowLocation(false);
    setComposerOpen(false);
    if (!keepMedia) removeMedia();
    else setComposerMedia(null);
  };

  const publishPost = () => {
    const text = composerText.trim();
    if (!text && !composerMedia) return toast("Write something or add a photo first");
    if (!composerCommunity) return toast("Join a community to post");
    const tags = Array.from(new Set((text.match(/#(\w+)/g) || []).map((t) => t.slice(1)))).slice(0, 5);
    const newPost: Post = {
      id: `p-${Date.now()}`,
      author: CURRENT_USER,
      avatar: "YO",
      gradient: "linear-gradient(135deg,#8B1E3F,#c2416a)",
      community: composerCommunity,
      time: "Just now",
      content: text.replace(/#(\w+)/g, "$1"),
      likes: 0,
      comments: [],
      commentCount: 0,
      tags,
      media: composerMedia ?? undefined,
      event: composerEvent || undefined,
      location: composerLocation.trim() || undefined,
    };
    setPosts((ps) => [newPost, ...ps]);
    setCommunities((cs) => cs.map((c) => (c.name === composerCommunity ? { ...c, posts: c.posts + 1 } : c)));
    const where = composerCommunity;
    resetComposer(true);
    toast("Posted to " + where);
  };

  const sharePost = async (p: Post) => {
    const text = `${p.author} in ${p.community}: ${p.content}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("Post copied to clipboard");
    } catch {
      toast("Couldn't copy — please copy manually");
    }
  };

  /* --------------------------------- Render -------------------------------- */

  const composerActive = composerOpen || !!composerText || !!composerMedia;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1818]">
      <Navbar />

      <main className="cm-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          .cm-root { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
          .cm-serif { font-family: 'Playfair Display', Georgia, serif; }
        `}</style>

        {/* Hero */}
        <section className="pt-32 pb-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 text-center">
            <p className="text-[#8B1E3F] text-xs font-bold uppercase tracking-[0.22em] mb-4">
              From Venue Scouting to Stage Lights
            </p>
            <h1 className="cm-serif text-4xl md:text-6xl font-bold leading-[1.1] mb-5 text-[#1A1818]">
              Join India's <span className="text-[#8B1E3F] italic">Event Community</span>
            </h1>
            <p className="text-[#4A4442] text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Connect with event professionals and enthusiasts across city communities. Attend events, share knowledge, build your network.
            </p>
            <div className="flex gap-3 justify-center flex-wrap mb-10">
              <Btn onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" /> Create Community
              </Btn>
              <Btn variant="outline" onClick={handleBrowseAll}>Browse All Communities</Btn>
            </div>

            <div className="inline-flex items-center divide-x divide-[#E9E1D5] bg-white rounded-2xl px-2 py-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
              {[
                { n: totalMembers.toLocaleString("en-IN"), l: "Members" },
                { n: String(communities.length), l: "Communities" },
                { n: String(events.length), l: "Upcoming events" },
              ].map((s) => (
                <div key={s.l} className="px-6 md:px-10 text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-[#8B1E3F] leading-none">{s.n}</p>
                  <p className="text-xs text-[#5E5754] mt-1.5 font-medium">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Tabs */}
        <div className="container mx-auto px-4 mb-10">
          <div className="flex gap-1 bg-white rounded-full p-1.5 max-w-md mx-auto shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)]">
            {(["communities", "events", "feed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all capitalize ${
                  activeTab === tab ? "bg-[#8B1E3F] text-white shadow" : "text-[#5E5754] hover:text-[#1A1818]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 pb-24" ref={listRef}>
          <AnimatePresence mode="wait">
            {/* ------------------------- Communities ------------------------- */}
            {activeTab === "communities" && (
              <motion.div key="communities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="max-w-3xl mx-auto mb-8 space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A827E]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search communities, cities, tags…"
                      className={`${inputCls} pl-10 !rounded-full !py-3 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]`}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A827E] hover:text-[#1A1818]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["All", ...COMMUNITY_TYPES].map((t) => (
                      <button key={t} onClick={() => setTypeFilter(t)} className={pill(typeFilter === t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredCommunities.length === 0 ? (
                  <div className="text-center py-16 text-[#5E5754]">
                    <p className="mb-4">No communities match your search.</p>
                    <Btn variant="outline" onClick={() => { setSearch(""); setTypeFilter("All"); }}>
                      Clear filters
                    </Btn>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense">
                    {filteredCommunities.map((c, i) => {
                      const large = c.featured === "large";
                      const trending = c.featured === "trending";
                      const extraTags = c.tags.filter(
                        (t) => t.toLowerCase() !== c.city.toLowerCase() && !["all india", "pan india"].includes(t.toLowerCase())
                      );
                      return (
                        <motion.article
                          key={c.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setDetailId(c.id)}
                          className={`flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer ${cardHover} ${
                            trending ? "ring-2 ring-[#D4AF37]/70 shadow-[0_8px_28px_-8px_rgba(212,175,55,0.45)]" : cardShadow
                          } ${large ? "lg:col-span-2 md:col-span-2" : ""}`}
                        >
                          <Cover src={c.cover} bg={c.banner} className={large ? "h-48" : "h-28"}>
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className="bg-white/90 backdrop-blur text-[#1A1818] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                {c.type}
                              </span>
                              {large && (
                                <span className="bg-[#D4AF37] text-[#1A1818] text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current" /> Featured
                                </span>
                              )}
                              {trending && (
                                <span className="bg-[#D4AF37] text-[#1A1818] text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> Trending
                                </span>
                              )}
                            </div>
                            <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#1A1818]" title={c.isPrivate ? "Private" : "Public"}>
                              {c.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                            </span>
                          </Cover>

                          <div className="relative px-5 pb-5 flex-1 flex flex-col">
                            <div className="-mt-5 flex items-start justify-between">
                              <LogoAvatar src={c.avatar} icon={c.icon} className={large ? "w-16 h-16 text-4xl -mt-3" : "w-12 h-12 text-2xl"} />
                              <Facepile seed={c.id} total={c.members} max={large ? 5 : 3} size={28} />
                            </div>

                            <h3 className={`mt-3 font-bold text-[#1A1818] flex items-center gap-1.5 ${large ? "cm-serif text-2xl" : "text-base"}`}>
                              {c.name}
                              {c.isVerified && <CheckCircle2 className="w-4 h-4 text-[#8B1E3F] shrink-0" aria-label="Verified" />}
                            </h3>
                            <p className={`text-sm text-[#5E5754] mt-1.5 leading-relaxed ${large ? "" : "line-clamp-2"}`}>{c.purpose}</p>

                            <div className="flex items-center gap-5 mt-4 text-sm">
                              <span className="flex items-baseline gap-1">
                                <b className="text-[#8B1E3F] text-lg font-extrabold leading-none">{c.members.toLocaleString("en-IN")}</b>
                                <span className="text-[#5E5754] text-xs">members</span>
                              </span>
                              <span className="flex items-baseline gap-1">
                                <b className="text-[#1A1818] text-lg font-extrabold leading-none">{c.posts.toLocaleString("en-IN")}</b>
                                <span className="text-[#5E5754] text-xs">posts</span>
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1818] bg-[#F5EFE6] px-2.5 py-1 rounded-full">
                                <MapPin className="w-3 h-3 text-[#8B1E3F]" /> {c.city}
                              </span>
                              {extraTags.length > 0 && <span className="w-px h-4 bg-[#E9E1D5]" />}
                              {extraTags.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={(e) => { e.stopPropagation(); setSearch(tag); }}
                                  className="text-xs text-[#5E5754] hover:text-[#8B1E3F] font-medium transition-colors"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>

                            <div className="mt-auto pt-5">
                              <Btn
                                size="sm"
                                variant={membershipVariant(c)}
                                onClick={(e) => { e.stopPropagation(); handleMembership(c); }}
                                className="w-full"
                              >
                                {membershipLabel(c)}
                              </Btn>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------------------------- Events ---------------------------- */}
            {activeTab === "events" && (
              <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-[#F5EFE6] rounded-2xl px-5 py-4 mb-8">
                  <EscrowBadge label="Verified Protection" />
                  <p className="text-sm text-[#3D3735] text-center sm:text-left">
                    Every paid booking is held in escrow before the event and released to the organizer in phases afterwards.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((ev, i) => {
                    const full = ev.filled >= ev.capacity;
                    const remaining = ev.capacity - ev.filled;
                    const booked = bookings[ev.id];
                    return (
                      <motion.article
                        key={ev.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`flex flex-col bg-white rounded-2xl overflow-hidden ${cardShadow} ${cardHover}`}
                      >
                        <Cover src={ev.image} bg={ev.banner} className="aspect-video" fallback={<span className="absolute inset-0 flex items-center justify-center text-7xl opacity-30 select-none">{ev.icon}</span>}>
                          
                          <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-1.5 text-center shadow-md min-w-[52px]">
                            <p className="text-[10px] font-bold tracking-wider text-[#8B1E3F] leading-none">{monthShort(ev.date)}</p>
                            <p className="text-2xl font-extrabold text-[#1A1818] leading-none mt-1">{dayNum(ev.date)}</p>
                          </div>
                          {full ? (
                            <span className="absolute top-3 right-3 bg-[#1A1818] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">Sold out</span>
                          ) : remaining <= 10 ? (
                            <span className="absolute top-3 right-3 bg-[#D4AF37] text-[#1A1818] text-[11px] font-bold px-2.5 py-1 rounded-full">Only {remaining} left</span>
                          ) : null}
                        </Cover>

                        <div className="p-5 pb-4 flex-1 flex flex-col">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B1E3F] mb-1.5">{ev.community}</p>
                          <h3 className="cm-serif font-bold text-lg leading-snug text-[#1A1818]">{ev.title}</h3>
                          <p className="text-sm text-[#5E5754] mt-1">by {ev.organizer}</p>

                          <div className="mt-4 space-y-1.5 text-sm text-[#3D3735]">
                            <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#8B1E3F] shrink-0" />{dateFull(ev.date)} · {ev.time}</p>
                            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#8B1E3F] shrink-0" />{ev.location}</p>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Facepile seed={ev.id} total={ev.filled} max={3} size={24} />
                              <span className="text-xs text-[#5E5754]"><b className="text-[#1A1818]">+{ev.filled}</b> attending</span>
                            </div>
                            <span className="text-xs font-semibold text-[#1A1818]">{ev.filled}/{ev.capacity}</span>
                          </div>
                          <div className="w-full bg-[#F5EFE6] rounded-full h-1.5 mt-2">
                            <div
                              className={`h-1.5 rounded-full transition-all ${full ? "bg-[#1A1818]" : "bg-[#8B1E3F]"}`}
                              style={{ width: `${Math.min(100, (ev.filled / ev.capacity) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* ticket perforation */}
                        <div className="relative">
                          <div className="border-t-2 border-dashed border-[#E9E1D5] mx-5" />
                          <span className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
                          <span className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
                        </div>

                        <div className="px-5 py-4 flex items-center justify-between gap-3">
                          <div className="flex flex-col gap-1.5">
                            {ev.price === 0 ? (
                              <span className="text-xl font-extrabold text-[#1F6B45] leading-none">Free</span>
                            ) : (
                              <span className="leading-none">
                                <b className="text-xl font-extrabold text-[#8B1E3F]">₹{ev.price.toLocaleString("en-IN")}</b>
                                <span className="text-xs text-[#5E5754]"> /person</span>
                              </span>
                            )}
                            {ev.price > 0 && <EscrowBadge />}
                          </div>

                          <div className="flex items-center gap-2">
                            {booked ? (
                              <>
                                <span className="text-xs font-semibold text-[#1F6B45] inline-flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> {booked} seat{booked > 1 ? "s" : ""}
                                </span>
                                <Btn size="sm" variant="ghost" onClick={() => cancelBooking(ev)}>Cancel</Btn>
                              </>
                            ) : full ? (
                              <Btn size="sm" variant={waitlist[ev.id] ? "ghost" : "outline"} onClick={() => openBooking(ev)}>
                                {waitlist[ev.id] ? "On waitlist ✓" : "Join Waitlist"}
                              </Btn>
                            ) : (
                              <Btn size="sm" onClick={() => openBooking(ev)}>
                                {ev.price === 0 ? "Register Free" : "Book Now"}
                              </Btn>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ----------------------------- Feed ----------------------------- */}
            {activeTab === "feed" && (
              <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 max-w-2xl mx-auto">
                {/* Composer */}
                <div className={`bg-white rounded-2xl p-5 ${cardShadow}`}>
                  <div className="flex gap-3">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg,#8B1E3F,#c2416a)" }}
                    >
                      YO
                    </span>
                    <textarea
                      value={composerText}
                      onFocus={() => setComposerOpen(true)}
                      onChange={(e) => setComposerText(e.target.value)}
                      rows={composerActive ? 3 : 1}
                      placeholder="Share an event update, ask for vendor recommendations, or show your work…"
                      className="flex-1 resize-none bg-[#FAF8F5] rounded-2xl px-4 py-2.5 text-sm text-[#1A1818] placeholder:text-[#8A827E] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/25"
                    />
                  </div>

                  {composerMedia && (
                    <div className="relative mt-3 ml-[52px]">
                      {composerMedia.type === "image" ? (
                        <img src={composerMedia.url} alt="Attachment preview" className="rounded-xl max-h-64 w-auto object-cover" />
                      ) : (
                        <video src={composerMedia.url} controls className="rounded-xl max-h-64 w-auto" />
                      )}
                      <button
                        onClick={removeMedia}
                        aria-label="Remove attachment"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1A1818]/75 text-white flex items-center justify-center hover:bg-[#1A1818]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {(composerEvent || composerLocation.trim()) && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-[52px]">
                      {composerEvent && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5EFE6] text-[#8B1E3F] px-3 py-1 rounded-full">
                          <Calendar className="w-3 h-3" /> {composerEvent}
                          <button onClick={() => setComposerEvent("")} aria-label="Remove event tag"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {composerLocation.trim() && !showLocation && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5EFE6] text-[#8B1E3F] px-3 py-1 rounded-full">
                          <MapPin className="w-3 h-3" /> {composerLocation.trim()}
                          <button onClick={() => setComposerLocation("")} aria-label="Remove location"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                    </div>
                  )}

                  {showEventPicker && (
                    <div className="mt-3 ml-[52px]">
                      <select
                        value={composerEvent}
                        onChange={(e) => { setComposerEvent(e.target.value); setShowEventPicker(false); }}
                        className={inputCls}
                      >
                        <option value="">Select an event to tag…</option>
                        {events.map((ev) => <option key={ev.id} value={ev.title}>{ev.title}</option>)}
                      </select>
                    </div>
                  )}

                  {showLocation && (
                    <div className="mt-3 ml-[52px]">
                      <input
                        autoFocus
                        value={composerLocation}
                        onChange={(e) => setComposerLocation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && setShowLocation(false)}
                        onBlur={() => setShowLocation(false)}
                        placeholder="Add a location, e.g. Udaipur, Rajasthan"
                        className={inputCls}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#F0E9DD]">
                    <div className="flex items-center gap-1">
                      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={onPickFile} />
                      <Btn size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
                        <ImageIcon className="w-4 h-4 text-[#8B1E3F]" /> Photo
                      </Btn>
                      <Btn size="sm" variant="ghost" onClick={() => { setShowEventPicker((v) => !v); setComposerOpen(true); }}>
                        <Tag className="w-4 h-4 text-[#8B1E3F]" /> Event Tag
                      </Btn>
                      <Btn size="sm" variant="ghost" onClick={() => { setShowLocation(true); setComposerOpen(true); }}>
                        <MapPin className="w-4 h-4 text-[#8B1E3F]" /> Location
                      </Btn>
                    </div>

                    <div className="flex items-center gap-2">
                      {joinedCommunities.length > 0 && (
                        <select
                          value={composerCommunity}
                          onChange={(e) => setComposerCommunity(e.target.value)}
                          className="text-xs font-semibold bg-white border border-[#E9E1D5] rounded-full px-3 py-2 text-[#1A1818] max-w-[190px] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/25"
                          aria-label="Post to community"
                        >
                          {joinedCommunities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      )}
                      {joinedCommunities.length === 0 ? (
                        <Btn size="sm" variant="outline" onClick={() => setActiveTab("communities")}>Join a community to post</Btn>
                      ) : (
                        <Btn size="sm" onClick={publishPost} disabled={!composerText.trim() && !composerMedia}>
                          <Send className="w-3.5 h-3.5" /> Post
                        </Btn>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  {([["all", "All posts"], ["mine", "My communities"]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setFeedFilter(k)} className={pill(feedFilter === k)}>{label}</button>
                  ))}
                </div>

                {visiblePosts.length === 0 && (
                  <p className="text-center text-[#5E5754] text-sm py-10">
                    No posts yet from your communities. Join one or write the first post!
                  </p>
                )}

                {visiblePosts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl p-6 ${cardShadow}`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: post.gradient }}
                      >
                        {post.avatar}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-[#1A1818]">{post.author}</p>
                        <p className="text-xs text-[#5E5754]">
                          <span className="font-semibold text-[#8B1E3F]">{post.community}</span> · {post.time}
                        </p>
                      </div>
                    </div>

                    {post.content && <p className="text-sm text-[#1A1818] leading-relaxed mb-4">{post.content}</p>}

                    {post.media && (
                      <div className="mb-4 -mx-1">
                        {post.media.type === "image" ? (
                          <img src={post.media.url} alt="Post attachment" className="rounded-xl w-full max-h-96 object-cover" />
                        ) : (
                          <video src={post.media.url} controls className="rounded-xl w-full max-h-96" />
                        )}
                      </div>
                    )}

                    {(post.event || post.location) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.event && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5EFE6] text-[#8B1E3F] px-3 py-1 rounded-full">
                            <Calendar className="w-3 h-3" /> {post.event}
                          </span>
                        )}
                        {post.location && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5EFE6] text-[#3D3735] px-3 py-1 rounded-full">
                            <MapPin className="w-3 h-3 text-[#8B1E3F]" /> {post.location}
                          </span>
                        )}
                      </div>
                    )}

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => { setActiveTab("communities"); setSearch(tag); }}
                            className="text-xs font-medium text-[#5E5754] hover:text-[#8B1E3F] transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-5 text-sm text-[#5E5754] pt-3 border-t border-[#F0E9DD]">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${liked[post.id] ? "text-[#8B1E3F]" : "hover:text-[#8B1E3F]"}`}
                      >
                        <Heart className={`w-4 h-4 ${liked[post.id] ? "fill-current" : ""}`} /> {post.likes}
                      </button>
                      <button
                        onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${openComments[post.id] ? "text-[#8B1E3F]" : "hover:text-[#8B1E3F]"}`}
                      >
                        <MessageSquare className="w-4 h-4" /> {post.commentCount}
                      </button>
                      <button onClick={() => sharePost(post)} className="ml-auto text-xs font-semibold hover:text-[#1A1818] transition-colors">
                        Share
                      </button>
                    </div>

                    <AnimatePresence>
                      {openComments[post.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-3">
                            {post.comments.length === 0 && <p className="text-xs text-[#5E5754]">Be the first to comment.</p>}
                            {post.comments.map((c, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-bold text-[#1A1818]">{c.author}</span>{" "}
                                <span className="text-[#4A4442]">{c.text}</span>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input
                                value={commentDrafts[post.id] || ""}
                                onChange={(e) => setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                                placeholder="Write a comment…"
                                className={inputCls}
                              />
                              <Btn size="sm" onClick={() => addComment(post.id)} disabled={!(commentDrafts[post.id] || "").trim()} aria-label="Send comment" className="!h-auto">
                                <Send className="w-3.5 h-3.5" />
                              </Btn>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create community modal */}
        <Modal open={createOpen} onClose={() => { setCreateOpen(false); setFormError(""); }} title="Create a Community">
          <form onSubmit={handleCreateCommunity} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Jaipur Decorators Circle" maxLength={60} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  {COMMUNITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#5E5754] mb-1 block">City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} placeholder="All India" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Purpose *</label>
              <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="What is this community about?" maxLength={200} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="Decor, Jaipur, Weddings" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer text-[#3D3735]">
              <input type="checkbox" className="accent-[#8B1E3F]" checked={form.isPrivate || form.type === "Private Planning Group"} disabled={form.type === "Private Planning Group"} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} />
              Make this community private (members join by request)
            </label>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={() => { setCreateOpen(false); setFormError(""); }}>Cancel</Btn>
              <Btn type="submit">Create</Btn>
            </div>
          </form>
        </Modal>

        {/* Community detail modal */}
        <Modal open={!!detailCommunity} onClose={() => setDetailId(null)} title={detailCommunity?.name ?? ""}>
          {detailCommunity && (
            <div className="space-y-4">
              <Cover src={detailCommunity.cover} bg={detailCommunity.banner} className="h-24 rounded-xl">
                <span className="absolute bottom-2 right-3">
                  <Facepile seed={detailCommunity.id} total={detailCommunity.members} max={4} size={28} />
                </span>
              </Cover>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold bg-[#F5EFE6] text-[#1A1818] px-2.5 py-1 rounded-full">{detailCommunity.type}</span>
                <span className="text-xs text-[#5E5754] flex items-center gap-1">
                  {detailCommunity.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {detailCommunity.isPrivate ? "Private" : "Public"}
                </span>
                <span className="text-xs text-[#5E5754] flex items-center gap-1"><MapPin className="w-3 h-3 text-[#8B1E3F]" />{detailCommunity.city}</span>
              </div>
              <p className="text-sm text-[#4A4442] leading-relaxed">{detailCommunity.purpose}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { n: detailCommunity.members.toLocaleString("en-IN"), l: "Members" },
                  { n: detailCommunity.posts.toLocaleString("en-IN"), l: "Posts" },
                  { n: detailCommunity.admin, l: "Admin" },
                ].map((s, idx) => (
                  <div key={s.l} className="bg-[#FAF8F5] rounded-xl py-3 px-2">
                    <p className={`font-extrabold leading-tight ${idx < 2 ? "text-lg text-[#8B1E3F]" : "text-xs text-[#1A1818]"}`}>{s.n}</p>
                    <p className="text-[11px] text-[#5E5754] mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {detailCommunity.tags.map((t) => <span key={t} className="text-xs font-medium text-[#5E5754]">#{t}</span>)}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Btn onClick={() => handleMembership(detailCommunity)}>
                  {membership[detailCommunity.id] === "joined" ? "Leave Community" : membership[detailCommunity.id] === "pending" ? "Cancel Request" : detailCommunity.isPrivate ? "Request to Join" : "Join Community"}
                </Btn>
                <Btn
                  variant="outline"
                  onClick={() => { setDetailId(null); setActiveTab("feed"); setFeedFilter("mine"); }}
                  disabled={membership[detailCommunity.id] !== "joined"}
                >
                  View Feed
                </Btn>
              </div>
            </div>
          )}
        </Modal>

        {/* Booking modal */}
        <Modal open={!!bookingEvent} onClose={() => setBookingEventId(null)} title="Confirm Booking">
          {bookingEvent && (() => {
            const remaining = bookingEvent.capacity - bookingEvent.filled;
            const maxSeats = Math.min(10, remaining);
            const total = seats * bookingEvent.price;
            return (
              <div className="space-y-4">
                <div>
                  <p className="cm-serif font-bold text-lg leading-snug">{bookingEvent.title}</p>
                  <p className="text-sm text-[#5E5754] mt-1">{dateFull(bookingEvent.date)} · {bookingEvent.time} · {bookingEvent.location}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Seats <span className="text-[#5E5754] font-normal">({remaining} left)</span></span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSeats((s) => Math.max(1, s - 1))} disabled={seats <= 1} aria-label="Fewer seats" className="w-8 h-8 rounded-full border border-[#E9E1D5] flex items-center justify-center hover:bg-[#F5EFE6] disabled:opacity-40">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold">{seats}</span>
                    <button onClick={() => setSeats((s) => Math.min(maxSeats, s + 1))} disabled={seats >= maxSeats} aria-label="More seats" className="w-8 h-8 rounded-full border border-[#E9E1D5] flex items-center justify-center hover:bg-[#F5EFE6] disabled:opacity-40">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[#F0E9DD] pt-3">
                  <span className="text-sm text-[#5E5754]">Total</span>
                  <span className="font-extrabold text-[#8B1E3F] text-2xl">
                    {total === 0 ? "Free" : `₹${total.toLocaleString("en-IN")}`}
                  </span>
                </div>
                {total > 0 && (
                  <div className="flex items-start gap-3 bg-[#E8F3EC] rounded-xl p-3">
                    <ShieldCheck className="w-5 h-5 text-[#1F6B45] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#1F6B45]">Verified Protection</p>
                      <p className="text-xs text-[#2F5A44] mt-0.5">Your payment is held in escrow and released to the organizer in phases after the event.</p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setBookingEventId(null)}>Cancel</Btn>
                  <Btn onClick={confirmBooking}>{total === 0 ? "Confirm Registration" : "Confirm & Pay"}</Btn>
                </div>
              </div>
            );
          })()}
        </Modal>

        {/* Toasts */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 items-center pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-[#1A1818] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg"
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <EveBuddy />
    </div>
  );
}