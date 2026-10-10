import { useMemo,useEffect,useRef, useState } from "react";

import { motion, AnimatePresence,useDragControls } from "framer-motion";

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



import { eventCategories } from "../lib/categoryData";

import eveAvatar from "@/assets/eveBuddy/eve-avatar-new\.png";

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







// ============================================================

// EVENT DATA

// ============================================================



const eventTypes = eventCategories.map((category) => ({

  name: category.name,

  icon: category.icon,

  description: `Explore services for ${category.name.toLowerCase()}`,

  categoryId: category.id,

}));





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



  useEffect(() => {

  chatEndRef.current?.scrollIntoView({

    behavior: "smooth",

    block: "end",

  });

}, [messages, isAiLoading]);



  // ==========================================================

  // RESET

  // ==========================================================



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



  // ==========================================================

  // EVENT

  // ==========================================================

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



  type ChatMessage = {

  id: string;

  role: "user" | "assistant";

  content: string;

};





  // ==========================================================

  // SEND MESSAGE

  // ==========================================================







const handleSendMessage = async () => {

  const userMessage = message.trim();



  if (!userMessage || isAiLoading) return;



  setMessages((prev) => [

    ...prev,

    {

      id: `${Date.now()}-user`,

      role: "user",

      content: userMessage,

    },

  ]);



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

  history: messages.map((item) => ({

    role: item.role === "assistant" ? "model" : "user",

    parts: [{ text: item.content }],

  })),

}),



    });



    const data = await response.json();



    if (!response.ok) {

      throw new Error(data.error || "Eve couldn't respond.");

    }



    const reply = data.reply || "Please try asking me again.";



    setAiReply(reply);



    setMessages((prev) => [

      ...prev,

      {

        id: `${Date.now()}-assistant`,

        role: "assistant",

        content: reply,

      },

    ]);

  } catch (error) {

    console.error("EveBuddy chat error:", error);



    const errorMessage =

      error instanceof Error

        ? error.message

        : "Unable to connect to EveBuddy.";



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

          drag

        dragControls={dragControls}

        dragListener={false}

        dragMomentum={false}

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

right-4

top-20

bottom-5

z-[90]

w-[min(560px,calc(100vw-2rem))]

max-w-[calc(100vw-2rem)]

min-w-0

flex

flex-col

overflow-hidden



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

              onPointerDown={(e) => dragControls.start(e)}

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

                cursor-grab

                active:cursor-grabbing

                select-none

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

                        -top-0.5

                        -right-0.5

                        z-[100]

                        w-2.5

                        h-2.5

                        rounded-full

                        bg-emerald-400

                        border-2

                        border-[#15120c]

                        shadow-[0_0_8px_rgba(52,211,153,0.65)]

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

                overscroll-contain



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



      w-[48px]

      h-[56px]



      flex

      items-end

      justify-center

    "

  >

    <div

      className="

        w-[44px]

        h-[44px]



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

      ml-[52px]

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

            text-[15px]

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

          text-[15px]

          leading-[1.5]

          text-white/85

        "

      >

        Hi there! 👋

        <br />

        I'm Eve, your personal event planner.

      </p>

    </div>

  </motion.div>



</div>



                    {/* heading */}

                    <div className="mt-1 mb-4">

                      <h3

                        className="

                          font-display

                          text-[22px]

                          font-bold

                          text-white

                          tracking-[-0.01em]

                        "

                      >

                        How can I help you today?

                      </h3>



                      <p

                        className="

                          text-[15px]

                          text-#DCCBA7

                          mt-1

                        "

                      >

                        Choose an event and I'll help you plan it.

                      </p>

                    </div>



                    {/* event cards */}

                    <div className="grid grid-cols-2 gap-3">

                      {eventTypes.map((event, index) => (

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



                            min-h-[56px]



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

                                w-9

                                h-9

                                shrink-0



                                rounded-xl



                                bg-[#d4af37]/[0.08]



                                border

                                border-[#d4af37]/20



                                flex

                                items-center

                                justify-center



                                text-2xl

                              "

                            >

                              {event.icon}

                            </div>



                            {/* text */}

                            <div className="flex-1 text-left">

                              <p

                                className="

                                  text-[14px]

                                  font-semibold

                                  text-white

                                "

                              >

                                {event.name}

                              </p>



                              <p

                                className="

                                  text-[13px]

                                  text-#DCCBA7

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



                    {/* Browse all

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

                    </button> */}

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

                            eventCategories.find(

                              (category) => category.name === eventType

                            )?.subCategories ?? []

                          ).map((option) => (

                          <motion.button

                            key={option.name}

                            whileHover={{

                              x: 2,

                            }}

                            whileTap={{

                              scale: 0.99,

                            }}

                            onClick={() =>

                              handleOptionSelect(option.name)

                            }

                            className="

                              group

                              w-full

                              min-h-[82px]

                              p-3



                              rounded-xl



                              border

                              border-white/[0.07]



                              bg-[#181b20]



                              hover:border-[#d4af37]/45

                              hover:bg-[#d4af37]/[0.05]



                              transition



                             flex

                              flex-col

                              items-center

                              justify-center

                              gap-3

                              text-center

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

                              {option.name}

                            </span>



                            <ChevronRight

                              className="w-4 h-4 text-[#d4af37]/70"

                            />

                          </motion.button>

                        ))}



                        

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

                           border

                            border-[#d4af37]/25

                            bg-gradient-to-br

                            from-[#1b1b1d]

                            to-[#101114]

                            shadow-[0_4px_15px_rgba(0,0,0,0.2)]

                            hover:border-[#d4af37]/70

                            hover:from-[#262115]

                            hover:to-[#15130e]

                            hover:shadow-[0_0_18px_rgba(212,175,55,0.10)]

                            transition-all

                            duration-200

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

                      title={`Choose a service ✨`}

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
      className="group min-h-[76px] w-full p-3 rounded-xl border border-[#d4af37]/20 bg-[#181b20] hover:border-[#d4af37]/65 hover:bg-[#d4af37]/[0.06] transition-colors duration-150 flex items-center justify-between gap-2 text-left"
    >
      <span className="text-xs font-medium text-white/85">

                            {service}

                          </span>

                          <ChevronRight className="w-3.5 h-3.5 text-[#d4af37]/60 group-hover:text-[#d4af37] transition" />

                        </motion.button>

                      ))}



                      <button

                        onClick={() => setStep("details")}

                        className="w-full mt-3 h-10 rounded-xl border border-dashed border-white/20 text-[11px] text-white/40 hover:border-[#d4af37]/40 hover:text-[#d4af37] transition"

                      >

                        Back to subcategories

                      </button>

                    </div>

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

                      image={eveAvatar}

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
                      <button
                        onClick={() => {
                          setMessages((prev) => [...prev, {
                            id: `${Date.now()}-planner`,
                            role: "assistant",
                            content: "Of course! Ask me anything about your event, or choose an event category to continue planning.",
                          }]);
                          setStep("event");
                        }}
                        className="w-full mt-3 h-10 rounded-xl border border-dashed border-white/20 text-xs text-white/50 hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors"
                      >Ask Eve something else</button>


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

                      image={eveAvatar}

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
                      <button
                        onClick={() => {
                          setMessages((prev) => [...prev, {
                            id: `${Date.now()}-planner`,
                            role: "assistant",
                            content: "Of course! Ask me anything about your event, or choose an event category to continue planning.",
                          }]);
                          setStep("event");
                        }}
                        className="w-full mt-3 h-10 rounded-xl border border-dashed border-white/20 text-xs text-white/50 hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors"
                      >Ask Eve something else</button>


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

                      image={eveAvatar}

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
                      <button
                        onClick={() => {
                          setMessages((prev) => [...prev, {
                            id: `${Date.now()}-planner`,
                            role: "assistant",
                            content: "Of course! Ask me anything about your event, or choose an event category to continue planning.",
                          }]);
                          setStep("event");
                        }}
                        className="w-full mt-3 h-10 rounded-xl border border-dashed border-white/20 text-xs text-white/50 hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors"
                      >Ask Eve something else</button>


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

                      image={eveAvatar}

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

                      image={eveAvatar}

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

              





                <div className="flex flex-col gap-4 px-4 py-5">

                  {messages.map((chatMessage) => (

                    <div

                      key={chatMessage.id}

                      className={`flex ${

                        chatMessage.role === "user"

                          ? "justify-end"

                          : "justify-start"

                      }`}

                    >

                      <div

                        className={`max-w-[88%] rounded-2xl px-4 py-3 ${

                          chatMessage.role === "user"

                            ? "rounded-br-sm bg-[#d4af37] text-black"

                            : "rounded-bl-sm border border-[#d4af37]/25 bg-[#171a1f] text-white"

                        }`}

                      >

                        {chatMessage.role === "assistant" && (

                          <p className="mb-2 text-xs font-bold text-[#d4af37]">

                            ✨ EveBuddy AI

                          </p>

                        )}



                        <p className="whitespace-pre-wrap text-base leading-relaxed">

                          {chatMessage.content}

                        </p>

                      </div>

                    </div>

                  ))}



                  {isAiLoading && (

                    <div className="self-start rounded-xl border border-[#d4af37]/25 bg-[#171a1f] px-4 py-3 text-sm text-[#d4af37]">

                      Eve is thinking...

                    </div>

                  )}

                  <div ref={chatEndRef} />

                </div>





              {/* GEMINI RESPONSE */}

              {aiError && (

                <div className="mx-5 mb-3 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">

                  Error: {aiError}

                </div>

              )}



            </main>



            {/* ==================================================

                MESSAGE BAR

            ================================================== */}



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

                  placeholder="Ask Eve anything about your event..."

                  className="

                    flex-1

                    min-w-0



                    bg-transparent

                    outline-none



                    text-[13px]

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