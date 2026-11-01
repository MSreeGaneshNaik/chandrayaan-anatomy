// ============================================================================
// 48 · THE LANDING — Vikram's powered descent, replayed from a pure model.
// The published states at each phase boundary (altitude, horizontal and vertical
// speed) are joined by smooth curves; everything else is worked out from them:
// the deceleration the engines must give, hence the thrust, the throttle, the
// attitude (the thrust axis has to point along the required acceleration) and
// the propellant burned, from F = m (a + g) and ṁ = F / (Isp g₀).
// ============================================================================
const G_MOON = 1.625;          // m/s², lunar surface gravity
const DS = { run: "c3", t: 0, playing: false, built: false, speed: 1, last: null };
// one run: keyframes [t s, altitude m, horizontal m/s, vertical m/s, phase index], phases, mass at start, engines
function dsModel(R) {
  // 1 · sample the keyframes into a dense table: altitude and vertical speed on Hermite curves (they honour
  // the published vertical speeds at each boundary), horizontal speed straight between boundaries
  const K = R.keys, out = [], dt = 0.25, tEnd = K[K.length - 1][0];
  const hermite = (p0, v0, p1, v1, h, s) => { const s2 = s * s, s3 = s2 * s; return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * h * v0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * h * v1; };
  for (let t = 0, k = 0; t <= tEnd + 1e-6; t += dt) {
    while (k < K.length - 2 && t > K[k + 1][0]) k++;
    const [t0, h0, vh0, vz0, ph] = K[k], [t1, h1, vh1, vz1] = K[k + 1], h = t1 - t0, s = clamp((t - t0) / h, 0, 1);
    const alt = Math.max(0, hermite(h0, vz0, h1, vz1, h, s));
    const vh = lerp(vh0, vh1, R.vhShape ? R.vhShape(s, k) : s), vz = (hermite(h0, vz0, h1, vz1, h, Math.min(1, s + 1e-3)) - hermite(h0, vz0, h1, vz1, h, Math.max(0, s - 1e-3))) / (2e-3 * h);
    out.push({ t, alt, vh, vz, ph });
  }
  // 2 · what the engines must supply, per unit mass: the braking along the track, and vertically the change in
  // vertical speed plus lunar gravity less the centrifugal relief of still being in orbit, v²/r
  let x = 0, m = R.mass0;
  for (let i = 0; i < out.length; i++) {
    const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)], span = b.t - a.t || dt, o = out[i];
    const ah = -(b.vh - a.vh) / span;
    const az = (b.vz - a.vz) / span + G_MOON - (o.vh * o.vh) / (R_MOON_M + o.alt);
    const lit = R.lit ? R.lit(o.t) : R.engines;
    const F = R.free?.(o.t) ? 0 : Math.min(lit * R.Fmax, m * Math.hypot(ah, az));   // the lit engines cannot give more than full thrust
    Object.assign(o, { F, m, x, lit, pitch: Math.atan2(ah, Math.max(1e-3, az)) });   // thrust axis from the local vertical, tipped back against the motion
    m -= (F / (R.isp * G0)) * dt;
    x += o.vh * dt;
  }
  R.tab = out; R.range = x; R.tEnd = tEnd;
  return R;
}
const R_MOON_M = 1737400;
// display scale: true metres near the ground; above 30 m up or 40 m out, logarithmic, so the whole descent fits
const dsD = (r) => (r <= 40 ? r : 40 + 25 * Math.log(r / 40));
const dsA = (a) => (a <= 30 ? a : 30 + 20 * Math.log(a / 30));
function dsAt(R, t) { const T = R.tab, i = clamp(Math.floor(t / 0.25), 0, T.length - 2), f = clamp(t / 0.25 - i, 0, 1), a = T[i], b = T[i + 1]; const o = {}; for (const k in a) o[k] = typeof a[k] === "number" ? lerp(a[k], b[k], f) : a[k]; o.ph = a.ph; o.lit = a.lit; return o; }

let DS_RUNS = null;
function buildDescent() {
  DS_RUNS = { c3: dsModel({ ...DESCENT.c3 }), c2: dsModel({ ...DESCENT.c2 }), hop: dsModel({ ...DESCENT.hop }) };
  showItem("dLand", { ...CRAFTINFO.landing }, { az: 28 * DEG, el: 10 * DEG });
  const S = SHOW.dLand; S.descent = true; S.hMin = 0.6;
  const root = S.group;
  // the ground at the site: a patch of the south polar highlands with the scale's true size
  DS.site = new THREE.Group(); root.add(DS.site);
  DS.terrain = buildSurfacePatch(DS.site, { key: "dLand", r: 40, seed: 23, craters: 30, craterK: 2.4, rocks: 220 });
  // Chandrayaan-3's and Chandrayaan-2's landers, each in a pivot that carries its attitude
  for (const [k, v] of [["dL3", 3], ["dL2", 2]]) {
    const piv = new THREE.Group(); root.add(piv);
    const g = new THREE.Group(); piv.add(g);
    SHOW[k] = { key: k, group: g, asm: [], fx: [], stowed: true };
    buildVikram(k, { v, stowed: true, rover: true });
    for (const mk of Object.keys(MODS)) if (mk.startsWith(k + ".")) { MOD_TO_ITEM_EXTRA[mk] = v === 3 ? "land3" : "land2"; MODULES[mk].quiet = true; }
    DS[k] = { piv, g, fx: VIKRAM_FX[k] };
    for (const e of VIKRAM_FX[k]) e.fx.userData.decay = 0.25;
  }
  // the lander's centre of mass is ≈ 0.9 m up: the attitude turns about it
  for (const k of ["dL3", "dL2"]) DS[k].g.position.y = -VKG.yb - VKG.h * 0.35;
  // dust blown off the surface in the last metres, and debris for the crash
  DS.dust = makeFX("DUST", 2, { len: 1.6, r0: 7, rmax: 7.5, freq: 1, flow: 1.6, dens: 1.2, attack: 0.6, decay: 2.5 });
  DS.site.add(DS.dust);
  DS.crater = new THREE.Group(); DS.site.add(DS.crater);
  within("dLand.ground", () => { const B = bulk(), rnd = mulberry(7); add(DS.crater, turn([[0, -0.6], [1.6, -0.25, 1], [2.6, 0.12, 1], [3.4, 0.0]], { seg: 48 }), "regolith", { map: T.regolith, inkA: 0.4 });
    for (let i = 0; i < 26; i++) { const a = rnd() * TAU, r = 1 + rnd() * 6, s = 0.05 + rnd() * 0.25; B.add(new THREE.BoxGeometry(s, s * 0.3, s * 0.6).rotateY(rnd() * TAU).translate(Math.cos(a) * r, 0.03, Math.sin(a) * r), i % 3 ? "gold" : "grey"); }
    B.flush(DS.crater); DS.crater.visible = false; });
  S.sphere = new THREE.Sphere(V3(SHOW_X.dLand, 0, 0), 60);
  S.dynSphere = false;
  const _ds = new THREE.Sphere();
  S.depthFn = () => { const L = DS[DS.run === "c2" ? "dL2" : "dL3"], p = L.piv.getWorldPosition(V3()), c = V3(SHOW_X.dLand, 0, 0); return _ds.set(p.clone().lerp(c, 0.5), p.distanceTo(c) / 2 + 70); };
  const items = [["land3", "Chandrayaan-3 landing · 2023", "c3"], ["land2", "Chandrayaan-2 landing attempt · 2019", "c2"], ["hop", "The hop · 3 Sep 2023", "hop"]];
  addMenu("The landings", items.map(([id, label, run]) => [id, label, { show: "dLand", mods: [], info: [DESCENT[run].info], box: () => dsBox(), onSelect: () => descentRun(run, true) }]));
  for (const [, , run] of items) MODULES[DESCENT[run].info] = { name: DESCENT[run].name, desc: DESCENT[run].desc, kv: DESCENT[run].kv };
  DS.built = true;
  descentRun("c3", true);
}
// camera box: the lander, and the ground once it is close enough to share the frame
const _dsb = new THREE.Box3();
function dsBox() {
  const L = DS[DS.run === "c2" ? "dL2" : "dL3"], p = L.piv.getWorldPosition(V3()), s = DS.s || { alt: 0 };
  const near = smooth(28, 4, s.alt), span = lerp(5.5, 9, near);
  _dsb.setFromCenterAndSize(p.clone().add(V3(0, lerp(0.2, -Math.min(s.alt, 6) * 0.5, near), 0)), V3(span, lerp(3.6, Math.min(s.alt, 6) + 4.2, near), span));
  return _dsb;
}
function descentRun(run, fromMenu) {
  if (!DS.built) return;
  DS.run = run; DS.t = 0; DS.playing = !fromMenu; DS.done = false;
  const it = { c3: "land3", c2: "land2", hop: "hop" }[run];
  if (!fromMenu && C.sel !== it) { selectItem(it); return; }
  descentApply(); UI.sync?.();
}
function descentPlay() { if (!DS.built) return; if (DS.t >= DS_RUNS[DS.run].tEnd - 0.01) DS.t = 0; DS.playing = !DS.playing; UI.sync?.(); }
function descentScrub(f) { if (!DS.built) return; DS.t = f * DS_RUNS[DS.run].tEnd; DS.playing = false; descentApply(); CAM.snap = !CAM.user; UI.sync?.(); }
// playback: fast while high, real time near the ground
function dsRate(alt) { return REDUCED ? 1 : clamp(alt / 45, 1, 60); }
function descentFrame(dt) {
  if (!DS.built || !SHOW[curShow()]?.descent) return false;
  const R = DS_RUNS[DS.run];
  if (DS.playing) {
    const s = dsAt(R, DS.t), k = DS.run === "hop" ? 1 : dsRate(s.alt);
    DS.speed = k; DS.t = Math.min(R.tEnd, DS.t + dt * k);
    if (DS.t >= R.tEnd) { DS.playing = false; DS.done = true; UI.sync?.(); }
  }
  descentApply();
  return DS.playing || FX_LIST.some((f) => f.userData.level > 0.001);
}
function descentApply() {
  const R = DS_RUNS[DS.run], s = (DS.s = dsAt(R, DS.t)), v2 = DS.run === "c2", L = DS[v2 ? "dL2" : "dL3"], O = DS[v2 ? "dL3" : "dL2"];
  L.piv.visible = true; O.piv.visible = false;
  O.fx.forEach((e) => (e.fx.userData.target = 0));
  // site at the origin; the lander comes in along +x from down-range
  const remain = R.range - s.x;
  L.piv.position.set(-dsD(remain), dsA(s.alt) + VKG.yb + VKG.h * 0.35, 0);
  // attitude: the thrust axis tilts back against the motion; the C-2 replay tumbles after the deviation
  let pitch = s.pitch, roll = 0;
  if (R.tumble) { const k = smooth(R.tumble[0], R.tumble[1], s.t); pitch += k * Math.sin(s.t * 0.9) * 0.9; roll = k * Math.sin(s.t * 0.6 + 1) * 0.6; }
  L.piv.rotation.set(roll, 0, pitch);   // +z turns the lander's top back toward −x, against the motion
  const crashed = R.crash && s.t >= R.tEnd - 0.01;
  L.piv.visible = !crashed;
  DS.crater.visible = !!crashed;
  if (crashed) DS.crater.position.set(-dsD(R.range - s.x), 0, 0);
  // engines: thrust shared equally among the lit engines; plume length with thrust
  // two diagonally opposite engines stay lit when only two fire (the last 800 m of the landing, and the hop)
  const n = L.fx.length, lit = Math.min(n, s.lit || n), per = s.F / lit, thr = clamp(per / R.Fmax, 0, 1);
  const lost = R.los && s.t > R.los, on = (i) => lit >= n || (lit === 2 ? i % 2 === 0 : i < lit);
  L.fx.forEach((e, i) => { const u = e.fx.material.uniforms; e.fx.userData.target = on(i) ? (lost ? 0.25 * thr : thr) : 0; u.uLen.value = lerp(1.2, VKG.plume, thr); });
  DS.thr = thr;
  // dust: only where the plume reaches the ground
  DS.dust.userData.target = (s.alt < 12 ? smooth(12, 1.5, s.alt) : 0) * thr * (DS.run === "hop" ? 0.6 : 1);
  DS.dust.position.set(L.piv.position.x, 0.02, 0);
}
function descentSyncUI() {
  if (!DS.built) return;
  const R = DS_RUNS[DS.run];
  document.querySelectorAll("#dstep [data-run]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.run === DS.run)));
  $("#dplay").querySelector("span").textContent = DS.playing ? "Pause" : DS.t > 0 && DS.t < R.tEnd ? "Resume" : DS.run === "hop" ? "Play the hop" : "Play descent";
  $("#dplay").classList.toggle("on", DS.playing);
  $("#dscrub").value = Math.round(DS.t / R.tEnd * 1000);
}
const fmtT = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
function DESCENT_READOUT() {
  if (!DS.built) return "";
  const R = DS_RUNS[DS.run], s = DS.s || dsAt(R, DS.t), ph = R.phases[s.ph] || "";
  const alt = s.alt >= 1000 ? `${fmt(s.alt / 1000, 2)} km` : `${fmt(s.alt, s.alt < 10 ? 1 : 0)} m`;
  const lost = R.los && s.t > R.los, end = DS.t >= R.tEnd - 0.01;
  if (end && R.crash) return `<span class="crash">Hard landing · Tiranga Point</span><small>Normal to 2.1 km (ISRO) · live telemetry ended about 330 m up · impact speed not published</small>`;
  if (end) return `${R.endLine}<small>${R.endSub}</small>`;
  return `<span class="phase">${ph}</span> · ${alt} · ${fmt(Math.hypot(s.vh, s.vz), s.vh < 10 ? 1 : 0)} m/s${lost ? " · <span class=\"crash\">no signal</span>" : ""}<small>T+${fmtT(s.t)} · horizontal ${fmt(s.vh, 1)} m/s · vertical ${fmt(Math.abs(s.vz), 1)} m/s ${s.vz > 0.05 ? "up" : "down"} · thrust ${fmt(s.F, 0)} N (${fmt(DS.thr * 100, 0)} % of ${s.lit || R.engines} × 800 N) · tilt ${fmt(s.pitch / DEG, 0)}° · ${fmt(R.mass0 - s.m, 0)} kg burned${DS.playing && DS.speed > 1.05 ? ` · ×${fmt(DS.speed, 0)}` : ""}</small>`;
}
const DESCENT_TITLE = () => ({ c3: "Chandrayaan-3 · powered descent · 23 Aug 2023", c2: "Chandrayaan-2 · landing attempt · 7 Sep 2019", hop: "Vikram's hop · 3 Sep 2023" })[DS.run];
const DESCENT_CAP = () => DESCENT[DS.run].cap;
