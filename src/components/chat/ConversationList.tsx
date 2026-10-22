import { useMemo, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { myUnread, otherAvatar, otherId, otherName, type Conversation } from "@/lib/chatTypes";
import { ChatAvatar } from "./ChatAvatar";

function listTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "dd/MM/yy");
}

interface Props {
  conversations: Conversation[];
  loading: boolean;
  activeId: string | null;
  userId: string;
  onlineIds: Set<string>;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, loading, activeId, userId, onlineIds, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (tab === "unread" && myUnread(c, userId) === 0) return false;
      if (!q) return true;
      return otherName(c, userId).toLowerCase().includes(q) || (c.vendor_service ?? "").toLowerCase().includes(q);
    });
  }, [conversations, query, tab, userId]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 space-y-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-foreground">
            Baat<span className="text-gold">ein</span>
          </h1>
          <MessageCircle className="w-5 h-5 text-gold" />
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors or services"
            className="w-full h-10 rounded-full bg-muted pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-gold/60"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "unread"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1 rounded-full text-xs font-medium border transition-colors capitalize",
                tab === t ? "bg-gold/15 border-gold text-gold" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {conversations.length === 0
              ? "No chats yet. Open a vendor and tap “Message” to start planning together."
              : "No chats match your search."}
          </div>
        )}

        {items.map((c) => {
          const unread = myUnread(c, userId);
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2",
                active ? "bg-gold/10 border-gold" : "border-transparent hover:bg-muted/60"
              )}
            >
              <ChatAvatar name={otherName(c, userId)} src={otherAvatar(c, userId)} online={onlineIds.has(otherId(c, userId))} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-foreground truncate">{otherName(c, userId)}</span>
                  <span className={cn("text-[11px] shrink-0", unread ? "text-gold" : "text-muted-foreground")}>{listTime(c.last_message_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-sm truncate", unread ? "text-foreground" : "text-muted-foreground")}>
                    {c.last_message ?? c.vendor_service ?? "Say hello 👋"}
                  </span>
                  {unread > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-gold text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
