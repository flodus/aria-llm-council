import { FONT, BTN_SECONDARY } from '../../../shared/theme';

export default function CountryBadges({ countries, perGov, currentCountry, onSelectCountry }) {
    return (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {countries.map((c, i) => {
            const isCustom = !!perGov[i];
            const nom = c.nom || c.realData?.nom || `Nation ${i+1}`;
            const flag = c.realData?.flag || c.realData?.emoji || '🌐';

            return (
                <button
                key={i}
                style={{
                    ...BTN_SECONDARY,
                    padding: '0.26rem 0.60rem',
                    fontSize: '0.48rem',
                    position: 'relative',
                    ...(currentCountry === i ? {
                        border: '1px solid rgba(200,164,74,0.55)',
                        color: 'rgba(200,164,74,0.95)',
                        background: 'rgba(200,164,74,0.10)'
                    } : {
                        color: 'rgba(180,190,210,0.70)'
                    })
                }}
                onClick={() => onSelectCountry(i)}
                >
                <span style={{ fontSize: '0.65rem', marginRight: '0.25rem' }}>{flag}</span>
                {nom}
                {isCustom && (
                    <span style={{
                        marginLeft: '0.3rem',
                        fontSize: '0.32rem',
                        fontFamily: FONT.mono,
                        color: 'rgba(100,180,255,0.80)',
                              letterSpacing: '0.05em'
                    }}>✦</span>
                )}
                </button>
            );
        })}
        </div>
    );
}
