// ═══════════════════════════════════════════════════════════════════════════
//  RecapAccordion.jsx — Récapitulatif accordéon multi-pays avant lancement
//
//  Affiche un accordéon par pays avec : présidence active, ministères,
//  ministres (emojis), mode de contexte de délibération.
//  ✦ bleu si perGov[i] non nul (constitution indépendante).
//  Constitution effective = perGov[i] si présent, sinon constitution commune.
//
//  Dépendances : ariaI18n, shared/theme, features/init/services/labels
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { FONT } from '../../../shared/theme';
import { getRegimeLabels, getTerrainLabels } from '../services/labels';

export default function RecapAccordion({ pendingDefs, perGov, commonAgents, commonMins, commonPres, commonMinsters, lang, ctxModes, ctxOvrs }) {
    const [openIdx, setOpenIdx] = useState(null); // index du pays ouvert

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem', maxHeight:'55vh', overflowY:'auto' }}>
        {(pendingDefs||[]).map((d, i) => {
            const nom     = d.nom?.trim() || d.realData?.nom || `Nation ${i+1}`;
            const flag    = d.realData?.flag || d.realData?.emoji || d.emoji || '🌐';
            const isReel  = d.type === 'reel';
            const regime  = d.regime || d.realData?.regime || '—';
            const terrain = d.terrain || d.realData?.terrain || '—';
            const hasGov  = !!perGov[i];
            const open    = openIdx === i;

            // Constitution effective pour ce pays
            const gov         = perGov[i];
            const effAgents   = gov?.agents   || commonAgents;
            const effMins     = gov?.activeMins    ?? commonMins;      // null = tous actifs
            const effPres     = gov?.activePres    ?? commonPres;
            const effMinsters = gov?.activeMinsters ?? commonMinsters;  // null = tous actifs

            // Données constitution
            const allMins     = effAgents?.ministries || [];
            const allMinsters = effAgents?.ministers   || {};
            const allPres     = effAgents?.presidency  || {};

            const activeMins     = effMins     ? allMins.filter(m => effMins.includes(m.id))     : allMins;
            const activeMinsters = effMinsters ? Object.entries(allMinsters).filter(([k]) => effMinsters.includes(k)) : Object.entries(allMinsters);
            const activePres     = effPres     ? Object.entries(allPres).filter(([k]) => effPres.includes(k))         : Object.entries(allPres);

            return (
                <div key={i} style={{ borderRadius:'3px', overflow:'hidden',
                    border: hasGov ? '1px solid rgba(100,180,255,0.22)' : '1px solid rgba(200,164,74,0.16)',
                    background:'rgba(8,14,26,0.60)' }}>

                    {/* Header cliquable */}
                    <div onClick={() => setOpenIdx(open ? null : i)}
                    style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.50rem 0.70rem', cursor:'pointer',
                        background: open ? 'rgba(200,164,74,0.05)' : 'transparent', transition:'background 0.15s' }}>
                        <span style={{ fontSize:'0.82rem' }}>{flag}</span>
                        <span style={{ fontFamily:FONT.mono, fontSize:'0.50rem', color:'rgba(215,225,240,0.92)', fontWeight:600, flex:1 }}>{nom}</span>
                        {hasGov && <span style={{ fontFamily:FONT.mono, fontSize:'0.30rem', color:'rgba(100,180,255,0.70)' }}>✦</span>}
                        <span style={{ fontFamily:FONT.mono, fontSize:'0.33rem', color:'rgba(140,160,200,0.40)' }}>
                        {isReel ? (lang==='en'?'Real':'Réel') : (lang==='en'?'Fictional':'Fictif')}
                        </span>
                        <div style={{ display:'flex', gap:'0.5rem', marginLeft:'0.3rem' }}>
                        <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:'rgba(140,160,200,0.45)' }}>
                        {getRegimeLabels()[regime] || regime}
                        </span>
                        <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:'rgba(140,160,200,0.30)' }}>·</span>
                        <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:'rgba(140,160,200,0.45)' }}>
                        {getTerrainLabels()[terrain] || terrain}
                        </span>
                        </div>
                        <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(200,164,74,0.55)', marginLeft:'0.2rem' }}>
                        {open ? '▲' : '▼'}
                        </span>
                        </div>

                        {/* Corps accordéon */}
                        {open && (
                            <div style={{ padding:'0.55rem 0.75rem', display:'flex', flexDirection:'column', gap:'0.55rem',
                                borderTop:'1px solid rgba(200,164,74,0.08)' }}>

                                {/* Présidence */}
                                <div>
                                <div style={{ fontFamily:FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em',
                                    color:'rgba(200,164,74,0.50)', marginBottom:'0.25rem' }}>
                                    {lang==='en' ? 'PRESIDENCY' : 'PRÉSIDENCE'}
                                    </div>
                                    <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
                                    {activePres.length > 0 ? activePres.map(([k, p]) => (
                                        <span key={k} style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                                            color: k==='phare' ? 'rgba(255,210,80,0.85)' : 'rgba(160,180,255,0.85)',
                                                                                         background: k==='phare' ? 'rgba(255,200,50,0.07)' : 'rgba(100,140,255,0.07)',
                                                                                         border: k==='phare' ? '1px solid rgba(255,200,50,0.20)' : '1px solid rgba(100,140,255,0.20)',
                                                                                         borderRadius:'2px', padding:'0.15rem 0.40rem' }}>
                                                                                         {k==='phare' ? '☉' : '☽'} {p.name || (k==='phare' ? 'Le Phare' : 'La Boussole')}
                                                                                         </span>
                                    )) : <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(140,160,200,0.35)' }}>—</span>}
                                    </div>
                                    </div>

                                    {/* Ministères */}
                                    <div>
                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em',
                                        color:'rgba(200,164,74,0.50)', marginBottom:'0.25rem' }}>
                                        {lang==='en' ? 'MINISTRIES' : 'MINISTÈRES'} ({activeMins.length})
                                        </div>
                                        <div style={{ display:'flex', gap:'0.25rem', flexWrap:'wrap' }}>
                                        {activeMins.map(m => (
                                            <span key={m.id} style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                                                color: m.color || 'rgba(140,180,255,0.75)',
                                                              background: (m.color || '#8090C0')+'12',
                                                              border: `1px solid ${(m.color || '#8090C0')}30`,
                                                              borderRadius:'2px', padding:'0.13rem 0.35rem' }}>
                                                              {m.emoji || '🏛'} {m.name}
                                                              </span>
                                        ))}
                                        </div>
                                        </div>

                                        {/* Ministres */}
                                        <div>
                                        <div style={{ fontFamily:FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em',
                                            color:'rgba(200,164,74,0.50)', marginBottom:'0.25rem' }}>
                                            {lang==='en' ? 'MINISTERS' : 'MINISTRES'} ({activeMinsters.length})
                                            </div>
                                            <div style={{ display:'flex', gap:'0.22rem', flexWrap:'wrap' }}>
                                            {activeMinsters.map(([k, m]) => (
                                                <span key={k} title={m.name} style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                                                    filter: `drop-shadow(0 0 3px ${m.color}66)`,
                                                                             cursor:'default' }}>
                                                                             {m.emoji}
                                                                             </span>
                                            ))}
                                            </div>
                                            </div>

                                            {/* Contexte délibérations */}
                                            {(() => {
                                                const CTX_LABELS = { '':'⚙️ '+(lang==='en'?'Inherit global':'Hérite du global'), auto:'🤖 Auto', rich:lang==='en'?'📖 Enriched':'📖 Enrichi', stats_only:lang==='en'?'📊 Stats only':'📊 Stats seules', off:lang==='en'?'🚫 Disabled':'🚫 Désactivé' };
                                                const mode = ctxModes?.[i] || '';
                                                const ovr  = ctxOvrs?.[i]  || '';
                                                return (
                                                    <div>
                                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em',
                                                        color:'rgba(200,164,74,0.50)', marginBottom:'0.25rem' }}>
                                                        {lang==='en' ? 'DELIBERATION CONTEXT' : 'CONTEXTE DÉLIBÉRATIONS'}
                                                        </div>
                                                        <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap', alignItems:'center' }}>
                                                        <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                                                            color:'rgba(160,180,220,0.75)', background:'rgba(100,120,180,0.08)',
                                                        border:'1px solid rgba(100,120,180,0.20)', borderRadius:'2px', padding:'0.13rem 0.40rem' }}>
                                                        {CTX_LABELS[mode] || CTX_LABELS['']}
                                                        </span>
                                                        {ovr && (
                                                            <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(200,164,74,0.60)',
                                                                fontStyle:'italic' }}>✎ override</span>
                                                        )}
                                                        </div>
                                                        </div>
                                                );
                                            })()}
                                            </div>
                        )}
                        </div>
            );
        })}
        </div>
    );
}
