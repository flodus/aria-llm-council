// src/features/council/components/councilParts.jsx
// Sous-composants de rendu du Conseil ARIA — aucune logique métier

import { loadLang } from '../../../ariaI18n';
import { C, FONT } from '../../../shared/theme';
import { PHASES, PHASE_ORDER, sectionTitle, bubble, VOTE_GRAD } from './councilStyles';

// ─── PhaseTracker ─────────────────────────────────────────────────────────────

/** Indicateur de progression circulaire */
export function PhaseTracker({ currentPhase }) {
  const cur = PHASES[currentPhase]?.order ?? 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0', marginBottom: '1.4rem', padding: '0 1rem',
    }}>
      {PHASE_ORDER.map((ph, i) => {
        const p      = PHASES[ph];
        const done   = p.order < cur;
        const active = p.order === cur;
        return (
          <div key={ph} style={{ display: 'flex', alignItems: 'center', flex: i < PHASE_ORDER.length - 1 ? 1 : 'none' }}>
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
              {done ? <span style={{ fontSize: '0.55rem', color: C.green }}>✓</span> : p.icon}
            </div>
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

// ─── Blocs ministres ──────────────────────────────────────────────────────────

/** Bloc ministre (position + mot_clé) */
export function MinisterBlock({ minister }) {
  if (!minister) return null;
  const color = minister.color || C.gold;
  return (
    <div style={bubble(color, { marginBottom: '0.6rem' })}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
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
      <p style={{ fontFamily: FONT.mono, fontSize: '0.47rem', color: C.text, lineHeight: 1.65, margin: 0 }}>
        {minister.position}
      </p>
    </div>
  );
}

/** Synthèse ministère (convergence + texte + recommandation) */
export function MinistereSyntheseBlock({ synthese, ministry }) {
  if (!synthese) return null;
  const conv = synthese.convergence;
  return (
    <div style={{ ...bubble(conv ? C.green : C.gold), marginTop: '0.6rem' }}>
      <div style={sectionTitle(conv ? C.green : C.gold)}>
        <span>{ministry?.emoji}</span>
        {loadLang() === 'en' ? 'MINISTRY SYNTHESIS' : 'SYNTHÈSE DU MINISTÈRE'}
        <span style={{ margin: '0 0.5rem', color: 'rgba(150,170,210,0.18)', fontSize: '0.44rem' }}>—</span>
        <span style={{
          padding: '0.15rem 0.55rem',
          background: `${conv ? C.green : C.gold}22`,
          border: `1px solid ${conv ? C.green : C.gold}55`,
          borderRadius: '2px', fontSize: '0.44rem',
          letterSpacing: '0.13em', fontWeight: 700,
          textDecoration: 'underline', textUnderlineOffset: '3px',
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

// ─── Voix de la Destinée ──────────────────────────────────────────────────────

/** Voix de la Destinée (Oracle ou Wyrd) */
export function DestinVoiceBlock({ agent }) {
  if (!agent) return null;
  const color = agent.color || '#B87A00';
  return (
    <div style={bubble(color, { marginBottom: '0.6rem' })}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.9rem' }}>{agent.emoji}</span>
        <span style={{ fontFamily: FONT.cinzel, fontSize: '0.52rem', color, letterSpacing: '0.10em' }}>
          {agent.name}
        </span>
        {agent.sign && (
          <span style={{
            fontFamily: FONT.mono, fontSize: '0.38rem',
            padding: '0.1rem 0.35rem', borderRadius: '2px',
            background: `${color}18`, border: `1px solid ${color}28`,
            color: `${color}BB`, letterSpacing: '0.10em',
          }}>
            {agent.sign}
          </span>
        )}
      </div>
      <p style={{ fontFamily: FONT.mono, fontSize: '0.47rem', color: C.text, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
        {agent.position}
      </p>
    </div>
  );
}

// ─── Cercle ministériel ───────────────────────────────────────────────────────

/** Annotation cercle (1 ligne par ministère) */
export function CercleAnnotation({ annotation, index }) {
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
          fontFamily: FONT.mono, fontSize: '0.40rem',
          color: annotation.ministryColor || C.textFaint,
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

// ─── Présidence ───────────────────────────────────────────────────────────────

/** Bloc présidence (Phare ou Boussole) */
export function PresidenceBlock({ agent, data, accent }) {
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

// ─── Jauge de vote ────────────────────────────────────────────────────────────

/** Jauge de vote — supporte OUI/NON et PHARE/BOUSSOLE */
export function VoteJauge({ oui, non, phare, boussole, type = 'referendum' }) {
  const isBinary = type === 'binary';

  let val1, val2, label1, label2, grad1, grad2, color1, color2, icon1, icon2;
  if (isBinary) {
    val1   = phare    || 0;  val2   = boussole || 0;
    label1 = '☉ PHARE';     label2 = '☽ BOUSSOLE';
    grad1  = VOTE_GRAD.gold; grad2  = VOTE_GRAD.purple;
    color1 = C.gold;         color2 = C.purple;
    icon1  = '☉';            icon2  = '☽';
  } else {
    val1   = oui || 0;        val2   = non || 0;
    label1 = '✓ OUI';         label2 = '✕ NON';
    grad1  = VOTE_GRAD.green;  grad2  = VOTE_GRAD.red;
    color1 = C.green;          color2 = C.red;
    icon1  = '✓';              icon2  = '✕';
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

// ─── Composants utilitaires ───────────────────────────────────────────────────

/** Bloc de phase avec bordure colorée et titre */
export function PhaseBlock({ children, label, icon, accentColor, style }) {
  return (
    <div style={{
      marginBottom: '1rem',
      borderLeft: `2px solid ${accentColor}44`,
      paddingLeft: '0.9rem',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
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

/** Bouton de vote */
export function VoteButton({ label, color, onClick }) {
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

/** Indicateur d'impact stat (+/-) */
export function StatImpact({ label, delta }) {
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

/** Indicateur de chargement pulsant */
export function LoadingPulse({ label }) {
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
