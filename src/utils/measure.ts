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

  const rawFontFamily = overrides?.fontFamily || base.fontFamily || getDefaultFontFamily(container);
  const fontFamily = quoteFontFamilyIfNeeded(rawFontFamily);
  const fontSize = overrides?.fontSize ?? base.fontSize ?? 14;
  const fontWeight = overrides?.fontWeight ?? base.fontWeight ?? 400;
  const paddingX = overrides?.paddingX ?? base.paddingX ?? 8;
  const border = overrides?.border ?? base.border ?? 1;
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

/**
 * Measures the pixel width of a text string with Canvas 2D and memoization.
 * Uses an absolute 2px safety buffer to account for subpixel antialiasing differences.
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
    // Absolute 2px buffer covers subpixel anti-aliasing variations without over-inflating long text
    width = Math.ceil(ctx.measureText(text).width) + 2;
  } else {
    // Fallback heuristic if canvas is not available (e.g. basic Node.js test environment)
    const fontSizeMatch = fontString.match(/(\d+)px/);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 14;
    width = Math.ceil(text.length * fontSize * 0.6) + 2;
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
 */
export function measureTagWidth(
  ctx: CanvasRenderingContext2D | null,
  label: string,
  metrics: Required<TagMetricsConfig>,
  additionalExtraWidth: number = 0,
): number {
  const fontString = `${metrics.fontWeight} ${metrics.fontSize}px ${metrics.fontFamily}`;
  const textWidth = measureTextWidth(ctx, label, fontString);
  return Math.ceil(
    metrics.border * 2 + metrics.paddingX * 2 + metrics.extraWidth + additionalExtraWidth + textWidth,
  );
}

/**
 * Measures the total rendered width of the overflow badge.
 */
export function measureBadgeWidth(
  ctx: CanvasRenderingContext2D | null,
  label: string,
  metrics: Required<TagMetricsConfig>,
): number {
  const fontString = `${metrics.fontWeight} ${metrics.fontSize}px ${metrics.fontFamily}`;
  const textWidth = measureTextWidth(ctx, label, fontString);
  return Math.ceil(
    metrics.border * 2 + metrics.overflowPaddingX * 2 + metrics.overflowExtraWidth + textWidth,
  );
}
