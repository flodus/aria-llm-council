// src/features/council/services/presidenceVote.js
// ============================================================
// SOURCE UNIQUE — convergence des présidents et options de vote
// ============================================================
// Utilisée par le mode LLM (synthèse IA) ET par le mode Board Game (repli sans IA).
// Seul le TEXTE des décisions dépend du mode ; la règle de convergence, les
// options de vote et la forme des données ne changent jamais.

import { COLORS } from '../../../shared/theme';

const MOTS_ACTION   = ['adopter', 'action', 'immédiat', 'ferme', 'lancer', 'engager', 'agir', 'exécuter', 'réaliser'];
const MOTS_PRUDENCE = ['consulter', 'prudence', 'attente', 'étudier', 'analyser', 'temporiser', 'reporter', 'suspendre'];

/** Classe une décision libre : 'action', 'prudence' ou 'neutre' (mots-clés). */
export function classerDecision(texte) {
    const d = (texte || '').toLowerCase();
    if (MOTS_ACTION.some(w => d.includes(w)))   return 'action';
    if (MOTS_PRUDENCE.some(w => d.includes(w))) return 'prudence';
    return 'neutre';
}

/**
 * Règle unique : convergence si une MAJORITÉ STRICTE des présidents va dans le même sens.
 * Pour deux présidents, il faut qu'ils s'accordent (sinon divergence).
 * @param {string[]} decisions — une décision par président, dans l'ordre (Phare, Boussole…)
 */
export function determinerConvergence(decisions) {
    const N = decisions.length;
    if (N < 2) return true;
    const classes = decisions.map(classerDecision);
    const nbAction   = classes.filter(c => c === 'action').length;
    const nbPrudence = classes.filter(c => c === 'prudence').length;
    return nbAction > N / 2 || nbPrudence > N / 2;
}

/** Question soumise au vote, selon la convergence. */
export function construireQuestionVote(convergence, decisionMajoritaire) {
    return convergence
        ? `Approuvez-vous la proposition suivante : "${decisionMajoritaire}" ?`
        : 'Quelle direction le gouvernement doit-il suivre ?';
}

/**
 * Options de vote.
 * Convergence → OUI / NON (vert, rouge).
 * Divergence  → le Phare (or) contre la Boussole (violet), chacun avec sa décision.
 * @param {boolean} convergence
 * @param {Array<{name, symbol, decision}>} presidents — dans l'ordre (Phare, Boussole…)
 */
export function construireOptionsVote(convergence, presidents) {
    if (convergence) {
        return {
            oui: { label: 'OUI — ADOPTER', color: COLORS.greenHex, icon: '✓' },
            non: { label: 'NON — REJETER', color: COLORS.redHex,   icon: '✕' },
        };
    }
    const [phare, boussole] = presidents;
    return {
        oui: {
            label: `${phare?.symbol || '☉'} ${phare?.name || 'Le Phare'} — ${phare?.decision || 'Action prioritaire.'}`,
            color: COLORS.goldHex,
            icon: phare?.symbol || '☉',
        },
        non: {
            label: `${boussole?.symbol || '☽'} ${boussole?.name || 'La Boussole'} — ${boussole?.decision || 'Prudence et consultation.'}`,
            color: COLORS.purpleHex,
            icon: boussole?.symbol || '☽',
        },
    };
}

/**
 * Point d'entrée unique : à partir des présidents (positions déjà produites
 * par l'IA ou par le repli), renvoie tout ce que l'écran et le vote attendent.
 * @param {Array<{id, name, symbol, decision}>} presidents
 * @param {object} [texteSynthese] — question proposée par l'IA, si disponible
 */
export function synthetiserPresidence(presidents, texteSynthese = {}) {
    const decisions = presidents.map(p => p.decision || '');
    const convergence = determinerConvergence(decisions);
    const decisionMajoritaire = decisions[0] || 'Action prioritaire.';
    return {
        convergence,
        voteType: 'referendum',
        voteOptions: construireOptionsVote(convergence, presidents),
        voteQuestion: texteSynthese.question_referendum || construireQuestionVote(convergence, decisionMajoritaire),
        question_referendum: texteSynthese.question_referendum || construireQuestionVote(convergence, decisionMajoritaire),
        position_majority_resume: decisions[0] || null,
        position_minority_resume: decisions[1] || null,
        position_phare_resume:    decisions[0] || null,
        position_boussole_resume: decisions[1] || null,
        positions_presidentielles: presidents.map(p => ({
            id: p.id, name: p.name, symbol: p.symbol, resume: p.decision || '',
        })),
    };
}
