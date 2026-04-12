// src/features/settings/components/SectionConstitution.jsx
// SECTION CONSTITUTION — Architecture de délibération, ADN global, prompts de synthèse

import { useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { getOptions, saveOptions } from '../../../shared/config/options';
import { SectionTitle, Field, TextArea, Select, Toggle, SaveBadge } from '../ui/SettingsUI';
import { useAccordion } from '../../../shared/hooks/useAccordion';
import { DEFAULT_PROMPTS, getPrompts, savePrompts } from '../utils/settingsStorage';
import { loadCustomProviders, loadCustomModels } from '../../../shared/services';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDERS = [
    { id:'claude',      label:'Anthropic — Claude',   models:[{value:'claude-opus-4-6',label:'opus-4-6'},{value:'claude-sonnet-4-6',label:'sonnet-4-6'},{value:'claude-haiku-4-5-20251001',label:'haiku-4-5'}] },
    { id:'gemini',      label:'Google — Gemini',       models:[{value:'gemini-2.5-pro-preview-05-06',label:'2.5-pro-preview'},{value:'gemini-2.0-flash',label:'2.0-flash'},{value:'gemini-1.5-pro',label:'1.5-pro'},{value:'gemini-1.5-flash',label:'1.5-flash'}] },
    { id:'grok',        label:'xAI — Grok',            models:[{value:'grok-3',label:'grok-3'},{value:'grok-3-mini',label:'grok-3-mini'}] },
    { id:'openai',      label:'OpenAI — GPT',          models:[{value:'gpt-4.1',label:'gpt-4.1'},{value:'gpt-4.1-mini',label:'gpt-4.1-mini'},{value:'o4-mini',label:'o4-mini'}] },
    { id:'openrouter',  label:'OpenRouter',            models:[{value:'anthropic/claude-sonnet-4-5',label:'Claude Sonnet 4.5'},{value:'google/gemini-2.0-flash',label:'Gemini 2.0 Flash'},{value:'x-ai/grok-3-mini',label:'Grok 3 Mini'},{value:'openai/gpt-4.1-mini',label:'GPT-4.1 Mini'},{value:'meta-llama/llama-4-scout',label:'Llama 4 Scout'},{value:'mistralai/mistral-small-3.1',label:'Mistral Small 3.1'}] },
];

export default function SectionConstitution() {
    const { lang } = useLocale();
    const isEn = lang === 'en';
    const [prompts, setPrompts] = useState(() => getPrompts());
    const [opts, setOpts]       = useState(() => getOptions());
    const [saved, setSaved]     = useState(false);
    const { ouvert: openAcc, basculer: toggleAcc } = useAccordion();

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

    const HDR = (key, label, badge) => (
        <button className="aria-accordion__hdr" onClick={() => toggleAcc(key)}>
        <span className="aria-accordion__arrow">{openAcc===key?'▾':'▸'}</span>
        <span className="aria-accordion__label">{label}</span>
        {badge && <span className="aria-accordion__badge">{badge}</span>}
        </button>
    );

    const customProviders = loadCustomProviders().filter(p => p.endpoint?.trim());
    const customProvidersAsProviders = customProviders.map(p => ({ id: p.id, label: p.label, models: p.model ? [{ value: p.model, label: p.model }] : [] }));
    const savedCustomModels = loadCustomModels();
    const allProviders = [...PROVIDERS, ...customProvidersAsProviders].map(p => ({
      ...p,
      models: [...p.models, ...(savedCustomModels[p.id] || []).map(m => ({ value: m.id, label: m.label }))],
    }));
    const anyKey = !!(opts.api_keys?.claude || opts.api_keys?.gemini || opts.api_keys?.grok || opts.api_keys?.openai || opts.api_keys?.openrouter || customProviders.length > 0);
    const iaMode = opts.ia_mode;
    const keyStatusSaved = (() => { try { return JSON.parse(localStorage.getItem('aria_api_keys_status') || '{}'); } catch { return {}; } })();
    const availableProviders = allProviders.filter(p => {
      if (customProviders.find(c => c.id === p.id)) return true; // custom = toujours disponible
      return !!opts.api_keys?.[p.id] && keyStatusSaved[p.id] !== 'error';
    }).map(p => p.id);

    const parsePromptParts = (text) => {
        const jsonStart = text.indexOf('Format JSON');
        if (jsonStart === -1) return { body: text, json: null };
        return { body: text.slice(0, jsonStart).trim(), json: text.slice(jsonStart).trim() };
    };

    const SYNTH_ENTRIES = [
        { key: 'synthese_ministere',  label: t('SETTINGS_SYNTH_MIN_LABEL', lang),  hint: t('SECT_CONST_SYNTH_MIN_HINT', lang) },
        { key: 'synthese_presidence', label: t('SECT_CONST_PRES_SYNTH', lang),      hint: t('SECT_CONST_PRES_SYNTH_HINT', lang) },
        { key: 'factcheck_evenement', label: t('SECT_CONST_FACTCHECK_LBL', lang),   hint: t('SECT_CONST_FACTCHECK_HINT', lang) },
    ];

    return (
        <div className="settings-section-body">
        <SectionTitle icon="📜" label="CONSTITUTION" sub={t('SECT_CONST_SECTION_SUB', lang)} />

        {/* ▸ ARCHITECTURE DE DÉLIBÉRATION */}
        <div className={`aria-accordion${openAcc==='arch' ? ' open' : ''}`}>
        {HDR('arch', t('SECT_CONST_ARCH_HDR', lang))}
        {openAcc==='arch' && (
            <div className="aria-accordion__body">
            <Field label="Mode IA">
            {!anyKey ? (
                <div style={{ padding:'0.65rem 0.9rem', background:'rgba(200,164,74,0.04)',
                    border:'1px solid rgba(200,164,74,0.12)', borderRadius:'2px',
                        fontFamily:"'JetBrains Mono',monospace", fontSize:'0.47rem',
                        color:'rgba(200,164,74,0.60)', lineHeight:1.7 }}>
                        <div style={{ fontWeight:700, marginBottom:'0.3rem', letterSpacing:'0.12em' }}>{t('SECT_CONST_OFFLINE_TITLE', lang)}</div>
                        {t('SECT_CONST_OFFLINE_DESC', lang)}
                        </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                <div className="settings-radio-group">
                {[
                    { value:'aria',   label:'ARIA',                              desc:t('SECT_CONST_MODE_ARIA_DESC', lang)   },
                 { value:'solo',   label:'Solo',                              desc:t('SECT_CONST_MODE_SOLO_DESC', lang)   },
                 { value:'custom', label:t('SECT_CONST_MODE_CUSTOM', lang),   desc:t('SECT_CONST_MODE_CUSTOM_DESC', lang) },
                 { value:'none',   label:'🎲 Board Game',                     desc:t('SECT_CONST_MODE_BOARD_DESC', lang)  },
                ].filter(m => {
                    if (availableProviders.length === 0) return m.value === 'none';
                    if (iaMode === 'none') return m.value === 'none';
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
                {iaMode === 'none' && availableProviders.length > 0 && (
                    <button onClick={() => updateOpts('ia_mode', availableProviders.length === 1 ? 'solo' : 'aria')}
                    style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                        fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem',
                        color:'rgba(140,160,200,0.45)', textDecoration:'underline', textAlign:'left' }}>
                        {t('SECT_CONST_ENABLE_AI', lang)}
                        </button>
                )}
                {iaMode === 'solo' && (
                    <div style={{ paddingLeft:'0.8rem' }}>
                    <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>{t('SECT_CONST_SOLO_HDR', lang)}</div>
                    {availableProviders.length === 1 ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace",
                            fontSize:'0.42rem', letterSpacing:'0.10em',
                            color:'rgba(200,164,74,0.70)', textTransform:'uppercase',
                                                        borderLeft:'2px solid rgba(200,164,74,0.35)', paddingLeft:'0.4rem' }}>
                                                        {allProviders.find(p => p.id === availableProviders[0])?.label.split('—')[1]?.trim() || availableProviders[0]}
                                                        </span>
                                                        <div style={{ display:'flex', gap:'0.22rem', flexWrap:'wrap' }}>
                                                        {(allProviders.find(p => p.id === availableProviders[0])?.models || []).map(m => {
                                                            const soloModel = opts.ia_models?.[availableProviders[0]] || allProviders.find(p => p.id === availableProviders[0])?.models[0]?.value;
                                                            const chosen = soloModel === m.value;
                                                            return (
                                                                <button key={m.value}
                                                                style={{ background: chosen ? 'rgba(200,164,74,0.08)' : 'none',
                                                                    border:`1px solid ${chosen ? 'rgba(200,164,74,0.45)' : 'rgba(255,255,255,0.10)'}`,
                                                                    color: chosen ? 'rgba(200,164,74,0.88)' : 'rgba(140,160,200,0.55)',
                                                                    cursor:'pointer', padding:'0.18rem 0.45rem', fontSize:'0.40rem',
                                                                    fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.05em',
                                                                    opacity: chosen ? 1 : 0.55 }}
                                                                    onClick={() => updateOpts(`ia_models.${availableProviders[0]}`, m.value)}>
                                                                    {m.label.split('—')[0]?.trim()}
                                                                    </button>
                                                            );
                                                        })}
                                                        </div>
                                                        </div>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem' }}>
                        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                        {allProviders.map(p => {
                            const disabled = !opts.api_keys?.[p.id] && !customProviders.find(c => c.id === p.id);
                            return (
                                <label key={p.id} className={`settings-radio-card${opts.solo_model===p.id?' selected':''}${disabled?' disabled':''}`}
                                style={{ opacity:disabled?0.30:1, cursor:disabled?'not-allowed':'pointer', flex:'0 0 auto', padding:'0.3rem 0.8rem' }}>
                                <input type="radio" name="solo_model" value={p.id} disabled={disabled}
                                checked={opts.solo_model===p.id} onChange={() => !disabled && updateOpts('solo_model', p.id)} />
                                <span className="settings-radio-label" style={{ textTransform:'uppercase' }}>{p.label.split('—')[1]?.trim() || p.id}</span>
                                {disabled && <span style={{ fontSize:'0.36rem', color:'rgba(200,80,80,0.55)', marginLeft:'0.3rem' }}>⚠</span>}
                                </label>
                            );
                        })}
                        </div>
                        {(() => {
                            const soloProvId = opts.solo_model || availableProviders[0];
                            const soloProvDef = allProviders.find(p => p.id === soloProvId);
                            const soloModel = opts.ia_models?.[soloProvId] || soloProvDef?.models[0]?.value;
                            return (
                                <div style={{ display:'flex', gap:'0.22rem', flexWrap:'wrap' }}>
                                {(soloProvDef?.models || []).map(m => {
                                    const chosen = soloModel === m.value;
                                    return (
                                        <button key={m.value}
                                        style={{ background: chosen ? 'rgba(200,164,74,0.08)' : 'none',
                                            border:`1px solid ${chosen ? 'rgba(200,164,74,0.45)' : 'rgba(255,255,255,0.10)'}`,
                                            color: chosen ? 'rgba(200,164,74,0.88)' : 'rgba(140,160,200,0.55)',
                                            cursor:'pointer', padding:'0.18rem 0.45rem', fontSize:'0.40rem',
                                            fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.05em',
                                            opacity: chosen ? 1 : 0.55 }}
                                            onClick={() => updateOpts(`ia_models.${soloProvId}`, m.value)}>
                                            {m.label.split('—')[0]?.trim()}
                                            </button>
                                    );
                                })}
                                </div>
                            );
                        })()}
                        </div>
                    )}
                    </div>
                )}
                {iaMode === 'aria' && (
                    <div style={{ paddingLeft:'0.8rem' }}>
                    <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>{t('SECT_CONST_DELIB_HDR', lang)}</div>
                    {[
                        { key:'ministre_model',    label:t('SECT_CONST_MINISTERS_THINK', lang) },
                        { key:'synthese_min',      label:t('SETTINGS_SYNTH_MIN_LABEL', lang) },
                        { key:'chroniqueur_model', label:t('SECT_CONST_CHRONICLER', lang) },
                    ].map(r => (
                        <div key={r.key} className="settings-role-row">
                        <span className="settings-role-label">{r.label}</span>
                        <Select value={opts.ia_roles?.[r.key] || 'claude'} onChange={v => updateOpts(`ia_roles.${r.key}`, v)}
                        options={availableProviders.map(pid => ({ value:pid, label:allProviders.find(p=>p.id===pid)?.label.split('—')[1]?.trim()||allProviders.find(p=>p.id===pid)?.label||pid }))} />
                        </div>
                    ))}
                    </div>
                )}
                {iaMode === 'custom' && (
                    <div style={{ paddingLeft:'0.8rem' }}>
                    <div className="settings-group-title" style={{ fontSize:'0.42rem', marginBottom:'0.45rem' }}>{t('SECT_CONST_ROLE_ASSIGN_HDR', lang)}</div>
                    {[
                        { key:'ministre_model',     label:t('SECT_CONST_MINISTER_INCARN', lang) },
                        { key:'synthese_min',        label:t('SETTINGS_SYNTH_MIN_LABEL', lang) },
                        { key:'phare_model',         label:t('SECT_CONST_LIGHTHOUSE', lang) },
                        { key:'boussole_model',      label:t('SECT_CONST_COMPASS', lang) },
                        { key:'synthese_pres',       label:t('SECT_CONST_PRES_SYNTH', lang) },
                        { key:'evenement_model',     label:t('SECT_CONST_NARRATIVE_EVT', lang) },
                        { key:'factcheck_model',     label:'Fact-check' },
                        { key:'chroniqueur_model',   label:t('SECT_CONST_CHRONICLER', lang) },
                    ].map(r => (
                        <div key={r.key} className="settings-role-row">
                        <span className="settings-role-label">{r.label}</span>
                        <Select value={opts.ia_roles?.[r.key] || 'claude'} onChange={v => updateOpts(`ia_roles.${r.key}`, v)}
                        options={availableProviders.map(pid => ({ value:pid, label:allProviders.find(p=>p.id===pid)?.label.split('—')[1]?.trim()||allProviders.find(p=>p.id===pid)?.label||pid }))} />
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
        {HDR('adn', t('SECT_CONST_ADN_HDR', lang))}
        {openAcc==='adn' && (
            <div className="aria-accordion__body">
            <Field label={t('SECT_CONST_SYS_PROMPT_LBL', lang)} hint={t('SECT_CONST_SYS_PROMPT_HINT', lang)}>
            <TextArea value={prompts.global_system} onChange={v => update('global_system', v)} />
            <button className="settings-btn-reset" onClick={() => reset('global_system')}>{t('SETTINGS_RESET', lang)}</button>
            </Field>
            <Field label={t('SECT_CONST_SYNTH_TONE_LBL', lang)} hint={t('SECT_CONST_SYNTH_TONE_HINT', lang)}>
            <TextArea value={prompts.ton_synthese} onChange={v => update('ton_synthese', v)} />
            <button className="settings-btn-reset" onClick={() => reset('ton_synthese')}>{t('SETTINGS_RESET', lang)}</button>
            </Field>
            <Field label={t('SECT_CONST_GEOP_CTX_LBL', lang)} hint={t('SECT_CONST_GEOP_CTX_HINT', lang)}>
            <TextArea value={prompts.contexte_mondial} onChange={v => update('contexte_mondial', v)} />
            <button className="settings-btn-reset" onClick={() => reset('contexte_mondial')}>{t('SETTINGS_RESET', lang)}</button>
            </Field>
            </div>
        )}
        </div>

        {/* ▸ PROMPTS ARIA — SYNTHÈSE */}
        <div className={`aria-accordion${openAcc==='prompts' ? ' open' : ''}`}>
        {HDR('prompts', t('SECT_CONST_PROMPTS_HDR', lang), t('SECT_CONST_READONLY_BADGE', lang))}
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
                {t('SECT_CONST_PROMPTS_DESC1', lang)}
                {t('SECT_CONST_PROMPTS_DESC2', lang)}
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
                                    }}>{t('SECT_CONST_READONLY_LOCK', lang)}</span>
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
                                            {t('SECT_CONST_FORMAT_LBL', lang)}
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
        <button className="settings-save-btn" onClick={save}>{t('SETTINGS_SAVE', lang)}</button>
        <SaveBadge saved={saved} />
        </div>
        </div>
    );
}
