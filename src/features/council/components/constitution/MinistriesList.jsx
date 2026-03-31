// src/features/council/components/constitution/MinistriesList.jsx
// Délègue à AgentGrid (shared component — style Init, glow toned down)

import { useLocale } from '../../../../ariaI18n';
import AgentGrid from '../../../../shared/components/AgentGrid';

export default function MinistriesList({ ministries, activeMins, onMinistryClick, onSetAllActive, onEditEmoji }) {
    const { lang } = useLocale();
    const safeActiveMins = activeMins === undefined ? null : activeMins;

    // Actifs en tête
    const sorted = [...ministries].sort((a, b) => {
        const aOn = safeActiveMins === null || safeActiveMins.includes(a.id);
        const bOn = safeActiveMins === null || safeActiveMins.includes(b.id);
        return aOn === bOn ? 0 : aOn ? -1 : 1;
    });

    return (
        <AgentGrid
            agents={sorted}
            selectedId={null}
            activeIds={safeActiveMins}
            onAgentClick={onMinistryClick}
            onResetAll={onSetAllActive}
            onEditEmoji={onEditEmoji}
            countLabel={`${ministries.length} ${lang === 'en' ? 'MINISTRIES' : 'MINISTÈRES'}`}
            lang={lang}
        />
    );
}
