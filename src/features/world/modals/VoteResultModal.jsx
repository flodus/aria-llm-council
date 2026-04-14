// src/features/world/modals/VoteResultModal.jsx
import { useLocale, t } from '../../../ariaI18n';
import { C, FONT } from '../../../shared/theme';
import { S } from './modalStyles';

// Pastille colorée affichant un delta (+N / -N) pour les impacts de vote
export function ImpactPill({ label, delta }) {
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

export default function VoteResultModal({ session, onClose }) {
  const { lang: uiLang } = useLocale();
  const { question, voteResult, presidence } = session || {};
  if (!voteResult) return null;

  const isBinary = voteResult.voteType === 'binary';
  const isDivergence = presidence?.synthese?.convergence === false;
  const isPhare = voteResult.vote === 'phare' || (isDivergence && voteResult.vote === 'oui');
  const isOui = voteResult.vote === 'oui';

  let vColor, vIcon, vLabel, vOptionLabel;

  if (isBinary || isDivergence) {
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

  let total, pct1, pct2, label1, label2, color1, color2, grad1, grad2, val1, val2;

  if (isBinary || isDivergence) {
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

    <div style={{ ...S.modalHeader, borderBottomColor: `${vColor}28` }}>
    <span style={{ ...S.modalTitle, color: vColor }}>
    ✦ RÉSULTAT DU CONSEIL
    </span>
    <button style={S.closeBtn} onClick={onClose}>✕</button>
    </div>

    <div style={{ padding: '0.9rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

    <div>
    <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.18em', color: 'rgba(140,160,200,0.50)', marginBottom: '0.3rem' }}>
    QUESTION SOUMISE
    </div>
    <p style={{ fontFamily: FONT.serif, fontSize: '0.54rem', color: 'rgba(200,215,240,0.80)', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
    « {presidence?.synthese?.voteQuestion || presidence?.synthese?.question_referendum || question} »
    </p>
    </div>

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
    {pct2 >= 12 && `${(isBinary || isDivergence) ? (isPhare ? '☽' : '☉') : '✕'} ${pct2}%`}
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

    <div style={S.modalFooter}>
    <button style={S.saveBtn} onClick={onClose}>OK — CONTINUER</button>
    </div>
    </div>
    </div>
  );
}
