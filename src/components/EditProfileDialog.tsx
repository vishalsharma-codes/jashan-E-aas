// src/components/EditProfileDialog.tsx
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Pencil, Phone, CalendarDays, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
// Adjust this path if your Supabase client lives somewhere else.
import { supabase } from "@/integrations/supabase/client";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

/* Blush Peach: rose #C44A68, plum text #4A3440, cream/white surfaces */
const field =
  "relative rounded-xl border border-[#C44A68]/40 bg-[#FFFBF8] px-4 pt-2 pb-2 transition-colors focus-within:border-[#C44A68] focus-within:shadow-[0_0_12px_rgba(196,74,104,0.25)]";
const label = "block text-[11px] text-[#4A3440]/60";
const input =
  "w-full bg-transparent text-[15px] text-[#4A3440] outline-none placeholder:text-[#4A3440]/40 disabled:cursor-not-allowed disabled:text-[#4A3440]/60";

export default function EditProfileDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth() as any;
  const meta = user?.user_metadata ?? {};

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fill the form with current values every time the dialog opens
  useEffect(() => {
    if (!open) return;
    setFullName(meta.full_name || meta.name || "");
    setPhone(meta.phone || "");
    setCity(meta.city || "");
    setDob(meta.dob || "");
    setAvatarPreview(meta.avatar_url);
    setAvatarFile(null);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2 MB");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!fullName.trim()) return toast.error("Full name is required");
    if (phone && !/^[+\d][\d\s-]{6,17}$/.test(phone.trim())) {
      return toast.error("Enter a valid phone number");
    }

    setSaving(true);
    try {
      let avatar_url: string | undefined = meta.avatar_url;

      // Needs a PUBLIC storage bucket named "avatars" in Supabase
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        avatar_url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }

      // Saved in auth user_metadata, so no new database tables are needed
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          dob,
          avatar_url,
        },
      });
      if (error) throw error;

      toast.success("Profile updated");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[440px] rounded-[20px] border border-[#C44A68]/50 bg-gradient-to-b from-[#FFFBF8] to-[#FFF1EC] p-6 text-[#4A3440] shadow-[0_20px_60px_-15px_rgba(196,74,104,0.45)] sm:rounded-[20px]"
      >
        {/* ornate corners */}
        <span className="pointer-events-none absolute left-2 top-2 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-[#C44A68]/70" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-[#C44A68]/70" />

        <DialogTitle className="text-center font-display text-2xl tracking-[0.12em] text-[#4A1230]">
          EDIT PROFILE
        </DialogTitle>
        <DialogDescription className="sr-only">Update your personal details</DialogDescription>
        <div className="mx-auto -mt-2 h-px w-28 bg-gradient-to-r from-transparent via-[#C44A68] to-transparent" />

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-2 ring-[#C44A68]">
              <AvatarImage src={avatarPreview} alt={fullName} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-[#F4A6B8] to-[#C44A68] font-display text-3xl font-semibold text-white">
                {(fullName || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#C44A68] text-white shadow-md transition-transform hover:scale-110"
              aria-label="Change avatar"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickAvatar} />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-[#C44A68] hover:underline"
          >
            Change Avatar
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <label className={`${field} block`}>
            <span className={label}>Full Name</span>
            <input className={input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>

          <label className={`${field} block`}>
            <span className={label}>Email Address</span>
            <input className={input} value={user?.email ?? ""} disabled />
          </label>

          <label className={`${field} block`}>
            <span className={label}>Phone Number</span>
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#C44A68]" />
              <input
                className={input}
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className={`${field} block`}>
              <span className={label}>City</span>
              <span className="flex items-center gap-2">
                <input className={input} placeholder="Lucknow" value={city} onChange={(e) => setCity(e.target.value)} />
                <Pencil className="h-4 w-4 shrink-0 text-[#C44A68]" />
              </span>
            </label>

            <label className={`${field} block`}>
              <span className={label}>Date of Birth</span>
              <span className="flex items-center gap-2">
                <input
                  className={`${input} [color-scheme:light]`}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <CalendarDays className="h-4 w-4 shrink-0 text-[#C44A68]" />
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C44A68] via-[#E0708A] to-[#C44A68] py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-[#C44A68]/60 py-3 font-medium text-[#C44A68] transition-colors hover:bg-[#C44A68]/10"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}