// src/shared/utils/storage.js
// Primitives localStorage partagées — lecture/écriture avec gestion d'erreur centralisée
// Utiliser ces fonctions plutôt que JSON.parse(localStorage.getItem(...)) directement

import { STORAGE_KEYS } from '../services/storageKeys';

/**
 * Lit une valeur depuis localStorage et la désérialise.
 * Retourne `fallback` en cas d'erreur ou de clé absente.
 */
export function lireStorage(cle, fallback = {}) {
  try {
    const valeur = localStorage.getItem(cle);
    if (valeur === null) return fallback;
    return JSON.parse(valeur);
  } catch {
    return fallback;
  }
}

/**
 * Sérialise et écrit une valeur dans localStorage.
 * Silencieux en cas d'erreur (quota, mode privé...).
 */
export function ecrireStorage(cle, valeur) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {}
}

/**
 * Supprime une clé du localStorage.
 */
export function supprimerStorage(cle) {
  try {
    localStorage.removeItem(cle);
  } catch {}
}

// Helpers spécialisés — agents override (utilisés par ConstitutionModal)
export function lireAgentsOverride()    { return lireStorage(STORAGE_KEYS.AGENTS_OVERRIDE, null); }
export function ecrireAgentsOverride(d) { ecrireStorage(STORAGE_KEYS.AGENTS_OVERRIDE, d); }
