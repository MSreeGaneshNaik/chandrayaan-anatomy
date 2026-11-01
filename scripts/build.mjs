// Assembles src/ into one standalone page: dist/chandrayaan.html.
// Every src/**/NN-*.js is concatenated in NN order into a single module script;
// src/page/ holds the stylesheet and the page markup.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const srcDir = join(root, "src");
// --capture: the offline film-capture build (capture/NN-*.js appended, MP4 muxer loaded); written to dist/capture*.html
const CAPTURE = process.argv.includes("--capture");
const out = join(root, "dist", CAPTURE ? "capture.html" : "chandrayaan.html");

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const jsFiles = [...walk(srcDir), ...(CAPTURE ? walk(join(root, "capture")) : [])].filter((f) => /^\d\d-.*\.js$/.test(basename(f))).sort((a, b) => basename(a).localeCompare(basename(b)));
const js = jsFiles.map((f) => `// ---- ${basename(f)} ----\n` + readFileSync(f, "utf8")).join("\n");
const page = (f) => readFileSync(join(srcDir, "page", f), "utf8");
// Icons are inlined so the page stays one self-contained file.
const icon = (f) => "data:image/png;base64," + readFileSync(join(srcDir, "page", f)).toString("base64");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${CAPTURE ? "Chandrayaan Film Capture" : "Chandrayaan Anatomy"}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="icon" type="image/png" href="${icon("favicon.png")}">
<link rel="apple-touch-icon" href="${icon("apple-touch-icon.png")}">
<meta name="description" content="Interactive 3D technical drawing of Chandrayaan-1, 2 and 3: the spacecraft part by part, the PSLV-XL and LVM3 rockets that launched them, the landings replayed, and all three journeys on a to-scale map of the Earth and Moon.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=IBM+Plex+Mono:wght@400;500;600&family=Tiro+Devanagari+Sanskrit&display=swap">
<style>
${page("style.css")}
</style>
</head>
<body>
${page("body.html")}
${CAPTURE ? '<script src="https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.js"></script>\n' : ""}<script type="module">
${js}
</script>
</body>
</html>
`;
mkdirSync(join(root, "dist"), { recursive: true });
// the same page as an Artifact body: the host adds doctype, head and body
const frag = html.replace(/^<!doctype html>[\s\S]*?<head>\n/, "").replace(/<\/head>\n<body>\n/, "").replace(/<\/body>\n<\/html>\n$/, "").replace(/<meta charset="utf-8">\n<meta name="viewport"[^>]*>\n/, "");
writeFileSync(join(root, "dist", CAPTURE ? "capture-artifact.html" : "artifact.html"), frag);
writeFileSync(out, html);
console.log(`wrote ${relative(root, out)}`, (html.length / 1024).toFixed(1) + " KB:", jsFiles.map((f) => relative(srcDir, f)).join(", "));
