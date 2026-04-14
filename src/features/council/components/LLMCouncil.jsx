// src/features/council/components/LLMCouncil.jsx

// ═══════════════════════════════════════════════════════════════════════════════
//  LLMCouncil.jsx — Vue principale du Conseil ARIA
//
//  Affiche les 6 phases de délibération en séquence animée :
//   IDLE         → écran d'attente (aucune session)
//   PEUPLE_IN    → question soumise par le peuple
//   MINISTERE    → 2 ministres + synthèse du ministère
//   CERCLE       → annotations des autres ministères
//   PRESIDENCE   → Phare + Boussole + synthèse présidentielle
//   PEUPLE_VOTE  → question soumise au peuple + vote
//   RESULT       → résultat + jauge + impact stats
//
//  Props :
//   session      {object|null}  — état courant de la délibération
//   onVote       {function}     — appelé avec ('oui'|'non') — toujours referendum
//   isRunning    {boolean}      — IA en cours
// ═══════════════════════════════════════════════════════════════════════════════

import { loadLang, t, useLocale } from '../../../ariaI18n';
import { useState, useRef } from 'react';
import { C, FONT } from '../../../shared/theme';
import { sectionTitle, bubble } from './councilStyles';
import { loadMemoire } from '../../chronolog/useChroniqueur';
import {
  PhaseTracker,
  MinisterBlock,
  MinistereSyntheseBlock,
  DestinVoiceBlock,
  CercleAnnotation,
  PresidenceBlock,
  VoteJauge,
  PhaseBlock,
  VoteButton,
  LoadingPulse,
} from './councilParts';

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function LLMCouncil({ session, onVote, isRunning, countryContext, countryNom, ctxMode, countryId }) {
  const { lang } = useLocale();
  const scrollRef = useRef(null);
  const [openCtx,      setOpenCtx]      = useState(false);
  const [openMemoire,  setOpenMemoire]  = useState(false);

  // Accordéon contexte — visible même en IDLE
  const ctxText = session?.countryDescription || countryContext || '';
  const ctxNom  = session?.countryNom     || countryNom     || '';
  const renderCtxAccordion = () => ctxText ? (
    <div className={`aria-accordion${openCtx ? ' open' : ''}`} style={{ marginBottom: '0.8rem' }}>
      <button className="aria-accordion__hdr" onClick={() => setOpenCtx(v => !v)}>
        <span className="aria-accordion__arrow">{openCtx ? '▾' : '▸'}</span>
        <span className="aria-accordion__label" style={{ flex: 1 }}>
          🌍 {lang === 'en' ? 'Geopolitical context' : 'Contexte géopolitique'}
          {ctxNom ? ` — ${ctxNom}` : ''}
        </span>
        {ctxMode && (
          <span style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(140,160,200,0.45)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '2px', padding: '0.08rem 0.35rem', whiteSpace: 'nowrap' }}>
            {ctxMode.icon} {ctxMode.label}
          </span>
        )}
      </button>
      {openCtx && (
        <div className="aria-accordion__body" style={{
          fontFamily: FONT.mono, fontSize: '0.42rem', lineHeight: 1.7,
          color: 'rgba(140,160,200,0.60)', whiteSpace: 'pre-wrap',
        }}>
          {ctxText}
        </div>
      )}
    </div>
  ) : null;

  // Phases actives — dérivées directement de la session (pas de state async)
  const show = {
    PEUPLE_IN:   !!session?.question,
    MINISTERE:   !!session?.ministere,
    CERCLE:      !!session?.cercle,
    DESTIN:      !!session?.destin,
    PRESIDENCE:  !!session?.presidence,
    CRISIS:      !!session?.crisis,
    PEUPLE_VOTE: !!session?.voteReady && !session?.voteResult,
    RESULT:      !!session?.voteResult,
  };

  // Phase courante pour le tracker
  const currentPhase = session?.voteResult ? 'RESULT'
    : session?.voteReady ? 'PEUPLE_VOTE'
    : session?.presidence ? 'PRESIDENCE'
    : session?.cercle ? 'CERCLE'
    : session?.ministere ? 'MINISTERE'
    : session?.question ? 'PEUPLE_IN'
    : 'IDLE';

  // Pas d'auto-scroll — le joueur lit à son rythme

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (!session || currentPhase === 'IDLE') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0.8rem 1.2rem', overflow: 'hidden' }}>
        {renderCtxAccordion()}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: C.textFaint, fontFamily: FONT.mono }}>
          <div style={{ fontSize: '2.5rem', opacity: 0.12 }}>⚖️</div>
          <div style={{ fontSize: '0.52rem', letterSpacing: '0.18em', opacity: 0.4 }}>{t('COUNCIL_IDLE_TITLE', loadLang())}</div>
          <p style={{ fontSize: '0.44rem', color: C.textFaint, textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
            {t('COUNCIL_IDLE_DESC', loadLang())}
          </p>
        </div>
      </div>
    );
  }

  const { question, ministere, cercle, destin, presidence, crisis, voteReady, voteResult } = session;
  const convergence = presidence?.synthese?.convergence;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'transparent', overflow: 'hidden',
    }}>
      {/* Tracker de phases */}
      <div style={{ padding: '0.8rem 1.2rem 0', flexShrink: 0 }}>
        <PhaseTracker currentPhase={currentPhase} />
      </div>

      {/* Zone scrollable */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '0 1.2rem 1.2rem',
        scrollbarWidth: 'thin', scrollbarColor: `${C.border} transparent`,
      }}>

        {renderCtxAccordion()}

        {/* ── PHASE 1 : PEUPLE IN ──────────────────────────────────────────── */}
        {show.PEUPLE_IN && (
          <PhaseBlock
            phase="PEUPLE_IN"
            label={t('COUNCIL_PHASE_PEUPLE_IN', loadLang())}
            icon="🌐"
            accentColor={C.blue}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            <div style={bubble(C.blue)}>
              <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: C.blueDim, letterSpacing: '0.14em', marginBottom: '0.4rem' }}>
                {t('COUNCIL_QUESTION_LABEL', loadLang())}
              </div>
              <p style={{ fontFamily: FONT.cinzel, fontSize: '0.62rem', color: C.text, lineHeight: 1.6, margin: 0, letterSpacing: '0.04em' }}>
                « {question} »
              </p>
            </div>
          </PhaseBlock>
        )}

        {/* ── Mémoire institutionnelle (après question, avant ministères) ─── */}
        {show.PEUPLE_IN && countryId && (() => {
          const mem = loadMemoire(countryId);
          if (!mem?.memoire) return null;
          return (
            <div className={`aria-accordion${openMemoire ? ' open' : ''}`}
              style={{ marginBottom:'0.7rem', animation:'fadeSlideIn 0.5s ease both' }}>
              <button className="aria-accordion__hdr" onClick={() => setOpenMemoire(v => !v)}>
                <span className="aria-accordion__arrow">{openMemoire ? '▾' : '▸'}</span>
                <span className="aria-accordion__label" style={{ flex:1 }}>
                  📜 {lang==='en' ? 'Institutional memory' : 'Mémoire institutionnelle'}
                  {mem.cycle ? ` — ${lang==='en'?'cycle':'cycle'} ${mem.cycle}` : ''}
                </span>
              </button>
              {openMemoire && (
                <div className="aria-accordion__body" style={{
                  fontFamily:FONT.mono, fontSize:'0.42rem', lineHeight:1.7,
                  color:'rgba(180,200,230,0.60)', fontStyle:'italic',
                }}>
                  {mem.memoire}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── PHASE 2 : MINISTERE ──────────────────────────────────────────── */}
        {show.MINISTERE && ministere && (
          <PhaseBlock
            phase="MINISTERE"
            label={ministere.isOrphan
              ? t('COUNCIL_INSTANCE', loadLang())
              : `${t('COUNCIL_MINISTRY_LABEL', loadLang())} — ${ministere.ministryName}`}
            icon={ministere.ministryEmoji}
            accentColor={ministere.isOrphan ? 'rgba(90,106,138,0.7)' : (ministere.ministryColor || C.gold)}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            {ministere.isOrphan && (
              <div style={{
                fontFamily: FONT.mono, fontSize: '0.40rem', letterSpacing: '0.12em',
                color: 'rgba(120,140,180,0.55)', marginBottom: '0.6rem',
                padding: '0.3rem 0.5rem',
                background: 'rgba(40,50,80,0.35)',
                border: '1px solid rgba(90,110,160,0.15)',
                borderRadius: '2px',
              }}>
                {t('COUNCIL_UNROUTED', loadLang())}
              </div>
            )}
            <div style={sectionTitle(ministere.ministryColor || C.gold)}>
              <span>{t('COUNCIL_DELIB_LABEL', loadLang())}</span>
            </div>
            <MinisterBlock minister={ministere.ministerA} />
            <MinisterBlock minister={ministere.ministerB} />
            {isRunning && !ministere.synthese && (
              <LoadingPulse label={t('COUNCIL_SYNTH_LOADING', loadLang())} />
            )}
            {ministere.synthese && (
              <MinistereSyntheseBlock synthese={ministere.synthese} ministry={ministere} />
            )}
          </PhaseBlock>
        )}

        {/* ── PHASE 3 : CERCLE MINISTERIEL ─────────────────────────────────── */}
        {show.CERCLE && cercle && (
          <PhaseBlock
            phase="CERCLE"
            label={t('COUNCIL_PHASE_CERCLE', loadLang())}
            icon="◎"
            accentColor={C.goldDim}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            <div style={sectionTitle(C.goldDim)}>
              {t('COUNCIL_ANNOTATIONS', loadLang())}
            </div>
            {cercle.map((a, i) => (
              <CercleAnnotation key={a.ministryId} annotation={a} index={i} />
            ))}
          </PhaseBlock>
        )}

        {/* ── PHASE 3b : DESTINÉE DU MONDE (optionnelle) ───────────────────── */}
        {show.DESTIN && destin && (
          <PhaseBlock
            phase="DESTIN"
            label={t('COUNCIL_DESTINY_LABEL', loadLang())}
            icon="👁️"
            accentColor="#B87A00"
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            <div style={sectionTitle('#B87A00')}>
              {t('COUNCIL_ORACLE_LABEL', loadLang())}
            </div>
            <DestinVoiceBlock agent={destin.oracle} />
            <DestinVoiceBlock agent={destin.wyrd} />
          </PhaseBlock>
        )}

        {/* ── PHASE CRISE : tous les ministères en délibération d'urgence ─────── */}
        {show.CRISIS && crisis && (
          <PhaseBlock
            phase="CRISIS"
            label={t('COUNCIL_CRISIS_LABEL', loadLang())}
            icon="⚡"
            accentColor="#E05050"
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            <div style={sectionTitle('#E05050')}>
              {t('COUNCIL_CRISIS_DELIB', loadLang())}
            </div>
            {crisis.ministries?.map(min => (
              <div key={min.ministryId} style={bubble(min.ministryColor || C.goldDim, { marginBottom: '0.5rem' })}>
                <div style={sectionTitle(min.ministryColor || C.goldDim)}>
                  {min.ministryEmoji} {min.ministryName}
                </div>
                <MinisterBlock minister={min.ministerA} />
                <MinisterBlock minister={min.ministerB} />
                {min.synthese?.recommandation && (
                  <p style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: C.text, lineHeight: 1.6, margin: '0.3rem 0 0', paddingTop: '0.3rem', borderTop: `1px solid ${min.ministryColor || C.goldDim}22` }}>
                    → {min.synthese.recommandation}
                  </p>
                )}
              </div>
            ))}
          </PhaseBlock>
        )}

        {/* ── PHASE 4 : PRESIDENCE ─────────────────────────────────────────── */}
        {show.PRESIDENCE && presidence && (
          <PhaseBlock
            phase="PRESIDENCE"
            label={presidence.collegial ? t('COUNCIL_COLLEGIAL_SYNTH', loadLang()) : t('COUNCIL_PHASE_PRESIDENCE', loadLang())}
            icon={presidence.collegial ? '✡' : '☉'}
            accentColor={presidence.collegial ? C.goldDim : C.purple}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            {!presidence.collegial && (() => {
              const ACCENTS_LLM = [C.gold, C.purple, 'rgba(60,200,140,0.88)'];
              const ORDRE = ['phare','boussole'];
              const presMap = presidence.presidents || presidence;
              const presListe = [
                ...ORDRE.map(id => [id, presMap[id]]).filter(([, d]) => d && d.name),
                ...Object.entries(presMap).filter(([k, d]) => d && d.name && !ORDRE.includes(k)),
              ];
              return presListe.map(([id, data], i) => (
                <PresidenceBlock key={id} agent={data} data={data} accent={ACCENTS_LLM[i] || ACCENTS_LLM[ACCENTS_LLM.length-1]} />
              ));
            })()}
            {presidence.collegial && presidence.synthese && (
              <div style={bubble(C.goldDim, { marginBottom: '0.4rem' })}>
                <div style={sectionTitle(C.goldDim)}>{t('COUNCIL_COLLEGIAL_DELIB', loadLang())}</div>
                <p style={{ fontFamily: FONT.mono, fontSize: '0.47rem', color: C.text, lineHeight: 1.65, margin: 0 }}>
                  {presidence.synthese.synthese}
                </p>
              </div>
            )}
            {isRunning && !presidence.synthese && (
              <LoadingPulse label={presidence.collegial ? t('COUNCIL_LOADING_COLLEGIAL', loadLang()) : t('COUNCIL_LOADING_ARBITRAGE', loadLang())} />
            )}
            {presidence.synthese && (
              <div style={bubble(convergence ? C.green : C.gold, { marginTop: '0.6rem' })}>
                <div style={sectionTitle(convergence ? C.green : C.gold)}>
                  {presidence.collegial ? t('COUNCIL_COLLEGIAL_SYNTH', loadLang()) : t('COUNCIL_SYNTH_PRES', loadLang())}
                  <span style={{ margin: '0 0.5rem', color: 'rgba(150,170,210,0.18)', fontSize: '0.44rem' }}>—</span>
                  <span style={{
                    padding: '0.15rem 0.55rem',
                    background: `${convergence ? C.green : C.gold}22`,
                    border: `1px solid ${convergence ? C.green : C.gold}55`,
                    borderRadius: '2px', fontSize: '0.44rem',
                    letterSpacing: '0.13em', fontWeight: 700,
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                    color: convergence ? C.green : C.gold,
                  }}>
                    {convergence ? t('COUNCIL_CONSENSUS', loadLang()) : t('COUNCIL_DIVERGENCE', loadLang())}
                  </span>
                </div>
                <p style={{ fontFamily: FONT.mono, fontSize: '0.47rem', color: C.text, lineHeight: 1.65, margin: '0 0 0.4rem' }}>
                  {presidence.synthese.enjeu_principal}
                </p>
                <div style={{
                  padding: '0.5rem 0.6rem', marginTop: '0.3rem',
                  background: 'rgba(0,0,0,0.25)', borderRadius: '2px',
                  fontFamily: FONT.cinzel, fontSize: '0.55rem', color: C.goldDim, lineHeight: 1.6,
                }}>
                  « {presidence.synthese.voteQuestion || presidence.synthese.question_referendum || ''} »
                </div>
              </div>
            )}
          </PhaseBlock>
        )}

        {/* ── PHASE 5 : VOTE ───────────────────────────────────────────────── */}
        {show.PEUPLE_VOTE && voteReady && !voteResult && (
          <PhaseBlock
            phase="PEUPLE_VOTE"
            label="VOTE DU PEUPLE"
            icon="🗳️"
            accentColor={C.blue}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            {/* Résumé des positions présidentielles (dynamique) */}
            {presidence?.synthese && !presidence.collegial && (() => {
              const ACCENTS_V = ['rgba(200,180,100,0.70)', 'rgba(160,130,220,0.70)', 'rgba(60,200,140,0.70)'];
              const positions = presidence.synthese.positions_presidentielles;
              if (positions?.length) {
                return (
                  <div style={{ marginBottom: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {positions.map((p, i) => (
                      <div key={p.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ color: ACCENTS_V[i] || ACCENTS_V[ACCENTS_V.length-1], fontSize: '0.8rem', flexShrink: 0, lineHeight: 1.4 }}>
                          {p.symbol}
                        </span>
                        <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: ACCENTS_V[i] || ACCENTS_V[ACCENTS_V.length-1], lineHeight: 1.5 }}>
                          {p.resume}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              // Compat backward si positions_presidentielles absent
              const posM = presidence.synthese.position_majority_resume || presidence.synthese.position_phare_resume;
              const posN = presidence.synthese.position_minority_resume || presidence.synthese.position_boussole_resume;
              if (!posM) return null;
              return (
                <div style={{ marginBottom: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {posM && <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: C.gold, fontSize: '0.8rem', flexShrink: 0, lineHeight: 1.4 }}>☉</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(200,180,100,0.70)', lineHeight: 1.5 }}>{posM}</span>
                  </div>}
                  {posN && <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: C.purple, fontSize: '0.8rem', flexShrink: 0, lineHeight: 1.4 }}>☽</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(160,130,220,0.70)', lineHeight: 1.5 }}>{posN}</span>
                  </div>}
                </div>
              );
            })()}

            {/* Proposition soumise au vote */}
            <div style={bubble(C.blue, { marginBottom: '0.8rem' })}>
              <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: C.blueDim, letterSpacing: '0.14em', marginBottom: '0.5rem' }}>
                PROPOSITION SOUMISE AU VOTE
              </div>
              <p style={{ fontFamily: FONT.cinzel, fontSize: '0.60rem', color: C.text, lineHeight: 1.65, margin: 0, letterSpacing: '0.02em' }}>
                {presidence?.synthese?.voteQuestion || presidence?.synthese?.question_referendum || question}
              </p>
            </div>

            {/* Boutons de vote — toujours OUI/NON (0 à 3 présidents) */}
            <div style={{ display: 'flex', gap: '0.7rem' }}>
              <VoteButton
                label={presidence?.synthese?.voteOptions?.oui?.label || "✓  OUI — ADOPTER"}
                color={presidence?.synthese?.voteOptions?.oui?.color || C.green}
                onClick={() => onVote?.('oui')}
              />
              <VoteButton
                label={presidence?.synthese?.voteOptions?.non?.label || "✕  NON — REJETER"}
                color={presidence?.synthese?.voteOptions?.non?.color || C.red}
                onClick={() => onVote?.('non')}
              />
            </div>
          </PhaseBlock>
        )}

        {/* ── PHASE 6 : RÉSULTAT ───────────────────────────────────────────── */}
        {show.RESULT && voteResult && (
          <PhaseBlock
            phase="RESULT"
            label={t('COUNCIL_PHASE_RESULT', loadLang())}
            icon="✦"
            accentColor={(() => {
              const div = presidence?.synthese?.convergence === false;
              if (div) return voteResult.vote === 'oui' ? C.gold : C.purple;
              return voteResult.vote === 'oui' ? C.green : C.red;
            })()}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            {(() => {
              const div = presidence?.synthese?.convergence === false;
              const rc = div
                ? (voteResult.vote === 'oui' ? C.gold : C.purple)
                : (voteResult.vote === 'oui' ? C.green : C.red);
              const rl = div
                ? (voteResult.vote === 'oui' ? '☉ PHARE' : '☽ BOUSSOLE')
                : (voteResult.vote === 'oui' ? '✓ OUI'   : '✕ NON');
              return (
                <div style={bubble(rc, { marginBottom: '0.7rem' })}>
                  <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: rc, letterSpacing: '0.14em', marginBottom: '0.5rem' }}>
                    DÉCISION DU PEUPLE — {rl}
                  </div>
                  <p style={{ fontFamily: FONT.mono, fontSize: '0.50rem', color: C.text, lineHeight: 1.6, margin: 0 }}>
                    {voteResult.label}
                  </p>
                </div>
              );
            })()}

            <VoteJauge
              type={presidence?.synthese?.convergence === false ? 'binary' : 'referendum'}
              oui={voteResult.oui}
              non={voteResult.non}
              phare={voteResult.phare}
              boussole={voteResult.boussole}
            />

            {isRunning && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                <LoadingPulse label={t('COUNCIL_DELIB_LOADING', loadLang())} />
              </div>
            )}
          </PhaseBlock>
        )}

      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
