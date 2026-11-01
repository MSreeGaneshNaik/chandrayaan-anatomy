// ============================================================================
// 90 · CAPTURE (capture build only) — offline video plates for the launch film.
// The page's own loop is held. Each output frame steps the simulation by exact
// time steps, renders S sub-frames at supersampled resolution, averages them in
// linear light (motion blur), box-filters to the output size and hands the frame
// to the GPU's H.264 encoder. Finished chunks go to the artifact's asset store,
// where Claude collects them. Every frame is a pure function of plate time.
// ============================================================================
const CAPT = { on: false, insets: { top: 0, bottom: 0 }, W: 1080, H: 1350, dpr: 2, ss: 1.5, lw: 0, fps: 60, sub: 3, shutter: 0.5, t: 0, bitrate: 34e6, chunkSec: 3, stop: false };
{ let ui = UI.insets; Object.defineProperty(UI, "insets", { configurable: true, get: () => (CAPT.on ? CAPT.insets : ui), set: (v) => { ui = v; } }); }
{ const r0 = PIPE.resize.bind(PIPE); PIPE.resize = (w, h, d) => (CAPT.on ? r0(CAPT.W, CAPT.H, CAPT.dpr) : r0(w, h, d)); }
const D2R = Math.PI / 180;
const eio = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10));
const ein = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x);
const eout = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - (1 - x) ** 3);
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

// ---------- linear-light accumulator + box filter, on its own WebGL2 context ----------
function makeAcc(outW, outH) {
  const cv = document.createElement("canvas"); cv.width = outW; cv.height = outH;
  const gl = cv.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, alpha: false, depth: false, premultipliedAlpha: false });
  if (!gl) throw new Error("no WebGL2 for the accumulator");
  const f32 = gl.getExtension("EXT_color_buffer_float"); gl.getExtension("EXT_float_blend");
  const VS = `#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
  const FA = `#version 300 es
precision highp float; uniform sampler2D uSrc; uniform vec2 uS, uO; uniform int uN; uniform float uW; out vec4 o;
void main(){ vec2 p = gl_FragCoord.xy; float r = uS.x / uO.x, n = float(uN); vec3 s = vec3(0.0);
  for (int j = 0; j < 6; j++) { if (j >= uN) break; for (int i = 0; i < 6; i++) { if (i >= uN) break;
    vec2 q = (p - 0.5 + (vec2(float(i), float(j)) + 0.5) / n) * r;
    s += pow(texture(uSrc, vec2(q.x / uS.x, 1.0 - q.y / uS.y)).rgb, vec3(2.2)); } }
  o = vec4(s / (n * n) * uW, uW); }`;
  const FR = `#version 300 es
precision highp float; uniform sampler2D uAcc; uniform float uSeed; out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }
void main(){ vec4 a = texelFetch(uAcc, ivec2(gl_FragCoord.xy), 0); vec3 c = pow(max(a.rgb / max(a.a, 1e-6), 0.0), vec3(1.0 / 2.2));
  float d = (h(gl_FragCoord.xy) + h(gl_FragCoord.xy + 17.31) - 1.0) / 255.0; o = vec4(c + d, 1.0); }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = (fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
  const pA = prog(FA), pR = prog(FR);
  const tex = (min) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, min); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
  const src = tex(gl.LINEAR), accT = tex(gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, accT);
  gl.texImage2D(gl.TEXTURE_2D, 0, f32 ? gl.RGBA32F : gl.RGBA16F, outW, outH, 0, gl.RGBA, gl.FLOAT, null);
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, accT, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (!ok) throw new Error("float accumulation target unsupported");
  const U = (p, n) => gl.getUniformLocation(p, n);
  return {
    canvas: cv, gl,
    clear() { gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, outW, outH); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); },
    add(srcCanvas, w = 1) {
      gl.bindTexture(gl.TEXTURE_2D, src);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, outW, outH);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(pA); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src);
      gl.uniform1i(U(pA, "uSrc"), 0); gl.uniform2f(U(pA, "uS"), srcCanvas.width, srcCanvas.height); gl.uniform2f(U(pA, "uO"), outW, outH);
      gl.uniform1i(U(pA, "uN"), Math.min(6, Math.max(1, Math.ceil(srcCanvas.width / outW - 1e-6) + (Math.abs(srcCanvas.width / outW - Math.round(srcCanvas.width / outW)) > 0.01 ? 1 : 0)))); gl.uniform1f(U(pA, "uW"), w);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disable(gl.BLEND);
    },
    resolve(seed) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, outW, outH);
      gl.useProgram(pR); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, accT);
      gl.uniform1i(U(pR, "uAcc"), 0); gl.uniform1f(U(pR, "uSeed"), (seed % 997) * 0.731);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}

// ---------- state helpers ----------
function capReset() {
  shutdown(); C.explode = false; C.sx = false; C.exAmt = 0; C.sxAmt = 0; C.hover = null; C.thr = 1; C.alt = 0;
  for (const k in C.off) C.off[k]?.fill?.(0);
  for (const fx of FX_LIST) { const d = fx.userData; d.level = 0; d.target = 0; d.on = false; d.front = 0; d.cut = 0; d.tCut = 0; d.thrust = 0; fx.material.uniforms.uInt.value = 0; }
  for (const S of Object.values(SHOW)) if (S.asm) { S.leaders = false; for (const a of S.asm) a.group.position.set(0, 0, 0); }
  CAM.script = null; CAM.user = false; CAM.fly = null; CAM.keys.clear(); CAM.snap = true;
}
function zeroHI() { for (const k in MODS) { HI[k] = 0; MODS[k].mats.forEach((m) => (m.uniforms.uHi.value = 0)); } }
function stepSim(dt) { applyFrame(dt); journeyFrame(dt); descentFrame(dt); }
// the framing the page itself would choose for an item, seen from (az, el), widened by 1/zoom
function frameFor(id, az, el, zoom = 1) {
  const sel = C.sel, a0 = CAM.az, e0 = CAM.el;
  C.sel = id; CAM.az = az * D2R; CAM.el = el * D2R; camBasis();
  const f = focusFrame();
  C.sel = sel; CAM.az = a0; CAM.el = e0; camBasis();
  return { c: f.c.clone(), h: f.h / zoom, az: az * D2R, el: el * D2R };
}
// a framing that fits a world-space box into the free band, seen from (az, el)
function frameBox(min, max, az, el, k = 1.06) {
  const a0 = CAM.az, e0 = CAM.el; CAM.az = az * D2R; CAM.el = el * D2R; camBasis();
  const b = new THREE.Box3(V3(...min), V3(...max)), c = b.getCenter(V3());
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < 8; i++) {
    const p = V3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).sub(c);
    const x = p.dot(CAM_RIGHT), y = p.dot(CAM_UP);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  c.addScaledVector(CAM_RIGHT, (x0 + x1) / 2).addScaledVector(CAM_UP, (y0 + y1) / 2);
  const f = fitBand(c, Math.max(y1 - y0, (x1 - x0) / (PIPE.w / PIPE.h)), k);
  CAM.az = a0; CAM.el = e0; camBasis();
  return { c: f.c.clone(), h: f.h, az: az * D2R, el: el * D2R };
}
function setView(a, b, e) {
  CAM.target.lerpVectors(a.c, b.c, e); CAM.h = Math.exp(lerp(Math.log(a.h), Math.log(b.h), e));
  CAM.az = lerp(a.az, b.az, e); CAM.el = lerp(a.el, b.el, e);
}
function shiftView(v, dx, dy) { const s = { ...v, c: v.c.clone() }; const a = CAM.az, e = CAM.el; CAM.az = v.az; CAM.el = v.el; camBasis(); s.c.addScaledVector(CAM_RIGHT, dx * v.h).addScaledVector(CAM_UP, dy * v.h); CAM.az = a; CAM.el = e; camBasis(); return s; }
const _pv = V3();
function proj(v) { const cam = window.CH.camera(); _pv.copy(v).project(cam); return [Math.round((_pv.x + 1) / 2 * CAPT.W * 10) / 10, Math.round((1 - _pv.y) / 2 * CAPT.H * 10) / 10, +(_pv.z < 1 && _pv.z > -1)]; }
const keyPos = (k) => proj(boxOf([k]).getCenter(V3()));
const r2 = (x) => Math.round(x * 100) / 100;

// ---------- the plates ----------
// from: plate time of frame 0 (negative = head handle); dur: seconds; lead: simulated seconds before `from`
// setup(): runs at t = from − lead; events: [t, fn]; drive(t): before each simulation step; view(t): render-only camera;
// meta(t): per-frame data for the overlay pass (telemetry, label anchors)
// LIVE: the page's own framing of an item (or a world box), recomputed every frame, turned and zoomed over the plate
const LIVE = (o) => function (t) {
  const u = seg(t, o.t0 ?? 0, o.t1 ?? this.dur + (this.from || 0)), az = lerp(o.az[0], o.az[1], u), el = lerp(o.el[0], o.el[1], u), z = lerp(o.z[0], o.z[1], eio(u));
  let f = o.box ? frameBox(o.box[0], o.box[1], az, el, o.k ?? 1.06) : frameFor(o.id, az, el, 1);
  f = { ...f, h: f.h / z }; if (o.dy) f = shiftView(f, 0, o.dy);
  CAM.target.copy(f.c); CAM.h = f.h; CAM.az = f.az; CAM.el = f.el;
};
const ORB = (a0, a1, e0, e1, T) => (t) => { const u = seg(t, 0, T); CAM.az = lerp(a0, a1, u) * D2R; CAM.el = lerp(e0, e1, u) * D2R; CAM.fly = null; CAM.user = false; };
const PLATES = {
  // 0–12 s · cold open: the S200s light at night; the camera rises from the deck to the whole vehicle
  lvm3_ignite: {
    from: 0, dur: 12.5, lead: 0.4, insets: { top: 430, bottom: 40 },
    setup() { selectItem("stack"); },
    events: [[0.45, () => ignite()]],
    view(t) {
      const V = this._v || (this._v = { a: frameBox([-8, -9.4, -8], [8, 9, 8], 24, 3, 1.0), b: frameBox([-6, -9.4, -3], [6, 46, 3], 40, 7, 1.02), c: frameBox([-7, -10, -3], [7, 46.5, 3], 52, 12, 1.08) });
      if (t < 8) setView(V.a, V.b, eio(seg(t, 0.6, 8)));
      else setView(V.b, V.c, seg(t, 8, 12.5));
    },
  },
  // 13.5–16 · PSLV-C11: four ground-lit boosters and the core light
  pslv_ign: {
    from: -0.25, dur: 2.75, lead: 0.3, insets: { top: 220, bottom: 300 },
    setup() { selectItem("pslv"); },
    events: [[0.05, () => ignite()]],
    view(t) { const V = this._v || (this._v = { a: shiftView(frameFor("pslv", 26, 4, 1.45), 0, -0.12), b: shiftView(frameFor("pslv", 36, 6, 1.25), 0, -0.08) }); setView(V.a, V.b, eio(seg(t, -0.25, 2.5))); },
  },
  // 16–18.5 · …and the six boosters fall away (taken apart)
  pslv_apart: {
    from: -0.25, dur: 2.75, lead: 0.3, insets: { top: 220, bottom: 300 },
    setup() { selectItem("pslv"); },
    events: [[0.0, () => setExplode(true)]],
    view: LIVE({ id: "pslv", az: [40, 62], el: [8, 14], z: [1.9, 1.7] }),
  },

  // 18.5–22 · Chandrayaan-1; the camera settles on M³, the instrument that found the water
  c1: {
    from: -0.25, dur: 4.0, lead: 0.4, insets: { top: 200, bottom: 330 },
    setup() { selectItem("c1whole"); },
    view: LIVE({ id: "c1whole", az: [28, 56], el: [14, 20], z: [1.45, 1.9] }),
  },

  // 23.5–28 · CE-20 comes apart to its turbopumps
  ce20: {
    from: -0.25, dur: 4.75, lead: 0.4, insets: { top: 200, bottom: 330 },
    setup() { selectItem("dCE20"); },
    events: [[0.6, () => setExplode(true)]],
    view: LIVE({ id: "dCE20", az: [26, 58], el: [10, 18], z: [1.6, 1.75] }),
    meta() { return { k: ["ftp", "otp", "gg", "tca", "nz"].map((s) => keyPos("dCE20." + s)) }; },
  },

  // 28–32.5 · 7 Sep 2019: Vikram's last 2.4 km, to the moment the signal stops
  land2: {
    from: -0.25, dur: 4.75, lead: 0.3, insets: { top: 260, bottom: 300 },
    setup() { selectItem("land2"); DS.playing = false; },
    drive(t) { DS.t = lerp(800, 838, seg(t, -0.25, 4.5)); DS.playing = false; },
    view: LIVE({ id: "land2", az: [30, 40], el: [8, 6], z: [1.45, 1.6] }),
    meta() { const s = DS.s || {}; return { alt: r2(s.alt), vz: r2(s.vz), vh: r2(s.vh), lit: s.lit, t: r2(DS.t) }; },
  },

  // 37–41 · Chandrayaan-3: the propulsion module's engine fires
  c3: {
    from: -0.25, dur: 4.25, lead: 0.4, insets: { top: 200, bottom: 330 },
    setup() { selectItem("c3whole"); },
    events: [[0.7, () => ignite()]],
    view: LIVE({ id: "c3whole", az: [-30, 0], el: [12, 16], z: [1.08, 1.2] }),
  },

  // 41–45 · the forty-day journey drawn on the to-scale map
  journey: {
    from: -0.25, dur: 4.25, lead: 0.2, insets: { top: 220, bottom: 300 },
    setup() { buildJourney(); selectItem("j3Coast"); },
    drive(t) { const tr = J.tracks.C3, i1 = tr.idx.C3Land; J.t = 1; J.cur = lerp(0, i1, eio(seg(t, 0.1, 3.7))); J.from = J.to = J.cur; },
    view: LIVE({ id: "j3Coast", az: [0, 8], el: [58, 52], z: [1.3, 1.36] }),
    meta() { const g = SHOW.jMap.group.position; return { day: r2(J.date), craft: proj(journeyPos(J.cur).add(g)), earth: proj(g.clone()), moon: proj(J_MC.clone().add(g)) }; },
  },

  // 45–51 · 23 Aug 2023: hover at 150 m, two engines, touchdown at plate 5.0 s
  land3: {
    from: -0.25, dur: 6.25, lead: 0.3, insets: { top: 240, bottom: 300 },
    setup() { selectItem("land3"); DS.playing = false; },
    drive(t) { const u = seg(t, -0.25, 5.0); DS.t = t <= 5 ? 1000 + 140 * (0.82 * (1 - (1 - u) ** 2) + 0.18 * u) : 1140; DS.playing = false; },
    view: LIVE({ id: "land3", az: [24, 34], el: [6, 9], z: [1.5, 1.85] }),
    meta() { const s = DS.s || {}; return { alt: r2(s.alt), vz: r2(s.vz), lit: s.lit, t: r2(DS.t) }; },
  },

  // 51–54 · Vikram and Pragyan at the site
  vk: {
    from: -0.25, dur: 3.25, lead: 0.4, insets: { top: 200, bottom: 330 },
    setup() { selectItem("vkWhole"); },
    view: LIVE({ id: "vkWhole", az: [-20, 4], el: [12, 15], z: [1.0, 1.15] }),
  },

  // 54–58 · every engine, side by side, lit
  lineup: {
    from: -0.25, dur: 4.25, lead: 0.4, insets: { top: 200, bottom: 340 },
    setup() { selectItem("engAll"); },
    events: [[0.15, () => ignite()]],
    view: LIVE({ id: "engAll", az: [62, 70], el: [9, 11], z: [1.5, 1.6] }),
  },

  // 58–66 · LVM3 taken apart, turning; the end card sits over its last four seconds
  lvm3_apart: {
    from: -0.25, dur: 8.25, lead: 0.4, insets: { top: 200, bottom: 330 },
    setup() { selectItem("stack"); },
    events: [[0.4, () => setExplode(true)]],
    view: LIVE({ box: [[-8, -9.4, -6], [8, 58, 6]], az: [18, 84], el: [8, 14], z: [1, 1.04] }),
  },

};

// ---------- one plate → frames ----------
let ACC = null;
async function renderPlate(name, onFrame, o = {}) {
  const P = o.plate || PLATES[name]; if (!P) throw new Error("no plate " + name);
  CAPT.on = true; window.CAPTURE_HOLD = true; P._v = null;
  CAPT.W = o.W || 1080; CAPT.H = o.H || 1350; CAPT.dpr = o.dpr ?? 2;
  PIPE.ssForce = o.ss ?? CAPT.ss; PIPE.lwForce = o.lw || 0; PIPE.resize(0, 0, 0);
  if (!o.lw) PIPE.lwForce = Math.max(1, (PIPE.W / CAPT.W) * (o.lineOut ?? 1.05)), PIPE.resize(0, 0, 0);
  if (!ACC || ACC.canvas.width !== CAPT.W || ACC.canvas.height !== CAPT.H) ACC = makeAcc(CAPT.W, CAPT.H);
  capReset(); { const k = CAPT.H / 1350, I = P.insets || { top: 0, bottom: 0 }; CAPT.insets = o.insets ? { ...o.insets } : { top: I.top * k, bottom: I.bottom * k }; }   // insets are given for a 1350 px tall frame
  const fps = o.fps || CAPT.fps, S = o.sub ?? P.sub ?? CAPT.sub, sh = CAPT.shutter;
  const N = o.frames ?? Math.round(P.dur * fps), from = P.from || 0;
  CAPT.t = from - (P.lead ?? 0.4);
  P.setup(); zeroHI(); C.hover = null;
  const evs = (P.events || []).slice().sort((a, b) => a[0] - b[0]); let ev = 0;
  while (ev < evs.length && evs[ev][0] <= CAPT.t) evs[ev++][1]();
  const sim = (tt) => {
    while (CAPT.t < tt - 1e-9) {
      const dt = Math.min(1 / 120, tt - CAPT.t), t1 = CAPT.t + dt;
      while (ev < evs.length && evs[ev][0] <= t1) { evs[ev++][1](); zeroHI(); }
      P.drive?.(t1);
      stepSim(dt); CAPT.t = t1;
    }
  };
  const meta = [];
  const i0 = o.i0 || 0, only = o.only;   // only: list of frame indices (previews)
  const list = only || Array.from({ length: N - i0 }, (_, k) => i0 + k);
  for (const i of list) {
    if (CAPT.stop) break;
    const t0 = from + i / fps;
    ACC.clear();
    for (let k = 0; k < S; k++) {
      const ts = t0 + (S > 1 ? ((k + 0.5) / S - 0.5) * sh / fps : 0);
      sim(ts);
      const sv = { c: CAM.target.clone(), h: CAM.h, az: CAM.az, el: CAM.el };
      P.view?.(ts);
      window.CH.drawScene();
      if (k === 0) meta[i] = P.meta ? P.meta(ts) : null;
      if (k === 0 && o.chrome) { UI.sync?.(); UI.tick?.(true); meta[i] = { ...(meta[i] || {}), title: $("#figTitle")?.textContent || "", readout: $("#readout")?.innerText || "" }; }
      CAM.target.copy(sv.c); CAM.h = sv.h; CAM.az = sv.az; CAM.el = sv.el;
      ACC.add(PIPE.renderer.domElement);
    }
    ACC.resolve(i);
    await onFrame(i, t0, ACC.canvas);
  }
  return { N, meta };
}

// ---------- README stills: single frames at 2160 px, the page's own framing, title and readout recorded ----------
const ST_P = { W: 2160, H: 2700, insets: { top: 250, bottom: 300 } }, ST_L = { W: 2560, H: 1440, insets: { top: 140, bottom: 170 } };
const STILLS = {
  "01-lvm3-ignition": { ...ST_P, t: 3.2, setup() { selectItem("stack"); }, events: [[0, () => ignite()]], view(t) { const f = frameBox([-6, -9.4, -3], [6, 46, 3], 40, 7, 1.04); CAM.target.copy(f.c); CAM.h = f.h; CAM.az = f.az; CAM.el = f.el; } },
  "02-lvm3-apart": { ...ST_P, t: 3.2, setup() { selectItem("stack"); }, events: [[0, () => setExplode(true)]], view: LIVE({ box: [[-9, -9.4, -6], [9, 60, 6]], az: [32, 32], el: [9, 9], z: [1, 1] }) },
  "03-engines": { ...ST_L, t: 3.4, setup() { selectItem("engAll"); }, events: [[0, () => ignite()]], view: LIVE({ id: "engAll", az: [40, 40], el: [7, 7], z: [1.25, 1.25] }) },
  "04-ce20-apart": { ...ST_P, t: 3.0, setup() { selectItem("dCE20"); }, events: [[0, () => setExplode(true)]], view: LIVE({ id: "dCE20", az: [36, 36], el: [14, 14], z: [1.5, 1.5] }) },
  "05-vikas-fire": { ...ST_P, t: 3.0, setup() { selectItem("dVIKAS"); }, events: [[0, () => ignite()]] },
  "06-pslv-ignition": { ...ST_P, t: 3.0, setup() { selectItem("pslv"); }, events: [[0, () => ignite()]], view: LIVE({ id: "pslv", az: [32, 32], el: [5, 5], z: [1.22, 1.22] }) },
  "07-pslv-apart": { ...ST_P, t: 3.0, setup() { selectItem("pslv"); }, events: [[0, () => setExplode(true)]], view: LIVE({ id: "pslv", az: [48, 48], el: [10, 10], z: [1.22, 1.22] }) },
  "08-chandrayaan3": { ...ST_P, t: 3.0, setup() { selectItem("c3whole"); }, events: [[0.2, () => ignite()]], view: LIVE({ id: "c3whole", az: [-18, -18], el: [14, 14], z: [1.05, 1.05] }) },
  "09-vikram-pragyan": { ...ST_P, t: 1.0, setup() { selectItem("vkWhole"); }, view: LIVE({ id: "vkWhole", az: [-8, -8], el: [13, 13], z: [1.05, 1.05] }) },
  "10-landing": { ...ST_P, t: 2.5, setup() { selectItem("land3"); DS.playing = false; }, drive(t) { DS.t = 1131 + Math.min(t, 2.5) * 2.4; DS.playing = false; }, view: LIVE({ id: "land3", az: [28, 28], el: [7, 7], z: [2.0, 2.0] }) },
  "11-journey": { ...ST_L, t: 0.5, setup() { buildJourney(); selectItem("j3All"); }, meta() { const g = SHOW.jMap.group.position; return { earth: proj(g.clone()), moon: proj(J_MC.clone().add(g)) }; } },
  "12-chandrayaan1": { ...ST_P, t: 1.0, setup() { selectItem("c1whole"); }, view: LIVE({ id: "c1whole", az: [40, 40], el: [18, 18], z: [1.15, 1.15] }) },
  "13-chandrayaan2": { ...ST_P, t: 1.0, setup() { selectItem("c2whole"); } },
  "14-chandrayaan3-apart": { ...ST_P, t: 3.0, setup() { selectItem("c3whole"); }, events: [[0, () => setExplode(true)]], view: LIVE({ id: "c3whole", az: [-18, -18], el: [14, 14], z: [1.3, 1.3] }) },
  "15-landing-2019": { ...ST_P, t: 1.0, setup() { selectItem("land2"); DS.playing = false; }, drive() { DS.t = 820; DS.playing = false; }, view: LIVE({ id: "land2", az: [30, 30], el: [8, 8], z: [1.3, 1.3] }) },
};
async function captureStills(names = Object.keys(STILLS)) {
  const A = await assets(); if (!A) throw new Error("asset store unavailable on this view");
  const rec = { stills: [] };
  for (const n of names) {
    if (CAPT.stop) break;
    const S = STILLS[n], plate = { from: 0, dur: S.t + 0.1, lead: 0.4, sub: 1, ...S };
    let blob = null, m = null;
    const r = await renderPlate(n, async (i, t, cv) => { blob = await new Promise((res) => cv.toBlob(res, "image/png")); }, { plate, W: S.W, H: S.H, dpr: 1, ss: 2, sub: 1, lineOut: 1.75, insets: S.insets, only: [Math.round(S.t * 60)], chrome: true });
    m = r.meta[Math.round(S.t * 60)] || {};
    const up = await A.upload(blob, { type: "image/png" });
    rec.stills.push({ name: n, id: up.id, W: S.W, H: S.H, title: m.title, readout: m.readout, earth: m.earth, moon: m.moon, bytes: up.sizeBytes });
    capLog(`${n} → ${up.id} · ${(up.sizeBytes / 1048576).toFixed(1)} MB · ${m.title}`);
  }
  const up = await A.upload(new Blob([JSON.stringify(rec)], { type: "application/json" }), { type: "application/json" });
  capLog(`stills manifest → ${up.id}`); capStat("stills done");
  CAPT.on = false; window.CAPTURE_HOLD = false;
  return rec;
}

// ---------- encode + upload ----------
async function pickCodec() {
  for (const codec of ["avc1.640033", "avc1.640034", "avc1.64002A", "avc1.4D0033"]) {
    const cfg = { codec, width: CAPT.W, height: CAPT.H, bitrate: CAPT.bitrate, framerate: CAPT.fps, hardwareAcceleration: "prefer-hardware", latencyMode: "quality", bitrateMode: "variable", avc: { format: "avc" } };
    const s = await VideoEncoder.isConfigSupported(cfg).catch(() => null);
    if (s?.supported) return cfg;
  }
  throw new Error("no H.264 encoder configuration is supported");
}
let ASSETS = null;
async function assets() { if (!ASSETS) ASSETS = await window.claude?.use?.("assets"); return ASSETS; }
const capLog = (s) => { const el = document.getElementById("capLog"); if (el) { el.textContent = s + "\n" + el.textContent.slice(0, 4000); } console.log("[cap] " + s); };
const capStat = (s) => { const el = document.getElementById("capStat"); if (el) el.textContent = s; };

async function capturePlate(name, o = {}) {
  const A = await assets(); if (!A) throw new Error("asset store unavailable on this view");
  const cfg = await pickCodec();
  const fps = CAPT.fps, chunkN = Math.round((o.chunkSec || CAPT.chunkSec) * fps);
  const rec = { plate: name, W: CAPT.W, H: CAPT.H, fps, sub: o.sub ?? PLATES[name].sub ?? CAPT.sub, ss: o.ss ?? CAPT.ss, codec: cfg.codec, bitrate: cfg.bitrate, from: PLATES[name].from || 0, chunks: [], meta: null, started: new Date().toISOString() };
  let mux = null, enc = null, err = null, c0 = 0;
  const t0 = performance.now();
  const open = (i) => {
    c0 = i;
    mux = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: "avc", width: CAPT.W, height: CAPT.H, frameRate: fps }, fastStart: "in-memory", firstTimestampBehavior: "offset" });
    enc = new VideoEncoder({ output: (ch, m) => mux.addVideoChunk(ch, m), error: (e) => (err = e) });
    enc.configure(cfg);
  };
  const close = async (i1) => {
    await enc.flush(); enc.close(); mux.finalize();
    const blob = new Blob([mux.target.buffer], { type: "video/mp4" });
    const up = await A.upload(blob, { type: "video/mp4" });
    rec.chunks.push({ i0: c0, n: i1 - c0, id: up.id, bytes: up.sizeBytes });
    capLog(`${name} chunk ${rec.chunks.length} · frames ${c0}–${i1 - 1} · ${(up.sizeBytes / 1048576).toFixed(1)} MB · ${up.id}`);
    mux = enc = null;
  };
  const { N, meta } = await renderPlate(name, async (i, t, cv) => {
    if (!enc) open(i);
    const vf = new VideoFrame(cv, { timestamp: Math.round((i - c0) * 1e6 / fps), duration: Math.round(1e6 / fps) });
    enc.encode(vf, { keyFrame: (i - c0) % 30 === 0 }); vf.close();
    if (err) throw err;
    while (enc.encodeQueueSize > 3) await new Promise((r) => setTimeout(r, 1));
    const el = (performance.now() - t0) / 1000, done = i + 1;
    capStat(`${name}: frame ${done} / ${Math.round(PLATES[name].dur * fps)} · ${(done / el).toFixed(1)} fps · ${el.toFixed(0)} s`);
    if (done - c0 >= chunkN) await close(done);
    else await new Promise((r) => setTimeout(r, 0));
  }, o);
  if (enc) await close(N);
  rec.meta = meta; rec.frames = N; rec.seconds = +((performance.now() - t0) / 1000).toFixed(1);
  const up = await A.upload(new Blob([JSON.stringify(rec)], { type: "application/json" }), { type: "application/json" });
  capLog(`${name} manifest → ${up.id} · ${rec.seconds} s`);
  return rec;
}
async function captureAll(names = Object.keys(PLATES), o = {}) {
  CAPT.stop = false;
  for (const n of names) { if (CAPT.stop) break; await capturePlate(n, o); }
  capStat("all done · " + names.join(", "));
  CAPT.on = false; window.CAPTURE_HOLD = false;
}
// previews: PNG data URLs of chosen frames, for checking framing without encoding
async function previewPlate(name, times, o = {}) {
  const out = [], fps = o.fps || CAPT.fps, P = PLATES[name];
  const only = times.map((t) => Math.max(0, Math.round((t - (P.from || 0)) * fps)));
  await renderPlate(name, async (i, t, cv) => { out.push({ t: +t.toFixed(3), png: cv.toDataURL("image/png") }); }, { ...o, only });
  return out;
}
async function capProbe() {
  const gl = PIPE.renderer.getContext(), dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  let enc = "–"; try { enc = (await pickCodec()).codec; } catch (e) { enc = "none: " + e.message; }
  const A = await assets(); let usage = "no asset store";
  if (A) { try { const l = await A.list(); usage = `${l.usage.files} files · ${(l.usage.bytes / 1048576).toFixed(1)} / ${(l.usage.maxBytes / 1048576).toFixed(0)} MB · max ${l.usage.maxFiles} files`; } catch (e) { usage = "list failed: " + (e.code || e.message); } }
  const s = `GPU ${gpu} · maxRB ${PIPE.maxRB} · encoder ${enc} · assets: ${usage}`;
  capLog(s); return s;
}
// timing test: render n frames of a plate without encoding
async function capBench(name = "lvm3_ignite", n = 30, o = {}) {
  const t0 = performance.now(); let k = 0;
  await renderPlate(name, async () => { k++; capStat(`bench ${k}/${n}`); await new Promise((r) => setTimeout(r, 0)); }, { ...o, only: Array.from({ length: n }, (_, i) => 60 + i) });
  const s = `${name}: ${k} frames in ${((performance.now() - t0) / 1000).toFixed(1)} s · ${(k / ((performance.now() - t0) / 1000)).toFixed(2)} fps · internal ${PIPE.W}×${PIPE.H} · lw ${PIPE.lwForce.toFixed(2)}`;
  capLog(s); CAPT.on = false; window.CAPTURE_HOLD = false; return s;
}

// ---------- panel ----------
function capPanel() {
  document.documentElement.dataset.theme = "light";
  const d = document.createElement("div");
  d.id = "capPanel";
  d.innerHTML = `<div class="cap-row"><b>Film capture</b><span id="capStat">ready</span></div>
  <div class="cap-row"><button id="capProbe">Probe</button><button id="capBench">Bench</button><button id="capTest">Test plate</button><button id="capAll">Render all</button><button id="capStop">Stop</button>
  <button id="capStills">README stills</button><select id="capOne">${Object.keys(PLATES).map((k) => `<option>${k}</option>`).join("")}</select><button id="capGo">Render one</button></div>
  <pre id="capLog"></pre>`;
  document.body.prepend(d);
  const st = document.createElement("style");
  st.textContent = `#capPanel{position:sticky;top:0;z-index:50;background:#0b0c0e;color:#e7e9ec;font:12px/1.4 "IBM Plex Mono",ui-monospace,monospace;padding:10px max(12px,env(safe-area-inset-left));border-bottom:1px solid #343941;display:grid;gap:6px}
  #capPanel .cap-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#capPanel button,#capPanel select{font:inherit;background:#1d2024;color:#e7e9ec;border:1px solid #565a61;border-radius:999px;padding:4px 12px;cursor:pointer}
  #capPanel button:hover{border-color:#ff6a43}#capStat{color:#ff6a43}#capLog{margin:0;max-height:150px;overflow:auto;white-space:pre-wrap;color:#a5aab1}`;
  document.head.append(st);
  const run = (f) => async () => { try { await f(); } catch (e) { capLog("ERROR " + (e.code ? e.code + " " : "") + (e.message || e)); capStat("error"); console.error(e); } finally { CAPT.on = false; window.CAPTURE_HOLD = false; } };
  d.querySelector("#capProbe").onclick = run(capProbe);
  d.querySelector("#capBench").onclick = run(() => capBench());
  d.querySelector("#capTest").onclick = run(() => capturePlate("c1", { frames: 120 }));
  d.querySelector("#capAll").onclick = run(() => captureAll());
  d.querySelector("#capGo").onclick = run(() => capturePlate(d.querySelector("#capOne").value));
  d.querySelector("#capStills").onclick = run(() => captureStills());
  d.querySelector("#capStop").onclick = () => { CAPT.stop = true; capStat("stopping…"); };
}
capPanel();
Object.assign(window.CH, { CAPT, PLATES, renderPlate, capturePlate, captureAll, previewPlate, capProbe, capBench, frameFor, frameBox, STILLS, captureStills });
