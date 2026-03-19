// src/features/world/components/CountryPanel/council/CouncilMinistryList.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Composant : Liste des ministères
//  Passe les props nécessaires à chaque item
// ═══════════════════════════════════════════════════════════════════════════

import MinistryItem from './CouncilMinistryItem';

export default function MinistryList({
    ministries,
    openMinistry,
    setOpenMinistry,
    customQ,
    setCustomQ,
    submitting,
    handleSubmit,
    lang,
    countryId,
    cycleActuel,
    getCurrentQuestionForMinistry,
    setMinistryCycleQuestion,
    lastVoteTimestamp
}) {
    return (
        <>
        {ministries.map(m => (
            <MinistryItem
            key={m.id}
            ministry={m}
            isOpen={openMinistry === m.id}
            onToggle={() => setOpenMinistry(openMinistry === m.id ? null : m.id)}
            customQ={customQ}
            setCustomQ={setCustomQ}
            submitting={submitting}
            handleSubmit={handleSubmit}
            lang={lang}
            countryId={countryId}
            cycleActuel={cycleActuel}
            currentCycleQuestion={getCurrentQuestionForMinistry(m.id)}
            setMinistryCycleQuestion={setMinistryCycleQuestion}
            lastVoteTimestamp={lastVoteTimestamp}
            />
        ))}
        </>
    );
}
