// src/features/init/components/IAConfigAccordion.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  IAConfigAccordion.jsx — Accordéon de configuration du mode IA
//
//  Affiche un sélecteur de mode (ARIA / Solo / Custom / Board Game)
//  et, selon le mode actif, les sélecteurs de provider/modèle par rôle.
//
//  Logique de filtrage des modes :
//    - 0 provider → Board Game uniquement
//    - 1 provider → Solo ou Board Game
//    - 2+ providers → tous les modes disponibles
//
//  Dépendances : shared/constants/llmRegistry, ariaI18n
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import { FONT, SELECT_STYLE, BTN_SECONDARY } from '../../../shared/theme';
import { ARIA_FALLBACK_MODELS, PROV_LABELS } from '../../../shared/constants/llmRegistry';

export default function IAConfigAccordion({
    availProviders,
    ariaMode,
    setAriaMode,
    roles,
    setRoles,
    modelReg,
    p0,
    cfgOpen,
    setCfgOpen
}) {
    const { lang } = useLocale();

    const accordionItem = {
        id: 'ia',
        label: '⚡ MODE IA',
        badge: ariaMode === 'none' ? 'BOARD GAME' : ariaMode === 'solo' ? 'SOLO' : ariaMode === 'custom' ? 'CUSTOM' : 'ARIA',
        content: (
            <div style={{ padding: '0.5rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {availProviders.length === 0 && (
                <div style={{
                    fontSize: '0.40rem',
                    color: 'rgba(200,100,60,0.70)',
                                             fontFamily: FONT.mono,
                                             padding: '0.10rem 0.1rem',
                                             lineHeight: 1.5
                }}>
                {lang === 'en'
                    ? '⚠ No API key configured — only Board Game mode available'
            : '⚠ Aucune clé API configurée — seul le mode Board Game est disponible'}
            </div>
            )}

            <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[
                { id: 'aria', label: 'ARIA — Multi-agent complet' },
                { id: 'solo', label: t('INIT_SOLO_LABEL', lang) },
                  { id: 'custom', label: t('INIT_CUSTOM_LABEL', lang) },
                  { id: 'none', label: '🎲 Board Game' },
            ]
            // Filtre selon le nombre de providers disponibles
            .filter(m => {
                if (availProviders.length === 0) return m.id === 'none';
                if (ariaMode === 'none') return m.id === 'none';
                if (availProviders.length === 1) return m.id === 'solo' || m.id === 'none';
                return true;
            })
            .map(m => (
                <button
                key={m.id}
                style={{
                    ...BTN_SECONDARY,
                    flex: 1,
                    fontSize: '0.40rem',
                    padding: '0.28rem 0.4rem',
                    ...(ariaMode === m.id ? {
                        border: '1px solid rgba(200,164,74,0.50)',
                        color: 'rgba(200,164,74,0.90)',
                        background: 'rgba(200,164,74,0.08)'
                    } : {})
                }}
                onClick={() => setAriaMode(m.id)}
                >
                {m.label}
                </button>
            ))}
            </div>

            {ariaMode === 'none' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{
                    fontSize: '0.40rem',
                    color: 'rgba(140,160,200,0.40)',
                                     fontFamily: FONT.mono,
                                     padding: '0.10rem 0.1rem',
                                     lineHeight: 1.5
                }}>
                {lang === 'en'
                    ? 'Pre-written local responses — no API key needed'
            : 'Réponses locales pré-écrites — sans clé API'}
            </div>
            {availProviders.length > 0 && (
                <button
                onClick={() => setAriaMode(availProviders.length === 1 ? 'solo' : 'aria')}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: FONT.mono,
                    fontSize: '0.40rem',
                    color: 'rgba(140,160,200,0.45)',
                                           textDecoration: 'underline',
                                           textAlign: 'left'
                }}
                >
                {lang === 'en' ? '↺ Enable AI mode' : '↺ Activer le mode IA'}
                </button>
            )}
            </div>
            )}

            {/* Mode ARIA/Custom : grille provider+modèle pour chaque rôle de délibération */}
            {(ariaMode === 'aria' || ariaMode === 'custom') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {[
                    { provKey: 'ministre_provider', modelKey: 'ministre_model', label: 'Ministre' },
                    { provKey: 'synthese_min_prov', modelKey: 'synthese_min_model', label: t('INIT_SYNTH_MIN', lang) },
                                                                { provKey: 'phare_provider', modelKey: 'phare_model', label: 'Phare ☉' },
                                                                { provKey: 'boussole_provider', modelKey: 'boussole_model', label: 'Boussole ☽' },
                                                                { provKey: 'synthese_pres_prov', modelKey: 'synthese_pres_model', label: t('INIT_SYNTH_PRES', lang) },
                ].map(({ provKey, modelKey, label }) => {
                    const prov = roles[provKey] || availProviders[0] || 'openrouter';
                    const models = modelReg[prov] || ARIA_FALLBACK_MODELS[prov] || [];
                    return (
                        <div key={provKey} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '0.3rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.50)' }}>{label}</span>
                        <select
                        style={{ ...SELECT_STYLE, fontSize: '0.40rem', padding: '0.2rem 0.4rem' }}
                        value={prov}
                        onChange={e => setRoles(r => ({
                            ...r,
                            [provKey]: e.target.value,
                            [modelKey]: modelReg[e.target.value]?.[0]?.id || ''
                        }))}
                        >
                        {availProviders.map(p => <option key={p} value={p}>{PROV_LABELS[p] || p}</option>)}
                        </select>
                        <select
                        style={{ ...SELECT_STYLE, fontSize: '0.40rem', padding: '0.2rem 0.4rem' }}
                        value={roles[modelKey] || ''}
                        onChange={e => setRoles(r => ({ ...r, [modelKey]: e.target.value }))}
                        >
                        {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                        </select>
                        </div>
                    );
                })}
                </div>
            )}

            {/* Mode Solo : 1 seul provider → chips modèles ; 2+ providers → sélecteurs */}
            {ariaMode === 'solo' && (
                availProviders.length === 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                        fontFamily: FONT.mono,
                        fontSize: '0.40rem',
                        color: 'rgba(200,164,74,0.70)',
                                               letterSpacing: '0.10em',
                                               borderLeft: '2px solid rgba(200,164,74,0.35)',
                                               paddingLeft: '0.4rem',
                                               textTransform: 'uppercase'
                    }}>
                    {PROV_LABELS[p0] || p0}
                    </span>
                    {(modelReg[p0] || []).map(m => {
                        const chosen = (roles.ministre_model || '') === m.id;
                        return (
                            <button
                            key={m.id}
                            style={{
                                ...BTN_SECONDARY,
                                padding: '0.18rem 0.45rem',
                                fontSize: '0.40rem',
                                ...(chosen ? {
                                    border: '1px solid rgba(200,164,74,0.45)',
                                    color: 'rgba(200,164,74,0.88)',
                                    background: 'rgba(200,164,74,0.08)'
                                } : { opacity: 0.50 })
                            }}
                            onClick={() => setRoles(r => ({
                                ...r,
                                ministre_model: m.id,
                                synthese_min_model: m.id,
                                phare_model: m.id,
                                boussole_model: m.id,
                                synthese_pres_model: m.id,
                            }))}
                            >
                            {m.label}
                            </button>
                        );
                    })}
                    </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '0.3rem', alignItems: 'center' }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(140,160,200,0.50)' }}>
                    {t('INIT_MODEL_LABEL', lang)}
                    </span>
                    <select
                    style={{ ...SELECT_STYLE, fontSize: '0.40rem', padding: '0.2rem 0.4rem' }}
                    value={roles.ministre_provider || availProviders[0] || 'openrouter'}
                    onChange={e => setRoles(r => ({
                        ...r,
                        ministre_provider: e.target.value,
                        synthese_min_prov: e.target.value,
                        phare_provider: e.target.value,
                        boussole_provider: e.target.value,
                        synthese_pres_prov: e.target.value,
                        ministre_model: modelReg[e.target.value]?.[0]?.id || '',
                    }))}
                    >
                    {availProviders.map(p => <option key={p} value={p}>{PROV_LABELS[p] || p}</option>)}
                    </select>
                    <select
                    style={{ ...SELECT_STYLE, fontSize: '0.40rem', padding: '0.2rem 0.4rem' }}
                    value={roles.ministre_model || ''}
                    onChange={e => setRoles(r => ({
                        ...r,
                        ministre_model: e.target.value,
                        synthese_min_model: e.target.value,
                        phare_model: e.target.value,
                        boussole_model: e.target.value,
                        synthese_pres_model: e.target.value,
                    }))}
                    >
                    {(modelReg[roles.ministre_provider] || []).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                    </div>
                )
            )}
            </div>
        )
    };

    return (
        <div key={accordionItem.id} className={`aria-accordion${cfgOpen === accordionItem.id ? ' open' : ''}`}>
        <button
        className="aria-accordion__hdr"
        onClick={() => setCfgOpen(p => p === accordionItem.id ? '' : accordionItem.id)}
        >
        <span className="aria-accordion__arrow">{cfgOpen === accordionItem.id ? '▾' : '▸'}</span>
        <span className="aria-accordion__label">{accordionItem.label}</span>
        {accordionItem.badge && <span className="aria-accordion__badge">{accordionItem.badge}</span>}
        </button>
        {cfgOpen === accordionItem.id && (
            <div className="aria-accordion__body">
            {accordionItem.content}
            </div>
        )}
        </div>
    );
}
