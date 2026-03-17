// src/features/council/components/constitution/PresidencySection.jsx
import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

export default function PresidencySection({ presidency, activePres, setActivePres, setPresidencyField }) {
    const { lang } = useLocale();
    const GOLD = 'rgba(200,164,74,0.88)';

    return (
        <div style={{ ...CARD_STYLE }}>
        {/* Active toggles */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.7rem' }}>
        {['phare', 'boussole'].map(key => {
            const p = presidency?.[key];
            if (!p) return null;
            const on = activePres.includes(key);
            return (
                <button
                key={key}
                style={{
                    ...BTN_SECONDARY,
                    flex: 1,
                    padding: '0.28rem 0.6rem',
                    fontSize: '0.44rem',
                    ...(on ? {
                        border: '1px solid rgba(200,164,74,0.50)',
                        color: GOLD,
                        background: 'rgba(200,164,74,0.08)'
                    } : {})
                }}
                onClick={() => setActivePres(prev =>
                    on ? prev.filter(k => k !== key) : [...prev, key]
                )}
                >
                {p.symbol} {p.name} {on ? '● ACTIF' : '○ INACTIF'}
                </button>
            );
        })}
        </div>

        {/* Détails par président */}
        {['phare', 'boussole'].map(key => {
            const p = presidency?.[key];
            if (!p) return null;
            const on = activePres.includes(key);

            return (
                <div key={key} style={{ marginBottom: '0.9rem', opacity: on ? 1 : 0.45 }}>
                <div style={{
                    fontFamily: FONT.mono,
                    fontSize: '0.44rem',
                    color: 'rgba(200,164,74,0.72)',
                    marginBottom: '0.3rem'
                }}>
                {p.symbol} {p.name.toUpperCase()} — {p.subtitle}
                </div>

                {/* Nom */}
                <div style={labelStyle('0.38rem', 'rgba(90,110,150,0.42)', '0.15rem')}>NOM</div>
                <input
                style={{ ...INPUT_STYLE, fontSize: '0.46rem', marginBottom: '0.35rem' }}
                value={p.name}
                onChange={e => setPresidencyField(key, 'name', e.target.value)}
                />

                {/* Essence */}
                <div style={labelStyle('0.38rem', 'rgba(90,110,150,0.42)', '0.15rem')}>ESSENCE</div>
                <textarea
                style={{
                    ...INPUT_STYLE,
                    width: '100%',
                    minHeight: '48px',
                    resize: 'vertical',
                    fontSize: '0.41rem',
                    fontFamily: FONT.mono,
                    lineHeight: 1.5,
                    marginBottom: '0.35rem'
                }}
                value={p.essence}
                onChange={e => setPresidencyField(key, 'essence', e.target.value)}
                />

                {/* Rôle étendu */}
                <div style={labelStyle('0.38rem', 'rgba(90,110,150,0.42)', '0.15rem')}>RÔLE ÉTENDU</div>
                <textarea
                style={{
                    ...INPUT_STYLE,
                    width: '100%',
                    minHeight: '48px',
                    resize: 'vertical',
                    fontSize: '0.41rem',
                    fontFamily: FONT.mono,
                    lineHeight: 1.5
                }}
                value={p.role_long}
                onChange={e => setPresidencyField(key, 'role_long', e.target.value)}
                />
                </div>
            );
        })}
        </div>
    );
}
