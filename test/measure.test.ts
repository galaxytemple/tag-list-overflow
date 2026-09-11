import { describe, expect, it } from "vitest";
import {
  getDefaultFontFamily,
  measureTagWidth,
  measureTextWidth,
  resolveMetrics,
  clearTextWidthCache,
  TAG_SIZE_PRESETS,
} from "../src/utils/measure";

describe("measurement utilities", () => {
  it("resolves size presets correctly", () => {
    const sm = resolveMetrics("sm");
    expect(sm.fontSize).toBe(TAG_SIZE_PRESETS.sm.fontSize);
    expect(sm.paddingX).toBe(TAG_SIZE_PRESETS.sm.paddingX);

    const lg = resolveMetrics("lg");
    expect(lg.fontSize).toBe(TAG_SIZE_PRESETS.lg.fontSize);
    expect(lg.paddingX).toBe(TAG_SIZE_PRESETS.lg.paddingX);
  });

  it("merges custom metrics config with defaults", () => {
    const custom = resolveMetrics({ fontSize: 20, paddingX: 16 });
    expect(custom.fontSize).toBe(20);
    expect(custom.paddingX).toBe(16);
    expect(custom.border).toBe(1);
    expect(custom.fontWeight).toBe(400);
  });

  it("calculates tag width including padding and borders", () => {
    const metrics = resolveMetrics({ fontSize: 14, paddingX: 10, border: 2, extraWidth: 10 });
    const width = measureTagWidth(null, "Test", metrics);
    // Even with fallback text calculation, padding(20) + border(4) + extra(10) = at least 34px
    expect(width).toBeGreaterThanOrEqual(34);
  });

  it("memoizes repeated text width measurements", () => {
    const w1 = measureTextWidth(null, "React", "400 14px sans-serif");
    const w2 = measureTextWidth(null, "React", "400 14px sans-serif");
    expect(w1).toBe(w2);
  });

  it("resolves default font family safely", () => {
    const font = getDefaultFontFamily();
    expect(typeof font).toBe("string");
    expect(font.length).toBeGreaterThan(0);
  });

  it("quotes font families with spaces properly for Canvas 2D syntax", () => {
    const custom = resolveMetrics({ fontFamily: "Open Sans, sans-serif" });
    expect(custom.fontFamily).toContain('"Open Sans"');
  });

  it("clears text width cache without errors", () => {
    measureTextWidth(null, "CachedText", "400 14px sans-serif");
    expect(() => clearTextWidthCache()).not.toThrow();
  });
});
