import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export type BgTheme =
  | "wedding" | "corporate" | "festival" | "music" | "photography"
  | "birthday" | "catering" | "sports" | "luxury" | "wellness"
  | "tech" | "charity" | "film" | "default";

interface Orb { color: string; cx: string; cy: string; size: number; dur: number; delay: number; }

/* Soft pastel glows. Every page theme stays inside the same gentle Blush Peach family,
   with a small colour shift so pages still feel a little different from each other. */
const POS = [
  { cx: "12%", cy: "18%", size: 560, dur: 20, delay: 0 },
  { cx: "84%", cy: "14%", size: 440, dur: 24, delay: 3 },
  { cx: "58%", cy: "74%", size: 640, dur: 28, delay: 7 },
  { cx: "6%",  cy: "80%", size: 380, dur: 22, delay: 10 },
];
const mk = (c1: string, c2: string, c3: string, c4: string): Orb[] =>
  [c1, c2, c3, c4].map((color, i) => ({ color, ...POS[i] }));

const THEMES: Record<BgTheme, Orb[]> = {
  default:     mk("255,200,212", "255,222,196", "246,205,236", "255,214,205"), // blush · peach · orchid · coral
  wedding:     mk("255,196,210", "255,226,200", "245,200,232", "255,210,222"),
  corporate:   mk("208,222,255", "255,214,226", "222,210,255", "200,232,250"), // soft sky + pink
  festival:    mk("255,214,170", "255,200,200", "255,232,170", "255,205,220"),
  music:       mk("226,208,255", "255,205,228", "206,224,255", "240,210,250"),
  photography: mk("255,206,216", "214,232,255", "255,226,206", "232,214,252"),
  birthday:    mk("255,200,224", "255,236,176", "198,240,222", "208,228,255"),
  catering:    mk("255,218,184", "255,204,190", "255,234,186", "255,208,214"),
  sports:      mk("198,238,218", "208,228,255", "255,236,184", "255,210,214"),
  luxury:      mk("255,210,216", "255,228,200", "240,206,226", "255,220,190"),
  wellness:    mk("202,238,222", "214,236,250", "255,226,214", "230,222,250"),
  tech:        mk("206,228,255", "226,212,255", "200,240,236", "255,214,230"),
  charity:     mk("255,214,184", "255,200,208", "255,234,176", "250,208,226"),
  film:        mk("226,214,255", "255,224,200", "246,206,230", "208,224,250"),
};

const ROUTE_THEMES: Record<string, BgTheme> = {
  "/":               "default",
  "/vendors":        "photography",
  "/booking-system": "wedding",
  "/for-partners":   "corporate",
  "/how-it-works":   "festival",
  "/community":      "music",
  "/ultra-gold":     "luxury",
  "/rewards":        "luxury",
  "/trust-safety":   "corporate",
  "/compare":        "photography",
  "/account":        "default",
  "/auth":           "default",
};

export const DynamicBackground = ({ theme: override }: { theme?: BgTheme }) => {
  const { pathname } = useLocation();
  const theme: BgTheme = override ?? ROUTE_THEMES[pathname] ?? "default";
  const orbs = THEMES[theme];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: orb.cx,
              top: orb.cy,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              // light page = stronger pastel (0.55) than the old dark page (0.14)
              background: `radial-gradient(circle, rgba(${orb.color},0.55) 0%, rgba(${orb.color},0.22) 55%, transparent 75%)`,
              transform: "translate(-50%, -50%)",
              filter: "blur(70px)",
            }}
            animate={{
              x: [0, 35, -18, 22, -8, 0],
              y: [0, -28, 22, -12, 18, 0],
              scale: [1, 1.09, 0.94, 1.05, 0.98, 1],
            }}
            transition={{
              duration: orb.dur,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export const categoryThemeMap: Record<string, BgTheme> = {
  "wedding":       "wedding",
  "corporate":     "corporate",
  "birthday":      "birthday",
  "concert":       "music",
  "festival":      "festival",
  "social-party":  "birthday",
  "catering":      "catering",
  "sports":        "sports",
  "wellness":      "wellness",
  "technology":    "tech",
  "charity":       "charity",
  "film":          "film",
  "photography":   "photography",
};