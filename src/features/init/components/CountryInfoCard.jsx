// ═══════════════════════════════════════════════════════════════════════════
//  CountryInfoCard.jsx — Carte d'info d'un pays réel prédéfini
//
//  Affiche : population, indice PIB, taux d'acceptation ARIA IRL,
//  sociologie ARIA, et un accordéon contexte géopolitique.
//  Utilisé dans FictionalCountrySection et RealCountryLocalSection.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, labelStyle } from '../../../shared/theme';

export default function CountryInfoCard({ data }) {
  const { lang } = useLocale();
  const [open, setOpen] = useState(false);
  if (!data) return null;
  // Formattage population : Md / M / k
  const fmtPop = (n) => n >= 1e9 ? (n/1e9).toFixed(1)+' Md' : n >= 1e6 ? (n/1e6).toFixed(1)+' M' : n >= 1e3 ? Math.round(n/1e3)+' k' : String(n);
  // Couleur jauge ARIA IRL : violet (≥60%) → bleu (≥40%) → gris (<40%)
  const ariaCol = data.aria_acceptance_irl >= 60 ? 'rgba(140,100,220,0.80)'
                : data.aria_acceptance_irl >= 40 ? 'rgba(100,130,200,0.70)'
                :                                  'rgba(90,110,160,0.50)';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
      {/* Rangée principale */}
      <div style={{ display:'flex', gap:'0.8rem', alignItems:'flex-start' }}>
        {/* Population + régime */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.25rem' }}>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.55)', letterSpacing:'0.08em' }}>POP.</span>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.46rem', color:'rgba(200,215,240,0.75)', fontWeight:600 }}>{fmtPop(data.population)}</span>
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.55)', letterSpacing:'0.08em' }}>PIB</span>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.46rem', color:'rgba(200,215,240,0.75)' }}>Indice {data.pib_index}</span>
          </div>
        </div>
        {/* ARIA IRL */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.2rem' }}>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.41rem', letterSpacing:'0.10em', color:ariaCol }}>ARIA IRL</div>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.90rem', fontWeight:700, color:ariaCol, lineHeight:1 }}>{data.aria_acceptance_irl}%</div>
          <div style={{ width:60, height:4, background:'rgba(14,20,36,0.9)', borderRadius:'2px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${data.aria_acceptance_irl}%`, background:ariaCol, borderRadius:'2px' }} />
          </div>
        </div>
      </div>
      {/* Sociologie ARIA */}
      <div style={{ fontSize:'0.44rem', color:'rgba(120,140,180,0.55)', lineHeight:1.55, fontStyle:'italic', padding:'0.35rem 0.5rem', background:'rgba(200,164,74,0.03)', borderRadius:'2px', borderLeft:'2px solid rgba(200,164,74,0.15)' }}>
        {data.aria_sociology_logic}
      </div>
      {/* Contexte géopolitique — expandable */}
      {data.triple_combo && (
        <button
          onClick={() => setOpen(o=>!o)}
          style={{ background:'none', border:'1px solid rgba(90,110,160,0.20)', borderRadius:'2px', padding:'0.28rem 0.55rem', cursor:'pointer', fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(90,110,160,0.55)', textAlign:'left', letterSpacing:'0.08em' }}>
          {open ? lang==='en'?'▲ Hide geopolitical context':'▲ Masquer le contexte géopolitique' : lang==='en'?'▼ Show geopolitical context':'▼ Voir le contexte géopolitique'}
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
