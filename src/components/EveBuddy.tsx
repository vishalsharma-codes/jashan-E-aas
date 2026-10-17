
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Video, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { EveBuddyChat } from "./EveBuddyChat";
import { SpotlightReels } from "./SpotlightReels";
import { AccountTab } from "./AccountTab";
import { EveBuddyAvatar } from "./EveBuddyAvatar";
import { useAuth } from "@/hooks/useAuth";

export const EveBuddy = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleAccountClick = () => {
    if (user) setIsAccountOpen(true);
    else navigate("/auth");
  };

  return (
    <>
      {/* Floating EveBuddy face button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsChatOpen(true)}
        aria-label="Open EveBuddy assistant"
        className="fixed bottom-20 right-35 z-50 h-16 w-16 overflow-hidden rounded-full border-2 border-gold/70 bg-gradient-to-br from-blue-600 to-pink-600 shadow-xl shadow-black/40"
      >
        <span className="flex h-full w-full items-center justify-center">
          <img
            src="/images/eve-face.png"
            alt="EveBuddy"
            className="h-full w-full rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="pointer-events-none absolute text-2xl">✨</span>
        </span>
      </motion.button>

      {/* Existing functional panels */}
      <EveBuddyChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <SpotlightReels
        isOpen={isReelsOpen}
        onClose={() => setIsReelsOpen(false)}
      />

      <AccountTab
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      <EveBuddyAvatar
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        onOpenChat={() => {
          setIsAvatarOpen(false);
          setIsChatOpen(true);
        }}
      />
    </>
  );
};
