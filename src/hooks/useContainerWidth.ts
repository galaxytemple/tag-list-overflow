import { useCallback, useEffect, useRef, useState } from "react";

export interface UseContainerWidthResult {
  ref: (node: HTMLElement | null) => void;
  width: number;
  element: HTMLElement | null;
}

/**
 * Hook that tracks the content-box width of a container element via ResizeObserver.
 * StrictMode-safe, clean React 18 ref callback, with zero redundant window listeners.
 */
export function useContainerWidth(): UseContainerWidthResult {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Stable callback ref that synchronizes the mounted DOM element
  const ref = useCallback((node: HTMLElement | null) => {
    setElement((prev) => (prev === node ? prev : node));
  }, []);

  useEffect(() => {
    if (!element) {
      setWidth(0);
      return;
    }

    // Measure initial content-box width synchronously on mount
    try {
      const cs = window.getComputedStyle(element);
      const paddingX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const borderX = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
      const initial = Math.max(0, Math.floor(element.getBoundingClientRect().width - paddingX - borderX));
      if (initial > 0) {
        setWidth((prev) => (prev === initial ? prev : initial));
      }
    } catch {
      // Safe fallback for detached or test environments
    }

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const newWidth = Math.floor(entry.contentRect.width);
        if (newWidth > 0) {
          setWidth((prev) => (prev === newWidth ? prev : newWidth));
        }
      }
    });

    observer.observe(element);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [element]);

  return {
    ref,
    width,
    element,
  };
}
