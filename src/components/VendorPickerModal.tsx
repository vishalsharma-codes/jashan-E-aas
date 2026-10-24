import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Star } from "lucide-react";

/**
 * "Choose a Vendor" popup for the Compare page.
 *
 * Why scrolling failed before: your site uses smooth-scroll (Lenis), which grabs the mouse wheel
 * for the whole page. `data-lenis-prevent` tells it to leave the wheel/touch alone inside the list,
 * and `overscroll-contain` stops the page behind from scrolling when you reach the end.
 */
export interface PickerVendor {
  id: string;
  name: string;
  category: string;
  location?: string;
  city?: string;
  rating: number | string;
  initials: string;
  gradient: string;
}

interface Props {
  open: boolean;
  vendors: PickerVendor[];
  selectedIds: string[];            // already in a compare slot (shown dimmed, not clickable)
  onPick: (vendor: PickerVendor) => void;
  onClose: () => void;
}

export function VendorPickerModal({ open, vendors, selectedIds, onPick, onClose }: Props) {
  // close on Esc + lock the page behind while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a vendor"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* header (stays put) */}
        <div className="flex flex-shrink-0 items-center justify-between px-6 py-5">
          <h2 className="font-serif text-xl font-bold">Choose a Vendor</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* scrollable list */}
        <div
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 pb-5"
        >
          {vendors.map((v) => {
            const taken = selectedIds.includes(v.id);
            return (
              <button
                key={v.id}
                type="button"
                disabled={taken}
                onClick={() => onPick(v)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  taken
                    ? "cursor-not-allowed border-transparent bg-muted/40 opacity-50"
                    : "border-transparent hover:border-gold/50 hover:bg-gold/10"
                }`}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${v.gradient} text-sm font-bold text-white`}>
                  {v.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{v.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {v.category} · {v.city ?? v.location}
                  </p>
                </div>
                {taken ? (
                  <span className="text-[11px] text-muted-foreground">Added</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    {v.rating}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}