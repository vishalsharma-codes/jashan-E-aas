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

      const { data, error } = await supabase
        .from("chat_alerts")
        .select("*")
        .eq("recipient_id", uid)
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load chat alerts:", error);
      } else if (!cancelled) {
        setAlerts((data as ChatAlert[]) ?? []);
      }

      if (cancelled) return;

      channel = supabase
        .channel(`chat-alerts-${uid}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_alerts",
            filter: `recipient_id=eq.${uid}`,
          },
          (payload) => {
            const alert = payload.new as ChatAlert;
            if (!alert.read) {
              setAlerts((prev) => [alert, ...prev.filter((item) => item.id !== alert.id)]);
            }
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    const { error } = await supabase
      .from("chat_alerts")
      .update({ read: true })
      .eq("id", id);
    if (error) console.error("Failed to mark chat alert as read:", error);
  }, []);

  return { alerts, dismiss };
}

const SEEN_KEY = "jea.moderation.seen.v1";

function getSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function rememberSeen(id: string) {
  try {
    const seen = getSeen();
    seen.add(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-200)));
  } catch {
    // Toast deduplication still works for the current mount via Sonner's toast id.
  }
}

/** Mount ONCE in App.tsx so customer, vendor and admin get a popup on any page. */
export function ModerationToasts() {
  const { alerts, dismiss } = useModerationAlerts();

  useEffect(() => {
    const seen = getSeen();

    for (const alert of alerts) {
      if (seen.has(alert.id)) continue;
      rememberSeen(alert.id);

      const options = {
        id: `alert-${alert.id}`,
        description: alert.body,
        duration: 15000,
        onDismiss: () => { void dismiss(alert.id); },
        onAutoClose: () => { void dismiss(alert.id); },
      };

      if (alert.kind === "warning") toast.warning(alert.title, options);
      else toast.error(alert.title, options);
    }
  }, [alerts, dismiss]);

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
      {alerts.map((alert) => (
        <div key={alert.id} className={`rounded-lg border px-4 py-3 text-sm ${tone[alert.kind]}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{alert.title}</p>
              <p className="mt-1 opacity-90">{alert.body}</p>
            </div>
            <button
              onClick={() => { void dismiss(alert.id); }}
              className="shrink-0 text-xs underline opacity-80 hover:opacity-100"
            >
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
    else {
      setErr(null);
      setRows((data as Violation[]) ?? []);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const unblock = async (conversationId: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ blocked: false, blocked_at: null, blocked_reason: null })
      .eq("id", conversationId);
    if (error) {
      setErr("Failed to unblock this chat. Check admin permissions.");
      return;
    }
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
              <th className="p-2">When</th>
              <th className="p-2">User</th>
              <th className="p-2">Strike</th>
              <th className="p-2">Reason</th>
              <th className="p-2">Message</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border align-top">
                <td className="p-2 whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td>
                <td className="p-2 font-mono text-xs">{row.user_id.slice(0, 8)}…</td>
                <td className="p-2">{row.strike}</td>
                <td className="p-2">{row.reason}</td>
                <td className="p-2 max-w-xs break-words">{row.message_text}</td>
                <td className="p-2">
                  {row.strike >= 2 && (
                    <button
                      onClick={() => { void unblock(row.conversation_id); }}
                      className="rounded border border-yellow-500/60 px-2 py-1 text-xs text-yellow-300 hover:bg-yellow-500/10"
                    >
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
