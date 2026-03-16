import { COLOR } from './colors';

export const FONT = {
    cinzel: "'Cinzel', serif",
    mono:   "'JetBrains Mono', monospace",
};

export const cinzel = (size, color = COLOR.gold, extra = {}) =>
({ fontFamily: FONT.cinzel, fontSize: size, color, ...extra });

export const mono = (size, color = COLOR.blueDim, extra = {}) =>
({ fontFamily: FONT.mono, fontSize: size, color, letterSpacing: '0.12em', ...extra });

export const labelStyle = (size = '0.48rem') => ({
    fontFamily: FONT.mono, fontSize: size,
    letterSpacing: '0.18em', color: COLOR.goldMid, textTransform: 'uppercase',
});
