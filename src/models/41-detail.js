// ============================================================================
// 41 · FINE DETAIL — the small things that make the hardware read as built:
// harness bundles in their clips, propellant lines and valves, thrust-frame
// beams, brackets and pins, connectors, antennas, wheel cleats. Each detail is
// added inside the assembly it belongs to, so it comes apart with it.
// Placements follow ISRO's drawings and photographs; sizes are drawn to fit.
// ============================================================================
const _Y = (p, y) => p.clone().setY(y);
// a cable run in its clips; pts are [x, y, z] or Vector3
const wire = (B, pts, r = 0.007, clip = 0.16) => cable(B, pts.map((p) => (p.isVector3 ? p : V3(...p))), r, { clip });
// a round connector (shell, coupling nut, back-shell) on a surface, facing n
function connector(B, at, n, s = 0.022) {
  n = n.clone().normalize();
  B.add(aim(new THREE.CylinderGeometry(s * 1.25, s * 1.25, s * 0.35, 12).translate(0, s * 0.17, 0), at, n), "grey");
  B.add(aim(new THREE.CylinderGeometry(s, s, s * 1.1, 12).translate(0, s * 0.9, 0), at, n), "light");
  B.add(aim(new THREE.CylinderGeometry(s * 0.7, s * 0.85, s * 0.9, 10).translate(0, s * 1.9, 0), at, n), "dark");
  return at.clone().addScaledVector(n, s * 2.3);
}

// ---------------- Vikram ----------------
function detailVikram(item, o = {}) {
  const G = VKG, a = G.w, c = G.chamfer, yb = G.yb, yt = yb + G.h, P = item + ".", v3 = o.v !== 2, yd = yt + 0.035;
  // top deck: reaction wheels, harness from the dome to every unit, the umbilical connector and its cover
  within(P + "body", (g) => {
    const B = bulk();
    for (const [x, z] of [[0.02, -0.76], [0.32, -0.76], [-0.2, 0.76], [0.66, 0.78]]) {   // four reaction wheels, 10 N·m·s
      B.add(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 28).translate(x, yt + 0.06, z), "light");
      boltCircle(B, V3(x, yt + 0.1, z), UP, 0.085, 8, 0.008, 0.008);
      B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12).translate(x, yt + 0.11, z), "grey");
    }
    const base = (ang) => V3(Math.cos(ang) * (G.domeR + 0.03), yd, Math.sin(ang) * (G.domeR + 0.03));
    const runs = [
      [base(-2.4), [-0.5, yd, -0.46]],                                 // X-band antenna
      [base(-0.79), [0.42, yd, -0.44], [0.54, yd, -0.6]],              // sun sensor block
      [base(0.79), [0.48, yd, 0.48]],                                  // laser retroreflector post
      [base(2.36), [-0.5, yd, 0.5], [-0.58, yd, 0.56]],                // star sensor block
      [base(-1.57), [0.02, yd, -0.64]], [base(-1.4), [0.3, yd, -0.64]], [base(1.6), [-0.2, yd, 0.64]], [base(1.05), [0.6, yd, 0.66]],   // the wheels
      [[0.62, yd, -0.66], [0.75, yd, -0.76], [0.84, yd, -0.82]],       // on to RAMBHA-LP's boom root
    ];
    for (const r of runs) wire(B, r, 0.0065, 0.12);
    // harness looms down two chamfered corners, clipped every 15 cm
    for (const [sx, sz] of [[1, 1], [-1, -1], [1, -1]]) {
      const p = V3(sx * (a / 2 - c / 2 + 0.012), 0, sz * (a / 2 - c / 2 + 0.012)), q = V3(sx * 0.02, 0, -sz * 0.02);
      wire(B, [_Y(p, yb + 0.04), _Y(p, (yb + yt) / 2), _Y(p, yt - 0.04)], 0.011, 0.15);
      wire(B, [_Y(p.clone().add(q), yb + 0.04), _Y(p.clone().add(q), yt - 0.04)], 0.007, 0.15);
    }
    // the umbilical connector on +z, beside the ramp, under its spring-loaded protection cover
    const u = V3(0.72, yb + 0.62, a / 2 + 0.012);
    B.add(boxGeo(0.18, 0.12, 0.02, u.x, u.y, u.z), "grey");
    for (const dx of [-0.045, 0.045]) connector(B, V3(u.x + dx, u.y, u.z + 0.01), V3(0, 0, 1), 0.02);
    B.add(boxGeo(0.2, 0.012, 0.08, u.x, u.y + 0.075, u.z + 0.04), "light");                        // the cover, swung up
    B.add(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 8).rotateZ(Math.PI / 2).translate(u.x, u.y + 0.068, u.z + 0.002), "dark");   // its hinge pin
    // separation brackets where the lander sat on its adapter: four, round the thrust cylinder
    for (let k = 0; k < 4; k++) { const ang = k * TAU / 4 + TAU / 8, p = V3(Math.cos(ang) * (G.coneR + 0.06), yb - 0.04, Math.sin(ang) * (G.coneR + 0.06));
      B.add(boxGeo(0.09, 0.06, 0.09, p.x, p.y, p.z).rotateY(0), "grey"); B.add(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10).translate(p.x, p.y - 0.05, p.z), "dark"); }
    // fill-and-drain valves and a pressurant fill port on the floor
    for (const [x, z] of [[0.3, 0.42], [-0.42, -0.3]]) { valve(B, V3(x, yb - 0.05, z), V3(1, 0, 0), 0.025); B.add(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8).translate(x, yb - 0.02, z), "grey"); }
    B.flush(g);
  });
  // under the floor: the thrust frame, both propellant lines to every engine, its valves and harness
  within(P + "engines", (g) => {
    const B = bulk(), pos = [[G.engX, G.engX], [-G.engX, G.engX], [-G.engX, -G.engX], [G.engX, -G.engX]];
    if (!v3) pos.push([0, 0]);
    for (const [x, z] of pos.slice(0, 4)) {   // thrust-frame beams from the cylinder out to each engine mount
      const d = V3(x, 0, z).normalize(), r0 = G.coneR * 0.75, r1 = Math.hypot(x, z) + 0.12;
      B.add(boxGeo(0.05, 0.06, r1 - r0).translate(0, 0, (r0 + r1) / 2).rotateY(Math.atan2(d.x, d.z)).translate(0, yb - 0.05, 0), "grey");
    }
    pos.forEach(([x, z]) => {   // fuel and oxidiser lines from the frame to each engine's throttle valve, and its harness
      const top = yb - 0.04, e = V3(x, top, z), inw = V3(-x, 0, -z).normalize();
      if (!x && !z) inw.set(0, 0, -1);
      const side = V3(inw.z, 0, -inw.x);
      for (const s of [-1, 1]) duct(B, [e.clone().addScaledVector(inw, 0.34).addScaledVector(side, s * 0.05).setY(yb - 0.012), e.clone().addScaledVector(inw, 0.16).addScaledVector(side, s * 0.09).setY(top - 0.004), e.clone().addScaledVector(inw, 0.1).addScaledVector(side, s * 0.1).setY(top - 0.012)], 0.006, { flanges: false });
      wire(B, [e.clone().addScaledVector(inw, 0.02).addScaledVector(side, 0.1).setY(top - 0.012), e.clone().addScaledVector(inw, 0.22).setY(top - 0.01), e.clone().addScaledVector(inw, 0.3).setY(yb - 0.012)], 0.004, 0.08);
    });
    // feed tubes to the eight attitude thrusters
    for (let k = 0; k < 4; k++) {
      const ang = (k * 90 + 45) * DEG, d = V3(Math.cos(ang), 0, Math.sin(ang)), rr = a / 2 * Math.SQRT2 - c * 0.75;
      for (const s of [-1, 1]) { const p = V3(d.x * rr, yb + 0.12, d.z * rr).add(V3(-d.z, 0, d.x).multiplyScalar(s * 0.09));
        duct(B, [p.clone().setY(p.y + 0.04), p.clone().addScaledVector(d, -0.06).setY(yb + 0.02), p.clone().addScaledVector(d, -0.14).setY(yb - 0.01)], 0.006, { flanges: false }); }
    }
    B.flush(g);
  });
  // legs: clevis brackets and pins at the body, the touchdown-sensor cable down every main strut
  within(P + "legs", (g) => {
    const B = bulk();
    for (let k = 0; k < 4; k++) {
      const ang = (k * 90 + 45) * DEG, d = V3(Math.cos(ang), 0, Math.sin(ang)), t = V3(-d.z, 0, d.x);
      const foot = d.clone().multiplyScalar(G.legR).setY(G.padH), top = d.clone().multiplyScalar(a / 2 * Math.SQRT2 - c * 0.5).setY(yb + 0.15), mid = top.clone().lerp(foot, 0.45);
      B.add(boxGeo(0.12, 0.13, 0.1).rotateY(-ang + Math.PI / 2).translate(top.x - d.x * 0.03, top.y, top.z - d.z * 0.03), "grey");
      B.add(rodGeo(top.clone().addScaledVector(t, -0.07), top.clone().addScaledVector(t, 0.07), 0.016, 10), "dark");
      for (const s of [-1, 1]) { const root = d.clone().multiplyScalar(a / 2 * 0.9).addScaledVector(t, s * a * 0.28).setY(yb + 0.02); B.add(boxGeo(0.07, 0.06, 0.07, root.x, root.y, root.z), "grey"); }
      const off = t.clone().multiplyScalar(0.055);
      wire(B, [foot.clone().addScaledVector(t, 0.08).setY(0.08), foot.clone().add(off).setY(G.padH + 0.14), mid.clone().add(off), top.clone().add(off).setY(top.y - 0.02), top.clone().add(off).addScaledVector(d, -0.12).setY(yb + 0.06)], 0.006, 0.14);
      // radial ribs on the footpad
      for (let i = 0; i < 6; i++) { const q = i * TAU / 6; B.add(boxGeo(G.padR * 0.7, 0.012, 0.012).translate(G.padR * 0.45, 0, 0).rotateY(q).translate(foot.x, G.padH * 0.55, foot.z), "grey"); }
    }
    B.flush(g);
  });
  // landing sensors: each camera's cable into the body
  within(P + "sensors", (g) => {
    const B = bulk();
    wire(B, [[0.62, yb + 0.86, a / 2 + 0.04], [0.7, yb + 0.95, a / 2 + 0.025], [0.78, yb + 1.0, a / 2 + 0.012]], 0.005, 0.1);   // LHDAC
    for (const [x, z] of [[-0.45, 0.12], [0.12, -0.45]]) wire(B, [[x + 0.07, yb - 0.08, z], [x + 0.12, yb - 0.03, z + 0.06], [x + 0.16, yb - 0.012, z + 0.12]], 0.005, 0.1);
    if (v3) wire(B, [[-a / 2 + 0.3, yt + 0.12, a / 2 - 0.3], [-a / 2 + 0.36, yt + 0.04, a / 2 - 0.36], [-a / 2 + 0.45, yt + 0.035, a / 2 - 0.45]], 0.006, 0.1);
    B.flush(g);
  });
  // payload cables and mechanisms
  within(P + "chaste", (g) => { const B = bulk(), b = V3(a / 2 + 0.04, yb + 0.3, -a * 0.3);
    B.add(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 14).rotateZ(Math.PI / 2).translate(b.x + 0.05, b.y + 0.05, b.z), "grey");   // the drive motor
    wire(B, [[b.x - 0.02, b.y - 0.06, b.z], [b.x - 0.035, b.y - 0.14, b.z - 0.04], [b.x - 0.04, b.y - 0.2, b.z - 0.08]], 0.005, 0.1); B.flush(g); });
  within(P + "ilsa", (g) => { const B = bulk(), p = V3(-0.62, yb + 0.1, a / 2 + 0.1);
    for (let k = 0; k < 3; k++) { const q = k * TAU / 3; B.add(rodGeo(V3(p.x + Math.cos(q) * 0.05, p.y - 0.05, p.z + Math.sin(q) * 0.05), V3(p.x + Math.cos(q) * 0.08, p.y - 0.08, p.z + Math.sin(q) * 0.08), 0.006, 6), "dark"); }
    wire(B, [[p.x + 0.07, p.y + 0.02, p.z], [p.x + 0.12, yb - 0.02, p.z + 0.04], [p.x + 0.16, yb - 0.012, p.z + 0.1]], 0.005, 0.1); B.flush(g); });
  within(P + "rambha", (g) => { const B = bulk(), root = V3(a / 2 - 0.15, yt + 0.02, -a / 2 + 0.15), tip = root.clone().add(V3(0.75, 0.2, -0.75).multiplyScalar(o.stowed ? 0.25 : 1));
    const n = tip.clone().sub(root).normalize(), sd = V3().crossVectors(n, UP).normalize().multiplyScalar(0.016);
    wire(B, [root.clone().add(sd).setY(root.y + 0.06), root.clone().lerp(tip, 0.5).add(sd), tip.clone().add(sd).addScaledVector(n, -0.03)], 0.004, 0.12);
    B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 12).rotateZ(Math.PI / 2).translate(root.x, root.y + 0.07, root.z), "dark");   // hinge
    B.flush(g); });
  B_ramp(item, o);
}
// ramp treads, hinge knuckles and the release cable
function B_ramp(item, o) {
  const G = VKG, a = G.w, yb = G.yb, P = item + ".", w = G.rampW, L1 = G.rampL1, L2 = G.rampL2, z0 = a / 2 + 0.02, y0 = yb + 0.08;
  within(P + "ramp", (g) => {
    const B = bulk();
    if (o.stowed) { for (let i = 1; i < 6; i++) B.add(boxGeo(w * 0.96, 0.01, 0.012, 0, y0 + (L1 * i) / 6, z0 + 0.08), "grey"); B.flush(g); return; }
    const q1 = V3(0, G.rampMid, z0 + Math.sqrt(Math.max(0, L1 * L1 - (y0 - G.rampMid) ** 2))), q2 = V3(0, 0, q1.z + Math.sqrt(Math.max(0, L2 * L2 - G.rampMid * G.rampMid)));
    for (const [pa, pb, n] of [[V3(0, y0, z0), q1, 7], [q1, q2, 9]]) {
      const dv = pb.clone().sub(pa), rot = Math.atan2(-dv.y, dv.z);
      for (let i = 1; i < n; i++) { const p = pa.clone().lerp(pb, i / n); B.add(boxGeo(w * 0.94, 0.012, 0.025).rotateX(rot).translate(p.x, p.y + 0.02, p.z), "grey"); }   // treads
    }
    for (const s of [-1, 1]) { B.add(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 12).rotateZ(Math.PI / 2).translate(s * w * 0.42, q1.y + 0.01, q1.z), "grey"); B.add(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 12).rotateZ(Math.PI / 2).translate(s * w * 0.42, y0, z0 + 0.01), "grey"); }
    wire(B, [[w / 2 + 0.04, y0 + 0.04, z0 + 0.02], [w / 2 + 0.05, (y0 + q1.y) / 2 + 0.05, (z0 + q1.z) / 2], [w / 2 + 0.04, q1.y + 0.04, q1.z]], 0.004, 0.12);   // release cable
    B.flush(g);
  });
}

// ---------------- Pragyan ----------------
function detailPragyan(g, R, o = {}) {
  const B = bulk(), wr = R.wheelR, y0 = wr + R.bodyY;
  for (const s of [-1, 1]) {
    const x = s * (R.w / 2 + R.wheelW / 2 + 0.06);
    R.wheelZ.forEach((z) => {
      for (let k = 0; k < 14; k++) { const q = k * TAU / 14; B.add(boxGeo(R.wheelW * 0.96, 0.012, 0.016).rotateX(q).translate(x, wr + Math.cos(q) * (wr + 0.004), z + Math.sin(q) * (wr + 0.004)), "grey"); }   // cleats
      B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 14).rotateZ(Math.PI / 2).translate(x - s * (R.wheelW / 2 + 0.025), wr, z), "dark");                 // hub motor
      wire(B, [[x - s * (R.wheelW / 2 + 0.05), wr + 0.02, z], [s * (R.w / 2 + 0.05), wr + 0.07, z * 0.7], [s * (R.w / 2 - 0.02), y0 + 0.03, z * 0.4]], 0.004, 0.08);
    });
  }
  // the two antennas on the deck and the cable to the navigation cameras
  for (const [x, z] of [[0.16, -0.25], [-0.16, -0.28]]) { B.add(rodGeo(V3(x, y0 + R.h, z), V3(x, y0 + R.h + 0.16, z), 0.006, 8), "silver"); B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 16).translate(x, y0 + R.h + 0.165, z), "light"); }
  wire(B, [[0, y0 + R.h + 0.01, R.l / 2 - 0.12], [0.02, y0 + R.h + 0.06, R.l / 2 - 0.1], [0.02, y0 + R.h + 0.12, R.l / 2 - 0.08]], 0.004, 0.06);
  if (!o.stowed) B.add(rodGeo(V3(-R.w / 2 + 0.05, y0 + R.h + 0.02, 0.18), V3(-R.w / 2 + 0.02 + Math.cos(R.panelAng) * 0.12, y0 + R.h + 0.02 + Math.sin(R.panelAng) * 0.12, 0.18), 0.008, 8), "silver");   // panel hold-open strut
  B.flush(g);
}

// ---------------- Chandrayaan-3 propulsion module ----------------
function detailPM(item) {
  const G = PMG, P = item + ".", y1 = -G.ima, y0 = y1 - G.h, a = G.w, d = G.d;
  within(P + "pmBody", (g) => {
    const B = bulk();
    // harness looms down the two chamfered corners on −x
    for (const sz of [-1, 1]) { const p = V3(-a / 2 + 0.05, 0, sz * (d / 2 - 0.05)); wire(B, [_Y(p, y0 + 0.06), _Y(p, (y0 + y1) / 2), _Y(p, y1 - 0.05)], 0.012, 0.15); }
    // top deck: harness from the adapter's foot over the edge to the star sensor and the TTC antennas, the separation umbilical
    const ring = (q) => V3(Math.cos(q) * (G.imaR0 + 0.07), y1 + 0.03, Math.sin(q) * (G.imaR0 + 0.07));
    wire(B, [ring(2.4), [-a / 2 + 0.2, y1 + 0.03, d / 2 - 0.25], [-a / 2 - 0.01, y1 - 0.02, d / 2 - 0.25], [-a / 2 - 0.03, y1 - 0.1, d / 2 - 0.22]], 0.007, 0.12);
    for (const sz of [-1, 1]) wire(B, [ring(sz > 0 ? 1.9 : -1.9), [-0.25, y1 + 0.03, sz * (d / 2 - 0.08)], [-0.25, y1 - 0.02, sz * (d / 2 + 0.012)], [-0.2, y1 - 0.15, sz * (d / 2 + 0.03)]], 0.006, 0.1);
    { const u = V3(G.imaR0 + 0.12, y1 + 0.03, -0.25); B.add(boxGeo(0.12, 0.05, 0.1, u.x, u.y, u.z), "grey"); connector(B, V3(u.x, u.y + 0.025, u.z), UP, 0.02); }
    // fill and drain valves for both propellants on the −z face, and the pressurant's
    for (let i = 0; i < 3; i++) { const q = V3(0.25 + i * 0.16, y0 + 0.25, -d / 2 - 0.02); B.add(boxGeo(0.1, 0.1, 0.03, q.x, q.y, q.z), "grey"); B.add(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 12).rotateX(Math.PI / 2).translate(q.x, q.y, q.z - 0.035), "light"); B.add(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 12).rotateX(Math.PI / 2).translate(q.x, q.y, q.z - 0.062), "dark"); }
    // feed lines from the tanks out through the floor to the engine's valves, each with a latch valve and a filter
    for (const s of [-1, 1]) {
      const v = V3(s * 0.2, y0 - 0.06, 0.18);
      valve(B, v, V3(0, 0, 1), 0.03);
      duct(B, [V3(s * 0.2, y0 + 0.002, 0.3), v.clone().add(V3(0, 0, 0.06))], 0.01, { flanges: false });
      duct(B, [v.clone().add(V3(0, 0, -0.05)), V3(s * 0.16, y0 - 0.07, 0.05), V3(s * 0.12, y0 - 0.02, 0.02)], 0.009, { flanges: false });
      B.add(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 14).rotateX(Math.PI / 2).translate(s * 0.2, y0 - 0.06, 0.28), "light");   // filter
    }
    B.flush(g);
  });
  within(P + "pmPanel", (g) => { const B = bulk(), px = a / 2 + 0.07;
    wire(B, [[a / 2 + 0.02, y0 + 0.2, -G.panelW * 0.45], [px - 0.025, y0 + 0.3, -G.panelW * 0.47], [px - 0.025, y0 + G.panelH * 0.8, -G.panelW * 0.47]], 0.007, 0.15); B.flush(g); });
  within(P + "shape", (g) => { const B = bulk(), p = V3(-a / 2 - 0.13, y0 + G.h * 0.6, 0.32);
    wire(B, [[p.x + 0.04, p.y - 0.1, p.z - 0.1], [-a / 2 - 0.1, p.y - 0.22, p.z - 0.1], [-a / 2 - 0.16, p.y - 0.24, p.z - 0.03]], 0.005, 0.08);
    wire(B, [[-a / 2 - 0.02, p.y - 0.3, p.z + 0.02], [-a / 2 - 0.02, p.y - 0.45, p.z + 0.12], [-a / 2 - 0.02, y0 + 0.2, d / 2 - 0.1]], 0.006, 0.1); B.flush(g); });
}

// ---------------- Chandrayaan-2 orbiter ----------------
function detailOrbiter2(item) {
  const G = O2G, P = item + ".", a = G.w, d = G.d, y0 = -G.h, y1 = 0;
  within(P + "o2Body", (g) => {
    const B = bulk();
    for (const [sx, sz] of [[-1, 1], [-1, -1], [1, -1]]) { const p = V3(sx * (a / 2 + 0.012), 0, sz * (d / 2 - 0.06)); wire(B, [_Y(p, y0 + 0.08), _Y(p, (y0 + y1) / 2), _Y(p, y1 - 0.06)], 0.012, 0.15); }
    // the propellant lines, latch valves and eight 22 N thrusters underneath
    for (const s of [-1, 1]) { const v = V3(s * 0.24, y0 - 0.07, -0.1); valve(B, v, V3(1, 0, 0), 0.035);
      duct(B, [V3(s * 0.36, y0 - 0.005, -0.18), v.clone().setY(y0 - 0.03), v], 0.014, { flanges: false }); duct(B, [v, V3(s * 0.07, y0 - 0.1, -0.05), V3(s * 0.05, y0 - 0.14, -0.02)], 0.012, { flanges: false }); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const k of [0, 1]) {
      const p = V3(sx * (a / 2 - 0.1 - k * 0.15), y0 + 0.05, sz * (d / 2 - 0.1 - (1 - k) * 0.15)), dir = V3(sx * (k ? 0.2 : 1), -0.6, sz * (k ? 1 : 0.2)).normalize();
      B.add(aim(turn([[0.011, 0], [0.024, -0.06], [0.022, -0.06], [0.009, 0]], { seg: 12 }), p, dir.clone().negate()), "metal"); B.add(boxGeo(0.045, 0.045, 0.045, p.x, p.y + 0.02, p.z), "grey");
      duct(B, [p.clone().setY(p.y + 0.04), p.clone().multiplyScalar(0.9).setY(y0 + 0.01), p.clone().multiplyScalar(0.75).setY(y0 - 0.005)], 0.005, { flanges: false });
    }
    // harness from the bottom deck to each instrument
    for (const [x, z] of [[0.35, 0.1], [-0.5, 0.3], [-0.2, -0.35], [0.5, -0.4]]) wire(B, [[x * 0.4, y0 - 0.012, z * 0.4], [x * 0.75, y0 - 0.02, z * 0.75], [x, y0 - 0.05, z]], 0.006, 0.12);
    B.flush(g);
  });
  within(P + "o2Hga", (g) => { const B = bulk(), root = V3(-a / 2, y0 + 0.3, -d / 2 + 0.3), elbow = root.clone().add(V3(-0.55, -0.3, 0));
    const sd = V3(0, 0, 0.04); wire(B, [root.clone().add(sd), root.clone().lerp(elbow, 0.5).add(sd), elbow.clone().add(sd).add(V3(0, 0.03, 0))], 0.007, 0.1);
    B.add(boxGeo(0.1, 0.12, 0.1, elbow.x, elbow.y + 0.04, elbow.z), "grey"); B.flush(g); });   // gimbal drive
  within(P + "o2Panel", (g) => { const B = bulk(), yc = y0 + G.h / 2; wire(B, [[a / 2 + 0.02, yc - 0.1, 0.05], [a / 2 + 0.25, yc - 0.12, 0.05], [a / 2 + 0.5, yc - 0.15, 0.05]], 0.008, 0.1); B.flush(g); });
  within(P + "o2Eng", (g) => { const B = bulk(); B.add(turn([[0.1, y0 - 0.04], [0.24, y0 - 0.04], [0.24, y0 - 0.05], [0.1, y0 - 0.05]], { seg: 32 }), "light"); boltCircle(B, V3(0, y0 - 0.05, 0), V3(0, -1, 0), 0.2, 10, 0.006, 0.008); B.flush(g); });
}

// ---------------- Chandrayaan-1 ----------------
function detailC1(item, o = {}) {
  const G = O1G, P = item + ".", w = G.w, d = G.d, y0 = 0, y1 = G.h, yc = G.cylTop;
  within(P + "c1Body", (g) => {
    const B = bulk(), px = w / 2 + 0.022;
    // the payload panel's harness: a main trunk with a branch to every instrument connector
    wire(B, [[px, 0.1, -0.62], [px, 0.55, -0.64], [px, 1.0, -0.64], [px, 1.45, -0.6]], 0.012, 0.14);
    for (const [y, z] of [[1.2, -0.4], [1.22, 0.02], [1.24, 0.4], [0.74, -0.42], [0.72, 0.04], [0.74, 0.42], [0.28, -0.25]]) wire(B, [[px, y - 0.14, -0.62], [px + 0.01, y - 0.13, (z - 0.62) / 2], [px + 0.012, y - 0.12, z]], 0.005, 0.1);
    // the propellant lines to the engine, with latch valves
    for (const s of [-1, 1]) { const v = V3(s * 0.2, y0 - 0.06, 0.1); valve(B, v, V3(1, 0, 0), 0.03);
      duct(B, [V3(s * 0.3, y0 - 0.025, 0.16), v.clone().setY(y0 - 0.035), v], 0.012, { flanges: false }); duct(B, [v, V3(s * 0.05, y0 - 0.1, 0.05), V3(s * 0.04, y0 - 0.13, 0.02)], 0.01, { flanges: false }); }
    // feed tubes to the eight thrusters
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) duct(B, [V3(sx * (w / 2 - 0.12), y0 + 0.09, sz * (d / 2 - 0.12)), V3(sx * (w / 2 - 0.2), y0 + 0.02, sz * (d / 2 - 0.2)), V3(sx * 0.35, y0 - 0.012, sz * 0.35)], 0.006, { flanges: false });
    // the impact probe's umbilical, down the cylinder from its deck
    wire(B, [[0.24, yc + 0.03, 0.12], [G.cylR + 0.02, yc - 0.06, 0.1], [G.cylR + 0.015, y1 + 0.1, 0.1], [G.cylR + 0.08, y1 + 0.035, 0.12]], 0.008, 0.12);
    B.flush(g);
  });
  within(P + "c1Hga", (g) => { const B = bulk(), base = V3(-w / 2, y0 + (y1 - y0) * 0.62, 0.15);
    wire(B, [[base.x, base.y - 0.17, base.z + 0.1], [base.x - 0.16, base.y - 0.17, base.z + 0.1], [base.x - 0.32, base.y - 0.12, base.z + 0.1], [base.x - 0.42, base.y - 0.04, base.z + 0.04]], 0.007, 0.1); B.flush(g); });
  if (!o.stowed) within(P + "c1Panel", (g) => { const B = bulk(), yc0 = y0 + (y1 - y0) * 0.55;
    wire(B, [[0.05, yc0 + 0.1, d / 2 + 0.02], [0.05, yc0 + 0.12, d / 2 + 0.25], [0.02, yc0 + 0.06, d / 2 + 0.5]], 0.008, 0.1); B.flush(g); });
  within(P + "c1Eng", (g) => { const B = bulk(); B.add(turn([[0.08, y0 - 0.1], [0.2, y0 - 0.1], [0.2, y0 - 0.11], [0.08, y0 - 0.11]], { seg: 32 }), "light"); boltCircle(B, V3(0, y0 - 0.11, 0), V3(0, -1, 0), 0.16, 10, 0.006, 0.008); B.flush(g); });
}

// ---------------- LVM3 ----------------
function detailLVM3() {
  const R = LV.coreR;
  // L110: the thrust frame across the engine bay and the two main feed ducts to each Vikas's pumps
  within("l110", (g) => {
    const B = bulk();
    for (const z of [-0.55, 0.55]) B.add(boxGeo(LV.vikasX * 2 + 0.7, 0.18, 0.14, 0, 0.62, z), "grey");
    for (const x of [-LV.vikasX, LV.vikasX]) B.add(boxGeo(0.16, 0.18, 1.4, x, 0.62, 0), "grey");
    for (const s of [-1, 1]) for (const dz of [-0.32, 0.32]) duct(B, [[s * 0.35, 1.0, dz], [s * 0.55, 0.78, dz * 1.1], [s * (LV.vikasX - 0.05), 0.62, dz * 0.6]], 0.075, { bolts: 10 });
    // the cable tunnel's feed-throughs and the harness down into the bay
    for (const a of [0, Math.PI]) { const d = V3(Math.cos(a), 0, Math.sin(a)); wire(B, [d.clone().multiplyScalar(R - 0.12).setY(1.4), d.clone().multiplyScalar(R - 0.4).setY(0.95), d.clone().multiplyScalar(0.6).setY(0.7)], 0.03, 0.3); }
    B.flush(g);
  });
  within("c25", (g) => {
    const B = bulk(), L = LV.c25Len;
    for (const a of [0.3, Math.PI + 0.3]) B.add(boxGeo(0.2, L - LV.c25Inter - 1.4, 0.14).translate(0, (L + LV.c25Inter) / 2 - 0.2, R + 0.06).applyMatrix4(new THREE.Matrix4().makeRotationY(a)), "light");   // cable tunnels
    B.flush(g);
  });
}

// ---------------- PSLV-XL ----------------
function detailPSLV(item) {
  const G = PV, R = G.ps1R, P = item + ".";
  // PS1: secondary-injection lines from the two strontium-perchlorate tanks down to the nozzle's injectors
  within(P + "ps1", (g) => {
    const B = bulk(), k = Math.SQRT1_2;
    for (const s of [-1, 1]) {
      const t = V3(s * (R + 0.34) * k, 1.0, s * (R + 0.34) * k), d = V3(s * k, 0, s * k);
      duct(B, [t, t.clone().setY(0.4).addScaledVector(d, -0.1), d.clone().multiplyScalar(R * 0.75).setY(0.05), d.clone().multiplyScalar(G.ps1Exit * 0.7).setY(-0.6)], 0.05, { flanges: false });
      for (let i = 0; i < 6; i++) { const q = i * TAU / 6 + (s > 0 ? 0 : TAU / 12); valve(B, V3(Math.cos(q) * G.ps1Exit * 0.62, -0.75, Math.sin(q) * G.ps1Exit * 0.62), V3(Math.cos(q), 0, Math.sin(q)), 0.06); }
    }
    for (const a of [Math.PI / 2, -Math.PI / 2]) B.add(boxGeo(0.18, G.ps1Len - 1.6, 0.12).translate(0, G.ps1Len / 2 + 0.5, R + 0.06).applyMatrix4(new THREE.Matrix4().makeRotationY(a)), "light");   // raceways
    B.flush(g);
  });
  // PS4: feed lines from the tanks to both engines
  within(P + "ps4", (g) => {
    const B = bulk(), y = (() => { const HS = G.ps1Len + G.ps2Len + G.ps3Len - 0.2; return HS + 0.4; })();
    for (const s of [-1, 1]) for (const dz of [-0.08, 0.08]) duct(B, [[s * 0.08, y + 0.32, dz], [s * G.ps4X * 0.8, y + 0.2, dz * 1.5], [s * G.ps4X, y + 0.36 - 0.05, dz]], 0.018, { flanges: false });
    B.flush(g);
  });
}

// ============================================================================
// ENGINES IN FULL — every engine is drawn down to its plumbing. engine() builds
// the chamber and bell, then engineDetail() adds what that kind of engine
// carries, in the engine's own frame (exit plane at y = 0, injector at y = len):
//   vikas  gas-generator turbopump beside the chamber, gas generator, turbine
//          exhaust, both main valves, feed ducts with bellows, gimbal hydraulics
//   ce20   separate LH₂ and LOX turbopumps, gas generator, regeneratively
//          cooled chamber and nozzle (cooling tubes, inlet manifold), insulation
//   flex   flex-seal laminate, actuator ring, two actuators at 90°, hydraulic
//          power unit and hoses (S200, HPS3)
//   sitvc  fixed nozzle with the secondary-injection manifold and its valves (S139)
//   fixed  canted fixed nozzle with its attach bolts and liner joints (PSOM-XL)
//   ps4    pressure-fed engine: valve block, inlet lines, gimbal bracket
//   lam    440 N: twin solenoid valves, inlets, thermal standoffs, heater wires
//   vk800  800 N throttleable: as lam, plus the throttle valve and its stepper motor
// ============================================================================
const bellR = (o, y) => { const L = o.len, re = o.exitR, rt = o.throatR ?? re * 0.28, k = o.bellK ?? 0.62, s = clamp(1 - y / (L * k), 0, 1); return rt + (re - rt) * Math.pow(s, o.bellPow ?? 0.62); };
function engine(g, kind, o) {
  const e = engineBell(g, { ...o, pumps: false });
  engineDetail(e.group, kind, o);
  return e;
}
function engineDetail(g, kind, o) {
  const B = bulk(), L = o.len, re = o.exitR, rt = o.throatR ?? re * 0.28, rc = o.chamberR ?? re * 0.5, k = o.bellK ?? 0.62, yT = L * k, yC0 = L * (k + 0.08), yC1 = L * 0.92;
  const ring = (y, r, t, role = "grey") => B.add(torusGeo(r, t, 48).translate(0, y, 0), role);
  const tubeAlong = (ang, y0, y1, rr, role = "metal") => { const pts = []; for (let i = 0; i <= 16; i++) { const y = lerp(y0, y1, i / 16), r = (y < yT ? bellR(o, y) : y < yC0 ? lerp(rt, rc, (y - yT) / (yC0 - yT)) : rc) + rr; pts.push(V3(Math.cos(ang) * r, y, Math.sin(ang) * r)); } B.add(new THREE.TubeGeometry(curveOf(pts), 24, rr, 4, false), role); };
  const sz = Math.max(0.004, rc * 0.04);   // harness size for this engine
  if (kind === "vikas" || kind === "ce20") {
    // injector dome and the chamber's jacket rings
    B.add(turn([[rc * 0.98, yC1], [rc * 0.88, L * 0.985], [rc * 0.55, L * 1.035], [rc * 0.2, L * 1.06], [0, L * 1.065]], { seg: 48 }), "metal");
    for (const y of [yC0, (yC0 + yC1) / 2, yC1]) ring(y, rc * 1.015, rc * 0.035);
    // the cooling: an inlet manifold round the nozzle and the tube wall from there to the injector
    const yM = yT * (kind === "ce20" ? 0.42 : 0.55), rM = bellR(o, yM);
    ring(yM, rM + rc * 0.1, rc * 0.1, "light");
    const nT = kind === "ce20" ? 40 : 28;
    for (let i = 0; i < nT; i++) tubeAlong((i / nT) * TAU, yM, yC1, Math.max(0.004, (TAU * rc) / nT / 2.4));
    for (let i = 0; i < 4; i++) sensor(B, V3(Math.cos(i * 1.57 + 0.4) * rc * 1.04, (yC0 + yC1) / 2, Math.sin(i * 1.57 + 0.4) * rc * 1.04), V3(Math.cos(i * 1.57 + 0.4), 0, Math.sin(i * 1.57 + 0.4)), rc * 0.06);
    // turbopump(s): pump volute over the turbine, inlet from above through bellows, discharge to the injector and the manifold
    const pumps = kind === "ce20" ? [[1, 1.0, "LH₂"], [-1, 0.78, "LOX"]] : [[1, 1.0, ""]];
    for (const [s, sc] of pumps) {
      const p = V3(s * rc * 2.25, yC0 + L * 0.02, s * rc * 0.35), rp = rc * 0.55 * sc, hp = L * 0.12 * sc;
      B.add(new THREE.CylinderGeometry(rp, rp, hp, 32).translate(p.x, p.y + hp / 2, p.z), "light");                       // pump housing
      B.add(torusGeo(rp * 1.08, rp * 0.22, 32).translate(p.x, p.y + hp * 0.45, p.z), "light");                            // volute
      B.add(new THREE.CylinderGeometry(rp * 0.8, rp * 0.9, L * 0.1 * sc, 28).translate(p.x, p.y - L * 0.05 * sc, p.z), "metal");   // turbine
      for (const dy of [hp, 0, -L * 0.1 * sc]) flange(B, V3(p.x, p.y + dy, p.z), UP, rp * 0.8, rp * 1.08, rp * 0.08, 16);
      if (kind === "ce20" && s > 0) B.add(new THREE.CylinderGeometry(rp * 1.18, rp * 1.18, hp * 0.9, 28, 1, true).translate(p.x, p.y + hp * 0.5, p.z), "white");   // LH₂ pump under insulation
      // inlet from the stage above: a duct with a bellows section
      const inl = [[p.x, p.y + hp, p.z], [p.x, L * 1.2, p.z], [p.x * 0.8, L * 1.45, p.z * 0.6]];
      duct(B, inl, rp * 0.36, { bolts: 10 });
      for (let i = 0; i < 5; i++) B.add(torusGeo(rp * 0.42, rp * 0.05, 20).translate(p.x, L * (1.24 + i * 0.03), p.z), "grey");
      // discharge: one line to the injector dome through the main valve, one to the cooling manifold
      const vv = V3(p.x * 0.55, L * 1.0, p.z * 0.5);
      duct(B, [[p.x - s * rp * 0.9, p.y + hp * 0.45, p.z], vv, [s * rc * 0.4, L * 1.04, 0]], rp * 0.24, { bolts: 8 });
      valve(B, vv, V3(1, 0, 0), rp * 0.3);
      duct(B, [[p.x, p.y + hp * 0.2, p.z - s * rp * 0.9], [p.x * 0.9, yM + L * 0.15, p.z * 1.4 - s * rp], [s * (rM + rc * 0.1) * 0.7, yM, s * (rM + rc * 0.1) * 0.72]], rp * 0.2, { flanges: false });
    }
    // gas generator: its chamber, its two feeds and the hot-gas line into the turbine
    const gg = V3(rc * 1.9, yC0 - L * 0.12, -rc * 0.9);
    B.add(new THREE.CylinderGeometry(rc * 0.2, rc * 0.2, L * 0.12, 20).translate(gg.x, gg.y, gg.z), "metal");
    B.add(new THREE.ConeGeometry(rc * 0.2, L * 0.05, 20).rotateX(Math.PI).translate(gg.x, gg.y - L * 0.085, gg.z), "metal");
    duct(B, [[gg.x, gg.y - L * 0.11, gg.z], [gg.x + rc * 0.2, gg.y - L * 0.14, gg.z + rc * 0.4], [rc * 2.25, yC0 - L * 0.08, rc * 0.35]], rc * 0.09, { flanges: false });
    for (const dz of [-0.12, 0.12]) duct(B, [[gg.x + dz * rc, gg.y + L * 0.06, gg.z], [gg.x + dz * rc * 2, gg.y + L * 0.18, gg.z + rc * 0.3], [rc * 1.8, yC0 + L * 0.08, rc * 0.2]], rc * 0.045, { flanges: false });
    // turbine exhaust: down beside the nozzle (Vikas) or into the nozzle wall below the manifold (CE-20)
    const ex = kind === "ce20" ? [[rc * 2.25, yC0 - L * 0.1, rc * 0.35], [rc * 2.0, yM + L * 0.05, rc * 0.5], [(rM + rc * 0.2) * 0.92, yM - L * 0.06, (rM + rc * 0.2) * 0.38]]
                               : [[rc * 2.25, yC0 - L * 0.1, rc * 0.35], [rc * 2.3, yT * 0.6, rc * 0.5], [rc * 2.2, yT * 0.25, rc * 0.4]];
    duct(B, ex, rc * 0.2, { bolts: 10 });
    // gimbal hydraulics: a power unit by the gimbal block and its hoses to both actuators
    const hpu = V3(-rc * 1.5, L * 1.08, rc * 1.1);
    B.add(boxGeo(rc * 0.7, rc * 0.4, rc * 0.5, hpu.x, hpu.y, hpu.z), "grey");
    for (const s of [-1, 1]) wire(B, [[hpu.x, hpu.y - rc * 0.2, hpu.z], [s * rc * 1.4, L * 1.02, rc * 0.6 * s], [s * rc * 1.55, L * 1.0, rc * 0.5 * s]], sz * 1.4, rc * 0.4);
    // harness from the top to the valves, the gas generator and the chamber sensors
    wire(B, [[-rc * 0.6, L * 1.12, -rc * 0.6], [-rc * 1.05, (yC0 + yC1) / 2, -rc * 0.75], [-rc * 1.05, yC0, -rc * 0.4], [gg.x * 0.6, gg.y + L * 0.05, gg.z * 0.9]], sz, rc * 0.5);
    wire(B, [[rc * 0.2, L * 1.12, -rc * 0.6], [rc * 1.1, (yC0 + yC1) / 2, -rc * 0.5], [rc * 1.1, yM + rc * 0.2, -rc * 0.3]], sz, rc * 0.5);
  } else if (kind === "flex" || kind === "sitvc" || kind === "fixed") {
    // liner joints in the exit cone and the attach bolts at the top
    for (const s of [0.2, 0.45, 0.7]) ring(yT * s, bellR(o, yT * s) + re * 0.004, re * 0.012, "grey");
    boltCircle(B, V3(0, L * 0.98, 0), UP, rc * 1.02, 24, Math.max(0.008, rc * 0.035), Math.max(0.01, rc * 0.05));
    if (kind === "flex") {
      // the flex seal: alternating elastomer and steel shims round the nozzle's pivot
      for (let i = 0; i < 7; i++) { const y = yT + L * (0.05 + i * 0.016); B.add(turn([[rc * (i % 2 ? 0.98 : 1.04), y], [rc * (i % 2 ? 0.98 : 1.04), y + L * 0.014]], { seg: 48 }), i % 2 ? "dark" : "light"); }
      const yb = yT * 0.62, rb = bellR(o, yb), mY = o.mountY ?? L * 0.95, mR = o.mountR ?? rc * 1.25;
      ring(yb, rb + re * 0.03, re * 0.03, "light");                                 // actuator ring
      for (const a of [0, Math.PI / 2]) {                                               // pitch and yaw actuators
        const lo = V3(Math.cos(a) * (rb + re * 0.05), yb, Math.sin(a) * (rb + re * 0.05)), hi = V3(Math.cos(a) * mR, mY, Math.sin(a) * mR);
        strut(B, lo, hi, Math.max(0.02, re * 0.05), "light");
        B.add(aim(new THREE.CylinderGeometry(re * 0.075, re * 0.075, lo.distanceTo(hi) * 0.45, 16).translate(0, lo.distanceTo(hi) * 0.62, 0), lo, hi.clone().sub(lo)), "grey");   // the cylinder body
        const h = V3(Math.cos(a + 0.6) * mR * 1.05, mY - L * 0.05, Math.sin(a + 0.6) * mR * 1.05);
        wire(B, [hi.clone().lerp(lo, 0.25), hi.clone().lerp(lo, 0.1).add(V3(0, 0, 0)).multiplyScalar(1.04), h], Math.max(0.006, re * 0.014), re * 0.3);
      }
      const hp = V3(Math.cos(0.8) * mR * 1.05, mY - L * 0.05, Math.sin(0.8) * mR * 1.05);
      B.add(boxGeo(re * 0.35, re * 0.22, re * 0.3, hp.x, hp.y, hp.z), "grey");   // hydraulic power unit
    } else if (kind === "sitvc") {
      // the injectant manifold and its twelve injection valves, fed from the two tanks
      const yI = yT * 0.55, rI = bellR(o, yI);
      ring(yI, rI + re * 0.09, re * 0.035, "light");
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12, d = V3(Math.cos(a), 0, Math.sin(a)); valve(B, d.clone().multiplyScalar(rI + re * 0.06).setY(yI), d, re * 0.04); }
      for (const a of [Math.PI / 4, Math.PI * 1.25]) duct(B, [[Math.cos(a) * (rI + re * 0.1), yI, Math.sin(a) * (rI + re * 0.1)], [Math.cos(a) * rc * 1.6, L * 0.75, Math.sin(a) * rc * 1.6], [Math.cos(a) * rc * 1.9, L * 1.05, Math.sin(a) * rc * 1.9]], re * 0.03, { flanges: false });
    } else ring(L * 0.9, rc * 1.06, rc * 0.05, "light");   // thermal boot at the fixed joint
  } else {
    // small engines: injector head, valves and inlet lines, mount, harness
    const head = L * 1.0, s = re;
    B.add(new THREE.CylinderGeometry(rc * 1.15, rc * 1.15, L * 0.06, 24).translate(0, head + L * 0.03, 0), "grey");          // injector flange
    boltCircle(B, V3(0, head + L * 0.06, 0), UP, rc * 0.95, 8, Math.max(0.003, rc * 0.06), Math.max(0.004, rc * 0.08));
    const vY = head + L * 0.16;
    for (const sx of [-1, 1]) {                                                                                            // fuel and oxidiser valves
      B.add(new THREE.CylinderGeometry(rc * 0.42, rc * 0.42, L * 0.2, 18).translate(sx * rc * 0.55, vY, 0), "light");
      B.add(new THREE.CylinderGeometry(rc * 0.3, rc * 0.3, L * 0.05, 14).translate(sx * rc * 0.55, vY + L * 0.12, 0), "dark");
      duct(B, [[sx * rc * 0.55, vY + L * 0.14, 0], [sx * rc * 0.9, vY + L * 0.3, rc * 0.2], [sx * rc * 1.6, vY + L * 0.42, rc * 0.4]], Math.max(0.003, rc * 0.12), { flanges: false });
      B.add(torusGeo(rc * 0.45, Math.max(0.0015, rc * 0.03), 18).translate(sx * rc * 0.55, vY - L * 0.04, 0), "dark");     // heater wire wrap
      B.add(torusGeo(rc * 0.45, Math.max(0.0015, rc * 0.03), 18).translate(sx * rc * 0.55, vY + L * 0.02, 0), "dark");
    }
    if (kind === "vk800") {                                                                                                // throttle valve and its stepper motor
      B.add(new THREE.CylinderGeometry(rc * 0.35, rc * 0.35, L * 0.22, 18).rotateZ(Math.PI / 2).translate(0, vY + L * 0.02, rc * 0.75), "light");
      B.add(new THREE.CylinderGeometry(rc * 0.3, rc * 0.3, L * 0.16, 16).rotateZ(Math.PI / 2).translate(rc * 0.5, vY + L * 0.02, rc * 0.75), "dark");
      for (let i = 0; i < 4; i++) B.add(torusGeo(rc * 0.31, Math.max(0.0015, rc * 0.025), 14).rotateZ(Math.PI / 2).translate(rc * (0.4 + i * 0.05), vY + L * 0.02, rc * 0.75), "grey");
    }
    if (kind === "lam" || kind === "vk800") for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + 0.5; strut(B, V3(Math.cos(a) * rc * 1.1, head + L * 0.06, Math.sin(a) * rc * 1.1), V3(Math.cos(a) * rc * 2.1, head + L * 0.38, Math.sin(a) * rc * 2.1), Math.max(0.003, rc * 0.07), "silver"); }   // thermal standoffs to the mount
    if (kind === "ps4") { for (const sx of [-1, 1]) strut(B, V3(sx * rc * 1.2, head, 0), V3(sx * rc * 1.6, head + L * 0.45, 0), Math.max(0.004, rc * 0.08), "grey"); B.add(boxGeo(rc * 3.4, L * 0.04, rc * 0.5, 0, head + L * 0.47, 0), "grey"); }   // gimbal bracket
    sensor(B, V3(rc * 1.0, L * 0.86, 0), V3(1, 0, 0), Math.max(0.004, rc * 0.12));
    wire(B, [[rc * 1.0, L * 0.9, rc * 0.2], [rc * 1.2, vY, rc * 0.5], [rc * 1.4, vY + L * 0.3, rc * 0.5]], Math.max(0.0025, rc * 0.05), L * 0.2);
    for (const sy of [0.25, 0.5]) ring(yT * sy, bellR(o, yT * sy) + s * 0.004, Math.max(0.002, s * 0.01), "grey");
  }
  B.flush(g);
}

// ============================================================================
// SKIN FITTINGS — what sits on the outside of a stage or a fairing: umbilical
// plates where the tower's arms connect, antenna patches, vent valves,
// separation rails and their bolts, access doors, hold-down posts.
// Geometry is authored facing +z and wrapped onto a cylinder of radius r at
// azimuth a (measured from +z toward +x, as turn() lays its seams).
// ============================================================================
const onSkin = (geo, r, a, y) => geo.rotateY(a).translate(Math.sin(a) * r, y, Math.cos(a) * r);
function umbilicalPlate(B, r, a, y, s = 1) {
  B.add(onSkin(boxGeo(0.7 * s, 0.55 * s, 0.06), r + 0.03, a, y), "grey");
  for (const [dx, dy] of [[-0.2, 0.1], [0.2, 0.1], [0, -0.12]]) B.add(onSkin(new THREE.CylinderGeometry(0.07 * s, 0.07 * s, 0.1, 16).rotateX(Math.PI / 2).translate(dx * s, dy * s, 0), r + 0.1, a, y), "dark");
  for (const dx of [-0.31, 0.31]) for (const dy of [-0.24, 0.24]) B.add(onSkin(new THREE.CylinderGeometry(0.02 * s, 0.02 * s, 0.04, 8).rotateX(Math.PI / 2).translate(dx * s, dy * s, 0), r + 0.07, a, y), "dark");
}
const antennaPatch = (B, r, a, y, s = 1) => { B.add(onSkin(boxGeo(0.26 * s, 0.26 * s, 0.025), r + 0.012, a, y), "light"); B.add(onSkin(boxGeo(0.14 * s, 0.14 * s, 0.03), r + 0.014, a, y), "dark"); };
const ventValve = (B, r, a, y, s = 1) => { B.add(onSkin(new THREE.CylinderGeometry(0.09 * s, 0.11 * s, 0.14, 16).rotateX(Math.PI / 2), r + 0.07, a, y), "grey"); B.add(onSkin(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.05, 12).rotateX(Math.PI / 2), r + 0.16, a, y), "dark"); };
function accessDoor(B, r, a, y, w = 0.5, h = 0.6) {
  B.add(onSkin(boxGeo(w, h, 0.016), r + 0.01, a, y), "light");
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1]]) B.add(onSkin(new THREE.CylinderGeometry(0.013, 0.013, 0.02, 8).rotateX(Math.PI / 2).translate(dx * (w / 2 - 0.04), dy * (h / 2 - 0.04), 0), r + 0.02, a, y), "dark");
}
// the separation rail down a fairing's split line, bolted every half metre, and its base ring
function fairingRail(B, r, a, y0, y1) {
  B.add(onSkin(boxGeo(0.09, y1 - y0, 0.05).translate(0, (y0 + y1) / 2, 0), r + 0.02, a, 0), "grey");
  for (let y = y0 + 0.25; y < y1; y += 0.5) B.add(onSkin(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6).rotateX(Math.PI / 2).translate(0, y, 0), r + 0.05, a, 0), "dark");
}
function holdDowns(B, r, n, y, s = 1) {   // hold-down posts and their explosive nuts at the aft ring
  for (let i = 0; i < n; i++) { const a = (i + 0.5) * TAU / n, p = V3(Math.sin(a) * r, y, Math.cos(a) * r);
    B.add(boxGeo(0.3 * s, 0.5 * s, 0.3 * s, p.x, p.y - 0.25 * s, p.z), "grey"); B.add(new THREE.CylinderGeometry(0.07 * s, 0.07 * s, 0.14 * s, 12).translate(p.x, p.y + 0.07 * s, p.z), "dark"); }
}

function detailStages() {
  const R = LV.coreR;
  // LVM3: the core's skin: umbilical plates under each swing arm, antennas, vents
  within("l110", (g) => {
    const B = bulk(), base = ST.l110 ?? 0;
    umbilicalPlate(B, R, Math.PI, LV.arms[0][0] - (STACK_BASE().l110 ?? 0) + 0.6);
    for (const [a, y] of [[Math.PI / 2, 4], [-Math.PI / 2, 4], [Math.PI / 2, 17.5], [-Math.PI / 2, 17.5]]) antennaPatch(B, R, a, y);
    for (const a of [0.8, -0.8]) ventValve(B, R, a, LV.l110Len - 0.8);
    holdDowns(B, R * 0.92, 4, 0.0, 1);
    B.flush(g);
  });
  within("c25", (g) => {
    const B = bulk(), y0 = STACK_BASE().c25 ?? 0;
    for (const [y] of LV.arms.filter(([, on]) => on === "c25")) umbilicalPlate(B, R, Math.PI, y - y0 + 0.6, 0.9);
    for (const a of [Math.PI / 2, -Math.PI / 2]) antennaPatch(B, R, a, LV.c25Len - 0.6);
    ventValve(B, R, 0.6, LV.c25Len - 1.6); ventValve(B, R, -0.6, LV.c25Inter + 1.2);
    B.flush(g);
  });
  for (const [key, side] of [["plfA", 1], ["plfB", -1]]) within(key, (g) => {
    const B = bulk(), r = LV.plfR, phi0 = side > 0 ? 0 : Math.PI;
    for (const a of [phi0, phi0 + Math.PI]) fairingRail(B, r, a, LV.plfBoat, LV.plfCyl);
    for (const y of [LV.plfCyl * 0.4, LV.plfCyl * 0.72]) accessDoor(B, r, phi0 + Math.PI / 2, y, 0.6, 0.7);
    for (let i = 0; i < 4; i++) B.add(onSkin(boxGeo(0.16, 0.1, 0.02), r + 0.01, phi0 + Math.PI / 2 + (i - 1.5) * 0.18, LV.plfBoat + 0.35), "dark");   // vents
    B.flush(g);
  });
}
function detailPSLVStages(item) {
  const G = PV, R = G.ps1R, P = item + ".", y2 = G.ps1Len, y3 = y2 + G.ps2Len, yHS = y3 + G.ps3Len - 0.2;
  within(P + "ps1", (g) => { const B = bulk(); holdDowns(B, R * 0.9, 4, 0.1, 0.8); umbilicalPlate(B, R, Math.PI, 12, 0.8); antennaPatch(B, R, 0.3, 18.5, 0.8); B.flush(g); });
  within(P + "ps2", (g) => { const B = bulk(); umbilicalPlate(B, R, Math.PI, y2 + 6, 0.8); for (const a of [Math.PI / 2, -Math.PI / 2]) antennaPatch(B, R, a, y2 + 9.5, 0.8); ventValve(B, R, 0.7, y2 + G.ps2Len - 0.6, 0.8);
    boltCircle(B, V3(0, y2 + 2.85, 0), UP, R * 1.0, 48, 0.025, 0.03); B.flush(g); });   // the separation plane, at the tank base
  within(P + "ps4", (g) => {
    const B = bulk(), y = yHS + 0.4 + G.ps4Len + 0.26;
    for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + 0.2, rr = 0.95 + (i % 2) * 0.28, p = V3(Math.sin(a) * rr, y, Math.cos(a) * rr);   // avionics on the equipment bay deck
      B.add(boxGeo(0.28, 0.16, 0.2).rotateY(a).translate(p.x, p.y + 0.08, p.z), i % 3 ? "light" : "grey"); connector(B, V3(p.x * 0.9, p.y + 0.17, p.z * 0.9), UP, 0.016); }
    B.add(torusGeo(0.72, 0.02, 48).translate(0, y + 0.04, 0), "dark");   // the harness ring
    boltCircle(B, V3(0, y + 0.25, 0), UP, 0.5, 24, 0.015, 0.02);         // the clamp band to Chandrayaan-1
    B.flush(g);
  });
  for (const [sub, side] of [["hsA", 1], ["hsB", -1]]) within(P + sub, (g) => {
    const B = bulk(), r = G.hsR, phi0 = side > 0 ? 0 : Math.PI;
    for (const a of [phi0, phi0 + Math.PI]) fairingRail(B, r, a, yHS + G.hsBoat, yHS + G.hsCyl);
    accessDoor(B, r, phi0 + Math.PI / 2, yHS + G.hsCyl * 0.55, 0.45, 0.5);
    B.flush(g);
  });
}
