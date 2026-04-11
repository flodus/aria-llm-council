// src/features/settings/components/SectionSysteme.jsx
// SECTION SYSTÈME — Clés API, modèles, langue, export, réinitialisation

import { useState, useEffect } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { getIaStatus } from '../../../shared/services/iaStatusStore';
import BASE_AGENTS from '../../../../templates/languages/fr/governance.json';
import BASE_AGENTS_EN from '../../../../templates/languages/en/governance.json';
import { DEFAULT_OPTIONS, getOptions, saveOptions } from '../../../shared/config/options';
import { getAgents } from '../../../shared/data/gameData';
import { isValidKeyFormat, isFakeKey } from '../../../shared/services/llm/aiService';
import { SectionTitle, Field, TextInput, Toggle, NumberInput, Select, DangerButton, SaveBadge } from '../ui/SettingsUI';
import { useAccordion } from '../../../shared/hooks/useAccordion';
import { getPrompts, savePrompts, getAgentOverrides, saveAgentOverrides, getSimOverrides, saveSimOverrides } from '../utils/settingsStorage';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDERS = [
    {
        id: 'claude', label: 'Anthropic — Claude', placeholder: 'sk-ant-...',
        hint: 'Ministres · Phare · Boussole',
        models: [
            { value:'claude-opus-4-6',          label:'claude-opus-4-6 — Puissant' },
            { value:'claude-sonnet-4-6',         label:'claude-sonnet-4-6 — Défaut ARIA' },
            { value:'claude-haiku-4-5-20251001', label:'claude-haiku-4-5 — Rapide' },
        ],
    },
{
    id: 'gemini', label: 'Google — Gemini', placeholder: 'AIza...',
    hint: 'Synthèse ministérielle · Synthèse présidentielle',
    models: [
        { value:'gemini-2.5-pro-preview-05-06', label:'gemini-2.5-pro-preview — Puissant' },
        { value:'gemini-2.0-flash',             label:'gemini-2.0-flash — Défaut ARIA' },
        { value:'gemini-1.5-pro',               label:'gemini-1.5-pro — Équilibré' },
        { value:'gemini-1.5-flash',             label:'gemini-1.5-flash — Rapide' },
    ],
},
{
    id: 'grok', label: 'xAI — Grok', placeholder: 'xai-...',
    hint: 'LLM alternatif compatible OpenAI',
    models: [
        { value:'grok-3',      label:'grok-3 — Puissant' },
        { value:'grok-3-mini', label:'grok-3-mini — Défaut · Rapide' },
    ],
},
{
    id: 'openai', label: 'OpenAI — GPT', placeholder: 'sk-...',
    hint: 'LLM alternatif',
    models: [
        { value:'gpt-4.1',      label:'gpt-4.1 — Puissant' },
        { value:'gpt-4.1-mini', label:'gpt-4.1-mini — Défaut · Rapide' },
        { value:'o4-mini',      label:'o4-mini — Raisonnement' },
    ],
},
];

export default function SectionSysteme({ onHardReset }) {
    const { lang, setLang } = useLocale();
    const isEn = lang === 'en';
    const [opts, setOpts] = useState(() => getOptions());
    const [saved, setSaved] = useState(false);
    const { ouvert: openAcc, basculer: toggleAcc } = useAccordion();
    const [openProvAcc, setOpenProvAcc] = useState(null);
    const [iaStatus, setIaStatusLocal] = useState(() => getIaStatus());

    const [status, setStatus] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('aria_api_keys_status') || '{}');
            const k = JSON.parse(localStorage.getItem('aria_api_keys') || '{}');
            const st = (id) => s[id]==='ok' && k[id] ? 'ok' : s[id]==='error' && k[id] ? 'error' : null;
            return { claude: st('claude'), gemini: st('gemini'), grok: st('grok'), openai: st('openai') };
        } catch { return { claude:null, gemini:null, grok:null, openai:null }; }
    });

    useEffect(() => {
        const handler = (e) => setIaStatusLocal(e.detail.status);
        window.addEventListener('aria:ia-status', handler);
        return () => window.removeEventListener('aria:ia-status', handler);
    }, []);

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

    // État multi-clés
    const [keysState, setKeysState] = useState(() => {
        const provKeys = {};
        const keyStatuses = {};
        for (const p of PROVIDERS) {
            const val = opts.api_keys?.[p.id];
            const defModel = opts.ia_models?.[p.id] || p.models[0]?.value || '';
            let entries = [];
            if (typeof val === 'string' && val.trim()) {
                const id = Math.random().toString(36).slice(2);
                entries = [{ key: val, model: defModel, default: true, _id: id }];
                keyStatuses[id] = status[p.id] || null;
            } else if (Array.isArray(val)) {
                entries = val.filter(k => k.key?.trim()).map((k, i) => {
                    const id = Math.random().toString(36).slice(2);
                    keyStatuses[id] = i === 0 ? (status[p.id] || null) : null;
                    return { key: k.key, model: k.model || defModel, default: !!k.default, _id: id };
                });
                if (entries.length > 0 && !entries.some(k => k.default)) entries[0] = { ...entries[0], default: true };
            }
            provKeys[p.id] = entries;
        }
        return { provKeys, keyStatuses };
    });
    const { provKeys: sProvKeys, keyStatuses } = keysState;
    const setKS2 = (fn) => setKeysState(s => ({ ...s, keyStatuses: typeof fn === 'function' ? fn(s.keyStatuses) : fn }));
    const setPK2 = (fn) => setKeysState(s => ({ ...s, provKeys: typeof fn === 'function' ? fn(s.provKeys) : fn }));

    const addSettingsKey = (provId) => {
        const prov = PROVIDERS.find(p => p.id === provId);
        const id = Math.random().toString(36).slice(2);
        setPK2(pk => ({ ...pk, [provId]: [...(pk[provId]||[]), { key:'', model:prov.models[0]?.value||'', default:false, _id:id }] }));
    };
    const updateSettingsKey = (provId, _id, field, value) => {
        setPK2(pk => ({ ...pk, [provId]: pk[provId].map(k => k._id===_id ? {...k,[field]:value} : k) }));
        if (field === 'key') setKS2(ks => ({ ...ks, [_id]: null }));
        setSaved(false);
    };
    const removeSettingsKey = (provId, _id) => {
        setPK2(pk => {
            let arr = pk[provId].filter(k => k._id !== _id);
            if (arr.length > 0 && !arr.some(k => k.default)) arr = [{ ...arr[0], default: true }, ...arr.slice(1)];
            return { ...pk, [provId]: arr };
        });
        setKS2(ks => { const n={...ks}; delete n[_id]; return n; });
        setSaved(false);
    };
    const setSettingsDefault = (provId, _id) => {
        setPK2(pk => ({ ...pk, [provId]: pk[provId].map(k => ({...k, default: k._id===_id})) }));
        setSaved(false);
    };

    const testSettingsKey = async (provId, _id, keyVal, modelVal) => {
        const k = keyVal?.trim();
        if (!k) return;
        if (!isValidKeyFormat(provId, k)) {
            setKS2(ks => ({...ks, [_id]:'error'}));
            return;
        }
        if (isFakeKey(provId, k)) {
            setKS2(ks => ({...ks, [_id]:'debug'}));
            return;
        }
        setKS2(ks => ({...ks, [_id]:'testing'}));
        try {
            let ok = false;
            if (provId === 'claude') {
                const r = await fetch('https://api.anthropic.com/v1/messages', {
                    method:'POST', headers:{'Content-Type':'application/json','x-api-key':k,
                        'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
                        body: JSON.stringify({ model: modelVal||'claude-haiku-4-5-20251001', max_tokens:10, messages:[{role:'user',content:'ping'}] }),
                }); ok = r.ok;
            } else if (provId === 'gemini') {
                const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVal||'gemini-2.0-flash'}:generateContent?key=${k}`,
                                      { method:'POST', headers:{'Content-Type':'application/json'},
                                      body: JSON.stringify({ contents:[{parts:[{text:'ping'}]}] }) });
                ok = r.ok || r.status===429;
            } else if (provId === 'grok') {
                const r = await fetch('https://api.x.ai/v1/chat/completions', {
                    method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},
                    body: JSON.stringify({ model: modelVal||'grok-3-mini', max_tokens:10, messages:[{role:'user',content:'ping'}] }),
                }); ok = r.ok;
            } else if (provId === 'openai') {
                const r = await fetch('https://api.openai.com/v1/chat/completions', {
                    method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},
                    body: JSON.stringify({ model: modelVal||'gpt-4.1-mini', max_tokens:10, messages:[{role:'user',content:'ping'}] }),
                }); ok = r.ok;
            }
            setKS2(ks => ({...ks, [_id]: ok?'ok':'error'}));
            if (ok) setStatus(s => ({...s, [provId]: 'ok'}));
        } catch { setKS2(ks => ({...ks, [_id]:'error'})); }
    };

    const getProvStatus2 = (provId) => {
        const keyArr = (sProvKeys[provId]||[]).filter(k => k.key?.trim());
        if (keyArr.length === 0) return null;
        const statuses = keyArr.map(k => keyStatuses[k._id]);
        if (statuses.some(s => s==='ok')) return 'ok';
        if (statuses.some(s => s==='debug')) return 'debug';
        if (statuses.every(s => s==='error')) return 'error';
        return null;
    };

    const availableProviders = PROVIDERS.filter(p => {
        const keyArr = (sProvKeys[p.id]||[]).filter(k => k.key?.trim());
        const st = getProvStatus2(p.id);
        return keyArr.length > 0 && st !== 'error';
    }).map(p => p.id);

    return (
        <div className="settings-section-body">
        <SectionTitle icon="⚙️" label={isEn?"SYSTEM":"SYSTÈME"} sub={isEn?"API Keys · Models · Deliberation architecture":"Clés API · Modèles · Architecture de délibération"} />

        {/* ▸ CLÉS API + MODÈLES */}
        <div className={`aria-accordion${openAcc==='keys' ? ' open' : ''}`}>
        {HDR('keys', isEn?'API KEYS & MODELS':'CLÉS API & MODÈLES',
            `${PROVIDERS.filter(p => (sProvKeys[p.id]||[]).some(k=>k.key?.trim())).length}/4 ${isEn?'keys':'clés'}${Object.values(keyStatuses).some(s=>s==='ok') ? ' ✅' : ''}`
        )}
        {openAcc==='keys' && (
            <div className="aria-accordion__body">
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.44rem',
                color:'rgba(140,160,200,0.45)', margin:'0 0 0.8rem', lineHeight:1.6 }}>
                {isEn?"Keys are stored locally (localStorage). Only your browser has access.":"Les clés sont stockées localement (localStorage). Seul votre navigateur y a accès."}
                </p>

                {PROVIDERS.map(prov => {
                    const keyArr = sProvKeys[prov.id] || [];
                    const hasAK  = keyArr.some(k => k.key?.trim());
                    const provOk  = keyArr.some(k => keyStatuses[k._id]==='ok');
                    const provDbg = !provOk && keyArr.some(k => keyStatuses[k._id]==='debug');
                    const provErr = !provOk && !provDbg && hasAK && keyArr.filter(k=>k.key?.trim()).every(k=>keyStatuses[k._id]==='error');
                    const statIcon = provOk?'✅':provDbg?'🐛':provErr?'❌':hasAK?'🔑':'—';
                    const isOpen   = openProvAcc === prov.id;
                    const SUB = { border:`1px solid ${hasAK?'rgba(200,164,74,0.14)':'rgba(255,255,255,0.06)'}`, borderRadius:'2px', overflow:'hidden', marginBottom:'0.45rem', background:hasAK?'rgba(200,164,74,0.02)':'rgba(255,255,255,0.01)' };
                    return (
                        <div key={prov.id} style={SUB}>
                        <button onClick={() => setOpenProvAcc(p => p===prov.id?null:prov.id)}
                        style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem',
                            padding:'0.38rem 0.6rem', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                            <span style={{ fontSize:'0.65rem', color:'rgba(200,164,74,0.50)' }}>{isOpen?'▾':'▸'}</span>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.46rem', letterSpacing:'0.10em',
                                color:isOpen?'rgba(200,164,74,0.88)':'rgba(200,215,240,0.70)', flex:1 }}>{prov.label}</span>
                                {prov.hint && !isOpen && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.36rem', color:'rgba(100,120,160,0.40)' }}>{prov.hint}</span>}
                                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem', marginLeft:'0.4rem',
                                    color:provOk?'rgba(58,191,122,0.80)':provDbg?'rgba(180,140,80,0.80)':provErr?'rgba(200,58,58,0.80)':'rgba(140,160,200,0.35)' }}>{statIcon}</span>
                                    </button>

                                    {isOpen && (
                                        <div style={{ padding:'0.5rem 0.65rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.55rem',
                                            borderTop:`1px solid ${hasAK?'rgba(200,164,74,0.10)':'rgba(255,255,255,0.05)'}` }}>
                                            {prov.hint && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.38rem', color:'rgba(100,120,160,0.50)' }}>{prov.hint}</div>}
                                            {keyArr.map((entry, idx) => {
                                                const st = keyStatuses[entry._id];
                                                const stLbl = st==='ok'?'✅':st==='error'?'❌':st==='testing'?'⏳ …':st==='debug'?'🐛':'';
                                                return (
                                                    <div key={entry._id} style={{ display:'flex', flexDirection:'column', gap:'0.28rem',
                                                        paddingBottom:idx<keyArr.length-1?'0.45rem':0,
                                                        borderBottom:idx<keyArr.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
                                                        <div className="settings-row">
                                                        <button onClick={()=>setSettingsDefault(prov.id, entry._id)}
                                                        title={isEn?'Set as default':'Clé par défaut'}
                                                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem',
                                                            padding:'0 0.15rem', lineHeight:1, opacity:entry.default?1:0.40, flexShrink:0 }}>
                                                            {entry.default?'⭐':'☆'}
                                                            </button>
                                                            <TextInput password value={entry.key}
                                                            onChange={v => updateSettingsKey(prov.id, entry._id, 'key', v)}
                                                            placeholder={prov.placeholder} />
                                                            <button className="settings-btn-test"
                                                            disabled={iaStatus === 'offline'}
                                                            title={iaStatus === 'offline' ? (isEn ? 'No network — test unavailable' : 'Pas de réseau — test indisponible') : undefined}
                                                            onClick={() => testSettingsKey(prov.id, entry._id, entry.key, entry.model)}>
                                                            {isEn?'Test':'Tester'}
                                                            </button>
                                                            {stLbl && (
                                                                <span className={`settings-status`}
                                                                title={st==='debug'?(isEn?'Debug key — correct format, no real API call':'Clé debug — format correct, aucun appel API réel'):undefined}
                                                                style={st==='debug'?{color:'rgba(200,160,60,0.85)',cursor:'help'}:undefined}>
                                                                {stLbl}
                                                                </span>
                                                            )}
                                                            <button title={isEn?'Delete key':'Supprimer'}
                                                            onClick={() => removeSettingsKey(prov.id, entry._id)}
                                                            style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem', opacity:0.45, padding:'0 0.2rem', lineHeight:1 }}>🗑</button>
                                                            </div>
                                                            <div style={{ display:'flex', gap:'0.22rem', flexWrap:'wrap', paddingLeft:'1.6rem' }}>
                                                            {prov.models.map(m => {
                                                                const chosen = entry.model === m.value;
                                                                return (
                                                                    <button key={m.value}
                                                                    style={{ padding:'0.15rem 0.40rem', fontSize:'0.38rem', fontFamily:"'JetBrains Mono',monospace",
                                                                        cursor:'pointer', background:chosen?'rgba(200,164,74,0.08)':'none',
                                                                        border:`1px solid ${chosen?'rgba(200,164,74,0.45)':'rgba(255,255,255,0.10)'}`,
                                                                        color:chosen?'rgba(200,164,74,0.88)':'rgba(140,160,200,0.55)' }}
                                                                        onClick={() => updateSettingsKey(prov.id, entry._id, 'model', m.value)}>
                                                                        {m.value.split('-').slice(-2).join('-')}
                                                                        </button>
                                                                );
                                                            })}
                                                            </div>
                                                            </div>
                                                );
                                            })}
                                            <button onClick={() => addSettingsKey(prov.id)}
                                            style={{ background:'none', border:'1px dashed rgba(200,164,74,0.25)', cursor:'pointer',
                                                color:'rgba(200,164,74,0.60)', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem',
                                                padding:'0.25rem 0.6rem', alignSelf:'flex-start' }}>
                                                + {isEn?'Add a key':'Ajouter une clé'}
                                                </button>
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
