import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Star, CreditCard, Bell, Shield, FileText,
  Heart, Image, Users, BookOpen, Award, MessageSquare,
  CheckCircle, Clock, TrendingUp, Gift
} from "lucide-react";

const tabs = [
  { id: "dashboard", label: "My Events", icon: Calendar },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "moodboard", label: "Mood Board", icon: Image },
  { id: "guests", label: "Guests", icon: Users },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "loyalty", label: "Loyalty", icon: Award },
];

const myEvents = [
  {
    title: "Priya & Arjun Wedding",
    date: "December 12, 2026",
    type: "Wedding",
    vendors: 6,
    booked: 4,
    checklist: 72,
    budget: "₹18,00,000",
    spent: "₹12,40,000",
    gradient: "from-rose-500/20 to-rose-900/10",
    border: "border-rose-500/30",
  },
  {
    title: "30th Birthday Party",
    date: "July 20, 2026",
    type: "Birthday",
    vendors: 3,
    booked: 3,
    checklist: 100,
    budget: "₹1,50,000",
    spent: "₹1,48,000",
    gradient: "from-gold/20 to-gold/5",
    border: "border-gold/30",
  },
];

const savedVendors = [
  { name: "Lens & Light Studio", category: "Photography", rating: 4.9, price: "₹75K–₹2L", location: "Mumbai", initials: "LL", gradient: "from-blue-500 to-indigo-700" },
  { name: "Royal Decor Co.", category: "Decoration", rating: 4.8, price: "₹50K–₹5L", location: "Delhi", initials: "RD", gradient: "from-rose-500 to-pink-700" },
  { name: "Spice Route Catering", category: "Catering", rating: 4.7, price: "₹800/plate", location: "Mumbai", initials: "SR", gradient: "from-orange-500 to-red-700" },
];

const moodItems = [
  { emoji: "🌸", label: "Floral arch", category: "Décor", gradient: "from-rose-500/30 to-pink-700/20" },
  { emoji: "🕯️", label: "Candle ceremony", category: "Ambiance", gradient: "from-amber-500/30 to-yellow-700/20" },
  { emoji: "🍽️", label: "Live food counter", category: "Catering", gradient: "from-orange-500/30 to-red-700/20" },
  { emoji: "📸", label: "Film grain edits", category: "Photography", gradient: "from-blue-500/30 to-indigo-700/20" },
  { emoji: "💃", label: "Fusion sangeet", category: "Entertainment", gradient: "from-purple-500/30 to-violet-700/20" },
  { emoji: "✉️", label: "Digital invites", category: "Stationery", gradient: "from-emerald-500/30 to-teal-700/20" },
];

const guests = [
  { name: "Anjali Sharma", rsvp: "Confirmed", dietary: "Vegetarian", group: "Family", table: "T2" },
  { name: "Rohit Mehta", rsvp: "Confirmed", dietary: "Non-Veg", group: "Friends", table: "T5" },
  { name: "Kavitha Nair", rsvp: "Pending", dietary: "Vegan", group: "Colleague", table: "—" },
  { name: "Suresh Kumar", rsvp: "Declined", dietary: "Vegetarian", group: "Family", table: "—" },
  { name: "Deepa Iyer", rsvp: "Confirmed", dietary: "Jain", group: "Family", table: "T2" },
];

const payments = [
  { vendor: "Lens & Light Studio", phase: "Token Payment (20%)", amount: "₹15,000", date: "May 10, 2026", status: "Paid", protected: true },
  { vendor: "Royal Decor Co.", phase: "Advance (30%)", amount: "₹60,000", date: "June 1, 2026", status: "Due", protected: true },
  { vendor: "Spice Route Catering", phase: "Token Payment (20%)", amount: "₹32,000", date: "May 15, 2026", status: "Paid", protected: true },
  { vendor: "DJ Beats Pro", phase: "Full Payment", amount: "₹25,000", date: "July 5, 2026", status: "Upcoming", protected: true },
];

const loyaltyTiers = [
  { name: "Silver", min: 0, max: 49999, color: "text-gray-400", bg: "from-gray-500/20 to-gray-700/10", perks: ["5% discount on next booking", "Priority chat support"] },
  { name: "Gold", min: 50000, max: 199999, color: "text-yellow-500", bg: "from-yellow-500/20 to-yellow-700/10", perks: ["8% discount", "Early access to new vendors", "Dedicated EveBuddy"] },
  { name: "Diamond", min: 200000, max: 999999, color: "text-blue-400", bg: "from-blue-500/20 to-blue-700/10", perks: ["10% discount", "Free consultation calls", "VIP event invites", "Featured review badge"] },
  { name: "Platinum", min: 1000000, max: Infinity, color: "text-gold", bg: "from-gold/20 to-gold/5", perks: ["Personal relationship manager", "Exclusive deals", "Backstage event access"] },
];

export default function CustomerAccount() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const currentSpend = 1240000;
  const coins = 840;
  const currentTier = loyaltyTiers[1]; // Gold

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-20">
        {/* Profile Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-2xl font-bold text-background">
                PA
              </div>
              <div>
                <h1 className="font-bold text-xl">Priya Sharma</h1>
                <p className="text-muted-foreground text-sm">priya.sharma@email.com · Mumbai</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                    <Star className="w-3 h-3 mr-1" /> Gold Member
                  </Badge>
                  <span className="text-xs text-muted-foreground">{coins} coins</span>
                </div>
              </div>
              <div className="ml-auto hidden md:flex items-center gap-3">
                <Button variant="outline" size="sm" className="border-gold/40 text-gold hover:bg-gold/10">
                  <Gift className="w-4 h-4 mr-2" /> {coins} Coins
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mt-6 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-gold text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myEvents.map((ev, i) => (
                    <motion.div
                      key={ev.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-gradient-to-br ${ev.gradient} border ${ev.border} rounded-2xl p-6`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{ev.title}</h3>
                          <p className="text-sm text-muted-foreground">{ev.type} · {ev.date}</p>
                        </div>
                        <Badge variant="outline" className="border-current/30">{ev.type}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: "Vendors", value: `${ev.booked}/${ev.vendors}` },
                          { label: "Checklist", value: `${ev.checklist}%` },
                          { label: "Budget Left", value: `₹${((parseInt(ev.budget.replace(/[₹,]/g, "")) - parseInt(ev.spent.replace(/[₹,]/g, ""))) / 100000).toFixed(1)}L` },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-black/20 rounded-xl p-3 text-center">
                            <p className="font-bold text-sm">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Checklist bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Checklist Progress</span>
                          <span>{ev.checklist}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ev.checklist}%` }}
                            transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                            className="bg-gold h-2 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-gold hover:bg-gold-dark text-background text-xs">View Details</Button>
                        <Button size="sm" variant="outline" className="border-current/30 text-xs">Checklist</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <motion.div key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="font-bold text-lg mb-4">Saved Vendors</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {savedVendors.map((v, i) => (
                    <motion.div
                      key={v.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:border-gold/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center text-white font-bold text-sm`}>{v.initials}</div>
                        <div>
                          <p className="font-semibold text-sm">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold fill-gold" />{v.rating}</span>
                        <span className="text-gold font-semibold text-xs">{v.price}</span>
                      </div>
                      <Button size="sm" className="w-full bg-gold hover:bg-gold-dark text-background text-xs">Send Inquiry</Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Mood Board Tab */}
            {activeTab === "moodboard" && (
              <motion.div key="moodboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Inspiration Board</h2>
                  <Button size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs">
                    <Heart className="w-3.5 h-3.5 mr-1.5" /> Add Inspiration
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {moodItems.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className={`bg-gradient-to-br ${item.gradient} border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform`}
                    >
                      <span className="text-4xl">{item.emoji}</span>
                      <p className="text-sm font-medium text-center">{item.label}</p>
                      <Badge variant="outline" className="text-xs border-current/30">{item.category}</Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Guests Tab */}
            {activeTab === "guests" && (
              <motion.div key="guests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-lg">Guest Management</h2>
                    <p className="text-sm text-muted-foreground">Priya & Arjun Wedding · 200 guests expected</p>
                  </div>
                  <Button size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs">Add Guest</Button>
                </div>
                <div className="flex gap-3 mb-4 flex-wrap">
                  {[
                    { label: "Confirmed", value: 3, color: "text-emerald-400" },
                    { label: "Pending", value: 1, color: "text-amber-400" },
                    { label: "Declined", value: 1, color: "text-red-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-2 text-sm">
                      <span className={`font-bold ${s.color}`}>{s.value}</span>
                      <span className="text-muted-foreground ml-1">{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        {["Name", "RSVP", "Dietary", "Group", "Table"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((g, i) => (
                        <tr key={g.name} className="border-b border-border last:border-none hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{g.name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${g.rsvp === "Confirmed" ? "text-emerald-400" : g.rsvp === "Pending" ? "text-amber-400" : "text-red-400"}`}>{g.rsvp}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{g.dietary}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{g.group}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{g.table}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="font-bold text-lg mb-2">Payment History & Schedule</h2>
                <p className="text-sm text-muted-foreground mb-5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" /> All payments are escrow-protected
                </p>
                <div className="space-y-3">
                  {payments.map((p, i) => (
                    <motion.div
                      key={`${p.vendor}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3"
                    >
                      <div>
                        <p className="font-semibold text-sm">{p.vendor}</p>
                        <p className="text-xs text-muted-foreground">{p.phase} · {p.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gold">{p.amount}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${p.status === "Paid" ? "border-emerald-500/40 text-emerald-400" : p.status === "Due" ? "border-amber-500/40 text-amber-400" : "border-blue-500/40 text-blue-400"}`}
                        >
                          {p.status === "Paid" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                          {p.status}
                        </Badge>
                        {p.status === "Due" && (
                          <Button size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs h-7">Pay Now</Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loyalty Tab */}
            {activeTab === "loyalty" && (
              <motion.div key="loyalty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current status */}
                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-700/10 border border-yellow-500/30 rounded-2xl p-6">
                    <p className="text-sm text-muted-foreground mb-1">Your Current Tier</p>
                    <h2 className="font-serif text-4xl font-bold text-yellow-500 mb-1">Gold</h2>
                    <p className="text-sm text-muted-foreground mb-4">₹{(currentSpend / 100).toLocaleString("en-IN")} total spend</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress to Diamond</span>
                        <span>₹{((200000 - currentSpend) / 100).toLocaleString("en-IN")} more</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentSpend / 200000) * 100}%` }}
                          transition={{ duration: 1 }}
                          className="bg-yellow-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-black/20 rounded-xl px-4 py-2 text-center">
                        <p className="font-bold text-gold">{coins}</p>
                        <p className="text-xs text-muted-foreground">Coins</p>
                      </div>
                      <Button size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs">Redeem Coins</Button>
                    </div>
                  </div>

                  {/* Tiers */}
                  <div className="space-y-3">
                    {loyaltyTiers.map((tier) => (
                      <div
                        key={tier.name}
                        className={`bg-gradient-to-r ${tier.bg} border border-white/10 rounded-xl p-4 ${tier.name === currentTier.name ? "ring-2 ring-yellow-500/40" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${tier.color}`}>{tier.name}</span>
                          {tier.name === currentTier.name && <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs">Current</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tier.perks.slice(0, 2).map((perk) => (
                            <span key={perk} className="text-xs text-muted-foreground bg-black/20 px-2 py-0.5 rounded-full">{perk}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coin earning ways */}
                <div className="mt-6">
                  <h3 className="font-bold mb-3">Earn More Coins</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { action: "Refer a Friend", coins: 200, icon: "👥" },
                      { action: "Write a Review", coins: 50, icon: "⭐" },
                      { action: "Complete Profile", coins: 100, icon: "👤" },
                      { action: "First Booking", coins: 150, icon: "🎉" },
                      { action: "Daily Check-in", coins: 10, icon: "📅" },
                      { action: "Community Post", coins: 20, icon: "💬" },
                    ].map((item) => (
                      <div key={item.action} className="bg-card border border-border rounded-xl p-3 text-center hover:border-gold/30 transition-colors">
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <p className="text-xs font-semibold text-gold">+{item.coins}</p>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">{item.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <Footer />
      <EveBuddy />
    </div>
  );
}
