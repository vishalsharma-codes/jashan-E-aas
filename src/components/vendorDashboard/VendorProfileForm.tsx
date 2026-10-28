import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CANCELLATION_PRESETS, CITY_OPTIONS, EVENT_TYPE_OPTIONS, LANGUAGE_OPTIONS, PRICE_UNITS, RESPONSE_TIMES,
  SERVICE_GROUPS, inr, type VendorPrivate, type VendorProfileRow,
} from "@/lib/vendorOptions";
import { Card, ChipPicker, Field, FilePick, Select, TextArea, uploadTo } from "./Bits";
import type { SaveFn } from "./useVendorProfile";

export type SectionId = "business" | "services" | "location" | "pricing" | "contact";

const TITLES: Record<SectionId, { title: string; sub: string; step: string }> = {
  business: { title: "About your business", sub: "This is the first thing customers see on your card and profile.", step: "Business" },
  services: { title: "What you offer", sub: "Pick your category and the events you work at, so you show up in the right searches.", step: "Services" },
  location: { title: "Where you work", sub: "Customers filter vendors by city.", step: "Location" },
  pricing: { title: "Pricing and availability", sub: "Your starting price appears on cards. The final quote is always agreed with the customer.", step: "Pricing" },
  contact: { title: "Contact and payouts", sub: "Private. Customers never see this, and chat keeps deals on the platform.", step: "Payouts" },
};

interface Props {
  userId: string;
  profile: VendorProfileRow;
  priv: VendorPrivate;
  save: SaveFn;
  sections: SectionId[];
  wizard?: boolean;
  onFinished?: () => void;
}

export function VendorProfileForm({ userId, profile, priv, save, sections, wizard, onFinished }: Props) {
  const { toast } = useToast();
  const [f, setF] = useState<VendorProfileRow>(profile);
  const [p, setP] = useState<VendorPrivate>(priv);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [otherService, setOtherService] = useState(() => {
    const g = SERVICE_GROUPS.find((x) => x.id === profile.category_id);
    return !!profile.category && !g?.services.includes(profile.category);
  });

  const set = <K extends keyof VendorProfileRow>(k: K, v: VendorProfileRow[K]) => setF((x) => ({ ...x, [k]: v }));
  const setPv = <K extends keyof VendorPrivate>(k: K, v: VendorPrivate[K]) => setP((x) => ({ ...x, [k]: v }));
  const num = (v: string) => Math.max(0, Number(v.replace(/[^\d]/g, "")) || 0);

  const group = SERVICE_GROUPS.find((g) => g.id === f.category_id) ?? SERVICE_GROUPS[0];
  const perGuest = /plate|person|head|guest/i.test(String(f.price_unit));

  const problem = (id: SectionId): string | null => {
    if (id === "business") {
      if (f.business_name.trim().length < 2) return "Add your business name.";
      if (f.description.trim().length < 40) return "Write a description of at least 40 characters.";
    }
    if (id === "services") {
      if (!f.category.trim()) return "Choose or type your service.";
      if (!f.event_types.length) return "Pick at least one event type.";
    }
    if (id === "location") {
      if (!f.home_city) return "Choose your home city.";
      if (!f.cities.length) return "Pick at least one city you serve.";
    }
    if (id === "pricing") {
      if (f.price_min <= 0) return "Enter your starting price.";
      if (f.price_max < f.price_min) return "Maximum price must be at least your starting price.";
      if (f.min_guests && f.max_guests && f.max_guests < f.min_guests) return "Maximum guests must be at least the minimum guests.";
      if (perGuest && !f.max_guests) return "Enter the maximum number of guests you can handle.";
    }
    if (id === "contact") {
      if (p.phone.replace(/\D/g, "").length < 10) return "Enter a 10-digit phone number.";
      if (!p.upi_id.includes("@")) return "Enter a valid UPI ID, like name@bank.";
    }
    return null;
  };

  const persist = async (ids: SectionId[], extra: Partial<VendorProfileRow> = {}) => {
    for (const id of ids) {
      const msg = problem(id);
      if (msg) { toast({ title: msg, variant: "destructive" }); return false; }
    }
    setSaving(true);
    // status / verification / onboarded are managed by the dashboard, so a stale form copy never overwrites them
    const { status: _s, verification_status: _v, onboarded: _o, rating: _r, reviews_count: _c, user_id: _u, ...fields } = f;
    const { error } = await save({ ...fields, ...extra }, sections.includes("contact") ? p : undefined);
    setSaving(false);
    if (error) { toast({ title: "Could not save", description: error.message, variant: "destructive" }); return false; }
    return true;
  };

  const upload = async (key: string, files: File[], then: (urls: string[]) => void) => {
    setBusy(key);
    try {
      const big = files.find((x) => x.size > 5 * 1024 * 1024);
      if (big) throw new Error(`${big.name} is over 5 MB.`);
      const done = await Promise.all(files.map((x) => uploadTo("vendor-media", userId, key, x)));
      then(done.map((d) => d.url));
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    setBusy("");
  };

  /* ───────── sections ───────── */

  const renderSection = (id: SectionId) => {
    switch (id) {
      case "business":
        return (
          <div className="space-y-5">
            <Field label="Business name" required>
              <Input value={f.business_name} onChange={(e) => set("business_name", e.target.value)} placeholder="Royal Celebrations" maxLength={60} />
            </Field>
            <Field label="Tagline" hint="One line under your name. For example: Luxury beach and destination weddings.">
              <Input value={f.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={90} />
            </Field>
            <Field label="Description" required hint={`${f.description.length}/600. Shown on your profile. Do not add phone numbers or links.`}>
              <TextArea value={f.description} onChange={(v) => set("description", v)} maxLength={600}
                placeholder="Tell customers who you are, what you are known for, and what a booking with you looks like." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Years of experience"><Input inputMode="numeric" value={f.years_experience || ""} onChange={(e) => set("years_experience", num(e.target.value))} /></Field>
              <Field label="Events completed" hint="Shown as “842+”."><Input inputMode="numeric" value={f.events_completed || ""} onChange={(e) => set("events_completed", num(e.target.value))} /></Field>
              <Field label="Team size"><Input inputMode="numeric" value={f.team_size || ""} onChange={(e) => set("team_size", num(e.target.value))} /></Field>
            </div>
            <Field label="Logo" hint="Square image, under 5 MB. Without a logo we show your initials.">
              <div className="flex items-center gap-3">
                {f.logo_url && <img src={f.logo_url} alt="Logo" className="h-14 w-14 rounded-xl object-cover" />}
                <FilePick label={f.logo_url ? "Replace logo" : "Upload logo"} busy={busy === "logo"} onFiles={(fs) => upload("logo", fs.slice(0, 1), ([u]) => set("logo_url", u))} />
              </div>
            </Field>
            <Field label="Cover images" hint="Up to 3. The compare page shows all three side by side.">
              <div className="flex flex-wrap items-center gap-3">
                {f.cover_urls.map((u) => (
                  <div key={u} className="relative">
                    <img src={u} alt="Cover" className="h-16 w-24 rounded-lg object-cover" />
                    <button type="button" aria-label="Remove cover" onClick={() => set("cover_urls", f.cover_urls.filter((x) => x !== u))}
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {f.cover_urls.length < 3 && (
                  <FilePick label="Add cover" multiple busy={busy === "cover"}
                    onFiles={(fs) => upload("cover", fs.slice(0, 3 - f.cover_urls.length), (urls) => set("cover_urls", [...f.cover_urls, ...urls]))} />
                )}
              </div>
            </Field>
          </div>
        );

      case "services":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event group" required hint="Customers booking this kind of event are shown your profile.">
                <Select value={f.category_id} onChange={(v) => { set("category_id", v); set("category", ""); setOtherService(false); }}
                  options={SERVICE_GROUPS.map((g) => ({ value: g.id, label: g.label }))} />
              </Field>
              <Field label="Your service" required>
                <Select value={otherService ? "__other" : f.category} placeholder="Choose a service"
                  onChange={(v) => { if (v === "__other") { setOtherService(true); set("category", ""); } else { setOtherService(false); set("category", v); } }}
                  options={[...group.services, { value: "__other", label: "Other (type your own)" }]} />
              </Field>
            </div>
            {otherService && (
              <Field label="Type your service"><Input value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Puppet show artist" /></Field>
            )}
            <Field label="Speciality line" hint="Optional. For example: Bridal, Full planning, Cinematic films.">
              <Input value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)} maxLength={50} />
            </Field>
            <Field label="Events you work at" required><ChipPicker options={EVENT_TYPE_OPTIONS} value={f.event_types} onChange={(v) => set("event_types", v)} /></Field>
            <Field label="Specialties" hint="Shown on your profile and compare page. For example: Mandap Design, Drone Coverage.">
              <ChipPicker value={f.specialties} onChange={(v) => set("specialties", v)} allowCustom max={8} />
            </Field>
            <Field label="Card tags" hint="Up to 3 short tags on your vendor card. For example: Luxury, Florals.">
              <ChipPicker value={f.tags} onChange={(v) => set("tags", v)} allowCustom max={3} />
            </Field>
            <Field label="Languages you work in"><ChipPicker options={LANGUAGE_OPTIONS} value={f.languages} onChange={(v) => set("languages", v)} /></Field>
          </div>
        );

      case "location":
        return (
          <div className="space-y-5">
            <Field label="Home city" required>
              <Select value={f.home_city} placeholder="Choose your city" options={CITY_OPTIONS}
                onChange={(v) => { set("home_city", v); if (v && !f.cities.includes(v)) set("cities", [v, ...f.cities]); }} />
            </Field>
            <Field label="Cities you serve" required hint="Include your home city. Add any other city, or type “Pan-India”.">
              <ChipPicker options={CITY_OPTIONS.slice(0, 12)} value={f.cities} onChange={(v) => set("cities", v)} allowCustom />
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/50 p-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-gold" checked={f.travels_for_destination} onChange={(e) => set("travels_for_destination", e.target.checked)} />
              <span>I travel for destination events outside my listed cities.</span>
            </label>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price is" required>
                <Select value={f.price_unit} onChange={(v) => set("price_unit", v as any)} options={PRICE_UNITS.map((u) => ({ value: u.value, label: u.label }))} />
              </Field>
              <Field label="Starting price (₹)" required><Input inputMode="numeric" value={f.price_min || ""} onChange={(e) => set("price_min", num(e.target.value))} placeholder="80000" /></Field>
              <Field label="Maximum price (₹)" required><Input inputMode="numeric" value={f.price_max || ""} onChange={(e) => set("price_max", num(e.target.value))} placeholder="500000" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Maximum guests you can handle" required={perGuest}
                hint="A vendor who handles up to 1000 guests is also shown to customers searching for 200.">
                <Input inputMode="numeric" value={f.max_guests || ""} onChange={(e) => set("max_guests", num(e.target.value))} placeholder="1000" />
              </Field>
              <Field label="Minimum guests (optional)" hint="Leave empty if you take any size.">
                <Input inputMode="numeric" value={f.min_guests || ""} onChange={(e) => set("min_guests", num(e.target.value))} placeholder="50" />
              </Field>
            </div>
            {perGuest && (
              <p className="rounded-xl bg-gold/10 px-4 py-3 text-sm">
                Your price is <b>per guest</b>, so customers see the total grow with their guest count.
                For example, 200 guests at your starting price is <b>₹{inr(f.price_min * 200)}</b> and 500 guests is <b>₹{inr(f.price_min * 500)}</b>. Enter the amount for <b>one</b> guest (like 800), not the whole event.
              </p>
            )}
            {f.price_min > 0 && (
              <p className="rounded-xl bg-gold/10 px-4 py-3 text-sm">
                Customers pay a 15% token to book you. At your starting price that is{" "}
                <b>₹{inr(f.price_min * (perGuest ? Math.max(f.min_guests, 1) : 1) * 0.15)}</b>
                {perGuest ? ` for ${Math.max(f.min_guests, 1)} guest${f.min_guests > 1 ? "s" : ""}` : " per event day"}, held in escrow.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Reply time" hint="How fast you usually answer a new request.">
                <Select value={f.response_time} onChange={(v) => set("response_time", v)} options={RESPONSE_TIMES} />
              </Field>
              <Field label="Minimum notice (days)" hint="The fewest days before an event you accept bookings.">
                <Input inputMode="numeric" value={f.min_notice_days || ""} onChange={(e) => set("min_notice_days", num(e.target.value))} />
              </Field>
            </div>
            <Field label="Cancellation policy">
              <div className="mb-2 flex flex-wrap gap-2">
                {CANCELLATION_PRESETS.map((c) => (
                  <button key={c} type="button" onClick={() => set("cancellation_policy", c)}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs hover:border-gold/60">{c.split(":")[0]}</button>
                ))}
              </div>
              <TextArea rows={3} value={f.cancellation_policy} onChange={(v) => set("cancellation_policy", v)} placeholder="Explain what happens if a customer cancels." />
            </Field>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone number" required hint="Used for booking alerts and verification.">
                <Input inputMode="tel" value={p.phone} onChange={(e) => setPv("phone", e.target.value)} placeholder="98XXXXXXXX" />
              </Field>
              <Field label="WhatsApp number"><Input inputMode="tel" value={p.whatsapp} onChange={(e) => setPv("whatsapp", e.target.value)} /></Field>
              <Field label="Email for alerts"><Input type="email" value={p.contact_email} onChange={(e) => setPv("contact_email", e.target.value)} /></Field>
              <Field label="Instagram"><Input value={p.instagram} onChange={(e) => setPv("instagram", e.target.value)} placeholder="@yourbrand" /></Field>
              <Field label="Website"><Input value={p.website} onChange={(e) => setPv("website", e.target.value)} /></Field>
              <Field label="Business type">
                <Select value={p.business_type} onChange={(v) => setPv("business_type", v)}
                  options={[{ value: "individual", label: "Individual or freelancer" }, { value: "proprietorship", label: "Proprietorship" }, { value: "partnership", label: "Partnership" }, { value: "company", label: "Private limited company" }]} />
              </Field>
              <Field label="GST number" hint="Optional."><Input value={p.gst_number} onChange={(e) => setPv("gst_number", e.target.value.toUpperCase())} maxLength={15} /></Field>
            </div>
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
              <p className="mb-3 text-sm font-semibold">Where we send your money</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="UPI ID" required><Input value={p.upi_id} onChange={(e) => setPv("upi_id", e.target.value.trim())} placeholder="name@okbank" /></Field>
                <Field label="Account holder name"><Input value={p.account_holder} onChange={(e) => setPv("account_holder", e.target.value)} /></Field>
                <Field label="Bank name"><Input value={p.bank_name} onChange={(e) => setPv("bank_name", e.target.value)} /></Field>
                <Field label="IFSC"><Input value={p.ifsc} onChange={(e) => setPv("ifsc", e.target.value.toUpperCase())} maxLength={11} /></Field>
                <Field label="Account number" className="sm:col-span-2"><Input inputMode="numeric" value={p.account_number} onChange={(e) => setPv("account_number", e.target.value.replace(/\D/g, ""))} /></Field>
              </div>
            </div>
          </div>
        );
    }
  };

  /* ───────── wizard ───────── */

  if (wizard) {
    const id = sections[step];
    const last = step === sections.length - 1;
    const next = async () => {
      if (!(await persist([id]))) return;
      if (last) onFinished?.();
      else setStep(step + 1);
    };
    return (
      <div>
        <ol className="mb-8 flex items-center justify-between overflow-x-auto pb-2">
          {sections.map((s, i) => (
            <li key={s} className="flex items-center">
              <div className={`flex flex-col items-center gap-1 ${i <= step ? "" : "opacity-40"}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-gold text-background" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </span>
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">{TITLES[s].step}</span>
              </div>
              {i < sections.length - 1 && <span className={`mx-1.5 mb-4 h-0.5 w-6 md:w-10 ${i < step ? "bg-emerald-500" : "bg-border"}`} />}
            </li>
          ))}
        </ol>
        <Card title={TITLES[id].title} subtitle={TITLES[id].sub}>
          {renderSection(id)}
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="mr-1.5 h-4 w-4" />Back</Button>}
            <Button onClick={next} disabled={saving} className="flex-1 bg-gold font-semibold text-background hover:bg-gold-dark">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {last ? "Finish and open my dashboard" : "Save and continue"}
              {!last && !saving && <ArrowRight className="ml-1.5 h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ───────── edit mode: all sections, one save bar ───────── */

  return (
    <div className="space-y-5">
      {sections.map((id) => <Card key={id} title={TITLES[id].title} subtitle={TITLES[id].sub}>{renderSection(id)}</Card>)}
      <div className="sticky bottom-3 z-10 flex justify-end">
        <Button disabled={saving} className="bg-gold px-8 font-semibold text-background shadow-lg hover:bg-gold-dark"
          onClick={async () => { if (await persist(sections)) toast({ title: "Changes saved" }); }}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}