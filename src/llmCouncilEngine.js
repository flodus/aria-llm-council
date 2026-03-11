// ═══════════════════════════════════════════════════════════════════════════════
//  llmCouncilEngine.js
//  Moteur de délibération du Conseil ARIA
//
//  Responsabilités :
//   1. routeQuestion()     — assigne une question à un ministère (keywords / IA)
//   2. runDeliberation()   — orchestre les 6 phases de délibération
//   3. computeVoteImpact() — calcule l'impact du vote sur les stats du pays
//
//  Phases de délibération :
//   PEUPLE_IN   → question soumise
//   MINISTERE   → 2 ministres délibèrent + synthèse du ministère
//   CERCLE      → annotation de chaque ministère (1 ligne chacun)
//   PRESIDENCE  → Phare + Boussole + synthèse présidentielle
//   PEUPLE_VOTE → vote Oui/Non ou Phare/Boussole
//   PEUPLE_OUT  → résultat + impact stats
//
//  Toutes les fonctions async retournent null en cas d'échec IA →
//  le composant bascule sur le mode local (ariaData.js)
// ═══════════════════════════════════════════════════════════════════════════════

import { callAI, getApiKeys, getStats } from './Dashboard_p1';
import AGENTS_RAW    from '../templates/base_agents.json';
import AGENTS_RAW_EN from '../templates/base_agents_en.json';
import { loadLang }  from './ariaI18n';

// ─────────────────────────────────────────────────────────────────────────────
//  DONNÉES AGENTS — runtime override via localStorage
//  aria_agents_override = { ministries, ministers, presidency, active_ministries, active_presidency, active_ministers }
//  active_ministries   = string[]  — ids des ministères actifs (undefined = tous)
//  active_presidency   = string[]  — ['phare','boussole'] subset (undefined = les deux)
//  active_ministers    = string[]  — ids des ministres actifs (undefined = tous)
// ─────────────────────────────────────────────────────────────────────────────

function getAgents() {
  const BASE = loadLang() === 'en' ? AGENTS_RAW_EN : AGENTS_RAW;
  try {
    const ov = JSON.parse(localStorage.getItem('aria_agents_override') || 'null');
    if (!ov) return BASE;

    // Les noms/labels viennent toujours du JSON localisé (BASE).
    // L'override contribue uniquement : active_*, et les prompts custom
    // (ministerPrompts, mission, essence) qui sont par nature libres de langue.
    const mergedMinistries = BASE.ministries.map(bm => {
      const om = (ov.ministries || []).find(m => m.id === bm.id);
      if (!om) return bm;
      return {
        ...bm,
        // Prompts custom de l'override (libres) — sinon valeur de BASE
        ministerPrompts: om.ministerPrompts || om.minister_prompts || bm.ministerPrompts,
        mission: om.mission || bm.mission,
      };
    });
    const mergedMinisters = { ...BASE.ministers };
    Object.keys(ov.ministers || {}).forEach(k => {
      if (mergedMinisters[k]) {
        mergedMinisters[k] = {
          ...mergedMinisters[k],
          essence:    ov.ministers[k].essence    || mergedMinisters[k].essence,
          comm:       ov.ministers[k].comm       || mergedMinisters[k].comm,
          annotation: ov.ministers[k].annotation || mergedMinisters[k].annotation,
        };
      }
    });
    const mergedPresidency = { ...BASE.presidency };
    Object.keys(ov.presidency || {}).forEach(k => {
      if (mergedPresidency[k]) {
        mergedPresidency[k] = {
          ...mergedPresidency[k],
          essence: ov.presidency[k].essence || mergedPresidency[k].essence,
        };
      }
    });

    return {
      ministries: mergedMinistries,
      ministers:  mergedMinisters,
      presidency: mergedPresidency,
      _active_ministries: ov.active_ministries || null,
      _active_presidency: ov.active_presidency || null,
      _active_ministers:  ov.active_ministers  || null,
    };
  } catch { return BASE; }
}

/** Retourne la liste des ministères actifs (filtrée si constitution le précise) */
export function getMinistriesList() {
  const agents = getAgents();
  const all = agents.ministries || [];
  const active = agents._active_ministries;
  if (!active) return all;
  return all.filter(m => active.includes(m.id));
}

/** Retourne la map des ministres (incluant custom, filtrée si active_ministers défini) */
export function getMinistersMap() {
  const agents = getAgents();
  const all    = agents.ministers || {};
  const active = agents._active_ministers;
  if (!active) return all;
  return Object.fromEntries(Object.entries(all).filter(([k]) => active.includes(k)));
}

/** Retourne la présidence active */
export function getPresidency() {
  const agents = getAgents();
  const full = agents.presidency || {};
  const active = agents._active_presidency;
  if (!active) return full;
  // Filtre les figures inactives
  return Object.fromEntries(Object.entries(full).filter(([k]) => active.includes(k)));
}

// Aliases pour compatibilité (valeurs au moment de l'import — utilisées dans les fallbacks statiques)
export const MINISTRIES_LIST = AGENTS_RAW.ministries || [];
export const MINISTERS_MAP   = AGENTS_RAW.ministers  || {};
export const PRESIDENCY      = AGENTS_RAW.presidency  || {};

// ─────────────────────────────────────────────────────────────────────────────
//  COUCHE 2 — Injection langue dans les prompts IA
//  Préfixe injecté en tête de chaque prompt si lang === 'en'.
// ─────────────────────────────────────────────────────────────────────────────
function langPrefix() {
  return loadLang() === 'en' ? 'Respond in English.\n' : '';
}

/** Ministère par défaut si routing impossible */
const DEFAULT_MINISTRY_ID = null; // null = question orpheline → FALLBACK_RESPONSES

// ─────────────────────────────────────────────────────────────────────────────
//  FALLBACK BUREAUCRATIQUE — questions orphelines hors-ligne
//  Ton : administratif, neutre, technocratique. Jamais frustrant.
// ─────────────────────────────────────────────────────────────────────────────

export const FALLBACK_RESPONSES = {
  // Réponses des "ministres fantômes" pour questions non routées
  ministerA: [
    { position: "La demande a été enregistrée sous référence ARIA-QUEUE-47. L'analyse des données historiques suggère une priorité de niveau 2. En attente de validation budgétaire inter-ministérielle.", mot_cle: 'enregistrement' },
    { position: "Le dossier a été transmis au Comité d'Évaluation Transversal. Les projections préliminaires indiquent un délai d'instruction de 12 à 18 cycles. Un accusé de réception sera émis.", mot_cle: 'transmission' },
    { position: "Procédure d'affectation en cours. Aucun ministère compétent identifié dans le référentiel standard. La question sera escaladée vers l'Instance de Coordination Interministérielle.", mot_cle: 'escalade' },
    { position: "Requête cataloguée. L'examen préliminaire révèle une complexité transversale nécessitant une consultation multi-sectorielle. Statut : PENDING_REVIEW.", mot_cle: 'analyse' },
  ],
  ministerB: [
    { position: "Conformément au protocole ARIA-7.4, toute demande sans affectation directe est soumise à un audit de pertinence. Les résultats préliminaires seront disponibles sous 3 cycles.", mot_cle: 'audit' },
    { position: "La base de données de jurisprudence ne contient pas de précédent applicable. Le système recommande l'activation du Mode Délibération Étendue. Ressources allouées : minimum.", mot_cle: 'précédent' },
    { position: "Évaluation d'impact en attente des données socio-économiques du trimestre courant. Le modèle prédictif requiert un jeu de données complémentaires avant toute recommandation.", mot_cle: 'évaluation' },
    { position: "La question dépasse le cadre des compétences ministérielles standards. Activation du protocole d'urgence intersectorielle. Priorité : normale. Délai estimé : indéterminé.", mot_cle: 'protocole' },
  ],
  synthese: [
    { convergence: true, synthese: "Le Conseil a pris note de la demande. En l'absence de ministère compétent clairement identifié, le dossier est placé sous supervision directe de l'Instance Présidentielle. Une réponse formelle sera émise après consultation des archives décisionnelles.", tension_residuelle: "L'absence de précédent crée une incertitude procédurale.", recommandation: "Activation du protocole de délibération d'urgence recommandée." },
    { convergence: true, synthese: "La question soumise excède le périmètre de compétence des ministères constitués. Le système enregistre la demande en file d'attente prioritaire. Le Phare et la Boussole ont été notifiés pour arbitrage direct.", tension_residuelle: null, recommandation: "Transmission directe à la Présidence sans délai ministériel." },
    { convergence: true, synthese: "Dossier orphelin référencé. Les protocoles standards ne permettent pas une affectation automatique. Le Conseil délibérera en session plénière lors du prochain cycle. En attendant, le statu quo est maintenu.", tension_residuelle: "L'urgence perçue de la demande contraste avec les délais procéduraux.", recommandation: "Maintien du statu quo en attente d'une délibération plénière." },
  ],
  cercleAnnotations: {
    justice:   "Aucune violation de cadre légal identifiée. La question sera instruite selon la procédure ordinaire.",
    economie:  "Impact budgétaire non quantifiable à ce stade. Réserve budgétaire contingente maintenue.",
    defense:   "Aucune implication sécuritaire directe détectée. Surveillance passive activée.",
    sante:     "Dimension sanitaire non prioritaire selon les indicateurs actuels. Veille épidémiologique nominale.",
    education: "Aucun impact sur les indicateurs d'éducation à court terme. Dossier noté pour revue annuelle.",
    ecologie:  "Évaluation d'impact environnemental différée. Principe de précaution standard appliqué.",
    chance:    "L'imprévu est par définition hors des cadres prévus. Protocole d'urgence adaptative en veille.",
  },
  presidence: {
    phare:    { position: "Le Phare observe. En l'absence de données suffisantes, la décision sera différée jusqu'à ce que la lumière soit plus nette. Une décision hâtive sur terrain incertain crée plus d'ombre que de clarté.", decision: "Suspension de délibération — instruction complémentaire requise." },
    boussole: { position: "La Boussole note l'incertitude du terrain. La mémoire institutionnelle ne contient pas de précédent direct. La prudence impose une attente avant tout engagement irréversible.", decision: "Maintien du statu quo — consultation citoyenne élargie recommandée." },
    synthese: { convergence: true, position_phare_resume: "Suspendre jusqu'à plus ample information.", position_boussole_resume: "Maintenir le statu quo le temps d'une consultation.", question_referendum: "Souhaitez-vous maintenir le statu quo en attendant une instruction complète du dossier ?", enjeu_principal: "La décision engage la crédibilité du Conseil face à une question sans précédent." },
  },
};

/** Retourne vrai si la question est orpheline (aucun keyword matche) */
export function isOrphanQuestion(question) {
  const q = question.toLowerCase();
  for (const m of getMinistriesList()) {
    const kws = m.keywords || [];
    if (kws.some(kw => q.includes(kw.toLowerCase()))) return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
//  1. ROUTING — assigne une question à un ministère
// ─────────────────────────────────────────────────────────────────────────────

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

/** Score local sur keywords — retourne null si aucun match (question orpheline) */
function localKeywordRoute(questionLow) {
  let best = null, bestScore = 0;
  for (const m of getMinistriesList()) {
    const kws = m.keywords || [];
    const score = kws.filter(kw => questionLow.includes(kw.toLowerCase())).length;
    if (score > bestScore) { bestScore = score; best = m.id; }
  }
  return best; // null si bestScore === 0
}

// ─────────────────────────────────────────────────────────────────────────────
//  2. PHASES DE DÉLIBÉRATION
//  Chaque fonction retourne un objet de résultat ou null (fallback local)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Phase MINISTERE : délibération des 2 ministres + synthèse
 * Si ministry === null → question orpheline → retourne FALLBACK_RESPONSES bureaucratique
 * @param {object|null} ministry  — objet ministère complet depuis base_agents.json, ou null
 * @param {string} question
 * @param {object} country   — pays sélectionné (contexte stats)
 * @returns {Promise<{ ministerA, ministerB, synthese, isOrphan? }>}
 */
export async function runMinisterePhase(ministry, question, country) {
  // ── Question orpheline hors-ligne ────────────────────────────────────────
  if (!ministry) {
    const rA = FALLBACK_RESPONSES.ministerA;
    const rB = FALLBACK_RESPONSES.ministerB;
    const rS = FALLBACK_RESPONSES.synthese;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    return {
      ministryId:    'orphan',
      ministryName:  'Instance de Coordination Interministérielle',
      ministryEmoji: '📋',
      ministryColor: '#5A6A8A',
      ministerA: { id: 'bureaucrate_a', name: 'Agent Δ-1', emoji: '🗂️', color: '#5A6A8A', ...pick(rA) },
      ministerB: { id: 'bureaucrate_b', name: 'Agent Δ-2', emoji: '📊', color: '#4A5A7A', ...pick(rB) },
      synthese:  pick(rS),
      isOrphan:  true,
    };
  }

  const [idA, idB]  = ministry.ministers || [];
  const _minMap = getMinistersMap();
  const minA        = _minMap[idA] || {};
  const minB        = _minMap[idB] || {};
  const promptA     = ministry.ministerPrompts?.[idA] || minA.essence || '';
  const promptB     = ministry.ministerPrompts?.[idB] || minB.essence || '';
  const ctx         = buildCountryContext(country);

  // ── Ministre A ──────────────────────────────────────────────────────────
  const pA = `${langPrefix()}${promptA}
${ctx}
Question soumise au ministère : "${question}"
Tu es ${minA.name || idA}. ${minA.comm || ''}
Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases argumentées", "mot_cle": "1 mot résumant ton angle" }`;

  // ── Ministre B ──────────────────────────────────────────────────────────
  const pB = `${langPrefix()}${promptB}
${ctx}
Question soumise au ministère : "${question}"
Tu es ${minB.name || idB}. ${minB.comm || ''}
Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases argumentées", "mot_cle": "1 mot résumant ton angle" }`;

  // ── Synthèse ministère ───────────────────────────────────────────────────
  const keys = getApiKeys();
  const _iaMode = (() => { try { return JSON.parse(localStorage.getItem('aria_options')||'{}').ia_mode||'aria'; } catch { return 'aria'; } })();
  const _useAI = _iaMode !== 'none' && (keys.claude || keys.gemini || keys.grok || keys.openai);

  let resA = null, resB = null;
  if (_useAI) {
    [resA, resB] = await Promise.all([
      callAI(pA, 'council_ministre').catch(() => null),
      callAI(pB, 'council_ministre').catch(() => null),
    ]);
  }

  // Fallback local si IA indisponible ou mode offline
  if (!resA) resA = localMinisterFallback(idA, question);
  if (!resB) resB = localMinisterFallback(idB, question);

  // Synthèse
  let synthese = null;
  if (_useAI) {
    const pSynth = buildSyntheseMinisterePrompt(ministry, resA, resB, question, ctx);
    synthese = await callAI(pSynth, 'council_synthese_min').catch(() => null);
  }
  if (!synthese) synthese = localSyntheseFallback(ministry, resA, resB);

  return {
    ministryId: ministry.id,
    ministryName: ministry.name,
    ministryEmoji: ministry.emoji,
    ministryColor: ministry.color,
    ministerA: { id: idA, name: minA.name, emoji: minA.emoji, color: minA.color, ...resA },
    ministerB: { id: idB, name: minB.name, emoji: minB.emoji, color: minB.color, ...resB },
    synthese,
  };
}

/**
 * Phase CERCLE : annotation de chaque ministère sur la question
 * Chaque ministère non-rapporteur donne 1 annotation courte
 * @param {string} targetMinistryId — le ministère principal (déjà délibéré)
 * @param {string} question
 * @param {object} synthese         — synthèse du ministère principal
 * @param {object} country
 * @returns {Promise<Array<{ ministryId, ministryName, ministryEmoji, annotation }>>}
 */
export async function runCerclePhase(targetMinistryId, question, synthese, country) {
  // ── Question orpheline : annotations bureaucratiques pour tous les ministères ──
  if (targetMinistryId === 'orphan') {
    return getMinistriesList().map(m => ({
      ministryId:    m.id,
      ministryName:  m.name,
      ministryEmoji: m.emoji,
      ministryColor: m.color,
      annotation:    FALLBACK_RESPONSES.cercleAnnotations[m.id] || ((() => { try { return localStorage.getItem('aria_lang') === 'en'; } catch { return false; } })() ? `The ${m.name} ministry takes note of the request.` : `Le ministère ${m.name} prend note de la requête.`),
    }));
  }

  const others = getMinistriesList().filter(m => m.id !== targetMinistryId);
  const keys = getApiKeys();
  const ctx = buildCountryContext(country);
  const syntheseText = synthese?.synthese || 'Délibération en cours.';

  const annotations = await Promise.all(
    others.map(async (m) => {
      const minister1 = getMinistersMap()[m.ministers?.[0]];
      const annotation = minister1?.annotation || `Analyse la question du point de vue de ${m.name}.`;

      let result = null;
      const _iaMode3 = (() => { try { return JSON.parse(localStorage.getItem('aria_options')||'{}').ia_mode||'aria'; } catch { return 'aria'; } })();
      if (_iaMode3 !== 'none' && (keys.claude || keys.gemini || keys.grok || keys.openai)) {
        const p = `${langPrefix()}Tu représentes le ministère "${m.name}" (${m.emoji}) du gouvernement ARIA.
${ctx}
Question traitée : "${question}"
Synthèse du ministère principal : "${syntheseText}"
${annotation}
Réponds UNIQUEMENT en JSON : { "annotation": "1-2 phrases, ton sobre, angle spécifique à ton ministère" }`;
        result = await callAI(p, 'council_annotation').catch(() => null);
      }

      return {
        ministryId:    m.id,
        ministryName:  m.name,
        ministryEmoji: m.emoji,
        ministryColor: m.color,
        annotation:    result?.annotation || localAnnotationFallback(m, question),
      };
    })
  );

  return annotations;
}

/**
 * Phase PRESIDENCE : Phare + Boussole + synthèse présidentielle
 * @param {string} question
 * @param {object} ministereResult  — résultat de runMinisterePhase
 * @param {Array}  cercleAnnotations — résultat de runCerclePhase
 * @param {object} country
 * @returns {Promise<{ phare, boussole, synthese }>}
 */
export async function runPresidencePhase(question, ministereResult, cercleAnnotations, country) {
  const _pres = getPresidency();
  const phareData    = _pres.phare    || {};
  const boussoleData = _pres.boussole || {};

  // ── Question orpheline : présidence bureaucratique ────────────────────────
  if (ministereResult?.isOrphan) {
    const fb = FALLBACK_RESPONSES.presidence;
    return {
      phare:    { ...phareData,    ...fb.phare    },
      boussole: { ...boussoleData, ...fb.boussole },
      synthese: fb.synthese,
    };
  }

  const keys = getApiKeys();
  const ctx  = buildCountryContext(country);

  const cercleSummary = cercleAnnotations
    .map(a => `${a.ministryEmoji} ${a.ministryName} : ${a.annotation}`)
    .join('\n');

  const context = `${ctx}
Question : "${question}"
Synthèse du ministère principal (${ministereResult.ministryEmoji} ${ministereResult.ministryName}) :
  Convergence : ${ministereResult.synthese?.convergence}
  "${ministereResult.synthese?.synthese}"
  Recommandation : "${ministereResult.synthese?.recommandation}"
Annotations des autres ministères :
${cercleSummary}`;

  // ── Phare ────────────────────────────────────────────────────────────────
  const pPhare = `${langPrefix()}Tu es ${phareData.name} (${phareData.symbol}) du gouvernement ARIA.
${phareData.essence}
${context}
Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases — vision long terme, tranchant et clair", "decision": "1 phrase — quelle décision tu recommandes" }`;

  // ── Boussole ─────────────────────────────────────────────────────────────
  const pBoussole = `${langPrefix()}Tu es ${boussoleData.name} (${boussoleData.symbol}) du gouvernement ARIA.
${boussoleData.essence}
${context}
Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases — mémoire et protection, nuancé", "decision": "1 phrase — quelle décision tu recommandes" }`;

  let phare = null, boussole = null;
  if (keys.claude || keys.gemini) {
    [phare, boussole] = await Promise.all([
      callAI(pPhare, 'council_phare').catch(() => null),
      callAI(pBoussole, 'council_boussole').catch(() => null),
    ]);
  }

  if (!phare) {
    // Fallback contextuel — varie selon la question et l'état du pays
    const tension = country.satisfaction < 40 ? 'La tension sociale actuelle exige une réponse rapide et visible.' :
                    country.satisfaction > 70 ? 'La stabilité présente offre une fenêtre favorable à l\'action.' :
                    'Le contexte est équilibré — une décision mesurée s\'impose.';
    const angle = ['économique', 'social', 'structurel', 'institutionnel'][Math.floor((question.length + country.satisfaction) % 4)];
    phare = {
      position: `Sur la question « ${question.slice(0,60)}${question.length>60?'…':''} », le Phare identifie un enjeu ${angle} de premier ordre. ${tension} Une vision à long terme impose de tracer une direction claire plutôt que de temporiser.`,
      decision: `Adopter une position ferme sur cet enjeu pour maintenir la cohérence de la trajectoire ARIA.`,
    };
  }
  if (!boussole) {
    const memoire = country.aria_current > 50 ? 'L\'adhésion ARIA reste solide — ne pas la fragiliser par une décision précipitée.' :
                    country.aria_current < 30 ? 'L\'adhésion ARIA est fragile — toute décision doit être prudemment expliquée.' :
                    'L\'adhésion ARIA est en transition — le moment requiert une écoute attentive.';
    const pop = country.population > 50_000_000 ? 'Dans un pays de cette taille' : 'Dans ce territoire';
    boussole = {
      position: `${pop}, la question « ${question.slice(0,55)}${question.length>55?'…':''} » touche à des équilibres établis. ${memoire} La mémoire des cycles précédents invite à la nuance avant tout engagement irréversible.`,
      decision: `Consulter les parties prenantes et prévoir un mécanisme de révision à court terme.`,
    };
  }

  // ── Synthèse présidentielle ───────────────────────────────────────────────
  let synthese = null;
  if (keys.claude || keys.gemini) {
    const pSynth = buildSynthesePresidencePrompt(phare, boussole, question, country);
    synthese = await callAI(pSynth, 'council_synthese_pres').catch(() => null);
  }
  if (!synthese) {
    // Évaluation contextuelle de la convergence
    const phrA = phare.decision?.toLowerCase()   || '';
    const phrB = boussole.decision?.toLowerCase() || '';
    const actionWords = ['adopter','action','immédiat','ferme','décision'];
    const cautionWords = ['consulter','révision','prudence','attente','nuance'];
    const phareIsAction  = actionWords.some(w => phrA.includes(w));
    const boussoleIsAction = actionWords.some(w => phrB.includes(w));
    const convergence = phareIsAction === boussoleIsAction;

    const qRef = convergence
      ? `Approuvez-vous la proposition suivante : "${phare.decision}" ?`
      : `Option A — ${phare.decision}\nOption B — ${boussole.decision}`;

    const enjeu = country.satisfaction < 40
      ? `Cette décision intervient dans un contexte de tension sociale élevée (satisfaction : ${country.satisfaction}%). Son impact sera immédiatement ressenti par les ${Math.round(country.population/1e6*10)/10} M de citoyens.`
      : `La décision impactera directement les ${Math.round(country.population/1e6*10)/10} M de citoyens. L'adhésion ARIA actuelle (${country.aria_current ?? '?'}%) conditionnera l'acceptation populaire.`;

    synthese = {
      convergence,
      position_phare_resume:    phare.decision    || 'Action prioritaire.',
      position_boussole_resume: boussole.decision || 'Consultation et révision.',
      question_referendum:      qRef,
      enjeu_principal:          enjeu,
    };
  }

  console.log('[ARIA PRES] phare:', JSON.stringify(phare));
  console.log('[ARIA PRES] phareData:', JSON.stringify(phareData));
  console.log('[ARIA PRES] synthese:', JSON.stringify(synthese));
  return {
    phare:    { ...phareData,    ...phare },
    boussole: { ...boussoleData, ...boussole },
    synthese,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  3. VOTE & IMPACT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule l'impact d'un vote sur les stats du pays.
 * Vote est TOUJOURS 'oui' ou 'non' — c'est un référendum adopter/abroger.
 * En cas de divergence, 'oui' = option Phare, 'non' = option Boussole.
 *
 * @param {string} vote         — 'oui' | 'non'
 * @param {object} presidence   — résultat runPresidencePhase
 * @param {object} country
 * @returns {{ satisfaction: number, aria_current: number, label: string }}
 */
export function computeVoteImpact(vote, presidence, country) {
  const convergence = presidence.synthese?.convergence;
  const ariaCurrent = country.aria_current ?? country.aria_irl ?? 40;

  // Le peuple adopte (oui) ou rejette/préfère l'autre option (non)
  if (vote === 'oui') {
    const label = convergence
      ? 'Le peuple adopte la proposition du Conseil. La légitimité du gouvernement ARIA progresse.'
      : `Le peuple tranche : ${presidence.synthese?.position_phare_resume || 'La vision du Phare est retenue.'}`;
    return {
      satisfaction: +Math.min(5, Math.round((100 - country.satisfaction) * 0.09)),
      aria_current: Math.min(ariaCurrent + 3, 95),
      label,
    };
  } else {
    const label = convergence
      ? 'Le peuple rejette la proposition. Le Conseil doit reconsidérer sa position.'
      : `Le peuple préfère l'alternative : ${presidence.synthese?.position_boussole_resume || 'La mémoire de la Boussole est retenue.'}`;
    return {
      satisfaction: convergence
        ? -Math.min(4, Math.round(country.satisfaction * 0.06))
        : +Math.min(3, Math.round((100 - country.satisfaction) * 0.06)),
      aria_current: convergence
        ? Math.max(ariaCurrent - 4, 5)
        : Math.min(ariaCurrent + 1, 95),
      label,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. HELPERS INTERNES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construit le bloc contexte pays injecté dans les prompts de délibération.
 *
 * Modes (aria_options.gameplay.context_mode, surchargeable par pays) :
 *   'auto'       — stats + description si disponible (comportement historique)
 *   'rich'       — force contexte complet même pour fictifs
 *   'stats_only' — uniquement les stats numériques, sans prose
 *   'off'        — aucun contexte (délibération aveugle)
 *
 * country.contextOverride : string libre — remplace tout le bloc si défini
 * country.context_mode    : surcharge le mode global pour ce pays
 */
function buildCountryContext(country) {
  if (!country) return '';
  const en = loadLang() === 'en';

  // 1. Override libre par pays
  if (country.contextOverride && country.contextOverride.trim()) {
    const lbl = en ? 'Context' : 'Contexte';
    return `[${lbl} — ${country.nom}]\n${country.contextOverride.trim()}`;
  }

  // 2. Mode effectif (pays > global)
  let mode = 'auto';
  try {
    const opts = JSON.parse(localStorage.getItem('aria_options') || '{}');
    mode = opts.gameplay?.context_mode || 'auto';
  } catch {}
  if (country.context_mode) mode = country.context_mode;

  if (mode === 'off') return '';

  const pop  = Math.round((country.population || 0) / 1e6 * 10) / 10;
  const sat  = country.satisfaction ?? 50;
  const aria = country.aria_current ?? country.aria_irl ?? 40;
  const year = country.annee || 2026;
  // Résoudre le nom du régime depuis les données localisées
  const regimeNameLocalized = getStats().regimes[country.regime]?.name || country.regimeName || country.regime;

  // 3. Stats only
  if (mode === 'stats_only') {
    return en
      ? `Country: "${country.nom}" | Regime: ${regimeNameLocalized} | ${pop}M pop. | Approval: ${sat}% | ARIA: ${aria}% | Year: ${year}`
      : `Pays : "${country.nom}" | Régime : ${regimeNameLocalized} | ${pop} M hab. | Satisfaction : ${sat}% | ARIA : ${aria}% | Année : ${year}`;
  }

  // 4. Modes auto / rich
  const leader      = country.leader;
  const leaderName  = typeof leader === 'object' ? leader?.nom  : leader;
  const leaderTitre = typeof leader === 'object' ? leader?.titre : null;

  const stabilityLabel = en
    ? (sat < 30 ? 'very unstable' : sat < 50 ? 'fragile' : sat < 70 ? 'stable' : 'solid')
    : (sat < 30 ? 'très instable' : sat < 50 ? 'fragile' : sat < 70 ? 'correct' : 'solide');

  let ctx = en
    ? `Country: "${country.nom}"
- Regime: ${regimeNameLocalized}
- Population: ${pop}M
- Public approval: ${sat}% (${stabilityLabel})
- ARIA support: ${aria}%
- Year: ${year}`
    : `Pays : "${country.nom}"
- Régime : ${regimeNameLocalized}
- Population : ${pop} M habitants
- Satisfaction populaire : ${sat}% (${stabilityLabel})
- Adhésion ARIA : ${aria}%
- Année : ${year}`;

  if (leaderName) {
    const leaderLbl = en ? 'Leader' : 'Dirigeant';
    ctx += `\n- ${leaderLbl} : ${leaderTitre ? `${leaderTitre} ` : ''}${leaderName}`;
  }

  const hasDesc = country.description && country.description.trim();
  if (hasDesc) {
    const sitLbl = en ? 'Current situation' : 'Situation actuelle';
    ctx += `\n- ${sitLbl} : ${country.description}`;
  }

  const isReal = hasDesc || leaderName;
  if (mode === 'rich' || isReal) {
    ctx += en
      ? `\n\nIMPORTANT: ${isReal
          ? `This country is real. Your recommendations must account for its history, political culture, institutional constraints and actual geopolitical context in ${year}.`
          : `Fictional country in rich mode — reason from the stats and the internal logic of the "${regimeNameLocalized}" regime.`
        }`
      : `\n\nIMPORTANT : ${isReal
          ? `Ce pays est ancré dans la réalité. Tes recommandations doivent tenir compte de son histoire, sa culture politique, ses contraintes institutionnelles et son contexte géopolitique réel en ${year}.`
          : `Pays fictif en mode enrichi — raisonne à partir des stats et de la logique interne du régime "${regimeNameLocalized}".`
        }`;
  } else {
    ctx += en
      ? `\n\nContext: Fictional country — objective analysis based on the provided statistics.`
      : `\n\nContexte : Pays fictif — approche objective basée sur les statistiques fournies.`;
  }

  return ctx;
}

function buildSyntheseMinisterePrompt(ministry, resA, resB, question, ctx) {
  return `${langPrefix()}Tu es le système de synthèse institutionnelle du gouvernement ARIA.
Tu reçois les positions de deux ministres du ministère "${ministry.name}".
${ctx}
Question : "${question}"

Position Ministre 1 : "${resA?.position || ''}" (angle : ${resA?.mot_cle || ''})
Position Ministre 2 : "${resB?.position || ''}" (angle : ${resB?.mot_cle || ''})

RÈGLE DE CONVERGENCE (cruciale) :
- CONVERGENCE = les deux ministres recommandent globalement la même ACTION, même avec des angles ou nuances différents.
- DIVERGENCE = actions mutuellement exclusives (ex: "agir immédiatement" VS "ne rien faire encore").
- En cas de doute, CONVERGENCE si les actions centrales sont compatibles.

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
{
  "convergence": true,
  "synthese": "3-4 phrases au nom du ministère",
  "tension_residuelle": null,
  "recommandation": "1 phrase d'action concrète"
}`;
}

function buildSynthesePresidencePrompt(phare, boussole, question, country) {
  const ctx = buildCountryContext(country);
  return `${langPrefix()}Tu es le système d'arbitrage présidentiel du gouvernement ARIA.
${ctx}
Question débattue : "${question}"

Position du PHARE (☉) :
"${phare.position}"
Décision recommandée : "${phare.decision}"

Position de la BOUSSOLE (☽) :
"${boussole.position}"
Décision recommandée : "${boussole.decision}"

RÈGLE DE CONVERGENCE (importante) :
- CONVERGENCE = les deux décisions recommandent globalement la même action (ex: défense + diplomatie simultanée). Même si les angles diffèrent, si l'action centrale est la même → convergence.
- DIVERGENCE = les deux décisions s'excluent mutuellement (ex: agir maintenant VS attendre).

RÈGLE POUR question_referendum :
- Formule une PROPOSITION CLAIRE ET ADOPTABLE à soumettre au peuple.
- Format : "Le gouvernement doit [action concrète]." ou "Approuvez-vous [mesure spécifique] ?"
- La proposition doit être un CHOIX OUI/NON, pas une question ouverte.
- NE REFORMULE PAS la question initiale — formule une DÉCISION CONCRÈTE issue de la délibération.

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
{
  "convergence": true,
  "position_phare_resume": "1 phrase courte — l'angle du Phare",
  "position_boussole_resume": "1 phrase courte — l'angle de la Boussole",
  "question_referendum": "Le gouvernement doit [action concrète issue de la délibération].",
  "enjeu_principal": "1 phrase — ce qui est vraiment en jeu pour les citoyens"
}`;
}

// ── Fallbacks locaux ──────────────────────────────────────────────────────────

const LOCAL_MINISTER_PHRASES = {
  initiateur: ['L\'action immédiate est la seule réponse raisonnable.', 'Chaque jour d\'hésitation aggrave la situation.'],
  gardien:    ['Les ressources doivent être préservées avant toute réforme.', 'La stabilité est notre premier bien commun.'],
  communicant:['La question mérite d\'être posée différemment.', 'Le dialogue entre parties prenantes est essentiel.'],
  protecteur: ['Les populations vulnérables doivent être protégées en priorité.', 'Aucun citoyen ne doit être laissé sans filet.'],
  ambassadeur:['Cette décision doit rayonner au-delà de nos frontières.', 'L\'image de la nation est en jeu.'],
  analyste:   ['Les données disponibles ne permettent pas encore de conclure.', 'Une analyse approfondie est nécessaire.'],
  arbitre:    ['L\'équité doit primer sur l\'efficacité dans ce cas.', 'Toutes les parties méritent d\'être entendues.'],
  enqueteur:  ['Des intérêts cachés semblent orienter ce débat.', 'Il faut questionner les présupposés.'],
  guide:      ['La vision à long terme est la seule boussole fiable.', 'Où voulons-nous être dans 20 ans ?'],
  stratege:   ['Une approche méthodique et structurée s\'impose.', 'Les solutions rapides créent des problèmes durables.'],
  inventeur:  ['Une rupture de paradigme est peut-être nécessaire.', 'Les solutions classiques ont montré leurs limites.'],
  guerisseur: ['Le bien-être collectif doit guider notre décision.', 'La dimension humaine ne peut être ignorée.'],
};

function localMinisterFallback(ministerId, question) {
  const phrases = LOCAL_MINISTER_PHRASES[ministerId] || ['Délibération en cours.'];
  return {
    position: phrases[Math.floor(Math.random() * phrases.length)],
    mot_cle: 'analyse',
  };
}

function localSyntheseFallback(ministry, resA, resB) {
  const isEn = ((() => { try { return localStorage.getItem('aria_lang'); } catch { return 'fr'; } })()) === 'en';
  return {
    convergence: true,
    synthese: isEn
      ? `The ${ministry.name} ministry has deliberated on the submitted question. Both ministers have presented their analyses. A common position will be submitted to the Ministerial Circle.`
      : `Le ministère ${ministry.name} a délibéré sur la question soumise. Les deux ministres ont exposé leurs analyses respectives. Une position commune sera présentée au Cercle Ministériel.`,
    tension_residuelle: null,
    recommandation: isEn
      ? 'The ministry recommends a progressive and concerted approach.'
      : 'Le ministère recommande une approche progressive et concertée.',
  };
}

function localAnnotationFallback(ministry, question) {
  const isEn = ((() => { try { return localStorage.getItem('aria_lang'); } catch { return 'fr'; } })()) === 'en';
  const annotations = isEn ? {
    justice:   'The legal dimension of this question deserves particular attention.',
    economie:  'Budgetary impact must be assessed before any decision.',
    defense:   'The security implications have been examined.',
    sante:     'The well-being of the population is our central concern.',
    education: 'The impact on future generations has been taken into account.',
    ecologie:  'The environmental sustainability of this decision is questionable.',
  } : {
    justice:   'La dimension juridique de cette question mérite une attention particulière.',
    economie:  'L\'impact budgétaire doit être évalué avant toute décision.',
    defense:   'Les implications sécuritaires ont été examinées.',
    sante:     'Le bien-être des populations est notre préoccupation centrale.',
    education: 'L\'impact sur les générations futures a été pris en compte.',
    ecologie:  'La soutenabilité environnementale de cette décision est questionnable.',
  };
  return annotations[ministry.id] || (isEn
    ? `The ${ministry.name} ministry notes the importance of this question.`
    : `Le ministère ${ministry.name} note l\'importance de cette question.`);
}
