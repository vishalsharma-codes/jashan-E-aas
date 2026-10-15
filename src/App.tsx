import SubCategoryPage from "./pages/SubCategoryPage";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Vendors from "./pages/Vendors";
import ForPartners from "./pages/ForPartners";
import CategoryPage from "./pages/CategoryPage";
import VendorDashboard from "./pages/VendorDashboard";
import HowItWorks from "./pages/HowItWorks";
import UltraGold from "./pages/UltraGold";
import Community from "./pages/Community";
import CustomerAccount from "./pages/CustomerAccount";
import BookingSystem from "./pages/BookingSystem";
import GamificationPage from "./pages/GamificationPage";
import VendorComparison from "./pages/VendorComparison";
import TrustSafety from "./pages/TrustSafety";
import NotFound from "./pages/NotFound";
import ChooseRole from "./pages/ChooseRole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/subcategory/:subcategoryName" element={<SubCategoryPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/for-partners" element={<ForPartners />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/ultra-gold" element={<UltraGold />} />
            <Route path="/community" element={<Community />} />
            <Route path="/account" element={<CustomerAccount />} />
            <Route path="/booking-system" element={<BookingSystem />} />
            <Route path="/rewards" element={<GamificationPage />} />
            <Route path="/compare" element={<VendorComparison />} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/choose-role" element={<ChooseRole />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
