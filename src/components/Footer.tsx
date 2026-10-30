import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const footerLinks = {
    platform: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Trust & Safety", href: "/trust-safety" },
      { label: "Booking System", href: "/booking-system" },
      { label: "Rewards & Coins", href: "/rewards" },
      { label: "Community", href: "/community" },
    ],
    vendors: [
      { label: "List Your Services", href: "/for-partners" },
      { label: "Ultra Gold Plan", href: "/ultra-gold" },
      { label: "Vendor Dashboard", href: "/vendor-dashboard" },
      { label: "Compare Vendors", href: "/compare" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  };

  return (
    <footer className="bg-charcoal border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <span className="font-display text-xl text-primary-foreground font-bold">ج</span>
              </div>
              <span className="font-display text-xl text-foreground">
                Jashan<span className="text-gold">-E-Aas</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-2 max-w-sm text-sm leading-relaxed">
              A cinematic way to plan your celebration. Discover vendors through their reels, chat with them directly, and book with your payment held safely in escrow until the event is done.
            </p>
            <p className="text-gold/60 text-xs mb-6 font-medium">जश्न-ए-आस — The Joy of Possibilities</p>

            {/* Social links */}
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">For Vendors</h4>
            <ul className="space-y-2.5">
              {footerLinks.vendors.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-gold transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-6 text-muted-foreground text-sm">
          <a href="mailto:hello@jashanEaas.in" className="flex items-center gap-2 hover:text-gold transition-colors">
            <Mail className="w-4 h-4" />
            hello@jashanEaas.in
          </a>
          <a href="tel:+911800000000" className="flex items-center gap-2 hover:text-gold transition-colors">
            <Phone className="w-4 h-4" />
            +91 8373901813
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Delhi
          </span>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>© 2026 Jashan-E-Aas. All rights reserved. India's most trusted event marketplace.</p>
        </div>
      </div>
    </footer>
  );
};
