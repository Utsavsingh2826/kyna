import React, { ReactNode, useRef, useEffect, useState } from "react";
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
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stickyColumn, setStickyColumn] = useState<"left" | "right" | "none">(
    "none"
  );

  useEffect(() => {
    const updateStickyColumn = () => {
      if (!leftRef.current || !rightRef.current || !containerRef.current)
        return;

      const leftHeight = leftRef.current.scrollHeight;
      const rightHeight = rightRef.current.scrollHeight;
      const containerHeight = containerRef.current.scrollHeight;
      const viewportHeight = window.innerHeight;

      // Only make a column sticky if:
      // 1. There's a significant height difference (more than viewport height)
      // 2. The container is tall enough to benefit from sticky behavior
      const heightDifference = Math.abs(leftHeight - rightHeight);
      const shouldUseSticky =
        heightDifference > viewportHeight * 0.5 &&
        containerHeight > viewportHeight * 1.5;

      if (!shouldUseSticky) {
        setStickyColumn("none");
        return;
      }

      if (leftHeight < rightHeight) {
        setStickyColumn("left");
      } else if (rightHeight < leftHeight) {
        setStickyColumn("right");
      } else {
        setStickyColumn("none");
      }
    };

    // Initial check
    updateStickyColumn();

    // Check on window resize
    const handleResize = () => {
      updateStickyColumn();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [leftColumn, rightColumn]);

  return (
    <div
      ref={containerRef}
      className={cn("grid md:grid-cols-2", gap, className)}
    >
      <div
        ref={leftRef}
        className={cn(
          stickyColumn === "left" && "md:sticky md:top-4 md:self-start",
          leftColumnClassName
        )}
      >
        {leftColumn}
      </div>
      <div
        ref={rightRef}
        className={cn(
          stickyColumn === "right" && "md:sticky md:top-4 md:self-start",
          rightColumnClassName
        )}
      >
        {rightColumn}
      </div>
    </div>
  );
}
