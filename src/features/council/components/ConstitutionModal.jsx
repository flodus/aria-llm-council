// src/features/council/components/ConstitutionModal.jsx

/**
 * Modale de modification de la constitution en cours de jeu
 * Permet de modifier le régime, la présidence, les ministères, les ministres et leurs prompts
 *
 * @param {Object} props
 * @param {Object} props.country - Le pays dont on modifie la constitution
 * @param {function} props.onSave - Callback de sauvegarde (reçoit la constitution modifiée)
 * @param {function} props.onClose - Callback de fermeture
 */

import { useState, useEffect } from 'react';
import { useLocale } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../shared/theme';
import { getStats, getAgents, getOptions, DEFAULT_OPTIONS } from '../../../Dashboard_p1';
import { getDestin } from '../services/agentsManager';
import AgentGrid from '../../../shared/components/AgentGrid';
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from '../../../shared/data/ariaData';
import useConstitutionModal from '../hooks/useConstitutionModal';
import {
    PresidentsList,
    PresidentDetail,
    MinistersList,
    MinisterDetail,
    MinistriesList,
    MinistryDetail,
    NewMinisterForm,
    NewMinistryForm,
    PromptEditor
} from './constitution';

// Helpers localStorage pour les overrides (copié de l'ancien)
function readOv()   { try { return JSON.parse(localStorage.getItem('aria_agents_override')||'null'); } catch { return null; } }
function writeOv(d) { try { localStorage.setItem('aria_agents_override', JSON.stringify(d)); } catch {} }

export default function ConstitutionModal({ country, onSave, onClose }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';

    // Traductions inline (reprises de l'ancien)
    const tr = {
        title:        isEn ? '🏛️ Government'           : '🏛️ Gouvernement',
        tabRegime:    isEn ? 'REGIME'                   : 'RÉGIME',
        tabPres:      isEn ? 'PRESIDENCY'               : 'PRÉSIDENCE',
        tabMins:      isEn ? 'MINISTRIES'               : 'MINISTÈRES',
        tabMinisters: isEn ? 'MINISTERS'                : 'MINISTRES',
        secRegime:    isEn ? 'POLITICAL REGIME'         : 'RÉGIME POLITIQUE',
        secLeader:    isEn ? 'HEAD OF STATE'            : 'CHEF D\'ÉTAT',
        secContext:   isEn ? 'CONTEXT IN DELIBERATIONS' : 'CONTEXTE DANS LES DÉLIBÉRATIONS',
        contextHint:  isEn
        ? 'Controls which info about this country is injected into AI prompts. Leave "Inherit" to follow global setting.'
        : 'Contrôle quelles infos sur ce pays sont injectées dans les prompts IA. Laissez "Hérite du global" pour suivre le réglage général.',
        ctxInherit:   isEn ? '⚙️ Inherit global'        : '⚙️ Hérite du global',
        ctxInheritH:  isEn ? 'Follows the Settings rule': 'Suit le réglage de Settings',
        ctxAuto:      isEn ? '🤖 Auto'                  : '🤖 Auto',
        ctxRich:      isEn ? '📖 Enriched'              : '📖 Enrichi',
        ctxRichH:     isEn ? 'Full context — prompts AI to reason historically'
        : 'Contexte complet — incite l\'IA à raisonner historiquement',
        ctxStats:     isEn ? '📊 Stats only'            : '📊 Stats seules',
        ctxStatsH:    isEn ? 'Numbers only — neutral, fewer hallucinations'
        : 'Chiffres uniquement — neutre, moins d\'hallucinations',
        ctxOff:       isEn ? '🚫 Disabled'              : '🚫 Désactivé',
        ctxOffH:      isEn ? 'No context — blind deliberation for this country'
        : 'Aucun contexte — délibération à l\'aveugle pour ce pays',
        secCustomCtx: isEn ? 'CUSTOM CONTEXT'           : 'CONTEXTE PERSONNALISÉ',
        secPres:      isEn ? 'PRESIDENCY'               : 'PRÉSIDENCE',
        secMins:      isEn ? 'MINISTRIES'               : 'MINISTÈRES',
        destinyTitle: isEn ? 'DESTINY OF THE WORLD'     : 'DESTINÉE DU MONDE',
        destinyLabel: isEn ? '👁️ Oracle & Wyrd'          : '👁️ Oracle & Wyrd',
        destinyDesc:  isEn ? 'Activates Oracle and Wyrd for existential crises.'
        : 'Active Oracle et Wyrd pour les crises existentielles.',
        crisisTitle:  isEn ? 'CRISIS MANAGEMENT'        : 'GESTION DE CRISE',
        crisisLabel:  isEn ? '⚡ Crisis mode'            : '⚡ Mode crise',
        crisisDesc:   isEn ? 'Activates automatic crisis detection and adapted deliberation.'
        : 'Active la détection automatique des crises et la délibération adaptée.',
        assignedMins: isEn ? 'ASSIGNED MINISTERS'       : 'MINISTRES ASSIGNÉS',
        secMinisters: isEn ? 'MINISTERS'                : 'MINISTRES',
        cancel:       isEn ? 'Cancel'                   : 'Annuler',
        apply:        isEn ? '✓ Apply Configuration'    : '✓ Appliquer la Configuration',
    };

    // Récupération des options globales pour les valeurs par défaut
    const savedGov  = getOptions().defaultGovernance || {};
    const globalGov = {
        presidency:  savedGov.presidency  || 'duale',
        ministries:  savedGov.ministries  || getAgents().ministries.filter(m => m.base).map(m => m.id),
    };
    const current = { ...globalGov, ...(country?.governanceOverride || {}) };
    const BASE_IDS = getAgents().ministries.filter(m => m.base).map(m => m.id);


    // État local pour l'onglet actif
    const [activeTab, setActiveTab] = useState('regime');

    // États pour l'onglet régime
    const [regime, setRegime] = useState(country?.regime || 'democratie_liberale');
    const rawReal = (isEn ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA).find(r => r.id === country?.id);
    const ctxGeo  = rawReal?.triple_combo        || country?.geoContext  || '';
    const ctxSoc  = rawReal?.aria_sociology_logic || country?.description || '';

    const [leader, setLeader] = useState(typeof country?.leader === 'string' ? country.leader : (country?.leader?.nom || ''));
    const [contextMode, setContextMode] = useState(country?.context_mode || '');
    const [contextOverride, setContextOverride] = useState(country?.contextOverride || '');
    const [ctxOverrideOpen, setCtxOverrideOpen] = useState(!!country?.contextOverride);
    const [ctxAccOpen, setCtxAccOpen] = useState(country?.context_mode !== undefined || !!country?.contextOverride);
    const [destinyMode, setDestinyMode] = useState(!!(country?.governanceOverride?.destiny_mode));
    const [activeDestinAgents, setActiveDestinAgents] = useState(
        country?.governanceOverride?.active_destin_agents ?? (getDestin()?.agents || ['oracle', 'wyrd'])
    );
    const [selectedDestin, setSelectedDestin] = useState(null);

    // Hook personnalisé pour la constitution (gère tout sauf le régime)
    const {
        constitution,
        resetConstitution,
        selectedPresident,
        setSelectedPresident,
        selectedMinistry,
        setSelectedMinistry,
        selectedMinister,
        setSelectedMinister,
        togglePresident,
        updatePresidency,
        toggleMinistry,
        isMinistryActive,
        updateMinistryMission,
        assignMinisterToMinistry,
        toggleMinister,
        isMinisterActive,
        updateMinisterPrompt,
        updateMinisterEssence,
        updateMinisterComm,
        updateMinisterAnnotation,
        addMinister,
        addMinistry,
        deleteMinister,
        deleteMinistry,
        setAllMinistersActive,
        setAllMinistriesActive
    } = useConstitutionModal(country?.governance);

    // États pour l'UI des nouveaux ministres/ministères
    const [showNewMin, setShowNewMin] = useState(false);
    const [showNewMinistry, setShowNewMinistry] = useState(false);
    const [nMinD, setNMinD] = useState({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
    const [nMinistryD, setNMinistryD] = useState({ id:'', name:'', emoji:'🏛️', color:'#8090C0', mission:'', ministers:[] });

    // Gestionnaires de clic pour les listes
    const handlePresidentClick = (presidentId) => {
        if (selectedPresident === presidentId) {
            togglePresident(presidentId); // 2e clic = toggle
        } else {
            setSelectedPresident(presidentId);
        }
    };

    const handleMinisterClick = (ministerId) => {
        if (selectedMinister === ministerId) {
            toggleMinister(ministerId);
        } else {
            setSelectedMinister(ministerId);
        }
    };

    const handleMinistryClick = (ministryId) => {
        if (selectedMinistry === ministryId) {
            toggleMinistry(ministryId);
        } else {
            setSelectedMinistry(ministryId);
        }
    };

    // Sauvegarde
    const handleSave = () => {
        // Sauvegarde des agents dans localStorage (pour les modifications de ministres/ministères)
        if (constitution) {
            writeOv({
                ...constitution,
                active_ministries: constitution.activeMins,
                active_presidency: constitution.activePres,
                active_ministers: constitution.activeMinsters,
            });
        }

        // Construction de l'objet pays modifié
        const presStr = constitution.activePres.length === 0 ? 'collegiale'
        : constitution.activePres.length === 1
        ? (constitution.activePres[0] === 'phare' ? 'solaire' : 'lunaire')
        : 'duale';

        const regimeData = getStats().regimes?.[regime] || {};

        const updatedCountry = {
            ...country,
            regime,
            regimeName: regimeData.name || regime,
            regimeEmoji: regimeData.emoji || '🏛️',
            leader: leader || null,
            context_mode: contextMode || undefined,
            contextOverride: contextOverride || undefined,
            governanceOverride: {
                presidency: presStr,
                active_presidency: constitution.activePres,
                ministries: constitution.activeMins,
                active_ministers: constitution.activeMinsters,
                destiny_mode: destinyMode,
                active_destin_agents: activeDestinAgents,
                crisis_mode: constitution.crisisMode !== false,
            },
        };

        onSave(updatedCountry);
        onClose();
    };

    // Fermeture sans sauvegarde
    const handleClose = () => {
        resetConstitution();
        onClose();
    };

    // Style des onglets
    const tabStyle = (tabId) => ({
        ...BTN_SECONDARY,
        flex: 1,
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        borderBottom: activeTab === tabId ? '2px solid rgba(200,164,74,0.70)' : '2px solid transparent',
                                 color: activeTab === tabId ? 'rgba(200,164,74,0.90)' : 'rgba(140,160,200,0.35)',
                                 padding: '0.45rem 0.3rem',
                                 fontSize: '0.46rem',
                                 letterSpacing: '0.12em',
    });

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)'
        }} onClick={handleClose}>
        <div style={{
            width: '560px',
            maxWidth: '96vw',
            maxHeight: '90vh',
            background: '#0D1117',
            border: '1px solid rgba(200,164,74,0.22)',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: FONT,
            overflow: 'hidden'
        }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.68rem 1rem',
            borderBottom: '1px solid rgba(200,164,74,0.14)',
            background: 'rgba(200,164,74,0.04)'
        }}>
        <span style={{ fontSize: '0.60rem', letterSpacing: '0.18em', color: 'rgba(200,164,74,0.85)', textTransform: 'uppercase' }}>
        {tr.title} — {country?.nom || (isEn ? 'this country' : 'ce pays')}
        </span>
        <button
        onClick={handleClose}
        style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(200,164,74,0.40)',
            fontSize: '0.80rem',
            lineHeight: 1,
            padding: '0.1rem 0.3rem'
        }}
        >
        ✕
        </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(200,164,74,0.12)', flexWrap: 'wrap' }}>
        <button style={tabStyle('regime')} onClick={() => setActiveTab('regime')}>{tr.tabRegime}</button>
        <button style={tabStyle('presidency')} onClick={() => setActiveTab('presidency')}>{tr.tabPres}</button>
        <button style={tabStyle('ministries')} onClick={() => setActiveTab('ministries')}>{tr.tabMins}</button>
        <button style={tabStyle('ministers')} onClick={() => setActiveTab('ministers')}>{tr.tabMinisters}</button>
        {destinyMode && (
            <button style={{ ...tabStyle('destin'), color: activeTab === 'destin' ? 'rgba(140,100,220,0.90)' : 'rgba(140,100,220,0.40)', borderBottom: activeTab === 'destin' ? '2px solid rgba(140,100,220,0.70)' : '2px solid transparent' }}
            onClick={() => setActiveTab('destin')}>
            {isEn ? 'DESTINY' : 'DESTIN'}
            </button>
        )}
        </div>

        {/* Corps défilant */}
        <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '0.80rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem'
        }}>

        {/* ---------- ONGLET RÉGIME ---------- */}
        {activeTab === 'regime' && (
            <>
            {/* Régime */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
            <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase' }}>
            {tr.secRegime}
            </h3>
            <select
            style={SELECT_STYLE}
            value={regime}
            onChange={e => setRegime(e.target.value)}
            >
            {Object.entries(getStats().regimes || {})
              .sort(([, a], [, b]) => a.name.localeCompare(b.name, lang))
              .map(([k, v]) => (
                <option key={k} value={k}>{v.emoji || ''} {v.name}</option>
            ))}
            </select>
            </section>

            {/* Chef d'État */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
            <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase' }}>
            {tr.secLeader}
            </h3>
            <input
            style={{
                background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(200,164,74,0.18)',
                                    borderRadius: '2px',
                                    padding: '0.38rem 0.55rem',
                                    color: 'rgba(220,228,240,0.85)',
                                    fontFamily: FONT,
                                    fontSize: '0.50rem',
                                    outline: 'none'
            }}
            value={leader}
            onChange={e => setLeader(e.target.value)}
            placeholder={isEn ? "Head of state name…" : "Nom du dirigeant…"}
            />
            </section>

            {/* Toggle Destinée du monde */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
            <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase' }}>
            {tr.destinyTitle}
            </h3>
            <button
            onClick={() => setDestinyMode(v => !v)}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.55rem',
                padding: '0.48rem 0.65rem',
                background: destinyMode ? 'rgba(140,100,220,0.12)' : 'rgba(20,28,45,0.55)',
                border: `1px solid ${destinyMode ? 'rgba(140,100,220,0.45)' : 'rgba(140,160,200,0.10)'}`,
                borderRadius: '2px', cursor: 'pointer', width: '100%',
                textAlign: 'left', transition: 'all 0.15s', fontFamily: FONT,
            }}
            >
            <span style={{ fontSize: '1.05rem' }}>👁️</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.50rem', color: destinyMode ? 'rgba(140,100,220,0.85)' : 'rgba(200,215,240,0.50)' }}>{tr.destinyLabel}</div>
                <div style={{ fontSize: '0.41rem', color: 'rgba(140,160,200,0.45)', marginTop: '0.06rem' }}>{tr.destinyDesc}</div>
            </div>
            <span style={{ fontFamily: FONT, fontSize: '0.45rem', color: destinyMode ? 'rgba(140,100,220,0.85)' : 'rgba(140,160,200,0.22)' }}>
                {destinyMode ? '● ACTIF' : '○ INACTIF'}
            </span>
            </button>
            </section>

            {/* Contexte délibérations — accordéon */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
            <button
            onClick={() => setCtxAccOpen(v => !v)}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, fontFamily: FONT, textAlign: 'left',
            }}
            >
            <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase', flex: 1 }}>
                {tr.secContext}{contextMode ? ' ●' : ''}
            </h3>
            <span style={{ color: 'rgba(200,164,74,0.40)', fontSize: '0.55rem' }}>{ctxAccOpen ? '▾' : '▸'}</span>
            </button>
            {ctxAccOpen && (
                <>
                <p style={{ fontSize: '0.40rem', color: 'rgba(140,160,200,0.48)', margin: 0, lineHeight: 1.5 }}>
                {tr.contextHint}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
                {[
                    ['', tr.ctxInherit, tr.ctxInheritH],
                    ['auto', '🤖 Auto', 'Stats + description si disponible'],
                    ['rich', tr.ctxRich, tr.ctxRichH],
                    ['stats_only', tr.ctxStats, tr.ctxStatsH],
                    ['off', tr.ctxOff, tr.ctxOffH],
                ].map(([val, lbl, hint]) => {
                    const on = contextMode === val;
                    return (
                        <label
                        key={val}
                        style={{
                            display: 'flex', alignItems: 'flex-start',
                            gap: '0.45rem', cursor: 'pointer',
                            padding: '0.30rem 0.45rem', borderRadius: '2px',
                            background: on ? 'rgba(200,164,74,0.08)' : 'transparent',
                            border: `1px solid ${on ? 'rgba(200,164,74,0.28)' : 'transparent'}`
                        }}
                        >
                        <input
                        type="radio" name="ctx_mode" value={val}
                        checked={on} onChange={() => setContextMode(val)}
                        style={{ marginTop: '0.08rem', accentColor: '#C8A44A' }}
                        />
                        <div>
                        <div style={{ fontFamily: FONT, fontSize: '0.50rem', color: 'rgba(220,228,240,0.85)' }}>{lbl}</div>
                        <div style={{ fontSize: '0.44rem', color: 'rgba(140,160,200,0.48)', marginTop: '0.08rem', lineHeight: 1.4 }}>{hint}</div>
                        </div>
                        </label>
                    );
                })}
                </div>

                {/* Contexte actuel + personnalisé */}
                <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: '0.35rem 0 0.20rem', textTransform: 'uppercase' }}>
                {isEn ? 'CURRENT CONTEXT' : 'CONTEXTE ACTUEL'}
                </h3>
                {(ctxGeo || ctxSoc)
                    ? <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {ctxGeo && <p style={{ fontSize: '0.41rem', color: 'rgba(140,160,200,0.55)', margin: 0, lineHeight: 1.6 }}>{ctxGeo}</p>}
                    {ctxSoc && <p style={{ fontSize: '0.41rem', color: 'rgba(140,160,200,0.45)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{ctxSoc}</p>}
                    </div>
                    : <p style={{ fontSize: '0.40rem', color: 'rgba(140,160,200,0.28)', margin: 0 }}>—</p>
                }
                <button
                style={{ ...BTN_SECONDARY, alignSelf: 'flex-start', fontSize: '0.42rem', padding: '0.22rem 0.55rem' }}
                onClick={() => setCtxOverrideOpen(v => !v)}
                >
                {ctxOverrideOpen ? '▾' : '▸'} {isEn ? 'Custom context' : 'Contexte personnalisé'}
                {contextOverride ? ' ●' : ''}
                </button>
                {ctxOverrideOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
                    <p style={{ fontSize: '0.40rem', color: 'rgba(140,160,200,0.45)', margin: 0, lineHeight: 1.5 }}>
                    {isEn
                        ? 'Replaces the context above in all AI deliberations for this country.'
                        : 'Remplace le contexte ci-dessus dans toutes les délibérations IA pour ce pays.'}
                    </p>
                    <textarea
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${contextOverride ? 'rgba(200,164,74,0.30)' : 'rgba(200,164,74,0.18)'}`,
                        borderRadius: '2px', padding: '0.38rem 0.55rem',
                        color: 'rgba(220,228,240,0.85)', fontFamily: FONT,
                        fontSize: '0.50rem', outline: 'none',
                        minHeight: '80px', resize: 'vertical', lineHeight: 1.55
                    }}
                    value={contextOverride}
                    onChange={e => setContextOverride(e.target.value)}
                    placeholder={isEn
                        ? `E.g. ${country?.nom || 'This country'} is an island theocracy whose constitution dates from 1847…`
                        : `Ex : ${country?.nom || 'Ce pays'} est une théocratie insulaire dont la constitution date de 1847…`}
                    />
                    {contextOverride && (
                        <button
                        style={{ ...BTN_SECONDARY, alignSelf: 'flex-end', fontSize: '0.42rem', color: 'rgba(200,80,80,0.50)', border: '1px solid rgba(200,80,80,0.20)' }}
                        onClick={() => setContextOverride('')}
                        >
                        {isEn ? '✕ Clear' : '✕ Effacer'}
                        </button>
                    )}
                    </div>
                )}
                </>
            )}
            </section>
            </>
        )}

        {/* ---------- ONGLET PRÉSIDENCE ---------- */}
        {activeTab === 'presidency' && (
            <>
            <PresidentsList
            presidents={constitution.presidency}
            activePres={constitution.activePres}
            onPresidentClick={handlePresidentClick}
            onCollegiale={() => constitution.activePres.forEach(id => togglePresident(id))}
            lang={lang}
            />

            {selectedPresident && constitution.presidency[selectedPresident] && (
                <PresidentDetail
                president={constitution.presidency[selectedPresident]}
                presidentId={selectedPresident}
                isActive={constitution.activePres.includes(selectedPresident)}
                isSelected={true}
                onToggleActive={() => togglePresident(selectedPresident)}
                onUpdateField={(field, value) => updatePresidency(selectedPresident, field, value)}
                onClose={() => setSelectedPresident(null)}
                />
            )}
            </>
        )}

        {/* ---------- ONGLET MINISTÈRES ---------- */}
        {activeTab === 'ministries' && (
            <>
            <MinistriesList
            ministries={constitution.ministries}
            activeMins={constitution.activeMins}
            onToggleMinistry={toggleMinistry}
            onMinistryClick={handleMinistryClick}
            onSetAllActive={setAllMinistriesActive}
            />

            {/* Bouton pour ajouter un nouveau ministère */}
            {showNewMinistry ? (
                <NewMinistryForm
                formData={nMinistryD}
                setFormData={setNMinistryD}
                onCancel={() => setShowNewMinistry(false)}
                onSubmit={() => {
                    // Implémente la logique d'ajout (ex: appeler une fonction du hook)
                    // Par exemple : addMinistry(nMinistryD);
                    const id = nMinistryD.id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
                    if (!id || constitution.ministries.some(m => m.id === id)) return;
                    addMinistry({ ...nMinistryD, id }, (newId) => {
                        setSelectedMinistry(newId);
                    });
                    setNMinistryD({ id:'', name:'', emoji:'🏛️', color:'#8090C0', mission:'', ministers:[] });
                    setShowNewMinistry(false);
                }}
                />
            ) : (
                <button style={{ ...BTN_SECONDARY, alignSelf: 'center', color: 'rgba(100,160,255,0.55)', border: '1px solid rgba(100,160,255,0.22)' }}
                onClick={() => setShowNewMinistry(true)}>
                + {isEn ? 'New ministry' : 'Nouveau ministère'}
                </button>
            )}
            {/* Détail du ministère sélectionné */}
            {selectedMinistry && (
                <MinistryDetail
                ministry={constitution.ministries.find(m => m.id === selectedMinistry)}
                isActive={isMinistryActive(selectedMinistry)}
                isSelected={true}
                onToggleActive={() => toggleMinistry(selectedMinistry)}
                onUpdateMission={(newMission) => updateMinistryMission(selectedMinistry, newMission)}
                ministers={constitution.ministers}
                onAssignMinister={(ministerId, isIn) => assignMinisterToMinistry(selectedMinistry, ministerId, isIn)}
                onUpdatePrompt={(ministerId, newPrompt) => updateMinisterPrompt(selectedMinistry, ministerId, newPrompt)}
                onClose={() => setSelectedMinistry(null)}
                onDelete={() => {
                    deleteMinistry(selectedMinistry);
                    setSelectedMinistry(null);
                }}
                isBase={BASE_IDS.includes(selectedMinistry)}
                />
            )}


            </>
        )}

        {/* ---------- ONGLET MINISTRES ---------- */}
        {activeTab === 'ministers' && (
            <>
            <MinistersList
            ministers={constitution.ministers}
            activeMinsters={constitution.activeMinsters}
            onMinisterClick={handleMinisterClick}
            onSetAllActive={setAllMinistersActive}
            />
            {/* Bouton pour ajouter un nouveau ministre */}
            {showNewMin ? (
                <NewMinisterForm
                formData={nMinD}
                setFormData={setNMinD}
                onCancel={() => setShowNewMin(false)}
                onSubmit={() => {
                    // Implémente la logique d'ajout (ex: appeler une fonction du hook)
                    // Par exemple : addMinister(nMinisterD);
                    const id = nMinD.id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
                    if (!id || constitution.ministers[id]) return;
                    addMinister({ ...nMinD, id }, (newId) => {
                        setSelectedMinister(newId);
                    });
                    setNMinD({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
                    setShowNewMin(false);
                }}
                />
            ) : (

                <button style={{ ...BTN_SECONDARY, alignSelf: 'center', color: 'rgba(100,200,120,0.55)', border: '1px solid rgba(100,200,120,0.22)' }}
                onClick={() => setShowNewMin(true)}>
                + {isEn ? 'New minister' : 'Nouveau ministre'}
                </button>
            )}
            {/* Détail du ministre sélectionné */}
            {selectedMinister && constitution.ministers[selectedMinister] && (
                <MinisterDetail
                minister={constitution.ministers[selectedMinister]}
                ministerId={selectedMinister}
                isActive={isMinisterActive(selectedMinister)}
                isSelected={true}
                onToggleActive={() => toggleMinister(selectedMinister)}
                onUpdateEssence={(value) => updateMinisterEssence(selectedMinister, value)}
                onUpdateComm={(value) => updateMinisterComm(selectedMinister, value)}
                onUpdateAnnotation={(value) => updateMinisterAnnotation(selectedMinister, value)}
                onClose={() => setSelectedMinister(null)}
                onDelete={() => {
                    deleteMinister(selectedMinister);
                    setSelectedMinister(null);
                }}
                isCustom={constitution.ministers[selectedMinister]?.sign === 'Custom'}
                />
            )}

            </>
        )}

        {/* ---------- ONGLET DESTIN ---------- */}
        {activeTab === 'destin' && (() => {
            const destin = getDestin();
            const destingIds = destin?.agents || [];
            const destAgents = destingIds
                .map(id => ({ id, ...(constitution.ministers?.[id] || getAgents().ministers?.[id] || {}) }))
                .filter(a => a.name);

            const toggleDestinAgent = (id) => {
                setActiveDestinAgents(prev => {
                    const all = destin?.agents || [];
                    const cur = prev || all;
                    const on = cur.includes(id);
                    const next = on ? cur.filter(k => k !== id) : [...cur, id];
                    if (next.length === 0) {
                        setDestinyMode(false);
                        setActiveTab('regime');
                        return all;
                    }
                    return next.length === all.length ? all : next;
                });
            };

            return (
                <>
                <AgentGrid
                agents={destAgents}
                selectedId={selectedDestin}
                activeIds={activeDestinAgents}
                onAgentClick={id => {
                    if (selectedDestin !== id) {
                        setSelectedDestin(id);
                    } else {
                        toggleDestinAgent(id);
                        setSelectedDestin(null);
                    }
                }}
                onResetAll={() => setActiveDestinAgents(destin?.agents || [])}
                countLabel={`${destAgents.length} ${isEn ? 'DESTINY AGENTS' : 'AGENTS DESTIN'}`}
                lang={lang}
                />

                {destAgents.map(agent => {
                    if (selectedDestin && selectedDestin !== agent.id) return null;
                    const on = activeDestinAgents === null || activeDestinAgents.includes(agent.id);
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
                        onChange={e => on && updateMinisterEssence && updateMinisterEssence(agent.id, e.target.value)}
                        />
                        <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.12rem' }}>
                        {isEn ? 'COMMUNICATION STYLE' : 'STYLE DE COMMUNICATION'}
                        </div>
                        <textarea
                        style={{ ...INPUT_STYLE, width: '100%', minHeight: '32px', resize: 'vertical', fontSize: '0.40rem', fontFamily: FONT.mono, lineHeight: 1.5 }}
                        readOnly={!on}
                        value={agent.comm || ''}
                        onChange={e => on && updateMinisterComm && updateMinisterComm(agent.id, e.target.value)}
                        />
                        </div>
                    );
                })}
                </>
            );
        })()}
        </div>

        {/* Footer */}
        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.6rem',
            padding: '0.68rem 1rem',
            borderTop: '1px solid rgba(200,164,74,0.12)',
            background: 'rgba(0,0,0,0.22)'
        }}>
        <button style={BTN_SECONDARY} onClick={handleClose}>
        {tr.cancel}
        </button>
        <button style={BTN_PRIMARY} onClick={handleSave}>
        {tr.apply}
        </button>
        </div>
        </div>
        </div>
    );
}
