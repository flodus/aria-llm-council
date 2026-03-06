// ═══════════════════════════════════════════════════════════════════════════
//  ariaHexWorld.js  —  Moteur hexagonal ARIA
//
//  Responsabilités :
//  ① Définir les 7 masses terrestres (polygones simplifiés en espace 1400×800)
//  ② Construire la grille hexagonale (pointy-top, offset impair)
//  ③ Tagger chaque hex avec son continent (point-in-polygon)
//  ④ Générer un pays = cluster BFS seedé d'hexagones contigus
//  ⑤ Calculer le tracé de la bordure extérieure d'un cluster (chemin SVG)
//  ⑥ Utilitaires : PRNG, voisins, centre, topologie → nbHex
//
//  Aucun import React — utilisable dans des workers si besoin.
// ═══════════════════════════════════════════════════════════════════════════

// ── Dimensions ───────────────────────────────────────────────────────────
export const MAP_W = 1400;
export const MAP_H = 800;
export const HEX_R = 13;                          // rayon hex (centre → sommet)
export const HEX_W = HEX_R * 2;                  // 26
export const HEX_H = HEX_R * Math.sqrt(3);       // ≈ 22.5

// ── PRNG Mulberry32 ───────────────────────────────────────────────────────
export function seededRand(seed) {
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

// ── Continents — polygones en coordonnées SVG 1400×800 ───────────────────
// Projection Mercator très schématique — contours géographiquement reconnaissables
// mais simplifiés à ~20 points pour rester légers.
export const CONTINENTS = [
    {
        id: 'europe',
        label: 'Europe',
        stroke: 'rgba(100,120,200,0.22)',
        // Centre de spawn (coordonnées pixel)
        spawnXY: [560, 155],
        poly: [
            [468,78],[505,60],[548,55],[600,62],[642,75],[672,88],
            [694,115],[700,140],[718,155],[726,175],[708,195],[680,208],
            [654,222],[624,238],[594,248],[560,255],[532,258],[504,252],
            [480,260],[458,248],[440,232],[436,212],[446,190],[454,168],
            [446,148],[452,126],[462,104],
        ],
    },
    {
        id: 'afrique',
        label: 'Afrique',
        stroke: 'rgba(180,130,70,0.20)',
        spawnXY: [548, 390],
        poly: [
            [448,262],[478,256],[510,260],[544,258],[572,250],[600,250],
            [628,242],[645,262],[654,292],[660,326],[658,360],[648,395],
            [636,430],[618,462],[600,490],[578,512],[556,528],[534,532],
            [512,524],[496,506],[480,482],[468,456],[458,426],[448,392],
            [440,356],[436,320],[438,286],[444,270],
        ],
    },
    {
        id: 'asie',
        label: 'Asie',
        stroke: 'rgba(100,160,100,0.20)',
        spawnXY: [870, 150],
        poly: [
            [718,60],[775,48],[845,44],[916,48],[982,56],[1042,68],
            [1090,85],[1118,112],[1130,148],[1120,178],[1098,204],
            [1072,228],[1040,248],[1004,264],[968,274],[930,278],
            [895,272],[862,280],[830,280],[798,272],[772,260],
            [748,242],[730,220],[718,196],[714,170],[718,142],
            [718,112],[718,84],
        ],
    },
    {
        id: 'asie_se',
        label: 'Asie du Sud-Est',
        stroke: 'rgba(100,160,100,0.16)',
        spawnXY: [960, 320],
        poly: [
            [862,280],[895,272],[930,278],[968,274],[990,294],[990,320],
            [975,346],[952,366],[924,378],[896,382],[868,374],[848,356],
            [838,332],[842,306],[852,288],
        ],
    },
    {
        id: 'ameriques_n',
        label: 'Amérique du Nord',
        stroke: 'rgba(80,140,160,0.20)',
        spawnXY: [228, 160],
        poly: [
            [96,72],[148,60],[210,54],[272,58],[326,70],[368,88],
            [390,118],[396,152],[390,182],[372,208],[346,228],
            [316,244],[284,254],[252,258],[220,252],[192,240],
            [166,222],[144,200],[124,176],[108,150],[96,122],[92,96],
        ],
    },
    {
        id: 'ameriques_s',
        label: 'Amérique du Sud',
        stroke: 'rgba(100,160,90,0.18)',
        spawnXY: [270, 400],
        poly: [
            [208,274],[240,268],[272,270],[304,262],[334,250],
            [358,258],[376,280],[382,308],[380,340],[372,372],
            [358,402],[342,432],[322,458],[300,478],[276,494],
            [252,500],[228,494],[208,476],[196,452],[190,424],
            [192,394],[198,362],[204,330],[206,298],[208,276],
        ],
    },
    {
        id: 'oceanie',
        label: 'Océanie',
        stroke: 'rgba(80,150,170,0.18)',
        spawnXY: [1010, 458],
        poly: [
            [894,404],[934,394],[974,396],[1010,406],[1044,422],
            [1060,446],[1056,470],[1034,484],[1000,490],[964,484],
            [930,470],[906,450],[894,428],
        ],
    },
];

// Map id → continent (lookup rapide)
export const CONTINENT_BY_ID = Object.fromEntries(CONTINENTS.map(c => [c.id, c]));

// ── Topologie → continents préférés ──────────────────────────────────────
const TOPO_CONTINENTS = {
    coastal:     ['europe','afrique','asie','ameriques_n','ameriques_s'],
    inland:      ['europe','asie','afrique','ameriques_n','ameriques_s'],
    highland:    ['asie','ameriques_s','europe','afrique','ameriques_n'],
    island:      ['oceanie','asie_se'],
    archipelago: ['oceanie','asie_se'],
    desert:      ['afrique','asie'],
    tundra:      ['ameriques_n','asie','europe'],
};
export function pickContinent(terrain, rand) {
    const opts = TOPO_CONTINENTS[terrain] || TOPO_CONTINENTS.inland;
    return opts[Math.floor(rand() * opts.length)];
}

// ── Point-in-polygon (ray casting) ───────────────────────────────────────
export function pointInPolygon(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
            inside = !inside;
    }
    return inside;
}

// ── Coordonnées hexagonales (grille offset, colonne impaire décalée) ──────
export function hexCenter(col, row) {
    const x = col * HEX_W * 0.75 + HEX_R;
    const y = row * HEX_H + (col % 2 === 1 ? HEX_H / 2 : 0) + HEX_H / 2;
    return { x, y };
}

export function hexPoints(cx, cy) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i - 30); // pointy-top
        pts.push([cx + HEX_R * Math.cos(a), cy + HEX_R * Math.sin(a)]);
    }
    return pts;
}

export function hexPointsStr(cx, cy) {
    return hexPoints(cx, cy).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

// 6 voisins en grille offset (colonne impaire décalée vers le bas)
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

// ── Construction de la grille monde (lazy, mémoïsée) ─────────────────────
let _worldGrid = null;

export function buildWorldGrid() {
    if (_worldGrid) return _worldGrid;

    const grid = new Map(); // "col,row" → { col, row, x, y, continentId }
    const colMax = Math.ceil(MAP_W / (HEX_W * 0.75)) + 2;
    const rowMax = Math.ceil(MAP_H / HEX_H) + 2;

    for (let col = 0; col < colMax; col++) {
        for (let row = 0; row < rowMax; row++) {
            const { x, y } = hexCenter(col, row);
            if (x < -HEX_R || x > MAP_W + HEX_R) continue;
            if (y < -HEX_R || y > MAP_H + HEX_R) continue;

            const cont = CONTINENTS.find(c => pointInPolygon(x, y, c.poly));
            if (!cont) continue;

            grid.set(`${col},${row}`, { col, row, x, y, continentId: cont.id });
        }
    }

    _worldGrid = grid;
    return grid;
}

// ── Hex le plus proche d'un point (dans un continent donné) ──────────────
export function nearestHexInContinent(px, py, continentId) {
    const grid = buildWorldGrid();
    let best = null, bestDist = Infinity;
    for (const [key, h] of grid) {
        if (h.continentId !== continentId) continue;
        const d = (h.x - px) ** 2 + (h.y - py) ** 2;
        if (d < bestDist) { bestDist = d; best = key; }
    }
    return best;
}

// ── Génération d'un cluster pays (BFS seedé) ─────────────────────────────
export function generateCountryHexes({ hexCount, continentId, seed, occupiedKeys, spawnKey }) {
    const grid = buildWorldGrid();
    const rand = seededRand(seed);

    // Hex disponibles dans ce continent
    const available = [];
    for (const [key, h] of grid) {
        if (h.continentId === continentId && !occupiedKeys.has(key)) available.push(key);
    }
    if (!available.length) return [];

    // Point de départ : spawnKey → ou nearest au centre continent
    let startKey = spawnKey && grid.has(spawnKey) && !occupiedKeys.has(spawnKey)
    ? spawnKey
    : available[Math.floor(rand() * available.length)];

    const cluster  = new Set([startKey]);
    const frontier = [startKey];

    while (cluster.size < hexCount && frontier.length > 0) {
        // Tirage légèrement biaisé vers les hex récents (forme organique)
        const pick = Math.floor(rand() * Math.min(frontier.length, 5));
        const cur  = frontier.splice(pick, 1)[0];
        const h    = grid.get(cur);
        if (!h) continue;

        const neighbors = hexNeighbors(h.col, h.row);
        // Mélange Fisher-Yates
        for (let i = neighbors.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
        }

        for (const [nc, nr] of neighbors) {
            const nk = `${nc},${nr}`;
            if (cluster.has(nk) || occupiedKeys.has(nk)) continue;
            const nh = grid.get(nk);
            if (!nh || nh.continentId !== continentId) continue;
            cluster.add(nk);
            frontier.push(nk);
            if (cluster.size >= hexCount) break;
        }
    }

    return [...cluster];
}

// ── Bordure extérieure d'un cluster → SVG path ───────────────────────────
// Algorithme : edges externes = edges entre un hex du cluster et un hex hors cluster
// Les 6 arêtes d'un hexagone pointy-top correspondent aux 6 directions voisines.
// Direction d → arête entre sommet d et sommet (d+1)%6

export function clusterOutlinePath(hexKeys) {
    const keySet = new Set(hexKeys);
    const grid   = buildWorldGrid();

    // Toutes les edges externes : { x1,y1,x2,y2 }
    const edges = [];

    for (const key of hexKeys) {
        const h = grid.get(key);
        if (!h) continue;
        const pts      = hexPoints(h.x, h.y);
        const neighbors = hexNeighbors(h.col, h.row);

        neighbors.forEach(([nc, nr], dir) => {
            if (keySet.has(`${nc},${nr}`)) return; // edge interne
            const s1 = dir;
            const s2 = (dir + 1) % 6;
            edges.push({ x1: pts[s1][0], y1: pts[s1][1], x2: pts[s2][0], y2: pts[s2][1] });
        });
    }

    if (!edges.length) return '';

    // Chaîner les edges en boucle(s) fermée(s)
    const EPS  = 0.4;
    const snap = (a, b) => Math.abs(a - b) < EPS;
    const rem  = [...edges];
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
                    chain.push({ x1: e.x2, y1: e.y2, x2: e.x1, y2: e.y1 }); changed = true; break;
                }
            }
        }
        chains.push(chain);
    }

    return chains.map(ch => {
        const pts = ch.map((e, i) =>
        i === 0
        ? `M${e.x1.toFixed(1)},${e.y1.toFixed(1)} L${e.x2.toFixed(1)},${e.y2.toFixed(1)}`
        : `L${e.x2.toFixed(1)},${e.y2.toFixed(1)}`
        ).join(' ');
        return pts + ' Z';
    }).join(' ');
}

// ── Population → nombre d'hexagones (log-linéaire) ───────────────────────
// 500k  → ~5 hex     10M → ~22 hex
// 50M   → ~38 hex    200M → ~55 hex     1Md → ~85 hex
export function hexCountFromPop(population) {
    const base = Math.log10(Math.max(population, 200_000));
    return Math.max(4, Math.min(120, Math.round((base - 5.3) * 40 + 5)));
}

// Centre de masse d'un cluster
export function clusterCenter(hexKeys) {
    const grid = buildWorldGrid();
    let sx = 0, sy = 0, n = 0;
    for (const k of hexKeys) {
        const h = grid.get(k);
        if (h) { sx += h.x; sy += h.y; n++; }
    }
    return n ? { x: sx / n, y: sy / n } : { x: 0, y: 0 };
}

// Boîte englobante d'un cluster (pour zoom/pan futur)
export function clusterBBox(hexKeys) {
    const grid = buildWorldGrid();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const k of hexKeys) {
        const h = grid.get(k);
        if (h) {
            if (h.x < minX) minX = h.x; if (h.y < minY) minY = h.y;
            if (h.x > maxX) maxX = h.x; if (h.y > maxY) maxY = h.y;
        }
    }
    return { minX, minY, maxX, maxY,
        cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}
