// ============================================================================
// 43 · LVM3 on the Second Launch Pad — two S200 solid boosters either side of the
// L110 core (two Vikas engines), the C25 cryogenic stage (one CE-20) above it,
// and the 5 m payload fairing over the spacecraft. Metres, y up from the S200
// aft skirts on the deck of the mobile launch pedestal. The umbilical tower
// stands beside it with its swing arms; the flame deflector is under the deck.
// ============================================================================
const ST = {};   // station (base height) of each assembly
function lvStations() {
  ST.s200 = 0; ST.l110 = LV.l110Base; ST.c25 = ST.l110 + LV.l110Len; ST.plf = ST.c25 + LV.c25Len - LV.plfOverlap;
  ST.sc = ST.c25 + LV.c25Len + 0.35; ST.top = ST.plf + LV.plfLen;
}
// Taken apart, the vehicle does what it does at liftoff: it lifts off the pedestal, stands forward clear of the
// umbilical tower while the arms swing back, and then comes apart the way it stages: the S200s drop away
// sideways, the fairing splits in two, the L110 and the C25 separate along the axis.
const PAD = { w: 24, zf: 13, zb: -13, apronX: 96, apronZ: 104, ductW: 9, ductOpen: 14, ductEnd: 34, deflectorTop: -7.0 };
const H_PAD = 3.6;
let STACK_LIFT = 5.8, STACK_CLEAR = 9.5;
const STACK_EX = { s200L: [-4.6, 0, 0], s200R: [4.6, 0, 0], l110: [0, 0, 0], l110Eng: [0, -1.6, 0], c25: [0, 7, 0], c25Eng: [0, 5.2, 0], plfA: [5.6, 10, 0], plfB: [-5.6, 10, 0], sc: [0, 14.5, 0] };
const STACK_LV = { s200L: 0, s200R: 0, l110: 1, l110Eng: 1, plfA: 1, plfB: 1, c25: 2, c25Eng: 2, sc: 3 };
const GROUP_LV = { S200: 0, L110: 1, C25: 2 };
const STACK_NAME = () => `LVM3 · Second Launch Pad, Sriharikota`;
const STACK_CAP = () => GROUPS[C.group]?.cap || "LVM3 as it stood for Chandrayaan-3 on 14 July 2023: two S200 boosters, the L110 core and the C25 cryogenic stage under a 5 m fairing, on its mobile pedestal beside the umbilical tower. Hover any part to name it; Take apart opens the stack the way it stages; Ignite fires the selected stage.";

function buildStackTextures() {
  // exhaust inks: a solid motor's aluminium flame is white-hot and smoky; the Vikas burns hypergolic, amber with
  // a brown nitrogen-dioxide tint; the CE-20 burns hydrogen, almost clear and blue
  // solids burn white-hot and orange under a grey smoke trail; Vikas's UH25 / N₂O₄ amber-red with a brown NO₂ tint
  FX_SETS.SOLID = { light: ["#fff7dc", "#ffbe4d", "#f2802a", "#d8ccbd", "#a89a8a", 1.0], dark: ["#fffbe8", "#ffbb52", "#f2782a", "#6b6560", "#4d4843", 1.0] };
  FX_SETS.VIKAS = { light: ["#fff0dc", "#ffa04f", "#e85a36", "#c99273", "#94573d", 1.0], dark: ["#fff2df", "#ff9c4c", "#e4552f", "#5b3b2c", "#3b2a22", 1.0] };
  FX_SETS.H2 = FX_SETS.J2;
  T.s200 = TEX(1024, 2048, (P) => {
    for (const v of [0.29, 0.545]) { P.hline(v, 0.85, 3); P.rivets(v + 0.006, 120, 0.5, 1.6); P.rivets(v - 0.006, 120, 0.5, 1.6); }
    for (let i = 0; i < 48; i++) P.vline(i / 48, 0.06, 1, 0.03, 0.8);
    P.hline(0.03, 0.8, 3); P.hline(0.8, 0.8, 3);
    P.paint(0, 0.0, 1, 0.025, 0.9);
    wordOn(P, "S200", 0.25, 0.42, 70, { vertical: true }); wordOn(P, "ISRO", 0.75, 0.42, 70, { vertical: true });
  });
  T.l110 = TEX(2048, 2048, (P) => {
    for (const v of [0.02, 0.36, 0.38, 0.985]) { P.hline(v, 0.85, 3); P.rivets(v + 0.004, 140, 0.45, 1.5); }
    for (let v = 0.05; v < 0.98; v += 0.04) P.hline(v, 0.07, 1.2);
    for (let i = 0; i < 64; i++) P.vline(i / 64, 0.05, 1);
    P.rect(0.47, 0.05, 0.018, 0.9, 0.4, 2); P.rect(0.97, 0.05, 0.018, 0.9, 0.4, 2);   // cable tunnels
    wordOn(P, "भारत", 0.25, 0.62, 120, { font: "'Tiro Devanagari Sanskrit', 'Noto Serif Devanagari', serif", weight: 400, vertical: true });
    wordOn(P, "INDIA", 0.25, 0.4, 100, { vertical: true });
    flagOn(P, 0.205, 0.76, 0.09, 0.07);
    wordOn(P, "LVM3", 0.75, 0.55, 120, { vertical: true });
  });
  T.c25 = TEX(2048, 1024, (P) => {
    for (const v of [0.03, 0.2, 0.62, 0.97]) { P.hline(v, 0.8, 3); P.rivets(v + 0.006, 140, 0.4, 1.5); }
    for (let v = 0.24; v < 0.6; v += 0.03) P.hline(v, 0.12, 1.2);
    for (let i = 0; i < 48; i++) P.vline(i / 48, 0.1, 1.2, 0.22, 0.6);
    wordOn(P, "ISRO", 0.25, 0.4, 90);
  });
  T.plf = TEX(2048, 2048, (P) => {
    for (let v = 0.04; v < 1; v += 0.05) P.hline(v, 0.12, 1.4);
    for (const v of [0.0, 0.11, 0.53, 0.995]) P.hline(v + 0.004, 0.75, 3);
    P.vline(0.002, 0.9, 4); P.vline(0.5, 0.9, 4); P.vline(0.998, 0.9, 4);
    for (let i = 0; i < 10; i++) P.rect(0.08 + i * 0.09, 0.115, 0.02, 0.015, 0.5, 2);
    wordOn(P, "ISRO", 0.27, 0.36, 110); flagOn(P, 0.73, 0.32, 0.05, 0.045);
    P.rect(0.62, 0.2, 0.05, 0.04, 0.7, 2.5);
  });
  T.deckLv = TEX(2048, 2048, (P) => { for (let i = 0; i <= 24; i++) { P.vline(i / 24, 0.22, 2); P.hline(i / 24, 0.22, 2); } for (const [u, v, w, h] of [[0.05, 0.05, 0.12, 0.06], [0.8, 0.1, 0.1, 0.08], [0.78, 0.82, 0.14, 0.06], [0.08, 0.84, 0.08, 0.08]]) P.rect(u, v, w, h, 0.6, 2.5); });
  T.apron = TEX(2048, 2048, (P) => { for (let i = 1; i < 16; i++) { P.vline(i / 16, 0.14, 2); P.hline(i / 16, 0.14, 2); } });
  T.plateS = TEX(512, 256, (P) => { P.rect(0.04, 0.08, 0.92, 0.84, 0.8, 3); for (const v of [0.66, 0.5, 0.34]) P.hline(v, 0.6, 3, 0.12, 0.88); });
  T.tankFoil = TEX(1024, 512, (P) => { const r = mulberry(9); for (let i = 0; i < 90; i++) { const u = r(), v = r(), l = 0.03 + r() * 0.06, a = r() * TAU; P.polyline([[u, v], [u + Math.cos(a) * l, v + Math.sin(a) * l]], 0.22, 1.2); } P.hline(0.5, 0.6, 2.5); });
}

const S200_SET = [], L110_SET = [], C25_SET = [], TOWER_ARMS = [], PAD_FX = {};
function buildStack() {
  lvStations();
  const R = LV.coreR;

  // ---------------- mobile launch pedestal, flame deflector, apron ----------------
  mod("pad"); MODULES.pad = { ...STACKINFO.pad };
  within("pad", (g) => {
    const B = bulk(), W = PAD.w, zf = PAD.zf, zb = PAD.zb, H = H_PAD;
    // deck with three exhaust openings: one under each S200 and one for the core's two Vikas
    const holes = [[-LV.s200X, 2.3], [LV.s200X, 2.3], [0, 1.7]];
    const xs = [-W / 2, -LV.s200X - 2.3, -LV.s200X + 2.3, -1.7, 1.7, LV.s200X - 2.3, LV.s200X + 2.3, W / 2];
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i], x1 = xs[i + 1], solid = i % 2 === 0;
      if (solid) add(g, boxGeo(x1 - x0, H, zf - zb, (x0 + x1) / 2, -H / 2, (zf + zb) / 2), "deck", { map: T.deckLv });
      else { const hz = i === 3 ? 1.7 : 2.3; add(g, boxGeo(x1 - x0, H, zf - hz, (x0 + x1) / 2, -H / 2, (zf + hz) / 2), "deck", { map: T.deckLv }); add(g, boxGeo(x1 - x0, H, -hz - zb, (x0 + x1) / 2, -H / 2, (zb - hz) / 2), "deck", { map: T.deckLv }); }
    }
    for (const [x, hw] of holes) add(g, boxGeo(hw * 2, 0.3, hw * 2, x, -H - 0.2, 0), "dark");
    // bogies on the rail track
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { add(g, boxGeo(3.2, 1.4, 2.4, sx * 8.5, -H - 0.7, sz * 8.5), "grey"); for (const dx of [-0.9, 0.9]) B.add(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 24).rotateX(Math.PI / 2).translate(sx * 8.5 + dx, -H - 1.45, sz * 8.5 + sz * 1.25), "dark"); }
    mod("apron", g); MODULES.apron = { name: "Pad apron", kv: [], quiet: true };
    within("apron", (ga) => {
      add(ga, boxGeo(PAD.apronX, 1.2, PAD.apronZ, 0, -H - 2.0 - 0.6, 0), "light", { map: T.apron });
      for (const sz of [-1, 1]) add(ga, boxGeo(PAD.ductW, 0.1, PAD.ductEnd - PAD.ductOpen, 0, -H - 1.95, sz * (PAD.ductEnd + PAD.ductOpen) / 2), "dark");
    });
    for (const z of [-9.75, -7.25, 7.25, 9.75]) B.add(boxGeo(PAD.apronX, 0.2, 0.25, 0, -H - 1.9, z), "grey");   // rails
    add(g, boxGeo(14, 0.1, 8, 0, -H - 1.95, 0), "dark");
    add(g, prismGeo([[-6.5, -2.8], [6.5, -2.8], [6.5, 2.8], [-6.5, 2.8]], -H - 5.8, -H - 4.4), "grey");
    for (const s of [-1, 1]) add(g, prismGeo([[-6.5, 0], [6.5, 0], [6.5, s * 2.8], [-6.5, s * 2.8]], -H - 4.4, -H - 3.7), "grey");
    // deck furniture: hold-down pedestals under the S200 skirts, cable masts, the label plate, handrails
    for (const x of [-LV.s200X, LV.s200X]) for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + TAU / 8; B.add(boxGeo(0.5, 0.4, 0.7, x + Math.cos(a) * 1.95, -0.2, Math.sin(a) * 1.95), "grey"); }
    for (const [x, z] of [[-1.6, 2.6], [1.6, 2.6], [0, -2.6]]) { B.add(boxGeo(0.5, 2.2, 0.5, x, 1.1, z), "light"); B.add(boxGeo(0.7, 0.2, 0.7, x, 2.3, z), "grey"); }
    add(g, boxGeo(3, 0.04, 1.4, W / 2 - 2.2, 0.02, zf - 1.2), "light", { map: T.plateS });
    for (let i = 0; i < 44; i++) B.add(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8).translate(-W / 2 + 0.3 + i * (W - 0.6) / 43, 0.55, zf - 0.15), "grey");
    B.add(boxGeo(W - 0.6, 0.06, 0.06, 0, 1.1, zf - 0.15), "grey");
    B.flush(g);
  });

  // ---------------- umbilical tower with its swing arms ----------------
  mod("tower"); MODULES.tower = { ...STACKINFO.tower };
  within("tower", (g) => {
    const tz = LV.towerZ, half = 3.0, top = LV.towerH, M = [];
    const cols = [[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, z]) => [x, z + tz]);
    for (const [x, z] of cols) M.push(memberMatrix(V3(x, -H_PAD - 1.4, z), V3(x, top, z), 0.42));
    for (let y = -H_PAD; y <= top - 1; y += 3.4) for (let k = 0; k < 4; k++) {
      const [ax, az] = cols[k], [bx, bz] = cols[(k + 1) % 4];
      M.push(memberMatrix(V3(ax, y, az), V3(bx, y, bz), 0.24));
      if (y + 3.4 <= top) { M.push(memberMatrix(V3(ax, y, az), V3(bx, y + 3.4, bz), 0.13)); M.push(memberMatrix(V3(bx, y, bz), V3(ax, y + 3.4, az), 0.13)); }
    }
    lattice(g, M, "tower");
    for (let y = 6.8; y < top; y += 6.8) add(g, boxGeo(half * 2 + 0.8, 0.2, half * 2 + 0.8, 0, y, tz), "light");   // working platforms
    add(g, boxGeo(half * 2 + 1, 2.6, half * 2 + 1, 0, top + 1.3, tz), "light");
    add(g, rodGeo(V3(0, top + 2.6, tz), V3(0, top + 11, tz), 0.09, 8), "dark");
    add(g, boxGeo(1.6, top + H_PAD, 1.6, 0, (top - H_PAD) / 2, tz - half - 0.9), "light");   // lift and stair shaft
    // swing arms: a box truss from the tower face to the stage, ending in an umbilical plate against the skin;
    // hinged at the root, they swing back flat against the tower at liftoff (and when the stack is taken apart)
    TOWER_ARMS.length = 0;
    const face = tz + half;
    for (const [y, on, what] of LV.arms) {
      const Rv = on === "plf" ? LV.plfR : R, pivot = new THREE.Group(); pivot.position.set(0.6, y, face); g.add(pivot);
      const xc = -0.6, reach = -face - Rv - 0.36, M2 = [], B2 = bulk();
      for (const dy of [0, 1.3]) for (const dx of [-0.55, 0.55]) M2.push(memberMatrix(V3(xc + dx, dy, 0), V3(xc + dx, dy, reach), 0.12));
      const n = Math.max(2, Math.round(reach)), stp = reach / n;
      for (let i = 0; i <= n; i++) for (const dx of [-0.55, 0.55]) { const z = i * stp; M2.push(memberMatrix(V3(xc + dx, 0, z), V3(xc + dx, 1.3, z), 0.07)); if (i < n) M2.push(memberMatrix(V3(xc + dx, 0, z), V3(xc + dx, 1.3, z + stp), 0.05)); }
      for (let i = 0; i <= n; i++) for (const dy of [0, 1.3]) M2.push(memberMatrix(V3(xc - 0.55, dy, i * stp), V3(xc + 0.55, dy, i * stp), 0.06));
      lattice(pivot, M2, "light");
      B2.add(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 12).translate(0, 0.65, 0), "grey");
      B2.add(boxGeo(1.1, 0.95, 0.3, xc, 0.6, reach + 0.21), "grey");
      B2.add(boxGeo(0.75, 0.65, 0.06, xc, 0.6, reach + 0.36 - 0.03), "dark");
      for (const [dx, r, role] of [[-0.3, 0.07, "metal"], [0, 0.05, "dark"], [0.3, 0.07, "metal"]]) cable(B2, [[xc + dx, 0.02, Math.max(0.4, reach - 2.2)], [xc + dx, -0.45, reach - 1.1], [xc + dx, -0.25, reach - 0.15], [xc + dx, 0.25, reach + 0.06]], r, { role, connector: false, clip: 99 });
      B2.flush(pivot);
      TOWER_ARMS.push({ pivot, what });
    }
  });

  // ---------------- two S200 boosters ----------------
  for (const [key, sx] of [["s200L", -1], ["s200R", 1]]) {
    mod(key); MODULES[key] = { ...STACKINFO.s200, name: `S200 solid booster (${sx < 0 ? "left" : "right"})` };
    within(key, (g) => {
      const B = bulk(), x = sx * LV.s200X, r = LV.s200R;
      const e = solidMotor(g, { x, r, len: LV.s200Len, nose: LV.s200Nose, skirt: 1.0, joints: LV.s200Joints, map: T.s200, nozLen: LV.s200Noz, exitR: LV.s200Exit, plume: 48, rmaxK: 5.2, raceway: sx > 0 ? 0 : Math.PI });
      S200_SET[sx < 0 ? 0 : 1] = { group: e.group, fx: e.fx, name: sx < 0 ? "S200 L" : "S200 R", layout: V3(x, 0, 0) };
      // attach struts to the core: aft and forward, with the separation thrusters' fairings
      for (const y of LV.strutY) for (const dz of [-0.5, 0.5]) strut(B, V3(x - sx * r, y, dz), V3(sx * R, y + 0.25, dz * 1.3), 0.1, "grey");
      for (const [y, s] of [[LV.s200Len - LV.s200Nose - 1.2, 1], [2.4, -1]]) for (const dz of [-0.55, 0, 0.55]) B.add(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 16).rotateZ(sx * 0.5 * s).translate(x + sx * r * 0.82, y, dz), "grey");
      // flex-nozzle actuators and their housing at the aft skirt
      for (const dz of [-0.7, 0.7]) strut(B, V3(x + dz * 0.4, 0.4, dz), V3(x + dz * 0.3, -1.2, dz * 0.65), 0.07, "light");
      B.flush(g);
    });
  }

  // ---------------- L110 core and its two Vikas engines ----------------
  mod("l110"); MODULES.l110 = { ...STACKINFO.l110 };
  within("l110", (g) => {
    const B = bulk(), L = LV.l110Len;
    liquidStage(g, { r: R, len: L, map: T.l110, aftY: 0.55, rings: [0.15, L * 0.37, L * 0.385, L - 0.15], tunnels: [[0, 1.5, L - 1.2], [Math.PI, 1.5, L - 1.2]] });
    // aft heat shield and thrust frame around the engines
    add(g, turn([[R * 0.98, 0.55], [R * 0.98, 0.0], [R * 0.9, 0.0]], { seg: 72 }), "grey");
    B.flush(g);
  });
  mod("l110Eng"); MODULES.l110Eng = { ...STACKINFO.vikas };
  within("l110Eng", (g) => {
    for (const s of [-1, 1]) {
      const e = detEngine(g, "vikas", { at: V3(s * LV.vikasX, 0.6 - DET_VIKAS.top, 0), rotY: s > 0 ? -20 * DEG : 160 * DEG, fx: "VIKAS", plume: 30, rmaxK: 4.5, dens: 1.25, diam: 0.3 });
      L110_SET.push({ group: e.group, fx: e.fx, name: s < 0 ? "Vikas 1" : "Vikas 2", layout: V3(s * LV.vikasX, 0, 0) });
    }
  });

  // ---------------- C25 cryogenic stage and the CE-20 ----------------
  mod("c25"); MODULES.c25 = { ...STACKINFO.c25 };
  within("c25", (g) => {
    const B = bulk(), L = LV.c25Len;
    // interstage skirt round the engine, then the tank section under its insulation, then the equipment bay
    liquidStage(g, { r: R, len: L, map: T.c25, aftY: LV.c25Inter, rings: [LV.c25Inter, L - 1.0], topCap: true });
    // payload adapter cone on top, carrying the spacecraft
    add(g, turn([[R * 0.9, L], [R * 0.62, L + 0.32], [R * 0.6, L + 0.36], [R * 0.58, L + 0.36]], { seg: 72 }), "light");
    boltCircle(B, V3(0, L + 0.36, 0), UP, R * 0.6, 36, 0.02, 0.02);
    B.flush(g);
  });
  mod("c25Eng"); MODULES.c25Eng = { ...STACKINFO.ce20 };
  within("c25Eng", (g) => {
    const e = detEngine(g, "ce20", { at: V3(0, LV.c25Inter - DET_CE20.top, 0), fx: "H2", plume: 18, rmaxK: 4.5, dens: 0.8, diam: 0.6 });
    C25_SET.push({ group: e.group, fx: e.fx, name: "CE-20", layout: V3() });
  });

  // ---------------- the spacecraft, stowed, and the fairing in two halves ----------------
  buildStowedCraft();
  for (const [key, side] of [["plfA", 1], ["plfB", -1]]) {
    mod(key); MODULES[key] = { ...STACKINFO.plf };
    within(key, (g) => fairingHalf(g, { r: LV.plfR, len: LV.plfLen, cyl: LV.plfCyl, boat: LV.plfBoat, rb: R + 0.02, map: T.plf }, side));
  }
  detailLVM3();
  detailStages();

  // ---------------- engine groups ----------------
  ENGINE_SETS.S200 = S200_SET; ENGINE_SETS.L110 = L110_SET; ENGINE_SETS.C25 = C25_SET;
  for (const k of ["S200", "L110", "C25"]) GROUPS[k] = STACK_GROUPS[k];
  for (const k in GROUPS) C.off[k] = (ENGINE_SETS[GROUPS[k].set] || []).map(() => 0);
  SCENE.updateMatrixWorld(true);
  STACK_SPHERE = new THREE.Sphere(V3(0, ST.top / 2, LV.towerZ / 2), Math.max(ST.top, 45) * 0.95 + 70);
  FRAME_HOOKS.push(stackPose);
  // On the pad the S200s fire down through the deck onto the jet deflector, which turns the exhaust both ways
  // along the ducts under the pedestal; it leaves the ducts where they open onto the apron and rolls up as clouds.
  PAD_FX.lv = padExhaust(MODS.pad.group, { deckTop: 0, deckY: -H_PAD, groundY: -H_PAD - 2.0, open: PAD.ductOpen, ductW: PAD.ductW, reach: 18, ring: PAD.w / 2, r: 3.2 });
  MODULES.stackInfo = { ...STACKINFO.lvm3 };
  addMenu("LVM3 · Chandrayaan-2 & 3", STACK_MENU);
}

// the spacecraft as it rode under the fairing: Chandrayaan-3's integrated module, part for part
function buildStowedCraft() {
  mod("sc"); MODULES.sc = { ...STACKINFO.sc };
  const g = MODS.sc.group;
  SHOW.scS = { key: "scS", group: g, asm: [], fx: [], stowed: true };
  buildC3("scS", { stowed: true });
  for (const k of Object.keys(MODS)) if (k.startsWith("scS.")) { MODS.sc.meshes.push(...MODS[k].meshes); for (const [mk, m] of MODS[k].mats) MODS.sc.mats.set(k + "|" + mk, m); MOD_TO_ITEM_EXTRA[k] = "lSC"; }
  g.scale.setScalar(1);
}

// the order the stack comes apart in: fairing first, then the spacecraft, the upper stage, the boosters, the core's engines
const STACK_DELAY = { plfA: 0, plfB: 0.03, sc: 0.12, c25: 0.2, c25Eng: 0.24, s200L: 0.3, s200R: 0.33, l110: 0.4, l110Eng: 0.42 };
// per-frame: the stack's taken-apart pose, a firing stage's climb, swing arms, pad exhaust
const STACK_BASE = () => ({ s200L: 0, s200R: 0, l110: ST.l110, l110Eng: ST.l110, c25: ST.c25, c25Eng: ST.c25, plfA: ST.plf, plfB: ST.plf, sc: ST.sc });
const _ly = {};
function localY(k) {
  if (_ly[k]) return _ly[k];
  const g = MODS[k].group; g.updateWorldMatrix(true, true);
  const inv = g.matrixWorld.clone().invert(), b = new THREE.Box3(), t = new THREE.Box3(), m4 = new THREE.Matrix4();
  for (const m of MODS[k].meshes) {
    let bb; if (m.isInstancedMesh) { m.computeBoundingBox(); bb = m.boundingBox; } else { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); bb = m.geometry.boundingBox; }
    b.union(t.copy(bb).applyMatrix4(m4.multiplyMatrices(inv, m.matrixWorld)));
  }
  return (_ly[k] = [b.min.y, b.max.y]);
}
function climbFor(lv) {
  const B0 = STACK_BASE(), apartY = (k) => B0[k] + STACK_EX[k][1] + STACK_LIFT;
  let exit = Infinity, below = 0;
  for (const k in STACK_LV) {
    const [y0, y1] = localY(k).map((v) => v + apartY(k));
    if (STACK_LV[k] === lv) exit = Math.min(exit, y0);
    else if (STACK_LV[k] < lv && STACK_EX[k][0] === 0) below = Math.max(below, y1);
  }
  const G = GROUPS[Object.keys(GROUP_LV).find((g) => GROUP_LV[g] === lv)];
  return Math.max(0, G.plume.len + 1.5 - (exit - below));
}
function stackPose(dt, sh) {
  if (sh) return;
  const B0 = STACK_BASE();
  const lv = GROUP_LV[C.group], firing = C.running && C.explode && lv != null;
  if (firing && C.climbLv !== lv && !(C.climbAmt > 0.01)) { C.climbLv = lv; C.climbD = climbFor(lv); C.climbT0 = C.t; }
  if (firing && C.climbLv === lv) C.climbAmt = Math.max(C.climbAmt || 0, REDUCED ? 1 : smooth(0.35, 3.2, C.t - C.climbT0));
  else C.climbAmt = (C.climbAmt || 0) * Math.exp(-dt * (REDUCED ? 60 : 1.6));
  if (C.climbAmt < 1e-4) C.climbAmt = 0;
  for (const k in STACK_LV) {
    const e = STACK_EX[k], up = STACK_LV[k] >= (C.climbLv ?? 99) ? (C.climbD || 0) * C.climbAmt : 0, x = partAmt(C.exAmt, STACK_DELAY[k] ?? 0);
    MODS[k].group.position.set(e[0] * x, B0[k] + (e[1] + STACK_LIFT) * x + up, (e[2] + STACK_CLEAR) * x);
  }
  const s = S200_SET.reduce((a, e) => a + (e.fx.userData.thrust || 0), 0) / 2;
  PAD_FX.lv.update(s, C.exAmt);
  const sw = smooth(0, 0.4, C.exAmt);
  TOWER_ARMS.forEach((a) => (a.pivot.rotation.y = sw * 80 * DEG));
}
