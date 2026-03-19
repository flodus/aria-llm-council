// src/shared/theme/components.js

import { FONT } from './ariaTheme';
import { COLORS } from './colors';

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
