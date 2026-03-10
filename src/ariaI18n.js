// ═══════════════════════════════════════════════════════════════════════════
//  ariaI18n.js — Internationalisation ARIA (FR / EN)
//  Usage :
//    import { useLocale, t } from './ariaI18n';
//    const { lang, setLang } = useLocale();
//    <span>{t('WORLD_NAME', lang)}</span>
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, createContext, useContext } from 'react';

// ── Clé locale persistée ──────────────────────────────────────────────────
const LS_LANG = 'aria_lang';
export function loadLang() {
  try { return localStorage.getItem(LS_LANG) || 'fr'; } catch { return 'fr'; }
}
export function saveLang(l) {
  try {
    localStorage.setItem(LS_LANG, l);
    window.dispatchEvent(new CustomEvent('aria-lang-change', { detail: l }));
  } catch {}
}

// ── Traductions ───────────────────────────────────────────────────────────
export const TRANSLATIONS = {

  // ── Écran nom du monde ───────────────────────────────────────────────
  WORLD_NAME:          { fr: 'NOM DU MONDE',          en: 'WORLD NAME'         },
  WORLD_NAME_PH:       { fr: 'Ex : Pangée Altérée, Archipel de la Paix…', en: 'E.g. Altered Pangea, Archipelago of Peace…' },
  CONTINUE:            { fr: 'CONTINUER →',            en: 'CONTINUE →'         },

  // ── Écran mode ────────────────────────────────────────────────────────
  MODE_LABEL:          { fr: 'MODE DE JEU',            en: 'GAME MODE'          },
  MODE_LOCAL:          { fr: 'HORS LIGNE',             en: 'OFFLINE'            },
  MODE_LOCAL_DESC:     { fr: '1 nation prédéfinie. Délibérations locales. Aucune clé API.', en: '1 preset nation. Local deliberations. No API key required.' },
  MODE_AI:             { fr: 'EN LIGNE — IA',          en: 'ONLINE — AI'        },
  MODE_AI_DESC:        { fr: 'Pays réel ou fictif au choix. Délibérations temps réel. Clé API requise.', en: 'Real or fictional country. Real-time deliberations. API key required.' },
  KEY_MISSING:         { fr: 'CLÉ MANQUANTE',          en: 'KEY MISSING'        },
  BACK:                { fr: '← RETOUR',               en: '← BACK'             },

  // ── Écran config ─────────────────────────────────────────────────────
  CONFIG:              { fr: 'CONFIGURATION',          en: 'CONFIGURATION'      },
  PRESET_DEFAULT:      { fr: 'PAR DÉFAUT',             en: 'DEFAULT'            },
  PRESET_DEFAULT_LOCAL:{ fr: 'Un pays local au choix — réel, fictif ou nouveau. Avec historique local', en: 'One country of your choice — real, fictional or new. With local history.' },
  PRESET_DEFAULT_AI:   { fr: 'Un pays au choix — réel, fictif ou nouveau. Augmenté par IA.', en: 'One country of your choice — real, fictional or new. AI-enhanced.' },
  PRESET_CUSTOM:       { fr: 'PERSONNALISÉ',           en: 'CUSTOM'             },
  PRESET_CUSTOM_DESC:  { fr: '1 à 6 nations. Terrain, régime, nom libres.', en: '1 to 6 nations. Free terrain, regime and name.' },
  BOARD_GAME:          { fr: 'MODE BOARD GAME',        en: 'BOARD GAME MODE'    },
  BOARD_GAME_DESC:     { fr: 'Annotations manuelles — délibération libre sans IA', en: 'Manual annotations — free deliberation without AI' },

  // ── Config défaut local ───────────────────────────────────────────────
  PRESET_NATION:       { fr: 'NATION PRÉDÉFINIE',      en: 'PRESET NATION'      },
  PRESET_NATION_DESC:  { fr: '1 des 3 nations prédéfinies avec historique.', en: '1 of 3 preset nations with history.' },
  NEW_NATION:          { fr: 'NOUVELLE NATION FICTIVE',en: 'NEW FICTIONAL NATION'},
  NEW_NATION_DESC:     { fr: 'Nation fictive personnalisée', en: 'Custom fictional nation' },

  // ── Config défaut AI ─────────────────────────────────────────────────
  FICTIONAL_NATION:    { fr: 'NATION FICTIVE',         en: 'FICTIONAL NATION'   },
  REAL_COUNTRY:        { fr: 'PAYS RÉEL',              en: 'REAL COUNTRY'       },
  REAL_COUNTRY_DESC:   { fr: 'Simuler un pays réel avec ses données 2025-2026.', en: 'Simulate a real country with its 2025-2026 data.' },
  COUNTRY_NAME:        { fr: 'NOM DU PAYS',            en: 'COUNTRY NAME'       },
  COUNTRY_NAME_PH:     { fr: 'Tout pays : Islande, Pérou, Thaïlande…', en: 'Any country: Iceland, Peru, Thailand…' },

  // ── Champs pays ───────────────────────────────────────────────────────
  TERRAIN:             { fr: 'TERRAIN',                en: 'TERRAIN'            },
  REGIME:              { fr: 'RÉGIME',                 en: 'REGIME'             },
  GENERATE:            { fr: 'GÉNÉRER LE MONDE →',     en: 'GENERATE WORLD →'   },
  GENERATE_SHORT:      { fr: 'GÉNÉRER →',              en: 'GENERATE →'         },
  SELECT:              { fr: 'SÉLECTIONNER',           en: 'SELECT'             },
  ADD_COUNTRY:         { fr: '+ AJOUTER UN PAYS',      en: '+ ADD A COUNTRY'    },
  CREATE:              { fr: '+ CRÉER',                en: '+ CREATE'           },

  // ── PreLaunchScreen ───────────────────────────────────────────────────
  SUMMARY:             { fr: 'RÉSUMÉ',                 en: 'SUMMARY'            },
  CONSTITUTION:        { fr: 'CONSTITUTION',           en: 'CONSTITUTION'       },
  MINISTRIES:          { fr: 'MINISTÈRES',             en: 'MINISTRIES'         },
  MINISTERS:           { fr: 'MINISTRES',              en: 'MINISTERS'          },
  ACTIVE_PRESIDENCY:   { fr: 'PRÉSIDENCE ACTIVE',      en: 'ACTIVE PRESIDENCY'  },
  ACTIVE_MINISTRIES:   { fr: 'MINISTÈRES ACTIFS',      en: 'ACTIVE MINISTRIES'  },
  IA_MODE:             { fr: 'MODE IA',                en: 'AI MODE'            },
  CONTEXT:             { fr: 'CONTEXTE DÉLIBÉRATIONS', en: 'DELIBERATION CONTEXT'},
  CUSTOM_CONTEXT:      { fr: 'CONTEXTE PERSONNALISÉ — remplace tout si renseigné', en: 'CUSTOM CONTEXT — overrides all if set' },
  LAUNCH:              { fr: 'LANCER LA SIMULATION →', en: 'LAUNCH SIMULATION →' },
  HINT_TABS:           { fr: 'Onglets pour modifier · GÉNÉRER pour lancer tel quel', en: 'Tabs to edit · GENERATE to launch as-is' },

  // ── Génération ────────────────────────────────────────────────────────
  GENERATING:          { fr: 'GÉNÉRATION EN COURS…',   en: 'GENERATING…'        },
  GEN_TOPO:            { fr: 'GÉNÉRATION DE LA TOPOGRAPHIE…', en: 'GENERATING TOPOGRAPHY…' },
  GEN_MASSES:          { fr: 'PLACEMENT DES MASSES TERRESTRES…', en: 'PLACING LAND MASSES…' },
  GEN_RESOURCES:       { fr: 'CALCUL DES RESSOURCES…', en: 'CALCULATING RESOURCES…' },
  GEN_COUNCIL:         { fr: 'INITIALISATION DU CONSEIL…', en: 'INITIALIZING COUNCIL…' },
  GEN_SIM:             { fr: 'DÉMARRAGE DE LA SIMULATION…', en: 'STARTING SIMULATION…' },
  GEN_AI:              { fr: 'GÉNÉRATION DU MONDE EN COURS…', en: 'GENERATING WORLD…' },
  GEN_AI_SUB:          { fr: 'CONSULTATION DES ARCHIVES MONDIALES…', en: 'CONSULTING WORLD ARCHIVES…' },

  // ── Clés API ─────────────────────────────────────────────────────────
  API_KEYS:            { fr: 'CLÉS API',               en: 'API KEYS'           },
  API_KEYS_DESC:       { fr: 'Vos clés ne quittent jamais ce navigateur.', en: 'Your keys never leave this browser.' },
  TEST:                { fr: 'TESTER',                  en: 'TEST'              },
  SAVE:                { fr: 'ENREGISTRER',             en: 'SAVE'              },
  LOCAL_RESPONSES:     { fr: 'RÉPONSES LOCALES PRÉ-ÉCRITES', en: 'PRE-WRITTEN LOCAL RESPONSES' },

  // ── Constitution ─────────────────────────────────────────────────────
  REGIME_LABEL:        { fr: 'RÉGIME POLITIQUE',       en: 'POLITICAL REGIME'   },
  LEADER:              { fr: 'DIRIGEANT',              en: 'LEADER'             },
  MINISTRY_MISSION:    { fr: 'Mission du ministère…',  en: 'Ministry mission…'  },
  MINISTRY_NAME:       { fr: 'Nom du ministère',       en: 'Ministry name'      },
  MINISTER_ESSENCE:    { fr: 'Essence — rôle et vision du ministre…', en: 'Essence — minister role and vision…' },
  MINISTER_PROMPTS:    { fr: 'PROMPTS MINISTÉRIELS',   en: 'MINISTERIAL PROMPTS' },
  EXTENDED_ROLE:       { fr: 'RÔLE ÉTENDU',            en: 'EXTENDED ROLE'      },

  // ── Dashboard / topbar ───────────────────────────────────────────────
  MAP_GRID:            { fr: 'MAP-GRID',               en: 'MAP-GRID'           },
  LLM_COUNCIL:         { fr: 'LLM COUNCIL',            en: 'LLM COUNCIL'        },
  CHRONOLOG:           { fr: 'CHRONOLOG',               en: 'CHRONOLOG'         },
  CRISIS:              { fr: '⚠ CRISE',                en: '⚠ CRISIS'          },
  NEXT_CYCLE:          { fr: 'CYCLE +5 ANS',            en: '+5 YEAR CYCLE'     },
  SECESSION:           { fr: 'SÉCESSION',              en: 'SECESSION'          },
  YEAR:                { fr: 'AN',                     en: 'YEAR'               },
  CYCLE:               { fr: 'Cycle',                  en: 'Cycle'              },

  // ── CountryPanel ─────────────────────────────────────────────────────
  SATISFACTION:        { fr: 'SATISFACTION',           en: 'SATISFACTION'       },
  POPULATION:          { fr: 'POPULATION',             en: 'POPULATION'         },
  ECONOMY:             { fr: 'ÉCONOMIE',               en: 'ECONOMY'            },
  ALLIANCES:           { fr: 'ALLIANCES',              en: 'ALLIANCES'          },
  RESOURCES:           { fr: 'RESSOURCES',             en: 'RESOURCES'          },
  ARIA_ADHESION:       { fr: 'ADHÉSION ARIA',          en: 'ARIA SUPPORT'       },

  // ── APIKeyInline ─────────────────────────────────────────────────────
  API_KEYS_TITLE:      { fr: '🔑 CLÉS API',             en: '🔑 API KEYS'           },
  API_KEYS_STORED:     { fr: 'Stockées localement — aucun serveur. Configurez au moins une clé.', en: 'Stored locally — no server. Configure at least one key.' },
  API_KEYS_TEST_WARN:  { fr: '⚠ Testez au moins une clé pour activer la sauvegarde.', en: '⚠ Test at least one key to enable saving.' },
  CANCEL:              { fr: 'ANNULER',                  en: 'CANCEL'                },
  SHOW_KEY:            { fr: 'Afficher',                 en: 'Show'                  },
  HIDE_KEY:            { fr: 'Masquer',                  en: 'Hide'                  },

  // ── CountryInfoCard ───────────────────────────────────────────────────
  SHOW_GEO_CONTEXT:    { fr: '▼ Voir le contexte géopolitique',    en: '▼ Show geopolitical context'   },
  HIDE_GEO_CONTEXT:    { fr: '▲ Masquer le contexte géopolitique', en: '▲ Hide geopolitical context'   },
  PIB_INDEX:           { fr: 'Indice',                   en: 'Index'                 },

  // ── CountryPanel / Council ────────────────────────────────────────────
  QUESTION_PEUPLE:     { fr: 'QUESTION DU PEUPLE',       en: 'CITIZEN QUESTION'      },
  QUESTIONS_FREQ:      { fr: 'QUESTIONS FRÉQUENTES',     en: 'FREQUENT QUESTIONS'    },
  FREE_QUESTION:       { fr: 'QUESTION LIBRE',           en: 'FREE QUESTION'         },
  COUNCIL_ROUTE:       { fr: 'Le Conseil déterminera automatiquement le ministère compétent.', en: 'The Council will automatically determine the competent ministry.' },
  SUBMIT_COUNCIL:      { fr: 'SOUMETTRE AU CONSEIL →',   en: 'SUBMIT TO COUNCIL →'   },
  ROUTING:             { fr: '⏳ ROUTAGE EN COURS…',     en: '⏳ ROUTING…'            },

  // ── Settings Gouvernement ─────────────────────────────────────────────
  GOV_MINISTERS:       { fr: 'Ministres',                en: 'Ministers'             },
  GOV_MINISTRIES:      { fr: 'Ministères',               en: 'Ministries'            },
  GOV_PRESIDENCY:      { fr: 'Présidence',               en: 'Presidency'            },
  GOV_GOVERNANCE:      { fr: 'Gouvernance',              en: 'Governance'            },
  GOV_SEL_MINISTER:    { fr: 'Sélectionner un ministre', en: 'Select a minister'     },
  GOV_SEL_MINISTRY:    { fr: 'Sélectionner un ministère',en: 'Select a ministry'     },
  GOV_MISSION:         { fr: 'Mission du ministère',     en: 'Ministry mission'      },
  GOV_SPECIFIC_ROLE:   { fr: 'Rôle spécifique',          en: 'Specific role'         },
  GOV_COMM:            { fr: 'Communication',            en: 'Communication'         },
  GOV_ANNOT:           { fr: 'Angle universel en annotation', en: 'Universal annotation angle' },
  GOV_PRES_DEFAULT:    { fr: 'PRÉSIDENCE PAR DÉFAUT',    en: 'DEFAULT PRESIDENCY'    },
  GOV_MINS_DEFAULT:    { fr: 'MINISTÈRES ACTIFS PAR DÉFAUT', en: 'ACTIVE MINISTRIES BY DEFAULT' },
  GOV_CRISIS:          { fr: 'GESTION DE CRISE',         en: 'CRISIS MANAGEMENT'     },
  GOV_CHANCE:          { fr: 'Ministère de la Chance & Crises', en: 'Ministry of Chance & Crises' },

  // ── ConstitutionModal ─────────────────────────────────────────────────
  GOV_TAB_REGIME:      { fr: 'RÉGIME',                   en: 'REGIME'                },
  GOV_TAB_PRES:        { fr: 'PRÉSIDENCE',               en: 'PRESIDENCY'            },
  GOV_TAB_MINS:        { fr: 'MINISTÈRES',               en: 'MINISTRIES'            },
  GOV_TAB_MINISTERS:   { fr: 'MINISTRES',                en: 'MINISTERS'             },
  GOV_APPLY:           { fr: '✓ Appliquer la Configuration', en: '✓ Apply Configuration' },
  GOV_ASSIGNED:        { fr: 'MINISTRES ASSIGNÉS',       en: 'ASSIGNED MINISTERS'    },
  CTX_GLOBAL_MODE:     { fr: '⚙️ Hérite du global',      en: '⚙️ Inherit global'      },
  CTX_ENRICHED:        { fr: '📖 Enrichi',               en: '📖 Enriched'            },
  CTX_STATS_ONLY:      { fr: '📊 Stats seules',          en: '📊 Stats only'          },
  CTX_OFF:             { fr: '🚫 Désactivé',             en: '🚫 Disabled'            },

  // ── ChronologView ─────────────────────────────────────────────────────
  NO_EVENTS:           { fr: 'Aucun événement enregistré.',  en: 'No events recorded.' },
  VOTE:                { fr: 'VOTE',                   en: 'VOTE'               },
  NEW_COUNTRY:         { fr: 'NOUVEAU PAYS',           en: 'NEW COUNTRY'        },
  CYCLE_STATS:         { fr: 'STATS CYCLE',            en: 'CYCLE STATS'        },

  // ── Settings ─────────────────────────────────────────────────────────
  SETTINGS:            { fr: 'CONFIGURATION ARIA',     en: 'ARIA SETTINGS'      },
  CLOSE:               { fr: 'FERMER',                 en: 'CLOSE'              },
  RESET:               { fr: 'RÉINITIALISER',          en: 'RESET'              },
};

// ── Fonction t() ─────────────────────────────────────────────────────────
export function t(key, lang = 'fr') {
  const entry = TRANSLATIONS[key];
  if (!entry) { console.warn(`[i18n] missing key: ${key}`); return key; }
  return entry[lang] || entry.fr || key;
}

// ── Hook useLocale ────────────────────────────────────────────────────────
export function useLocale() {
  const [lang, setLangState] = useState(() => loadLang());

  const setLang = useCallback((l) => {
    saveLang(l);
    setLangState(l);
    // Notifie tous les composants qui écoutent (Dashboard_p3, CountryPanel, etc.)
    try { window.dispatchEvent(new CustomEvent('aria-lang-change', { detail: l })); } catch {}
  }, []);

  return { lang, setLang };
}
