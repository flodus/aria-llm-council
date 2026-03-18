// src/features/world/components/CountryPanel/components/TabNavigation.jsx
import { useState, useEffect } from 'react';
import { loadLang } from '../../../../ariaI18n';

export default function TabNavigation({ activeTab, onGoToMap, onGoToCouncil, onGoToTimeline }) {
    const [lang, setLang] = useState(() => loadLang());

    useEffect(() => {
        const onLangChange = () => setLang(loadLang());
        window.addEventListener('aria-lang-change', onLangChange);
        return () => window.removeEventListener('aria-lang-change', onLangChange);
    }, []);

    const isEn = lang === 'en';

    const tabs = [
        { id: 'map', icon: '🗺', label: isEn ? 'MAP' : 'CARTE', action: onGoToMap },
        { id: 'council', icon: '⚖', label: 'COUNCIL', action: onGoToCouncil },
        { id: 'timeline', icon: '📜', label: 'CHRON.', action: onGoToTimeline },
    ];

    return (
        <div style={{
            display: 'flex', gap: '0.3rem', padding: '0.25rem 0.7rem',
            borderBottom: '1px solid rgba(90,110,160,0.10)',
            background: 'rgba(4,8,18,0.4)'
        }}>
        {tabs.map(tab => (
            <button
            key={tab.id}
            onClick={tab.action}
            style={{
                background: activeTab === tab.id ? 'rgba(200,164,74,0.12)' : 'transparent',
                          border: `1px solid ${activeTab === tab.id ? 'rgba(200,164,74,0.35)' : 'rgba(90,110,160,0.15)'}`,
                          borderRadius: '2px', padding: '0.18rem 0.5rem',
                          fontFamily: "'JetBrains Mono',monospace", fontSize: '0.38rem',
                          letterSpacing: '0.08em', cursor: 'pointer',
                          color: activeTab === tab.id ? 'rgba(200,164,74,0.85)' : 'rgba(120,140,180,0.40)',
                          transition: 'all 0.12s', display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            </button>
        ))}
        </div>
    );
}
