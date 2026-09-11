import React from "react";
import type { OverflowInfo } from "../types";

export interface DefaultOverflowProps {
  info: OverflowInfo;
  overflowLabel?: string | ((count: number) => React.ReactNode);
  collapseLabel?: string | (() => React.ReactNode);
  clickable?: boolean;
  className?: string;
  style?: React.CSSProperties;
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
  background: "none",
  appearance: "none",
  cursor: "default",
};

const clickableStyle: React.CSSProperties = {
  ...defaultOverflowStyle,
  cursor: "pointer",
  backgroundColor: "#e5e7eb",
};

/**
 * Default "+N more" / "Show less" badge component.
 */
export const DefaultOverflow: React.FC<DefaultOverflowProps> = ({
  info,
  overflowLabel,
  collapseLabel,
  clickable,
  className,
  style,
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

  const combinedStyle = {
    ...(clickable ? clickableStyle : defaultOverflowStyle),
    ...style,
  };

  if (clickable) {
    return (
      <button
        type="button"
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
    <span className={className} style={combinedStyle}>
      {content}
    </span>
  );
};
