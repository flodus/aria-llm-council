// src/features/world/components/CountryPanel/council/CouncilMinistryQuestions.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Composant : Liste des questions fréquentes d'un ministère
//  Features :
//    - Affiche 6 questions échantillonnées depuis aria_questions.json
//    - La question du cycle actuel arrive en bas dès le clic (⏳)
//    - Après le vote : couleur immédiate (vert/rouge/doré/violet) via councilSession
//    - Les votes des cycles précédents : badge Cx + icône couleur
//
//  Architecture : question du bas calculée EN RENDU depuis councilSession (prop-down)
//  → Pas de lecture localStorage pour le cycle courant
//  → Pas de useEffect déclenché par lastVoteTimestamp
// ═══════════════════════════════════════════════════════════════════════════

import { FONT } from '../../../../../shared/theme';
import { getQuestionState } from '../../../../../shared/services/boardgame/questionService';
import QUESTIONS_FR from '../../../../../../templates/aria_questions.json';
import { useState, useEffect, useCallback, useMemo } from 'react';

function getPool(ministryId) {
    return QUESTIONS_FR?.par_ministere?.[ministryId]?.questions || [];
}

export default function MinistryQuestions({
    ministryId,
    ministryColor,
    handleSubmit,
    submitting,
    lang,
    countryId,
    cycleActuel,
    councilSession,   // { question, ministryId (résolu), countryId, voteResult? }
    count = 6
}) {
    const isEn = lang === 'en';

    // Tirage aléatoire de base — uniquement quand le cycle ou le ministère change
    const [baseQuestions, setBaseQuestions] = useState([]);

    useEffect(() => {
        const pool = getPool(ministryId);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setBaseQuestions(shuffled);
    }, [ministryId, countryId, cycleActuel]);

    // Question du bas : councilSession si elle concerne ce ministère + ce pays
    const bottomQuestion = useMemo(() => {
        if (!councilSession?.question) return null;
        if (councilSession.countryId !== countryId) return null;
        const pool = getPool(ministryId);
        // Correspondance directe ou par appartenance au pool (gère le routing mismatch)
        if (councilSession.ministryId === ministryId || pool.includes(councilSession.question)) {
            return councilSession.question;
        }
        return null;
    }, [councilSession, ministryId, countryId]);

    // État de la question du bas — calculé depuis councilSession, synchrone à l'ouverture du modal
    const bottomState = useMemo(() => {
        if (!bottomQuestion) return null;
        if (councilSession?.voteResult) {
            const { vote, label } = councilSession.voteResult;
            let color = '#4CAF50';
            if (vote === 'non')           color = '#F44336';
            else if (vote === 'phare')    color = '#C8A44A';
            else if (vote === 'boussole') color = '#9B7EC8';
            return { vote, color, label: label || '', isCurrentCycle: true, cycle: cycleActuel };
        }
        // Vote en cours : sablier
        return { isCurrentCycle: true, cycle: cycleActuel, color: '#C8A44A', vote: null };
    }, [bottomQuestion, councilSession, cycleActuel]);

    // Liste finale : base filtrée + question du bas en dernier
    const questions = useMemo(() => {
        const filtered = baseQuestions
            .filter(q => q !== bottomQuestion)
            .slice(0, count)
            .map(q => ({ question: q, state: getQuestionState(q, countryId, ministryId) }));

        if (bottomQuestion) {
            filtered.push({ question: bottomQuestion, state: bottomState });
        }
        return filtered;
    }, [baseQuestions, bottomQuestion, bottomState, countryId, ministryId, count]);

    const handleQuestionClick = useCallback((question, state) => {
        if (state?.isCurrentCycle) return;
        handleSubmit(question, ministryId);
    }, [handleSubmit, ministryId]);

    if (questions.length === 0) return null;

    return (
        <>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.38rem',
            letterSpacing: '0.12em',
            color: 'rgba(140,160,200,0.75)',
            marginBottom: '0.35rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
        <span>{isEn ? 'QUESTIONS' : 'QUESTIONS'}</span>
        </div>

        {questions.map((item, i) => {
            const { question, state } = item;
            const isCurrentCycle = state?.isCurrentCycle;

            let borderColor = ministryColor + '22';
            let bgColor = 'none';
            let textColor = 'rgba(160,180,220,0.65)';
            let leftIcon = null;

            if (state) {
                const stateColor = state.color || (isCurrentCycle ? '#C8A44A' : '#4CAF50');
                borderColor = stateColor + '40';
                bgColor = stateColor + '08';
                textColor = stateColor + 'cc';

                if (state.vote) {
                    leftIcon = (
                        <span style={{
                            color: stateColor,
                            fontSize: '0.5rem',
                            minWidth: '1.2rem',
                            textAlign: 'center',
                        }}>
                        {state.vote === 'phare' ? '☉' :
                            state.vote === 'boussole' ? '☽' :
                            state.vote === 'oui' ? '✓' : '✕'}
                        </span>
                    );
                } else if (isCurrentCycle) {
                    leftIcon = (
                        <span style={{
                            color: stateColor,
                            fontSize: '0.5rem',
                            minWidth: '1.2rem',
                            textAlign: 'center',
                        }}>⏳</span>
                    );
                }
            }

            return (
                <button
                key={`${ministryId}-${i}`}
                onClick={() => handleQuestionClick(question, state)}
                disabled={isCurrentCycle || submitting}
                style={{
                    width: '100%',
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '2px',
                    cursor: isCurrentCycle ? 'default' : 'pointer',
                    padding: '0.38rem 0.5rem',
                    marginBottom: '0.28rem',
                    fontFamily: FONT.mono,
                    fontSize: '0.43rem',
                    color: textColor,
                    textAlign: 'left',
                    lineHeight: 1.45,
                    opacity: isCurrentCycle ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.3rem',
                }}
                >
                {leftIcon}
                <span style={{ flex: 1 }}>{question}</span>
                {state && !isCurrentCycle && (
                    <span style={{
                        fontSize: '0.35rem',
                        color: state.color + 'aa',
                        fontFamily: FONT.mono,
                        background: 'rgba(0,0,0,0.2)',
                        padding: '0.1rem 0.3rem',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                    }}>
                    C{state.cycle}
                    </span>
                )}
                {isCurrentCycle && !state?.vote && (
                    <span style={{
                        fontSize: '0.35rem',
                        color: borderColor,
                        fontFamily: FONT.mono,
                        background: 'rgba(0,0,0,0.2)',
                        padding: '0.1rem 0.3rem',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                    }}>
                    {isEn ? 'this cycle' : 'ce cycle'}
                    </span>
                )}
                </button>
            );
        })}
        </>
    );
}
