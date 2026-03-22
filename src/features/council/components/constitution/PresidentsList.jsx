// src/features/council/components/constitution/PresidentsList.jsx
// Délègue à PresidencyList (shared component)

import { useLocale } from '../../../../ariaI18n';
import PresidencyList from '../../../../shared/components/PresidencyList';

export default function PresidentsList({ presidents, activePres, onPresidentClick }) {
    const { lang } = useLocale();
    return (
        <PresidencyList
            presidency={presidents}
            activePres={activePres}
            onPresidentClick={onPresidentClick}
            lang={lang}
        />
    );
}
