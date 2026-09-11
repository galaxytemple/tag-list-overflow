# 🏷️ tag-list-overflow

[![npm version](https://img.shields.io/npm/v/tag-list-overflow?color=blue)](https://www.npmjs.com/package/tag-list-overflow)
[![bundle size](https://img.shields.io/bundlephobia/minzip/tag-list-overflow?color=success)](https://bundlephobia.com/package/tag-list-overflow)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/galaxytemple/tag-list-overflow)
[![license](https://img.shields.io/github/license/galaxytemple/tag-list-overflow)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> **The Zero-DOM React tag & chip list component** with dynamic line-clamping (`maxLines`) and customizable `+N more` overflow badge. Built on an off-DOM layout architecture inspired by Pretext—predicting exact text metrics in memory using HTML5 Canvas 2D to achieve **1-pass rendering**, **zero DOM-read reflows**, and **zero layout shifts (CLS: 0)**.

<p align="center">
  <img src="./.github/assets/demo.gif" alt="tag-list-overflow responsive demo" width="760" />
</p>

<p align="center">
  <a href="https://stackblitz.com/github/galaxytemple/tag-list-overflow" target="_blank" rel="noopener noreferrer">
    <img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt="Open in StackBlitz" />
  </a>
</p>

---

## ⚡ Quick Demo

```tsx
import { TagListOverflow } from "tag-list-overflow";

export function Example() {
  const tags = ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vite", "GraphQL", "Zustand"];

  return (
    <TagListOverflow
      items={tags}
      maxLines={1}
      gapX={6}
      gapY={4}
      expandable
      overflowLabel={(count) => `+${count} more`}
    />
  );
}
```

---

## 🔍 Why `tag-list-overflow`? The Zero-DOM Architecture

### The Problem with Traditional DOM-Measuring Libraries
Existing React overflow libraries (like `react-responsive-overflow-list` or `react-overflow-list`) rely on a **2-pass DOM measuring cycle**:
1. **Pass 1 (Paint All)**: Mount *all* tags into the DOM.
2. **Pass 2 (Reflow & Measure)**: In `useLayoutEffect` / `useEffect`, query `getBoundingClientRect()` or `offsetWidth` across every child element. This triggers **forced synchronous reflows (layout thrashing)**.
3. **Pass 3 (Collapse)**: Calculate which items overflow, call `setState()`, and unmount the hidden elements.

#### ⚠️ The Consequences:
- **Flash of Unclamped Content (FOUC)**: On initial load, users see all 100 tags flash on screen before collapsing.
- **High Cumulative Layout Shift (CLS)**: The height of the list collapses after paint, causing surrounding page content to jump upward.
- **Stuttering Resize (< 30fps)**: Dragging or animating the window forces repeated DOM queries on every single frame.

---

### The Solution: Off-DOM Layout Prediction (Zero-DOM)
Inspired by the off-DOM mathematical layout principles pioneered by **[Pretext](https://pretextjs.net)**, `tag-list-overflow` treats layout as **pure mathematics over text metrics**:

```
Traditional 2-Pass DOM Approach:
[Mount ALL N tags] ➔ [Forced DOM reflows (getBoundingClientRect)] ➔ [Calculate] ➔ [Unmount tags]
⚠️ High CLS (content jumps) | ⚠️ Layout thrashing on resize | ⚠️ Blinking UI

tag-list-overflow (Zero-DOM):
[Measure text off-DOM via Canvas] ➔ [Greedy array packing (< 0.05ms)] ➔ [Mount ONLY visible tags in 1-Pass]
✅ 0 DOM reads on tags | ✅ 0 Layout Shifts (CLS: 0) | ✅ 120fps fluid resizing
```

- **0 DOM Measurement Passes on Tags**: Child tags are **never** mounted just to be measured.
- **Sub-Millisecond Execution (< 0.05ms)**: Tag dimensions are measured once into a contiguous `Float32Array`. Resizing recomputes line allocations via pure array math in microseconds.
- **Instant 1-Pass Painting**: The DOM paints **only the final visible tags** on the very first frame. No FOUC, no secondary re-renders.
- **100% Off-DOM Auxiliaries**: `loadingComponent` width and container height clamping (`tagHeight`) are predicted off-DOM with Canvas text estimation and font metric formulas—zero child `ResizeObserver`s, zero child `getBoundingClientRect()` calls.
- **Polymorphic `as` Prop**: Render semantic HTML (`as="ul"`, `as="nav"`, `as="ol"`, `as="section"`) with full TypeScript autocomplete and accessibility.
- **Zero External Dependencies**: Pure TypeScript (< 3kB min+gzip).

> [!NOTE]
> **Layout Modes & SSR**:
> - **Fixed / Known Width (Instant 1-Pass)**: Pass `containerWidth` (e.g. `containerWidth={600}`) to pre-compute layout immediately without DOM observation.
> - **Responsive Width (Automatic)**: When `containerWidth` is omitted, the component measures only the outer container width via `ResizeObserver`, calculating child tag allocation 100% in memory.
> - **Web Fonts**: When using custom web fonts, `@font-face` is automatically supported; the library listens to `document.fonts.ready` to refresh cached widths once fonts finish downloading.

### 📊 Architectural Comparison

| Feature | CSS `line-clamp` | Traditional DOM Libraries | `tag-list-overflow` (Zero-DOM) |
| :--- | :---: | :---: | :---: |
| **Flex-Wrap Tag Lists** | ❌ Text-only | ⚠️ Post-mount DOM reads | ✅ **Off-DOM Canvas prediction** |
| **DOM Reads on Tags** | 0 | ❌ Reads all N elements (`getBoundingClientRect`) | ✅ **0 (Never touches child DOM)** |
| **Mount Cycle** | 1-pass | ❌ 2-pass (mount all ➔ measure ➔ unmount) | ✅ **1-pass (Mounts only visible items)** |
| **Layout Shift (CLS)** | 0 | ❌ High (height collapse jumps) | ✅ **0 (Zero layout shifts)** |
| **Resize Performance** | Native | ❌ Slow (forces reflow every frame) | ✅ **< 0.05ms (Pure array math)** |
| **Dynamic `+N more` Badge** | ❌ Not supported | ⚠️ Prone to row-wrap shifts | ✅ **Exact space pre-reserved** |
| **Child `ResizeObserver`s** | 0 | ⚠️ Attached to children / items | ✅ **0 (Only 1 on root container)** |
| **Polymorphic `as` Prop** | N/A | ⚠️ Limited | ✅ **Full (`as="ul"`, `as="nav"`, etc.)** |
| **Next.js & SSR** | ✅ | ⚠️ Hydration mismatches / FOUC | ✅ **`"use client";` + SSR compatible** |
| **Bundle & Dependencies** | 0 | Often heavy / external deps | ✅ **0 dependencies (< 3kB min+gzip)** |

---

## 📦 Installation

```bash
# npm
npm install tag-list-overflow

# pnpm
pnpm add tag-list-overflow

# yarn
yarn add tag-list-overflow

# bun
bun add tag-list-overflow
```

> **Peer Dependency**: React `>= 18.0.0`

---

## 🚀 Features & Usage Examples

### 1. Simple String Tags (Zero-Config)
```tsx
<TagListOverflow
  items={["JavaScript", "TypeScript", "Python", "Rust", "Go", "C++"]}
  maxLines={1}
  gapX={8}
/>
```

### 2. Custom Tag Components (via `children` render-prop or `renderTag`)
You can inject your own design system tags, chips, or Tailwind components:

```tsx
<TagListOverflow items={categories} maxLines={2} gapX={6} gapY={6}>
  {(category) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {category.name}
    </span>
  )}
</TagListOverflow>
```

### 3. Design System Integration (Shadcn UI, HeroUI, Tailwind CSS)

To ensure accurate off-DOM layout prediction with custom tags from Shadcn UI, HeroUI, or Tailwind CSS, configure top-level metric props (`paddingX`, `fontSize`, `fontWeight`, `extraWidth`) to match your CSS classes:

```tsx
import { TagListOverflow } from "tag-list-overflow";
import { Badge } from "@/components/ui/badge";

<TagListOverflow
  items={tags}
  maxLines={1}
  gapX={6}
  gapY={6}
  paddingX={10}    // matches px-2.5 (10px)
  fontSize={12}    // matches text-xs (12px)
  fontWeight={600} // matches font-semibold (600)
  extraWidth={16}  // accounts for optional leading icon, dot, or avatar
  expandable
  overflowLabel={(count) => `+${count} more`}
  renderTag={(tag) => (
    <Badge role="listitem" variant="secondary">
      {tag}
    </Badge>
  )}
/>
```

> **Accessibility Tip**: When using custom tag renderers with the default `role="list"` container, add `role="listitem"` to your tag element for full W3C ARIA compliance.

### 4. Custom Overflow Badge & Click-to-Expand
Enable `expandable` to let users click `+N more` to expand all tags, or provide a custom button:

```tsx
<TagListOverflow
  items={skills}
  maxLines={1}
  gapX={6}
  expandable
  renderOverflow={({ count, toggle, isExpanded }) => (
    <button
      onClick={toggle}
      className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
    >
      {isExpanded ? "Show less ↑" : `+${count} more ↓`}
    </button>
  )}
/>
```

### 5. Internationalization & Custom Labels
Format the overflow text as a string or function:

```tsx
// Custom formatter function
<TagListOverflow
  items={tags}
  overflowLabel={(count) => `and ${count} others`}
  collapseLabel="Collapse"
  expandable
/>
```

### 6. Partial / Paginated Server Data (`totalCount`, `isLoading`, `loadingComponent`)
When tags are paginated or fetched asynchronously from a database:
- `totalCount`: Displays the true remaining count on the badge (e.g. `+147 more` instead of just loaded tags).
- `isLoading` & `loadingComponent`: Renders an inline indicator next to the badge.
- `loadingWidth`: Reserves pixel space for the loading indicator on the final row, ensuring it does not wrap or get clipped. If omitted, it is automatically predicted off-DOM via Canvas text metrics (or 24px default for spinner icons).

```tsx
import { useState } from "react";
import { TagListOverflow } from "tag-list-overflow";

function PaginatedTagsExample() {
  const [tags, setTags] = useState(["React", "TypeScript", "Tailwind"]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExpandedChange = async (expanded: boolean) => {
    if (expanded && tags.length < 150) {
      setIsLoading(true);
      const newTags = await fetchNextPageTags();
      setTags((prev) => [...prev, ...newTags]);
      setIsLoading(false);
    }
  };

  return (
    <TagListOverflow
      items={tags}
      totalCount={150} // Displays "+147 more"
      maxLines={1}
      expandable
      isLoading={isLoading}
      loadingWidth={28}
      loadingComponent={
        <span className="inline-flex items-center gap-1 text-xs text-indigo-500 animate-pulse">
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </span>
      }
      onExpandedChange={handleExpandedChange}
    />
  );
}
```

### 7. Independent Horizontal (`gapX`) & Vertical (`gapY`) Spacing
```tsx
<TagListOverflow
  items={tags}
  maxLines={3}
  gapX={12} // columnGap: horizontal space between tags in the same row
  gapY={8}  // rowGap: vertical space between wrapped lines
/>
```

### 8. Semantic HTML & Polymorphic `as` Prop (`as="ul"`, `as="nav"`)

`TagListOverflow` supports polymorphic rendering via the `as` prop. You can render native semantic elements such as `<ul>`, `<ol>`, `<nav>`, or `<section>`. TypeScript automatically infers element-specific HTML attributes and forwards the typed `ref`:

```tsx
// Render as semantic <ul> with <li> items
<TagListOverflow
  as="ul"
  items={tags}
  renderTag={(tag) => <li>{tag}</li>}
/>

// Render as accessible navigation landmark
<TagListOverflow
  as="nav"
  aria-label="Filter topics"
  items={filters}
/>
```

### 9. Headless Hook (`useTagOverflow`)
For maximum control over markup, animations (Framer Motion), or virtualized lists, use the headless hook directly:

```tsx
import { useTagOverflow } from "tag-list-overflow";

function CustomTagBar({ tags }) {
  const {
    containerRef,
    visibleItems,
    remainingCount,
    isExpanded,
    toggle,
  } = useTagOverflow({
    items: tags,
    maxLines: 1,
    gapX: 8,
    expandable: true,
  });

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2">
      {visibleItems.map((tag) => (
        <span key={tag} className="tag">{tag}</span>
      ))}
      {remainingCount > 0 && (
        <button onClick={toggle}>+{remainingCount} more</button>
      )}
    </div>
  );
}
```

---

## 📖 Component Props API (`TagListOverflowProps`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | `readonly T[]` | **Required** | Array of items/tags to render. |
| `as` | `React.ElementType` | `"div"` | Polymorphic root element (e.g. `"div"`, `"ul"`, `"ol"`, `"nav"`, `"section"`). Passes element-specific HTML attributes and ref type. |
| `maxLines` | `number` | `1` | Maximum rows to display. If `<= 0`, shows all tags without clamping. |
| `gap` | `number` | `undefined` | Shorthand setting both `gapX` and `gapY`. |
| `gapX` | `number` | `gap ?? 4` | Horizontal gap (`columnGap`) in pixels between tags. Used for line-packing. |
| `gapY` | `number` | `gap ?? 4` | Vertical gap (`rowGap`) in pixels between rows when `maxLines > 1`. |
| `containerWidth` | `number` | `undefined` | Fixed container width in px. Bypasses ResizeObserver for 1-pass SSR or testing. |
| `children` | `(item: T, index: number) => ReactNode` | `undefined` | Render prop function for custom tags. |
| `renderTag` | `(item: T, index: number) => ReactNode` | `undefined` | Alternative prop for custom tag renderer. |
| `renderOverflow` | `(info: OverflowInfo<T>) => ReactNode` | `undefined` | Custom renderer for the `+N more` overflow indicator. |
| `overflowLabel` | `string \| ((count: number) => ReactNode)` | `"more"` | Suffix or formatter function for the overflow badge text. |
| `collapseLabel` | `string \| (() => ReactNode)` | `"Show less"` | Label displayed when expanded. |
| `expandable` | `boolean` | `false` | Whether clicking the overflow badge toggles expansion. |
| `expanded` | `boolean` | `undefined` | Controlled expansion state. |
| `onExpandedChange` | `(expanded: boolean) => void` | `undefined` | Callback fired when expansion state changes. |
| `tagSize` | `'sm' \| 'md' \| 'lg' \| TagMetricsConfig` | `'md'` | Sizing preset or custom metrics for font, padding, and border. |
| `paddingX` | `number` | `8` | Horizontal padding per side in px. Applied to default tags and layout calculation. |
| `extraWidth` | `number` | `0` | Extra width buffer in px for icons, avatars, dots, or close buttons. |
| `fontSize` | `number` | `14` | Font size in px. Applied to default tags and layout calculation. |
| `fontWeight` | `number \| string` | `400` | Font weight (e.g. `500`, `'bold'`). |
| `fontFamily` | `string` | `Auto` | Font family stack. Auto-detected from container if omitted. |
| `border` | `number` | `1` | Border width per side in px. |
| `overflowPaddingX` | `number` | `paddingX` | Horizontal padding per side for the `+N more` badge. |
| `overflowExtraWidth` | `number` | `0` | Extra width buffer for the `+N more` badge (e.g. arrow icons). |
| `getItemLabel` | `(item: T) => string` | `Auto` | Extracts label for measurement. Auto-resolves `.label`, `.name`, `.title`, `.value`. |
| `getItemKey` | `(item: T, index: number) => Key` | `Auto` | Extracts React key. Defaults to `item.id ?? item.key ?? item ?? index`. |
| `getItemWidth` | `(item: T, index: number, ctx: CanvasRenderingContext2D) => number` | `undefined` | Optional override for calculating individual item widths. |
| `totalCount` | `number` | `undefined` | Total count for server-paginated data. |
| `isLoading` | `boolean` | `false` | Whether tags are actively being fetched or paginated. |
| `loadingComponent` | `ReactNode \| (() => ReactNode)` | `undefined` | Element rendered next to the badge during loading. |
| `loadingWidth` | `number` | `Auto` | Reserved layout width in px for `loadingComponent` on the final line. Automatically estimated off-DOM via Canvas text metrics if omitted. |
| `renderSkeleton` | `() => ReactNode` | `undefined` | Custom skeleton renderer during initial loading. |
| `tagHeight` | `number` | `undefined` | Explicit row height in px for container height clamping. Automatically derived from font and padding metrics if omitted. |
| `role` | `string` | `"list"` | ARIA role applied to container. Defaults to `"list"` (unless `as="nav"` where it preserves native navigation landmark). |
| `className` | `string` | `undefined` | Class name applied to the container element. |
| `style` | `CSSProperties` | `undefined` | Inline styles applied to the container element. |
| `tagClassName` | `string` | `undefined` | Class name applied to default tags. |

### 📐 Tailwind CSS Metric Quick-Reference

When integrating custom badges with Tailwind CSS, use this quick conversion table for accurate layout prediction:

| Tailwind Class | TagListOverflow Prop | Value |
| :--- | :--- | :--- |
| `px-2` | `paddingX` | `8` |
| `px-2.5` *(Shadcn default)* | `paddingX` | `10` |
| `px-3` | `paddingX` | `12` |
| `text-xs` | `fontSize` | `12` |
| `text-sm` | `fontSize` | `14` |
| `font-medium` | `fontWeight` | `500` |
| `font-semibold` *(Shadcn default)* | `fontWeight` | `600` |
| Leading dot / 16px Lucide icon | `extraWidth` | `14` ~ `18` |

### `OverflowInfo<T>` Object
Passed to `renderOverflow`:
```typescript
interface OverflowInfo<T> {
  count: number;             // Number of hidden items
  overflowItems: T[];        // Array of hidden items
  visibleItems: T[];         // Array of visible items
  isExpanded: boolean;       // Expansion state
  expand: () => void;        // Expand handler
  collapse: () => void;      // Collapse handler
  toggle: () => void;        // Toggle handler
  isLoading?: boolean;       // Loading state
}
```

---

## 🎨 Local Playground

An interactive Vite demo playground is included in the repository:

```bash
pnpm dev
# Opens http://localhost:3000 with real-time responsive sliders and controls
```

---

## 💡 Acknowledgements

Inspired by the off-DOM mathematical layout concepts demonstrated by [Pretext](https://pretextjs.net) by [@chenglou](https://github.com/chenglou), bringing instant canvas text metrics, zero-DOM reflows, and dynamic line packing to React tag and chip lists.

---

## 📄 License

MIT © 2026
