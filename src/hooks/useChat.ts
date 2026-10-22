import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/chatClient";
import { useAuth } from "@/hooks/useAuth";
import type { Conversation, Message, MessageKind } from "@/lib/chatTypes";

const uid = () => Math.random().toString(36).slice(2, 9);

/* ------------------------------------------------------------------ */
/* Conversation list (live)                                            */
/* ------------------------------------------------------------------ */
export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`customer_id.eq.${user.id},vendor_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });
    setConversations((data ?? []) as Conversation[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }
    load();
    const ch = supabase
      .channel(`conv-list-${user.id}-${uid()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id, load]);

  return { conversations, loading, reload: load };
}

/* ------------------------------------------------------------------ */
/* Total unread count (used by the navbar badge)                       */
/* ------------------------------------------------------------------ */
export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("customer_id, customer_unread, vendor_unread")
        .or(`customer_id.eq.${user.id},vendor_id.eq.${user.id}`);
      const total = (data ?? []).reduce(
        (sum: number, c: any) => sum + (c.customer_id === user.id ? c.customer_unread : c.vendor_unread),
        0
      );
      setCount(total);
    };
    load();
    const ch = supabase
      .channel(`unread-${user.id}-${uid()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id]);

  return count;
}

/* ------------------------------------------------------------------ */
/* Messages of one conversation (live) + typing indicator              */
/* ------------------------------------------------------------------ */
export interface SendInput {
  kind?: MessageKind;
  body?: string | null;
  media_url?: string | null;
  duration_seconds?: number | null;
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimer = useRef<number | undefined>(undefined);
  const lastTypingSent = useRef(0);

  useEffect(() => {
    setMessages([]);
    setOtherTyping(false);
    if (!conversationId || !user) return;

    let active = true;
    setLoading(true);

    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(500);
      if (!active) return;
      setMessages((data ?? []) as Message[]);
      setLoading(false);
      supabase.rpc("mark_conversation_read", { conv: conversationId });
    })();

    const filter = `conversation_id=eq.${conversationId}`;
    const ch = supabase
      .channel(`msgs-${conversationId}-${uid()}`, { config: { broadcast: { self: false } } })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter }, (p) => {
        const m = p.new as Message;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        if (m.sender_id !== user.id) {
          setOtherTyping(false);
          supabase.rpc("mark_conversation_read", { conv: conversationId });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter }, (p) => {
        const m = p.new as Message;
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)));
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.user_id === user.id) return;
        setOtherTyping(true);
        window.clearTimeout(typingTimer.current);
        typingTimer.current = window.setTimeout(() => setOtherTyping(false), 3000);
      })
      .subscribe();
    channelRef.current = ch;

    return () => {
      active = false;
      window.clearTimeout(typingTimer.current);
      channelRef.current = null;
      supabase.removeChannel(ch);
    };
  }, [conversationId, user?.id]);

  const send = useCallback(
    async (input: SendInput) => {
      if (!conversationId || !user) return;
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          kind: input.kind ?? "text",
          body: input.body ?? null,
          media_url: input.media_url ?? null,
          duration_seconds: input.duration_seconds ?? null,
        })
          .select()
        .maybeSingle();
      if (error) throw error;
      if (!data) return; // message was held back by moderation; the warning arrives via the alert popup
      const m = data as Message;
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    },
    [conversationId, user?.id]
  );

  const upload = useCallback(
    async (file: Blob, fileName: string) => {
      if (!conversationId) throw new Error("No conversation");
      const safe = fileName.replace(/[^\w.\-]/g, "_");
      const path = `${conversationId}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage
        .from("chat-media")
        .upload(path, file, { contentType: file.type || undefined });
      if (error) throw error;
      return supabase.storage.from("chat-media").getPublicUrl(path).data.publicUrl;
    },
    [conversationId]
  );

  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current < 1500 || !user) return;
    lastTypingSent.current = now;
    channelRef.current
      ?.send({ type: "broadcast", event: "typing", payload: { user_id: user.id } })
      .catch(() => {});
  }, [user?.id]);

  return { messages, loading, otherTyping, send, upload, notifyTyping };
}
