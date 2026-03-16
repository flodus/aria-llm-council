import { useLocale } from '../../../ariaI18n';
import { BTN_SECONDARY } from '../../../shared/theme';

export default function CustomizeButton({ hasOverride, onFork, onReset }) {
    const { lang } = useLocale();

    if (!hasOverride) {
        return (
            <button
            style={{
                ...BTN_SECONDARY,
                fontSize: '0.38rem',
                padding: '0.14rem 0.50rem',
                color: 'rgba(100,180,255,0.70)',
                border: '1px solid rgba(100,180,255,0.22)'
            }}
            onClick={onFork}
            >
            ✦ {lang === 'en' ? 'Customize this country' : 'Personnaliser ce pays'}
            </button>
        );
    }

    return (
        <button
        style={{
            ...BTN_SECONDARY,
            fontSize: '0.38rem',
            padding: '0.14rem 0.50rem',
            color: 'rgba(200,80,80,0.55)',
            border: '1px solid rgba(200,80,80,0.22)'
        }}
        onClick={onReset}
        >
        ↺ {lang === 'en' ? 'Common Constitution' : 'Constitution Commune'}
        </button>
    );
}
