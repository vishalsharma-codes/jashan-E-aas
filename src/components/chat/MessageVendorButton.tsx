import { useState, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getOrCreateConversation, type VendorRef } from "@/lib/chatApi";
import { userDisplayName } from "@/lib/chatTypes";
import { cn } from "@/lib/utils";

/**
 * Drop this on any vendor card / vendor profile:
 *
 *   <MessageVendorButton vendor={{ userId: vendor.user_id, name: vendor.business_name,
 *                                  avatar: vendor.logo_url, service: vendor.category }} />
 *
 * `userId` must be the vendor's AUTH user id (auth.users.id).
 */
export function MessageVendorButton({
  vendor,
  className,
  children,
}: {
  vendor: VendorRef;
  className?: string;
  children?: ReactNode;
}) {
  const auth = useAuth() as { user: any; loading?: boolean; isLoading?: boolean };
  const user = auth.user;
  const loading = auth.loading ?? auth.isLoading ?? false;
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);

  const open = async () => {
    if (loading) return; // still checking the session: don't treat as logged out

    if (!user) {
      toast.error("Please log in first to use Baatein", {
        description: "Sign in to chat with vendors and the community.",
      });
      navigate("/auth", { state: { from: location.pathname + location.search } });
      return;
    }
    if (user.id === vendor.userId) {
      toast.info("This is your own profile");
      return;
    }

    setBusy(true);
    try {
      const id = await getOrCreateConversation(
        { id: user.id, name: userDisplayName(user) },
        vendor
      );
      navigate(`/chat/${id}`);
    } catch {
      toast.error("Couldn't open the chat. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={open}
      disabled={busy}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-gold/50 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/10 hover:border-gold transition-colors disabled:opacity-60",
        className
      )}
    >
      {children ?? (
        <>
          <MessageCircle className="w-4 h-4" />
          {busy ? "Opening…" : "Message"}
        </>
      )}
    </button>
  );
}