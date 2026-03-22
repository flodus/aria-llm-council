// src/features/council/services/deliberationEngine.js

// ============================================================
// PHASES DE DÉLIBÉRATION DU CONSEIL
// ============================================================

import { callAI, getApiKeys } from '../../../Dashboard_p1';
import { getMinistersMapFor, getMinistriesListFor, getPresidencyFor } from './agentsManager';
import { buildCountryContext, langPrefix } from './contextBuilder';  // direct
import { FALLBACK_RESPONSES, localMinisterFallback, localSyntheseFallback, localAnnotationFallback } from './fallbacks';
import { getSynthesePresidence } from '../../../shared/services/boardgame/responseService';
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
    const _pres = getPresidencyFor(country);
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

    if (!phare || !boussole) {
        // Fallback contextuel — varie selon la question et l'état du pays
        // On utilise le hash de la question pour avoir une variation déterministe
        const questionHash = question.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = (questionHash + country.satisfaction) % 100 / 100; // valeur entre 0 et 1

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

        // CAS 1: Consensus ACTION (les deux veulent agir)
        if (random < 0.25) {
            phare = {
                position: `Sur la question « ${question.slice(0,60)}${question.length>60?'…':''} », le Phare identifie un enjeu ${angle} de premier ordre. ${tension} Une action immédiate est nécessaire.`,
                decision: `Lancer une initiative nationale sur cet enjeu dans les plus brefs délais.`,
            };
            boussole = {
                position: `${pop}, la question « ${question.slice(0,55)}${question.length>55?'…':''} » nécessite une réponse. ${memoire} La Boussole soutient une action mesurée mais déterminée.`,
                decision: `Soutenir l'action du Phare tout en veillant à protéger les équilibres existants.`,
            };
        }
        // CAS 2: Consensus PRUDENCE (les deux veulent attendre)
        else if (random < 0.5) {
            phare = {
                position: `Sur la question « ${question.slice(0,60)}${question.length>60?'…':''} », le Phare discerne un enjeu ${angle} qui mérite réflexion. ${tension} Une décision précipitée serait contre-productive.`,
                decision: `Prendre le temps d'étudier toutes les implications avant d'agir.`,
            };
            boussole = {
                position: `${pop}, la question « ${question.slice(0,55)}${question.length>55?'…':''} » appelle à la prudence. ${memoire} Une consultation approfondie est nécessaire.`,
                decision: `Organiser une consultation citoyenne et reporter toute décision irréversible.`,
            };
        }
        // CAS 3: Divergence (Phare action / Boussole prudence)
        else if (random < 0.75) {
            phare = {
                position: `Sur la question « ${question.slice(0,60)}${question.length>60?'…':''} », le Phare identifie un enjeu ${angle} de premier ordre. ${tension} Une vision à long terme impose de tracer une direction claire plutôt que de temporiser.`,
                decision: `Adopter une position ferme sur cet enjeu pour maintenir la cohérence de la trajectoire ARIA.`,
            };
            boussole = {
                position: `${pop}, la question « ${question.slice(0,55)}${question.length>55?'…':''} » touche à des équilibres établis. ${memoire} La mémoire des cycles précédents invite à la nuance avant tout engagement irréversible.`,
                decision: `Consulter les parties prenantes et prévoir un mécanisme de révision à court terme.`,
            };
        }
        // CAS 4: Divergence (Phare prudence / Boussole action) - plus rare
        else {
            phare = {
                position: `Sur la question « ${question.slice(0,60)}${question.length>60?'…':''} », le Phare perçoit des risques à long terme. Une action trop rapide pourrait compromettre des équilibres fragiles.`,
                decision: `Temporiser et observer l'évolution de la situation.`,
            };
            boussole = {
                position: `${pop}, la question « ${question.slice(0,55)}${question.length>55?'…':''} » ne peut attendre. ${memoire} La protection du peuple exige parfois des décisions rapides.`,
                decision: `Agir sans délai pour prévenir une dégradation.`,
            };
        }
    }

    // ── Synthèse présidentielle ───────────────────────────────────────────────
    let synthese = null;
    if (keys.claude || keys.gemini) {
        const pSynth = buildSynthesePresidencePrompt(phare, boussole, question, country);
        synthese = await callAI(pSynth, 'council_synthese_pres').catch(() => null);
    }
    // src/features/council/services/deliberationEngine.js
    // Vers la fin, autour de la ligne 380-410

    if (!synthese) {
        // Évaluation contextuelle de la convergence
        const phrA = phare.decision?.toLowerCase() || '';
        const phrB = boussole.decision?.toLowerCase() || '';

        // Mots-clés pour l'action (Phare)
        const actionWords = [
            'adopter', 'action', 'immédiat', 'ferme', 'décision',
            'appliquer', 'intervenir', 'agir', 'lancer', 'engager',
            'procéder', 'mettre en œuvre', 'exécuter', 'réaliser'
        ];

        // Mots-clés pour la prudence (Boussole)
        const cautionWords = [
            'consulter', 'révision', 'prudence', 'attente', 'nuance',
            'réfléchir', 'étudier', 'analyser', 'patienter', 'temporiser',
            'reporter', 'différer', 'suspendre', 'examiner', 'évaluer'
        ];

        const phareIsAction = actionWords.some(w => phrA.includes(w));
        const phareIsCaution = cautionWords.some(w => phrA.includes(w));
        const boussoleIsAction = actionWords.some(w => phrB.includes(w));
        const boussoleIsCaution = cautionWords.some(w => phrB.includes(w));

        // Convergence si les deux veulent agir OU les deux veulent attendre
        let convergence = (phareIsAction && boussoleIsAction) || (phareIsCaution && boussoleIsCaution);

        // Si on n'arrive pas à déterminer clairement
        if (!phareIsAction && !phareIsCaution && !boussoleIsAction && !boussoleIsCaution) {
            // Fallback: comparer la similarité des décisions
            const wordsA = new Set(phrA.split(' '));
            const wordsB = new Set(phrB.split(' '));
            const commonWords = [...wordsA].filter(word => wordsB.has(word) && word.length > 3);

            // Convergence si elles partagent au moins 2 mots significatifs
            convergence = commonWords.length >= 2;
        }

        // DÉTERMINATION DU TYPE DE VOTE
        let voteType = 'referendum';
        let voteQuestion;
        let voteOptions = {};

        if (convergence) {
            voteType = 'referendum';
            voteQuestion = `Approuvez-vous la proposition suivante : "${phare.decision}" ?`;
            voteOptions = {
                oui: { label: 'OUI — ADOPTER', color: COLORS.greenHex, icon: '✓' },
                non: { label: 'NON — REJETER', color: COLORS.redHex,   icon: '✕' }
            };
        } else {
            voteType = 'binary';
            voteQuestion = `Quelle orientation le gouvernement doit-il suivre ?`;
            voteOptions = {
                phare: {
                    label: `☉ PHARE — ${phare.decision}`,
                    color: COLORS.goldHex,
                    icon: '☉',
                    decision: phare.decision
                },
                boussole: {
                    label: `☽ BOUSSOLE — ${boussole.decision}`,
                    color: COLORS.purpleHex,
                    icon: '☽',
                    decision: boussole.decision
                }
            };
        }

        // Construire l'enjeu
        const enjeu = country.satisfaction < 40
        ? `Cette décision intervient dans un contexte de tension sociale élevée (satisfaction : ${country.satisfaction}%). Son impact sera immédiatement ressenti par les ${Math.round(country.population/1e6*10)/10} M de citoyens.`
        : `La décision impactera directement les ${Math.round(country.population/1e6*10)/10} M de citoyens. L'adhésion ARIA actuelle (${country.aria_current ?? '?'}%) conditionnera l'acceptation populaire.`;

        synthese = {
            convergence,
            synthese: getSynthesePresidence(convergence),
            voteType,
            voteQuestion,
            voteOptions,
            question_referendum: voteQuestion,
            position_phare_resume: phare.decision || 'Action prioritaire.',
            position_boussole_resume: boussole.decision || 'Consultation et révision.',
            enjeu_principal: enjeu,
        };
    }

    return {
        phare:    { ...phareData,    ...phare },
        boussole: { ...boussoleData, ...boussole },
        synthese,
    };
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
