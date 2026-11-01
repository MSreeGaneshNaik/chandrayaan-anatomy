import os, pathlib
# Score, sound design and mix for the Chandrayaan Anatomy film, all synthesised here.
# One grid: 120 BPM from frame 0 (beat 0.5 s, bar 2 s), 66 s, key A minor. Music, effects and
# narration share the grid and the same reverb space; effects sit under the music.
import json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d

SR = 48000; T = 66.0; N = int(SR * T)
W = os.environ.get("FILM_WORK", str(pathlib.Path(__file__).resolve().parents[1] / "work")) + "/"
rng = np.random.default_rng(1969)
mid = lambda n: 440.0 * 2 ** ((n - 69) / 12)
ts = lambda d: np.arange(int(round(d * SR))) / SR

def filt(x, kind, fc, order=2):
    sos = butter(order, fc, kind, fs=SR, output="sos"); return sosfilt(sos, x, axis=0)
def place(buf, x, t0, g=1.0):
    i = int(round(t0 * SR))
    if i < 0: x = x[-i:]; i = 0
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += g * x
def st(x, p=0.0, w=0.0):   # mono → stereo, equal-power pan p∈[-1,1]
    l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1)
def fade(n, a, r):
    e = np.ones(n); a = max(1, int(a * SR)); r = max(1, int(r * SR))
    e[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2; e[-r:] *= np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return e
def curve(points, n=N):   # piecewise-linear automation [(t, v), …]
    t = np.arange(n) / SR; P = np.array(points, float); return np.interp(t, P[:, 0], P[:, 1])
def noise(n, seed=None): return (np.random.default_rng(seed) if seed is not None else rng).standard_normal(n)

# ---------------------------------------------------------------- instruments
STOPS = [(0.5, 0.30), (1, 1.0), (2, 0.55), (3, 0.24), (4, 0.22), (6, 0.09), (8, 0.06)]   # 16′ 8′ 4′ 2⅔′ 2′ 1⅓′ 1′
def organ(notes, dur, att=0.5, rel=1.4, bright=1.0, stops=STOPS):
    n = int((dur + rel) * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for m in notes:
        f = mid(m)
        for mul, a in stops:
            ff = f * mul
            if ff > 8500: continue
            a = a * (bright if mul >= 3 else 1.0)
            for det in (-0.0011, 0.0013):
                out += a * np.sin(2 * np.pi * ff * (1 + det) * t + rng.uniform(0, 6.28))
    e = np.ones(n); A = int(att * SR); e[:A] = np.linspace(0, 1, A) ** 1.6
    R0 = int(dur * SR); e[R0:] = np.exp(-np.arange(n - R0) / (0.35 * rel * SR))
    return out * e / (len(notes) * 4.0)
def pluck(m, dur=0.6, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; f = mid(m); out = np.zeros(n)
    for k in range(1, 14):
        if f * k > 9000: break
        out += (1 / k ** (1.2 - 0.5 * bright)) * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + 1.4 * k))
    out[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return out * 0.35
def strings(notes, dur, att=1.2, rel=1.5):
    n = int((dur + rel) * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for m in notes:
        f = mid(m)
        for det in (-0.004, -0.0015, 0.0015, 0.004):
            ph = rng.uniform(0, 6.28); vib = 0.0025 * np.sin(2 * np.pi * 5.2 * t + ph)
            phase = 2 * np.pi * np.cumsum(f * (1 + det + vib)) / SR
            K = int(min(30, 7000 / f))
            for k in range(1, K + 1): out += np.sin(k * phase) / k / (1 + (k * f / 1800) ** 2)
    out = filt(out, "lowpass", 2600)
    e = np.ones(n); A = int(att * SR); e[:A] = np.linspace(0, 1, A) ** 2; R0 = int(dur * SR); e[R0:] = np.exp(-np.arange(n - R0) / (0.3 * rel * SR))
    return out * e / (len(notes) * 10)
def braam(notes, dur=3.6, peak=2600):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    fc = 220 + peak * np.minimum(1, t / 0.12) * np.exp(-np.maximum(0, t - 0.12) / 0.9)
    for m in notes:
        f0 = mid(m)
        for det in (-0.006, 0.0, 0.007):
            f = f0 * (1 + det); ph = rng.uniform(0, 6.28)
            for k in range(1, int(min(70, 8000 / f)) + 1):
                out += (1 / k) / (1 + (k * f / fc) ** 3) * np.sin(2 * np.pi * k * f * t + ph * k)
    out = np.tanh(1.8 * out / (len(notes) * 3)) * fade(n, 0.03, 1.6)
    return out * 0.6
def sub_hit(f0=70, f1=34, dur=2.2, g=1.0):
    t = ts(dur); f = f1 + (f0 - f1) * np.exp(-t / 0.18); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.75)
    x += 0.25 * filt(noise(len(t)), "lowpass", 160) * np.exp(-t / 0.08)
    return x * fade(len(t), 0.004, 0.5) * g
def shepard(dur, rate=0.32, base=27.5, octs=8, g=1.0):
    t = ts(dur); out = np.zeros(len(t))
    for k in range(octs):
        x = (k + rate * t) % octs; f = base * 2 ** x
        amp = np.exp(-0.5 * ((x - octs / 2) / (octs / 7.0)) ** 2)
        out += amp * np.sin(2 * np.pi * np.cumsum(f) / SR)
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * 4.0 * t - np.pi / 2)   # 8th-note pulse at 120 BPM
    return out * trem / octs * 2.2 * g
def tick(hi=True, g=1.0):
    t = ts(0.07); f = 1760.0 if hi else 1318.5
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.010) + 0.35 * filt(noise(len(t)), "highpass", 2500) * np.exp(-t / 0.0025)
    x += 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.004)
    return x * g * 0.5
def rumble(dur, att=0.5, rel=2.5, lpf=170, crackle=0.35, seed=0):
    n = int(dur * SR); r = np.random.default_rng(seed)
    out = []
    for ch in range(2):
        b = np.cumsum(r.standard_normal(n)); b = filt(b, "highpass", 18, 2); b /= np.abs(b).max() + 1e-9
        low = filt(b, "lowpass", lpf, 4) * 3.0
        imp = (r.random(n) < 0.0016) * r.standard_normal(n)
        cr = filt(imp, "bandpass", [350, 2400], 2) * crackle * 4
        roar = filt(r.standard_normal(n), "bandpass", [80, 900], 2) * 0.25
        out.append(low + cr + roar)
    x = np.stack(out, 1); e = fade(n, att, rel)
    return x * e[:, None] * 0.5
def whoosh(dur=1.2, f0=300, f1=3800, f2=700, g=1.0, seed=None):
    n = int(dur * SR); x = noise(n, seed); out = np.zeros(n); B = 2048
    fc = np.concatenate([np.geomspace(f0, f1, n // 2), np.geomspace(f1, f2, n - n // 2)])
    for i in range(0, n, B):   # piecewise band-pass sweep
        c = fc[i]; sos = butter(2, [c / 1.6, min(c * 1.6, 20000)], "bandpass", fs=SR, output="sos")
        out[i:i + B] = sosfilt(sos, x[max(0, i - 2048):i + B])[-len(x[i:i + B]):]
    e = np.sin(np.linspace(0, np.pi, n)) ** 2.2
    return out * e * g * 0.8
def clank(base=220.0, g=1.0, dur=1.4):
    t = ts(dur); x = np.zeros(len(t))
    for ratio, a, d in [(1, 1, 0.5), (2.76, 0.6, 0.3), (5.40, 0.35, 0.18), (8.93, 0.2, 0.1), (1.5, 0.3, 0.6)]:
        x += a * np.sin(2 * np.pi * base * ratio * t + rng.uniform(0, 6.28)) * np.exp(-t / d)
    x += 0.6 * filt(noise(len(t)), "bandpass", [800, 6000]) * np.exp(-t / 0.006)
    return x * g * 0.22
def blip(g=1.0, f=1760.0):
    t = ts(0.09); return np.sin(2 * np.pi * f * t) * fade(len(t), 0.004, 0.06) * g * 0.18
def hiss(dur, lo=600, hi=7000, g=1.0, att=0.2, rel=0.6, seed=None):
    n = int(dur * SR); return st(filt(noise(n, seed), "bandpass", [lo, hi]) * fade(n, att, rel) * g)
def ir(rt60=2.6, pre=0.025, bright=5200, seed=3):
    n = int(rt60 * 1.3 * SR); t = np.arange(n) / SR; r = np.random.default_rng(seed); out = []
    for ch in range(2):
        x = r.standard_normal(n) * 10 ** (-3 * t / rt60)
        x = filt(x, "lowpass", bright) * (0.55 + 0.45 * np.exp(-t / 0.4)) + filt(x, "lowpass", 1400) * (0.45 * (1 - np.exp(-t / 0.4)))
        out.append(np.concatenate([np.zeros(int(pre * SR)), x]))
    h = np.stack(out, 1); return h / np.sqrt((h ** 2).sum(0)).max()
def reverb(x, h):
    return np.stack([fftconvolve(x[:, c], h[:, c])[: len(x)] for c in range(2)], 1)

# ---------------------------------------------------------------- harmony (A minor, one chord per bar)
CH = {
    "Am": [45, 52, 57, 60, 64], "F": [41, 48, 53, 57, 60], "C": [48, 55, 60, 64, 67], "G": [43, 50, 55, 59, 62],
    "Dm": [38, 50, 57, 62, 65], "E": [40, 47, 52, 56, 59], "A": [45, 52, 57, 61, 64], "Fadd9": [41, 48, 55, 57, 60],
    "Am9": [45, 52, 59, 60, 64],
}
music = np.zeros((N, 2)); sfx = np.zeros((N, 2)); vo = np.zeros((N, 2))
def chord(name, t0, bars=1, g=1.0, att=0.6, bright=0.9, pan=0.0):
    x = organ(CH[name], bars * 2.0, att=att, bright=bright); place(music, st(x, pan), t0, g)

# cold open: a drone, then Am rising out of the ignition
drone = (np.sin(2 * np.pi * 55 * ts(12.5)) + 0.5 * np.sin(2 * np.pi * 110 * ts(12.5) + 1)) * fade(int(12.5 * SR), 1.5, 2.5) * 0.18
place(music, st(drone), 0.0)
chord("Am", 0.5, bars=2, g=0.45, att=2.4); chord("Am9", 4.5, bars=2, g=0.55, att=1.2)
# title (8–12): BRAAAM on F, then the dominant pulling into 2008
place(music, st(braam([29, 41, 48], 3.8)), 8.0, 0.9); place(music, st(sub_hit(70, 32, 2.6)), 8.0, 0.9)
chord("Fadd9", 8.0, bars=1, g=0.7, att=0.15, bright=1.1); chord("E", 10.0, bars=1, g=0.6, att=0.4)
# act I — 2008 (12–22): Am F C G Am, a soft pluck ostinato in 8ths from 13.5
for i, c in enumerate(["Am", "F", "C", "G", "Am"]): chord(c, 12.0 + 2 * i, g=0.5 + 0.04 * i, att=0.3)
def ostinato(name, t0, bars, inst="pluck", g=0.5, pat=(0, 2, 1, 3, 2, 4, 1, 3)):
    tones = sorted(CH[name])[1:] ; tones = [m + 12 for m in tones]
    for b in range(bars * 8):
        tt = t0 + b * 0.25; m = tones[pat[b % len(pat)] % len(tones)]
        if inst == "pluck": place(music, st(pluck(m, 0.55), 0.25 * np.sin(b)), tt, g * (0.85 + 0.15 * (b % 2 == 0)))
        else: place(music, st(organ([m], 0.22, att=0.008, rel=0.25, bright=1.2, stops=[(1, 1), (2, 0.6), (4, 0.3), (8, 0.08)]), 0.2 * np.sin(b * 0.7)), tt, g)
for i, c in enumerate(["Am", "F", "C", "G"]): ostinato(c, 14.0 + 2 * i, 1, g=0.30 + 0.03 * i)
# act II — 2019 (22–32.5): tension strings + organ, Shepard climb under the descent
place(music, st(strings([57, 60, 64, 69], 6.0)), 22.0, 0.55)
for i, c in enumerate(["Am", "F", "Dm"]): chord(c, 22.0 + 2 * i, g=0.45, att=0.4)
ostinato("Am", 24.0, 1, inst="organ", g=0.20); ostinato("F", 26.0, 1, inst="organ", g=0.24)
chord("E", 28.0, bars=2, g=0.5, att=0.8); place(music, st(strings([52, 56, 59, 64], 4.2, att=2.5)), 28.0, 0.6)
ostinato("E", 28.0, 2, inst="organ", g=0.28, pat=(0, 1, 2, 3, 4, 3, 2, 1))
place(music, st(shepard(4.6, rate=0.36, g=0.55)), 28.0)
# 32.5: signal lost — a hard cut (gated below); a faint high tone hangs in the silence
tone = np.sin(2 * np.pi * 3520 * ts(3.0)) * np.exp(-ts(3.0) / 1.4) * 0.012
place(music, st(tone), 32.5)
# 35.5: a single low note for "So we went back"
place(music, st(organ([33, 45], 1.4, att=0.02, rel=2.2, bright=0.6)), 35.5, 0.55)
# act III — 2023 (37–50): the organ ostinato, Am F C G Am F, building; Shepard under the landing
for i, c in enumerate(["Am", "F", "C", "G"]): chord(c, 37.0 + 2 * i, g=0.42 + 0.05 * i, att=0.35)
for i, c in enumerate(["Am", "F", "C", "G"]): ostinato(c, 37.0 + 2 * i, 1, inst="organ", g=0.20 + 0.03 * i)
place(music, st(strings([45, 52, 57, 60, 64], 8.0, att=3.0)), 41.0, 0.5)
chord("Am", 45.0, g=0.62, att=0.2); chord("F", 47.0, g=0.66, att=0.2); chord("E", 49.0, bars=0.5, g=0.7, att=0.2)
for i, c in enumerate(["Am", "F"]): ostinato(c, 45.0 + 2 * i, 1, inst="organ", g=0.34 + 0.04 * i)
ostinato("E", 49.0, 1, inst="organ", g=0.42, pat=(0, 1, 2, 3))
place(music, st(shepard(5.0, rate=0.42, g=0.7)), 45.0)
# 50.0: one beat of nothing. 50.5: touchdown — the major chord, full organ, and the brass
chord("A", 50.5, bars=1.75, g=1.0, att=0.05, bright=1.3); place(music, st(braam([33, 45, 52], 4.0, peak=3000)), 50.5, 0.75)
place(music, st(sub_hit(64, 30, 2.8)), 50.5, 1.0); place(music, st(strings([57, 61, 64, 69, 73], 3.5, att=0.3)), 50.5, 0.8)
chord("F", 54.0, g=0.75, att=0.3); chord("C", 56.0, g=0.75, att=0.3)
ostinato("F", 54.0, 1, inst="organ", g=0.30); ostinato("C", 56.0, 1, inst="organ", g=0.30)
chord("Am", 58.0, g=0.7, att=0.3); chord("F", 60.0, g=0.7, att=0.3)
ostinato("Am", 58.0, 1, inst="organ", g=0.28); ostinato("F", 60.0, 1, inst="organ", g=0.26)
# end card: the brass once more, softer, resolving to Am(add9), and the clock's last tick
place(music, st(braam([33, 45], 4.0, peak=1800)), 62.0, 0.5); place(music, st(sub_hit(60, 30, 3.0)), 62.0, 0.7)
chord("C", 62.0, bars=1, g=0.6, att=0.4); chord("Am9", 64.0, bars=0.9, g=0.55, att=0.6)

# the clock: every beat in the cold open and the acts, 8ths under each descent, 16ths into touchdown
def ticks(t0, t1, step, g0, g1):
    k = 0; t = t0
    while t < t1 - 1e-6:
        place(sfx, st(tick(k % 2 == 0), 0.0), t, g0 + (g1 - g0) * (t - t0) / max(1e-6, t1 - t0)); t += step; k += 1
ticks(0.0, 8.0, 0.5, 0.22, 0.3); ticks(12.0, 22.0, 0.5, 0.22, 0.28); ticks(22.0, 28.0, 0.5, 0.3, 0.38)
ticks(28.0, 32.5, 0.25, 0.36, 0.55); ticks(37.0, 45.0, 0.5, 0.26, 0.36); ticks(45.0, 48.5, 0.25, 0.38, 0.5)
ticks(48.5, 50.0, 0.125, 0.45, 0.6); place(sfx, st(tick(True)), 65.5, 0.3)

# ---------------------------------------------------------------- effects, on the picture's own events
place(sfx, rumble(8.5, att=0.6, rel=3.0, seed=11), 0.5, 0.72); place(sfx, st(sub_hit(58, 30, 2.0)), 0.5, 0.7)
place(sfx, hiss(7.5, 1500, 9000, g=0.05, att=1.0, rel=2.5), 0.6)
for tt in (11.0, 21.0):   # reverse swells into the time cards, and the low hit on the card
    sw = filt(noise(int(1.0 * SR)), "bandpass", [200, 3000]) * np.linspace(0, 1, int(1.0 * SR)) ** 3
    place(sfx, st(sw), tt, 0.10); place(sfx, st(sub_hit(80, 40, 1.6)), tt + 1.0, 0.55)
place(sfx, rumble(5.0, att=0.3, rel=1.5, lpf=150, seed=12), 13.5, 0.75)
place(sfx, st(whoosh(1.4, 250, 3200, 600, seed=4), -0.3), 15.8, 0.5)
for i, d in enumerate([0, 0.11, 0.22, 0.32, 0.43, 0.53, 0.67]): place(sfx, st(clank(220 * (1 + 0.06 * i)), 0.4 * np.sin(i * 2)), 16.0 + d, 0.6 - 0.05 * i)
place(sfx, st(whoosh(0.8, 400, 2400, 900, seed=5)), 18.3, 0.18)
place(sfx, st(whoosh(1.6, 200, 2800, 500, seed=6), 0.2), 23.8, 0.45)
for i in range(9): place(sfx, st(clank(330 * (1 + 0.04 * i), dur=0.8), 0.5 * np.cos(i)), 24.0 + 0.12 * i, 0.38)
place(sfx, hiss(4.6, 300, 5000, g=0.12, att=0.6, rel=0.05), 28.0)   # Vikram's engines, 2019
for k in range(9): place(sfx, st(blip(1.0 if k % 2 == 0 else 0.7, 1760.0 if k % 2 == 0 else 1318.5)), 28.25 + 0.5 * k, 1.0)
place(sfx, st(filt(noise(int(4.5 * SR)), "bandpass", [1200, 4200]) * 0.035), 28.0)   # radio static, cut with the signal
place(sfx, hiss(3.6, 250, 4000, g=0.07, att=0.5, rel=1.4), 37.5); place(sfx, rumble(3.4, att=0.4, rel=1.6, lpf=120, crackle=0.05, seed=13), 37.5, 0.25)
place(sfx, st(whoosh(1.2, 300, 2600, 700, seed=7)), 40.8, 0.2)
place(sfx, hiss(5.0, 250, 4500, g=0.09, att=0.6, rel=0.02), 45.0)   # Vikram, 2023
for k in range(10): place(sfx, st(blip(0.9, 1760.0 if k % 2 == 0 else 1318.5)), 45.25 + 0.5 * k, 1.0)
place(sfx, st(filt(noise(int(1.6 * SR)), "lowpass", 900) * fade(int(1.6 * SR), 0.6, 0.02) * 0.25), 48.4)   # dust
place(sfx, rumble(4.5, att=0.4, rel=1.8, lpf=160, crackle=0.2, seed=14), 54.0, 0.55); place(sfx, hiss(4.0, 400, 7000, g=0.06, att=0.4, rel=1.6), 54.0)
place(sfx, st(whoosh(1.8, 200, 3000, 500, seed=8), -0.2), 58.3, 0.45)
for i, d in enumerate([0, 0.2, 0.42, 0.63, 0.85]): place(sfx, st(clank(196 * (1 + 0.05 * i), dur=1.2), 0.5 * np.sin(i * 1.7)), 58.5 + d, 0.42)

# ---------------------------------------------------------------- narration
L = json.load(open(W + "vo/lines.json"))
VO_AT = {"v01": 0.8, "v02": 4.6, "v03": 12.4, "v04": 14.4, "v05": 18.9, "v06": 22.3, "v07": 24.9, "v09": 35.6,
         "v10": 41.4, "v12": 51.2, "v13": 54.4, "v14": 58.4, "v15": 62.6}
def proc_vo(x):
    x = resample_poly(x, 2, 1)   # 24 → 48 kHz
    x = filt(x, "highpass", 75)
    x = x + 0.22 * filt(x, "lowpass", 180) + 0.18 * filt(x, "bandpass", [2500, 4500])   # weight and presence
    x /= np.abs(x).max() + 1e-9
    env = uniform_filter1d(np.abs(x), int(0.02 * SR)); thr = 0.18
    g = np.where(env > thr, (thr / np.maximum(env, 1e-9)) ** (1 - 1 / 3.0), 1.0)   # 3:1 above the threshold
    g = uniform_filter1d(g, int(0.01 * SR)); x = x * g
    return x / (np.abs(x).max() + 1e-9)
for k, t0 in VO_AT.items():
    x, sr = sf.read(W + f"vo/{k}.wav", dtype="float64"); place(vo, st(proc_vo(x)), t0, 0.86)

# ---------------------------------------------------------------- mix
H = ir(2.8); Hv = ir(1.3, pre=0.015, bright=6500, seed=5)
music = music + 0.34 * reverb(music, H)
sfx = sfx + 0.22 * reverb(sfx, H)
vo = vo + 0.10 * reverb(vo, Hv)
music = filt(music, "highpass", 28); sfx = filt(sfx, "highpass", 25)
# narration ducks the bed by up to ~6 dB
ve = uniform_filter1d(np.abs(vo).max(1), int(0.25 * SR)); ve = ve / (ve.max() + 1e-9)
duck = 1 - 0.5 * np.clip(ve * 3, 0, 1)
# the two silences: signal lost (32.5–35.5) and the beat before touchdown's answer (50.0–50.5)
gate = curve([(0, 1), (32.49, 1), (32.502, 0), (35.45, 0), (35.5, 1), (49.99, 1), (50.002, 0), (50.49, 0), (50.5, 1), (66, 1)])
tone_keep = np.zeros((N, 2)); place(tone_keep, st(tone), 32.5, 1.0)   # the high tone survives the gate
bed = (music * 0.9 + sfx * 0.8) * (duck * gate)[:, None] + tone_keep * 0.9
# final fade: nothing after 65.9
bed *= curve([(0, 1), (64.6, 1), (65.95, 0), (66, 0)])[:, None]
mix = bed + vo
# loudness to −14 LUFS, then a look-ahead peak limiter at −1 dBFS
meter = pyln.Meter(SR); lufs = meter.integrated_loudness(mix); mix *= 10 ** ((-14.0 - lufs) / 20)
ceil = 10 ** (-1.0 / 20); pk = maximum_filter1d(np.abs(mix).max(1), int(0.006 * SR), origin=0)
g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9)); g = np.minimum(g, uniform_filter1d(g, int(0.004 * SR)))
g = np.minimum.accumulate(g[::-1])[::-1] * 0 + g   # keep the per-sample minimum
g = uniform_filter1d(g, int(0.003 * SR)); mix *= g[:, None]
mix = np.clip(mix, -ceil, ceil)
print("LUFS in", round(lufs, 1), "out", round(meter.integrated_loudness(mix), 1), "peak", round(20 * np.log10(np.abs(mix).max()), 2), "dBFS")
for name, x in (("mix", mix), ("music", music), ("sfx", sfx), ("vo", vo)):
    sf.write(W + f"audio-{name}.wav", (x / max(1.0, np.abs(x).max())).astype(np.float32) if name != "mix" else mix.astype(np.float32), SR, subtype="PCM_24" if name == "mix" else "FLOAT")
print("done", W + "audio-mix.wav")
