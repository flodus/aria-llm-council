// src/features/world/modals/SecessionModal.jsx
import { useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { getRegimeLabel } from '../../../shared/data/worldLabels';
import { S } from './modalStyles';

export default function SecessionModal({ parent, onConfirm, onClose }) {
  const { lang: uiLang } = useLocale();
  const MONO = "'JetBrains Mono', monospace";
  const [nom,      setNom]      = useState('');
  const [relation, setRelation] = useState('Tension');
  const [regime,   setRegime]   = useState(parent?.regime || 'republique_federale');
  const [step,     setStep]     = useState(1);

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

        {/* ── Étape 1 : formulaire ── */}
        {step === 1 && (
          <>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <p style={S.modalHint}>
                {uiLang==='en'?`The new country inherits 25% of the population and resources. ${parent?.nom} loses 25% of its population and 12% of its size.`:`Le nouveau pays hérite de 25% de la population et des ressources. ${parent?.nom} perd 25% de sa population et 12% de sa taille.`}
              </p>
              <label style={S.fieldLabel}>{uiLang==='en'?'NEW COUNTRY NAME':'NOM DU NOUVEAU PAYS'}</label>
              <input
                style={S.fieldInput}
                value={nom}
                onChange={e => setNom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nom.trim() && setStep(2)}
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
                onClick={() => setStep(2)}
              >
                {uiLang==='en'?'NEXT →':'SUIVANT →'}
              </button>
            </div>
          </>
        )}

        {/* ── Étape 2 : choix hériter / s'affranchir ── */}
        {step === 2 && (
          <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(200,164,74,0.05)', border: '1px solid rgba(200,164,74,0.15)', borderRadius: '2px' }}>
              <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.14em', color: 'rgba(200,164,74,0.50)', marginBottom: '0.35rem' }}>
                {uiLang==='en'?`WILL INHERIT FROM ${parent?.nom?.toUpperCase()}`:`HÉRITERA DE ${parent?.nom?.toUpperCase()}`}
              </div>
              <div style={{ fontFamily: MONO, fontSize: '0.40rem', color: 'rgba(140,160,200,0.55)', lineHeight: 1.6 }}>
                {parent?.emoji} {parent?.nom}<br/>
                ⚖️ {getRegimeLabel(parent?.regime, uiLang)}<br/>
                {parent?.leader ? `👤 ${parent.leader}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                style={{ flex: 1, fontFamily: MONO, fontSize: '0.46rem', padding: '0.55rem 0.5rem', background: 'rgba(200,164,74,0.07)', border: '1px solid rgba(200,164,74,0.25)', borderRadius: '2px', color: 'rgba(200,164,74,0.85)', cursor: 'pointer' }}
                onClick={() => onConfirm(nom.trim(), relation, regime, false)}>
                {uiLang==='en'?'Inherit →':'Hériter du parent →'}
              </button>
              <button
                style={{ flex: 1, fontFamily: MONO, fontSize: '0.46rem', padding: '0.55rem 0.5rem', background: 'rgba(220,80,80,0.07)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: '2px', color: 'rgba(220,80,80,0.80)', cursor: 'pointer' }}
                onClick={() => onConfirm(nom.trim(), relation, regime, true)}>
                {uiLang==='en'?'Break free →':'S\'en affranchir →'}
              </button>
            </div>
            <button style={{ ...S.cancelBtn, alignSelf: 'center' }} onClick={() => setStep(1)}>← {uiLang==='en'?'Back':'Retour'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
