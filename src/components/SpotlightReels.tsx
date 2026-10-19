import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Camera,
  EyeOff,
  Flag,
  Heart,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Play,
  Send,
  Share2,
  Verified,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dummyReels, type DummyReel } from "@/lib/vendorData";

// ============================================================
// TYPES & CONSTANTS
// ============================================================

// If a reel has a `videoUrl`, a real <video> plays. Otherwise the
// gradient + emoji "video" is shown with a simulated timeline.
type ReelItem = DummyReel & { videoUrl?: string };

interface ReelComment {
  id: string;
  user: string;
  text: string;
  time: string;
  likes: number;
  gradient: string;
  mine?: boolean;
}

interface SpotlightReelsProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

type SheetType = "comments" | "share" | "more" | null;

const FAKE_DURATION_MS = 15000; // simulated reel length when there is no video file
const FRAME_WIDTH = "min(100vw, calc(100dvh * 9 / 16))"; // 9:16 frame, like Instagram

const SEED_COMMENTS: ReelComment[] = [
  { id: "c1", user: "priya_s", text: "This is absolutely stunning! 😍 Bookmarking for my wedding!", time: "2h", likes: 48, gradient: "from-rose-600 to-pink-700" },
  { id: "c2", user: "rahul.m", text: "Wow the décor is unreal. How much did this cost roughly?", time: "5h", likes: 12, gradient: "from-blue-600 to-indigo-700" },
  { id: "c3", user: "ananya_k", text: "Attended this event! Every detail was perfect 🙌", time: "1d", likes: 31, gradient: "from-emerald-600 to-teal-700" },
  { id: "c4", user: "vikram.events", text: "Goals 🔥🔥", time: "2d", likes: 7, gradient: "from-amber-600 to-orange-700" },
];

const QUICK_EMOJIS = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString();
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
  likedComments,
  onToggleCommentLike,
  onPost,
  onClose,
}: {
  reel: ReelItem;
  comments: ReelComment[];
  likedComments: Set<string>;
  onToggleCommentLike: (id: string) => void;
  onPost: (text: string) => void;
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

      <div data-lenis-prevent className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {comments.map((c) => {
          const liked = likedComments.has(c.id);
          return (
            <div key={c.id} className="flex gap-3">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.gradient} text-xs font-bold text-white`}
              >
                {c.user[0].toUpperCase()}
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
                  {c.likes + (liked ? 1 : 0) > 0 && (
                    <span>{c.likes + (liked ? 1 : 0)} likes</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleCommentLike(c.id)}
                aria-label="Like comment"
                className="mt-1 flex-shrink-0"
              >
                <Heart
                  className={`h-4 w-4 ${
                    liked ? "fill-[#ff3040] text-[#ff3040]" : "text-muted-foreground"
                  }`}
                />
              </button>
            </div>
          );
        })}
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
            Y
          </div>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={`Add a comment for ${reel.vendorName}...`}
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
// ONE REEL
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
  const elapsedRef = useRef(0);

  const tapTimer = useRef<number | null>(null);
  const holdTimer = useRef<number | null>(null);
  const heldRef = useRef(false);

  const [holding, setHolding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hearts, setHearts] = useState<
    { id: number; x: number; y: number; rot: number }[]
  >([]);

  const playing = isActive && !paused && !holding;

  // Real video: play / pause / reset
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing]);

  // Leaving a reel: rewind and reset
  useEffect(() => {
    if (isActive) return;
    const video = videoRef.current;
    if (video) video.currentTime = 0;
    elapsedRef.current = 0;
    if (barRef.current) barRef.current.style.width = "0%";
    setExpanded(false);
  }, [isActive]);

  // Simulated timeline when there is no video file
  useEffect(() => {
    if (reel.videoUrl || !playing) return;

    let frame = 0;
    let last = 0;

    const tick = (time: number) => {
      if (last) {
        elapsedRef.current =
          (elapsedRef.current + (time - last)) % FAKE_DURATION_MS;
      }
      last = time;
      if (barRef.current) {
        barRef.current.style.width = `${(elapsedRef.current / FAKE_DURATION_MS) * 100}%`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, reel.videoUrl]);

  // Clear timers on unmount
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

  // Press and hold = pause while held
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

  // Single tap = play/pause, double tap = like
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
        {/* MEDIA */}
        {reel.videoUrl ? (
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
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${reel.gradient}`}
          >
            <motion.div
              animate={playing ? { scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] } : { scale: 1, rotate: 0 }}
              transition={playing ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
              className="text-[8rem] leading-none drop-shadow-2xl"
            >
              {reel.emoji}
            </motion.div>
          </div>
        )}

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

        {/* DOUBLE-TAP HEARTS */}
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, scale: 0.3, y: 0, rotate: h.rot }}
            animate={{ opacity: [1, 1, 0], scale: [0.3, 1.3, 1.1], y: -60 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            style={{ left: h.x - 48, top: h.y - 48 }}
            className="pointer-events-none absolute z-20"
          >
            <Heart className="h-24 w-24 fill-white text-white drop-shadow-xl" />
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
          <RailButton onClick={() => onLike()} label="Like">
            <motion.div
              key={liked ? "liked" : "not-liked"}
              initial={{ scale: liked ? 0.6 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
            >
              <Heart
                className={`h-7 w-7 ${
                  liked ? "fill-[#ff3040] text-[#ff3040]" : "text-white"
                }`}
              />
            </motion.div>
            <span className="text-xs font-medium">{formatCount(likeCount)}</span>
          </RailButton>

          <RailButton onClick={onOpenComments} label="Comments">
            <MessageCircle className="h-7 w-7 -scale-x-100" />
            <span className="text-xs font-medium">{formatCount(commentCount)}</span>
          </RailButton>

          <RailButton onClick={onOpenShare} label="Share">
            <Send className="h-7 w-7" />
          </RailButton>

          <RailButton onClick={onSave} label={saved ? "Unsave" : "Save"}>
            <Bookmark className={`h-7 w-7 ${saved ? "fill-white" : ""}`} />
          </RailButton>

          <RailButton onClick={onOpenMore} label="More options">
            <MoreHorizontal className="h-7 w-7" />
          </RailButton>

          {/* Audio disc */}
          <div
            className={`mt-1 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br ${reel.gradient} text-base`}
          >
            {reel.emoji}
          </div>
        </div>

        {/* BOTTOM INFO */}
        <div className="absolute bottom-5 left-4 right-16 z-20 text-white">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="rounded-full bg-gradient-to-tr from-gold via-pink-500 to-purple-500 p-[2px]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-gradient-to-br from-gold to-gold-dark text-xs font-bold text-background">
                {reel.vendorInitials}
              </div>
            </div>

            <span className="flex items-center gap-1 text-sm font-semibold">
              {reel.vendorName}
              {reel.isVerified && (
                <Verified className="h-3.5 w-3.5 text-sky-400" fill="currentColor" />
              )}
            </span>

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
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="block w-full text-left"
          >
            <p className={`text-sm ${expanded ? "" : "line-clamp-1"}`}>
              <span className="font-semibold">{reel.title}</span>{" "}
              <span className="text-white/90">{reel.description}</span>{" "}
              <span className="text-white/70">
                #{reel.eventType.replace(/\s+/g, "")}
              </span>
            </p>
          </button>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/90">
            <Music2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{reel.vendorName} · Original audio</span>
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
// REELS PAGE
// ============================================================

export const SpotlightReels = ({
  isOpen,
  onClose,
  initialIndex = 0,
}: SpotlightReelsProps) => {
  const reels = dummyReels as ReelItem[];
  const { toast } = useToast();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true); // starts muted, like Instagram
  const [sheet, setSheet] = useState<SheetType>(null);

  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    Object.fromEntries(reels.map((r) => [r.id, r.likes]))
  );
  const [extraComments, setExtraComments] = useState<Record<string, ReelComment[]>>({});

  const currentReel = reels[activeIndex];

  // ---- open / close housekeeping ----
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setPaused(false);
    setSheet(null);
    setActiveIndex(initialIndex);

    const frame = requestAnimationFrame(() => {
      slideRefs.current[initialIndex]?.scrollIntoView({ block: "start" });
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
    };
  }, [isOpen, initialIndex]);

  // ---- which reel is on screen decides which one plays ----
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

  // a new reel always starts playing
  useEffect(() => {
    setPaused(false);
  }, [activeIndex]);

  // ---- actions ----
  const goTo = useCallback(
    (delta: number) => {
      const next = Math.min(Math.max(activeIndex + delta, 0), reels.length - 1);
      slideRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [activeIndex, reels.length]
  );

  const toggleLike = useCallback(
    (id: string, forceOn = false) => {
      const isLiked = liked.has(id);
      if (forceOn && isLiked) return; // double-tap never un-likes
      setLiked((prev) => {
        const next = new Set(prev);
        if (isLiked) next.delete(id);
        else next.add(id);
        return next;
      });
      setLikeCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + (isLiked ? -1 : 1) }));
    },
    [liked]
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
      await navigator.share({ title: currentReel.title, url: window.location.href });
    } catch {
      /* cancelled or unsupported */
    }
    setSheet(null);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${currentReel.title} ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
    setSheet(null);
  };

  const postComment = (text: string) => {
    const comment: ReelComment = {
      id: `me-${Date.now()}`,
      user: "you",
      text,
      time: "now",
      likes: 0,
      gradient: "from-gold to-gold-dark",
      mine: true,
    };
    setExtraComments((prev) => ({
      ...prev,
      [currentReel.id]: [comment, ...(prev[currentReel.id] ?? [])],
    }));
  };

  // ---- keyboard ----
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === "Escape") {
        if (sheet) setSheet(null);
        else onClose();
        return;
      }
      if (sheet) return;

      if (e.key === "ArrowDown" || e.key === "j") goTo(1);
      else if (e.key === "ArrowUp" || e.key === "k") goTo(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "m") setMuted((m) => !m);
      else if (e.key === "l") toggleLike(currentReel.id);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, sheet, goTo, onClose, toggleLike, currentReel]);

  const commentsFor = (id: string) => [...(extraComments[id] ?? []), ...SEED_COMMENTS];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-lenis-prevent
          role="dialog"
          aria-label="Reels"
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
                followed={followed.has(reel.vendorName)}
                likeCount={likeCounts[reel.id] ?? 0}
                commentCount={reel.comments + (extraComments[reel.id]?.length ?? 0)}
                onTogglePause={() => setPaused((p) => !p)}
                onToggleMute={() => setMuted((m) => !m)}
                onLike={(forceOn) => toggleLike(reel.id, forceOn)}
                onSave={() => {
                  toggleInSet(setSaved, reel.id);
                  toast({ title: saved.has(reel.id) ? "Removed from saved" : "Saved" });
                }}
                onFollow={() => toggleInSet(setFollowed, reel.vendorName)}
                onOpenComments={() => setSheet("comments")}
                onOpenShare={() => setSheet("share")}
                onOpenMore={() => setSheet("more")}
              />
            ))}
          </div>

          {/* TOP BAR */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 z-30 flex -translate-x-1/2 items-center justify-between px-4 py-4"
            style={{ width: FRAME_WIDTH }}
          >
            <h2 className="text-xl font-bold text-white drop-shadow">Reels</h2>
            <div className="pointer-events-auto flex items-center gap-4 text-white">
              <Camera className="h-6 w-6 drop-shadow" />
              <button type="button" onClick={onClose} aria-label="Close reels">
                <X className="h-6 w-6 drop-shadow" />
              </button>
            </div>
          </div>

          {/* COMMENTS */}
          <Sheet open={sheet === "comments"} onClose={() => setSheet(null)}>
            <CommentsSheetContent
              reel={currentReel}
              comments={commentsFor(currentReel.id)}
              likedComments={likedComments}
              onToggleCommentLike={(id) => toggleInSet(setLikedComments, id)}
              onPost={postComment}
              onClose={() => setSheet(null)}
            />
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
                  toast({ title: "Thanks for letting us know", description: "We'll review this reel." });
                  setSheet(null);
                }}
                className="flex w-full items-center justify-center gap-2 py-4 font-semibold text-[#ff3040]"
              >
                <Flag className="h-4 w-4" /> Report
              </button>
              <button
                type="button"
                onClick={() => {
                  toast({ title: "We'll show fewer reels like this" });
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
