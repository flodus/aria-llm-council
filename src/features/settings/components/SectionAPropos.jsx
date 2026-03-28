// src/features/settings/components/SectionAPropos.jsx
// SECTION À PROPOS — Version, documentation, crédits, manifeste

import { useLocale } from '../../../ariaI18n';
import { SectionTitle } from '../ui/SettingsUI';
import { ARIAManifeste } from './ARIAManifeste';

export default function SectionAPropos() {
    const { lang } = useLocale();
    const isEn = lang === 'en';

    return (
        <div className="settings-section-body">
        <SectionTitle icon="✦" label={isEn?"ABOUT":"À PROPOS"} sub={isEn?"Version · Documentation · Credits":"Version · Documentation · Crédits"} />

        <div className="settings-apropos-block">
        <div className="settings-version-badge">
        <span className="settings-version-number">v1.0</span>
        <span className="settings-version-name">"Phare"</span>
        </div>
        <div className="settings-apropos-desc">
        {isEn?"Institutional Reasoning Architecture by AI.":"Architecture de Raisonnement Institutionnel par l'IA."}<br />
        {isEn?"An augmented deliberative governance system.":"Un système de gouvernance délibérative augmentée."}<br />
        <em>{lang==='en'?'Deliberate. Annotate. Synthesize. Decide.':'Délibérer. Annoter. Synthétiser. Décider.'}</em>
        </div>
        </div>

        <div className="settings-group">
        <div className="settings-group-title">{isEn?"FOUNDING PRINCIPLE":"PRINCIPE FONDATEUR"}</div>
        <blockquote className="settings-quote">
        {isEn
            ? "The real question is not whether AI will enter governance — it already is, in an opaque and unregulated way. The question is whether we will choose to do so deliberately, with democratic safeguards, or by default, without them."
            : `« La vraie question n’est pas de savoir si l’IA entrera dans la gouvernance — elle y entre déjà, de manière opaque et non régulée. La question est de savoir si nous choisirons de le faire délibérément, avec des garde-fous démocratiques, ou par défaut, sans eux. »`
        }
        </blockquote>
        </div>

        <div className="settings-group">
        <div className="settings-group-title">{isEn?"DOCUMENTATION":"DOCUMENTATION"}</div>
        <div className="settings-links">
        <a className="settings-link" href="../doc/aria.pdf" target="_blank" rel="noopener">
        {isEn?"📄 ARIA Vision Document (PDF)":"📄 Document de vision ARIA (PDF)"}
        </a>
        <a className="settings-link" href="#" target="_blank" rel="noopener">
        {isEn?"💻 GitHub source code":"💻 Code source GitHub"}
        </a>
        <a className="settings-link" href="#" target="_blank" rel="noopener">
        {isEn?"🎮 Interactive demo":"🎮 Démonstration interactive"}
        </a>
        </div>
        </div>

        <div className="settings-group">
        <div className="settings-group-title">{isEn?"TECHNICAL ARCHITECTURE":"ARCHITECTURE TECHNIQUE"}</div>
        <div className="settings-tech-stack">
        <div className="settings-tech-row"><span>{isEn?"Frontend":"Frontend"}</span><span>React 18 · Vite · CSS custom</span></div>
        <div className="settings-tech-row"><span>{isEn?"Map":"Carte"}</span><span>SVG pur · PRNG reproductible</span></div>
        <div className="settings-tech-row"><span>{isEn?"AI Thinking":"IA Pensée"}</span><span>Claude · Gemini · Grok · OpenAI (configurable)</span></div>
        <div className="settings-tech-row"><span>{isEn?"AI Synthesis":"IA Synthèse"}</span><span>Multi-providers — sélection par rôle</span></div>
        <div className="settings-tech-row"><span>{isEn?"Persistence":"Persistance"}</span><span>localStorage</span></div>
        <div className="settings-tech-row"><span>{isEn?"Data":"Données"}</span><span>base_agents.json · base_stats.json · ariaData.js</span></div>
        </div>
        </div>

        <ARIAManifeste />
        </div>
    );
}
