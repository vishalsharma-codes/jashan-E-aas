import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, Film, Plus, X, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
// >>> Use the same Supabase client your useAuth hook uses <<<
import { supabase } from "@/lib/chatClient";

/* ───────────── MATCH THESE TO YOUR DATABASE (the only part you may need to edit) ───────────── */
const TABLE = "reels";
const OWNER_COLUMN = "user_id";          // column that stores who uploaded the reel
/* Each reel row is read tolerantly, so common column names all work: */
const pickVideo = (r: any): string => r.video_url ?? r.videoUrl ?? r.url ?? r.video ?? "";
const pickThumb = (r: any): string => r.thumbnail_url ?? r.thumbnailUrl ?? r.thumbnail ?? r.poster ?? "";
const pickViews = (r: any): number => Number(r.views ?? r.view_count ?? r.views_count ?? r.viewCount ?? 0);
/* ──────────────────────────────────────────────────────────────────────────────────────────── */

interface Reel {
  id: string;
  video: string;
  thumb: string;
  caption: string;
  views: number;
}

const formatViews = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  : String(n);

export default function MyReels() {
  const auth = useAuth() as { user: any; loading?: boolean; isLoading?: boolean };
  const user = auth.user;
  const authLoading = auth.loading ?? auth.isLoading ?? false;
  const navigate = useNavigate();

  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState<Reel | null>(null);

  // Logged-out visitors: alert + login page
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to see your reels");
      navigate("/auth", { replace: true, state: { from: "/my-reels" } });
    }
  }, [authLoading, user, navigate]);

  // Load ONLY this user's reels
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq(OWNER_COLUMN, user.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("My Reels:", error);
        setError(true);
        setReels([]);
      } else {
        setReels(
          (data ?? []).map((r: any) => ({
            id: String(r.id),
            video: pickVideo(r),
            thumb: pickThumb(r),
            caption: r.caption ?? r.title ?? r.description ?? "",
            views: pickViews(r),
          }))
        );
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Full-screen player: Esc closes, page behind is locked
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPlaying(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [playing]);

  const totalViews = reels.reduce((n, r) => n + r.views, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/reels" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back to Jhalak
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-widest text-gold">Jhalak</p>
              <h1 className="font-serif text-3xl font-bold md:text-4xl">My Reels</h1>
              {!loading && reels.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {reels.length} reel{reels.length > 1 ? "s" : ""} · {formatViews(totalViews)} total views
                </p>
              )}
            </div>
            <Button asChild className="bg-gold text-background hover:bg-gold-dark">
              <Link to="/reels"><Plus className="mr-1.5 h-4 w-4" /> Upload a Reel</Link>
            </Button>
          </motion.div>

          {/* Loading skeleton: same 3-column grid */}
          {loading && (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[9/16] animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="font-medium">Couldn't load your reels.</p>
              <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}

          {!loading && !error && reels.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gold/30 p-12 text-center">
              <Film className="mx-auto mb-3 h-10 w-10 text-gold/60" />
              <p className="font-medium">You haven't uploaded any reels yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Share a moment from your event and it will show up here.</p>
              <Button asChild className="mt-5 bg-gold text-background hover:bg-gold-dark">
                <Link to="/reels">Upload your first reel</Link>
              </Button>
            </div>
          )}

          {/* ── The grid: 3 per row, thumbnails only (nothing autoplays) ── */}
          {!loading && !error && reels.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {reels.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setPlaying(r)}
                  aria-label={`Open reel${r.caption ? `: ${r.caption}` : ""}, ${r.views} views`}
                  className="group relative aspect-[9/16] overflow-hidden rounded-xl border border-border bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {r.thumb ? (
                    <img src={r.thumb} alt={r.caption || "Reel"} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : r.video ? (
                    /* No thumbnail saved: show the first frame of the video, paused, no controls */
                    <video
                      src={`${r.video}#t=0.1`}
                      preload="metadata"
                      muted
                      playsInline
                      tabIndex={-1}
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold/20 to-muted">
                      <Film className="h-8 w-8 text-gold/60" />
                    </div>
                  )}

                  {/* legibility gradient + view count, bottom-left */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-semibold text-white drop-shadow md:text-sm">
                    <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {formatViews(r.views)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Player: opens only when a tile is clicked */}
      {playing &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setPlaying(null)}>
            <div className="relative max-h-[90vh] w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setPlaying(null)}
                aria-label="Close"
                className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card text-foreground shadow-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
              <video
                src={playing.video}
                poster={playing.thumb || undefined}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] w-full rounded-2xl bg-black object-contain"
              />
              <div className="mt-3 flex items-start justify-between gap-3 text-sm">
                <p className="line-clamp-2 text-white/90">{playing.caption}</p>
                <span className="flex flex-shrink-0 items-center gap-1 text-white/80">
                  <Eye className="h-4 w-4" /> {formatViews(playing.views)}
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}

      <Footer />
      <EveBuddy />
    </div>
  );
}