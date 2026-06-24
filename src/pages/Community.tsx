import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { EveBuddy } from "@/components/EveBuddy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, MessageSquare, Calendar, Plus, Star, MapPin, Lock, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const communityTypes = [
  {
    icon: "📸",
    type: "Vendor Community",
    name: "Delhi Photographers Guild",
    members: 847,
    admin: "Rohan Kapoor Photography",
    purpose: "Showcase work, discuss industry, refer clients to each other",
    tags: ["Photography", "Delhi", "Networking"],
    gradient: "from-blue-500/20 to-blue-900/10",
    border: "border-blue-500/30",
    isVerified: true,
    posts: 234,
    city: "Delhi",
  },
  {
    icon: "💒",
    type: "Event Category",
    name: "Wedding Planning India",
    members: 4230,
    admin: "Platform Moderator",
    purpose: "Wedding planning tips, vendor recommendations, real experiences",
    tags: ["Weddings", "All India", "Tips"],
    gradient: "from-rose-500/20 to-rose-900/10",
    border: "border-rose-500/30",
    isVerified: true,
    posts: 1890,
    city: "Pan India",
  },
  {
    icon: "🏢",
    type: "City Community",
    name: "Mumbai Corporate Events",
    members: 1560,
    admin: "EventPro Mumbai",
    purpose: "Local vendor recommendations, Mumbai event trends, venue reviews",
    tags: ["Corporate", "Mumbai", "Venues"],
    gradient: "from-gold/20 to-gold/5",
    border: "border-gold/30",
    isVerified: true,
    posts: 567,
    city: "Mumbai",
  },
  {
    icon: "🌿",
    type: "Interest Community",
    name: "Eco-Friendly Events",
    members: 329,
    admin: "GreenEvent Collective",
    purpose: "DIY decoration, sustainable vendor lists, zero-waste event ideas",
    tags: ["Eco", "Sustainable", "DIY"],
    gradient: "from-emerald-500/20 to-emerald-900/10",
    border: "border-emerald-500/30",
    isVerified: false,
    posts: 89,
    city: "All India",
  },
  {
    icon: "🎵",
    type: "Vendor Community",
    name: "Choreographers Network India",
    members: 612,
    admin: "National Dance Association",
    purpose: "Performer community — share reels, find collaborators, discuss rates",
    tags: ["Dance", "Performance", "Sangeet"],
    gradient: "from-purple-500/20 to-purple-900/10",
    border: "border-purple-500/30",
    isVerified: true,
    posts: 443,
    city: "Pan India",
  },
  {
    icon: "🔒",
    type: "Private Planning Group",
    name: "Sharma-Mehta Wedding 2026",
    members: 12,
    admin: "Priya Sharma",
    purpose: "Private group for family + selected vendors to co-plan the wedding",
    tags: ["Private", "Wedding", "Family"],
    gradient: "from-muted/30 to-muted/10",
    border: "border-border",
    isVerified: false,
    posts: 56,
    city: "Jaipur",
    isPrivate: true,
  },
];

const upcomingEvents = [
  {
    title: "Photography Workshop — Golden Hour Portraits",
    organizer: "Rohan Kapoor Photography",
    community: "Delhi Photographers Guild",
    date: "June 15, 2026",
    time: "4:00 PM",
    price: 1500,
    capacity: 20,
    filled: 14,
    location: "Lodhi Garden, Delhi",
    icon: "📸",
    gradient: "from-blue-500/20 to-blue-900/10",
  },
  {
    title: "Pre-Wedding Vendor Speed Dating",
    organizer: "EventPro Mumbai",
    community: "Mumbai Corporate Events",
    date: "June 22, 2026",
    time: "11:00 AM",
    price: 500,
    capacity: 50,
    filled: 38,
    location: "The Leela, Mumbai",
    icon: "💑",
    gradient: "from-rose-500/20 to-rose-900/10",
  },
  {
    title: "Sangeet Choreography Group Session",
    organizer: "Natya Academy",
    community: "Choreographers Network India",
    date: "June 28, 2026",
    time: "6:00 PM",
    price: 2000,
    capacity: 30,
    filled: 21,
    location: "Andheri West, Mumbai",
    icon: "💃",
    gradient: "from-purple-500/20 to-purple-900/10",
  },
  {
    title: "Wedding Exhibition — Venue & Decor Showcase",
    organizer: "Wedding Planning India",
    community: "Wedding Planning India",
    date: "July 5, 2026",
    time: "10:00 AM",
    price: 0,
    capacity: 200,
    filled: 87,
    location: "Pragati Maidan, Delhi",
    icon: "🏛️",
    gradient: "from-gold/20 to-gold/5",
  },
];

const posts = [
  {
    author: "Kavitha Nair",
    avatar: "KN",
    gradient: "from-pink-500 to-rose-700",
    community: "Wedding Planning India",
    time: "2h ago",
    content: "Finally found the perfect mehandi artist in Kochi after searching for 3 months! Her Arabic style is absolutely stunning. DM me for her contact — she has slots for December.",
    likes: 47,
    comments: 12,
    tags: ["Mehandi", "Kochi", "Recommendation"],
  },
  {
    author: "Arun Photography",
    avatar: "AP",
    gradient: "from-blue-500 to-indigo-700",
    community: "Delhi Photographers Guild",
    time: "5h ago",
    content: "Shooting tip of the week: For golden hour sangeet shots, position the couple with the light source at 45° behind them. Creates that magical rim lighting every bride loves. See sample shot in comments 📸",
    likes: 89,
    comments: 23,
    tags: ["Photography", "Tip", "Sangeet"],
  },
  {
    author: "Green Events India",
    avatar: "GE",
    gradient: "from-emerald-500 to-teal-700",
    community: "Eco-Friendly Events",
    time: "1d ago",
    content: "We just completed a zero-waste Diwali corporate event for 300 guests. Total waste: 2.3 kg. Traditional events generate 50+ kg for same size. AMA in comments!",
    likes: 134,
    comments: 45,
    tags: ["Eco", "Corporate", "ZeroWaste"],
  },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState<"communities" | "events" | "feed">("communities");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 60%)"
        }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 text-center"
        >
          <p className="text-gold text-sm uppercase tracking-widest mb-3">The Living Ecosystem</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">
            Join India's <span className="text-gradient-gold">Event Community</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            5,000+ event professionals and enthusiasts across city communities. Attend events, share knowledge, build your network.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button className="bg-gold hover:bg-gold-dark text-background font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Create Community
            </Button>
            <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
              Browse All Communities
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex gap-1 bg-card/50 border border-border rounded-2xl p-1 max-w-md mx-auto">
          {(["communities", "events", "feed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-gold text-background shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">

          {/* Communities Tab */}
          {activeTab === "communities" && (
            <motion.div
              key="communities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {communityTypes.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-gradient-to-br ${c.gradient} border ${c.border} rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{c.icon}</span>
                      <div>
                        <Badge variant="outline" className="text-xs mb-1 border-current opacity-70">{c.type}</Badge>
                        <h3 className="font-bold text-foreground">{c.name}</h3>
                      </div>
                    </div>
                    {(c as any).isPrivate ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.purpose}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.members.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{c.posts}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.city}</span>
                    </div>
                    <Button size="sm" variant="outline" className="border-current/30 hover:bg-white/10 text-xs h-7">
                      {(c as any).isPrivate ? "Request" : "Join"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {c.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-black/20 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 max-w-3xl mx-auto"
            >
              <p className="text-center text-muted-foreground text-sm mb-6">
                Community events with secure escrow-based payment. Payments collected before the event, released in phases after.
              </p>
              {upcomingEvents.map((ev, i) => (
                <motion.div
                  key={ev.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.09 }}
                  className={`bg-gradient-to-r ${ev.gradient} border border-white/10 rounded-2xl p-6`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{ev.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">{ev.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">by {ev.organizer} · {ev.community}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{ev.date}, {ev.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{ev.filled}/{ev.capacity} joined</span>
                      </div>
                      {/* Capacity bar */}
                      <div className="w-full bg-black/20 rounded-full h-1.5 mb-3">
                        <div
                          className="bg-gold h-1.5 rounded-full transition-all"
                          style={{ width: `${(ev.filled / ev.capacity) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gold">
                          {ev.price === 0 ? "Free" : `₹${ev.price.toLocaleString("en-IN")}/person`}
                        </span>
                        <Button size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs">
                          {ev.filled >= ev.capacity ? "Join Waitlist" : "Book Now"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Feed Tab */}
          {activeTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 max-w-2xl mx-auto"
            >
              {posts.map((post, i) => (
                <motion.div
                  key={post.author}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${post.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.community} · {post.time}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-4">{post.content}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1.5 hover:text-crimson transition-colors">
                      <Heart className="w-4 h-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-gold transition-colors">
                      <MessageSquare className="w-4 h-4" /> {post.comments}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <Footer />
      <EveBuddy />
    </div>
  );
}
