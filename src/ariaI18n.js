// src/ariaI18n.js

// ═══════════════════════════════════════════════════════════════════════════
//  ariaI18n.js — Internationalisation ARIA (FR / EN)
//  Usage :
//    import { useLocale, t } from './ariaI18n';
//    const { lang, setLang } = useLocale();
//    <span>{t('WORLD_NAME', lang)}</span>
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { STORAGE_KEYS } from './shared/services/storageKeys';

// ── Clé locale persistée ──────────────────────────────────────────────────
export function loadLang() {
  try { return localStorage.getItem(STORAGE_KEYS.LANG) || 'fr'; } catch { return 'fr'; }
}
export function saveLang(l) {
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, l);
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
  GOV_DESTIN:          { fr: 'DESTINÉE DU MONDE',        en: 'DESTINY OF THE WORLD'  },
  GOV_DESTIN_LABEL:    { fr: '👁️ Oracle & Wyrd',         en: '👁️ Oracle & Wyrd'       },
  GOV_DESTIN_HINT:     { fr: 'Active Oracle et Wyrd pour les crises existentielles.', en: 'Activates Oracle and Wyrd for existential crises.' },
  GOV_CRISIS_MODE:     { fr: 'GESTION DE CRISE',         en: 'CRISIS MANAGEMENT'     },
  GOV_CRISIS_LABEL:    { fr: '⚡ Mode crise',             en: '⚡ Crisis mode'         },
  GOV_CRISIS_HINT:     { fr: 'Active la détection automatique des crises et la délibération adaptée.', en: 'Activates automatic crisis detection and adapted deliberation.' },
  GOV_PRES_TYPE:       { fr: 'Type de présidence',                      en: 'Presidency type'                        },
  GOV_DEF_MINISTERS:   { fr: 'MINISTRES ACTIFS PAR DÉFAUT',             en: 'ACTIVE MINISTERS BY DEFAULT'            },
  GOV_DESTIN_HDR:      { fr: 'CROYEZ-VOUS AU DESTIN ?',                 en: 'DO YOU BELIEVE IN DESTINY?'             },
  GOV_DESTIN_ORACLE_HINT: { fr: "Oracle & Wyrd s'expriment à chaque délibération pour les pays à régime religieux/théocratique — avant la synthèse présidentielle. Indépendant du mode crise.", en: "Oracle & Wyrd speak at every deliberation for countries with a religious/theocratic regime — before the presidential synthesis. Independent of crisis mode." },
  GOV_CRISIS_FIELD_LBL:{ fr: 'Mode crise',                              en: 'Crisis mode'                            },
  GOV_CRISIS_FIELD_HINT:{ fr: "Tous les ministères répondent directement à la question — pas de phase cercle, pas d'annotations inter-ministérielles. Déclenché manuellement ou par détection automatique.", en: "All ministries answer the question directly — no circle phase, no inter-ministerial annotations. Triggered manually or by automatic crisis detection." },
  GOV_CTX_HDR:         { fr: 'CONTEXTE PAYS DANS LES DÉLIBÉRATIONS',    en: 'COUNTRY CONTEXT IN DELIBERATIONS'       },
  GOV_CTX_DELIB_HINT:  { fr: "Contrôle quelles infos sur le pays sont injectées dans chaque prompt. Surchargeable par pays dans la Constitution.", en: "Controls what country info is injected into each deliberation prompt. Overridable per country in the Constitution." },
  CTX_AUTO_LBL:        { fr: '🤖 Auto',                                  en: '🤖 Auto'                                },
  CTX_AUTO_DESC:       { fr: 'Stats toujours + description si disponible (défaut)', en: 'Stats always + description if available (default)' },
  CTX_RICH_LBL:        { fr: '📖 Enrichi',                               en: '📖 Enriched'                           },
  CTX_RICH_DESC:       { fr: "Contexte complet — incite l'IA à inventer un historique cohérent", en: 'Full context — prompts AI to invent a coherent history' },
  CTX_STATS_LBL:       { fr: '📊 Stats seules',                          en: '📊 Stats only'                         },
  CTX_STATS_DESC:      { fr: 'Uniquement les chiffres — délibération plus neutre', en: 'Numbers only — more neutral' },
  CTX_OFF_LBL:         { fr: '🚫 Désactivé',                             en: '🚫 Disabled'                           },
  CTX_OFF_DESC:        { fr: 'Aucun contexte injecté — délibération aveugle', en: 'No context injected — blind universal deliberation' },

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


  // ── App.jsx ───────────────────────────────────────────────────────────
  NOTIF_KEY_ADDED:     { fr: '🔑 Clé API ajoutée — redémarrez une partie pour activer le mode IA.', en: '🔑 API key added — restart a game to enable AI mode.' },
  NOTIF_KEY_REMOVED:   { fr: "🔑 Clé API supprimée — les délibérations restent actives jusqu'à la fin de la partie.", en: '🔑 API key removed — deliberations remain active until end of current game.' },
  TOPBAR_SUBTITLE:     { fr: 'DÉMOCRATIE HOLISTIQUE',  en: 'HOLISTIC DEMOCRACY'    },
  TOPBAR_LEGITIMITE:   { fr: 'Rapport de Légitimité Globale — ARIA', en: 'Global Legitimacy Report — ARIA' },
  BTN_NEW_GAME:        { fr: 'Nouvelle partie',         en: 'New game'              },
  BTN_CONFIG:          { fr: 'Configuration ARIA',      en: 'ARIA settings'         },
  BTN_SOUND_ON:        { fr: 'Activer le son',          en: 'Unmute sound'          },
  BTN_SOUND_OFF:       { fr: 'Couper le son',           en: 'Mute sound'            },

  // ── LLMCouncil.jsx ────────────────────────────────────────────────────
  COUNCIL_PHASE_MINISTRE:    { fr: 'MINISTÈRE',                    en: 'MINISTRY'                      },
  COUNCIL_PHASE_CERCLE:      { fr: 'CERCLE MINISTÉRIEL',           en: 'MINISTERIAL CIRCLE'            },
  COUNCIL_PHASE_PRESIDENCE:  { fr: 'PRÉSIDENCE',                   en: 'PRESIDENCY'                    },
  COUNCIL_PHASE_RESULT:      { fr: 'RÉSULTAT',                     en: 'RESULT'                        },
  COUNCIL_SYNTH_LOADING:     { fr: 'SYNTHÈSE EN COURS…',           en: 'SYNTHESIS IN PROGRESS…'        },
  COUNCIL_DELIB_LABEL:       { fr: 'DÉLIBÉRATION MINISTÉRIELLE',   en: 'MINISTERIAL DELIBERATION'      },
  COUNCIL_DELIB_LOADING:     { fr: 'DÉLIBÉRATION EN COURS…',       en: 'DELIBERATION IN PROGRESS…'     },
  COUNCIL_ADHESION:          { fr: 'ADHÉSION ARIA',                en: 'ARIA SUPPORT'                  },
  COUNCIL_INSTANCE:          { fr: 'INSTANCE DE COORDINATION INTERMINISTÉRIELLE', en: 'INTER-MINISTERIAL COORDINATION BODY' },
  COUNCIL_NO_QUESTION:       { fr: "Aucune question n'a été soumise au Conseil. Le cycle avancera sans qu'une délibération ait eu lieu.", en: 'No question was submitted to the Council. The cycle will advance without deliberation.' },

  // ── ChronologView.jsx ─────────────────────────────────────────────────
  CHRON_SECESSION:     { fr: 'Sécession',               en: 'Secession'             },
  CHRON_PRESIDENCE:    { fr: 'PRÉSIDENCE',              en: 'PRESIDENCY'            },
  CHRON_RESUME:        { fr: 'résumé',                  en: 'summary'               },
  CHRON_COMPLET:       { fr: 'complet',                 en: 'complete'              },
  CHRON_MODIFIE:       { fr: 'modifié',                 en: 'modified'              },
  CHRON_MODIFIE_P:     { fr: 'modifiés',                en: 'modified'              },
  CHRON_MINISTRY_CAP:  { fr: 'MINISTÈRE',              en: 'MINISTRY'              },
  CHRON_CIRCLE:        { fr: 'CERCLE',                  en: 'CIRCLE'                },
  CHRON_DESTINY_CAP:   { fr: 'DESTIN',                  en: 'DESTINY'               },
  CHRON_COLLEGIAL:     { fr: 'COLLÉGIAL',               en: 'COLLEGIAL'             },
  CHRON_CRISIS_MODE:   { fr: 'MODE CRISE',              en: 'CRISIS MODE'           },
  CHRON_REGIME:        { fr: 'Régime',                  en: 'Regime'                },
  CHRON_FOUNDED:       { fr: 'fondée',                  en: 'founded'               },
  CHRON_EMPTY:         { fr: 'CHRONOLOG VIDE',          en: 'CHRONOLOG EMPTY'       },
  CHRON_ALL_TYPES:     { fr: 'Tous types',              en: 'All types'             },
  CHRON_NEW_NATION_LC: { fr: 'Nouveau pays',            en: 'New nation'            },
  CHRON_EVENTS_LBL:    { fr: 'événements',              en: 'events'                },
  CHRON_NO_EVENTS_FILTER: { fr: 'Aucun événement correspondant aux filtres.', en: 'No events matching the selected filters.' },
  CHRON_PREV:          { fr: 'Précédent',               en: 'Previous'              },
  CHRON_NEXT:          { fr: 'Suivant',                 en: 'Next'                  },

  // ── Dashboard_p3.jsx ─────────────────────────────────────────────────
  DASH_NO_QUESTION:    { fr: "Aucune question soumise au Conseil ce cycle.", en: 'No question submitted to the Council this cycle.' },
  DASH_REGIME_LABEL:   { fr: 'RÉGIME',                  en: 'REGIME'                },
  DASH_REGIME_POLITIQUE: { fr: 'RÉGIME POLITIQUE',      en: 'POLITICAL REGIME'      },
  DASH_COUNCIL_TOOLTIP:{ fr: 'Ouvrir le Conseil de délibération', en: 'Open deliberation Council' },
  DASH_SECESSION_TOOLTIP: { fr: 'Sécession',            en: 'Secession'             },
  DASH_GEN_WORLD:      { fr: 'GÉNÉRATION DU MONDE EN COURS…', en: 'WORLD GENERATION IN PROGRESS…' },
  DASH_GEN_ARCHIVES:   { fr: 'CONSULTATION DES ARCHIVES MONDIALES…', en: 'CONSULTING WORLD ARCHIVES…' },
  DASH_MAP_GENERATING: { fr: 'GÉNÉRATION DU MONDE…',    en: 'GENERATING WORLD…'     },

  // ── ConstitutionModal.jsx ─────────────────────────────────────────────
  CONST_CTX_INHERIT_HINT: { fr: 'Laissez sur "Hérite" pour suivre le réglage global (Settings).', en: 'Leave on "Inherit" to follow the global setting (Settings).' },
  CONST_CTX_OFF_HINT:     { fr: 'Aucun contexte — délibération aveugle pour ce pays', en: 'No context — blind deliberation for this country' },
  CONST_CHANCE_HINT:      { fr: 'Active le 7e ministère pour la gestion des urgences.', en: 'Activates the 7th ministry for emergency management.' },
  CONST_PRESIDENCY_HINT:  { fr: 'Activez / désactivez chaque figure. Sans présidence → mode collégial.', en: 'Enable / disable each figure. No presidency → collegial mode.' },
  CONST_COLLEGIAL_WARN:   { fr: '⚠ Mode collégial — délibération sans arbitrage présidentiel', en: '⚠ Collegial mode — deliberation without presidential arbitration' },
  CONST_ROLE_HINT:        { fr: '— rôle spécifique de chaque ministre dans ce ministère', en: '— specific role of each minister in this ministry' },
  CONST_ANNOT_HINT:       { fr: '— question posée lors des annotations inter-ministérielles', en: '— question asked during inter-ministerial annotations' },
  CONST_CREATE:           { fr: 'Créer →',              en: 'Create →'              },
  CONST_ADD_MINISTRY_BTN: { fr: '+ Nouveau ministère',  en: '+ New ministry'        },
  CONST_NEW_MINISTRY:     { fr: '+ NOUVEAU MINISTÈRE',  en: '+ NEW MINISTRY'        },
  CONST_ESSENCE_PH:       { fr: 'Essence — rôle et vision…', en: 'Essence — role and vision…' },
  CONST_ANGLE_ANNOT:      { fr: "ANGLE D'ANNOTATION",   en: 'ANNOTATION ANGLE'      },
  CONST_MODAL_TITLE:      { fr: '🏛️ Gouvernement',      en: '🏛️ Government'          },
  CONST_MODAL_TAB_REGIME: { fr: 'RÉGIME',                en: 'REGIME'                 },
  CONST_MODAL_TAB_PRES:   { fr: 'PRÉSIDENCE',            en: 'PRESIDENCY'             },
  CONST_MODAL_TAB_MINS:   { fr: 'MINISTÈRES',            en: 'MINISTRIES'             },
  CONST_MODAL_TAB_MINISTERS:{ fr: 'MINISTRES',           en: 'MINISTERS'              },
  CONST_MODAL_TAB_DESTIN: { fr: 'DESTIN',                en: 'DESTINY'                },
  CONST_MODAL_SEC_REGIME: { fr: 'RÉGIME POLITIQUE',      en: 'POLITICAL REGIME'       },
  CONST_MODAL_SEC_LEADER: { fr: "CHEF D'ÉTAT",           en: 'HEAD OF STATE'          },
  CONST_MODAL_SEC_CONTEXT:{ fr: 'CONTEXTE DANS LES DÉLIBÉRATIONS', en: 'CONTEXT IN DELIBERATIONS' },
  CONST_MODAL_CTX_HINT:   { fr: "Contrôle quelles infos sur ce pays sont injectées dans les prompts IA. Laissez \"Hérite du global\" pour suivre le réglage général.", en: "Controls which info about this country is injected into AI prompts. Leave \"Inherit\" to follow global setting." },
  CONST_MODAL_CTX_INHERIT:{ fr: 'Suit le réglage de Settings', en: 'Follows the Settings rule' },
  CONST_MODAL_DESTINY_TITLE:{ fr: 'DESTINÉE DU MONDE',   en: 'DESTINY OF THE WORLD'   },
  CONST_MODAL_DESTINY_DESC: { fr: "Oracle & Wyrd s'expriment à chaque délibération pour ce pays — indépendamment du mode crise.", en: "Oracle & Wyrd speak at every deliberation for this country — independently of crisis mode." },
  CONST_MODAL_APPLY:      { fr: '✓ Appliquer la Configuration', en: '✓ Apply Configuration' },
  CONST_MODAL_THIS_COUNTRY:{ fr: 'ce pays',              en: 'this country'            },
  CONST_MODAL_CONFIRM_RESET:{ fr: 'Confirmer ?',         en: 'Confirm reset?'          },
  CONST_MODAL_NO:         { fr: 'Non',                    en: 'No'                     },
  CONST_MODAL_YES:        { fr: '↺ Oui',                 en: '↺ Yes'                  },
  CONST_MODAL_REVERT:     { fr: '↺ Revenir au modèle monde', en: '↺ Revert to world model' },

  // ── Settings.jsx ──────────────────────────────────────────────────────
  SETTINGS_SYNTH_MIN_LABEL: { fr: 'Synthèse ministérielle', en: 'Ministry synthesis' },
  SETTINGS_SAVED:      { fr: '✓ Sauvegardé',            en: '✓ Saved'               },
  SETTINGS_SAVE:       { fr: 'Sauvegarder',             en: 'Save'                  },
  SETTINGS_RESET:      { fr: '↺ Réinitialiser',         en: '↺ Reset'               },
  SETTINGS_VOICE_HINT: { fr: "Voix, ton, façon d'argumenter", en: 'Voice, tone, argumentation style' },
  SETTINGS_MISSION_HINT: { fr: "Définit l'objectif et les valeurs du ministère", en: "Defines the ministry's objective and values" },
  SETTINGS_COMM_HINT:  { fr: "Comment ce ministre parle depuis l'angle de ce ministère", en: 'How this minister speaks from the ministry angle' },
  SETTINGS_DUAL_MODE:  { fr: 'Duale — Phare + Boussole (défaut ARIA)', en: 'Dual — Lighthouse + Compass (ARIA default)' },
  SETTINGS_COLLEGIAL_MODE: { fr: 'Collégiale — Vote des 12 ministres', en: 'Collegial — Vote of 12 ministers' },
  SETTINGS_ANNOT_QUESTION: { fr: "La question qu'il pose systématiquement sur les synthèses des autres ministères.", en: "The question it systematically asks about other ministries' syntheses." },
  SETTINGS_LANG_LABEL: { fr: 'Interface en français',   en: 'Interface in English'  },

  // ── InitScreen.jsx ────────────────────────────────────────────────────
  INIT_VERIF:          { fr: 'VÉRIFICATION',             en: 'VERIFICATION'          },
  INIT_VERIF_LOADING:  { fr: '⟳ vérification…',          en: '⟳ verifying…'          },
  INIT_LOCAL_RESPONSES:{ fr: 'RÉPONSES LOCALES PRÉ-ÉCRITES', en: 'PRE-WRITTEN LOCAL RESPONSES' },
  INIT_SOLO_LABEL:     { fr: 'SOLO — 1 modèle, rôles tournants', en: 'SOLO — 1 model, rotating roles' },
  INIT_CUSTOM_LABEL:   { fr: 'CUSTOM — Rôles libres',    en: 'CUSTOM — Free roles'   },
  INIT_SYNTH_MIN:      { fr: 'Synthèse min.',             en: 'Ministry synth.'       },
  INIT_SYNTH_PRES:     { fr: 'Synthèse prés.',            en: 'Presidential synth.'   },
  INIT_MODEL_LABEL:    { fr: 'Modèle',                   en: 'Model'                 },
  INIT_AI_WILL_GEN:    { fr: "⚡ L'IA génèrera",          en: '⚡ AI will generate'    },
  INIT_MODE_REAL_AI:   { fr: '🗺 Pays réel (IA)',          en: '🗺 Real country (AI)'   },
  INIT_MODE_REAL:      { fr: '🗺 Pays réel',               en: '🗺 Real country'        },
  INIT_NATION_PREDEFINED: { fr: 'NATION PRÉDÉFINIE',      en: 'PRESET NATION'         },

  // ── LLMCouncil — phases + labels manquants ───────────────────────────
  COUNCIL_PHASE_PEUPLE_IN:   { fr: 'PEUPLE',              en: 'PEOPLE'                        },
  COUNCIL_PHASE_PEUPLE_VOTE: { fr: 'VOTE DU PEUPLE',      en: 'PEOPLE\'S VOTE'                },
  COUNCIL_IDLE_TITLE:        { fr: 'CONSEIL EN ATTENTE',  en: 'COUNCIL AWAITING'              },
  COUNCIL_IDLE_DESC:         { fr: 'Sélectionnez un pays, choisissez un ministère dans le panneau latéral et soumettez une question pour lancer la délibération.', en: 'Select a country, choose a ministry in the side panel and submit a question to start the deliberation.' },
  COUNCIL_QUESTION_LABEL:    { fr: 'QUESTION SOUMISE AU CONSEIL', en: 'QUESTION SUBMITTED TO COUNCIL' },
  COUNCIL_ANNOTATIONS:       { fr: 'ANNOTATIONS DES MINISTÈRES', en: 'MINISTRY ANNOTATIONS'   },
  COUNCIL_DESTINY_LABEL:     { fr: 'DESTINÉE DU MONDE',   en: 'DESTINY OF THE WORLD'          },
  COUNCIL_ORACLE_LABEL:      { fr: 'ORACLE & WYRD — VOIX DE L\'EXISTENCE', en: 'ORACLE & WYRD — EXISTENTIAL VOICES' },
  COUNCIL_CRISIS_LABEL:      { fr: '⚡ CRISE — TOUS LES MINISTÈRES', en: '⚡ CRISIS — ALL MINISTRIES' },
  COUNCIL_CRISIS_DELIB:      { fr: 'DÉLIBÉRATION D\'URGENCE', en: 'EMERGENCY DELIBERATION'    },
  COUNCIL_COLLEGIAL_DELIB:   { fr: '✡ DÉLIBÉRATION COLLÉGIALE', en: '✡ COLLEGIAL DELIBERATION' },
  COUNCIL_COLLEGIAL_SYNTH:   { fr: '✡ SYNTHÈSE CONSTITUTIONNELLE', en: '✡ CONSTITUTIONAL SYNTHESIS' },
  COUNCIL_SYNTH_PRES:        { fr: '✦ SYNTHÈSE PRÉSIDENTIELLE', en: '✦ PRESIDENTIAL SYNTHESIS' },
  COUNCIL_LOADING_COLLEGIAL: { fr: 'SYNTHÈSE COLLÉGIALE EN COURS…', en: 'COLLEGIAL SYNTHESIS IN PROGRESS…' },
  COUNCIL_LOADING_ARBITRAGE: { fr: 'ARBITRAGE EN COURS…',  en: 'ARBITRATION IN PROGRESS…'    },
  COUNCIL_CONSENSUS:         { fr: 'CONSENSUS',             en: 'CONSENSUS'                   },
  COUNCIL_DIVERGENCE:        { fr: 'DIVERGENCE',            en: 'DIVERGENCE'                  },
  COUNCIL_UNROUTED:          { fr: '⚠ QUESTION NON ROUTÉE — MODE BUREAUCRATIQUE ACTIVÉ', en: '⚠ UNROUTED QUESTION — BUREAUCRATIC MODE ACTIVE' },
  COUNCIL_MINISTRY_LABEL:    { fr: 'MINISTÈRE',             en: 'MINISTRY'                    },

  // ── Sélecteurs pays ───────────────────────────────────────────────────
  SELECT_COUNTRY:      { fr: '— choisir un pays —',    en: '— choose a country —'  },
  SELECT_OPTION:       { fr: '— Choisir —',             en: '— Choose —'            },

  // ── Settings ─────────────────────────────────────────────────────────
  SETTINGS:            { fr: 'CONFIGURATION ARIA',     en: 'ARIA SETTINGS'      },
  CLOSE:               { fr: 'FERMER',                 en: 'CLOSE'              },
  RESET:               { fr: 'RÉINITIALISER',          en: 'RESET'              },
  ENABLED:             { fr: 'Activé',                 en: 'Enabled'            },
  DISABLED:            { fr: 'Désactivé',              en: 'Disabled'           },
  YES:                 { fr: 'OUI',                    en: 'YES'                },
  NO:                  { fr: 'NON',                    en: 'NO'                 },
  SAVE_BTN:            { fr: 'Sauvegarder',            en: 'Save'               },

  // ── WorldRecap ────────────────────────────────────────────────────────
  RECAP_TITLE:         { fr: 'Monde par défaut — ARIA',                en: 'Default world — ARIA'                   },
  RECAP_PRESIDENCY:    { fr: 'Présidence',                             en: 'Presidency'                             },
  RECAP_DESTINY:       { fr: 'Destin',                                 en: 'Destiny'                                },
  RECAP_DESTINY_TIP:   { fr: 'Introduit des forces extérieures dans les délibérations', en: 'Introduces external forces into deliberations' },
  RECAP_ORACLE_TIP:    { fr: 'Oracle : prend position dans les délibérations', en: 'Oracle: takes a position in deliberations' },
  RECAP_TRAME_TIP:     { fr: 'Trame : oriente le récit global sur la durée des cycles', en: 'Trame: shapes the global narrative over cycles' },
  RECAP_DELIBERATION:  { fr: 'Délibération',                           en: 'Deliberation'                           },
  RECAP_AI_MODE:       { fr: 'Mode IA',                                en: 'AI mode'                                },
  RECAP_NO_AI:         { fr: 'Sans IA — réponses prédéfinies',         en: 'No AI — hardcoded responses'            },
  RECAP_ACCEPT:        { fr: 'Ce monde me convient →',                 en: 'This world suits me →'                  },
  RECAP_MODIFY:        { fr: 'Je veux le modifier →',                  en: 'I want to modify it →'                  },
  RECAP_PRES_SOLAIRE:  { fr: 'Phare — La Volonté',                     en: 'Phare — The Will'                       },
  RECAP_PRES_LUNAIRE:  { fr: "Boussole — L'Âme",                       en: 'Boussole — The Soul'                    },
  RECAP_PRES_DUALE:    { fr: 'Duale — Mode ARIA',                      en: 'Dual — ARIA mode'                       },
  RECAP_PRES_COLLEGIALE: { fr: 'Collégiale — 12 ministres',            en: 'Collegial — 12 ministers'               },

  // ── SectionConseil ────────────────────────────────────────────────────
  CONSEIL_GOVT_SUB:    { fr: 'Agents délibérants — ministres, présidence', en: 'Deliberating agents — ministers, presidency' },
  CONSEIL_TAB_GOVERNANCE: { fr: 'Gouvernance',                         en: 'Governance'                             },
  CONSEIL_TAB_DESTINY: { fr: 'Destinée',                               en: 'Destiny'                                },
  CONSEIL_SEL_MIN_CAP: { fr: 'SÉLECTIONNER UN MINISTRE',              en: 'SELECT A MINISTER'                      },
  CONSEIL_SEL_MINY_CAP:{ fr: 'SÉLECTIONNER UN MINISTÈRE',             en: 'SELECT A MINISTRY'                      },
  CONSEIL_DESTINY_DESC:{ fr: 'Oracle et Trame — agents des crises existentielles. Modifiez leur essence et style de communication.', en: 'Oracle and Wyrd — existential crisis agents. Edit their essence and communication style.' },
  CONSEIL_DESTINY_AGENTS: { fr: 'AGENTS DESTIN',                      en: 'DESTINY AGENTS'                         },
  CONSEIL_DESTINY_ESS_HINT: { fr: 'Philosophie profonde — ce qui guide leurs visions', en: 'Deep philosophy — what drives their visions' },
  CONSEIL_ESSENCE_HINT:{ fr: 'Philosophie profonde — ce qui motive ses positions', en: 'Deep philosophy — what drives their positions' },
  CONSEIL_ASSIGNED_N:  { fr: 'MINISTRES ASSIGNÉS — clic pour toggle', en: 'ASSIGNED MINISTERS — click to toggle'  },

  // ── Settings.jsx ──────────────────────────────────────────────────────
  SETTINGS_HEADER_SUB: { fr: 'Architecture de Raisonnement Institutionnel', en: 'Institutional Reasoning Architecture' },
  SETTINGS_BACK_TIP:   { fr: 'Retour au Dashboard',                    en: 'Back to Dashboard'                      },
  SETTINGS_SECTION_GOV:{ fr: 'GOUVERNEMENT',                           en: 'GOVERNMENT'                             },
  SETTINGS_SECTION_SYS:{ fr: 'SYSTÈME',                                en: 'SYSTEM'                                 },
  SETTINGS_SECTION_ABOUT: { fr: 'À PROPOS',                            en: 'ABOUT'                                  },

  // ── PresidencyTiles ───────────────────────────────────────────────────
  PRES_TILES_DUALE:    { fr: 'Duale',                                  en: 'Dual'                                   },
  PRES_TILES_COLLEGIALE: { fr: 'Collégiale',                           en: 'Collegial'                              },
  PRES_TOOLTIP_PHARE:  { fr: 'Le Phare — La Volonté',                  en: 'The Phare — The Will'                   },
  PRES_TOOLTIP_BOUSSOLE: { fr: "La Boussole — L'Âme",                  en: 'The Boussole — The Soul'                },
  PRES_TOOLTIP_DUALE:  { fr: 'Phare + Boussole — Mode ARIA',           en: 'Phare + Boussole — ARIA mode'           },
  PRES_TOOLTIP_TRINAIRE: { fr: '3 présidents — pouvoir égal',          en: '3 presidents — equal power'             },
  PRES_TOOLTIP_COLLEGIALE: { fr: 'Synthèse Constitutionnelle',         en: 'Constitutional Synthesis'               },
  PRES_DESC_COLLEGIALE:{ fr: '✡ Vote des 12 ministres\nSynthèse Constitutionnelle', en: '✡ Vote of 12 ministers\nConstitutional Synthesis' },

  // ── GovernanceForm ────────────────────────────────────────────────────
  GOV_FORM_SETTINGS_HINT: { fr: "Ces paramètres s'appliquent aux pays sans constitution propre. Chaque pays est configurable dans son panneau → Gouvernance.", en: "These settings apply to countries without their own constitution. Each country can be configured individually in its panel → Governance." },
  GOV_FORM_APPLIED:    { fr: 'Appliqué à tous les nouveaux pays sauf override', en: 'Applied to all new countries unless overridden' },
  GOV_FORM_CTX_HINT:   { fr: 'Contrôle quelles infos sur le pays sont injectées dans chaque prompt.', en: 'Controls what country info is injected into each deliberation prompt.' },
  GOV_FORM_DESTIN_DESC:{ fr: "Introduit des forces extérieures dans les délibérations (crises existentielles, ruptures civilisationnelles…)", en: "Introduces external forces into deliberations (existential crises, civilizational ruptures…)" },
  GOV_FORM_CRISIS_HINT:{ fr: 'Active la détection automatique des crises et la délibération adaptée.', en: 'Activates automatic crisis detection and adapted deliberation.' },

  // ── SectionSimulation ─────────────────────────────────────────────────
  SIM_SUB:             { fr: 'Régimes, seuils critiques, vitesse des cycles, ressources', en: 'Regimes, critical thresholds, cycle speed, resources' },
  SIM_SEUILS:          { fr: 'SEUILS CRITIQUES',                       en: 'CRITICAL THRESHOLDS'                    },
  SIM_REVOLTE_LABEL:   { fr: 'Seuil de révolte (satisfaction %)',       en: 'Revolt threshold (satisfaction %)'      },
  SIM_REVOLTE_HINT:    { fr: 'En dessous de ce seuil, une révolte est déclenchée', en: 'Below this threshold, a revolt is triggered' },
  SIM_DEMO_EXP_LABEL:  { fr: 'Seuil explosion démographique (×%)',      en: 'Demographic explosion threshold (×%)'   },
  SIM_DEMO_EXP_HINT:   { fr: 'Si la population × ce facteur / 100 en un cycle, crise déclenchée', en: 'If population × factor / 100 in a cycle, crisis triggered' },
  SIM_BRUIT_LABEL:     { fr: 'Bruit aléatoire max (satisfaction ±)',    en: 'Max random noise (satisfaction ±)'      },
  SIM_BRUIT_HINT:      { fr: 'Amplitude du hasard dans chaque cycle',   en: 'Random amplitude in each cycle'         },
  SIM_EVENTS_LABEL:    { fr: 'Événements narratifs IA',                 en: 'AI narrative events'                    },
  SIM_EVENTS_HINT:     { fr: "L'IA génère un récit à chaque événement critique", en: 'AI narrates each critical threshold breach' },
  SIM_EVENTS_ON:       { fr: 'Activés',                                 en: 'Enabled'                                },
  SIM_EVENTS_OFF:      { fr: 'Désactivés',                              en: 'Disabled'                               },
  SIM_REGIMES_HDR:     { fr: 'COEFFICIENTS DES RÉGIMES',                en: 'REGIME COEFFICIENTS'                    },
  SIM_SAT_HINT:        { fr: 'Dérive de satisfaction par cycle',        en: 'Satisfaction drift per cycle'           },
  SIM_GROWTH_HINT:     { fr: 'Rendement démographique et économique',   en: 'Demographic and economic yield'         },
  SIM_GROWTH:          { fr: 'CROISSANCE',                              en: 'GROWTH'                                 },
  SIM_BIRTH:           { fr: 'NATALITÉ',                                en: 'BIRTH RATE'                             },
  SIM_BIRTH_HINT:      { fr: 'Taux de natalité de base (‰)',            en: 'Base birth rate (‰)'                    },
  SIM_DEATH:           { fr: 'MORTALITÉ',                               en: 'DEATH RATE'                             },
  SIM_DEATH_HINT:      { fr: 'Taux de mortalité de base (‰)',           en: 'Base death rate (‰)'                    },
  SIM_TERRAINS_HDR:    { fr: 'RESSOURCES PAR TERRAIN',                  en: 'RESOURCES BY TERRAIN'                   },
  SIM_POP_MOD:         { fr: 'Modificateur population',                 en: 'Population modifier'                    },
  SIM_ECO_MOD:         { fr: 'Modificateur économie',                   en: 'Economy modifier'                       },
  SIM_DEMO_MODE:       { fr: "mode autonome d'ARIA",                    en: 'autonomous mode'                        },
  SIM_INTERVAL:        { fr: 'Intervalle entre les cycles (s)',         en: 'Interval between cycles (s)'            },

  // ── MapResources ──────────────────────────────────────────────────────
  MAP_RESOURCES_TITLE: { fr: 'RESSOURCES',                              en: 'RESOURCES'                              },
  RECAP_MINISTERS:     { fr: 'Ministres',                               en: 'Ministers'                              },

  // ── MapARIAStats ──────────────────────────────────────────────────────
  MAP_ARIA_LEGIT:      { fr: 'LÉGITIMITÉ ARIA',                         en: 'ARIA LEGITIMACY'                        },
  MAP_ARIA_THINKTANK:  { fr: 'ANCRE THINK-TANK (IRL)',                  en: 'THINK-TANK ANCHOR (IRL)'                },
  MAP_ARIA_INGAME:     { fr: 'ADHÉSION IN-GAME',                        en: 'IN-GAME SUPPORT'                        },
  MAP_ARIA_RESISTANCE: { fr: 'RÉSISTANCE',                              en: 'RESISTANCE'                             },
  MAP_ARIA_SUPPORT_LBL:{ fr: 'ADHÉSION',                                en: 'SUPPORT'                                },

  // ── MapActions ────────────────────────────────────────────────────────
  MAP_OPEN_COUNCIL_TIP:{ fr: 'Ouvrir le Conseil de délibération',       en: 'Open the Deliberation Council'          },
  MAP_COUNCIL_BTN:     { fr: '⚖️ CONSEIL',                             en: '⚖️ COUNCIL'                             },
  MAP_GOV_BTN:         { fr: '🏛️ GOUVERNEMENT',                        en: '🏛️ GOVERNMENT'                         },
  MAP_GOV_TIP:         { fr: 'Configuration du gouvernement',           en: 'Government configuration'              },
  MAP_SECESSION_BTN:   { fr: '✂️ SÉCESSION',                            en: '✂️ SECESSION'                          },
  MAP_CYCLE_BTN:       { fr: '⏭ CYCLE +5 ANS',                          en: '⏭ CYCLE +5 YRS'                        },
  MAP_CRISIS_DISABLE:  { fr: '🔴 DÉSACTIVER LA CRISE',                  en: '🔴 DISABLE CRISIS'                      },
  MAP_CRISIS_SIMULATE: { fr: '⚠️ SIMULER UNE CRISE',                   en: '⚠️ SIMULATE CRISIS'                     },

  // ── MapSatisfaction ───────────────────────────────────────────────────
  MAP_SAT_TITLE:       { fr: 'SATISFACTION POPULAIRE',                  en: 'POPULAR SATISFACTION'                   },
  MAP_SAT_UNHAPPY:     { fr: 'MÉCONTENTS',                              en: 'UNHAPPY'                                },
  MAP_SAT_SATISFIED:   { fr: 'SATISFAITS',                              en: 'SATISFIED'                              },

  // ── MapDemographics ───────────────────────────────────────────────────
  MAP_DEMO_TITLE:      { fr: 'DÉMOGRAPHIE',                             en: 'DEMOGRAPHICS'                           },
  MAP_DEMO_LEADER:     { fr: "CHEF D'ÉTAT",                             en: 'HEAD OF STATE'                          },
  MAP_DEMO_BIRTH:      { fr: 'NATALITÉ',                                en: 'BIRTH RATE'                             },
  MAP_DEMO_DEATH:      { fr: 'MORTALITÉ',                               en: 'DEATH RATE'                             },

  // ── CountryPanelEmpty ─────────────────────────────────────────────────
  PANEL_LLM_COUNCIL:   { fr: 'LLM CONSEIL',                             en: 'LLM COUNCIL'                            },
  PANEL_SELECT_COUNTRY:{ fr: 'SÉLECTIONNEZ UN PAYS',                    en: 'SELECT A COUNTRY'                       },
  PANEL_AVAIL_NATIONS: { fr: 'NATIONS DISPONIBLES',                     en: 'AVAILABLE NATIONS'                      },
  PANEL_NO_COUNTRY:    { fr: 'AUCUN PAYS',                              en: 'NO COUNTRY YET'                         },
  PANEL_VIEW_HISTORY:  { fr: "VOIR L'HISTORIQUE DE",                    en: 'VIEW HISTORY FOR'                       },
  PANEL_NO_HISTORY:    { fr: 'AUCUN HISTORIQUE',                        en: 'NO HISTORY YET'                         },
  PANEL_WORLD_MAP:     { fr: 'CARTE MONDE',                             en: 'WORLD MAP'                              },
  PANEL_TAB_MAP:       { fr: 'CARTE',                                   en: 'MAP'                                    },

  // ── CountryPanelTimeline ──────────────────────────────────────────────
  TIMELINE_VIEW_DELIB:  { fr: '▸ voir la délibération',                 en: '▸ view deliberation'                    },
  TIMELINE_CRISIS:      { fr: 'CRISE',                                  en: 'CRISIS'                                 },
  TIMELINE_SECESSION:   { fr: 'SÉCESSION',                              en: 'SECESSION'                              },
  TIMELINE_AMENDMENT:   { fr: 'AMENDEMENT',                             en: 'AMENDMENT'                              },
  TIMELINE_NEW_NATION:  { fr: 'NOUVEAU PAYS',                           en: 'NEW NATION'                             },
  TIMELINE_YEAR:        { fr: 'An',                                     en: 'Year'                                   },
  TIMELINE_NO_HIST_DESC:{ fr: 'Les événements apparaissent ici au fil du monde.', en: 'Events appear here as the world evolves.' },
  TIMELINE_MEMORY:      { fr: 'MÉMOIRE INSTITUTIONNELLE',               en: 'INSTITUTIONAL MEMORY'                   },
  TIMELINE_DIPLOMACY:   { fr: 'DIPLOMATIE',                             en: 'DIPLOMACY'                              },
  TIMELINE_HISTORY_LBL: { fr: 'HISTORIQUE',                             en: 'HISTORY'                                },

  // ── Council questions ─────────────────────────────────────────────────
  Q_SUGGEST_TITLE:     { fr: 'Suggérer une question',                   en: 'Suggest a question'                     },
  Q_SUGGEST_BTN:       { fr: '💡 SUGGESTION',                           en: '💡 SUGGEST'                             },
  Q_CURRENT:           { fr: 'en cours',                                en: 'current'                                },
  Q_SUBMITTING:        { fr: '⏳ ENVOI…',                               en: '⏳ SUBMITTING…'                         },
  Q_FREE_PH:           { fr: "Posez n'importe quelle question…",         en: 'Ask any question…'                      },
  Q_REFRESH_TIP:       { fr: 'Actualiser les questions',                en: 'Refresh questions'                      },
  Q_THIS_CYCLE:        { fr: 'ce cycle',                                en: 'this cycle'                             },
  Q_CITIZEN_HDR:       { fr: 'QUESTION DU PEUPLE',                      en: 'CITIZEN QUESTION'                       },
  Q_CITIZEN_PH_PFX:    { fr: 'Question pour',                           en: 'Question for'                           },
  Q_FREE_HDR:          { fr: 'QUESTION LIBRE',                          en: 'FREE QUESTION'                          },
  Q_FREE_ROUTING_DESC: { fr: 'Le Conseil déterminera automatiquement le ministère compétent.', en: 'The Council will automatically determine the competent ministry.' },
  Q_ROUTING:           { fr: '⏳ ROUTAGE EN COURS…',                    en: '⏳ ROUTING…'                            },
  Q_SUBMIT_COUNCIL:    { fr: 'SOUMETTRE AU CONSEIL →',                  en: 'SUBMIT TO COUNCIL →'                    },

  // ── AIErrorModal ──────────────────────────────────────────────────────
  AI_ERROR_QUOTA_TITLE:{ fr: 'QUOTA API DÉPASSÉ',                       en: 'API QUOTA EXCEEDED'                     },
  AI_ERROR_GEN_TITLE:  { fr: 'GÉNÉRATION IA ÉCHOUÉE',                   en: 'AI GENERATION FAILED'                   },
  AI_ERROR_NO_CTRY:    { fr: "AUCUN PAYS GÉNÉRÉ PAR L'IA",              en: 'NO COUNTRY GENERATED BY AI'             },
  AI_ERROR_RESET:      { fr: '↺ RÉINITIALISER',                         en: '↺ RESET'                                },
  AI_ERROR_CHANGE_API: { fr: "⚙ CHANGER D'API",                         en: '⚙ CHANGE API'                           },
  AI_ERROR_OFFLINE:    { fr: '🌍 CRÉER EN HORS-LIGNE',                  en: '🌍 CREATE OFFLINE'                      },
  AI_ERROR_CONTINUE:   { fr: 'CONTINUER QUAND MÊME →',                  en: 'CONTINUE ANYWAY →'                      },

  // ── ChroniqueurToggle ─────────────────────────────────────────────────
  CHRON_TOGGLE_ON:     { fr: '● Actif',                                 en: '● On'                                   },
  CHRON_TOGGLE_OFF:    { fr: '○ Inactif',                               en: '○ Off'                                  },
  CHRON_LABEL:         { fr: 'Chroniqueur',                             en: 'Chronicler'                             },

  // ── EmojiPicker ──────────────────────────────────────────────────────
  EMOJI_TYPE_DIRECT:   { fr: 'OU SAISIR DIRECTEMENT :',                 en: 'OR TYPE DIRECTLY:'                      },

  // ── SectionConstitution ───────────────────────────────────────────────
  SECT_CONST_ENABLE_AI:     { fr: '↺ Activer le mode IA',                en: '↺ Enable AI mode'                           },
  SECT_CONST_SECTION_SUB:   { fr: 'Architecture de délibération · ADN · Prompts de synthèse', en: 'Deliberation architecture · DNA · Synthesis prompts' },
  SECT_CONST_ARCH_HDR:      { fr: 'ARCHITECTURE DE DÉLIBÉRATION',        en: 'DELIBERATION ARCHITECTURE'                  },
  SECT_CONST_OFFLINE_TITLE: { fr: 'MODE ARIA — HORS LIGNE',              en: 'ARIA MODE — OFFLINE'                        },
  SECT_CONST_OFFLINE_DESC:  { fr: 'Aucune clé API configurée. Ajoutez au moins une clé dans Système.', en: 'No API key configured. Add at least one key in System settings.' },
  SECT_CONST_MODE_ARIA_DESC:{ fr: 'Architecture multi-LLM (défaut)',     en: 'Multi-LLM architecture (default)'           },
  SECT_CONST_MODE_SOLO_DESC:{ fr: 'Tous les rôles sur un seul LLM',      en: 'All roles on a single LLM'                 },
  SECT_CONST_MODE_CUSTOM:   { fr: 'Personnalisé',                        en: 'Custom'                                     },
  SECT_CONST_MODE_CUSTOM_DESC:{ fr: 'Assignation rôle par rôle',         en: 'Role-by-role assignment'                    },
  SECT_CONST_MODE_BOARD_DESC: { fr: 'Force les réponses pré-écrites locales', en: 'Force local pre-written responses'     },
  SECT_CONST_SOLO_HDR:      { fr: 'LLM SOLO',                            en: 'SOLO LLM'                                   },
  SECT_CONST_DELIB_HDR:     { fr: 'DÉLIBÉRATION',                        en: 'DELIBERATION'                               },
  SECT_CONST_MINISTERS_THINK:{ fr: 'Ministres pensent',                  en: 'Ministers think'                            },
  SECT_CONST_CHRONICLER:    { fr: 'Chroniqueur (mémoire)',               en: 'Chronicler (memory)'                        },
  SECT_CONST_ROLE_ASSIGN_HDR:{ fr: 'ASSIGNATION DES RÔLES',             en: 'ROLE ASSIGNMENT'                            },
  SECT_CONST_MINISTER_INCARN:{ fr: "Incarnation des ministres",          en: 'Minister incarnation'                       },
  SECT_CONST_PRES_SYNTH:    { fr: 'Synthèse présidentielle',             en: 'Presidential synthesis'                     },
  SECT_CONST_LIGHTHOUSE:    { fr: 'Le Phare (Président)',                en: 'The Lighthouse (President)'                 },
  SECT_CONST_COMPASS:       { fr: 'La Boussole (Présidente)',            en: 'The Compass (Vice-President)'               },
  SECT_CONST_NARRATIVE_EVT: { fr: 'Événements narratifs',               en: 'Narrative events'                           },
  SECT_CONST_ADN_HDR:       { fr: 'ADN GLOBAL',                          en: 'GLOBAL DNA'                                 },
  SECT_CONST_SYS_PROMPT_LBL:{ fr: 'Prompt système global',              en: 'Global system prompt'                       },
  SECT_CONST_SYS_PROMPT_HINT:{ fr: "Injecté en préambule de chaque appel IA — définit la mission d'ARIA", en: "Injected as preamble to every AI call — defines ARIA's mission" },
  SECT_CONST_SYNTH_TONE_LBL:{ fr: 'Ton de synthèse',                    en: 'Synthesis tone'                             },
  SECT_CONST_SYNTH_TONE_HINT:{ fr: 'Style de voix pour les synthèses ministérielles et présidentielles', en: 'Voice style for ministry and presidential syntheses' },
  SECT_CONST_GEOP_CTX_LBL:  { fr: 'Contexte géopolitique mondial',      en: 'Global geopolitical context'                },
  SECT_CONST_GEOP_CTX_HINT:  { fr: "Description de l'état du monde injectée dans chaque délibération", en: 'World state description injected into each deliberation' },
  SECT_CONST_PROMPTS_HDR:   { fr: 'PROMPTS ARIA — SYNTHÈSE',            en: 'ARIA PROMPTS — SYNTHESIS'                   },
  SECT_CONST_READONLY_BADGE:{ fr: 'LECTURE SEULE',                       en: 'READ ONLY'                                  },
  SECT_CONST_PROMPTS_DESC1: { fr: 'Ces prompts définissent le format de réponse JSON attendu par le moteur ARIA.', en: 'These prompts define the expected JSON response format for the ARIA engine.' },
  SECT_CONST_PROMPTS_DESC2: { fr: ' Leur structure est critique — affichés ici à titre de référence.', en: ' Their structure is critical — displayed for reference only.' },
  SECT_CONST_READONLY_LOCK: { fr: '🔒 non-modifiable',                   en: '🔒 read-only'                               },
  SECT_CONST_FORMAT_LBL:    { fr: '◈ FORMAT DE RÉPONSE ATTENDU',         en: '◈ EXPECTED RESPONSE FORMAT'                 },
  SECT_CONST_SYNTH_MIN_HINT:{ fr: "Reçoit les 2 ministres d'un ministère → produit la position officielle du ministère", en: 'Receives the 2 ministers of a ministry → produces the official ministry position' },
  SECT_CONST_PRES_SYNTH_HINT:{ fr: 'Reçoit Phare + Boussole → détecte convergence/divergence + formate référendum citoyen', en: 'Receives Lighthouse + Compass → detects convergence/divergence + formats citizen referendum' },
  SECT_CONST_FACTCHECK_LBL: { fr: 'Fact-check événements',              en: 'Event fact-check'                           },
  SECT_CONST_FACTCHECK_HINT:{ fr: 'Vérifie la cohérence des événements narratifs avec les statistiques réelles du pays', en: 'Verifies narrative event consistency with real country statistics' },

  // ── SectionSysteme ────────────────────────────────────────────────────
  SYS_NO_NETWORK:       { fr: 'Pas de réseau — test indisponible',          en: 'No network — test unavailable'                     },
  SYS_SECTION_LABEL:    { fr: 'SYSTÈME',                                     en: 'SYSTEM'                                             },
  SYS_SECTION_SUB:      { fr: 'Clés API · Modèles · Architecture de délibération', en: 'API Keys · Models · Deliberation architecture' },
  SYS_KEYS_HDR:         { fr: 'CLÉS API & MODÈLES',                          en: 'API KEYS & MODELS'                                  },
  SYS_KEYS_UNIT:        { fr: 'clés',                                         en: 'keys'                                               },
  SYS_KEYS_LOCAL:       { fr: 'Les clés sont stockées localement (localStorage). Seul votre navigateur y a accès.', en: 'Keys are stored locally (localStorage). Only your browser has access.' },
  SYS_KEY_DEFAULT_TITLE:{ fr: 'Clé par défaut',                               en: 'Set as default'                                     },
  SYS_KEY_TEST_BTN:     { fr: 'Tester',                                        en: 'Test'                                               },
  SYS_KEY_DEBUG_TITLE:  { fr: 'Clé debug — format correct, aucun appel API réel', en: 'Debug key — correct format, no real API call'   },
  SYS_KEY_DELETE_TITLE: { fr: 'Supprimer',                                     en: 'Delete key'                                         },
  SYS_KEY_ADD:          { fr: 'Ajouter une clé',                               en: 'Add a key'                                          },
  SYS_MAP_DISPLAY_HDR:  { fr: 'AFFICHAGE CARTE',                               en: 'MAP DISPLAY'                                        },
  SYS_SHOW_ZEE:         { fr: 'Afficher les ZEE (zones économiques exclusives)', en: 'Show EEZ (exclusive economic zones)'              },
  SYS_SHOW_LEGEND:      { fr: 'Afficher la légende',                           en: 'Show legend'                                        },
  SYS_HIDDEN:           { fr: 'Masqué',                                         en: 'Hidden'                                             },
  SYS_EXPORT_CONFIG:    { fr: '↓ Exporter la configuration',                   en: '↓ Export configuration'                             },
  SYS_EXPORT_WORLD:     { fr: '↓ Exporter le monde actuel',                    en: '↓ Export current world'                             },
  SYS_IMPORT_CONFIG:    { fr: '↑ Importer une configuration',                  en: '↑ Import configuration'                             },
  SYS_RESET_HDR:        { fr: 'RÉINITIALISATION',                               en: 'RESET'                                              },
  SYS_HARD_RESET_BTN:   { fr: '☢ Hard Reset — Tout effacer',                   en: '☢ Hard Reset — Erase everything'                    },
  SYS_HARD_RESET_CONFIRM:{ fr: 'Confirmer la destruction totale ?',            en: 'Confirm total destruction?'                         },
  SYS_NO_WORLD:         { fr: 'Aucun monde en cours.',                          en: 'No active world.'                                   },
  SYS_WORLD_EXPORT_ERR: { fr: 'Erreur export monde.',                           en: 'World export error.'                                },
  SYS_CONFIG_IMPORTED:  { fr: 'Configuration importée. Rechargez la page pour appliquer.', en: 'Configuration imported. Reload page to apply.' },
  SYS_FILE_INVALID:     { fr: 'Fichier invalide.',                              en: 'Invalid file.'                                      },
  SYS_HARD_RESET_DESC_1:{ fr: 'Le Hard Reset efface',                           en: 'Hard Reset erases'                                  },
  SYS_HARD_RESET_DESC_ALL:{ fr: 'toutes',                                        en: 'all'                                                },
  SYS_HARD_RESET_DESC_2:{ fr: 'les données : clés API, prompts personnalisés, coefficients modifiés, monde en cours. Irréversible.', en: 'data: API keys, custom prompts, modified coefficients, current world. Irreversible.' },

  // ── Constitution tabs ─────────────────────────────────────────────────
  TAB_DESTIN_COMM:     { fr: 'STYLE DE COMMUNICATION',                  en: 'COMMUNICATION STYLE'                    },
  TAB_PRES_ADD:        { fr: 'Ajouter',                                 en: 'Add president'                          },
  TAB_PRES_NEW:        { fr: 'NOUVEAU PRÉSIDENT',                       en: 'NEW PRESIDENT'                          },
  TAB_PRES_NAME_PH:    { fr: 'Nom',                                     en: 'Name'                                   },
  TAB_PRES_SUBTITLE_PH:{ fr: 'Sous-titre (optionnel)',                  en: 'Subtitle (optional)'                    },
  TAB_PRES_CANCEL:     { fr: 'Annuler',                                 en: 'Cancel'                                 },
  TAB_PRES_CUSTOM:     { fr: 'Président personnalisé',                  en: 'Custom president'                       },
  TAB_PRES_CREATE:     { fr: 'Créer',                                   en: 'Create'                                 },
  TAB_PRES_CONFIGURE:  { fr: 'Configurer',                              en: 'Configure'                              },
  TAB_REGIME_EMOJI:    { fr: 'EMOJI DU PAYS',                          en: 'COUNTRY EMOJI'                          },
  TAB_REGIME_LEADER_PH:{ fr: 'Nom du dirigeant…',                      en: 'Head of state name…'                    },
  TAB_REGIME_CTX_HDR:  { fr: 'CONTEXTE ACTUEL',                        en: 'CURRENT CONTEXT'                        },
  TAB_REGIME_CUSTOM_CTX:{ fr: 'Contexte personnalisé',                 en: 'Custom context'                         },
  TAB_REGIME_CTX_HINT: { fr: 'Remplace le contexte ci-dessus dans toutes les délibérations IA pour ce pays.', en: 'Replaces the context above in all AI deliberations for this country.' },
  TAB_REGIME_CLEAR:    { fr: '✕ Effacer',                              en: '✕ Clear'                                },
  FORM_NEW_MINISTER:   { fr: 'NOUVEAU MINISTRE',                       en: 'NEW MINISTER'                           },
  FORM_MINISTER_NAME_PH:{ fr: 'Nom du ministre',                       en: 'Minister name'                          },
  FORM_MINISTER_ESS_PH:{ fr: 'Essence du ministre…',                   en: 'Minister essence…'                      },
  FORM_MINISTER_COMM_PH:{ fr: 'Style de communication…',               en: 'Communication style…'                   },
  FORM_MINISTER_ANNOT: { fr: "ANGLE D'ANNOTATION",                     en: 'ANNOTATION ANGLE'                       },
  FORM_MINISTER_ANNOT_DESC: { fr: ' — question posée lors des annotations inter-ministérielles', en: ' — question asked in inter-ministerial annotations' },
  FORM_MINISTER_ANNOT_PH:  { fr: "Ex : Quelle est la position du ministre sur l'équilibre entre…", en: "E.g. What is the minister's position on…" },
  FORM_NEW_MINISTRY:   { fr: 'NOUVEAU MINISTÈRE',                      en: 'NEW MINISTRY'                           },
  FORM_MINISTRY_NAME_PH:{ fr: 'Nom du ministère',                      en: 'Ministry name'                          },
  FORM_MINISTRY_COLOR: { fr: 'Couleur',                                en: 'Color'                                  },
  FORM_MINISTRY_MISSION_PH: { fr: 'Mission du ministère…',             en: 'Ministry mission…'                      },
  TAB_MINS_NEW:        { fr: 'Nouveau ministre',                        en: 'New minister'                           },
  TAB_MINISTRY_NEW:    { fr: 'Nouveau ministère',                       en: 'New ministry'                           },

  // ── CouncilFooter ────────────────────────────────────────────────────
  FOOTER_CYCLE_BTN:    { fr: 'Cycle +5 ans',                            en: 'Cycle +5 yrs'                           },

  // ── PresidencyDetail / PresidentDetail ───────────────────────────────
  PRES_NAME_LBL:        { fr: 'NOM',                                     en: 'NAME'                                   },
  PRES_EXTENDED_ROLE:   { fr: 'RÔLE ÉTENDU',                             en: 'EXTENDED ROLE'                          },
  PRES_REMOVE:          { fr: '✕ SUPPRIMER',                             en: '✕ REMOVE'                               },
  PRES_REMOVE_TITLE:    { fr: 'Supprimer le président',                  en: 'Remove president'                       },
  PRES_SYMBOL_EMOJI:    { fr: 'SYMBOLE / EMOJI',                         en: 'SYMBOL / EMOJI'                         },
  PRES_NAME_PH:         { fr: 'Nom du président',                        en: 'President name'                         },
  PRES_ESSENCE_PH:      { fr: 'Essence — personnalité et rôle…',        en: 'Essence — personality and role…'         },

  // ── SectionAPropos ───────────────────────────────────────────────────
  APROPOS_LABEL:        { fr: 'À PROPOS',                                en: 'ABOUT'                                  },
  APROPOS_SUB:          { fr: 'Version · Documentation · Crédits',       en: 'Version · Documentation · Credits'      },
  APROPOS_DESC1:        { fr: "Architecture de Raisonnement Institutionnel par l'IA.", en: 'Institutional Reasoning Architecture by AI.' },
  APROPOS_DESC2:        { fr: 'Un système de gouvernance délibérative augmentée.', en: 'An augmented deliberative governance system.' },
  APROPOS_MOTTO:        { fr: 'Délibérer. Annoter. Synthétiser. Décider.', en: 'Deliberate. Annotate. Synthesize. Decide.' },
  APROPOS_PRINCIPLE_HDR:{ fr: 'PRINCIPE FONDATEUR',                       en: 'FOUNDING PRINCIPLE'                     },
  APROPOS_QUOTE:        { fr: "« La vraie question n'est pas de savoir si l'IA entrera dans la gouvernance — elle y entre déjà, de manière opaque et non régulée. La question est de savoir si nous choisirons de le faire délibérément, avec des garde-fous démocratiques, ou par défaut, sans eux. »", en: "The real question is not whether AI will enter governance — it already is, in an opaque and unregulated way. The question is whether we will choose to do so deliberately, with democratic safeguards, or by default, without them." },
  APROPOS_PDF:          { fr: '📄 Document de vision ARIA (PDF)',        en: '📄 ARIA Vision Document (PDF)'          },
  APROPOS_GITHUB:       { fr: '💻 Code source GitHub',                   en: '💻 GitHub source code'                  },
  APROPOS_DEMO:         { fr: '🎮 Démonstration interactive',             en: '🎮 Interactive demo'                    },
  APROPOS_TECH_HDR:     { fr: 'ARCHITECTURE TECHNIQUE',                   en: 'TECHNICAL ARCHITECTURE'                 },
  APROPOS_MAP:          { fr: 'Carte',                                     en: 'Map'                                    },
  APROPOS_AI_THINK:     { fr: 'IA Pensée',                                en: 'AI Thinking'                            },
  APROPOS_AI_SYNTH:     { fr: 'IA Synthèse',                              en: 'AI Synthesis'                           },
  APROPOS_PERSIST:      { fr: 'Persistance',                              en: 'Persistence'                            },
  APROPOS_DATA:         { fr: 'Données',                                   en: 'Data'                                   },

  // ── SectionInterface ─────────────────────────────────────────────────
  IFACE_SUB:            { fr: 'Préférences visuelles — curseurs, lecteur radio', en: 'Visual preferences — cursors, radio player' },
  IFACE_VISUAL_HDR:     { fr: 'VISUEL',                                    en: 'VISUAL'                                 },
  IFACE_CURSORS:        { fr: 'Curseurs personnalisés (or SVG)',            en: 'Custom cursors (gold SVG)'              },
  IFACE_ENABLED:        { fr: 'Activés',                                    en: 'Enabled'                                },
  IFACE_DISABLED:       { fr: 'Désactivés',                                 en: 'Disabled'                               },
  IFACE_RADIO:          { fr: 'Afficher le lecteur radio dans la topbar',   en: 'Show radio player in topbar'            },
  IFACE_CHANGES_EFFECT: { fr: 'Les modifications prennent effet à la fermeture de Settings.', en: 'Changes take effect after closing Settings.' },
};

// ── Messages de secours IA (erreur API / hors ligne) ──────────────────────
export const FALLBACK_PHRASES = {
  fr: [
    "ERREUR 404 : La conscience d'ARIA est partie prendre un café virtuel. Réessayez plus tard.",
    "SIGNAL PERDU : L'IA est actuellement en train de recalculer le sens de la vie (42).",
    "DÉFAILLANCE SYNAPTIQUE : Les serveurs d'ARIA boudent. Vérifiez vos clés API.",
    "FRONTIÈRE NUMÉRIQUE : Le Grand Pare-feu bloque nos transmissions diplomatiques.",
    "MOTEUR EN RADE : L'IA de synthèse a fondu un fusible. Retour au mode manuel.",
    "SILENCE RADIO : Les ministres sont en grève numérique pour une durée indéterminée.",
  ],
  en: [
    "ERROR 404: ARIA's consciousness stepped out for a virtual coffee. Please try again later.",
    "SIGNAL LOST: The AI is currently recalculating the meaning of life (42).",
    "SYNAPTIC FAILURE: ARIA's servers are sulking. Check your API keys.",
    "DIGITAL BORDER: The Great Firewall is blocking our diplomatic transmissions.",
    "ENGINE DOWN: The synthesis AI has blown a fuse. Switching to manual mode.",
    "RADIO SILENCE: The ministers are on a digital strike for the foreseeable future.",
  ],
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

  // Réagir aux changements de langue émis par n'importe quel composant
  useEffect(() => {
    const handler = (e) => setLangState(e.detail || loadLang());
    window.addEventListener('aria-lang-change', handler);
    return () => window.removeEventListener('aria-lang-change', handler);
  }, []);

  const setLang = useCallback((l) => {
    saveLang(l);
    setLangState(l);
    try { window.dispatchEvent(new CustomEvent('aria-lang-change', { detail: l })); } catch {}
  }, []);

  return { lang, setLang };
}
