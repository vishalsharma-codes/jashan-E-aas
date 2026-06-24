import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, Play, User, Video, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { EveBuddyChat } from "./EveBuddyChat";
import { SpotlightReels } from "./SpotlightReels";
import { AccountTab } from "./AccountTab";
import { EveBuddyAgentMode } from "./EveBuddyAgentMode";
import { EveBuddyAvatar } from "./EveBuddyAvatar";
import { useAuth } from "@/hooks/useAuth";

const ROUTE_LABELS: Record<string, string> = {
  "/":               "Home",
  "/vendors":        "Vendors",
  "/booking-system": "Booking",
  "/for-partners":   "Partners",
  "/how-it-works":   "How It Works",
  "/community":      "Community",
  "/ultra-gold":     "Ultra Gold",
  "/rewards":        "Rewards",
  "/trust-safety":   "Trust",
  "/compare":        "Compare",
};

export const EveBuddy = () => {
  const [isChatOpen,    setIsChatOpen]    = useState(false);
  const [isReelsOpen,   setIsReelsOpen]   = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAgentOpen,   setIsAgentOpen]   = useState(false);
  const [isAvatarOpen,  setIsAvatarOpen]  = useState(false);

  const { user } = useAuth();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const pageLabel = ROUTE_LABELS[pathname] ?? "Explore";

  const handleAccountClick = () => {
    if (user) setIsAccountOpen(true);
    else navigate("/auth");
  };

  const closeAll = () => {
    setIsChatOpen(false);
    setIsAgentOpen(false);
    setIsAvatarOpen(false);
    setIsAccountOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border px-2 py-2 safe-area-bottom">

        {/* Page context indicator */}
        {pathname !== "/" && (
          <div className="text-center mb-1">
            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">
              📍 {pageLabel}
            </span>
          </div>
        )}

        <div className="max-w-xl mx-auto flex items-center justify-around">

          {/* Eve Avatar Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { closeAll(); setIsAvatarOpen(!isAvatarOpen); }}
            className="flex flex-col items-center gap-1 p-1.5 relative"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all ${
              isAvatarOpen
                ? "bg-gold/20 border-gold shadow-gold/20"
                : "bg-gradient-to-br from-purple-500 to-indigo-700 border-transparent"
            }`}>
              <span className="text-lg">👩</span>
            </div>
            <span className="text-[10px] font-medium text-foreground">Avatar</span>
          </motion.button>

          {/* Eve Buddy Chat */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { closeAll(); setIsChatOpen(!isChatOpen); }}
            className="flex flex-col items-center gap-1 p-1.5 relative"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isChatOpen
                ? "bg-gold/20 border border-gold"
                : "bg-gradient-to-br from-gold to-gold-dark"
            }`}>
              <Bot className="w-6 h-6 text-background" />
            </div>
            <span className="text-[10px] font-medium text-foreground flex items-center gap-0.5">
              EveBuddy <Sparkles className="w-2.5 h-2.5 text-gold" />
            </span>
            {/* Live pulse */}
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background animate-pulse" />
          </motion.button>

          {/* Agent Mode */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { closeAll(); setIsAgentOpen(!isAgentOpen); }}
            className="flex flex-col items-center gap-1 p-1.5 relative"
          >
            <motion.div
              animate={isAgentOpen
                ? { boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 16px rgba(212,175,55,0.5)", "0 0 0px rgba(212,175,55,0)"] }
                : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all ${
                isAgentOpen
                  ? "bg-gold/20 border-gold"
                  : "bg-gradient-to-br from-crimson to-velvet border-transparent"
              }`}
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-[10px] font-medium text-foreground">Agent</span>
            {/* Active indicator */}
            <span className="absolute top-1.5 right-1 w-2 h-2 rounded-full bg-emerald-500 border border-background animate-pulse" />
          </motion.button>

          {/* Spotlight Reels */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsReelsOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </div>
            <span className="text-[10px] font-medium text-foreground flex items-center gap-0.5">
              Reels <Video className="w-2.5 h-2.5 text-crimson" />
            </span>
          </motion.button>

          {/* Account */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAccountClick}
            className="flex flex-col items-center gap-1 p-1.5"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center shadow-lg border border-border">
              {user ? (
                <span className="text-base font-bold text-gold">
                  {user.email?.[0]?.toUpperCase() ?? "U"}
                </span>
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <span className="text-[10px] font-medium text-foreground">
              {user ? "Account" : "Sign In"}
            </span>
          </motion.button>

        </div>
      </div>

      {/* Panels */}
      <EveBuddyChat     isOpen={isChatOpen}    onClose={() => setIsChatOpen(false)} />
      <SpotlightReels   isOpen={isReelsOpen}   onClose={() => setIsReelsOpen(false)} />
      <AccountTab       isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
      <EveBuddyAgentMode isOpen={isAgentOpen}  onClose={() => setIsAgentOpen(false)} />
      <EveBuddyAvatar
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        onOpenChat={() => { setIsAvatarOpen(false); setIsChatOpen(true); }}
      />
    </>
  );
};
