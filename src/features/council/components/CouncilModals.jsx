// src/features/council/components/CouncilModals.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  CouncilModals — Modales de validation de question avant délibération
//
//  GarbageModal  : question incompréhensible (score keywords = 0)
//  MismatchModal : question soumise à un mauvais ministère
// ═══════════════════════════════════════════════════════════════════════════

import { FONT, BTN_PRIMARY, BTN_SECONDARY } from '../../../shared/theme';
import { useLocale } from '../../../ariaI18n';

const overlayStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(4,8,18,0.82)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9000,
};

const boxStyle = {
    background: 'rgba(8,14,28,0.97)',
    border: '1px solid rgba(200,164,74,0.22)',
    borderRadius: '6px',
    padding: '1.8rem 2rem',
    maxWidth: 480,
    width: '90vw',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
    fontFamily: FONT.mono,
};

const titleStyle = {
    fontSize: '0.56rem',
    letterSpacing: '0.12em',
    color: 'rgba(200,164,74,0.80)',
};

const bodyStyle = {
    fontSize: '0.52rem',
    color: 'rgba(190,210,240,0.85)',
    lineHeight: 1.7,
};

const rowStyle = {
    display: 'flex',
    gap: '0.7rem',
    justifyContent: 'flex-end',
};

// ── GarbageModal ─────────────────────────────────────────────────────────────
export function GarbageModal({ msg, onClose }) {
    const { lang } = useLocale();
    if (!msg) return null;

    return (
        <div style={overlayStyle} onClick={onClose}>
        <div style={boxStyle} onClick={e => e.stopPropagation()}>
            <div style={titleStyle}>
                ⚠️ {lang === 'en' ? 'UNRECOGNIZED REQUEST' : 'REQUÊTE NON RECONNUE'}
            </div>
            <div style={bodyStyle}>{msg}</div>
            <div style={rowStyle}>
                <button style={{ ...BTN_PRIMARY, fontSize: '0.48rem' }} onClick={onClose}>
                    {lang === 'en' ? 'REFORMULATE' : 'REFORMULER'}
                </button>
            </div>
        </div>
        </div>
    );
}

// ── MismatchModal ────────────────────────────────────────────────────────────
export function MismatchModal({ data, onResolve }) {
    const { lang } = useLocale();
    if (!data) return null;

    const { forceName, forceEmoji, suggestedName, suggestedEmoji } = data;

    return (
        <div style={overlayStyle}>
        <div style={boxStyle}>
            <div style={titleStyle}>
                ⚖️ {lang === 'en' ? 'SUGGESTED MINISTRY' : 'MINISTÈRE SUGGÉRÉ'} : {suggestedEmoji} {suggestedName.toUpperCase()}
            </div>
            <div style={bodyStyle}>
                {lang === 'en'
                    ? `You submitted this question to ${forceEmoji} ${forceName}, but it seems more relevant to ${suggestedEmoji} ${suggestedName}.`
                    : `Tu as soumis cette question à ${forceEmoji} ${forceName}, mais elle semble mieux correspondre à ${suggestedEmoji} ${suggestedName}.`
                }
            </div>
            <div style={rowStyle}>
                <button
                    style={{ ...BTN_SECONDARY, fontSize: '0.48rem' }}
                    onClick={() => onResolve('force')}
                >
                    {lang === 'en' ? `STAY WITH ${forceName.toUpperCase()}` : `RESTER SUR ${forceName.toUpperCase()}`}
                </button>
                <button
                    style={{ ...BTN_PRIMARY, fontSize: '0.48rem' }}
                    onClick={() => onResolve('suggest')}
                >
                    {lang === 'en' ? `SWITCH TO ${suggestedName.toUpperCase()}` : `BASCULER VERS ${suggestedName.toUpperCase()}`}
                </button>
            </div>
        </div>
        </div>
    );
}
