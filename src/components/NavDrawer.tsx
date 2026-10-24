import { useEffect, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent, MouseEvent as RMouseEvent } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Store, Briefcase, Crown, Users, Globe } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * Hamburger button + left slide-in menu (desktop).
 *  - Hover the ☰ button: the menu slides in from the left edge of the screen
 *  - Move the mouse away from the menu: it slides back out
 *  - Touch screens: tap ☰ to open, tap the dark area or ✕ to close
 *  - Esc closes it; choosing a link closes it
 */
const ITEMS = [
  { label: "Vendors", href: "/vendors", icon: Store },
  { label: "For Partners", href: "/for-partners", icon: Briefcase },
  { label: "Ultra Gold", href: "/ultra-gold", icon: Crown, gold: true },
  { label: "Community", href: "/community", icon: Users },
];

export function NavDrawer() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { pathname } = useLocation();

  const cancelClose = () => clearTimeout(closeTimer.current);
  const openNow = () => { cancelClose(); setOpen(true); };
  const closeSoon = () => { cancelClose(); closeTimer.current = setTimeout(() => setOpen(false), 180); };

  // ── Language box: open on hover, close when the mouse leaves ──
  // We "press" the switcher's own button for the mouse, so its list/animation/selection logic is untouched.
  const langRef = useRef<HTMLDivElement>(null);
  const langTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastPointer = useRef<string>("mouse");
  const langTrigger = () => langRef.current?.querySelector("button") as HTMLButtonElement | null;
  const langIsOpen = () => !!langRef.current?.querySelector(".absolute");
  const langEnter = (e: RPointerEvent) => {
    lastPointer.current = e.pointerType;
    if (e.pointerType !== "mouse") return;
    clearTimeout(langTimer.current);
    if (!langIsOpen()) langTrigger()?.click();
  };
  const langLeave = (e: RPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(langTimer.current);
    // short delay so crossing the small gap between the button and the list doesn't close it
    langTimer.current = setTimeout(() => { if (langIsOpen()) langTrigger()?.click(); }, 220);
  };
  // A real mouse click on the button would toggle the list shut right after hover opened it: ignore it.
  const langClickCapture = (e: RMouseEvent) => {
    if (e.isTrusted && lastPointer.current === "mouse" && langTrigger()?.contains(e.target as Node)) {
      e.stopPropagation();
    }
  };
  useEffect(() => () => clearTimeout(langTimer.current), []);

  // close on route change and on Esc
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => () => cancelClose(), []);

  return (
    <>
      {/* ☰ trigger (sits in the navbar, left of the logo) */}
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="nav-drawer"
        onPointerEnter={(e) => e.pointerType === "mouse" && openNow()}
        onPointerLeave={(e) => e.pointerType === "mouse" && closeSoon()}
        onClick={openNow}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/30 text-gold transition-colors hover:border-gold hover:bg-gold/10"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Rendered on <body> (not inside the navbar): the navbar's glass blur would otherwise
          shrink these 'fixed' elements to the navbar's height. */}
      {createPortal(
        <>
      {/* dim backdrop (tap to close on touch screens) */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* the drawer */}
      <aside
        id="nav-drawer"
        onPointerEnter={(e) => e.pointerType === "mouse" && openNow()}
        onPointerLeave={(e) => e.pointerType === "mouse" && closeSoon()}
        className={`fixed bottom-0 left-0 top-0 z-[60] flex h-[100dvh] w-72 flex-col overflow-y-auto border-r border-border bg-background/95 shadow-2xl backdrop-blur-xl transition-[transform,visibility] duration-300 ease-out ${
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        {/* header */}
        <div className="flex h-20 flex-shrink-0 items-center justify-between border-b border-border/60 px-5">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-dark">
              <span className="font-display text-lg font-bold text-primary-foreground">ج</span>
            </div>
            <span className="font-display text-lg text-foreground">
              Jashan<span className="text-gold">-E-Aas</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* links */}
        <nav className="flex-shrink-0 space-y-1 px-3 py-4">
          {ITEMS.map(({ label, href, icon: Icon, gold }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={label}
                to={href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  active ? "bg-gold/10 text-gold" : gold ? "text-gold hover:bg-gold/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                {label}
                {gold && (
                  <span className="ml-auto rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">PREMIUM</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* pushes the language box to the bottom of the panel */}
        <div className="flex-1" />

        {/* language: pinned at the bottom; its list opens UPWARD into the empty space above it */}
        <div className="relative flex-shrink-0 border-t border-border/60 px-5 py-4" data-lenis-prevent>
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Language
          </p>
          {/* The [&_.absolute]… classes flip the switcher's pop-up list from "below the button" to "above it" */}
          <div
            ref={langRef}
            onPointerEnter={langEnter}
            onPointerLeave={langLeave}
            onClickCapture={langClickCapture}
            className="relative [&_.absolute]:!bottom-full [&_.absolute]:!top-auto [&_.absolute]:!mb-2 [&_.absolute]:!mt-0">
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
        </>,
        document.body
      )}
    </>
  );
}