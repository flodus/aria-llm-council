// src/features/world/components/CountryPanel/components/PanelHeader.jsx
import CountryNavArrows from './CountryPanelNavArrows';
import { getCountryEmoji, getLocalizedNom } from '../../utils';

export default function PanelHeader({
    country,
    onClose,
    countryIndex,
    countryTotal,
    onPrevCountry,
    onNextCountry
}) {
    const { nom, terrain } = country;

    return (
        <div className="panel-header">
        <span className="panel-header-emoji">{getCountryEmoji(country)}</span>
        <div style={{ flex: 1 }}>
        <div className="panel-header-title">{getLocalizedNom(country) || nom}</div>
        <div className="panel-header-regime">{terrain}</div>
        </div>
        <CountryNavArrows
        countryIndex={countryIndex}
        countryTotal={countryTotal}
        onPrevCountry={onPrevCountry}
        onNextCountry={onNextCountry}
        />
        <button className="btn-icon" onClick={onClose} style={{ flexShrink: 0 }}>✕</button>
        </div>
    );
}
