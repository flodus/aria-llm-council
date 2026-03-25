// src/features/init/services/realCountries.js

import { loadLang } from '../../../ariaI18n';
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from '../../../shared/data/ariaData';

export function getRealCountries() {
    return loadLang() === 'en' ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA;
}
