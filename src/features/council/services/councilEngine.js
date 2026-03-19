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

import { callAI, getApiKeys, getStats } from '../../../Dashboard_p1';
import { loadLang } from '../../../ariaI18n';
import { getAgentsFor, getMinistriesList, getMinistriesListFor, getMinistersMapFor, getPresidencyFor, MINISTRIES_LIST, MINISTERS_MAP, PRESIDENCY } from './agentsManager';
import { runMinisterePhase, runCerclePhase, runPresidencePhase } from './deliberationEngine';
import { routeQuestion, isOrphanQuestion } from './routingEngine';
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

    // Phase 3 : Présidence
    if (onPhaseStart) onPhaseStart('presidence');
    const presidenceResult = await runPresidencePhase(
      question,
      ministereResult,
      cercleResult,
      country
    );
    if (onPhaseComplete) onPhaseComplete('presidence', presidenceResult);

    return {
      question,
      country,
      ministry: ministereResult,
      cercle: cercleResult,
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

// On réexporte tout ce qui peut être utile aux composants
export {
  // Agents
  getAgentsFor,
  getMinistriesList,
  getMinistriesListFor,
  getMinistersMapFor,
  getPresidencyFor,
  MINISTRIES_LIST,
  MINISTERS_MAP,
  PRESIDENCY,

  // Phases (au cas où)
  runMinisterePhase,
  runCerclePhase,
  runPresidencePhase,

  // Routage
  routeQuestion,
  isOrphanQuestion,

  // Vote
  computeVoteImpact,

  // Contexte
  buildCountryContext,

  // Fallbacks
  FALLBACK_RESPONSES
} from './index';
