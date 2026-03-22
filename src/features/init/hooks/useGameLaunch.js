// src/features/init/hooks/useGameLaunch.js

import { loadOpts } from '../../../shared/services';

export default function useGameLaunch(constitution, iaConfig, countryContext, perGov, onLaunch) {
    const saveAndLaunch = (pendingPreset, pendingDefs) => {
        // Sauvegarde constitution
        if (constitution.commonAgents) {
            localStorage.setItem('aria_agents_override', JSON.stringify({
                ...constitution.commonAgents,
                active_ministries: constitution.commonMins,
                active_presidency: constitution.commonPres,
                active_ministers: constitution.commonMinsters,
            }));
        }

        // Sauvegarde IA config
        const opts = loadOpts();
        opts.ia_mode = iaConfig.ariaMode;
        opts.solo_model = iaConfig.roles.ministre_provider || iaConfig.availProviders[0] || 'claude';

        // ... reste de la logique

        // Merge des overrides
        const defs = (pendingDefs || []).map((d, i) => {
            const gov = perGov[i];
            return {
                ...d,
                context_mode: countryContext.plCtxModes[i] || undefined,
                contextOverride: countryContext.plCtxOvrs[i] || undefined,
                ...(gov ? {
                    governanceOverride: {
                        agents: gov.agents,
                        active_ministries: gov.activeMins,
                        active_presidency: gov.activePres,
                        active_ministers: gov.activeMinsters,
                        destiny_mode: gov.destinyMode || false,
                        active_destin_agents: gov.activeDestinAgents ?? null,
                    }
                } : {}),
            };
        });

        onLaunch(pendingPreset, defs);
    };

    return { saveAndLaunch };
}
