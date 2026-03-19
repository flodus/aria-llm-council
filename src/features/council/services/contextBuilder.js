// src/features/council/services/contextBuilder.js
// ============================================================
// CONSTRUCTION DU CONTEXTE PAYS POUR LES PROMPTS
// ============================================================

import { loadLang } from '../../../ariaI18n';
import { getStats } from '../../../Dashboard_p1';

// ============================================================
// HELPER DE LANGUE
// ============================================================
export function langPrefix() {
    return loadLang() === 'en' ? 'Respond in English.\n' : '';
}

// ============================================================
// CONSTRUCTION DU CONTEXTE
// ============================================================
export function buildCountryContext(country) {
    if (!country) return '';
    const en = loadLang() === 'en';

    // DEBUG — à retirer après validation
    console.log('[ARIA CTX] buildCountryContext:', country?.nom, '| context_mode:', country?.context_mode, '| contextOverride:', country?.contextOverride ? 'OUI' : 'non', '| population:', country?.population, '| satisfaction:', country?.satisfaction);

    // 1. Override libre par pays
    if (country.contextOverride && country.contextOverride.trim()) {
        const lbl = en ? 'Context' : 'Contexte';
        return `[${lbl} — ${country.nom}]\n${country.contextOverride.trim()}`;
    }

    // 2. Mode effectif (pays > global)
    let mode = 'auto';
    try {
        const opts = JSON.parse(localStorage.getItem('aria_options') || '{}');
        mode = opts.gameplay?.context_mode || 'auto';
    } catch {}
    if (country.context_mode) mode = country.context_mode;

    if (mode === 'off') return '';

    const pop  = Math.round((country.population || 0) / 1e6 * 10) / 10;
    const sat  = country.satisfaction ?? 50;
    const aria = country.aria_current ?? country.aria_irl ?? 40;
    const year = country.annee || 2026;

    // Résoudre le nom du régime depuis les données localisées
    const regimeNameLocalized = getStats().regimes[country.regime]?.name || country.regimeName || country.regime;

    // 3. Stats only
    if (mode === 'stats_only') {
        return en
        ? `Country: "${country.nom}" | Regime: ${regimeNameLocalized} | ${pop}M pop. | Approval: ${sat}% | ARIA: ${aria}% | Year: ${year}`
        : `Pays : "${country.nom}" | Régime : ${regimeNameLocalized} | ${pop} M hab. | Satisfaction : ${sat}% | ARIA : ${aria}% | Année : ${year}`;
    }

    // 4. Modes auto / rich
    const leader      = country.leader;
    const leaderName  = typeof leader === 'object' ? leader?.nom  : leader;
    const leaderTitre = typeof leader === 'object' ? leader?.titre : null;

    const stabilityLabel = en
    ? (sat < 30 ? 'very unstable' : sat < 50 ? 'fragile' : sat < 70 ? 'stable' : 'solid')
    : (sat < 30 ? 'très instable' : sat < 50 ? 'fragile' : sat < 70 ? 'correct' : 'solide');

    let ctx = en
    ? `Country: "${country.nom}"
    - Regime: ${regimeNameLocalized}
    - Population: ${pop}M
    - Public approval: ${sat}% (${stabilityLabel})
    - ARIA support: ${aria}%
    - Year: ${year}`
    : `Pays : "${country.nom}"
    - Régime : ${regimeNameLocalized}
    - Population : ${pop} M habitants
    - Satisfaction populaire : ${sat}% (${stabilityLabel})
    - Adhésion ARIA : ${aria}%
    - Année : ${year}`;

    if (leaderName) {
        const leaderLbl = en ? 'Leader' : 'Dirigeant';
        ctx += `\n- ${leaderLbl} : ${leaderTitre ? `${leaderTitre} ` : ''}${leaderName}`;
    }

    const hasDesc = country.description && country.description.trim();
    if (hasDesc) {
        const sitLbl = en ? 'Current situation' : 'Situation actuelle';
        ctx += `\n- ${sitLbl} : ${country.description}`;
    }

    const isReal = hasDesc || leaderName;
    if (mode === 'rich' || isReal) {
        ctx += en
        ? `\n\nIMPORTANT: ${isReal
            ? `This country is real. Your recommendations must account for its history, political culture, institutional constraints and actual geopolitical context in ${year}.`
            : `Fictional country in rich mode — reason from the stats and the internal logic of the "${regimeNameLocalized}" regime.`
        }`
        : `\n\nIMPORTANT : ${isReal
            ? `Ce pays est ancré dans la réalité. Tes recommandations doivent tenir compte de son histoire, sa culture politique, ses contraintes institutionnelles et son contexte géopolitique réel en ${year}.`
            : `Pays fictif en mode enrichi — raisonne à partir des stats et de la logique interne du régime "${regimeNameLocalized}".`
        }`;
    } else {
        ctx += en
        ? `\n\nContext: Fictional country — objective analysis based on the provided statistics.`
        : `\n\nContexte : Pays fictif — approche objective basée sur les statistiques fournies.`;
    }

    return ctx;
}
