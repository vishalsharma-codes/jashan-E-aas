import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  BadgeCheck, CalendarDays, Clapperboard, Clock, Images, Inbox, LayoutDashboard, Loader2, MapPin, MessageCircle,
  Package, ShieldCheck, Star, Store, Wallet, X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUnreadCount } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import {
  emptyProfile, gradientFor, initialsOf, priceLabel, profileChecklist,
  type VendorPrivate, type VendorProfileRow,
} from "@/lib/vendorOptions";
import { Card, Pill } from "@/components/vendorDashboard/Bits";
import { useVendorProfile, type SaveFn } from "@/components/vendorDashboard/useVendorProfile";
import { VendorProfileForm } from "@/components/vendorDashboard/VendorProfileForm";
import { BookingsPanel, OverviewPanel, PaymentsPanel, useBookings } from "@/components/vendorDashboard/BookingsPanel";
import { CalendarPanel, PackagesPanel, PortfolioPanel } from "@/components/vendorDashboard/ListingPanels";
import { MessagesPanel, ReelsPanel, ReviewsPanel } from "@/components/vendorDashboard/EngagementPanels";
import { SettingsPanel } from "@/components/vendorDashboard/SettingsPanel";
import { VendorProfileView } from "@/components/vendor/VendorProfileView";

type TabId = "overview" | "bookings" | "calendar" | "payments" | "profile" | "packages" | "portfolio" | "jhalak" | "baatein" | "reviews" | "settings";

const TABS: { id: TabId; label: string; icon: ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Booking requests", icon: Inbox },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "payments", label: "Payments", icon: Wallet },
  { id: "profile", label: "Business profile", icon: Store },
  { id: "packages", label: "Packages", icon: Package },
  { id: "portfolio", label: "Portfolio", icon: Images },
  { id: "jhalak", label: "My Jhalaks", icon: Clapperboard },
  { id: "baatein", label: "Baatein", icon: MessageCircle },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "settings", label: "Payouts and verification", icon: ShieldCheck },
];

const Centered = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="flex min-h-screen items-center justify-center px-4 pt-20">{children}</main>
  </div>
);

/* ───────── Gate: sign-in, role, onboarding ───────── */

export default function VendorDashboard() {
  const auth = useAuth() as { user: any; loading?: boolean; isLoading?: boolean };
  const user = auth.user;
  const authLoading = auth.loading ?? auth.isLoading ?? false;
  const { toast } = useToast();
  const [role, setRole] = useState<string | null | undefined>(undefined);
  const [switching, setSwitching] = useState(false);

  const displayName = (user?.user_metadata?.name as string) || (user?.user_metadata?.full_name as string) || "";
  const { profile, priv, loading, save } = useVendorProfile(user?.id, displayName);

  useEffect(() => {
    if (!user) { setRole(undefined); return; }
    let off = false;
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!off) setRole(data?.role ?? user.user_metadata?.role ?? null);
    });
    return () => { off = true; };
  }, [user?.id]);

  const becomeVendor = async () => {
    setSwitching(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, role: "vendor" }, { onConflict: "id" });
    if (!error) await supabase.auth.updateUser({ data: { role: "vendor" } });
    setSwitching(false);
    if (error) toast({ title: "Could not switch your account", description: error.message, variant: "destructive" });
    else setRole("vendor");
  };

  if (authLoading || (user && (role === undefined || loading))) {
    return <Centered><Loader2 className="h-8 w-8 animate-spin text-gold" aria-label="Loading" /></Centered>;
  }
  if (!user) return <Navigate to="/auth" replace state={{ from: "/vendor-dashboard" }} />;

  if (role !== "vendor") {
    return (
      <Centered>
        <Card className="max-w-md text-center">
          <Store className="mx-auto mb-3 h-10 w-10 text-gold" />
          <h1 className="font-serif text-2xl font-bold">This area is for vendors</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account is set up as a customer. Switch it to a vendor account to list your services and receive bookings.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button disabled={switching} onClick={becomeVendor} className="bg-gold font-semibold text-background hover:bg-gold-dark">Switch to a vendor account</Button>
            <Button variant="outline" asChild><Link to="/">Back to home</Link></Button>
          </div>
        </Card>
      </Centered>
    );
  }

  if (!profile || !profile.onboarded) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pb-16 pt-28">
          <div className="container mx-auto max-w-3xl px-4">
            <h1 className="font-serif text-3xl font-bold">Set up your vendor profile</h1>
            <p className="mb-8 mt-1 text-muted-foreground">Five short steps. Customers see this information on your vendor card, profile and the compare page.</p>
            <VendorProfileForm
              wizard userId={user.id} profile={profile ?? emptyProfile(user.id, displayName)} priv={priv} save={save}
              sections={["business", "services", "location", "pricing", "contact"]}
              onFinished={async () => {
                const { error } = await save({ onboarded: true });
                if (error) toast({ title: "Could not finish setup", description: error.message, variant: "destructive" });
                else toast({ title: "Profile created", description: "Add portfolio photos, then submit for review." });
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return <Dashboard userId={user.id} profile={profile} priv={priv} save={save} />;
}

/* ───────── The dashboard ───────── */

const STATUS_COPY: Record<VendorProfileRow["status"], string> = {
  draft: "Only you can see your profile. Finish the required items, then submit it for review.",
  pending_review: "Our team is reviewing your profile. This usually takes one to two working days.",
  approved: "Your profile is live. Customers can find and book you.",
  rejected: "Your profile needs changes. Update it and submit again.",
};

function Dashboard({ userId, profile, priv, save }: { userId: string; profile: VendorProfileRow; priv: VendorPrivate; save: SaveFn }) {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "overview") as TabId;
  const go = useCallback((id: string) => setParams({ tab: id }), [setParams]);

  const { rows: bookings, loading: bookingsLoading, update } = useBookings(userId);
  const unread = useUnreadCount();
  const [counts, setCounts] = useState({ portfolio: 0, packages: 0, docs: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const refreshCounts = useCallback(async () => {
    const q = (t: string) => supabase.from(t).select("id", { count: "exact", head: true }).eq("vendor_id", userId);
    const [a, b, c] = await Promise.all([q("vendor_portfolio"), q("vendor_packages"), q("vendor_documents")]);
    setCounts({ portfolio: a.count ?? 0, packages: b.count ?? 0, docs: c.count ?? 0 });
  }, [userId]);
  useEffect(() => { void refreshCounts(); }, [refreshCounts, tab]);

  // close the preview with Escape
  useEffect(() => {
    if (!preview) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setPreview(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [preview]);

  const checklist = useMemo(() => profileChecklist(profile, priv, counts), [profile, priv, counts]);
  const requiredDone = checklist.filter((c) => c.required).every((c) => c.done);
  const percent = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
  const pending = bookings.filter((b) => b.status === "pending").length;

  const submit = async () => {
    setSubmitting(true);
    const { error } = await save({ status: "pending_review" });
    setSubmitting(false);
    if (error) toast({ title: "Could not submit", description: error.message, variant: "destructive" });
    else toast({ title: "Submitted for review", description: "We will email you once it is approved." });
  };

  const badge = (id: TabId) => id === "bookings" ? pending : id === "baatein" ? unread : 0;

  const panel = (() => {
    switch (tab) {
      case "overview": return <OverviewPanel profile={profile} priv={priv} bookings={bookings} checklist={checklist} go={go} />;
      case "bookings": return <BookingsPanel bookings={bookings} loading={bookingsLoading} update={update} openChat={() => go("baatein")} />;
      case "calendar": return <CalendarPanel userId={userId} minNotice={profile.min_notice_days} />;
      case "payments": return <PaymentsPanel bookings={bookings} priv={priv} go={go} />;
      case "profile": return (
        <div className="space-y-5">
          <PreviewCard p={profile} onOpen={() => setPreview(true)} />
          <VendorProfileForm userId={userId} profile={profile} priv={priv} save={save} sections={["business", "services", "location", "pricing"]} />
        </div>
      );
      case "packages": return <PackagesPanel userId={userId} />;
      case "portfolio": return <PortfolioPanel userId={userId} />;
      case "jhalak": return <ReelsPanel userId={userId} />;
      case "baatein": return <MessagesPanel userId={userId} />;
      case "reviews": return <ReviewsPanel userId={userId} rating={profile.rating} count={profile.reviews_count} />;
      case "settings": return <SettingsPanel userId={userId} profile={profile} priv={priv} save={save} onDocsChange={refreshCounts} />;
    }
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pb-16 pt-24">
        <div className="container mx-auto px-4">
          {/* header */}
          <header className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              {profile.logo_url
                ? <img src={profile.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                : <span className={`grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${gradientFor(userId)} text-lg font-bold text-white`}>{initialsOf(profile.business_name)}</span>}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate font-serif text-2xl font-bold">{profile.business_name}</h1>
                  {profile.verification_status === "verified" && <Pill tone="green"><BadgeCheck className="mr-1 h-3.5 w-3.5" />Verified</Pill>}
                  <Pill tone={profile.status === "approved" ? "green" : profile.status === "pending_review" ? "amber" : profile.status === "rejected" ? "red" : "grey"}>
                    {profile.status === "approved" ? "Live" : profile.status === "pending_review" ? "In review" : profile.status === "rejected" ? "Changes needed" : "Draft"}
                  </Pill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{STATUS_COPY[profile.status]}</p>
              </div>
              {(profile.status === "draft" || profile.status === "rejected") && (
                <Button disabled={!requiredDone || submitting} onClick={submit} className="bg-gold font-semibold text-background hover:bg-gold-dark">Submit for review</Button>
              )}
              {profile.status === "approved" && <Button variant="outline" asChild><Link to={`/vendors?vendor=${userId}`}>View public profile</Link></Button>}
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Profile {percent}% complete{!requiredDone && " · required items are missing"}</span>
                {!requiredDone && <button type="button" onClick={() => go("overview")} className="text-gold underline">See what is left</button>}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
            <nav aria-label="Vendor dashboard" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:sticky lg:top-24 lg:mx-0 lg:h-fit lg:flex-col lg:overflow-visible lg:px-0">
              {TABS.map(({ id, label, icon: Icon }) => {
                const n = badge(id);
                return (
                  <button key={id} type="button" onClick={() => go(id)} aria-current={tab === id ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${tab === id ? "bg-gold text-background" : "text-muted-foreground hover:bg-gold/10 hover:text-foreground"}`}>
                    <Icon className="h-4 w-4" />
                    {label}
                    {n > 0 && <span className={`ml-auto min-w-[20px] rounded-full px-1.5 text-center text-[11px] font-semibold ${tab === id ? "bg-background text-gold" : "bg-gold text-background"}`}>{n > 99 ? "99+" : n}</span>}
                  </button>
                );
              })}
            </nav>
            <div className="min-w-0">{panel}</div>
          </div>
        </div>
      </main>

      {/* full customer-view preview */}
      {preview && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-background" role="dialog" aria-label="Customer view of your profile">
          <div className="container mx-auto max-w-5xl px-4 py-6">
            <button type="button" onClick={() => setPreview(false)} className="mb-4 inline-flex items-center gap-2 text-sm text-gold">
              <X className="h-4 w-4" />Close preview
            </button>
            <VendorProfileView profile={profile} onBook={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── How customers see your card ───────── */

function PreviewCard({ p, onOpen }: { p: VendorProfileRow; onOpen: () => void }) {
  return (
    <Card title="How customers see you" subtitle="Updates when you save."
      action={<Button size="sm" variant="outline" onClick={onOpen}>Preview full profile</Button>}>
      <div className="flex gap-4 rounded-2xl border border-border bg-background p-4">
        <div className="flex gap-1">
          {(p.cover_urls.length ? p.cover_urls : [""]).slice(0, 3).map((u, i) => (
            u ? <img key={u} src={u} alt="" className="h-20 w-14 rounded-lg object-cover" />
              : <span key={i} className={`h-20 w-14 rounded-lg bg-gradient-to-br ${gradientFor(p.user_id)}`} />
          ))}
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate font-bold">{p.business_name || "Your business name"}</p>
          <p className="truncate text-muted-foreground">{p.category || "Your service"}</p>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" />{p.reviews_count ? p.rating.toFixed(1) : "New"}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.home_city || "City"}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.response_time}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">{p.tags.map((t) => <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{t}</span>)}</div>
          <p className="mt-1.5 font-bold text-gold">{priceLabel(p.price_min, p.price_max, p.price_unit)}</p>
        </div>
      </div>
    </Card>
  );
}