// src/features/init/components/api/AddKeyButton.jsx

import { BTN_SECONDARY } from '../../../../shared/theme';
import { useLocale } from '../../../../ariaI18n';

export default function AddKeyButton({ onClick }) {
    const { lang } = useLocale();

    return (
        <button
        style={{
            ...BTN_SECONDARY,
            fontSize: '0.40rem',
            padding: '0.25rem 0.6rem',
            alignSelf: 'flex-start',
            border: '1px dashed rgba(200,164,74,0.25)',
            color: 'rgba(200,164,74,0.60)'
        }}
        onClick={onClick}
        >
        + {lang === 'en' ? 'Add a key' : 'Ajouter une clé'}
        </button>
    );
}
