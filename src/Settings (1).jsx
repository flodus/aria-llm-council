// ═══════════════════════════════════════════════════════════════════════════
//  Settings.jsx — Page de configuration complète ARIA
//  6 sections : SYSTÈME · CONSTITUTION · CONSEIL · SIMULATION · INTERFACE · À PROPOS
//  Usage : <Settings onClose={() => setPage('dashboard')} />
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import {
  DEFAULT_OPTIONS, getOptions, saveOptions,
  MINISTERS, MINISTRIES, PRESIDENCY,
  REGIMES, TERRAINS, CYCLES_CFG, RESOURCE_KEYS,
} from './Dashboard_p1';
import './Settings.css';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'systeme',      icon: '⚙️',  label: 'SYSTÈME'    },
  { id: 'constitution', icon: '📜',  label: 'CONSTITUTION' },
  { id: 'conseil',      icon: '🏛️', label: 'CONSEIL'     },
  { id: 'simulation',   icon: '🎲',  label: 'SIMULATION'  },
  { id: 'interface',    icon: '🖥️', label: 'INTERFACE'   },
  { id: 'apropos',      icon: '✦',   label: 'À PROPOS'    },
];

const MINISTER_KEYS = [
  'initiateur','gardien','communicant','protecteur','ambassadeur','analyste',
  'arbitre','enqueteur','guide','stratege','inventeur','guerisseur',
];
const MINISTER_LABELS = {
  initiateur:'L\'Initiateur (Bélier)', gardien:'Le Gardien (Taureau)',
  communicant:'Le Communicant (Gémeaux)', protecteur:'Le Protecteur (Cancer)',
  ambassadeur:'L\'Ambassadeur (Lion)', analyste:'L\'Analyste (Vierge)',
  arbitre:'L\'Arbitre (Balance)', enqueteur:'L\'Enquêteur (Scorpion)',
  guide:'Le Guide (Sagittaire)', stratege:'Le Stratège (Capricorne)',
  inventeur:'L\'Inventeur (Verseau)', guerisseur:'Le Guérisseur (Poissons)',
};

const MINISTRY_LABELS = {
  justice:'⚖️ Justice et Vérité', economie:'💰 Économie et Ressources',
  defense:'⚔️ Défense et Souveraineté', sante:'🏥 Santé et Protection Sociale',
  education:'🎓 Éducation et Élévation', ecologie:'🌿 Transition Écologique',
};

const REGIME_LABELS = {
  democratie_liberale:'Démocratie Libérale 🗳️',
  republique_federale:'République Fédérale 🏛️',
  monarchie_constitutionnelle:'Monarchie Constitutionnelle 👑',
  technocratie_ia:'Technocratie IA 🤖',
  junte_militaire:'Junte Militaire ⚔️',
  oligarchie:'Oligarchie 💼',
  theocratie:'Théocratie ✝️',
};

const DEFAULT_PROMPTS = {
  global_system: `Tu es un ministre du gouvernement ARIA, système de gouvernance augmentée par IA. Tu délibères avec rigueur, cohérence et fidélité à ta philosophie fondatrice. Chaque prise de position doit être argumentée, contextualisée et orientée vers le bien collectif à long terme.`,
  ton_synthese: `Ton sobre, institutionnel, factuel. Phrases courtes et denses. Aucune rhétorique. La vérité d'abord.`,
  contexte_mondial: `Le monde est en transition. Les démocraties traditionnelles cherchent de nouveaux équilibres. Les tensions géopolitiques sont réelles mais contenues. La confiance institutionnelle est en reconstruction.`,
  synthese_ministere: `Tu es le système de synthèse institutionnelle du gouvernement ARIA.\n\nTu reçois les positions de deux ministres du même ministère.\nTon rôle : produire la SYNTHÈSE OFFICIELLE DU MINISTÈRE en 3-4 phrases.\n\nRègles :\n- Identifie le point de convergence réel entre les deux positions\n- Nomme explicitement la tension principale si elle persiste\n- La synthèse parle au nom du ministère, pas des ministres individuels\n- Ton sobre, institutionnel, factuel — aucune rhétorique\n- Si les deux positions sont irréconciliables, dis-le clairement\n\nFormat JSON :\n{\n  "convergence": true | false,\n  "synthese": "3-4 phrases",\n  "tension_residuelle": null ou "1 phrase",\n  "recommandation": "1 phrase"\n}`,
  synthese_presidence: `Tu es le système d'arbitrage présidentiel du gouvernement ARIA.\n\nTu reçois les positions du PHARE (vision, direction, long terme) et de la BOUSSOLE (mémoire, protection, humanité).\nTon rôle : déterminer convergence ou divergence, puis formater pour référendum citoyen.\n\nRègles :\n- Convergence : les deux positions aboutissent à la même décision\n- Divergence : positions menant à des choix incompatibles → deux options pour le peuple\n- Ne tranche jamais toi-même — tu formats, tu n'arbitres pas\n- Langage citoyen, accessible, sans jargon\n\nFormat JSON :\n{\n  "convergence": true | false,\n  "position_phare_resume": "1 phrase",\n  "position_boussole_resume": "1 phrase",\n  "question_referendum": "La question soumise au peuple",\n  "enjeu_principal": "1 phrase"\n}`,
  factcheck_evenement: `Tu es le système de cohérence factuelle du gouvernement ARIA.\n\nTu reçois un événement narratif et les statistiques réelles du pays.\nTon rôle : vérifier la cohérence et corriger si nécessaire.\n\nVérifie :\n- L'impact est-il réaliste par rapport au niveau actuel ?\n- La sévérité correspond-elle à l'impact ?\n- Le texte contredit-il les stats ?\n\nFormat JSON :\n{\n  "coherent": true | false,\n  "titre": "conservé ou corrigé",\n  "texte": "conservé ou corrigé",\n  "severite": "info | warning | critical",\n  "impact": { "satisfaction": entier, "popularite": entier },\n  "correction_appliquee": null ou "description"\n}`,
};

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITAIRES LOCAUX
// ─────────────────────────────────────────────────────────────────────────────

function getPrompts() {
  try {
    return { ...DEFAULT_PROMPTS, ...JSON.parse(localStorage.getItem('aria_prompts') || '{}') };
  } catch { return { ...DEFAULT_PROMPTS }; }
}
function savePrompts(p) {
  try { localStorage.setItem('aria_prompts', JSON.stringify(p)); } catch {}
}
function getAgentOverrides() {
  try { return JSON.parse(localStorage.getItem('aria_agents') || '{}'); } catch { return {}; }
}
function saveAgentOverrides(a) {
  try { localStorage.setItem('aria_agents', JSON.stringify(a)); } catch {}
}
function getSimOverrides() {
  try { return JSON.parse(localStorage.getItem('aria_sim') || '{}'); } catch { return {}; }
}
function saveSimOverrides(s) {
  try { localStorage.setItem('aria_sim', JSON.stringify(s)); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANTS UI
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({ icon, label, sub }) {
  return (
    <div className="settings-section-title">
      <span className="settings-section-icon">{icon}</span>
      <div>
        <div className="settings-section-name">{label}</div>
        {sub && <div className="settings-section-sub">{sub}</div>}
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="settings-field">
      <label className="settings-field-label">{label}</label>
      {hint && <div className="settings-field-hint">{hint}</div>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, password, placeholder, mono }) {
  return (
    <input
      type={password ? 'password' : 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || ''}
      className={`settings-input${mono ? ' mono' : ''}`}
    />
  );
}

function TextArea({ value, onChange, rows = 4, mono }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className={`settings-textarea${mono ? ' mono' : ''}`}
    />
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <button
      className={`settings-toggle${value ? ' active' : ''}`}
      onClick={() => onChange(!value)}
    >
      <span className="settings-toggle-track">
        <span className="settings-toggle-thumb" />
      </span>
      {label && <span className="settings-toggle-label">{label}</span>}
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="settings-select"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min} max={max} step={step}
      className="settings-input-number"
    />
  );
}

function SaveBadge({ saved }) {
  if (!saved) return null;
  return <span className="settings-save-badge">✓ Sauvegardé</span>;
}

function DangerButton({ label, onClick, confirm: confirmMsg }) {
  const [armed, setArmed] = useState(false);
  const handleClick = () => {
    if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; }
    onClick();
    setArmed(false);
  };
  return (
    <button
      className={`settings-danger-btn${armed ? ' armed' : ''}`}
      onClick={handleClick}
    >
      {armed ? (confirmMsg || 'Confirmer ?') : label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 1 — SYSTÈME
// ─────────────────────────────────────────────────────────────────────────────

function SectionSysteme() {
  const [opts, setOpts] = useState(() => getOptions());
  const [status, setStatus] = useState({ claude: null, gemini: null });
  const [saved, setSaved] = useState(false);

  const update = (path, val) => {
    setOpts(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      keys.slice(0, -1).forEach(k => { obj = obj[k]; });
      obj[keys[keys.length - 1]] = val;
      return next;
    });
    setSaved(false);
  };

  const save = () => { saveOptions(opts); setSaved(true); };

  const testKey = async (model) => {
    const key = opts.api_keys[model];
    if (!key) { setStatus(s => ({ ...s, [model]: 'missing' })); return; }
    setStatus(s => ({ ...s, [model]: 'testing' }));
    try {
      if (model === 'claude') {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 10, messages: [{ role: 'user', content: 'ping' }] }),
        });
        setStatus(s => ({ ...s, claude: r.ok ? 'ok' : 'error' }));
      } else {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] }),
        });
        setStatus(s => ({ ...s, gemini: r.ok ? 'ok' : 'error' }));
      }
    } catch { setStatus(s => ({ ...s, [model]: 'error' })); }
  };

  const statusLabel = (s) => s === 'ok' ? '✅ Connecté' : s === 'error' ? '❌ Invalide' : s === 'testing' ? '⏳ Test...' : s === 'missing' ? '⚠ Vide' : '— Non testé';

  const iaMode = opts.ia_mode;

  return (
    <div className="settings-section-body">
      <SectionTitle icon="⚙️" label="SYSTÈME" sub="Clés API, moteurs IA, mode de délibération" />

      <div className="settings-group">
        <div className="settings-group-title">CLÉS API</div>

        <Field label="Anthropic — Claude" hint="Nécessaire pour l'incarnation des ministres et de la Présidence">
          <div className="settings-row">
            <TextInput password value={opts.api_keys.claude} onChange={v => update('api_keys.claude', v)} placeholder="sk-ant-..." />
            <button className="settings-btn-test" onClick={() => testKey('claude')}>Tester</button>
            <span className={`settings-status ${status.claude}`}>{statusLabel(status.claude)}</span>
          </div>
        </Field>

        <Field label="Google — Gemini" hint="Nécessaire pour la synthèse ministérielle et présidentielle">
          <div className="settings-row">
            <TextInput password value={opts.api_keys.gemini} onChange={v => update('api_keys.gemini', v)} placeholder="AIza..." />
            <button className="settings-btn-test" onClick={() => testKey('gemini')}>Tester</button>
            <span className={`settings-status ${status.gemini}`}>{statusLabel(status.gemini)}</span>
          </div>
        </Field>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">MODE IA</div>
        <Field label="Architecture de délibération">
          <div className="settings-radio-group">
            {[
              { value: 'aria',        label: 'ARIA', desc: 'Claude pense · Gemini synthétise' },
              { value: 'solo_claude', label: 'Solo Claude', desc: 'Claude pour tout' },
              { value: 'solo_gemini', label: 'Solo Gemini', desc: 'Gemini pour tout' },
              { value: 'custom',      label: 'Custom', desc: 'Assignation manuelle' },
            ].map(m => (
              <label key={m.value} className={`settings-radio-card${iaMode === m.value ? ' selected' : ''}`}>
                <input type="radio" name="ia_mode" value={m.value}
                  checked={iaMode === m.value} onChange={() => update('ia_mode', m.value)} />
                <span className="settings-radio-label">{m.label}</span>
                <span className="settings-radio-desc">{m.desc}</span>
              </label>
            ))}
          </div>
        </Field>

        {iaMode === 'custom' && (
          <div className="settings-custom-roles">
            <div className="settings-group-title" style={{ marginTop: '1rem' }}>ASSIGNATION MANUELLE</div>
            {[
              { key: 'ministre_model',  label: 'Incarnation des ministres' },
              { key: 'synthese_min',    label: 'Synthèse ministérielle' },
              { key: 'phare_model',     label: 'Le Phare (Président)' },
              { key: 'boussole_model',  label: 'La Boussole (Présidente)' },
              { key: 'synthese_pres',   label: 'Synthèse présidentielle' },
              { key: 'evenement_model', label: 'Événements narratifs' },
              { key: 'factcheck_model', label: 'Fact-check événements' },
            ].map(r => (
              <div key={r.key} className="settings-role-row">
                <span className="settings-role-label">{r.label}</span>
                <Select
                  value={opts.ia_roles[r.key]}
                  onChange={v => update(`ia_roles.${r.key}`, v)}
                  options={[{ value: 'claude', label: 'Claude' }, { value: 'gemini', label: 'Gemini' }]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="settings-group">
        <div className="settings-group-title">MODE BOARD GAME</div>
        <Field label="Forcer les textes locaux" hint="Même avec des clés API valides, utilise les réponses pré-écrites d'ariaData.js">
          <Toggle value={opts.gameplay.mode_board_game} onChange={v => update('gameplay.mode_board_game', v)} label={opts.gameplay.mode_board_game ? 'Activé' : 'Désactivé'} />
        </Field>
      </div>

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>Sauvegarder</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 2 — CONSTITUTION
// ─────────────────────────────────────────────────────────────────────────────

function SectionConstitution() {
  const [prompts, setPrompts] = useState(() => getPrompts());
  const [saved, setSaved] = useState(false);

  const update = (key, val) => {
    setPrompts(p => ({ ...p, [key]: val }));
    setSaved(false);
  };
  const save = () => { savePrompts(prompts); setSaved(true); };
  const reset = (key) => { update(key, DEFAULT_PROMPTS[key]); };

  return (
    <div className="settings-section-body">
      <SectionTitle icon="📜" label="CONSTITUTION" sub="Prompts système, ton de synthèse, contexte géopolitique" />

      <div className="settings-group">
        <div className="settings-group-title">ADN GLOBAL</div>

        <Field label="Prompt système global" hint="Injecté en préambule de chaque appel IA — définit la mission d'ARIA">
          <TextArea rows={4} value={prompts.global_system} onChange={v => update('global_system', v)} />
          <button className="settings-btn-reset" onClick={() => reset('global_system')}>↺ Réinitialiser</button>
        </Field>

        <Field label="Ton de synthèse" hint="Style de voix pour les synthèses ministérielles et présidentielles">
          <TextArea rows={2} value={prompts.ton_synthese} onChange={v => update('ton_synthese', v)} />
          <button className="settings-btn-reset" onClick={() => reset('ton_synthese')}>↺ Réinitialiser</button>
        </Field>

        <Field label="Contexte géopolitique mondial" hint="Description de l'état du monde injectée dans chaque délibération">
          <TextArea rows={3} value={prompts.contexte_mondial} onChange={v => update('contexte_mondial', v)} />
          <button className="settings-btn-reset" onClick={() => reset('contexte_mondial')}>↺ Réinitialiser</button>
        </Field>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">PROMPTS ARIA — SYNTHÈSE</div>

        <Field label="Synthèse ministérielle" hint="Reçoit les 2 ministres d'un ministère → produit la position officielle">
          <TextArea rows={6} mono value={prompts.synthese_ministere} onChange={v => update('synthese_ministere', v)} />
          <button className="settings-btn-reset" onClick={() => reset('synthese_ministere')}>↺ Réinitialiser</button>
        </Field>

        <Field label="Synthèse présidentielle" hint="Reçoit Phare + Boussole → détecte convergence/divergence + formate référendum">
          <TextArea rows={6} mono value={prompts.synthese_presidence} onChange={v => update('synthese_presidence', v)} />
          <button className="settings-btn-reset" onClick={() => reset('synthese_presidence')}>↺ Réinitialiser</button>
        </Field>

        <Field label="Fact-check événements" hint="Vérifie la cohérence des événements narratifs avec les stats réelles">
          <TextArea rows={6} mono value={prompts.factcheck_evenement} onChange={v => update('factcheck_evenement', v)} />
          <button className="settings-btn-reset" onClick={() => reset('factcheck_evenement')}>↺ Réinitialiser</button>
        </Field>
      </div>

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>Sauvegarder</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 3 — CONSEIL
// ─────────────────────────────────────────────────────────────────────────────

function SectionConseil() {
  const [agents, setAgents] = useState(() => getAgentOverrides());
  const [selectedMin, setSelectedMin] = useState('initiateur');
  const [selectedMin2, setSelectedMin2] = useState('justice');
  const [tab, setTab]     = useState('ministres'); // 'ministres' | 'ministeres' | 'presidence'
  const [saved, setSaved]  = useState(false);

  const updateAgent = (path, val) => {
    setAgents(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = next;
      parts.slice(0, -1).forEach(k => { if (!obj[k]) obj[k] = {}; obj = obj[k]; });
      obj[parts[parts.length - 1]] = val;
      return next;
    });
    setSaved(false);
  };
  const save = () => { saveAgentOverrides(agents); setSaved(true); };

  // Valeur avec fallback sur les données JSON
  const getVal = (path, fallback = '') => {
    const parts = path.split('.');
    let obj = agents;
    for (const k of parts) { if (obj == null) return fallback; obj = obj[k]; }
    return obj ?? fallback;
  };

  const minData = MINISTERS?.[selectedMin] || {};
  const minFallback = (key) => minData[key] || '';

  const ministryData = MINISTRIES?.[selectedMin2] || {};
  const ministryFallback = (key) => ministryData[key] || '';

  return (
    <div className="settings-section-body">
      <SectionTitle icon="🏛️" label="CONSEIL" sub="Prompts des agents — ministres, présidence" />

      <div className="settings-tabs">
        {[
          { id: 'ministres',  label: 'Ministres' },
          { id: 'ministeres', label: 'Ministères' },
          { id: 'presidence', label: 'Présidence' },
        ].map(t => (
          <button key={t.id}
            className={`settings-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'ministres' && (
        <div>
          <Field label="Sélectionner un ministre">
            <Select
              value={selectedMin}
              onChange={setSelectedMin}
              options={MINISTER_KEYS.map(k => ({ value: k, label: MINISTER_LABELS[k] }))}
            />
          </Field>

          <Field label="Essence" hint="Philosophie profonde — ce qui motive ses positions">
            <TextArea rows={4}
              value={getVal(`ministers.${selectedMin}.essence`, minFallback('essence'))}
              onChange={v => updateAgent(`ministers.${selectedMin}.essence`, v)}
            />
          </Field>

          <Field label="Communication" hint="Voix, ton, façon d'argumenter">
            <TextArea rows={3}
              value={getVal(`ministers.${selectedMin}.comm`, minFallback('comm'))}
              onChange={v => updateAgent(`ministers.${selectedMin}.comm`, v)}
            />
          </Field>

          <Field label="Angle universel en annotation" hint="La question qu'il pose systématiquement sur les synthèses des autres ministères">
            <TextArea rows={3}
              value={getVal(`ministers.${selectedMin}.annotation`, minFallback('annotation'))}
              onChange={v => updateAgent(`ministers.${selectedMin}.annotation`, v)}
            />
          </Field>
        </div>
      )}

      {tab === 'ministeres' && (
        <div>
          <Field label="Sélectionner un ministère">
            <Select
              value={selectedMin2}
              onChange={setSelectedMin2}
              options={Object.entries(MINISTRY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Field>

          <Field label="Mission du ministère" hint="Définit l'objectif et les valeurs du ministère">
            <TextArea rows={3}
              value={getVal(`ministries.${selectedMin2}.mission`, ministryFallback('mission'))}
              onChange={v => updateAgent(`ministries.${selectedMin2}.mission`, v)}
            />
          </Field>

          {/* Prompts spécifiques des 2 ministres dans ce ministère */}
          {(ministryData.ministers || []).map(mKey => (
            <Field key={mKey} label={`Rôle spécifique — ${MINISTER_LABELS[mKey] || mKey}`}
              hint="Comment ce ministre parle depuis l'angle de ce ministère">
              <TextArea rows={3}
                value={getVal(`ministries.${selectedMin2}.${mKey}`,
                  ministryData.ministerPrompts?.[mKey] || '')}
                onChange={v => updateAgent(`ministries.${selectedMin2}.${mKey}`, v)}
              />
            </Field>
          ))}
        </div>
      )}

      {tab === 'presidence' && (
        <div>
          <Field label="Le Phare — Rôle" hint="Président de la Volonté et de la Direction">
            <TextArea rows={4}
              value={getVal('presidency.phare.role', PRESIDENCY?.phare?.role_long || '')}
              onChange={v => updateAgent('presidency.phare.role', v)}
            />
          </Field>
          <Field label="Le Phare — Essence">
            <TextArea rows={3}
              value={getVal('presidency.phare.essence', PRESIDENCY?.phare?.essence || '')}
              onChange={v => updateAgent('presidency.phare.essence', v)}
            />
          </Field>

          <div style={{ borderTop: '1px solid rgba(200,164,74,0.15)', margin: '1.5rem 0' }} />

          <Field label="La Boussole — Rôle" hint="Présidente de l'Âme et de la Réception">
            <TextArea rows={4}
              value={getVal('presidency.boussole.role', PRESIDENCY?.boussole?.role_long || '')}
              onChange={v => updateAgent('presidency.boussole.role', v)}
            />
          </Field>
          <Field label="La Boussole — Essence">
            <TextArea rows={3}
              value={getVal('presidency.boussole.essence', PRESIDENCY?.boussole?.essence || '')}
              onChange={v => updateAgent('presidency.boussole.essence', v)}
            />
          </Field>
        </div>
      )}

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>Sauvegarder</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 4 — SIMULATION
// ─────────────────────────────────────────────────────────────────────────────

function SectionSimulation() {
  const [sim, setSim]   = useState(() => getSimOverrides());
  const [opts, setOpts] = useState(() => getOptions());
  const [saved, setSaved] = useState(false);

  // Valeurs courantes avec fallback JSON
  const getReg = (regKey, field) => sim.regimes?.[regKey]?.[field] ?? REGIMES?.[regKey]?.[field] ?? 1.0;
  const getSeuil = (key) => sim.seuils?.[key] ?? CYCLES_CFG?.[key] ?? 20;
  const getTerrain = (terrainKey, subKey) => sim.terrains?.[terrainKey]?.[subKey] ?? TERRAINS?.[terrainKey]?.[subKey] ?? 1.0;

  const updateSim = (path, val) => {
    setSim(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = next;
      parts.slice(0, -1).forEach(k => { if (!obj[k]) obj[k] = {}; obj = obj[k]; });
      obj[parts[parts.length - 1]] = val;
      return next;
    });
    setSaved(false);
  };
  const updateOpts = (key, val) => {
    setOpts(prev => ({ ...prev, gameplay: { ...prev.gameplay, [key]: val } }));
    setSaved(false);
  };

  const save = () => {
    saveSimOverrides(sim);
    saveOptions(opts);
    setSaved(true);
  };

  return (
    <div className="settings-section-body">
      <SectionTitle icon="🎲" label="SIMULATION" sub="Régimes, seuils critiques, vitesse des cycles, ressources" />

      <div className="settings-group">
        <div className="settings-group-title">VITESSE & CYCLES</div>
        <Field label="Cycles automatiques">
          <Toggle value={opts.gameplay.cycles_auto}
            onChange={v => updateOpts('cycles_auto', v)}
            label={opts.gameplay.cycles_auto ? 'Activé' : 'Désactivé'} />
        </Field>
        {opts.gameplay.cycles_auto && (
          <Field label="Intervalle entre cycles (secondes)">
            <NumberInput value={opts.gameplay.cycles_interval}
              onChange={v => updateOpts('cycles_interval', v)} min={5} max={300} step={5} />
          </Field>
        )}
        <Field label="Événements narratifs IA">
          <Toggle value={opts.gameplay.events_ia}
            onChange={v => updateOpts('events_ia', v)}
            label={opts.gameplay.events_ia ? 'Activés' : 'Désactivés'} />
        </Field>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">SEUILS CRITIQUES</div>
        <Field label="Seuil de révolte (satisfaction %)"
          hint="En dessous de ce seuil, une révolte est déclenchée">
          <NumberInput value={getSeuil('seuil_revolte')}
            onChange={v => updateSim('seuils.seuil_revolte', v)} min={5} max={40} />
        </Field>
        <Field label="Seuil explosion démographique (×%)"
          hint="Si la population × ce facteur / 100 en un cycle, crise déclenchée">
          <NumberInput value={getSeuil('seuil_crise_demo')}
            onChange={v => updateSim('seuils.seuil_crise_demo', v)} min={110} max={300} step={10} />
        </Field>
        <Field label="Bruit aléatoire max (satisfaction ±)"
          hint="Amplitude du hasard dans chaque cycle">
          <NumberInput value={getSeuil('bruit_max')}
            onChange={v => updateSim('seuils.bruit_max', v)} min={0} max={10} />
        </Field>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">COEFFICIENTS DES RÉGIMES</div>
        <div className="settings-regime-hint">
          coeff_satisfaction : impact sur la dérive de satisfaction par cycle<br />
          coeff_croissance : impact sur la démographie et l'économie
        </div>
        <div className="settings-regime-table">
          <div className="settings-regime-header">
            <span>Régime</span>
            <span>Satisfaction</span>
            <span>Croissance</span>
            <span>Natalité</span>
            <span>Mortalité</span>
          </div>
          {Object.keys(REGIME_LABELS).map(rk => (
            <div key={rk} className="settings-regime-row">
              <span className="settings-regime-name">{REGIME_LABELS[rk]}</span>
              {['coeff_satisfaction','coeff_croissance','taux_natalite','taux_mortalite'].map(field => (
                <input key={field} type="number" step="0.01"
                  className="settings-regime-input"
                  value={getReg(rk, field)}
                  onChange={e => updateSim(`regimes.${rk}.${field}`, parseFloat(e.target.value))}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">RESSOURCES PAR TERRAIN</div>
        {Object.entries(TERRAINS || {}).map(([tk, tv]) => (
          <div key={tk} className="settings-terrain-block">
            <div className="settings-terrain-name">{tv.name || tk}</div>
            <Field label="Modificateur population">
              <NumberInput step={0.05}
                value={getTerrain(tk, 'modificateur_pop')}
                onChange={v => updateSim(`terrains.${tk}.modificateur_pop`, v)}
                min={0.5} max={2.0} />
            </Field>
            <Field label="Modificateur économie">
              <NumberInput step={0.05}
                value={getTerrain(tk, 'modificateur_eco')}
                onChange={v => updateSim(`terrains.${tk}.modificateur_eco`, v)}
                min={0.5} max={2.0} />
            </Field>
          </div>
        ))}
      </div>

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>Sauvegarder</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 5 — INTERFACE & MAINTENANCE
// ─────────────────────────────────────────────────────────────────────────────

function SectionInterface({ onHardReset }) {
  const [opts, setOpts] = useState(() => getOptions());
  const [saved, setSaved] = useState(false);

  const update = (key, val) => {
    setOpts(prev => ({ ...prev, gameplay: { ...prev.gameplay, [key]: val } }));
    setSaved(false);
  };
  const save = () => { saveOptions(opts); setSaved(true); };

  const exportConfig = () => {
    const config = {
      options:  getOptions(),
      prompts:  getPrompts(),
      agents:   getAgentOverrides(),
      sim:      getSimOverrides(),
      exported: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aria-config-${Date.now()}.json`;
    a.click();
  };

  const exportWorld = () => {
    try {
      const world = JSON.parse(localStorage.getItem('aria_world') || 'null');
      const countries = JSON.parse(localStorage.getItem('aria_countries') || 'null');
      if (!world && !countries) { alert('Aucun monde en cours.'); return; }
      const blob = new Blob([JSON.stringify({ world, countries, exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `aria-world-${Date.now()}.json`;
      a.click();
    } catch { alert('Erreur export monde.'); }
  };

  const importConfig = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target.result);
        if (config.options)  saveOptions(config.options);
        if (config.prompts)  savePrompts(config.prompts);
        if (config.agents)   saveAgentOverrides(config.agents);
        if (config.sim)      saveSimOverrides(config.sim);
        alert('Configuration importée. Rechargez la page pour appliquer.');
      } catch { alert('Fichier invalide.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-section-body">
      <SectionTitle icon="🖥️" label="INTERFACE & MAINTENANCE" sub="Affichage, export/import, réinitialisation" />

      <div className="settings-group">
        <div className="settings-group-title">AFFICHAGE CARTE</div>
        <Field label="Afficher les ZEE (zones économiques exclusives)">
          <Toggle value={opts.gameplay.show_zee} onChange={v => update('show_zee', v)}
            label={opts.gameplay.show_zee ? 'Visible' : 'Masqué'} />
        </Field>
        <Field label="Afficher la légende">
          <Toggle value={opts.gameplay.show_legend} onChange={v => update('show_legend', v)}
            label={opts.gameplay.show_legend ? 'Visible' : 'Masqué'} />
        </Field>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">EXPORT / IMPORT</div>
        <div className="settings-export-row">
          <button className="settings-export-btn" onClick={exportConfig}>
            ↓ Exporter la configuration
          </button>
          <button className="settings-export-btn" onClick={exportWorld}>
            ↓ Exporter le monde actuel
          </button>
          <label className="settings-export-btn import">
            ↑ Importer une configuration
            <input type="file" accept=".json" onChange={importConfig} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">RÉINITIALISATION</div>
        <div className="settings-danger-zone">
          <div className="settings-danger-desc">
            Le Hard Reset efface <strong>toutes</strong> les données : clés API, prompts personnalisés,
            coefficients modifiés, monde en cours. Irréversible.
          </div>
          <DangerButton
            label="☢ Hard Reset — Tout effacer"
            confirm="Confirmer la destruction totale ?"
            onClick={onHardReset}
          />
        </div>
      </div>

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>Sauvegarder l'affichage</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 6 — À PROPOS
// ─────────────────────────────────────────────────────────────────────────────

function SectionAPropos() {
  return (
    <div className="settings-section-body">
      <SectionTitle icon="✦" label="À PROPOS" sub="Version · Documentation · Crédits" />

      <div className="settings-apropos-block">
        <div className="settings-version-badge">
          <span className="settings-version-number">v0.9</span>
          <span className="settings-version-name">"Alpha Cinzel"</span>
        </div>
        <div className="settings-apropos-desc">
          Architecture de Raisonnement Institutionnel par l'IA.<br />
          Un système de gouvernance délibérative augmentée.<br />
          <em>Délibérer. Annoter. Synthétiser. Décider.</em>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">DOCUMENTATION</div>
        <div className="settings-links">
          <a className="settings-link" href="#" target="_blank" rel="noopener">
            📄 Document de vision ARIA (PDF)
          </a>
          <a className="settings-link" href="#" target="_blank" rel="noopener">
            💻 Code source GitHub
          </a>
          <a className="settings-link" href="#" target="_blank" rel="noopener">
            🎮 Démonstration interactive
          </a>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">ARCHITECTURE TECHNIQUE</div>
        <div className="settings-tech-stack">
          <div className="settings-tech-row"><span>Frontend</span><span>React 18 · Vite · CSS custom</span></div>
          <div className="settings-tech-row"><span>Carte</span><span>SVG pur · PRNG reproductible</span></div>
          <div className="settings-tech-row"><span>IA Pensée</span><span>Claude Sonnet (Anthropic)</span></div>
          <div className="settings-tech-row"><span>IA Synthèse</span><span>Gemini Pro (Google)</span></div>
          <div className="settings-tech-row"><span>Persistance</span><span>localStorage</span></div>
          <div className="settings-tech-row"><span>Données</span><span>base_agents.json · base_stats.json · ariaData.js</span></div>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">PRINCIPE FONDATEUR</div>
        <blockquote className="settings-quote">
          "La vraie question n'est pas de savoir si l'IA entrera dans la gouvernance —
          elle y entre déjà, de manière opaque et non régulée. La question est de savoir
          si nous choisirons de le faire délibérément, avec des garde-fous démocratiques,
          ou par défaut, sans eux."
        </blockquote>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL — Settings
// ─────────────────────────────────────────────────────────────────────────────

export default function Settings({ onClose }) {
  const [activeSection, setActiveSection] = useState('systeme');

  const hardReset = useCallback(() => {
    [
      'aria_options','aria_prompts','aria_agents','aria_sim',
      'aria_world','aria_countries','aria_api_keys',
    ].forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  return (
    <div className="settings-root">

      {/* ── En-tête ── */}
      <div className="settings-header">
        <div className="settings-header-left">
          <span className="settings-header-glyph">✦</span>
          <div>
            <div className="settings-header-title">ARIA — CONFIGURATION</div>
            <div className="settings-header-sub">Architecture de Raisonnement Institutionnel</div>
          </div>
        </div>
        <button className="settings-close-btn" onClick={onClose} title="Retour au Dashboard">
          ✕
        </button>
      </div>

      <div className="settings-layout">

        {/* ── Navigation latérale ── */}
        <nav className="settings-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`settings-nav-item${activeSection === s.id ? ' active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span className="settings-nav-icon">{s.icon}</span>
              <span className="settings-nav-label">{s.label}</span>
              {activeSection === s.id && <span className="settings-nav-cursor" />}
            </button>
          ))}
        </nav>

        {/* ── Contenu ── */}
        <main className="settings-main">
          {activeSection === 'systeme'      && <SectionSysteme />}
          {activeSection === 'constitution' && <SectionConstitution />}
          {activeSection === 'conseil'      && <SectionConseil />}
          {activeSection === 'simulation'   && <SectionSimulation />}
          {activeSection === 'interface'    && <SectionInterface onHardReset={hardReset} />}
          {activeSection === 'apropos'      && <SectionAPropos />}
        </main>
      </div>
    </div>
  );
}
