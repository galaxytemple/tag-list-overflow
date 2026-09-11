import React from "react";

export interface DefaultTagProps {
  label: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: number;
  paddingX?: number;
  border?: number;
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
  fontFamily: "inherit",
  minWidth: 0,
  flexShrink: 1,
};

const defaultColorsStyle: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  color: "#374151",
  border: "1px solid #e5e7eb",
};

/**
 * Clean, lightweight, unopinionated default tag component with accessibility role.
 */
export const DefaultTag: React.FC<DefaultTagProps> = ({
  label,
  className,
  style,
  fontSize,
  paddingX,
  border,
}) => {
  const dynamicStyle: React.CSSProperties = {};
  if (fontSize !== undefined) dynamicStyle.fontSize = `${fontSize}px`;
  if (paddingX !== undefined) dynamicStyle.padding = `4px ${paddingX}px`;
  if (border !== undefined) dynamicStyle.borderWidth = `${border}px`;

  return (
    <span
      role="listitem"
      className={className}
      style={{
        ...baseTagStyle,
        ...dynamicStyle,
        ...(className ? {} : defaultColorsStyle),
        ...style,
      }}
    >
      {label}
    </span>
  );
};
