// src/features/council/components/constitution/MinistriesList.jsx

import { useLocale } from '../../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_SECONDARY, labelStyle } from '../../../../shared/theme';

/**
 * Grille des ministères avec tri : actifs en haut, inactifs en bas
 * @param {Array} ministries - Liste des ministères
 * @param {Array|null} activeMins - Liste des ids des ministères actifs (null = tous actifs)
 * @param {function} onMinistryClick - Callback appelé au clic sur un ministère (reçoit l'id)
 */
export default function MinistriesList({ ministries, activeMins, onMinistryClick, onSetAllActive }) {
    const { lang } = useLocale();

    // Sécuriser activeMins (peut être undefined)
    const safeActiveMins = activeMins === undefined ? null : activeMins;


    // Trier : actifs d'abord
    const sortedMinistries = [...ministries].sort((a, b) => {
        const aActive = safeActiveMins === null || safeActiveMins.includes(a.id);
        const bActive = safeActiveMins === null || safeActiveMins.includes(b.id);
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return 0;
    });

    return (
        <div style={{ ...CARD_STYLE }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={labelStyle('0.42rem')}>
        {ministries.length} {lang === 'en' ? 'MINISTRIES' : 'MINISTÈRES'}
        </div>
        <button
        style={{ ...BTN_SECONDARY, fontSize: '0.38rem', padding: '0.14rem 0.38rem' }}
        onClick={onSetAllActive}
        >
        {lang === 'en' ? 'All active' : 'Tous actifs'}
        </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
        {sortedMinistries.map(ministry => {
            const isActive = safeActiveMins === null || safeActiveMins.includes(ministry.id);
            return (
                <button
                key={ministry.id}
                style={{
                    ...BTN_SECONDARY,
                    padding: '0.22rem 0.55rem',
                    fontSize: '0.42rem',
                    ...(isActive ? {
                        border: '1px solid ' + ministry.color + '77',
                        color: ministry.color,
                        background: ministry.color + '14'
                    } : { opacity: 0.40 })
                }}
                onClick={() => onMinistryClick(ministry.id)}
                >
                {ministry.emoji} {ministry.name} {isActive ? '' : '○'}
                </button>
            );
        })}
        </div>
        </div>
    );
}
