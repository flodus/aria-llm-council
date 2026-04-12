// src/features/world/components/CountryPanel/council/CouncilMinistryQuestions.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Composant : Liste des questions fréquentes d'un ministère
//
//  Architecture :
//    - useEffect    → tirage aléatoire de base (uniquement si cycle/ministère change)
//    - useMemo      → overlay vote en rendu synchrone (pas de délai)
//
//  UX :
//    ⏳  La question cliquée reste EN PLACE avec sablier + encadré doré
//    ✓✕☉☽  Au vote : glisse en bas avec la couleur du résultat
//    Cx  Cycles précédents : badge discret dans la liste normale
// ═══════════════════════════════════════════════════════════════════════════

import { FONT, COLORS } from '../../../../../shared/theme';
import { t } from '../../../../../ariaI18n';
import { getQuestionState } from '../../../../../shared/services/boardgame/questionService';
import QUESTIONS_FR from '../../../../../../templates/languages/fr/aria_questions.json';
import QUESTIONS_EN from '../../../../../../templates/languages/en/aria_questions.json';
import { useState, useEffect, useCallback, useMemo } from 'react';

// Dérive le numéro de cycle courant depuis localStorage quand la prop est absente
function getCycleEffectif(cycleActuel) {
    if (cycleActuel !== undefined && cycleActuel !== null) return cycleActuel;
    try {
        const cycles = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        if (!cycles.length) return 1;
        return Math.max(...cycles.map(c => c.cycleNum));
    } catch { return 1; }
}

function getPool(ministryId, lang) {
    const src = lang === 'en' ? QUESTIONS_EN : QUESTIONS_FR;
    return src?.par_ministere?.[ministryId]?.questions || [];
}

const LS_KEY = 'aria_chronolog_cycles';

function readVotedEntry(ministryId, countryId, cycleActuel) {
    try {
        const pool = getPool(ministryId);
        const cycles = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        const effectif = getCycleEffectif(cycleActuel);
        const cycleData = cycles.find(c => c.cycleNum === effectif);
        if (!cycleData) return null;
        const voteEvents = (cycleData.events || []).filter(e =>
            e.type === 'vote' && e.countryId === countryId
        );
        return voteEvents.find(e => e.ministereId === ministryId)
            || voteEvents.find(e => pool.includes(e.question))
            || null;
    } catch { return null; }
}

export default function MinistryQuestions({
    ministryId,
    ministryColor,
    handleSubmit,
    submitting,
    lang,
    countryId,
    cycleActuel,
    currentCycleQuestion,
}) {
    const isEn = lang === 'en';
    const effectifCycle = getCycleEffectif(cycleActuel);

    // ── Tirage aléatoire de base — uniquement quand cycle ou ministère change ──
    const [baseQuestions, setBaseQuestions] = useState([]);

    useEffect(() => {
        const pool = getPool(ministryId, lang);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setBaseQuestions(shuffled);
    }, [ministryId, countryId, effectifCycle, lang]);

    // ── Compteur incrémenté par le custom event 'aria:vote-stored' ──
    const [voteCounter, setVoteCounter] = useState(0);
    useEffect(() => {
        const handler = () => setVoteCounter(n => n + 1);
        window.addEventListener('aria:vote-stored', handler);
        return () => window.removeEventListener('aria:vote-stored', handler);
    }, []);

    // ── Overlay vote + ⏳ calculé EN RENDU (synchrone) ──
    const questions = useMemo(() => {
        const votedEntry = readVotedEntry(ministryId, countryId, effectifCycle);
        const votedQuestion = votedEntry?.question || null;

        // Seul le vote déplace la question en bas
        const poolExclude = votedQuestion ? [votedQuestion] : [];
        const sample = baseQuestions
            .filter(q => !poolExclude.includes(q))
            .slice(0, 6);

        const result = sample.map(question => {
            // ⏳ en place : question soumise mais pas encore votée
            if (currentCycleQuestion && question === currentCycleQuestion && !votedEntry) {
                return {
                    question,
                    state: { isCurrentCycle: true, cycle: effectifCycle, color: COLORS.goldHex, vote: null }
                };
            }
            return { question, state: getQuestionState(question, countryId, ministryId) };
        });

        // Question votée → bas avec couleur du résultat
        if (votedEntry && votedQuestion) {
            let color = COLORS.greenHex;
            if (votedEntry.vote === 'non')           color = COLORS.redHex;
            else if (votedEntry.vote === 'phare')    color = COLORS.goldHex;
            else if (votedEntry.vote === 'boussole') color = COLORS.purpleHex;
            result.push({
                question: votedQuestion,
                state: {
                    vote:           votedEntry.vote,
                    color,
                    label:          votedEntry.label || '',
                    isCurrentCycle: true,
                    cycle:          effectifCycle
                }
            });
        }

        return result;
    }, [baseQuestions, ministryId, countryId, effectifCycle, currentCycleQuestion, voteCounter]);

    const handleQuestionClick = useCallback((question, state) => {
        if (state?.isCurrentCycle) return;
        handleSubmit(question, ministryId);
    }, [handleSubmit, ministryId]);

    if (questions.length === 0) return null;

    const handleRefresh = () => {
        const pool = getPool(ministryId, lang);
        setBaseQuestions([...pool].sort(() => Math.random() - 0.5));
    };

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
            alignItems: 'center',
        }}>
        <span>{isEn ? 'QUESTIONS' : 'QUESTIONS'}</span>
        <button
            onClick={handleRefresh}
            style={{
                background: 'none',
                border: 'none',
                padding: '0.1rem 0.2rem',
                cursor: 'pointer',
                color: 'rgba(140,160,200,0.45)',
                fontSize: '0.7rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
            }}
            title={t('Q_REFRESH_TIP', lang)}
        >
            <span className="mdi mdi-refresh" />
        </button>
        </div>

        {questions.map((item, i) => {
            const { question, state } = item;
            const isCurrentCycle = state?.isCurrentCycle;

            let borderColor = ministryColor + '22';
            let bgColor = 'none';
            let textColor = 'rgba(160,180,220,0.65)';
            let leftIcon = null;

            if (state) {
                const stateColor = state.color || (isCurrentCycle ? COLORS.goldHex : COLORS.greenHex);
                borderColor = stateColor + '40';
                bgColor     = stateColor + '08';
                textColor   = stateColor + 'cc';

                if (state.vote) {
                    leftIcon = (
                        <span style={{ color: stateColor, fontSize: '0.5rem', minWidth: '1.2rem', textAlign: 'center' }}>
                        {state.vote === 'phare' ? '☉' :
                            state.vote === 'boussole' ? '☽' :
                            state.vote === 'oui' ? '✓' : '✕'}
                        </span>
                    );
                } else if (isCurrentCycle) {
                    leftIcon = (
                        <span style={{ color: stateColor, fontSize: '0.5rem', minWidth: '1.2rem', textAlign: 'center' }}>⏳</span>
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
                    {t('Q_THIS_CYCLE', lang)}
                    </span>
                )}
                </button>
            );
        })}
        </>
    );
}
