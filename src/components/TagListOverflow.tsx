"use client";

import React, { forwardRef, useMemo } from "react";
import { useTagOverflow } from "../hooks/useTagOverflow";
import type { OverflowInfo, TagListOverflowProps } from "../types";
import { resolveItemLabel } from "../utils/layout";
import { DefaultOverflow } from "./DefaultOverflow";
import { DefaultTag } from "./DefaultTag";

/**
 * Utility to merge multiple React refs safely.
 */
function useMergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return useMemo(() => {
    if (refs.every((ref) => ref == null)) return null;
    return (value: T | null) => {
      refs.forEach((ref) => {
        if (typeof ref === "function") {
          ref(value);
        } else if (ref != null) {
          (ref as React.MutableRefObject<T | null>).current = value;
        }
      });
    };
  }, refs);
}

/**
 * Internal implementation of TagListOverflow with ref forwarding.
 */
const TagListOverflowInner = forwardRef(function TagListOverflowInner<T>(
  props: TagListOverflowProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    items,
    maxLines = 1,
    gapX,
    gapY,
    gap,
    renderTag,
    children,
    getItemKey,
    getItemLabel,
    getItemExtraWidth,
    renderOverflow,
    overflowLabel,
    collapseLabel,
    expandable = false,
    expanded,
    onExpandedChange,
    tagSize = "md",
    paddingX,
    fontSize,
    fontWeight,
    fontFamily,
    border,
    extraWidth,
    overflowPaddingX,
    overflowExtraWidth,
    getItemWidth,
    totalCount,
    className,
    style,
    tagClassName,
    loading = false,
    renderSkeleton,
    role = "list",
    ...domProps
  } = props;

  const resolvedGapX = gapX ?? gap ?? 4;
  const resolvedGapY = gapY ?? gap ?? 4;

  const {
    containerRef,
    visibleItems,
    overflowItems,
    remainingCount,
    isOverflowed,
    isExpanded,
    expand,
    collapse,
    toggle,
  } = useTagOverflow({
    items,
    maxLines,
    gapX: resolvedGapX,
    tagSize,
    paddingX,
    fontSize,
    fontWeight,
    fontFamily,
    border,
    extraWidth,
    overflowPaddingX,
    overflowExtraWidth,
    getItemLabel,
    getItemExtraWidth,
    getItemWidth,
    totalCount,
    overflowLabel,
    expandable,
    expanded,
    onExpandedChange,
  });

  const mergedRef = useMergeRefs<HTMLDivElement>(containerRef, ref);

  const overflowInfo: OverflowInfo<T> = useMemo(
    () => ({
      count: remainingCount,
      overflowItems,
      visibleItems,
      isExpanded,
      expand,
      collapse,
      toggle,
    }),
    [remainingCount, overflowItems, visibleItems, isExpanded, expand, collapse, toggle],
  );

  // If loading and skeleton renderer provided
  if (loading) {
    if (renderSkeleton) {
      return (
        <div ref={mergedRef} className={className} style={style} role={role} {...domProps}>
          {renderSkeleton()}
        </div>
      );
    }

    const skeletonLines = Math.max(1, maxLines);
    return (
      <div
        ref={mergedRef}
        className={className}
        role={role}
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: `${resolvedGapY}px`,
          ...style,
        }}
        {...domProps}
      >
        {Array.from({ length: skeletonLines }, (_, i) => (
          <div
            key={`skeleton-line-${i}`}
            data-testid="skeleton-bar"
            style={{
              height: "28px",
              width: `${75 - (i * 15) % 30}%`,
              backgroundColor: "#f3f4f6",
              borderRadius: "9999px",
            }}
          />
        ))}
      </div>
    );
  }

  // Don't render empty container if items is empty
  if (!items || items.length === 0) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: isExpanded ? "wrap" : maxLines === 1 ? "nowrap" : "wrap",
    alignItems: "center",
    columnGap: `${resolvedGapX}px`,
    rowGap: `${resolvedGapY}px`,
    overflow: "hidden",
    boxSizing: "border-box",
    ...style,
  };

  const tagRenderer = children || renderTag;

  return (
    <div ref={mergedRef} className={className} style={containerStyle} role={role} {...domProps}>
      {visibleItems.map((item, index) => {
        const key = getItemKey
          ? getItemKey(item, index)
          : (item as any)?.id ?? (item as any)?.key ?? index;

        if (tagRenderer) {
          return <React.Fragment key={key}>{tagRenderer(item, index)}</React.Fragment>;
        }

        const label = resolveItemLabel(item, getItemLabel);
        return <DefaultTag key={key} label={label} className={tagClassName} />;
      })}

      {(isOverflowed || (isExpanded && expandable)) && (
        <React.Fragment key="__tag_overflow_badge__">
          {renderOverflow ? (
            renderOverflow(overflowInfo)
          ) : (
            <DefaultOverflow
              info={overflowInfo}
              overflowLabel={overflowLabel}
              collapseLabel={collapseLabel}
              clickable={expandable}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
});

/**
 * High-performance, zero-reflow React tag list with dynamic line-clamp (maxLines)
 * and customizable overflow indicator (+N more).
 * Supports forwardRef, full HTML attributes, and generic type inference.
 */
export const TagListOverflow = TagListOverflowInner as <T = any>(
  props: TagListOverflowProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;

/**
 * Convenient alias for TagListOverflow
 */
export const TagOverflow = TagListOverflow;

export default TagListOverflow;
