// src/features/init/components/screens/NameScreen.jsx

import { useState } from 'react';
import { FONT, CARD_STYLE, labelStyle } from '../../../../shared/theme';
import ARIAHeader from '../ARIAHeader';
import APIKeyInline from '../APIKeyInline';

export default function NameScreen({
    lang,
    setLang,
    hasApiKeys,
    showKeys,
    setShowKeys,
    onRefreshKeys,
    onSelectWorld,
}) {
    const [iaBoardGame, setIaBoardGame] = useState(() => {
        try { return JSON.parse(localStorage.getItem('aria_options') || '{}').ia_mode === 'none'; } catch { return false; }
    });

    const handleCloseKeys = () => {
        setShowKeys(false);
        onRefreshKeys?.();
        try { setIaBoardGame(JSON.parse(localStorage.getItem('aria_options') || '{}').ia_mode === 'none'); } catch {}
    };

    const cardBase = {
        background: 'rgba(4,8,18,0.55)',
        border: '1px solid rgba(140,160,200,0.15)',
        borderRadius: '4px', padding: '1.4rem 1rem', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
        textAlign: 'center',
    };

    const badgeColor = iaBoardGame
        ? 'rgba(80,200,200,0.80)'
        : hasApiKeys ? 'rgba(100,200,120,0.80)' : 'rgba(200,100,74,0.70)';
    const badgeText = iaBoardGame
        ? '🎲 BOARD GAME'
        : hasApiKeys
        ? (lang === 'en' ? '🔑 API KEYS ✓' : '🔑 CLÉS API ✓')
        : (lang === 'en' ? '⚠ NO KEY — Board Game Mode' : '⚠ AUCUNE CLÉ — Mode Board Game');

    return (
        <div style={{
            position: 'fixed', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2rem 1.5rem 14vh', boxSizing: 'border-box',
        }}>
            <ARIAHeader showQuote={false} lang={lang} setLang={setLang} />

            {showKeys && <APIKeyInline onClose={handleCloseKeys} />}

            <div style={{ width: 'min(520px, 90vw)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={labelStyle()}>
                    {lang === 'en' ? 'CHOOSE A WORLD' : 'CHOISIR UN MONDE'}
                </div>

                {/* 2 cartes monde */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <button style={{ ...cardBase, border: '1px solid rgba(100,140,220,0.30)' }}
                        onClick={() => onSelectWorld('reel')}>
                        <div style={{ fontSize: '1.8rem' }}>🌍</div>
                        <div style={{ fontFamily: FONT.cinzel, fontSize: '0.54rem', letterSpacing: '0.12em', color: 'rgba(200,164,74,0.88)' }}>
                            {lang === 'en' ? 'Real Earth' : 'Terre réelle'}
                        </div>
                        <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.50)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                            {lang === 'en' ? 'Real countries · GeoJSON\nGeopolitics 2025' : 'Pays réels · GeoJSON\nGéopolitique 2025'}
                        </div>
                    </button>

                    <button style={{ ...cardBase, border: '1px solid rgba(58,191,122,0.28)' }}
                        onClick={() => onSelectWorld('custom')}>
                        <div style={{ fontSize: '1.8rem' }}>✦</div>
                        <div style={{ fontFamily: FONT.cinzel, fontSize: '0.54rem', letterSpacing: '0.12em', color: 'rgba(58,191,122,0.80)' }}>
                            {lang === 'en' ? 'New World' : 'Nouveau monde'}
                        </div>
                        <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.50)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                            {lang === 'en' ? 'Procedural planet\nRandom seed' : 'Planète procédurale\nSeed aléatoire'}
                        </div>
                    </button>
                </div>

                {/* Cartouche API */}
                <div style={{
                    ...CARD_STYLE,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem',
                }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: badgeColor, letterSpacing: '0.06em' }}>
                        {badgeText}
                    </span>
                    <button
                        style={{
                            background: 'rgba(200,164,74,0.06)', border: '1px solid rgba(200,164,74,0.25)',
                            borderRadius: '2px', padding: '0.25rem 0.65rem', cursor: 'pointer',
                            fontFamily: FONT.mono, fontSize: '0.42rem', letterSpacing: '0.10em',
                            color: 'rgba(200,164,74,0.65)',
                        }}
                        onClick={() => setShowKeys(true)}>
                        {hasApiKeys
                            ? (lang === 'en' ? 'MODIFY' : 'MODIFIER')
                            : (lang === 'en' ? 'CONFIGURE' : 'CONFIGURER')}
                    </button>
                </div>
            </div>
        </div>
    );
}
