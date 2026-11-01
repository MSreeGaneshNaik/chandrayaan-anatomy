// ============================================================================
// 13 · MISSION TRUTH — orbit histories for the journey map and the states at
// each phase boundary of the powered descents. Altitudes in km (orbits) or m
// (descents); times IST unless marked. Sources in SOURCES.
// ============================================================================
const ist = (s) => new Date(Date.parse(s + "+05:30")).toISOString().slice(0, 19);   // "2023-08-23T18:04" IST → UTC string
const J_MIS = {
  C1: {
    name: "Chandrayaan-1", launch: ist("2008-10-22T06:22:00"), ascentMin: 18.3, orbitLon: -122.93, thPeri: -60,
    ebn: [[255, 22860, ist("2008-10-22T06:22:00")], [305, 37900, ist("2008-10-23T09:00:00")], [336, 74715, ist("2008-10-25T05:48:00")], [348, 164600, ist("2008-10-26T07:08:00")], [465, 267000, ist("2008-10-29T07:38:00")]],
    tli: { date: ist("2008-11-04T04:56:00"), q: 1000, Q: 380000 },
    loi: { date: ist("2008-11-08T16:51:00"), q: 504, Q: 7502 },
    lunar: [[200, 7502, ist("2008-11-09T20:03:00")], [187, 255, ist("2008-11-10T21:58:00")], [101, 255, ist("2008-11-11T18:30:00")], [100, 100, ist("2008-11-12T12:00:00")]],   // 12 Nov: ISRO gives the date only; drawn at midday,
    mip: { sep: ist("2008-11-14T20:06:00"), impact: ist("2008-11-14T20:31:00"), lat: -89.55 },
    end: ist("2009-08-29T01:30:00"),
  },
  C2: {
    name: "Chandrayaan-2", launch: ist("2019-07-22T14:43:12"), ascentMin: 16.2, site: [-70.881, 22.784], thPeri: -45,
    ebn: [[169.7, 45475, ist("2019-07-22T14:43:12")], [230, 45163, ist("2019-07-24T14:52:00")], [251, 54829, ist("2019-07-26T01:08:00")], [276, 71792, ist("2019-07-29T15:12:00")], [277, 89472, ist("2019-08-02T15:27:00")], [276, 142975, ist("2019-08-06T15:04:00")]],
    tli: { date: ist("2019-08-14T02:21:00"), q: 276, Q: 375000 },
    loi: { date: ist("2019-08-20T09:02:00"), q: 114, Q: 18072 },
    lunar: [[118, 4412, ist("2019-08-21T12:50:00")], [179, 1412, ist("2019-08-28T09:04:00")], [124, 164, ist("2019-08-30T18:18:00")], [119, 127, ist("2019-09-01T18:21:00")]],
    sep: ist("2019-09-02T13:15:00"),
    deboost: [[104, 128, ist("2019-09-03T08:50:00")], [35, 101, ist("2019-09-04T03:42:00")]],
    descent: { start: ist("2019-09-07T01:38:03"), end: ist("2019-09-07T01:52:10"), alt0: 30, crash: true, shape: 0.45 },
  },
  C3: {
    name: "Chandrayaan-3", launch: ist("2023-07-14T14:35:17"), ascentMin: 16.2, site: [-69.373, 32.319], thPeri: -44.6,
    ebn: [[170, 36500, ist("2023-07-14T14:35:17")], [173, 41762, ist("2023-07-15T12:04:49")], [226, 41603, ist("2023-07-16T19:17:24")], [228, 51400, ist("2023-07-18T14:47:26")], [233, 71351, ist("2023-07-20T14:37:09")], [236, 127609, ist("2023-07-25T14:17:13")]],   // burn times: JPL, ISSFD 2024 table 7 (UTC + 5:30)
    tli: { date: ist("2023-08-01T00:30:00"), q: 288, Q: 369328 },
    loi: { date: ist("2023-08-05T19:12:00"), q: 164, Q: 18074 },
    lunar: [[170, 4313, ist("2023-08-06T23:00:00")], [174, 1437, ist("2023-08-09T13:45:00")], [151, 179, ist("2023-08-14T12:00:00")], [153, 163, ist("2023-08-16T08:30:00")]],
    sep: ist("2023-08-17T13:15:00"),
    deboost: [[113, 157, ist("2023-08-18T16:00:00")], [25, 134, ist("2023-08-20T02:00:00")]],
    descent: { start: ist("2023-08-23T17:44:00"), end: ist("2023-08-23T18:03:00"), alt0: 30, shape: 0.5 },
    pm: { q: 154000, Q: 380000 },
  },
};
// the journey stages, per mission. `at` names the track mark the marker flies to.
J_MIS.C1.phases = [
  { id: "j1All", key: "all", label: "Whole journey", at: "C1Lunar", view: "all", whole: true, craft: null, desc: "Chandrayaan-1 climbed to the Moon in five steps, each a burn of its 440 N engine at perigee that stretched the orbit further out, until the last one reached the Moon's distance. Captured on 8 November, it lowered itself to a 100 km polar orbit and mapped the Moon for ten months.", kv: [["Launch", "22 Oct 2008 · 06:22 IST"], ["Earth burns", "5 (23 Oct → 4 Nov)"], ["Lunar orbit insertion", "8 Nov 2008 · 16:51 IST"], ["Science orbit", "100 km circular, polar"], ["Mission", "312 days"]] },
  { id: "j1Launch", key: "launch", label: "Launch · PSLV-C11", at: "C1Launch", view: "launch", craft: "PSLV-C11", desc: "PSLV-C11 lifted off from the Second Launch Pad at Sriharikota and released Chandrayaan-1 1,096.5 s later, 508 km up, into a long ellipse inclined 17.9° to the equator.", kv: [["Liftoff", "22 Oct 2008 · 06:22 IST"], ["Separation", "T+1,096.5 s · 508 km"], ["Orbit", "255 × 22,860 km · 17.9°"]] },
  { id: "j1EBN", key: "ebn", label: "Five Earth-bound burns", at: "C1EBN", view: "earth", craft: "Chandrayaan-1", desc: "Five burns at perigee raised the apogee from 22,860 km to 380,000 km over thirteen days. The fourth took it past 267,000 km; the fifth, on 4 November, put it on its way to the Moon.", kv: [["23 Oct · 09:00", "305 × 37,900 km"], ["25 Oct · 05:48", "336 × 74,715 km"], ["26 Oct · 07:08", "348 × 164,600 km"], ["29 Oct · 07:38", "465 × 267,000 km"], ["4 Nov · 04:56", "1,000 × 380,000 km"]] },
  { id: "j1Coast", key: "coast", label: "To the Moon", at: "C1Coast", view: "coast", craft: "Chandrayaan-1", desc: "The final ellipse carried the spacecraft out to the Moon's distance in four days, where it entered the Moon's sphere of influence on 7 November.", kv: [["Transfer burn", "4 Nov 2008 · 04:56 IST"], ["Apogee", "≈380,000 km"], ["Sphere of influence", "7 Nov 2008 · 18:05 UT"]] },
  { id: "j1LOI", key: "loi", label: "Lunar orbit insertion", at: "C1LOI", view: "loi", craft: "Chandrayaan-1", desc: "An 817 s retro-burn slowed it by 367 m/s and the Moon captured it in an 11-hour polar orbit.", kv: [["Burn", "8 Nov 2008 · 16:51 IST · 817 s"], ["Δv", "366.96 m/s"], ["Orbit", "504 × 7,502 km"], ["Period", "≈11 h"]] },
  { id: "j1Lunar", key: "lunar", label: "Down to 100 km", at: "C1Lunar", view: "moon", craft: "Chandrayaan-1", desc: "Four more burns lowered the orbit to 100 km circular by 12 November. From here, every two hours, it passed over both poles.", kv: [["9 Nov", "200 × 7,502 km"], ["10 Nov", "187 × 255 km"], ["11 Nov", "101 × 255 km"], ["12 Nov", "100 km circular"]] },
  { id: "j1MIP", key: "mip", label: "Moon Impact Probe", at: "C1MIP", view: "mip", craft: "Moon Impact Probe", desc: "The 35 kg probe separated at 20:06 IST and fell for about 25 minutes toward the south pole, sampling the thin atmosphere and photographing the surface on the way down, until it struck near Shackleton crater.", kv: [["Separation", "14 Nov 2008 · 20:06 IST"], ["Impact", "≈20:31 IST"], ["Fall", "≈25 min from ≈100 km"], ["Site", "Jawahar Point · ≈89.55°S"]] },
];
J_MIS.C2.phases = [
  { id: "j2All", key: "all", label: "Whole journey", at: "C2Land", view: "all", whole: true, craft: null, desc: "Chandrayaan-2 reached the Moon the same way: five Earth-bound burns, a transfer burn on 14 August and capture on 20 August. Vikram separated on 2 September and attempted to land on the 7th; the orbiter is still circling the Moon.", kv: [["Launch", "22 Jul 2019 · 14:43 IST"], ["Lunar orbit insertion", "20 Aug 2019 · 09:02 IST"], ["Vikram separates", "2 Sep 2019 · 13:15 IST"], ["Landing attempt", "7 Sep 2019 · ≈01:38 IST"]] },
  { id: "j2Launch", key: "launch", label: "Launch · GSLV Mk III-M1", at: "C2Launch", view: "launch", craft: "GSLV Mk III-M1", desc: "GSLV Mk III-M1 lifted off a week late, after the first countdown was called off, and put Chandrayaan-2 into an orbit 6,000 km higher than planned, which saved propellant for later.", kv: [["Liftoff", "22 Jul 2019 · 14:43:12 IST"], ["Separation", "T+≈974 s (16 min 14 s)"], ["Orbit", "169.7 × 45,475 km"]] },
  { id: "j2EBN", key: "ebn", label: "Five Earth-bound burns", at: "C2EBN", view: "earth", craft: "Chandrayaan-2", desc: "Five burns of the orbiter's 440 N engine raised the apogee to 142,975 km over two weeks.", kv: [["24 Jul · 14:52", "230 × 45,163 km"], ["26 Jul · 01:08", "251 × 54,829 km"], ["29 Jul · 15:12", "276 × 71,792 km"], ["2 Aug · 15:27", "277 × 89,472 km"], ["6 Aug · 15:04", "276 × 142,975 km"]] },
  { id: "j2Coast", key: "coast", label: "Trans-lunar injection", at: "C2Coast", view: "coast", craft: "Chandrayaan-2", desc: "A 1,203 s burn early on 14 August sent it toward the Moon; six days later it arrived.", kv: [["Burn", "14 Aug 2019 · 02:21 IST · ≈1,203 s"]] },
  { id: "j2LOI", key: "loi", label: "Lunar orbit insertion", at: "C2LOI", view: "loi", craft: "Chandrayaan-2", desc: "A 1,738 s burn put the spacecraft into a 114 × 18,072 km lunar orbit.", kv: [["Burn", "20 Aug 2019 · 09:02 IST · 1,738 s"], ["Orbit", "114 × 18,072 km"]] },
  { id: "j2Lunar", key: "lunar", label: "Lowering the orbit", at: "C2Lunar", view: "moon", craft: "Chandrayaan-2", desc: "Four burns brought it to a near-circular orbit about 120 km up; Vikram separated from the orbiter on 2 September.", kv: [["21 Aug", "118 × 4,412 km"], ["28 Aug", "179 × 1,412 km"], ["30 Aug", "124 × 164 km"], ["1 Sep", "119 × 127 km"], ["Separation", "2 Sep 2019 · 13:15 IST"]] },
  { id: "j2Deboost", key: "deboost", label: "Vikram de-orbits", at: "C2Deboost", view: "moon", craft: "Vikram", desc: "Two short burns of Vikram's own engines lowered its orbit to 35 × 101 km; the orbiter stayed at 96 × 125 km.", kv: [["3 Sep · 08:50", "104 × 128 km · 4 s"], ["4 Sep · 03:42", "35 × 101 km · 9 s"]] },
  { id: "j2Land", key: "land", label: "Landing attempt", at: "C2Land", view: "site", craft: "Vikram", desc: "Powered descent began at about 01:38 IST. Rough braking from 30 km to 7.4 km was nominal; in the next phase the velocity fell more than designed, and Vikram reached the surface too fast, close to its target (within 500 m, by ISRO's account). ISRO reported normal performance down to 2.1 km; contact was lost moments before touchdown.", kv: [["Powered descent", "7 Sep 2019 · ≈01:38 IST"], ["Normal to", "2.1 km (ISRO)"], ["Crash site", "Tiranga Point · 70.881°S 22.784°E"]] },
];
J_MIS.C3.phases = [
  { id: "j3All", key: "all", label: "Whole journey", at: "C3Land", view: "all", whole: true, craft: null, desc: "Chandrayaan-3 flew the same route as Chandrayaan-2 in forty days: Earth-bound burns, a transfer on 1 August, capture on 5 August, separation on the 17th and the landing on 23 August 2023.", kv: [["Launch", "14 Jul 2023 · 14:35:17 IST"], ["Lunar orbit insertion", "5 Aug 2023 · 19:12 IST"], ["Separation", "17 Aug 2023"], ["Landing", "23 Aug 2023 · 18:03 IST (12:33 UTC)"]] },
  { id: "j3Launch", key: "launch", label: "Launch · LVM3-M4", at: "C3Launch", view: "launch", craft: "LVM3-M4", desc: "LVM3-M4 released the integrated module 969.4 s after liftoff, 179 km up, into the planned 170 × 36,500 km orbit.", kv: [["Liftoff", "14 Jul 2023 · 14:35:17 IST"], ["Separation", "T+969.4 s · 179.2 km"], ["Orbit", "170 × 36,500 km · 21.3°"]] },
  { id: "j3EBN", key: "ebn", label: "Five Earth-bound burns", at: "C3EBN", view: "earth", craft: "Chandrayaan-3", desc: "The propulsion module's engine raised the apogee to 127,609 km in five burns over eleven days.", kv: [["15 Jul · perigee", "173 × 41,762 km"], ["16 Jul · apogee", "226 × 41,603 km"], ["18 Jul", "228 × 51,400 km (press)"], ["20 Jul", "233 × 71,351 km"], ["25 Jul", "236 × 127,609 km"]] },
  { id: "j3Coast", key: "coast", label: "Trans-lunar injection", at: "C3Coast", view: "coast", craft: "Chandrayaan-3", desc: "Just after midnight on 1 August a burn raised the apogee to 369,328 km, out to the Moon.", kv: [["Burn", "1 Aug 2023 · ≈00:00–01:00 IST"], ["Orbit", "288 × 369,328 km"]] },
  { id: "j3LOI", key: "loi", label: "Lunar orbit insertion", at: "C3LOI", view: "loi", craft: "Chandrayaan-3", desc: "A 1,835 s retro-burn at periselene; the Moon captured it into a 164 × 18,074 km orbit.", kv: [["Burn", "5 Aug 2023 · 19:12 IST · 1,835 s"], ["Orbit", "164 × 18,074 km"]] },
  { id: "j3Lunar", key: "lunar", label: "Lowering the orbit", at: "C3Lunar", view: "moon", craft: "Chandrayaan-3", desc: "Four more burns brought it to a 153 × 163 km orbit, where Vikram and the propulsion module parted on 17 August.", kv: [["6 Aug", "170 × 4,313 km"], ["9 Aug", "174 × 1,437 km"], ["14 Aug", "151 × 179 km"], ["16 Aug", "153 × 163 km"], ["Separation", "17 Aug 2023"]] },
  { id: "j3Deboost", key: "deboost", label: "Vikram de-boosts", at: "C3Deboost", view: "moon", craft: "Vikram", desc: "Two burns of Vikram's own engines lowered its orbit to 25 × 134 km, the starting point for the powered descent.", kv: [["18 Aug · ≈16:00", "113 × 157 km"], ["20 Aug · ≈02:00", "25 × 134 km"]] },
  { id: "j3Land", key: "land", label: "Landing at Shiv Shakti", at: "C3Land", view: "site", craft: "Vikram", desc: "Powered descent began at about 17:44 IST, 745 km from the site. Nineteen minutes later Vikram touched down at 69.373°S, 32.319°E, about 350 m from its aim point.", kv: [["Powered descent", "23 Aug 2023 · ≈17:44 IST"], ["Touchdown", "18:03 IST · 12:33 UTC"], ["Site", "69.373°S 32.319°E"], ["From the pole", "≈625 km"]] },
  { id: "j3PM", key: "pm", label: "The propulsion module comes home", at: "C3Lunar", view: "pm", craft: null, desc: "With more than 100 kg of propellant left, the propulsion module raised its lunar orbit on 9 October, burned out of it on 13 October, flew past the Moon four times and left its sphere of influence on 10 November. On 22 November it passed its first perigee around Earth, 1.54 lakh km out. Lunar flybys in November 2025 later reshaped that orbit.", kv: [["Trans-Earth burn", "13 Oct 2023"], ["Left the Moon", "10 Nov 2023"], ["First Earth perigee", "22 Nov 2023 · 1.54 lakh km"], ["Period", "≈13 days · 27°"], ["After Nov 2025 flybys", "4.09 × 7.27 lakh km · 22°"]] },
];
const J_BY = {};
for (const k of ["C1", "C2", "C3"]) J_MIS[k].phases.forEach((p, i) => { p.i = i; p.mis = k; J_BY[p.id] = p; });

// ---------------- powered descents ----------------
// keys: [t s from start, altitude m, horizontal m/s, vertical m/s (up +), phase index]
const DESCENT = {
  c3: {
    info: "dsC3", name: "Chandrayaan-3 · powered descent", engines: 4, lit: (t) => (t >= 875 ? 2 : 4), Fmax: 800, mass0: 1729, isp: 315,   // two engines off from the 800 m hover (ISRO profile, ISSFD 2024 fig. 11)
    phases: ["Rough braking", "Attitude hold", "Fine braking", "Hover · 800 m", "Vertical descent", "Hazard scan · 150 m", "Retarget", "Descent to 10 m", "Terminal descent"],
    keys: [[0, 30000, 1680, 0, 0], [690, 7400, 358, -61, 1], [700, 6800, 336, -59, 2], [875, 800, 0, 0, 3], [887, 800, 0, 0, 4], [1018, 150, 0, 0, 5], [1040, 150, 0, 0, 6], [1092, 60, 0, -1.3, 7], [1130, 10, 0, -1.0, 8], [1140, 0, 0, -0.983, 8]],
    endLine: "Touchdown · Shiv Shakti Point", endSub: "69.373°S 32.319°E · 0.98 m/s down at contact · 23 Aug 2023, 12:33 UTC",
    desc: "The planned profile, which the flight followed closely: 690 s of rough braking from 30 km and 1.68 km/s to 7.4 km; a 10 s attitude hold while the cameras fixed its position; 175 s of fine braking to a stop 800 m above the site, where two of the four engines were shut down; a vertical descent on the other two to 150 m and a hover while the hazard camera picked a safe spot; a sideways retarget to 60 m; and the last 10 m at about 1 m/s.",
    kv: [["Start", "≈17:44 IST · 30 km · 1.68 km/s"], ["Rough braking", "690 s → 7.4 km · 358 m/s"], ["Attitude hold", "10 s → 6.8 km"], ["Fine braking", "175 s → 800 m"], ["Engines", "4 to the hover · 2 for the last 800 m"], ["Hazard scan", "≈22 s at 150 m"], ["Touchdown", "0.98 m/s · ≈350 m from the aim point"], ["Design limits", "≤ 2 m/s down · ≤ 0.5 m/s across · ≤ 12° slope"]],
    cap: "Vikram's 19-minute powered descent, replayed from the published phase boundaries; thrust, throttle and tilt are worked out from them with F = m(a + g − v²/r). The replay runs fast while high and in real time near the ground; above 30 m the height and distance to the site are drawn on a compressed scale so the whole descent fits, and the readout gives the true values. Propellant burned assumes an engine Isp of 315 s, which ISRO has not published.",
  },
  c2: {
    info: "dsC2", name: "Chandrayaan-2 · landing attempt", engines: 5, Fmax: 800, mass0: 1471, isp: 315, crash: true, los: 838, tumble: [806, 840],
    phases: ["Rough braking", "Camera coasting", "Fine braking · off nominal", "Out of control"],
    keys: [[0, 30000, 1683, 0, 0], [693.8, 7400, 139, -45, 1], [705, 6900, 120, -50, 2], [806, 2100, 62, -55, 2], [838, 330, 48, -58, 3], [844, 0, 46, -60, 3]],   // 705 s and 806 s are interpolated: ISRO published neither state
    desc: "Rough braking from 30 km to 7.4 km went as designed. From 693.8 s, in the camera-coasting phase, the velocity fell more than designed; the guidance then commanded more thrust while software limited how fast the lander could turn, and fine braking began outside its design range. ISRO reported normal performance down to 2.1 km; the live telemetry, last showing Vikram about 330 m up and just over 1 km short of the site, read about 48 m/s across and 58–60 m/s down.",
    kv: [["Start", "≈01:38 IST · 30 km · 1,683 m/s"], ["Rough braking", "→ 7.4 km · 146 m/s"], ["Anomaly", "from 693.8 s"], ["Normal to", "2.1 km (ISRO)"], ["Last telemetry", "≈330 m up · ≈48 m/s across · ≈58–60 m/s down"], ["Impact speed", "not published"], ["Crash site", "70.881°S 22.784°E · close to the target (within 500 m, by ISRO's account)"]],
    cap: "Chandrayaan-2's landing attempt, replayed from the published phase states and the last live telemetry, with the states between them interpolated; the tumble after the anomaly is drawn to show the loss of control, not reconstructed. Vikram here has five engines, the centre one included.",
  },
  hop: {
    info: "dsHop", name: "Vikram's hop", engines: 4, lit: () => 2, Fmax: 800, mass0: 790, isp: 315,   // two engines at about 700 N (LPSC)
    phases: ["Engines lit", "Hop", "Down again"],
    keys: [[0, 0, 0, 0, 0], [1.2, 0.22, 0.2, 0.25, 1], [2.0, 0.4, 0.23, 0, 1], [3.4, 0, 0, -0.35, 2]],
    endLine: "Down again · 30–40 cm away", endSub: "3 Sep 2023 · ramp, ChaSTE and ILSA folded before and redeployed after",
    desc: "On 3 September, with its surface work done, Vikram fired two of its engines on command, at about 700 N each, rose about 40 cm and set down 30 to 40 cm away. Before the hop the ramp, ChaSTE and ILSA were folded back; afterwards they were deployed again and the instruments took a second set of readings.",
    kv: [["Date", "3 Sep 2023"], ["Rise", "≈40 cm"], ["Moved", "30–40 cm"], ["Lander put to sleep", "4 Sep 2023 · 08:00 IST"]],
    cap: "The hop, replayed at real speed. Its height and distance are ISRO's; two engines fired, at about 700 N (LPSC). The lander's mass afterwards is not published, so the thrust shown assumes about 790 kg, what the descent replay leaves.",
  },
};
