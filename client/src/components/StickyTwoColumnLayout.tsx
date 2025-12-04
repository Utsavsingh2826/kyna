import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyTwoColumnLayoutProps {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
  className?: string;
  gap?: string;
  leftColumnClassName?: string;
  rightColumnClassName?: string;
}

export function StickyTwoColumnLayout({
  leftColumn,
  rightColumn,
  className,
  gap = "gap-8",
  leftColumnClassName,
  rightColumnClassName,
}: StickyTwoColumnLayoutProps) {
  // Simpler, reliable sticky behavior:
  // Always make the left column sticky on medium+ screens so it remains visible
  // while the right column (main content) is scrolled. Avoid complex heuristics
  // that can fail depending on content heights.

  return (
    <div className={cn("grid md:grid-cols-2", gap, className)}>
      <div className={cn(leftColumnClassName)}>
        <div
          className={cn(
            "md:sticky md:top-16 md:self-start md:max-h-[calc(100vh-4rem)] md:overflow-auto"
          )}
        >
          {leftColumn}
        </div>
      </div>
      <div className={cn(rightColumnClassName)}>{rightColumn}</div>
    </div>
  );
}
