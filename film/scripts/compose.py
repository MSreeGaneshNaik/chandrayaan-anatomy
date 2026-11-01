import os, pathlib
# Edit, titles, grade and final encode for the Chandrayaan Anatomy film.
# Plates (GPU-rendered on Boss's Mac) + a title layer drawn by Chromium from overlay.html, every frame a
# pure function of film time. Output: 1080 × 1350, 60 fps, x264 high quality, AAC 320k.
import json, subprocess, sys, numpy as np
from PIL import Image, ImageFilter
from playwright.sync_api import sync_playwright

W, H, FPS, T = 1080, 1350, 60, 66.0
WK = os.environ.get("FILM_WORK", str(pathlib.Path(__file__).resolve().parents[1] / "work")) + "/"; OUT = os.environ.get("FILM_OUT", str(pathlib.Path(__file__).resolve().parents[1] / "out")) + "/"
PAPER = np.array([246, 246, 243], np.float32)
args = dict(a.split("=") for a in sys.argv[1:] if "=" in a)
ONLY = [float(x) for x in args["stills"].split(",")] if "stills" in args else None   # stills=t1,t2 → PNGs only
POSTER_T = float(args.get("poster", 9.5))

# (start, end, kind, plate, plate time at start, push-in on the cut)
EDIT = [
    (0.0, 12.0, "plate", "lvm3_ignite", 0.0, False), (12.0, 13.5, "card", None, 0, False),
    (13.5, 16.0, "plate", "pslv_ign", 0.0, True), (16.0, 18.5, "plate", "pslv_apart", 0.0, True),
    (18.5, 22.0, "plate", "c1", 0.0, True), (22.0, 23.5, "card", None, 0, False),
    (23.5, 28.0, "plate", "ce20", 0.0, True), (28.0, 32.5, "plate", "land2", 0.0, True),
    (32.5, 37.0, "card", None, 0, False), (37.0, 41.0, "plate", "c3", 0.0, True),
    (41.0, 45.0, "plate", "journey", 0.0, True), (45.0, 50.5, "plate", "land3", 0.0, True),
    (50.5, 54.0, "plate", "vk", -0.25, True), (54.0, 58.0, "plate", "lineup", 0.0, True),
    (58.0, 66.0, "plate", "lvm3_apart", 0.0, True),
]
MAN = {e[3]: json.load(open(WK + f"plates/{e[3]}.json")) for e in EDIT if e[3]}

class Plate:
    def __init__(self, name, start_index):
        self.name, self.i, self.last = name, start_index, None
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", WK + f"plates/{name}.mp4", "-vf", f"select=gte(n\\,{start_index})", "-vsync", "0",
                                   "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    def read(self, idx):
        while self.i <= idx:
            buf = self.p.stdout.read(W * H * 3)
            if len(buf) < W * H * 3: break   # past the end: hold the last frame
            self.last = np.frombuffer(buf, np.uint8).reshape(H, W, 3); self.i += 1
        return self.last
    def close(self): self.p.kill()

def plate_frame(t, readers):
    for (a, b, kind, name, pt0, push) in EDIT:
        if a <= t < b:
            if kind == "card": return None, None, (a, b)
            m = MAN[name]; pt = pt0 + (t - a); idx = int(round((pt - m["from"]) * FPS))
            r = readers.get(name)
            if r is None or r.i > idx + 1:
                if r: r.close()
                r = readers[name] = Plate(name, max(0, idx))
            img = r.read(idx)
            meta = m["meta"][min(idx, len(m["meta"]) - 1)] if m.get("meta") else None
            return img, meta, (a, b, name, pt, push)
    return None, None, None

ease = lambda x: 1 - (1 - min(1, max(0, x))) ** 3
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIG = 1 - 0.055 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) ** 1.4   # a whisper of vignette
rng = np.random.default_rng(66)

def frame(t, readers, page):
    img, meta, info = plate_frame(t, readers)
    if img is None:
        base = np.broadcast_to(PAPER, (H, W, 3)).astype(np.float32).copy()
    else:
        a, b, name, pt, push = info
        im = Image.fromarray(img)
        if push:   # a short settle on each cut: 1.6 % in, eased out over half a second
            s = 1 + 0.016 * (1 - ease((t - a) / 0.5))
            if s > 1.0005:
                w2, h2 = int(round(W * s)), int(round(H * s)); im = im.resize((w2, h2), Image.BICUBIC)
                im = im.crop(((w2 - W) // 2, (h2 - H) // 2, (w2 - W) // 2 + W, (h2 - H) // 2 + H))
        if name == "vk" and pt > 2.95:   # the plate ends 0.25 s early: hold its last frame with a slow push
            s = 1 + 0.006 * (pt - 2.95) / 0.3; w2, h2 = int(W * s), int(H * s); im = im.resize((w2, h2), Image.BICUBIC).crop(((w2 - W) // 2, (h2 - H) // 2, (w2 - W) // 2 + W, (h2 - H) // 2 + H))
        base = np.asarray(im, np.float32).copy()
        if name == "land2" and t > 32.25:   # the signal breaking up: bands slip, colour splits
            k = (t - 32.25) / 0.25; r = np.random.default_rng(int(t * 600))
            for _ in range(int(4 + 14 * k)):
                y0 = r.integers(0, H - 40); hgt = r.integers(6, 60); dx = int(r.normal(0, 40 * k))
                base[y0:y0 + hgt] = np.roll(base[y0:y0 + hgt], dx, axis=1)
            base[..., 0] = np.roll(base[..., 0], int(10 * k), axis=1); base[..., 2] = np.roll(base[..., 2], -int(10 * k), axis=1)
            base = base * (1 - 0.25 * k) + PAPER * 0.25 * k
        if name == "lvm3_apart" and t >= 62.0:   # end card: the drawing falls back to a ghost behind the title
            k = ease((t - 62.0) / 0.8); g = Image.fromarray(base.astype(np.uint8)).filter(ImageFilter.GaussianBlur(5 * k))
            base = np.asarray(g, np.float32) * (1 - 0.86 * k) + PAPER * 0.86 * k
        base = base * VIG[..., None] + PAPER * (1 - VIG[..., None]) * 0.0
    # title layer
    M = {}
    if meta and info and info[2] in ("land2", "land3"):
        M = {"alt": meta["alt"], "vz": meta["vz"], "lit": meta["lit"]}
        if info[2] == "land2": M["vh"] = meta["vh"]
        if info[2] == "land3" and info[3] >= 5.0: M.update(alt=0, vz=0, flag="Touchdown · 18:03 IST")
    if info and len(info) > 2 and info[2] == "vk" and t < 51.9:   # the touchdown readout lingers over the first shot on the surface
        M = {"alt": 0, "vz": 0, "lit": 0, "flag": "Touchdown · 18:03 IST", "telOp": round(1 - ease((t - 51.3) / 0.6), 3)}
    if meta and info and info[2] == "ce20": M = {"k": meta["k"], "k0": 25.0}
    if meta and info and info[2] == "journey": M = {"craft": meta["craft"], "earth": meta["earth"], "moon": meta["moon"], "day": meta["day"]}
    sig = page.evaluate("([t, M]) => window.render(t, M)", [t, M])
    if sig != frame.lastsig:
        png = page.screenshot(omit_background=True, type="png", clip={"x": 0, "y": 0, "width": W, "height": H})
        ov = np.asarray(Image.open(__import__("io").BytesIO(png)).convert("RGBA"), np.float32)
        frame.ov = (ov[..., :3], ov[..., 3:] / 255.0); frame.lastsig = sig
    rgb, al = frame.ov
    out = base * (1 - al) + rgb * al
    out += rng.normal(0, 1.6, (H, W, 1)).astype(np.float32)   # fine grain, also keeps soft gradients from banding
    return np.clip(out + 0.5, 0, 255).astype(np.uint8)
frame.lastsig = None

with sync_playwright() as pw:
    br = pw.chromium.launch()
    page = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    page.goto("file://" + str(pathlib.Path(__file__).resolve().parents[1] / "overlay" / "overlay.html")); page.evaluate("window.ready")
    readers = {}
    if ONLY:
        for t in ONLY:
            readers = {}; frame.lastsig = None
            Image.fromarray(frame(t, readers, page)).save(WK + f"stills/still-{t:06.2f}.png")
            for r in readers.values(): r.close()
        print("stills done"); br.close(); sys.exit(0)
    poster = frame(POSTER_T, {}, page); frame.lastsig = None
    Image.fromarray(poster).save(OUT + "brag.jpg", quality=95); Image.fromarray(poster).save(WK + "poster.png")
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            "-i", WK + "audio-mix.wav",
                            "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-profile:v", "high", "-level", "5.1", "-tune", "film",
                            "-x264-params", "keyint=120:min-keyint=60:aq-mode=3", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
                            "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart", "-shortest", OUT + "brag.mp4"], stdin=subprocess.PIPE)
    nF = int(T * FPS)
    for f in range(nF):
        t = f / FPS
        img = poster if f == 0 else frame(t, readers, page)   # the poster is baked in as frame 0
        enc.stdin.write(img.tobytes())
        if f % 120 == 0: print(f"{t:5.1f}s", flush=True)
    enc.stdin.close(); enc.wait()
    for r in readers.values(): r.close()
    br.close()
print("wrote", OUT + "brag.mp4")
