// src/features/world/components/CountryPanel/CountryPanelCouncil.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  Composant : Vue principale du conseil
//  Orchestre l'affichage des ministères et des questions
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FONT } from '../../../../shared/theme';
import { getMinistriesList } from '../../../council/services/councilEngine';
import MinistryList from './council/CouncilMinistryList';
import FreeQuestion from './council/CouncilFreeQuestion';
import CouncilFooter from './council/CouncilFooter';
export default function CountryPanelCouncil({
    country,
    lang,
    openMinistry,
    setOpenMinistry,
    customQ,
    setCustomQ,
    freeQ,
    setFreeQ,
    submitting,
    handleSubmit,
    onNextCycle,
    onConstitution,
    onSecession,
    cycleActuel,
    currentCycleQuestions,
    setMinistryCycleQuestion: externalSetMinistryCycleQuestion
}) {
    const isEn = lang === 'en';
    const ministries = getMinistriesList();
    const countryId = country?.id;

    // State local avec lazy initialization
    const [localState, setLocalState] = useState(() => ({
        cycleQuestions: currentCycleQuestions || {},
        version: 0
    }));

    // Synchronisation avec les props
    useEffect(() => {
        let isMounted = true;

        const timer = setTimeout(() => {
            if (isMounted && JSON.stringify(localState.cycleQuestions) !== JSON.stringify(currentCycleQuestions)) {
                setLocalState(prev => ({
                    ...prev,
                    cycleQuestions: currentCycleQuestions || {},
                    version: prev.version + 1
                }));
            }
        }, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [currentCycleQuestions]);

    const getCurrentQuestionForMinistry = useCallback((ministryId) => {
        return localState.cycleQuestions[ministryId] || null;
    }, [localState.cycleQuestions]);

    const updateCycleQuestion = useCallback((ministryId, question) => {
        console.log(`📝 [CountryPanelCouncil] Mise à jour ${ministryId}:`, question);

        setLocalState(prev => {
            const newQuestions = {
                ...prev.cycleQuestions,
                [ministryId]: question
            };

            return {
                cycleQuestions: newQuestions,
                version: prev.version + 1
            };
        });

        if (typeof externalSetMinistryCycleQuestion === 'function') {
            try {
                externalSetMinistryCycleQuestion(ministryId, question);
            } catch (error) {
                console.error('Erreur sync parent:', error);
            }
        }
    }, [externalSetMinistryCycleQuestion]);

    const wrappedHandleSubmit = useCallback((question, ministryId) => {
        console.log('📝 Soumission:', { ministryId, question });
        updateCycleQuestion(ministryId, question);
        handleSubmit(question, ministryId);
    }, [handleSubmit, updateCycleQuestion]);

    const ministryListProps = useMemo(() => ({
        ministries,
        openMinistry,
        setOpenMinistry,
        customQ,
        setCustomQ,
        submitting,
        handleSubmit: wrappedHandleSubmit,
        lang,
        countryId,
        cycleActuel,
        getCurrentQuestionForMinistry,
        setMinistryCycleQuestion: updateCycleQuestion
    }), [
        ministries, openMinistry, setOpenMinistry, customQ, setCustomQ,
        submitting, wrappedHandleSubmit, lang, countryId, cycleActuel,
        getCurrentQuestionForMinistry, updateCycleQuestion
    ]);

    const freeQuestionProps = useMemo(() => ({
        freeQ,
        setFreeQ,
        submitting,
        handleSubmit: wrappedHandleSubmit,
        lang,
        countryId,
        cycleActuel,
        currentCycleQuestion: localState.cycleQuestions['free'] || null,
        setMinistryCycleQuestion: (id, q) => updateCycleQuestion('free', q)
    }), [
        freeQ, setFreeQ, submitting, wrappedHandleSubmit, lang,
        countryId, cycleActuel, localState.cycleQuestions, updateCycleQuestion
    ]);

    return (
        <>
        <div className="side-panel-scroll">
        <div style={{ padding: '0.6rem 0.8rem' }}>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.40rem',
            letterSpacing: '0.16em',
            color: 'rgba(200,164,74,0.45)',
            marginBottom: '0.55rem'
        }}>
        {isEn ? 'MINISTRIES' : 'MINISTÈRES'}
        </div>

        <MinistryList {...ministryListProps} />

        <div style={{
            height: '1px',
            background: 'rgba(90,110,160,0.10)',
            margin: '0.7rem 0'
        }} />

        <FreeQuestion {...freeQuestionProps} />
        </div>
        </div>

        <CouncilFooter
        isEn={isEn}
        onNextCycle={onNextCycle}
        onConstitution={onConstitution}
        onSecession={onSecession}
        />

        </>
    );
}
