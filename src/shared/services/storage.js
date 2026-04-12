// src/shared/services/storage.js
// ── COUCHE ACCÈS BRUT ────────────────────────────────────────────────────────
// Fonctions nommées par clé : lecture / écriture / statut.
// Aucune logique métier ici — pas de merge, pas de valeurs par défaut.
// Pour la logique options (merge + defaults) → shared/config/options.js

import { STORAGE_KEYS } from './storageKeys';

const lire = (cle, fb) => { try { return JSON.parse(localStorage.getItem(cle) || JSON.stringify(fb)); } catch { return fb; } };
const ecrire = (cle, val) => { try { localStorage.setItem(cle, JSON.stringify(val)); } catch {} };

export const loadOpts           = () => lire(STORAGE_KEYS.OPTIONS, {});
export const saveOpts           = (opts) => ecrire(STORAGE_KEYS.OPTIONS, opts);

export const loadPreferredModels = () => lire(STORAGE_KEYS.PREFERRED_MODELS, {});
export const savePreferredModels = (models) => ecrire(STORAGE_KEYS.PREFERRED_MODELS, models);

export const loadIARoles = () => {
    try { return (JSON.parse(localStorage.getItem(STORAGE_KEYS.OPTIONS) || '{}')).ia_roles || {}; }
    catch { return {}; }
};

export const loadKeys    = () => lire(STORAGE_KEYS.API_KEYS, {});
export const saveKeys    = (keys) => ecrire(STORAGE_KEYS.API_KEYS, keys);

export const loadKeyStatus  = () => lire(STORAGE_KEYS.API_KEYS_STATUS, {});
export const saveKeyStatus  = (status) => ecrire(STORAGE_KEYS.API_KEYS_STATUS, status);

export const loadAgentsOverride = () => lire(STORAGE_KEYS.AGENTS_OVERRIDE, null);
export const saveAgentsOverride = (agents) => ecrire(STORAGE_KEYS.AGENTS_OVERRIDE, agents);

export const loadCustomProviders = () => lire(STORAGE_KEYS.CUSTOM_PROVIDERS, []);
export const saveCustomProviders = (providers) => ecrire(STORAGE_KEYS.CUSTOM_PROVIDERS, providers);

export const loadCustomModels = () => lire(STORAGE_KEYS.CUSTOM_MODELS, {});
export const saveCustomModels = (models) => ecrire(STORAGE_KEYS.CUSTOM_MODELS, models);
