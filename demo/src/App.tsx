import { useState } from "react";
import { TagListOverflow } from "tag-list-overflow";
import { ShadcnBadge } from "./components/ShadcnBadge";
import { HeroUIChip } from "./components/HeroUIChip";
import { TailwindBadge } from "./components/TailwindBadge";

type DesignSystem = "default" | "tailwind" | "shadcn" | "heroui";

const INITIAL_TAGS = [
  "React 19",
  "TypeScript",
  "Next.js App Router",
  "Tailwind CSS v4",
  "Shadcn UI",
  "HeroUI",
  "Vite 6",
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
  "Framer Motion",
  "WebAssembly",
  "Rust",
  "Python",
  "Golang",
  "Supabase",
  "tRPC",
  "Bun",
  "Astro",
  "Storybook",
  "Playwright",
  "Biome",
];

const TAILWIND_COLORS = [
  "indigo",
  "sky",
  "violet",
  "emerald",
  "amber",
  "rose",
] as const;

const HEROUI_COLORS = [
  "primary",
  "secondary",
  "success",
  "warning",
  "danger",
] as const;

export default function App() {
  const [designSystem, setDesignSystem] = useState<DesignSystem>("default");
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [containerWidth, setContainerWidth] = useState(580);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [maxLines, setMaxLines] = useState(2);
  const [gapX, setGapX] = useState(6);
  const [gapY, setGapY] = useState(6);
  const [expandable, setExpandable] = useState(true);

  // Design system specific sub-options
  const [shadcnVariant, setShadcnVariant] = useState<"default" | "secondary" | "outline" | "destructive">("secondary");
  const [herouiVariant, setHerouiVariant] = useState<"flat" | "solid" | "bordered" | "dot">("flat");

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

  // Compute metrics based on active design system
  const metrics = (() => {
    switch (designSystem) {
      case "shadcn":
        return {
          paddingX: 10,
          fontSize: 12,
          fontWeight: 600,
          extraWidth: 0,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        };
      case "heroui":
        return {
          paddingX: 10,
          fontSize: 12,
          fontWeight: 500,
          extraWidth: herouiVariant === "dot" ? 14 : 0,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        };
      case "tailwind":
        return {
          paddingX: 10,
          fontSize: 12,
          fontWeight: 500,
          extraWidth: 12, // 6px SVG circle + 6px gap
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        };
      case "default":
      default:
        return {
          paddingX: 8,
          fontSize: 14,
          fontWeight: 400,
          extraWidth: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        };
    }
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Zero-Reflow React Component
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Tag List Overflow
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Dynamic line-clamp (<code className="text-blue-300">maxLines</code>) with off-DOM Canvas 2D layout prediction.
            Compatible with <strong className="text-white">Tailwind CSS</strong>, <strong className="text-white">Shadcn UI</strong>, and <strong className="text-white">HeroUI</strong> with zero layout shifts.
          </p>
        </header>

        {/* Design System Switcher Tabs */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 mb-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 p-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Design System:
              </span>
              <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
                {(
                  [
                    { id: "shadcn", label: "🖤 Shadcn UI", desc: "cva Badge" },
                    { id: "heroui", label: "🚀 HeroUI", desc: "NextUI Chip" },
                    { id: "tailwind", label: "🎨 Tailwind CSS", desc: "Pills & Dots" },
                    { id: "default", label: "🏷️ Default", desc: "Unstyled" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDesignSystem(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      designSystem === tab.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Design System Sub-Variants */}
            {designSystem === "shadcn" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Variant:</span>
                {(["secondary", "default", "outline", "destructive"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setShadcnVariant(v)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer capitalize transition-all ${
                      shadcnVariant === v
                        ? "bg-slate-100 text-slate-900 border-white"
                        : "bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            {designSystem === "heroui" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Chip Style:</span>
                {(["flat", "solid", "bordered", "dot"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setHerouiVariant(v)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer capitalize transition-all ${
                      herouiVariant === v
                        ? "bg-blue-600 text-white border-blue-400"
                        : "bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Interactive Stage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
          {/* Container Width Slider */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <span>Container Width:</span>
                <span className="text-blue-400 font-mono text-base font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                  {isFullWidth ? "100% (Responsive)" : `${containerWidth}px`}
                </span>
              </label>
              <div className="flex gap-2">
                {[
                  { label: "Mobile (360px)", w: 360 },
                  { label: "Tablet (560px)", w: 560 },
                  { label: "Desktop (820px)", w: 820 },
                ].map(({ label, w }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setIsFullWidth(false);
                      setContainerWidth(w);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                      !isFullWidth && containerWidth === w
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsFullWidth((prev) => !prev)}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                    isFullWidth
                      ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  100% Full
                </button>
              </div>
            </div>
            <input
              type="range"
              min={280}
              max={940}
              value={containerWidth}
              disabled={isFullWidth}
              onChange={(e) => setContainerWidth(Number(e.target.value))}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Interactive Preview Container */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
              <span>Live Render Area (Zero Reflow):</span>
              <span className="text-slate-400 font-mono">
                maxLines: {maxLines === 0 ? "Unlimited" : maxLines} | paddingX: {metrics.paddingX}px | extraWidth: +{metrics.extraWidth}px
              </span>
            </div>
            <div
              style={{
                width: isFullWidth ? "100%" : `${containerWidth}px`,
                maxWidth: "100%",
              }}
              className="p-5 bg-slate-950/70 rounded-xl border-2 border-dashed border-slate-700/80 overflow-hidden shadow-inner"
            >
              <TagListOverflow
                items={tags}
                maxLines={maxLines}
                gapX={gapX}
                gapY={gapY}
                paddingX={metrics.paddingX}
                fontSize={metrics.fontSize}
                fontWeight={metrics.fontWeight}
                extraWidth={metrics.extraWidth}
                fontFamily={metrics.fontFamily}
                expandable={expandable}
                overflowLabel={(count) => `+${count} more`}
                collapseLabel="Show less ↑"
                renderTag={
                  designSystem === "shadcn"
                    ? (tag) => (
                        <ShadcnBadge variant={shadcnVariant}>
                          {tag}
                        </ShadcnBadge>
                      )
                    : designSystem === "heroui"
                    ? (tag, index) => (
                        <HeroUIChip
                          variant={herouiVariant}
                          color={HEROUI_COLORS[index % HEROUI_COLORS.length]}
                        >
                          {tag}
                        </HeroUIChip>
                      )
                    : designSystem === "tailwind"
                    ? (tag, index) => (
                        <TailwindBadge
                          color={TAILWIND_COLORS[index % TAILWIND_COLORS.length]}
                        >
                          {tag}
                        </TailwindBadge>
                      )
                    : undefined
                }
                renderOverflow={
                  designSystem === "shadcn"
                    ? ({ count, toggle, isExpanded }) => (
                        <button
                          type="button"
                          onClick={toggle}
                          className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer select-none"
                        >
                          {isExpanded ? "Collapse ↑" : `+${count} more`}
                        </button>
                      )
                    : designSystem === "heroui"
                    ? ({ count, toggle, isExpanded }) => (
                        <button
                          type="button"
                          onClick={toggle}
                          className="inline-flex items-center justify-center rounded-full text-xs font-medium px-2.5 py-1 bg-slate-800 border border-slate-700 text-blue-400 hover:bg-slate-700 transition-all cursor-pointer select-none"
                        >
                          {isExpanded ? "Show less ↑" : `+${count} more`}
                        </button>
                      )
                    : designSystem === "tailwind"
                    ? ({ count, toggle, isExpanded }) => (
                        <button
                          type="button"
                          onClick={toggle}
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer select-none"
                        >
                          {isExpanded ? "Collapse" : `+${count} more`}
                        </button>
                      )
                    : undefined
                }
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pt-5 border-t border-slate-800">
            {/* Max Lines */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Max Lines: <span className="text-blue-400 font-mono">{maxLines === 0 ? "All" : maxLines}</span>
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 0].map((lines) => (
                  <button
                    key={lines}
                    type="button"
                    onClick={() => setMaxLines(lines)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                      maxLines === lines
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {lines === 0 ? "All" : `${lines}L`}
                  </button>
                ))}
              </div>
            </div>

            {/* Gap */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Gap: <span className="text-blue-400 font-mono">{gapX}px</span>
              </label>
              <div className="flex gap-1.5">
                {[4, 6, 8, 12].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGapX(g);
                      setGapY(g);
                    }}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                      gapX === g
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {g}px
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable Toggle */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Interaction
              </label>
              <label className="flex items-center gap-2 p-1.5 bg-slate-800/60 rounded-lg border border-slate-700/80 cursor-pointer hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={expandable}
                  onChange={(e) => setExpandable(e.target.checked)}
                  className="accent-blue-500 rounded"
                />
                <span className="text-xs font-medium text-slate-300">Expandable Badge</span>
              </label>
            </div>

            {/* Tag Count Actions */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Tags Count: <span className="text-blue-400 font-mono">{tags.length}</span>
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={addTag}
                  className="flex-1 py-1 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer font-medium"
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={removeTag}
                  className="flex-1 py-1 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer font-medium"
                >
                  - Remove
                </button>
                <button
                  type="button"
                  onClick={resetTags}
                  className="flex-1 py-1 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Usage Code Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Copy & Paste Usage ({designSystem.toUpperCase()} Integration)
            </span>
            <span className="text-xs text-blue-400 font-mono">TypeScript / React</span>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
{designSystem === "shadcn"
  ? `import { TagListOverflow } from "tag-list-overflow";
import { Badge } from "@/components/ui/badge";

export function ShadcnTagList({ tags }: { tags: string[] }) {
  return (
    <TagListOverflow
      items={tags}
      maxLines={${maxLines}}
      gapX={${gapX}}
      gapY={${gapY}}
      paddingX={10}    // matches Shadcn's px-2.5 (10px)
      fontSize={12}    // matches text-xs
      fontWeight={600} // matches font-semibold
      ${expandable ? "expandable\n      " : ""}overflowLabel={(count) => \`+\${count} more\`}
      renderTag={(tag) => (
        <Badge variant="${shadcnVariant}">{tag}</Badge>
      )}
    />
  );
}`
  : designSystem === "heroui"
  ? `import { TagListOverflow } from "tag-list-overflow";
import { Chip } from "@heroui/react";

export function HeroUITagList({ tags }: { tags: string[] }) {
  return (
    <TagListOverflow
      items={tags}
      maxLines={${maxLines}}
      gapX={${gapX}}
      gapY={${gapY}}
      paddingX={10}   // matches px-2.5
      fontSize={12}   // matches text-xs
      fontWeight={500}
      extraWidth={${herouiVariant === "dot" ? 14 : 0}}  // accounts for dot indicator
      ${expandable ? "expandable\n      " : ""}overflowLabel={(count) => \`+\${count} more\`}
      renderTag={(tag) => (
        <Chip variant="${herouiVariant}" color="primary">{tag}</Chip>
      )}
    />
  );
}`
  : designSystem === "tailwind"
  ? `import { TagListOverflow } from "tag-list-overflow";

export function TailwindTagList({ tags }: { tags: string[] }) {
  return (
    <TagListOverflow
      items={tags}
      maxLines={${maxLines}}
      gapX={${gapX}}
      gapY={${gapY}}
      paddingX={10}   // matches px-2.5
      fontSize={12}   // matches text-xs
      fontWeight={500}
      extraWidth={12} // accounts for dot SVG circle
      ${expandable ? "expandable\n      " : ""}overflowLabel={(count) => \`+\${count} more\`}
      renderTag={(tag) => (
        <span className="inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {tag}
        </span>
      )}
    />
  );
}`
  : `import { TagListOverflow } from "tag-list-overflow";

export function DefaultTagList({ tags }: { tags: string[] }) {
  return (
    <TagListOverflow
      items={tags}
      maxLines={${maxLines}}
      gapX={${gapX}}
      gapY={${gapY}}
      ${expandable ? "expandable\n      " : ""}overflowLabel={(count) => \`+\${count} more\`}
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
