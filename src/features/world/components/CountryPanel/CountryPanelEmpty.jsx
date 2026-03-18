// src/features/world/components/CountryPanel/components/EmptyPanel.jsx

import { useState, useEffect } from 'react';
import { loadLang } from '../../../../ariaI18n.js';
import { getCountryEmoji } from '../../utils';

export default function EmptyPanel({
    activeTab,
    liveCountries,
    onSelectCountry
}) {
    // Validation des props obligatoires
    if (!liveCountries) {
        console.warn('EmptyPanel: liveCountries prop is missing');
    }

    const [lang, setLang] = useState(() => loadLang());

    useEffect(() => {
        const onLangChange = () => setLang(loadLang());
        window.addEventListener('aria-lang-change', onLangChange);
        return () => window.removeEventListener('aria-lang-change', onLangChange);
    }, []);

    const isEn = lang === 'en';

    // Vue Council
    if (activeTab === 'council') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-header">
            <span className="panel-header-emoji">⚖</span>
            <div style={{ flex: 1 }}>
            <div className="panel-header-title">{isEn ? 'LLM COUNCIL' : 'LLM CONSEIL'}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.40rem', color: 'rgba(140,160,200,0.75)', letterSpacing: '0.10em' }}>
            {isEn ? 'SELECT A COUNTRY' : 'SÉLECTIONNEZ UN PAYS'}
            </div>
            </div>
            </div>
            {liveCountries.length > 0 ? (
                <div style={{ padding: '0.6rem 0.8rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.38rem', letterSpacing: '0.14em', color: 'rgba(200,164,74,0.45)', marginBottom: '0.5rem' }}>
                {isEn ? 'AVAILABLE NATIONS' : 'NATIONS DISPONIBLES'}
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
                <div className="panel-empty-label">{isEn ? 'NO COUNTRY YET' : 'AUCUN PAYS'}</div>
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
            {isEn ? 'SELECT A COUNTRY' : 'SÉLECTIONNEZ UN PAYS'}
            </div>
            </div>
            </div>
            {liveCountries.length > 0 ? (
                <div style={{ padding: '0.6rem 0.8rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.38rem', letterSpacing: '0.14em', color: 'rgba(140,160,200,0.35)', marginBottom: '0.5rem' }}>
                {isEn ? 'VIEW HISTORY FOR' : 'VOIR L’HISTORIQUE DE'}
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
                    {isEn ? `cycle ${c.cycleNum || 1}` : `cycle ${c.cycleNum || 1}`}
                    </div>
                    </div>
                    </button>
                ))}
                </div>
            ) : (
                <div className="panel-empty">
                <div className="panel-empty-icon" style={{ fontSize: '1.6rem', opacity: 0.15 }}>📜</div>
                <div className="panel-empty-label">{isEn ? 'NO HISTORY YET' : 'AUCUN HISTORIQUE'}</div>
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
        <div className="panel-header-title">{isEn ? 'WORLD MAP' : 'CARTE MONDE'}</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.40rem', color: 'rgba(140,160,200,0.75)', letterSpacing: '0.10em' }}>
        {isEn ? 'SELECT A COUNTRY' : 'SÉLECTIONNEZ UN PAYS'}
        </div>
        </div>
        </div>
        {liveCountries.length > 0 ? (
            <div style={{ padding: '0.6rem 0.8rem', overflowY: 'auto', flex: 1 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.38rem', letterSpacing: '0.14em', color: 'rgba(58,191,122,0.45)', marginBottom: '0.5rem' }}>
            {isEn ? 'NATIONS' : 'NATIONS'}
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
            <div className="panel-empty-label">{isEn ? 'NO COUNTRY YET' : 'AUCUN PAYS'}</div>
            </div>
        )}
        </div>
    );
}
