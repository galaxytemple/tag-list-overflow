"use client";

import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTagOverflow } from "../hooks/useTagOverflow";
import type { OverflowInfo, TagListOverflowProps } from "../types";
import { resolveItemLabel } from "../utils/layout";
import { getCanvasContext } from "../utils/measure";
import { DefaultOverflow } from "./DefaultOverflow";
import { DefaultTag } from "./DefaultTag";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Recursively extracts plain text content from React children or JSX nodes
 * to estimate rendered text width before DOM layout or in SSR/testing.
 */
function extractTextContent(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractTextContent).join(" ");
  if (React.isValidElement(node) && node.props && (node.props as any).children) {
    return extractTextContent((node.props as any).children);
  }
  return "";
}

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
    containerWidth,
    className,
    style,
    tagHeight,
    tagClassName,
    isLoading,
    loadingComponent,
    loading = false,
    renderSkeleton,
    role = "list",
    loadingWidth,
    ...domProps
  } = props;

  const isCurrentlyLoading = Boolean(isLoading ?? loading);

  const resolvedLoadingComponent =
    typeof loadingComponent === "function"
      ? (loadingComponent as () => React.ReactNode)()
      : loadingComponent;

  const resolvedGapX = gapX ?? gap ?? 4;
  const resolvedGapY = gapY ?? gap ?? 4;

  const innerRef = useRef<HTMLDivElement | null>(null);
  const loadingIndicatorRef = useRef<HTMLSpanElement | null>(null);
  const [measuredTagHeight, setMeasuredTagHeight] = useState<number>(0);
  const [measuredLoadingWidth, setMeasuredLoadingWidth] = useState<number>(0);

  // Auto-measure rendered loadingComponent width
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!isCurrentlyLoading || !resolvedLoadingComponent) {
      if (measuredLoadingWidth !== 0) setMeasuredLoadingWidth(0);
      return;
    }
    const el = loadingIndicatorRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.ceil(el.getBoundingClientRect().width);
      if (w > 0 && w !== measuredLoadingWidth) {
        setMeasuredLoadingWidth(w);
      }
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        measure();
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [isCurrentlyLoading, resolvedLoadingComponent, measuredLoadingWidth]);

  // Initial estimate before DOM measurement, or fallback in test / SSR environments
  const estimatedLoadingWidth = useMemo(() => {
    if (!isCurrentlyLoading || !resolvedLoadingComponent) return 0;
    if (loadingWidth !== undefined) return loadingWidth;
    if (measuredLoadingWidth > 0) return measuredLoadingWidth;

    const text = extractTextContent(resolvedLoadingComponent).trim();
    if (text) {
      const ctx = getCanvasContext();
      if (ctx) {
        ctx.font = `${fontWeight ?? 500} ${fontSize ?? 12}px ${fontFamily ?? 'system-ui, sans-serif'}`;
        const textW = ctx.measureText(text).width;
        // Text width + pill horizontal padding (~20px) + indicator dot & gap (~16px) + border (2px)
        return Math.ceil(textW + 38);
      }
      return Math.ceil(text.length * 8 + 38);
    }
    return 24;
  }, [
    isCurrentlyLoading,
    resolvedLoadingComponent,
    loadingWidth,
    measuredLoadingWidth,
    fontSize,
    fontWeight,
    fontFamily,
  ]);

  const effectiveLoadingWidth =
    loadingWidth !== undefined
      ? loadingWidth
      : measuredLoadingWidth > 0
        ? measuredLoadingWidth
        : estimatedLoadingWidth;

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
    containerWidth,
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
    isLoading: isCurrentlyLoading,
    loadingWidth: effectiveLoadingWidth,
  });

  const mergedRef = useMergeRefs<HTMLDivElement>(containerRef, innerRef, ref);

  // Measure actual rendered tag height from the first DOM child for strict visual clamping
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = innerRef.current;
    if (el && el.firstElementChild) {
      const h = Math.ceil(el.firstElementChild.getBoundingClientRect().height);
      if (h > 0 && h !== measuredTagHeight) {
        setMeasuredTagHeight(h);
      }
    }
  }, [tagHeight, tagSize, fontSize, paddingX, items.length, measuredTagHeight]);

  const effectiveTagHeight =
    tagHeight ??
    (measuredTagHeight > 0
      ? measuredTagHeight
      : Math.ceil((fontSize ?? 14) * 1.3 + (paddingX ?? 8) * 0.5 + 8));

  // Clamps maximum height to exactly maxLines rows to prevent visual blinking during rapid resizing
  const maxAllowedHeight =
    !isExpanded && maxLines > 0
      ? effectiveTagHeight * maxLines + resolvedGapY * (maxLines - 1) + 2
      : undefined;

  const overflowInfo: OverflowInfo<T> = useMemo(
    () => ({
      count: remainingCount,
      overflowItems,
      visibleItems,
      isExpanded,
      expand,
      collapse,
      toggle,
      isLoading: isCurrentlyLoading,
    }),
    [remainingCount, overflowItems, visibleItems, isExpanded, expand, collapse, toggle, isCurrentlyLoading],
  );

  // If custom skeleton renderer provided
  if (isCurrentlyLoading && renderSkeleton) {
    return (
      <div ref={mergedRef} className={className} style={style} role={role} {...domProps}>
        {renderSkeleton()}
      </div>
    );
  }

  // Legacy skeleton fallback: only when using legacy `loading={true}` without `isLoading` or `loadingComponent`
  if (loading && isLoading === undefined && !loadingComponent) {
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

  // When items is empty
  if (!items || items.length === 0) {
    if (isCurrentlyLoading && resolvedLoadingComponent) {
      return (
        <div
          ref={mergedRef}
          className={className}
          style={{
            display: "inline-flex",
            alignItems: "center",
            ...style,
          }}
          role={role}
          {...domProps}
        >
          {resolvedLoadingComponent}
        </div>
      );
    }
    return null;
  }

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: isExpanded ? "wrap" : maxLines === 1 ? "nowrap" : "wrap",
    alignItems: "center",
    columnGap: `${resolvedGapX}px`,
    rowGap: `${resolvedGapY}px`,
    maxHeight: maxAllowedHeight ? `${maxAllowedHeight}px` : undefined,
    overflow: "hidden",
    boxSizing: "border-box",
    ...style,
  };

  const tagRenderer =
    typeof children === "function"
      ? children
      : typeof renderTag === "function"
        ? renderTag
        : undefined;

  return (
    <div ref={mergedRef} className={className} style={containerStyle} role={role} {...domProps}>
      {visibleItems.map((item, index) => {
        const key = getItemKey
          ? getItemKey(item, index)
          : (item as any)?.id ??
            (item as any)?.key ??
            (typeof item === "string" || typeof item === "number" ? item : index);

        if (tagRenderer) {
          return <React.Fragment key={key}>{tagRenderer(item, index)}</React.Fragment>;
        }

        const label = resolveItemLabel(item, getItemLabel);
        return (
          <DefaultTag
            key={key}
            label={label}
            className={tagClassName}
            fontSize={fontSize}
            paddingX={paddingX}
            border={border}
          />
        );
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
              fontSize={fontSize}
              overflowPaddingX={overflowPaddingX ?? paddingX}
              border={border}
              role={role ? "listitem" : undefined}
            />
          )}
        </React.Fragment>
      )}

      {isCurrentlyLoading && resolvedLoadingComponent && (
        <span
          ref={loadingIndicatorRef}
          key="__tag_loading_indicator__"
          role={role ? "listitem" : undefined}
          style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
        >
          {resolvedLoadingComponent}
        </span>
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
