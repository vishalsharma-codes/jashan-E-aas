import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays, CheckCircle, Circle, Clapperboard, Inbox, IndianRupee, MapPin, MessageCircle, Star, Users, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDay } from "@/components/booking/MultiDayCalendar";
import { inr, type CheckItem, type VendorPrivate, type VendorProfileRow } from "@/lib/vendorOptions";
import { Card, Empty, Pill, Stat, chipCls, inputCls } from "./Bits";

/* ───────── data hook ───────── */

export interface BookingRow {
  id: string; booking_code: string; customer_id: string; vendor_id: string;
  event_type: string; event_dates: string[]; city: string; guests: string; requirements: string;
  estimated_total: number; token_amount: number; payment_status: string;
  status: "pending" | "confirmed" | "declined" | "completed" | "cancelled";
  quote_amount: number | null; vendor_note: string | null; created_at: string; customer_name?: string;
}

export function useBookings(userId: string) {
  const { toast } = useToast();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("bookings").select("*").eq("vendor_id", userId).order("created_at", { ascending: false });
    const list: BookingRow[] = data ?? [];
    const ids = Array.from(new Set(list.map((b) => b.customer_id)));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, display_name").in("id", ids);
      const names = new Map<string, string>((ps ?? []).map((p: any) => [p.id, p.display_name]));
      list.forEach((b) => { b.customer_name = names.get(b.customer_id) || "Customer"; });
    }
    setRows(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel(`vendor-bookings-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `vendor_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === "INSERT") toast({ title: "New booking request", description: "A customer just paid a token to book you." });
        void load();
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [userId, load, toast]);

  const update = async (id: string, patch: Partial<Pick<BookingRow, "status" | "quote_amount" | "vendor_note">>) => {
    const { error } = await supabase.from("bookings").update(patch).eq("id", id);
    if (error) toast({ title: "Could not update booking", description: error.message, variant: "destructive" });
    else await load();
    return !error;
  };

  return { rows, loading, update, reload: load };
}

const total = (b: BookingRow) => b.quote_amount ?? b.estimated_total;
const todayISO = () => new Date().toISOString().slice(0, 10);
const STATUS_TONE = { pending: "amber", confirmed: "green", completed: "blue", declined: "red", cancelled: "grey" } as const;
const STATUS_LABEL = { pending: "Needs your reply", confirmed: "Confirmed", completed: "Completed", declined: "Declined", cancelled: "Cancelled by customer" } as const;

/* ───────── Overview ───────── */

export function OverviewPanel({ profile, bookings, checklist, go }: {
  profile: VendorProfileRow; priv: VendorPrivate; bookings: BookingRow[]; checklist: CheckItem[]; go: (tab: string) => void;
}) {
  const pending = bookings.filter((b) => b.status === "pending");
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && (b.event_dates[b.event_dates.length - 1] ?? "") >= todayISO())
    .sort((a, b) => (a.event_dates[0] ?? "").localeCompare(b.event_dates[0] ?? ""));
  const earned = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + total(b), 0);
  const held = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.token_amount, 0);
  const todo = checklist.filter((c) => !c.done);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Inbox} label="New requests" value={pending.length} sub={pending.length ? "Reply within your promised time" : "You are all caught up"} />
        <Stat icon={CalendarDays} label="Upcoming events" value={upcoming.length} sub={upcoming[0] ? `Next: ${formatDay(upcoming[0].event_dates[0])}` : "Nothing confirmed yet"} />
        <Stat icon={Star} label="Rating" value={profile.reviews_count ? profile.rating.toFixed(1) : "New"} sub={`${profile.reviews_count} review${profile.reviews_count === 1 ? "" : "s"}`} />
        <Stat icon={Wallet} label="Earned so far" value={`₹${inr(earned)}`} sub={`₹${inr(held)} tokens held in escrow`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Needs your reply" action={pending.length > 0 && <Button size="sm" variant="outline" onClick={() => go("bookings")}>Open requests</Button>}>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests. Customers who pay a token to book you will show up here.</p>
          ) : (
            <ul className="divide-y divide-border">
              {pending.slice(0, 4).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{b.event_type} for {b.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{b.event_dates.map((d) => formatDay(d)).join(", ")} in {b.city}</p>
                  </div>
                  <span className="shrink-0 font-semibold text-gold">₹{inr(total(b))}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Quick actions">
          <div className="grid gap-2">
            <Button variant="outline" className="justify-start" onClick={() => go("jhalak")}><Clapperboard className="mr-2 h-4 w-4 text-gold" />Upload a Jhalak</Button>
            <Button variant="outline" className="justify-start" onClick={() => go("calendar")}><CalendarDays className="mr-2 h-4 w-4 text-gold" />Block dates you are busy</Button>
            <Button variant="outline" className="justify-start" onClick={() => go("baatein")}><MessageCircle className="mr-2 h-4 w-4 text-gold" />Open Baatein</Button>
          </div>
        </Card>
      </div>

      {todo.length > 0 && (
        <Card title="Finish your profile" subtitle="Complete profiles rank higher and get booked more.">
          <ul className="grid gap-2 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.key}>
                <button type="button" disabled={c.done} onClick={() => go(c.tab)}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${c.done ? "border-transparent text-muted-foreground" : "border-border hover:border-gold/60"}`}>
                  {c.done ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-gold" />}
                  <span className={c.done ? "line-through" : ""}>{c.label}</span>
                  {!c.done && c.required && <span className="ml-auto text-[11px] text-gold">Required</span>}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ───────── Booking requests ───────── */

function BookingCard({ b, update, openChat }: { b: BookingRow; update: ReturnType<typeof useBookings>["update"]; openChat: () => void }) {
  const [quote, setQuote] = useState(String(b.quote_amount ?? b.estimated_total));
  const [note, setNote] = useState(b.vendor_note ?? "");
  const [busy, setBusy] = useState(false);
  const run = async (patch: Parameters<typeof update>[1]) => { setBusy(true); await update(b.id, patch); setBusy(false); };

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg font-bold">{b.event_type} for {b.customer_name}</p>
          <p className="text-xs text-muted-foreground">Booking {b.booking_code}</p>
        </div>
        <Pill tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Pill>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{b.event_dates.map((d) => formatDay(d)).join(", ")}</p>
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{b.city}</p>
        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" />{b.guests} guests</p>
        <p className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-gold" />Token paid ₹{inr(b.token_amount)}</p>
      </div>
      {b.requirements && <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm"><span className="text-muted-foreground">Requirements: </span>{b.requirements}</p>}

      {b.status === "pending" && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Your quote (₹)</p>
              <Input inputMode="numeric" value={quote} onChange={(e) => setQuote(e.target.value.replace(/\D/g, ""))} />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Note to the customer (optional)</p>
              <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything they should know before the event" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Customer estimate was ₹{inr(b.estimated_total)}. Balance is released through escrow milestones after you accept.</p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || !Number(quote)} className="bg-gold font-semibold text-background hover:bg-gold-dark"
              onClick={() => run({ status: "confirmed", quote_amount: Number(quote), vendor_note: note || null })}>Accept and lock dates</Button>
            <Button disabled={busy} variant="outline" onClick={() => run({ status: "declined", vendor_note: note || null })}>Decline</Button>
            <Button variant="ghost" onClick={openChat}><MessageCircle className="mr-1.5 h-4 w-4" />Message customer</Button>
          </div>
        </div>
      )}

      {b.status === "confirmed" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <p className="mr-auto text-sm">Agreed quote <b>₹{inr(total(b))}</b></p>
          <Button variant="ghost" onClick={openChat}><MessageCircle className="mr-1.5 h-4 w-4" />Message</Button>
          <Button disabled={busy} variant="outline" onClick={() => run({ status: "completed" })}>Mark event completed</Button>
        </div>
      )}
      {(b.status === "declined" || b.status === "cancelled") && b.vendor_note && <p className="mt-3 text-xs text-muted-foreground">Your note: {b.vendor_note}</p>}
    </article>
  );
}

export function BookingsPanel({ bookings, loading, update, openChat }: {
  bookings: BookingRow[]; loading: boolean; update: ReturnType<typeof useBookings>["update"]; openChat: () => void;
}) {
  const [filter, setFilter] = useState<"pending" | "confirmed" | "completed" | "closed" | "all">("pending");
  const shown = useMemo(() => bookings.filter((b) =>
    filter === "all" ? true : filter === "closed" ? b.status === "declined" || b.status === "cancelled" : b.status === filter), [bookings, filter]);
  const count = (s: string) => bookings.filter((b) => (s === "closed" ? b.status === "declined" || b.status === "cancelled" : b.status === s)).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {([["pending", "Needs reply"], ["confirmed", "Confirmed"], ["completed", "Completed"], ["closed", "Declined or cancelled"], ["all", "All"]] as const).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={chipCls(filter === k)}>
            {label}{k !== "all" && ` (${count(k)})`}
          </button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading requests…</p>
        : shown.length === 0 ? <Empty icon={Inbox} title="Nothing here yet" text="When a customer picks you in the booking flow and pays the token, the request lands here instantly." />
        : shown.map((b) => <BookingCard key={b.id} b={b} update={update} openChat={openChat} />)}
    </div>
  );
}

/* ───────── Payments ───────── */

const MILESTONES = [
  { label: "Token, paid at booking", pct: 15, offset: null as number | null },
  { label: "Advance", pct: 30, offset: -30 },
  { label: "Mid-milestone", pct: 25, offset: -15 },
  { label: "Pre-event balance", pct: 20, offset: -2 },
  { label: "Final settlement", pct: 10, offset: 2 },
];

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export function PaymentsPanel({ bookings, priv, go }: { bookings: BookingRow[]; priv: VendorPrivate; go: (tab: string) => void }) {
  const active = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const tokens = active.reduce((s, b) => s + b.token_amount, 0);
  const balance = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + Math.max(0, total(b) - b.token_amount), 0);
  const settled = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + total(b), 0);
  const masked = priv.upi_id ? priv.upi_id.replace(/^(.{2}).*(@.*)$/, "$1•••$2") : "Not added";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Wallet} label="Tokens in escrow" value={`₹${inr(tokens)}`} sub="From confirmed and completed bookings" />
        <Stat icon={IndianRupee} label="Balance to come" value={`₹${inr(balance)}`} sub="Released in milestones" />
        <Stat icon={CheckCircle} label="Settled events" value={`₹${inr(settled)}`} sub="Completed bookings, full value" />
      </div>

      <Card title="Payout account" action={<Button size="sm" variant="outline" onClick={() => go("settings")}>Change</Button>}>
        <p className="text-sm">UPI: <b>{masked}</b></p>
        <p className="mt-1 text-xs text-muted-foreground">Escrow releases go to this account after each milestone is approved.</p>
      </Card>

      <Card title="Milestone schedule" subtitle="A planned split for each confirmed booking. Final amounts follow the Jashan-E-Aas escrow policy.">
        {active.length === 0 ? <p className="text-sm text-muted-foreground">Confirmed bookings will show their milestone dates here.</p> : (
          <div className="space-y-5">
            {active.map((b) => (
              <div key={b.id} className="rounded-xl border border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 text-sm">
                  <span className="font-semibold">{b.event_type} for {b.customer_name}</span>
                  <span className="text-muted-foreground">{b.booking_code} · ₹{inr(total(b))}</span>
                </div>
                <ul className="divide-y divide-border text-sm">
                  {MILESTONES.map((m) => (
                    <li key={m.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <span>{m.label} <span className="text-xs text-muted-foreground">({m.pct}%)</span></span>
                      <span className="text-right">
                        <b>₹{inr((total(b) * m.pct) / 100)}</b>
                        <span className="ml-2 text-xs text-muted-foreground">{m.offset === null ? "Paid" : formatDay(addDays(b.event_dates[0], m.offset))}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}