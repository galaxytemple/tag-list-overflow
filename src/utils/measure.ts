import type { TagMetricsConfig, TagSizePreset } from "../types";

export const TAG_SIZE_PRESETS: Record<TagSizePreset, TagMetricsConfig> = {
  sm: { fontSize: 12, paddingX: 6, border: 1 },
  md: { fontSize: 14, paddingX: 8, border: 1 },
  lg: { fontSize: 16, paddingX: 10, border: 1 },
};

let cachedCtx: CanvasRenderingContext2D | null = null;
let cachedDefaultFontFamily: string | null = null;
const textWidthCache = new Map<string, number>();
const elementFontCache = new WeakMap<HTMLElement, string>();

/**
 * Returns a singleton 2D canvas context for text measurement.
 * Safe for SSR (returns null when window/document is undefined).
 */
export function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;

  if (!cachedCtx) {
    try {
      const canvas = document.createElement("canvas");
      cachedCtx = canvas.getContext("2d");
    } catch {
      cachedCtx = null;
    }
  }
  return cachedCtx;
}

/**
 * Ensures font families with spaces are wrapped in quotes per CSS/Canvas specification.
 */
export function quoteFontFamilyIfNeeded(family: string): string {
  if (!family) return "sans-serif";
  return family
    .split(",")
    .map((f) => {
      const trimmed = f.trim();
      if (trimmed.includes(" ") && !trimmed.startsWith('"') && !trimmed.startsWith("'")) {
        return `"${trimmed}"`;
      }
      return trimmed;
    })
    .join(", ");
}

/**
 * Resolves the default font family from document.body or container element.
 * Cached to avoid triggering forced style recalculations on resize.
 */
export function getDefaultFontFamily(element?: HTMLElement | null): string {
  if (typeof window === "undefined") return "sans-serif";

  if (element) {
    const cached = elementFontCache.get(element);
    if (cached) return cached;
    try {
      const computed = window.getComputedStyle(element).fontFamily;
      if (computed) {
        const quoted = quoteFontFamilyIfNeeded(computed);
        elementFontCache.set(element, quoted);
        return quoted;
      }
    } catch {
      // fallback to body
    }
  }

  if (!cachedDefaultFontFamily && typeof document !== "undefined" && document.body) {
    try {
      const computed = window.getComputedStyle(document.body).fontFamily;
      cachedDefaultFontFamily = quoteFontFamilyIfNeeded(computed);
    } catch {
      cachedDefaultFontFamily = "sans-serif";
    }
  }

  return cachedDefaultFontFamily || "sans-serif";
}

/**
 * Resolves complete TagMetricsConfig from a preset or partial config with explicit overrides.
 */
export function resolveMetrics(
  tagSize?: TagSizePreset | TagMetricsConfig,
  overrides?: Partial<TagMetricsConfig>,
  container?: HTMLElement | null,
): Required<TagMetricsConfig> {
  const base =
    typeof tagSize === "string"
      ? TAG_SIZE_PRESETS[tagSize] ?? TAG_SIZE_PRESETS.md
      : tagSize ?? TAG_SIZE_PRESETS.md;

  let autoFontSize: number | undefined;
  let autoFontFamily: string | undefined;
  let autoFontWeight: number | string | undefined;
  let autoPaddingX: number | undefined;
  let autoBorder: number | undefined;

  if (typeof window !== "undefined" && container) {
    const sampleEl = (container.firstElementChild as HTMLElement) || container;
    try {
      const computed = window.getComputedStyle(sampleEl);
      if (computed) {
        if (computed.fontSize) {
          const parsed = parseFloat(computed.fontSize);
          if (parsed > 0) autoFontSize = parsed;
        }
        if (computed.fontFamily) {
          autoFontFamily = quoteFontFamilyIfNeeded(computed.fontFamily);
        }
        if (computed.fontWeight) {
          autoFontWeight = computed.fontWeight;
        }
        if (computed.paddingLeft) {
          const parsed = parseFloat(computed.paddingLeft);
          if (!isNaN(parsed)) autoPaddingX = parsed;
        }
        if (computed.borderLeftWidth) {
          const parsed = parseFloat(computed.borderLeftWidth);
          if (!isNaN(parsed)) autoBorder = parsed;
        }
      }
    } catch {
      // fallback to presets
    }
  }

  const rawOverrideFont = overrides?.fontFamily;
  const validOverrideFont =
    rawOverrideFont &&
    rawOverrideFont !== "inherit" &&
    rawOverrideFont !== "initial" &&
    rawOverrideFont !== "unset" &&
    rawOverrideFont !== "revert"
      ? rawOverrideFont
      : undefined;
  const rawFontFamily = validOverrideFont || autoFontFamily || base.fontFamily || getDefaultFontFamily(container);
  const fontFamily = quoteFontFamilyIfNeeded(rawFontFamily);
  const fontSize = overrides?.fontSize ?? autoFontSize ?? base.fontSize ?? 14;
  const fontWeight = overrides?.fontWeight ?? autoFontWeight ?? base.fontWeight ?? 400;
  const paddingX = overrides?.paddingX ?? autoPaddingX ?? base.paddingX ?? 8;
  const border = overrides?.border ?? autoBorder ?? base.border ?? 1;
  const extraWidth = overrides?.extraWidth ?? base.extraWidth ?? 0;
  const overflowPaddingX = overrides?.overflowPaddingX ?? base.overflowPaddingX ?? paddingX;
  const overflowExtraWidth = overrides?.overflowExtraWidth ?? base.overflowExtraWidth ?? 0;

  return {
    fontSize,
    fontWeight,
    fontFamily,
    paddingX,
    border,
    extraWidth,
    overflowPaddingX,
    overflowExtraWidth,
  };
}

// Auto-clear cache when web fonts finish downloading
if (typeof document !== "undefined" && "fonts" in document) {
  document.fonts.ready.then(() => {
    textWidthCache.clear();
  }).catch(() => {});
}

/**
 * Clears the memoized text width cache.
 * Useful when custom web fonts finish loading or font metrics dynamically change.
 */
export function clearTextWidthCache(): void {
  textWidthCache.clear();
}

/**
 * Measures the pixel width of a text string with Canvas 2D and memoization.
 * Preserves subpixel floating point precision to match browser subpixel layout engines.
 */
export function measureTextWidth(
  ctx: CanvasRenderingContext2D | null,
  text: string,
  fontString: string,
): number {
  if (!text) return 0;

  const cacheKey = `${fontString}|${text}`;
  const cached = textWidthCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let width: number;
  if (ctx) {
    ctx.font = fontString;
    width = ctx.measureText(text).width;
  } else {
    // Fallback heuristic if canvas is not available (e.g. basic Node.js test environment)
    const fontSizeMatch = fontString.match(/(\d+(?:\.\d+)?)px/);
    const fontSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 14;
    width = text.length * fontSize * 0.6;
  }

  // Cap cache size to avoid unbounded memory growth
  if (textWidthCache.size > 5000) {
    textWidthCache.clear();
  }
  textWidthCache.set(cacheKey, width);

  return width;
}

/**
 * Measures the total rendered width of a tag (text + horizontal padding + borders + extraWidth).
 * Preserves subpixel precision to avoid cumulative ceiling error across multi-tag rows.
 */
export function measureTagWidth(
  ctx: CanvasRenderingContext2D | null,
  label: string,
  metrics: Required<TagMetricsConfig>,
  additionalExtraWidth: number = 0,
): number {
  const fontString = `${metrics.fontWeight} ${metrics.fontSize}px ${metrics.fontFamily}`;
  const textWidth = measureTextWidth(ctx, label, fontString);
  return metrics.border * 2 + metrics.paddingX * 2 + metrics.extraWidth + additionalExtraWidth + textWidth;
}

/**
 * Measures the total rendered width of the overflow badge.
 */
export function measureBadgeWidth(
  ctx: CanvasRenderingContext2D | null,
  label: string,
  metrics: Required<TagMetricsConfig>,
): number {
  // Badges are typically rendered with medium/semibold font weight (at least 500)
  const badgeWeight =
    typeof metrics.fontWeight === "number"
      ? Math.max(500, metrics.fontWeight)
      : typeof metrics.fontWeight === "string" && !isNaN(Number(metrics.fontWeight))
        ? Math.max(500, Number(metrics.fontWeight))
        : metrics.fontWeight || 500;
  const fontString = `${badgeWeight} ${metrics.fontSize}px ${metrics.fontFamily}`;
  const textWidth = measureTextWidth(ctx, label, fontString);
  return metrics.border * 2 + metrics.overflowPaddingX * 2 + metrics.overflowExtraWidth + textWidth;
}
