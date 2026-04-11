// src/features/world/services/gameEngine.js
// Fonctions pures du moteur de jeu : humeur, influence, cycles, seuils

import { getStats, CYCLES_CFG } from '../../../shared/data/gameData';

/** Mappe un score de satisfaction sur un objet humeur {label, color} */
export function getHumeur(score) {
  const humeurs = getStats().humeurs;
  for (const h of humeurs) {
    if (score >= h.min) return h;
  }
  return humeurs[humeurs.length - 1];
}

/** Calcule le rayon d'influence (cercle pointillé au clic) */
export function calcInfluenceRadius(population, coastal, ressources) {
  const base     = 45 + (population / 1_000_000) * 3;
  const maritime = coastal ? 22 : 0;
  const resCount = Object.values(ressources).filter(Boolean).length;
  return Math.min(Math.round(base + maritime + resCount * 4), 130);
}

/** Applique un impact d'événement à un pays */
export function applyEventImpact(country, impact) {
  const newSat     = Math.max(0, Math.min(100, country.satisfaction + (impact.satisfaction || 0)));
  const humeurObj  = getHumeur(newSat);
  return {
    ...country,
    satisfaction:  newSat,
    humeur:        humeurObj.label,
    humeur_color:  humeurObj.color,
    popularite:    Math.max(0,  Math.min(100, country.popularite + (impact.popularite || 0))),
    economie:      Math.max(20, Math.min(200, (country.economie || 100) + (impact.economie || 0))),
    population:    Math.max(100, country.population + (impact.population_delta || 0)),
  };
}

/**
 * Calcule le delta satisfaction pour un cycle de 5 ans.
 * Applique les poids ministériels du régime, impacts ressources, alliances, bruit.
 */
export function calcSatisfactionDelta(country, alliances) {
  const cfg    = getStats().calculs_cycles;
  const regime = getStats().regimes[country.regime] || getStats().regimes.republique_federale;
  const poids  = regime.poids_ministeriel;

  let delta = cfg.derive_satisfaction_base * regime.coeff_satisfaction;

  const rmWeights = getStats().resource_ministry_weights || {};
  const resMinisters = Object.fromEntries(
    Object.entries(rmWeights).map(([res, w]) => [
      res,
      Object.entries(w).reduce((sum, [minId, coeff]) => sum + (poids[minId] || 0) * coeff, 0),
    ])
  );

  Object.entries(country.ressources).forEach(([k, present]) => {
    const weight = resMinisters[k] || 1.0;
    delta += present
      ? cfg.impact_ressource_presente * weight * 0.4
      : cfg.impact_ressource_absente  * weight * 0.3;
  });

  Object.values(country.relations || {}).forEach(type => {
    if (type === 'Alliance') delta += cfg.impact_alliance;
    if (type === 'Tension')  delta += cfg.impact_conflit;
  });

  const noise = (Math.random() * 2 - 1) * cfg.bruit_max;
  delta += noise;

  return Math.round(delta * 10) / 10;
}

/** Applique un cycle de +5 ans à un pays. Retourne le nouveau pays (immutable). */
export function doCycle(country, alliances) {
  const regime = getStats().regimes[country.regime] || getStats().regimes.republique_federale;
  const terrain= getStats().terrains[country.terrain] || getStats().terrains.inland;

  const natalite  = (country.tauxNatalite  / 1000) * 5;
  const mortalite = (country.tauxMortalite / 1000) * 5;
  const growthMod = terrain.modificateur_pop * regime.coeff_croissance;
  const newPop    = Math.round(country.population * (1 + (natalite - mortalite) * growthMod));

  const ecoBase   = terrain.modificateur_eco * regime.coeff_croissance;
  const ecoRatio  = Object.values(country.ressources).filter(Boolean).length / 7;
  const ecoDelta  = (ecoBase - 1) * 8 + (ecoRatio - 0.5) * 6 + (Math.random() * 4 - 2);
  const newEco    = Math.max(20, Math.min(200, (country.economie || 100) + ecoDelta));

  const satDelta  = calcSatisfactionDelta(country, alliances);
  const newSat    = Math.max(0, Math.min(100, country.satisfaction + satDelta));
  const humeurObj = getHumeur(newSat);

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
    economie:     Math.round(newEco),
    svgPath:      country.svgPath,
    influenceRadius: calcInfluenceRadius(newPop, country.coastal, country.ressources),
  };
}

/** Vérifie les seuils critiques après un cycle. Retourne les déclencheurs IA. */
export function checkSeuils(before, after) {
  const triggers = [];
  const cfg      = CYCLES_CFG;

  if (before.satisfaction >= cfg.seuil_revolte && after.satisfaction < cfg.seuil_revolte) {
    triggers.push({ type: 'revolte', pays: after });
  }
  if (after.population >= before.population * cfg.seuil_crise_demo / 100) {
    triggers.push({ type: 'demo_explosion', pays: after });
  }

  return triggers;
}
