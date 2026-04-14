// src/features/council/services/voteEngine.js

// ============================================================
// CALCUL DE L'IMPACT DES VOTES
// ============================================================

/**
 * Calcule l'impact d'un vote sur les stats du pays.
 * Vote est TOUJOURS 'oui' ou 'non' — référendum OUI = adopter, NON = rejeter.
 * La présidence peut compter 0 à 3 présidents — toujours OUI/NON.
 *
 * @param {string} vote         — 'oui' | 'non'
 * @param {object} presidence   — résultat runPresidencePhase
 * @param {object} country
 * @returns {{ satisfaction: number, aria_current: number, label: string }}
 */
export function computeVoteImpact(vote, presidence, country) {
    const convergence  = presidence.synthese?.convergence;
    const ariaCurrent  = country.aria_current ?? country.aria_irl ?? 40;
    const positionOui  = presidence.synthese?.position_majority_resume
                      || presidence.synthese?.position_phare_resume
                      || 'Position majoritaire adoptée.';
    const positionNon  = presidence.synthese?.position_minority_resume
                      || presidence.synthese?.position_boussole_resume
                      || null;

    const isDivergence = convergence === false;

    if (vote === 'oui') {
        return {
            satisfaction: +Math.min(5, Math.round((100 - country.satisfaction) * 0.09)),
            aria_current: Math.min(ariaCurrent + 3, 95),
            label: isDivergence
                ? `Le peuple choisit la voie du Phare ☉ — ${positionOui}`
                : 'Le peuple adopte la proposition du Conseil. La légitimité du gouvernement ARIA progresse.',
            chosenOption: isDivergence ? 'phare' : 'oui',
            chosenLabel: positionOui,
            voteType: 'referendum',
            vote: 'oui',
        };
    } else { // vote === 'non'
        return {
            satisfaction: convergence
                ? -Math.min(4, Math.round(country.satisfaction * 0.06))
                : +Math.min(3, Math.round((100 - country.satisfaction) * 0.06)),
            aria_current: convergence
                ? Math.max(ariaCurrent - 4, 5)
                : Math.min(ariaCurrent + 1, 95),
            label: isDivergence
                ? `Le peuple choisit la voie de la Boussole ☽ — ${positionNon || 'Prudence et consultation.'}`
                : (convergence
                    ? 'Le peuple rejette la proposition. Le Conseil doit reconsidérer sa position.'
                    : positionNon
                        ? `Le peuple préfère la position alternative : ${positionNon}`
                        : 'Le peuple rejette la proposition présidentielle.'),
            chosenOption: isDivergence ? 'boussole' : 'non',
            chosenLabel: positionNon || null,
            voteType: 'referendum',
            vote: 'non',
        };
    }
}
