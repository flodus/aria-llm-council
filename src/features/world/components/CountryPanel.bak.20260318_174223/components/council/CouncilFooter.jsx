// src/features/world/components/CountryPanel/components/council/CouncilFooter.jsx

export default function CouncilFooter({
    isEn,
    onNextCycle,
    onConstitution,
    onSecession
}) {
    const actions = [
        { icon: '⏭', label: isEn ? 'Cycle +5 yrs' : 'Cycle +5 ans', fn: onNextCycle, color: 'rgba(200,164,74,1.0)' },
        { icon: '🏛️', label: 'Gouvernement', fn: onConstitution, color: 'rgba(140,100,220,0.70)' },
        { icon: '✂️', label: isEn ? 'Secession' : 'Sécession', fn: onSecession, color: 'rgba(200,80,80,0.70)' },
    ];

    return (
        <div style={{
            display: 'flex', gap: '0.4rem', justifyContent: 'flex-end',
            padding: '0.5rem 0.8rem',
            borderTop: '1px solid rgba(200,164,74,0.10)',
            background: 'rgba(6,10,18,0.85)',
            flexShrink: 0,
        }}>
        {actions.map(({ icon, label, fn, color }) => (
            <button
            key={label}
            title={label}
            onClick={fn}
            style={{
                width: '32px', height: '32px',
                background: 'rgba(8,14,26,0.85)',
                                                      border: `1px solid ${color}44`,
                                                      borderRadius: '2px',
                                                      fontSize: '0.9rem', cursor: 'pointer',
                                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                      color,
                                                      transition: 'all 0.15s ease',
                                                      flexShrink: 0,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = `${color}18`;
                e.currentTarget.style.borderColor = `${color}88`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(8,14,26,0.85)';
                e.currentTarget.style.borderColor = `${color}44`;
            }}
            >
            {icon}
            </button>
        ))}
        </div>
    );
}
