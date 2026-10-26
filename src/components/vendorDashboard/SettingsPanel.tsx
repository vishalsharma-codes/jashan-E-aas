import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Clock, FileText, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { VendorPrivate, VendorProfileRow } from "@/lib/vendorOptions";
import { Card, FilePick, Pill, uploadTo } from "./Bits";
import { VendorProfileForm } from "./VendorProfileForm";
import type { SaveFn } from "./useVendorProfile";

const DOC_TYPES = [
  { id: "id_proof", label: "ID proof", hint: "Aadhaar, PAN, passport or driving licence" },
  { id: "business_proof", label: "Business proof", hint: "GST certificate, Udyam, shop licence (if you have one)" },
];

interface Doc { id: string; doc_type: string; file_path: string; file_name: string }

export function SettingsPanel({ userId, profile, priv, save, onDocsChange }: {
  userId: string; profile: VendorProfileRow; priv: VendorPrivate; save: SaveFn; onDocsChange: () => void;
}) {
  const { toast } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState("");
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("vendor_documents").select("*").eq("vendor_id", userId).order("created_at", { ascending: false });
    setDocs(data ?? []);
    onDocsChange();
  }, [userId, onDocsChange]);
  useEffect(() => { void load(); }, [load]);

  const upload = async (type: string, files: File[]) => {
    const file = files[0];
    if (file.size > 8 * 1024 * 1024) { toast({ title: "File is over 8 MB", variant: "destructive" }); return; }
    setBusy(type);
    try {
      const { path } = await uploadTo("vendor-docs", userId, type, file);
      const { error } = await supabase.from("vendor_documents").insert({ vendor_id: userId, doc_type: type, file_path: path, file_name: file.name });
      if (error) throw error;
      await load();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    setBusy("");
  };

  const open = async (d: Doc) => {
    const { data, error } = await supabase.storage.from("vendor-docs").createSignedUrl(d.file_path, 60);
    if (error || !data) toast({ title: "Could not open file", description: error?.message, variant: "destructive" });
    else window.open(data.signedUrl, "_blank", "noopener");
  };

  const remove = async (d: Doc) => {
    await supabase.from("vendor_documents").delete().eq("id", d.id);
    await supabase.storage.from("vendor-docs").remove([d.file_path]);
    await load();
  };

  const request = async () => {
    if (!docs.some((d) => d.doc_type === "id_proof")) { toast({ title: "Upload an ID proof first.", variant: "destructive" }); return; }
    setRequesting(true);
    const { error } = await save({ verification_status: "pending" });
    setRequesting(false);
    if (error) toast({ title: "Could not send request", description: error.message, variant: "destructive" });
    else toast({ title: "Verification requested", description: "We review documents within 2 working days." });
  };

  const vs = profile.verification_status;

  return (
    <div className="space-y-5">
      <VendorProfileForm userId={userId} profile={profile} priv={priv} save={save} sections={["contact"]} />

      <Card title="Verified badge" subtitle="Verified vendors rank higher and get more bookings."
        action={vs === "verified" ? <Pill tone="green"><BadgeCheck className="mr-1 h-3.5 w-3.5" />Verified</Pill>
          : vs === "pending" ? <Pill tone="amber"><Clock className="mr-1 h-3.5 w-3.5" />In review</Pill>
          : vs === "rejected" ? <Pill tone="red"><ShieldAlert className="mr-1 h-3.5 w-3.5" />Needs new documents</Pill> : <Pill tone="grey">Not verified</Pill>}>
        <div className="space-y-4">
          {DOC_TYPES.map((t) => (
            <div key={t.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-semibold">{t.label}</p><p className="text-xs text-muted-foreground">{t.hint}</p></div>
                <FilePick label="Upload file" accept="image/*,application/pdf" busy={busy === t.id} onFiles={(fs) => upload(t.id, fs)} />
              </div>
              <ul className="mt-3 space-y-1.5">
                {docs.filter((d) => d.doc_type === t.id).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                    <button type="button" onClick={() => open(d)} className="flex min-w-0 items-center gap-2 text-left hover:text-gold"><FileText className="h-4 w-4 shrink-0" /><span className="truncate">{d.file_name}</span></button>
                    <button type="button" aria-label={`Delete ${d.file_name}`} onClick={() => remove(d)}><Trash2 className="h-4 w-4 text-red-500" /></button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Documents are private. Only you and the review team can open them.</p>
          {vs !== "verified" && vs !== "pending" && (
            <Button disabled={requesting} onClick={request} className="bg-gold font-semibold text-background hover:bg-gold-dark">Request verification</Button>
          )}
        </div>
      </Card>
    </div>
  );
}