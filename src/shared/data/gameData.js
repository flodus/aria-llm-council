// src/shared/data/gameData.js
// Constantes de jeu dérivées des JSON templates + getters lang-aware

import AGENTS    from '../../../templates/languages/fr/governance.json';
import AGENTS_EN from '../../../templates/languages/en/governance.json';
import STATS     from '../../../templates/languages/fr/simulation.json';
import STATS_EN  from '../../../templates/languages/en/simulation.json';
import { LOCAL_COUNTRIES } from './ariaData';
import { loadLang } from '../../ariaI18n';

/** Retourne le jeu de templates gouvernance selon la langue courante */
export const getAgents = () => loadLang() === 'en' ? AGENTS_EN : AGENTS;

/** Retourne le jeu de templates simulation selon la langue courante */
export const getStats  = () => loadLang() === 'en' ? STATS_EN  : STATS;

// Exports statiques (FR par défaut) — pour rétrocompat et accès rapide
export const MINISTERS   = AGENTS.ministers;
export const MINISTRIES  = AGENTS.ministries;
export const PRESIDENCY  = AGENTS.presidency;
export const REGIMES     = STATS.regimes;
export const TERRAINS    = STATS.terrains;
export const HUMEURS     = STATS.humeurs;
export const CYCLES_CFG  = STATS.calculs_cycles;
export const PAYS_LOCAUX = LOCAL_COUNTRIES;

// Clés de ressources dans l'ordre d'affichage UI
export const RESOURCE_KEYS = [
  'agriculture', 'bois', 'eau', 'energie', 'mineraux', 'peche', 'petrole',
];
