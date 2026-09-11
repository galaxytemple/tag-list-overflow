import type { TagMetricsConfig, TagSizePreset } from "../types";
import { getCanvasContext, measureBadgeWidth, measureTagWidth, resolveMetrics } from "./measure";

/**
 * Resolves a human-readable string label from any item type.
 */
export function resolveItemLabel(item: unknown, customResolver?: (item: any) => string): string {
  if (customResolver) {
    return customResolver(item);
  }
  if (typeof item === "string") return item;
  if (typeof item === "number") return String(item);
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    if (typeof record.label === "string") return record.label;
    if (typeof record.name === "string") return record.name;
    if (typeof record.title === "string") return record.title;
    if (typeof record.value === "string") return record.value;
  }
  return String(item ?? "");
}

/**
 * Resolves string text for the overflow badge based on count and config.
 */
export function formatOverflowText(
  count: number,
  labelOrFormatter?: string | ((count: number) => any),
): string {
  if (typeof labelOrFormatter === "function") {
    const result = labelOrFormatter(count);
    if (typeof result === "string") return result;
    if (typeof result === "number") return String(result);
    // If a non-string/JSX element was returned, reserve realistic space with suffix
    return `+${count.toLocaleString()} more`;
  }
  const suffix = labelOrFormatter !== undefined ? labelOrFormatter : "more";
  return suffix ? `+${count.toLocaleString()} ${suffix}` : `+${count.toLocaleString()}`;
}

export interface ComputeVisibleTagCountOptions<T = any> {
  items: readonly T[];
  containerWidth: number;
  maxLines?: number;
  gapX?: number;
  tagSize?: TagSizePreset | TagMetricsConfig;
  metricsOverrides?: Partial<TagMetricsConfig>;
  getItemLabel?: (item: T) => string;
  getItemExtraWidth?: (item: T, index: number) => number;
  getItemWidth?: (item: T, index: number, ctx: CanvasRenderingContext2D) => number;
  totalCount?: number;
  overflowLabel?: string | ((count: number) => any);
  containerElement?: HTMLElement | null;
  loadingWidth?: number;
}

/**
 * Measures all item widths in a single pass into a Float32Array.
 */
export function measureItemWidths<T = any>(
  items: readonly T[],
  metrics: Required<TagMetricsConfig>,
  getItemLabel?: (item: T) => string,
  getItemWidth?: (item: T, index: number, ctx: CanvasRenderingContext2D) => number,
  getItemExtraWidth?: (item: T, index: number) => number,
): Float32Array {
  const ctx = getCanvasContext();
  const tagWidths = new Float32Array(items.length);
  for (let i = 0; i < items.length; i++) {
    if (getItemWidth && ctx) {
      tagWidths[i] = getItemWidth(items[i], i, ctx);
    } else {
      const label = resolveItemLabel(items[i], getItemLabel);
      const extra = getItemExtraWidth ? getItemExtraWidth(items[i], i) : 0;
      tagWidths[i] = measureTagWidth(ctx, label, metrics, extra);
    }
  }
  return tagWidths;
}

/**
 * Pure mathematical layout packing using pre-computed tag widths.
 * Runs in sub-millisecond execution with zero Canvas calls or DOM reads.
 */
export function packTagLayout({
  tagWidths,
  totalItems,
  containerWidth,
  maxLines = 1,
  gapX = 4,
  metrics,
  totalCount,
  overflowLabel,
  loadingWidth = 0,
}: {
  tagWidths: ArrayLike<number>;
  totalItems: number;
  containerWidth: number;
  maxLines?: number;
  gapX?: number;
  metrics: Required<TagMetricsConfig>;
  totalCount?: number;
  overflowLabel?: string | ((count: number) => any);
  loadingWidth?: number;
}): number {
  if (totalItems === 0 || containerWidth <= 0) return 0;
  if (maxLines <= 0) return totalItems;

  // Pass 1: Greedy pack without overflow badge
  const fitCount = greedyPack(tagWidths, containerWidth, maxLines, gapX);

  const total = totalCount ?? totalItems;
  let fitWithLoading = fitCount;
  if (loadingWidth > 0) {
    fitWithLoading = greedyPackWithReserved(
      tagWidths,
      containerWidth,
      maxLines,
      gapX,
      loadingWidth,
    );
  }

  // If all local items fit and there are no remote unloaded items
  if (fitCount >= totalItems && total === totalItems) {
    if (loadingWidth > 0) {
      if (fitWithLoading >= totalItems) return totalItems;
    } else {
      return totalItems;
    }
  }

  // Pass 2: Calculate overflow badge width and reserve space on the last row
  const ctx = getCanvasContext();
  const baseFit = fitCount >= totalItems ? fitWithLoading : fitCount;
  const remainingFromFit = Math.max(1, total - baseFit);
  const moreText = formatOverflowText(remainingFromFit, overflowLabel);
  const moreTagWidth = measureBadgeWidth(ctx, moreText, metrics);
  // Add 2px subpixel safety buffer so real DOM font-rendering variations never push the badge to an extra row
  const totalReservedWidth = moreTagWidth + 2 + (loadingWidth > 0 ? gapX + loadingWidth : 0);

  const adjustedCount = greedyPackWithReserved(
    tagWidths,
    containerWidth,
    maxLines,
    gapX,
    totalReservedWidth,
  );

  // Pass 3: If adjusting visible count changed the remaining count digits
  if (adjustedCount < fitCount) {
    const newRemaining = total - adjustedCount;
    const newMoreText = formatOverflowText(newRemaining, overflowLabel);
    const newMoreWidth = measureBadgeWidth(ctx, newMoreText, metrics);
    const newTotalReserved = newMoreWidth + 2 + (loadingWidth > 0 ? gapX + loadingWidth : 0);

    if (newMoreWidth > moreTagWidth) {
      const finalCount = greedyPackWithReserved(
        tagWidths,
        containerWidth,
        maxLines,
        gapX,
        newTotalReserved,
      );
      return Math.max(0, finalCount);
    }
  }

  return Math.max(0, adjustedCount);
}

/**
 * Computes how many tags fit across maxLines without overflowing the container width.
 */
export function computeVisibleTagCount<T = any>({
  items,
  containerWidth,
  maxLines = 1,
  gapX = 4,
  tagSize,
  metricsOverrides,
  getItemLabel,
  getItemExtraWidth,
  getItemWidth,
  totalCount,
  overflowLabel,
  containerElement,
  loadingWidth,
}: ComputeVisibleTagCountOptions<T>): number {
  if (!items || items.length === 0 || containerWidth <= 0) return 0;
  if (maxLines <= 0) return items.length;

  const metrics = resolveMetrics(tagSize, metricsOverrides, containerElement);
  const tagWidths = measureItemWidths(items, metrics, getItemLabel, getItemWidth, getItemExtraWidth);

  return packTagLayout({
    tagWidths,
    totalItems: items.length,
    containerWidth,
    maxLines,
    gapX,
    metrics,
    totalCount,
    overflowLabel,
    loadingWidth,
  });
}

/**
 * Packs tags sequentially across maxLines.
 * Safe against empty-line bug: never increments rows before placing an item on an empty line.
 */
export function greedyPack(
  tagWidths: ArrayLike<number>,
  containerWidth: number,
  maxLines: number,
  gapX: number,
): number {
  let currentRowWidth = 0;
  let currentRow = 1;

  for (let i = 0; i < tagWidths.length; i++) {
    const widthWithGap =
      currentRowWidth === 0 ? tagWidths[i] : currentRowWidth + gapX + tagWidths[i];

    // Only wrap if the current row already has at least one tag
    if (widthWithGap > containerWidth && currentRowWidth > 0) {
      currentRow++;
      if (currentRow > maxLines) return i;
      currentRowWidth = tagWidths[i];
    } else {
      currentRowWidth = widthWithGap;
    }
  }

  return tagWidths.length;
}

/**
 * Packs tags across maxLines, reserving space for the overflow badge on the last line.
 * Safe against empty-line bug: only wraps when current row already has content.
 */
export function greedyPackWithReserved(
  tagWidths: ArrayLike<number>,
  containerWidth: number,
  maxLines: number,
  gapX: number,
  reservedWidth: number,
): number {
  let currentRowWidth = 0;
  let currentRow = 1;

  for (let i = 0; i < tagWidths.length; i++) {
    const widthWithGap =
      currentRowWidth === 0 ? tagWidths[i] : currentRowWidth + gapX + tagWidths[i];
    // On the final row, ensure both the tag and the reserved overflow badge fit
    const neededForBadge = currentRow === maxLines ? gapX + reservedWidth : 0;

    if (widthWithGap + neededForBadge > containerWidth) {
      if (currentRow === maxLines) {
        // If row is empty and even 1 tag doesn't fit with badge, show 0 so badge alone can render
        return currentRowWidth === 0 ? 0 : i;
      }
      if (currentRowWidth > 0) {
        currentRow++;
        if (currentRow > maxLines) return i;

        // When wrapping into the final row, check if this tag can fit with the reserved badge
        const neededOnNewRow = currentRow === maxLines ? gapX + reservedWidth : 0;
        if (tagWidths[i] + neededOnNewRow > containerWidth) {
          return i;
        }

        currentRowWidth = tagWidths[i];
      } else {
        currentRowWidth = widthWithGap;
      }
    } else {
      currentRowWidth = widthWithGap;
    }
  }

  return tagWidths.length;
}
