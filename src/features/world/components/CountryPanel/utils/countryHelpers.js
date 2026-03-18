// src/features/world/components/CountryPanel/utils/countryHelpers.js

import { loadLang } from '../../ariaI18n';
import { REAL_COUNTRIES_DATA_EN } from '../../ariaData';
import { getStats } from '../../Dashboard_p1';

export function getCountryEmoji(country) {
    if (country?.emoji) return country.emoji;
    const regime = country?.regime;
    if (regime) {
        const stats = getStats();
        const r = stats?.regimes?.[regime];
        if (r?.emoji) return r.emoji;
    }
    return '🌍';
}

export function getLocalizedNom(country) {
    if (!country?.id) return country?.nom || '';
    if (loadLang() !== 'en') return country?.nom || '';
    const enData = REAL_COUNTRIES_DATA_EN.find(r => r.id === country.id);
    return enData?.nom || country?.nom || '';
}

export function getTerrainLabel(key) {
    const stats = getStats();
    return stats?.terrains?.[key]?.name || key;
}
