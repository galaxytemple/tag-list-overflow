import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  cjsInterop: true,
  external: ["react", "react-dom"],
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".mjs",
    };
  },
  async onSuccess() {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const files = ["dist/index.mjs", "dist/index.cjs"];
    for (const relPath of files) {
      const fullPath = path.resolve(relPath);
      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, "utf8");
        if (!content.startsWith('"use client";')) {
          fs.writeFileSync(fullPath, `"use client";\n${content}`, "utf8");
        }
      }
    }
  },
});
