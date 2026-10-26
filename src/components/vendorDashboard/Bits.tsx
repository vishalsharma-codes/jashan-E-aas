import { useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Loader2, Plus, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const inputCls =
  "w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold";

export const chipCls = (on: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs transition-all ${on ? "border-gold bg-gold text-background" : "border-border bg-muted hover:border-gold/60"}`;

export const Field = ({ label, hint, required, children, className = "" }: {
  label: string; hint?: string; required?: boolean; children: ReactNode; className?: string;
}) => (
  <div className={className}>
    <p className="mb-1.5 text-sm font-semibold">{label}{required && <span className="text-gold"> *</span>}</p>
    {children}
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const Select = ({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: (string | { value: string; label: string })[]; placeholder?: string;
}) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => typeof o === "string"
      ? <option key={o} value={o}>{o}</option>
      : <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export const TextArea = ({ value, onChange, rows = 4, placeholder, maxLength }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; maxLength?: number;
}) => (
  <textarea rows={rows} value={value} maxLength={maxLength} placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-none`} />
);

export function ChipPicker({ options = [], value, onChange, max, allowCustom, placeholder = "Add your own and press Enter" }: {
  options?: string[]; value: string[]; onChange: (v: string[]) => void; max?: number; allowCustom?: boolean; placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const full = !!max && value.length >= max;
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter((v) => v !== o));
    else if (!full) onChange([...value, o]);
  };
  const add = () => {
    const t = draft.trim();
    if (!t || value.includes(t) || full) return;
    onChange([...value, t]);
    setDraft("");
  };
  const all = [...options, ...value.filter((v) => !options.includes(v))];
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {all.map((o) => (
          <button type="button" key={o} onClick={() => toggle(o)} className={chipCls(value.includes(o))}>{o}</button>
        ))}
      </div>
      {allowCustom && (
        <div className="mt-2 flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} className={inputCls} />
          <button type="button" onClick={add} aria-label="Add" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/50 text-gold hover:bg-gold/10">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      {max && <p className="mt-1 text-xs text-muted-foreground">{value.length} of {max} chosen</p>}
    </div>
  );
}

export const Card = ({ title, subtitle, action, children, className = "" }: {
  title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string;
}) => (
  <section className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
    {(title || action) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {title && <h2 className="font-serif text-lg font-bold">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const Stat = ({ label, value, sub, icon: Icon }: { label: string; value: ReactNode; sub?: string; icon: ElementType }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center justify-between text-muted-foreground">
      <span className="text-sm">{label}</span>
      <Icon className="h-4 w-4 text-gold" />
    </div>
    <p className="mt-2 font-serif text-2xl font-bold">{value}</p>
    {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
  </div>
);

export const Empty = ({ icon: Icon, title, text, action }: { icon: ElementType; title: string; text: string; action?: ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
    <Icon className="mx-auto mb-3 h-9 w-9 text-gold/70" />
    <p className="font-semibold">{title}</p>
    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export const Pill = ({ tone, children }: { tone: "green" | "amber" | "red" | "blue" | "grey"; children: ReactNode }) => {
  const t = {
    green: "bg-emerald-500/15 text-emerald-700", amber: "bg-amber-500/15 text-amber-700",
    red: "bg-red-500/15 text-red-600", blue: "bg-sky-500/15 text-sky-700", grey: "bg-muted text-muted-foreground",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t}`}>{children}</span>;
};

/* ───────── Uploads ───────── */

export async function uploadTo(bucket: string, userId: string, folder: string, file: File) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const url = bucket === "vendor-media" ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : "";
  return { path, url };
}

export function FilePick({ label, accept = "image/*", multiple, busy, onFiles }: {
  label: string; accept?: string; multiple?: boolean; busy?: boolean; onFiles: (files: File[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" hidden accept={accept} multiple={multiple}
        onChange={(e) => { const fs = Array.from(e.target.files ?? []); e.target.value = ""; if (fs.length) onFiles(fs); }} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gold/60 px-4 py-2.5 text-sm text-gold transition-colors hover:bg-gold/10 disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        {busy ? "Uploading…" : label}
      </button>
    </>
  );
}