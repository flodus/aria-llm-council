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

import { callAI, getApiKeys } from './Dashboard_p1';
import AGENTS_RAW from '../templates/base_agents.json';

// ─────────────────────────────────────────────────────────────────────────────
//  DONNÉES LOCALES
// ─────────────────────────────────────────────────────────────────────────────

export const MINISTRIES_LIST = AGENTS_RAW.ministries || [];
export const MINISTERS_MAP   = AGENTS_RAW.ministers  || {};
export const PRESIDENCY      = AGENTS_RAW.presidency  || {};

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
  for (const m of MINISTRIES_LIST) {
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
  const ministryList = MINISTRIES_LIST.map(m => `${m.id} (${m.name})`).join(', ');
  const prompt = `Tu es le système de routage du gouvernement ARIA.
Question soumise par un citoyen : "${question}"
Ministères disponibles : ${ministryList}

Réponds UNIQUEMENT en JSON : { "ministry_id": "l'id le plus pertinent parmi les options" }`;

  try {
    const result = await callAI(prompt, 'council_routing');
    if (result?.ministry_id && MINISTRIES_LIST.find(m => m.id === result.ministry_id)) {
      return result.ministry_id;
    }
  } catch {}

  // Fallback local si IA échoue
  return localKeywordRoute(q);
}

/** Score local sur keywords — retourne null si aucun match (question orpheline) */
function localKeywordRoute(questionLow) {
  let best = null, bestScore = 0;
  for (const m of MINISTRIES_LIST) {
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
  const minA        = MINISTERS_MAP[idA] || {};
  const minB        = MINISTERS_MAP[idB] || {};
  const promptA     = ministry.ministerPrompts?.[idA] || minA.essence || '';
  const promptB     = ministry.ministerPrompts?.[idB] || minB.essence || '';
  const ctx         = buildCountryContext(country);

  // ── Ministre A ──────────────────────────────────────────────────────────
  const pA = `${promptA}
${ctx}
Question soumise au ministère : "${question}"
Tu es ${minA.name || idA}. ${minA.comm || ''}
Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases argumentées", "mot_cle": "1 mot résumant ton angle" }`;

  // ── Ministre B ──────────────────────────────────────────────────────────
  const pB = `${promptB}
${ctx}
Question soumise au ministère : "${question}"
Tu es ${minB.name || idB}. ${minB.comm || ''}
Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases argumentées", "mot_cle": "1 mot résumant ton angle" }`;

  // ── Synthèse ministère ───────────────────────────────────────────────────
  const keys = getApiKeys();

  let resA = null, resB = null;
  if (keys.claude || keys.gemini) {
    [resA, resB] = await Promise.all([
      callAI(pA, 'council_ministre').catch(() => null),
      callAI(pB, 'council_ministre').catch(() => null),
    ]);
  }

  // Fallback local si IA indisponible
  if (!resA) resA = localMinisterFallback(idA, question);
  if (!resB) resB = localMinisterFallback(idB, question);

  // Synthèse
  let synthese = null;
  if (keys.claude || keys.gemini) {
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
    return MINISTRIES_LIST.map(m => ({
      ministryId:    m.id,
      ministryName:  m.name,
      ministryEmoji: m.emoji,
      ministryColor: m.color,
      annotation:    FALLBACK_RESPONSES.cercleAnnotations[m.id] || `Le ministère ${m.name} prend note de la requête.`,
    }));
  }

  const others = MINISTRIES_LIST.filter(m => m.id !== targetMinistryId);
  const keys = getApiKeys();
  const ctx = buildCountryContext(country);
  const syntheseText = synthese?.synthese || 'Délibération en cours.';

  const annotations = await Promise.all(
    others.map(async (m) => {
      const minister1 = MINISTERS_MAP[m.ministers?.[0]];
      const annotation = minister1?.annotation || `Analyse la question du point de vue de ${m.name}.`;

      let result = null;
      if (keys.claude || keys.gemini) {
        const p = `Tu représentes le ministère "${m.name}" (${m.emoji}) du gouvernement ARIA.
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
  const phareData    = PRESIDENCY.phare    || {};
  const boussoleData = PRESIDENCY.boussole || {};

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
  const pPhare = `Tu es ${phareData.name} (${phareData.symbol}) du gouvernement ARIA.
${phareData.essence}
${context}
Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases — vision long terme, tranchant et clair", "decision": "1 phrase — quelle décision tu recommandes" }`;

  // ── Boussole ─────────────────────────────────────────────────────────────
  const pBoussole = `Tu es ${boussoleData.name} (${boussoleData.symbol}) du gouvernement ARIA.
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

  if (!phare)    phare    = { position: phareData.role_long,    decision: 'Action immédiate recommandée.' };
  if (!boussole) boussole = { position: boussoleData.role_long, decision: 'Prudence et consultation du peuple.' };

  // ── Synthèse présidentielle ───────────────────────────────────────────────
  let synthese = null;
  if (keys.claude || keys.gemini) {
    const pSynth = buildSynthesePresidencePrompt(phare, boussole, question, country);
    synthese = await callAI(pSynth, 'council_synthese_pres').catch(() => null);
  }
  if (!synthese) {
    const convergence = phare.decision?.slice(0,20) === boussole.decision?.slice(0,20);
    synthese = {
      convergence,
      position_phare_resume:    phare.decision    || 'Action prioritaire.',
      position_boussole_resume: boussole.decision || 'Évaluation nécessaire.',
      question_referendum:      convergence
        ? `Approuvez-vous : "${phare.decision}" ?`
        : `Option A — ${phare.decision}\nOption B — ${boussole.decision}`,
      enjeu_principal: `La décision impactera directement ${Math.round(country.population / 1e6 * 10) / 10} M de citoyens.`,
    };
  }

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

function buildCountryContext(country) {
  if (!country) return '';
  return `Contexte du pays "${country.nom}" :
- Régime : ${country.regimeName || country.regime}
- Population : ${Math.round((country.population || 0) / 1e6 * 10) / 10} M habitants
- Satisfaction populaire : ${country.satisfaction ?? 50}%
- Adhésion ARIA : ${country.aria_current ?? country.aria_irl ?? 40}%
- Année : ${country.annee || 2026}`;
}

function buildSyntheseMinisterePrompt(ministry, resA, resB, question, ctx) {
  return `Tu es le système de synthèse institutionnelle du gouvernement ARIA.
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
  return `Tu es le système d'arbitrage présidentiel du gouvernement ARIA.
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
  return {
    convergence: true,
    synthese: `Le ministère ${ministry.name} a délibéré sur la question soumise. Les deux ministres ont exposé leurs analyses respectives. Une position commune sera présentée au Cercle Ministériel.`,
    tension_residuelle: null,
    recommandation: `Le ministère recommande une approche progressive et concertée.`,
  };
}

function localAnnotationFallback(ministry, question) {
  const annotations = {
    justice:   'La dimension juridique de cette question mérite une attention particulière.',
    economie:  'L\'impact budgétaire doit être évalué avant toute décision.',
    defense:   'Les implications sécuritaires ont été examinées.',
    sante:     'Le bien-être des populations est notre préoccupation centrale.',
    education: 'L\'impact sur les générations futures a été pris en compte.',
    ecologie:  'La soutenabilité environnementale de cette décision est questionnable.',
  };
  return annotations[ministry.id] || `Le ministère ${ministry.name} note l\'importance de cette question.`;
}
