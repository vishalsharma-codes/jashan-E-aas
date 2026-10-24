import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, X, Plus } from "lucide-react";
import { vendors } from "@/lib/vendorData";
import { Link } from "react-router-dom";

const MAX_COMPARE = 3;
const CARD_H = "h-[232px]"; // vendor cards AND "Add Vendor" slots share this exact height

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

type Vendor = (typeof vendors)[0];

export default function VendorComparison() {
  // Three FIXED slots. A removed vendor leaves its slot empty, so nothing shifts or resizes.
  const [slots, setSlots] = useState<(string | null)[]>(() => {
    const first = vendors.slice(0, 2).map((v) => v.id);
    return Array.from({ length: MAX_COMPARE }, (_, i) => first[i] ?? null);
  });
  const [pickerSlot, setPickerSlot] = useState<number | null>(null); // which empty slot is being filled
  const showPicker = pickerSlot !== null;

  const slotVendors: (Vendor | null)[] = slots.map((id) => vendors.find((v) => v.id === id) ?? null);
  const selectedIds = slots.filter(Boolean) as string[];
  const hasAny = selectedIds.length > 0;

  const removeAt = (i: number) => setSlots((s) => s.map((x, j) => (j === i ? null : x)));
  const pickVendor = (id: string) => {
    if (pickerSlot === null || selectedIds.includes(id)) return;
    setSlots((s) => s.map((x, j) => (j === pickerSlot ? id : x)));
    setPickerSlot(null);
  };

  // Picker: Esc closes, and the page behind is locked while it is open
  useEffect(() => {
    if (!showPicker) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPickerSlot(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [showPicker]);

  const renderValue = (vendor: Vendor, key: string) => {
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

          {/* Picker modal */}
          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                onClick={() => setPickerSlot(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-card border border-border rounded-3xl max-w-lg w-full max-h-[75vh] flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                    <h3 className="font-bold">Choose a Vendor</h3>
                    <button onClick={() => setPickerSlot(null)} aria-label="Close"><X className="w-5 h-5" /></button>
                  </div>

                  {/* Scroll area. data-lenis-prevent lets the mouse wheel scroll here even with smooth-scroll
                      on the page; overscroll-contain stops the page behind from moving. */}
                  <div
                    data-lenis-prevent
                    data-lenis-prevent-wheel
                    data-lenis-prevent-touch
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 space-y-2"
                  >
                    {vendors.map((v) => {
                      const taken = selectedIds.includes(v.id);
                      return (
                        <button
                          key={v.id}
                          onClick={() => pickVendor(v.id)}
                          disabled={taken}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                            taken
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
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison table (fixed columns: 1 label column + 3 equal vendor columns) */}
          {hasAny ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] table-fixed">
                <colgroup>
                  <col className="w-40" />
                  {slots.map((_, i) => <col key={i} />)}
                </colgroup>

                <thead>
                  <tr>
                    <th className="text-left align-middle text-xs text-muted-foreground uppercase tracking-wider pb-4 font-medium">Metric</th>
                    {slotVendors.map((v, i) => (
                      <th key={v ? v.id : `empty-${i}`} className="pb-4 align-top font-normal">
                        {v ? (
                          <div className={`relative ${CARD_H} bg-card border border-border rounded-2xl p-4 mx-2 text-center`}>
                            {/* Remove button: frees this slot, size never changes */}
                            <button
                              onClick={() => removeAt(i)}
                              aria-label={`Remove ${v.name}`}
                              className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-red-500/20 transition-colors"
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
                            <p className="font-bold text-sm truncate">{v.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{v.category}</p>
                            {v.isVerified && <Badge className="mt-1.5 text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Verified</Badge>}
                          </div>
                        ) : (
                          /* Empty slot: same width and height as a vendor card */
                          <button
                            onClick={() => setPickerSlot(i)}
                            className={`mx-2 ${CARD_H} w-[calc(100%-1rem)] border-2 border-dashed border-gold/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-gold/60 hover:text-gold hover:border-gold/60 hover:bg-gold/5 transition-colors`}
                          >
                            <Plus className="w-6 h-6" />
                            <span className="text-xs">Add Vendor</span>
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {compareFields.map((field, fi) => (
                    <tr key={field.key} className={fi % 2 === 0 ? "bg-muted/10" : ""}>
                      <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">{field.label}</td>
                      {slotVendors.map((v, i) => (
                        <td key={v ? v.id : `e-${i}`} className="py-3 text-center text-sm font-medium px-2">
                          {v ? renderValue(v, field.key) : null}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Tags row */}
                  <tr>
                    <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Specialties</td>
                    {slotVendors.map((v, i) => (
                      <td key={v ? v.id : `e-${i}`} className="py-3 px-2">
                        {v && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {v.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* CTA row */}
                  <tr>
                    <td className="pt-5 pr-4 text-sm text-muted-foreground font-medium">Action</td>
                    {slotVendors.map((v, i) => (
                      <td key={v ? v.id : `e-${i}`} className="pt-5 px-2 text-center">
                        {v && (
                          <Button asChild size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs w-full">
                            <Link to={`/vendors?vendor=${v.id}`}>View Profile</Link>
                          </Button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* Everything removed: show three empty slots so vendors can be added again */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {slots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPickerSlot(i)}
                  className={`${CARD_H} border-2 border-dashed border-gold/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-gold/60 hover:text-gold hover:border-gold/60 hover:bg-gold/5 transition-colors`}
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-xs">Add Vendor</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <EveBuddy />
    </div>
  );
}