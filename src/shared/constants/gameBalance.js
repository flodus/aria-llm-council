// src/shared/constants/gameBalance.js
// Constantes d'équilibre du moteur de jeu — source de vérité unique

// ── Rayon d'influence (cercle pointillé au clic sur un pays) ─────────────────
// calcInfluenceRadius() dans gameEngine.js
export const INFLUENCE = {
  baseRadius:    45,   // rayon de base en pixels SVG
  popFactor:     3,    // +N px par million d'habitants
  maritimeFactor:22,   // bonus pour pays côtier/insulaire
  resFactor:     4,    // +N px par ressource présente
  maxRadius:     130,  // plafond absolu
};

// ── Ressources : poids appliqués aux impacts satisfaction ────────────────────
// calcSatisfactionDelta() dans gameEngine.js — lignes 60-61
export const RESOURCE_WEIGHTS = {
  presente: 0.4,  // multiplicateur si ressource présente
  absente:  0.3,  // multiplicateur si ressource absente
};

// ── Taux ARIA — ancre IRL (déterministe) ─────────────────────────────────────
// calcAriaIRL() dans countryEngine.js
export const ARIA_IRL = {
  satCenter:    50,    // satisfaction de référence (neutre)
  satWeighting: 0.28,  // ±N points ARIA par point de satisfaction au-delà de satCenter
  ecoCenter:    100,   // économie de référence (neutre)
  ecoWeighting: 0.06,  // ±N points ARIA par point d'économie au-delà de ecoCenter
  islandBonus:  4,     // bonus fixe pour terrain island/archipelago
  min:          5,     // plancher ARIA
  max:          95,    // plafond ARIA
};

// ── Fluctuation ARIA post-vote (in-game) ─────────────────────────────────────
// fluctuateAria() dans countryEngine.js
export const ARIA_FLUCTUATION = {
  inertiaMin:        0.40,  // inertie minimale (pays très bas en IRL)
  inertiaMax:        1.0,   // inertie maximale (pays très haut en IRL)
  irlDivisor:        75,    // diviseur pour le calcul d'inertie (inertia = irl / irlDivisor)
  voteOuiConvergent: +3.0,  // delta si vote OUI + Phare & Boussole convergents
  voteOuiDivergent:  +1.5,  // delta si vote OUI + divergence présidentielle
  voteNonConvergent: -1.2,  // delta si vote NON + convergence (résistance modérée)
  voteNonDivergent:  -3.8,  // delta si vote NON + divergence (opposition forte)
};

// ── Dérive ARIA passive (fin de cycle +5 ans) ─────────────────────────────────
// driftAria() dans countryEngine.js
export const ARIA_DRIFT = {
  reversionRate:  0.05,  // taux de mean-reversion vers l'ancre IRL par cycle
  satHighThreshold: 65,  // satisfaction au-dessus → drift positif
  satLowThreshold:  40,  // satisfaction en dessous → drift négatif
  satDriftHigh:   +0.4,  // drift ARIA si satisfaction > satHighThreshold
  satDriftLow:   -0.35,  // drift ARIA si satisfaction < satLowThreshold
};

// ── Viewport SVG de référence ─────────────────────────────────────────────────
// buildCountryFromLocal() dans countryEngine.js — coordonnées SVG 1400×800
export const SVG_VIEWPORT = {
  WIDTH:  1400,
  HEIGHT: 800,
};

// ── Taille visuelle des pays (rayon SVG) ──────────────────────────────────────
// buildCountryFromLocal() et buildCountryFromAI() dans countryEngine.js
export const COUNTRY_SIZE = {
  localBase:  55,  // rayon de base pour les pays locaux (prédéfinis)
  localPop:   2.5, // +N px par million d'habitants (pays locaux)
  aiBase:     45,  // rayon de base pour les pays générés par l'IA
  aiPop:      2,   // +N px par million d'habitants (pays IA)
};

// ── Positions de départ des 3 pays locaux (coordonnées SVG 1400×800) ─────────
// buildCountryFromLocal() dans countryEngine.js
export const LOCAL_SPAWN = {
  valoria:   { cx: 280, cy: 320 },
  eldoria:   { cx: 700, cy: 220 },
  thalassia: { cx: 1080, cy: 480 },
};
