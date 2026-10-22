import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/chatTypes";

/** Deterministic pseudo-waveform so every voice note has its own look. */
function bars(seed: string, count = 30) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return Array.from({ length: count }, () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return 20 + (h % 80); // 20–99 %
  });
}

export function VoiceNote({ id, url, duration, mine }: { id: string; url: string; duration: number; mine: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const heights = useMemo(() => bars(id), [id]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration && isFinite(a.duration) ? a.currentTime / a.duration : a.currentTime / Math.max(duration, 1));
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [duration]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <audio ref={audioRef} src={url} preload="metadata" />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95",
          mine ? "bg-black/20 text-primary-foreground" : "bg-gold text-primary-foreground"
        )}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-[2px] h-8">
          {heights.map((h, i) => {
            const played = i / heights.length < progress;
            return (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={cn(
                  "w-[3px] rounded-full transition-colors",
                  played ? (mine ? "bg-primary-foreground" : "bg-gold") : mine ? "bg-primary-foreground/40" : "bg-muted-foreground/40"
                )}
              />
            );
          })}
        </div>
        <span className={cn("text-[11px] tabular-nums", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {formatDuration(playing ? progress * duration : duration)}
        </span>
      </div>
    </div>
  );
}
