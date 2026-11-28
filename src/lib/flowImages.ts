const found = import.meta.glob(
  "../components/outerCategory/categoryImages/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default" }
) as Record<string, string>;

const KEY_FOR_SLUG: Record<string, string> = {
  weddings: "wedding", "corporate-events": "corporate", "social-parties": "social",
  "concerts-and-shows": "concert", "religious-and-spiritual": "religio",
  "agricultural-and-rural": "agri", "automotive-events": "auto",
};

export const categoryImage = (slug: string): string => {
  const key = (KEY_FOR_SLUG[slug] ?? slug.split("-")[0]).toLowerCase();
  return Object.entries(found).find(([p]) => p.toLowerCase().includes(key))?.[1] ?? "";
};

export const ITEM_IMAGES: Record<string, string> = {};
export const itemImage = (slug: string, id: string) => ITEM_IMAGES[`${slug}/${id}`] ?? "";
