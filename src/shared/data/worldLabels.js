// src/shared/data/worldLabels.js
//
//  Adaptateur i18n — source de vérité : templates/languages/*/simulation.json
//  Ne pas ajouter de données ici. Modifier simulation.json à la place.

import SIMU_FR from '../../../templates/languages/fr/simulation.json';
import SIMU_EN from '../../../templates/languages/en/simulation.json';

// ============================================================
// 1. CONSTRUCTION DES DEFS DEPUIS LES JSON
// ============================================================

export const REGIME_DEFS = Object.entries(SIMU_FR.regimes).map(([key, fr]) => ({
  key,
  icon:  fr.emoji,
  label: { fr: fr.name, en: SIMU_EN.regimes[key]?.name ?? fr.name },
}));

export const TERRAIN_DEFS = Object.entries(SIMU_FR.terrains).map(([key, fr]) => ({
  key,
  icon:  fr.emoji,
  label: { fr: fr.name, en: SIMU_EN.terrains[key]?.name ?? fr.name },
}));

export const RESOURCE_DEFS = Object.entries(SIMU_FR.ressources).map(([key, fr]) => ({
  key,
  icon:  fr.emoji,
  label: { fr: fr.name, en: SIMU_EN.ressources[key]?.name ?? fr.name },
}));

// ============================================================
// 2. MAPS { key: { fr, en } } — rétrocompatibilité
// ============================================================

export const REGIME_LABELS   = Object.fromEntries(REGIME_DEFS.map(({ key, label }) => [key, label]));
export const TERRAIN_LABELS  = Object.fromEntries(TERRAIN_DEFS.map(({ key, label }) => [key, label]));
export const RESOURCE_LABELS = Object.fromEntries(RESOURCE_DEFS.map(({ key, label }) => [key, label]));

// ============================================================
// 3. GETTERS I18N
// ============================================================

const createLabelGetter = (labels) => (key, lang = 'fr') =>
  labels[key]?.[lang] ?? labels[key]?.fr ?? key;

export const getTerrainLabel  = createLabelGetter(TERRAIN_LABELS);
export const getRegimeLabel   = createLabelGetter(REGIME_LABELS);
export const getResourceLabel = createLabelGetter(RESOURCE_LABELS);

// ============================================================
// 4. GETTERS D'ICÔNES
// ============================================================

export const getTerrainIcon  = (key) => TERRAIN_DEFS.find(t => t.key === key)?.icon  ?? '❓';
export const getRegimeIcon   = (key) => REGIME_DEFS.find(r => r.key === key)?.icon   ?? '❓';
export const getResourceIcon = (key) => RESOURCE_DEFS.find(r => r.key === key)?.icon ?? '❓';

// ============================================================
// 5. MAPS POUR <select> TRIÉES ALPHABÉTIQUEMENT
// ============================================================

export const getTerrainLabelMap = (lang = 'fr') =>
  Object.fromEntries(
    TERRAIN_DEFS
      .map(({ key, label }) => [key, label[lang] ?? label.fr])
      .sort(([, a], [, b]) => a.localeCompare(b, lang))
  );

export const getRegimeLabelMap = (lang = 'fr') =>
  Object.fromEntries(
    REGIME_DEFS
      .map(({ key, label }) => [key, label[lang] ?? label.fr])
      .sort(([, a], [, b]) => a.localeCompare(b, lang))
  );

export const getResourceLabelMap = (lang = 'fr') =>
  Object.fromEntries(
    RESOURCE_DEFS
      .map(({ key, label }) => [key, label[lang] ?? label.fr])
      .sort(([, a], [, b]) => a.localeCompare(b, lang))
  );
