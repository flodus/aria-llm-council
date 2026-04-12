// src/shared/services/storageKeys.js
// Source de vérité — toutes les clés localStorage du projet ARIA

export const STORAGE_KEYS = {
  // Options & configuration
  OPTIONS:           'aria_options',
  API_KEYS:          'aria_api_keys',
  API_KEYS_STATUS:   'aria_api_keys_status',
  PREFERRED_MODELS:  'aria_preferred_models',
  PROMPTS:           'aria_prompts',
  AGENTS_OVERRIDE:   'aria_agents_override',
  SIM:               'aria_sim',

  // Session en cours
  SESSION_ACTIVE:    'aria_session_active',
  SESSION_WORLD:     'aria_session_world',
  SESSION_COUNTRIES: 'aria_session_countries',
  SESSION_ALLIANCES: 'aria_session_alliances',

  // Interface & préférences
  LANG:              'aria_lang',
  AUDIO_MUTED:       'aria_audio_muted',

  // Radio (RadioPlayer)
  RADIO_STATIONS:    'radio_stations',
  RADIO_CURRENT:     'current_station_id',
  RADIO_VOLUME:      'radio_volume',

  // Chrono
  CHRONOLOG_CYCLES:  'aria_chronolog_cycles',
  CYCLE_NUM:         'aria_cycle_num',
  CHRONIQUEUR:       'aria_chroniqueur',

  // Clés legacy — présentes dans SectionSysteme (possiblement obsolètes)
  WORLD_LEGACY:      'aria_world',
  COUNTRIES_LEGACY:  'aria_countries',
};
