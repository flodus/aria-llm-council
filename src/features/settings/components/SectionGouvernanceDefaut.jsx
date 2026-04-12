// src/features/settings/components/SectionGouvernanceDefaut.jsx
// Sous-composant : Gouvernance par défaut (ministères actifs, présidence, destinée)

import { useState, useMemo } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { getOptions } from '../../../shared/config/options';
import { getAgentsEffectifs, sauvegarderEmojiAgent, getEmojiOverrides } from '../../../shared/utils/agentsOverrides';
import { getDestin } from '../../council/services/agentsManager';
import PresidencyTiles from '../../../shared/components/PresidencyTiles';
import ContextModeSelector from '../../../shared/components/ContextModeSelector';
import ChroniqueurToggle from '../../../shared/components/ChroniqueurToggle';
import { Field, Toggle } from '../ui/SettingsUI';
import { useAccordion } from '../../../shared/hooks/useAccordion';

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITAIRES LOCAUX
// ─────────────────────────────────────────────────────────────────────────────

function getAllMinistryIds() {
    return getAgentsEffectifs().ministries.map(m => m.id);
}

function getMinistryMeta() {
    const agents = getAgentsEffectifs();
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

function getDefaultGovernance() {
    return {
        presidency: 'duale',
        ministries: getAgentsEffectifs().ministries.filter(m => m.base).map(m => m.id),
    };
}

export default function SectionGouvernanceDefaut({ opts, setOpts }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';
    const gov = opts.defaultGovernance || getDefaultGovernance();
    const { ouvert: openAcc, basculer: toggleAcc } = useAccordion();
    const [emojiVersion, setEmojiVersion] = useState(0);

    const emojiOv = getEmojiOverrides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const presSymbols = useMemo(() => ({
        phare:    emojiOv.presidency?.phare    || '☉',
        boussole: emojiOv.presidency?.boussole || '☽',
        trinaire: emojiOv.presidency?.trinaire || '★',
    }), [emojiVersion]);

    const handleEditEmojiPres = (presId, emoji) => {
        sauvegarderEmojiAgent('presidency', presId, emoji);
        setEmojiVersion(v => v + 1);
    };

    const setGov = (key, val) => {
        setOpts({ ...opts, defaultGovernance: { ...(opts.defaultGovernance || getDefaultGovernance()), [key]: val } });
    };

    const setCtx = (val) => {
        setOpts({ ...opts, gameplay: { ...(opts.gameplay || {}), context_mode: val } });
    };

    const setChron = (val) => {
        setOpts({ ...opts, chroniqueur: { ...(opts.chroniqueur || {}), enabled: val } });
    };

    const toggleMinistry = (id) => {
        const current = new Set(gov.ministries || getAllMinistryIds());
        if (current.has(id)) { if (current.size <= 2) return; current.delete(id); }
        else current.add(id);
        setGov('ministries', [...current]);
    };

    const toggleMinisterSettings = (id) => {
        const dIds = new Set(getDestin()?.agents || []);
        const allIds = Object.entries(getAgentsEffectifs().ministers || {})
        .filter(([mid]) => !dIds.has(mid)).map(([mid]) => mid);
        const current = new Set(gov.active_ministers || allIds);
        if (current.has(id)) { if (current.size <= 1) return; current.delete(id); }
        else current.add(id);
        setGov('active_ministers', [...current]);
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
        {HDR('pres', t('GOV_PRES_DEFAULT', lang))}
        {openAcc==='pres' && (
            <div className="aria-accordion__body">
            <div>
            <div style={{ fontSize:'0.75rem', color:'rgba(200,164,74,0.7)', letterSpacing:'0.10em', marginBottom:'0.6rem', textTransform:'uppercase' }}>
            {t('GOV_PRES_TYPE', lang)}
            </div>
            <PresidencyTiles presType={gov.presidency || 'duale'} onSelect={v => setGov('presidency', v)} isEn={isEn}
                presSymbols={presSymbols} onEditEmoji={handleEditEmojiPres} showTrinaire />
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.40rem', color:'rgba(140,160,200,0.35)', marginTop:'0.5rem', letterSpacing:'0.06em' }}>
            {t('GOV_FORM_APPLIED', lang)}
            </div>
            </div>
            </div>
        )}
        </div>

        {/* ▸ MINISTÈRES */}
        <div className={`aria-accordion${openAcc==='mins' ? ' open' : ''}`}>
        {HDR('mins', t('GOV_MINS_DEFAULT', lang),
            `${(gov.ministries||getAllMinistryIds()).length}/${getAllMinistryIds().length}`)}
            {openAcc==='mins' && (
                <div className="aria-accordion__body">
                {(() => {
                    const dIds = new Set(getDestin()?.agents || []);
                    const allMinisterIds = Object.entries(getAgentsEffectifs().ministers || {})
                    .filter(([id]) => !dIds.has(id)).map(([id]) => id);
                    const ministriesData = getAgentsEffectifs().ministries || [];
                    return getAllMinistryIds().map(id => {
                        const meta   = getMinistryMeta()[id] || { emoji:'', label:id };
                        const activeMins = gov.ministries || getAllMinistryIds();
                        const active = activeMins.includes(id);
                        const isMin  = activeMins.length <= 2 && active;
                        const ministryData = ministriesData.find(m => m.id === id);
                        const ministryMinisters = ministryData?.ministers || [];
                        return (
                            <div key={id}>
                            <label style={{ display:'flex', alignItems:'center', gap:'0.6rem',
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
                                    {active && ministryMinisters.length > 0 && (
                                        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', paddingLeft:'2.2rem', paddingBottom:'0.3rem' }}>
                                        {ministryMinisters.map(mid => {
                                            const m = getAgentsEffectifs().ministers?.[mid];
                                            if (!m || !m.emoji) return null;
                                            const activeList = gov.active_ministers || allMinisterIds;
                                            const mActive = activeList.includes(mid);
                                            return (
                                                <button key={mid} title={m.name}
                                                onClick={() => toggleMinisterSettings(mid)}
                                                style={{
                                                    padding:'0.18rem 0.45rem', borderRadius:'2px', cursor:'pointer',
                                                    fontFamily:"'JetBrains Mono',monospace", fontSize:'0.42rem',
                                                    background: mActive ? 'rgba(200,164,74,0.08)' : 'rgba(255,255,255,0.02)',
                                                    border: `1px solid ${mActive ? 'rgba(200,164,74,0.30)' : 'rgba(140,160,200,0.12)'}`,
                                                    color: mActive ? 'rgba(200,215,240,0.85)' : 'rgba(140,160,200,0.35)',
                                                }}>
                                                {m.emoji} {m.name}
                                                </button>
                                            );
                                        })}
                                        </div>
                                    )}
                                    </div>
                        );
                    });
                })()}
                </div>
            )}
            </div>

            {/* ▸ MINISTRES */}
            <div className={`aria-accordion${openAcc==='ministers' ? ' open' : ''}`}>
            {HDR('ministers', t('GOV_DEF_MINISTERS', lang), (() => {
                const dIds = new Set(getDestin()?.agents || []);
                const allIds = Object.entries(getAgentsEffectifs().ministers || {}).filter(([id]) => !dIds.has(id)).map(([id]) => id);
                return `${(gov.active_ministers || allIds).length}/${allIds.length}`;
            })())}
            {openAcc==='ministers' && (
                <div className="aria-accordion__body">
                {(() => {
                    const dIds = new Set(getDestin()?.agents || []);
                    const allIds = Object.entries(getAgentsEffectifs().ministers || {})
                    .filter(([id]) => !dIds.has(id)).map(([id]) => id);
                    return Object.entries(getAgentsEffectifs().ministers || {})
                    .filter(([id, m]) => !dIds.has(id) && m.name && m.emoji)
                    .map(([id, m]) => {
                        const activeList = gov.active_ministers || allIds;
                        const active = activeList.includes(id);
                        const isMin = activeList.length <= 1 && active;
                        return (
                            <label key={id} style={{ display:'flex', alignItems:'center', gap:'0.6rem',
                                cursor: isMin ? 'not-allowed' : 'pointer', opacity: isMin ? 0.5 : 1,
                                padding:'0.3rem 0.5rem', borderRadius:'2px',
                                background: active ? 'rgba(200,164,74,0.07)' : 'transparent',
                                border: active ? '1px solid rgba(200,164,74,0.20)' : '1px solid transparent' }}>
                                <input type="checkbox" checked={active} disabled={isMin}
                                onChange={() => toggleMinisterSettings(id)}
                                style={{ accentColor:'#C8A44A', width:'13px', height:'13px' }} />
                                <span style={{ fontSize:'0.9rem' }}>{m.emoji}</span>
                                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.52rem',
                                    color:'rgba(200,215,240,0.80)' }}>{m.name}</span>
                                    </label>
                        );
                    });
                })()}
                </div>
            )}
            </div>

            {/* ▸ CROYEZ-VOUS AU DESTIN ? */}
            <div className={`aria-accordion${openAcc==='destin' ? ' open' : ''}`}>
            {HDR('destin', t('GOV_DESTIN_HDR', lang))}
            {openAcc==='destin' && (
                <div className="aria-accordion__body">
                <Field label="Oracle & Wyrd"
                hint={t('GOV_DESTIN_ORACLE_HINT', lang)}>
                    <Toggle value={gov.destiny_mode === true} onChange={v => setGov('destiny_mode', v)}
                    label={gov.destiny_mode === true ? t('ENABLED', lang) : t('DISABLED', lang)} />
                    </Field>
                    </div>
            )}
            </div>

            {/* ▸ GESTION DE CRISE */}
            <div className={`aria-accordion${openAcc==='crise' ? ' open' : ''}`}>
            {HDR('crise', t('GOV_CRISIS_MODE', lang))}
            {openAcc==='crise' && (
                <div className="aria-accordion__body">
                <Field label={t('GOV_CRISIS_FIELD_LBL', lang)}
                hint={t('GOV_CRISIS_FIELD_HINT', lang)}>
                <Toggle value={gov.crisis_mode !== false} onChange={v => setGov('crisis_mode', v)}
                label={gov.crisis_mode !== false ? t('ENABLED', lang) : t('DISABLED', lang)} />
                </Field>
                </div>
            )}
            </div>

            {/* ▸ CONTEXTE PAYS */}
            <div className={`aria-accordion${openAcc==='ctx' ? ' open' : ''}`}>
            {HDR('ctx', t('GOV_CTX_HDR', lang))}
            {openAcc==='ctx' && (
                <div className="aria-accordion__body">
                <div style={{ fontSize:'0.44rem', color:'rgba(140,160,200,0.45)', lineHeight:1.5 }}>
                {t('GOV_CTX_DELIB_HINT', lang)}
                    </div>
                    <ContextModeSelector
                        value={opts.gameplay?.context_mode || 'auto'}
                        onChange={setCtx}
                        name="context_mode_gov"
                    />

                    {/* Chroniqueur — mémoire institutionnelle */}
                    <div style={{ marginTop:'0.5rem', paddingTop:'0.5rem', borderTop:'1px solid rgba(90,110,160,0.12)' }}>
                        <ChroniqueurToggle value={opts.chroniqueur?.enabled ?? true} onChange={setChron} />
                    </div>
                    </div>
            )}
            </div>

            </div>
    );
}
