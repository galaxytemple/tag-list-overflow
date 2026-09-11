import React from "react";

export interface DefaultTagProps {
  label: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const baseTagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "14px",
  lineHeight: "1.25",
  padding: "4px 8px",
  borderRadius: "9999px",
  whiteSpace: "nowrap",
  userSelect: "none",
  boxSizing: "border-box",
};

const defaultColorsStyle: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  color: "#374151",
  border: "1px solid #e5e7eb",
};

/**
 * Clean, lightweight, unopinionated default tag component with accessibility role.
 */
export const DefaultTag: React.FC<DefaultTagProps> = ({ label, className, style }) => {
  return (
    <span
      role="listitem"
      className={className}
      style={{
        ...baseTagStyle,
        ...(className ? {} : defaultColorsStyle),
        ...style,
      }}
    >
      {label}
    </span>
  );
};
