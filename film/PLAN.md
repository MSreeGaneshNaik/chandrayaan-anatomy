# Chandrayaan Anatomy: launch film plan

## The product
**What it is:** an interactive 3D engineering drawing of India's three Moon missions. It runs in a browser, as one HTML file.
**What you can do:** take the rockets and spacecraft apart, fire every engine with physics computed live from the rated figures, replay the landings, and follow the journeys on a to-scale map.
**Who it's for:** engineers, students and space fans. On LinkedIn, also the people who hire builders.
**What sets it apart:** it looks like an old technical drawing rather than a game. Every number comes from ISRO, NASA, ESA or LPSC papers and is listed in the sources. It is all one file.
**Most impressive claim:** this isn't a render; it's a web page you can take apart.
**Visual hook:** the LVM3's S200 boosters igniting, with exhaust billowing out of the pad ducts.
**Share caption:** see `share-copy.txt`.

## Angle
**"As if Nolan made it."** The film is a three-act story told through the product's own views: 2008 Chandrayaan-1, 2019 Chandrayaan-2 (Vikram goes silent about 330 m above the Moon), 2023 Chandrayaan-3 ("So we went back", touchdown at 18:03 IST). It uses a cold open, time cards, a ticking clock, a Shepard-tone climb, a hard silence at the decisive moments, an organ swell and brass hits. The product is the medium; the last 12 s say what it is and where to get it.

**Tone:** cinematic (Nolan). Sparse, wide-tracked caps for statements and mono time-codes. Hard cuts on the beat; text arrives with a short blur-to-sharp and tracking-in (prompt-motion style). No bounce.

**Look:** light mode, on purpose (Boss's call). The page's own paper drawing look: paper `#f6f6f3`, ink `#1d2024`, one red-orange accent `#d9452b`. Titles in Archivo (wdth 125) caps; time-codes in IBM Plex Mono. Interstitial cards are paper with ink type, not black.

**Format:** 4:5 portrait, 1080 × 1350, 60 fps, 66.0 s (Boss: "only 1.1 mins"). This replaces the skill's 15–25 s default at Boss's request.

**Rendering:**
- All 3D on Boss's Mac (Apple M4 Pro GPU) through a private capture artifact.
- Each frame is rendered at 3240 × 4050 internally (2160 × 2700 canvas, 1.5× supersampling with 4× MSAA), averages 3 sub-frames in linear light (a 180° shutter, for motion blur) and is box-filtered to 1080 × 1350.
- Frames are encoded on the GPU at 34 Mbps H.264 and collected here.
- Titles, grade, audio and the final x264 encode are done here.

## Music & sound (one beat grid)
- **Grid:** 120 BPM, so a beat is 0.5 s and a bar is 2 s. The film is 33 bars. Every cut and card lands on a beat, counted from frame 0.
- **Key:** A minor (Am–F–C–G family). The tick sits on every beat.
- **Instruments:**
  - pipe organ pads, with an ostinato in Act III;
  - a sub drone;
  - brass "BRAAAM" hits on the title (8.0 s) and after touchdown (50.5 s);
  - a Shepard-tone riser under both descents.
- **SFX, all tuned to the key and sitting under the music:**
  - ignition rumbles for LVM3 at 0.45 s and PSLV at 13.55 s;
  - separation clanks and whooshes for the take-aparts;
  - engine roar for the CE-20 and the lineup;
  - telemetry blips on the descent readouts;
  - a dead-air drop at signal loss (32.5 s).
- **Silence:** at 32.5 s (signal lost) and 50.0 s (touchdown, one beat).
- **Voice:** Kokoro TTS (open-source, Apache-2.0), a blend of `bm_fable` 0.6 and `am_onyx` 0.4, at speed 0.9, played 6 % slower for weight. Every line was checked by transcription with faster-whisper.

## Storyboard (seconds)
| Slot | Picture (plate) | On-screen text | Voice |
|---|---|---|---|
| 0.0–8.0 | `lvm3_ignite`: S200 ignition at 0.45; the camera rises from the deck to the whole vehicle | mono top: `SRIHARIKOTA · 14 JUL 2023 · 14:35 IST`; 1.5–4.0 **THIS IS NOT A RENDER.**; 4.5–7.5 **IT'S A WEB PAGE.** / `YOU CAN TAKE IT APART.` | 0.8 "Every machine that carried India to the Moon…" · 4.6 "…drawn again. Line, by line." |
| 8.0–12.0 | `lvm3_ignite` continues: full stack in exhaust | **CHANDRAYAAN ANATOMY** / `INDIA'S THREE MISSIONS TO THE MOON · DRAWN PART BY PART` | (BRAAAM) |
| 12.0–13.5 | paper card | `22 OCT 2008 · 06:22 IST` / **CHANDRAYAAN-1** | 12.4 "Two thousand eight." |
| 13.5–16.0 | `pslv_ign`: PSLV-C11 lights | `PSLV-C11 · SIX STRAP-ON BOOSTERS` | 14.0 "A first step. A small orbiter, on our own rocket." |
| 16.0–18.5 | `pslv_apart`: the stages come apart | — | |
| 18.5–22.0 | `c1`: Chandrayaan-1 turns | **IT FOUND SIGNS OF WATER ON THE MOON.** | 18.9 "On a world we thought was bone dry." |
| 22.0–23.5 | paper card | `22 JUL 2019 · 14:43 IST` / **CHANDRAYAAN-2** | 22.3 "Two thousand nineteen." |
| 23.5–28.0 | `ce20`: CE-20 comes apart to its turbopumps | **INDIA'S OWN CRYOGENIC ENGINE.** plus mono callouts (LH₂ turbopump, LOX turbopump, gas generator, thrust chamber, nozzle extension) | 24.6 "We went for the surface." |
| 28.0–32.5 | `land2`: Vikram's last 2.4 km | `07 SEP 2019 · POWERED DESCENT` plus a live altitude and speed readout from the replay | (tick accelerates, Shepard rises) |
| 32.5–35.5 | paper; silence | **≈330 METRES ABOVE THE MOON, THE SIGNAL STOPPED.** | |
| 35.5–37.0 | paper card | `14 JUL 2023 · 14:35 IST` / **CHANDRAYAAN-3** | 35.6 "So we went back." |
| 37.0–41.0 | `c3`: the propulsion module fires | `PROPULSION MODULE · 440 N ENGINE` / **WE WENT BACK.** | |
| 41.0–45.0 | `journey`: the 40-day track draws itself, to scale | **40 DAYS.** plus a day counter and EARTH / MOON / craft tags | 41.4 "Forty days, to cross the dark." |
| 45.0–50.5 | `land3`: hover at 150 m, touchdown at 50.0 | `23 AUG 2023 · VIKRAM · FINAL DESCENT` plus a live readout; at 50.0 the readout turns to `TOUCHDOWN · 18:03 IST` | (silence for a beat at 50.0, then the organ) |
| 50.5–54.0 | `vk`: Vikram and Pragyan at the site (cut on the organ swell) | **THE FIRST NEAR THE MOON'S SOUTH POLE.** (top band; the touchdown readout fades out by 51.9) | 51.2 "And India was on the Moon." |
| 54.0–58.0 | `lineup`: every engine lit, side by side | **EVERY ROCKET. EVERY ENGINE.** / `EVERY NUMBER SOURCED` | 54.4 "Now, it's yours." |
| 58.0–62.0 | `lvm3_apart`: LVM3 taken apart, turning | **ONE WEB PAGE.** / `OPEN IT · FIRE IT · TAKE IT APART` | 58.4 "Open it. Fire it. Take it apart." |
| 62.0–66.0 | `lvm3_apart` continues, faded back | **CHANDRAYAAN ANATOMY** / `ONE HTML FILE · LINK IN THE COMMENTS` | 62.6 "Chandrayaan Anatomy." |

## Fact basis (the project's fact-check log and research docs)
- **Launches:**
  - C1: 22 Oct 2008, 06:22 IST, PSLV-C11.
  - C2: 22 Jul 2019, 14:43:12 IST, GSLV Mk III-M1.
  - C3: 14 Jul 2023, 14:35:17 IST, LVM3-M4.
- **Water:** M³ on Chandrayaan-1 detected water. The film says "signs of water".
- **Chandrayaan-2:** ISRO reported normal performance down to 2.1 km; live telemetry ended at ≈330 m. The film says "≈330 metres … the signal stopped".
- **Chandrayaan-3:** touchdown 23 Aug 2023, 18:03 IST, about 69.37°S. It was the first landing near the lunar south polar region. Launch to landing is 40 days.
- **PSLV-XL:** six strap-on boosters (four lit on the ground, two in the air).

## Delivered
- **`brag.mp4`:** the master. x264 CRF 14 (slow, film tune), about 44 Mbps, AAC 320k.
- **`brag-linkedin.mp4`:** the same film at CRF 19, capped at 18 Mbps, for a lighter upload.
- **`brag.jpg`:** the poster, also baked in as frame 0 of both files.
- **`share-copy.txt`:** the post text, in Boss's LinkedIn format from the Anatomy design doc.

## Poster
The settled frame at 9.5 s (LVM3 in exhaust, title fully in) is baked in as frame 0.
