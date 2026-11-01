// ============================================================================
// 42 · LAUNCH KIT — the parts both ISRO rockets are made of: solid motors with
// their segment joints and flex nozzles, liquid stages with domes and feed
// lines, rocket engines with their turbomachinery, fairing halves, attach
// struts. Metres, y up. Every part is a turned profile or a prism, so it shades
// smooth and inks clean.
// ============================================================================
// stage markings painted as ink: a word set in the canvas, centred at (u, v) on the wrap
function wordOn(P, txt, u, v, px, o = {}) {
  const { g, w, h } = P;
  g.save(); g.translate(u * w, (1 - v) * h); if (o.rot) g.rotate(o.rot);
  g.font = `${o.weight || 700} ${px}px ${o.font || "Archivo, Arial, sans-serif"}`; g.textAlign = "center"; g.textBaseline = "middle";
  if (o.vertical) { g.rotate(-Math.PI / 2); }
  g.fillStyle = o.ch === "paint" ? "rgba(255,0,0,1)" : o.ch === "alt" ? "rgba(0,0,255,1)" : `rgba(0,255,0,${o.a ?? 0.9})`;
  g.fillText(txt, 0, 0);
  g.restore();
}
// the tricolour as a painted panel: saffron and green read as alt tone, the white band stays paper, the
// Ashoka Chakra an ink ring with 24 spokes
function flagOn(P, u, v, du, dv) {
  P.alt(u, v + dv * 2 / 3, du, dv / 3, 0.55); P.paint(u, v, du, dv / 3, 0.55);
  P.rect(u, v, du, dv, 0.8, 2);
  const cu = u + du / 2, cv = v + dv / 2, r = Math.min(du * P.w, dv * P.h) / 7.5;
  P.ring(cu, cv, r, 0.9, 1.6);
  for (let k = 0; k < 24; k++) { const a = k * TAU / 24; P.polyline([[cu, cv], [cu + Math.cos(a) * r / P.w, cv + Math.sin(a) * r / P.h]], 0.6, 0.8); }
}

// a rocket engine: bell + chamber + optional turbopump; returns { group, fx }
function engineBell(parent, o) {
  const g = new THREE.Group(); g.position.copy(o.at); if (o.tilt) g.rotation.z = o.tilt; if (o.tiltX) g.rotation.x = o.tiltX; parent.add(g);
  const B = bulk(), L = o.len, re = o.exitR, rt = o.throatR ?? re * 0.28, rc = o.chamberR ?? re * 0.5, k = o.bellK ?? 0.62;
  const prof = [];
  for (let i = 0; i <= 18; i++) { const s = i / 18, r = rt + (re - rt) * Math.pow(s, o.bellPow ?? 0.62); prof.push([r, L * k * (1 - s), i && i < 18 ? 1 : 0]); }
  prof.reverse();
  const bell = [...prof, [rt, L * k], [rc, L * (k + 0.08)], [rc, L * 0.92], [rc * 0.6, L], [0, L]];
  add(g, turn(bell, { seg: 64 }), o.role || "metal", { map: o.map });
  add(g, turn(prof.map(([r, y, s]) => [r * 0.97, y + 0.01, s]).reverse(), { seg: 64 }), "dark");
  B.add(torusGeo(re + 0.01 * L, Math.max(0.006, re * 0.02), 64), "grey");
  for (const s of o.hoops || [0.3, 0.55]) B.add(torusGeo(rt + (re - rt) * Math.pow(1 - s, o.bellPow ?? 0.62) + 0.004, Math.max(0.004, re * 0.012), 48).translate(0, L * k * s, 0), "light");
  if (o.pumps) {
    const p = V3(rc * 1.9, L * (k + 0.2), 0);
    B.add(new THREE.CylinderGeometry(rc * 0.55, rc * 0.55, L * 0.2, 24).translate(p.x, p.y, p.z), "light");
    B.add(new THREE.CylinderGeometry(rc * 0.35, rc * 0.35, L * 0.12, 18).rotateZ(Math.PI / 2).translate(p.x - rc * 0.6, p.y + L * 0.05, 0), "grey");
    boltCircle(B, V3(p.x, p.y + L * 0.1, 0), UP, rc * 0.45, 10, rc * 0.04, rc * 0.05);
    duct(B, [[p.x, p.y - L * 0.1, 0], [p.x + rc * 0.25, L * 0.48, 0], [re * 0.96, L * 0.2, 0]], rc * 0.13, { flanges: false });
    duct(B, [[p.x - rc * 0.3, p.y + L * 0.1, rc * 0.3], [rc * 0.9, L * (k + 0.24), rc * 0.6], [rc * 0.9, L * (k + 0.15), 0]], rc * 0.12, { bolts: 8 });
  }
  if (o.gimbal) {   // gimbal block and two actuators to the thrust frame
    B.add(new THREE.CylinderGeometry(rc * 0.42, rc * 0.42, L * 0.06, 20).translate(0, L * 1.0, 0), "grey");
    for (const s of [-1, 1]) strut(B, V3(s * rc * 1.0, L * (k + 0.1), rc * 0.3 * s), V3(s * rc * 1.6, L * 1.02, rc * 0.5 * s), rc * 0.07, "light");
  }
  B.flush(g);
  const fx = makeFX(o.fx, 0, { len: o.plume, r0: re * 0.95, rmax: re * (o.rmaxK ?? 4), spread: 1.2, pow: 0.9, freq: 1.2, flow: o.flow ?? 30, dens: o.dens ?? 1.4, hot: o.hot ?? 5, diam: o.diam ?? 0.4, soot: o.soot ?? 0, fade: o.fade ?? 0.45, coolK: o.coolK ?? 1.6, attack: o.attack, decay: o.decay });
  g.add(fx);
  return { group: g, fx };
}

// a segmented solid motor (case, aft skirt, nose, joints), its flex nozzle below; returns { fx }
function solidMotor(g, o) {
  const B = bulk(), x = o.x ?? 0, z = o.z ?? 0, r = o.r, L = o.len, nose = o.nose, sk = o.skirt ?? r * 0.5;
  const body = [[0, sk], [r * 1.08, 0.0], [r * 1.08, sk * 0.25], [r, sk], [r, L - nose, 1]];
  // ogive nose: tangent arc from the case radius to a small rounded tip
  for (let i = 1; i <= 10; i++) { const s = i / 10, rr = r * Math.sqrt(Math.max(0, 1 - Math.pow(s, 1.7))) * (1 - 0.06 * s); body.push([Math.max(r * 0.07, rr), L - nose + nose * s, 1]); }
  body.push([0, L + r * 0.04]);
  add(g, turn(body, { seg: o.seg ?? 72, vy: [0, L] }).translate(x, 0, z), o.role || "white", { map: o.map, inkA: 0.8 });
  // segment joints: clevis bands with pins
  for (const y of o.joints || []) { B.add(turn([[r * 1.004, y - 0.12], [r * 1.025, y - 0.1], [r * 1.025, y + 0.1], [r * 1.004, y + 0.12]], { seg: 72 }).translate(x, 0, z), "grey"); for (let k = 0; k < 36; k++) { const a = k * TAU / 36; B.add(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6).rotateZ(Math.PI / 2).rotateY(-a).translate(x + Math.cos(a) * r * 1.03, y, z + Math.sin(a) * r * 1.03), "dark"); } }
  // raceway along one side
  if (o.raceway) { const a = o.raceway; B.add(boxGeo(0.16, L - nose - sk - 0.6, 0.12).rotateY(-a).translate(x + Math.cos(a) * (r + 0.05), (L - nose + sk) / 2, z + Math.sin(a) * (r + 0.05)), "light"); }
  B.flush(g);
  const e = engine(g, o.kind || "flex", { at: V3(x, -o.nozLen + (o.nozIn ?? 0.2), z), len: o.nozLen, exitR: o.exitR, throatR: o.throatR ?? o.exitR * 0.32, chamberR: o.exitR * 0.75, fx: o.fx || "SOLID", plume: o.plume, rmaxK: o.rmaxK ?? 5, dens: o.dens ?? 1.6, diam: 0.1, flow: o.flow ?? 26, coolK: o.coolK ?? 2.2, tilt: o.tilt, tiltX: o.tiltX, role: "grey", hoops: [0.2, 0.5, 0.8], bellPow: 0.8, bellK: 0.7, hot: 4 });
  return e;
}

// a liquid stage: cylinder with an aft skirt, dome ends visible only where open; returns nothing
function liquidStage(g, o) {
  const B = bulk(), r = o.r, L = o.len;
  add(g, turn([[r * 0.995, 0], [r, 0.02], [r, L - 0.02], [r * 0.995, L]], { seg: 96, vy: o.vy || [0, L] }), o.role || "white", { map: o.map, inkA: 0.75 });
  if (o.aftDome !== false) add(g, turn([[0, (o.aftY ?? 0.5)], [r * 0.98, (o.aftY ?? 0.5)]], { seg: 64 }), "grey");
  if (o.topCap) add(g, turn([[r * 0.995, L], [0, L]], { seg: 64 }), "grey");
  for (const y of o.rings || []) B.add(turn([[r * 1.002, y - 0.05], [r * 1.012, y - 0.04], [r * 1.012, y + 0.04], [r * 1.002, y + 0.05]], { seg: 96 }), "grey");
  for (const [a, y0, y1, w = 0.22] of o.tunnels || []) B.add(boxGeo(w, y1 - y0, 0.16).translate(0, (y0 + y1) / 2, r + 0.06).applyMatrix4(new THREE.Matrix4().makeRotationY(a)), "light");
  B.flush(g);
}

// one half of a fairing: cylinder plus ogive nose, open on the cut (phi0 = 0 or π)
function fairingHalf(g, o, side) {
  const r = o.r, L = o.len, cyl = o.cyl, boat = o.boat ?? 0, rb = o.rb ?? r;
  const prof = [[rb, 0], [r, boat], [r, cyl, 1]];
  const nose = L - cyl;
  for (let i = 1; i <= 14; i++) { const s = i / 14, rr = r * Math.sqrt(Math.max(0, 1 - Math.pow(s, 1.55))); prof.push([Math.max(r * 0.08, rr), cyl + nose * s, 1]); }
  prof.push([0, L]);
  const phi0 = side > 0 ? 0 : Math.PI;
  add(g, turn(prof, { seg: 56, phi0, phi: Math.PI, vy: [0, L], u: side > 0 ? [0, 0.5] : [0.5, 1] }), "white", { map: o.map, inkA: 0.75, side: THREE.DoubleSide });
  const cut = new THREE.Shape(prof.map(([rr, y]) => new THREE.Vector2(rr, y)).concat(prof.slice().reverse().map(([rr, y]) => new THREE.Vector2(Math.max(0, rr - 0.06), y))));
  for (const a of [phi0, phi0 + Math.PI]) { const gg = new THREE.ShapeGeometry(cut); const P = gg.attributes.position; for (let i = 0; i < P.count; i++) { const rr = P.getX(i), y = P.getY(i); P.setXYZ(i, rr * Math.sin(a), y, rr * Math.cos(a)); } gg.computeVertexNormals(); add(g, gg, "grey", { side: THREE.DoubleSide }); }
}
