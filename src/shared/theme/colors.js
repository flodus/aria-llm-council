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

export const satisfColor = (p) =>
p >= 70 ? '#3ABF7A' : p >= 45 ? '#C8A44A' : p >= 25 ? '#C05050' : '#8A2020';
