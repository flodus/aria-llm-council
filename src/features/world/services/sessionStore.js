// src/features/world/services/sessionStore.js
// Persistance session localStorage + construction alliances par défaut

import { getStats } from '../../../shared/data/gameData';

// ── Session ───────────────────────────────────────────────────────────────────

export function saveSession(seed, W, H, countries, alliances) {
  try {
    localStorage.setItem('aria_session_active', 'true');
    localStorage.setItem('aria_session_world',     JSON.stringify({ seed, W, H }));
    localStorage.setItem('aria_session_countries', JSON.stringify(countries));
    localStorage.setItem('aria_session_alliances', JSON.stringify(alliances));
  } catch (e) {
    console.warn('[ARIA] saveSession failed:', e);
  }
}

export function loadSession() {
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

export function clearSession() {
  try {
    localStorage.removeItem('aria_session_active');
    localStorage.removeItem('aria_session_world');
    localStorage.removeItem('aria_session_countries');
    localStorage.removeItem('aria_session_alliances');
    localStorage.removeItem('aria_chronolog_cycles');
    const _o = JSON.parse(localStorage.getItem('aria_options') || '{}');
    if (_o.gameplay) { _o.gameplay.context_mode = 'auto'; localStorage.setItem('aria_options', JSON.stringify(_o)); }
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
