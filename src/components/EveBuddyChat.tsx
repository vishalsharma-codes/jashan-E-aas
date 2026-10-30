import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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

import { eventCategories } from "../lib/categoryData";
import eveAvatar from "@/assets/eveBuddy/eve-avatar-new.png";

/* ------------------------------------------------------------------
   Blush Peach palette used in this file
   cream  #FFF6F2   panel background
   white  #FFFBF8   cards / inputs
   blush  #FFF1EC   soft surfaces
   peach  #FFE3D6   header / hover
   rose   #C44A68   accent         rose-light #E0708A
   plum   #4A3440   text
------------------------------------------------------------------ */

interface EveBuddyChatProps {
  isOpen: boolean;
  onClose: () => void;
}

type EventType = string | null;

type Step =
  | "event"
  | "wedding-services"
  | "details"
  | "services"
  | "location"
  | "date"
  | "budget"
  | "recommendations"
  | "complete";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const eventTypes = eventCategories.map((category) => ({
  name: category.name,
  icon: category.icon,
  categoryId: category.id,
}));

/* shared class strings */
const PRIMARY_BTN =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C44A68] to-[#E0708A] text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-30";
const DASHED_BTN =
  "w-full mt-3 h-10 rounded-xl border border-dashed border-[#C44A68]/30 text-xs text-[#4A3440]/60 transition-colors hover:border-[#C44A68]/60 hover:text-[#C44A68]";
const FIELD_BOX =
  "mt-2 flex h-12 items-center gap-2 rounded-xl border border-[#C44A68]/20 bg-[#FFFBF8] px-4 focus-within:border-[#C44A68]/60";
const FIELD_LABEL = "text-[10px] uppercase tracking-[0.18em] text-[#4A3440]/60";
const CHOICE_CARD =
  "rounded-xl border border-[#C44A68]/20 bg-[#FFFBF8] text-[#4A3440] transition hover:border-[#C44A68]/60 hover:bg-[#FFE3D6]";

export const EveBuddyChat = ({ isOpen, onClose }: EveBuddyChatProps) => {
  const [step, setStep] = useState<Step>("event");
  const [eventType, setEventType] = useState<EventType>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const dragControls = useDragControls();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isAiLoading]);

  const resetPlanner = () => {
    setStep("event");
    setEventType(null);
    setSelectedOption(null);
    setSelectedSubCategory(null);
    setCity("");
    setDate("");
    setBudget("");
    setMessage("");
    setAiReply("");
    setAiError("");
    setIsAiLoading(false);
    setMessages([]);
    setShowAllEvents(false);
  };

  const handleEventSelect = (event: EventType) => {
    setEventType(event);
    setSelectedOption(null);
    setSelectedSubCategory(null);
    setStep("details");
  };

  const handleOptionSelect = (option: string) => {
    setSelectedSubCategory(option);
    setSelectedOption(null);
    setStep("services");
  };

  const handleServiceSelect = (service: string) => {
    setSelectedOption(service);
    setCity("");
    setDate("");
    setBudget("");
    setStep("location");
  };

  const handleLocationNext = () => {
    if (!city.trim()) return;
    setStep("date");
  };

  const handleDateNext = () => {
    if (!date) return;
    setStep("budget");
  };

  const handleBack = () => {
    if (step === "details") {
      setEventType(null);
      setSelectedSubCategory(null);
      setSelectedOption(null);
      setStep("event");
      return;
    }
    if (step === "services") { setStep("details"); return; }
    if (step === "location") { setStep("services"); return; }
    if (step === "date") { setStep("location"); return; }
    if (step === "budget") { setStep("date"); return; }
    if (step === "recommendations") { setStep("budget"); }
  };

  const askEveSomethingElse = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-planner`,
        role: "assistant",
        content:
          "Of course! Ask me anything about your event, or choose an event category to continue planning.",
      },
    ]);
    setStep("event");
  };

  const handleSendMessage = async () => {
    const userMessage = message.trim();
    if (!userMessage || isAiLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", content: userMessage },
    ]);

    setMessage("");
    setAiError("");
    setAiReply("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }],
          })),
        }),
      });

      const responseText = await response.text();
      let data: { error?: string; reply?: string } = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        // Keep the response text available for a useful fallback error below.
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            (responseText.trim()
              ? `Server error ${response.status}: ${responseText.slice(0, 200)}`
              : `Server error ${response.status}`)
        );
      }

      if (!data.reply) {
        throw new Error(data.error || "The server returned an empty response.");
      }

      const reply = data.reply;
      setAiReply(reply);

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-assistant`, role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error("EveBuddy chat error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unable to connect to EveBuddy.";

      setAiError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: `Sorry, I couldn't respond: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* soft page overlay (no backdrop blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-[#4A3440]/20"
          />

          {/* EVE BUDDY PANEL */}
          <motion.aside
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 70 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-5 right-4 top-20 z-[90] flex w-[min(560px,calc(100vw-2rem))] min-w-0 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[26px] border border-[#C44A68]/35 bg-[#FFF6F2] text-[#4A3440] shadow-[0_20px_70px_-15px_rgba(196,74,104,0.45)]"
          >
            {/* rose top line */}
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C44A68] to-transparent opacity-90" />

            {/* HEADER */}
            <header
              onPointerDown={(e) => dragControls.start(e)}
              className="relative flex h-[120px] shrink-0 cursor-grab select-none items-center justify-between border-b border-[#C44A68]/15 bg-gradient-to-r from-[#FFE3D6] via-[#FFD9C7] to-[#FBD3DC] px-5 active:cursor-grabbing"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-[88px] w-[88px] shrink-0">
                  <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[#C44A68]/60 bg-[#FFFBF8] shadow-[0_0_20px_rgba(196,74,104,0.25)]">
                    <img src={eveAvatar} alt="EveBuddy AI" className="h-full w-full object-cover" />
                  </div>
                  <span className="absolute -right-0.5 -top-0.5 z-[100] h-3 w-3 rounded-full border-2 border-[#FFF6F2] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-display text-[17px] font-bold text-[#4A1230]">EveBuddy AI</h2>
                    <Sparkles className="h-3.5 w-3.5 text-[#C44A68]" />
                  </div>
                  <p className="text-[10px] tracking-wide text-[#C44A68]">Your Personal Event Planner</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={resetPlanner}
                  title="Restart"
                  className="hidden h-8 w-8 items-center justify-center rounded-full text-[#4A3440]/60 transition hover:bg-white/60 hover:text-[#C44A68] sm:flex"
                >
                  ↻
                </button>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#4A3440]/70 transition hover:bg-white/60 hover:text-[#C44A68]"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>
            </header>

            {/* BODY */}
            <main
              data-lenis-prevent
              className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-thin scrollbar-thumb-[#C44A68]/30 scrollbar-track-transparent"
            >
              <AnimatePresence mode="wait">
                {/* EVENT */}
                {step === "event" && (
                  <motion.div
                    key="event"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="p-5"
                  >
                    <div className="relative min-h-[150px]">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute left-0 top-0 flex h-[56px] w-[48px] items-end justify-center"
                      >
                        <div className="h-[44px] w-[44px] overflow-hidden rounded-full border border-[#C44A68]/45 bg-[#FFFBF8] shadow-[0_0_30px_rgba(196,74,104,0.2)]">
                          <img src={eveAvatar} alt="Eve Buddy" className="h-full w-full object-cover" />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12, duration: 0.3 }}
                        className="ml-[52px] pt-1"
                      >
                        <div className="relative rounded-[18px] rounded-bl-[5px] border border-[#C44A68]/20 bg-gradient-to-br from-[#FFFBF8] to-[#FFF1EC] px-4 py-3 shadow-[0_8px_25px_-10px_rgba(196,74,104,0.3)]">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="text-[15px] font-semibold uppercase tracking-[0.16em] text-[#C44A68]">
                              EveBuddy AI
                            </span>
                            <Sparkles className="h-3 w-3 text-[#C44A68]" />
                          </div>
                          <p className="text-[15px] leading-[1.5] text-[#4A3440]">
                            Hi there! 👋
                            <br />
                            I'm Eve, your personal event planner.
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    <div className="mb-4 mt-1">
                      <h3 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[#4A1230]">
                        How can I help you today?
                      </h3>
                      <p className="mt-1 text-[15px] text-[#4A3440]/70">
                        Choose an event and I'll help you plan it.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {eventTypes.map((event, index) => (
                        <motion.button
                          key={event.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 + index * 0.04 }}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => handleEventSelect(event.name)}
                          className={`group relative min-h-[56px] w-full overflow-hidden rounded-[14px] ${CHOICE_CARD}`}
                        >
                          <span className="absolute bottom-0 left-0 top-0 w-[2px] origin-center scale-y-0 bg-[#C44A68] transition-transform group-hover:scale-y-100" />
                          <div className="relative flex items-center gap-3 px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#C44A68]/20 bg-[#C44A68]/[0.08] text-2xl">
                              {event.icon}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-[14px] font-semibold text-[#4A3440]">{event.name}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-[#C44A68]/70 transition group-hover:translate-x-1 group-hover:text-[#C44A68]" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* DETAILS */}
                {step === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-5"
                  >
                    <BackButton onClick={handleBack} />

                    <CompactEveHeader
                      image={eveAvatar}
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

                    {eventType ? (
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {(
                          eventCategories.find((category) => category.name === eventType)
                            ?.subCategories ?? []
                        ).map((option) => (
                          <motion.button
                            key={option.name}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleOptionSelect(option.name)}
                            className={`group flex min-h-[82px] w-full flex-col items-center justify-center gap-3 p-3 text-center ${CHOICE_CARD}`}
                          >
                            <span className="text-[16px] font-medium text-[#4A3440]">{option.name}</span>
                            <ChevronRight className="h-4 w-4 text-[#C44A68]/70" />
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5">
                        <button
                          onClick={() => handleOptionSelect("General Event Planning")}
                          className={`w-full p-4 text-left ${CHOICE_CARD}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">General Event Planning</span>
                            <ArrowRight className="h-4 w-4 text-[#C44A68]" />
                          </div>
                          <p className="mt-1 text-[11px] text-[#4A3440]/60">
                            Help me find vendors for my event
                          </p>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* SERVICES */}
                {step === "services" && (
                  <motion.div
                    key="services"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-5"
                  >
                    <BackButton onClick={() => setStep("details")} />

                    <CompactEveHeader
                      image={eveAvatar}
                      title="Choose a service ✨"
                      subtitle={`Select a service under ${selectedSubCategory ?? "your chosen category"}.`}
                    />

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {(
                        eventCategories
                          .find((category) => category.name === eventType)
                          ?.subCategories.find(
                            (subCategory) => subCategory.name === selectedSubCategory
                          )?.services ?? []
                      ).map((service) => (
                        <motion.button
                          key={service}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleServiceSelect(service)}
                          className={`group flex min-h-[76px] w-full items-center justify-between gap-2 p-3 text-left transition-colors duration-150 ${CHOICE_CARD}`}
                        >
                          <span className="text-xs font-medium text-[#4A3440]">{service}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-[#C44A68]/60 transition group-hover:text-[#C44A68]" />
                        </motion.button>
                      ))}

                      <button
                        onClick={() => setStep("details")}
                        className="col-span-2 mt-1 h-10 w-full rounded-xl border border-dashed border-[#C44A68]/30 text-[11px] text-[#4A3440]/60 transition hover:border-[#C44A68]/60 hover:text-[#C44A68]"
                      >
                        Back to subcategories
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* LOCATION */}
                {step === "location" && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-5"
                  >
                    <BackButton onClick={handleBack} />

                    <CompactEveHeader
                      image={eveAvatar}
                      title="Where is your event?"
                      subtitle="I'll use your city to find relevant verified vendors near you."
                    />

                    <div className="mt-7">
                      <label className={FIELD_LABEL}>Event City</label>

                      <div className={FIELD_BOX}>
                        <MapPin className="h-4 w-4 text-[#C44A68]" />
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Delhi, Mumbai, Jaipur..."
                          className="flex-1 bg-transparent text-xs text-[#4A3440] outline-none placeholder:text-[#4A3440]/40"
                        />
                      </div>

                      <button
                        onClick={handleLocationNext}
                        disabled={!city.trim()}
                        className={`mt-4 h-11 ${PRIMARY_BTN}`}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button onClick={askEveSomethingElse} className={DASHED_BTN}>
                        Ask Eve something else
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* DATE */}
                {step === "date" && (
                  <motion.div
                    key="date"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-5"
                  >
                    <BackButton onClick={handleBack} />

                    <CompactEveHeader
                      image={eveAvatar}
                      title="When is your event?"
                      subtitle="Knowing the date helps me find vendors who are available around your event."
                    />

                    <div className="mt-7">
                      <label className={FIELD_LABEL}>Event Date</label>

                      <div className={FIELD_BOX}>
                        <CalendarDays className="h-4 w-4 text-[#C44A68]" />
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="flex-1 bg-transparent text-xs text-[#4A3440] outline-none [color-scheme:light]"
                        />
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 text-[#C44A68]" />
                        <span className="text-[10px] text-[#4A3440]/60">You can change this later.</span>
                      </div>

                      <button
                        onClick={handleDateNext}
                        disabled={!date}
                        className={`mt-5 h-11 ${PRIMARY_BTN}`}
                      >
                        Find My Vendors
                        <Sparkles className="h-4 w-4" />
                      </button>

                      <button onClick={askEveSomethingElse} className={DASHED_BTN}>
                        Ask Eve something else
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* BUDGET */}
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
                      image={eveAvatar}
                      title="What's your budget?"
                      subtitle="This helps me personalise the vendors and options I show you."
                    />

                    <div className="mt-7">
                      <label className={FIELD_LABEL}>Select your budget</label>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {["₹1–5 Lakh", "₹5–10 Lakh", "₹10–25 Lakh", "₹25 Lakh+"].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => {
                              setBudget(amount);
                              setStep("recommendations");
                            }}
                            className={`px-3 py-4 text-xs font-medium ${CHOICE_CARD}`}
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
                        className="mt-3 h-10 w-full rounded-xl border border-dashed border-[#C44A68]/30 text-[11px] text-[#4A3440]/60 transition hover:border-[#C44A68]/60 hover:text-[#C44A68]"
                      >
                        My budget is flexible
                      </button>

                      <button onClick={askEveSomethingElse} className={DASHED_BTN}>
                        Ask Eve something else
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* RECOMMENDATIONS */}
                {step === "recommendations" && (
                  <motion.div
                    key="recommendations"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5"
                  >
                    <CompactEveHeader
                      image={eveAvatar}
                      title="I've got your plan ✨"
                      subtitle="Here's what I'll use to personalise your vendor recommendations."
                    />

                    <div className="mt-5 space-y-2">
                      <SummaryRow label="Event" value={eventType ?? "Event"} />
                      <SummaryRow label="Service" value={selectedOption ?? "General Event Planning"} />
                      <SummaryRow label="City" value={city || "Not specified"} />
                      <SummaryRow label="Date" value={date || "Flexible"} />
                      <SummaryRow label="Budget" value={budget || "Flexible"} />
                    </div>

                    <button onClick={() => setStep("complete")} className={`mt-5 h-11 ${PRIMARY_BTN}`}>
                      Show My Recommendations
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {/* COMPLETE */}
                {step === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5"
                  >
                    <CompactEveHeader
                      image={eveAvatar}
                      title="Let's make it happen 🎉"
                      subtitle="Your event profile is ready. Eve can now help you discover the right vendors."
                    />

                    <div className="mt-6 rounded-2xl border border-[#C44A68]/20 bg-[#C44A68]/[0.05] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C44A68]/10">
                          <Sparkles className="h-5 w-5 text-[#C44A68]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#4A3440]">Personalised vendor discovery</p>
                          <p className="mt-1 text-[10px] text-[#4A3440]/60">Based on your event preferences</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={resetPlanner}
                      className="mt-4 h-10 w-full rounded-xl border border-[#C44A68]/40 text-xs font-semibold text-[#C44A68] transition hover:bg-[#C44A68]/10"
                    >
                      Start Another Plan
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CHAT MESSAGES */}
              <div className="flex flex-col gap-4 px-4 py-5">
                {messages.map((chatMessage) => (
                  <div
                    key={chatMessage.id}
                    className={`flex ${chatMessage.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                        chatMessage.role === "user"
                          ? "rounded-br-sm bg-[#C44A68] text-white"
                          : "rounded-bl-sm border border-[#C44A68]/25 bg-[#FFFBF8] text-[#4A3440]"
                      }`}
                    >
                      {chatMessage.role === "assistant" && (
                        <p className="mb-2 text-xs font-bold text-[#C44A68]">✨ EveBuddy AI</p>
                      )}
                      <p className="whitespace-pre-wrap text-base leading-relaxed">{chatMessage.content}</p>
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="self-start rounded-xl border border-[#C44A68]/25 bg-[#FFFBF8] px-4 py-3 text-sm text-[#C44A68]">
                    Eve is thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {aiError && (
                <div className="mx-5 mb-3 rounded-xl border border-red-300 bg-red-100 p-3 text-sm text-red-700">
                  Error: {aiError}
                </div>
              )}
            </main>

            {/* MESSAGE BAR */}
            <div className="shrink-0 border-t border-[#C44A68]/15 bg-gradient-to-t from-[#FFF1EC] to-[#FFF6F2] px-4 py-3">
              <div className="flex h-[46px] items-center gap-2 rounded-xl border border-[#C44A68]/20 bg-[#FFFBF8] px-2 transition focus-within:border-[#C44A68]/50">
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#4A3440]/50 transition hover:text-[#C44A68]">
                  <Mic className="h-4 w-4" />
                </button>

                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder="Ask Eve anything about your event..."
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-[#4A3440] outline-none placeholder:text-[#4A3440]/40"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#C44A68] to-[#E0708A] text-white transition disabled:opacity-25"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex h-[25px] shrink-0 items-center justify-center border-t border-[#C44A68]/10 bg-[#FFE9E3]">
              <p className="text-[8px] tracking-[0.18em] text-[#4A3440]/50">
                EVE BUDDY AI • PERSONAL EVENT PLANNER
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* ---------------- COMPACT EVE HEADER ---------------- */

interface CompactEveHeaderProps {
  image: string;
  title: string;
  subtitle: string;
}

const CompactEveHeader = ({ image, title, subtitle }: CompactEveHeaderProps) => (
  <div className="flex items-start gap-3">
    <div className="relative h-[100px] w-[82px] shrink-0 overflow-hidden rounded-2xl border border-[#C44A68]/25 bg-gradient-to-b from-[#FFE3D6] to-[#FBD3DC]">
      <motion.img
        key={image}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        src={image}
        alt="Eve Buddy"
        className="h-full w-full object-contain"
      />
    </div>

    <div className="pt-1">
      <h3 className="font-display text-[18px] font-bold leading-tight text-[#4A1230]">{title}</h3>
      <p className="mt-2 text-[10px] leading-relaxed text-[#4A3440]/70">{subtitle}</p>
    </div>
  </div>
);

/* ---------------- BACK BUTTON ---------------- */

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="mb-4 flex items-center gap-1.5 text-[10px] text-[#4A3440]/60 transition hover:text-[#C44A68]"
  >
    <ArrowLeft className="h-3.5 w-3.5" />
    Back
  </button>
);

/* ---------------- SUMMARY ROW ---------------- */

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-[#C44A68]/15 bg-[#FFFBF8] px-4 py-3">
    <span className="text-[10px] text-[#4A3440]/60">{label}</span>
    <span className="text-right text-[10px] font-semibold text-[#4A3440]">{value}</span>
  </div>
);