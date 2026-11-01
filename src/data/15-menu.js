// ============================================================================
// 15 · PARTS INDEX — sections of items; each item frames some parts of one
// display (or the launch stack) and opens a sheet under the figure. Sections
// are added by the builders in the order they run.
// ============================================================================
const MENU = [], MENU_ITEMS = {}, MOD_TO_ITEM = {};
function addMenu(title, items) {
  MENU.push([title, items]);
  for (const [id, label, o] of items) MENU_ITEMS[id] = { id, label, mods: [], ...o };
}
// a click on a part opens the most specific item that holds it
const MOD_TO_ITEM_EXTRA = {};   // parts that open an item without being framed by it
function indexMods() {
  Object.assign(MOD_TO_ITEM, MOD_TO_ITEM_EXTRA);
  const by = {};
  for (const it of Object.values(MENU_ITEMS)) for (const k of it.mods || []) if (!by[k] || by[k].mods.length > it.mods.length) by[k] = it;
  for (const k in by) if (!MOD_TO_ITEM[k]) MOD_TO_ITEM[k] = by[k].id;
}

// The index as a reader meets it: an overview of every display first, then each rocket's stages, the
// engines, each spacecraft part by part, the landings, and the journey last (all three missions, under
// their own sub-heads). Builders register items as they go; this puts them in that order once, at boot.
function organizeMenu() {
  const ids = (sec) => (MENU.find(([t]) => t === sec)?.[1] || []).map(([id]) => id);
  const without = (list, ...drop) => list.filter((id) => !drop.includes(id));
  const order = [
    ["Overview", [["stack", "LVM3 on the Second Launch Pad"], ["pslv", "PSLV-XL · PSLV-C11"], ["c1whole", "Chandrayaan-1 · 2008"], ["c2whole", "Chandrayaan-2 · orbiter with Vikram · 2019"], ["c3whole", "Chandrayaan-3 · integrated module · 2023"], ["vkWhole", "Vikram and Pragyan on the Moon"]]],
    ["LVM3 stages", without(ids("LVM3 · Chandrayaan-2 & 3"), "stack")],
    ["PSLV-XL stages", without(ids("PSLV-XL · Chandrayaan-1"), "pslv")],
    ["Engines", ["engAll", [null, "Detailed engines"], ...ids("Detailed engines"), [null, "In the row only"], ...ids("All engines").filter((id) => !MENU_ITEMS[id]?.hidden && id !== "engAll")]],
    ["Chandrayaan-1", without(ids("Chandrayaan-1"), "c1whole")],
    ["Chandrayaan-2", without(ids("Chandrayaan-2"), "c2whole")],
    ["Chandrayaan-3", without(ids("Chandrayaan-3"), "c3whole")],
    ["Vikram & Pragyan", without(ids("Vikram & Pragyan"), "vkWhole")],
    ["The landings", ids("The landings")],
    ["The journey", [[null, "Chandrayaan-1"], ...ids("Journey · Chandrayaan-1"), [null, "Chandrayaan-2"], ...ids("Journey · Chandrayaan-2"), [null, "Chandrayaan-3"], ...ids("Journey · Chandrayaan-3")]],
  ];
  const used = new Set();
  const out = order.map(([title, list]) => [title, list.map((x) => {
    const [id, label] = Array.isArray(x) ? x : [x, null];
    if (!id) return [null, label];
    if (!MENU_ITEMS[id]) return null;
    used.add(id); if (label) MENU_ITEMS[id].label = label;
    return [id, MENU_ITEMS[id].label, MENU_ITEMS[id]];
  }).filter(Boolean)]).filter(([, list]) => list.some(([id]) => id));
  const rest = MENU.flatMap(([, list]) => list).filter(([id]) => id && !used.has(id) && !MENU_ITEMS[id]?.hidden);
  MENU.length = 0; MENU.push(...out);
  if (rest.length) MENU.push(["More", rest]);
}
