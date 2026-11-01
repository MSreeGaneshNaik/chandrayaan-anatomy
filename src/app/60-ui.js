// ============================================================================
// 60 · UI — parts index, figure overlays, propulsion console, sheets
// ============================================================================
const UI = {};
const N2LBF = 1 / LBF;
const fmtN = (n) => (n >= 1e6 ? fmt(n / 1e6, 2) + " MN" : n >= 1e4 ? fmt(n / 1e3, 1) + " kN" : fmt(n, 0) + " N");
const fmtNbig = (n) => (n >= 1e6 ? [fmt(n / 1e6, 2), "MN"] : n >= 1e4 ? [fmt(n / 1e3, 1), "kN"] : [fmt(n, 0), "N"]);

function buildUI() {
  // engine groups
  const seg = $("#groupSeg");
  for (const [k, G] of Object.entries(GROUPS)) {
    const b = el("button", { type: "button", "data-g": k, "aria-pressed": "false" }, `<span>${G.label}</span><small>${G.sub}</small>`);
    b.addEventListener("click", () => selectGroup(k));
    seg.append(b);
  }
  if (!C.group && Object.keys(GROUPS).length) { C.group = Object.keys(GROUPS)[0]; C.alt = GROUPS[C.group].alt; }
  // "All engines": one button per engine, in its plume's colour
  (ENGINE_SETS.xALL || []).forEach((e, i) => {
    const b = el("button", { type: "button", "aria-pressed": "false" }, `<i></i>${e.name}`);
    b.style.setProperty("--c", e.swatch || "var(--accent)");
    b.addEventListener("click", () => fireOne(i));
    $("#fireRow").append(b);
  });
  for (const id of ["#thr", "#thrMini"]) $(id).addEventListener("input", (e) => { C.thr = +e.target.value / 100; UI.sync(); });
  $("#alt").addEventListener("input", (e) => { const v = +e.target.value; C.alt = v >= 100 ? 1e6 : v * 1000; UI.sync(); });
  for (const b of [$("#ign"), $("#ign2")]) b.addEventListener("click", () => (C.running ? shutdown() : ignite()));
  $("#apart").addEventListener("click", () => setExplode(!(curShow() ? C.sx : C.explode)));
  $("#free").addEventListener("click", () => { CAM.free = !CAM.free; CAM.keys.clear(); try { localStorage.setItem("chandrayaan-free", CAM.free ? "1" : "0"); } catch (e) {} UI.sync(); });
  document.querySelectorAll(".dragmode button").forEach((b) => b.addEventListener("click", () => { CAM.dragMode = b.dataset.mode; try { localStorage.setItem("chandrayaan-drag", CAM.dragMode); } catch (e) {} UI.sync(); }));
  try { const dm = localStorage.getItem("chandrayaan-drag"); if (dm === "pan" || dm === "orbit") CAM.dragMode = dm; } catch (e) {}
  $("#zin").addEventListener("click", () => zoomBy(1 / 1.35));
  $("#zout").addEventListener("click", () => zoomBy(1.35));
  $("#zreset").addEventListener("click", resetView);
  $("#aa").addEventListener("click", () => { PIPE.setAA(!PIPE.aa); try { localStorage.setItem("chandrayaan-aa", PIPE.aa ? "1" : "0"); } catch (e) {} UI.sync(); });
  $("#allOn").addEventListener("click", () => { if (C.group) C.off[C.group] = (C.off[C.group] || []).map(() => 0); UI.sync(); });
  // the journey: step through it from the figure
  const jstep = (d) => { const ph = J_BY[C.sel], L = J_MIS[ph?.mis || J.mis].phases, i = ph?.i ?? 0, n = L[clamp(i + d, 0, L.length - 1)]; if (n) selectItem(n.id); };
  document.querySelectorAll("#jstep [data-mis]").forEach((b) => b.addEventListener("click", () => { const L = J_MIS[b.dataset.mis].phases, cur = J_BY[C.sel]; selectItem((L.find((p) => cur && p.key === cur.key) || L[0]).id); }));
  // the landing replay
  $("#dplay").addEventListener("click", () => descentPlay());
  document.querySelectorAll("#dstep [data-run]").forEach((b) => b.addEventListener("click", () => descentRun(b.dataset.run)));
  $("#dscrub").addEventListener("input", (e) => descentScrub(+e.target.value / 1000));
  // the section header: figure links select their subject, every link scrolls; the current section lights up
  document.querySelectorAll("#secnav a, .wordmark").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.dataset.fig; if (id && MENU_ITEMS[id]) selectItem(id);
  }));
  secnavSpy();
  $("#jprev").addEventListener("click", () => jstep(-1));
  $("#jnext").addEventListener("click", () => jstep(1));
  // parts index: stacked sections, one open at a time
  const menu = $("#menu");
  menu.style.setProperty("--n", MENU.length);
  MENU.forEach(([title, items], si) => {
    const sec = el("section", { "data-sec": si });
    const head = el("button", { type: "button", class: "sec-head", "aria-expanded": "false", "aria-controls": `sec${si}` }, `<span><em>${String(si).padStart(2, "0")}</em>${title}</span><b>${items.filter(([id]) => id).length}</b><i aria-hidden="true"></i>`);
    head.addEventListener("click", () => openSection(si, true));
    const body = el("div", { class: "sec-items", id: `sec${si}`, role: "group", "aria-label": title }), inner = el("div", { class: "sec-in" });
    let n = 0;
    items.forEach(([id, label]) => {
      if (!id) { inner.append(el("div", { class: "sec-sub", role: "presentation" }, label)); return; }   // a sub-head inside a section
      // parts-list number in the narrow first column, the name in the second
      const b = el("button", { type: "button", "data-item": id, "aria-pressed": "false" }, `<em>${si}.${++n}</em><span>${label}</span>`);
      b.addEventListener("click", () => selectItem(id));
      inner.append(b);
      SEC_OF[id] = si;
    });
    body.append(inner); sec.append(head, body); menu.append(sec);
  });
  openSection(0);
  // keyboard: keys act while the pointer is over the figure or it has focus
  const fig = $("#fig"); fig.tabIndex = 0;
  const FLY = new Set(["w", "a", "s", "d", "q", "e", "arrowleft", "arrowright", "arrowup", "arrowdown", "shift"]);
  let overFig = false;
  fig.addEventListener("pointerenter", () => (overFig = true));
  fig.addEventListener("pointerleave", () => (overFig = false));
  window.addEventListener("keydown", (e) => {
    if (!(overFig || fig.contains(document.activeElement)) || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target, onControl = t !== fig && t.closest?.("button, input, select, textarea, a");
    const k = e.key.toLowerCase();
    if (onControl && (k === " " || k === "enter" || t.matches?.("input"))) return;
    if (k === " " || k === "enter") { e.preventDefault(); if (GROUPS[C.group] && !SHOW[curShow()]?.journey) C.running ? shutdown() : ignite(); }
    else if (k === "+" || k === "=") { e.preventDefault(); zoomBy(1 / 1.25); }
    else if (k === "-" || k === "_") { e.preventDefault(); zoomBy(1.25); }
    else if (k === "r" || k === "0") { e.preventDefault(); resetView(); }
    else if (CAM.free && FLY.has(k)) { e.preventDefault(); CAM.keys.add(k); }
  });
  window.addEventListener("keyup", (e) => CAM.keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur", () => CAM.keys.clear());
  buildSheets();
  UI.sync();
}

// ---------- stacked index ----------
const SEC_OF = {};
let openSec = -1, secFor = null;
function openSection(si, toggle = false, reveal = false) {
  const menu = $("#menu");
  openSec = toggle && openSec === si ? -1 : si;
  menu.querySelectorAll("section").forEach((s) => {
    const on = +s.dataset.sec === openSec;
    s.classList.toggle("open", on);
    s.querySelector(".sec-head").setAttribute("aria-expanded", String(on));
  });
  const sec = menu.querySelector(`section[data-sec="${openSec}"]`); if (!sec) return;
  const go = (e, o) => e.scrollTo({ ...o, behavior: REDUCED ? "auto" : "smooth" });
  const run = () => {
    const head = sec.querySelector(".sec-head"), sel = sec.querySelector('button[aria-pressed="true"]'), mr = menu.getBoundingClientRect();
    if (menu.scrollWidth > menu.clientWidth + 2) {
      const hr = head.getBoundingClientRect();
      if (hr.left < mr.left || hr.right > mr.right) go(menu, { left: Math.max(0, hr.left - mr.left + menu.scrollLeft - 8) });
      const row = sec.querySelector(".sec-in");
      if (sel && row) { const rr = row.getBoundingClientRect(), sr = sel.getBoundingClientRect(); if (sr.left < rr.left || sr.right > rr.right) go(row, { left: Math.max(0, sr.left - rr.left + row.scrollLeft - 8) }); }
    } else {
      const hr = head.getBoundingClientRect(), tr = (reveal && sel ? sel : sec).getBoundingClientRect();
      const vis = Math.min(mr.bottom, innerHeight) - mr.top;
      let top = hr.top - mr.top + menu.scrollTop - 2;
      const need = tr.bottom - mr.top + menu.scrollTop + 10;
      if (need - top > vis) top = need - vis;
      if (hr.top < mr.top || tr.bottom > mr.top + vis) go(menu, { top: Math.max(0, top) });
    }
  };
  sec.querySelector(".sec-items").addEventListener("transitionend", run, { once: true });
  requestAnimationFrame(run); setTimeout(run, 450);
}
function toggleEngine(group, i) { (C.off[group] ||= []); C.off[group][i] = C.off[group][i] ? 0 : 1; UI.sync(); }

// ---------- engine layout seen from below; click an engine to cut it ----------
function clusterSVG() {
  const G = GROUPS[C.group], svg = $("#cluster");
  if (!G) { svg.innerHTML = ""; return; }
  const set = ENGINE_SETS[G.set] || [];
  if (G.lineup) {   // the nine exits side by side, to scale; click one to fire or cut it
    const x0 = Math.min(...set.map((e) => e.x - e.r)), x1 = Math.max(...set.map((e) => e.x + e.r)), k = 116 / (x1 - x0);
    let h = "";
    set.forEach((e, i) => {
      const x = (e.x - (x0 + x1) / 2) * k, r = Math.max(1.6, e.r * k), off = C.off.xALL?.[i] || !C.running;
      h += `<g class="eng-g" data-i="${i}" role="button" tabindex="0" aria-label="${e.name} ${off ? "off" : "firing"}" aria-pressed="${!off}">`;
      h += `<circle class="eng" cx="${x.toFixed(1)}" cy="0" r="${r.toFixed(1)}" fill="var(--card)" stroke="var(--ink)" stroke-width="1.2"/>`;
      h += `<circle class="glow" cx="${x.toFixed(1)}" cy="0" r="${(r * 0.82).toFixed(1)}" fill="${e.swatch}" opacity="0" pointer-events="none"/>`;
      h += `<title>${e.name}</title></g>`;
    });
    svg.innerHTML = h;
    svg.querySelectorAll(".eng-g").forEach((g) => { const t = () => fireOne(+g.dataset.i); g.addEventListener("click", t); g.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); t(); } }); });
    return;
  }
  const pts = set.map((e) => e.layout || V3()), rE = G.exitR;
  const maxR = Math.max(rE, ...pts.map((p) => Math.hypot(p.x, p.z) + rE));
  const k = 52 / maxR;
  let h = `<circle cx="0" cy="0" r="58" fill="none" stroke="var(--line-2)" stroke-dasharray="2 3"/>`;
  if (G.outline) h += G.outline(k);
  pts.forEach((p, i) => {
    const x = p.x * k, y = p.z * k, r = rE * k * 0.96, off = C.off[C.group]?.[i];
    const lvl = set[i].fx.userData.level;
    h += `<g class="eng-g" data-i="${i}" role="button" tabindex="0" aria-label="${set[i].name} ${off ? "cut" : "enabled"}" aria-pressed="${!off}">`;
    h += `<circle class="eng" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="var(--card)" stroke="var(--ink)" stroke-width="1.4"/>`;
    h += `<circle class="glow" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.82).toFixed(1)}" fill="var(--accent)" opacity="${(lvl * 0.85).toFixed(2)}" pointer-events="none"/>`;
    h += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.26).toFixed(1)}" fill="none" stroke="var(--ink-2)" stroke-width="1" pointer-events="none"/>`;
    if (off) h += `<path d="M${x - r * 0.6} ${y - r * 0.6}L${x + r * 0.6} ${y + r * 0.6}M${x + r * 0.6} ${y - r * 0.6}L${x - r * 0.6} ${y + r * 0.6}" stroke="var(--accent)" stroke-width="2" pointer-events="none"/>`;
    h += `<text x="${x.toFixed(1)}" y="${(y + r + 9).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="var(--ink-2)" pointer-events="none">${set[i].name}</text></g>`;
  });
  svg.innerHTML = h;
  svg.querySelectorAll(".eng-g").forEach((g) => {
    const t = () => toggleEngine(C.group, +g.dataset.i);
    g.addEventListener("click", t);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t(); } });
  });
}

UI.sync = function () {
  const G = GROUPS[C.group], sh = curShow(), apart = sh ? C.sx : C.explode, journey = !!SHOW[sh]?.journey, ph = J_BY[C.sel];
  const fig = $("#fig"), descent = !!SHOW[sh]?.descent;
  fig.classList.toggle("journey", journey);
  fig.classList.toggle("descent", descent);
  if (journey && ph) { const L = J_MIS[ph.mis].phases; $("#jpos").textContent = ph.i ? `${ph.i} / ${L.length - 1}` : "Overview"; $("#jprev").disabled = ph.i === 0; $("#jnext").disabled = ph.i === L.length - 1;
    document.querySelectorAll("#jstep [data-mis]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mis === ph.mis))); }
  if (descent) descentSyncUI();
  document.querySelectorAll("#groupSeg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.g === C.group)));
  document.querySelectorAll("#menu button[data-item]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.item === C.sel)));
  if (C.sel !== secFor) { secFor = C.sel; const si = SEC_OF[C.sel]; if (si !== undefined) openSection(si, false, true); }
  renderDetail();
  const engHere = !!G && (G.show || null) === sh;
  const lineup = !!G?.lineup && G.show === sh;
  for (const b of [$("#ign"), $("#ign2")]) { b.querySelector("span").textContent = C.running ? "Shut down" : lineup ? "Ignite all" : "Ignite"; b.disabled = !G || journey; }
  fig.classList.toggle("lineup", lineup);
  document.querySelectorAll("#fireRow button").forEach((b, i) => b.setAttribute("aria-pressed", String(!!G?.lineup && C.running && !C.off.xALL?.[i])));
  fig.classList.toggle("noeng", !engHere);
  $("#ign").classList.toggle("on", C.running);
  $("#ign2").classList.toggle("off", !C.running);
  $("#apart").setAttribute("aria-pressed", String(apart));
  $("#apart").textContent = apart ? "Assemble" : "Take apart";
  $("#aa").setAttribute("aria-pressed", String(PIPE.aa));
  $("#aa").innerHTML = `Anti-aliasing <b>${PIPE.aa ? `On · ${fmt(PIPE.ss || 1, 1)}× + MSAA` : "Off"}</b>`;
  $("#free").setAttribute("aria-pressed", String(CAM.free));
  $("#free").innerHTML = `Free cam <b>${CAM.free ? "On" : "Off"}</b>`;
  fig.classList.toggle("free", CAM.free);
  fig.classList.toggle("pan", CAM.dragMode === "pan");
  document.querySelectorAll(".dragmode button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === CAM.dragMode)));
  $("#hint").textContent = CAM.free ? (CAM.dragMode === "pan" ? "Drag to pan · shift-drag to orbit" : "Drag to orbit · right- or shift-drag to pan") + " · scroll to zoom · W/S in-out · A/D sideways · Q/E down-up · R reset" : "Hover or click a part to read it · turn on free cam to fly around";
  // throttle: a solid has none; the liquids flew at 100 %, lower is a what-if on propellant flow
  const solid = !G || ENGINES[G.eng].solid, thrTxt = solid ? "Solid · no throttle" : `${fmt(C.thr * 100, C.thr === 1 || C.thr === 0 ? 0 : 1)} %${C.thr < 1 ? " · what-if" : ""}`;
  for (const [i, o] of [["#thr", "#thrOut"], ["#thrMini", "#thrMiniOut"]]) {
    const r = $(i); r.disabled = solid; r.value = solid ? 100 : C.thr * 100; $(o).textContent = i === "#thr" ? thrTxt : solid ? "Solid" : `${fmt(C.thr * 100, 0)} %`;
    r.style.setProperty("--track", "linear-gradient(90deg, var(--line) 0 99%, var(--ink) 99% 100%)");
  }
  $(".mini-thr").classList.toggle("off", solid);
  // ambient
  const alt = $("#alt"), vac = !G || ENGINES[G.eng].vacOnly;
  alt.disabled = vac;
  alt.value = C.alt >= 1e6 ? 100 : C.alt / 1000;
  $("#altOut").textContent = vac ? "Vacuum (design point)" : C.alt >= 1e6 ? "Vacuum" : C.alt === 0 ? "Sea level" : `${fmt(C.alt / 1000, 1)} km`;
  clusterSVG();
  if (G) { $("#engNote").innerHTML = G.note || ENGINES[G.eng].note || ""; const en = $("#engName"); if (en) en.textContent = G.lineup ? "All engines · nine types" : `${ENGINES[G.eng].name} × ${(ENGINE_SETS[G.set] || []).length}`; }
  $("#figTitle").textContent = journey ? `${J_MIS[J.mis]?.name || "Journey"} · ${ph ? ph.label : ""}` : sh ? (MODULES[sh]?.name || "") + (C.sx ? " · taken apart" : "") : C.explode ? STACK_NAME() + " · taken apart" : STACK_TITLE();
  $("#caption").innerHTML = journey ? J_CAPTION : descent ? DESCENT_CAP() : sh ? (SHOW_CAPS[sh] || "") : (G?.cap || STACK_CAP());
  if (descent) $("#figTitle").textContent = DESCENT_TITLE();
  UI.tick(true);
  UI.measure();
  UI.spy?.();
};
const STACK_TITLE = () => STACK_NAME();

// the drawing is framed inside the band the overlays leave free
UI.insets = { top: 0, bottom: 0 };
UI.measure = function () {
  const f = $("#fig").getBoundingClientRect(); if (!f.height) return;
  // the hint line stops short of the title block and its controls, and steps aside when that leaves too little room
  { const h = $("#hint"), tr = $(".tr").getBoundingClientRect(), room = tr.left - f.left - 16 - 20;
    if (h && f.width >= 640) { h.style.right = Math.round(f.right - tr.left + 20) + "px"; h.style.visibility = room < 260 ? "hidden" : ""; } }
  let top = 0;
  for (const s of f.width < 640 ? [".tl", "#hint", ".tr"] : [".tl", "#hint"]) { const e = $(s), r = e.getBoundingClientRect(); if (r.height && e.style.visibility !== "hidden") top = Math.max(top, r.bottom - f.top); }
  const ft = $("#foot").getBoundingClientRect();
  UI.insets = { top: top + 8, bottom: f.bottom - ft.top + 8 };
};

let lastTick = 0;
UI.tick = function (force) {
  const now = performance.now();
  if (!force && now - lastTick < 90) return;
  lastTick = now;
  const ro = $("#readout"), sh = curShow(), journey = !!SHOW[sh]?.journey;
  const S = groupState();
  if (S && S.lineup) {
    let total = 0, flow = 0;
    const kv = [];
    S.rows.forEach((r, i) => { const th = r.e.fx.userData.thrust || 0; total += th * r.s.per; flow += th * r.s.mdot; if (th > 0.01) kv.push([`${r.e.name}`, `${fmtN(th * r.s.per)} · Isp ${fmt(r.s.isp, 1)} s`]);
      const c = document.querySelector(`#cluster .eng-g[data-i="${i}"] .glow`); if (c) put(c, "@opacity", (th * 0.9).toFixed(2)); });
    { const [v, u] = fmtNbig(total); put($("#thrustBig"), "html", `${v}<small>${u}</small>`); }
    put($("#thrustSub"), "text", `${fmt(total * N2LBF)} lbf · ${S.n} of ${S.N} engines lit`);
    const all = S.rows.reduce((a, r) => a + r.s.per, 0), bar = $("#twBar");
    put(bar.querySelector("b"), "width", `${all > 0 ? clamp(total / all, 0, 1) * 100 : 0}%`); put(bar.querySelector("em"), "left", "calc(100% - 2px)");
    put($("#twMid"), "text", "share of all nine"); put($("#twMax"), "text", "100 %");
    kv.unshift(["Ambient pressure", S.pa >= 1 ? `${fmt(S.pa, S.pa < 100 ? 1 : 0)} Pa · ${fmt((S.pa / P0) * 100, 2)} % SL` : "0 Pa (vacuum)"], ["Propellant flow", `${fmt(flow, flow < 50 ? 1 : 0)} kg/s`], ["Combined Isp", flow > 0 ? `${fmt(total / (flow * G0), 1)} s` : "—"]);
    put($("#liveKV"), "html", kvHTML(kv));
    const st = $("#engStatus"); put(st, "class", "status" + (C.running ? " go" : "")); put(st, "text", C.running ? `Firing · ${S.n} of ${S.N}` : "Safed");
    if (!journey && !(C.hover && MODULES[C.hover]) && sh === "dENG") {
      put(ro, "html", `All engines · ${total > 1 ? fmtN(total) : "idle"}<small>${total > 1 ? `${S.n} of ${S.N} lit · ${fmt(total * N2LBF)} lbf · combined Isp ${fmt(total / (flow * G0), 1)} s` : S.G.idle}</small>`);
      return;
    }
  } else if (S) {
    const set = ENGINE_SETS[S.G.set] || [];
    const lit = set.reduce((a, e) => a + (e.fx.userData.thrust || 0), 0);
    const total = lit * S.per, lbf = total * N2LBF;
    { const [v, u] = fmtNbig(total); put($("#thrustBig"), "html", `${v}<small>${u}</small>`); }
    put($("#thrustSub"), "text", `${fmt(lbf)} lbf · ${S.n} of ${S.N} ${S.N > 1 ? S.G.unitPl || "engines" : S.G.unit || "engine"} lit`);
    const tw = S.G.twMass ? total / (S.G.twMass * (S.G.twG || G0)) : null, bar = $("#twBar");
    if (tw !== null) {
      const max = S.G.twMax || 2;
      put(bar.querySelector("b"), "width", `${clamp(tw / max, 0, 1) * 100}%`);
      put(bar.querySelector("em"), "left", `${(1 / max) * 100}%`);
      put($("#twMid"), "text", "1.0 = liftoff");
      put($("#twMax"), "text", `${max}`);
    } else {
      const ref = S.per * S.N;
      put(bar.querySelector("b"), "width", `${ref > 0 ? clamp(total / ref, 0, 1) * 100 : 0}%`);
      put(bar.querySelector("em"), "left", "calc(100% - 2px)");
      put($("#twMid"), "text", "share of rated thrust");
      put($("#twMax"), "text", "100 %");
    }
    const kv = [["Thrust per " + (S.G.unit || "engine"), `${fmtN(S.per)} · ${fmt(S.per * N2LBF)} lbf`],
      ["Ambient pressure", S.pa >= 1 ? `${fmt(S.pa, S.pa < 100 ? 1 : 0)} Pa · ${fmt((S.pa / P0) * 100, 2)} % SL` : S.pa > 0 ? `${S.pa.toFixed(3)} Pa` : "0 Pa (vacuum)"],
      ["Specific impulse", `${fmt(S.isp, 1)} s`],
      ["Propellant flow", `${fmt(lit > 0 ? S.mdot * lit : 0, S.mdot < 50 ? 1 : 0)} kg/s`]];
    if (tw !== null) kv.push([S.G.twLabel, fmt(tw, 2), tw > 1 ? "hi" : ""]);
    for (const r of S.G.flown || []) kv.push(r);
    put($("#liveKV"), "html", kvHTML(kv));
    const st = $("#engStatus"), outs = (C.off[C.group] || []).reduce((a, b) => a + b, 0);
    put(st, "class", "status" + (C.running ? (outs ? " warn" : " go") : ""));
    put(st, "text", C.running ? (outs ? `Firing · ${outs} out` : "Firing") : "Safed");
    set.forEach((e, i) => { const c = document.querySelector(`#cluster .eng-g[data-i="${i}"] .glow`); if (c) put(c, "@opacity", ((e.fx.userData.thrust || 0) * 0.85).toFixed(2)); });
    if (!journey && !(C.hover && MODULES[C.hover]) && (S.G.show || null) === sh && (C.running || lit > 0.001 || MENU_ITEMS[C.sel]?.group)) {
      put(ro, "html", `${S.G.code} × ${S.N} · ${lit > 0.001 ? fmtN(total) : "idle"}<small>${lit > 0.001 ? `${fmt(lbf)} lbf · Isp ${fmt(S.isp, 1)} s` + (tw !== null ? ` · T/W ${fmt(tw, 2)}` : "") : S.G.idle || "Safed"}</small>`);
      return;
    }
  }
  if (SHOW[sh]?.descent && !(C.hover && MODULES[C.hover] && !MODULES[C.hover].quiet)) { put(ro, "html", DESCENT_READOUT()); return; }
  const jph = journey && J_BY[C.sel];
  if (jph && !(C.hover && MODULES[C.hover])) { put(ro, "html", J_READOUT()); return; }
  if (C.hover && MODULES[C.hover]) { const M = MODULES[C.hover]; put(ro, "html", `${M.name}<small>${(M.kv || []).slice(0, 2).map(([a, b]) => `${a} ${b}`).join(" · ") || "Click to open its sheet"}</small>`); return; }
  const it = MENU_ITEMS[C.sel], M = MODULES[(it?.info || it?.mods || [])[0]];
  put(ro, "html", M ? `${it.root ? M.name : it.label}<small>${(M.kv || []).slice(0, 2).map(([a, b]) => `${a} ${b}`).join(" · ")}</small>` : "");
};

// ---------- the sheet for the selected item, under the figure ----------
let detailFor = null;
function renderDetail() {
  if (detailFor === C.sel) return;
  detailFor = C.sel;
  const it = MENU_ITEMS[C.sel], box = $("#detail");
  if (!it) { box.innerHTML = ""; return; }
  const keys = (it.info || it.mods).filter((k) => MODULES[k]);
  const M = MODULES[keys[0]] || {};
  let cols = "";
  for (const k of keys) {
    const m = MODULES[k];
    if (!m.kv?.length) continue;
    if (keys.length > 1) cols += `<h3>${m.name}</h3>`;
    const half = Math.ceil(m.kv.length / 2);
    cols += `<dl class="kv">${kvHTML(m.kv.slice(0, half))}</dl><dl class="kv">${kvHTML(m.kv.slice(half))}</dl>`;
  }
  const descs = keys.map((k) => MODULES[k].desc).filter(Boolean);
  box.innerHTML = `<div class="d-head"><h3>Selected · ${it.label}</h3><h2>${it.root || keys.length === 1 ? M.name || it.label : it.label}</h2>${M.by ? `<span class="d-by">${M.by}</span>` : ""}${descs.map((d) => `<p>${d}</p>`).join("")}</div><div class="d-cols">${cols}</div>`;
}
function setHotSpec(key) {
  document.querySelectorAll(".spec.hot").forEach((e) => e.classList.remove("hot"));
  if (key) document.querySelector(`.spec[data-mod="${key}"]`)?.classList.add("hot");
}

// ---------- the section header ----------
function secnavSpy() {
  const links = [...document.querySelectorAll("#secnav a")], bar = $("#topbar");
  const targets = links.map((a) => ({ a, el: document.querySelector(a.getAttribute("href")), fig: a.dataset.fig }));
  const onScroll = () => {
    const y = 90; let cur = null;
    for (const t of targets) { if (!t.el) continue; const r = t.el.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = t; }
    // inside the figure, the link that matches what the figure shows
    if (cur?.fig) { const sh = curShow(), j = !!SHOW[sh]?.journey, d = !!SHOW[sh]?.descent; cur = targets.find((t) => t.fig && (j ? t.fig === "j3All" : d ? t.fig === "land3" : !sh ? t.fig === "stack" : t.fig === "c3whole")) || cur; }
    links.forEach((a) => (cur && a === cur.a ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    bar.style.setProperty("--edge", window.scrollY > 8 ? 1 : 0);
  };
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
  UI.spy = onScroll; onScroll();
}
