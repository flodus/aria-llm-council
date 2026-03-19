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

    const setPlAgents = (fn) => {
        if (hasOverride) {
            setPerGov(p => {
                const a = [...p];
                a[plCountry] = { ...a[plCountry], agents: typeof fn === 'function' ? fn(a[plCountry].agents) : fn };
                return a;
            });
        } else {
            // setCommonAgents(fn); // sera géré par le parent
        }
    };

    const setActiveMins = (v) => {
        if (hasOverride) {
            setPerGov(p => {
                const a = [...p];
                a[plCountry] = { ...a[plCountry], activeMins: typeof v === 'function' ? v(a[plCountry].activeMins) : v };
                return a;
            });
        } else {
            // setCommonMins(v);
        }
    };

    const setActivePres = (v) => {
        if (hasOverride) {
            setPerGov(p => {
                const a = [...p];
                a[plCountry] = { ...a[plCountry], activePres: typeof v === 'function' ? v(a[plCountry].activePres) : v };
                return a;
            });
        } else {
            // setCommonPres(v);
        }
    };

    const setActiveMinsters = (v) => {
        if (hasOverride) {
            setPerGov(p => {
                const a = [...p];
                a[plCountry] = { ...a[plCountry], activeMinsters: typeof v === 'function' ? v(a[plCountry].activeMinsters) : v };
                return a;
            });
        } else {
            // setCommonMinsters(v);
        }
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
