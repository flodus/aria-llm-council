import { useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { FONT, CARD_STYLE, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from '../../../shared/theme';

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

    const isMinsterOn = (k) => activeMinsters === null || activeMinsters.includes(k);

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

    const gridMinsters = [
        ...allEntries.filter(([k]) => isMinsterOn(k)),
        ...allEntries.filter(([k]) => !isMinsterOn(k)),
    ];

    const sortedMinsters = [
        ...allEntries.filter(([k]) => k === selectedMinister),
        ...allEntries.filter(([k]) => k !== selectedMinister && isMinsterOn(k)),
        ...allEntries.filter(([k]) => k !== selectedMinister && !isMinsterOn(k)),
    ];

    return (
        <>
        {/* Hint */}
        <p style={{
            fontFamily: FONT.mono,
            fontSize: '0.36rem',
            fontStyle: 'italic',
            color: 'rgba(100,120,165,0.28)',
            margin: '0 0 0.05rem',
            lineHeight: 1.9,
            letterSpacing: '0.06em',
            textAlign: 'center',
            userSelect: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            paddingBottom: '0.35rem'
        }}>
        {lang === 'en'
            ? '↑ click to focus · click active again to deactivate · click inactive again to activate'
    : '↑ cliquer pour cibler · recliquer un actif pour désactiver · recliquer un inactif pour activer'}
    </p>

    {/* Grille */}
    <div style={{ ...CARD_STYLE }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
    <div style={labelStyle('0.42rem')}>
    {allEntries.length} {lang === 'en' ? 'MINISTERS' : 'MINISTRES'}
    </div>
    <button
    style={{ ...BTN_SECONDARY, fontSize: '0.38rem', padding: '0.14rem 0.38rem' }}
    onClick={() => { setActiveMinsters(null); setSelectedMinister(null); }}
    >
    {lang === 'en' ? 'All active' : 'Tous actifs'}
    </button>
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
    {gridMinsters.map(([key, min]) => {
        const on = isMinsterOn(key);
        const sel = selectedMinister === key;
        return (
            <div
            key={key}
            onClick={() => handleGridClickMinster(key)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.28rem',
                padding: '0.26rem 0.50rem',
                borderRadius: '3px',
                cursor: 'pointer',
                background: sel ? min.color + '38' : on ? min.color + '18' : 'rgba(8,14,26,0.60)',
                border: sel ? `2px solid ${min.color}EE` : on ? `1px solid ${min.color}70` : '1px solid rgba(140,160,200,0.10)',
                transition: 'all 0.13s',
                boxShadow: sel ? `0 0 8px ${min.color}33` : on ? `0 0 4px ${min.color}18` : 'none'
            }}
            >
            <span style={{
                fontSize: '0.85rem',
                filter: on ? `drop-shadow(0 0 3px ${min.color}66)` : 'grayscale(1)',
                opacity: on ? 1 : 0.28,
                transition: 'all 0.13s'
            }}>
            {min.emoji}
            </span>
            <span style={{
                fontFamily: FONT.mono,
                fontSize: '0.41rem',
                color: sel ? min.color : on ? min.color + 'CC' : 'rgba(140,160,200,0.28)',
                transition: 'all 0.13s',
                textShadow: sel ? `0 0 6px ${min.color}55` : 'none'
            }}>
            {min.name}
            </span>
            {min.sign === 'Custom' && (
                <span style={{ fontFamily: FONT.mono, fontSize: '0.28rem', color: 'rgba(140,160,200,0.22)', marginLeft: '0.1rem' }}>
                custom
                </span>
            )}
            </div>
        );
    })}
    </div>
    </div>

    {/* Nouveau ministre */}
    {newMinForm ? (
        <div style={{ ...CARD_STYLE, border: '1px solid rgba(100,200,120,0.22)' }}>
        <div style={{ ...labelStyle('0.42rem'), color: 'rgba(100,200,120,0.70)', marginBottom: '0.5rem' }}>
        + {lang === 'en' ? 'NEW MINISTER' : 'NOUVEAU MINISTRE'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '0.45rem', marginBottom: '0.4rem', alignItems: 'center' }}>
        <input
        style={{ ...INPUT_STYLE, width: '2.2rem', textAlign: 'center', fontSize: '1rem' }}
        value={newMinData.emoji}
        onChange={e => setNewMinData(d => ({ ...d, emoji: e.target.value }))}
        placeholder="🌟"
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
        <input
        type="color"
        value={newMinData.color}
        style={{ width: '2rem', height: '1.8rem', border: 'none', background: 'none', cursor: 'pointer' }}
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
            <input
            style={{ ...INPUT_STYLE, width: '2.2rem', textAlign: 'center', fontSize: '1rem', ...(!on ? { opacity: 0.35, cursor: 'not-allowed' } : {}) }}
            readOnly={!on}
            value={min.emoji}
            onChange={e => on && setPlAgents(a => ({
                ...a,
                ministers: { ...a.ministers, [key]: { ...a.ministers[key], emoji: e.target.value } }
            }))}
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
            <input
            type="color"
            value={min.color}
            disabled={!on}
            style={{ width: '1.8rem', height: '1.6rem', border: 'none', background: 'none', cursor: on ? 'pointer' : 'not-allowed', opacity: on ? 1 : 0.3 }}
            onChange={e => on && setPlAgents(a => ({
                ...a,
                ministers: { ...a.ministers, [key]: { ...a.ministers[key], color: e.target.value } }
            }))}
            />
            <button
            style={{
                ...BTN_SECONDARY,
                fontSize: '0.38rem',
                padding: '0.14rem 0.42rem',
                flexShrink: 0,
                ...(on ? {
                    border: '1px solid ' + min.color + '55',
                    color: min.color,
                    background: min.color + '0E'
                } : {
                    border: '1px solid rgba(200,80,80,0.25)',
                    color: 'rgba(200,80,80,0.55)'
                })
            }}
            onClick={() => toggleMinster(key)}
            >
            {on ? '● actif' : '○ inactif'}
            </button>
            {min.sign === 'Custom' && (
                <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(200,80,80,0.35)', fontSize: '0.75rem', lineHeight: 1, padding: 0 }}
                onClick={() => {
                    setPlAgents(a => {
                        const m = { ...a.ministers };
                        delete m[key];
                        return { ...a, ministers: m };
                    });
                    setSelectedMinister(null);
                }}
                >
                ✕
                </button>
            )}
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
