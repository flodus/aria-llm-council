// ═══════════════════════════════════════════════════════════════════════════
//  WorldEngine.js  —  Moteur de génération du monde ARIA
//
//  Pipeline :
//  1. Grille hexagonale brute (pointy-top, offset impair)
//  2. Heightmap FBM (Fractal Brownian Motion, 4 octaves, PRNG seedé)
//  3. Attribution biome (heightmap + latitude simulée)
//  4. Détection continents/îles/îlots (flood-fill)
//  5. Précalcul des enveloppes de continents (pour clip SVG)
//  6. Placement pays (BFS seedé, cohérence terrain)
//
//  Export principal : generateWorld(seed) → WorldData
//  Export placement : placeCountries(world, countries) → WorldData enrichi
//
//  Zéro dépendance React.
// ═══════════════════════════════════════════════════════════════════════════

// ── Dimensions ───────────────────────────────────────────────────────────
export const MAP_W  = 1400;
export const MAP_H  = 800;
export const HEX_R  = 11;
export const HEX_W  = HEX_R * 2;
export const HEX_H  = HEX_R * Math.sqrt(3);   // ≈ 19.05

// ── Biomes ───────────────────────────────────────────────────────────────
export const BIOME = {
    OCEAN_DEEP:  'ocean_deep',
    OCEAN_SHELF: 'ocean_shelf',
    COASTAL:     'coastal',
    LAND:        'land',
    HIGHLAND:    'highland',
    MOUNTAIN:    'mountain',
    POLAR:       'polar',
    TUNDRA:      'tundra',
    DESERT:      'desert',
};

// Biomes considérés comme "terre" pour la logique de pays
export const LAND_BIOMES = new Set([
    BIOME.COASTAL, BIOME.LAND, BIOME.HIGHLAND,
    BIOME.MOUNTAIN, BIOME.POLAR, BIOME.TUNDRA, BIOME.DESERT,
]);
// Biomes utilisables pour un pays (pas la haute mer ni les pics vierges)
export const HABITABLE_BIOMES = new Set([
    BIOME.COASTAL, BIOME.LAND, BIOME.HIGHLAND, BIOME.TUNDRA, BIOME.DESERT,
]);

// ── Palette couleurs (mauve cyber sombre) ─────────────────────────────────
// Couleurs — palette cyber mauve sombre : mer foncée, terres claires, fort contraste
export const BIOME_COLOR = {
    [BIOME.OCEAN_DEEP]:  '#060E1C',  // bleu nuit profond (mer loin)
    [BIOME.OCEAN_SHELF]: '#0D1E34',  // bleu marine ZEE (zone économique)
    [BIOME.COASTAL]:     '#1A2B40',  // transition — géré par clipPath
    [BIOME.LAND]:        '#2A3650',  // ardoise bleu-violet (terre plaine)
    [BIOME.HIGHLAND]:    '#36405E',  // bleu-violet moyen (altitude)
    [BIOME.MOUNTAIN]:    '#444F6E',  // violet-bleu clair (sommet)
    [BIOME.POLAR]:       '#1C2C3E',  // bleu glacé
    [BIOME.TUNDRA]:      '#263040',  // bleu-vert froid
    [BIOME.DESERT]:      '#332840',  // mauve chaud (tropiques)
};

// ── PRNG (Mulberry32) ─────────────────────────────────────────────────────
function mulberry32(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
        s += 0x6D2B79F5;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function strToSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}

// ── Hexagone : géométrie ─────────────────────────────────────────────────
export function hexCenter(col, row) {
    const x = col * HEX_W * 0.75 + HEX_R;
    const y = row * HEX_H + (col % 2 === 1 ? HEX_H / 2 : 0) + HEX_H / 2;
    return { x, y };
}

export function hexPoints(cx, cy) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6; // pointy-top
        pts.push([cx + HEX_R * Math.cos(a), cy + HEX_R * Math.sin(a)]);
    }
    return pts;
}

export function hexPointsStr(cx, cy) {
    return hexPoints(cx, cy).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
}

// 6 voisins (grille offset colonne impaire vers le bas)
export function hexNeighbors(col, row) {
    const odd = col % 2 === 1;
    return [
        [col - 1, odd ? row     : row - 1],
        [col - 1, odd ? row + 1 : row    ],
        [col,     row - 1],
        [col,     row + 1],
        [col + 1, odd ? row     : row - 1],
        [col + 1, odd ? row + 1 : row    ],
    ];
}

// ── Étape 1 : Grille brute ─────────────────────────────────────────────────
function buildGrid() {
    const grid = new Map();
    const colMax = Math.ceil(MAP_W / (HEX_W * 0.75)) + 2;
    const rowMax = Math.ceil(MAP_H / HEX_H) + 2;

    for (let col = 0; col < colMax; col++) {
        for (let row = 0; row < rowMax; row++) {
            const { x, y } = hexCenter(col, row);
            if (x + HEX_R < 0 || x - HEX_R > MAP_W) continue;
            if (y + HEX_R < 0 || y - HEX_R > MAP_H) continue;
            const key = `${col},${row}`;
            grid.set(key, {
                key, col, row,
                x: +x.toFixed(2), y: +y.toFixed(2),
                     biome: null, continentId: null, countryId: null, height: 0,
            });
        }
    }
    return grid;
}

// ── Étape 2 : Heightmap FBM ──────────────────────────────────────────────
// Bruit de valeur avec interpolation bilinéaire (pas de lib externe)

function smoothstep(t) { return t * t * (3 - 2 * t); }

function valueNoise2D(x, y, perm) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = smoothstep(fx), uy = smoothstep(fy);

    const h = (a, b) => perm[(perm[a & 255] + b) & 255] / 255;
    return (
        h(ix,   iy  ) * (1 - ux) * (1 - uy) +
        h(ix+1, iy  ) * ux       * (1 - uy) +
        h(ix,   iy+1) * (1 - ux) * uy       +
        h(ix+1, iy+1) * ux       * uy
    );
}

function buildPermutation(rand) {
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    return p;
}

function fbm(x, y, perm, octaves = 4) {
    let val = 0, amp = 0.5, freq = 1, max = 0;
    for (let o = 0; o < octaves; o++) {
        val += valueNoise2D(x * freq, y * freq, perm) * amp;
        max += amp;
        amp  *= 0.5;
        freq *= 2.1;
    }
    return val / max;
}

function applyHeightmap(grid, rand) {
    const perm = buildPermutation(rand);
    // Décalages pour casser la symétrie
    const ox = rand() * 100, oy = rand() * 100;
    // Scale : 1 unité = ~200px → environ 7 "tuiles" sur la largeur
    const SCALE_X = 6.5 / MAP_W;
    const SCALE_Y = 5.0 / MAP_H;

    // Passe 1 : calcul raw
    let min = 1, max = 0;
    const raw = new Map();
    for (const [key, h] of grid) {
        const v = fbm(h.x * SCALE_X + ox, h.y * SCALE_Y + oy, perm, 5);
        raw.set(key, v);
        if (v < min) min = v;
        if (v > max) max = v;
    }
    // Passe 2 : normalisation + application
    for (const [key, h] of grid) {
        const v = (raw.get(key) - min) / (max - min);
        // Gradient radial : baisser les bords pour créer des océans périphériques
        const dx = (h.x / MAP_W - 0.5) * 2;
        const dy = (h.y / MAP_H - 0.5) * 2;
        const edge = Math.max(0, (Math.abs(dx) ** 2.2 + Math.abs(dy) ** 2.2) * 0.45);
        h.height = Math.max(0, Math.min(1, v - edge));
    }
}

// ── Étape 3 : Attribution des biomes ─────────────────────────────────────
function applyBiomes(grid) {
    for (const h of grid.values()) {
        const lat = h.y / MAP_H; // 0 = nord, 1 = sud
        const polar = lat < 0.10 || lat > 0.90;
        const subpolar = lat < 0.16 || lat > 0.84;
        const tropical = lat > 0.28 && lat < 0.72;
        const v = h.height;

        if      (v < 0.36) h.biome = BIOME.OCEAN_DEEP;
        else if (v < 0.43) h.biome = BIOME.OCEAN_SHELF;
        else if (v < 0.50) h.biome = BIOME.COASTAL;
        else if (v < 0.68) {
            if      (polar)    h.biome = BIOME.POLAR;
            else if (subpolar) h.biome = BIOME.TUNDRA;
            else if (tropical) h.biome = BIOME.DESERT;
            else               h.biome = BIOME.LAND;
        }
        else if (v < 0.82) {
            if (polar || subpolar) h.biome = BIOME.POLAR;
            else                   h.biome = BIOME.HIGHLAND;
        }
        else {
            h.biome = BIOME.MOUNTAIN;
        }
    }
}

// ── Étape 4 : Détection des masses terrestres (flood-fill) ───────────────
function detectLandmasses(grid) {
    const visited = new Set();
    const masses  = [];

    for (const [key, h] of grid) {
        if (!LAND_BIOMES.has(h.biome)) continue;
        if (visited.has(key)) continue;

        // BFS flood-fill
        const queue   = [key];
        const members = [];
        visited.add(key);

        while (queue.length) {
            const cur  = queue.shift();
            const curH = grid.get(cur);
            if (!curH) continue;
            members.push(cur);

            for (const [nc, nr] of hexNeighbors(curH.col, curH.row)) {
                const nk = `${nc},${nr}`;
                if (visited.has(nk)) continue;
                const nh = grid.get(nk);
                if (!nh || !LAND_BIOMES.has(nh.biome)) continue;
                visited.add(nk);
                queue.push(nk);
            }
        }

        const size = members.length;
        const type = size > 80 ? 'continent' : size > 12 ? 'island' : 'islet';
        const id   = `${type[0]}${masses.length}`;

        // Calculer le centroïde
        let cx = 0, cy = 0;
        for (const k of members) { const h = grid.get(k); cx += h.x; cy += h.y; }
        cx /= size; cy /= size;

        masses.push({ id, type, size, members, cx, cy });
        members.forEach(k => { const h = grid.get(k); h.continentId = id; });
    }

    return masses;
}

// ── Étape 5 : Enveloppe convexe de chaque masse terrestre (pour clipPath) ─
// Algorithme de Graham scan simplifié (convex hull)
function convexHull(points) {
    if (points.length < 3) return points;
    points = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (O, A, B) => (A[0]-O[0])*(B[1]-O[1]) - (A[1]-O[1])*(B[0]-O[0]);
    const lower = [], upper = [];
    for (const p of points) {
        while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0)
            lower.pop();
        lower.push(p);
    }
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0)
            upper.pop();
        upper.push(p);
    }
    upper.pop(); lower.pop();
    return lower.concat(upper);
}

function buildLandmassHulls(grid, masses) {
    const hulls = new Map(); // massId → points SVG string

    for (const mass of masses) {
        // Prendre les sommets de tous les hex de la masse → hull
        const allPts = [];
        for (const key of mass.members) {
            const h = grid.get(key);
            if (!h) continue;
            hexPoints(h.x, h.y).forEach(p => allPts.push(p));
        }
        const hull = convexHull(allPts);
        hulls.set(mass.id, hull.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '));
    }

    return hulls;
}

// ── Bordure extérieure d'un cluster → SVG path ────────────────────────────
export function clusterOutlinePath(hexKeys, grid) {
    const keySet = new Set(hexKeys);
    const edges  = [];

    for (const key of hexKeys) {
        const h = grid.get(key);
        if (!h) continue;
        const pts  = hexPoints(h.x, h.y);
        const nbrs = hexNeighbors(h.col, h.row);

        nbrs.forEach(([nc, nr], dir) => {
            if (keySet.has(`${nc},${nr}`)) return;
            const s1 = dir, s2 = (dir + 1) % 6;
            edges.push({ x1: pts[s1][0], y1: pts[s1][1], x2: pts[s2][0], y2: pts[s2][1] });
        });
    }

    if (!edges.length) return '';

    const EPS   = 0.5;
    const snap  = (a, b) => Math.abs(a - b) < EPS;
    const rem   = [...edges];
    const chains = [];

    while (rem.length) {
        const chain = [rem.shift()];
        let changed = true;
        while (changed) {
            changed = false;
            const { x2: lx, y2: ly } = chain[chain.length - 1];
            for (let i = 0; i < rem.length; i++) {
                const e = rem[i];
                if (snap(e.x1, lx) && snap(e.y1, ly)) {
                    chain.push(rem.splice(i, 1)[0]); changed = true; break;
                }
                if (snap(e.x2, lx) && snap(e.y2, ly)) {
                    rem.splice(i, 1);
                    chain.push({ x1: e.x2, y1: e.y2, x2: e.x1, y2: e.y1 });
                    changed = true; break;
                }
            }
        }
        chains.push(chain);
    }

    return chains.map(ch =>
    ch.map((e, i) => i === 0
    ? `M${e.x1.toFixed(1)},${e.y1.toFixed(1)} L${e.x2.toFixed(1)},${e.y2.toFixed(1)}`
    : `L${e.x2.toFixed(1)},${e.y2.toFixed(1)}`
    ).join(' ') + ' Z'
    ).join(' ');
}

// ── Centroïde et bbox d'un cluster ────────────────────────────────────────
export function clusterCenter(hexKeys, grid) {
    let sx = 0, sy = 0, n = 0;
    for (const k of hexKeys) {
        const h = grid.get(k);
        if (h) { sx += h.x; sy += h.y; n++; }
    }
    return n ? { x: sx / n, y: sy / n } : { x: MAP_W / 2, y: MAP_H / 2 };
}

// ── Population → nombre d'hexagones ──────────────────────────────────────
export function hexCountFromPop(population) {
    const log = Math.log10(Math.max(population, 300_000));
    return Math.max(5, Math.min(140, Math.round((log - 5.47) * 45 + 6)));
}

// ── Étape 6 : Placement d'un pays dans le monde ───────────────────────────
// terrain → préférences biome
const TERRAIN_PREFS = {
    coastal:     [BIOME.COASTAL, BIOME.LAND],
    inland:      [BIOME.LAND,    BIOME.HIGHLAND],
    highland:    [BIOME.HIGHLAND,BIOME.LAND],
    mountain:    [BIOME.MOUNTAIN,BIOME.HIGHLAND],
    island:      [BIOME.COASTAL, BIOME.LAND],
    archipelago: [BIOME.COASTAL, BIOME.LAND],
    desert:      [BIOME.DESERT,  BIOME.LAND],
    tundra:      [BIOME.TUNDRA,  BIOME.POLAR],
    polar:       [BIOME.POLAR,   BIOME.TUNDRA],
};

const MAX_SHELF_HEX = 2; // max d'hex OCEAN_SHELF dans un pays

export function placeCountry({ world, country, occupiedKeys }) {
    const { grid, masses } = world;
    const seed   = strToSeed(country.id + country.nom);
    const rand   = mulberry32(seed);
    const terrain = country.terrain || 'coastal';
    const prefs   = TERRAIN_PREFS[terrain] || TERRAIN_PREFS.inland;
    const hexCount = hexCountFromPop(country.population || 5_000_000);

    // Filtrer les masses adaptées au terrain
    const islandTerrain = terrain === 'island' || terrain === 'archipelago';
    const targetType    = islandTerrain ? 'island' : 'continent';
    let   targetMasses  = masses.filter(m => m.type === targetType && m.size > hexCount * 0.7);
    if   (!targetMasses.length) targetMasses = masses.filter(m => m.type !== 'islet');
    if   (!targetMasses.length) return null;

    // Choisir une masse (seed-déterministe)
    const mass = targetMasses[Math.floor(rand() * targetMasses.length)];

    // Candidats : hex de cette masse, non occupés, biome préféré
    let candidates = mass.members
    .filter(k => !occupiedKeys.has(k))
    .filter(k => {
        const h = grid.get(k);
        return h && prefs.includes(h.biome);
    });

    // Fallback : tout hex non occupé de la masse
    if (candidates.length < hexCount) {
        candidates = mass.members.filter(k => !occupiedKeys.has(k));
    }
    if (!candidates.length) return null;

    // Point de spawn : hex candidat le plus proche du centroïde de la masse
    // + dispersion seed-déterministe pour que plusieurs pays du même terrain
    //   ne commencent pas tous au même endroit
    const jitterX = (rand() - 0.5) * mass.cx * 0.4;
    const jitterY = (rand() - 0.5) * mass.cy * 0.4;
    const tx = mass.cx + jitterX, ty = mass.cy + jitterY;

    candidates.sort((a, b) => {
        const ha = grid.get(a), hb = grid.get(b);
        return ((ha.x-tx)**2+(ha.y-ty)**2) - ((hb.x-tx)**2+(hb.y-ty)**2);
    });
    const startKey = candidates[0];

    // BFS expansif (biaisé vers biomes préférés)
    const cluster  = new Set([startKey]);
    const frontier = [startKey];
    let   shelfCount = 0;

    while (cluster.size < hexCount && frontier.length > 0) {
        const pick = Math.floor(rand() * Math.min(frontier.length, 6));
        const cur  = frontier.splice(pick, 1)[0];
        const curH = grid.get(cur);
        if (!curH) continue;

        const nbrs = hexNeighbors(curH.col, curH.row);
        for (let i = nbrs.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [nbrs[i], nbrs[j]] = [nbrs[j], nbrs[i]];
        }

        for (const [nc, nr] of nbrs) {
            const nk = `${nc},${nr}`;
            if (cluster.has(nk) || occupiedKeys.has(nk)) continue;
            const nh = grid.get(nk);
            if (!nh || nh.continentId !== mass.id) continue;
            if (!HABITABLE_BIOMES.has(nh.biome)) continue;

            // Limite ZEE : max 2 hex OCEAN_SHELF
            if (nh.biome === BIOME.OCEAN_SHELF) {
                if (shelfCount >= MAX_SHELF_HEX) continue;
                shelfCount++;
            }

            cluster.add(nk);
            frontier.push(nk);
            if (cluster.size >= hexCount) break;
        }
    }

    const hexKeys = [...cluster];
    hexKeys.forEach(k => { const h = grid.get(k); h.countryId = country.id; });

    const { x: cx, y: cy } = clusterCenter(hexKeys, grid);
    const outline           = clusterOutlinePath(hexKeys, grid);
    const radius            = Math.sqrt(hexKeys.length) * HEX_R * 2.6;

    return {
        id:     country.id,
        hexKeys,
        outline,
        cx, cy,
        radius,
        continentId: mass.id,
    };
}

// ── Export principal : generateWorld(seed) ────────────────────────────────
export function generateWorld(seed = 42) {
    const rand = mulberry32(typeof seed === 'string' ? strToSeed(seed) : seed);

    const grid    = buildGrid();
    applyHeightmap(grid, rand);
    applyBiomes(grid);
    const masses  = detectLandmasses(grid);
    const hulls   = buildLandmassHulls(grid, masses);

    return {
        seed,
        grid,           // Map key→hex
        masses,         // [{ id, type, size, members, cx, cy }]
        hulls,          // Map massId → SVG points string (convex hull)
        placements: [], // rempli par placeCountries()
    };
}

// ── placeCountries(world, countries) ─────────────────────────────────────
export function placeCountries(world, countries) {
    const occupiedKeys = new Set();
    const placements   = [];

    for (const country of countries) {
        const placement = placeCountry({ world, country, occupiedKeys });
        if (placement) {
            placement.hexKeys.forEach(k => occupiedKeys.add(k));
            placements.push(placement);
        }
    }

    world.placements = placements;
    return world;
}
