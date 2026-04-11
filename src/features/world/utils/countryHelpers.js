// src/features/world/utils/countryHelpers.js

import { loadLang } from '../../../ariaI18n';
import { REAL_COUNTRIES_DATA_EN } from '../../../shared/data/ariaData';
import { getStats } from '../../../shared/data/gameData';

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
