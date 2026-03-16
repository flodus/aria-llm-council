import { useState, useEffect, useRef } from 'react';
import { useLocale, t, loadLang } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../ariaTheme';
import ARIAHeader from './ARIAHeader';
import ContextPanel from './ContextPanel';
import RecapAccordion from './RecapAccordion';
import { getRegimeLabels, getTerrainLabels } from '../services/labels';
import BASE_AGENTS from '../../../../templates/base_agents.json';
import BASE_AGENTS_EN from '../../../../templates/base_agents_en.json';
import { ARIA_FALLBACK_MODELS, ARIA_REGISTRY_URL } from '../../../shared/constants/llmRegistry';

const PROV_LABELS = {
    openrouter: 'OpenRouter',
    claude: 'Claude',
    gemini: 'Gemini',
    grok: 'Grok',
    openai: 'OpenAI'
};

// Helpers localStorage
const loadOpts = () => { try { return JSON.parse(localStorage.getItem('aria_options')||'{}'); } catch { return {}; } };
const loadPreferredModels = () => { try { return JSON.parse(localStorage.getItem('aria_preferred_models')||'{}'); } catch { return {}; } };
const loadIARoles = () => { try { const r = (JSON.parse(localStorage.getItem('aria_options')||'{}')).ia_roles || {}; return r; } catch { return {}; } };
const loadKeys = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); } catch { return {}; } };
const loadKeyStatus = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys_status')||'{}'); } catch { return {}; } };

// ── PreLaunchScreen — constitution editor before world generation ────────────
export default function PreLaunchScreen({ worldName, pendingPreset, pendingDefs, onBack, onLaunch }) {
    const { lang } = useLocale();
    const [plLoading,    setPlLoading]    = useState(true);
    const [plTab,        setPlTab]        = useState('resume');
    const [plCountry,    setPlCountry]    = useState(0);
    const [confirmLaunch, setConfirmLaunch] = useState(false); // dialog récap final

    // ── Constitution commune (base partagée par tous les pays) ────────────────
    const [commonAgents,  setCommonAgents]  = useState(null);
    const [commonMins,    setCommonMins]    = useState(null);             // null = tous actifs
    const [commonPres,    setCommonPres]    = useState(['phare','boussole']);
    const [commonMinsters,setCommonMinsters]= useState(null);             // null = tous actifs

    // ── Overrides par pays : perGov[i] = null (hérite) | { agents, activeMins, activePres, activeMinsters }
    const [perGov, setPerGov] = useState(() => (pendingDefs||[]).map(() => null));

    // ── Getters/setters courants (agissent sur plCountry) ────────────────────
    const curGov = perGov[plCountry];
    const hasOverride = !!curGov;

    // Valeurs effectives pour le pays courant
    const plAgents       = curGov?.agents       ?? commonAgents;
    const activeMins     = curGov?.activeMins    ?? commonMins;
    const activePres     = curGov?.activePres    ?? commonPres;
    const activeMinsters = curGov?.activeMinsters ?? commonMinsters;

    // Setters qui écrivent dans le bon endroit (override si exists, sinon commun)
    const setPlAgents = (fn) => {
        if (hasOverride) setPerGov(p => { const a=[...p]; a[plCountry]={...a[plCountry], agents: typeof fn==='function' ? fn(a[plCountry].agents) : fn}; return a; });
        else setCommonAgents(fn);
    };
        const setActiveMins = (v) => {
            if (hasOverride) setPerGov(p => { const a=[...p]; a[plCountry]={...a[plCountry], activeMins:typeof v==='function'?v(a[plCountry].activeMins):v}; return a; });
            else setCommonMins(v);
        };
            const setActivePres = (v) => {
                if (hasOverride) setPerGov(p => { const a=[...p]; a[plCountry]={...a[plCountry], activePres:typeof v==='function'?v(a[plCountry].activePres):v}; return a; });
                else setCommonPres(v);
            };
                const setActiveMinsters = (v) => {
                    if (hasOverride) setPerGov(p => { const a=[...p]; a[plCountry]={...a[plCountry], activeMinsters:typeof v==='function'?v(a[plCountry].activeMinsters):v}; return a; });
                    else setCommonMinsters(v);
                };

                    // Fork : crée un override pour le pays courant à partir de la constitution commune
                    const forkCountry = () => {
                        setPerGov(p => {
                            if (p[plCountry]) return p; // déjà un override
                            const a = [...p];
                            a[plCountry] = {
                                agents:        JSON.parse(JSON.stringify(commonAgents)),
                                  activeMins:    commonMins,
                                  activePres:    [...commonPres],
                                  activeMinsters: commonMinsters,
                            };
                            return a;
                        });
                    };

                    // Reset override d'un pays → revient à la commune
                    const resetCountryOverride = (i) => {
                        setPerGov(p => { const a=[...p]; a[i]=null; return a; });
                        setSelectedMinistry(null);
                        setSelectedMinister(null);
                    };

                    // New minister/ministry forms
                    const [newMinForm,   setNewMinForm]   = useState(false);
                    const [newMinData,   setNewMinData]   = useState({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
                    const [newMinistryForm, setNewMinistryForm] = useState(false);
                    const [newMinistryData, setNewMinistryData] = useState({ id:'', name:'', emoji:'🏛', color:'#8090C0', mission:'', ministers:[] });
                    const [selectedMinistry, setSelectedMinistry] = useState(null);
                    const [selectedMinister, setSelectedMinister] = useState(null);
                    const scrollRef = useRef(null);
                    // Contexte délibérations par pays (index = index dans pendingDefs)
                    const [plCtxOpen,  setPlCtxOpen]  = useState(null); // index du pays ouvert, ou null
                    const [plCtxModes, setPlCtxModes] = useState(() => (pendingDefs||[]).map(d => d.context_mode || ''));
                    const [plCtxOvrs,  setPlCtxOvrs]  = useState(() => (pendingDefs||[]).map(d => d.contextOverride || ''));
                    // ── Config IA (onglet CONFIG) ─────────────────────────────────────────
                    const loadOpts = () => { try { return JSON.parse(localStorage.getItem('aria_options')||'{}'); } catch { return {}; } };
                    const loadPreferredModels = () => { try { return JSON.parse(localStorage.getItem('aria_preferred_models')||'{}'); } catch { return {}; } };
                    const loadIARoles = () => { try { const r = (JSON.parse(localStorage.getItem('aria_options')||'{}')).ia_roles || {}; return r; } catch { return {}; } };
                    const loadKeys = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); } catch { return {}; } };
                    const loadKeyStatus = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys_status')||'{}'); } catch { return {}; } };
                    const PROV_LABELS = { openrouter:'OpenRouter', claude:'Claude', gemini:'Gemini', grok:'Grok', openai:'OpenAI' };
                    const [modelReg,    setModelReg]    = useState(ARIA_FALLBACK_MODELS);
                    const [regStatus,   setRegStatus]   = useState('idle');
                    const apiKeys = loadKeys();
                    const savedKeyStatus = loadKeyStatus();
                    const availProviders = ['openrouter','claude','gemini','grok','openai'].filter(id => {
                        const v = apiKeys[id];
                        const hasKey = Array.isArray(v)
                        ? v.some(k => (typeof k === 'string' ? k : k?.key)?.trim()?.length > 0)
                        : typeof v === 'string' && v.trim().length > 0;
                        return hasKey && savedKeyStatus[id] !== 'error';
                    });
                    const [ariaMode,    setAriaMode]    = useState(() => {
                        const saved = loadOpts().ia_mode;
                        const keys = loadKeys();
                        const ks = loadKeyStatus();
                        const provCount = ['openrouter','claude','gemini','grok','openai'].filter(id => {
                            const v = keys[id];
                            const hasKey = Array.isArray(v)
                            ? v.some(k => (typeof k === 'string' ? k : k?.key)?.trim()?.length > 0)
                            : typeof v === 'string' && v.trim().length > 0;
                            return hasKey && ks[id] !== 'error';
                        }).length;
                        if (provCount === 0) return 'none';
                        if (!saved || saved === 'none') return provCount === 1 ? 'solo' : 'aria'; // défaut intelligent selon les clés valides
                        if (provCount === 1 && (saved === 'aria' || saved === 'custom')) return 'solo';
                        return saved;
                    });
                    const p0 = availProviders[0] || 'openrouter';
                    const p1 = availProviders[1] || p0;
                    const prefModels = loadPreferredModels();
                    const initRoles = () => {
                        const r = loadIARoles();
                        const opts = loadOpts();
                        const modelOf = (prov) => prefModels[prov] || ARIA_FALLBACK_MODELS[prov]?.find(m=>m.label.includes('★'))?.id || ARIA_FALLBACK_MODELS[prov]?.[0]?.id || '';
                        // Solo : un seul provider pour tous les rôles
                        if (opts.ia_mode === 'solo') {
                            const soloProv  = opts.solo_model || p0;
                            const soloModel = modelOf(soloProv);
                            return {
                                ministre_provider:  soloProv, ministre_model:      soloModel,
                                synthese_min_prov:  soloProv, synthese_min_model:  soloModel,
                                phare_provider:     soloProv, phare_model:         soloModel,
                                boussole_provider:  soloProv, boussole_model:      soloModel,
                                synthese_pres_prov: soloProv, synthese_pres_model: soloModel,
                            };
                        }
                        // Aria/custom : lire les providers par rôle (format Settings : ministre_model = provider)
                        const vp = (p) => availProviders.includes(p) ? p : (availProviders[0] || p); // valide vs providers dispo
                        const ministerProv  = vp(r.ministre_provider  || r.ministre_model || p0);
                        const synthMinProv  = vp(r.synthese_min_prov  || r.synthese_min   || p1);
                        const phareProv     = vp(r.phare_provider     || r.phare_model    || p0);
                        const boussoleProv  = vp(r.boussole_provider  || r.boussole_model || p0);
                        const synthPresProv = vp(r.synthese_pres_prov || r.synthese_pres  || p1);
                        return {
                            ministre_provider:   ministerProv,  ministre_model:      modelOf(ministerProv),
                            synthese_min_prov:   synthMinProv,  synthese_min_model:  modelOf(synthMinProv),
                            phare_provider:      phareProv,     phare_model:         modelOf(phareProv),
                            boussole_provider:   boussoleProv,  boussole_model:      modelOf(boussoleProv),
                            synthese_pres_prov:  synthPresProv, synthese_pres_model: modelOf(synthPresProv),
                        };
                    };
                    const [roles, setRoles] = useState(initRoles);
                    // Accordéons CONFIG
                    const [cfgOpen, setCfgOpen] = useState(''); // '' = fermé par défaut
                    // Registry fetch on mount
                    useEffect(() => {
                        if (ARIA_REGISTRY_URL.includes('REPLACE_WITH')) { setRegStatus('error'); return; }
                        setRegStatus('loading');
                        fetch(ARIA_REGISTRY_URL).then(r => r.ok ? r.json() : Promise.reject())
                        .then(data => { setModelReg({...ARIA_FALLBACK_MODELS, ...data}); setRegStatus('ok'); })
                        .catch(() => setRegStatus('error'));
                    }, []);

                    useEffect(() => {
                        const load = async () => {
                            try {
                                const ov = JSON.parse(localStorage.getItem('aria_agents_override')||'null');
                                if (ov) {
                                    setCommonAgents(ov);
                                    if (ov.active_ministries) setCommonMins(ov.active_ministries);
                                    if (ov.active_presidency) setCommonPres(ov.active_presidency);
                                    if (ov.active_ministers)  setCommonMinsters(ov.active_ministers);
                                    setPlLoading(false); return;
                                }
                                const BASE = loadLang() === 'en' ? BASE_AGENTS_EN : BASE_AGENTS;
                                setCommonAgents(JSON.parse(JSON.stringify(BASE)));
                            } catch { setCommonAgents(null); }
                            setPlLoading(false);
                        };
                        load();
                    }, []);

                    // Rattraper ariaMode 'none' si des clés deviennent disponibles après le premier rendu
                    useEffect(() => {
                        if (ariaMode === 'none' && availProviders.length > 0) {
                            setAriaMode(availProviders.length === 1 ? 'solo' : 'aria');
                        }
                    }, [availProviders.length]);

                    const toggleMinster = (key) => {
                        setActiveMinsters(prev => {
                            const all = Object.keys(plAgents?.ministers || {});
                            const cur = prev || all;
                            const on = cur.includes(key);
                            const next = on ? cur.filter(k => k !== key) : [...cur, key];
                            return next.length === all.length ? null : next;
                        });
                    };

                    const saveAndLaunch = () => {
                        // Sauvegarde constitution commune comme fallback global
                        if (commonAgents) {
                            try {
                                localStorage.setItem('aria_agents_override', JSON.stringify({
                                    ...commonAgents,
                                    active_ministries: commonMins,
                                    active_presidency: commonPres,
                                    active_ministers:  commonMinsters,
                                }));
                            } catch {}
                        }
                        // Save IA config
                        try {
                            const opts = loadOpts();
                            opts.ia_mode = ariaMode;
                            opts.solo_model = roles.ministre_provider || availProviders[0] || 'claude';
                            // ia_roles (format Settings : clé = provider) — seulement pour aria/custom
                            if (ariaMode === 'aria' || ariaMode === 'custom') {
                                opts.ia_roles = {
                                    ...(opts.ia_roles || {}),
                                    ministre_model:  roles.ministre_provider  || availProviders[0] || 'claude',
                                    synthese_min:    roles.synthese_min_prov  || availProviders[0] || 'claude',
                                    phare_model:     roles.phare_provider     || availProviders[0] || 'claude',
                                    boussole_model:  roles.boussole_provider  || availProviders[0] || 'claude',
                                    synthese_pres:   roles.synthese_pres_prov || availProviders[0] || 'claude',
                                };
                            }
                            // Modèles par provider dans ia_models (lu par Settings pour le sélecteur solo)
                            if (!opts.ia_models) opts.ia_models = {};
                            if (roles.ministre_provider  && roles.ministre_model)      opts.ia_models[roles.ministre_provider]  = roles.ministre_model;
                            if (roles.synthese_min_prov  && roles.synthese_min_model)  opts.ia_models[roles.synthese_min_prov]  = roles.synthese_min_model;
                            if (roles.phare_provider     && roles.phare_model)         opts.ia_models[roles.phare_provider]     = roles.phare_model;
                            if (roles.boussole_provider  && roles.boussole_model)      opts.ia_models[roles.boussole_provider]  = roles.boussole_model;
                            if (roles.synthese_pres_prov && roles.synthese_pres_model) opts.ia_models[roles.synthese_pres_prov] = roles.synthese_pres_model;
                            localStorage.setItem('aria_options', JSON.stringify(opts));
                            localStorage.setItem('aria_preferred_models', JSON.stringify({...loadPreferredModels(),
                                ...Object.fromEntries([[roles.ministre_provider, roles.ministre_model],[roles.synthese_min_prov, roles.synthese_min_model],[roles.phare_provider, roles.phare_model],[roles.boussole_provider, roles.boussole_model],[roles.synthese_pres_prov, roles.synthese_pres_model]].filter(([k,v])=>k&&v))
                            }));
                        } catch {}
                        // Merge ctx overrides + perGov overrides dans chaque pendingDef
                        const defs = (pendingDefs || []).map((d, i) => {
                            const gov = perGov[i];
                            return {
                                ...d,
                                context_mode:    plCtxModes[i] || undefined,
                                contextOverride: plCtxOvrs[i]  || undefined,
                                // Override gouvernance par pays si défini
                                ...(gov ? {
                                    governanceOverride: {
                                        agents:           gov.agents,
                                        active_ministries: gov.activeMins,
                                        active_presidency: gov.activePres,
                                        active_ministers:  gov.activeMinsters,
                                    }
                                } : {}),
                            };
                        });
                        onLaunch(pendingPreset, defs);
                    };

                    const resetAgents = () => {
                        localStorage.removeItem('aria_agents_override');
                        setCommonMins(null); setCommonPres(['phare','boussole']); setCommonMinsters(null);
                        setCommonAgents(null); setPlLoading(true);
                        try { const BASE = loadLang() === 'en' ? BASE_AGENTS_EN : BASE_AGENTS; setCommonAgents(JSON.parse(JSON.stringify(BASE))); } catch {} setPlLoading(false);
                        // Reset tous les overrides pays aussi
                        setPerGov((pendingDefs||[]).map(() => null));
                    };

                    const addMinister = () => {
                        if (!newMinData.id || !newMinData.name) return;
                        const id = newMinData.id.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');
                        if (!id) return;
                        setPlAgents(a => ({ ...a, ministers: { ...a.ministers, [id]: { ...newMinData, id, sign:'Custom', weight:1 } } }));
                        setNewMinData({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
                        setNewMinForm(false);
                    };

                    const addMinistry = () => {
                        if (!newMinistryData.id || !newMinistryData.name) return;
                        const id = newMinistryData.id.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');
                        if (!id) return;
                        setPlAgents(a => ({ ...a, ministries: [...a.ministries,
                            { ...newMinistryData, id, keywords:[], questions:[], ministerPrompts:{} }
                        ]}));
                        setNewMinistryData({ id:'', name:'', emoji:'🏛', color:'#8090C0', mission:'', ministers:[] });
                        setNewMinistryForm(false);
                    };

                    const tabStyle = (active) => ({
                        fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.10em',
                        padding:'0.35rem 0.75rem', cursor:'pointer', background:'transparent', border:'none',
                        borderBottom: active ? '2px solid rgba(200,164,74,0.70)' : '2px solid transparent',
                                                  color: active ? 'rgba(200,164,74,0.90)' : 'rgba(140,160,200,0.35)',
                    });

                    const countries = pendingDefs || [];
                    const hasMulti  = countries.length > 1;
                    const GOLD = 'rgba(200,164,74,0.88)';

                    return (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                            gap:'1.2rem', width:'100%', maxWidth:680, padding:'2rem',
                            overflowY:'auto', maxHeight:'calc(100vh - 2rem)', boxSizing:'border-box' }}>
                            <ARIAHeader showQuote={false} />

                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', width:'100%', flexWrap:'wrap', gap:'0.4rem' }}>
                            <div style={labelStyle()}>CONSTITUTION — {worldName}</div>
                            {hasMulti && (
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.35rem' }}>
                                {/* Badges pays */}
                                <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
                                {countries.map((c, i) => {
                                    const isCustom = !!perGov[i];
                                    const nom = c.nom || c.realData?.nom || `Nation ${i+1}`;
                                    const flag = c.realData?.flag || c.realData?.emoji || '🌐';
                                    return (
                                        <button key={i}
                                        style={{ ...BTN_SECONDARY, padding:'0.26rem 0.60rem', fontSize:'0.48rem', position:'relative',
                                            ...(plCountry===i ? { border:'1px solid rgba(200,164,74,0.55)',
                                                color:'rgba(200,164,74,0.95)', background:'rgba(200,164,74,0.10)' } : {
                                                    color:'rgba(180,190,210,0.70)' }) }}
                                                    onClick={() => { setPlCountry(i); setSelectedMinistry(null); setSelectedMinister(null); }}>
                                                    <span style={{ fontSize:'0.65rem', marginRight:'0.25rem' }}>{flag}</span>
                                                    {nom}
                                                    {isCustom && (
                                                        <span style={{ marginLeft:'0.3rem', fontSize:'0.32rem', fontFamily:FONT.mono,
                                                            color:'rgba(100,180,255,0.80)', letterSpacing:'0.05em' }}>✦</span>
                                                    )}
                                                    </button>
                                    );
                                })}
                                </div>
                                {/* Bouton Personnaliser / ↺ Constitution Commune — sous les badges, aligné à droite */}
                                {!hasOverride ? (
                                    <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.50rem',
                                        color:'rgba(100,180,255,0.70)', border:'1px solid rgba(100,180,255,0.22)' }}
                                        onClick={forkCountry}>
                                        ✦ {lang==='en' ? 'Customize this country' : 'Personnaliser ce pays'}
                                        </button>
                                ) : (
                                    <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.50rem',
                                        color:'rgba(200,80,80,0.55)', border:'1px solid rgba(200,80,80,0.22)' }}
                                        onClick={() => resetCountryOverride(plCountry)}>
                                        ↺ {lang==='en' ? 'Common Constitution' : 'Constitution Commune'}
                                        </button>
                                )}
                                </div>
                            )}
                            </div>

                            {/* Tabs + bandeau statut inline */}
                            <div style={{ display:'flex', alignItems:'center', gap:0, borderBottom:'1px solid rgba(200,164,74,0.10)', width:'100%' }}>
                            {[
                                {id:'resume',     fr:'RÉSUMÉ',     en:'SUMMARY'   },
                                {id:'presidency', fr:'PRÉSIDENCE', en:'PRESIDENCY'},
                                {id:'ministries', fr:'MINISTÈRES', en:'MINISTRIES'},
                                {id:'ministers',  fr:'MINISTRES',  en:'MINISTERS' },
                            ].map(tab => (
                                <button key={tab.id} style={tabStyle(plTab===tab.id)}
                                onClick={() => { setPlTab(tab.id); if(scrollRef.current) scrollRef.current.scrollTop=0; }}>
                                {tab[lang] || tab.fr}
                                </button>
                            ))}
                            {/* Statut constitution — décalé après les onglets */}
                            {(() => {
                                const countryName = countries[plCountry]?.nom || countries[plCountry]?.realData?.nom || `Nation ${plCountry + 1}`;
                                return hasOverride ? (
                                    <span style={{ marginLeft:'2.5rem', fontFamily:FONT.mono, fontSize:'0.40rem',
                                        letterSpacing:'0.10em', color:'rgba(100,180,255,0.90)', whiteSpace:'nowrap',
                                                      fontWeight:600 }}>
                                                      ✦ {lang==='en' ? `INDEPENDENT — ${countryName.toUpperCase()}` : `CONSTITUTION INDÉPENDANTE — ${countryName.toUpperCase()}`}
                                                      </span>
                                ) : (
                                    <span style={{ marginLeft:'2.5rem', fontFamily:FONT.mono, fontSize:'0.40rem',
                                        letterSpacing:'0.10em', color:'rgba(200,164,74,0.60)', whiteSpace:'nowrap' }}>
                                        ◈ {lang==='en' ? 'COMMON CONSTITUTION' : 'CONSTITUTION COMMUNE'}
                                        </span>
                                );
                            })()}
                            </div>

                            {plLoading && <div style={{ fontFamily:FONT.mono, fontSize:'0.48rem',
                                color:'rgba(200,164,74,0.50)', padding:'1.5rem', textAlign:'center' }}>{lang==='en'?'Loading…':'Chargement…'}</div>}

                                {!plLoading && plAgents && (
                                    <div ref={scrollRef} style={{ width:'100%', overflowY:'auto', maxHeight:'64vh',
                                        display:'flex', flexDirection:'column', gap:'0.55rem' }}>

                                        {/* ── RÉSUMÉ ──────────────────────────────────────────────── */}
                                        {plTab === 'resume' && (<>
                                            {/* Contexte délibérations — 1 accordéon groupé */}
                                            {(pendingDefs||[]).length > 0 && (
                                                <div className={`aria-accordion${plCtxOpen!=null ? ' open' : ''}`}>
                                                {/* Header groupe */}
                                                <button className="aria-accordion__hdr"
                                                onClick={() => setPlCtxOpen(p => p!=null ? null : 0)}>
                                                <span className="aria-accordion__arrow">{plCtxOpen!=null ? '▾' : '▸'}</span>
                                                <span className="aria-accordion__label">{t('CONTEXT', lang)}</span>
                                                <span className="aria-accordion__badge">{pendingDefs.length} {lang==='en'?'countries':'pays'}</span>
                                                </button>
                                                {/* Onglets pays + contenu */}
                                                {plCtxOpen != null && (
                                                    <div style={{ padding:'0 0.65rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                                                    {pendingDefs.length > 1 && (
                                                        <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap' }}>
                                                        {pendingDefs.map((def, i) => (
                                                            <button key={i}
                                                            style={{ ...BTN_SECONDARY, fontSize:'0.40rem', padding:'0.16rem 0.45rem',
                                                                ...(plCtxOpen===i ? { border:'1px solid rgba(200,164,74,0.40)',
                                                                    color:'rgba(200,164,74,0.85)', background:'rgba(200,164,74,0.08)' } : {}) }}
                                                                    onClick={() => setPlCtxOpen(i)}>
                                                                    {def.realData?.flag || def.realData?.emoji || '🌐'} {def.nom || def.realData?.nom || `Nation ${i+1}`}
                                                                    </button>
                                                        ))}
                                                        </div>
                                                    )}
                                                    {pendingDefs.map((def, i) => plCtxOpen === i && (
                                                        <ContextPanel key={i}
                                                        countryName={def.nom || def.realData?.nom || `Nation ${i+1}`}
                                                        open={true}
                                                        onToggle={() => {}}
                                                        mode={plCtxModes[i] || ''}
                                                        setMode={v => setPlCtxModes(p => { const a=[...p]; a[i]=v; return a; })}
                                                        override={plCtxOvrs[i] || ''}
                                                        setOverride={v => setPlCtxOvrs(p => { const a=[...p]; a[i]=v; return a; })}
                                                        embedded={true}
                                                        />
                                                    ))}
                                                    </div>
                                                )}
                                                </div>
                                            )}

                                            {/* ── MODE IA (accordéon) ──────────────────────────────────── */}
                                            {[
                                                { id:'ia', label:'⚡ MODE IA',
                                                    badge: ariaMode === 'none' ? 'BOARD GAME' : ariaMode === 'solo' ? 'SOLO' : ariaMode === 'custom' ? 'CUSTOM' : 'ARIA',
                                                    content: (
                                                        <div style={{ padding:'0.5rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.55rem' }}>
                                                        {availProviders.length === 0 && (
                                                            <div style={{ fontSize:'0.40rem', color:'rgba(200,100,60,0.70)',
                                                                fontFamily:FONT.mono, padding:'0.10rem 0.1rem', lineHeight:1.5 }}>
                                                                {lang==='en'
                                                                    ? '⚠ No API key configured — only Board Game mode available'
                                                        : '⚠ Aucune clé API configurée — seul le mode Board Game est disponible'}
                                                        </div>
                                                        )}
                                                        <div style={{ display:'flex', gap:'0.35rem' }}>
                                                        {[
                                                            { id:'aria',   label:'ARIA — Multi-agent complet' },
                                                            { id:'solo',   label: t('INIT_SOLO_LABEL', lang) },
                                                              { id:'custom', label: t('INIT_CUSTOM_LABEL', lang) },
                                                              { id:'none',   label:'🎲 Board Game' },
                                                        ].filter(m => {
                                                            if (availProviders.length === 0) return m.id === 'none';
                                                            if (ariaMode === 'none') return m.id === 'none';
                                                            if (availProviders.length === 1) return m.id === 'solo' || m.id === 'none';
                                                            return true;
                                                        }).map(m => (
                                                            <button key={m.id}
                                                            style={{ ...BTN_SECONDARY, flex:1, fontSize:'0.40rem', padding:'0.28rem 0.4rem',
                                                                ...(ariaMode===m.id ? { border:'1px solid rgba(200,164,74,0.50)',
                                                                    color:'rgba(200,164,74,0.90)', background:'rgba(200,164,74,0.08)' } : {}) }}
                                                                    onClick={() => setAriaMode(m.id)}>
                                                                    {m.label}
                                                                    </button>
                                                        ))}
                                                        </div>
                                                        {ariaMode === 'none' && (
                                                            <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                                                            <div style={{ fontSize:'0.40rem', color:'rgba(140,160,200,0.40)',
                                                                fontFamily:FONT.mono, padding:'0.10rem 0.1rem', lineHeight:1.5 }}>
                                                                {lang==='en'
                                                                    ? 'Pre-written local responses — no API key needed'
                                                        : 'Réponses locales pré-écrites — sans clé API'}
                                                        </div>
                                                        {availProviders.length > 0 && (
                                                            <button onClick={() => setAriaMode(availProviders.length === 1 ? 'solo' : 'aria')}
                                                            style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                                                                fontFamily:FONT.mono, fontSize:'0.40rem',
                                                                color:'rgba(140,160,200,0.45)', textDecoration:'underline', textAlign:'left' }}>
                                                                {lang==='en' ? '↺ Enable AI mode' : '↺ Activer le mode IA'}
                                                                </button>
                                                        )}
                                                        </div>
                                                        )}
                                                        {(ariaMode === 'aria' || ariaMode === 'custom') && (
                                                            <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                                                            {[
                                                                { provKey:'ministre_provider',  modelKey:'ministre_model',  label:'Ministre' },
                                                                { provKey:'synthese_min_prov',  modelKey:'synthese_min_model', label: t('INIT_SYNTH_MIN', lang) },
                                                                                                            { provKey:'phare_provider',     modelKey:'phare_model',     label:'Phare ☉' },
                                                                                                            { provKey:'boussole_provider',  modelKey:'boussole_model',  label:'Boussole ☽' },
                                                                                                            { provKey:'synthese_pres_prov', modelKey:'synthese_pres_model', label: t('INIT_SYNTH_PRES', lang) },
                                                            ].map(({ provKey, modelKey, label }) => {
                                                                const prov = roles[provKey] || availProviders[0] || 'openrouter';
                                                                const models = modelReg[prov] || ARIA_FALLBACK_MODELS[prov] || [];
                                                                return (
                                                                    <div key={provKey} style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr', gap:'0.3rem', alignItems:'center' }}>
                                                                    <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(140,160,200,0.50)' }}>{label}</span>
                                                                    <select style={{ ...SELECT_STYLE, fontSize:'0.40rem', padding:'0.2rem 0.4rem' }}
                                                                    value={prov}
                                                                    onChange={e => setRoles(r => ({ ...r, [provKey]: e.target.value,
                                                                        [modelKey]: modelReg[e.target.value]?.[0]?.id || '' }))}>
                                                                        {availProviders.map(p => <option key={p} value={p}>{PROV_LABELS[p]||p}</option>)}
                                                                        </select>
                                                                        <select style={{ ...SELECT_STYLE, fontSize:'0.40rem', padding:'0.2rem 0.4rem' }}
                                                                        value={roles[modelKey] || ''}
                                                                        onChange={e => setRoles(r => ({ ...r, [modelKey]: e.target.value }))}>
                                                                        {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                                                        </select>
                                                                        </div>
                                                                );
                                                            })}
                                                            </div>
                                                        )}
                                                        {ariaMode === 'solo' && (
                                                            availProviders.length === 1 ? (
                                                                // Un seul provider : cartouche provider + cartouche buttons modèle
                                                                <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                                                                <div style={{ display:'flex', gap:'0.3rem', alignItems:'center', flexWrap:'wrap' }}>
                                                                <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                                                                    color:'rgba(200,164,74,0.70)', letterSpacing:'0.10em',
                                                                                           borderLeft:'2px solid rgba(200,164,74,0.35)', paddingLeft:'0.4rem',
                                                                                           textTransform:'uppercase' }}>
                                                                                           {PROV_LABELS[p0] || p0}
                                                                                           </span>
                                                                                           {(modelReg[p0] || []).map(m => {
                                                                                               const chosen = (roles.ministre_model || '') === m.id;
                                                                                               return (
                                                                                                   <button key={m.id}
                                                                                                   style={{ ...BTN_SECONDARY, padding:'0.18rem 0.45rem', fontSize:'0.40rem',
                                                                                                       ...(chosen ? { border:'1px solid rgba(200,164,74,0.45)', color:'rgba(200,164,74,0.88)', background:'rgba(200,164,74,0.08)' } : { opacity:0.50 }) }}
                                                                                                       onClick={() => setRoles(r => ({ ...r,
                                                                                                           ministre_model: m.id, synthese_min_model: m.id,
                                                                                                           phare_model: m.id, boussole_model: m.id, synthese_pres_model: m.id,
                                                                                                       }))}>
                                                                                                       {m.label}
                                                                                                       </button>
                                                                                               );
                                                                                           })}
                                                                                           </div>
                                                                                           </div>
                                                            ) : (
                                                                // Multi-provider : selects provider + modèle
                                                                <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr', gap:'0.3rem', alignItems:'center' }}>
                                                                <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(140,160,200,0.50)' }}>{t('INIT_MODEL_LABEL', lang)}</span>
                                                                <select style={{ ...SELECT_STYLE, fontSize:'0.40rem', padding:'0.2rem 0.4rem' }}
                                                                value={roles.ministre_provider || availProviders[0] || 'openrouter'}
                                                                onChange={e => setRoles(r => ({ ...r,
                                                                    ministre_provider: e.target.value, synthese_min_prov: e.target.value,
                                                                    phare_provider: e.target.value, boussole_provider: e.target.value, synthese_pres_prov: e.target.value,
                                                                    ministre_model: modelReg[e.target.value]?.[0]?.id || '',
                                                                }))}>
                                                                {availProviders.map(p => <option key={p} value={p}>{PROV_LABELS[p]||p}</option>)}
                                                                </select>
                                                                <select style={{ ...SELECT_STYLE, fontSize:'0.40rem', padding:'0.2rem 0.4rem' }}
                                                                value={roles.ministre_model || ''}
                                                                onChange={e => setRoles(r => ({ ...r,
                                                                    ministre_model: e.target.value, synthese_min_model: e.target.value,
                                                                    phare_model: e.target.value, boussole_model: e.target.value, synthese_pres_model: e.target.value,
                                                                }))}>
                                                                {(modelReg[roles.ministre_provider] || []).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                                                </select>
                                                                </div>
                                                            )
                                                        )}
                                                        </div>
                                                    )
                                                },
                                            ].map(acc => (
                                                <div key={acc.id} className={`aria-accordion${cfgOpen===acc.id ? ' open' : ''}`}>
                                                <button className="aria-accordion__hdr"
                                                onClick={() => setCfgOpen(p => p===acc.id ? '' : acc.id)}>
                                                <span className="aria-accordion__arrow">{cfgOpen===acc.id ? '▾' : '▸'}</span>
                                                <span className="aria-accordion__label">{acc.label}</span>
                                                {acc.badge && <span className="aria-accordion__badge">{acc.badge}</span>}
                                                </button>
                                                {cfgOpen===acc.id && (
                                                    <div className="aria-accordion__body">
                                                    {acc.content}
                                                    </div>
                                                )}
                                                </div>
                                            ))}

                                            {/* Présidence active */}
                                            <div style={{ ...CARD_STYLE }}>
                                            <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.5rem' }}>{t('ACTIVE_PRESIDENCY',lang)}</div>
                                            <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
                                            {['phare','boussole'].map(key => {
                                                const p = plAgents.presidency?.[key]; if (!p) return null;
                                                const on = activePres.includes(key);
                                                return (
                                                    <button key={key}
                                                    style={{ flex:1, padding:'0.5rem 0.6rem', cursor:'pointer', borderRadius:'2px',
                                                        background: on ? 'rgba(200,164,74,0.06)' : 'rgba(255,255,255,0.01)',
                                                        border: `1px solid ${on ? 'rgba(200,164,74,0.40)' : 'rgba(255,255,255,0.06)'}`,
                                                        display:'flex', flexDirection:'column', gap:'0.15rem', textAlign:'left' }}
                                                        onClick={() => setActivePres(prev =>
                                                            on ? prev.filter(k=>k!==key) : [...prev, key])}>
                                                            <div style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                                                                color: on ? 'rgba(200,164,74,0.85)' : 'rgba(140,160,200,0.35)' }}>
                                                                {p.symbol} {p.name} {on ? '✓' : '○'}
                                                                </div>
                                                                <div style={{ fontSize:'0.40rem',
                                                                    color: on ? 'rgba(140,160,200,0.55)' : 'rgba(100,120,160,0.30)',
                                                        lineHeight:1.4 }}>{p.subtitle}</div>
                                                        </button>
                                                );
                                            })}
                                            </div>
                                            {activePres.length === 0 && (
                                                <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                                                    color:'rgba(200,100,60,0.55)', padding:'0.3rem' }}>
                                                    ⚠ Aucun président actif — le Conseil délibère sans arbitrage présidentiel
                                                    </div>
                                            )}
                                            </div>

                                            {/* Ministères actifs */}
                                            <div style={{ ...CARD_STYLE }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                                            <div style={labelStyle('0.42rem')}>{t('ACTIVE_MINISTRIES',lang)}</div>
                                            <button style={{ ...BTN_SECONDARY, fontSize:'0.40rem', padding:'0.18rem 0.5rem' }}
                                            onClick={() => setActiveMins(null)}>
                                            Tous
                                            </button>
                                            </div>
                                            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.28rem' }}>
                                            {plAgents.ministries.map(m => {
                                                const on = activeMins === null || activeMins.includes(m.id);
                                                return (
                                                    <button key={m.id}
                                                    style={{ ...BTN_SECONDARY, padding:'0.22rem 0.55rem', fontSize:'0.42rem',
                                                        ...(on ? { border:'1px solid '+m.color+'77', color:m.color, background:m.color+'14' } : {}) }}
                                                        onClick={() => {
                                                            const all = plAgents.ministries.map(x=>x.id);
                                                            const cur = activeMins || all;
                                                            const next = on ? cur.filter(id=>id!==m.id) : [...cur, m.id];
                                                            setActiveMins(next.length === all.length ? null : next);
                                                        }}>
                                                        {m.emoji} {m.name}
                                                        </button>
                                                );
                                            })}
                                            </div>
                                            {(activeMins && activeMins.length === 0) && (
                                                <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                                                    color:'rgba(200,100,60,0.55)', marginTop:'0.3rem' }}>
                                                    ⚠ Aucun ministère actif — seule la présidence arbitrera
                                                    </div>
                                            )}
                                            </div>

                                            {/* Ministres toggleables dans résumé */}
                                            <div style={{ ...CARD_STYLE }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.40rem' }}>
                                            <div style={labelStyle('0.42rem')}>MINISTRES ACTIFS</div>
                                            <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.38rem' }}
                                            onClick={() => setActiveMinsters(null)}>Tous</button>
                                            </div>
                                            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.25rem' }}>
                                            {Object.entries(plAgents.ministers).map(([key, min]) => {
                                                const allKeys = Object.keys(plAgents.ministers);
                                                const on = activeMinsters === null || activeMinsters.includes(key);
                                                return (
                                                    <button key={key}
                                                    style={{ ...BTN_SECONDARY, padding:'0.18rem 0.46rem', fontSize:'0.40rem',
                                                        ...(on ? { border:'1px solid '+min.color+'88', color:min.color, background:min.color+'14' } : { opacity:0.40 }) }}
                                                        onClick={() => toggleMinster(key)}>
                                                        {min.emoji} {min.name} {on ? '' : '○'}
                                                        </button>
                                                );
                                            })}
                                            </div>
                                            </div>

                                            <div style={{ fontSize:'0.40rem', color:'rgba(140,160,200,0.28)',
                                                fontFamily:FONT.mono, textAlign:'center' }}>
                                                {t('HINT_TABS',lang)}
                                                </div>
                                                </>)}

                                                {/* ── PRÉSIDENCE ──────────────────────────────────────────── */}
                                                {plTab === 'presidency' && (
                                                    <div style={{ ...CARD_STYLE }}>
                                                    {/* Active toggles en haut */}
                                                    <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.7rem' }}>
                                                    {['phare','boussole'].map(key => {
                                                        const p = plAgents.presidency?.[key]; if (!p) return null;
                                                        const on = activePres.includes(key);
                                                        return (
                                                            <button key={key}
                                                            style={{ ...BTN_SECONDARY, flex:1, padding:'0.28rem 0.6rem', fontSize:'0.44rem',
                                                                ...(on ? { border:'1px solid rgba(200,164,74,0.50)', color:GOLD,
                                                                    background:'rgba(200,164,74,0.08)' } : {}) }}
                                                                    onClick={() => setActivePres(prev => on ? prev.filter(k=>k!==key) : [...prev, key])}>
                                                                    {p.symbol} {p.name} {on ? '● ACTIF' : '○ INACTIF'}
                                                                    </button>
                                                        );
                                                    })}
                                                    </div>
                                                    {['phare','boussole'].map(key => {
                                                        const p = plAgents.presidency?.[key]; if (!p) return null;
                                                        const on = activePres.includes(key);
                                                        return (
                                                            <div key={key} style={{ marginBottom:'0.9rem', opacity: on ? 1 : 0.45 }}>
                                                            <div style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                                                                color:'rgba(200,164,74,0.72)', marginBottom:'0.3rem' }}>
                                                                {p.symbol} {p.name.toUpperCase()} — {p.subtitle}
                                                                </div>
                                                                {/* Nom custom */}
                                                                <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                                                                    color:'rgba(90,110,150,0.42)', marginBottom:'0.15rem' }}>NOM</div>
                                                                    <input style={{ ...INPUT_STYLE, fontSize:'0.46rem', marginBottom:'0.35rem' }}
                                                                    value={p.name}
                                                                    onChange={e => setPlAgents(a => ({...a, presidency:{...a.presidency,
                                                                        [key]:{...a.presidency[key], name:e.target.value}}}))}
                                                                        />
                                                                        <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                                                                            color:'rgba(90,110,150,0.42)', marginBottom:'0.15rem' }}>ESSENCE</div>
                                                                            <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'48px',
                                                                                resize:'vertical', fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5 }}
                                                                                value={p.essence}
                                                                                onChange={e => setPlAgents(a => ({...a, presidency:{...a.presidency,
                                                                                    [key]:{...a.presidency[key], essence:e.target.value}}}))}
                                                                                    />
                                                                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                                                                                        color:'rgba(90,110,150,0.42)', margin:'0.28rem 0 0.15rem' }}>RÔLE ÉTENDU</div>
                                                                                        <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'48px',
                                                                                            resize:'vertical', fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5 }}
                                                                                            value={p.role_long}
                                                                                            onChange={e => setPlAgents(a => ({...a, presidency:{...a.presidency,
                                                                                                [key]:{...a.presidency[key], role_long:e.target.value}}}))}
                                                                                                />
                                                                                                </div>
                                                        );
                                                    })}
                                                    </div>
                                                )}

                                                {/* ── MINISTÈRES ──────────────────────────────────────────── */}
                                                {plTab === 'ministries' && (() => {
                                                    const BASE_IDS = ['justice','economie','defense','sante','education','ecologie','chance'];
                                                    const toggleMinById = (id) => {
                                                        const all = plAgents.ministries.map(x=>x.id);
                                                        const cur = activeMins || all;
                                                        const on  = cur.includes(id);
                                                        const next = on ? cur.filter(x=>x!==id) : [...cur, id];
                                                        setActiveMins(next.length === all.length ? null : next);
                                                    };
                                                    const handleGridClickMin = (id) => {
                                                        if (selectedMinistry !== id) {
                                                            setSelectedMinistry(id); // 1er clic : focus, ordre inchangé
                                                        } else {
                                                            const on = activeMins===null || activeMins.includes(id);
                                                            if (on) { toggleMinById(id); setSelectedMinistry(null); }
                                                            else    { toggleMinById(id); }
                                                        }
                                                    };
                                                    const isMinOn = (id) => activeMins===null || activeMins.includes(id);
                                                    // Grille : actifs d'abord, inactifs en bas — focus ne déplace PAS dans la grille
                                                    const gridMins = [
                                                        ...plAgents.ministries.filter(m => isMinOn(m.id)),
                                                                            ...plAgents.ministries.filter(m => !isMinOn(m.id)),
                                                    ];
                                                    // Liste détaillée : focused en tête, puis le reste (actifs, puis inactifs)
                                                    const sortedMins = [
                                                        ...plAgents.ministries.filter(m => m.id === selectedMinistry),
                                                                            ...plAgents.ministries.filter(m => m.id !== selectedMinistry && isMinOn(m.id)),
                                                                            ...plAgents.ministries.filter(m => m.id !== selectedMinistry && !isMinOn(m.id)),
                                                    ];
                                                    return (<>
                                                    {/* 1. Hint */}
                                                    <p style={{ fontFamily:FONT.mono, fontSize:'0.36rem', fontStyle:'italic',
                                                        color:'rgba(100,120,165,0.28)', margin:'0 0 0.05rem', lineHeight:1.9,
                                                            letterSpacing:'0.06em', textAlign:'center', userSelect:'none',
                                                            borderBottom:'1px solid rgba(255,255,255,0.03)', paddingBottom:'0.35rem' }}>
                                                            {lang==='en'
                                                                ? '↑ click to focus · click active again to deactivate · click inactive again to activate'
                                                    : '↑ cliquer pour cibler · recliquer un actif pour désactiver · recliquer un inactif pour activer'}
                                                    </p>

                                                    {/* 2. Grille */}
                                                    <div style={{ ...CARD_STYLE }}>
                                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.45rem' }}>
                                                    <div style={labelStyle('0.42rem')}>{plAgents.ministries.length} {lang==='en'?'MINISTRIES':'MINISTÈRES'}</div>
                                                    <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.38rem' }}
                                                    onClick={() => { setActiveMins(null); setSelectedMinistry(null); }}>
                                                    {lang==='en'?'All active':'Tous actifs'}
                                                    </button>
                                                    </div>
                                                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.28rem' }}>
                                                    {gridMins.map(m => {
                                                        const on  = isMinOn(m.id);
                                                        const sel = selectedMinistry === m.id;
                                                        return (
                                                            <div key={m.id}
                                                            onClick={() => handleGridClickMin(m.id)}
                                                            style={{ display:'flex', alignItems:'center', gap:'0.28rem',
                                                                padding:'0.26rem 0.50rem', borderRadius:'3px', cursor:'pointer',
                                                                background: sel ? m.color+'38' : on ? m.color+'18' : 'rgba(8,14,26,0.60)',
                                                                border: sel ? `2px solid ${m.color}EE` : on ? `1px solid ${m.color}70` : '1px solid rgba(140,160,200,0.10)',
                                                                transition:'all 0.13s',
                                                                boxShadow: sel ? `0 0 12px ${m.color}44, inset 0 0 6px ${m.color}10` : on ? `0 0 6px ${m.color}22` : 'none' }}>
                                                                <span style={{ fontSize:'0.85rem', filter: on ? `drop-shadow(0 0 4px ${m.color}88)` : 'grayscale(1)', opacity: on ? 1 : 0.28, transition:'all 0.13s' }}>{m.emoji}</span>
                                                                <span style={{ fontFamily:FONT.mono, fontSize:'0.41rem',
                                                                    color: sel ? m.color : on ? m.color+'CC' : 'rgba(140,160,200,0.28)', transition:'all 0.13s',
                                                                textShadow: (sel || on) ? `0 0 8px ${m.color}66` : 'none' }}>{m.name}</span>
                                                                </div>
                                                        );
                                                    })}
                                                    </div>
                                                    {(activeMins?.length === 0) && (
                                                        <p style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(200,100,60,0.55)', margin:'0.3rem 0 0' }}>
                                                        ⚠ {lang==='en'?'No active ministry — presidency only':'Aucun ministère actif — seule la présidence arbitrera'}
                                                        </p>
                                                    )}
                                                    </div>

                                                    {/* 3. Bloc + Nouveau ministère */}
                                                    {newMinistryForm ? (
                                                        <div style={{ ...CARD_STYLE, border:'1px solid rgba(100,160,255,0.22)' }}>
                                                        <div style={{ ...labelStyle('0.42rem'), color:'rgba(100,160,255,0.70)', marginBottom:'0.5rem' }}>
                                                        + {lang==='en'?'NEW MINISTRY':'NOUVEAU MINISTÈRE'}
                                                        </div>
                                                        <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr', gap:'0.5rem', marginBottom:'0.4rem' }}>
                                                        <input style={{ ...INPUT_STYLE, width:'2.5rem', textAlign:'center', fontSize:'1rem' }}
                                                        value={newMinistryData.emoji} onChange={e => setNewMinistryData(d=>({...d,emoji:e.target.value}))} placeholder="🏛" />
                                                        <input style={{ ...INPUT_STYLE, fontSize:'0.50rem' }}
                                                        value={newMinistryData.name} onChange={e => setNewMinistryData(d=>({...d,name:e.target.value}))}
                                                        placeholder={t('MINISTRY_NAME', lang)} />
                                                        <input style={{ ...INPUT_STYLE, fontSize:'0.50rem' }}
                                                        value={newMinistryData.id} onChange={e => setNewMinistryData(d=>({...d,id:e.target.value}))}
                                                        placeholder="id_unique" />
                                                        </div>
                                                        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.4rem' }}>
                                                        <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(140,160,200,0.45)' }}>{lang==='en'?'Color':'Couleur'}</span>
                                                        <input type="color" value={newMinistryData.color}
                                                        style={{ width:'2rem', height:'1.4rem', border:'none', background:'none', cursor:'pointer' }}
                                                        onChange={e => setNewMinistryData(d=>({...d,color:e.target.value}))} />
                                                        </div>
                                                        <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'40px', resize:'vertical',
                                                            fontSize:'0.42rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.4rem' }}
                                                            value={newMinistryData.mission} onChange={e => setNewMinistryData(d=>({...d,mission:e.target.value}))}
                                                            placeholder={t('MINISTRY_MISSION', lang)} />
                                                            <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end' }}>
                                                            <button style={BTN_SECONDARY} onClick={() => setNewMinistryForm(false)}>{lang==='en'?'Cancel':'Annuler'}</button>
                                                            <button style={{ ...BTN_PRIMARY, opacity: newMinistryData.name&&newMinistryData.id ? 1 : 0.35 }}
                                                            disabled={!newMinistryData.name||!newMinistryData.id} onClick={addMinistry}>
                                                            {lang==='en'?'Add →':'Ajouter →'}
                                                            </button>
                                                            </div>
                                                            </div>
                                                    ) : (
                                                        <button style={{ ...BTN_SECONDARY, width:'100%', fontSize:'0.44rem',
                                                            color:'rgba(100,160,255,0.55)', border:'1px solid rgba(100,160,255,0.20)' }}
                                                            onClick={() => setNewMinistryForm(true)}>
                                                            + {lang==='en'?'New ministry':'Nouveau ministère'}
                                                            </button>
                                                    )}

                                                    {/* 4. Liste détaillée — toujours toutes visibles */}
                                                    {sortedMins.map(ministry => {
                                                        const mi   = plAgents.ministries.findIndex(x=>x.id===ministry.id);
                                                        const on   = isMinOn(ministry.id);
                                                        const sel  = selectedMinistry === ministry.id;
                                                        const allMinKeys = Object.keys(plAgents.ministers);
                                                        return (
                                                            <div key={ministry.id} style={{ ...CARD_STYLE,
                                                                border: sel
                                                                ? `1px solid ${ministry.color}55`
                                                                : `1px solid rgba(255,255,255,0.07)`,
                                                                transition:'border 0.15s, box-shadow 0.15s',
                                                                boxShadow: sel ? `0 0 12px ${ministry.color}14` : 'none' }}>
                                                                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.45rem' }}>
                                                                <span style={{ fontSize:'0.9rem' }}>{ministry.emoji}</span>
                                                                <div style={{ fontFamily:FONT.mono, fontSize:'0.45rem',
                                                                    letterSpacing:'0.09em', color: on ? ministry.color+'CC' : 'rgba(140,160,200,0.35)', flex:1 }}>
                                                                    {ministry.name.toUpperCase()}
                                                                    </div>
                                                                    {/* Cartouche actif/inactif */}
                                                                    <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.42rem',
                                                                        ...(on ? { border:'1px solid '+ministry.color+'55', color:ministry.color, background:ministry.color+'0E' }
                                                                        : { border:'1px solid rgba(200,80,80,0.25)', color:'rgba(200,80,80,0.55)' }) }}
                                                                        onClick={() => toggleMinById(ministry.id)}>
                                                                        {on ? '● actif' : '○ inactif'}
                                                                        </button>
                                                                        {!BASE_IDS.includes(ministry.id) && (
                                                                            <button style={{ background:'none', border:'none', cursor:'pointer',
                                                                                color:'rgba(200,80,80,0.35)', fontSize:'0.75rem', lineHeight:1, padding:0 }}
                                                                                onClick={() => { setPlAgents(a=>({...a, ministries:a.ministries.filter((_,i)=>i!==mi)})); setSelectedMinistry(null); }}>✕</button>
                                                                        )}
                                                                        </div>
                                                                        <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>MISSION</div>
                                                                        <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'34px', resize:'vertical',
                                                                            fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.40rem',
                                                                            ...(!on ? { opacity:0.35, cursor:'not-allowed' } : {}) }}
                                                                            readOnly={!on} value={ministry.mission}
                                                                            onChange={e => on && setPlAgents(a=>({...a,
                                                                                ministries:a.ministries.map((m,i)=>i===mi?{...m,mission:e.target.value}:m)}))} />
                                                                                <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.20rem' }}>MINISTRES</div>
                                                                                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.24rem', marginBottom:'0.40rem' }}>
                                                                                {allMinKeys.map(mkey => {
                                                                                    const min = plAgents.ministers[mkey];
                                                                                    const isIn = ministry.ministers.includes(mkey);
                                                                                    return (
                                                                                        <button key={mkey} disabled={!on}
                                                                                        style={{ ...BTN_SECONDARY, padding:'0.17rem 0.44rem', fontSize:'0.39rem',
                                                                                            ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}),
                                                                                            ...(isIn&&on ? { border:'1px solid '+min.color+'88', color:min.color, background:min.color+'16' } : {}) }}
                                                                                            onClick={() => on && setPlAgents(a=>({...a,
                                                                                                ministries:a.ministries.map((m,i)=>i!==mi?m:{
                                                                                                    ...m, ministers:isIn?m.ministers.filter(k=>k!==mkey):[...m.ministers,mkey]
                                                                                                })}))}>
                                                                                                {min.emoji} {min.name}
                                                                                                </button>
                                                                                    );
                                                                                })}
                                                                                </div>
                                                                                {ministry.ministers.length > 0 && (<>
                                                                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.20rem' }}>PROMPTS MINISTÉRIELS</div>
                                                                                    {ministry.ministers.map(mkey => {
                                                                                        const min = plAgents.ministers[mkey];
                                                                                        return (
                                                                                            <div key={mkey} style={{ marginBottom:'0.30rem' }}>
                                                                                            <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:min.color+'AA', marginBottom:'0.10rem' }}>
                                                                                            {min.emoji} {min.name}
                                                                                            </div>
                                                                                            <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'30px', resize:'vertical',
                                                                                                fontSize:'0.39rem', fontFamily:FONT.mono, lineHeight:1.48,
                                                                                                ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}) }}
                                                                                                readOnly={!on} value={ministry.ministerPrompts?.[mkey]||''}
                                                                                                onChange={e => on && setPlAgents(a=>({...a,
                                                                                                    ministries:a.ministries.map((m,i)=>i!==mi?m:{
                                                                                                        ...m, ministerPrompts:{...(m.ministerPrompts||{}),[mkey]:e.target.value}
                                                                                                    })}))} />
                                                                                                    </div>
                                                                                        );
                                                                                    })}
                                                                                    </>)}
                                                                                    </div>
                                                        );
                                                    })}
                                                    </>);
                                                })()}

                                                {/* ── MINISTRES ───────────────────────────────────────────── */}
                                                {plTab === 'ministers' && (() => {
                                                    const allEntries = Object.entries(plAgents.ministers);
                                                    const isMinsterOn = (k) => activeMinsters===null || activeMinsters.includes(k);
                                                    const handleGridClickMinster = (key) => {
                                                        if (selectedMinister !== key) {
                                                            setSelectedMinister(key); // 1er clic : focus, ordre inchangé
                                                        } else {
                                                            const on = isMinsterOn(key);
                                                            if (on) { toggleMinster(key); setSelectedMinister(null); }
                                                            else    { toggleMinster(key); }
                                                        }
                                                    };
                                                    // Grille : actifs d'abord, inactifs en bas — focus ne déplace PAS dans la grille
                                                    const gridMinsters = [
                                                        ...allEntries.filter(([k]) => isMinsterOn(k)),
                                                                           ...allEntries.filter(([k]) => !isMinsterOn(k)),
                                                    ];
                                                    // Liste détaillée : focused en tête, puis le reste (actifs, puis inactifs)
                                                    const sortedMinsters = [
                                                        ...allEntries.filter(([k]) => k === selectedMinister),
                                                                           ...allEntries.filter(([k]) => k !== selectedMinister && isMinsterOn(k)),
                                                                           ...allEntries.filter(([k]) => k !== selectedMinister && !isMinsterOn(k)),
                                                    ];
                                                    return (<>
                                                    {/* 1. Hint */}
                                                    <p style={{ fontFamily:FONT.mono, fontSize:'0.36rem', fontStyle:'italic',
                                                        color:'rgba(100,120,165,0.28)', margin:'0 0 0.05rem', lineHeight:1.9,
                                                            letterSpacing:'0.06em', textAlign:'center', userSelect:'none',
                                                            borderBottom:'1px solid rgba(255,255,255,0.03)', paddingBottom:'0.35rem' }}>
                                                            {lang==='en'
                                                                ? '↑ click to focus · click active again to deactivate · click inactive again to activate'
                                                    : '↑ cliquer pour cibler · recliquer un actif pour désactiver · recliquer un inactif pour activer'}
                                                    </p>

                                                    {/* 2. Grille */}
                                                    <div style={{ ...CARD_STYLE }}>
                                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.45rem' }}>
                                                    <div style={labelStyle('0.42rem')}>{allEntries.length} {lang==='en'?'MINISTERS':'MINISTRES'}</div>
                                                    <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.38rem' }}
                                                    onClick={() => { setActiveMinsters(null); setSelectedMinister(null); }}>
                                                    {lang==='en'?'All active':'Tous actifs'}
                                                    </button>
                                                    </div>
                                                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.28rem' }}>
                                                    {gridMinsters.map(([key, min]) => {
                                                        const on  = isMinsterOn(key);
                                                        const sel = selectedMinister === key;
                                                        return (
                                                            <div key={key}
                                                            onClick={() => handleGridClickMinster(key)}
                                                            style={{ display:'flex', alignItems:'center', gap:'0.28rem',
                                                                padding:'0.26rem 0.50rem', borderRadius:'3px', cursor:'pointer',
                                                                background: sel ? min.color+'38' : on ? min.color+'18' : 'rgba(8,14,26,0.60)',
                                                                border: sel ? `2px solid ${min.color}EE` : on ? `1px solid ${min.color}70` : '1px solid rgba(140,160,200,0.10)',
                                                                transition:'all 0.13s',
                                                                boxShadow: sel ? `0 0 8px ${min.color}33` : on ? `0 0 4px ${min.color}18` : 'none' }}>
                                                                <span style={{ fontSize:'0.85rem', filter: on ? `drop-shadow(0 0 3px ${min.color}66)` : 'grayscale(1)', opacity: on ? 1 : 0.28, transition:'all 0.13s' }}>{min.emoji}</span>
                                                                <span style={{ fontFamily:FONT.mono, fontSize:'0.41rem',
                                                                    color: sel ? min.color : on ? min.color+'CC' : 'rgba(140,160,200,0.28)', transition:'all 0.13s',
                                                                textShadow: sel ? `0 0 6px ${min.color}55` : 'none' }}>{min.name}</span>
                                                                {min.sign === 'Custom' && (
                                                                    <span style={{ fontFamily:FONT.mono, fontSize:'0.28rem',
                                                                        color:'rgba(140,160,200,0.22)', marginLeft:'0.1rem' }}>custom</span>
                                                                )}
                                                                </div>
                                                        );
                                                    })}
                                                    </div>
                                                    </div>

                                                    {/* 3. Bloc + Nouveau ministre */}
                                                    {newMinForm ? (
                                                        <div style={{ ...CARD_STYLE, border:'1px solid rgba(100,200,120,0.22)' }}>
                                                        <div style={{ ...labelStyle('0.42rem'), color:'rgba(100,200,120,0.70)', marginBottom:'0.5rem' }}>
                                                        + {lang==='en'?'NEW MINISTER':'NOUVEAU MINISTRE'}
                                                        </div>
                                                        <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr auto', gap:'0.45rem',
                                                            marginBottom:'0.4rem', alignItems:'center' }}>
                                                            <input style={{ ...INPUT_STYLE, width:'2.2rem', textAlign:'center', fontSize:'1rem' }}
                                                            value={newMinData.emoji} onChange={e => setNewMinData(d=>({...d,emoji:e.target.value}))} placeholder="🌟" />
                                                            <input style={{ ...INPUT_STYLE, fontSize:'0.48rem' }}
                                                            value={newMinData.name} onChange={e => setNewMinData(d=>({...d,name:e.target.value}))}
                                                            placeholder={lang==='en'?'Minister name':'Nom du ministre'} />
                                                            <input style={{ ...INPUT_STYLE, fontSize:'0.48rem' }}
                                                            value={newMinData.id} onChange={e => setNewMinData(d=>({...d,id:e.target.value}))}
                                                            placeholder="id_unique" />
                                                            <input type="color" value={newMinData.color}
                                                            style={{ width:'2rem', height:'1.8rem', border:'none', background:'none', cursor:'pointer' }}
                                                            onChange={e => setNewMinData(d=>({...d,color:e.target.value}))} />
                                                            </div>
                                                            <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'36px', resize:'vertical',
                                                                fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.35rem' }}
                                                                value={newMinData.essence} onChange={e => setNewMinData(d=>({...d,essence:e.target.value}))}
                                                                placeholder={t('CONST_ESSENCE_PH', lang)} />
                                                                <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'28px', resize:'vertical',
                                                                    fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.4rem' }}
                                                                    value={newMinData.comm} onChange={e => setNewMinData(d=>({...d,comm:e.target.value}))}
                                                                    placeholder={lang==='en'?'Communication style…':'Style de communication…'} />
                                                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(90,110,150,0.42)', marginBottom:'0.12rem' }}>
                                                                    {lang==='en'?'ANNOTATION ANGLE':'ANGLE D\'ANNOTATION'}
                                                                    <span style={{ fontWeight:'normal', color:'rgba(90,110,150,0.32)' }}> — {lang==='en'?'inter-ministerial question':'question posée lors des annotations inter-ministérielles'}</span>
                                                                    </div>
                                                                    <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'26px', resize:'vertical',
                                                                        fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.4rem' }}
                                                                        value={newMinData.annotation} onChange={e => setNewMinData(d=>({...d,annotation:e.target.value}))}
                                                                        placeholder={lang==='en'?"E.g. What is the minister's position on…":"Ex : Quelle est la position du ministre sur l'équilibre entre…"} />
                                                                        <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end' }}>
                                                                        <button style={BTN_SECONDARY} onClick={() => setNewMinForm(false)}>{lang==='en'?'Cancel':'Annuler'}</button>
                                                                        <button style={{ ...BTN_PRIMARY, opacity: newMinData.name&&newMinData.id ? 1 : 0.35 }}
                                                                        disabled={!newMinData.name||!newMinData.id} onClick={addMinister}>
                                                                        {lang==='en'?'Add →':'Ajouter →'}
                                                                        </button>
                                                                        </div>
                                                                        </div>
                                                    ) : (
                                                        <button style={{ ...BTN_SECONDARY, width:'100%', fontSize:'0.44rem',
                                                            color:'rgba(100,200,120,0.50)', border:'1px solid rgba(100,200,120,0.18)' }}
                                                            onClick={() => setNewMinForm(true)}>
                                                            + {lang==='en'?'New minister':'Nouveau ministre'}
                                                            </button>
                                                    )}

                                                    {/* 4. Liste détaillée — toujours toutes visibles */}
                                                    {sortedMinsters.map(([key, min]) => {
                                                        const on  = isMinsterOn(key);
                                                        const sel = selectedMinister === key;
                                                        return (
                                                            <div key={key} style={{ ...CARD_STYLE,
                                                                border: sel
                                                                ? `1px solid ${min.color}55`
                                                                : `1px solid rgba(255,255,255,0.07)`,
                                                                transition:'border 0.15s, box-shadow 0.15s',
                                                                boxShadow: sel ? `0 0 12px ${min.color}14` : 'none' }}>
                                                                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                                                                <input style={{ ...INPUT_STYLE, width:'2.2rem', textAlign:'center', fontSize:'1rem',
                                                                    ...(!on ? { opacity:0.35, cursor:'not-allowed' } : {}) }}
                                                                    readOnly={!on} value={min.emoji}
                                                                    onChange={e => on && setPlAgents(a=>({...a,
                                                                        ministers:{...a.ministers,[key]:{...a.ministers[key],emoji:e.target.value}}}))} />
                                                                        <input style={{ ...INPUT_STYLE, flex:1, fontSize:'0.48rem',
                                                                            ...(!on ? { opacity:0.35, cursor:'not-allowed' } : {}) }}
                                                                            readOnly={!on} value={min.name}
                                                                            onChange={e => on && setPlAgents(a=>({...a,
                                                                                ministers:{...a.ministers,[key]:{...a.ministers[key],name:e.target.value}}}))} />
                                                                                <input type="color" value={min.color} disabled={!on}
                                                                                style={{ width:'1.8rem', height:'1.6rem', border:'none', background:'none',
                                                                                    cursor: on ? 'pointer' : 'not-allowed', opacity: on ? 1 : 0.3 }}
                                                                                    onChange={e => on && setPlAgents(a=>({...a,
                                                                                        ministers:{...a.ministers,[key]:{...a.ministers[key],color:e.target.value}}}))} />
                                                                                        {/* Cartouche actif/inactif */}
                                                                                        <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.42rem', flexShrink:0,
                                                                                            ...(on ? { border:'1px solid '+min.color+'55', color:min.color, background:min.color+'0E' }
                                                                                            : { border:'1px solid rgba(200,80,80,0.25)', color:'rgba(200,80,80,0.55)' }) }}
                                                                                            onClick={() => toggleMinster(key)}>
                                                                                            {on ? '● actif' : '○ inactif'}
                                                                                            </button>
                                                                                            {min.sign === 'Custom' && (
                                                                                                <button style={{ background:'none', border:'none', cursor:'pointer',
                                                                                                    color:'rgba(200,80,80,0.35)', fontSize:'0.75rem', lineHeight:1, padding:0 }}
                                                                                                    onClick={() => { setPlAgents(a => { const m={...a.ministers}; delete m[key]; return {...a,ministers:m}; });
                                                                                                    setSelectedMinister(null); }}>✕</button>
                                                                                            )}
                                                                                            </div>
                                                                                            <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>ESSENCE</div>
                                                                                            <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'36px', resize:'vertical',
                                                                                                fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.28rem',
                                                                                                ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}) }}
                                                                                                readOnly={!on} value={min.essence||''}
                                                                                                onChange={e => on && setPlAgents(a=>({...a,
                                                                                                    ministers:{...a.ministers,[key]:{...a.ministers[key],essence:e.target.value}}}))} />
                                                                                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>
                                                                                                    {lang==='en'?'COMMUNICATION STYLE':'STYLE DE COMMUNICATION'}
                                                                                                    </div>
                                                                                                    <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'28px', resize:'vertical',
                                                                                                        fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5,
                                                                                                        ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}) }}
                                                                                                        readOnly={!on} value={min.comm||''}
                                                                                                        onChange={e => on && setPlAgents(a=>({...a,
                                                                                                            ministers:{...a.ministers,[key]:{...a.ministers[key],comm:e.target.value}}}))} />
                                                                                                            <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)',
                                                                                                                marginBottom:'0.14rem', marginTop:'0.22rem' }}>
                                                                                                                {lang==='en'?'ANNOTATION ANGLE':'ANGLE D\'ANNOTATION'}
                                                                                                                <span style={{ fontWeight:'normal', opacity:0.55 }}> — {lang==='en'?'inter-ministerial question':'question inter-ministérielle'}</span>
                                                                                                                </div>
                                                                                                                <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'26px', resize:'vertical',
                                                                                                                    fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5,
                                                                                                                    ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}) }}
                                                                                                                    readOnly={!on} value={min.annotation||''}
                                                                                                                    onChange={e => on && setPlAgents(a=>({...a,
                                                                                                                        ministers:{...a.ministers,[key]:{...a.ministers[key],annotation:e.target.value}}}))} />
                                                                                                                        </div>
                                                        );
                                                    })}
                                                    </>);
                                                })()}
                                                </div>
                                )}

                                {!plLoading && !plAgents && (
                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.46rem',
                                        color:'rgba(200,80,80,0.55)', textAlign:'center', padding:'1rem' }}>
                                        ⚠ Impossible de charger les agents. Lancement avec les défauts du moteur.
                                        </div>
                                )}

                                <div style={{ display:'flex', gap:'0.6rem', width:'100%', justifyContent:'space-between' }}>
                                <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK',lang)}</button>
                                <div style={{ display:'flex', gap:'0.5rem' }}>
                                <button style={{ ...BTN_SECONDARY, fontSize:'0.44rem',
                                    color:'rgba(200,80,80,0.50)', border:'1px solid rgba(200,80,80,0.20)' }}
                                    onClick={resetAgents}>{lang==='en'?'↺ Default':'↺ Défaut'}</button>
                                    <button style={BTN_PRIMARY} onClick={() => setConfirmLaunch(true)}>
                                    {t('GENERATE',lang)}
                                    </button>
                                    </div>
                                    </div>

                                    {/* ── Dialog récap final avant génération ── */}
                                    {confirmLaunch && (
                                        <div style={{ position:'fixed', inset:0, background:'rgba(4,8,18,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}
                                        onClick={() => setConfirmLaunch(false)}>
                                        <div style={{ background:'rgba(8,14,26,0.98)', border:'1px solid rgba(200,164,74,0.30)',
                                            borderRadius:'4px', maxWidth:480, width:'92%', display:'flex', flexDirection:'column',
                                            gap:'1.1rem', padding:'1.8rem', boxShadow:'0 8px 40px rgba(0,0,0,0.7)' }}
                                            onClick={e => e.stopPropagation()}>
                                            <div style={{ fontFamily:FONT.mono, fontSize:'0.58rem', letterSpacing:'0.18em', color:'rgba(200,164,74,0.90)' }}>
                                            ⚖ {lang==='en' ? 'WORLD SUMMARY' : 'RÉCAPITULATIF DU MONDE'}
                                            </div>
                                            <RecapAccordion
                                            pendingDefs={pendingDefs}
                                            perGov={perGov}
                                            commonAgents={commonAgents}
                                            commonMins={commonMins}
                                            commonPres={commonPres}
                                            commonMinsters={commonMinsters}
                                            lang={lang}
                                            ctxModes={plCtxModes}
                                            ctxOvrs={plCtxOvrs}
                                            />
                                            <div style={{ display:'flex', gap:'0.6rem', justifyContent:'flex-end' }}>
                                            <button style={{ ...BTN_SECONDARY, fontSize:'0.46rem' }} onClick={() => setConfirmLaunch(false)}>
                                            {lang==='en' ? '← Edit' : '← Modifier'}
                                            </button>
                                            <button style={{ ...BTN_PRIMARY, fontSize:'0.46rem' }} onClick={() => { setConfirmLaunch(false); saveAndLaunch(); }}>
                                            {lang==='en' ? 'GENERATE WORLD →' : 'GÉNÉRER LE MONDE →'}
                                            </button>
                                            </div>
                                            </div>
                                            </div>
                                    )}
                                    </div>
                    );
}
