import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";

/**
 * Site-wide language switcher.
 * Uses Google Translate's engine behind a custom dropdown, so the WHOLE page
 * (including text from the database) is translated without editing every string.
 * Choice is stored in the `googtrans` cookie, so it is remembered across pages and visits.
 */

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

const PAGE_LANG = "en"; // language your website is written in

const readCurrent = (): string => {
  const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  return m?.[1] ?? PAGE_LANG;
};

const writeCookie = (value: string, expire = false) => {
  const exp = expire ? "; expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
  document.cookie = `googtrans=${value}; path=/${exp}`;
  // some browsers/hosts also need the domain-level cookie
  if (location.hostname !== "localhost") {
    document.cookie = `googtrans=${value}; path=/; domain=${location.hostname}${exp}`;
  }
};

const STYLE_ID = "lang-switcher-style";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(PAGE_LANG);
  const wrapRef = useRef<HTMLDivElement>(null);

  // load Google Translate engine once + hide its default banner/widget
  useEffect(() => {
    setCurrent(readCurrent());

    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
if (!style) {
  style = document.createElement("style");
  style.id = STYLE_ID;
  document.head.appendChild(style);
}
style.textContent = `
  /* hide Google Translate top banner (old + new class names) */
  .goog-te-banner-frame,
  .goog-te-banner-frame.skiptranslate,
  iframe.skiptranslate,
  body > .skiptranslate,
  .VIpgJd-ZVi9od-ORHb-OEVmcd,
  .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
  #goog-gt-tt,
  .goog-te-balloon-frame,
  .goog-tooltip {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
  }

  /* stop Google from pushing the page down */
  html, body {
    top: 0 !important;
    margin-top: 0 !important;
    position: static !important;
  }

  .goog-text-highlight {
    background: none !important;
    box-shadow: none !important;
  }

  #google_translate_element { display: none; }
`;

    if (document.getElementById("google-translate-script")) return;

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: PAGE_LANG,
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // close dropdown on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (code: string) => {
    setOpen(false);
    if (code === current) return;

    if (code === PAGE_LANG) writeCookie(`/${PAGE_LANG}/${PAGE_LANG}`, true);
    else writeCookie(`/${PAGE_LANG}/${code}`);

    // reload is the most reliable way to apply the language to the whole site
    window.location.reload();
  };

  const active = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  return (
    <div ref={wrapRef} className={`notranslate relative ${className}`} translate="no">
      <div id="google_translate_element" />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex h-10 items-center gap-1.5 rounded-full border border-gold/40 px-3 text-xs font-medium text-gold transition-colors hover:bg-gold/10"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{active.native}</span>
      </button>

      {open && (
        <div
          role="listbox"
          data-lenis-prevent
          className="absolute right-0 top-12 z-[60] max-h-80 w-48 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === current}
              onClick={() => choose(l.code)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-gold/10"
            >
              <span>
                {l.native}
                <span className="ml-2 text-xs text-muted-foreground">{l.label}</span>
              </span>
              {l.code === current && <Check className="h-4 w-4 text-gold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
