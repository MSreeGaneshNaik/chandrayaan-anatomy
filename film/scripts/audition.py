import os, pathlib
import sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
D = os.environ.get("FILM_WORK", str(pathlib.Path(__file__).resolve().parents[1] / "work")) + "/tts/"
k = Kokoro(D + "kokoro-v1.0.onnx", D + "voices-v1.0.bin")
line = "Two thousand nineteen. We went for the surface. Then, silence."
def f0(x, sr):
    # median F0 over voiced 40 ms frames by autocorrelation
    n = int(0.04 * sr); out = []
    for i in range(0, len(x) - n, n // 2):
        f = x[i:i+n] * np.hanning(n)
        if np.sqrt(np.mean(f**2)) < 0.02: continue
        ac = np.correlate(f, f, "full")[n-1:]
        lo, hi = int(sr/300), int(sr/60)
        j = lo + np.argmax(ac[lo:hi]); 
        if ac[j] > 0.3 * ac[0]: out.append(sr / j)
    return np.median(out) if out else 0
for v in ["bm_george", "bm_fable", "bm_lewis", "bm_daniel", "am_fenrir", "am_michael", "am_puck", "am_onyx", "am_adam"]:
    s, sr = k.create(line, voice=v, speed=0.88, lang="en-us" if v.startswith("a") else "en-gb")
    sf.write(D + f"aud-{v}.wav", s, sr)
    print(v, sr, f"{len(s)/sr:.2f}s", f"F0 {f0(s, sr):.0f} Hz", f"peak {np.abs(s).max():.2f}")
