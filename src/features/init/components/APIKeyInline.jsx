import { useState } from 'react';
import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../ariaTheme';
import { isValidKeyFormat, isFakeKey } from '../../../Dashboard_p1';

// TODO: isValidKeyFormat et isFakeKey à déplacer dans un service partagé (shared/services/llm)

const KEY_STATUS_STYLE = (s) => ({
  fontFamily: FONT.mono, fontSize:'0.44rem', letterSpacing:'0.10em',
  color: s==='ok' ? 'rgba(100,200,120,0.85)' : s==='error' ? 'rgba(220,80,80,0.85)' : s==='testing' ? 'rgba(200,164,74,0.70)' : 'rgba(90,110,160,0.40)',
});

export default function APIKeyInline({ onClose }) {
  const { lang } = useLocale();
  const loadKeys = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); } catch { return {}; } };

  const PROVIDERS = [
    { id:'claude', label:'CLAUDE',  sub:'Anthropic',  ph:'sk-ant-…',
      versions:[
        { id:'claude-opus-4-6',           label:'Opus 4.6' },
        { id:'claude-sonnet-4-6',         label:'Sonnet 4.6 ★' },
        { id:'claude-haiku-4-5-20251001', label:'Haiku 4.5' },
      ],
      testUrl: async (k, model) => {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST', headers:{ 'Content-Type':'application/json','x-api-key':k,
            'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
          body: JSON.stringify({ model: model||'claude-haiku-4-5-20251001', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
    { id:'gemini', label:'GEMINI',  sub:'Google',     ph:'AIza…',
      versions:[
        { id:'gemini-2.5-pro-preview-05-06', label:'2.5 Pro Preview' },
        { id:'gemini-2.0-flash',             label:'2.0 Flash ★' },
        { id:'gemini-1.5-pro',               label:'1.5 Pro' },
        { id:'gemini-1.5-flash',             label:'1.5 Flash' },
      ],
      testUrl: async (k, model) => {
        const m = model||'gemini-2.0-flash';
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{parts:[{text:'Hi'}]}], generationConfig:{maxOutputTokens:10} }),
        }); return r.ok || r.status===429;
    }},
    { id:'grok',   label:'GROK',    sub:'xAI',        ph:'xai-…',
      versions:[
        { id:'grok-3',      label:'Grok 3' },
        { id:'grok-3-mini', label:'Grok 3 Mini ★' },
      ],
      testUrl: async (k, model) => {
        const r = await fetch('https://api.x.ai/v1/chat/completions', {
          method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},
          body: JSON.stringify({ model: model||'grok-3-mini', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
    { id:'openai', label:'OPENAI',  sub:'OpenAI',     ph:'sk-…',
      versions:[
        { id:'gpt-4.1',      label:'GPT-4.1' },
        { id:'gpt-4.1-mini', label:'GPT-4.1 Mini ★' },
        { id:'o4-mini',      label:'o4-mini' },
      ],
      testUrl: async (k, model) => {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},
          body: JSON.stringify({ model: model||'gpt-4.1-mini', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
  ];

  // ── État multi-clés ────────────────────────────────────────────────────────
  const [keyState, setKeyState] = useState(() => {
    const raw = loadKeys();
    const saved = (() => { try { return JSON.parse(localStorage.getItem('aria_api_keys_status')||'{}'); } catch { return {}; } })();
    const provKeys = {};
    const keyStatus = {};
    for (const p of PROVIDERS) {
      const val = raw[p.id];
      const defModel = p.versions.find(v=>v.label.includes('★'))?.id || p.versions[0]?.id || '';
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
      // Toujours au moins une entrée vide pour affichage immédiat du champ
      if (entries.length === 0) {
        const id = Math.random().toString(36).slice(2);
        entries = [{ key: '', model: defModel, default: true, _id: id }];
      }
      provKeys[p.id] = entries;
    }
    return { provKeys, keyStatus };
  });
  const { provKeys, keyStatus } = keyState;
  const setPK = (fn) => setKeyState(s => ({ ...s, provKeys: typeof fn === 'function' ? fn(s.provKeys) : fn }));
  const setKS = (fn) => setKeyState(s => ({ ...s, keyStatus: typeof fn === 'function' ? fn(s.keyStatus) : fn }));
  const [hasDeleted, setHasDeleted] = useState(false);
  const [openProvs, setOpenProvs] = useState(() => {
    const raw = loadKeys();
    // Ouvre automatiquement les providers sans clé configurée
    return PROVIDERS
      .filter(p => {
        const v = raw[p.id];
        const hasK = Array.isArray(v)
          ? v.some(k => (typeof k === 'string' ? k : k?.key)?.trim())
          : typeof v === 'string' && v.trim();
        return !hasK;
      })
      .map(p => p.id);
  });
  const toggleProv = (id) => setOpenProvs(ps => ps.includes(id) ? ps.filter(x => x !== id) : [...ps, id]);

  const addKey = (provId) => {
    const prov = PROVIDERS.find(p => p.id === provId);
    const defModel = prov.versions.find(v=>v.label.includes('★'))?.id || prov.versions[0]?.id || '';
    const id = Math.random().toString(36).slice(2);
    setPK(pk => ({ ...pk, [provId]: [...(pk[provId]||[]), { key:'', model:defModel, default:false, _id:id }] }));
  };
  const updateEntry = (provId, _id, field, value) => {
    setPK(pk => ({ ...pk, [provId]: pk[provId].map(k => k._id===_id ? {...k,[field]:value} : k) }));
    if (field === 'key') setKS(ks => ({ ...ks, [_id]: null }));
  };
  const removeEntry = (provId, _id) => {
    setPK(pk => {
      let arr = pk[provId].filter(k => k._id !== _id);
      if (arr.length > 0 && !arr.some(k => k.default)) arr = [{ ...arr[0], default:true }, ...arr.slice(1)];
      return { ...pk, [provId]: arr };
    });
    setKS(ks => { const n={...ks}; delete n[_id]; return n; });
    setHasDeleted(true);
  };
  const setDefault = (provId, _id) =>
    setPK(pk => ({ ...pk, [provId]: pk[provId].map(k => ({...k, default: k._id===_id})) }));

  const testEntry = async (provId, _id, keyVal, modelVal) => {
    const k = keyVal?.trim();
    if (!k) return;
    // Pré-validation format local
    if (!isValidKeyFormat(provId, k)) {
      setKS(ks => ({...ks, [_id]:'error'}));
      return;
    }
    // Clé debug — format OK mais manifestement factice
    if (isFakeKey(provId, k)) {
      setKS(ks => ({...ks, [_id]:'debug'}));
      return;
    }
    setKS(ks => ({...ks, [_id]:'testing'}));
    const prov = PROVIDERS.find(p=>p.id===provId);
    try {
      const ok = await prov.testUrl(k, modelVal);
      setKS(ks => ({...ks, [_id]: ok?'ok':'error'}));
    } catch { setKS(ks => ({...ks, [_id]:'error'})); }
  };

  const anyOk = Object.values(keyStatus).some(s=>s==='ok'||s==='debug');
  const hasAnyKey = Object.values(provKeys).some(arr => arr.some(k=>k.key?.trim()));
  const canSave = anyOk || hasDeleted;
  const stIcon = (s) => s==='ok'?'✅':s==='error'?'❌':s==='testing'?'⏳ …':s==='debug'?'🐛':'';

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
      if (statuses.some(s => s==='ok')) statusToSave[provId] = 'ok';
      else if (statuses.some(s => s==='debug')) statusToSave[provId] = 'debug';
      else if (statuses.length > 0 && statuses.every(s => s==='error')) statusToSave[provId] = 'error';
      // Modèle préféré = modèle de la clé default
      const defKey = valid.find(k => k.default) || valid[0];
      if (defKey?.model) {
        try {
          const pm = JSON.parse(localStorage.getItem('aria_preferred_models')||'{}');
          localStorage.setItem('aria_preferred_models', JSON.stringify({...pm, [provId]: defKey.model}));
        } catch {}
      }
    }
    const existing = loadKeys();
    for (const pid of PROVIDERS.map(p=>p.id)) { if (!toSave[pid]) delete existing[pid]; }
    localStorage.setItem('aria_api_keys', JSON.stringify({ ...existing, ...toSave }));
    localStorage.setItem('aria_api_keys_status', JSON.stringify(statusToSave));
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(4,8,18,0.92)',
      backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ ...CARD_STYLE, width:480, display:'flex', flexDirection:'column', gap:'0.7rem' }}>
        <div style={{ ...labelStyle(), marginBottom:'0.1rem' }}>{lang==='en'?'🔑 API KEYS':'🔑 CLÉS API'}</div>
        <p style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.40)', margin:0, lineHeight:1.6 }}>
          {lang==='en'?'Stored locally — no server. Configure at least one key.':'Stockées localement — aucun serveur. Configurez au moins une clé.'}
        </p>

        {PROVIDERS.map(prov => {
          const keyArr = provKeys[prov.id] || [];
          const hasAK  = keyArr.some(k=>k.key?.trim());
          const provOk  = keyArr.some(k=>keyStatus[k._id]==='ok');
          const provDbg = !provOk && keyArr.some(k=>keyStatus[k._id]==='debug');
          const provErr = !provOk && !provDbg && hasAK && keyArr.filter(k=>k.key?.trim()).every(k=>keyStatus[k._id]==='error');
          const statIcon = provOk?'✅':provDbg?'🐛':provErr?'❌':hasAK?'🔑':'—';
          const isOpen   = openProvs.includes(prov.id);
          return (
            <div key={prov.id} style={{ border:`1px solid ${hasAK?'rgba(200,164,74,0.14)':'rgba(255,255,255,0.06)'}`,
              borderRadius:'2px', overflow:'hidden', background:hasAK?'rgba(200,164,74,0.02)':'rgba(255,255,255,0.01)' }}>
              <button onClick={()=>toggleProv(prov.id)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem',
                  padding:'0.38rem 0.6rem', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                <span style={{ fontSize:'0.65rem', color:'rgba(200,164,74,0.50)' }}>{isOpen?'▾':'▸'}</span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.10em',
                  color:isOpen?'rgba(200,164,74,0.88)':'rgba(200,215,240,0.70)', flex:1 }}>{prov.label}</span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.36rem', color:'rgba(100,120,160,0.40)' }}>{prov.sub}</span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', marginLeft:'0.4rem',
                  color:provOk?'rgba(58,191,122,0.80)':provDbg?'rgba(180,140,80,0.80)':provErr?'rgba(200,58,58,0.80)':'rgba(140,160,200,0.35)' }}>{statIcon}</span>
              </button>

              {isOpen && (
                <div style={{ padding:'0.5rem 0.65rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.55rem',
                  borderTop:`1px solid ${hasAK?'rgba(200,164,74,0.10)':'rgba(255,255,255,0.05)'}` }}>
                  {keyArr.map((entry, idx) => {
                    const st = keyStatus[entry._id];
                    const multiKeys = keyArr.length > 1;
                    return (
                      <div key={entry._id} style={{ display:'flex', flexDirection:'column', gap:'0.28rem',
                        paddingBottom: idx<keyArr.length-1?'0.45rem':0,
                        borderBottom: idx<keyArr.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          {multiKeys && (
                            <button onClick={()=>setDefault(prov.id, entry._id)}
                              title={lang==='en'?'Set as default':'Clé par défaut'}
                              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem',
                                padding:'0 0.15rem', lineHeight:1, opacity:entry.default?1:0.40, flexShrink:0 }}>
                              {entry.default?'⭐':'☆'}
                            </button>
                          )}
                          <input style={{ ...INPUT_STYLE, fontSize:'0.44rem', flex:1 }}
                            type="password" value={entry.key}
                            onChange={e=>updateEntry(prov.id, entry._id, 'key', e.target.value)}
                            placeholder={prov.ph} />
                          <button style={{ ...BTN_SECONDARY, padding:'0.28rem 0.50rem', fontSize:'0.42rem', whiteSpace:'nowrap' }}
                            disabled={!entry.key?.trim()} onClick={()=>testEntry(prov.id, entry._id, entry.key, entry.model)}>
                            Test
                          </button>
                          {st && (
                            <span style={{ fontSize:'0.75rem', minWidth:'1rem', flexShrink:0,
                              ...(st==='debug'?{color:'rgba(200,160,60,0.85)',cursor:'help'}:{}) }}
                              title={st==='debug'?(lang==='en'?'Debug key — correct format, no real API call':'Clé debug — format correct, aucun appel API réel'):undefined}>
                              {stIcon(st)}
                            </span>
                          )}
                          {multiKeys && (
                            <button style={{ ...BTN_SECONDARY, padding:'0.18rem 0.35rem', fontSize:'0.80rem', lineHeight:1, flexShrink:0 }}
                              onClick={()=>removeEntry(prov.id, entry._id)}
                              title={lang==='en'?'Delete key':'Supprimer'}>🗑</button>
                          )}
                        </div>
                        <div style={{ display:'flex', gap:'0.22rem', flexWrap:'wrap', paddingLeft: multiKeys?'1.6rem':0 }}>
                          {prov.versions.map(v => {
                            const chosen = entry.model === v.id;
                            return (
                              <button key={v.id}
                                style={{ ...BTN_SECONDARY, padding:'0.15rem 0.40rem', fontSize:'0.38rem',
                                  ...(chosen?{border:'1px solid rgba(200,164,74,0.45)',color:'rgba(200,164,74,0.88)',background:'rgba(200,164,74,0.08)'}:{opacity:0.50}) }}
                                onClick={()=>updateEntry(prov.id, entry._id, 'model', v.id)}>
                                {v.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <button style={{ ...BTN_SECONDARY, fontSize:'0.40rem', padding:'0.25rem 0.6rem',
                    alignSelf:'flex-start', border:'1px dashed rgba(200,164,74,0.25)', color:'rgba(200,164,74,0.60)' }}
                    onClick={()=>addKey(prov.id)}>
                    + {lang==='en'?'Add a key':'Ajouter une clé'}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!canSave && hasAnyKey && (
          <div style={{ fontSize:'0.42rem', color:'rgba(200,164,74,0.45)', lineHeight:1.5 }}>
            {lang==='en'?'⚠ Test at least one key to enable saving.':'⚠ Testez au moins une clé pour activer la sauvegarde.'}
          </div>
        )}
        <div style={{ display:'flex', gap:'0.6rem', justifyContent:'flex-end', marginTop:'0.2rem' }}>
          <button style={BTN_SECONDARY} onClick={onClose}>{lang==='en'?'CANCEL':'ANNULER'}</button>
          <button style={{ ...BTN_PRIMARY, opacity:canSave?1:0.35 }}
            disabled={!canSave} onClick={save}>{lang==='en'?'SAVE':'SAUVEGARDER'}</button>
        </div>
      </div>
    </div>
  );
}
