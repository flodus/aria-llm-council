// src/features/world/components/CountryPanel/components/map/MapActions.jsx

export default function MapActions({
    isEn,
    isCrisis,
    onGoToCouncil,
    onConstitution,
    onSecession,
    onNextCycle,
    onCrisisToggle
}) {
    return (
        <div className="side-panel-footer">
        <div className="section-title" style={{ marginBottom: '0.08rem' }}>
        {isEn ? "ACTIONS" : "ACTIONS"}
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
        title={isEn ? 'Open the Deliberation Council' : 'Ouvrir le Conseil de délibération'}
        >
        {isEn ? '⚖️ COUNCIL' : '⚖️ CONSEIL'}
        </button>

        <button
        className="cp-act-btn btn-full"
        onClick={onConstitution}
        style={{
            borderColor: 'rgba(140,100,220,0.25)',
            color: 'rgba(140,100,220,0.70)',
            marginBottom: '0.3rem'
        }}
        title={isEn ? 'Government configuration' : 'Configuration du gouvernement'}
        >
        {isEn ? '🏛️ GOVERNMENT' : '🏛️ GOUVERNEMENT'}
        </button>

        <button className="cp-act-btn purple btn-full" onClick={onSecession}>
        {isEn ? '✂️ SECESSION' : '✂️ SÉCESSION'}
        </button>

        <button className="cp-act-btn muted btn-full" onClick={onNextCycle}>
        {isEn ? '⏭ CYCLE +5 YRS' : '⏭ CYCLE +5 ANS'}
        </button>

        <button
        className="cp-act-btn btn-full"
        onClick={onCrisisToggle}
        style={isCrisis
            ? { borderColor: '#FF3A3A', color: '#FF3A3A', background: 'rgba(255,58,58,0.07)' }
            : { borderColor: 'rgba(200,164,74,0.18)', color: '#4A5A72' }
        }
        >
        {isCrisis
            ? (isEn ? '🔴 DISABLE CRISIS' : '🔴 DÉSACTIVER LA CRISE')
            : (isEn ? '⚠️ SIMULATE CRISIS' : '⚠️ SIMULER UNE CRISE')
        }
        </button>
        </div>
    );
}
