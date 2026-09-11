import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TagListOverflow } from "../src/components/TagListOverflow";

describe("Design System Compatibility", () => {
  const sampleTags = ["React", "TypeScript", "Next.js", "Tailwind", "Vite", "GraphQL"];

  it("renders seamlessly with Shadcn UI styled Badges and custom metrics", () => {
    const { container } = render(
      <TagListOverflow
        items={sampleTags}
        maxLines={1}
        paddingX={10} // Shadcn px-2.5
        fontSize={12} // text-xs
        fontWeight={600} // font-semibold
        containerWidth={250}
        overflowLabel={(count) => `+${count} more`}
        renderTag={(tag) => (
          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-slate-900 text-white">
            {tag}
          </div>
        )}
        renderOverflow={({ count, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-0.5 text-xs font-semibold"
          >
            +{count} more
          </button>
        )}
      />
    );

    // List container renders
    const list = container.querySelector('[role="list"]');
    expect(list).toBeDefined();

    // Contains visible badges and overflow button
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText(/\+\d+ more/)).toBeDefined();
  });

  it("handles HeroUI styled Chips with startContent/icons via extraWidth", () => {
    const { container } = render(
      <TagListOverflow
        items={sampleTags}
        maxLines={1}
        paddingX={10}
        fontSize={12}
        extraWidth={16} // icon/dot width
        containerWidth={250}
        renderTag={(tag) => (
          <div
            role="listitem"
            className="inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 mr-1" />
            {tag}
          </div>
        )}
      />
    );

    expect(screen.getByText("React")).toBeDefined();
    expect(container.querySelectorAll('[role="listitem"]').length).toBeGreaterThan(0);
  });

  it("supports Tailwind CSS container classes and expand/collapse toggle", () => {
    render(
      <TagListOverflow
        items={sampleTags}
        maxLines={1}
        expandable
        containerWidth={200}
        className="flex flex-wrap gap-2 p-4 bg-slate-900 rounded-xl"
        overflowLabel={(count) => `+${count} more`}
        collapseLabel="Collapse"
      />
    );

    const overflowBtn = screen.getByText(/\+\d+ more/);
    expect(overflowBtn).toBeDefined();

    // Click to expand
    fireEvent.click(overflowBtn);

    // All tags should now be visible
    sampleTags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeDefined();
    });
    expect(screen.getByText("Collapse")).toBeDefined();
  });
});
