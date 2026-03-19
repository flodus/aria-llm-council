// src/features/world/components/CountryPanel/CountryPanelMap.jsx

import { MARITIME } from '../../../../shared/theme';
import Demographics from './map/MapDemographics';
import SatisfactionBar from './map/MapSatisfaction';
import ARIAStats from './map/MapARIAStats';
import ResourcesList from './map/MapResources';
import MapActions from './map/MapActions';

export default function MapView({  // ← Correction 1: il manquait les accolades
    country,
    lang,
    isCrisis,
    onGoToCouncil,
    onConstitution,
    onSecession,
    onNextCycle,
    onCrisisToggle
}) {
    const isEn = lang === 'en';
    const { terrain } = country;

    return (
        <>
        <div className="side-panel-scroll">
        <div className="panel-body">
        <Demographics country={country} isEn={isEn} />
        <SatisfactionBar country={country} isEn={isEn} />
        <ARIAStats country={country} isEn={isEn} />
        <ResourcesList country={country} isEn={isEn} />

        {!MARITIME.has(terrain) && (
            <div className="coastal-note" style={{ marginTop: '0.55rem' }}>
            {isEn
                ? '⚠ Landlocked — no EEZ or maritime resources'
                : '⚠ Pays enclavé — aucune ZEE ni ressource maritime'
            }
            </div>
        )}
        </div>
        </div>

        <MapActions
        isEn={isEn}
        isCrisis={isCrisis}
        onGoToCouncil={onGoToCouncil}
        onConstitution={onConstitution}
        onSecession={onSecession}
        onNextCycle={onNextCycle}
        onCrisisToggle={onCrisisToggle}
        />
        </>
    );
}
