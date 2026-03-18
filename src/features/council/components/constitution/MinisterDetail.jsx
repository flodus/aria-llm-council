// src/features/council/components/constitution/MinisterDetail.jsx
import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

export default function MinisterDetail({
    minister,
    ministerId,
    isActive,
    isSelected,
    onToggleActive,
    onUpdateEssence,
    onUpdateComm,
    onUpdateAnnotation,
    onClose,
    onDelete,
    isCustom = false
}) {
    const { lang } = useLocale();

    return (
        <div style={{
            ...CARD_STYLE,
            border: isSelected ? `1px solid ${minister.color}55` : '1px solid rgba(255,255,255,0.07)',
            transition: 'border 0.15s, box-shadow 0.15s',
            boxShadow: isSelected ? `0 0 12px ${minister.color}14` : 'none',
            marginTop: '1rem'
        }}>
        {/* En-tête avec emoji, nom et bouton d'activation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
        <span style={{ fontSize: '0.9rem' }}>{minister.emoji}</span>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.45rem',
            letterSpacing: '0.09em',
            color: isActive ? minister.color + 'CC' : 'rgba(140,160,200,0.35)',
            flex: 1
        }}>
        {minister.name.toUpperCase()} ({minister.sign})
        </div>
        <button
        style={{
            ...BTN_SECONDARY,
            fontSize: '0.38rem',
            padding: '0.14rem 0.42rem',
            ...(isActive ? {
                border: '1px solid ' + minister.color + '55',
                color: minister.color,
                background: minister.color + '0E'
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
        {isCustom && (
            <button
            style={{
                ...BTN_SECONDARY,
                padding: '0.1rem 0.3rem',
                fontSize: '0.7rem',
                color: 'rgba(200,80,80,0.8)',
                      borderColor: 'rgba(200,80,80,0.3)'
            }}
            onClick={onDelete}
            title={lang === 'en' ? 'Delete minister' : 'Supprimer le ministre'}
            >
            🗑️
            </button>
        )}
        </div>

        {/* Style de communication */}
        <div style={labelStyle('0.37rem', 'rgba(90,110,150,0.38)', '0.14rem')}>
        {lang === 'en' ? 'COMMUNICATION STYLE' : 'STYLE DE COMMUNICATION'}
        </div>
        <textarea
        style={{
            ...INPUT_STYLE,
            width: '100%',
            minHeight: '30px',
            resize: 'vertical',
            fontSize: '0.40rem',
            fontFamily: FONT.mono,
            lineHeight: 1.5,
            marginBottom: '0.30rem',
            ...(!isActive ? { opacity: 0.35, cursor: 'not-allowed' } : {})
        }}
        readOnly={!isActive}
        value={minister.comm || ''}
        onChange={e => onUpdateComm(e.target.value)}
        />

        {/* Essence */}
        <div style={labelStyle('0.37rem', 'rgba(90,110,150,0.38)', '0.14rem')}>ESSENCE</div>
        <textarea
        style={{
            ...INPUT_STYLE,
            width: '100%',
            minHeight: '50px',
            resize: 'vertical',
            fontSize: '0.40rem',
            fontFamily: FONT.mono,
            lineHeight: 1.5,
            marginBottom: '0.30rem',
            ...(!isActive ? { opacity: 0.35, cursor: 'not-allowed' } : {})
        }}
        readOnly={!isActive}
        value={minister.essence || ''}
        onChange={e => onUpdateEssence(e.target.value)}
        />

        {/* Angle d'annotation */}
        <div style={labelStyle('0.37rem', 'rgba(90,110,150,0.38)', '0.14rem')}>
        {lang === 'en' ? 'ANNOTATION ANGLE' : 'ANGLE D\'ANNOTATION'}
        </div>
        <textarea
        style={{
            ...INPUT_STYLE,
            width: '100%',
            minHeight: '30px',
            resize: 'vertical',
            fontSize: '0.40rem',
            fontFamily: FONT.mono,
            lineHeight: 1.5,
            ...(!isActive ? { opacity: 0.35, cursor: 'not-allowed' } : {})
        }}
        readOnly={!isActive}
        value={minister.annotation || ''}
        onChange={e => onUpdateAnnotation(e.target.value)}
        />
        </div>
    );
}
