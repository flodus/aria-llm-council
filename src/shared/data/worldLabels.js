// src/shared/data/worldLabels.js

// ═══════════════════════════════════════════════════════════════════════════
//  worldLabels.js — Source canonique des labels métier monde simulé
//
//  Définitions unifiées des terrains, régimes et ressources avec getters i18n.
//  Toutes les définitions suivent le même pattern pour une maintenance simplifiée.
//
//  Usage :
//    import { getTerrainLabel, getRegimeLabel, getResourceLabel } from './worldLabels';
//    getTerrainLabel('coastal', 'en')          → 'Coastal 🌊'
//    getRegimeLabel('democratie_liberale', 'fr') → 'Démocratie libérale 🗳️'
//    getResourceIcon('agriculture')            → '🌾'
// ═══════════════════════════════════════════════════════════════════════════

// ============================================================
// 1. DÉFINITIONS DE BASE (array pour éviter la duplication)
// ============================================================

export const TERRAIN_DEFS = [
    { key: 'coastal',     icon: '🌊', label: { fr: 'Côtier',        en: 'Coastal'      } },
{ key: 'inland',      icon: '🏔️', label: { fr: 'Continental',   en: 'Landlocked'   } },
{ key: 'island',      icon: '🏝️', label: { fr: 'Insulaire',     en: 'Island'       } },
{ key: 'archipelago', icon: '⛵', label: { fr: 'Archipel',      en: 'Archipelago'  } },
{ key: 'highland',    icon: '⛰️', label: { fr: 'Montagneux',    en: 'Highland'     } },
{ key: 'desert',      icon: '🏜️', label: { fr: 'Désert',        en: 'Desert'       } },
{ key: 'foret',       icon: '🌲', label: { fr: 'Forêt',         en: 'Forest'       } },
{ key: 'tropical',    icon: '🌴', label: { fr: 'Tropical',      en: 'Tropical'     } },
{ key: 'toundra',     icon: '❄️', label: { fr: 'Toundra',       en: 'Tundra'       } },
];

export const REGIME_DEFS = [
    { key: 'democratie_liberale',         icon: '🗳️',  label: { fr: 'Démocratie libérale',          en: 'Liberal Democracy'          } },
{ key: 'republique_federale',         icon: '🏛️',  label: { fr: 'République fédérale',          en: 'Federal Republic'           } },
{ key: 'monarchie_constitutionnelle', icon: '👑',  label: { fr: 'Monarchie constitutionnelle',  en: 'Constitutional Monarchy'    } },
{ key: 'monarchie_absolue',           icon: '👑',  label: { fr: 'Monarchie absolue',            en: 'Absolute Monarchy'          } },
{ key: 'technocratie_ia',             icon: '🤖',  label: { fr: 'Technocratie IA',              en: 'ARIA Technocracy'           } },
{ key: 'oligarchie',                  icon: '💼',  label: { fr: 'Oligarchie',                   en: 'Oligarchy'                  } },
{ key: 'junte_militaire',              icon: '🎖️',  label: { fr: 'Junte militaire',              en: 'Military Junta'             } },
{ key: 'regime_autoritaire',           icon: '🔒',  label: { fr: 'Régime autoritaire',           en: 'Authoritarian Regime'       } },
{ key: 'theocracie',                   icon: '🕌',  label: { fr: 'Théocratie',                   en: 'Theocracy'                  } },
{ key: 'communisme',                   icon: '☭',  label: { fr: 'Parti communiste',             en: 'Communist Party'            } },
{ key: 'nationalisme_autoritaire',     icon: '⚡',  label: { fr: 'Nationalisme autoritaire',     en: 'Authoritarian Nationalism'  } },
{ key: 'democratie_directe',           icon: '🗳️',  label: { fr: 'Démocratie directe',           en: 'Direct Democracy'           } },
];

export const RESOURCE_DEFS = [
    { key: 'agriculture', icon: '🌾', label: { fr: 'Agriculture', en: 'Agriculture' } },
{ key: 'bois',        icon: '🪵', label: { fr: 'Bois',        en: 'Timber'      } },
{ key: 'eau',         icon: '💧', label: { fr: 'Eau douce',   en: 'Fresh Water' } },
{ key: 'energie',     icon: '⚡', label: { fr: 'Énergie',     en: 'Energy'      } },
{ key: 'mineraux',    icon: '💎', label: { fr: 'Minéraux',    en: 'Minerals'    } },
{ key: 'peche',       icon: '🐟', label: { fr: 'Pêche',       en: 'Fishing'     } },
{ key: 'petrole',     icon: '🛢️', label: { fr: 'Pétrole',     en: 'Oil'         } },
];

// ============================================================
// 2. CONSTRUCTION AUTOMATIQUE DES OBJETS LABELS
// ============================================================

// Construction : { key: { fr: '...', en: '...' } }
// Ces exports existent pour la rétrocompatibilité avec le code existant
export const TERRAIN_LABELS = Object.fromEntries(
    TERRAIN_DEFS.map(({ key, label }) => [key, label])
);

export const REGIME_LABELS = Object.fromEntries(
    REGIME_DEFS.map(({ key, label }) => [key, label])
);

export const RESOURCE_LABELS = Object.fromEntries(
    RESOURCE_DEFS.map(({ key, label }) => [key, label])
);

// ============================================================
// 3. GETTERS I18N GÉNÉRIQUES
// ============================================================

// Fonction générique pour éviter la duplication
const createLabelGetter = (labels) => (key, lang = 'fr') =>
labels[key]?.[lang] ?? labels[key]?.fr ?? key;

// Getters spécifiques (rétrocompatibles)
export const getTerrainLabel = createLabelGetter(TERRAIN_LABELS);
export const getRegimeLabel = createLabelGetter(REGIME_LABELS);
export const getResourceLabel = createLabelGetter(RESOURCE_LABELS);

// ============================================================
// 4. GETTERS D'ICÔNES
// ============================================================

export const getTerrainIcon = (key) =>
TERRAIN_DEFS.find(t => t.key === key)?.icon ?? '❓';

export const getRegimeIcon = (key) =>
REGIME_DEFS.find(r => r.key === key)?.icon ?? '❓';

export const getResourceIcon = (key) =>
RESOURCE_DEFS.find(r => r.key === key)?.icon ?? '❓';

// ============================================================
// 5. MAPS POUR <select> (rétrocompatibles)
// ============================================================

// Retourne { key: label } pour peupler un <select>
export const getTerrainLabelMap = (lang = 'fr') =>
Object.fromEntries(
    Object.entries(TERRAIN_LABELS).map(([k, v]) => [k, v[lang] ?? v.fr])
);

export const getRegimeLabelMap = (lang = 'fr') =>
Object.fromEntries(
    Object.entries(REGIME_LABELS).map(([k, v]) => [k, v[lang] ?? v.fr])
);

export const getResourceLabelMap = (lang = 'fr') =>
Object.fromEntries(
    Object.entries(RESOURCE_LABELS).map(([k, v]) => [k, v[lang] ?? v.fr])
);

