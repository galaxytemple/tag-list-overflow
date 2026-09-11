import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTagOverflow } from "../src/hooks/useTagOverflow";

describe("useTagOverflow hook", () => {
  const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"];

  it("initializes with collapsed state by default", () => {
    const { result } = renderHook(() =>
      useTagOverflow({
        items,
        maxLines: 1,
        expandable: true,
      }),
    );

    expect(result.current.isExpanded).toBe(false);
  });

  it("handles expand, collapse, and toggle actions", () => {
    const { result } = renderHook(() =>
      useTagOverflow({
        items,
        maxLines: 1,
        expandable: true,
      }),
    );

    act(() => {
      result.current.expand();
    });
    expect(result.current.isExpanded).toBe(true);

    act(() => {
      result.current.collapse();
    });
    expect(result.current.isExpanded).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isExpanded).toBe(true);
  });

  it("respects controlled expanded state", () => {
    let currentExpanded = false;
    const { result, rerender } = renderHook(
      ({ expanded }) =>
        useTagOverflow({
          items,
          maxLines: 1,
          expanded,
        }),
      { initialProps: { expanded: currentExpanded } },
    );

    expect(result.current.isExpanded).toBe(false);

    currentExpanded = true;
    rerender({ expanded: currentExpanded });
    expect(result.current.isExpanded).toBe(true);
    expect(result.current.visibleItems.length).toBe(items.length);
  });

  it("handles empty items array gracefully", () => {
    const { result } = renderHook(() => useTagOverflow({ items: [] }));
    expect(result.current.visibleCount).toBe(0);
    expect(result.current.remainingCount).toBe(0);
    expect(result.current.isOverflowed).toBe(false);
  });
});
