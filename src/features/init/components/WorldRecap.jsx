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

import { getAgents } from '../../../shared/data/gameData';
import { getDestin } from '../../council/services/agentsManager';
import { FONT, BTN_PRIMARY, BTN_SECONDARY } from '../../../shared/theme';
import { t } from '../../../ariaI18n';

const PROV_LABEL = { claude: 'Claude', gemini: 'Gemini', openai: 'GPT', grok: 'Grok', openrouter: 'OpenRouter' };

export default function WorldRecap({ govOpts, iaConfig, lang, onAccept, onModify }) {
    const isEn = lang === 'en';
    const agents = getAgents();
    const gov = govOpts?.defaultGovernance || {};

    // Présidence
    const presType = gov.presidency || 'duale';
    const presInfo = {
        solaire:    { icon: '☉',  label: t('RECAP_PRES_SOLAIRE', lang) },
        lunaire:    { icon: '☽',  label: t('RECAP_PRES_LUNAIRE', lang) },
        duale:      { icon: '☉☽', label: t('RECAP_PRES_DUALE', lang) },
        collegiale: { icon: '✡',  label: t('RECAP_PRES_COLLEGIALE', lang) },
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
        auto:       t('CTX_AUTO_LBL', lang),
        rich:       t('CTX_RICH_LBL', lang),
        stats_only: t('CTX_STATS_LBL', lang),
        off:        t('CTX_OFF_LBL', lang),
    }[govOpts?.gameplay?.context_mode || 'auto'] || t('CTX_AUTO_LBL', lang);

    // Mode IA
    const iaMode = iaConfig?.ariaMode || 'none';
    const iaOnline = iaMode !== 'none';
    let iaLabel = 'Board Game';
    let iaTooltip = t('RECAP_NO_AI', lang);
    if (iaMode === 'solo') {
        const prov = iaConfig.roles?.ministre_provider || iaConfig.availProviders?.[0] || '';
        iaLabel = `Solo — ${PROV_LABEL[prov] || prov}`;
        iaTooltip = isEn ? `All roles: ${PROV_LABEL[prov] || prov}` : `Tous les rôles : ${PROV_LABEL[prov] || prov}`;
    } else if (iaMode === 'aria' || iaMode === 'custom') {
        const r = iaConfig.roles || {};
        const provs = [...new Set([r.ministre_provider, r.phare_provider, r.boussole_provider, r.synthese_pres_prov].filter(Boolean))];
        iaLabel = provs.map(p => PROV_LABEL[p] || p).join(' · ') || 'ARIA';
        iaTooltip = [
            r.ministre_provider && `${t('RECAP_MINISTERS', lang)}: ${PROV_LABEL[r.ministre_provider] || r.ministre_provider}`,
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
                {t('RECAP_TITLE', lang)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>

                {/* Présidence */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={labelCol}>{t('RECAP_PRESIDENCY', lang)}</span>
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
                    <span style={labelCol}>{t('GOV_MINISTRIES', lang)}</span>
                    <div style={emojiRow}>
                        {activeMins.map(m => <span key={m.id} title={m.name}>{m.emoji}</span>)}
                    </div>
                </div>

                {/* Ministres */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={labelCol}>{t('GOV_MINISTERS', lang)}</span>
                    <div style={emojiRow}>
                        {allMinisters.map(([id, m]) => <span key={id} title={m.name}>{m.emoji}</span>)}
                    </div>
                </div>

                {/* Destin — parent + enfants */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={labelCol}>{t('RECAP_DESTINY', lang)}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span
                            style={{ fontFamily: FONT.mono, fontSize: '0.60rem', lineHeight: 1 }}
                            title={t('RECAP_DESTINY_TIP', lang)}
                        >
                            🎲 {destinOn ? '✓' : '✗'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.8rem', paddingLeft: '0.5rem', fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(180,200,230,0.65)' }}>
                            <span style={{ opacity: 0.45 }}>↳</span>
                            {destinAgents.map(([id, m]) => {
                                const icon = id === 'oracle' ? '☯' : '📜';
                                const tip = id === 'oracle'
                                    ? t('RECAP_ORACLE_TIP', lang)
                                    : t('RECAP_TRAME_TIP', lang);
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
                    <span style={labelCol}>{t('RECAP_DELIBERATION', lang)}</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(180,200,230,0.60)' }}>
                        {ctxLabel}
                    </span>
                </div>

                {/* Mode IA */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={labelCol}>{t('RECAP_AI_MODE', lang)}</span>
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
                    {t('RECAP_ACCEPT', lang)}
                </button>
                <button onClick={onModify} style={{ ...BTN_SECONDARY, fontSize: '0.46rem', flex: 1 }}>
                    {t('RECAP_MODIFY', lang)}
                </button>
            </div>
        </div>
    );
}
