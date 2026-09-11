import React from "react";
import type { OverflowInfo } from "../types";

export interface DefaultOverflowProps {
  info: OverflowInfo;
  overflowLabel?: string | ((count: number) => React.ReactNode);
  collapseLabel?: string | (() => React.ReactNode);
  clickable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: number;
  overflowPaddingX?: number;
  border?: number;
  role?: string;
}

const defaultOverflowStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "14px",
  lineHeight: "1.25",
  padding: "4px 8px",
  borderRadius: "9999px",
  backgroundColor: "#e5e7eb",
  color: "#1f2937",
  border: "1px solid #d1d5db",
  whiteSpace: "nowrap",
  fontWeight: 500,
  userSelect: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  appearance: "none",
  cursor: "default",
  flexShrink: 0,
};

const clickableStyle: React.CSSProperties = {
  ...defaultOverflowStyle,
  cursor: "pointer",
};

/**
 * Default "+N more" / "Show less" badge component with accessibility support.
 */
export const DefaultOverflow: React.FC<DefaultOverflowProps> = ({
  info,
  overflowLabel,
  collapseLabel,
  clickable,
  className,
  style,
  fontSize,
  overflowPaddingX,
  border,
  role,
}) => {
  const { count, isExpanded, toggle } = info;

  let content: React.ReactNode;

  if (isExpanded) {
    if (typeof collapseLabel === "function") {
      content = collapseLabel();
    } else if (typeof collapseLabel === "string") {
      content = collapseLabel;
    } else {
      content = "Show less";
    }
  } else {
    if (typeof overflowLabel === "function") {
      content = overflowLabel(count);
    } else {
      const suffix = overflowLabel !== undefined ? overflowLabel : "more";
      content = suffix ? `+${count.toLocaleString()} ${suffix}` : `+${count.toLocaleString()}`;
    }
  }

  const dynamicStyle: React.CSSProperties = {};
  if (fontSize !== undefined) dynamicStyle.fontSize = `${fontSize}px`;
  if (overflowPaddingX !== undefined) dynamicStyle.padding = `4px ${overflowPaddingX}px`;
  if (border !== undefined) dynamicStyle.borderWidth = `${border}px`;

  const combinedStyle = {
    ...(clickable ? clickableStyle : defaultOverflowStyle),
    ...dynamicStyle,
    ...style,
  };

  const resolvedRole = role !== undefined ? (role || undefined) : "listitem";

  if (clickable) {
    return (
      <button
        type="button"
        role={resolvedRole}
        onClick={toggle}
        aria-expanded={isExpanded}
        className={className}
        style={combinedStyle}
      >
        {content}
      </button>
    );
  }

  return (
    <span role={resolvedRole} className={className} style={combinedStyle}>
      {content}
    </span>
  );
};
