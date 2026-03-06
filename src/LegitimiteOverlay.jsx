// ═══════════════════════════════════════════════════════════════════════════
//  LegitimiteOverlay.jsx — Rapport de Légitimité Globale ARIA
//  Ouvert par clic sur le logo ARIA.
//  Colonne gauche : données réelles Think-Tank (fixes)
//  Colonne droite  : simulation en cours (dynamique)
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { COLOR, FONT, mono, cinzel } from './ariaTheme';

// ── Données Think-Tank (fixes) ────────────────────────────────────────────
const MANIFESTE_PAYS = [
    { flag:'🇨🇳', nom:'Chine',           irl:82, note:"Acceptation naturelle d'une gouvernance technocratique centralisée, déjà intégrée dans le contrat social de stabilité contre performances." },
    { flag:'🇯🇵', nom:'Japon',            irl:75, note:"Perception de l'IA comme une solution honorable et stable face au déclin démographique et à la fatigue des élites politiques humaines." },
    { flag:'🇸🇦', nom:'Arabie Saoudite',  irl:65, note:"Adhésion Top-Down. Les élites voient ARIA comme le moteur de la Vision 2030, population habituée à une gouvernance performative." },
    { flag:'🇮🇳', nom:'Inde',             irl:60, note:"Espoir d'une justice impartiale pour briser la corruption bureaucratique, balancé par d'immenses défis de diversité culturelle." },
    { flag:'🇩🇪', nom:'Allemagne',        irl:52, note:"Pragmatisme industriel et besoin d'ordre, mais traumatisme historique face à la surveillance de masse qui freine l'adhésion totale." },
    { flag:'🇺🇸', nom:'États-Unis',       irl:45, note:"Fracture nette : adhésion des pôles technologiques mais rejet viscéral des zones rurales par peur d'un contrôle fédéral algorithmique." },
    { flag:'🇧🇷', nom:'Brésil',           irl:48, note:"Besoin d'un arbitre neutre face à la corruption, mais la chaleur humaine et le charisme restent des piliers du consentement politique." },
    { flag:'🇫🇷', nom:'France',           irl:38, note:"Scepticisme élevé dû à la culture de la contestation et à la sacralisation du politique humain. Crise de confiance institutionnelle profonde." },
    { flag:'🇳🇬', nom:'Nigeria',          irl:40, note:"Jeunesse connectée prête pour le futur, mais forte résistance des structures traditionnelles face à un contrôle algorithmique transparent." },
    { flag:'🇷🇺', nom:'Russie',           irl:30, note:"Attachement culturel au leadership humain fort. L'IA est perçue comme un outil suspect ou incapable de comprendre l'âme nationale." },
    ];
const MANIFESTE_GLOBAL = 47;

// ── Barre de légitimité ───────────────────────────────────────────────────
function LegitimiteBar({ taux, color = COLOR.violetDim, height = 5 }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
        <div style={{ flex:1, height, background:'rgba(14,20,36,0.95)', borderRadius:'3px', overflow:'hidden' }}>
        <div style={{
            height:'100%', width:`${taux}%`,
            background:`linear-gradient(90deg, rgba(60,60,160,0.5), ${color})`,
            borderRadius:'3px', transition:'width 0.8s ease',
        }} />
        </div>
        <span style={{ ...mono('0.56rem', color), fontWeight:700, minWidth:'36px', textAlign:'right' }}>
        {taux}%
        </span>
        </div>
    );
}

// ── Composant principal ───────────────────────────────────────────────────
export default function LegitimiteOverlay({ liveCountries, onClose }) {
    const [expanded, setExpanded] = useState(null);
    const sorted   = [...MANIFESTE_PAYS].sort((a, b) => b.irl - a.irl);
    const hasLive  = liveCountries && liveCountries.length > 0;

    const secLabel = { ...mono('0.46rem', 'rgba(200,164,74,0.45)'), letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:'0.6rem' };

    return (
        <div style={{
            position:'fixed', inset:0, zIndex:9000, background:COLOR.bg,
            backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', overflowY:'auto',
        }}>
        {/* Header */}
        <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'1.4rem 2rem 0.8rem', borderBottom:`1px solid rgba(200,164,74,0.10)`,
        }}>
        <div>
        <div style={{ ...cinzel('1.1rem', 'rgba(200,164,74,0.90)', { fontWeight:700, letterSpacing:'0.30em' }) }}>
        RAPPORT DE LÉGITIMITÉ
        </div>
        <div style={{ ...mono('0.44rem', 'rgba(90,110,160,0.50)'), letterSpacing:'0.16em', marginTop:'0.25rem' }}>
        ARIA · ARCHITECTURE DE RAISONNEMENT INSTITUTIONNEL PAR L'IA
        </div>
        </div>
        <button onClick={onClose} style={{
            background:'none', border:'1px solid rgba(200,164,74,0.20)', borderRadius:'2px',
            padding:'0.4rem 0.9rem', color:'rgba(200,164,74,0.55)',
            fontFamily:FONT.mono, fontSize:'0.48rem', cursor:'pointer', letterSpacing:'0.12em',
        }}>
        FERMER ✕
        </button>
        </div>

        <div style={{ display:'flex', gap:'2rem', padding:'1.6rem 2rem 2rem', flex:1 }}>

        {/* ── COLONNE GAUCHE : Monde Réel ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div style={secLabel}>① Monde Réel — Ancre Think-Tank</div>

        <div style={{ padding:'0.8rem 1rem', background:'rgba(200,164,74,0.03)', border:'1px solid rgba(200,164,74,0.10)', borderRadius:'2px' }}>
        <div style={{ ...mono('0.44rem', 'rgba(140,160,200,0.55)'), lineHeight:1.7 }}>
        ARIA : 12 ministres IA, 2 présidents, 7 ministères. Chaque décision filtrée par toutes les perspectives,
        annotée, synthétisée, soumise au référendum citoyen. Le taux représente la probabilité d'acceptation
        d'un tel système aujourd'hui.
        </div>
        </div>

        <div style={{ padding:'1rem 1.1rem', background:'rgba(140,100,220,0.04)', border:'1px solid rgba(140,100,220,0.15)', borderRadius:'2px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'0.5rem' }}>
        <div style={{ ...mono('0.44rem', 'rgba(140,100,220,0.55)'), letterSpacing:'0.14em' }}>
        TAUX D'ACCEPTATION MONDIAL ESTIMÉ
        </div>
        <div style={{ ...cinzel('2.2rem', 'rgba(140,100,220,0.85)', { fontWeight:700 }) }}>
        {MANIFESTE_GLOBAL}%
        </div>
        </div>
        <LegitimiteBar taux={MANIFESTE_GLOBAL} height={8} />
        <div style={{ ...mono('0.41rem', 'rgba(80,100,140,0.45)'), marginTop:'0.5rem', fontStyle:'italic' }}>
        Estimation pondérée — EIU · Edelman Trust Barometer · Adoption technologique
        </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
        {sorted.map(c => {
            const col = c.irl >= 60 ? 'rgba(140,100,220,0.80)'
            : c.irl >= 45 ? 'rgba(100,130,210,0.70)'
            : c.irl >= 30 ? 'rgba(90,110,170,0.55)'
            :               'rgba(80,90,130,0.45)';
            const isExp = expanded === c.nom;
            return (
                <div key={c.nom}
                style={{
                    background: isExp ? 'rgba(140,100,220,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isExp ? 'rgba(140,100,220,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius:'2px', padding:'0.7rem 0.9rem', cursor:'pointer',
                }}
                onClick={() => setExpanded(isExp ? null : c.nom)}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.28rem' }}>
                <span style={{ fontSize:'0.95rem' }}>{c.flag}</span>
                <span style={{ ...mono('0.50rem', 'rgba(180,200,230,0.75)'), flex:1 }}>{c.nom}</span>
                <span style={{ ...mono('0.38rem', 'rgba(100,120,160,0.35)') }}>{isExp ? '▲' : '▼'}</span>
                </div>
                <LegitimiteBar taux={c.irl} color={col} />
                {isExp && (
                    <div style={{ marginTop:'0.5rem', paddingTop:'0.5rem', borderTop:'1px solid rgba(140,100,220,0.10)', ...mono('0.45rem', 'rgba(140,160,200,0.58)'), lineHeight:1.7, fontStyle:'italic' }}>
                    {c.note}
                    </div>
                )}
                </div>
            );
        })}
        </div>
        </div>

        {/* ── COLONNE DROITE : Simulation en cours ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'1rem', borderLeft:'1px solid rgba(200,164,74,0.08)', paddingLeft:'2rem' }}>
        <div style={secLabel}>② Simulation en cours — Adhésion In-Game</div>

        {!hasLive ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:'0.8rem', opacity:0.4 }}>
            <div style={{ fontSize:'2.5rem' }}>🌍</div>
            <div style={{ ...mono('0.50rem', 'rgba(140,160,200,0.55)'), textAlign:'center', lineHeight:1.7 }}>
            Aucune simulation active.<br />Lance une partie pour voir l'adhésion in-game.
            </div>
            </div>
        ) : (
            <>
            <div style={{ padding:'0.7rem 0.9rem', background:'rgba(255,255,255,0.02)', border:`1px solid ${COLOR.border}`, borderRadius:'2px' }}>
            <div style={{ ...mono('0.44rem', 'rgba(140,160,200,0.50)'), lineHeight:1.7 }}>
            Part du taux IRL initial · vote convergent +2 à +3 pts · divergence −3 à −4 pts · dérive passive à chaque cycle.
            </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem' }}>
            {liveCountries.map(c => {
                const irl     = c.aria_irl     ?? 40;
                const current = c.aria_current ?? irl;
                const delta   = current - irl;
                const colCur  = current >= 60 ? 'rgba(140,100,220,0.85)'
                : current >= 40 ? 'rgba(100,120,200,0.75)'
                :                 'rgba(80,90,150,0.60)';
                return (
                    <div key={c.id} style={{ padding:'0.8rem 1rem', background:'rgba(255,255,255,0.02)', border:`1px solid ${COLOR.border}`, borderRadius:'2px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.6rem' }}>
                    <span style={{ fontSize:'1rem' }}>{c.emoji}</span>
                    <span style={{ ...mono('0.54rem', 'rgba(200,215,240,0.80)'), flex:1, fontWeight:600 }}>{c.nom}</span>
                    {delta !== 0 && (
                        <span style={{ ...mono('0.42rem', delta > 0 ? COLOR.green : COLOR.redDim) }}>
                        {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} pts
                        </span>
                    )}
                    </div>
                    <div style={{ marginBottom:'0.4rem' }}>
                    <div style={{ ...mono('0.41rem', 'rgba(80,100,160,0.50)'), marginBottom:'0.18rem', letterSpacing:'0.10em' }}>ANCRE IRL</div>
                    <LegitimiteBar taux={irl} color="rgba(80,100,160,0.45)" height={4} />
                    </div>
                    <div>
                    <div style={{ ...mono('0.41rem', colCur), marginBottom:'0.18rem', letterSpacing:'0.10em' }}>ADHÉSION IN-GAME</div>
                    <LegitimiteBar taux={current} color={colCur} height={6} />
                    </div>
                    </div>
                );
            })}
            </div>
            </>
        )}
        </div>
        </div>
        </div>
    );
}
