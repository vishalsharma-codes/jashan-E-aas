import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

interface StackSectionProps {
  children: ReactNode;
  /**
   * Background of the section. It MUST be solid (not transparent),
   * otherwise the section underneath shows through while stacking.
   */
  className?: string;
  /** The first section has no rounded corners or shadow. */
  first?: boolean;
  /** Darken the section while the next one slides over it. */
  dim?: boolean;
  id?: string;
}

/**
 * Wrap each home-page section in <StackSection>. Each one sticks to the screen
 * and the next section slides up over it, with rounded top corners.
 *
 * Rules:
 * - the sections must be direct siblings inside the same parent
 * - no parent of the sections may use overflow-hidden / overflow-auto
 */
export const StackSection = ({
  children,
  className = "bg-background",
  first = false,
  dim = true,
  id,
}: StackSectionProps) => {
  const ref = useRef<HTMLElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // A section taller than the screen sticks when its BOTTOM reaches the bottom
  // of the screen, so people can still read all of it before the next one covers it.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      el.style.top = `${Math.min(0, window.innerHeight - el.offsetHeight)}px`;
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Darken this section as the next one covers it
  const updateDim = () => {
    const el = ref.current;
    const overlay = dimRef.current;
    const next = el?.nextElementSibling as HTMLElement | null;
    if (!el || !overlay || !next) return;

    const vh = window.innerHeight;
    const covered = 1 - Math.min(Math.max(next.getBoundingClientRect().top / vh, 0), 1);
    overlay.style.opacity = String(covered * 0.55);
  };

  useMotionValueEvent(scrollY, "change", updateDim);

  return (
    <section
      ref={ref}
      id={id}
      className={[
        "sticky",
        className,
        first
          ? ""
          : "overflow-clip rounded-t-[2rem] shadow-[0_-24px_60px_rgba(0,0,0,0.45)] md:rounded-t-[2.75rem]",
      ].join(" ")}
    >
      {children}

      {dim && (
        <div
          ref={dimRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] bg-black opacity-0"
        />
      )}
    </section>
  );
};
