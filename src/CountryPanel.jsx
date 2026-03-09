// ═══════════════════════════════════════════════════════════════════════════
//  CountryPanel.jsx — Panneau latéral ARIA
//
//  Deux modes selon activeTab :
//   'map'     → stats pays + actions + bouton ⚖️ CONSEIL
//   'council' → ministères cliquables + questions + saisie libre
//
//  Props :
//   country           {object}
//   isCrisis          {boolean}
//   activeTab         {string}    — 'map' | 'council' | 'timeline'
//   onClose           {function}
//   onSecession       {function}
//   onNextCycle       {function}
//   onCrisisToggle    {function}
//   onGoToCouncil     {function}  — bascule sur l'onglet council depuis la map
//   onConstitution    {function}  — ouvre la modale constitution
//   onSubmitQuestion  {function}  — (question, ministryId|null)
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { COLOR, FONT, TERRAIN_LABELS, RESOURCE_DEFS, MARITIME, satisfColor, fmtPop } from './ariaTheme';
import AGENTS_RAW from '../templates/base_agents.json';

const MINISTRIES_LIST = AGENTS_RAW.ministries || [];

// ── EmptyPanel ────────────────────────────────────────────────────────────
export function EmptyPanel({ activeTab }) {
  if (activeTab === 'council') {
    return (
      <div className="panel-empty">
        <div className="panel-empty-icon" style={{ fontSize: '1.6rem', opacity: 0.15 }}>⚖️</div>
        <div className="panel-empty-label">SÉLECTIONNEZ UN PAYS</div>
        <p className="panel-empty-hint">
          Cliquez sur un territoire pour accéder aux ministères et lancer une délibération.
        </p>
      </div>
    );
  }
  return (
    <div className="panel-empty">
      <div className="panel-empty-icon">🌍</div>
      <div className="panel-empty-label">AUCUN TERRITOIRE SÉLECTIONNÉ</div>
      <p className="panel-empty-hint">
        Cliquez sur un pays pour afficher ses données, ressources et options de gouvernance.
      </p>
    </div>
  );
}

// ── CountryPanel ──────────────────────────────────────────────────────────
export default function CountryPanel({
  country, isCrisis, activeTab,
  onClose, onSecession, onNextCycle, onCrisisToggle,
  onGoToCouncil, onConstitution,
  onSubmitQuestion, onAddFictionalCountry,
}) {
  const [openMinistry, setOpenMinistry] = useState(null);
  const [customQ,      setCustomQ]      = useState('');
  const [freeQ,        setFreeQ]        = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const {
    nom = 'Inconnu', emoji = '🌍', terrain = 'coastal',
    population = 0, tauxNatalite = 0, tauxMortalite = 0,
    satisfaction = 50, ressources = {},
    aria_irl = null, aria_current = null,
  } = country;

  const sc = satisfColor(satisfaction);

  const handleSubmit = (question, ministryId = null) => {
    if (!question.trim() || submitting) return;
    setSubmitting(true);
    onSubmitQuestion?.(question.trim(), ministryId);
    setCustomQ('');
    setFreeQ('');
    setTimeout(() => setSubmitting(false), 1200);
  };

  // ═════════════════════════════════════════════════════════════════════
  //  VUE COUNCIL
  // ═════════════════════════════════════════════════════════════════════
  if (activeTab === 'council') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="panel-header">
          <span className="panel-header-emoji">{emoji}</span>
          <div style={{ flex: 1 }}>
            <div className="panel-header-title">{nom}</div>
            <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.40)', letterSpacing: '0.10em' }}>
              CONSEIL DE DÉLIBÉRATION
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="side-panel-scroll">
          <div style={{ padding: '0.6rem 0.8rem' }}>

            <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(200,164,74,0.45)', marginBottom: '0.55rem' }}>
              MINISTÈRES
            </div>

            {MINISTRIES_LIST.map(m => {
              const isOpen = openMinistry === m.id;
              return (
                <div key={m.id} style={{
                  marginBottom: '0.45rem',
                  border: `1px solid ${isOpen ? m.color + '44' : 'rgba(90,110,160,0.12)'}`,
                  borderRadius: '2px',
                  background: isOpen ? `${m.color}06` : 'rgba(14,20,36,0.5)',
                  transition: 'all 0.18s ease', overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setOpenMinistry(isOpen ? null : m.id)}
                    style={{
                      width: '100%', background: 'none', border: 'none',
                      cursor: 'pointer', padding: '0.45rem 0.6rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{m.emoji}</span>
                    <span style={{
                      fontFamily: FONT.mono, fontSize: '0.46rem', flex: 1,
                      color: isOpen ? m.color : 'rgba(180,200,230,0.70)',
                      letterSpacing: '0.06em', transition: 'color 0.18s ease',
                    }}>{m.name}</span>
                    <span style={{
                      fontFamily: FONT.mono, fontSize: '0.55rem',
                      color: isOpen ? m.color : 'rgba(90,110,160,0.35)',
                      transform: isOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}>›</span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 0.6rem 0.6rem' }}>
                      <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.12em', color: 'rgba(140,160,200,0.40)', marginBottom: '0.35rem' }}>
                        QUESTIONS FRÉQUENTES
                      </div>
                      {(m.questions || []).map((q, i) => (
                        <button key={i} onClick={() => handleSubmit(q, m.id)} disabled={submitting}
                          style={{
                            width: '100%', background: 'none', border: `1px solid ${m.color}22`,
                            borderRadius: '2px', cursor: 'pointer',
                            padding: '0.38rem 0.5rem', marginBottom: '0.28rem',
                            fontFamily: FONT.mono, fontSize: '0.43rem',
                            color: 'rgba(160,180,220,0.65)', textAlign: 'left', lineHeight: 1.45,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${m.color}10`; e.currentTarget.style.color = 'rgba(200,215,240,0.88)'; e.currentTarget.style.borderColor = `${m.color}44`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(160,180,220,0.65)'; e.currentTarget.style.borderColor = `${m.color}22`; }}
                        >{q}</button>
                      ))}

                      <div style={{ marginTop: '0.4rem' }}>
                        <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.12em', color: 'rgba(140,160,200,0.40)', marginBottom: '0.28rem' }}>
                          QUESTION DU PEUPLE
                        </div>
                        <textarea value={customQ} onChange={e => setCustomQ(e.target.value)}
                          placeholder={`Question pour ${m.name}…`} rows={2}
                          style={{
                            width: '100%', background: 'rgba(8,14,26,0.7)',
                            border: `1px solid ${m.color}28`, borderRadius: '2px',
                            padding: '0.4rem 0.5rem', fontFamily: FONT.mono, fontSize: '0.43rem',
                            color: 'rgba(180,200,230,0.80)', resize: 'none', outline: 'none',
                            boxSizing: 'border-box', lineHeight: 1.5,
                          }}
                          onFocus={e => { e.target.style.borderColor = `${m.color}55`; }}
                          onBlur={e => { e.target.style.borderColor = `${m.color}28`; }}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(customQ, m.id); } }}
                        />
                        <button onClick={() => handleSubmit(customQ, m.id)} disabled={!customQ.trim() || submitting}
                          style={{
                            marginTop: '0.3rem', width: '100%', padding: '0.32rem',
                            fontFamily: FONT.mono, fontSize: '0.44rem', letterSpacing: '0.10em',
                            cursor: 'pointer',
                            background: customQ.trim() ? `${m.color}14` : 'transparent',
                            border: `1px solid ${customQ.trim() ? m.color + '44' : 'rgba(90,110,160,0.15)'}`,
                            borderRadius: '2px',
                            color: customQ.trim() ? m.color : 'rgba(90,110,160,0.30)',
                            transition: 'all 0.15s ease',
                          }}
                        >SOUMETTRE AU CONSEIL →</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ height: '1px', background: 'rgba(90,110,160,0.10)', margin: '0.7rem 0' }} />

            <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(140,160,200,0.40)', marginBottom: '0.4rem' }}>
              QUESTION LIBRE
            </div>
            <div style={{ fontFamily: FONT.mono, fontSize: '0.41rem', color: 'rgba(100,120,160,0.45)', lineHeight: 1.5, marginBottom: '0.45rem', fontStyle: 'italic' }}>
              Le Conseil déterminera automatiquement le ministère compétent.
            </div>
            <textarea value={freeQ} onChange={e => setFreeQ(e.target.value)}
              placeholder="Posez n'importe quelle question…" rows={3}
              style={{
                width: '100%', background: 'rgba(8,14,26,0.7)',
                border: '1px solid rgba(90,110,160,0.16)', borderRadius: '2px',
                padding: '0.4rem 0.5rem', fontFamily: FONT.mono, fontSize: '0.43rem',
                color: 'rgba(180,200,230,0.80)', resize: 'none', outline: 'none',
                boxSizing: 'border-box', lineHeight: 1.5,
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(200,164,74,0.30)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(90,110,160,0.16)'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(freeQ, null); } }}
            />
            <button onClick={() => handleSubmit(freeQ, null)} disabled={!freeQ.trim() || submitting}
              style={{
                marginTop: '0.3rem', width: '100%', padding: '0.35rem',
                fontFamily: FONT.mono, fontSize: '0.44rem', letterSpacing: '0.10em',
                cursor: freeQ.trim() && !submitting ? 'pointer' : 'default',
                background: freeQ.trim() ? 'rgba(200,164,74,0.10)' : 'transparent',
                border: `1px solid ${freeQ.trim() ? 'rgba(200,164,74,0.40)' : 'rgba(90,110,160,0.15)'}`,
                borderRadius: '2px',
                color: freeQ.trim() ? 'rgba(200,164,74,0.85)' : 'rgba(90,110,160,0.30)',
                transition: 'all 0.15s ease',
              }}
            >{submitting ? '⏳ ROUTAGE EN COURS…' : 'SOUMETTRE AU CONSEIL →'}</button>
          </div>
        </div>

        {/* ── Barre d'actions horizontale — bas du panel Council ── */}
        <div style={{
          display: 'flex', gap: '0.4rem', justifyContent: 'flex-end',
          padding: '0.5rem 0.8rem',
          borderTop: '1px solid rgba(200,164,74,0.10)',
          background: 'rgba(6,10,18,0.85)',
          flexShrink: 0,
        }}>
          {[
            { icon: '⏭', label: 'Cycle +5 ans',  fn: onNextCycle,    color: 'rgba(200,164,74,0.70)' },
            { icon: '📜', label: 'Constitution',  fn: onConstitution, color: 'rgba(140,100,220,0.70)' },
            { icon: '✂️', label: 'Sécession',     fn: onSecession,    color: 'rgba(200,80,80,0.70)'  },
          ].map(({ icon, label, fn, color }) => (
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
              onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}88`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,14,26,0.85)'; e.currentTarget.style.borderColor = `${color}44`; }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  //  VUE MAP
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header">
        <span className="panel-header-emoji">{emoji}</span>
        <div style={{ flex: 1 }}>
          <div className="panel-header-title">{nom}</div>
          <div className="panel-header-regime">{TERRAIN_LABELS[terrain] ?? terrain}</div>
        </div>
        <button className="btn-icon" onClick={onClose} style={{ flexShrink: 0 }}>✕</button>
      </div>

      <div className="side-panel-scroll">
        <div className="panel-body">

          <section>
            <div className="section-title">DÉMOGRAPHIE</div>
            <div className="stat-row">
              <span className="stat-label">POPULATION</span>
              <span className="stat-value">{fmtPop(population)}</span>
            </div>
            <div className="stat-row" style={{ marginTop: '0.36rem' }}>
              <span className="stat-label">NATALITÉ</span>
              <span className="stat-value">{tauxNatalite.toFixed(1)} ‰</span>
            </div>
            <div className="stat-row" style={{ marginTop: '0.36rem' }}>
              <span className="stat-label">MORTALITÉ</span>
              <span className="stat-value">{tauxMortalite.toFixed(1)} ‰</span>
            </div>
          </section>

          <section>
            <div className="section-title">SATISFACTION POPULAIRE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.72rem' }}>
              <div style={{ flex: 1, height: '7px', background: 'rgba(14,20,36,0.9)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${satisfaction}%`,
                  background: `linear-gradient(90deg, #8A2020, ${sc})`,
                  borderRadius: '4px', transition: 'width 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
                }} />
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: '0.80rem', fontWeight: 600, color: sc, minWidth: '40px', textAlign: 'right' }}>
                {satisfaction}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: '0.44rem', color: '#3A4A62', marginTop: '0.26rem' }}>
              <span>MÉCONTENTS</span><span>SATISFAITS</span>
            </div>
          </section>

          {aria_irl !== null && (
            <section>
              <div className="section-title">LÉGITIMITÉ ARIA</div>
              <div style={{ marginBottom: '0.55rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.22rem' }}>
                  <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', letterSpacing: '0.10em', color: 'rgba(90,110,160,0.55)' }}>ANCRE THINK-TANK (IRL)</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: '0.52rem', color: 'rgba(90,110,160,0.55)', fontWeight: 600 }}>{aria_irl}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(14,20,36,0.9)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${aria_irl}%`, background: 'rgba(80,100,160,0.45)', borderRadius: '3px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.22rem' }}>
                  <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', letterSpacing: '0.10em', color: aria_current >= 60 ? 'rgba(140,100,220,0.80)' : 'rgba(100,80,140,0.55)' }}>ADHÉSION IN-GAME</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {aria_current !== aria_irl && (
                      <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: aria_current > aria_irl ? COLOR.green : COLOR.redDim }}>
                        {aria_current > aria_irl ? '▲' : '▼'}{Math.abs(aria_current - aria_irl)}
                      </span>
                    )}
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.58rem', fontWeight: 700, color: aria_current >= 60 ? '#8A64DC' : '#5A6090' }}>{aria_current}%</span>
                  </div>
                </div>
                <div style={{ height: '6px', background: 'rgba(14,20,36,0.9)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${aria_current}%`,
                    background: 'linear-gradient(90deg, rgba(80,60,160,0.6), rgba(140,100,220,0.9))',
                    borderRadius: '3px', transition: 'width 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: '0.42rem', color: '#2A3450', marginTop: '0.20rem' }}>
                  <span>RÉSISTANCE</span><span>ADHÉSION</span>
                </div>
              </div>
            </section>
          )}

          <section>
            <div className="section-title">RESSOURCES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.30rem' }}>
              {RESOURCE_DEFS.map(({ key, icon, label }) => {
                const present = !!ressources[key];
                return (
                  <span key={key} className={`resource-badge ${key}`}
                    style={{ opacity: present ? 1 : 0.22 }}
                    title={present ? label : `${label} — absent`}>
                    <span className="r-icon">{icon}</span>
                    <span className="r-name">{label}</span>
                  </span>
                );
              })}
            </div>
            {!MARITIME.has(terrain) && (
              <div className="coastal-note" style={{ marginTop: '0.55rem' }}>
                ⚠ Pays enclavé — aucune ZEE ni ressource maritime
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Actions footer */}
      <div className="side-panel-footer">
        <div className="section-title" style={{ marginBottom: '0.08rem' }}>ACTIONS</div>

        {/* ⚖️ Accès direct au Conseil */}
        <button className="cp-act-btn btn-full" onClick={onGoToCouncil}
          style={{ borderColor: 'rgba(200,164,74,0.35)', color: 'rgba(200,164,74,0.80)', background: 'rgba(200,164,74,0.06)', marginBottom: '0.3rem' }}
          title="Ouvrir le Conseil de délibération"
        >
          ⚖️ CONSEIL
        </button>

        <button className="cp-act-btn btn-full" onClick={onConstitution}
          style={{ borderColor: 'rgba(140,100,220,0.25)', color: 'rgba(140,100,220,0.70)', marginBottom: '0.3rem' }}
          title="Modifier la constitution"
        >
          📜 CONSTITUTION
        </button>

        <button className="cp-act-btn purple btn-full" onClick={onSecession}>✂️ SÉCESSION</button>
        <button className="cp-act-btn muted btn-full" onClick={onNextCycle}>⏭ CYCLE +5 ANS</button>
        <button className="cp-act-btn btn-full" onClick={onCrisisToggle}
          style={isCrisis
            ? { borderColor: '#FF3A3A', color: '#FF3A3A', background: 'rgba(255,58,58,0.07)' }
            : { borderColor: 'rgba(200,164,74,0.18)', color: '#4A5A72' }}>
          {isCrisis ? '🔴 DÉSACTIVER LA CRISE' : '⚠️ SIMULER UNE CRISE'}
        </button>
      </div>
    </div>
  );
}
