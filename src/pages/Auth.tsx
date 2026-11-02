import { useState } from "react";
import { DynamicBackground } from "@/components/DynamicBackground";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Eye, EyeOff, Mail, Lock, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"customer" | "vendor">("customer");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        toast({ title: "Welcome back!", description: "You've been signed in." });
        navigate(profile?.role === "vendor" ? "/vendor-dashboard" : "/");
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true,
            data: {
              full_name: name,
              role: selectedRole,
            },
          },
        });
        if (error) throw error;

        setOtp("");
        setStep("verify");
        toast({
          title: "Verification code sent",
          description: `Check your inbox for the code sent to ${email.trim()}.`,
        });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) {
      toast({
        title: "Enter a valid code",
        description: "The verification code must contain 6 digits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });
      if (error) throw error;

      toast({ title: "Email verified successfully!", description: "Welcome to Jashan-E-Aas." });
      navigate(selectedRole === "vendor" ? "/vendor-dashboard" : "/");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Verification failed";
      toast({ title: "Invalid or expired code", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = () => {
    setStep("signup");
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <DynamicBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-charcoal to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-crimson/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="font-bold text-xl text-background">ج</span>
            </div>
            <span className="text-xl font-bold">
              Jashan<span className="text-gold">-E-Aas</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {step === "verify" ? "Verify your email" : isLogin ? "Welcome back" : "Join Jashan-E-Aas"}
          </h1>
          <p className="text-muted-foreground">
            {step === "verify"
              ? "Enter the 6-digit code we sent to your email."
              : isLogin
                ? "Sign in to your account"
                : "Create your free account"}
          </p>

          {!isLogin && step === "signup" && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("customer")}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedRole === "customer"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-card text-muted-foreground hover:border-gold/50"
                }`}
              >
                <User className="mb-3 h-6 w-6" />
                <span className="block font-semibold">Customer</span>
                <span className="mt-1 block text-xs">Explore services and plan events</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("vendor")}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedRole === "vendor"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-card text-muted-foreground hover:border-gold/50"
                }`}
              >
                <Store className="mb-3 h-6 w-6" />
                <span className="block font-semibold">Vendor</span>
                <span className="mt-1 block text-xs">List services and manage events</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {step === "verify" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <Mail className="mx-auto mb-3 h-8 w-8 text-gold" />
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit verification code to{" "}
                  <strong className="text-foreground">{email}</strong>.
                </p>
              </div>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em]"
                required
              />
              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-background font-semibold h-12"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={changeEmail} disabled={loading}>
                Change email
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-background font-semibold h-12"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    {isLogin ? "Signing in..." : "Sending verification code..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {isLogin ? "Sign In" : "Create Account"}
                  </span>
                )}
              </Button>
            </form>
          )}

          {step === "signup" && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setStep("signup");
                    setOtp("");
                  }}
                  className="ml-1 text-gold hover:text-gold-light font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-muted-foreground hover:text-gold text-sm transition-colors">
            ← Back to Jashan-E-Aas
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
