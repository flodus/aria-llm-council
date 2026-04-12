// src/features/chronolog/useChronolog.js

// ═══════════════════════════════════════════════════════════════════════════
//  useChronolog.js  —  Journal complet du monde ARIA
//
//  Types d'événements :
//    'vote'          — délibération + vote peuple
//    'secession'     — sécession d'un pays
//    'constitution'  — amendement constitution
//    'new_country'   — nouveau pays fictif
//    'cycle_stats'   — snapshot automatique fin de cycle
//    'diplomacy'     — changement de relation entre deux pays
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback } from 'react';

const LS_KEY      = 'aria_chronolog_cycles';
const FULL_CYCLES = 5;
const SYNTH_MAX   = 250;

const trunc = (s, n = SYNTH_MAX) =>
s ? (String(s).length > n ? String(s).slice(0, n) + '…' : String(s)) : '';

function loadCycles() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCycles(cycles) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cycles));
  } catch (e) {
    console.warn('[Chronolog] Failed to save cycles:', e);
  }
}

function summarizeEvent(ev) {
  if (ev.type === 'vote') {
    return {
      type: 'vote', ts: ev.ts,
      countryId: ev.countryId, countryNom: ev.countryNom, countryEmoji: ev.countryEmoji,
      ministereId: ev.ministereId, ministereNom: ev.ministereNom,
      question: ev.question,
      vote: ev.vote, label: ev.label, impacts: ev.impacts,
    };
  }
  return ev;
}

function summarizeCycle(cycle) {
  return { ...cycle, _summary: true, events: cycle.events.map(summarizeEvent) };
}

function upsertCycle(cycles, newCycle) {
  const idx = cycles.findIndex(c => c.cycleNum === newCycle.cycleNum);
  let updated = idx >= 0
  ? cycles.map((c, i) => i === idx ? newCycle : c)
  : [newCycle, ...cycles];
  updated.sort((a, b) => b.cycleNum - a.cycleNum);
  return updated.map((c, i) =>
  i < FULL_CYCLES ? { ...c, _summary: false } : c._summary ? c : summarizeCycle(c)
  );
}

export function useChronolog() {

  const pushEvent = useCallback((cycleNum, annee, event) => {
    const ev = { ts: Date.now(), ...event };

    if (ev.type === 'vote') {
      ev.syntheseMinistere  = trunc(ev.syntheseMinistere);
      ev.synthesePresidence = trunc(ev.synthesePresidence);
    }
    if (ev.type === 'secession')    ev.narratif = trunc(ev.narratif, 300);
    if (ev.type === 'constitution') ev.narratif = trunc(ev.narratif, 200);

    const cycles   = loadCycles();
    const existing = cycles.find(c => c.cycleNum === cycleNum);

    const cycleRecord = existing
    ? (() => {
      let events = existing.events;
      if (ev.type === 'vote') {
        events = events.filter(e =>
        !(e.type === 'vote' && e.countryId === ev.countryId && e.ministereId === ev.ministereId)
        );
      }
      return { ...existing, events: [...events, ev] };
    })()
    : { cycleNum, annee, _summary: false, events: [ev] };

    saveCycles(upsertCycle(cycles, cycleRecord));
  }, []);

  const pushCycleStats = useCallback((cycleNum, annee, countries, prevCountries = []) => {
    const snapshot = countries.map(c => {
      const prev = prevCountries.find(p => p.id === c.id);
      return {
        countryId:    c.id,
        nom:          c.nom,
        emoji:        c.emoji,
        satisfaction: c.satisfaction,
        aria_current: c.aria_current,
        population:   c.population,
        economie:     c.economie,
        satDelta:     prev ? Math.round(c.satisfaction - prev.satisfaction)  : 0,
                                   ariaDelta:    prev ? Math.round(c.aria_current - prev.aria_current)  : 0,
      };
    });
    pushEvent(cycleNum, annee, {
      type: 'cycle_stats', countryId: null,
      countryNom: 'Monde', countryEmoji: '🌐',
      snapshot,
    });
  }, [pushEvent]);

  const closeCycle = useCallback((cycleNum) => {
    const cycles = loadCycles();
    saveCycles(upsertCycle(cycles,
                           cycles.find(c => c.cycleNum === cycleNum) ||
                           { cycleNum, annee: 0, _summary: false, events: [] }
    ));
  }, []);

  const getCycles      = useCallback(() => loadCycles(), []);
  const resetChronolog = useCallback(() => {
    try {
      localStorage.removeItem(LS_KEY);
    } catch (e) {
      console.warn('[Chronolog] Failed to reset:', e);
    }
  }, []);

  const pushDiplomacy = useCallback((cycleNum, annee, idA, nomA, emoA, idB, nomB, emoB, relationType) => {
    pushEvent(cycleNum, annee || 0, {
      type: 'diplomacy',
      countryId:    idA,
      countryNom:   nomA,
      countryEmoji: emoA,
      paysB: { id: idB, nom: nomB, emoji: emoB },
      relationType,
    });
  }, [pushEvent]);

  return { pushEvent, pushCycleStats, pushDiplomacy, closeCycle, getCycles, resetChronolog };
}
