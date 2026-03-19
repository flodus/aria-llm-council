// src/features/world/components/CountryPanel/council/CouncilMinistryItem.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Composant : Item d'un ministère dans la liste
//  Gère l'ouverture/fermeture et affiche les questions
// ═══════════════════════════════════════════════════════════════════════════

import { FONT } from '../../../../../shared/theme';
import MinistryQuestions from './CouncilMinistryQuestions';
import CitizenQuestion from './CouncilCitizenQuestion';

export default function MinistryItem({
    ministry,
    isOpen,
    onToggle,
    customQ,
    setCustomQ,
    submitting,
    handleSubmit,
    lang,
    countryId,
    cycleActuel,
    currentCycleQuestion,
    setMinistryCycleQuestion,
    lastVoteTimestamp
}) {

    const isEn = lang === 'en';
    const { id, emoji, name, color, questions = [] } = ministry;

    return (
        <div style={{
            marginBottom: '0.45rem',
            border: `1px solid ${isOpen ? color + '44' : 'rgba(90,110,160,0.12)'}`,
            borderRadius: '2px',
            background: isOpen ? `${color}06` : 'rgba(14,20,36,0.5)',
            transition: 'all 0.18s ease',
            overflow: 'hidden',
        }}>
        <button
        onClick={onToggle}
        style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.45rem 0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'left',
        }}
        >
        <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{emoji}</span>
        <span style={{
            fontFamily: FONT.mono,
            fontSize: '0.46rem',
            flex: 1,
            color: isOpen ? color : 'rgba(180,200,230,0.70)',
            letterSpacing: '0.06em',
            transition: 'color 0.18s ease',
        }}>{name}</span>
        <span style={{
            fontFamily: FONT.mono,
            fontSize: '0.55rem',
            color: isOpen ? color : 'rgba(90,110,160,0.35)',
            transform: isOpen ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s ease',
        }}>›</span>
        </button>

        {isOpen && (
            <div style={{ padding: '0 0.6rem 0.6rem' }}>
            <MinistryQuestions
            ministryId={id}
            ministryColor={color}
            handleSubmit={handleSubmit}
            submitting={submitting}
            lang={lang}
            countryId={countryId}
            cycleActuel={cycleActuel}
            currentCycleQuestion={currentCycleQuestion}
            lastVoteTimestamp={lastVoteTimestamp}
            />

            <CitizenQuestion
            ministryId={id}
            ministryColor={color}
            customQ={customQ}
            setCustomQ={setCustomQ}
            handleSubmit={handleSubmit}
            submitting={submitting}
            lang={lang}
            countryId={countryId}
            cycleActuel={cycleActuel}
            currentCycleQuestion={currentCycleQuestion}
            setMinistryCycleQuestion={setMinistryCycleQuestion}
            />
            </div>
        )}
        </div>
    );
}
