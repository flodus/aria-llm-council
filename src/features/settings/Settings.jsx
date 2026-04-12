// src/features/settings/Settings.jsx
// Page de configuration complète ARIA — Shell principal
// 6 sections : SYSTÈME · CONSTITUTION · GOUVERNEMENT · SIMULATION · INTERFACE · À PROPOS
// Usage : <Settings onClose={() => setPage('dashboard')} />

import { useState, useCallback, Component } from 'react';
import { useLocale, t } from '../../ariaI18n';
import SectionSysteme from './components/SectionSysteme';
import SectionConstitution from './components/SectionConstitution';
import SectionConseil from './components/SectionConseil';
import SectionSimulation from './components/SectionSimulation';
import SectionInterface from './components/SectionInterface';
import SectionAPropos from './components/SectionAPropos';
import './Settings.css';

// ─────────────────────────────────────────────────────────────────────────────
//  ERROR BOUNDARY — évite qu'une erreur dans une section crash toute la page
// ─────────────────────────────────────────────────────────────────────────────
class SectionErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: '1rem', color: 'rgba(255,80,80,0.75)',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.52rem',
        border: '1px solid rgba(255,80,80,0.20)', borderRadius: '2px',
                                  background: 'rgba(255,0,0,0.04)' }}>
                                  ⚠ Erreur dans cette section — {this.state.error?.message || 'Erreur inconnue'}
                                  </div>
    );
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

function getSections(lang) {
  return [
    { id: 'conseil',      icon: '🏛️', label: t('SETTINGS_SECTION_GOV', lang)  },
    { id: 'constitution', icon: '📜',  label: t('CONSTITUTION', lang)           },
    { id: 'simulation',   icon: '🎲',  label: 'SIMULATION'                      },
    { id: 'systeme',      icon: '⚙️',  label: t('SETTINGS_SECTION_SYS', lang)  },
    { id: 'interface',    icon: '🎨',  label: 'INTERFACE'                       },
    { id: 'apropos',      icon: '✦',   label: t('SETTINGS_SECTION_ABOUT', lang) },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL — Settings
// ─────────────────────────────────────────────────────────────────────────────

export default function Settings({ onClose }) {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const SECTIONS = getSections(lang);
  const [activeSection, setActiveSection] = useState('conseil');

  const hardReset = useCallback(() => {
    [
      'aria_options','aria_prompts','aria_agents','aria_sim',
      'aria_world','aria_countries','aria_api_keys',
      'aria_session_active','aria_session_world',
      'aria_session_countries','aria_session_alliances',
      'aria_api_keys_status',
      'aria_agents_override','aria_chronolog_cycles',
      'aria_lang','aria_preferred_models',
    ].forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  return (
    <div className="settings-root">

    {/* ── En-tête ── */}
    <div className="settings-header">
    <div className="settings-header-left">
    <span className="settings-header-glyph">✦</span>
    <div>
    <div className="settings-header-title">ARIA — CONFIGURATION</div>
    <div className="settings-header-sub">{t('SETTINGS_HEADER_SUB', lang)}</div>
    </div>
    </div>
    <button className="settings-close-btn" onClick={onClose} title={t('SETTINGS_BACK_TIP', lang)}>
    ✕
    </button>
    </div>

    <div className="settings-layout">

    {/* ── Navigation latérale ── */}
    <nav className="settings-nav">
    {SECTIONS.map(s => (
      <button
      key={s.id}
      className={`settings-nav-item${activeSection === s.id ? ' active' : ''}`}
      onClick={() => setActiveSection(s.id)}
      >
      <span className="settings-nav-icon">{s.icon}</span>
      <span className="settings-nav-label">{s.label}</span>
      {activeSection === s.id && <span className="settings-nav-cursor" />}
      </button>
    ))}
    </nav>

    {/* ── Contenu ── */}
    <main className="settings-main">
    <SectionErrorBoundary key={activeSection}>
    {activeSection === 'systeme'      && <SectionSysteme onHardReset={hardReset} />}
    {activeSection === 'constitution' && <SectionConstitution />}
    {activeSection === 'conseil'      && <SectionConseil />}
    {activeSection === 'simulation'   && <SectionSimulation />}
    {activeSection === 'interface'    && <SectionInterface />}
    {activeSection === 'apropos'      && <SectionAPropos />}
    </SectionErrorBoundary>
    </main>
    </div>
    </div>
  );
}
