// src/ariaI18n.js

// ═══════════════════════════════════════════════════════════════════════════
//  ariaI18n.js — Internationalisation ARIA (FR / EN)
//  Usage :
//    import { useLocale, t } from './ariaI18n';
//    const { lang, setLang } = useLocale();
//    <span>{t('WORLD_NAME', lang)}</span>
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, createContext, useContext } from 'react';

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

  // ── Settings.jsx ──────────────────────────────────────────────────────
  SETTINGS_SYNTH_MIN_LABEL: { fr: 'Synthèse ministérielle', en: 'Ministry synthesis' },
  SETTINGS_SAVED:      { fr: '✓ Sauvegardé',            en: '✓ Saved'               },
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
