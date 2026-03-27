// src/features/council/services/agentsManager.js

// ============================================================
// GESTIONNAIRE D'AGENTS DU CONSEIL
// ============================================================
// Responsabilités :
// - Charger les agents (ministères, ministres, présidence)
// - Gérer les overrides (localStorage + pays)
// - Filtrer selon les configurations actives
// ============================================================

import AGENTS_RAW    from '../../../../templates/languages/fr/governance.json';
import AGENTS_RAW_EN from '../../../../templates/languages/en/governance.json';
import { loadLang }  from '../../../ariaI18n';

// ============================================================
// DONNÉES AGENTS — runtime override via localStorage
// aria_agents_override = { ministries, ministers, presidency, active_ministries, active_presidency, active_ministers }
// active_ministries   = string[]  — ids des ministères actifs (undefined = tous)
// active_presidency   = string[]  — ['phare','boussole'] subset (undefined = les deux)
// active_ministers    = string[]  — ids des ministres actifs (undefined = tous)
// ============================================================

function getAgents() {
    const BASE = loadLang() === 'en' ? AGENTS_RAW_EN : AGENTS_RAW;
    try {
        const ov = JSON.parse(localStorage.getItem('aria_agents_override') || 'null');
        if (!ov) return BASE;

        // Les noms/labels viennent toujours du JSON localisé (BASE).
        // L'override contribue uniquement : active_*, et les prompts custom
        // (ministerPrompts, mission, essence) qui sont par nature libres de langue.
        const mergedMinistries = BASE.ministries.map(bm => {
            const om = (ov.ministries || []).find(m => m.id === bm.id);
            if (!om) return bm;
            return {
                ...bm,
                // Prompts custom de l'override (libres) — sinon valeur de BASE
                ministerPrompts: om.ministerPrompts || om.minister_prompts || bm.ministerPrompts,
                mission: om.mission || bm.mission,
            };
        });
        const mergedMinisters = { ...BASE.ministers };
        Object.keys(ov.ministers || {}).forEach(k => {
            if (mergedMinisters[k]) {
                mergedMinisters[k] = {
                    ...mergedMinisters[k],
                    essence:    ov.ministers[k].essence    || mergedMinisters[k].essence,
                    comm:       ov.ministers[k].comm       || mergedMinisters[k].comm,
                    annotation: ov.ministers[k].annotation || mergedMinisters[k].annotation,
                };
            }
        });
        const mergedPresidency = { ...BASE.presidency };
        Object.keys(ov.presidency || {}).forEach(k => {
            if (mergedPresidency[k]) {
                mergedPresidency[k] = {
                    ...mergedPresidency[k],
                    essence: ov.presidency[k].essence || mergedPresidency[k].essence,
                };
            }
        });

        return {
            ministries: mergedMinistries,
            ministers:  mergedMinisters,
            presidency: mergedPresidency,
            _active_ministries: ov.active_ministries ?? null,
            _active_presidency: ov.active_presidency ?? null,
            _active_ministers:  ov.active_ministers  ?? null,
        };
    } catch { return BASE; }
}

/** Retourne les agents pour un pays spécifique.
 *  Priorité : country.governanceOverride > localStorage(aria_agents_override) > BASE */
export function getAgentsFor(country) {
    const gov = country?.governanceOverride;
    if (!gov) return getAgents(); // pas d'override pays → comportement global inchangé

    const BASE = loadLang() === 'en' ? AGENTS_RAW_EN : AGENTS_RAW;
    const ov   = gov.agents || {};

    const mergedMinistries = BASE.ministries.map(bm => {
        const om = (ov.ministries || []).find(m => m.id === bm.id);
        if (!om) return bm;
        return { ...bm,
            ministerPrompts: om.ministerPrompts || om.minister_prompts || bm.ministerPrompts,
            mission: om.mission || bm.mission,
        };
    });
    const mergedMinisters = { ...BASE.ministers };
    Object.keys(ov.ministers || {}).forEach(k => {
        if (mergedMinisters[k]) mergedMinisters[k] = { ...mergedMinisters[k],
            essence:    ov.ministers[k].essence    || mergedMinisters[k].essence,
            comm:       ov.ministers[k].comm       || mergedMinisters[k].comm,
            annotation: ov.ministers[k].annotation || mergedMinisters[k].annotation,
        };
    });
    const mergedPresidency = { ...BASE.presidency };
    Object.keys(ov.presidency || {}).forEach(k => {
        if (mergedPresidency[k]) mergedPresidency[k] = { ...mergedPresidency[k],
            essence: ov.presidency[k].essence || mergedPresidency[k].essence,
        };
    });

    return {
        ministries: mergedMinistries,
        ministers:  mergedMinisters,
        presidency: mergedPresidency,
        _active_ministries: gov.active_ministries ?? null,
        _active_presidency: gov.active_presidency ?? null,
        _active_ministers:  gov.active_ministers  ?? null,
    };
}

export function getMinistriesListFor(country) {
    const a = getAgentsFor(country);
    const all = a.ministries || [];
    const active = a._active_ministries;
    return active != null ? all.filter(m => active.includes(m.id)) : all;
}

export function getMinistersMapFor(country) {
    const a = getAgentsFor(country);
    const all = a.ministers || {};
    const active = a._active_ministers;
    return active != null ? Object.fromEntries(Object.entries(all).filter(([k]) => active.includes(k))) : all;
}

export function getPresidencyFor(country) {
    const a = getAgentsFor(country);
    const full = a.presidency || {};
    const active = a._active_presidency;
    return active != null ? Object.fromEntries(Object.entries(full).filter(([k]) => active.includes(k))) : full;
}

/** Retourne la liste des ministères actifs (filtrée si constitution le précise) */
export function getMinistriesList() {
    const agents = getAgents();
    const all = agents.ministries || [];
    const active = agents._active_ministries;
    if (!active) return all;
    return all.filter(m => active.includes(m.id));
}

/** Retourne la map des ministres (incluant custom, filtrée si active_ministers défini) */
export function getMinistersMap() {
    const agents = getAgents();
    const all    = agents.ministers || {};
    const active = agents._active_ministers;
    if (!active) return all;
    return Object.fromEntries(Object.entries(all).filter(([k]) => active.includes(k)));
}

/** Retourne la présidence active */
export function getPresidency() {
    const agents = getAgents();
    const full = agents.presidency || {};
    const active = agents._active_presidency;
    if (!active) return full;
    // Filtre les figures inactives
    return Object.fromEntries(Object.entries(full).filter(([k]) => active.includes(k)));
}

/** Retourne le bloc "destin" (Oracle + Wyrd) depuis governance.json (lang-aware) */
export function getDestin() {
    const BASE = loadLang() === 'en' ? AGENTS_RAW_EN : AGENTS_RAW;
    return BASE.destin || null;
}

// Aliases pour compatibilité (valeurs au moment de l'import — utilisées dans les fallbacks statiques)
// oracle et wyrd sont dans MINISTERS_MAP mais PAS dans MINISTRIES_LIST (pas un ministère)
export const MINISTRIES_LIST = AGENTS_RAW.ministries || [];
export const MINISTERS_MAP   = AGENTS_RAW.ministers  || {};
export const PRESIDENCY      = AGENTS_RAW.presidency  || {};
