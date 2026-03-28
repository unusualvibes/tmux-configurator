import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "docs");

const staticEntries = [
  "assets",
  "css",
  "js",
  "index.html"
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const entry of staticEntries) {
  await cp(path.join(rootDir, entry), path.join(outputDir, entry), { recursive: true });
}

await writeFile(path.join(outputDir, ".nojekyll"), "");

console.log(`GitHub Pages bundle written to ${outputDir}`);
