# 🏷️ tag-list-overflow

[![npm version](https://img.shields.io/npm/v/tag-list-overflow?color=blue)](https://www.npmjs.com/package/tag-list-overflow)
[![bundle size](https://img.shields.io/bundlephobia/minzip/tag-list-overflow?color=success)](https://bundlephobia.com/package/tag-list-overflow)
[![license](https://img.shields.io/npm/l/tag-list-overflow)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> **Zero-reflow, responsive React tag & chip list component** with dynamic line-clamp (`maxLines`) and a customizable `+N more` overflow badge. Predicts layout off-DOM using Canvas 2D with **zero layout shifts (CLS: 0)** and **60fps fluid resizing**.

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

## 🔍 Why `tag-list-overflow`?

### The Problem
1. **CSS `line-clamp` doesn't work**: CSS `-webkit-line-clamp` only truncates plain multi-line text paragraphs. It cannot truncate `flex-wrap` badge lists, nor can it dynamically reserve space for a `+N more` counter badge on the final line.
2. **DOM-based measurement causes layout thrashing**: Measuring elements via `getBoundingClientRect()` or `offsetWidth` after render forces synchronous browser reflows (layout thrashing), causing visible flickering, jitter, and poor Cumulative Layout Shift (CLS).

### The Solution
`tag-list-overflow` pre-computes the exact rendered width of tags off-DOM using HTML5 Canvas 2D text metrics and a two-pass greedy packing algorithm:
- **0 Layout Shift (CLS: 0)**: Only the visible items and the badge are rendered into the DOM on the very first paint.
- **60fps Responsive Resizing**: Responds to window, sidebar, or container resizing in `< 0.1ms` via `ResizeObserver`.
- **SSR Safe**: Renders cleanly on Next.js, Remix, and Node environments without hydration mismatches.
- **Dependency-Free**: Pure TypeScript, zero runtime dependencies.

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

### 3. Custom Overflow Badge & Click-to-Expand
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

### 4. Internationalization & Custom Labels
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

### 5. Partial / Paginated Server Data (`totalCount`)
When only the first page of items is loaded on the client, pass `totalCount` so the overflow counter accurately reflects the total:

```tsx
// Loaded 10 items, but database has 150 items
<TagListOverflow
  items={loadedTags}   // length: 10
  totalCount={150}     // renders e.g. "+145 more"
  maxLines={1}
/>
```

### 6. Independent Horizontal (`gapX`) & Vertical (`gapY`) Spacing
```tsx
<TagListOverflow
  items={tags}
  maxLines={3}
  gapX={12} // columnGap: horizontal space between tags in the same row
  gapY={8}  // rowGap: vertical space between wrapped lines
/>
```

### 7. Headless Hook (`useTagOverflow`)
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
| `maxLines` | `number` | `1` | Maximum lines to display. If `<= 0`, shows all tags without clamping. |
| `gapX` | `number` | `gap ?? 4` | Horizontal gap (`columnGap`) in pixels between tags. Used for line-packing. |
| `gapY` | `number` | `gap ?? 4` | Vertical gap (`rowGap`) in pixels between rows when `maxLines > 1`. |
| `gap` | `number` | `undefined` | Shorthand setting both `gapX` and `gapY` simultaneously. |
| `children` | `(item: T, index: number) => ReactNode` | `undefined` | Render-prop function for custom tags. |
| `renderTag` | `(item: T, index: number) => ReactNode` | `undefined` | Alternative prop for custom tag renderer. |
| `renderOverflow` | `(info: OverflowInfo<T>) => ReactNode` | `undefined` | Custom renderer for the `+N more` overflow indicator. |
| `overflowLabel` | `string \| ((count: number) => ReactNode)` | `"more"` | Suffix or formatter for the overflow badge text. |
| `collapseLabel` | `string \| (() => ReactNode)` | `"Show less"` | Label displayed when expanded. |
| `expandable` | `boolean` | `false` | Whether clicking the overflow badge toggles expansion. |
| `expanded` | `boolean` | `undefined` | Controlled expansion state. |
| `onExpandedChange` | `(expanded: boolean) => void` | `undefined` | Controlled expansion change callback. |
| `tagSize` | `'sm' \| 'md' \| 'lg' \| TagMetricsConfig` | `'md'` | Sizing preset or custom metrics for font, padding, and border. |
| `paddingX` | `number` | `8` | Horizontal padding per side in px (e.g. `paddingX={10}`). Directly overrides tagSize. |
| `extraWidth` | `number` | `0` | Extra width buffer in px for icons, avatars, dots, or close buttons. |
| `fontSize` | `number` | `14` | Font size in px. Directly overrides tagSize. |
| `fontWeight` | `number \| string` | `400` | Font weight (e.g. `500`, `'bold'`). |
| `fontFamily` | `string` | `Auto` | Font family stack. Auto-detected from container if omitted. |
| `border` | `number` | `1` | Border width per side in px. |
| `overflowPaddingX` | `number` | `paddingX` | Custom horizontal padding per side for the `+N more` badge. |
| `overflowExtraWidth` | `number` | `0` | Custom extra width buffer for the `+N more` badge (e.g. arrow icons). |
| `getItemLabel` | `(item: T) => string` | `Auto` | Extracts label for measurement. Auto-resolves `.label`, `.name`, `.title`. |
| `getItemKey` | `(item: T, index: number) => Key` | `Auto` | Extracts React key. Defaults to `item.id ?? item.key ?? index`. |
| `getItemWidth` | `(item: T, index: number, ctx: CanvasRenderingContext2D) => number` | `undefined` | Optional override for calculating item width. |
| `totalCount` | `number` | `undefined` | Total count for server-paginated data. |
| `loading` | `boolean` | `false` | Shows placeholder skeleton lines when true. |
| `renderSkeleton` | `() => ReactNode` | `undefined` | Custom skeleton renderer during loading. |
| `className` | `string` | `undefined` | Class name applied to the container `div`. |
| `style` | `CSSProperties` | `undefined` | Inline styles applied to the container `div`. |
| `tagClassName` | `string` | `undefined` | Class name applied to default tags. |

### `OverflowInfo<T>` Object
Passed to `renderOverflow`:
```typescript
interface OverflowInfo<T> {
  count: number;             // Hidden items count
  overflowItems: T[];        // Array of hidden items
  visibleItems: T[];         // Array of visible items
  isExpanded: boolean;       // Expansion state
  expand: () => void;        // Expand handler
  collapse: () => void;      // Collapse handler
  toggle: () => void;        // Toggle handler
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

## 💡 Inspiration & Acknowledgements

Inspired by the zero-reflow layout paradigm demonstrated by [Pretext](https://pretextjs.net) by [@chenglou](https://github.com/chenglou), bringing instantaneous off-DOM canvas measurement and dynamic layout packing to React tag and chip lists.

---

## 📄 License

MIT © 2026
