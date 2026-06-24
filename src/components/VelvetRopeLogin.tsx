import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface VelvetRopeLoginProps {
  onClose: () => void;
}

type Phase = "closed" | "opening" | "open";

const CurtainHalf = ({ side, phase }: { side: "left" | "right"; phase: Phase }) => {
  const isLeft = side === "left";
  const openX = isLeft ? "-100%" : "100%";

  return (
    <motion.div
      className="absolute top-0 h-full overflow-hidden"
      style={{
        width: "51%",
        [isLeft ? "left" : "right"]: 0,
        zIndex: 2,
      }}
      animate={{ x: phase === "open" ? openX : "0%" }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: phase === "open" ? 0.05 : 0 }}
    >
      {/* Main velvet fabric */}
      <div
        className="w-full h-full relative"
        style={{
          background: isLeft
            ? "linear-gradient(to right, #5c0810 0%, #8b0a1a 25%, #c41230 55%, #a01020 75%, #700a14 100%)"
            : "linear-gradient(to left,  #5c0810 0%, #8b0a1a 25%, #c41230 55%, #a01020 75%, #700a14 100%)",
        }}
      >
        {/* Sequin shimmer diagonal pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                ${isLeft ? "130deg" : "50deg"},
                transparent 0px, transparent 5px,
                rgba(212,160,23,0.13) 5px, rgba(212,160,23,0.13) 6px
              ),
              repeating-linear-gradient(
                ${isLeft ? "50deg" : "130deg"},
                transparent 0px, transparent 9px,
                rgba(255,215,0,0.06) 9px, rgba(255,215,0,0.06) 10px
              )
            `,
          }}
        />

        {/* Vertical fold highlights */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full"
            style={{
              left: `${(i + 1) * 14}%`,
              width: "1px",
              background:
                i % 2 === 0
                  ? "linear-gradient(to bottom, rgba(255,215,0,0.22), rgba(255,215,0,0.06), rgba(255,215,0,0.22))"
                  : "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.08), rgba(0,0,0,0.3))",
            }}
          />
        ))}

        {/* Top swag curve */}
        <svg
          className="absolute top-0 w-full"
          height="60"
          viewBox="0 0 300 60"
          preserveAspectRatio="none"
          style={{ transform: isLeft ? "scaleX(1)" : "scaleX(-1)" }}
        >
          <path
            d="M0,0 Q40,50 90,20 Q140,0 180,40 Q220,65 260,20 Q280,5 300,30 L300,0 Z"
            fill="#6b0612"
            opacity="0.75"
          />
          <path
            d="M0,0 Q40,50 90,20 Q140,0 180,40 Q220,65 260,20 Q280,5 300,30"
            stroke="rgba(212,160,23,0.55)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Gold sparkle dots */}
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              left: `${8 + (i * 19) % 80}%`,
              top: `${8 + (i * 29) % 78}%`,
              background: i % 4 === 0 ? "#ffd700" : i % 2 === 0 ? "#fff5cc" : "#d4a017",
            }}
            animate={{ opacity: [0.2, 1, 0.3, 0.9, 0.2], scale: [0.8, 1.5, 0.9, 1.3, 0.8] }}
            transition={{ duration: 1.4 + (i % 3) * 0.3, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}

        {/* Inner edge border */}
        <div
          className="absolute top-0 h-full w-1.5"
          style={{
            [isLeft ? "right" : "left"]: 0,
            background: "linear-gradient(to bottom, #ffd700, #a07820, #ffd700, #a07820, #ffd700)",
          }}
        />

        {/* Bottom gold hem + fringe */}
        <div className="absolute bottom-0 w-full">
          <div
            className="w-full h-2.5"
            style={{ background: "linear-gradient(to right, #a07820, #ffd700, #e8c84a, #ffd700, #a07820)" }}
          />
          <div className="flex justify-around px-1">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="rounded-b-full"
                style={{
                  width: 2,
                  height: 10 + (i % 4) * 3,
                  background: "linear-gradient(to bottom, #d4a017, #8a6010)",
                  opacity: 0.9,
                }}
                animate={{ rotate: [0, (i % 2 === 0 ? 1.5 : -1.5), 0] }}
                transition={{ duration: 2.2 + (i % 3) * 0.3, repeat: Infinity, delay: i * 0.06 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tie-back knot when open */}
      {phase === "open" && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65, type: "spring", stiffness: 220 }}
          className="absolute"
          style={{ [isLeft ? "right" : "left"]: "-18px", top: "42%" }}
        >
          <div
            className="w-9 h-9 rounded-full shadow-xl border border-gold/50 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #9a1020, #5c0810)" }}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: "radial-gradient(circle, #ffd700 30%, #a07820 100%)" }}
            />
          </div>
          <div className="flex gap-0.5 justify-center mt-0.5">
            {[...Array(6)].map((_, j) => (
              <div
                key={j}
                style={{ width: 2, height: 8 + (j % 3) * 3, background: "linear-gradient(to bottom, #d4a017, #8a6010)", borderRadius: "0 0 9px 9px" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export const VelvetRopeLogin = ({ onClose }: VelvetRopeLoginProps) => {
  const [phase, setPhase] = useState<Phase>("closed");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setPhase("opening"), 60);
    const t2 = setTimeout(() => setPhase("open"), 180);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const handleClose = () => {
    setPhase("closed");
    setTimeout(onClose, 750);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You've entered Jashan-E-Aas." });
        handleClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: "Welcome to Jashan-E-Aas." });
        handleClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Full-screen dark backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(5,1,2,0.82)", backdropFilter: "blur(4px)" }}
      />

      {/* ── CENTRE STAGE BOX ──────────────────────────── */}
      <div
        onClick={e => e.stopPropagation()}
        className="relative z-10 flex flex-col"
        style={{ width: 520, maxWidth: "92vw" }}
      >
        {/* Gold valance rail at top of stage */}
        <div
          className="relative flex-shrink-0"
          style={{
            height: 18,
            background: "linear-gradient(to bottom, #7a5c00, #ffd700 40%, #a07820)",
            borderRadius: "8px 8px 0 0",
            boxShadow: "0 2px 14px rgba(212,160,23,0.5)",
          }}
        >
          {/* Rail rings */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1 w-2.5 h-2.5 rounded-full border"
              style={{
                left: `${(i + 1) * 9}%`,
                borderColor: "#5c3d00",
                background: "linear-gradient(135deg, #ffd700, #a07820)",
              }}
            />
          ))}
        </div>

        {/* Curtain + content area */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            height: isLogin ? 380 : 440,
            transition: "height 0.3s ease",
            background: "#0d0205",
          }}
        >
          {/* Left curtain */}
          <CurtainHalf side="left" phase={phase} />
          {/* Right curtain */}
          <CurtainHalf side="right" phase={phase} />

          {/* Center seam when closed */}
          <AnimatePresence>
            {phase !== "open" && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-y-0 z-10"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 2,
                  background: "linear-gradient(to bottom, #ffd700, rgba(212,160,23,0.2))",
                }}
              />
            )}
          </AnimatePresence>

          {/* Login form — slides up after curtains open */}
          <AnimatePresence>
            {phase === "open" && (
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center z-20 px-8"
              >
                <div className="w-full">
                  {/* Logo + heading */}
                  <div className="text-center mb-5">
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.65, type: "spring", stiffness: 220 }}
                      className="w-12 h-12 rounded-full mx-auto mb-2.5 flex items-center justify-center shadow-lg"
                      style={{ background: "linear-gradient(135deg, #d4a017, #a07820)" }}
                    >
                      <span className="text-xl font-bold text-background font-display">ج</span>
                    </motion.div>
                    <h2 className="text-lg font-bold text-foreground font-display">
                      {isLogin ? "Welcome Back" : "Join Jashan-E-Aas"}
                    </h2>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {isLogin ? "Sign in to your account" : "Create your free account today"}
                    </p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-3">
                    {!isLogin && (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input placeholder="Full Name" value={name}
                          onChange={e => setName(e.target.value)}
                          className="pl-9 h-9 text-sm bg-card/40 border-border/50 focus:border-gold/60"
                          required={!isLogin} />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input type="email" placeholder="Email address" value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-9 h-9 text-sm bg-card/40 border-border/50 focus:border-gold/60"
                        required />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input type={showPassword ? "text" : "password"} placeholder="Password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        className="pl-9 pr-9 h-9 text-sm bg-card/40 border-border/50 focus:border-gold/60"
                        required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-9 font-semibold text-sm"
                      style={{ background: "linear-gradient(90deg, #c49a20, #e8c84a, #c49a20)", color: "#0d0205" }}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                          {isLogin ? "Signing in…" : "Creating…"}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          {isLogin ? "Sign In" : "Create Account"}
                        </span>
                      )}
                    </Button>
                  </form>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">
                      {isLogin ? "New here?" : "Have an account?"}
                      {" "}
                      <button type="button" onClick={() => setIsLogin(!isLogin)}
                        className="text-gold hover:text-gold-light font-medium transition-colors">
                        {isLogin ? "Sign up" : "Sign in"}
                      </button>
                    </p>
                    <button type="button"
                      onClick={() => { handleClose(); navigate("/auth"); }}
                      className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      Full page →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom gold base strip */}
        <div
          className="flex-shrink-0"
          style={{
            height: 10,
            background: "linear-gradient(to top, #5c3d00, #a07820 60%, #ffd700)",
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          }}
        />

        {/* Close button outside the stage box */}
        <button
          onClick={handleClose}
          className="absolute -top-8 right-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
