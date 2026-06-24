import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { VelvetRopeLogin } from "./VelvetRopeLogin";

export const RopePull = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasPulled, setHasPulled] = useState(false);

  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const ropeStretch = useTransform(springY, [0, 120], [56, 110]);
  const tassleY = useTransform(springY, [0, 120], [0, 10]);
  const glowOpacity = useTransform(springY, [0, 120], [0, 1]);

  const handleDragEnd = () => {
    setIsDragging(false);
    if (y.get() > 55) {
      setHasPulled(true);
      setTimeout(() => {
        setIsOpen(true);
        setHasPulled(false);
      }, 150);
    }
    y.set(0);
  };

  return (
    <>
      {/* Fixed rope in top-right */}
      <div className="fixed top-0 right-20 z-40 flex flex-col items-center" style={{ pointerEvents: "none" }}>
        {/* Ceiling bracket */}
        <div className="w-7 h-5 bg-gradient-to-b from-gold via-gold-dark to-[#7a5c00] rounded-b-full shadow-lg relative" style={{ pointerEvents: "auto" }}>
          {/* Bracket screws */}
          <div className="absolute left-1.5 top-1.5 w-1 h-1 rounded-full bg-gold-light/60" />
          <div className="absolute right-1.5 top-1.5 w-1 h-1 rounded-full bg-gold-light/60" />
        </div>

        {/* Rope segment — stretches when dragging */}
        <motion.div
          style={{ height: ropeStretch }}
          className="relative flex justify-center"
        >
          {/* Main rope strand */}
          <div className="w-2 h-full bg-gradient-to-b from-[#c49a2a] via-[#e8c84a] to-[#a07820] rounded-full shadow-sm relative overflow-hidden">
            {/* Twisted rope texture */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full"
                style={{
                  top: `${i * 10}%`,
                  height: "1px",
                  background: "rgba(90,60,0,0.35)",
                  transform: "skewX(-30deg)",
                }}
              />
            ))}
          </div>
          {/* Glow when pulling */}
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
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ y: springY, pointerEvents: "auto" }}
          whileHover={{ scale: 1.08 }}
          animate={hasPulled ? { scale: [1, 0.92, 1] } : {}}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          {/* Knot at top of tassel */}
          <div className="w-5 h-3 mx-auto bg-gradient-to-b from-gold to-gold-dark rounded-t-full" />

          {/* Gold ring */}
          <div className="w-8 h-2 mx-auto -mt-0.5 bg-gradient-to-r from-gold-light via-gold to-gold-dark rounded-full shadow-md" />

          {/* Velvet body */}
          <div
            className="w-11 h-16 mx-auto rounded-b-xl shadow-xl relative overflow-hidden flex flex-col items-center justify-end pb-1"
            style={{
              background: "linear-gradient(160deg, #8b0a1a 0%, #6b0612 40%, #9a1020 70%, #7b0a18 100%)",
            }}
          >
            {/* Fabric fold highlights */}
            <div className="absolute left-2 top-0 w-1 h-full bg-white/10 rounded-full" />
            <div className="absolute right-3 top-0 w-0.5 h-full bg-white/5 rounded-full" />

            {/* Gold band */}
            <div className="w-9 h-1 bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark rounded-full mb-2 opacity-80" />

            {/* Fringe strands */}
            <div className="flex gap-px">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-b-full"
                  style={{
                    height: 14 + (i % 3) * 4,
                    background: "linear-gradient(to bottom, #d4a017, #a07820)",
                  }}
                  animate={isDragging ? {
                    rotate: [(i - 3.5) * 3, (i - 3.5) * -3, (i - 3.5) * 3],
                    transition: { repeat: Infinity, duration: 0.25 + i * 0.02 }
                  } : { rotate: 0 }}
                />
              ))}
            </div>
          </div>

          {/* Pull hint */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6], y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mt-1 text-[9px] text-gold/80 font-medium text-center whitespace-nowrap tracking-wide"
          >
            pull
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && <VelvetRopeLogin onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
