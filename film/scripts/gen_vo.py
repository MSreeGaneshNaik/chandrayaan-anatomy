import os, pathlib
# narration with Kokoro (open-source, Apache-2.0): a blend of two British/American male voices, slowed and deepened
import json, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro
WK = os.environ.get("FILM_WORK", str(pathlib.Path(__file__).resolve().parents[1] / "work")) + "/"; D = WK + "tts/"; O = WK + "vo/"
k = Kokoro(D + "kokoro-v1.0.onnx", D + "voices-v1.0.bin")
mix = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {"bm_fable": 0.6, "am_onyx": 0.4}
style = sum(w * k.get_voice_style(v) for v, w in mix.items())
LINES = {
  "v01": "Every machine that carried India to the Moon...",
  "v02": "drawn again. Line, by line.",
  "v03": "Two thousand eight.",
  "v04": "A first step. A small orbiter, on our own rocket.",
  "v05": "On a world we thought was bone dry.",
  "v06": "Two thousand nineteen.",
  "v07": "We went for the surface.",
  "v09": "So we went back.",
  "v10": "Forty days, to cross the dark.",
  "v12": "And India was on the Moon.",
  "v13": "Now, it's yours.",
  "v14": "Open it. Fire it. Take it apart.",
  "v15": "Chandrayaan Anatomy.",
}
out = {}
for key, text in LINES.items():
    s, sr = k.create(text, voice=style, speed=0.9, lang="en-gb")
    s = resample_poly(s, 50, 47).astype(np.float32)   # play 6 % slower: about one semitone deeper, a touch more weight
    # trim silence, keep 40 ms
    a = np.abs(s); thr = 0.01 * a.max(); idx = np.where(a > thr)[0]
    s = s[max(0, idx[0] - int(0.04 * sr)): idx[-1] + int(0.12 * sr)]
    sf.write(O + key + ".wav", s, sr)
    out[key] = {"text": text, "dur": round(len(s) / sr, 3)}
    print(key, out[key]["dur"], text)
json.dump(out, open(O + "lines.json", "w"), indent=1)
