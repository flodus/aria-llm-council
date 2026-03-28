// src/shared/components/PresidencyList.jsx
//
// Liste des présidents actifs — dynamique (0 à 3 présidents).
// Utilisé par : Init (ActivePresidencySection), ConstitutionModal (PresidentsList)
//
// Props :
//   presidency        { [id]: { name, symbol, subtitle, ... } }
//   activePres        string[]
//   onPresidentClick  (id) => void
//   onCollegiale      () => void | undefined
//   onAddPresident    () => void | undefined  — si fourni, affiche le bouton "+ président"
//   lang              'fr' | 'en'

import { FONT, CARD_STYLE, labelStyle } from '../theme';

const DIM = 'rgba(140,160,200,0.48)';

// Couleurs par index (0=or, 1=violet, 2=émeraude)
const ACCENTS = [
    { color: 'rgba(200,164,74,0.88)',  bg: 'rgba(200,164,74,0.10)',  border: 'rgba(200,164,74,0.45)'  },
    { color: 'rgba(140,100,220,0.85)', bg: 'rgba(140,100,220,0.12)', border: 'rgba(140,100,220,0.45)' },
    { color: 'rgba(60,200,140,0.85)',  bg: 'rgba(60,200,140,0.10)',  border: 'rgba(60,200,140,0.45)'  },
];

// Ordre d'affichage canonique : phare en premier, boussole en second, reste à la fin
function trierEntrees(entries) {
    const ordre = ['phare', 'boussole'];
    return [
        ...ordre.map(id => entries.find(([k]) => k === id)).filter(Boolean),
        ...entries.filter(([k]) => !ordre.includes(k)),
    ];
}

export default function PresidencyList({ presidency, activePres, onPresidentClick, onCollegiale, onAddPresident, lang }) {
    const toutes = Object.entries(presidency || {}).filter(([, d]) => d);
    const entries = trierEntrees(toutes);
    const noActive = activePres.length === 0;
    const peutAjouter = entries.length < 3 && typeof onAddPresident === 'function';

    return (
        <div style={{ ...CARD_STYLE }}>
            <div style={{ ...labelStyle('0.42rem', 'rgba(200,164,74,0.55)'), marginBottom: '0.3rem' }}>
                {lang === 'en' ? 'ACTIVE FIGURES' : 'FIGURES ACTIVES'}
            </div>
            <p style={{ fontSize: '0.40rem', color: DIM, margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
                {lang === 'en'
                    ? '0 to 3 presidents active. No presidency → collegial mode.'
                    : '0 à 3 présidents actifs. Sans présidence → mode collégial.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {entries.map(([id, data], i) => {
                    const isActive = activePres.includes(id);
                    const acc = ACCENTS[i] || ACCENTS[ACCENTS.length - 1];
                    return (
                        <button
                            key={id}
                            onClick={() => onPresidentClick(id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.55rem',
                                padding: '0.52rem 0.68rem',
                                background: isActive ? acc.bg : 'rgba(20,28,45,0.55)',
                                border: `1px solid ${isActive ? acc.border : 'rgba(140,160,200,0.10)'}`,
                                borderRadius: '2px', cursor: 'pointer', width: '100%',
                                textAlign: 'left', transition: 'all 0.15s',
                            }}
                        >
                            <span style={{ fontSize: '1.15rem', minWidth: '1.4rem', color: acc.color }}>
                                {data.emoji || data.symbol}
                            </span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.56rem', letterSpacing: '0.10em', color: isActive ? acc.color : 'rgba(200,215,240,0.50)' }}>
                                    {data.name}
                                </div>
                                <div style={{ fontSize: '0.44rem', color: DIM, marginTop: '0.08rem' }}>
                                    {data.subtitle || data.titre || ''}
                                </div>
                            </div>
                            <span style={{ fontFamily: FONT.mono, fontSize: '0.48rem', color: isActive ? acc.color : 'rgba(140,160,200,0.22)' }}>
                                {isActive ? (lang === 'en' ? '● ACTIVE' : '● ACTIF') : (lang === 'en' ? '○ INACTIVE' : '○ INACTIF')}
                            </span>
                        </button>
                    );
                })}

                {/* Bouton ajouter un 3e président */}
                {peutAjouter && (
                    <button
                        onClick={onAddPresident}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            padding: '0.42rem 0.68rem',
                            background: 'transparent',
                            border: '1px dashed rgba(60,200,140,0.28)',
                            borderRadius: '2px', cursor: 'pointer', width: '100%',
                            color: 'rgba(60,200,140,0.55)',
                            fontFamily: FONT.mono, fontSize: '0.44rem', letterSpacing: '0.08em',
                            transition: 'all 0.15s',
                        }}
                    >
                        + {lang === 'en' ? 'ADD A PRESIDENT' : 'AJOUTER UN PRÉSIDENT'}
                    </button>
                )}
            </div>

            {/* Tuile Collégiale */}
            {onCollegiale && (
                <button
                    onClick={onCollegiale}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.55rem',
                        padding: '0.52rem 0.68rem', marginTop: '0.45rem',
                        background: noActive ? 'rgba(165,55,75,0.10)' : 'rgba(20,28,45,0.55)',
                        border: `1px solid ${noActive ? 'rgba(165,55,75,0.45)' : 'rgba(140,160,200,0.10)'}`,
                        borderRadius: '2px', cursor: 'pointer', width: '100%',
                        textAlign: 'left', transition: 'all 0.15s',
                    }}
                >
                    <span style={{ fontSize: '1.15rem', minWidth: '1.4rem', color: 'rgba(165,55,75,0.88)' }}>✡</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.56rem', letterSpacing: '0.10em', color: noActive ? 'rgba(165,55,75,0.88)' : 'rgba(200,215,240,0.50)' }}>
                            {lang === 'en' ? 'Collegial' : 'Collégiale'}
                        </div>
                        <div style={{ fontSize: '0.44rem', color: DIM, marginTop: '0.08rem' }}>
                            {lang === 'en' ? 'Vote of 12 ministers' : 'Vote des 12 ministres'}
                        </div>
                    </div>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.48rem', color: noActive ? 'rgba(165,55,75,0.88)' : 'rgba(140,160,200,0.22)' }}>
                        {noActive ? (lang === 'en' ? '● ACTIVE' : '● ACTIF') : (lang === 'en' ? '○ INACTIVE' : '○ INACTIF')}
                    </span>
                </button>
            )}
        </div>
    );
}
