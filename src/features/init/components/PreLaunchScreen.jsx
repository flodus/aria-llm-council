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

import { useRef, useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { FONT, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../shared/theme';
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
    CountryContextAccordion,
    ConfirmLaunchDialog
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.2rem',
            width: '100%',
            maxWidth: 680,
            padding: '2rem',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 2rem)',
            boxSizing: 'border-box'
        }}>
        <ARIAHeader showQuote={false} />

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

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid rgba(200,164,74,0.10)', width: '100%' }}>
        <ConstitutionTabs
        activeTab={plTab}
        onTabChange={setPlTab}
        scrollRef={scrollRef}
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
            <div ref={scrollRef} style={{ width: '100%', overflowY: 'auto', maxHeight: '64vh', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {/* Onglet RÉSUMÉ */}
            {plTab === 'resume' && (
                <>
                <CountryContextAccordion
                pendingDefs={pendingDefs}
                plCtxOpen={countryContext.plCtxOpen}
                setPlCtxOpen={countryContext.setPlCtxOpen}
                plCtxModes={countryContext.plCtxModes}
                setPlCtxModes={countryContext.setPlCtxModes}
                plCtxOvrs={countryContext.plCtxOvrs}
                setPlCtxOvrs={countryContext.setPlCtxOvrs}
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

                <ActivePresidencySection
                presidency={countryOverride.plAgents.presidency}
                activePres={countryOverride.activePres}
                onTogglePresidency={(key) => countryOverride.setActivePres(prev =>
                    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                )}
                />

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
            </div>
        )}

        {!constitution.plLoading && !countryOverride.plAgents && (
            <div style={{ fontFamily: FONT.mono, fontSize: '0.46rem', color: 'rgba(200,80,80,0.55)', textAlign: 'center', padding: '1rem' }}>
            ⚠ Impossible de charger les agents. Lancement avec les défauts du moteur.
            </div>
        )}

        {/* Boutons footer */}
        <div style={{ display: 'flex', gap: '0.6rem', width: '100%', justifyContent: 'space-between' }}>
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
