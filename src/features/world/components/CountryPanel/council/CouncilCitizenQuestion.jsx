// src/features/world/components/CountryPanel/council/CouncilCitizenQuestion.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Composant : Question personnalisée du citoyen
//  Rôle : Permet à l'utilisateur de saisir sa propre question pour un ministère
//  Features :
//    - Suggestion automatique (bouton 💡) qui pioche dans le pool du ministère
//    - Détection en temps réel si la question a déjà été posée
//    - Affichage du cycle et du résultat si déjà posée
//    - Désactivation du bouton de soumission si question déjà posée
// ═══════════════════════════════════════════════════════════════════════════

import { FONT } from '../../../../../shared/theme';
import { getSuggestion, getQuestionState } from '../../../../../shared/services/boardgame/questionService';
import { useState, useEffect } from 'react';

export default function CitizenQuestion({
    ministryId,
    ministryColor,
    customQ,
    setCustomQ,
    handleSubmit,
    submitting,
    lang,
    countryId,
    currentCycleQuestion,
    setCurrentCycleQuestion,
    setMinistryCycleQuestion,
    cycleActuel
    }) {
        const isEn = lang === 'en';

    // État de la question courante (null si jamais posée, sinon objet avec historique)
    const [questionState, setQuestionState] = useState(null);

    // ============================================================
    // Effet : Vérifie en temps réel si la question saisie a déjà été posée
    // Déclenché à chaque modification du textarea
    // ============================================================
    useEffect(() => {
        if (customQ.trim()) {
            // Récupère l'historique de cette question pour ce pays/ministère
            const state = getQuestionState(customQ, countryId, ministryId);
            setQuestionState(state);
        } else {
            setQuestionState(null);
        }
    }, [customQ, countryId, ministryId]); // Re-vérifie si la question ou le contexte change

    // ============================================================
    // Détection du mode Board Game (pas d'IA)
    // Lit la config dans localStorage
    // ============================================================
    const isBoardGame = (() => {
        try {
            const opts = JSON.parse(localStorage.getItem('aria_options') || '{}');
            return opts.ia_mode === 'none' || opts.force_local;
        } catch {
            return false;
        }
    })();

    // ============================================================
    // Gestionnaire du bouton "Suggestion"
    // Pioche une question aléatoire dans le pool du ministère
    // Exclut automatiquement la question du cycle actuel
    // ============================================================
    const handleSuggest = () => {
        // Utilise la nouvelle fonction getSuggestion qui exclut currentCycleQuestion
        const suggested = getSuggestion(ministryId, countryId, currentCycleQuestion);
        if (suggested) setCustomQ(suggested);
    };

        // ============================================================
        // Gestionnaire de la touche Entrée
        // Permet de soumettre avec Ctrl+Enter ou Shift+Enter
        // ============================================================
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Empêche le saut de ligne
                handleSubmit(customQ, ministryId);
            }
        };

        // Détermine si la question est déjà posée (dans ce cycle ou un précédent)
        const isUsed = questionState !== null;

        // Détermine si c'est la question du cycle actuel
        const isCurrentCycleQuestion = customQ === currentCycleQuestion;

        // Couleur à utiliser pour le styling (celle du ministère ou celle du vote passé)
        const activeColor = questionState?.color || ministryColor;

        // ============================================================
        // Rendu du composant
        // ============================================================
        return (
            <div style={{ marginTop: '0.4rem' }}>
            {/* En-tête avec titre et bouton suggestion */}
            <div style={{
                fontFamily: FONT.mono,
                fontSize: '0.38rem',
                letterSpacing: '0.12em',
                color: 'rgba(140,160,200,0.75)',
                marginBottom: '0.28rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <span>{isEn ? 'CITIZEN QUESTION' : 'QUESTION DU PEUPLE'}</span>

            {/* Bouton Suggestion */}
            <button
                onClick={handleSuggest}
                style={{
                    background: 'rgba(200,164,74,0.10)',
                             border: '1px solid rgba(200,164,74,0.30)',
                             borderRadius: '2px',
                             padding: '0.15rem 0.5rem',
                             fontFamily: FONT.mono,
                             fontSize: '0.35rem',
                             color: 'rgba(200,164,74,0.85)',
                             cursor: 'pointer',
                             letterSpacing: '0.08em',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '0.2rem',
                }}
                title={isEn ? 'Suggest a question' : 'Suggérer une question'}
                >
                💡 {isEn ? 'SUGGEST' : 'SUGGESTION'}
                </button>
            </div>

            {/* Zone de saisie avec indication visuelle si déjà posée */}
            <div style={{ position: 'relative' }}>
            <textarea
            value={customQ}
            onChange={e => setCustomQ(e.target.value)}
            placeholder={`${isEn ? 'Question for' : 'Question pour'} ${'ce ministère'}…`}
            rows={2}
            style={{
                width: '100%',
                // Fond plus sombre si question déjà posée
                background: isUsed ? activeColor + '08' : 'rgba(8,14,26,0.7)',
                // Bordure colorée selon l'état
                border: `1px solid ${isUsed ? activeColor + '40' : ministryColor + '28'}`,
                borderRadius: '2px',
                padding: '0.4rem 0.5rem',
                fontFamily: FONT.mono,
                fontSize: '0.43rem',
                color: isUsed ? activeColor + 'cc' : 'rgba(180,200,230,0.80)',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5,
                // Espace réservé à droite pour le badge
                paddingRight: isUsed ? '4rem' : '0.5rem',
            }}
            onFocus={e => {
                // Effet de focus seulement si question non utilisée
                if (!isUsed) e.target.style.borderColor = `${ministryColor}55`;
            }}
            onBlur={e => {
                // Retour à la normale
                if (!isUsed) e.target.style.borderColor = `${ministryColor}28`;
            }}
            onKeyDown={handleKeyDown}
            />

            {/* Badge d'information si question déjà posée */}
            {isUsed && (
                <div style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                        color: activeColor,
                        fontSize: '0.4rem',
                        fontFamily: FONT.mono,
                        background: 'rgba(20,30,45,0.9)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '2px',
                        border: `1px solid ${activeColor}40`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        pointerEvents: 'none', // Le badge ne bloque pas les clics sur le textarea
                }}>
                {/* Icône du résultat du vote */}
                <span>
                {questionState.vote === 'phare' ? '☉' :
                    questionState.vote === 'boussole' ? '☽' :
                    questionState.vote === 'oui' ? '✓' : '✕'}
                    </span>
                    {/* Numéro du cycle où elle a été posée */}
                    <span>C{questionState.cycle}</span>
                    {/* Indicateur si c'est la question du cycle actuel */}
                    {isCurrentCycleQuestion && (
                        <span style={{ fontSize: '0.3rem', opacity: 0.7 }}>
                        ({isEn ? 'current' : 'en cours'})
                        </span>
                    )}
                    </div>
            )}
            </div>

            {/* Bouton de soumission - désactivé si question déjà posée */}
            <button
            onClick={() => handleSubmit(customQ, ministryId)}
            disabled={!customQ.trim() || submitting || isUsed}
            style={{
                marginTop: '0.3rem',
                width: '100%',
                padding: '0.32rem',
                fontFamily: FONT.mono,
                fontSize: '0.44rem',
                letterSpacing: '0.10em',
                cursor: (customQ.trim() && !submitting && !isUsed) ? 'pointer' : 'default',
                background: (customQ.trim() && !isUsed) ? `${ministryColor}14` : 'transparent',
                border: `1px solid ${(customQ.trim() && !isUsed) ? ministryColor + '44' : 'rgba(90,110,160,0.15)'}`,
                borderRadius: '2px',
                color: (customQ.trim() && !isUsed) ? ministryColor :
                isUsed ? activeColor + '80' : 'rgba(90,110,160,0.30)',
                transition: 'all 0.15s ease',
            }}
            >
            {/* Texte du bouton selon l'état */}
            {submitting
                ? (isEn ? '⏳ SUBMITTING…' : '⏳ ENVOI…')
                : isUsed
                ? (isEn
                ? `✓ ASKED (C${questionState.cycle})`
                : `✓ POSÉE (C${questionState.cycle})`)
                : (isEn ? 'SUBMIT TO COUNCIL →' : 'SOUMETTRE AU CONSEIL →')}
                </button>
                </div>
        );
}
