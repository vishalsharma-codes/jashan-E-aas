// src/lib/communityApi.ts
// Data layer for the Community page. Replaces localStorage + IndexedDB.
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// The generated Database types don't know the cm_* tables yet, so table queries use an untyped handle.
// (auth + storage keep the fully typed client.)
const db: any = supabase;

/* ------------------------------- Types ------------------------------- */

export type Membership = "joined" | "pending";

export interface ApiCommunity {
  id: string;
  slug: string;
  icon: string;
  type: string;
  name: string;
  members: number;
  admin: string;      // admin display name
  adminId: string;
  purpose: string;
  tags: string[];
  cover?: string;
  avatar?: string;
  isVerified: boolean;
  posts: number;
  city: string;
  isPrivate: boolean;
}

export interface ApiComment { id: string; author: string; text: string }

export interface ApiPost {
  id: string;
  authorId: string;
  author: string;
  avatar: string; // initials
  communityId: string;
  community: string;
  time: string;
  content: string;
  likes: number;
  liked: boolean;
  comments: ApiComment[];
  commentCount: number;
  tags: string[];
  media?: { path: string; type: "image" | "video" };
  poll?: { options: { text: string; votes: number }[]; voted?: number };
  event?: string;
  location?: string;
}

export interface ApiEvent {
  id: string;
  communityId: string;
  community: string;
  title: string;
  organizer: string;
  date: string; // yyyy-mm-dd
  time: string;
  price: number;
  capacity: number;
  filled: number;
  location: string;
  icon: string;
  image?: string;
  myBooking?: number;
  onWaitlist: boolean;
}

/* ------------------------------ Helpers ------------------------------ */

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const initialsOf = (name: string) =>
  name.split(" ").map((w: any) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

async function requireUser(): Promise<User> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please sign in to continue");
  return data.user;
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

/* -------------------------------- Auth -------------------------------- */

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, loading };
}

/* ----------------------------- Communities ----------------------------- */

const COMMUNITY_SELECT = "*, admin:cm_profiles!cm_communities_admin_id_fkey(display_name)";

const mapCommunity = (r: any): ApiCommunity => ({
  id: r.id,
  slug: r.slug,
  icon: r.icon,
  type: r.type,
  name: r.name,
  members: r.members_count,
  admin: r.admin?.display_name ?? "Member",
  adminId: r.admin_id,
  purpose: r.purpose,
  tags: r.tags ?? [],
  cover: r.cover_url ?? undefined,
  avatar: r.avatar_url ?? undefined,
  isVerified: r.is_verified,
  posts: r.posts_count,
  city: r.city,
  isPrivate: r.is_private,
});

export async function listCommunities(): Promise<ApiCommunity[]> {
  const { data, error } = await supabase
    .from("cm_communities").select(COMMUNITY_SELECT).order("members_count", { ascending: false });
  fail(error);
  return (data ?? []).map(mapCommunity);
}

async function uploadCommunityImage(dataUrl: string, userId: string): Promise<string> {
  const blob = await dataUrlToBlob(dataUrl);
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("community-images")
    .upload(path, blob, { contentType: "image/jpeg" });
  fail(error);
  return supabase.storage.from("community-images").getPublicUrl(path).data.publicUrl;
}

export async function createCommunity(input: {
  name: string; type: string; city: string; purpose: string; tags: string[];
  icon: string; isPrivate: boolean; coverDataUrl?: string | null; avatarDataUrl?: string | null;
}): Promise<ApiCommunity> {
  const user = await requireUser();
  const [cover_url, avatar_url] = await Promise.all([
    input.coverDataUrl ? uploadCommunityImage(input.coverDataUrl, user.id) : null,
    input.avatarDataUrl ? uploadCommunityImage(input.avatarDataUrl, user.id) : null,
  ]);
  const { data, error } = await db.from("cm_communities").insert({
    slug: slugify(input.name),
    name: input.name,
    type: input.type,
    city: input.city || "All India",
    purpose: input.purpose,
    tags: input.tags,
    icon: input.icon,
    is_private: input.isPrivate,
    cover_url, avatar_url,
    admin_id: user.id,
  }).select(COMMUNITY_SELECT).single();
  if (error?.code === "23505") throw new Error("A community with this name already exists.");
  fail(error);
  const created = mapCommunity(data);
  return { ...created, members: Math.max(1, created.members) };
}

/* ------------------------------ Membership ------------------------------ */

export async function myMemberships(): Promise<Record<string, Membership>> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return {};
  const { data, error } = await supabase
    .from("cm_members").select("community_id,status").eq("user_id", u.user.id);
  fail(error);
  return Object.fromEntries((data ?? []).map((m: any) => [m.community_id, m.status as Membership]));
}

/** Public -> joined instantly. Private -> pending (enforced by RLS). Returns resulting status. */
export async function joinCommunity(c: { id: string; isPrivate: boolean }): Promise<Membership> {
  const user = await requireUser();
  const status: Membership = c.isPrivate ? "pending" : "joined";
  const { error } = await db.from("cm_members")
    .insert({ community_id: c.id, user_id: user.id, status, role: "member" });
  fail(error);
  return status;
}

export async function leaveCommunity(communityId: string) {
  const user = await requireUser();
  const { error } = await db.from("cm_members")
    .delete().eq("community_id", communityId).eq("user_id", user.id);
  fail(error);
}

/** Admin: pending join requests for a community. */
export async function listJoinRequests(communityId: string) {
  const { data, error } = await db.from("cm_members")
    .select("user_id, created_at, profile:cm_profiles(display_name)")
    .eq("community_id", communityId).eq("status", "pending");
  fail(error);
  return (data ?? []).map((r: any) => ({ userId: r.user_id as string, name: (r.profile?.display_name ?? "Member") as string }));
}

export async function approveRequest(communityId: string, userId: string) {
  const { error } = await db.from("cm_members")
    .update({ status: "joined" }).eq("community_id", communityId).eq("user_id", userId);
  fail(error);
}

export async function rejectRequest(communityId: string, userId: string) {
  const { error } = await db.from("cm_members")
    .delete().eq("community_id", communityId).eq("user_id", userId);
  fail(error);
}

/* --------------------------------- Posts --------------------------------- */

const POST_SELECT = `
  *,
  author:cm_profiles!cm_posts_author_id_fkey(display_name),
  community:cm_communities!cm_posts_community_id_fkey(name),
  post_likes:cm_post_likes(user_id),
  poll_votes:cm_poll_votes(user_id, option_index),
  comments:cm_comments(id, text, created_at, author:cm_profiles!cm_comments_author_id_fkey(display_name))
`;

function mapPost(r: any, me?: string): ApiPost {
  const votes: { user_id: string; option_index: number }[] = r.poll_votes ?? [];
  const comments = [...(r.comments ?? [])]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((c: any) => ({ id: c.id, author: c.author?.display_name ?? "Member", text: c.text }));
  const authorName = r.author?.display_name ?? "Member";
  return {
    id: r.id,
    authorId: r.author_id,
    author: authorName,
    avatar: initialsOf(authorName),
    communityId: r.community_id,
    community: r.community?.name ?? "",
    time: timeAgo(r.created_at),
    content: r.content,
    likes: r.likes_count,
    liked: !!me && (r.post_likes ?? []).some((l: any) => l.user_id === me),
    comments,
    commentCount: r.comments_count,
    tags: r.tags ?? [],
    media: r.media_path ? { path: r.media_path, type: r.media_type } : undefined,
    poll: r.poll_options?.length
      ? {
          options: r.poll_options.map((text: string, i: number) => ({
            text, votes: votes.filter((v) => v.option_index === i).length,
          })),
          voted: me ? votes.find((v) => v.user_id === me)?.option_index : undefined,
        }
      : undefined,
    event: r.event_title ?? undefined,
    location: r.location ?? undefined,
  };
}

/** RLS already hides posts of private communities the user hasn't joined. */
export async function listPosts(communityId?: string): Promise<ApiPost[]> {
  const { data: u } = await supabase.auth.getUser();
  let q = db.from("cm_posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(50);
  if (communityId) q = q.eq("community_id", communityId);
  const { data, error } = await q;
  fail(error);
  return (data ?? []).map((r: any) => mapPost(r, u.user?.id));
}

export async function createPost(input: {
  communityId: string; content: string; tags: string[];
  event?: string; location?: string; pollOptions?: string[];
  media?: { file: File; type: "image" | "video" } | null;
}): Promise<ApiPost> {
  const user = await requireUser();
  let media_path: string | null = null;
  if (input.media) {
    const ext = (input.media.file.name.split(".").pop() || "bin").toLowerCase();
    media_path = `${input.communityId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("post-media")
      .upload(media_path, input.media.file, { contentType: input.media.file.type });
    fail(error);
  }
  const { data, error } = await db.from("cm_posts").insert({
    community_id: input.communityId,
    author_id: user.id,
    content: input.content,
    tags: input.tags,
    event_title: input.event ?? null,
    location: input.location ?? null,
    media_path,
    media_type: input.media?.type ?? null,
    poll_options: input.pollOptions && input.pollOptions.length >= 2 ? input.pollOptions : null,
  }).select(POST_SELECT).single();
  fail(error);
  return mapPost(data, user.id);
}

export async function getMediaUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("post-media").createSignedUrl(path, 60 * 60);
  fail(error);
  return data!.signedUrl;
}

export async function setLike(postId: string, like: boolean) {
  const user = await requireUser();
  const q = like
    ? db.from("cm_post_likes").insert({ post_id: postId, user_id: user.id })
    : db.from("cm_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
  fail((await q).error);
}

export async function addCommentApi(postId: string, text: string): Promise<ApiComment> {
  const user = await requireUser();
  const { data, error } = await db.from("cm_comments")
    .insert({ post_id: postId, author_id: user.id, text })
    .select("id, text, author:cm_profiles!cm_comments_author_id_fkey(display_name)").single();
  fail(error);
  return { id: data!.id, text: data!.text, author: (data as any).author?.display_name ?? "You" };
}

export async function votePollApi(postId: string, optionIndex: number) {
  const user = await requireUser();
  const { error } = await db.from("cm_poll_votes")
    .insert({ post_id: postId, user_id: user.id, option_index: optionIndex });
  fail(error);
}

/* --------------------------------- Events --------------------------------- */

export async function listEvents(): Promise<ApiEvent[]> {
  const { data: u } = await supabase.auth.getUser();
  const { data, error } = await db.from("cm_events")
    .select("*, community:cm_communities(name), organizer:cm_profiles!cm_events_organizer_id_fkey(display_name)")
    .gte("starts_on", new Date().toISOString().slice(0, 10))
    .order("starts_on", { ascending: true });
  fail(error);

  let bookings: Record<string, number> = {};
  let waitlist = new Set<string>();
  if (u.user) {
    const [b, w] = await Promise.all([
      db.from("cm_event_bookings").select("event_id,seats").eq("user_id", u.user.id),
      db.from("cm_event_waitlist").select("event_id").eq("user_id", u.user.id),
    ]);
    bookings = Object.fromEntries((b.data ?? []).map((x: any) => [x.event_id, x.seats]));
    waitlist = new Set((w.data ?? []).map((x: any) => x.event_id));
  }

  return (data ?? []).map((r: any) => ({
    id: r.id,
    communityId: r.community_id,
    community: r.community?.name ?? "",
    title: r.title,
    organizer: r.organizer?.display_name ?? "Organizer",
    date: r.starts_on,
    time: r.starts_at_label,
    price: r.price,
    capacity: r.capacity,
    filled: r.filled,
    location: r.location,
    icon: r.icon,
    image: r.image_url ?? undefined,
    myBooking: bookings[r.id],
    onWaitlist: waitlist.has(r.id),
  }));
}

export async function createEvent(input: {
  communityId: string; title: string; date: string; time: string;
  price: number; capacity: number; location: string; icon?: string;
}) {
  const user = await requireUser();
  const { error } = await db.from("cm_events").insert({
    community_id: input.communityId,
    organizer_id: user.id,
    title: input.title,
    starts_on: input.date,
    starts_at_label: input.time,
    price: input.price,
    capacity: input.capacity,
    location: input.location,
    icon: input.icon ?? "🎉",
  });
  fail(error);
}

export async function bookEventApi(eventId: string, seats: number) {
  fail((await db.rpc("cm_book_event", { p_event: eventId, p_seats: seats })).error);
}

export async function cancelBookingApi(eventId: string) {
  fail((await db.rpc("cm_cancel_event_booking", { p_event: eventId })).error);
}

export async function setWaitlist(eventId: string, on: boolean) {
  const user = await requireUser();
  const q = on
    ? db.from("cm_event_waitlist").insert({ event_id: eventId, user_id: user.id })
    : db.from("cm_event_waitlist").delete().eq("event_id", eventId).eq("user_id", user.id);
  fail((await q).error);
}