// src/features/chronolog/useChroniqueur.js

// ═══════════════════════════════════════════════════════════════════════════
//  useChroniqueur.js — Mémoire institutionnelle narrative par pays
//
//  Appelé à la clôture de chaque cycle (Dashboard.jsx → onConfirm).
//  Lit la narration précédente + les events du cycle clos → produit une
//  narration enrichie, plus profonde à chaque cycle.
//
//  IA mode   : callAI('council_chroniqueur') si chroniqueur.enabled + clé dispo
//  Board game : narration déterministe depuis stats + événements
//
//  Stockage : aria_chroniqueur = { [countryId]: { memoire, cycle } }
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback } from 'react';
import { STORAGE_KEYS } from '../../shared/services/storageKeys';
import { callAI } from '../../shared/services/llm/aiService';
import { loadLang } from '../../ariaI18n';
import { getOptions } from '../../shared/config/options';

// ── Lecture / écriture ────────────────────────────────────────────────────────

function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHRONIQUEUR) || '{}'); }
  catch { return {}; }
}

function saveAll(data) {
  try { localStorage.setItem(STORAGE_KEYS.CHRONIQUEUR, JSON.stringify(data)); }
  catch (e) { console.warn('[Chroniqueur] Failed to save:', e); }
}

export function loadMemoire(countryId) {
  return loadAll()[countryId] || null;
}

function saveMemoire(countryId, memoire, cycle) {
  const all = loadAll();
  all[countryId] = { memoire, cycle };
  saveAll(all);
}

export function resetChroniqueur() {
  try { localStorage.removeItem(STORAGE_KEYS.CHRONIQUEUR); }
  catch {}
}

// ── Narration déterministe (board game / fallback) ────────────────────────────

function buildNarrationDeterministe(country, cycleEvents, cycleNum, prevMemoire, lang) {
  const isEn = lang === 'en';
  const votes     = cycleEvents.filter(e => e.type === 'vote');
  const secessions = cycleEvents.filter(e => e.type === 'secession');
  const amendments = cycleEvents.filter(e => e.type === 'constitution');
  const statsEv   = cycleEvents.find(e => e.type === 'cycle_stats');
  const myStat    = statsEv?.snapshot?.find(s => s.countryId === country.id);

  const sat  = country.satisfaction ?? 50;
  const aria = country.aria_current ?? 40;
  const satDelta  = myStat?.satDelta  ?? 0;
  const ariaDelta = myStat?.ariaDelta ?? 0;

  const parts = [];

  // Premier cycle
  if (cycleNum === 1 || !prevMemoire) {
    parts.push(isEn
      ? `${country.nom} enters its first deliberation cycle.`
      : `${country.nom} entre dans son premier cycle de délibération.`);
  } else {
    parts.push(prevMemoire);
  }

  // Résultats du cycle
  if (votes.length > 0) {
    const oui = votes.filter(v => v.vote === 'oui').length;
    const non = votes.length - oui;
    if (isEn) {
      parts.push(`Cycle ${cycleNum}: ${votes.length} vote${votes.length > 1 ? 's' : ''} — ${oui} YES, ${non} NO.`);
    } else {
      parts.push(`Cycle ${cycleNum} : ${votes.length} vote${votes.length > 1 ? 's' : ''} — ${oui} OUI, ${non} NON.`);
    }
  }

  // Tendance satisfaction
  if (satDelta !== 0) {
    if (satDelta > 0) {
      parts.push(isEn
        ? `Popular approval rises (+${satDelta} pts, now ${sat}%).`
        : `La satisfaction populaire progresse (+${satDelta} pts, désormais ${sat}%).`);
    } else {
      parts.push(isEn
        ? `Popular approval weakens (${satDelta} pts, now ${sat}%).`
        : `La satisfaction populaire s'érode (${satDelta} pts, désormais ${sat}%).`);
    }
  }

  // Sécession
  if (secessions.length > 0) {
    const s = secessions[0];
    parts.push(isEn
      ? `A fracture: ${s.childNom} secedes. The ${s.relation} shapes what follows.`
      : `Une fracture : ${s.childNom} fait sécession. La relation ${s.relation} marque la suite.`);
  }

  // Amendements
  if (amendments.length > 0) {
    parts.push(isEn
      ? `The constitution was amended — the institutional order shifts.`
      : `La constitution a été amendée — l'ordre institutionnel se réajuste.`);
  }

  // ARIA
  if (Math.abs(ariaDelta) >= 3) {
    parts.push(isEn
      ? `ARIA adherence ${ariaDelta > 0 ? 'strengthens' : 'weakens'} (${ariaDelta > 0 ? '+' : ''}${ariaDelta} pts, now ${aria}%).`
      : `L'adhésion ARIA ${ariaDelta > 0 ? 'se renforce' : 's\'affaiblit'} (${ariaDelta > 0 ? '+' : ''}${ariaDelta} pts, désormais ${aria}%).`);
  }

  return parts.join(' ');
}

// ── Prompt IA ─────────────────────────────────────────────────────────────────

function buildChroniqueurPrompt(country, cycleEvents, cycleNum, prevMemoire, lang) {
  const isEn = lang === 'en';
  const votes      = cycleEvents.filter(e => e.type === 'vote');
  const secessions = cycleEvents.filter(e => e.type === 'secession');
  const amendments = cycleEvents.filter(e => e.type === 'constitution');
  const statsEv    = cycleEvents.find(e => e.type === 'cycle_stats');
  const myStat     = statsEv?.snapshot?.find(s => s.countryId === country.id);

  const votesSummary = votes.map(v =>
    `  - "${v.question}" → ${v.vote.toUpperCase()}${v.impacts?.satisfaction ? ` (SAT ${v.impacts.satisfaction > 0 ? '+' : ''}${Math.round(v.impacts.satisfaction)})` : ''}`
  ).join('\n');

  const statsSummary = myStat
    ? (isEn
        ? `SAT: ${country.satisfaction}% (${myStat.satDelta > 0 ? '+' : ''}${myStat.satDelta} this cycle) | ARIA: ${country.aria_current}% (${myStat.ariaDelta > 0 ? '+' : ''}${myStat.ariaDelta})`
        : `SAT : ${country.satisfaction}% (${myStat.satDelta > 0 ? '+' : ''}${myStat.satDelta} ce cycle) | ARIA : ${country.aria_current}% (${myStat.ariaDelta > 0 ? '+' : ''}${myStat.ariaDelta})`)
    : '';

  const prefix = isEn ? 'Respond in English.\n' : '';

  return `${prefix}Tu es le Chroniqueur institutionnel de ${country.nom}.
Ton rôle : tenir la mémoire vivante du gouvernement. Pas une liste de faits — une narration qui porte le poids du passé et éclaire les décisions à venir.

${prevMemoire ? `Mémoire institutionnelle précédente (cycles 1 à ${cycleNum - 1}) :
"${prevMemoire}"

` : ''}Événements du cycle ${cycleNum} :
${votes.length > 0 ? `Votes :\n${votesSummary}` : 'Aucun vote ce cycle.'}
${secessions.length > 0 ? `Sécession : ${secessions.map(s => `${s.childNom} (relation : ${s.relation})`).join(', ')}` : ''}
${amendments.length > 0 ? `Amendements constitutionnels : ${amendments.length}` : ''}
${statsSummary}

Produis une narration institutionnelle enrichie de 3 à 5 phrases. Elle doit :
- Absorber et enrichir la mémoire précédente (ne pas l'effacer)
- Nommer les tensions, paradoxes ou continuités que tu observes
- Parler depuis la mémoire du pays, pas depuis un journal de bord
- Rester sobre, sans métaphore excessive
- Terminer par une phrase qui prépare le prochain cycle ("Le Conseil aborde le cycle ${cycleNum + 1} avec...")

Réponds UNIQUEMENT avec le texte narratif, sans guillemets, sans préambule.`;
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useChroniqueur() {

  const runChroniqueur = useCallback(async (country, cycleEvents, cycleNum) => {
    const opts = getOptions();
    if (!opts.chroniqueur?.enabled) return;

    const lang       = loadLang();
    const prevEntry  = loadMemoire(country.id);
    const prevMemoire = prevEntry?.memoire || null;

    // Filtrer events pour ce pays
    const countryEvents = cycleEvents.filter(ev =>
      ev.countryId === country.id || ev.type === 'cycle_stats'
    );

    if (countryEvents.length === 0 && !prevMemoire) return;

    let memoire = null;

    // IA mode
    const iaMode = opts.ia_mode;
    const keys   = opts.api_keys || {};
    const hasKey = keys.claude || keys.gemini || keys.grok || keys.openai;

    if (iaMode !== 'none' && iaMode !== 'board_game' && hasKey) {
      try {
        const prompt = buildChroniqueurPrompt(country, countryEvents, cycleNum, prevMemoire, lang);
        const raw    = await callAI(prompt, 'council_chroniqueur');
        if (raw && typeof raw === 'string' && raw.trim().length > 20) {
          memoire = raw.trim();
        }
      } catch (e) {
        console.warn('[Chroniqueur] IA failed, falling back to deterministic:', e);
      }
    }

    // Fallback déterministe
    if (!memoire) {
      memoire = buildNarrationDeterministe(country, countryEvents, cycleNum, prevMemoire, lang);
    }

    saveMemoire(country.id, memoire, cycleNum);
  }, []);

  return { runChroniqueur, loadMemoire, resetChroniqueur };
}
