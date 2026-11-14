import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuthUser } from "@/lib/communityApi";

const AUTH_ROUTE = "/auth";
const CLOSE_S = 0.75;
const OPEN_S = 0.9;

const VELVET =
  "repeating-linear-gradient(90deg, rgba(0,0,0,.28) 0px, rgba(255,255,255,.07) 26px, rgba(0,0,0,.28) 52px), linear-gradient(180deg, #7A1230 0%, #5A0C22 55%, #3E0716 100%)";

export const RopePull = () => {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const [isDragging, setIsDragging] = useState(false);
  const [hasPulled, setHasPulled] = useState(false);
  const [showLoggedIn, setShowLoggedIn] = useState(false);
  const [curtain, setCurtain] = useState<null | "close" | "open">(null);
  const noticeTimer = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);

  const dragY = useMotionValue(0);
  const ropeStretch = useTransform(dragY, [0, 120], [56, 110]);
  const glowOpacity = useTransform(dragY, [0, 120], [0, 1]);

  const displayName = String(
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "there"
  );

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
      if (openTimer.current) window.clearTimeout(openTimer.current);
    };
  }, []);

  const showAlreadyLoggedIn = () => {
    setShowLoggedIn(true);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setShowLoggedIn(false), 3000);
  };

  const startCurtain = () => {
    if (curtain) return;
    // remember where the user was so they can return after signing in
    if (pathname !== AUTH_ROUTE) {
      try { sessionStorage.setItem("cm_return_to", pathname + search); } catch { /* ignore */ }
    }
    setCurtain("close");
  };

  // Curtains finished closing: open the sign-in page behind them, then reveal it
  const onCurtainClosed = () => {
    if (curtain !== "close") return;
    if (pathname !== AUTH_ROUTE) navigate(AUTH_ROUTE);
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => setCurtain("open"), 500);
  };

  const onCurtainOpened = () => {
    if (curtain === "open") setCurtain(null);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.y > 55) {
      setHasPulled(true);
      window.setTimeout(() => {
        if (user) showAlreadyLoggedIn();
        else startCurtain();
        setHasPulled(false);
      }, 150);
    }
  };

  const closing = curtain === "close";

  return (
    <>
      {/* Fixed rope in top-right */}
      <div className="fixed top-0 right-20 z-40 flex flex-col items-center" style={{ pointerEvents: "none" }}>
        {/* Ceiling bracket */}
        <div
          className="w-7 h-5 bg-gradient-to-b from-gold via-gold-dark to-[#8A2A47] rounded-b-full shadow-lg relative"
          style={{ pointerEvents: "auto" }}
        >
          <div className="absolute left-1.5 top-1.5 w-1 h-1 rounded-full bg-gold-light/60" />
          <div className="absolute right-1.5 top-1.5 w-1 h-1 rounded-full bg-gold-light/60" />
        </div>

        {/* Rope segment, stretches while dragging */}
        <motion.div style={{ height: ropeStretch }} className="relative flex justify-center">
          <div className="w-2 h-full bg-gradient-to-b from-[#C44A68] via-[#E0708A] to-[#A8385A] rounded-full shadow-sm relative overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full"
                style={{
                  top: `${i * 10}%`,
                  height: "1px",
                  background: "rgba(120,30,60,0.35)",
                  transform: "skewX(-30deg)",
                }}
              />
            ))}
          </div>
          <motion.div
            style={{ opacity: glowOpacity }}
            className="absolute inset-0 w-2 rounded-full bg-gold/40 blur-sm"
          />
        </motion.div>

        {/* Draggable tassel handle */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 120 }}
          dragElastic={0.08}
          dragSnapToOrigin
          dragTransition={{ bounceStiffness: 400, bounceDamping: 18 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ y: dragY, pointerEvents: "auto", touchAction: "none" }}
          whileHover={{ scale: 1.08 }}
          animate={hasPulled ? { scale: [1, 0.92, 1] } : {}}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-5 h-3 mx-auto bg-gradient-to-b from-gold to-gold-dark rounded-t-full" />
          <div className="w-8 h-2 mx-auto -mt-0.5 bg-gradient-to-r from-gold-light via-gold to-gold-dark rounded-full shadow-md" />

          <div
            className="w-11 h-16 mx-auto rounded-b-xl shadow-xl relative overflow-hidden flex flex-col items-center justify-end pb-1"
            style={{
              background: "linear-gradient(160deg, #F4A6B8 0%, #E0708A 40%, #F7B9C6 70%, #E98AA0 100%)",
            }}
          >
            <div className="absolute left-2 top-0 w-1 h-full bg-white/10 rounded-full" />
            <div className="absolute right-3 top-0 w-0.5 h-full bg-white/5 rounded-full" />
            <div className="w-9 h-1 bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark rounded-full mb-2 opacity-80" />
            <div className="flex gap-px">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-b-full"
                  style={{
                    height: 14 + (i % 3) * 4,
                    background: "linear-gradient(to bottom, #E0708A, #A8385A)",
                  }}
                  animate={
                    isDragging
                      ? {
                          rotate: [(i - 3.5) * 3, (i - 3.5) * -3, (i - 3.5) * 3],
                          transition: { repeat: Infinity, duration: 0.25 + i * 0.02 },
                        }
                      : { rotate: 0 }
                  }
                />
              ))}
            </div>
          </div>

          <motion.div
            animate={{ opacity: [0.6, 1, 0.6], y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mt-1 text-[9px] text-gold/80 font-medium text-center whitespace-nowrap tracking-wide"
          >
            {user ? "hi!" : "pull"}
          </motion.div>
        </motion.div>
      </div>

      {/* Velvet curtains: close, switch to the sign-in page, then open */}
      {curtain && (
        <div className="fixed inset-0 z-[200] overflow-hidden" aria-hidden="true">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: closing ? "0%" : "-100%" }}
            transition={{ duration: closing ? CLOSE_S : OPEN_S, ease: [0.65, 0, 0.35, 1] }}
            onAnimationComplete={closing ? onCurtainClosed : onCurtainOpened}
            className="absolute inset-y-0 left-0 w-1/2"
            style={{ background: VELVET, boxShadow: "6px 0 24px rgba(0,0,0,.45)" }}
          >
            <div className="absolute inset-y-0 right-0 w-1.5 bg-gradient-to-b from-gold-light via-gold to-gold-dark" />
            <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-gold to-gold-dark" />
          </motion.div>

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: closing ? "0%" : "100%" }}
            transition={{ duration: closing ? CLOSE_S : OPEN_S, ease: [0.65, 0, 0.35, 1] }}
            className="absolute inset-y-0 right-0 w-1/2"
            style={{ background: VELVET, boxShadow: "-6px 0 24px rgba(0,0,0,.45)" }}
          >
            <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-gold-light via-gold to-gold-dark" />
            <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-gold to-gold-dark" />
          </motion.div>
        </div>
      )}

      {/* "Already logged in" notice */}
      <AnimatePresence>
        {showLoggedIn && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_12px_32px_-8px_rgba(139,30,63,0.35)] ring-1 ring-[#EADFD6]"
          >
            <CheckCircle2 className="w-6 h-6 text-[#1F6B45] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#1A1818]">You're already logged in</p>
              <p className="text-xs text-[#5E5754]">Welcome back, {displayName} 🎉</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};