/** Auto-loads wedding images wherever `subCategoryImages/wedding` lives under src/components. */
const found = import.meta.glob(
  "/src/components/**/subCategoryImages/wedding/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default" },
) as Record<string, string>;

export const pickImage = (...keys: string[]): string => {
  for (const key of keys) {
    const hit = Object.entries(found).find(([p]) => p.toLowerCase().includes(key.toLowerCase()));
    if (hit) return hit[1];
  }
  return "";
};

/** Function-card images already in /public/wedding (keyed by FUNCTIONS id). Others fall back to a gradient. */
export const FUNCTION_IMAGES: Record<number, string> = {
  1: "/wedding/1-1_engagement-ceremony.jpg.jpeg",
  2: "/wedding/1-2_mehandi-henna-ceremony.jpg.jpeg",
  3: "/wedding/1-3_sangeet-musical-night.jpg.jpeg",
  4: "/wedding/1-4_haldi-ceremony.jpg.jpeg",
  5: "/wedding/1-5_bachelor-party.jpg.jpeg",
  6: "/wedding/1-6_bachelorette-bridal-shower.jpg.jpeg",
  9: "/wedding/1-9_tilak-shagun-ceremony.jpg.jpeg",
  12: "/wedding/1-11_post-wedding-rituals-griha-pravesh.jpg.jpeg",
  14: "/wedding/1-13_vow-renewal-ceremonies.jpg.jpeg",
};
