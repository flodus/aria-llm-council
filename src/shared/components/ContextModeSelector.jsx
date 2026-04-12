// src/shared/components/ContextModeSelector.jsx
// Sélecteur mode contexte pays — partagé entre Init (ContextPanel), Settings, ConstitutionModal
// Ajouter un mode dans governanceConfig.js = automatiquement visible ici.

import { useLocale } from '../../ariaI18n';
import { FONT } from '../theme';
import { CONTEXT_MODES, CONTEXT_MODE_INHERIT } from '../config/governanceConfig';

export default function ContextModeSelector({ value, onChange, name = 'ctx_mode', showInherit = false, inheritHint }) {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const modes = showInherit ? [CONTEXT_MODE_INHERIT, ...CONTEXT_MODES] : CONTEXT_MODES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.26rem' }}>
      {modes.map(m => {
        const label = m.icon + ' ' + (isEn ? m.label.en : m.label.fr);
        const hint  = m.value === '' && inheritHint
          ? inheritHint
          : (isEn ? m.hint.en : m.hint.fr);
        const on = value === m.value;
        return (
          <label key={m.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem',
            cursor: 'pointer', padding: '0.30rem 0.5rem', borderRadius: '2px',
            background: on ? 'rgba(200,164,74,0.07)' : 'transparent',
            border: `1px solid ${on ? 'rgba(200,164,74,0.25)' : 'transparent'}`,
            width: '100%', boxSizing: 'border-box' }}>
            <input type="radio" name={name} value={m.value} checked={on}
              onChange={() => onChange(m.value)}
              style={{ accentColor: '#C8A44A', flexShrink: 0, marginTop: '0.08rem' }} />
            <div>
              <div style={{ fontFamily: FONT.mono, fontSize: '0.46rem',
                color: on ? 'rgba(200,164,74,0.88)' : 'rgba(200,215,240,0.78)' }}>{label}</div>
              {hint && <div style={{ fontSize: '0.40rem', color: 'rgba(140,160,200,0.46)',
                marginTop: '0.05rem', lineHeight: 1.35 }}>{hint}</div>}
            </div>
          </label>
        );
      })}
    </div>
  );
}
