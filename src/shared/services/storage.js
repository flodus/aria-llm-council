// Centralisation de toutes les fonctions localStorage

export const loadOpts = () => {
    try { return JSON.parse(localStorage.getItem('aria_options')||'{}'); }
    catch { return {}; }
};

export const saveOpts = (opts) => {
    try { localStorage.setItem('aria_options', JSON.stringify(opts)); }
    catch {}
};

export const loadPreferredModels = () => {
    try { return JSON.parse(localStorage.getItem('aria_preferred_models')||'{}'); }
    catch { return {}; }
};

export const savePreferredModels = (models) => {
    try { localStorage.setItem('aria_preferred_models', JSON.stringify(models)); }
    catch {}
};

export const loadIARoles = () => {
    try {
        const r = (JSON.parse(localStorage.getItem('aria_options')||'{}')).ia_roles || {};
        return r;
    } catch { return {}; }
};

export const loadKeys = () => {
    try { return JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); }
    catch { return {}; }
};

export const saveKeys = (keys) => {
    try { localStorage.setItem('aria_api_keys', JSON.stringify(keys)); }
    catch {}
};

export const loadKeyStatus = () => {
    try { return JSON.parse(localStorage.getItem('aria_api_keys_status')||'{}'); }
    catch { return {}; }
};

export const saveKeyStatus = (status) => {
    try { localStorage.setItem('aria_api_keys_status', JSON.stringify(status)); }
    catch {}
};

export const loadAgentsOverride = () => {
    try { return JSON.parse(localStorage.getItem('aria_agents_override')||'null'); }
    catch { return null; }
};

export const saveAgentsOverride = (agents) => {
    try { localStorage.setItem('aria_agents_override', JSON.stringify(agents)); }
    catch {}
};
