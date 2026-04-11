// src/features/council/services/routingEngine.js

// ============================================================
// ROUTAGE DES QUESTIONS VERS LES MINISTÈRES
// ============================================================

import { callAI, getApiKeys } from '../../../shared/services/llm/aiService';
import { getMinistriesList, getDestin } from './agentsManager';
import { langPrefix } from './contextBuilder';

/** Ministère par défaut si routing impossible (score keywords = 0 → question garbage) */
const DEFAULT_MINISTRY_ID = null;

/** Retourne vrai si la question est orpheline (aucun keyword matche) */
export function isOrphanQuestion(question) {
    const q = question.toLowerCase();
    for (const m of getMinistriesList()) {
        const kws = m.keywords || [];
        if (kws.some(kw => q.includes(kw.toLowerCase()))) return false;
    }
    return true;
}

/**
 * Cherche le ministère le plus pertinent pour une question.
 * Mode local  : score sur keywords (intersection mots)
 * Mode IA     : demande à l'IA de router via JSON
 *
 * @param {string} question
 * @param {string|null} forceMinistryId — si l'utilisateur a cliqué sur un ministère
 * @returns {Promise<string>} ministryId
 */
export async function routeQuestion(question, forceMinistryId = null) {
    if (forceMinistryId) return forceMinistryId;

    const keys = getApiKeys();
    const q = question.toLowerCase();

    // ── Mode local : score keywords ──────────────────────────────────────────
    if (!keys.claude && !keys.gemini) {
        return localKeywordRoute(q);
    }

    // ── Mode IA ──────────────────────────────────────────────────────────────
    const ministryList = getMinistriesList().map(m => `${m.id} (${m.name})`).join(', ');
    const prompt = `${langPrefix()}Tu es le système de routage du gouvernement ARIA.
    Question soumise par un citoyen : "${question}"
    Ministères disponibles : ${ministryList}

    Réponds UNIQUEMENT en JSON : { "ministry_id": "l'id le plus pertinent parmi les options" }`;

    try {
        const result = await callAI(prompt, 'council_routing');
        if (result?.ministry_id && getMinistriesList().find(m => m.id === result.ministry_id)) {
            return result.ministry_id;
        }
    } catch {}

    // Fallback local si IA échoue
    return localKeywordRoute(q);
}

/** Score local sur keywords — null si aucun keyword ne matche (question garbage) */
function localKeywordRoute(questionLow) {
    const match = getBestMatch(questionLow);
    return match ? match.ministryId : null;
}

/**
 * Détecte si une question relève du domaine "Destinée du Monde" (crise/anomalie/aléa).
 * Synchrone, local uniquement — ne modifie pas le routage standard.
 * @param {string} question
 * @returns {boolean}
 */
export function detectCrisis(question) {
    const destin = getDestin();
    if (!destin?.keywords?.length) return false;
    const q = question.toLowerCase();
    return destin.keywords.some(kw => q.includes(kw.toLowerCase()));
}

/**
 * Retourne le meilleur ministère et son score pour une question (synchrone, local uniquement).
 * Retourne null si score = 0 (question garbage — aucun keyword ne matche).
 * @param {string} question
 * @returns {{ ministryId: string, score: number } | null}
 */
export function getBestMatch(question) {
    const q = question.toLowerCase();
    let best = null, bestScore = 0;
    for (const m of getMinistriesList()) {
        const kws = m.keywords || [];
        const score = kws.filter(kw => q.includes(kw.toLowerCase())).length;
        if (score > bestScore) { bestScore = score; best = m.id; }
    }
    return best ? { ministryId: best, score: bestScore } : null;
}
