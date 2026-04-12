// src/features/world/components/CountryPanel/map/MapActions.jsx

import { t } from '../../../../../ariaI18n';

export default function MapActions({
    isEn,
    isCrisis,
    onGoToCouncil,
    onConstitution,
    onSecession,
    onNextCycle,
    onCrisisToggle
}) {
    const lang = isEn ? 'en' : 'fr';
    return (
        <div className="side-panel-footer">
        <div className="section-title" style={{ marginBottom: '0.08rem' }}>
        ACTIONS
        </div>

        <button
        className="cp-act-btn btn-full"
        onClick={onGoToCouncil}
        style={{
            borderColor: 'rgba(200,164,74,0.35)',
            color: 'rgba(200,164,74,0.80)',
            background: 'rgba(200,164,74,0.06)',
            marginBottom: '0.3rem'
        }}
        title={t('MAP_OPEN_COUNCIL_TIP', lang)}
        >
        {t('MAP_COUNCIL_BTN', lang)}
        </button>

        <button
        className="cp-act-btn btn-full"
        onClick={onConstitution}
        style={{
            borderColor: 'rgba(140,100,220,0.25)',
            color: 'rgba(140,100,220,0.70)',
            marginBottom: '0.3rem'
        }}
        title={t('MAP_GOV_TIP', lang)}
        >
        {t('MAP_GOV_BTN', lang)}
        </button>

        <button className="cp-act-btn purple btn-full" onClick={onSecession}>
        {t('MAP_SECESSION_BTN', lang)}
        </button>

        <button className="cp-act-btn muted btn-full" onClick={onNextCycle}>
        {t('MAP_CYCLE_BTN', lang)}
        </button>

        <button
        className="cp-act-btn btn-full"
        onClick={onCrisisToggle}
        style={isCrisis
            ? { borderColor: '#FF3A3A', color: '#FF3A3A', background: 'rgba(255,58,58,0.07)' }
            : { borderColor: 'rgba(200,164,74,0.18)', color: '#4A5A72' }
        }
        >
        {isCrisis ? t('MAP_CRISIS_DISABLE', lang) : t('MAP_CRISIS_SIMULATE', lang)}
        </button>
        </div>
    );
}
