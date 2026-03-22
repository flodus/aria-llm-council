// src/features/council/components/constitution/MinistersList.jsx
// Délègue à AgentGrid (shared component — style Init, glow toned down)

import { useLocale } from '../../../../ariaI18n';
import AgentGrid from '../../../../shared/components/AgentGrid';
import { getDestin } from '../../services/agentsManager';

export default function MinistersList({ ministers, activeMinsters, onMinisterClick, onSetAllActive }) {
    const { lang } = useLocale();

    // Exclure oracle/wyrd (agents destin — ont leur propre onglet)
    const destingIds = new Set(getDestin()?.agents || []);

    // Actifs en tête
    const sorted = Object.entries(ministers)
        .filter(([id]) => !destingIds.has(id))
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
            countLabel={`${sorted.length} ${lang === 'en' ? 'MINISTERS' : 'MINISTRES'}`}
            lang={lang}
        />
    );
}
