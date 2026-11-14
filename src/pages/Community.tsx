import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { ReactNode, ChangeEvent, FormEvent, ButtonHTMLAttributes, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import {
  Users, Heart, MessageSquare, Calendar, Plus, MapPin, Lock, Globe,
  X, Search, Check, Minus, Send, CheckCircle2, ShieldCheck,
  Image as ImageIcon, Tag, TrendingUp, Star, BarChart3, Flame, Share2,
  Megaphone, ClipboardCheck, CalendarDays, Wallet, Smile, Pin, Paperclip,
  ArrowLeft, ChevronDown, CheckCheck, Mic, MoreVertical, Play, Reply, Copy,
  Camera, Coffee, Award, Sparkles, Download, Clock, ChevronRight, Ticket,
} from "lucide-react";
import * as api from "@/lib/communityApi";
import { useAuthUser } from "@/lib/communityApi";

/* ----------------------------- Types & data ----------------------------- */

type TabKey = "communities" | "events" | "feed";
type Membership = "joined" | "pending";

type Community = api.ApiCommunity & { banner: string; featured?: "large" | "trending" };
type EventItem = api.ApiEvent & { banner: string; inclusions?: string[]; pastPhotos?: string[] };
const FEED_TABS = [
  { key: "chat", label: "Live Chat", Icon: MessageSquare },
  { key: "broadcast", label: "Broadcast Feed", Icon: Megaphone },
  { key: "tasks", label: "Tasks & Calendar", Icon: ClipboardCheck },
  { key: "events", label: "Community Events", Icon: CalendarDays },
  { key: "wallet", label: "Escrow Wallet", Icon: Wallet },
] as const;
type FeedTab = (typeof FEED_TABS)[number]["key"];
const EMOJIS = ["👍", "❤️", "👏", "😊", "🎉", "🙏", "🔥", "😂"];
/* ------------------------- Task tracker & calendar ------------------------- */
type TaskStatus = "todo" | "progress" | "done";
interface TaskUpdate { id: string; author: string; text: string; photos: string[]; at: number }
interface TaskComment { id: string; author: string; text: string; at: number }
interface Task {
  id: string; title: string; assignee: string; status: TaskStatus; progress: number;
  due: string; color: string; createdAt: number;
  updates: TaskUpdate[]; comments: TaskComment[];
  poll: { up: string[]; down: string[] } | null;
}
const TASK_COLS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "progress", label: "In Progress" },
  { key: "done", label: "Approved & Done" },
];
const TASK_COLORS = ["#8B1E3F", "#E8967A", "#D4AF37", "#1F6B45", "#4F46E5", "#0F766E"];
const WEDDING_TASKS = [
  "Wedding card design & distribution", "Bridal jewelry shopping", "Sangeet choreography & stage",
  "Book dhol players", "Venue deposit", "Caterer tasting",
];

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ago = (t: number) => {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
};
const loadTasks = (key: string): Task[] => {
  try { const v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; }
  catch { return []; }
};
const castVote = (t: Task, dir: "up" | "down", me: string): Task => {
  const p = t.poll ?? { up: [], down: [] };
  const had = p[dir].includes(me);
  const up = p.up.filter((n) => n !== me);
  const down = p.down.filter((n) => n !== me);
  if (!had) (dir === "up" ? up : down).push(me);
  return { ...t, poll: { up, down } };
};

function NameAvatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span
      title={name}
      className="rounded-full text-white font-bold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, background: gradientFor(name) }}
    >
      {initialsOf(name)}
    </span>
  );
}

function ApprovalPoll({ poll, me, disabled, onVote }: {
  poll: { up: string[]; down: string[] }; me: string; disabled?: boolean; onVote: (d: "up" | "down") => void;
}) {
  return (
    <div className="mt-3 rounded-xl bg-[#F5EFE6] p-2.5" onClick={(e) => e.stopPropagation()}>
      <p className="text-[11px] font-bold text-[#5E5754] mb-1.5">Approval poll</p>
      <div className="flex gap-2">
        {([["up", "👍", poll.up], ["down", "👎", poll.down]] as const).map(([dir, emoji, list]) => (
          <button
            key={dir}
            type="button"
            disabled={disabled}
            onClick={() => onVote(dir)}
            className={`flex-1 h-9 rounded-lg bg-white text-base font-semibold border transition-colors disabled:opacity-60 ${
              list.includes(me) ? "border-[#8B1E3F]" : "border-[#E9E1D5] hover:border-[#8B1E3F]/50"
            }`}
          >
            {emoji} <span className="text-xs text-[#5E5754]">{list.length}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskDetail({ task, me, canEdit, patch, move, remove, toast }: {
  task: Task; me: string; canEdit: boolean;
  patch: (id: string, fn: (t: Task) => Task) => void;
  move: (id: string, s: TaskStatus) => void;
  remove: (id: string) => void;
  toast: (t: string) => void;
}) {
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [pct, setPct] = useState(task.progress);
  const [comment, setComment] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/")).slice(0, 4 - photos.length);
    e.target.value = "";
    try {
      const urls = await Promise.all(files.map((f) => fileToDataUrl(f, 700)));
      setPhotos((p) => [...p, ...urls].slice(0, 4));
    } catch { toast("Couldn't read that image"); }
  };

  const postUpdate = () => {
    if (!text.trim() && photos.length === 0 && pct === task.progress) return;
    patch(task.id, (t) => ({
      ...t,
      progress: pct,
      status: pct >= 100 ? "done" : pct > 0 && t.status === "todo" ? "progress" : t.status,
      updates: [{ id: String(Date.now()), author: me, text: text.trim(), photos, at: Date.now() }, ...t.updates],
    }));
    setText(""); setPhotos([]);
  };

  const postComment = () => {
    const v = comment.trim();
    if (!v) return;
    patch(task.id, (t) => ({ ...t, comments: [...t.comments, { id: String(Date.now()), author: me, text: v, at: Date.now() }] }));
    setComment("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold"><NameAvatar name={task.assignee} size={28} /> {task.assignee}</span>
        {task.due && <span className="inline-flex items-center gap-1 text-xs text-[#5E5754]"><Calendar className="w-3.5 h-3.5 text-[#8B1E3F]" /> {dateFull(task.due)}</span>}
        {canEdit && (
          <select value={task.status} onChange={(e) => move(task.id, e.target.value as TaskStatus)} className={`${inputCls} !w-auto ml-auto !py-1.5`}>
            {TASK_COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2.5 rounded-full bg-[#EFE6D8] overflow-hidden">
            <div className="h-full rounded-full bg-[#8B1E3F]" style={{ width: `${task.progress}%` }} />
          </div>
          <b className="text-sm">{task.progress}%</b>
        </div>
      </div>

      {task.poll ? (
        <ApprovalPoll poll={task.poll} me={me} disabled={!canEdit} onVote={(d) => patch(task.id, (t) => castVote(t, d, me))} />
      ) : canEdit && (
        <Btn size="sm" variant="soft" onClick={() => patch(task.id, (t) => ({ ...t, poll: { up: [], down: [] } }))}>
          👍 Ask the group to approve
        </Btn>
      )}

      {canEdit && (
        <div className="rounded-2xl ring-1 ring-[#EADFD6] p-3.5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5E5754]">Post a progress update</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={400} placeholder="What's done so far? Share links, quotes, notes…" className={`${inputCls} resize-none`} />
          {photos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {photos.map((src, i) => (
                <span key={i} className="relative">
                  <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <button type="button" aria-label="Remove photo" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1A1818] text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#5E5754] w-16">Progress {pct}%</span>
            <input type="range" min={0} max={100} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="flex-1 accent-[#8B1E3F]" />
          </div>
          <div className="flex items-center justify-between">
            <Btn size="sm" variant="ghost" onClick={() => fileRef.current?.click()} disabled={photos.length >= 4}>
              <ImageIcon className="w-4 h-4 text-[#8B1E3F]" /> Add photos
            </Btn>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
            <Btn size="sm" onClick={postUpdate}>Post update</Btn>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#5E5754] mb-2">Updates</p>
        {task.updates.length === 0 ? <p className="text-sm text-[#5E5754]">No updates yet.</p> : (
          <div className="space-y-3">
            {task.updates.map((u) => (
              <div key={u.id} className="flex gap-2.5">
                <NameAvatar name={u.author} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs"><b className="text-sm">{u.author}</b> <span className="text-[#5E5754]">· {ago(u.at)}</span></p>
                  {u.text && <p className="text-sm text-[#1A1818] mt-0.5 whitespace-pre-wrap break-words">{u.text}</p>}
                  {u.photos.length > 0 && <div className="flex gap-1.5 flex-wrap mt-1.5">{u.photos.map((s, i) => <img key={i} src={s} alt="" className="w-20 h-20 rounded-lg object-cover" />)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#5E5754] mb-2">Group feedback</p>
        <div className="space-y-2">
          {task.comments.map((c) => (
            <div key={c.id} className="flex gap-2 items-start">
              <NameAvatar name={c.author} size={24} />
              <p className="text-sm rounded-2xl bg-[#F5EFE6] px-3 py-1.5"><b className="text-[#8B1E3F]">{c.author}</b> {c.text}</p>
            </div>
          ))}
          {canEdit ? (
            <div className="flex gap-2">
              <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && postComment()} placeholder="Give feedback…" className={inputCls} />
              <Btn size="sm" onClick={postComment} disabled={!comment.trim()} className="!h-auto">Send</Btn>
            </div>
          ) : <p className="text-xs text-[#5E5754]">Join this community to give feedback.</p>}
        </div>
      </div>

      {canEdit && (
        <button type="button" onClick={() => remove(task.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete task</button>
      )}
    </div>
  );
}

function TasksPanel({ communityId, events, me, people, canEdit, isPrivate, toast }: {
  communityId: string; events: EventItem[]; me: string; people: string[];
  canEdit: boolean; isPrivate: boolean; toast: (t: string) => void;
}) {
  const storageKey = `jea.community.tasks.v2.${communityId}`;
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(storageKey));
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<{ title: string; assignee: string; due: string; poll: boolean; status: TaskStatus }>(
    { title: "", assignee: "", due: "", poll: false, status: "todo" }
  );
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  const today = ymd(new Date());
  const openTask = tasks.find((t) => t.id === openId) ?? null;

  const save = (next: Task[]) => {
    setTasks(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { toast("Browser storage is full. Try smaller photos."); }
  };
  const patch = (id: string, fn: (t: Task) => Task) => save(tasks.map((t) => (t.id === id ? fn(t) : t)));
  const move = (id: string, status: TaskStatus) =>
    patch(id, (t) => ({
      ...t, status,
      progress: status === "done" ? 100 : status === "todo" ? 0 : t.progress === 0 || t.progress === 100 ? 25 : t.progress,
    }));
  const remove = (id: string) => { save(tasks.filter((t) => t.id !== id)); setOpenId(null); };

  const openAdd = (status: TaskStatus = "todo") => {
    setForm({ title: "", assignee: "", due: "", poll: false, status });
    setAddOpen(true);
  };
  const addTask = () => {
    const title = form.title.trim();
    if (!title) return;
    save([...tasks, {
      id: String(Date.now()), title, assignee: form.assignee.trim() || me, status: form.status,
      progress: form.status === "done" ? 100 : form.status === "progress" ? 25 : 0,
      due: form.due, color: TASK_COLORS[tasks.length % TASK_COLORS.length], createdAt: Date.now(),
      updates: [], comments: [], poll: form.poll ? { up: [], down: [] } : null,
    }]);
    setAddOpen(false);
  };

  /* ---- calendar ---- */
  const y = month.getFullYear(), m = month.getMonth();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(new Date(y, m, 1).getDay()).fill(null),
    ...Array.from({ length: daysIn }, (_, i) => i + 1),
  ];
  const dots = useMemo(() => {
    const map: Record<string, string[]> = {};
    tasks.forEach((t) => { if (t.due) (map[t.due] ||= []).push(t.color); });
    events.forEach((e) => (map[e.date] ||= []).push("#D4AF37"));
    return map;
  }, [tasks, events]);

  const deadlines = useMemo(() => {
    const items = [
      ...tasks.filter((t) => t.due).map((t) => ({ id: "t" + t.id, date: t.due, label: t.title, done: t.status === "done" })),
      ...events.map((e) => ({ id: "e" + e.id, date: e.date, label: e.title, done: false })),
    ].sort((a, b) => a.date.localeCompare(b.date));
    return (pickedDay ? items.filter((i) => i.date === pickedDay) : items.filter((i) => i.date >= today || !i.done)).slice(0, 6);
  }, [tasks, events, pickedDay, today]);

  const legend = Array.from(new Map(tasks.filter((t) => t.due).map((t) => [t.title, t.color])).entries()).slice(0, 5);

  const feed = tasks
    .flatMap((t) => [
      ...t.updates.map((u) => ({ id: u.id, task: t.title, author: u.author, text: u.text, photos: u.photos, at: u.at })),
      ...t.comments.map((c) => ({ id: c.id, task: t.title, author: c.author, text: c.text, photos: [] as string[], at: c.at })),
    ])
    .sort((a, b) => b.at - a.at)
    .slice(0, 4);

  const renderCard = (t: Task) => {
    const photos = t.updates.flatMap((u) => u.photos).slice(0, 3);
    const overdue = t.due && t.due < today && t.status !== "done";
    return (
      <article
        key={t.id}
        draggable={canEdit}
        onDragStart={() => setDragId(t.id)}
        onDragEnd={() => { setDragId(null); setOverCol(null); }}
        onClick={() => setOpenId(t.id)}
        className={`rounded-2xl bg-white p-3.5 ring-1 ring-[#EADFD6] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.12)] cursor-pointer hover:-translate-y-0.5 transition-transform ${dragId === t.id ? "opacity-50" : ""}`}
      >
        <div className="flex items-start gap-2">
          <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
          <h4 className="flex-1 min-w-0 font-bold text-sm leading-snug text-[#1A1818]">{t.title}</h4>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <NameAvatar name={t.assignee} size={22} />
          <span className="text-xs font-semibold text-[#3D3735] truncate">{t.assignee}</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-2 rounded-full bg-[#EFE6D8] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${t.progress}%`, background: t.progress === 100 ? "#1F6B45" : "#8B1E3F" }} />
          </div>
          <span className="text-xs font-bold text-[#3D3735]">{t.progress}%</span>
        </div>
        {t.status === "done" && <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold bg-[#E8F3EC] text-[#1F6B45] px-2.5 py-1 rounded-full"><Check className="w-3 h-3" /> Completed</span>}
        {photos.length > 0 && (
          <div className="flex gap-1.5 mt-3">{photos.map((s, i) => <img key={i} src={s} alt="" className="w-14 h-14 rounded-lg object-cover" />)}</div>
        )}
        {t.poll && <ApprovalPoll poll={t.poll} me={me} disabled={!canEdit} onVote={(d) => patch(t.id, (x) => castVote(x, d, me))} />}
        <div className="flex items-center justify-between mt-3 text-[11px]">
          {t.due
            ? <span className={`inline-flex items-center gap-1 ${overdue ? "text-red-600 font-semibold" : "text-[#5E5754]"}`}><Calendar className="w-3 h-3" /> {monthShort(t.due)} {dayNum(t.due)}</span>
            : <span />}
          <span className="inline-flex items-center gap-1 text-[#5E5754]"><MessageSquare className="w-3 h-3" /> {t.updates.length + t.comments.length}</span>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-5">
      {/* Board */}
      <div className={`bg-white rounded-2xl p-5 ${cardShadow}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="cm-serif text-lg font-bold flex items-center gap-2 text-[#8B1E3F]"><ClipboardCheck className="w-5 h-5" /> Split Task Tracker Board</h3>
            <p className="text-xs text-[#5E5754] mt-1 flex items-center gap-1.5">
              {isPrivate ? <><Lock className="w-3 h-3" /> Private · only members see this board</> : "Assign tasks, share progress and collect feedback"}
            </p>
          </div>
          {canEdit && <Btn onClick={() => openAdd("todo")}><Plus className="w-4 h-4" /> Add task</Btn>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {TASK_COLS.map((col) => {
            const list = tasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                onDragOver={(e) => { if (canEdit) { e.preventDefault(); setOverCol(col.key); } }}
                onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
                onDrop={() => { if (dragId) move(dragId, col.key); setDragId(null); setOverCol(null); }}
                className={`rounded-2xl bg-[#F5EFE6] p-3 flex flex-col gap-3 min-h-[180px] transition-shadow ${overCol === col.key ? "ring-2 ring-[#8B1E3F]/40" : ""}`}
              >
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-bold text-[#1A1818]">{col.label}</p>
                  <span className="text-[11px] font-bold bg-white text-[#8B1E3F] rounded-full px-2 py-0.5">{list.length}</span>
                </div>
                {list.length === 0 && <p className="text-xs text-[#5E5754] px-1">{canEdit ? "Drop a task here" : "No tasks"}</p>}
                {list.map(renderCard)}
                {canEdit && (
                  <button type="button" onClick={() => openAdd(col.key)} className="mt-auto h-9 rounded-full bg-[#8B1E3F] text-white text-xs font-semibold hover:bg-[#721831]">
                    + Add Task
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar + deadlines + feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={`bg-white rounded-2xl p-5 ${cardShadow}`}>
          <h3 className="cm-serif text-base font-bold text-[#1A1818]">Shared Community Calendar</h3>
          <div className="flex items-center justify-between mt-3 mb-2">
            <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(y, m - 1, 1))} className="w-8 h-8 rounded-full hover:bg-[#F5EFE6] text-lg">‹</button>
            <p className="text-sm font-bold">{month.toLocaleString("en-IN", { month: "long", year: "numeric" })}</p>
            <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(y, m + 1, 1))} className="w-8 h-8 rounded-full hover:bg-[#F5EFE6] text-lg">›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#5E5754] mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const key = ymd(new Date(y, m, d));
              const c = dots[key] ?? [];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPickedDay((p) => (p === key ? null : key))}
                  className={`mx-auto w-9 h-10 rounded-lg flex flex-col items-center justify-center text-sm ${
                    pickedDay === key ? "bg-[#8B1E3F] text-white" : key === today ? "bg-[#F5EFE6] font-bold" : "hover:bg-[#F5EFE6]"
                  }`}
                >
                  {d}
                  <span className="flex gap-0.5 h-1.5 mt-0.5">
                    {c.slice(0, 3).map((col, j) => <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 space-y-1 text-xs text-[#3D3735]">
            {legend.map(([name, col]) => (
              <p key={name} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: col }} /> <span className="truncate">{name}</span></p>
            ))}
            {events.length > 0 && <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> Community event</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div className={`bg-white rounded-2xl p-5 ${cardShadow}`}>
            <h3 className="cm-serif text-base font-bold text-[#1A1818]">
              {pickedDay ? `On ${dateFull(pickedDay)}` : "Upcoming Deadlines"}
            </h3>
            {deadlines.length === 0 ? <p className="text-sm text-[#5E5754] mt-2">Nothing scheduled.</p> : (
              <ul className="mt-2 space-y-1.5">
                {deadlines.map((d) => (
                  <li key={d.id} className={`text-sm flex gap-2 ${d.done ? "text-[#8A827E] line-through" : d.date < today ? "text-red-600" : "text-[#1A1818]"}`}>
                    <span className="font-semibold shrink-0">{monthShort(d.date)} {String(dayNum(d.date)).padStart(2, "0")}:</span>
                    <span className="truncate">{d.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`bg-white rounded-2xl p-5 ${cardShadow}`}>
            <h3 className="cm-serif text-base font-bold text-[#1A1818]">Live Feedback</h3>
            {feed.length === 0 ? <p className="text-sm text-[#5E5754] mt-2">Updates and feedback will show up here.</p> : (
              <div className="mt-3 space-y-3">
                {feed.map((f) => (
                  <div key={f.id} className="flex gap-2.5">
                    <NameAvatar name={f.author} size={28} />
                    <div className="min-w-0">
                      <span className="inline-block text-[11px] font-bold bg-[#F5EFE6] text-[#8B1E3F] px-2.5 py-0.5 rounded-full">{f.author}</span>
                      <p className="text-[11px] text-[#5E5754] truncate mt-0.5">on {f.task} · {ago(f.at)}</p>
                      {f.text && <p className="text-sm text-[#1A1818] mt-0.5 line-clamp-2">{f.text}</p>}
                      {f.photos.length > 0 && <div className="flex gap-1.5 mt-1.5">{f.photos.slice(0, 3).map((s, i) => <img key={i} src={s} alt="" className="w-12 h-12 rounded-lg object-cover" />)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task detail */}
      <Modal open={!!openTask} onClose={() => setOpenId(null)} title={openTask?.title ?? ""}>
        {openTask && (
          <TaskDetail key={openTask.id} task={openTask} me={me} canEdit={canEdit} patch={patch} move={move} remove={remove} toast={toast} />
        )}
      </Modal>

      {/* Add task */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a task">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Task *</label>
            <input value={form.title} maxLength={80} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Wedding card design & distribution" />
            {isPrivate && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {WEDDING_TASKS.map((w) => (
                  <button key={w} type="button" onClick={() => setForm({ ...form, title: w })} className="text-[11px] font-semibold bg-[#F5EFE6] text-[#8B1E3F] px-2.5 py-1 rounded-full hover:bg-[#EDE3D3]">{w}</button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Assign to</label>
              <input list="task-people" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className={inputCls} placeholder={me} />
              <datalist id="task-people">{people.map((p) => <option key={p} value={p} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Due date</label>
              <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer text-[#3D3735]">
            <input type="checkbox" className="accent-[#8B1E3F]" checked={form.poll} onChange={(e) => setForm({ ...form, poll: e.target.checked })} />
            Ask the group to approve with a 👍 / 👎 poll
          </label>
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Btn>
            <Btn onClick={addTask} disabled={!form.title.trim()}>Add task</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface SharedPost {
  author: string;
  avatar: string;
  gradient: string;
  community: string;
  time: string;
  content: string;
  media?: { path: string; type: "image" | "video" };
  hasPoll?: boolean;
}
type Post = api.ApiPost & { gradient?: string; shared?: SharedPost; shares?: number };
interface PollOption { text: string; votes: number }

/** Where signed-out visitors are sent when they try to join / post / book. */
const LOGIN_ROUTE = "/login";

/* Rich CSS "photo-like" banners, used until real cover photos are supplied */
const BANNERS = {
  golden:
    "radial-gradient(circle at 78% 22%, rgba(255,214,120,.95) 0, rgba(255,170,60,.45) 14%, transparent 38%), radial-gradient(circle at 20% 80%, rgba(255,255,255,.12), transparent 40%), linear-gradient(135deg,#0f1b3d,#27407a 55%,#b0702d)",
  floral:
    "radial-gradient(circle at 20% 30%, rgba(255,214,225,.9), transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,160,120,.7), transparent 40%), radial-gradient(circle at 60% 20%, rgba(255,230,160,.6), transparent 30%), linear-gradient(135deg,#8B1E3F,#c2416a 60%,#f0a07a)",
  city:
    "radial-gradient(circle at 15% 85%, rgba(255,190,90,.6), transparent 30%), radial-gradient(circle at 85% 20%, rgba(120,170,255,.4), transparent 35%), linear-gradient(135deg,#14161f,#2b3045 60%,#4a3b2a)",
  eco:
    "radial-gradient(circle at 80% 25%, rgba(190,255,200,.6), transparent 35%), linear-gradient(135deg,#0f3d2e,#1f7a55 60%,#9bc77a)",
  stage:
    "conic-gradient(from 200deg at 50% -10%, transparent 0 20deg, rgba(255,120,220,.55) 30deg, transparent 50deg, rgba(120,150,255,.55) 70deg, transparent 90deg, rgba(255,200,100,.5) 110deg, transparent 130deg), linear-gradient(180deg,#1a0b2e,#3b1d63)",
  private: "linear-gradient(135deg,#2a2626,#4a4240)",
  gold:
    "radial-gradient(circle at 75% 30%, rgba(255,245,200,.8), transparent 35%), linear-gradient(135deg,#7a5a1e,#d4af37 60%,#f3e2a9)",
};

const TYPE_STYLES: Record<string, { icon: string; banner: string }> = {
  "Vendor Community": { icon: "📸", banner: BANNERS.golden },
  "Event Category": { icon: "💒", banner: BANNERS.floral },
  "City Community": { icon: "🏢", banner: BANNERS.city },
  "Interest Community": { icon: "🌿", banner: BANNERS.eco },
  "Private Planning Group": { icon: "🔒", banner: BANNERS.private },
};
const COMMUNITY_TYPES = Object.keys(TYPE_STYLES);

const face = (n: number) => `https://i.pravatar.cc/80?img=${n}`;

/* Add the CSS gradient fallback used when a community / event has no photo */
const decorateCommunity = (c: api.ApiCommunity): Community => ({
  ...c,
  banner: c.isPrivate ? BANNERS.private : TYPE_STYLES[c.type]?.banner ?? BANNERS.eco,
});
const EVENT_BANNERS = [BANNERS.golden, BANNERS.floral, BANNERS.stage, BANNERS.gold];
const decorateEvent = (e: api.ApiEvent): EventItem => ({
  ...e,
  banner: EVENT_BANNERS[hash(e.id) % EVENT_BANNERS.length],
});

/* ------------------------------ Helpers ----------------------------- */

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#f472b6,#be185d)",
  "linear-gradient(135deg,#60a5fa,#4338ca)",
  "linear-gradient(135deg,#34d399,#0f766e)",
  "linear-gradient(135deg,#fbbf24,#b45309)",
  "linear-gradient(135deg,#a78bfa,#6d28d9)",
  "linear-gradient(135deg,#fb923c,#c2410c)",
];
const SAMPLE_PEOPLE = [
  "Aarav Mehta", "Isha Verma", "Rohan Kapoor", "Sneha Iyer", "Kabir Singh",
  "Meera Nair", "Vikram Rao", "Anjali Gupta", "Dev Malhotra", "Priya Shah",
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const gradientFor = (name: string) => AVATAR_GRADIENTS[hash(name) % AVATAR_GRADIENTS.length];
const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const parseISO = (iso: string) => new Date(`${iso}T00:00:00`);
const monthShort = (iso: string) => parseISO(iso).toLocaleString("en-IN", { month: "short" }).toUpperCase();
const dayNum = (iso: string) => parseISO(iso).getDate();
const dateFull = (iso: string) =>
  parseISO(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const FACE_IMGS = [12, 5, 33, 47, 15, 32, 60, 26, 52, 9];

function FaceAvatar({ name, idx, size }: { name: string; idx: number; size: number }) {
  const [failed, setFailed] = useState(false);
  const base = "rounded-full ring-2 ring-white -ml-2 first:ml-0 shrink-0 object-cover";
  if (failed) {
    return (
      <span
        title={name}
        className={`${base} flex items-center justify-center text-white font-bold`}
        style={{ width: size, height: size, fontSize: size * 0.36, background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
      >
        {initialsOf(name)}
      </span>
    );
  }
  return (
    <img
      src={face(FACE_IMGS[idx % FACE_IMGS.length])}
      alt={name}
      title={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={base}
      style={{ width: size, height: size }}
    />
  );
}

function Facepile({ seed, total, max = 4, size = 28 }: { seed: string; total: number; max?: number; size?: number }) {
  const shown = Math.min(max, total);
  const start = hash(seed) % SAMPLE_PEOPLE.length;
  return (
    <div className="flex items-center">
      {Array.from({ length: shown }).map((_, i) => {
        const name = SAMPLE_PEOPLE[(start + i) % SAMPLE_PEOPLE.length];
        return (
          <FaceAvatar key={i} name={name} idx={(start + i) % SAMPLE_PEOPLE.length} size={size} />
        );
      })}
      {total > shown && (
        <span
          className="rounded-full ring-2 ring-white bg-[#F5EFE6] text-[#1A1818] font-bold flex items-center justify-center -ml-2"
          style={{ height: size, minWidth: size, padding: "0 6px", fontSize: size * 0.36 }}
        >
          +{(total - shown).toLocaleString("en-IN")}
        </span>
      )}
    </div>
  );
}

function Cover({ src, bg, className = "", children, fallback }: { src?: string; bg: string; className?: string; children?: ReactNode; fallback?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: bg }}>
      {src && !failed && (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {(!src || failed) && fallback}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
      {children}
    </div>
  );
}

function LogoAvatar({ src, icon, className }: { src?: string; icon: string; className: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`${className} rounded-full bg-white ring-4 ring-white shadow-md flex items-center justify-center overflow-hidden shrink-0`}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover" />
      ) : (
        icon
      )}
    </span>
  );
}

function Btn({
  variant = "primary", size = "md", className = "", ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "soft"; size?: "sm" | "md" }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-semibold rounded-full transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F]/40";
  const sizes = { sm: "text-xs px-4 h-8", md: "text-sm px-6 h-11" };
  const variants = {
    primary: "bg-[#8B1E3F] text-white hover:bg-[#721831] shadow-[0_6px_16px_-6px_rgba(139,30,63,0.55)]",
    outline: "bg-white text-[#1A1818] border border-[#1A1818]/20 hover:border-[#1A1818]/50 hover:bg-[#F5EFE6]",
    ghost: "bg-transparent text-[#5E5754] hover:text-[#1A1818] hover:bg-[#F5EFE6]",
    soft: "bg-[#F5EFE6] text-[#8B1E3F] hover:bg-[#EDE3D3]",
  };
  return <button type="button" className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

function UnreadBadge({ count, inline = false, className = "" }: { count: number; inline?: boolean; className?: string }) {
  if (!count) return null;
  return (
    <span
      aria-label={`${count} unread post${count === 1 ? "" : "s"}`}
      title={`${count} new post${count === 1 ? "" : "s"}`}
      className={`${inline ? "ml-auto shrink-0" : "absolute"} min-w-[20px] h-5 px-1.5 rounded-full bg-[#8B1E3F] text-white text-[11px] font-bold leading-5 text-center ring-2 ring-white shadow ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function EscrowBadge({ label = "Escrow protected" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F3EC] text-[#1F6B45] text-[11px] font-semibold px-2.5 py-1">
      <ShieldCheck className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1818]/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white text-[#1A1818] rounded-2xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]"
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="cm-serif text-xl font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-[#F5EFE6] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputCls =
  "w-full bg-white border border-[#E9E1D5] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1818] placeholder:text-[#8A827E] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/25 focus:border-[#8B1E3F]/50";
type Opt = { value: string; label: string; hint?: string };

const EVENT_TYPE_OPTIONS: Opt[] = [
  "Photography Events", "Corporate Events", "Wedding Events", "Exhibitions",
  "Music & Concerts", "Workshops", "Networking Meetups", "Decor & Design",
  "Food & Catering", "Eco-Friendly Events", "Dance & Choreography",
  "Tech Conferences", "Birthday Parties", "Trade Shows", "Fashion Shows",
].map((label) => ({ value: label, label }));

function Combobox({ options, value, onChange, placeholder, allowCustom = false, maxResults = 50 }: {
  options: Opt[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  maxResults?: number;
}) {
  const selected = options.find((o) => o.value === value);
  const [query, setQuery] = useState(selected?.label ?? (allowCustom ? value : ""));
  const [open, setOpen] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [hi, setHi] = useState(0);

  useEffect(() => {
    setQuery(selected?.label ?? (allowCustom ? value : ""));
  }, [value, selected?.label, allowCustom]);

  const q = query.trim().toLowerCase();
  const matches = (filtering && q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || (o.hint ?? "").toLowerCase().includes(q))
    : options
  ).slice(0, maxResults);

  const pick = (o: Opt) => {
    onChange(o.value);
    setQuery(o.label);
    setFiltering(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        value={query}
        placeholder={placeholder}
        className={inputCls}
        autoComplete="off"
        onFocus={() => { setOpen(true); setFiltering(false); setHi(0); }}
        onChange={(e) => {
          setQuery(e.target.value);
          setFiltering(true);
          setOpen(true);
          setHi(0);
          if (allowCustom) onChange(e.target.value);
        }}
        onBlur={() => {
          setOpen(false);
          if (!allowCustom) setQuery(options.find((o) => o.value === value)?.label ?? "");
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, matches.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
          else if (e.key === "Enter" && open && matches[hi]) { e.preventDefault(); pick(matches[hi]); }
          else if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); }
        }}
      />
      {open && (
        <ul className="absolute z-20 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white border border-[#E9E1D5] rounded-xl shadow-lg py-1">
          {matches.length === 0 ? (
            <li className="px-3.5 py-2 text-sm text-[#5E5754]">
              {allowCustom ? "No match. Your text will be used." : "No matching community."}
            </li>
          ) : matches.map((o, i) => (
            <li
              key={`${o.value}-${i}`}
              onMouseDown={(e) => { e.preventDefault(); pick(o); }}
              onMouseEnter={() => setHi(i)}
              className={`px-3.5 py-2 text-sm cursor-pointer flex items-center justify-between gap-3 ${i === hi ? "bg-[#F5EFE6]" : ""}`}
            >
              <span className="truncate">{o.label}</span>
              {o.hint && <span className="text-[11px] text-[#8A827E] shrink-0">{o.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const cardShadow =
  "shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] ring-1 ring-[#EADFD6]";
const cardHover =
  "hover:shadow-[0_14px_36px_-10px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 transition-all duration-300";

const pill = (active: boolean) =>
  `text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
    active
      ? "bg-[#8B1E3F] text-white shadow-sm"
      : "bg-white text-[#3D3735] border border-[#E9E1D5] hover:border-[#1A1818]/40"
  }`;

/* Resize + convert to a data URL so the image survives a refresh */
function fileToDataUrl(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unavailable"));
        return;
      }
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bad image"));
    };
    img.src = url;
  });
}

function getVideoDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve(v.duration);
    v.onerror = () => reject(new Error("Bad video"));
    v.src = url;
  });
}

function PostMediaView({ media }: { media: { path: string; type: "image" | "video" } }) {
  const [src, setSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .getMediaUrl(media.path)
      .then((u) => { if (alive) setSrc(u); })
      .catch(() => { if (alive) setMissing(true); });
    return () => { alive = false; };
  }, [media.path]);

  if (missing) return <p className="text-xs text-[#8A827E] mb-4">Attachment unavailable</p>;
  if (!src) return <div className="mb-4 h-48 rounded-xl bg-[#F5EFE6] animate-pulse" />;
  return (
    <div className="mb-4 -mx-1">
      {media.type === "image" ? (
        <img src={src} alt="Post attachment" className="rounded-xl w-full max-h-96 object-cover" />
      ) : (
        <video src={src} controls playsInline className="rounded-xl w-full max-h-96 bg-black" />
      )}
    </div>
  );
}

const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);

const to12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const COMMUNITY_SHARES_KEY = "jea.community.shared-posts.v1";
const readCommunityShares = (): Post[] => {
  try {
    const value = JSON.parse(localStorage.getItem(COMMUNITY_SHARES_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};
const saveCommunityShares = (items: Post[]) => {
  try {
    localStorage.setItem(COMMUNITY_SHARES_KEY, JSON.stringify(items));
  } catch {
    // Shares remain visible for the current session if browser storage is unavailable.
  }
};

function PollView({ poll, voted, onVote }: {
  poll: { options: PollOption[] }; voted?: number; onVote: (i: number) => void;
}) {
  const total = poll.options.reduce((s, o) => s + o.votes, 0);
  const done = voted !== undefined;
  return (
    <div className="mb-4 space-y-2">
      {poll.options.map((o, i) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        return (
          <button
            key={i}
            type="button"
            disabled={done}
            onClick={() => onVote(i)}
            className={`relative w-full overflow-hidden rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
              voted === i ? "border-[#8B1E3F]" : "border-[#E9E1D5]"
            } ${done ? "cursor-default" : "hover:border-[#8B1E3F]/50"}`}
          >
            {done && <span className="absolute inset-y-0 left-0 bg-[#F5EFE6]" style={{ width: `${pct}%` }} />}
            <span className="relative flex items-center justify-between gap-3">
              <span className="font-medium text-[#1A1818]">{o.text}{voted === i ? " ✓" : ""}</span>
              {done && <b className="text-xs text-[#8B1E3F]">{pct}%</b>}
            </span>
          </button>
        );
      })}
      <p className="text-xs text-[#5E5754]">
        {total} vote{total === 1 ? "" : "s"}{done ? "" : " · tap to vote"}
      </p>
    </div>
  );
}

const slugify = api.slugify;

const SITE_URL: string =
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");
const inviteUrl = (c: { name: string }) => `${SITE_URL}/community/${slugify(c.name)}?invite=1`;

/* ------------------------- WhatsApp-style chat ------------------------- */
const WA_EMOJIS = ["😀","😂","🥹","😍","😘","😎","🤔","😢","😮","🙏","👍","👎","👏","🙌","💪","🔥","❤️","💯","🎉","🎊","✨","🌸","🪔","🥳","😊","😅","🤝","👌","🙂","😴"];
const WA_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
type Channel = "chat" | "bc";
const CH_RE = /^\[\[ch:(chat|bc)\]\]/;
/* Posts created before channel tagging default to the broadcast feed. */
const LEGACY_CHANNEL: Channel = "bc";
const channelOf = (content?: string): Channel => {
  const m = (content || "").match(CH_RE);
  return m ? (m[1] as Channel) : LEGACY_CHANNEL;
};
const stripChannel = (content?: string) => (content || "").replace(CH_RE, "");

const REPLY_RE = /^\[\[reply:([^|\]]*)\|([^\]]*)\]\]\n?/;
const splitReply = (raw: string) => {
  const content = stripChannel(raw);
  const m = content.match(REPLY_RE);
  return m ? { reply: { author: m[1], text: m[2] }, text: content.slice(m[0].length) } : { reply: null, text: content };
};
const linkify = (text: string): ReactNode[] =>
  text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noreferrer" className="text-[#027EB5] hover:underline break-all">{part}</a>
      : part
  );
const postDate = (p: Post): Date | null => {
  const raw = (p as any).createdAt ?? (p as any).created_at;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};
const waTime = (p: Post) => {
  const d = postDate(p);
  return d ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase() : p.time;
};
const waDay = (p: Post): string | null => {
  const d = postDate(p);
  if (!d) return null;
  const t = new Date(); const y = new Date(); y.setDate(t.getDate() - 1);
  if (d.toDateString() === t.toDateString()) return "TODAY";
  if (d.toDateString() === y.toDateString()) return "YESTERDAY";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
};

function ChatMedia({ media, onOpen, onLoaded }: {
  media: { path: string; type: "image" | "video" };
  onOpen: (src: string, type: "image" | "video") => void;
  onLoaded: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let alive = true;
    api.getMediaUrl(media.path).then((u) => { if (alive) setSrc(u); }).catch(() => { if (alive) setMissing(true); });
    return () => { alive = false; };
  }, [media.path]);
  if (missing) return <p className="text-xs text-[#5E5754] px-2 py-2">Attachment unavailable</p>;
  if (!src) return <div className="w-[150px] h-[110px] rounded-xl bg-black/5 animate-pulse" />;
  return (
    <button type="button" onClick={() => onOpen(src, media.type)} className="relative block overflow-hidden rounded-xl">
      {media.type === "image" ? (
        <img src={src} alt="" onLoad={onLoaded} className="block h-[110px] w-[150px] object-cover rounded-xl" />
      ) : (
        <>
          <video src={src} preload="metadata" onLoadedMetadata={onLoaded} className="block h-[110px] w-[150px] object-cover rounded-xl" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-black/55 flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </span>
          </span>
        </>
      )}
    </button>
  );
}

function WaPoll({ poll, voted, onVote }: { poll: { options: PollOption[] }; voted?: number; onVote: (i: number) => void }) {
  const total = poll.options.reduce((s, o) => s + o.votes, 0);
  const done = voted !== undefined;
  return (
    <div className="min-w-[240px] px-1 py-1">
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#1A1818]"><BarChart3 className="w-4 h-4 text-[#8B1E3F]" /> Poll</p>
      <p className="text-[12px] text-[#5E5754] mb-1.5">Select one option</p>
      {poll.options.map((o, i) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        return (
          <button key={i} type="button" disabled={done} onClick={() => onVote(i)} className="block w-full text-left py-1.5">
            <span className="flex items-center gap-2.5">
              <span className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${voted === i ? "bg-[#8B1E3F] border-[#8B1E3F]" : "border-[#8696A0]"}`}>
                {voted === i && <Check className="w-3 h-3 text-white" />}
              </span>
              <span className="flex-1 text-[14px] text-[#1A1818]">{o.text}</span>
              <span className="text-[12px] text-[#5E5754]">{o.votes}</span>
            </span>
            <span className="block ml-[28px] mt-1 h-1 rounded-full bg-[#E9EDEF]">
              <span className="block h-1 rounded-full bg-[#8B1E3F]" style={{ width: `${pct}%` }} />
            </span>
          </button>
        );
      })}
      <p className="text-[12px] text-[#5E5754] mt-1 pb-3">{total} vote{total === 1 ? "" : "s"}</p>
    </div>
  );
}

interface WaChatProps {
  community: Community;
  messages: Post[];
  isMember: boolean;
  joinLabel: string;
  myName: string;
  myId?: string;
  composerText: string;
  setComposerText: (v: string) => void;
  composerMedia: { url: string; type: "image" | "video" } | null;
  removeMedia: () => void;
  pickFile: () => void;
  posting: boolean;
  onSend: () => void;
  pollOpen: boolean;
  setPollOpen: (v: boolean) => void;
  pollOptions: string[];
  setPollOptions: Dispatch<SetStateAction<string[]>>;
  composerEvent: string;
  setComposerEvent: (v: string) => void;
  composerLocation: string;
  setComposerLocation: (v: string) => void;
  events: EventItem[];
  replyTo: { author: string; text: string } | null;
  setReplyTo: (v: { author: string; text: string } | null) => void;
  pinnedIds: string[];
  onPin: (id: string) => void;
  onLike: (id: string) => void;
  onVote: (id: string, i: number) => void;
  onForward: (p: Post) => void;
  onBack: () => void;
  onInfo: () => void;
  onInvite: () => void;
  onJoin: () => void;
  toast: (t: string) => void;
}

function WhatsAppChat(p: WaChatProps) {
  const { messages } = p;
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const atBottomRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [headMenu, setHeadMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [viewer, setViewer] = useState<{ src: string; type: "image" | "video" } | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);

  const isMine = (m: Post) => {
    const id = (m as any).authorId ?? (m as any).author_id ?? (m as any).userId;
    return id && p.myId ? id === p.myId : m.author === p.myName;
  };

  const q = query.trim().toLowerCase();
  const list = q
    ? messages.filter((m) => splitReply(m.content || "").text.toLowerCase().includes(q) || m.author.toLowerCase().includes(q))
    : messages;

  const lastId = messages[messages.length - 1]?.id;
  const scrollToEnd = () => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; };
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (atBottomRef.current || (last && isMine(last))) { scrollToEnd(); setNewCount(0); }
    else setNewCount((c) => c + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId]);
  useEffect(() => { if (!p.composerText && taRef.current) taRef.current.style.height = "auto"; }, [p.composerText]);

  const onScroll = () => {
    const el = scrollRef.current; if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    atBottomRef.current = near; setAtBottom(near);
    if (near) setNewCount(0);
  };

  const react = (m: Post, emoji: string) => {
    setMenuFor(null);
    if (emoji === "❤️") return p.onLike(m.id);
    setReactions((r) => {
      const cur = r[m.id] ?? [];
      return { ...r, [m.id]: cur.includes(emoji) ? cur.filter((e) => e !== emoji) : [...cur, emoji] };
    });
  };

  const closeAll = () => { setEmojiOpen(false); setAttachOpen(false); setHeadMenu(false); setMenuFor(null); };
  const anyPopup = emojiOpen || attachOpen || headMenu || !!menuFor;
  const hasContent = !!p.composerText.trim() || !!p.composerMedia || p.pollOpen;


  return (
    <div className="relative flex flex-col h-[calc(100vh-15rem)] min-h-[520px] overflow-hidden rounded-2xl ring-1 ring-[#EADFD6] bg-[#F7F1E8]">
      {anyPopup && <div className="fixed inset-0 z-[5]" onClick={closeAll} />}

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-5 py-3.5">
        <button onClick={p.onBack} aria-label="Back" className="lg:hidden p-1 text-[#8B1E3F]"><ArrowLeft className="w-5 h-5" /></button>
        <button onClick={p.onInfo} className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
          <MessageSquare className="w-5 h-5 text-[#8B1E3F] fill-[#8B1E3F] shrink-0" />
          <span className="cm-serif text-lg font-bold text-[#8B1E3F] truncate">Live Chat Group</span>
        </button>
        <button onClick={() => { setSearchOpen((v) => !v); setQuery(""); }} aria-label="Search" className="p-2 rounded-full text-[#8B1E3F] hover:bg-black/5"><Search className="w-5 h-5" /></button>
        <div className="relative">
          <button onClick={() => setHeadMenu((v) => !v)} aria-label="Menu" className="p-2 rounded-full text-[#8B1E3F] hover:bg-black/5"><MoreVertical className="w-5 h-5" /></button>
          {headMenu && (
            <div className="absolute right-0 top-11 z-30 w-48 rounded-xl bg-white py-2 shadow-[0_2px_12px_rgba(11,20,26,.25)]">
              {[
                { label: "Group info", run: p.onInfo },
                { label: "Invite link", run: p.onInvite },
                { label: "Search", run: () => setSearchOpen(true) },
              ].map((it) => (
                <button key={it.label} onClick={() => { closeAll(); it.run(); }} className="block w-full px-5 py-2.5 text-left text-[14.5px] text-[#1A1818] hover:bg-[#F5F6F6]">{it.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="relative z-10 flex items-center gap-3 px-4 py-2 bg-white border-b border-[#E9EDEF]">
          <Search className="w-4 h-4 text-[#5E5754]" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages" className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#5E5754]" />
          {q && <span className="text-xs text-[#5E5754]">{list.length} found</span>}
          <button onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Close search"><X className="w-4 h-4 text-[#5E5754]" /></button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 py-2">
        {list.length === 0 && (
          <div className="flex justify-center mt-6">
            <span className="rounded-lg bg-[#FFEECD] px-4 py-2 text-[13px] text-[#5E5754] shadow-sm text-center">
              {q ? "No messages found" : p.isMember ? "No messages here yet. Say hi 👋" : "Join this community to see and send messages."}
            </span>
          </div>
        )}

        {list.map((m, i) => {
          const prev = list[i - 1];
          const mine = isMine(m);
          const day = waDay(m);
          const newDay = !!day && (!prev || waDay(prev) !== day);
          const first = !prev || newDay || isMine(prev) !== mine || prev.author !== m.author;
          const { reply, text } = splitReply(m.content || "");
          const hasMedia = !!m.media;
          const extra = (reactions[m.id] ?? []).filter((e) => e !== "❤️");
          const chipEmojis = [...(m.likes > 0 ? ["❤️"] : []), ...extra];
          const pinned = p.pinnedIds.includes(m.id);
          const pad = hasMedia ? "px-[6px]" : "";
          const snippet = text || (m.media ? (m.media.type === "video" ? "🎥 Video" : "📷 Photo") : m.poll ? "📊 Poll" : "");

          return (
            <div key={m.id}>
              {newDay && (
                <div className="flex justify-center my-3">
                  <span className="rounded-lg bg-[#EFE6D8] px-3 py-1 text-[12.5px] text-[#8A7F78] shadow-none">{day}</span>
                </div>
              )}
              <div className={`group flex items-end gap-3 ${first ? "mt-3" : "mt-1"} ${chipEmojis.length ? "mb-4" : ""}`}>
                {first ? (
                  <span className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: gradientFor(m.author) }}>
                    {initialsOf(m.author)}
                  </span>
                ) : <span className="w-10 shrink-0" />}
                <div className={`relative max-w-[80%] rounded-2xl bg-[#EFE6D8] ${hasMedia ? "p-2" : "px-4 pt-2 pb-2.5"}`}>

                  {/* hover chevron + menu */}
                  <button
                    onClick={() => setMenuFor(menuFor === m.id ? null : m.id)}
                    aria-label="Message options"
                    className={`absolute top-1 right-1 z-10 rounded-full p-0.5 opacity-0 group-hover:opacity-100 ${menuFor === m.id ? "opacity-100" : ""} ${mine ? "bg-[#D9FDD3]" : "bg-white"} text-[#8696A0]`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  {menuFor === m.id && (
                    <div className={`absolute z-30 top-7 ${mine ? "right-0" : "left-0"} w-56 rounded-xl bg-white py-2 shadow-[0_2px_12px_rgba(11,20,26,.25)]`}>
                      <div className="flex items-center justify-between px-3 pb-2 mb-1 border-b border-[#E9EDEF]">
                        {WA_REACTIONS.map((e) => <button key={e} onClick={() => react(m, e)} className="text-xl hover:scale-125 transition-transform">{e}</button>)}
                      </div>
                      {[
                        { label: "Reply", Icon: Reply, run: () => { p.setReplyTo({ author: m.author, text: snippet }); taRef.current?.focus(); } },
                        { label: "Copy", Icon: Copy, run: () => { navigator.clipboard?.writeText(text).then(() => p.toast("Copied")).catch(() => {}); } },
                        { label: "Forward", Icon: Share2, run: () => p.onForward(m) },
                        { label: pinned ? "Unpin" : "Pin", Icon: Pin, run: () => p.onPin(m.id) },
                      ].map(({ label, Icon, run }) => (
                        <button key={label} onClick={() => { setMenuFor(null); run(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14.5px] text-[#1A1818] hover:bg-[#F5F6F6]">
                          <Icon className="w-4 h-4 text-[#5E5754]" /> {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {first && (
                    <p className={`text-[13px] font-semibold text-[#8B1E3F] mb-0.5 ${hasMedia ? "px-1" : ""}`}>
                      {mine ? "You" : m.author}
                    </p>
                  )}

                  {reply && (
                    <div className={`mb-1 rounded-md border-l-4 border-[#8B1E3F] px-2 py-1 bg-[#E5D9C6] ${hasMedia ? "mx-[6px]" : ""}`}>
                      <p className="text-[12.5px] font-medium" style={{ color: "#8B1E3F" }}>{reply.author === p.myName ? "You" : reply.author}</p>
                      <p className="text-[12.5px] text-[#5E5754] line-clamp-2">{reply.text}</p>
                    </div>
                  )}

                  {m.media && (
                    <ChatMedia
                      media={m.media}
                      onOpen={(src, type) => setViewer({ src, type })}
                      onLoaded={() => { if (atBottomRef.current) scrollToEnd(); }}
                    />
                  )}

                  {m.poll && <WaPoll poll={m.poll} voted={m.poll.voted} onVote={(idx) => p.onVote(m.id, idx)} />}

                  {(m.event || m.location) && (
                    <div className={`flex flex-wrap gap-1.5 mt-1 ${pad}`}>
                      {m.event && <span className="inline-flex items-center gap-1 text-[11.5px] rounded-full bg-black/5 px-2 py-0.5 text-[#5E5754]"><Calendar className="w-3 h-3" /> {m.event}</span>}
                      {m.location && <span className="inline-flex items-center gap-1 text-[11.5px] rounded-full bg-black/5 px-2 py-0.5 text-[#5E5754]"><MapPin className="w-3 h-3" /> {m.location}</span>}
                    </div>
                  )}

                  {text && (
                    <p className={`text-[14.2px] leading-[19px] text-[#1A1818] whitespace-pre-wrap break-words ${hasMedia ? "px-[6px] pt-1 pb-[5px]" : ""}`}>
                      {linkify(text)}
                      <span className="inline-block w-[76px]" />
                    </p>
                  )}
                  {!text && !hasMedia && !m.poll && <span className="inline-block w-[76px]" />}

                  <span
                    className="absolute bottom-[3px] right-[7px] flex items-center gap-1 text-[11px] text-[#8A7F78]"
                  >
                    {pinned && <Pin className="w-3 h-3" />}
                    {waTime(m)}
                  </span>

                  {chipEmojis.length > 0 && (
                    <span className="absolute -bottom-3.5 right-3 flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-[13px] shadow-[0_1px_3px_rgba(0,0,0,.18)]">
                      {chipEmojis.join("")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!atBottom && (
        <button onClick={scrollToEnd} aria-label="Scroll to latest" className="absolute bottom-24 right-5 z-10 w-10 h-10 rounded-full bg-white text-[#5E5754] shadow-md flex items-center justify-center">
          <ChevronDown className="w-6 h-6" />
          {newCount > 0 && <span className="absolute -top-2 min-w-[20px] h-5 px-1 rounded-full bg-[#8B1E3F] text-white text-[11px] font-bold leading-5 text-center">{newCount}</span>}
        </button>
      )}

      {/* Composer */}
      {p.isMember ? (
        <div className="relative z-10 bg-[#F7F1E8] border-t border-[#EADFD6]">
          {p.replyTo && (
            <div className="px-3 pt-2">
              <div className="flex overflow-hidden rounded-lg bg-[#E5D9C6]">
                <span className="w-1 bg-[#8B1E3F]" />
                <div className="flex-1 min-w-0 px-3 py-2">
                  <p className="text-[13px] font-medium" style={{ color: "#8B1E3F" }}>{p.replyTo.author === p.myName ? "You" : p.replyTo.author}</p>
                  <p className="text-[13px] text-[#5E5754] truncate">{p.replyTo.text}</p>
                </div>
                <button onClick={() => p.setReplyTo(null)} aria-label="Cancel reply" className="px-3"><X className="w-4 h-4 text-[#5E5754]" /></button>
              </div>
            </div>
          )}

          {p.composerMedia && (
            <div className="px-3 pt-2">
              <div className="relative inline-block">
                {p.composerMedia.type === "image"
                  ? <img src={p.composerMedia.url} alt="Preview" className="max-h-36 rounded-lg object-cover" />
                  : <video src={p.composerMedia.url} className="max-h-36 rounded-lg" />}
                <button onClick={p.removeMedia} aria-label="Remove attachment" className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {p.pollOpen && (
            <div className="mx-3 mt-2 rounded-lg bg-white p-3 space-y-2">
              <div className="flex items-center justify-between text-[13px] font-medium text-[#1A1818]">
                <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-[#8B1E3F]" /> Create poll</span>
                <button onClick={() => { p.setPollOpen(false); p.setPollOptions(["", ""]); }} aria-label="Remove poll"><X className="w-4 h-4 text-[#5E5754]" /></button>
              </div>
              {p.pollOptions.map((o, i) => (
                <input key={i} value={o} maxLength={60} onChange={(e) => p.setPollOptions((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} className="w-full rounded-lg border border-[#E9EDEF] px-3 py-2 text-[14px] outline-none focus:border-[#8B1E3F]" />
              ))}
              {p.pollOptions.length < 4 && <button onClick={() => p.setPollOptions((arr) => [...arr, ""])} className="text-[13px] font-medium text-[#8B1E3F]">+ Add option</button>}
            </div>
          )}

          {locationOpen && (
            <div className="mx-3 mt-2">
              <input autoFocus value={p.composerLocation} onChange={(e) => p.setComposerLocation(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setLocationOpen(false)} onBlur={() => setLocationOpen(false)} placeholder="Add a location, e.g. Udaipur, Rajasthan" className="w-full rounded-lg bg-white border border-[#E9EDEF] px-3 py-2 text-[14px] outline-none" />
            </div>
          )}
          {(p.composerEvent || (p.composerLocation.trim() && !locationOpen)) && (
            <div className="flex flex-wrap gap-2 px-3 pt-2">
              {p.composerEvent && <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-[#5E5754]"><Calendar className="w-3 h-3" /> {p.composerEvent}<button onClick={() => p.setComposerEvent("")} aria-label="Remove event"><X className="w-3 h-3" /></button></span>}
              {p.composerLocation.trim() && !locationOpen && <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-[#5E5754]"><MapPin className="w-3 h-3" /> {p.composerLocation.trim()}<button onClick={() => p.setComposerLocation("")} aria-label="Remove location"><X className="w-3 h-3" /></button></span>}
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-3">
            <div className="relative">
              <button onClick={() => { setAttachOpen((v) => !v); setEmojiOpen(false); }} aria-label="Attach" className="p-2 rounded-full text-[#5E5754] hover:bg-black/5">
                <Paperclip className="w-5 h-5" />
              </button>
              {attachOpen && (
                <div className="absolute bottom-12 left-0 z-30 w-48 rounded-2xl bg-white py-2 shadow-[0_2px_12px_rgba(11,20,26,.25)]">
                  {[
                    { label: "Photos & videos", color: "#AC44CF", Icon: ImageIcon, run: () => p.pickFile() },
                    { label: "Poll", color: "#FFBC38", Icon: BarChart3, run: () => p.setPollOpen(true) },
                    { label: "Location", color: "#02A698", Icon: MapPin, run: () => setLocationOpen(true) },
                  ].map(({ label, color, Icon, run }) => (
                    <button key={label} onClick={() => { closeAll(); run(); }} className="flex w-full items-center gap-3 px-4 py-2 text-left text-[14.5px] text-[#1A1818] hover:bg-[#F5F6F6]">
                      <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: color }}><Icon className="w-4 h-4 text-white" /></span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => { setEmojiOpen((v) => !v); setAttachOpen(false); }} aria-label="Emoji" className="p-2 rounded-full text-[#5E5754] hover:bg-black/5">
                <Smile className="w-5 h-5" />
              </button>
              {emojiOpen && (
                <div className="absolute bottom-12 left-0 z-30 grid w-72 grid-cols-8 gap-1 rounded-xl bg-white p-2 shadow-[0_2px_12px_rgba(11,20,26,.25)]">
                  {WA_EMOJIS.map((e) => <button key={e} onClick={() => p.setComposerText(p.composerText + e)} className="rounded p-1 text-xl hover:bg-[#F5F6F6]">{e}</button>)}
                </div>
              )}
            </div>
            <textarea
              ref={taRef}
              value={p.composerText}
              rows={1}
              maxLength={2000}
              placeholder="Message..."
              onChange={(e) => p.setComposerText(e.target.value)}
              onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 112) + "px"; }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (!p.posting) p.onSend(); } }}
              className="flex-1 resize-none rounded-[22px] bg-white border border-[#E9E1D5] px-4 py-2.5 text-sm leading-[20px] outline-none placeholder:text-[#8A827E] focus:ring-2 focus:ring-[#8B1E3F]/25 max-h-28"
            />
            <button onClick={p.onSend} disabled={p.posting || !hasContent} className="h-11 px-6 shrink-0 rounded-full bg-[#8B1E3F] text-white text-sm font-semibold hover:bg-[#721831] disabled:opacity-50 shadow-[0_6px_16px_-6px_rgba(139,30,63,0.55)]">Send</button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex items-center justify-between gap-3 bg-[#F7F1E8] px-4 py-3">
          <p className="text-[13.5px] text-[#5E5754]">Join this community to send messages.</p>
          <button onClick={p.onJoin} className="rounded-full bg-[#8B1E3F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#721831]">{p.joinLabel}</button>
        </div>
      )}

      {viewer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4" onClick={() => setViewer(null)}>
          <button aria-label="Close" className="absolute top-4 right-4 text-white"><X className="w-7 h-7" /></button>
          {viewer.type === "image"
            ? <img src={viewer.src} alt="" className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
            : <video src={viewer.src} controls autoPlay className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()} />}
        </div>
      )}
    </div>
  );
}

/* ------------------- Events, quotation & escrow (community tabs) ------------------- */
interface QuoteInfo { seats: number; addons: string[]; discountPct: number; total: number; method?: string }

const QUOTES_KEY = "jea.event.quotes.v1";
const readQuotes = (): Record<string, QuoteInfo> => {
  try { const v = JSON.parse(localStorage.getItem(QUOTES_KEY) || "{}"); return v && typeof v === "object" ? v : {}; }
  catch { return {}; }
};
const saveQuote = (id: string, q: QuoteInfo) => {
  try { localStorage.setItem(QUOTES_KEY, JSON.stringify({ ...readQuotes(), [id]: q })); } catch { /* ignore */ }
};
/** What the user paid for this booking: the saved group quote if there is one, else seats x price. */
const bookingAmount = (ev: EventItem) => {
  const seats = ev.myBooking ?? 0;
  const q = readQuotes()[ev.id];
  return q && q.seats === seats ? q.total : seats * ev.price;
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
/** Opens a print-ready page; the browser's print dialog lets the user "Save as PDF". */
const printDoc = (title: string, body: string): boolean => {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(
    `<!doctype html><html><head><title>${esc(title)}</title><style>
    body{font-family:system-ui,sans-serif;color:#1A1818;padding:32px;max-width:720px;margin:auto}
    h1{color:#8B1E3F;font-size:22px;margin:0 0 4px}small{color:#5E5754}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{text-align:left;padding:8px;border-bottom:1px solid #E9E1D5;font-size:14px}
    .r{text-align:right}.total td{font-weight:700;font-size:16px}
    </style></head><body>${body}</body></html>`
  );
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 300);
  return true;
};

/* Placeholder catalogue until organisers can define these per event. Edit freely. */
const GROUP_DISCOUNT_FROM = 5;
const GROUP_DISCOUNT_PCT = 10;
const EVENT_ADDONS = [
  { id: "cert", label: "Include certificate", price: 150 },
  { id: "review", label: "Guided portfolio review", price: 300 },
  { id: "kit", label: "Equipment rental kit", price: 500 },
];
const INCLUSIONS: Record<string, string[]> = {
  "Photography Events": ["Lighting gear", "Model shoot", "High tea", "Certificate"],
  Workshops: ["Study material", "Hands-on session", "Refreshments", "Certificate"],
};
const DEFAULT_INCLUSIONS = ["Entry pass", "Refreshments", "Networking", "Certificate"];
const inclusionIcon = (label: string) => {
  const l = label.toLowerCase();
  if (/light|gear|kit/.test(l)) return Sparkles;
  if (/model|shoot|photo|camera/.test(l)) return Camera;
  if (/tea|coffee|refresh|lunch|food/.test(l)) return Coffee;
  if (/cert/.test(l)) return Award;
  return Ticket;
};

const buildQuote = (ev: EventItem, seats: number, addons: string[]) => {
  const perHead = EVENT_ADDONS.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const base = seats * ev.price;
  const addonTotal = seats * perHead;
  const discountPct = seats >= GROUP_DISCOUNT_FROM ? GROUP_DISCOUNT_PCT : 0;
  const discount = Math.round(((base + addonTotal) * discountPct) / 100);
  return { seats, addons, base, addonTotal, discountPct, discount, total: base + addonTotal - discount };
};

interface TrancheInfo { n: 1 | 2 | 3; title: string; amount: number; released: boolean; when: string; ref?: string }
/** 50% on booking, 25% at event check-in, 25% after completion. Status is derived from the event date. */
const buildTranches = (ev: EventItem, total: number): TrancheInfo[] => {
  const start = parseISO(ev.date).getTime();
  const done = start + 24 * 3600e3;
  const now = Date.now();
  const a1 = Math.round(total * 0.5);
  const a2 = Math.round(total * 0.25);
  const hrs = Math.max(1, Math.ceil((done - now) / 3600e3));
  return [
    { n: 1, title: "Tranche 1 (50% Upfront)", amount: a1, released: true, when: "Released to the organizer on booking" },
    {
      n: 2, title: "Tranche 2 (25% Event check-in)", amount: a2, released: now >= start,
      when: now >= start ? "Released at event check-in" : `Releases at check-in · ${dateFull(ev.date)}`,
    },
    {
      n: 3, title: "Tranche 3 (25% Post-event completion)", amount: total - a1 - a2, released: now >= done,
      when: now >= done ? "Released after event completion" : now >= start ? `Releases in about ${hrs} hr${hrs > 1 ? "s" : ""}` : "Releases after the event is completed",
    },
  ];
};

/* ------------------------------ Community Events tab ------------------------------ */
function EventsPanel({ community, events, onBook, onCancel, onChat, canCreate, onCreate }: {
  community: Community; events: EventItem[];
  onBook: (ev: EventItem) => void | Promise<void>;
  onCancel: (ev: EventItem) => void | Promise<void>;
  onChat: (ev: EventItem) => void | Promise<void>;
  canCreate: boolean; onCreate: () => void;
}) {
  const [selId, setSelId] = useState<string | null>(null);
  const ev = events.find((e) => e.id === selId) ?? events[0] ?? null;
  const inclusions = ev ? (ev.inclusions?.length ? ev.inclusions : INCLUSIONS[ev.category ?? ""] ?? DEFAULT_INCLUSIONS) : [];
  const gallery: string[] = ev?.pastPhotos ?? [];
  const full = !!ev && ev.filled >= ev.capacity;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#FBE9DC] ring-1 ring-[#EADFD6] px-4 py-2.5">
        <EscrowBadge label="Verified Protection" />
        <p className="text-xs text-[#3D3735]">Every paid booking is held in escrow before the event and released to the organizer in phases afterwards.</p>
      </div>

      {events.length === 0 || !ev ? (
        <div className={`bg-white rounded-2xl p-10 text-center ${cardShadow}`}>
          <p className="text-sm text-[#5E5754]">No events in this community yet.</p>
          {canCreate && <Btn className="mt-4" onClick={onCreate}><Plus className="w-4 h-4" /> Create event</Btn>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-5">
          {/* ---- left: event list ---- */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="cm-serif text-xl font-bold text-[#8B1E3F]">In-Community Events</h3>
                <p className="text-xs text-[#5E5754] mt-0.5">{community.name}</p>
              </div>
              {canCreate && <Btn size="sm" onClick={onCreate}><Plus className="w-3.5 h-3.5" /> New</Btn>}
            </div>
            <div className="space-y-3 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1">
              {events.map((e) => {
                const soldOut = e.filled >= e.capacity;
                return (
                  <div
                    key={e.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelId(e.id)}
                    onKeyDown={(k) => k.key === "Enter" && setSelId(e.id)}
                    className={`rounded-2xl overflow-hidden bg-white cursor-pointer ${cardShadow} ${cardHover} ${ev.id === e.id ? "!ring-2 !ring-[#8B1E3F]" : ""}`}
                  >
                    <Cover src={e.image} bg={e.banner} className="h-24">
                      <div className="absolute top-2 left-2 bg-white rounded-lg px-2 py-1 text-center min-w-[40px] shadow">
                        <p className="text-[9px] font-bold tracking-wider text-[#8B1E3F] leading-none">{monthShort(e.date)}</p>
                        <p className="text-base font-extrabold leading-none mt-0.5">{dayNum(e.date)}</p>
                      </div>
                      <span className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-[10px] font-bold">
                        {soldOut ? "Sold out" : `${e.capacity} spots`}
                      </span>
                    </Cover>
                    <div className="p-3">
                      <p className="font-bold text-sm leading-snug line-clamp-2">{e.title}</p>
                      <p className="text-[11px] text-[#5E5754] mt-0.5 truncate">by {e.organizer} · {e.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        {e.price === 0
                          ? <span className="font-extrabold text-[#1F6B45]">Free</span>
                          : <span className="font-extrabold text-[#8B1E3F]">{inr(e.price)}</span>}
                        {e.myBooking && <span className="text-[11px] font-semibold text-[#1F6B45] inline-flex items-center gap-1"><Check className="w-3 h-3" /> Booked</span>}
                      </div>
                      {e.price > 0 && <div className="mt-2"><EscrowBadge /></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- right: event detail ---- */}
          <div className={`bg-white rounded-2xl p-5 sm:p-6 ${cardShadow}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="cm-serif text-2xl sm:text-3xl font-bold leading-tight text-[#1A1818]">{ev.title}</h2>
                <p className="text-sm text-[#5E5754] mt-1">by {ev.organizer}</p>
              </div>
              {ev.myBooking ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#1F6B45] inline-flex items-center gap-1"><Check className="w-4 h-4" /> {ev.myBooking} seat{ev.myBooking > 1 ? "s" : ""} booked</span>
                  <Btn size="sm" variant="outline" onClick={() => onChat(ev)}>Event chat</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => onCancel(ev)}>Cancel</Btn>
                </div>
              ) : (
                <Btn onClick={() => onBook(ev)}>
                  {full ? (ev.onWaitlist ? "On waitlist ✓" : "Join Waitlist") : ev.price === 0 ? "Register Free" : "Book Ticket"}
                </Btn>
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{ev.filled}/{ev.capacity} spots filled</span>
                <span className="inline-flex items-center gap-2 text-xs text-[#5E5754]">
                  <Facepile seed={ev.id} total={ev.filled} max={3} size={22} /> attending
                </span>
              </div>
              <div className="w-full bg-[#F5EFE6] rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full ${full ? "bg-[#1A1818]" : "bg-[#8B1E3F]"}`} style={{ width: `${Math.min(100, (ev.filled / ev.capacity) * 100)}%` }} />
              </div>
            </div>

            <h4 className="cm-serif text-lg font-bold mt-6 mb-3">What's Included</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {inclusions.map((label) => {
                const Icon = inclusionIcon(label);
                return (
                  <div key={label} className="rounded-2xl bg-[#F5EFE6] p-3 flex flex-col items-center text-center gap-2">
                    <Icon className="w-7 h-7 text-[#8B1E3F]" strokeWidth={1.6} />
                    <span className="text-xs font-semibold text-[#3D3735]">{label}</span>
                  </div>
                );
              })}
            </div>

            {gallery.length > 0 && (
              <>
                <h4 className="cm-serif text-lg font-bold mt-6 mb-3">Past Workshop Photos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gallery.slice(0, 8).map((src, i) => <img key={i} src={src} alt="" loading="lazy" className="w-full h-28 rounded-xl object-cover" />)}
                </div>
              </>
            )}

            <div className="mt-6 grid gap-2 text-sm text-[#3D3735]">
              <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#8B1E3F]" /> <b>Date:</b> {dateFull(ev.date)}</p>
              <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#8B1E3F]" /> <b>Time:</b> {ev.time}</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#8B1E3F]" /> <b>Location:</b> {ev.location}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F5EFE6] px-4 py-3">
              <p className="text-sm">
                {ev.price === 0 ? <b className="text-xl text-[#1F6B45]">Free</b> : <><b className="text-xl text-[#8B1E3F]">{inr(ev.price)}</b> <span className="text-xs text-[#5E5754]">/person</span></>}
              </p>
              {ev.price > 0 && <EscrowBadge />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Escrow Wallet tab ------------------------------- */
function EscrowPanel({ events, communityName, toast }: {
  events: EventItem[]; communityName: string; toast: (t: string) => void;
}) {
  const [selId, setSelId] = useState<string | null>(null);
  const [server, setServer] = useState<Record<string, api.ApiTranche[]>>({});
  const bookedKey = events.filter((e) => e.myBooking && e.price > 0).map((e) => e.id).join(",");
  useEffect(() => {
    if (!bookedKey) return;
    let alive = true;
    api.listEscrow(bookedKey.split(","))
      .then((list) => {
        if (!alive) return;
        const m: Record<string, api.ApiTranche[]> = {};
        list.forEach((t) => (m[t.eventId] ||= []).push(t));
        setServer(m);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [bookedKey]);

  const rows = events
    .filter((e) => e.myBooking && e.price > 0)
    .map((ev) => {
      const saved = server[ev.id];
      const tr: TrancheInfo[] = saved?.length
        ? saved.map((s) => ({
            n: s.n as 1 | 2 | 3, title: s.label, amount: s.amount, ref: s.ref,
            released: s.status === "released",
            when: s.status === "released"
              ? `Released ${new Date(s.releasedAt ?? s.releaseAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
              : `Releases ${dateFull(ymd(new Date(s.releaseAt)))}`,
          }))
        : buildTranches(ev, bookingAmount(ev));
      const total = tr.reduce((s, t) => s + t.amount, 0);
      return { ev, total, tr, released: tr.filter((t) => t.released).reduce((s, t) => s + t.amount, 0) };
    });
  const cur = rows.find((r) => r.ev.id === selId) ?? rows[0] ?? null;
  const totalPaid = rows.reduce((s, r) => s + r.total, 0);
  const disbursed = rows.reduce((s, r) => s + r.released, 0);
  const locked = totalPaid - disbursed;
  const refOf = (id: string, n: number) => `ESC-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}-T${n}`;

  const copy = (text: string) =>
    navigator.clipboard?.writeText(text).then(() => toast("Reference copied")).catch(() => {});

  const downloadStatement = () => {
    const lines = rows.map((r) =>
      `<tr><td>${esc(r.ev.title)}<br><small>${esc(dateFull(r.ev.date))} · ${r.ev.myBooking} seat(s)</small></td>
       <td class="r">${inr(r.total)}</td><td class="r">${inr(r.released)}</td><td class="r">${inr(r.total - r.released)}</td></tr>`
    ).join("");
    const ok = printDoc(
      "Escrow settlement statement",
      `<h1>Jashan-E-Aas · Escrow settlement statement</h1><small>${esc(communityName)} · generated ${esc(new Date().toLocaleDateString("en-IN"))}</small>
       <table><tr><th>Event</th><th class="r">Paid</th><th class="r">Released</th><th class="r">In escrow</th></tr>${lines}
       <tr class="total"><td>Total</td><td class="r">${inr(totalPaid)}</td><td class="r">${inr(disbursed)}</td><td class="r">${inr(locked)}</td></tr></table>`
    );
    if (!ok) toast("Allow pop-ups to download the statement");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FBE9DC] ring-1 ring-[#EADFD6] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <EscrowBadge label="Verified & Escrow Protected" />
          <p className="text-xs text-[#3D3735]">Every paid booking is held in escrow before the event and released to the organizer in phases afterwards.</p>
        </div>
        <button type="button" onClick={downloadStatement} disabled={rows.length === 0} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B1E3F] hover:underline disabled:opacity-40">
          <Download className="w-3.5 h-3.5" /> Download settlement statement
        </button>
      </div>

      <div className={`rounded-2xl bg-white p-5 sm:p-6 ${cardShadow}`}>
        <h3 className="cm-serif text-xl sm:text-2xl font-bold text-[#1A1818]">Protected Wallet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {([["Total paid", totalPaid], ["Locked in escrow", locked], ["Released to organizers", disbursed]] as const).map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-gradient-to-br from-[#FBE9DC] to-[#F5EFE6] ring-1 ring-[#EADFD6] p-4">
              <p className="text-xs font-semibold text-[#5E5754]">{label}</p>
              <p className="cm-serif text-2xl font-bold text-[#8B1E3F] mt-1">{inr(value)}</p>
            </div>
          ))}
        </div>

        <p className="cm-serif text-lg font-semibold mt-7">Split escrow flow</p>
        <p className="text-xs text-[#5E5754] mt-1 max-w-xl">
          Jashan-E-Aas holds 100% of the funds at booking, pays 50% upfront to the organizer, and releases the remaining 50% in two milestone tranches.
        </p>
        <div className="flex flex-wrap items-start gap-x-3 gap-y-4 mt-4">
          {([["100%", "Held securely at booking"], ["50%", "Upfront paid to organizer"], ["25%", "Released at event check-in"], ["25%", "Released after completion"]] as const).map(([p, c], i, arr) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-28">
                <p className="cm-serif text-3xl font-bold text-[#8B1E3F]">{p}</p>
                <p className="text-[11px] text-[#5E5754] mt-1">{c}</p>
              </div>
              {i < arr.length - 1 && <span className="text-2xl text-[#8B1E3F]/60 mt-1">→</span>}
            </div>
          ))}
        </div>
      </div>

      {rows.length === 0 || !cur ? (
        <div className={`rounded-2xl bg-white p-10 text-center text-sm text-[#5E5754] ${cardShadow}`}>
          No paid bookings in this community yet. Book a paid event and its escrow schedule will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-5">
          {/* ---- left: bookings ---- */}
          <div className={`rounded-2xl bg-white p-5 ${cardShadow}`}>
            <h3 className="cm-serif text-lg font-bold text-[#8B1E3F]">Your escrow bookings</h3>
            <div className="mt-3 divide-y divide-[#F0E9DD]">
              {rows.map((r) => {
                const all = r.tr.every((t) => t.released);
                return (
                  <button
                    key={r.ev.id}
                    type="button"
                    onClick={() => setSelId(r.ev.id)}
                    className={`flex w-full items-center gap-3 py-3 px-2 text-left rounded-xl hover:bg-[#FAF8F5] ${cur.ev.id === r.ev.id ? "bg-[#F5EFE6]" : ""}`}
                  >
                    <span className="shrink-0 w-11 rounded-lg bg-[#F5EFE6] text-center py-1">
                      <span className="block text-[9px] font-bold tracking-wider text-[#8B1E3F] leading-none">{monthShort(r.ev.date)}</span>
                      <span className="block text-lg font-extrabold leading-none mt-0.5">{dayNum(r.ev.date)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold truncate">{r.ev.title}</span>
                      <span className="block text-[11px] text-[#5E5754]">{r.ev.myBooking} seat{(r.ev.myBooking ?? 0) > 1 ? "s" : ""} · {inr(r.total)}</span>
                    </span>
                    <span className={`shrink-0 text-[11px] font-semibold rounded-full px-2.5 py-1 ${all ? "bg-[#E8F3EC] text-[#1F6B45]" : "bg-[#F5EFE6] text-[#8B1E3F]"}`}>
                      {all ? "Fully released" : "Held in escrow"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#8A827E] shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---- right: tranche tracker ---- */}
          <div className={`rounded-2xl bg-white p-5 ${cardShadow}`}>
            <h3 className="cm-serif text-lg font-bold text-[#8B1E3F]">Split Tranche Disbursement Tracker</h3>
            <p className="text-xs text-[#5E5754] mt-0.5 truncate">{cur.ev.title} · {inr(cur.total)}</p>
            <ol className="relative mt-4 space-y-4">
              <span className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-[#EBCFC4]" aria-hidden="true" />
              {cur.tr.map((t) => (
                <li key={t.n} className="relative pl-10">
                  <span className={`absolute left-0 top-5 w-6 h-6 rounded-full flex items-center justify-center ${t.released ? "bg-[#8B1E3F] text-white" : "bg-white border-2 border-[#EBCFC4]"}`}>
                    {t.released && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <div className="rounded-2xl overflow-hidden ring-1 ring-[#EADFD6] bg-white">
                    <div className={`flex items-center justify-between gap-2 px-4 py-2 ${t.released ? "bg-[#F8D9CE]" : "bg-[#F5EFE6]"}`}>
                      <p className="text-sm font-semibold">{t.title}</p>
                      <p className="text-xs font-semibold text-[#3D3735] shrink-0">{inr(t.amount)}</p>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="cm-serif text-xl font-bold text-[#1A1818]">
                          {inr(t.amount)} <span className="text-sm font-normal text-[#5E5754]" style={{ fontFamily: "inherit" }}>{t.released ? "released" : "held in escrow"}</span>
                        </p>
                        <p className="text-[11px] text-[#5E5754] mt-0.5">{t.when}</p>
                      </div>
                      <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${t.released ? "bg-[#E8F3EC] text-[#1F6B45]" : "bg-[#F5EFE6] text-[#5E5754]"}`}>
                        {t.released ? "Disbursed ✓" : "Pending"}
                      </span>
                    </div>
                    <div className="px-4 pb-3 flex items-center justify-between text-[11px] text-[#5E5754]">
                      <span>Escrow ref: {t.ref ?? refOf(cur.ev.id, t.n)}</span>
                      <button type="button" aria-label="Copy reference" onClick={() => copy(t.ref ?? refOf(cur.ev.id, t.n))}><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- Booking drawer: quote calculator -> escrow checkout ----------------- */
function BookingDrawer({ ev, onClose, onConfirm, toast }: {
  ev: EventItem | null; onClose: () => void;
  onConfirm: (seats: number, quote: QuoteInfo) => Promise<void>; toast: (t: string) => void;
}) {
  const [step, setStep] = useState<"quote" | "pay">("quote");
  const [seats, setSeats] = useState(1);
  const [addons, setAddons] = useState<string[]>([]);
  const [method, setMethod] = useState("upi");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setStep("quote"); setSeats(1); setAddons([]); setMethod("upi"); setBusy(false); }, [ev?.id]);
  useEffect(() => {
    if (!ev) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ev, onClose]);

  const q = ev ? buildQuote(ev, seats, ev.price > 0 ? addons : []) : null;
  const maxSeats = ev ? Math.max(1, Math.min(20, ev.capacity - ev.filled)) : 1;
  const paid = !!q && q.total > 0;

  const submit = async () => {
    if (!ev || !q || busy) return;
    setBusy(true);
    try { await onConfirm(seats, { seats, addons: q.addons, discountPct: q.discountPct, total: q.total, method }); }
    finally { setBusy(false); }
  };

  const downloadQuote = () => {
    if (!ev || !q) return;
    const addonRows = EVENT_ADDONS.filter((a) => q.addons.includes(a.id))
      .map((a) => `<tr><td>${esc(a.label)} × ${seats}</td><td class="r">${inr(a.price * seats)}</td></tr>`).join("");
    const ok = printDoc(
      `Quotation – ${ev.title}`,
      `<h1>Jashan-E-Aas · Quotation</h1><small>${esc(ev.title)} · ${esc(dateFull(ev.date))} · ${esc(ev.location)}</small>
       <table><tr><th>Description</th><th class="r">Amount</th></tr>
       <tr><td>Tickets × ${seats} @ ${inr(ev.price)}</td><td class="r">${inr(q.base)}</td></tr>${addonRows}
       ${q.discount ? `<tr><td>Group discount (${q.discountPct}%)</td><td class="r">− ${inr(q.discount)}</td></tr>` : ""}
       <tr class="total"><td>Estimated total</td><td class="r">${inr(q.total)}</td></tr></table>
       <p><small>Held in escrow: 50% released on booking, 25% at event check-in, 25% after completion.</small></p>`
    );
    if (!ok) toast("Allow pop-ups to download the quote");
  };

  const after = ev ? dateFull(ymd(new Date(parseISO(ev.date).getTime() + 864e5))) : "";
  const a1 = q ? Math.round(q.total * 0.5) : 0;
  const a2 = q ? Math.round(q.total * 0.25) : 0;
  const a3 = q ? q.total - a1 - a2 : 0;

  return (
    <AnimatePresence>
      {ev && q && (
        <motion.div key="bd" className="fixed inset-0 z-[100] bg-[#1A1818]/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      )}
      {ev && q && (
        <motion.aside
          key="drawer"
          role="dialog" aria-modal="true" aria-label="Booking"
          className="fixed right-0 top-0 z-[101] h-full w-full sm:w-[400px] bg-white shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.3)] flex flex-col"
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.25 }}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#F0E9DD]">
            <h2 className="cm-serif text-lg font-bold text-[#8B1E3F]">
              {step === "quote" ? "Custom Quotation & Group Booking" : "Escrow Checkout"}
            </h2>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-[#F5EFE6]"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <div>
              <p className="font-bold text-sm">{ev.title}</p>
              <p className="text-xs text-[#5E5754] mt-0.5">{dateFull(ev.date)} · {ev.time} · {ev.location}</p>
            </div>

            {step === "quote" ? (
              <>
                <div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Select headcount</span>
                    <span className="min-w-[32px] text-center rounded-lg bg-[#F5EFE6] px-2 py-0.5 font-bold">{seats}</span>
                  </div>
                  <input type="range" min={1} max={maxSeats} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="w-full mt-2 accent-[#8B1E3F]" />
                  <p className="text-[11px] text-[#5E5754]">{ev.capacity - ev.filled} spots left · group discount from {GROUP_DISCOUNT_FROM} people</p>
                </div>

                {ev.price > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#5E5754] mb-2">Add-ons</p>
                    <div className="space-y-2">
                      {EVENT_ADDONS.map((a) => (
                        <label key={a.id} className="flex items-start gap-2.5 text-sm cursor-pointer">
                          <input
                            type="checkbox" className="mt-0.5 accent-[#8B1E3F]" checked={addons.includes(a.id)}
                            onChange={() => setAddons((cur) => (cur.includes(a.id) ? cur.filter((x) => x !== a.id) : [...cur, a.id]))}
                          />
                          <span>{a.label} <span className="text-[#5E5754]">({inr(a.price)}/person)</span></span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-[#F5EFE6] p-4 text-sm space-y-1">
                  <p className="cm-serif font-bold text-base mb-1">Pricing Summary</p>
                  <p className="flex justify-between"><span>Tickets × {seats}</span><span>{inr(q.base)}</span></p>
                  {q.addonTotal > 0 && <p className="flex justify-between"><span>Add-ons</span><span>{inr(q.addonTotal)}</span></p>}
                  {q.discount > 0 && <p className="flex justify-between text-[#1F6B45]"><span>Group discount applied ({q.discountPct}%)</span><span>− {inr(q.discount)}</span></p>}
                  <p className="flex justify-between font-extrabold text-[#8B1E3F] pt-1 border-t border-[#E5D9C6]"><span>Estimated total</span><span>{q.total === 0 ? "Free" : inr(q.total)}</span></p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5E5754] mb-2">Instant quote preview</p>
                  <div className="rounded-xl border border-[#E9E1D5] bg-white p-3 text-[11px] text-[#3D3735] shadow-sm">
                    <p className="font-bold text-[#8B1E3F]">Jashan-E-Aas · Quotation</p>
                    <p className="text-[#5E5754] truncate">{ev.title}</p>
                    <div className="mt-2 space-y-0.5">
                      <p className="flex justify-between"><span>Tickets × {seats}</span><span>{inr(q.base)}</span></p>
                      {EVENT_ADDONS.filter((a) => q.addons.includes(a.id)).map((a) => (
                        <p key={a.id} className="flex justify-between"><span>{a.label}</span><span>{inr(a.price * seats)}</span></p>
                      ))}
                      {q.discount > 0 && <p className="flex justify-between"><span>Discount</span><span>− {inr(q.discount)}</span></p>}
                      <p className="flex justify-between font-bold border-t border-[#E9E1D5] pt-0.5"><span>Total</span><span>{inr(q.total)}</span></p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-end justify-between">
                  <p className="text-xs text-[#5E5754]">{seats} seat{seats > 1 ? "s" : ""} · itemised quotation</p>
                  <p className="cm-serif text-2xl font-bold text-[#8B1E3F]">{inr(q.total)}</p>
                </div>
                <div className="space-y-2">
                  {[
                    ["Tranche 1: Upfront (50%)", a1, "Released on booking"],
                    ["Tranche 2: Check-in (25%)", a2, dateFull(ev.date)],
                    ["Tranche 3: Final (25%)", a3, after],
                  ].map(([t, amt, when]) => (
                    <div key={t as string} className="rounded-xl bg-[#F5EFE6] px-3.5 py-2.5 flex items-center justify-between gap-3">
                      <div><p className="text-sm font-semibold">{t}</p><p className="text-[11px] text-[#5E5754]">{when}</p></div>
                      <span className="text-sm font-bold text-[#8B1E3F]">{inr(amt as number)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5E5754] mb-2">Payment method</p>
                  <div className="space-y-2">
                    {[["upi", "UPI"], ["card", "Debit / credit card"], ["wallet", "Wallet"]].map(([v, l]) => (
                      <label key={v} className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm cursor-pointer ${method === v ? "border-[#8B1E3F] bg-[#FFF7FA]" : "border-[#E9E1D5]"}`}>
                        {l}
                        <input type="radio" name="pay-method" className="accent-[#8B1E3F]" checked={method === v} onChange={() => setMethod(v)} />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#E8F3EC] rounded-xl p-3">
                  <ShieldCheck className="w-5 h-5 text-[#1F6B45] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#2F5A44]">Your payment is held in escrow and released to the organizer in phases.</p>
                </div>
              </>
            )}
          </div>

          <div className="px-5 py-4 border-t border-[#F0E9DD] space-y-2">
            {step === "quote" ? (
              <>
                {ev.price > 0 && <Btn variant="outline" className="w-full" onClick={downloadQuote}><Download className="w-4 h-4" /> Download PDF Quote</Btn>}
                <Btn className="w-full" disabled={busy} onClick={() => (paid ? setStep("pay") : submit())}>
                  {paid ? (seats > 1 ? "Pay & Book Group" : "Pay & Book Ticket") : busy ? "Booking…" : "Confirm Registration"}
                </Btn>
              </>
            ) : (
              <>
                <Btn className="w-full" disabled={busy} onClick={submit}>{busy ? "Processing…" : `Lock & Pay ${inr(q.total)} via Escrow`}</Btn>
                <Btn variant="ghost" className="w-full" onClick={() => setStep("quote")}>Back to quote</Btn>
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function Community() {
  const { user } = useAuthUser();
  const isMine = useCallback((c: Community) => !!user && c.adminId === user.id, [user]);
  const myInitials = initialsOf(String(user?.user_metadata?.full_name ?? user?.email ?? "You"));
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const viewingRef = useRef<string | null>(null); // community feed currently open (and joined)
  const navigate = useNavigate();
  const { pathname, search: queryString } = useLocation();
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const activeTab: TabKey = slug
    ? "feed"
    : tabParam === "events" || tabParam === "feed"
    ? tabParam
    : "communities";

  const goTab = (tab: TabKey, community?: Community | null) => {
    let target = "/community";
    if (tab === "feed" && community) target = `/community/${slugify(community.name)}`;
    else if (tab !== "communities") target = `/community?tab=${tab}`;
    if (target === pathname + queryString) return;
    navigate(target);
  };
  const setActiveTab = (tab: TabKey) => goTab(tab);
  const setFeedCommunityId = (id: string | null) =>
    goTab("feed", id ? communities.find((c) => c.id === id) ?? null : null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [shareTarget, setShareTarget] = useState<Post | null>(null);
  const [shareNote, setShareNote] = useState("");
  const [shareDest, setShareDest] = useState<string[]>([]);

  const [membership, setMembership] = useState<Record<string, Membership>>({});

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [feedFilter, setFeedFilter] = useState<"all" | "mine">("all");

  const [createOpen, setCreateOpen] = useState(false);
  const emptyEventForm = {
    communityId: "", title: "", category: "", location: "", date: "", time: "",
    capacity: "50", price: "0",
  };
  const [eventOpen, setEventOpen] = useState(false);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [eventError, setEventError] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventImage, setEventImage] = useState<string | null>(null);
  const eventImageRef = useRef<HTMLInputElement>(null);
  const [eventInclusions, setEventInclusions] = useState<string[]>([]);
  const [inclusionDraft, setInclusionDraft] = useState("");
  const [eventPhotos, setEventPhotos] = useState<string[]>([]);
  const eventPhotosRef = useRef<HTMLInputElement>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);

  const emptyForm = { name: "", type: COMMUNITY_TYPES[0], city: "", purpose: "", tags: "", isPrivate: false };
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const pickImage = async (e: ChangeEvent<HTMLInputElement>, kind: "banner" | "avatar") => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return setFormError("Please choose an image file.");
    if (f.size > 5 * 1024 * 1024) return setFormError("Image must be under 5 MB.");
    setFormError("");
    try {
      const url = await fileToDataUrl(f, kind === "banner" ? 1000 : 240);
      kind === "banner" ? setBannerPreview(url) : setAvatarPreview(url);
    } catch {
      setFormError("Couldn't read that image. Try another one.");
    }
  };

  const pickEventImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return setEventError("Please choose an image file.");
    if (f.size > 5 * 1024 * 1024) return setEventError("Image must be under 5 MB.");
    setEventError("");
    try {
      setEventImage(await fileToDataUrl(f, 900));
    } catch {
      setEventError("Couldn't read that image. Try another one.");
    }
  };

  const discardImages = () => {
    setBannerPreview(null);
    setAvatarPreview(null);
  };

  // composer
  const [composerText, setComposerText] = useState("");
  const [replyTo, setReplyTo] = useState<{ author: string; text: string } | null>(null);
  const [composerCommunity, setComposerCommunity] = useState("");
  const [composerMedia, setComposerMedia] = useState<{ url: string; type: "image" | "video"; file: File } | null>(null);
  const [posting, setPosting] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  
  const [composerEvent, setComposerEvent] = useState("");
  const [composerLocation, setComposerLocation] = useState("");
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [customEventOpen, setCustomEventOpen] = useState(false);
  const [customEventText, setCustomEventText] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTab>("chat");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const requireLogin = () => {
    if (user) return true;
    toast("Please sign in first");
    try { sessionStorage.setItem("cm_return_to", pathname + queryString); } catch { /* ignore */ }
    navigate(LOGIN_ROUTE);
    return false;
  };

  const shareCommunity = async (c: Community) => {
    const url = inviteUrl(c);
    const text = `Join "${c.name}" on Jashan-E-Aas`;
    try {
      // phones: open the native share sheet (WhatsApp, Instagram, ...)
      if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        await navigator.share({ title: c.name, text, url });
        return;
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Invite link copied");
    } catch {
      window.prompt("Copy this invite link:", url);
    }
  };

  const refreshAll = useCallback(async () => {
    try {
      const [cs, es, ms, un, extras] = await Promise.all([
        api.listCommunities(), api.listEvents(), api.myMemberships(), api.unreadCounts(),
        api.listEventExtras().catch(() => ({} as Record<string, api.EventExtras>)),
      ]);
      setCommunities(cs.map(decorateCommunity));
      setEvents(es.map((e) => ({ ...decorateEvent(e), ...(extras[e.id] ?? {}) })));
      setMembership(ms);
      if (viewingRef.current) un[viewingRef.current] = 0;
      setUnread(un);
    } catch (e: any) {
      toast(e?.message || "Couldn't load communities");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { refreshAll(); }, [refreshAll, user?.id]);

  // Keep unread badges fresh: every 30s and whenever the tab becomes visible again.
  useEffect(() => {
    if (!user) { setUnread({}); return; }
    let alive = true;
    const tick = async () => {
      if (document.hidden) return;
      const viewing = viewingRef.current;
      if (viewing) {
        // the open community is live: show new posts and keep it marked as read
        api.listPosts(viewing)
          .then((p) => {
            if (alive && viewingRef.current === viewing) {
              const localShares = readCommunityShares();
              const ids = new Set(p.map((post) => post.id));
              setPosts([...localShares.filter((post) => !ids.has(post.id)), ...p]);
            }
          })
          .catch(() => {});
        api.markRead(viewing).catch(() => {});
      }
      const un = await api.unreadCounts();
      if (!alive) return;
      if (viewing) un[viewing] = 0;
      setUnread(un);
    };
    const timer = window.setInterval(tick, 30000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [user?.id]);

  const listRef = useRef<HTMLDivElement>(null);

  /* ---------------------------- Derived values ---------------------------- */

  const filteredCommunities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return communities.filter((c) => {
      const matchType =
        typeFilter === "All" ||
        (typeFilter === "My Communities"
          ? isMine(c)
          : typeFilter === "Joined"
          ? membership[c.id] === "joined"
          : c.type === typeFilter);
      const matchSearch =
        !q || [c.name, c.purpose, c.city, c.type, ...c.tags].some((s) => s.toLowerCase().includes(q));
      const matchCity = !cityFilter || c.city === cityFilter;
      return matchType && matchSearch && matchCity;
    });
  }, [communities, search, cityFilter, typeFilter, membership, isMine]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => {
      const matchSearch =
        !q ||
        [ev.title, ev.category, ev.location, ev.organizer, ev.community].some((value) =>
          String(value ?? "").toLowerCase().includes(q)
        );
      const matchCity =
        !cityFilter || ev.location.toLowerCase().includes(cityFilter.toLowerCase());
      return matchSearch && matchCity;
    });
  }, [events, search, cityFilter]);

  const totalMembers = communities.reduce((s, c) => s + c.members, 0);
  const cityOptions = useMemo(
    () => Array.from(new Set(communities.map((c) => c.city).filter(Boolean))),
    [communities]
  );
  const joinedCommunities = communities.filter((c) => membership[c.id] === "joined");
  const totalUnread = joinedCommunities.reduce((sum, c) => sum + (unread[c.id] ?? 0), 0);
  const joinedNames = new Set(joinedCommunities.map((c) => c.name));
  const feedCommunity = slug ? communities.find((c) => slugify(c.name) === slug) ?? null : null;
  const memberLabel =
    totalMembers >= 500
      ? `${(Math.floor(totalMembers / 500) * 500).toLocaleString("en-IN")}+`
      : totalMembers.toLocaleString("en-IN");
const canPost = feedCommunity ? membership[feedCommunity.id] === "joined" : joinedCommunities.length > 0;

const trendingPosts = useMemo(
  () => posts.filter((p) => channelOf(p.content) === "bc").sort((a, b) => (b.likes + b.commentCount) - (a.likes + a.commentCount)).slice(0, 3),
  [posts]
);
const upcomingEvents = useMemo(
  () => [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3),
  [events]
);
const nextEvent = useMemo(() => {
  const picked = events
    .filter((e) => e.showOnHero)
    .sort((a, b) => (a.heroRank ?? 999) - (b.heroRank ?? 999) || a.date.localeCompare(b.date));
  return picked[0] ?? null;
}, [events]);

  useEffect(() => {
    if (slug && !feedCommunity && !loading) navigate("/community", { replace: true });
  }, [slug, feedCommunity, loading, navigate]);

  // posts: reload when the viewed community (or the signed-in user) changes
  useEffect(() => {
    let alive = true;
    api
      .listPosts(feedCommunity?.id)
      .then((p) => {
        if (alive) {
          const localShares = readCommunityShares();
          const ids = new Set(p.map((post) => post.id));
          setPosts([...localShares.filter((post) => !ids.has(post.id)), ...p]);
        }
      })
      .catch((e) => toast(e?.message || "Couldn't load posts"));
    return () => { alive = false; };
  }, [feedCommunity?.id, user?.id, toast]);

  // Opening a joined community's feed marks it as read (badge clears)
  useEffect(() => {
    const id = feedCommunity?.id ?? null;
    if (!id || membership[id] !== "joined") { viewingRef.current = null; return; }
    viewingRef.current = id;
    setUnread((u) => (u[id] ? { ...u, [id]: 0 } : u));
    api.markRead(id).catch(() => {});
    return () => { if (viewingRef.current === id) viewingRef.current = null; };
  }, [feedCommunity?.id, membership]);

  useEffect(() => {
    if (!feedCommunity) return;
    const prev = document.title;
    document.title = `${feedCommunity.name} · Jashan-E-Aas`;
    return () => { document.title = prev; };
  }, [feedCommunity]);

  const visiblePosts = feedCommunity
    ? posts.filter((p) => p.community === feedCommunity.name)
    : feedFilter === "mine"
    ? posts.filter((p) => joinedNames.has(p.community))
    : posts;
  const broadcastPosts = visiblePosts.filter((p) => channelOf(p.content) === "bc");

  const detailCommunity = communities.find((c) => c.id === detailId) || null;
  const bookingEvent = events.find((e) => e.id === bookingEventId) || null;
  const communityEvents = useMemo(
    () => feedCommunity ? events.filter((e) => e.community === feedCommunity.name).sort((a, b) => a.date.localeCompare(b.date)) : [],
    [events, feedCommunity]
  );
  const chatMessages = visiblePosts.filter((p) => channelOf(p.content) === "chat").reverse();
  const myName = String(user?.user_metadata?.full_name ?? user?.email ?? "");
  const pinnedPosts = broadcastPosts.filter((post) => pinnedIds.includes(post.id));
  const pinnedPost = feedCommunity ? broadcastPosts.find((p) => p.author === feedCommunity.admin) : undefined;

  useEffect(() => { setFeedTab("chat"); setShowEmoji(false); }, [feedCommunity?.id]);
  useEffect(() => {
    const el = chatScrollRef.current;
    if (feedTab === "chat" && el) el.scrollTop = el.scrollHeight;
  }, [feedTab, chatMessages.length]);

  const openCommunity = (c: Community) => {
    setFeedFilter("all");
    goTab("feed", c);
    if (membership[c.id] === "joined") setComposerCommunity(c.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!composerCommunity && joinedCommunities.length) setComposerCommunity(joinedCommunities[0].name);
    if (composerCommunity && !joinedNames.has(composerCommunity)) {
      setComposerCommunity(joinedCommunities[0]?.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membership, communities]);

  /* ------------------------------ Communities ----------------------------- */

  const adjustMembers = (id: string, delta: number) =>
    setCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, members: Math.max(0, c.members + delta) } : c)));

  const handleMembership = async (c: Community) => {
    if (!requireLogin()) return;
    if (isMine(c)) return toast("You're the admin of this community");
    const status = membership[c.id];
    try {
      if (status) {
        await api.leaveCommunity(c.id);
        setMembership((m) => { const n = { ...m }; delete n[c.id]; return n; });
        if (status === "joined") adjustMembers(c.id, -1);
        toast(status === "joined" ? `You left ${c.name}` : "Join request cancelled");
      } else {
        const st = await api.joinCommunity(c);
        setMembership((m) => ({ ...m, [c.id]: st }));
        if (st === "joined") adjustMembers(c.id, 1);
        toast(st === "joined" ? `Welcome to ${c.name}! 🎉` : `Request sent to ${c.admin}`);
      }
    } catch (e: any) {
      toast(e?.message || "Something went wrong");
    }
  };

  const membershipLabel = (c: Community) => {
    const s = membership[c.id];
    if (s === "joined") return "Joined ✓";
    if (s === "pending") return "Requested";
    return c.isPrivate ? "Request" : "Join";
  };
  const membershipVariant = (c: Community) =>
    membership[c.id] === "joined" ? "soft" : membership[c.id] === "pending" ? "outline" : "primary";

  const handleBrowseAll = () => {
    setActiveTab("communities");
    setSearch("");
    setCityFilter("");
    setTypeFilter("All");
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleBrowseEvents = () => {
    setActiveTab("events");
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const addEventPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/")).slice(0, 6 - eventPhotos.length);
    e.target.value = "";
    try {
      const urls = await Promise.all(files.map((f) => fileToDataUrl(f, 900)));
      setEventPhotos((p) => [...p, ...urls].slice(0, 6));
    } catch { setEventError("Couldn't read one of those images."); }
  };
  const addInclusion = () => {
    const v = inclusionDraft.trim();
    if (v && eventInclusions.length < 8 && !eventInclusions.includes(v)) setEventInclusions((a) => [...a, v]);
    setInclusionDraft("");
  };

  const handleCreateEvent = () => {
    if (!requireLogin()) return;
    if (joinedCommunities.length === 0) {
      toast("Join or create a community first to host an event");
      return;
    }
    const defaultCommunity =
      feedCommunity && membership[feedCommunity.id] === "joined"
        ? feedCommunity
        : joinedCommunities[0];
    setEventForm({ ...emptyEventForm, communityId: defaultCommunity.id });
    setEventError("");
    setEventImage(null);
    setEventInclusions([]); setEventPhotos([]); setInclusionDraft("");
    setEventOpen(true);
  };

  const submitEvent = async (e: FormEvent) => {
    e.preventDefault();
    const f = eventForm;
    const capacity = Number(f.capacity);
    const price = Number(f.price);
    const today = new Date().toISOString().slice(0, 10);

    if (!f.communityId) return setEventError("Join or create a community first.");
    if (!f.category.trim()) return setEventError("Choose an event type.");
    if (f.title.trim().length < 3) return setEventError("Event title must be at least 3 characters.");
    if (!f.location.trim()) return setEventError("Please add the venue / location.");
    if (!f.date) return setEventError("Choose a date.");
    if (f.date < today) return setEventError("Date can't be in the past.");
    if (!f.time) return setEventError("Choose a start time.");
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)
      return setEventError("Spots must be a whole number between 1 and 10,000.");
    if (!Number.isFinite(price) || price < 0) return setEventError("Price can't be negative.");

    setCreatingEvent(true);
    try {
      const created = await api.createEvent({
        communityId: f.communityId,
        title: f.title.trim(),
        category: f.category.trim() || undefined,
        location: f.location.trim(),
        date: f.date,
        time: to12h(f.time),
        capacity,
        price,
        imageDataUrl: eventImage ?? undefined,
      });
      const newId = typeof created === "string" ? created : (created as { id?: string } | null | undefined)?.id;
      if (newId && (eventInclusions.length || eventPhotos.length)) {
        try {
          const urls = await Promise.all(eventPhotos.map((src) => api.uploadEventPhoto(src)));
          await api.setEventExtras(newId, eventInclusions, urls);
        } catch (err: any) {
          toast(err?.message || "Event created, but the inclusions and photos couldn't be saved");
        }
      }
      await refreshAll();
      setEventInclusions([]); setEventPhotos([]); setInclusionDraft("");
      setEventOpen(false);
      setEventError("");
      setEventImage(null);
      setActiveTab("events");
      toast(`"${f.title.trim()}" created 🎉`);
    } catch (err: any) {
      setEventError(err?.message || "Couldn't create the event. Try again.");
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleCreateCommunity = async (e: FormEvent) => {
    e.preventDefault();
    if (!requireLogin()) return;
    if (form.name.trim().length < 3) return setFormError("Community name must be at least 3 characters.");
    if (form.purpose.trim().length < 10) return setFormError("Please describe the purpose (at least 10 characters).");
    if (!slugify(form.name)) return setFormError("Name needs at least one letter or number.");
    if (communities.some((c) => slugify(c.name) === slugify(form.name)))
      return setFormError("A community with this name already exists.");

    const style = TYPE_STYLES[form.type];
    const isPrivate = form.isPrivate || form.type === "Private Planning Group";
    try {
      const created = await api.createCommunity({
        name: form.name.trim(),
        type: form.type,
        city: form.city.trim(),
        purpose: form.purpose.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5),
        icon: isPrivate ? "🔒" : style.icon,
        isPrivate,
        coverDataUrl: bannerPreview,
        avatarDataUrl: avatarPreview,
      });
      setCommunities((cs) => [decorateCommunity(created), ...cs]);
      setMembership((m) => ({ ...m, [created.id]: "joined" }));
      setForm(emptyForm);
      setBannerPreview(null);
      setAvatarPreview(null);
      setFormError("");
      setCreateOpen(false);
      setActiveTab("communities");
      setSearch("");
      setTypeFilter("All");
      toast(`"${created.name}" created 🎉`);
    } catch (err: any) {
      setFormError(err?.message || "Couldn't create the community. Try again.");
    }
  };

  /* --------------------------------- Events ------------------------------- */

  const openBooking = async (ev: EventItem) => {
    if (!requireLogin() || ev.myBooking) return;
    if (ev.filled >= ev.capacity) {
      const on = !ev.onWaitlist;
      try {
        await api.setWaitlist(ev.id, on);
        setEvents((es) => es.map((e) => (e.id === ev.id ? { ...e, onWaitlist: on } : e)));
        toast(on ? "You're on the waitlist — we'll notify you if a spot opens" : "Removed from waitlist");
      } catch (err: any) {
        toast(err?.message || "Something went wrong");
      }
      return;
    }
    setBookingEventId(ev.id);
  };

  const openEventChat = async (ev: EventItem) => {
    const c = communities.find((x) => x.name === ev.community);
    if (!c) return;

    // Join public communities so the user can post as soon as the feed opens.
    if (!membership[c.id] && !c.isPrivate && !isMine(c)) {
      try {
        const st = await api.joinCommunity(c);
        setMembership((m) => ({ ...m, [c.id]: st }));
        if (st === "joined") adjustMembers(c.id, 1);
      } catch {
        // The feed still opens and shows the community's Join button.
      }
    }

    setFeedFilter("all");
    setComposerCommunity(c.name);
    setComposerEvent(ev.title);
    goTab("feed", c);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmBooking = async (seatCount: number, quote: QuoteInfo) => {
    if (!bookingEvent) return;
    const ev = bookingEvent;
    try {
      await api.bookEventApi(ev.id, seatCount);
      saveQuote(ev.id, quote);
      api.recordBookingQuote(ev.id, quote, ev.date).catch(() =>
        toast("Booked, but the escrow schedule couldn't be saved. Please contact support.")
      );
      setEvents((es) =>
        es.map((e) =>
          e.id === ev.id ? { ...e, filled: e.filled + seatCount, myBooking: seatCount, onWaitlist: false } : e
        )
      );
      toast(
        quote.total === 0
          ? `Registered for ${ev.title}`
          : `Booked ${seatCount} seat${seatCount > 1 ? "s" : ""} · ${inr(quote.total)} locked in escrow`
      );
      setBookingEventId(null);
    } catch (err: any) {
      toast(err?.message || "Booking failed");
      refreshAll();
    }
  };

  const cancelBooking = async (ev: EventItem) => {
    if (!ev.myBooking) return;
    const n = ev.myBooking;
    try {
      await api.cancelBookingApi(ev.id);
      setEvents((es) =>
        es.map((e) => (e.id === ev.id ? { ...e, filled: Math.max(0, e.filled - n), myBooking: undefined } : e))
      );
      toast("Booking cancelled");
    } catch (err: any) {
      toast(err?.message || "Couldn't cancel");
    }
  };

  /* ---------------------------------- Feed -------------------------------- */

  const adjustPosts = (id: string, delta: number) =>
    setCommunities((cs) => cs.map((c) => (c.id === id ? { ...c, posts: Math.max(0, c.posts + delta) } : c)));

  const toggleLike = async (id: string) => {
    if (!requireLogin()) return;
    const p = posts.find((x) => x.id === id);
    if (!p) return;
    const like = !p.liked;
    setPosts((ps) => ps.map((x) => (x.id === id ? { ...x, liked: like, likes: x.likes + (like ? 1 : -1) } : x)));
    try {
      await api.setLike(id, like);
    } catch (e: any) {
      setPosts((ps) => ps.map((x) => (x.id === id ? { ...x, liked: !like, likes: x.likes + (like ? -1 : 1) } : x)));
      toast(e?.message || "Couldn't update like");
    }
  };

  const addComment = async (id: string) => {
    if (!requireLogin()) return;
    const text = (commentDrafts[id] || "").trim();
    if (!text) return;
    try {
      const c = await api.addCommentApi(id, text);
      setPosts((ps) =>
        ps.map((p) => (p.id === id ? { ...p, comments: [...p.comments, c], commentCount: p.commentCount + 1 } : p))
      );
      setCommentDrafts((d) => ({ ...d, [id]: "" }));
    } catch (e: any) {
      toast(e?.message || "Couldn't post comment");
    }
  };

  const votePoll = async (postId: string, idx: number) => {
    if (!requireLogin()) return;
    const p = posts.find((x) => x.id === postId);
    if (!p?.poll || p.poll.voted !== undefined) return;
    try {
      await api.votePollApi(postId, idx);
      setPosts((ps) =>
        ps.map((x) =>
          x.id === postId && x.poll
            ? {
                ...x,
                poll: {
                  voted: idx,
                  options: x.poll.options.map((o, i) => (i === idx ? { ...o, votes: o.votes + 1 } : o)),
                },
              }
            : x
        )
      );
    } catch (e: any) {
      toast(e?.message || "Couldn't record vote");
    }
  };

  const addCustomEvent = () => {
    const title = customEventText.trim();
    if (!title) return;
    setComposerEvent(title);
    setCustomEventText("");
    setCustomEventOpen(false);
    setShowEventPicker(false);
  };

  const closeCustomEvent = () => {
    setCustomEventOpen(false);
    setCustomEventText("");
  };

  const MAX_IMAGE_MB = 8;
  const MAX_VIDEO_MB = 20;
  const MAX_VIDEO_SECONDS = 60;

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const isVideo = f.type.startsWith("video/");
    const isImage = f.type.startsWith("image/");
    if (!isImage && !isVideo) return toast("Please choose an image or video");
    if (f.size > (isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB) * 1024 * 1024)
      return toast(`File too large (max ${isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB} MB)`);

    const url = URL.createObjectURL(f);
    if (isVideo) {
      try {
        const d = await getVideoDuration(url);
        if (d > MAX_VIDEO_SECONDS) {
          URL.revokeObjectURL(url);
          return toast(`Video too long (max ${MAX_VIDEO_SECONDS} seconds)`);
        }
      } catch {
        URL.revokeObjectURL(url);
        return toast("Couldn't read that video");
      }
    }
    if (composerMedia) URL.revokeObjectURL(composerMedia.url);
    setComposerMedia({ url, type: isVideo ? "video" : "image", file: f });
  };

  const removeMedia = () => {
    if (composerMedia) URL.revokeObjectURL(composerMedia.url);
    setComposerMedia(null);
  };

const resetComposer = (keepMedia = false) => {
  setComposerText("");
  setReplyTo(null);
  setComposerEvent("");
  setComposerLocation("");
  setCustomEventOpen(false);
  setCustomEventText("");
  setShowEventPicker(false);
  setShowLocation(false);
  setPollOpen(false);
  setPollOptions(["", ""]);
  if (!keepMedia) removeMedia();
  else setComposerMedia(null);
};

const publishPost = async (channel: Channel) => {
  if (!requireLogin()) return;
  const body = composerText.trim();
  const quote = replyTo
    ? `[[reply:${replyTo.author.replace(/[\[\]|\n]/g, " ")}|${replyTo.text.replace(/[\[\]|#\n]/g, " ").slice(0, 80)}]]\n`
    : "";
  const text = quote && (body || composerMedia) ? quote + body : body;
  const target = feedCommunity ?? communities.find((c) => c.name === composerCommunity) ?? null;
  const pollItems = pollOpen ? pollOptions.map((o) => o.trim()).filter(Boolean) : [];

  if (pollOpen && pollItems.length < 2) return toast("Add at least 2 poll options");
  if (!body && !composerMedia && pollItems.length === 0)
    return toast("Write something or add a photo, video or poll first");
  if (!target) return toast("Join a community to post");

  setPosting(true);
  try {
    const tags = Array.from(new Set((text.match(/#(\w+)/g) || []).map((t) => t.slice(1)))).slice(0, 5);
    const post = await api.createPost({
      communityId: target.id,
      content: `[[ch:${channel}]]` + text.replace(/#(\w+)/g, "$1"),
      tags,
      event: composerEvent || undefined,
      location: composerLocation.trim() || undefined,
      pollOptions: pollItems,
      media: composerMedia ? { file: composerMedia.file, type: composerMedia.type } : null,
    });
    setPosts((ps) => [post, ...ps]);
    adjustPosts(target.id, 1);
    resetComposer();
    toast("Posted to " + target.name);
  } catch (e: any) {
    toast(e?.message || "Couldn't publish your post");
  } finally {
    setPosting(false);
  }
};

  const sharePost = async (p: Post) => {
    const text = `${p.author} in ${p.community}: ${splitReply(p.content).text}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("Post copied to clipboard");
    } catch {
      toast("Couldn't copy — please copy manually");
    }
  };

  const openShare = (p: Post) => {
    const origin = communities.find((c) => c.name === (p.shared?.community ?? p.community));
    if (origin?.isPrivate) return toast("Posts from private communities can't be shared");
    setShareTarget(p);
    setShareNote("");
    setShareDest([]);
  };

  const confirmShare = () => {
    if (!shareTarget || shareDest.length === 0) return;
    const src = shareTarget;
    const snapshot: SharedPost = src.shared ?? {
      author: src.author,
      avatar: src.avatar,
      gradient: src.gradient ?? gradientFor(src.author),
      community: src.community,
      time: src.time,
      content: splitReply(src.content).text,
      media: src.media ? { path: src.media.path, type: src.media.type } : undefined,
      hasPoll: !!src.poll,
    };
    const note = shareNote.trim();
    const stamp = Date.now();
    const newPosts: Post[] = shareDest.map((dest, i) => ({
      id: `local-share-${stamp}-${i}`,
      author: String(user?.user_metadata?.full_name ?? user?.email ?? "You"),
      avatar: myInitials,
      gradient: "linear-gradient(135deg,#8B1E3F,#c2416a)",
      community: dest,
      time: "Just now",
      content: note,
      likes: 0,
      liked: false,
      comments: [],
      commentCount: 0,
      tags: [],
      shared: snapshot,
      shares: 0,
    } as unknown as Post));

    const updatedPosts = [
      ...newPosts,
      ...posts.map((post) => post.id === src.id
        ? { ...post, shares: (post.shares ?? 0) + shareDest.length }
        : post),
    ];
    const allLocalShares = [
      ...readCommunityShares().filter((post) => !newPosts.some((added) => added.id === post.id)),
      ...newPosts,
    ];
    saveCommunityShares(allLocalShares);
    setPosts(updatedPosts);
    setCommunities((cs) => cs.map((c) =>
      shareDest.includes(c.name) ? { ...c, posts: c.posts + 1 } : c
    ));
    setShareTarget(null);
    toast(shareDest.length === 1 ? `Shared to ${shareDest[0]}` : `Shared to ${shareDest.length} communities`);
  };

  /* --------------------------------- Render -------------------------------- */

  const meetupCard = nextEvent && (
    <div className="w-full rounded-2xl bg-white/90 backdrop-blur-sm p-3.5 shadow-[0_10px_28px_-10px_rgba(139,30,63,0.35)] ring-1 ring-[#EADFD6]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F]">Next offline meetup</p>
      <h4 className="font-bold text-[13px] leading-snug text-[#1A1818] mt-1 line-clamp-2">{nextEvent.title}</h4>
      <p className="text-[11px] text-[#3D3735] mt-2 flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-[#8B1E3F] shrink-0" /> {dateFull(nextEvent.date)}
      </p>
      <p className="text-[11px] text-[#3D3735] mt-1 flex items-center gap-1.5 min-w-0">
        <MapPin className="w-3 h-3 text-[#8B1E3F] shrink-0" />
        <span className="truncate">{nextEvent.location}</span>
      </p>
      <button
        onClick={() => openBooking(nextEvent)}
        className="w-full mt-3 h-8 rounded-lg border-[1.5px] border-[#D4AF37] text-[#8B1E3F] font-bold text-xs hover:bg-[#FFF6E0] transition-colors"
      >
        RSVP Now
      </button>
      <div className="flex items-center gap-1.5 mt-2.5">
        <Facepile seed={nextEvent.id} total={nextEvent.filled} max={3} size={20} />
        <span className="text-[11px] font-medium">+{nextEvent.filled} attending</span>
      </div>
    </div>
  );

  const wideTab = !!feedCommunity && (feedTab === "events" || feedTab === "wallet");

  return (
    <div className={`min-h-screen text-[#1A1818] ${feedCommunity ? "relative bg-gradient-to-b from-[#FBEDE4] to-[#FAF8F5]" : "bg-[#FAF8F5]"}`}>
      <Navbar />

      <main className="cm-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          .cm-root { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
          .cm-serif { font-family: 'Playfair Display', Georgia, serif; }
          @keyframes cm-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(139,30,63,.45); } 50% { box-shadow: 0 0 0 9px rgba(139,30,63,0); } }
          .cm-pulse { animation: cm-pulse 1.8s ease-in-out infinite; }
        `}</style>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={onPickFile} />

        {!feedCommunity && (
          <>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-14 xl:min-h-[540px] bg-gradient-to-r from-[#F8D9CE] via-[#FBE9DC] to-[#FCF3E6]">
          {/* Arch artwork: sized by height, so it never zooms. Card sits in the gate. */}
          <div
            className="hidden xl:block absolute right-0 top-0 h-full pointer-events-none select-none"
            style={{ aspectRatio: "1024 / 434" }}
          >
            <img
              src="/community-hero.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full"
              style={{
                WebkitMaskImage: "linear-gradient(to right, transparent, #000 22%)",
                maskImage: "linear-gradient(to right, transparent, #000 22%)",
              }}
            />
            {nextEvent && (
              <div
                className="pointer-events-auto absolute w-[21%]"
                style={{ left: "75.2%", bottom: "4%", transform: "translateX(-50%)" }}
              >
                {meetupCard}
              </div>
            )}
          </div>

          <div className="relative container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-1 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[#8B1E3F] text-xs font-bold uppercase tracking-[0.22em] mb-4">
                From Venue Scouting to Stage Lights
              </p>
              <h1 className="cm-serif text-4xl md:text-6xl font-bold leading-[1.1] mb-5 text-[#1A1818]">
                Join India's <span className="text-[#8B1E3F] italic">Event Community</span>
              </h1>
              <p className="text-[#4A4442] text-lg max-w-xl mb-3 leading-relaxed">
                Connect with event professionals and enthusiasts across city communities. Attend events, share knowledge, build your network.
              </p>
              <p className="text-sm text-[#5E5754] mb-6">
                Join <b className="text-[#8B1E3F]">{memberLabel}</b> professionals across{" "}
                <b className="text-[#1A1818]">{communities.length}</b> active communities and{" "}
                <b className="text-[#1A1818]">{events.length}</b> upcoming offline meetups.
              </p>

              <div className="flex gap-3 flex-wrap mb-7">
                {activeTab === "events" ? (
                  <>
                    <Btn onClick={handleCreateEvent}>
                      <Plus className="w-4 h-4" /> Create Event
                    </Btn>
                    <Btn variant="outline" onClick={handleBrowseEvents}>
                      Browse All Events
                    </Btn>
                  </>
                ) : (
                  <>
                    <Btn onClick={() => setCreateOpen(true)}>
                      <Plus className="w-4 h-4" /> Create Community
                    </Btn>
                    <Btn variant="outline" onClick={handleBrowseAll}>
                      Browse All Communities
                    </Btn>
                  </>
                )}
              </div>

              {/* Search card */}
              <div className="flex items-center gap-2 bg-white rounded-2xl p-2 pl-4 max-w-2xl shadow-[0_10px_28px_-8px_rgba(139,30,63,0.18)] ring-1 ring-black/[0.04]">
                <Search className="w-4 h-4 text-[#8A827E] shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeTab === "events" ? "Search events, venues, organizers…" : "Search communities, cities, tags…"}
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-[#8A827E]"
                />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="hidden sm:block border-l border-[#E9E1D5] bg-transparent text-sm px-3 py-2 outline-none"
                >
                  <option value="">Select City</option>
                  {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Btn
                  size="sm"
                  className="!h-10 !px-6 !rounded-xl"
                  onClick={() => {
                    setActiveTab("communities");
                    window.setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                >
                  Search
                </Btn>
              </div>
            </motion.div>

            {/* Below xl the artwork is hidden, so show the card normally */}
            <div className="xl:hidden w-full max-w-sm lg:justify-self-end">
              {meetupCard}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex gap-1 bg-white rounded-full p-1.5 max-w-md mx-auto shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)]">
            {(["communities", "events", "feed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all capitalize ${
                  activeTab === tab ? "bg-[#8B1E3F] text-white shadow" : "text-[#5E5754] hover:text-[#1A1818]"
                }`}
              >
                {tab}
                {tab === "feed" && totalUnread > 0 && (
                  <span className={`ml-1.5 inline-block min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-[18px] align-middle ${activeTab === "feed" ? "bg-white text-[#8B1E3F]" : "bg-[#8B1E3F] text-white"}`}>
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
          </>
        )}

        <div
          className={feedCommunity ? "max-w-none px-0 pt-28 pb-16" : `container mx-auto px-4 ${activeTab === "feed" ? "pb-16" : "pb-24"}`}
          ref={listRef}
        >
          <AnimatePresence mode="wait">
            {/* ------------------------- Communities ------------------------- */}
            {activeTab === "communities" && (
              <motion.div key="communities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="max-w-none mx-auto mb-8 space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                    {["All", "My Communities", "Joined", ...COMMUNITY_TYPES].map((t) => (
                      <button key={t} onClick={() => setTypeFilter(t)} className={pill(typeFilter === t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredCommunities.length === 0 ? (
                  <div className="text-center py-16 text-[#5E5754]">
                    <p className="mb-4">
                      {loading
                        ? "Loading communities…"
                        : communities.length === 0
                        ? "No communities yet. Be the first to create one!"
                        : "No communities match your search."}
                    </p>
                    <Btn variant="outline" onClick={() => { setSearch(""); setCityFilter(""); setTypeFilter("All"); }}>
                      Clear filters
                    </Btn>
                  </div>
                ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredCommunities.map((c, i) => (
    <motion.article
      key={c.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      onClick={() => openCommunity(c)}
      className={`flex flex-col h-full bg-white rounded-2xl overflow-hidden cursor-pointer ${cardHover} ${cardShadow}`}
    >
      <Cover src={c.cover} bg={c.banner} className="h-[120px] shrink-0">
        <div className="absolute top-3 left-3">
          {isMine(c) ? (
            <span className="bg-[#8B1E3F] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">My Community</span>
          ) : c.featured === "large" ? (
            <span className="bg-[#D4AF37] text-[#1A1818] text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
          ) : c.featured === "trending" ? (
            <span className="bg-[#D4AF37] text-[#1A1818] text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Trending
            </span>
          ) : null}
        </div>
        <span
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#1A1818]"
          title={c.isPrivate ? "Private" : "Public"}
        >
          {c.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
        </span>
      </Cover>

      <div className="relative px-5 pb-5 flex-1 flex flex-col">
        <h3 className="mt-4 font-bold text-base text-[#1A1818] flex items-center gap-1.5 min-w-0">
          <span className="truncate">{c.name}</span>
          {c.isVerified && <CheckCircle2 className="w-4 h-4 text-[#8B1E3F] shrink-0" aria-label="Verified" />}
        </h3>

        <div className="mt-2 flex items-center gap-2 min-w-0">
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1A1818] bg-[#F5EFE6] px-2.5 py-1 rounded-full">
            <MapPin className="w-3 h-3 text-[#8B1E3F]" /> {c.city}
          </span>
          <span className="text-xs text-[#5E5754] truncate">{c.type}</span>
        </div>

        <p className="text-sm text-[#5E5754] mt-2 line-clamp-1">{c.purpose}</p>

        <div className="mt-3 flex items-center justify-between">
          <Facepile seed={c.id} total={Math.min(c.members, 3)} max={3} size={26} />
          <span className="text-xs font-semibold text-[#1A1818]">{compact(c.members)} members</span>
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          <Btn
            size="sm"
            variant={membershipVariant(c)}
            onClick={(e) => { e.stopPropagation(); handleMembership(c); }}
            className="flex-1"
          >
            {membershipLabel(c)}
          </Btn>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); shareCommunity(c); }}
            aria-label={`Share ${c.name}`}
            title="Copy invite link"
            className="shrink-0 w-8 h-8 rounded-full border border-[#1A1818]/20 bg-white text-[#1A1818] flex items-center justify-center hover:border-[#1A1818]/50 hover:bg-[#F5EFE6] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  ))}
</div>
                )}
              </motion.div>
            )}

            {/* ---------------------------- Events ---------------------------- */}
            {activeTab === "events" && (
              <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-none mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-[#F5EFE6] rounded-2xl px-5 py-4 mb-8">
                  <EscrowBadge label="Verified Protection" />
                  <p className="text-sm text-[#3D3735] text-center sm:text-left">
                    Every paid booking is held in escrow before the event and released to the organizer in phases afterwards.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.length === 0 && (
                    <p className="col-span-full text-center text-sm text-[#5E5754] py-10">
                      {loading ? "Loading events…" : "No upcoming events yet."}
                    </p>
                  )}
                  {filteredEvents.map((ev, i) => {
                    const full = ev.filled >= ev.capacity;
                    const remaining = ev.capacity - ev.filled;
                    const booked = ev.myBooking;
                    return (
                      <motion.article
                        key={ev.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { if (booked) void openEventChat(ev); }}
                        className={`flex flex-col h-full bg-white rounded-2xl overflow-hidden ${cardShadow} ${cardHover} ${booked ? "cursor-pointer" : ""}`}
                      >
                        <Cover src={ev.image} bg={ev.banner} className="h-[120px] shrink-0">
                          <div className="absolute top-3 left-3 bg-white rounded-xl px-2.5 py-2 text-center shadow-md min-w-[48px]">
                            <p className="text-[10px] font-bold tracking-wider text-[#8B1E3F] leading-none">{monthShort(ev.date)}</p>
                            <p className="text-xl font-extrabold text-[#1A1818] leading-none mt-1">{dayNum(ev.date)}</p>
                          </div>
                          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 text-[11px] font-bold text-[#1A1818]">
                            {full ? "Sold out" : remaining <= 10 ? `${remaining} spots left` : `${ev.capacity} spots`}
                          </span>
                        </Cover>

                        <div className="relative px-5 pb-5 flex-1 flex flex-col">
                          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#8B1E3F] line-clamp-1">{ev.community}</p>
                          <h3 className="mt-1 cm-serif font-bold text-base leading-snug text-[#1A1818] line-clamp-2">{ev.title}</h3>
                          <p className="text-sm text-[#5E5754] mt-1">by {ev.organizer}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 min-w-0">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1818] bg-[#F5EFE6] px-2.5 py-1 rounded-full">
                              <MapPin className="w-3 h-3 text-[#8B1E3F]" /> {ev.location}
                            </span>
                            <span className="text-xs text-[#5E5754]">{dateFull(ev.date)} · {ev.time}</span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Facepile seed={ev.id} total={ev.filled} max={3} size={26} />
                              <span className="text-xs text-[#5E5754]"><b className="text-[#1A1818]">+{ev.filled}</b> attending</span>
                            </div>
                            <span className="text-xs font-semibold text-[#1A1818] shrink-0">{ev.filled}/{ev.capacity}</span>
                          </div>
                          <div className="w-full bg-[#F5EFE6] rounded-full h-1.5 mt-2">
                            <div
                              className={`h-1.5 rounded-full transition-all ${full ? "bg-[#1A1818]" : "bg-[#8B1E3F]"}`}
                              style={{ width: `${Math.min(100, (ev.filled / ev.capacity) * 100)}%` }}
                            />
                          </div>

                          <div className="mt-auto pt-4 flex items-center gap-2">
                            <div className="min-w-0 flex-1">
                              {ev.price === 0 ? (
                                <span className="text-lg font-extrabold text-[#1F6B45]">Free</span>
                              ) : (
                                <span className="whitespace-nowrap"><b className="text-lg font-extrabold text-[#8B1E3F]">₹{ev.price.toLocaleString("en-IN")}</b><span className="text-xs text-[#5E5754]"> /person</span></span>
                              )}
                            </div>
                            {booked ? (
                              <>
                                <span className="text-xs font-semibold text-[#1F6B45] inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {booked} seat{booked > 1 ? "s" : ""}</span>
                                <Btn size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); void cancelBooking(ev); }}>Cancel</Btn>
                              </>
                            ) : full ? (
                              <Btn size="sm" variant={ev.onWaitlist ? "ghost" : "outline"} onClick={(e) => { e.stopPropagation(); void openBooking(ev); }}>
                                {ev.onWaitlist ? "On waitlist ✓" : "Join Waitlist"}
                              </Btn>
                            ) : (
                              <Btn size="sm" onClick={(e) => { e.stopPropagation(); void openBooking(ev); }}>
                                {ev.price === 0 ? "Register Free" : "Book Now"}
                              </Btn>
                            )}
                          </div>
                          {booked && <p className="mt-1 text-[11px] text-[#5E5754]">Tap the card to open the event chat</p>}
                          {ev.price > 0 && <div className="mt-2"><EscrowBadge /></div>}
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ----------------------------- Feed ----------------------------- */}
            {activeTab === "feed" && (
              <motion.div
  key="feed"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className={feedCommunity
    ? "relative isolate max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_300px] gap-5"
    : "max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6"}
>
  {feedCommunity && <img src="/mandala-bg.svg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-[0.07]" />}
  {/* ---------- Left sidebar ---------- */}
  <aside className={`relative z-10 hidden ${feedCommunity ? "lg:block" : "lg:block lg:col-span-1"} lg:sticky lg:top-28 self-start space-y-4`}>
    <div className={`bg-white rounded-2xl p-4 ${cardShadow}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F] mb-3">My Communities</h3>
      <button
        onClick={() => setFeedCommunityId(null)}
        className={`w-full text-left text-sm font-semibold px-2 py-2 rounded-xl hover:bg-[#F5EFE6] ${!feedCommunity ? "bg-[#F5EFE6]" : ""}`}
      >
        All posts
      </button>
      {joinedCommunities.length === 0 ? (
        <p className="text-xs text-[#5E5754] px-2 py-2">You haven't joined any community yet.</p>
      ) : (
        joinedCommunities.map((c) => (
          <button
            key={c.id}
            onClick={() => openCommunity(c)}
            className={`flex items-center gap-2 w-full px-2 py-2 rounded-xl text-left text-sm hover:bg-[#F5EFE6] ${feedCommunity?.id === c.id ? "bg-[#F5EFE6]" : ""}`}
          >
            <LogoAvatar src={c.avatar} icon={c.icon} className="w-8 h-8 text-base" />
            <span className="truncate font-semibold">{c.name}</span>
            <UnreadBadge inline count={unread[c.id] ?? 0} />
          </button>
        ))
      )}
      <button onClick={() => setActiveTab("communities")} className="w-full text-left text-sm font-semibold px-2 py-2 rounded-xl text-[#8B1E3F] hover:bg-[#F5EFE6]">+ Add new</button>
    </div>

    <div className={`bg-white rounded-2xl p-4 space-y-1 ${cardShadow}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F] mb-2">Quick links</h3>
      {[
        { label: "Browse communities", onClick: () => setActiveTab("communities") },
        { label: "Upcoming events", onClick: () => setActiveTab("events") },
        { label: "Create a community", onClick: () => setCreateOpen(true) },
      ].map((l) => (
        <button key={l.label} onClick={l.onClick} className="w-full text-left text-sm text-[#3D3735] px-2 py-1.5 rounded-lg hover:bg-[#F5EFE6]">
          {l.label}
        </button>
      ))}
    </div>
  </aside>

  {/* ---------- Center column ---------- */}
  <div className={`relative z-10 ${feedCommunity ? (wideTab ? "xl:col-span-2" : "") : "lg:col-span-2"} space-y-5 min-w-0`}>
    {feedCommunity && (
      <div className={`bg-white rounded-2xl overflow-hidden ${cardShadow}`}>
        <Cover src={feedCommunity.cover} bg={feedCommunity.banner} className="h-24">
          <button
            onClick={() => setActiveTab("communities")}
            className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#1A1818] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white"
          >
            ← Communities
          </button>
        </Cover>
        <div className="relative px-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <LogoAvatar src={feedCommunity.avatar} icon={feedCommunity.icon} className="relative z-10 -mt-7 w-14 h-14 text-3xl" />
            <div className="flex gap-2 pt-2">
              <Btn size="sm" variant="outline" onClick={() => shareCommunity(feedCommunity)}>
                <Share2 className="w-3.5 h-3.5" /> Share
              </Btn>
              <Btn size="sm" variant="outline" onClick={() => setDetailId(feedCommunity.id)}>About</Btn>
              <Btn size="sm" variant={membershipVariant(feedCommunity)} onClick={() => handleMembership(feedCommunity)}>
                {membershipLabel(feedCommunity)}
              </Btn>
            </div>
          </div>
          <h2 className="cm-serif text-lg font-bold mt-2 flex items-center gap-2 flex-wrap">
            {feedCommunity.name}
            {feedCommunity.isVerified && <CheckCircle2 className="w-4 h-4 text-[#8B1E3F]" />}
            {isMine(feedCommunity) && (
              <span className="text-[11px] font-bold bg-[#F5EFE6] text-[#8B1E3F] px-2.5 py-1 rounded-full">My Community</span>
            )}
          </h2>
          <p className="text-xs text-[#5E5754] mt-1">
            {compact(feedCommunity.members)} members · {feedCommunity.posts.toLocaleString("en-IN")} posts · {feedCommunity.city}
          </p>
        </div>
      </div>
    )}

    {feedCommunity && composerEvent && (
      <div className={`bg-[#E8F3EC] rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${cardShadow}`}>
        <p className="text-sm text-[#1F6B45]"><b>{composerEvent}</b>: you're registered. Say hi to the other attendees!</p>
        <button onClick={() => setComposerEvent("")} aria-label="Dismiss" className="text-[#1F6B45]">
          <X className="w-4 h-4" />
        </button>
      </div>
    )}

    {feedCommunity && searchParams.get("invite") && membership[feedCommunity.id] === undefined && (
      <div className={`bg-[#F5EFE6] rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${cardShadow}`}>
        <p className="text-sm text-[#3D3735]">
          You have been invited to join <b>{feedCommunity.name}</b>.
        </p>
        <Btn size="sm" onClick={() => handleMembership(feedCommunity)}>
          {feedCommunity.isPrivate ? "Request to join" : "Join now"}
        </Btn>
      </div>
    )}

    {feedCommunity && <div className="lg:hidden flex gap-2 overflow-x-auto [scrollbar-width:none]">
      {joinedCommunities.map((c) => <button key={c.id} onClick={() => openCommunity(c)} className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${feedCommunity.id === c.id ? "bg-[#8B1E3F] text-white" : "bg-white text-[#3D3735]"}`}><LogoAvatar src={c.avatar} icon={c.icon} className="w-6 h-6 text-xs" /><span>{c.name}</span><UnreadBadge inline count={unread[c.id] ?? 0} /></button>)}
    </div>}

    {feedCommunity && <div className="flex gap-1 bg-white rounded-full p-1.5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)]">
      {FEED_TABS.map(({ key, label, Icon }) => <button key={key} onClick={() => setFeedTab(key)} className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${feedTab === key ? "bg-[#8B1E3F] text-white shadow" : "text-[#3D3735] hover:bg-[#F5EFE6]"}`}><Icon className="w-3.5 h-3.5 shrink-0" /><span className="hidden md:inline truncate">{label}</span></button>)}
    </div>}

    {feedCommunity && feedTab === "chat" && (
      <WhatsAppChat
        community={feedCommunity}
        messages={chatMessages}
        isMember={membership[feedCommunity.id] === "joined"}
        joinLabel={membershipLabel(feedCommunity)}
        myName={myName}
        myId={user?.id}
        composerText={composerText}
        setComposerText={setComposerText}
        composerMedia={composerMedia}
        removeMedia={removeMedia}
        pickFile={() => fileRef.current?.click()}
        posting={posting}
        onSend={() => publishPost("chat")}
        pollOpen={pollOpen}
        setPollOpen={setPollOpen}
        pollOptions={pollOptions}
        setPollOptions={setPollOptions}
        composerEvent={composerEvent}
        setComposerEvent={setComposerEvent}
        composerLocation={composerLocation}
        setComposerLocation={setComposerLocation}
        events={communityEvents}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        pinnedIds={pinnedIds}
        onPin={(id) => setPinnedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])}
        onLike={toggleLike}
        onVote={votePoll}
        onForward={openShare}
        onBack={() => setActiveTab("communities")}
        onInfo={() => setDetailId(feedCommunity.id)}
        onInvite={() => shareCommunity(feedCommunity)}
        onJoin={() => handleMembership(feedCommunity)}
        toast={toast}
      />
    )}

    {feedCommunity && feedTab === "tasks" && (
      <TasksPanel
        key={feedCommunity.id}
        communityId={feedCommunity.id}
        events={communityEvents}
        me={myName || "You"}
        people={Array.from(new Set(
          [feedCommunity.admin, myName, ...posts.filter((p) => p.community === feedCommunity.name).map((p) => p.author)].filter(Boolean)
        ))}
        canEdit={membership[feedCommunity.id] === "joined"}
        isPrivate={feedCommunity.isPrivate}
        toast={toast}
      />
    )}

    {feedCommunity && feedTab === "events" && (
      <EventsPanel
        community={feedCommunity}
        events={communityEvents}
        onBook={openBooking}
        onCancel={cancelBooking}
        onChat={openEventChat}
        canCreate={membership[feedCommunity.id] === "joined"}
        onCreate={handleCreateEvent}
      />
    )}

    {feedCommunity && feedTab === "wallet" && (
      <EscrowPanel events={communityEvents} communityName={feedCommunity.name} toast={toast} />
    )}

    {(!feedCommunity || feedTab === "broadcast") && <>
    {/* Post composer card */}
    <div className={`bg-white rounded-2xl p-4 ${cardShadow}`}>
      {!canPost ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#3D3735]">
            {feedCommunity
              ? feedCommunity.isPrivate
                ? "Private community. Request access to post."
                : "Join this community to post, comment and get updates."
              : "Join a community to start posting."}
          </p>
          {feedCommunity ? (
            <Btn
              size="sm"
              variant={membershipVariant(feedCommunity)}
              className={membership[feedCommunity.id] ? "" : "cm-pulse"}
              onClick={() => handleMembership(feedCommunity)}
            >
              {membershipLabel(feedCommunity)}
            </Btn>
          ) : (
            <Btn size="sm" className="cm-pulse" onClick={() => setActiveTab("communities")}>Browse</Btn>
          )}
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: "linear-gradient(135deg,#8B1E3F,#c2416a)" }}
            >
              {myInitials}
            </span>
            <textarea
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (!posting) publishPost("bc");
                }
              }}
              rows={composerText || composerMedia || pollOpen ? 3 : 2}
              placeholder="Share an insight, vendor review, or event update…"
              className="flex-1 resize-none bg-[#FAF8F5] rounded-2xl px-4 py-2.5 text-sm text-[#1A1818] placeholder:text-[#8A827E] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/25"
            />
          </div>

          {composerMedia && (
            <div className="relative mt-3 ml-[52px] inline-block">
              {composerMedia.type === "image" ? (
                <img src={composerMedia.url} alt="Attachment preview" className="max-h-56 rounded-xl object-cover" />
              ) : (
                <video src={composerMedia.url} controls className="max-h-56 rounded-xl" />
              )}
              <button
                onClick={removeMedia}
                aria-label="Remove attachment"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1A1818]/75 text-white flex items-center justify-center hover:bg-[#1A1818]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {pollOpen && (
            <div className="mt-3 ml-[52px] space-y-2 rounded-xl border border-[#E9E1D5] p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#5E5754]">
                Poll options
                <button onClick={() => { setPollOpen(false); setPollOptions(["", ""]); }} aria-label="Remove poll">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {pollOptions.map((o, i) => (
                <input
                  key={i}
                  value={o}
                  maxLength={60}
                  onChange={(e) => setPollOptions((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Option ${i + 1}`}
                  className={inputCls}
                />
              ))}
              {pollOptions.length < 4 && (
                <button onClick={() => setPollOptions((p) => [...p, ""])} className="text-xs font-semibold text-[#8B1E3F]">
                  + Add option
                </button>
              )}
            </div>
          )}

          {(composerEvent || composerLocation.trim()) && (
            <div className="flex flex-wrap gap-2 mt-3 ml-[52px]">
              {composerEvent && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5EFE6] text-[#8B1E3F] px-3 py-1 rounded-full">
                  <Calendar className="w-3 h-3" /> {composerEvent}
                  <button onClick={() => setComposerEvent("")} aria-label="Remove event tag"><X className="w-3 h-3" /></button>
                </span>
              )}
              {composerLocation.trim() && !showLocation && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5EFE6] text-[#8B1E3F] px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> {composerLocation.trim()}
                  <button onClick={() => setComposerLocation("")} aria-label="Remove location"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {showEventPicker && (
            <div className="mt-3 ml-[52px]">
              {!customEventOpen ? (
                <select
                  value={composerEvent}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setCustomEventOpen(true);
                      return;
                    }
                    setComposerEvent(e.target.value);
                    setShowEventPicker(false);
                  }}
                  className={inputCls}
                >
                  <option value="">Select an event to tag…</option>
                  {events.map((ev) => <option key={ev.id} value={ev.title}>{ev.title}</option>)}
                  <option value="__custom__">＋ Add my own event…</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={customEventText}
                    maxLength={80}
                    onChange={(e) => setCustomEventText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addCustomEvent(); }
                      if (e.key === "Escape") closeCustomEvent();
                    }}
                    placeholder="Type your event name, e.g. Haldi Ceremony – Jaipur"
                    className={inputCls}
                  />
                  <Btn size="sm" onClick={addCustomEvent} disabled={!customEventText.trim()} className="!h-auto">Add</Btn>
                  <Btn size="sm" variant="ghost" onClick={closeCustomEvent} className="!h-auto">Back</Btn>
                </div>
              )}
            </div>
          )}

          {showLocation && (
            <div className="mt-3 ml-[52px]">
              <input
                autoFocus
                value={composerLocation}
                onChange={(e) => setComposerLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setShowLocation(false)}
                onBlur={() => setShowLocation(false)}
                placeholder="Add a location, e.g. Udaipur, Rajasthan"
                className={inputCls}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-[#F0E9DD]">
            <div className="flex items-center gap-1 flex-wrap">
              <Btn size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
                <ImageIcon className="w-4 h-4 text-[#8B1E3F]" /> Photo
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setPollOpen((v) => !v)}>
                <BarChart3 className="w-4 h-4 text-[#8B1E3F]" /> Poll
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => { setShowEventPicker((v) => !v); closeCustomEvent(); }}>
                <Tag className="w-4 h-4 text-[#8B1E3F]" /> Event
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setShowLocation(true)}>
                <MapPin className="w-4 h-4 text-[#8B1E3F]" /> Location
              </Btn>
            </div>

            <div className="flex items-center gap-2">
              {!feedCommunity && (
                <select
                  value={composerCommunity}
                  onChange={(e) => setComposerCommunity(e.target.value)}
                  className="text-xs font-semibold bg-white border border-[#E9E1D5] rounded-full px-3 py-2 text-[#1A1818] max-w-[170px] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/25"
                  aria-label="Post to community"
                >
                  {joinedCommunities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              )}
              <Btn size="sm" onClick={() => publishPost("bc")} disabled={posting}>
                <Send className="w-3.5 h-3.5" /> Post
              </Btn>
            </div>
          </div>
        </>
      )}
    </div>

    {!feedCommunity && (
      <div className="flex gap-2 justify-center lg:hidden">
        {([["all", "All posts"], ["mine", "My communities"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFeedFilter(k)} className={pill(feedFilter === k)}>{label}</button>
        ))}
      </div>
    )}

    {broadcastPosts.length === 0 && (
      <p className="text-center text-[#5E5754] text-sm py-10">
        {feedCommunity
          ? membership[feedCommunity.id] === "joined"
            ? "No posts yet. Write the first one!"
            : "No posts yet. Join to start the conversation."
          : "No posts yet from your communities. Join one or write the first post!"}
      </p>
    )}

                {broadcastPosts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl p-6 ${cardShadow}`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: post.gradient ?? gradientFor(post.author) }}
                      >
                        {post.avatar}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-[#1A1818]">
                          {post.author}
                          {post.shared && <span className="font-normal text-[#5E5754]"> shared a post</span>}
                        </p>
                        <p className="text-xs text-[#5E5754]">
                          <span className="font-semibold text-[#8B1E3F]">{post.community}</span> · {post.time}
                        </p>
                      </div>
                    </div>

                    {post.content && <p className="text-sm text-[#1A1818] leading-relaxed mb-4">{splitReply(post.content).text}</p>}

                    {post.shared && (
                      <div className="mb-4 rounded-xl border border-[#E9E1D5] bg-[#FAF8F5] p-4">
                        <div className="flex items-center gap-2.5 mb-2">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ background: post.shared.gradient }}
                          >
                            {post.shared.avatar}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{post.shared.author}</p>
                            <p className="text-[11px] text-[#5E5754] truncate">
                              <button
                                onClick={() => {
                                  const c = communities.find((x) => x.name === post.shared!.community);
                                  if (c) openCommunity(c);
                                }}
                                className="font-semibold text-[#8B1E3F] hover:underline"
                              >
                                {post.shared.community}
                              </button>{" "}· {post.shared.time}
                            </p>
                          </div>
                        </div>
                        {post.shared.content && (
                          <p className="text-sm text-[#1A1818] leading-relaxed mb-2">{post.shared.content}</p>
                        )}
                        {post.shared.media && <PostMediaView media={post.shared.media} />}
                        {post.shared.hasPoll && (
                          <p className="text-xs italic text-[#5E5754]">Includes a poll. Open the original to vote.</p>
                        )}
                      </div>
                    )}

                    {post.media && <PostMediaView media={post.media} />}
                    {post.poll && (
                      <PollView poll={post.poll} voted={post.poll.voted} onVote={(i) => votePoll(post.id, i)} />
                    )}

                    {(post.event || post.location) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.event && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5EFE6] text-[#8B1E3F] px-3 py-1 rounded-full">
                            <Calendar className="w-3 h-3" /> {post.event}
                          </span>
                        )}
                        {post.location && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5EFE6] text-[#3D3735] px-3 py-1 rounded-full">
                            <MapPin className="w-3 h-3 text-[#8B1E3F]" /> {post.location}
                          </span>
                        )}
                      </div>
                    )}

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => { setActiveTab("communities"); setSearch(tag); }}
                            className="text-xs font-medium text-[#5E5754] hover:text-[#8B1E3F] transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-5 text-sm text-[#5E5754] pt-3 border-t border-[#F0E9DD]">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${post.liked ? "text-[#8B1E3F]" : "hover:text-[#8B1E3F]"}`}
                      >
                        <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} /> {post.likes}
                      </button>
                      <button
                        onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${openComments[post.id] ? "text-[#8B1E3F]" : "hover:text-[#8B1E3F]"}`}
                      >
                        <MessageSquare className="w-4 h-4" /> {post.commentCount}
                      </button>
                      <button
                        onClick={() => openShare(post)}
                        className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[#1A1818] transition-colors"
                      >
                        <Share2 className="w-4 h-4" /> Share{post.shares ? ` · ${post.shares}` : ""}
                      </button>
                    </div>

                    <AnimatePresence>
                      {openComments[post.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-3">
                            {post.comments.length === 0 && <p className="text-xs text-[#5E5754]">Be the first to comment.</p>}
                            {post.comments.map((c, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-bold text-[#1A1818]">{c.author}</span>{" "}
                                <span className="text-[#4A4442]">{c.text}</span>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input
                                value={commentDrafts[post.id] || ""}
                                onChange={(e) => setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                                placeholder="Write a comment…"
                                className={inputCls}
                              />
                              <Btn size="sm" onClick={() => addComment(post.id)} disabled={!(commentDrafts[post.id] || "").trim()} aria-label="Send comment" className="!h-auto">
                                <Send className="w-3.5 h-3.5" />
                              </Btn>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                ))}
    </>}
  </div>

  {/* ---------- Right sidebar ---------- */}
  <aside className={`relative z-10 hidden ${feedCommunity ? (wideTab ? "" : "xl:block") : "lg:block lg:col-span-1"} lg:sticky lg:top-28 self-start space-y-4`}>
    {feedCommunity ? <>
      <div className={`bg-white rounded-2xl p-4 ${cardShadow}`}><h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F] mb-3 flex items-center gap-1.5"><Pin className="w-3.5 h-3.5" /> Pinned notices</h3><div className="space-y-2">{(pinnedPosts.length ? pinnedPosts : pinnedPost ? [pinnedPost] : []).map((post) => <div key={post.id} className="rounded-xl bg-[#FAF8F5] ring-1 ring-[#EADFD6] p-3"><span className="text-[10px] font-bold bg-[#F5EFE6] text-[#8B1E3F] px-2 py-0.5 rounded-full capitalize">{post.event ? "Event Update" : post.tags[0] ?? "Insight"}</span><p className="text-sm font-semibold mt-1.5 line-clamp-3">{splitReply(post.content || "").text || (post.poll ? "New poll" : "Shared an attachment")}</p></div>)}{pinnedPosts.length === 0 && !pinnedPost && <p className="text-sm text-[#1A1818] leading-relaxed line-clamp-5">{feedCommunity.purpose}</p>}</div></div>
      <div className={`bg-white rounded-2xl p-4 ${cardShadow}`}><h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F] mb-3 flex items-center gap-1.5"><Megaphone className="w-3.5 h-3.5" /> Broadcast posts</h3><div className="space-y-2.5">
        {broadcastPosts.slice(0, 2).map((p) => <div key={p.id} className="rounded-xl bg-[#FAF8F5] ring-1 ring-[#EADFD6] p-3"><button onClick={() => setFeedTab("broadcast")} className="block w-full text-left"><p className="text-[10px] font-bold bg-[#F5EFE6] text-[#8B1E3F] px-2 py-0.5 rounded-full capitalize w-fit">{p.event ? "Event Update" : p.tags[0] ?? "Insight"}</p><p className="text-sm font-semibold text-[#1A1818] line-clamp-2 mt-1.5">{splitReply(p.content || "").text || (p.poll ? "New poll" : "Shared an attachment")}</p></button><div className="flex gap-2 mt-2"><Btn size="sm" variant="outline" onClick={() => setPinnedIds((ids) => ids.includes(p.id) ? ids.filter((id) => id !== p.id) : [...ids, p.id])}><Pin className="w-3 h-3" />{pinnedIds.includes(p.id) ? "Pinned" : "Pin"}</Btn><Btn size="sm" onClick={() => openShare(p)}>Share</Btn></div></div>)}
        {communityEvents[0] && <button onClick={() => setFeedTab("events")} className="flex w-full items-start gap-3 text-left rounded-xl bg-[#FAF8F5] ring-1 ring-[#EADFD6] p-3 hover:bg-[#F5EFE6]"><span className="shrink-0 w-10 rounded-lg bg-[#F5EFE6] text-center py-1"><span className="block text-[9px] font-bold tracking-wider text-[#8B1E3F] leading-none">{monthShort(communityEvents[0].date)}</span><span className="block text-base font-extrabold leading-none mt-0.5">{dayNum(communityEvents[0].date)}</span></span><span className="min-w-0"><span className="block text-sm font-bold text-[#1A1818]">Event Update</span><span className="block text-xs text-[#5E5754] line-clamp-2">{communityEvents[0].title}</span></span></button>}
        {broadcastPosts.length === 0 && !communityEvents[0] && <p className="text-xs text-[#5E5754]">Nothing here yet.</p>}
      </div></div>
    </> : <>
    <div className={`bg-white rounded-2xl p-4 ${cardShadow}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F] mb-3 flex items-center gap-1.5">
        <Flame className="w-3.5 h-3.5" /> Trending discussions
      </h3>
      <div className="space-y-3">
        {trendingPosts.map((p) => {
          const c = communities.find((x) => x.name === p.community);
          return (
            <button
              key={p.id}
              onClick={() => c && openCommunity(c)}
              className="block w-full text-left rounded-xl p-2 -mx-2 hover:bg-[#F5EFE6]"
            >
              <p className="text-xs font-semibold text-[#8B1E3F] truncate">{p.community}</p>
              <p className="text-sm text-[#1A1818] line-clamp-2 mt-0.5">
                {splitReply(p.content || "").text || (p.shared ? "Shared a post" : p.poll ? "New poll" : "Shared an attachment")}
              </p>
              <p className="text-[11px] text-[#5E5754] mt-1">{p.likes} likes · {p.commentCount} comments</p>
            </button>
          );
        })}
      </div>
    </div>

    <div className={`bg-white rounded-2xl p-4 ${cardShadow}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F] mb-3 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" /> Upcoming events
      </h3>
      <div className="space-y-3">
        {upcomingEvents.map((ev) => (
          <button
            key={ev.id}
            onClick={() => setActiveTab("events")}
            className="flex items-start gap-3 w-full text-left rounded-xl p-2 -mx-2 hover:bg-[#F5EFE6]"
          >
            <span className="shrink-0 w-11 rounded-lg bg-[#F5EFE6] text-center py-1">
              <span className="block text-[9px] font-bold tracking-wider text-[#8B1E3F] leading-none">{monthShort(ev.date)}</span>
              <span className="block text-lg font-extrabold leading-none mt-0.5">{dayNum(ev.date)}</span>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#1A1818] line-clamp-2">{ev.title}</span>
              <span className="block text-[11px] text-[#5E5754] truncate mt-0.5">{ev.location}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
    </>}
  </aside>
</motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create community modal */}
        {/* Share to community modal */}
        <Modal open={!!shareTarget} onClose={() => setShareTarget(null)} title="Share to community">
          {shareTarget && (() => {
            const options = joinedCommunities.filter((c) => c.name !== shareTarget.community);
            const origin = shareTarget.shared ?? shareTarget;
            const preview = splitReply(origin.content || "").text || (shareTarget.poll ? "Poll" : "Attachment");
            return (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#FAF8F5] p-3 text-sm">
                  <p className="text-xs font-semibold text-[#8B1E3F] mb-1">
                    {origin.author} · {origin.community}
                  </p>
                  <p className="line-clamp-3 text-[#3D3735]">{preview}</p>
                </div>

                <textarea
                  value={shareNote}
                  onChange={(e) => setShareNote(e.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder="Add a message (optional)"
                  className={`${inputCls} resize-none`}
                />

                {options.length === 0 ? (
                  <p className="text-sm text-[#5E5754]">Join another community to share this post there.</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {options.map((c) => (
                      <label key={c.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#F5EFE6] cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-[#8B1E3F]"
                          checked={shareDest.includes(c.name)}
                          onChange={() => setShareDest((d) =>
                            d.includes(c.name) ? d.filter((x) => x !== c.name) : [...d, c.name]
                          )}
                        />
                        <LogoAvatar src={c.avatar} icon={c.icon} className="w-8 h-8 text-base" />
                        <span className="text-sm font-semibold truncate">{c.name}</span>
                        {c.isPrivate && <Lock className="w-3.5 h-3.5 text-[#5E5754] shrink-0" />}
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Btn variant="ghost" size="sm" onClick={() => sharePost(shareTarget)}>Copy text</Btn>
                  <div className="flex gap-2">
                    <Btn variant="ghost" onClick={() => setShareTarget(null)}>Cancel</Btn>
                    <Btn onClick={confirmShare} disabled={shareDest.length === 0}>
                      Share{shareDest.length > 1 ? ` to ${shareDest.length}` : ""}
                    </Btn>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>

        <Modal open={createOpen} onClose={() => { setCreateOpen(false); setFormError(""); discardImages(); }} title="Create a Community">
          <form onSubmit={handleCreateCommunity} className="space-y-4">
            <div>
              {/* Banner upload */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => bannerInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && bannerInputRef.current?.click()}
                className={`relative h-32 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-[#D98AA5] bg-[#FFF7FA] hover:bg-[#FFF0F5] transition-colors ${bannerPreview ? "border-solid" : ""}`}
                aria-label="Upload community banner"
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#A52A55]">
                    <Plus className="w-7 h-7" strokeWidth={2.2} />
                    <span className="text-xs font-semibold">Upload banner</span>
                  </div>
                )}
                {bannerPreview && (
                  <button
                    type="button"
                    aria-label="Remove banner"
                    onClick={(e) => { e.stopPropagation(); setBannerPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1A1818]/75 text-white flex items-center justify-center hover:bg-[#1A1818]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e, "banner")} />

              {/* Profile picture upload */}
              <div className="-mt-8 ml-4 flex items-end gap-3">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label="Upload profile picture"
                  className={`relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-2 border-dashed border-[#D98AA5] bg-[#FFF0F5] text-[#A52A55] shadow-md ${avatarPreview ? "border-solid bg-white" : "hover:bg-[#FFE5EE]"}`}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-6 h-6" strokeWidth={2.2} />
                  )}
                </button>
                <div className="pb-0 text-xs text-[#5E5754]">
                  <p className="font-semibold text-[#1A1818]">Profile picture</p>
                  <p>
                    Square works best.{" "}
                    {avatarPreview && (
                      <button
                        type="button"
                        className="text-[#8B1E3F] font-semibold"
                        onClick={() => setAvatarPreview(null)}
                      >
                        Remove
                      </button>
                    )}
                  </p>
                </div>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e, "avatar")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Jaipur Decorators Circle" maxLength={60} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  {COMMUNITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#5E5754] mb-1 block">City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} placeholder="All India" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Purpose *</label>
              <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="What is this community about?" maxLength={200} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="Decor, Jaipur, Weddings" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer text-[#3D3735]">
              <input type="checkbox" className="accent-[#8B1E3F]" checked={form.isPrivate || form.type === "Private Planning Group"} disabled={form.type === "Private Planning Group"} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} />
              Make this community private (members join by request)
            </label>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={() => { setCreateOpen(false); setFormError(""); discardImages(); }}>Cancel</Btn>
              <Btn type="submit">Create</Btn>
            </div>
          </form>
        </Modal>

        {/* Community detail modal */}
        <Modal open={!!detailCommunity} onClose={() => setDetailId(null)} title={detailCommunity?.name ?? ""}>
          {detailCommunity && (
            <div className="space-y-4">
              <Cover src={detailCommunity.cover} bg={detailCommunity.banner} className="h-24 rounded-xl">
                <span className="absolute bottom-2 right-3">
                  <Facepile seed={detailCommunity.id} total={detailCommunity.members} max={4} size={28} />
                </span>
              </Cover>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold bg-[#F5EFE6] text-[#1A1818] px-2.5 py-1 rounded-full">{detailCommunity.type}</span>
                <span className="text-xs text-[#5E5754] flex items-center gap-1">
                  {detailCommunity.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {detailCommunity.isPrivate ? "Private" : "Public"}
                </span>
                <span className="text-xs text-[#5E5754] flex items-center gap-1"><MapPin className="w-3 h-3 text-[#8B1E3F]" />{detailCommunity.city}</span>
              </div>
              <p className="text-sm text-[#4A4442] leading-relaxed">{detailCommunity.purpose}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { n: detailCommunity.members.toLocaleString("en-IN"), l: "Members" },
                  { n: detailCommunity.posts.toLocaleString("en-IN"), l: "Posts" },
                  { n: detailCommunity.admin, l: "Admin" },
                ].map((s, idx) => (
                  <div key={s.l} className="bg-[#FAF8F5] rounded-xl py-3 px-2">
                    <p className={`font-extrabold leading-tight ${idx < 2 ? "text-lg text-[#8B1E3F]" : "text-xs text-[#1A1818]"}`}>{s.n}</p>
                    <p className="text-[11px] text-[#5E5754] mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {detailCommunity.tags.map((t) => <span key={t} className="text-xs font-medium text-[#5E5754]">#{t}</span>)}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Btn onClick={() => handleMembership(detailCommunity)}>
                  {membership[detailCommunity.id] === "joined" ? "Leave Community" : membership[detailCommunity.id] === "pending" ? "Cancel Request" : detailCommunity.isPrivate ? "Request to Join" : "Join Community"}
                </Btn>
                <Btn
                  variant="outline"
                  onClick={() => { const c = detailCommunity; setDetailId(null); openCommunity(c); }}
                >
                  View Feed
                </Btn>
                <Btn variant="outline" onClick={() => shareCommunity(detailCommunity)}>
                  <Share2 className="w-4 h-4" /> Share invite link
                </Btn>
              </div>
            </div>
          )}
        </Modal>

        {/* Create event modal */}
        <Modal open={eventOpen} onClose={() => { setEventOpen(false); setEventError(""); setEventImage(null); }} title="Create an Event">
          <form onSubmit={submitEvent} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Event type *</label>
              <Combobox
                allowCustom
                value={eventForm.category}
                onChange={(v) => setEventForm({ ...eventForm, category: v })}
                options={EVENT_TYPE_OPTIONS}
                placeholder="e.g. Photography Events, Corporate Events…"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Event title *</label>
              <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className={inputCls} maxLength={80} placeholder="e.g. Photography Workshop — Golden Hour Portraits" />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Venue & city *</label>
              <input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} className={inputCls} maxLength={80} placeholder="e.g. Lodhi Garden, Delhi" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Date *</label>
                <input type="date" min={new Date().toISOString().slice(0, 10)} value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Start time *</label>
                <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Total spots *</label>
                <input type="number" min={1} max={10000} value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Price per person (₹)</label>
                <input type="number" min={0} step="any" value={eventForm.price} onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })} className={inputCls} />
                <p className="text-[11px] text-[#5E5754] mt-1">0 = free event</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Cover photo</label>
              <div
                role="button"
                tabIndex={0}
                onClick={() => eventImageRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && eventImageRef.current?.click()}
                className={`relative h-32 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-[#D98AA5] bg-[#FFF7FA] hover:bg-[#FFF0F5] transition-colors ${eventImage ? "border-solid" : ""}`}
                aria-label="Upload event cover photo"
              >
                {eventImage ? (
                  <img src={eventImage} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#A52A55]">
                    <Plus className="w-7 h-7" strokeWidth={2.2} />
                    <span className="text-xs font-semibold">Upload cover photo</span>
                  </div>
                )}
                {eventImage && (
                  <button
                    type="button"
                    aria-label="Remove cover photo"
                    onClick={(e) => { e.stopPropagation(); setEventImage(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1A1818]/75 text-white flex items-center justify-center hover:bg-[#1A1818]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input ref={eventImageRef} type="file" accept="image/*" className="hidden" onChange={pickEventImage} />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Event inclusions</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {eventInclusions.map((x) => (
                  <span key={x} className="inline-flex items-center gap-1.5 rounded-full bg-[#F5EFE6] text-[#8B1E3F] text-xs font-semibold px-3 py-1">
                    {x}
                    <button type="button" aria-label={`Remove ${x}`} onClick={() => setEventInclusions((a) => a.filter((y) => y !== x))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={inclusionDraft} maxLength={30} onChange={(e) => setInclusionDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInclusion(); } }}
                  className={inputCls} placeholder="e.g. Lighting gear, High tea?" />
                <Btn size="sm" onClick={addInclusion} disabled={!inclusionDraft.trim()} className="!h-auto">+ Add</Btn>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5E5754] mb-1 block">Past event photos (up to 6)</label>
              <div className="flex flex-wrap gap-2">
                {eventPhotos.map((src, i) => (
                  <span key={i} className="relative">
                    <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <button type="button" aria-label="Remove photo" onClick={() => setEventPhotos((p) => p.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1A1818] text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {eventPhotos.length < 6 && (
                  <button type="button" onClick={() => eventPhotosRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-[#D98AA5] text-[#A52A55] flex items-center justify-center hover:bg-[#FFF0F5]"><Plus className="w-5 h-5" /></button>
                )}
              </div>
              <input ref={eventPhotosRef} type="file" accept="image/*" multiple className="hidden" onChange={addEventPhotos} />
            </div>

            <p className="text-xs text-[#5E5754]">Your account will be shown as the organizer.</p>
            {eventError && <p className="text-sm text-red-600">{eventError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={() => { setEventOpen(false); setEventError(""); setEventImage(null); }}>Cancel</Btn>
              <Btn type="submit" disabled={creatingEvent}>{creatingEvent ? "Creating…" : "Create Event"}</Btn>
            </div>
          </form>
        </Modal>

        <BookingDrawer ev={bookingEvent} onClose={() => setBookingEventId(null)} onConfirm={confirmBooking} toast={toast} />

        {/* Toasts */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 items-center pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-[#1A1818] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg"
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {activeTab !== "feed" && <Footer />}
      <EveBuddy />
    </div>
  );
}
