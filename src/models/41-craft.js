// ============================================================================
// 41 · THE SPACECRAFT — Vikram (both versions), Pragyan, Chandrayaan-3's
// propulsion module, the Chandrayaan-2 orbiter and the Chandrayaan-1 orbiter
// with its Moon Impact Probe. Metres, y up. Each builder fills a display root
// with assemblies that separate along their own vectors when taken apart.
// Dimensions from VKG / PMG / O2G / O1G (11-craft-data); fittings drawn to fit.
// ============================================================================
const _mf = new THREE.Matrix4();
// place a geometry on face n of a box (outward normal n, tangent t, up UP), at (u, v) on the face, w out of it
function onBoxFace(geo, c, n, t, u, v, w = 0) {
  _mf.makeBasis(t, UP, n).setPosition(c.clone().addScaledVector(t, u).addScaledVector(UP, v).addScaledVector(n, w));
  return geo.applyMatrix4(_mf);
}
// a box with chamfered vertical edges (a square footprint, side a, chamfer c), y0..y1
const chamferSq = (a, c, cx = 0, cz = 0) => [[a / 2 - c, -a / 2], [a / 2, -a / 2 + c], [a / 2, a / 2 - c], [a / 2 - c, a / 2], [-a / 2 + c, a / 2], [-a / 2, a / 2 - c], [-a / 2, -a / 2 + c], [-a / 2 + c, -a / 2]].map(([x, z]) => [x + cx, z + cz]);
const chamferRect = (w, d, c) => [[w / 2 - c, -d / 2], [w / 2, -d / 2 + c], [w / 2, d / 2 - c], [w / 2 - c, d / 2], [-w / 2 + c, d / 2], [-w / 2, d / 2 - c], [-w / 2, -d / 2 + c], [-w / 2 + c, -d / 2]];
const rectPts = (w, d, cx = 0, cz = 0) => [[cx - w / 2, cz - d / 2], [cx + w / 2, cz - d / 2], [cx + w / 2, cz + d / 2], [cx - w / 2, cz + d / 2]];

function buildCraftTextures() {
  // multi-layer insulation: gold kapton with crinkle lines and taped seams
  T.mli = TEX(1024, 1024, (P) => {
    const r = mulberry(17);
    for (let i = 0; i < 220; i++) { const u = r(), v = r(), l = 0.02 + r() * 0.07, a = r() * TAU; P.polyline([[u, v], [u + Math.cos(a) * l, v + Math.sin(a) * l], [u + Math.cos(a + 0.6) * l * 1.6, v + Math.sin(a + 0.6) * l * 1.6]], 0.2, 1.1); }
    for (const v of [0.33, 0.66]) P.hline(v, 0.35, 2.2);
    for (const u of [0.5]) P.vline(u, 0.3, 2.2);
    for (let i = 0; i < 16; i++) { P.dot(0.03, i / 16 + 0.03, 3, 0.5); P.dot(0.97, i / 16 + 0.03, 3, 0.5); }
  });
  // solar array: a grid of cells, string busbars, the panel frame
  T.cells = TEX(1024, 1024, (P) => {
    P.alt(0, 0, 1, 1, 0.85);
    for (let i = 1; i < 24; i++) P.vline(i / 24, 0.45, 1.3);
    for (let j = 1; j < 16; j++) P.hline(j / 16, 0.45, 1.3);
    for (let j = 0; j < 4; j++) P.hline(j / 4, 0.8, 3);
    P.rect(0.004, 0.004, 0.992, 0.992, 0.95, 5);
  });
  T.radiator = TEX(512, 512, (P) => { for (let i = 1; i < 12; i++) P.vline(i / 12, 0.3, 1.6); P.rect(0.02, 0.02, 0.96, 0.96, 0.8, 3); });
  T.panelBox = TEX(512, 512, (P) => { P.rect(0.03, 0.04, 0.94, 0.92, 0.7, 3); for (let i = 0; i < 10; i++) { P.dot(0.07 + i * 0.095, 0.07, 3, 0.7); P.dot(0.07 + i * 0.095, 0.93, 3, 0.7); } for (const v of [0.3, 0.5, 0.7]) P.hline(v, 0.12, 1.2, 0.1, 0.9); });
  T.wheel = TEX(512, 256, (P) => { for (let i = 0; i < 18; i++) { P.vline(i / 18, 0.85, 4); } P.hline(0.5, 0.3, 2); });
  T.tankSph = TEX(1024, 512, (P) => { P.hline(0.5, 0.8, 3); P.rivets(0.52, 90, 0.4, 2); for (let i = 0; i < 8; i++) P.vline(i / 8, 0.08, 1.2); });
  T.dishC = TEX(1024, 1024, (P) => { for (let i = 1; i < 6; i++) P.hline(i / 6, 0.12, 1.2); for (let i = 0; i < 24; i++) P.vline(i / 24, 0.08, 1); });
  T.ramp = TEX(512, 1024, (P) => { P.rect(0.03, 0.02, 0.94, 0.96, 0.8, 3); for (let v = 0.06; v < 0.95; v += 0.06) P.hline(v, 0.35, 2, 0.08, 0.92); P.vline(0.5, 0.3, 2); });
  T.sar = TEX(1024, 512, (P) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) P.rect(0.01 + i * 0.0615, 0.02 + j * 0.12, 0.05, 0.1, 0.55, 1.4); });
  T.logoPlate = TEX(512, 256, (P) => { P.rect(0.04, 0.08, 0.92, 0.84, 0.8, 3); wordOn(P, "ISRO", 0.5, 0.62, 64); wordOn(P, "भारत", 0.5, 0.3, 54, { font: "'Tiro Devanagari Sanskrit', serif", weight: 400 }); });
}

// a box body wrapped in MLI with corner chamfers, seams and a top deck plate
function mliBox(B, g, w, d, y0, y1, o = {}) {
  const pts = o.chamfer ? chamferRect(w, d, o.chamfer) : rectPts(w, d);
  add(g, prismGeo(pts, y0, y1), o.role || "gold", { map: T.mli, inkA: 0.55 });
  if (o.deck !== false) add(g, prismGeo(pts.map(([x, z]) => [x * 0.985, z * 0.985]), y1, y1 + 0.02), o.deckRole || "light", { map: T.panelBox });
  if (o.floor) add(g, prismGeo(pts.map(([x, z]) => [x * 0.985, z * 0.985]), y0 - 0.02, y0), "grey");
}
// a deployed solar panel: frame, cells, a yoke and hinge back to the body
function solarPanel(B, g, c, n, t, w, h, o = {}) {
  const geo = boxGeo(w, h, 0.03);
  add(g, onBoxFace(geo, c, n, t, 0, 0, 0.025), "dark", { map: T.cells, inkA: 0.6 });
  add(g, onBoxFace(boxGeo(w + 0.03, h + 0.03, 0.012), c, n, t, 0, 0, 0.004), "grey");
  for (const u of [-w * 0.3, w * 0.3]) B.add(onBoxFace(boxGeo(0.04, 0.04, 0.05), c, n, t, u, -h / 2 + 0.06, -0.02), "dark");
  for (const v of [-h * 0.25, h * 0.25]) B.add(onBoxFace(boxGeo(w * 0.96, 0.03, 0.025), c, n, t, 0, v, -0.012), "grey");                 // stiffeners on the back
  const up = UP.clone(), P0 = (uu, vv, ww) => c.clone().addScaledVector(t, uu).addScaledVector(up, vv).addScaledVector(n, ww);
  cable(B, [P0(-w * 0.46, -h * 0.46, -0.03), P0(0, -h * 0.47, -0.03), P0(w * 0.46, -h * 0.46, -0.03), P0(w * 0.47, h * 0.4, -0.03)], 0.006, { clip: 0.2 });   // string harness
  for (let k = 1; k < 8; k++) B.add(onBoxFace(boxGeo(0.004, h * 0.94, 0.004), c, n, t, -w / 2 + (w * k) / 8, 0, 0.042), "grey");                      // bus bars between strings
}

// ---------------------------------------------------------------------------
// Vikram: o.v = 2 (Chandrayaan-2: five engines) or 3 (Chandrayaan-3: four, more
// solar area, a laser Doppler velocimeter). o.stowed folds the ramp and keeps the
// rover inside; o.prefix keys the assemblies. Ground (footpads) at y = 0.
// ---------------------------------------------------------------------------
const VIKRAM_FX = {};   // display item → [{ fx, name, layout, group }]
function buildVikram(item, o = {}) {
  const S = SHOW[item], P = item + ".", G = VKG, v3 = o.v !== 2;
  const yb = G.yb, yt = G.yb + G.h, a = G.w, c = G.chamfer;
  const keys = {};
  const xa = o.exAdd || [0, 0, 0];   // on a stack, the whole lander lifts clear of what it sits on as it comes apart
  const part = (sub, info, ex = [0, 0, 0]) => { const I = CRAFTINFO[info] || {}; const k = asm(item, sub, I.name || sub, I.desc || "", ex.map((v, i) => v + xa[i]), I.kv || []); MODULES[k].short = I.short || I.name; MODULES[k].by = I.by; keys[sub] = k; return k; };
  // ----- body: the octagonal-cornered box with its thrust cone and tanks inside -----
  part("body", v3 ? "vkBody3" : "vkBody2");
  within(P + "body", (g) => {
    const B = bulk();
    mliBox(B, g, a, a, yb, yt, { chamfer: c, floor: true });
    // central thrust cylinder showing through the floor, tank domes on the deck plate
    add(g, turn([[G.coneR, yb - 0.02], [G.coneR * 0.82, yb - 0.16], [G.coneR * 0.6, yb - 0.18]], { seg: 48 }), "grey");
    // top deck: an X-band antenna, sun sensors, the umbilical connector, handling points
    B.add(new THREE.CylinderGeometry(0.11, 0.13, 0.08, 24).translate(-0.62, yt + 0.06, -0.52), "light");
    B.add(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16).translate(-0.62, yt + 0.19, -0.52), "grey");
    for (const [x, z] of [[0.6, -0.62], [-0.62, 0.6]]) { B.add(boxGeo(0.12, 0.06, 0.12, x, yt + 0.05, z), "grey"); B.add(boxGeo(0.06, 0.03, 0.06, x, yt + 0.095, z), "dark"); }
    for (const [x, z] of [[a / 2 - 0.12, 0], [-(a / 2 - 0.12), 0], [0, a / 2 - 0.12], [0, -(a / 2 - 0.12)]]) B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10).translate(x, yt + 0.045, z), "dark");
    add(g, boxGeo(0.36, 0.012, 0.18, 0.2, yt + 0.028, 0.55), "light", { map: T.logoPlate });
    // the dome over the top of the central cylinder, under gold insulation
    { const pr = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pr.push([G.domeR * Math.cos(t * Math.PI / 2), yt + G.domeH * Math.sin(t * Math.PI / 2)]); } pr[pr.length - 1][0] = 0.001;
      add(g, turn(pr, { seg: 48 }), "gold", { map: T.mli, inkA: 0.5 }); B.add(torusGeo(G.domeR, 0.014, 48).translate(0, yt + 0.012, 0), "grey");
      for (const t of [0.45, 0.8]) B.add(torusGeo(G.domeR * Math.cos(t * Math.PI / 2) + 0.004, 0.008, 48).translate(0, yt + G.domeH * Math.sin(t * Math.PI / 2), 0), "grey");
      B.add(new THREE.CylinderGeometry(0.06, 0.08, 0.06, 18).translate(0, yt + G.domeH + 0.02, 0), "grey"); B.add(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 10).translate(0, yt + G.domeH + 0.08, 0), "dark"); }
    // radiator strip along the +x edge of the top deck (white, ribbed)
    add(g, boxGeo(0.4, 0.02, 0.85, 0.7, yt + 0.03, -0.075), "white", { map: T.radiator });
    // corner seams down the chamfers, fastener rows along the deck edge
    for (let k = 0; k < 8; k++) { const p = chamferSq(a, c)[k]; B.add(rodGeo(V3(p[0] * 1.002, yb, p[1] * 1.002), V3(p[0] * 1.002, yt, p[1] * 1.002), 0.008, 6), "grey"); }
    B.flush(g);
  });
  // ----- solar panels on the side faces (Chandrayaan-3 carries more of them) -----
  part("solar", v3 ? "vkSolar3" : "vkSolar2", [0, 0, 0]);
  within(P + "solar", (g) => {
    const B = bulk();
    // a panel hung from the deck edge on face normal n, its foot kicked out by `tilt`; brackets back to the body
    const slanted = (n, t, w, h, tilt, out = 0.05) => {
      const top = V3(0, yt - 0.03, 0).addScaledVector(n, a / 2 + out), up = UP.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(n, -Math.sin(tilt)), nn = n.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(UP, Math.sin(tilt));
      const c0 = top.clone().addScaledVector(up, -h / 2), M = new THREE.Matrix4().makeBasis(t, up, nn).setPosition(c0);
      add(g, boxGeo(w, h, 0.03).applyMatrix4(M), "dark", { map: T.cells, inkA: 0.6 });
      add(g, boxGeo(w + 0.03, h + 0.03, 0.012).translate(0, 0, -0.022).applyMatrix4(M), "grey");
      for (const v of [-h * 0.25, h * 0.25]) B.add(boxGeo(w * 0.96, 0.03, 0.025).translate(0, v, -0.035).applyMatrix4(M), "grey");
      for (const s2 of [-1, 1]) {   // hinge at the top, a strut from each lower corner back to the body
        B.add(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 10).rotateZ(Math.PI / 2).applyMatrix4(new THREE.Matrix4().makeBasis(t, up, nn).setPosition(top.clone().addScaledVector(t, s2 * w * 0.38))), "dark");
        const foot = c0.clone().addScaledVector(up, -h * 0.42).addScaledVector(t, s2 * w * 0.38), root = V3(0, yb + 0.12, 0).addScaledVector(n, a / 2).addScaledVector(t, s2 * w * 0.38);
        strut(B, root, foot.clone().addScaledVector(nn, -0.03), 0.014, "silver");
      }
      cable(B, [top.clone().addScaledVector(t, -w * 0.3).addScaledVector(nn, -0.04), top.clone().addScaledVector(t, -w * 0.32).addScaledVector(n, -0.04).setY(yt - 0.06), V3(0, yt - 0.1, 0).addScaledVector(n, a / 2 + 0.01).addScaledVector(t, -w * 0.34)], 0.007, { clip: 0.1 });
    };
    if (v3) {
      slanted(V3(-1, 0, 0), V3(0, 0, 1), a - c * 2 + 0.1, G.h * 0.95, 0.24);      // two large panels on the −x and −z faces
      slanted(V3(0, 0, -1), V3(-1, 0, 0), a - c * 2 + 0.1, G.h * 0.95, 0.24);
      // on +x a narrower panel stands off the face on four brackets, beside the star sensor
      const n = V3(1, 0, 0), t = V3(0, 0, -1), cx = V3(a / 2 + 0.16, (yb + yt) / 2, 0.2);
      solarPanel(B, g, cx, n, t, 0.62, G.h * 0.9);
      for (const dz of [-0.24, 0.24]) for (const dy of [-0.35, 0.35]) strut(B, V3(a / 2, cx.y + dy, cx.z + dz), V3(cx.x - 0.03, cx.y + dy, cx.z + dz), 0.012, "silver");
      add(g, boxGeo(0.4, 0.03, 0.7, -0.7, yt + 0.05, 0.15), "dark", { map: T.cells, inkA: 0.6 });   // top-deck panel
    } else {
      for (const [n, t] of [[V3(1, 0, 0), V3(0, 0, -1)], [V3(0, 0, -1), V3(-1, 0, 0)]]) solarPanel(B, g, V3(0, (yb + yt) / 2, 0).addScaledVector(n, a / 2), n, t, a - c * 2 - 0.1, G.h - 0.16);
    }
    B.flush(g);
  });
  // ----- the four (five) throttleable engines, the attitude thrusters, the thrust frame -----
  part("engines", v3 ? "vkEng3" : "vkEng2", [0, -1.7, 0]);
  const fxSet = (VIKRAM_FX[item] = []);
  within(P + "engines", (g) => {
    const B = bulk(), pos = [[G.engX, G.engX], [-G.engX, G.engX], [-G.engX, -G.engX], [G.engX, -G.engX]];
    if (!v3) pos.push([0, 0]);
    pos.forEach(([x, z], i) => {
      // the detailed 800 N engine, its throttle valve facing the centre; its control electronics live inside the lander
      const e = detEngine(g, "vk", { at: V3(x, yb - 0.04 - G.engLen, z), rotY: x || z ? Math.atan2(-x, -z) : 0, skip: ["tecem"], fx: "HYP", plume: G.plume, rmaxK: 6, dens: 1.25, diam: 0.2, flow: 14, hot: 4, coolK: 1.3, attack: 0.18, decay: 0.35 });
      fxSet.push({ group: e.group, fx: e.fx, name: i === 4 ? "Centre" : ["E1", "E2", "E3", "E4"][i], layout: V3(x, 0, z) });
    });
    // eight 58 N attitude thrusters, two at each chamfered corner, angled out
    for (let k = 0; k < 4; k++) {
      const ang = (k * 90 + 45) * DEG, d = V3(Math.cos(ang), 0, Math.sin(ang)), rr = a / 2 * Math.SQRT2 - c * 0.75;
      for (const s of [-1, 1]) {
        const p = V3(d.x * rr, yb + 0.12, d.z * rr).add(V3(-d.z, 0, d.x).multiplyScalar(s * 0.09));
        B.add(aim(turn([[0.012, 0], [0.026, -0.07], [0.024, -0.07], [0.01, 0]], { seg: 14 }), p, V3(d.x, -0.6, d.z).normalize().negate()), "metal");
        B.add(boxGeo(0.05, 0.05, 0.05, p.x, p.y + 0.02, p.z), "grey");
      }
    }
    B.flush(g);
  });
  // ----- four legs: main strut with shock absorber, two side struts, a footpad -----
  part("legs", v3 ? "vkLegs3" : "vkLegs2", [0, -0.75, 0]);
  within(P + "legs", (g) => {
    const B = bulk();
    for (let k = 0; k < 4; k++) {
      const ang = (k * 90 + 45) * DEG, d = V3(Math.cos(ang), 0, Math.sin(ang)), t = V3(-d.z, 0, d.x);
      const foot = d.clone().multiplyScalar(G.legR).setY(G.padH), top = d.clone().multiplyScalar(a / 2 * Math.SQRT2 - c * 0.5).setY(yb + 0.15);
      const mid = top.clone().lerp(foot, 0.45);
      B.add(rodGeo(top, mid, 0.045, 14), "metal");                                  // upper cylinder of the damper
      B.add(rodGeo(mid.clone().lerp(top, 0.12), foot.clone().setY(G.padH + 0.05), 0.032, 14), "silver");   // the stroking rod
      B.add(torusGeo(0.05, 0.012, 16).applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, foot.clone().sub(top).normalize()))).translate(mid.x, mid.y, mid.z), "grey");
      for (const s of [-1, 1]) {
        const root = d.clone().multiplyScalar(a / 2 * 0.9).addScaledVector(t, s * a * 0.28).setY(yb + 0.02);
        strut(B, root, foot.clone().setY(G.padH + 0.04).addScaledVector(t, s * 0.03), 0.022, "silver");
      }
      // footpad: a shallow dish with its ball joint
      add(g, turn([[0, 0.0], [G.padR * 0.9, 0.0], [G.padR, 0.03], [G.padR * 0.98, 0.05], [G.padR * 0.4, G.padH], [0, G.padH]], { seg: 32 }).translate(foot.x, 0, foot.z), "light");
      B.add(new THREE.SphereGeometry(0.04, 14, 10).translate(foot.x, G.padH + 0.04, foot.z), "grey");
      // touchdown sensor probe under the pad
      B.add(rodGeo(V3(foot.x, 0.02, foot.z).addScaledVector(t, 0.08), V3(foot.x, -0.0, foot.z).addScaledVector(t, 0.08), 0.006, 6), "dark");
    }
    B.flush(g);
  });
  // ----- landing sensors: cameras, altimeters, the velocimeter, the hazard camera -----
  part("sensors", v3 ? "vkSens3" : "vkSens2", [-1.3, -0.5, 0.2]);
  within(P + "sensors", (g) => {
    const B = bulk();
    // Ka-band altimeter: four flat patch antennas on the floor
    for (const [x, z] of [[0.55, 0.15], [-0.55, -0.15], [0.15, -0.55], [-0.15, 0.55]]) { B.add(boxGeo(0.16, 0.02, 0.16, x, yb - 0.03, z), "light"); B.add(boxGeo(0.12, 0.006, 0.12, x, yb - 0.043, z), "dark"); }
    // cameras: the hazard-avoidance camera (LHDAC) high on the ramp face; position (LPDC) and horizontal-velocity (LHVC) cameras under the floor
    const cam = (p, dir, l, r) => { const dd = dir.clone().normalize(); B.add(aim(boxGeo(0.12, 0.1, 0.12).translate(0, -0.05, 0), p, dd), "grey"); B.add(aim(new THREE.CylinderGeometry(r, r * 1.12, l, 18).translate(0, l / 2, 0), p, dd), "dark"); B.add(aim(torusGeo(r * 1.12, 0.006, 18).translate(0, l, 0), p, dd), "grey"); };
    cam(V3(0.62, yb + 0.78, a / 2 + 0.06), V3(0, -0.55, 1), 0.12, 0.045);
    cam(V3(-0.45, yb - 0.06, 0.12), V3(0, -1, 0), 0.1, 0.04);
    cam(V3(0.12, yb - 0.06, -0.45), V3(0.3, -1, 0), 0.09, 0.035);
    // star sensor on a bracket on +x, its baffle angled up and out
    { const p = V3(a / 2 + 0.08, yt - 0.18, -0.6); B.add(boxGeo(0.16, 0.14, 0.14, p.x, p.y, p.z), "grey"); strut(B, V3(a / 2, p.y - 0.06, p.z), V3(p.x - 0.05, p.y - 0.06, p.z), 0.012, "silver");
      B.add(aim(new THREE.CylinderGeometry(0.05, 0.065, 0.16, 18).translate(0, 0.08, 0), p.clone().add(V3(0.04, 0.07, 0)), V3(0.5, 1, -0.2).normalize()), "dark"); }
    if (v3) { // laser Doppler velocimeter on its bracket above the −x/+z corner, three beam windows looking down; the laser altimeter on the chamfer below it
      const q = V3(-a / 2 + 0.22, yt + 0.16, a / 2 - 0.22);
      strut(B, V3(q.x + 0.1, yt + 0.01, q.z - 0.1), q.clone().add(V3(0.05, -0.06, -0.05)), 0.016, "silver");
      B.add(boxGeo(0.24, 0.13, 0.2).rotateY(Math.PI / 4).translate(q.x, q.y, q.z), "light");
      for (let k = 0; k < 3; k++) B.add(aim(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), q.clone().add(V3(-0.05 + k * 0.05, -0.07, 0.05 - k * 0.05)), V3(-0.4, -1, 0.4)), "dark");
      const la = V3(-a / 2 + c / 2 - 0.05, yt - 0.25, a / 2 - c / 2 + 0.05); B.add(boxGeo(0.12, 0.12, 0.12).rotateY(Math.PI / 4).translate(la.x, la.y, la.z), "grey");
      B.add(aim(new THREE.CylinderGeometry(0.04, 0.045, 0.1, 18).translate(0, 0.05, 0), la.clone().add(V3(-0.05, -0.04, 0.05)), V3(-0.5, -1, 0.5)), "dark");
    } else B.add(aim(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 20).translate(0, 0.07, 0), V3(0.3, yb - 0.02, -0.3), V3(0, -1, 0)), "grey");   // laser altimeter
    B.flush(g);
  });
  // ----- payloads on the lander: ChaSTE, ILSA, RAMBHA-LP, the NASA laser reflector -----
  part("chaste", v3 ? "pChaSTE" : "pChaSTE2", [1.7, 0.3, -0.9]);
  within(P + "chaste", (g) => {
    const B = bulk(), base = V3(a / 2 + 0.04, yb + 0.3, -a * 0.3), dep = o.stowed ? 0 : 1;
    B.add(boxGeo(0.1, 0.16, 0.12, base.x, base.y, base.z), "grey");
    // the arm swings down and out; the probe drives 10 cm into the regolith
    const elbow = base.clone().add(V3(0.42 * dep + 0.05, -0.05 - 0.18 * dep, -0.02)), tip = dep ? V3(elbow.x + 0.1, -0.1, elbow.z) : base.clone().add(V3(0.04, -0.28, 0));
    B.add(rodGeo(base, elbow, 0.018, 10), "silver"); B.add(new THREE.SphereGeometry(0.03, 12, 8).translate(elbow.x, elbow.y, elbow.z), "grey");
    B.add(rodGeo(elbow, tip, 0.008, 10), "metal");
    B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 12).translate(elbow.x, elbow.y - 0.05, elbow.z), "light");
    B.flush(g);
  });
  part("ilsa", v3 ? "pILSA" : "pILSA2", [-0.7, -0.6, 1.4]);
  within(P + "ilsa", (g) => { const B = bulk(), p = V3(-0.62, yb + 0.1, a / 2 + 0.1); B.add(boxGeo(0.14, 0.08, 0.14, p.x, p.y, p.z), "light"); B.add(boxGeo(0.2, 0.02, 0.18, p.x, p.y + 0.05, p.z - 0.02), "grey"); B.add(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 16).translate(p.x, p.y - 0.055, p.z), "grey"); B.flush(g); });
  part("rambha", v3 ? "pRAMBHA" : "pRAMBHA2", [1.1, 1.0, -1.1]);
  within(P + "rambha", (g) => { const B = bulk(), root = V3(a / 2 - 0.15, yt + 0.02, -a / 2 + 0.15), tip = root.clone().add(V3(0.75, 0.2, -0.75).multiplyScalar(o.stowed ? 0.25 : 1)); B.add(boxGeo(0.1, 0.06, 0.1, root.x, root.y + 0.03, root.z), "grey"); B.add(rodGeo(root.clone().setY(root.y + 0.06), tip, 0.008, 8), "silver"); B.add(new THREE.SphereGeometry(0.025, 14, 10).translate(tip.x, tip.y, tip.z), "metal"); B.flush(g); });
  part("lra", v3 ? "pLRA" : "pLRA2", [0.4, 1.3, 0.4]);
  within(P + "lra", (g) => { const B = bulk(), p = V3(0.55, yt + 0.03, 0.55); B.add(new THREE.CylinderGeometry(0.05, 0.055, 0.025, 20).translate(p.x, p.y + 0.012, p.z), "grey"); add(g, sphereGeo(0.035, p.x, p.y + 0.025, p.z, 16, 8).scale(1, 0.6, 1).translate(0, 0, 0), "glass"); for (let k = 0; k < 8; k++) { const ang = k * TAU / 8; B.add(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6).translate(p.x + Math.cos(ang) * 0.028, p.y + 0.04, p.z + Math.sin(ang) * 0.028), "dark"); } B.flush(g); });
  // ----- the ramp on the +z face and the rover's bay -----
  part("ramp", v3 ? "vkRamp" : "vkRamp2", [0, -0.1, 1.5]);
  within(P + "ramp", (g) => {
    const B = bulk(), w = G.rampW, L1 = G.rampL1, L2 = G.rampL2, z0 = a / 2 + 0.02, y0 = yb + 0.08;
    // the rover's bay: a recess in the +z face, the rover's floor at y0
    add(g, boxGeo(w + 0.08, 0.02, 0.05, 0, y0 - 0.01, z0), "grey");
    if (o.stowed) {
      // folded flat against the face, two panels hinged together
      add(g, boxGeo(w, L1, 0.03, 0, y0 + L1 / 2, z0 + 0.06), "light", { map: T.ramp });
      add(g, boxGeo(w, L2, 0.03, 0, y0 + L2 / 2 + 0.05, z0 + 0.1), "light", { map: T.ramp });
    } else {
      const ang1 = Math.atan2(y0 - G.rampMid, L1) , p1 = V3(0, y0, z0), dir = V3(0, -Math.sin(-ang1), Math.cos(ang1));
      const q1 = V3(0, G.rampMid, z0 + Math.sqrt(Math.max(0, L1 * L1 - (y0 - G.rampMid) ** 2)));
      const q2 = V3(0, 0.0, q1.z + Math.sqrt(Math.max(0, L2 * L2 - G.rampMid * G.rampMid)));
      for (const [pa, pb] of [[p1, q1], [q1, q2]]) {
        const dv = pb.clone().sub(pa), L = dv.length(), mid = pa.clone().lerp(pb, 0.5), rot = Math.atan2(-dv.y, dv.z);   // rotateX(rot) takes +z onto the segment
        add(g, boxGeo(w, 0.03, L).rotateX(rot).translate(mid.x, mid.y, mid.z), "light", { map: T.ramp });
        for (const s of [-1, 1]) B.add(boxGeo(0.03, 0.06, L).translate(0, 0.03, 0).rotateX(rot).translate(mid.x + s * w / 2, mid.y, mid.z), "grey");
      }
      B.add(new THREE.CylinderGeometry(0.02, 0.02, w + 0.04, 10).rotateZ(Math.PI / 2).translate(q1.x, q1.y, q1.z), "dark");
    }
    B.flush(g);
  });
  // ----- Pragyan, in the bay or on the ground in front -----
  if (o.rover !== false) {
    part("rover", v3 ? "pragyan" : "pragyan2", [0, -0.2, 3.2]);
    const at = o.stowed ? V3(0, yb + 0.1, a / 2 - G.roverIn) : V3(o.roverAt?.x ?? 0.4, 0, o.roverAt?.z ?? (a / 2 + 2.4));
    within(P + "rover", () => buildPragyan(P + "rover", at, { stowed: o.stowed, yaw: o.roverYaw ?? (o.stowed ? 0 : 0.35) }));
  }
  detailVikram(item, o);
  return keys;
}

// Pragyan: six wheels on rocker-bogies, a flat body, a hinged solar panel, two navigation cameras on a mast
function buildPragyan(key, at, o = {}) {
  const g0 = MODS[key].group, g = new THREE.Group(); g.position.copy(at); g.rotation.y = o.yaw || 0; g0.add(g);
  const R = RVG, B = bulk(), wr = R.wheelR, y0 = wr + R.bodyY;
  // body: a shallow box under MLI, with a deck plate
  add(g, boxGeo(R.w, R.h, R.l, 0, y0 + R.h / 2, 0), "gold", { map: T.mli, inkA: 0.5 });
  add(g, boxGeo(R.w * 0.96, 0.012, R.l * 0.96, 0, y0 + R.h + 0.006, 0), "light", { map: T.panelBox });
  // solar panel: hinged on the -x edge of the deck, raised (closed flat when stowed)
  { const hinge = V3(-R.w / 2, y0 + R.h + 0.02, 0), ang = o.stowed ? 0 : R.panelAng, pg = new THREE.Group(); pg.position.copy(hinge); pg.rotation.z = -ang; g.add(pg);
    add(pg, boxGeo(R.panelW, 0.02, R.panelL, R.panelW / 2, 0.01, 0), "dark", { map: T.cells, inkA: 0.6 });
    add(pg, boxGeo(R.panelW + 0.02, 0.006, R.panelL + 0.02, R.panelW / 2, -0.004, 0), "grey");
    B.add(new THREE.CylinderGeometry(0.012, 0.012, R.panelL * 0.9, 10).rotateX(Math.PI / 2).translate(hinge.x, hinge.y, hinge.z), "dark"); }
  // navigation cameras: a pair on a short mast at the front (+z)
  { const m = V3(0, y0 + R.h, R.l / 2 - 0.08); B.add(rodGeo(m, m.clone().setY(m.y + 0.12), 0.012, 10), "silver"); B.add(boxGeo(0.16, 0.05, 0.05, m.x, m.y + 0.145, m.z), "grey");
    for (const s of [-1, 1]) B.add(aim(new THREE.CylinderGeometry(0.016, 0.018, 0.04, 14).translate(0, 0.02, 0), V3(m.x + s * 0.05, m.y + 0.145, m.z + 0.02), V3(0, -0.25, 1).normalize()), "dark"); }
  // APXS on its arm under the front, LIBS window on the front face
  { const p = V3(0.12, y0 - 0.02, R.l / 2 - 0.03); B.add(rodGeo(p, p.clone().add(V3(0, -0.07, 0.06)), 0.01, 8), "silver"); B.add(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 14).translate(p.x, p.y - 0.09, p.z + 0.07), "light"); }
  B.add(boxGeo(0.1, 0.06, 0.012, -0.12, y0 + R.h * 0.5, R.l / 2 + 0.006), "dark");
  // rocker-bogie: a rocker each side, a bogie at the rear, a differential bar across the deck
  for (const s of [-1, 1]) {
    const x = s * (R.w / 2 + 0.05), zs = [R.wheelZ[0], R.wheelZ[1], R.wheelZ[2]], piv = V3(x, y0 + 0.02, 0.02);
    const wheels = zs.map((z) => V3(s * (R.w / 2 + R.wheelW / 2 + 0.06), wr, z));
    B.add(rodGeo(piv, V3(x, wr + 0.05, zs[0]), 0.014, 8), "silver");                      // rocker to the front wheel
    const bog = V3(x, wr + 0.09, (zs[1] + zs[2]) / 2);
    B.add(rodGeo(piv, bog, 0.014, 8), "silver");
    B.add(rodGeo(bog, V3(x, wr + 0.05, zs[1]), 0.012, 8), "silver"); B.add(rodGeo(bog, V3(x, wr + 0.05, zs[2]), 0.012, 8), "silver");
    for (const p of [piv, bog]) B.add(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12).rotateZ(Math.PI / 2).translate(p.x, p.y, p.z), "grey");
    wheels.forEach((w, i) => {
      add(g, new THREE.CylinderGeometry(wr, wr, R.wheelW, 36, 1, false).rotateZ(Math.PI / 2).translate(w.x, w.y, w.z), "silver", { map: T.wheel, inkA: 0.75 });
      B.add(new THREE.CylinderGeometry(wr * 0.35, wr * 0.35, R.wheelW + 0.012, 18).rotateZ(Math.PI / 2).translate(w.x, w.y, w.z), "grey");
      B.add(rodGeo(V3(x, wr + 0.05, w.z), V3(w.x - s * R.wheelW / 2, w.y, w.z), 0.01, 8), "silver");
    });
  }
  B.add(rodGeo(V3(-R.w / 2 - 0.05, y0 + R.h + 0.05, -0.05), V3(R.w / 2 + 0.05, y0 + R.h + 0.05, -0.05), 0.01, 8), "silver");   // differential
  B.flush(g);
  detailPragyan(g, R, o);
  return g;
}

// ---------------------------------------------------------------------------
// Chandrayaan-3's propulsion module: the box round its central cylinder, the big
// single solar panel, the 440 N engine below, the SHAPE payload and the
// inter-module adapter cone that carries Vikram. Top of the adapter at y = 0.
// ---------------------------------------------------------------------------
function buildPM(item, o = {}) {
  const P = item + ".", G = PMG, y1 = -G.ima, y0 = y1 - G.h, a = G.w, d = G.d;
  const part = (sub, info, ex = [0, 0, 0]) => { const I = CRAFTINFO[info] || {}; const k = asm(item, sub, I.name || sub, I.desc || "", ex, I.kv || []); MODULES[k].short = I.short || I.name; MODULES[k].by = I.by; return k; };
  // Laid out after ISRO's CAD of the module (JPL 2024, fig. 1): the panel flush on one face (+x here), SHAPE on the
  // opposite face, the TTC antennas sticking out sideways near the top, a star sensor on a bracket at an upper
  // corner, a thruster pair under each bottom corner, the separation ring round the engine.
  part("pmBody", "pmBody", [0, -1.1, 0]);
  within(P + "pmBody", (g) => {
    const B = bulk();
    mliBox(B, g, a, d, y0, y1, { chamfer: 0.12 });
    add(g, turn([[G.tubeR, y0 - 0.02], [G.tubeR, y1 + 0.01]], { seg: 64 }), "grey");
    for (const s of [-1, 1]) add(g, boxGeo(a * 0.7, G.h * 0.55, 0.02, 0, y0 + G.h * 0.5, s * (d / 2 + 0.012)), "white", { map: T.radiator });   // radiators on ±z
    // fastener rows along the top and bottom of every face, as the CAD draws them
    for (const [nx, nz, half] of [[0, 1, a / 2 - 0.14], [0, -1, a / 2 - 0.14], [-1, 0, d / 2 - 0.14]]) for (const y of [y1 - 0.035, y0 + 0.035]) for (let i = 0; i <= 18; i++) {
      const t = -half + (2 * half * i) / 18, q = V3(nx ? nx * (a / 2 + 0.004) : t, y, nz ? nz * (d / 2 + 0.004) : t);
      B.add(aim(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6), q, V3(nx, 0, nz)), "dark");
    }
    // separation ring under the module, round the engine: where it sat on the rocket's adapter
    add(g, turn([[0.52, y0 - 0.06], [0.64, y0 - 0.06], [0.64, y0 - 0.01], [0.52, y0 - 0.01], [0.52, y0 - 0.06]], { seg: 96 }), "light");
    B.add(torusGeo(0.645, 0.012, 96).translate(0, y0 - 0.075, 0), "grey");
    boltCircle(B, V3(0, y0 - 0.06, 0), V3(0, -1, 0), 0.58, 36, 0.008, 0.012);
    for (let k = 0; k < 4; k++) { const q = k * TAU / 4; B.add(boxGeo(0.1, 0.05, 0.06).rotateY(-q).translate(Math.cos(q) * 0.66, y0 - 0.05, Math.sin(q) * 0.66), "dark"); }   // separation springs and bolt cutters
    // TTC antennas: short booms out of the ±z faces near the top, a cup at the tip
    for (const s of [-1, 1]) {
      const r0 = V3(-0.25, y1 - 0.16, s * (d / 2 + 0.01)), r1 = V3(-0.25, y1 - 0.22, s * (d / 2 + 0.3));
      B.add(boxGeo(0.08, 0.08, 0.03, r0.x, r0.y, r0.z), "grey");
      B.add(rodGeo(r0, r1, 0.014, 10), "silver");
      B.add(aim(new THREE.CylinderGeometry(0.045, 0.02, 0.05, 16, 1, true).translate(0, 0.025, 0), r1, V3(0, -0.2, s)), "light", { side: THREE.DoubleSide });
      B.add(aim(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), r1, V3(0, -0.2, s)), "dark");
    }
    // star sensor on its bracket at the upper −x/+z corner, looking up and out
    { const c = V3(-a / 2 - 0.02, y1 - 0.12, d / 2 - 0.22), dir = V3(-0.5, 0.75, 0.45).normalize();
      B.add(boxGeo(0.06, 0.18, 0.16, c.x - 0.03, c.y, c.z), "grey");
      B.add(boxGeo(0.14, 0.04, 0.12, c.x - 0.08, c.y + 0.06, c.z), "grey");
      B.add(aim(new THREE.BoxGeometry(0.1, 0.1, 0.1), c.clone().add(V3(-0.12, 0.12, 0)), dir), "light");
      B.add(aim(new THREE.CylinderGeometry(0.06, 0.045, 0.14, 18, 1, true).translate(0, 0.1, 0), c.clone().add(V3(-0.12, 0.12, 0)), dir), "dark", { side: THREE.DoubleSide });
    }
    // harness clamp blocks along a raceway on the +z face, and connector brackets on −x
    for (let i = 0; i < 9; i++) B.add(boxGeo(0.05, 0.03, 0.025, -a / 2 + 0.25 + i * 0.17, y1 - 0.1, d / 2 + 0.014), "grey");
    B.add(boxGeo(a - 0.4, 0.012, 0.012, 0, y1 - 0.1, d / 2 + 0.03), "dark");
    for (let i = 0; i < 4; i++) { const q = V3(-a / 2 - 0.012, y0 + 0.3 + i * 0.22, -d / 2 + 0.3); B.add(boxGeo(0.02, 0.07, 0.14, q.x, q.y, q.z), "grey"); for (const dz of [-0.04, 0.04]) B.add(new THREE.CylinderGeometry(0.014, 0.014, 0.025, 10).rotateZ(Math.PI / 2).translate(q.x - 0.02, q.y, q.z + dz), "dark"); }
    B.flush(g);
  });
  part("pmPanel", "pmPanel", [1.5, -1.1, 0]);
  within(P + "pmPanel", (g) => {
    // one panel mounted flush on the +x face, standing up past the top of the box beside the adapter cone
    const B = bulk(), n = V3(1, 0, 0), px = a / 2 + 0.07;
    solarPanel(B, g, V3(px, y0 + G.panelH / 2, 0), n, V3(0, 0, -1), G.panelW, G.panelH);
    for (const t of [0.15, 0.5, 0.85]) for (const s of [-1, 1]) B.add(boxGeo(0.07, 0.05, 0.05, a / 2 + 0.035, y0 + t * G.h, s * G.panelW * 0.38), "grey");   // standoffs on the box
    for (const s of [-1, 1]) B.add(rodGeo(V3(a / 2 - 0.05, y1 - 0.02, s * 0.5), V3(px - 0.02, y0 + G.panelH * 0.92, s * G.panelW * 0.4), 0.018, 8), "silver");   // struts to the top of the panel
    B.flush(g);
  });
  part("pmEng", "pmLAM", [0, -2.5, 0]);
  const fx = [];
  within(P + "pmEng", (g) => {
    const e = detEngine(g, "lam", { at: V3(0, y0 - DET_LAM.top + 0.012, 0), fx: "HYP", plume: 4.5, rmaxK: 7, dens: 0.85, diam: 0.2, flow: 14, hot: 4, coolK: 1.25 });
    fx.push({ group: e.group, fx: e.fx, name: "440 N LAM", layout: V3() });
  });
  part("pmRCS", "pmRCS", [0, -1.9, 0]);
  within(P + "pmRCS", (g) => {
    // a bracket under each bottom corner with a pair of 22 N thrusters: one firing down-and-out, one sideways
    const B = bulk();
    for (let k = 0; k < 4; k++) {
      const sx = k & 1 ? 1 : -1, sz = k & 2 ? 1 : -1, c = V3(sx * (a / 2 - 0.16), y0 - 0.06, sz * (d / 2 - 0.16)), out = V3(sx, 0, sz).normalize();
      B.add(boxGeo(0.14, 0.04, 0.14, c.x, c.y + 0.035, c.z), "grey");
      for (const s of [-1, 1]) B.add(boxGeo(0.01, 0.05, 0.12).rotateY(Math.atan2(out.x, out.z) + s * 0.5).translate(c.x, c.y, c.z), "grey");
      const t1 = c.clone().add(V3(0, -0.05, 0)), d1 = V3(out.x * 0.35, -1, out.z * 0.35).normalize();
      const t2 = c.clone().add(V3(sx * 0.03, -0.02, -sz * 0.05)), d2 = V3(-sz * 0.2, -0.15, sx).multiplyScalar(sx * sz).normalize();
      for (const [t, dir] of [[t1, d1], [t2, d2]]) {
        B.add(aim(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12).translate(0, -0.02, 0), t, dir), "light");                 // valve body
        B.add(aim(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 10).translate(0, 0.012, 0), t, dir.clone().negate()), "dark");   // its connector
        B.add(aim(turn([[0.006, 0], [0.026, 0.07, 1], [0.03, 0.08]], { seg: 16 }), t.clone().addScaledVector(dir, 0.04), dir), "dark", {});   // the nozzle
      }
      duct(B, [c.clone().add(V3(0, 0.055, 0)), c.clone().add(V3(-sx * 0.1, 0.06, -sz * 0.08)), c.clone().add(V3(-sx * 0.16, 0.062, -sz * 0.14))], 0.005, { flanges: false });
    }
    B.flush(g);
  });
  part("shape", "pSHAPE", [-1.4, -0.3, 0.6]);
  within(P + "shape", (g) => {
    // SHAPE on the face opposite the panel, looking out sideways: the instrument box, its fore-optics and electronics
    const B = bulk(), p = V3(-a / 2 - 0.13, y0 + G.h * 0.6, 0.32);
    B.add(boxGeo(0.24, 0.2, 0.3, p.x, p.y, p.z), "light");
    B.add(boxGeo(0.04, 0.16, 0.24, -a / 2 - 0.02, p.y, p.z), "grey");
    B.add(aim(new THREE.CylinderGeometry(0.05, 0.06, 0.14, 18).translate(0, 0.07, 0), p.clone().add(V3(-0.12, 0.04, 0.05)), V3(-1, 0.15, 0)), "dark");
    B.add(aim(torusGeo(0.06, 0.008, 18), p.clone().add(V3(-0.25, 0.06, 0.05)), V3(-1, 0.15, 0)), "grey");
    B.add(boxGeo(0.14, 0.12, 0.16, -a / 2 - 0.08, p.y - 0.24, p.z + 0.02), "light", {});
    for (const dz of [-0.04, 0.04]) B.add(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 10).rotateZ(Math.PI / 2).translate(-a / 2 - 0.16, p.y - 0.24, p.z + 0.02 + dz), "dark");
    B.flush(g);
  });
  part("ima", "pmIMA", [0, 0.3, 0]);
  within(P + "ima", (g) => {
    // a grey cylinder that flares a little at the top, with rows of fasteners and a lip ring where Vikram sat
    const B = bulk(), r0 = G.imaR0, r1 = G.imaR1 + 0.07;
    add(g, turn([[r0, y1 + 0.02], [r0, y1 * 0.35, 1], [lerp(r0, r1, 0.6), -0.12, 1], [r1, -0.05], [r1, 0]], { seg: 96, vy: [y1, 0] }), "metal", { side: THREE.DoubleSide });
    for (const y of [y1 + 0.06, y1 * 0.72, y1 * 0.5, y1 * 0.28]) { B.add(torusGeo(r0 + 0.006, 0.008, 96).translate(0, y, 0), "grey"); boltCircle(B, V3(0, y, 0), UP, r0 + 0.004, 40, 0.006, 0.01); }
    add(g, turn([[r1 - 0.03, -0.035], [r1 + 0.045, -0.035], [r1 + 0.045, 0], [r1 - 0.03, 0]], { seg: 96 }), "light");
    boltCircle(B, V3(0, 0, 0), UP, r1 + 0.008, 36, 0.01, 0.012);
    add(g, turn([[r0 - 0.02, y1 + 0.02], [r0 + 0.06, y1 + 0.02], [r0 + 0.06, y1 + 0.05], [r0 - 0.02, y1 + 0.05]], { seg: 96 }), "grey");
    for (let k = 0; k < 4; k++) { const q = k * TAU / 4 + TAU / 8; B.add(boxGeo(0.1, 0.07, 0.07).rotateY(-q).translate(Math.cos(q) * (r1 + 0.03), -0.06, Math.sin(q) * (r1 + 0.03)), "dark"); }   // separation bolts and springs
    B.flush(g);
  });
  detailPM(item);
  return fx;
}

// Chandrayaan-3's integrated module: Vikram on its propulsion module. Vikram's footpads sit just above the
// adapter ring, its engines down inside the cone.
function buildC3(item, o = {}) {
  const lift = VKG.engLen + 0.12;   // Vikram's engine exits clear the adapter
  const lg = new THREE.Group(); lg.position.y = -VKG.yb + 0.24; SHOW[item].group.add(lg);
  // Vikram, rover stowed, ramp folded
  const vk = buildVikramInto(item, lg, { v: 3, stowed: true, exAdd: [0, 2.2, 0] });
  const pmFx = buildPM(item, o);
  return { pmFx, vk };
}
function buildVikramInto(item, parent, o) {
  const S = SHOW[item], g0 = S.group; S.group = parent;
  const keys = buildVikram(item, o); S.group = g0;
  return keys;
}

// ---------------------------------------------------------------------------
// an orbiter bus with its instruments (Chandrayaan-2 and Chandrayaan-1 share the
// I-1K / I-3K family look: a gold MLI box, one big solar wing, a gimballed dish)
// ---------------------------------------------------------------------------
function dishAntenna(B, g, at, dir, R, f, o = {}) {
  // parabolic reflector, its rim, a feed on three struts, a gimbal block behind
  const prof = []; for (let i = 0; i <= 12; i++) { const r = R * i / 12; prof.push([r, (r * r) / (4 * f), 1]); }
  const dg = turn(prof, { seg: 48 }); aim(dg, at, dir); add(g, dg, o.role || "white", { map: T.dishC, side: THREE.DoubleSide, inkA: 0.6 });
  B.add(aim(torusGeo(R, R * 0.025, 48).translate(0, (R * R) / (4 * f), 0), at, dir), "grey");
  const feed = at.clone().addScaledVector(dir.clone().normalize(), f * 0.9);
  const [u, v] = basis(dir.clone().normalize());
  for (let k = 0; k < 3; k++) { const ang = k * TAU / 3, rim = at.clone().addScaledVector(dir.clone().normalize(), (R * R) / (4 * f) * 0.9).addScaledVector(u, Math.cos(ang) * R * 0.92).addScaledVector(v, Math.sin(ang) * R * 0.92); B.add(rodGeo(rim, feed, R * 0.012, 6), "silver");
    if (k === 0) cable(B, [feed, feed.clone().lerp(rim, 0.5).addScaledVector(u, R * 0.02), rim], R * 0.01, { clip: R * 0.25 }); }   // the waveguide down one strut
  const dn = dir.clone().normalize();
  B.add(aim(new THREE.CylinderGeometry(R * 0.07, R * 0.03, R * 0.16, 16).translate(0, -R * 0.08, 0), feed, dn.clone().negate()), "light");   // feed horn, facing the dish
  for (let k = 0; k < 6; k++) { const ang = k * TAU / 6, d = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(v, Math.sin(ang));   // backing ribs
    B.add(rodGeo(at.clone().addScaledVector(dn, -R * 0.02).addScaledVector(d, R * 0.12), at.clone().addScaledVector(dn, (R * R) / (4 * f) * 0.8 - R * 0.03).addScaledVector(d, R * 0.85), R * 0.015, 5), "grey"); }
  boltCircle(B, at.clone().addScaledVector(dn, (R * R) / (4 * f)), dn, R * 0.97, 24, R * 0.01, R * 0.012);
  B.add(aim(new THREE.CylinderGeometry(R * 0.07, R * 0.09, R * 0.16, 16), feed, dir), "grey");
  B.add(aim(new THREE.CylinderGeometry(R * 0.16, R * 0.16, R * 0.12, 20).translate(0, -R * 0.06, 0), at, dir), "grey");
}
function instrumentBox(B, g, c, size, o = {}) {
  add(g, boxGeo(size[0], size[1], size[2], c.x, c.y, c.z), o.role || "light", { map: o.map || T.panelBox });
  instrumentDetail(B, c, size, o);
  if (o.lens) { const n = o.lens.clone().normalize(), p = c.clone().addScaledVector(n, (Math.abs(n.x) * size[0] + Math.abs(n.y) * size[1] + Math.abs(n.z) * size[2]) / 2); B.add(aim(new THREE.CylinderGeometry(o.lr ?? 0.05, (o.lr ?? 0.05) * 1.1, o.ll ?? 0.08, 20).translate(0, (o.ll ?? 0.08) / 2, 0), p, n), "dark"); B.add(aim(torusGeo(o.lr ?? 0.05, (o.lr ?? 0.05) * 0.12, 20).translate(0, o.ll ?? 0.08, 0), p, n), "grey"); }
}
// what every instrument box carries besides its optics: feet and bolts where it mounts, a connector and its
// cable, a radiator, and a square sunshade round the aperture
function instrumentDetail(B, c, size, o = {}) {
  const n = (o.lens || V3(0, -1, 0)).clone().normalize(), m = n.clone().negate(), [u, v] = basis(m);
  const half = (d) => (Math.abs(d.x) * size[0] + Math.abs(d.y) * size[1] + Math.abs(d.z) * size[2]) / 2;
  const hm = half(m), hu = half(u), hv = half(v), base = c.clone().addScaledVector(m, hm);
  for (const su of [-1, 1]) for (const sv of [-1, 1]) {   // four feet with their bolts
    const p = base.clone().addScaledVector(u, su * (hu - 0.015)).addScaledVector(v, sv * (hv - 0.015));
    B.add(aim(new THREE.CylinderGeometry(0.014, 0.018, 0.02, 8).translate(0, 0.01, 0), p, m), "grey");
    B.add(aim(new THREE.CylinderGeometry(0.006, 0.006, 0.012, 6).translate(0, 0.02, 0), p.clone().addScaledVector(u, su * 0.012), m), "dark");
  }
  const side = c.clone().addScaledVector(u, hu);   // connector on one side, its cable back to the mounting face
  const tip = connector(B, side.clone().addScaledVector(n, hm * 0.2), u, 0.012);
  cable(B, [tip, tip.clone().addScaledVector(u, 0.03).addScaledVector(m, hm * 0.6), side.clone().addScaledVector(u, 0.05).addScaledVector(m, hm + 0.01)], 0.004, { clip: 0.06 });
  for (let i = -1; i <= 1; i++) B.add(aim(boxGeo(Math.min(hu * 1.4, 0.12), 0.004, Math.min(hm * 1.6, 0.14)).translate(0, 0.002, 0), c.clone().addScaledVector(v, hv + 0.004).addScaledVector(u, i * hu * 0.5), v), "white");   // radiator fins
  if (o.lens) {   // a square sunshade round the aperture
    const a0 = c.clone().addScaledVector(n, half(n)), r = (o.lr ?? 0.05) * 1.6, L = (o.ll ?? 0.08) * 1.3;
    const qi = new THREE.Quaternion().setFromUnitVectors(UP, n).invert();
    for (const d of [u, u.clone().negate(), v, v.clone().negate()]) { const pre = d.clone().applyQuaternion(qi); B.add(aim(boxGeo(0.004, L, r * 2).translate(0, L / 2, 0), a0.clone().addScaledVector(d, r), n, Math.atan2(-pre.z, pre.x)), "dark"); }
  }
}

function buildOrbiter2(item, o = {}) {
  const P = item + ".", G = O2G, a = G.w, d = G.d, y0 = -G.h, y1 = 0;   // top deck at y = 0, where Vikram's adapter sits
  const part = (sub, info, ex = [0, 0, 0]) => { const I = CRAFTINFO[info] || {}; const k = asm(item, sub, I.name || sub, I.desc || "", ex, I.kv || []); MODULES[k].short = I.short || I.name; MODULES[k].by = I.by; return k; };
  const fx = [];
  part("o2Body", "o2Body", [0, 0, 0]);
  within(P + "o2Body", (g) => {
    const B = bulk();
    mliBox(B, g, a, d, y0, y1, { chamfer: 0 });
    add(g, turn([[G.adR0, y1], [G.adR0, y1 + 0.06], [G.adR1, y1 + G.ad - 0.04], [G.adR1, y1 + G.ad]], { seg: 64 }), "light", { side: THREE.DoubleSide });   // adapter to Vikram
    boltCircle(B, V3(0, y1 + G.ad, 0), UP, G.adR1, 24, 0.012, 0.012);
    for (const s of [-1, 1]) add(g, boxGeo(a * 0.75, G.h * 0.5, 0.02, 0, y0 + G.h * 0.55, s * (d / 2 + 0.012)), "white", { map: T.radiator });
    for (const [x, z] of [[a / 2 - 0.2, d / 2 - 0.2], [-(a / 2 - 0.2), d / 2 - 0.2]]) { B.add(boxGeo(0.14, 0.12, 0.14, x, y1 + 0.06, z), "grey"); B.add(aim(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 16).translate(0, 0.06, 0), V3(x, y1 + 0.12, z), V3(0, 1, 0.4).normalize()), "dark"); }
    B.flush(g);
  });
  part("o2Panel", "o2Panel", [1.7, 0, 0]);
  within(P + "o2Panel", (g) => {
    const B = bulk(), yoke = a / 2 + 0.5, c = V3(yoke + G.panelW / 2, y0 + G.h / 2, 0);
    for (const t of [-0.25, 0.25]) B.add(rodGeo(V3(a / 2, c.y + t, 0), V3(yoke, c.y + t, 0), 0.025, 10), "silver");
    B.add(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 20).rotateZ(Math.PI / 2).translate(a / 2 + 0.07, c.y, 0), "grey");
    add(g, boxGeo(G.panelW, G.panelH, 0.035, c.x, c.y, c.z), "dark", { map: T.cells, inkA: 0.6 });
    add(g, boxGeo(G.panelW + 0.04, G.panelH + 0.04, 0.012, c.x, c.y, c.z - 0.025), "grey");
    B.add(boxGeo(0.04, G.panelH + 0.04, 0.05, c.x, c.y, c.z), "grey");   // the hinge line between the wing's two panels
    B.flush(g);
  });
  part("o2Hga", "o2Hga", [-1.2, 0.3, -1.0]);
  within(P + "o2Hga", (g) => {
    const B = bulk(), root = V3(-a / 2, y0 + 0.3, -d / 2 + 0.3), elbow = root.clone().add(V3(-0.55, -0.3, 0)), at = elbow.clone().add(V3(-0.1, -0.15, 0));
    B.add(rodGeo(root, elbow, 0.03, 10), "silver"); B.add(new THREE.SphereGeometry(0.06, 14, 10).translate(elbow.x, elbow.y, elbow.z), "grey");
    dishAntenna(B, g, at, V3(-0.7, -0.5, 0.3).normalize(), G.hgaR, G.hgaR * 0.9);
    B.flush(g);
  });
  part("o2Eng", "o2LAM", [0, -1.7, 0]);
  within(P + "o2Eng", (g) => {
    const e = detEngine(g, "lam", { at: V3(0, y0 + 0.04 - DET_LAM.top, 0), fx: "HYP", plume: 4.5, rmaxK: 7, dens: 0.85, diam: 0.2, flow: 14, hot: 4, coolK: 1.25 });
    fx.push({ group: e.group, fx: e.fx, name: "440 N LAM", layout: V3() });
  });
  // the eight instruments
  part("dfsar", "iDFSAR", [0, 0, 1.4]);
  within(P + "dfsar", (g) => { const B = bulk(); add(g, boxGeo(G.sarW, G.sarH, 0.05, 0, y0 + G.h * 0.42, d / 2 + 0.06), "light", { map: T.sar, inkA: 0.7 }); for (const x of [-G.sarW / 3, G.sarW / 3]) B.add(boxGeo(0.06, 0.06, 0.05, x, y0 + G.h * 0.42, d / 2 + 0.01), "grey"); B.flush(g); });
  part("ohrc", "iOHRC", [0.4, -1.3, -1.0]);
  within(P + "ohrc", (g) => { const B = bulk(), p = V3(0.35, y0 - 0.02, 0.1); add(g, turn([[0.17, 0], [0.17, -0.55], [0.15, -0.6], [0.12, -0.6]], { seg: 40 }).translate(p.x, p.y, p.z), "white"); B.add(torusGeo(0.16, 0.015, 32).translate(p.x, p.y - 0.6, p.z), "grey"); add(g, turn([[0.12, -0.6], [0.12, -0.58], [0, -0.58]], { seg: 32 }).translate(p.x, p.y, p.z), "dark"); B.flush(g); });
  part("tmc2", "iTMC2", [-1.0, -1.2, 0.3]);
  within(P + "tmc2", (g) => { const B = bulk(); instrumentBox(B, g, V3(-0.35, y0 - 0.1, 0.3), [0.3, 0.18, 0.22], { lens: V3(0, -1, 0), lr: 0.04 }); B.flush(g); });
  part("iirs", "iIIRS", [-0.6, -1.3, -1.1]);
  within(P + "iirs", (g) => { const B = bulk(); instrumentBox(B, g, V3(-0.2, y0 - 0.12, -0.35), [0.34, 0.22, 0.28], { lens: V3(0, -1, 0), lr: 0.06, ll: 0.12 }); B.flush(g); });
  part("class", "iCLASS", [1.0, -1.1, 1.0]);
  within(P + "class", (g) => { const B = bulk(); instrumentBox(B, g, V3(0.5, y0 - 0.08, -0.4), [0.36, 0.16, 0.3], { role: "light" }); for (let i = 0; i < 4; i++) B.add(boxGeo(0.07, 0.01, 0.07, 0.38 + (i % 2) * 0.12, y0 - 0.165, -0.47 + Math.floor(i / 2) * 0.12), "dark"); B.flush(g); });
  part("xsm", "iXSM", [1.2, 0.3, 0.2]);
  within(P + "xsm", (g) => { const B = bulk(); instrumentBox(B, g, V3(a / 2 + 0.06, y0 + 0.3, d / 2 - 0.2), [0.1, 0.1, 0.12], { lens: V3(1, 0.4, 0), lr: 0.02 }); B.flush(g); });
  part("chace2", "iCHACE2", [-1.2, 0.4, 0.8]);
  within(P + "chace2", (g) => { const B = bulk(); instrumentBox(B, g, V3(-a / 2 - 0.08, y0 + G.h * 0.7, 0.2), [0.14, 0.16, 0.2], { lens: V3(-1, 0, 0), lr: 0.04 }); B.flush(g); });
  part("dfrs", "iDFRS", [0, 0.2, -1.3]);
  within(P + "dfrs", (g) => { const B = bulk(); for (const x of [-0.3, 0.3]) B.add(aim(turn([[0.02, 0], [0.09, 0.08], [0.085, 0.09], [0.01, 0.01]], { seg: 20 }), V3(x, y0 + G.h * 0.3, -d / 2 - 0.02), V3(0, 0, -1)), "light"); B.flush(g); });
  detailOrbiter2(item);
  return fx;
}
function buildC2(item, o = {}) {
  const lg = new THREE.Group(); lg.position.y = O2G.ad - VKG.yb + 0.22; SHOW[item].group.add(lg);
  const vk = buildVikramInto(item, lg, { v: 2, stowed: true, exAdd: [0, 2.4, 0] });
  const oFx = buildOrbiter2(item, o);
  return { oFx, vk };
}

// ---------------------------------------------------------------------------
// Chandrayaan-1, laid out as ISRO's own description of it has it (PDS catalogue):
// a 1.53 × 1.56 × 1.5 m cuboid round a central cylinder that rises 0.62 m above
// the top deck to carry the Moon Impact Probe; the moon-viewing instruments on
// the +x face; the 0.7 m dish on its support cylinder on −x; one wing on +z on a
// drive, canted 30°; a plain radiator on −z; the 440 N engine and eight 22 N
// thrusters underneath. Bus base at y = 0.
// ---------------------------------------------------------------------------
function buildC1(item, o = {}) {
  const P = item + ".", G = O1G, w = G.w, d = G.d, y0 = 0, y1 = G.h, cylR = G.cylR, yc = G.cylTop;
  const part = (sub, info, ex = [0, 0, 0]) => { const I = CRAFTINFO[info] || {}; const k = asm(item, sub, I.name || sub, I.desc || "", ex, I.kv || []); MODULES[k].short = I.short || I.name; MODULES[k].by = I.by; return k; };
  const fx = [], stow = !!o.stowed;
  part("c1Body", "c1Body", [0, 0, 0]);
  within(P + "c1Body", (g) => {
    const B = bulk();
    add(g, prismGeo(rectPts(w, d), y0, y1), "gold", { map: T.mli, inkA: 0.55 });
    add(g, prismGeo(rectPts(w * 0.985, d * 0.985), y1, y1 + 0.02), "light", { map: T.panelBox });
    add(g, prismGeo(rectPts(w * 0.985, d * 0.985), y0 - 0.02, y0), "grey");
    // −z: the plain thermal radiator face; +x: the payload panel the instruments stand on
    add(g, boxGeo(w * 0.94, (y1 - y0) * 0.92, 0.02, 0, (y0 + y1) / 2, -d / 2 - 0.012), "white", { map: T.radiator });
    add(g, boxGeo(0.02, (y1 - y0) * 0.94, d * 0.94, w / 2 + 0.012, (y0 + y1) / 2, 0), "light", { map: T.panelBox });
    // the central cylinder: launch ring below, and its top, 0.62 m above the deck, closed by the probe's deck
    add(g, turn([[cylR, y1], [cylR, yc - 0.03], [cylR * 1.04, yc - 0.02], [cylR * 1.04, yc], [0, yc]], { seg: 64 }), "light", { map: T.panelBox });
    B.add(torusGeo(cylR + 0.005, 0.012, 64).rotateX(Math.PI / 2).translate(0, y1 + 0.24, 0), "grey");
    add(g, turn([[cylR, y0], [cylR, y0 - 0.1], [cylR * 0.92, y0 - 0.12]], { seg: 64 }), "grey");
    // two star sensors on the top deck, turned 63° toward −z and about 70° apart
    for (const s of [-1, 1]) { const p = V3(s * 0.45, y1 + 0.06, -d / 2 + 0.22), dir = V3(s * 0.45, 0.9, -0.55).normalize();
      B.add(boxGeo(0.14, 0.1, 0.14, p.x, p.y, p.z), "grey"); B.add(aim(new THREE.CylinderGeometry(0.05, 0.06, 0.13, 18).translate(0, 0.065, 0), p.clone().add(V3(0, 0.05, 0)), dir), "dark"); }
    // reaction-wheel covers and the S-band omni antennas on their short masts
    for (const [x, z] of [[0.48, 0.42], [-0.48, 0.42]]) B.add(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 22).translate(x, y1 + 0.055, z), "grey");
    for (const s of [-1, 1]) { const b = V3(s * (w / 2 - 0.1), y1 + 0.02, d / 2 - 0.1); B.add(rodGeo(b, b.clone().setY(y1 + 0.32), 0.01, 8), "silver"); B.add(new THREE.SphereGeometry(0.035, 14, 10).translate(b.x, y1 + 0.34, b.z), "light"); }
    add(g, boxGeo(0.34, 0.012, 0.17, -0.42, y1 + 0.028, 0.08), "light", { map: T.logoPlate });
    // eight 22 N thrusters at the bottom corners, two per corner
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const k of [0, 1]) {
      const p = V3(sx * (w / 2 - 0.08 - k * 0.14), y0 + 0.06, sz * (d / 2 - 0.08 - (1 - k) * 0.14)), dir = V3(sx * (k ? 0.2 : 1), -0.6, sz * (k ? 1 : 0.2)).normalize();
      B.add(aim(turn([[0.01, 0], [0.022, -0.06], [0.02, -0.06], [0.008, 0]], { seg: 12 }), p, dir.clone().negate()), "metal"); B.add(boxGeo(0.045, 0.045, 0.045, p.x, p.y + 0.02, p.z), "grey");
    }
    B.flush(g);
  });
  // ----- the wing on +z: a drive, a yoke, one 2.15 × 1.8 m panel canted 30° -----
  part("c1Panel", "c1Panel", [0, 0, 1.8]);
  within(P + "c1Panel", (g) => {
    const B = bulk(), yc0 = y0 + (y1 - y0) * 0.55;
    if (stow) solarPanel(B, g, V3(0, yc0, d / 2 + 0.04), V3(0, 0, 1), V3(1, 0, 0), Math.min(G.panelH, w * 0.95), Math.min(G.panelW, (y1 - y0) * 0.95));
    else {
      const z0 = d / 2, z1 = z0 + 0.5, pg = new THREE.Group(); pg.position.set(0, yc0, z1); pg.rotation.z = 30 * DEG; g.add(pg);
      B.add(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 22).rotateX(Math.PI / 2).translate(0, yc0, z0 + 0.06), "grey");   // the drive
      for (const t of [-0.22, 0.22]) B.add(rodGeo(V3(t, yc0, z0 + 0.1), V3(t * 0.6, yc0, z1), 0.02, 10), "silver");
      // the panel stands in the y–z plane, its face toward +x, tipped 30° on the drive axis
      add(pg, boxGeo(0.03, G.panelH, G.panelW, 0, 0, G.panelW / 2 + 0.02), "dark", { map: T.cells, inkA: 0.6 });
      add(pg, boxGeo(0.012, G.panelH + 0.04, G.panelW + 0.04, -0.022, 0, G.panelW / 2 + 0.02), "grey");
      const PB = bulk(); for (const t of [-0.3, 0.3]) PB.add(boxGeo(0.04, 0.04, G.panelW, -0.035, t * G.panelH, G.panelW / 2 + 0.02), "light"); PB.flush(pg);
    }
    B.flush(g);
  });
  // ----- the 0.7 m dish on −x, on its sandwich support cylinder and a two-axis gimbal -----
  part("c1Hga", "c1Hga", [-1.5, 0.4, 0]);
  within(P + "c1Hga", (g) => {
    const B = bulk(), base = V3(-w / 2, y0 + (y1 - y0) * 0.62, 0.15), top = base.clone().add(V3(-0.32, 0, 0));
    add(g, new THREE.CylinderGeometry(0.15, 0.15, 0.32, 28).rotateZ(Math.PI / 2).translate((base.x + top.x) / 2, base.y, base.z), "light", { map: T.panelBox });
    B.add(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 28).rotateZ(Math.PI / 2).translate(top.x, top.y, top.z), "grey");
    B.add(boxGeo(0.12, 0.14, 0.12, top.x - 0.07, top.y, top.z), "grey");                                       // gimbal, first axis
    B.add(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 16).rotateX(Math.PI / 2).translate(top.x - 0.15, top.y, top.z), "dark");   // second axis
    const dir = stow ? V3(-1, 0, 0) : V3(-0.75, 0.45, 0.45).normalize();
    dishAntenna(B, g, top.clone().add(V3(-0.2, 0, 0)), dir, G.hgaR, G.hgaR * 0.9);
    B.flush(g);
  });
  // ----- the 440 N engine underneath -----
  part("c1Eng", "c1LAM", [0, -1.2, 0]);
  within(P + "c1Eng", (g) => {
    const e = detEngine(g, "lam", { at: V3(0, y0 - 0.1 - DET_LAM.top, 0), fx: "HYP", plume: 4, rmaxK: 7, dens: 1.2, diam: 0.2, flow: 14, hot: 4, coolK: 1.25 });
    fx.push({ group: e.group, fx: e.fx, name: "440 N LAM", layout: V3() });
  });
  // ----- the Moon Impact Probe on the cylinder's top deck -----
  part("mip", "c1MIP", [0, 1.1, 0]);
  within(P + "mip", (g) => {
    const B = bulk(), s = G.mip, c = V3(0, yc + s[1] / 2 + 0.03, 0);
    add(g, boxGeo(s[0], s[1], s[2], c.x, c.y, c.z), "gold", { map: T.mli, inkA: 0.55 });
    add(g, boxGeo(s[0] * 0.98, 0.012, s[2] * 0.98, c.x, c.y + s[1] / 2 + 0.006, c.z), "light", { map: T.logoPlate });
    B.add(aim(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 16).translate(0, 0.025, 0), V3(c.x + s[0] / 2, c.y + 0.08, c.z), V3(1, 0, 0)), "dark");      // video camera
    B.add(boxGeo(0.12, 0.02, 0.12, c.x, c.y - s[1] / 2 - 0.01, c.z), "light");                                                                    // radar altimeter
    B.add(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 14).translate(c.x - s[0] / 2 + 0.07, c.y + s[1] / 2 + 0.03, c.z + s[2] / 2 - 0.07), "grey");   // CHACE inlet
    for (const dx of [-0.13, 0.13]) for (const dz of [-0.13, 0.13]) B.add(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10).translate(c.x + dx, yc + 0.02, c.z + dz), "dark");   // separation bolts
    B.flush(g);
  });
  // ----- the moon-viewing instruments on the +x payload panel, the rest on the decks -----
  const px = w / 2 + 0.02, X = V3(1, 0, 0);
  const ins = [
    ["tmc", "iTMC", V3(px + 0.18, 1.2, -0.4), [0.37, 0.22, 0.3], X, [1.25, 0.35, -0.5]],
    ["hysi", "iHySI", V3(px + 0.14, 1.22, 0.02), [0.28, 0.25, 0.2], X, [1.4, 0.45, 0.05]],
    ["c1xs", "iC1XS", V3(px + 0.1, 1.24, 0.4), [0.2, 0.16, 0.2], X, [1.25, 0.4, 0.55]],
    ["llri", "iLLRI", V3(px + 0.12, 0.74, -0.42), [0.24, 0.24, 0.24], X, [1.4, 0, -0.6]],
    ["m3", "iM3", V3(px + 0.16, 0.72, 0.04), [0.32, 0.26, 0.28], X, [1.55, -0.05, 0.05]],
    ["sir2", "iSIR2", V3(px + 0.1, 0.74, 0.42), [0.2, 0.16, 0.16], X, [1.4, 0, 0.6]],
    ["hex", "iHEX", V3(px + 0.14, 0.28, -0.25), [0.28, 0.22, 0.28], null, [1.3, -0.45, -0.3]],
    ["sara", "iSARA", V3(w / 2 - 0.12, y1 + 0.1, -0.1), [0.16, 0.16, 0.2], X, [0.9, 0.9, -0.2]],
    ["radom", "iRADOM", V3(-0.3, yc - 0.12, -0.3), [0.1, 0.1, 0.1], null, [-0.6, 1.1, -0.6]],
  ];
  for (const [sub, info, c, size, lens, ex] of ins) { part(sub, info, ex); within(P + sub, (g) => { const B = bulk(); instrumentBox(B, g, c, size, lens ? { lens, lr: 0.045, ll: 0.08 } : {}); B.flush(g); }); }
  // Mini-SAR: a flat antenna at the +x/+z corner, facing 32.8° off +z toward +x
  part("minisar", "iMiniSAR", [1.0, -0.2, 1.2]);
  within(P + "minisar", (g) => { const n = V3(Math.sin(32.8 * DEG), 0, Math.cos(32.8 * DEG)), c = V3(w / 2 - 0.06, y0 + 0.42, d / 2 + 0.08);
    add(g, onBoxFace(boxGeo(G.sarW, G.sarH, 0.04), c, n, V3(n.z, 0, -n.x), 0, 0, 0), "light", { map: T.sar, inkA: 0.7 }); });
  detailC1(item, o);
  return fx;
}
