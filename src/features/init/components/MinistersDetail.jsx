// src/features/init/components/MinistersDetail.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  MinistersDetail.jsx — Onglet de configuration détaillée des ministres
//
//  Affiche une grille de sélection (actif/inactif) et, en dessous,
//  la fiche éditable de chaque ministre : essence, style de communication,
//  angle d'annotation inter-ministérielle.
//
//  Dépendances : government/ (Hint, ActiveToggle, ColorPicker, EmojiPicker, DeleteButton)
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../shared/theme';
import { Hint, ActiveToggle, ColorPicker, EmojiPicker, DeleteButton } from './government';
import AgentGrid from '../../../shared/components/AgentGrid';

export default function MinistersDetail({
    plAgents,
    activeMinsters,
    setActiveMinsters,
    selectedMinister,
    setSelectedMinister,
    newMinForm,
    setNewMinForm,
    newMinData,
    setNewMinData,
    toggleMinster,
    addMinister,
    setPlAgents
}) {
    const { lang } = useLocale();
    const allEntries = Object.entries(plAgents.ministers);

    // ── Helpers grille ────────────────────────────────────────────────────

    // null = tous actifs (héritage commun), sinon liste explicite
    const isMinsterOn = (k) => activeMinsters === null || activeMinsters.includes(k);

    // Clic sur la grille : premier clic sélectionne, second clic désactive/réactive
    const handleGridClickMinster = (key) => {
        if (selectedMinister !== key) {
            setSelectedMinister(key);
        } else {
            const on = isMinsterOn(key);
            if (on) {
                toggleMinster(key);
                setSelectedMinister(null);
            } else {
                toggleMinster(key);
            }
        }
    };

    // Ordre grille : actifs en premier, inactifs en bas
    const gridMinsters = [
        ...allEntries.filter(([k]) => isMinsterOn(k)),
        ...allEntries.filter(([k]) => !isMinsterOn(k)),
    ];

    // Ordre liste détaillée : sélectionné en tête, puis actifs, puis inactifs
    const sortedMinsters = [
        ...allEntries.filter(([k]) => k === selectedMinister),
        ...allEntries.filter(([k]) => k !== selectedMinister && isMinsterOn(k)),
        ...allEntries.filter(([k]) => k !== selectedMinister && !isMinsterOn(k)),
    ];

    return (
        <>
        <Hint type="ministers" />

        {/* Grille */}
        <AgentGrid
            agents={gridMinsters.map(([id, m]) => ({ id, ...m }))}
            selectedId={selectedMinister}
            activeIds={activeMinsters}
            onAgentClick={handleGridClickMinster}
            onResetAll={() => { setActiveMinsters(null); setSelectedMinister(null); }}
            countLabel={`${allEntries.length} ${lang === 'en' ? 'MINISTERS' : 'MINISTRES'}`}
            lang={lang}
        />

        {/* Nouveau ministre */}
        {newMinForm ? (
            <div style={{ ...CARD_STYLE, border: '1px solid rgba(100,200,120,0.22)' }}>
            <div style={{ ...labelStyle('0.42rem'), color: 'rgba(100,200,120,0.70)', marginBottom: '0.5rem' }}>
            + {lang === 'en' ? 'NEW MINISTER' : 'NOUVEAU MINISTRE'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '0.45rem', marginBottom: '0.4rem', alignItems: 'center' }}>
            <EmojiPicker
            emoji={newMinData.emoji}
            onChange={e => setNewMinData(d => ({ ...d, emoji: e.target.value }))}
            size="1rem"
            />
            <input
            style={{ ...INPUT_STYLE, fontSize: '0.48rem' }}
            value={newMinData.name}
            onChange={e => setNewMinData(d => ({ ...d, name: e.target.value }))}
            placeholder={lang === 'en' ? 'Minister name' : 'Nom du ministre'}
            />
            <input
            style={{ ...INPUT_STYLE, fontSize: '0.48rem' }}
            value={newMinData.id}
            onChange={e => setNewMinData(d => ({ ...d, id: e.target.value }))}
            placeholder="id_unique"
            />
            <ColorPicker
            color={newMinData.color}
            onChange={e => setNewMinData(d => ({ ...d, color: e.target.value }))}
            />
            </div>
            <textarea
            style={{ ...INPUT_STYLE, width: '100%', minHeight: '36px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5, marginBottom: '0.35rem' }}
            value={newMinData.essence}
            onChange={e => setNewMinData(d => ({ ...d, essence: e.target.value }))}
            placeholder={t('CONST_ESSENCE_PH', lang)}
            />
            <textarea
            style={{ ...INPUT_STYLE, width: '100%', minHeight: '28px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5, marginBottom: '0.4rem' }}
            value={newMinData.comm}
            onChange={e => setNewMinData(d => ({ ...d, comm: e.target.value }))}
            placeholder={lang === 'en' ? 'Communication style…' : 'Style de communication…'}
            />
            <div style={{ fontFamily: FONT.mono, fontSize: '0.38rem', color: 'rgba(90,110,150,0.42)', marginBottom: '0.12rem' }}>
            {lang === 'en' ? 'ANNOTATION ANGLE' : 'ANGLE D\'ANNOTATION'}
            <span style={{ fontWeight: 'normal', color: 'rgba(90,110,150,0.32)' }}>
            {' — '}{lang === 'en' ? 'inter-ministerial question' : 'question posée lors des annotations inter-ministérielles'}
            </span>
            </div>
            <textarea
            style={{ ...INPUT_STYLE, width: '100%', minHeight: '26px', resize: 'vertical', fontSize: '0.41rem', fontFamily: FONT.mono, lineHeight: 1.5, marginBottom: '0.4rem' }}
            value={newMinData.annotation}
            onChange={e => setNewMinData(d => ({ ...d, annotation: e.target.value }))}
            placeholder={lang === 'en' ? "E.g. What is the minister's position on…" : "Ex : Quelle est la position du ministre sur l'équilibre entre…"}
            />
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
            <button style={BTN_SECONDARY} onClick={() => setNewMinForm(false)}>
            {lang === 'en' ? 'Cancel' : 'Annuler'}
            </button>
            <button
            style={{ ...BTN_PRIMARY, opacity: newMinData.name && newMinData.id ? 1 : 0.35 }}
            disabled={!newMinData.name || !newMinData.id}
            onClick={addMinister}
            >
            {lang === 'en' ? 'Add →' : 'Ajouter →'}
            </button>
            </div>
            </div>
        ) : (
            <button
            style={{ ...BTN_SECONDARY, width: '100%', fontSize: '0.44rem', color: 'rgba(100,200,120,0.50)', border: '1px solid rgba(100,200,120,0.18)' }}
            onClick={() => setNewMinForm(true)}
            >
            + {lang === 'en' ? 'New minister' : 'Nouveau ministre'}
            </button>
        )}

        {/* Liste détaillée */}
        {sortedMinsters.map(([key, min]) => {
            const on = isMinsterOn(key);
            const sel = selectedMinister === key;

            return (
                <div
                key={key}
                style={{
                    ...CARD_STYLE,
                    border: sel ? `1px solid ${min.color}55` : '1px solid rgba(255,255,255,0.07)',
                    transition: 'border 0.15s, box-shadow 0.15s',
                    boxShadow: sel ? `0 0 12px ${min.color}14` : 'none'
                }}
                >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <EmojiPicker
                emoji={min.emoji}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    ministers: { ...a.ministers, [key]: { ...a.ministers[key], emoji: e.target.value } }
                }))}
                disabled={!on}
                size="1rem"
                />
                <input
                style={{ ...INPUT_STYLE, flex: 1, fontSize: '0.48rem', ...(!on ? { opacity: 0.35, cursor: 'not-allowed' } : {}) }}
                readOnly={!on}
                value={min.name}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    ministers: { ...a.ministers, [key]: { ...a.ministers[key], name: e.target.value } }
                }))}
                />
                <ColorPicker
                color={min.color}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    ministers: { ...a.ministers, [key]: { ...a.ministers[key], color: e.target.value } }
                }))}
                disabled={!on}
                />
                <ActiveToggle
                isActive={on}
                color={min.color}
                onToggle={() => toggleMinster(key)}
                type="minister"
                />
                <DeleteButton
                show={min.sign === 'Custom'}
                onDelete={() => {
                    setPlAgents(a => {
                        const m = { ...a.ministers };
                        delete m[key];
                        return { ...a, ministers: m };
                    });
                    setSelectedMinister(null);
                }}
                />
                </div>

                <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.14rem' }}>ESSENCE</div>
                <textarea
                style={{
                    ...INPUT_STYLE,
                    width: '100%',
                    minHeight: '36px',
                    resize: 'vertical',
                    fontSize: '0.40rem',
                    fontFamily: FONT.mono,
                    lineHeight: 1.5,
                    marginBottom: '0.28rem',
                    ...(!on ? { opacity: 0.25, cursor: 'not-allowed' } : {})
                }}
                readOnly={!on}
                value={min.essence || ''}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    ministers: { ...a.ministers, [key]: { ...a.ministers[key], essence: e.target.value } }
                }))}
                />

                <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.14rem' }}>
                {lang === 'en' ? 'COMMUNICATION STYLE' : 'STYLE DE COMMUNICATION'}
                </div>
                <textarea
                style={{
                    ...INPUT_STYLE,
                    width: '100%',
                    minHeight: '28px',
                    resize: 'vertical',
                    fontSize: '0.40rem',
                    fontFamily: FONT.mono,
                    lineHeight: 1.5,
                    ...(!on ? { opacity: 0.25, cursor: 'not-allowed' } : {})
                }}
                readOnly={!on}
                value={min.comm || ''}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    ministers: { ...a.ministers, [key]: { ...a.ministers[key], comm: e.target.value } }
                }))}
                />

                <div style={{ fontFamily: FONT.mono, fontSize: '0.37rem', color: 'rgba(90,110,150,0.38)', marginBottom: '0.14rem', marginTop: '0.22rem' }}>
                {lang === 'en' ? 'ANNOTATION ANGLE' : 'ANGLE D\'ANNOTATION'}
                <span style={{ fontWeight: 'normal', opacity: 0.55 }}>
                {' — '}{lang === 'en' ? 'inter-ministerial question' : 'question inter-ministérielle'}
                </span>
                </div>
                <textarea
                style={{
                    ...INPUT_STYLE,
                    width: '100%',
                    minHeight: '26px',
                    resize: 'vertical',
                    fontSize: '0.40rem',
                    fontFamily: FONT.mono,
                    lineHeight: 1.5,
                    ...(!on ? { opacity: 0.25, cursor: 'not-allowed' } : {})
                }}
                readOnly={!on}
                value={min.annotation || ''}
                onChange={e => on && setPlAgents(a => ({
                    ...a,
                    ministers: { ...a.ministers, [key]: { ...a.ministers[key], annotation: e.target.value } }
                }))}
                />
                </div>
            );
        })}
        </>
    );
}
