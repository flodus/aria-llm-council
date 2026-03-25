// src/Dashboard_p3.jsx

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
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from './shared/data/ariaData';
import { loadLang, t, useLocale } from './ariaI18n';
import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useChronolog } from './features/chronolog/useChronolog';
import ChronologView   from './features/chronolog/ChronologView';
import {
  useARIA,
  PAYS_LOCAUX,
  REGIMES,
  getHumeur,
  getStats,
  getApiKeys,
} from './Dashboard_p1';
import { MapSVG } from './Dashboard_p2';
import ConstitutionModal from './features/council/components/ConstitutionModal';
import CountryPanelCouncil from './features/world/components/CountryPanel/CountryPanelCouncil';
import LLMCouncil from './features/council/components/LLMCouncil';
import {
  buildCountryContext,
  MINISTRIES_LIST,
} from './features/council/services/councilEngine';
import { useCouncilSession } from './features/council/hooks/useCouncilSession';
import { GarbageModal, MismatchModal } from './features/council/components/CouncilModals';
import { C, FONT, } from './shared/theme';
import { getIaStatus } from './shared/services/iaStatusStore';

function getLocalizedNom(country) {
  if (!country?.id) return country?.nom || '';
  try {
    const lang = localStorage.getItem('aria_lang') || 'fr';
    if (lang !== 'en') return country?.nom || '';
    const enData = REAL_COUNTRIES_DATA_EN.find(r => r.id === country.id);
    return enData?.nom || country?.nom || '';
  } catch { return country?.nom || ''; }
}


// Pastille colorée affichant un delta (+N / -N) pour les impacts de vote
function ImpactPill({ label, delta }) {
  const pos = delta > 0;
  const col = pos ? 'rgba(58,191,122,0.85)' : 'rgba(200,80,80,0.85)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      background: pos ? 'rgba(58,191,122,0.10)' : 'rgba(200,80,80,0.10)',
      border: `1px solid ${pos ? 'rgba(58,191,122,0.30)' : 'rgba(200,80,80,0.30)'}`,
      borderRadius: '2px', padding: '0.15rem 0.5rem',
      fontFamily: "'JetBrains Mono',monospace", fontSize: '0.42rem', letterSpacing: '0.10em',
      color: col,
    }}>
      {label} {pos ? '+' : ''}{delta}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  POPUP RÉSULTAT DE VOTE
//  Apparaît immédiatement après que le joueur a voté.
//  Affiche : question · choix · jauge · impacts · conséquences
// ─────────────────────────────────────────────────────────────────────────────
function VoteResultModal({ session, onClose }) {
  const { lang: uiLang } = useLocale();
  const { question, voteResult, presidence } = session || {};
  if (!voteResult) return null;

  const isBinary = voteResult.voteType === 'binary';
  const isPhare = voteResult.vote === 'phare';
  const isOui = voteResult.vote === 'oui';

  // Déterminer les couleurs et labels selon le type de vote
  let vColor, vIcon, vLabel, vOptionLabel;

  if (isBinary) {
    vColor = isPhare ? C.gold : C.purple;
    vIcon = isPhare ? '☉' : '☽';
    vLabel = isPhare ? 'PHARE' : 'BOUSSOLE';
    vOptionLabel = isPhare ? '☉ PHARE' : '☽ BOUSSOLE';
  } else {
    vColor = isOui ? C.green : C.red;
    vIcon = isOui ? '✓' : '✕';
    vLabel = isOui ? 'OUI' : 'NON';
    vOptionLabel = isOui ? 'OUI — ADOPTER' : 'NON — REJETER';
  }

  // Calculs pour la jauge
  let total, pct1, pct2, label1, label2, color1, color2, grad1, grad2, val1, val2;

  if (isBinary) {
    val1 = voteResult.phare || 0;
    val2 = voteResult.boussole || 0;
    total = val1 + val2;
    pct1 = total > 0 ? Math.round((val1 / total) * 100) : 50;
    pct2 = 100 - pct1;
    label1 = '☉ PHARE';
    label2 = '☽ BOUSSOLE';
    color1 = C.gold;
    color2 = C.purple;
    grad1 = 'linear-gradient(180deg, rgb(218,182,88) 0%, rgb(138,105,28) 100%)';
    grad2 = 'linear-gradient(180deg, rgb(158,118,242) 0%, rgb(85,50,158) 100%)';
  } else {
    val1 = voteResult.oui || 0;
    val2 = voteResult.non || 0;
    total = val1 + val2;
    pct1 = total > 0 ? Math.round((val1 / total) * 100) : 50;
    pct2 = 100 - pct1;
    label1 = '✓ OUI';
    label2 = '✕ NON';
    color1 = C.green;
    color2 = C.red;
    grad1 = 'linear-gradient(180deg, rgb(72,205,140) 0%, rgb(28,118,70) 100%)';
    grad2 = 'linear-gradient(180deg, rgb(215,88,88)  0%, rgb(138,42,42) 100%)';
  }

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
    <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.18em', color: 'rgba(140,160,200,0.50)', marginBottom: '0.3rem' }}>
    QUESTION SOUMISE
    </div>
    <p style={{ fontFamily: FONT.serif, fontSize: '0.54rem', color: 'rgba(200,215,240,0.80)', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
    « {presidence?.synthese?.voteQuestion || presidence?.synthese?.question_referendum || question} »
    </p>
    </div>

    {/* Choix du joueur */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.55rem 0.75rem',
      background: `${vColor}0C`, border: `1px solid ${vColor}30`,
      borderRadius: '2px',
    }}>
    <span style={{ fontSize: '1.1rem', color: vColor }}>{vIcon}</span>
    <div>
    <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.14em', color: `${vColor}88`, marginBottom: '0.2rem' }}>
    VOTRE CHOIX
    </div>
    <div style={{ fontFamily: FONT.mono, fontSize: '0.54rem', color: vColor, letterSpacing: '0.08em' }}>
    {vOptionLabel}
    </div>
    </div>
    </div>

    {/* Jauge conditionnelle */}
    <div>
    <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.16em', color: 'rgba(140,160,200,0.45)', marginBottom: '0.4rem' }}>
    RÉSULTAT DU VOTE POPULAIRE · {fmt(total)} VOTANTS
    </div>
    <div style={{ position: 'relative', height: '24px', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(90,110,160,0.20)', background: 'rgba(0,0,0,0.3)' }}>
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: `${pct1}%`, background: grad1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'width 0.8s ease',
      fontFamily: FONT.mono, fontSize: '0.44rem', color: 'rgba(255,255,255,0.90)', fontWeight: 700,
    }}>
    {pct1 >= 12 && `${vIcon} ${pct1}%`}
    </div>
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0,
      width: `${pct2}%`, background: grad2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'width 0.8s ease',
      fontFamily: FONT.mono, fontSize: '0.44rem', color: 'rgba(255,255,255,0.90)', fontWeight: 700,
    }}>
    {pct2 >= 12 && `${isBinary ? (isPhare ? '☽' : '☉') : '✕'} ${pct2}%`}
    </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
    <span style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: color1 }}>
    {label1} · {fmt(val1)}
    </span>
    <span style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: color2 }}>
    {label2} · {fmt(val2)}
    </span>
    </div>
    </div>

    {/* Label décision */}
    {voteResult.label && (
      <div style={{
        fontFamily: FONT.mono, fontSize: '0.50rem',
        color: voteResult.chosenOption === 'phare' ? C.gold :
        voteResult.chosenOption === 'boussole' ? C.purple : vColor,
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
      <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.16em', color: 'rgba(140,160,200,0.45)', marginBottom: '0.4rem' }}>
      IMPLICATIONS — CHANGEMENTS D'ÉTAT
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {voteResult.impact?.satisfaction !== 0 && voteResult.impact?.satisfaction !== undefined && (
        <ImpactPill label="SATISFACTION" delta={voteResult.impact.satisfaction} />
      )}
      {voteResult.impact?.aria_current_delta !== 0 && voteResult.impact?.aria_current_delta !== undefined && (
        <ImpactPill label={t('COUNCIL_ADHESION', uiLang)} delta={voteResult.impact.aria_current_delta} />
      )}
      </div>
      {/* Texte conséquences */}
      {presidence?.synthese && (
        <p style={{ fontFamily: FONT.mono, fontSize: '0.46rem', color: 'rgba(140,160,200,0.60)', lineHeight: 1.6, margin: '0.5rem 0 0', fontStyle: 'italic' }}>
        {isBinary
          ? (isPhare ? presidence.synthese.position_phare_resume : presidence.synthese.position_boussole_resume)
          : (isOui ? presidence.synthese.position_phare_resume : presidence.synthese.position_boussole_resume)}
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
  const { lang: uiLang } = useLocale();
  const MONO  = "'JetBrains Mono', monospace";
  const SERIF = "'Cinzel', serif";
  const popForecasts = {}; // réservé — prévisions population par pays (non encore calculées)

  // councilHistory = tableau de { countryId, countryNom, countryEmoji, question, vote, label }
  const withCouncil = councilHistory.filter(h => h.vote);
  const allCountryIds = countries.map(c => c.id);
  const councilledIds = new Set(withCouncil.map(h => h.countryId));
  const uncounselled  = countries.filter(c => !councilledIds.has(c.id));
  const isEmpty = withCouncil.length === 0;
  // Projections passives pour tous les pays (doCycle tourne toujours)
  const cycleForecasts = countries.map(c => {
    const regime  = getStats().regimes[c.regime]  || getStats().regimes.republique_federale;
    const terrain = getStats().terrains[c.terrain] || getStats().terrains.inland;
    const natalite  = (c.tauxNatalite  ?? regime.taux_natalite  * 1000) / 1000 * 5;
    const mortalite = (c.tauxMortalite ?? regime.taux_mortalite * 1000) / 1000 * 5;
    const growthMod = terrain.modificateur_pop * regime.coeff_croissance;
    const popDelta  = Math.round(c.population * (natalite - mortalite) * growthMod);
    const ecoBase   = terrain.modificateur_eco * regime.coeff_croissance;
    const ecoRatio  = Object.values(c.ressources || {}).filter(Boolean).length / 7;
    const ecoDelta  = Math.round((ecoBase - 1) * 8 + (ecoRatio - 0.5) * 6);
    const satDrift  = Math.round(-2 * regime.coeff_satisfaction); // dérive de base hors vote
    return { id: c.id, nom: c.nom, emoji: c.emoji, popDelta, ecoDelta, satDrift };
  });
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
                {uiLang==='en'?'⚠ NO COUNCIL THIS CYCLE':'⚠ AUCUN CONSEIL CE CYCLE'}
              </div>
              <p style={{ fontFamily: MONO, fontSize: '0.50rem', color: 'rgba(200,215,240,0.70)', lineHeight: 1.6, margin: 0 }}>
                {uiLang==='en'?"No question was submitted to the Council. The cycle will advance without any collective decision.":"Aucune question n'a été soumise au Conseil. Le cycle avancera sans qu'aucune décision collective n'ait été prise."}
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
                {uiLang==='en'?'⚠ COUNTRIES WITHOUT DELIBERATION':'⚠ PAYS SANS DÉLIBÉRATION'}
              </div>
              {uncounselled.map(c => (
                <div key={c.id} style={{
                  fontFamily: MONO, fontSize: '0.48rem', color: 'rgba(200,215,240,0.55)',
                  padding: '0.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  <span>{c.emoji}</span>
                  <span style={{ color: 'rgba(200,215,240,0.75)' }}>{getLocalizedNom(c, uiLang)}</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(140,160,200,0.40)', fontSize: '0.42rem' }}>{uiLang==='en'?'no council this cycle':'aucun conseil ce cycle'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Décisions + impacts par pays */}
          {withCouncil.length > 0 && (
            <div>
              <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.18em', color: 'rgba(200,164,74,0.45)', marginBottom: '0.5rem' }}>
                {uiLang==='en'?'DECISIONS THIS CYCLE':'DÉCISIONS PRISES CE CYCLE'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {withCouncil.map((h, i) => {
                  const sat = h.impacts?.satisfaction;
                  const aria = h.impacts?.aria_delta;
                  return (
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
                        {h.vote === 'oui' ? (uiLang==='en'?'✓ YES':'✓ OUI') : (uiLang==='en'?'✕ NO':'✕ NON')}
                      </span>
                    </div>
                    <p style={{ fontFamily: MONO, fontSize: '0.46rem', color: 'rgba(180,200,230,0.60)', lineHeight: 1.55, margin: '0 0 0.25rem', fontStyle: 'italic' }}>
                      « {h.question} »
                    </p>
                    {h.label && (
                      <p style={{ fontFamily: MONO, fontSize: '0.44rem', color: 'rgba(140,160,200,0.50)', lineHeight: 1.5, margin: '0 0 0.25rem' }}>
                        → {h.label}
                      </p>
                    )}
                    {(sat !== undefined || aria !== undefined) && (
                      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'0.15rem' }}>
                        {sat !== undefined && sat !== 0 && (
                          <span style={{ fontFamily:MONO, fontSize:'0.38rem', padding:'0.08rem 0.35rem', borderRadius:'2px',
                            background: sat > 0 ? 'rgba(58,191,122,0.08)' : 'rgba(200,80,80,0.08)',
                            border:`1px solid ${sat > 0 ? 'rgba(58,191,122,0.22)' : 'rgba(200,80,80,0.22)'}`,
                            color: sat > 0 ? 'rgba(58,191,122,0.80)' : 'rgba(200,80,80,0.75)' }}>
                            {uiLang==='en'?'SAT':'SAT'} {sat > 0 ? '+' : ''}{sat}%
                          </span>
                        )}
                        {aria !== undefined && aria !== 0 && (
                          <span style={{ fontFamily:MONO, fontSize:'0.38rem', padding:'0.08rem 0.35rem', borderRadius:'2px',
                            background: aria > 0 ? 'rgba(58,191,122,0.08)' : 'rgba(200,80,80,0.08)',
                                                              border:`1px solid ${aria > 0 ? 'rgba(58,191,122,0.22)' : 'rgba(200,80,80,0.22)'}`,
                                                              color: aria > 0 ? 'rgba(58,191,122,0.80)' : 'rgba(200,80,80,0.75)' }}>
                                                              ARIA {aria > 0 ? '+' : ''}{Math.round(aria)}%
                                                              </span>
                        )}
                        {(() => {
                          const pop = popForecasts[h.countryId];
                          if (!pop) return null;
                          return (
                            <span style={{ fontFamily:MONO, fontSize:'0.38rem', padding:'0.08rem 0.35rem', borderRadius:'2px',
                              background: pop > 0 ? 'rgba(58,191,122,0.08)' : 'rgba(200,80,80,0.08)',
                                  border:`1px solid ${pop > 0 ? 'rgba(58,191,122,0.22)' : 'rgba(200,80,80,0.22)'}`,
                                  color: pop > 0 ? 'rgba(58,191,122,0.80)' : 'rgba(200,80,80,0.75)' }}>
                                  👥 {pop > 0 ? '+' : ''}{(pop/1000).toFixed(1)}k
                                  </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projections passives — tous les pays */}
          <div>
          <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.18em',
            color: 'rgba(140,160,200,0.40)', marginBottom: '0.4rem' }}>
            {uiLang==='en' ? 'PASSIVE CHANGES THIS CYCLE' : 'ÉVOLUTIONS PASSIVES CE CYCLE'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {cycleForecasts.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 0.6rem', borderRadius: '2px',
                background: 'rgba(255,255,255,0.015)',
                                      border: '1px solid rgba(255,255,255,0.05)' }}>
                                      <span style={{ fontSize: '0.85rem' }}>{f.emoji}</span>
                                      <span style={{ fontFamily: MONO, fontSize: '0.42rem',
                                        color: 'rgba(200,215,240,0.55)', flex: 1 }}>{f.nom}</span>
                                        {/* Pop */}
                                        <span style={{ fontFamily: MONO, fontSize: '0.38rem', padding: '0.06rem 0.30rem',
                                          borderRadius: '2px',
                                          background: f.popDelta >= 0 ? 'rgba(58,191,122,0.07)' : 'rgba(200,80,80,0.07)',
                                      border: `1px solid ${f.popDelta >= 0 ? 'rgba(58,191,122,0.20)' : 'rgba(200,80,80,0.20)'}`,
                                      color: f.popDelta >= 0 ? 'rgba(58,191,122,0.75)' : 'rgba(200,80,80,0.70)' }}>
                                      👥 {f.popDelta >= 0 ? '+' : ''}{(f.popDelta/1000).toFixed(1)}k
                                      </span>
                                      {/* Éco */}
                                      <span style={{ fontFamily: MONO, fontSize: '0.38rem', padding: '0.06rem 0.30rem',
                                        borderRadius: '2px',
                                        background: f.ecoDelta >= 0 ? 'rgba(58,191,122,0.07)' : 'rgba(200,80,80,0.07)',
                                      border: `1px solid ${f.ecoDelta >= 0 ? 'rgba(58,191,122,0.20)' : 'rgba(200,80,80,0.20)'}`,
                                      color: f.ecoDelta >= 0 ? 'rgba(58,191,122,0.75)' : 'rgba(200,80,80,0.70)' }}>
                                      💰 {f.ecoDelta >= 0 ? '+' : ''}{f.ecoDelta}
                                      </span>
                                      {/* Sat dérive */}
                                      <span style={{ fontFamily: MONO, fontSize: '0.38rem', padding: '0.06rem 0.30rem',
                                        borderRadius: '2px',
                                        background: f.satDrift >= 0 ? 'rgba(58,191,122,0.07)' : 'rgba(200,80,80,0.07)',
                                      border: `1px solid ${f.satDrift >= 0 ? 'rgba(58,191,122,0.20)' : 'rgba(200,80,80,0.20)'}`,
                                      color: f.satDrift >= 0 ? 'rgba(58,191,122,0.75)' : 'rgba(200,80,80,0.70)' }}>
                                      😊 {f.satDrift >= 0 ? '+' : ''}{f.satDrift}%
                                      </span>
                                      </div>
            ))}
            </div>
            </div>

            {/* Question confirmation */}
            <p style={{ fontFamily: MONO, fontSize: '0.50rem', color: 'rgba(200,215,240,0.55)', lineHeight: 1.6, margin: 0 }}>
            {uiLang==='en'?'Confirm advancement to the next cycle?':'Confirmer le passage au cycle suivant ?'}
            </p>

        </div>

        <div style={S.modalFooter}>
          <button style={S.cancelBtn} onClick={onClose}>{uiLang==='en'?'CANCEL':'ANNULER'}</button>
          <button style={S.saveBtn} onClick={onConfirm}>{uiLang==='en'?'CONFIRM CYCLE ⏭':'CONFIRMER LE CYCLE ⏭'}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  POPUP AJOUT PAYS FICTIF
// ─────────────────────────────────────────────────────────────────────────────
// ── Helpers fuzzy-match (miroir InitScreen) ──────────────────────────────────
const _p3norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const _p3lev  = (a, b) => {
  if (Math.abs(a.length-b.length) > 4) return 99;
  const dp = Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i||j));
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[a.length][b.length];
};
const _p3rcMatch = (q, name) => {
  const nq = _p3norm(q), nr = _p3norm(name);
  const parts = [nr, ...nr.split(/[\s-]+/)];
  for (const r of parts) {
    if (!r || r.length < 2) continue;
    const ratio = Math.min(nq.length,r.length)/Math.max(nq.length,r.length);
    if (nq === r) return 'found';
    if (r.startsWith(nq) && nq.length >= r.length*0.85) return 'found';
    if (nq.replace(/ou$/,'u').replace(/eau/g,'o') === r.replace(/ou$/,'u').replace(/eau/g,'o') && nq.length >= 3) return 'found';
    if (_p3lev(nq,r) <= 2 && ratio >= 0.70 && nq.length >= 3) return 'suggestion';
    const ph = s => s.replace(/ph/g,'f').replace(/qu/g,'k').replace(/w/g,'v').replace(/[aeiou]/g,'').replace(/[^a-z]/g,'');
    if (ph(nq)===ph(r) && ph(nq).length>=3 && ratio>=0.70) return 'suggestion';
  }
  return null;
};
let _p3AllCache = null;
const _p3getAllCountries = async () => {
  if (_p3AllCache) return _p3AllCache;
  try {
    const r = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,translations',
      { signal: AbortSignal.timeout(6000) });
    if (r.ok) _p3AllCache = await r.json();
  } catch(_) {}
  return _p3AllCache || [];
};
const _p3rcDisplayName = (rc, lang) =>
  lang==='fr' ? (rc.translations?.fra?.common||rc.name?.common||'') : (rc.name?.common||'');

const _p3validateCountry = async (query, lang) => {
  if (!query || query.length < 2) return { status:'notfound', displayName:null, canonicalName:null };
  const apiQuery = _p3norm(query);
  let data = [];
  try {
    const r = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(apiQuery)}?fields=name,flags,population,translations`,
      { signal: AbortSignal.timeout(4000) });
    if (r.ok) data = await r.json();
  } catch(_) { return { status:'error', displayName:null, canonicalName:null }; }

  let bestStatus = null, bestRc = null;
  for (const rc of (Array.isArray(data)?data:[]).slice(0,8)) {
    const names = [rc.name?.common,rc.name?.official,rc.translations?.fra?.common].filter(Boolean);
    for (const name of names) {
      const m = _p3rcMatch(query, name);
      if (m==='found') { bestStatus='found'; bestRc=rc; break; }
      if (m==='suggestion' && bestStatus!=='found') { bestStatus='suggestion'; bestRc=rc; }
    }
    if (bestStatus==='found') break;
  }
  if (bestStatus && bestRc)
    return { status:bestStatus, displayName:_p3rcDisplayName(bestRc,lang), canonicalName:bestRc.name?.common||query };

  // Pass 2 : fuzzy sur /all
  const all = await _p3getAllCountries();
  let bestScore=99, best2Rc=null;
  for (const rc of all) {
    const names = [rc.name?.common,rc.name?.official,rc.translations?.fra?.common].filter(Boolean);
    for (const name of names) {
      const nq=_p3norm(query), nr=_p3norm(name);
      const d=_p3lev(nq, nr.slice(0,nq.length+3));
      const ratio=Math.min(nq.length,nr.length)/Math.max(nq.length,nr.length);
      if (d<bestScore && d<=3 && ratio>=0.60 && nq.length>=3) { bestScore=d; best2Rc=rc; }
    }
  }
  if (best2Rc && bestScore<=3) {
    const names2=[best2Rc.name?.common,best2Rc.name?.official,best2Rc.translations?.fra?.common].filter(Boolean);
    let st2=null;
    for (const name of names2) { const m=_p3rcMatch(query,name); if(m&&!st2) st2=m; }
    const status=st2||(bestScore<=1?'found':'suggestion');
    return { status, displayName:_p3rcDisplayName(best2Rc,lang), canonicalName:best2Rc.name?.common||query };
  }
  return { status:'notfound', displayName:null, canonicalName:null };
};

// ── CountryInfoCard (miroir InitScreen) ──────────────────────────────────────
function P3CountryInfoCard({ data }) {
  const { lang } = useLocale();
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const fmtPop = n => n>=1e9?(n/1e9).toFixed(1)+' Md':n>=1e6?(n/1e6).toFixed(1)+' M':n>=1e3?Math.round(n/1e3)+' k':String(n);
  const ariaCol = (data.aria_acceptance_irl||0)>=60?'rgba(140,100,220,0.80)':(data.aria_acceptance_irl||0)>=40?'rgba(100,130,200,0.70)':'rgba(90,110,160,0.50)';
  const MONO = "'JetBrains Mono',monospace";
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
      <div style={{ display:'flex', gap:'0.8rem', alignItems:'flex-start' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.25rem' }}>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <span style={{ fontFamily:MONO, fontSize:'0.43rem', color:'rgba(140,160,200,0.55)' }}>POP.</span>
            <span style={{ fontFamily:MONO, fontSize:'0.46rem', color:'rgba(200,215,240,0.75)', fontWeight:600 }}>{fmtPop(data.population||0)}</span>
          </div>
          {data.pib_index && <div style={{ display:'flex', gap:'0.5rem' }}>
            <span style={{ fontFamily:MONO, fontSize:'0.43rem', color:'rgba(140,160,200,0.55)' }}>PIB</span>
            <span style={{ fontFamily:MONO, fontSize:'0.46rem', color:'rgba(200,215,240,0.75)' }}>Indice {data.pib_index}</span>
          </div>}
        </div>
        {data.aria_acceptance_irl !== undefined && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.2rem' }}>
            <div style={{ fontFamily:MONO, fontSize:'0.41rem', letterSpacing:'0.10em', color:ariaCol }}>ARIA IRL</div>
            <div style={{ fontFamily:MONO, fontSize:'0.90rem', fontWeight:700, color:ariaCol, lineHeight:1 }}>{data.aria_acceptance_irl}%</div>
            <div style={{ width:60, height:4, background:'rgba(14,20,36,0.9)', borderRadius:'2px', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${data.aria_acceptance_irl}%`, background:ariaCol, borderRadius:'2px' }} />
            </div>
          </div>
        )}
      </div>
      {data.aria_sociology_logic && (
        <div style={{ fontSize:'0.44rem', color:'rgba(120,140,180,0.55)', lineHeight:1.55, fontStyle:'italic', padding:'0.35rem 0.5rem', background:'rgba(200,164,74,0.03)', borderRadius:'2px', borderLeft:'2px solid rgba(200,164,74,0.15)' }}>
          {data.aria_sociology_logic}
        </div>
      )}
      {data.triple_combo && (
        <button onClick={() => setOpen(o=>!o)}
          style={{ background:'none', border:'1px solid rgba(90,110,160,0.20)', borderRadius:'2px', padding:'0.28rem 0.55rem', cursor:'pointer', fontFamily:MONO, fontSize:'0.42rem', color:'rgba(90,110,160,0.55)', textAlign:'left', letterSpacing:'0.08em' }}>
          {open ? (lang==='en'?'▲ Hide geopolitical context':'▲ Masquer le contexte géopolitique') : (lang==='en'?'▼ Show geopolitical context':'▼ Voir le contexte géopolitique')}
        </button>
      )}
      {open && data.triple_combo && (
        <div style={{ fontSize:'0.44rem', color:'rgba(140,160,200,0.58)', lineHeight:1.65, padding:'0.4rem 0.5rem', background:'rgba(90,110,160,0.04)', borderRadius:'2px', border:'1px solid rgba(90,110,160,0.12)' }}>
          {data.triple_combo}
        </div>
      )}
    </div>
  );
}

// ── Modal "Ajouter un pays" — unified fictif + réel (miroir exact InitScreen) ─
function AddCountryModal({ onConfirm, onClose }) {
  const { lang: uiLang } = useLocale();
  const MONO = "'JetBrains Mono', monospace";

  // Détecte le mode : en ligne = au moins une clé API dispo
  const isOnline = (() => { try { const k=getApiKeys(); return !!(k.claude||k.gemini||k.grok||k.openai); } catch{return false;} })();

  // Liste pays réels (langue courante)
  const realCountries = uiLang === 'en'
    ? REAL_COUNTRIES_DATA_EN
    : REAL_COUNTRIES_DATA;

  // ── State ─────────────────────────────────────────────────────────────────
  const [type, setType]       = useState('imaginaire'); // 'imaginaire' | 'reel'
  // Fictif
  const [nom,     setNom]     = useState('');
  const [terrain, setTerrain] = useState('coastal');
  const [regime,  setRegime]  = useState('democratie_liberale');
  // Réel offline
  const [selReal, setSelReal] = useState('');
  // Réel online
  const [rcSearch,     setRcSearch]     = useState('');
  const [rcStatus,     setRcStatus]     = useState(null); // null|'searching'|'found'|'notfound'|'suggestion'|'error'
  const [rcSuggestion, setRcSuggestion] = useState(null);
  const [rcRealData,   setRcRealData]   = useState(null); // synthèse après found
  const rcTimer   = useRef(null);
  const rcQueryRef = useRef('');

  const TERRAIN_OPTS = Object.keys(getStats().terrains || {}).map(k => [k, getTerrainLabel(k, uiLang)]);
  const REGIME_OPTS  = Object.keys(getStats().regimes  || {}).map(k => [k, getRegimeLabel(k, uiLang)]);

  // Estimations fictif — depuis simulation.json
  const { regimes: regSim, terrains: terSim } = getStats();

  // ── Validation pays réel en ligne ─────────────────────────────────────────
  const searchReal = async (query) => {
    rcQueryRef.current = query;
    if (!query || query.length < 3) { setRcStatus(null); return; }
    // 1. Check liste locale
    const local = realCountries.find(r =>
      r.nom.toLowerCase() === query.toLowerCase() || r.id === query.toLowerCase().replace(/[^a-z]/g,'')
    );
    if (local) { setRcStatus('found'); setRcRealData(local); return; }
    setRcStatus('searching');
    try {
      const ai = await _p3validateCountry(query, uiLang);
      if (rcQueryRef.current !== query) return;
      if (ai.status === 'notfound' || !ai.displayName) { setRcStatus('notfound'); return; }
      if (ai.status === 'suggestion') {
        setRcStatus('suggestion'); setRcSuggestion(ai.displayName); return;
      }
      // found → fetch drapeau/population
      const nomFinal = ai.displayName;
      let flag='🌐', population=5_000_000;
      try {
        const rc = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ai.canonicalName||nomFinal)}?fields=name,flag,population`)
          .then(r => r.ok ? r.json() : []);
        if (rc[0]) { flag=rc[0].flag||'🌐'; population=rc[0].population||5_000_000; }
      } catch(_) {}
      setRcRealData({ id:nomFinal.toLowerCase().replace(/[^a-z0-9]/g,'-'), nom:nomFinal, flag, regime:'democratie_liberale', terrain:'coastal', population, _fromApi:true });
      setRcStatus('found');
    } catch(_) { setRcStatus('error'); }
  };

  useEffect(() => {
    if (type !== 'reel' || !isOnline) return;
    setRcStatus(null); setRcSuggestion(null); setRcRealData(null);
    rcQueryRef.current = '';
    clearTimeout(rcTimer.current);
    if (!rcSearch || rcSearch.length < 3) return;
    rcTimer.current = setTimeout(() => searchReal(rcSearch), 700);
    return () => clearTimeout(rcTimer.current);
  }, [rcSearch, type]);

  // ── Validation du bouton confirmer ────────────────────────────────────────
  const canConfirm = type === 'imaginaire'
    ? nom.trim().length > 0
    : type === 'reel' && !isOnline
      ? !!selReal
      : type === 'reel' && isOnline
        ? rcStatus === 'found'
        : false;

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (type === 'imaginaire') {
      onConfirm({ type:'imaginaire', nom:nom.trim(), terrain, regime, realData:null });
    } else if (type === 'reel' && !isOnline) {
      const rc = realCountries.find(r => r.id === selReal);
      if (rc) onConfirm({ type:'reel', nom:rc.nom, terrain:rc.terrain||'coastal', regime:rc.regime||'democratie_liberale', realData:rc });
    } else if (type === 'reel' && isOnline && rcRealData) {
      onConfirm({ type:'reel', nom:rcRealData.nom, terrain:rcRealData.terrain||'coastal', regime:rcRealData.regime||'democratie_liberale', realData:rcRealData });
    }
  };

  // ── Styles communs ────────────────────────────────────────────────────────
  const fieldStyle = {
    background:'rgba(8,13,22,0.95)', border:'1px solid rgba(200,164,74,0.20)',
    borderRadius:'2px', padding:'0.45rem 0.65rem',
    color:'rgba(220,228,240,0.85)', fontFamily:MONO, fontSize:'0.54rem',
    outline:'none', width:'100%', boxSizing:'border-box',
  };
  const labelSt = { fontFamily:MONO, fontSize:'0.40rem', letterSpacing:'0.16em', color:'rgba(200,164,74,0.50)', marginBottom:'0.3rem' };

  // Couleur du toggle actif
  const activeToggle = { border:'1px solid rgba(200,164,74,0.40)', color:'rgba(200,164,74,0.88)', background:'rgba(200,164,74,0.08)' };
  const baseToggle   = { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(200,164,74,0.12)', color:'rgba(140,160,200,0.55)', borderRadius:'2px', padding:'0.30rem 0.5rem', fontFamily:MONO, fontSize:'0.48rem', cursor:'pointer', flex:1 };

  // Couleur titre
  const titleColor = type === 'reel' ? 'rgba(100,160,240,0.85)' : 'rgba(58,191,122,0.80)';
  const titleIcon  = type === 'reel' ? '🌍' : '✦';
  const titleLabel = type === 'reel'
    ? (uiLang==='en'?'ADD A REAL COUNTRY':'AJOUTER UN PAYS RÉEL')
    : (uiLang==='en'?'ADD A FICTIONAL NATION':'NOUVELLE NATION FICTIVE');

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width:'440px', maxHeight:'85vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={S.modalHeader}>
          <span style={{ ...S.modalTitle, color:titleColor }}>{titleIcon} {titleLabel}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding:'0.85rem 1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>

          {/* ── Toggle fictif / réel ── */}
          <div style={{ display:'flex', gap:'0.4rem' }}>
            {[
              { v:'imaginaire', l: isOnline ? (uiLang==='en'?'🌐 Fictional (AI)':'🌐 Fictif (IA)') : (uiLang==='en'?'🌐 Fictional':'🌐 Fictif') },
              { v:'reel',       l: isOnline ? (uiLang==='en'?'🗺 Real country (AI)':'🗺 Pays réel (IA)') : (uiLang==='en'?'🗺 Real country':'🗺 Pays réel') },
            ].map(opt => (
              <button key={opt.v}
                style={{ ...baseToggle, ...(type===opt.v ? activeToggle : {}) }}
                onClick={() => { setType(opt.v); setRcStatus(null); setRcSuggestion(null); setRcRealData(null); setRcSearch(''); setSelReal(''); }}>
                {opt.l}
              </button>
            ))}
          </div>

          {/* ══════════ PAYS FICTIF ══════════ */}
          {type === 'imaginaire' && (
            <>
              <div>
                <div style={labelSt}>NOM</div>
                <input style={fieldStyle} value={nom} autoFocus
                  onChange={e => setNom(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && canConfirm && handleConfirm()}
                  placeholder={uiLang==='en'?'Ex: Arvalia, Morvaine, Zephoria…':'Ex : Arvalia, Morvaine, Zephoria…'} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                <div>
                  <div style={labelSt}>{uiLang==='en'?'TERRAIN':'TERRAIN'}</div>
                  <select style={fieldStyle} value={terrain} onChange={e => setTerrain(e.target.value)}>
                    {TERRAIN_OPTS.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <div style={labelSt}>{uiLang==='en'?'REGIME':'RÉGIME'}</div>
                  <select style={fieldStyle} value={regime} onChange={e => setRegime(e.target.value)}>
                    {REGIME_OPTS.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              {/* Estimations */}
              <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', padding:'0.4rem 0.6rem', background:'rgba(58,191,122,0.04)', borderLeft:'2px solid rgba(58,191,122,0.18)', borderRadius:'2px' }}>
                <span style={{ fontFamily:MONO, fontSize:'0.42rem', color:'rgba(140,160,200,0.55)' }}>👥 ~{(((terSim[terrain]?.pop_base)||5e6)/1e6).toFixed(1)} M</span>
                <span style={{ fontFamily:MONO, fontSize:'0.42rem', color:'rgba(140,160,200,0.55)' }}>😊 ~{regSim[regime]?.sat_base||50}%</span>
                <span style={{ fontFamily:MONO, fontSize:'0.42rem', color:'rgba(100,130,200,0.70)' }}>◈ ARIA IRL ~{regSim[regime]?.aria_irl_base||35}%</span>
              </div>
            </>
          )}

          {/* ══════════ PAYS RÉEL — HORS LIGNE ══════════ */}
          {type === 'reel' && !isOnline && (
            <>
              <div>
                <div style={labelSt}>{uiLang==='en'?'SELECT':'SÉLECTIONNER'}</div>
                <select style={fieldStyle} value={selReal}
                  onChange={e => setSelReal(e.target.value)}>
                  <option value="">{uiLang==='en'?'— Choose —':'— Choisir —'}</option>
                  {realCountries.map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
                </select>
              </div>
              {selReal && (() => {
                const rc = realCountries.find(r => r.id === selReal);
                return rc ? (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                      <div>
                        <div style={labelSt}>TERRAIN</div>
                        <div style={{ ...fieldStyle, opacity:0.55, fontSize:'0.48rem' }}>{getTerrainLabel(rc.terrain, uiLang)}</div>
                      </div>
                      <div>
                        <div style={labelSt}>RÉGIME</div>
                        <div style={{ ...fieldStyle, opacity:0.55, fontSize:'0.48rem' }}>{getRegimeLabel(rc.regime, uiLang)}</div>
                      </div>
                    </div>
                    <P3CountryInfoCard data={rc} />
                  </>
                ) : null;
              })()}
              {!selReal && (
                <div style={{ fontSize:'0.42rem', color:'rgba(90,110,160,0.45)', fontStyle:'italic', textAlign:'center', padding:'0.5rem 0' }}>
                  {uiLang==='en'?'10 preset real countries available offline.':'10 pays réels disponibles hors ligne.'}
                </div>
              )}
            </>
          )}

          {/* ══════════ PAYS RÉEL — EN LIGNE ══════════ */}
          {type === 'reel' && isOnline && (
            <>
              <div>
                <div style={labelSt}>{uiLang==='en'?'COUNTRY NAME':'NOM DU PAYS'}</div>
                {/* Dropdown rapide parmi les 10 connus */}
                <select style={{ ...fieldStyle, marginBottom:'0.35rem' }}
                  value={realCountries.find(r=>r.nom.toLowerCase()===rcSearch.toLowerCase())?.id||'_free'}
                  onChange={e => {
                    if (e.target.value==='_free') { setRcSearch(''); setRcStatus(null); setRcRealData(null); }
                    else {
                      const rc = realCountries.find(r=>r.id===e.target.value);
                      if (rc) { setRcSearch(rc.nom); setRcStatus('found'); setRcRealData(rc); }
                    }
                  }}>
                  <option value="_free">{uiLang==='en'?'— Type freely —':'— Saisir librement —'}</option>
                  {realCountries.map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
                </select>
                {/* Champ texte libre */}
                <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <input style={{ ...fieldStyle, flex:1 }} value={rcSearch}
                      placeholder={uiLang==='en'?'Ex: Canada, Morocco, Singapore…':'Ex : Canada, Maroc, Singapour…'}
                      onChange={e => { setRcSearch(e.target.value); setRcStatus(null); setRcRealData(null); setRcSuggestion(null); }} />
                  </div>
                  {/* Statut validation */}
                  <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', minHeight:'1.1rem' }}>
                    <span style={{ fontFamily:MONO, fontSize:'0.40rem', color:'rgba(100,120,160,0.45)' }}>VÉRIFICATION</span>
                    {rcStatus==='searching'  && <span style={{ color:'rgba(200,164,74,0.55)',  fontSize:'0.38rem' }}>⟳ {uiLang==='en'?'checking…':'vérification…'}</span>}
                    {rcStatus==='found'      && <span style={{ color:'rgba(58,191,122,0.80)', fontSize:'0.38rem' }}>✓ {uiLang==='en'?'country recognised':'pays reconnu'}</span>}
                    {rcStatus==='notfound'   && <span style={{ color:'rgba(200,80,80,0.70)',  fontSize:'0.38rem' }}>✗ {uiLang==='en'?'unknown country':'pays inconnu'}</span>}
                    {rcStatus==='error'      && <span style={{ color:'rgba(200,164,74,0.50)', fontSize:'0.38rem' }}>⚠ {uiLang==='en'?'offline':'hors ligne'}</span>}
                    {rcStatus==='suggestion' && rcSuggestion && (
                      <button
                        onClick={() => { setRcSearch(rcSuggestion); setRcStatus(null); setRcSuggestion(null); setRcRealData(null); }}
                        style={{ fontFamily:MONO, fontSize:'0.38rem', color:'rgba(200,164,74,0.90)', background:'rgba(200,164,74,0.10)', border:'1px solid rgba(200,164,74,0.30)', borderRadius:'2px', padding:'0.10rem 0.40rem', cursor:'pointer' }}>
                        → {rcSuggestion} ?
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* Fiche pays si trouvé */}
              {rcStatus==='found' && rcRealData && <P3CountryInfoCard data={rcRealData} />}
              {/* Hint IA si saisie libre non connue */}
              {rcStatus!=='found' && rcSearch.length>2 && rcStatus!=='notfound' && (
                <div style={{ fontSize:'0.43rem', color:'rgba(100,120,160,0.50)', fontStyle:'italic', lineHeight:1.5 }}>
                  ⚡ {uiLang==='en'?'AI will generate':'L\'IA génèrera'} <strong style={{ color:'rgba(200,164,74,0.60)' }}>{rcSearch}</strong> {uiLang==='en'?'based on current geopolitical data.':'basé sur sa situation politique actuelle.'}
                </div>
              )}
            </>
          )}

        </div>

        {/* ── Footer ── */}
        <div style={S.modalFooter}>
          <button style={S.cancelBtn} onClick={onClose}>{uiLang==='en'?'CANCEL':'ANNULER'}</button>
          <button
            style={{ ...S.saveBtn, opacity:canConfirm?1:0.35, color:titleColor, borderColor:type==='reel'?'rgba(100,160,240,0.40)':'rgba(58,191,122,0.40)', background:canConfirm?(type==='reel'?'rgba(100,160,240,0.08)':'rgba(58,191,122,0.10)'):'transparent' }}
            disabled={!canConfirm}
            onClick={handleConfirm}>
            {type==='reel'
              ? (uiLang==='en'?'🗺 ADD COUNTRY':'🗺 AJOUTER CE PAYS')
              : (uiLang==='en'?'🌐 CREATE NATION':'🌐 CRÉER LA NATION')}
          </button>
        </div>
      </div>
    </div>
  );
}
// ChronologView importé depuis ./ChronologView.jsx

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : MODALE SÉCESSION
// ─────────────────────────────────────────────────────────────────────────────

function SecessionModal({ parent, onConfirm, onClose }) {
  const { lang: uiLang } = useLocale();
  const [nom,      setNom]      = useState('');
  const [relation, setRelation] = useState('Tension');
  const [regime,   setRegime]   = useState(parent?.regime || 'republique_federale');

  const REGIME_LIST = [
    'democratie_liberale','republique_federale','monarchie_constitutionnelle',
    'technocratie_ia','oligarchie','junte_militaire','regime_autoritaire','theocratie',
  ].map(k => ({ value: k, label: getRegimeLabel(k, uiLang) }));

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={S.modalTitle}>{uiLang==='en'?`✂️ SECESSION — ${parent?.nom}`:`✂️ SÉCESSION — ${parent?.nom}`}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <p style={S.modalHint}>
            {uiLang==='en'?`The new country inherits 25% of the population and resources. ${parent?.nom} loses 25% of its population and 12% of its size.`:`Le nouveau pays hérite de 25% de la population et des ressources. ${parent?.nom} perd 25% de sa population et 12% de sa taille.`}
          </p>
          <label style={S.fieldLabel}>{uiLang==='en'?'NEW COUNTRY NAME':'NOM DU NOUVEAU PAYS'}</label>
          <input
            style={S.fieldInput}
            value={nom}
            onChange={e => setNom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && nom.trim() && onConfirm(nom.trim(), relation, regime)}
            placeholder={uiLang==='en'?'E.g. Republic of Levant…':'Ex : République du Levant…'}
            autoFocus
          />
          <label style={S.fieldLabel}>{t('DASH_REGIME_POLITIQUE', uiLang)}</label>
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
          <label style={S.fieldLabel}>{uiLang==='en'?`INITIAL RELATION WITH ${parent?.nom?.toUpperCase()}`:`RELATION INITIALE AVEC ${parent?.nom?.toUpperCase()}`}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Alliance', 'Tension', 'Neutre'].map(r => (
              <button
                key={r}
                style={{ ...S.relBtn, ...(relation === r ? S.relBtnActive : {}) }}
                onClick={() => setRelation(r)}
              >
                {r === 'Alliance' ? (uiLang==='en'?'🤝 Alliance':'🤝 Alliance') : r === 'Tension' ? (uiLang==='en'?'⚡ Tension':'⚡ Tension') : (uiLang==='en'?'○ Neutral':'○ Neutre')}
              </button>
            ))}
          </div>
        </div>
        <div style={S.modalFooter}>
          <button style={S.cancelBtn} onClick={onClose}>{uiLang==='en'?'Cancel':'Annuler'}</button>
          <button
            style={{ ...S.saveBtn, opacity: nom.trim() ? 1 : 0.4 }}
            disabled={!nom.trim()}
            onClick={() => onConfirm(nom.trim(), relation, regime)}
          >
            {uiLang==='en'?'✂ Declare secession':'✂ Déclarer la sécession'}
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


// ── Statut IA — badge persistant + toast reconnexion ─────────────────────────
function useIaStatus(pushNotif) {
  const [iaStatus, setLocal] = useState(() => getIaStatus());
  const prevRef = useRef(iaStatus);
  const lang = loadLang();

  useEffect(() => {
    const handler = (e) => {
      const next = e.detail.status;
      const prev = prevRef.current;
      prevRef.current = next;
      setLocal(next);
      // Toast au retour de l'IA
      if (prev !== null && next === null) {
        pushNotif?.(
          lang === 'en' ? '✅ AI reconnected — Board Game mode disabled' : '✅ IA reconnectée — mode Board Game désactivé',
          'ok', 4000
        );
      }
    };
    window.addEventListener('aria:ia-status', handler);
    return () => window.removeEventListener('aria:ia-status', handler);
  }, [pushNotif, lang]);

  return iaStatus;
}

function IaStatusBadge({ status }) {
  if (!status) return null;
  const lang = loadLang();
  const isOffline = status === 'offline';
  const color     = isOffline ? 'rgba(220,60,60,0.90)' : 'rgba(220,160,40,0.90)';
  const border    = isOffline ? 'rgba(220,60,60,0.35)' : 'rgba(220,160,40,0.35)';
  const label     = isOffline
    ? (lang === 'en' ? '🔴 AI OFFLINE — BOARD GAME MODE' : '🔴 IA HORS-LIGNE — MODE BOARD GAME')
    : (lang === 'en' ? '⚠ QUOTA EXCEEDED — BOARD GAME MODE' : '⚠ QUOTA DÉPASSÉ — MODE BOARD GAME');

  return (
    <div style={{
      position: 'fixed', bottom: '1.4rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9000, pointerEvents: 'none',
      background: 'rgba(4,8,18,0.88)', border: `1px solid ${border}`,
      borderRadius: '3px', padding: '0.3rem 0.9rem',
      fontFamily: FONT.mono, fontSize: '0.40rem', letterSpacing: '0.10em',
      color, boxShadow: `0 0 14px ${border}`,
      animation: 'fadeSlideInBadge 0.3s ease both',
    }}>
      {label}
    </div>
  );
}

// ── Toast notifications ──────────────────────────────────────────────────────
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

// ── Modal erreur IA ───────────────────────────────────────────────────────────
function AIErrorModal({ error, onClose, onSettings, onOffline, onCreateLocal }) {
  if (!error) return null;
  const isQuota = error.type === 'quota';
  const isNoKey = error.type === 'nokey';
  const FONT_MONO = "'JetBrains Mono', monospace";
  const isEn = (localStorage.getItem('aria_lang') || 'fr') === 'en';
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9000,
      background:'rgba(3,6,12,0.92)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        background:'#0B0F1A',
        border:`1px solid ${isQuota ? 'rgba(200,80,80,0.50)' : 'rgba(200,164,74,0.35)'}`,
        borderRadius:'3px',
        padding:'2rem 2.5rem',
        maxWidth:'480px', width:'90%',
        display:'flex', flexDirection:'column', gap:'1.2rem',
        boxShadow:`0 0 60px ${isQuota ? 'rgba(200,80,80,0.12)' : 'rgba(200,164,74,0.08)'}`,
      }}>
        {/* Titre */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <span style={{ fontSize:'1.4rem' }}>{isQuota ? '⚠' : '🔑'}</span>
          <div>
            <div style={{ fontFamily:FONT_MONO, fontSize:'0.72rem', letterSpacing:'0.18em',
              color: isQuota ? 'rgba(220,80,80,0.90)' : 'rgba(200,164,74,0.90)' }}>
              {isQuota ? (isEn?'API QUOTA EXCEEDED':'QUOTA API DÉPASSÉ') : (isEn?'AI GENERATION FAILED':'GÉNÉRATION IA ÉCHOUÉE')}
            </div>
            <div style={{ fontFamily:FONT_MONO, fontSize:'0.38rem', color:'rgba(100,120,160,0.55)',
              letterSpacing:'0.12em', marginTop:'0.2rem' }}>
              {isQuota ? 'TOO MANY REQUESTS — 429' : (isEn?'NO COUNTRY GENERATED BY AI':"AUCUN PAYS GÉNÉRÉ PAR L'IA")}
            </div>
          </div>
        </div>

        {/* Détails */}
        <div style={{ fontFamily:FONT_MONO, fontSize:'0.46rem', color:'rgba(160,180,210,0.70)',
          lineHeight:1.7, letterSpacing:'0.05em',
          background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'2px', padding:'0.7rem 0.9rem' }}>
          {error.details}
        </div>

        {/* Monde généré en mode local quand même */}
        <div style={{ fontFamily:FONT_MONO, fontSize:'0.42rem', color:'rgba(100,120,160,0.50)',
          letterSpacing:'0.05em', lineHeight:1.6 }}>
          {error.countryDefs?.length > 0
            ? (isEn ? <>Click <strong style={{color:'rgba(140,180,240,0.80)'}}>CREATE OFFLINE</strong> to generate {error.countryDefs.map(d => d.nom || 'a country').join(', ')} with local data.</> : <>Cliquez sur <strong style={{color:'rgba(140,180,240,0.80)'}}>CRÉER EN HORS-LIGNE</strong> pour générer {error.countryDefs.map(d => d.nom || 'un pays').join(', ')} avec des données locales.</>)
            : (isEn ? <>No country available. Reset or fix your API key.</> : <>Aucun pays disponible. Réinitialisez ou corrigez votre clé API.</>)
          }
        </div>

        {/* Boutons */}
        <div style={{ display:'flex', gap:'0.7rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
          <button onClick={onOffline} style={{
            fontFamily:FONT_MONO, fontSize:'0.46rem', letterSpacing:'0.10em',
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(140,160,200,0.70)', borderRadius:'2px',
            padding:'0.45rem 1rem', cursor:'pointer',
          }}>
            {isEn?'↺ RESET':'↺ RÉINITIALISER'}
          </button>
          <button onClick={onSettings} style={{
            fontFamily:FONT_MONO, fontSize:'0.46rem', letterSpacing:'0.10em',
            background:'rgba(200,164,74,0.08)', border:'1px solid rgba(200,164,74,0.35)',
            color:'rgba(200,164,74,0.85)', borderRadius:'2px',
            padding:'0.45rem 1rem', cursor:'pointer',
          }}>
            {isEn?"⚙ CHANGE API":"⚙ CHANGER D'API"}
          </button>
          {error.countryDefs?.length > 0 && (
            <button onClick={onCreateLocal} style={{
              fontFamily:FONT_MONO, fontSize:'0.46rem', letterSpacing:'0.10em',
              background:'rgba(74,126,200,0.12)', border:'1px solid rgba(74,126,200,0.40)',
              color:'rgba(140,180,240,0.90)', borderRadius:'2px',
              padding:'0.45rem 1rem', cursor:'pointer',
            }}>
              {isEn?'🌍 CREATE OFFLINE':'🌍 CRÉER EN HORS-LIGNE'}
            </button>
          )}
          {error.type !== 'generic' && (
            <button onClick={onClose} style={{
              fontFamily:FONT_MONO, fontSize:'0.46rem', letterSpacing:'0.10em',
              background:'rgba(58,191,122,0.06)', border:'1px solid rgba(58,191,122,0.20)',
              color:'rgba(58,191,122,0.55)', borderRadius:'2px',
              padding:'0.45rem 1rem', cursor:'pointer',
            }}>
              {isEn?'CONTINUE ANYWAY →':'CONTINUER QUAND MÊME →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ selectedCountry, setSelectedCountry, isCrisis, activeTab, onGoToCouncil, onReady, onReset, onCountriesUpdate, chronologKey, onGoToSettings, onWorldStarted }) {
  const aria = useARIA({ setSelectedCountry, isCrisis, onReset });
  const iaStatus = useIaStatus(aria.pushNotif);

  // Langue réactive (écoute event aria-lang-change émis par ariaI18n)
  const [uiLang, setUiLang] = useState(() => localStorage.getItem('aria_lang') || 'fr');
  useEffect(() => {
    const onLang = () => setUiLang(localStorage.getItem('aria_lang') || 'fr');
    window.addEventListener('aria-lang-change', onLang);
    return () => window.removeEventListener('aria-lang-change', onLang);
  }, []);
  const { pushEvent, pushCycleStats, closeCycle, resetChronolog } = useChronolog();

  // Numéro de cycle courant — incrémenté à chaque confirmation de cycle
  const cycleNumRef = useRef(1);

  // ── États pour le Conseil ─────────────────────────────────
  const [openMinistry, setOpenMinistry] = useState(null);
  const [customQ, setCustomQ] = useState('');
  const [freeQ, setFreeQ] = useState('');
  const [currentCycleQuestions, setCurrentCycleQuestions] = useState({});
  const [lastVoteTimestamp, setLastVoteTimestamp] = useState({});
  const setMinistryCycleQuestion = (ministryId, question) => {
    setCurrentCycleQuestions(prev => ({
      ...prev,
      [ministryId]: question
    }));
  };

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
  // ── Conseil ARIA — logique extraite dans useCouncilSession ──
  const {
    session:        councilSession,
    running:        councilRunning,
    submitQuestion: handleSubmitQuestion,
    vote:           handleVoteCouncil,
    garbageModal,
    closeGarbageModal,
    mismatchModal,
    resolveMismatch,
  } = useCouncilSession(selectedCountry, handleVoteResult);

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
      narratif:     uiLang==='en' ? `${nom} secedes from ${parent.nom}. Established relation: ${relation}.` : `${nom} fait sécession de ${parent.nom}. Relation établie : ${relation}.`,
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
      if (diff.regimeAvant !== diff.regimeApres)       parts.push(`${uiLang==='en'?'Regime':'Régime'} → ${diff.regimeApres.replace(/_/g,' ')}`);
      if (diff.presidenceAvant !== diff.presidenceApres) parts.push(`${uiLang==='en'?'Presidency':'Présidence'} → ${diff.presidenceApres}`);
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

  // ── Effets de bord du vote (chronolog, stats pays) — logique de session dans useCouncilSession ──
  function handleVoteResult({ vote, voteResult: impact, session }) {
    const ministry        = session.ministryId ? MINISTRIES_LIST.find(m => m.id === session.ministryId) : null;
    const originalQuestion = session.question || '';

    const synthMin = (() => {
      const s = session.ministere?.synthese;
      if (!s) return '';
      return s.synthese_debat || s.recommandation || s.analyse || s.position || '';
    })();

    const synthPres = (() => {
      const s = session.presidence?.synthese;
      if (!s) return '';
      return s.decision_recommandee || s.synthese_debat || s.analyse || s.enjeu_principal || '';
    })();

    const entryBase = {
      type:               'vote',
      countryId:          selectedCountry.id,
      countryNom:         selectedCountry.nom,
      countryEmoji:       selectedCountry.emoji,
      ministereId:        session.ministryId || '',
      ministereNom:       ministry?.name || '',
      question:           originalQuestion,
      syntheseMinistere:  synthMin,
      synthesePresidence: synthPres,
      vote,
      label:              impact.label,
      impacts: {
        satisfaction: impact.satisfaction,
        aria_delta:   impact.aria_current - (selectedCountry.aria_current ?? 40),
      },
      voteCounts: { oui: impact.oui, non: impact.non },
    };

    pushEvent(cycleNumRef.current, selectedCountry.annee || 2026, entryBase);

    window.dispatchEvent(new CustomEvent('aria:vote-stored', {
      detail: { cycleNum: cycleNumRef.current }
    }));

    setCycleHistory(prev => [
      ...prev.filter(h => !(h.type === 'vote' && h.countryId === selectedCountry.id && h.ministereId === entryBase.ministereId)),
      entryBase,
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

    setModalVoteResult(true);

    if (session.ministryId) {
      setLastVoteTimestamp(prev => ({ ...prev, [session.ministryId]: Date.now() }));
    }
  }

  // Expose les fonctions du moteur au parent (App.jsx) dès que le hook est prêt
  useEffect(() => {
    onReady?.({
      startLocal:          aria.startLocal,
      startWithAI:         aria.startWithAI,
      advanceCycle:        aria.advanceCycle,
      doDeliberate:        aria.doDeliberate,
      doSecession:         aria.doSecession,
      addFictionalCountry: aria.addFictionalCountry,
      openSecession:       openSecession,
      openConstitution:    openConstitution,
      openCyclePopup:      () => {
        if (aria.countries?.length > 0) setModalCycleConfirm(true);
      },
      resetWorld:       aria.resetWorld,
      resetChronolog:   resetChronolog,
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
          onVote={handleVoteCouncil}
          isRunning={councilRunning}
          countryContext={(() => {
            const c = selectedCountry;
            if (!c) return '';
            const isEn   = loadLang() === 'en';
            const raw    = (isEn ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA).find(r => r.id === c.id);
            const geoText = raw?.triple_combo         || c.geoContext  || '';
            const socText = raw?.aria_sociology_logic || c.description || '';
            const sat     = Math.round(c.satisfaction ?? 50);
            const aria    = Math.round(c.aria_current ?? c.aria_irl ?? 40);
            const statsLine = isEn
              ? `Approval: ${sat}%   ·   ARIA: ${aria}%`
              : `Satisfaction : ${sat}%   ·   Adhésion ARIA : ${aria}%`;
            const geoBlock = [geoText, socText].filter(Boolean).join('\n\n');
            const baseText = c.contextOverride?.trim() || geoBlock;
            return [baseText, statsLine].filter(Boolean).join('\n\n');
          })()}
          countryNom={selectedCountry?.nom || ''}
          ctxMode={(() => {
            const c = selectedCountry;
            if (!c) return null;
            if (c.contextOverride?.trim()) return { icon:'✎', label:'Custom' };
            const m = c.context_mode || 'auto';
            return { auto:{icon:'🤖',label:'Auto'}, rich:{icon:'📖',label:'Enrichi'}, stats_only:{icon:'📊',label:'Stats'}, off:{icon:'🚫',label:'Off'} }[m] || {icon:'🤖',label:'Auto'};
          })()}
        />
      );
    }
    if (activeTab === 'timeline') {
      return (
        <ChronologView
          key={chronologKey}
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
          }}>{t('DASH_GEN_WORLD', uiLang)}</div>
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
          }}>{t('DASH_GEN_ARCHIVES', uiLang)}</div>
          <style>{`
            @keyframes loading-slide {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
            @keyframes fadeSlideInBadge {
              from { opacity: 0; transform: translateX(-50%) translateY(8px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* ── Contenu principal (carte ou vues) ── */}
      {renderMainContent()}

      {/* ── Toast notifications ── */}
      <Toast notification={aria.notification} />

      {/* ── Badge statut IA ── */}
      <IaStatusBadge status={iaStatus} />

      {/* ── Modal erreur IA ── */}
      <AIErrorModal
        error={aria.aiError}
        onClose={() => aria.clearAiError?.()}
        onSettings={() => { aria.clearAiError?.(); onGoToSettings?.(); }}
        onOffline={() => { aria.clearAiError?.(); onReset(); }}
        onCreateLocal={() => {
          const { countryDefs, W, H } = aria.aiError || {};
          aria.clearAiError?.();
          if (countryDefs?.length) {
            onWorldStarted?.();
            aria.startLocal(countryDefs, W || 1400, H || 800);
          }
        }}
      />

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
                title={t('DASH_COUNCIL_TOOLTIP', uiLang)}
                onClick={() => onGoToCouncil?.()}
              >
                ⚖️
              </button>
              <button style={S.fabBtn} title="Diplomatie" onClick={openDiplomacy}>🤝</button>
              <button style={S.fabBtn} title="Gouvernement" onClick={openConstitution}>🏛️</button>
              <button style={{ ...S.fabBtn, ...S.fabBtnDanger }} title={t('DASH_SECESSION_TOOLTIP', uiLang)} onClick={openSecession}>✂️</button>
            </>
          )}
        </div>
      )}
      {/* ── Council View ── */}
      {activeTab === 'council' && selectedCountry && (
        <CountryPanelCouncil
        country={selectedCountry}
        lang={uiLang}
        openMinistry={openMinistry}
        setOpenMinistry={setOpenMinistry}
        customQ={customQ}
        setCustomQ={setCustomQ}
        freeQ={freeQ}
        setFreeQ={setFreeQ}
        submitting={councilRunning}
        handleSubmit={handleSubmitQuestion}
        onNextCycle={() => setModalCycleConfirm(true)}
        onConstitution={openConstitution}
        onSecession={openSecession}
        cycleActuel={cycleNumRef.current}
        currentCycleQuestions={currentCycleQuestions}
        setMinistryCycleQuestion={setMinistryCycleQuestion}
        lastVoteTimestamp={lastVoteTimestamp}
        />
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
                  countryEmoji: def.realData?.flag || '🌍',
                  nom:     def.nom,
                  emoji:   def.realData?.flag || '🌍',
                  terrain: def.terrain,
                  regime:  def.regime,
                  isReal:  def.type === 'reel',
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
          <GarbageModal msg={garbageModal?.msg} onClose={closeGarbageModal} />
          <MismatchModal data={mismatchModal} onResolve={resolveMismatch} />
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
                setCurrentCycleQuestions({});
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
