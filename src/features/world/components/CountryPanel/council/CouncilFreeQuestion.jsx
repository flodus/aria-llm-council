// src/features/world/components/CountryPanel/components/council/FreeQuestion.jsx

import { FONT } from '../../../../../shared/theme';

export default function FreeQuestion({
    freeQ,
    setFreeQ,
    submitting,
    handleSubmit,
    lang
}) {
    const isEn = lang === 'en';

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(freeQ, null);
        }
    };

    return (
        <>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.40rem',
            letterSpacing: '0.16em',
            color: 'rgba(140,160,200,0.75)',
            marginBottom: '0.4rem'
        }}>
        {isEn ? 'FREE QUESTION' : 'QUESTION LIBRE'}
        </div>

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

    <textarea
    value={freeQ}
    onChange={e => setFreeQ(e.target.value)}
    placeholder={isEn ? 'Ask any question…' : "Posez n'importe quelle question…"}
    rows={3}
    style={{
        width: '100%', background: 'rgba(8,14,26,0.7)',
            border: '1px solid rgba(90,110,160,0.16)', borderRadius: '2px',
            padding: '0.4rem 0.5rem', fontFamily: FONT.mono, fontSize: '0.43rem',
            color: 'rgba(180,200,230,0.80)', resize: 'none', outline: 'none',
            boxSizing: 'border-box', lineHeight: 1.5,
    }}
    onFocus={e => { e.target.style.borderColor = 'rgba(200,164,74,0.30)'; }}
    onBlur={e => { e.target.style.borderColor = 'rgba(90,110,160,0.16)'; }}
    onKeyDown={handleKeyDown}
    />

    <button
    onClick={() => handleSubmit(freeQ, null)}
    disabled={!freeQ.trim() || submitting}
    style={{
        marginTop: '0.3rem', width: '100%', padding: '0.35rem',
        fontFamily: FONT.mono, fontSize: '0.44rem', letterSpacing: '0.10em',
        cursor: freeQ.trim() && !submitting ? 'pointer' : 'default',
            background: freeQ.trim() ? 'rgba(200,164,74,0.10)' : 'transparent',
            border: `1px solid ${freeQ.trim() ? 'rgba(200,164,74,0.40)' : 'rgba(90,110,160,0.15)'}`,
            borderRadius: '2px',
            color: freeQ.trim() ? 'rgba(200,164,74,0.85)' : 'rgba(90,110,160,0.30)',
            transition: 'all 0.15s ease',
    }}
    >
    {submitting
        ? (isEn ? '⏳ ROUTING…' : '⏳ ROUTAGE EN COURS…')
        : (isEn ? 'SUBMIT TO COUNCIL →' : 'SOUMETTRE AU CONSEIL →')}
        </button>
        </>
    );
}
