// src/features/world/components/CountryPanel/components/council/CitizenQuestion.jsx

import { FONT } from '../../../../../shared/theme';

export default function CitizenQuestion({
    ministryId,
    ministryColor,
    customQ,
    setCustomQ,
    handleSubmit,
    submitting,
    lang
}) {
    const isEn = lang === 'en';

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(customQ, ministryId);
        }
    };

    return (
        <div style={{ marginTop: '0.4rem' }}>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.38rem',
            letterSpacing: '0.12em',
            color: 'rgba(140,160,200,0.75)',
            marginBottom: '0.28rem'
        }}>
        {isEn ? 'CITIZEN QUESTION' : 'QUESTION DU PEUPLE'}
        </div>

        <textarea
        value={customQ}
        onChange={e => setCustomQ(e.target.value)}
        placeholder={`${isEn ? 'Question for' : 'Question pour'} ${'ce ministère'}…`}
        rows={2}
        style={{
            width: '100%', background: 'rgba(8,14,26,0.7)',
            border: `1px solid ${ministryColor}28`, borderRadius: '2px',
            padding: '0.4rem 0.5rem', fontFamily: FONT.mono, fontSize: '0.43rem',
            color: 'rgba(180,200,230,0.80)', resize: 'none', outline: 'none',
            boxSizing: 'border-box', lineHeight: 1.5,
        }}
        onFocus={e => { e.target.style.borderColor = `${ministryColor}55`; }}
        onBlur={e => { e.target.style.borderColor = `${ministryColor}28`; }}
        onKeyDown={handleKeyDown}
        />

        <button
        onClick={() => handleSubmit(customQ, ministryId)}
        disabled={!customQ.trim() || submitting}
        style={{
            marginTop: '0.3rem', width: '100%', padding: '0.32rem',
            fontFamily: FONT.mono, fontSize: '0.44rem', letterSpacing: '0.10em',
            cursor: 'pointer',
            background: customQ.trim() ? `${ministryColor}14` : 'transparent',
            border: `1px solid ${customQ.trim() ? ministryColor + '44' : 'rgba(90,110,160,0.15)'}`,
            borderRadius: '2px',
            color: customQ.trim() ? ministryColor : 'rgba(90,110,160,0.30)',
            transition: 'all 0.15s ease',
        }}
        >
        {isEn ? 'SUBMIT TO COUNCIL →' : 'SOUMETTRE AU CONSEIL →'}
        </button>
        </div>
    );
}
