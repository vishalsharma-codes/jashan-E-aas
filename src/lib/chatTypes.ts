export type MessageKind = "text" | "image" | "file" | "voice" | "call";

export interface Conversation {
  id: string;
  customer_id: string;
  vendor_id: string;
  customer_name: string;
  vendor_name: string;
  vendor_avatar: string | null;
  vendor_service: string | null;
  last_message: string | null;
  last_message_at: string;
  customer_unread: number;
  vendor_unread: number;
  created_at: string;
    blocked?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  kind: MessageKind;
  body: string | null;
  media_url: string | null;
  duration_seconds: number | null;
  meta: Record<string, any>;
  created_at: string;
  read_at: string | null;
}

export type CallPhase = "calling" | "incoming" | "connecting" | "connected";

export interface CallState {
  phase: CallPhase;
  callId: string;
  video: boolean;
  direction: "out" | "in";
  conversationId: string;
  peer: { id: string; name: string; avatar: string | null };
  startedAt?: number;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
}

// ---- helpers: "who is the other person in this conversation?" ----------
export const iAmCustomer = (c: Conversation, uid: string) => c.customer_id === uid;
export const otherId = (c: Conversation, uid: string) => (iAmCustomer(c, uid) ? c.vendor_id : c.customer_id);
export const otherName = (c: Conversation, uid: string) => (iAmCustomer(c, uid) ? c.vendor_name : c.customer_name);
export const otherAvatar = (c: Conversation, uid: string) => (iAmCustomer(c, uid) ? c.vendor_avatar : null);
export const myName = (c: Conversation, uid: string) => (iAmCustomer(c, uid) ? c.customer_name : c.vendor_name);
export const myAvatar = (c: Conversation, uid: string) => (iAmCustomer(c, uid) ? null : c.vendor_avatar);
export const myUnread = (c: Conversation, uid: string) => (iAmCustomer(c, uid) ? c.customer_unread : c.vendor_unread);

export function userDisplayName(user: any): string {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Guest"
  );
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
