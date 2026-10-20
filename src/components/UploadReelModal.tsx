import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const MAX_MB = 20;
const MAX_SECONDS = 30;
const ALLOWED_TYPES = ["video/mp4", "video/webm"];

interface UploadReelModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void | Promise<void>;
}

const readDuration = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This video could not be read."));
    };
    video.src = url;
  });

export const UploadReelModal = ({ open, onClose, onUploaded }: UploadReelModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // free the preview URL when it changes or the modal unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const close = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setError(null);

    if (!ALLOWED_TYPES.includes(picked.type)) {
      setError("Please choose an MP4 or WebM video.");
      return;
    }
    if (picked.size > MAX_MB * 1024 * 1024) {
      setError(`This video is ${(picked.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_MB} MB.`);
      return;
    }
    try {
      const seconds = await readDuration(picked);
      if (seconds > MAX_SECONDS) {
        setError(`This video is ${Math.round(seconds)} seconds long. The limit is ${MAX_SECONDS} seconds.`);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "This video could not be read.");
      return;
    }

    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const submit = async () => {
    if (!user || !file) return;
    setUploading(true);

    const ext = file.type === "video/webm" ? "webm" : "mp4";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("reels")
      .upload(path, file, { contentType: file.type, cacheControl: "3600" });

    if (uploadError) {
      setUploading(false);
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { error: insertError } = await supabase.from("reels").insert({
      user_id: user.id,
      video_path: path,
      caption: caption.trim() || null,
    });

    if (insertError) {
      // best effort: remove the orphaned file (needs the optional delete policy)
      await supabase.storage.from("reels").remove([path]);
      setUploading(false);
      toast({ title: "Could not save your jhalak", description: insertError.message, variant: "destructive" });
      return;
    }

    setUploading(false);
    toast({
      title: "Jhalak submitted",
      description: "It will be visible to everyone once it is approved. You can already see it.",
    });
    reset();
    onClose();
    await onUploaded();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="upload-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 z-[45] flex items-end justify-center bg-black/60"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90%] w-full max-w-[480px] flex-col rounded-t-3xl bg-card text-foreground"
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/40" />

            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="w-6" />
              <h3 className="text-sm font-semibold">Upload a jhalak</h3>
              <button type="button" onClick={close} aria-label="Close upload" disabled={uploading}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div data-lenis-prevent className="space-y-4 overflow-y-auto px-4 py-4">
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm"
                onChange={handlePick}
                className="hidden"
              />

              {previewUrl ? (
                <div className="mx-auto w-40 overflow-hidden rounded-xl bg-black">
                  <video src={previewUrl} controls playsInline muted className="aspect-[9/16] w-full object-contain" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-sm text-muted-foreground hover:border-gold/60 hover:text-foreground"
                >
                  <Film className="h-8 w-8" />
                  Choose a video
                  <span className="text-xs">MP4 or WebM, up to {MAX_SECONDS} seconds and {MAX_MB} MB</span>
                </button>
              )}

              {file && !uploading && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mx-auto block text-xs font-medium text-gold"
                >
                  Choose a different video
                </button>
              )}

              {error && <p className="text-sm text-[#ff3040]">{error}</p>}

              <div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={150}
                  rows={2}
                  placeholder="Write a caption..."
                  className="w-full resize-none rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:border-gold/60"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">{caption.length}/150</p>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={!file || uploading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold text-background disabled:opacity-40"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  "Upload jhalak"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
