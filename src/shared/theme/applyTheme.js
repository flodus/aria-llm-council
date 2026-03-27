// src/shared/theme/applyTheme.js
// Source unique de vérité : injecte COLORS comme variables CSS sur :root
// Les classes CSS utilisent var(--gold), var(--bg-card), etc.
// camelCase → kebab-case : goldBright → --gold-bright, bgCard → --bg-card

import { COLORS } from './colors';

const versKebab = (s) => s.replace(/([A-Z])/g, '-$1').toLowerCase();

export function applyThemeVars() {
    const racine = document.documentElement;
    Object.entries(COLORS).forEach(([cle, val]) => {
        racine.style.setProperty(`--${versKebab(cle)}`, val);
    });
}
