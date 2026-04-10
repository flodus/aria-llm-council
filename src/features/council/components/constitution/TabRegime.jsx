// src/features/council/components/constitution/TabRegime.jsx
// Onglet Régime de ConstitutionModal — emoji, régime politique, chef d'état, destinée, contexte

import { FONT, BTN_SECONDARY, INPUT_STYLE, SELECT_STYLE } from '../../../../shared/theme';
import { getStats } from '../../../../Dashboard_p1';
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from '../../../../shared/data/ariaData';
import EmojiPicker from '../../../../shared/components/EmojiPicker';

export default function TabRegime({ country, isEn, tr, state, handlers }) {
    const {
        emoji, regime, leader, contextMode, contextOverride,
        ctxAccOpen, ctxOverrideOpen, destinyMode,
    } = state;
    const {
        setEmoji, setRegime, setLeader, setContextMode, setContextOverride,
        setCtxAccOpen, setCtxOverrideOpen, setDestinyMode,
    } = handlers;

    const rawReal = (isEn ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA).find(r => r.id === country?.id);
    const ctxGeo  = rawReal?.triple_combo        || country?.geoContext  || '';
    const ctxSoc  = rawReal?.aria_sociology_logic || country?.description || '';

    return (
        <>
        {/* Emoji pays */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
        <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase' }}>
            {isEn ? 'COUNTRY EMOJI' : 'EMOJI DU PAYS'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{emoji}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.44rem', color: 'rgba(140,160,200,0.55)' }}>
                {country?.nom}
            </span>
        </div>
        <EmojiPicker value={emoji} onChange={setEmoji} compact />
        </section>

        {/* Régime */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
        <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase' }}>
            {tr.secRegime}
        </h3>
        <select style={SELECT_STYLE} value={regime} onChange={e => setRegime(e.target.value)}>
            {Object.entries(getStats().regimes || {})
                .sort(([, a], [, b]) => a.name.localeCompare(b.name, isEn ? 'en' : 'fr'))
                .map(([k, v]) => <option key={k} value={k}>{v.emoji || ''} {v.name}</option>)}
        </select>
        </section>

        {/* Chef d'État */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
        <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase' }}>
            {tr.secLeader}
        </h3>
        <input
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,164,74,0.18)', borderRadius: '2px', padding: '0.38rem 0.55rem', color: 'rgba(220,228,240,0.85)', fontFamily: FONT, fontSize: '0.50rem', outline: 'none' }}
            value={leader}
            onChange={e => setLeader(e.target.value)}
            placeholder={isEn ? 'Head of state name…' : 'Nom du dirigeant…'}
        />
        </section>

        {/* Toggle Destinée du monde */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
        <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase' }}>
            {tr.destinyTitle}
        </h3>
        <button
            onClick={() => setDestinyMode(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.48rem 0.65rem', background: destinyMode ? 'rgba(140,100,220,0.12)' : 'rgba(20,28,45,0.55)', border: `1px solid ${destinyMode ? 'rgba(140,100,220,0.45)' : 'rgba(140,160,200,0.10)'}`, borderRadius: '2px', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s', fontFamily: FONT }}
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
        <button onClick={() => setCtxAccOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT, textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.50rem', letterSpacing: '0.20em', color: 'rgba(200,164,74,0.55)', margin: 0, textTransform: 'uppercase', flex: 1 }}>
                {tr.secContext}{contextMode ? ' ●' : ''}
            </h3>
            <span style={{ color: 'rgba(200,164,74,0.40)', fontSize: '0.55rem' }}>{ctxAccOpen ? '▾' : '▸'}</span>
        </button>
        {ctxAccOpen && (
            <>
            <p style={{ fontSize: '0.40rem', color: 'rgba(140,160,200,0.48)', margin: 0, lineHeight: 1.5 }}>{tr.contextHint}</p>
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
                        <label key={val} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', cursor: 'pointer', padding: '0.30rem 0.45rem', borderRadius: '2px', background: on ? 'rgba(200,164,74,0.08)' : 'transparent', border: `1px solid ${on ? 'rgba(200,164,74,0.28)' : 'transparent'}` }}>
                            <input type="radio" name="ctx_mode" value={val} checked={on} onChange={() => setContextMode(val)} style={{ marginTop: '0.08rem', accentColor: '#C8A44A' }} />
                            <div>
                                <div style={{ fontFamily: FONT, fontSize: '0.50rem', color: 'rgba(220,228,240,0.85)' }}>{lbl}</div>
                                <div style={{ fontSize: '0.44rem', color: 'rgba(140,160,200,0.48)', marginTop: '0.08rem', lineHeight: 1.4 }}>{hint}</div>
                            </div>
                        </label>
                    );
                })}
            </div>

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
            <button style={{ ...BTN_SECONDARY, alignSelf: 'flex-start', fontSize: '0.42rem', padding: '0.22rem 0.55rem' }} onClick={() => setCtxOverrideOpen(v => !v)}>
                {ctxOverrideOpen ? '▾' : '▸'} {isEn ? 'Custom context' : 'Contexte personnalisé'}{contextOverride ? ' ●' : ''}
            </button>
            {ctxOverrideOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
                    <p style={{ fontSize: '0.40rem', color: 'rgba(140,160,200,0.45)', margin: 0, lineHeight: 1.5 }}>
                        {isEn ? 'Replaces the context above in all AI deliberations for this country.' : 'Remplace le contexte ci-dessus dans toutes les délibérations IA pour ce pays.'}
                    </p>
                    <textarea
                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${contextOverride ? 'rgba(200,164,74,0.30)' : 'rgba(200,164,74,0.18)'}`, borderRadius: '2px', padding: '0.38rem 0.55rem', color: 'rgba(220,228,240,0.85)', fontFamily: FONT, fontSize: '0.50rem', outline: 'none', minHeight: '80px', resize: 'vertical', lineHeight: 1.55 }}
                        value={contextOverride}
                        onChange={e => setContextOverride(e.target.value)}
                        placeholder={isEn ? `E.g. ${country?.nom || 'This country'} is an island theocracy…` : `Ex : ${country?.nom || 'Ce pays'} est une théocratie insulaire…`}
                    />
                    {contextOverride && (
                        <button style={{ ...BTN_SECONDARY, alignSelf: 'flex-end', fontSize: '0.42rem', color: 'rgba(200,80,80,0.50)', border: '1px solid rgba(200,80,80,0.20)' }} onClick={() => setContextOverride('')}>
                            {isEn ? '✕ Clear' : '✕ Effacer'}
                        </button>
                    )}
                </div>
            )}
            </>
        )}
        </section>
        </>
    );
}
