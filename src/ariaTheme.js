// ═══════════════════════════════════════════════════════════════════════════
//  ariaTheme.js — Tokens de design, helpers visuels, constantes UI
//  Aucun JSX. Importé par tous les composants.
// ═══════════════════════════════════════════════════════════════════════════

export const COLOR = {
    gold:       'rgba(200,164,74,0.88)',
    goldMid:    'rgba(200,164,74,0.55)',
    goldDim:    'rgba(200,164,74,0.30)',
    goldFaint:  'rgba(200,164,74,0.08)',
    goldBorder: 'rgba(200,164,74,0.22)',
    blue:       'rgba(140,160,200,0.70)',
    blueDim:    'rgba(140,160,200,0.45)',
    blueFaint:  'rgba(90,110,160,0.35)',
    violet:     'rgba(140,100,220,0.85)',
    violetDim:  'rgba(140,100,220,0.50)',
    red:        '#FF3A3A',
    redDim:     'rgba(200,80,80,0.65)',
    green:      'rgba(100,200,120,0.70)',
    bg:         'rgba(4,8,18,0.97)',
    bgCard:     'rgba(255,255,255,0.025)',
    border:     'rgba(255,255,255,0.07)',
};

export const FONT = {
    cinzel: "'Cinzel', serif",
    mono:   "'JetBrains Mono', monospace",
};

// Inline style helpers
export const cinzel = (size, color = COLOR.gold, extra = {}) =>
({ fontFamily: FONT.cinzel, fontSize: size, color, ...extra });

export const mono = (size, color = COLOR.blueDim, extra = {}) =>
({ fontFamily: FONT.mono, fontSize: size, color, letterSpacing: '0.12em', ...extra });

export const labelStyle = (size = '0.48rem') => ({
    fontFamily: FONT.mono, fontSize: size,
    letterSpacing: '0.18em', color: COLOR.goldMid, textTransform: 'uppercase',
});

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

// Utilitaires purs
export const satisfColor = (p) =>
p >= 70 ? '#3ABF7A' : p >= 45 ? '#C8A44A' : p >= 25 ? '#C05050' : '#8A2020';

export const fmtPop = (n) =>
n >= 1e9 ? (n/1e9).toFixed(1)+' Md'
: n >= 1e6 ? (n/1e6).toFixed(1)+' M'
: n >= 1e3 ? Math.round(n/1e3)+' k'
: String(n);

export const TERRAIN_LABELS = {
    coastal:'Côtier 🌊', inland:'Continental 🏔', island:'Insulaire 🏝',
    archipelago:'Archipel ⛵', highland:'Montagneux ⛰',
};

export const REGIME_LABELS = {
    democratie_liberale:         'Démocratie libérale 🗳️',
    republique_federale:         'République fédérale 🏛️',
    monarchie_constitutionnelle: 'Monarchie constitutionnelle 👑',
    monarchie_absolue:           'Monarchie absolue 👑',
    technocratie_ia:             'Technocratie IA 🤖',
    oligarchie:                  'Oligarchie 💼',
    junte_militaire:             'Junte militaire 🎖️',
    regime_autoritaire:          'Régime autoritaire 🔒',
    theocracie:                  'Théocratie 🕌',
    communisme:                  'Parti communiste ☭',
    nationalisme_autoritaire:    'Nationalisme autoritaire ⚡',
};

export const RESOURCE_DEFS = [
    { key: 'agriculture', icon: '🌾', label: 'AGRICULTURE' },
    { key: 'bois',        icon: '🪵', label: 'BOIS'        },
    { key: 'eau',         icon: '💧', label: 'EAU DOUCE'   },
    { key: 'energie',     icon: '⚡', label: 'ÉNERGIE'     },
    { key: 'mineraux',    icon: '💎', label: 'MINÉRAUX'    },
    { key: 'peche',       icon: '🐟', label: 'PÊCHE'       },
    { key: 'petrole',     icon: '🛢️', label: 'PÉTROLE'     },
];

export const MARITIME = new Set(['coastal', 'island', 'archipelago']);
