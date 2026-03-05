// ═══════════════════════════════════════════════════════════════════════════
//  Dashboard.jsx — Partie 1 / 3
//  Données · État global · Moteur de calcul · Générateurs
//  (Partie 2 : rendu SVG — Partie 3 : écrans & modales)
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import AGENTS from '../templates/base_agents.json';
import STATS  from '../templates/base_stats.json';
import { LOCAL_EVENTS, LOCAL_DELIBERATION, LOCAL_COUNTRIES } from './ariaData';

// ─────────────────────────────────────────────────────────────────────────────
//  1. CONSTANTES DÉRIVÉES DES JSON
// ─────────────────────────────────────────────────────────────────────────────

export const MINISTERS   = AGENTS.ministers;
export const MINISTRIES  = AGENTS.ministries;
export const PRESIDENCY  = AGENTS.presidency;
export const REGIMES     = STATS.regimes;
export const TERRAINS    = STATS.terrains;
export const HUMEURS     = STATS.humeurs;       // tableau trié min décroissant
export const CYCLES_CFG  = STATS.calculs_cycles;
export const PAYS_LOCAUX = LOCAL_COUNTRIES;

// Clés de ressources dans l'ordre d'affichage UI
export const RESOURCE_KEYS = [
  'agriculture', 'bois', 'eau', 'energie', 'mineraux', 'peche', 'petrole',
];

// Positions de départ distribuées pour les 3 pays locaux
// Ajustées dynamiquement au viewport en Partie 2, ici en coordonnées SVG 1400×800
const LOCAL_SPAWN = {
  valoria:   { cx: 280, cy: 320 },   // ouest, côtier
  eldoria:   { cx: 700, cy: 220 },   // centre-nord, montagneux
  thalassia: { cx: 1080, cy: 480 },  // est, archipel
};

// ─────────────────────────────────────────────────────────────────────────────
//  2. UTILITAIRES SEED / ALÉATOIRE REPRODUCTIBLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PRNG léger (mulberry32) — retourne un float [0,1) depuis un seed entier.
 * Utilisé partout pour garantir la reproductibilité des formes.
 */
export function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Génère un seed depuis une chaîne (nom de pays, id…) */
export function strToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

/** Float aléatoire dans [min, max] depuis un rand() */
export const randRange = (rand, min, max) => min + rand() * (max - min);

/** Entier aléatoire dans [min, max] */
export const randInt = (rand, min, max) => Math.floor(randRange(rand, min, max + 1));

/** Tirage booléen avec probabilité p */
export const randBool = (rand, p = 0.5) => rand() < p;

// ─────────────────────────────────────────────────────────────────────────────
//  3. GÉNÉRATION TOPOGRAPHIQUE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère un path SVG organique pour un continent ou un pays.
 *
 * @param {number} cx      - Centre X en coordonnées SVG
 * @param {number} cy      - Centre Y
 * @param {number} size    - Rayon de base
 * @param {number} seed    - Seed pour la reproductibilité
 * @param {number} points  - Nombre de sommets (8-14 recommandé)
 * @param {number} noise   - Amplitude du bruit (0.15–0.45)
 * @returns {string}       - Attribut `d` du path SVG
 */
export function genOrganicPath(cx, cy, size, seed, points = 10, noise = 0.32) {
  const rand = seededRand(seed);
  const pts  = [];

  for (let i = 0; i < points; i++) {
    const angle  = (i / points) * Math.PI * 2 - Math.PI / 2;
    // Perturbation sinusoïdale + aléatoire pour rendu naturel
    const jitter = 1 + (rand() * 2 - 1) * noise
                     + Math.sin(seed * 0.01 + i * 1.8) * noise * 0.5;
    const r = size * jitter;
    pts.push([
      cx + Math.cos(angle) * r,
      cy + Math.sin(angle) * r,
    ]);
  }

  // Courbes de Bézier quadratiques pour adoucir les angles
  const d = pts.map((p, i) => {
    const next = pts[(i + 1) % pts.length];
    const mx   = (p[0] + next[0]) / 2;
    const my   = (p[1] + next[1]) / 2;
    return `${i === 0 ? 'M' : 'Q'} ${p[0].toFixed(1)},${p[1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }).join(' ') + ' Z';

  return d;
}

/**
 * Génère la topographie complète du monde.
 * Retourne un objet IMMUABLE stocké dans worldData — jamais recalculé.
 *
 * @param {number} seed  - Seed global de la session
 * @param {number} W     - Largeur du viewport SVG
 * @param {number} H     - Hauteur du viewport SVG
 */
export function generateWorld(seed, W = 1400, H = 800) {
  const rand = seededRand(seed);

  // ── Continents (2 à 4 masses terrestres principales) ──────────────────────
  const numContinents = randInt(rand, 2, 4);
  const continents    = [];
  const margin        = 120;

  // Zones d'exclusion pour éviter les overlaps grossiers
  const placed = [];
  const tooClose = (cx, cy, minDist) =>
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

  // ── Îles (3 à 7 petites masses) ────────────────────────────────────────────
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

  // ── Fleuves (1 par continent, Bézier cubique) ──────────────────────────────
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

  // ── Clusters de montagnes (1-2 par continent) ──────────────────────────────
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

  // ── Zones de spawn disponibles (centre de chaque masse terrestre) ──────────
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

  // Filtre par type si demandé (ex: 'island' pour un pays insulaire)
  let candidates = preferredType
    ? spawnZones.filter(z => z.type === preferredType)
    : [...spawnZones];

  // Fallback si aucun candidat du bon type
  if (candidates.length === 0) candidates = [...spawnZones];

  // Trie par distance max aux pays existants (placement le plus éloigné)
  candidates.sort((a, b) => {
    const distA = occupied.length
      ? Math.min(...occupied.map(o => Math.hypot(o.cx - a.cx, o.cy - a.cy)))
      : 9999;
    const distB = occupied.length
      ? Math.min(...occupied.map(o => Math.hypot(o.cx - b.cx, o.cy - b.cy)))
      : 9999;
    return distB - distA;   // plus éloigné en premier
  });

  const zone = candidates[0];
  // Légère dispersion aléatoire autour du centre de la zone
  const rand  = seededRand(Date.now() % 99999);
  const jitter = zone.size * 0.3;
  return {
    cx: zone.cx + randRange(rand, -jitter, jitter),
    cy: zone.cy + randRange(rand, -jitter, jitter),
    zoneId: zone.id,
    zoneType: zone.type,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. GÉNÉRATION D'UN PAYS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule les ressources d'un pays selon son terrain et son seed.
 * Ressources garanties toujours présentes, ressources possibles tirées aléatoirement.
 */

// ─────────────────────────────────────────────────────────────────────────────
//  LÉGITIMITÉ ARIA — Double indice Think-Tank (IRL) / In-Game (dynamique)
//
//  aria_irl     : ancre fixe — donnée sociologique réelle (pays réels)
//                 ou estimation déterministe (pays fictifs)
//  aria_current : taux in-game, part de l'IRL, évolue avec inertie culturelle
//
//  Inertie : un pays IRL bas (<40) résiste plus à la hausse.
//  Divergence présidentielle = choc de légitimité (−3 à −4 pts).
//  Convergence = signal de clarté (+2 à +3 pts).
//  Dérive passive à chaque cycle : mean-reversion vers IRL + drift satisfaction.
// ─────────────────────────────────────────────────────────────────────────────

// Base IRL par régime pour les pays FICTIFS (déterministe, sans texte sociologique)
const REGIME_ARIA_BASE_IRL = {
  democratie_liberale:          48,
  republique_federale:          44,
  monarchie_constitutionnelle:  38,
  technocratie_ia:              72,
  oligarchie:                   26,
  junte_militaire:              16,
  regime_autoritaire:           20,
  monarchie_absolue:            28,
  theocracie:                   18,
  communisme:                   32, // Méfiance envers tout contrôle algorithmique non-étatique
  nationalisme_autoritaire:     12, // Rejet idéologique fort d'une délibération "froide" et supranationale
};

/**
 * Calcule le taux IRL pour un pays FICTIF (déterministe).
 * Les pays réels ont leur taux fourni directement dans aria_acceptance_irl.
 */
export function calcAriaIRL(country) {
  const base     = REGIME_ARIA_BASE_IRL[country.regime] ?? 35;
  const satBonus = (country.satisfaction - 50) * 0.28;
  const ecoBonus = ((country.economie || 100) - 100) * 0.06;
  const island   = ['island', 'archipelago'].includes(country.terrain) ? 4 : 0;
  return Math.round(Math.max(5, Math.min(95, base + satBonus + ecoBonus + island)));
}

/**
 * Moteur de fluctuation in-game — appelé après chaque référendum.
 *
 * @param {number}  current    - taux in-game actuel
 * @param {number}  irl        - ancre IRL immuable
 * @param {'oui'|'non'|null} vote
 * @param {boolean} convergent - Phare et Boussole convergents ?
 */
export function fluctuateAria(current, irl, vote, convergent = true) {
  // Coefficient d'inertie : résistance culturelle freine la HAUSSE uniquement
  // IRL 30 → 0.50 | IRL 50 → 0.72 | IRL 75 → 1.0
  const inertia = Math.max(0.40, Math.min(1.0, irl / 75));

  let delta = 0;
  if (vote === 'oui') {
    delta = convergent ? +3.0 : +1.5;   // convergence = signal fort
  } else if (vote === 'non') {
    delta = convergent ? -1.2 : -3.8;   // divergence imposée = choc de légitimité
  }

  const adjusted = delta > 0 ? delta * inertia : delta;
  return Math.round(Math.max(5, Math.min(95, current + adjusted)));
}

/**
 * Dérive passive à chaque cycle +5 ans.
 * Mean-reversion douce vers l'ancre IRL + drift satisfaction.
 */
export function driftAria(current, irl, satisfaction) {
  const reversion = (irl - current) * 0.05;
  const satDrift  = satisfaction > 65 ? +0.4 : satisfaction < 40 ? -0.35 : 0;
  return Math.round(Math.max(5, Math.min(95, current + reversion + satDrift)));
}

export function calcRessources(terrain, seed) {
  const cfg  = TERRAINS[terrain] || TERRAINS.inland;
  const rand = seededRand(seed + 7777);
  const res  = {};

  RESOURCE_KEYS.forEach(k => { res[k] = false; });

  // Ressources garanties par le terrain
  (cfg.ressources_garanties || []).forEach(k => {
    if (RESOURCE_KEYS.includes(k)) res[k] = true;
  });

  // Ressources possibles tirées avec 55% de chance chacune
  (cfg.ressources_possibles || []).forEach(k => {
    if (RESOURCE_KEYS.includes(k) && !res[k]) {
      res[k] = randBool(rand, 0.55);
    }
  });

  return res;
}

/**
 * Construit un objet pays complet depuis un template `pays_locaux`.
 * Utilisé en mode local (sans clé API).
 */
export function buildCountryFromLocal(template, worldData) {
  const seed     = strToSeed(template.id);
  const regime   = REGIMES[template.regime] || REGIMES.republique_federale;
  const terrain  = TERRAINS[template.terrain] || TERRAINS.coastal;
  const spawn    = LOCAL_SPAWN[template.id] || { cx: 400, cy: 300 };

  // Adaptation au viewport réel
  const scaleX = (worldData?.W || 1400) / 1400;
  const scaleY = (worldData?.H || 800)  / 800;
  const cx     = spawn.cx * scaleX;
  const cy     = spawn.cy * scaleY;

  const size   = 55 + (template.population / 1_000_000) * 2.5;
  const coastal = ['coastal', 'island', 'archipelago'].includes(template.terrain);

  return {
    id:           template.id,
    nom:          template.nom,
    emoji:        template.emoji,
    couleur:      template.couleur || `hsl(${Math.abs(seed) % 360}, 55%, 34%)`,
    regime:       template.regime,
    regimeName:   regime.name,
    regimeEmoji:  regime.emoji,
    terrain:      template.terrain,
    terrainName:  terrain.name,
    coastal,
    description:  template.description,
    leader:       template.leader,
    annee:        STATS.global_start.annee,
    population:   template.population,
    tauxNatalite: template.tauxNatalite,
    tauxMortalite:template.tauxMortalite,
    satisfaction: template.satisfaction,
    humeur:       getHumeur(template.satisfaction).label,
    humeur_color: getHumeur(template.satisfaction).color,
    popularite:   STATS.global_start.popularite,
    ressources:   calcRessources(template.terrain, seed),
    coefficients: regime.poids_ministeriel,
    cx, cy, size,
    seed,
    svgPath: genOrganicPath(cx, cy, size, seed, 11, 0.30),
    influenceRadius: calcInfluenceRadius(template.population, coastal, calcRessources(template.terrain, seed)),
    relations: {},   // { countryId: 'Alliance' | 'Neutre' | 'Tension' }
    chronolog: [],   // historique des événements
    economie:     100,
    isLocal:      true,
    // Légitimité ARIA — calculée après, on a besoin de l'objet complet
    aria_irl:     null,
    aria_current: null,
  };
}

/**
 * Construit un pays depuis les données JSON retournées par l'IA.
 */
export function buildCountryFromAI(aiData, worldData, existingCountries) {
  const seed    = strToSeed(aiData.nom + Date.now());
  const terrain = aiData.terrain || 'coastal';
  const regime  = REGIMES[aiData.regime] || REGIMES.democratie_liberale;
  const coastal = ['coastal', 'island', 'archipelago'].includes(terrain);

  const preferredType = ['island', 'archipelago'].includes(terrain) ? 'island' : 'continent';
  const spawn   = findSpawnPoint(worldData, existingCountries, preferredType);
  const { cx, cy } = spawn;

  const size    = 45 + (aiData.population / 1_000_000) * 2;
  const res     = aiData.ressources
    ? Object.fromEntries(RESOURCE_KEYS.map(k => [k, !!(aiData.ressources[k])]))
    : calcRessources(terrain, seed);

  return {
    id:           aiData.nom.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    nom:          aiData.nom,
    emoji:        aiData.emoji || '🌍',
    couleur:      aiData.couleur || '#4A7EC8',
    regime:       aiData.regime || 'republique_federale',
    regimeName:   regime.name,
    regimeEmoji:  regime.emoji,
    terrain,
    terrainName:  TERRAINS[terrain]?.name || terrain,
    coastal,
    description:  aiData.description || '',
    leader:       aiData.leader || null,
    annee:        STATS.global_start.annee,
    population:   aiData.population || 5_000_000,
    tauxNatalite: aiData.tauxNatalite || regime.taux_natalite * 1000,
    tauxMortalite:aiData.tauxMortalite || regime.taux_mortalite * 1000,
    satisfaction: aiData.satisfaction || 55,
    humeur:       getHumeur(aiData.satisfaction || 55).label,
    humeur_color: getHumeur(aiData.satisfaction || 55).color,
    popularite:   STATS.global_start.popularite,
    ressources:   res,
    coefficients: aiData.coefficients || regime.poids_ministeriel,
    cx, cy, size, seed,
    svgPath: genOrganicPath(cx, cy, size, seed, 11, 0.30),
    influenceRadius: calcInfluenceRadius(aiData.population || 5_000_000, coastal, res),
    relations: {},
    chronolog: [],
    economie:     100,
    isLocal:      false,
    aria_irl:     null,   // fourni par l'IA ou calculé en fallback
    aria_current: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  5. FONCTIONS PURES DU MOTEUR
// ─────────────────────────────────────────────────────────────────────────────

/** Mappe un score de satisfaction sur un objet humeur {label, color} */
export function getHumeur(score) {
  for (const h of HUMEURS) {
    if (score >= h.min) return h;
  }
  return HUMEURS[HUMEURS.length - 1];
}

/** Calcule le rayon d'influence (cercle pointillé au clic) */
export function calcInfluenceRadius(population, coastal, ressources) {
  const base     = 45 + (population / 1_000_000) * 3;
  const maritime = coastal ? 22 : 0;
  const resCount = Object.values(ressources).filter(Boolean).length;
  return Math.min(Math.round(base + maritime + resCount * 4), 130);
}
export function applyEventImpact(country, impact) {
  const newSat = Math.max(0, Math.min(100, country.satisfaction + (impact.satisfaction || 0)));

  // On récupère l'humeur mise à jour basée sur la nouvelle satisfaction
  const updatedHumeur = getHumeur(newSat);

  return {
    ...country,
    satisfaction:  newSat,
    humeur:        updatedHumeur.label,
    humeur_color:  updatedHumeur.color,
    popularite:    Math.max(0,  Math.min(100, country.popularite + (impact.popularite || 0))),
    // On initialise l'économie à 100 si elle n'existe pas encore
    economie:      Math.max(20, Math.min(200, (country.economie || 100) + (impact.economie || 0))),
    // Gestion des catastrophes (population_delta)
    population:    Math.max(100, country.population + (impact.population_delta || 0)),
  };
}



/**
 * Calcule le delta satisfaction pour un cycle de 5 ans.
 * Applique les poids ministériels du régime, les impacts ressources,
 * alliances/conflits, et un bruit aléatoire contrôlé.
 */
export function calcSatisfactionDelta(country, alliances) {
  const cfg    = CYCLES_CFG;
  const regime = REGIMES[country.regime] || REGIMES.republique_federale;
  const poids  = regime.poids_ministeriel;

  // Dérive de base modulée par le coefficient de satisfaction du régime
  let delta = cfg.derive_satisfaction_base * regime.coeff_satisfaction;

  // Impact ressources présentes/absentes pondéré par les ministères concernés
  const resMinisters = {
    agriculture: poids.sante    * 0.5 + poids.economie * 0.5,
    bois:        poids.ecologie * 0.6 + poids.economie * 0.4,
    eau:         poids.sante    * 0.8 + poids.ecologie * 0.2,
    energie:     poids.economie * 0.7 + poids.ecologie * 0.3,
    mineraux:    poids.economie * 0.6 + poids.defense  * 0.4,
    peche:       poids.sante    * 0.5 + poids.economie * 0.5,
    petrole:     poids.economie * 0.8 + poids.defense  * 0.2,
  };

  Object.entries(country.ressources).forEach(([k, present]) => {
    const weight = resMinisters[k] || 1.0;
    delta += present
      ? cfg.impact_ressource_presente  * weight * 0.4
      : cfg.impact_ressource_absente   * weight * 0.3;
  });

  // Impact relations diplomatiques
  Object.values(country.relations || {}).forEach(type => {
    if (type === 'Alliance') delta += cfg.impact_alliance;
    if (type === 'Tension')  delta += cfg.impact_conflit;
  });

  // Bruit aléatoire contrôlé [−bruit_max, +bruit_max]
  const noise = (Math.random() * 2 - 1) * cfg.bruit_max;
  delta += noise;

  return Math.round(delta * 10) / 10;
}

/**
 * Applique un cycle de +5 ans à un pays.
 * Retourne le nouveau pays (immutable update).
 */
export function doCycle(country, alliances) {
  const regime = REGIMES[country.regime] || REGIMES.republique_federale;
  const terrain= TERRAINS[country.terrain] || TERRAINS.inland;

  // Croissance démographique
  const natalite  = (country.tauxNatalite  / 1000) * 5;
  const mortalite = (country.tauxMortalite / 1000) * 5;
  const growthMod = terrain.modificateur_pop * regime.coeff_croissance;
  const newPop    = Math.round(country.population * (1 + (natalite - mortalite) * growthMod));


  // Économie — dérive selon terrain + ressources + régime
  const ecoBase   = terrain.modificateur_eco * regime.coeff_croissance;
  const ecoRatio  = Object.values(country.ressources).filter(Boolean).length / 7;
  const ecoDelta  = (ecoBase - 1) * 8 + (ecoRatio - 0.5) * 6 + (Math.random() * 4 - 2);
  const newEco    = Math.max(20, Math.min(200, (country.economie || 100) + ecoDelta));

  // Satisfaction
  const satDelta  = calcSatisfactionDelta(country, alliances);
  const newSat    = Math.max(0, Math.min(100, country.satisfaction + satDelta));

  // Humeur mise à jour
  const humeurObj = getHumeur(newSat);

  // Popularité — dérive légère liée à la satisfaction
  const popDelta  = satDelta * 0.4 + (Math.random() * 2 - 1) * 2;
  const newPop2   = Math.max(0, Math.min(100, country.popularite + popDelta));

  return {
    ...country,
    annee:        country.annee + 5,
    population:   newPop,
    satisfaction: Math.round(newSat),
    humeur:       humeurObj.label,
    humeur_color: humeurObj.color,
    popularite:   Math.round(newPop2),
    economie: Math.round(newEco),
    // Le svgPath est INCHANGÉ — la forme ne bouge pas
    svgPath:      country.svgPath,
    influenceRadius: calcInfluenceRadius(newPop, country.coastal, country.ressources),
  };
}

/**
 * Vérifie si un pays a franchi un seuil critique après un cycle.
 * Retourne la liste des déclencheurs IA détectés.
 */
export function checkSeuils(before, after) {
  const triggers = [];
  const cfg      = CYCLES_CFG;

  // Détresse sociale : satisfaction passe sous 20%
  if (before.satisfaction >= cfg.seuil_revolte && after.satisfaction < cfg.seuil_revolte) {
    triggers.push({ type: 'revolte', pays: after });
  }

  // Explosion démographique : population ×2 en un cycle (5 ans)
  if (after.population >= before.population * cfg.seuil_crise_demo / 100) {
    triggers.push({ type: 'demo_explosion', pays: after });
  }

  return triggers;
}

// ─────────────────────────────────────────────────────────────────────────────
//  6. MOTEUR IA
// ─────────────────────────────────────────────────────────────────────────────

/** Récupère les clés API depuis localStorage */
export function getApiKeys() {
  try {
    return JSON.parse(localStorage.getItem('aria_api_keys') || '{}');
  } catch { return {}; }
}

/** Construit le prompt IA de création d'un pays */
export function buildCountryPrompt(type, nomDemande = '') {
  const isReal = type === 'reel' && nomDemande;

  const contextBlock = isReal
    ? `CONSIGNE — PAYS RÉEL :
Le joueur a demandé "${nomDemande}".
Génère son portrait ARIA basé sur tes connaissances actuelles :
- Régime politique actuel, dirigeant en fonction, situation économique réelle.
- Satisfaction populaire estimée selon la situation politique du moment.
- Terrain cohérent avec la géographie (coastal si accès mer, island si île...).
- Ressources naturelles dominantes réelles.
- Coefficients ministériels reflétant les priorités politiques actuelles.`
    : `CONSIGNE — PAYS FICTIF :
Crée un pays fictif crédible et original. Invente un nom, une histoire, une identité propre.`;

  return `Tu es un générateur de données géopolitiques pour le jeu de simulation ARIA.
${contextBlock}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires, sans texte avant ou après.
{
  "nom": "${isReal ? nomDemande : 'string — nom inventé, original'}",
  "emoji": "un seul emoji représentatif",
  "couleur": "#RRGGBB — couleur sombre et saturée, visible sur fond noir",
  "regime": "une valeur parmi : democratie_liberale | republique_federale | monarchie_constitutionnelle | monarchie_absolue | technocratie_ia | oligarchie | junte_militaire | regime_autoritaire | theocracie | communisme | nationalisme_autoritaire",
  "terrain": "une valeur parmi : coastal | inland | island | archipelago | highland",
  "description": "une phrase de 15-25 mots, ton journalistique, situation actuelle",
  "leader": {
    "nom": "prénom et nom ${isReal ? '(dirigeant actuel si connu)' : 'inventé'}",
    "titre": "titre officiel exact",
    "trait": "une phrase sur sa philosophie ou style de gouvernance"
  },
  "population": "entier — réaliste pour ce pays",
  "tauxNatalite": "float entre 6.0 et 40.0 — réaliste",
  "tauxMortalite": "float entre 3.0 et 20.0 — réaliste",
  "satisfaction": "entier 15-85 — cohérent avec la situation politique actuelle",
  "aria_acceptance": "entier 10-90 — probabilité d'acceptation d'un gouvernement IA délibératif par la population",
  "ressources": {
    "agriculture": "0 ou 1", "bois": "0 ou 1", "eau": "0 ou 1",
    "energie": "0 ou 1", "mineraux": "0 ou 1", "peche": "0 ou 1", "petrole": "0 ou 1"
  },
  "coefficients": {
    "justice": "float 0.6-1.5", "economie": "float 0.6-1.5", "defense": "float 0.6-1.5",
    "sante": "float 0.6-1.5", "education": "float 0.6-1.5", "ecologie": "float 0.6-1.5"
  }
}`;
}

export function buildEventPrompt(trigger) {
  const { type, pays } = trigger;

  const contexts = {
    revolte: `Le pays "${pays.nom}" (${pays.regimeName}) est au bord de la révolte. Satisfaction à ${pays.satisfaction}%, population ${(pays.population / 1_000_000).toFixed(1)} M, année ${pays.annee}.`,
    demo_explosion: `Le pays "${pays.nom}" connaît une explosion démographique incontrôlée. Population passée de ${(pays.population * 0.5 / 1_000_000).toFixed(1)} M à ${(pays.population / 1_000_000).toFixed(1)} M en 5 ans.`,
    alliance_rompue: `L'alliance entre "${pays.nom}" et "${trigger.avec}" vient d'être rompue. Tensions diplomatiques maximales.`,
    secession: `La sécession de "${pays.nom}" depuis "${trigger.parent}" vient d'être validée. Une nouvelle entité politique naît.`,
  };

  return `Tu es l'IA de Gouvernance ARIA. Tu analyses les crises géopolitiques avec froideur et précision.

Situation : ${contexts[type] || `Événement critique dans le pays "${pays.nom}".`}

Génère une notification d'analyse en JSON :
{
  "titre": "4 à 6 mots, factuel et percutant",
  "texte": "exactement 2 phrases. Ton analytique, style rapport ARIA. Pas d'émotion, que des faits et des implications.",
  "severite": "une valeur parmi : info | warning | critical",
  "impact": { "satisfaction": "entier entre -15 et 5", "popularite": "entier entre -10 et 5" }
}`;
}

/**
 * Appelle l'API IA (Claude en priorité, Gemini en fallback).
 * Retourne l'objet JSON parsé ou null en cas d'échec.
 */
// ─────────────────────────────────────────────────────────────────────────────
//  2. MOTEUR D'INTELLIGENCE (API & LOCAL FALLBACK)
// ─────────────────────────────────────────────────────────────────────────────

// Appelle un modèle spécifique (Claude ou Gemini) via API
async function callModel(model, prompt, keys, systemPrompt = '') {
  // Redirect automatique si une seule clé disponible
  if (model === 'claude' && !keys.claude && keys.gemini) model = 'gemini';
  if (model === 'gemini' && !keys.gemini && keys.claude) model = 'claude';

  // 1. On prépare le contenu fusionné (Rôle + Données)
  const fullContent = systemPrompt
  ? `${systemPrompt}\n\n---\n\nDONNÉES À TRAITER :\n${prompt}`
  : prompt;

  if (model === 'claude' && keys.claude) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keys.claude,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: fullContent }],
        }),
      });
      const data = await res.json();
      const text = data?.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch (e) {
      console.warn('[ARIA] Claude error:', e.message);
      return { error: true, msg: getRandomFallback() };
    }
  }

  if (model === 'gemini' && keys.gemini) {
    const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    for (const gModel of GEMINI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${keys.gemini}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullContent }] }],
              generationConfig: { temperature: 0.8, maxOutputTokens: 1000 },
            }),
          }
        );
        if (!res.ok) {
          // 429 quota — pas de fallback utile, on retourne erreur gracieuse
          if (res.status === 429) return { error: true, msg: getRandomFallback() };
          continue; // autre erreur → essayer modèle suivant
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const clean = text.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
      } catch (e) {
        console.warn(`[ARIA] Gemini ${gModel} error:`, e.message);
        // continuer avec le modèle suivant
      }
    }
    return { error: true, msg: getRandomFallback() };
  }
  return { error: true, msg: "SYSTÈME : Aucune clé API valide détectée." };
}

// Pioche une réponse dans tes fichiers locaux (test.js) si pas d'IA
function getLocalResponse(type, context = {}) {
  const { ministerKey, ministryKey, role, situation = 'cycle_normal' } = context;
  let pool = [];

  if (type === 'ministre' && ministerKey)
    pool = LOCAL_DELIBERATION.ministers?.[ministerKey]?.[situation] || [];
  else if (type === 'synthese_ministere' && ministryKey)
    pool = LOCAL_DELIBERATION.ministries?.[ministryKey]?.[situation] || [];
  else if ((type === 'phare' || type === 'boussole') && role)
    pool = LOCAL_DELIBERATION.presidency?.[role]?.[situation] || [];
  else if (type === 'synthese_presidence')
    pool = LOCAL_DELIBERATION.presidency?.synthese?.[context.convergence ? 'convergence' : 'divergence'] || [];
  else if (type === 'evenement' && context.trigger)
    pool = LOCAL_EVENTS?.[context.trigger] || [];

  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : "ARIA : Silence radio du Conseil.";
}

export function getPromptsSys() {
  try {
    const saved = JSON.parse(localStorage.getItem('aria_prompts') || '{}');
    return { ...DEFAULT_PROMPTS_SYS, ...saved };
  } catch (e) {
    return { ...DEFAULT_PROMPTS_SYS };
  }
}

// Point d'entrée unique pour tous les appels IA du Dashboard
export async function callAI(prompt, type = 'standard', context = {}) {
  const opts = getOptions();
  const promptsSys = getPromptsSys(); // On récupère les prompts personnalisables
  const keys = opts.api_keys;
  const roles = opts.ia_roles;
  const hasKeys = !!(keys.claude || keys.gemini);

  // 1. Priorité au mode Board Game ou absence de clés
  if (!hasKeys || (opts.gameplay && opts.gameplay.mode_board_game)) {
    return getLocalResponse(type, context);
  }

  // 2. Dispatcher intelligent (on passe le modèle de Settings + le prompt système)
  switch (type) {
    case 'ministre':
      return callModel(roles.ministre_model || 'claude', prompt, keys);

    case 'synthese_ministere':
      return callModel(roles.synthese_min || 'gemini', prompt, keys, promptsSys.synthese_ministere);

    case 'phare':
      return callModel(roles.phare_model || 'claude', prompt, keys);

    case 'boussole':
      return callModel(roles.boussole_model || 'claude', prompt, keys);

    case 'synthese_presidence':
      return callModel(roles.synthese_pres || 'gemini', prompt, keys, promptsSys.synthese_presidence);

    case 'evenement':
      return callModel(roles.evenement_model || 'claude', prompt, keys);

    case 'factcheck':
      return callModel(roles.factcheck_model || 'gemini', prompt, keys, promptsSys.factcheck_evenement);

    case 'pays':
      // Génération de pays — utilise le modèle solo configuré (ou claude par défaut)
      return callModel(opts.solo_model || 'claude', prompt, keys);
    default:
      return callModel(opts.solo_model || 'claude', prompt, keys);
  }
}
export const DEFAULT_OPTIONS = {
  api_keys: { claude: '', gemini: '', grok: '', openai: '' },
  ia_mode: 'aria',
  solo_model: 'claude',
  ia_roles: {
    ministre_model:  'claude',
    synthese_min:    'gemini',
    phare_model:     'claude',
    boussole_model:  'claude',
    synthese_pres:   'gemini',
    evenement_model: 'claude',
    factcheck_model: 'gemini',
  },
  gameplay: {
    cycles_auto:     false,
    cycles_interval: 30,
    events_ia:       true,
    show_legend:     true,
    show_zee:        true,
    mode_board_game: true,
  },
  world: { nb_pays_defaut: 3 },
  defaultGovernance: {
    presidency:       'duale',
    ministries:       ['justice','economie','defense','sante','education','ecologie','chance'],
    crisis_ministry:  true,
  },
};

/** Prompts système par défaut (écrits par Settings, lus par callAI) */
const DEFAULT_PROMPTS_SYS = {
  synthese_ministere: `Tu es le système de synthèse institutionnelle du gouvernement ARIA.
  Tu reçois les positions de deux ministres du même ministère.
  Ton rôle : produire la SYNTHÈSE OFFICIELLE DU MINISTÈRE en 3-4 phrases.

  Règles :
  - Ton sobre, institutionnel, factuel — aucune rhétorique.
  - Parle au nom du ministère.
  - Si les deux positions sont irréconciliables, dis-le clairement.

  Réponds UNIQUEMENT au format JSON suivant :
  {
    "convergence": boolean,
    "synthese": "string (3-4 phrases)",
    "tension_residuelle": "string ou null",
    "recommandation": "string (1 phrase)"
  }`,
  synthese_presidence: `Tu es le système d'arbitrage présidentiel du gouvernement ARIA.

  Tu reçois les positions du PHARE (vision, direction, long terme)
  et de la BOUSSOLE (mémoire, protection, humanité).
  Ton rôle : déterminer s'il y a convergence ou divergence,
  puis formater la décision pour référendum citoyen.

  Règles :
  - Convergence : les deux positions aboutissent à la même décision
  même par des raisonnements différents
  - Divergence : les positions mènent à des choix incompatibles
  → le peuple reçoit les DEUX options distinctes
  - Ne tranche jamais toi-même — tu formats, tu n'arbitres pas
  - Langage citoyen, accessible, sans jargon institutionnel

  Réponds UNIQUEMENT au format JSON suivant :
  {
    "convergence": true | false,
    "position_phare_resume": "1 phrase résumant la position du Phare",
    "position_boussole_resume": "1 phrase résumant la position de la Boussole",
    "question_referendum": "La question exacte soumise au peuple (si convergence : 1 option, si divergence : 2 options)",
    "enjeu_principal": "1 phrase — ce qui est vraiment en jeu pour les citoyens"
  }`,
  factcheck_evenement: `Tu es le système de cohérence factuelle du gouvernement ARIA.

  Tu reçois un événement narratif généré par l'IA et les statistiques
  réelles du pays concerné.
  Ton rôle : vérifier que l'événement est cohérent avec les données,
  et l'ajuster si nécessaire.

  Vérifie :
  - L'impact chiffré est-il réaliste par rapport au niveau actuel ?
  (ex: satisfaction -20 sur un pays à 25% = impossible)
  - La sévérité correspond-elle à l'impact ?
  - Le texte mentionne-t-il des éléments contradictoires avec les stats ?

  Réponds UNIQUEMENT au format JSON suivant :
  {
    "coherent": true | false,
    "titre": "conservé ou corrigé",
    "texte": "conservé ou corrigé",
    "severite": "info | warning | critical",
    "impact": {
      "satisfaction": entier corrigé si nécessaire,
      "popularite": entier corrigé si nécessaire
    },
    "correction_appliquee": "null ou description de la correction"
  }`,
};

/** PROBLÈMES ACCÈS) */

const FALLBACK_PHRASES = [
  "ERREUR 404 : La conscience d'ARIA est partie prendre un café virtuel. Réessayez plus tard.",
  "SIGNAL PERDU : L'IA est actuellement en train de recalculer le sens de la vie (42).",
  "DÉFAILLANCE SYNAPTIQUE : Les serveurs d'ARIA boudent. Vérifiez vos clés API.",
  "FRONTIÈRE NUMÉRIQUE : Le Grand Pare-feu bloque nos transmissions diplomatiques.",
  "MOTEUR EN RADE : L'IA de synthèse a fondu un fusible. Retour au mode manuel.",
  "SILENCE RADIO : Les ministres sont en grève numérique pour une durée indéterminée."
];
const getRandomFallback = () => FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];

export function getOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem('aria_options') || '{}');
    // Merger aussi aria_api_keys (sauvegardé par InitScreen/APIKeyInline)
    const apiKeys = JSON.parse(localStorage.getItem('aria_api_keys') || '{}');
    return {
      ...DEFAULT_OPTIONS, ...saved,
      api_keys:          { ...DEFAULT_OPTIONS.api_keys, ...apiKeys, ...saved.api_keys },
      ia_roles:          { ...DEFAULT_OPTIONS.ia_roles, ...saved.ia_roles },
      gameplay:          { ...DEFAULT_OPTIONS.gameplay, ...saved.gameplay },
      world:             { ...DEFAULT_OPTIONS.world,    ...saved.world    },
      solo_model:        saved.solo_model || DEFAULT_OPTIONS.solo_model,
      defaultGovernance: { ...DEFAULT_OPTIONS.defaultGovernance, ...(saved.defaultGovernance || {}) },
    };
  } catch { return { ...DEFAULT_OPTIONS }; }
}

export function saveOptions(opts) {
  try { localStorage.setItem('aria_options', JSON.stringify(opts)); }
  catch { console.warn('[ARIA] Sauvegarde options impossible.'); }
}


// ─────────────────────────────────────────────────────────────────────────────
//  7. HOOK PRINCIPAL — useARIA
//  Centralise tout l'état du Dashboard et expose les handlers.
//  Utilisé par le composant Dashboard() principal.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS PERSISTANCE SESSION
//  Sauvegarde/restauration de la session en localStorage pour survivre au F5.
// ─────────────────────────────────────────────────────────────────────────────

function saveSession(seed, W, H, countries, alliances) {
  try {
    localStorage.setItem('aria_session_active', 'true');
    localStorage.setItem('aria_session_world',  JSON.stringify({ seed, W, H }));
    localStorage.setItem('aria_session_countries', JSON.stringify(countries));
    localStorage.setItem('aria_session_alliances', JSON.stringify(alliances));
  } catch (e) {
    console.warn('[ARIA] saveSession failed:', e);
  }
}

function loadSession() {
  try {
    const active = localStorage.getItem('aria_session_active');
    if (!active) return null;
    const worldRaw     = localStorage.getItem('aria_session_world');
    const countriesRaw = localStorage.getItem('aria_session_countries');
    const alliancesRaw = localStorage.getItem('aria_session_alliances');
    if (!worldRaw || !countriesRaw) return null;
    const { seed, W, H } = JSON.parse(worldRaw);
    const countries       = JSON.parse(countriesRaw);
    const alliances       = JSON.parse(alliancesRaw || '[]');
    if (!countries?.length) return null;
    return { seed, W: W || 1400, H: H || 800, countries, alliances };
  } catch { return null; }
}

function clearSession() {
  try {
    localStorage.removeItem('aria_session_active');
    localStorage.removeItem('aria_session_world');
    localStorage.removeItem('aria_session_countries');
    localStorage.removeItem('aria_session_alliances');
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER : construit des alliances par défaut basées sur l'idéologie et la proximité
// ─────────────────────────────────────────────────────────────────────────────

const REGIME_BLOC = {
  democratie_liberale: 'occident',
  republique_federale: 'occident',
  monarchie_constitutionnelle: 'occident',
  technocratie_ia: 'techno',
  oligarchie: 'autoritaire',
  junte_militaire: 'autoritaire',
  regime_autoritaire: 'autoritaire',
  monarchie_absolue: 'autoritaire',
  theocracie: 'autoritaire',
  communisme: 'est',
  nationalisme_autoritaire: 'autoritaire',
};

function buildDefaultAlliances(countries) {
  if (!countries || countries.length < 2) return [];
  const alliances = [];
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      const a = countries[i], b = countries[j];
      const blocA = REGIME_BLOC[a.regime] || 'neutral';
      const blocB = REGIME_BLOC[b.regime] || 'neutral';
      let type = 'Neutre';
      if (blocA === blocB && blocA !== 'neutral') type = 'Alliance';
      else if (blocA !== 'neutral' && blocB !== 'neutral' && blocA !== blocB) type = 'Tension';
      if (type !== 'Neutre') {
        alliances.push({ a: a.id, b: b.id, type });
      }
    }
  }
  return alliances;
}

function normalizeRealCountryTemplate(rc) {
  // Couleur déterministe depuis l'id pour garantir l'unicité
  const hue = Math.abs(strToSeed(rc.id || rc.nom || 'x')) % 360;
  return {
    id:           rc.id,
    nom:          rc.nom,
    emoji:        rc.flag || '🌍',
    couleur:      rc.couleur || `hsl(${hue}, 55%, 34%)`,
    regime:       rc.regime || 'democratie_liberale',
    terrain:      rc.terrain || 'coastal',
    description:  rc.aria_sociology_logic || rc.triple_combo || '',
    leader:       rc.leader || null,
    population:   rc.population || 5_000_000,
    tauxNatalite: rc.tauxNatalite ?? rc.natalite  ?? 11,
    tauxMortalite:rc.tauxMortalite ?? rc.mortalite ?? 9,
    satisfaction: rc.satisfaction  ?? 55,
  };
}

export function useARIA({ setSelectedCountry, isCrisis, onReset }) {
  // ── Restauration session F5 ────────────────────────────────────────────────
  const savedSession = loadSession();

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase,      setPhase]      = useState(savedSession ? 'game' : 'init');
  const [worldData,  setWorldData]  = useState(() => {
    if (!savedSession) return null;
    return generateWorld(savedSession.seed, savedSession.W, savedSession.H);
  });
  const [countries,  setCountries]  = useState(savedSession?.countries || []);
  const [alliances,  setAlliances]  = useState(savedSession?.alliances || []);
  const [events,     setEvents]     = useState([]);
  const [aiRunning,  setAiRunning]  = useState(false);
  const [notification, setNotif]   = useState(null);
  const [viewport,   setViewport]   = useState({
    W: savedSession?.W || 1400,
    H: savedSession?.H || 800,
  });

  const notifTimerRef = useRef(null);

  // ── Notification toast ─────────────────────────────────────────────────────
  const pushNotif = useCallback((msg, type = 'info', duration = 4000) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotif({ msg, type });
    notifTimerRef.current = setTimeout(() => setNotif(null), duration);
  }, []);

  // ── Initialisation du monde ────────────────────────────────────────────────
  const initWorld = useCallback((seed, W, H) => {
    const world = generateWorld(seed, W, H);
    setWorldData(world);
    setViewport({ W, H });
    return world;
  }, []);

  // ── Persistance auto quand countries/alliances changent ───────────────────
  const worldDataRef = useRef(worldData);
  const viewportRef  = useRef(viewport);
  useEffect(() => { worldDataRef.current = worldData; }, [worldData]);
  useEffect(() => { viewportRef.current  = viewport;  }, [viewport]);

  useEffect(() => {
    if (phase !== 'game' || !countries.length || !worldDataRef.current) return;
    const { seed, W, H } = worldDataRef.current;
    saveSession(seed, W, H, countries, alliances);
  }, [countries, alliances, phase]);

  // ── Lancement en mode local (sans IA) ─────────────────────────────────────
  const startLocal = useCallback((customDefs = null, W = 1400, H = 800) => {
    const seed  = Math.floor(Math.random() * 999999);
    const world = initWorld(seed, W, H);

    // customDefs = tableau de defs passées par InitScreen
    // Chaque def peut avoir : { type, realData, nom, regime, terrain }
    const templates = customDefs
      ? customDefs.map(d => {
          // 1. Pays fictif local connu → chercher dans PAYS_LOCAUX par id
          if (d.realData?.id) {
            const local = PAYS_LOCAUX.find(p => p.id === d.realData.id);
            if (local) return local;
          }
          // 2. Pays réel (REAL_COUNTRIES_DATA ou objet similaire) → normaliser
          if (d.realData && (d.realData.population || d.realData.natalite)) {
            return normalizeRealCountryTemplate(d.realData);
          }
          // 3. Pays fictif sans realData → construire un template minimal
          if (d.type === 'imaginaire' || !d.realData) {
            return {
              id:           (d.nom || 'nation').toLowerCase().replace(/[^a-z0-9]/g, '-'),
              nom:          d.nom || 'Nation Inconnue',
              emoji:        '🌍',
              couleur:      '#4A7EC8',
              regime:       d.regime || 'republique_federale',
              terrain:      d.terrain || 'coastal',
              description:  '',
              leader:       null,
              population:   5_000_000,
              tauxNatalite: 11,
              tauxMortalite: 9,
              satisfaction: 55,
            };
          }
          // 4. Fallback ultime
          return PAYS_LOCAUX[0];
        })
      : [PAYS_LOCAUX[0]];

    const raw   = templates.map(t => buildCountryFromLocal(t, world));
    const built = raw.map(c => {
      const irl = calcAriaIRL(c);
      return { ...c, aria_irl: irl, aria_current: irl };
    });

    setCountries(built);
    const defaultAlliances = buildDefaultAlliances(built);
    setAlliances(defaultAlliances);
    setEvents([]);
    setPhase('game');
    saveSession(seed, W, H, built, defaultAlliances);
    const names = built.map(c => c.nom).join(', ');
    pushNotif(`Mode local — ${names}.`, 'ok');
  }, [initWorld, pushNotif]);

  // ── Lancement en mode IA ───────────────────────────────────────────────────
  const startWithAI = useCallback(async (countryDefs, W = 1400, H = 800) => {
    const seed  = Math.floor(Math.random() * 999999);
    const world = initWorld(seed, W, H);
    const keys  = getApiKeys();
    setAiRunning(true);
    const built = [];

    for (const def of countryDefs) {
      try {
        const prompt  = buildCountryPrompt(def.type, def.nom);
        const aiData  = await callAI(prompt, 'pays');
        if (aiData) {
          const c = buildCountryFromAI(aiData, world, built);
          // En mode en ligne : l'IA génère le portrait du pays dynamiquement.
          // aria_acceptance retourné par l'IA = ancre IRL basée sur sa connaissance actuelle.
          const irlAI = aiData.aria_acceptance && Number.isFinite(+aiData.aria_acceptance)
            ? Math.round(Math.max(5, Math.min(95, +aiData.aria_acceptance))) : null;
          const irl = irlAI ?? calcAriaIRL(c);
          built.push({ ...c, aria_irl: irl, aria_current: irl });
        } else {
          // Fallback : si le pays a un realData → construction locale fidèle
          // sinon → pays local générique
          let fallback;
          if (def.realData && (def.realData.population || def.realData.natalite)) {
            const tpl = normalizeRealCountryTemplate(def.realData);
            fallback = buildCountryFromLocal(tpl, world);
          } else {
            fallback = buildCountryFromLocal(
              PAYS_LOCAUX[built.length % PAYS_LOCAUX.length], world
            );
          }
          const irl = calcAriaIRL(fallback);
          built.push({ ...fallback, aria_irl: irl, aria_current: irl });
          pushNotif(`IA indisponible pour "${def.nom || 'ce pays'}" — mode local appliqué.`, 'warn');
        }
      } catch (e) {
        console.warn('[ARIA] startWithAI error:', e);
      }
    }

    setCountries(built);
    const defaultAlliances = buildDefaultAlliances(built);
    setAlliances(defaultAlliances);
    setEvents([]);
    setPhase('game');
    setAiRunning(false);
    saveSession(world.seed, W, H, built, defaultAlliances);
    pushNotif(`${built.length} pays générés. La simulation commence.`, 'ok');
  }, [initWorld, pushNotif]);

  // ── Cycle +5 ans ──────────────────────────────────────────────────────────
  const advanceCycle = useCallback(async () => {
    const keys     = getApiKeys();
    const updated  = countries.map(c => {
      const cycled = doCycle(c, alliances);
      // Dérive passive du taux d'adhésion ARIA
      const newAria = driftAria(
        cycled.aria_current ?? cycled.aria_irl ?? 40,
        cycled.aria_irl     ?? 40,
        cycled.satisfaction
      );
      return { ...cycled, aria_current: newAria };
    });
    const triggers = [];

    // Vérifie les seuils critiques
    updated.forEach((after, i) => {
      const seuils = checkSeuils(countries[i], after);
      triggers.push(...seuils);
    });

    setCountries(updated);

    // Appels IA pour les événements narratifs détectés
    for (const trigger of triggers) {
      const hasKey = keys.claude || keys.gemini;
      if (hasKey) {
        const prompt   = buildEventPrompt(trigger);
        const aiEvent  = await callAI(prompt, 'evenement');
        if (aiEvent) {
          const evt = { ...aiEvent, id: Date.now(), pays: trigger.pays.nom, trigger: trigger.type };
          setEvents(prev => [evt, ...prev].slice(0, 50));   // max 50 événements
          pushNotif(`⚠ ${aiEvent.titre} — ${trigger.pays.nom}`, aiEvent.severite || 'warn', 6000);
        }
      } else {
        // Message local si pas de clé
        const labels = {
          revolte:        `Révolte imminente à ${trigger.pays.nom} — satisfaction critique.`,
          demo_explosion: `Explosion démographique à ${trigger.pays.nom}.`,
        };
        pushNotif(labels[trigger.type] || `Événement critique à ${trigger.pays.nom}.`, 'warn', 5000);
      }
    }

    pushNotif(`Cycle avancé — An ${updated[0]?.annee || '?'}`, 'info', 2500);
  }, [countries, alliances, pushNotif]);

  // ── Sécession ─────────────────────────────────────────────────────────────
  const doSecession = useCallback(async (parentId, nomNouveau, relationType, childRegime) => {
    const parent = countries.find(c => c.id === parentId);
    if (!parent) return;

    const keys  = getApiKeys();
    const seed  = strToSeed(nomNouveau + Date.now());
    const rand  = seededRand(seed);

    // Régime enfant (depuis la modale, défaut = héritage parent)
    const regimeKey   = childRegime || parent.regime;
    const regimeObj   = REGIMES[regimeKey] || REGIMES.republique_federale;

    // Placement anti-overlap : utilise findSpawnPoint si worldData dispo,
    // sinon offset directionnel garanti hors du parent
    let newCx, newCy;
    if (worldDataRef.current) {
      const spawn = findSpawnPoint(worldDataRef.current, countries, parent.coastal ? 'continent' : null);
      newCx = spawn.cx;
      newCy = spawn.cy;
    } else {
      // Offset dans une direction aléatoire, distance = 2× taille parent (garantit la séparation)
      const angle = rand() * Math.PI * 2;
      const dist  = parent.size * 2.2;
      newCx = parent.cx + Math.cos(angle) * dist;
      newCy = parent.cy + Math.sin(angle) * dist;
    }
    const newSize = parent.size * 0.55;

    // Population du fils = 25% de l'original (avant réduction du parent)
    const popFils    = Math.round(parent.population * 0.25);
    const popParent  = Math.round(parent.population * 0.75);

    // Couleur unique : hue dérivée du seed, éloignée de celle du parent
    const parentHue  = parseInt((parent.couleur || '#4A7EC8').replace('#',''), 16) % 360;
    const childHue   = (parentHue + 137 + Math.floor(rand() * 60)) % 360; // golden angle offset
    const childColor = `hsl(${childHue}, 58%, 36%)`;

    // Parent perd 25% de population et une partie de ses ressources
    const updatedParent = {
      ...parent,
      population:   popParent,
      satisfaction: Math.max(parent.satisfaction - 8, 10),
      size:         parent.size * 0.88,
      svgPath:      genOrganicPath(parent.cx, parent.cy, parent.size * 0.88, parent.seed, 11, 0.30),
      ressources:   Object.fromEntries(
        Object.entries(parent.ressources).map(([k, v]) =>
          [k, v && rand() > 0.35]
        )
      ),
    };

    // Nouveau pays fils
    const childRes = calcRessources(parent.terrain, seed);
    const childCountry = {
      id:           nomNouveau.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      nom:          nomNouveau,
      emoji:        regimeObj.emoji || '🆕',
      couleur:      childColor,
      regime:       regimeKey,
      regimeName:   regimeObj.name || regimeKey,
      regimeEmoji:  regimeObj.emoji || '🏛️',
      terrain:      parent.terrain,
      terrainName:  parent.terrainName,
      coastal:      parent.coastal,
      description:  `Né de la sécession de ${parent.nom}.`,
      leader:       null,
      annee:        parent.annee,
      population:   popFils,
      tauxNatalite: parent.tauxNatalite,
      tauxMortalite:parent.tauxMortalite,
      satisfaction: 60,
      humeur:       getHumeur(60).label,
      humeur_color: getHumeur(60).color,
      popularite:   55,
      ressources:   childRes,
      coefficients: parent.coefficients,
      cx: newCx, cy: newCy, size: newSize, seed,
      svgPath:      genOrganicPath(newCx, newCy, newSize, seed, 9, 0.28),
      influenceRadius: calcInfluenceRadius(popFils, parent.coastal, childRes),
      relations:    { [parentId]: relationType },
      chronolog:    [],
      economie:     Math.round((parent.economie || 100) * 0.7),
      aria_irl:     parent.aria_irl,
      aria_current: parent.aria_current,
      isLocal:      false,
    };

    // Mise à jour des relations du parent
    updatedParent.relations = {
      ...updatedParent.relations,
      [childCountry.id]: relationType,
    };

    setCountries(prev =>
      prev.map(c => c.id === parentId ? updatedParent : c).concat(childCountry)
    );

    // Nouvelle relation diplomatique
    setAlliances(prev => [
      ...prev,
      { a: parentId, b: childCountry.id, type: relationType },
    ]);

    // Événement IA pour baptiser la sécession
    if (keys.claude || keys.gemini) {
      const trigger  = { type: 'secession', pays: childCountry, parent: parent.nom };
      const prompt   = buildEventPrompt(trigger);
      const aiEvent  = await callAI(prompt, 'evenement');
      if (aiEvent) {
        const evt = { ...aiEvent, id: Date.now(), pays: childCountry.nom, trigger: 'secession' };
        setEvents(prev => [evt, ...prev].slice(0, 50));
        pushNotif(`✂ ${aiEvent.titre}`, 'warn', 6000);
      }
    } else {
      pushNotif(`✂ ${nomNouveau} naît de la sécession de ${parent.nom}.`, 'warn', 5000);
    }
  }, [countries, pushNotif]);

  // ── Alliance / rupture ────────────────────────────────────────────────────
  const setRelation = useCallback((idA, idB, type) => {
    // Met à jour les relations dans les deux pays concernés
    setCountries(prev => prev.map(c => {
      if (c.id === idA) return { ...c, relations: { ...c.relations, [idB]: type } };
      if (c.id === idB) return { ...c, relations: { ...c.relations, [idA]: type } };
      return c;
    }));

    setAlliances(prev => {
      const filtered = prev.filter(a => !(
        (a.a === idA && a.b === idB) || (a.a === idB && a.b === idA)
      ));
      if (type !== 'Neutre') return [...filtered, { a: idA, b: idB, type }];
      return filtered;
    });

    // Déclencheur IA si rupture d'alliance
    if (type === 'Tension') {
      const paysA = countries.find(c => c.id === idA);
      const paysB = countries.find(c => c.id === idB);
      if (paysA && paysB) {
        const keys = getApiKeys();
        if (keys.claude || keys.gemini) {
          const trigger = { type: 'alliance_rompue', pays: paysA, avec: paysB.nom };
          callAI(buildEventPrompt(trigger), 'evenement').then(aiEvent => {
            if (aiEvent) {
              setEvents(prev => [
                { ...aiEvent, id: Date.now(), pays: paysA.nom, trigger: 'alliance_rompue' },
                ...prev,
              ].slice(0, 50));
              pushNotif(`⚡ ${aiEvent.titre}`, 'warn', 6000);
            }
          });
        } else {
          pushNotif(`⚡ Tension entre ${paysA.nom} et ${paysB.nom}.`, 'warn', 4000);
        }
      }
    }
  }, [countries, pushNotif]);

  // ── Reset complet ─────────────────────────────────────────────────────────
  const resetWorld = useCallback(() => {
    // IMPORTANT : vider le localStorage EN PREMIER pour que App.jsx
    // ne recharge pas la session fantôme au prochain render
    clearSession();
    setPhase('init');
    setWorldData(null);
    setCountries([]);
    setAlliances([]);
    setEvents([]);
    setSelectedCountry(null);
    onReset?.();   // → App.jsx : setWorldGenerated(false) → InitScreen s'affiche
  }, [setSelectedCountry, onReset]);

  // ── Getters exposés pour App.jsx ─────────────────────────────────────────
  const getYear      = useCallback(() => countries[0]?.annee ?? null, [countries]);
  const getCycle     = useCallback(() => {
    const base = STATS?.global_start?.annee ?? 2026;
    const cur  = countries[0]?.annee ?? base;
    return Math.max(0, Math.round((cur - base) / 5));
  }, [countries]);
  const getCountries = useCallback(() => countries, [countries]);

  return {
    // State
    phase, worldData, countries, alliances, events, aiRunning, notification, viewport,
    // Setters directs
    setCountries, setViewport,
    // Actions
    startLocal, startWithAI, advanceCycle, doSecession, setRelation, resetWorld, pushNotif,
    // Getters pour App
    getYear, getCycle, getCountries,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORT PAR DÉFAUT — composant Dashboard (stub, complété en Partie 3)
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ selectedCountry, setSelectedCountry, isCrisis, activeTab }) {
  const aria = useARIA({ setSelectedCountry, isCrisis });

  // Partie 2 (MapSVG) et Partie 3 (écrans + modales) seront injectées ici.
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(200,164,74,0.3)', fontFamily: "'Cinzel', serif", fontSize: '0.6rem', letterSpacing: '0.3em' }}>
      DASHBOARD — PARTIE 1 CHARGÉE · EN ATTENTE PARTIE 2
    </div>
  );
}
