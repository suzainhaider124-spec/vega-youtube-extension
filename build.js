import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await cp("src", "dist/src", { recursive: true });
await writeFile("dist/index.js", await readFile("index.js"));
await writeFile("dist/manifest.json", await readFile("manifest.json"));
console.log("Built Vega YouTube extension in dist/");
