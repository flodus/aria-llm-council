// src/features/council/components/councilStyles.js
// Constantes et helpers de style partagés pour le Conseil ARIA

import { C, FONT } from '../../../shared/theme';
import { loadLang, t } from '../../../ariaI18n';

// ─── Phases de délibération ───────────────────────────────────────────────────

export const PHASES = {
  IDLE:        { order: 0 },
  PEUPLE_IN:   { order: 1, get label() { return t('COUNCIL_PHASE_PEUPLE_IN',   loadLang()); }, icon: '🌐', color: C.blue    },
  MINISTERE:   { order: 2, get label() { return t('COUNCIL_PHASE_MINISTRE',   loadLang()); }, icon: '🏛️', color: C.gold    },
  CERCLE:      { order: 3, get label() { return t('COUNCIL_PHASE_CERCLE',     loadLang()); }, icon: '◎',  color: C.goldDim },
  PRESIDENCE:  { order: 4, get label() { return t('COUNCIL_PHASE_PRESIDENCE', loadLang()); }, icon: '☉',  color: C.purple  },
  PEUPLE_VOTE: { order: 5, get label() { return t('COUNCIL_PHASE_PEUPLE_VOTE',loadLang()); }, icon: '🗳️', color: C.blue    },
  RESULT:      { order: 6, get label() { return t('COUNCIL_PHASE_RESULT',     loadLang()); }, icon: '✦',  color: C.green   },
};

export const PHASE_ORDER = ['PEUPLE_IN', 'MINISTERE', 'CERCLE', 'PRESIDENCE', 'PEUPLE_VOTE', 'RESULT'];

// ─── Dégradés vote ────────────────────────────────────────────────────────────

export const VOTE_GRAD = {
  green:  'linear-gradient(180deg, rgb(72,205,140) 0%, rgb(28,118,70) 100%)',
  red:    'linear-gradient(180deg, rgb(215,88,88)  0%, rgb(138,42,42) 100%)',
  gold:   'linear-gradient(180deg, rgb(218,182,88) 0%, rgb(138,105,28) 100%)',
  purple: 'linear-gradient(180deg, rgb(158,118,242) 0%, rgb(85,50,158) 100%)',
};

// ─── Helpers de style ─────────────────────────────────────────────────────────

export const card = (extra = {}) => ({
  background: C.bgCard,
  border: `1px solid ${C.border}`,
  borderRadius: '3px',
  padding: '0.9rem 1rem',
  ...extra,
});

export const sectionTitle = (color = C.goldDim) => ({
  fontFamily: FONT.mono,
  fontSize: '0.42rem',
  letterSpacing: '0.18em',
  color,
  marginBottom: '0.55rem',
  textTransform: 'uppercase',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
});

export const bubble = (color, extra = {}) => ({
  background: `${color}0F`,
  border: `1px solid ${color}28`,
  borderRadius: '2px',
  padding: '0.6rem 0.75rem',
  ...extra,
});
