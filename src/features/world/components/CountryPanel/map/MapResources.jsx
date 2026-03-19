// src/features/world/components/CountryPanel/map/MapResources.jsx

import { getResourceLabel, getResourceIcon, RESOURCE_DEFS } from '../../../../../shared/data/worldLabels';

export default function ResourcesList({ country, isEn }) {
    const { ressources = {} } = country;
    const lang = isEn ? 'en' : 'fr';

    return (
        <section>
        <div className="section-title">{isEn ? "RESOURCES" : "RESSOURCES"}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.30rem' }}>
        {RESOURCE_DEFS.map(({ key, icon }) => {
            const present = !!ressources[key];
            const label = getResourceLabel(key, lang);
            return (
                <span
                key={key}
                className={`resource-badge ${key}`}
                style={{ opacity: present ? 1 : 0.22 }}
                title={present ? label : `${label} — ${isEn ? 'absent' : 'absent'}`}
                >
                <span className="r-icon">{icon}</span>
                <span className="r-name">{label}</span>
                </span>
            );
        })}
        </div>
        </section>
    );
}
