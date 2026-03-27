// src/shared/utils/normalizeCountry.js
//
// ─── Point d'entrée unique — structure canonique d'un pays ───────────────────
//
// Appelé en sortie de buildCountryFromLocal() et buildCountryFromAI().
// Garantit que tout objet pays respecte la même forme, peu importe son origine.
//
// Champs normalisés :
//   emoji  — unifié (real_countries.json utilise "flag", locals utilisent "emoji")
//   leader — toujours { nom, titre, trait? } | null (jamais une string)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise le champ leader en objet structuré ou null.
 * Gère les cas : null / string / objet partiel retourné par l'IA.
 */
function normaliserLeader(leader) {
    if (!leader) return null;
    if (typeof leader === 'string') {
        return leader.trim() ? { nom: leader.trim(), titre: '' } : null;
    }
    return {
        nom:   leader.nom   || '',
        titre: leader.titre || '',
        ...(leader.trait ? { trait: leader.trait } : {}),
    };
}

/**
 * normalizeCountry(pays) → pays canonique
 *
 * Ne modifie que les champs incohérents entre sources.
 * Tous les autres champs sont transmis tels quels.
 */
export function normalizeCountry(pays) {
    return {
        ...pays,
        emoji:  pays.emoji || pays.flag || '🌍',
        leader: normaliserLeader(pays.leader),
    };
}
