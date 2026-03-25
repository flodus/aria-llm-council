// src/features/world/components/CountryPanel/council/CouncilFreeQuestion.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Composant : Question libre (tous ministères)
//  Rôle : Permet à l'utilisateur de poser une question qui sera routée
//         automatiquement vers le ministère compétent
//  Features :
//    - Suggestion automatique (bouton 💡) qui pioche dans tous les pools
//    - Détection en temps réel si la question a déjà été posée
//    - Affichage du cycle et du résultat si déjà posée
//    - Désactivation du bouton de soumission si question déjà posée
// ═══════════════════════════════════════════════════════════════════════════

import { FONT } from '../../../../../shared/theme';
import { getRandomQuestion, getQuestionState } from '../../../../../shared/services/boardgame/questionService';
import { useState, useEffect } from 'react';

export default function FreeQuestion({
    freeQ,
setFreeQ,
submitting,
handleSubmit,
lang,
countryId,
currentCycleQuestion,
setCurrentCycleQuestion,
cycleActuel
}) {
    const isEn = lang === 'en';

    // État de la question courante (null si jamais posée, sinon objet avec historique)
    const [questionState, setQuestionState] = useState(null);

    // ============================================================
    // Effet : Vérifie en temps réel si la question saisie a déjà été posée
    // Note : Pour les questions libres, on cherche dans TOUS les ministères
    // ============================================================
    useEffect(() => {
        if (freeQ.trim()) {
            // Pour une question libre, on ne spécifie pas de ministère
            // La recherche se fait dans tout l'historique du pays
            const state = getQuestionState(freeQ, countryId, null);
            setQuestionState(state);
        } else {
            setQuestionState(null);
        }
    }, [freeQ, countryId]); // Re-vérifie si la question ou le contexte change

    // ============================================================
    // Détection du mode Board Game (pas d'IA)
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
    // Pioche une question aléatoire dans TOUS les pools
    // Exclut automatiquement la question du cycle actuel
    // ============================================================
    const handleSuggest = () => {
        // Pour les questions libres, on utilise getRandomQuestion
        // qui pioche dans tous les ministères + transversal
        const suggested = getRandomQuestion(countryId, currentCycleQuestion);
        if (suggested) setFreeQ(suggested);
    };

        // ============================================================
        // Gestionnaire de la touche Entrée
        // Permet de soumettre avec Ctrl+Enter ou Shift+Enter
        // ============================================================
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(freeQ, null); // null = pas de ministère forcé
            }
        };

        // Détermine si la question est déjà posée
        const isUsed = questionState !== null;

        // Détermine si c'est la question du cycle actuel
        const isCurrentCycleQuestion = freeQ === currentCycleQuestion;

        // Couleur à utiliser pour le styling
        const activeColor = questionState?.color || 'rgba(200,164,74,0.85)';

        // ============================================================
        // Rendu du composant
        // ============================================================
        return (
            <>
            {/* En-tête avec titre et bouton suggestion */}
            <div style={{
                fontFamily: FONT.mono,
                fontSize: '0.40rem',
                letterSpacing: '0.16em',
                color: 'rgba(140,160,200,0.75)',
                marginBottom: '0.4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <span>{isEn ? 'FREE QUESTION' : 'QUESTION LIBRE'}</span>

            {/* Bouton Suggestion — mode Board Game uniquement (sans IA) */}
            {isBoardGame && (
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
            )}
            </div>

            {/* Message d'information sur le routage automatique */}
            <div style={{
                fontFamily: FONT.mono,
                fontSize: '0.41rem',
                color: 'rgba(100,120,160,0.45)',
                lineHeight: 1.5,
                marginBottom: '0.45rem',
                fontStyle: 'italic'
            }}>
            {isEn
                ? 'The Council will automatically determine the competent ministry.'
        : 'Le Conseil déterminera automatiquement le ministère compétent.'}
        </div>

        {/* Zone de saisie avec indication visuelle si déjà posée */}
        <div style={{ position: 'relative' }}>
        <textarea
        value={freeQ}
        onChange={e => setFreeQ(e.target.value)}
        placeholder={isEn ? 'Ask any question…' : "Posez n'importe quelle question…"}
        rows={3}
        style={{
            width: '100%',
            background: isUsed ? activeColor + '08' : 'rgba(8,14,26,0.7)',
                border: `1px solid ${isUsed ? activeColor + '40' : 'rgba(90,110,160,0.16)'}`,
                borderRadius: '2px',
                padding: '0.4rem 0.5rem',
                fontFamily: FONT.mono,
                fontSize: '0.43rem',
                color: isUsed ? activeColor + 'cc' : 'rgba(180,200,230,0.80)',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5,
                paddingRight: isUsed ? '4rem' : '0.5rem',
        }}
        onFocus={e => {
            if (!isUsed) e.target.style.borderColor = 'rgba(200,164,74,0.30)';
        }}
        onBlur={e => {
            if (!isUsed) e.target.style.borderColor = 'rgba(90,110,160,0.16)';
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
                    pointerEvents: 'none',
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
        onClick={() => handleSubmit(freeQ, null)}
        disabled={!freeQ.trim() || submitting || isUsed}
        style={{
            marginTop: '0.3rem',
            width: '100%',
            padding: '0.35rem',
            fontFamily: FONT.mono,
            fontSize: '0.44rem',
            letterSpacing: '0.10em',
            cursor: (freeQ.trim() && !submitting && !isUsed) ? 'pointer' : 'default',
                background: (freeQ.trim() && !isUsed) ? 'rgba(200,164,74,0.10)' : 'transparent',
                border: `1px solid ${(freeQ.trim() && !isUsed) ? 'rgba(200,164,74,0.40)' : 'rgba(90,110,160,0.15)'}`,
                borderRadius: '2px',
                color: (freeQ.trim() && !isUsed) ? 'rgba(200,164,74,0.85)' :
                isUsed ? activeColor + '80' : 'rgba(90,110,160,0.30)',
                transition: 'all 0.15s ease',
        }}
        >
        {/* Texte du bouton selon l'état */}
        {submitting
            ? (isEn ? '⏳ ROUTING…' : '⏳ ROUTAGE EN COURS…')
            : isUsed
            ? (isEn
            ? `✓ ASKED (C${questionState.cycle})`
            : `✓ POSÉE (C${questionState.cycle})`)
            : (isEn ? 'SUBMIT TO COUNCIL →' : 'SOUMETTRE AU CONSEIL →')}
            </button>
            </>
        );
}
