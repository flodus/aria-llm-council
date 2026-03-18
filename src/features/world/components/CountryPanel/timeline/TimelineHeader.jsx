// src/features/world/components/CountryPanel/components/timeline/TimelineHeader.jsx

import { FONT } from '../../../../../shared/theme';

const FILTER_OPTIONS = [
    { value: 'all', label: { en: 'ALL EVENTS', fr: 'TOUS' } },
{ value: 'economic', label: { en: 'ECONOMIC', fr: 'ÉCONOMIE' }, icon: '💰' },
{ value: 'diplomatic', label: { en: 'DIPLOMATIC', fr: 'DIPLOMATIE' }, icon: '🤝' },
{ value: 'military', label: { en: 'MILITARY', fr: 'MILITAIRE' }, icon: '⚔️' },
{ value: 'social', label: { en: 'SOCIAL', fr: 'SOCIAL' }, icon: '👥' },
{ value: 'crisis', label: { en: 'CRISIS', fr: 'CRISE' }, icon: '⚠️' },
];

export default function TimelineHeader({
    isEn,
    filterType,
    setFilterType,
    sortOrder,
    setSortOrder,
    countryName
}) {
    return (
        <>
        <div style={{
            fontFamily: FONT.mono,
            fontSize: '0.40rem',
            letterSpacing: '0.16em',
            color: 'rgba(200,164,74,0.45)',
            marginBottom: '0.55rem'
        }}>
        {isEn ? `HISTORY OF ${countryName.toUpperCase()}` : `HISTORIQUE DE ${countryName.toUpperCase()}`}
        </div>

        {/* Filtres et tri */}
        <div style={{
            display: 'flex',
            gap: '0.3rem',
            marginBottom: '0.6rem',
            flexWrap: 'wrap'
        }}>
        <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        style={{
            background: 'rgba(8,14,26,0.7)',
            border: '1px solid rgba(90,110,160,0.3)',
            borderRadius: '2px',
            padding: '0.2rem 0.3rem',
            fontFamily: FONT.mono,
            fontSize: '0.38rem',
            color: 'rgba(180,200,230,0.8)',
            cursor: 'pointer',
            outline: 'none',
        }}
        >
        {FILTER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
            {opt.icon ? `${opt.icon} ` : ''}{isEn ? opt.label.en : opt.label.fr}
            </option>
        ))}
        </select>

        <button
        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        style={{
            background: 'rgba(8,14,26,0.7)',
            border: '1px solid rgba(90,110,160,0.3)',
            borderRadius: '2px',
            padding: '0.2rem 0.4rem',
            fontFamily: FONT.mono,
            fontSize: '0.38rem',
            color: 'rgba(180,200,230,0.8)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
        }}
        >
        <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
        <span>{isEn ? 'YEAR' : 'ANNÉE'}</span>
        </button>
        </div>
        </>
    );
}
