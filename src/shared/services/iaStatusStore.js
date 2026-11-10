// src/shared/services/iaStatusStore.js
// ═══════════════════════════════════════════════════════════════════════════
//  iaStatusStore — état des fournisseurs IA pendant la session
//
//  Chaque fournisseur en échec a une entrée : { raison, code }.
//    raison : 'quota' (429) · 'cle' (400/401/403) · 'modele' (404)
//             · 'panne' (5xx) · 'reseau' (fetch échoue) · 'erreur' (autre)
//  Le statut global dérivé (getIaStatus) reste compatible avec l'existant :
//    null      → tous les fournisseurs utilisés fonctionnent
//    'offline' → au moins un fournisseur injoignable (réseau)
//    'quota'   → au moins un fournisseur en échec (autre raison)
//
//  Chaque changement dispatch l'event 'aria:ia-status' avec { status, etats }.
// ═══════════════════════════════════════════════════════════════════════════

let _etats = {};
let _status = null;

function statutDerive(etats) {
    const valeurs = Object.values(etats);
    if (valeurs.length === 0) return null;
    return valeurs.some(e => e.raison === 'reseau') ? 'offline' : 'quota';
}

function diffuser() {
    _status = statutDerive(_etats);
    window.dispatchEvent(new CustomEvent('aria:ia-status', { detail: { status: _status, etats: _etats } }));
}

/** etat = { raison, code } pour un échec, null pour un succès (le fournisseur refonctionne). */
export function setEtatFournisseur(fournisseur, etat) {
    const avant = JSON.stringify(_etats);
    if (etat) {
        _etats = { ..._etats, [fournisseur]: etat };
    } else {
        const { [fournisseur]: _retire, ...reste } = _etats;
        _etats = reste;
    }
    if (JSON.stringify(_etats) !== avant) diffuser();
}

/** Efface tous les états (ex. après passage en Board Game). */
export function reinitialiserEtats() {
    if (Object.keys(_etats).length === 0) return;
    _etats = {};
    diffuser();
}

export function getEtatsFournisseurs() {
    return _etats;
}

export function getIaStatus() {
    return _status;
}
