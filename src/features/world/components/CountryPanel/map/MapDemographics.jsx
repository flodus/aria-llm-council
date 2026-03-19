// src/features/world/components/CountryPanel/map/MapDemographics.jsx

import { fmtPop } from '../../../../../shared/theme';

export default function Demographics({ country, isEn }) {
    const { population, tauxNatalite, tauxMortalite } = country;

    return (
        <section>
        <div className="section-title">{isEn ? "DEMOGRAPHICS" : "DÉMOGRAPHIE"}</div>
        <div className="stat-row">
        <span className="stat-label">{isEn ? "POPULATION" : "POPULATION"}</span>
        <span className="stat-value">{fmtPop(population)}</span>
        </div>
        <div className="stat-row" style={{ marginTop: '0.36rem' }}>
        <span className="stat-label">{isEn ? "BIRTH RATE" : "NATALITÉ"}</span>
        <span className="stat-value">{tauxNatalite.toFixed(1)} ‰</span>
        </div>
        <div className="stat-row" style={{ marginTop: '0.36rem' }}>
        <span className="stat-label">{isEn ? "DEATH RATE" : "MORTALITÉ"}</span>
        <span className="stat-value">{tauxMortalite.toFixed(1)} ‰</span>
        </div>
        </section>
    );
}
