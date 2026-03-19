// src/features/council/components/constitution/PresidentDetail.jsx

import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

export default function PresidentDetail({
    president,
    presidentId,
    isActive,
    isSelected,
    onToggleActive,
    onUpdateField,
    onClose
}) {
    const { lang } = useLocale();

    return (
        <div style={{
                ...CARD_STYLE,
                border: isSelected ? `1px solid ${president.color || 'rgba(200,164,74,0.5)'}55` : '1px solid rgba(255,255,255,0.07)',
                transition: 'border 0.15s, box-shadow 0.15s',
                boxShadow: isSelected ? `0 0 12px ${president.color || 'rgba(200,164,74,0.5)'}14` : 'none',
                marginTop: '1rem'
            }}>
            {/* En-tête avec nom et bouton d'activation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.9rem' }}>{president.symbol}</span>
            <div style={{
                fontFamily: FONT.mono,
                fontSize: '0.45rem',
                letterSpacing: '0.09em',
                color: isActive ? 'rgba(200,164,74,0.85)' : 'rgba(140,160,200,0.35)',
                flex: 1
            }}>
            {president.name.toUpperCase()} — {president.subtitle}
            </div>
            <button
            style={{
                ...BTN_SECONDARY,
                fontSize: '0.38rem',
                padding: '0.14rem 0.42rem',
                ...(isActive ? {
                    border: '1px solid rgba(200,164,74,0.50)',
                    color: 'rgba(200,164,74,0.90)',
                    background: 'rgba(200,164,74,0.08)'
                } : {
                    border: '1px solid rgba(200,80,80,0.25)',
                    color: 'rgba(200,80,80,0.55)'
                })
            }}
            onClick={onToggleActive}
            >
            {isActive ? '● actif' : '○ inactif'}
            </button>
            <button
            style={{
                ...BTN_SECONDARY,
                padding: '0.1rem 0.3rem',
                fontSize: '0.7rem'

            }}
            onClick={onClose}>✕
            </button>
            </div>

            {/* Nom */}
            <div style={labelStyle('0.38rem', 'rgba(90,110,150,0.42)', '0.15rem')}>NOM</div>
            <input
            style={{ ...INPUT_STYLE, fontSize: '0.46rem', marginBottom: '0.35rem' }}
            value={president.name}
            onChange={e => onUpdateField('name', e.target.value)}
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
            value={president.essence}
            onChange={e => onUpdateField('essence', e.target.value)}
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
            value={president.role_long}
            onChange={e => onUpdateField('role_long', e.target.value)}
            />
        </div>
    );
}
