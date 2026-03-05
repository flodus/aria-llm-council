// ═══════════════════════════════════════════════════════════════════════════
//  HexGrid.jsx  —  Rendu SVG de la carte hexagonale ARIA
//
//  Props :
//    world            — WorldData généré par WorldEngine
//    countries        — tableau de pays ARIA
//    selectedCountry  — pays actuellement sélectionné (ou null)
//    alliances        — tableau de liaisons diplomatiques
//    onCountryClick   — callback (country) => void
//    onCountryHover   — callback (country | null) => void
//
//  Couches (ordre z) :
//  1  Fond noir
//  2  Hex OCEAN_DEEP
//  3  Hex OCEAN_SHELF
//  4  Hex COASTAL (avec clipPath masse terrestre)
//  5  Hex LAND / HIGHLAND / MOUNTAIN / POLAR / TUNDRA / DESERT
//  6  Pays inactifs (overlay + frontière néon sombre)
//  7  Cercle d'influence (pays sélectionné)
//  8  Pays sélectionné (overlay + frontière néon vif)
//  9  Lignes diplomatiques
//  10 Labels
//  11 Vignette + watermark
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useState, useMemo, memo } from 'react';
import { BIOME, BIOME_COLOR, MAP_W, MAP_H, HEX_R, hexPointsStr } from './WorldEngine';

// ── Helpers couleur ───────────────────────────────────────────────────────
const IS_HEX6 = /^#[0-9A-Fa-f]{6}$/;

function isValidHex(s) { return IS_HEX6.test(s); }

function hexRgba(hex, a) {
  if (!isValidHex(hex)) return `rgba(128,144,176,${a})`;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

const REGIME_COLORS = {
  democratie_liberale: '#4A90D9',
  democratie_sociale:  '#3ABF7A',
  technocratie:        '#9060C8',
  autocratie:          '#C05050',
  theacratie:          '#C8A030',
  anarchie:            '#708090',
  federation:          '#4AB0A0',
};

function countryNeon(country) {
  const c = country?.couleur;
  if (!c) return REGIME_COLORS[country?.regime] || '#8090B0';
  // Accepte #RRGGBB ET hsl(...) ET toute string CSS valide
  if (isValidHex(c) || c.startsWith('hsl') || c.startsWith('rgb')) return c;
  return REGIME_COLORS[country?.regime] || '#8090B0';
}

// Helper hexRgba compatible HSL
function countryFill(country, alpha) {
  const c = country?.couleur;
  if (!c) return `rgba(128,144,176,${alpha})`;
  if (isValidHex(c)) return hexRgba(c, alpha);
  // Pour hsl() : injecter l'alpha via une div temporaire ou retourner directement avec opacity
  // On retourne la couleur CSS brute — l'opacité sera gérée par l'attribut opacity du SVG
  return c;
}

// ── SVG Defs (filtres néon + gradients) ──────────────────────────────────
const DEFS_HTML = `
<!-- Filtres néon -->
<filter id="neon-xl" x="-60%" y="-60%" width="220%" height="220%">
  <feGaussianBlur stdDeviation="8"  result="b1"/>
  <feGaussianBlur stdDeviation="18" result="b2"/>
  <feMerge>
    <feMergeNode in="b2"/>
    <feMergeNode in="b1"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
<filter id="neon-md" x="-35%" y="-35%" width="170%" height="170%">
  <feGaussianBlur stdDeviation="3" result="b"/>
  <feMerge>
    <feMergeNode in="b"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
<filter id="neon-xs" x="-15%" y="-15%" width="130%" height="130%">
  <feGaussianBlur stdDeviation="1.2"/>
</filter>

<!-- Fond océan -->
<radialGradient id="bg-ocean" cx="50%" cy="50%" r="70%">
  <stop offset="0%"   stop-color="#080F1E"/>
  <stop offset="100%" stop-color="#030608"/>
</radialGradient>

<!-- Vignette de bord -->
<radialGradient id="bg-vign" cx="50%" cy="50%" r="65%">
  <stop offset="30%"  stop-color="transparent"/>
  <stop offset="100%" stop-color="rgba(1,2,6,0.82)"/>
</radialGradient>

<!-- Dégradé COASTAL (mer→terre) — utilisé en fill des hex côtiers -->
<linearGradient id="grad-coastal" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%"   stop-color="#0A1528"/>
  <stop offset="55%"  stop-color="#0E1A2C"/>
  <stop offset="100%" stop-color="#141E30"/>
</linearGradient>
`;

// ── Composant HexGrid (mémoïsé) ───────────────────────────────────────────
function HexGridInner({
  world,
  countries = [],
  selectedCountry,
  alliances = [],
  onCountryClick,
  onCountryHover,
}) {
  const [hovered, setHovered] = useState(null);
  const selectedId = selectedCountry?.id ?? null;

  // ── Lookup rapide ────────────────────────────────────────────────────
  const placementById = useMemo(() => {
    const m = new Map();
    (world?.placements || []).forEach(p => m.set(p.id, p));
    return m;
  }, [world?.placements]);

  const countryById = useMemo(() => {
    const m = new Map();
    countries.forEach(c => m.set(c.id, c));
    return m;
  }, [countries]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleClick = useCallback((id) => {
    const c = countryById.get(id);
    if (c) onCountryClick?.(c);
  }, [countryById, onCountryClick]);

    const handleEnter = useCallback((id) => {
      setHovered(id);
      const c = countryById.get(id);
      onCountryHover?.(c || null);
    }, [countryById, onCountryHover]);

    const handleLeave = useCallback(() => {
      setHovered(null);
      onCountryHover?.(null);
    }, [onCountryHover]);

    // Partition des hex par biome pour le rendu en couches
    const hexByBiome = useMemo(() => {
      const m = new Map();
      Object.values(BIOME).forEach(b => m.set(b, []));
      if (world?.grid) {
        for (const h of world.grid.values()) {
          const arr = m.get(h.biome);
          if (arr) arr.push(h);
        }
      }
      return m;
    }, [world?.grid]);

    // Set des hex appartenant à un pays (pour éviter le double rendu)
    const countryHexSet = useMemo(() => {
      const s = new Set();
      if (world?.placements) {
        for (const p of world.placements) {
          p.hexKeys.forEach(k => s.add(k));
        }
      }
      return s;
    }, [world?.placements]);

    // ── Formatage population ─────────────────────────────────────────────
    const fmtPop = (n) =>
    n >= 1e9 ? (n/1e9).toFixed(1)+' Md' :
    n >= 1e6 ? (n/1e6).toFixed(1)+' M'  :
    n >= 1e3 ? Math.round(n/1e3)+' k'   : String(n);

    if (!world) {
      return (
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        style={{ width:'100%', height:'100%', background:'#030608' }}>
        <text x={MAP_W/2} y={MAP_H/2} textAnchor="middle"
        fill="rgba(200,164,74,0.3)"
        fontFamily="'Cinzel',serif" fontSize="14" letterSpacing="0.3em">
        GÉNÉRATION EN COURS…
        </text>
        </svg>
      );
    }

    const { grid, hulls } = world;

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width:'100%', height:'100%', display:'block', background:'#030608' }}
    >
      <defs dangerouslySetInnerHTML={{ __html: DEFS_HTML }} />

      {/* Clip global — empêche les hex de déborder sur les bords */}
      <defs>
        <clipPath id="map-bounds">
          <rect x={0} y={0} width={MAP_W} height={MAP_H} />
        </clipPath>
      </defs>

      {/* ClipPaths low-poly pour les masses terrestres (contour réel hexagonal) */}
      {world.masses && world.masses.map(mass => {
        const pathD = hulls.get(mass.id);
        if (!pathD) return null;
        return (
          <clipPath key={`cp-${mass.id}`} id={`clip-${mass.id}`}>
            <path d={pathD} />
          </clipPath>
        );
      })}

      {/* Tout le contenu est clippé dans les bornes de la carte */}
      <g clipPath="url(#map-bounds)">

      {/* ── COUCHE 1 : Fond ── */}
      <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="url(#bg-ocean)" />

      {/* ── COUCHE 2 : Hex mer profonde ── */}
      <g>
        {(hexByBiome.get(BIOME.OCEAN_DEEP) || []).map(h => (
          <polygon key={h.key}
            points={hexPointsStr(h.x, h.y)}
            fill={BIOME_COLOR[BIOME.OCEAN_DEEP]}
            stroke="none"
          />
        ))}
      </g>

      {/* ── COUCHE 3 : Hex plateau continental (ZEE) ── */}
      <g>
        {(hexByBiome.get(BIOME.OCEAN_SHELF) || []).map(h => (
          <polygon key={h.key}
            points={hexPointsStr(h.x, h.y)}
            fill={BIOME_COLOR[BIOME.OCEAN_SHELF]}
            stroke="#0C1E3A"
            strokeWidth="0.3"
          />
        ))}
      </g>

      {/* ── COUCHE 4 : Hex côtiers (clipPath masse terrestre) ── */}
      <g>
        {(hexByBiome.get(BIOME.COASTAL) || []).map(h => (
          <polygon key={h.key}
            points={hexPointsStr(h.x, h.y)}
            fill="url(#grad-coastal)"
            stroke="#141E38"
            strokeWidth="0.5"
            clipPath={h.continentId ? `url(#clip-${h.continentId})` : undefined}
          />
        ))}
      </g>

      {/* ── COUCHE 5 : Hex terres (tous biomes terrestres hors COASTAL) ── */}
      <g>
        {[BIOME.LAND, BIOME.HIGHLAND, BIOME.MOUNTAIN,
          BIOME.POLAR, BIOME.TUNDRA, BIOME.DESERT].map(biome =>
          (hexByBiome.get(biome) || []).map(h => (
            <polygon key={h.key}
              points={hexPointsStr(h.x, h.y)}
              fill={BIOME_COLOR[biome]}
              stroke="#121A2E"
              strokeWidth="0.4"
            />
          ))
        )}
      </g>

      {/* ── COUCHE 6 : Pays inactifs ── */}
      {world.placements
        .filter(pl => pl.id !== selectedId)
        .map(pl => {
          const country = countryById.get(pl.id);
          if (!country) return null;
          const neon  = countryNeon(country);
          const isHov = hovered === pl.id;
          const fillA = isHov ? 0.22 : 0.10;
          const stroA = isHov ? 0.85 : 0.48;   // toujours visible au repos
          const stroW = isHov ? 1.8  : 1.1;

          return (
            <g key={`ctr-${pl.id}`}
              style={{ cursor:'pointer' }}
              onClick={() => handleClick(pl.id)}
              onMouseEnter={() => handleEnter(pl.id)}
              onMouseLeave={handleLeave}>

              {/* Hex overlay */}
              {pl.hexKeys.map(k => {
                const h = grid.get(k);
                if (!h) return null;
                return (
                  <polygon key={k}
                    points={hexPointsStr(h.x, h.y)}
                    fill={neon}
                    fillOpacity={fillA}
                    stroke="none"
                    style={{ transition:'fill-opacity 0.15s' }}
                  />
                );
              })}

              {/* Frontière néon — halo + trait toujours présents */}
              {pl.outline && (
                <>
                  <path d={pl.outline} fill="none"
                    stroke={neon} strokeWidth={isHov ? 5 : 3}
                    strokeLinejoin="round"
                    opacity={isHov ? 0.18 : 0.07} filter="url(#neon-md)" />
                  <path d={pl.outline} fill="none"
                    stroke={neon} strokeWidth={stroW}
                    strokeLinejoin="round"
                    opacity={stroA} />
                </>
              )}

              {/* Cercle d'influence réduit — toujours visible */}
              <circle
                cx={pl.cx} cy={pl.cy}
                r={pl.radius * 0.52}
                fill="none"
                stroke={neon}
                strokeWidth="0.9"
                strokeDasharray="5,8"
                opacity={isHov ? 0.40 : 0.22}
                pointerEvents="none"
              />

              {/* Label hover */}
              {isHov && (
                <g pointerEvents="none">
                  <rect x={pl.cx-55} y={pl.cy-21}
                    width={110} height={24} rx="2"
                    fill="rgba(3,6,16,0.88)"
                    stroke={neon} strokeOpacity={0.45} strokeWidth="0.8" />
                  <text x={pl.cx} y={pl.cy-5}
                    textAnchor="middle" fontSize="10"
                    fill={neon}
                    fontFamily="'Cinzel',serif" letterSpacing="0.07em">
                    {country.emoji} {country.nom}
                  </text>
                </g>
              )}
            </g>
          );
        })}

      {/* ── COUCHE 7 : Cercle d'influence (pays sélectionné) ── */}
      {world.placements
        .filter(pl => pl.id === selectedId)
        .map(pl => {
          const country = countryById.get(pl.id);
          if (!country) return null;
          const neon = countryNeon(country);
          return (
            <g key={`infl-${pl.id}`} pointerEvents="none">
              <circle
                cx={pl.cx} cy={pl.cy} r={pl.radius * 0.75}
                fill={neon} fillOpacity={0.04}
                stroke={neon}
                strokeWidth="1.2"
                strokeDasharray="8,6"
                opacity="0.52"
              />
            </g>
          );
        })}

      {/* ── COUCHE 8 : Pays sélectionné (néon vif) ── */}
      {world.placements
        .filter(pl => pl.id === selectedId)
        .map(pl => {
          const country = countryById.get(pl.id);
          if (!country) return null;
          const neon = countryNeon(country);
          const sat  = country.satisfaction ?? 50;
          const satC = sat >= 70 ? '#3ABF7A' : sat >= 45 ? '#C8A44A'
                     : sat >= 25 ? '#C05050' : '#882020';

          return (
            <g key={`sel-${pl.id}`}
              style={{ cursor:'pointer' }}
              onClick={() => handleClick(pl.id)}>

              {/* Hex overlay */}
              {pl.hexKeys.map(k => {
                const h = grid.get(k);
                if (!h) return null;
                return (
                  <polygon key={k}
                    points={hexPointsStr(h.x, h.y)}
                    fill={neon}
                    fillOpacity={0.22}
                    stroke={neon}
                    strokeOpacity={0.65}
                    strokeWidth="0.7"
                  />
                );
              })}

              {/* Halo néon large */}
              {pl.outline && (
                <path d={pl.outline} fill="none"
                  stroke={neon} strokeWidth="9"
                  strokeLinejoin="round"
                  opacity="0.14" filter="url(#neon-xl)" />
              )}
              {/* Trait néon précis */}
              {pl.outline && (
                <path d={pl.outline} fill="none"
                  stroke={neon} strokeWidth="1.9"
                  strokeLinejoin="round"
                  opacity="0.96" filter="url(#neon-md)" />
              )}

              {/* ── Label flottant ── */}
              <g pointerEvents="none">
                <rect x={pl.cx-70} y={pl.cy-45} width={140} height={66}
                  rx="3" fill="rgba(3,6,16,0.90)"
                  stroke={neon} strokeOpacity={0.40} strokeWidth="1" />
                {/* Filet coloré en haut */}
                <rect x={pl.cx-70} y={pl.cy-45} width={140} height={2}
                  rx="1" fill={neon} fillOpacity={0.55} />

                {/* Nom */}
                <text x={pl.cx} y={pl.cy-26}
                  textAnchor="middle" fontSize="11.5"
                  fill="rgba(220,230,248,0.96)"
                  fontFamily="'Cinzel',serif" letterSpacing="0.07em">
                  {country.emoji} {country.nom}
                </text>

                {/* Barre satisfaction */}
                <rect x={pl.cx-50} y={pl.cy-13} width={100} height={5}
                  rx="2.5" fill="rgba(8,12,28,0.95)" />
                <rect x={pl.cx-50} y={pl.cy-13} width={sat} height={5}
                  rx="2.5" fill={satC} opacity="0.88" />

                {/* Stats */}
                <text x={pl.cx} y={pl.cy+4}
                  textAnchor="middle" fontSize="8"
                  fill="rgba(130,150,195,0.65)"
                  fontFamily="'JetBrains Mono',monospace" letterSpacing="0.07em">
                  {fmtPop(country.population || 0)} · {sat}%
                </text>
              </g>
            </g>
          );
        })}

      {/* ── COUCHE 9 : Lignes diplomatiques ── */}
      {alliances.map((al, i) => {
        const a = placementById.get(al.a);
        const b = placementById.get(al.b);
        if (!a || !b) return null;
        const col = al.type === 'Alliance' ? '#3ABF7A'
                  : al.type === 'Tension'  ? '#E04040'
                  : al.type === 'Commerce' ? '#C8A44A'
                  : 'rgba(120,140,180,0.35)';
        return (
          <line key={`dip-${i}`}
            x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
            stroke={col} strokeWidth="1.2"
            strokeDasharray="6,5" opacity="0.48"
            filter="url(#neon-xs)" />
        );
      })}

      {/* ── COUCHE 10 : Vignette + watermark ── */}
      <rect x={0} y={0} width={MAP_W} height={MAP_H}
        fill="url(#bg-vign)" pointerEvents="none" />
      <text x={MAP_W-14} y={MAP_H-10}
        textAnchor="end" fontSize="7"
        fontFamily="'Cinzel',serif" letterSpacing="0.30em"
        fill="rgba(200,164,74,0.09)" pointerEvents="none">
        ARIA
      </text>

      {/* ── LÉGENDE BIOMES (bas-gauche) ── */}
      {(() => {
        const items = [
          { color: BIOME_COLOR[BIOME.OCEAN_DEEP],  label: 'Mer profonde' },
          { color: BIOME_COLOR[BIOME.OCEAN_SHELF], label: 'ZEE / plateau' },
          { color: BIOME_COLOR[BIOME.LAND],        label: 'Terres' },
          { color: BIOME_COLOR[BIOME.HIGHLAND],    label: 'Hauts plateaux' },
          { color: BIOME_COLOR[BIOME.MOUNTAIN],    label: 'Montagnes' },
          { color: BIOME_COLOR[BIOME.POLAR],       label: 'Polaire / Toundra' },
          { color: BIOME_COLOR[BIOME.DESERT],      label: 'Désert / Aride' },
        ];
        const ROW = 13, PAD = 8, TW = 104;
        const bH  = items.length * ROW + 20;
        const x0  = 14, y0 = MAP_H - 14 - bH;
        return (
          <g pointerEvents="none">
            <rect x={x0-4} y={y0-4} width={TW} height={bH} rx="2"
              fill="rgba(4,8,20,0.82)" stroke="rgba(200,164,74,0.14)" strokeWidth="0.7" />
            <text x={x0+4} y={y0+8} fontSize="6.5" fontFamily="'Cinzel',serif"
              letterSpacing="0.20em" fill="rgba(200,164,74,0.55)">BIOMES</text>
            {items.map((it, i) => (
              <g key={it.label} transform={`translate(${x0+4},${y0 + 17 + i*ROW})`}>
                <rect x={0} y={-7} width={10} height={10} rx="1.5"
                  fill={it.color} stroke="rgba(200,164,74,0.25)" strokeWidth="0.6" />
                <text x={14} y={1} fontSize="7" fontFamily="'JetBrains Mono',monospace"
                  fill="rgba(150,175,215,0.70)">{it.label}</text>
              </g>
            ))}
          </g>
        );
      })()}

      {/* ── LÉGENDE RELATIONS (bas, à droite des biomes) ── */}
      {(() => {
        const items = [
          { color: '#3ABF7A', dash: null,   label: 'Alliance' },
          { color: '#C8A44A', dash: '4,4',  label: 'Commerce' },
          { color: 'rgba(120,140,185,0.7)', dash: '3,6', label: 'Neutre' },
          { color: '#E04040', dash: null,   label: 'Tension' },
        ];
        const ROW = 13, TW = 92;
        const bH  = items.length * ROW + 20;
        const x0  = 132, y0 = MAP_H - 14 - bH;
        return (
          <g pointerEvents="none">
            <rect x={x0-4} y={y0-4} width={TW} height={bH} rx="2"
              fill="rgba(4,8,20,0.82)" stroke="rgba(200,164,74,0.14)" strokeWidth="0.7" />
            <text x={x0+4} y={y0+8} fontSize="6.5" fontFamily="'Cinzel',serif"
              letterSpacing="0.20em" fill="rgba(200,164,74,0.55)">RELATIONS</text>
            {items.map((it, i) => (
              <g key={it.label} transform={`translate(${x0+4},${y0 + 17 + i*ROW})`}>
                <line x1={0} y1={-2} x2={14} y2={-2}
                  stroke={it.color} strokeWidth="2"
                  strokeDasharray={it.dash || 'none'} />
                <text x={18} y={1} fontSize="7" fontFamily="'JetBrains Mono',monospace"
                  fill="rgba(150,175,215,0.70)">{it.label}</text>
              </g>
            ))}
          </g>
        );
      })()}
      </g> {/* /map-bounds */}
    </svg>
  );
}

export const HexGrid = memo(HexGridInner);
export default HexGrid;
