// ============================================================================
// 45 · DETAILED ENGINES — the five engines that did the missions' main work,
// each alone and built down to its plumbing: Vikas, CE-20, the S200's flex
// nozzle, the 440 N apogee motor and Vikram's 800 N throttleable engine.
// Every assembly is its own part with its own sheet; Take apart separates them
// along their own vectors. The same builders draw these five in the all-engines
// row, so the row carries the same detail.
// Construction follows LPSC's descriptions (propulsion systems page), the CE-20
// paper (IAC-16-C4.1) and, for Vikas, its Viking parent; positions of parts on
// the engines are drawn, not measured.
// ============================================================================
Object.assign(SHOW_X, { dVIKAS: 840, dCE20: 880, dS200: 920, dLAM: 960, dVK800: 990 });
const DBL = THREE.DoubleSide;
// a bell from the exit (y = 0) up to the throat at yT, opening fast below the throat and flattening to the exit
function bellPts(re, rt, yT, pow = 0.6, n = 26) {
  const p = []; for (let i = 0; i <= n; i++) { const s = i / n; p.push([rt + (re - rt) * Math.pow(1 - s, pow), yT * s, i && i < n ? 1 : 0]); } return p;
}
// throat → convergent → cylindrical chamber up to the injector face
const chamberPts = (rt, rc, yT, yC, yI) => [[rt, yT], [lerp(rt, rc, 0.25), yT + (yC - yT) * 0.35, 1], [rc * 0.93, yT + (yC - yT) * 0.8, 1], [rc, yC, 1], [rc, yI]];
const slice = (prof, y0, y1) => { const r0 = rAt(prof, y0), r1 = rAt(prof, y1); return [[r0, y0], ...prof.filter(([, y]) => y > y0 + 1e-4 && y < y1 - 1e-4), [r1, y1]]; };
const hoop = (B, r, y, w, t, role = "light", seg = 96) => B.add(turn([[r + t * 0.1, y - w / 2], [r + t, y - w / 2 + t * 0.3], [r + t, y + w / 2 - t * 0.3], [r + t * 0.1, y + w / 2]], { seg }), role);
const lip = (B, re, s, role = "light") => B.add(turn([[re, 0], [re + s, s * 0.4], [re + s, s * 1.4], [re - s * 0.1, s * 1.7]], { seg: 128 }), role);
function detFX(kind, re, len, o = {}) {
  return makeFX(kind, 0, { len, r0: re * 0.95, rmax: re * (o.rmaxK ?? 4), spread: o.spread ?? 1.2, pow: 0.9, freq: 1.2, flow: o.flow ?? 30, dens: o.dens ?? 1.4, hot: o.hot ?? 5, diam: o.diam ?? 0.4, soot: o.soot ?? 0, fade: 0.45, coolK: o.coolK ?? 1.6, attack: o.attack, decay: o.decay });
}

// ---------------- Vikas ----------------
// L110 flies two, PSLV's PS2 one. Gas-generator cycle, UH25 and N₂O₄; from the Viking it keeps one turbine
// driving three coaxial pumps (oxidiser, fuel, water) and water injected into the gas generator.
const DET_VIKAS = { re: 0.53, rt: 0.142, yT: 1.62, yJ: 0.9, rc: 0.25, yC: 1.98, yI: 2.36, half: 0.95, rotY: -24 * DEG, top: 2.8 };
function detVikas(eng, R) {
  const { re, rt, yT, yJ, rc, yC, yI } = DET_VIKAS;
  const NZ = bellPts(re, rt, yT, 0.58), ALL = NZ.concat(chamberPts(rt, rc, yT, yC, yI).slice(1)), rB = (y) => rAt(ALL, y);
  const tp = V3(0.68, 0, 0.1), T_ = (x, y, z) => V3(tp.x + x, y, tp.z + z), gg = V3(0.42, 0, 0.52), top = yI + 0.44;
  const vOx = polar(0.36, 62 * DEG, yI + 0.17), vFu = polar(0.42, 112 * DEG, yI + 0.03), cb = polar(0.5, 20 * DEG, yI + 0.22);
  const act = [200 * DEG, 290 * DEG], wires = [vOx, vFu];
  R("nz", "Nozzle divergent", "The lower bell, bolted on below the throat section. LPSC describes Vikas as radiation cooled: the divergent sheds its heat by glowing, with no coolant in its wall. Stiffening rings keep the thin bell round when the flow separates at sea level.", [0, -1.5, 0], [["Area ratio", "13.99 : 1 at the exit"], ["Exit Ø", `${fmt(re * 2, 2)} m · from the 766 / 677 kN pair`], ["Cooling", "radiation (LPSC)"]], (g) => {
    const B = bulk();
    add(g, turn(slice(ALL, 0, yJ), { seg: 128 }), "metal", { side: DBL, map: T.ringsSPS });
    lip(B, re, 0.03);
    for (const y of [0.28, 0.6]) { hoop(B, rB(y), y, 0.05, 0.022); for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + 0.2; B.add(aim(new THREE.BoxGeometry(0.05, 0.06, 0.03), polar(rB(y) + 0.03, a, y), polar(1, a)), "grey"); } }
    flange(B, V3(0, yJ - 0.015, 0), UP, rB(yJ) - 0.01, rB(yJ) + 0.07, 0.03, 40);
    B.flush(g);
  });
  R("tc", "Thrust chamber · throat", "UH25 and N₂O₄ burn at about 58.5 bar (Spaceflight101) in a cylindrical chamber; a film of fuel along the wall keeps it below its melting point, and the Viking design it comes from carries an ablative insert in the throat. Bosses on the chamber carry the pressure taps and the actuator lugs.", [0, -0.55, 0], [["Chamber pressure", "58.5 bar"], ["Mixture", "1.7 : 1 O/F"], ["Throat Ø", `≈${fmt(rt * 2, 2)} m (derived from ε)`], ["Cooling", "fuel film · ablative throat (Viking)"]], (g) => {
    const B = bulk();
    add(g, turn(slice(ALL, yJ, yI), { seg: 128 }), "metal");
    flange(B, V3(0, yJ + 0.015, 0), V3(0, -1, 0), rB(yJ) - 0.01, rB(yJ) + 0.07, 0.03, 40);
    hoop(B, rB(yT), yT, 0.12, 0.03, "grey");                                                     // throat ring over the insert
    for (const y of [yC + 0.06, (yC + yI) / 2, yI - 0.05]) hoop(B, rc, y, 0.04, 0.018);
    // film-coolant ring manifold and its injection stubs into the wall
    B.add(torusGeo(rc + 0.06, 0.022, 64).translate(0, yI - 0.13, 0), "light");
    for (let k = 0; k < 16; k++) { const a = k * TAU / 16; B.add(rodGeo(polar(rc + 0.04, a, yI - 0.13), polar(rc, a, yI - 0.17), 0.007, 6), "grey"); }
    for (const a of act) { const p = polar(rc + 0.03, a, yC + 0.05); B.add(aim(new THREE.BoxGeometry(0.1, 0.1, 0.06), p, polar(1, a)), "grey"); B.add(aim(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 10), p.clone().addScaledVector(polar(1, a), 0.04), polar(1, a + Math.PI / 2)), "dark"); }
    for (const [a, y] of [[150 * DEG, yC + 0.15], [250 * DEG, yC + 0.28], [330 * DEG, yT + 0.12]]) B.add(aim(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6), polar(rB(y) + 0.012, a, y), polar(1, a)), "grey");
    B.flush(g);
  });
  R("inj", "Injector head · gimbal", "The injector plate sprays oxidiser and fuel into the chamber; the oxidiser arrives through the dome on top, the fuel through the ring manifold round the head. A spherical gimbal bearing above the dome carries the whole thrust into the stage's thrust frame.", [0, 0.62, 0], [["Thrust carried", "766 kN vac"], ["Gimbal", "±4° on PS2 (pitch, yaw)"]], (g) => {
    const B = bulk();
    add(g, turn([[rc + 0.03, yI], [rc + 0.03, yI + 0.07], [rc - 0.01, yI + 0.08], [rc * 0.86, yI + 0.15, 1], [rc * 0.5, yI + 0.21, 1], [0, yI + 0.23]], { seg: 96 }), "metal");
    boltCircle(B, V3(0, yI + 0.07, 0), UP, rc + 0.012, 36, 0.007, 0.012);
    B.add(torusGeo(rc + 0.075, 0.032, 64).translate(0, yI + 0.035, 0), "light");                                           // fuel ring manifold
    for (const a of [112 * DEG, 292 * DEG]) flange(B, polar(rc + 0.11, a, yI + 0.035), polar(1, a), 0.026, 0.045, 0.015, 8);
    flange(B, polar(0.26, 62 * DEG, yI + 0.15), polar(1, 62 * DEG).add(V3(0, 0.5, 0)), 0.03, 0.05, 0.015, 8);              // oxidiser inlet on the dome
    add(g, boxGeo(0.24, 0.12, 0.24, 0, yI + 0.29, 0), "grey");
    add(g, sphereGeo(0.075, 0, yI + 0.24, 0), "light");
    for (const s of [-1, 1]) B.add(rodGeo(V3(s * 0.16, yI + 0.29, 0), V3(s * 0.1, yI + 0.29, 0), 0.025, 12), "dark");     // gimbal cross pins
    add(g, boxGeo(0.72, 0.05, 0.72, 0, top - 0.02, 0), "light");
    boltCircle(B, V3(0, top + 0.005, 0), UP, 0.28, 16, 0.012, 0.018);
    for (const [x, z] of [[0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]]) B.add(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6).translate(x, top + 0.01, z), "dark");
    B.flush(g);
  });
  R("tp", "Turbopump", "One turbine at the bottom spins three pumps on the same shaft: oxidiser, fuel and water. In the Viking the turbine makes about 2.5 MW at 10,000 rpm. The three inlets rise to the stage's feed lines through bellows that follow the gimbal.", [1.6, 0.3, 0.35], [["Pumps", "3 coaxial: N₂O₄ · UH25 · water"], ["Turbine", "≈2.5 MW at 10,000 rpm (Viking)"], ["Drive", "gas generator"]], (g) => {
    const B = bulk(), P = [tp.x, 0, tp.z];
    add(g, turn([[0, 1.46], [0.15, 1.46], [0.175, 1.53, 1], [0.175, 1.64], [0.12, 1.7], [0, 1.7]], { seg: 48 }), "light", { p: P });   // turbine
    B.add(torusGeo(0.18, 0.04, 40, 5.4).translate(tp.x, 1.58, tp.z), "light");                                                   // turbine inlet scroll
    boltCircle(B, T_(0, 1.7, 0), UP, 0.14, 20, 0.006, 0.01);
    const stack = [[1.7, 1.76, 0.07, "grey"], [1.76, 1.86, 0.1, "light"], [1.86, 1.9, 0.07, "grey"], [1.9, 2.06, 0.14, "light"], [2.06, 2.1, 0.08, "grey"], [2.1, 2.3, 0.15, "light"]];
    for (const [y0, y1, r, role] of stack) add(g, turn([[0, y0], [r, y0], [r, y1], [0, y1]], { seg: 40 }), role, { p: P });
    for (const [y, r, t] of [[1.81, 0.1, 0.028], [1.98, 0.145, 0.04], [2.2, 0.155, 0.045]]) { B.add(torusGeo(r + t * 0.6, t, 40, 5.6).translate(tp.x, y, tp.z), "light"); boltCircle(B, T_(0, y + t + 0.005, 0), UP, r * 0.8, 16, 0.005, 0.008); }
    duct(B, [T_(0, 2.3, 0), T_(0, 2.5, 0.01), T_(-0.02, top - 0.01, 0.02)], 0.085, { bellows: [0.45], bolts: 12 });         // oxidiser inlet
    duct(B, [T_(0.15, 1.99, 0), T_(0.26, 2.08, 0.02), T_(0.27, 2.4, 0.04), T_(0.26, top - 0.01, 0.05)], 0.065, { bellows: [0.6], bolts: 10 });   // fuel inlet
    duct(B, [T_(0.02, 1.82, 0.1), T_(0.06, 1.95, 0.24), T_(0.05, 2.4, 0.27), T_(0.04, top - 0.01, 0.27)], 0.03, { bellows: [0.55], bolts: 6 }); // water inlet
    const sp = sensor(B, T_(-0.12, 1.6, -0.1), V3(-1, 0, -0.8), 0.016); wires.push(sp);                                        // speed pickup
    B.flush(g);
  });
  R("gg", "Gas generator · water injection", "A small chamber burns the same UH25 and N₂O₄; water sprayed into its gas brings it down to about 620 °C before it reaches the turbine. In the Viking, some of the cooled gas was also piped up to pressurise the tanks.", [1.0, -0.15, 1.4], [["Gas to turbine", "≈620 °C (Viking)"], ["Coolant", "water, from its own pump"], ["Tap-off", "tank pressurisation (Viking)"]], (g) => {
    const B = bulk(), P = [gg.x, 0, gg.z];
    add(g, turn([[0, 1.46], [0.04, 1.46], [0.065, 1.52, 1], [0.065, 1.74], [0.04, 1.8, 1], [0, 1.81]], { seg: 32 }), "metal", { p: P });
    B.add(torusGeo(0.078, 0.012, 28).translate(gg.x, 1.71, gg.z), "grey");                                                    // water injection ring
    for (let k = 0; k < 6; k++) { const a = k * TAU / 6; B.add(rodGeo(V3(gg.x + Math.sin(a) * 0.078, 1.71, gg.z + Math.cos(a) * 0.078), V3(gg.x + Math.sin(a) * 0.066, 1.66, gg.z + Math.cos(a) * 0.066), 0.004, 5), "grey"); }
    duct(B, [V3(gg.x, 1.46, gg.z), V3(gg.x + 0.05, 1.42, gg.z - 0.12), T_(-0.05, 1.5, 0.22), T_(0, 1.58, 0.17)], 0.035, { bolts: 8 });
    for (const [dx, from, r] of [[-0.03, T_(-0.1, 2.2, 0.1), 0.012], [0.03, T_(-0.08, 1.98, 0.12), 0.012], [0, T_(0.02, 1.81, 0.12), 0.009]]) duct(B, [from, V3(gg.x + dx + 0.05, 2.0, gg.z - 0.05), V3(gg.x + dx, 1.82, gg.z)], r, { flanges: false });
    duct(B, [V3(gg.x + 0.065, 1.62, gg.z), V3(gg.x + 0.16, 1.75, gg.z + 0.05), V3(gg.x + 0.17, 2.4, gg.z + 0.08), V3(gg.x + 0.12, top - 0.01, gg.z + 0.1)], 0.018, { bolts: 6 });   // pressurisation tap-off
    const w = valve(B, V3(gg.x + 0.08, 1.98, gg.z - 0.04), V3(0, 1, 0), 0.03); wires.push(w);
    B.flush(g);
  });
  R("lines", "Discharge lines · turbine exhaust", "Pump discharge runs to the main valves on the head; the turbine's spent gas leaves through a large duct that runs down beside the bell and dumps overboard.", [0.55, 0.95, -1.3], [["Oxidiser", "pump → main valve → dome"], ["Fuel", "pump → main valve → ring manifold"], ["Exhaust", "turbine → overboard duct"]], (g) => {
    const B = bulk(), ea = 80 * DEG;
    duct(B, [T_(-0.16, 2.2, 0), T_(-0.24, 2.36, -0.04), vOx.clone().add(polar(0.14, 62 * DEG)).add(V3(0, 0.04, 0)), vOx.clone().add(polar(0.05, 62 * DEG))], 0.045, { bellows: [0.4], bolts: 10 });
    duct(B, [T_(-0.15, 1.98, -0.06), T_(-0.22, 2.12, -0.2), vFu.clone().add(polar(0.12, 112 * DEG)).add(V3(0, 0.05, 0)), vFu.clone().add(polar(0.04, 112 * DEG))], 0.04, { bellows: [0.45], bolts: 10 });
    duct(B, [T_(0, 1.46, 0), T_(0.02, 1.3, 0.02), polar(rB(1.0) + 0.24, ea, 1.0), polar(rB(0.55) + 0.26, ea, 0.55), polar(rB(0.3) + 0.27, ea, 0.3)], 0.07, { bellows: [0.2], clamps: [0.55, 0.85], bolts: 14 });
    for (const y of [0.55, 0.9]) strut(B, polar(rB(y) + 0.2, ea, y), polar(rB(y) + 0.02, ea, y), 0.012);                       // exhaust duct brackets
    B.flush(g);
  });
  R("valves", "Main valves · water hydraulics", "The main oxidiser and fuel valves on the head open and close on water pressure: in the Viking family water is also the hydraulic fluid for the valves, piped from the water pump through a control block.", [-0.3, 1.2, 1.2], [["Main valves", "oxidiser · fuel"], ["Actuation", "water hydraulics (Viking)"]], (g) => {
    const B = bulk();
    const w1 = valve(B, vOx, polar(1, 62 * DEG).add(V3(0, -0.3, 0)), 0.06), w2 = valve(B, vFu, polar(1, 112 * DEG), 0.055);
    wires.push(w1, w2);
    add(g, boxGeo(0.16, 0.12, 0.1, cb.x, cb.y, cb.z), "light", { r: [0, 20 * DEG, 0] });
    for (let i = 0; i < 3; i++) B.add(aim(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 10), cb.clone().add(V3(-0.05 + i * 0.05, 0.075, 0)), UP), "dark");
    for (const t of [vOx, vFu]) cable(B, [cb.clone().add(V3(0, -0.04, 0)), cb.clone().lerp(t, 0.5).add(V3(0, 0.08, 0)), t.clone().add(V3(0, 0.06, 0))], 0.008, { connector: false, role: "metal", clip: 0.12 });
    cable(B, [T_(0.06, 1.83, 0.13), T_(-0.1, 2.0, 0.3), cb.clone().add(V3(0.05, -0.05, 0.03))], 0.008, { connector: false, role: "metal", clip: 0.15 });
    B.flush(g);
  });
  R("act", "Gimbal actuators", "Two actuators, at right angles, swing the engine about its gimbal bearing for pitch and yaw; on the L110 each of the two engines steers on its own.", [-1.6, 0.45, -0.7], [["Count", "2 per engine"], ["Range", "±4° on PS2"]], (g) => {
    const B = bulk();
    for (const a of act) {
      const lo = polar(rc + 0.07, a, yC + 0.05), hi = polar(0.62, a, top - 0.04), m = lo.clone().lerp(hi, 0.55);
      B.add(rodGeo(hi, m, 0.045, 16), "light"); B.add(rodGeo(m, lo, 0.022, 12), "metal");
      for (const p of [lo, hi]) B.add(new THREE.SphereGeometry(0.04, 12, 8).translate(p.x, p.y, p.z), "grey");
      const sv = hi.clone().lerp(lo, 0.2).add(polar(0.07, a + Math.PI / 2));
      B.add(new THREE.BoxGeometry(0.09, 0.08, 0.07).translate(sv.x, sv.y, sv.z), "grey");
      for (const s of [-1, 1]) cable(B, [sv.clone().add(V3(0, s * 0.03, 0)), sv.clone().add(V3(0, 0.16 + s * 0.02, 0)).add(polar(0.05, a + Math.PI / 2)), polar(0.42, a + 0.35 * s, top - 0.03)], 0.01, { connector: false, role: "grey", clip: 0.12 });
      B.add(rodGeo(hi.clone().lerp(lo, 0.65).add(polar(0.05, a - Math.PI / 2)), hi.clone().lerp(lo, 0.2).add(polar(0.05, a - Math.PI / 2)), 0.008), "dark");   // position transducer
      wires.push(sv);
    }
    B.flush(g);
  });
  R("elec", "Harness · instrumentation", "A ring harness round the chamber feeds every valve and transducer from one junction box and runs up to the stage connector on the thrust frame: chamber pressure, pump speed, valve positions, actuator positions.", [-1.35, 0.1, 1.35], [["Junction box", "1, 6 connectors (as drawn)"], ["Measured", "Pc · speed · valves · actuators"]], (g) => {
    const B = bulk(), JA = 330 * DEG, jb = polar(rc + 0.12, JA, yI - 0.25), ry = yI - 0.2;
    const ring = []; for (let i = 0; i <= 22; i++) { const a = 140 * DEG + (i / 22) * 290 * DEG; ring.push(polar(rc + 0.09, a, ry + 0.015 * Math.sin(i))); }
    bundle(B, ring, 6, 0.004, 0.013, { clamps: 0.3 });
    add(g, boxGeo(0.16, 0.12, 0.08), "light", { p: jb.toArray(), r: [0, JA, 0] });
    for (let i = 0; i < 6; i++) { const n = polar(1, JA), t = V3(n.z, 0, -n.x); B.add(aim(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 10), jb.clone().addScaledVector(n, 0.045).addScaledVector(t, -0.05 + (i % 3) * 0.05).add(V3(0, i < 3 ? 0.03 : -0.03, 0)), n), "dark"); }
    bundle(B, [polar(rc + 0.13, JA - 4 * DEG, ry + 0.06), polar(0.3, JA - 8 * DEG, yI + 0.18), polar(0.24, JA - 12 * DEG, top - 0.03)], 7, 0.004, 0.016, { clamps: 0.2 });
    for (const w of wires) { const a = Math.atan2(w.x, w.z), near = polar(rc + 0.09, a, ry); cable(B, [w, w.clone().lerp(near, 0.5).add(V3(0, 0.05, 0)), near], 0.004, { connector: false, clip: 0.1 }); }
    for (const [a, y] of [[150, yC + 0.15], [250, yC + 0.28], [20, yC + 0.1], [200, 0.6], [330, yT + 0.12]]) { const aa = a * DEG, p = sensor(B, polar(rB(y) + 0.012, aa, y), polar(1, aa), 0.012); cable(B, [p, p.clone().add(polar(0.05, aa)), polar(rc + 0.1, aa, Math.min(ry - 0.02, y + 0.25)), polar(rc + 0.09, aa, ry)], 0.004, { connector: false, clip: 0.12 }); }
    B.flush(g);
  });
}

// ---------------- CE-20 ----------------
// C25 stage. Gas-generator cycle, LH₂ / LOX; independent LH₂ and LOX turbopumps whose turbines run in series,
// a regeneratively cooled chamber, pyrogen igniters, a stored-hydrogen start system, gimbal ±4° (IAC-16-C4.1).
const DET_CE20 = { re: 0.72, rt: 0.072, yT: 1.72, yM: 1.08, rc: 0.135, yC: 1.86, yI: 2.08, half: 0.78, rotY: 28 * DEG, top: 2.44 };
function detCE20(eng, R) {
  const { re, rt, yT, yM, rc, yC, yI } = DET_CE20;
  const NZ = bellPts(re, rt, yT, 0.5), ALL = NZ.concat(chamberPts(rt, rc, yT, yC, yI).slice(1)), rB = (y) => rAt(ALL, y);
  const fp = V3(0.42, 0, -0.16), op = V3(-0.38, 0, -0.2), gg = V3(0.06, 0, -0.44), top = yI + 0.36, sb = V3(0.5, 2.14, 0.34);
  const F_ = (x, y, z) => V3(fp.x + x, y, fp.z + z), O_ = (x, y, z) => V3(op.x + x, y, op.z + z);
  const vOx = polar(0.22, 210 * DEG, yI + 0.12), vFu = polar(rB(yM) + 0.2, 125 * DEG, yM + 0.12), wires = [vOx, vFu];
  R("nz", "Nozzle extension", "The bell runs out to an area ratio of 100, sized for vacuum: at sea level the flow would separate from the wall, so flight-acceptance tests run in a high-altitude test facility; since 2024 ISRO has also fired the full 100 : 1 nozzle at sea level behind a nozzle protection system.", [0, -1.4, 0], [["Area ratio", "100 : 1"], ["Exit Ø", `≈${fmt(re * 2, 2)} m (derived from ε = 100)`], ["Tested", "high-altitude simulation · sea level since 2024"]], (g) => {
    const B = bulk();
    add(g, turn(slice(ALL, 0, yM - 0.04), { seg: 160 }), "metal", { side: DBL, map: T.ringsSPS });
    lip(B, re, 0.03);
    for (const y of [0.3, 0.68]) { hoop(B, rB(y), y, 0.045, 0.02); for (let k = 0; k < 10; k++) { const a = k * TAU / 10; B.add(aim(new THREE.BoxGeometry(0.04, 0.05, 0.025), polar(rB(y) + 0.025, a, y), polar(1, a)), "grey"); } }
    flange(B, V3(0, yM - 0.05, 0), UP, rB(yM - 0.05) - 0.01, rB(yM - 0.05) + 0.06, 0.025, 48);
    B.flush(g);
  });
  R("tca", "Thrust chamber · injector · igniter", "Liquid hydrogen from the pump enters the inlet manifold round the bell and climbs through the cooling passages in the wall to the injector, cooling the chamber on the way: LPSC calls it a regeneratively cooled thrust chamber. LOX and LH₂ do not light on contact, so a pyrogen igniter on the head starts the burn.", [0, -0.35, 0], [["Chamber pressure", "60 bar"], ["Mixture", "5.05 : 1 O/F"], ["Cooling", "regenerative, LH₂"], ["Ignition", "pyrogen igniter"]], (g) => {
    const B = bulk();
    add(g, turn(slice(ALL, yM - 0.04, yI), { seg: 160, vy: [yM, yI] }), "metal", { map: T.tubesJ2 });
    B.add(torusGeo(rB(yM) + 0.05, 0.045, 96).translate(0, yM, 0), "light");                                                    // coolant inlet manifold
    for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; B.add(aim(torusGeo(0.047, 0.006, 12), polar(rB(yM) + 0.05, a, yM), V3(Math.cos(a), 0, -Math.sin(a))), "light"); }
    flange(B, V3(0, yM - 0.035, 0), V3(0, -1, 0), rB(yM - 0.035) - 0.01, rB(yM - 0.035) + 0.06, 0.025, 48);
    for (const y of [1.35, 1.58]) hoop(B, rB(y), y, 0.035, 0.016);
    hoop(B, rB(yT), yT, 0.08, 0.026, "grey");
    for (const y of [yC + 0.05, yI - 0.04]) hoop(B, rc, y, 0.035, 0.016);
    add(g, turn([[rc + 0.02, yI], [rc + 0.02, yI + 0.05], [rc - 0.01, yI + 0.06], [rc * 0.85, yI + 0.12, 1], [rc * 0.45, yI + 0.16, 1], [0, yI + 0.17]], { seg: 64 }), "metal");
    boltCircle(B, V3(0, yI + 0.05, 0), UP, rc + 0.008, 28, 0.005, 0.009);
    const ig = polar(0.08, 30 * DEG, yI + 0.15);
    B.add(aim(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 14).translate(0, 0.06, 0), ig, V3(0.3, 1, 0.2)), "light");      // pyrogen igniter
    B.add(aim(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 14).translate(0, 0.1, 0), ig, V3(0.3, 1, 0.2)), "dark");
    wires.push(ig.clone().add(V3(0.04, 0.12, 0.03)));
    for (const a of [40, 130]) { const aa = a * DEG, p = polar(rc + 0.025, aa, yC + 0.05); B.add(aim(new THREE.BoxGeometry(0.07, 0.07, 0.05), p, polar(1, aa)), "grey"); }
    B.flush(g);
  });
  R("ftp", "LH₂ turbopump", "Hydrogen at −253 °C is light, so its pump has to spin fast and lift a large volume: the bigger of the two turbopumps, drawn under a white insulation jacket. Its turbine and the LOX pump's run in series on the gas generator's gas.", [1.5, 0.3, -0.5], [["Propellant", "LH₂ · −253 °C"], ["Turbine", "in series with the LOX turbine"]], (g) => {
    const B = bulk(), P = [fp.x, 0, fp.z];
    add(g, turn([[0, 1.6], [0.1, 1.6], [0.12, 1.66, 1], [0.12, 1.76], [0.08, 1.8], [0, 1.8]], { seg: 40 }), "light", { p: P });
    B.add(torusGeo(0.125, 0.03, 36, 5.4).translate(fp.x, 1.7, fp.z), "light");
    add(g, turn([[0, 1.8], [0.13, 1.8], [0.13, 2.1], [0.09, 2.16], [0, 2.16]], { seg: 40 }), "white", { p: P });            // insulated pump
    for (const y of [1.86, 1.98, 2.08]) B.add(torusGeo(0.132, 0.007, 36).translate(fp.x, y, fp.z), "grey");
    duct(B, [F_(0, 2.16, 0), F_(0, 2.32, 0.01), F_(-0.02, top - 0.01, 0.02)], 0.07, { bellows: [0.45], bolts: 12, role: "white" });
    duct(B, [F_(-0.12, 1.92, 0.05), F_(-0.2, 1.75, 0.2), polar(rB(yM) + 0.2, 125 * DEG, yM + 0.25), vFu.clone().add(V3(0, 0.05, 0))], 0.04, { bellows: [0.3], bolts: 10, role: "white" });
    const sp = sensor(B, F_(0.12, 1.66, 0.05), V3(1, 0, 0.3), 0.012); wires.push(sp);
    B.flush(g);
  });
  R("otp", "LOX turbopump", "The second of the two independent turbopumps, which LPSC describes as operating in series. Its discharge runs to the main oxidiser valve on the dome.", [-1.5, 0.3, -0.5], [["Propellant", "LOX · −183 °C"], ["Turbine", "in series with the LH₂ turbine"]], (g) => {
    const B = bulk(), P = [op.x, 0, op.z];
    add(g, turn([[0, 1.62], [0.1, 1.62], [0.115, 1.68, 1], [0.115, 1.78], [0.075, 1.82], [0, 1.82]], { seg: 40 }), "light", { p: P });
    B.add(torusGeo(0.12, 0.028, 36, 5.4).translate(op.x, 1.72, op.z), "light");
    add(g, turn([[0, 1.82], [0.1, 1.82], [0.12, 1.92, 1], [0.1, 2.04], [0, 2.04]], { seg: 40 }), "light", { p: P });
    B.add(torusGeo(0.12, 0.035, 36, 5.6).translate(op.x, 1.93, op.z), "light");
    boltCircle(B, O_(0, 1.97, 0), UP, 0.08, 16, 0.005, 0.008);
    duct(B, [O_(0, 2.04, 0), O_(0, 2.25, 0.01), O_(0.02, top - 0.01, 0.02)], 0.07, { bellows: [0.45], bolts: 12 });
    duct(B, [O_(0.13, 1.93, 0.05), O_(0.2, 2.06, 0.18), vOx.clone().add(V3(-0.08, 0.02, 0)), vOx.clone().add(V3(-0.03, 0, 0))], 0.035, { bellows: [0.35], bolts: 10 });
    B.flush(g);
  });
  R("gg", "Gas generator · hot-gas ducts", "A small LOX / LH₂ burner fed from the two pump outlets, lit by its own pyrogen igniter. Its gas drives the two turbines in series, then leaves through the exhaust duct beside the bell; the order of the two turbines is drawn, not published.", [0.2, -0.2, -1.6], [["Feed", "tapped from both pump outlets"], ["Turbines", "in series"], ["Ignition", "pyrogen"]], (g) => {
    const B = bulk(), P = [gg.x, 0, gg.z];
    add(g, turn([[0, 1.48], [0.03, 1.48], [0.05, 1.53, 1], [0.05, 1.7], [0.03, 1.75, 1], [0, 1.76]], { seg: 28 }), "metal", { p: P });
    B.add(aim(new THREE.CylinderGeometry(0.014, 0.016, 0.06, 10).translate(0, 0.03, 0), V3(gg.x, 1.75, gg.z), UP), "light");
    duct(B, [V3(gg.x, 1.48, gg.z), V3(gg.x + 0.12, 1.5, gg.z + 0.04), F_(-0.06, 1.62, -0.1), F_(0, 1.68, -0.12)], 0.028, { bolts: 8 });
    duct(B, [F_(0, 1.6, 0), F_(-0.05, 1.5, -0.12), O_(0.1, 1.55, -0.12), O_(0, 1.66, -0.11)], 0.032, { bolts: 8, bellows: [0.5] });   // crossover: LH₂ turbine → LOX turbine
    const ea = 205 * DEG;
    duct(B, [O_(0, 1.62, 0), O_(0.02, 1.45, 0.02), polar(rB(1.0) + 0.16, ea, 1.0), polar(rB(0.6) + 0.18, ea, 0.6)], 0.05, { bellows: [0.25], clamps: [0.6], bolts: 12 });
    for (const [from, r] of [[F_(-0.1, 1.95, -0.08), 0.009], [O_(0.1, 1.9, -0.08), 0.009]]) duct(B, [from, from.clone().lerp(V3(gg.x, 1.9, gg.z), 0.5).add(V3(0, 0.05, 0)), V3(gg.x, 1.78, gg.z)], r, { flanges: false });
    wires.push(V3(gg.x + 0.02, 1.81, gg.z));
    B.flush(g);
  });
  R("start", "Start-up system", "Hydrogen gas stored in a bottle spins both turbopumps up to speed at ignition, before the gas generator can take over: LPSC's stored-gas start-up system.", [1.1, 1.0, 1.4], [["Start gas", "stored hydrogen"], ["Spins", "both turbopumps"]], (g) => {
    const B = bulk();
    add(g, sphereGeo(0.11, sb.x, sb.y, sb.z, 32, 22), "silver");
    B.add(torusGeo(0.112, 0.008, 40).translate(sb.x, sb.y, sb.z), "grey");
    for (const [dx, dz] of [[0.08, -0.06], [-0.08, -0.06], [0, 0.1]]) strut(B, sb.clone().add(V3(dx, 0.08, dz)), V3(sb.x + dx * 1.4, top - 0.03, sb.z + dz * 1.4), 0.008);
    const sv = sb.clone().add(V3(-0.02, -0.16, -0.06));
    const w = valve(B, sv, V3(0, 1, 0), 0.03); wires.push(w);
    cable(B, [sb.clone().add(V3(0, -0.11, 0)), sv.clone().add(V3(0, 0.03, 0))], 0.01, { connector: false, role: "metal" });
    cable(B, [sv.clone().add(V3(0, -0.03, 0)), sv.clone().add(V3(-0.02, -0.25, -0.1)), F_(0.04, 1.7, 0.12)], 0.012, { connector: false, role: "metal", clip: 0.15 });
    B.flush(g);
  });
  R("ctrl", "Main valves · mixture and thrust control", "The main oxidiser valve on the dome and the main fuel valve on the hydrogen line; thrust is held by a passive control and the mixture ratio actively, by a mixture-ratio control valve. Later engines added a thrust control valve.", [-0.6, 1.0, 1.3], [["Thrust control", "passive"], ["Mixture control", "active (MRC)"]], (g) => {
    const B = bulk();
    wires.push(valve(B, vOx, V3(1, -0.4, 0.3), 0.045), valve(B, vFu, V3(0, 1, 0), 0.045));
    const mr = O_(0.18, 2.0, 0.15);
    B.add(aim(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 16), mr, V3(1, 0, 0.4)), "light");
    B.add(aim(new THREE.CylinderGeometry(0.026, 0.026, 0.07, 16), mr.clone().add(V3(0, 0.045, 0)), UP), "grey");
    for (let i = 0; i < 3; i++) B.add(torusGeo(0.027, 0.003, 14).translate(mr.x, mr.y + 0.03 + i * 0.015, mr.z), "dark");
    wires.push(mr.clone().add(V3(0, 0.09, 0)));
    B.flush(g);
  });
  R("gim", "Gimbal · actuators", "The engine hangs from its gimbal mount under the LOX tank and swings ±4° in two planes for pitch and yaw: its two actuators work at right angles, on the thrust-chamber lugs.", [-1.4, 0.6, 0.9], [["Range", "±4° · 2 planes"], ["Actuators", "2"]], (g) => {
    const B = bulk();
    add(g, boxGeo(0.18, 0.1, 0.18, 0, yI + 0.22, 0), "grey"); add(g, sphereGeo(0.05, 0, yI + 0.18, 0), "light");
    add(g, boxGeo(0.56, 0.04, 0.56, 0, top - 0.02, 0), "light"); boltCircle(B, V3(0, top + 0.002, 0), UP, 0.2, 12, 0.009, 0.014);
    for (const a of [310 * DEG, 40 * DEG]) {
      const lo = polar(rc + 0.06, a, yC + 0.05), hi = polar(0.5, a, top - 0.03), m = lo.clone().lerp(hi, 0.55);
      B.add(rodGeo(hi, m, 0.03, 14), "light"); B.add(rodGeo(m, lo, 0.016, 12), "metal");
      for (const p of [lo, hi]) B.add(new THREE.SphereGeometry(0.028, 12, 8).translate(p.x, p.y, p.z), "grey");
      const sv = hi.clone().lerp(lo, 0.2).add(polar(0.05, a + Math.PI / 2)); B.add(new THREE.BoxGeometry(0.06, 0.06, 0.05).translate(sv.x, sv.y, sv.z), "grey"); wires.push(sv);
    }
    B.flush(g);
  });
  R("elec", "Harness · instrumentation", "Igniter leads, valve commands and position switches, pump speeds and the chamber transducers, gathered round the chamber and taken up to the stage.", [-1.2, -0.1, -1.3], [["Igniters", "2 · chamber and gas generator"]], (g) => {
    const B = bulk(), ry = yI - 0.12;
    const ring = []; for (let i = 0; i <= 20; i++) { const a = 60 * DEG + (i / 20) * 300 * DEG; ring.push(polar(rc + 0.07, a, ry)); }
    bundle(B, ring, 5, 0.003, 0.01, { clamps: 0.25 });
    const jb = polar(rc + 0.1, 250 * DEG, ry - 0.06); add(g, boxGeo(0.12, 0.09, 0.07), "light", { p: jb.toArray(), r: [0, 250 * DEG, 0] });
    bundle(B, [polar(rc + 0.1, 246 * DEG, ry + 0.02), polar(0.24, 240 * DEG, yI + 0.15), polar(0.2, 235 * DEG, top - 0.03)], 6, 0.003, 0.012);
    for (const w of wires) { const a = Math.atan2(w.x, w.z), near = polar(rc + 0.07, a, ry); cable(B, [w, w.clone().lerp(near, 0.5).add(V3(0, 0.04, 0)), near], 0.003, { connector: false, clip: 0.1 }); }
    for (const [a, y] of [[150, yC + 0.1], [300, yC + 0.12], [100, yT + 0.06], [200, 1.3]]) { const aa = a * DEG, p = sensor(B, polar(rB(y) + 0.01, aa, y), polar(1, aa), 0.01); cable(B, [p, polar(rB(y) + 0.06, aa, y + 0.04), polar(rc + 0.07, aa, ry)], 0.003, { connector: false, clip: 0.1 }); }
    B.flush(g);
  });
}

// ---------------- S200 flex nozzle ----------------
// Exit 3.27 m, throat 0.886 m (ε ≈ 13.6 from these; SF also lists 12.1), nozzle 3.474 m long, part of it sunk into
// the aft dome; two electro-hydraulic actuators (40 t class, VSSC IAC-10; 294 kN, 10°/s per SF) swing it on a flex seal.
const DET_S200 = { re: LV.s200Exit, rt: 0.443, yT: 2.95, half: 1.75, rotY: 0, top: 5.5 };
function detS200(eng, R) {
  const { re, rt, yT } = DET_S200, rC = 1.6, yF = 2.72, yD = 3.3, yCase = 4.4, yCut = 5.5;
  const NZ = bellPts(re, rt, yT, 0.55), rB = (y) => rAt(NZ, y);
  const dome = [[0.92, yD], [1.18, yD + 0.18, 1], [1.4, yD + 0.45, 1], [1.54, yD + 0.75, 1], [rC, yCase]];
  const act = [-15 * DEG, 75 * DEG], yR = 1.55;
  R("noz", "Nozzle", "A 3.27 m exit and a 0.886 m throat, which make an area ratio of about 13.6; Spaceflight101, the source of both, also lists 12.1. The upper part of the nozzle is submerged inside the motor's aft dome, saving length; the exit cone's liner is built up in sections, their joints marked by the rings outside.", [0, -1.5, 0], [["Length", "3.474 m"], ["Exit Ø", "3.27 m"], ["Throat Ø", "0.886 m"], ["Area ratio", "≈13.6 from these (12.1 also listed)"]], (g) => {
    const B = bulk();
    add(g, turn([...NZ, [rt * 1.08, yT + 0.12, 1], [rt * 1.3, yT + 0.3, 1], [0.6, 3.474]], { seg: 160 }), "metal", { side: DBL });
    add(g, turn(NZ.map(([r, y, s]) => [r * 0.985, y + 0.01, s]).reverse(), { seg: 160 }), "dark");
    lip(B, re, 0.05);
    for (const y of [0.5, 1.0, 1.55, 2.1]) hoop(B, rB(y), y, 0.05, 0.022, y === yR ? "light" : "grey", 128);
    hoop(B, rB(yR), yR, 0.12, 0.05, "light", 128);                                                                         // actuator ring
    for (const a of act) { const p = polar(rB(yR) + 0.06, a, yR); B.add(aim(new THREE.BoxGeometry(0.16, 0.16, 0.12), p, polar(1, a)), "grey"); B.add(aim(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 12), p.clone().addScaledVector(polar(1, a), 0.07), polar(1, a + Math.PI / 2)), "dark"); }
    add(g, turn([[0.75, yF - 0.06], [0.94, yF - 0.06], [0.94, yF + 0.1], [0.75, yF + 0.1], [0.75, yF - 0.06]], { seg: 96 }), "light");   // fixed housing
    boltCircle(B, V3(0, yF + 0.1, 0), UP, 0.86, 40, 0.012, 0.02);
    B.flush(g);
  });
  R("fs", "Flex seal", "Alternating rings of rubber and steel shims, bonded together: the whole nozzle pivots by shearing the rubber, with no sliding joint for hot gas to leak through.", [0, 0.55, 1.9], [["Construction", "elastomer + steel shims"], ["Deflection", "±8° (VSSC, IAC-10) · ±5.5° (Spaceflight101)"]], (g) => {
    const B = bulk();
    for (let i = 0; i < 9; i++) { const y = yF + 0.12 + i * 0.05, r0 = 0.72 + i * 0.012, r1 = 0.95 + i * 0.012; B.add(turn([[r0, y], [r1, y], [r1, y + 0.048], [r0, y + 0.048], [r0, y]], { seg: 96 }), i % 2 ? "dark" : "light"); }
    B.flush(g);
  });
  R("case", "Aft segment · aft dome", "The nozzle end of the M250 steel case, cut away here: HTPB propellant (hatched) with its central port, and the aft dome whose boss carries the flex seal. The segment is 8.3 m long; the cut is just above the dome.", [0, 2.6, 0], [["Case", "M250 maraging steel · 3.2 m"], ["Propellant", "HTPB · 204.5 t per motor"], ["Segment", "nozzle end · 8.3 m"]], (g) => {
    const B = bulk();
    add(g, turn([...dome, [rC, yCut], [rC - 0.03, yCut], [rC - 0.03, yCase + 0.02], [1.37, yD + 0.75, 1], [1.12, yD + 0.25, 1], [0.92, yD + 0.08], [0.92, yD]], { seg: 128 }), "white", { inkA: 0.8 });
    add(g, new THREE.RingGeometry(0.55, rC - 0.03, 128, 1).rotateX(-Math.PI / 2).translate(0, yCut - 0.002, 0), "light", { map: T.hatch });   // section: propellant
    add(g, turn([[0.55, yCut - 0.004], [0.55, yCut - 0.3], [0, yCut - 0.3]], { seg: 64 }), "dark");                             // the port
    B.add(turn([[rC + 0.003, yCase + 0.25], [rC + 0.02, yCase + 0.27], [rC + 0.02, yCase + 0.45], [rC + 0.003, yCase + 0.47]], { seg: 128 }), "grey");   // joint land
    for (const a of act) { const p = polar(1.45, a, yD + 0.5); B.add(aim(new THREE.BoxGeometry(0.26, 0.22, 0.18), p, polar(1, a).add(V3(0, 0.8, 0))), "grey"); B.add(aim(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 12), p.clone().addScaledVector(polar(1, a), 0.04), polar(1, a + Math.PI / 2)), "dark"); }
    B.flush(g);
  });
  R("act", "Electro-hydraulic actuators", "Two actuators at right angles push on the nozzle's actuator ring to steer the booster in pitch and yaw: VSSC gives them a 40-tonne capability, Spaceflight101 294 kN at 10° per second.", [-2.1, 0.4, 0.3], [["Count", "2 per motor"], ["Force", "40 t class (VSSC) · 294 kN (SF)"], ["Rate", "10°/s (SF)"]], (g) => {
    const B = bulk();
    for (const a of act) {
      const lo = polar(rB(yR) + 0.14, a, yR), hi = polar(1.47, a, yD + 0.5), m = lo.clone().lerp(hi, 0.5), ax = hi.clone().sub(lo).normalize();
      B.add(rodGeo(hi, m, 0.1, 18), "light"); B.add(rodGeo(m, lo, 0.05, 14), "metal");
      for (const p of [lo, hi]) B.add(new THREE.SphereGeometry(0.08, 14, 10).translate(p.x, p.y, p.z), "grey");
      const sv = hi.clone().lerp(lo, 0.22).add(polar(0.14, a + Math.PI / 2)); B.add(new THREE.BoxGeometry(0.2, 0.18, 0.16).translate(sv.x, sv.y, sv.z), "grey");
      for (let i = 0; i < 3; i++) B.add(aim(torusGeo(0.104, 0.014, 24), hi.clone().lerp(lo, 0.08 + i * 0.16), ax), "grey");   // cylinder collars
      B.add(rodGeo(hi.clone().lerp(lo, 0.7).add(polar(0.12, a - Math.PI / 2)), hi.clone().lerp(lo, 0.15).add(polar(0.12, a - Math.PI / 2)), 0.016), "dark");
    }
    B.flush(g);
  });
  R("hyd", "Hydraulics · harness", "Hydraulic supply and return to each actuator's servo valve, and the harness that brings the steering commands and takes the actuator positions back.", [2.0, 0.6, 1.2], [["Per actuator", "supply · return · position"]], (g) => {
    const B = bulk(), hp = polar(1.62, 30 * DEG, yD + 0.95);
    add(g, boxGeo(0.42, 0.3, 0.3), "light", { p: hp.toArray(), r: [0, 30 * DEG, 0] });
    for (const a of act) {
      const sv = polar(1.47, a, yD + 0.5).lerp(polar(rB(yR) + 0.14, a, yR), 0.22).add(polar(0.14, a + Math.PI / 2));
      for (const s of [-1, 1]) cable(B, [hp.clone().add(V3(0, -0.1, s * 0.05)), hp.clone().lerp(sv, 0.5).add(V3(0, 0.15, 0)), sv.clone().add(V3(0, 0.09, s * 0.04))], 0.022, { connector: false, role: "grey", clip: 0.3 });
      cable(B, [sv.clone().add(V3(0, 0.05, -0.08)), sv.clone().lerp(hp, 0.5).add(V3(0, 0.3, 0)), hp.clone().add(V3(0, 0.15, 0))], 0.012);
    }
    bundle(B, [hp.clone().add(V3(0, 0.15, 0)), polar(rC + 0.08, 32 * DEG, yCase - 0.05), polar(rC + 0.04, 34 * DEG, yCase + 0.3), polar(rC + 0.04, 34 * DEG, yCut - 0.1)], 6, 0.007, 0.026, { clamps: 0.35 });
    B.flush(g);
  });
}

// ---------------- 440 N liquid apogee motor ----------------
// LPSC: MON-3 / MMH, pressure-fed; Isp 315 s at area ratio 160 (319 s at 250); 4.5 kg.
const DET_LAM = { re: PMG.lamExit, rt: PMG.lamExit / Math.sqrt(160), yT: 0.42, rc: 0.03, yC: 0.455, yI: 0.5, half: 0.16, rotY: 30 * DEG, top: 0.66 };
function detLAM(eng, R) {
  const { re, rt, yT, rc, yC, yI } = DET_LAM;
  const ALL = bellPts(re, rt, yT, 0.42).concat(chamberPts(rt, rc, yT, yC, yI).slice(1)), rB = (y) => rAt(ALL, y), top = yI + 0.16;
  R("nz", "Nozzle", "A long, thin bell: the 440 N motor flies with an area ratio of 160 for 315 s of specific impulse (319 s with the 250 : 1 version). It works only in vacuum, so all of its length goes into expanding the gas.", [0, -0.2, 0], [["Area ratio", "160 : 1"], ["Isp", "315 s (319 s at 250 : 1)"], ["Exit Ø", `≈${fmt(re * 2, 2)} m (as drawn)`]], (g) => {
    const B = bulk();
    add(g, turn(slice(ALL, 0, yT - 0.06), { seg: 96 }), "metal", { side: DBL, map: T.ringsSPS });
    lip(B, re, 0.006);
    flange(B, V3(0, yT - 0.065, 0), UP, rB(yT - 0.065) - 0.002, rB(yT - 0.065) + 0.012, 0.005, 12);
    B.flush(g);
  });
  R("ch", "Chamber · injector", "MMH and MON-3 (nitrogen tetroxide with 3 % nitric oxide) light on contact in the small chamber, so the motor needs no igniter and can fire again and again: every orbit-raising burn and the lunar captures of all three missions.", [0, 0.06, 0.12], [["Propellants", "MMH / MON-3"], ["Ignition", "hypergolic"], ["Feed", "pressure-fed"]], (g) => {
    const B = bulk();
    add(g, turn(slice(ALL, yT - 0.06, yI), { seg: 64 }), "dark");
    flange(B, V3(0, yT - 0.055, 0), V3(0, -1, 0), rB(yT - 0.055) - 0.002, rB(yT - 0.055) + 0.012, 0.005, 12);
    add(g, turn([[rc + 0.01, yI], [rc + 0.01, yI + 0.02], [rc * 0.6, yI + 0.032, 1], [0, yI + 0.036]], { seg: 32 }), "metal");
    boltCircle(B, V3(0, yI + 0.02, 0), UP, rc + 0.004, 8, 0.0018, 0.003);
    B.flush(g);
  });
  R("valves", "Propellant valves", "A fuel valve and an oxidiser valve on the injector head start and stop each burn; the lines run out to the spacecraft's two tanks.", [0.2, 0.12, 0], [["Valves", "MMH · MON-3"]], (g) => {
    const B = bulk();
    for (const s of [-1, 1]) {
      const v = V3(s * 0.03, yI + 0.07, 0);
      B.add(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 16).translate(v.x, v.y, v.z), "light");
      B.add(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 14).translate(v.x, v.y + 0.033, v.z), "dark");
      for (let i = 0; i < 3; i++) B.add(torusGeo(0.0165, 0.0015, 14).translate(v.x, v.y - 0.012 + i * 0.01, v.z), "grey");
      duct(B, [V3(v.x, v.y - 0.025, v.z), V3(v.x * 0.6, yI + 0.035, 0)], 0.006, { flanges: false });
      duct(B, [V3(v.x + s * 0.016, v.y + 0.005, v.z), V3(s * 0.08, v.y + 0.02, 0.03), V3(s * 0.14, top - 0.01, 0.06)], 0.005, { flanges: false });
    }
    B.flush(g);
  });
  R("mount", "Mount · thermal standoffs", "Three standoffs hold the motor off its mounting ring and keep the chamber's heat out of the spacecraft structure.", [0, 0.2, -0.15], [["Standoffs", "3 (as drawn)"]], (g) => {
    const B = bulk();
    add(g, turn([[0.07, top - 0.012], [0.1, top - 0.012], [0.1, top], [0.07, top], [0.07, top - 0.012]], { seg: 48 }), "light");
    boltCircle(B, V3(0, top, 0), UP, 0.085, 8, 0.002, 0.003);
    for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + 0.4; strut(B, polar(rc + 0.008, a, yI + 0.012), polar(0.085, a, top - 0.012), 0.003, "silver"); }
    B.flush(g);
  });
  R("elec", "Harness · sensors", "Valve drive and position lines, and the temperature sensors on the chamber and nozzle that the spacecraft watches during long burns.", [-0.18, 0.08, 0.1], [["Sensors", "temperature · valve position"]], (g) => {
    const B = bulk();
    for (const [a, y] of [[200, yC], [250, yT - 0.12]]) { const aa = a * DEG, p = sensor(B, polar(rB(y) + 0.002, aa, y), polar(1, aa), 0.004); cable(B, [p, polar(rB(y) + 0.03, aa, y + 0.04), polar(0.06, aa, top - 0.02)], 0.0015, { connector: false, clip: 0.04 }); }
    for (const s of [-1, 1]) cable(B, [V3(s * 0.03, yI + 0.11, 0), V3(s * 0.04, yI + 0.13, -0.03), V3(s * 0.03, top - 0.01, -0.07)], 0.002, { clip: 0.04 });
    B.flush(g);
  });
}

// ---------------- 800 N throttleable engine ----------------
// LPSC: throttleable down to 360 N through the Throttleable Engine Flow Control Valve (TFCV), driven by the
// Throttleable Engine Control Electronic Module (TECEM); MMH / MON-3.
const DET_VK = { re: VKG.engExit, rt: 0.016, yT: 0.29, rc: 0.042, yC: 0.33, yI: 0.38, half: 0.2, rotY: -30 * DEG, top: 0.54 };
function detVK800(eng, R) {
  const { re, rt, yT, rc, yC, yI } = DET_VK;
  const ALL = bellPts(re, rt, yT, 0.48).concat(chamberPts(rt, rc, yT, yC, yI).slice(1)), rB = (y) => rAt(ALL, y), top = yI + 0.16;
  const tf = V3(0.0, yI + 0.07, 0.07), te = V3(-0.17, yI + 0.08, -0.08);
  R("nz", "Nozzle", "A short bell for an engine that works in vacuum but has to land: Vikram's four 800 N engines fire straight down into the regolith in the last metres.", [0, -0.2, 0], [["Exit Ø", `≈${fmt(re * 2, 2)} m (as drawn)`]], (g) => {
    const B = bulk();
    add(g, turn(slice(ALL, 0, yT - 0.05), { seg: 96 }), "metal", { side: DBL, map: T.ringsSPS });
    lip(B, re, 0.006);
    hoop(B, rB(0.12), 0.12, 0.012, 0.005);
    flange(B, V3(0, yT - 0.055, 0), UP, rB(yT - 0.055) - 0.002, rB(yT - 0.055) + 0.012, 0.005, 12);
    B.flush(g);
  });
  R("ch", "Chamber · injector", "MMH and MON-3, hypergolic; the injector has to keep mixing them well across the whole throttle range, from 800 N down to 360 N.", [0, 0.06, -0.12], [["Thrust", "800 N · throttles to 360 N"], ["Propellants", "MMH / MON-3"]], (g) => {
    const B = bulk();
    add(g, turn(slice(ALL, yT - 0.05, yI), { seg: 64 }), "dark");
    flange(B, V3(0, yT - 0.045, 0), V3(0, -1, 0), rB(yT - 0.045) - 0.002, rB(yT - 0.045) + 0.012, 0.005, 12);
    add(g, turn([[rc + 0.012, yI], [rc + 0.012, yI + 0.022], [rc * 0.6, yI + 0.035, 1], [0, yI + 0.04]], { seg: 32 }), "metal");
    boltCircle(B, V3(0, yI + 0.022, 0), UP, rc + 0.005, 10, 0.0022, 0.0035);
    B.flush(g);
  });
  R("tfcv", "Throttle valve (TFCV)", "The Throttleable Engine Flow Control Valve meters both propellants together, so the mixture stays right as thrust changes; it is driven on command from the TECEM.", [0.05, 0.16, 0.2], [["Built by", "LPSC"], ["Range", "800 → 360 N"]], (g) => {
    const B = bulk();
    add(g, boxGeo(0.07, 0.05, 0.05, tf.x, tf.y, tf.z), "light");
    B.add(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 18).rotateZ(Math.PI / 2).translate(tf.x + 0.065, tf.y, tf.z), "grey");
    for (let i = 0; i < 4; i++) B.add(torusGeo(0.021, 0.0016, 14).rotateZ(Math.PI / 2).translate(tf.x + 0.045 + i * 0.012, tf.y, tf.z), "dark");
    B.add(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 12).rotateZ(Math.PI / 2).translate(tf.x + 0.1, tf.y, tf.z), "dark");
    for (const s of [-1, 1]) { duct(B, [V3(tf.x + s * 0.02, tf.y - 0.025, tf.z), V3(s * 0.02, yI + 0.04, 0.02), V3(s * 0.015, yI + 0.035, 0)], 0.005, { flanges: false }); duct(B, [V3(tf.x + s * 0.02, tf.y + 0.025, tf.z), V3(s * 0.05, top - 0.04, 0.09), V3(s * 0.1, top - 0.01, 0.1)], 0.005, { flanges: false }); }
    B.flush(g);
  });
  R("tecem", "Control electronics (TECEM)", "The Throttleable Engine Control Electronic Module takes the guidance computer's thrust command and drives the throttle valve. On Vikram it sits in the lander; it is drawn here beside its engine.", [-0.2, 0.08, -0.15], [["Built by", "LPSC"], ["Drives", "the TFCV"]], (g) => {
    const B = bulk();
    add(g, boxGeo(0.11, 0.07, 0.08, te.x, te.y, te.z), "light", { map: T.panelBox });
    for (let i = 0; i < 3; i++) B.add(new THREE.CylinderGeometry(0.008, 0.008, 0.016, 10).rotateZ(Math.PI / 2).translate(te.x + 0.062, te.y - 0.02 + i * 0.02, te.z), "dark");
    for (let i = 0; i < 5; i++) B.add(boxGeo(0.002, 0.06, 0.07, te.x - 0.05 + i * 0.018, te.y, te.z), "grey");
    cable(B, [V3(te.x + 0.07, te.y, te.z), V3(-0.02, yI + 0.12, 0.0), V3(tf.x + 0.1, tf.y + 0.015, tf.z)], 0.003, { clip: 0.05 });
    cable(B, [V3(te.x + 0.07, te.y + 0.02, te.z), V3(-0.12, yI + 0.14, -0.1), V3(-0.1, top - 0.01, -0.1)], 0.003, { clip: 0.05 });
    B.flush(g);
  });
  R("mount", "Mount · thermal standoffs · harness", "Three standoffs to the mounting ring under Vikram's floor, a chamber-pressure transducer and temperature sensors on the chamber, wired back past the throttle valve.", [0, 0.22, 0], [["Standoffs", "3 (as drawn)"], ["Sensors", "Pc · temperatures"]], (g) => {
    const B = bulk();
    add(g, turn([[0.08, top - 0.012], [0.12, top - 0.012], [0.12, top], [0.08, top], [0.08, top - 0.012]], { seg: 48 }), "light");
    boltCircle(B, V3(0, top, 0), UP, 0.1, 8, 0.0022, 0.0035);
    for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + 0.9; strut(B, polar(rc + 0.01, a, yI + 0.015), polar(0.1, a, top - 0.012), 0.0035, "silver"); }
    for (const [a, y] of [[200, yC], [250, yT - 0.1]]) { const aa = a * DEG, p = sensor(B, polar(rB(y) + 0.002, aa, y), polar(1, aa), 0.0045); cable(B, [p, polar(rB(y) + 0.03, aa, y + 0.04), V3(te.x + 0.05, te.y - 0.04, te.z)], 0.0016, { connector: false, clip: 0.04 }); }
    B.flush(g);
  });
}

// ---------------- the displays ----------------
const DET = {
  vikas: { key: "dVIKAS", build: detVikas, D: DET_VIKAS, eng: "VIKAS", fx: "VIKAS", gk: "xVIKAS", plume: { len: 9, sSL: 1.4, sVac: 4 }, fxo: { rmaxK: 4, dens: 2.1, diam: 0.5, flow: 30, hot: 4, soot: 0.25 }, alt: 0,
    info: { name: "Vikas", by: "LPSC · Valiamala", desc: "ISRO's workhorse liquid engine, built under licence from the Viking and developed since: two on the L110 core of LVM3, one on PSLV's second stage. Gas-generator cycle on UH25 and nitrogen tetroxide, one turbine driving three pumps, and water to cool the turbine gas and work the valves.", kv: [["Thrust", "≈766 kN vac · 677 kN SL each (L110, Spaceflight101)"], ["Isp", "293 s vac"], ["Chamber", "58.5 bar · O/F 1.7 (Spaceflight101)"], ["Area ratio", "13.99 : 1"], ["Length", "≈2.9 m"], ["Flies on", "L110 (2) · PS2 (1)"]] } },
  ce20: { key: "dCE20", build: detCE20, D: DET_CE20, eng: "CE20", fx: "H2", gk: "xCE20", plume: { len: 6, sSL: 3.2, sVac: 3.2 }, fxo: { rmaxK: 3, dens: 1.5, diam: 0.9, flow: 26, hot: 4 }, alt: 1e6,
    info: { name: "CE-20", by: "LPSC · tested at IPRC Mahendragiri", desc: "India's own cryogenic engine and the first Indian one on the gas-generator cycle: liquid hydrogen and oxygen, two independent turbopumps with their turbines in series, a regeneratively cooled chamber and a 100 : 1 nozzle. It fired for 646.5 s to put Chandrayaan-3 in its Earth parking orbit.", kv: [["Thrust", "≈186 kN vac (19 t) · 200 kN nominal"], ["Isp", "442 s vac"], ["Chamber", "60 bar · O/F 5.05"], ["Area ratio", "100 : 1"], ["Dry mass", "588 kg"], ["Gimbal", "±4° · 2 planes"]] } },
  s200: { key: "dS200", build: detS200, D: DET_S200, eng: "S200", fx: "SOLID", gk: "xS200", plume: { len: 26, sSL: 1.6, sVac: 6 }, fxo: { rmaxK: 5, dens: 2.4, diam: 0.25, flow: 30, hot: 3.5 }, alt: 0,
    info: { name: "S200 flex nozzle", by: "VSSC", desc: "The aft end of one S200 booster: the last metre of the nozzle-end segment, cut away, with the flex nozzle that steers it. Two of these motors lift LVM3 off the pad with about 5,150 kN each at their peak, steered by swivelling the whole nozzle.", kv: [["Thrust", "3,578 kN SL avg · ≈5,151 kN peak"], ["Isp", "227 s SL · 274.5 s vac"], ["Nozzle", "3.474 m · exit 3.27 m"], ["Chamber", "56.9 bar max"], ["Burn", "≈130 s (ISRO: about 134 s)"]] } },
  lam: { key: "dLAM", build: detLAM, D: DET_LAM, eng: "LAM440", fx: "HYP", gk: "xLAM", plume: { len: 1.2, sSL: 3, sVac: 3 }, fxo: { rmaxK: 5, dens: 0.9, diam: 0.2, flow: 14, hot: 4, coolK: 1.25 }, alt: 1e6,
    info: { name: "440 N liquid apogee motor", by: "LPSC", desc: "One kind of engine flew all three missions to the Moon: the 440 N motor under Chandrayaan-1, the Chandrayaan-2 orbiter and the Chandrayaan-3 propulsion module. Pressure-fed, hypergolic, and small enough to hold in two hands.", kv: [["Thrust", "440 N vac"], ["Isp", "315 s at 160 : 1"], ["Mass", "4.5 kg"], ["Propellants", "MMH / MON-3"]] } },
  vk: { key: "dVK800", build: detVK800, D: DET_VK, eng: "VK800", fx: "HYP", gk: "xVK800", plume: { len: 1.2, sSL: 3, sVac: 3 }, fxo: { rmaxK: 5, dens: 1.1, diam: 0.2, flow: 14, hot: 4, coolK: 1.3 }, alt: 1e6,
    info: { name: "800 N throttleable engine", by: "LPSC", desc: "The engine that put Vikram down: four throttleable engines (Chandrayaan-2 added a fifth, fixed-thrust central engine), throttled from 800 N down to 360 N by LPSC's flow-control valve and its electronics, all four through the braking and two for the last 800 m, so the lander could hover, pick its spot and touch down at under 1 m/s (2 m/s design limit).", kv: [["Thrust", "800 N · throttle to 360 N"], ["Propellants", "MMH / MON-3"], ["On Vikram", "4 (C-3) · 4 + 1 fixed (C-2)"], ["Control", "TFCV + TECEM"]] } },
};
const DET_CAPS = {
  dVIKAS: "Vikas on its own, drawn down to its ducts, valves and harness. Ignite fires it at the throttle and ambient pressure set below; Take apart separates its nine assemblies, and clicking an assembly zooms in on it.",
  dCE20: "The CE-20 on its own: both turbopumps, the gas generator, the start bottle, the valves and the harness. It is a vacuum engine, so it fires as in space; click an assembly to zoom in.",
  dS200: "The business end of an S200: the flex nozzle, its two actuators and the cut aft segment. Ignite fires it at the pressure set below; Take apart pulls the case, flex seal and nozzle apart.",
  dLAM: "The 440 N motor at full size, about 0.6 m from mount to exit as drawn. It fires as in vacuum.",
  dVK800: "One of Vikram's landing engines with its throttle valve and control electronics. The throttle follows the real engine: 800 N down to 360 N.",
};
const DET_GROUPS = {};
function buildDetailEngines() {
  if (!T.ringsSPS) buildShowTextures();
  const items = [];
  for (const [k, d] of Object.entries(DET)) {
    const K = d.key, root = showItem(K, d.info, { az: 32 * DEG, el: 12 * DEG });
    const eng = new THREE.Group(); eng.rotation.y = d.D.rotY; root.add(eng);
    d.build(eng, (sub, name, desc, ex, kv, fn) => within(asm(K, sub, name, desc, ex, kv, eng), fn));
    const fx = detFX(d.fx, d.D.re, d.plume.len, d.fxo); eng.add(fx);
    ENGINE_SETS[d.gk] = [{ group: eng, fx, name: d.info.name, layout: V3() }];
    const E = ENGINES[d.eng];
    DET_GROUPS[d.gk] = { set: d.gk, eng: d.eng, code: E.code, label: d.info.name, sub: E.code, alt: d.alt, apart: false, show: K, item: K, exitR: d.D.re, plume: d.plume, idle: d.info.kv[0][1] };
    SHOW[K].plumeRoom = d.plume.len;
    SHOW_CAPS[K] = DET_CAPS[K];
    items.push([K, d.info.name, { show: K, root: true, info: [K], group: d.gk, belowFiring: d.plume.len * 0.5 }]);
  }
  addMenu("Detailed engines", items);
  for (const [K, , o] of items) for (const a of SHOW[K].asm) MENU_ITEMS[a.key] = { id: a.key, label: MODULES[a.key].name, mods: [a.key], info: [a.key], show: K, parent: K, group: o.group };
}

// a detailed engine fitted to a stage or a spacecraft: the same build, its assemblies plain groups of the
// part it belongs to; o.at is the exit centre, o.skip leaves out assemblies that live elsewhere on the craft
function detEngine(parent, k, o) {
  const d = DET[k], eng = new THREE.Group(); eng.position.copy(o.at); eng.rotation.y = o.rotY ?? d.D.rotY; parent.add(eng);
  d.build(eng, (sub, n, ds, ex, kv, fn) => { if (o.skip?.includes(sub)) return; const g = new THREE.Group(); eng.add(g); fn(g); });
  const fx = detFX(o.fx ?? d.fx, d.D.re, o.plume, o); eng.add(fx);
  return { group: eng, fx };
}
