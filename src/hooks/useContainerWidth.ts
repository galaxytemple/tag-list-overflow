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
      return;
    }

    // Set initial content-box width immediately to match entry.contentRect.width
    let initialWidth = 0;
    if (typeof window !== "undefined") {
      try {
        const cs = window.getComputedStyle(node);
        const paddingX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        const borderX = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
        initialWidth = Math.max(0, Math.floor(node.getBoundingClientRect().width - paddingX - borderX));
      } catch {
        initialWidth = Math.floor(node.getBoundingClientRect().width);
      }
    } else {
      initialWidth = Math.floor(node.getBoundingClientRect().width);
    }

    if (initialWidth > 0) {
      setWidth((prev) => (prev === initialWidth ? prev : initialWidth));
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
