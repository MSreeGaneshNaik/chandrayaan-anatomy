// ============================================================================
// 46 · ALL ENGINES — every engine type the three missions flew, side by side,
// to one scale, nozzle exits on one line (y = 0). Solids show the aft end of
// their case above the nozzle; liquids carry their turbopump and gimbal.
// Ignite all, or fire and cut each one from the colour-coded row.
// ============================================================================
const LINEUP = [
  { k: "s200", eng: "S200", name: "S200", fx: "SOLID", exitR: LV.s200Exit, len: LV.s200Noz, caseR: LV.s200R, caseH: 1.9, plume: { len: 26, sSL: 1.6, sVac: 6 }, where: "LVM3 boosters" },
  { k: "s139", eng: "S139", name: "S139", fx: "SOLID", exitR: PV.ps1Exit, len: PV.ps1Noz, caseR: PV.ps1R, caseH: 1.6, plume: { len: 22, sSL: 1.6, sVac: 5 }, where: "PSLV first stage" },
  { k: "vikas", eng: "VIKAS", name: "Vikas", fx: "VIKAS", exitR: LV.vikasExit, len: LV.vikasLen, pumps: true, gimbal: true, plume: { len: 16, sSL: 1.4, sVac: 5 }, where: "LVM3 L110 · PSLV PS2 (800 kN version)" },
  { k: "ce20", eng: "CE20", name: "CE-20", fx: "H2", exitR: LV.ce20Exit, len: LV.ce20Len, pumps: true, gimbal: true, plume: { len: 11, sSL: 3.2, sVac: 3.2 }, where: "LVM3 C25 upper stage" },
  { k: "psom", eng: "PSOMXL", name: "PSOM-XL", fx: "SOLID", exitR: PV.psomExit, len: PV.psomNoz, caseR: PV.psomR, caseH: 1.1, plume: { len: 11, sSL: 1.6, sVac: 5 }, where: "PSLV-XL boosters" },
  { k: "hps3", eng: "HPS3", name: "HPS3", fx: "SOLID", exitR: PV.ps3Exit, len: PV.ps3Noz, caseR: PV.ps3R, caseH: 0.9, plume: { len: 7, sSL: 3, sVac: 3 }, where: "PSLV third stage" },
  { k: "ps4", eng: "PS4", name: "PS4", fx: "HYP", exitR: PV.ps4Exit, len: 0.72, plume: { len: 2.6, sSL: 3, sVac: 3 }, where: "PSLV fourth stage" },
  { k: "lam", eng: "LAM440", name: "440 N", fx: "HYP", exitR: PMG.lamExit, len: PMG.lamLen, plume: { len: 2.0, sSL: 3, sVac: 3 }, where: "C-1 · C-2 orbiter · C-3 PM" },
  { k: "vk", eng: "VK800", name: "800 N", fx: "HYP", exitR: VKG.engExit, len: VKG.engLen, plume: { len: 1.5, sSL: 3, sVac: 3 }, where: "Vikram" },
];
const LINE_DET = { s200: "s200", vikas: "vikas", ce20: "ce20", lam: "lam", vk: "vk" };   // drawn with the detailed builders
const LINE_KIND = { s200: "flex", s139: "sitvc", vikas: "vikas", ce20: "ce20", psom: "fixed", hps3: "flex", ps4: "ps4", lam: "lam", vk: "vk800" };
const FX_SWATCH = { SOLID: "#f39a44", VIKAS: "#e8774a", H2: "#7f93ea", HYP: "#ee7376" };
function buildLineup() {
  const item = "dENG";
  MODULES.dENG = {
    name: "All engines · side by side", by: "VSSC · LPSC",
    desc: "Every engine type that flew the three missions, to one scale and lined up on their nozzle exits: the S200's 3.27 m nozzle down to Vikram's 800 N throttleable engines. Fire them together or one at a time. Plume colour follows the propellant: the solids burn white-hot and smoky, Vikas's UH25 and nitrogen tetroxide amber-rose, the CE-20's hydrogen nearly clear and blue, and the small MMH / MON3 engines a translucent rose.",
    kv: LINEUP.map((L) => [`${L.name} · ${L.where}`, ENGINES[L.eng].thrustVac ? `${fmtN(ENGINES[L.eng].thrustVac)} vac` : `${fmtN(ENGINES[L.eng].thrustSL)} rated`]),
  };
  showItem(item, MODULES.dENG, { az: CAM_AZ, el: 10 * DEG });
  const set = [];
  let cursor = 0;
  for (const L of LINEUP) {
    const E = ENGINES[L.eng], D = LINE_DET[L.k] && DET[LINE_DET[L.k]], half = D ? D.D.half : Math.max(L.exitR, L.caseR || 0, L.pumps ? L.exitR * 1.6 : 0);
    const x = cursor + half; cursor += half * 2.45 + 0.9;   // clear air between neighbours, more round the big ones
    const exitNote = { s200: "", vikas: " (derived)", ce20: " (derived)" }[L.k] ?? " (as drawn)";
    const kv = [["Flies on", L.where], ["Thrust", E.thrustVac ? `${fmtN(E.thrustVac)} vac${E.vacDerived ? " (derived)" : ""}` + (E.thrustSL && !E.fixed ? ` · ${fmtN(E.thrustSL)} SL` : "") + (L.k === "vikas" ? " (L110)" : "") : `${fmtN(E.thrustSL)} rated`], ["Isp", E.ispSL === E.ispVac ? `${E.ispVac} s` : `${E.ispSL && !E.vacOnly ? E.ispSL + " s SL · " : ""}${E.ispVac} s vac`], ["Nozzle exit", `${exitNote === " (as drawn)" ? "≈" : ""}${fmt(L.exitR * 2, 2)} m${exitNote}`], ["Propellants", E.prop]];
    const key = asm(item, L.k, E.name, E.note ? E.note.replace(/<[^>]+>/g, "") : "", [0, 0, 0], kv);
    MODULES[key].short = L.name; MODULES[key].by = E.maker;
    if (D) {   // the same engine as its own display, every assembly and pipe of it
      within(key, (g) => {
        const e = detEngine(g, LINE_DET[L.k], { at: V3(x, 0, 0), plume: L.plume.len, ...D.fxo });
        set.push({ group: e.group, fx: e.fx, name: L.name, eng: L.eng, plume: L.plume, r: L.exitR, x, swatch: FX_SWATCH[L.fx] });
      });
      continue;
    }
    within(key, (g) => {
      const B = bulk(), solid = !!E.solid;
      if (solid) {   // the aft end of the motor case: dome, skirt and a joint band, the nozzle sunk into it
        const y0 = L.len * 0.82, r = L.caseR, h = L.caseH;
        add(g, turn([[0, y0 - 0.02], [r * 0.55, y0], [r * 0.92, y0 + r * 0.28], [r, y0 + r * 0.5], [r, y0 + h, 1], [0, y0 + h]], { seg: 72 }).translate(x, 0, 0), "white", { inkA: 0.8 });
        B.add(turn([[r * 1.004, y0 + h * 0.62], [r * 1.03, y0 + h * 0.64], [r * 1.03, y0 + h * 0.72], [r * 1.004, y0 + h * 0.74]], { seg: 72 }).translate(x, 0, 0), "grey");
        add(g, new THREE.RingGeometry(r * 0.34, r * 0.98, 72, 1).rotateX(-Math.PI / 2).translate(x, y0 + h + 0.002, 0), "light", { map: T.hatch });   // cut through the case: propellant hatched
        add(g, turn([[r * 0.34, y0 + h], [r * 0.34, y0 + h - r * 0.3], [0, y0 + h - r * 0.3]], { seg: 48 }).translate(x, 0, 0), "dark");      // the port
        // the two actuators that swing a flex nozzle (the S139 steers by injection instead)
        if (L.k !== "s139") for (const s of [-1, 1]) strut(B, V3(x + s * L.exitR * 0.55, L.len * 0.55, 0), V3(x + s * r * 0.7, y0 + r * 0.3, 0), Math.max(0.02, r * 0.035), "light");
      } else {        // a thrust-frame plate above the gimbal
        B.add(new THREE.CylinderGeometry(L.exitR * 0.7, L.exitR * 0.7, Math.max(0.02, L.len * 0.03), 32).translate(x, L.len * 1.08, 0), "grey");
      }
      B.flush(g);
      const e = engine(g, LINE_KIND[L.k], { at: V3(x, 0, 0), len: L.len, exitR: L.exitR, throatR: L.exitR * (solid ? 0.32 : 0.26), chamberR: L.exitR * (solid ? 0.7 : 0.48), fx: L.fx, plume: L.plume.len, rmaxK: solid ? 5 : 4, dens: solid ? 1.6 : 1.3, diam: solid ? 0.1 : 0.3, flow: 30, hot: 5, gimbal: L.gimbal, role: "metal", hoops: solid ? [0.4] : [0.3, 0.55], mountY: L.len * 0.86, mountR: (L.caseR || 0) * 0.62 });
      set.push({ group: e.group, fx: e.fx, name: L.name, eng: L.eng, plume: L.plume, r: L.exitR, x, swatch: FX_SWATCH[L.fx] });
    });
  }
  // centre the row on the display's origin
  const shift = -cursor / 2;
  for (const A of SHOW[item].asm) A.group.children.forEach((c) => (c.position.x += shift));
  for (const e of set) e.x += shift;
  ENGINE_SETS.xALL = set;
  C.off.xALL = set.map(() => 0); C.lstart = set.map(() => 0);
  SHOW[item].plumeRoom = 30;
  SHOW[item].group.rotation.y = CAM_AZ;   // the row square to the default view, so all of its width is used
  return set;
}
const LINEUP_GROUP = { set: "xALL", eng: "VIKAS", lineup: true, code: "All engines", label: "All engines", sub: "9 types", alt: 0, apart: false, show: "dENG", item: "engAll", exitR: 1, plume: LINEUP[0].plume, idle: "Nine engine types · one scale · exits on one line",
  note: "<b>Every engine, one scale.</b> Each one is worked out on its own from its rated figures at the ambient pressure you set: the solids at their rated thrust, the vacuum engines (CE-20, PS4, 440 N, 800 N) at their vacuum rating, Vikas from its sea-level and vacuum pair. The throttle scales the liquids only." };
const LINEUP_MENU = () => [
  ["engAll", "All engines · side by side", { show: "dENG", root: true, info: ["dENG"], group: "xALL", below: 4, belowFiring: 11 }],
  ...LINEUP.map((L) => ["eng-" + L.k, `${L.name} · ${L.where}`, { show: "dENG", mods: ["dENG." + L.k], info: ["dENG." + L.k], group: "xALL", belowFiring: L.plume.len * 0.6, hidden: !!LINE_DET[L.k] }]),
];
