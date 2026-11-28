import { Navigate, useParams } from "react-router-dom";
import { categoryRoute } from "@/flow/categoryRoutes";
import { getCategory } from "@/lib/eventTaxonomy";

export default function LegacyCategoryRedirect() {
  const params = useParams();
  const value = params["*"] ?? params.slug ?? params.categoryId ?? params.subcategoryName ?? "";
  const category = getCategory(value) ?? getCategory(value.toUpperCase());
  const destination = category ? `/events/${category.slug}` : categoryRoute(value) ?? "/events";
  return <Navigate to={destination} replace />;
}
