// ═══════════════════════════════════════════════════════════════════════════
//  ariaTheme.js — Tokens de design, helpers visuels, constantes UI
//  Aucun JSX. Importé par tous les composants.
//
//  I18N : TERRAIN_LABELS, REGIME_LABELS, RESOURCE_DEFS sont bilingues {fr,en}
//  Utiliser getTerrainLabel(key, lang), getRegimeLabel(key, lang),
//  getResourceLabel(key, lang) pour obtenir le bon label selon la langue.
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

// ── Utilitaires purs ─────────────────────────────────────────────────────

export const satisfColor = (p) =>
    p >= 70 ? '#3ABF7A' : p >= 45 ? '#C8A44A' : p >= 25 ? '#C05050' : '#8A2020';

// lang optionnel : 'fr' → Md/M/k, 'en' → Bn/M/k
export const fmtPop = (n, lang = 'fr') =>
    n >= 1e9 ? (n/1e9).toFixed(1) + (lang === 'en' ? ' Bn' : ' Md')
    : n >= 1e6 ? (n/1e6).toFixed(1) + ' M'
    : n >= 1e3 ? Math.round(n/1e3) + ' k'
    : String(n);

// ── Labels bilingues — données ────────────────────────────────────────────

// Structure : { clé: { fr: '...', en: '...' } }
export const TERRAIN_LABELS = {
    coastal:     { fr: 'Côtier 🌊',      en: 'Coastal 🌊'      },
    inland:      { fr: 'Continental 🏔',  en: 'Landlocked 🏔'   },
    island:      { fr: 'Insulaire 🏝',    en: 'Island 🏝'       },
    archipelago: { fr: 'Archipel ⛵',     en: 'Archipelago ⛵'  },
    highland:    { fr: 'Montagneux ⛰',   en: 'Highland ⛰'     },
    desert:      { fr: 'Désert 🏜',       en: 'Desert 🏜'       },
    foret:       { fr: 'Forêt 🌲',        en: 'Forest 🌲'       },
    tropical:    { fr: 'Tropical 🌴',     en: 'Tropical 🌴'     },
    toundra:     { fr: 'Toundra ❄',       en: 'Tundra ❄'       },
};

export const REGIME_LABELS = {
    democratie_liberale:         { fr: 'Démocratie libérale 🗳️',          en: 'Liberal Democracy 🗳️'          },
    republique_federale:         { fr: 'République fédérale 🏛️',           en: 'Federal Republic 🏛️'           },
    monarchie_constitutionnelle: { fr: 'Monarchie constitutionnelle 👑',   en: 'Constitutional Monarchy 👑'    },
    monarchie_absolue:           { fr: 'Monarchie absolue 👑',             en: 'Absolute Monarchy 👑'          },
    technocratie_ia:             { fr: 'Technocratie IA 🤖',               en: 'ARIA Technocracy 🤖'           },
    oligarchie:                  { fr: 'Oligarchie 💼',                    en: 'Oligarchy 💼'                  },
    junte_militaire:             { fr: 'Junte militaire 🎖️',               en: 'Military Junta 🎖️'             },
    regime_autoritaire:          { fr: 'Régime autoritaire 🔒',            en: 'Authoritarian Regime 🔒'       },
    theocracie:                  { fr: 'Théocratie 🕌',                    en: 'Theocracy 🕌'                  },
    communisme:                  { fr: 'Parti communiste ☭',               en: 'Communist Party ☭'             },
    nationalisme_autoritaire:    { fr: 'Nationalisme autoritaire ⚡',      en: 'Authoritarian Nationalism ⚡'  },
    democratie_directe:          { fr: 'Démocratie directe 🗳️',            en: 'Direct Democracy 🗳️'           },
};

export const RESOURCE_DEFS = [
    { key: 'agriculture', icon: '🌾', label: { fr: 'AGRICULTURE', en: 'AGRICULTURE' } },
    { key: 'bois',        icon: '🪵', label: { fr: 'BOIS',        en: 'TIMBER'       } },
    { key: 'eau',         icon: '💧', label: { fr: 'EAU DOUCE',   en: 'FRESH WATER'  } },
    { key: 'energie',     icon: '⚡', label: { fr: 'ÉNERGIE',     en: 'ENERGY'       } },
    { key: 'mineraux',    icon: '💎', label: { fr: 'MINÉRAUX',    en: 'MINERALS'     } },
    { key: 'peche',       icon: '🐟', label: { fr: 'PÊCHE',       en: 'FISHING'      } },
    { key: 'petrole',     icon: '🛢️', label: { fr: 'PÉTROLE',     en: 'OIL'          } },
];

// ── Getters i18n ──────────────────────────────────────────────────────────

// Usage : getTerrainLabel('coastal', 'en') → 'Coastal 🌊'
export const getTerrainLabel = (key, lang = 'fr') =>
    TERRAIN_LABELS[key]?.[lang] ?? TERRAIN_LABELS[key]?.fr ?? key;

// Usage : getRegimeLabel('democratie_liberale', 'en') → 'Liberal Democracy 🗳️'
export const getRegimeLabel = (key, lang = 'fr') =>
    REGIME_LABELS[key]?.[lang] ?? REGIME_LABELS[key]?.fr ?? key;

// Usage : getResourceLabel('energie', 'en') → 'ENERGY'
export const getResourceLabel = (key, lang = 'fr') => {
    const def = RESOURCE_DEFS.find(r => r.key === key);
    if (!def) return key.toUpperCase();
    return typeof def.label === 'object' ? (def.label[lang] ?? def.label.fr) : def.label;
};

// Rétro-compatibilité : retourne l'objet {key,icon,label(string)} selon lang
// Usage : getResourceDefs('en') → [{key,icon,label:'ENERGY'},…]
export const getResourceDefs = (lang = 'fr') =>
    RESOURCE_DEFS.map(r => ({
        ...r,
        label: typeof r.label === 'object' ? (r.label[lang] ?? r.label.fr) : r.label,
    }));

export const MARITIME = new Set(['coastal', 'island', 'archipelago']);
