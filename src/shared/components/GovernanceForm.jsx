// src/shared/components/GovernanceForm.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  GovernanceForm — Formulaire de gouvernance partagé Init + Settings
//
//  Props :
//    context   'init' | 'settings'
//    opts      object aria_options (contrôlé)
//    onChange  (newOpts) => void
//
//  Sections : Présidence · Ministères · Contexte délibération · Destin · Crise
//  Si context='settings' : bandeau informatif + compteur pays lambda/constitués
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocale } from '../../ariaI18n';
import { getAgents } from '../../Dashboard_p1';
import { getDestin } from '../../features/council/services/agentsManager';
import { FONT } from '../theme';
import PresidencyTiles from './PresidencyTiles';

// ── Helpers locaux ────────────────────────────────────────────────────────────

function getAllMinistryIds() { return getAgents().ministries.map(m => m.id); }

function getMinistryMeta() {
    const mList = getAgents().ministries || [];
    const result = {};
    mList.forEach(m => { result[m.id] = { emoji: m.emoji || '', label: m.name || m.id }; });
    return result;
}

function getDestinIds() { return new Set(getDestin()?.agents || []); }

function getAllMinisters() {
    const dIds = getDestinIds();
    return Object.entries(getAgents().ministers || {})
        .filter(([id, m]) => m.name && m.emoji && !dIds.has(id));
}

function getDestinAgents() {
    const { ministers = {} } = getAgents();
    return (getDestin()?.agents || []).map(id => ({ id, ...ministers[id] })).filter(a => a.name);
}

function getDefaultGov() {
    return { presidency: 'duale', ministries: getAllMinistryIds() };
}

function readCountries() {
    try { return JSON.parse(localStorage.getItem('aria_session_countries') || '[]'); }
    catch { return []; }
}

// ── Accordéon inline ─────────────────────────────────────────────────────────

function Acc({ open, onToggle, label, badge, children }) {
    return (
        <div style={{ borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(140,160,200,0.10)' }}>
            <button
                onClick={onToggle}
                style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                    gap: '0.5rem', padding: '0.55rem 0.75rem', cursor: 'pointer',
                    background: open ? 'rgba(200,164,74,0.06)' : 'rgba(20,28,45,0.55)',
                    border: 'none', fontFamily: `'JetBrains Mono', monospace`,
                    fontSize: '0.50rem', letterSpacing: '0.10em',
                    color: open ? 'rgba(200,164,74,0.85)' : 'rgba(170,185,215,0.55)',
                    transition: 'all 0.12s',
                }}
            >
                <span style={{ fontSize: '0.55rem', minWidth: '0.8rem' }}>{open ? '▾' : '▸'}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge && (
                    <span style={{
                        fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.42rem',
                        color: 'rgba(200,164,74,0.55)', background: 'rgba(200,164,74,0.08)',
                        padding: '0.1rem 0.4rem', borderRadius: '2px',
                    }}>{badge}</span>
                )}
            </button>
            {open && (
                <div style={{ padding: '0.7rem 0.75rem', background: 'rgba(8,14,26,0.50)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

// ── Toggle inline ─────────────────────────────────────────────────────────────

function Toggle({ value, onChange, label }) {
    return (
        <button
            onClick={() => onChange(!value)}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
        >
            <span style={{
                width: '2.2rem', height: '1.1rem', borderRadius: '0.55rem', position: 'relative',
                background: value ? 'rgba(200,164,74,0.40)' : 'rgba(90,110,160,0.20)',
                border: `1px solid ${value ? 'rgba(200,164,74,0.60)' : 'rgba(90,110,160,0.25)'}`,
                transition: 'all 0.15s', flexShrink: 0,
            }}>
                <span style={{
                    position: 'absolute', top: '0.1rem', width: '0.8rem', height: '0.8rem',
                    borderRadius: '50%', background: value ? 'rgba(200,164,74,0.90)' : 'rgba(140,160,200,0.40)',
                    left: value ? 'calc(100% - 0.9rem)' : '0.1rem', transition: 'all 0.15s',
                }} />
            </span>
            {label && (
                <span style={{ fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.48rem', color: 'rgba(200,215,240,0.70)' }}>
                    {label}
                </span>
            )}
        </button>
    );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function GovernanceForm({ context, opts, onChange }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';
    const [openAcc, setOpenAcc] = useState(null);

    const gov = opts?.defaultGovernance || getDefaultGov();
    const ctxMode = opts?.gameplay?.context_mode || 'auto';

    const toggle = (key) => setOpenAcc(p => p === key ? null : key);

    const setGov = (key, val) => {
        onChange({
            ...opts,
            defaultGovernance: { ...(opts?.defaultGovernance || getDefaultGov()), [key]: val },
        });
    };

    const setCtx = (val) => {
        onChange({ ...opts, gameplay: { ...(opts?.gameplay || {}), context_mode: val } });
    };

    const toggleMinistry = (id) => {
        const current = new Set(gov.ministries || getAllMinistryIds());
        if (current.has(id)) { if (current.size <= 2) return; current.delete(id); }
        else current.add(id);
        setGov('ministries', [...current]);
    };

    const toggleMinister = (id) => {
        const allIds = getAllMinisters().map(([mid]) => mid);
        const current = new Set(gov.active_ministers || allIds);
        if (current.has(id)) { if (current.size <= 1) return; current.delete(id); }
        else current.add(id);
        setGov('active_ministers', [...current]);
    };

    const toggleDestinAgent = (id) => {
        const allIds = getDestinAgents().map(a => a.id);
        const current = new Set(gov.active_destin_agents || allIds);
        if (current.has(id)) { if (current.size <= 1) return; current.delete(id); }
        else current.add(id);
        setGov('active_destin_agents', [...current]);
    };

    // ── Compteur pays (context=settings uniquement) ───────────────────────────
    const countryCounter = (() => {
        if (context !== 'settings') return null;
        const countries = readCountries();
        if (!countries.length) return null;
        const lambda = countries.filter(c => !c.governanceOverride).length;
        const custom = countries.filter(c => !!c.governanceOverride).length;
        return { lambda, custom };
    })();

    // ── Résumé présidence ─────────────────────────────────────────────────────
    const presType = gov.presidency || 'duale';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

            {/* ── Bandeau Settings ─────────────────────────────────────────── */}
            {context === 'settings' && (
                <div style={{
                    padding: '0.6rem 0.75rem',
                    background: 'rgba(90,110,160,0.07)',
                    border: '1px solid rgba(90,110,160,0.18)',
                    borderRadius: '2px',
                    display: 'flex', flexDirection: 'column', gap: '0.3rem',
                }}>
                    <p style={{
                        margin: 0, fontFamily: `'JetBrains Mono', monospace`,
                        fontSize: '0.44rem', color: 'rgba(140,160,200,0.65)', lineHeight: 1.6,
                    }}>
                        {isEn
                            ? 'These settings apply to countries without their own constitution. Each country can be configured individually in its panel → Governance.'
                            : 'Ces paramètres s\'appliquent aux pays sans constitution propre. Chaque pays est configurable dans son panneau → Gouvernance.'}
                    </p>
                    {countryCounter && (
                        <p style={{
                            margin: 0, fontFamily: `'JetBrains Mono', monospace`,
                            fontSize: '0.42rem', color: 'rgba(200,164,74,0.55)', letterSpacing: '0.06em',
                        }}>
                            {isEn
                                ? `${countryCounter.lambda} standard ${countryCounter.lambda <= 1 ? 'country' : 'countries'} · ${countryCounter.custom} constituted`
                                : `${countryCounter.lambda} pays lambda · ${countryCounter.custom} pays constitués`}
                        </p>
                    )}
                </div>
            )}

            {/* ── PRÉSIDENCE ───────────────────────────────────────────────── */}
            <Acc
                open={openAcc === 'pres'}
                onToggle={() => toggle('pres')}
                label={isEn ? 'DEFAULT PRESIDENCY' : 'PRÉSIDENCE PAR DÉFAUT'}
                badge={presType}
            >
                <PresidencyTiles presType={presType} onSelect={v => setGov('presidency', v)} isEn={isEn} />
                <div style={{
                    fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.40rem',
                    color: 'rgba(140,160,200,0.30)', marginTop: '0.2rem', letterSpacing: '0.06em',
                }}>
                    {isEn ? 'Applied to all new countries unless overridden' : 'Appliqué à tous les nouveaux pays sauf override'}
                </div>
            </Acc>

            {/* ── MINISTÈRES ───────────────────────────────────────────────── */}
            <Acc
                open={openAcc === 'mins'}
                onToggle={() => toggle('mins')}
                label={isEn ? 'ACTIVE MINISTRIES BY DEFAULT' : 'MINISTÈRES ACTIFS PAR DÉFAUT'}
                badge={`${(gov.ministries || getAllMinistryIds()).length}/${getAllMinistryIds().length}`}
            >
                {getAllMinistryIds().map(id => {
                    const meta = getMinistryMeta()[id] || { emoji: '', label: id };
                    const activeMins = gov.ministries || getAllMinistryIds();
                    const active = activeMins.includes(id);
                    const isMin = activeMins.length <= 2 && active;
                    return (
                        <label key={id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            cursor: isMin ? 'not-allowed' : 'pointer', opacity: isMin ? 0.5 : 1,
                            padding: '0.3rem 0.5rem', borderRadius: '2px',
                            background: active ? 'rgba(200,164,74,0.07)' : 'transparent',
                            border: active ? '1px solid rgba(200,164,74,0.20)' : '1px solid transparent',
                        }}>
                            <input type="checkbox" checked={active} disabled={isMin}
                                onChange={() => toggleMinistry(id)}
                                style={{ accentColor: '#C8A44A', width: '13px', height: '13px' }} />
                            <span style={{ fontSize: '0.9rem' }}>{meta.emoji}</span>
                            <span style={{
                                fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.52rem',
                                color: 'rgba(200,215,240,0.80)',
                            }}>{meta.label}</span>
                        </label>
                    );
                })}
            </Acc>

            {/* ── MINISTRES ────────────────────────────────────────────────── */}
            <Acc
                open={openAcc === 'ministers'}
                onToggle={() => toggle('ministers')}
                label={isEn ? 'ACTIVE MINISTERS BY DEFAULT' : 'MINISTRES ACTIFS PAR DÉFAUT'}
                badge={(() => {
                    const allIds = getAllMinisters().map(([id]) => id);
                    const active = gov.active_ministers || allIds;
                    return `${active.length}/${allIds.length}`;
                })()}
            >
                {getAllMinisters().map(([id, m]) => {
                    const allIds = getAllMinisters().map(([mid]) => mid);
                    const activeList = gov.active_ministers || allIds;
                    const active = activeList.includes(id);
                    const isMin = activeList.length <= 1 && active;
                    return (
                        <label key={id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            cursor: isMin ? 'not-allowed' : 'pointer', opacity: isMin ? 0.5 : 1,
                            padding: '0.3rem 0.5rem', borderRadius: '2px',
                            background: active ? 'rgba(200,164,74,0.07)' : 'transparent',
                            border: active ? '1px solid rgba(200,164,74,0.20)' : '1px solid transparent',
                        }}>
                            <input type="checkbox" checked={active} disabled={isMin}
                                onChange={() => toggleMinister(id)}
                                style={{ accentColor: '#C8A44A', width: '13px', height: '13px' }} />
                            <span style={{ fontSize: '0.9rem' }}>{m.emoji}</span>
                            <span style={{ fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.52rem', color: 'rgba(200,215,240,0.80)' }}>{m.name}</span>
                        </label>
                    );
                })}
            </Acc>

            {/* ── CONTEXTE DÉLIBÉRATION ────────────────────────────────────── */}
            <Acc
                open={openAcc === 'ctx'}
                onToggle={() => toggle('ctx')}
                label={isEn ? 'COUNTRY CONTEXT IN DELIBERATIONS' : 'CONTEXTE PAYS DANS LES DÉLIBÉRATIONS'}
                badge={ctxMode}
            >
                <div style={{
                    fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.42rem',
                    color: 'rgba(140,160,200,0.45)', lineHeight: 1.55, marginBottom: '0.3rem',
                }}>
                    {isEn
                        ? 'Controls what country info is injected into each deliberation prompt.'
                        : 'Contrôle quelles infos sur le pays sont injectées dans chaque prompt.'}
                </div>
                {[
                    ['auto',       '🤖 Auto',                isEn ? 'Stats always + description if available (default)' : 'Stats toujours + description si disponible (défaut)'],
                    ['rich',       isEn ? '📖 Enriched' : '📖 Enrichi', isEn ? 'Full context — prompts AI to invent a coherent history' : 'Contexte complet — incite l\'IA à inventer un historique cohérent'],
                    ['stats_only', isEn ? '📊 Stats only' : '📊 Stats seules', isEn ? 'Numbers only — more neutral' : 'Uniquement les chiffres — délibération plus neutre'],
                    ['off',        isEn ? '🚫 Disabled' : '🚫 Désactivé', isEn ? 'No context injected — blind universal deliberation' : 'Aucun contexte injecté — délibération aveugle'],
                ].map(([val, lbl, hint]) => (
                    <label key={val} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        cursor: 'pointer', padding: '0.35rem 0.5rem', borderRadius: '2px',
                        background: ctxMode === val ? 'rgba(200,164,74,0.08)' : 'transparent',
                        border: `1px solid ${ctxMode === val ? 'rgba(200,164,74,0.30)' : 'transparent'}`,
                    }}>
                        <input type="radio" name="gf_context_mode" value={val}
                            checked={ctxMode === val} onChange={() => setCtx(val)}
                            style={{ marginTop: '0.1rem', accentColor: '#C8A44A' }} />
                        <div>
                            <div style={{ fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.52rem', color: 'rgba(220,228,240,0.85)' }}>{lbl}</div>
                            <div style={{ fontSize: '0.44rem', color: 'rgba(140,160,200,0.50)', marginTop: '0.1rem', lineHeight: 1.45 }}>{hint}</div>
                        </div>
                    </label>
                ))}
            </Acc>

            {/* ── DESTIN ───────────────────────────────────────────────────── */}
            <Acc
                open={openAcc === 'destin'}
                onToggle={() => toggle('destin')}
                label={isEn ? 'DO YOU BELIEVE IN DESTINY?' : 'CROYEZ-VOUS AU DESTIN ?'}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{
                        fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.42rem',
                        color: 'rgba(140,100,220,0.55)', lineHeight: 1.55,
                    }}>
                        {isEn
                            ? "Introduces external forces into deliberations (existential crises, civilizational ruptures…)"
                            : "Introduit des forces extérieures dans les délibérations (crises existentielles, ruptures civilisationnelles…)"}
                    </div>
                    <Toggle
                        value={gov.destiny_mode === true}
                        onChange={v => setGov('destiny_mode', v)}
                        label={gov.destiny_mode === true ? (isEn ? 'Enabled' : 'Activé') : (isEn ? 'Disabled' : 'Désactivé')}
                    />
                    {gov.destiny_mode === true && (
                        <div style={{ paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderLeft: '1px solid rgba(140,100,220,0.25)', marginTop: '0.15rem' }}>
                            {getDestinAgents().map(a => {
                                const icon = a.id === 'oracle' ? '☯' : '📜';
                                const allIds = getDestinAgents().map(d => d.id);
                                const activeList = gov.active_destin_agents || allIds;
                                const active = activeList.includes(a.id);
                                const tip = a.id === 'oracle'
                                    ? (isEn ? 'Takes a position in deliberations' : 'Prend position dans les délibérations')
                                    : (isEn ? 'Shapes the global narrative over cycles' : 'Oriente le récit global sur la durée des cycles');
                                return (
                                    <Toggle
                                        key={a.id}
                                        value={active}
                                        onChange={() => toggleDestinAgent(a.id)}
                                        label={<span title={tip}>{icon} {a.name}</span>}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </Acc>

            {/* ── CRISE ────────────────────────────────────────────────────── */}
            <Acc
                open={openAcc === 'crise'}
                onToggle={() => toggle('crise')}
                label={isEn ? 'CRISIS MANAGEMENT' : 'GESTION DE CRISE'}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{
                        fontFamily: `'JetBrains Mono', monospace`, fontSize: '0.42rem',
                        color: 'rgba(140,160,200,0.45)', lineHeight: 1.55,
                    }}>
                        {isEn
                            ? 'Activates automatic crisis detection and adapted deliberation.'
                            : 'Active la détection automatique des crises et la délibération adaptée.'}
                    </div>
                    <Toggle
                        value={gov.crisis_mode !== false}
                        onChange={v => setGov('crisis_mode', v)}
                        label={gov.crisis_mode !== false ? (isEn ? 'Enabled' : 'Activé') : (isEn ? 'Disabled' : 'Désactivé')}
                    />
                </div>
            </Acc>

        </div>
    );
}
