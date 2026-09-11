import { useState } from "react";
import { TagListOverflow } from "tag-list-overflow";

const INITIAL_TAGS = [
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind CSS",
  "Vite",
  "GraphQL",
  "Node.js",
  "Zustand",
  "Turbopack",
  "Vitest",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "Redis",
  "Prisma",
  "TanStack Query",
  "ESLint",
  "Prettier",
  "Framer Motion",
  "WebAssembly",
];

const PASTEL_COLORS = [
  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" }, // blue
  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" }, // green
  { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff" }, // purple
  { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" }, // orange
  { bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" }, // pink
  { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4" }, // teal
];

export default function App() {
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [containerWidth, setContainerWidth] = useState(550);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [maxLines, setMaxLines] = useState(1);
  const [gapX, setGapX] = useState(6);
  const [gapY, setGapY] = useState(6);
  const [paddingX, setPaddingX] = useState(10);
  const [extraWidth, setExtraWidth] = useState(12);
  const [expandable, setExpandable] = useState(true);
  const [useCustomTags, setUseCustomTags] = useState(true);

  const addTag = () => {
    const newTag = `Tag #${tags.length + 1}`;
    setTags((prev) => [...prev, newTag]);
  };

  const removeTag = () => {
    setTags((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const resetTags = () => {
    setTags(INITIAL_TAGS);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            backgroundColor: "#e0e7ff",
            color: "#4338ca",
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Zero-Reflow React Component
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px 0", color: "#0f172a" }}>
          Tag List Overflow
        </h1>
        <p style={{ fontSize: 16, color: "#64748b", margin: 0, maxWidth: 650, marginInline: "auto" }}>
          Pure mathematical off-DOM layout prediction via Canvas 2D. Dynamically displays tags across 1 to N lines
          with a customizable <code>+N more</code> badge, without causing layout shifts or DOM reflows.
        </p>
      </div>

      {/* Main Interactive Demo Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          border: "1px solid #e2e8f0",
          padding: 28,
          marginBottom: 32,
        }}
      >
        {/* Width Slider Control */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <label style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>
              Container Width:{" "}
              <span style={{ color: "#2563eb", fontFamily: "monospace", fontSize: 16 }}>
                {isFullWidth ? "100% (Responsive)" : `${containerWidth}px`}
              </span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Mobile (360px)", w: 360 },
                { label: "Tablet (550px)", w: 550 },
                { label: "Desktop (800px)", w: 800 },
              ].map(({ label, w }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setIsFullWidth(false);
                    setContainerWidth(w);
                  }}
                  style={{
                    padding: "4px 10px",
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    backgroundColor: !isFullWidth && containerWidth === w ? "#2563eb" : "#f1f5f9",
                    color: !isFullWidth && containerWidth === w ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsFullWidth((prev) => !prev)}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  backgroundColor: isFullWidth ? "#2563eb" : "#f1f5f9",
                  color: isFullWidth ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                100% Full
              </button>
            </div>
          </div>
          <input
            type="range"
            min={260}
            max={950}
            value={containerWidth}
            disabled={isFullWidth}
            onChange={(e) => setContainerWidth(Number(e.target.value))}
            style={{ width: "100%", cursor: isFullWidth ? "not-allowed" : "pointer" }}
          />
        </div>

        {/* Resizable Preview Stage */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>
            LIVE PREVIEW (Drag slider above or resize window to test responsiveness):
          </div>
          <div
            style={{
              padding: 20,
              backgroundColor: "#f8fafc",
              borderRadius: 12,
              border: "2px dashed #cbd5e1",
              overflow: "hidden",
              width: isFullWidth ? "100%" : `${containerWidth}px`,
              maxWidth: "100%",
            }}
          >
            <TagListOverflow
              items={tags}
              maxLines={maxLines}
              gapX={gapX}
              gapY={gapY}
              paddingX={useCustomTags ? paddingX : 8}
              extraWidth={useCustomTags ? extraWidth : 0}
              fontSize={useCustomTags ? 13 : 14}
              overflowPaddingX={useCustomTags ? 12 : 8}
              overflowExtraWidth={useCustomTags ? 10 : 0}
              expandable={expandable}
              overflowLabel={(count) => `+${count} more ↓`}
              collapseLabel="Show less ↑"
              renderTag={
                useCustomTags
                  ? (tag, index) => {
                      const color = PASTEL_COLORS[index % PASTEL_COLORS.length];
                      return (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: 13,
                            fontWeight: 500,
                            padding: `4px ${paddingX}px`,
                            borderRadius: 9999,
                            backgroundColor: color.bg,
                            color: color.text,
                            border: `1px solid ${color.border}`,
                            whiteSpace: "nowrap",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: color.text,
                              marginRight: 6,
                            }}
                          />
                          {tag}
                        </span>
                      );
                    }
                  : undefined
              }
              renderOverflow={
                useCustomTags
                  ? ({ count, toggle, isExpanded }) => (
                      <button
                        type="button"
                        onClick={toggle}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: 13,
                          fontWeight: 600,
                          padding: "4px 12px",
                          borderRadius: 9999,
                          backgroundColor: isExpanded ? "#fee2e2" : "#e0e7ff",
                          color: isExpanded ? "#b91c1c" : "#4338ca",
                          border: `1px solid ${isExpanded ? "#fca5a5" : "#c7d2fe"}`,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isExpanded ? "Collapse ↑" : `+${count} more ↓`}
                      </button>
                    )
                  : undefined
              }
            />
          </div>
        </div>

        {/* Configuration Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            paddingTop: 16,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Max Lines: <span style={{ color: "#2563eb" }}>{maxLines}</span>
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 0].map((lines) => (
                <button
                  key={lines}
                  type="button"
                  onClick={() => setMaxLines(lines)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    fontSize: 13,
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    backgroundColor: maxLines === lines ? "#2563eb" : "#f8fafc",
                    color: maxLines === lines ? "#ffffff" : "#334155",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {lines === 0 ? "All" : `${lines} line${lines > 1 ? "s" : ""}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              gapX: <span style={{ color: "#2563eb" }}>{gapX}px</span> / gapY:{" "}
              <span style={{ color: "#2563eb" }}>{gapY}px</span>
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {[4, 6, 8, 12].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGapX(g);
                    setGapY(g);
                  }}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    fontSize: 13,
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    backgroundColor: gapX === g ? "#2563eb" : "#f8fafc",
                    color: gapX === g ? "#ffffff" : "#334155",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {g}px
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              paddingX: <span style={{ color: "#2563eb" }}>{paddingX}px</span> / extraWidth:{" "}
              <span style={{ color: "#2563eb" }}>{extraWidth}px</span>
            </label>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              {[6, 8, 10, 12].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaddingX(p)}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    backgroundColor: paddingX === p ? "#2563eb" : "#f8fafc",
                    color: paddingX === p ? "#ffffff" : "#334155",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {p}px
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 6, 12, 16].map((ew) => (
                <button
                  key={ew}
                  type="button"
                  onClick={() => setExtraWidth(ew)}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    backgroundColor: extraWidth === ew ? "#2563eb" : "#f8fafc",
                    color: extraWidth === ew ? "#ffffff" : "#334155",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  +{ew}w
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Options & Tags ({tags.length})
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={expandable}
                  onChange={(e) => setExpandable(e.target.checked)}
                />
                Expandable
              </label>
              <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={useCustomTags}
                  onChange={(e) => setUseCustomTags(e.target.checked)}
                />
                Custom Tags
              </label>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={addTag}
                style={{
                  flex: 1,
                  padding: "4px 0",
                  fontSize: 12,
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                + Add
              </button>
              <button
                type="button"
                onClick={removeTag}
                style={{
                  flex: 1,
                  padding: "4px 0",
                  fontSize: 12,
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                - Remove
              </button>
              <button
                type="button"
                onClick={resetTags}
                style={{
                  flex: 1,
                  padding: "4px 0",
                  fontSize: 12,
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet */}
      <div
        style={{
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          borderRadius: 12,
          padding: 24,
          overflowX: "auto",
        }}
      >
        <div style={{ color: "#94a3b8", marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
          // Dynamic Usage Snippet (reflects controls above)
        </div>
        <pre
          style={{
            margin: 0,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 14,
            lineHeight: 1.7,
            color: "#e2e8f0",
            whiteSpace: "pre",
          }}
        >
          {"import { TagListOverflow } from 'tag-list-overflow';\n\n"}
          {"<TagListOverflow\n"}
          {`  items={tags}\n`}
          {`  maxLines={${maxLines}}\n`}
          {`  gapX={${gapX}}\n`}
          {`  gapY={${gapY}}\n`}
          {useCustomTags ? `  paddingX={${paddingX}}\n` : ""}
          {useCustomTags ? `  extraWidth={${extraWidth}} // e.g. dot or icon\n` : ""}
          {expandable ? `  expandable\n` : ""}
          {`  overflowLabel={(count) => \`+\${count} more\`}\n`}
          {useCustomTags
            ? `  renderTag={(tag) => <CustomBadge>{tag}</CustomBadge>}\n`
            : ""}
          {"/>"}
        </pre>
      </div>
    </div>
  );
}
