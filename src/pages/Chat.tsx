import { useEffect, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar"; // <- adjust if your Navbar lives elsewhere
import { useConversations } from "@/hooks/useChat";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChatContext } from "@/components/chat/ChatProvider";

export default function Chat() {
  const auth = useAuth() as { user: any; loading?: boolean; isLoading?: boolean };
  const user = auth.user;
  const authLoading = auth.loading ?? auth.isLoading ?? false;

  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const warned = useRef(false);
  const urlHandledRef = useRef<string | null>(null);
  const reloadAttemptedRef = useRef<string | null>(null);

  const { conversations, loading, reload } = useConversations();
  const { onlineIds, startCall } = useChatContext();

  // Logged out (typed /chat in the address bar, or arrived from a link):
  // show the alert once and send them to the login page. `replace` keeps Back from looping.
  useEffect(() => {
    if (!authLoading && !user && !warned.current) {
      warned.current = true;
      toast.error("Please log in first to use Baatein", {
        description: "Sign in to chat with vendors and the community.",
      });
      navigate("/auth", { replace: true, state: { from: location.pathname } });
    }
  }, [authLoading, user, navigate, location.pathname]);

  const active = conversations.find((c) => c.id === conversationId) ?? null;

  // Handle shared/deep links such as /chat?c=CONVERSATION_ID&call=audio.
  // Wait until conversations finish loading before looking up the conversation.
  useEffect(() => {
    const id = searchParams.get("c");
    const callType = searchParams.get("call");

    if (!id || loading || !user) return;

    const conversation = conversations.find((c) => c.id === id);

    // A newly created conversation may not have appeared in the list yet.
    // Refresh the list once in case realtime has not delivered the new row.
    if (!conversation) {
      if (reloadAttemptedRef.current !== id) {
        reloadAttemptedRef.current = id;
        void reload();
      }
      return;
    }

    const requestKey = `${id}:${callType ?? ""}`;

    // Avoid starting the same call more than once if React re-runs the effect.
    if (urlHandledRef.current === requestKey) return;

    urlHandledRef.current = requestKey;

    // Open the conversation and clean the query string so refresh won't repeat the call.
    navigate(`/chat/${id}`, { replace: true });

    if (callType === "audio") {
      void startCall(conversation, false);
    }
  }, [searchParams, conversations, loading, user, reload, navigate, startCall]);

  // A chat was just created from a vendor page and may not be in the list yet:
  // refetch once in case realtime hasn't delivered the new row.
  useEffect(() => {
    if (conversationId && !active && !loading && user) void reload();
  }, [conversationId, active?.id, loading, user?.id, reload]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-0 md:px-4 md:py-6">
          {authLoading ? (
            <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
              Loading…
            </div>
          ) : !user ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-4 px-6">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gold" />
              </div>
              <h1 className="font-display text-3xl text-foreground">
                Sign in to chat with vendors
              </h1>
              <p className="text-muted-foreground max-w-sm">
                Ask questions, share your event details and get quotes — by message, voice note, voice call or video call.
              </p>
              <Link
                to="/auth"
                className="px-6 py-2.5 rounded-md bg-gradient-to-br from-gold to-gold-dark text-primary-foreground font-medium"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <div className="flex h-[calc(100dvh-5rem)] md:h-[calc(100dvh-8rem)] overflow-hidden md:rounded-2xl md:border border-border bg-card shadow-2xl">
              {/* Left: conversation list */}
              <aside
                className={cn(
                  "w-full md:w-[360px] md:border-r border-border shrink-0",
                  active ? "hidden md:block" : "block"
                )}
              >
                <ConversationList
                  conversations={conversations}
                  loading={loading}
                  activeId={active?.id ?? null}
                  userId={user.id}
                  onlineIds={onlineIds}
                  onSelect={(id) => navigate(`/chat/${id}`)}
                />
              </aside>

              {/* Right: open conversation */}
              <section className={cn("flex-1 min-w-0", active ? "block" : "hidden md:block")}>
                {active ? (
                  <ChatWindow
                    key={active.id}
                    conversation={active}
                    userId={user.id}
                    onBack={() => navigate("/chat")}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4 px-8">
                    <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                      <MessageCircle className="w-10 h-10 text-gold" />
                    </div>
                    <h2 className="font-display text-2xl text-foreground">
                      Your conversations
                    </h2>
                    <p className="text-muted-foreground max-w-sm text-sm">
                      Pick a chat on the left, or find a vendor and tap{" "}
                      <span className="text-gold">Message</span> to start planning your celebration.
                    </p>
                    <Link
                      to="/vendors"
                      className="px-5 py-2 rounded-md border border-gold/50 text-gold hover:bg-gold/10 transition-colors text-sm font-medium"
                    >
                      Browse vendors
                    </Link>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
