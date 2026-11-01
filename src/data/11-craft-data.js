// ============================================================================
// 11 · THE SPACECRAFT — dimensions that drive the models (metres), the sheet of
// every assembly and instrument, the engine groups each display can fire, and
// the parts index sections. Rated figures from ISRO's mission pages and
// brochures; drawn fittings are sized to fit around them.
// ============================================================================
// Vikram (Chandrayaan-3): body 2.0 × 2.0 × 1.166 m (ISRO); footpads at y = 0. Leg span (footpads on a ≈3.0 m
// square), floor height, engine bells and the yellow top dome are scaled from ISRO's photographs and its labelled
// CAD (JPL navigation paper, 2024), ±20 %; they are not published.
const VKG = { w: 2.0, h: 1.166, yb: 0.8, chamfer: 0.2, coneR: 0.48, domeR: 0.5, domeH: 0.4, engX: 0.6, engLen: 0.54, engExit: 0.14, plume: 3.0, legR: 2.1, padR: 0.14, padH: 0.06, rampW: 0.8, rampL1: 0.9, rampL2: 1.1, rampMid: 0.35, roverIn: 0.5 };
// Pragyan: 917 × 750 × 397 mm stowed (ISRO), six wheels on rocker-bogies; wheel size scaled from photographs; drawn deployed, so the mast stands taller
const RVG = { w: 0.5, l: 0.72, h: 0.13, bodyY: 0.06, wheelR: 0.085, wheelW: 0.075, wheelZ: [0.375, -0.02, -0.375], panelW: 0.48, panelL: 0.7, panelAng: 1.32 };
// Chandrayaan-3 propulsion module: the box, the inter-module adapter cone on top, the 440 N engine under,
// the solar panel flush on one side. ISRO publishes none of these sizes; scaled from its photographs (±20 %).
const PMG = { w: 1.85, d: 1.75, h: 1.35, ima: 1.1, imaR0: 0.55, imaR1: 0.55, tubeR: 0.45, lamLen: 0.66, lamExit: 0.14, panelW: 1.7, panelH: 2.6 };
// Chandrayaan-2 orbiter: 3.2 × 5.8 × 2.1 m (ISRO) with the solar wing deployed; Vikram on an adapter on top
const O2G = { w: 2.0, d: 1.85, h: 2.0, ad: 0.5, adR0: 0.62, adR1: 0.5, hgaR: 0.36, panelW: 3.3, panelH: 1.9, sarW: 1.3, sarH: 0.55 };
// Chandrayaan-1: a 1.5 × 1.53 × 1.56 m cuboid; its central cylinder (0.917 m across) rises to 2.18 m (ISRO, in the PDS archive); one 2.15 × 1.8 m solar panel; the 0.7 m dish; the 375 × 375 × 470 mm MIP
const O1G = { a: 1.5, w: 1.53, d: 1.5, h: 1.56, cylR: 0.458, cylTop: 2.18, hgaR: 0.35, panelW: 2.15, panelH: 1.8, mip: [0.375, 0.47, 0.375], sarW: 0.62, sarH: 0.42 };

const CRAFTINFO = {
  // ----- whole displays -----
  c3: { name: "Chandrayaan-3 · integrated module", by: "ISRO · URSC", desc: "Vikram, with Pragyan folded inside, mounted on the propulsion module that carried it from Earth orbit to a 153 × 163 km lunar orbit (100 km planned). 3,900 kg at launch on LVM3-M4, 14 July 2023.", kv: [["Mass at launch", "3,900 kg"], ["Propulsion module", "2,148 kg · 758 W"], ["Lander with rover", "1,752 kg · 738 W"], ["Rover", "26 kg · 50 W"], ["Launch", "14 Jul 2023 · LVM3-M4"], ["Landing", "23 Aug 2023 · 18:03 IST (12:33 UTC)"]] },
  c2: { name: "Chandrayaan-2 · orbiter with Vikram", by: "ISRO · URSC", desc: "The orbiter with Vikram on its top deck and Pragyan inside the lander. 3,850 kg at launch on GSLV Mk III-M1, 22 July 2019. Vikram crashed on 7 September; the orbiter was still returning data in 2026.", kv: [["Mass at launch", "3,850 kg"], ["Orbiter", "2,379 kg · 1,000 W"], ["Lander with rover", "1,471 kg · 650 W"], ["Rover", "27 kg · 50 W"], ["Orbiter size", "3.2 × 5.8 × 2.2 m, wing out"], ["Launch", "22 Jul 2019 · GSLV Mk III-M1"]] },
  c1: { name: "Chandrayaan-1", by: "ISRO · ISAC", desc: "India's first mission beyond Earth orbit: a cuboid bus about 1.5 m on a side, adapted from ISRO's IRS satellite bus, carrying five Indian and six foreign instruments. It worked for 312 days and found water and hydroxyl on the Moon.", kv: [["Mass at launch", "1,380 kg"], ["In lunar orbit", "≈675 kg"], ["Power", "700 W (≈750 W peak) from one 2.15 × 1.8 m panel"], ["Instruments", "11 · five Indian, six foreign"], ["Launch", "22 Oct 2008 · PSLV-C11"], ["Contact lost", "29 Aug 2009 · day 312"]] },
  vk3surf: { name: "Vikram and Pragyan at Shiv Shakti Point", by: "ISRO · URSC", desc: "The lander as it stood after touchdown at 69.373°S, 32.319°E, about 625 km from the south pole: ramp down, Pragyan out, ChaSTE's probe in the soil, RAMBHA-LP's probe on its boom. They worked for about 12 Earth days of the lunar day before being put to sleep on 2 and 4 September.", kv: [["Touchdown", "23 Aug 2023 · 12:33 UTC"], ["Site", "69.373°S 32.319°E"], ["Rover out", "within hours of landing"], ["Rover drive", "more than 100 m"], ["Hop", "3 Sep 2023 · ≈40 cm up"], ["Asleep", "Rover 2 Sep · lander 4 Sep 2023"]] },
  landing: { name: "The landings", by: "ISRO", desc: "Both of Vikram's powered descents, replayed from the published phase boundaries: Chandrayaan-3's landing at Shiv Shakti Point, Chandrayaan-2's crash at Tiranga Point, and the 40 cm hop that came after.", kv: [] },
  // ----- Vikram -----
  vkBody3: { name: "Vikram · lander body", short: "Body", by: "ISRO · URSC", desc: "A box-shaped body, 2.0 × 2.0 × 1.166 m, largely wrapped in gold multi-layer insulation, with the propellant tanks inside. Named after Vikram Sarabhai, who founded India's space programme.", kv: [["Overall", "2.0 × 2.0 × 1.166 m"], ["Mass", "1,752 kg with the rover"], ["Life", "one lunar day (≈14 Earth days) · worked ≈12"], ["Talks to", "IDSN · Chandrayaan-2 orbiter · Pragyan"], ["Reaction wheels", "4 · 10 N·m·s"]] },
  vkBody2: { name: "Vikram (Chandrayaan-2) · lander body", short: "Body", by: "ISRO · URSC", desc: "The first Vikram: a truncated pyramid round a central cylinder holding the propellant tank and the separation interface to the orbiter, lighter than its successor, with less propellant and a smaller target area. It is drawn here with Chandrayaan-3's body.", kv: [["Size", "2.54 × 2 × 1.2 m"], ["Mass", "1,471 kg with the rover"], ["Power", "650 W"], ["Target area", "500 × 500 m"]] },
  vkSolar3: { name: "Vikram · solar panels", short: "Solar", desc: "Chandrayaan-3's Vikram has solar panels on more of its faces than Chandrayaan-2's, so it could make power whichever way it landed.", kv: [["Power", "738 W (with bias)"], ["Battery", "Li-ion"]] },
  vkSolar2: { name: "Vikram (Chandrayaan-2) · solar panels", short: "Solar", desc: "Chandrayaan-2's Vikram carried panels on fewer faces than its successor.", kv: [["Power", "650 W"]] },
  vkEng3: { name: "Vikram · four 800 N throttleable engines", short: "Engines", by: "ISRO · LPSC", desc: "Bi-propellant engines burning MMH with MON3, throttled together through the braking phases; two were shut down at the 800 m hover and the last 800 m flown on the other two. Chandrayaan-3 dropped Chandrayaan-2's fifth, central engine. Eight 58 N thrusters steer.", kv: [["Main engines", "4 × 800 N, throttleable"], ["Attitude", "8 × 58 N"], ["Propellants", "MMH / MON3"], ["Fired", "de-boost 18 & 20 Aug · descent 23 Aug · hop 3 Sep 2023"]] },
  vkEng2: { name: "Vikram (Chandrayaan-2) · five 800 N engines", short: "Engines", by: "ISRO · LPSC", desc: "Four throttleable 800 N engines near the corners of the floor, throttled 40–100 % in 20 % steps, and a fixed-thrust fifth in the centre, added late in the design. Eight 58 N thrusters steer.", kv: [["Main engines", "4 × 800 N throttleable + 1 × 800 N fixed"], ["Throttle", "40–100 % in 20 % steps"], ["Attitude", "8 × 58 N"], ["Propellants", "MMH / MON3"]] },
  vkLegs3: { name: "Vikram · landing legs", short: "Legs", desc: "Four legs with shock-absorbing struts and footpads, strengthened for Chandrayaan-3 after Chandrayaan-2's crash; touchdown sensors under the pads tell the computer to cut the engines.", kv: [["Touchdown limits", "≤ 2 m/s down · ≤ 0.5 m/s across"], ["Slope", "≤ 12°"], ["Tested to", "3 m/s down"]] },
  vkLegs2: { name: "Vikram (Chandrayaan-2) · landing legs", short: "Legs", desc: "Four legs with shock-absorbing struts and footpads.", kv: [] },
  vkSens3: { name: "Vikram · landing sensors", short: "Sensors", desc: "Cameras and altimeters that let Vikram find its own way down: the position-detection camera matched craters against maps; the hazard camera picked a safe spot from 150 m; the laser Doppler velocimeter, new on Chandrayaan-3, measured velocity in three axes.", kv: [["Cameras", "LPDC · LHDAC · LHVC"], ["Altimeters", "Ka-band (KaRA) · laser (LASA)"], ["Velocity", "Laser Doppler velocimeter (LDV)"], ["Inertial", "LIRAP · micro star sensor · inclinometer"]] },
  vkSens2: { name: "Vikram (Chandrayaan-2) · landing sensors", short: "Sensors", desc: "Cameras and altimeters for an autonomous landing. Chandrayaan-2's Vikram had no laser Doppler velocimeter.", kv: [] },
  vkRamp: { name: "Vikram · rover ramp", short: "Ramp", desc: "A two-panel ramp, primary and secondary, that unfolds from the side of the lander; Pragyan rolled down it a few hours after the landing, on the night of 23 August.", kv: [["Panels", "primary and secondary"]] },
  pChaSTE: { name: "ChaSTE · Chandra's Surface Thermophysical Experiment", short: "ChaSTE", by: "SPL, VSSC with PRL", desc: "A probe with ten temperature sensors that a motor drove 10 cm into the regolith. It measured the first temperature profile near the lunar south pole: about 70 °C at the surface in the first readings on 27 August 2023, falling to around −10 °C just 8 cm down; a 2025 analysis puts the later peak at 82 °C on the probe's sun-facing slope.", kv: [["Depth", "10 cm · 10 sensors"], ["Surface", "≈ 70 °C (27 Aug) · 82 °C peak"], ["8 cm down", "≈ −10 °C"]] },
  pILSA: { name: "ILSA · Instrument for Lunar Seismic Activity", short: "ILSA", by: "LEOS, Bengaluru", desc: "A seismometer built from micro-machined silicon accelerometers, set down on the ground by a mechanism. It recorded the rover moving and, on 26 August 2023, an event that ISRO said appeared to be natural; its source is still under investigation.", kv: [["Sensor", "MEMS accelerometers"], ["Event", "26 Aug 2023 · apparently natural"]] },
  pRAMBHA: { name: "RAMBHA-LP · Langmuir probe", short: "RAMBHA-LP", by: "SPL, VSSC", desc: "A spherical probe on a boom that measures the density of the thin plasma near the surface and how it changes through the lunar day.", kv: [["Electron density", "380–600 per cm³ (ISRO, Dec 2025)"], ["Electron temperature", "3,000–8,000 K"]] },
  pLRA: { name: "Laser retroreflector array", short: "LRA", by: "NASA GSFC", desc: "A passive array of corner-cube reflectors on the top deck, a target for laser ranging from lunar orbiters. In December 2023 NASA's Lunar Reconnaissance Orbiter bounced a laser off it.", kv: [["Type", "passive · 8 corner cubes"], ["First ranged", "12 Dec 2023 · LRO"]] },
  pragyan: { name: "Pragyan rover", short: "Pragyan", by: "ISRO · URSC", desc: "A six-wheeled rover on rocker-bogies, 26 kg, with a solar panel, two navigation cameras and two spectrometers. It talked only to Vikram. Its LIBS confirmed sulphur in the south polar soil.", kv: [["Size", "917 × 750 × 397 mm"], ["Mass", "26 kg"], ["Power", "50 W"], ["Speed", "≈1 cm/s"], ["Instruments", "APXS (PRL) · LIBS (LEOS)"], ["Drove", "more than 100 m"]] },
  // ----- Chandrayaan-2's Vikram carried the same kinds of payload; none of it worked on the surface -----
  vkRamp2: { name: "Vikram (Chandrayaan-2) · rover ramp", short: "Ramp", desc: "The ramp Pragyan was to roll down after the landing. It never deployed: Vikram crashed on 7 September 2019.", kv: [["Deployed", "never"]] },
  pChaSTE2: { name: "ChaSTE (Chandrayaan-2)", short: "ChaSTE", by: "SPL, VSSC with PRL", desc: "The thermal probe that was to be driven 10 cm into the regolith. Lost with Vikram on 7 September 2019; the same design flew again on Chandrayaan-3.", kv: [["Depth", "10 cm · 10 sensors (design)"], ["Fate", "lost with Vikram, 7 Sep 2019"]] },
  pILSA2: { name: "ILSA (Chandrayaan-2)", short: "ILSA", by: "LEOS, Bengaluru", desc: "The seismometer of micro-machined silicon accelerometers. Lost with Vikram on 7 September 2019; it flew again on Chandrayaan-3.", kv: [["Sensor", "MEMS accelerometers"], ["Fate", "lost with Vikram, 7 Sep 2019"]] },
  pRAMBHA2: { name: "RAMBHA-LP (Chandrayaan-2)", short: "RAMBHA-LP", by: "SPL, VSSC", desc: "The Langmuir probe for the plasma near the surface. Lost with Vikram on 7 September 2019; it flew again on Chandrayaan-3.", kv: [["Fate", "lost with Vikram, 7 Sep 2019"]] },
  pLRA2: { name: "Laser retroreflector array (Chandrayaan-2)", short: "LRA", by: "NASA GSFC", desc: "NASA's passive corner-cube array on the top deck, the mission's one foreign payload. It went down with Vikram on 7 September 2019.", kv: [["Type", "passive · corner cubes"], ["Fate", "on Vikram's crash site"]] },
  pragyan2: { name: "Pragyan rover (Chandrayaan-2)", short: "Pragyan", by: "ISRO · URSC", desc: "The first Pragyan, six-wheeled with APXS and LIBS, folded inside Vikram. It was never deployed: it went down with the lander on 7 September 2019.", kv: [["Size", "0.9 × 0.75 × 0.85 m"], ["Mass", "27 kg"], ["Power", "50 W"], ["Instruments", "APXS (PRL) · LIBS (LEOS)"], ["Fate", "not deployed"]] },
  // ----- the propulsion module -----
  pmBody: { name: "Propulsion module", short: "Propulsion module", by: "ISRO · URSC", desc: "A modified I-3K box built round a central cylinder that carried Vikram from the orbit LVM3 left it in to a 153 × 163 km lunar orbit. With more than 100 kg of propellant left, it then flew itself back to an orbit around Earth.", kv: [["Mass", "2,148 kg (ISRO site)"], ["Dry", "448.6 kg (brochure)"], ["Propellant", "1,696.4 kg MMH / MON3 (brochure; 2,145 kg in all)"], ["Power", "758 W"], ["Planned life", "3–6 months"], ["Now", "in high Earth orbit"]] },
  pmPanel: { name: "Propulsion module · solar panel", short: "Solar panel", desc: "One large panel mounted flush on the side of the module, where Chandrayaan-2's orbiter carried a wing on a yoke.", kv: [["Power", "758 W"]] },
  pmLAM: { name: "Propulsion module · 440 N engine", short: "440 N engine", by: "ISRO · LPSC", desc: "The engine that did every orbit change from Earth orbit to lunar orbit, and later the trip home: one bi-propellant motor burning MMH with MON3, with attitude thrusters around the base.", kv: [["Thrust", "440 N"], ["Propellants", "MMH / MON3"], ["Longest burn", "1,835 s · lunar orbit insertion"]] },
  pmRCS: { name: "Propulsion module · attitude thrusters", short: "22 N thrusters", by: "ISRO · LPSC", desc: "Eight 22 N thrusters, drawn in pairs under the bottom corners where ISRO's CAD shows clusters: they hold the module's attitude, and turn it, between the big burns of the 440 N engine.", kv: [["Thrusters", "8 × 22 N"], ["Propellants", "MMH / MON3"]] },
  pmIMA: { name: "Inter-module adapter", short: "Adapter", desc: "The cone joining Vikram to the propulsion module. On 17 August 2023 springs pushed them apart: 0.20 m/s to the lander, 0.72 m/s to the module.", kv: [["Separation", "17 Aug 2023"], ["Spring push", "0.20 m/s lander · 0.72 m/s module"]] },
  pSHAPE: { name: "SHAPE · Spectro-polarimetry of HAbitable Planet Earth", short: "SHAPE", by: "URSC", desc: "A near-infrared spectro-polarimeter that looks back at Earth from lunar distance, to learn what a habitable planet looks like in reflected light, as a reference for studying exoplanets.", kv: [["Band", "1.0–1.7 µm"]] },
  // ----- Chandrayaan-2 orbiter -----
  o2Body: { name: "Chandrayaan-2 orbiter", short: "Orbiter", by: "ISRO · URSC", desc: "The bus that carried Vikram to the Moon and has orbited it since 2019, about 100 km up, with eight instruments. A precise launch and careful burns left fuel for about seven years instead of one.", kv: [["Mass", "2,379 kg"], ["Power", "1,000 W"], ["Orbit", "≈100 km polar"], ["Planned life", "1 year · now 7+"]] },
  o2Panel: { name: "Chandrayaan-2 orbiter · solar wing", short: "Solar wing", desc: "One wing of two panels on a yoke, on the side of the bus.", kv: [["Power", "1,000 W"]] },
  o2Hga: { name: "Chandrayaan-2 orbiter · high-gain antenna", short: "Antenna", desc: "A dual-gimballed X-band dish that steers to the ground station to send the science data to the Indian Deep Space Network at Byalalu; separate S-band antennas carry commands and telemetry.", kv: [["Band", "X · payload data"]] },
  o2LAM: { name: "Chandrayaan-2 orbiter · 440 N engine", short: "440 N engine", by: "ISRO · LPSC", desc: "The orbiter's main engine; it fired for the five Earth-bound burns, the transfer, the 1,738 s capture burn and the lunar orbit changes.", kv: [["Thrust", "440 N"], ["Propellants", "MMH / MON3"], ["Capture burn", "1,738 s · 20 Aug 2019"]] },
  iTMC2: { name: "TMC-2 · Terrain Mapping Camera 2", short: "TMC-2", by: "SAC", desc: "A three-view stereo camera that maps the surface in 3D.", kv: [["Resolution", "5 m from 100 km"], ["Swath", "20 km"]] },
  iOHRC: { name: "OHRC · Orbiter High Resolution Camera", short: "OHRC", by: "SAC", desc: "The sharpest camera ever flown around the Moon. It imaged landing sites for Chandrayaan-3 and later photographed Vikram on the ground at Shiv Shakti Point.", kv: [["Resolution", "0.25 m from 100 km"], ["Swath", "3 km"]] },
  iIIRS: { name: "IIRS · Imaging Infrared Spectrometer", short: "IIRS", by: "SAC", desc: "Maps minerals, water and hydroxyl across the surface in 256 spectral bands.", kv: [["Band", "0.8–5 µm"]] },
  iDFSAR: { name: "DFSAR · Dual-Frequency Synthetic Aperture Radar", short: "DFSAR", by: "SAC", desc: "The first radar to image the Moon in L band, with an S-band channel, and the first fully polarimetric one, looking for ice beneath the surface and in permanently shadowed craters.", kv: [["Bands", "L and S"]] },
  iCLASS: { name: "CLASS · Chandrayaan-2 Large Area Soft X-ray Spectrometer", short: "CLASS", by: "URSC", desc: "Measures X-rays fluoresced by the surface when the Sun flares, to map the elements: magnesium, aluminium, silicon, calcium, titanium, iron and sodium.", kv: [["Band", "0.8–15 keV"]] },
  iXSM: { name: "XSM · Solar X-ray Monitor", short: "XSM", by: "PRL", desc: "Watches the Sun's X-ray output so CLASS can read the surface correctly; its own record of solar flares is a science result in itself.", kv: [["Band", "1–15 keV"]] },
  iCHACE2: { name: "CHACE-2 · Chandra's Atmospheric Composition Explorer 2", short: "CHACE-2", by: "SPL, VSSC", desc: "A mass spectrometer sampling the Moon's thin exosphere; it detected argon-40 across the lunar day.", kv: [["Range", "1–300 amu"]] },
  iDFRS: { name: "DFRS · Dual-Frequency Radio Science", short: "DFRS", by: "SPL, VSSC · with URSC, ISTRAC", desc: "Two coherent radio signals to Earth probe the electrons above the lunar surface during selected occultation campaigns, as the orbiter passes behind the Moon seen from Earth.", kv: [["Bands", "S and X"]] },
  // ----- Chandrayaan-1 -----
  c1Body: { name: "Chandrayaan-1 bus", short: "Bus", by: "ISRO · ISAC", desc: "A cuboid of aluminium honeycomb and composite panels, about 1.5 m on a side, under gold insulation, with the instruments on its decks. Its heat ran higher than planned in lunar orbit, and the orbit was raised from 100 to 200 km in May 2009 to cool it.", kv: [["Size", "1.5 × 1.53 × 1.56 m"], ["Mass", "1,380 kg at launch · 560 kg dry · 818 kg propellant"], ["Life", "312 days · 3,400+ orbits"]] },
  c1Panel: { name: "Chandrayaan-1 · solar panel", short: "Solar panel", desc: "A single deployable panel with a lithium-ion battery for the eclipses.", kv: [["Size", "2.15 × 1.8 m"], ["Power", "700 W (≈750 W peak)"], ["Battery", "Li-ion · 36 Ah"]] },
  c1Hga: { name: "Chandrayaan-1 · high-gain antenna", short: "Antenna", desc: "A 0.7 m dual-gimballed dish that sent the science data to Byalalu in X-band.", kv: [["Diameter", "0.7 m"], ["Band", "X (science) · S (control)"]] },
  c1LAM: { name: "Chandrayaan-1 · 440 N engine", short: "440 N engine", by: "ISRO · LPSC", desc: "One bi-propellant engine on the bottom face for the five Earth-bound burns and the 817 s capture burn, with eight 22 N thrusters for attitude and two 390 litre tanks inside the central cylinder.", kv: [["Thrust", "440 N"], ["Attitude", "8 × 22 N"], ["Propellants", "MMH / MON3"], ["Capture burn", "817 s · 8 Nov 2008"]] },
  c1MIP: { name: "MIP · Moon Impact Probe", short: "Moon Impact Probe", by: "VSSC (CHACE by SPL)", desc: "A 35 kg probe with a video camera, a radar altimeter and the CHACE mass spectrometer, painted with India's flag. It fell for 25 minutes and struck near Shackleton crater; the impact site was named Jawahar Point (Jawahar Sthal).", kv: [["Mass", "35 kg"], ["Size", "375 × 375 × 470 mm"], ["Released", "14 Nov 2008 · 20:06 IST"], ["Impact", "≈20:31 IST"]] },
  iTMC: { name: "TMC · Terrain Mapping Camera", short: "TMC", by: "SAC", desc: "A three-view camera for a 3D map of the Moon.", kv: [["Resolution", "5 m"], ["Swath", "20 km"]] },
  iHySI: { name: "HySI · Hyperspectral Imager", short: "HySI", by: "SAC", desc: "Mineral mapping in 64 colour bands.", kv: [["Band", "0.4–0.95 µm · 64 bands"]] },
  iLLRI: { name: "LLRI · Lunar Laser Ranging Instrument", short: "LLRI", by: "LEOS", desc: "A laser altimeter for the shape of the Moon.", kv: [["Resolution", "≈5 m vertical"]] },
  iHEX: { name: "HEX · High Energy X-ray spectrometer", short: "HEX", by: "PRL · ISAC", desc: "Looked for radon and other radioactive decays in hard X-rays.", kv: [["Band", "30–270 keV"]] },
  iC1XS: { name: "C1XS · Chandrayaan-1 X-ray Spectrometer", short: "C1XS", by: "RAL (UK) · ESA, with ISAC", desc: "Mapped elements from X-ray fluorescence during solar flares.", kv: [["Band", "1–10 keV"]] },
  iSIR2: { name: "SIR-2 · Near-Infrared Spectrometer", short: "SIR-2", by: "MPS (Germany) · ESA", desc: "Infrared spectra of minerals.", kv: [["Band", "0.93–2.4 µm"]] },
  iSARA: { name: "SARA · Sub-keV Atom Reflecting Analyzer", short: "SARA", by: "IRF (Sweden) · SPL · ESA", desc: "Found that the Moon reflects up to a fifth of the solar wind's protons back as neutral hydrogen.", kv: [["Measures", "energetic neutral atoms"]] },
  iM3: { name: "M³ · Moon Mineralogy Mapper", short: "M³", by: "NASA JPL · Brown University", desc: "The imaging spectrometer that found water and hydroxyl spread thinly across the lunar surface, announced in September 2009 alongside confirming data from Deep Impact and Cassini, announced in September 2009.", kv: [["Band", "0.43–3.0 µm"], ["Result", "water and hydroxyl on the surface"]] },
  iMiniSAR: { name: "Mini-SAR", short: "Mini-SAR", by: "NASA · JHU APL", desc: "An S-band radar that looked into permanently shadowed polar craters and found signs of ice in more than 40 of them near the north pole.", kv: [["Band", "S · 2.38 GHz"]] },
  iRADOM: { name: "RADOM · Radiation Dose Monitor", short: "RADOM", by: "Bulgarian Academy of Sciences", desc: "Measured the radiation along the way and in lunar orbit.", kv: [["Measures", "particle flux and dose"]] },
};

// ----- the engines the spacecraft displays can fire -----
const CRAFT_ENGINES = ({
  LAM440: { name: "440 N liquid apogee motor", code: "440 N", maker: "LPSC", thrustVac: 440, ispVac: 315, vacOnly: true, burn: "up to 1,835 s (C-3 capture)", prop: "MMH / MON3",
    note: "<b>The engine that flew them to the Moon.</b> Every orbit change of all three missions, from the Earth-bound burns to lunar capture, was one of these 440 N motors. At 440 N, Chandrayaan-3's 3,900 kg changes speed by about 0.11 m/s every second. LPSC rates it at 315 s of specific impulse with its 160 : 1 nozzle, for an engine of 4.5 kg." },
  VK800: { name: "800 N throttleable engine", code: "800 N", maker: "LPSC", thrustVac: 800, ispVac: 315, vacOnly: true, burn: "≈19 min powered descent", prop: "MMH / MON3",
    note: "<b>Four engines through the braking, two at the end.</b> On the Moon Vikram weighs 1,729 kg × 1.625 m/s² = 2,810 N at the start of the descent, so four at full thrust give a T/W of 1.14. That is enough to brake, not much more, which is why the descent starts at 30 km and takes nineteen minutes. Isp is taken as 315 s." },
});
const CRAFT_GROUPS = {
  C3PM: { set: "C3PM", eng: "LAM440", code: "440 N", label: "C-3 · PM", sub: "440 N LAM", alt: 1e6, apart: false, show: "dC3", item: "c3LAM", exitR: PMG.lamExit, plume: { len: 4.5, sSL: 3, sVac: 3 }, twMass: 3900, twG: G0, twLabel: "Acceleration at launch mass, g", twMax: 0.02, flown: [["Capture burn", "5 Aug 2023 · 1,835 s"], ["Trans-Earth burn", "13 Oct 2023"]], idle: "Integrated module · 3,900 kg" },
  VKS: { set: "VKS", eng: "VK800", code: "800 N", label: "Vikram", sub: "4 × 800 N", alt: 1e6, apart: false, show: "dVK", item: "vkEngI", exitR: VKG.engExit, plume: { len: 0.4, sSL: 3, sVac: 3 }, /* standing on the Moon, the flame stops on the regolith */ twMass: 1729, twG: G_MOON_SURF, twLabel: "T/W on the Moon · 1,729 kg", twMax: 2, flown: [["Powered descent", "23 Aug 2023 · ≈19 min"], ["Hop", "3 Sep 2023 · ≈40 cm"]], idle: "On the surface · engines safed" },
  C2OR: { set: "C2OR", eng: "LAM440", code: "440 N", label: "C-2 · orbiter", sub: "440 N LAM", alt: 1e6, apart: false, show: "dC2", item: "c2LAM", exitR: PMG.lamExit, plume: { len: 4.5, sSL: 3, sVac: 3 }, twMass: 3850, twG: G0, twLabel: "Acceleration at launch mass, g", twMax: 0.02, flown: [["Capture burn", "20 Aug 2019 · 1,738 s"]], idle: "Orbiter with Vikram · 3,850 kg" },
  C1: { set: "C1", eng: "LAM440", code: "440 N", label: "Chandrayaan-1", sub: "440 N LAM", alt: 1e6, apart: false, show: "dC1", item: "c1LAMI", exitR: PMG.lamExit, plume: { len: 4.0, sSL: 3, sVac: 3 }, twMass: 1380, twG: G0, twLabel: "Acceleration at launch mass, g", twMax: 0.04, flown: [["Capture burn", "8 Nov 2008 · 817 s · 367 m/s"]], idle: "1,380 kg at launch" },
};

// ----- the thirty-two instruments of the three missions -----
// carrier: where it rode; mods: the parts it frames on its display
const INSTRUMENTS = [
  // Chandrayaan-1 (11)
  ["C1", "orbiter", "iTMC", "TMC", "Terrain Mapping Camera", "ISRO · SAC", "3D map of the surface at 5 m", ["dC1.tmc"]],
  ["C1", "orbiter", "iHySI", "HySI", "Hyperspectral Imager", "ISRO · SAC", "Minerals in 64 bands", ["dC1.hysi"]],
  ["C1", "orbiter", "iLLRI", "LLRI", "Lunar Laser Ranging Instrument", "ISRO · LEOS", "The Moon's shape and gravity", ["dC1.llri"]],
  ["C1", "orbiter", "iHEX", "HEX", "High Energy X-ray spectrometer", "ISRO · PRL", "Radioactive decays", ["dC1.hex"]],
  ["C1", "probe", "c1MIP", "MIP", "Moon Impact Probe", "ISRO · VSSC", "Exosphere on the way down; struck near Shackleton", ["dC1.mip"]],
  ["C1", "orbiter", "iC1XS", "C1XS", "Chandrayaan-1 X-ray Spectrometer", "ESA · RAL, UK", "Elements from X-ray fluorescence", ["dC1.c1xs"]],
  ["C1", "orbiter", "iSIR2", "SIR-2", "Near-Infrared Spectrometer", "ESA · MPS, Germany", "Mineral spectra", ["dC1.sir2"]],
  ["C1", "orbiter", "iSARA", "SARA", "Sub-keV Atom Reflecting Analyzer", "ESA · IRF, Sweden · SPL", "The solar wind reflected as hydrogen atoms", ["dC1.sara"]],
  ["C1", "orbiter", "iM3", "M³", "Moon Mineralogy Mapper", "NASA · JPL", "Water and hydroxyl on the surface", ["dC1.m3"]],
  ["C1", "orbiter", "iMiniSAR", "Mini-SAR", "Miniature Synthetic Aperture Radar", "NASA · JHU APL", "Signs of ice in polar craters", ["dC1.minisar"]],
  ["C1", "orbiter", "iRADOM", "RADOM", "Radiation Dose Monitor", "Bulgarian Academy of Sciences", "Radiation on the way and in orbit", ["dC1.radom"]],
  // Chandrayaan-2 (14)
  ["C2", "orbiter", "iTMC2", "TMC-2", "Terrain Mapping Camera 2", "ISRO · SAC", "3D map at 5 m", ["dC2.tmc2"]],
  ["C2", "orbiter", "iOHRC", "OHRC", "Orbiter High Resolution Camera", "ISRO · SAC", "The surface at 25 cm", ["dC2.ohrc"]],
  ["C2", "orbiter", "iIIRS", "IIRS", "Imaging Infrared Spectrometer", "ISRO · SAC", "Minerals, water and hydroxyl, 0.8–5 µm", ["dC2.iirs"]],
  ["C2", "orbiter", "iDFSAR", "DFSAR", "Dual-Frequency SAR", "ISRO · SAC", "Ice in shadowed craters, L and S band", ["dC2.dfsar"]],
  ["C2", "orbiter", "iCLASS", "CLASS", "Large Area Soft X-ray Spectrometer", "ISRO · URSC", "Elemental map of the surface", ["dC2.class"]],
  ["C2", "orbiter", "iXSM", "XSM", "Solar X-ray Monitor", "ISRO · PRL", "The Sun's X-rays", ["dC2.xsm"]],
  ["C2", "orbiter", "iCHACE2", "CHACE-2", "Atmospheric Composition Explorer 2", "ISRO · SPL", "Argon-40 in the exosphere", ["dC2.chace2"]],
  ["C2", "orbiter", "iDFRS", "DFRS", "Dual-Frequency Radio Science", "ISRO · SPL", "Electrons above the surface", ["dC2.dfrs"]],
  ["C2", "lander", "pRAMBHA", "RAMBHA-LP", "Langmuir probe", "ISRO · SPL", "Lost with Vikram", ["dC2.rambha"]],
  ["C2", "lander", "pChaSTE", "ChaSTE", "Surface Thermophysical Experiment", "ISRO · SPL, PRL", "Lost with Vikram", ["dC2.chaste"]],
  ["C2", "lander", "pILSA", "ILSA", "Instrument for Lunar Seismic Activity", "ISRO · LEOS", "Lost with Vikram", ["dC2.ilsa"]],
  ["C2", "lander", "pLRA", "LRA", "Laser Retroreflector Array", "NASA · GSFC", "Lost with Vikram", ["dC2.lra"]],
  ["C2", "rover", "rAPXS2", "APXS", "Alpha Particle X-ray Spectrometer", "ISRO · PRL", "Lost with Vikram", ["dC2.rover"]],
  ["C2", "rover", "rLIBS2", "LIBS", "Laser-Induced Breakdown Spectroscope", "ISRO · LEOS", "Lost with Vikram", ["dC2.rover"]],
  // Chandrayaan-3 (7)
  ["C3", "lander", "pRAMBHA", "RAMBHA-LP", "Langmuir probe", "ISRO · SPL", "Plasma near the surface", ["dVK.rambha"]],
  ["C3", "lander", "pChaSTE", "ChaSTE", "Surface Thermophysical Experiment", "ISRO · SPL, PRL", "≈70 °C on top, −10 °C 8 cm down", ["dVK.chaste"]],
  ["C3", "lander", "pILSA", "ILSA", "Instrument for Lunar Seismic Activity", "ISRO · LEOS", "An event on 26 Aug 2023", ["dVK.ilsa"]],
  ["C3", "lander", "pLRA", "LRA", "Laser Retroreflector Array", "NASA · GSFC", "Ranged by LRO, Dec 2023", ["dVK.lra"]],
  ["C3", "rover", "rAPXS", "APXS", "Alpha Particle X-ray Spectrometer", "ISRO · PRL", "Elements in the soil", ["dVK.rover"]],
  ["C3", "rover", "rLIBS", "LIBS", "Laser-Induced Breakdown Spectroscope", "ISRO · LEOS", "Sulphur confirmed in situ", ["dVK.rover"]],
  ["C3", "propulsion module", "pSHAPE", "SHAPE", "Spectro-polarimetry of HAbitable Planet Earth", "ISRO · URSC", "Earth as an exoplanet", ["dC3.shape"]],
].map(([mis, carrier, info, short, name, by, what, mods]) => ({ mis, carrier, info, short, name, by, what, mods }));
CRAFTINFO.rAPXS = { name: "APXS · Alpha Particle X-ray Spectrometer", short: "APXS", by: "PRL", desc: "Pragyan's arm lowered it to the ground to measure the elements in the soil from the X-rays it gave off when the instrument's curium-244 source bombarded it with alpha particles and X-rays.", kv: [] };
CRAFTINFO.rLIBS = { name: "LIBS · Laser-Induced Breakdown Spectroscope", short: "LIBS", by: "LEOS", desc: "Fired a laser at the soil and read the light of the flash. It made the first in-situ measurement of sulphur near the south pole, with aluminium, calcium, iron, chromium, titanium, manganese, silicon and oxygen.", kv: [] };
CRAFTINFO.rAPXS2 = CRAFTINFO.rAPXS; CRAFTINFO.rLIBS2 = CRAFTINFO.rLIBS;

// ----- parts index sections for the spacecraft -----
const VK_PARTS = (d) => ["body", "solar", "engines", "legs", "sensors", "chaste", "ilsa", "rambha", "lra", "ramp", "rover"].map((s) => `${d}.${s}`);
const C3_MENU = [
  ["c3whole", "Chandrayaan-3 · integrated module", { show: "dC3", root: true, info: ["dC3"] }],
  ["c3PM", "Propulsion module", { show: "dC3", mods: ["dC3.pmBody", "dC3.pmPanel", "dC3.pmEng", "dC3.pmRCS", "dC3.shape", "dC3.ima"], info: ["dC3.pmBody", "dC3.pmPanel"] }],
  ["c3LAM", "440 N engine · fire", { show: "dC3", mods: ["dC3.pmEng"], group: "C3PM", info: ["dC3.pmEng"] }],
  ["c3RCS", "Attitude thrusters · 8 × 22 N", { show: "dC3", mods: ["dC3.pmRCS"], info: ["dC3.pmRCS"] }],
  ["c3SHAPE", "SHAPE", { show: "dC3", mods: ["dC3.shape"] }],
  ["c3IMA", "Inter-module adapter", { show: "dC3", mods: ["dC3.ima"] }],
  ["c3VK", "Vikram, stowed for the trip", { show: "dC3", mods: VK_PARTS("dC3"), info: ["dC3.body"] }],
];
const VK_MENU = [
  ["vkWhole", "At Shiv Shakti Point", { show: "dVK", root: true, info: ["dVK"] }],
  ["vkEngI", "Four 800 N engines · fire", { show: "dVK", mods: ["dVK.engines"], group: "VKS", info: ["dVK.engines"] }],
  ["vkBodyI", "Lander body", { show: "dVK", mods: ["dVK.body"] }],
  ["vkSolarI", "Solar panels", { show: "dVK", mods: ["dVK.solar"] }],
  ["vkLegsI", "Landing legs", { show: "dVK", mods: ["dVK.legs"] }],
  ["vkSensI", "Landing sensors", { show: "dVK", mods: ["dVK.sensors"] }],
  ["vkRampI", "Rover ramp", { show: "dVK", mods: ["dVK.ramp"] }],
  ["vkRover", "Pragyan", { show: "dVK", mods: ["dVK.rover"], info: ["dVK.rover", "rLIBS", "rAPXS"] }],
  ["vkChaSTE", "ChaSTE", { show: "dVK", mods: ["dVK.chaste"] }],
  ["vkILSA", "ILSA", { show: "dVK", mods: ["dVK.ilsa"] }],
  ["vkRAMBHA", "RAMBHA-LP", { show: "dVK", mods: ["dVK.rambha"] }],
  ["vkLRA", "Laser retroreflector", { show: "dVK", mods: ["dVK.lra"] }],
];
const C2_MENU = [
  ["c2whole", "Orbiter with Vikram", { show: "dC2", root: true, info: ["dC2"] }],
  ["c2Orb", "Orbiter", { show: "dC2", mods: ["dC2.o2Body", "dC2.o2Panel", "dC2.o2Hga", "dC2.o2Eng"], info: ["dC2.o2Body", "dC2.o2Panel", "dC2.o2Hga"] }],
  ["c2LAM", "440 N engine · fire", { show: "dC2", mods: ["dC2.o2Eng"], group: "C2OR", info: ["dC2.o2Eng"] }],
  ...[["ohrc", "OHRC"], ["tmc2", "TMC-2"], ["iirs", "IIRS"], ["dfsar", "DFSAR"], ["class", "CLASS"], ["xsm", "XSM"], ["chace2", "CHACE-2"], ["dfrs", "DFRS"]].map(([s, l]) => ["c2" + s, l, { show: "dC2", mods: ["dC2." + s] }]),
  ["c2VK", "Vikram · five engines", { show: "dC2", mods: VK_PARTS("dC2"), info: ["dC2.body", "dC2.engines"] }],
];
const C1_MENU = [
  ["c1whole", "Chandrayaan-1", { show: "dC1", root: true, info: ["dC1"] }],
  ["c1Bus", "Bus, panel and antenna", { show: "dC1", mods: ["dC1.c1Body", "dC1.c1Panel", "dC1.c1Hga"], info: ["dC1.c1Body", "dC1.c1Panel", "dC1.c1Hga"] }],
  ["c1LAMI", "440 N engine · fire", { show: "dC1", mods: ["dC1.c1Eng"], group: "C1", info: ["dC1.c1Eng"] }],
  ["c1MIPI", "Moon Impact Probe", { show: "dC1", mods: ["dC1.mip"], apart: true }],
  ...[["tmc", "TMC"], ["hysi", "HySI"], ["llri", "LLRI"], ["hex", "HEX"], ["m3", "M³ · NASA"], ["minisar", "Mini-SAR · NASA"], ["c1xs", "C1XS · ESA"], ["sir2", "SIR-2 · ESA"], ["sara", "SARA · ESA"], ["radom", "RADOM · Bulgaria"]].map(([s, l]) => ["c1" + s, l, { show: "dC1", mods: ["dC1." + s] }]),
];
