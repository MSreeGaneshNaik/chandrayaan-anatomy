// ============================================================================
// 12 · LAUNCH VEHICLE TRUTH — LVM3 (GSLV Mk III), which flew Chandrayaan-2 as
// GSLV Mk III-M1 and Chandrayaan-3 as LVM3-M4, and PSLV-XL, which flew
// Chandrayaan-1 as PSLV-C11. All three lifted off from the Second Launch Pad at
// Sriharikota. Rated figures per engine/motor, in newtons; sources in SOURCES.
// ============================================================================
// LVM3 geometry (m), y up from the S200 aft skirts on the deck of the mobile launch pedestal.
// Height 43.5 m is measured from the L110 aft end to the fairing tip [ISRO M4 brochure].
const LV = {
  coreR: 2.0,                                                   // 4.0 m core [ISRO]
  s200X: 4.0, s200R: 1.6, s200Len: 23.0, s200Nose: 4.4,         // 3.2 m; 26.22 m stage incl. nozzle [ISRO M4]
  s200Noz: 3.47, s200Exit: 1.635, s200NozIn: 0.25,              // flex nozzle 3.474 m long, exit 3.27 m [Spaceflight101]
  s200Joints: [8.6, 16.7],                                      // segments: nozzle end 8.3 m, middle 8.1 m, head 3.0 m [ISRO]
  l110Base: 1.6, l110Len: 21.4, vikasX: 0.98, vikasLen: 2.9, vikasExit: 0.53,   // 21.4 m [ISRO M4]
  c25Len: 13.5, c25Inter: 2.9, ce20Len: 2.3, ce20Exit: 0.72,    // 13.5 m [ISRO M4]; exit ≈ 1.45 m derived from ε = 100
  plfR: 2.5, plfLen: 10.75, plfCyl: 5.4, plfBoat: 1.0, plfOverlap: 2.15,   // 5 m ogive, 10.75 m
  strutY: [3.2, 19.2],
  towerZ: -13.0, towerH: 70,                                    // umbilical tower ≈ 70 m (low confidence)
  arms: [[11.0, "l110", "L110 propellant fill and drain"], [27.5, "c25", "C25 liquid oxygen"], [32.0, "c25", "C25 liquid hydrogen"], [40.5, "plf", "spacecraft air conditioning"]],
};
// PSLV-XL geometry (m), y up from the PS1 aft end. 44.4 m tall [ISRO C11].
const PV = {
  ps1R: 1.4, ps1Len: 20.2, ps1Noz: 2.3, ps1Exit: 0.95,
  psomX: 2.05, psomR: 0.5, psomLen: 12.4, psomNose: 1.35, psomNoz: 1.0, psomExit: 0.36, psomY: 0.6,
  ps2Len: 11.9, vikasLen: 2.7, vikasExit: 0.53,
  ps3R: 1.0, ps3Len: 3.6, ps3Noz: 1.3, ps3Exit: 0.5,
  ps4R: 0.67, ps4Len: 2.9, ps4X: 0.32, ps4Exit: 0.14,
  hsR: 1.6, hsLen: 8.3, hsCyl: 4.3, hsBoat: 0.9,
};
const STACKINFO = {
  lvm3: { name: "LVM3 · GSLV Mk III", by: "ISRO · VSSC · LPSC · Thiruvananthapuram and Valiamala", desc: "ISRO's heaviest rocket: two S200 solid boosters, the L110 core with two Vikas engines, and the C25 stage with the CE-20 cryogenic engine. Only the S200s fire at liftoff; the L110 lights in the air at about T+108 s, before they burn out. It flew Chandrayaan-2 as GSLV Mk III-M1 and Chandrayaan-3 as LVM3-M4.", kv: [["Height", "43.43 m (M1) · 43.5 m (M4)"], ["Liftoff mass", "640 t (M1) · 642 t (M4)"], ["Core diameter", "4.0 m"], ["Fairing", "5.0 m ogive · 10.75 m"], ["Payload to orbit", "3,850 kg (C-2; 3,840 kg in ISRO's launch release) · 3,895 kg (C-3)"], ["Pad", "Second Launch Pad, SDSC SHAR"]] },
  pad: { name: "Mobile launch pedestal · Second Launch Pad", short: "Launch pedestal", desc: "LVM3 is stacked on a mobile launch pedestal inside the Vehicle Assembly Building and rolled about a kilometre along rails to the Second Launch Pad, standing upright. The S200s stand on its deck with the core between them; their exhaust goes down into the pad's flame ducts.", kv: [["Pedestal", "≈19.5 × 19.5 m · ≈700 t (secondary sources)"], ["Concept", "integrate, transfer, launch"], ["Pad in use since", "5 May 2005 (PSLV-C6)"], ["Launches here", "C-1 · C-2 · C-3"]] },
  tower: { name: "Umbilical tower", short: "Umbilical tower", desc: "A fixed steel tower beside the pedestal whose swing arms carry propellant, cryogens, power and data to the stages and the spacecraft. The arms swing back before liftoff.", kv: [["Height", "≈70 m (secondary source)"], ["Feeds", "L110 propellants · C25 LOX and LH₂ · spacecraft air"]] },
  s200: { short: "S200", by: "VSSC", desc: "The largest solid motor ISRO makes: three segments of HTPB propellant in an M250 steel case, a 13-lobed star grain in the head end, steered by a flex nozzle on two electro-hydraulic actuators. Both light at T+0 and carry the whole vehicle off the pad.", kv: [["Stage length", "26.22 m"], ["Diameter", "3.2 m"], ["Propellant", "204.5 t HTPB each"], ["Burn", "≈130 s (ISRO: about 134 s) · separated T+127.0 s (M4)"], ["Thrust, average", "3,578 kN sea level"], ["Thrust, peak", "5,151 kN"], ["Isp", "227 s SL · 274.5 s vac"], ["Nozzle exit", "3.27 m · throat 0.886 m"]] },
  l110: { name: "L110 core stage", short: "L110", by: "LPSC", desc: "The liquid core: 115.8 t of UH25 and nitrogen tetroxide in two tanks, feeding two Vikas engines that each gimbal on their own. It sits idle at liftoff and lights high up, at T+108 s, while the S200s are still burning.", kv: [["Length", "21.4 m"], ["Diameter", "4.0 m"], ["Propellant", "115.8 t UH25 / N₂O₄"], ["Stage mass", "125 t"], ["Ignition", "T+108.1 s (M4) · 44.7 km"], ["Burn", "≈195 s (M1: 194.9 s to shut-off)"]] },
  vikas: { name: "Vikas × 2", short: "Vikas", by: "LPSC", desc: "A gas-generator engine, radiation and film cooled (LPSC; Viking heritage), developed from the Viking. The L110 carries two; PSLV's second stage carries one.", kv: [["Thrust", "≈766 kN vac · 677 kN SL each (Spaceflight101; LPSC now quotes 1,692 kN for the pair)"], ["Isp", "293 s vac"], ["Chamber", "58.5 bar (Spaceflight101)"], ["Mixture", "O/F 1.7"], ["Expansion", "ε 13.99"]] },
  c25: { name: "C25 cryogenic stage", short: "C25", by: "LPSC", desc: "Liquid hydrogen and liquid oxygen in insulated tanks, with the CE-20 engine in the interstage below. Its single burn of about 646 s takes the spacecraft from 177 km to an orbit reaching tens of thousands of kilometres out.", kv: [["Length", "13.5 m"], ["Diameter", "4.0 m"], ["Propellant", "28.6 t LOX / LH₂"], ["Dry mass", "4,310 kg"], ["Ignition", "T+307.96 s (M4)"], ["Burn", "646.5 s (M4)"]] },
  ce20: { name: "CE-20", short: "CE-20", by: "LPSC", desc: "India's own gas-generator cryogenic engine. It gimbals ±4° in two planes to steer the stage in pitch and yaw.", kv: [["Thrust", "≈186 kN vac (19 t) · 200 kN nominal"], ["Isp", "442 s vac"], ["Chamber", "60 bar"], ["Mixture", "O/F 5.05"], ["Expansion", "ε 100"], ["Engine mass", "588 kg"]] },
  plf: { name: "Payload fairing", short: "Fairing", desc: "A 5 m ogive fairing, wider than the 4 m core, over the spacecraft and its adapter. It splits in two and falls away at about T+195 s, 115 km up.", kv: [["Diameter", "5.0 m"], ["Length", "10.75 m"], ["Separation", "T+194.96 s (M4) · 114.8 km"]] },
  sc: { name: "Chandrayaan-3 integrated module, stowed", short: "Chandrayaan-3 (stowed)", desc: "Vikram on its propulsion module, rover folded inside, under the fairing on the payload adapter.", kv: [["Mass", "3,900 kg"], ["Separation", "T+969.4 s · 179 km"]] },
  pslv: { name: "PSLV-XL · PSLV-C11", by: "ISRO · VSSC · LPSC", desc: "The XL version of the Polar Satellite Launch Vehicle, with six longer PSOM-XL boosters, flown for the first time to launch Chandrayaan-1. Four boosters light on the ground with the core; the other two light 25 s later in the air.", kv: [["Height", "44.4 m (ISRO; the C11 brochure gives 44.5 m)"], ["Liftoff mass", "320 t"], ["Core diameter", "2.8 m"], ["Launch", "22 Oct 2008 · 06:22 IST"], ["Pad", "Second Launch Pad"], ["Orbit", "255 × 22,860 km · 17.9°"]] },
  ps1: { name: "PS1 · S139 core", short: "PS1", by: "VSSC", desc: "The core solid motor, steered by secondary injection: strontium perchlorate sprayed into the nozzle from the two tanks on its sides.", kv: [["Length", "20.2 m"], ["Diameter", "2.8 m"], ["Propellant", "138 t HTPB"], ["Thrust, max", "4,910 kN"], ["Burn", "98 s"], ["Isp", "237 s SL · 269 s vac"]] },
  psom: { name: "PSOM-XL boosters × 6", short: "PSOM-XL", by: "VSSC", desc: "Six strap-on motors, each 1 m across. On C11, four lit at T+0.4 s, just after the core, and two in the air at T+25 s.", kv: [["Length", "12.4 m"], ["Diameter", "1.0 m"], ["Propellant", "12 t HTPB each"], ["Thrust, max", "720 kN each"], ["Burn", "49 s"], ["Isp", "262 s"]] },
  ps2: { name: "PS2 · Vikas", short: "PS2", by: "LPSC", desc: "The liquid second stage, one gimballed Vikas engine burning UH25 and nitrogen tetroxide.", kv: [["Length", "11.9 m"], ["Diameter", "2.8 m"], ["Propellant", "41.5 t"], ["Thrust, max", "800 kN"], ["Burn", "147 s"], ["Isp", "293 s"]] },
  ps3: { name: "PS3 · HPS3", short: "PS3", by: "VSSC", desc: "A solid third stage in a Kevlar composite case, steered by a flex nozzle. On C11 it coasted after burnout until separation at T+512.9 s.", kv: [["Length", "3.6 m"], ["Diameter", "2.0 m"], ["Propellant", "7.6 t HTPB"], ["Thrust, max", "246 kN"], ["Burn", "107.6 s"], ["Isp", "295 s"]] },
  ps4: { name: "PS4 · twin engines", short: "PS4", by: "LPSC", desc: "Two small pressure-fed engines burning MMH and MON-3, with the equipment bay that guides the whole rocket on top.", kv: [["Length", "2.9 m"], ["Diameter", "2.8 m"], ["Propellant", "2.5 t MMH / MON-3"], ["Thrust", "2 × 7.31 kN"], ["Burn", "525 s rated · ≈516 s on C11"], ["Isp", "308 s"]] },
  hs: { name: "Heat shield", short: "Heat shield", desc: "The 3.2 m fairing over Chandrayaan-1 and the fourth stage, dropped at T+193.6 s, 116 km up.", kv: [["Diameter", "3.2 m"], ["Length", "8.3 m (secondary source)"], ["Separation", "T+193.6 s"]] },
  pslvSc: { name: "Chandrayaan-1, stowed", short: "Chandrayaan-1 (stowed)", desc: "The 1,380 kg spacecraft on its adapter, solar panel folded against its side.", kv: [["Separation", "T+1,096.5 s · 508 km"]] },
};
// rated engine data (per engine / per motor), newtons. thrustSL + thrustVac give the exit area;
// vacOnly engines run at their vacuum design point; fixed ones are quoted as a single rated maximum.
const ENGINES = {
  S200: { name: "S200 solid booster", code: "S200", solid: true, maker: "VSSC", thrustSL: 3578.2e3, ispSL: 227, ispVac: 274.5, burn: "≈130 s", eps: "≈13.6 : 1 (12.1 also listed)", prop: "HTPB solid", vacDerived: true,
    note: "<b>A solid motor: once lit it burns to the end.</b> Average sea-level thrust is rated at 3,578 kN; it peaks near 5,151 kN. The vacuum figure is derived from the 3.27 m exit; the published Isp pair would give about 4,330 kN instead, so the published figures do not quite agree. Steering comes from the flex nozzle, swung by two actuators." },
  VIKAS: { name: "Vikas", code: "Vikas", maker: "LPSC", thrustVac: 766e3, thrustSL: 677e3, ispVac: 293, burn: "≈195 s (L110)", mr: "1.7 : 1", eps: "13.99 : 1", prop: "UH25 / N₂O₄",
    note: "<b>Air-lit.</b> The L110's two Vikas engines sit idle on the pad and light at T+108 s, 44.7 km up, while the S200s still burn; fired here, the core climbs away from the spent boosters. 766 kN in vacuum against 677 kN at sea level fixes the exit area." },
  CE20: { name: "CE-20", code: "CE-20", maker: "LPSC", thrustVac: 186.36e3, ispVac: 442, vacOnly: true, burn: "646.5 s (M4)", mr: "5.05 : 1", pc: "60 bar", prop: "LH₂ / LOX",
    note: "<b>India's cryogenic engine.</b> Liquid hydrogen and oxygen, gas-generator cycle, flown at 19 t, about 186 kN in vacuum, on Chandrayaan-2 and Chandrayaan-3 (200 kN nominal; later uprated to 22 t). It burned for 646.5 s on LVM3-M4." },
  S139: { name: "S139 (PS1)", code: "S139", solid: true, fixed: true, maker: "VSSC", thrustSL: 4910e3, ispSL: 237, ispVac: 269, burn: "98 s", prop: "HTPB solid",
    note: "<b>The core solid.</b> ISRO rates its maximum thrust at 4,910 kN; that figure is used here at every altitude. It lit at T+0; four of the six boosters followed at T+0.4 s." },
  PSOMXL: { name: "PSOM-XL", code: "PSOM-XL", solid: true, fixed: true, maker: "VSSC", thrustSL: 720e3, ispSL: 262, ispVac: 262, burn: "49 s", prop: "HTPB solid",
    note: "<b>Six boosters, two light late.</b> On C11 four lit at T+0.4 s and two at T+25 s; cut any of them in the layout to see the share each one carries. 720 kN is each motor's rated maximum." },
  VIKAS2: { name: "Vikas (PS2)", code: "Vikas", maker: "LPSC", thrustVac: 800e3, ispVac: 293, vacOnly: true, burn: "147 s", prop: "UH25 / N₂O₄",
    note: "<b>PSLV's second stage.</b> One Vikas, gimballed for pitch and yaw, lit at T+108.8 s after PS1 separation." },
  HPS3: { name: "HPS3 (PS3)", code: "HPS3", solid: true, maker: "VSSC", thrustVac: 246e3, ispVac: 295, vacOnly: true, burn: "107.6 s", prop: "HTPB solid",
    note: "<b>A solid in near-vacuum.</b> 246 kN maximum, steered by a flex nozzle." },
  PS4: { name: "PS4 engine", code: "PS4", maker: "LPSC", thrustVac: 7.31e3, ispVac: 308, vacOnly: true, burn: "525 s rated", prop: "MMH / MON-3",
    note: "<b>Two small engines, a long burn.</b> Rated for 525 s; on C11 they fired for about 516 s to finish the climb to the 255 × 22,860 km orbit." },
};
Object.assign(ENGINES, CRAFT_ENGINES);
ENGINES.S200.thrustVac = ENGINES.S200.thrustSL + 101325 * Math.PI * Math.pow(LV.s200Exit, 2);
const LIFTOFF_KG = 642000;    // LVM3-M4 [ISRO]
const STACK_GROUPS = {
  S200: { set: "S200", eng: "S200", code: "S200", label: "Boosters", sub: "2 × S200", unit: "motor", unitPl: "motors", alt: 0, apart: false, item: "lS200", exitR: LV.s200Exit, plume: { len: 48, padLen: 4.2, sSL: 1.6, sVac: 6.0 }, twLabel: "T/W vs 642 t at liftoff", twMax: 2.0, twMass: LIFTOFF_KG, flown: [["Burn (M4)", "T+0 → separation T+127.0 s"]], idle: "Hold-down · both boosters safed" },
  L110: { set: "L110", eng: "VIKAS", code: "Vikas", label: "Core", sub: "L110 · 2 × Vikas", alt: 0, apart: true, item: "lL110", exitR: LV.vikasExit, plume: { len: 30, sSL: 1.4, sVac: 5.0 }, flown: [["Burn (M4)", "T+108.1 s → separation T+305.6 s"]] },
  C25: { set: "C25", eng: "CE20", code: "CE-20", label: "Upper", sub: "C25 · CE-20", alt: 1e6, apart: true, item: "lC25", exitR: LV.ce20Exit, plume: { len: 20, sSL: 3.2, sVac: 3.2 }, flown: [["Burn (M4)", "T+307.96 → T+954.42 s"]] },
};
const STACK_MENU = [
  ["stack", "LVM3 on the Second Launch Pad", { root: true, frame: ["tower", "s200L", "s200R", "l110", "l110Eng", "c25", "c25Eng", "plfA", "plfB", "sc"], info: ["stackInfo"] }],
  ["lS200", "S200 boosters", { mods: ["s200L", "s200R"], group: "S200", info: ["s200R"], below: 4, belowFiring: 6 }],
  ["lL110", "L110 core · 2 × Vikas", { mods: ["l110", "l110Eng"], group: "L110", apart: true, info: ["l110", "l110Eng"], belowFiring: 14 }],
  ["lC25", "C25 cryogenic stage · CE-20", { mods: ["c25", "c25Eng"], group: "C25", apart: true, info: ["c25", "c25Eng"], belowFiring: 10 }],
  ["lPLF", "Payload fairing", { mods: ["plfA", "plfB"], info: ["plfA"] }],
  ["lSC", "Chandrayaan-3, stowed", { mods: ["sc"], apart: true }],
  ["lPad", "Launch pedestal and umbilical tower", { mods: ["pad", "tower"], info: ["pad", "tower"] }],
];
const PSLV_GROUPS = {
  PSOM: { set: "PSOM", eng: "PSOMXL", code: "PSOM-XL", label: "Boosters", sub: "6 × PSOM-XL", unit: "motor", unitPl: "motors", alt: 0, apart: false, show: "dPSLV", item: "pPSOM", exitR: PV.psomExit, plume: { len: 26, padLen: 5.6, sSL: 1.6, sVac: 5 }, flown: [["Ignition (C11)", "4 at T+0.4 s · 2 at T+25.0 s"]] },
  PS1: { set: "PS1", eng: "S139", code: "S139", label: "Stage 1", sub: "PS1 · S139", unit: "motor", alt: 0, apart: false, show: "dPSLV", item: "pPS1", exitR: PV.ps1Exit, plume: { len: 40, padLen: 3.8, sSL: 1.6, sVac: 5 }, flown: [["Burn (C11)", "T+0 → separation T+108.6 s"]] },
  PS2: { set: "PS2", eng: "VIKAS2", code: "Vikas", label: "Stage 2", sub: "PS2 · Vikas", alt: 1e6, apart: true, show: "dPSLV", item: "pPS2", exitR: PV.vikasExit, plume: { len: 13, sSL: 3, sVac: 3 }, flown: [["Burn (C11)", "T+108.8 s → separation T+260.0 s"]] },
  PS3: { set: "PS3", eng: "HPS3", code: "HPS3", label: "Stage 3", sub: "PS3 · HPS3", unit: "motor", alt: 1e6, apart: true, show: "dPSLV", item: "pPS3", exitR: PV.ps3Exit, plume: { len: 8, sSL: 3, sVac: 3 }, flown: [["Burn (C11)", "T+261.2 s · 107.6 s"]] },
  PS4: { set: "PS4", eng: "PS4", code: "PS4", label: "Stage 4", sub: "PS4 · 2 engines", alt: 1e6, apart: true, show: "dPSLV", item: "pPS4", exitR: PV.ps4Exit, plume: { len: 7, sSL: 3, sVac: 3 }, flown: [["Burn (C11)", "T+533.6 → T+1,049.5 s"]] },
};
const PSLV_MENU = [
  ["pslv", "PSLV-XL · PSLV-C11", { show: "dPSLV", root: true, info: ["dPSLV"] }],
  ["pPSOM", "PSOM-XL boosters", { show: "dPSLV", mods: [1, 2, 3, 4, 5, 6].map((i) => "dPSLV.psom" + i), group: "PSOM", info: ["dPSLV.psoms"] }],
  ["pPS1", "PS1 · S139 core", { show: "dPSLV", mods: ["dPSLV.ps1"], group: "PS1", info: ["dPSLV.ps1"] }],
  ["pPS2", "PS2 · Vikas", { show: "dPSLV", mods: ["dPSLV.ps2"], group: "PS2", info: ["dPSLV.ps2"] }],
  ["pPS3", "PS3 · HPS3", { show: "dPSLV", mods: ["dPSLV.ps3"], group: "PS3", info: ["dPSLV.ps3"] }],
  ["pPS4", "PS4 · twin engines", { show: "dPSLV", mods: ["dPSLV.ps4"], group: "PS4", info: ["dPSLV.ps4"] }],
  ["pHS", "Heat shield", { show: "dPSLV", mods: ["dPSLV.hsA", "dPSLV.hsB"], info: ["dPSLV.hsA"] }],
  ["pSC", "Chandrayaan-1, stowed", { show: "dPSLV", mods: ["dPSLV.sc1"], info: ["dPSLV.sc1"], apart: true }],
];
