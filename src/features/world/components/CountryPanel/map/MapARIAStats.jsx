// src/features/world/components/CountryPanel/components/map/ARIAStats.jsx
import { FONT, COLOR } from '../../../../../shared/theme';

export default function ARIAStats({ country, isEn }) {
    const { aria_irl, aria_current } = country;

    if (aria_irl === null) return null;

    return (
        <section>
        <div className="section-title">{isEn ? "ARIA LEGITIMACY" : "LÉGITIMITÉ ARIA"}</div>
        <div style={{ marginBottom: '0.55rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.22rem' }}>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', letterSpacing: '0.10em', color: 'rgba(90,110,160,0.55)' }}>
        {isEn ? 'THINK-TANK ANCHOR (IRL)' : 'ANCRE THINK-TANK (IRL)'}
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.52rem', color: 'rgba(90,110,160,0.55)', fontWeight: 600 }}>
        {aria_irl}%
        </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(14,20,36,0.9)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${aria_irl}%`, background: 'rgba(80,100,160,0.45)', borderRadius: '3px' }} />
        </div>
        </div>

        <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.22rem' }}>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', letterSpacing: '0.10em', color: aria_current >= 60 ? 'rgba(140,100,220,0.80)' : 'rgba(100,80,140,0.55)' }}>
        {isEn ? 'IN-GAME SUPPORT' : 'ADHÉSION IN-GAME'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {aria_current !== aria_irl && (
            <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: aria_current > aria_irl ? COLOR.green : COLOR.redDim }}>
            {aria_current > aria_irl ? '▲' : '▼'}{Math.abs(aria_current - aria_irl)}
            </span>
        )}
        <span style={{ fontFamily: FONT.mono, fontSize: '0.58rem', fontWeight: 700, color: aria_current >= 60 ? '#8A64DC' : '#5A6090' }}>
        {aria_current}%
        </span>
        </div>
        </div>
        <div style={{ height: '6px', background: 'rgba(14,20,36,0.9)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
            height: '100%', width: `${aria_current}%`,
            background: 'linear-gradient(90deg, rgba(80,60,160,0.6), rgba(140,100,220,0.9))',
            borderRadius: '3px', transition: 'width 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
        }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: '0.42rem', color: '#2A3450', marginTop: '0.20rem' }}>
        <span>{isEn ? "RESISTANCE" : "RÉSISTANCE"}</span><span>{isEn ? "SUPPORT" : "ADHÉSION"}</span>
        </div>
        </div>
        </section>
    );
}
