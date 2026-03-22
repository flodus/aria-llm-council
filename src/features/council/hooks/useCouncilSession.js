// src/features/council/hooks/useCouncilSession.js
// ═══════════════════════════════════════════════════════════════════════════
//  useCouncilSession — Orchestration complète du Conseil ARIA
//
//  Extrait de Dashboard_p3.jsx. Gère :
//    - États councilSession + councilRunning
//    - Soumission de question (routing + garbage + mismatch)
//    - Phases de délibération (ministère → cercle → présidence)
//    - Vote du peuple
//    - Modales garbage + mismatch (état uniquement — UI dans CouncilModals)
//
//  Callbacks exposés vers Dashboard_p3 :
//    onVoteResult({ vote, voteResult, session }) — effets de bord (chronolog, stats pays)
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { routeQuestion, getBestMatch } from '../services/routingEngine';
import { runMinisterePhase, runCerclePhase, runPresidencePhase } from '../services/deliberationEngine';
import { computeVoteImpact } from '../services/voteEngine';
import { buildCountryContext } from '../services/contextBuilder';
import { MINISTRIES_LIST } from '../services/agentsManager';
import REPONSES_FR from '../../../../templates/languages/fr/aria_reponses.json';

function pickGarbage() {
    const msgs = REPONSES_FR.garbage?.messages || ['Question non reconnue. Veuillez reformuler.'];
    return msgs[Math.floor(Math.random() * msgs.length)];
}

/**
 * @param {object} country        — pays sélectionné (depuis Dashboard_p3)
 * @param {function} onVoteResult — callback({ vote, voteResult, session }) pour effets de bord
 */
export function useCouncilSession(country, onVoteResult) {
    const [session,       setSession]       = useState(null);
    const [running,       setRunning]       = useState(false);
    const [garbageModal,  setGarbageModal]  = useState(null); // { msg } | null
    const [mismatchModal, setMismatchModal] = useState(null); // { question, forceId, forceName, suggestedId, suggestedName } | null

    // ── Cœur de la délibération ──────────────────────────────────────────────
    const launchCouncil = useCallback(async (question, ministryId) => {
        if (!country) return;
        setRunning(true);

        const countryContext     = buildCountryContext(country);
        const countryDescription = country.contextOverride?.trim()
            || [country.description, country.geoContext].filter(Boolean).join('\n\n')
            || '';
        setSession({ question, ministryId, countryId: country.id, countryContext, countryNom: country.nom, countryDescription });

        const resolvedId = await routeQuestion(question, ministryId);
        const ministry   = resolvedId ? MINISTRIES_LIST.find(m => m.id === resolvedId) : null;
        setSession(prev => ({ ...prev, ministryId: resolvedId }));

        try {
            const ministereResult = await runMinisterePhase(ministry, question, country);
            setSession(prev => ({ ...prev, ministere: ministereResult }));

            const cercleResult = await runCerclePhase(resolvedId, question, ministereResult.synthese, country);
            setSession(prev => ({ ...prev, cercle: cercleResult }));

            const presidenceResult = await runPresidencePhase(question, ministereResult, cercleResult, country);
            setSession(prev => ({ ...prev, presidence: presidenceResult, voteReady: true }));
        } catch (e) {
            console.warn('[ARIA Council]', e);
        } finally {
            setRunning(false);
        }
    }, [country]);

    // ── Soumission de question ───────────────────────────────────────────────
    const submitQuestion = useCallback(async (question, ministryId) => {
        if (!country || running) return;

        const bestMatch = getBestMatch(question);

        // Cas 1 — question garbage (aucun keyword ne matche)
        if (!bestMatch) {
            setGarbageModal({ msg: pickGarbage() });
            return;
        }

        // Cas 2 — ministère forcé par l'utilisateur mais meilleur match ailleurs
        if (ministryId && bestMatch.ministryId !== ministryId) {
            const forceMin    = MINISTRIES_LIST.find(m => m.id === ministryId);
            const suggestMin  = MINISTRIES_LIST.find(m => m.id === bestMatch.ministryId);
            setMismatchModal({
                question,
                forceId:       ministryId,
                forceName:     forceMin?.name  || ministryId,
                forceEmoji:    forceMin?.emoji || '📋',
                suggestedId:   bestMatch.ministryId,
                suggestedName: suggestMin?.name  || bestMatch.ministryId,
                suggestedEmoji: suggestMin?.emoji || '📋',
            });
            return;
        }

        // Cas 3 — OK, on lance
        await launchCouncil(question, ministryId);
    }, [country, running, launchCouncil]);

    // ── Résolution mismatch ──────────────────────────────────────────────────
    const resolveMismatch = useCallback((choice) => {
        // choice : 'force' (rester sur le ministère choisi) | 'suggest' (basculer)
        const { question, forceId, suggestedId } = mismatchModal;
        setMismatchModal(null);
        launchCouncil(question, choice === 'force' ? forceId : suggestedId);
    }, [mismatchModal, launchCouncil]);

    // ── Vote du peuple ───────────────────────────────────────────────────────
    const vote = useCallback((choix) => {
        if (!session?.presidence || !country) return;

        const impact = computeVoteImpact(choix, session.presidence, country);
        const total  = Math.max(Math.round(country.population / 1_000_000 * 10) * 10_000, 500_000);
        const bias   = (choix === 'oui' || choix === 'phare')
            ? 0.55 + Math.random() * 0.25
            : 0.55 + Math.random() * 0.20;

        let ouiVotes, nonVotes, phareVotes, boussoleVotes;
        if (choix === 'phare' || choix === 'boussole') {
            phareVotes    = choix === 'phare' ? Math.round(total * bias) : Math.round(total * (1 - bias));
            boussoleVotes = total - phareVotes;
            ouiVotes      = phareVotes;
            nonVotes      = boussoleVotes;
        } else {
            ouiVotes      = choix === 'oui' ? Math.round(total * bias) : Math.round(total * (1 - bias));
            nonVotes      = total - ouiVotes;
            phareVotes    = ouiVotes;
            boussoleVotes = nonVotes;
        }

        const voteResult = { ...impact, vote: choix, oui: ouiVotes, non: nonVotes, phare: phareVotes, boussole: boussoleVotes };
        setSession(prev => ({ ...prev, voteResult, voteReady: false }));

        onVoteResult?.({ vote: choix, voteResult, session: { ...session, voteResult } });
    }, [session, country, onVoteResult]);

    return {
        session,
        running,
        submitQuestion,
        vote,
        garbageModal,
        closeGarbageModal:  () => setGarbageModal(null),
        mismatchModal,
        resolveMismatch,
    };
}
