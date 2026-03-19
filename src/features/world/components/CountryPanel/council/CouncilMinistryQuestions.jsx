// src/features/world/components/CountryPanel/council/CouncilMinistryQuestions.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Composant : Liste des questions fréquentes d'un ministère
//  Features :
//    - Affiche 6 questions échantillonnées
//    - La question du cycle actuel est grisée et en bas
//    - Les questions des cycles précédents ont un badge Cx avec la couleur du vote
//    - Bouton actualiser (icône seule) pour changer l'échantillon
// ═══════════════════════════════════════════════════════════════════════════

import { FONT } from '../../../../../shared/theme';
import { getMinistryQuestionsSample } from '../../../../../shared/services/boardgame/questionService';
import { useState, useEffect, useCallback } from 'react';

export default function MinistryQuestions({
    ministryId,
    ministryColor,
    handleSubmit,
    submitting,
    lang,
    countryId,
    cycleActuel,
    currentCycleQuestion,
    setMinistryCycleQuestion,
    onQuestionSelected,
    lastVoteTimestamp
}) {
    const isEn = lang === 'en';
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const sample = getMinistryQuestionsSample(
            ministryId,
            countryId,
            cycleActuel,
            currentCycleQuestion,
            6
        );

        setQuestions(sample);
    }, [
        ministryId,
        countryId,
        cycleActuel,
        currentCycleQuestion,
        lastVoteTimestamp?.[ministryId]  // ← Change à chaque vote pour ce ministère
    ]);

    const handleQuestionClick = useCallback((question, state) => {
        if (state?.isCurrentCycle) return;

        if (onQuestionSelected) {
            onQuestionSelected(question);
        }

        handleSubmit(question, ministryId);
    }, [handleSubmit, ministryId, onQuestionSelected]);

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
