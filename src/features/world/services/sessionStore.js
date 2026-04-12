// src/features/world/services/sessionStore.js
// Persistance session localStorage + construction alliances par défaut

import { getStats } from '../../../shared/data/gameData';
import { STORAGE_KEYS } from '../../../shared/services/storageKeys';
import { lireStorage, ecrireStorage, supprimerStorage } from '../../../shared/utils/storage';

// ── Session ───────────────────────────────────────────────────────────────────

export function saveSession(seed, W, H, countries, alliances) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'true');
    ecrireStorage(STORAGE_KEYS.SESSION_WORLD,     { seed, W, H });
    ecrireStorage(STORAGE_KEYS.SESSION_COUNTRIES, countries);
    ecrireStorage(STORAGE_KEYS.SESSION_ALLIANCES, alliances);
  } catch (e) {
    console.warn('[ARIA] saveSession failed:', e);
  }
}

export function loadSession() {
  try {
    const active = localStorage.getItem(STORAGE_KEYS.SESSION_ACTIVE);
    if (!active) return null;
    const world     = lireStorage(STORAGE_KEYS.SESSION_WORLD, null);
    const countries = lireStorage(STORAGE_KEYS.SESSION_COUNTRIES, null);
    const alliances = lireStorage(STORAGE_KEYS.SESSION_ALLIANCES, []);
    if (!world || !countries) return null;
    const { seed, W, H } = world;
    if (!countries?.length) return null;
    return { seed, W: W || 1400, H: H || 800, countries, alliances };
  } catch { return null; }
}

export function clearSession() {
  try {
    supprimerStorage(STORAGE_KEYS.SESSION_ACTIVE);
    supprimerStorage(STORAGE_KEYS.SESSION_WORLD);
    supprimerStorage(STORAGE_KEYS.SESSION_COUNTRIES);
    supprimerStorage(STORAGE_KEYS.SESSION_ALLIANCES);
    supprimerStorage(STORAGE_KEYS.CHRONOLOG_CYCLES);
    supprimerStorage(STORAGE_KEYS.CYCLE_NUM);
    supprimerStorage(STORAGE_KEYS.CHRONIQUEUR);
    const _o = lireStorage(STORAGE_KEYS.OPTIONS, {});
    if (_o.gameplay) { _o.gameplay.context_mode = 'auto'; ecrireStorage(STORAGE_KEYS.OPTIONS, _o); }
  } catch {}
}

// ── Alliances par défaut ──────────────────────────────────────────────────────

export function buildDefaultAlliances(countries) {
  if (!countries || countries.length < 2) return [];
  const alliances = [];
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      const a    = countries[i], b = countries[j];
      const blocA = getStats().regimes[a.regime]?.bloc || 'neutral';
      const blocB = getStats().regimes[b.regime]?.bloc || 'neutral';
      let type = 'Neutre';
      if (blocA === blocB && blocA !== 'neutral') type = 'Alliance';
      else if (blocA !== 'neutral' && blocB !== 'neutral' && blocA !== blocB) type = 'Tension';
      alliances.push({ a: a.id, b: b.id, type });
    }
  }
  return alliances;
}
