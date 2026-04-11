// src/features/world/services/svgWorldEngine.js
// Génération du monde SVG (organique, chemins Bézier)
// NB : distinct de WorldEngine.js (hexagonal) — utilisé pour spawn et formes pays

import { seededRand, strToSeed, randRange, randInt, randBool } from '../../../shared/utils/prng';

export { seededRand, strToSeed, randRange, randInt, randBool };

/**
 * Génère un chemin SVG organique (polygone irrégulier via points polaires bruités).
 */
export function genOrganicPath(cx, cy, size, seed, points = 10, noise = 0.32) {
  const rand  = seededRand(seed);
  const pts   = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r     = size * (1 + (rand() * 2 - 1) * noise);
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  const d = pts.map((p, i) => {
    const next = pts[(i + 1) % pts.length];
    const mx   = (p[0] + next[0]) / 2;
    const my   = (p[1] + next[1]) / 2;
    return `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)} Q ${mx.toFixed(1)},${my.toFixed(1)}`;
  }).join(' ') + ' Z';
  return d;
}

/**
 * Génère les masses terrestres, îles, fleuves, montagnes et zones de spawn.
 * Renvoie { seed, W, H, continents, islands, rivers, mountains, spawnZones }.
 */
export function generateWorld(seed, W = 1400, H = 800) {
  const rand = seededRand(seed);

  const numContinents = randInt(rand, 2, 4);
  const continents    = [];
  const margin        = 120;
  const placed        = [];
  const tooClose      = (cx, cy, minDist) =>
    placed.some(p => Math.hypot(p.cx - cx, p.cy - cy) < minDist);

  for (let i = 0; i < numContinents; i++) {
    let cx, cy, attempts = 0;
    const size = randRange(rand, 120, 220);
    do {
      cx = randRange(rand, margin + size, W - margin - size);
      cy = randRange(rand, margin + size, H - margin - size);
      attempts++;
    } while (tooClose(cx, cy, size * 2.2) && attempts < 40);

    placed.push({ cx, cy });
    continents.push({
      id:   `continent_${i}`,
      cx, cy, size,
      seed: seed + i * 1000,
      path: genOrganicPath(cx, cy, size, seed + i * 1000, 14, 0.38),
    });
  }

  const numIslands = randInt(rand, 3, 7);
  const islands    = [];
  for (let i = 0; i < numIslands; i++) {
    const size = randRange(rand, 30, 70);
    let cx, cy, attempts = 0;
    do {
      cx = randRange(rand, margin, W - margin);
      cy = randRange(rand, margin, H - margin);
      attempts++;
    } while (tooClose(cx, cy, size * 3) && attempts < 30);

    placed.push({ cx, cy });
    islands.push({
      id:   `island_${i}`,
      cx, cy, size,
      seed: seed + 5000 + i * 300,
      path: genOrganicPath(cx, cy, size, seed + 5000 + i * 300, 9, 0.28),
    });
  }

  const rivers = continents.map((c, i) => {
    const rand2  = seededRand(seed + 9000 + i);
    const startX = c.cx + randRange(rand2, -c.size * 0.4, c.size * 0.4);
    const startY = c.cy - c.size * 0.5;
    const endX   = c.cx + randRange(rand2, -c.size * 0.6, c.size * 0.6);
    const endY   = c.cy + c.size * 0.8;
    const cp1X   = startX + randRange(rand2, -60, 60);
    const cp1Y   = startY + (endY - startY) * 0.33;
    const cp2X   = endX   + randRange(rand2, -60, 60);
    const cp2Y   = startY + (endY - startY) * 0.66;
    return {
      id: `river_${i}`,
      d: `M ${startX.toFixed(1)},${startY.toFixed(1)} C ${cp1X.toFixed(1)},${cp1Y.toFixed(1)} ${cp2X.toFixed(1)},${cp2Y.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`,
    };
  });

  const mountains = [];
  continents.forEach((c, ci) => {
    const rand3    = seededRand(seed + 12000 + ci);
    const nClusters = randInt(rand3, 1, 2);
    for (let k = 0; k < nClusters; k++) {
      const bx = c.cx + randRange(rand3, -c.size * 0.5, c.size * 0.5);
      const by = c.cy + randRange(rand3, -c.size * 0.5, c.size * 0.3);
      const nPeaks = randInt(rand3, 3, 6);
      const peaks  = [];
      for (let p = 0; p < nPeaks; p++) {
        const px = bx + randRange(rand3, -30, 30);
        const py = by + randRange(rand3, -20, 20);
        const h  = randRange(rand3, 14, 28);
        const w  = randRange(rand3, 10, 20);
        peaks.push({
          body:   `M ${px},${py + h} L ${px - w},${py + h} L ${px},${py} Z`,
          snow:   `M ${px},${py} L ${px - w * 0.35},${py + h * 0.35} L ${px + w * 0.35},${py + h * 0.35} Z`,
          shadow: `M ${px},${py + h} L ${px + w * 0.6},${py + h} L ${px},${py + h * 0.5} Z`,
        });
      }
      mountains.push({ id: `mountain_${ci}_${k}`, peaks });
    }
  });

  const spawnZones = [
    ...continents.map(c => ({ id: c.id, cx: c.cx, cy: c.cy, type: 'continent', size: c.size })),
    ...islands.map(isl => ({ id: isl.id, cx: isl.cx, cy: isl.cy, type: 'island', size: isl.size })),
  ];

  return { seed, W, H, continents, islands, rivers, mountains, spawnZones };
}

/**
 * Trouve un point de spawn libre sur les masses terrestres.
 * Évite les positions déjà occupées par d'autres pays.
 */
export function findSpawnPoint(worldData, existingCountries, preferredType = null) {
  const { spawnZones } = worldData;
  const occupied = existingCountries.map(c => ({ cx: c.cx, cy: c.cy }));

  let candidates = preferredType
    ? spawnZones.filter(z => z.type === preferredType)
    : [...spawnZones];
  if (candidates.length === 0) candidates = [...spawnZones];

  candidates.sort((a, b) => {
    const distA = occupied.length
      ? Math.min(...occupied.map(o => Math.hypot(o.cx - a.cx, o.cy - a.cy)))
      : 9999;
    const distB = occupied.length
      ? Math.min(...occupied.map(o => Math.hypot(o.cx - b.cx, o.cy - b.cy)))
      : 9999;
    return distB - distA;
  });

  const zone   = candidates[0];
  const rand   = seededRand(Date.now() % 99999);
  const jitter = zone.size * 0.3;
  return {
    cx: zone.cx + randRange(rand, -jitter, jitter),
    cy: zone.cy + randRange(rand, -jitter, jitter),
    zoneId:   zone.id,
    zoneType: zone.type,
  };
}
