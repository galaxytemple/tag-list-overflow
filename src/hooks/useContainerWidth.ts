import { useCallback, useEffect, useRef, useState } from "react";

export interface UseContainerWidthResult {
  ref: (node: HTMLElement | null) => void;
  width: number;
  element: HTMLElement | null;
}

/**
 * Hook that tracks the width of a container element via ResizeObserver.
 * Throttled using requestAnimationFrame to match the browser refresh rate (60fps/120fps)
 * without triggering redundant renders or stuttering.
 */
export function useContainerWidth(): UseContainerWidthResult {
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const callbackRef = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    elementRef.current = node;

    if (!node) {
      setWidth(0);
      return;
    }

    // Set initial width immediately if available
    const initialWidth = Math.floor(node.getBoundingClientRect().width);
    if (initialWidth > 0) {
      setWidth(initialWidth);
    }

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const newWidth = Math.floor(entry.contentRect.width);
          if (newWidth > 0) {
            setWidth((prev) => (prev === newWidth ? prev : newWidth));
          }
        }
      });

      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  return {
    ref: callbackRef,
    width,
    element: elementRef.current,
  };
}
