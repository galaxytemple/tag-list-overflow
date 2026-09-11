"use client";

// Main components
export { TagListOverflow, TagOverflow, default } from "./components/TagListOverflow";
export { DefaultTag } from "./components/DefaultTag";
export { DefaultOverflow } from "./components/DefaultOverflow";

// Headless hooks
export { useTagOverflow } from "./hooks/useTagOverflow";
export { useContainerWidth } from "./hooks/useContainerWidth";

// Layout & measurement utilities
export {
  computeVisibleTagCount,
  greedyPack,
  greedyPackWithReserved,
  measureItemWidths,
  packTagLayout,
  resolveItemLabel,
  formatOverflowText,
} from "./utils/layout";

export {
  getCanvasContext,
  getDefaultFontFamily,
  measureTagWidth,
  measureBadgeWidth,
  measureTextWidth,
  resolveMetrics,
  TAG_SIZE_PRESETS,
} from "./utils/measure";

// Types
export type {
  TagListOverflowProps,
  UseTagOverflowOptions,
  UseTagOverflowResult,
  OverflowInfo,
  TagMetricsConfig,
  TagLayoutMetricsProps,
  TagSizePreset,
} from "./types";
export type { DefaultTagProps } from "./components/DefaultTag";
export type { DefaultOverflowProps } from "./components/DefaultOverflow";
export type { UseContainerWidthResult } from "./hooks/useContainerWidth";
export type { ComputeVisibleTagCountOptions } from "./utils/layout";
