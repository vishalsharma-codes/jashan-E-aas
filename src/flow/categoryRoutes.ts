import { CATEGORIES } from "@/lib/eventTaxonomy";

const KEYWORDS: [string, string][] = [
  ["wedding", "CAT-01"], ["corporate", "CAT-02"], ["social", "CAT-03"], ["party", "CAT-03"],
  ["educat", "CAT-04"], ["concert", "CAT-05"], ["entertainment", "CAT-05"], ["religio", "CAT-06"],
  ["spiritual", "CAT-06"], ["exhibition", "CAT-07"], ["expo", "CAT-07"], ["sport", "CAT-08"],
  ["government", "CAT-09"], ["political", "CAT-09"], ["charity", "CAT-10"], ["ngo", "CAT-10"],
  ["fashion", "CAT-11"], ["lifestyle", "CAT-11"], ["virtual", "CAT-12"], ["hybrid", "CAT-12"],
  ["festival", "CAT-13"], ["mela", "CAT-13"], ["hospitality", "CAT-14"], ["travel", "CAT-14"],
  ["film", "CAT-15"], ["media", "CAT-15"], ["tech", "CAT-16"], ["innovation", "CAT-16"],
  ["health", "CAT-17"], ["wellness", "CAT-17"], ["community", "CAT-18"], ["neighbo", "CAT-18"],
  ["agricult", "CAT-19"], ["rural", "CAT-19"], ["automotive", "CAT-20"], ["auto", "CAT-20"],
];

export function categoryRoute(label: string): string | null {
  const lower = label.toLowerCase();
  const hit = KEYWORDS.find(([keyword]) => lower.includes(keyword));
  const category = hit && CATEGORIES.find((item) => item.id === hit[1]);
  return category ? `/events/${category.slug}` : null;
}
