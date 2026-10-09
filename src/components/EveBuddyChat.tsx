import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Mic,
  Send,
  Sparkles,
  X,
} from "lucide-react";

// ============================================================
// EVE BUDDY IMAGES
// ============================================================

import eveAvatar from "@/assets/eveBuddy/eve-avatar-new.png";
import eveCelebrating from "@/assets/eveBuddy/eve-celebrating.jpg";
import eveListening from "@/assets/eveBuddy/eve-listening.jpg";
import evePresenting from "@/assets/eveBuddy/eve-presenting.jpg";
import eveRecommendation from "@/assets/eveBuddy/eve-recommendation.jpg";
import eveStanding from "@/assets/eveBuddy/eve-standing.jpg";
import eveThinking from "@/assets/eveBuddy/eve-thinking.jpg";
import eveWaving from "@/assets/eveBuddy/eve-waving.jpg";
import eveWedding from "@/assets/eveBuddy/eve-wedding.jpg";

// ============================================================
// TYPES
// ============================================================

interface EveBuddyChatProps {
  isOpen: boolean;
  onClose: () => void;
}

type EventType =
  | "Wedding"
  | "Birthday Party"
  | "Corporate Event"
  | "Concert / Show"
  | null;

type Step =
  | "event"
  | "wedding-services"
  | "details"
  | "location"
  | "date"
  | "budget"
  | "recommendations"
  | "complete";

// ============================================================
// EVENT DATA
// ============================================================

const eventTypes = [
  {
    name: "Wedding" as const,
    icon: "💍",
    image: eveWedding,
    description: "Find vendors for your big day",
  },
  {
    name: "Corporate Event" as const,
    icon: "🏢",
    image: evePresenting,
    description: "Conferences & product launches",
  },
  {
    name: "Birthday Party" as const,
    icon: "🎉",
    image: eveCelebrating,
    description: "Make your celebration special",
  },
  {
    name: "Concert / Show" as const,
    icon: "🎤",
    image: evePresenting,
    description: "Shows, artists & entertainment",
  },
];

const weddingOptions = [
  "Theme-Based Weddings",
  "Culture-Based Weddings",
  "Pre-Wedding Ceremonies",
  "Photography & Video",
  "Décor & Florals",
  "Catering & Food",
  "Bridal & Grooming",
  "Entertainment & Artists",
  "Venue & Logistics",
  "Priest & Rituals",
  "Invitations & Stationery",
  "Special Effects",
];


// ============================================================
// MAIN COMPONENT
// ============================================================

export const EveBuddyChat = ({
  isOpen,
  onClose,
}: EveBuddyChatProps) => {
  const [step, setStep] = useState<Step>("event");
  const [eventType, setEventType] = useState<EventType>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    null
  );
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showAllEvents, setShowAllEvents] = useState(false);

  // ==========================================================
  // EVE IMAGE
  // ==========================================================

  const eveImage = useMemo(() => {
    switch (step) {
      case "event":
        return eveWaving;

      case "details":
        return eventType === "Wedding"
          ? eveWedding
          : eveListening;

      case "location":
        return eveThinking;

      case "date":
        return evePresenting;

      case "recommendations":
        return eveRecommendation;

      case "complete":
        return eveCelebrating;

      default:
        return eveStanding;
    }
  }, [step, eventType]);

  // ==========================================================
  // RESET
  // ==========================================================

  const resetPlanner = () => {
    setStep("event");
    setEventType(null);
    setSelectedOption(null);
    setCity("");
    setDate("");
    setBudget("");
    setMessage("");
    setShowAllEvents(false);
  };

  // ==========================================================
  // EVENT
  // ==========================================================

  const handleEventSelect = (event: EventType) => {
    setEventType(event);
    setSelectedOption(null);
    setStep("details");
  };

  // ==========================================================
  // SERVICE
  // ==========================================================

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);

    setTimeout(() => {
      setStep("location");
    }, 180);
  };

  // ==========================================================
  // LOCATION
  // ==========================================================

  const handleLocationNext = () => {
    if (!city.trim()) return;

    setStep("date");
  };

  // ==========================================================
  // DATE
  // ==========================================================

  const handleDateNext = () => {
    if (!date) return;

    setStep("budget");
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    if (step === "details") {
      setEventType(null);
      setStep("event");
      return;
    }

    if (step === "location") {
      setSelectedOption(null);
      setStep("details");
      return;
    }

    if (step === "date") {
      setStep("location");
      return;
    }

    if (step === "budget") {
      setStep("date");
      return;
    }

    if (step === "recommendations") {
      setStep("budget");
      return;
    }
  };

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  
    const handleSendMessage = async () => {
      const userMessage = message.trim();

      if (!userMessage || isAiLoading) return;

      const text = userMessage.toLowerCase();

      // Preserve the existing event-selection shortcuts.
      if (
        text.includes("wedding") ||
        text.includes("marriage")
      ) {
        setEventType("Wedding");
        setStep("details");
        setMessage("");
        return;
      }

      if (text.includes("birthday")) {
        setEventType("Birthday Party");
        setStep("details");
        setMessage("");
        return;
      }

      if (
        text.includes("corporate") ||
        text.includes("conference")
      ) {
        setEventType("Corporate Event");
        setStep("details");
        setMessage("");
        return;
      }

      setMessage("");
      setAiError("");
      setAiReply("");
      setIsAiLoading(true);

      try {
        const response = await fetch("http://localhost:3001/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Eve couldn't respond.");
        }

        setAiReply(data.reply || "Please try asking me again.");
      } catch (error) {
        console.error("EveBuddy chat error:", error);

        setAiError(
          error instanceof Error
            ? error.message
            : "Unable to connect to EveBuddy."
        );
      } finally {
        setIsAiLoading(false);
      }
    };

  // ==========================================================
  // PANEL
  // ==========================================================

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ==================================================
              SOFT PAGE OVERLAY
              IMPORTANT: NO BACKDROP BLUR
          ================================================== */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="
              fixed
              inset-0
              z-[80]
              bg-black/15
            "
          />

          {/* ==================================================
              EVE BUDDY PANEL
          ================================================== */}

          <motion.aside
            initial={{
              opacity: 0,
              x: 70,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: 70,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            // size of panel
            onClick={(e) => e.stopPropagation()}
            className="
  fixed
  right-5
  top-[400px]
  bottom-[40px]
  z-[90]

  w-[25vw]
  max-w-[600px]
  min-w-[800px]

  overflow-hidden

  rounded-[26px]

  border
  border-[#d4af37]/45

  bg-[#0b0d11]/[0.97]

  shadow-[0_20px_80px_rgba(0,0,0,0.65)]
  shadow-[0_0_45px_rgba(212,175,55,0.08)]

  flex
  flex-col
"
          >
            {/* ==================================================
                GOLD TOP GLOW
            ================================================== */}

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[1px]
                bg-gradient-to-r
                from-transparent
                via-[#d4af37]
                to-transparent
                opacity-90
              "
            />

            {/* ==================================================
                HEADER
            ================================================== */}

            <header
              className="
                relative
                shrink-0
                h-[120px]

                px-5

                flex
                items-center
                justify-between

                border-b
                border-white/[0.07]

                bg-gradient-to-r
                from-[#17130a]
                via-[#241d0c]
                to-[#111318]
              "
            >
                              
                <div className="flex items-center gap-3">
                  {/* Avatar with floating online indicator */}
                  <div className="relative w-22 h-22 shrink-0">
                    <div
                      className="
                        relative
                        w-full
                        h-full
                        rounded-full
                        overflow-hidden
                        border
                        border-[#d4af37]/70
                        bg-[#090a0c]
                        shadow-[0_0_20px_rgba(212,175,55,0.18)]
                      "
                    >
                      <img
                        src={eveAvatar}
                        alt="EveBuddy AI"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Green dot floating above the gold border */}
                    <span
                      className="
                        absolute
                        -top-1
                        -right-1.5
                        z-[100]
                        w-3
                        h-3
                        rounded-full
                        bg-emerald-400
                        border-2
                        border-[#15120c]
                        shadow-[0_0_10px_rgba(52,211,153,0.75)]
                      "
                    />
                  </div>

                  {/* Assistant title */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-display text-[17px] font-bold text-white">
                        EveBuddy AI
                      </h2>

                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    </div>

                    <p className="text-[10px] text-[#d4af37] tracking-wide">
                      Your Personal Event Planner
                    </p>
                  </div>
                </div>
              

              {/* RIGHT */}
              <div className="flex items-center gap-1">
                <button
                  onClick={resetPlanner}
                  title="Restart"
                  className="
                    hidden
                    sm:flex
                    items-center
                    justify-center
                    w-8
                    h-8
                    rounded-full
                    text-white/50
                    hover:text-[#d4af37]
                    hover:bg-white/[0.05]
                    transition
                  "
                >
                  ↻
                </button>

                <button
                  onClick={onClose}
                  className="
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white/60
                    hover:text-white
                    hover:bg-white/[0.06]
                    transition
                  "
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>
            </header>

            {/* ==================================================
                BODY
            ================================================== */}

            <main
              className="
                relative
                flex-1
                min-h-0
                overflow-y-auto
                overflow-x-hidden

                scrollbar-thin
                scrollbar-thumb-[#d4af37]/20
                scrollbar-track-transparent
              "
            >
              <AnimatePresence mode="wait">

                {/* =================================================
                    EVENT SCREEN
                ================================================= */}

                {step === "event" && (
                  <motion.div
                    key="event"
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -12,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="p-5"
                  >
                    {/* Eve introduction */}
                    <div className="relative min-h-[150px]">

  {/* ==================================================
      EVE AVATAR
  ================================================== */}

  <motion.div
    initial={{
      opacity: 0,
      scale: 0.9,
      x: -10,
    }}
    animate={{
      opacity: 1,
      scale: 1,
      x: 0,
    }}
    transition={{
      duration: 0.35,
    }}
    className="
      absolute
      left-0
      top-0

      w-[64px]
      h-[76px]

      flex
      items-end
      justify-center
    "
  >
    <div
      className="
        w-[60px]
        h-[60px]

        rounded-full
        overflow-hidden

        border
        border-[#d4af37]/45

        bg-[#111318]

        shadow-[0_0_30px_rgba(212,175,55,0.18)]
      "
    >
      <img
        src={eveAvatar}
        alt="Eve Buddy"
        className="
          w-full
          h-full
          object-cover
        "
      />
    </div>

    {/* online indicator */}
    {/* <span
      className="
        absolute
        right-[1px]
        bottom-[15px]

        w-3
        h-3

        rounded-full

        bg-emerald-400

        border-2
        border-[#0d0f13]

        shadow-[0_0_8px_rgba(52,211,153,0.5)]
      "
    /> */}
  </motion.div>

  {/* ==================================================
      GREETING
  ================================================== */}

  <motion.div
    initial={{
      opacity: 0,
      y: 8,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    transition={{
      delay: 0.12,
      duration: 0.3,
    }}
    className="
      ml-[68px]
      pt-1
    "
  >
    <div
      className="
        relative

        rounded-[18px]
        rounded-bl-[5px]

        bg-gradient-to-br
        from-[#1d2026]
        to-[#15181d]

        border-b
        border-[#d4af37]/15

        px-4
        py-3

        shadow-[0_8px_25px_rgba(0,0,0,0.25)]
      "
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="
            text-[10px]
            uppercase
            tracking-[0.16em]
            text-[#d4af37]
            font-semibold
          "
        >
          EveBuddy AI
        </span>

        <Sparkles className="w-3 h-3 text-[#d4af37]" />
      </div>

      <p
        className="
          text-[12px]
          leading-[1.5]
          text-white/85
        "
      >
        Hi there! 👋
        <br />
        I'm your personal event planner.
      </p>
    </div>
  </motion.div>

</div>

                    {/* heading */}
                    <div className="mt-1 mb-4">
                      <h3
                        className="
                          font-display
                          text-[19px]
                          font-bold
                          text-white
                          tracking-[-0.01em]
                        "
                      >
                        How can I help you today?
                      </h3>

                      <p
                        className="
                          text-[10px]
                          text-white/45
                          mt-1
                        "
                      >
                        Choose an event and I'll help you plan it.
                      </p>
                    </div>

                    {/* event cards */}
                    <div className="space-y-2.5">
                      {(showAllEvents
                        ? eventTypes
                        : eventTypes.slice(0, 4)
                      ).map((event, index) => (
                        <motion.button
                          key={event.name}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: 0.08 + index * 0.04,
                          }}
                          whileHover={{
                            x: 3,
                          }}
                          whileTap={{
                            scale: 0.985,
                          }}
                          onClick={() =>
                            handleEventSelect(event.name)
                          }
                          className="
                            group
                            relative
                            w-full

                            min-h-[62px]

                            overflow-hidden

                            rounded-[14px]

                            border
                            border-white/[0.08]
                            hover:border-[#d4af37]/45

                            bg-gradient-to-r
                            from-[#17191e]
                            to-[#111318]

                            hover:border-[#d4af37]/65

                            hover:bg-[#1c1a14]

                            transition-all
                          "
                        >
                          {/* gold hover line */}
                          <span
                            className="
                              absolute
                              left-0
                              top-0
                              bottom-0
                              w-[2px]

                              bg-[#d4af37]

                              scale-y-0
                              group-hover:scale-y-100

                              transition-transform
                              origin-center
                            "
                          />

                          <div
                            className="
                              relative
                              flex
                              items-center
                              gap-3
                              px-4
                              py-3
                            "
                          >
                            {/* icon */}
                            <div
                              className="
                                w-10
                                h-10
                                shrink-0

                                rounded-xl

                                bg-[#d4af37]/[0.08]

                                border
                                border-[#d4af37]/20

                                flex
                                items-center
                                justify-center

                                text-xl
                              "
                            >
                              {event.icon}
                            </div>

                            {/* text */}
                            <div className="flex-1 text-left">
                              <p
                                className="
                                  text-[13px]
                                  font-semibold
                                  text-white
                                "
                              >
                                {event.name}
                              </p>

                              <p
                                className="
                                  text-[10px]
                                  text-white/40
                                  mt-0.5
                                "
                              >
                                {event.description}
                              </p>
                            </div>

                            <ChevronRight
                              className="
                                w-4
                                h-4

                                text-[#d4af37]/70

                                group-hover:text-[#d4af37]
                                group-hover:translate-x-1

                                transition
                              "
                            />
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Browse all */}
                    <button
                      onClick={() =>
                        setShowAllEvents(!showAllEvents)
                      }
                      className="
                        w-full
                        mt-3
                        h-10

                        rounded-xl

                        bg-gradient-to-r
                        from-[#d4af37]
                        to-[#e5c45a]

                        text-[#111]

                        text-[11px]
                        font-bold

                        hover:brightness-110

                        transition

                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >
                      {showAllEvents
                        ? "Show Featured Events"
                        : "Browse All 20 Event Types"}

                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* =================================================
                    DETAILS
                ================================================= */}

                {step === "details" && (
                  <motion.div
                    key="details"
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
                    className="p-5"
                  >
                    <BackButton onClick={handleBack} />

                    <CompactEveHeader
                      image={eveImage}
                      title={
                        eventType === "Wedding"
                          ? "Let's plan your wedding ✨"
                          : `Let's plan your ${eventType}`
                      }
                      subtitle={
                        eventType === "Wedding"
                          ? "What kind of wedding service are you looking for?"
                          : "Tell me what you need and I'll help you find the right vendors."
                      }
                    />

                    {eventType === "Wedding" ? (
                      <div className="mt-5 space-y-2">
                        {weddingOptions.map((option) => (
                          <motion.button
                            key={option}
                            whileHover={{
                              x: 2,
                            }}
                            whileTap={{
                              scale: 0.99,
                            }}
                            onClick={() =>
                              handleOptionSelect(option)
                            }
                            className="
                              group
                              w-full
                              min-h-[43px]
                              px-4

                              rounded-xl

                              border
                              border-white/[0.07]

                              bg-[#181b20]

                              hover:border-[#d4af37]/45
                              hover:bg-[#d4af37]/[0.05]

                              transition

                              flex
                              items-center
                              justify-between

                              text-left
                            "
                          >
                            <span
                              className="
                                text-[11px]
                                font-medium
                                text-white/85
                              "
                            >
                              {option}
                            </span>

                            <ChevronRight
                              className="
                                w-3.5
                                h-3.5
                                text-[#d4af37]/60
                                group-hover:text-[#d4af37]
                                transition
                              "
                            />
                          </motion.button>
                        ))}

                        <button
                          onClick={() => setStep("location")}
                          className="
                            w-full
                            mt-3
                            h-10

                            rounded-xl

                            border
                            border-dashed
                            border-white/20

                            text-[11px]
                            text-white/40

                            hover:border-[#d4af37]/40
                            hover:text-[#d4af37]

                            transition
                          "
                        >
                          Skip — I'll specify later
                        </button>
                      </div>
                    ) : (
                      <div className="mt-5">
                        <button
                          onClick={() =>
                            handleOptionSelect(
                              "General Event Planning"
                            )
                          }
                          className="
                            w-full
                            p-4
                            rounded-xl
                            border
                            border-white/[0.07]
                            bg-[#181b20]
                            hover:border-[#d4af37]/50
                            transition
                            text-left
                          "
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              General Event Planning
                            </span>

                            <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                          </div>

                          <p className="text-[11px] text-white/40 mt-1">
                            Help me find vendors for my event
                          </p>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* =================================================
                    LOCATION
                ================================================= */}

                {step === "location" && (
                  <motion.div
                    key="location"
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
                    className="p-5"
                  >
                    <BackButton onClick={handleBack} />

                    <CompactEveHeader
                      image={eveThinking}
                      title="Where is your event?"
                      subtitle="I'll use your city to find relevant verified vendors near you."
                    />

                    <div className="mt-7">
                      <label
                        className="
                          text-[10px]
                          uppercase
                          tracking-[0.18em]
                          text-white/40
                        "
                      >
                        Event City
                      </label>

                      <div
                        className="
                          mt-2
                          flex
                          items-center
                          gap-2

                          h-12
                          px-4

                          rounded-xl

                          border
                          border-white/10

                          bg-[#181b20]

                          focus-within:border-[#d4af37]/60
                        "
                      >
                        <MapPin className="w-4 h-4 text-[#d4af37]" />

                        <input
                          value={city}
                          onChange={(e) =>
                            setCity(e.target.value)
                          }
                          placeholder="Delhi, Mumbai, Jaipur..."
                          className="
                            flex-1
                            bg-transparent
                            outline-none
                            text-xs
                            text-white
                            placeholder:text-white/25
                          "
                        />
                      </div>

                      <button
                        onClick={handleLocationNext}
                        disabled={!city.trim()}
                        className="
                          w-full
                          mt-4
                          h-11
                          rounded-xl

                          bg-gradient-to-r
                          from-[#d4af37]
                          to-[#e5c45a]

                          text-[#111]
                          font-bold
                          text-xs

                          disabled:opacity-30

                          transition

                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    DATE
                ================================================= */}

                {step === "date" && (
                  <motion.div
                    key="date"
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
                    className="p-5"
                  >
                    <BackButton onClick={handleBack} />

                    <CompactEveHeader
                      image={evePresenting}
                      title="When is your event?"
                      subtitle="Knowing the date helps me find vendors who are available around your event."
                    />

                    <div className="mt-7">
                      <label
                        className="
                          text-[10px]
                          uppercase
                          tracking-[0.18em]
                          text-white/40
                        "
                      >
                        Event Date
                      </label>

                      <div
                        className="
                          mt-2
                          flex
                          items-center
                          gap-2

                          h-12
                          px-4

                          rounded-xl

                          border
                          border-white/10

                          bg-[#181b20]

                          focus-within:border-[#d4af37]/60
                        "
                      >
                        <CalendarDays className="w-4 h-4 text-[#d4af37]" />

                        <input
                          type="date"
                          value={date}
                          onChange={(e) =>
                            setDate(e.target.value)
                          }
                          className="
                            flex-1
                            bg-transparent
                            outline-none
                            text-xs
                            text-white
                          "
                        />
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Clock3 className="w-3.5 h-3.5 text-[#d4af37]" />

                        <span className="text-[10px] text-white/35">
                          You can change this later.
                        </span>
                      </div>

                      <button
                        onClick={handleDateNext}
                        disabled={!date}
                        className="
                          w-full
                          mt-5
                          h-11
                          rounded-xl

                          bg-gradient-to-r
                          from-[#d4af37]
                          to-[#e5c45a]

                          text-[#111]
                          font-bold
                          text-xs

                          disabled:opacity-30

                          transition

                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        Find My Vendors
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    BUDGET
                ================================================= */}

                {step === "budget" && (
                  <motion.div
                    key="budget"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-5"
                  >
                    <BackButton onClick={handleBack} />

                    <CompactEveHeader
                      image={eveThinking}
                      title="What's your budget?"
                      subtitle="This helps me personalise the vendors and options I show you."
                    />

                    <div className="mt-7">
                      <label
                        className="
                          text-[10px]
                          uppercase
                          tracking-[0.18em]
                          text-white/40
                        "
                      >
                        Select your budget
                      </label>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {[
                          "₹1–5 Lakh",
                          "₹5–10 Lakh",
                          "₹10–25 Lakh",
                          "₹25 Lakh+",
                        ].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => {
                              setBudget(amount);
                              setStep("recommendations");
                            }}
                            className="
                              rounded-xl
                              border
                              border-white/[0.08]
                              bg-[#181b20]
                              px-3
                              py-4
                              text-xs
                              font-medium
                              text-white
                              transition
                              hover:border-[#d4af37]/50
                              hover:bg-[#d4af37]/[0.06]
                            "
                          >
                            {amount}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setBudget("Flexible");
                          setStep("recommendations");
                        }}
                        className="
                          w-full
                          mt-3
                          h-10
                          rounded-xl
                          border
                          border-dashed
                          border-white/20
                          text-[11px]
                          text-white/40
                          hover:border-[#d4af37]/40
                          hover:text-[#d4af37]
                          transition
                        "
                      >
                        My budget is flexible
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    RECOMMENDATIONS
                ================================================= */}

                {step === "recommendations" && (
                  <motion.div
                    key="recommendations"
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="p-5"
                  >
                    <CompactEveHeader
                      image={eveRecommendation}
                      title="I've got your plan ✨"
                      subtitle="Here's what I'll use to personalise your vendor recommendations."
                    />

                    <div className="mt-5 space-y-2">
                      <SummaryRow
                        label="Event"
                        value={eventType ?? "Event"}
                      />

                      <SummaryRow
                        label="Service"
                        value={
                          selectedOption ??
                          "General Event Planning"
                        }
                      />

                      <SummaryRow
                        label="City"
                        value={city || "Not specified"}
                      />

                      <SummaryRow
                        label="Date"
                        value={date || "Flexible"}
                      />

                      <SummaryRow
                        label="Budget"
                        value={budget || "Flexible"}
                      />
                    </div>

                    <button
                      onClick={() => setStep("complete")}
                      className="
                        w-full
                        mt-5
                        h-11
                        rounded-xl

                        bg-gradient-to-r
                        from-[#d4af37]
                        to-[#e5c45a]

                        text-[#111]
                        font-bold
                        text-xs

                        hover:brightness-110
                        transition

                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >
                      Show My Recommendations
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* =================================================
                    COMPLETE
                ================================================= */}

                {step === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{
                      opacity: 0,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="p-5"
                  >
                    <CompactEveHeader
                      image={eveCelebrating}
                      title="Let's make it happen 🎉"
                      subtitle="Your event profile is ready. Eve can now help you discover the right vendors."
                    />

                    <div
                      className="
                        mt-6
                        p-4
                        rounded-2xl

                        border
                        border-[#d4af37]/20

                        bg-[#d4af37]/[0.04]
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            w-10
                            h-10
                            rounded-full

                            bg-[#d4af37]/10

                            flex
                            items-center
                            justify-center
                          "
                        >
                          <Sparkles className="w-5 h-5 text-[#d4af37]" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-white">
                            Personalised vendor discovery
                          </p>

                          <p className="text-[10px] text-white/40 mt-1">
                            Based on your event preferences
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={resetPlanner}
                      className="
                        w-full
                        mt-4
                        h-10
                        rounded-xl

                        border
                        border-[#d4af37]/35

                        text-[#d4af37]
                        text-xs
                        font-semibold

                        hover:bg-[#d4af37]/10

                        transition
                      "
                    >
                      Start Another Plan
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* GEMINI RESPONSE */}
              {isAiLoading && (
                <div className="mx-5 mb-3 rounded-xl bg-[#171a1f] p-3 text-sm text-[#d4af37]">
                  Eve is thinking...
                </div>
              )}

              {aiReply && (
                <div className="mx-5 mb-3 rounded-xl border border-[#d4af37]/30 bg-[#171a1f] p-4">
                  <p className="mb-2 text-xs font-bold text-[#d4af37]">
                    ✨ EveBuddy AI
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
                    {aiReply}
                  </p>
                </div>
              )}

              {aiError && (
                <div className="mx-5 mb-3 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
                  Error: {aiError}
                </div>
              )}

            </main>

            {/* ==================================================
                MESSAGE BAR
            ================================================== */}
            
            {/* GEMINI AI CHAT RESPONSE */}
            {(aiReply || aiError || isAiLoading) && (
              <div className="shrink-0 px-4 pt-3">
                {aiReply && (
                  <div className="rounded-xl border border-[#d4af37]/20 bg-[#171a1f] p-3">
                    <p className="mb-1 text-[10px] font-semibold text-[#d4af37]">
                      EveBuddy AI
                    </p>
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-white/85">
                      {aiReply}
                    </p>
                  </div>
                )}

                {isAiLoading && (
                  <div className="rounded-xl border border-[#d4af37]/20 bg-[#171a1f] p-3 text-xs text-white/60">
                    Eve is thinking...
                  </div>
                )}

                {aiError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
                    {aiError}
                  </div>
                )}
              </div>
            )}

            <div
              className="
                shrink-0

                px-4
                py-3

               border-t
              border-[#d4af37]/10

                bg-gradient-to-t
                from-[#08090b]
                to-[#0d0f13]
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2

                  h-[46px]
                  px-2

                  rounded-xl

                  border
                  border-white/[0.08]

                  bg-[#171a1f]

                  focus-within:border-[#d4af37]/40

                  transition
                "
              >
                <button
                  className="
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white/35
                    hover:text-[#d4af37]
                    transition
                  "
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="
                    flex-1
                    min-w-0

                    bg-transparent
                    outline-none

                    text-[11px]
                    text-white

                    placeholder:text-white/25
                  "
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="
                    w-9
                    h-9
                    rounded-lg

                    bg-gradient-to-br
                    from-[#d4af37]
                    to-[#e5c45a]

                    text-[#111]

                    flex
                    items-center
                    justify-center

                    disabled:opacity-25

                    transition
                  "
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div
              className="
                shrink-0

                h-[25px]

                flex
                items-center
                justify-center

                bg-[#090a0c]

                border-t
                border-white/[0.04]
              "
            >
              <p
                className="
                  text-[8px]
                  tracking-[0.18em]
                  text-white/20
                "
              >
                EVE BUDDY AI • PERSONAL EVENT PLANNER
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================================
// COMPACT EVE HEADER
// ============================================================

interface CompactEveHeaderProps {
  image: string;
  title: string;
  subtitle: string;
}

const CompactEveHeader = ({
  image,
  title,
  subtitle,
}: CompactEveHeaderProps) => {
  return (
    <div className="flex items-start gap-3">
      <div
        className="
          relative
          shrink-0

          w-[82px]
          h-[100px]

          overflow-hidden

          rounded-2xl

          bg-gradient-to-b
          from-[#17191e]
          to-[#0b0d10]

          border
          border-[#d4af37]/20
        "
      >
        <motion.img
          key={image}
          initial={{
            opacity: 0,
            scale: 1.05,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.25,
          }}
          src={image}
          alt="Eve Buddy"
          className="
            w-full
            h-full
            object-contain
          "
        />
      </div>

      <div className="pt-1">
        <h3
          className="
            font-display
            text-[18px]
            font-bold
            leading-tight
            text-white
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-2
            text-[10px]
            leading-relaxed
            text-white/45
          "
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};

// ============================================================
// BACK BUTTON
// ============================================================

const BackButton = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="
        mb-4

        flex
        items-center
        gap-1.5

        text-[10px]
        text-white/40

        hover:text-[#d4af37]

        transition
      "
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Back
    </button>
  );
};

// ============================================================
// SUMMARY ROW
// ============================================================

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4

        px-4
        py-3

        rounded-xl

        bg-[#181b20]

        border
        border-white/[0.06]
      "
    >
      <span className="text-[10px] text-white/40">
        {label}
      </span>

      <span
        className="
          text-[10px]
          font-semibold
          text-white
          text-right
        "
      >
        {value}
      </span>
    </div>
  );
};