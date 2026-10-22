// src/components/chat/moderation.tsx
// Contains: useModerationAlerts (hook), <ModerationBanner />, <AdminModeration />
// Adjust this import to your Supabase client export (same one chatClient.ts uses).
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/chatClient";

export type ChatAlert = {
  id: string;
  recipient_id: string;
  conversation_id: string | null;
  kind: "warning" | "blocked" | "admin_report";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

/** Unread moderation alerts for the signed-in user (customer, vendor or admin), live. */
export function useModerationAlerts() {
  const [alerts, setAlerts] = useState<ChatAlert[]>([]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid || cancelled) return;

      const { data } = await supabase
        .from("chat_alerts")
        .select("*")
        .eq("recipient_id", uid)
        .eq("read", false)
        .order("created_at", { ascending: false });
      if (!cancelled) setAlerts((data as ChatAlert[]) ?? []);

      channel = supabase
        .channel(`chat-alerts-${uid}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_alerts", filter: `recipient_id=eq.${uid}` },
          (payload) => setAlerts((prev) => [payload.new as ChatAlert, ...prev])
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("chat_alerts").update({ read: true }).eq("id", id);
  }, []);

  return { alerts, dismiss };
}

/** Mount ONCE in App.tsx so customer, vendor and admin get a popup on any page. */
export function ModerationToasts() {
  const { alerts, dismiss } = useModerationAlerts();
  const [shown] = useState(() => new Set<string>());
  useEffect(() => {
    for (const a of alerts) {
      if (shown.has(a.id)) continue;
      shown.add(a.id);
      const opts = { description: a.body, duration: 15000, onDismiss: () => dismiss(a.id) };
      if (a.kind === "warning") toast.warning(a.title, opts);
      else toast.error(a.title, opts);
    }
  }, [alerts]);
  return null;
}

const tone: Record<ChatAlert["kind"], string> = {
  warning: "border-amber-400/60 bg-amber-500/10 text-amber-100",
  blocked: "border-red-500/60 bg-red-500/10 text-red-100",
  admin_report: "border-yellow-500/60 bg-yellow-500/10 text-yellow-100",
};

/** Drop this at the top of Chat.tsx (and anywhere else you want alerts to appear). */
export function ModerationBanner() {
  const { alerts, dismiss } = useModerationAlerts();
  if (alerts.length === 0) return null;
  return (
    <div className="space-y-2 p-2">
      {alerts.map((a) => (
        <div key={a.id} className={`rounded-lg border px-4 py-3 text-sm ${tone[a.kind]}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="mt-1 opacity-90">{a.body}</p>
            </div>
            <button onClick={() => dismiss(a.id)} className="shrink-0 text-xs underline opacity-80 hover:opacity-100">
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

type Violation = {
  id: string;
  conversation_id: string;
  user_id: string;
  message_text: string;
  reason: string;
  strike: number;
  created_at: string;
};

/** Admin page: all violations + one-click unblock. Route it at e.g. /admin/moderation and guard by role. */
export function AdminModeration() {
  const [rows, setRows] = useState<Violation[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_violations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) setErr("Not allowed or failed to load (are you in app_admins?)");
    else setRows((data as Violation[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const unblock = async (conversationId: string) => {
    await supabase
      .from("conversations")
      .update({ blocked: false, blocked_at: null, blocked_reason: null })
      .eq("id", conversationId);
    // also clear strikes so they get a fresh warning
    await load();
  };

  return (
    <div className="p-4 text-sm text-foreground">
      <ModerationBanner />
      <h2 className="mb-3 text-lg font-semibold">Chat violations</h2>
      {err && <p className="text-red-400">{err}</p>}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left">
          <thead className="bg-muted/40 text-xs uppercase">
            <tr>
              <th className="p-2">When</th><th className="p-2">User</th><th className="p-2">Strike</th>
              <th className="p-2">Reason</th><th className="p-2">Message</th><th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                <td className="p-2">{r.strike}</td>
                <td className="p-2">{r.reason}</td>
                <td className="p-2 max-w-xs break-words">{r.message_text}</td>
                <td className="p-2">
                  {r.strike >= 2 && (
                    <button onClick={() => unblock(r.conversation_id)} className="rounded border border-yellow-500/60 px-2 py-1 text-xs text-yellow-300 hover:bg-yellow-500/10">
                      Unblock chat
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}