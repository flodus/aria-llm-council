import { COLOR } from './colors';
import { FONT } from './typography';

// Styles réutilisables
export const CARD_STYLE = {
    background: COLOR.bgCard, border: `1px solid ${COLOR.border}`,
    borderRadius: '2px', padding: '1.2rem 1.4rem',
};

export const INPUT_STYLE = {
    background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLOR.goldBorder}`,
    borderRadius: '2px', padding: '0.55rem 0.8rem',
    color: 'rgba(220,228,240,0.88)', fontFamily: FONT.mono,
    fontSize: '0.60rem', outline: 'none', width: '100%', boxSizing: 'border-box',
};

export const SELECT_STYLE = {
    background: 'rgba(8,14,26,0.95)', border: '1px solid rgba(200,164,74,0.18)',
    borderRadius: '2px', padding: '0.4rem 0.6rem',
    color: 'rgba(200,215,240,0.80)', fontFamily: FONT.mono,
    fontSize: '0.50rem', outline: 'none', width: '100%', cursor: 'pointer',
};

export const BTN_PRIMARY = {
    background: 'rgba(200,164,74,0.12)', border: '1px solid rgba(200,164,74,0.40)',
    borderRadius: '2px', padding: '0.55rem 1.2rem',
    color: 'rgba(200,164,74,0.88)', fontFamily: FONT.mono,
    fontSize: '0.52rem', letterSpacing: '0.18em', cursor: 'pointer',
};

export const BTN_SECONDARY = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '2px', padding: '0.55rem 1.2rem',
    color: 'rgba(180,200,230,0.40)', fontFamily: FONT.mono,
    fontSize: '0.52rem', letterSpacing: '0.14em', cursor: 'pointer',
};

// Styles de mise en page (wrap, mCard, tag)
export const wrap = (wide) => ({
    display:'flex', flexDirection:'column', alignItems:'center',
    gap:'1.8rem', width:'100%', maxWidth: wide ? 700 : 460, padding:'2rem',
    overflowY:'auto', maxHeight:'calc(100vh - 2rem)', boxSizing:'border-box',
});

export const wrapNarrow = {
    display:'flex', flexDirection:'column', alignItems:'center',
    gap:'1.8rem', width:'100%', maxWidth: 460, padding:'2rem',
    overflowY:'auto', maxHeight:'calc(100vh - 2rem)', boxSizing:'border-box',
};

export const wrapWide = {
    display:'flex', flexDirection:'column', alignItems:'center',
    gap:'1.8rem', width:'100%', maxWidth: 700, padding:'2rem',
    overflowY:'auto', maxHeight:'calc(100vh - 2rem)', boxSizing:'border-box',
};

export const mCard = {
    background:'rgba(8,14,26,0.80)', border:'1px solid rgba(140,160,200,0.15)',
    borderRadius:'3px', padding:'0.85rem 1rem', cursor:'pointer',
    display:'flex', flexDirection:'column', gap:'0.35rem', flex:1,
    transition:'border-color 0.15s, background 0.15s',
};

export const tag = {
    fontFamily: FONT.mono, fontSize:'0.44rem', letterSpacing:'0.12em',
    padding:'0.2rem 0.5rem', borderRadius:'2px',
    border:'1px solid rgba(200,164,74,0.20)', color:'rgba(200,164,74,0.55)',
    background:'rgba(200,164,74,0.05)',
};
