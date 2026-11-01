// ============================================================================
// 65 · SHEETS — the pages under the figure: the three missions, every
// assembly's sheet, the 32 instruments, the engines and their maths, the
// comparison, the programme timeline and what comes next.
// ============================================================================
const MIS3 = [
  { k: "C1", n: "1", name: "Chandrayaan-1", dev: "चंद्रयान-१", years: "Oct 2008 → Aug 2009", rocket: "PSLV-C11", state: ["ok", "Mission complete"], fig: "j1All", craft: "c1whole",
    lede: "India's first spacecraft beyond Earth orbit. It worked for 312 days, about nine months of them mapping from lunar orbit; it dropped a probe near the south pole and helped show there is water on the surface.",
    log: [["22 Oct 2008", "Launch on PSLV-C11, Second Launch Pad"], ["8 Nov 2008", "Captured into lunar orbit, 817 s burn"], ["14 Nov 2008", "Moon Impact Probe strikes near Shackleton"], ["May 2009", "Orbit raised from 100 to 200 km"], ["29 Aug 2009", "Last contact"]],
    finds: ["Water and hydroxyl on the surface (M³, 2009)", "Signs of ice in north polar craters (Mini-SAR)", "Water in the exosphere on the way down (MIP)"] },
  { k: "C2", n: "2", name: "Chandrayaan-2", dev: "चंद्रयान-२", years: "Jul 2019 → today", rocket: "GSLV Mk III-M1", state: ["warn", "Lander lost · orbiter working"], fig: "j2All", craft: "c2whole",
    lede: "ISRO's first landing attempt. Vikram flew normally to 2.1 km, then was lost moments before touchdown and hit the ground close to its target; the orbiter, built for a year, was still returning data seven years on.",
    log: [["22 Jul 2019", "Launch on GSLV Mk III-M1"], ["20 Aug 2019", "Lunar orbit insertion, 1,738 s burn"], ["2 Sep 2019", "Vikram separates"], ["7 Sep 2019", "Contact lost below 2.1 km; hard landing"], ["Dec 2019", "NASA LRO confirms the debris field"]],
    finds: ["The sharpest images from lunar orbit, 25 cm (OHRC)", "Argon-40 in the exosphere (CHACE-2)", "A solar storm seen striking the exosphere (CME of May 2024, reported 2025)"] },
  { k: "C3", n: "3", name: "Chandrayaan-3", dev: "चंद्रयान-३", years: "Jul 2023 → today", rocket: "LVM3-M4", state: ["ok", "Soft landing"], fig: "j3All", craft: "c3whole",
    lede: "Built round what went wrong in 2019. Vikram landed at 69.37°S on 23 August 2023, the first landing near the lunar south pole; Pragyan drove more than 100 m, and the propulsion module came back to Earth orbit.",
    log: [["14 Jul 2023", "Launch on LVM3-M4"], ["5 Aug 2023", "Lunar orbit insertion, 1,835 s burn"], ["23 Aug 2023", "Touchdown at 18:03 IST (12:33 UTC)"], ["3 Sep 2023", "The hop: 40 cm up, 30–40 cm across"], ["22 Nov 2023", "Propulsion module back around Earth"]],
    finds: ["Sulphur measured on the spot (LIBS)", "≈70 °C on top, −10 °C 8 cm down (ChaSTE)", "An apparently natural event on 26 Aug (ILSA)"] },
];
const COMPARE = [
  ["Launch", "22 Oct 2008", "22 Jul 2019", "14 Jul 2023"],
  ["Rocket", "PSLV-C11 (XL)", "GSLV Mk III-M1", "LVM3-M4"],
  ["Launch mass", "1,380 kg", "3,850 kg", "3,900 kg"],
  ["Spacecraft", "Orbiter + impact probe", "Orbiter + Vikram + Pragyan", "Propulsion module + Vikram + Pragyan"],
  ["Main engine", "440 N", "440 N (orbiter) · 5 × 800 N (Vikram)", "440 N (PM) · 4 × 800 N (Vikram)"],
  ["Instruments", "11 (6 foreign)", "14 (1 foreign)", "7 (1 foreign)"],
  ["Cost", "₹386 crore", "₹978 crore", "≈₹615 crore"],
  ["Days to the Moon", "17", "29", "22"],
  ["On the surface", "Impact near Shackleton, ≈89.5°S", "Hard landing at 70.88°S", "Soft landing at 69.37°S"],
  ["Design life", "2 years", "Orbiter 1 year · surface 14 days", "Surface 14 days"],
  ["Actual", "312 days", "Orbiter 7+ years and counting", "12 days of surface work"],
  ["Status", "Silent; last tracked in lunar orbit by NASA radar, 2016", "Orbiter still returning data (2026)", "Asleep on the Moon · PM in Earth orbit"],
];
const TIMELINE = [
  ["2003", [["15 Aug", "", "Prime Minister Atal Bihari Vajpayee announces India's Moon mission"]]],
  ["2008", [["22 Oct", "C-1", "Chandrayaan-1 launches on PSLV-C11"], ["14 Nov", "C-1", "Moon Impact Probe strikes near the south pole"]]],
  ["2009", [["29 Aug", "C-1", "Last contact with Chandrayaan-1"], ["Sep", "C-1", "M³ water results published in Science"]]],
  ["2016", [["Jul", "C-1", "NASA finds the silent orbiter with ground radar"]]],
  ["2019", [["22 Jul", "C-2", "Chandrayaan-2 launches on GSLV Mk III-M1"], ["7 Sep", "C-2", "Vikram lost moments before touchdown; hard landing"], ["Dec", "C-2", "NASA confirms the crash site from LRO images"]]],
  ["2023", [["14 Jul", "C-3", "Chandrayaan-3 launches on LVM3-M4"], ["23 Aug", "C-3", "Vikram soft-lands near the south pole"], ["26 Aug", "", "Shiv Shakti and Tiranga Points named; 23 August becomes National Space Day"], ["3 Sep", "C-3", "Vikram's hop"], ["Nov", "C-3", "Propulsion module returns to Earth orbit"]]],
  ["2024", [["19 Mar", "", "IAU approves Statio Shiv Shakti"], ["Sep", "C-4", "Chandrayaan-4 approved at ₹2,104.06 crore"], ["30 Dec", "C-4", "SpaDeX launches to test the docking Chandrayaan-4 needs"]]],
  ["2025", [["10 Mar", "C-5", "Government approves Chandrayaan-5 / LUPEX with Japan"], ["Oct", "C-2", "First observed effect of a solar storm on the lunar exosphere"]]],
  ["2026", [["Jul", "C-5", "ISRO and JAXA review LUPEX progress in Bengaluru"], ["Jul", "C-2", "Orbiter passes seven years since launch, still returning data"]]],
  ["2028", [["Target", "C-4", "Chandrayaan-4 sample return"], ["Target", "C-5", "Chandrayaan-5 / LUPEX on Japan's H3"]], true],
  ["2040", [["Goal", "", "Indian astronauts on the Moon"]], true],
];
const NEXT = [
  { name: "Chandrayaan-4", tag: "Lunar sample return", when: "Target ≈2028", p: "India's first attempt to bring Moon rock and soil back to Earth, and ISRO's most complex lunar mission yet.", kv: [["Sample", "up to ≈3 kg from near the south pole"], ["Launch", "two LVM3s · ≈9,200 kg in all"], ["Modules", "five, docking in Earth and lunar orbit"], ["Approved", "Sep 2024 · ₹2,104.06 crore"], ["Site", "MM4, near Mons Mouton (chosen 2026)"]] },
  { name: "Chandrayaan-5 · LUPEX", tag: "With JAXA", when: "Target 2028", p: "A joint ISRO–JAXA mission to measure how much water ice the polar soil holds and how easy it is to reach, with instruments from NASA and ESA too.", kv: [["Lander", "ISRO-built · ≈6,000 kg at launch, rover included"], ["Rover", "JAXA · ≈350 kg, with a drill"], ["Rocket", "H3-24L from Tanegashima"], ["Approved", "10 Mar 2025"], ["Latest", "JAXA–ISRO interface talks at URSC, Bengaluru, Jul 2026"]] },
];

// ISRO's event tables: [event, T+ s, altitude km, inertial velocity km/s]
const FLIGHTS = [
  { k: "M4", name: "LVM3-M4 · Chandrayaan-3", when: "14 Jul 2023 · 14:35:17 IST", note: "LVM3-M4 brochure, ISRO. Velocities are inertial. ISRO said Chandrayaan-3 was \u2018in its precise orbit\u2019; the target was 170 × 36,500 km.", rows: [
    ["2 × S200 ignition · liftoff", 0, 0.024, 0.452], ["L110 ignition, two Vikas air-lit", 108.10, 44.668, 1.788], ["S200 separation", 127.00, 62.171, 1.969], ["Payload fairing separation", 194.96, 114.805, 2.560],
    ["L110 separation", 305.56, 175.352, 4.623], ["C25 ignition", 307.96, 176.573, 4.621], ["C25 shut-off", 954.42, 174.695, 10.242], ["Chandrayaan-3 separation", 969.42, 179.192, 10.269]] },
  { k: "M1", name: "GSLV Mk III-M1 · Chandrayaan-2", when: "22 Jul 2019 · 14:43:12 IST", note: "GSLV Mk III-M1 brochure, ISRO: the pre-flight nominal profile, planned to end in a 170 × 39,120 km orbit. ISRO reported separation about 16 min 14 s after liftoff into 169.7 × 45,475 km, about 6,000 km higher than planned.", rows: [
    ["S200 ignition · liftoff", 0, 0.024, 0.45191], ["L110 ignition", 110.84, 43.939, 1.74454], ["S200 separation", 131.30, 61.995, 1.95640], ["Payload fairing separation", 203.94, 114.511, 2.62005], ["L110 shut-off", 305.72, 169.079, 4.57412],
    ["L110 separation", 308.82, 170.783, 4.61015], ["C25 ignition", 311.22, 172.072, 4.60755], ["C25 shut-off", 959.30, 176.415, 10.29719], ["Chandrayaan-2 separation", 974.30, 181.656, 10.30578]] },
  { k: "C11", name: "PSLV-C11 · Chandrayaan-1", when: "22 Oct 2008 · 06:22 IST", note: "PSLV-C11 publication, ISRO: the nominal flight profile. The achieved orbit matched it, 255 × 22,860 km at 17.9°.", rows: [
    ["PS1 ignition · liftoff", 0, 0.025, 0.452], ["4 ground-lit PSOM-XL ignition", 0.4, 0.025, 0.452], ["2 air-lit PSOM-XL ignition", 25.0, 2.788, 0.625], ["4 ground-lit PSOM-XL separation", 70.0, 25.047, 1.490], ["2 air-lit PSOM-XL separation", 92.0, 42.716, 2.111],
    ["PS1 separation", 108.62, 58.505, 2.376], ["PS2 ignition", 108.82, 58.689, 2.376], ["Heat shield separation", 193.6, 116.021, 3.520], ["PS2 separation", 260.0, 134.187, 5.367], ["HPS3 ignition", 261.2, 134.385, 5.366],
    ["HPS3 separation", 512.9, 166.220, 7.760], ["PS4 ignition", 533.6, 169.912, 7.755], ["PS4 cut-off", 1049.5, 437.192, 9.728], ["Chandrayaan-1 separation", 1096.5, 507.786, 9.671]] },
];
const fmtTplus = (t) => { const m = Math.floor(t / 60), s = t - m * 60; return `T+${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`; };
function showFlight(k) {
  const F = FLIGHTS.find((f) => f.k === k) || FLIGHTS[0];
  document.querySelectorAll("#frSeg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === F.k)));
  $("#frTable").innerHTML = `<caption>${F.name} · ${F.when}</caption><thead><tr><th>Event</th><th class="num">Mission time</th><th class="num">Seconds</th><th class="num">Altitude, km</th><th class="num">Velocity, km/s</th></tr></thead><tbody>` +
    F.rows.map(([e, t, h, v]) => `<tr><td>${e}</td><td class="num">${fmtTplus(t)}</td><td class="num">${fmt(t, t % 1 ? 2 : 1)}</td><td class="num">${fmt(h, 3)}</td><td class="num">${fmt(v, 3)}</td></tr>`).join("") + "</tbody>";
  $("#frNote").textContent = F.note;
}
function buildSheets() {
  // ----- at a glance -----
  $("#glance").innerHTML = [
    ["Missions", "3", "2008 · 2019 · 2023"],
    ["Instruments", "32", "11 + 14 + 7, eight from abroad"],
    ["Landing", "69.37°S", "23 Aug 2023 · 18:03 IST (12:33 UTC)"],
    ["Heaviest launch", "3,900 kg", "Chandrayaan-3 on LVM3-M4"],
    ["Powered descent", "19 min", "30 km and 1.68 km/s to 0"],
    ["Vikram's engines", "4 × 800 N", "4 through braking · 2 for the last 800 m · T/W 1.14 on the Moon"],
    ["Pragyan's drive", "> 100 m", "at about 1 cm/s"],
    ["C-2 orbiter", "7+ years", "built for one, still returning data"],
  ].map(([s, b, sm]) => `<div><span>${s}</span><b>${b}</b><small>${sm}</small></div>`).join("");
  // ----- flight record -----
  $("#frSeg").innerHTML = FLIGHTS.map((F) => `<button type="button" data-k="${F.k}" aria-pressed="false">${F.name.split(" · ")[0]}</button>`).join("");
  document.querySelectorAll("#frSeg button").forEach((b) => b.addEventListener("click", () => showFlight(b.dataset.k)));
  showFlight("M4");
  $("#titleblock").innerHTML = [["Missions", "Chandrayaan-1 · 2 · 3"], ["Rockets", "PSLV-XL · LVM3"], ["Landing", "69.373°S 32.319°E"], ["Launches", "22 OCT 2008 · 22 JUL 2019 · 14 JUL 2023"]].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("");
  // ----- three missions -----
  $("#missions3").innerHTML = MIS3.map((M) => `<article class="mis3" data-mis="${M.k}"><span class="num">${M.n}</span><h3>${M.years} · ${M.rocket}</h3><h4>${M.name}<span lang="hi">${M.dev}</span></h4><span class="state ${M.state[0]}">${M.state[1]}</span><p>${M.lede}</p><ul class="log">${M.log.map(([d, t]) => `<li><time>${d}</time><span>${t}</span></li>`).join("")}</ul><ul class="finds">${M.finds.map((f) => `<li>${f}</li>`).join("")}</ul><div class="btns"><button type="button" class="pill go" data-go="${M.craft}">See the spacecraft</button> <button type="button" class="pill go" data-go="${M.fig}">Fly the journey</button></div></article>`).join("");
  document.querySelectorAll("#missions3 [data-go]").forEach((b) => b.addEventListener("click", () => { selectItem(b.dataset.go); $("#figure").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }); }));
  // ----- hardware sheets: every named assembly of every display, then the rockets -----
  const skip = /\.(apron)$/;
  const keys = Object.keys(MODULES).filter((k) => /^d(C3|VK|C2|C1|PSLV)\./.test(k) && !skip.test(k) && !MODULES[k].quiet && MODULES[k].kv?.length)
    .concat(["stackInfo", "s200R", "l110", "l110Eng", "c25", "c25Eng", "plfA", "pad", "tower"].filter((k) => MODULES[k]));
  const seen = new Set();
  const uniq = keys.filter((k) => { const n = MODULES[k].name; if (seen.has(n)) return false; seen.add(n); return true; });
  $("#specs").innerHTML = uniq.map((k) => { const M = MODULES[k]; return `<article class="spec" data-mod="${k}"><header><h4>${M.name}</h4>${M.by ? `<span class="by">${M.by}</span>` : ""}</header><dl class="kv">${kvHTML(M.kv || [])}</dl></article>`; }).join("");
  // ----- the 32 instruments -----
  const item = (I) => Object.values(MENU_ITEMS).find((it) => it.mods?.length === 1 && it.mods[0] === I.mods[0])?.id || Object.values(MENU_ITEMS).find((it) => it.mods?.includes(I.mods[0]))?.id;
  const MN = { C1: "Chandrayaan-1", C2: "Chandrayaan-2", C3: "Chandrayaan-3" };
  $("#insTable").innerHTML = `<thead><tr><th>Mission</th><th>Instrument</th><th>Rode on</th><th>Built by</th><th>What it did</th></tr></thead><tbody>` +
    INSTRUMENTS.map((I) => { const id = item(I); return `<tr${id ? ` data-item="${id}"` : ""}><td class="mono">${MN[I.mis]}</td><td><b>${I.short}</b><small>${I.name}</small></td><td>${I.carrier}</td><td>${I.by}</td><td>${I.what}</td></tr>`; }).join("") + "</tbody>";
  document.querySelectorAll("#insTable tr[data-item]").forEach((r) => r.addEventListener("click", () => { selectItem(r.dataset.item); $("#figure").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }); }));
  // ----- engines -----
  const E = ENGINES, kN = (n) => fmt(n / 1000, n < 1e4 ? 2 : 0), isp = (e) => (e.ispSL === e.ispVac ? `${e.ispVac}` : `${e.ispSL ? e.ispSL + " / " : "— / "}${e.ispVac}`);
  const rows = [
    ["S200", "LVM3 boosters", "2", kN(E.S200.thrustSL) + " avg", kN(E.S200.thrustVac) + " (derived)", isp(E.S200), E.S200.burn, E.S200.prop],
    ["Vikas", "LVM3 L110 core", "2", kN(E.VIKAS.thrustSL), kN(E.VIKAS.thrustVac), `— / ${E.VIKAS.ispVac}`, E.VIKAS.burn, E.VIKAS.prop],
    ["CE-20", "LVM3 C25 upper stage", "1", "—", kN(E.CE20.thrustVac), isp(E.CE20), E.CE20.burn, E.CE20.prop],
    ["S139", "PSLV PS1 core", "1", kN(E.S139.thrustSL) + " max", "—", isp(E.S139), E.S139.burn, E.S139.prop],
    ["PSOM-XL", "PSLV-XL boosters", "6", kN(E.PSOMXL.thrustSL) + " max", "—", isp(E.PSOMXL), E.PSOMXL.burn, E.PSOMXL.prop],
    ["Vikas", "PSLV PS2", "1", "—", kN(E.VIKAS2.thrustVac), isp(E.VIKAS2), E.VIKAS2.burn, E.VIKAS2.prop],
    ["HPS3", "PSLV PS3", "1", "—", kN(E.HPS3.thrustVac), isp(E.HPS3), E.HPS3.burn, E.HPS3.prop],
    ["PS4", "PSLV PS4", "2", "—", kN(E.PS4.thrustVac) + " each", isp(E.PS4), E.PS4.burn, E.PS4.prop],
    ["440 N LAM", "C-1 · C-2 orbiter · C-3 PM", "1", "—", kN(E.LAM440.thrustVac), `— / ${E.LAM440.ispVac}`, E.LAM440.burn, E.LAM440.prop],
    ["800 N", "Vikram", "4 + 1 fixed (C-2) · 4 (C-3)", "—", kN(E.VK800.thrustVac), `— / ≈${E.VK800.ispVac}`, E.VK800.burn, E.VK800.prop],
  ];
  $("#engTable").innerHTML = `<thead><tr><th>Engine</th><th>Where</th><th class="num">Per flight</th><th class="num">Thrust SL, kN</th><th class="num">Thrust vac, kN</th><th class="num">Isp SL / vac, s</th><th class="num">Burn</th><th>Propellants</th></tr></thead><tbody>` +
    rows.map((r) => `<tr>${r.map((c, i) => `<td${[2, 3, 4, 5, 6].includes(i) ? ' class="num"' : ""}>${c ?? "—"}</td>`).join("")}</tr>`).join("") + "</tbody>";
  const Ae = (e) => (e.thrustVac - e.thrustSL) / P0, dia = (a) => Math.sqrt(4 * a / Math.PI);
  const twLift = 2 * E.S200.thrustSL / (LIFTOFF_KG * G0);
  const vk = DESCENT.c3, vkW = vk.mass0 * G_MOON_SURF;
  $("#math").innerHTML = [
    `<p>F(p<sub>a</sub>) = F<sub>vac</sub> − p<sub>a</sub> · A<sub>e</sub> <em>— the momentum thrust is fixed by the propellant flow; the atmosphere takes away p<sub>a</sub>·A<sub>e</sub>. Ambient pressure from the U.S. Standard Atmosphere 1976.</em></p>`,
    `<p>Vikas: A<sub>e</sub> = (${kN(E.VIKAS.thrustVac)} − ${kN(E.VIKAS.thrustSL)}) kN ÷ 101,325 Pa = ${fmt(Ae(E.VIKAS), 2)} m² <em>→ exit Ø ${fmt(dia(Ae(E.VIKAS)), 2)} m</em></p>`,
    `<p>S200: F<sub>vac</sub> = ${kN(E.S200.thrustSL)} kN + 101,325 Pa × π × (${fmt(LV.s200Exit, 3)} m)² = ${kN(E.S200.thrustVac)} kN <em>(average sea-level rating plus the pressure on its 3.27 m exit; the published Isp pair, 227 / 274.5 s, would give about 4,330 kN, so the published figures do not quite agree)</em></p>`,
    `<p>LVM3 at liftoff: T/W = 2 × ${kN(E.S200.thrustSL)} kN ÷ (${fmt(LIFTOFF_KG)} kg × 9.80665 m/s²) = ${fmt(twLift, 2)} <em>— the L110's Vikas engines are not lit until T+108 s</em></p>`,
    `<p>Vikram at the start of the descent: weight on the Moon = ${fmt(vk.mass0)} kg × ${G_MOON_SURF} m/s² = ${fmt(vkW)} N; four engines at full thrust (all four fire until the 800 m hover) give T/W = 3,200 N ÷ ${fmt(vkW)} N = ${fmt(3200 / vkW, 2)}</p>`,
    `<p>Descent replay: thrust F = m · |a + g − v²/r|, from the published states at each phase boundary; propellant burned ṁ = F ÷ (I<sub>sp</sub> · g₀). Mass flow ṁ = F<sub>vac</sub> ÷ (I<sub>sp,vac</sub> · g₀) for every engine; Isp at any altitude = F ÷ (ṁ · g₀).</p>`,
  ].join("");
  // ----- compared -----
  $("#cmpTable").innerHTML = `<thead><tr><th></th><th>Chandrayaan-1</th><th>Chandrayaan-2</th><th>Chandrayaan-3</th></tr></thead><tbody>` + COMPARE.map((r) => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") + "</tbody>";
  // ----- timeline -----
  $("#tl").innerHTML = TIMELINE.map(([y, ev, fut]) => `<li${fut ? ' class="future"' : ""}><span class="y">${y}</span><ul>${ev.map(([d, tag, t]) => `<li><time>${d}</time><span>${tag ? `<span class="tag">${tag}</span>` : ""}${t}</span></li>`).join("")}</ul></li>`).join("");
  // ----- what's next -----
  $("#next2").innerHTML = NEXT.map((N) => `<article class="nx"><h4>${N.name}<small>${N.tag}</small></h4><span class="when">${N.when}</span><p>${N.p}</p><dl class="kv">${kvHTML(N.kv)}</dl></article>`).join("") +
    `<div class="horizon"><b>2040</b><p>India's stated goal for landing its own astronauts on the Moon. Chandrayaan-4's docking and return and LUPEX's water survey are steps toward it.</p></div>`;
  // ----- sources -----
  $("#sourcesList").innerHTML = SOURCES.map(([grp, t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a> <span class="src-g">${grp}</span></li>`).join("");
}
