// src/shared/constants/models.js
// Modèles IA par défaut — source de vérité unique

// Modèles utilisés pour les délibérations (qualité)
export const DEFAULT_MODELS = {
  claude:      'claude-sonnet-4-6',
  gemini:      'gemini-2.0-flash',
  grok:        'grok-3-mini',
  openai:      'gpt-4.1-mini',
  openrouter:  'google/gemini-2.0-flash',
};

// Modèles utilisés pour les pings de validation de clé API (rapide + peu coûteux)
export const PING_MODELS = {
  claude: 'claude-haiku-4-5-20251001',
  gemini: 'gemini-2.0-flash',
  grok:   'grok-3-mini',
  openai: 'gpt-4.1-mini',
};
