// ============================================================================
// 50 · CONTROLLER — what is selected, what is apart, what is firing, and where
// the camera looks. The launch stack lives at the origin; every other subject is
// a display of its own (SHOW).
// ============================================================================
const CAM_AZ = 40 * DEG, CAM_EL = 21 * DEG;
const C = { thr: 1, sel: "stack", hover: null, sx: false, sxAmt: 0, explode: false, exAmt: 0, t: 0, running: false, group: null, alt: 0, start: 0, off: {} };
const GROUPS = {};        // engine groups the console can fire (filled by the launch vehicle)
const ENGINE_SETS = {};   // set → [{ group, fx, name }]
const ENGINE_FX = new Set();
const FRAME_HOOKS = [];   // per-frame callbacks registered by models (stack pose, moving parts)

// ---------- commands ----------
function selectItem(id) {
  const it = MENU_ITEMS[id]; if (!it) return;
  const prev = curShow(), next = it.show || null;
  if (prev !== next) {                                   // moving between subjects: cut, don't pan
    CAM.snap = true; C.sx = false; C.sxAmt = 0; C.hover = null; setHotSpec?.(null);
    const v = SHOW[next]?.view; CAM.az = v?.az ?? CAM_AZ; CAM.el = v?.el ?? CAM_EL; CAM.fly = null;
    C.running = false;
  }
  C.sel = id; CAM.user = false;
  if (it.root && !next) C.explode = false;   // the overview of the launch stack opens assembled
  if (it.apart) { if (next) C.sx = true; else C.explode = true; }
  if (it.group) selectGroup(it.group, true);
  else if (prev !== next) { const g = Object.keys(GROUPS).find((k) => (GROUPS[k].show || null) === next); if (g) selectGroup(g, true); }   // a display's own engines are the ones Ignite fires
  it.onSelect?.(prev);
  UI.sync?.();
}
function selectGroup(key, fromItem) {
  const G = GROUPS[key]; if (!G) return;
  if (key !== C.group) { C.running = false; C.group = key; C.alt = G.alt; }
  if (!fromItem) { if (curShow() !== (G.show || null) || C.sel !== G.item) { selectItem(G.item); return; } }
  if (G.apart && !G.show) C.explode = true;
  UI.sync?.();
}
function ignite() {
  const G = GROUPS[C.group]; if (!G || C.running) return;
  if ((G.show || null) !== curShow()) { selectItem(G.item); }
  if (curShow() && C.sx && !G.apart) C.sx = false;       // put the display back together before firing it
  if (curShow() && G.apart) C.sx = true;                 // upper stages of a display fire taken apart
  if (!curShow() && G.apart && !C.explode) C.explode = true;    // stages that light in flight fire taken apart
  C.running = true; C.start = C.t;
  if (G.lineup) { C.off[C.group].fill(0); C.lstart.fill(C.t); }   // Ignite all
  UI.sync?.();
}
function fireOne(i) {   // "All engines": light or cut one engine on its own
  const G = GROUPS.xALL; if (!G) return;
  if (C.group !== "xALL") selectGroup("xALL");
  if (curShow() !== "dENG") selectItem("engAll");
  const off = C.off.xALL;
  if (!C.running) { off.fill(1); off[i] = 0; C.lstart[i] = C.t; C.running = true; C.start = C.t; }
  else { off[i] = off[i] ? 0 : 1; if (!off[i]) C.lstart[i] = C.t; if (off.every((o) => o)) C.running = false; }
  UI.sync?.();
}
function shutdown() { C.running = false; UI.sync?.(); }
function setExplode(on) {
  if (curShow()) { const G = GROUPS[C.group], mine = G?.show === curShow(); C.sx = on; if (on && !(mine && G.apart)) C.running = false; if (!on && mine && G.apart) C.running = false; }
  else { C.explode = on; if (!on && GROUPS[C.group]?.apart) C.running = false; if (!on && MENU_ITEMS[C.sel]?.apart) C.sel = "stack"; }
  CAM.user = false; UI.sync?.();
}

// ---------- physics of one engine (all SI) ----------
// Momentum thrust is fixed by the propellant flow; the pressure term p_a·A_e is
// what the atmosphere takes away. A_e comes from the rated sea-level / vacuum pair.
// The throttle scales propellant flow, so the momentum thrust t·F_vac; the pressure term does not scale.
// None of these engines was throttled in flight: below 100 % it is an off-design what-if. A solid
// motor has no throttle at all, so it always burns at t = 1.
function engState(code, h, thr = C.thr) {
  const E = ENGINES[code], t = E.solid ? 1 : thr;
  const pa = E.vacOnly || h >= 1e6 ? 0 : pressureAt(h);
  const Fv = E.fixed ? E.thrustSL : E.thrustVac;   // N (every rated figure on this page is kept in newtons); a fixed rating is used at every altitude
  const Ae = !E.fixed && E.thrustSL ? (E.thrustVac - E.thrustSL) / P0 : 0;
  const per = Math.max(0, t * Fv - pa * Ae);
  const mdot = t * Fv / (E.ispVac * G0);
  return { E, t, pa, per, mdot, isp: mdot > 0 ? per / (mdot * G0) : 0, Ae };
}
function groupState() {
  const G = GROUPS[C.group]; if (!G) return null;
  if (G.lineup) {   // "All engines": nine different engines, each worked out from its own ratings
    const set = ENGINE_SETS[G.set] || [], rows = set.map((e, i) => ({ e, s: engState(e.eng, C.alt), on: C.running && !C.off[C.group]?.[i] }));
    const on = rows.filter((r) => r.on), total = on.reduce((a, r) => a + r.s.per, 0), mdotAll = on.reduce((a, r) => a + r.s.mdot, 0);
    return { G, lineup: true, rows, n: on.length, N: set.length, total, mdotAll, pa: C.alt >= 1e6 ? 0 : pressureAt(C.alt), t: C.thr, isp: mdotAll > 0 ? total / (mdotAll * G0) : 0, per: on.length ? total / on.length : 0, mdot: on.length ? mdotAll / on.length : 0, E: ENGINES[G.eng] };
  }
  const s = engState(G.eng, C.alt), set = ENGINE_SETS[G.set] || [];
  const n = set.reduce((a, _, i) => a + (C.running && !C.off[C.group]?.[i] ? 1 : 0), 0);
  return { G, ...s, n, N: set.length, total: s.per * n, mdotAll: s.mdot * n };
}

// ---------- per-frame ----------
function applyFrame(dt) {
  C.t += dt;
  const k = (rate) => 1 - Math.exp(-dt * (REDUCED ? 60 : rate));
  // taking apart runs at a steady pace; each part then eases out on its own, a beat after the one before
  const step = (v, t, dur) => (REDUCED ? t : v + clamp(t - v, -dt / dur, dt / dur));
  const tgt = C.explode ? 1 : 0;
  C.exAmt = step(C.exAmt, tgt, 1.9);
  const sh = curShow(), stackOn = !sh;
  const shown = SHOW[sh]?.roots || [SHOW[sh]?.group];
  for (const o of SCENE.children) o.visible = SHOW_ROOT.has(o) ? shown.includes(o) : stackOn;
  const sxT = C.sx ? 1 : 0;
  C.sxAmt = step(C.sxAmt, sxT, 1.6);
  if (sh) {
    const S = SHOW[sh];
    if (C.sxAmt > 0 && !S.leaders) buildLeaders(S);
    for (const a of S.asm) {
      const e = partAmt(C.sxAmt, a.delay ?? 0);
      a.group.position.copy(a.ex).multiplyScalar(e);
    }
  }
  for (const f of FRAME_HOOKS) f(dt, sh);

  // engines: flame front out of the bell → steady → cutoff tail blown downstream
  const G = GROUPS[C.group];
  for (const fx of ENGINE_FX) fx.userData.target = 0;
  if (G) (ENGINE_SETS[G.set] || []).forEach((e, i) => {
    const st = engState(e.eng || G.eng, C.alt), t0 = G.lineup ? (C.lstart?.[i] ?? C.start) : C.start;
    if (C.running && !C.off[C.group]?.[i]) e.fx.userData.target = smooth(0, 0.9, C.t - t0) * (st.t > 0 ? 0.35 + 0.65 * st.t : 0);
    shapePlume(e.fx, e.plume ? { plume: e.plume } : G, st.pa, st.t);
  });
  for (const fx of FX_LIST) {
    const d = fx.userData, u = fx.material.uniforms;
    u.uTime.value += dt * (REDUCED ? 0 : 1);
    if (!ENGINE_FX.has(fx)) {
      const rate = d.target > d.level ? 1 / d.attack : 1 / d.decay;
      d.level += clamp(d.target - d.level, -rate * dt, rate * dt);
      u.uInt.value = d.level;
      continue;
    }
    const vF = d.vFront || 2.2, vC = d.vCut || 1.25;
    if (d.target > 0.001) {
      if (!d.on || d.cut > 0) { d.on = true; d.front = 0; d.cut = 0; d.tCut = 0; if (d.level < 0.05) d.level = 0; }
      d.front = Math.min(1.7, d.front + dt * vF);
      d.level += clamp(d.target - d.level, -dt / 0.35, dt / 0.18);
      d.thrust = d.level * smooth(0, 0.9, d.front);
    } else if (d.on) {
      d.cut += dt * vC; d.tCut += dt;
      d.thrust = d.level * Math.exp(-d.tCut / 0.18);
      if (d.cut > 1.15) { d.on = false; d.level = 0; d.cut = 0; d.front = 0; d.thrust = 0; }
    } else d.thrust = 0;
    u.uInt.value = REDUCED ? (d.target > 0.001 ? d.target : 0) : (d.on ? d.level * (1 - smooth(0.45, 1.12, d.cut)) : 0);
    u.uFront.value = REDUCED ? 10 : d.front;
    u.uCut.value = REDUCED ? 0 : d.cut;
  }
  frameCamera(dt);
}
// one part's share of the take-apart: parts start in turn (delay 0 … 0.42) and each eases out over the rest
const STAGGER = 0.42;
const partAmt = (amt, delay) => ease((amt - delay) / (1 - STAGGER));
// the order parts leave in: the ones that travel furthest go first, the rest follow a beat apart
function buildLeaders(S) {
  S.leaders = true;
  if (S.exDelay) { for (const a of S.asm) a.delay = S.exDelay(a.key) ?? 0; return; }   // a display that comes apart in its own order
  const moved = S.asm.filter((a) => a.ex.length() > 0.25).sort((p, q) => q.ex.length() - p.ex.length());
  moved.forEach((a, i) => (a.delay = moved.length > 1 ? (i / (moved.length - 1)) * STAGGER : 0));
}
// plume shape from ambient pressure: wider and shorter at altitude
function shapePlume(fx, G, pa, t = 1) {
  const u = fx.material.uniforms, pr = pa / P0;
  u.uSpread.value = lerp(G.plume.sVac, G.plume.sSL, Math.sqrt(pr));
  // on the pad (stacked) a solid's plume stops on the flame deflector; taken apart it flies, full length
  // less flow, a shorter plume
  const apart = curShow() ? C.sxAmt : C.exAmt;   // a display's take-apart, or the launch stack's
  u.uLen.value = (G.plume.padLen != null ? lerp(G.plume.padLen, G.plume.len, smooth(0.05, 0.6, apart)) : G.plume.len) * (0.4 + 0.6 * t);
  u.uDens.value = fx.userData.dens0 * 1.3 * (G.plume.densVac ? lerp(G.plume.densVac, 1, Math.sqrt(pr)) : 1);   // a little denser than drawn, so the colour carries
}

// ---------- camera: orthographic, framed per selection ----------
const CAM = { target: V3(0, 0, 0), h: 10, az: CAM_AZ, el: CAM_EL, user: false, free: false, fly: null, keys: new Set(), dragMode: "orbit" };
const _bx = new THREE.Box3(), _bt = new THREE.Box3();
function boxOf(keys) {
  _bx.makeEmpty();
  for (const k of keys) for (const m of MODS[k]?.meshes || []) {
    if (!isShown(m)) continue;
    m.updateWorldMatrix(true, false);
    if (m.isInstancedMesh) { m.computeBoundingBox(); _bt.copy(m.boundingBox).applyMatrix4(m.matrixWorld); }
    else { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); _bt.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); }
    _bx.union(_bt);
  }
  return _bx;
}
const CAM_DIR = V3(), CAM_RIGHT = V3(), CAM_UP = V3();
function camBasis() {
  CAM_DIR.set(Math.sin(CAM.az) * Math.cos(CAM.el), Math.sin(CAM.el), Math.cos(CAM.az) * Math.cos(CAM.el));
  CAM_RIGHT.crossVectors(UP, CAM_DIR).normalize(); CAM_UP.crossVectors(CAM_DIR, CAM_RIGHT).normalize();
}
// fit a subject that needs `span` of picture height into the band the overlays leave free
function fitBand(c, span, k) {
  const ins = UI.insets || { top: 0, bottom: 0 }, H = PIPE.h || 1, free = clamp((H - ins.top - ins.bottom) / H, 0.5, 1);
  const h = span * k / free;
  c.addScaledVector(CAM_UP, -((ins.bottom - ins.top) / 2) * (h / H));
  return { c, h };
}
function itemKeys(it) {
  if (it.frame) return it.frame;
  if (it.root && it.show) return [it.show, ...SHOW[it.show].asm.map((a) => a.key).filter((k) => !(C.sx && SHOW[it.show].frameApartSkip?.includes(k)))];   // taken apart, the long booms run off the frame
  return it.mods;
}
function focusFrame() {
  const it = MENU_ITEMS[C.sel];
  if (!it) return { c: CAM.target.clone(), h: CAM.h };
  if (it.jv && J.built) {
    const f = journeyFrameBox(it.jv), aspect = PIPE.w / PIPE.h;
    return fitBand(f.c.clone().add(SHOW.jMap.group.position), Math.max(f.h, f.w / aspect), 1.0);
  }
  const b = it.box ? it.box() : boxOf(itemKeys(it));
  if (b.isEmpty()) return { c: CAM.target.clone(), h: CAM.h };
  if (it.below) b.min.y -= it.below;
  if (it.belowFiring && C.running && it.group === C.group) b.min.y -= it.belowFiring;
  const c = b.getCenter(V3());
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < 8; i++) {
    const p = V3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).sub(c);
    const x = p.dot(CAM_RIGHT), y = p.dot(CAM_UP);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const aspect = PIPE.w / PIPE.h;
  c.addScaledVector(CAM_RIGHT, (x0 + x1) / 2).addScaledVector(CAM_UP, (y0 + y1) / 2);
  const f = fitBand(c, Math.max(y1 - y0, (x1 - x0) / aspect), it.root ? 1.06 : 1.25);
  f.h = Math.max(f.h, hRange()[0]);
  return f;
}
const hRange = () => { const s = SHOW[curShow()]; return s?.journey ? [0.002, 4e5] : [s?.hMin ?? 0.3, s?.hMax ?? 600]; };
function flyStep(dt) {
  const K = CAM.keys; if (!K.size) return;
  camBasis();
  const fast = K.has("shift") ? 3 : 1, v = CAM.h * 0.6 * dt * fast, [lo, hi] = hRange();
  if (K.has("a")) CAM.target.addScaledVector(CAM_RIGHT, -v);
  if (K.has("d")) CAM.target.addScaledVector(CAM_RIGHT, v);
  if (K.has("q")) CAM.target.y -= v;
  if (K.has("e")) CAM.target.y += v;
  if (K.has("w")) CAM.h = clamp(CAM.h * Math.exp(-1.2 * dt * fast), lo, hi);
  if (K.has("s")) CAM.h = clamp(CAM.h * Math.exp(1.2 * dt * fast), lo, hi);
  if (K.has("arrowleft")) CAM.az -= 1.3 * dt * fast;
  if (K.has("arrowright")) CAM.az += 1.3 * dt * fast;
  if (K.has("arrowup")) CAM.el = clamp(CAM.el + 0.9 * dt * fast, -1.45, 1.45);
  if (K.has("arrowdown")) CAM.el = clamp(CAM.el - 0.9 * dt * fast, -1.45, 1.45);
  CAM.user = true; CAM.fly = null;
}
function frameCamera(dt) {
  if (CAM.script) { CAM.script(dt); camBasis(); return; }   // a scripted flight (the journey map)
  flyStep(dt);
  camBasis();
  if (CAM.snap) { const f = focusFrame(); CAM.target.copy(f.c); CAM.h = f.h; CAM.snap = false; return; }
  if (CAM.user) return;
  const f = focusFrame(), k = 1 - Math.exp(-dt * (REDUCED ? 60 : 2.6));
  CAM.target.lerp(f.c, k);
  CAM.h = Math.exp(lerp(Math.log(CAM.h), Math.log(f.h), k));   // zoom in log space: huge range on the journey map
  if (CAM.fly) {
    CAM.az = lerp(CAM.az, CAM.fly.az, k); CAM.el = lerp(CAM.el, CAM.fly.el, k);
    if (Math.abs(CAM.az - CAM.fly.az) + Math.abs(CAM.el - CAM.fly.el) < 1e-4) CAM.fly = null;
  }
}
function resetView() { CAM.script = null; const v = SHOW[curShow()]?.view, jv = MENU_ITEMS[C.sel]?.jv && J.built ? journeyFrameBox(MENU_ITEMS[C.sel].jv) : null; CAM.user = false; CAM.fly = { az: jv?.az ?? v?.az ?? CAM_AZ, el: jv?.el ?? v?.el ?? CAM_EL }; UI.sync?.(); }
function zoomBy(f, ndc) {
  camBasis();
  const [lo, hi] = hRange(), h0 = CAM.h, h1 = clamp(h0 * f, lo, hi), aspect = PIPE.w / PIPE.h;
  if (ndc) { const ox = ndc.x * (h0 / 2) * aspect, oy = ndc.y * (h0 / 2), s = 1 - h1 / h0; CAM.target.addScaledVector(CAM_RIGHT, ox * s).addScaledVector(CAM_UP, oy * s); }
  CAM.h = h1; CAM.user = true; CAM.fly = null; CAM.script = null; UI.sync?.();
}
function orbitBy(dx, dy) { CAM.script = null; CAM.az -= dx * 0.006; CAM.el = clamp(CAM.el + dy * 0.005, -1.45, 1.45); CAM.user = true; CAM.fly = null; }
function panBy(dx, dy) { CAM.script = null; camBasis(); const wpp = CAM.h / PIPE.h; CAM.target.addScaledVector(CAM_RIGHT, -dx * wpp).addScaledVector(CAM_UP, dy * wpp); CAM.user = true; CAM.fly = null; }
