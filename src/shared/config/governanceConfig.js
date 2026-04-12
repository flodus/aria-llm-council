// src/shared/config/governanceConfig.js
// Source de vérité : options de gouvernance partagées entre Init, Settings et ConstitutionModal
// Ajouter un mode contexte ici = répercuté partout automatiquement.

// ── Modes contexte pays ───────────────────────────────────────────────────────
export const CONTEXT_MODES = [
  {
    value: 'auto',
    icon: '🤖',
    label: { fr: 'Auto',         en: 'Auto'       },
    hint:  { fr: 'Stats toujours + description si disponible (défaut)', en: 'Stats + description if available (default)' },
  },
  {
    value: 'rich',
    icon: '📖',
    label: { fr: 'Enrichi',      en: 'Enriched'   },
    hint:  { fr: "Contexte complet — incite l'IA à inventer un historique cohérent", en: 'Full context — prompts AI to invent a coherent history' },
  },
  {
    value: 'stats_only',
    icon: '📊',
    label: { fr: 'Stats seules', en: 'Stats only'  },
    hint:  { fr: 'Uniquement les chiffres — délibération plus neutre', en: 'Numbers only — more neutral, fewer hallucinations' },
  },
  {
    value: 'off',
    icon: '🚫',
    label: { fr: 'Désactivé',    en: 'Disabled'   },
    hint:  { fr: 'Aucun contexte injecté — délibération aveugle', en: 'No context injected — blind universal deliberation' },
  },
];

// Option "hérite du global" — uniquement dans les vues par-pays (ContextPanel, TabRegime)
export const CONTEXT_MODE_INHERIT = {
  value: '',
  icon: '⚙️',
  label: { fr: 'Hérite du global', en: 'Inherit global'        },
  hint:  { fr: 'Suit le réglage de Settings', en: 'Follows the Settings rule' },
};
