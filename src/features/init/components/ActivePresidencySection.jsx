// src/features/init/components/ActivePresidencySection.jsx
// Délègue à PresidencyList (shared component — style ConstitutionModal)

import { useLocale } from '../../../ariaI18n';
import PresidencyList from '../../../shared/components/PresidencyList';

export default function ActivePresidencySection({ presidency, activePres, onTogglePresidency, onCollegiale }) {
    const { lang } = useLocale();
    return (
        <PresidencyList
            presidency={presidency}
            activePres={activePres}
            onPresidentClick={onTogglePresidency}
            onCollegiale={onCollegiale}
            lang={lang}
        />
    );
}
