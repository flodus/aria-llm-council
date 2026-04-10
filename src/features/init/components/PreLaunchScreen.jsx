// src/features/init/components/PreLaunchScreen.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  PreLaunchScreen.jsx — Écran de configuration pré-lancement (Constitution)
//
//  Intercalé entre la sélection du preset et la génération du monde.
//  Permet de configurer : contexte pays, mode IA, présidence, ministères, ministres.
//  Onglets : RÉSUMÉ · PRÉSIDENCE · MINISTÈRES · MINISTRES
//
//  Flux : InitScreen.preLaunch() → PreLaunchScreen → handleLaunch() → InitScreen.launch()
//  Dépendances : hooks/ (useConstitution, useCountryOverride, useIAConfig…)
// ═══════════════════════════════════════════════════════════════════════════

import { useRef, useState, useMemo } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { FONT, BTN_PRIMARY, BTN_SECONDARY, CARD_STYLE, INPUT_STYLE, labelStyle, wrapWide } from '../../../shared/theme';
import AgentGrid from '../../../shared/components/AgentGrid';
import GovernanceForm from '../../../shared/components/GovernanceForm';
import PresidencyTiles, { activePresToType, typeToActivePres } from '../../../shared/components/PresidencyTiles';
import { getOptions, saveOptions } from '../../../Dashboard_p1';
import { getEmojiOverrides, sauvegarderEmojiAgent } from '../../../shared/utils/agentsOverrides';
import {
    ARIAHeader,
    RecapAccordion,
    ConstitutionStatus,
    CountryBadges,
    CustomizeButton,
    ConstitutionTabs,
    ActivePresidencySection,
    ActiveMinistriesSection,
    ActiveMinistersSection,
    IAConfigAccordion,
    PresidencyDetail,
    MinistriesDetail,
    MinistersDetail,
    ContextPanel,
    ConfirmLaunchDialog,
    WorldRecap
} from './index';

// Hooks personnalisés
import {
    useConstitution,
    useCountryOverride,
    useIAConfig,
    useCountryContext,
    useMinisterForms,
    useGameLaunch
} from '../hooks';
import { loadOpts, loadPreferredModels } from '../../../shared/services';

export default function PreLaunchScreen({ worldName, pendingPreset, pendingDefs, onBack, onLaunch }) {
    const { lang } = useLocale();
    const scrollRef = useRef(null);
    const [plTab, setPlTab] = useState('resume');
    const [confirmLaunch, setConfirmLaunch] = useState(false);
    const [selectedDestin, setSelectedDestin] = useState(null);
    const [emojiVersion, setEmojiVersion] = useState(0);
    const presSymbols = useMemo(() => getEmojiOverrides().presidency || {}, [emojiVersion]);
    const [govOpts, setGovOpts] = useState(() => getOptions());
    const [govModal, setGovModal] = useState(false);
    const [worldAccepted, setWorldAccepted] = useState(false);

    // Hooks
    const constitution = useConstitution(pendingDefs);
    const countryContext = useCountryContext(pendingDefs);
    const iaConfig = useIAConfig();
    const ministerForms = useMinisterForms();

    const countryOverride = useCountryOverride(
        constitution.perGov,
        constitution.setPerGov,
        constitution.commonAgents,
        constitution.commonMins,
        constitution.commonPres,
        constitution.commonMinsters
    );

    const countries = pendingDefs || [];

    // Sauvegarde constitution (hook)
    const { saveAndLaunch } = useGameLaunch(constitution, iaConfig, countryContext, constitution.perGov, onLaunch);

    const addMinister = () => ministerForms.addMinister(countryOverride.setPlAgents);
    const addMinistry = () => ministerForms.addMinistry(countryOverride.setPlAgents);

    // ── Lancement ────────────────────────────────────────────────────────────
    // Persiste la config IA, merge les overrides par pays, puis délègue à InitScreen.launch()
    const handleLaunch = () => {
        // Sauvegarde IA config dans aria_options + aria_preferred_models
        try {
            const opts = loadOpts();
            opts.ia_mode = iaConfig.ariaMode;
            opts.solo_model = iaConfig.roles.ministre_provider || iaConfig.availProviders[0] || 'claude';

            if (iaConfig.ariaMode === 'aria' || iaConfig.ariaMode === 'custom') {
                opts.ia_roles = {
                    ...(opts.ia_roles || {}),
                    ministre_model: iaConfig.roles.ministre_provider || iaConfig.availProviders[0] || 'claude',
                    synthese_min: iaConfig.roles.synthese_min_prov || iaConfig.availProviders[0] || 'claude',
                    phare_model: iaConfig.roles.phare_provider || iaConfig.availProviders[0] || 'claude',
                    boussole_model: iaConfig.roles.boussole_provider || iaConfig.availProviders[0] || 'claude',
                    synthese_pres: iaConfig.roles.synthese_pres_prov || iaConfig.availProviders[0] || 'claude',
                };
            }

            if (!opts.ia_models) opts.ia_models = {};
            if (iaConfig.roles.ministre_provider && iaConfig.roles.ministre_model) {
                opts.ia_models[iaConfig.roles.ministre_provider] = iaConfig.roles.ministre_model;
            }
            if (iaConfig.roles.synthese_min_prov && iaConfig.roles.synthese_min_model) {
                opts.ia_models[iaConfig.roles.synthese_min_prov] = iaConfig.roles.synthese_min_model;
            }
            if (iaConfig.roles.phare_provider && iaConfig.roles.phare_model) {
                opts.ia_models[iaConfig.roles.phare_provider] = iaConfig.roles.phare_model;
            }
            if (iaConfig.roles.boussole_provider && iaConfig.roles.boussole_model) {
                opts.ia_models[iaConfig.roles.boussole_provider] = iaConfig.roles.boussole_model;
            }
            if (iaConfig.roles.synthese_pres_prov && iaConfig.roles.synthese_pres_model) {
                opts.ia_models[iaConfig.roles.synthese_pres_prov] = iaConfig.roles.synthese_pres_model;
            }

            localStorage.setItem('aria_options', JSON.stringify(opts));
            localStorage.setItem('aria_preferred_models', JSON.stringify({
                ...loadPreferredModels(),
                                                                         ...Object.fromEntries([
                                                                             [iaConfig.roles.ministre_provider, iaConfig.roles.ministre_model],
                                                                             [iaConfig.roles.synthese_min_prov, iaConfig.roles.synthese_min_model],
                                                                             [iaConfig.roles.phare_provider, iaConfig.roles.phare_model],
                                                                             [iaConfig.roles.boussole_provider, iaConfig.roles.boussole_model],
                                                                             [iaConfig.roles.synthese_pres_prov, iaConfig.roles.synthese_pres_model]
                                                                         ].filter(([k, v]) => k && v))
            }));
        } catch {}

        // Merge context_mode + contextOverride + governanceOverride dans chaque def pays
        // perGov[i] = null → héritage commun (pas d'override)
        const defs = (pendingDefs || []).map((d, i) => {
            const gov = constitution.perGov[i];
            return {
                ...d,
                context_mode: countryContext.plCtxModes[i] || undefined,
                contextOverride: countryContext.plCtxOvrs[i] || undefined,
                ...(gov ? {
                    governanceOverride: {
                        agents: gov.agents,
                        active_ministries: gov.activeMins,
                        active_presidency: gov.activePres,
                        active_ministers: gov.activeMinsters,
                    }
                } : {}),
            };
        });

        onLaunch(pendingPreset, defs);
    };

    return (
        <div style={{ ...wrapWide, gap: '1.2rem', maxWidth: 680 }}>
        <ARIAHeader showQuote={false} />

        {/* ── Question initiale : gouvernance du monde ─────────────────────── */}
        {!worldAccepted && (
            <WorldRecap
                govOpts={govOpts}
                iaConfig={iaConfig}
                lang={lang}
                onAccept={() => setConfirmLaunch(true)}
                onModify={() => { setWorldAccepted(true); setGovModal(true); }}
            />
        )}

        {/* Tout ce qui suit n'est visible que si le joueur a choisi "Je veux le modifier" */}
        {worldAccepted && <>

        {/* Bouton retour vers le récap monde */}
        <button
            onClick={() => setWorldAccepted(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, alignSelf: 'flex-start', fontFamily: FONT.mono, fontSize: '0.42rem', color: 'rgba(140,160,200,0.45)', letterSpacing: '0.06em' }}
        >
            ← {lang === 'en' ? 'Back to world overview' : 'Retour au récap monde'}
        </button>

        {/* Header avec badges et bouton personnaliser */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={labelStyle()}>CONSTITUTION — {worldName}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
        <CountryBadges
        countries={countries}
        perGov={constitution.perGov}
        currentCountry={countryOverride.plCountry}
        onSelectCountry={(i) => {
            countryOverride.setPlCountry(i);
            countryOverride.setSelectedMinistry(null);
            countryOverride.setSelectedMinister(null);
        }}
        />
        <CustomizeButton
        hasOverride={countryOverride.hasOverride}
        onFork={countryOverride.forkCountry}
        onReset={() => countryOverride.resetCountryOverride(countryOverride.plCountry)}
        />
        </div>
        </div>

        {/* Bloc contextuel pays actif — G1 */}
        {(() => {
            const perGov = constitution.perGov[countryOverride.plCountry];
            const presType = govOpts?.defaultGovernance?.presidency || 'duale';
            const presLabels = { solaire: 'Solaire ☉', lunaire: 'Lunaire ☽', duale: 'Duale ☉☽', collegiale: 'Collégiale ✡' };
            const resume = perGov
                ? (() => {
                    const pres = perGov.activePres || [];
                    const pl = pres.length === 0 ? '✡' : pres.length === 1 ? (pres[0] === 'phare' ? '☉' : '☽') : '☉☽';
                    return `${pl} — ${perGov.activeMins ? perGov.activeMins.length + (lang === 'en' ? ' ministries' : ' ministères') : (lang === 'en' ? 'default ministries' : 'ministères par défaut')}`;
                })()
                : presLabels[presType] || presType;
            return (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.38rem 0.65rem', borderRadius: '2px', background: perGov ? 'rgba(200,164,74,0.05)' : 'rgba(140,160,200,0.03)', border: `1px solid ${perGov ? 'rgba(200,164,74,0.18)' : 'rgba(140,160,200,0.08)'}` }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.48rem', color: perGov ? 'rgba(200,164,74,0.80)' : 'rgba(140,160,200,0.45)', letterSpacing: '0.06em', flexShrink: 0 }}>
                        {perGov ? '✦ CONSTITUTION PROPRE' : '⚙️ SUIT LE MODÈLE MONDE'}
                    </span>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.40)', flex: 1 }}>
                        {resume}
                    </span>
                    {!perGov && (
                        <button
                            onClick={countryOverride.forkCountry}
                            style={{ fontFamily: FONT.mono, fontSize: '0.40rem', padding: '0.18rem 0.50rem', borderRadius: '2px', background: 'rgba(200,164,74,0.08)', border: '1px solid rgba(200,164,74,0.22)', color: 'rgba(200,164,74,0.70)', cursor: 'pointer', flexShrink: 0 }}
                        >
                            {lang === 'en' ? 'Customize →' : 'Personnaliser →'}
                        </button>
                    )}
                </div>
            );
        })()}

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid rgba(200,164,74,0.10)', width: '100%', backdropFilter: 'blur(6px)', background: 'rgba(8,14,26,0.45)', borderRadius: '2px 2px 0 0' }}>
        <ConstitutionTabs
        activeTab={plTab}
        onTabChange={setPlTab}
        scrollRef={scrollRef}
        showDestiny={countryOverride.destinyMode}
        />
        <ConstitutionStatus
        hasOverride={countryOverride.hasOverride}
        countryName={countries[countryOverride.plCountry]?.nom || countries[countryOverride.plCountry]?.realData?.nom}
        lang={lang}
        />
        </div>

        {constitution.plLoading && (
            <div style={{ fontFamily: FONT.mono, fontSize: '0.48rem', color: 'rgba(200,164,74,0.50)', padding: '1.5rem', textAlign: 'center' }}>
            {lang === 'en' ? 'Loading…' : 'Chargement…'}
            </div>
        )}

        {!constitution.plLoading && countryOverride.plAgents && (
            <div ref={scrollRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {/* Onglet RÉSUMÉ */}
            {plTab === 'resume' && (
                <>
                <ContextPanel
                countryName={countries[countryOverride.plCountry]?.nom || countries[countryOverride.plCountry]?.realData?.nom || `Nation ${countryOverride.plCountry + 1}`}
                open={countryContext.plCtxOpen === countryOverride.plCountry}
                onToggle={() => countryContext.setPlCtxOpen(p => p === countryOverride.plCountry ? null : countryOverride.plCountry)}
                mode={countryContext.plCtxModes[countryOverride.plCountry] || ''}
                setMode={v => countryContext.setPlCtxModes(p => { const a = [...p]; a[countryOverride.plCountry] = v; return a; })}
                override={countryContext.plCtxOvrs[countryOverride.plCountry] || ''}
                setOverride={v => countryContext.setPlCtxOvrs(p => { const a = [...p]; a[countryOverride.plCountry] = v; return a; })}
                />

                <IAConfigAccordion
                availProviders={iaConfig.availProviders}
                ariaMode={iaConfig.ariaMode}
                setAriaMode={iaConfig.setAriaMode}
                roles={iaConfig.roles}
                setRoles={iaConfig.setRoles}
                modelReg={iaConfig.modelReg}
                p0={iaConfig.p0}
                cfgOpen={iaConfig.cfgOpen}
                setCfgOpen={iaConfig.setCfgOpen}
                />

                <PresidencyTiles
                    presType={activePresToType(countryOverride.activePres)}
                    onSelect={v => countryOverride.setActivePres(typeToActivePres(v))}
                    isEn={lang === 'en'}
                    presSymbols={presSymbols}
                    onEditEmoji={(presId, emoji) => { sauvegarderEmojiAgent('presidency', presId, emoji); setEmojiVersion(v => v + 1); }}
                    showTrinaire={Object.keys(countryOverride.plAgents?.presidency || {}).some(k => !['phare','boussole'].includes(k))}
                />

                {/* Toggle Destinée du monde — entre présidence et ministères */}
                <button
                onClick={() => countryOverride.setDestinyMode(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.55rem',
                    padding: '0.48rem 0.65rem', width: '100%', textAlign: 'left',
                    background: countryOverride.destinyMode ? 'rgba(140,100,220,0.12)' : 'rgba(20,28,45,0.55)',
                    border: `1px solid ${countryOverride.destinyMode ? 'rgba(140,100,220,0.45)' : 'rgba(140,160,200,0.10)'}`,
                    borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: FONT.mono,
                }}
                >
                <span style={{ fontSize: '1.05rem' }}>👁️</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.50rem', color: countryOverride.destinyMode ? 'rgba(140,100,220,0.85)' : 'rgba(200,215,240,0.50)' }}>
                    {lang === 'en' ? 'Destiny of the World' : 'Destinée du Monde'}
                    </div>
                    <div style={{ fontSize: '0.41rem', color: 'rgba(140,160,200,0.45)', marginTop: '0.06rem' }}>
                    {lang === 'en' ? 'Oracle & Wyrd — existential crises' : 'Oracle & Wyrd — crises existentielles'}
                    </div>
                </div>
                <span style={{ fontSize: '0.45rem', color: countryOverride.destinyMode ? 'rgba(140,100,220,0.85)' : 'rgba(140,160,200,0.22)' }}>
                {countryOverride.destinyMode ? '● ACTIF' : '○ INACTIF'}
                </span>
                </button>

                <ActiveMinistriesSection
                ministries={countryOverride.plAgents.ministries}
                activeMins={countryOverride.activeMins}
                onToggleMinistry={(id) => {
                    const all = countryOverride.plAgents.ministries.map(x => x.id);
                    const cur = countryOverride.activeMins || all;
                    const on = cur.includes(id);
                    const next = on ? cur.filter(x => x !== id) : [...cur, id];
                    countryOverride.setActiveMins(next.length === all.length ? null : next);
                }}
                onSetAllActive={() => countryOverride.setActiveMins(null)}
                />

                <ActiveMinistersSection
                ministers={countryOverride.plAgents.ministers}
                activeMinsters={countryOverride.activeMinsters}
                onToggleMinister={countryOverride.toggleMinster}
                onSetAllActive={() => countryOverride.setActiveMinsters(null)}
                />
                </>
            )}

            {/* Onglet PRÉSIDENCE */}
            {plTab === 'presidency' && (
                <PresidencyDetail
                presidency={countryOverride.plAgents.presidency}
                activePres={countryOverride.activePres}
                setActivePres={countryOverride.setActivePres}
                setPlAgents={countryOverride.setPlAgents}
                />
            )}

            {/* Onglet MINISTÈRES */}
            {plTab === 'ministries' && (
                <MinistriesDetail
                plAgents={countryOverride.plAgents}
                activeMins={countryOverride.activeMins}
                setActiveMins={countryOverride.setActiveMins}
                selectedMinistry={countryOverride.selectedMinistry}
                setSelectedMinistry={countryOverride.setSelectedMinistry}
                newMinistryForm={ministerForms.newMinistryForm}
                setNewMinistryForm={ministerForms.setNewMinistryForm}
                newMinistryData={ministerForms.newMinistryData}
                setNewMinistryData={ministerForms.setNewMinistryData}
                addMinistry={addMinistry}
                setPlAgents={countryOverride.setPlAgents}
                />
            )}

            {/* Onglet MINISTRES */}
            {plTab === 'ministers' && (
                <MinistersDetail
                plAgents={countryOverride.plAgents}
                activeMinsters={countryOverride.activeMinsters}
                setActiveMinsters={countryOverride.setActiveMinsters}
                selectedMinister={countryOverride.selectedMinister}
                setSelectedMinister={countryOverride.setSelectedMinister}
                newMinForm={ministerForms.newMinForm}
                setNewMinForm={ministerForms.setNewMinForm}
                newMinData={ministerForms.newMinData}
                setNewMinData={ministerForms.setNewMinData}
                toggleMinster={countryOverride.toggleMinster}
                addMinister={addMinister}
                setPlAgents={countryOverride.setPlAgents}
                />
            )}

            {/* Onglet DESTINÉE */}
            {plTab === 'destinee' && (() => {
                const destin = getDestin();
                const destingIds = destin?.agents || [];
                const destAgents = destingIds
                    .map(id => ({ id, ...(countryOverride.plAgents.ministers?.[id] || {}) }))
                    .filter(a => a.name);
                const activeIds = countryOverride.activeDestinAgents;
                return (
                    <>
                    {/* Grille oracle/wyrd avec toggles individuels */}
                    <AgentGrid
                    agents={destAgents}
                    selectedId={selectedDestin}
                    activeIds={activeIds}
                    onAgentClick={id => {
                        // 1er clic = sélection, 2e clic = toggle actif
                        if (selectedDestin !== id) {
                            setSelectedDestin(id);
                        } else {
                            countryOverride.toggleDestinAgent(id);
                            setSelectedDestin(null);
                        }
                    }}
                    onResetAll={() => countryOverride.setActiveDestinAgents(null)}
                    onEditEmoji={(id, emoji) => {
                        sauvegarderEmojiAgent('ministers', id, emoji);
                        countryOverride.setPlAgents(p => ({ ...p, ministers: { ...p.ministers, [id]: { ...p.ministers[id], emoji } } }));
                    }}
                    countLabel={`${destAgents.length} ${lang === 'en' ? 'DESTINY AGENTS' : 'AGENTS DESTIN'}`}
                    lang={lang}
                    />

                    {/* Fiches éditables */}
                    {destAgents.map(agent => {
                        if (selectedDestin && selectedDestin !== agent.id) return null;
                        const on = activeIds === null || activeIds.includes(agent.id);
                        return (
                            <div key={agent.id} style={{ ...CARD_STYLE, border: `1px solid ${agent.color}33`, opacity: on ? 1 : 0.4 }}>
                            <div style={{ fontFamily: FONT.mono, fontSize: '0.44rem', color: agent.color + 'CC', marginBottom: '0.4rem' }}>
                            {agent.emoji} {agent.name?.toUpperCase()}
                            </div>
                            <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.12rem' }}>ESSENCE</div>
                            <textarea
                            style={{ ...INPUT_STYLE, width: '100%', minHeight: '40px', resize: 'vertical', fontSize: '0.40rem', fontFamily: FONT.mono, lineHeight: 1.5, marginBottom: '0.25rem' }}
                            readOnly={!on}
                            value={agent.essence || ''}
                            onChange={e => on && countryOverride.setPlAgents(a => ({
                                ...a,
                                ministers: { ...a.ministers, [agent.id]: { ...a.ministers[agent.id], essence: e.target.value } }
                            }))}
                            />
                            <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.12rem' }}>
                            {lang === 'en' ? 'COMMUNICATION STYLE' : 'STYLE DE COMMUNICATION'}
                            </div>
                            <textarea
                            style={{ ...INPUT_STYLE, width: '100%', minHeight: '32px', resize: 'vertical', fontSize: '0.40rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                            readOnly={!on}
                            value={agent.comm || ''}
                            onChange={e => on && countryOverride.setPlAgents(a => ({
                                ...a,
                                ministers: { ...a.ministers, [agent.id]: { ...a.ministers[agent.id], comm: e.target.value } }
                            }))}
                            />
                            </div>
                        );
                    })}
                    </>
                );
            })()}
            </div>
        )}

        {!constitution.plLoading && !countryOverride.plAgents && (
            <div style={{ fontFamily: FONT.mono, fontSize: '0.46rem', color: 'rgba(200,80,80,0.55)', textAlign: 'center', padding: '1rem' }}>
            ⚠ Impossible de charger les agents. Lancement avec les défauts du moteur.
            </div>
        )}

        {/* Boutons footer */}
        <div style={{ position:'fixed', bottom:'8vh', left:'50%', transform:'translateX(-50%)', width:'min(700px, 90vw)', display:'flex', gap:'0.6rem', justifyContent:'space-between', zIndex:20 }}>
        <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK', lang)}</button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
        style={{ ...BTN_SECONDARY, fontSize: '0.44rem', color: 'rgba(200,80,80,0.50)', border: '1px solid rgba(200,80,80,0.20)' }}
        onClick={constitution.resetAgents}
        >
        {lang === 'en' ? '↺ Default' : '↺ Défaut'}
        </button>
        <button style={BTN_PRIMARY} onClick={() => setConfirmLaunch(true)}>
        {t('GENERATE', lang)}
        </button>
        </div>
        </div>

        </>}

        {/* ── Modal GovernanceForm ─────────────────────────────────────────── */}
        {govModal && (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(4,8,18,0.85)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} onClick={() => setGovModal(false)}>
                <div style={{
                    width: 'min(560px, 92vw)', maxHeight: '80vh', overflowY: 'auto',
                    background: 'rgba(10,16,30,0.98)', border: '1px solid rgba(200,164,74,0.25)',
                    borderRadius: '4px', padding: '1.2rem 1rem 1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.8rem',
                }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: FONT.mono, fontSize: '0.54rem', letterSpacing: '0.12em', color: 'rgba(200,164,74,0.80)' }}>
                            {lang === 'en' ? 'WORLD GOVERNANCE' : 'GOUVERNANCE DU MONDE'}
                        </span>
                        <button onClick={() => setGovModal(false)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(140,160,200,0.45)', fontSize: '1rem', lineHeight: 1,
                        }}>✕</button>
                    </div>
                    <GovernanceForm
                        context="init"
                        opts={govOpts}
                        onChange={newOpts => {
                            setGovOpts(newOpts);
                            saveOptions(newOpts);
                            // Sync présidence dans les onglets constitution
                            const pType = newOpts.defaultGovernance?.presidency || 'duale';
                            const pMap = { solaire: ['phare'], lunaire: ['boussole'], collegiale: [], duale: ['phare', 'boussole'] };
                            countryOverride.setActivePres(pMap[pType] ?? ['phare', 'boussole']);
                        }}
                    />
                    <button
                        onClick={() => { setGovModal(false); setWorldAccepted(true); }}
                        style={{ ...BTN_PRIMARY, fontSize: '0.46rem' }}
                    >
                        {lang === 'en' ? 'Apply and continue →' : 'Appliquer et continuer →'}
                    </button>
                </div>
            </div>
        )}

        {/* Dialogue de confirmation */}
        <ConfirmLaunchDialog
        confirmLaunch={confirmLaunch}
        setConfirmLaunch={setConfirmLaunch}
        pendingDefs={pendingDefs}
        perGov={constitution.perGov}
        commonAgents={constitution.commonAgents}
        commonMins={constitution.commonMins}
        commonPres={constitution.commonPres}
        commonMinsters={constitution.commonMinsters}
        lang={lang}
        plCtxModes={countryContext.plCtxModes}
        plCtxOvrs={countryContext.plCtxOvrs}
        saveAndLaunch={handleLaunch}
        />
        </div>
    );
}
