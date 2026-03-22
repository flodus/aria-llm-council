// src/features/init/components/ActiveMinistersSection.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  ActiveMinistersSection.jsx — Chips togglables des ministres actifs
//
//  Affiche chaque ministre avec sa couleur propre ; bouton "Tous" pour
//  réactiver l'ensemble. activeMinsters === null signifie tous actifs.
//
//  Dépendances : ariaI18n, shared/theme
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_SECONDARY, labelStyle } from '../../../shared/theme';
import { getDestin } from '../../council/services/agentsManager';

export default function ActiveMinistersSection({ ministers, activeMinsters, onToggleMinister, onSetAllActive }) {
    const { lang } = useLocale();
    const destingIds = new Set(getDestin()?.agents || []);

    return (
        <div style={{ ...CARD_STYLE }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.40rem' }}>
        <div style={labelStyle('0.42rem')}>
        {lang === 'en' ? 'ACTIVE MINISTERS' : 'MINISTRES ACTIFS'}
        </div>
        <button
        style={{ ...BTN_SECONDARY, fontSize: '0.38rem', padding: '0.14rem 0.38rem' }}
        onClick={() => onSetAllActive()}
        >
        {lang === 'en' ? 'All' : 'Tous'}
        </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {Object.entries(ministers).filter(([key]) => !destingIds.has(key)).map(([key, min]) => {
            const on = activeMinsters === null || activeMinsters.includes(key);
            return (
                <button
                key={key}
                style={{
                    ...BTN_SECONDARY,
                    padding: '0.18rem 0.46rem',
                    fontSize: '0.40rem',
                    ...(on ? {
                        border: '1px solid ' + min.color + '88',
                        color: min.color,
                        background: min.color + '14'
                    } : { opacity: 0.40 })
                }}
                onClick={() => onToggleMinister(key)}
                >
                {min.emoji} {min.name} {on ? '' : '○'}
                </button>
            );
        })}
        </div>
        </div>
    );
}
