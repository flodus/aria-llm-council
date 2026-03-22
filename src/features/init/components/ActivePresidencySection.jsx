// src/features/init/components/ActivePresidencySection.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  ActivePresidencySection.jsx — Toggle Phare (☉) / Boussole (☽) actif
//
//  Chaque rôle présidentiel peut être activé/désactivé indépendamment.
//  Avertissement affiché si aucun président n'est actif.
//
//  Dépendances : ariaI18n, shared/theme
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_SECONDARY, labelStyle } from '../../../shared/theme';

export default function ActivePresidencySection({ presidency, activePres, onTogglePresidency }) {
    const { lang } = useLocale();
    const GOLD        = 'rgba(200,164,74,0.88)';
    const PURPLE      = 'rgba(140,100,220,0.85)';
    const presAccent  = (k) => k === 'phare' ? GOLD : PURPLE;
    const presAccentBg= (k) => k === 'phare' ? 'rgba(200,164,74,0.10)' : 'rgba(140,100,220,0.12)';
    const presAccentBd= (k) => k === 'phare' ? 'rgba(200,164,74,0.45)' : 'rgba(140,100,220,0.45)';

    return (
        <div style={{ ...CARD_STYLE }}>
        <div style={{ ...labelStyle('0.42rem'), marginBottom: '0.5rem' }}>
        {lang === 'en' ? 'ACTIVE PRESIDENCY' : 'PRÉSIDENCE ACTIVE'}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {['phare', 'boussole'].map(key => {
            const p = presidency?.[key];
            if (!p) return null;
            const on = activePres.includes(key);

            return (
                <button
                key={key}
                style={{
                    flex: 1,
                    padding: '0.5rem 0.6rem',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    background: on ? presAccentBg(key) : 'rgba(20,28,45,0.55)',
                    border: `1px solid ${on ? presAccentBd(key) : 'rgba(140,160,200,0.10)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem',
                    textAlign: 'left'
                }}
                onClick={() => onTogglePresidency(key)}
                >
                <div style={{
                    fontFamily: FONT.mono,
                    fontSize: '0.44rem',
                    color: on ? presAccent(key) : 'rgba(140,160,200,0.35)'
                }}>
                {p.symbol} {p.name} {on ? '✓' : '○'}
                </div>
                <div style={{
                    fontSize: '0.40rem',
                    color: on ? 'rgba(140,160,200,0.55)' : 'rgba(100,120,160,0.30)',
                    lineHeight: 1.4
                }}>
                {p.subtitle}
                </div>
                </button>
            );
        })}
        </div>

        {activePres.length === 0 && (
            <div style={{
                fontFamily: FONT.mono,
                fontSize: '0.40rem',
                color: 'rgba(200,100,60,0.55)',
                                     padding: '0.3rem'
            }}>
            ⚠ {lang === 'en'
                ? 'No active president — Council deliberates without presidential arbitration'
        : 'Aucun président actif — le Conseil délibère sans arbitrage présidentiel'}
        </div>
        )}
        </div>
    );
}
