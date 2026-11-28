import type { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { WeddingFlowProvider, useWeddingFlow, type Step } from "@/context/WeddingFlowContext";

const STEPS: { key: Step; label: string }[] = [
  { key: "formats", label: "Format" },
  { key: "variants", label: "Variant" },
  { key: "functions", label: "Functions" },
  { key: "services", label: "Services" },
  { key: "vendors", label: "Vendors" },
  { key: "compare", label: "Compare" },
];

function currentStep(pathname: string): Step {
  const p = pathname.replace(/\/+$/, "");
  if (p === "/weddings") return "formats";
  if (p === "/weddings/compare") return "compare";
  const last = p.split("/").pop();
  if (last === "functions" || last === "services" || last === "vendors") return last;
  return "variants";
}

function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const { format, variant, hasVariants, functionIds, serviceIds, vendorIds, path } = useWeddingFlow();
  const step = currentStep(pathname);
  const idx = STEPS.findIndex((s) => s.key === step);

  const back = () => {
    if (step === "formats") {
      if (location.state?.fromEventTypeOverlay) navigate(-1);
      else navigate("/", { state: { openEventTypeOverlay: true } });
      return;
    }
    const prev: Record<Step, string> = {
      formats: "/",
      variants: path("formats"),
      functions: hasVariants ? path("variants") : path("formats"),
      services: path("functions"),
      vendors: path("services"),
      compare: path("vendors"),
    };
    navigate(prev[step]);
  };

  const chips = [
    format?.name,
    variant?.name,
    functionIds.length ? `${functionIds.length} function${functionIds.length > 1 ? "s" : ""}` : null,
    serviceIds.length ? `${serviceIds.length} service${serviceIds.length > 1 ? "s" : ""}` : null,
    vendorIds.length ? `${vendorIds.length} to compare` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#0d0d12] px-4 pb-28 pt-6 text-white">
      <div className="mx-auto max-w-[1450px]">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={back}
            className="flex items-center gap-2 rounded-lg border border-[#d4af37]/40 px-3 py-2 text-sm text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <ol className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {STEPS.map((s, i) => {
              const skipped = s.key === "variants" && !!format && !hasVariants;
              const done = i < idx && !skipped;
              const active = i === idx;
              return (
                <li key={s.key} className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => navigate(path(s.key))}
                    className={`rounded-full px-3 py-1 tracking-wide transition ${
                      active
                        ? "bg-[#d4af37] font-semibold text-black"
                        : done
                          ? "border border-[#d4af37]/60 text-[#d4af37] hover:bg-[#d4af37]/10"
                          : "border border-white/10 text-white/35"
                    } ${skipped ? "line-through" : ""}`}
                  >
                    {i + 1}. {s.label}
                  </button>
                  {i < STEPS.length - 1 && <span className="text-white/20">›</span>}
                </li>
              );
            })}
          </ol>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#f0c94a]">
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export default function WeddingFlowLayout() {
  return (
    <WeddingFlowProvider>
      <Shell>
        <Outlet />
      </Shell>
    </WeddingFlowProvider>
  );
}

export function PageHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="mb-8 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.35em] text-[#d4af37]">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold md:text-5xl">{title}</h1>
      {sub && <p className="mx-auto mt-3 max-w-2xl text-sm text-white/60 md:text-base">{sub}</p>}
    </header>
  );
}

export function StickyAction({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d4af37]/30 bg-[#0d0d12]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4">{children}</div>
    </div>
  );
}

export const goldBtn =
  "rounded-xl border border-[#d4af37] bg-[#d4af37] px-7 py-3 font-serif text-sm font-semibold text-black transition hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-40";
