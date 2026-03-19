// src/features/init/hooks/useIAConfig.js

import { useState, useEffect } from 'react';
import { ARIA_FALLBACK_MODELS, ARIA_REGISTRY_URL } from '../../../shared/constants/llmRegistry';

const loadOpts = () => { try { return JSON.parse(localStorage.getItem('aria_options')||'{}'); } catch { return {}; } };
const loadPreferredModels = () => { try { return JSON.parse(localStorage.getItem('aria_preferred_models')||'{}'); } catch { return {}; } };
const loadIARoles = () => { try { const r = (JSON.parse(localStorage.getItem('aria_options')||'{}')).ia_roles || {}; return r; } catch { return {}; } };
const loadKeys = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); } catch { return {}; } };
const loadKeyStatus = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys_status')||'{}'); } catch { return {}; } };

export default function useIAConfig() {
    const [modelReg, setModelReg] = useState(ARIA_FALLBACK_MODELS);
    const [regStatus, setRegStatus] = useState('idle');
    const [cfgOpen, setCfgOpen] = useState('');

    const apiKeys = loadKeys();
    const savedKeyStatus = loadKeyStatus();

    const availProviders = ['openrouter', 'claude', 'gemini', 'grok', 'openai'].filter(id => {
        const v = apiKeys[id];
        const hasKey = Array.isArray(v)
        ? v.some(k => (typeof k === 'string' ? k : k?.key)?.trim()?.length > 0)
        : typeof v === 'string' && v.trim().length > 0;
        return hasKey && savedKeyStatus[id] !== 'error';
    });

    const [ariaMode, setAriaMode] = useState(() => {
        const saved = loadOpts().ia_mode;
        const keys = loadKeys();
        const ks = loadKeyStatus();
        const provCount = ['openrouter', 'claude', 'gemini', 'grok', 'openai'].filter(id => {
            const v = keys[id];
            const hasKey = Array.isArray(v)
            ? v.some(k => (typeof k === 'string' ? k : k?.key)?.trim()?.length > 0)
            : typeof v === 'string' && v.trim().length > 0;
            return hasKey && ks[id] !== 'error';
        }).length;

        if (provCount === 0) return 'none';
        if (!saved || saved === 'none') return provCount === 1 ? 'solo' : 'aria';
        if (provCount === 1 && (saved === 'aria' || saved === 'custom')) return 'solo';
        return saved;
    });

    const p0 = availProviders[0] || 'openrouter';
    const p1 = availProviders[1] || p0;
    const prefModels = loadPreferredModels();

    const initRoles = () => {
        const r = loadIARoles();
        const opts = loadOpts();
        const modelOf = (prov) => prefModels[prov] || ARIA_FALLBACK_MODELS[prov]?.find(m => m.label.includes('★'))?.id || ARIA_FALLBACK_MODELS[prov]?.[0]?.id || '';

        if (opts.ia_mode === 'solo') {
            const soloProv = opts.solo_model || p0;
            const soloModel = modelOf(soloProv);
            return {
                ministre_provider: soloProv, ministre_model: soloModel,
                synthese_min_prov: soloProv, synthese_min_model: soloModel,
                phare_provider: soloProv, phare_model: soloModel,
                boussole_provider: soloProv, boussole_model: soloModel,
                synthese_pres_prov: soloProv, synthese_pres_model: soloModel,
            };
        }

        const vp = (p) => availProviders.includes(p) ? p : (availProviders[0] || p);
        const ministerProv = vp(r.ministre_provider || r.ministre_model || p0);
        const synthMinProv = vp(r.synthese_min_prov || r.synthese_min || p1);
        const phareProv = vp(r.phare_provider || r.phare_model || p0);
        const boussoleProv = vp(r.boussole_provider || r.boussole_model || p0);
        const synthPresProv = vp(r.synthese_pres_prov || r.synthese_pres || p1);

        return {
            ministre_provider: ministerProv, ministre_model: modelOf(ministerProv),
            synthese_min_prov: synthMinProv, synthese_min_model: modelOf(synthMinProv),
            phare_provider: phareProv, phare_model: modelOf(phareProv),
            boussole_provider: boussoleProv, boussole_model: modelOf(boussoleProv),
            synthese_pres_prov: synthPresProv, synthese_pres_model: modelOf(synthPresProv),
        };
    };

    const [roles, setRoles] = useState(initRoles);

    // Registry fetch
    useEffect(() => {
        if (ARIA_REGISTRY_URL.includes('REPLACE_WITH')) {
            setRegStatus('error');
            return;
        }
        setRegStatus('loading');
        fetch(ARIA_REGISTRY_URL)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
            setModelReg({ ...ARIA_FALLBACK_MODELS, ...data });
            setRegStatus('ok');
        })
        .catch(() => setRegStatus('error'));
    }, []);

    // Rattraper ariaMode
    useEffect(() => {
        if (ariaMode === 'none' && availProviders.length > 0) {
            setAriaMode(availProviders.length === 1 ? 'solo' : 'aria');
        }
    }, [availProviders.length]);

    return {
        modelReg,
        regStatus,
        availProviders,
        ariaMode, setAriaMode,
        roles, setRoles,
        p0, p1,
        cfgOpen, setCfgOpen
    };
}
