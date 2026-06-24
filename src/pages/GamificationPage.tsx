import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Zap, TrendingUp, Crown, Award, RotateCw } from "lucide-react";

const tiers = [
  {
    name: "Silver",
    criteria: "First booking completed",
    perks: ["5% discount on next booking", "Priority chat support"],
    color: "text-gray-300",
    bg: "from-gray-500/20 to-gray-700/10",
    border: "border-gray-500/30",
    icon: "🥈",
  },
  {
    name: "Gold",
    criteria: "3 bookings OR ₹50,000 total spend",
    perks: ["8% discount", "Early access to new vendors", "Dedicated EveBuddy"],
    color: "text-yellow-400",
    bg: "from-yellow-500/20 to-yellow-700/10",
    border: "border-yellow-500/30",
    icon: "🥇",
  },
  {
    name: "Diamond",
    criteria: "10 bookings OR ₹2,00,000 spend",
    perks: ["10% discount", "Free consultation calls", "VIP event invites", "Featured review badge"],
    color: "text-blue-400",
    bg: "from-blue-500/20 to-blue-700/10",
    border: "border-blue-500/30",
    icon: "💎",
  },
  {
    name: "Platinum",
    criteria: "₹10,00,000+ total spend (Invite Only)",
    perks: ["Personal relationship manager", "Exclusive deals", "Backstage event access"],
    color: "text-gold",
    bg: "from-gold/20 to-gold/5",
    border: "border-gold/40",
    icon: "👑",
    exclusive: true,
  },
];

const earningWays = [
  { action: "Refer a Friend", coins: 200, icon: "👥", desc: "Both you and your friend get coins when they book" },
  { action: "Write a Review", coins: 50, icon: "⭐", desc: "After your event, share your experience" },
  { action: "Complete Profile", coins: 100, icon: "👤", desc: "Fill in all your preferences and details" },
  { action: "Book First Vendor", coins: 150, icon: "🎉", desc: "One-time welcome bonus on first booking" },
  { action: "Daily Check-in", coins: 10, icon: "📅", desc: "Visit the app daily for a 7-day streak bonus" },
  { action: "Community Post", coins: 20, icon: "💬", desc: "Share tips or vendor reviews in communities" },
];

const wheelSegments = [
  { label: "50 coins", color: "from-gold/60 to-gold", multiplier: 1 },
  { label: "Try again", color: "from-muted/40 to-muted/20", multiplier: 0 },
  { label: "100 coins", color: "from-crimson/60 to-crimson", multiplier: 2 },
  { label: "20 coins", color: "from-blue-500/60 to-blue-700", multiplier: 1 },
  { label: "200 coins!", color: "from-emerald-500/60 to-emerald-700", multiplier: 4 },
  { label: "Try again", color: "from-muted/40 to-muted/20", multiplier: 0 },
  { label: "75 coins", color: "from-purple-500/60 to-purple-700", multiplier: 1 },
  { label: "Double!", color: "from-gold/60 to-gold-dark", multiplier: 3 },
];

function SpinWheel() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const extra = 1440 + Math.floor(Math.random() * 360);
    const newRot = rotation + extra;
    setRotation(newRot);
    setTimeout(() => {
      const segIdx = Math.floor(((360 - (newRot % 360)) / 360) * wheelSegments.length) % wheelSegments.length;
      setResult(wheelSegments[segIdx].label);
      setSpinning(false);
    }, 2500);
  };

  const segAngle = 360 / wheelSegments.length;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-64 h-64">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0"
          style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "24px solid #D4AF37" }} />
        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full overflow-hidden border-4 border-gold shadow-2xl"
          animate={{ rotate: rotation }}
          transition={{ duration: 2.5, ease: [0.17, 0.67, 0.34, 0.97] }}
          style={{ boxShadow: "0 0 40px rgba(212,175,55,0.3)" }}
        >
          {wheelSegments.map((seg, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                transform: `rotate(${i * segAngle}deg)`,
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(segAngle * Math.PI / 180)}% ${50 - 50 * Math.cos(segAngle * Math.PI / 180)}%)`,
              }}
            >
              <div className={`w-full h-full bg-gradient-to-b ${seg.color}`} />
              <span
                className="absolute text-xs font-bold text-white"
                style={{
                  top: "25%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${segAngle / 2}deg)`,
                  whiteSpace: "nowrap",
                  fontSize: "9px",
                }}
              >
                {seg.label}
              </span>
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-[40%] rounded-full bg-background border-2 border-gold flex items-center justify-center z-10">
          <RotateCw className="w-5 h-5 text-gold" />
        </div>
      </div>

      <Button
        onClick={spin}
        disabled={spinning}
        className="bg-gold hover:bg-gold-dark text-background font-semibold w-40"
      >
        {spinning ? "Spinning..." : "Spin! (10 coins)"}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-2xl font-bold text-gold">{result} 🎉</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GamificationPage() {
  const [activeGame, setActiveGame] = useState<"wheel" | "predict">("wheel");
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  const categories = ["Wedding Photography", "DJ & Music", "Mehandi Artists", "Decorators", "Catering"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 60%)"
        }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 text-center">
          <p className="text-gold text-sm uppercase tracking-widest mb-3">Earn & Redeem</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Loyalty & <span className="text-gradient-gold">Rewards</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Earn Jashan coins by booking, reviewing, and engaging. Redeem them for discounts of up to 10% on your bookings.
          </p>
        </motion.div>
      </section>

      {/* Loyalty Tiers */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold">Loyalty Tiers</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-gradient-to-br ${tier.bg} border ${tier.border} rounded-2xl p-6`}
              >
                {tier.exclusive && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-background text-xs">Invite Only</Badge>
                )}
                <div className="text-4xl mb-2">{tier.icon}</div>
                <h3 className={`font-bold text-xl mb-1 ${tier.color}`}>{tier.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{tier.criteria}</p>
                <ul className="space-y-1.5">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-gold mt-0.5">✦</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coin Earning */}
      <section className="py-12 bg-charcoal-light/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold mb-2">How to Earn Coins</h2>
            <p className="text-muted-foreground">100 coins = 1% discount · Max 10% per booking</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {earningWays.map((way, i) => (
              <motion.div
                key={way.action}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl p-4 text-center hover:border-gold/30 transition-colors"
              >
                <div className="text-3xl mb-2">{way.icon}</div>
                <p className="font-bold text-gold text-sm">+{way.coins}</p>
                <p className="text-xs font-semibold mt-0.5">{way.action}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{way.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold mb-2">Community Games</h2>
            <p className="text-muted-foreground">Wager coins. Max bet = 30% of balance. Max win = 5% discount equivalent.</p>
          </motion.div>

          {/* Game tabs */}
          <div className="flex gap-2 mb-8 justify-center">
            {(["wheel", "predict"] as const).map((game) => (
              <button
                key={game}
                onClick={() => setActiveGame(game)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  activeGame === game ? "bg-gold text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {game === "wheel" ? "🎡 Spin the Wheel" : "🔮 Prediction Game"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeGame === "wheel" && (
              <motion.div key="wheel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-card border border-border rounded-3xl p-8">
                  <p className="text-center text-sm text-muted-foreground mb-6">
                    Risk 10 coins for a chance to win up to 200 coins. Results are randomised and fair.
                  </p>
                  <SpinWheel />
                </div>
              </motion.div>
            )}

            {activeGame === "predict" && (
              <motion.div key="predict" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-card border border-border rounded-3xl p-8">
                  <h3 className="font-bold text-center mb-2">This Weekend's Prediction</h3>
                  <p className="text-center text-sm text-muted-foreground mb-6">
                    Which vendor category will be most booked this weekend in Mumbai?
                    <br />Bet 50 coins. Correct predictions double your wager.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedPrediction(cat)}
                        className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                          selectedPrediction === cat
                            ? "bg-gold/20 border-gold text-gold"
                            : "bg-card border-border hover:border-gold/30"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-gold hover:bg-gold-dark text-background font-semibold"
                    disabled={!selectedPrediction}
                  >
                    Place Prediction (50 coins)
                  </Button>
                  {selectedPrediction && (
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      Results revealed Sunday midnight. Good luck! 🤞
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
      <EveBuddy />
    </div>
  );
}
