import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, X, ChevronUp, ChevronDown, Verified, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { dummyReels, type DummyReel } from "@/lib/vendorData";

interface SpotlightReelsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpotlightReels = ({ isOpen, onClose }: SpotlightReelsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    Object.fromEntries(dummyReels.map((r) => [r.id, r.likes]))
  );
  const { toast } = useToast();

  const reels = dummyReels;
  const currentReel: DummyReel = reels[currentIndex];

  const scrollToReel = useCallback((index: number) => {
    if (index >= 0 && index < reels.length) {
      setCurrentIndex(index);
      setShowComments(false);
    }
  }, [reels.length]);

  const handleLike = (reelId: string) => {
    setLikedReels((prev) => {
      const next = new Set(prev);
      if (next.has(reelId)) {
        next.delete(reelId);
        setLikeCounts((c) => ({ ...c, [reelId]: c[reelId] - 1 }));
      } else {
        next.add(reelId);
        setLikeCounts((c) => ({ ...c, [reelId]: c[reelId] + 1 }));
      }
      return next;
    });
  };

  const handleShare = async (reel: DummyReel) => {
    try {
      await navigator.share({ title: reel.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!", description: "Share it with your friends" });
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      toast({ title: "Comment posted!", description: "Thank you for your feedback" });
      setCommentText("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-50 flex items-center justify-center"
        >
          {/* Close */}
          <Button variant="ghost" size="icon" onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white bg-black/20 hover:bg-black/40">
            <X className="w-6 h-6" />
          </Button>

          {/* Prev */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 z-50">
            <Button variant="ghost" size="icon" onClick={() => scrollToReel(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="text-white bg-black/20 hover:bg-black/40 disabled:opacity-30">
              <ChevronUp className="w-6 h-6" />
            </Button>
          </div>

          {/* Reel Card */}
          <div className="relative h-full max-w-md w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReel.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute inset-0"
              >
                {/* Gradient background (no real video needed) */}
                <div className={`h-full w-full bg-gradient-to-br ${currentReel.gradient} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="text-8xl mb-4">{currentReel.emoji}</div>
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto cursor-pointer hover:bg-white/20 transition-colors">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                    <p className="text-white/60 text-sm mt-3">{currentReel.eventType}</p>
                  </div>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />

                {/* Progress bar */}
                <div className="absolute top-4 left-4 right-4 flex gap-1">
                  {reels.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToReel(i)}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i === currentIndex ? "bg-gold" : i < currentIndex ? "bg-white/80" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Right actions */}
                <div className="absolute right-4 bottom-36 flex flex-col items-center gap-6">
                  <motion.button whileTap={{ scale: 1.3 }} onClick={() => handleLike(currentReel.id)} className="flex flex-col items-center">
                    <Heart className={`w-8 h-8 ${likedReels.has(currentReel.id) ? "text-crimson fill-crimson" : "text-white"}`} />
                    <span className="text-white text-xs mt-1">{(likeCounts[currentReel.id] || 0).toLocaleString()}</span>
                  </motion.button>
                  <motion.button whileTap={{ scale: 1.1 }} onClick={() => setShowComments(true)} className="flex flex-col items-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                    <span className="text-white text-xs mt-1">{currentReel.comments}</span>
                  </motion.button>
                  <motion.button whileTap={{ scale: 1.1 }} onClick={() => handleShare(currentReel)} className="flex flex-col items-center">
                    <Share2 className="w-8 h-8 text-white" />
                    <span className="text-white text-xs mt-1">Share</span>
                  </motion.button>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 right-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-background font-bold text-sm border-2 border-gold`}>
                      {currentReel.vendorInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-white font-semibold text-sm">{currentReel.vendorName}</span>
                        {currentReel.isVerified && <Verified className="w-3.5 h-3.5 text-gold" fill="currentColor" />}
                      </div>
                      <span className="text-white/60 text-xs">{currentReel.views.toLocaleString()} views</span>
                    </div>
                    <Button size="sm" className="ml-auto bg-gold text-background hover:bg-gold-dark text-xs px-3">
                      Book Now
                    </Button>
                  </div>
                  <p className="text-white font-semibold text-sm">{currentReel.title}</p>
                  <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{currentReel.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-50">
            <Button variant="ghost" size="icon" onClick={() => scrollToReel(currentIndex + 1)}
              disabled={currentIndex === reels.length - 1}
              className="text-white bg-black/20 hover:bg-black/40 disabled:opacity-30">
              <ChevronDown className="w-6 h-6" />
            </Button>
          </div>

          {/* Comments Panel */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[60%] flex flex-col"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold">Comments ({currentReel.comments})</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowComments(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {[
                    { u: "Priya S.", t: "This is absolutely stunning! 😍 Bookmarking for my wedding!", g: "from-rose-600 to-pink-700" },
                    { u: "Rahul M.", t: "Wow the décor is unreal. How much did this cost roughly?", g: "from-blue-600 to-indigo-700" },
                    { u: "Ananya K.", t: "Attended this event! Every detail was perfect 🙌", g: "from-emerald-600 to-teal-700" },
                  ].map((c, i) => (
                    <div key={i} className="flex gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.g} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {c.u[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.u}</p>
                        <p className="text-sm text-muted-foreground">{c.t}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border flex gap-2">
                  <Input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..." onKeyDown={(e) => e.key === "Enter" && handleComment()} />
                  <Button onClick={handleComment} className="bg-gold text-background">Post</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
