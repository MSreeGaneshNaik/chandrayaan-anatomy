import { createRequire } from "node:module";
const { chromium } = createRequire(new URL("../../package.json", import.meta.url))("playwright");
import { readFileSync, writeFileSync } from "node:fs";
const root = new URL("../../", import.meta.url).pathname, out = new URL("../work/preview/", import.meta.url).pathname;
const names = process.argv[2].split(","), K = 0.2;
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
const page = await (await browser.newContext({ viewport: { width: 1000, height: 800 }, colorScheme: "light" })).newPage();
const logs = []; page.on("pageerror", (e) => logs.push("PAGEERR " + e.message));
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
await page.waitForFunction(() => window.CH && window.CH.STILLS, null, { timeout: 60000 });
for (const n of names) {
  const r = await page.evaluate(async ([n, K]) => {
    const S = window.CH.STILLS[n], plate = { from: 0, dur: S.t + 0.1, lead: 0.4, sub: 1, ...S }; let png = null;
    const res = await window.CH.renderPlate(n, async (i, t, cv) => { png = cv.toDataURL("image/png"); }, { plate, W: Math.round(S.W * K), H: Math.round(S.H * K), dpr: 1, ss: 1, sub: 1, lineOut: 1, insets: { top: S.insets.top * K, bottom: S.insets.bottom * K }, only: [Math.round(S.t * 60)], chrome: true });
    window.CAPTURE_HOLD = false; window.CH.CAPT.on = false;
    return { png, meta: res.meta[Math.round(S.t * 60)] };
  }, [n, K]);
  writeFileSync(out + "S-" + n + ".png", Buffer.from(r.png.split(",")[1], "base64"));
  console.log(n, JSON.stringify(r.meta));
}
console.log(logs.join("\n")); await browser.close();
