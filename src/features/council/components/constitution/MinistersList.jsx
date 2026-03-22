// src/features/council/components/constitution/MinistersList.jsx
// Délègue à AgentGrid (shared component — style Init, glow toned down)

import { useLocale } from '../../../../ariaI18n';
import AgentGrid from '../../../../shared/components/AgentGrid';

export default function MinistersList({ ministers, activeMinsters, onMinisterClick, onSetAllActive }) {
    const { lang } = useLocale();

    // Actifs en tête
    const sorted = Object.entries(ministers)
        .sort(([idA], [idB]) => {
            const aOn = activeMinsters === null || activeMinsters.includes(idA);
            const bOn = activeMinsters === null || activeMinsters.includes(idB);
            return aOn === bOn ? 0 : aOn ? -1 : 1;
        })
        .map(([id, m]) => ({ id, ...m }));

    return (
        <AgentGrid
            agents={sorted}
            selectedId={null}
            activeIds={activeMinsters}
            onAgentClick={onMinisterClick}
            onResetAll={onSetAllActive}
            countLabel={`${Object.keys(ministers).length} ${lang === 'en' ? 'MINISTERS' : 'MINISTRES'}`}
            lang={lang}
        />
    );
}
