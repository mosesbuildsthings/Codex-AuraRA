import React from "react";
import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AuraLogo — brand-kit compliant logo component.
 *
 * variant: "full" (icon + wordmark + tagline) | "icon" (icon only) | "wordmark" (icon + wordmark)
 * theme:   "light" (purple icon, dark text) | "dark" (white icon, white text)
 * size:    "sm" | "md" | "lg"
 */
export default function AuraLogo({
  variant = "full",
  theme = "light",
  size = "md",
  className,
}) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-lg", sub: "text-[9px]", mark: "w-4 h-4" },
    md: { icon: "w-9 h-9", text: "text-2xl", sub: "text-[10px]", mark: "w-5 h-5" },
    lg: { icon: "w-12 h-12", text: "text-3xl", sub: "text-xs", mark: "w-6 h-6" },
  }[size];

  const isDark = theme === "dark";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Icon mark — purple gradient circle with heart */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center shrink-0",
          sizes.icon,
          isDark
            ? "bg-white/20 ring-2 ring-white/30"
            : "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"
        )}
      >
        <HeartHandshake
          className={cn(sizes.mark, isDark ? "text-white" : "text-white")}
          strokeWidth={1.8}
        />
      </div>

      {/* Wordmark */}
      {variant !== "icon" && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight leading-none",
              sizes.text,
              isDark ? "text-white" : "text-[#1F2937]"
            )}
          >
            Aura
          </span>
          {variant === "full" && (
            <span
              className={cn(
                "font-medium tracking-widest uppercase mt-0.5",
                sizes.sub,
                isDark ? "text-white/70" : "text-[#6B7280]"
              )}
            >
              Relationship AI
            </span>
          )}
        </div>
      )}
    </div>
  );
}