// src/features/init/components/CountryConfig.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  CountryConfig.jsx — Formulaire de configuration d'un pays (mode personnalisé)
//
//  Gère les deux types de pays : fictif (imaginaire) et réel.
//  En mode IA + réel : validation temps réel via RestCountries (debounce 700ms).
//  Inclut un ContextPanel pour le mode de contexte de délibération par pays.
//
//  Dépendances : features/init/services, shared/services/country
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { useLocale, t } from '../../../ariaI18n';
// Thème (pas d'index)
import {
    FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
    BTN_PRIMARY, BTN_SECONDARY, labelStyle,
    wrap, mCard, tag
} from '../../../shared/theme';
// Services (chaque sous-dossier a son index)
import { getTerrainLabelMap, getRegimeLabelMap, getPaysLocaux } from '../services/labels';
import { getRealCountries } from '../services/realCountries';
import { validateCountryWithAI } from '../../../shared/services/country';
// Composants (via index.js de components/)
import {
    CountryInfoCard,
    ContextPanel,
    CountryEstimations,
    RealCountryLocalSection,
    FictionalCountrySection,
    RealCountryAISection
} from './index';

export default function CountryConfig({ c, idx, mode, onChange, onRemove, canRemove }) {
    const { lang } = useLocale();
    const setField = (k, v) => onChange({ ...c, [k]: v });

    // État local
    const [rcSearch, setRcSearch] = useState(c.nom || '');
    const [rcStatus, setRcStatus] = useState(null);
    const [rcSuggestion, setRcSuggestion] = useState(null);
    const rcTimer = useRef(null);
    const rcQueryRef = useRef('');

    // Fonction de recherche
    const searchRestCountries = async (query) => {
        rcQueryRef.current = query;
        if (!query || query.length < 3) { setRcStatus(null); return; }

        const local = getRealCountries().find(r =>
        r.nom.toLowerCase() === query.toLowerCase() ||
        r.id === query.toLowerCase().replace(/[^a-z]/g, '')
        );

        if (local) {
            onChange({ ...c, nom: local.nom, regime: local.regime, terrain: local.terrain, realData: local, _rcStatus: 'found' });
            setRcStatus('found');
            return;
        }

        setRcStatus('searching');
        try {
            const ai = await validateCountryWithAI(query, lang);
            if (rcQueryRef.current !== query) return;

            if (ai.status === 'notfound' || !ai.displayName) {
                setRcStatus('notfound');
                onChange({ ...c, _rcStatus: 'notfound', _rcSuggestion: null });
                return;
            }

            if (ai.status === 'suggestion') {
                setRcStatus('suggestion');
                setRcSuggestion(ai.displayName);
                onChange({ ...c, _rcStatus: 'suggestion', _rcSuggestion: ai.displayName });
                return;
            }

            // found
            const nom = ai.displayName;
            let flag = '🌐', population = 5_000_000, region = '';
            try {
                const rc = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ai.canonicalName || nom)}?fields=name,flag,population,region`)
                .then(r => r.ok ? r.json() : []);
                if (rc[0]) {
                    flag = rc[0].flag || '🌐';
                    population = rc[0].population || 5_000_000;
                    region = rc[0].region || '';
                }
            } catch (_) { }

            const synth = {
                id: nom.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                nom, flag, regime: 'democratie_liberale', terrain: 'coastal',
                population, region, _fromApi: true,
            };
            onChange({ ...c, nom, realData: synth, _rcStatus: 'found' });
            setRcStatus('found');
        } catch (_) {
            setRcStatus('error');
        }
    };

    // Debounce
    useEffect(() => {
        if (c.type !== 'reel' || mode !== 'ai') return;
        rcQueryRef.current = '';
        setRcStatus(null);
        setRcSuggestion(null);
        clearTimeout(rcTimer.current);
        if (!rcSearch || rcSearch.length < 3) return;
        rcTimer.current = setTimeout(() => searchRestCountries(rcSearch), 700);
        return () => clearTimeout(rcTimer.current);
    }, [rcSearch, c.type, mode]);

    return (
        <div style={{ ...CARD_STYLE, padding: '0.9rem 1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={labelStyle('0.44rem')}>NATION {idx + 1}</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {c.type === 'imaginaire' && (
            <span style={{ ...tag, color: 'rgba(100,180,255,0.60)', border: '1px solid rgba(100,180,255,0.22)', background: 'rgba(100,180,255,0.05)' }}>
            {c.realData?.emoji || '🌐'} FICTIF
            </span>
        )}
        {c.realData && c.type === 'reel' && <span style={tag}>{c.realData.flag} PAYS RÉEL</span>}
        {canRemove && (
            <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'rgba(200,80,80,0.45)', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
        )}
        </div>
        </div>

        {/* Toggle fictif/réel */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
        {[
            { v: 'imaginaire', l: mode === 'ai' ? (lang === 'en' ? '🌐 Fictional (AI)' : '🌐 Fictif (IA)') : (lang === 'en' ? '🌐 Fictional' : '🌐 Fictif') },
            { v: 'reel', l: mode === 'ai' ? t('INIT_MODE_REAL_AI', lang) : t('INIT_MODE_REAL', lang) },
        ].map(t => (
            <button
            key={t.v}
            style={{
                ...BTN_SECONDARY, flex: 1, padding: '0.3rem', fontSize: '0.48rem',
                ...(c.type === t.v ? { border: '1px solid rgba(200,164,74,0.40)', color: 'rgba(200,164,74,0.88)', background: 'rgba(200,164,74,0.08)' } : {})
            }}
            onClick={() => onChange({ ...c, type: t.v, realData: null, nom: '', terrain: 'coastal', regime: 'democratie_liberale' })}
            >
            {t.l}
            </button>
        ))}
        </div>

        {/* Section Pays Réel (mode AI) */}
        {c.type === 'reel' && mode === 'ai' && (
            <RealCountryAISection
            country={c}
            onChange={onChange}
            setField={setField}
            />
        )}

        {/* Section Pays Réel (mode local) */}
        {c.type === 'reel' && mode === 'local' && (
            <RealCountryLocalSection
            country={c}
            onChange={onChange}
            setField={setField}
            />
        )}

        {/* Section Fictif */}
        {c.type === 'imaginaire' && (
            <FictionalCountrySection
            country={c}
            idx={idx}
            onChange={onChange}
            setField={setField}
            />
        )}

        {/* Contexte Délibérations par Pays*/}
        <ContextPanel
        countryName={c.nom || c.realData?.nom || `Nation ${idx + 1}`}
        open={!!c._ctxOpen}
        onToggle={() => setField('_ctxOpen', !c._ctxOpen)}
        mode={c.context_mode || ''}
        setMode={v => setField('context_mode', v || undefined)}
        override={c.contextOverride || ''}
        setOverride={v => setField('contextOverride', v || undefined)}
        />
        </div>
    );
}
