// ═══════════════════════════════════════════════════════════════════════════
//  Settings.jsx — Page de configuration complète ARIA
//  6 sections : SYSTÈME · CONSTITUTION · CONSEIL · SIMULATION · INTERFACE · À PROPOS
//  Usage : <Settings onClose={() => setPage('dashboard')} />
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, Component } from 'react';
import {
  DEFAULT_OPTIONS, getOptions, saveOptions,
  MINISTERS, MINISTRIES as MINISTRIES_RAW, PRESIDENCY,
  REGIMES, TERRAINS, CYCLES_CFG, RESOURCE_KEYS,
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
  const [saved, setSaved] = useState(false);
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
    s==='ok'      ? '✅ Connecté'  :
    s==='error'   ? '❌ Invalide'  :
    s==='testing' ? '⏳ Test...'   :
    s==='missing' ? '⚠ Vide'      : '— Non testé';

  // ── Config providers avec modèles disponibles ─────────────────────────────
  const PROVIDERS = [
    {
      id: 'claude', label: 'Anthropic — Claude', placeholder: 'sk-ant-...',
      hint: 'Ministres · Phare · Boussole',
      models: [
        { value:'claude-opus-4-6',          label:'claude-opus-4-6       — Puissant' },
        { value:'claude-sonnet-4-6',         label:'claude-sonnet-4-6      — Défaut ARIA' },
        { value:'claude-haiku-4-5-20251001', label:'claude-haiku-4-5       — Rapide' },
      ],
    },
    {
      id: 'gemini', label: 'Google — Gemini', placeholder: 'AIza...',
      hint: 'Synthèse ministérielle · Synthèse présidentielle',
      models: [
        { value:'gemini-2.0-flash',   label:'gemini-2.0-flash   — Défaut ARIA' },
        { value:'gemini-1.5-pro',     label:'gemini-1.5-pro     — Puissant' },
        { value:'gemini-1.5-flash',   label:'gemini-1.5-flash   — Rapide' },
      ],
    },
    {
      id: 'grok', label: 'xAI — Grok', placeholder: 'xai-...',
      hint: 'Provider alternatif compatible OpenAI',
      models: [
        { value:'grok-3',      label:'grok-3      — Puissant' },
        { value:'grok-3-mini', label:'grok-3-mini — Défaut · Rapide' },
      ],
    },
    {
      id: 'openai', label: 'OpenAI — GPT', placeholder: 'sk-...',
      hint: 'Provider alternatif',
      models: [
        { value:'gpt-4.1',      label:'gpt-4.1      — Puissant' },
        { value:'gpt-4.1-mini', label:'gpt-4.1-mini — Défaut · Rapide' },
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
      <SectionTitle icon="⚙️" label="SYSTÈME" sub="Clés API · Modèles · Architecture de délibération" />

      {/* ── CLÉS API + MODÈLES ── */}
      <div className="settings-group">
        <div className="settings-group-title">CLÉS API &amp; MODÈLES</div>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.44rem',
          color:'rgba(140,160,200,0.45)', margin:'0 0 0.8rem', lineHeight:1.6 }}>
          Les clés sont stockées localement (localStorage). Seul votre navigateur y a accès.
        </p>

        {PROVIDERS.map(prov => {
          const hasKey = !!opts.api_keys[prov.id];
          const stat   = status[prov.id];
          return (
            <div key={prov.id} style={{
              marginBottom:'0.9rem', padding:'0.65rem 0.8rem',
              background: hasKey ? 'rgba(200,164,74,0.03)' : 'rgba(255,255,255,0.015)',
              border:`1px solid ${hasKey ? 'rgba(200,164,74,0.14)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius:'2px',
            }}>
              {/* Header provider */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.55rem' }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.50rem',
                  letterSpacing:'0.12em', color:'rgba(200,215,240,0.80)', flex:1 }}>
                  {prov.label}
                </span>
                {prov.hint && (
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem',
                    color:'rgba(100,120,160,0.45)' }}>{prov.hint}</span>
                )}
              </div>

              {/* Clé API */}
              <div className="settings-row" style={{ marginBottom: hasKey ? '0.5rem' : 0 }}>
                <TextInput password
                  value={opts.api_keys[prov.id] || ''}
                  onChange={v => update(`api_keys.${prov.id}`, v)}
                  placeholder={prov.placeholder}
                />
                <button className="settings-btn-test" onClick={() => testKey(prov.id)}>
                  Tester
                </button>
                <span className={`settings-status ${stat}`}>{statusLabel(stat)}</span>
                {hasKey && (
                  <button title={`Supprimer la clé ${prov.label}`}
                    onClick={() => { update(`api_keys.${prov.id}`, ''); setStatus(s => ({ ...s, [prov.id]: null })); }}
                    style={{ background:'none', border:'none', cursor:'pointer',
                      fontSize:'0.85rem', opacity:0.40, padding:'0 0.2rem', lineHeight:1 }}>🗑</button>
                )}
              </div>

              {/* Sélecteur modèle — grisé si pas de clé */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', opacity: hasKey ? 1 : 0.35 }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
                  color:'rgba(140,160,200,0.50)', minWidth:'4rem' }}>Modèle</span>
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
                    color:'rgba(200,80,80,0.55)' }}>⚠ clé manquante</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODE IA ── */}
      <div className="settings-group">
        <div className="settings-group-title">ARCHITECTURE DE DÉLIBÉRATION</div>
        <Field label="Mode IA">
          {!anyKey ? (
            <div style={{ padding:'0.65rem 0.9rem', background:'rgba(200,164,74,0.04)',
              border:'1px solid rgba(200,164,74,0.12)', borderRadius:'2px',
              fontFamily:"'JetBrains Mono',monospace", fontSize:'0.47rem',
              color:'rgba(200,164,74,0.60)', lineHeight:1.7 }}>
              <div style={{ fontWeight:700, marginBottom:'0.3rem', letterSpacing:'0.12em' }}>MODE ARIA — HORS LIGNE</div>
              Aucune clé API configurée. Ajoutez au moins une clé pour activer la délibération en temps réel.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>

              {/* Modes */}
              <div className="settings-radio-group">
                {[
                  { value:'aria',   label:'ARIA',         desc:'Architecture multi-providers (défaut)' },
                  { value:'solo',   label:'Solo',          desc:'Tous les rôles sur un seul provider' },
                  { value:'custom', label:'Personnalisé',  desc:'Assignation rôle par rôle' },
                ].map(m => (
                  <label key={m.value}
                    className={`settings-radio-card${iaMode===m.value?' selected':''}`}
                    style={{ cursor:'pointer' }}>
                    <input type="radio" name="ia_mode" value={m.value}
                      checked={iaMode===m.value} onChange={() => update('ia_mode', m.value)} />
                    <span className="settings-radio-label">{m.label}</span>
                    {m.desc && <span className="settings-radio-desc">{m.desc}</span>}
                  </label>
                ))}
              </div>

              {/* Solo : choisir provider */}
              {iaMode === 'solo' && (
                <div style={{ paddingLeft:'0.8rem' }}>
                  <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>PROVIDER SOLO</div>
                  <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                    {PROVIDERS.map(p => {
                      const disabled = !opts.api_keys[p.id];
                      return (
                        <label key={p.id}
                          className={`settings-radio-card${opts.solo_model===p.id?' selected':''}${disabled?' disabled':''}`}
                          style={{ opacity:disabled?0.30:1, cursor:disabled?'not-allowed':'pointer',
                            flex:'0 0 auto', padding:'0.3rem 0.8rem' }}>
                          <input type="radio" name="solo_model" value={p.id} disabled={disabled}
                            checked={opts.solo_model===p.id}
                            onChange={() => !disabled && update('solo_model', p.id)} />
                          <span className="settings-radio-label">{p.label.split('—')[1]?.trim() || p.id}</span>
                          {disabled && <span style={{ fontSize:'0.36rem', color:'rgba(200,80,80,0.55)', marginLeft:'0.3rem' }}>⚠</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ARIA : qui pense, qui synthétise */}
              {iaMode === 'aria' && (
                <div style={{ paddingLeft:'0.8rem' }}>
                  <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>DÉLIBÉRATION</div>
                  {[
                    { key:'ministre_model', label:'Ministres pensent' },
                    { key:'synthese_min',   label:'Synthèse ministérielle' },
                  ].map(r => (
                    <div key={r.key} className="settings-role-row">
                      <span className="settings-role-label">{r.label}</span>
                      <Select value={opts.ia_roles[r.key] || 'claude'}
                        onChange={v => update(`ia_roles.${r.key}`, v)}
                        options={availableProviders.map(pid => ({
                          value: pid,
                          label: PROVIDERS.find(p=>p.id===pid)?.label.split('—')[1]?.trim() || pid,
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Custom : tous les rôles */}
              {iaMode === 'custom' && (
                <div style={{ paddingLeft:'0.8rem' }}>
                  <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>ASSIGNATION DES RÔLES</div>
                  {[
                    { key:'ministre_model',  label:'Incarnation des ministres' },
                    { key:'synthese_min',    label:'Synthèse ministérielle' },
                    { key:'phare_model',     label:'Le Phare (Président)' },
                    { key:'boussole_model',  label:'La Boussole (Présidente)' },
                    { key:'synthese_pres',   label:'Synthèse présidentielle' },
                    { key:'evenement_model', label:'Événements narratifs' },
                    { key:'factcheck_model', label:'Fact-check' },
                  ].map(r => (
                    <div key={r.key} className="settings-role-row">
                      <span className="settings-role-label">{r.label}</span>
                      <Select value={opts.ia_roles[r.key] || 'claude'}
                        onChange={v => update(`ia_roles.${r.key}`, v)}
                        options={availableProviders.map(pid => ({
                          value: pid,
                          label: PROVIDERS.find(p=>p.id===pid)?.label.split('—')[1]?.trim() || pid,
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Field>
      </div>

      {/* ── MODE BOARD GAME ── */}
      <div className="settings-group">
        <div className="settings-group-title">MODE BOARD GAME</div>
        <Field label="Forcer les textes locaux"
          hint="Même avec des clés API valides, utilise les réponses pré-écrites d'ariaData.js">
          <Toggle value={opts.gameplay.mode_board_game}
            onChange={v => update('gameplay.mode_board_game', v)}
            label={opts.gameplay.mode_board_game ? 'Activé' : 'Désactivé'} />
        </Field>
      </div>

      {/* ── CONTEXTE PAYS ── */}
      <div className="settings-group">
        <div className="settings-group-title">CONTEXTE PAYS DANS LES DÉLIBÉRATIONS</div>
        <Field label="Mode de contexte global"
          hint="Contrôle quelles infos sur le pays sont injectées dans chaque prompt de délibération. Surchargeable par pays dans la Constitution.">
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            {[
              ['auto',       '🤖 Auto',       'Stats toujours + description si disponible (défaut)'],
              ['rich',       '📖 Enrichi',    'Contexte complet même pour pays fictifs — incite l\'IA à inventer un historique cohérent'],
              ['stats_only', '📊 Stats seules','Uniquement les chiffres — délibération plus neutre, moins d\'hallucinations'],
              ['off',        '🚫 Désactivé',  'Aucun contexte injecté — délibération aveugle, universelle'],
            ].map(([val, lbl, hint]) => (
              <label key={val} style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem',
                cursor:'pointer', padding:'0.35rem 0.5rem', borderRadius:'2px',
                background: opts.gameplay.context_mode === val ? 'rgba(200,164,74,0.08)' : 'transparent',
                border: `1px solid ${opts.gameplay.context_mode === val ? 'rgba(200,164,74,0.30)' : 'transparent'}` }}>
                <input type="radio" name="context_mode" value={val}
                  checked={opts.gameplay.context_mode === val}
                  onChange={() => update('gameplay.context_mode', val)}
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
        </Field>
      </div>

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>Sauvegarder</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}


function SectionConstitution() {
  const [prompts, setPrompts] = useState(() => getPrompts());
  const [saved, setSaved] = useState(false);

  const update = (key, val) => {
    setPrompts(p => ({ ...p, [key]: val }));
    setSaved(false);
  };
  const save = () => { savePrompts(prompts); setSaved(true); };
  const reset = (key) => { update(key, DEFAULT_PROMPTS[key]); };

  // Découpe un prompt en "corps" + "bloc JSON attendu"
  const parsePromptParts = (text) => {
    const jsonStart = text.indexOf('Format JSON');
    if (jsonStart === -1) return { body: text, json: null };
    return {
      body: text.slice(0, jsonStart).trim(),
      json: text.slice(jsonStart).trim(),
    };
  };

  const SYNTH_ENTRIES = [
    { key: 'synthese_ministere',  label: 'Synthèse ministérielle',
      hint: 'Reçoit les 2 ministres d\'un ministère → produit la position officielle du ministère' },
    { key: 'synthese_presidence', label: 'Synthèse présidentielle',
      hint: 'Reçoit Phare + Boussole → détecte convergence/divergence + formate référendum citoyen' },
    { key: 'factcheck_evenement', label: 'Fact-check événements',
      hint: 'Vérifie la cohérence des événements narratifs avec les statistiques réelles du pays' },
  ];

  return (
    <div className="settings-section-body">
      <SectionTitle icon="📜" label="CONSTITUTION" sub="Prompts système, ton de synthèse, contexte géopolitique" />

      {/* ── ADN GLOBAL — modifiable ── */}
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

      <div className="settings-footer" style={{ marginBottom: '1.2rem' }}>
        <button className="settings-save-btn" onClick={save}>Sauvegarder l'ADN</button>
        <SaveBadge saved={saved} />
      </div>

      {/* ── PROMPTS ARIA — SYNTHÈSE — lecture seule ── */}
      <div className="settings-group">
        <div className="settings-group-title" style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          PROMPTS ARIA — SYNTHÈSE
          <span style={{
            fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem',
            padding:'0.15rem 0.5rem', borderRadius:'2px',
            background:'rgba(90,110,160,0.10)', border:'1px solid rgba(90,110,160,0.22)',
            color:'rgba(140,160,200,0.55)', letterSpacing:'0.10em',
          }}>LECTURE SEULE</span>
        </div>
        <div style={{
          fontFamily:"'JetBrains Mono',monospace", fontSize:'0.43rem',
          color:'rgba(140,160,200,0.45)', lineHeight:1.6, marginBottom:'0.8rem',
        }}>
          Ces prompts définissent le format de réponse JSON attendu par le moteur ARIA.
          Leur structure est critique pour le bon fonctionnement du Conseil — toute modification
          peut casser le parsing. Ils sont affichés ici à titre de référence.
        </div>

        {SYNTH_ENTRIES.map(({ key, label, hint }) => {
          const { body, json } = parsePromptParts(DEFAULT_PROMPTS[key]);
          return (
            <div key={key} style={{
              background:'rgba(8,13,22,0.70)',
              border:'1px solid rgba(90,110,160,0.14)',
              borderRadius:'2px', marginBottom:'0.9rem', overflow:'hidden',
            }}>
              {/* En-tête */}
              <div style={{
                padding:'0.5rem 0.8rem',
                borderBottom:'1px solid rgba(90,110,160,0.10)',
                background:'rgba(90,110,160,0.05)',
                display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem',
              }}>
                <div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.50rem',
                    letterSpacing:'0.12em', color:'rgba(200,164,74,0.70)', textTransform:'uppercase' }}>
                    {label}
                  </div>
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
                }}>🔒 non-modifiable</span>
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
                      ◈ FORMAT DE RÉPONSE ATTENDU
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 3 — CONSEIL
// ─────────────────────────────────────────────────────────────────────────────

function SectionConseil() {
  const [agents, setAgents] = useState(() => getAgentOverrides());
  const [govOpts, setGovOpts] = useState(() => getOptions());
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

  const minData = MINISTERS?.[selectedMin] || {};
  const minFallback = (key) => minData[key] || '';

  const ministryData = MINISTRIES?.[selectedMin2] || {};
  const ministryFallback = (key) => ministryData[key] || '';

  return (
    <div className="settings-section-body">
      <SectionTitle icon="🏛️" label="CONSEIL" sub="Prompts des agents — ministres, présidence" />

      <div className="settings-tabs">
        {[
          { id: 'ministres',   label: 'Ministres' },
          { id: 'ministeres',  label: 'Ministères' },
          { id: 'presidence',  label: 'Présidence' },
          { id: 'gouvernance', label: 'Gouvernance' },
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

      {tab === 'gouvernance' && (
        <SectionGouvernanceDefaut opts={govOpts} setOpts={(v) => { setGovOpts(v); setSaved(false); }} />
      )}

      <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>Sauvegarder</button>
        <SaveBadge saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOUS-COMPOSANT : GOUVERNANCE PAR DÉFAUT (dans SectionConseil)
// ─────────────────────────────────────────────────────────────────────────────

const ALL_MINISTRY_IDS = ['justice','economie','defense','sante','education','ecologie','chance'];
const MINISTRY_META = {
  justice:   { emoji: '⚖️',  label: 'Justice & Vérité'          },
  economie:  { emoji: '💰',  label: 'Économie & Ressources'      },
  defense:   { emoji: '⚔️',  label: 'Défense & Souveraineté'     },
  sante:     { emoji: '🏥',  label: 'Santé & Protection sociale' },
  education: { emoji: '🎓',  label: 'Éducation & Élévation'      },
  ecologie:  { emoji: '🌿',  label: 'Transition Écologique'      },
  chance:    { emoji: '🎲',  label: 'Chance, Imprévu & Crises'   },
};
const PRESIDENCY_OPTS = [
  { value: 'duale',      label: 'Duale — Phare + Boussole (défaut ARIA)' },
  { value: 'solaire',    label: 'Solaire — Le Phare seul'                },
  { value: 'lunaire',    label: 'Lunaire — La Boussole seule'            },
  { value: 'collegiale', label: 'Collégiale — Vote des 12 ministres'     },
];

const DEFAULT_GOVERNANCE = {
  presidency: 'duale',
  ministries: ['justice','economie','defense','sante','education','ecologie'],
};

function SectionGouvernanceDefaut({ opts, setOpts }) {
  const gov = opts.defaultGovernance || DEFAULT_GOVERNANCE;

  const setGov = (key, val) => {
    setOpts({
      ...opts,
      defaultGovernance: { ...(opts.defaultGovernance || DEFAULT_GOVERNANCE), [key]: val },
    });
  };

  const toggleMinistry = (id) => {
    const current = new Set(gov.ministries || []);
    if (current.has(id)) {
      if (current.size <= 2) return;
      current.delete(id);
    } else {
      current.add(id);
    }
    setGov('ministries', [...current]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      <div className="settings-group">
        <div className="settings-group-title">PRÉSIDENCE PAR DÉFAUT</div>
        <Field label="Type de présidence" hint="Appliqué à tous les nouveaux pays sauf override">
          <Select
            value={gov.presidency || 'duale'}
            onChange={v => setGov('presidency', v)}
            options={PRESIDENCY_OPTS}
          />
        </Field>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">
          MINISTÈRES ACTIFS PAR DÉFAUT
          <span style={{ marginLeft: '0.6rem', fontSize: '0.48rem', color: 'rgba(200,164,74,0.45)' }}>
            {(gov.ministries || []).length} / {ALL_MINISTRY_IDS.length} — min. 2
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.4rem' }}>
          {ALL_MINISTRY_IDS.map(id => {
            const meta   = MINISTRY_META[id];
            const active = (gov.ministries || []).includes(id);
            const isMin  = (gov.ministries || []).length <= 2 && active;
            return (
              <label key={id} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                cursor: isMin ? 'not-allowed' : 'pointer',
                opacity: isMin ? 0.5 : 1,
                padding: '0.3rem 0.5rem',
                borderRadius: '2px',
                background: active ? 'rgba(200,164,74,0.07)' : 'transparent',
                border: active ? '1px solid rgba(200,164,74,0.20)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                <input
                  type="checkbox"
                  checked={active}
                  disabled={isMin}
                  onChange={() => toggleMinistry(id)}
                  style={{ accentColor: '#C8A44A', width: '13px', height: '13px' }}
                />
                <span style={{ fontSize: '0.9rem' }}>{meta.emoji}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem', color: 'rgba(200,215,240,0.80)' }}>
                  {meta.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">GESTION DE CRISE</div>
        <Field label="Ministère de la Chance & Crises" hint="Active le 7e ministère pour la gestion des urgences">
          <Toggle
            value={gov.crisis_ministry !== false}
            onChange={v => setGov('crisis_ministry', v)}
            label={gov.crisis_ministry !== false ? 'Activé' : 'Désactivé'}
          />
        </Field>
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

        {Object.keys(REGIME_LABELS).map(rk => {
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
                {REGIME_LABELS[rk]}
              </div>
              {/* Séparateur */}
              <div style={{ padding: '0.55rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {[
                  { key: 'coeff_satisfaction', label: 'SATISFACTION', val: coeff_sat,
                    hint: 'Dérive de satisfaction par cycle' },
                  { key: 'coeff_croissance',   label: 'CROISSANCE',   val: coeff_cro,
                    hint: 'Rendement démographique et économique' },
                  { key: 'taux_natalite',      label: 'NATALITÉ',     val: natalite,
                    hint: 'Taux de natalité de base (‰)' },
                  { key: 'taux_mortalite',     label: 'MORTALITÉ',    val: mortalite,
                    hint: 'Taux de mortalité de base (‰)' },
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
          <div className="settings-group-title">PRINCIPE FONDATEUR</div>
            <blockquote className="settings-quote">
              "La vraie question n'est pas de savoir si l'IA entrera dans la gouvernance —
              elle y entre déjà, de manière opaque et non régulée. La question est de savoir
              si nous choisirons de le faire délibérément, avec des garde-fous démocratiques,
              ou par défaut, sans eux."
            </blockquote>
        </div>

      <div className="settings-group">
        <div className="settings-group-title">DOCUMENTATION</div>
        <div className="settings-links">
          <a className="settings-link" href="../doc/aria.pdf" target="_blank" rel="noopener">
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
          <div className="settings-tech-row"><span>IA Pensée</span><span>Claude · Gemini · Grok · OpenAI (configurable)</span></div>
          <div className="settings-tech-row"><span>IA Synthèse</span><span>Multi-providers — sélection par rôle</span></div>
          <div className="settings-tech-row"><span>Persistance</span><span>localStorage</span></div>
          <div className="settings-tech-row"><span>Données</span><span>base_agents.json · base_stats.json · ariaData.js</span></div>
        </div>
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
      'aria_session_active','aria_session_world',
      'aria_session_countries','aria_session_alliances',
      'aria_api_keys_status',
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
          <SectionErrorBoundary key={activeSection}>
            {activeSection === 'systeme'      && <SectionSysteme />}
            {activeSection === 'constitution' && <SectionConstitution />}
            {activeSection === 'conseil'      && <SectionConseil />}
            {activeSection === 'simulation'   && <SectionSimulation />}
            {activeSection === 'interface'    && <SectionInterface onHardReset={hardReset} />}
            {activeSection === 'apropos'      && <SectionAPropos />}
          </SectionErrorBoundary>
        </main>
      </div>
    </div>
  );
}
