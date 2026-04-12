// src/features/world/components/CountryPanel/map/MapDemographics.jsx

import { fmtPop } from '../../../../../shared/theme';
import { t } from '../../../../../ariaI18n';

export default function Demographics({ country, isEn }) {
    const lang = isEn ? 'en' : 'fr';
    const { population, tauxNatalite, tauxMortalite, leader } = country;
    const leaderNom   = typeof leader === 'string' ? leader : leader?.nom;
    const leaderTitre = typeof leader === 'object' ? leader?.titre : null;
    const leaderTrait = typeof leader === 'object' ? leader?.trait : null;

    return (
        <section>
        <div className="section-title">{t('MAP_DEMO_TITLE', lang)}</div>
        {leaderNom && (
            <div className="stat-row">
            <span className="stat-label">{t('MAP_DEMO_LEADER', lang)}</span>
            <span className="stat-value" style={{ fontSize: '0.44rem' }}>
            {leaderTitre && `${leaderTitre} `}<strong>{leaderNom}</strong>{leaderTrait ? ` — ${leaderTrait}` : ''}
            </span>
            </div>
        )}
        <div className="stat-row" style={leaderNom ? { marginTop: '0.36rem' } : {}}>
        <span className="stat-label">{t('POPULATION', lang)}</span>
        <span className="stat-value">{fmtPop(population)}</span>
        </div>
        <div className="stat-row" style={{ marginTop: '0.36rem' }}>
        <span className="stat-label">{t('MAP_DEMO_BIRTH', lang)}</span>
        <span className="stat-value">{tauxNatalite.toFixed(1)} ‰</span>
        </div>
        <div className="stat-row" style={{ marginTop: '0.36rem' }}>
        <span className="stat-label">{t('MAP_DEMO_DEATH', lang)}</span>
        <span className="stat-value">{tauxMortalite.toFixed(1)} ‰</span>
        </div>
        </section>
    );
}
