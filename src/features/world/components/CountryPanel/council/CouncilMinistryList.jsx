// src/features/world/components/CountryPanel/components/council/MinistryList.jsx

import MinistryItem from './CouncilMinistryItem';

export default function MinistryList({
    ministries,
    openMinistry,
    setOpenMinistry,
    customQ,
    setCustomQ,
    submitting,
    handleSubmit,
    lang
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
            />
        ))}
        </>
    );
}
