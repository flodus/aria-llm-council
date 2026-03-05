// ═══════════════════════════════════════════════════════════════════════════
//  CountryPanel.jsx — Panneau latéral d'un pays sélectionné
//  + EmptyPanel quand aucun pays n'est sélectionné
// ═══════════════════════════════════════════════════════════════════════════

import { COLOR, FONT, TERRAIN_LABELS, RESOURCE_DEFS, MARITIME, satisfColor, fmtPop } from './ariaTheme';

// ── EmptyPanel ────────────────────────────────────────────────────────────
export function EmptyPanel() {
    return (
        <div className="panel-empty">
        <div className="panel-empty-icon">🌍</div>
        <div className="panel-empty-label">AUCUN TERRITOIRE SÉLECTIONNÉ</div>
        <p className="panel-empty-hint">
        Cliquez sur un pays sur la carte pour afficher ses données, ressources et options de gouvernance.
        </p>
        </div>
    );
}

// ── CountryPanel ──────────────────────────────────────────────────────────
export default function CountryPanel({ country, isCrisis, onClose, onSecession, onNextCycle, onCrisisToggle }) {
    const {
        nom = 'Inconnu', emoji = '🌍', terrain = 'coastal',
        population = 0, tauxNatalite = 0, tauxMortalite = 0,
        satisfaction = 50, ressources = {},
        aria_irl = null, aria_current = null,
    } = country;

    const sc = satisfColor(satisfaction);

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

        {/* Header */}
        <div className="panel-header">
        <span className="panel-header-emoji">{emoji}</span>
        <div style={{ flex:1 }}>
        <div className="panel-header-title">{nom}</div>
        <div className="panel-header-regime">{TERRAIN_LABELS[terrain] ?? terrain}</div>
        </div>
        <button className="btn-icon" onClick={onClose} title="Désélectionner" style={{ flexShrink:0 }}>✕</button>
        </div>

        <div className="side-panel-scroll">
        <div className="panel-body">

        {/* Démographie */}
        <section>
        <div className="section-title">DÉMOGRAPHIE</div>
        <div className="stat-row">
        <span className="stat-label">POPULATION</span>
        <span className="stat-value">{fmtPop(population)}</span>
        </div>
        <div className="stat-row" style={{ marginTop:'0.36rem' }}>
        <span className="stat-label">NATALITÉ</span>
        <span className="stat-value">{tauxNatalite.toFixed(1)} ‰</span>
        </div>
        <div className="stat-row" style={{ marginTop:'0.36rem' }}>
        <span className="stat-label">MORTALITÉ</span>
        <span className="stat-value">{tauxMortalite.toFixed(1)} ‰</span>
        </div>
        </section>

        {/* Satisfaction */}
        <section>
        <div className="section-title">SATISFACTION POPULAIRE</div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.72rem' }}>
        <div style={{ flex:1, height:'7px', background:'rgba(14,20,36,0.9)', borderRadius:'4px', overflow:'hidden' }}>
        <div style={{
            height:'100%', width:`${satisfaction}%`,
            background:`linear-gradient(90deg, #8A2020, ${sc})`,
            borderRadius:'4px', transition:'width 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
        }} />
        </div>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.80rem', fontWeight:600, color:sc, minWidth:'40px', textAlign:'right' }}>
        {satisfaction}%
        </span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:FONT.mono, fontSize:'0.44rem', color:'#3A4A62', marginTop:'0.26rem' }}>
        <span>MÉCONTENTS</span><span>SATISFAITS</span>
        </div>
        </section>

        {/* Légitimité ARIA */}
        {aria_irl !== null && (
            <section>
            <div className="section-title">LÉGITIMITÉ ARIA</div>

            {/* Ancre IRL */}
            <div style={{ marginBottom:'0.55rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.22rem' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', letterSpacing:'0.10em', color:'rgba(90,110,160,0.55)' }}>ANCRE THINK-TANK (IRL)</span>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.52rem', color:'rgba(90,110,160,0.55)', fontWeight:600 }}>{aria_irl}%</span>
            </div>
            <div style={{ height:'4px', background:'rgba(14,20,36,0.9)', borderRadius:'3px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${aria_irl}%`, background:'rgba(80,100,160,0.45)', borderRadius:'3px' }} />
            </div>
            </div>

            {/* In-game */}
            <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.22rem' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', letterSpacing:'0.10em', color: aria_current >= 60 ? 'rgba(140,100,220,0.80)' : 'rgba(100,80,140,0.55)' }}>ADHÉSION IN-GAME</span>
            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
            {aria_current !== aria_irl && (
                <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color: aria_current > aria_irl ? COLOR.green : COLOR.redDim }}>
                {aria_current > aria_irl ? '▲' : '▼'}{Math.abs(aria_current - aria_irl)}
                </span>
            )}
            <span style={{ fontFamily:FONT.mono, fontSize:'0.58rem', fontWeight:700, color: aria_current >= 60 ? '#8A64DC' : '#5A6090' }}>{aria_current}%</span>
            </div>
            </div>
            <div style={{ height:'6px', background:'rgba(14,20,36,0.9)', borderRadius:'3px', overflow:'hidden' }}>
            <div style={{
                height:'100%', width:`${aria_current}%`,
                background:'linear-gradient(90deg, rgba(80,60,160,0.6), rgba(140,100,220,0.9))',
                               borderRadius:'3px', transition:'width 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
            }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:FONT.mono, fontSize:'0.42rem', color:'#2A3450', marginTop:'0.20rem' }}>
            <span>RÉSISTANCE</span><span>ADHÉSION</span>
            </div>
            </div>
            </section>
        )}

        {/* Ressources */}
        <section>
        <div className="section-title">RESSOURCES</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.30rem' }}>
        {RESOURCE_DEFS.map(({ key, icon, label }) => {
            const present = !!ressources[key];
            return (
                <span key={key}
                className={`resource-badge ${key}`}
                style={{ opacity: present ? 1 : 0.22 }}
                title={present ? label : `${label} — absent`}>
                <span className="r-icon">{icon}</span>
                <span className="r-name">{label}</span>
                </span>
            );
        })}
        </div>
        {!MARITIME.has(terrain) && (
            <div className="coastal-note" style={{ marginTop:'0.55rem' }}>
            ⚠ Pays enclavé — aucune ZEE ni ressource maritime
            </div>
        )}
        </section>

        </div>
        </div>

        {/* Actions */}
        <div className="side-panel-footer">
        <div className="section-title" style={{ marginBottom:'0.08rem' }}>ACTIONS</div>
        <button className="cp-act-btn purple btn-full" onClick={onSecession} title="Simuler une sécession">
        ✂️ SÉCESSION
        </button>
        <button className="cp-act-btn muted btn-full" onClick={onNextCycle} title="Avancer de 5 ans">
        ⏭ CYCLE +5 ANS
        </button>
        <button
        className="cp-act-btn btn-full"
        onClick={onCrisisToggle}
        style={isCrisis
            ? { borderColor:'#FF3A3A', color:'#FF3A3A', background:'rgba(255,58,58,0.07)' }
            : { borderColor:'rgba(200,164,74,0.18)', color:'#4A5A72' }}>
            {isCrisis ? '🔴 DÉSACTIVER LA CRISE' : '⚠️ SIMULER UNE CRISE'}
            </button>
            </div>

            </div>
    );
}
