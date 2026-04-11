// src/shared/utils/prng.js
// PRNG léger mulberry32 + utilitaires déterministes

/** PRNG mulberry32 — retourne un float [0,1) depuis un seed entier */
export function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Génère un seed entier depuis une chaîne (nom de pays, id…) */
export function strToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

/** Float aléatoire dans [min, max] */
export const randRange = (rand, min, max) => min + rand() * (max - min);

/** Entier aléatoire dans [min, max] */
export const randInt = (rand, min, max) => Math.floor(randRange(rand, min, max + 1));

/** Booléen aléatoire avec probabilité p */
export const randBool = (rand, p = 0.5) => rand() < p;
