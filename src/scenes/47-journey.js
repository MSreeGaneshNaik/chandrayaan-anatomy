// ============================================================================
// 47 · THE JOURNEY — all three Chandrayaan flights on one Earth–Moon map.
// 1 unit = 1,000 km. Earth, Moon, their distance and every orbit are to scale.
// Earth-bound orbits are drawn one lap each (the spacecraft flew several laps
// between burns); the transfer to the Moon is an Earth-centred conic carried into
// the rotating Earth–Moon frame and blended into a lunar approach hyperbola; the
// lunar orbits are polar and drawn in the plane of the landing site's meridian.
// Shapes and sizes are faithful; the orientation of each orbit is a drawing choice.
// ============================================================================
const J_RE = 6.371, J_RM = 1.7374, J_DEM = 384.4, J_MU = 398600, J_MUM = 4902.8;
const J_ORIGIN = V3(-4000, 0, 0);
const J_MC = V3(J_DEM, 0, 0);
const J_WM = 360 / 655.72 * DEG;          // Moon's motion, rad per hour (the frame's rotation)
const J_SPIN = 14.492 * DEG;              // Earth turning in the Earth–Moon frame, rad per hour
const J_SHAR = [13.72, 80.23];            // Satish Dhawan Space Centre, Sriharikota
const azv = (a, r = 1, y = 0) => V3(Math.cos(a) * r, y, -Math.sin(a) * r);   // azimuth a, counter-clockwise from +x seen from north
const ecef = (lat, lon) => V3(Math.cos(lat * DEG) * Math.cos(lon * DEG), Math.sin(lat * DEG), -Math.cos(lat * DEG) * Math.sin(lon * DEG));
// selenographic (lat, lon) → direction from the Moon's centre; lon 0 faces Earth (−x), east is +z
const selen = (lat, lon) => V3(-Math.cos(lat * DEG) * Math.cos(lon * DEG), Math.sin(lat * DEG), Math.cos(lat * DEG) * Math.sin(lon * DEG));
const J = { built: false, root: null, mis: "C3", tracks: {}, cur: 0, from: 0, to: 0, t: 1, date: 0, dFrom: 0, dTo: 0, lines: [], labels: [] };
const kmU = (km) => km / 1000;                         // km → map units
const rE = (alt) => J_RE + kmU(alt), rM = (alt) => J_RM + kmU(alt);
const utcMs = (s) => Date.parse(s.endsWith("Z") ? s : s + "Z");
const IST = 5.5 * 3600e3;
const fmtIST = (ms) => { const d = new Date(ms + IST), p = (n) => String(n).padStart(2, "0"); return `${d.getUTCDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()]} ${d.getUTCFullYear()} · ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} IST`; };

// ---------------- geometry of an orbit ----------------
function keplerE(M, e) { let E = e < 0.8 ? M : Math.PI; for (let k = 0; k < 40; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; }
// Earth-centred ellipse with perigee radius q and apogee radius Q (units): r(ν), and r, ν at τ hours after perigee
function conic(q, Q, mu = J_MU) {
  const a = (q + Q) / 2, e = (Q - q) / (Q + q), n = Math.sqrt(mu / Math.pow(a * 1000, 3)) * 3600, p = a * (1 - e * e);
  const f = (tau) => { const E = keplerE(Math.abs(tau) * n, e), nu = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2)); return { r: a * (1 - e * Math.cos(E)), nu: Math.sign(tau) * nu }; };
  f.r = (nu) => p / (1 + e * Math.cos(nu)); f.period = TAU / n; f.e = e; f.a = a;
  return f;
}
const hyp = (rp, e) => { const p = rp * (1 + e); return { r: (nu) => p / (1 + e * Math.cos(nu)), nu: (r) => Math.acos(clamp((p / r - 1) / e, -1, 1)) }; };
// a polar lunar orbit in the plane of a meridian: θ is the angle from the equator toward the north pole
function lunarPt(lon, th, r) { const u = selen(0, lon), v = V3(0, 1, 0); return J_MC.clone().addScaledVector(u, Math.cos(th) * r).addScaledVector(v, Math.sin(th) * r); }

// ---------------- build one mission's track ----------------
// T: [{ p, d }] with d = days since launch. idx: phase id → track index.
function buildMissionTrack(key) {
  const M = J_MIS[key], T = [], idx = {}, t0 = utcMs(M.launch), day = (s) => (utcMs(s) - t0) / 864e5;
  const push = (p, d) => T.push({ p, d }), mark = (id) => (idx[id] = T.length - 1);
  // Earth-bound phase: every burn at perigee, so every ellipse shares one perigee direction (φp)
  const last = M.ebn[M.ebn.length - 1], tTLI = day(M.tli.date);
  const out = conic(rE(M.tli.q), rE(M.tli.Q)), H = hyp(rM(M.loi.q), 1.35);
  // aim the transfer so that it reaches the Moon's distance 1.5° short of the Earth–Moon line, on its leading side
  // the published apogees fall a little short of the Moon's mean distance (its pull does the rest), so aim at
  // the point just short of apogee and let the approach hyperbola take over from there
  const rAim = Math.min(J_DEM - 6, rE(M.tli.Q) - 0.4);
  let lo = 0.01, hi = out.period / 2; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (out(m).r < rAim) lo = m; else hi = m; }   // r rises monotonically to apogee
  const tauArr = lo, phiP = 1.5 * DEG - out(tauArr).nu + J_WM * tauArr;   // inertial perigee azimuth at TLI = frame azimuth at TLI
  // launch: from Sriharikota to orbit insertion, 18° downrange, climbing to the first perigee
  const ins = M.ebn[0], phiIns = phiP - 16 * DEG;
  for (let i = 0; i <= 40; i++) { const s = i / 40; push(azv(lerp(phiIns - 18 * DEG, phiIns, s), J_RE + kmU(ins[0]) * (1 - Math.pow(1 - s, 6))), s * M.ascentMin / 1440); }
  mark(key + "Launch");
  // each Earth-bound orbit, one lap from perigee (insertion orbit starts just short of perigee)
  M.ebn.forEach(([q, Q, date], i) => {
    const f = conic(rE(q), rE(Q)), d0 = day(date), d1 = i + 1 < M.ebn.length ? day(M.ebn[i + 1][2]) : tTLI, n = 220;
    const nu0 = i === 0 ? -16 * DEG : 0;
    for (let k = 1; k <= n; k++) { const nu = lerp(nu0, TAU, k / n); push(azv(phiP + nu, f.r(nu)), lerp(i === 0 ? M.ascentMin / 1440 : d0, d1, k / n)); }
    mark(key + "E" + i);
  });
  mark(key + "EBN");
  // transfer: the conic in the turning frame, blended into the lunar approach hyperbola near the Moon
  const tLOI = day(M.loi.date), hTLI = tTLI * 24;
  let lastD = null;
  for (let tau = 0.02; tau < 400; tau *= 1.025) {
    const { r, nu } = out(tau), p = azv(phiP + nu - J_WM * tau, r), d = p.distanceTo(J_MC);
    if (d < 14 || tau > out.period / 2 || (lastD && d > lastD.d && d < 70)) break;
    const w = smooth(60, 14, d), hp = J_MC.clone().add(azv(Math.PI - H.nu(d) * 0.6, d));
    push(p.lerp(hp, w * 0.7), tTLI + tau / 24); lastD = { d, dd: tTLI + tau / 24 };
    if (!idx[key + "TLI"] && tau > 2) mark(key + "TLI");
  }
  mark(key + "Coast");
  // capture: the approach curls round the Moon's far side into the polar capture orbit (periselene in the south)
  const lon = M.site ? M.site[1] : M.orbitLon, thP = M.thPeri * DEG;
  const capFrom = T[T.length - 1].p.clone();
  const cap = conic(rM(M.loi.q), rM(M.loi.Q), J_MUM);
  for (let i = 1; i <= 60; i++) { const s = i / 60, nu = lerp(-1.4, 0, s), q = lunarPt(lon, thP - nu, cap.r(nu)); push(capFrom.clone().lerp(q, smooth(0, 1, s)), lerp(lastD.dd, tLOI, s)); }
  mark(key + "LOI");
  // lunar orbits: one lap each, shrinking toward the circular science / pre-separation orbit
  const lun = [[M.loi.q, M.loi.Q, M.loi.date], ...M.lunar];
  lun.forEach(([q, Q, date], i) => {
    const f = conic(rM(q), rM(Q), J_MUM), d0 = day(date), next = i + 1 < lun.length ? lun[i + 1][2] : (M.sep || M.end), d1 = day(next), n = 180;
    for (let k = 1; k <= n; k++) { const nu = (k / n) * TAU; push(lunarPt(lon, thP - nu, f.r(nu)), lerp(d0, d1, k / n)); }
    if (i === lun.length - 1) mark(key + "Lunar");
  });
  // the surface segment: impact probe or lander
  if (M.mip) {
    const r0 = rM(M.lunar[M.lunar.length - 1][0]), a0 = thP, a1 = M.mip.lat * DEG, d0 = day(M.mip.sep), d1 = day(M.mip.impact);
    for (let k = 1; k <= 80; k++) { const s = k / 80; push(lunarPt(lon, lerp(a0, a1, s), lerp(r0, J_RM, Math.pow(s, 1.8))), lerp(d0, d1, s)); }
    mark(key + "MIP");
  }
  if (M.deboost) {
    mark(key + "Sep");
    M.deboost.forEach(([q, Q, date], i) => {
      const f = conic(rM(q), rM(Q), J_MUM), d0 = day(date), d1 = i + 1 < M.deboost.length ? day(M.deboost[i + 1][2]) : day(M.descent.start), n = 160;
      for (let k = 1; k <= n; k++) { const nu = (k / n) * TAU; push(lunarPt(lon, thP - nu, f.r(nu)), lerp(d0, d1, k / n)); }
      mark(key + "DB" + i);
    });
    mark(key + "Deboost");
    // powered descent: from periselene, ≈30 km up, down-range to the site
    const aS = M.site[0] * DEG, rStart = rM(M.descent.alt0), d0 = day(M.descent.start), d1 = day(M.descent.end);
    const aEnd = M.descent.crash ? aS + 0.02 : aS;
    for (let k = 1; k <= 90; k++) { const s = k / 90, alt = Math.pow(1 - s, M.descent.shape || 0.55); push(lunarPt(lon, lerp(thP, aEnd, Math.pow(s, 0.8)), J_RM + (rStart - J_RM) * alt), lerp(d0, d1, s)); }
    mark(key + "Land");
  }
  return { T, idx, t0, lon, thP, phiP };
}

// ---------------- screen-space lines (drawn in the FX pass, dimmed behind bodies via the depth buffer) ----------------
const JLINE_VERT = /* glsl */`
attribute vec3 aPrev; attribute vec3 aNext; attribute float aSide; attribute float aDist; attribute float aProg;
uniform vec2 uRes; uniform float uW;
varying float vDist; varying float vProg; varying float vVZ; varying float vSide;
void main(){
  vec4 c = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(aPrev, 1.0);
  vec4 n = projectionMatrix * modelViewMatrix * vec4(aNext, 1.0);
  vec2 h = uRes * 0.5, sc = c.xy / c.w * h, d1 = sc - p.xy / p.w * h, d2 = n.xy / n.w * h - sc;
  float l1 = length(d1), l2 = length(d2);
  vec2 t = (l1 > 1e-3 ? d1 / l1 : vec2(0.0)) + (l2 > 1e-3 ? d2 / l2 : vec2(0.0));
  t = length(t) > 1e-4 ? normalize(t) : vec2(1.0, 0.0);
  float hw = uW * 0.5 + 1.0;
  c.xy += vec2(-t.y, t.x) * aSide * hw / h * c.w;
  gl_Position = c;
  vVZ = -(modelViewMatrix * vec4(position, 1.0)).z; vDist = aDist; vProg = aProg; vSide = aSide * hw;
}`;
const JLINE_FRAG = /* glsl */`
uniform sampler2D tDepth; uniform vec2 uRes; uniform vec3 uCol, uColF;
uniform float uNear, uFar, uW, uPx, uProgress, uDash, uA, uAF, uHide;
varying float vDist; varying float vProg; varying float vVZ; varying float vSide;
void main(){
  float sd = texture2D(tDepth, gl_FragCoord.xy / uRes).r;
  float zs = uNear + sd * (uFar - uNear);
  float vis = (sd < 0.99999 && zs < vVZ - uPx * 4.0) ? uHide : 1.0;
  bool past = vProg <= uProgress;
  float a = past ? uA : uAF;
  if (!past && uDash > 0.0 && fract(vDist / (uPx * uDash)) > 0.55) a = 0.0;
  a *= clamp(uW * 0.5 + 0.5 - abs(vSide), 0.0, 1.0) * vis;
  if (a < 0.003) discard;
  gl_FragColor = vec4((past ? uCol : uColF) * a, a);
}`;
function jLine(pts, o = {}) {
  const n = pts.length, P = [], Pr = [], Nx = [], Sd = [], Ds = [], Pg = [], idx = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    if (i) acc += pts[i].distanceTo(pts[i - 1]);
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], pg = o.prog ? o.prog[i] : 0;
    for (const s of [-1, 1]) { P.push(pts[i].x, pts[i].y, pts[i].z); Pr.push(a.x, a.y, a.z); Nx.push(b.x, b.y, b.z); Sd.push(s); Ds.push(acc); Pg.push(pg); }
    if (i < n - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute("aPrev", new THREE.Float32BufferAttribute(Pr, 3));
  g.setAttribute("aNext", new THREE.Float32BufferAttribute(Nx, 3));
  g.setAttribute("aSide", new THREE.Float32BufferAttribute(Sd, 1));
  g.setAttribute("aDist", new THREE.Float32BufferAttribute(Ds, 1));
  g.setAttribute("aProg", new THREE.Float32BufferAttribute(Pg, 1));
  g.setIndex(idx);
  const m = new THREE.ShaderMaterial({
    vertexShader: JLINE_VERT, fragmentShader: JLINE_FRAG, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    uniforms: {
      tDepth: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uCol: { value: new THREE.Color() }, uColF: { value: new THREE.Color() },
      uNear: { value: 1 }, uFar: { value: 100 }, uW: { value: 2 }, uPx: { value: 1 }, uProgress: { value: o.prog ? 1e9 : -1 }, uDash: { value: o.dash ?? 0 }, uA: { value: o.a ?? 1 }, uAF: { value: o.af ?? 0.35 }, uHide: { value: o.hide ?? 0.2 },
    },
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.layers.set(FX_LAYER); mesh.frustumCulled = false; mesh.renderOrder = 20;
  mesh.userData.j = { w: o.w ?? 1.5, col: o.col ?? "ink", colF: o.colF ?? "ink", dash: o.dash ?? 0 };
  J.lines.push(mesh);
  return mesh;
}
const ring = (c, r, n = 256) => Array.from({ length: n + 1 }, (_, i) => c.clone().add(azv((i / n) * TAU, r)));

// ---------------- Earth and Moon textures ----------------
function earthTexture() {
  return TEX(4096, 2048, (P) => {
    const { g, w, h } = P, X = (lon) => ((lon + 180) / 360) * w, Y = (lat) => ((90 - lat) / 180) * h;
    for (const rg of LAND) {
      const pts = []; let off = 0, prev = null;
      for (let i = 0; i < rg.length; i += 2) {
        const raw = rg[i] / 5;
        if (prev !== null) { if (raw + off - prev > 180) off -= 360; else if (prev - (raw + off) > 180) off += 360; }
        pts.push([raw + off, rg[i + 1] / 5]); prev = raw + off;
      }
      for (const s of [-360, 0, 360]) {
        g.beginPath(); pts.forEach(([lo, la], k) => (k ? g.lineTo : g.moveTo).call(g, X(lo + s), Y(la))); g.closePath();
        g.fillStyle = "rgba(0,0,255,1)"; g.fill();
        g.strokeStyle = "rgba(0,255,0,0.8)"; g.lineWidth = 2.4; g.stroke();
      }
    }
    for (let lat = -60; lat <= 60; lat += 30) P.hline((lat + 90) / 180, lat ? 0.16 : 0.3, 2);
    for (let lon = -180; lon < 180; lon += 30) P.vline((lon + 180) / 360, 0.16, 2, 0.04, 0.96);
    // Sriharikota
    P.ring((J_SHAR[1] + 180) / 360, (J_SHAR[0] + 90) / 180, 9, 0.95, 3); P.dot((J_SHAR[1] + 180) / 360, (J_SHAR[0] + 90) / 180, 3.5, 1);
  });
}
// the lunar south pole's named craters, in degrees (lon east, lat), radius in degrees of arc
const MOON_SOUTH = [[129.78, -89.67, 0.35], [-87.1, -88.5, 0.55], [26.8, -67.7, 1.6], [15.0, -73.0, 1.5], [43.3, -72.9, 1.6], [24.6, -76.7, 1.3], [82.9, -84.9, 1.7], [-12.9, -85.9, 1.2], [93.9, -87.3, 0.6], [5.1, -79.8, 0.8], [-8.9, -63.0, 1.7], [44.0, -70.8, 0.6]];
function moonTexture() {
  return TEX(4096, 2048, (P) => {
    const { g, w, h } = P, X = (lon) => ((lon + 180) / 360) * w, Y = (lat) => ((90 - lat) / 180) * h;
    const blob = (lon, lat, rx, ry, ch, a) => {
      g.fillStyle = ch === "ink" ? `rgba(0,255,0,${a})` : `rgba(0,0,255,${a})`;
      for (const s of [-360, 0, 360]) { g.beginPath(); g.ellipse(X(lon + s), Y(lat), (rx / Math.max(0.2, Math.cos(lat * DEG)) / 360) * w, (ry / 180) * h, 0, 0, TAU); g.fill(); }
    };
    const crater = (lon, lat, r, a = 0.35, floor = 0) => {
      const rx = Math.min(w * 0.4, (r / Math.max(0.03, Math.cos(lat * DEG)) / 360) * w), ry = (r / 180) * h;
      if (floor) { g.fillStyle = `rgba(0,0,255,${floor})`; g.beginPath(); g.ellipse(X(lon), Y(lat), rx, ry, 0, 0, TAU); g.fill(); }
      g.strokeStyle = `rgba(0,255,0,${a})`; g.lineWidth = Math.max(1, Math.min(3, ry * 0.12));
      g.beginPath(); g.ellipse(X(lon), Y(lat), rx, ry, 0, 0, TAU); g.stroke();
    };
    const MARIA = [
      [-55, 20, 18, 16], [-65, 5, 14, 14], [-45, 32, 14, 10], [-48, -2, 12, 10], [-70, 25, 10, 12], [-60, 40, 10, 8],
      [-16, 33, 18, 14], [-25, 39, 10, 8], [-5, 38, 8, 6],
      [17.5, 28, 10, 9], [31, 8, 12, 8.5], [24, 4, 7, 5], [38, 14, 8, 6], [21, 15, 4, 4],
      [59, 17, 8, 6.5], [51, -6, 8, 10], [48, -14, 6, 5], [35, -15, 5.5, 5],
      [-17, -20, 11, 9], [-23, -10, 6, 5], [-39, -24, 6, 6], [4, 13, 5, 4], [-31, 7, 8, 6], [1, 2, 4, 3],
      [-10, 56, 22, 4.5], [20, 57, 18, 4], [-35, 55, 10, 4], [86, 13, 4, 4], [87, -2, 4, 4], [89, -46, 7, 6],
      [147, 27, 4, 4], [129, -21, 2, 2], [163, -34, 3, 3], [-95, -20, 4, 4],
    ];
    for (const [lo, la, rx, ry] of MARIA) blob(lo, la, rx, ry, "alt", 0.8);
    blob(-170, -53, 32, 16, "alt", 0.22);                                   // South Pole–Aitken basin, a faint low
    for (const [lo, la, r, f] of [[-20, 9.6, 1.5], [-11.4, -43.3, 1.4], [-38, 8.1, 0.55], [-47.5, 23.7, 0.6], [-9.3, 51.6, 1.7, 0.7], [-68, -5.2, 2.8, 0.7],
      [61, -8.9, 2.1], [60.4, -25.3, 3], [26.4, -11.4, 1.6], [-14.4, -58.8, 3.8], [-1.9, -9.3, 2.5], [-3, -13.4, 1.9], [-4, 29.7, 1.4, 0.3], [-11.3, 14.5, 0.9], [29.9, 31.8, 1.6]])
      crater(lo, la, r, 0.5, f || 0);
    for (const [lo, la, r] of MOON_SOUTH) crater(lo, la, r, 0.55, 0.25);
    let s = 2023; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 1600; i++) { const lo = rnd() * 360 - 180, la = Math.asin(rnd() * 2 - 1) / DEG, r = 0.25 + Math.pow(rnd(), 5) * 3.5; crater(lo, la, r, 0.12 + 0.18 * rnd()); }
    for (let lat = -60; lat <= 60; lat += 30) P.hline((lat + 90) / 180, 0.06, 1.2);
    // the three named points
    for (const [lat, lon] of [J_SITES.shiv, J_SITES.tiranga, J_SITES.jawahar]) { P.ring((lon + 180) / 360, (lat + 90) / 180, 7, 1, 2.6); P.dot((lon + 180) / 360, (lat + 90) / 180, 2.6, 1); }
  }, { aniso: 8 });
}

// ---------------- build ----------------
function journeyShell() {   // the empty root is registered at startup; its contents are built on first visit
  const g = mod("jMap"); g.position.copy(J_ORIGIN); g.visible = false;
  MODULES.jMap = { name: "The journeys", desc: "", kv: [] };
  SHOW.jMap = { key: "jMap", group: g, asm: [], fx: [], journey: true, view: { az: 0, el: 58 * DEG }, dynSphere: true };
  SHOW_ROOT.add(g); J.root = g;
  MODULES.jEarth = { name: "Earth", kv: [["Radius", "6,371 km mean"], ["Launch site", "Sriharikota · 13.72°N 80.23°E"]] };
  MODULES.jMoon = { name: "The Moon", kv: [["Radius", "1,737.4 km mean"], ["Distance", "384,400 km mean"]] };
  for (const key of ["C1", "C2", "C3"]) {
    const M = J_MIS[key];
    for (const p of M.phases) MODULES[p.id] = { name: p.name || `${M.name} · ${p.label}`, desc: p.desc, kv: p.kv };
    MENU.push([`Journey · ${M.name}`, M.phases.map((p) => [p.id, p.label, { mods: [], info: [p.id], show: "jMap", root: true, jv: p.view, mis: key, onSelect: (prev) => journeyGo(p.id, prev !== "jMap") }])]);
    const [, items] = MENU[MENU.length - 1];
    for (const [id, label, o] of items) MENU_ITEMS[id] = { id, label, ...o };
  }
}
function buildJourney() {
  if (J.built) return; J.built = true;
  const root = J.root;
  for (const k of ["C1", "C2", "C3"]) J.tracks[k] = buildMissionTrack(k);
  // Earth: Sriharikota under the start of the C-3 launch track; the globe turns with mission time
  const tilt = new THREE.Group(), spin = new THREE.Group();
  root.add(tilt); tilt.add(spin);
  J.spin = spin; J.tilt = tilt;
  J.earthTh = (key, hours) => { const tr = J.tracks[key], a0 = Math.atan2(-tr.T[0].p.z, tr.T[0].p.x); return a0 - J_SHAR[1] * DEG + J_SPIN * hours; };
  tilt.quaternion.identity();
  const eT = earthTexture(), mT = moonTexture();
  mod("jEarth", spin); within("jEarth", (g) => add(g, new THREE.SphereGeometry(J_RE, 160, 80), "sea", { map: eT, alt: "hi", inkA: 0.7, rim: 0.4 }));
  // Earth's axis drawn upright in this frame (a drawing liberty: the real equator is tilted to the Moon's orbit)
  const mg = mod("jMoon", root); mg.position.copy(J_MC); mg.rotation.y = Math.PI;   // near side toward Earth
  within("jMoon", (g) => add(g, new THREE.SphereGeometry(J_RM, 200, 100), "light", { map: mT, inkA: 0.75, rim: 0.4 }));
  J.moonRing = jLine(ring(V3(), J_DEM, 720), { w: 1, af: 0.18, dash: 9, hide: 0.5 }); root.add(J.moonRing);
  for (const k of ["C1", "C2", "C3"]) {
    const tr = J.tracks[k], M = J_MIS[k];
    tr.line = jLine(tr.T.map((t) => t.p), { w: 2.2, col: "hl", colF: "ink", a: 1, af: 0.32, dash: 6, hide: 0.18, prog: tr.T.map((_, i) => i) });
    root.add(tr.line);
    // the final science orbit, drawn whole
    const [q, Q] = M.lunar[M.lunar.length - 1], f = conic(rM(q), rM(Q), J_MUM);
    tr.orbit = jLine(Array.from({ length: 241 }, (_, i) => lunarPt(tr.lon, tr.thP - (i / 240) * TAU, f.r((i / 240) * TAU))), { w: 1.1, af: 0.5, a: 0.5, hide: 0.05 });
    root.add(tr.orbit);
  }
  // Chandrayaan-3's propulsion module, back to a high Earth orbit
  { const M = J_MIS.C3.pm, f = conic(rE(M.q), rE(M.Q)), ph = J.tracks.C3.phiP + 200 * DEG;
    J.pmLine = jLine(Array.from({ length: 361 }, (_, i) => azv(ph + (i / 360) * TAU, f.r((i / 360) * TAU), 0)), { w: 1.6, col: "hl", colF: "ink", a: 0.9, af: 0.9, dash: 0, hide: 0.2 });
    root.add(J.pmLine);
    // the way home, sketched: out of lunar orbit, past the Moon, down to the first perigee (the four flybys are not drawn)
    J.pmPeri = azv(ph, f.r(0));
    const a0 = J_MC.clone().add(V3(0, 0, -J_RM * 3)), c1 = J_MC.clone().add(V3(-40, 0, -70)), c2 = J.pmPeri.clone().add(azv(ph - 90 * DEG, 120));
    const bz = (t) => a0.clone().multiplyScalar((1 - t) ** 3).add(c1.clone().multiplyScalar(3 * (1 - t) ** 2 * t)).add(c2.clone().multiplyScalar(3 * (1 - t) * t * t)).add(J.pmPeri.clone().multiplyScalar(t ** 3));
    J.pmHome = jLine(Array.from({ length: 121 }, (_, i) => bz(i / 120)), { w: 1.2, col: "hl", colF: "ink", a: 0.7, af: 0.6, dash: 7, hide: 0.2 });
    root.add(J.pmHome);
    J.pmBox = (() => { const P = [J_MC, ...Array.from({ length: 73 }, (_, i) => azv(ph + (i / 72) * TAU, f.r((i / 72) * TAU)))]; const x = P.map((q) => q.x), z = P.map((q) => q.z); return { x0: Math.min(...x), x1: Math.max(...x), z0: Math.min(...z), z1: Math.max(...z) }; })(); }
  for (const m of [...MODS.jEarth.meshes, ...MODS.jMoon.meshes]) PICK.push(m);
  journeyLabels();
}

// ---------------- labels and markers (HTML over the canvas) ----------------
const J_SITES = { shiv: [-69.37, 32.32], tiranga: [-70.881, 22.784], jawahar: [-89.55, -122.93] };
const sitePos = (s, lift = 0) => J_MC.clone().add(selen(...J_SITES[s]).multiplyScalar(J_RM + lift));
function journeyLabels() {
  const box = $("#jlab");
  const mk = (cls, html) => { const e = el("div", { class: "jl " + cls }, html); box.append(e); return e; };
  const at = (k) => { const tr = J.tracks[J.mis]; return tr.T[tr.idx[J.mis + k]]?.p || V3(); };
  const ph = () => J_BY[C.sel], phv = () => ph()?.view || "";
  const all = (v) => ["all", "coast"].includes(v);
  J.labels = [
    { e: mk("body", "Earth"), p: () => V3(0, J_RE * 1.08, 0), on: () => all(phv()) || phv() === "earth" || phv() === "pm" },
    { e: mk("body", "Moon"), p: () => J_MC.clone().add(V3(0, J_RM * 1.15, 0)), on: () => all(phv()) || phv() === "loi" },
    { e: mk("site below", "Sriharikota"), p: () => J.tracks[J.mis].T[0].p.clone().setLength(J_RE), on: () => phv() === "launch" },
    { e: mk("site below", "Shiv Shakti Point · C-3 landing"), p: () => sitePos("shiv"), on: () => ["site", "moon"].includes(phv()) && J.mis !== "C1" },
    { e: mk("site", "Tiranga Point · C-2 crash"), p: () => sitePos("tiranga"), on: () => ["site", "moon"].includes(phv()) && J.mis !== "C1" },
    { e: mk("site", "Jawahar Point · C-1 impact probe"), p: () => sitePos("jawahar"), on: () => ["site", "moon", "mip"].includes(phv()) && J.mis === "C1" },
    { e: mk("note", ""), p: () => J.note.p(), on: () => !!J.note?.text, txt: () => J.note?.text || "" },
  ];
  J.mk = mk("craft", "<i></i><span></span>");
}
const _jp = new THREE.Vector3();
function journeyOverlay(camera) {
  const box = $("#jlab"), on = SHOW[curShow()]?.journey && J.built;
  box.hidden = !on; if (!on) return;
  const r = PIPE.renderer.domElement, W = r.clientWidth, H = r.clientHeight;
  const placed = [];
  const place = (e, p, show) => {
    if (!show) { e.style.display = "none"; return; }
    _jp.copy(p).add(J_ORIGIN).project(camera);
    const x = (_jp.x + 1) / 2 * W, y = (1 - _jp.y) / 2 * H;
    const out = x < -40 || y < -20 || x > W + 40 || y > H + 20, flip = x > W * 0.66;
    e.style.display = out ? "none" : "";
    e.classList.toggle("flip", flip);
    if (!out) placed.push({ e, x, y, flip });
  };
  // labels that would sit on top of one another are pushed down, the craft's tag first in line
  const tf = (L, dy) => `translate(${L.x.toFixed(1)}px, ${(L.y + dy).toFixed(1)}px)` + (L.flip && !L.e.classList.contains("craft") ? " translateX(-100%)" : "");
  const unstack = () => {
    placed.sort((a, b) => (b.e === J.mk) - (a.e === J.mk));
    for (const L of placed) L.e.style.transform = tf(L, 0);
    const rects = placed.map((L) => { const t = L.e.classList.contains("craft") ? L.e.querySelector("span") : L.e, r = t?.getBoundingClientRect(); return r && r.width ? r : null; });
    const boxes = [];
    placed.forEach((L, i) => {
      const r = rects[i]; if (!r) return;
      let dy = 0;
      for (let k = 0; k < 6; k++) { const hit = boxes.find((b) => r.left < b.x1 && r.right > b.x0 && r.top + dy - 2 < b.y1 && r.bottom + dy + 2 > b.y0); if (!hit) break; dy = hit.y1 - r.top + 3; }
      boxes.push({ x0: r.left, x1: r.right, y0: r.top + dy, y1: r.bottom + dy });
      if (dy) L.e.style.transform = tf(L, dy);
    });
  };

  for (const L of J.labels) { const on = L.on(); if (L.txt) put(L.e, "text", L.txt()); place(L.e, on ? L.p() : null, on); }
  const p = J_BY[C.sel];
  const pmv = p?.view === "pm";
  place(J.mk, pmv ? J.pmPeri : journeyPos(J.cur), pmv || !!p?.craft || J.t < 1);
  if (p) put(J.mk.querySelector("span"), "text", pmv ? "Propulsion module" : J.t < 1 ? "" : p.craft || "");
  unstack();
}
function journeyPos(f) { const T = J.tracks[J.mis].T, i = clamp(Math.floor(f), 0, T.length - 1), k = Math.min(T.length - 1, i + 1); return T[i].p.clone().lerp(T[k].p, f - i); }
function journeyDate(f) { const T = J.tracks[J.mis].T, i = clamp(Math.floor(f), 0, T.length - 1), k = Math.min(T.length - 1, i + 1); return lerp(T[i].d, T[k].d, f - i); }
function journeyGo(id, enter) {
  buildJourney();
  const ph = J_BY[id], key = ph.mis, tr = J.tracks[key];
  const switching = key !== J.mis;
  J.mis = key;
  const to = tr.idx[ph.at] ?? tr.T.length - 1;
  J.from = enter || switching ? to : J.cur; J.to = to; J.t = enter || switching || REDUCED ? 1 : 0; if (J.t >= 1) J.cur = to;
  J.note = ph.note ? { text: ph.note, p: () => { const t = J.tracks[J.mis], i = clamp((t.idx[ph.at] ?? 0) + (ph.noteOff || 0), 0, t.T.length - 1); return t.T[i].p; } } : null;
  for (const k of ["C1", "C2", "C3"]) { J.tracks[k].line.visible = k === key; J.tracks[k].orbit.visible = k === key; }
  J.pmLine.visible = J.pmHome.visible = key === "C3" && ph.view === "pm";
  J.moonRing.visible = ph.view === "all" || ph.view === "coast";
  const v = journeyFrameBox(ph.view);
  if (enter || switching) { CAM.az = v.az; CAM.el = v.el; CAM.fly = null; }
  else CAM.fly = { az: CAM.az + Math.atan2(Math.sin(v.az - CAM.az), Math.cos(v.az - CAM.az)), el: v.el };
  UI.sync?.();
}
function journeyFrame(dt) {
  if (!J.built || !SHOW[curShow()]?.journey) return false;
  const busy = J.t < 1;
  if (busy) { J.t = Math.min(1, J.t + dt / (Math.abs(J.to - J.from) > 800 ? 2.8 : 1.8)); J.cur = lerp(J.from, J.to, ease(J.t)); }
  J.date = journeyDate(J.cur);
  J.spin.rotation.y = J.earthTh(J.mis, Math.min(J.date, 1.2) * 24);
  const tr = J.tracks[J.mis];
  tr.line.material.uniforms.uProgress.value = J_BY[C.sel]?.whole ? 1e9 : J.cur;
  return busy;
}
// per-frame uniforms for the line pass (called by the pipeline just before the FX layer)
function journeyFX(camera, pipe) {
  if (!J.built || !J.root.visible) return;
  const px = (camera.top - camera.bottom) / pipe.ch, dpr = pipe.dpr || 1;
  for (const m of J.lines) {
    const u = m.material.uniforms, d = m.userData.j;
    u.tDepth.value = pipe.rtN.depthTexture; u.uRes.value.set(pipe.cw, pipe.ch);
    u.uNear.value = camera.near; u.uFar.value = camera.far; u.uPx.value = px; u.uW.value = d.w * dpr;
    u.uCol.value.copy(PAL[d.col]); u.uColF.value.copy(PAL[d.colF]);
    u.uDash.value = d.dash * dpr;
  }
}
function journeyDepth() { return Math.max(CAM.h * 1.2, 30); }
// camera frame for a phase: centre (journey-local), width × height it needs, the view angle
const lookAt = (dir, el) => ({ az: Math.atan2(dir.x, dir.z), el });
function journeyFrameBox(view) {
  const key = J.mis, M = J_MIS[key], tr = J.tracks[key] || buildMissionTrack(key), top = (el = 58 * DEG) => ({ az: 0, el });
  const maxQ = Math.max(...M.ebn.map((e) => rE(e[1])));
  const siteDir = selen(...(M.site || J_SITES.jawahar));
  switch (view) {
    case "all": return { c: V3(J_DEM / 2, 0, 0), w: J_DEM + 60, h: 90, az: 0, el: 66 * DEG };
    case "coast": return { c: V3(J_DEM / 2, 0, 0), w: J_DEM + 60, h: 90, az: 0, el: 58 * DEG };
    case "launch": { const a = tr.T[0].p, b = tr.T[tr.idx[key + "Launch"]].p; return { c: a.clone().lerp(b, 0.5).setLength(J_RE + 0.4), w: 7, h: 4.6, ...lookAt(a.clone().lerp(b, 0.5), 30 * DEG) }; }
    case "earth": { const c = azv(tr.phiP + Math.PI, (maxQ - rE(M.ebn[0][0])) / 2); return { c, w: maxQ * 1.25 + 10, h: maxQ * 0.62 + 10, ...top(62 * DEG) }; }
    case "tli": return { c: V3(J_DEM * 0.48, 0, 0), w: J_DEM + 30, h: 140, ...top(52 * DEG) };
    case "loi": { const Q = rM(M.loi.Q); return { c: J_MC.clone().add(V3(0, -Q * 0.3, 0)), w: Q * 1.7 + 6, h: Q * 1.25 + 6, ...lookAt(selen(0, tr.lon + 90), 14 * DEG) }; }
    case "moon": return { c: J_MC.clone(), w: 7.2, h: 5.6, ...lookAt(selen(0, tr.lon + 90), 12 * DEG) };
    case "site": return { c: J_MC.clone().add(siteDir.clone().multiplyScalar(J_RM * 0.92)), w: 1.6, h: 1.1, ...lookAt(siteDir.clone().setY(0).add(selen(0, tr.lon + 90).multiplyScalar(0.8)), -18 * DEG) };
    case "mip": return { c: J_MC.clone().add(V3(0, -J_RM * 0.75, 0)), w: 3.6, h: 2.8, ...lookAt(selen(0, tr.lon + 90), -8 * DEG) };
    case "pm": { const B = J.pmBox, el = 64 * DEG; return { c: V3((B.x0 + B.x1) / 2, 0, (B.z0 + B.z1) / 2), w: B.x1 - B.x0 + 60, h: (B.z1 - B.z0) * Math.sin(el) + 60, ...top(el) }; }
  }
  return { c: V3(), w: 30, h: 30, ...top() };
}
function J_READOUT() {
  const ph = J_BY[C.sel]; if (!ph || !J.built) return "";
  if (ph.view === "pm") return `Chandrayaan-3 · propulsion module back around Earth<small>First perigee 22 Nov 2023 · ${fmt(154000)} km from Earth · 27° · period ≈ 13 days</small>`;
  const M = J_MIS[J.mis], t0 = utcMs(M.launch), p = journeyPos(J.cur), dE = p.length() * 1000, dM = p.distanceTo(J_MC) * 1000;
  const near = dM < 70000 ? `${fmt(Math.max(0, dM - J_RM * 1000))} km above the Moon` : `${fmt(Math.max(0, dE - J_RE * 1000))} km from Earth's surface`;
  return `${M.name} · ${ph.label}<small>Day ${fmt(J.date, 1)} · ${fmtIST(t0 + J.date * 864e5)} · ${near}</small>`;
}
const J_CAPTION = "Earth, the Moon, their distance and every orbit are drawn to scale, 1 unit to 1,000 km, in a frame that turns with the Moon. Each Earth-bound orbit is shown as one lap, though the spacecraft flew several laps between burns; the lunar orbits are polar and drawn in the plane of the landing site's meridian.";
