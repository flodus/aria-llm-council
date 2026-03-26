// src/shared/components/PresidencyTiles.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Grille 4 tuiles de sélection de présidence
//  Référence visuelle : Settings > Gouvernance > Présidence par défaut
//
//  Props :
//    presType   'solaire' | 'lunaire' | 'duale' | 'collegiale'
//    onSelect   (presType: string) => void
//    isEn       boolean
// ═══════════════════════════════════════════════════════════════════════════

// Helpers de traduction activePres (string[]) ↔ presType (string)
export function activePresToType(activePres = []) {
    if (activePres.length === 0) return 'collegiale';
    if (activePres.length === 1) return activePres[0] === 'phare' ? 'solaire' : 'lunaire';
    return 'duale';
}
export function typeToActivePres(presType) {
    return { solaire: ['phare'], lunaire: ['boussole'], duale: ['phare', 'boussole'], collegiale: [] }[presType] ?? ['phare', 'boussole'];
}

const ACCENT = {
    solaire:    'rgba(200,164,74,0.80)',
    lunaire:    'rgba(140,100,220,0.80)',
    duale:      'rgba(170,132,147,0.80)',
    collegiale: 'rgba(165,55,75,0.80)',
};

export default function PresidencyTiles({ presType, onSelect, isEn }) {
    const sel = presType || 'duale';

    const tiles = [
        { value: 'solaire',    icon: '☉',  iconColor: 'rgba(200,164,74,0.90)',  iconSize: '1.6rem', label: isEn ? 'Phare'      : 'Phare',       tooltip: isEn ? 'The Phare — The Will'               : 'Le Phare — La Volonté' },
        { value: 'lunaire',    icon: '☽',  iconColor: 'rgba(150,100,220,0.90)', iconSize: '1.6rem', label: isEn ? 'Boussole'   : 'Boussole',    tooltip: isEn ? 'The Boussole — The Soul'            : 'La Boussole — L\'Âme' },
        { value: 'duale',      iconRender: <><span style={{ color: 'rgba(200,164,74,0.90)' }}>☉</span><span style={{ color: 'rgba(150,100,220,0.90)' }}>☽</span></>, iconSize: '1.2rem', label: isEn ? 'Dual' : 'Duale', tooltip: isEn ? 'Phare + Boussole — ARIA mode' : 'Phare + Boussole — Mode ARIA' },
        { value: 'collegiale', icon: null, iconColor: 'rgba(165,55,75,0.88)',   iconSize: '1.6rem', label: isEn ? 'Collegial'  : 'Collégiale',  tooltip: isEn ? 'Constitutional Synthesis'           : 'Synthèse Constitutionnelle' },
    ];

    const desc = {
        solaire:    isEn ? '☉ The Phare\npresides alone\nThe Will'                        : '☉ Le Phare\npréside seul\nLa Volonté',
        lunaire:    isEn ? '☽ The Boussole\npresides alone\nThe Soul'                     : '☽ La Boussole\npréside seule\nL\'Âme',
        duale:      isEn ? '☉☽ Phare and Boussole\ndeliberate equally\nARIA mode'         : '☉☽ Le Phare et La Boussole\ndélibèrent à égalité\nMode ARIA',
        collegiale: isEn ? '✡ Vote of 12 ministers\nConstitutional Synthesis'             : '✡ Vote des 12 ministres\nSynthèse Constitutionnelle',
    }[sel] || '';

    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {tiles.map(({ value, icon, iconRender, iconColor, iconSize, label, tooltip }) => {
                    const isSel = sel === value;
                    return (
                        <button key={value} title={tooltip} onClick={() => onSelect(value)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                                padding: '0.6rem 0.7rem', borderRadius: '6px', cursor: 'pointer', minWidth: '3.5rem',
                                background: isSel ? 'rgba(200,164,74,0.12)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isSel ? 'rgba(200,164,74,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                transition: 'all 0.12s',
                            }}>
                            <span style={{ height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {iconRender
                                    ? <span style={{ fontSize: iconSize, lineHeight: 1, letterSpacing: '-0.05em' }}>{iconRender}</span>
                                    : icon
                                    ? <span style={{ fontSize: iconSize, lineHeight: 1, color: iconColor || (isSel ? 'rgba(200,164,74,0.9)' : 'rgba(170,185,215,0.55)') }}>{icon}</span>
                                    : <span className="mdi mdi-hexagram-outline" style={{ fontSize: iconSize, lineHeight: 1, color: iconColor }} />
                                }
                            </span>
                            <span style={{
                                fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.52rem',
                                color: isSel ? 'rgba(200,164,74,0.9)' : 'rgba(170,185,215,0.55)',
                                letterSpacing: '0.03em', textAlign: 'center',
                                maxWidth: '4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3,
                            }}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
            <div style={{
                borderLeft: `2px solid ${ACCENT[sel] || ACCENT.duale}44`, paddingLeft: '1rem',
                fontStyle: 'italic', color: ACCENT[sel] || ACCENT.duale,
                fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.50rem',
                lineHeight: 1.7, whiteSpace: 'pre-line', alignSelf: 'center',
            }}>
                {desc}
            </div>
        </div>
    );
}
