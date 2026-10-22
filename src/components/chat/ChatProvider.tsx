import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/chatClient";
import { useAuth } from "@/hooks/useAuth";
import {
  myAvatar,
  myName,
  otherAvatar,
  otherId,
  otherName,
  type CallState,
  type Conversation,
} from "@/lib/chatTypes";
import { CallOverlay } from "./CallOverlay";

/* ------------------------------------------------------------------ */
/* WebRTC config                                                       */
/* STUN is enough for most networks. For production add a TURN server  */
/* (see README) so calls also work behind strict firewalls / mobile.   */
/* ------------------------------------------------------------------ */
function rtcConfig(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ];
  const env = (import.meta as any).env ?? {};
  if (env.VITE_TURN_URL) {
    iceServers.push({
      urls: env.VITE_TURN_URL,
      username: env.VITE_TURN_USERNAME,
      credential: env.VITE_TURN_CREDENTIAL,
    });
  }
  return { iceServers };
}

async function getMedia(video: boolean) {
  return navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
    video: video ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false,
  });
}

type Outcome = "completed" | "missed" | "declined";

interface ActiveCall {
  callId: string;
  peerId: string;
  conversationId: string;
  video: boolean;
  direction: "out" | "in";
  connectedAt?: number;
}

interface ChatContextValue {
  onlineIds: Set<string>;
  startCall: (conversation: Conversation, video: boolean) => Promise<void>;
  inCall: boolean;
}

const ChatContext = createContext<ChatContextValue>({
  onlineIds: new Set(),
  startCall: async () => {},
  inCall: false,
});

export const useChatContext = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [call, setCall] = useState<CallState | null>(null);

  const callRef = useRef<ActiveCall | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  const ringTimer = useRef<number | undefined>(undefined);
  const outbound = useRef<Map<string, Promise<RealtimeChannel>>>(new Map());

  /* ---------------- presence (who is online) ---------------- */
  useEffect(() => {
    if (!user) {
      setOnlineIds(new Set());
      return;
    }
    const ch = supabase.channel("presence:jashan-chat", { config: { presence: { key: user.id } } });
    ch.on("presence", { event: "sync" }, () => {
      setOnlineIds(new Set(Object.keys(ch.presenceState())));
    }).subscribe(async (status) => {
      if (status === "SUBSCRIBED") await ch.track({ at: Date.now() });
    });
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id]);

  /* ---------------- signalling helpers ---------------- */
  const getOutbound = useCallback((toId: string) => {
    let p = outbound.current.get(toId);
    if (!p) {
      p = new Promise<RealtimeChannel>((resolve) => {
        const ch = supabase.channel(`inbox:${toId}`);
        ch.subscribe((status) => {
          if (status === "SUBSCRIBED") resolve(ch);
        });
      });
      outbound.current.set(toId, p);
    }
    return p;
  }, []);

  const sendSignal = useCallback(
    async (toId: string, payload: Record<string, unknown>) => {
      const ch = await getOutbound(toId);
      await ch.send({
        type: "broadcast",
        event: "signal",
        payload: { ...payload, from: userRef.current?.id },
      });
    },
    [getOutbound]
  );

  useEffect(() => {
    const map = outbound.current;
    return () => {
      map.forEach((p) => p.then((ch) => supabase.removeChannel(ch)).catch(() => {}));
      map.clear();
    };
  }, [user?.id]);

  /* ---------------- call lifecycle ---------------- */
  const teardown = useCallback(() => {
    window.clearTimeout(ringTimer.current);
    pcRef.current?.close();
    pcRef.current = null;
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    pendingIce.current = [];
    setCall(null);
  }, []);

  const closeCall = useCallback(
    (outcome: Outcome, notify: boolean) => {
      const c = callRef.current;
      if (!c) return;
      callRef.current = null; // guard against double-closing

      if (notify) {
        const type = c.connectedAt ? "end" : c.direction === "out" ? "cancel" : "reject";
        sendSignal(c.peerId, { type, callId: c.callId }).catch(() => {});
      }

      // The caller writes the call record into the chat (once).
      if (c.direction === "out" && userRef.current) {
        const duration = c.connectedAt ? Math.round((Date.now() - c.connectedAt) / 1000) : 0;
        void supabase
          .from("messages")
          .insert({
            conversation_id: c.conversationId,
            sender_id: userRef.current.id,
            kind: "call",
            body: c.video ? "video" : "voice",
            duration_seconds: duration,
            meta: { outcome },
          })
          .then(() => {});
      }
      teardown();
    },
    [sendSignal, teardown]
  );

  const flushIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    for (const cand of pendingIce.current.splice(0)) {
      try {
        await pc.addIceCandidate(cand);
      } catch {
        /* ignore stale candidates */
      }
    }
  }, []);

  const ensurePc = useCallback(
    (stream: MediaStream) => {
      if (pcRef.current) return pcRef.current;
      const c = callRef.current!;
      const pc = new RTCPeerConnection(rtcConfig());
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const remote = new MediaStream();
      pc.ontrack = (e) => {
        e.streams[0]?.getTracks().forEach((t) => {
          if (!remote.getTracks().some((r) => r.id === t.id)) remote.addTrack(t);
        });
        setCall((x) => (x ? { ...x, remoteStream: remote } : x));
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendSignal(c.peerId, { type: "ice", callId: c.callId, candidate: e.candidate.toJSON() }).catch(() => {});
        }
      };
      pc.onconnectionstatechange = () => {
        const cur = callRef.current;
        if (!cur || cur.callId !== c.callId) return;
        if (pc.connectionState === "connected") {
          cur.connectedAt = cur.connectedAt ?? Date.now();
          setCall((x) => (x ? { ...x, phase: "connected", startedAt: cur.connectedAt } : x));
        } else if (pc.connectionState === "failed") {
          toast.error("Call connection lost");
          closeCall(cur.connectedAt ? "completed" : "missed", true);
        }
      };
      pcRef.current = pc;
      return pc;
    },
    [sendSignal, closeCall]
  );

  const handleSignal = useCallback(
    async (s: any) => {
      const c = callRef.current;
      const me = userRef.current;
      if (!me || !s?.type) return;

      switch (s.type) {
        case "invite": {
          if (c) {
            sendSignal(s.from, { type: "busy", callId: s.callId }).catch(() => {});
            return;
          }
          // Only accept calls from someone I actually share a conversation with.
          const { data: conv } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", s.conversationId)
            .maybeSingle();
          const cv = conv as Conversation | null;
          if (!cv || ![cv.customer_id, cv.vendor_id].includes(s.from)) return;
          if (callRef.current) return;

          callRef.current = {
            callId: s.callId,
            peerId: s.from,
            conversationId: s.conversationId,
            video: !!s.video,
            direction: "in",
          };
          setCall({
            phase: "incoming",
            callId: s.callId,
            video: !!s.video,
            direction: "in",
            conversationId: s.conversationId,
            peer: { id: s.from, name: s.caller?.name ?? otherName(cv, me.id), avatar: s.caller?.avatar ?? null },
            localStream: null,
            remoteStream: null,
            muted: false,
            cameraOff: false,
          });
          ringTimer.current = window.setTimeout(() => closeCall("missed", false), 50000);
          break;
        }
        case "cancel":
          if (c?.callId === s.callId) closeCall("missed", false);
          break;
        case "reject":
        case "busy":
          if (c?.callId === s.callId) {
            if (s.type === "busy") toast.info("They're on another call");
            closeCall("declined", false);
          }
          break;
        case "accept": {
          if (!c || c.callId !== s.callId || c.direction !== "out" || !localRef.current) return;
          window.clearTimeout(ringTimer.current);
          setCall((x) => (x ? { ...x, phase: "connecting" } : x));
          const pc = ensurePc(localRef.current);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendSignal(c.peerId, { type: "offer", callId: c.callId, sdp: offer });
          break;
        }
        case "offer": {
          const pc = pcRef.current;
          if (!c || c.callId !== s.callId || !pc) return;
          await pc.setRemoteDescription(s.sdp);
          await flushIce();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(c.peerId, { type: "answer", callId: c.callId, sdp: answer });
          break;
        }
        case "answer": {
          const pc = pcRef.current;
          if (!c || c.callId !== s.callId || !pc) return;
          await pc.setRemoteDescription(s.sdp);
          await flushIce();
          break;
        }
        case "ice": {
          if (!c || c.callId !== s.callId) return;
          const pc = pcRef.current;
          if (pc && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(s.candidate);
            } catch {
              /* ignore */
            }
          } else {
            pendingIce.current.push(s.candidate);
          }
          break;
        }
        case "end":
          if (c?.callId === s.callId) closeCall("completed", false);
          break;
      }
    },
    [sendSignal, closeCall, ensurePc, flushIce]
  );

  // My personal "inbox" channel: invites and WebRTC signals arrive here.
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`inbox:${user.id}`)
      .on("broadcast", { event: "signal" }, ({ payload }) => {
        handleSignal(payload).catch((e) => console.error("[call] signal error", e));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id, handleSignal]);

  // End any live call if the user signs out / provider unmounts.
  useEffect(() => {
    if (!user && callRef.current) closeCall("missed", true);
  }, [user, closeCall]);

  /* ---------------- public actions ---------------- */
  const startCall = useCallback(
    async (conv: Conversation, video: boolean) => {
      const me = userRef.current;
      if (!me) return;
            if (conv.blocked) {
        toast.error("This chat is blocked.");
        return;
      }
      if (callRef.current) {
        toast.info("You're already in a call");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Calls need a secure (https) connection.");
        return;
      }
      let stream: MediaStream;
      try {
        stream = await getMedia(video);
      } catch {
        toast.error(video ? "Allow camera & microphone access to start a video call." : "Allow microphone access to start a call.");
        return;
      }
      const peerId = otherId(conv, me.id);
      const callId = crypto.randomUUID();
      localRef.current = stream;
      callRef.current = { callId, peerId, conversationId: conv.id, video, direction: "out" };
      setCall({
        phase: "calling",
        callId,
        video,
        direction: "out",
        conversationId: conv.id,
        peer: { id: peerId, name: otherName(conv, me.id), avatar: otherAvatar(conv, me.id) },
        localStream: stream,
        remoteStream: null,
        muted: false,
        cameraOff: false,
      });
      try {
        await sendSignal(peerId, {
          type: "invite",
          callId,
          conversationId: conv.id,
          video,
          caller: { name: myName(conv, me.id), avatar: myAvatar(conv, me.id) },
        });
      } catch {
        toast.error("Couldn't reach the server. Try again.");
        closeCall("missed", false);
        return;
      }
      ringTimer.current = window.setTimeout(() => closeCall("missed", true), 45000);
    },
    [sendSignal, closeCall]
  );

  const acceptCall = useCallback(async () => {
    const c = callRef.current;
    if (!c || c.direction !== "in") return;
    window.clearTimeout(ringTimer.current);
    let stream: MediaStream;
    try {
      stream = await getMedia(c.video);
    } catch {
      toast.error("Allow microphone/camera access to answer the call.");
      closeCall("declined", true);
      return;
    }
    localRef.current = stream;
    setCall((x) => (x ? { ...x, phase: "connecting", localStream: stream } : x));
    ensurePc(stream);
    await sendSignal(c.peerId, { type: "accept", callId: c.callId });
  }, [closeCall, ensurePc, sendSignal]);

  const declineCall = useCallback(() => closeCall("declined", true), [closeCall]);
  const hangUp = useCallback(
    () => closeCall(callRef.current?.connectedAt ? "completed" : "missed", true),
    [closeCall]
  );

  const toggleMute = useCallback(() => {
    const tracks = localRef.current?.getAudioTracks() ?? [];
    const next = !tracks.every((t) => !t.enabled);
    tracks.forEach((t) => (t.enabled = !next));
    setCall((x) => (x ? { ...x, muted: next } : x));
  }, []);

  const toggleCamera = useCallback(() => {
    const tracks = localRef.current?.getVideoTracks() ?? [];
    const next = !tracks.every((t) => !t.enabled);
    tracks.forEach((t) => (t.enabled = !next));
    setCall((x) => (x ? { ...x, cameraOff: next } : x));
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({ onlineIds, startCall, inCall: !!call }),
    [onlineIds, startCall, call]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      {user && call && (
        <CallOverlay
          call={call}
          onAccept={acceptCall}
          onDecline={declineCall}
          onHangUp={hangUp}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
        />
      )}
    </ChatContext.Provider>
  );
}
