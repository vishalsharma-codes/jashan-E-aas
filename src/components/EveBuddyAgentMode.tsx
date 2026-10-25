import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, CheckCircle, Clock, Search, MessageSquare, Calendar, AlertTriangle,
  ToggleLeft, ToggleRight, Eye, Plus, Play, Trash2, IndianRupee,
  FlaskConical, RefreshCw, Target, Volume2, VolumeX, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgentModeProps { isOpen: boolean; onClose: () => void; }
type AgentTab = "active" | "tasks" | "budget" | "permissions" | "emergency";

interface Task {
  id: string;
  type: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "running" | "done" | "failed";
  progress: number;
  result?: string;
  createdAt: string;
}

interface BudgetLine {
  category: string;
  emoji: string;
  allocated: number;
  spent: number;
  color: string;
}

interface LiveLog {
  id: number;
  time: string;
  action: string;
  type: string;
  status: "done" | "pending" | "alert";
  isNew?: boolean;
}

const TASK_TYPES = [
  { id: "search",    label: "Search Vendors",   icon: "🔍" },
  { id: "compare",   label: "Compare Quotes",    icon: "⚖️" },
  { id: "schedule",  label: "Schedule Call",     icon: "📅" },
  { id: "negotiate", label: "Negotiate Price",   icon: "🤝" },
  { id: "analyse",   label: "Analyse Reviews",   icon: "📊" },
  { id: "draft",     label: "Draft Brief",        icon: "✍️" },
];

const TASK_RESULTS: Record<string, string[]> = {
  search:    ["Found 14 verified vendors matching your criteria.", "Top match: Royal Celebrations (4.9⭐, ₹1.2L). Sent inquiry automatically."],
  compare:   ["Compared 8 quotes. Best value: Spice Route Catering at ₹85/head.", "Saving vs. market average: ₹12,000. Draft comparison report ready."],
  schedule:  ["Consultation booked with Lens & Light at 4 PM tomorrow.", "Calendar invite sent. Reminder set for 30 min before."],
  negotiate: ["Negotiated 8% discount with Sound & Fury DJ. Saved ₹4,800.", "Vendor confirmed revised quote — valid 72 hrs."],
  analyse:   ["Analysed 234 reviews across 6 vendors. Avg sentiment: 92% positive.", "2 concerns flagged: one vendor has 3 unresolved disputes this year."],
  draft:     ["Event brief drafted with your full requirements.", "Ready to send to 12 matched vendors — click to review before dispatch."],
};

const AUTO_ACTIONS: LiveLog[] = [
  { id: 0, time: "just now", action: "Scanned 847 new vendor listings in Mumbai for matches", type: "search", status: "done" },
  { id: 0, time: "just now", action: "Cross-checked 6 vendor portfolios against your style preferences", type: "analyse", status: "done" },
  { id: 0, time: "just now", action: "Price alert: Sound & Fury DJ dropped package price by ₹3,000", type: "alert", status: "alert" },
  { id: 0, time: "just now", action: "Sent automated follow-up to 3 vendors who hadn't replied in 24 hrs", type: "contact", status: "done" },
  { id: 0, time: "just now", action: "Updated event brief with revised guest count (240 → 268)", type: "analyse", status: "done" },
  { id: 0, time: "just now", action: "Flagged 2 vendor reviews as potentially inauthentic — investigating", type: "alert", status: "alert" },
  { id: 0, time: "just now", action: "Negotiated 5% additional discount with Lens & Light Studio", type: "negotiate", status: "done" },
  { id: 0, time: "just now", action: "Confirmed backup venue availability on your preferred date", type: "schedule", status: "done" },
  { id: 0, time: "just now", action: "Budget alert: Catering allocation at 80% — recommend renegotiating", type: "alert", status: "alert" },
  { id: 0, time: "just now", action: "Added 3 newly verified photographers matching your brief perfectly", type: "search", status: "done" },
  { id: 0, time: "just now", action: "Compared 11 decorator quotes — Bloom & Blossom is 18% below average", type: "compare", status: "done" },
  { id: 0, time: "just now", action: "Reminded Mehendi Masters of your preferred date — response expected shortly", type: "contact", status: "pending" },
];

const INITIAL_LOGS: LiveLog[] = [
  { id: 1, time: "2 min ago",  action: "Found 10 photographers in Mumbai matching your brief",               type: "search",   status: "done" },
  { id: 2, time: "3 min ago",  action: "Sent inquiry to Lens & Light Studio, Royal Frames, and 8 others",   type: "contact",  status: "done" },
  { id: 3, time: "5 min ago",  action: "Waiting for quote responses (3 received so far)",                   type: "wait",     status: "pending" },
  { id: 4, time: "10 min ago", action: "Analysed quotes — Lens & Light best value at ₹85,000",              type: "analyse",  status: "done" },
  { id: 5, time: "15 min ago", action: "Scheduled a call with Lens & Light for tomorrow 4 PM",              type: "schedule", status: "done" },
];

const SMART_SUGGESTIONS: Record<string, string> = {
  search:    "Find top 5 photographers in {city} under ₹1 lakh for a 300-guest wedding",
  compare:   "Compare catering quotes from all shortlisted vendors and rank by value",
  schedule:  "Schedule site visits to the top 3 venues on my available dates",
  negotiate: "Counter-offer all vendors over budget by asking for a 10% reduction",
  analyse:   "Analyse reviews for all shortlisted vendors and flag any red flags",
  draft:     "Draft a vendor brief for my event and prepare it to send to 10 vendors",
};

const PERMISSIONS = [
  { id: "search",    label: "Search vendors on my behalf",       desc: "Browse & shortlist vendors without asking",          enabled: true  },
  { id: "inquire",   label: "Send initial inquiries",             desc: "Agent sends your brief to shortlisted vendors",       enabled: true  },
  { id: "schedule",  label: "Schedule consultation calls",        desc: "Book calls within your available hours",              enabled: true  },
  { id: "negotiate", label: "Negotiate quotes (within 10%)",      desc: "Counter-offer within a 10% range you set",           enabled: false },
  { id: "book",      label: "Confirm bookings",                   desc: "Finalise bookings — requires your approval first",   enabled: false },
  { id: "pay",       label: "Release payments",                   desc: "Manage payment phases — always requires sign-off",   enabled: false },
];

const DEFAULT_BUDGET: BudgetLine[] = [
  { category: "Photography",     emoji: "📸", allocated: 120000, spent: 85000,  color: "#C44A68" },
  { category: "Catering",        emoji: "🍛", allocated: 200000, spent: 160000, color: "#E88C3A" },
  { category: "Venue",           emoji: "🏛️", allocated: 350000, spent: 320000, color: "#8B0000" },
  { category: "Music & DJ",      emoji: "🎧", allocated: 80000,  spent: 40000,  color: "#7B2FBE" },
  { category: "Decoration",      emoji: "🌸", allocated: 90000,  spent: 72000,  color: "#E91E8C" },
  { category: "Makeup & Bridal", emoji: "💄", allocated: 60000,  spent: 0,      color: "#FF6B9D" },
  { category: "Mehendi",         emoji: "🌿", allocated: 25000,  spent: 22000,  color: "#4CAF50" },
  { category: "Invitations",     emoji: "📜", allocated: 15000,  spent: 12000,  color: "#03A9F4" },
];

const iconFor = (type: string) => {
  if (type === "search")    return <Search className="w-3.5 h-3.5" />;
  if (type === "contact")   return <MessageSquare className="w-3.5 h-3.5" />;
  if (type === "schedule")  return <Calendar className="w-3.5 h-3.5" />;
  if (type === "alert")     return <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />;
  if (type === "analyse")   return <Eye className="w-3.5 h-3.5" />;
  if (type === "negotiate") return <TrendingUp className="w-3.5 h-3.5" />;
  return <Zap className="w-3.5 h-3.5" />;
};

const priorityColor: Record<string, string> = {
  low:    "text-muted-foreground border-muted",
  medium: "text-blue-700 border-blue-500/40",
  high:   "text-amber-700 border-amber-500/40",
  urgent: "text-red-600 border-red-500/50",
};

const fmtElapsed = (ms: number) => {
  const s = Math.floor(ms / 1000);
  if (s < 60)  return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

export const EveBuddyAgentMode = ({ isOpen, onClose }: AgentModeProps) => {
  const [tab,          setTab]          = useState<AgentTab>("active");
  const [perms,        setPerms]        = useState<Record<string, boolean>>(
    Object.fromEntries(PERMISSIONS.map(p => [p.id, p.enabled]))
  );
  const [agentRunning, setAgentRunning] = useState(true);
  const [testMode,     setTestMode]     = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [emergencyInput,   setEmergencyInput]   = useState("");
  const [emergencyStarted, setEmergencyStarted] = useState(false);

  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [taskType,     setTaskType]     = useState("search");
  const [taskDesc,     setTaskDesc]     = useState("");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("medium");

  const [budget,        setBudget]        = useState<BudgetLine[]>(DEFAULT_BUDGET);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editVal,       setEditVal]       = useState("");

  const [liveLogs,  setLiveLogs]  = useState<LiveLog[]>(INITIAL_LOGS);
  const [sessionStart]            = useState(Date.now());
  const [elapsed,   setElapsed]   = useState(0);

  const intervalRefs   = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const autoCountRef   = useRef(0);

  const totalAllocated = budget.reduce((s, b) => s + b.allocated, 0);
  const totalSpent     = budget.reduce((s, b) => s + b.spent, 0);
  const remaining      = totalAllocated - totalSpent;

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Date.now() - sessionStart), 1000);
    return () => clearInterval(t);
  }, [sessionStart]);

  // Auto-scheduler: agent adds a live log entry every 9 seconds while running
  useEffect(() => {
    if (!agentRunning || !isOpen) return;
    const interval = setInterval(() => {
      const template = AUTO_ACTIONS[autoCountRef.current % AUTO_ACTIONS.length];
      autoCountRef.current++;
      const log: LiveLog = {
        ...template,
        id:    Date.now(),
        time:  "just now",
        isNew: true,
      };
      setLiveLogs(prev => [log, ...prev.map(l => ({ ...l, isNew: false }))].slice(0, 24));

      // Optionally read it aloud
      if (voiceEnabled && window.speechSynthesis && template.status !== "pending") {
        const utt = new SpeechSynthesisUtterance(template.action);
        utt.lang = "en-IN"; utt.rate = 1.1; utt.pitch = 1.2;
        window.speechSynthesis.speak(utt);
      }
    }, 9000);
    return () => clearInterval(interval);
  }, [agentRunning, isOpen, voiceEnabled]);

  const tabs: { id: AgentTab; label: string }[] = [
    { id: "active",      label: "Activity" },
    { id: "tasks",       label: "Assign Task" },
    { id: "budget",      label: "💰 Budget" },
    { id: "permissions", label: "Permissions" },
    { id: "emergency",   label: "🆘 SOS" },
  ];

  const runTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "running", progress: 0 } : t));
    let prog = 0;
    intervalRefs.current[taskId] = setInterval(() => {
      prog += Math.random() * 18 + 8;
      if (prog >= 100) {
        clearInterval(intervalRefs.current[taskId]);
        setTasks(prev => {
          const t = prev.find(x => x.id === taskId);
          const results = TASK_RESULTS[t?.type ?? "search"] ?? ["Task completed successfully."];
          const result = results.join(" ");
          if (voiceEnabled && window.speechSynthesis) {
            const utt = new SpeechSynthesisUtterance("Task complete. " + results[0]);
            utt.lang = "en-IN"; utt.pitch = 1.2; utt.rate = 1.0;
            window.speechSynthesis.speak(utt);
          }
          return prev.map(x => x.id === taskId ? { ...x, status: "done", progress: 100, result } : x);
        });
      } else {
        setTasks(prev => prev.map(x => x.id === taskId ? { ...x, progress: Math.min(prog, 95) } : x));
      }
    }, 260);
  }, [voiceEnabled]);

  const addTask = () => {
    if (!taskDesc.trim()) return;
    const newTask: Task = {
      id:          Date.now().toString(),
      type:        taskType,
      description: taskDesc,
      priority:    taskPriority,
      status:      "pending",
      progress:    0,
      createdAt:   "just now",
    };
    setTasks(prev => [newTask, ...prev]);
    setTaskDesc("");
    if (agentRunning) setTimeout(() => runTask(newTask.id), 350);
  };

  useEffect(() => () => { Object.values(intervalRefs.current).forEach(clearInterval); }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-24 right-4 w-[440px] max-w-[calc(100vw-2rem)] h-[640px] bg-card border border-gold/40 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          style={{ boxShadow: "0 20px 60px -15px rgba(196,74,104,0.4)" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FFE3D6] via-[#FFD9C7] to-[#FBD3DC] border-b border-gold/30 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/60 border border-gold/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#4A1230]">Agent Eve</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${agentRunning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"}`} />
                  <span className="text-xs text-muted-foreground">
                    {agentRunning ? `Active · ${fmtElapsed(elapsed)}` : "Paused"}
                  </span>
                  {testMode && <Badge className="text-[9px] py-0 px-1.5 bg-purple-500/20 text-purple-700 border-purple-500/30">TEST</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (voiceEnabled) window.speechSynthesis?.cancel();
                  setVoiceEnabled(!voiceEnabled);
                }}
                title={voiceEnabled ? "Disable agent voice" : "Enable agent voice narration"}
                className={`text-xs px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 ${voiceEnabled ? "border-gold/50 text-gold bg-white/60" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setTestMode(!testMode)}
                title="Test mode"
                className={`text-xs px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 ${testMode ? "border-purple-500/50 text-purple-700 bg-purple-500/10" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                <FlaskConical className="w-3 h-3" /> Test
              </button>
              <button
                onClick={() => setAgentRunning(!agentRunning)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${agentRunning ? "border-emerald-600/50 text-emerald-700 hover:bg-emerald-500/10" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {agentRunning ? "Pause" : "Resume"}
              </button>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border flex-shrink-0 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                  tab === t.id ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">

              {/* ── ACTIVITY ── */}
              {tab === "active" && (
                <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">
                      {agentRunning
                        ? "Agent Eve is working on your Mumbai Wedding brief in real-time:"
                        : "Agent is paused. Resume to continue automated tasks."}
                    </p>
                    {agentRunning && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 flex-shrink-0 ml-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>

                  {testMode && (
                    <div className="mb-3 p-3 bg-purple-500/10 border border-purple-500/25 rounded-xl">
                      <p className="text-xs text-purple-700 font-semibold mb-1 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5" /> Test Mode Active
                      </p>
                      <p className="text-xs text-muted-foreground">Click "Run Test" on any action to simulate it.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {liveLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={log.isNew ? { opacity: 0, y: -12, scale: 0.97 } : { opacity: 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                          log.isNew
                            ? "border-gold/40 bg-gold/5"
                            : log.status === "pending"
                              ? "border-amber-500/30 bg-amber-500/5"
                              : log.status === "alert"
                                ? "border-orange-500/30 bg-orange-500/5"
                                : "border-border bg-card/50"
                        }`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 ${
                          log.status === "done"    ? "text-emerald-700"
                          : log.status === "alert" ? "text-orange-700"
                          : "text-amber-700"
                        }`}>
                          {log.status === "done"
                            ? <CheckCircle className="w-3.5 h-3.5" />
                            : log.status === "alert"
                              ? <AlertTriangle className="w-3.5 h-3.5" />
                              : <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">{log.action}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{log.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {testMode && (
                            <button className="text-[10px] text-purple-700 border border-purple-500/30 rounded px-1.5 py-0.5 hover:bg-purple-500/10 flex items-center gap-0.5">
                              <Play className="w-2.5 h-2.5" /> Run
                            </button>
                          )}
                          <div className="text-muted-foreground">{iconFor(log.type)}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Button className="w-full mt-4 bg-gold hover:bg-gold-dark text-white text-xs">
                    Review Agent's Full Shortlist
                  </Button>
                </motion.div>
              )}

              {/* ── ASSIGN TASK ── */}
              {tab === "tasks" && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="bg-muted/40 border border-border rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-gold" /> Assign New Task to Agent Eve
                    </p>

                    {/* Task type */}
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {TASK_TYPES.map(tt => (
                        <button
                          key={tt.id}
                          onClick={() => setTaskType(tt.id)}
                          className={`flex flex-col items-center gap-0.5 p-2 rounded-lg border text-[10px] transition-all ${
                            taskType === tt.id ? "border-gold/70 bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/30"
                          }`}
                        >
                          <span className="text-base">{tt.icon}</span>
                          {tt.label}
                        </button>
                      ))}
                    </div>

                    {/* Smart suggestion */}
                    {SMART_SUGGESTIONS[taskType] && (
                      <button
                        onClick={() => setTaskDesc(SMART_SUGGESTIONS[taskType])}
                        className="w-full text-left text-[10px] text-gold bg-gold/5 border border-gold/20 rounded-lg p-2 mb-2 hover:bg-gold/10 transition-colors"
                      >
                        <span className="text-gold font-semibold">✨ Suggestion: </span>
                        {SMART_SUGGESTIONS[taskType]}
                      </button>
                    )}

                    {/* Description */}
                    <textarea
                      value={taskDesc}
                      onChange={e => setTaskDesc(e.target.value)}
                      placeholder={`e.g. "${SMART_SUGGESTIONS[taskType] ?? "Describe the task for Agent Eve..."}"`}
                      className="w-full h-20 bg-card border border-border rounded-xl p-3 text-xs resize-none focus:outline-none focus:border-gold/50 placeholder:text-muted-foreground/60 mb-3"
                    />

                    {/* Priority */}
                    <div className="flex gap-1.5 mb-3">
                      {(["low", "medium", "high", "urgent"] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setTaskPriority(p)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border capitalize transition-all ${
                            taskPriority === p ? priorityColor[p] + " bg-current/5" : "border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={addTask}
                      disabled={!taskDesc.trim()}
                      className="w-full bg-gold hover:bg-gold-dark text-white text-xs h-9"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1.5" />
                      {agentRunning ? "Assign & Run Now" : "Queue Task"}
                    </Button>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-3xl mb-2">🤖</p>
                      <p className="text-xs">No tasks assigned yet. Create one above!</p>
                      <p className="text-[10px] mt-1 text-muted-foreground/70">The agent will run it automatically.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div key={task.id} className="bg-card border border-border rounded-xl p-3">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-sm">{TASK_TYPES.find(t => t.id === task.type)?.icon}</span>
                                <span className="text-xs font-semibold capitalize">{task.type}</span>
                                <span className={`text-[9px] border rounded px-1 capitalize ${priorityColor[task.priority]}`}>{task.priority}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {task.status === "pending" && (
                                <button
                                  onClick={() => runTask(task.id)}
                                  className="text-[10px] text-gold border border-gold/30 rounded px-1.5 py-0.5 hover:bg-gold/10 flex items-center gap-0.5"
                                >
                                  <Play className="w-2.5 h-2.5" /> Run
                                </button>
                              )}
                              <button
                                onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                                className="text-muted-foreground hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {(task.status === "running" || task.status === "done") && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                <span>{task.status === "done" ? "✅ Completed" : "⚡ Agent working…"}</span>
                                <span>{Math.round(task.progress)}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-gold to-emerald-500 rounded-full"
                                  animate={{ width: `${task.progress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </div>
                          )}

                          {task.result && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg"
                            >
                              <p className="text-[10px] text-emerald-800 leading-relaxed">{task.result}</p>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── BUDGET ── */}
              {tab === "budget" && (
                <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Total Budget",  val: `₹${(totalAllocated / 100000).toFixed(1)}L`, color: "text-gold" },
                      { label: "Spent So Far",  val: `₹${(totalSpent / 100000).toFixed(1)}L`,     color: "text-amber-700" },
                      { label: "Remaining",     val: `₹${(remaining / 100000).toFixed(1)}L`,      color: remaining > 0 ? "text-emerald-700" : "text-red-600" },
                    ].map(s => (
                      <div key={s.label} className="bg-muted/40 border border-border rounded-xl p-2.5 text-center">
                        <p className={`font-bold text-sm ${s.color}`}>{s.val}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {budget.map(line => {
                      const pct    = Math.min((line.spent / line.allocated) * 100, 100);
                      const isOver = line.spent > line.allocated;
                      return (
                        <div key={line.category} className="bg-card border border-border rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{line.emoji}</span>
                              <span className="text-xs font-semibold">{line.category}</span>
                              {isOver && <Badge className="text-[9px] py-0 px-1.5 bg-red-500/20 text-red-600 border-red-500/30">Over</Badge>}
                              {!isOver && pct > 80 && <Badge className="text-[9px] py-0 px-1.5 bg-amber-500/20 text-amber-700 border-amber-500/30">High</Badge>}
                            </div>
                            {editingBudget === line.category ? (
                              <div className="flex items-center gap-1">
                                <IndianRupee className="w-2.5 h-2.5 text-gold" />
                                <input
                                  type="number"
                                  value={editVal}
                                  onChange={e => setEditVal(e.target.value)}
                                  className="w-20 text-xs bg-muted border border-gold/40 rounded px-2 py-0.5 focus:outline-none"
                                  autoFocus
                                  onBlur={() => {
                                    const n = parseInt(editVal);
                                    if (!isNaN(n) && n > 0) setBudget(prev => prev.map(b => b.category === line.category ? { ...b, allocated: n } : b));
                                    setEditingBudget(null);
                                  }}
                                  onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                                />
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingBudget(line.category); setEditVal(String(line.allocated)); }}
                                className="text-xs text-muted-foreground hover:text-gold transition-colors"
                              >
                                ₹{(line.allocated / 1000).toFixed(0)}K
                              </button>
                            )}
                          </div>

                          <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: isOver ? "#ef4444" : line.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Spent: ₹{(line.spent / 1000).toFixed(0)}K</span>
                            <span className={isOver ? "text-red-600" : pct > 80 ? "text-amber-700" : "text-emerald-700"}>
                              {pct.toFixed(0)}% used
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1 text-xs h-9 border-gold/40 text-gold hover:bg-gold/10"
                      variant="outline"
                      onClick={() => setBudget(prev => prev.map(b => ({ ...b, spent: Math.round(b.allocated * (0.2 + Math.random() * 0.7)) })))}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh quotes
                    </Button>
                    <Button
                      className="flex-1 text-xs h-9 bg-gold hover:bg-gold-dark text-white"
                      onClick={() => setBudget(DEFAULT_BUDGET)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Category
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── PERMISSIONS ── */}
              {tab === "permissions" && (
                <motion.div key="permissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-xs text-muted-foreground mb-4">
                    Control exactly what Agent Eve can do on your behalf. You're always in charge.
                  </p>

                  {/* Agent voice toggle */}
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-gold/30 bg-gold/5 mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gold">Agent Voice Narration</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Agent reads out actions and results aloud in real-time</p>
                    </div>
                    <button
                      onClick={() => {
                        if (voiceEnabled) window.speechSynthesis?.cancel();
                        setVoiceEnabled(!voiceEnabled);
                      }}
                      className={`flex-shrink-0 transition-colors ${voiceEnabled ? "text-gold" : "text-muted-foreground"}`}
                    >
                      {voiceEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {PERMISSIONS.map(perm => (
                      <div key={perm.id} className="flex items-start gap-3 p-3 rounded-xl border border-border">
                        <div className="flex-1">
                          <p className="text-xs font-semibold">{perm.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{perm.desc}</p>
                        </div>
                        <button
                          onClick={() => setPerms(p => ({ ...p, [perm.id]: !p[perm.id] }))}
                          className={`flex-shrink-0 transition-colors ${perms[perm.id] ? "text-gold" : "text-muted-foreground"}`}
                        >
                          {perms[perm.id] ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-muted/30 border border-border rounded-xl text-[10px] text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">🔒 Always secure</p>
                    All agent actions are logged and reversible. Payments always require your final sign-off regardless of permissions.
                  </div>
                </motion.div>
              )}

              {/* ── EMERGENCY SOS ── */}
              {tab === "emergency" && (
                <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-center mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-4xl mb-2"
                    >🆘</motion.div>
                    <h3 className="font-bold">Emergency Vendor Finder</h3>
                    <p className="text-xs text-muted-foreground mt-1">Vendor cancelled last-minute? Agent Eve finds a replacement within hours.</p>
                  </div>

                  {!emergencyStarted ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {["DJ cancelled tonight", "Photographer no-show", "Caterer cancelled", "Venue double-booked"].map(preset => (
                          <button
                            key={preset}
                            onClick={() => setEmergencyInput(preset + ". Need urgent replacement in Mumbai within 4 hours.")}
                            className="text-[10px] text-left p-2 rounded-lg border border-border hover:border-crimson/40 hover:text-crimson transition-colors"
                          >
                            ⚡ {preset}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={emergencyInput}
                        onChange={e => setEmergencyInput(e.target.value)}
                        placeholder="e.g. 'My DJ cancelled for tomorrow evening. Need someone in Mumbai for a 200-person wedding reception. Budget ₹30,000.'"
                        className="w-full h-24 bg-muted border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-crimson/50 placeholder:text-muted-foreground/60"
                      />
                      <Button
                        onClick={() => setEmergencyStarted(true)}
                        disabled={!emergencyInput.trim()}
                        className="w-full bg-crimson hover:bg-crimson/80 text-white font-semibold"
                      >
                        <Zap className="w-4 h-4 mr-2" /> Activate Emergency Mode
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">Platform emergency surcharge: 10% of booking value</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { action: "Broadcasting SOS to all available vendors in your city", done: true },
                        { action: "Found 6 vendors with availability for your slot",         done: true },
                        { action: "Sending urgent brief to top 3 matches",                   done: true },
                        { action: "Quote received from 2 vendors — reviewing now",           done: true },
                        { action: "Waiting for confirmation call from Sound & Fury DJ…",    done: false },
                      ].map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${step.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}
                        >
                          {step.done
                            ? <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                            : <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 animate-spin" style={{ animationDuration: "2s" }} />}
                          <p className="text-xs">{step.action}</p>
                        </motion.div>
                      ))}
                      <Badge className="w-full justify-center py-2 bg-amber-500/20 text-amber-700 border-amber-500/30 text-xs">
                        ⏱ Est. replacement confirmed in: ~35 minutes
                      </Badge>
                      <Button
                        variant="outline"
                        className="w-full text-xs border-border"
                        onClick={() => { setEmergencyStarted(false); setEmergencyInput(""); }}
                      >
                        Start New SOS Request
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};