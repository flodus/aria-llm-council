// src/shared/services/boardgame/questionService.js

// ═══════════════════════════════════════════════════════════════════════════
//  questionService — Questions de délibération pour le mode Board Game
//  Sources  : templates/aria_questions.json (par_ministere + pool_transversal)
//  Anti-doublon : lit aria_chronolog_cycles dans localStorage
//  Échantillonnage : 6 questions par ministère + suggestion intelligente
// ═══════════════════════════════════════════════════════════════════════════

import QUESTIONS_FR from '../../../../templates/aria_questions.json';
import { loadLang } from '../../../ariaI18n';

// Générateur pseudo-aléatoire seedable (mulberry32)
function seededRandom(seed) {
    return function() {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Seed global pour la session
let currentSeed = Math.floor(Math.random() * 999999);
let rand = seededRandom(currentSeed);

export function setQuestionSeed(seed) {
    currentSeed = typeof seed === 'number' ? seed :
    typeof seed === 'string' ? strToSeed(seed) :
    Math.floor(Math.random() * 999999);
    rand = seededRandom(currentSeed);
}

function strToSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h);
}

const FALLBACK_QUESTIONS = [
    "Faut-il réformer le système judiciaire en profondeur ?",
"Comment réduire les inégalités économiques sans freiner la croissance ?",
"La sécurité nationale justifie-t-elle des restrictions de liberté ?",
"Faut-il accélérer la transition écologique malgré le coût social ?",
"L'éducation publique doit-elle rester gratuite à tous les niveaux ?",
];

const LS_KEY = 'aria_chronolog_cycles';

function loadQuestions() {
    try {
        // Quand aria_questions_en.json sera créé, ajouter ici :
        // if (loadLang() === 'en') { try { return QUESTIONS_EN; } catch {} }
        return QUESTIONS_FR;
    } catch {
        return null;
    }
}

// ============================================================
// FONCTIONS D'HISTORIQUE
// ============================================================

/**
 * Récupère l'historique complet des questions avec leurs résultats
 * @param {string} countryId
 * @param {string|null} ministryId
 * @returns {Array<{
 *   question: string,
 *   date: number,
 *   cycle: number,
 *   vote: 'oui'|'non'|'phare'|'boussole',
 *   voteType: 'referendum'|'binary',
 *   color: string,
 *   label: string
 * }>}
 */
export function getQuestionHistory(countryId, ministryId = null) {
    try {
        const cycles = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        const history = [];

        cycles.forEach(cycle => {
            (cycle.events || []).forEach(event => {
                if (event.type === 'vote' &&
                    event.countryId === countryId &&
                    (!ministryId || event.ministereId === ministryId)) {

                    // Déterminer la couleur selon le vote
                    let color = '#4CAF50'; // vert par défaut
                    if (event.vote === 'non') color = '#F44336';
                    else if (event.vote === 'phare') color = '#C8A44A'; // or
                    else if (event.vote === 'boussole') color = '#9B7EC8'; // violet

                    history.push({
                        question: event.question,
                        date: event.ts,
                        cycle: cycle.cycleNum,
                        vote: event.vote,
                        voteType: event.voteType || 'referendum',
                        color,
                        label: event.label || '',
                    });
                    }
            });
        });

        // Trier du plus récent au plus ancien
        return history.sort((a, b) => b.date - a.date);
    } catch {
        return [];
    }
}

/**
 * Récupère l'état d'une question (si déjà posée et résultat)
 * @param {string} question
 * @param {string} countryId
 * @param {string|null} ministryId
 * @returns {object|null}
 */
export function getQuestionState(question, countryId, ministryId = null) {
    const history = getQuestionHistory(countryId, ministryId);
    return history.find(h => h.question === question) || null;
}

/**
 * Vérifie si une question a déjà été posée
 */
export function isQuestionUsed(question, countryId, ministryId = null) {
    return getQuestionState(question, countryId, ministryId) !== null;
}

// ============================================================
// FONCTIONS D'ÉCHANTILLONNAGE (NOUVELLES)
// ============================================================

/**
 * Récupère un échantillon de questions pour un ministère
 * @param {string} ministryId
 * @param {string|null} countryId
 * @param {number} cycleActuel - numéro du cycle en cours
 * @param {string|null} questionDuCycle - question déjà posée ce cycle (à exclure du tirage)
 * @param {number} count - nombre de questions à retourner (défaut: 6)
 * @returns {Array<{question: string, state: object|null}>}
 */
export function getMinistryQuestionsSample(ministryId, countryId, cycleActuel, questionDuCycle = null, count = 6) {
    const data = loadQuestions();
    const pool = data?.par_ministere?.[ministryId]?.questions || [];
    if (!pool.length) return [];

    // Exclure la question du cycle actuel du tirage
    let poolForRandom = pool;
    if (questionDuCycle) {
        poolForRandom = pool.filter(q => q !== questionDuCycle);
    }

    // Mélanger avec notre seed
    const shuffled = [...poolForRandom].sort(() => rand() - 0.5);

    // Prendre les N premières
    const sample = shuffled.slice(0, count);

    // Ajouter l'état pour chaque question (AVEC RECHERCHE FRAÎCHE À CHAQUE FOIS)
    const result = sample.map(question => ({
        question,
        state: getQuestionState(question, countryId, ministryId)  // ← Recalculé à chaque appel
    }));

    // Si on a une question du cycle actuel, l'ajouter à la fin
    if (questionDuCycle) {
        const state = getQuestionState(questionDuCycle, countryId, ministryId);
        const enhancedState = state ? { ...state } : {
            used: true,
            cycle: cycleActuel,
            color: '#C8A44A',
            vote: null,
            label: 'Question en cours de délibération'
        };
        enhancedState.isCurrentCycle = true;
        enhancedState.cycle = cycleActuel;

        result.push({
            question: questionDuCycle,
            state: enhancedState
        });
    }

    return result;
}

/**
 * Récupère une suggestion (exclut la question du cycle actuel)
 * @param {string} ministryId
 * @param {string|null} countryId
 * @param {string|null} questionDuCycle - question à exclure
 * @returns {string|null}
 */
export function getSuggestion(ministryId, countryId, questionDuCycle = null) {
    const data = loadQuestions();
    const pool = data?.par_ministere?.[ministryId]?.questions || [];
    if (!pool.length) return pickRandom(FALLBACK_QUESTIONS);

    // Exclure la question du cycle actuel
    let available = pool;
    if (questionDuCycle) {
        available = pool.filter(q => q !== questionDuCycle);
    }

    return pickRandom(available);
}

// ============================================================
// FONCTIONS DE BASE (avec anti-doublon amélioré)
// ============================================================

function getDejaPosees(countryId = null) {
    try {
        const cycles = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        return cycles
        .flatMap(c => c.events || [])
        .filter(e => e.type === 'vote' && (!countryId || e.countryId === countryId))
        .map(e => e.question)
        .filter(Boolean);
    } catch {
        return [];
    }
}

function filterDoublons(questions, dejaPosees, questionDuCycle = null) {
    // Exclure aussi la question du cycle actuel
    const exclude = new Set(dejaPosees);
    if (questionDuCycle) exclude.add(questionDuCycle);

    const filtered = questions.filter(q => !exclude.has(q));
    return filtered.length > 0 ? filtered : questions;
}

function pickRandom(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(rand() * arr.length)];
}

/**
 * Pioche une question pour un ministère donné.
 * @param {string} ministryId
 * @param {string|null} countryId
 * @param {string|null} questionDuCycle - question à exclure
 * @param {number|null} seedOverride
 * @returns {string|null}
 */
export function getQuestionForMinistry(ministryId, countryId = null, questionDuCycle = null, seedOverride = null) {
    if (seedOverride !== null) setQuestionSeed(seedOverride);
    const data = loadQuestions();
    const pool = data?.par_ministere?.[ministryId]?.questions || [];
    if (!pool.length) return pickRandom(FALLBACK_QUESTIONS);

    const dejaPosees = getDejaPosees(countryId);
    const disponibles = filterDoublons(pool, dejaPosees, questionDuCycle);

    return pickRandom(disponibles);
}

/**
 * Pioche une question transversale.
 */
export function getTransversalQuestion(categorie = null, countryId = null, questionDuCycle = null, seedOverride = null) {
    if (seedOverride !== null) setQuestionSeed(seedOverride);
    const data = loadQuestions();
    const transversal = data?.pool_transversal;
    if (!transversal) return pickRandom(FALLBACK_QUESTIONS);

    const categories = ['quotidien', 'crise_et_peur', 'ideologique', 'anomalie_et_scifi'];
    const cat = (categorie && categories.includes(categorie))
    ? categorie
    : pickRandom(categories);

    const pool = transversal[cat]?.questions || [];
    if (!pool.length) return pickRandom(FALLBACK_QUESTIONS);

    const dejaPosees = getDejaPosees(countryId);
    const disponibles = filterDoublons(pool, dejaPosees, questionDuCycle);
    return pickRandom(disponibles);
}

/**
 * Pioche une question aléatoire toutes catégories confondues.
 */
export function getRandomQuestion(countryId = null, questionDuCycle = null, seedOverride = null) {
    if (seedOverride !== null) setQuestionSeed(seedOverride);
    const data = loadQuestions();
    if (!data) return pickRandom(FALLBACK_QUESTIONS);

    const toutes = [
        ...Object.values(data.par_ministere || {}).flatMap(m => m.questions || []),
        ...Object.values(data.pool_transversal || {}).flatMap(c => c.questions || []),
    ];

    if (!toutes.length) return pickRandom(FALLBACK_QUESTIONS);

    const dejaPosees = getDejaPosees(countryId);
    const disponibles = filterDoublons(toutes, dejaPosees, questionDuCycle);
    return pickRandom(disponibles);
}

/**
 * Retourne toutes les questions d'un ministère.
 */
export function getAllQuestionsForMinistry(ministryId) {
    const data = loadQuestions();
    return data?.par_ministere?.[ministryId]?.questions || [];
}

// Export par défaut
export default {
    getQuestionForMinistry,
    getTransversalQuestion,
    getRandomQuestion,
    getAllQuestionsForMinistry,
    getQuestionHistory,
    getQuestionState,
    isQuestionUsed,
    getMinistryQuestionsSample,
    getSuggestion,
    setQuestionSeed
};
