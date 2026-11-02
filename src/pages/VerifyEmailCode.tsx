import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client"; // use the same client import as the rest of your app

type Props = {
  email: string;
  /** "signup" after supabase.auth.signUp, "email" after supabase.auth.signInWithOtp */
  type?: "signup" | "email";
  onVerified: () => void;      // e.g. () => navigate("/", { replace: true })
  onChangeEmail: () => void;   // go back to the form
};

export function VerifyEmailCode({ email, type = "signup", onVerified, onChangeEmail }: Props) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(60); // the first email was just sent

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async (value: string) => {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: value, type });
    setBusy(false);
    if (error) {
      setCode("");
      toast({ title: "Wrong or expired code", description: "Use the newest email, or request a new code.", variant: "destructive" });
      return;
    }
    onVerified(); // the user is now signed in
  };

  const resend = async () => {
    if (cooldown > 0) return;
    const { error } =
      type === "signup"
        ? await supabase.auth.resend({ type: "signup", email })
        : await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) {
      toast({ title: "Could not send a new code", description: "Please wait a minute and try again.", variant: "destructive" });
      return;
    }
    setCooldown(60);
    toast({ title: "New code sent", description: "Check your inbox and spam folder." });
  };

  return (
    <div className="space-y-4 text-center">
      <Mail className="mx-auto h-8 w-8 text-primary" />
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit verification code to <b className="text-foreground">{email}</b>.
      </p>
      <Input
        value={code} inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
        placeholder="Enter 6-digit code" className="text-center text-lg tracking-[0.5em]"
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 6);
          setCode(v);
          if (v.length === 6) verify(v); // submits by itself when the 6th digit is typed
        }}
      />
      <Button className="w-full" disabled={code.length !== 6 || busy} onClick={() => verify(code)}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Verify &amp; Continue
      </Button>
      <div className="flex items-center justify-center gap-4 text-sm">
        <button type="button" onClick={resend} disabled={cooldown > 0} className="text-primary disabled:text-muted-foreground">
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <button type="button" onClick={onChangeEmail}>Change email</button>
      </div>
    </div>
  );
}