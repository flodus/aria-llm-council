// src/features/world/components/CountryPanel/CountryPanelEmpty.jsx

import { useState, useEffect } from 'react';
import { loadLang, t } from '../../../../ariaI18n.js';
import { getCountryEmoji } from '../../utils';

export default function EmptyPanel({
    activeTab,
    liveCountries,
    onSelectCountry
}) {
    if (!liveCountries) {
    }

    const [lang, setLang] = useState(() => loadLang());

    useEffect(() => {
        const onLangChange = () => setLang(loadLang());
        window.addEventListener('aria-lang-change', onLangChange);
        return () => window.removeEventListener('aria-lang-change', onLangChange);
    }, []);

    // Vue Council
    if (activeTab === 'council') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-header">
            <span className="panel-header-emoji">⚖</span>
            <div style={{ flex: 1 }}>
            <div className="panel-header-title">{t('PANEL_LLM_COUNCIL', lang)}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.40rem', color: 'rgba(140,160,200,0.75)', letterSpacing: '0.10em' }}>
            {t('PANEL_SELECT_COUNTRY', lang)}
            </div>
            </div>
            </div>
            {liveCountries.length > 0 ? (
                <div style={{ padding: '0.6rem 0.8rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.38rem', letterSpacing: '0.14em', color: 'rgba(200,164,74,0.45)', marginBottom: '0.5rem' }}>
                {t('PANEL_AVAIL_NATIONS', lang)}
                </div>
                {liveCountries.map(c => (
                    <button key={c.id} onClick={() => onSelectCountry?.(c)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.55rem', width: '100%',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(90,110,160,0.12)',
                                         borderRadius: '2px', padding: '0.45rem 0.6rem', marginBottom: '0.28rem',
                                         cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                                         fontFamily: "'JetBrains Mono',monospace"
                    }}>
                    <span style={{ fontSize: '1.1rem' }}>{getCountryEmoji(c)}</span>
                    <div>
                    <div style={{ fontSize: '0.50rem', color: 'rgba(200,215,240,0.78)', letterSpacing: '0.06em' }}>
                    {c.nom}
                    </div>
                    <div style={{ fontSize: '0.40rem', color: 'rgba(100,120,160,0.45)', marginTop: '0.1rem' }}>
                    {c.satisfaction}% satisfaction
                    </div>
                    </div>
                    </button>
                ))}
                </div>
            ) : (
                <div className="panel-empty">
                <div className="panel-empty-icon" style={{ fontSize: '1.6rem', opacity: 0.15 }}>⚖️</div>
                <div className="panel-empty-label">{t('PANEL_NO_COUNTRY', lang)}</div>
                </div>
            )}
            </div>
        );
    }

    // Vue Timeline
    if (activeTab === 'timeline') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-header">
            <span className="panel-header-emoji">📜</span>
            <div style={{ flex: 1 }}>
            <div className="panel-header-title">CHRONOLOG</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.40rem', color: 'rgba(140,160,200,0.75)', letterSpacing: '0.10em' }}>
            {t('PANEL_SELECT_COUNTRY', lang)}
            </div>
            </div>
            </div>
            {liveCountries.length > 0 ? (
                <div style={{ padding: '0.6rem 0.8rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.38rem', letterSpacing: '0.14em', color: 'rgba(140,160,200,0.35)', marginBottom: '0.5rem' }}>
                {t('PANEL_VIEW_HISTORY', lang)}
                </div>
                {liveCountries.map(c => (
                    <button key={c.id} onClick={() => onSelectCountry?.(c)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.55rem', width: '100%',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(90,110,160,0.12)',
                                         borderRadius: '2px', padding: '0.45rem 0.6rem', marginBottom: '0.28rem',
                                         cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                                         fontFamily: "'JetBrains Mono',monospace"
                    }}>
                    <span style={{ fontSize: '1.1rem' }}>{getCountryEmoji(c)}</span>
                    <div>
                    <div style={{ fontSize: '0.50rem', color: 'rgba(200,215,240,0.78)', letterSpacing: '0.06em' }}>{c.nom}</div>
                    <div style={{ fontSize: '0.40rem', color: 'rgba(100,120,160,0.45)', marginTop: '0.1rem' }}>
                    cycle {c.cycleNum || 1}
                    </div>
                    </div>
                    </button>
                ))}
                </div>
            ) : (
                <div className="panel-empty">
                <div className="panel-empty-icon" style={{ fontSize: '1.6rem', opacity: 0.15 }}>📜</div>
                <div className="panel-empty-label">{t('PANEL_NO_HISTORY', lang)}</div>
                </div>
            )}
            </div>
        );
    }

    // Vue Map (par défaut)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="panel-header">
        <span className="panel-header-emoji">🗺</span>
        <div style={{ flex: 1 }}>
        <div className="panel-header-title">{t('PANEL_WORLD_MAP', lang)}</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.40rem', color: 'rgba(140,160,200,0.75)', letterSpacing: '0.10em' }}>
        {t('PANEL_SELECT_COUNTRY', lang)}
        </div>
        </div>
        </div>
        {liveCountries.length > 0 ? (
            <div style={{ padding: '0.6rem 0.8rem', overflowY: 'auto', flex: 1 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.38rem', letterSpacing: '0.14em', color: 'rgba(58,191,122,0.45)', marginBottom: '0.5rem' }}>
            NATIONS
            </div>
            {liveCountries.map(c => (
                <button key={c.id} onClick={() => onSelectCountry?.(c)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.55rem', width: '100%',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(90,110,160,0.12)',
                                     borderRadius: '2px', padding: '0.45rem 0.6rem', marginBottom: '0.28rem',
                                     cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                                     fontFamily: "'JetBrains Mono',monospace"
                }}>
                <span style={{ fontSize: '1.1rem' }}>{getCountryEmoji(c)}</span>
                <div>
                <div style={{ fontSize: '0.50rem', color: 'rgba(200,215,240,0.78)', letterSpacing: '0.06em' }}>
                {c.nom}
                </div>
                <div style={{ fontSize: '0.40rem', color: 'rgba(100,120,160,0.45)', marginTop: '0.1rem' }}>
                {c.satisfaction}% satisfaction
                </div>
                </div>
                </button>
            ))}
            </div>
        ) : (
            <div className="panel-empty">
            <div className="panel-empty-icon" style={{ fontSize: '1.6rem', opacity: 0.15 }}>🌍</div>
            <div className="panel-empty-label">{t('PANEL_NO_COUNTRY', lang)}</div>
            </div>
        )}
        </div>
    );
}
