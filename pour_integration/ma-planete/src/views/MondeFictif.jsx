// src/views/MondeFictif.jsx — relief couches + LOD zoom + océan habité
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { mulberry32 } from '../utils/tectonique.js';
import { CURSEUR_POINTER } from '../utils/curseurs.js';

const HEX_R       = 7;
const COLS        = 240;
const ROWS        = 170;
const W3          = Math.sqrt(3);
const VB_W        = 3000;
const VB_H        = 1800;
const SEUIL_TERRE = 0.55;

// ─── Géométrie hex ────────────────────────────────────────────────────────────

function hexCenter(col, row) {
  const x = col * W3 * HEX_R + (row % 2 === 1 ? W3 / 2 * HEX_R : 0) + W3 * HEX_R;
  const y = row * 1.5 * HEX_R + HEX_R + 5;
  return [x, y];
}

function hexCorners(col, row) {
  const [cx, cy] = hexCenter(col, row);
  return Array.from({ length: 6 }, (_, k) => {
    const a = -Math.PI / 2 + k * Math.PI / 3;
    return [cx + HEX_R * Math.cos(a), cy + HEX_R * Math.sin(a)];
  });
}

function hexPath(col, row) {
  const pts = hexCorners(col, row);
  return pts.map(([x, y], k) => `${k === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + 'Z';
}

function hexEdge(col, row, k) {
  const pts = hexCorners(col, row);
  const [x0, y0] = pts[k];
  const [x1, y1] = pts[(k + 1) % 6];
  return `M${x0.toFixed(1)},${y0.toFixed(1)}L${x1.toFixed(1)},${y1.toFixed(1)}`;
}

function bastionFace(col, row, k, dx, dy) {
  const pts = hexCorners(col, row);
  const [x0, y0] = pts[k];
  const [x1, y1] = pts[(k + 1) % 6];
  return `M${x0.toFixed(1)},${y0.toFixed(1)}`
       + `L${x1.toFixed(1)},${y1.toFixed(1)}`
       + `L${(x1 + dx).toFixed(1)},${(y1 + dy).toFixed(1)}`
       + `L${(x0 + dx).toFixed(1)},${(y0 + dy).toFixed(1)}Z`;
}

// Voisin (odd-r offset) k=0 NE, 1 E, 2 SE, 3 SW, 4 W, 5 NW
function voisin(col, row, k) {
  const D = [
    [[0,-1],[1,0],[0,1],[-1,1],[-1,0],[-1,-1]],
    [[1,-1],[1,0],[1,1],[0,1], [-1,0],[0,-1] ],
  ];
  const [dc, dr] = D[row % 2][k];
  return [col + dc, row + dr];
}

// ─── Bruit ────────────────────────────────────────────────────────────────────

function hash2(x, y, s) {
  let h = (x * 1619 + y * 31337 + s * 1000003) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return (h >>> 0) / 4294967296;
}

function smoothstep(t) { return t * t * (3 - 2 * t); }

function valueNoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = smoothstep(x - xi), yf = smoothstep(y - yi);
  return hash2(xi,   yi,   s) * (1-xf)*(1-yf)
       + hash2(xi+1, yi,   s) * xf    *(1-yf)
       + hash2(xi,   yi+1, s) * (1-xf)*yf
       + hash2(xi+1, yi+1, s) * xf    *yf;
}

function fbm(x, y, s) {
  return valueNoise(x,   y,   s)      * 0.50
       + valueNoise(x*2, y*2, s+1111) * 0.30
       + valueNoise(x*4, y*4, s+2222) * 0.20;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const BIOMES = [
  { seuil: 0.30, couleur: '#020a18' },
  { seuil: 0.42, couleur: '#041422' },
  { seuil: 0.55, couleur: '#0d2235' },
  { seuil: 0.65, couleur: '#1a3045' },
  { seuil: 0.72, couleur: '#1e3a40' },
  { seuil: 0.80, couleur: '#243545' },
  { seuil: 0.90, couleur: '#2a3050' },
  { seuil: Infinity, couleur: '#1e2a38' },
];

function biomeCouleur(h) {
  for (const { seuil, couleur } of BIOMES) if (h < seuil) return couleur;
  return BIOMES[BIOMES.length - 1].couleur;
}

// Océan base — 3 niveaux de profondeur
function couleurOcean(d) {
  if (d === 0) return '#0d2a4a'; // rivage
  if (d === 1) return '#0a2240'; // mer côtière
  return '#071a30';              // océan profond
}

// Stroke ocean : associé à chaque couleur de fond
const OCEAN_STROKE = {
  '#0d2a4a': '#102e50',
  '#0a2240': '#0c2848',
  '#071a30': '#081e36',
};

// Couches overlay relief (pics BFS)
const RELIEF_LAYERS = [
  { fill: '#4a4570', opacity: '0.85' }, // dist 0 — pic
  { fill: '#3a3860', opacity: '0.60' }, // dist 1
  { fill: '#2e3055', opacity: '0.40' }, // dist 2
  { fill: '#253048', opacity: '0.25' }, // dist 3
];

// Couches overlay bathymétrie (côte BFS)
const BATHO_LAYERS = [
  { fill: '#0d2a4a', opacity: '0.50' }, // dist 0 — rivage
  { fill: '#0a2040', opacity: '0.40' }, // dist 1
  { fill: '#071830', opacity: '0.30' }, // dist 2
];

// Hauteur Bastion selon altitude
function bastionDxDy(h) {
  if (h >= 0.82) return [5, 10];
  if (h >= 0.70) return [3, 6];
  if (h >= 0.65) return [1.5, 3];
  return [0.5, 1];
}

function assombrir(hex, f = 0.6) {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * f);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * f);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * f);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function varier(hex, delta) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + delta);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + delta);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + delta);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function neonPays(idx) {
  let hue = (idx * 47) % 360;
  if (hue >= 165 && hue <= 195) hue += 30;
  return `hsl(${hue},90%,65%)`;
}

function shuffler(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Style partagé UI ─────────────────────────────────────────────────────────

const btnStyle = {
  padding: '8px 16px', background: 'rgba(0,10,28,0.85)',
  border: '1px solid rgba(0,200,255,0.35)', borderRadius: '4px',
  color: 'rgba(0,210,255,0.90)', cursor: CURSEUR_POINTER,
  fontSize: '0.88rem', fontFamily: 'monospace', letterSpacing: '0.06em',
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function MondeFictif({ seed, onMondeReel }) {
  const [localSeed, setLocalSeed]   = useState(seed);
  const [hoveredPays, setHoveredPays] = useState(null);

  const wrapRef = useRef(null);
  const ptrDown = useRef(false);
  const lastXY  = useRef([0, 0]);

  const [xf, setXf] = useState(() => ({
    scale: 0.5,
    x: Math.round((window.innerWidth  - VB_W * 0.5) / 2),
    y: Math.round((window.innerHeight - VB_H * 0.5) / 2),
  }));

  const lod = xf.scale < 0.7 ? 0 : xf.scale < 2.0 ? 1 : 2;

  // Zoom vers le curseur (passive:false requis pour preventDefault)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const f  = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setXf(p => {
        const ns = Math.min(6, Math.max(0.4, p.scale * f));
        const sc = ns / p.scale;
        return { scale: ns, x: mx - sc * (mx - p.x), y: my - sc * (my - p.y) };
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const onPtrDown = (e) => {
    ptrDown.current = true;
    lastXY.current = [e.clientX, e.clientY];
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPtrMove = (e) => {
    if (!ptrDown.current) return;
    const [lx, ly] = lastXY.current;
    setXf(p => ({ ...p, x: p.x + e.clientX - lx, y: p.y + e.clientY - ly }));
    lastXY.current = [e.clientX, e.clientY];
  };
  const onPtrUp = () => { ptrDown.current = false; };

  // ─── Génération (seed local) ─────────────────────────────────────────────────

  const svgData = useMemo(() => {
    // 1. Heightmap FBM + fondu de bord
    const heights = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => {
        const h = fbm(c / COLS * 3.8, r / ROWS * 3.8, localSeed);
        const fade = Math.min(1, c / 25, (COLS - 1 - c) / 25, r / 15, (ROWS - 1 - r) / 15);
        return h * fade;
      })
    );

    // 2. Flood-fill masses terrestres
    const massIdx = Array.from({ length: ROWS }, () => new Int16Array(COLS).fill(-1));
    const masses  = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (heights[r][c] < SEUIL_TERRE || massIdx[r][c] !== -1) continue;
        const masse = [];
        const q = [[c, r]];
        massIdx[r][c] = masses.length;
        while (q.length) {
          const [qc, qr] = q.shift();
          masse.push([qc, qr]);
          for (let k = 0; k < 6; k++) {
            const [nc, nr] = voisin(qc, qr, k);
            if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
            if (heights[nr][nc] < SEUIL_TERRE || massIdx[nr][nc] !== -1) continue;
            massIdx[nr][nc] = masses.length;
            q.push([nc, nr]);
          }
        }
        masses.push(masse);
      }
    }
    masses.forEach(m => {
      if (m.length < 60) m.forEach(([c, r]) => { massIdx[r][c] = -1; });
    });
    const massesFiltrees = masses.filter(m => m.length >= 60);

    // 3. BFS pays
    const paysCarte = Array.from({ length: ROWS }, () => new Int16Array(COLS).fill(-1));
    const rng = mulberry32((localSeed * 6971 + 12345) | 0);
    let nbPays = 0;
    massesFiltrees.forEach(masse => {
      const n = Math.max(1, Math.floor(masse.length / 55));
      const q = [];
      shuffler(masse, rng).slice(0, n).forEach(([c, r]) => {
        paysCarte[r][c] = nbPays++;
        q.push([c, r]);
      });
      while (q.length) {
        const [qc, qr] = q.shift();
        const p = paysCarte[qr][qc];
        for (let k = 0; k < 6; k++) {
          const [nc, nr] = voisin(qc, qr, k);
          if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
          if (massIdx[nr][nc] === -1 || paysCarte[nr][nc] !== -1) continue;
          paysCarte[nr][nc] = p;
          q.push([nc, nr]);
        }
      }
    });

    // 4. BFS relief — pics (h > 0.82), max 4 anneaux
    const dPic = Array.from({ length: ROWS }, () => new Int8Array(COLS).fill(-1));
    const qPic = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (massIdx[r][c] !== -1 && heights[r][c] > 0.82) { dPic[r][c] = 0; qPic.push([c, r]); }
    while (qPic.length) {
      const [c, r] = qPic.shift();
      if (dPic[r][c] >= 4) continue;
      for (let k = 0; k < 6; k++) {
        const [nc, nr] = voisin(c, r, k);
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
        if (massIdx[nr][nc] === -1 || dPic[nr][nc] !== -1) continue;
        dPic[nr][nc] = dPic[r][c] + 1;
        qPic.push([nc, nr]);
      }
    }

    // 5. BFS relief — highlands (0.70–0.82), max 1 anneau
    const dHigh = Array.from({ length: ROWS }, () => new Int8Array(COLS).fill(-1));
    const qHigh = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const h = heights[r][c];
        if (massIdx[r][c] !== -1 && h >= 0.70 && h < 0.82) { dHigh[r][c] = 0; qHigh.push([c, r]); }
      }
    while (qHigh.length) {
      const [c, r] = qHigh.shift();
      if (dHigh[r][c] >= 1) continue;
      for (let k = 0; k < 6; k++) {
        const [nc, nr] = voisin(c, r, k);
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
        if (massIdx[nr][nc] === -1 || dHigh[nr][nc] !== -1) continue;
        dHigh[nr][nc] = dHigh[r][c] + 1;
        qHigh.push([nc, nr]);
      }
    }

    // 6. BFS océan — distance côte, max 4 anneaux
    const dCote = Array.from({ length: ROWS }, () => new Int8Array(COLS).fill(-1));
    const qCote = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (massIdx[r][c] !== -1) continue;
        let adjTerre = false;
        for (let k = 0; k < 6; k++) {
          const [nc, nr] = voisin(c, r, k);
          if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && massIdx[nr][nc] !== -1) { adjTerre = true; break; }
        }
        if (adjTerre) { dCote[r][c] = 0; qCote.push([c, r]); }
      }
    while (qCote.length) {
      const [c, r] = qCote.shift();
      if (dCote[r][c] >= 4) continue;
      for (let k = 0; k < 6; k++) {
        const [nc, nr] = voisin(c, r, k);
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
        if (massIdx[nr][nc] !== -1 || dCote[nr][nc] !== -1) continue;
        dCote[nr][nc] = dCote[r][c] + 1;
        qCote.push([nc, nr]);
      }
    }

    // 7. Chemins SVG
    const hexOceanD    = {};
    const hexTerreD    = {};
    const hexTerreVarD = {};
    const bastionD     = {};
    const paysD        = {};
    const frontD       = {};
    const coteSegs     = [];
    // Couches overlay (polygones superposés)
    const reliefD = ['', '', '', ''];  // dPic 0→3
    const bathoD  = ['', '', ''];      // dCote 0→2

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const h        = heights[r][c];
        const estTerre = massIdx[r][c] !== -1;
        const p        = paysCarte[r][c];
        const hexId    = r * COLS + c;
        const base     = biomeCouleur(h);

        if (estTerre) {
          const vLevel = Math.floor(hash2(c, r, localSeed + 7777) * 3);
          const varied = vLevel === 0 ? base : varier(base, vLevel === 1 ? 18 : -18);
          hexTerreD[base]      = (hexTerreD[base]      || '') + hexPath(c, r);
          hexTerreVarD[varied] = (hexTerreVarD[varied] || '') + hexPath(c, r);
          if (p !== -1) paysD[p] = (paysD[p] || '') + hexPath(c, r);
          // Overlay relief — superposé après la couche base
          const dp = dPic[r][c];
          if (dp >= 0 && dp <= 3) reliefD[dp] += hexPath(c, r);
        } else {
          const oCol = couleurOcean(dCote[r][c]);
          hexOceanD[oCol] = (hexOceanD[oCol] || '') + hexPath(c, r);
          // Overlay bathymétrie — superposé après la couche ocean base
          const dc = dCote[r][c];
          if (dc >= 0 && dc <= 2) bathoD[dc] += hexPath(c, r);
        }

        for (let k = 0; k < 6; k++) {
          const [nc, nr] = voisin(c, r, k);
          const inB    = nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS;
          const nId    = inB ? nr * COLS + nc : -1;
          const lowest = !inB || hexId < nId;
          const nTerre = inB && massIdx[nr][nc] !== -1;
          const nP     = inB ? paysCarte[nr][nc] : -1;

          // Bastion — face latérale sur chaque arête exposée
          if (estTerre && !nTerre) {
            const [dx, dy] = bastionDxDy(h);
            const sombre = assombrir(base, 0.55);
            bastionD[sombre] = (bastionD[sombre] || '') + bastionFace(c, r, k, dx, dy);
          }

          // Côte
          if (lowest && estTerre !== nTerre) coteSegs.push(hexEdge(c, r, k));

          // Frontières (ajout aux deux pays)
          if (lowest && estTerre && nTerre && p !== -1 && nP !== -1 && p !== nP) {
            const seg = hexEdge(c, r, k);
            frontD[p]  = (frontD[p]  || '') + seg;
            frontD[nP] = (frontD[nP] || '') + seg;
          }
        }
      }
    }

    // 8. Particules (200 seedées)
    const rngP = mulberry32((localSeed * 9973 + 54321) | 0);
    const particules = Array.from({ length: 200 }, () => ({
      x: (rngP() * VB_W).toFixed(1),
      y: (rngP() * VB_H).toFixed(1),
    }));

    return { hexOceanD, hexTerreD, hexTerreVarD, bastionD, paysD, frontD,
             coteD: coteSegs.join(''), particules, nRoyaumes: nbPays,
             reliefD, bathoD };
  }, [localSeed]);

  const { hexOceanD, hexTerreD, hexTerreVarD, bastionD, paysD, frontD,
          coteD, particules, nRoyaumes, reliefD, bathoD } = svgData;

  const strokeW = lod === 0 ? null : lod === 1 ? '0.3' : '0.5';
  const nPart   = lod === 2 ? 200 : 120;

  return (
    <div ref={wrapRef}
      style={{ position: 'fixed', inset: 0, overflow: 'hidden',
               backgroundColor: '#061628', cursor: 'grab', userSelect: 'none' }}
      onPointerDown={onPtrDown} onPointerMove={onPtrMove} onPointerUp={onPtrUp}>

      {/* ── UI fixe ────────────────────────────────────────────────────────────
           stopPropagation sur pointerDown : empêche le map de capturer les
           événements pointer quand on clique sur les boutons UI.           */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'all' }}
        onPointerDown={e => e.stopPropagation()}>

        <button onClick={onMondeReel} style={btnStyle}>
          ← MONDE RÉEL
        </button>

        <button onClick={() => setLocalSeed(Math.floor(Math.random() * 99999))}
          style={btnStyle}>
          ⟳ NOUVEAU MONDE
        </button>

        <span style={{ padding: '6px 18px', background: 'rgba(0,8,22,0.85)',
          border: '1px solid rgba(0,200,255,0.3)', borderRadius: '3px',
          color: 'rgba(0,210,255,0.85)', fontSize: '0.78rem',
          fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          MONDE #{localSeed}
        </span>

        <span style={{ color: 'rgba(0,200,255,0.45)', fontSize: '0.75rem',
          fontFamily: 'monospace', letterSpacing: '0.08em' }}>
          {nRoyaumes} royaumes
        </span>

        <span style={{ color: 'rgba(0,200,255,0.25)', fontSize: '0.68rem',
          fontFamily: 'monospace' }}>
          {xf.scale.toFixed(2)}×
        </span>
      </div>

      {/* ── SVG zoomable ───────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        transform: `translate(${xf.x}px,${xf.y}px) scale(${xf.scale})`,
        transformOrigin: '0 0',
        width: `${VB_W}px`,
        height: `${VB_H}px`,
      }}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: '100%', height: '100%' }}>

          <defs>
            <filter id="border-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5"/>
            </filter>
            <filter id="pays-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2"/>
            </filter>
          </defs>

          {/* 1. Fond océan bleu-nuit */}
          <rect width={VB_W} height={VB_H} fill="#061628" />

          {/* 2. Particules */}
          {particules.slice(0, nPart).map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="0.8" fill="#1a3a5a" opacity="0.4" />
          ))}

          {/* 2. Hex océan base — toute la grille non-terre, avec stroke */}
          {Object.entries(hexOceanD).map(([c, d]) => d &&
            <path key={`oc-${c}`} d={d} fill={c}
              stroke={OCEAN_STROKE[c] || 'none'} strokeWidth="0.4" />
          )}

          {/* 3. Couches bathymétriques — polygones superposés (dist 0→2 depuis côte) */}
          {BATHO_LAYERS.map(({ fill, opacity }, i) => bathoD[i] &&
            <path key={`ba-${i}`} d={bathoD[i]} fill={fill} opacity={opacity} stroke="none" />
          )}

          {/* 4. Faces latérales Bastion */}
          {Object.entries(bastionD).map(([c, d]) => d &&
            <path key={`bt-${c}`} d={d} fill={c} stroke="none" />
          )}

          {/* 5. Surface — biome base (LOD 0/1) */}
          {lod < 2 && Object.entries(hexTerreD).map(([c, d]) => d &&
            <path key={`te-${c}`} d={d} fill={c}
              stroke={strokeW ? assombrir(c, 0.55) : null}
              strokeWidth={strokeW} />
          )}

          {/* 5b. Surface — micro-variation ±18 RGB (LOD 2) */}
          {lod >= 2 && Object.entries(hexTerreVarD).map(([c, d]) => d &&
            <path key={`tv-${c}`} d={d} fill={c}
              stroke={assombrir(c, 0.55)} strokeWidth="0.5" />
          )}

          {/* 6. Couches relief superposées — polygones par-dessus biome (dist 0→3 depuis pics) */}
          {RELIEF_LAYERS.map(({ fill, opacity }, i) => reliefD[i] &&
            <path key={`rl-${i}`} d={reliefD[i]} fill={fill} opacity={opacity} stroke="none" />
          )}

          {/* Côtes */}
          {coteD &&
            <path d={coteD} stroke="rgba(0,210,245,0.50)" strokeWidth="0.9" fill="none" />
          }

          {/* 7. Frontières pays — quasi-invisible par défaut, néon au survol */}
          {Object.keys(frontD).map(idx => {
            const id  = +idx;
            const isH = hoveredPays === id;
            const col = neonPays(id);
            return (
              <g key={`pays-${idx}`}>
                {/* Glow — visible seulement au survol */}
                <path d={frontD[idx]} stroke={col}
                  strokeWidth={isH ? '4' : '2'} fill="none"
                  filter="url(#pays-glow)" opacity={isH ? '0.55' : '0.08'} />
                {/* Trait net */}
                <path d={frontD[idx]} stroke={col}
                  strokeWidth={isH ? '1.5' : '0.5'} fill="none"
                  opacity={isH ? '0.9' : '0.2'} />
                {/* Fill — pour détection hover (fillOpacity 0.001 = invisible mais réactif) */}
                {paysD[idx] &&
                  <path d={paysD[idx]} fill={col}
                    fillOpacity={isH ? '0.08' : '0.001'} stroke="none"
                    onMouseEnter={() => setHoveredPays(id)}
                    onMouseLeave={() => setHoveredPays(null)} />
                }
              </g>
            );
          })}

        </svg>
      </div>
    </div>
  );
}
