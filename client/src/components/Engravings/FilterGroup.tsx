import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isSubGroup?: boolean;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  children,
  defaultOpen = false,
  isSubGroup = false,
}) => {
  return (
    <details className="eng-group" open={defaultOpen}>
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
