// ============================================================================
// 44 · DISPLAYS — every spacecraft and PSLV-XL stand on their own, well away
// from LVM3 on its pad; only the selected display is drawn. Assemblies of a
// display separate along their own vectors when it is taken apart.
// ============================================================================
const SHOW = {};        // display key → { group, asm: [{ key, group, ex }], fx: [], view, sphere }
const SHOW_ROOT = new Set();
const SHOW_X = { dC3: 400, dC2: 440, dC1: 480, dVK: 520, dPSLV: 600, dENG: 680, dLand: 760, jMap: 0 };
function showItem(key, info, view) {
  const g = mod(key); g.position.set(SHOW_X[key] ?? 0, 0, 0); g.visible = false;
  SHOW[key] = { key, group: g, asm: [], fx: [], info, view };
  MODULES[key] = { name: info.name, desc: info.desc, by: info.by, kv: info.kv || [] };
  SHOW_ROOT.add(g);
  return g;
}
function asm(item, sub, name, desc, ex, kv = [], parent) {
  const key = `${item}.${sub}`, g = mod(key, parent || SHOW[item].group);
  MODULES[key] = { name, desc, kv, short: name };
  SHOW[item].asm.push({ key, group: g, ex: V3(...ex) });
  return key;
}
const _bc = new THREE.Vector3();
function boxCorners(o, fn) {
  const b = o.geometry.boundingBox || (o.geometry.computeBoundingBox(), o.geometry.boundingBox);
  for (let i = 0; i < 8; i++) fn(_bc.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(o.matrixWorld));
}
const SHOW_CAPS = {
  dC3: "Chandrayaan-3 as it flew to the Moon: Vikram, with Pragyan folded inside, on top of the propulsion module that carried it there. Hover any part to name it; Take apart opens every assembly; Ignite fires the selected engine group.",
  dC2: "Chandrayaan-2 as it flew to the Moon: the orbiter, still returning data, with Vikram on top and Pragyan folded inside it. Vikram had five 800 N engines, four throttleable and a fixed-thrust one in the middle; Chandrayaan-3's has the four.",
  dC1: "Chandrayaan-1, India's first deep-space spacecraft: a 1.5 m cube with eleven instruments, six of them from NASA, ESA and Bulgaria, and the Moon Impact Probe on its top deck.",
  dVK: "Vikram and Pragyan at Shiv Shakti Point, as they stood after the landing on 23 August 2023: ramp down, rover rolled out, ChaSTE's probe in the soil and the RAMBHA probe on its boom. Ignite fires the four throttleable engines.",
  dENG: "All nine engine types of the three missions to one scale, exits on one line, from the S200's 3.27 m nozzle to Vikram's 800 N engines. Ignite all fires the row; the coloured buttons fire or cut one engine each; the throttle and the ambient pressure apply to every engine, each worked out from its own ratings.",
  dPSLV: "PSLV-XL as it flew Chandrayaan-1 as PSLV-C11 from the Second Launch Pad on 22 October 2008, the first flight of the XL: the S139 core with six PSOM-XL boosters (four lit on the ground, two in the air), then the Vikas-powered second stage, the solid third stage and the twin-engine fourth stage under the heat shield. Take apart stages it; Ignite fires the selected stage, the upper ones taken apart.",
};
function buildShowroom() {
  // ---- Chandrayaan-3, the integrated module ----
  showItem("dC3", { ...CRAFTINFO.c3 }, { az: 32 * DEG, el: 16 * DEG });
  const c3 = buildC3("dC3");
  ENGINE_SETS.C3PM = c3.pmFx; ENGINE_SETS.C3VK = VIKRAM_FX.dC3;
  // ---- Chandrayaan-2, orbiter with Vikram on top ----
  showItem("dC2", { ...CRAFTINFO.c2 }, { az: 32 * DEG, el: 16 * DEG });
  const c2 = buildC2("dC2");
  ENGINE_SETS.C2OR = c2.oFx; ENGINE_SETS.C2VK = VIKRAM_FX.dC2;
  // ---- Chandrayaan-1 ----
  showItem("dC1", { ...CRAFTINFO.c1 }, { az: 36 * DEG, el: 18 * DEG });
  ENGINE_SETS.C1 = buildC1("dC1");
  // ---- Vikram and Pragyan on the surface ----
  showItem("dVK", { ...CRAFTINFO.vk3surf }, { az: 24 * DEG, el: 14 * DEG });
  buildSurfacePatch(SHOW.dVK.group, { r: 6.5, seed: 11 });
  buildVikram("dVK", { v: 3, stowed: false, exAdd: [0, 1.7, 0] });
  ENGINE_SETS.VKS = VIKRAM_FX.dVK;
  // fired on the surface, the four plumes hit the regolith and throw a ring of dust outward
  const vkDust = makeFX("DUST", 2, { len: 1.0, r0: 5.5, rmax: 6, freq: 1, flow: 1.6, dens: 2.2, attack: 0.5, decay: 2.5 });
  vkDust.position.set(0, 1.0, 0); SHOW.dVK.group.add(vkDust);
  // and puffs of regolith blown out from under each engine, rolling outward low over the ground
  const puffs = VIKRAM_FX.dVK.map((e, i) => { const f = makeFX("DUST", 1, { len: 1.1, r0: 0.6, rmax: 2.8, freq: 1.4, flow: 0.8, dens: 2.2, attack: 0.9 + i * 0.15, decay: 3 }); SHOW.dVK.group.add(f); return { f, e }; });
  FRAME_HOOKS.push((dt, sh) => {
    if (sh !== "dVK") return;
    const set = ENGINE_SETS.VKS || [], s = (set.reduce((a, e) => a + (e.fx.userData.thrust || 0), 0) / Math.max(1, set.length)) * (1 - C.sxAmt);
    vkDust.userData.target = s;
    for (const p of puffs) {
      const L = p.f.userData.level, d = V3(p.e.layout.x, 0, p.e.layout.z).normalize().multiplyScalar(0.9 + L * 1.6);
      p.f.userData.target = s; p.f.position.set(p.e.layout.x + d.x, 0.75, p.e.layout.z + d.z); p.f.material.uniforms.uR0.value = 0.7 + L * 1.6;
    }
  });
  // ---- PSLV-XL ----
  showItem("dPSLV", { ...STACKINFO.pslv }, { az: 40 * DEG, el: 14 * DEG });
  buildPSLV("dPSLV");
  SHOW.dPSLV.hMax = 120;
  // ---- the five main engines on their own, then every engine side by side ----
  buildDetailEngines();
  buildLineup();
  Object.assign(GROUPS, CRAFT_GROUPS, PSLV_GROUPS, DET_GROUPS, { xALL: LINEUP_GROUP });
  for (const k in GROUPS) C.off[k] = (ENGINE_SETS[GROUPS[k].set] || []).map(() => 0);
  // bounding sphere of each display, with room for its taken-apart layout, for a tight camera depth range
  SCENE.updateMatrixWorld(true);
  const bx = new THREE.Box3();
  for (const k in SHOW) {
    if (SHOW[k].journey || SHOW[k].stowed) continue;
    bx.makeEmpty();
    SHOW[k].group.traverse((o) => { if (o.isMesh && !o.isInstancedMesh && o.layers.mask !== 1 << FX_LAYER) boxCorners(o, (p) => bx.expandByPoint(p)); else if (o.isInstancedMesh) { o.computeBoundingBox?.(); if (o.boundingBox) bx.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
    const ex = SHOW[k].asm.reduce((m, a) => Math.max(m, a.ex.length()), 0);
    SHOW[k].sphere = bx.getBoundingSphere(new THREE.Sphere());
    SHOW[k].sphere.radius += ex * 2 + (SHOW[k].plumeRoom ?? 6);
  }
  addMenu("Chandrayaan-3", C3_MENU);
  addMenu("Vikram & Pragyan", VK_MENU);
  addMenu("Chandrayaan-2", C2_MENU);
  addMenu("Chandrayaan-1", C1_MENU);
  addMenu("PSLV-XL · Chandrayaan-1", PSLV_MENU);
  addMenu("All engines", LINEUP_MENU());
}
const curShow = () => MENU_ITEMS[C.sel]?.show || null;

// a patch of the south polar highlands: rolling regolith, craters with raised rims, scattered rocks
function buildSurfacePatch(g, o = {}) {
  const key = (o.key || g.name || "site") + ".ground", gg = mod(key, g);
  MODULES[key] = { name: "Regolith · south polar highlands", desc: "Rolling ground pocked with small craters and scattered rocks, as Pragyan's cameras saw it around Shiv Shakti Point.", kv: [], quiet: true };
  let r; within(key, () => { r = surfacePatch(gg, o); }); return r;
}
function surfacePatch(g, o) {
  const R = o.r ?? 6, N = 120, rnd = mulberry(o.seed ?? 3);
  const craters = Array.from({ length: o.craters ?? 9 }, () => ({ x: (rnd() - 0.5) * R * 1.7, z: (rnd() - 0.5) * R * 1.7, r: (0.25 + Math.pow(rnd(), 2) * 1.4) * (o.craterK ?? 1) })).filter((c) => Math.hypot(c.x, c.z) > c.r + 1.9 || (o.keepCentre === false));
  const hAt = (x, z) => {
    let h = 0.04 * Math.sin(x * 1.3 + 0.7) * Math.cos(z * 1.1) + 0.03 * Math.sin(x * 2.9 + z * 2.1);
    for (const c of craters) { const d = Math.hypot(x - c.x, z - c.z) / c.r; if (d < 1.4) h += d < 1 ? -c.r * 0.22 * (1 - d * d) + c.r * 0.06 * d * d * d * d : c.r * 0.06 * Math.pow(Math.max(0, 1.4 - d) / 0.4, 2); }
    return h * smooth(R, R * 0.7, Math.hypot(x, z)) ;
  };
  const geo = new THREE.CircleGeometry(R, N, 0, TAU); geo.rotateX(-Math.PI / 2);
  // subdivide by rebuilding as a grid clipped to a disc
  const grid = new THREE.PlaneGeometry(R * 2, R * 2, 160, 160); grid.rotateX(-Math.PI / 2);
  const P = grid.attributes.position;
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), r = Math.hypot(x, z), k = r > R ? R / r : 1; P.setXYZ(i, x * k, hAt(x * k, z * k) - (r > R ? 0.02 : 0), z * k); }
  grid.computeVertexNormals();
  const uv = grid.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, P.getX(i) * 0.5, P.getZ(i) * 0.5);
  if (!T.regolith) T.regolith = TEX(1024, 1024, (Q) => { const r2 = mulberry(5); for (let i = 0; i < 260; i++) Q.dot(r2(), r2(), 1.2 + r2() * 2.2, 0.25); for (let i = 0; i < 40; i++) Q.ring(r2(), r2(), 3 + r2() * 9, 0.25, 1.2); });
  const ground = add(g, grid, "regolith", { map: T.regolith, inkA: 0.35 });
  ground.userData.ground = true;
  // rocks: low faceted lumps
  const B = bulk();
  for (let i = 0; i < (o.rocks ?? 40); i++) {
    const x = (rnd() - 0.5) * R * 1.8, z = (rnd() - 0.5) * R * 1.8; if (Math.hypot(x, z) > R * 0.95 || Math.hypot(x, z) < 1.6) continue;
    const s = 0.03 + Math.pow(rnd(), 3) * 0.22, rk = new THREE.IcosahedronGeometry(s, 0); rk.scale(1, 0.6, 0.9); rk.rotateY(rnd() * TAU); rk.translate(x, hAt(x, z) + s * 0.25, z); B.add(rk, "lo" in PAL ? "grey" : "grey");
  }
  B.flush(g);
  // rover tracks from the ramp foot, and a footprint plate around the pads
  return { hAt };
}
