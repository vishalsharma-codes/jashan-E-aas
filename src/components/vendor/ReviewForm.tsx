import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { PublicReview } from "@/components/vendor/VendorProfileView";

// Change this to your real login route.
const LOGIN_PATH = "/auth";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// vendor_reviews may not be in your generated Supabase types yet, so use an untyped client here.
const db = supabase as any;

export function ReviewForm({ vendorId, vendorName, onSaved }: {
  vendorId: string;
  vendorName: string;
  onSaved: (review: PublicReview) => void;
}) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined); // undefined = still checking
  const [authorName, setAuthorName] = useState("Guest");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReview, setHasReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let off = false;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (off) return;
      setUserId(user?.id ?? null);
      if (!user) return;

      const [prof, mine] = await Promise.all([
        db.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        db.from("vendor_reviews").select("*").eq("vendor_id", vendorId).eq("user_id", user.id).maybeSingle(),
      ]);
      if (off) return;

      setAuthorName(
        prof.data?.display_name || (user.user_metadata as any)?.full_name || user.email?.split("@")[0] || "Guest",
      );
      if (mine.data) {
        setHasReview(true);
        setRating(Number(mine.data.rating) || 0);
        setComment(mine.data.comment ?? "");
      }
    })();
    return () => { off = true; };
  }, [vendorId]);

  const submit = async () => {
    if (!userId) return;
    if (rating < 1) { setError("Choose a star rating first."); return; }
    setBusy(true);
    setError("");
    const text = comment.trim();
    const { data, error: err } = await db
      .from("vendor_reviews")
      .upsert(
        { vendor_id: vendorId, user_id: userId, rating, comment: text, author: authorName },
        { onConflict: "vendor_id,user_id" },
      )
      .select()
      .single();
    setBusy(false);
    if (err || !data) { setError(err?.message ?? "Could not save your review. Try again."); return; }
    setHasReview(true);
    setSaved(true);
    onSaved({
      id: String(data.id),
      author: authorName,
      rating,
      text,
      created_at: data.created_at ?? new Date().toISOString(),
    });
  };

  if (userId === undefined) return null;

  const box = "mb-6 rounded-3xl border border-[#C44A68]/15 bg-[#FFF1EC] p-5";

  if (userId === null) {
    return (
      <div className={box}>
        <p className="font-serif text-lg font-bold text-[#4A1230]">Worked with {vendorName}?</p>
        <p className="mt-1 text-sm text-[#4A3440]/75">Log in to share your experience with other clients.</p>
        <a href={LOGIN_PATH} className="mt-3 inline-block rounded-xl bg-gradient-to-r from-[#E0708A] to-[#C44A68] px-5 py-2.5 text-sm font-bold text-white hover:brightness-105">
          Log in to review
        </a>
      </div>
    );
  }

  if (userId === vendorId) {
    return (
      <div className={box}>
        <p className="text-sm text-[#4A3440]/75">This is your own business, so you can't review it. Clients will see their reviews here.</p>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <div className={box}>
      <p className="font-serif text-lg font-bold text-[#4A1230]">
        {hasReview ? "Your review" : `Review ${vendorName}`}
      </p>

      <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`${s} ${s === 1 ? "star" : "stars"}`}
            onMouseEnter={() => setHover(s)}
            onClick={() => { setRating(s); setError(""); setSaved(false); }}
            className="rounded p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C44A68]"
          >
            <Star className={`h-8 w-8 transition-colors ${s <= shown ? "fill-[#E0708A] text-[#E0708A]" : "text-[#C44A68]/30"}`} />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-[#4A3440]/75">{LABELS[shown]}</span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => { setComment(e.target.value); setSaved(false); }}
        maxLength={600}
        rows={4}
        placeholder="What was it like working with them? (optional)"
        className="mt-4 w-full resize-none rounded-xl border border-[#C44A68]/20 bg-white/70 px-3 py-2.5 text-sm text-[#4A1230] outline-none placeholder:text-[#4A3440]/45 focus:border-[#C44A68]"
      />
      <div className="mt-1 text-right text-[11px] text-[#4A3440]/50">{comment.length}/600</div>

      {error && <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="rounded-xl bg-gradient-to-r from-[#E0708A] to-[#C44A68] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(196,74,104,.3)] transition hover:brightness-105 disabled:opacity-60"
        >
          {busy ? "Saving…" : hasReview ? "Update review" : "Post review"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-700">Saved</span>}
      </div>
    </div>
  );
}