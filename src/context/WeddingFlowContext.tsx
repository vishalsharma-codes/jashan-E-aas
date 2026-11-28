import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  ALL_VARIANT, getFormat, getVariant, type WeddingFormat, type Variant,
} from "@/lib/weddingTaxonomy";

export type Step = "formats" | "variants" | "functions" | "services" | "vendors" | "compare";

type PathOverrides = {
  format?: string;
  variant?: string;
  functions?: number[];
  services?: number[];
  vendors?: string[];
};

type Ctx = {
  formatId?: string;
  format?: WeddingFormat;
  variantId?: string;
  variant?: Variant;
  hasVariants: boolean;
  functionIds: number[];
  hasFunctionsParam: boolean;
  serviceIds: number[];
  vendorIds: string[];
  setFunctionIds: (ids: number[], replace?: boolean) => void;
  setServiceIds: (ids: number[], replace?: boolean) => void;
  setVendorIds: (ids: string[], replace?: boolean) => void;
  path: (step: Step, o?: PathOverrides) => string;
};

const FlowCtx = createContext<Ctx | null>(null);

const nums = (s: string | null) =>
  (s ?? "").split(",").filter(Boolean).map(Number).filter((n) => !Number.isNaN(n));

/**
 * URL is the source of truth (refresh + back button just work):
 *   /weddings/:format/:variant/{functions|services|vendors}?f=1,2&s=3,4&v=id1,id2
 *   /weddings/compare?fm=theme&vr=beach&f=..&s=..&v=..
 */
export function WeddingFlowProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const [sp, setSp] = useSearchParams();

  const formatId = params.format ?? sp.get("fm") ?? undefined;
  const variantId = params.variant ?? sp.get("vr") ?? undefined;
  const format = getFormat(formatId);

  const functionIds = useMemo(() => nums(sp.get("f")), [sp]);
  const serviceIds = useMemo(() => nums(sp.get("s") ?? sp.get("service")), [sp]);
  const vendorIds = useMemo(() => (sp.get("v") ?? "").split(",").filter(Boolean), [sp]);
  const hasFunctionsParam = sp.has("f");

  const setKey = useCallback(
    (key: string, list: (string | number)[], replace = false, keepEmpty = false) =>
      setSp(
        (prev) => {
          const n = new URLSearchParams(prev);
          if (list.length || keepEmpty) n.set(key, list.join(","));
          else n.delete(key);
          return n;
        },
        { replace },
      ),
    [setSp],
  );

  const path = useCallback(
    (step: Step, o: PathOverrides = {}) => {
      if (step === "formats") return "/weddings";
      const fm = o.format ?? formatId;
      const vr = o.variant ?? variantId ?? ALL_VARIANT;
      if (step === "variants") {
        const services = o.services ?? serviceIds;
        const q = new URLSearchParams();
        if (services.length) q.set("s", services.join(","));
        const qs = q.toString();
        return `/weddings/${fm}${qs ? `?${qs}` : ""}`;
      }

      const f = o.functions ?? functionIds;
      const s = o.services ?? serviceIds;
      const v = o.vendors ?? vendorIds;
      const q = new URLSearchParams();
      if (step === "compare") {
        if (fm) q.set("fm", fm);
        q.set("vr", vr);
      }
      if (f.length || sp.has("f")) q.set("f", f.join(","));
      if (s.length) q.set("s", s.join(","));
      if (v.length && (step === "vendors" || step === "compare")) q.set("v", v.join(","));

      const base = step === "compare" ? "/weddings/compare" : `/weddings/${fm}/${vr}/${step}`;
      const qs = q.toString();
      return qs ? `${base}?${qs}` : base;
    },
    [formatId, variantId, functionIds, serviceIds, vendorIds, sp],
  );

  const value: Ctx = {
    formatId,
    format,
    variantId,
    variant: getVariant(formatId, variantId),
    hasVariants: !!format && format.variants.length > 0,
    functionIds,
    hasFunctionsParam,
    serviceIds,
    vendorIds,
    setFunctionIds: (ids, r) => setKey("f", ids, r, true), // keep "f=" so "none selected" is distinguishable from "first visit"
    setServiceIds: (ids, r) => setKey("s", ids, r),
    setVendorIds: (ids, r = true) => setKey("v", ids, r),
    path,
  };

  // unknown format in URL -> back to the start
  if (params.format && !format) return <Navigate to="/weddings" replace />;

  return <FlowCtx.Provider value={value}>{children}</FlowCtx.Provider>;
}

export function useWeddingFlow() {
  const ctx = useContext(FlowCtx);
  if (!ctx) throw new Error("useWeddingFlow must be used inside <WeddingFlowProvider>");
  return ctx;
}
