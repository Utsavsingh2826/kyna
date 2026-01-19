import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isSubGroup?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  children,
  defaultOpen = false,
  isSubGroup = false,
  onToggle,
}) => {
  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (onToggle) {
      onToggle(e.currentTarget.open);
    }
  };

  return (
    // Use `defaultOpen` (uncontrolled) so the user’s open/close choice persists
    // across re-renders. Using `open={defaultOpen}` would forcibly reset the
    // group when filters change (e.g., unchecking a diamond shape).
    <details className="eng-group" open={defaultOpen} onToggle={handleToggle}>
      <summary>
        {isSubGroup ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ChevronRight size={14} aria-hidden className="chevron-right" />
            {title}
          </span>
        ) : (
          <>
            {title}
            <ChevronDown size={16} aria-hidden className="chevron" />
          </>
        )}
      </summary>
      <div className="eng-sublist">{children}</div>
    </details>
  );
};
