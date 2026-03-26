// src/shared/services/boardgame/responseService.js
// ═══════════════════════════════════════════════════════════════════════════
//  responseService — Réponses locales mode Board Game
//
//  Lit aria_reponses.json (archetypes × régime × posture)
//  Structure source : ministers.{archetype}.reponses.{regime}.{posture}[]
//                     ministeres.{ministere}.reponses.{regime}.{posture}[]
//                     presidence.{role}.styles.{style}[]
//
//  Fallbacks : régime inconnu → _meta.fallbacks → democratie_liberale
// ═══════════════════════════════════════════════════════════════════════════

import { getAgents } from '../../../Dashboard_p1';
import REPONSES_FR    from '../../../../templates/languages/fr/aria_reponses.json';
import SYNTHESES_FR   from '../../../../templates/languages/fr/aria_syntheses.json';
import ANNOTATIONS_FR from '../../../../templates/languages/fr/aria_annotations.json';
// import REPONSES_EN    from '../../../../templates/languages/en/aria_reponses.json';    // à activer
// import SYNTHESES_EN   from '../../../../templates/languages/en/aria_syntheses.json';   // à activer
// import ANNOTATIONS_EN from '../../../../templates/languages/en/aria_annotations.json'; // à activer


function chargerReponses() {
    // Plus tard : if (loadLang() === 'en') { try { return REPONSES_EN; } catch {} }
    return REPONSES_FR;
}

function chargerSyntheses() {
    // Plus tard : if (loadLang() === 'en') { try { return SYNTHESES_EN; } catch {} }
    return SYNTHESES_FR;
}

function chargerAnnotations() {
    // Plus tard : if (loadLang() === 'en') { try { return ANNOTATIONS_EN; } catch {} }
    return ANNOTATIONS_FR;
}

function resoudreRegime(regime, fallbacks) {
    if (!regime) return 'democratie_liberale';
    return fallbacks[regime] || regime;
}

function piocherDansPool(pool) {
    if (!pool?.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Retourne la posture par défaut d'un archétype
 */
export function getPostureForArchetype(archetypeId) {
    return getAgents().ministers[archetypeId]?.posture_defaut || 'statu_quo';
}

/**
 * Récupère une réponse locale pour un archétype (ministre)
 * @param {string} archetypeId - initiateur, gardien, etc.
 * @param {string|null} regime  - régime politique du pays (null → democratie_liberale)
 * @param {string|null} posture - radical/prudent/statu_quo (déduit si null)
 * @returns {string|null}
 */
export function getLocalResponse(archetypeId, regime = null, posture = null) {
    const data = chargerReponses();
    if (!data) return null;

    const fallbacks      = data._meta?.fallbacks || {};
    const regimeResolu   = resoudreRegime(regime, fallbacks);
    const postureEffective = posture || getPostureForArchetype(archetypeId);

    try {
        // Tentative avec le régime résolu
        const pool = data.ministers?.[archetypeId]?.reponses?.[regimeResolu]?.[postureEffective];
        const resultat = piocherDansPool(pool);
        if (resultat) return resultat;

        // Fallback vers democratie_liberale si régime inconnu dans le JSON
        const poolFallback = data.ministers?.[archetypeId]?.reponses?.democratie_liberale?.[postureEffective];
        return piocherDansPool(poolFallback);
    } catch (e) {
        console.warn('getLocalResponse — lookup échoué :', e);
        return null;
    }
}

/**
 * Récupère une réponse locale pour un ministère (synthèse)
 * @param {string} ministereId - justice, economie, defense, etc.
 * @param {string|null} regime
 * @param {string|null} posture
 * @returns {string|null}
 */
export function getMinistereResponse(ministereId, regime = null, posture = null) {
    const data = chargerReponses();
    if (!data) return null;

    const fallbacks       = data._meta?.fallbacks || {};
    const regimeResolu    = resoudreRegime(regime, fallbacks);
    const postureEffective = posture || 'statu_quo';

    try {
        const pool = data.ministeres?.[ministereId]?.reponses?.[regimeResolu]?.[postureEffective];
        const resultat = piocherDansPool(pool);
        if (resultat) return resultat;

        const poolFallback = data.ministeres?.[ministereId]?.reponses?.democratie_liberale?.[postureEffective];
        return piocherDansPool(poolFallback);
    } catch (e) {
        console.warn('getMinistereResponse — lookup échoué :', e);
        return null;
    }
}

/**
 * Récupère une réponse de la présidence
 * @param {string} role  - phare | boussole
 * @param {string} style - vision | conflit_ministeriel | validation | ...
 * @returns {string|null}
 */
export function getPresidenceResponse(role, style) {
    const data = chargerReponses();
    if (!data) return null;

    try {
        const pool = data.presidence?.[role]?.styles?.[style];
        return piocherDansPool(pool);
    } catch (e) {
        console.warn('getPresidenceResponse — lookup échoué :', e);
        return null;
    }
}

/**
 * Récupère un texte de synthèse pour un ministère (mode offline)
 * @param {string} ministereId  - justice, economie, defense, etc.
 * @param {string|null} regime  - régime politique du pays
 * @param {boolean} convergence - true = convergence, false = divergence
 * @returns {string|null}
 */
export function getSyntheseMinistere(ministereId, regime = null, convergence = true) {
    const data = chargerSyntheses();
    if (!data) return null;

    const fallbacks    = data._meta?.fallbacks || {};
    const regimeResolu = resoudreRegime(regime, fallbacks);
    const typeKey      = convergence ? 'convergence' : 'divergence';

    try {
        const pool = data.ministeres?.[ministereId]?.[regimeResolu]?.[typeKey];
        const resultat = piocherDansPool(pool);
        if (resultat) return resultat;

        const poolFallback = data.ministeres?.[ministereId]?.democratie_liberale?.[typeKey];
        return piocherDansPool(poolFallback);
    } catch (e) {
        console.warn('getSyntheseMinistere — lookup échoué :', e);
        return null;
    }
}

/**
 * Récupère un texte de synthèse présidentielle (mode offline)
 * @param {boolean} convergence - true = convergence, false = divergence
 * @returns {string|null}
 */
export function getSynthesePresidence(convergence = true) {
    const data = chargerSyntheses();
    if (!data) return null;

    const typeKey = convergence ? 'convergence' : 'divergence';
    try {
        return piocherDansPool(data.presidence?.[typeKey]);
    } catch (e) {
        console.warn('getSynthesePresidence — lookup échoué :', e);
        return null;
    }
}

/**
 * Récupère une synthèse collégiale (mode offline, présidence désactivée)
 * @param {string|null} regime      - régime politique du pays
 * @param {boolean}     convergence - true = convergence, false = divergence
 * @returns {string|null}
 */
export function getSyntheseCollegial(regime = null, convergence = true) {
    const data = chargerSyntheses();
    if (!data) return null;

    const parRegime    = data.collegial?.par_regime;
    if (!parRegime) return null;

    const typeKey      = convergence ? 'convergence' : 'divergence';
    const fallbackOrder = data.collegial?._meta?.fallback_order || ['democratie_liberale'];

    // Résolution nearest-neighbor : régime exact → ordre fallback → democratie_liberale
    const regimeResolu = (regime && parRegime[regime])
        ? regime
        : (fallbackOrder.find(r => parRegime[r]) || 'democratie_liberale');

    try {
        const pool = parRegime[regimeResolu]?.[typeKey];
        const resultat = piocherDansPool(pool);
        if (resultat) return resultat;
        return piocherDansPool(parRegime['democratie_liberale']?.[typeKey]);
    } catch (e) {
        console.warn('getSyntheseCollegial — lookup échoué :', e);
        return null;
    }
}

/**
 * Récupère un texte d'annotation pour un ministère du cercle (mode offline)
 * @param {string} ministereId  - justice, economie, defense, etc.
 * @param {string|null} regime  - régime politique du pays
 * @returns {string|null}
 */
export function getAnnotationMinistere(ministereId, regime = null) {
    const data = chargerAnnotations();
    if (!data) return null;

    const fallbacks    = data._meta?.fallbacks || {};
    const regimeResolu = resoudreRegime(regime, fallbacks);

    try {
        const pool = data.ministeres?.[ministereId]?.[regimeResolu];
        const resultat = piocherDansPool(pool);
        if (resultat) return resultat;

        const poolFallback = data.ministeres?.[ministereId]?.democratie_liberale;
        return piocherDansPool(poolFallback);
    } catch (e) {
        console.warn('getAnnotationMinistere — lookup échoué :', e);
        return null;
    }
}

/**
 * No-op — import statique, pas de cache à vider
 * Conservé pour compatibilité API avec l'ancienne version fetch-based
 */
export function clearResponsesCache() {}

export default { getPostureForArchetype, getLocalResponse, getMinistereResponse, getPresidenceResponse, clearResponsesCache };
