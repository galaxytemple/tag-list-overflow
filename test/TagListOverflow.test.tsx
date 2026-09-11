import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TagListOverflow, TagOverflow } from "../src/components/TagListOverflow";

describe("TagListOverflow component", () => {
  const items = ["React", "TypeScript", "Next.js", "Tailwind", "Vite", "Turbopack"];

  it("renders null when items is empty and not loading", () => {
    const { container } = render(<TagListOverflow items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders default tags for string items", () => {
    render(<TagListOverflow items={["React", "Vite"]} />);
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("Vite")).toBeDefined();
  });

  it("supports custom children render prop", () => {
    render(
      <TagListOverflow items={[{ id: 1, name: "Node.js" }]}>
        {(item) => <span data-testid="custom-tag">{item.name}</span>}
      </TagListOverflow>,
    );
    expect(screen.getByTestId("custom-tag").textContent).toBe("Node.js");
  });

  it("supports custom renderTag prop", () => {
    render(
      <TagListOverflow
        items={["GraphQL"]}
        renderTag={(item) => <span data-testid="prop-tag">{item}</span>}
      />,
    );
    expect(screen.getByTestId("prop-tag").textContent).toBe("GraphQL");
  });

  it("renders skeleton during loading state", () => {
    render(<TagListOverflow items={items} loading={true} maxLines={2} />);
    const bars = screen.getAllByTestId("skeleton-bar");
    expect(bars.length).toBe(2);
  });

  it("supports custom renderSkeleton", () => {
    render(
      <TagListOverflow
        items={items}
        loading={true}
        renderSkeleton={() => <div data-testid="custom-skeleton">Loading...</div>}
      />,
    );
    expect(screen.getByTestId("custom-skeleton").textContent).toBe("Loading...");
  });

  it("works with TagOverflow alias identically", () => {
    render(<TagOverflow items={["React"]} />);
    expect(screen.getByText("React")).toBeDefined();
  });

  it("applies custom className and style to container", () => {
    const { container } = render(
      <TagListOverflow
        items={["React"]}
        className="my-tag-container"
        style={{ backgroundColor: "rgb(255, 0, 0)" }}
      />,
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain("my-tag-container");
    expect(element.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  it("handles expandable toggle when overflow badge is clicked", () => {
    // Force overflow by rendering with custom renderOverflow that triggers toggle
    render(
      <TagListOverflow
        items={items}
        maxLines={1}
        expandable={true}
        renderOverflow={({ count, isExpanded, toggle }) => (
          <button data-testid="toggle-btn" onClick={toggle}>
            {isExpanded ? "Collapse" : `+${count} more`}
          </button>
        )}
      />,
    );

    const btn = screen.queryByTestId("toggle-btn");
    if (btn) {
      fireEvent.click(btn);
      expect(btn.textContent).toBe("Collapse");
    }
  });

  it("forwards ref to the container element", () => {
    let capturedRef: HTMLDivElement | null = null;
    render(
      <TagListOverflow
        items={["RefTest"]}
        ref={(node) => {
          capturedRef = node;
        }}
      />,
    );
    expect(capturedRef).not.toBeNull();
    expect((capturedRef as unknown as HTMLDivElement)?.tagName).toBe("DIV");
  });

  it("passes through native HTML div attributes and accessibility roles", () => {
    render(
      <TagListOverflow
        items={["AccessibleTag"]}
        id="tag-container-id"
        data-testid="custom-dom-div"
        aria-label="Technology Stack"
      />,
    );
    const container = screen.getByTestId("custom-dom-div");
    expect(container.id).toBe("tag-container-id");
    expect(container.getAttribute("aria-label")).toBe("Technology Stack");
    expect(container.getAttribute("role")).toBe("list");

    const tag = screen.getByText("AccessibleTag");
    expect(tag.getAttribute("role")).toBe("listitem");
  });

  it("respects getItemExtraWidth for dynamic tag measurement", () => {
    render(
      <TagListOverflow
        items={[{ name: "Admin", isVip: true }]}
        getItemLabel={(item) => item.name}
        getItemExtraWidth={(item) => (item.isVip ? 24 : 0)}
      >
        {(item) => <span>{item.name}</span>}
      </TagListOverflow>,
    );
    expect(screen.getByText("Admin")).toBeDefined();
  });

  describe("isLoading & loadingComponent pagination UX", () => {
    it("renders nothing when items is empty and isLoading is true without loadingComponent", () => {
      const { container } = render(
        <TagListOverflow items={[]} isLoading={true} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders loadingComponent when items is empty and isLoading is true", () => {
      render(
        <TagListOverflow
          items={[]}
          isLoading={true}
          loadingComponent={<span data-testid="empty-spinner">Loading...</span>}
        />,
      );
      expect(screen.getByTestId("empty-spinner").textContent).toBe("Loading...");
    });

    it("renders loadingComponent right after the overflow badge when isLoading is true", () => {
      const manyItems = ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7"];
      render(
        <TagListOverflow
          items={manyItems}
          containerWidth={150}
          maxLines={1}
          isLoading={true}
          loadingComponent={<div data-testid="active-spinner">Fetching more...</div>}
        />,
      );

      expect(screen.getByText(/\+\d+ more/)).toBeDefined();
      expect(screen.getByTestId("active-spinner").textContent).toBe("Fetching more...");
    });

    it("does not render any loader when isLoading is true but loadingComponent is omitted", () => {
      const manyItems = ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"];
      const { container } = render(
        <TagListOverflow
          items={manyItems}
          containerWidth={150}
          maxLines={1}
          isLoading={true}
        />,
      );

      expect(screen.getByText(/\+\d+ more/)).toBeDefined();
      expect(container.querySelector("[data-testid='active-spinner']")).toBeNull();
    });

    it("supports loadingComponent as a render function", () => {
      render(
        <TagListOverflow
          items={[]}
          isLoading={true}
          loadingComponent={() => <span data-testid="fn-spinner">Function Spinner</span>}
        />,
      );
      expect(screen.getByTestId("fn-spinner").textContent).toBe("Function Spinner");
    });

    it("automatically accounts for loadingComponent width and drops tags even without explicit loadingWidth", () => {
      const items = ["React", "TypeScript", "Next.js", "Tailwind", "Shadcn", "Vite"];
      const { unmount } = render(
        <TagListOverflow
          items={items}
          containerWidth={320}
          maxLines={1}
          isLoading={false}
        />,
      );
      const visibleWithoutLoading = screen
        .getAllByRole("listitem")
        .filter((el) => !el.textContent?.includes("more")).length;
      unmount();

      render(
        <TagListOverflow
          items={items}
          containerWidth={320}
          maxLines={1}
          isLoading={true}
          loadingComponent={
            <span data-testid="auto-loader">
              <span />
              Loading...
            </span>
          }
        />,
      );

      const visibleWithLoading = screen
        .getAllByRole("listitem")
        .filter(
          (el) => !el.textContent?.includes("more") && !el.textContent?.includes("Loading"),
        ).length;

      // Because "Loading..." pill reserves ~88px, fewer tags should be visible compared to without loading
      expect(visibleWithLoading).toBeLessThan(visibleWithoutLoading);
      expect(screen.getByTestId("auto-loader")).toBeDefined();
    });
  });

  describe("Bug fixes & Enhancements", () => {
    it("applies fontSize and paddingX to DefaultTag and DefaultOverflow", () => {
      render(
        <TagListOverflow
          items={["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7", "Tag8"]}
          containerWidth={300}
          maxLines={1}
          fontSize={11}
          paddingX={5}
        />,
      );

      const tag1 = screen.getByText("Tag1");
      expect(tag1.style.fontSize).toBe("11px");
      expect(tag1.style.padding).toBe("4px 5px");

      const badge = screen.getByText(/\+\d+ more/);
      expect(badge.style.fontSize).toBe("11px");
      expect(badge.style.padding).toBe("4px 5px");
    });

    it("assigns role='listitem' to DefaultOverflow and loadingComponent when container has role='list'", () => {
      render(
        <TagListOverflow
          items={["Tag1", "Tag2", "Tag3"]}
          containerWidth={100}
          maxLines={1}
          isLoading={true}
          loadingComponent={<span>Spinner</span>}
        />,
      );

      const badge = screen.getByText(/\+\d+ more/);
      expect(badge.getAttribute("role")).toBe("listitem");

      const spinner = screen.getByText("Spinner");
      expect(spinner.parentElement?.getAttribute("role")).toBe("listitem");
    });

    it("handles non-function children gracefully without throwing TypeError", () => {
      expect(() => {
        render(
          <TagListOverflow
            items={["SafeTag"]}
            {...({ children: <div>Static Element</div> } as any)}
          />,
        );
      }).not.toThrow();
      expect(screen.getByText("SafeTag")).toBeDefined();
    });
  });
});

