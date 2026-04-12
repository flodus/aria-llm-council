// src/shared/components/ChroniqueurToggle.jsx
// Toggle chroniqueur partagé : null = hérite global, true = actif, false = inactif

import { useLocale } from '../../ariaI18n';
import { FONT } from '../theme';

export default function ChroniqueurToggle({ value, onChange }) {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const options = [
    [null,  isEn ? '⚙ Global'  : '⚙ Global' ],
    [true,  isEn ? '● On'      : '● Actif'   ],
    [false, isEn ? '○ Off'     : '○ Inactif' ],
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.28rem 0.45rem', borderRadius: '2px',
      background: 'rgba(90,110,160,0.04)', border: '1px solid rgba(90,110,160,0.12)' }}>
      <span style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: 'rgba(140,160,200,0.55)', flex: 1 }}>
        📜 {isEn ? 'Chronicler' : 'Chroniqueur'}
      </span>
      {options.map(([val, lbl]) => {
        const on = value === val;
        return (
          <button key={String(val)} onClick={() => onChange(val)}
            style={{ fontFamily: FONT.mono, fontSize: '0.38rem', padding: '0.10rem 0.35rem',
              borderRadius: '2px', cursor: 'pointer',
              background: on ? 'rgba(200,164,74,0.10)' : 'transparent',
              border: `1px solid ${on ? 'rgba(200,164,74,0.35)' : 'rgba(140,160,200,0.12)'}`,
              color: on ? 'rgba(200,164,74,0.85)' : 'rgba(140,160,200,0.40)' }}>
            {lbl}
          </button>
        );
      })}
    </div>
  );
}
