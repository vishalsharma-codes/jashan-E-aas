import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, Star, TrendingUp, Users, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";

const benefits = [
  { icon: TrendingUp, title: "Grow Your Business", desc: "Get discovered by thousands of event planners across India looking for premium vendors." },
  { icon: Users, title: "Quality Leads", desc: "Connect directly with serious clients who are ready to book and have the budget." },
  { icon: Star, title: "Build Your Reputation", desc: "Showcase your portfolio, collect reviews, and build a strong online presence." },
  { icon: CheckCircle, title: "Live Bidding System", desc: "Win contracts through our unique live bidding system — compete fairly and transparently." },
];

const plans = [
  { name: "Starter", price: "Free", features: ["5 leads/month", "Basic profile", "Chat with clients", "1 portfolio item"] },
  { name: "Pro", price: "₹2,999/mo", features: ["Unlimited leads", "Featured profile", "Video showcase", "Priority support", "Analytics dashboard"], highlight: true },
  { name: "Enterprise", price: "Custom", features: ["Dedicated account manager", "Custom branding", "API integration", "Team accounts", "SLA guarantee"] },
];

const ForPartners = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DynamicBackground />
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">Join 15,000+ Verified Vendors</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Grow Your Event<br />
              <span className="text-gold">Business With Us</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              India's premier event marketplace connects you with high-value clients across the country. 
              Start receiving qualified leads today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-background font-semibold h-14 px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                List Your Business Free
              </Button>
              <Button size="lg" variant="outline" className="border-gold/50 text-foreground hover:bg-gold/10 h-14 px-8">
                See How It Works
              </Button>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-20">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Why Vendors Choose <span className="text-gold">Jashan-E-Aas</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-center mb-12">Start for free. Upgrade as you grow.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-card rounded-2xl p-6 border-2 ${plan.highlight ? "border-gold" : "border-border"} relative`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gold text-background">Most Popular</Badge>
                    </div>
                  )}
                  <h3 className="font-bold text-xl text-foreground mb-1">{plan.name}</h3>
                  <p className="text-3xl font-bold text-gold mb-6">{plan.price}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.highlight ? "bg-gold hover:bg-gold-dark text-background" : ""}`} variant={plan.highlight ? "default" : "outline"}>
                    Get Started
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Badge component inline since it's needed
function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}

export default ForPartners;
