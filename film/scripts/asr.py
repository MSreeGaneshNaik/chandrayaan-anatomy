import os, pathlib
import sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from math import gcd
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    x, sr = sf.read(f, dtype="float32")
    if x.ndim > 1: x = x.mean(1)
    g = gcd(16000, sr); x = resample_poly(x, 16000 // g, sr // g).astype(np.float32)
    segs, info = m.transcribe(x, beam_size=5)
    print(f.split("/")[-1], "→", " ".join(s.text.strip() for s in segs))
