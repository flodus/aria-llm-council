import { loadLang } from '../../../ariaI18n';
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from '../../../ariaData';

export function getRealCountries() {
    return loadLang() === 'en' ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA;
}
