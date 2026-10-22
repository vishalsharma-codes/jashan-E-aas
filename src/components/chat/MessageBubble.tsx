import { format } from "date-fns";
import { Check, CheckCheck, FileText, Phone, PhoneMissed, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration, type Message } from "@/lib/chatTypes";
import { VoiceNote } from "./VoiceNote";

export function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  const time = format(new Date(message.created_at), "h:mm a");

  /* ---- call records render as a centred system line ---- */
  if (message.kind === "call") {
    const video = message.body === "video";
    const outcome = message.meta?.outcome as string | undefined;
    const missed = outcome === "missed";
    const declined = outcome === "declined";
    const Icon = missed || declined ? (video ? VideoOff : PhoneMissed) : video ? Video : Phone;
    const label = missed
      ? mine ? `No answer · ${video ? "video" : "voice"} call` : `Missed ${video ? "video" : "voice"} call`
      : declined
      ? `${video ? "Video" : "Voice"} call declined`
      : `${video ? "Video" : "Voice"} call · ${formatDuration(message.duration_seconds ?? 0)}`;
    return (
      <div className="flex justify-center my-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs border",
            missed && !mine ? "border-red-500/40 text-red-400 bg-red-500/10" : "border-border text-muted-foreground bg-muted/50"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
          <span className="opacity-60">· {time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] md:max-w-[65%] rounded-2xl px-3 py-2 shadow-sm",
          mine
            ? "bg-gradient-to-br from-gold to-gold-dark text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        {message.kind === "image" && message.media_url && (
          <a href={message.media_url} target="_blank" rel="noreferrer">
            <img
              src={message.media_url}
              alt={message.body ?? "Photo"}
              loading="lazy"
              className="rounded-xl max-h-72 w-auto object-cover mb-1"
            />
          </a>
        )}

        {message.kind === "file" && message.media_url && (
          <a
            href={message.media_url}
            target="_blank"
            rel="noreferrer"
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2 mb-1", mine ? "bg-black/15" : "bg-background/60")}
          >
            <FileText className="w-6 h-6 shrink-0" />
            <span className="text-sm break-all line-clamp-2">{message.body ?? "File"}</span>
          </a>
        )}

        {message.kind === "voice" && message.media_url && (
          <VoiceNote id={message.id} url={message.media_url} duration={message.duration_seconds ?? 0} mine={mine} />
        )}

        {message.kind === "text" && message.body && (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.body}</p>
        )}

        <div className={cn("flex items-center justify-end gap-1 mt-0.5 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
          <span>{time}</span>
          {mine && (message.read_at ? <CheckCheck className="w-3.5 h-3.5 text-sky-300" /> : <Check className="w-3.5 h-3.5" />)}
        </div>
      </div>
    </div>
  );
}
