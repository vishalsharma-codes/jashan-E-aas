import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, X, MapPin, Clock, Shield, Plus, TrendingUp } from "lucide-react";
import { vendors } from "@/lib/vendorData";
import { Link } from "react-router-dom";

const MAX_COMPARE = 3;

const compareFields = [
  { key: "rating", label: "Rating" },
  { key: "reviews", label: "Reviews" },
  { key: "location", label: "City" },
  { key: "price", label: "Price Range" },
  { key: "responseTime", label: "Response Time" },
  { key: "yearsExperience", label: "Experience" },
  { key: "eventsCompleted", label: "Events Done" },
  { key: "isVerified", label: "Verified" },
];

export default function VendorComparison() {
  const [selected, setSelected] = useState<string[]>(vendors.slice(0, 2).map((v) => v.id));
  const [showPicker, setShowPicker] = useState(false);

  const selectedVendors = vendors.filter((v) => selected.includes(v.id));

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected((s) => s.filter((x) => x !== id));
    } else if (selected.length < MAX_COMPARE) {
      setSelected((s) => [...s, id]);
    }
  };

  const renderValue = (vendor: typeof vendors[0], key: string) => {
    const val = (vendor as any)[key];
    if (key === "rating") return (
      <span className="flex items-center gap-1 justify-center">
        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
        <span className="font-bold">{val}</span>
      </span>
    );
    if (key === "isVerified") return val ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />;
    if (key === "yearsExperience") return `${val} yrs`;
    if (key === "reviews") return `${val.toLocaleString("en-IN")} reviews`;
    if (key === "eventsCompleted") return `${val}+`;
    return val;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-sm uppercase tracking-widest mb-2">Side-by-Side</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-1">Compare Vendors</h1>
            <p className="text-muted-foreground">Select up to 3 vendors to compare across every metric.</p>
          </motion.div>

          {/* Add vendor button */}
          {selected.length < MAX_COMPARE && (
            <Button
              onClick={() => setShowPicker(true)}
              variant="outline"
              className="border-gold/40 text-gold hover:bg-gold/10 mb-6"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Vendor to Compare
            </Button>
          )}

          {/* Picker modal */}
          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                onClick={() => setShowPicker(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full max-h-[70vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Choose a Vendor</h3>
                    <button onClick={() => setShowPicker(false)}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-2">
                    {vendors.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => { toggle(v.id); setShowPicker(false); }}
                        disabled={selected.includes(v.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                          selected.includes(v.id)
                            ? "opacity-40 cursor-not-allowed bg-muted"
                            : "hover:bg-gold/10 border border-transparent hover:border-gold/30"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${v.gradient} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{v.initials}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.category} · {v.location}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 text-gold fill-gold" />{v.rating}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison table */}
          {selectedVendors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                {/* Headers */}
                <thead>
                  <tr>
                    <th className="w-40 text-left text-xs text-muted-foreground uppercase tracking-wider pb-4 font-medium">Metric</th>
                    {selectedVendors.map((v) => (
                      <th key={v.id} className="pb-4 relative">
                        <div className="bg-card border border-border rounded-2xl p-4 mx-2 text-center">
                          {/* Remove button */}
                          <button
                            onClick={() => toggle(v.id)}
                            className="absolute top-2 right-4 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-red-500/20 transition-colors"
                          >
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                          {/* Portfolio strip */}
                          <div className="flex gap-0.5 h-16 rounded-xl overflow-hidden mb-3">
                            {v.portfolio.slice(0, 3).map((p) => (
                              <div key={p.id} className={`flex-1 bg-gradient-to-br ${p.gradient} flex items-center justify-center text-xl`}>{p.emoji}</div>
                            ))}
                          </div>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center text-white font-bold text-sm mx-auto mb-2`}>{v.initials}</div>
                          <p className="font-bold text-sm">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.category}</p>
                          {v.isVerified && <Badge className="mt-1.5 text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Verified</Badge>}
                        </div>
                      </th>
                    ))}
                    {selected.length < MAX_COMPARE && (
                      <th className="pb-4">
                        <button
                          onClick={() => setShowPicker(true)}
                          className="mx-2 h-full min-h-[160px] w-full border-2 border-dashed border-gold/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-gold/60 hover:text-gold hover:border-gold/60 transition-colors"
                        >
                          <Plus className="w-6 h-6" />
                          <span className="text-xs">Add Vendor</span>
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>
                {/* Rows */}
                <tbody>
                  {compareFields.map((field, fi) => (
                    <tr key={field.key} className={fi % 2 === 0 ? "bg-muted/10" : ""}>
                      <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">{field.label}</td>
                      {selectedVendors.map((v) => (
                        <td key={v.id} className="py-3 text-center text-sm font-medium px-2">
                          {renderValue(v, field.key)}
                        </td>
                      ))}
                      {selected.length < MAX_COMPARE && <td />}
                    </tr>
                  ))}
                  {/* Tags row */}
                  <tr>
                    <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Specialties</td>
                    {selectedVendors.map((v) => (
                      <td key={v.id} className="py-3 px-2">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {v.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                    {selected.length < MAX_COMPARE && <td />}
                  </tr>
                  {/* CTA row */}
                  <tr>
                    <td className="pt-5 pr-4 text-sm text-muted-foreground font-medium">Action</td>
                    {selectedVendors.map((v) => (
                      <td key={v.id} className="pt-5 px-2 text-center">
                        <Button asChild size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs w-full">
                          <Link to={`/vendors?vendor=${v.id}`}>View Profile</Link>
                        </Button>
                      </td>
                    ))}
                    {selected.length < MAX_COMPARE && <td />}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">Select at least one vendor to compare.</div>
          )}
        </div>
      </section>

      <Footer />
      <EveBuddy />
    </div>
  );
}
