// src/features/init/hooks/useConstitution.js

import { useState, useEffect } from 'react';
import { loadLang } from '../../../ariaI18n';
import { BASE_AGENTS, BASE_AGENTS_EN } from '../../../../templates';
import { getAgents } from '../../../shared/data/gameData';

function defaultMins() {
    return getAgents().ministries.filter(m => m.base).map(m => m.id);
}

export default function useConstitution(pendingDefs) {
    const [commonAgents, setCommonAgents] = useState(null);
    const [commonMins, setCommonMins] = useState(() => defaultMins());
    const [commonPres, setCommonPres] = useState(['phare', 'boussole']);
    const [commonMinsters, setCommonMinsters] = useState(null);
    const [perGov, setPerGov] = useState(() => (pendingDefs || []).map(() => null));
    const [plLoading, setPlLoading] = useState(true);

    // Chargement initial
    useEffect(() => {
        const load = async () => {
            try {
                const ov = JSON.parse(localStorage.getItem('aria_agents_override') || 'null');
                if (ov) {
                    setCommonAgents(ov);
                    if (ov.active_ministries) setCommonMins(ov.active_ministries);
                    if (ov.active_presidency) setCommonPres(ov.active_presidency);
                    if (ov.active_ministers) setCommonMinsters(ov.active_ministers);
                    setPlLoading(false);
                    return;
                }
                const BASE = loadLang() === 'en' ? BASE_AGENTS_EN : BASE_AGENTS;
                setCommonAgents(JSON.parse(JSON.stringify(BASE)));
            } catch {
                setCommonAgents(null);
            }
            setPlLoading(false);
        };
        load();
    }, []);

    const resetAgents = () => {
        localStorage.removeItem('aria_agents_override');
        setCommonMins(defaultMins());
        setCommonPres(['phare', 'boussole']);
        setCommonMinsters(null);
        setCommonAgents(null);
        setPlLoading(true);
        try {
            const BASE = loadLang() === 'en' ? BASE_AGENTS_EN : BASE_AGENTS;
            setCommonAgents(JSON.parse(JSON.stringify(BASE)));
        } catch {}
        setPlLoading(false);
        setPerGov((pendingDefs || []).map(() => null));
    };

    return {
        commonAgents, setCommonAgents,
        commonMins, setCommonMins,
        commonPres, setCommonPres,
        commonMinsters, setCommonMinsters,
        perGov, setPerGov,
        plLoading, setPlLoading,
        resetAgents
    };
}
