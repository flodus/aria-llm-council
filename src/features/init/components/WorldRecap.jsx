// src/features/init/components/WorldRecap.jsx
// ═══════════════════════════════════════════════════════════════════════════
//  Bloc "Monde par défaut — ARIA" affiché avant que le joueur accepte
//  ou modifie la constitution au lancement.
//
//  Props :
//    govOpts   aria_options (defaultGovernance, gameplay)
//    iaConfig  retour de useIAConfig()
//    lang      'fr' | 'en'
//    onAccept  () => void — "Ce monde me convient"
//    onModify  () => void — "Je veux le modifier"
// ═══════════════════════════════════════════════════════════════════════════

import { getAgents } from '../../../Dashboard_p1';
import { getDestin } from '../../council/services/agentsManager';
import { FONT, BTN_PRIMARY, BTN_SECONDARY } from '../../../shared/theme';

const PROV_LABEL = { claude: 'Claude', gemini: 'Gemini', openai: 'GPT', grok: 'Grok', openrouter: 'OpenRouter' };

export default function WorldRecap({ govOpts, iaConfig, lang, onAccept, onModify }) {
    const isEn = lang === 'en';
    const agents = getAgents();
    const gov = govOpts?.defaultGovernance || {};

    // Présidence
    const presType = gov.presidency || 'duale';
    const presInfo = {
        solaire:    { icon: '☉',  label: isEn ? 'Phare — The Will'        : 'Phare — La Volonté' },
        lunaire:    { icon: '☽',  label: isEn ? 'Boussole — The Soul'      : 'Boussole — L\'Âme' },
        duale:      { icon: '☉☽', label: isEn ? 'Dual — ARIA mode'         : 'Duale — Mode ARIA' },
        collegiale: { icon: '✡',  label: isEn ? 'Collegial — 12 ministers' : 'Collégiale — 12 ministres' },
    }[presType] || { icon: '☉☽', label: 'Duale' };

    // Ministères
    const activeMinsIds = gov.ministries || agents.ministries.map(m => m.id);
    const activeMins = agents.ministries.filter(m => activeMinsIds.includes(m.id));

    // Ministres + destin
    const destinIds = new Set(getDestin()?.agents || []);
    const allMinisters = Object.entries(agents.ministers || {})
        .filter(([id, m]) => m.name && m.emoji && !destinIds.has(id));
    const destinAgents = Object.entries(agents.ministers || {})
        .filter(([id, m]) => destinIds.has(id) && m.name && m.emoji);
    const destinOn = gov.destiny_mode === true;

    // Délibération
    const ctxLabel = {
        auto:       isEn ? '🤖 Auto'          : '🤖 Auto',
        rich:       isEn ? '📖 Enriched'      : '📖 Enrichi',
        stats_only: isEn ? '📊 Stats only'    : '📊 Stats seules',
        off:        isEn ? '🚫 Disabled'      : '🚫 Désactivé',
    }[govOpts?.gameplay?.context_mode || 'auto'] || '🤖 Auto';

    // Mode IA
    const iaMode = iaConfig?.ariaMode || 'none';
    const iaOnline = iaMode !== 'none';
    let iaLabel = 'Board Game';
    let iaTooltip = isEn ? 'No AI — hardcoded responses' : 'Sans IA — réponses prédéfinies';
    if (iaMode === 'solo') {
        const prov = iaConfig.roles?.ministre_provider || iaConfig.availProviders?.[0] || '';
        iaLabel = `Solo — ${PROV_LABEL[prov] || prov}`;
        iaTooltip = isEn ? `All roles: ${PROV_LABEL[prov] || prov}` : `Tous les rôles : ${PROV_LABEL[prov] || prov}`;
    } else if (iaMode === 'aria' || iaMode === 'custom') {
        const r = iaConfig.roles || {};
        const provs = [...new Set([r.ministre_provider, r.phare_provider, r.boussole_provider, r.synthese_pres_prov].filter(Boolean))];
        iaLabel = provs.map(p => PROV_LABEL[p] || p).join(' · ') || 'ARIA';
        iaTooltip = [
            r.ministre_provider && `${isEn ? 'Ministers' : 'Ministres'}: ${PROV_LABEL[r.ministre_provider] || r.ministre_provider}`,
            r.phare_provider    && `☉ Phare: ${PROV_LABEL[r.phare_provider] || r.phare_provider}`,
            r.boussole_provider && `☽ Boussole: ${PROV_LABEL[r.boussole_provider] || r.boussole_provider}`,
        ].filter(Boolean).join(' · ');
    }

    const labelCol = {
        fontFamily: FONT.mono, fontSize: '0.38rem', letterSpacing: '0.12em',
        color: 'rgba(200,164,74,0.50)', whiteSpace: 'nowrap', textTransform: 'uppercase',
        minWidth: '5.5rem', paddingTop: '0.05rem',
    };
    const emojiRow = {
        fontFamily: FONT.mono, fontSize: '0.60rem', lineHeight: 1,
        display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center',
    };

    return (
        <div style={{
            width: '100%', padding: '0.9rem 1rem',
            background: 'rgba(20,28,45,0.65)', border: '1px solid rgba(200,164,74,0.18)',
            borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
            <div style={{ fontFamily: FONT.mono, fontSize: '0.40rem', letterSpacing: '0.18em', color: 'rgba(200,164,74,0.55)', textTransform: 'uppercase' }}>
                {isEn ? 'Default world — ARIA' : 'Monde par défaut — ARIA'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>

                {/* Présidence */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={labelCol}>{isEn ? 'Presidency' : 'Présidence'}</span>
                    <span style={{
                        fontFamily: FONT.mono, fontSize: '0.50rem', letterSpacing: '0.06em',
                        color: 'rgba(200,164,74,0.90)',
                        background: 'rgba(200,164,74,0.08)', border: '1px solid rgba(200,164,74,0.30)',
                        borderRadius: '2px', padding: '0.18rem 0.55rem',
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                        <span>{presInfo.icon}</span><span>{presInfo.label}</span>
                    </span>
                </div>

                {/* Ministères */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={labelCol}>{isEn ? 'Ministries' : 'Ministères'}</span>
                    <div style={emojiRow}>
                        {activeMins.map(m => <span key={m.id} title={m.name}>{m.emoji}</span>)}
                    </div>
                </div>

                {/* Ministres */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={labelCol}>{isEn ? 'Ministers' : 'Ministres'}</span>
                    <div style={emojiRow}>
                        {allMinisters.map(([id, m]) => <span key={id} title={m.name}>{m.emoji}</span>)}
                    </div>
                </div>

                {/* Destin — parent + enfants */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={labelCol}>{isEn ? 'Destiny' : 'Destin'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span
                            style={{ fontFamily: FONT.mono, fontSize: '0.60rem', lineHeight: 1 }}
                            title={isEn ? 'Introduces external forces into deliberations' : 'Introduit des forces extérieures dans les délibérations'}
                        >
                            🎲 {destinOn ? '✓' : '✗'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.8rem', paddingLeft: '0.5rem', fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(180,200,230,0.65)' }}>
                            <span style={{ opacity: 0.45 }}>↳</span>
                            {destinAgents.map(([id, m]) => {
                                const icon = id === 'oracle' ? '☯' : '📜';
                                const tip = id === 'oracle'
                                    ? (isEn ? 'Oracle: takes a position in deliberations' : 'Oracle : prend position dans les délibérations')
                                    : (isEn ? 'Trame: shapes the global narrative over cycles' : 'Trame : oriente le récit global sur la durée des cycles');
                                return (
                                    <span key={id} title={tip} style={{ opacity: destinOn ? 1 : 0.35 }}>
                                        {icon} {m.name} {destinOn ? '✓' : '✗'}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Délibération */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={labelCol}>{isEn ? 'Deliberation' : 'Délibération'}</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(180,200,230,0.60)' }}>
                        {ctxLabel}
                    </span>
                </div>

                {/* Mode IA */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={labelCol}>{isEn ? 'AI mode' : 'Mode IA'}</span>
                    <span
                        title={iaTooltip}
                        style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: iaOnline ? 'rgba(180,200,230,0.75)' : 'rgba(140,160,180,0.45)' }}
                    >
                        🧠 {iaLabel}
                    </span>
                </div>

            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={onAccept} style={{ ...BTN_PRIMARY, fontSize: '0.46rem', flex: 1 }}>
                    {isEn ? 'This world suits me →' : 'Ce monde me convient →'}
                </button>
                <button onClick={onModify} style={{ ...BTN_SECONDARY, fontSize: '0.46rem', flex: 1 }}>
                    {isEn ? 'I want to modify it →' : 'Je veux le modifier →'}
                </button>
            </div>
        </div>
    );
}
