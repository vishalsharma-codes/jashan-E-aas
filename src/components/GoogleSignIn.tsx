import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type GoogleCredentialResponse = { credential: string };
type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        nonce: string;
        use_fedcm_for_prompt: boolean;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
let gsiLoadPromise: Promise<void> | null = null;

const loadGsi = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => {
      if (window.google?.accounts?.id) resolve();
      else reject(new Error("Google sign-in did not initialize."));
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("Couldn't load Google sign-in.")), { once: true });

    if (!existing) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    gsiLoadPromise = null;
    throw error;
  });

  return gsiLoadPromise;
};

const sha256Hex = async (text: string) => {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export function GoogleSignIn({
  text = "continue_with",
}: {
  text?: "continue_with" | "signup_with" | "signin_with";
}) {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      if (!CLIENT_ID) {
        setError("Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID.");
        return;
      }

      try {
        await loadGsi();
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

        const rawNonce = crypto.randomUUID();
        const hashedNonce = await sha256Hex(rawNonce);
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

        const identity = window.google.accounts.id;
        identity.initialize({
          client_id: CLIENT_ID,
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
          callback: async ({ credential }) => {
            setBusy(true);
            setError("");

            try {
              const { error: signInError } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: credential,
                nonce: rawNonce,
              });

              if (signInError) {
                setError(signInError.message);
                setBusy(false);
                return;
              }

              let returnTo = "/";
              try {
                const savedReturnTo = sessionStorage.getItem("cm_return_to");
                if (savedReturnTo?.startsWith("/") && !savedReturnTo.startsWith("//")) {
                  returnTo = savedReturnTo;
                }
              } catch {
                // Fall back to the home page when session storage is unavailable.
              }

              navigate(returnTo, { replace: true });
            } catch (signInError) {
              setError(signInError instanceof Error ? signInError.message : "Google sign-in failed.");
              setBusy(false);
            }
          },
        });

        buttonRef.current.replaceChildren();
        identity.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "center",
          width: Math.max(120, Math.min(buttonRef.current.offsetWidth || 380, 400)),
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Google sign-in is unavailable.");
        }
      }
    };

    void initialize();
    return () => { cancelled = true; };
  }, [navigate, text]);

  return (
    <div>
      <div className="relative">
        <div
          ref={buttonRef}
          aria-label="Continue with Google"
          className={`flex w-full justify-center ${busy ? "pointer-events-none opacity-40" : ""}`}
        />
        {busy && (
          <span
            role="status"
            aria-label="Signing in"
            className="absolute inset-0 m-auto h-6 w-6 animate-spin rounded-full border-2 border-[#E9E1D5] border-t-[#C44A68]"
          />
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
