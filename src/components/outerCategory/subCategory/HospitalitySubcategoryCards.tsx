import type { SubCategory } from "@/lib/categoryData";

interface Props {
  subcategories: SubCategory[];
  onSelect: (subcategory: SubCategory) => void;
}

export default function HospitalitySubcategoryCards({
  subcategories,
  onSelect,
}: Props) {
  return (
    <div>
      {subcategories.map((subcategory) => (
        <button
          key={subcategory.name}
          onClick={() => onSelect(subcategory)}
        >
          {subcategory.name}
        </button>
      ))}
    </div>
  );
}