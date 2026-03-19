// src/shared/theme/ariaTheme.js

// ═══════════════════════════════════════════════════════════════════════════
//  ariaTheme.js — Tokens de design, helpers visuels, constantes UI
//  Aucun JSX. Importé par tous les composants.
//
//  I18N : TERRAIN_LABELS, REGIME_LABELS, RESOURCE_DEFS sont bilingues {fr,en}
//  Utiliser getTerrainLabel(key, lang), getRegimeLabel(key, lang),
//  getResourceLabel(key, lang) pour obtenir le bon label selon la langue.
// ═══════════════════════════════════════════════════════════════════════════
import { COLORS } from './colors';
import { getTerrainLabel, getRegimeLabel, TERRAIN_LABELS, REGIME_LABELS } from '../data/worldLabels';

export const FONT = {
    cinzel: "'Cinzel', serif",
    mono:   "'JetBrains Mono', monospace",
};

// Inline style helpers
export const cinzel = (size, color = COLORS.gold, extra = {}) =>
({ fontFamily: FONT.cinzel, fontSize: size, color, ...extra });

export const mono = (size, color = COLORS.blueDim, extra = {}) =>
({ fontFamily: FONT.mono, fontSize: size, color, letterSpacing: '0.12em', ...extra });

export const labelStyle = (size = '0.48rem') => ({
    fontFamily: FONT.mono, fontSize: size,
    letterSpacing: '0.18em', color: COLORS.goldMid, textTransform: 'uppercase',
});

// Styles réutilisables
export const CARD_STYLE = {
    background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
    borderRadius: '2px', padding: '1.2rem 1.4rem',
};

export const INPUT_STYLE = {
    background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.goldBorder}`,
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
