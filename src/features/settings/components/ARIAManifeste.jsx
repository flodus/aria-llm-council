// src/features/settings/components/ARIAManifeste.jsx
// Manifeste ARIA — Légitimité mondiale, données sociologiques par pays

import { useState } from 'react';

export const ARIA_MANIFESTE_PAYS = [
    { flag:"🇫🇷", nom:"France",          irl:38, regime:"République",     logic:"Scepticisme élevé dû à la culture de la contestation et à la sacralisation du politique humain. Passé révolutionnaire. Présent : crise de confiance institutionnelle profonde." },
{ flag:"🇩🇪", nom:"Allemagne",        irl:52, regime:"Fédérale",       logic:"Pragmatisme industriel et besoin d'ordre, mais traumatisme historique face à la surveillance de masse qui freine l'adhésion totale à une IA centrale." },
{ flag:"🇺🇸", nom:"États-Unis",       irl:45, regime:"Libérale",       logic:"Fracture nette : adhésion des pôles technologiques (Silicon Valley) mais rejet viscéral des zones rurales par peur d'un contrôle fédéral algorithmique." },
{ flag:"🇨🇳", nom:"Chine",            irl:82, regime:"Technocratie",   logic:"Acceptation naturelle d'une gouvernance technocratique centralisée, déjà intégrée dans le contrat social de stabilité contre performances." },
{ flag:"🇯🇵", nom:"Japon",            irl:75, regime:"Monarchie",      logic:"Perception de l'IA comme une solution honorable et stable face au déclin démographique et à la fatigue des élites politiques humaines." },
{ flag:"🇮🇳", nom:"Inde",             irl:60, regime:"Fédérale",       logic:"Espoir d'une justice impartiale pour briser la corruption bureaucratique, balancé par d'immenses défis de diversité culturelle." },
{ flag:"🇷🇺", nom:"Russie",           irl:30, regime:"Autoritaire",    logic:"Attachement culturel au leadership humain fort. L'IA est perçue comme un outil suspect ou incapable de comprendre l'âme nationale." },
{ flag:"🇧🇷", nom:"Brésil",           irl:48, regime:"Fédérale",       logic:"Besoin d'un arbitre neutre face à la corruption, mais la chaleur humaine et le charisme restent des piliers du consentement politique." },
{ flag:"🇳🇬", nom:"Nigeria",          irl:40, regime:"Fédérale",       logic:"Jeunesse connectée prête pour le futur, mais forte résistance des structures traditionnelles face à un contrôle algorithmique transparent." },
{ flag:"🇸🇦", nom:"Arabie Saoudite",  irl:65, regime:"Monarchie abs.", logic:"Adhésion Top-Down. Les élites voient ARIA comme le moteur de la Vision 2030, population habituée à une gouvernance performative." },
];

export const ARIA_MANIFESTE_GLOBAL = 47; // moyenne pondérée par population

export function IrlBar({ taux }) {
    const col = taux >= 60 ? 'rgba(140,100,220,0.80)'
    : taux >= 45 ? 'rgba(100,130,210,0.70)'
    : taux >= 30 ? 'rgba(90,110,170,0.55)'
    :              'rgba(80,90,130,0.45)';
    return (
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
        <div style={{ flex:1, height:4, background:'rgba(14,20,36,0.9)', borderRadius:'3px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${taux}%`,
        background:`linear-gradient(90deg, rgba(60,60,140,0.5), ${col})`,
            borderRadius:'3px' }} />
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.56rem', fontWeight:700,
                color: col, minWidth:'34px', textAlign:'right' }}>{taux}%</span>
                </div>
    );
}

export function ARIAManifeste() {
    const [expanded, setExpanded] = useState(null);

    const sorted = [...ARIA_MANIFESTE_PAYS].sort((a, b) => b.irl - a.irl);

    return (
        <div className="settings-group">
        <div className="settings-group-title">MANIFESTE — LÉGITIMITÉ MONDIALE D'ARIA</div>

        {/* Score mondial */}
        <div style={{ padding:'1rem', background:'rgba(140,100,220,0.04)',
            border:'1px solid rgba(140,100,220,0.15)', borderRadius:'2px', marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'0.5rem' }}>
            <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'0.52rem', letterSpacing:'0.18em',
                color:'rgba(140,100,220,0.55)' }}>TAUX D'ACCEPTATION MONDIAL ESTIMÉ</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
                    color:'rgba(80,100,140,0.45)', marginTop:'0.2rem' }}>
                    Si ARIA était proposé comme modèle de gouvernance aujourd'hui
                    </div>
                    </div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:'2rem', fontWeight:700,
                        color:'rgba(140,100,220,0.85)' }}>{ARIA_MANIFESTE_GLOBAL}%</div>
                        </div>
                        <IrlBar taux={ARIA_MANIFESTE_GLOBAL} />
                        </div>

                        {/* Tableau pays — cliquable pour révéler l'analyse */}
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                        {sorted.map(c => (
                            <div key={c.nom}>
                            <div style={{ cursor:'pointer', padding:'0.55rem 0.7rem',
                                background: expanded === c.nom ? 'rgba(140,100,220,0.06)' : 'rgba(255,255,255,0.015)',
                                          border:`1px solid ${expanded === c.nom ? 'rgba(140,100,220,0.25)' : 'rgba(255,255,255,0.06)'}`,
                                          borderRadius:'2px', transition:'all 0.15s' }}
                                          onClick={() => setExpanded(expanded === c.nom ? null : c.nom)}>

                                          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.3rem' }}>
                                          <span style={{ fontSize:'1rem' }}>{c.flag}</span>
                                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.50rem',
                                              color:'rgba(180,200,230,0.75)', flex:1 }}>{c.nom}</span>
                                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
                                                  color:'rgba(100,120,160,0.45)', marginRight:'0.5rem' }}>{c.regime}</span>
                                                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem',
                                                      color:'rgba(100,120,160,0.35)' }}>{expanded === c.nom ? '▲' : '▼'}</span>
                                                      </div>
                                                      <IrlBar taux={c.irl} />

                                                      {expanded === c.nom && (
                                                          <div style={{ marginTop:'0.55rem', paddingTop:'0.55rem',
                                                              borderTop:'1px solid rgba(140,100,220,0.12)',
                                                                              fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem',
                                                                              color:'rgba(140,160,200,0.60)', lineHeight:1.7, fontStyle:'italic' }}>
                                                                              {c.logic}
                                                                              </div>
                                                      )}
                                                      </div>
                                                      </div>
                        ))}
                        </div>

                        <div style={{ marginTop:'0.8rem', padding:'0.55rem 0.8rem',
                            background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
            borderRadius:'2px', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem',
            color:'rgba(80,100,140,0.45)', lineHeight:1.6 }}>
            ⓘ Estimations synthétiques — Indice de démocratie EIU · Edelman Trust Barometer · Adoption technologique · Précédents de gouvernance participative. Ces données constituent l'ancre IRL immuable dans la simulation.
            </div>
            </div>
    );
}
