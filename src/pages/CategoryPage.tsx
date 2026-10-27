import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin, CheckCircle, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground, categoryThemeMap } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { eventCategories } from "@/lib/categoryData";
import { useLiveVendors, byCategoryId } from "@/lib/liveVedors";
import type { LiveVendor as Vendor } from "@/lib/vendorOptions";

const VendorCard = ({ vendor, catGradient, index }: { vendor: Vendor; catGradient: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/50 transition-all group"
  >
    {/* Portfolio strip */}
    <div className="flex gap-1 h-28">
      {vendor.portfolio.slice(0, 4).map((p) => (
        <div key={p.id} className={`flex-1 bg-gradient-to-br ${p.gradient} flex items-center justify-center text-2xl opacity-80 group-hover:opacity-100 transition-opacity`}>
          {p.emoji}
        </div>
      ))}
    </div>

    <div className="p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${vendor.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {vendor.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-foreground group-hover:text-gold transition-colors truncate">{vendor.name}</h3>
            {vendor.isVerified && <CheckCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">{vendor.subcategory}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm mb-2">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-gold fill-gold" />
          <span className="font-semibold">{vendor.rating}</span>
          <span className="text-muted-foreground text-xs">({vendor.reviews})</span>
        </span>
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <MapPin className="w-3 h-3" />{vendor.location}
        </span>
      </div>

      <div className="flex gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vendor.eventsCompleted} events</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{vendor.responseTime}</span>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{vendor.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {vendor.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-bold text-gold text-sm">{vendor.price}</span>
        <Button size="sm" className="bg-gold hover:bg-gold-dark text-background">Get Quote</Button>
      </div>
    </div>
  </motion.div>
);

const PortfolioGrid = ({ vendor }: { vendor: Vendor }) => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${vendor.gradient} flex items-center justify-center text-white font-bold text-sm`}>
        {vendor.initials}
      </div>
      <div>
        <p className="font-semibold text-foreground text-sm">{vendor.name}</p>
        <p className="text-xs text-muted-foreground">{vendor.eventsCompleted} events · {vendor.yearsExperience} yrs experience</p>
      </div>
      {vendor.isVerified && <Badge className="ml-auto text-xs bg-gold/20 text-gold border-gold/30">Verified ✓</Badge>}
    </div>
    <div className="grid grid-cols-2 gap-2">
      {vendor.portfolio.map((p) => (
        <div
          key={p.id}
          className={`h-28 rounded-xl bg-gradient-to-br ${p.gradient} flex flex-col items-center justify-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer`}
        >
          <span className="text-3xl">{p.emoji}</span>
          <span className="text-white/80 text-xs font-medium text-center px-2 leading-tight">{p.title}</span>
        </div>
      ))}
    </div>
    <div className="mt-3 flex flex-wrap gap-1">
      {vendor.specialties.map((s) => (
        <span key={s} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
      ))}
    </div>
  </div>
);

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const serviceLabel = searchParams.get("service") || "";
  const [activeTab, setActiveTab] = useState("vendors");

  const category = eventCategories.find((c) => c.id === categoryId);
  const { vendors, loading: vendorsLoading } = useLiveVendors();
  const allCategoryVendors = byCategoryId(vendors, categoryId || "");

  if (!category) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link to="/"><Button className="bg-gold text-background">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground theme={categoryThemeMap[categoryId ?? ""] ?? "default"} />
      <Navbar />
      <div className="pt-20">
          {/* Category Hero */}
          <div className="bg-black border-b py-8">
            <div className="container mx-auto px-4 ">
              <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                  {serviceLabel || category.name} <span className="text-4xl">{category.icon}</span>
                </h1>
                <p className="text-white/70 text-lg">{vendorsLoading ? "Loading vendors…" : `${allCategoryVendors.length} ${allCategoryVendors.length === 1 ? "vendor" : "vendors"}`} · {category.subCategories.length} service types</p>
              </motion.div>
            </div>
          </div>

        <div className="container mx-auto px-4 py-10">
          {/* Sub-categories */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Browse by Service Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.subCategories.map((sub) => (
                  <Link
                    key={sub.name}
                    to={`/subcategory/${encodeURIComponent(sub.name)}`}
                    className="group"
                  >
                    <div className="overflow-hidden rounded-xl border border-gold/30 bg-card hover:border-gold transition-all duration-300 hover:shadow-xl">

                      {/* Image */}
                      <div className="h-44 overflow-hidden">
                        <img
                          src={sub.image}
                          alt={sub.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Bottom */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">
                          {sub.name}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {sub.services.length} services
                        </p>
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
          </div>
        </div>
      </div>
      <Footer />
      <EveBuddy />
    </div>
  );
}; 

export default CategoryPage;