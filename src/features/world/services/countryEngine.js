// src/features/world/services/countryEngine.js
// Construction et calcul des pays (local, IA, réel)

import STATS from '../../../../templates/languages/fr/simulation.json';
import { getStats, RESOURCE_KEYS } from '../../../shared/data/gameData';
import { seededRand, strToSeed, randBool } from '../../../shared/utils/prng';
import { genOrganicPath, findSpawnPoint } from './svgWorldEngine';
import { getHumeur, calcInfluenceRadius } from './gameEngine';
import { normalizeCountry } from '../../../shared/utils/normalizeCountry';

// Positions de départ pour les 3 pays locaux (coordonnées SVG 1400×800)
const LOCAL_SPAWN = {
  valoria:   { cx: 280, cy: 320 },
  eldoria:   { cx: 700, cy: 220 },
  thalassia: { cx: 1080, cy: 480 },
};

// ── Calculs ARIA ─────────────────────────────────────────────────────────────

/** Calcule le taux IRL pour un pays FICTIF (déterministe) */
export function calcAriaIRL(country) {
  const base     = getStats().regimes[country.regime]?.aria_irl_base ?? 35;
  const satBonus = (country.satisfaction - 50) * 0.28;
  const ecoBonus = ((country.economie || 100) - 100) * 0.06;
  const island   = ['island', 'archipelago'].includes(country.terrain) ? 4 : 0;
  return Math.round(Math.max(5, Math.min(95, base + satBonus + ecoBonus + island)));
}

/**
 * Moteur de fluctuation in-game — appelé après chaque référendum.
 * @param {number}  current    - taux in-game actuel
 * @param {number}  irl        - ancre IRL immuable
 * @param {'oui'|'non'|null} vote
 * @param {boolean} convergent - Phare et Boussole convergents ?
 */
export function fluctuateAria(current, irl, vote, convergent = true) {
  const inertia = Math.max(0.40, Math.min(1.0, irl / 75));

  let delta = 0;
  if (vote === 'oui') {
    delta = convergent ? +3.0 : +1.5;
  } else if (vote === 'non') {
    delta = convergent ? -1.2 : -3.8;
  }

  const adjusted = delta > 0 ? delta * inertia : delta;
  return Math.round(Math.max(5, Math.min(95, current + adjusted)));
}

/** Dérive passive à chaque cycle +5 ans. Mean-reversion vers l'ancre IRL + drift satisfaction. */
export function driftAria(current, irl, satisfaction) {
  const reversion = (irl - current) * 0.05;
  const satDrift  = satisfaction > 65 ? +0.4 : satisfaction < 40 ? -0.35 : 0;
  return Math.round(Math.max(5, Math.min(95, current + reversion + satDrift)));
}

/** Calcule les ressources selon le terrain et le seed */
export function calcRessources(terrain, seed) {
  const cfg  = getStats().terrains[terrain] || getStats().terrains.inland;
  const rand = seededRand(seed + 7777);
  const res  = {};

  RESOURCE_KEYS.forEach(k => { res[k] = false; });
  (cfg.ressources_garanties || []).forEach(k => {
    if (RESOURCE_KEYS.includes(k)) res[k] = true;
  });
  (cfg.ressources_possibles || []).forEach(k => {
    if (RESOURCE_KEYS.includes(k) && !res[k]) {
      res[k] = randBool(rand, 0.55);
    }
  });

  return res;
}

/** Construit un pays complet depuis un template local (sans clé API) */
export function buildCountryFromLocal(template, worldData) {
  const seed     = strToSeed(template.id);
  const regime   = getStats().regimes[template.regime] || getStats().regimes.republique_federale;
  const terrain  = getStats().terrains[template.terrain] || getStats().terrains.coastal;
  const spawn    = LOCAL_SPAWN[template.id] || { cx: 400, cy: 300 };

  const scaleX = (worldData?.W || 1400) / 1400;
  const scaleY = (worldData?.H || 800)  / 800;
  const cx     = spawn.cx * scaleX;
  const cy     = spawn.cy * scaleY;

  const size    = 55 + (template.population / 1_000_000) * 2.5;
  const coastal = ['coastal', 'island', 'archipelago'].includes(template.terrain);

  const brut = {
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
    cx, cy, size, seed,
    svgPath:      genOrganicPath(cx, cy, size, seed, 11, 0.30),
    influenceRadius: calcInfluenceRadius(template.population, coastal, calcRessources(template.terrain, seed)),
    relations:    {},
    chronolog:    [],
    economie:     100,
    isLocal:      true,
    aria_irl:     null,
    aria_current: null,
  };
  return normalizeCountry(brut);
}

/** Construit un pays depuis les données JSON retournées par l'IA */
export function buildCountryFromAI(aiData, worldData, existingCountries) {
  const seed    = strToSeed(aiData.nom + Date.now());
  const terrain = aiData.terrain || 'coastal';
  const regime  = getStats().regimes[aiData.regime] || getStats().regimes.democratie_liberale;
  const coastal = ['coastal', 'island', 'archipelago'].includes(terrain);

  const preferredType = ['island', 'archipelago'].includes(terrain) ? 'island' : 'continent';
  const spawn   = findSpawnPoint(worldData, existingCountries, preferredType);
  const { cx, cy } = spawn;

  const size = 45 + (aiData.population / 1_000_000) * 2;
  const res  = aiData.ressources
    ? Object.fromEntries(RESOURCE_KEYS.map(k => [k, !!(aiData.ressources[k])]))
    : calcRessources(terrain, seed);

  const brut = {
    id:           aiData.nom.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    nom:          aiData.nom,
    emoji:        aiData.emoji || '🌍',
    couleur:      aiData.couleur || `hsl(${Math.abs(seed) % 360}, 55%, 34%)`,
    regime:       aiData.regime || 'republique_federale',
    regimeName:   regime.name,
    regimeEmoji:  regime.emoji,
    terrain,
    terrainName:  getStats().terrains[terrain]?.name || terrain,
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
    svgPath:      genOrganicPath(cx, cy, size, seed, 11, 0.30),
    influenceRadius: calcInfluenceRadius(aiData.population || 5_000_000, coastal, res),
    relations:    {},
    chronolog:    [],
    economie:     100,
    isLocal:      false,
    aria_irl:     null,
    aria_current: null,
  };
  return normalizeCountry(brut);
}

/** Normalise un pays réel (REAL_COUNTRIES_DATA) en template compatible */
export function normalizeRealCountryTemplate(rc) {
  const hue = Math.abs(strToSeed(rc.id || rc.nom || 'x')) % 360;
  return {
    id:           rc.id,
    nom:          rc.nom,
    emoji:        rc.flag || '🌍',
    couleur:      rc.couleur || `hsl(${hue}, 55%, 34%)`,
    regime:       rc.regime || 'democratie_liberale',
    terrain:      rc.terrain || 'coastal',
    description:  rc.aria_sociology_logic || '',
    geoContext:   rc.triple_combo || '',
    leader:       rc.leader || null,
    population:   rc.population || 5_000_000,
    tauxNatalite: rc.tauxNatalite ?? rc.natalite  ?? 11,
    tauxMortalite:rc.tauxMortalite ?? rc.mortalite ?? 9,
    satisfaction: rc.satisfaction  ?? 55,
  };
}
