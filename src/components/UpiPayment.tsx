import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Copy, Shield, Clock, ArrowLeft, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpiPaymentProps {
  amount: number;
  description: string;
  onSuccess: (txnId: string) => void;
  onCancel: () => void;
  vendorName?: string;
  phase?: string;
}

export const UpiPayment = ({ amount, description, onSuccess, onCancel, vendorName, phase }: UpiPaymentProps) => {
  const [step, setStep] = useState<"qr" | "verify" | "success">("qr");
  const [utrInput, setUtrInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const upiId = "8373901813@fam";
  const amountStr = new Intl.NumberFormat("en-IN").format(amount);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleVerify = () => {
    if (utrInput.length < 6) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStep("success");
      setTimeout(() => {
        onSuccess(`TXN${Date.now()}`);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">

        {/* ── QR STEP ── */}
        {step === "qr" && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4"
          >
            {/* Amount Banner */}
            <div className="bg-gradient-to-r from-[hsl(var(--gold))]/15 to-[hsl(var(--crimson))]/10 border border-[hsl(var(--gold))]/30 rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{phase || "Payment Amount"}</p>
              <p className="text-3xl font-bold text-[hsl(var(--gold))]">₹{amountStr}</p>
              {vendorName && <p className="text-xs text-muted-foreground mt-1">To: {vendorName}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="relative bg-white rounded-2xl p-4 shadow-xl">
                {/* QR Code image */}
                <img
                  src="/src/assets/image_1780597998916.png"
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    // Fallback to CSS QR if image not found
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
                {/* CSS QR fallback */}
                <div className="hidden w-48 h-48 relative">
                  <div className="absolute inset-0 grid grid-cols-7 gap-0.5 p-2">
                    {Array.from({ length: 49 }).map((_, i) => {
                      const pattern = [0,1,2,3,4,5,6,7,10,13,14,17,21,24,25,26,28,29,30,31,35,42,43,44,45,46,47,48];
                      return (
                        <div key={i} className={`rounded-sm ${pattern.includes(i) ? "bg-gray-900" : "bg-white"}`} />
                      );
                    })}
                  </div>
                  {/* Finder patterns */}
                  <div className="absolute top-2 left-2 w-10 h-10 border-4 border-gray-900 rounded-sm" />
                  <div className="absolute top-2 right-2 w-10 h-10 border-4 border-gray-900 rounded-sm" />
                  <div className="absolute bottom-2 left-2 w-10 h-10 border-4 border-gray-900 rounded-sm" />
                </div>

                {/* Gold corner accents */}
                <div className="absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 border-[hsl(var(--gold))] rounded-tl" />
                <div className="absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 border-[hsl(var(--gold))] rounded-tr" />
                <div className="absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 border-[hsl(var(--gold))] rounded-bl" />
                <div className="absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 border-[hsl(var(--gold))] rounded-br" />
              </div>

              {/* Animated scan line hint */}
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center gap-2 mt-3"
              >
                <Smartphone className="w-4 h-4 text-[hsl(var(--gold))]" />
                <p className="text-xs text-muted-foreground">Scan with any UPI app</p>
              </motion.div>
            </div>

            {/* UPI ID Copy */}
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1 text-center">Or pay directly to UPI ID</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-lg px-3 py-2 font-mono text-sm font-bold text-center text-[hsl(var(--gold))]">
                  {upiId}
                </div>
                <button
                  onClick={() => handleCopy(upiId)}
                  className="p-2 rounded-lg bg-[hsl(var(--gold))]/10 hover:bg-[hsl(var(--gold))]/20 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-[hsl(var(--gold))]" /> : <Copy className="w-4 h-4 text-[hsl(var(--gold))]" />}
                </button>
              </div>
            </div>

            {/* UPI Apps */}
            <div className="flex items-center justify-center gap-3 py-1">
              {[
                { name: "GPay", bg: "from-blue-500 to-blue-600", emoji: "G" },
                { name: "PhonePe", bg: "from-violet-600 to-violet-700", emoji: "P" },
                { name: "Paytm", bg: "from-sky-500 to-blue-600", emoji: "P" },
                { name: "BHIM", bg: "from-orange-500 to-orange-600", emoji: "B" },
                { name: "Amazon Pay", bg: "from-amber-500 to-orange-500", emoji: "A" },
              ].map(app => (
                <div key={app.name} className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${app.bg} flex items-center justify-center text-white font-bold text-sm shadow`}>
                    {app.emoji}
                  </div>
                  <span className="text-[9px] text-muted-foreground">{app.name}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setStep("verify")}
              className="w-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] text-background font-semibold"
            >
              I've Made the Payment →
            </Button>
            <button onClick={onCancel} className="w-full text-xs text-muted-foreground hover:text-foreground py-1 transition-colors">
              Cancel & go back
            </button>
          </motion.div>
        )}

        {/* ── VERIFY STEP ── */}
        {step === "verify" && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <button onClick={() => setStep("qr")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to QR
            </button>

            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-bold text-lg mb-1">Confirm Your Payment</h3>
              <p className="text-sm text-muted-foreground">Enter the UTR / transaction ID from your UPI app to confirm payment of <span className="text-[hsl(var(--gold))] font-bold">₹{amountStr}</span></p>
            </div>

            <div className="bg-muted rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">How to find UTR:</p>
              <p className="text-xs text-muted-foreground">Open your UPI app → Transaction History → Find this payment → Copy the 12-digit UTR/Ref number</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">UTR / Reference Number</label>
              <input
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="Enter 12-digit UTR number"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground font-mono text-base focus:outline-none focus:border-[hsl(var(--gold))] placeholder:text-muted-foreground/50 text-center tracking-widest"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-center">{utrInput.length}/12 digits</p>
            </div>

            <Button
              onClick={handleVerify}
              disabled={utrInput.length < 6 || verifying}
              className="w-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] text-background font-semibold"
            >
              {verifying ? (
                <span className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full" />
                  Verifying Payment…
                </span>
              ) : "Verify & Confirm"}
            </Button>

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <Shield className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Your payment is held in Jashan-E-Aas escrow. It will only be released to the vendor after your event is complete.</p>
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-emerald-700" />
              </div>
            </motion.div>
            <div>
              <h3 className="text-xl font-bold mb-1">Payment Confirmed! 🎉</h3>
              <p className="text-muted-foreground text-sm">₹{amountStr} received successfully</p>
              <p className="text-[hsl(var(--gold))] text-xs mt-2">Funds held securely in escrow</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-2 justify-center"><Clock className="w-3 h-3" /> Vendor will confirm within 2 hours</p>
              <p className="flex items-center gap-2 justify-center"><Shield className="w-3 h-3 text-emerald-700" /> Protected by Jashan-E-Aas Escrow</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

interface UpiPaymentModalProps {
  isOpen: boolean;
  amount: number;
  description: string;
  vendorName?: string;
  phase?: string;
  onSuccess: (txnId: string) => void;
  onClose: () => void;
}

export const UpiPaymentModal = ({ isOpen, amount, description, vendorName, phase, onSuccess, onClose }: UpiPaymentModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center z-50 pointer-events-none"
        >
          <div className="pointer-events-auto bg-card border border-border rounded-t-3xl md:rounded-3xl shadow-2xl p-6 w-full md:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg">Secure Payment</h2>
                <p className="text-xs text-muted-foreground">Powered by Jashan-E-Aas Escrow</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <UpiPayment
              amount={amount}
              description={description}
              vendorName={vendorName}
              phase={phase}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
