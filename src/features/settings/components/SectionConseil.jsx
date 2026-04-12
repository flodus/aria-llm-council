// src/features/settings/components/SectionConseil.jsx
// SECTION CONSEIL — Gouvernement, ministres, présidence, destinée

import { useState, useMemo } from 'react';
import { useLocale } from '../../../ariaI18n';
import { getStats } from '../../../shared/data/gameData';
import { getOptions, saveOptions } from '../../../shared/config/options';
import { getDestin } from '../../council/services/agentsManager';
import AgentGrid from '../../../shared/components/AgentGrid';
import PresidencyTiles from '../../../shared/components/PresidencyTiles';
import { SectionTitle, Field, TextArea, SaveBadge } from '../ui/SettingsUI';
import SectionGouvernanceDefaut from './SectionGouvernanceDefaut';
import { getAgentOverrides, saveAgentOverrides } from '../utils/settingsStorage';
import { getAgentsEffectifs, sauvegarderEmojiAgent, getEmojiOverrides } from '../../../shared/utils/agentsOverrides';

function getMinisterLabels() {
    const ag = getAgentsEffectifs();
    return Object.fromEntries(
        Object.entries(ag.ministers || {}).map(([k, m]) => [k, `${m.name} (${m.sign})`])
    );
}

function getMinistryLabels() {
    const ag = getAgentsEffectifs();
    const mins = Array.isArray(ag.ministries) ? ag.ministries : Object.values(ag.ministries || {});
    return Object.fromEntries(mins.map(m => [m.id, `${m.emoji||''} ${m.name}`]));
}

export default function SectionConseil() {
    const { lang } = useLocale();
    const isEn = lang === 'en';
    const [agents, setAgents] = useState(() => getAgentOverrides());
    const [govOpts, setGovOpts] = useState(() => getOptions());
    const [selectedMin, setSelectedMin] = useState('initiateur');
    const [selectedMin2, setSelectedMin2] = useState('justice');
    const [tab, setTab] = useState('gouvernance'); // 'gouvernance' | 'presidence' | 'ministeres' | 'ministres' | 'destinee'
    const [presOpenAcc, setPresOpenAcc] = useState(null);
    const [activeDestinSettings, setActiveDestinSettings] = useState(() => {
        const opts = getOptions();
        return opts.defaultGovernance?.destiny_mode === true ? null : [];
    });
    const [saved, setSaved] = useState(false);
    const [emojiVersion, setEmojiVersion] = useState(0);

    // Gouvernance → Destinée : intercepte les changements de destiny_mode sans passer par useEffect
    const handleSetGovOpts = (newOpts) => {
        const prevMode = govOpts.defaultGovernance?.destiny_mode;
        const nextMode = newOpts.defaultGovernance?.destiny_mode;
        if (prevMode !== nextMode) {
            setActiveDestinSettings(nextMode ? null : []);
        }
        setGovOpts(newOpts);
        setSaved(false);
    };

    // Destinée → Gouvernance : met à jour destiny_mode selon l'état des agents
    const syncGovDestiny = (activeAgents) => {
        const hasActive = activeAgents === null || (Array.isArray(activeAgents) && activeAgents.length > 0);
        setGovOpts(prev => ({
            ...prev,
            defaultGovernance: { ...(prev.defaultGovernance || {}), destiny_mode: hasActive }
        }));
        setSaved(false);
    };

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
        saveOptions(govOpts);

        const presType = govOpts.defaultGovernance?.presidency || 'duale';
        const presMap = { solaire: ['phare'], lunaire: ['boussole'], collegiale: [], duale: null };
        const activePres = presMap[presType] ?? null;
        try {
            const ov = JSON.parse(localStorage.getItem('aria_agents_override') || 'null') || {};
            if (activePres === null) delete ov.active_presidency;
            else ov.active_presidency = activePres;
            const activeMins = govOpts.defaultGovernance?.active_ministers ?? null;
            if (activeMins === null) delete ov.active_ministers;
            else ov.active_ministers = activeMins;
            localStorage.setItem('aria_agents_override', JSON.stringify(ov));
        } catch {}

        setSaved(true);
    };

    const getVal = (path, fallback = '') => {
        const parts = path.split('.');
        let obj = agents;
        for (const k of parts) { if (obj == null) return fallback; obj = obj[k]; }
        return obj ?? fallback;
    };

    // Données dynamiques localisées — recalculées à chaque changement d'emoji
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const liveAgents    = useMemo(() => getAgentsEffectifs(), [emojiVersion]);
    const liveMinsters  = liveAgents.ministers  || {};
    const liveMinstries = Array.isArray(liveAgents.ministries)
    ? Object.fromEntries(liveAgents.ministries.map(m=>[m.id,m]))
    : (liveAgents.ministries || {});

    // Callback émoji — sauvegarde + re-render
    const handleEditEmoji = (categorie, id, emoji) => {
        sauvegarderEmojiAgent(categorie, id, emoji);
        setEmojiVersion(v => v + 1);
    };

    // Symboles présidence surchargés
    const emojiOv = getEmojiOverrides();
    const presSymbols = {
        phare:    emojiOv.presidency?.phare    || '☉',
        boussole: emojiOv.presidency?.boussole || '☽',
        trinaire: emojiOv.presidency?.trinaire || '★',
    };

    const minData = liveMinsters[selectedMin] || {};
    const minFallback = (key) => minData[key] || '';

    const ministryData = liveMinstries[selectedMin2] || {};
    const ministryFallback = (key) => ministryData[key] || '';

    const ministerLabels  = getMinisterLabels();
    const ministerEmojis  = getMinisterLabels(); // simplification
    const ministryLabels  = getMinistryLabels();
    const ministryEmojis  = getMinistryLabels(); // simplification

    // Traductions SectionConseil
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

    const togglePresAcc = (key) => setPresOpenAcc(p => p === key ? null : key);

    return (
        <div className="settings-section-body">
        <SectionTitle icon="🏛️" label="GOUVERNEMENT" sub={isEn ? "Deliberating agents — ministers, presidency" : "Agents délibérants — ministres, présidence"} />

        <div className="settings-tabs">
        {[
            { id: 'gouvernance', label: isEn ? 'Governance' : 'Gouvernance' },
            { id: 'presidence',  label: isEn ? 'Presidency' : 'Présidence'  },
            { id: 'ministeres',  label: isEn ? 'Ministries' : 'Ministères'  },
            { id: 'ministres',   label: isEn ? 'Ministers'  : 'Ministres'   },
            { id: 'destinee',    label: isEn ? 'Destiny'    : 'Destinée'    },
        ].map(t => (
            <button key={t.id}
            className={`settings-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            >{t.label}</button>
        ))}
        </div>

        {tab === 'ministres' && (
            <div>
            <AgentGrid
            agents={Object.entries(liveAgents.ministers || {}).filter(([id]) => !new Set(getDestin()?.agents || []).has(id)).map(([id, m]) => ({ id, name: (ministerLabels[id]?.split(' (')[0] || id).replace(/^(Le |La |L')/, ''), emoji: m.emoji, color: m.color }))}
            selectedId={selectedMin}
            activeIds={null}
            onAgentClick={setSelectedMin}
            onResetAll={null}
            onEditEmoji={(id, emoji) => handleEditEmoji('ministers', id, emoji)}
            countLabel={isEn ? 'SELECT A MINISTER' : 'SÉLECTIONNER UN MINISTRE'}
            lang={lang}
            />

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

        {tab === 'ministeres' && (() => {
            const destIds = new Set(getDestin()?.agents || []);
            const tousMinistres = Object.entries(liveAgents.ministers || {})
                .filter(([id]) => !destIds.has(id))
                .map(([id, m]) => ({ id, name: (ministerLabels[id]?.split(' (')[0] || id).replace(/^(Le |La |L')/, ''), emoji: m.emoji, color: m.color }));
            // Liste assignée : priorité override local, sinon données de base
            const ministresAssignes = getVal(`ministries.${selectedMin2}.ministers`, ministryData.ministers || []);
            const toggleMinistre = (mId) => {
                const next = ministresAssignes.includes(mId)
                    ? ministresAssignes.filter(id => id !== mId)
                    : [...ministresAssignes, mId];
                updateAgent(`ministries.${selectedMin2}.ministers`, next);
            };
            return (
            <div>
            <AgentGrid
            agents={(Array.isArray(liveAgents.ministries) ? liveAgents.ministries : Object.values(liveAgents.ministries || {})).map(m => ({ id: m.id, name: (ministryLabels[m.id] || m.id).split(' ').slice(1).join(' ') || m.id, emoji: m.emoji, color: m.color }))}
            selectedId={selectedMin2}
            activeIds={null}
            onAgentClick={setSelectedMin2}
            onResetAll={null}
            onEditEmoji={(id, emoji) => handleEditEmoji('ministries', id, emoji)}
            countLabel={isEn ? 'SELECT A MINISTRY' : 'SÉLECTIONNER UN MINISTÈRE'}
            lang={lang}
            />

            {selectedMin2 && (
                <AgentGrid
                agents={tousMinistres}
                selectedId={null}
                activeIds={ministresAssignes}
                onAgentClick={toggleMinistre}
                onResetAll={() => updateAgent(`ministries.${selectedMin2}.ministers`, ministryData.ministers || [])}
                onEditEmoji={(id, emoji) => handleEditEmoji('ministers', id, emoji)}
                countLabel={isEn ? `${ministresAssignes.length} MINISTRES ASSIGNÉS — clic pour toggle` : `${ministresAssignes.length} ASSIGNED MINISTERS — click to toggle`}
                lang={lang}
                />
            )}

            <Field label={trC.missionLabel} hint={trC.missionHint}>
            <TextArea value={getVal(`ministries.${selectedMin2}.mission`, ministryFallback('mission'))}
            onChange={v => updateAgent(`ministries.${selectedMin2}.mission`, v)}
            />
            </Field>

            {ministresAssignes.map(mKey => (
                <Field key={mKey} label={`${trC.rolePrefix} — ${(ministerLabels[mKey]?.split(' (')[0] || mKey).replace(/^(Le |La |L')/, '')}`}
                hint={trC.roleHint}>
                <TextArea value={getVal(`ministries.${selectedMin2}.${mKey}`, ministryData.ministerPrompts?.[mKey] || '')}
                onChange={v => updateAgent(`ministries.${selectedMin2}.${mKey}`, v)}
                />
                </Field>
            ))}
            </div>
            );
        })()}

        {tab === 'presidence' && (() => {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {['phare', 'boussole'].map(key => {
                    const agent = liveAgents.presidency?.[key];
                    if (!agent) return null;
                    const clr = key === 'phare' ? 'rgba(200,164,74,0.88)' : 'rgba(140,100,220,0.85)';
                    const bg  = key === 'phare' ? 'rgba(200,164,74,0.10)' : 'rgba(140,100,220,0.12)';
                    const bd  = key === 'phare' ? 'rgba(200,164,74,0.45)' : 'rgba(140,100,220,0.45)';
                    const isOpen = presOpenAcc === key;
                    return (
                        <div key={key}>
                        <button
                        onClick={() => togglePresAcc(key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.55rem',
                            padding: '0.52rem 0.68rem',
                            background: isOpen ? bg : 'rgba(20,28,45,0.55)',
                            border: `1px solid ${isOpen ? bd : 'rgba(140,160,200,0.10)'}`,
                            borderRadius: isOpen ? '2px 2px 0 0' : '2px',
                            cursor: 'pointer', width: '100%', textAlign: 'left',
                            transition: 'all 0.15s', fontFamily: 'inherit',
                        }}
                        >
                        <span style={{ fontSize: '1.15rem', minWidth: '1.4rem', color: clr }}>{presSymbols[key] || agent.symbol}</span>
                        <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.56rem', letterSpacing: '0.10em', color: isOpen ? clr : 'rgba(200,215,240,0.50)' }}>{agent.name}</div>
                        {agent.subtitle && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.44rem', color: 'rgba(140,160,200,0.48)', marginTop: '0.08rem' }}>{agent.subtitle}</div>}
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.48rem', color: isOpen ? clr : 'rgba(140,160,200,0.22)' }}>{isOpen ? '▾' : '▸'}</span>
                        </button>
                        {isOpen && (
                            <div style={{ border: `1px solid ${bd}`, borderTop: 'none', borderRadius: '0 0 2px 2px', padding: '0.6rem 0.68rem', background: bg, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            <Field label={isEn ? 'Role' : 'Rôle'} hint={agent.subtitle || ''}>
                            <TextArea value={getVal(`presidency.${key}.role`, agent.role_long || '')}
                            onChange={v => updateAgent(`presidency.${key}.role`, v)}
                            />
                            </Field>
                            <Field label="Essence">
                            <TextArea value={getVal(`presidency.${key}.essence`, agent.essence || '')}
                            onChange={v => updateAgent(`presidency.${key}.essence`, v)}
                            />
                            </Field>
                            </div>
                        )}
                        </div>
                    );
                })}
                </div>
            );
        })()}

        {tab === 'destinee' && (() => {
            const destin = getDestin();
            const destingIds = destin?.agents || [];
            const destAgents = destingIds
            .map(id => ({ id, ...(liveMinsters[id] || {}) }))
            .filter(a => a.name);
            return (
                <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0.55rem', background: 'rgba(140,100,220,0.06)', border: '1px solid rgba(140,100,220,0.15)', borderRadius: '2px' }}>
                <span style={{ fontSize: '1.0rem' }}>👁️</span>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.40rem', color: 'rgba(140,160,200,0.45)', margin: 0, lineHeight: 1.5 }}>
                {isEn
                    ? 'Oracle and Wyrd — existential crisis agents. Edit their essence and communication style.'
            : 'Oracle et Trame — agents des crises existentielles. Modifiez leur essence et style de communication.'}
            </p>
            </div>
            <AgentGrid
            agents={destAgents}
            selectedId={selectedMin}
            activeIds={activeDestinSettings}
            onAgentClick={id => {
                if (selectedMin !== id) {
                    setSelectedMin(id);
                } else {
                    setActiveDestinSettings(prev => {
                        const all = destAgents.map(a => a.id);
                        const cur = prev || all;
                        const on = cur.includes(id);
                        const next = on ? cur.filter(k => k !== id) : [...cur, id];
                        const result = next.length === all.length ? null : next;
                        syncGovDestiny(result);
                        return result;
                    });
                    setSelectedMin(null);
                }
            }}
            onResetAll={() => { setActiveDestinSettings(null); syncGovDestiny(null); }}
            countLabel={isEn ? 'DESTINY AGENTS' : 'AGENTS DESTIN'}
            lang={lang}
            />
            {destAgents.map(agent => {
                if (selectedMin && selectedMin !== agent.id) return null;
                return (
                    <div key={agent.id}>
                    <Field label="Essence" hint={isEn ? 'Deep philosophy — what drives their visions' : 'Philosophie profonde — ce qui guide leurs visions'}>
                    <TextArea value={getVal(`ministers.${agent.id}.essence`, agent.essence || '')}
                    onChange={v => updateAgent(`ministers.${agent.id}.essence`, v)}
                    />
                    </Field>
                    <Field label="Communication" hint={trC.comm_hint}>
                    <TextArea value={getVal(`ministers.${agent.id}.comm`, agent.comm || '')}
                    onChange={v => updateAgent(`ministers.${agent.id}.comm`, v)}
                    />
                    </Field>
                    <Field label={trC.annot_label} hint={trC.annot_hint}>
                    <TextArea value={getVal(`ministers.${agent.id}.annotation`, agent.annotation || '')}
                    onChange={v => updateAgent(`ministers.${agent.id}.annotation`, v)}
                    />
                    </Field>
                    </div>
                );
            })}
            </div>
            );
        })()}

        {tab === 'gouvernance' && (
            <SectionGouvernanceDefaut opts={govOpts} setOpts={handleSetGovOpts} />
        )}


        <div className="settings-footer">
        <button className="settings-save-btn" onClick={save}>{isEn?"Save":"Sauvegarder"}</button>
        <SaveBadge saved={saved} />
        </div>
        </div>
    );
}
