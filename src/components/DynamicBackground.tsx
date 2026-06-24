import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export type BgTheme =
  | "wedding" | "corporate" | "festival" | "music" | "photography"
  | "birthday" | "catering" | "sports" | "luxury" | "wellness"
  | "tech" | "charity" | "film" | "default";

interface Orb { color: string; cx: string; cy: string; size: number; dur: number; delay: number; }

const THEMES: Record<BgTheme, Orb[]> = {
  default: [
    { color: "212,175,55", cx: "12%", cy: "18%", size: 560, dur: 20, delay: 0 },
    { color: "139,0,0",    cx: "82%", cy: "12%", size: 420, dur: 24, delay: 3 },
    { color: "212,175,55", cx: "60%", cy: "72%", size: 640, dur: 28, delay: 7 },
    { color: "90,0,60",    cx: "5%",  cy: "78%", size: 360, dur: 22, delay: 10 },
  ],
  wedding: [
    { color: "255,182,193", cx: "10%", cy: "15%", size: 580, dur: 22, delay: 0 },
    { color: "212,175,55",  cx: "76%", cy: "20%", size: 440, dur: 26, delay: 4 },
    { color: "216,120,210", cx: "48%", cy: "76%", size: 620, dur: 30, delay: 9 },
    { color: "255,80,147",  cx: "88%", cy: "62%", size: 380, dur: 20, delay: 2 },
  ],
  corporate: [
    { color: "30,100,220",  cx: "5%",  cy: "10%", size: 500, dur: 24, delay: 0 },
    { color: "0,180,255",   cx: "82%", cy: "22%", size: 380, dur: 28, delay: 5 },
    { color: "20,40,140",   cx: "42%", cy: "80%", size: 560, dur: 32, delay: 10 },
    { color: "0,140,200",   cx: "92%", cy: "68%", size: 300, dur: 20, delay: 3 },
  ],
  festival: [
    { color: "255,140,0",  cx: "10%", cy: "22%", size: 540, dur: 17, delay: 0 },
    { color: "255,60,0",   cx: "76%", cy: "14%", size: 460, dur: 21, delay: 3 },
    { color: "255,215,0",  cx: "52%", cy: "72%", size: 600, dur: 25, delay: 7 },
    { color: "220,20,60",  cx: "18%", cy: "82%", size: 370, dur: 19, delay: 5 },
  ],
  music: [
    { color: "148,0,211",  cx: "10%", cy: "18%", size: 520, dur: 18, delay: 0 },
    { color: "255,0,128",  cx: "82%", cy: "14%", size: 430, dur: 22, delay: 4 },
    { color: "75,0,130",   cx: "48%", cy: "76%", size: 620, dur: 26, delay: 8 },
    { color: "0,240,255",  cx: "92%", cy: "58%", size: 300, dur: 20, delay: 2 },
  ],
  photography: [
    { color: "0,180,160",  cx: "10%", cy: "18%", size: 500, dur: 22, delay: 0 },
    { color: "30,50,200",  cx: "82%", cy: "14%", size: 410, dur: 26, delay: 5 },
    { color: "0,100,130",  cx: "48%", cy: "76%", size: 580, dur: 30, delay: 10 },
    { color: "190,190,220",cx: "88%", cy: "62%", size: 340, dur: 18, delay: 3 },
  ],
  birthday: [
    { color: "255,100,180", cx: "10%", cy: "18%", size: 510, dur: 16, delay: 0 },
    { color: "255,240,0",   cx: "82%", cy: "14%", size: 390, dur: 20, delay: 3 },
    { color: "0,230,120",   cx: "48%", cy: "76%", size: 590, dur: 24, delay: 7 },
    { color: "120,200,255", cx: "88%", cy: "58%", size: 320, dur: 18, delay: 5 },
  ],
  catering: [
    { color: "255,155,60",  cx: "10%", cy: "18%", size: 510, dur: 18, delay: 0 },
    { color: "200,95,20",   cx: "82%", cy: "14%", size: 410, dur: 22, delay: 4 },
    { color: "255,200,90",  cx: "48%", cy: "76%", size: 570, dur: 26, delay: 8 },
    { color: "160,50,0",    cx: "88%", cy: "58%", size: 345, dur: 20, delay: 2 },
  ],
  sports: [
    { color: "0,180,80",    cx: "10%", cy: "18%", size: 510, dur: 18, delay: 0 },
    { color: "0,100,210",   cx: "82%", cy: "14%", size: 410, dur: 22, delay: 4 },
    { color: "255,200,0",   cx: "48%", cy: "76%", size: 570, dur: 26, delay: 8 },
    { color: "210,0,0",     cx: "88%", cy: "58%", size: 340, dur: 20, delay: 2 },
  ],
  luxury: [
    { color: "212,175,55",  cx: "10%", cy: "18%", size: 540, dur: 24, delay: 0 },
    { color: "255,215,0",   cx: "82%", cy: "14%", size: 430, dur: 28, delay: 4 },
    { color: "180,140,0",   cx: "48%", cy: "76%", size: 620, dur: 32, delay: 9 },
    { color: "110,85,0",    cx: "88%", cy: "58%", size: 365, dur: 20, delay: 2 },
  ],
  wellness: [
    { color: "100,200,150", cx: "10%", cy: "18%", size: 510, dur: 24, delay: 0 },
    { color: "180,255,220", cx: "82%", cy: "14%", size: 410, dur: 28, delay: 5 },
    { color: "0,160,120",   cx: "48%", cy: "76%", size: 580, dur: 32, delay: 10 },
    { color: "80,200,180",  cx: "88%", cy: "58%", size: 340, dur: 18, delay: 3 },
  ],
  tech: [
    { color: "0,200,255",   cx: "10%", cy: "18%", size: 510, dur: 20, delay: 0 },
    { color: "100,0,255",   cx: "82%", cy: "14%", size: 410, dur: 24, delay: 4 },
    { color: "0,255,200",   cx: "48%", cy: "76%", size: 580, dur: 28, delay: 9 },
    { color: "50,50,200",   cx: "88%", cy: "58%", size: 340, dur: 18, delay: 2 },
  ],
  charity: [
    { color: "255,160,60",  cx: "10%", cy: "18%", size: 510, dur: 20, delay: 0 },
    { color: "255,80,80",   cx: "82%", cy: "14%", size: 410, dur: 24, delay: 4 },
    { color: "255,200,0",   cx: "48%", cy: "76%", size: 580, dur: 28, delay: 9 },
    { color: "200,50,50",   cx: "88%", cy: "58%", size: 340, dur: 18, delay: 2 },
  ],
  film: [
    { color: "180,160,255", cx: "10%", cy: "18%", size: 510, dur: 20, delay: 0 },
    { color: "255,200,100", cx: "82%", cy: "14%", size: 410, dur: 24, delay: 4 },
    { color: "100,0,100",   cx: "48%", cy: "76%", size: 580, dur: 28, delay: 9 },
    { color: "0,20,80",     cx: "88%", cy: "58%", size: 340, dur: 18, delay: 2 },
  ],
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
              background: `radial-gradient(circle, rgba(${orb.color},0.14) 0%, rgba(${orb.color},0.05) 55%, transparent 75%)`,
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
