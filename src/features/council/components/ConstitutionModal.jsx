// src/features/council/components/ConstitutionModal.jsx
// Hub d'état — orchestre les 5 onglets de constitution

import { useState } from 'react';
import { useLocale } from '../../../ariaI18n';
import { FONT, BTN_PRIMARY, BTN_SECONDARY } from '../../../shared/theme';
import { getStats } from '../../../shared/data/gameData';
import { getOptions } from '../../../shared/config/options';
import { getAgentsEffectifs, getEmojiOverrides } from '../../../shared/utils/agentsOverrides';
import { ecrireAgentsOverride } from '../../../shared/utils/storage';
import useConstitutionModal from '../hooks/useConstitutionModal';
import {
    TabRegime, TabPresidence, TabMinisteres, TabMinistres, TabDestin,
} from './constitution';

export default function ConstitutionModal({ country, onSave, onClose }) {
    const { lang } = useLocale();
    const isEn = lang === 'en';

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
        ctxRich:      isEn ? '📖 Enriched'              : '📖 Enrichi',
        ctxRichH:     isEn ? 'Full context — prompts AI to reason historically' : 'Contexte complet — incite l\'IA à raisonner historiquement',
        ctxStats:     isEn ? '📊 Stats only'            : '📊 Stats seules',
        ctxStatsH:    isEn ? 'Numbers only — neutral, fewer hallucinations' : 'Chiffres uniquement — neutre, moins d\'hallucinations',
        ctxOff:       isEn ? '🚫 Disabled'              : '🚫 Désactivé',
        ctxOffH:      isEn ? 'No context — blind deliberation for this country' : 'Aucun contexte — délibération à l\'aveugle pour ce pays',
        destinyTitle: isEn ? 'DESTINY OF THE WORLD'     : 'DESTINÉE DU MONDE',
        destinyLabel: isEn ? '👁️ Oracle & Wyrd'          : '👁️ Oracle & Wyrd',
        destinyDesc:  isEn ? 'Activates Oracle and Wyrd for existential crises.' : 'Active Oracle et Wyrd pour les crises existentielles.',
        cancel:       isEn ? 'Cancel'                   : 'Annuler',
        apply:        isEn ? '✓ Apply Configuration'    : '✓ Appliquer la Configuration',
    };

    // ── État onglet ──────────────────────────────────────────────────────────
    const [activeTab, setActiveTab]     = useState('regime');
    const [confirmReset, setConfirmReset] = useState(false);

    // ── État onglet Régime ───────────────────────────────────────────────────
    const [emoji, setEmoji]                   = useState(country?.emoji || '🌍');
    const [regime, setRegime]                 = useState(country?.regime || 'democratie_liberale');
    const [leader, setLeader]                 = useState(typeof country?.leader === 'string' ? country.leader : (country?.leader?.nom || ''));
    const [contextMode, setContextMode]           = useState(country?.context_mode || '');
    const [contextOverride, setContextOverride]   = useState(country?.contextOverride || '');
    const [ctxOverrideOpen, setCtxOverrideOpen]   = useState(!!country?.contextOverride);
    const [ctxAccOpen, setCtxAccOpen]             = useState(country?.context_mode !== undefined || !!country?.contextOverride || country?.chroniqueur_enabled !== undefined);
    const [chroniqueurEnabled, setChroniqueurEnabled] = useState(country?.chroniqueur_enabled ?? null); // null = hérite global
    const [destinyMode, setDestinyMode]       = useState(!!(country?.governanceOverride?.destiny_mode));

    // ── État onglet Destin ───────────────────────────────────────────────────
    const [activeDestinAgents, setActiveDestinAgents] = useState(
        country?.governanceOverride?.active_destin_agents ?? (['oracle', 'wyrd'])
    );
    const [selectedDestin, setSelectedDestin] = useState(null);

    // ── Hook constitution ────────────────────────────────────────────────────
    const {
        constitution, resetConstitution,
        selectedPresident, setSelectedPresident,
        selectedMinistry,  setSelectedMinistry,
        selectedMinister,  setSelectedMinister,
        togglePresident, setActivePres, updatePresidency,
        toggleMinistry,  isMinistryActive, updateMinistryMission,
        assignMinisterToMinistry, updateMinisterPrompt,
        toggleMinister, isMinisterActive,
        updateMinisterPrompt: _unused,
        updateMinisterEssence, updateMinisterComm,
        updateMinisterAnnotation,
        addMinister, addMinistry, deleteMinister, deleteMinistry,
        setAllMinistersActive, setAllMinistriesActive,
        addPresident, deletePresident,
    } = useConstitutionModal(country?.governance);

    // ── État formulaires nouveaux éléments ───────────────────────────────────
    const [showNewMin, setShowNewMin]           = useState(false);
    const [showNewMinistry, setShowNewMinistry] = useState(false);
    const [showNewPresident, setShowNewPresident] = useState(false);
    const [nPresD, setNPresD] = useState({ id:'', name:'', emoji:'★', subtitle:'', essence:'' });
    const [nMinD, setNMinD]   = useState({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
    const [nMinistryD, setNMinistryD] = useState({ id:'', name:'', emoji:'🏛️', color:'#8090C0', mission:'', ministers:[] });
    const [emojiVersion, setEmojiVersion] = useState(0);

    const presSymbols = (() => { const ov = getEmojiOverrides(); return ov.presidency || {}; })();
    const savedGov    = getOptions().defaultGovernance || {};
    const BASE_IDS    = getAgentsEffectifs().ministries.filter(m => m.base).map(m => m.id);

    // ── Sauvegarde ───────────────────────────────────────────────────────────
    const handleSave = () => {
        if (constitution) {
            ecrireAgentsOverride({
                ...constitution,
                active_ministries: constitution.activeMins,
                active_presidency: constitution.activePres,
                active_ministers:  constitution.activeMinsters,
            });
        }
        const presStr = constitution.activePres.length === 0 ? 'collegiale'
            : constitution.activePres.length === 1
            ? (constitution.activePres[0] === 'phare' ? 'solaire' : constitution.activePres[0] === 'boussole' ? 'lunaire' : 'solaire')
            : constitution.activePres.length === 2 ? 'duale' : 'trinaire';

        const regimeData = getStats().regimes?.[regime] || {};
        onSave({
            ...country, emoji, regime,
            regimeName:  regimeData.name  || regime,
            regimeEmoji: regimeData.emoji || '🏛️',
            leader: leader || null,
            context_mode:        contextMode    || undefined,
            contextOverride:     contextOverride || undefined,
            chroniqueur_enabled: chroniqueurEnabled !== null ? chroniqueurEnabled : undefined,
            governanceOverride: {
                presidency:          presStr,
                active_presidency:   constitution.activePres,
                ministries:          constitution.activeMins,
                active_ministers:    constitution.activeMinsters,
                destiny_mode:        destinyMode,
                active_destin_agents: activeDestinAgents,
                crisis_mode:         constitution.crisisMode !== false,
            },
        });
        onClose();
    };

    const handleClose = () => { resetConstitution(); onClose(); };

    const tabStyle = (tabId) => ({
        ...BTN_SECONDARY, flex: 1, borderRadius: 0,
        borderLeft: 'none', borderRight: 'none', borderTop: 'none',
        borderBottom: activeTab === tabId ? '2px solid rgba(200,164,74,0.70)' : '2px solid transparent',
        color:   activeTab === tabId ? 'rgba(200,164,74,0.90)' : 'rgba(140,160,200,0.35)',
        padding: '0.45rem 0.3rem', fontSize: '0.46rem', letterSpacing: '0.12em',
    });

    // ── Rendu ────────────────────────────────────────────────────────────────
    return (
        <div style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)' }} onClick={handleClose}>
        <div style={{ width:'560px', maxWidth:'96vw', maxHeight:'90vh', background:'#0D1117', border:'1px solid rgba(200,164,74,0.22)', borderRadius:'2px', display:'flex', flexDirection:'column', fontFamily:FONT, overflow:'hidden' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.68rem 1rem', borderBottom:'1px solid rgba(200,164,74,0.14)', background:'rgba(200,164,74,0.04)' }}>
                <span style={{ fontSize:'0.60rem', letterSpacing:'0.18em', color:'rgba(200,164,74,0.85)', textTransform:'uppercase' }}>
                    {tr.title} — {country?.nom || (isEn ? 'this country' : 'ce pays')}
                </span>
                <button onClick={handleClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(200,164,74,0.40)', fontSize:'0.80rem', lineHeight:1, padding:'0.1rem 0.3rem' }}>✕</button>
            </div>

            {/* Bandeau statut constitution */}
            <div style={{ padding:'0.28rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem', background: country?.governanceOverride ? 'rgba(200,164,74,0.04)' : 'rgba(140,160,200,0.02)', borderBottom:'1px solid rgba(200,164,74,0.08)' }}>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', letterSpacing:'0.06em', color: country?.governanceOverride ? 'rgba(200,164,74,0.70)' : 'rgba(140,160,200,0.35)' }}>
                    {country?.governanceOverride ? '✦ CONSTITUTION PROPRE' : '⚙️ SUIT LE MODÈLE MONDE'}
                </span>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid rgba(200,164,74,0.12)', flexWrap:'wrap' }}>
                <button style={tabStyle('regime')}    onClick={() => setActiveTab('regime')}>{tr.tabRegime}</button>
                <button style={tabStyle('presidency')} onClick={() => setActiveTab('presidency')}>{tr.tabPres}</button>
                <button style={tabStyle('ministries')} onClick={() => setActiveTab('ministries')}>{tr.tabMins}</button>
                <button style={tabStyle('ministers')}  onClick={() => setActiveTab('ministers')}>{tr.tabMinisters}</button>
                {destinyMode && (
                    <button style={{ ...tabStyle('destin'), color: activeTab === 'destin' ? 'rgba(140,100,220,0.90)' : 'rgba(140,100,220,0.40)', borderBottom: activeTab === 'destin' ? '2px solid rgba(140,100,220,0.70)' : '2px solid transparent' }}
                        onClick={() => setActiveTab('destin')}>
                        {isEn ? 'DESTINY' : 'DESTIN'}
                    </button>
                )}
            </div>

            {/* Corps défilant */}
            <div style={{ overflowY:'auto', flex:1, padding:'0.80rem 1rem', display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                {activeTab === 'regime' && (
                    <TabRegime country={country} isEn={isEn} tr={tr}
                        state={{ emoji, regime, leader, contextMode, contextOverride, ctxAccOpen, ctxOverrideOpen, destinyMode, chroniqueurEnabled }}
                        handlers={{ setEmoji, setRegime, setLeader, setContextMode, setContextOverride, setCtxAccOpen, setCtxOverrideOpen, setDestinyMode, setChroniqueurEnabled }}
                    />
                )}
                {activeTab === 'presidency' && (
                    <TabPresidence isEn={isEn} constitution={constitution} presSymbols={presSymbols}
                        selectedPresident={selectedPresident} setSelectedPresident={setSelectedPresident}
                        setActivePres={setActivePres} togglePresident={togglePresident}
                        updatePresidency={updatePresidency} addPresident={addPresident} deletePresident={deletePresident}
                        setEmojiVersion={setEmojiVersion}
                        showNewPresident={showNewPresident} setShowNewPresident={setShowNewPresident}
                        nPresD={nPresD} setNPresD={setNPresD}
                    />
                )}
                {activeTab === 'ministries' && (
                    <TabMinisteres isEn={isEn} constitution={constitution} BASE_IDS={BASE_IDS}
                        selectedMinistry={selectedMinistry} setSelectedMinistry={setSelectedMinistry}
                        toggleMinistry={toggleMinistry} isMinistryActive={isMinistryActive}
                        updateMinistryMission={updateMinistryMission}
                        assignMinisterToMinistry={assignMinisterToMinistry}
                        updateMinisterPrompt={updateMinisterPrompt}
                        addMinistry={addMinistry} deleteMinistry={deleteMinistry}
                        setAllMinistriesActive={setAllMinistriesActive} setEmojiVersion={setEmojiVersion}
                        showNewMinistry={showNewMinistry} setShowNewMinistry={setShowNewMinistry}
                        nMinistryD={nMinistryD} setNMinistryD={setNMinistryD}
                    />
                )}
                {activeTab === 'ministers' && (
                    <TabMinistres isEn={isEn} constitution={constitution}
                        selectedMinister={selectedMinister} setSelectedMinister={setSelectedMinister}
                        toggleMinister={toggleMinister} isMinisterActive={isMinisterActive}
                        updateMinisterEssence={updateMinisterEssence} updateMinisterComm={updateMinisterComm}
                        updateMinisterAnnotation={updateMinisterAnnotation}
                        addMinister={addMinister} deleteMinister={deleteMinister}
                        setAllMinistersActive={setAllMinistersActive} setEmojiVersion={setEmojiVersion}
                        showNewMin={showNewMin} setShowNewMin={setShowNewMin}
                        nMinD={nMinD} setNMinD={setNMinD}
                    />
                )}
                {activeTab === 'destin' && (
                    <TabDestin isEn={isEn} constitution={constitution} lang={lang}
                        selectedDestin={selectedDestin} setSelectedDestin={setSelectedDestin}
                        activeDestinAgents={activeDestinAgents} setActiveDestinAgents={setActiveDestinAgents}
                        setDestinyMode={setDestinyMode} setActiveTab={setActiveTab}
                        updateMinisterEssence={updateMinisterEssence} updateMinisterComm={updateMinisterComm}
                        setEmojiVersion={setEmojiVersion}
                    />
                )}
            </div>

            {/* Footer */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.68rem 1rem', borderTop:'1px solid rgba(200,164,74,0.12)', background:'rgba(0,0,0,0.22)' }}>
                {country?.governanceOverride && (
                    confirmReset
                    ? <>
                        <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(200,80,80,0.60)' }}>
                            {isEn ? 'Confirm reset?' : 'Confirmer ?'}
                        </span>
                        <button style={{ ...BTN_SECONDARY, fontSize:'0.42rem' }} onClick={() => setConfirmReset(false)}>
                            {isEn ? 'No' : 'Non'}
                        </button>
                        <button style={{ ...BTN_SECONDARY, fontSize:'0.42rem', color:'rgba(200,80,80,0.55)', border:'1px solid rgba(200,80,80,0.30)' }}
                            onClick={() => { onSave({ ...country, governanceOverride: null }); onClose(); }}>
                            {isEn ? '↺ Yes' : '↺ Oui'}
                        </button>
                      </>
                    : <button style={{ ...BTN_SECONDARY, fontSize:'0.42rem', color:'rgba(200,80,80,0.50)', border:'1px solid rgba(200,80,80,0.20)' }}
                        onClick={() => setConfirmReset(true)}>
                        {isEn ? '↺ Revert to world model' : '↺ Revenir au modèle monde'}
                      </button>
                )}
                <div style={{ display:'flex', gap:'0.6rem', marginLeft:'auto' }}>
                    <button style={BTN_SECONDARY} onClick={handleClose}>{tr.cancel}</button>
                    <button style={BTN_PRIMARY}    onClick={handleSave}>{tr.apply}</button>
                </div>
            </div>

        </div>
        </div>
    );
}
