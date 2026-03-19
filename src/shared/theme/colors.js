// ============================================================
// CONSTANTES DE COULEUR ARIA - POINT CENTRAL UNIQUE
// ============================================================

export const COLORS = {
    // Or / Phare
    gold:       'rgba(200,164,74,0.88)',
    goldMid:    'rgba(200,164,74,0.55)',
    goldDim:    'rgba(200,164,74,0.30)',
    goldFaint:  'rgba(200,164,74,0.08)',
    goldBorder: 'rgba(200,164,74,0.22)',
    goldSolid:  'rgb(200,164,74)',

    // Violet / Boussole
    purple:     'rgba(140,100,220,0.85)',
    violet:     'rgba(140,100,220,0.85)',
    purpleDim:  'rgba(140,100,220,0.50)',
    violetDim:  'rgba(140,100,220,0.50)',
    purpleSolid:'rgb(140,100,220)',

    // Bleus (mélange des deux versions)
    blue:       'rgba(74,126,200,0.85)',
    blueLight:  'rgba(140,160,200,0.70)',
    blueDim:    'rgba(74,126,200,0.35)',

    // Vert / Oui
    green:      'rgba(58,191,122,0.85)',
    greenDim:   'rgba(58,191,122,0.50)',

    // Rouge / Non
    red:        'rgba(200,80,80,0.85)',
    redDim:     'rgba(200,80,80,0.50)',

    // Textes
    text:       'rgba(200,215,240,0.88)',
    textDim:    'rgba(140,160,200,0.55)',
    textFaint:  'rgba(90,110,160,0.38)',

    // Bordures
    border:     'rgba(90,110,160,0.14)',
    borderGold: 'rgba(200,164,74,0.22)',

    // Backgrounds
    bg:         'rgba(8,14,26,0.92)',
    bgCard:     'rgba(14,20,36,0.85)',
    bgDeep:     'rgba(6,10,18,0.95)',
};


// Pour compatibilité avec les fichiers qui utilisent COLOR ou C
export const COLOR = COLORS;
export const C = COLORS;

// Export default pour flexibilité
export default COLORS;
