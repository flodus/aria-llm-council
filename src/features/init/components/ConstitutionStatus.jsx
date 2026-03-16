import { useLocale } from '../../../ariaI18n';
import { FONT } from '../../../shared/theme';

export default function ConstitutionStatus({ hasOverride, countryName, lang: propLang }) {
    const { lang: contextLang } = useLocale();
    const lang = propLang || contextLang;

    if (hasOverride) {
        return (
            <span style={{
                marginLeft: '2.5rem',
                fontFamily: FONT.mono,
                fontSize: '0.40rem',
                letterSpacing: '0.10em',
                color: 'rgba(100,180,255,0.90)',
                whiteSpace: 'nowrap',
                fontWeight: 600
            }}>
            ✦ {lang === 'en'
                ? `INDEPENDENT — ${countryName?.toUpperCase() || ''}`
                : `CONSTITUTION INDÉPENDANTE — ${countryName?.toUpperCase() || ''}`}
                </span>
        );
    }

    return (
        <span style={{
            marginLeft: '2.5rem',
            fontFamily: FONT.mono,
            fontSize: '0.40rem',
            letterSpacing: '0.10em',
            color: 'rgba(200,164,74,0.60)',
            whiteSpace: 'nowrap'
        }}>
        ◈ {lang === 'en' ? 'COMMON CONSTITUTION' : 'CONSTITUTION COMMUNE'}
        </span>
    );
}
