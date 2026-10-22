import { useEffect, useRef, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ArrowLeft, Mic, Paperclip, Phone, Send, Smile, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useChat";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import {
  formatDuration,
  iAmCustomer,
  otherAvatar,
  otherId,
  otherName,
  type Conversation,
  type Message,
} from "@/lib/chatTypes";
import { ChatAvatar } from "./ChatAvatar";
import { MessageBubble } from "./MessageBubble";
import { useChatContext } from "./ChatProvider";

const EMOJIS = ["😊", "😂", "😍", "🥰", "👍", "🙏", "🎉", "🥳", "💍", "💐", "📸", "🎶", "🍽️", "✨", "🔥", "❤️", "👏", "😅", "🤝", "🙌", "💃", "🕺", "🎂", "🪔"];

const QUICK_REPLIES = [
  "Hi! Are you available on my event date?",
  "Could you share your packages & pricing?",
  "I'd like to request a quote 🙏",
  "Can we have a quick call?",
];

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "d MMMM yyyy");
}

const MAX_FILE_MB = 15;

interface Props {
  conversation: Conversation;
  userId: string;
  onBack: () => void;
}

export function ChatWindow({ conversation, userId, onBack }: Props) {
  const { messages, loading, otherTyping, send, upload, notifyTyping } = useMessages(conversation.id);
  const { onlineIds, startCall, inCall } = useChatContext();
  const voice = useVoiceRecorder();

  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const peerId = otherId(conversation, userId);
  const peerName = otherName(conversation, userId);
  const online = onlineIds.has(peerId);
  const isCustomer = iAmCustomer(conversation, userId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, otherTyping]);

  useEffect(() => {
    setText("");
    setEmojiOpen(false);
  }, [conversation.id]);

  const guard = async (fn: () => Promise<void>) => {
    setSending(true);
    try {
      await fn();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const sendText = (value = text) => {
    const body = value.trim();
    if (!body) return;
    setText("");
    setEmojiOpen(false);
    if (inputRef.current) inputRef.current.style.height = "auto";
    guard(() => send({ kind: "text", body }));
  };

  const onFile = (file?: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File is too large (max ${MAX_FILE_MB} MB)`);
      return;
    }
    guard(async () => {
      const url = await upload(file, file.name);
      await send({ kind: file.type.startsWith("image/") ? "image" : "file", body: file.name, media_url: url });
    });
  };

  const startRecording = async () => {
    try {
      await voice.start();
    } catch {
      toast.error("Allow microphone access to send voice messages.");
    }
  };

  const sendVoice = async () => {
    const rec = await voice.stop();
    if (!rec) return;
    guard(async () => {
      const url = await upload(rec.blob, `voice.${rec.extension}`);
      await send({ kind: "voice", media_url: url, duration_seconds: rec.seconds });
    });
  };

  // group messages by day
  const rows: Array<{ type: "day"; label: string; key: string } | { type: "msg"; m: Message }> = [];
  let lastDay = "";
  for (const m of messages) {
    const label = dayLabel(m.created_at);
    if (label !== lastDay) {
      rows.push({ type: "day", label, key: `d-${m.id}` });
      lastDay = label;
    }
    rows.push({ type: "msg", m });
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <header className="flex items-center gap-3 px-3 md:px-4 h-16 border-b border-border bg-card/80 backdrop-blur shrink-0">
        <button onClick={onBack} className="md:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground" aria-label="Back to chats">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <ChatAvatar name={peerName} src={otherAvatar(conversation, userId)} size="sm" online={online} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate leading-tight">{peerName}</p>
          <p className={cn("text-xs truncate", otherTyping ? "text-gold" : "text-muted-foreground")}>
            {otherTyping ? "typing…" : online ? "Online" : conversation.vendor_service ?? "Offline"}
          </p>
        </div>
        <button
          onClick={() => startCall(conversation, false)}
          disabled={inCall || !!conversation.blocked}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gold hover:bg-gold/10 disabled:opacity-40 transition-colors"
          aria-label="Voice call"
          title="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => startCall(conversation, true)}
         disabled={inCall || !!conversation.blocked}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gold hover:bg-gold/10 disabled:opacity-40 transition-colors"
          aria-label="Video call"
          title="Video call"
        >
          <Video className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 md:px-6 py-4 space-y-1.5 bg-background/40 bg-[radial-gradient(circle_at_1px_1px,rgba(212,175,55,0.07)_1px,transparent_0)] bg-[length:22px_22px]">
        {loading && <p className="text-center text-sm text-muted-foreground py-8">Loading messages…</p>}

        {!loading && messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10 max-w-xs mx-auto">
            <p className="text-foreground font-medium mb-1">Start the conversation</p>
            Tell {peerName} about your event date, venue and guest count to get a quick, accurate quote.
          </div>
        )}

        {rows.map((r) =>
          r.type === "day" ? (
            <div key={r.key} className="flex justify-center py-2">
              <span className="text-[11px] px-3 py-1 rounded-full bg-muted text-muted-foreground">{r.label}</span>
            </div>
          ) : (
            <MessageBubble key={r.m.id} message={r.m} mine={r.m.sender_id === userId} />
          )
        )}

        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies (customers only) */}
      {isCustomer && messages.length < 3 && !voice.recording && (
        <div className="flex gap-2 overflow-x-auto px-3 md:px-4 py-2 border-t border-border bg-card/60 shrink-0 [scrollbar-width:none]">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => sendText(q)}
              className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}


    {conversation.blocked && (
        <div className="px-4 py-3 text-center text-sm text-red-300 bg-red-500/10 border-t border-red-500/40">
          This chat is blocked because contact details or off-platform dealing were shared.
        </div>
      )}

      {/* Composer */}
            <div className={cn("relative border-t border-border bg-card px-2 md:px-4 py-3 shrink-0", conversation.blocked && "pointer-events-none opacity-40")}>
        {emojiOpen && !voice.recording && (
          <div className="absolute bottom-full left-2 md:left-4 mb-2 p-2 rounded-2xl border border-border bg-popover shadow-xl grid grid-cols-8 gap-1 w-[17rem]">
            {EMOJIS.map((e) => (
              <button
                key={e}
                className="w-8 h-8 text-xl rounded-md hover:bg-muted"
                onClick={() => {
                  setText((t) => t + e);
                  inputRef.current?.focus();
                }}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {voice.recording ? (
          <div className="flex items-center gap-3">
            <button onClick={voice.cancel} className="w-11 h-11 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10" aria-label="Cancel recording">
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center gap-3 h-11 px-4 rounded-full bg-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm tabular-nums text-foreground">{formatDuration(voice.seconds)}</span>
              <span className="text-xs text-muted-foreground">Recording…</span>
            </div>
            <button onClick={sendVoice} className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-dark text-primary-foreground flex items-center justify-center" aria-label="Send voice message">
              <Send className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-1.5">
            <button onClick={() => setEmojiOpen((o) => !o)} className="w-10 h-11 flex items-center justify-center text-muted-foreground hover:text-gold" aria-label="Emoji">
              <Smile className="w-6 h-6" />
            </button>
            <button onClick={() => fileRef.current?.click()} className="w-10 h-11 flex items-center justify-center text-muted-foreground hover:text-gold" aria-label="Attach file">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              placeholder="Type a message"
              onChange={(e) => {
                setText(e.target.value);
                notifyTyping();
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
              className="flex-1 resize-none rounded-2xl bg-muted px-4 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-gold/60 max-h-[120px]"
            />
            {text.trim() ? (
              <button
                onClick={() => sendText()}
                disabled={sending}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-dark text-primary-foreground flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                aria-label="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={sending}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-dark text-primary-foreground flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                aria-label="Record voice message"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
