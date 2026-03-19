// src/features/world/components/CountryPanel/map/MapSatisfaction.jsx

import { satisfColor, FONT } from '../../../../../shared/theme';

export default function SatisfactionBar({ country, isEn }) {
    const { satisfaction } = country;
    const sc = satisfColor(satisfaction);

    return (
        <section>
        <div className="section-title">{isEn ? "POPULAR SATISFACTION" : "SATISFACTION POPULAIRE"}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.72rem' }}>
        <div style={{ flex: 1, height: '7px', background: 'rgba(14,20,36,0.9)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
            height: '100%', width: `${satisfaction}%`,
            background: `linear-gradient(90deg, #8A2020, ${sc})`,
            borderRadius: '4px', transition: 'width 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
        }} />
        </div>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.80rem', fontWeight: 600, color: sc, minWidth: '40px', textAlign: 'right' }}>
        {satisfaction}%
        </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: '0.44rem', color: '#3A4A62', marginTop: '0.26rem' }}>
        <span>{isEn ? "UNHAPPY" : "MÉCONTENTS"}</span><span>{isEn ? "SATISFIED" : "SATISFAITS"}</span>
        </div>
        </section>
    );
}
