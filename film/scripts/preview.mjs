// container preview of capture plates (SwiftShader): node preview.mjs "plate:t1,t2;plate2:t1" [W] [opts-json]
import { createRequire } from "node:module";
const { chromium } = createRequire(new URL("../../package.json", import.meta.url))("playwright");
import { readFileSync, writeFileSync } from "node:fs";
const root = new URL("../../", import.meta.url).pathname, outDir = new URL("../work/preview/", import.meta.url).pathname;
const [spec, Wa, opts] = process.argv.slice(2);
const W = +(Wa || 432), H = Math.round(W * 1.25);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
const page = await (await browser.newContext({ viewport: { width: 1000, height: 800 }, colorScheme: "light" })).newPage();
const logs = []; page.on("console", (m) => logs.push(m.text())); page.on("pageerror", (e) => logs.push("PAGEERR " + e.message));
await page.route("**/*", async (route) => {
  const url = route.request().url();
  if (url.startsWith("https://local.test/")) return route.fulfill({ status: 200, contentType: "text/html", body: readFileSync(root + "dist/capture.html", "utf8") });
  const m = url.match(/cdn\.jsdelivr\.net\/npm\/three@[\d.]+\/(.*)$/);
  if (m) return route.fulfill({ status: 200, contentType: "application/javascript", headers: { "access-control-allow-origin": "*" }, body: readFileSync(root + "node_modules/three/" + m[1]) });
  if (url.includes("mp4-muxer")) return route.fulfill({ status: 200, contentType: "application/javascript", body: readFileSync(new URL("../../node_modules/mp4-muxer/build/mp4-muxer.js", import.meta.url)) });
  if (/fonts\.(googleapis|gstatic)\.com/.test(url)) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
  return route.continue();
});
await page.goto("https://local.test/index.html");
await page.waitForFunction(() => window.CH && window.CH.previewPlate, null, { timeout: 60000 });
const o = Object.assign({ W, H, dpr: 1, ss: 1, sub: 1, lineOut: 1.0 }, JSON.parse(opts || "{}"));
for (const part of spec.split(";")) {
  const [plate, times] = part.split(":"); const ts = times.split(",").map(Number);
  const res = await page.evaluate(async ([p, ts, o]) => await window.CH.previewPlate(p, ts, o), [plate, ts, o]);
  for (const r of res) writeFileSync(`${outDir}${plate}-${String(r.t).replace(".", "_")}.png`, Buffer.from(r.png.split(",")[1], "base64"));
  console.log(plate, res.map((r) => r.t).join(" "));
}
console.log(logs.filter((l) => /ERR|rror|warn/i.test(l)).slice(0, 8).join("\n"));
await browser.close();
