import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  "src/utils/clamp.js",
  "src/utils/lerp.js",
  "src/utils/detectMobile.js",
  "src/utils/createElement.js",
  "src/core/MobileOptimizer.js",
  "src/core/Scene.js",
  "src/core/MediaManager.js",
  "src/core/ScrollManager.js",
  "src/core/SceneScroll.js"
];

function stripModuleSyntax(source) {
  return source
    .replace(/^import .+;\n/gm, "")
    .replace(/^export default .+;\n?/gm, "")
    .replace(/\bexport\s+(?=(class|function|const|let|var)\s)/g, "");
}

function compact(source) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

const banner = `/*!
 * SceneScroll.js v0.1.0
 * Scroll-based Cinematic Web Library
 * MIT License
 */
`;

const chunks = await Promise.all(
  files.map(async (file) => stripModuleSyntax(await readFile(resolve(root, file), "utf8")))
);

const bundle = `${banner}(function (global) {
  "use strict";

${chunks.join("\n")}

  global.SceneScroll = SceneScroll;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = SceneScroll;
  }
})(typeof window !== "undefined" ? window : globalThis);
`;

await mkdir(resolve(root, "dist"), { recursive: true });
await writeFile(resolve(root, "dist/scenescroll.js"), bundle);
await writeFile(resolve(root, "dist/scenescroll.cjs"), bundle);
await writeFile(resolve(root, "dist/scenescroll.min.js"), `${banner}${compact(bundle)}`);

const css = await readFile(resolve(root, "src/styles/scenescroll.css"), "utf8");
await writeFile(resolve(root, "dist/scenescroll.css"), css);
