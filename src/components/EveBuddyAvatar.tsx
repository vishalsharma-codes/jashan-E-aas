import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import eveAvatar from "@/assets/eveBuddy/eve-avatar.jpg";
import evePresenting from "@/assets/eveBuddy/eve-presenting.jpg";
import eveWaving from "@/assets/eveBuddy/eve-waving.jpg";
import eveThinking from "@/assets/eveBuddy/eve-thinking.jpg";

interface AvatarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

/* =========================================================
   LANGUAGES
========================================================= */

const languages = [
  {
    code: "en",
    label: "English",
    flag: "🇬🇧",
    speechLang: "en-IN",
  },
  {
    code: "hi",
    label: "हिंदी",
    flag: "🇮🇳",
    speechLang: "hi-IN",
  },
  {
    code: "pa",
    label: "ਪੰਜਾਬੀ",
    flag: "🌟",
    speechLang: "pa-IN",
  },
  {
    code: "ta",
    label: "தமிழ்",
    flag: "🌴",
    speechLang: "ta-IN",
  },
  {
    code: "bn",
    label: "বাংলা",
    flag: "🌸",
    speechLang: "bn-IN",
  },
  {
    code: "te",
    label: "తెలుగు",
    flag: "☀️",
    speechLang: "te-IN",
  },
  {
    code: "mr",
    label: "मराठी",
    flag: "🏔️",
    speechLang: "mr-IN",
  },
  {
    code: "gu",
    label: "ગુજરાતી",
    flag: "💎",
    speechLang: "gu-IN",
  },
];

/* =========================================================
   PERSONALITIES
========================================================= */

const personalities = [
  {
    id: "friendly",
    label: "Friendly & Warm",
    emoji: "😊",
    desc: "Like a close friend helping you plan",
  },
  {
    id: "formal",
    label: "Professional",
    emoji: "👔",
    desc: "Formal, precise, business-like",
  },
  {
    id: "punjabi",
    label: "Punjabi Sass",
    emoji: "🎉",
    desc: "Full energy, desi humor",
  },
  {
    id: "genz",
    label: "Gen-Z Casual",
    emoji: "✌️",
    desc: "No cap, very chill and relatable",
  },
  {
    id: "south",
    label: "South Indian Formal",
    emoji: "🙏",
    desc: "Respectful, warm, traditional",
  },
  {
    id: "dilli",
    label: "Dilli Wali Didi",
    emoji: "💅",
    desc: "Opinionated, fashionable, direct",
  },
];

/* =========================================================
   VOICE OPTIONS
========================================================= */

const genderOptions = [
  {
    id: "female",
    label: "Female",
    pitch: 1.3,
    rate: 1.0,
  },
  {
    id: "male",
    label: "Male",
    pitch: 0.75,
    rate: 0.95,
  },
  {
    id: "neutral",
    label: "Neutral",
    pitch: 1.0,
    rate: 1.0,
  },
];

/* =========================================================
   GREETINGS
========================================================= */

const greetings: Record<string, Record<string, string>> = {
  en: {
    friendly:
      "Hello! I'm Eve, your personal event planner. I can't wait to help you create the perfect event!",

    formal:
      "Good day. I am EveBuddy, your professional event planning assistant. How may I assist you today?",

    punjabi:
      "Sat Sri Akal ji! Main hun Eve — aapda event planner! Chalo shuru karte haan!",

    genz:
      "Heyyy! I'm Eve, your event bestie! No cap, I'll help you plan the most fire event ever!",

    south:
      "Namaskaram! I am Eve, your trusted event planning companion. How may I serve you today?",

    dilli:
      "Arre hello! Main hun Eve. Sun, aaj tu sahi jagah aya hai — main tera event perfect bana dungi!",
  },

  hi: {
    friendly:
      "नमस्ते! मैं Eve हूं, आपकी personal event planner। आपके event को perfect बनाने में मदद के लिए यहाँ हूं!",

    formal:
      "नमस्ते। मैं EveBuddy हूं, आपका professional assistant। आज मैं आपकी कैसे सहायता कर सकती हूं?",

    punjabi:
      "सत श्री अकाल जी! मैं हूं Eve — आपकी event planner! चलिए शुरू करते हैं!",

    genz:
      "यार, हेलो! मैं Eve हूं! तेरा event super lit बनाऊंगी!",

    south:
      "नमस्ते! मैं Eve हूं, आपकी विश्वसनीय event planning companion।",

    dilli:
      "अरे हेलो! मैं Eve हूं। सुन, आज तू सही जगह आई है — मैं तेरा event perfect बना दूंगी!",
  },

  pa: {
    friendly:
      "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ Eve ਹਾਂ, ਤੁਹਾਡੀ personal event planner। ਤੁਹਾਡੇ event ਨੂੰ perfect ਬਣਾਉਣ ਲਈ ਹਾਜ਼ਰ ਹਾਂ!",

    formal:
      "ਸਤ ਸ੍ਰੀ ਅਕਾਲ। ਮੈਂ EveBuddy ਹਾਂ, ਤੁਹਾਡੀ professional event planning assistant।",

    punjabi:
      "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ! ਮੈਂ ਹਾਂ Eve — ਆਪਦਾ event planner! ਚਲੋ ਸ਼ੁਰੂ ਕਰਦੇ ਹਾਂ!",

    genz:
      "ਯਾਰ ਹੈਲੋ! ਮੈਂ Eve ਹਾਂ! ਤੇਰਾ event super lit ਬਣਾਵਾਂਗੀ!",

    south:
      "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ Eve ਹਾਂ, ਤੁਹਾਡੀ ਭਰੋਸੇਮੰਦ companion।",

    dilli:
      "ਅਰੇ ਹੈਲੋ! ਮੈਂ Eve ਹਾਂ। ਸੁਣ, ਅੱਜ ਤੂੰ ਸਹੀ ਜਗ੍ਹਾ ਆਈ ਹੈਂ!",
  },

  ta: {
    friendly:
      "வணக்கம்! நான் Eve, உங்கள் personal event planner. உங்கள் நிகழ்வை சிறப்பாக திட்டமிட மகிழ்ச்சியாக இருக்கிறேன்!",

    formal:
      "வணக்கம். நான் EveBuddy, உங்கள் professional event planning assistant. இன்று எப்படி உதவலாம்?",

    punjabi:
      "வணக்கம்! நான் Eve — உங்கள் event planner! ஆரம்பிக்கலாம்!",

    genz:
      "ஹேய்! நான் Eve, உங்கள் event bestie! சூப்பர் event plan பண்ணுவோம்!",

    south:
      "நமஸ்காரம்! நான் Eve, உங்கள் நம்பகமான event planning companion. இன்று எப்படி சேவை செய்யலாம்?",

    dilli:
      "வணக்கம்! நான் Eve. சரியான இடத்திற்கு வந்திருக்கீங்க — உங்கள் event perfect ஆக செய்வேன்!",
  },
};

const getGreeting = (
  lang: string,
  personality: string
) =>
  greetings[lang]?.[personality] ??
  greetings.en[personality] ??
  greetings.en.friendly;

/* =========================================================
   COMPONENT
========================================================= */

export const EveBuddyAvatar = ({
  isOpen,
  onClose,
  onOpenChat,
}: AvatarProps) => {
  const [language, setLanguage] = useState("en");
  const [personality, setPersonality] = useState("friendly");
  const [gender, setGender] = useState("female");
  const [muted, setMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const [waveAmps, setWaveAmps] = useState([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]);

  const waveRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const voicesRef =
    useRef<SpeechSynthesisVoice[]>([]);

  const greeting = getGreeting(
    language,
    personality
  );

  const selPers = personalities.find(
    (p) => p.id === personality
  );

  const selGender = genderOptions.find(
    (g) => g.id === gender
  );

  /* =========================================================
     LOAD VOICES
  ========================================================= */

  useEffect(() => {
    const load = () => {
      voicesRef.current =
        window.speechSynthesis?.getVoices() ?? [];
    };

    load();

    window.speechSynthesis?.addEventListener(
      "voiceschanged",
      load
    );

    return () =>
      window.speechSynthesis?.removeEventListener(
        "voiceschanged",
        load
      );
  }, []);

  /* =========================================================
     STOP SPEECH
  ========================================================= */

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();

    if (waveRef.current) {
      clearInterval(waveRef.current);
      waveRef.current = null;
    }

    setSpeaking(false);

    setWaveAmps([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);
  }, []);

  /* =========================================================
     SPEAK
  ========================================================= */

  const speak = useCallback(
    (text?: string) => {
      if (
        muted ||
        !window.speechSynthesis
      ) {
        return;
      }

      stopSpeech();

      const langCfg =
        languages.find(
          (l) => l.code === language
        ) ?? languages[0];

      const genderCfg =
        genderOptions.find(
          (g) => g.id === gender
        ) ?? genderOptions[0];

      const utterance =
        new SpeechSynthesisUtterance(
          text ?? greeting
        );

      utterance.lang =
        langCfg.speechLang;

      utterance.pitch =
        genderCfg.pitch;

      utterance.rate =
        genderCfg.rate;

      utterance.volume = 1;

      const voices =
        voicesRef.current;

      if (voices.length > 0) {
        const langBase =
          langCfg.speechLang.split("-")[0];

        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith(langBase) &&
              (gender === "female"
                ? /female|woman|girl/i.test(
                    v.name
                  )
                : gender === "male"
                  ? /male|man|boy/i.test(
                      v.name
                    )
                  : true)
          ) ??
          voices.find((v) =>
            v.lang.startsWith(langBase)
          ) ??
          voices.find((v) =>
            v.lang.startsWith("en")
          ) ??
          voices[0];

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

      utterance.onend =
        stopSpeech;

      utterance.onerror =
        stopSpeech;

      window.speechSynthesis.speak(
        utterance
      );
    },
    [
      greeting,
      language,
      gender,
      muted,
      stopSpeech,
    ]
  );

  /* =========================================================
     AUTO SPEAK
  ========================================================= */

  useEffect(() => {
    if (
      isOpen &&
      !showSettings &&
      !muted
    ) {
      const t = setTimeout(
        speak,
        700
      );

      return () =>
        clearTimeout(t);
    }

    if (!isOpen) {
      stopSpeech();
    }

    return undefined;
  }, [
    isOpen,
    showSettings,
    muted,
    speak,
    stopSpeech,
  ]);

  useEffect(() => {
    if (muted) {
      stopSpeech();
    }
  }, [muted, stopSpeech]);

  useEffect(() => {
    return () =>
      stopSpeech();
  }, [stopSpeech]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: 20,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 24,
          }}
          className="
            fixed
            bottom-24
            left-4
            w-[350px]
            max-w-[calc(100vw-2rem)]
            bg-[#090909]
            border
            border-gold/30
            rounded-[28px]
            shadow-2xl
            z-50
            overflow-hidden
          "
          style={{
            boxShadow:
              "0 0 60px rgba(212,175,55,0.16)",
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              relative
              bg-gradient-to-r
              from-[#18140a]
              via-[#0d0d0d]
              to-[#080808]
              border-b
              border-gold/20
              px-4
              py-3
              flex
              items-center
              justify-between
            "
          >

            <div className="flex items-center gap-3">

              {/* Small Eve Image */}

              <motion.div
                className="
                  w-10
                  h-10
                  rounded-full
                  overflow-hidden
                  border
                  border-gold/50
                  bg-black
                  flex
                  items-center
                  justify-center
                  shadow-[0_0_18px_rgba(212,175,55,0.15)]
                "
                animate={
                  speaking
                    ? {
                        scale: [
                          1,
                          1.08,
                          1,
                        ],
                      }
                    : {
                        scale: 1,
                      }
                }
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                }}
              >
                <img
                  src={eveAvatar}
                  alt="Eve AI"
                  className="
                    w-full
                    h-full
                    object-contain
                  "
                />
              </motion.div>

              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm text-gold">
                    Eve — AI Avatar
                  </p>

                  <Sparkles
                    className="
                      w-3
                      h-3
                      text-gold
                    "
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {selPers?.label}
                  {" · "}
                  {selGender?.label}
                </p>
              </div>
            </div>

            {/* HEADER ACTIONS */}

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  setMuted(!muted)
                }
                title={
                  muted
                    ? "Unmute voice"
                    : "Mute voice"
                }
                className={`
                  transition-colors
                  ${
                    muted
                      ? "text-crimson"
                      : "text-muted-foreground hover:text-gold"
                  }
                `}
              >
                {muted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => {
                  stopSpeech();
                  setShowSettings(
                    !showSettings
                  );
                }}
                className="
                  text-muted-foreground
                  hover:text-gold
                  transition-colors
                "
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  stopSpeech();
                  onClose();
                }}
                className="
                  text-muted-foreground
                  hover:text-white
                  transition-colors
                "
              >
                <X className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <AnimatePresence mode="wait">

            {showSettings ? (

              /* =================================================
                 SETTINGS
              ================================================= */

              <motion.div
                key="settings"
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                }}
                className="
                  p-4
                  space-y-5
                  max-h-[500px]
                  overflow-y-auto
                "
              >

                {/* LANGUAGE */}

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-muted-foreground
                      uppercase
                      tracking-wider
                      mb-2
                    "
                  >
                    Language / भाषा
                  </p>

                  <div className="grid grid-cols-4 gap-1.5">

                    {languages.map(
                      (lang) => (
                        <button
                          key={lang.code}
                          onClick={() =>
                            setLanguage(
                              lang.code
                            )
                          }
                          className={`
                            flex
                            flex-col
                            items-center
                            gap-0.5
                            p-2
                            rounded-xl
                            border
                            text-xs
                            transition-all

                            ${
                              language ===
                              lang.code
                                ? "bg-gold/20 border-gold text-gold"
                                : "border-border hover:border-gold/30"
                            }
                          `}
                        >
                          <span className="text-lg">
                            {lang.flag}
                          </span>

                          <span className="text-[9px] leading-tight text-center">
                            {lang.label}
                          </span>
                        </button>
                      )
                    )}

                  </div>
                </div>

                {/* PERSONALITY */}

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-muted-foreground
                      uppercase
                      tracking-wider
                      mb-2
                    "
                  >
                    Personality
                  </p>

                  <div className="space-y-1.5">

                    {personalities.map(
                      (p) => (
                        <button
                          key={p.id}
                          onClick={() =>
                            setPersonality(
                              p.id
                            )
                          }
                          className={`
                            w-full
                            flex
                            items-center
                            gap-2.5
                            p-2.5
                            rounded-xl
                            border
                            text-xs
                            transition-all

                            ${
                              personality ===
                              p.id
                                ? "bg-gold/20 border-gold"
                                : "border-border hover:border-gold/30"
                            }
                          `}
                        >

                          <span className="text-base">
                            {p.emoji}
                          </span>

                          <div className="text-left">

                            <p className="font-semibold leading-tight">
                              {p.label}
                            </p>

                            <p className="text-muted-foreground leading-tight text-[10px]">
                              {p.desc}
                            </p>

                          </div>

                        </button>
                      )
                    )}

                  </div>
                </div>

                {/* VOICE */}

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-muted-foreground
                      uppercase
                      tracking-wider
                      mb-2
                    "
                  >
                    Voice & Presentation
                  </p>

                  <div className="grid grid-cols-3 gap-2">

                    {genderOptions.map(
                      (g) => (
                        <button
                          key={g.id}
                          onClick={() =>
                            setGender(
                              g.id
                            )
                          }
                          className={`
                            flex
                            flex-col
                            items-center
                            gap-1.5
                            p-2
                            rounded-xl
                            border
                            transition-all

                            ${
                              gender === g.id
                                ? "bg-gold/20 border-gold"
                                : "border-border hover:border-gold/30"
                            }
                          `}
                        >

                          <div className="
                            w-12
                            h-12
                            rounded-full
                            overflow-hidden
                            border
                            border-gold/30
                            bg-black
                          ">
                            <img
                              src={
                                g.id ===
                                "female"
                                  ? eveAvatar
                                  : g.id ===
                                      "male"
                                    ? evePresenting
                                    : eveThinking
                              }
                              alt={g.label}
                              className="
                                w-full
                                h-full
                                object-contain
                              "
                            />
                          </div>

                          <span className="font-medium text-xs">
                            {g.label}
                          </span>

                          <span className="text-[9px] text-muted-foreground">
                            {g.pitch > 1
                              ? "High pitch"
                              : g.pitch < 1
                                ? "Low pitch"
                                : "Neutral"}
                          </span>

                        </button>
                      )
                    )}

                  </div>
                </div>

                {/* SAVE */}

                <Button
                  onClick={() => {
                    setShowSettings(false);

                    setTimeout(
                      speak,
                      500
                    );
                  }}
                  className="
                    w-full
                    bg-gold
                    hover:bg-gold-dark
                    text-background
                    text-xs
                    font-semibold
                    shadow-[0_0_20px_rgba(212,175,55,0.2)]
                  "
                >
                  <Mic className="w-3.5 h-3.5 mr-2" />
                  Save & Hear Eve Speak
                </Button>

              </motion.div>

            ) : (

              /* =================================================
                 MAIN AVATAR SCREEN
              ================================================= */

              <motion.div
                key="main"
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 20,
                }}
                className="p-5"
              >

                {/* =================================================
                    EVE CHARACTER
                ================================================= */}

                <div className="flex justify-center mb-3">

                  <div className="relative">

                    {/* Outer glow */}

                    <motion.div
                      animate={
                        speaking
                          ? {
                              opacity: [
                                0.4,
                                0.8,
                                0.4,
                              ],
                              scale: [
                                1,
                                1.06,
                                1,
                              ],
                            }
                          : {
                              opacity: 0.4,
                              scale: 1,
                            }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 1.4,
                      }}
                      className="
                        absolute
                        inset-[-10px]
                        rounded-full
                        bg-gold/10
                        blur-xl
                      "
                    />

                    {/* Main Eve */}

                    <motion.div
                      animate={
                        speaking
                          ? {
                              scale: [
                                1,
                                1.025,
                                0.99,
                                1,
                              ],
                            }
                          : {
                              scale: 1,
                            }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 0.7,
                      }}
                      className="
                        relative
                        w-40
                        h-40
                        rounded-full
                        overflow-hidden
                        border-2
                        border-gold/60
                        bg-black
                        flex
                        items-center
                        justify-center
                      "
                      style={{
                        boxShadow:
                          speaking
                            ? "0 0 40px rgba(212,175,55,0.55)"
                            : "0 0 25px rgba(212,175,55,0.18)",
                      }}
                    >

                      <img
                        src={eveAvatar}
                        alt="Eve AI Event Planner"
                        className="
                          w-full
                          h-full
                          object-contain
                        "
                      />

                    </motion.div>

                    {/* SPEAKING RINGS */}

                    {speaking && (
                      <>
                        <motion.div
                          animate={{
                            scale: [
                              1,
                              1.35,
                              1,
                            ],
                            opacity: [
                              0.5,
                              0,
                              0.5,
                            ],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.1,
                          }}
                          className="
                            absolute
                            inset-0
                            rounded-full
                            border-2
                            border-gold/40
                            pointer-events-none
                          "
                        />

                        <motion.div
                          animate={{
                            scale: [
                              1,
                              1.65,
                              1,
                            ],
                            opacity: [
                              0.25,
                              0,
                              0.25,
                            ],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.1,
                            delay: 0.35,
                          }}
                          className="
                            absolute
                            inset-0
                            rounded-full
                            border
                            border-gold/20
                            pointer-events-none
                          "
                        />
                      </>
                    )}

                  </div>
                </div>

                {/* =================================================
                    EVE NAME
                ================================================= */}

                <div className="text-center mb-3">

                  <div className="
                    flex
                    items-center
                    justify-center
                    gap-1.5
                  ">

                    <h2 className="
                      text-lg
                      font-serif
                      font-bold
                      text-gradient-gold
                    ">
                      Eve
                    </h2>

                    <Sparkles
                      className="
                        w-4
                        h-4
                        text-gold
                      "
                    />

                  </div>

                  <p className="
                    text-[10px]
                    text-muted-foreground
                    uppercase
                    tracking-[0.25em]
                  ">
                    AI Event Planner
                  </p>

                </div>

                {/* =================================================
                    WAVEFORM
                ================================================= */}

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-1
                    h-9
                    mb-3
                  "
                >

                  {waveAmps.map(
                    (amp, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scaleY:
                            speaking
                              ? amp
                              : 0.15,
                        }}
                        transition={{
                          duration: 0.08,
                        }}
                        className={`
                          w-1.5
                          rounded-full
                          origin-center

                          ${
                            speaking
                              ? "bg-gold"
                              : "bg-muted-foreground/30"
                          }
                        `}
                        style={{
                          height: 32,
                        }}
                      />
                    )
                  )}

                  {speaking && (
                    <span className="
                      text-[10px]
                      text-gold
                      ml-2
                      animate-pulse
                    ">
                      Speaking…
                    </span>
                  )}

                </div>

                {/* =================================================
                    SPEECH BUBBLE
                ================================================= */}

                <div className="
                  bg-gradient-to-br
                  from-white/[0.06]
                  to-white/[0.02]
                  border
                  border-gold/15
                  rounded-2xl
                  rounded-tl-sm
                  p-4
                  mb-4
                  relative
                ">

                  <div
                    className="
                      absolute
                      -top-1.5
                      left-4
                      w-3
                      h-3
                      bg-[#111]
                      border-l
                      border-t
                      border-gold/15
                      rotate-45
                    "
                  />

                  <p className="
                    text-xs
                    text-foreground
                    leading-relaxed
                  ">
                    {greeting}
                  </p>

                  <p className="
                    text-[10px]
                    text-muted-foreground
                    mt-2
                  ">
                    {selPers?.emoji}{" "}
                    {selPers?.desc}
                  </p>

                </div>

                {/* =================================================
                    PRIMARY ACTION
                ================================================= */}

                <Button
                  onClick={() => {
                    stopSpeech();
                    onOpenChat();
                    onClose();
                  }}
                  className="
                    w-full
                    bg-gradient-to-r
                    from-gold
                    via-gold-light
                    to-gold-dark
                    hover:brightness-110
                    text-background
                    text-xs
                    font-bold
                    h-10
                    rounded-xl
                    shadow-[0_0_25px_rgba(212,175,55,0.22)]
                  "
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Planning with Eve
                </Button>

                {/* =================================================
                    SECONDARY ACTIONS
                ================================================= */}

                <div className="
                  flex
                  gap-2
                  mt-2
                ">

                  <button
                    onClick={
                      speaking
                        ? stopSpeech
                        : () => speak()
                    }
                    disabled={muted}
                    className={`
                      flex-1
                      text-xs
                      py-2.5
                      rounded-xl
                      border
                      transition-all

                      ${
                        speaking
                          ? "border-gold/60 text-gold bg-gold/10"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-gold/30"
                      }

                      ${
                        muted
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }
                    `}
                  >
                    {muted
                      ? "🔇 Voice muted"
                      : speaking
                        ? "⏹ Stop speaking"
                        : "🔊 Hear Eve speak"}
                  </button>

                  <button
                    onClick={() =>
                      setMuted(!muted)
                    }
                    className={`
                      px-3
                      py-2
                      rounded-xl
                      border
                      text-xs
                      transition-colors

                      ${
                        muted
                          ? "border-crimson/40 text-crimson bg-crimson/10"
                          : "border-border text-muted-foreground hover:border-gold/30 hover:text-gold"
                      }
                    `}
                  >
                    {muted ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="
                  flex
                  items-center
                  justify-between
                  mt-4
                  pt-3
                  border-t
                  border-border/50
                ">

                  <p className="
                    text-[9px]
                    text-muted-foreground
                  ">
                    Language:{" "}
                    {
                      languages.find(
                        (l) =>
                          l.code ===
                          language
                      )?.flag
                    }{" "}
                    {
                      languages.find(
                        (l) =>
                          l.code ===
                          language
                      )?.label
                    }
                  </p>

                  <button
                    onClick={() => {
                      stopSpeech();
                      setShowSettings(
                        true
                      );
                    }}
                    className="
                      text-[9px]
                      text-gold
                      hover:underline
                    "
                  >
                    Change settings
                  </button>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};