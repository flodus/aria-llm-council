# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-03-11_

---

## 🔴 BUGS ACTIFS — À traiter en priorité

- [ ] **B1 — Ajout pays in-game** : erreur console lors de l'ajout d'un pays depuis le dashboard
  - Ouvrir F12, reproduire l'erreur, capturer le stack trace complet
  - Probablement une mutation d'état dans Dashboard_p3 (handleAddCountry)

- [ ] **B2 — Country Context pipeline** : le mode contexte + override défini dans Init
  n'atteint pas fiablement les prompts de délibération in-game
  - Vérifier que `context_mode` et `contextOverride` survivent à `saveAndLaunch` → `onLaunch` → `startLocal/startWithAI`
  - Vérifier que `buildCountryContext()` dans llmCouncilEngine les lit bien

---

## 🟡 UX COURT TERME

- [ ] **U1 — Icônes régimes** : dans les listes déroulantes Init (création pays) et in-game (settings)
- [ ] **U2 — Harmonisation tuiles** : même style glow ministres/ministères dans les 3 contextes
  (Init PreLaunchScreen · Settings in-game · popup ConstitutionModal in-game)
- [ ] **U3 — Chronolog enrichi** : vue détaillée des 5 derniers cycles
  (satisfaction détaillée, décisions clés, événements notables)

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

---

## 📁 Fichiers actifs
`InitScreen.jsx` · `Dashboard_p1.jsx` · `Dashboard_p3.jsx` · `App.jsx` · `llmCouncilEngine.js`
