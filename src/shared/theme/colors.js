// src/shared/theme/colors.js

// ============================================================
// CONSTANTES DE COULEUR ARIA - POINT CENTRAL UNIQUE
// ============================================================

export const COLORS = {
    // Or / Phare
    gold:         'rgba(200,164,74,0.88)',
    goldMid:      'rgba(200,164,74,0.55)',
    goldDim:      'rgba(200,164,74,0.16)',
    goldGlow:     'rgba(200,164,74,0.35)',
    goldFaint:    'rgba(200,164,74,0.08)',
    goldBorder:   'rgba(200,164,74,0.22)',
    goldBright:   '#E8D07A',
    goldSolid:    'rgb(200,164,74)',
    goldHex:      '#C8A44A',

    // Violet / Boussole
    purple:       'rgba(140,100,220,0.85)',
    violet:       'rgba(140,100,220,0.85)',
    purpleDim:    'rgba(140,100,220,0.50)',
    violetDim:    'rgba(140,100,220,0.50)',
    purpleSolid:  'rgb(140,100,220)',
    purpleHex:    '#9B7EC8',

    // Bleus
    blue:         'rgba(74,126,200,0.85)',
    blueLight:    'rgba(140,160,200,0.70)',
    blueDim:      'rgba(74,126,200,0.35)',
    blueDeep:     '#0E2040',

    // Vert / Oui
    green:        'rgba(58,191,122,0.85)',
    greenDim:     'rgba(58,191,122,0.50)',
    greenHex:     '#4CAF50',
    greenLaser:   '#00FF88',
    greenLaserDim:'rgba(0,255,136,0.18)',

    // Rouge / Non
    red:          'rgba(200,80,80,0.85)',
    redDim:       'rgba(200,80,80,0.50)',
    redHex:       '#F44336',
    redLaser:     '#FF3A3A',
    redLaserDim:  'rgba(255,58,58,0.18)',

    // Cyan
    cyan:         '#3ABFCF',

    // Cramoisi / Collégiale
    crimson:      'rgba(165,55,75,0.88)',
    crimsonDim:   'rgba(165,55,75,0.50)',

    // Textes
    text:         'rgba(200,215,240,0.88)',
    textDim:      'rgba(140,160,200,0.55)',
    dimmed:       'rgba(140,160,200,0.55)',  // alias textDim
    textFaint:    'rgba(90,110,160,0.38)',
    muted:        '#4A5A72',

    // Teal
    teal:         '#3ABFCF',

    // Bordures
    border:       'rgba(200,164,74,0.10)',
    borderMid:    'rgba(200,164,74,0.20)',
    borderBright: 'rgba(200,164,74,0.32)',
    borderBlue:   'rgba(74,126,200,0.14)',
    borderGold:   'rgba(200,164,74,0.22)',

    // Backgrounds
    bg:           'rgba(8,14,26,0.92)',
    bgCard:       'rgba(14,20,36,0.82)',
    bgDeep:       'rgba(6,10,18,0.95)',
    bgPanel:      'rgba(6,10,18,0.92)',
    bgOcean:      '#050D18',
    bgInput:      'rgba(8,13,22,0.95)',
    bgHover:      'rgba(200,164,74,0.04)',
};


// Pour compatibilité avec les fichiers qui utilisent COLOR ou C
export const COLOR = COLORS;
export const C = COLORS;

// Export default pour flexibilité
export default COLORS;
