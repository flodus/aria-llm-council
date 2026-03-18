// src/features/council/components/constitution/MinistersList.jsx
import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

/**
 * Grille des ministres avec tri : actifs en haut, inactifs en bas
 * @param {Object} ministers - Dictionnaire des ministres { id: data }
 * @param {Array|null} activeMinsters - Liste des ids des ministres actifs (null = tous actifs)
 * @param {function} onMinisterClick - Callback appelé au clic sur un ministre (reçoit l'id)
 */
export default function MinistersList({ ministers, activeMinsters, onMinisterClick, onSetAllActive }) {
    const { lang } = useLocale();


    // Transformer en tableau d'entrées [id, data] et trier
    const sortedEntries = Object.entries(ministers).sort(([idA], [idB]) => {
        const aActive = activeMinsters === null || activeMinsters.includes(idA);
        const bActive = activeMinsters === null || activeMinsters.includes(idB);
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return 0;

    });

    return (
        <div style={{ ...CARD_STYLE }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={labelStyle('0.42rem')}>
        {Object.keys(ministers).length} {lang === 'en' ? 'MINISTERS' : 'MINISTRES'}
        </div>
        <button
            style={{ ...BTN_SECONDARY, fontSize: '0.38rem', padding: '0.14rem 0.38rem' }}
            onClick={onSetAllActive}
            >
            {lang === 'en' ? 'All active' : 'Tous actifs'}
        </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
        {sortedEntries.map(([id, minister]) => {
            const isActive = activeMinsters === null || activeMinsters.includes(id);
            return (
                <button
                key={id}
                style={{
                    ...BTN_SECONDARY,
                    padding: '0.22rem 0.55rem',
                    fontSize: '0.42rem',
                    ...(isActive ? {
                        border: '1px solid ' + minister.color + '77',
                        color: minister.color,
                        background: minister.color + '14'
                    } : { opacity: 0.40 })
                }}
                onClick={() => onMinisterClick(id)}
                >
                {minister.emoji} {minister.name} {isActive ? '' : '○'}
                </button>
            );
        })}
        </div>
        </div>
    );
}
