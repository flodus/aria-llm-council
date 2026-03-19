// src/features/council/services/voteEngine.js
// ============================================================
// CALCUL DE L'IMPACT DES VOTES
// ============================================================

/**
 * Calcule l'impact d'un vote sur les stats du pays.
 * Vote est TOUJOURS 'oui' ou 'non' — c'est un référendum adopter/abroger.
 * En cas de divergence, 'oui' = option Phare, 'non' = option Boussole.
 *
 * @param {string} vote         — 'oui' | 'non'
 * @param {object} presidence   — résultat runPresidencePhase
 * @param {object} country
 * @returns {{ satisfaction: number, aria_current: number, label: string }}
 */
export function computeVoteImpact(vote, presidence, country) {
    const convergence = presidence.synthese?.convergence;
    const voteType = presidence.synthese?.voteType || 'referendum';
    const ariaCurrent = country.aria_current ?? country.aria_irl ?? 40;

    if (voteType === 'referendum') {
        // Vote OUI/NON classique
        if (vote === 'oui') {
            return {
                satisfaction: +Math.min(5, Math.round((100 - country.satisfaction) * 0.09)),
                aria_current: Math.min(ariaCurrent + 3, 95),
                label: convergence
                ? 'Le peuple adopte la proposition du Conseil. La légitimité du gouvernement ARIA progresse.'
                : `Le peuple tranche : ${presidence.synthese?.position_phare_resume}`,
                chosenOption: 'phare',
                chosenLabel: presidence.synthese?.position_phare_resume,
                voteType: 'referendum',
                vote: 'oui'
            };
        } else { // vote === 'non'
            return {
                satisfaction: convergence
                ? -Math.min(4, Math.round(country.satisfaction * 0.06))
                : +Math.min(3, Math.round((100 - country.satisfaction) * 0.06)),
                aria_current: convergence
                ? Math.max(ariaCurrent - 4, 5)
                : Math.min(ariaCurrent + 1, 95),
                label: convergence
                ? 'Le peuple rejette la proposition. Le Conseil doit reconsidérer sa position.'
                : `Le peuple préfère l'alternative : ${presidence.synthese?.position_boussole_resume}`,
                chosenOption: convergence ? null : 'boussole',
                chosenLabel: convergence ? null : presidence.synthese?.position_boussole_resume,
                voteType: 'referendum',
                vote: 'non'
            };
        }
    } else { // voteType === 'binary'
        // Vote binaire PHARE/BOUSSOLE
        if (vote === 'phare') {
            return {
                satisfaction: +Math.min(4, Math.round((100 - country.satisfaction) * 0.07)),
                aria_current: Math.min(ariaCurrent + 2, 95),
                label: `Le peuple choisit la vision du Phare : ${presidence.synthese?.position_phare_resume}`,
                chosenOption: 'phare',
                chosenLabel: presidence.synthese?.position_phare_resume,
                voteType: 'binary',
                vote: 'phare'
            };
        } else { // vote === 'boussole'
            return {
                satisfaction: +Math.min(3, Math.round((100 - country.satisfaction) * 0.05)),
                aria_current: Math.min(ariaCurrent + 1, 95),
                label: `Le peuple préfère la prudence de la Boussole : ${presidence.synthese?.position_boussole_resume}`,
                chosenOption: 'boussole',
                chosenLabel: presidence.synthese?.position_boussole_resume,
                voteType: 'binary',
                vote: 'boussole'
            };
        }
    }
}
