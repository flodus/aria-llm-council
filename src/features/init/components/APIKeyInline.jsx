// src/features/init/components/APIKeyInline.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  APIKeyInline.jsx — Modale de gestion des clés API
//
//  Permet de saisir, tester et sauvegarder plusieurs clés par provider.
//  Stockage dans localStorage (aria_api_keys + aria_api_keys_status).
//  Providers : Claude, Gemini, Grok, OpenAI.
//
//  Dépendances : shared/services/storage, shared/constants/llmRegistry
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../shared/theme';
import { loadKeys, saveKeys, loadKeyStatus, saveKeyStatus, loadCustomProviders, saveCustomProviders } from '../../../shared/services';
import { ARIA_FALLBACK_MODELS } from '../../../shared/constants/llmRegistry';
import { ProviderAccordion } from './api';

const PROVIDERS = [
  { id: 'claude', label: 'CLAUDE', sub: 'Anthropic', ph: 'sk-ant-…',
    versions: ARIA_FALLBACK_MODELS.claude,
    testUrl: async (k, model) => {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: {
          'Content-Type': 'application/json', 'x-api-key': k,
          'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({ model: model || 'claude-haiku-4-5-20251001', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] }),
      }); return r.ok;
    }
  },
{ id: 'gemini', label: 'GEMINI', sub: 'Google', ph: 'AIza…',
  versions: ARIA_FALLBACK_MODELS.gemini,
  testUrl: async (k, model) => {
    const m = model || 'gemini-2.0-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 10 } }),
    }); return r.ok || r.status === 429;
  }
},
{ id: 'grok', label: 'GROK', sub: 'xAI', ph: 'xai-…',
  versions: ARIA_FALLBACK_MODELS.grok,
  testUrl: async (k, model) => {
    const r = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}` },
      body: JSON.stringify({ model: model || 'grok-3-mini', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] }),
    }); return r.ok;
  }
},
{ id: 'openai', label: 'OPENAI', sub: 'OpenAI', ph: 'sk-…',
  versions: ARIA_FALLBACK_MODELS.openai,
  testUrl: async (k, model) => {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}` },
      body: JSON.stringify({ model: model || 'gpt-4.1-mini', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] }),
    }); return r.ok;
  }
},
{ id: 'openrouter', label: 'OPENROUTER', sub: 'OpenRouter', ph: 'sk-or-…',
  versions: ARIA_FALLBACK_MODELS.openrouter,
  testUrl: async (k, model) => {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}`,
        'HTTP-Referer': 'https://flodus.github.io/aria-llm-council/', 'X-Title': 'ARIA' },
      body: JSON.stringify({ model: model || 'google/gemini-2.0-flash', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] }),
    }); return r.ok;
  }
},
];

// ── Helpers de validation de clé ─────────────────────────────────────────

// Vérifie le préfixe attendu par provider (format superficiel, pas d'appel API)
const isValidKeyFormat = (provider, key) => {
  if (provider === 'claude')      return key?.startsWith('sk-ant-');
  if (provider === 'gemini')      return key?.startsWith('AIza');
  if (provider === 'grok')        return key?.startsWith('xai-');
  if (provider === 'openrouter')  return key?.startsWith('sk-or-');
  if (provider === 'openai')      return key?.startsWith('sk-') && !key?.startsWith('sk-ant-') && !key?.startsWith('sk-or-');
  return false;
};

// Clé de debug : préfixe valide + marqueur -fake/-test/-debug/-demo → statut ⏳ sans appel API
const isFakeKey = (provider, key) => {
  return key.includes('-fake-') || key.includes('-test-') || key.includes('-debug-') || key.includes('-demo-');
};

// ── Styles partagés formulaire custom ────────────────────────────────────────
const inputStyle = {
  fontFamily: "'JetBrains Mono',monospace", fontSize: '0.44rem',
  background: 'rgba(8,14,26,0.70)', border: '1px solid rgba(90,110,160,0.22)',
  borderRadius: '2px', color: 'rgba(200,220,255,0.85)', padding: '0.28rem 0.5rem',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

export default function APIKeyInline({ onClose }) {
  const { lang } = useLocale();

  // ── État providers custom ──────────────────────────────────────────────────
  const [customProvs, setCustomProvs] = useState(() => loadCustomProviders());
  const [newProv, setNewProv] = useState({ label: '', endpoint: '', key: '', model: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const slugify = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom';

  const addCustomProv = () => {
    if (!newProv.label.trim() || !newProv.endpoint.trim()) return;
    const id = slugify(newProv.label) + '-' + Math.random().toString(36).slice(2, 5);
    setCustomProvs(prev => [...prev, { ...newProv, id, label: newProv.label.trim(), endpoint: newProv.endpoint.trim(), key: newProv.key.trim(), model: newProv.model.trim() }]);
    setNewProv({ label: '', endpoint: '', key: '', model: '' });
    setShowAddForm(false);
  };

  const removeCustomProv = (id) => setCustomProvs(prev => prev.filter(p => p.id !== id));
  const updateCustomProv = (id, field, value) => setCustomProvs(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  // État multi-clés
  const [keyState, setKeyState] = useState(() => {
    const raw = loadKeys();
    const saved = loadKeyStatus();
    const provKeys = {};
    const keyStatus = {};

    for (const p of PROVIDERS) {
      const val = raw[p.id];
      const defModel = p.versions.find(v => v.label.includes('★'))?.id || p.versions[0]?.id || '';
      let entries = [];

      if (typeof val === 'string' && val.trim()) {
        const id = Math.random().toString(36).slice(2);
        entries = [{ key: val, model: defModel, default: true, _id: id }];
        keyStatus[id] = saved[p.id] || null;
      } else if (Array.isArray(val)) {
        entries = val.filter(k => k.key?.trim()).map((k, i) => {
          const id = Math.random().toString(36).slice(2);
          keyStatus[id] = i === 0 ? (saved[p.id] || null) : null;
          return { key: k.key, model: k.model || defModel, default: !!k.default, _id: id };
        });
        if (entries.length > 0 && !entries.some(k => k.default)) entries[0] = { ...entries[0], default: true };
      }

      if (entries.length === 0) {
        const id = Math.random().toString(36).slice(2);
        entries = [{ key: '', model: defModel, default: true, _id: id }];
      }
      provKeys[p.id] = entries;
    }
    return { provKeys, keyStatus };
  });

  const { provKeys, keyStatus } = keyState;
  const [hasDeleted, setHasDeleted] = useState(false);
  const [hasCleared, setHasCleared] = useState(false);

  // Helpers d'état imbriqué (provKeys + keyStatus dans un seul objet)
  const setPK = (fn) => setKeyState(s => ({ ...s, provKeys: typeof fn === 'function' ? fn(s.provKeys) : fn }));
  const setKS = (fn) => setKeyState(s => ({ ...s, keyStatus: typeof fn === 'function' ? fn(s.keyStatus) : fn }));

  // ── Handlers clés ────────────────────────────────────────────────────────

  // Ajoute une entrée vide pour un provider (multi-clé)
  const addKey = (provId) => {
    const prov = PROVIDERS.find(p => p.id === provId);
    const defModel = prov.versions.find(v => v.label.includes('★'))?.id || prov.versions[0]?.id || '';
    const id = Math.random().toString(36).slice(2);
    setPK(pk => ({ ...pk, [provId]: [...(pk[provId] || []), { key: '', model: defModel, default: false, _id: id }] }));
  };

  // Met à jour un champ d'une entrée (réinitialise le statut si la clé change)
  const updateEntry = (provId, _id, field, value) => {
    setPK(pk => ({ ...pk, [provId]: pk[provId].map(k => k._id === _id ? { ...k, [field]: value } : k) }));
    if (field === 'key') setKS(ks => ({ ...ks, [_id]: null }));
  };

  // Supprime une entrée ; réassigne la clé par défaut si nécessaire
  const removeEntry = (provId, _id) => {
    setPK(pk => {
      let arr = pk[provId].filter(k => k._id !== _id);
      if (arr.length > 0 && !arr.some(k => k.default)) arr = [{ ...arr[0], default: true }, ...arr.slice(1)];
      return { ...pk, [provId]: arr };
    });
    setKS(ks => { const n = { ...ks }; delete n[_id]; return n; });
    setHasDeleted(true);
  };

  // Marque une entrée comme clé par défaut pour ce provider (une seule à la fois)
  const setDefault = (provId, _id) => {
    setPK(pk => ({ ...pk, [provId]: pk[provId].map(k => ({ ...k, default: k._id === _id })) }));
  };

  // ── Test de clé ──────────────────────────────────────────────────────────
  // Vérifie format → fake → appel API réel. Statuts : 'testing'|'ok'|'error'|'debug'
  const testEntry = async (provId, _id, keyVal, modelVal) => {
    const k = keyVal?.trim();
    if (!k) return;

    if (!isValidKeyFormat(provId, k)) {
      setKS(ks => ({ ...ks, [_id]: 'error' }));
      return;
    }

    if (isFakeKey(provId, k)) {
      setKS(ks => ({ ...ks, [_id]: 'debug' }));
      return;
    }

    setKS(ks => ({ ...ks, [_id]: 'testing' }));
    const prov = PROVIDERS.find(p => p.id === provId);
    try {
      const ok = await prov.testUrl(k, modelVal);
      setKS(ks => ({ ...ks, [_id]: ok ? 'ok' : 'error' }));
    } catch {
      setKS(ks => ({ ...ks, [_id]: 'error' }));
    }
  };

  const anyOk = Object.values(keyStatus).some(s => s === 'ok' || s === 'debug');
  const hasAnyKey = Object.values(provKeys).some(arr => arr.some(k => k.key?.trim()));
  const canSave = anyOk || hasDeleted || hasCleared || customProvs.length > 0;

  // ── Sauvegarde ───────────────────────────────────────────────────────────
  // Persiste clés valides + statuts + modèle préféré par provider dans localStorage
  const save = () => {
    const toSave = {};
    const statusToSave = {};

    for (const [provId, keyArr] of Object.entries(provKeys)) {
      const valid = keyArr.filter(k => k.key?.trim());
      if (valid.length === 0) continue;
      if (!valid.some(k => k.default)) valid[0] = { ...valid[0], default: true };

      toSave[provId] = valid.length === 1
      ? valid[0].key.trim()
      : valid.map(({ _id, ...k }) => ({ ...k, key: k.key.trim() }));

      const statuses = valid.map(k => keyStatus[k._id]);
      if (statuses.some(s => s === 'ok')) statusToSave[provId] = 'ok';
      else if (statuses.some(s => s === 'debug')) statusToSave[provId] = 'debug';
      else if (statuses.length > 0 && statuses.every(s => s === 'error')) statusToSave[provId] = 'error';

      const defKey = valid.find(k => k.default) || valid[0];
      if (defKey?.model) {
        try {
          const pm = JSON.parse(localStorage.getItem('aria_preferred_models') || '{}');
          localStorage.setItem('aria_preferred_models', JSON.stringify({ ...pm, [provId]: defKey.model }));
        } catch {}
      }
    }

    const existing = loadKeys();
    for (const pid of PROVIDERS.map(p => p.id)) {
      if (!toSave[pid]) delete existing[pid];
    }

    saveKeys({ ...existing, ...toSave });
    saveKeyStatus(statusToSave);
    saveCustomProviders(customProvs.filter(p => p.label.trim() && p.endpoint.trim()));
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(4,8,18,0.92)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
    <div style={{ ...CARD_STYLE, width: 480, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
    <div style={{ ...labelStyle(), marginBottom: '0.1rem' }}>
    {lang === 'en' ? '🔑 API KEYS' : '🔑 CLÉS API'}
    </div>

    <p style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(140,160,200,0.40)', margin: 0, lineHeight: 1.6 }}>
    {lang === 'en'
      ? 'Stored locally — no server. Configure at least one key.'
  : 'Stockées localement — aucun serveur. Configurez au moins une clé.'}
  </p>

  {PROVIDERS.map(prov => (
    <ProviderAccordion
    key={prov.id}
    provider={prov}
    keys={provKeys[prov.id] || []}
    keyStatus={keyStatus}
    onUpdateEntry={updateEntry}
    onTestEntry={testEntry}
    onRemoveEntry={removeEntry}
    onClear={() => setHasCleared(true)}
    onSetDefault={setDefault}
    onAddKey={addKey}
    />
  ))}

  {/* ── Providers custom ── */}
  <div style={{ borderTop: '1px solid rgba(90,110,160,0.12)', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: FONT.mono, fontSize: '0.42rem', letterSpacing: '0.12em', color: 'rgba(140,160,200,0.55)', textTransform: 'uppercase' }}>
        {lang === 'en' ? 'Custom providers' : 'Providers custom'} <span style={{ color: 'rgba(140,160,200,0.30)' }}>— OpenAI-compatible</span>
      </span>
      {!showAddForm && (
        <button onClick={() => setShowAddForm(true)} style={{ background: 'none', border: '1px solid rgba(90,110,160,0.25)', borderRadius: '2px', cursor: 'pointer', padding: '0.15rem 0.5rem', fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.60)', letterSpacing: '0.08em' }}>
          + {lang === 'en' ? 'Add' : 'Ajouter'}
        </button>
      )}
    </div>

    {customProvs.map(p => (
      <div key={p.id} style={{ background: 'rgba(8,14,26,0.60)', border: '1px solid rgba(90,110,160,0.18)', borderRadius: '2px', padding: '0.45rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: 'rgba(200,220,255,0.80)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{p.label}</span>
          <button onClick={() => removeCustomProv(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.mono, fontSize: '0.42rem', color: 'rgba(200,80,80,0.55)', padding: '0 0.2rem' }}>✕</button>
        </div>
        <input style={inputStyle} value={p.endpoint} onChange={e => updateCustomProv(p.id, 'endpoint', e.target.value)} placeholder="https://…/v1/chat/completions" />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input style={{ ...inputStyle, flex: 1 }} value={p.key} onChange={e => updateCustomProv(p.id, 'key', e.target.value)} placeholder={lang === 'en' ? 'API key (optional)' : 'Clé API (optionnel)'} />
          <input style={{ ...inputStyle, flex: 1 }} value={p.model} onChange={e => updateCustomProv(p.id, 'model', e.target.value)} placeholder={lang === 'en' ? 'Model ID' : 'ID modèle'} />
        </div>
      </div>
    ))}

    {showAddForm && (
      <div style={{ background: 'rgba(8,14,26,0.60)', border: '1px solid rgba(90,110,160,0.25)', borderRadius: '2px', padding: '0.5rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <input style={inputStyle} value={newProv.label} onChange={e => setNewProv(p => ({ ...p, label: e.target.value }))} placeholder={lang === 'en' ? 'Provider name (e.g. Ollama)' : 'Nom du provider (ex: Ollama)'} />
        <input style={inputStyle} value={newProv.endpoint} onChange={e => setNewProv(p => ({ ...p, endpoint: e.target.value }))} placeholder="https://…/v1/chat/completions" />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input style={{ ...inputStyle, flex: 1 }} value={newProv.key} onChange={e => setNewProv(p => ({ ...p, key: e.target.value }))} placeholder={lang === 'en' ? 'API key (optional)' : 'Clé API (optionnel)'} />
          <input style={{ ...inputStyle, flex: 1 }} value={newProv.model} onChange={e => setNewProv(p => ({ ...p, model: e.target.value }))} placeholder={lang === 'en' ? 'Model ID' : 'ID modèle'} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.1rem' }}>
          <button onClick={() => { setShowAddForm(false); setNewProv({ label: '', endpoint: '', key: '', model: '' }); }} style={{ background: 'none', border: '1px solid rgba(90,110,160,0.20)', borderRadius: '2px', cursor: 'pointer', padding: '0.18rem 0.6rem', fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.50)' }}>
            {lang === 'en' ? 'Cancel' : 'Annuler'}
          </button>
          <button onClick={addCustomProv} disabled={!newProv.label.trim() || !newProv.endpoint.trim()} style={{ background: 'rgba(90,110,160,0.10)', border: '1px solid rgba(90,110,160,0.30)', borderRadius: '2px', cursor: newProv.label.trim() && newProv.endpoint.trim() ? 'pointer' : 'not-allowed', padding: '0.18rem 0.6rem', fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.75)', opacity: newProv.label.trim() && newProv.endpoint.trim() ? 1 : 0.40 }}>
            {lang === 'en' ? 'Add' : 'Ajouter'}
          </button>
        </div>
      </div>
    )}
  </div>

  {!canSave && hasAnyKey && (
    <div style={{ fontSize: '0.42rem', color: 'rgba(200,164,74,0.45)', lineHeight: 1.5 }}>
    {lang === 'en'
      ? '⚠ Test at least one key to enable saving.'
  : '⚠ Testez au moins une clé pour activer la sauvegarde.'}
  </div>
  )}

  <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
  <button style={BTN_SECONDARY} onClick={onClose}>
  {lang === 'en' ? 'CANCEL' : 'ANNULER'}
  </button>
  <button style={{ ...BTN_PRIMARY, opacity: canSave ? 1 : 0.35 }} disabled={!canSave} onClick={save}>
  {lang === 'en' ? 'SAVE' : 'SAUVEGARDER'}
  </button>
  </div>
  </div>
  </div>
  );
}
