// ═══════════════════════════════════════════════════════════════════════════
//  Settings.jsx — Page de configuration complète ARIA
//  5 sections : SYSTÈME · CONSTITUTION · GOUVERNEMENT · SIMULATION · À PROPOS
//  Usage : <Settings onClose={() => setPage('dashboard')} />
// ═══════════════════════════════════════════════════════════════════════════

import { getRegimeLabel, getTerrainLabel } from './ariaTheme';
import { useState, useCallback, useEffect, useRef, Component } from 'react';
import { useLocale, t, loadLang } from './ariaI18n';
import BASE_AGENTS    from '../templates/base_agents.json';
import BASE_AGENTS_EN from '../templates/base_agents_en.json';
import {
  DEFAULT_OPTIONS, getOptions, saveOptions,
  MINISTERS, MINISTRIES as MINISTRIES_RAW, PRESIDENCY,
  REGIMES, TERRAINS, CYCLES_CFG, RESOURCE_KEYS,
  getAgents, getStats,
} from './Dashboard_p1';
import './Settings.css';

// MINISTRIES est un tableau dans le JSON — on le convertit en dict { id: item }
const MINISTRIES = Array.isArray(MINISTRIES_RAW)
  ? Object.fromEntries(MINISTRIES_RAW.map(m => [m.id, m]))
  : (MINISTRIES_RAW || {});

// ─────────────────────────────────────────────────────────────────────────────
//  ERROR BOUNDARY — évite qu'une erreur dans une section crash toute la page
// ─────────────────────────────────────────────────────────────────────────────
class SectionErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: '1rem', color: 'rgba(255,80,80,0.75)',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem',
        border: '1px solid rgba(255,80,80,0.20)', borderRadius: '2px',
        background: 'rgba(255,0,0,0.04)' }}>
        ⚠ Erreur dans cette section — {this.state.error?.message || 'Erreur inconnue'}
      </div>
    );
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

function getSections(isEn) {
  return [
    { id: 'conseil',      icon: '🏛️', label: isEn ? 'GOVERNMENT'   : 'GOUVERNEMENT' },
    { id: 'constitution', icon: '📜',  label: isEn ? 'CONSTITUTION' : 'CONSTITUTION' },
    { id: 'simulation',   icon: '🎲',  label: isEn ? 'SIMULATION'   : 'SIMULATION'   },
    { id: 'systeme',      icon: '⚙️',  label: isEn ? 'SYSTEM'       : 'SYSTÈME'      },
    { id: 'apropos',      icon: '✦',   label: isEn ? 'ABOUT'        : 'À PROPOS'     },
  ];
}

const MINISTER_KEYS = [
  'initiateur','gardien','communicant','protecteur','ambassadeur','analyste',
  'arbitre','enqueteur','guide','stratege','inventeur','guerisseur',
];
// ── Getters dynamiques — labels localisés selon aria_lang ─────────────────
function getMinisterLabels() {
  const ag = getAgents();
  return Object.fromEntries(
    Object.entries(ag.ministers || {}).map(([k, m]) => [k, `${m.name} (${m.sign})`])
  );
}
function getMinisterEmojis() {
  const ag = getAgents();
  return Object.fromEntries(
    Object.entries(ag.ministers || {}).map(([k, m]) => [k, m.emoji || '👤'])
  );
}

function getMinistryLabels() {
  const ag = getAgents();
  const mins = Array.isArray(ag.ministries) ? ag.ministries : Object.values(ag.ministries || {});
  return Object.fromEntries(mins.map(m => [m.id, `${m.emoji||''} ${m.name}`]));
}
function getMinistryEmojis() {
  const ag = getAgents();
  const mins = Array.isArray(ag.ministries) ? ag.ministries : Object.values(ag.ministries || {});
  return Object.fromEntries(mins.map(m => [m.id, m.emoji || '🏛️']));
}
const MINISTRY_KEYS = ['justice','economie','defense','sante','education','ecologie','chance'];
const TOOLTIP_MINISTERES = {
  justice:   'Ministère de la Justice et de la Vérité',
  economie:  "Ministère de l'Économie et des Ressources",
  defense:   'Ministère de la Défense et de la Souveraineté',
  sante:     'Ministère de la Santé et de la Protection Sociale',
  education: "Ministère de l'Éducation et de l'Élévation",
  ecologie:  'Ministère de la Transition Écologique',
  chance:    "Ministère de la Chance et de l'Imprévu",
};

// REGIME_LABELS → getRegimeLabel(key, lang) depuis ariaTheme
const REGIME_LABEL_KEYS = ['democratie_liberale', 'republique_federale', 'monarchie_constitutionnelle', 'technocratie_ia', 'junte_militaire', 'oligarchie', 'theocracie'];
function getRegimeLabelMap(lang) {
  return Object.fromEntries(REGIME_LABEL_KEYS.map(k => [k, getRegimeLabel(k, lang)]));
}

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
  const [show, setShow] = useState(false);
  if (!password) return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || ''}
      className={`settings-input${mono ? ' mono' : ''}`}
    />
  );
  return (
    <div style={{ position:'relative', flex:1, display:'flex' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ''}
        className={`settings-input${mono ? ' mono' : ''}`}
        style={{ flex:1, paddingRight:'2rem' }}
      />
      <button onClick={() => setShow(p => !p)}
        style={{ position:'absolute', right:'0.4rem', top:'50%', transform:'translateY(-50%)',
          background:'none', border:'none', cursor:'pointer', padding:'0.1rem', lineHeight:1,
          color: show ? 'rgba(200,164,74,0.70)' : 'rgba(140,160,200,0.35)', fontSize:'0.9rem' }}>
        <span className={show ? 'mdi mdi-eye-lock-open' : 'mdi mdi-eye-lock'} />
      </button>
    </div>
  );
}

function TextArea({ value, onChange, rows = 1, mono }) {
  const ref = useRef(null);
  const resize = (el) => { if (!el) return; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
  useEffect(() => { resize(ref.current); }, []);
  useEffect(() => { resize(ref.current); }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      onInput={e => resize(e.target)}
      rows={rows}
      className={`settings-textarea${mono ? ' mono' : ''}`}
      style={{ overflow:'hidden', resize:'none' }}
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

function NumberInput({ value, onChange, min, max, step = 1, style }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min} max={max} step={step}
      className="settings-input-number"
      style={style}
    />
  );
}

function SaveBadge({ saved }) {
  const { lang: badgeLang } = useLocale();
  if (!saved) return null;
  return <span className="settings-save-badge">{t('SETTINGS_SAVED', badgeLang)}</span>;
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

function SectionSysteme({ onHardReset }) {
  const { lang, setLang } = useLocale();
  const isEn = lang === 'en';
  const [opts, setOpts] = useState(() => getOptions());
  const [saved, setSaved] = useState(false);
  const [openAcc, setOpenAcc]       = useState(null);
  const [openProvAcc, setOpenProvAcc] = useState(null);
  const [status, setStatus] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('aria_api_keys_status') || '{}');
      const k = JSON.parse(localStorage.getItem('aria_api_keys') || '{}');
      return {
        claude: (s.claude==='ok' && k.claude) ? 'ok' : null,
        gemini: (s.gemini==='ok' && k.gemini) ? 'ok' : null,
        grok:   (s.grok  ==='ok' && k.grok)   ? 'ok' : null,
        openai: (s.openai==='ok' && k.openai)  ? 'ok' : null,
      };
    } catch { return { claude:null, gemini:null, grok:null, openai:null }; }
  });

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
  const toggleAcc = (key) => setOpenAcc(p => p === key ? null : key);

  const HDR = (key, label, badge) => (
    <button className="aria-accordion__hdr" onClick={() => toggleAcc(key)}>
      <span className="aria-accordion__arrow">{openAcc===key?'▾':'▸'}</span>
      <span className="aria-accordion__label">{label}</span>
      {badge && <span className="aria-accordion__badge">{badge}</span>}
    </button>
  );

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
      const world    = JSON.parse(localStorage.getItem('aria_world')     || 'null');
      const countries = JSON.parse(localStorage.getItem('aria_countries') || 'null');
      if (!world && !countries) { alert(isEn?'No active world.':'Aucun monde en cours.'); return; }
      const blob = new Blob([JSON.stringify({ world, countries, exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `aria-world-${Date.now()}.json`;
      a.click();
    } catch { alert(isEn?'World export error.':'Erreur export monde.'); }
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
        alert(isEn?'Configuration imported. Reload page to apply.':'Configuration importée. Rechargez la page pour appliquer.');
      } catch { alert(isEn?'Invalid file.':'Fichier invalide.'); }
    };
    reader.readAsText(file);
  };

  // ── Test de connexion par provider ────────────────────────────────────────
  const testKey = async (provider) => {
    const key = opts.api_keys[provider];
    if (!key) { setStatus(s => ({ ...s, [provider]: 'missing' })); return; }
    setStatus(s => ({ ...s, [provider]: 'testing' }));

    const saveStatus = (result) => {
      setStatus(s => {
        const next = { ...s, [provider]: result };
        try { localStorage.setItem('aria_api_keys_status', JSON.stringify(next)); } catch {}
        return next;
      });
    };

    try {
      if (provider === 'claude') {
        const model = opts.ia_models?.claude || 'claude-sonnet-4-6';
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST',
          headers:{ 'Content-Type':'application/json','x-api-key':key,
            'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
          body: JSON.stringify({ model, max_tokens:10, messages:[{ role:'user', content:'ping' }] }),
        });
        saveStatus(r.ok ? 'ok' : 'error');

      } else if (provider === 'gemini') {
        const model = opts.ia_models?.gemini || 'gemini-2.0-flash';
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          { method:'POST', headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({ contents:[{ parts:[{ text:'ping' }] }] }) }
        );
        saveStatus((r.ok || r.status===429) ? 'ok' : 'error');

      } else if (provider === 'grok') {
        const model = opts.ia_models?.grok || 'grok-3-mini';
        const r = await fetch('https://api.x.ai/v1/chat/completions', {
          method:'POST',
          headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${key}` },
          body: JSON.stringify({ model, max_tokens:10, messages:[{ role:'user', content:'ping' }] }),
        });
        saveStatus(r.ok ? 'ok' : 'error');

      } else if (provider === 'openai') {
        const model = opts.ia_models?.openai || 'gpt-4.1-mini';
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST',
          headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${key}` },
          body: JSON.stringify({ model, max_tokens:10, messages:[{ role:'user', content:'ping' }] }),
        });
        saveStatus(r.ok ? 'ok' : 'error');
      }
    } catch { saveStatus('error'); }
  };

  const statusLabel = (s) =>
    s==='ok'      ? (isEn?'✅ Connected':'✅ Connecté')  :
    s==='error'   ? (isEn?'❌ Invalid':'❌ Invalide')  :
    s==='testing' ? '⏳ Test...'  :
    s==='missing' ? (isEn?'⚠ Empty':'⚠ Vide') : (isEn?'— Not tested':'— Non testé');

  // ── Config providers avec modèles disponibles ─────────────────────────────
  const PROVIDERS = [
    {
      id: 'claude', label: 'Anthropic — Claude', placeholder: 'sk-ant-...',
      hint: isEn?'Ministers · Phare · Boussole':'Ministres · Phare · Boussole',
      models: [
        { value:'claude-opus-4-6',          label:`claude-opus-4-6 — ${isEn?'Powerful':'Puissant'}` },
        { value:'claude-sonnet-4-6',         label:`claude-sonnet-4-6 — ${isEn?'ARIA default':'Défaut ARIA'}` },
        { value:'claude-haiku-4-5-20251001', label:`claude-haiku-4-5 — ${isEn?'Fast':'Rapide'}` },
      ],
    },
    {
      id: 'gemini', label: 'Google — Gemini', placeholder: 'AIza...',
      hint: isEn?'Ministry synthesis · Presidential synthesis':'Synthèse ministérielle · Synthèse présidentielle',
      models: [
        { value:'gemini-2.0-flash',   label:`gemini-2.0-flash — ${isEn?'ARIA default':'Défaut ARIA'}` },
        { value:'gemini-1.5-pro',     label:`gemini-1.5-pro — ${isEn?'Powerful':'Puissant'}` },
        { value:'gemini-1.5-flash',   label:`gemini-1.5-flash — ${isEn?'Fast':'Rapide'}` },
      ],
    },
    {
      id: 'grok', label: 'xAI — Grok', placeholder: 'xai-...',
      hint: isEn?'Alternative LLM (OpenAI-compatible)':'LLM alternatif compatible OpenAI',
      models: [
        { value:'grok-3',      label:`grok-3 — ${isEn?'Powerful':'Puissant'}` },
        { value:'grok-3-mini', label:`grok-3-mini — ${isEn?'Default · Fast':'Défaut · Rapide'}` },
      ],
    },
    {
      id: 'openai', label: 'OpenAI — GPT', placeholder: 'sk-...',
      hint: isEn?'Alternative LLM':'LLM alternatif',
      models: [
        { value:'gpt-4.1',      label:`gpt-4.1 — ${isEn?'Powerful':'Puissant'}` },
        { value:'gpt-4.1-mini', label:`gpt-4.1-mini — ${isEn?'Default · Fast':'Défaut · Rapide'}` },
      ],
    },
  ];

  const hasClaude = !!opts.api_keys.claude;
  const hasGemini = !!opts.api_keys.gemini;
  const hasGrok   = !!opts.api_keys.grok;
  const hasOpenai = !!opts.api_keys.openai;
  const anyKey    = hasClaude || hasGemini || hasGrok || hasOpenai;
  const iaMode    = opts.ia_mode;

  // Tous les providers disponibles (clé présente)
  const availableProviders = PROVIDERS.filter(p => !!opts.api_keys[p.id]).map(p => p.id);

  return (
    <div className="settings-section-body">
      <SectionTitle icon="⚙️" label={isEn?"SYSTEM":"SYSTÈME"} sub={isEn?"API Keys · Models · Deliberation architecture":"Clés API · Modèles · Architecture de délibération"} />

      {/* ▸ CLÉS API + MODÈLES */}
      <div className={`aria-accordion${openAcc==='keys' ? ' open' : ''}`}>
        {HDR('keys', isEn?'API KEYS & MODELS':'CLÉS API & MODÈLES',
          `${[opts.api_keys?.claude,opts.api_keys?.gemini,opts.api_keys?.grok,opts.api_keys?.openai].filter(Boolean).length}/4 ${isEn?'keys':'clés'}${Object.values(status).some(s=>s==='ok') ? ' ✅' : ''}`
        )}
        {openAcc==='keys' && (
        <div className="aria-accordion__body">
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.44rem',
          color:'rgba(140,160,200,0.45)', margin:'0 0 0.8rem', lineHeight:1.6 }}>
          {isEn?"Keys are stored locally (localStorage). Only your browser has access.":"Les clés sont stockées localement (localStorage). Seul votre navigateur y a accès."}
        </p>

        {PROVIDERS.map(prov => {
          const hasKey = !!opts.api_keys[prov.id];
          const stat   = status[prov.id];
          const isOpen = openProvAcc === prov.id;
          const statIcon = stat==='ok' ? '✅' : stat==='error' ? '❌' : stat==='testing' ? '⏳' : hasKey ? '🔑' : '—';
          const SUB      = { border:`1px solid ${hasKey ? 'rgba(200,164,74,0.14)' : 'rgba(255,255,255,0.06)'}`, borderRadius:'2px', overflow:'hidden', marginBottom:'0.45rem', background: hasKey ? 'rgba(200,164,74,0.02)' : 'rgba(255,255,255,0.01)' };
          const SUB_BODY = { padding:'0.5rem 0.65rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.5rem', borderTop:`1px solid ${hasKey ? 'rgba(200,164,74,0.10)' : 'rgba(255,255,255,0.05)'}` };
          return (
            <div key={prov.id} style={SUB}>
              <button onClick={() => setOpenProvAcc(p => p === prov.id ? null : prov.id)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem',
                  padding:'0.38rem 0.6rem', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                <span style={{ fontSize:'0.65rem', color:'rgba(200,164,74,0.50)' }}>{isOpen?'▾':'▸'}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem', letterSpacing:'0.10em',
                  color: isOpen ? 'rgba(200,164,74,0.88)' : 'rgba(200,215,240,0.70)', flex:1 }}>
                  {prov.label}
                </span>
                {prov.hint && !isOpen && (
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.36rem',
                    color:'rgba(100,120,160,0.40)' }}>{prov.hint}</span>
                )}
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem',
                  color: stat==='ok' ? 'rgba(58,191,122,0.80)' : stat==='error' ? 'rgba(200,58,58,0.80)' : 'rgba(140,160,200,0.35)',
                  marginLeft:'0.4rem' }}>{statIcon}</span>
              </button>

              {isOpen && (
                <div style={SUB_BODY}>
                  {prov.hint && (
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem',
                      color:'rgba(100,120,160,0.50)', marginBottom:'0.2rem' }}>{prov.hint}</div>
                  )}
                  <div className="settings-row">
                    <TextInput password
                      value={opts.api_keys[prov.id] || ''}
                      onChange={v => update(`api_keys.${prov.id}`, v)}
                      placeholder={prov.placeholder}
                    />
                    <button className="settings-btn-test" onClick={() => testKey(prov.id)}>
                      {isEn?'Test':'Tester'}
                    </button>
                    <span className={`settings-status ${stat}`}>{statusLabel(stat)}</span>
                    {hasKey && (
                      <button title={isEn?`Delete key for ${prov.label}`:`Supprimer la clé ${prov.label}`}
                        onClick={() => { update(`api_keys.${prov.id}`, ''); setStatus(s => ({ ...s, [prov.id]: null })); }}
                        style={{ background:'none', border:'none', cursor:'pointer',
                          fontSize:'0.85rem', opacity:0.40, padding:'0 0.2rem', lineHeight:1 }}>🗑</button>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', opacity: hasKey ? 1 : 0.35 }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
                      color:'rgba(140,160,200,0.50)', minWidth:'4rem' }}>{isEn?"Model":"Modèle"}</span>
                    <select
                      disabled={!hasKey}
                      value={opts.ia_models?.[prov.id] || prov.models[0].value}
                      onChange={e => update(`ia_models.${prov.id}`, e.target.value)}
                      className="settings-select"
                      style={{ cursor: hasKey ? 'pointer' : 'not-allowed', flex:1,
                        fontFamily:"'JetBrains Mono',monospace", fontSize:'0.44rem' }}
                    >
                      {prov.models.map(m => (
                        <option key={m.value} value={m.value}>{m.value}   ({m.label.split('—')[1]?.trim() || ''})</option>
                      ))}
                    </select>
                    {!hasKey && (
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem',
                        color:'rgba(200,80,80,0.55)' }}>{isEn?'⚠ missing key':'⚠ clé manquante'}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
        )}
      </div>

      {/* ▸ LANGUE */}
      <div className={`aria-accordion${openAcc==='lang' ? ' open' : ''}`}>
        {HDR('lang', 'LANGUE / LANGUAGE')}
        {openAcc==='lang' && (
          <div className="aria-accordion__body">
            <div style={{ display:'flex', gap:'0.4rem', alignItems:'center', padding:'0.3rem 0' }}>
              {['fr','en'].map(l => (
                <button key={l} onClick={() => {
                  setLang(l);
                  try {
                    const BASE_NEW = l === 'en' ? BASE_AGENTS_EN : BASE_AGENTS;
                    const BASE_OLD = l === 'en' ? BASE_AGENTS    : BASE_AGENTS_EN;
                    const cur = JSON.parse(localStorage.getItem('aria_agents_override') || 'null');
                    const merged = JSON.parse(JSON.stringify(BASE_NEW));
                    if (cur) {
                      if (Array.isArray(merged.ministries) && Array.isArray(cur.ministries)) {
                        merged.ministries = merged.ministries.map(m => {
                          const curM  = cur.ministries.find(c => c.id === m.id);
                          const oldBM = (Array.isArray(BASE_OLD.ministries) ? BASE_OLD.ministries : []).find(c => c.id === m.id);
                          if (!curM) return m;
                          const missionCustom = curM.mission && curM.mission !== (oldBM?.mission||'') && curM.mission !== m.mission;
                          const promptsCustom = curM.ministerPrompts && JSON.stringify(curM.ministerPrompts) !== JSON.stringify(oldBM?.ministerPrompts||{}) && JSON.stringify(curM.ministerPrompts) !== JSON.stringify(m.ministerPrompts||{});
                          return { ...m, mission: missionCustom ? curM.mission : m.mission, ministerPrompts: promptsCustom ? curM.ministerPrompts : m.ministerPrompts };
                        });
                      }
                      if (merged.ministers && cur.ministers) {
                        Object.keys(merged.ministers).forEach(k => {
                          const curMin = cur.ministers[k];
                          const oldBMin = BASE_OLD.ministers?.[k] || {};
                          if (!curMin) return;
                          const isCustom = (field) => curMin[field] && curMin[field] !== (oldBMin[field]||'') && curMin[field] !== merged.ministers[k][field];
                          merged.ministers[k] = { ...merged.ministers[k], essence: isCustom('essence') ? curMin.essence : merged.ministers[k].essence, comm: isCustom('comm') ? curMin.comm : merged.ministers[k].comm, annotation: isCustom('annotation') ? curMin.annotation : merged.ministers[k].annotation };
                        });
                      }
                      if (merged.presidency && cur.presidency) {
                        ['phare','boussole'].forEach(role => {
                          if (!cur.presidency[role]) return;
                          const oldBP = BASE_OLD.presidency?.[role] || {};
                          const isCustomP = (field) => cur.presidency[role][field] && cur.presidency[role][field] !== (oldBP[field]||'') && cur.presidency[role][field] !== merged.presidency[role][field];
                          merged.presidency[role] = { ...merged.presidency[role], role_long: isCustomP('role_long') ? cur.presidency[role].role_long : merged.presidency[role].role_long, essence: isCustomP('essence') ? cur.presidency[role].essence : merged.presidency[role].essence };
                        });
                      }
                      merged.active_ministries = cur.active_ministries;
                      merged.active_presidency = cur.active_presidency;
                      merged.active_ministers  = cur.active_ministers;
                    }
                    localStorage.setItem('aria_agents_override', JSON.stringify(merged));
                  } catch(e) { console.warn('lang switch override failed', e); }
                }} style={{
                  background: lang===l ? 'rgba(200,164,74,0.15)' : 'rgba(255,255,255,0.03)',
                  border:`1px solid ${lang===l ? 'rgba(200,164,74,0.50)' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius:'2px', padding:'0.30rem 0.9rem',
                  color: lang===l ? 'rgba(200,164,74,0.92)' : 'rgba(150,170,205,0.40)',
                  fontFamily:"'JetBrains Mono', monospace", fontSize:'0.50rem',
                  letterSpacing:'0.16em', cursor:'pointer', transition:'all 0.15s',
                }}>{l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</button>
              ))}
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'0.42rem',
                color:'rgba(120,140,175,0.40)', marginLeft:'0.5rem' }}>
                {t('SETTINGS_LANG_LABEL', lang)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ▸ AFFICHAGE CARTE */}
      <div className={`aria-accordion${openAcc==='display' ? ' open' : ''}`}>
        {HDR('display', isEn?'MAP DISPLAY':'AFFICHAGE CARTE')}
        {openAcc==='display' && (
          <div className="aria-accordion__body">
            <Field label={isEn?"Show EEZ (exclusive economic zones)":"Afficher les ZEE (zones économiques exclusives)"}>
              <Toggle value={opts.gameplay?.show_zee} onChange={v => update('gameplay.show_zee', v)}
                label={opts.gameplay?.show_zee ? (isEn?'Visible':'Visible') : (isEn?'Hidden':'Masqué')} />
            </Field>
            <Field label={isEn?"Show legend":"Afficher la légende"}>
              <Toggle value={opts.gameplay?.show_legend} onChange={v => update('gameplay.show_legend', v)}
                label={opts.gameplay?.show_legend ? (isEn?'Visible':'Visible') : (isEn?'Hidden':'Masqué')} />
            </Field>
          </div>
        )}
      </div>

      {/* ▸ EXPORT / IMPORT */}
      <div className={`aria-accordion${openAcc==='export' ? ' open' : ''}`}>
        {HDR('export', 'EXPORT / IMPORT')}
        {openAcc==='export' && (
          <div className="aria-accordion__body">
            <div className="settings-export-row">
              <button className="settings-export-btn" onClick={exportConfig}>
                {isEn?'↓ Export configuration':'↓ Exporter la configuration'}
              </button>
              <button className="settings-export-btn" onClick={exportWorld}>
                {isEn?'↓ Export current world':'↓ Exporter le monde actuel'}
              </button>
              <label className="settings-export-btn import">
                {isEn?'↑ Import configuration':'↑ Importer une configuration'}
                <input type="file" accept=".json" onChange={importConfig} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Hard Reset — toujours visible */}
      <div className="settings-group">
        <div className="settings-group-title">{isEn?"RESET":"RÉINITIALISATION"}</div>
        <div className="settings-danger-zone">
          <div className="settings-danger-desc">
            {isEn?"Hard Reset erases":"Le Hard Reset efface"} <strong>{isEn?"all":"toutes"}</strong> {isEn?"data: API keys, custom prompts,":"les données : clés API, prompts personnalisés,"}
            {isEn?" modified coefficients, current world. Irreversible.":" coefficients modifiés, monde en cours. Irréversible."}
          </div>
          <DangerButton
            label={isEn?"☢ Hard Reset — Erase everything":"☢ Hard Reset — Tout effacer"}
            confirm={isEn?"Confirm total destruction?":"Confirmer la destruction totale ?"}
            onClick={onHardReset}
          />
        </div>
      </div>

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>{isEn?"Save":"Sauvegarder"}</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}


function SectionConstitution() {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const [prompts, setPrompts] = useState(() => getPrompts());
  const [opts, setOpts]       = useState(() => getOptions());
  const [saved, setSaved]     = useState(false);
  const [openAcc, setOpenAcc] = useState(null);

  const update = (key, val) => { setPrompts(p => ({ ...p, [key]: val })); setSaved(false); };
  const updateOpts = (path, val) => {
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
  const save  = () => { savePrompts(prompts); saveOptions(opts); setSaved(true); };
  const reset = (key) => { update(key, DEFAULT_PROMPTS[key]); };
  const toggleAcc = (key) => setOpenAcc(p => p === key ? null : key);

  const PROVIDERS = [
    { id:'claude', label:'Anthropic — Claude', models:[{value:'claude-opus-4-6',label:'opus-4-6'},{value:'claude-sonnet-4-6',label:'sonnet-4-6'},{value:'claude-haiku-4-5-20251001',label:'haiku-4-5'}] },
    { id:'gemini', label:'Google — Gemini',    models:[{value:'gemini-2.0-flash',label:'2.0-flash'},{value:'gemini-1.5-pro',label:'1.5-pro'},{value:'gemini-1.5-flash',label:'1.5-flash'}] },
    { id:'grok',   label:'xAI — Grok',         models:[{value:'grok-3',label:'grok-3'},{value:'grok-3-mini',label:'grok-3-mini'}] },
    { id:'openai', label:'OpenAI — GPT',        models:[{value:'gpt-4.1',label:'gpt-4.1'},{value:'gpt-4.1-mini',label:'gpt-4.1-mini'}] },
  ];
  const anyKey = !!(opts.api_keys?.claude || opts.api_keys?.gemini || opts.api_keys?.grok || opts.api_keys?.openai);
  const iaMode = opts.ia_mode;
  const availableProviders = PROVIDERS.filter(p => !!opts.api_keys?.[p.id]).map(p => p.id);

  const parsePromptParts = (text) => {
    const jsonStart = text.indexOf('Format JSON');
    if (jsonStart === -1) return { body: text, json: null };
    return { body: text.slice(0, jsonStart).trim(), json: text.slice(jsonStart).trim() };
  };

  const SYNTH_ENTRIES = [
    { key: 'synthese_ministere',  label: t('SETTINGS_SYNTH_MIN_LABEL', lang),
      hint: isEn?'Receives the 2 ministers of a ministry → produces the official ministry position':'Reçoit les 2 ministres d\'un ministère → produit la position officielle du ministère' },
    { key: 'synthese_presidence', label: isEn?'Presidential synthesis':'Synthèse présidentielle',
      hint: isEn?'Receives Lighthouse + Compass → detects convergence/divergence + formats citizen referendum':'Reçoit Phare + Boussole → détecte convergence/divergence + formate référendum citoyen' },
    { key: 'factcheck_evenement', label: isEn?'Event fact-check':'Fact-check événements',
      hint: isEn?'Verifies narrative event consistency with real country statistics':'Vérifie la cohérence des événements narratifs avec les statistiques réelles du pays' },
  ];

  const HDR = (key, label, badge) => (
    <button className="aria-accordion__hdr" onClick={() => toggleAcc(key)}>
      <span className="aria-accordion__arrow">{openAcc===key?'▾':'▸'}</span>
      <span className="aria-accordion__label">{label}</span>
      {badge && <span className="aria-accordion__badge">{badge}</span>}
    </button>
  );

  return (
    <div className="settings-section-body">
      <SectionTitle icon="📜" label={isEn?"CONSTITUTION":"CONSTITUTION"} sub={isEn?"Deliberation architecture · DNA · Synthesis prompts":"Architecture de délibération · ADN · Prompts de synthèse"} />

      {/* ▸ ARCHITECTURE DE DÉLIBÉRATION */}
      <div className={`aria-accordion${openAcc==='arch' ? ' open' : ''}`}>
        {HDR('arch', isEn?'DELIBERATION ARCHITECTURE':'ARCHITECTURE DE DÉLIBÉRATION')}
        {openAcc==='arch' && (
          <div className="aria-accordion__body">
            <Field label="Mode IA">
              {!anyKey ? (
                <div style={{ padding:'0.65rem 0.9rem', background:'rgba(200,164,74,0.04)',
                  border:'1px solid rgba(200,164,74,0.12)', borderRadius:'2px',
                  fontFamily:"'JetBrains Mono',monospace", fontSize:'0.47rem',
                  color:'rgba(200,164,74,0.60)', lineHeight:1.7 }}>
                  <div style={{ fontWeight:700, marginBottom:'0.3rem', letterSpacing:'0.12em' }}>{isEn?'ARIA MODE — OFFLINE':'MODE ARIA — HORS LIGNE'}</div>
                  {isEn?"No API key configured. Add at least one key in System settings.":"Aucune clé API configurée. Ajoutez au moins une clé dans Système."}
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  <div className="settings-radio-group">
                    {[
                      { value:'aria',   label:'ARIA',               desc:isEn?'Multi-LLM architecture (default)':'Architecture multi-LLM (défaut)' },
                      { value:'solo',   label:'Solo',                desc:isEn?'All roles on a single LLM':'Tous les rôles sur un seul LLM' },
                      { value:'custom', label:isEn?'Custom':'Personnalisé', desc:isEn?'Role-by-role assignment':'Assignation rôle par rôle' },
                      { value:'none',   label:'🎲 Board Game',       desc:isEn?'Force local pre-written responses':'Force les réponses pré-écrites locales' },
                    ].filter(m => {
                      if (availableProviders.length === 0) return m.value === 'none';
                      if (availableProviders.length === 1) return m.value === 'solo' || m.value === 'none';
                      return true;
                    }).map(m => (
                      <label key={m.value} className={`settings-radio-card${iaMode===m.value?' selected':''}`} style={{ cursor:'pointer' }}>
                        <input type="radio" name="ia_mode" value={m.value} checked={iaMode===m.value} onChange={() => updateOpts('ia_mode', m.value)} />
                        <span className="settings-radio-label">{m.label}</span>
                        {m.desc && <span className="settings-radio-desc">{m.desc}</span>}
                      </label>
                    ))}
                  </div>
                  {iaMode === 'solo' && (
                    <div style={{ paddingLeft:'0.8rem' }}>
                      <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>{isEn?"SOLO LLM":"LLM SOLO"}</div>
                      {availableProviders.length === 1 ? (
                        // Un seul provider : cartouche non-interactif
                        <span style={{ display:'inline-block', fontFamily:"'JetBrains Mono',monospace",
                          fontSize:'0.42rem', letterSpacing:'0.10em',
                          padding:'0.20rem 0.6rem', borderRadius:'2px',
                          border:'1px solid rgba(200,164,74,0.35)', color:'rgba(200,164,74,0.80)',
                          background:'rgba(200,164,74,0.06)' }}>
                          {PROVIDERS.find(p => p.id === availableProviders[0])?.label.split('—')[1]?.trim() || availableProviders[0]}
                        </span>
                      ) : (
                        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                          {PROVIDERS.map(p => {
                            const disabled = !opts.api_keys?.[p.id];
                            return (
                              <label key={p.id} className={`settings-radio-card${opts.solo_model===p.id?' selected':''}${disabled?' disabled':''}`}
                                style={{ opacity:disabled?0.30:1, cursor:disabled?'not-allowed':'pointer', flex:'0 0 auto', padding:'0.3rem 0.8rem' }}>
                                <input type="radio" name="solo_model" value={p.id} disabled={disabled}
                                  checked={opts.solo_model===p.id} onChange={() => !disabled && updateOpts('solo_model', p.id)} />
                                <span className="settings-radio-label">{p.label.split('—')[1]?.trim() || p.id}</span>
                                {disabled && <span style={{ fontSize:'0.36rem', color:'rgba(200,80,80,0.55)', marginLeft:'0.3rem' }}>⚠</span>}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {iaMode === 'aria' && (
                    <div style={{ paddingLeft:'0.8rem' }}>
                      <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>{isEn?"DELIBERATION":"DÉLIBÉRATION"}</div>
                      {[
                        { key:'ministre_model', label:isEn?'Ministers think':'Ministres pensent' },
                        { key:'synthese_min',   label:t('SETTINGS_SYNTH_MIN_LABEL', lang) },
                      ].map(r => (
                        <div key={r.key} className="settings-role-row">
                          <span className="settings-role-label">{r.label}</span>
                          <Select value={opts.ia_roles?.[r.key] || 'claude'} onChange={v => updateOpts(`ia_roles.${r.key}`, v)}
                            options={availableProviders.map(pid => ({ value:pid, label:PROVIDERS.find(p=>p.id===pid)?.label.split('—')[1]?.trim()||pid }))} />
                        </div>
                      ))}
                    </div>
                  )}
                  {iaMode === 'custom' && (
                    <div style={{ paddingLeft:'0.8rem' }}>
                      <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>{isEn?"ROLE ASSIGNMENT":"ASSIGNATION DES RÔLES"}</div>
                      {[
                        { key:'ministre_model',  label:isEn?'Minister incarnation':'Incarnation des ministres' },
                        { key:'synthese_min',    label:t('SETTINGS_SYNTH_MIN_LABEL', lang) },
                        { key:'phare_model',     label:isEn?'The Lighthouse (President)':'Le Phare (Président)' },
                        { key:'boussole_model',  label:isEn?'The Compass (Vice-President)':'La Boussole (Présidente)' },
                        { key:'synthese_pres',   label:isEn?'Presidential synthesis':'Synthèse présidentielle' },
                        { key:'evenement_model', label:isEn?'Narrative events':'Événements narratifs' },
                        { key:'factcheck_model', label:isEn?'Fact-check':'Fact-check' },
                      ].map(r => (
                        <div key={r.key} className="settings-role-row">
                          <span className="settings-role-label">{r.label}</span>
                          <Select value={opts.ia_roles?.[r.key] || 'claude'} onChange={v => updateOpts(`ia_roles.${r.key}`, v)}
                            options={availableProviders.map(pid => ({ value:pid, label:PROVIDERS.find(p=>p.id===pid)?.label.split('—')[1]?.trim()||pid }))} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Field>
          </div>
        )}
      </div>

      {/* ▸ ADN GLOBAL */}
      <div className={`aria-accordion${openAcc==='adn' ? ' open' : ''}`}>
        {HDR('adn', isEn?'GLOBAL DNA':'ADN GLOBAL')}
        {openAcc==='adn' && (
          <div className="aria-accordion__body">
            <Field label={isEn?"Global system prompt":"Prompt système global"} hint={isEn?"Injected as preamble to every AI call — defines ARIA's mission":"Injecté en préambule de chaque appel IA — définit la mission d'ARIA"}>
              <TextArea value={prompts.global_system} onChange={v => update('global_system', v)} />
              <button className="settings-btn-reset" onClick={() => reset('global_system')}>{isEn?"↺ Reset":"↺ Réinitialiser"}</button>
            </Field>
            <Field label={isEn?"Synthesis tone":"Ton de synthèse"} hint={isEn?"Voice style for ministry and presidential syntheses":"Style de voix pour les synthèses ministérielles et présidentielles"}>
              <TextArea value={prompts.ton_synthese} onChange={v => update('ton_synthese', v)} />
              <button className="settings-btn-reset" onClick={() => reset('ton_synthese')}>{isEn?"↺ Reset":"↺ Réinitialiser"}</button>
            </Field>
            <Field label={isEn?"Global geopolitical context":"Contexte géopolitique mondial"} hint={isEn?"World state description injected into each deliberation":"Description de l'état du monde injectée dans chaque délibération"}>
              <TextArea value={prompts.contexte_mondial} onChange={v => update('contexte_mondial', v)} />
              <button className="settings-btn-reset" onClick={() => reset('contexte_mondial')}>{isEn?"↺ Reset":"↺ Réinitialiser"}</button>
            </Field>
          </div>
        )}
      </div>

      {/* ▸ PROMPTS ARIA — SYNTHÈSE */}
      <div className={`aria-accordion${openAcc==='prompts' ? ' open' : ''}`}>
        {HDR('prompts', isEn?'ARIA PROMPTS — SYNTHESIS':'PROMPTS ARIA — SYNTHÈSE', isEn?'READ ONLY':'LECTURE SEULE')}
        {openAcc==='prompts' && (
          <div className="aria-accordion__body">
            {isEn && (
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
                color:'rgba(200,164,74,0.55)', background:'rgba(200,164,74,0.04)',
                border:'1px solid rgba(200,164,74,0.18)', borderRadius:'2px',
                padding:'0.5rem 0.75rem', lineHeight:1.55 }}>
                ℹ️ These prompts are in French — intentional. They define the JSON response format the engine parses. The DNA fields above can be freely written in English.
              </div>
            )}
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.43rem',
              color:'rgba(140,160,200,0.45)', lineHeight:1.6 }}>
              {isEn?"These prompts define the expected JSON response format for the ARIA engine.":"Ces prompts définissent le format de réponse JSON attendu par le moteur ARIA."}
              {isEn?' Their structure is critical — displayed for reference only.':' Leur structure est critique — affichés ici à titre de référence.'}
            </div>
            {SYNTH_ENTRIES.map(({ key, label, hint }) => {
              const { body, json } = parsePromptParts(DEFAULT_PROMPTS[key]);
              return (
                <div key={key} style={{ background:'rgba(8,13,22,0.70)', border:'1px solid rgba(90,110,160,0.14)',
                  borderRadius:'2px', overflow:'hidden' }}>
                  <div style={{ padding:'0.5rem 0.8rem', borderBottom:'1px solid rgba(90,110,160,0.10)',
                    background:'rgba(90,110,160,0.05)', display:'flex', justifyContent:'space-between',
                    alignItems:'flex-start', gap:'0.5rem' }}>
                    <div>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.50rem',
                        letterSpacing:'0.12em', color:'rgba(200,164,74,0.70)', textTransform:'uppercase' }}>{label}</div>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.41rem',
                        color:'rgba(140,160,200,0.40)', marginTop:'0.2rem', lineHeight:1.4 }}>
                    {hint}
                  </div>
                </div>
                <span style={{
                  fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem', flexShrink:0,
                  padding:'0.1rem 0.4rem', borderRadius:'2px',
                  background:'rgba(90,110,160,0.08)', border:'1px solid rgba(90,110,160,0.15)',
                  color:'rgba(90,110,160,0.50)', letterSpacing:'0.08em',
                }}>{isEn?"🔒 read-only":"🔒 non-modifiable"}</span>
              </div>

              {/* Corps du prompt */}
              <div style={{ padding:'0.6rem 0.8rem' }}>
                <pre style={{
                  fontFamily:"'JetBrains Mono',monospace", fontSize:'0.43rem',
                  color:'rgba(180,200,230,0.62)', lineHeight:1.65,
                  whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0,
                }}>{body}</pre>

                {/* Bloc format JSON */}
                {json && (
                  <div style={{
                    marginTop:'0.6rem',
                    borderTop:'1px solid rgba(200,164,74,0.10)',
                    paddingTop:'0.5rem',
                  }}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem',
                      letterSpacing:'0.12em', color:'rgba(200,164,74,0.40)', marginBottom:'0.3rem' }}>
                      {isEn?'◈ EXPECTED RESPONSE FORMAT':'◈ FORMAT DE RÉPONSE ATTENDU'}
                    </div>
                    <pre style={{
                      fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
                      color:'rgba(100,200,120,0.65)', lineHeight:1.7,
                      whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0,
                      padding:'0.5rem 0.6rem',
                      background:'rgba(0,255,136,0.03)',
                      border:'1px solid rgba(0,255,136,0.08)',
                      borderRadius:'2px',
                    }}>{json}</pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>

    <div className="settings-footer">
      <button className="settings-save-btn" onClick={save}>{isEn?"Save":"Sauvegarder"}</button>
      <SaveBadge saved={saved} />
    </div>
  </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 3 — GOUVERNEMENT
// ─────────────────────────────────────────────────────────────────────────────

function SectionConseil() {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const [agents, setAgents] = useState(() => getAgentOverrides());
  const [govOpts, setGovOpts] = useState(() => getOptions());
  const [selectedMin, setSelectedMin] = useState('initiateur');
  const [selectedMin2, setSelectedMin2] = useState('justice');
  const [tab, setTab]         = useState('gouvernance'); // 'gouvernance' | 'presidence' | 'ministeres' | 'ministres'
  const [presOpenAcc, setPresOpenAcc] = useState(null);
  const [saved, setSaved]  = useState(false);

  const updateGovOpts = (path, val) => {
    setGovOpts(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      keys.slice(0, -1).forEach(k => { if (!obj[k]) obj[k] = {}; obj = obj[k]; });
      obj[keys[keys.length - 1]] = val;
      return next;
    });
    setSaved(false);
  };

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
  const save = () => {
    saveAgentOverrides(agents);
    saveOptions(govOpts);   // sauvegarde aussi la gouvernance (onglet Gouvernance)
    setSaved(true);
  };

  // Valeur avec fallback sur les données JSON
  const getVal = (path, fallback = '') => {
    const parts = path.split('.');
    let obj = agents;
    for (const k of parts) { if (obj == null) return fallback; obj = obj[k]; }
    return obj ?? fallback;
  };


  // ── Traductions SectionConseil ───────────────────────────────────────
  const trC = {
    essence_hint:   isEn ? "Deep philosophy — what drives their positions"
                         : "Philosophie profonde — ce qui motive ses positions",
    comm_hint:      isEn ? "Voice, tone, way of arguing"
                         : "Voix, ton, façon d'argumenter",
    annot_label:    isEn ? "Universal annotation angle"
                         : "Angle universel en annotation",
    annot_hint:     isEn ? "The question they systematically ask on other ministries' syntheses"
                         : "La question qu'il pose systématiquement sur les synthèses des autres ministères",
    selMin:         isEn ? "Select a ministry"    : "Sélectionner un ministère",
    missionLabel:   isEn ? "Ministry mission"     : "Mission du ministère",
    missionHint:    isEn ? "Defines the ministry's objective and values"
                         : "Définit l'objectif et les valeurs du ministère",
    roleHint:       isEn ? "How this minister speaks from this ministry's angle"
                         : "Comment ce ministre parle depuis l'angle de ce ministère",
    rolePrefix:     isEn ? "Specific role"        : "Rôle spécifique",
  };
  // Données dynamiques localisées
  const liveAgents    = getAgents();
  const liveStats     = getStats();
  const liveMinsters  = liveAgents.ministers  || {};
  const liveMinstries = Array.isArray(liveAgents.ministries)
    ? Object.fromEntries(liveAgents.ministries.map(m=>[m.id,m]))
    : (liveAgents.ministries || {});

  const minData = liveMinsters[selectedMin] || MINISTERS?.[selectedMin] || {};
  const minFallback = (key) => minData[key] || '';

  const ministryData = liveMinstries[selectedMin2] || MINISTRIES?.[selectedMin2] || {};
  const ministryFallback = (key) => ministryData[key] || '';

  const ministerLabels  = getMinisterLabels();
  const ministerEmojis  = getMinisterEmojis();
  const ministryLabels  = getMinistryLabels();
  const ministryEmojis  = getMinistryEmojis();

  return (
    <div className="settings-section-body">
      <SectionTitle icon="🏛️" label="GOUVERNEMENT" sub={isEn ? "Deliberating agents — ministers, presidency" : "Agents délibérants — ministres, présidence"} />

      <div className="settings-tabs">
        {[
          { id: 'gouvernance', label: isEn ? 'Governance' : 'Gouvernance' },
          { id: 'presidence',  label: isEn ? 'Presidency' : 'Présidence' },
          { id: 'ministeres',  label: isEn ? 'Ministries' : 'Ministères' },
          { id: 'ministres',   label: isEn ? 'Ministers'  : 'Ministres'  },
        ].map(t => (
          <button key={t.id}
            className={`settings-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'ministres' && (
        <div>
          {/* Grille icônes ministres */}
          <div style={{marginBottom:'1.2rem'}}>
            <div style={{fontSize:'0.75rem',color:'rgba(200,164,74,0.7)',letterSpacing:'0.10em',marginBottom:'0.6rem',textTransform:'uppercase'}}>
              {isEn ? 'Select a minister' : 'Sélectionner un ministre'}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
              {MINISTER_KEYS.map(k => {
                const isSelected = selectedMin === k;
                return (
                  <button key={k}
                    title={ministerLabels[k] || k}
                    onClick={() => setSelectedMin(k)}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.2rem',
                      padding:'0.6rem 0.7rem',borderRadius:'6px',cursor:'pointer',minWidth:'3.5rem',
                      background: isSelected ? 'rgba(200,164,74,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(200,164,74,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      transition:'all 0.12s'}}>
                    <span style={{fontSize:'1.2rem',lineHeight:1}}>{ministerEmojis[k]}</span>
                    <span style={{fontSize:'0.52rem',color:isSelected?'rgba(200,164,74,0.9)':'rgba(170,185,215,0.55)',
                      letterSpacing:'0.03em',textAlign:'center',maxWidth:'4rem',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:1.3}}>
                      {(ministerLabels[k]?.split(' (')[0] || k).replace(/^(Le |La |L')/, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Essence" hint={trC.essence_hint}>
            <TextArea value={getVal(`ministers.${selectedMin}.essence`, minFallback('essence'))}
              onChange={v => updateAgent(`ministers.${selectedMin}.essence`, v)}
            />
          </Field>

          <Field label="Communication" hint={trC.comm_hint}>
            <TextArea value={getVal(`ministers.${selectedMin}.comm`, minFallback('comm'))}
              onChange={v => updateAgent(`ministers.${selectedMin}.comm`, v)}
            />
          </Field>

          <Field label={trC.annot_label} hint={trC.annot_hint}>
            <TextArea value={getVal(`ministers.${selectedMin}.annotation`, minFallback('annotation'))}
              onChange={v => updateAgent(`ministers.${selectedMin}.annotation`, v)}
            />
          </Field>
        </div>
      )}

      {tab === 'ministeres' && (
        <div>
          {/* Grille tuiles ministères */}
          <div style={{marginBottom:'1.2rem'}}>
            <div style={{fontSize:'0.75rem',color:'rgba(200,164,74,0.7)',letterSpacing:'0.10em',marginBottom:'0.6rem',textTransform:'uppercase'}}>
              {isEn ? 'Select a ministry' : 'Sélectionner un ministère'}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
              {MINISTRY_KEYS.map(k => {
                const isSelected = selectedMin2 === k;
                const fullLabel = ministryLabels[k] || k;
                const name = fullLabel.split(' ').slice(1).join(' ') || k;
                return (
                  <button key={k}
                    title={TOOLTIP_MINISTERES[k] || fullLabel}
                    onClick={() => setSelectedMin2(k)}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.2rem',
                      padding:'0.6rem 0.7rem',borderRadius:'6px',cursor:'pointer',minWidth:'3.5rem',
                      background: isSelected ? 'rgba(200,164,74,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(200,164,74,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      transition:'all 0.12s'}}>
                    <span style={{fontSize:'1.2rem',lineHeight:1}}>{ministryEmojis[k]}</span>
                    <span style={{fontSize:'0.52rem',color:isSelected?'rgba(200,164,74,0.9)':'rgba(170,185,215,0.55)',
                      letterSpacing:'0.03em',textAlign:'center',maxWidth:'4rem',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:1.3}}>
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label={trC.missionLabel} hint={trC.missionHint}>
            <TextArea value={getVal(`ministries.${selectedMin2}.mission`, ministryFallback('mission'))}
              onChange={v => updateAgent(`ministries.${selectedMin2}.mission`, v)}
            />
          </Field>

          {/* Prompts spécifiques des 2 ministres dans ce ministère */}
          {(ministryData.ministers || []).map(mKey => (
            <Field key={mKey} label={`${trC.rolePrefix} — ${(ministerLabels[mKey]?.split(' (')[0] || mKey).replace(/^(Le |La |L')/, '')}`}
              hint={trC.roleHint}>
              <TextArea value={getVal(`ministries.${selectedMin2}.${mKey}`,
                  ministryData.ministerPrompts?.[mKey] || '')}
                onChange={v => updateAgent(`ministries.${selectedMin2}.${mKey}`, v)}
              />
            </Field>
          ))}
        </div>
      )}

      {tab === 'presidence' && (() => {
        const [openP, setOpenP] = [presOpenAcc, setPresOpenAcc];
        const toggleP = (key) => setOpenP(p => p === key ? null : key);
        const HDR_P = (key, agent) => {
          const symbol = agent?.symbol || '';
          const name   = agent?.name   || key;
          const sub    = agent?.subtitle || '';
          return (
            <button className="aria-accordion__hdr" onClick={() => toggleP(key)}>
              <span style={{ fontSize:'1.1rem', lineHeight:1, opacity:0.80 }}>{symbol}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem', letterSpacing:'0.12em',
                color: openP===key ? 'rgba(200,164,74,0.92)' : 'rgba(200,215,240,0.70)', flex:1 }}>{name}</span>
              {sub && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem',
                color:'rgba(140,160,200,0.35)', letterSpacing:'0.08em' }}>{sub}</span>}
              <span className="aria-accordion__arrow">{openP===key?'▾':'▸'}</span>
            </button>
          );
        };
        return (
          <div>
            <div className={`aria-accordion${openP==='phare' ? ' open' : ''}`}>
              {HDR_P('phare', liveAgents.presidency?.phare)}
              {openP==='phare' && (
                <div className="aria-accordion__body">
                  <Field label={isEn?"Role":"Rôle"} hint={liveAgents.presidency?.phare?.subtitle || ''}>
                    <TextArea value={getVal('presidency.phare.role', liveAgents.presidency?.phare?.role_long || PRESIDENCY?.phare?.role_long || '')}
                      onChange={v => updateAgent('presidency.phare.role', v)}
                    />
                  </Field>
                  <Field label="Essence">
                    <TextArea value={getVal('presidency.phare.essence', liveAgents.presidency?.phare?.essence || PRESIDENCY?.phare?.essence || '')}
                      onChange={v => updateAgent('presidency.phare.essence', v)}
                    />
                  </Field>
                </div>
              )}
            </div>

            <div className={`aria-accordion${openP==='boussole' ? ' open' : ''}`}>
              {HDR_P('boussole', liveAgents.presidency?.boussole)}
              {openP==='boussole' && (
                <div className="aria-accordion__body">
                  <Field label={isEn?"Role":"Rôle"} hint={liveAgents.presidency?.boussole?.subtitle || ''}>
                    <TextArea value={getVal('presidency.boussole.role', liveAgents.presidency?.boussole?.role_long || PRESIDENCY?.boussole?.role_long || '')}
                      onChange={v => updateAgent('presidency.boussole.role', v)}
                    />
                  </Field>
                  <Field label="Essence">
                    <TextArea value={getVal('presidency.boussole.essence', liveAgents.presidency?.boussole?.essence || PRESIDENCY?.boussole?.essence || '')}
                      onChange={v => updateAgent('presidency.boussole.essence', v)}
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {tab === 'gouvernance' && (
        <SectionGouvernanceDefaut opts={govOpts} setOpts={(v) => { setGovOpts(v); setSaved(false); }} />
      )}

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>{isEn?"Save":"Sauvegarder"}</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : GOUVERNANCE PAR DÉFAUT (dans SectionConseil)
// ─────────────────────────────────────────────────────────────────────────────

const ALL_MINISTRY_IDS = ['justice','economie','defense','sante','education','ecologie','chance'];
// MINISTRY_META dynamique depuis getAgents()
function getMinistryMeta() {
  const agents = getAgents();
  const mList = Array.isArray(agents.ministries) ? agents.ministries : [];
  const result = {};
  mList.forEach(m => {
    result[m.id] = { emoji: m.emoji || '', label: m.name || m.id };
  });
  return result;
}
function getPresidencyOpts(isEn) {
  return isEn ? [
    { value: 'duale',      label: 'Dual — Phare + Boussole (ARIA default)' },
    { value: 'solaire',    label: 'Solar — The Phare alone'                },
    { value: 'lunaire',    label: 'Lunar — The Boussole alone'             },
    { value: 'collegiale', label: 'Collegial — Vote of 12 ministers'       },
  ] : [
    { value: 'duale',      label: 'Duale — Phare + Boussole (défaut ARIA)' },
    { value: 'solaire',    label: 'Solaire — Le Phare seul'                },
    { value: 'lunaire',    label: 'Lunaire — La Boussole seule'            },
    { value: 'collegiale', label: 'Collégiale — Vote des 12 ministres'     },
  ];
}

const DEFAULT_GOVERNANCE = {
  presidency: 'duale',
  ministries: ['justice','economie','defense','sante','education','ecologie'],
};

function SectionGouvernanceDefaut({ opts, setOpts }) {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const gov = opts.defaultGovernance || DEFAULT_GOVERNANCE;
  const [openAcc, setOpenAcc] = useState(null);

  const toggleAcc = (key) => setOpenAcc(p => p === key ? null : key);

  const setGov = (key, val) => {
    setOpts({ ...opts, defaultGovernance: { ...(opts.defaultGovernance || DEFAULT_GOVERNANCE), [key]: val } });
  };

  const setCtx = (val) => {
    setOpts({ ...opts, gameplay: { ...(opts.gameplay || {}), context_mode: val } });
  };

  const toggleMinistry = (id) => {
    const current = new Set(gov.ministries || []);
    if (current.has(id)) { if (current.size <= 2) return; current.delete(id); }
    else current.add(id);
    setGov('ministries', [...current]);
  };

  const HDR = (key, label, badge) => (
    <button className="aria-accordion__hdr" onClick={() => toggleAcc(key)}>
      <span className="aria-accordion__arrow">{openAcc===key ? '▾' : '▸'}</span>
      <span className="aria-accordion__label">{label}</span>
      {badge && <span className="aria-accordion__badge">{badge}</span>}
    </button>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>

      {/* ▸ PRÉSIDENCE */}
      <div className={`aria-accordion${openAcc==='pres' ? ' open' : ''}`}>
        {HDR('pres', isEn ? 'DEFAULT PRESIDENCY' : 'PRÉSIDENCE PAR DÉFAUT')}
        {openAcc==='pres' && (
          <div className="aria-accordion__body">
            <div>
              <div style={{ fontSize:'0.75rem', color:'rgba(200,164,74,0.7)', letterSpacing:'0.10em', marginBottom:'0.6rem', textTransform:'uppercase' }}>
                {isEn ? 'Presidency type' : 'Type de présidence'}
              </div>
              <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                {/* Grille tuiles */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                  {[
                    { value:'solaire',    icon:'☉',  iconSize:'1.6rem', ls:'normal',   label: isEn?'Phare':'Phare',       tooltip: isEn?'The Phare — The Will':'Le Phare — La Volonté' },
                    { value:'lunaire',    icon:'☽',  iconSize:'1.6rem', ls:'normal',   label: isEn?'Boussole':'Boussole', tooltip: isEn?'The Boussole — The Soul':'La Boussole — L\'Âme' },
                    { value:'duale',      icon:'☉☽', iconSize:'1.2rem', ls:'-0.05em',  label: isEn?'Dual':'Duale',        tooltip: isEn?'Phare + Boussole — ARIA mode':'Phare + Boussole — Mode ARIA' },
                    { value:'collegiale', icon:null, iconSize:'1.6rem', ls:'normal',   label: isEn?'Collegial':'Collégiale', tooltip: isEn?'Constitutional Synthesis':'Synthèse Constitutionnelle' },
                  ].map(({ value, icon, iconSize, ls, label, tooltip }) => {
                    const isSel = (gov.presidency || 'duale') === value;
                    return (
                      <button key={value} title={tooltip} onClick={() => setGov('presidency', value)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem',
                          padding:'0.6rem 0.7rem', borderRadius:'6px', cursor:'pointer', minWidth:'3.5rem',
                          background: isSel ? 'rgba(200,164,74,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSel ? 'rgba(200,164,74,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          transition:'all 0.12s' }}>
                        <span style={{ height:'2rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {icon
                            ? <span style={{ fontSize:iconSize, lineHeight:1, letterSpacing:ls }}>{icon}</span>
                            : <span className="mdi mdi-hexagram-outline" style={{ fontSize:iconSize, lineHeight:1, color: isSel?'rgba(200,164,74,0.9)':'rgba(170,185,215,0.55)' }} />
                          }
                        </span>
                        <span style={{ fontSize:'0.52rem', color: isSel?'rgba(200,164,74,0.9)':'rgba(170,185,215,0.55)',
                          letterSpacing:'0.03em', textAlign:'center', maxWidth:'4rem',
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* Description sélection */}
                {(() => {
                  const sel = gov.presidency || 'duale';
                  const desc = {
                    solaire:    isEn ? '☉ The Phare\npresides alone\nThe Will'                           : '☉ Le Phare\npréside seul\nLa Volonté',
                    lunaire:    isEn ? '☽ The Boussole\npresides alone\nThe Soul'                        : '☽ La Boussole\npréside seule\nL\'Âme',
                    duale:      isEn ? '☉☽ The Phare and the Boussole\ndeliberate equally\nARIA mode'    : '☉☽ Le Phare et La Boussole\ndélibèrent à égalité\nMode ARIA',
                    collegiale: isEn ? '✡ Vote of 12 ministers\nConstitutional Synthesis'                : '✡ Vote des 12 ministres\nSynthèse Constitutionnelle',
                  }[sel] || '';
                  return (
                    <div style={{ borderLeft:'2px solid rgba(200,164,74,0.2)', paddingLeft:'1rem',
                      fontStyle:'italic', color:'rgba(200,164,74,0.7)', fontSize:'0.52rem',
                      lineHeight:1.7, whiteSpace:'pre-line', alignSelf:'center' }}>
                      {desc}
                    </div>
                  );
                })()}
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem', color:'rgba(140,160,200,0.35)', marginTop:'0.5rem', letterSpacing:'0.06em' }}>
                {isEn ? 'Applied to all new countries unless overridden' : 'Appliqué à tous les nouveaux pays sauf override'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ▸ MINISTÈRES */}
      <div className={`aria-accordion${openAcc==='mins' ? ' open' : ''}`}>
        {HDR('mins', isEn ? 'ACTIVE MINISTRIES BY DEFAULT' : 'MINISTÈRES ACTIFS PAR DÉFAUT',
          `${(gov.ministries||[]).length}/${ALL_MINISTRY_IDS.length}`)}
        {openAcc==='mins' && (
          <div className="aria-accordion__body">
            {ALL_MINISTRY_IDS.map(id => {
              const meta   = getMinistryMeta()[id] || { emoji:'', label:id };
              const active = (gov.ministries||[]).includes(id);
              const isMin  = (gov.ministries||[]).length <= 2 && active;
              return (
                <label key={id} style={{ display:'flex', alignItems:'center', gap:'0.6rem',
                  cursor: isMin ? 'not-allowed' : 'pointer', opacity: isMin ? 0.5 : 1,
                  padding:'0.3rem 0.5rem', borderRadius:'2px',
                  background: active ? 'rgba(200,164,74,0.07)' : 'transparent',
                  border: active ? '1px solid rgba(200,164,74,0.20)' : '1px solid transparent' }}>
                  <input type="checkbox" checked={active} disabled={isMin} onChange={() => toggleMinistry(id)}
                    style={{ accentColor:'#C8A44A', width:'13px', height:'13px' }} />
                  <span style={{ fontSize:'0.9rem' }}>{meta.emoji}</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.52rem',
                    color:'rgba(200,215,240,0.80)' }}>{meta.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ▸ GESTION DE CRISE */}
      <div className={`aria-accordion${openAcc==='crise' ? ' open' : ''}`}>
        {HDR('crise', isEn ? 'CRISIS MANAGEMENT' : 'GESTION DE CRISE')}
        {openAcc==='crise' && (
          <div className="aria-accordion__body">
            <Field label={isEn ? "Ministry of Chance & Crises" : "Ministère de la Chance & Crises"}
              hint={isEn ? "Activates the 7th ministry for emergency management" : "Active le 7e ministère pour la gestion des urgences"}>
              <Toggle value={gov.crisis_ministry !== false} onChange={v => setGov('crisis_ministry', v)}
                label={gov.crisis_ministry !== false ? (isEn ? 'Enabled' : 'Activé') : (isEn ? 'Disabled' : 'Désactivé')} />
            </Field>
          </div>
        )}
      </div>

      {/* ▸ CONTEXTE PAYS */}
      <div className={`aria-accordion${openAcc==='ctx' ? ' open' : ''}`}>
        {HDR('ctx', isEn ? 'COUNTRY CONTEXT IN DELIBERATIONS' : 'CONTEXTE PAYS DANS LES DÉLIBÉRATIONS')}
        {openAcc==='ctx' && (
          <div className="aria-accordion__body">
            <div style={{ fontSize:'0.44rem', color:'rgba(140,160,200,0.45)', lineHeight:1.5 }}>
              {isEn ? "Controls what country info is injected into each deliberation prompt. Overridable per country in the Constitution."
                     : "Contrôle quelles infos sur le pays sont injectées dans chaque prompt. Surchargeable par pays dans la Constitution."}
            </div>
            {[
              ['auto',       '🤖 Auto',                isEn ? 'Stats always + description if available (default)' : 'Stats toujours + description si disponible (défaut)'],
              ['rich',       isEn ? '📖 Enriched' : '📖 Enrichi', isEn ? 'Full context — prompts AI to invent a coherent history' : 'Contexte complet même pour fictifs — incite l\'IA à inventer un historique cohérent'],
              ['stats_only', isEn ? '📊 Stats only' : '📊 Stats seules', isEn ? 'Numbers only — more neutral, fewer hallucinations' : 'Uniquement les chiffres — délibération plus neutre'],
              ['off',        isEn ? '🚫 Disabled' : '🚫 Désactivé', isEn ? 'No context injected — blind universal deliberation' : 'Aucun contexte injecté — délibération aveugle'],
            ].map(([val, lbl, hint]) => (
              <label key={val} style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem',
                cursor:'pointer', padding:'0.35rem 0.5rem', borderRadius:'2px',
                background: (opts.gameplay?.context_mode || 'auto') === val ? 'rgba(200,164,74,0.08)' : 'transparent',
                border: `1px solid ${(opts.gameplay?.context_mode || 'auto') === val ? 'rgba(200,164,74,0.30)' : 'transparent'}` }}>
                <input type="radio" name="context_mode_gov" value={val}
                  checked={(opts.gameplay?.context_mode || 'auto') === val}
                  onChange={() => setCtx(val)}
                  style={{ marginTop:'0.1rem', accentColor:'#C8A44A' }} />
                <div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.52rem',
                    color:'rgba(220,228,240,0.85)' }}>{lbl}</div>
                  <div style={{ fontSize:'0.46rem', color:'rgba(140,160,200,0.50)',
                    marginTop:'0.1rem', lineHeight:1.45 }}>{hint}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 4 — SIMULATION
// ─────────────────────────────────────────────────────────────────────────────

function SectionSimulation() {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const [sim, setSim]   = useState(() => getSimOverrides());
  const [opts, setOpts] = useState(() => getOptions());
  const [saved, setSaved] = useState(false);
  // Terrains localisés (réactif à la langue)
  const dynTerrains = getStats().terrains;

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
  const [openAcc, setOpenAcc] = useState(null);
  const toggleAcc = (key) => setOpenAcc(p => p === key ? null : key);
  const HDR = (key, label, badge) => (
    <button className="aria-accordion__hdr" onClick={() => toggleAcc(key)}>
      <span className="aria-accordion__arrow">{openAcc===key?'▾':'▸'}</span>
      <span className="aria-accordion__label">{label}</span>
      {badge && <span className="aria-accordion__badge">{badge}</span>}
    </button>
  );

  return (
    <div className="settings-section-body">
      <SectionTitle icon="🎲" label={isEn?"SIMULATION":"SIMULATION"} sub={isEn?"Regimes, critical thresholds, cycle speed, resources":"Régimes, seuils critiques, vitesse des cycles, ressources"} />

      {/* ▸ SEUILS CRITIQUES */}
      <div className={`aria-accordion${openAcc==='seuils' ? ' open' : ''}`}>
        {HDR('seuils', isEn?'CRITICAL THRESHOLDS':'SEUILS CRITIQUES')}
        {openAcc==='seuils' && (
          <div className="aria-accordion__body">
            <Field label={isEn?"Revolt threshold (satisfaction %)":"Seuil de révolte (satisfaction %)"}
              hint={isEn?"Below this threshold, a revolt is triggered":"En dessous de ce seuil, une révolte est déclenchée"}>
              <NumberInput value={getSeuil('seuil_revolte')}
                onChange={v => updateSim('seuils.seuil_revolte', v)} min={5} max={40} />
            </Field>
            <Field label={isEn?"Demographic explosion threshold (×%)":"Seuil explosion démographique (×%)"}
              hint={isEn?"If population × factor / 100 in a cycle, crisis triggered":"Si la population × ce facteur / 100 en un cycle, crise déclenchée"}>
              <NumberInput value={getSeuil('seuil_crise_demo')}
                onChange={v => updateSim('seuils.seuil_crise_demo', v)} min={110} max={300} step={10} />
            </Field>
            <Field label={isEn?"Max random noise (satisfaction ±)":"Bruit aléatoire max (satisfaction ±)"}
              hint={isEn?"Random amplitude in each cycle":"Amplitude du hasard dans chaque cycle"}>
              <NumberInput value={getSeuil('bruit_max')}
                onChange={v => updateSim('seuils.bruit_max', v)} min={0} max={10} />
            </Field>
            <Field label={isEn?"AI narrative events":"Événements narratifs IA"}
              hint={isEn?"AI narrates each critical threshold breach":"L'IA génère un récit à chaque événement critique"}>
              <Toggle value={opts.gameplay.events_ia}
                onChange={v => updateOpts('events_ia', v)}
                label={opts.gameplay.events_ia ? (isEn?'Enabled':'Activés') : (isEn?'Disabled':'Désactivés')} />
            </Field>
          </div>
        )}
      </div>

      {/* ▸ COEFFICIENTS DES RÉGIMES */}
      <div className={`aria-accordion${openAcc==='regimes' ? ' open' : ''}`}>
        {HDR('regimes', isEn?'REGIME COEFFICIENTS':'COEFFICIENTS DES RÉGIMES', `${REGIME_LABEL_KEYS.length}`)}
        {openAcc==='regimes' && (
        <div className="aria-accordion__body">
        {REGIME_LABEL_KEYS.map(rk => {
          const coeff_sat  = getReg(rk, 'coeff_satisfaction');
          const coeff_cro  = getReg(rk, 'coeff_croissance');
          const natalite   = getReg(rk, 'taux_natalite');
          const mortalite  = getReg(rk, 'taux_mortalite');
          const fmt = (v) => Number(v).toFixed(2);
          const col = (v) => v > 1 ? 'rgba(100,200,120,0.85)' : v < 1 ? 'rgba(220,100,100,0.85)' : 'rgba(200,164,74,0.70)';
          return (
            <div key={rk} style={{
              marginBottom: '0.9rem',
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(200,164,74,0.10)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              {/* Header régime */}
              <div style={{
                padding: '0.40rem 0.75rem',
                background: 'rgba(200,164,74,0.05)',
                borderBottom: '1px solid rgba(200,164,74,0.10)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.50rem', letterSpacing: '0.14em',
                color: 'rgba(200,164,74,0.80)',
              }}>
                {getRegimeLabel(rk, lang)}
              </div>
              {/* Séparateur */}
              <div style={{ padding: '0.55rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {[
                  { key: 'coeff_satisfaction', label: isEn?'SATISFACTION':'SATISFACTION', val: coeff_sat,
                    hint: isEn?'Satisfaction drift per cycle':'Dérive de satisfaction par cycle' },
                  { key: 'coeff_croissance',   label: isEn?'GROWTH':'CROISSANCE',   val: coeff_cro,
                    hint: isEn?'Demographic and economic yield':'Rendement démographique et économique' },
                  { key: 'taux_natalite',      label: isEn?'BIRTH RATE':'NATALITÉ',     val: natalite,
                    hint: isEn?'Base birth rate (‰)':'Taux de natalité de base (‰)' },
                  { key: 'taux_mortalite',     label: isEn?'DEATH RATE':'MORTALITÉ',    val: mortalite,
                    hint: isEn?'Base death rate (‰)':'Taux de mortalité de base (‰)' },
                ].map(({ key, label, val, hint }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.44rem', letterSpacing: '0.10em',
                      color: 'rgba(140,160,200,0.55)', width: '90px', flexShrink: 0,
                    }}>◈ {label}</span>
                    <div style={{
                      flex: 1, height: '1px',
                      background: 'rgba(200,164,74,0.12)',
                    }} />
                    <input
                      type="number" step="0.01"
                      value={fmt(val)}
                      onChange={e => updateSim(`regimes.${rk}.${key}`, parseFloat(e.target.value))}
                      style={{
                        width: '58px', background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(200,164,74,0.18)', borderRadius: '2px',
                        color: col(val),
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.52rem', fontWeight: 600,
                        padding: '0.18rem 0.35rem', textAlign: 'right',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        </div>
        )}
      </div>

      {/* ▸ RESSOURCES PAR TERRAIN */}
      <div className={`aria-accordion${openAcc==='terrains' ? ' open' : ''}`}>
        {HDR('terrains', isEn?'RESOURCES BY TERRAIN':'RESSOURCES PAR TERRAIN',
          `${Object.keys(dynTerrains || TERRAINS || {}).length}`)}
        {openAcc==='terrains' && (
          <div className="aria-accordion__body">
            {Object.entries(dynTerrains || TERRAINS || {}).map(([tk, tv]) => (
              <div key={tk} className="settings-terrain-block">
                <div className="settings-terrain-name">{getTerrainLabel(tk, lang)}</div>
                <Field label={isEn?"Population modifier":"Modificateur population"}>
                  <NumberInput step={0.05}
                    value={getTerrain(tk, 'modificateur_pop')}
                    onChange={v => updateSim(`terrains.${tk}.modificateur_pop`, v)}
                    min={0.5} max={2.0} />
                </Field>
                <Field label={isEn?"Economy modifier":"Modificateur économie"}>
                  <NumberInput step={0.05}
                    value={getTerrain(tk, 'modificateur_eco')}
                    onChange={v => updateSim(`terrains.${tk}.modificateur_eco`, v)}
                    min={0.5} max={2.0} />
                </Field>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>{isEn?"Save":"Sauvegarder"}</button>
        <SaveBadge saved={saved} />
        <div style={{ flex:1 }} />
        <span style={{ fontFamily:"'JetBrains Mono',monospace", display:'flex', flexDirection:'column', alignItems:'center', gap:'0.05rem' }}>
          <span style={{ fontSize:'0.52rem', letterSpacing:'0.10em', color:'rgba(200,164,74,0.68)', textTransform:'uppercase' }}>DÉMO</span>
          <span style={{ fontSize:'0.46rem', color:'rgba(140,160,200,0.65)', fontWeight:'normal', letterSpacing:'0.04em' }}>
            {isEn ? "autonomous mode" : "mode autonome d'ARIA"}
          </span>
        </span>
        <Toggle value={opts.gameplay.cycles_auto}
          onChange={v => updateOpts('cycles_auto', v)} />
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem',
          color:'rgba(160,180,220,0.55)', letterSpacing:'0.06em',
          minWidth:'5rem', display:'inline-block' }}>
          {opts.gameplay.cycles_auto ? (isEn?'Enabled':'Activé') : (isEn?'Disabled':'Désactivé')}
        </span>
      </div>
      {opts.gameplay.cycles_auto && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.5rem', padding:'0.3rem 0.65rem 0.5rem' }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem',
            color:'rgba(140,160,200,0.65)', letterSpacing:'0.06em' }}>
            {isEn ? "Interval between cycles (s)" : "Intervalle entre les cycles (s)"}
          </span>
          <NumberInput value={opts.gameplay.cycles_interval}
            onChange={v => updateOpts('cycles_interval', v)} min={5} max={300} step={5}
            style={{ width:`${String(opts.gameplay.cycles_interval ?? 30).length + 5}ch`, padding:'0.2rem 0.3rem' }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 5 — À PROPOS
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
//  MANIFESTE ARIA — Légitimité mondiale Think-Tank
//  Données sociologiques argumentées par pays + estimations régionales
// ─────────────────────────────────────────────────────────────────────────────

export const ARIA_MANIFESTE_PAYS = [
  { flag:"🇫🇷", nom:"France",          irl:38, regime:"République",     logic:"Scepticisme élevé dû à la culture de la contestation et à la sacralisation du politique humain. Passé révolutionnaire. Présent : crise de confiance institutionnelle profonde." },
  { flag:"🇩🇪", nom:"Allemagne",        irl:52, regime:"Fédérale",       logic:"Pragmatisme industriel et besoin d'ordre, mais traumatisme historique face à la surveillance de masse qui freine l'adhésion totale à une IA centrale." },
  { flag:"🇺🇸", nom:"États-Unis",       irl:45, regime:"Libérale",       logic:"Fracture nette : adhésion des pôles technologiques (Silicon Valley) mais rejet viscéral des zones rurales par peur d'un contrôle fédéral algorithmique." },
  { flag:"🇨🇳", nom:"Chine",            irl:82, regime:"Technocratie",   logic:"Acceptation naturelle d'une gouvernance technocratique centralisée, déjà intégrée dans le contrat social de stabilité contre performances." },
  { flag:"🇯🇵", nom:"Japon",            irl:75, regime:"Monarchie",      logic:"Perception de l'IA comme une solution honorable et stable face au déclin démographique et à la fatigue des élites politiques humaines." },
  { flag:"🇮🇳", nom:"Inde",             irl:60, regime:"Fédérale",       logic:"Espoir d'une justice impartiale pour briser la corruption bureaucratique, balancé par d'immenses défis de diversité culturelle." },
  { flag:"🇷🇺", nom:"Russie",           irl:30, regime:"Autoritaire",    logic:"Attachement culturel au leadership humain fort. L'IA est perçue comme un outil suspect ou incapable de comprendre l'âme nationale." },
  { flag:"🇧🇷", nom:"Brésil",           irl:48, regime:"Fédérale",       logic:"Besoin d'un arbitre neutre face à la corruption, mais la chaleur humaine et le charisme restent des piliers du consentement politique." },
  { flag:"🇳🇬", nom:"Nigeria",          irl:40, regime:"Fédérale",       logic:"Jeunesse connectée prête pour le futur, mais forte résistance des structures traditionnelles face à un contrôle algorithmique transparent." },
  { flag:"🇸🇦", nom:"Arabie Saoudite",  irl:65, regime:"Monarchie abs.", logic:"Adhésion Top-Down. Les élites voient ARIA comme le moteur de la Vision 2030, population habituée à une gouvernance performative." },
];

export const ARIA_MANIFESTE_GLOBAL = 47; // moyenne pondérée par population

export function IrlBar({ taux }) {
  const col = taux >= 60 ? 'rgba(140,100,220,0.80)'
            : taux >= 45 ? 'rgba(100,130,210,0.70)'
            : taux >= 30 ? 'rgba(90,110,170,0.55)'
            :              'rgba(80,90,130,0.45)';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
      <div style={{ flex:1, height:4, background:'rgba(14,20,36,0.9)', borderRadius:'3px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${taux}%`,
          background:`linear-gradient(90deg, rgba(60,60,140,0.5), ${col})`,
          borderRadius:'3px' }} />
      </div>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.56rem', fontWeight:700,
        color: col, minWidth:'34px', textAlign:'right' }}>{taux}%</span>
    </div>
  );
}

export function ARIAManifeste() {
  const [expanded, setExpanded] = useState(null);

  const sorted = [...ARIA_MANIFESTE_PAYS].sort((a, b) => b.irl - a.irl);

  return (
    <div className="settings-group">
      <div className="settings-group-title">MANIFESTE — LÉGITIMITÉ MONDIALE D'ARIA</div>

      {/* Score mondial */}
      <div style={{ padding:'1rem', background:'rgba(140,100,220,0.04)',
        border:'1px solid rgba(140,100,220,0.15)', borderRadius:'2px', marginBottom:'1rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'0.5rem' }}>
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'0.52rem', letterSpacing:'0.18em',
              color:'rgba(140,100,220,0.55)' }}>TAUX D'ACCEPTATION MONDIAL ESTIMÉ</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
              color:'rgba(80,100,140,0.45)', marginTop:'0.2rem' }}>
              Si ARIA était proposé comme modèle de gouvernance aujourd'hui
            </div>
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'2rem', fontWeight:700,
            color:'rgba(140,100,220,0.85)' }}>{ARIA_MANIFESTE_GLOBAL}%</div>
        </div>
        <IrlBar taux={ARIA_MANIFESTE_GLOBAL} />
      </div>

      {/* Tableau pays — cliquable pour révéler l'analyse */}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
        {sorted.map(c => (
          <div key={c.nom}>
            <div style={{ cursor:'pointer', padding:'0.55rem 0.7rem',
              background: expanded === c.nom ? 'rgba(140,100,220,0.06)' : 'rgba(255,255,255,0.015)',
              border:`1px solid ${expanded === c.nom ? 'rgba(140,100,220,0.25)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius:'2px', transition:'all 0.15s' }}
              onClick={() => setExpanded(expanded === c.nom ? null : c.nom)}>

              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.3rem' }}>
                <span style={{ fontSize:'1rem' }}>{c.flag}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.50rem',
                  color:'rgba(180,200,230,0.75)', flex:1 }}>{c.nom}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
                  color:'rgba(100,120,160,0.45)', marginRight:'0.5rem' }}>{c.regime}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem',
                  color:'rgba(100,120,160,0.35)' }}>{expanded === c.nom ? '▲' : '▼'}</span>
              </div>
              <IrlBar taux={c.irl} />

              {expanded === c.nom && (
                <div style={{ marginTop:'0.55rem', paddingTop:'0.55rem',
                  borderTop:'1px solid rgba(140,100,220,0.12)',
                  fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem',
                  color:'rgba(140,160,200,0.60)', lineHeight:1.7, fontStyle:'italic' }}>
                  {c.logic}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:'0.8rem', padding:'0.55rem 0.8rem',
        background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
        borderRadius:'2px', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem',
        color:'rgba(80,100,140,0.45)', lineHeight:1.6 }}>
        ⓘ Estimations synthétiques — Indice de démocratie EIU · Edelman Trust Barometer · Adoption technologique · Précédents de gouvernance participative. Ces données constituent l'ancre IRL immuable dans la simulation.
      </div>
    </div>
  );
}


function SectionAPropos() {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  return (
    <div className="settings-section-body">
      <SectionTitle icon="✦" label={isEn?"ABOUT":"À PROPOS"} sub={isEn?"Version · Documentation · Credits":"Version · Documentation · Crédits"} />

      <div className="settings-apropos-block">
        <div className="settings-version-badge">
          <span className="settings-version-number">v1.0</span>
          <span className="settings-version-name">"Phare"</span>
        </div>
        <div className="settings-apropos-desc">
          {isEn?"Institutional Reasoning Architecture by AI.":"Architecture de Raisonnement Institutionnel par l'IA."}<br />
          {isEn?"An augmented deliberative governance system.":"Un système de gouvernance délibérative augmentée."}<br />
          <em>{lang==='en'?'Deliberate. Annotate. Synthesize. Decide.':'Délibérer. Annoter. Synthétiser. Décider.'}</em>
        </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">{isEn?"FOUNDING PRINCIPLE":"PRINCIPE FONDATEUR"}</div>
            <blockquote className="settings-quote">
              {isEn
                ? "The real question is not whether AI will enter governance — it already is, in an opaque and unregulated way. The question is whether we will choose to do so deliberately, with democratic safeguards, or by default, without them."
                : `« La vraie question n’est pas de savoir si l’IA entrera dans la gouvernance — elle y entre déjà, de manière opaque et non régulée. La question est de savoir si nous choisirons de le faire délibérément, avec des garde-fous démocratiques, ou par défaut, sans eux. »`
              }
            </blockquote>
        </div>

      <div className="settings-group">
        <div className="settings-group-title">{isEn?"DOCUMENTATION":"DOCUMENTATION"}</div>
        <div className="settings-links">
          <a className="settings-link" href="../doc/aria.pdf" target="_blank" rel="noopener">
            {isEn?"📄 ARIA Vision Document (PDF)":"📄 Document de vision ARIA (PDF)"}
          </a>
          <a className="settings-link" href="#" target="_blank" rel="noopener">
            {isEn?"💻 GitHub source code":"💻 Code source GitHub"}
          </a>
          <a className="settings-link" href="#" target="_blank" rel="noopener">
            {isEn?"🎮 Interactive demo":"🎮 Démonstration interactive"}
          </a>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">{isEn?"TECHNICAL ARCHITECTURE":"ARCHITECTURE TECHNIQUE"}</div>
        <div className="settings-tech-stack">
          <div className="settings-tech-row"><span>{isEn?"Frontend":"Frontend"}</span><span>React 18 · Vite · CSS custom</span></div>
          <div className="settings-tech-row"><span>{isEn?"Map":"Carte"}</span><span>SVG pur · PRNG reproductible</span></div>
          <div className="settings-tech-row"><span>{isEn?"AI Thinking":"IA Pensée"}</span><span>Claude · Gemini · Grok · OpenAI (configurable)</span></div>
          <div className="settings-tech-row"><span>{isEn?"AI Synthesis":"IA Synthèse"}</span><span>Multi-providers — sélection par rôle</span></div>
          <div className="settings-tech-row"><span>{isEn?"Persistence":"Persistance"}</span><span>localStorage</span></div>
          <div className="settings-tech-row"><span>{isEn?"Data":"Données"}</span><span>base_agents.json · base_stats.json · ariaData.js</span></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL — Settings
// ─────────────────────────────────────────────────────────────────────────────

export default function Settings({ onClose }) {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const SECTIONS = getSections(isEn);
  const [activeSection, setActiveSection] = useState('conseil');

  const hardReset = useCallback(() => {
    [
      'aria_options','aria_prompts','aria_agents','aria_sim',
      'aria_world','aria_countries','aria_api_keys',
      'aria_session_active','aria_session_world',
      'aria_session_countries','aria_session_alliances',
      'aria_api_keys_status',
      'aria_agents_override','aria_chronolog_cycles',
      'aria_lang','aria_preferred_models',
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
            <div className="settings-header-title">{isEn?"ARIA — CONFIGURATION":"ARIA — CONFIGURATION"}</div>
            <div className="settings-header-sub">{isEn?"Institutional Reasoning Architecture":"Architecture de Raisonnement Institutionnel"}</div>
          </div>
        </div>
        <button className="settings-close-btn" onClick={onClose} title={isEn?"Back to Dashboard":"Retour au Dashboard"}>
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
          <SectionErrorBoundary key={activeSection}>
            {activeSection === 'systeme'      && <SectionSysteme onHardReset={hardReset} />}
            {activeSection === 'constitution' && <SectionConstitution />}
            {activeSection === 'conseil'      && <SectionConseil />}
            {activeSection === 'simulation'   && <SectionSimulation />}
            {activeSection === 'apropos'      && <SectionAPropos />}
          </SectionErrorBoundary>
        </main>
      </div>
    </div>
  );
}
