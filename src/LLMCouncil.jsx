// src/LLMCouncil.jsx

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
//   onVote       {function}     — appelé avec ('oui'|'non'|'phare'|'boussole')
//   isRunning    {boolean}      — IA en cours
// ═══════════════════════════════════════════════════════════════════════════════

import { loadLang, t, useLocale } from './ariaI18n';
import { useState, useEffect, useRef } from 'react';
import { C } from './shared/theme';
import { FONT } from './shared/theme';

// Phase definitions
const PHASES = {
  IDLE:        { order: 0 },
  PEUPLE_IN:   { order: 1, label: 'PEUPLE',            icon: '🌐', color: C.blue   },
  MINISTERE:   { order: 2, get label() { return t('COUNCIL_PHASE_MINISTRE',   loadLang()); },         icon: '🏛️', color: C.gold   },
  CERCLE:      { order: 3, get label() { return t('COUNCIL_PHASE_CERCLE',      loadLang()); },icon: '◎',  color: C.goldDim},
  PRESIDENCE:  { order: 4, get label() { return t('COUNCIL_PHASE_PRESIDENCE',  loadLang()); },        icon: '☉',  color: C.purple },
  PEUPLE_VOTE: { order: 5, label: 'VOTE DU PEUPLE',    icon: '🗳️', color: C.blue   },
  RESULT:      { order: 6, get label() { return t('COUNCIL_PHASE_RESULT',       loadLang()); },          icon: '✦',  color: C.green  },
};

const PHASE_ORDER = ['PEUPLE_IN','MINISTERE','CERCLE','PRESIDENCE','PEUPLE_VOTE','RESULT'];

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES PARTAGÉS
// ─────────────────────────────────────────────────────────────────────────────

const card = (extra = {}) => ({
  background: C.bgCard,
  border: `1px solid ${C.border}`,
  borderRadius: '3px',
  padding: '0.9rem 1rem',
  ...extra,
});

const sectionTitle = (color = C.goldDim) => ({
  fontFamily: FONT.mono,
  fontSize: '0.42rem',
  letterSpacing: '0.18em',
  color,
  marginBottom: '0.55rem',
  textTransform: 'uppercase',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
});

const bubble = (color, extra = {}) => ({
  background: `${color}0F`,
  border: `1px solid ${color}28`,
  borderRadius: '2px',
  padding: '0.6rem 0.75rem',
  ...extra,
});

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Indicateur de progression circulaire */
function PhaseTracker({ currentPhase }) {
  const cur = PHASES[currentPhase]?.order ?? 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0', marginBottom: '1.4rem', padding: '0 1rem',
    }}>
      {PHASE_ORDER.map((ph, i) => {
        const p = PHASES[ph];
        const done    = p.order < cur;
        const active  = p.order === cur;
        const pending = p.order > cur;
        return (
          <div key={ph} style={{ display: 'flex', alignItems: 'center', flex: i < PHASE_ORDER.length - 1 ? 1 : 'none' }}>
            {/* Node */}
            <div style={{
              width: active ? '2.2rem' : '1.4rem',
              height: active ? '2.2rem' : '1.4rem',
              borderRadius: '50%',
              border: `1px solid ${active ? p.color : done ? C.textFaint : C.border}`,
              background: active ? `${p.color}18` : done ? 'rgba(58,191,122,0.06)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: active ? '0.9rem' : '0.65rem',
              flexShrink: 0,
              transition: 'all 0.4s ease',
              boxShadow: active ? `0 0 12px ${p.color}44` : 'none',
            }}>
              {done ? <span style={{ fontSize:'0.55rem', color: C.green }}>✓</span> : p.icon}
            </div>
            {/* Connector */}
            {i < PHASE_ORDER.length - 1 && (
              <div style={{
                flex: 1, height: '1px',
                background: done
                  ? `linear-gradient(90deg, ${C.textFaint}, ${C.border})`
                  : C.border,
                margin: '0 0.2rem',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Bloc ministre (position + mot_clé) */
function MinisterBlock({ minister }) {
  if (!minister) return null;
  const color = minister.color || C.gold;
  return (
    <div style={bubble(color, { marginBottom: '0.6rem' })}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem',
      }}>
        <span style={{ fontSize: '0.9rem' }}>{minister.emoji}</span>
        <div>
          <span style={{ fontFamily: FONT.mono, fontSize: '0.48rem', color, letterSpacing: '0.08em' }}>
            {minister.name}
          </span>
          {minister.mot_cle && (
            <span style={{
              fontFamily: FONT.mono, fontSize: '0.38rem', marginLeft: '0.5rem',
              padding: '0.1rem 0.35rem', borderRadius: '2px',
              background: `${color}18`, border: `1px solid ${color}28`,
              color: `${color}BB`, letterSpacing: '0.10em',
            }}>
              {minister.mot_cle}
            </span>
          )}
        </div>
      </div>
      <p style={{
        fontFamily: FONT.mono, fontSize: '0.47rem', color: C.text,
        lineHeight: 1.65, margin: 0,
      }}>
        {minister.position}
      </p>
    </div>
  );
}

/** Synthèse ministère (convergence + texte + recommandation) */
function MinistereSyntheseBlock({ synthese, ministry }) {
  if (!synthese) return null;
  const conv = synthese.convergence;
  return (
    <div style={{
      ...bubble(conv ? C.green : C.gold),
      marginTop: '0.6rem',
    }}>
      <div style={sectionTitle(conv ? C.green : C.gold)}>
        <span>{ministry?.emoji}</span>
        {loadLang()==='en'?'MINISTRY SYNTHESIS':'SYNTHÈSE DU MINISTÈRE'}
        <span style={{ margin: '0 0.5rem', color: 'rgba(150,170,210,0.18)', fontSize:'0.44rem' }}>—</span>
        <span style={{
          padding: '0.15rem 0.55rem',
          background: `${conv ? C.green : C.gold}22`,
          border: `1px solid ${conv ? C.green : C.gold}55`,
          borderRadius: '2px', fontSize: '0.44rem',
          letterSpacing: '0.13em', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px',
          color: conv ? C.green : C.gold,
        }}>
          {conv ? 'CONVERGENCE' : 'DIVERGENCE'}
        </span>
      </div>
      <p style={{ fontFamily: FONT.mono, fontSize: '0.47rem', color: C.text, lineHeight: 1.65, margin: '0 0 0.5rem' }}>
        {synthese.synthese}
      </p>
      {synthese.tension_residuelle && (
        <p style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: 'rgba(200,164,74,0.65)', lineHeight: 1.5, margin: '0 0 0.4rem', fontStyle: 'italic' }}>
          ⚡ {synthese.tension_residuelle}
        </p>
      )}
      {synthese.recommandation && (
        <div style={{
          fontFamily: FONT.mono, fontSize: '0.44rem', color: C.textDim,
          borderTop: `1px solid ${C.border}`, paddingTop: '0.4rem', marginTop: '0.2rem',
        }}>
          → {synthese.recommandation}
        </div>
      )}
    </div>
  );
}

/** Annotation cercle (1 ligne par ministère) */
function CercleAnnotation({ annotation, index }) {
  return (
    <div style={{
      display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
      padding: '0.45rem 0.6rem',
      borderLeft: `2px solid ${annotation.ministryColor || C.border}44`,
      marginBottom: '0.4rem',
      background: 'rgba(14,20,36,0.4)',
      borderRadius: '0 2px 2px 0',
      animation: `fadeSlideIn 0.35s ease ${index * 0.12}s both`,
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{annotation.ministryEmoji}</span>
      <div>
        <span style={{
          fontFamily: FONT.mono, fontSize: '0.40rem', color: annotation.ministryColor || C.textFaint,
          letterSpacing: '0.10em', display: 'block', marginBottom: '0.2rem',
        }}>
          {annotation.ministryName}
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.46rem', color: C.textDim, lineHeight: 1.55 }}>
          {annotation.annotation}
        </span>
      </div>
    </div>
  );
}

/** Bloc présidence (Phare ou Boussole) */
function PresidenceBlock({ agent, data, accent }) {
  return (
    <div style={bubble(accent, { marginBottom: '0.55rem' })}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '1.1rem', color: accent }}>{agent.symbol}</span>
        <div>
          <span style={{ fontFamily: FONT.cinzel, fontSize: '0.55rem', color: accent, letterSpacing: '0.12em' }}>
            {agent.name}
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: C.textFaint, marginLeft: '0.5rem' }}>
            {agent.subtitle}
          </span>
        </div>
      </div>
      <p style={{ fontFamily: FONT.mono, fontSize: '0.47rem', color: C.text, lineHeight: 1.65, margin: '0 0 0.4rem' }}>
        {data?.position}
      </p>
      {data?.decision && (
        <div style={{
          borderTop: `1px solid ${accent}22`, paddingTop: '0.35rem',
          fontFamily: FONT.mono, fontSize: '0.44rem', color: accent,
        }}>
          → {data.decision}
        </div>
      )}
    </div>
  );
}

// Dégradés verticaux par segment (clair en haut → foncé en bas, effet relief)
const VOTE_GRAD = {
  green:  'linear-gradient(180deg, rgb(72,205,140) 0%, rgb(28,118,70) 100%)',
  red:    'linear-gradient(180deg, rgb(215,88,88)  0%, rgb(138,42,42) 100%)',
  gold:   'linear-gradient(180deg, rgb(218,182,88) 0%, rgb(138,105,28) 100%)',
  purple: 'linear-gradient(180deg, rgb(158,118,242) 0%, rgb(85,50,158) 100%)',
};

/** Jauge de vote — supporte OUI/NON et PHARE/BOUSSOLE */
function VoteJauge({ oui, non, phare, boussole, type = 'referendum' }) {
  const isBinary = type === 'binary';

  let val1, val2, label1, label2, grad1, grad2, color1, color2, icon1, icon2;
  if (isBinary) {
    val1   = phare    || 0;  val2   = boussole || 0;
    label1 = '☉ PHARE';     label2 = '☽ BOUSSOLE';
    grad1  = VOTE_GRAD.gold; grad2  = VOTE_GRAD.purple;
    color1 = C.gold;         color2 = C.purple;
    icon1  = '☉';            icon2  = '☽';
  } else {
    val1   = oui || 0;       val2   = non || 0;
    label1 = '✓ OUI';        label2 = '✕ NON';
    grad1  = VOTE_GRAD.green; grad2 = VOTE_GRAD.red;
    color1 = C.green;        color2 = C.red;
    icon1  = '✓';            icon2  = '✕';
  }

  const total = val1 + val2;
  const pct1  = total > 0 ? Math.round((val1 / total) * 100) : 50;
  const pct2  = 100 - pct1;
  const fmt   = n => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M'
                   : n >= 1_000     ? (n / 1_000).toFixed(0) + 'k'
                   : String(n);

  return (
    <div style={{ marginTop: '0.8rem' }}>
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
          {pct1 >= 12 && `${icon1} ${pct1}%`}
        </div>
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: `${pct2}%`, background: grad2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'width 0.8s ease',
          fontFamily: FONT.mono, fontSize: '0.44rem', color: 'rgba(255,255,255,0.90)', fontWeight: 700,
        }}>
          {pct2 >= 12 && `${icon2} ${pct2}%`}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: color1 }}>{label1} · {fmt(val1)}</span>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: color2 }}>{label2} · {fmt(val2)}</span>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function LLMCouncil({ session, onVote, isRunning, countryContext, countryNom, ctxMode }) {
  const { lang } = useLocale();
  const scrollRef = useRef(null);
  const [openCtx, setOpenCtx] = useState(false);

  // Accordéon contexte — visible même en IDLE
  const ctxText = session?.countryDescription || '';
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
    PRESIDENCE:  !!session?.presidence,
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

  // Auto-scroll quand nouvelle phase apparaît
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 150);
    }
  }, [currentPhase]);

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (!session || currentPhase === 'IDLE') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0.8rem 1.2rem', overflow: 'hidden' }}>
        {renderCtxAccordion()}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: C.textFaint, fontFamily: FONT.mono }}>
          <div style={{ fontSize: '2.5rem', opacity: 0.12 }}>⚖️</div>
          <div style={{ fontSize: '0.52rem', letterSpacing: '0.18em', opacity: 0.4 }}>CONSEIL EN ATTENTE</div>
          <p style={{ fontSize: '0.44rem', color: C.textFaint, textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
            Sélectionnez un pays, choisissez un ministère dans le panneau latéral
            et soumettez une question pour lancer la délibération.
          </p>
        </div>
      </div>
    );
  }

  const { question, ministere, cercle, presidence, voteReady, voteResult } = session;
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
            label="PEUPLE"
            icon="🌐"
            accentColor={C.blue}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            <div style={bubble(C.blue)}>
              <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: C.blueDim, letterSpacing: '0.14em', marginBottom: '0.4rem' }}>
                QUESTION SOUMISE AU CONSEIL
              </div>
              <p style={{ fontFamily: FONT.cinzel, fontSize: '0.62rem', color: C.text, lineHeight: 1.6, margin: 0, letterSpacing: '0.04em' }}>
                « {question} »
              </p>
            </div>
          </PhaseBlock>
        )}

        {/* ── PHASE 2 : MINISTERE ──────────────────────────────────────────── */}
        {show.MINISTERE && ministere && (
          <PhaseBlock
            phase="MINISTERE"
            label={ministere.isOrphan
              ? t('COUNCIL_INSTANCE', loadLang())
              : `${loadLang()==='en'?'MINISTRY':'MINISTÈRE'} — ${ministere.ministryName}`}
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
                {loadLang()==='en'?'⚠ UNROUTED QUESTION — BUREAUCRATIC MODE ACTIVE':'⚠ QUESTION NON ROUTÉE — MODE BUREAUCRATIQUE ACTIVÉ'}
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
              {loadLang()==='en'?'MINISTRY ANNOTATIONS':'ANNOTATIONS DES MINISTÈRES'}
            </div>
            {cercle.map((a, i) => (
              <CercleAnnotation key={a.ministryId} annotation={a} index={i} />
            ))}
          </PhaseBlock>
        )}

        {/* ── PHASE 4 : PRESIDENCE ─────────────────────────────────────────── */}
        {show.PRESIDENCE && presidence && (
          <PhaseBlock
            phase="PRESIDENCE"
            label={t('COUNCIL_PHASE_PRESIDENCE', loadLang())}
            icon="☉"
            accentColor={C.purple}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            <PresidenceBlock agent={presidence.phare}    data={presidence.phare}    accent={C.gold}   />
            <PresidenceBlock agent={presidence.boussole} data={presidence.boussole} accent={C.purple} />
            {isRunning && !presidence.synthese && (
              <LoadingPulse label="ARBITRAGE EN COURS…" />
            )}
            {presidence.synthese && (
              <div style={bubble(convergence ? C.green : C.gold, { marginTop: '0.6rem' })}>
                <div style={sectionTitle(convergence ? C.green : C.gold)}>
                  ✦ SYNTHÈSE PRÉSIDENTIELLE
                  <span style={{ margin: '0 0.5rem', color: 'rgba(150,170,210,0.18)', fontSize:'0.44rem' }}>—</span>
                  <span style={{
                    padding: '0.15rem 0.55rem',
                    background: `${convergence ? C.green : C.gold}22`,
                    border: `1px solid ${convergence ? C.green : C.gold}55`,
                    borderRadius: '2px', fontSize: '0.44rem',
                    letterSpacing: '0.13em', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px',
                    color: convergence ? C.green : C.gold,
                  }}>
                    {convergence ? 'CONSENSUS' : 'DIVERGENCE'}
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
          {/* Résumé des deux positions */}
          {presidence?.synthese && (
            <div style={{ marginBottom: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ color: C.gold, fontSize: '0.8rem', flexShrink: 0, lineHeight: 1.4 }}>☉</span>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(200,180,100,0.70)', lineHeight: 1.5 }}>
            {presidence.synthese.position_phare_resume}
            </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ color: C.purple, fontSize: '0.8rem', flexShrink: 0, lineHeight: 1.4 }}>☽</span>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(160,130,220,0.70)', lineHeight: 1.5 }}>
            {presidence.synthese.position_boussole_resume}
            </span>
            </div>
            </div>
          )}

          {/* Proposition soumise au vote */}

          <div style={bubble(C.blue, { marginBottom: '0.8rem' })}>
          <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: C.blueDim, letterSpacing: '0.14em', marginBottom: '0.5rem' }}>
          PROPOSITION SOUMISE AU VOTE
          </div>
          <p style={{ fontFamily: FONT.cinzel, fontSize: '0.60rem', color: C.text, lineHeight: 1.65, margin: 0, letterSpacing: '0.02em' }}>
          {presidence?.synthese?.voteQuestion || presidence?.synthese?.question_referendum || question}
          </p>
          </div>

          {/* Boutons de vote conditionnels selon le type */}
          {presidence?.synthese?.voteType === 'referendum' ? (
            // Vote OUI/NON classique
            <div style={{ display: 'flex', gap: '0.7rem' }}>
            <VoteButton
            label={presidence.synthese.voteOptions?.oui?.label || "✓  OUI — ADOPTER"}
            color={presidence.synthese.voteOptions?.oui?.color || C.green}
            onClick={() => onVote?.('oui')}
            />
            <VoteButton
            label={presidence.synthese.voteOptions?.non?.label || "✕  NON — REJETER"}
            color={presidence.synthese.voteOptions?.non?.color || C.red}
            onClick={() => onVote?.('non')}
            />
            </div>
          ) : (
            //Vote binaire PHARE/BOUSSOLE
            <div style={{ display: 'flex', gap: '0.7rem' }}>
            <VoteButton
            label={presidence.synthese.voteOptions?.phare?.label || "☉ PHARE"}
            color={presidence.synthese.voteOptions?.phare?.color || C.goldHex}
            onClick={() => onVote?.('phare')}
            />
            <VoteButton
            label={presidence.synthese.voteOptions?.boussole?.label || "☽ BOUSSOLE"}
            color={presidence.synthese.voteOptions?.boussole?.color || C.purpleHex}
            onClick={() => onVote?.('boussole')}
            />
            </div>
          )}
          </PhaseBlock>
        )}

        {/* ── PHASE 6 : RÉSULTAT ───────────────────────────────────────────── */}
        {show.RESULT && voteResult && (
          <PhaseBlock
            phase="RESULT"
            label={t('COUNCIL_PHASE_RESULT', loadLang())}
            icon="✦"
            accentColor={voteResult.vote === 'phare' ? C.gold :
              voteResult.vote === 'boussole' ? C.purple :
              voteResult.vote === 'oui' ? C.green : C.red}
            style={{ animation: 'fadeSlideIn 0.5s ease both' }}
          >
            <div style={bubble(
              voteResult.vote === 'phare' ? C.gold :
              voteResult.vote === 'boussole' ? C.purple :
              voteResult.vote === 'oui' ? C.green : C.red,
              { marginBottom: '0.7rem' }
            )}>
              <div style={{
                fontFamily: FONT.mono, fontSize: '0.40rem',
                color: voteResult.vote === 'phare' ? C.gold :
                voteResult.vote === 'boussole' ? C.purple :
                voteResult.vote === 'oui' ? C.green : C.red,
                letterSpacing: '0.14em', marginBottom: '0.5rem',
              }}>
                DÉCISION DU PEUPLE — {
                  voteResult.vote === 'phare' ? '☉ PHARE' :
                  voteResult.vote === 'boussole' ? '☽ BOUSSOLE' :
                  voteResult.vote === 'oui' ? '✓ OUI' : '✕ NON'
                }
              </div>
              <p style={{ fontFamily: FONT.mono, fontSize: '0.50rem', color: C.text, lineHeight: 1.6, margin: 0 }}>
                {voteResult.label}
              </p>
            </div>

            <VoteJauge
              type={voteResult.voteType || 'referendum'}
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

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANTS UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

function PhaseBlock({ children, label, icon, accentColor, style }) {
  return (
    <div style={{
      marginBottom: '1rem',
      borderLeft: `2px solid ${accentColor}44`,
      paddingLeft: '0.9rem',
      ...style,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        marginBottom: '0.65rem',
      }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <span style={{
          fontFamily: FONT.mono, fontSize: '0.42rem', letterSpacing: '0.18em',
          color: accentColor, textTransform: 'uppercase',
        }}>
          {label}
        </span>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${accentColor}30, transparent)` }} />
      </div>
      {children}
    </div>
  );
}

function VoteButton({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '0.65rem 0.5rem',
        fontFamily: FONT.mono, fontSize: '0.48rem', letterSpacing: '0.08em',
        color, background: `${color}0D`,
        border: `1px solid ${color}44`,
        borderRadius: '2px', cursor: 'pointer',
        textTransform: 'uppercase', lineHeight: 1.3,
        transition: 'all 0.15s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}88`; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}0D`; e.currentTarget.style.borderColor = `${color}44`; }}
    >
      {label}
    </button>
  );
}

function StatImpact({ label, delta }) {
  if (delta === undefined || delta === null || delta === 0) return null;
  const positive = delta > 0;
  const color = positive ? C.green : C.red;
  return (
    <div style={{
      fontFamily: FONT.mono, fontSize: '0.42rem', color: C.textFaint,
      display: 'flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.3rem 0.5rem',
      background: `${color}0A`, border: `1px solid ${color}22`, borderRadius: '2px',
    }}>
      <span>{label}</span>
      <span style={{ color, fontWeight: 700 }}>
        {positive ? '+' : ''}{delta}
      </span>
    </div>
  );
}

function LoadingPulse({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      fontFamily: FONT.mono, fontSize: '0.44rem',
      color: C.textFaint, padding: '0.4rem 0',
      animation: 'pulse 1.4s ease-in-out infinite',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: C.goldDim, display: 'inline-block',
        animation: 'pulse 0.9s ease-in-out infinite',
      }} />
      {label || 'EN COURS…'}
    </div>
  );
}
