// ============================================================================
// 44 · PAD EXHAUST — what a solid motor's exhaust does at the pad. It goes down
// through the deck opening onto the flame deflector, which turns it both ways
// into the ducts; flame shows at the deflector and along the ducts, and where
// the ducts open the exhaust rolls out as clouds of aluminium oxide and steam
// that pile up, drift outward and climb. A low ring of smoke spreads round the
// pedestal's base. Every cloud blooms over seconds, not frames, and fades
// slowly after cutoff, the way the real ones linger.
// Used by LVM3 on the Second Launch Pad and by PSLV-C11 (same pad).
// ============================================================================
// solid-motor exhaust cloud: white on top where the Sun catches it, grey-brown and shadowed underneath
// [sunlit top, body, shadowed interior, underside, flame glow]; the last colour lights the base of the clouds nearest the fire
FX_SETS.SMOKE = { light: ["#ffffff", "#f5f3ef", "#dcd7cf", "#c3bbb0", "#f59a4a", 0.97], dark: ["#f2ede6", "#aaa49b", "#7c766f", "#4f4b46", "#ff8a3a", 0.9] };
FX_SETS.SMOKE_D = { light: ["#fbfaf7", "#e8e4dd", "#cbc4ba", "#aba296", "#ec8a42", 0.95], dark: ["#ddd6cc", "#918b84", "#68635d", "#403d39", "#f07a34", 0.88] };

// parent: the group the pad belongs to; o: { deckY (deck underside), groundY, open (duct exit distance along ±z),
// ductW, reach (how far the clouds roll out), ring (pedestal half-width), r (exhaust radius at the deflector) }
function padExhaust(parent, o) {
  const P = { fire: null, ducts: [], billows: [], ring: [], column: [] };
  const gy = o.groundY, open = o.open, reach = o.reach ?? 14;
  // the flare on the deflector, under the deck opening
  P.fire = makeFX("FIRE", 1, { len: Math.max(2, o.deckY - gy + 1.5), r0: o.r * 1.7, rmax: o.r * 2.1, freq: 1.1, flow: 3, dens: 1.7, attack: 0.4, decay: 1.4 });
  P.fire.position.set(0, o.deckY + 0.5, 0); parent.add(P.fire);
  // flame along both ducts, from the deflector to where they open onto the apron
  for (const sz of [-1, 1]) {
    const f = makeFX("FIRE", 0, { len: open + 2, r0: o.ductW * 0.32, rmax: o.ductW * 0.52, spread: 0.55, pow: 1, freq: 0.9, flow: 22, dens: 1.5, hot: 3, fade: 0.55, coolK: 1.8, attack: 0.45, decay: 1.2 });
    f.position.set(0, gy - 0.8, 0); f.rotation.x = -sz * Math.PI / 2; parent.add(f); P.ducts.push(f);
  }
  // billows at each duct exit: three clouds that pile up, roll outward and rise as the firing goes on
  for (const sz of [-1, 1]) for (let i = 0; i < 3; i++) {
    const kind = i === 2 ? "SMOKE_D" : "SMOKE";
    const f = makeFX(kind, 1, { len: 10 + i * 3, r0: 5, rmax: 9 + i * 2, freq: 0.75 + i * 0.1, flow: 0.45, dens: 1.6, soot: i === 0 ? 0.75 : i === 1 ? 0.3 : 0, attack: 1.4 + i * 1.3, decay: 4 + i });
    parent.add(f); P.billows.push({ f, sz, i, x: (i - 1) * 2.6 * (sz > 0 ? 1 : -1) });
  }
  // a low ring of smoke spreading round the pedestal's base
  for (let k = 0; k < 6; k++) {
    const a = k * TAU / 6 + 0.3, f = makeFX(k % 2 ? "SMOKE_D" : "SMOKE", 1, { len: 5, r0: 4, rmax: 7, freq: 0.9, flow: 0.35, dens: 2.0, soot: 0.25, attack: 2.2 + (k % 3) * 0.6, decay: 5 });
    parent.add(f); P.ring.push({ f, a });
  }
  // flame and smoke splashing up round the nozzles on the deck itself
  if (o.deckTop != null) { P.splash = makeFX("FIRE", 1, { len: 2.2, r0: o.r * 1.5, rmax: o.r * 2.2, freq: 1.3, flow: 2.5, dens: 1.3, attack: 0.5, decay: 1.2 }); P.splash.position.set(0, o.deckTop + 1.4, 0); parent.add(P.splash); }
  // two columns climbing over the duct exits
  for (const sz of [-1, 1]) { const f = makeFX("SMOKE", 1, { len: 22, r0: 6, rmax: 10, freq: 0.6, flow: 0.6, dens: 1.2, attack: 3.5, decay: 6 }); parent.add(f); P.column.push({ f, sz }); }
  // s: firing level 0..1 (mean thrust share of the motors on the deck); gone: 0..1, taken apart (the exhaust is in the air then)
  P.update = (s, gone = 0) => {
    const on = s * (1 - gone);
    P.fire.userData.target = on; for (const f of P.ducts) f.userData.target = on;
    if (P.splash) P.splash.userData.target = on * 0.55;
    for (const b of P.billows) {
      const L = b.f.userData.level, u = b.f.material.uniforms;
      b.f.userData.target = on;
      b.f.position.set(b.x, gy + (10 + b.i * 3) * 0.62 + L * (1.5 + b.i * 2.2), b.sz * (open + 2 + b.i * 4.5 + L * reach * (0.4 + b.i * 0.3)));   // a cloud spans [y − len, y]: sunk 40 % into the apron it reads as a dome
      u.uR0.value = Math.min(u.uRMax.value * 0.92, 4 + L * (4 + b.i * 2.5));
    }
    for (const r of P.ring) {
      const L = r.f.userData.level, d = o.ring + 2 + L * 5;
      r.f.userData.target = on * 0.9;
      r.f.position.set(Math.cos(r.a) * d, gy + 2.6, Math.sin(r.a) * d);
      r.f.material.uniforms.uR0.value = Math.min(6.4, 3 + L * 3.5);
    }
    for (const c of P.column) {
      const L = c.f.userData.level;
      c.f.userData.target = on * 0.85;
      c.f.position.set(0, gy + 18 + L * 12, c.sz * (open + 6 + L * reach * 0.5));
      c.f.material.uniforms.uR0.value = Math.min(9.2, 4 + L * 5);
    }
  };
  return P;
}
