import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clapperboard, ExternalLink, Heart, Loader2, MessageCircle, Play, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UploadReelModal } from "@/components/UploadReelModal";
import { useConversations } from "@/hooks/useChat";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChatContext } from "@/components/chat/ChatProvider";
import { cn } from "@/lib/utils";
import { Card, Empty, Pill, inputCls } from "./Bits";

/* ───────── My Jhalaks: upload, see, delete ───────── */

interface MyReel { id: string; video_path: string; caption: string | null; status: string; created_at: string; url: string; likes: number; comments: number }

export function ReelsPanel({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [reels, setReels] = useState<MyReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [playing, setPlaying] = useState<MyReel | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("reels").select("id, video_path, caption, status, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false });
    if (error) { toast({ title: "Could not load your jhalaks", description: error.message, variant: "destructive" }); setLoading(false); return; }
    const list = data ?? [];
    const ids = list.map((r: any) => r.id);
    const likes: Record<string, number> = {}, comments: Record<string, number> = {};
    if (ids.length) {
      const [l, c] = await Promise.all([
        supabase.from("likes").select("reel_id").in("reel_id", ids),
        supabase.from("comments").select("reel_id").in("reel_id", ids),
      ]);
      (l.data ?? []).forEach((x: any) => { likes[x.reel_id] = (likes[x.reel_id] ?? 0) + 1; });
      (c.data ?? []).forEach((x: any) => { comments[x.reel_id] = (comments[x.reel_id] ?? 0) + 1; });
    }
    setReels(list.map((r: any) => ({
      ...r, url: supabase.storage.from("reels").getPublicUrl(r.video_path).data.publicUrl,
      likes: likes[r.id] ?? 0, comments: comments[r.id] ?? 0,
    })));
    setLoading(false);
  }, [userId, toast]);
  useEffect(() => { void load(); }, [load]);

  const remove = async (r: MyReel) => {
    if (!window.confirm("Delete this jhalak for good?")) return;
    const { error } = await supabase.from("reels").delete().eq("id", r.id).eq("user_id", userId);
    if (error) { toast({ title: "Could not delete", description: error.message, variant: "destructive" }); return; }
    await supabase.storage.from("reels").remove([r.video_path]);
    await load();
  };

  return (
    <div className="space-y-5">
      <Card title="My Jhalaks" subtitle="Short videos of your work. New uploads are reviewed before they appear in the public feed."
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild><Link to="/reels"><Play className="mr-1.5 h-4 w-4" />Watch the Jhalak feed</Link></Button>
            <Button size="sm" onClick={() => setUploadOpen(true)} className="bg-gold text-background hover:bg-gold-dark"><Clapperboard className="mr-1.5 h-4 w-4" />Upload a Jhalak</Button>
          </div>
        }>
        {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          : reels.length === 0 ? (
            <Empty icon={Clapperboard} title="Post your first Jhalak"
              text="A 15 to 60 second vertical video of a real event does more than a photo. Customers can like and comment, and your badge shows you are a vendor."
              action={<Button onClick={() => setUploadOpen(true)} className="bg-gold text-background hover:bg-gold-dark">Upload a Jhalak</Button>} />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {reels.map((r) => (
                <article key={r.id} className="overflow-hidden rounded-2xl border border-border bg-background">
                  <button type="button" onClick={() => setPlaying(r)} aria-label="Play jhalak" className="group relative block aspect-[9/16] w-full bg-black">
                    <video src={`${r.url}#t=0.5`} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-black/20 transition group-hover:bg-black/40">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-black/55"><Play className="ml-0.5 h-6 w-6 text-white" fill="white" /></span>
                    </span>
                    <span className="absolute left-2 top-2"><Pill tone={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "amber"}>{r.status === "approved" ? "Live" : r.status === "rejected" ? "Rejected" : "In review"}</Pill></span>
                  </button>
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm">{r.caption || "No caption"}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{r.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{r.comments}</span>
                      </span>
                      <button type="button" onClick={() => remove(r)} aria-label="Delete jhalak" className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        <p className="mt-4 text-xs text-muted-foreground">
          More tools on the <Link to="/my-reels" className="inline-flex items-center gap-1 text-gold underline">My Reels page<ExternalLink className="h-3 w-3" /></Link>.
        </p>
      </Card>

      <UploadReelModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={async () => { setUploadOpen(false); await load(); }} />

      {playing && (
        <div role="dialog" aria-label="Jhalak preview" className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4" onClick={() => setPlaying(null)}>
          <div className="relative h-full max-h-[90vh] aspect-[9/16]" onClick={(e) => e.stopPropagation()}>
            <video src={playing.url} controls autoPlay playsInline loop className="h-full w-full rounded-2xl bg-black object-contain" />
            <button type="button" aria-label="Close preview" onClick={() => setPlaying(null)} className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-black"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Reviews ───────── */

interface ReviewRow { id: string; customer_id: string; rating: number; comment: string; vendor_reply: string | null; created_at: string; name?: string }

export function ReviewsPanel({ userId, rating, count }: { userId: string; rating: number; count: number }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data } = await supabase.from("vendor_reviews").select("*").eq("vendor_id", userId).order("created_at", { ascending: false });
    const list: ReviewRow[] = data ?? [];
    const ids = Array.from(new Set(list.map((r) => r.customer_id)));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, display_name").in("id", ids);
      const names = new Map<string, string>((ps ?? []).map((p: any) => [p.id, p.display_name]));
      list.forEach((r) => { r.name = names.get(r.customer_id) || "Customer"; });
    }
    setRows(list);
    setLoading(false);
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const reply = async (id: string) => {
    const text = (drafts[id] ?? "").trim();
    if (!text) return;
    const { error } = await supabase.from("vendor_reviews").update({ vendor_reply: text }).eq("id", id);
    if (error) toast({ title: "Could not post reply", description: error.message, variant: "destructive" });
    else { setDrafts((d) => ({ ...d, [id]: "" })); await load(); }
  };

  return (
    <Card title="Customer reviews" subtitle={count ? `${rating.toFixed(1)} average from ${count} review${count === 1 ? "" : "s"}` : "Customers can review you after a completed booking."}>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? (
        <Empty icon={Star} title="No reviews yet" text="Mark bookings as completed once the event is done. That is what lets customers leave a review." />
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{r.name}</p>
                <span className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-gold text-gold" : "text-border"}`} />)}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              {r.vendor_reply ? (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm"><span className="font-semibold">Your reply: </span>{r.vendor_reply}</p>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input className={inputCls} placeholder="Reply publicly" value={drafts[r.id] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))} />
                  <Button variant="outline" onClick={() => reply(r.id)}>Reply</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ───────── Baatein inside the dashboard (same components as /chat) ───────── */

export function MessagesPanel({ userId }: { userId: string }) {
  const { conversations, loading } = useConversations();
  const { onlineIds } = useChatContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Customers message you from your profile. Keep quotes and payments here: sharing phone numbers or asking to leave the platform is flagged by Baatein moderation.{" "}
        <Link to="/chat" className="text-gold underline">Open full screen</Link>
      </p>
      <div className="flex h-[calc(100dvh-16rem)] min-h-[480px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <aside className={cn("w-full shrink-0 border-border md:w-[320px] md:border-r", active ? "hidden md:block" : "block")}>
          <ConversationList conversations={conversations} loading={loading} activeId={active?.id ?? null}
            userId={userId} onlineIds={onlineIds} onSelect={(id: string) => setActiveId(id)} />
        </aside>
        <section className={cn("min-w-0 flex-1", active ? "block" : "hidden md:block")}>
          {active ? (
            <ChatWindow key={active.id} conversation={active} userId={userId} onBack={() => setActiveId(null)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10"><MessageCircle className="h-8 w-8 text-gold" /></span>
              <h3 className="font-serif text-xl font-bold">Your conversations</h3>
              <p className="max-w-xs text-sm text-muted-foreground">Pick a chat on the left to reply, send a quote, or start a voice or video call.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}