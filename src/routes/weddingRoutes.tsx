import { Route } from "react-router-dom";
import WeddingFlowLayout from "@/components/wedding/WeddingFlowLayout";
import WeddingFormats from "@/pages/wedding/WeddingFormats";
import WeddingVariants from "@/pages/wedding/WeddingVariants";
import WeddingFunctions from "@/pages/wedding/WeddingFunctions";
import WeddingServices from "@/pages/wedding/WeddingServices";
import WeddingVendors from "@/pages/wedding/WeddingVendors";
import WeddingCompare from "@/pages/wedding/WeddingCompare";

/** Usage: <Routes> ... {weddingRoutes} ... </Routes>   (place before any "/category/:slug" catch-all) */
export const weddingRoutes = (
  <Route path="/weddings" element={<WeddingFlowLayout />}>
    <Route index element={<WeddingFormats />} />
    <Route path="compare" element={<WeddingCompare />} />
    <Route path=":format" element={<WeddingVariants />} />
    <Route path=":format/:variant/functions" element={<WeddingFunctions />} />
    <Route path=":format/:variant/services" element={<WeddingServices />} />
    <Route path=":format/:variant/vendors" element={<WeddingVendors />} />
  </Route>
);
