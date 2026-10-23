// src/components/UserMenu.tsx
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  User, CalendarCheck, MessageCircle, Heart, Gift, GitCompare, Crown,
  Clapperboard, LayoutDashboard, Store, Settings, ShieldCheck, LogOut,
  ChevronDown, type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import EditProfileDialog from "@/components/EditProfileDialog";
// Your existing hook. Adjust the import path if it lives elsewhere.
import { useUnreadCount } from "@/hooks/useUnreadCount";

type Item = {
  label: string;
  sub?: string;
  to: string;
  icon: LucideIcon;
  action?: "profile"; // opens the Edit Profile popup instead of navigating
  badge?: number;
  premium?: boolean;
};

type Props = {
  variant?: "desktop" | "mobile";
  /** Called after any item is clicked (use it to close the mobile menu). */
  onNavigate?: () => void;
};

const gold = "text-[#d4af37]";

export default function UserMenu({ variant = "desktop", onNavigate }: Props) {
  const { user, signOut } = useAuth() as any; // rename signOut if your hook differs
  const navigate = useNavigate();

  // Hover-to-open (desktop). A short close delay lets the mouse travel
  // from the button to the panel without the menu flickering shut.
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  const unread = (useUnreadCount?.() as number) ?? 0;

  const meta = user?.user_metadata ?? {};
  const fullName: string =
    meta.full_name || meta.name || user?.email?.split("@")[0] || "User";
  const firstName = fullName.split(" ")[0];
  const email: string = user?.email ?? "";
  const avatarUrl: string | undefined = meta.avatar_url;
  const role: string = (meta.role || "customer").toLowerCase();
  const isVendor = role === "vendor";
  const isUltraGold = Boolean(meta.ultra_gold || meta.is_ultra_gold);

  const groups: Item[][] = useMemo(
    () => [
      [
        { label: "My Profile", to: "/account", icon: User, action: "profile" },
        { label: "My Bookings", to: "/booking-system", icon: CalendarCheck },
        { label: "Baatein: Messages", to: "/chat", icon: MessageCircle, badge: unread },
        { label: "Saved Vendors", to: "/account?tab=saved", icon: Heart },
      ],
      [
        // { label: "Rewards & Points", to: "/rewards", icon: Gift },
        { label: "Compare Vendors", to: "/compare", icon: GitCompare },
        { label: "Ultra Gold Membership", to: "/ultra-gold", icon: Crown, premium: true },
        { label: "Jhalak: My Reels", to: "/reels", icon: Clapperboard },
      ],
      [
        isVendor
          ? { label: "Vendor Dashboard", to: "/vendor-dashboard", icon: LayoutDashboard }
          : { label: "Become a Vendor", sub: "List Your Business", to: "/for-partners", icon: Store },
      ],
      [
        { label: "Settings", to: "/account?tab=settings", icon: Settings },
        { label: "Trust & Safety / Help Center", to: "/trust-safety", icon: ShieldCheck },
      ],
    ],
    [unread, isVendor]
  );

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Could not log out. Please try again.");
    } finally {
      onNavigate?.();
    }
  };

  if (!user) return null;

  const AvatarBlock = ({ size }: { size: string }) => (
    <Avatar className={`${size} ring-2 ring-[#d4af37]/70`}>
      <AvatarImage src={avatarUrl} alt={fullName} />
      <AvatarFallback className="bg-gradient-to-br from-[#f3d77a] to-[#b8922a] font-display font-semibold text-black">
        {firstName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  const Badges = () => (
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white capitalize">
        {isVendor ? "Vendor" : "Customer"}
      </span>
      {isUltraGold && (
        <span className="rounded-full bg-gradient-to-r from-[#b8922a] via-[#f3d77a] to-[#b8922a] px-2.5 py-0.5 text-[11px] font-semibold text-black">
          Ultra Gold Member
        </span>
      )}
    </div>
  );

  const Header = () => (
    <div className="p-4 pb-3">
      <div className="flex items-start gap-3">
        <div className="relative">
          <AvatarBlock size="h-16 w-16" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight text-white truncate">{firstName}</p>
          <p className="text-xs text-white/50 truncate">{email}</p>
          <Badges />
        </div>
      </div>
      {/* <div className="mt-2 text-right">
        <Link
          to="/account"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            setProfileOpen(true);
            onNavigate?.();
          }}
          className={`text-sm underline underline-offset-4 ${gold} hover:opacity-80`}
        >
          View Profile
        </Link>
      </div> */}
    </div>
  );

  const rowClass =
    "group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/90 outline-none transition-colors " +
    "hover:bg-[#d4af37]/10 focus:bg-[#d4af37]/10 data-[highlighted]:bg-[#d4af37]/10";

  const Row = ({ item }: { item: Item }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.to}
        onClick={(e) => {
          if (item.action === "profile") {
            e.preventDefault();
            setOpen(false);
            setProfileOpen(true);
          }
          onNavigate?.();
        }}
        className={`${rowClass} ${item.premium ? gold : ""}`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${gold} transition-transform group-hover:translate-x-0.5`} />
        <span className="flex-1 min-w-0">
          <span className="block truncate">{item.label}</span>
          {item.sub && <span className="block text-xs text-white/50">{item.sub}</span>}
        </span>
        {item.badge ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1.5 text-[11px] font-bold text-black">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
        {item.premium && (
          <span className="relative overflow-hidden rounded-full bg-gradient-to-r from-white/90 to-[#f3d77a] px-2 py-0.5 text-[10px] font-bold tracking-wide text-black">
            PREMIUM
            <motion.span
              className="absolute inset-y-0 -left-6 w-6 -skew-x-12 bg-white/70"
              animate={{ x: [0, 90] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
            />
          </span>
        )}
      </Link>
    );
  };

  const LogoutRow = (
    <button
      type="button"
      onClick={handleLogout}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 focus:bg-red-500/10 outline-none"
    >
      <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      Log out
    </button>
  );

  const profileDialog = (
    <EditProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
  );

  const Divider = () => <div className="my-1.5 h-px bg-white/10" />;

  /* ---------- Mobile: inline list inside the mobile menu ---------- */
  if (variant === "mobile") {
    return (
      <>
      <div className="rounded-2xl border border-[#d4af37]/30 bg-[#0d0d12]/90 backdrop-blur-xl">
        <Header />
        <div className="px-2 pb-2">
          {groups.map((g, i) => (
            <div key={i}>
              <Divider />
              {g.map((item) => <Row key={item.label} item={item} />)}
            </div>
          ))}
          <Divider />
          {LogoutRow}
        </div>
      </div>
      {profileDialog}
      </>
    );
  }

  /* ---------- Desktop: dropdown ---------- */
  return (
    <>
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onPointerEnter={openMenu}
          onPointerLeave={closeMenu}
          onPointerDown={(e) => e.preventDefault()} // stops click from toggling it shut after hover-open
          onClick={openMenu} // touch / tablet fallback
          className="group flex items-center gap-2 rounded-full py-1 pl-3 pr-1 text-sm text-white outline-none transition-colors hover:text-[#d4af37] focus-visible:ring-2 focus-visible:ring-[#d4af37]/60"
          aria-label="Open account menu"
        >
          <span>Hi, {firstName}</span>
          <AvatarBlock size="h-8 w-8" />
          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        alignOffset={-16}
        sideOffset={10}
        collisionPadding={8}
        onPointerEnter={openMenu}
        onPointerLeave={closeMenu}
        className="relative w-[360px] max-w-[calc(100vw-16px)] rounded-2xl border border-[#d4af37]/30 bg-gradient-to-b from-[#17181f]/95 to-[#0d0d12]/95 p-0 text-white shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-xl
                   data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-top-2"
      >
        {/* Arrow pointer */}
        <span className="absolute -top-1.5 right-[26px] h-3 w-3 rotate-45 border-l border-t border-[#d4af37]/30 bg-[#17181f]" />

        <Header />

        <div className="px-2 pb-2">
          {groups.map((g, i) => (
            <div key={i}>
              <DropdownMenuSeparator className="my-1.5 bg-white/10" />
              {g.map((item) => (
                <DropdownMenuItem key={item.label} asChild className="p-0 focus:bg-transparent">
                  <Row item={item} />
                </DropdownMenuItem>
              ))}
            </div>
          ))}
          <DropdownMenuSeparator className="my-1.5 bg-white/10" />
          <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
            {LogoutRow}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    {profileDialog}
    </>
  );
}