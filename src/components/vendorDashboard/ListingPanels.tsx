import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, Loader2, Package, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_TYPE_OPTIONS, inr } from "@/lib/vendorOptions";
import { Card, Empty, Field, FilePick, Select, TextArea, uploadTo } from "./Bits";

/* ───────── Packages ───────── */

interface Pkg { id: string; name: string; price: number; description: string; inclusions: string[]; is_popular: boolean }
const BLANK = { name: "", price: "", description: "", inclusions: "", is_popular: false };

export function PackagesPanel({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("vendor_packages").select("*").eq("vendor_id", userId).order("price");
    setRows(data ?? []);
    setLoading(false);
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const open = (p?: Pkg) => {
    setEditing(p ? p.id : "new");
    setForm(p ? { name: p.name, price: String(p.price), description: p.description, inclusions: p.inclusions.join("\n"), is_popular: p.is_popular } : BLANK);
  };

  const submit = async () => {
    if (!form.name.trim() || !Number(form.price)) { toast({ title: "Add a package name and price.", variant: "destructive" }); return; }
    setSaving(true);
    const body = {
      vendor_id: userId, name: form.name.trim(), price: Number(form.price), description: form.description.trim(),
      inclusions: form.inclusions.split("\n").map((s) => s.trim()).filter(Boolean), is_popular: form.is_popular,
    };
    const { error } = editing === "new"
      ? await supabase.from("vendor_packages").insert(body)
      : await supabase.from("vendor_packages").update(body).eq("id", editing!);
    setSaving(false);
    if (error) { toast({ title: "Could not save package", description: error.message, variant: "destructive" }); return; }
    setEditing(null);
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this package?")) return;
    const { error } = await supabase.from("vendor_packages").delete().eq("id", id);
    if (error) toast({ title: "Could not delete", description: error.message, variant: "destructive" });
    else await load();
  };

  return (
    <div className="space-y-5">
      <Card title="Your packages" subtitle="Ready-made options help customers choose faster."
        action={<Button size="sm" onClick={() => open()} className="bg-gold text-background hover:bg-gold-dark"><Plus className="mr-1 h-4 w-4" />Add package</Button>}>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? (
          <Empty icon={Package} title="No packages yet" text="Add a basic, standard and premium option, each with what is included." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((p) => (
              <article key={p.id} className={`rounded-2xl border p-4 ${p.is_popular ? "border-gold bg-gold/5" : "border-border"}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-bold">{p.name}</h3>
                  {p.is_popular && <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-background"><Star className="h-3 w-3" />Popular</span>}
                </div>
                <p className="mt-1 text-xl font-bold text-gold">₹{inr(p.price)}</p>
                {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
                <ul className="mt-3 space-y-1 text-sm">{p.inclusions.map((i) => <li key={i} className="flex gap-2"><span className="text-gold">✓</span>{i}</li>)}</ul>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => open(p)}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)} aria-label="Delete package"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      {editing && (
        <Card title={editing === "new" ? "New package" : "Edit package"} action={<button type="button" aria-label="Close" onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Package name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gold" /></Field>
              <Field label="Price (₹)" required><Input inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })} /></Field>
            </div>
            <Field label="Short description"><TextArea rows={2} value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></Field>
            <Field label="What is included" hint="One item per line."><TextArea rows={5} value={form.inclusions} onChange={(v) => setForm({ ...form, inclusions: v })} placeholder={"2 photographers\nSame-day highlights\nPrinted album"} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-gold" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} />Mark as most popular</label>
            <div className="flex gap-2">
              <Button disabled={saving} onClick={submit} className="bg-gold font-semibold text-background hover:bg-gold-dark">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save package</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ───────── Portfolio ───────── */

interface Shot { id: string; image_url: string; storage_path: string; title: string; event_type: string }

export function PortfolioPanel({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [eventType, setEventType] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.from("vendor_portfolio").select("*").eq("vendor_id", userId).order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const add = async (files: File[]) => {
    const room = 40 - rows.length;
    if (room <= 0) { toast({ title: "You can keep up to 40 photos.", variant: "destructive" }); return; }
    setBusy(true);
    try {
      for (const file of files.slice(0, room)) {
        if (file.size > 5 * 1024 * 1024) { toast({ title: `${file.name} is over 5 MB`, variant: "destructive" }); continue; }
        const { path, url } = await uploadTo("vendor-media", userId, "portfolio", file);
        const { error } = await supabase.from("vendor_portfolio").insert({
          vendor_id: userId, image_url: url, storage_path: path, title: file.name.replace(/\.[^.]+$/, ""), event_type: eventType,
        });
        if (error) throw error;
      }
      await load();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    setBusy(false);
  };

  const remove = async (s: Shot) => {
    const { error } = await supabase.from("vendor_portfolio").delete().eq("id", s.id);
    if (error) { toast({ title: "Could not delete", description: error.message, variant: "destructive" }); return; }
    if (s.storage_path) await supabase.storage.from("vendor-media").remove([s.storage_path]);
    await load();
  };

  return (
    <Card title="Portfolio photos" subtitle={`${rows.length} of 40 photos. Four or more are needed before you can go live.`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-44"><Select value={eventType} onChange={setEventType} placeholder="Event (optional)" options={EVENT_TYPE_OPTIONS} /></div>
          <FilePick label="Add photos" multiple busy={busy} onFiles={add} />
        </div>
      }>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? (
        <Empty icon={Images} title="Show your best work" text="Upload photos of real events you have done. Pick the event type first and each new photo is tagged with it." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((s) => (
            <figure key={s.id} className="group relative overflow-hidden rounded-xl border border-border">
              <img src={s.image_url} alt={s.title} loading="lazy" className="aspect-square w-full object-cover" />
              {s.event_type && <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-xs text-white">{s.event_type}</figcaption>}
              <button type="button" aria-label={`Delete ${s.title}`} onClick={() => remove(s)}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
                <Trash2 className="h-4 w-4" />
              </button>
            </figure>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ───────── Calendar ───────── */

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CalendarPanel({ userId, minNotice }: { userId: string; minNotice: number }) {
  const { toast } = useToast();
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [rows, setRows] = useState<Record<string, { source: string; reason: string }>>({});
  const [busy, setBusy] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const today = iso(new Date());

  const load = useCallback(async () => {
    const { data } = await supabase.from("vendor_blocked_dates").select("day, source, reason").eq("vendor_id", userId);
    const m: Record<string, { source: string; reason: string }> = {};
    (data ?? []).forEach((r: any) => { m[r.day] = { source: r.source, reason: r.reason }; });
    setRows(m);
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const toggle = async (day: string) => {
    const cur = rows[day];
    if (cur?.source === "booking") { toast({ title: "This day is booked", description: cur.reason }); return; }
    setBusy(day);
    const { error } = cur
      ? await supabase.from("vendor_blocked_dates").delete().eq("vendor_id", userId).eq("day", day)
      : await supabase.from("vendor_blocked_dates").insert({ vendor_id: userId, day, reason: "Blocked by you", source: "manual" });
    if (error) toast({ title: "Could not update", description: error.message, variant: "destructive" });
    await load();
    setBusy("");
  };

  const blockRange = async () => {
    if (!from || !to || to < from) { toast({ title: "Pick a start date and an end date after it.", variant: "destructive" }); return; }
    const days: string[] = [];
    for (let d = new Date(`${from}T00:00:00`); iso(d) <= to && days.length < 90; d.setDate(d.getDate() + 1)) {
      if (rows[iso(d)]?.source !== "booking" && iso(d) >= today) days.push(iso(d));
    }
    if (!days.length) { toast({ title: "Nothing to block in that range." }); return; }
    const { error } = await supabase.from("vendor_blocked_dates").upsert(
      days.map((day) => ({ vendor_id: userId, day, reason: "Blocked by you", source: "manual" })), { onConflict: "vendor_id,day" });
    if (error) toast({ title: "Could not block dates", description: error.message, variant: "destructive" });
    else { toast({ title: `${days.length} day${days.length > 1 ? "s" : ""} blocked` }); setFrom(""); setTo(""); }
    await load();
  };

  const y = month.getFullYear(), m = month.getMonth();
  const lead = new Date(y, m, 1).getDay();
  const count = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => iso(new Date(y, m, i + 1)))];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Card title="Availability" subtitle="Tap a day to block or open it. Customers only see you for days you are free.">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(y, m - 1, 1))} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-gold"><ChevronLeft className="h-4 w-4" /></button>
          <p className="font-serif text-lg font-bold">{month.toLocaleString("en-IN", { month: "long", year: "numeric" })}</p>
          <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(y, m + 1, 1))} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-gold"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">{DOW.map((d) => <span key={d} className="py-1">{d}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} />;
            const r = rows[day]; const past = day < today;
            const cls = r?.source === "booking" ? "bg-gold text-background"
              : r ? "bg-red-500/15 text-red-600 line-through" : past ? "text-muted-foreground/40" : "hover:bg-gold/10";
            return (
              <button key={day} type="button" disabled={past || busy === day} onClick={() => toggle(day)}
                aria-label={`${day}${r ? (r.source === "booking" ? ", booked" : ", blocked") : ", free"}`}
                className={`aspect-square rounded-lg text-sm transition-colors ${cls} ${day === today ? "ring-1 ring-gold" : ""}`}>
                {Number(day.slice(8))}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-gold" />Booked</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-red-500/30" />Blocked by you</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-border" />Free</span>
        </div>
      </Card>

      <div className="space-y-5">
        <Card title="Block a range" subtitle="Holiday, family function, or a long job elsewhere.">
          <div className="space-y-3">
            <Field label="From"><input type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm" /></Field>
            <Field label="To"><input type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm" /></Field>
            <Button onClick={blockRange} variant="outline" className="w-full">Block these days</Button>
          </div>
        </Card>
        <Card title="Booking notice">
          <p className="text-sm text-muted-foreground">You accept bookings made at least <b className="text-foreground">{minNotice} day{minNotice === 1 ? "" : "s"}</b> before the event. Change this under Business profile, then Pricing.</p>
        </Card>
      </div>
    </div>
  );
}