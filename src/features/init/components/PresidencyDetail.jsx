// src/features/init/components/PresidencyDetail.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  PresidencyDetail.jsx — Onglet de configuration détaillée de la présidence
//
//  Toggles Phare/Boussole via PresidencyList (tuiles colorées avec icônes),
//  puis fiches éditables en dessous (nom, essence, rôle étendu).
//
//  Dépendances : shared/theme, shared/components/PresidencyList
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE } from '../../../shared/theme';
import PresidencyList from '../../../shared/components/PresidencyList';

export default function PresidencyDetail({ presidency, activePres, setActivePres, setPlAgents }) {
    const { lang } = useLocale();
    const GOLD   = 'rgba(200,164,74,0.88)';
    const PURPLE = 'rgba(140,100,220,0.85)';
    const presAccent = (k) => k === 'phare' ? GOLD : PURPLE;

    return (
        <>
        {/* Tuiles colorées Phare / Boussole */}
        <PresidencyList
            presidency={presidency}
            activePres={activePres}
            onPresidentClick={(key) => setActivePres(prev =>
                prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
            )}
            lang={lang}
        />

        {/* Fiches éditables */}
        {['phare', 'boussole'].map(key => {
            const p = presidency?.[key];
            if (!p) return null;
            const on = activePres.includes(key);
            return (
                <div
                key={key}
                style={{
                    ...CARD_STYLE,
                    border: `1px solid ${on ? presAccent(key) + '33' : 'rgba(255,255,255,0.05)'}`,
                    opacity: on ? 1 : 0.42,
                    transition: 'opacity 0.15s',
                }}
                >
                <div style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: presAccent(key) + 'bb', marginBottom: '0.4rem' }}>
                    {p.symbol} {p.name?.toUpperCase()} — {p.subtitle}
                </div>

                {/* Nom custom */}
                <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', marginBottom: '0.15rem' }}>NOM</div>
                <input
                style={{ ...INPUT_STYLE, fontSize: '0.46rem', marginBottom: '0.35rem' }}
                readOnly={!on}
                value={p.name}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    presidency: { ...a.presidency, [key]: { ...a.presidency[key], name: e.target.value } }
                }))}
                />

                {/* Essence */}
                <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', marginBottom: '0.15rem' }}>ESSENCE</div>
                <textarea
                style={{ ...INPUT_STYLE, width: '100%', minHeight: '48px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                readOnly={!on}
                value={p.essence || ''}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    presidency: { ...a.presidency, [key]: { ...a.presidency[key], essence: e.target.value } }
                }))}
                />

                {/* Rôle étendu */}
                <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', margin: '0.28rem 0 0.15rem' }}>RÔLE ÉTENDU</div>
                <textarea
                style={{ ...INPUT_STYLE, width: '100%', minHeight: '48px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                readOnly={!on}
                value={p.role_long || ''}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    presidency: { ...a.presidency, [key]: { ...a.presidency[key], role_long: e.target.value } }
                }))}
                />
                </div>
            );
        })}
        </>
    );
}
