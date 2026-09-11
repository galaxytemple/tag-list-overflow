// Mock HTMLCanvasElement.prototype.getContext for JSDOM
if (typeof window !== "undefined" && typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = function (contextId: string) {
    if (contextId === "2d") {
      return {
        font: "",
        measureText: (text: string) => {
          // realistic width: ~8.5px per character
          return { width: text.length * 8.5 };
        },
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  } as any;
}
