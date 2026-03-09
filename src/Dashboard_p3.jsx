// ═══════════════════════════════════════════════════════════════════════════════
//  Dashboard_p3.jsx — Partie 3 / 3
//  Composant Dashboard() final : assemblage useARIA + MapSVG + modales
//
//  Ce fichier REMPLACE le stub export default de Dashboard_p1.jsx.
//  Dans App.jsx : import Dashboard from './Dashboard_p3'
//
//  Dépend de :
//    Dashboard_p1.jsx  → useARIA, getGovConfig, PAYS_LOCAUX, …
//    Dashboard_p2.jsx  → MapSVG
//    ConstitutionModal → modale gouvernance par pays
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useChronolog } from './useChronolog';
import ChronologView   from './ChronologView';

// ─────────────────────────────────────────────────────────────────────────────
//  POPUP RÉSULTAT DE VOTE
//  Apparaît immédiatement après que le joueur a voté.
//  Affiche : question · choix · jauge · impacts · conséquences
// ─────────────────────────────────────────────────────────────────────────────
function VoteResultModal({ session, onClose }) {
  const { question, voteResult, presidence } = session || {};
  if (!voteResult) return null;

  const total   = (voteResult.oui || 0) + (voteResult.non || 0);
  const ouiPct  = total > 0 ? Math.round((voteResult.oui / total) * 100) : 50;
  const nonPct  = 100 - ouiPct;
  const isOui   = voteResult.vote === 'oui';
  const vColor  = isOui ? 'rgba(58,191,122,0.90)' : 'rgba(200,80,80,0.88)';
  const MONO    = "'JetBrains Mono', monospace";
  const SERIF   = "'Cinzel', serif";

  const fmt = n => n >= 1_000_000
    ? (n/1_000_000).toFixed(1)+'M'
    : n >= 1_000 ? (n/1_000).toFixed(0)+'k' : String(n);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: '500px', maxHeight: '88vh', overflowY: 'auto' }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ ...S.modalHeader, borderBottomColor: `${vColor}28` }}>
          <span style={{ ...S.modalTitle, color: vColor }}>
            ✦ RÉSULTAT DU CONSEIL
          </span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '0.9rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

          {/* Question */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.18em', color: 'rgba(140,160,200,0.50)', marginBottom: '0.3rem' }}>
              QUESTION SOUMISE
            </div>
            <p style={{ fontFamily: SERIF, fontSize: '0.54rem', color: 'rgba(200,215,240,0.80)', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
              « {presidence?.synthese?.question_referendum || question} »
            </p>
          </div>

          {/* Choix du joueur */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.55rem 0.75rem',
            background: `${vColor}0C`, border: `1px solid ${vColor}30`,
            borderRadius: '2px',
          }}>
            <span style={{ fontSize: '1.1rem' }}>{isOui ? '✓' : '✕'}</span>
            <div>
              <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.14em', color: `${vColor}88`, marginBottom: '0.2rem' }}>
                VOTRE CHOIX
              </div>
              <div style={{ fontFamily: MONO, fontSize: '0.54rem', color: vColor, letterSpacing: '0.08em' }}>
                {isOui ? 'OUI — ADOPTER' : 'NON — REJETER'}
              </div>
            </div>
          </div>

          {/* Jauge OUI / NON */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.16em', color: 'rgba(140,160,200,0.45)', marginBottom: '0.4rem' }}>
              RÉSULTAT DU VOTE POPULAIRE · {fmt(total)} VOTANTS
            </div>
            <div style={{ display: 'flex', height: '1.6rem', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(90,110,160,0.14)', background: 'rgba(0,0,0,0.3)' }}>
              <div style={{
                width: `${ouiPct}%`, background: 'rgba(58,191,122,0.72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'width 0.8s ease',
                fontFamily: MONO, fontSize: '0.44rem', color: 'rgba(220,240,228,0.95)', fontWeight: 700,
              }}>
                {ouiPct >= 12 && `✓ ${ouiPct}%`}
              </div>
              <div style={{
                flex: 1, background: 'rgba(200,80,80,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: '0.44rem', color: 'rgba(240,210,210,0.95)', fontWeight: 700,
              }}>
                {nonPct >= 12 && `✕ ${nonPct}%`}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              <span style={{ fontFamily: MONO, fontSize: '0.38rem', color: 'rgba(58,191,122,0.55)' }}>OUI · {fmt(voteResult.oui)}</span>
              <span style={{ fontFamily: MONO, fontSize: '0.38rem', color: 'rgba(200,80,80,0.55)' }}>NON · {fmt(voteResult.non)}</span>
            </div>
          </div>

          {/* Label décision */}
          {voteResult.label && (
            <div style={{
              fontFamily: MONO, fontSize: '0.50rem', color: 'rgba(200,215,240,0.80)',
              lineHeight: 1.65, padding: '0.5rem 0.75rem',
              background: 'rgba(14,20,36,0.60)', borderRadius: '2px',
              border: '1px solid rgba(90,110,160,0.12)',
            }}>
              {voteResult.label}
            </div>
          )}

          {/* Impacts stats */}
          {(voteResult.impact?.satisfaction !== undefined || voteResult.impact?.aria_current_delta !== undefined) && (
            <div>
              <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.16em', color: 'rgba(140,160,200,0.45)', marginBottom: '0.4rem' }}>
                IMPLICATIONS — CHANGEMENTS D'ÉTAT
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {voteResult.impact?.satisfaction !== 0 && voteResult.impact?.satisfaction !== undefined && (
                  <ImpactPill label="SATISFACTION" delta={voteResult.impact.satisfaction} />
                )}
                {voteResult.impact?.aria_current_delta !== 0 && voteResult.impact?.aria_current_delta !== undefined && (
                  <ImpactPill label="ADHÉSION ARIA" delta={voteResult.impact.aria_current_delta} />
                )}
              </div>
              {/* Texte conséquences */}
              {presidence?.synthese && (
                <p style={{ fontFamily: MONO, fontSize: '0.46rem', color: 'rgba(140,160,200,0.60)', lineHeight: 1.6, margin: '0.5rem 0 0', fontStyle: 'italic' }}>
                  {isOui
                    ? presidence.synthese.position_phare_resume
                    : presidence.synthese.position_boussole_resume}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={S.modalFooter}>
          <button style={S.saveBtn} onClick={onClose}>OK — CONTINUER</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  POPUP CONFIRMATION CHANGEMENT DE CYCLE
//  3 cas :
//  A) 1 pays, aucune question → "Rien ne s'est passé. Sûr ?"
//  B) Multi-pays, certains sans conseil → liste les pays manquants
//  C) Normal → liste les décisions prises ce cycle
// ─────────────────────────────────────────────────────────────────────────────
function CycleConfirmModal({ countries, councilHistory, onConfirm, onClose }) {
  const MONO  = "'JetBrains Mono', monospace";
  const SERIF = "'Cinzel', serif";

  // councilHistory = tableau de { countryId, countryNom, countryEmoji, question, vote, label }
  const withCouncil = councilHistory.filter(h => h.vote);
  const allCountryIds = countries.map(c => c.id);
  const councilledIds = new Set(withCouncil.map(h => h.countryId));
  const uncounselled  = countries.filter(c => !councilledIds.has(c.id));

  const isEmpty = withCouncil.length === 0;
  const isSingle = countries.length === 1;

  // Cas A : un seul pays, rien
  const caseA = isSingle && isEmpty;
  // Cas B : multi pays, certains sans conseil
  const caseB = !isSingle && uncounselled.length > 0;
  // Cas C : normal (peut avoir des pays sans conseil aussi)

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: '480px', maxHeight: '85vh', overflowY: 'auto' }}
           onClick={e => e.stopPropagation()}>

        <div style={S.modalHeader}>
          <span style={S.modalTitle}>⏭ CHANGEMENT DE CYCLE</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '0.9rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Cas A — rien ne s'est passé */}
          {caseA && (
            <div style={{
              padding: '0.7rem 0.85rem',
              background: 'rgba(200,120,48,0.07)', border: '1px solid rgba(200,120,48,0.22)',
              borderRadius: '2px',
            }}>
              <div style={{ fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(200,120,48,0.75)', marginBottom: '0.3rem' }}>
                ⚠ AUCUN CONSEIL CE CYCLE
              </div>
              <p style={{ fontFamily: MONO, fontSize: '0.50rem', color: 'rgba(200,215,240,0.70)', lineHeight: 1.6, margin: 0 }}>
                Aucune question n'a été soumise au Conseil. Le cycle avancera sans qu'aucune décision collective n'ait été prise.
              </p>
            </div>
          )}

          {/* Cas B — pays sans conseil */}
          {caseB && (
            <div style={{
              padding: '0.65rem 0.85rem',
              background: 'rgba(200,120,48,0.06)', border: '1px solid rgba(200,120,48,0.18)',
              borderRadius: '2px',
            }}>
              <div style={{ fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(200,120,48,0.70)', marginBottom: '0.4rem' }}>
                ⚠ PAYS SANS DÉLIBÉRATION
              </div>
              {uncounselled.map(c => (
                <div key={c.id} style={{
                  fontFamily: MONO, fontSize: '0.48rem', color: 'rgba(200,215,240,0.55)',
                  padding: '0.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  <span>{c.emoji}</span>
                  <span style={{ color: 'rgba(200,215,240,0.75)' }}>{c.nom}</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(140,160,200,0.40)', fontSize: '0.42rem' }}>aucun conseil ce cycle</span>
                </div>
              ))}
            </div>
          )}

          {/* Décisions prises */}
          {withCouncil.length > 0 && (
            <div>
              <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.18em', color: 'rgba(200,164,74,0.45)', marginBottom: '0.5rem' }}>
                DÉCISIONS PRISES CE CYCLE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {withCouncil.map((h, i) => (
                  <div key={i} style={{
                    padding: '0.55rem 0.75rem',
                    background: 'rgba(14,20,36,0.55)', border: '1px solid rgba(200,164,74,0.10)',
                    borderRadius: '2px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{h.countryEmoji}</span>
                      <span style={{ fontFamily: MONO, fontSize: '0.42rem', letterSpacing: '0.10em', color: 'rgba(200,164,74,0.65)' }}>
                        {h.countryNom}
                      </span>
                      <span style={{
                        marginLeft: 'auto', fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.10em',
                        padding: '0.1rem 0.35rem', borderRadius: '2px',
                        background: h.vote === 'oui' ? 'rgba(58,191,122,0.12)' : 'rgba(200,80,80,0.10)',
                        border: `1px solid ${h.vote === 'oui' ? 'rgba(58,191,122,0.30)' : 'rgba(200,80,80,0.28)'}`,
                        color: h.vote === 'oui' ? 'rgba(58,191,122,0.85)' : 'rgba(200,80,80,0.80)',
                      }}>
                        {h.vote === 'oui' ? '✓ OUI' : '✕ NON'}
                      </span>
                    </div>
                    <p style={{ fontFamily: MONO, fontSize: '0.46rem', color: 'rgba(180,200,230,0.60)', lineHeight: 1.55, margin: '0 0 0.2rem', fontStyle: 'italic' }}>
                      « {h.question} »
                    </p>
                    {h.label && (
                      <p style={{ fontFamily: MONO, fontSize: '0.44rem', color: 'rgba(140,160,200,0.50)', lineHeight: 1.5, margin: 0 }}>
                        → {h.label}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question confirmation */}
          <p style={{ fontFamily: MONO, fontSize: '0.50rem', color: 'rgba(200,215,240,0.55)', lineHeight: 1.6, margin: 0 }}>
            Confirmer le passage au cycle suivant ?
          </p>

        </div>

        <div style={S.modalFooter}>
          <button style={S.cancelBtn} onClick={onClose}>ANNULER</button>
          <button style={S.saveBtn} onClick={onConfirm}>CONFIRMER LE CYCLE ⏭</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  POPUP AJOUT PAYS FICTIF
// ─────────────────────────────────────────────────────────────────────────────
function AddCountryModal({ onConfirm, onClose }) {
  const MONO  = "'JetBrains Mono', monospace";
  const [nom,     setNom]     = useState('');
  const [terrain, setTerrain] = useState('coastal');
  const [regime,  setRegime]  = useState('democratie_liberale');

  const TERRAIN_OPTS = [
    ['coastal','Côtier'],['inland','Continental'],['highland','Montagneux'],
    ['island','Île'],['archipelago','Archipel'],['desert','Désert'],
    ['foret','Forêt'],['tropical','Tropical'],['toundra','Toundra'],
  ];
  const REGIME_OPTS = [
    ['democratie_liberale','Démocratie libérale'],['republique_federale','République fédérale'],
    ['monarchie_constitutionnelle','Monarchie constitutionnelle'],['democratie_directe','Démocratie directe'],
    ['technocratie','Technocratie'],['oligarchie','Oligarchie'],
    ['junte_militaire','Junte militaire'],['regime_autoritaire','Régime autoritaire'],
    ['monarchie_absolue','Monarchie absolue'],['theocracie','Théocratie'],
  ];

  const ARIA_EST = { democratie_liberale:48, republique_federale:44, monarchie_constitutionnelle:38, democratie_directe:52, technocratie:65, oligarchie:26, junte_militaire:16, regime_autoritaire:20, monarchie_absolue:28, theocracie:18 };
  const POP_EST  = { coastal:8e6, inland:5e6, highland:3.5e6, island:2e6, archipelago:1.5e6, desert:2.5e6, foret:4e6, tropical:6e6, toundra:1.5e6 };
  const SAT_EST  = { democratie_liberale:62, republique_federale:58, monarchie_constitutionnelle:55, democratie_directe:65, technocratie:60, oligarchie:40, junte_militaire:35, regime_autoritaire:38, monarchie_absolue:48, theocracie:50 };

  const irl = ARIA_EST[regime] ?? 35;
  const pop = POP_EST[terrain] ?? 5e6;
  const sat = SAT_EST[regime]  ?? 50;
  const irlCol = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';

  const fieldStyle = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,164,74,0.20)',
    borderRadius: '2px', padding: '0.45rem 0.65rem',
    color: 'rgba(220,228,240,0.85)', fontFamily: MONO, fontSize: '0.54rem',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: '420px' }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={{ ...S.modalTitle, color: 'rgba(58,191,122,0.80)' }}>🌍 NOUVELLE NATION FICTIVE</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>

          {/* Nom */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(200,164,74,0.50)', marginBottom: '0.3rem' }}>NOM</div>
            <input
              style={fieldStyle}
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Ex : Arvalia, Morvaine, Zephoria…"
              autoFocus
            />
          </div>

          {/* Terrain + Régime */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(200,164,74,0.50)', marginBottom: '0.3rem' }}>TERRAIN</div>
              <select style={{ ...fieldStyle, fontSize: '0.48rem' }} value={terrain} onChange={e => setTerrain(e.target.value)}>
                {TERRAIN_OPTS.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(200,164,74,0.50)', marginBottom: '0.3rem' }}>RÉGIME</div>
              <select style={{ ...fieldStyle, fontSize: '0.48rem' }} value={regime} onChange={e => setRegime(e.target.value)}>
                {REGIME_OPTS.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Estimations */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', padding: '0.4rem 0.6rem', background: 'rgba(58,191,122,0.04)', borderLeft: '2px solid rgba(58,191,122,0.18)', borderRadius: '2px' }}>
            <span style={{ fontFamily: MONO, fontSize: '0.42rem', color: 'rgba(140,160,200,0.55)' }}>👥 ~{(pop/1e6).toFixed(1)} M hab.</span>
            <span style={{ fontFamily: MONO, fontSize: '0.42rem', color: 'rgba(140,160,200,0.55)' }}>😊 ~{sat}% sat.</span>
            <span style={{ fontFamily: MONO, fontSize: '0.42rem', color: irlCol }}>◈ ARIA IRL ~{irl}%</span>
          </div>
        </div>

        <div style={S.modalFooter}>
          <button style={S.cancelBtn} onClick={onClose}>ANNULER</button>
          <button
            style={{ ...S.saveBtn, opacity: nom.trim() ? 1 : 0.35, color: 'rgba(58,191,122,0.88)', borderColor: 'rgba(58,191,122,0.40)', background: nom.trim() ? 'rgba(58,191,122,0.10)' : 'transparent' }}
            disabled={!nom.trim()}
            onClick={() => nom.trim() && onConfirm({ nom: nom.trim(), terrain, regime })}
          >
            🌍 CRÉER LA NATION
          </button>
        </div>
      </div>
    </div>
  );
}
function ImpactPill({ label, delta }) {
  if (delta === undefined || delta === null || delta === 0) return null;
  const pos = delta > 0;
  const c = pos ? 'rgba(58,191,122,0.88)' : 'rgba(200,80,80,0.85)';
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: '0.44rem',
      color: 'rgba(140,160,200,0.60)',
      display: 'flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.32rem 0.6rem',
      background: `${c}0A`, border: `1px solid ${c}22`, borderRadius: '2px',
    }}>
      <span>{label}</span>
      <span style={{ color: c, fontWeight: 700 }}>{pos ? '+' : ''}{delta}</span>
    </div>
  );
}
import {
  useARIA,
  PAYS_LOCAUX,
  REGIMES,
  getHumeur,
} from './Dashboard_p1';
import { MapSVG } from './Dashboard_p2';
import ConstitutionModal from './ConstitutionModal';
import LLMCouncil from './LLMCouncil';
import {
  routeQuestion,
  runMinisterePhase,
  runCerclePhase,
  runPresidencePhase,
  computeVoteImpact,
  MINISTRIES_LIST,
} from './llmCouncilEngine';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES UI
// ─────────────────────────────────────────────────────────────────────────────

const TAB_ICONS = { map: '🗺', council: '⚖', timeline: '📜' };

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : NOTIFICATION TOAST
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ notification }) {
  if (!notification) return null;
  const colors = {
    ok:   'rgba(58,191,122,0.85)',
    warn: 'rgba(200,120,48,0.85)',
    info: 'rgba(74,126,200,0.85)',
    err:  'rgba(200,58,58,0.85)',
  };
  return (
    <div style={{
      position: 'absolute', bottom: '1.2rem', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(8,14,26,0.94)',
      border: `1px solid ${colors[notification.type] || colors.info}`,
      borderRadius: '2px',
      padding: '0.45rem 1rem',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.52rem', letterSpacing: '0.09em',
      color: colors[notification.type] || colors.info,
      zIndex: 800, pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: `0 0 20px ${colors[notification.type] || colors.info}33`,
    }}>
      {notification.message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTE : CouncilView remplacée par LLMCouncil (./LLMCouncil.jsx)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : VUE CHRONOLOG (onglet CHRONOLOG)
// ─────────────────────────────────────────────────────────────────────────────

// ChronologView importé depuis ./ChronologView.jsx

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : MODALE SÉCESSION
// ─────────────────────────────────────────────────────────────────────────────

function SecessionModal({ parent, onConfirm, onClose }) {
  const [nom,      setNom]      = useState('');
  const [relation, setRelation] = useState('Tension');
  const [regime,   setRegime]   = useState(parent?.regime || 'republique_federale');

  const REGIME_LIST = [
    { value:'democratie_liberale',       label:'Démocratie Libérale 🗳️' },
    { value:'republique_federale',       label:'République Fédérale 🏛️' },
    { value:'monarchie_constitutionnelle',label:'Monarchie Const. 👑' },
    { value:'technocratie_ia',           label:'Technocratie IA 🤖' },
    { value:'oligarchie',                label:'Oligarchie 💼' },
    { value:'junte_militaire',           label:'Junte Militaire ⚔️' },
    { value:'regime_autoritaire',        label:'Autoritaire 🔒' },
    { value:'theocracie',                label:'Théocratie ✝️' },
  ];

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={S.modalTitle}>✂️ SÉCESSION — {parent?.nom}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <p style={S.modalHint}>
            Le nouveau pays hérite de 25% de la population et des ressources.
            {parent?.nom} perd 25% de sa population et 12% de sa taille.
          </p>
          <label style={S.fieldLabel}>NOM DU NOUVEAU PAYS</label>
          <input
            style={S.fieldInput}
            value={nom}
            onChange={e => setNom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && nom.trim() && onConfirm(nom.trim(), relation, regime)}
            placeholder="Ex : République du Levant…"
            autoFocus
          />
          <label style={S.fieldLabel}>RÉGIME POLITIQUE</label>
          <select
            style={{
              background:'rgba(8,13,22,0.95)', border:'1px solid rgba(200,164,74,0.18)',
              color:'rgba(200,215,240,0.80)', fontFamily:"'JetBrains Mono',monospace",
              fontSize:'0.52rem', padding:'0.4rem 0.6rem', borderRadius:'2px',
              outline:'none', cursor:'pointer',
            }}
            value={regime}
            onChange={e => setRegime(e.target.value)}
          >
            {REGIME_LIST.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <label style={S.fieldLabel}>RELATION INITIALE AVEC {parent?.nom?.toUpperCase()}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Alliance', 'Tension', 'Neutre'].map(r => (
              <button
                key={r}
                style={{ ...S.relBtn, ...(relation === r ? S.relBtnActive : {}) }}
                onClick={() => setRelation(r)}
              >
                {r === 'Alliance' ? '🤝' : r === 'Tension' ? '⚡' : '○'} {r}
              </button>
            ))}
          </div>
        </div>
        <div style={S.modalFooter}>
          <button style={S.cancelBtn} onClick={onClose}>Annuler</button>
          <button
            style={{ ...S.saveBtn, opacity: nom.trim() ? 1 : 0.4 }}
            disabled={!nom.trim()}
            onClick={() => onConfirm(nom.trim(), relation, regime)}
          >
            ✂ Déclarer la sécession
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : MODALE DIPLOMATIE
// ─────────────────────────────────────────────────────────────────────────────

function DiplomacyModal({ sourceCountry, allCountries, alliances, onSetRelation, onClose }) {
  const others = allCountries.filter(c => c.id !== sourceCountry.id);

  const getCurrentRelation = (otherId) => {
    const a = alliances.find(
      x => (x.a === sourceCountry.id && x.b === otherId) ||
           (x.b === sourceCountry.id && x.a === otherId)
    );
    return a?.type || 'Neutre';
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: '460px' }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={S.modalTitle}>🤝 DIPLOMATIE — {sourceCountry?.nom}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '55vh', overflowY: 'auto' }}>
          {others.length === 0 && (
            <p style={S.modalHint}>Aucun autre pays dans le monde.</p>
          )}
          {others.map(other => {
            const current = getCurrentRelation(other.id);
            return (
              <div key={other.id} style={S.diploRow}>
                <span style={S.diploNom}>{other.emoji} {other.nom}</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['Alliance', 'Neutre', 'Tension'].map(type => (
                    <button
                      key={type}
                      style={{
                        ...S.relBtn,
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.48rem',
                        ...(current === type ? S.relBtnActive : {}),
                      }}
                      onClick={() => onSetRelation(sourceCountry.id, other.id, type)}
                    >
                      {type === 'Alliance' ? '🤝' : type === 'Tension' ? '⚡' : '○'}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={S.modalFooter}>
          <button style={S.saveBtn} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL : Dashboard
//  Remplace le stub dans Dashboard_p1.jsx
//  Dans App.jsx : import Dashboard from './Dashboard_p3'
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ selectedCountry, setSelectedCountry, isCrisis, activeTab, onGoToCouncil, onReady, onReset, onCountriesUpdate }) {
  const aria = useARIA({ setSelectedCountry, isCrisis, onReset });
  const { pushEvent, pushCycleStats, closeCycle, resetChronolog } = useChronolog();

  // Numéro de cycle courant — incrémenté à chaque confirmation de cycle
  const cycleNumRef = useRef(1);

  // ── Modales ──
  const [modalSecession,    setModalSecession]    = useState(false);
  const [modalDiplomacy,    setModalDiplomacy]    = useState(false);
  const [modalConstitution, setModalConstitution] = useState(false);
  const [modalVoteResult,   setModalVoteResult]   = useState(false);
  const [modalCycleConfirm, setModalCycleConfirm] = useState(false);
  const [modalAddCountry,   setModalAddCountry]   = useState(false);

  // Historique des décisions du cycle courant (réinitialisé à chaque cycle)
  const [cycleHistory, setCycleHistory] = useState([]); // [{countryId, countryNom, countryEmoji, question, vote, label}]

  // ── Conseil LLM ──
  const [councilSession,  setCouncilSession]  = useState(null);
  const [councilRunning,  setCouncilRunning]  = useState(false);

  // ── Handlers modales ──
  const openSecession    = () => setModalSecession(true);
  const openDiplomacy    = () => setModalDiplomacy(true);
  const openConstitution = () => setModalConstitution(true);

  const handleSecessionConfirm = useCallback(async (nom, relation, regime) => {
    setModalSecession(false);
    if (!selectedCountry) return;

    // Snapshot avant sécession pour le log
    const parent = selectedCountry;
    await aria.doSecession(selectedCountry.id, nom, relation, regime);

    pushEvent(cycleNumRef.current, parent.annee || 2026, {
      type:         'secession',
      countryId:    parent.id,
      countryNom:   parent.nom,
      countryEmoji: parent.emoji,
      parentNom:    parent.nom,
      parentEmoji:  parent.emoji,
      childNom:     nom,
      childEmoji:   '🆕',
      relation,
      popTransmise: 25,
      narratif:     `${nom} fait sécession de ${parent.nom}. Relation établie : ${relation}.`,
    });
  }, [selectedCountry, aria, pushEvent, cycleNumRef]);

  const handleConstitutionSave = useCallback((updatedCountry) => {
    aria.setCountries(prev =>
      prev.map(c => c.id === updatedCountry.id ? updatedCountry : c)
    );
    if (selectedCountry?.id === updatedCountry.id) {
      setSelectedCountry(updatedCountry);
    }

    // ── Chronolog constitution ─────────────────────────────────────────────
    const diff = updatedCountry._constitutionDiff || {};
    const hasChange = diff.regimeAvant !== diff.regimeApres
      || diff.presidenceAvant !== diff.presidenceApres
      || diff.leaderAvant !== diff.leaderApres
      || diff.ministresDiff?.ajoutes?.length > 0
      || diff.ministresDiff?.retires?.length > 0;

    if (hasChange) {
      const parts = [];
      if (diff.regimeAvant !== diff.regimeApres)       parts.push(`Régime → ${diff.regimeApres.replace(/_/g,' ')}`);
      if (diff.presidenceAvant !== diff.presidenceApres) parts.push(`Présidence → ${diff.presidenceApres}`);
      if (diff.leaderAvant !== diff.leaderApres && diff.leaderApres) parts.push(`Chef d'État → ${diff.leaderApres}`);
      if (diff.ministresDiff?.ajoutes?.length)  parts.push(`+${diff.ministresDiff.ajoutes.join(',')}`);
      if (diff.ministresDiff?.retires?.length)  parts.push(`-${diff.ministresDiff.retires.join(',')}`);

      pushEvent(cycleNumRef.current, updatedCountry.annee || 2026, {
        type:         'constitution',
        countryId:    updatedCountry.id,
        countryNom:   updatedCountry.nom,
        countryEmoji: updatedCountry.emoji,
        regimeAvant:      diff.regimeAvant,
        regimeApres:      diff.regimeApres,
        presidenceAvant:  diff.presidenceAvant,
        presidenceApres:  diff.presidenceApres,
        leaderAvant:      diff.leaderAvant,
        leaderApres:      diff.leaderApres,
        ministresDiff:    diff.ministresDiff || { ajoutes:[], retires:[] },
        promptsModifies:  diff.promptsModifies || 0,
        narratif: parts.join(' · '),
      });
    }
  }, [aria, selectedCountry, setSelectedCountry, pushEvent, cycleNumRef]);

  // ── Délibération Council ──────────────────────────────────────────────────
  const handleSubmitQuestion = useCallback(async (question, ministryId) => {
    if (!selectedCountry || councilRunning) return;
    setCouncilRunning(true);

    // Routing → ministère
    const resolvedId = await routeQuestion(question, ministryId);
    const ministry   = resolvedId ? MINISTRIES_LIST.find(m => m.id === resolvedId) : null;

    // Phase 0 : question visible immédiatement
    setCouncilSession({ question, ministryId: resolvedId });

    try {
      // Phase 1 : ministère (ou fallback orphelin)
      const ministereResult = await runMinisterePhase(ministry, question, selectedCountry);
      setCouncilSession(prev => ({ ...prev, ministere: ministereResult }));

      // Phase 2 : cercle
      const cercleResult = await runCerclePhase(resolvedId, question, ministereResult.synthese, selectedCountry);
      setCouncilSession(prev => ({ ...prev, cercle: cercleResult }));

      // Phase 3 : présidence
      const presidenceResult = await runPresidencePhase(question, ministereResult, cercleResult, selectedCountry);
      setCouncilSession(prev => ({ ...prev, presidence: presidenceResult, voteReady: true }));

    } catch (e) {
      console.warn('[ARIA Council]', e);
    } finally {
      setCouncilRunning(false);
    }
  }, [selectedCountry, councilRunning]);

  // ── Vote du peuple ────────────────────────────────────────────────────────
  const handleVote = useCallback((vote) => {
    if (!councilSession?.presidence || !selectedCountry) return;
    const impact = computeVoteImpact(vote, councilSession.presidence, selectedCountry);

    // Distribution simulée biaisée vers le choix du joueur
    const total     = Math.max(Math.round(selectedCountry.population / 1_000_000 * 10) * 10_000, 500_000);
    const bias      = vote === 'oui' ? 0.55 + Math.random() * 0.25 : 0.55 + Math.random() * 0.20;
    const ouiVotes  = vote === 'oui' ? Math.round(total * bias) : Math.round(total * (1 - bias));
    const nonVotes  = total - ouiVotes;

    const voteResult = {
      vote,
      label:  impact.label,
      impact: {
        satisfaction:       impact.satisfaction,
        aria_current_delta: impact.aria_current - (selectedCountry.aria_current ?? 40),
      },
      oui: ouiVotes,
      non: nonVotes,
    };

    setCouncilSession(prev => ({ ...prev, voteResult, voteReady: false }));

    // ── Persistance chronolog ─────────────────────────────────────────────
    const resolvedQuestion = councilSession.presidence?.synthese?.question_referendum || councilSession.question;
    const ministry = councilSession.ministryId ? MINISTRIES_LIST.find(m => m.id === councilSession.ministryId) : null;

    // Extraire les synthèses textuelles (tronquées à 250 cars dans useChronolog)
    // Question : toujours la vraie question du joueur, pas question_referendum
    const originalQuestion = councilSession.question || '';

    const synthMin = (() => {
      const s = councilSession.ministere?.synthese;
      if (!s) return '';
      return s.synthese_debat || s.recommandation || s.analyse || s.position || '';
    })();

    const synthPres = (() => {
      const s = councilSession.presidence?.synthese;
      if (!s) return '';
      // Éviter le champ question_referendum qui contient "Option A / Option B"
      return s.decision_recommandee
        || s.synthese_debat
        || s.analyse
        || (s.position_phare_resume && s.position_boussole_resume
            ? `Phare : ${s.position_phare_resume} / Boussole : ${s.position_boussole_resume}`
            : s.position_phare_resume || s.position_boussole_resume || s.enjeu_principal || '');
    })();

    pushEvent(cycleNumRef.current, selectedCountry.annee || 2026, {
      type:         'vote',
      countryId:    selectedCountry.id,
      countryNom:   selectedCountry.nom,
      countryEmoji: selectedCountry.emoji,
      ministereId:  councilSession.ministryId || '',
      ministereNom: ministry?.name || '',
      question:     originalQuestion,
      syntheseMinistere:  synthMin,
      synthesePresidence: synthPres,
      vote,
      label:        impact.label,
      impacts: {
        satisfaction: impact.satisfaction,
        aria_delta:   impact.aria_current - (selectedCountry.aria_current ?? 40),
      },
      voteCounts: { oui: ouiVotes, non: nonVotes },
    });

    // Historique cycle courant (pour CycleConfirmModal + live ChronologView)
    const liveEntry = {
      type:         'vote',
      countryId:    selectedCountry.id,
      countryNom:   selectedCountry.nom,
      countryEmoji: selectedCountry.emoji,
      ministereId:  councilSession.ministryId || '',
      ministereNom: ministry?.name || '',
      question:     originalQuestion,
      syntheseMinistere:  synthMin,
      synthesePresidence: synthPres,
      vote,
      label:        impact.label,
      impacts: {
        satisfaction: impact.satisfaction,
        aria_delta:   impact.aria_current - (selectedCountry.aria_current ?? 40),
      },
      voteCounts: { oui: ouiVotes, non: nonVotes },
    };
    setCycleHistory(prev => [
      ...prev.filter(h => !(h.type === 'vote' && h.countryId === selectedCountry.id && h.ministereId === liveEntry.ministereId)),
      liveEntry,
    ]);

    aria.setCountries(prev => prev.map(c => c.id !== selectedCountry.id ? c : {
      ...c,
      satisfaction: Math.max(5, Math.min(99, c.satisfaction + impact.satisfaction)),
      aria_current: Math.max(5, Math.min(95, impact.aria_current)),
    }));

    setSelectedCountry(prev => prev ? {
      ...prev,
      satisfaction: Math.max(5, Math.min(99, prev.satisfaction + impact.satisfaction)),
      aria_current: Math.max(5, Math.min(95, impact.aria_current)),
    } : prev);

    // Ouvrir le popup résultat
    setModalVoteResult(true);

  }, [councilSession, selectedCountry, aria, pushEvent, cycleNumRef]);

  // Expose les fonctions du moteur au parent (App.jsx) dès que le hook est prêt
  useEffect(() => {
    onReady?.({
      startLocal:          aria.startLocal,
      startWithAI:         aria.startWithAI,
      advanceCycle:        aria.advanceCycle,
      doSecession:         aria.doSecession,
      addFictionalCountry: aria.addFictionalCountry,
      openSecession:       openSecession,
      openConstitution:    openConstitution,
      openCyclePopup:      () => {
        if (aria.countries?.length > 0) setModalCycleConfirm(true);
      },
      resetWorld:       aria.resetWorld,
      getYear:          aria.getYear,
      getCountries:     aria.getCountries,
      getCycle:         aria.getCycle,
      submitQuestion:   handleSubmitQuestion,
    });
  }, [aria.startLocal, aria.advanceCycle, onReady, handleSubmitQuestion, openConstitution, openSecession]);

  // Notifie App chaque fois que la liste de pays change (pour date/cycle dans topbar)
  // + synchronise le pays sélectionné avec ses nouvelles valeurs (cycle, sécession…)
  useEffect(() => {
    if (!aria.countries?.length) return;
    onCountriesUpdate?.(aria.countries);
    // Mise à jour du panel latéral si un pays est sélectionné
    if (selectedCountry) {
      const fresh = aria.countries.find(c => c.id === selectedCountry.id);
      if (fresh) setSelectedCountry(fresh);
    }
  }, [aria.countries]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  //  Rendu selon onglet actif
  // ─────────────────────────────────────────────────────────────────────────

  const renderMainContent = () => {
    if (activeTab === 'council') {
      return (
        <LLMCouncil
          session={councilSession}
          onVote={handleVote}
          isRunning={councilRunning}
        />
      );
    }
    if (activeTab === 'timeline') {
      return (
        <ChronologView
          countries={aria.countries}
          currentCycleNum={cycleNumRef.current}
          currentCycleAnnee={aria.countries[0]?.annee ?? 2026}
          currentEvents={cycleHistory}
        />
      );
    }

    // Onglet MAP (défaut)
    return (
      <MapSVG
        worldData={aria.worldData}
        countries={aria.countries}
        alliances={aria.alliances}
        selectedCountry={selectedCountry}
        onCountryClick={(c) => setSelectedCountry(prev => prev?.id === c.id ? null : c)}
        onCountryHover={() => {}}
      />
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* ── Écran chargement IA (génération monde en ligne) ── */}
      {aria.aiRunning && !aria.countries?.length && (
        <div style={{
          position:'absolute', inset:0, zIndex:999,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:'1.4rem', background:'#0B0E14',
        }}>
          <div style={{
            fontFamily:"'JetBrains Mono', monospace",
            fontSize:'1.8rem', letterSpacing:'0.25em', color:'rgba(200,164,74,0.85)',
          }}>ARIA</div>
          <div style={{
            fontFamily:"'JetBrains Mono', monospace",
            fontSize:'0.58rem', letterSpacing:'0.18em', color:'rgba(200,164,74,0.65)',
            animation:'pulse 1.2s ease-in-out infinite',
          }}>GÉNÉRATION DU MONDE EN COURS…</div>
          <div style={{
            width:'260px', height:'2px', background:'rgba(255,255,255,0.06)',
            borderRadius:'1px', overflow:'hidden',
          }}>
            <div style={{
              height:'100%', background:'rgba(200,164,74,0.5)',
              animation:'loading-slide 1.6s ease-in-out infinite',
              width:'60%',
            }} />
          </div>
          <div style={{
            fontFamily:"'JetBrains Mono', monospace",
            fontSize:'0.43rem', color:'rgba(120,140,175,0.50)', letterSpacing:'0.12em',
          }}>CONSULTATION DES ARCHIVES MONDIALES…</div>
          <style>{`
            @keyframes loading-slide {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
          `}</style>
        </div>
      )}

      {/* ── Contenu principal (carte ou vues) ── */}
      {renderMainContent()}

      {/* ── Toast notifications ── */}
      <Toast notification={aria.notification} />

      {/* ── Indicateur chargement IA ── */}
      {aria.aiRunning && (
        <div style={S.aiLoader}>
          <span style={S.aiLoaderDot} />
          DÉLIBÉRATION EN COURS…
        </div>
      )}

      {/* ── Boutons d'action flottants — masqués en mode council ── */}
      {activeTab !== 'council' && (
        <div style={S.fabGroup}>
          <button
            style={S.fabBtn}
            title="Avancer de 5 ans"
            onClick={() => { if (aria.countries?.length > 0) setModalCycleConfirm(true); }}
            disabled={!aria.countries?.length || aria.aiRunning}
          >
            ⏭
          </button>

          {/* Icône + pays fictif — visible quand AUCUN pays sélectionné */}
          {!selectedCountry && aria.countries?.length > 0 && (
            <button
              style={{ ...S.fabBtn, borderColor: 'rgba(58,191,122,0.38)', color: 'rgba(58,191,122,0.75)', background: 'rgba(58,191,122,0.06)' }}
              title="Ajouter une nation fictive"
              onClick={() => setModalAddCountry(true)}
            >
              🌍
            </button>
          )}

          {selectedCountry && (
            <>
              <button
                style={{ ...S.fabBtn, borderColor: 'rgba(200,164,74,0.40)', color: 'rgba(200,164,74,0.80)', background: 'rgba(200,164,74,0.07)' }}
                title="Ouvrir le Conseil de délibération"
                onClick={() => onGoToCouncil?.()}
              >
                ⚖️
              </button>
              <button style={S.fabBtn} title="Diplomatie" onClick={openDiplomacy}>🤝</button>
              <button style={S.fabBtn} title="Constitution" onClick={openConstitution}>📜</button>
              <button style={{ ...S.fabBtn, ...S.fabBtnDanger }} title="Sécession" onClick={openSecession}>✂️</button>
            </>
          )}
        </div>
      )}

      {/* ── Modales — portées sur document.body pour échapper à overflow:hidden de .map-canvas ── */}
      {createPortal(
        <>
          {modalAddCountry && (
            <AddCountryModal
              onConfirm={(def) => {
                setModalAddCountry(false);
                aria.addFictionalCountry(def);
                const annee = aria.countries[0]?.annee || 2026;
                pushEvent(cycleNumRef.current, annee, {
                  type:         'new_country',
                  countryId:    null,
                  countryNom:   def.nom,
                  countryEmoji: '🌍',
                  nom:     def.nom,
                  emoji:   '🌍',
                  terrain: def.terrain,
                  regime:  def.regime,
                  annee,
                });
              }}
              onClose={() => setModalAddCountry(false)}
            />
          )}
          {modalVoteResult && councilSession?.voteResult && (
            <VoteResultModal
              session={councilSession}
              onClose={() => setModalVoteResult(false)}
            />
          )}
          {modalCycleConfirm && (
            <CycleConfirmModal
              countries={aria.countries}
              councilHistory={cycleHistory}
              onConfirm={() => {
                // Snapshot stats AVANT advanceCycle (valeurs du cycle qui se termine)
                pushCycleStats(
                  cycleNumRef.current,
                  aria.countries[0]?.annee || 2026,
                  aria.countries,
                );
                closeCycle(cycleNumRef.current);
                cycleNumRef.current += 1;
                setModalCycleConfirm(false);
                setCycleHistory([]);
                aria.advanceCycle();
              }}
              onClose={() => setModalCycleConfirm(false)}
            />
          )}
          {modalSecession && (
            <SecessionModal
              parent={selectedCountry}
              onConfirm={handleSecessionConfirm}
              onClose={() => setModalSecession(false)}
            />
          )}
          {modalDiplomacy && selectedCountry && (
            <DiplomacyModal
              sourceCountry={selectedCountry}
              allCountries={aria.countries}
              alliances={aria.alliances}
              onSetRelation={aria.setRelation}
              onClose={() => setModalDiplomacy(false)}
            />
          )}
          {modalConstitution && selectedCountry && (
            <ConstitutionModal
              country={selectedCountry}
              onSave={handleConstitutionSave}
              onClose={() => setModalConstitution(false)}
            />
          )}
        </>,
        document.body
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  RE-EXPORT de useARIA pour App.jsx
//  App.jsx peut importer { useARIA } from './Dashboard_p3' si besoin
// ─────────────────────────────────────────────────────────────────────────────
export { useARIA };

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(3px)',
  },
  modal: {
    width: '460px', maxWidth: '95vw',
    background: '#0D1117',
    border: '1px solid rgba(200,164,74,0.22)',
    borderRadius: '2px',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'JetBrains Mono', monospace",
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.65rem 1rem',
    borderBottom: '1px solid rgba(200,164,74,0.12)',
    background: 'rgba(200,164,74,0.04)',
  },
  modalTitle: {
    fontSize: '0.58rem', letterSpacing: '0.16em',
    color: 'rgba(200,164,74,0.80)', textTransform: 'uppercase',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(200,164,74,0.40)', fontSize: '0.75rem',
    padding: '0.1rem 0.3rem',
  },
  modalHint: {
    fontSize: '0.50rem', color: 'rgba(140,160,200,0.50)',
    margin: 0, lineHeight: 1.6,
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
    padding: '0.65rem 1rem',
    borderTop: '1px solid rgba(200,164,74,0.10)',
  },
  fieldLabel: {
    fontSize: '0.48rem', letterSpacing: '0.16em',
    color: 'rgba(200,164,74,0.50)', textTransform: 'uppercase',
  },
  fieldInput: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(200,164,74,0.20)',
    borderRadius: '2px',
    padding: '0.5rem 0.7rem',
    color: 'rgba(220,228,240,0.85)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.58rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  relBtn: {
    flex: 1,
    padding: '0.35rem 0.6rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '2px', cursor: 'pointer',
    fontSize: '0.52rem', letterSpacing: '0.08em',
    color: 'rgba(180,200,230,0.55)',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.15s',
  },
  relBtnActive: {
    background: 'rgba(200,164,74,0.10)',
    border: '1px solid rgba(200,164,74,0.40)',
    color: 'rgba(200,164,74,0.90)',
  },
  cancelBtn: {
    padding: '0.40rem 0.9rem',
    background: 'none',
    border: '1px solid rgba(255,255,255,0.09)',
    color: 'rgba(180,200,230,0.40)',
    fontSize: '0.50rem', letterSpacing: '0.10em',
    cursor: 'pointer', borderRadius: '2px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  saveBtn: {
    padding: '0.40rem 1rem',
    background: 'rgba(200,164,74,0.10)',
    border: '1px solid rgba(200,164,74,0.40)',
    color: 'rgba(200,164,74,0.88)',
    fontSize: '0.50rem', letterSpacing: '0.10em',
    cursor: 'pointer', borderRadius: '2px',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.15s',
  },
  diploRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.35rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  diploNom: {
    fontSize: '0.54rem', color: 'rgba(200,215,240,0.75)',
    letterSpacing: '0.06em',
  },
  emptyView: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: '0.6rem',
    userSelect: 'none',
  },
  emptyLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.52rem', letterSpacing: '0.24em',
    color: 'rgba(200,164,74,0.20)',
  },
  emptyHint: {
    fontSize: '0.50rem', color: 'rgba(90,110,150,0.50)',
    textAlign: 'center', maxWidth: 280, lineHeight: 1.6,
    margin: 0,
  },
  councilList: {
    display: 'flex', flexDirection: 'column', gap: '0.6rem',
    padding: '0.75rem', overflowY: 'auto', height: '100%',
    boxSizing: 'border-box',
  },
  councilCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(200,164,74,0.12)',
    borderRadius: '2px', padding: '0.6rem 0.75rem',
    display: 'flex', flexDirection: 'column', gap: '0.3rem',
  },
  councilCardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  councilPays: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.52rem', letterSpacing: '0.10em',
    color: 'rgba(200,164,74,0.65)',
  },
  councilSeverite: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.46rem', letterSpacing: '0.14em',
  },
  councilTitre: {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.58rem', color: 'rgba(220,228,240,0.80)',
  },
  councilNarration: {
    fontSize: '0.50rem', color: 'rgba(140,160,200,0.55)',
    margin: 0, lineHeight: 1.6,
  },
  chronoEntry: {
    display: 'grid', gridTemplateColumns: '52px 140px 1fr',
    gap: '0.5rem', alignItems: 'baseline',
    padding: '0.3rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  chronoAnnee: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.48rem', color: 'rgba(200,164,74,0.50)',
  },
  chronoPays: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.50rem', color: 'rgba(200,215,240,0.55)',
  },
  chronoTexte: {
    fontSize: '0.50rem', color: 'rgba(140,160,200,0.55)', lineHeight: 1.5,
  },
  aiLoader: {
    position: 'absolute', top: '0.75rem', left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(8,14,26,0.90)',
    border: '1px solid rgba(200,164,74,0.25)',
    borderRadius: '2px',
    padding: '0.35rem 0.9rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.48rem', letterSpacing: '0.14em',
    color: 'rgba(200,164,74,0.70)',
    zIndex: 700, pointerEvents: 'none',
  },
  aiLoaderDot: {
    display: 'inline-block', width: '6px', height: '6px',
    borderRadius: '50%', background: 'rgba(200,164,74,0.70)',
    animation: 'pulse 1s ease-in-out infinite',
  },
  fabGroup: {
    position: 'absolute', bottom: '1.2rem', right: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
    zIndex: 600,
  },
  fabBtn: {
    width: '36px', height: '36px',
    background: 'rgba(8,14,26,0.88)',
    border: '1px solid rgba(200,164,74,0.22)',
    borderRadius: '2px',
    fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(200,164,74,0.70)',
    transition: 'all 0.15s',
  },
  fabBtnDanger: {
    borderColor: 'rgba(200,58,58,0.30)',
    color: 'rgba(200,100,100,0.70)',
  },
};
