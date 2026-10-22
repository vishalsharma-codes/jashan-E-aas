import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

const SIZES = {
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-32 h-32 text-5xl",
};

export function ChatAvatar({ name, src, size = "md", online, className }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();

  return (
    <div className={cn("relative shrink-0", className)}>
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className={cn("rounded-full object-cover border border-gold/30", SIZES[size])}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-gold to-gold-dark text-primary-foreground font-display font-semibold flex items-center justify-center",
            SIZES[size]
          )}
        >
          {initial}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
      )}
    </div>
  );
}
