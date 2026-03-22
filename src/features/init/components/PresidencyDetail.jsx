// src/features/init/components/PresidencyDetail.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  PresidencyDetail.jsx — Onglet de configuration détaillée de la présidence
//
//  Affiche les deux rôles présidentiels : Phare (☉) et Boussole (☽).
//  Chaque rôle est éditable (nom, essence, rôle étendu) et peut être
//  activé/désactivé indépendamment.
//  La même itération sur ['phare','boussole'] est répétée deux fois :
//    1. Toggles actif/inactif en haut
//    2. Fiches éditables en dessous (opacité réduite si inactif)
//
//  Dépendances : shared/theme
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_SECONDARY, labelStyle } from '../../../shared/theme';

export default function PresidencyDetail({ presidency, activePres, setActivePres, setPlAgents }) {
    const { lang } = useLocale();
    const GOLD   = 'rgba(200,164,74,0.88)';
    const PURPLE = 'rgba(140,100,220,0.85)';
    const presAccent = (k) => k === 'phare' ? GOLD : PURPLE;

    return (
        <div style={{ ...CARD_STYLE }}>
        {/* Active toggles en haut */}
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
                        border: `1px solid ${presAccent(key)}55`,
                        color: presAccent(key),
                        background: `${presAccent(key)}18`
                    } : {})
                }}
                onClick={() => setActivePres(prev => on ? prev.filter(k => k !== key) : [...prev, key])}
                >
                {p.symbol} {p.name} {on ? '● ACTIF' : '○ INACTIF'}
                </button>
            );
        })}
        </div>

        {['phare', 'boussole'].map(key => {
            const p = presidency?.[key];
            if (!p) return null;
            const on = activePres.includes(key);
            return (
                <div key={key} style={{ marginBottom: '0.9rem', opacity: on ? 1 : 0.45 }}>
                <div style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: `${presAccent(key)}bb`, marginBottom: '0.3rem' }}>
                {p.symbol} {p.name.toUpperCase()} — {p.subtitle}
                </div>

                {/* Nom custom */}
                <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', marginBottom: '0.15rem' }}>NOM</div>
                <input
                style={{ ...INPUT_STYLE, fontSize: '0.46rem', marginBottom: '0.35rem' }}
                value={p.name}
                onChange={e => setPlAgents(a => ({
                    ...a,
                    presidency: {
                        ...a.presidency,
                        [key]: { ...a.presidency[key], name: e.target.value }
                    }
                }))}
                />

                {/* Essence */}
                <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', marginBottom: '0.15rem' }}>ESSENCE</div>
                <textarea
                style={{ ...INPUT_STYLE, width: '100%', minHeight: '48px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                value={p.essence}
                onChange={e => setPlAgents(a => ({
                    ...a,
                    presidency: {
                        ...a.presidency,
                        [key]: { ...a.presidency[key], essence: e.target.value }
                    }
                }))}
                />

                {/* Rôle étendu */}
                <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', margin: '0.28rem 0 0.15rem' }}>RÔLE ÉTENDU</div>
                <textarea
                style={{ ...INPUT_STYLE, width: '100%', minHeight: '48px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                value={p.role_long}
                onChange={e => setPlAgents(a => ({
                    ...a,
                    presidency: {
                        ...a.presidency,
                        [key]: { ...a.presidency[key], role_long: e.target.value }
                    }
                }))}
                />
                </div>
            );
        })}
        </div>
    );
}
