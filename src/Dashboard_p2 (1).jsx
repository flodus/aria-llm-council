// ═══════════════════════════════════════════════════════════════════════════
//  Dashboard.jsx — Partie 2 / 3
//  Rendu SVG : carte, topographie, pays, diplomatie, cercles d'influence
//  Viewport de référence : 1400 × 800
//  Dépend de : Dashboard_p1.jsx (imports réexportés)
// ═══════════════════════════════════════════════════════════════════════════

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  MINISTERS, MINISTRIES, REGIMES, TERRAINS, RESOURCE_KEYS,
  getHumeur, calcInfluenceRadius, genOrganicPath,
} from './Dashboard_p1';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES VISUELLES
// ─────────────────────────────────────────────────────────────────────────────

const SVG_W = 1400;
const SVG_H = 800;

// Ressources → emoji flottant sur la carte
const RES_ICONS = {
  agriculture: '🌾', bois: '🪵', eau: '💧',
  energie: '⚡', mineraux: '💎', peche: '🐟', petrole: '🛢️',
};

// Formatage population compact
const fmtPop = (n) =>
  n >= 1e9 ? (n / 1e9).toFixed(1) + 'Md' :
  n >= 1e6 ? (n / 1e6).toFixed(1) + 'M'  :
  n >= 1e3 ? Math.round(n / 1e3)  + 'k'  : String(n);

// Couleur pastel translucide depuis une couleur hex pour le cercle d'influence
function hexToInfluenceFill(hex, alpha = 0.10) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Interpolation de couleur pour la jauge satisfaction (rouge → orange → vert)
function satisfactionStroke(score) {
  if (score >= 70) return '#3ABF7A';
  if (score >= 45) return '#C8A44A';
  if (score >= 25) return '#C07030';
  return '#C03030';
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : FOND OCÉAN
// ─────────────────────────────────────────────────────────────────────────────

function OceanLayer({ W, H }) {
  return (
    <g className="ocean-layer">
      {/* Fond principal — géré par .ocean-bg en CSS, ce SVG ajoute la grille */}
      <rect x={0} y={0} width={W} height={H} fill="transparent" />

      {/* Grille tactique SVG (complète la grille CSS) */}
      <defs>
        <pattern id="grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(74,126,200,0.045)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#grid-pattern)" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : TOPOGRAPHIE (continents, îles, rivières, montagnes)
// ─────────────────────────────────────────────────────────────────────────────

function TopographyLayer({ worldData }) {
  if (!worldData) return null;
  const { continents, islands, rivers, mountains } = worldData;

  return (
    <g className="topo-layer">
      {/* ── Dégradés pour continents ── */}
      <defs>
        {continents.map(c => (
          <radialGradient key={`grad-${c.id}`} id={`grad-${c.id}`}
            cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#252E18" stopOpacity="1" />
            <stop offset="60%"  stopColor="#1E2614" stopOpacity="1" />
            <stop offset="100%" stopColor="#181E10" stopOpacity="1" />
          </radialGradient>
        ))}
      </defs>

      {/* ── Continents ── */}
      {continents.map(c => (
        <g key={c.id}>
          {/* Ombre portée */}
          <path
            d={c.path}
            fill="rgba(0,0,0,0.35)"
            transform="translate(3,5)"
            style={{ filter: 'blur(6px)' }}
          />
          {/* Masse terrestre */}
          <path
            d={c.path}
            className="world-land"
            fill={`url(#grad-${c.id})`}
          />
          {/* Liseré côtier */}
          <path
            d={c.path}
            fill="none"
            stroke="rgba(80,105,45,0.35)"
            strokeWidth="1.5"
          />
        </g>
      ))}

      {/* ── Îles ── */}
      {islands.map(isl => (
        <g key={isl.id}>
          <path
            d={isl.path}
            fill="rgba(0,0,0,0.28)"
            transform="translate(2,4)"
            style={{ filter: 'blur(4px)' }}
          />
          <path
            d={isl.path}
            className="world-land coastal-edge"
            fill="#1E2614"
          />
          <path
            d={isl.path}
            fill="none"
            stroke="rgba(80,105,45,0.28)"
            strokeWidth="1"
          />
        </g>
      ))}

      {/* ── Fleuves ── */}
      {rivers.map(r => (
        <path
          key={r.id}
          d={r.d}
          className="river"
        />
      ))}

      {/* ── Montagnes ── */}
      {mountains.map(m => (
        <g key={m.id} className="mountain">
          {m.peaks.map((p, i) => (
            <g key={i}>
              <path d={p.shadow} className="mountain-shadow" />
              <path d={p.body}   className="mountain-body"   />
              <path d={p.snow}   className="mountain-snow"   />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : ZEE (zone économique exclusive — pays côtiers)
// ─────────────────────────────────────────────────────────────────────────────

function ZeeLayer({ countries }) {
  return (
    <g className="zee-layer">
      {countries
        .filter(c => c.coastal)
        .map(c => (
          <ellipse
            key={`zee-${c.id}`}
            cx={c.cx}
            cy={c.cy}
            rx={c.size * 1.85}
            ry={c.size * 1.55}
            className="zee-area"
          />
        ))
      }
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : LIGNES DIPLOMATIQUES
//  Affichées uniquement pour le pays sélectionné
// ─────────────────────────────────────────────────────────────────────────────

function DiplomacyLines({ countries, selectedId, alliances }) {
  if (!selectedId) return null;

  const selected = countries.find(c => c.id === selectedId);
  if (!selected) return null;

  // Filtre les alliances impliquant le pays sélectionné
  const relevantAlliances = alliances.filter(
    a => a.a === selectedId || a.b === selectedId
  );

  return (
    <g className="diplomacy-layer">
      {relevantAlliances.map(({ a, b, type }) => {
        const other = countries.find(c => c.id === (a === selectedId ? b : a));
        if (!other) return null;

        const lineClass =
          type === 'Alliance' ? 'alliance-line' :
          type === 'Tension'  ? 'conflict-line'  : 'neutral-line';

        return (
          <line
            key={`${a}-${b}`}
            x1={selected.cx} y1={selected.cy}
            x2={other.cx}    y2={other.cy}
            className={lineClass}
          />
        );
      })}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : CERCLE D'INFLUENCE
//  Affiché au clic sur un pays — pointillés animés dans sa couleur
// ─────────────────────────────────────────────────────────────────────────────

function InfluenceCircle({ country }) {
  if (!country) return null;
  const r    = country.influenceRadius || 80;
  const fill = hexToInfluenceFill(country.couleur, country.coastal ? 0.08 : 0.06);
  const stroke = country.coastal
    ? 'rgba(48,160,220,0.55)'
    : hexToInfluenceFill(country.couleur, 0.65);

  return (
    <g className="influence-layer">
      {/* Remplissage translucide */}
      <circle
        cx={country.cx}
        cy={country.cy}
        r={r}
        fill={fill}
        stroke="none"
      />
      {/* Contour pointillé animé */}
      <circle
        cx={country.cx}
        cy={country.cy}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="1.2"
        strokeDasharray="6 5"
        style={{ animation: 'zeeShimmer 4s ease-in-out infinite' }}
      />
      {/* Second anneau — plus grand, très transparent */}
      <circle
        cx={country.cx}
        cy={country.cy}
        r={r * 1.35}
        fill="none"
        stroke={hexToInfluenceFill(country.couleur, 0.18)}
        strokeWidth="0.7"
        strokeDasharray="3 8"
        style={{ animation: 'zeeShimmer 6s ease-in-out infinite reverse' }}
      />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : GLOW RING (anneau de sélection)
// ─────────────────────────────────────────────────────────────────────────────

function GlowRing({ country }) {
  if (!country) return null;
  return (
    <path
      d={country.svgPath}
      className="country-glow-ring"
      stroke={country.couleur}
      fill="none"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : COUCHE PAYS (paths + labels + jauges)
// ─────────────────────────────────────────────────────────────────────────────

function CountriesLayer({ countries, selectedId, onCountryClick, onCountryHover, hoveredId }) {
  return (
    <g className="countries-layer">
      {countries.map(c => {
        const isSelected = c.id === selectedId;
        const isHovered  = c.id === hoveredId;
        const satColor   = satisfactionStroke(c.satisfaction);

        // Taille du label selon la population
        const labelSize = Math.max(7, Math.min(11, 7 + c.population / 5_000_000));
        // Largeur de la jauge satisfaction proportionnelle à la taille du pays
        const gaugeW    = c.size * 1.2;
        const gaugeH    = 3;
        const gaugeY    = c.cy + c.size * 0.82;
        const gaugeX    = c.cx - gaugeW / 2;

        return (
          <g key={c.id} style={{ cursor: 'pointer' }}>
            {/* Glow ring derrière le path (sélection ou hover) */}
            {(isSelected || isHovered) && (
              <path
                d={c.svgPath}
                className="country-glow-ring"
                stroke={c.couleur}
                fill="none"
                style={{
                  strokeWidth: isSelected ? '14px' : '8px',
                  opacity: isSelected ? 0.20 : 0.10,
                }}
              />
            )}

            {/* Path principal du pays */}
            <path
              d={c.svgPath}
              className={`country-path${isSelected ? ' selected' : ''}`}
              fill={c.couleur}
              fillOpacity={isSelected ? 0.82 : isHovered ? 0.70 : 0.55}
              stroke={isSelected ? 'rgba(255,255,255,0.65)' : c.couleur}
              strokeWidth={isSelected ? 2.2 : 1.0}
              onClick={() => onCountryClick(c)}
              onMouseEnter={() => onCountryHover(c.id)}
              onMouseLeave={() => onCountryHover(null)}
            />

            {/* Jauge satisfaction (barre sous le pays) */}
            <rect
              x={gaugeX} y={gaugeY}
              width={gaugeW} height={gaugeH}
              fill="rgba(0,0,0,0.55)"
              rx="1.5"
              className="humeur-bar-bg"
            />
            <rect
              x={gaugeX} y={gaugeY}
              width={gaugeW * (c.satisfaction / 100)} height={gaugeH}
              fill={satColor}
              rx="1.5"
              className="humeur-bar-fill"
            />

            {/* Badge popularité */}
            <circle
              cx={c.cx + c.size * 0.62}
              cy={c.cy - c.size * 0.62}
              r={7}
              fill={satColor}
              className="pop-badge-circle"
              opacity="0.92"
            />
            <text
              x={c.cx + c.size * 0.62}
              y={c.cy - c.size * 0.62}
              className="pop-badge-text"
            >
              {c.satisfaction}
            </text>

            {/* Label nom du pays */}
            <text
              x={c.cx}
              y={c.cy - c.size * 0.12}
              className="country-label"
              fill={isSelected ? '#FFFFFF' : 'rgba(220,228,240,0.88)'}
              fontSize={labelSize}
            >
              {c.emoji} {c.nom.split(' ').slice(0, 2).join(' ')}
            </text>

            {/* Année / population */}
            <text
              x={c.cx}
              y={c.cy + c.size * 0.22}
              className="country-year"
              fontSize="6.5"
            >
              {fmtPop(c.population)} · {c.annee}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : BADGES RESSOURCES FLOTTANTS
//  Affichés uniquement pour le pays sélectionné
// ─────────────────────────────────────────────────────────────────────────────

function ResourceBadges({ country }) {
  if (!country) return null;

  const presentRes = RESOURCE_KEYS.filter(k => country.ressources?.[k]);
  if (presentRes.length === 0) return null;

  // Disposition en arc au-dessus du pays
  const total  = presentRes.length;
  const startX = country.cx - (total - 1) * 14;
  const baseY  = country.cy - country.size - 18;

  return (
    <g className="resource-badges-layer">
      {presentRes.map((k, i) => (
        <text
          key={k}
          x={startX + i * 28}
          y={baseY}
          className="resource-map-icon"
          fontSize="11"
          textAnchor="middle"
          title={k}
        >
          {RES_ICONS[k]}
        </text>
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : TOOLTIP AU SURVOL
// ─────────────────────────────────────────────────────────────────────────────

function MapTooltip({ country, mousePos }) {
  if (!country || !mousePos) return null;

  const W_TIP = 130;
  const H_TIP = 48;
  // Décalage pour éviter le curseur
  let tx = mousePos.x + 14;
  let ty = mousePos.y - 28;
  // Clamp dans le viewport
  if (tx + W_TIP > SVG_W - 10) tx = mousePos.x - W_TIP - 10;
  if (ty < 8) ty = mousePos.y + 14;

  const humeur = getHumeur(country.satisfaction);

  return (
    <g className="tooltip-layer" style={{ pointerEvents: 'none' }}>
      <rect
        x={tx} y={ty}
        width={W_TIP} height={H_TIP}
        rx="2"
        className="map-tooltip-bg"
      />
      <text x={tx + W_TIP / 2} y={ty + 14} className="map-tooltip-name">
        {country.emoji} {country.nom.split(' ').slice(0, 3).join(' ')}
      </text>
      <text
        x={tx + W_TIP / 2} y={ty + 30}
        className="map-tooltip-mood"
        fill={humeur.color}
        fontSize="8"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {humeur.label} · {country.satisfaction}%
      </text>
      <text
        x={tx + W_TIP / 2} y={ty + 42}
        className="map-tooltip-mood"
        fill="rgba(90,110,150,0.85)"
        fontSize="7"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {country.regimeName}
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : LÉGENDE
// ─────────────────────────────────────────────────────────────────────────────

function MapLegend({ countries }) {
  if (!countries || countries.length === 0) return null;
  const x = 16, y = SVG_H - 90;

  return (
    <g className="legend-layer">
      <rect x={x} y={y} width={160} height={80} rx="2" className="map-legend-bg" />
      <text x={x + 10} y={y + 14} className="map-legend-title">LÉGENDE</text>

      {/* Alliance */}
      <line x1={x + 10} y1={y + 26} x2={x + 35} y2={y + 26}
        stroke="#00FF88" strokeWidth="1.6" strokeDasharray="5 4" />
      <text x={x + 42} y={y + 30} className="map-legend-label" fontSize="7.5">Alliance</text>

      {/* Tension */}
      <line x1={x + 10} y1={y + 40} x2={x + 35} y2={y + 40}
        stroke="#FF3A3A" strokeWidth="2" strokeDasharray="6 3" />
      <text x={x + 42} y={y + 44} className="map-legend-label" fontSize="7.5">Tension</text>

      {/* Neutre */}
      <line x1={x + 10} y1={y + 54} x2={x + 35} y2={y + 54}
        stroke="#C8A44A" strokeWidth="1.2" strokeDasharray="3 5" strokeOpacity="0.5" />
      <text x={x + 42} y={y + 58} className="map-legend-label" fontSize="7.5">Neutre</text>

      {/* ZEE */}
      <ellipse cx={x + 22} cy={y + 70} rx="12" ry="5"
        fill="rgba(48,150,215,0.12)" stroke="rgba(48,150,215,0.35)"
        strokeWidth="0.8" strokeDasharray="3 3" />
      <text x={x + 42} y={y + 73} className="map-legend-label" fontSize="7.5">Zone maritime (ZEE)</text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL : MapSVG
//  Reçoit tout en props — aucun state interne sauf hover/tooltip
// ─────────────────────────────────────────────────────────────────────────────

export function MapSVG({
  worldData,
  countries,
  alliances,
  selectedCountry,
  onCountryClick,
  onCountryHover,
  W = SVG_W,
  H = SVG_H,
}) {
  const [hoveredId,  setHoveredId]  = useState(null);
  const [mousePos,   setMousePos]   = useState(null);
  const svgRef = useRef(null);

  // Coordonnées souris en espace SVG
  const handleMouseMove = useCallback((e) => {
    const svg  = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = SVG_W / rect.width;
    const scaleY = SVG_H / rect.height;
    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setMousePos(null);
  }, []);

  const handleHover = useCallback((id) => {
    setHoveredId(id);
    if (!id) setMousePos(null);
  }, []);

  const hoveredCountry = countries.find(c => c.id === hoveredId) || null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Defs globaux ── */}
      <defs>
        {/* Filtre de flou pour ombres */}
        <filter id="blur-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="blur-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* ── 1. Fond océan ── */}
      <OceanLayer W={SVG_W} H={SVG_H} />

      {/* ── 2. Topographie immuable ── */}
      <TopographyLayer worldData={worldData} />

      {/* ── 3. ZEE des pays côtiers ── */}
      <ZeeLayer countries={countries} />

      {/* ── 4. Cercle d'influence du pays sélectionné ── */}
      <InfluenceCircle country={selectedCountry} />

      {/* ── 5. Lignes diplomatiques (pays sélectionné uniquement) ── */}
      <DiplomacyLines
        countries={countries}
        selectedId={selectedCountry?.id}
        alliances={alliances}
      />

      {/* ── 6. Pays (paths + jauges + labels) ── */}
      <CountriesLayer
        countries={countries}
        selectedId={selectedCountry?.id}
        hoveredId={hoveredId}
        onCountryClick={onCountryClick}
        onCountryHover={handleHover}
      />

      {/* ── 7. Badges ressources du pays sélectionné ── */}
      <ResourceBadges country={selectedCountry} />

      {/* ── 8. Tooltip au survol ── */}
      {hoveredId && hoveredCountry && (
        <MapTooltip country={hoveredCountry} mousePos={mousePos} />
      )}

      {/* ── 9. Légende ── */}
      <MapLegend countries={countries} />
    </svg>
  );
}

export default MapSVG;
