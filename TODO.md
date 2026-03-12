# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-03-12_

---

## 🔴 BUGS ACTIFS — À traiter en priorité

- [ ] **B1 — Ajout pays in-game** : erreur console lors de l'ajout d'un pays depuis le dashboard
  - Ouvrir F12, reproduire l'erreur, capturer le stack trace complet
  - Probablement une mutation d'état dans Dashboard_p3 (handleAddCountry)

---

## 🟡 UX COURT TERME

- [ ] **T1 — Multi-clés par provider** : permettre plusieurs clés API par provider (Init + Settings)
  - Structure cible `aria_api_keys` : `{ claude: [{key, model, default:true}, {key, model}], gemini: [...] }`
  - UI : bouton "+ Ajouter une clé" par provider, select modèle par clé, étoile clé par défaut, bouton supprimer
  - Impacte : `aria_api_keys` localStorage · `callAI()` dans Dashboard_p1.jsx · InitScreen.jsx · Settings.jsx
  - _À faire après refonte Settings terminée_

- [ ] **U1 — Icônes régimes** : dans les listes déroulantes Init (création pays) et in-game (settings)
- [ ] **U2 — Harmonisation tuiles** : même style glow ministres/ministères dans les 3 contextes
  (Init PreLaunchScreen · Settings in-game · popup ConstitutionModal in-game)
- [ ] **U3 — Chronolog enrichi** : vue détaillée des 5 derniers cycles
  (satisfaction détaillée, décisions clés, événements notables)
- [ ] **U4 — Contexte pays dans la Constitution** : déplacer/dupliquer `context_mode` et `contextOverride`
  depuis les options système (Settings) vers la ConstitutionModal par pays
  — logique : le contexte de délibération est une propriété du pays, pas un réglage global

---

## 🟠 FONCTIONNEL MOYEN TERME
_(bloqué sur refonte carte V1)_

- [ ] **F1 — Minimum 2 pays en mode custom** : actuellement limité à 1 seul pays custom
- [ ] **F2 — Bloquer doublons pays réels** : griser un pays réel déjà sélectionné dans un autre slot
- [ ] **F3 — Settings gouvernement multi-pays** : repenser l'écran Settings in-game
  avec gestion constitution commune vs par pays

---

## 🔵 VISION / LONG TERME

- [ ] **V1 — Refonte génération procédurale** : toute la carte est à reconstruire
  (architecture nouvelle définie par l'architecte — moteur conseil agnostique, pas impacté)
- [ ] **V2 — Crises aléatoires** : protocole 6.2 du document ARIA
  (3 ministres validateurs · 3 ministres de sortie · critères systémiques)
- [ ] **V3 — Sécession assistée** : délai négociation (3-12 cycles) + traité non-agression
- [ ] **V4 — Présidence 1 à 3 présidents** : config Init/Settings, mode collégial
- [ ] **V5 — Refactor arborescence** : src/components/ · src/engine/ · src/lib/
  (session dédiée, aucun risque fonctionnel mais beaucoup d'imports à mettre à jour)
- [ ] **V6 — Enrichir les prompts de délibération avec la philosophie ADD** :
  - Phare → posture Assess/Decide (vision, exploration des possibilités)
  - Boussole → posture Do/mémoire (ancrage, ce qui a été décidé)
  - Synthèse présidentielle → transition Decide→Do (transformer le débat en décision)
  - Concerne : Settings.jsx (prompts éditables) + llmCouncilEngine.js (synthèses)
  - Nécessite un Assess complet avant implémentation

---

## ✅ LIVRÉ cette session (2026-03-12)

- [x] **B2 — Country Context pipeline** : `context_mode` et `contextOverride` perdus à l'init
  - `startLocal` ne transmettait pas ces champs — corrigé
  - `startWithAI` omettait `contextOverride` dans les deux branches — corrigé
- [x] **Toast manquant** : composant `Toast` perdu lors d'une refactorisation — restauré
- [x] **Flèches navigation pays** : réapplication du commit `dcb04a7` dans App.jsx
- [x] **context_mode hint dynamique** : "Suit le réglage mondial (actuellement : 🤖 Auto)"
  dans InitScreen (ContextPanel) et ConstitutionModal
- [x] **Reset context_mode à 'auto'** : `clearSession()` réinitialisait les sessions
  mais laissait `aria_options.gameplay.context_mode` à sa valeur précédente
- [x] **Accordéon CONTEXTE DÉLIBÉRATIONS remonté** en tête du résumé Init (avant PRÉSIDENCE ACTIVE)
- [x] **Récap création monde** : affichage du contexte délibérations (icône + label + override) par pays

---

## 📁 Fichiers actifs
`InitScreen.jsx` · `Dashboard_p1.jsx` · `Dashboard_p3.jsx` · `App.jsx` · `llmCouncilEngine.js` · `ConstitutionModal.jsx`
