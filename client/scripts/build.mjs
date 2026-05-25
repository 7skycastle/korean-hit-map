import { build } from "esbuild";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const assets = path.join(dist, "assets");
const buildId = Date.now().toString(36);
const jsName = `index-${buildId}.js`;
const cssName = `index-${buildId}.css`;

await rm(dist, { recursive: true, force: true });
await mkdir(assets, { recursive: true });
console.log("Building Tailwind CSS...");

const tailwindBin = path.join(root, "..", "node_modules", ".bin", process.platform === "win32" ? "tailwindcss.cmd" : "tailwindcss");
const tailwindCommand = `"${tailwindBin}" -i src/styles.css -o dist/assets/${cssName} --minify`;
const tailwind = spawnSync(tailwindCommand, {
  cwd: root,
  stdio: "inherit",
  shell: true
});

if (tailwind.status !== 0) {
  console.error(`Tailwind build failed with status ${tailwind.status}, signal ${tailwind.signal}`);
  if (tailwind.error) console.error(tailwind.error);
  process.exit(tailwind.status ?? 1);
}

console.log("Bundling React app...");
await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  outfile: `dist/assets/${jsName}`,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  sourcemap: false,
  minify: false,
  jsx: "automatic",
  loader: {
    ".ts": "ts",
    ".tsx": "tsx",
    ".css": "empty"
  }
});

console.log("Writing HTML shell...");
await writeFile(
  path.join(dist, "index.html"),
  `<div id="root"></div>\n<link rel="stylesheet" href="./assets/${cssName}">\n<script type="module" src="./assets/${jsName}"></script>\n`,
  "utf-8"
);
await writeFile(path.join(dist, "404.html"), `<script>location.replace('/korean-hit-map/')</script>\n`, "utf-8");
