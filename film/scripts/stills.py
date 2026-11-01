# README screenshots: GPU-rendered stills (capture rig, "README stills") + the page's own figure chrome
# (Fig label, title, readout) drawn by Chromium in the page's fonts. Usage:
#   python3 stills.py <stills-manifest.json> <dir with <asset-id>.png> <out dir>
import io, json, pathlib, sys
from PIL import Image
from playwright.sync_api import sync_playwright

man, src, out = json.load(open(sys.argv[1])), pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
FONTS = (pathlib.Path(__file__).resolve().parents[1] / "node_modules").as_uri()
HTML = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Plex Mono"; src: url("%(f)s/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"); font-weight: 400; }
@font-face { font-family: "Plex Mono"; src: url("%(f)s/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2"); font-weight: 500; }
@font-face { font-family: "Plex Mono"; src: url("%(f)s/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2"); font-weight: 600; }
html, body { margin: 0; background: transparent; }
#c { position: relative; overflow: hidden; border-radius: 22px; box-shadow: inset 0 0 0 3px #c4c4bd; }
.m { position: absolute; font-family: "Plex Mono"; color: #1d2024; text-transform: uppercase; font-variant-numeric: tabular-nums; }
#fig { left: 34px; top: 30px; font-size: 30px; text-transform: none; }
#title { right: 34px; top: 32px; font-size: 26px; letter-spacing: 0.1em; font-weight: 500; text-align: right; max-width: 70%%; }
#ro { right: 34px; bottom: 30px; text-align: right; }
#ro .a { font-size: 30px; font-weight: 600; letter-spacing: 0.08em; }
#ro .b { font-size: 23px; letter-spacing: 0.08em; color: #565a61; margin-top: 8px; max-width: 1500px; margin-left: auto; }
#fig, #title, #ro { background: color-mix(in srgb, #f6f6f3 90%%, transparent); padding: 8px 14px; border-radius: 6px; }
.tag { position: absolute; font-family: "Plex Mono"; font-weight: 600; font-size: 28px; letter-spacing: 0.14em; color: #1d2024; }
</style></head><body><div id="c"><div class="m" id="fig">Fig 1</div><div class="m" id="title"></div><div class="m" id="ro"><div class="a"></div><div class="b"></div></div><div id="tags"></div></div></body></html>"""
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page()
    tmp = pathlib.Path(__file__).resolve().parents[1] / "work" / "stills-chrome.html"; tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_text(HTML % {"f": FONTS})   # a file:// page, so the local fonts load
    pg.goto(tmp.as_uri()); pg.evaluate("document.fonts.ready")
    loaded = pg.evaluate("Promise.all(['400 30px \"Plex Mono\"', '500 30px \"Plex Mono\"', '600 30px \"Plex Mono\"'].map((f) => document.fonts.load(f))).then((r) => r.map((x) => x.length))")
    assert all(loaded), f"Plex Mono did not load: {loaded}"
    for s in man["stills"]:
        W, H = s["W"], s["H"]
        pg.set_viewport_size({"width": W, "height": H})
        lines = (s.get("readout") or "").split("\n")
        tags = []
        if s.get("earth"): tags.append(("Earth", s["earth"]))
        if s.get("moon"): tags.append(("Moon", s["moon"]))
        pg.evaluate("""([W, H, title, a, b, tags]) => {
          const c = document.getElementById('c'); c.style.width = W + 'px'; c.style.height = H + 'px';
          document.getElementById('title').textContent = title; document.querySelector('#ro .a').textContent = a; document.querySelector('#ro .b').textContent = b;
          document.getElementById('tags').innerHTML = tags.map(([n, p]) => `<div class="tag" style="left:${p[0] - 50}px;top:${p[1] + 46}px">${n.toUpperCase()}</div>`).join('');
        }""", [W, H, s.get("title", ""), lines[0] if lines else "", lines[1] if len(lines) > 1 else "", tags])
        ov = Image.open(io.BytesIO(pg.screenshot(omit_background=True, clip={"x": 0, "y": 0, "width": W, "height": H}))).convert("RGBA")
        base = Image.open(src / f"{s['id']}.png").convert("RGBA")
        # round the card's corners so it reads as the page's figure card on any README background
        mask = Image.new("L", (W, H), 0)
        from PIL import ImageDraw
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, H - 1], radius=22, fill=255)
        base.putalpha(mask)
        base.alpha_composite(ov)
        base.save(out / f"{s['name']}.png", optimize=True)
        print(s["name"], W, H)
    br.close()
