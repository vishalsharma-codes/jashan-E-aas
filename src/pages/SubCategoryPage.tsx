import { useParams } from "react-router-dom";
import { eventCategories } from "@/lib/categoryData";

const SubCategoryPage = () => {
  const { subcategoryName } = useParams();

  const subCategory = eventCategories
    .flatMap(category => category.subCategories)
    .find(
      sub =>
        sub.name === decodeURIComponent(subcategoryName || "")
    );

  if (!subCategory) {
    return <div className="p-10">Subcategory Not Found</div>;
  }

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">
        {subCategory.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subCategory.services.map((service) => (
          <div
            key={service}
            className="p-4 border rounded-xl"
          >
            {service}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubCategoryPage;