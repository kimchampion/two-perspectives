import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Export a real, offline-capable file. Opening Vite's dist/index.html directly
// fails because its /assets URLs expect an HTTP server.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
let html = await readFile(path.join(dist, "index.html"), "utf8");

function assetPath(url) {
  const absolute = path.resolve(dist, url.replace(/^\//, ""));
  if (!absolute.startsWith(`${dist}${path.sep}`)) {
    throw new Error(`Asset is outside the build directory: ${url}`);
  }
  return absolute;
}

const cssTags = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
for (const [tag] of cssTags) {
  const url = tag.match(/href="([^"]+)"/)?.[1];
  if (!url) throw new Error("Stylesheet URL is missing");
  let css = await readFile(assetPath(url), "utf8");
  const fontUrls = [...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1]))];
  for (const original of fontUrls) {
    const fontUrl = original.replace(/^['"]|['"]$/g, "");
    if (fontUrl.startsWith("data:")) continue;
    const bytes = await readFile(assetPath(fontUrl));
    const mime = fontUrl.endsWith(".woff2") ? "font/woff2" : "font/woff";
    css = css.replaceAll(`url(${original})`, `url(data:${mime};base64,${bytes.toString("base64")})`);
  }
  html = html.replace(tag, () => `<style>${css}</style>`);
}

const jsTags = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
for (const [tag, url] of jsTags) {
  const js = (await readFile(assetPath(url), "utf8")).replace(/<\/script/gi, "<\\/script");
  html = html.replace(tag, () => `<script type="module">${js}</script>`);
}

if (/<(?:script|link)\b[^>]*(?:src|href)="\/?assets\//i.test(html) || /url\(["']?\/?assets\//i.test(html)) {
  throw new Error("The standalone export still references external build assets");
}

const output = path.join(dist, "Two-Perspectives.html");
await writeFile(output, html);
console.log(`Standalone app: ${output} (${Buffer.byteLength(html).toLocaleString()} bytes)`);
