// src/features/council/services/deliberationEngine.js

// ============================================================
// PHASES DE DÉLIBÉRATION DU CONSEIL
// ============================================================

import { callAI, getApiKeys } from '../../../Dashboard_p1';
import { getMinistersMapFor, getMinistriesListFor, getPresidencyFor, getDestin } from './agentsManager';
import { buildCountryContext, langPrefix } from './contextBuilder';  // direct
import { FALLBACK_RESPONSES, localMinisterFallback, localSyntheseFallback, localAnnotationFallback } from './fallbacks';
import { getSynthesePresidence, getSyntheseCollegial } from '../../../shared/services/boardgame/responseService';
import { COLORS } from '../../../shared/theme';

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
    const _minMap = getMinistersMapFor(country);
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
    if (!synthese) synthese = localSyntheseFallback(ministry, resA, resB, country?.regime);

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
        return getMinistriesListFor(country).map(m => ({
            ministryId:    m.id,
            ministryName:  m.name,
            ministryEmoji: m.emoji,
            ministryColor: m.color,
            annotation:    FALLBACK_RESPONSES.cercleAnnotations[m.id] || ((() => { try { return localStorage.getItem('aria_lang') === 'en'; } catch { return false; } })() ? `The ${m.name} ministry takes note of the request.` : `Le ministère ${m.name} prend note de la requête.`),
        }));
    }

    const others = getMinistriesListFor(country).filter(m => m.id !== targetMinistryId);
    const keys = getApiKeys();
    const ctx = buildCountryContext(country);
    const syntheseText = synthese?.synthese || 'Délibération en cours.';

    const annotations = await Promise.all(
        others.map(async (m) => {
            const minister1 = getMinistersMapFor(country)[m.ministers?.[0]];
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
                annotation:    result?.annotation || localAnnotationFallback(m, question, country?.regime),
            };
        })
    );

    return annotations;
}

/**
 * Phase DESTIN : Oracle + Wyrd pour les crises existentielles
 * N'est invoquée que si destiny_mode === true dans la gouvernance du pays.
 * @param {string} question
 * @param {object} country
 * @param {boolean} crisisPrompts — utilise les prompts .crise au lieu de .normal
 * @returns {Promise<{ oracle, wyrd }>}
 */
export async function runDestinPhase(question, country, crisisPrompts = false) {
    const destin   = getDestin();
    const ministers = getMinistersMapFor(country);
    const oracleData = ministers.oracle || {};
    const wyrdData   = ministers.wyrd   || {};
    const keys = getApiKeys();
    const ctx  = buildCountryContext(country);
    const promptSrc = crisisPrompts ? destin?.ministerPrompts?.crise : destin?.ministerPrompts?.normal;

    let oracleRes = null, wyrdRes = null;
    if (keys.claude || keys.gemini) {
        const pOracle = `${langPrefix()}Tu es ${oracleData.name || "l'Oracle"} du gouvernement ARIA.
        ${oracleData.essence || ''}
        ${ctx}
        Question existentielle soumise au Conseil : "${question}"
        ${promptSrc?.oracle || ''}
        Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases — vision prophétique, prudente et grave" }`;

        const pWyrd = `${langPrefix()}Tu es ${wyrdData.name || "la Trame"} du gouvernement ARIA.
        ${wyrdData.essence || ''}
        ${ctx}
        Question existentielle soumise au Conseil : "${question}"
        ${promptSrc?.wyrd || ''}
        Réponds UNIQUEMENT en JSON : { "position": "2-3 phrases — vision du destin, radicale et inéluctable" }`;

        [oracleRes, wyrdRes] = await Promise.all([
            callAI(pOracle, 'council_oracle').catch(() => null),
            callAI(pWyrd,   'council_wyrd'  ).catch(() => null),
        ]);
    }

    // Fallbacks locaux depuis aria_reponses.json
    if (!oracleRes?.position) {
        const fb = localMinisterFallback('oracle', question, country?.regime);
        oracleRes = { position: fb?.position || "L'Oracle observe les fils du destin en silence." };
    }
    if (!wyrdRes?.position) {
        const fb = localMinisterFallback('wyrd', question, country?.regime);
        wyrdRes = { position: fb?.position || "La Trame se resserre — le destin suit son cours." };
    }

    return {
        oracle: { ...oracleData, ...oracleRes },
        wyrd:   { ...wyrdData,   ...wyrdRes   },
    };
}

/**
 * Phase PRÉSIDENCE en mode collégial (aucune figure présidentielle active)
 * Produit une synthèse constitutionnelle collective sans Phare ni Boussole
 */
async function _runCollegialPhase(question, ministereResult, cercleAnnotations, country) {
    const keys = getApiKeys();
    const ctx  = buildCountryContext(country);

    const cercleSummary = (cercleAnnotations || [])
        .map(a => `${a.ministryEmoji} ${a.ministryName} : ${a.annotation}`)
        .join('\n');

    const ministereInfo = `Ministère principal : ${ministereResult.ministryEmoji} ${ministereResult.ministryName}
    Synthèse : "${ministereResult.synthese?.synthese}"
    Recommandation : "${ministereResult.synthese?.recommandation}"`;

    let synthese = null;

    if (keys.claude || keys.gemini) {
        const prompt = `${langPrefix()}Tu es le système de synthèse constitutionnelle du gouvernement ARIA en mode collégial.
    ${ctx}
    Question débattue : "${question}"
    ${ministereInfo}
    Annotations des ministères :
    ${cercleSummary}

    En mode collégial, il n'y a ni Phare ni Boussole — le Conseil délibère collectivement.
    Produis une synthèse constitutionnelle qui reflète la délibération collective du Conseil.

    Réponds UNIQUEMENT en JSON :
    { "convergence": true, "synthese": "2-3 phrases — synthèse collective du Conseil", "question_referendum": "Proposition claire soumise au vote du peuple", "enjeu_principal": "1 phrase — enjeu principal pour les citoyens" }`;

        synthese = await callAI(prompt, 'council_collegial').catch(() => null);
    }

    if (!synthese) {
        const questionHash = question.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const convergence = (questionHash + (country.satisfaction || 50)) % 3 !== 0;
        const syntheseTexte = getSyntheseCollegial(country?.regime, convergence)
            || (convergence
                ? `Le Conseil délibère en session plénière. Une majorité ministérielle se dégage sur la question posée.`
                : `Le Conseil est divisé sur cette question. Une délibération approfondie est nécessaire avant toute décision.`);
        synthese = {
            convergence,
            synthese: syntheseTexte,
            question_referendum: convergence
                ? `Le Conseil recommande d'adopter une réponse collective à cette question. Approuvez-vous cette orientation ?`
                : `Le Conseil est divisé. Autorisez-vous la poursuite des délibérations avant toute décision ?`,
            enjeu_principal: `La décision impactera les ${Math.round((country.population || 1e6) / 1e6 * 10) / 10} M de citoyens — le Conseil délibère sans arbitrage présidentiel.`,
        };
    }

    return {
        phare:    null,
        boussole: null,
        collegial: true,
        synthese: {
            ...synthese,
            voteType: 'referendum',
            voteOptions: {
                oui: { label: '✓  OUI — ADOPTER', color: COLORS.greenHex, icon: '✓' },
                non: { label: '✕  NON — REJETER', color: COLORS.redHex,   icon: '✕' },
            },
            position_phare_resume:    null,
            position_boussole_resume: null,
        },
    };
}

/**
 * Phase PRESIDENCE : Phare + Boussole + synthèse présidentielle
 * @param {string} question
 * @param {object} ministereResult  — résultat de runMinisterePhase
 * @param {Array}  cercleAnnotations — résultat de runCerclePhase
 * @param {object} country
 * @param {object|null} destinVoices — résultat de runDestinPhase (optionnel, si destiny_mode actif)
 * @returns {Promise<{ phare, boussole, synthese }>}
 */

export async function runPresidencePhase(question, ministereResult, cercleAnnotations, country, destinVoices = null) {
    const _pres = getPresidencyFor(country);
    const presEntries = Object.entries(_pres); // [[id, data], ...]
    const N = presEntries.length;

    // ── Mode collégial : aucune figure présidentielle active ─────────────────
    if (N === 0) {
        return _runCollegialPhase(question, ministereResult, cercleAnnotations, country);
    }

    // ── Question orpheline : présidence bureaucratique ────────────────────────
    if (ministereResult?.isOrphan) {
        const fb = FALLBACK_RESPONSES.presidence;
        const presidents = {};
        presEntries.forEach(([id, data], i) => {
            const fbBase = i === 0 ? fb.phare : (fb.boussole || fb.phare);
            presidents[id] = { ...data, ...fbBase };
        });
        return {
            ...presidents,
            presidents,
            synthese: {
                ...fb.synthese,
                // Remap compat : premier président = majorité
                position_majority_resume: fb.synthese.position_phare_resume,
                position_minority_resume: fb.synthese.position_boussole_resume,
                positions_presidentielles: presEntries.map(([id, data], i) => ({
                    id, name: data.name, symbol: data.symbol || data.emoji || '★',
                    resume: i === 0 ? fb.synthese.position_phare_resume : fb.synthese.position_boussole_resume,
                })),
            },
        };
    }

    const keys = getApiKeys();
    const ctx  = buildCountryContext(country);

    const cercleSummary = cercleAnnotations
    .map(a => `${a.ministryEmoji} ${a.ministryName} : ${a.annotation}`)
    .join('\n');

    const destinSummary = destinVoices
    ? `\n    Voix de la Destinée :\n    👁️ Oracle : "${destinVoices.oracle?.position}"\n    🕸️ Wyrd : "${destinVoices.wyrd?.position}"`
    : '';

    const context = `${ctx}
    Question : "${question}"
    Synthèse du ministère principal (${ministereResult.ministryEmoji} ${ministereResult.ministryName}) :
    Convergence : ${ministereResult.synthese?.convergence}
    "${ministereResult.synthese?.synthese}"
    Recommandation : "${ministereResult.synthese?.recommandation}"
    Annotations des autres ministères :
    ${cercleSummary}${destinSummary}`;

    // ── Angles rhétoriques selon position (0 = vision, 1 = mémoire, 2+ = singulier)
    const ANGLES = [
        '2-3 phrases — vision long terme, tranchant et clair',
        '2-3 phrases — mémoire et protection, nuancé',
        '2-3 phrases — angle singulier et complémentaire',
    ];

    // ── Prompts N présidents dynamiques ──────────────────────────────────────
    const prompts = presEntries.map(([id, data], i) =>
        `${langPrefix()}Tu es ${data.name} (${data.symbol || data.emoji || '★'}) du gouvernement ARIA.
    ${data.essence}
    ${context}
    Réponds UNIQUEMENT en JSON : { "position": "${ANGLES[i] || ANGLES[ANGLES.length - 1]}", "decision": "1 phrase — quelle décision tu recommandes" }`
    );

    let aiResults = presEntries.map(() => null);
    if (keys.claude || keys.gemini) {
        const appels = prompts.map((p, i) =>
            callAI(p, `council_pres_${presEntries[i][0]}`).catch(() => null)
        );
        aiResults = await Promise.all(appels);
    }

    // ── Fallback contextuel pour tout résultat null ───────────────────────────
    const questionHash = question.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const random = (questionHash + country.satisfaction) % 100 / 100;

    const tension = country.satisfaction < 40
    ? 'La tension sociale actuelle exige une réponse rapide et visible.'
    : country.satisfaction > 70
    ? 'La stabilité présente offre une fenêtre favorable à l\'action.'
    : 'Le contexte est équilibré — une décision mesurée s\'impose.';

    const angle = ['économique', 'social', 'structurel', 'institutionnel'][
        Math.floor((question.length + country.satisfaction) % 4)
    ];

    const memoire = country.aria_current > 50
    ? 'L\'adhésion ARIA reste solide — ne pas la fragiliser par une décision précipitée.'
    : country.aria_current < 30
    ? 'L\'adhésion ARIA est fragile — toute décision doit être prudemment expliquée.'
    : 'L\'adhésion ARIA est en transition — le moment requiert une écoute attentive.';

    const pop = country.population > 50_000_000 ? 'Dans un pays de cette taille' : 'Dans ce territoire';

    presEntries.forEach(([id, data], i) => {
        if (aiResults[i]) return;
        // Décalage déterministe par index pour varier les fallbacks
        const r = (random + i * 0.33) % 1;
        if (r < 0.5) {
            // Action
            aiResults[i] = {
                position: i === 0
                    ? `Sur la question « ${question.slice(0,60)}${question.length>60?'…':''} », ${data.name} identifie un enjeu ${angle} de premier ordre. ${tension} Une action immédiate est nécessaire.`
                    : `${pop}, la question « ${question.slice(0,55)}${question.length>55?'…':''} » nécessite une réponse. ${memoire} ${data.name} soutient une action mesurée mais déterminée.`,
                decision: i === 0
                    ? `Lancer une initiative nationale sur cet enjeu dans les plus brefs délais.`
                    : `Soutenir l'action tout en veillant à protéger les équilibres existants.`,
            };
        } else {
            // Prudence
            aiResults[i] = {
                position: i === 0
                    ? `Sur la question « ${question.slice(0,60)}${question.length>60?'…':''} », ${data.name} discerne un enjeu ${angle} qui mérite réflexion. ${tension} Une décision précipitée serait contre-productive.`
                    : `${pop}, la question « ${question.slice(0,55)}${question.length>55?'…':''} » appelle à la prudence. ${memoire} Une consultation approfondie est nécessaire.`,
                decision: i === 0
                    ? `Prendre le temps d'étudier toutes les implications avant d'agir.`
                    : `Organiser une consultation citoyenne et reporter toute décision irréversible.`,
            };
        }
    });

    // ── Map finale des présidents ─────────────────────────────────────────────
    const presidentsResult = Object.fromEntries(
        presEntries.map(([id, data], i) => [id, { ...data, ...aiResults[i] }])
    );

    // ── Synthèse présidentielle — toujours referendum OUI/NON ─────────────────
    let synthese = null;
    if (keys.claude || keys.gemini) {
        const pSynth = buildSynthesePresidencePrompt(presidentsResult, question, country);
        synthese = await callAI(pSynth, 'council_synthese_pres').catch(() => null);
        // Normaliser la réponse AI : ajouter les champs dynamiques manquants
        if (synthese) {
            synthese = normaliseSyntheseAI(synthese, presidentsResult, presEntries, aiResults);
        }
    }

    if (!synthese) {
        synthese = buildFallbackSyntheseN(presidentsResult, presEntries, aiResults, country, question);
    }

    return {
        ...presidentsResult, // compat backward : presidence.phare / presidence.boussole accessibles
        presidents: presidentsResult,
        synthese,
    };
}
/**
 * Phase CRISE : tous les ministères actifs délibèrent directement sur la question.
 * Skip cercle + présidence. Déclenché si crisis_mode !== false && detectCrisis(question).
 * @param {string} question
 * @param {object} country
 * @returns {Promise<{ crisis: true, ministries: Array }>}
 */
export async function runCrisisPhase(question, country) {
    const ministriesList = getMinistriesListFor(country);
    const results = await Promise.all(
        ministriesList.map(ministry => runMinisterePhase(ministry, question, country))
    );
    return { crisis: true, ministries: results };
}

// ── Prompt de synthèse N présidents dynamiques ───────────────────────────
function buildSynthesePresidencePrompt(presidentsResult, question, country) {
    const ctx = buildCountryContext(country);
    const blocs = Object.entries(presidentsResult)
        .map(([id, p]) =>
            `${p.name} (${p.symbol || p.emoji || id}) :\n    "${p.position}"\n    Décision : "${p.decision}"`
        )
        .join('\n\n    ');

    return `${langPrefix()}Tu es le système d'arbitrage présidentiel du gouvernement ARIA.
    ${ctx}
    Question débattue : "${question}"

    ${blocs}

    RÈGLE DE CONVERGENCE (importante) :
    - CONVERGENCE = la majorité des présidents recommandent la même direction. Même si les angles diffèrent, si l'action centrale est la même → convergence.
    - DIVERGENCE = les décisions s'excluent mutuellement.

    RÈGLE POUR question_referendum :
    - Formule une PROPOSITION CLAIRE ET ADOPTABLE à soumettre au peuple.
    - Format : "Le gouvernement doit [action concrète]." ou "Approuvez-vous [mesure spécifique] ?"
    - La proposition doit être un CHOIX OUI/NON, pas une question ouverte.
    - NE REFORMULE PAS la question initiale — formule une DÉCISION CONCRÈTE issue de la délibération.

    Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
    {
        "convergence": true,
        "position_majority_resume": "1 phrase courte — la position majoritaire",
        "position_minority_resume": "1 phrase courte — la position minoritaire (null si convergence totale)",
        "question_referendum": "Le gouvernement doit [action concrète issue de la délibération].",
        "enjeu_principal": "1 phrase — ce qui est vraiment en jeu pour les citoyens"
    }`;
}

// ── Normalise la réponse AI : ajoute les champs dynamiques + compat backward ─
function normaliseSyntheseAI(synthese, presidentsResult, presEntries, aiResults) {
    // Compat backward : phare = premier président, boussole = deuxième
    const majorite  = aiResults[0]?.decision || '';
    const minorite  = aiResults[1]?.decision || null;
    const positions = presEntries.map(([id, data], i) => ({
        id, name: data.name, symbol: data.symbol || data.emoji || '★',
        resume: aiResults[i]?.decision || '',
    }));
    return {
        ...synthese,
        voteType: 'referendum',
        voteOptions: {
            oui: { label: 'OUI — ADOPTER', color: COLORS.greenHex, icon: '✓' },
            non: { label: 'NON — REJETER', color: COLORS.redHex,   icon: '✕' },
        },
        voteQuestion: synthese.question_referendum || synthese.voteQuestion || '',
        // Compat backward : LLMCouncil.jsx utilise encore ces clés
        position_phare_resume:    synthese.position_majority_resume || majorite,
        position_boussole_resume: synthese.position_minority_resume || minorite,
        // Champs dynamiques nouveaux
        position_majority_resume: synthese.position_majority_resume || majorite,
        position_minority_resume: synthese.position_minority_resume || minorite,
        positions_presidentielles: positions,
    };
}

// ── Fallback synthèse N présidents — sans appel AI ────────────────────────
function buildFallbackSyntheseN(presidentsResult, presEntries, aiResults, country, question) {
    const N = presEntries.length;

    // Détecter convergence par mots-clés
    const actionWords  = ['adopter','action','immédiat','ferme','lancer','engager','agir','exécuter','réaliser'];
    const cautionWords = ['consulter','prudence','attente','étudier','analyser','temporiser','reporter','suspendre'];

    const votes = aiResults.map(r => {
        const d = (r?.decision || '').toLowerCase();
        if (actionWords.some(w => d.includes(w)))  return 'action';
        if (cautionWords.some(w => d.includes(w))) return 'prudence';
        return 'neutre';
    });

    const nbAction  = votes.filter(v => v === 'action').length;
    const nbPrudence = votes.filter(v => v === 'prudence').length;
    const majorite  = Math.ceil(N / 2);
    const convergence = nbAction >= majorite || nbPrudence >= majorite;

    const decisionMajoritaire = aiResults[0]?.decision || 'Action prioritaire.';
    const decisionMinoritaire = N > 1 ? (aiResults[1]?.decision || null) : null;

    const voteQuestion = convergence
        ? `Approuvez-vous la proposition suivante : "${decisionMajoritaire}" ?`
        : `Le gouvernement doit-il adopter la position de ${presEntries[0][1].name} ?`;

    const enjeu = country.satisfaction < 40
        ? `Cette décision intervient dans un contexte de tension sociale élevée (satisfaction : ${country.satisfaction}%). Son impact sera immédiatement ressenti par les ${Math.round(country.population/1e6*10)/10} M de citoyens.`
        : `La décision impactera directement les ${Math.round(country.population/1e6*10)/10} M de citoyens. L'adhésion ARIA actuelle (${country.aria_current ?? '?'}%) conditionnera l'acceptation populaire.`;

    return {
        convergence,
        synthese: getSynthesePresidence(convergence),
        voteType: 'referendum',
        voteQuestion,
        question_referendum: voteQuestion,
        voteOptions: {
            oui: { label: 'OUI — ADOPTER', color: COLORS.greenHex, icon: '✓' },
            non: { label: 'NON — REJETER', color: COLORS.redHex,   icon: '✕' },
        },
        // Compat backward
        position_phare_resume:    decisionMajoritaire,
        position_boussole_resume: decisionMinoritaire,
        // Nouveaux champs
        position_majority_resume: decisionMajoritaire,
        position_minority_resume: decisionMinoritaire,
        positions_presidentielles: presEntries.map(([id, data], i) => ({
            id, name: data.name, symbol: data.symbol || data.emoji || '★',
            resume: aiResults[i]?.decision || '',
        })),
        enjeu_principal: enjeu,
    };
}
