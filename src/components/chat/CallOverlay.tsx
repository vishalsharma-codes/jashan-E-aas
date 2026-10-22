import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration, type CallState } from "@/lib/chatTypes";
import { ChatAvatar } from "./ChatAvatar";

interface Props {
  call: CallState;
  onAccept: () => void;
  onDecline: () => void;
  onHangUp: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

/** Soft two-tone ring (no audio files needed). */
function useRing(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let ctx: AudioContext | null = null;
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return;
    }
    const c = ctx;
    const beep = () => {
      [0, 0.25].forEach((delay, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = i === 0 ? 880 : 660;
        const t0 = c.currentTime + delay;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
        o.connect(g);
        g.connect(c.destination);
        o.start(t0);
        o.stop(t0 + 0.25);
      });
    };
    c.resume?.().catch(() => {});
    beep();
    const id = window.setInterval(beep, 2200);
    return () => {
      window.clearInterval(id);
      c.close().catch(() => {});
    };
  }, [active]);
}

function useElapsed(startedAt?: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);
  return startedAt ? (now - startedAt) / 1000 : 0;
}

function RoundButton({
  onClick,
  label,
  active,
  danger,
  success,
  big,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  danger?: boolean;
  success?: boolean;
  big?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        aria-label={label}
        className={cn(
          "rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg",
          big ? "w-16 h-16" : "w-14 h-14",
          danger && "bg-red-600 hover:bg-red-500 text-white",
          success && "bg-emerald-600 hover:bg-emerald-500 text-white",
          !danger && !success && (active ? "bg-white text-black" : "bg-white/15 hover:bg-white/25 text-white backdrop-blur")
        )}
      >
        {children}
      </button>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
}

export function CallOverlay({ call, onAccept, onDecline, onHangUp, onToggleMute, onToggleCamera }: Props) {
  const remoteRef = useRef<HTMLVideoElement>(null);
  const localRef = useRef<HTMLVideoElement>(null);
  const elapsed = useElapsed(call.startedAt);

  useRing(call.phase === "incoming" || call.phase === "calling");

  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = call.remoteStream;
  }, [call.remoteStream]);
  useEffect(() => {
    if (localRef.current) localRef.current.srcObject = call.localStream;
  }, [call.localStream, call.phase]);

  const showRemoteVideo = call.video && call.phase === "connected" && !!call.remoteStream;
  const status =
    call.phase === "incoming"
      ? `Incoming ${call.video ? "video" : "voice"} call…`
      : call.phase === "calling"
      ? "Ringing…"
      : call.phase === "connecting"
      ? "Connecting…"
      : formatDuration(elapsed);

  return (
    <AnimatePresence>
      <motion.div
        key="call"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[#0b0b0f] text-white"
        role="dialog"
        aria-label="Call"
      >
        {/* Remote media (video fills screen; for voice calls it just plays audio) */}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className={cn(showRemoteVideo ? "absolute inset-0 w-full h-full object-cover" : "absolute w-0 h-0 opacity-0")}
        />

        {/* Backdrop for voice / ringing */}
        {!showRemoteVideo && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.22),transparent_60%),linear-gradient(to_bottom,#14110a,#0b0b0f)]" />
        )}
        {showRemoteVideo && <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />}

        {/* Top info */}
        <div className="relative z-10 pt-10 px-6 flex flex-col items-center text-center">
          {showRemoteVideo ? (
            <>
              <p className="font-display text-xl">{call.peer.name}</p>
              <p className="text-sm text-white/80 tabular-nums">{status}</p>
            </>
          ) : (
            <>
              <div className="relative mt-10 mb-6">
                {(call.phase === "calling" || call.phase === "incoming") && (
                  <>
                    <span className="absolute inset-0 rounded-full border border-gold/40 animate-ping" />
                    <span className="absolute -inset-4 rounded-full border border-gold/20 animate-pulse" />
                  </>
                )}
                <ChatAvatar name={call.peer.name} src={call.peer.avatar} size="xl" />
              </div>
              <p className="font-display text-3xl">{call.peer.name}</p>
              <p className="mt-2 text-white/70 tabular-nums">{status}</p>
              <p className="mt-1 text-xs text-gold/80 tracking-widest uppercase">Jashan-E-Aas</p>
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* Local preview (video calls) */}
        {call.video && call.localStream && call.phase !== "incoming" && (
          <div className="absolute z-10 right-4 top-4 md:right-6 md:top-6 w-28 h-40 md:w-40 md:h-56 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <video
              ref={localRef}
              autoPlay
              playsInline
              muted
              className={cn("w-full h-full object-cover -scale-x-100", call.cameraOff && "opacity-0")}
            />
            {call.cameraOff && (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <VideoOff className="w-6 h-6" />
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="relative z-10 pb-12 px-6 flex items-end justify-center gap-6">
          {call.phase === "incoming" ? (
            <>
              <RoundButton danger big onClick={onDecline} label="Decline">
                <PhoneOff className="w-7 h-7" />
              </RoundButton>
              <RoundButton success big onClick={onAccept} label="Accept">
                {call.video ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
              </RoundButton>
            </>
          ) : (
            <>
              <RoundButton onClick={onToggleMute} active={call.muted} label={call.muted ? "Unmute" : "Mute"}>
                {call.muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </RoundButton>
              {call.video && (
                <RoundButton onClick={onToggleCamera} active={call.cameraOff} label={call.cameraOff ? "Camera on" : "Camera off"}>
                  {call.cameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </RoundButton>
              )}
              <RoundButton danger big onClick={onHangUp} label={call.phase === "calling" ? "Cancel" : "End"}>
                <PhoneOff className="w-7 h-7" />
              </RoundButton>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
