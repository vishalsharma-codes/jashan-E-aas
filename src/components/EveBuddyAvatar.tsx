import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvatarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

const languages = [
  { code: "en", label: "English",   flag: "🇬🇧", speechLang: "en-IN" },
  { code: "hi", label: "हिंदी",    flag: "🇮🇳", speechLang: "hi-IN" },
  { code: "pa", label: "ਪੰਜਾਬੀ",  flag: "🌟",  speechLang: "pa-IN" },
  { code: "ta", label: "தமிழ்",    flag: "🌴",  speechLang: "ta-IN" },
  { code: "bn", label: "বাংলা",    flag: "🌸",  speechLang: "bn-IN" },
  { code: "te", label: "తెలుగు",   flag: "☀️",  speechLang: "te-IN" },
  { code: "mr", label: "मराठी",    flag: "🏔️",  speechLang: "mr-IN" },
  { code: "gu", label: "ગુજરાતી", flag: "💎",  speechLang: "gu-IN" },
];

const personalities = [
  { id: "friendly", label: "Friendly & Warm",     emoji: "😊", desc: "Like a close friend helping you plan" },
  { id: "formal",   label: "Professional",         emoji: "👔", desc: "Formal, precise, business-like" },
  { id: "punjabi",  label: "Punjabi Sass",          emoji: "🎉", desc: "Full energy, desi humor" },
  { id: "genz",     label: "Gen-Z Casual",          emoji: "✌️", desc: "No cap, very chill and relatable" },
  { id: "south",    label: "South Indian Formal",   emoji: "🙏", desc: "Respectful, warm, traditional" },
  { id: "dilli",    label: "Dilli Wali Didi",       emoji: "💅", desc: "Opinionated, fashionable, direct" },
];

const genderOptions = [
  { id: "female",  label: "Female",  pitch: 1.3,  rate: 1.0 },
  { id: "male",    label: "Male",    pitch: 0.75, rate: 0.95 },
  { id: "neutral", label: "Neutral", pitch: 1.0,  rate: 1.0 },
];

const AVATAR_FACES: Record<string, Record<string, string>> = {
  female:  { friendly: "👩‍💼", formal: "👩‍💼", punjabi: "💃",  genz: "👩‍🎤", south: "🙏", dilli: "💅" },
  male:    { friendly: "👨‍💼", formal: "👨‍💼", punjabi: "🎉",  genz: "👨‍🎤", south: "🙏", dilli: "😎" },
  neutral: { friendly: "🧑‍💼", formal: "🧑‍💼", punjabi: "🎊",  genz: "🧑‍🎤", south: "🙏", dilli: "🧑" },
};

const greetings: Record<string, Record<string, string>> = {
  en: {
    friendly: "Hello! I'm Eve, your personal event planner. I can't wait to help you create the perfect event!",
    formal:   "Good day. I am EveBuddy, your professional event planning assistant. How may I assist you today?",
    punjabi:  "Sat Sri Akal ji! Main hun Eve — aapda event planner! Chalo shuru karte haan!",
    genz:     "Heyyy! I'm Eve, your event bestie! No cap, I'll help you plan the most fire event ever!",
    south:    "Namaskaram! I am Eve, your trusted event planning companion. How may I serve you today?",
    dilli:    "Arre hello! Main hun Eve. Sun, aaj tu sahi jagah aya hai — main tera event perfect bana dungi!",
  },
  hi: {
    friendly: "नमस्ते! मैं Eve हूं, आपकी personal event planner। आपके event को perfect बनाने में मदद के लिए यहाँ हूं!",
    formal:   "नमस्ते। मैं EveBuddy हूं, आपका professional assistant। आज मैं आपकी कैसे सहायता कर सकती हूं?",
    punjabi:  "सत श्री अकाल जी! मैं हूं Eve — आपकी event planner! चलिए शुरू करते हैं!",
    genz:     "यार, हेलो! मैं Eve हूं! तेरा event super lit बनाऊंगी!",
    south:    "नमस्ते! मैं Eve हूं, आपकी विश्वसनीय event planning companion।",
    dilli:    "अरे हेलो! मैं Eve हूं। सुन, आज तू सही जगह आई है — मैं तेरा event perfect बना दूंगी!",
  },
  pa: {
    friendly: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ Eve ਹਾਂ, ਤੁਹਾਡੀ personal event planner। ਤੁਹਾਡੇ event ਨੂੰ perfect ਬਣਾਉਣ ਲਈ ਹਾਜ਼ਰ ਹਾਂ!",
    formal:   "ਸਤ ਸ੍ਰੀ ਅਕਾਲ। ਮੈਂ EveBuddy ਹਾਂ, ਤੁਹਾਡੀ professional event planning assistant।",
    punjabi:  "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ! ਮੈਂ ਹਾਂ Eve — ਆਪਦਾ event planner! ਚਲੋ ਸ਼ੁਰੂ ਕਰਦੇ ਹਾਂ!",
    genz:     "ਯਾਰ ਹੈਲੋ! ਮੈਂ Eve ਹਾਂ! ਤੇਰਾ event super lit ਬਣਾਵਾਂਗੀ!",
    south:    "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ Eve ਹਾਂ, ਤੁਹਾਡੀ ਭਰੋਸੇਮੰਦ companion।",
    dilli:    "ਅਰੇ ਹੈਲੋ! ਮੈਂ Eve ਹਾਂ। ਸੁਣ, ਅੱਜ ਤੂੰ ਸਹੀ ਜਗ੍ਹਾ ਆਈ ਹੈਂ!",
  },
  ta: {
    friendly: "வணக்கம்! நான் Eve, உங்கள் personal event planner. உங்கள் நிகழ்வை சிறப்பாக திட்டமிட மகிழ்ச்சியாக இருக்கிறேன்!",
    formal:   "வணக்கம். நான் EveBuddy, உங்கள் professional event planning assistant. இன்று எப்படி உதவலாம்?",
    punjabi:  "வணக்கம்! நான் Eve — உங்கள் event planner! ஆரம்பிக்கலாம்!",
    genz:     "ஹேய்! நான் Eve, உங்கள் event bestie! சூப்பர் event plan பண்ணுவோம்!",
    south:    "நமஸ்காரம்! நான் Eve, உங்கள் நம்பகமான event planning companion. இன்று எப்படி சேவை செய்யலாம்?",
    dilli:    "வணக்கம்! நான் Eve. சரியான இடத்திற்கு வந்திருக்கீங்க — உங்கள் event perfect ஆக செய்வேன்!",
  },
};

const getGreeting = (lang: string, personality: string) =>
  greetings[lang]?.[personality] ?? greetings.en[personality] ?? greetings.en.friendly;

export const EveBuddyAvatar = ({ isOpen, onClose, onOpenChat }: AvatarProps) => {
  const [language,    setLanguage]    = useState("en");
  const [personality, setPersonality] = useState("friendly");
  const [gender,      setGender]      = useState("female");
  const [muted,       setMuted]       = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [speaking,    setSpeaking]    = useState(false);
  const [waveAmps,    setWaveAmps]    = useState([0, 0, 0, 0, 0, 0, 0]);
  const waveRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const greeting   = getGreeting(language, personality);
  const selPers    = personalities.find(p => p.id === personality);
  const selGender  = genderOptions.find(g => g.id === gender);
  const avatarFace = AVATAR_FACES[gender]?.[personality] ?? "🧑‍💼";

  // Pre-load voices
  useEffect(() => {
    const load = () => { voicesRef.current = window.speechSynthesis?.getVoices() ?? []; };
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (waveRef.current) clearInterval(waveRef.current);
    setSpeaking(false);
    setWaveAmps([0, 0, 0, 0, 0, 0, 0]);
  }, []);

  const speak = useCallback((text?: string) => {
    if (muted || !window.speechSynthesis) return;
    stopSpeech();

    const langCfg   = languages.find(l => l.code === language) ?? languages[0];
    const genderCfg = genderOptions.find(g => g.id === gender) ?? genderOptions[0];
    const utterance  = new SpeechSynthesisUtterance(text ?? greeting);

    utterance.lang   = langCfg.speechLang;
    utterance.pitch  = genderCfg.pitch;
    utterance.rate   = genderCfg.rate;
    utterance.volume = 1;

    const voices = voicesRef.current;
    if (voices.length > 0) {
      const langBase = langCfg.speechLang.split("-")[0];
      const preferred = voices.find(v =>
        v.lang.startsWith(langBase) &&
        (gender === "female"
          ? /female|woman|girl/i.test(v.name)
          : gender === "male"
            ? /male|man|boy/i.test(v.name)
            : true)
      ) ?? voices.find(v => v.lang.startsWith(langBase))
        ?? voices.find(v => v.lang.startsWith("en"))
        ?? voices[0];
      utterance.voice = preferred;
    }

    setSpeaking(true);
    waveRef.current = setInterval(() => {
      setWaveAmps([
        Math.random() * 0.7 + 0.15,
        Math.random() * 1.0 + 0.3,
        Math.random() * 0.9 + 0.5,
        Math.random() * 1.0 + 0.4,
        Math.random() * 0.9 + 0.3,
        Math.random() * 0.7 + 0.2,
        Math.random() * 0.5 + 0.1,
      ]);
    }, 110);

    utterance.onend   = stopSpeech;
    utterance.onerror = stopSpeech;
    window.speechSynthesis.speak(utterance);
  }, [greeting, language, gender, muted, stopSpeech]);

  // Auto-speak when opened
  useEffect(() => {
    if (isOpen && !showSettings && !muted) {
      const t = setTimeout(speak, 700);
      return () => clearTimeout(t);
    }
    if (!isOpen) stopSpeech();
    return undefined;
  }, [isOpen, showSettings]);

  useEffect(() => { if (muted) stopSpeech(); }, [muted]);
  useEffect(() => () => stopSpeech(), []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="fixed bottom-24 left-4 w-80 bg-card border border-gold/30 rounded-3xl shadow-2xl z-50 overflow-hidden"
          style={{ boxShadow: "0 0 40px rgba(212,175,55,0.15)" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gold/20 to-gold/5 border-b border-gold/20 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span
                className="text-xl"
                animate={speaking ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                {avatarFace}
              </motion.span>
              <div>
                <p className="font-bold text-sm text-gold">Eve — AI Avatar</p>
                <p className="text-xs text-muted-foreground">{selPers?.label} · {selGender?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(!muted)}
                title={muted ? "Unmute voice" : "Mute voice"}
                className={`transition-colors ${muted ? "text-crimson" : "text-muted-foreground hover:text-gold"}`}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { stopSpeech(); setShowSettings(!showSettings); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={() => { stopSpeech(); onClose(); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showSettings ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 space-y-4 max-h-[480px] overflow-y-auto"
              >
                {/* Language */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Language / भाषा</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border text-xs transition-all ${language === lang.code ? "bg-gold/20 border-gold text-gold" : "border-border hover:border-gold/30"}`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-[9px] leading-tight text-center">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personality */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Personality</p>
                  <div className="space-y-1.5">
                    {personalities.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPersonality(p.id)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${personality === p.id ? "bg-gold/20 border-gold" : "border-border hover:border-gold/30"}`}
                      >
                        <span className="text-base">{p.emoji}</span>
                        <div className="text-left">
                          <p className="font-semibold leading-tight">{p.label}</p>
                          <p className="text-muted-foreground leading-tight text-[10px]">{p.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Voice & Presentation</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {genderOptions.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setGender(g.id)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-all ${gender === g.id ? "bg-gold/20 border-gold" : "border-border hover:border-gold/30"}`}
                      >
                        <span className="text-2xl">{AVATAR_FACES[g.id].friendly}</span>
                        <span className="font-medium">{g.label}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {g.pitch > 1 ? "High pitch" : g.pitch < 1 ? "Low pitch" : "Neutral"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => { setShowSettings(false); setTimeout(speak, 500); }}
                  className="w-full bg-gold hover:bg-gold-dark text-background text-xs"
                >
                  Save & Hear Eve Speak
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4"
              >
                {/* Avatar */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <motion.div
                      animate={speaking ? { scale: [1, 1.04, 0.98, 1] } : { scale: 1 }}
                      transition={{ repeat: Infinity, duration: 0.7 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/40 to-gold-dark/40 border-2 border-gold/50 flex items-center justify-center"
                      style={{ boxShadow: speaking ? "0 0 32px rgba(212,175,55,0.6)" : "0 0 16px rgba(212,175,55,0.2)" }}
                    >
                      <span className="text-5xl">{avatarFace}</span>
                    </motion.div>
                    {speaking && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.1 }}
                          className="absolute inset-0 rounded-full border-2 border-gold/40"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.8, 1], opacity: [0.25, 0, 0.25] }}
                          transition={{ repeat: Infinity, duration: 1.1, delay: 0.35 }}
                          className="absolute inset-0 rounded-full border border-gold/20"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Waveform visualizer */}
                <div className="flex items-center justify-center gap-1 h-9 mb-3">
                  {waveAmps.map((amp, i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: speaking ? amp : 0.15 }}
                      transition={{ duration: 0.08 }}
                      className={`w-1.5 rounded-full origin-center ${speaking ? "bg-gold" : "bg-muted-foreground/30"}`}
                      style={{ height: 32 }}
                    />
                  ))}
                  {speaking && (
                    <span className="text-[10px] text-gold ml-2 animate-pulse">Speaking…</span>
                  )}
                </div>

                {/* Speech bubble */}
                <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm p-3 mb-4 relative">
                  <div className="absolute -top-1.5 left-4 w-3 h-3 bg-muted/50 border-l border-t border-border rotate-45" />
                  <p className="text-xs text-foreground leading-relaxed">{greeting}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{selPers?.emoji} {selPers?.desc}</p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={() => { stopSpeech(); onOpenChat(); onClose(); }}
                    className="w-full bg-gold hover:bg-gold-dark text-background text-xs"
                  >
                    Start Planning with Eve
                  </Button>
                  <div className="flex gap-2">
                    <button
                      onClick={speaking ? stopSpeech : () => speak()}
                      disabled={muted}
                      className={`flex-1 text-xs py-2 rounded-xl border transition-colors
                        ${speaking
                          ? "border-gold/60 text-gold bg-gold/10"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-gold/30"}
                        ${muted ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {muted ? "🔇 Voice muted" : speaking ? "⏹ Stop speaking" : "🔊 Hear Eve speak"}
                    </button>
                    <button
                      onClick={() => setMuted(!muted)}
                      className={`px-3 py-2 rounded-xl border text-xs transition-colors
                        ${muted
                          ? "border-crimson/40 text-crimson bg-crimson/10"
                          : "border-border text-muted-foreground hover:border-gold/30 hover:text-gold"}`}
                    >
                      {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Language: {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.label}
                    {" · "}
                    <button onClick={() => { stopSpeech(); setShowSettings(true); }} className="text-gold hover:underline">
                      Change settings
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
