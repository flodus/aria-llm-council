// ═══════════════════════════════════════════════════════════════════════════
//  ConstitutionTabs.jsx — Onglets RÉSUMÉ / PRÉSIDENCE / MINISTÈRES / MINISTRES
//
//  Rendu en ligne avec soulignement doré sur l'onglet actif.
//  scrollRef : remonte en haut du panneau lors du changement d'onglet.
//
//  Dépendances : ariaI18n, shared/theme (FONT)
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale } from '../../../ariaI18n';
import { FONT } from '../../../shared/theme';

const tabStyle = (active) => ({
    fontFamily: FONT.mono,
    fontSize: '0.46rem',
    letterSpacing: '0.10em',
    padding: '0.35rem 0.75rem',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid rgba(200,164,74,0.70)' : '2px solid transparent',
                              color: active ? 'rgba(200,164,74,0.90)' : 'rgba(140,160,200,0.35)',
});

const TABS = [
    { id: 'resume', fr: 'RÉSUMÉ', en: 'SUMMARY' },
{ id: 'presidency', fr: 'PRÉSIDENCE', en: 'PRESIDENCY' },
{ id: 'ministries', fr: 'MINISTÈRES', en: 'MINISTRIES' },
{ id: 'ministers', fr: 'MINISTRES', en: 'MINISTERS' }
];

export default function ConstitutionTabs({ activeTab, onTabChange, scrollRef }) {
    const { lang } = useLocale();

    return (
        <>
        {TABS.map(tab => (
            <button
            key={tab.id}
            style={tabStyle(activeTab === tab.id)}
            onClick={() => {
                onTabChange(tab.id);
                if (scrollRef?.current) scrollRef.current.scrollTop = 0;
            }}
            >
            {tab[lang] || tab.fr}
            </button>
        ))}
        </>
    );
}
