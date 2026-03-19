// src/features/init/components/ActiveMinistriesSection.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  ActiveMinistriesSection.jsx — Chips togglables des ministères actifs
//
//  Affiche chaque ministère avec sa couleur propre ; bouton "Tous" pour
//  réactiver l'ensemble. activeMins === null signifie tous actifs.
//  Avertissement affiché si aucun ministère n'est sélectionné.
//
//  Dépendances : ariaI18n, shared/theme
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_SECONDARY, labelStyle } from '../../../shared/theme';

export default function ActiveMinistriesSection({ ministries, activeMins, onToggleMinistry, onSetAllActive }) {
    const { lang } = useLocale();

    return (
        <div style={{ ...CARD_STYLE }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={labelStyle('0.42rem')}>
        {lang === 'en' ? 'ACTIVE MINISTRIES' : 'MINISTÈRES ACTIFS'}
        </div>
        <button
        style={{ ...BTN_SECONDARY, fontSize: '0.40rem', padding: '0.18rem 0.5rem' }}
        onClick={() => onSetAllActive()}
        >
        {lang === 'en' ? 'All' : 'Tous'}
        </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
        {ministries.map(m => {
            const on = activeMins === null || activeMins.includes(m.id);
            return (
                <button
                key={m.id}
                style={{
                    ...BTN_SECONDARY,
                    padding: '0.22rem 0.55rem',
                    fontSize: '0.42rem',
                    ...(on ? {
                        border: '1px solid ' + m.color + '77',
                        color: m.color,
                        background: m.color + '14'
                    } : {})
                }}
                onClick={() => onToggleMinistry(m.id)}
                >
                {m.emoji} {m.name}
                </button>
            );
        })}
        </div>

        {(activeMins && activeMins.length === 0) && (
            <div style={{
                fontFamily: FONT.mono,
                fontSize: '0.40rem',
                color: 'rgba(200,100,60,0.55)',
                                                     marginTop: '0.3rem'
            }}>
            ⚠ {lang === 'en'
                ? 'No active ministry — presidency only'
        : 'Aucun ministère actif — seule la présidence arbitrera'}
        </div>
        )}
        </div>
    );
}
