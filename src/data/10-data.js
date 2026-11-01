// ============================================================================
// 10 · TRUTH — physical constants and the atmosphere. Rated figures live in
// 11-craft-data (spacecraft), 12-launch (rockets) and 13-missions (orbits and
// descents); every one is sourced in SOURCES. Anything derived is computed with
// standard physics, never tuned.
// ============================================================================
const LBF = 4.4482216152605;      // N per lbf (exact)
const LB = 0.45359237;            // kg per lb (exact)
const FT = 0.3048;                // m per ft (exact)
const G0 = 9.80665;               // standard gravity, m/s² (exact)
const P0 = 101325;                // sea-level standard pressure, Pa
const AU = 149597870.7;           // km (IAU 2012, exact)
const C_KMS = 299792.458;         // speed of light, km/s (exact)
const G_MOON_SURF = 1.625;        // lunar surface gravity, m/s² (NSSDCA Moon fact sheet: 1.62)
const MU_EARTH = 398600.4418;     // km³/s²
const MU_MOON = 4902.800;         // km³/s²

// --- U.S. Standard Atmosphere 1976, geopotential layers to 86 km -------------
const ATM_LAYERS = [[0, 288.15, -0.0065], [11000, 216.65, 0], [20000, 216.65, 0.001], [32000, 228.65, 0.0028], [47000, 270.65, 0], [51000, 270.65, -0.0028], [71000, 214.65, -0.002], [84852, 186.946, 0]];
const ATM_P = (() => { const R = 287.05287, out = [P0]; for (let i = 0; i < ATM_LAYERS.length - 1; i++) { const [h0, T0, L] = ATM_LAYERS[i], h1 = ATM_LAYERS[i + 1][0], p = out[i]; out.push(L === 0 ? p * Math.exp(-G0 * (h1 - h0) / (R * T0)) : p * Math.pow((T0 + L * (h1 - h0)) / T0, -G0 / (L * R))); } return out; })();
function pressureAt(hGeometric) { // Pa
  const r0 = 6356766, h = (r0 * Math.max(0, hGeometric)) / (r0 + Math.max(0, hGeometric)), R = 287.05287;
  let i = ATM_LAYERS.length - 1; while (i > 0 && h < ATM_LAYERS[i][0]) i--;
  const [h0, T0, L] = ATM_LAYERS[i], p0 = ATM_P[i];
  if (h > 86000) return 0.3734 * Math.exp(-(h - 86000) / 6000);
  return L === 0 ? p0 * Math.exp(-G0 * (h - h0) / (R * T0)) : p0 * Math.pow((T0 + L * (h - h0)) / T0, -G0 / (L * R));
}

const MODULES_PRE = {};
const MODULES = MODULES_PRE;   // module key → { name, short, desc, kv, by } — filled as parts are built

// [group, title, url]
const SOURCES = [
  ["LPSC · engines", "LPSC propulsion systems: Vikas, CE20, 440 N LAM, 800 N throttleable engine", "https://www.lpsc.gov.in/propulsionsystems.html"],
  ["LPSC · engines", "Development status of CE20 cryogenic engine for GSLV Mk III (IAC-16-C4.1)", "http://iafastro.directory/iac/archive/browse/IAC-16/C4/1/33734/"],
  ["LPSC · engines", "Viking (rocket engine), Vikas's parent: turbopump, gas generator, water", "https://en.wikipedia.org/wiki/Viking_(rocket_engine)"],
  ["ISRO · missions", "Chandrayaan-3 mission page and details", "https://www.isro.gov.in/Chandrayaan3_Details.html"],
  ["ISRO · missions", "Chandrayaan-3 (ISRO_EN)", "https://www.isro.gov.in/ISRO_EN/Chandrayaan3.html"],
  ["ISRO · missions", "LVM3-M4 / Chandrayaan-3 launch brochure", "https://new1.isro.gov.in/media_isro/pdf/Missions/LVM3/LVM3M4_Chandrayaan3_brochure.pdf"],
  ["ISRO · missions", "Chandrayaan-3 lunar orbit insertion", "https://www.isro.gov.in/Ch3_Lunar_Orbit_Insertion_Press_Release.html"],
  ["ISRO · missions", "Chandrayaan-3 propulsion module moved from lunar orbit to Earth orbit", "https://www.isro.gov.in/Ch3_Propulsion_Module_moved_from_Lunar_orbit_to_Earth_orbit.html"],
  ["ISRO · missions", "Chandrayaan-3 propulsion module lunar fly-bys", "https://www.isro.gov.in/Chandrayaan_3_Fly_by.html"],
  ["ISRO · missions", "GSLV Mk III-M1 / Chandrayaan-2 brochure", "https://new1.isro.gov.in/media_isro/pdf/GSLVMkIII_M1.pdf"],
  ["ISRO · missions", "GSLV Mk III-M1 mission page", "https://www.isro.gov.in/mission_GSLVMkIIIM1.html"],
  ["ISRO · missions", "Chandrayaan-2 launch press release (achieved orbit)", "https://www.isro.gov.in/ISRO_EN/Press%20Release5.html"],
  ["ISRO · missions", "Chandrayaan-2 trans-lunar insertion", "https://www.isro.gov.in/Press%20Release4.html"],
  ["ISRO · missions", "Chandrayaan-2 lunar orbit insertion", "https://new1.isro.gov.in/Lunar%20Orbit%20Insertion.html"],
  ["ISRO · missions", "Chandrayaan-2: Vikram separates from the orbiter", "https://www.isro.gov.in/Vikram%20Lander%20successfully%20separates.html"],
  ["ISRO · missions", "Chandrayaan-2 de-orbiting manoeuvres (1 and 2)", "https://www.isro.gov.in/Second%20de-orbiting%20maneuver.html"],
  ["ISRO · missions", "Chandrayaan-1 mission page", "https://www.isro.gov.in/Chandrayaan_1.html"],
  ["ISRO · missions", "PSLV-C11 mission page", "https://www.isro.gov.in/mission_PSLV_C11.html"],
  ["ISRO · missions", "PSLV-C11 / Chandrayaan-1 publication", "https://www.isro.gov.in/media_isro/pdf/chandrayaan/PSLV_C11_PUBLICATION.pdf"],
  ["ISRO · vehicles", "LVM3 (GSLV Mk III) vehicle page", "https://www.isro.gov.in/GSLVmk3_CON.html"],
  ["ISRO · vehicles", "GSLV Mk III-D1 brochure", "https://www.isro.gov.in/media_isro/pdf/Publications/Brochures/GSLVMarkIIID1.pdf"],
  ["ISRO · vehicles", "PSLV-C25 publication (PSLV-XL)", "https://new1.isro.gov.in/media_isro/pdf/Missions/PSLVC25/publication_PSLVC25.pdf"],
  ["ISRO · vehicles", "Launch services and launch pads at Sriharikota", "https://www.isro.gov.in/launchservices.html"],
  ["ISRO · vehicles", "Current space situation around the Moon", "https://www.isro.gov.in/Current_Space_Situation_around_Moon_Assessment.html"],
  ["Government of India", "PIB: Chandrayaan-3 landing fact sheet, 25 Aug 2023", "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2023/aug/doc2023825244301.pdf"],
  ["Government of India", "New India Samachar, 2 Sep 2023: the landing and the Chandrayaan-2 lessons", "https://newindiasamachar.pib.gov.in/WriteReadData/flipbook/2023/Sep/2nd/English/files/basic-html/page19.html"],
  ["Papers", "Chandrayaan-3 descent and landing analysis (arXiv 2309.14384)", "https://arxiv.org/pdf/2309.14384"],
  ["Papers", "Chandrayaan-3 propulsion module trajectory (arXiv 2511.03594)", "https://arxiv.org/pdf/2511.03594"],
  ["NASA", "NSSDCA: Chandrayaan-1 launch press release text", "https://nssdc.gsfc.nasa.gov/planetary/text/chandrayaan1_pr_20081022.txt"],
  ["NASA", "NSSDCA Moon fact sheet", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html"],
  ["NASA", "LROC: the Chandrayaan-2 Vikram impact site", "https://lroc.im-ldi.com/images/1131"],
  ["NASA", "PDS: Chandrayaan-1 mission catalogue", "https://pds.nasa.gov/data/pds3/backup/202006-img/zzold/missionCH1.cat"],
  ["ESA", "Chandrayaan-1 reaches its final orbit", "https://www.esa.int/Enabling_Support/Operations/Lunar_spacecraft_reaches_its_final_orbit"],
  ["ESA", "Chandrayaan-1 loses radio contact", "https://esa.int/Science_Exploration/Space_Science/Chandrayaan-1_loses_radio_contact"],
  ["Reporting", "Spaceflight101: GSLV Mk III", "https://spaceflight101.com/spacerockets/gslv-mk-iii/"],
  ["Reporting", "Gunter's Space Page: PSLV-XL", "https://space.skyrocket.de/doc_lau_det/pslv-xl.htm"],
  ["Reporting", "Gunter's Space Page: GSLV Mk III", "https://space.skyrocket.de/doc_lau_det/gslv-mk3.htm"],
  ["Reporting", "Spaceref: Chandrayaan-1 status reports", "https://spaceref.com/status-report/chandrayaan-1s-orbit-closer-to-moon/"],
  ["Reporting", "The Planetary Society: Vikram apparently crash-lands", "https://planetary.org/articles/vikram-apparently-crash-lands"],
  ["Reporting", "Sky & Telescope: Chandrayaan-1 is a hit", "https://skyandtelescope.org/astronomy-news/chandrayaan-1-is-a-hit/"],
  ["Reporting", "Jatan Mehta: Chandrayaan-3 makes historic touchdown", "https://jatan.space/chandrayaan-3-makes-historic-touchdown/"],
  ["Reporting", "Scientific American: Chandrayaan-3 makes historic touchdown", "https://www.scientificamerican.com/article/chandrayaan-3-makes-historic-touchdown-on-the-moon"],
  ["Reporting", "The News Minute: extra braking caused Vikram's hard landing", "https://www.thenewsminute.com/article/extra-braking-caused-deviation-hard-landing-vikram-lander-govt-chandrayaan-2-112696"],
  ["Reference", "Wikipedia: Chandrayaan-1 (cross-check)", "https://en.wikipedia.org/wiki/Chandrayaan-1"],
  ["Reference", "Wikipedia: Chandrayaan-2 (cross-check)", "https://en.wikipedia.org/wiki/Chandrayaan-2"],
  ["Reference", "Wikipedia: Chandrayaan-3 (cross-check)", "https://en.wikipedia.org/wiki/Chandrayaan-3"],
  ["Reference", "Wikipedia: Polar Satellite Launch Vehicle (cross-check)", "https://en.wikipedia.org/wiki/Polar_Satellite_Launch_Vehicle"],
  ["Reference", "Wikipedia: CE-20 (cross-check)", "https://en.wikipedia.org/wiki/CE-20"],
];
