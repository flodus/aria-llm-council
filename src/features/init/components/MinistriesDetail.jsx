// src/features/init/components/MinistriesDetail.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  MinistriesDetail.jsx — Onglet de configuration détaillée des ministères
//
//  Affiche une grille de sélection (actif/inactif) et, en dessous,
//  la fiche éditable de chaque ministère : mission, liste de ministres assignés,
//  et prompts ministériels individuels.
//  Les ministères de base (BASE_IDS) ne peuvent pas être supprimés.
//
//  Dépendances : government/ (Hint, ActiveToggle, ColorPicker, EmojiPicker, DeleteButton)
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { getAgentsEffectifs } from '../../../shared/utils/agentsOverrides';
import { sauvegarderEmojiAgent } from '../../../shared/utils/agentsOverrides';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../shared/theme';
import { Hint, ActiveToggle, ColorPicker, EmojiPicker, DeleteButton } from './government';
import AgentGrid from '../../../shared/components/AgentGrid';

export default function MinistriesDetail({
    plAgents,
    activeMins,
    setActiveMins,
    selectedMinistry,
    setSelectedMinistry,
    newMinistryForm,
    setNewMinistryForm,
    newMinistryData,
    setNewMinistryData,
    addMinistry,
    setPlAgents
}) {
    const { lang } = useLocale();
    const BASE_IDS = getAgentsEffectifs().ministries.filter(m => m.base).map(m => m.id);

    // ── Helpers grille ────────────────────────────────────────────────────

    // Bascule un ministère actif/inactif ; repasse à null si tous sont actifs
    const toggleMinById = (id) => {
        const all = plAgents.ministries.map(x => x.id);
        const cur = activeMins || all;
        const on = cur.includes(id);
        const next = on ? cur.filter(x => x !== id) : [...cur, id];
        setActiveMins(next.length === all.length ? null : next);
    };

    // Clic sur la grille : premier clic sélectionne, second clic désactive/réactive
    const handleGridClickMin = (id) => {
        if (selectedMinistry !== id) {
            setSelectedMinistry(id);
        } else {
            const on = activeMins === null || activeMins.includes(id);
            if (on) {
                toggleMinById(id);
                setSelectedMinistry(null);
            } else {
                toggleMinById(id);
            }
        }
    };

    // null = tous actifs (héritage commun)
    const isMinOn = (id) => activeMins === null || activeMins.includes(id);

    // Ordre grille : actifs en premier
    const gridMins = [
        ...plAgents.ministries.filter(m => isMinOn(m.id)),
        ...plAgents.ministries.filter(m => !isMinOn(m.id)),
    ];

    // Ordre liste détaillée : sélectionné en tête, puis actifs, puis inactifs
    const sortedMins = [
        ...plAgents.ministries.filter(m => m.id === selectedMinistry),
        ...plAgents.ministries.filter(m => m.id !== selectedMinistry && isMinOn(m.id)),
        ...plAgents.ministries.filter(m => m.id !== selectedMinistry && !isMinOn(m.id)),
    ];

    return (
        <>
        <Hint type="ministries" />

        {/* Grille */}
        <AgentGrid
            agents={gridMins}
            selectedId={selectedMinistry}
            activeIds={activeMins}
            onAgentClick={handleGridClickMin}
            onResetAll={() => { setActiveMins(null); setSelectedMinistry(null); }}
            onEditEmoji={(id, emoji) => {
                sauvegarderEmojiAgent('ministries', id, emoji);
                setPlAgents(p => ({ ...p, ministries: p.ministries.map(m => m.id === id ? { ...m, emoji } : m) }));
            }}
            countLabel={`${plAgents.ministries.length} ${lang === 'en' ? 'MINISTRIES' : 'MINISTÈRES'}`}
            lang={lang}
        />

        {/* Nouveau ministère */}
        {newMinistryForm ? (
            <div style={{ ...CARD_STYLE, border: '1px solid rgba(100,160,255,0.22)' }}>
            <div style={{ ...labelStyle('0.42rem'), color: 'rgba(100,160,255,0.70)', marginBottom: '0.5rem' }}>
            + {lang === 'en' ? 'NEW MINISTRY' : 'NOUVEAU MINISTÈRE'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <EmojiPicker
            emoji={newMinistryData.emoji}
            onChange={e => setNewMinistryData(d => ({ ...d, emoji: e.target.value }))}
            size="1rem"
            />
            <input
            style={{ ...INPUT_STYLE, fontSize: '0.50rem' }}
            value={newMinistryData.name}
            onChange={e => setNewMinistryData(d => ({ ...d, name: e.target.value }))}
            placeholder={t('MINISTRY_NAME', lang)}
            />
            <input
            style={{ ...INPUT_STYLE, fontSize: '0.50rem' }}
            value={newMinistryData.id}
            onChange={e => setNewMinistryData(d => ({ ...d, id: e.target.value }))}
            placeholder="id_unique"
            />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.45)' }}>
            {lang === 'en' ? 'Color' : 'Couleur'}
            </span>
            <ColorPicker
            color={newMinistryData.color}
            onChange={e => setNewMinistryData(d => ({ ...d, color: e.target.value }))}
            />
            </div>
            <textarea
            style={{ ...INPUT_STYLE, width: '100%', minHeight: '40px', resize: 'vertical', fontSize: '0.42rem', fontFamily: FONT.mono, lineHeight: 1.5, marginBottom: '0.4rem' }}
            value={newMinistryData.mission}
            onChange={e => setNewMinistryData(d => ({ ...d, mission: e.target.value }))}
            placeholder={t('MINISTRY_MISSION', lang)}
            />
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
            <button style={BTN_SECONDARY} onClick={() => setNewMinistryForm(false)}>
            {lang === 'en' ? 'Cancel' : 'Annuler'}
            </button>
            <button
            style={{ ...BTN_PRIMARY, opacity: newMinistryData.name && newMinistryData.id ? 1 : 0.35 }}
            disabled={!newMinistryData.name || !newMinistryData.id}
            onClick={addMinistry}
            >
            {lang === 'en' ? 'Add →' : 'Ajouter →'}
            </button>
            </div>
            </div>
        ) : (
            <button
            style={{ ...BTN_SECONDARY, width: '100%', fontSize: '0.44rem', color: 'rgba(100,160,255,0.55)', border: '1px solid rgba(100,160,255,0.20)' }}
            onClick={() => setNewMinistryForm(true)}
            >
            + {lang === 'en' ? 'New ministry' : 'Nouveau ministère'}
            </button>
        )}

        {/* Liste détaillée */}
        {sortedMins.map(ministry => {
            const mi = plAgents.ministries.findIndex(x => x.id === ministry.id);
            const on = isMinOn(ministry.id);
            const sel = selectedMinistry === ministry.id;
            const allMinKeys = Object.keys(plAgents.ministers);

            return (
                <div
                key={ministry.id}
                style={{
                    ...CARD_STYLE,
                    border: sel ? `1px solid ${ministry.color}55` : '1px solid rgba(255,255,255,0.07)',
                    transition: 'border 0.15s, box-shadow 0.15s',
                    boxShadow: sel ? `0 0 12px ${ministry.color}14` : 'none'
                }}
                >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.9rem' }}>{ministry.emoji}</span>
                <div style={{ fontFamily: FONT.mono, fontSize: '0.45rem', letterSpacing: '0.09em', color: on ? ministry.color + 'CC' : 'rgba(140,160,200,0.35)', flex: 1 }}>
                {ministry.name.toUpperCase()}
                </div>
                <ActiveToggle
                isActive={on}
                color={ministry.color}
                onToggle={() => toggleMinById(ministry.id)}
                type="ministry"
                />
                <DeleteButton
                show={!BASE_IDS.includes(ministry.id)}
                onDelete={() => {
                    setPlAgents(a => ({ ...a, ministries: a.ministries.filter((_, i) => i !== mi) }));
                    setSelectedMinistry(null);
                }}
                />
                </div>

                <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.14rem' }}>MISSION</div>
                <textarea
                style={{
                    ...INPUT_STYLE,
                    width: '100%',
                    minHeight: '34px',
                    resize: 'vertical',
                    fontSize: '0.40rem',
                    fontFamily: FONT.mono,
                    lineHeight: 1.5,
                    marginBottom: '0.40rem',
                    ...(!on ? { opacity: 0.35, cursor: 'not-allowed' } : {})
                }}
                readOnly={!on}
                value={ministry.mission}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    ministries: a.ministries.map((m, i) => i === mi ? { ...m, mission: e.target.value } : m)
                }))}
                />

                <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.20rem' }}>MINISTRES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.24rem', marginBottom: '0.40rem' }}>
                {allMinKeys.map(mkey => {
                    const min = plAgents.ministers[mkey];
                    const isIn = ministry.ministers.includes(mkey);
                    return (
                        <button
                        key={mkey}
                        disabled={!on}
                        style={{
                            ...BTN_SECONDARY,
                            padding: '0.17rem 0.44rem',
                            fontSize: '0.39rem',
                            ...(!on ? { opacity: 0.25, cursor: 'not-allowed' } : {}),
                            ...(isIn && on ? {
                                border: '1px solid ' + min.color + '88',
                                color: min.color,
                                background: min.color + '16'
                            } : {})
                        }}
                        onClick={() => on && setPlAgents(a => ({
                            ...a,
                            ministries: a.ministries.map((m, i) => i !== mi ? m : {
                                ...m,
                                ministers: isIn ? m.ministers.filter(k => k !== mkey) : [...m.ministers, mkey]
                            })
                        }))}
                        >
                        {min.emoji} {min.name}
                        </button>
                    );
                })}
                </div>

                {ministry.ministers.length > 0 && (
                    <>
                    <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.20rem' }}>PROMPTS MINISTÉRIELS</div>
                    {ministry.ministers.map(mkey => {
                        const min = plAgents.ministers[mkey];
                        return (
                            <div key={mkey} style={{ marginBottom: '0.30rem' }}>
                            <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: min.color + 'AA', marginBottom: '0.10rem' }}>
                            {min.emoji} {min.name}
                            </div>
                            <textarea
                            style={{
                                ...INPUT_STYLE,
                                width: '100%',
                                minHeight: '30px',
                                resize: 'vertical',
                                fontSize: '0.39rem',
                                fontFamily: FONT.mono,
                                lineHeight: 1.48,
                                ...(!on ? { opacity: 0.25, cursor: 'not-allowed' } : {})
                            }}
                            readOnly={!on}
                            value={ministry.ministerPrompts?.[mkey] || ''}
                            onChange={e => on && setPlAgents(a => ({
                                ...a,
                                ministries: a.ministries.map((m, i) => i !== mi ? m : {
                                    ...m,
                                    ministerPrompts: { ...(m.ministerPrompts || {}), [mkey]: e.target.value }
                                })
                            }))}
                            />
                            </div>
                        );
                    })}
                    </>
                )}
                </div>
            );
        })}
        </>
    );
}
