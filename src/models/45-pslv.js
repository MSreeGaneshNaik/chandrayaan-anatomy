// ============================================================================
// 45 · PSLV-XL (PSLV-C11, Chandrayaan-1) — the S139 core (PS1) ringed by six
// PSOM-XL boosters, the Vikas-powered PS2, the solid PS3, the twin-engine PS4
// and the heat shield over Chandrayaan-1. A display of its own: taken apart, it
// comes apart the way it staged, each stage high enough for its plume to clear.
// ============================================================================
const PSLV_SETS = { PSOM: [], PS1: [], PS2: [], PS3: [], PS4: [] };
function buildPSLVTextures() {
  T.ps1 = TEX(1024, 2048, (P) => {
    for (let k = 0; k < 6; k++) P.hline(0.1 + k * 0.15, 0.8, 3);
    for (let i = 0; i < 48; i++) P.vline(i / 48, 0.05, 1, 0.02, 0.98);
    for (let k = 0; k < 8; k++) P.paint(k / 8, 0.92, 1 / 16, 0.05, 0.7);           // the chequered forward band
    wordOn(P, "PSLV", 0.25, 0.55, 90, { vertical: true }); wordOn(P, "ISRO", 0.75, 0.55, 90, { vertical: true });
  });
  T.psom = TEX(512, 2048, (P) => { for (const v of [0.08, 0.5, 0.86]) P.hline(v, 0.8, 3); for (let i = 0; i < 24; i++) P.vline(i / 24, 0.05, 1); P.paint(0, 0.0, 1, 0.03, 0.8); });
  T.ps2 = TEX(1024, 1024, (P) => { for (const v of [0.03, 0.4, 0.97]) { P.hline(v, 0.8, 3); P.rivets(v + 0.006, 100, 0.4, 1.5); } for (let v = 0.06; v < 0.95; v += 0.05) P.hline(v, 0.07, 1.2); wordOn(P, "भारत", 0.25, 0.65, 90, { font: "'Tiro Devanagari Sanskrit', serif", weight: 400, vertical: true }); wordOn(P, "INDIA", 0.25, 0.3, 80, { vertical: true }); flagOn(P, 0.7, 0.55, 0.08, 0.14); });
  T.hs = TEX(1024, 2048, (P) => { for (let v = 0.04; v < 1; v += 0.05) P.hline(v, 0.12, 1.4); for (const v of [0.0, 0.11, 0.52, 0.995]) P.hline(v + 0.004, 0.75, 3); P.vline(0.002, 0.9, 4); P.vline(0.5, 0.9, 4); P.vline(0.998, 0.9, 4); wordOn(P, "ISRO", 0.27, 0.35, 90); P.rect(0.64, 0.2, 0.05, 0.04, 0.7, 2.5); });
}
function buildPSLV(item) {
  buildPSLVTextures();
  const S = SHOW[item], G = PV, R = G.ps1R;
  const part = (sub, info, ex) => { const I = STACKINFO[info] || {}; const k = asm(item, sub, I.name || sub, I.desc || "", ex, I.kv || []); MODULES[k].short = I.short || I.name; MODULES[k].by = I.by; return k; };
  // stations (base of each stage)
  const y2 = G.ps1Len, y3 = y2 + G.ps2Len, yHS = y3 + G.ps3Len - 0.2;
  // a launch pedestal under it, with an exhaust opening
  part("ped", "pslvPed", [0, 0, 0]); Object.assign(MODULES[item + ".ped"], { name: "Mobile launch pedestal", quiet: true });
  within(item + ".ped", (pg) => { const B = bulk();
    add(pg, prismGeo(chamferSq(13, 1.6), -3.2 - G.ps1Noz, -G.ps1Noz), "deck", { map: T.deckLv });
    add(pg, boxGeo(4.6, 0.1, 4.6, 0, -G.ps1Noz + 0.02, 0), "dark");
    for (let k = 0; k < 6; k++) { const a = k * TAU / 6; B.add(boxGeo(0.5, G.ps1Noz, 0.5, Math.cos(a) * 2.6, -G.ps1Noz / 2, Math.sin(a) * 2.6), "grey"); }
    B.flush(pg); });
  // ---- the Second Launch Pad's apron round the pedestal: rails, the two flame-duct openings, and the exhaust ----
  const gy = -G.ps1Noz - 3.2 - 0.8, padG = mod(item + ".apron", S.group);
  MODULES[item + ".apron"] = { name: "Second Launch Pad · apron", quiet: true, kv: [] };
  within(item + ".apron", (ag) => { const B = bulk();
    add(ag, boxGeo(80, 1.2, 80, 0, gy - 0.6, 0), "light", { map: T.apron });
    for (const sz of [-1, 1]) { add(ag, boxGeo(7, 0.08, 12, 0, gy + 0.02, sz * 15), "dark"); B.add(boxGeo(7.6, 0.25, 0.3, 0, gy + 0.12, sz * 9), "grey"); }
    for (const z of [-4.2, -2.6, 2.6, 4.2]) B.add(boxGeo(80, 0.2, 0.25, 0, gy + 0.1, z), "grey");   // rails, across the ducts' line
    for (const [x, z] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) B.add(boxGeo(1.6, 0.8, 1.6, x, gy + 0.4, z), "grey");   // the pedestal's bogies
    B.flush(ag); });
  const PF = padExhaust(padG, { deckTop: -G.ps1Noz, deckY: -G.ps1Noz - 3.2, groundY: gy, open: 9, ductW: 7, reach: 12, ring: 6.5, r: 2.4 });
  FRAME_HOOKS.push((dt, sh) => {
    if (sh !== item) return;
    const avg = (set) => set.reduce((a, e) => a + (e.fx.userData.thrust || 0), 0) / Math.max(1, set.length);
    PF.update(Math.max(avg(PSLV_SETS.PS1), avg(PSLV_SETS.PSOM)), C.sxAmt);
  });
  // ---- PS1: the S139 motor with its two SITVC tanks ----
  part("ps1", "ps1", [0, 0, 0]);
  within(item + ".ps1", (g) => {
    const B = bulk();
    add(g, turn([[R * 0.6, 0], [R, 0.6], [R, G.ps1Len]], { seg: 72, vy: [0, G.ps1Len] }), "white", { map: T.ps1, inkA: 0.75 });
    for (const y of [3.4, 6.8, 10.2, 13.6, 17.0]) B.add(turn([[R * 1.002, y - 0.1], [R * 1.02, y - 0.08], [R * 1.02, y + 0.08], [R * 1.002, y + 0.1]], { seg: 72 }), "grey");
    for (const s of [-1, 1]) add(g, turn([[0, 1.0], [0.32, 1.4, 1], [0.32, 6.4, 1], [0, 6.8]], { seg: 32 }).translate(0, 0, s * (R + 0.34)).rotateY(Math.PI / 4), "light", { map: T.tube || T.tankSph });
    const e = engine(g, "sitvc", { at: V3(0, -G.ps1Noz + 0.3, 0), len: G.ps1Noz, exitR: G.ps1Exit, throatR: G.ps1Exit * 0.35, chamberR: G.ps1Exit * 0.75, fx: "SOLID", plume: 40, rmaxK: 5, dens: 1.6, diam: 0.1, flow: 26, coolK: 2.2, role: "grey", hoops: [0.2, 0.5, 0.8], bellPow: 0.8, bellK: 0.7, hot: 4 });
    PSLV_SETS.PS1.push({ group: e.group, fx: e.fx, name: "S139", layout: V3() });
    B.flush(g);
  });
  // ---- the PS1/PS2 interstage: it encloses the Vikas and goes with PS1 when the stages part ----
  within(item + ".ps1", (g) => {
    const B = bulk(), IS = 2.8;
    add(g, turn([[R * 0.995, y2], [R, y2 + 0.02], [R, y2 + IS - 0.02], [R * 0.995, y2 + IS]], { seg: 96, vy: [y2, y2 + G.ps2Len] }), "white", { map: T.ps2, inkA: 0.75, side: THREE.DoubleSide });
    for (const y of [y2 + 0.06, y2 + IS - 0.06]) B.add(turn([[R * 1.002, y - 0.05], [R * 1.014, y - 0.04], [R * 1.014, y + 0.04], [R * 1.002, y + 0.05]], { seg: 96 }), "grey");
    for (let k = 0; k < 8; k++) { const q = k * TAU / 8 + 0.2; B.add(boxGeo(0.12, 0.08, 0.05).rotateY(-q + Math.PI / 2).translate(Math.cos(q) * (R + 0.02), y2 + IS - 0.12, Math.sin(q) * (R + 0.02)), "dark"); }   // separation bolts
    B.flush(g);
  });
  // ---- six PSOM-XL strap-ons, each a part of its own so it can fall away on its own ----
  // Four light on the pad at T+0.4 s and separate at T+70 s; the two air-lit ones (diametrically opposite)
  // light at T+25 s and go at T+92 s (PSLV-C11 profile).
  const psomKeys = [];
  MODULES[item + ".psoms"] = { ...STACKINFO.psom, short: "PSOM-XL" };   // the six together, for the boosters' own sheet
  for (let k = 0; k < 6; k++) {
    const a = k * TAU / 6 + TAU / 12, x = Math.cos(a) * G.psomX, z = Math.sin(a) * G.psomX, air = k % 3 === 2;
    const key = part("psom" + (k + 1), "psom", [Math.cos(a) * 4.6, -1.2, Math.sin(a) * 4.6]);
    Object.assign(MODULES[key], { name: `PSOM-XL booster ${k + 1} · ${air ? "air-lit" : "ground-lit"}`, short: `PSOM-XL ${k + 1}`, kv: [[air ? "Air-lit" : "Ground-lit", air ? "ignition T+25.0 s · separation T+92 s" : "ignition T+0.4 s · separation T+70 s"], ...(STACKINFO.psom.kv || [])] });
    psomKeys.push(key);
    within(key, (g) => {
      const grp = new THREE.Group(); grp.position.set(0, G.psomY, 0); g.add(grp);
      const e = solidMotor(grp, { kind: "fixed", x, z, r: G.psomR, len: G.psomLen, nose: G.psomNose, skirt: 0.5, joints: [4.5, 9.0], map: T.psom, nozLen: G.psomNoz, exitR: G.psomExit, plume: 26, rmaxK: 5, tilt: -Math.cos(a) * 0.05, tiltX: Math.sin(a) * 0.05 });
      // the attach struts, fore and aft, with the separation bolts where they meet the core
      const B = bulk();
      for (const y of [1.2, G.psomLen - G.psomNose - 0.8]) {
        const p0 = V3(x - Math.cos(a) * G.psomR, y, z - Math.sin(a) * G.psomR), p1 = V3(Math.cos(a) * (R + 0.04), y + 0.2, Math.sin(a) * (R + 0.04));
        strut(B, p0, p1, 0.05, "grey");
        B.add(aim(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 12), p1, V3(Math.cos(a), 0, Math.sin(a))), "dark");
      }
      B.flush(grp);
      PSLV_SETS.PSOM.push({ group: e.group, fx: e.fx, name: `PSOM ${k + 1}${air ? " · air" : ""}`, layout: V3(x, 0, z), air });
    });
  }
  // ---- PS2: Vikas under a 2.8 m tank stage ----
  part("ps2", "ps2", [0, 0, 0]);
  within(item + ".ps2", (g) => {
    // the tanks start 2.8 m up; the interstage below them, round the Vikas, stays with PS1 at separation
    const L = G.ps2Len, B = bulk(), w = new THREE.Group(), IS = 2.8; w.position.y = y2; g.add(w);
    const wt = new THREE.Group(); wt.position.y = IS; w.add(wt);
    liquidStage(wt, { r: R, len: L - IS, map: T.ps2, aftY: 0, vy: [-IS, L - IS], rings: [0.04, L * 0.45 - IS, L - 0.15 - IS] });
    const e = detEngine(w, "vikas", { at: V3(0, 2.85 - DET_VIKAS.top, 0), fx: "VIKAS", plume: 26, rmaxK: 4.5, dens: 1.25, diam: 0.3 });
    PSLV_SETS.PS2.push({ group: e.group, fx: e.fx, name: "Vikas", layout: V3() });
    B.flush(w);
  });
  // ---- PS3: the solid third stage inside its interstage ----
  part("ps3", "ps3", [0, 0, 0]);
  within(item + ".ps3", (g) => {
    const w = new THREE.Group(); w.position.y = y3; g.add(w); const B = bulk();
    add(w, turn([[R * 0.998, 0], [R, 0.02], [G.ps3R + 0.25, G.ps3Len * 0.55], [G.hsR * 0.99, G.ps3Len]], { seg: 72 }), "light", { map: T.s2 || T.ps2, side: THREE.DoubleSide });
    add(w, turn([[0, 0.9], [G.ps3R * 0.85, 1.0, 1], [G.ps3R, 1.4, 1], [G.ps3R, G.ps3Len - 0.5, 1], [G.ps3R * 0.8, G.ps3Len - 0.15, 1], [0, G.ps3Len - 0.1]], { seg: 48 }), "metal", { map: T.tankSph });
    const e = engine(w, "flex", { at: V3(0, 0.95 - G.ps3Noz, 0), len: G.ps3Noz, exitR: G.ps3Exit, throatR: 0.1, chamberR: 0.3, fx: "SOLID", plume: 14, rmaxK: 4.5, dens: 1.3, diam: 0.1, role: "grey", bellPow: 0.8, bellK: 0.7, hot: 4 });
    PSLV_SETS.PS3.push({ group: e.group, fx: e.fx, name: "PS3", layout: V3() });
    B.flush(w);
  });
  // ---- PS4: two pressure-fed engines under the spherical-ended tanks, the equipment bay, Chandrayaan-1 ----
  part("ps4", "ps4", [0, 0, 0]);
  within(item + ".ps4", (g) => {
    const w = new THREE.Group(); w.position.y = yHS + 0.4; g.add(w); const B = bulk(), r = G.ps4R;
    add(w, turn([[0, 0.3], [r * 0.85, 0.4, 1], [r, 0.8, 1], [r, G.ps4Len - 0.7, 1], [r * 0.85, G.ps4Len - 0.3, 1], [0, G.ps4Len - 0.2]], { seg: 48 }), "metal", { map: T.tankSph });
    add(w, turn([[G.hsR * 0.92, G.ps4Len - 0.1], [G.hsR * 0.92, G.ps4Len + 0.25], [0.5, G.ps4Len + 0.45], [0.5, G.ps4Len + 0.5]], { seg: 72 }), "light");   // equipment bay deck and adapter
    for (const s of [-1, 1]) { const e = engine(w, "ps4", { at: V3(s * G.ps4X, 0.35 - 0.7, 0), len: 0.7, exitR: G.ps4Exit, throatR: 0.03, chamberR: 0.06, fx: "HYP", plume: 7, rmaxK: 5.5, dens: 0.9, diam: 0.2, flow: 14, hot: 4, coolK: 1.3, bellPow: 0.55 }); PSLV_SETS.PS4.push({ group: e.group, fx: e.fx, name: s < 0 ? "PS4 E1" : "PS4 E2", layout: V3(s * G.ps4X, 0, 0) }); }
    B.flush(w);
  });
  // ---- Chandrayaan-1 under the heat shield ----
  part("sc1", "pslvSc", [0, 0, 0]);
  { const g = MODS[item + ".sc1"].group, w = new THREE.Group(); w.position.y = yHS + 0.4 + G.ps4Len + 0.6; w.scale.setScalar(0.92); g.add(w);
    const fake = "dC1s"; SHOW[fake] = { key: fake, group: w, asm: [], fx: [], stowed: true };
    buildC1(fake, { stowed: true });
    for (const k of Object.keys(MODS)) if (k.startsWith(fake + ".")) { MODS[item + ".sc1"].meshes.push(...MODS[k].meshes); for (const [mk, m] of MODS[k].mats) MODS[item + ".sc1"].mats.set(k + "|" + mk, m); MOD_TO_ITEM_EXTRA[k] = "pSC"; } }
  // ---- heat shield halves ----
  for (const [sub, side] of [["hsA", 1], ["hsB", -1]]) {
    part(sub, "hs", [side * 3.2, 0, 0]);
    within(item + "." + sub, (g) => { const w = new THREE.Group(); w.position.y = yHS; g.add(w); fairingHalf(w, { r: G.hsR, len: G.hsLen, cyl: G.hsCyl, boat: G.hsBoat, rb: G.ps3R + 0.3, map: T.hs }, side); });
  }
  detailPSLV(item);
  detailPSLVStages(item);
  // taken apart: each stage rises clear of the one below, with room under it for its own vacuum plume
  const ex = { ps1: [0, 0, 0], ps2: [0, 7, 0], ps3: [0, 12.5, 0], ps4: [0, 16.5, 0], sc1: [0, 19.5, 0], hsA: [4.2, 15.5, 0], hsB: [-4.2, 15.5, 0] };
  for (const A of S.asm) { const s = A.key.split(".")[1]; if (ex[s]) A.ex.set(...ex[s]); }
  // the boosters fall away outward, each along its own radius; then it comes apart in the order it staged
  const order = { ps2: 0.14, hsA: 0.2, hsB: 0.2, ps3: 0.27, ps4: 0.33, sc1: 0.42 };
  psomKeys.forEach((k, i) => (order[k.split(".")[1]] = i % 3 === 2 ? 0.07 : 0));
  S.exDelay = (key) => order[key.split(".")[1]];
  S.plumeRoom = 40;
  ENGINE_SETS.PSOM = PSLV_SETS.PSOM; ENGINE_SETS.PS1 = PSLV_SETS.PS1; ENGINE_SETS.PS2 = PSLV_SETS.PS2; ENGINE_SETS.PS3 = PSLV_SETS.PS3; ENGINE_SETS.PS4 = PSLV_SETS.PS4;
}
