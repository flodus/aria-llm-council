import { useLocale } from '../../../../ariaI18n';
import { FONT } from '../../../../shared/theme';

export default function Hint({ type }) {
    const { lang } = useLocale();

    const message = type === 'ministries'
    ? (lang === 'en'
    ? '↑ click to focus · click active again to deactivate · click inactive again to activate'
    : '↑ cliquer pour cibler · recliquer un actif pour désactiver · recliquer un inactif pour activer')
    : (lang === 'en'
    ? '↑ click to focus · click active again to deactivate · click inactive again to activate'
    : '↑ cliquer pour cibler · recliquer un actif pour désactiver · recliquer un inactif pour activer');

    return (
        <p style={{
            fontFamily: FONT.mono,
            fontSize: '0.36rem',
            fontStyle: 'italic',
            color: 'rgba(100,120,165,0.28)',
            margin: '0 0 0.05rem',
            lineHeight: 1.9,
            letterSpacing: '0.06em',
            textAlign: 'center',
            userSelect: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            paddingBottom: '0.35rem'
        }}>
        {message}
        </p>
    );
}
