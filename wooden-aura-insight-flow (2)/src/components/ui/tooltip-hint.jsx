import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A lightweight tooltip that shows on hover/tap.
 * Usage: <TooltipHint text="This does X" />
 * Or wrap an element: <TooltipHint text="Hint" asChild><button>...</button></TooltipHint>
 */
export default function TooltipHint({ text, className, children, side = "top" }) {
  const [open, setOpen] = useState(false);

  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side] || "bottom-full left-1/2 -translate-x-1/2 mb-2";

  return (
    <span
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onTouchStart={() => setOpen(o => !o)}
    >
      {children || <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />}
      {open && (
        <span
          className={cn(
            "absolute z-50 w-48 px-3 py-2 rounded-lg bg-foreground text-background text-xs leading-relaxed shadow-lg pointer-events-none",
            positionClass
          )}
        >
          {text}
        </span>
      )}
    </span>
  );
}