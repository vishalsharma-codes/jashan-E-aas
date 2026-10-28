
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Use native browser scrolling on app-style pages.
const NATIVE = [
  "/vendor-dashboard",
  "/chat",
  "/reels",
  "/my-reels",
  "/account",
  "/admin",
];

export const SmoothScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (NATIVE.some((path) => pathname.startsWith(path))) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t: number) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let frameId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
};
