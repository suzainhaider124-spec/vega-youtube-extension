import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/youtube-provider", { recursive: true });

for (const name of ["catalog", "posts", "meta", "stream"]) {
  await cp(`dist-source/youtube-provider/${name}.js`, `dist/youtube-provider/${name}.js`);
}
await cp("manifest.json", "dist/manifest.json");
console.log("Built Vega provider files in dist/");
