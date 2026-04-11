// src/features/council/services/councilEngine.js

// ═══════════════════════════════════════════════════════════════════════════════
//  councilEngine.js — Orchestrateur principal du Conseil ARIA
//
//  Ce fichier a été refactoré. La logique métier a été extraite vers :
//    - agentsManager.js      (gestion des agents)
//    - deliberationEngine.js (phases de délibération)
//    - routingEngine.js      (routage des questions)
//    - voteEngine.js         (calcul d'impact des votes)
//    - contextBuilder.js     (construction du contexte pays)
//    - fallbacks.js          (réponses de secours)
//
//  NE RESTE ICI QUE LA FONCTION PRINCIPALE D'ORCHESTRATION
// ═══════════════════════════════════════════════════════════════════════════════

import { callAI, getApiKeys } from '../../../shared/services/llm/aiService';
import { getStats } from '../../../shared/data/gameData';
import { getOptions } from '../../../shared/config/options';
import { loadLang } from '../../../ariaI18n';
import { getAgentsFor, getMinistriesList, getMinistriesListFor, getMinistersMapFor, getPresidencyFor, MINISTRIES_LIST, MINISTERS_MAP, PRESIDENCY } from './agentsManager';
import { runMinisterePhase, runCerclePhase, runPresidencePhase, runDestinPhase, runCrisisPhase } from './deliberationEngine';
import { routeQuestion, isOrphanQuestion, detectCrisis } from './routingEngine';
import { computeVoteImpact } from './voteEngine';
import { buildCountryContext } from './contextBuilder';
import { FALLBACK_RESPONSES } from './fallbacks';

// ============================================================
// FONCTION PRINCIPALE D'ORCHESTRATION
// ============================================================

/**
 * Exécute une délibération complète du Conseil
 * @param {string} question
 * @param {object} country
 * @param {object} options
 * @returns {Promise<object>} Résultat complet de la délibération
 */
export async function runCouncilDeliberation(question, country, options = {}) {
  const {
    forceMinistryId = null,
      onPhaseStart,
      onPhaseComplete,
      onError
  } = options;

  try {
    // Mode crise — tous les ministères délibèrent directement, skip cercle + présidence
    const _govGlobal = getOptions().defaultGovernance || {};
    const _gov = { ..._govGlobal, ...(country?.governanceOverride || {}) };
    if (_gov.crisis_mode !== false && detectCrisis(question)) {
        if (onPhaseStart) onPhaseStart('crisis');
        const crisisResult = await runCrisisPhase(question, country);
        if (onPhaseComplete) onPhaseComplete('crisis', crisisResult);
        return { question, country, crisis: crisisResult, timestamp: Date.now() };
    }

    // Phase 0 : Routage
    if (onPhaseStart) onPhaseStart('routing');
    const ministryId = await routeQuestion(question, forceMinistryId);
    const ministry = ministryId ? getMinistriesList().find(m => m.id === ministryId) : null;
    if (onPhaseComplete) onPhaseComplete('routing', { ministryId, ministry });

    // Phase 1 : Ministère
    if (onPhaseStart) onPhaseStart('ministere');
    const ministereResult = await runMinisterePhase(ministry, question, country);
    if (onPhaseComplete) onPhaseComplete('ministere', ministereResult);

    // Phase 2 : Cercle
    if (onPhaseStart) onPhaseStart('cercle');
    const cercleResult = await runCerclePhase(
      ministereResult.ministryId,
      question,
      ministereResult.synthese,
      country
    );
    if (onPhaseComplete) onPhaseComplete('cercle', cercleResult);

    // Phase 2b : Destin (optionnel — si destiny_mode actif + crise détectée)
    // Fusion : global aria_options.defaultGovernance < override pays
    const globalGov = getOptions().defaultGovernance || {};
    const gov = { ...globalGov, ...(country?.governanceOverride || {}) };
    const destinyActif = gov.destiny_mode === true;
    const crisisActif  = gov.crisis_mode !== false;
    const criseDetectee = crisisActif && detectCrisis(question);
    let destinResult = null;
    if (destinyActif && criseDetectee) {
        if (onPhaseStart) onPhaseStart('destin');
        destinResult = await runDestinPhase(question, country, false);
        if (onPhaseComplete) onPhaseComplete('destin', destinResult);
    }

    // Phase 3 : Présidence
    if (onPhaseStart) onPhaseStart('presidence');
    const presidenceResult = await runPresidencePhase(
      question,
      ministereResult,
      cercleResult,
      country,
      destinResult
    );
    if (onPhaseComplete) onPhaseComplete('presidence', presidenceResult);

    return {
      question,
      country,
      ministry: ministereResult,
      cercle: cercleResult,
      destin: destinResult,
      presidence: presidenceResult,
      timestamp: Date.now()
    };

  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
}

// ============================================================
// EXPORTS POUR COMPATIBILITÉ (réexport depuis les modules)
// ============================================================

// On réexporte tout ce qui peut être utile aux composants (imports directs — pas via index pour éviter le cycle)
export { getAgentsFor, getMinistriesList, getMinistriesListFor, getMinistersMapFor, getPresidencyFor, MINISTRIES_LIST, MINISTERS_MAP, PRESIDENCY } from './agentsManager';
export { runMinisterePhase, runCerclePhase, runPresidencePhase, runDestinPhase } from './deliberationEngine';
export { routeQuestion, isOrphanQuestion } from './routingEngine';
export { computeVoteImpact } from './voteEngine';
export { buildCountryContext } from './contextBuilder';
export { FALLBACK_RESPONSES } from './fallbacks';
