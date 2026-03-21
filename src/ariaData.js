// src/ariaData.js

// ═══════════════════════════════════════════════════════════════════════════
//  ariaData.js
//  Base de données locale complète du projet ARIA
//  Contient : LOCAL_DELIBERATION + LOCAL_EVENTS
//
//  Usage :
//  import { LOCAL_EVENTS, LOCAL_DELIBERATION } from './ariaData';
// ═══════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL_DELIBERATION
//  Réponses types activées par le joueur (cycle, sécession, diplomatie).
//  Remplacées par appels IA si clé disponible.
//  Source : templates/local_deliberation.json
// ─────────────────────────────────────────────────────────────────────────────

import _localDelibeation from '../templates/local_deliberation.json';
export const LOCAL_DELIBERATION = _localDelibeation;



// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL_EVENTS
//  Déclenchés automatiquement par les seuils — sans action du joueur.
//  Remplacés par appels IA si clé disponible.
//  Source : templates/local_events.json
// ─────────────────────────────────────────────────────────────────────────────

import _localEvents from '../templates/local_events.json';
export const LOCAL_EVENTS = _localEvents;

// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL_COUNTRIES
//  Pays prédéfinis pour le mode hors ligne — 3 nations fictives.
//  Source : templates/local_countries.json
// ─────────────────────────────────────────────────────────────────────────────

import _localCountries from '../templates/local_countries.json';
export const LOCAL_COUNTRIES = _localCountries;


// ─────────────────────────────────────────────────────────────────────────────
//  REAL_COUNTRIES_DATA
//  Données pays réels pour le mode en ligne — terrain, économie, sociologie ARIA.
//  aria_acceptance_irl : ancre sociologique Think-Tank (immuable en jeu).
//  aria_sociology_logic : analyse textuelle affichée dans le Manifeste À Propos.
//  Source : templates/real_countries.json
// ─────────────────────────────────────────────────────────────────────────────

import _realCountriesFR from '../templates/real_countries.json';
export const REAL_COUNTRIES_DATA = _realCountriesFR;

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL_DELIBERATION_EN
//  English version of LOCAL_DELIBERATION — activated when aria_lang === 'en'
//  Source : templates/local_deliberation_en.json
// ─────────────────────────────────────────────────────────────────────────────

import _localDeliberationEN from '../templates/local_deliberation_en.json';
export const LOCAL_DELIBERATION_EN = _localDeliberationEN;


// ─────────────────────────────────────────────────────────────────────────────
//  REAL_COUNTRIES_DATA_EN
//  English version of REAL_COUNTRIES_DATA — activated when aria_lang === 'en'
//  Source : templates/real_countries_en.json
// ─────────────────────────────────────────────────────────────────────────────

import _realCountriesEN from '../templates/real_countries_en.json';
export const REAL_COUNTRIES_DATA_EN = _realCountriesEN;
