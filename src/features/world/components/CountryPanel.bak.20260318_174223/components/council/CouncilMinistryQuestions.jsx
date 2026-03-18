// src/features/world/components/CountryPanel/components/council/MinistryQuestions.jsx

import { FONT } from '../../../../../shared/theme';

export default function MinistryQuestions({
    questions,
    ministryId,
    ministryColor,
    handleSubmit,
    submitting,
    lang
}) {
    const isEn = lang === 'en';

    return (
        <>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.38rem',
            letterSpacing: '0.12em',
            color: 'rgba(140,160,200,0.75)',
            marginBottom: '0.35rem'
        }}>
        {isEn ? 'FREQUENT QUESTIONS' : 'QUESTIONS FRÉQUENTES'}
        </div>

        {questions.map((q, i) => (
            <button
            key={i}
            onClick={() => handleSubmit(q, ministryId)}
            disabled={submitting}
            style={{
                width: '100%', background: 'none', border: `1px solid ${ministryColor}22`,
                borderRadius: '2px', cursor: 'pointer',
                padding: '0.38rem 0.5rem', marginBottom: '0.28rem',
                fontFamily: FONT.mono, fontSize: '0.43rem',
                color: 'rgba(160,180,220,0.65)', textAlign: 'left', lineHeight: 1.45,
                                  transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = `${ministryColor}10`;
                e.currentTarget.style.color = 'rgba(200,215,240,0.88)';
                e.currentTarget.style.borderColor = `${ministryColor}44`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'rgba(160,180,220,0.65)';
                e.currentTarget.style.borderColor = `${ministryColor}22`;
            }}
            >
            {q}
            </button>
        ))}
        </>
    );
}
