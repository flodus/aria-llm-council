// src/shared/services/iaStatusStore.js
// ═══════════════════════════════════════════════════════════════════════════
//  iaStatusStore — État singleton du statut IA en cours de session
//
//  Status : null | 'offline' | 'quota'
//    null    → IA fonctionnelle
//    offline → réseau coupé (fetch échoue)
//    quota   → quota API épuisé (429 sur tous les providers)
//
//  Dispatch un event 'aria:ia-status' à chaque changement.
//  Les composants React écoutent cet event pour mettre à jour leur état local.
// ═══════════════════════════════════════════════════════════════════════════

let _status = null;

export function setIaStatus(newStatus) {
    if (_status === newStatus) return;
    _status = newStatus;
    window.dispatchEvent(new CustomEvent('aria:ia-status', { detail: { status: newStatus } }));
}

export function getIaStatus() {
    return _status;
}
