import { describe, expect, it } from "vitest";
import {
  computeVisibleTagCount,
  formatOverflowText,
  greedyPack,
  greedyPackWithReserved,
  resolveItemLabel,
} from "../src/utils/layout";

describe("layout utilities", () => {
  describe("greedyPack", () => {
    it("packs all items when container is sufficiently wide", () => {
      // 4 tags, each 50px with gapX=10 -> 50 + 10 + 50 + 10 + 50 + 10 + 50 = 230px
      const widths = [50, 50, 50, 50];
      const result = greedyPack(widths, 300, 1, 10);
      expect(result).toBe(4);
    });

    it("stops on line 1 when items exceed container width", () => {
      // widths: 60, 60, 60 with gapX=10
      // 1st: 60
      // 2nd: 60 + 10 + 60 = 130
      // 3rd: 130 + 10 + 60 = 200 > 150 -> row 2 > maxLines (1) -> returns 2
      const widths = [60, 60, 60];
      const result = greedyPack(widths, 150, 1, 10);
      expect(result).toBe(2);
    });

    it("packs across multiple lines when maxLines > 1", () => {
      // widths: 60, 60, 60 with containerWidth 100, gapX 10
      // Line 1: [60] (60+10+60=130 > 100, so 2nd wraps)
      // Line 2: [60] (60+10+60=130 > 100, so 3rd wraps to line 3 > maxLines 2) -> returns 2
      const widths = [60, 60, 60];
      const result = greedyPack(widths, 100, 2, 10);
      expect(result).toBe(2);
    });

    it("packs all across 2 lines when they fit", () => {
      // Line 1: 50 + 10 + 50 = 110 <= 120
      // Line 2: 50 + 10 + 50 = 110 <= 120
      const widths = [50, 50, 50, 50];
      const result = greedyPack(widths, 120, 2, 10);
      expect(result).toBe(4);
    });
  });

  describe("greedyPackWithReserved", () => {
    it("reserves space for overflow badge on the last line", () => {
      // containerWidth: 200, gapX: 10, maxLines: 1, reservedWidth: 40
      // 1st: 70 + (10 + 40) = 120 <= 200
      // 2nd: 70 + 10 + 70 + (10 + 40) = 200 <= 200
      // 3rd: 150 + 10 + 70 + 50 = 280 > 200 -> stops at 2
      const widths = [70, 70, 70];
      const result = greedyPackWithReserved(widths, 200, 1, 10, 40);
      expect(result).toBe(2);
    });

    it("only reserves space on the last line, not earlier lines", () => {
      // maxLines: 2, containerWidth: 100, gapX: 10, reservedWidth: 30
      // Line 1: tag1 (60), tag2 (60) wraps without reserved check
      // Line 2: tag2 (60) + (10 + 30) = 100 <= 100
      // Line 2: tag3 (60) + 10 + 60 + 40 = 170 > 100 -> stops at 2
      const widths = [60, 60, 60];
      const result = greedyPackWithReserved(widths, 100, 2, 10, 30);
      expect(result).toBe(2);
    });
  });

  describe("resolveItemLabel", () => {
    it("resolves string primitives", () => {
      expect(resolveItemLabel("React")).toBe("React");
    });

    it("resolves number primitives", () => {
      expect(resolveItemLabel(42)).toBe("42");
    });

    it("resolves objects with label", () => {
      expect(resolveItemLabel({ label: "Next.js" })).toBe("Next.js");
    });

    it("resolves objects with name", () => {
      expect(resolveItemLabel({ name: "TypeScript" })).toBe("TypeScript");
    });

    it("resolves objects with title", () => {
      expect(resolveItemLabel({ title: "Tailwind" })).toBe("Tailwind");
    });

    it("resolves custom resolver when provided", () => {
      const custom = (item: any) => `Custom: ${item.tag}`;
      expect(resolveItemLabel({ tag: "Vite" }, custom)).toBe("Custom: Vite");
    });
  });

  describe("formatOverflowText", () => {
    it("formats with default 'more' suffix", () => {
      expect(formatOverflowText(5)).toBe("+5 more");
    });

    it("formats with custom suffix", () => {
      expect(formatOverflowText(3, "others")).toBe("+3 others");
    });

    it("formats without suffix if empty string", () => {
      expect(formatOverflowText(10, "")).toBe("+10");
    });

    it("formats with custom formatter function", () => {
      expect(formatOverflowText(7, (n) => `and ${n} more items`)).toBe("and 7 more items");
    });
  });

  describe("computeVisibleTagCount", () => {
    const sampleTags = ["React", "TypeScript", "Next.js", "Tailwind", "Vite", "Turbopack"];

    it("returns 0 for empty items or 0 containerWidth", () => {
      expect(computeVisibleTagCount({ items: [], containerWidth: 500 })).toBe(0);
      expect(computeVisibleTagCount({ items: sampleTags, containerWidth: 0 })).toBe(0);
    });

    it("returns items.length if maxLines <= 0", () => {
      expect(computeVisibleTagCount({ items: sampleTags, containerWidth: 50, maxLines: 0 })).toBe(
        sampleTags.length,
      );
    });

    it("returns items.length when all fit comfortably", () => {
      // 2000px container is wide enough for 6 short tags
      const count = computeVisibleTagCount({ items: sampleTags, containerWidth: 2000, maxLines: 1 });
      expect(count).toBe(sampleTags.length);
    });

    it("truncates tags and reserves room for overflow badge in narrow container", () => {
      const count = computeVisibleTagCount({ items: sampleTags, containerWidth: 200, maxLines: 1 });
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(sampleTags.length);
    });

    it("allows more tags when maxLines increases", () => {
      const countLine1 = computeVisibleTagCount({
        items: sampleTags,
        containerWidth: 220,
        maxLines: 1,
      });
      const countLine2 = computeVisibleTagCount({
        items: sampleTags,
        containerWidth: 220,
        maxLines: 2,
      });
      expect(countLine2).toBeGreaterThanOrEqual(countLine1);
    });

    it("prevents empty line bug when an item is wider than container width", () => {
      // 2 tags of 200px each in a 100px container with maxLines = 2
      // Row 1: tag 1 (200px > 100px) must occupy line 1, NOT skip to line 2!
      // Row 2: tag 2 wraps to line 2. Total packed = 2 tags across 2 lines.
      const widths = [200, 200];
      const result = greedyPack(widths, 100, 2, 10);
      expect(result).toBe(2);
    });

    it("reserves space for overflow badge when local items fit but totalCount exceeds", () => {
      // 3 small tags (each 30px) in a 200px container. Local items fit, but totalCount is 500!
      // Must not early-return 3 without reserving badge space!
      const count = computeVisibleTagCount({
        items: ["A", "B", "C"],
        containerWidth: 100,
        maxLines: 1,
        totalCount: 500,
      });
      // In 100px, 3 tags (each ~25px) + badge (~50px) cannot all fit, so it must truncate to 1 or 2!
      expect(count).toBeLessThan(3);
    });

    it("supports getItemExtraWidth for dynamic tag extras", () => {
      const items = [{ name: "User 1", isVip: true }, { name: "User 2", isVip: false }];
      const count = computeVisibleTagCount({
        items,
        containerWidth: 300,
        maxLines: 1,
        getItemLabel: (item) => item.name,
        getItemExtraWidth: (item) => (item.isVip ? 50 : 0),
      });
      expect(count).toBeGreaterThan(0);
    });

    it("ensures greedyPackWithReserved does not allow a tag on final line if it cannot fit with badge", () => {
      // Container 200px, maxLines = 2, gapX = 10, reservedWidth = 60
      // Tag 0: 180px (occupies row 1)
      // Tag 1: 150px. When wrapped to row 2, tag 1 (150px) + gap (10px) + badge (60px) = 220px > 200px!
      // Tag 1 cannot fit with badge on row 2.
      // Result must be 1 (only Tag 0 on row 1, row 2 holds badge alone).
      const widths = [180, 150, 50];
      const result = greedyPackWithReserved(widths, 200, 2, 10, 60);
      expect(result).toBe(1);
    });

    it("reserves space for loadingWidth when loading is active", () => {
      const tags = ["Alpha", "Beta", "Gamma", "Delta"];
      const withoutLoading = computeVisibleTagCount({
        items: tags,
        containerWidth: 160,
        maxLines: 1,
      });
      const withLoading = computeVisibleTagCount({
        items: tags,
        containerWidth: 160,
        maxLines: 1,
        loadingWidth: 40,
      });
      // Reserving 40px for loading spinner should leave less room for tags
      expect(withLoading).toBeLessThanOrEqual(withoutLoading);
    });
  });
});
