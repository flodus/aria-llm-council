// src/shared/services/boardgame/questionService.js
// ═══════════════════════════════════════════════════════════════════════════
//  questionService — Questions de délibération pour le mode Board Game
//  Sources  : templates/aria_questions.json (par_ministere + pool_transversal)
//  Anti-doublon : lit aria_chronolog_cycles dans localStorage
//  i18n     : charge _en.json si disponible, fallback FR
// ═══════════════════════════════════════════════════════════════════════════

import QUESTIONS_FR from '../../../../templates/aria_questions.json';
import { loadLang } from '../../../ariaI18n';
import { COLORS } from '../../theme';

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

function filterDoublons(questions, dejaPosees) {
    if (!dejaPosees.length) return questions;
    const filtered = questions.filter(q => !dejaPosees.includes(q));
    return filtered.length > 0 ? filtered : questions; // reset si tout épuisé
}

function pickRandom(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pioche une question pour un ministère donné.
 * @param {string} ministryId  ex: 'justice', 'economie', 'industrie'
 * @param {string|null} countryId  pour l'anti-doublon par pays
 * @returns {string|null}
 */
export function getQuestionForMinistry(ministryId, countryId = null) {
    const data = loadQuestions();
    const pool = data?.par_ministere?.[ministryId]?.questions || [];
    if (!pool.length) return pickRandom(FALLBACK_QUESTIONS);
    return pickRandom(filterDoublons(pool, getDejaPosees(countryId)));
}

/**
 * Pioche une question transversale.
 * @param {string|null} categorie  'quotidien'|'crise_et_peur'|'ideologique'|'anomalie_et_scifi'|null
 * @param {string|null} countryId
 * @returns {string|null}
 */
export function getTransversalQuestion(categorie = null, countryId = null) {
    const data = loadQuestions();
    const transversal = data?.pool_transversal;
    if (!transversal) return pickRandom(FALLBACK_QUESTIONS);

    const categories = ['quotidien', 'crise_et_peur', 'ideologique', 'anomalie_et_scifi'];
    const cat = (categorie && categories.includes(categorie))
    ? categorie
    : pickRandom(categories);

    const pool = transversal[cat]?.questions || [];
    if (!pool.length) return pickRandom(FALLBACK_QUESTIONS);
    return pickRandom(filterDoublons(pool, getDejaPosees(countryId)));
}

/**
 * Pioche une question aléatoire toutes catégories confondues.
 * @param {string|null} countryId
 * @returns {string|null}
 */
export function getRandomQuestion(countryId = null) {
    const data = loadQuestions();
    if (!data) return pickRandom(FALLBACK_QUESTIONS);

    const toutes = [
        ...Object.values(data.par_ministere || {}).flatMap(m => m.questions || []),
        ...Object.values(data.pool_transversal || {}).flatMap(c => c.questions || []),
    ];

    if (!toutes.length) return pickRandom(FALLBACK_QUESTIONS);
    return pickRandom(filterDoublons(toutes, getDejaPosees(countryId)));
}

/**
 * Retourne toutes les questions d'un ministère (pour affichage liste ou debug).
 * @param {string} ministryId
 * @returns {string[]}
 */
export function getAllQuestionsForMinistry(ministryId) {
    const data = loadQuestions();
    return data?.par_ministere?.[ministryId]?.questions || [];
}

// ── Historique + état des votes (source : localStorage) ───────────────────

/**
 * Retourne l'historique des votes pour un pays, filtré optionnellement par ministère.
 */
export function getQuestionHistory(countryId, ministryId = null) {
    try {
        const cycles = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        const history = [];
        cycles.forEach(cycle => {
            (cycle.events || []).forEach(event => {
                if (event.type === 'vote'
                    && event.countryId === countryId
                    && (!ministryId || event.ministereId === ministryId)) {
                    let color = COLORS.greenHex;
                    if (event.vote === 'non')      color = COLORS.redHex;
                    else if (event.vote === 'phare')    color = COLORS.goldHex;
                    else if (event.vote === 'boussole') color = COLORS.purpleHex;
                    history.push({
                        question: event.question,
                        date:     event.ts,
                        cycle:    cycle.cycleNum,
                        vote:     event.vote,
                        color,
                        label:    event.label || '',
                    });
                }
            });
        });
        return history.sort((a, b) => b.date - a.date);
    } catch { return []; }
}

/**
 * Retourne l'état d'une question (null si jamais votée pour ce pays/ministère).
 */
export function getQuestionState(question, countryId, ministryId = null) {
    return getQuestionHistory(countryId, ministryId).find(h => h.question === question) || null;
}

/**
 * Retourne un échantillon de questions pour un ministère.
 * - questionDuCycle fourni et pas encore voté → ⏳ en bas (délibération en cours)
 * - vote trouvé dans localStorage → couleur du résultat en bas
 * Gère les requalifications de routing (ministereId différent du panel ouvert).
 * @param {string} ministryId
 * @param {string|null} countryId
 * @param {number} cycleActuel
 * @param {string|null} questionDuCycle  question soumise ce cycle (pour le ⏳)
 * @param {number} count  défaut 6
 * @returns {Array<{question: string, state: object|null}>}
 */
export function getMinistryQuestionsSample(ministryId, countryId, cycleActuel, questionDuCycle = null, count = 6) {
    const data = loadQuestions();
    const pool = data?.par_ministere?.[ministryId]?.questions || [];
    if (!pool.length) return [];

    // Chercher le vote de ce cycle dans localStorage
    // Priorité : ministereId exact → puis question dans ce pool (gère le routing)
    let votedEntry = null;
    try {
        const cycles = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        const cycleData = cycles.find(c => c.cycleNum === cycleActuel);
        if (cycleData) {
            const voteEvents = (cycleData.events || []).filter(e =>
                e.type === 'vote' && e.countryId === countryId
            );
            votedEntry = voteEvents.find(e => e.ministereId === ministryId)
                      || voteEvents.find(e => pool.includes(e.question))
                      || null;
        }
    } catch {}

    const votedQuestion  = votedEntry?.question || null;
    const bottomQuestion = votedQuestion || questionDuCycle; // voted > en cours

    // Exclure la question du bas du tirage
    const poolForRandom = bottomQuestion ? pool.filter(q => q !== bottomQuestion) : pool;
    const shuffled = [...poolForRandom].sort(() => Math.random() - 0.5);
    const sample   = shuffled.slice(0, count);

    const result = sample.map(question => ({
        question,
        state: getQuestionState(question, countryId, ministryId)
    }));

    // Ajouter la question en bas avec son état
    if (bottomQuestion) {
        let state;
        if (votedEntry) {
            // Après le vote : couleur du résultat
            let color = COLORS.greenHex;
            if (votedEntry.vote === 'non')           color = COLORS.redHex;
            else if (votedEntry.vote === 'phare')    color = COLORS.goldHex;
            else if (votedEntry.vote === 'boussole') color = COLORS.purpleHex;
            state = { vote: votedEntry.vote, color, label: votedEntry.label || '', isCurrentCycle: true, cycle: cycleActuel };
        } else {
            // En cours de délibération : ⏳
            state = { isCurrentCycle: true, cycle: cycleActuel, color: COLORS.goldHex, vote: null };
        }
        result.push({ question: bottomQuestion, state });
    }

    return result;
}

/**
 * Suggestion de question pour un ministère (exclut déjà posées + question actuelle).
 */
export function getSuggestion(ministryId, countryId, questionActuelle = null) {
    const data = loadQuestions();
    const pool = data?.par_ministere?.[ministryId]?.questions || [];
    if (!pool.length) return pickRandom(FALLBACK_QUESTIONS);
    const dejaPosees = getDejaPosees(countryId);
    const available  = pool.filter(q => !dejaPosees.includes(q) && q !== questionActuelle);
    return pickRandom(available.length > 0 ? available : pool);
}
