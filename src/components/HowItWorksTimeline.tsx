import { useRef, type ComponentType, type MouseEvent } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   How-It-Works timeline (recreated from how_works.mp4)

   Effects captured from the video:
   1. Sage-green full-bleed section (#DFE6D6) with dark text
   2. Italic serif heading + small sub-line, left aligned
   3. Numbered badge (001, 002 …) – dark olive rounded square,
      sits centred on the spine, pops in with a spring
   4. Vertical spine beside every row: light track + dark fill
      that grows with scroll (scroll-scrubbed progress line)
   5. Rows alternate: image-left/text-right, then text-left/image-right
   6. Image card: rounded-2xl, wipes in top→bottom (clip-path) on enter
   7. Image card TILTS in 3D + a few degrees of Z-rotation following the
      cursor, springs back flat on mouse-leave
   8. Text block fades/slides up after the image, heading in condensed serif
   ───────────────────────────────────────────────────────────── */

export interface TimelineStep {
  step: string; // "01"
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  /** optional real photo – if omitted a gradient + icon panel is shown */
  image?: string;
  gradient?: string; // tailwind gradient classes for the placeholder
}

interface QuickLink {
  label: string;
  href: string;
  icon: string;
}

const fallbackGradients = [
  "from-amber-700 via-orange-800 to-stone-900",
  "from-emerald-700 via-teal-800 to-stone-900",
  "from-rose-700 via-fuchsia-800 to-stone-900",
  "from-indigo-700 via-blue-800 to-stone-900",
];

/* ── Image card with cursor-follow tilt ── */
function TiltCard({
  step,
  index,
}: {
  step: TimelineStep;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
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

  return (
    <div style={{ perspective: 1100 }} className="w-full">
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
        className="relative aspect-[1.42/1] w-full overflow-hidden rounded-[22px] shadow-[0_24px_50px_-24px_rgba(30,40,20,0.55)]"
      >
        {step.image ? (
          <img
            src={step.image}
            alt={step.title}
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
              step.gradient ?? fallbackGradients[index % fallbackGradients.length]
            }`}
          >
            <Icon className="h-24 w-24 text-white/85" strokeWidth={1.2} />
            <span className="absolute bottom-4 right-6 font-[Instrument_Serif] text-7xl leading-none text-white/20">
              {step.step}
            </span>
          </div>
        )}
        {/* soft vignette like a photo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5" />
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
      <h3 className="font-[Instrument_Serif] text-[34px] leading-[1.05] tracking-tight text-[#111]">
        {step.title}
      </h3>
      <p className="mt-5 font-[Figtree] text-[16px] leading-[1.6] text-[#3b3f36]">
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
          className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#5a5f55] font-[Instrument_Serif] text-[17px] text-[#eef1e6] shadow-md"
        >
          {badge}
        </motion.span>
      </div>

      {/* content row */}
      <div className="relative mt-12 grid grid-cols-1 items-center gap-8 pb-20 md:grid-cols-[1fr_1fr] md:gap-0">
        {/* spine (desktop) */}
        <div className="pointer-events-none absolute bottom-20 left-1/2 top-0 hidden w-[2px] -translate-x-1/2 md:block">
          <div className="absolute inset-0 bg-[#111]/15" />
          <motion.div
            style={{ scaleY: fill, transformOrigin: "top" }}
            className="absolute inset-0 bg-[#111]"
          />
        </div>

        {imageLeft ? (
          <>
            <div className="md:pr-12">
              <TiltCard step={step} index={index} />
            </div>
            <div className="md:pl-12">{text}</div>
          </>
        ) : (
          <>
            <div className="order-2 md:order-1 md:flex md:justify-end md:pr-12">{text}</div>
            <div className="order-1 md:order-2 md:pl-12">
              <TiltCard step={step} index={index} />
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
    <section id="how" className="relative bg-[#DFE6D6] py-24 text-[#111]">
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
          <p className="mt-3 font-[Figtree] text-[15px] text-[#3b3f36]">{eyebrow}</p>
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
                  className="flex items-center gap-2 rounded-full border border-[#111]/20 bg-white/40 px-4 py-2 font-[Figtree] text-sm text-[#2c3027] transition-colors hover:border-[#111] hover:bg-[#111] hover:text-[#eef1e6]"
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
