// src/features/init/components/ARIAHeader.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  ARIAHeader.jsx — Logo ARIA animé + sous-titre acronyme + citation optionnelle
//
//  showQuote : affiche la citation d'accroche (FR/EN) sous le logo.
//  Animation CSS "float" définie globalement dans index.css.
//
//  Dépendances : ariaI18n, shared/theme (FONT)
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale } from '../../../ariaI18n';
import { FONT, cinzel, mono } from '../../../shared/theme';

export default function ARIAHeader({ showQuote, lang: langProp, setLang }) {
  const { lang: localeLang } = useLocale();
  const lang = langProp ?? localeLang;
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'1.2rem' }}>
        <div style={{
          fontFamily: FONT.cinzel, fontSize:'clamp(2.4rem,6vw,4rem)', fontWeight:700,
          letterSpacing:'clamp(0.6rem,1.5vw,1.1rem)', color:'#C8A44A',
          textShadow:'0 0 60px rgba(200,164,74,0.45)', animation:'float 4s ease-in-out infinite',
        }}>ARIA</div>
        {setLang && (
          <div style={{ display:'flex', gap:'0.3rem' }}>
            {['fr','en'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang===l ? 'rgba(200,164,74,0.15)' : 'transparent',
                border:`1px solid ${lang===l ? 'rgba(200,164,74,0.45)' : 'rgba(255,255,255,0.10)'}`,
                borderRadius:'2px', padding:'0.22rem 0.55rem',
                color: lang===l ? 'rgba(200,164,74,0.90)' : 'rgba(150,170,205,0.35)',
                fontFamily:FONT.mono, fontSize:'0.44rem',
                letterSpacing:'0.10em', cursor:'pointer', transition:'all 0.15s',
                display:'flex', alignItems:'center', gap:'0.25rem',
              }}>
                <span style={{fontSize:'0.85rem',lineHeight:1}}>{l==='fr'?'🇫🇷':'🇬🇧'}</span>
                <span>{l.toUpperCase()}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: FONT.cinzel, fontSize:'0.50rem', letterSpacing:'0.32em',
        color:'#3A4A62', marginTop:'0.4rem', whiteSpace:'nowrap',
      }}>ARCHITECTURE DE RAISONNEMENT INSTITUTIONNEL PAR L'IA</div>
      {showQuote && (
        <p style={{
          fontSize:'0.75rem', color:'#5A6A8A', fontStyle:'italic',
          marginTop:'0.8rem', lineHeight:1.75, maxWidth:380, textAlign:'center', margin:'0.8rem auto 0',
        }}>
          {lang==='en'
            ? "What if a country's policies were submitted to the people through a council of AI ministers?"
            : "Et si les politiques d'un pays étaient soumises au peuple par l'intermédiaire d'un conseil des ministres IA ?"
          }
        </p>
      )}
    </div>
  );
}
