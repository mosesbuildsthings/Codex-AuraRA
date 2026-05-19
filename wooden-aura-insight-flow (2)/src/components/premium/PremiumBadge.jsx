import React from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PremiumBadge — shown next to user name/profile throughout the app.
 * size: "sm" | "md"
 */
export default function PremiumBadge({ size = "sm", className }) {
  if (size === "md") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
        "bg-gradient-to-r from-chart-3/20 to-yellow-300/20 text-chart-3 border border-chart-3/30",
        className
      )}>
        <Crown className="w-3 h-3" />
        Premium
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
      "bg-chart-3/15 text-chart-3 border border-chart-3/25",
      className
    )}>
      <Crown className="w-2.5 h-2.5" />
      PRO
    </span>
  );
}