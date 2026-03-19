// src/features/init/hooks/useCountryOverride.js

import { useState } from 'react';

export default function useCountryOverride(perGov, setPerGov, commonAgents, commonMins, commonPres, commonMinsters) {
    const [plCountry, setPlCountry] = useState(0);
    const [selectedMinistry, setSelectedMinistry] = useState(null);
    const [selectedMinister, setSelectedMinister] = useState(null);

    const curGov = perGov[plCountry];
    const hasOverride = !!curGov;

    const plAgents = curGov?.agents ?? commonAgents;
    const activeMins = curGov?.activeMins ?? commonMins;
    const activePres = curGov?.activePres ?? commonPres;
    const activeMinsters = curGov?.activeMinsters ?? commonMinsters;

    // Crée l'override à la volée si inexistant, puis applique la mise à jour
    const ensureFork = (p) => {
        if (p[plCountry]) return p[plCountry];
        return {
            agents: JSON.parse(JSON.stringify(commonAgents)),
            activeMins: commonMins,
            activePres: commonPres ? [...commonPres] : [],
            activeMinsters: commonMinsters,
        };
    };

    const setPlAgents = (fn) => {
        setPerGov(p => {
            const a = [...p];
            const fork = ensureFork(p);
            a[plCountry] = { ...fork, agents: typeof fn === 'function' ? fn(fork.agents) : fn };
            return a;
        });
    };

    const setActiveMins = (v) => {
        setPerGov(p => {
            const a = [...p];
            const fork = ensureFork(p);
            a[plCountry] = { ...fork, activeMins: typeof v === 'function' ? v(fork.activeMins) : v };
            return a;
        });
    };

    const setActivePres = (v) => {
        setPerGov(p => {
            const a = [...p];
            const fork = ensureFork(p);
            a[plCountry] = { ...fork, activePres: typeof v === 'function' ? v(fork.activePres) : v };
            return a;
        });
    };

    const setActiveMinsters = (v) => {
        setPerGov(p => {
            const a = [...p];
            const fork = ensureFork(p);
            a[plCountry] = { ...fork, activeMinsters: typeof v === 'function' ? v(fork.activeMinsters) : v };
            return a;
        });
    };

    const forkCountry = () => {
        setPerGov(p => {
            if (p[plCountry]) return p;
            const a = [...p];
            a[plCountry] = {
                agents: JSON.parse(JSON.stringify(commonAgents)),
                  activeMins: commonMins,
                  activePres: [...commonPres],
                  activeMinsters: commonMinsters,
            };
            return a;
        });
    };

    const resetCountryOverride = (i) => {
        setPerGov(p => {
            const a = [...p];
            a[i] = null;
            return a;
        });
        setSelectedMinistry(null);
        setSelectedMinister(null);
    };

    const toggleMinster = (key) => {
        setActiveMinsters(prev => {
            const all = Object.keys(plAgents?.ministers || {});
            const cur = prev || all;
            const on = cur.includes(key);
            const next = on ? cur.filter(k => k !== key) : [...cur, key];
            return next.length === all.length ? null : next;
        });
    };

    return {
        plCountry, setPlCountry,
        plAgents,
        activeMins, setActiveMins,
        activePres, setActivePres,
        activeMinsters, setActiveMinsters,
        hasOverride,
        selectedMinistry, setSelectedMinistry,
        selectedMinister, setSelectedMinister,
        forkCountry,
            resetCountryOverride,
            toggleMinster,
            setPlAgents
    };
}
