import { useState } from "react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { Menu, X, Grid3X3 } from "lucide-react";
import { CategoryMindmap } from "./outerCategory/CategoryMindmap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useUnreadCount } from "@/hooks/useChat";

const navLinks = [
  { label: "Vendors", href: "/vendors" },
  { label: "For Partners", href: "/for-partners" },
  // { label: "How It Works", href: "/how-it-works" },
  { label: "Ultra Gold", href: "/ultra-gold" },
  { label: "Community", href: "/community" },
  { label: "Baatein", href: "/chat" }, // always visible; login is checked on click
  { label: "Jhalak", href: "/reels" },
  { label: "Sign In", href: "/auth" },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const navigate = useNavigate();

  const auth = useAuth() as { user: any; loading?: boolean; isLoading?: boolean };
  const user = auth.user;
  const loading = auth.loading ?? auth.isLoading ?? false;
  const unreadCount = useUnreadCount();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there";

  // Baatein needs a login: logged-out visitors get an alert and are sent to /auth.
  // They come back to Baatein after signing in (the /auth page reads state.from).
  const handleLinkClick = (e: MouseEvent, link: { label: string; href: string }) => {
    if (link.label !== "Baatein") return;

    if (loading) {
      e.preventDefault(); // still checking the session: don't treat as logged out
      return;
    }
    if (user) return; // logged in: the link works normally

    e.preventDefault();
    toast.error("Please log in first to use Baatein", {
      description: "Sign in to chat with vendors and the community.",
    });
    navigate("/auth", { state: { from: link.href } });
  };

  // label + unread badge for the chat link
  const renderLabel = (link: { label: string }) => {
    if (link.label === "Sign In" && user) return `Hi, ${displayName}`;
    if (link.label === "Baatein") {
      return (
        <span className="inline-flex items-center gap-1.5">
          Baatein
          {user && unreadCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
      );
    }
    return link.label;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-30 glass-dark border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                  <span className="font-display text-xl text-primary-foreground font-bold">ج</span>
                </div>
                <span className="font-display text-xl text-foreground">
                  Jashan<span className="text-gold">-E-Aas</span>
                </span>
              </Link>
            </motion.div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={link.href}
                    onClick={(e) => handleLinkClick(e, link)}
                    className={`text-muted-foreground hover:text-foreground transition-colors font-medium text-sm ${
                      link.label === "Ultra Gold" ? "text-gold hover:text-gold-dark" : ""
                    }`}
                  >
                    {renderLabel(link)}
                  </Link>
                </motion.div>
              ))}

              <LanguageSwitcher />

              {/* Category mindmap trigger */}
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setIsCategoryOpen(true)}
                className="w-10 h-10 rounded-full border-2 border-gold/50 flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all group"
                aria-label="Browse Categories"
              >
                <Grid3X3 className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              className="inline-flex gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2 border border-transparent h-9 w-9 md:hidden justify-start items-start flex-col"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <LanguageSwitcher />
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`block text-muted-foreground hover:text-foreground transition-colors font-medium ${
                    link.label === "Ultra Gold" ? "text-gold" : ""
                  }`}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleLinkClick(e, link);
                  }}
                >
                  {renderLabel(link)}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCategoryOpen(true);
                }}
                className="flex items-center gap-2 text-gold font-medium"
              >
                <Grid3X3 className="w-5 h-5" />
                Browse Categories
              </button>
            </div>
          </motion.div>
        )}
      </nav>
      <CategoryMindmap isOpen={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} />
    </>
  );
};