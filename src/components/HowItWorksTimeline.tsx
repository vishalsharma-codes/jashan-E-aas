import { useRef, useState, type ComponentType, type MouseEvent } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   How-It-Works timeline

   CARD SIZE: change CARD_MAX_WIDTH to make every image card bigger or smaller.
     max-w-[300px] = small · max-w-[340px] = default now · max-w-[420px] = larger
   (the original card filled the whole half of the row, about 450px wide)
   ───────────────────────────────────────────────────────────── */
const CARD_MAX_WIDTH = "max-w-[340px]";

export interface TimelineStep {
  step: string; // "01"
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  /** your own image, e.g. "/howitworks/step1.png" (file in public/howitworks/) */
  image?: string;
  /**
   * "cover"   = photo fills the whole card (best for photographs)
   * "contain" = whole image shown inside the coloured card (best for icons / illustrations / PNGs with transparency)
   */
  imageFit?: "cover" | "contain";
  gradient?: string; // tailwind gradient classes behind the image / placeholder
}

interface QuickLink {
  label: string;
  href: string;
  icon: string;
}

const fallbackGradients = [
  "from-rose-300 via-pink-300 to-orange-200",
  "from-orange-200 via-amber-200 to-rose-300",
  "from-fuchsia-300 via-pink-300 to-rose-200",
  "from-rose-200 via-orange-200 to-pink-300",
];

/* ── Image card with cursor-follow tilt ── */
function TiltCard({
  step,
  index,
  imageLeft,
}: {
  step: TimelineStep;
  index: number;
  imageLeft: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hovering = useMotionValue(0);

  const cfg = { stiffness: 160, damping: 16, mass: 0.6 };
  const sx = useSpring(px, cfg);
  const sy = useSpring(py, cfg);
  const sh = useSpring(hovering, cfg);

  // cursor on the right → card leans counter-clockwise (matches the video)
  const rotateZ = useTransform([sx, sh], ([x, h]: number[]) => -(x - 0.5) * 9 * h);
  const rotateY = useTransform([sx, sh], ([x, h]: number[]) => (x - 0.5) * 10 * h);
  const rotateX = useTransform([sy, sh], ([y, h]: number[]) => -(y - 0.5) * 8 * h);
  const scale = useTransform(sh, [0, 1], [1, 1.02]);

  const onMove = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hovering.set(1);
  };
  const onLeave = () => {
    hovering.set(0);
    px.set(0.5);
    py.set(0.5);
  };

  const Icon = step.icon;
  const gradient = step.gradient ?? fallbackGradients[index % fallbackGradients.length];
  const showImage = !!step.image && !imgFailed; // a missing file falls back to the icon panel
  const contain = step.imageFit === "contain";

  return (
    <div
      style={{ perspective: 1100 }}
      // keeps the smaller card next to the centre line: right edge in left column, left edge in right column
      className={`mx-auto w-full ${CARD_MAX_WIDTH} ${
        imageLeft ? "md:ml-auto md:mr-0" : "md:ml-0 md:mr-auto"
      }`}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        // wipe-in reveal (top → bottom)
        initial={{ clipPath: "inset(0% 0% 100% 0% round 22px)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0% round 22px)" }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{
          rotateZ,
          rotateY,
          rotateX,
          scale,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative aspect-[1.42/1] w-full overflow-hidden rounded-[22px] shadow-[0_24px_50px_-24px_rgba(196,74,104,0.4)]"
      >
        {showImage ? (
          contain ? (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
              <img
                src={step.image}
                alt={step.title}
                draggable={false}
                onError={() => setImgFailed(true)}
                className="h-full w-full object-contain p-6"
              />
              <span className="pointer-events-none absolute bottom-3 right-5 font-[Instrument_Serif] text-5xl leading-none text-white/50">
                {step.step}
              </span>
            </div>
          ) : (
            <img
              src={step.image}
              alt={step.title}
              draggable={false}
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
            <Icon className="h-16 w-16 text-white" strokeWidth={1.5} />
            <span className="absolute bottom-3 right-5 font-[Instrument_Serif] text-5xl leading-none text-white/50">
              {step.step}
            </span>
          </div>
        )}
        {/* soft vignette like a photo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rose-900/10 via-transparent to-white/10" />
      </motion.div>
    </div>
  );
}

/* ── One timeline row ── */
function Row({ step, index }: { step: TimelineStep; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const imageLeft = index % 2 === 0;

  // spine fill is scrubbed by scroll
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 75%", "end 45%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  const badge = String(index + 1).padStart(3, "0");

  const text = (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      className="flex max-w-[420px] flex-col justify-center"
    >
      <h3 className="font-[Instrument_Serif] text-[34px] leading-[1.05] tracking-tight text-[#4A3440]">
        {step.title}
      </h3>
      <p className="mt-5 font-[Figtree] text-[16px] leading-[1.6] text-[#7A6169]">
        {step.desc}
      </p>
    </motion.div>
  );

  return (
    <div ref={rowRef} className="relative">
      {/* badge */}
      <div className="relative z-10 flex justify-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#C44A68] font-[Instrument_Serif] text-[17px] text-white shadow-md"
        >
          {badge}
        </motion.span>
      </div>

      {/* content row */}
      <div className="relative mt-12 grid grid-cols-1 items-center gap-8 pb-20 md:grid-cols-[1fr_1fr] md:gap-0">
        {/* spine (desktop) */}
        <div className="pointer-events-none absolute bottom-20 left-1/2 top-0 hidden w-[2px] -translate-x-1/2 md:block">
          <div className="absolute inset-0 bg-[#C44A68]/20" />
          <motion.div
            style={{ scaleY: fill, transformOrigin: "top" }}
            className="absolute inset-0 bg-[#C44A68]"
          />
        </div>

        {imageLeft ? (
          <>
            <div className="md:pr-12">
              <TiltCard step={step} index={index} imageLeft />
            </div>
            <div className="md:pl-12">{text}</div>
          </>
        ) : (
          <>
            <div className="order-2 md:order-1 md:flex md:justify-end md:pr-12">{text}</div>
            <div className="order-1 md:order-2 md:pl-12">
              <TiltCard step={step} index={index} imageLeft={false} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Section ── */
export function HowItWorksTimeline({
  steps,
  quickLinks,
  eyebrow = "Simple. Fast. Reliable.",
  title = "How Jashan-E-Aas Works",
}: {
  steps: TimelineStep[];
  quickLinks?: QuickLink[];
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section id="how" className="relative bg-[#FFEDE6] py-24 text-[#4A3440]">
      {/* fonts used by the effect (remove if already loaded globally) */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');`}</style>

      <div className="mx-auto max-w-[1040px] px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-[520px]"
        >
          <h2 className="font-[Instrument_Serif] text-[44px] italic leading-none tracking-tight">
            {title}
          </h2>
          <p className="mt-3 font-[Figtree] text-[15px] text-[#7A6169]">{eyebrow}</p>
        </motion.div>

        <div>
          {steps.map((s, i) => (
            <Row key={s.step} step={s} index={i} />
          ))}
        </div>

        {quickLinks && (
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {quickLinks.map((ql, i) => (
              <motion.div
                key={ql.label}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={ql.href}
                  className="flex items-center gap-2 rounded-full border border-[#C44A68]/30 bg-white/60 px-4 py-2 font-[Figtree] text-sm text-[#4A3440] transition-colors hover:border-[#C44A68] hover:bg-[#C44A68] hover:text-white"
                >
                  <span>{ql.icon}</span>
                  {ql.label}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HowItWorksTimeline;