import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";

export interface AutoScrollMarqueeHandle {
  nudge: (direction: "left" | "right") => void;
}

interface AutoScrollMarqueeProps {
  children: ReactNode; // one set of items; the marquee duplicates it for the loop
  speed?: number; // pixels per second
  gap?: number; // pixels between items
  className?: string;
}

const PAUSE_EASE_MS = 250; // how softly it slows/resumes on hover
const NUDGE_EASE_MS = 220; // how softly manual nudges glide

/**
 * Smooth, constant, seamless auto-scroll in a single row.
 * Pauses (with easing) on hover, touch and keyboard focus.
 * If the items don't fill the row, it stays still instead of looping.
 */
export const AutoScrollMarquee = forwardRef<
  AutoScrollMarqueeHandle,
  AutoScrollMarqueeProps
>(({ children, speed = 40, gap = 16, className = "" }, ref) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  const isPausedRef = useRef(false);
  const nudgeRef = useRef(0);

  useImperativeHandle(ref, () => ({
    nudge: (direction) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const distance = viewport.clientWidth / 2;
      nudgeRef.current += direction === "right" ? distance : -distance;
    },
  }));

  // The duplicate set is decoration only: keep it out of tab order.
  useEffect(() => {
    const copy = copyRef.current as (HTMLDivElement & { inert?: boolean }) | null;
    if (copy) copy.inert = true;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const firstSet = firstSetRef.current;
    if (!track || !viewport || !firstSet) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frameId = 0;
    let previousTime = 0;
    let offset = 0; // float position, never rounded
    let currentSpeed = reduceMotion ? 0 : speed;

    const animate = (time: number) => {
      if (previousTime !== 0) {
        const dt = Math.min(time - previousTime, 50);
        const loopWidth = firstSet.offsetWidth;

        if (loopWidth > 0 && loopWidth > viewport.clientWidth) {
          const targetSpeed =
            isPausedRef.current || reduceMotion ? 0 : speed;
          currentSpeed +=
            (targetSpeed - currentSpeed) * (1 - Math.exp(-dt / PAUSE_EASE_MS));

          offset += (currentSpeed * dt) / 1000;

          if (Math.abs(nudgeRef.current) > 0.5) {
            const step =
              nudgeRef.current * (1 - Math.exp(-dt / NUDGE_EASE_MS));
            nudgeRef.current -= step;
            offset += step;
          } else {
            nudgeRef.current = 0;
          }

          // Seamless loop: wrap by exactly one set width, in either direction.
          offset = ((offset % loopWidth) + loopWidth) % loopWidth;
          track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        } else {
          // Not enough items to loop: stay put.
          offset = 0;
          nudgeRef.current = 0;
          track.style.transform = "translate3d(0, 0, 0)";
        }
      }

      previousTime = time;
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [speed]);

  const pause = () => {
    isPausedRef.current = true;
  };

  const resume = () => {
    isPausedRef.current = false;
  };

  const setStyle = { gap, paddingRight: gap };

  return (
    <div
      ref={viewportRef}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      className={`overflow-hidden ${className}`}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        <div ref={firstSetRef} className="flex shrink-0" style={setStyle}>
          {children}
        </div>
        <div
          ref={copyRef}
          aria-hidden="true"
          className="flex shrink-0"
          style={setStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

AutoScrollMarquee.displayName = "AutoScrollMarquee";
