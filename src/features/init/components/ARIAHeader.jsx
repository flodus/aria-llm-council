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

export default function ARIAHeader({ showQuote }) {
  const { lang } = useLocale();
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{
        fontFamily: FONT.cinzel, fontSize:'clamp(2.4rem,6vw,4rem)', fontWeight:700,
        letterSpacing:'clamp(0.6rem,1.5vw,1.1rem)', color:'#C8A44A',
        textShadow:'0 0 60px rgba(200,164,74,0.45)', animation:'float 4s ease-in-out infinite',
      }}>ARIA</div>
      <div style={{
        fontFamily: FONT.cinzel, fontSize:'0.50rem', letterSpacing:'0.32em',
        color:'#3A4A62', marginTop:'0.4rem',
      }}>ARCHITECTURE DE RAISONNEMENT INSTITUTIONNEL PAR L'IA</div>
      {showQuote && (
        <p style={{
          fontSize:'0.75rem', color:'#5A6A8A', fontStyle:'italic',
          marginTop:'0.8rem', lineHeight:1.75, maxWidth:380, textAlign:'center',
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
