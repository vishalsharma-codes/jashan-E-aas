import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Phone, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/chatClient"; // adjust to your client path

type Props = {
  vendorId: string;        // vendor_profiles.id (or the vendor's user id, whichever conversations uses)
  vendorName: string;
  className?: string;
};

export default function ContactVendorButton({ vendorId, vendorName, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"chat" | "call" | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const start = async (mode: "chat" | "call") => {
    setBusy(mode);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.info("Please log in to contact this vendor");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      // 1. find existing conversation with this vendor
      const { data: existing, error: findErr } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", user.id)
        .eq("vendor_id", vendorId)
        .maybeSingle();
      if (findErr) throw findErr;

      let conversationId = existing?.id;

      // 2. or create it
      if (!conversationId) {
        const { data: created, error: createErr } = await supabase
          .from("conversations")
          .insert({ customer_id: user.id, vendor_id: vendorId })
          .select("id")
          .single();
        if (createErr) throw createErr;
        conversationId = created.id;
      }

      // 3. go to Baatein with that conversation pre-opened
      navigate(`/chat?c=${conversationId}${mode === "call" ? "&call=audio" : ""}`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't open the conversation. Please try again.");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MessageCircle className="h-4 w-4" />
        Contact vendor
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-xl"
          >
            <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-widest text-rose-700/70">
              Reach {vendorName}
            </p>

            <button
              role="menuitem"
              disabled={!!busy}
              onClick={() => start("chat")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-rose-50 disabled:opacity-60"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 text-rose-700">
                {busy === "chat" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              </span>
              <span>
                <span className="block font-semibold text-neutral-900">Chat</span>
                <span className="block text-xs text-neutral-500">Message in Baatein, replies in &lt; 4 hrs</span>
              </span>
            </button>

            <button
              role="menuitem"
              disabled={!!busy}
              onClick={() => start("call")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-rose-50 disabled:opacity-60"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                {busy === "call" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
              </span>
              <span>
                <span className="block font-semibold text-neutral-900">Call</span>
                <span className="block text-xs text-neutral-500">Free in-app voice call, number stays private</span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}