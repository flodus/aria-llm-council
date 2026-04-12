// src/features/settings/components/SectionAPropos.jsx
// SECTION À PROPOS — Version, documentation, crédits, manifeste

import { useLocale, t } from '../../../ariaI18n';
import { SectionTitle } from '../ui/SettingsUI';
import { ARIAManifeste } from './ARIAManifeste';

export default function SectionAPropos() {
    const { lang } = useLocale();
    const isEn = lang === 'en';

    return (
        <div className="settings-section-body">
        <SectionTitle icon="✦" label={t('APROPOS_LABEL', lang)} sub={t('APROPOS_SUB', lang)} />

        <div className="settings-apropos-block">
        <div className="settings-version-badge">
        <span className="settings-version-number">v1.0</span>
        <span className="settings-version-name">"Phare"</span>
        </div>
        <div className="settings-apropos-desc">
        {t('APROPOS_DESC1', lang)}<br />
        {t('APROPOS_DESC2', lang)}<br />
        <em>{t('APROPOS_MOTTO', lang)}</em>
        </div>
        </div>

        <div className="settings-group">
        <div className="settings-group-title">{t('APROPOS_PRINCIPLE_HDR', lang)}</div>
        <blockquote className="settings-quote">
        {t('APROPOS_QUOTE', lang)}
        </blockquote>
        </div>

        <div className="settings-group">
        <div className="settings-group-title">DOCUMENTATION</div>
        <div className="settings-links">
        <a className="settings-link" href="../doc/aria.pdf" target="_blank" rel="noopener">
        {t('APROPOS_PDF', lang)}
        </a>
        <a className="settings-link" href="#" target="_blank" rel="noopener">
        {t('APROPOS_GITHUB', lang)}
        </a>
        <a className="settings-link" href="#" target="_blank" rel="noopener">
        {t('APROPOS_DEMO', lang)}
        </a>
        </div>
        </div>

        <div className="settings-group">
        <div className="settings-group-title">{t('APROPOS_TECH_HDR', lang)}</div>
        <div className="settings-tech-stack">
        <div className="settings-tech-row"><span>Frontend</span><span>React 18 · Vite · CSS custom</span></div>
        <div className="settings-tech-row"><span>{t('APROPOS_MAP', lang)}</span><span>SVG pur · PRNG reproductible</span></div>
        <div className="settings-tech-row"><span>{t('APROPOS_AI_THINK', lang)}</span><span>Claude · Gemini · Grok · OpenAI (configurable)</span></div>
        <div className="settings-tech-row"><span>{t('APROPOS_AI_SYNTH', lang)}</span><span>Multi-providers — sélection par rôle</span></div>
        <div className="settings-tech-row"><span>{t('APROPOS_PERSIST', lang)}</span><span>localStorage</span></div>
        <div className="settings-tech-row"><span>{t('APROPOS_DATA', lang)}</span><span>base_agents.json · base_stats.json · ariaData.js</span></div>
        </div>
        </div>

        <ARIAManifeste />
        </div>
    );
}
