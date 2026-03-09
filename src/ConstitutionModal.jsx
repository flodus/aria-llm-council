// ═══════════════════════════════════════════════════════════════════════════════
//  ConstitutionModal.jsx
//  Modale "Éditer la Constitution" — accessible depuis le SidePanel d'un pays
//  Permet de surcharger la gouvernance ARIA pays par pays.
//
//  Props :
//    country         {object}    — pays sélectionné (objet complet)
//    onSave          {function}  — (updatedCountry) → void
//    onClose         {function}  — ferme la modale
//
//  Lit les defaults depuis getOptions().defaultGovernance
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { MINISTRIES, REGIMES, getOptions, DEFAULT_OPTIONS } from './Dashboard_p1';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const ALL_MINISTRY_IDS = [
  'justice', 'economie', 'defense',
  'sante', 'education', 'ecologie', 'chance',
];

const MINISTRY_META = {
  justice:   { emoji: '⚖️',  label: 'Justice & Vérité'          },
  economie:  { emoji: '💰',  label: 'Économie & Ressources'      },
  defense:   { emoji: '⚔️',  label: 'Défense & Souveraineté'     },
  sante:     { emoji: '🏥',  label: 'Santé & Protection sociale' },
  education: { emoji: '🎓',  label: 'Éducation & Élévation'      },
  ecologie:  { emoji: '🌿',  label: 'Transition Écologique'      },
  chance:    { emoji: '🎲',  label: 'Chance, Imprévu & Crises'   },
};

const PRESIDENCY_OPTIONS = [
  { value: 'duale',      label: 'Duale',      desc: 'Le Phare + La Boussole (défaut ARIA)' },
  { value: 'solaire',    label: 'Solaire',     desc: 'Le Phare seul — vision et direction'  },
  { value: 'lunaire',    label: 'Lunaire',     desc: 'La Boussole seule — mémoire et soin'  },
  { value: 'collegiale', label: 'Collégiale',  desc: 'Vote des 12 ministres sans président' },
];

const REGIME_LIST = [
  ['democratie_liberale',        'Démocratie libérale 🗳️'],
  ['republique_federale',        'République fédérale 🏛️'],
  ['monarchie_constitutionnelle','Monarchie constitutionnelle 👑'],
  ['democratie_directe',         'Démocratie directe 🤝'],
  ['technocratie',               'Technocratie ⚙️'],
  ['oligarchie',                 'Oligarchie 💼'],
  ['junte_militaire',            'Junte militaire ⚔️'],
  ['regime_autoritaire',         'Régime autoritaire 🔒'],
  ['monarchie_absolue',          'Monarchie absolue 👸'],
  ['theocracie',                 'Théocratie ✝️'],
];

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

export default function ConstitutionModal({ country, onSave, onClose }) {
  const globalGov  = getOptions().defaultGovernance || DEFAULT_OPTIONS.defaultGovernance;
  const current    = { ...globalGov, ...(country?.governanceOverride || {}) };

  const [presidency,  setPresidency]  = useState(current.presidency || 'duale');
  const [activeMin,   setActiveMin]   = useState(new Set(current.ministries || globalGov.ministries));
  const [crisisMin,   setCrisisMin]   = useState(current.crisis_ministry !== undefined ? current.crisis_ministry : globalGov.crisis_ministry);
  const [useGlobal,   setUseGlobal]   = useState(!country?.governanceOverride);

  // Nouveaux champs : régime et leader
  const [regime,  setRegime]  = useState(country?.regime  || 'democratie_liberale');
  const [leader,  setLeader]  = useState(country?.leader  || '');

  // ── Toggle ministère ──
  const toggleMinistry = (id) => {
    setActiveMin(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size <= 2) return prev; next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const resetToGlobal = () => {
    setPresidency(globalGov.presidency || 'duale');
    setActiveMin(new Set(globalGov.ministries));
    setCrisisMin(globalGov.crisis_ministry);
    setUseGlobal(true);
  };

  const handleSave = () => {
    const override = useGlobal ? null : {
      presidency,
      ministries:      [...activeMin],
      crisis_ministry: crisisMin,
    };

    // Calculer le diff pour le chronolog
    const prevMin   = new Set(current.ministries || globalGov.ministries);
    const nextMin   = new Set([...activeMin]);
    const ajoutes   = [...nextMin].filter(m => !prevMin.has(m));
    const retires   = [...prevMin].filter(m => !nextMin.has(m));

    const diff = {
      regimeAvant:      country?.regime    || '',
      regimeApres:      regime,
      presidenceAvant:  current.presidency || 'duale',
      presidenceApres:  presidency,
      leaderAvant:      country?.leader    || '',
      leaderApres:      leader,
      ministresDiff:    { ajoutes, retires },
      promptsModifies:  0, // les prompts seront loggés si on les ajoute plus tard
    };

    const regimeData = REGIMES?.[regime] || {};

    onSave({
      ...country,
      regime,
      regimeName:  regimeData.name  || regime,
      regimeEmoji: regimeData.emoji || '🏛️',
      leader:      leader || null,
      governanceOverride: override,
      _constitutionDiff: diff,   // payload pour useChronolog
    });
    onClose();
  };

  const isDiff = !useGlobal || regime !== (country?.regime||'') || leader !== (country?.leader||'') || (
    presidency !== globalGov.presidency ||
    [...activeMin].sort().join() !== [...(globalGov.ministries||[])].sort().join() ||
    crisisMin !== globalGov.crisis_ministry
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={STYLES.overlay} onClick={onClose}>
      <div style={STYLES.modal} onClick={e => e.stopPropagation()}>

        {/* ── En-tête ── */}
        <div style={STYLES.header}>
          <span style={STYLES.headerTitle}>
            ⚖️ Constitution de {country?.nom || 'ce pays'}
          </span>
          <button style={STYLES.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Badge global/override ── */}
        <div style={STYLES.badgeRow}>
          {country?.governanceOverride
            ? <span style={STYLES.badgeOverride}>Constitution propre</span>
            : <span style={STYLES.badgeGlobal}>Hérite du standard global</span>
          }
          {isDiff && (
            <button style={STYLES.resetBtn} onClick={resetToGlobal}>
              ↺ Réinitialiser au standard
            </button>
          )}
        </div>

        <div style={STYLES.body}>

          {/* ── Régime politique ── */}
          <section style={STYLES.section}>
            <h3 style={STYLES.sectionTitle}>RÉGIME POLITIQUE</h3>
            <select
              style={{
                ...STYLES.field,
                background:'rgba(255,255,255,0.04)',
                border:`1px solid rgba(200,164,74,0.20)`,
                borderRadius:'2px', padding:'0.45rem 0.65rem',
                color:'rgba(220,228,240,0.85)',
                fontFamily:"'JetBrains Mono', monospace", fontSize:'0.52rem',
                outline:'none', cursor:'pointer', width:'100%',
              }}
              value={regime}
              onChange={e => setRegime(e.target.value)}
            >
              {REGIME_LIST.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </section>

          {/* ── Chef d'État ── */}
          <section style={STYLES.section}>
            <h3 style={STYLES.sectionTitle}>CHEF D'ÉTAT</h3>
            <input
              style={{
                background:'rgba(255,255,255,0.04)',
                border:`1px solid rgba(200,164,74,0.20)`,
                borderRadius:'2px', padding:'0.45rem 0.65rem',
                color:'rgba(220,228,240,0.85)',
                fontFamily:"'JetBrains Mono', monospace", fontSize:'0.52rem',
                outline:'none', width:'100%', boxSizing:'border-box',
              }}
              value={leader}
              onChange={e => setLeader(e.target.value)}
              placeholder="Nom du dirigeant…"
            />
          </section>

          {/* ── Présidence ── */}
          <section style={STYLES.section}>
            <h3 style={STYLES.sectionTitle}>TYPE DE PRÉSIDENCE</h3>
            <div style={STYLES.presGrid}>
              {PRESIDENCY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  style={{
                    ...STYLES.presCard,
                    ...(presidency === opt.value ? STYLES.presCardActive : {}),
                  }}
                  onClick={() => { setPresidency(opt.value); setUseGlobal(false); }}
                >
                  <span style={STYLES.presLabel}>{opt.label}</span>
                  <span style={STYLES.presDesc}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Ministères ── */}
          <section style={STYLES.section}>
            <h3 style={STYLES.sectionTitle}>
              MINISTÈRES ACTIFS
              <span style={STYLES.countBadge}>{activeMin.size} / {ALL_MINISTRY_IDS.length}</span>
            </h3>
            <p style={STYLES.hint}>Minimum 2 ministères requis.</p>
            <div style={STYLES.minGrid}>
              {ALL_MINISTRY_IDS.map(id => {
                const meta    = MINISTRY_META[id];
                const active  = activeMin.has(id);
                const isMin2  = activeMin.size <= 2 && active;
                return (
                  <button
                    key={id}
                    style={{
                      ...STYLES.minCard,
                      ...(active ? STYLES.minCardActive : STYLES.minCardInactive),
                      ...(isMin2 ? { cursor: 'not-allowed', opacity: 0.5 } : {}),
                    }}
                    onClick={() => { toggleMinistry(id); setUseGlobal(false); }}
                    title={isMin2 ? 'Minimum 2 ministères requis' : ''}
                  >
                    <span style={STYLES.minEmoji}>{meta.emoji}</span>
                    <span style={STYLES.minLabel}>{meta.label}</span>
                    <span style={STYLES.minCheck}>{active ? '✓' : '○'}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Ministère de la Crise ── */}
          <section style={STYLES.section}>
            <h3 style={STYLES.sectionTitle}>GESTION DE CRISE</h3>
            <label style={STYLES.toggleRow}>
              <input
                type="checkbox"
                checked={crisisMin}
                onChange={e => { setCrisisMin(e.target.checked); setUseGlobal(false); }}
                style={{ marginRight: '0.6rem', accentColor: '#C8A44A' }}
              />
              <span style={STYLES.toggleLabel}>
                🎲 Activer le Ministère de la Chance, de l'Imprévu et des Crises
              </span>
            </label>
            <p style={STYLES.hint}>
              Si désactivé, les crises passent directement en délibération plénière des 12 ministres.
            </p>
          </section>

        </div>

        {/* ── Footer ── */}
        <div style={STYLES.footer}>
          <button style={STYLES.cancelBtn} onClick={onClose}>Annuler</button>
          <button style={STYLES.saveBtn} onClick={handleSave}>
            ✓ Appliquer la Constitution
          </button>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(3px)',
  },
  modal: {
    width: '520px', maxWidth: '95vw', maxHeight: '88vh',
    background: '#0D1117',
    border: '1px solid rgba(200,164,74,0.22)',
    borderRadius: '2px',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'JetBrains Mono', monospace",
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(200,164,74,0.14)',
    background: 'rgba(200,164,74,0.04)',
  },
  headerTitle: {
    fontSize: '0.62rem', letterSpacing: '0.18em',
    color: 'rgba(200,164,74,0.85)', textTransform: 'uppercase',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(200,164,74,0.45)', fontSize: '0.75rem', lineHeight: 1,
    padding: '0.1rem 0.3rem',
    transition: 'color 0.15s',
  },
  badgeRow: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  badgeOverride: {
    fontSize: '0.52rem', letterSpacing: '0.10em',
    padding: '0.2rem 0.5rem',
    background: 'rgba(200,164,74,0.12)',
    border: '1px solid rgba(200,164,74,0.30)',
    color: 'rgba(200,164,74,0.80)',
    borderRadius: '2px',
  },
  badgeGlobal: {
    fontSize: '0.52rem', letterSpacing: '0.10em',
    padding: '0.2rem 0.5rem',
    background: 'rgba(90,110,160,0.10)',
    border: '1px solid rgba(90,110,160,0.20)',
    color: 'rgba(140,160,200,0.60)',
    borderRadius: '2px',
  },
  resetBtn: {
    marginLeft: 'auto',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.52rem', letterSpacing: '0.08em',
    color: 'rgba(200,164,74,0.45)',
    padding: '0.2rem 0.4rem',
    textDecoration: 'underline',
  },
  body: {
    overflowY: 'auto', flex: 1,
    padding: '0.75rem 1rem',
    display: 'flex', flexDirection: 'column', gap: '1.2rem',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  sectionTitle: {
    fontSize: '0.50rem', letterSpacing: '0.20em',
    color: 'rgba(200,164,74,0.55)', margin: 0,
    textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  countBadge: {
    fontSize: '0.48rem', padding: '0.1rem 0.4rem',
    background: 'rgba(200,164,74,0.12)',
    border: '1px solid rgba(200,164,74,0.20)',
    borderRadius: '10px',
    color: 'rgba(200,164,74,0.70)',
  },
  hint: {
    fontSize: '0.48rem', color: 'rgba(140,160,200,0.45)',
    margin: 0, lineHeight: 1.5,
  },
  presGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '0.4rem',
  },
  presCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    gap: '0.25rem', padding: '0.6rem 0.7rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '2px', cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  presCardActive: {
    background: 'rgba(200,164,74,0.10)',
    border: '1px solid rgba(200,164,74,0.40)',
  },
  presLabel: {
    fontSize: '0.57rem', letterSpacing: '0.10em',
    color: 'rgba(220,228,240,0.85)', fontWeight: 'bold',
  },
  presDesc: {
    fontSize: '0.47rem', color: 'rgba(140,160,200,0.55)', lineHeight: 1.4,
  },
  minGrid: {
    display: 'flex', flexDirection: 'column', gap: '0.3rem',
  },
  minCard: {
    display: 'flex', alignItems: 'center', gap: '0.7rem',
    padding: '0.45rem 0.7rem',
    border: '1px solid transparent',
    borderRadius: '2px', cursor: 'pointer',
    transition: 'all 0.15s', textAlign: 'left',
    background: 'none',
  },
  minCardActive: {
    background: 'rgba(200,164,74,0.07)',
    border: '1px solid rgba(200,164,74,0.25)',
  },
  minCardInactive: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    opacity: 0.5,
  },
  minEmoji: { fontSize: '0.9rem', minWidth: '1.2rem' },
  minLabel: {
    flex: 1, fontSize: '0.54rem', letterSpacing: '0.07em',
    color: 'rgba(200,215,240,0.80)',
  },
  minCheck: {
    fontSize: '0.55rem', color: 'rgba(200,164,74,0.65)',
    minWidth: '0.8rem', textAlign: 'right',
  },
  toggleRow: {
    display: 'flex', alignItems: 'center',
    cursor: 'pointer', padding: '0.4rem 0',
  },
  toggleLabel: {
    fontSize: '0.54rem', letterSpacing: '0.07em',
    color: 'rgba(200,215,240,0.75)',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.6rem',
    padding: '0.75rem 1rem',
    borderTop: '1px solid rgba(200,164,74,0.12)',
    background: 'rgba(0,0,0,0.25)',
  },
  cancelBtn: {
    padding: '0.45rem 1rem',
    background: 'none',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'rgba(200,215,240,0.45)',
    fontSize: '0.52rem', letterSpacing: '0.12em',
    cursor: 'pointer', borderRadius: '2px',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.15s',
  },
  saveBtn: {
    padding: '0.45rem 1.2rem',
    background: 'rgba(200,164,74,0.12)',
    border: '1px solid rgba(200,164,74,0.45)',
    color: 'rgba(200,164,74,0.90)',
    fontSize: '0.52rem', letterSpacing: '0.12em',
    cursor: 'pointer', borderRadius: '2px',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.15s',
  },
};
