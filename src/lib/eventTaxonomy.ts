import { TAXONOMY } from "@/lib/categoryTaxonomy";

export type TaxItem = { id: string; name: string; detail?: string };
export type TaxFormat = { id: string; name: string; variants: string[]; moreVariants?: string[] };
export type TaxCategory = {
  id: string; slug: string; name: string; shortName: string; leadTime: string;
  formats: TaxFormat[]; functions: TaxItem[]; services: TaxItem[];
};

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const splitLabel = (s: string) => {
  const match = s.match(/^(.*?)\s*\((.*)\)\s*$/);
  return match ? { name: match[1].trim(), variants: match[2].split(/[,;]\s*/).map((v) => v.trim()).filter(Boolean) } : { name: s, variants: [] as string[] };
};

export const CATEGORIES: TaxCategory[] = TAXONOMY.map((source) => ({
  ...source,
  slug: source.id === "CAT-01" ? "weddings-pre-wedding-ceremonies" : source.slug,
  formats: source.formats.map((label) => {
    const parsed = splitLabel(label);
    return { id: slug(parsed.name), name: parsed.name, variants: parsed.variants,
      ...(source.id === "CAT-01" && slug(parsed.name) === "theme-based-weddings" ? { moreVariants: ["Modern Minimalist", "Forest"] } : {}) };
  }),
  functions: source.subEvents.map((name, i) => ({ id: `${source.id}-F${i + 1}`, name })),
  services: source.services.map((label, i) => {
    const parsed = splitLabel(label);
    return { id: source.id === "CAT-01" ? String(i + 1) : `${source.id}-S${i + 1}`, name: parsed.name, detail: parsed.variants.join(", ") || undefined };
  }),
}));

export function getCategory(idOrSlug: string): TaxCategory | undefined {
  return CATEGORIES.find((category) => category.id === idOrSlug || category.slug === idOrSlug);
}
