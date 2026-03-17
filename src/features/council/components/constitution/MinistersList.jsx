// src/features/council/components/constitution/MinistersList.jsx
import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

export default function MinistersList({ ministers, activeMinsters, onToggleMinister }) {
    const { lang } = useLocale();

    return (
        <div style={{ ...CARD_STYLE }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={labelStyle('0.42rem')}>
        {Object.keys(ministers).length} {lang === 'en' ? 'MINISTERS' : 'MINISTRES'}
        </div>
        <button
        style={{ ...BTN_SECONDARY, fontSize: '0.38rem', padding: '0.14rem 0.38rem' }}
        onClick={() => onToggleMinister(null, true)} // true = tous actifs
        >
        {lang === 'en' ? 'All active' : 'Tous actifs'}
        </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
        {Object.entries(ministers).map(([key, min]) => {
            const on = activeMinsters === null || activeMinsters.includes(key);
            return (
                <button
                key={key}
                style={{
                    ...BTN_SECONDARY,
                    padding: '0.22rem 0.55rem',
                    fontSize: '0.42rem',
                    ...(on ? {
                        border: '1px solid ' + min.color + '77',
                        color: min.color,
                        background: min.color + '14'
                    } : { opacity: 0.40 })
                }}
                onClick={() => onToggleMinister(key)}
                >
                {min.emoji} {min.name} {on ? '' : '○'}
                </button>
            );
        })}
        </div>
        </div>
    );
}
