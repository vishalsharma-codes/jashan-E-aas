import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, Star, Eye, MessageSquare, Calendar, Settings,
  LogOut, BarChart2, Bell, Plus, Check, X, ChevronRight,
  DollarSign, Zap, Award, Users, Clock, ToggleLeft, ToggleRight,
  FileText, Briefcase, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { EveBuddy } from "@/components/EveBuddy";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  { label: "Profile Views", value: "1,247", change: "+12%", icon: Eye, color: "text-blue-400", trend: "up" },
  { label: "Inquiries", value: "38", change: "+8%", icon: MessageSquare, color: "text-gold", trend: "up" },
  { label: "Bookings", value: "12", change: "+25%", icon: Calendar, color: "text-emerald-400", trend: "up" },
  { label: "Avg. Rating", value: "4.9", change: "+0.1", icon: Star, color: "text-yellow-400", trend: "up" },
];

const recentInquiries = [
  { name: "Priya Sharma", event: "Wedding", date: "Dec 2026", budget: "₹5L", status: "New", avatar: "PS" },
  { name: "Rahul Mehta", event: "Corporate Gala", date: "Jan 2027", budget: "₹2L", status: "Replied", avatar: "RM" },
  { name: "Anjali Singh", event: "Birthday Party", date: "Nov 2026", budget: "₹80K", status: "Booked", avatar: "AS" },
  { name: "Dev Kapoor", event: "Concert", date: "Dec 2026", budget: "₹10L", status: "New", avatar: "DK" },
];

const kanbanLeads = {
  new: [
    { name: "Priya Sharma", event: "Wedding", budget: "₹5L", date: "Dec 2026" },
    { name: "Dev Kapoor", event: "Concert", budget: "₹10L", date: "Dec 2026" },
  ],
  contacted: [
    { name: "Meena Gupta", event: "Anniversary", budget: "₹1.5L", date: "Nov 2026" },
  ],
  proposed: [
    { name: "Rahul Mehta", event: "Corporate", budget: "₹2L", date: "Jan 2027" },
  ],
  won: [
    { name: "Anjali Singh", event: "Birthday", budget: "₹80K", date: "Nov 2026" },
  ],
};

const subscriptionTiers = [
  { name: "Free", price: "₹0/mo", features: ["Basic listing", "5 portfolio photos", "Standard support"], current: false },
  { name: "Silver", price: "₹999/mo", features: ["Priority listing", "20 portfolio photos", "Analytics dashboard", "SMS notifications"], current: true },
  { name: "Gold", price: "₹2,499/mo", features: ["Featured listing", "Unlimited photos + video", "Full analytics", "Dedicated support", "Smart pricing tool"], current: false },
  { name: "Platinum", price: "₹4,999/mo", features: ["Top placement always", "Agent Eve works for you", "Magazine feature", "Zero commission on first booking"], current: false },
];

const monthlyRevenue = [
  { month: "Jan", value: 45000 },
  { month: "Feb", value: 62000 },
  { month: "Mar", value: 58000 },
  { month: "Apr", value: 91000 },
  { month: "May", value: 78000 },
  { month: "Jun", value: 105000 },
];
const maxRevenue = Math.max(...monthlyRevenue.map((r) => r.value));

export default function VendorDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const statusColor = (s: string) => {
    if (s === "New") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (s === "Replied") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (s === "Booked") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-xl font-bold text-background">
                  {user?.email?.[0]?.toUpperCase() || "V"}
                </div>
                <div>
                  <h1 className="font-bold text-xl">Vendor Dashboard</h1>
                  <p className="text-sm text-muted-foreground">{user?.email || "vendor@example.com"}</p>
                  <Badge className="mt-1 bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs">Silver Plan</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Emergency availability toggle */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${emergencyAvailable ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-card border-border text-muted-foreground"}`}
                  onClick={() => setEmergencyAvailable(!emergencyAvailable)}
                >
                  {emergencyAvailable ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  <span className="text-xs font-medium">Emergency Available</span>
                  {emergencyAvailable && <Zap className="w-3 h-3" />}
                </div>
                <Button variant="outline" size="sm" className="border-border">
                  <Bell className="w-4 h-4 mr-1" /> 3
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              {[
                { value: "overview", label: "Overview", icon: BarChart2 },
                { value: "leads", label: "Lead Kanban", icon: Briefcase },
                { value: "analytics", label: "Analytics", icon: TrendingUp },
                { value: "portfolio", label: "Portfolio", icon: Image },
                { value: "subscription", label: "Plan", icon: Award },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs">
                    <Icon className="w-3.5 h-3.5" /> {t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-card border border-border rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-xs text-emerald-400">{stat.change}</span>
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent inquiries */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 className="font-bold">Recent Inquiries</h3>
                    <Badge variant="outline" className="text-xs">{recentInquiries.length} new</Badge>
                  </div>
                  <div className="divide-y divide-border">
                    {recentInquiries.map((inq, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/10 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/40 to-gold-dark/40 flex items-center justify-center text-xs font-bold">{inq.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{inq.name}</p>
                          <p className="text-xs text-muted-foreground">{inq.event} · {inq.date} · {inq.budget}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${statusColor(inq.status)}`}>{inq.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart pricing */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Smart Pricing Tool</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Peak Season (Oct–Feb)", rate: "₹1,20,000", tag: "Current" },
                      { label: "Off-peak Season", rate: "₹85,000", tag: "" },
                      { label: "Weekend Premium", rate: "+₹15,000", tag: "Auto" },
                      { label: "Emergency/Last-minute", rate: "+30%", tag: "Active" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gold">{item.rate}</span>
                          {item.tag && <Badge variant="outline" className="text-xs text-xs py-0">{item.tag}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="w-full mt-4 bg-gold hover:bg-gold-dark text-background text-xs">
                    Edit Pricing Rules
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Lead Kanban */}
            <TabsContent value="leads">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {(Object.entries(kanbanLeads) as [string, typeof kanbanLeads.new][]).map(([col, leads]) => (
                  <div key={col} className="min-w-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm capitalize">{col === "proposed" ? "Proposal Sent" : col === "won" ? "Won ✓" : col}</h3>
                      <Badge variant="outline" className="text-xs">{leads.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {leads.map((lead, i) => (
                        <motion.div
                          key={`${lead.name}-${i}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`bg-card border rounded-xl p-3 cursor-pointer hover:border-gold/30 transition-colors ${col === "won" ? "border-emerald-500/30" : "border-border"}`}
                        >
                          <p className="font-semibold text-xs">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.event}</p>
                          <p className="text-xs text-gold font-medium mt-1">{lead.budget}</p>
                          <p className="text-xs text-muted-foreground">{lead.date}</p>
                        </motion.div>
                      ))}
                      <button className="w-full border-2 border-dashed border-border rounded-xl py-2 text-xs text-muted-foreground hover:border-gold/30 hover:text-gold transition-colors">
                        + Add Lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue chart */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Monthly Revenue</h3>
                  <div className="flex items-end gap-2 h-32">
                    {monthlyRevenue.map((r) => (
                      <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(r.value / maxRevenue) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="w-full bg-gradient-to-t from-gold to-gold-dark rounded-t-md"
                        />
                        <span className="text-xs text-muted-foreground">{r.month}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">Total YTD: <span className="text-gold font-bold">₹4,39,000</span></p>
                </div>

                {/* Performance metrics */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Performance Score</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Response Rate", value: 94, color: "bg-emerald-500" },
                      { label: "Bid Win Rate", value: 68, color: "bg-gold" },
                      { label: "Profile Completeness", value: 85, color: "bg-blue-500" },
                      { label: "Client Satisfaction", value: 98, color: "bg-purple-500" },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{metric.label}</span>
                          <span className="font-semibold">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 0.8 }}
                            className={`${metric.color} h-1.5 rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground">
                    <p>📊 Your bid win rate of <span className="text-gold font-semibold">68%</span> is above average for Mumbai photographers (avg: 52%)</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Portfolio */}
            <TabsContent value="portfolio">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">Portfolio Albums</h3>
                <Button size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Album
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: "Wedding Portfolio", items: 24, icon: "💒", gradient: "from-rose-500/30 to-pink-700/20" },
                  { name: "Corporate Events", items: 12, icon: "🏢", gradient: "from-blue-500/30 to-indigo-700/20" },
                  { name: "Birthday Highlights", items: 18, icon: "🎉", gradient: "from-gold/30 to-gold/10" },
                  { name: "Before / After", items: 8, icon: "🔄", gradient: "from-emerald-500/30 to-teal-700/20" },
                  { name: "Drone & Aerial", items: 15, icon: "🚁", gradient: "from-purple-500/30 to-violet-700/20" },
                  { name: "Add New Album", items: 0, icon: "+", gradient: "from-muted/30 to-muted/10", isAdd: true },
                ].map((album) => (
                  <div
                    key={album.name}
                    className={`bg-gradient-to-br ${album.gradient} border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform ${(album as any).isAdd ? "border-dashed border-2 border-gold/30 hover:border-gold/60" : ""}`}
                  >
                    <span className="text-4xl">{album.icon}</span>
                    <p className="font-semibold text-sm text-center">{album.name}</p>
                    {!((album as any).isAdd) && <p className="text-xs text-muted-foreground">{album.items} photos</p>}
                  </div>
                ))}
              </div>

              {/* 30-sec video intro */}
              <div className="mt-6 bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Video Introduction</h3>
                    <p className="text-sm text-muted-foreground">A 30-second intro video prominently displayed on your profile. Increases inquiries by 60%.</p>
                  </div>
                  <Button size="sm" className="bg-gold hover:bg-gold-dark text-background text-xs flex-shrink-0">Upload Video</Button>
                </div>
              </div>
            </TabsContent>

            {/* Subscription */}
            <TabsContent value="subscription">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {subscriptionTiers.map((tier, i) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative bg-card border rounded-2xl p-5 ${tier.current ? "border-gold ring-2 ring-gold/30" : "border-border"}`}
                  >
                    {tier.current && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-background text-xs">Current Plan</Badge>}
                    <h3 className={`font-bold text-lg mb-0.5 ${tier.current ? "text-gold" : ""}`}>{tier.name}</h3>
                    <p className="font-bold text-xl mb-4">{tier.price}</p>
                    <ul className="space-y-2 mb-5">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      className={`w-full text-xs ${tier.current ? "bg-gold hover:bg-gold-dark text-background" : ""}`}
                      variant={tier.current ? "default" : "outline"}
                      disabled={tier.current}
                    >
                      {tier.current ? "Current Plan" : "Upgrade"}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <EveBuddy />
    </div>
  );
}
