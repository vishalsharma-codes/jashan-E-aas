import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Clapperboard,
  EyeOff,
  Flag,
  Link2,
  Loader2,
  MessageCircleHeart,
  MoreHorizontal,
  Music2,
  PartyPopper,
  Play,
  Send,
  Share2,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UploadReelModal } from "@/components/UploadReelModal";

// ============================================================
// TYPES & CONSTANTS
// ============================================================

interface ReelItem {
  id: string;
  userId: string;
  videoUrl: string;
  caption: string;
  authorName: string;
  authorInitials: string;
  isVendor: boolean;
  isMine: boolean;
  approved: boolean;
}

interface ReelComment {
  id: string;
  userId: string;
  user: string;
  text: string;
  time: string;
  gradient: string;
  mine: boolean;
}

interface SpotlightReelsProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

type SheetType = "comments" | "share" | "more" | null;

const FRAME_WIDTH = "min(100vw, calc(100dvh * 9 / 16))"; // 9:16 frame, like Instagram

const QUICK_EMOJIS = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];

const GRADIENTS = [
  "from-rose-600 to-pink-700",
  "from-blue-600 to-indigo-700",
  "from-emerald-600 to-teal-700",
  "from-amber-600 to-orange-700",
  "from-purple-600 to-fuchsia-700",
];

const gradientFor = (seed: string) => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
};

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "J";

const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
};

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString();
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ============================================================
// BOTTOM SHEET
// ============================================================

const Sheet = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        key="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-40 flex items-end justify-center bg-black/60"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[75%] w-full max-w-[480px] flex-col rounded-t-3xl bg-card text-foreground"
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/40" />
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================================
// COMMENTS SHEET
// ============================================================

const CommentsSheetContent = ({
  reel,
  comments,
  loading,
  userInitial,
  onPost,
  onDelete,
  onClose,
}: {
  reel: ReelItem;
  comments: ReelComment[];
  loading: boolean;
  userInitial: string;
  onPost: (text: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onPost(value);
    setText("");
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="w-6" />
        <h3 className="text-sm font-semibold">Comments</h3>
        <button type="button" onClick={onClose} aria-label="Close comments">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div data-lenis-prevent className="min-h-[120px] flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && comments.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No comments yet. Start the conversation.
          </p>
        )}

        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.gradient} text-xs font-bold text-white`}
            >
              {c.user[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-semibold">{c.user}</span>{" "}
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </p>
              <p className="break-words text-sm text-foreground/90">{c.text}</p>
              <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setText(`@${c.user} `);
                    inputRef.current?.focus();
                  }}
                  className="font-medium hover:text-foreground"
                >
                  Reply
                </button>
              </div>
            </div>
            {c.mine && (
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                aria-label="Delete comment"
                className="mt-1 flex-shrink-0 text-muted-foreground hover:text-[#ff3040]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="border-t border-border">
        <div className="flex justify-between px-4 pt-3 text-xl">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setText((t) => t + emoji);
                inputRef.current?.focus();
              }}
              className="transition-transform active:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-xs font-bold text-background">
            {userInitial}
          </div>
          <input
            ref={inputRef}
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={`Add a comment for ${reel.authorName}...`}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            className="text-sm font-semibold text-gold disabled:opacity-40"
          >
            Post
          </button>
        </div>
      </div>
    </>
  );
};

// ============================================================
// ONE JHALAK
// ============================================================

interface ReelSlideProps {
  reel: ReelItem;
  isActive: boolean;
  paused: boolean;
  muted: boolean;
  liked: boolean;
  saved: boolean;
  followed: boolean;
  likeCount: number;
  commentCount: number;
  registerRef: (el: HTMLDivElement | null) => void;
  index: number;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onLike: (forceOn?: boolean) => void;
  onSave: () => void;
  onFollow: () => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
  onOpenMore: () => void;
}

const RailButton = ({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="flex flex-col items-center gap-1 text-white transition-transform active:scale-90"
  >
    {children}
  </button>
);

// Little gold sparkles that fly out when a jhalak is liked
const LikeBurst = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return (
        <motion.span
          key={i}
          className="pointer-events-none absolute left-1/2 top-[11px] -ml-[3px] h-1.5 w-1.5 rounded-full bg-gold"
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos(angle) * 28,
            y: Math.sin(angle) * 28,
            scale: 0.3,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      );
    })}
  </>
);

const ReelSlide = ({
  reel,
  isActive,
  paused,
  muted,
  liked,
  saved,
  followed,
  likeCount,
  commentCount,
  registerRef,
  index,
  onTogglePause,
  onToggleMute,
  onLike,
  onSave,
  onFollow,
  onOpenComments,
  onOpenShare,
  onOpenMore,
}: ReelSlideProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const tapTimer = useRef<number | null>(null);
  const holdTimer = useRef<number | null>(null);
  const heldRef = useRef(false);

  const [holding, setHolding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hearts, setHearts] = useState<
    { id: number; x: number; y: number; rot: number }[]
  >([]);

  const playing = isActive && !paused && !holding;

  // play / pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing]);

  // leaving a jhalak: rewind and reset
  useEffect(() => {
    if (isActive) return;
    const video = videoRef.current;
    if (video) video.currentTime = 0;
    if (barRef.current) barRef.current.style.width = "0%";
    setExpanded(false);
  }, [isActive]);

  // clear timers on unmount
  useEffect(
    () => () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    []
  );

  const addHeart = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    setHearts((h) => [...h, { id, x, y, rot: Math.random() * 40 - 20 }]);
    window.setTimeout(() => setHearts((h) => h.filter((i) => i.id !== id)), 900);
  };

  // press and hold = pause while held
  const handlePointerDown = () => {
    heldRef.current = false;
    holdTimer.current = window.setTimeout(() => {
      heldRef.current = true;
      setHolding(true);
    }, 250);
  };

  const endHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (heldRef.current) setHolding(false);
  };

  // single tap = play/pause, double tap = like
  const handleClick = (e: React.MouseEvent) => {
    if (heldRef.current) {
      heldRef.current = false;
      return;
    }

    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
      const rect = frameRef.current?.getBoundingClientRect();
      if (rect) addHeart(e.clientX - rect.left, e.clientY - rect.top);
      onLike(true);
      return;
    }

    tapTimer.current = window.setTimeout(() => {
      tapTimer.current = null;
      onTogglePause();
    }, 250);
  };

  return (
    <div
      ref={registerRef}
      data-index={index}
      className="flex h-full w-full snap-start snap-always items-center justify-center"
    >
      <div
        ref={frameRef}
        className="relative h-full select-none overflow-hidden bg-black sm:rounded-2xl"
        style={{ width: FRAME_WIDTH }}
      >
        {/* VIDEO */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          playsInline
          muted={muted}
          preload="metadata"
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (barRef.current && v.duration) {
              barRef.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
            }
          }}
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* READABILITY GRADIENTS */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/75 to-transparent" />

        {/* GESTURE LAYER: tap, double-tap, hold */}
        <div
          className="absolute inset-0 z-10"
          onPointerDown={handlePointerDown}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onClick={handleClick}
        />

        {/* PENDING NOTICE (only the uploader sees their own pending jhalak) */}
        {!reel.approved && (
          <div className="pointer-events-none absolute left-3 top-16 z-20 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            Waiting for approval. Only you can see this.
          </div>
        )}

        {/* PAUSED ICON */}
        <AnimatePresence>
          {paused && isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/45">
                <Play className="ml-1 h-8 w-8 text-white" fill="white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DOUBLE-TAP CELEBRATION */}
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, scale: 0.3, y: 0, rotate: h.rot }}
            animate={{ opacity: [1, 1, 0], scale: [0.3, 1.3, 1.1], y: -60 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            style={{ left: h.x - 48, top: h.y - 48 }}
            className="pointer-events-none absolute z-20"
          >
            <PartyPopper className="h-24 w-24 text-gold drop-shadow-xl" />
          </motion.div>
        ))}

        {/* MUTE / UNMUTE */}
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute right-3 top-16 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* RIGHT ACTION RAIL */}
        <div className="absolute bottom-20 right-3 z-20 flex flex-col items-center gap-5">
          {/* Like */}
          <RailButton onClick={() => onLike()} label={liked ? "Unlike" : "Like"}>
            <motion.div
              key={liked ? "liked" : "not-liked"}
              className="relative"
              initial={liked ? { scale: 0.6, rotate: -15 } : false}
              animate={
                liked
                  ? { scale: [0.6, 1.4, 1], rotate: [-15, 10, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <PartyPopper
                className={`h-7 w-7 ${liked ? "text-gold" : "text-white"}`}
              />
              {liked && <LikeBurst />}
            </motion.div>
            <span className={`text-xs font-medium ${liked ? "text-gold" : ""}`}>
              {formatCount(likeCount)}
            </span>
          </RailButton>

          {/* Comment */}
          <RailButton onClick={onOpenComments} label="Comments">
            <motion.div whileTap={{ rotate: -14, scale: 0.9 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
              <MessageCircleHeart className="h-7 w-7" />
            </motion.div>
            <span className="text-xs font-medium">{formatCount(commentCount)}</span>
          </RailButton>

          {/* Share */}
          <RailButton onClick={onOpenShare} label="Share">
            <motion.div whileTap={{ x: 5, y: -5 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
              <Send className="h-7 w-7" />
            </motion.div>
          </RailButton>

          {/* Save */}
          <RailButton onClick={onSave} label={saved ? "Unsave" : "Save"}>
            <motion.div
              key={saved ? "saved" : "not-saved"}
              animate={saved ? { y: [0, -9, 3, 0] } : { y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Bookmark
                className={`h-7 w-7 ${saved ? "fill-gold text-gold" : "text-white"}`}
              />
            </motion.div>
            <span className={`text-xs font-medium ${saved ? "text-gold" : ""}`}>
              {saved ? "Saved" : "Save"}
            </span>
          </RailButton>

          <RailButton onClick={onOpenMore} label="More options">
            <MoreHorizontal className="h-7 w-7" />
          </RailButton>
        </div>

        {/* BOTTOM INFO */}
        <div className="absolute bottom-5 left-4 right-16 z-20 text-white">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="rounded-full bg-gradient-to-tr from-gold via-pink-500 to-purple-500 p-[2px]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-gradient-to-br from-gold to-gold-dark text-xs font-bold text-background">
                {reel.authorInitials}
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-sm font-semibold">
              {reel.authorName}
              {reel.isVendor && (
                <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-medium">
                  Vendor
                </span>
              )}
            </span>

            {!reel.isMine && (
              <button
                type="button"
                onClick={onFollow}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                  followed
                    ? "border-transparent bg-white/20"
                    : "border-white/80 hover:bg-white/10"
                }`}
              >
                {followed ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {reel.caption && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="block w-full text-left"
            >
              <p className={`text-sm ${expanded ? "" : "line-clamp-2"}`}>{reel.caption}</p>
            </button>
          )}

          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/90">
            <Music2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{reel.authorName} · Original audio</span>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/25">
          <div ref={barRef} className="h-full w-0 bg-white" />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// JHALAK PAGE
// ============================================================

export const SpotlightReels = ({
  isOpen,
  onClose,
  initialIndex = 0,
}: SpotlightReelsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orderRef = useRef<string[] | null>(null); // random order for this open
  const scrolledRef = useRef(false);

  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true); // starts muted, like Instagram
  const [sheet, setSheet] = useState<SheetType>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  // saved and followed are kept on this device only for now
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const [comments, setComments] = useState<ReelComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const currentReel: ReelItem | undefined = reels[activeIndex];
  const currentId = currentReel?.id;

  const myName =
    (user?.user_metadata?.name as string | undefined) ||
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "you";

  const requireLogin = useCallback((): boolean => {
    if (user) return true;
    toast({ title: "Please sign in", description: "Log in to like, comment or upload." });
    navigate("/auth");
    return false;
  }, [user, toast, navigate]);

  // ---- load reels, like counts and comment counts ----
  const loadReels = useCallback(async (randomize = true) => {
    const { data, error } = await supabase
      .from("reels")
      .select("id, user_id, video_path, caption, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast({ title: "Could not load jhalaks", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // fetch author names separately
    const userIds = Array.from(new Set((data ?? []).map((r: any) => r.user_id)));
    const { data: profileRows } = userIds.length
      ? await supabase.from("profiles").select("id, display_name, role").in("id", userIds)
      : { data: [] as any[] };
    const profileMap = new Map<string, any>((profileRows ?? []).map((p: any) => [p.id, p]));

    const items: ReelItem[] = (data ?? []).map((r: any) => {
      const profile = profileMap.get(r.user_id);
      const name: string = profile?.display_name || "Jashan-E-Aas user";
      return {
        id: r.id,
        userId: r.user_id,
        videoUrl: supabase.storage.from("reels").getPublicUrl(r.video_path).data.publicUrl,
        caption: r.caption ?? "",
        authorName: name,
        authorInitials: initialsOf(name),
        isVendor: profile?.role === "vendor",
        isMine: !!user && r.user_id === user.id,
        approved: r.status === "approved",
      };
    });
        let ordered = items;
    if (randomize) {
      if (!orderRef.current) {
        // first load after opening: pick a fresh random order
        orderRef.current = shuffle(items.map((i) => i.id));
      }
      const pos = new Map(orderRef.current.map((id, idx) => [id, idx]));
      // any reel not in the saved order goes to the front
      ordered = [...items].sort(
        (a, b) => (pos.get(a.id) ?? -1) - (pos.get(b.id) ?? -1)
      );
    }
    setReels(ordered);

    const ids = ordered.map((i) => i.id);

    // const ids = items.map((i) => i.id);
    if (ids.length) {
      const [likesRes, commentsRes] = await Promise.all([
        supabase.from("likes").select("reel_id, user_id").in("reel_id", ids),
        supabase.from("comments").select("reel_id").in("reel_id", ids),
      ]);

      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      (likesRes.data ?? []).forEach((l: any) => {
        counts[l.reel_id] = (counts[l.reel_id] ?? 0) + 1;
        if (user && l.user_id === user.id) mine.add(l.reel_id);
      });
      setLikeCounts(counts);
      setLiked(mine);

      const cCounts: Record<string, number> = {};
      (commentsRes.data ?? []).forEach((c: any) => {
        cCounts[c.reel_id] = (cCounts[c.reel_id] ?? 0) + 1;
      });
      setCommentCounts(cCounts);
    }

    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (isOpen) loadReels();
  }, [isOpen, loadReels]);

  // ---- open / close housekeeping ----
  useEffect(() => {
        if (!isOpen) {
      scrolledRef.current = false;
      orderRef.current = null; // next open gets a new random order
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setPaused(false);
    setSheet(null);
    setActiveIndex(initialIndex);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, initialIndex]);

  // scroll to the requested jhalak once the list has loaded
  useEffect(() => {
    if (!isOpen || !reels.length || scrolledRef.current) return;
    scrolledRef.current = true;
    const target = Math.min(initialIndex, reels.length - 1);
    const frame = requestAnimationFrame(() => {
      slideRefs.current[target]?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, reels.length, initialIndex]);

  // ---- which jhalak is on screen decides which one plays ----
  useEffect(() => {
    if (!isOpen) return;
    const root = scrollerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number((entry.target as HTMLElement).dataset.index));
          }
        });
      },
      { root, threshold: 0.6 }
    );

    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isOpen, reels.length]);

  // a new jhalak always starts playing
  useEffect(() => {
    setPaused(false);
  }, [activeIndex]);

  // ---- load comments when the sheet opens ----
  useEffect(() => {
    if (sheet !== "comments" || !currentId) return;
    let cancelled = false;
    setCommentsLoading(true);
    setComments([]);

    (async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id")
        .eq("reel_id", currentId)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        toast({ title: "Could not load comments", description: error.message, variant: "destructive" });
        setCommentsLoading(false);
        return;
      }

      const userIds = Array.from(new Set((data ?? []).map((c: any) => c.user_id)));
      const { data: profileRows } = userIds.length
        ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
        : { data: [] as any[] };
      const names = new Map<string, string>(
        (profileRows ?? []).map((p: any) => [p.id, p.display_name])
      );
      if (cancelled) return;

      setComments(
        (data ?? []).map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          user: names.get(c.user_id) || "Jashan-E-Aas user",
          text: c.body,
          time: timeAgo(c.created_at),
          gradient: gradientFor(c.user_id),
          mine: !!user && c.user_id === user.id,
        }))
      );
      setCommentsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [sheet, currentId, user, toast]);

  // ---- actions ----
  const goTo = useCallback(
    (delta: number) => {
      const next = Math.min(Math.max(activeIndex + delta, 0), reels.length - 1);
      slideRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [activeIndex, reels.length]
  );

  const setLikeState = (id: string, on: boolean) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    setLikeCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + (on ? 1 : -1)) }));
  };

  const toggleLike = useCallback(
    async (id: string, forceOn = false) => {
      if (!requireLogin() || !user) return;
      const isLiked = liked.has(id);
      if (forceOn && isLiked) return; // double-tap never un-likes

      setLikeState(id, !isLiked); // update the screen right away

      const { error } = isLiked
        ? await supabase.from("likes").delete().eq("reel_id", id).eq("user_id", user.id)
        : await supabase.from("likes").insert({ reel_id: id, user_id: user.id });

      if (error) {
        setLikeState(id, isLiked); // put it back
        toast({ title: "Could not update your like", description: error.message, variant: "destructive" });
      }
    },
    [liked, user, requireLogin, toast]
  );

  const toggleInSet = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string
  ) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied", description: "Share it with your friends" });
    } catch {
      toast({ title: "Couldn't copy the link" });
    }
    setSheet(null);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: currentReel?.caption || "Jhalak on Jashan-E-Aas",
        url: window.location.href,
      });
    } catch {
      /* cancelled or unsupported */
    }
    setSheet(null);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `${currentReel?.caption || "Jhalak on Jashan-E-Aas"} ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
    setSheet(null);
  };

  const postComment = async (text: string) => {
    if (!currentReel || !requireLogin() || !user) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({ reel_id: currentReel.id, user_id: user.id, body: text })
      .select("id, body, created_at")
      .single();

    if (error || !data) {
      toast({ title: "Could not post your comment", description: error?.message, variant: "destructive" });
      return;
    }

    setComments((prev) => [
      {
        id: data.id,
        userId: user.id,
        user: myName,
        text: data.body,
        time: "now",
        gradient: gradientFor(user.id),
        mine: true,
      },
      ...prev,
    ]);
    setCommentCounts((c) => ({ ...c, [currentReel.id]: (c[currentReel.id] ?? 0) + 1 }));
  };

  const deleteComment = async (id: string) => {
    if (!currentReel) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete the comment", description: error.message, variant: "destructive" });
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== id));
    setCommentCounts((c) => ({ ...c, [currentReel.id]: Math.max(0, (c[currentReel.id] ?? 1) - 1) }));
  };

    const handleUploaded = async () => {
    orderRef.current = null;
    await loadReels(false); // newest first, so the new upload is on top
    scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- keyboard ----
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        if (uploadOpen) setUploadOpen(false);
        else if (sheet) setSheet(null);
        else onClose();
        return;
      }
      if (sheet || uploadOpen || !currentId) return;

      if (e.key === "ArrowDown" || e.key === "j") goTo(1);
      else if (e.key === "ArrowUp" || e.key === "k") goTo(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "m") setMuted((m) => !m);
      else if (e.key === "l") toggleLike(currentId);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, sheet, uploadOpen, goTo, onClose, toggleLike, currentId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-lenis-prevent
          role="dialog"
          aria-label="Jhalak"
          className="fixed inset-0 z-50 bg-black"
        >
          {/* FEED */}
          <div
            ref={scrollerRef}
            data-lenis-prevent
            className="h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reels.map((reel, i) => (
              <ReelSlide
                key={reel.id}
                index={i}
                reel={reel}
                registerRef={(el) => {
                  slideRefs.current[i] = el;
                }}
                isActive={i === activeIndex}
                paused={paused}
                muted={muted}
                liked={liked.has(reel.id)}
                saved={saved.has(reel.id)}
                followed={followed.has(reel.userId)}
                likeCount={likeCounts[reel.id] ?? 0}
                commentCount={commentCounts[reel.id] ?? 0}
                onTogglePause={() => setPaused((p) => !p)}
                onToggleMute={() => setMuted((m) => !m)}
                onLike={(forceOn) => toggleLike(reel.id, forceOn)}
                onSave={() => {
                  toggleInSet(setSaved, reel.id);
                  toast({ title: saved.has(reel.id) ? "Removed from saved" : "Saved" });
                }}
                onFollow={() => toggleInSet(setFollowed, reel.userId)}
                onOpenComments={() => setSheet("comments")}
                onOpenShare={() => setSheet("share")}
                onOpenMore={() => setSheet("more")}
              />
            ))}
          </div>

          {/* LOADING / EMPTY STATES */}
          {loading && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/80" />
            </div>
          )}

          {!loading && reels.length === 0 && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-8 text-center text-white">
              <Clapperboard className="h-12 w-12 text-gold" />
              <h3 className="text-lg font-semibold">No jhalaks yet</h3>
              <p className="max-w-xs text-sm text-white/70">
                Share a short video of your event or work. It shows up here once it is approved.
              </p>
              <button
                type="button"
                onClick={() => (user ? setUploadOpen(true) : requireLogin())}
                className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-background"
              >
                Upload the first jhalak
              </button>
            </div>
          )}

          {/* TOP BAR */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 z-30 flex -translate-x-1/2 items-center justify-between px-4 py-4"
            style={{ width: FRAME_WIDTH }}
          >
            <h2 className="text-xl font-bold text-white drop-shadow">Jhalak</h2>
            <div className="pointer-events-auto flex items-center gap-4 text-white">
              <button
                type="button"
                aria-label="Upload a jhalak"
                onClick={() => (user ? setUploadOpen(true) : requireLogin())}
              >
                <Clapperboard className="h-6 w-6 drop-shadow" />
              </button>
              <button type="button" onClick={onClose} aria-label="Close Jhalak">
                <X className="h-6 w-6 drop-shadow" />
              </button>
            </div>
          </div>

          {/* COMMENTS */}
          <Sheet open={sheet === "comments" && !!currentReel} onClose={() => setSheet(null)}>
            {currentReel && (
              <CommentsSheetContent
                reel={currentReel}
                comments={comments}
                loading={commentsLoading}
                userInitial={initialsOf(myName)[0]}
                onPost={postComment}
                onDelete={deleteComment}
                onClose={() => setSheet(null)}
              />
            )}
          </Sheet>

          {/* SHARE */}
          <Sheet open={sheet === "share"} onClose={() => setSheet(null)}>
            <h3 className="py-3 text-center text-sm font-semibold">Share</h3>
            <div className="grid grid-cols-3 gap-4 px-6 pb-8 pt-2 text-center text-xs">
              {[
                { label: "Copy link", icon: <Link2 className="h-6 w-6" />, action: copyLink },
                { label: "WhatsApp", icon: <Send className="h-6 w-6" />, action: shareWhatsApp },
                { label: "Share to...", icon: <Share2 className="h-6 w-6" />, action: nativeShare },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </Sheet>

          {/* MORE OPTIONS */}
          <Sheet open={sheet === "more"} onClose={() => setSheet(null)}>
            <div className="divide-y divide-border pb-4 pt-2 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  toast({ title: "Thanks for letting us know", description: "We'll review this jhalak." });
                  setSheet(null);
                }}
                className="flex w-full items-center justify-center gap-2 py-4 font-semibold text-[#ff3040]"
              >
                <Flag className="h-4 w-4" /> Report
              </button>
              <button
                type="button"
                onClick={() => {
                  toast({ title: "We'll show fewer jhalaks like this" });
                  setSheet(null);
                }}
                className="flex w-full items-center justify-center gap-2 py-4"
              >
                <EyeOff className="h-4 w-4" /> Not interested
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center justify-center gap-2 py-4"
              >
                <Link2 className="h-4 w-4" /> Copy link
              </button>
              <button type="button" onClick={() => setSheet(null)} className="w-full py-4">
                Cancel
              </button>
            </div>
          </Sheet>

          {/* UPLOAD */}
          <UploadReelModal
            open={uploadOpen}
            onClose={() => setUploadOpen(false)}
            onUploaded={handleUploaded}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
