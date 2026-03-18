// src/features/world/components/CountryPanel/components/CountryNavArrows.jsx
export default function CountryNavArrows({ countryIndex, countryTotal, onPrevCountry, onNextCountry }) {
    if (!countryTotal || countryTotal < 2) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button onClick={onPrevCountry} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0.2rem',
            color: 'rgba(140,160,200,0.75)', fontSize: '0.85rem', lineHeight: 1,
            transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.target.style.color = 'rgba(200,164,74,1.0)'}
        onMouseLeave={e => e.target.style.color = 'rgba(140,160,200,0.75)'}>
        <span className="mdi mdi-chevron-left" />
        </button>
        <span style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: '0.36rem',
            color: 'rgba(140,160,200,0.60)', letterSpacing: '0.08em', userSelect: 'none'
        }}>
        {countryIndex + 1}/{countryTotal}
        </span>
        <button onClick={onNextCountry} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0.2rem',
            color: 'rgba(140,160,200,0.75)', fontSize: '0.85rem', lineHeight: 1,
            transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.target.style.color = 'rgba(200,164,74,1.0)'}
        onMouseLeave={e => e.target.style.color = 'rgba(140,160,200,0.75)'}>
        <span className="mdi mdi-chevron-right" />
        </button>
        </div>
    );
}
