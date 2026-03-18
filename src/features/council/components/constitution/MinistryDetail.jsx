/**
 * Carte détaillée d'un ministère
 * @param {Object} ministry - Données du ministère (id, name, emoji, color, mission, ministers, ministerPrompts)
 * @param {boolean} isActive - Le ministère est-il actif ?
 * @param {boolean} isSelected - Le ministère est-il sélectionné (focus) ?
 * @param {function} onToggleActive - Callback pour activer/désactiver
 * @param {function} onUpdateMission - Callback pour modifier la mission
 * @param {Object} ministers - Liste de tous les ministres {id: data}
 * @param {function} onAssignMinister - Callback pour assigner/retirer un ministre
 * @param {function} onUpdatePrompt - Callback pour modifier un prompt spécifique
 */


import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

export default function MinistryDetail({
    ministry,
    isActive,
    isSelected,
    onToggleActive,
    onUpdateMission,
    ministers,
    onAssignMinister,
    onUpdatePrompt,
    onClose,
    onDelete,
    isBase = false
}) {
    const { lang } = useLocale();

    return (
        <div style={{
            ...CARD_STYLE,
            // Bordure et ombre différentes si le ministère est sélectionné
            border: isSelected ? `1px solid ${ministry.color}55` : '1px solid rgba(255,255,255,0.07)',
            transition: 'border 0.15s, box-shadow 0.15s',
            boxShadow: isSelected ? `0 0 12px ${ministry.color}14` : 'none'
        }}>
        {/* En-tête avec emoji, nom et bouton d'activation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
        <span style={{ fontSize: '0.9rem' }}>{ministry.emoji}</span>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.45rem',
            letterSpacing: '0.09em',
            color: isActive ? ministry.color + 'CC' : 'rgba(140,160,200,0.35)',
            flex: 1
        }}>
        {ministry.name.toUpperCase()}
        </div>
        {/* Bouton actif/inactif - style différent selon l'état */}
        <button
        style={{
            ...BTN_SECONDARY,
            fontSize: '0.38rem',
            padding: '0.14rem 0.42rem',
            ...(isActive ? {
                border: '1px solid ' + ministry.color + '55',
                color: ministry.color,
                background: ministry.color + '0E'
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
        {!isBase && (
            <button
            style={{
                ...BTN_SECONDARY,
                padding: '0.1rem 0.3rem',
                fontSize: '0.7rem',
                color: 'rgba(200,80,80,0.8)',
                     borderColor: 'rgba(200,80,80,0.3)'
            }}
            onClick={onDelete}
            title={lang === 'en' ? 'Delete ministry' : 'Supprimer le ministère'}
            >
            🗑️
            </button>
        )}
        </div>

        {/* Mission du ministère - éditable seulement si actif */}
        <div style={labelStyle('0.37rem', 'rgba(90,110,150,0.38)', '0.14rem')}>MISSION</div>
        <textarea
        style={{
            ...INPUT_STYLE,
            width: '100%',
            minHeight: '34px',
            resize: 'vertical',
            fontSize: '0.40rem',
            fontFamily: FONT.mono,
            lineHeight: 1.5,
            marginBottom: '0.40rem',
            ...(!isActive ? { opacity: 0.35, cursor: 'not-allowed' } : {})
        }}
        readOnly={!isActive}
        value={ministry.mission}
        onChange={e => onUpdateMission(e.target.value)}
        />

        {/* Liste des ministres avec boutons d'assignation */}
        <div style={labelStyle('0.37rem', 'rgba(90,110,150,0.38)', '0.20rem')}>MINISTRES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.24rem', marginBottom: '0.40rem' }}>
        {Object.entries(ministers).map(([key, min]) => {
            const isIn = ministry.ministers.includes(key);
            return (
                <button
                key={key}
                disabled={!isActive}
                style={{
                    ...BTN_SECONDARY,
                    padding: '0.17rem 0.44rem',
                    fontSize: '0.39rem',
                    ...(!isActive ? { opacity: 0.25, cursor: 'not-allowed' } : {}),
                    // Style différent si le ministre est assigné
                    ...(isIn && isActive ? {
                        border: '1px solid ' + min.color + '88',
                        color: min.color,
                        background: min.color + '16'
                    } : {})
                }}
                onClick={() => onAssignMinister(key, isIn)}
                >
                {min.emoji} {min.name}
                </button>
            );
        })}
        </div>

        {/* Prompts spécifiques par ministre - affichés seulement si des ministres sont assignés */}
        {ministry.ministers.length > 0 && (
            <>
            <div style={labelStyle('0.37rem', 'rgba(90,110,150,0.38)', '0.20rem')}>PROMPTS MINISTÉRIELS</div>
            {ministry.ministers.map(mkey => {
                const min = ministers[mkey];
                return (
                    <div key={mkey} style={{ marginBottom: '0.30rem' }}>
                    <div style={{
                        fontFamily: FONT.mono,
                        fontSize: '0.37rem',
                        color: min.color + 'AA',
                        marginBottom: '0.10rem'
                    }}>
                    {min.emoji} {min.name}
                    </div>
                    <textarea
                    style={{
                        ...INPUT_STYLE,
                        width: '100%',
                        minHeight: '30px',
                        resize: 'vertical',
                        fontSize: '0.39rem',
                        fontFamily: FONT.mono,
                        lineHeight: 1.48,
                        ...(!isActive ? { opacity: 0.25, cursor: 'not-allowed' } : {})
                    }}
                    readOnly={!isActive}
                    value={ministry.ministerPrompts?.[mkey] || ''}
                    onChange={e => onUpdatePrompt(mkey, e.target.value)}
                    />
                    </div>
                );
            })}
            </>
        )}
        </div>
    );
}
