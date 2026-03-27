// src/features/init/components/RealCountryLocalSection.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  RealCountryLocalSection.jsx — Sélecteur pays réel mode local (offline)
//
//  Dropdown sur getRealCountries() (liste statique locale).
//  Une fois un pays choisi, terrain et régime restent ajustables.
//  Affiche CountryInfoCard avec les données enrichies du pays sélectionné.
//
//  Dépendances : ariaI18n, shared/theme, features/init/services, CountryInfoCard
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale, t } from '../../../ariaI18n';
import { CARD_STYLE, SELECT_STYLE, labelStyle } from '../../../shared/theme';
import { getTerrainLabelMap, getRegimeLabelMap, getTerrainIcon, getRegimeIcon } from '../services/labels';
import { getRealCountries } from '../services/realCountries';
import { CountryInfoCard } from './index';

export default function RealCountryLocalSection({ country, onChange, setField, selectedRealIds = [] }) {
    const { lang } = useLocale();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
        <div style={{ ...labelStyle('0.43rem'), marginBottom: '0.3rem' }}>{t('SELECT', lang)}</div>
        <select
        style={SELECT_STYLE}
        value={country.realData?.id || ''}
        onChange={e => {
            const rc = getRealCountries().find(r => r.id === e.target.value);
            if (rc) onChange({ ...country, nom: rc.nom, regime: rc.regime, terrain: rc.terrain, realData: rc });
        }}
        >
        <option value="">{t('SELECT_OPTION', lang)}</option>
        {[...getRealCountries()]
            .sort((a, b) => {
                const aPris = selectedRealIds.includes(a.id);
                const bPris = selectedRealIds.includes(b.id);
                if (aPris === bPris) return 0;
                return aPris ? 1 : -1;
            })
            .map(rc => {
                const pris = selectedRealIds.includes(rc.id);
                return <option key={rc.id} value={rc.id} disabled={pris} style={{ color: pris ? 'rgba(140,160,200,0.35)' : undefined }}>{rc.flag} {rc.nom}{pris ? ' ✗' : ''}</option>;
            })}
        </select>
        </div>

        {country.realData && (
            <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
            <div style={{ ...labelStyle('0.42rem'), marginBottom: '0.25rem' }}>{t('TERRAIN', lang)}</div>
            <select style={SELECT_STYLE} value={country.terrain} onChange={e => setField('terrain', e.target.value)}>
            {Object.entries(getTerrainLabelMap(lang)).map(([k, v]) => <option key={k} value={k}>{getTerrainIcon(k)} {v}</option>)}
            </select>
            </div>
            <div>
            <div style={{ ...labelStyle('0.42rem'), marginBottom: '0.25rem' }}>{t('REGIME', lang)}</div>
            <select style={SELECT_STYLE} value={country.regime} onChange={e => setField('regime', e.target.value)}>
            {Object.entries(getRegimeLabelMap(lang)).map(([k, v]) => <option key={k} value={k}>{getRegimeIcon(k)} {v}</option>)}
            </select>
            </div>
            </div>
            <CountryInfoCard data={country.realData} />
            </>
        )}
        </div>
    );
}
