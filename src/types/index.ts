import type React from "react";

/**
 * Configuration for tag font, padding, and border metrics used in off-DOM canvas measurement.
 */
export interface TagMetricsConfig {
  /** Font size in pixels. Default: 14 */
  fontSize?: number;
  /** Font weight (e.g. 400, 500, 600, 'bold'). Default: 400 */
  fontWeight?: number | string;
  /** Font family stack. If omitted, automatically sampled from container computed styles. */
  fontFamily?: string;
  /** Horizontal padding per side in pixels. Default: 8 */
  paddingX?: number;
  /** Border width per side in pixels. Default: 1 */
  border?: number;
  /** Extra width buffer in pixels for icons, avatars, or close buttons. Default: 0 */
  extraWidth?: number;
  /** Custom horizontal padding per side for the overflow badge. Default: paddingX */
  overflowPaddingX?: number;
  /** Custom extra width for the overflow badge (e.g. arrow icons). Default: 0 */
  overflowExtraWidth?: number;
}

/** Preset tag sizing identifiers */
export type TagSizePreset = "sm" | "md" | "lg";

/**
 * Direct top-level layout and sizing metrics props.
 */
export interface TagLayoutMetricsProps extends TagMetricsConfig {
  /** Predefined size preset ('sm' | 'md' | 'lg') or custom metrics object */
  tagSize?: TagSizePreset | TagMetricsConfig;
}

/**
 * Information provided to custom overflow badge renderers.
 */
export interface OverflowInfo<T = any> {
  /** Number of hidden/truncated items */
  count: number;
  /** Array of items that are hidden by truncation */
  overflowItems: T[];
  /** Array of items that are currently visible */
  visibleItems: T[];
  /** Whether the list is currently expanded to show all items */
  isExpanded: boolean;
  /** Expand the list to show all items */
  expand: () => void;
  /** Collapse the list back to maxLines */
  collapse: () => void;
  /** Toggle between expanded and collapsed states */
  toggle: () => void;
  /** Whether loading state is currently active */
  isLoading?: boolean;
}

/**
 * Options for the headless useTagOverflow hook.
 */
export interface UseTagOverflowOptions<T = any> extends TagLayoutMetricsProps {
  /** Array of tags or items to display */
  items: readonly T[];
  /**
   * Optional manual container width in pixels.
   * If specified, overrides auto-detected ResizeObserver measurement.
   * Useful for SSR pre-rendering, fixed-width containers, or testing.
   */
  containerWidth?: number;
  /** Maximum number of lines to display. If <= 0, displays all lines. Default: 1 */
  maxLines?: number;
  /** Horizontal gap between tags in pixels. Default: gap ?? 4 */
  gapX?: number;
  /** Shorthand for both horizontal and vertical gap in pixels */
  gap?: number;
  /** Extract a string label from an item for canvas measurement */
  getItemLabel?: (item: T) => string;
  /** Dynamic extra width for individual tags (e.g. for tags with leading avatars or icons) */
  getItemExtraWidth?: (item: T, index: number) => number;
  /** Custom item width calculation override */
  getItemWidth?: (item: T, index: number, ctx: CanvasRenderingContext2D) => number;
  /** Total count if items array is partial/paginated */
  totalCount?: number;
  /** Suffix or formatter for overflow label used in reservation calculation */
  overflowLabel?: string | ((count: number) => React.ReactNode);
  /** Whether expansion is enabled */
  expandable?: boolean;
  /** Controlled expansion state */
  expanded?: boolean;
  /** Controlled expansion state change callback */
  onExpandedChange?: (expanded: boolean) => void;
  /** Whether the list is actively fetching or paginating data */
  isLoading?: boolean;
  /** Backward-compatible alias for isLoading */
  loading?: boolean;
  /**
   * Reserved width in pixels for loadingComponent on the final line.
   * If omitted, automatically estimated off-DOM via Canvas text metrics
   * (or defaults to 24px for icon spinners) to prevent overflow clipping.
   */
  loadingWidth?: number;
}

/**
 * Return value of the headless useTagOverflow hook.
 */
export interface UseTagOverflowResult<T = any> {
  /** Callback ref to attach to the flex container element */
  containerRef: (node: HTMLElement | null) => void;
  /** Current measured container width in pixels */
  containerWidth: number;
  /** Number of tags visible within maxLines */
  visibleCount: number;
  /** Slice of items that are visible */
  visibleItems: T[];
  /** Slice of items that are overflowing */
  overflowItems: T[];
  /** Total number of remaining hidden items */
  remainingCount: number;
  /** Whether any items are overflowing/hidden */
  isOverflowed: boolean;
  /** Whether the list is currently expanded */
  isExpanded: boolean;
  /** Expand the list to show all items */
  expand: () => void;
  /** Collapse the list back to maxLines */
  collapse: () => void;
  /** Toggle between expanded and collapsed states */
  toggle: () => void;
  /** Whether loading state is currently active */
  isLoading: boolean;
}

/**
 * Utility type to extract ref type from an ElementType
 */
export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

/**
 * Base props for TagListOverflow without element-specific HTML attributes.
 */
export interface TagListOverflowBaseProps<T = any> extends UseTagOverflowOptions<T> {
  /** Vertical gap between rows in pixels. Default: gap ?? 4 */
  gapY?: number;

  /**
   * Explicit tag/row height in pixels used for strict line clamping.
   * If omitted, automatically derived from font and padding metrics.
   */
  tagHeight?: number;

  /** Custom tag renderer. Can also be provided via children render prop. */
  renderTag?: (item: T, index: number) => React.ReactNode;

  /** Children as render prop function */
  children?: (item: T, index: number) => React.ReactNode;

  /** Custom React key extractor for each item. Default: item.id ?? item.key ?? index */
  getItemKey?: (item: T, index: number) => React.Key;

  /** Custom overflow badge renderer */
  renderOverflow?: (info: OverflowInfo<T>) => React.ReactNode;

  /** Collapse label when expanded (e.g. "Show less") */
  collapseLabel?: string | (() => React.ReactNode);

  /** Inline styles for the container element */
  style?: React.CSSProperties;

  /** Additional className for individual default tags */
  tagClassName?: string;

  /**
   * Whether the component is in a loading state (e.g. paginating/fetching server tags).
   */
  isLoading?: boolean;

  /**
   * Component or render function to display during loading.
   * Rendered right after the "+N more" badge when items exist,
   * or standalone if the items array is empty.
   * If omitted, nothing extra is rendered even when isLoading is true.
   */
  loadingComponent?: React.ReactNode | (() => React.ReactNode);

  /**
   * Backward-compatible loading state flag.
   * Prefer using `isLoading`.
   */
  loading?: boolean;

  /** Custom skeleton renderer for initial loading state */
  renderSkeleton?: () => React.ReactNode;
}

/**
 * Props for the polymorphic TagListOverflow / TagOverflow component.
 * Allows customizing the root container element via the `as` prop (e.g. "div", "nav", "ul", "section"),
 * while preserving native HTML attributes, ref type, and accessibility attributes.
 */
export type TagListOverflowProps<
  T = any,
  C extends React.ElementType = "div",
> = TagListOverflowBaseProps<T> & {
  /**
   * The underlying HTML element or React component to render as the container.
   * Default: "div"
   */
  as?: C;
} & Omit<
    React.ComponentPropsWithoutRef<C>,
    keyof TagListOverflowBaseProps<T> | "as" | "children" | "style"
  >;

/**
 * Generic component interface for TagListOverflow supporting the polymorphic `as` prop and forwarded ref.
 */
export interface TagListOverflowComponent {
  <T = any, C extends React.ElementType = "div">(
    props: TagListOverflowProps<T, C> & { ref?: PolymorphicRef<C> },
  ): React.ReactElement | null;
  displayName?: string;
}

