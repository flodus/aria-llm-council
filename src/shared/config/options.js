// src/shared/config/options.js
// ── COUCHE LOGIQUE MÉTIER OPTIONS ────────────────────────────────────────────
// Valeurs par défaut (DEFAULT_OPTIONS) + merge avec localStorage.
// Aucun accès brut localStorage ici — passe par shared/services/storage.js

import { loadOpts, saveOpts, loadKeys } from '../services/storage';

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
  },
  world: { nb_pays_defaut: 3 },
  defaultGovernance: {
    presidency: 'duale',
  },
};

export function getOptions() {
  try {
    const saved   = loadOpts();
    const apiKeys = loadKeys();
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
  saveOpts(opts);
}
