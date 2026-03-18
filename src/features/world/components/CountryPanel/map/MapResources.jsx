// src/features/world/components/CountryPanel/components/map/ResourcesList.jsx
import { getResourceDefs } from '../../../../../shared/theme';

export default function ResourcesList({ country, isEn }) {
    const { ressources = {} } = country;

    return (
        <section>
        <div className="section-title">{isEn ? "RESOURCES" : "RESSOURCES"}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.30rem' }}>
        {getResourceDefs(isEn ? 'en' : 'fr').map(({ key, icon, label }) => {
            const present = !!ressources[key];
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
