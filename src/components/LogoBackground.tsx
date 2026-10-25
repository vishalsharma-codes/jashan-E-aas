import { useEffect, useRef } from "react";

type LogoBackgroundProps = {
  /** Path of the logo image inside your public/ folder */
  src?: string;
  /** Overall strength of the logo, 0 to 1. Lower = fainter behind text */
  opacity?: number;
  /** Kept for future styles. Only "depth" is included in this file */
  variant?: "depth";
  className?: string;
};

/**
 * Depth layers background.
 * Three copies of the logo (blurry back, sharp middle, faint front)
 * drift at different speeds as the mouse moves, which gives a 3D feel.
 *
 * Usage:
 *   <LogoBackground variant="depth" opacity={0.4} />
 */
export default function LogoBackground({
  src = "/logo-mark.webp",
  opacity = 0.4,
  variant = "depth",
  className = "",
}: LogoBackgroundProps) {
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    // target = where the mouse is (-1 to 1), current = smoothed value
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    const start = performance.now();

    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const tick = (now: number) => {
      const t = (now - start) / 1000;

      // ease toward the mouse so movement feels smooth
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;

      // slow idle drift so it moves even without the mouse
      const idleX = Math.sin(t * 0.25);
      const idleY = Math.cos(t * 0.2);

      const place = (
        el: HTMLDivElement | null,
        depth: number,
        scale: number,
        rotate: number
      ) => {
        if (!el) return;
        const x = -current.x * depth + idleX * depth * 0.35;
        const y = -current.y * depth + idleY * depth * 0.35;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${
          rotate + current.x * 1.2
        }deg)`;
      };

      place(backRef.current, 18, 1.7, 0); // far: slow
      place(midRef.current, 42, 1, 0); // middle
      place(frontRef.current, 85, 1.35, 0); // near: fast

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const layerBase: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    willChange: "transform",
  };

  const imgBase: React.CSSProperties = {
    height: "min(95vh, 95vw)",
    width: "auto",
    maxWidth: "none",
    userSelect: "none",
  };

  return (
    <div
      aria-hidden="true"
      data-variant={variant}
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      {/* Back layer: big and blurry */}
      <div ref={backRef} style={layerBase}>
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            ...imgBase,
            filter: "blur(22px)",
            opacity: opacity * 0.6,
          }}
        />
      </div>

      {/* Middle layer: sharp */}
      <div ref={midRef} style={layerBase}>
        <img
          src={src}
          alt=""
          draggable={false}
          style={{ ...imgBase, opacity }}
        />
      </div>

      {/* Front layer: faint, large, slightly soft */}
      <div ref={frontRef} style={layerBase}>
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            ...imgBase,
            filter: "blur(1.5px)",
            opacity: opacity * 0.3,
          }}
        />
      </div>
    </div>
  );
}