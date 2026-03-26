# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-03-26_

---

## 🔴 BUGS ACTIFS — À traiter en priorité

_(aucun bug actif connu — phase B1 terminée)_


  - `CouncilCitizenQuestion` : le `ministryId` doit voyager jusqu'au pipeline, bypasser le routing sémantique
  - Touche `llmCouncilEngine.js` — spec validée avant toute modif

---

## 🟡 UX COURT TERME

- [ ] **G0 — clearSession() : vérifier qu'elle conserve `aria_options`, clés API, langue, modèles**
  - `aria_options` · `aria_api_keys` · `aria_lang` · `aria_preferred_models` ne doivent PAS être effacées
  - Seules les clés session (pays, alliances, cycles, chronolog) doivent être effacées

- [ ] **G1 — PreLaunchScreen : bloc contextuel ancré sous badge pays actif**
  - Lambda : `⚙️ SUIT LE MODÈLE MONDE` + résumé aria_options + `[Personnaliser ce pays →]`
  - Custom : `✦ CONSTITUTION PROPRE` (ambre) + résumé governanceOverride + `[Personnaliser ce pays →]`
  - `[Personnaliser →]` ouvre ConstitutionModal du pays sélectionné

- [ ] **G2 — ConstitutionModal : bandeau lambda/custom + bouton retour modèle monde**
  - En tête : `✦ CONSTITUTION PROPRE` (ambre) si override, `⚙️ SUIT LE MODÈLE MONDE` (gris) sinon
  - En pied (custom uniquement) : `[Revenir au modèle monde]` → confirmation + `governanceOverride = null`

- [ ] **G3 — AddCountryModal + SecessionModal : choix hériter/personnaliser à la création**
  - Nouveau pays : résumé aria_options + `[Hériter →]` / `[Personnaliser →]`
  - Sécession : résumé constitution parent + `[Hériter du parent →]` / `[S'en affranchir →]`
  - `[Personnaliser/S'en affranchir →]` : ferme modale → ouvre ConstitutionModal du nouveau pays

- [ ] **G4 — Settings : brancher GovernanceForm (context='settings') sur sections Gouvernement+Constitution**
  - GovernanceForm existe déjà — remplacer les sections inline dans Settings.jsx

- [ ] **T1 — Ajout de provider + modèle custom** : permettre d'ajouter des providers non listés (ex: DeepSeek, Mistral, Ollama local…)
  - UI : bouton "+ Ajouter un provider" dans Init + Settings · champs : nom, endpoint, clé API, modèle par défaut
  - Impacte : `aria_api_keys` localStorage · `callAI()` dans Dashboard_p1.jsx · InitScreen.jsx · Settings.jsx
  - _Assess dédié requis — impacts sur callAI() et le sélecteur de provider_

- [ ] **U3 — Chronolog enrichi** : vue détaillée des 5 derniers cycles
  (satisfaction détaillée, décisions clés, événements notables)

- [ ] **U7 — Emoji picker pays** : permettre au joueur de choisir l'emoji de son pays
  - À la création (InitScreen) : après génération IA, proposer de changer l'emoji suggéré
  - In-game (ConstitutionModal) : champ emoji modifiable dans l'onglet Gouvernance ou Résumé
  - UI : grille d'emojis thématiques (drapeaux, animaux, symboles) ou champ libre

---

## 🟠 FONCTIONNEL MOYEN TERME
_(bloqué sur refonte carte V1)_

- [ ] **N1 — normalizeCountry()** : harmoniser les structures d'objet pays
  - Base : ANALYSE_STRUCTURE_PAYS.md (généré 2026-03-12)
  - Interface cible définie dans le MD section 4
  - Fichiers : ariaData.js · Dashboard_p1.jsx · InitScreen.jsx
  - Session dédiée — risque élevé, Assess complet requis

- [ ] **F1 — Minimum 2 pays en mode custom** : actuellement limité à 1 seul pays custom
- [ ] **F2 — Bloquer doublons pays réels** : griser un pays réel déjà sélectionné dans un autre slot
- [ ] **F3 — Settings gouvernement multi-pays** : repenser l'écran Settings in-game
  avec gestion constitution commune vs par pays

---

## 🔵 VISION / LONG TERME

- [ ] **R1 — Refactor : conserver `dispatchEvent` vote** ⚠️
  - Quand Dashboard_p3 est supprimé, le nouveau gestionnaire de vote doit dispatcher :
    `window.dispatchEvent(new CustomEvent('aria:vote-stored', { detail: { cycleNum } }))`
  - Nécessaire pour que `CouncilMinistryQuestions` se re-rende avec la couleur de résultat

- [ ] **V1 — Refonte génération procédurale** : toute la carte est à reconstruire
  (architecture nouvelle définie par l'architecte — moteur conseil agnostique, pas impacté)
- [ ] **V2 — Crises aléatoires** : protocole 6.2 du document ARIA
  (3 ministres validateurs · 3 ministres de sortie · critères systémiques)
- [ ] **V3 — Sécession assistée** : délai négociation (3-12 cycles) + traité non-agression
- [ ] **V4 — Présidence 1 à 3 présidents** : config Init/Settings, mode collégial
- [ ] **V5 — Refactor arborescence** : réorganiser src/ en 3 dossiers
  - `src/components/` → UI (Dashboard_p3, CountryPanel, ConstitutionModal, Settings...)
  - `src/engine/`     → moteur (Dashboard_p1, llmCouncilEngine, ariaData, ariaTheme...)
  - `src/lib/`        → utilitaires (ariaI18n, helpers, types...)
  - Session dédiée — beaucoup d'imports à mettre à jour, aucun risque fonctionnel
- [ ] **V6 — Enrichir les prompts de délibération avec la philosophie ADD** :
  - Phare → posture Assess/Decide (vision, exploration des possibilités)
  - Boussole → posture Do/mémoire (ancrage, ce qui a été décidé)
  - Synthèse présidentielle → transition Decide→Do (transformer le débat en décision)
  - Concerne : Settings.jsx (prompts éditables) + llmCouncilEngine.js (synthèses)
  - Nécessite un Assess complet avant implémentation

- [ ] **V9 — i18n couverture complète** : audit + centralisation des chaînes inline `isEn ? '...' : '...'`
  vers `ariaI18n.js`, traduction FR/EN de toute l'UI, sync `base_agents_en.json`
  — concerne Settings.jsx, Dashboard_p3.jsx, InitScreen.jsx, ConstitutionModal.jsx, LLMCouncil.jsx, CountryPanel.jsx
  — `ariaQA_en.json` quand ariaQA sera créé · Voir `i18n_todolist.md` pour le détail (~300 strings + prompts IA)

- [ ] **V8 — Optimisation moteur** : session Assess dédiée
  - Profiler les re-renders React
  - Vérifier useCallback/useMemo manquants
  - Identifier les appels IA redondants
  - Ne pas implémenter sans Assess complet

---

## ✅ LIVRÉ cette session (2026-03-26)

- [x] **B10 — Mode collégial** : `|| null` → `?? null` dans agentsManager.js + `active !== null` dans les 3 filtres
  — le mode collégial se déclenche correctement quand `active_presidency = []`
- [x] **B11 — Mode crise** : `runCrisisPhase()` — tous les ministères délibèrent en parallèle, skip cercle + présidence
  — `detectCrisis()` + `crisis_mode !== false` → détournement du pipeline normal dans councilEngine + useCouncilSession
- [x] **Mode collégial — UI** : label `✦ SYNTHÈSE PRÉSIDENTIELLE` → `✡ SYNTHÈSE CONSTITUTIONNELLE` en mode collégial
- [x] **Mode collégial — fallback referendum** : `question_referendum` ne recopie plus la question posée
- [x] **B7 — `setCurrentCycleQuestion`** : déjà corrigé en `setCurrentCycleQuestions({})` (Dashboard_p3.jsx)
- [x] **B8 — `getTerrainLabel`** : déjà exporté depuis `src/shared/data/worldLabels.js` + importé dans Dashboard_p3
- [x] **B13 — Bouton Actualiser (💡)** : corrigé (CouncilCitizenQuestion + CouncilFreeQuestion)
- [x] **B9 — Routing ministère invalide** : déjà corrigé lors du refactor useCouncilSession
  — `submitQuestion` court-circuite le routing si `ministryId` fourni (ligne 106) · `routeQuestion` retourne immédiatement si `forceMinistryId` truthy · `CouncilFreeQuestion` passe `null` pour déclencher le routing sémantique normal
- [x] **Synthèses collégiales JSON** : `aria_syntheses.json` (FR+EN) — section `collegial` corrigée
  (typo `theocracie→theocratie`, régimes fallbacks retirés, `_meta.fallback_order` corrigé)
  + `getSyntheseCollegial()` dans responseService.js + câblage dans `_runCollegialPhase`
- [x] **CONTRIBUTING.md + CONTRIBUTING.fr.md** : schémas JSON complets des 10 fichiers templates
  (corrections : `ministers` = 1..n, `base: true` = convention doc non enforced, 7 régimes primaires + 5 fallbacks)
- [x] **doc/ réorganisé** : tous les .md de suivi déplacés en `doc/` · CLAUDE.md mis à jour
- [x] **Curseurs SVG or** : `src/shared/utils/curseurs.js` (4 curseurs #c6a24c) intégrés dans App.jsx
  — toggle dans Settings > INTERFACE (`aria_options.interface.custom_cursors`)
- [x] **RadioPlayer** : `src/shared/components/RadioPlayer.jsx` dans la topbar (entre cycle et icônes)
  — 5 stations par défaut · localStorage · ajout URL + fichier local · toggle dans Settings > INTERFACE

---

## ✅ LIVRÉ session (2026-03-22, suite)

- [x] **B12 — Mode destin désactivé** : `destiny_mode` hérite de `defaultGovernance` pour les pays lambda
- [x] **B14 — Settings > Ministères** : grille ministres par ministère dans l'accordéon Settings
- [x] **B15 — ConstitutionModal > Présidence** : boutons "Configurer" ré-exposent PresidentDetail par type
- [x] **B5b — Badge statut IA mid-session** : `iaStatusStore.js` singleton + event `aria:ia-status`
  `callAI` détecte erreurs réseau/quota → badge 🔴/⚠ centré bas de page
  Toast ✅ au retour IA · bouton Tester désactivé si offline seulement

---

## ✅ LIVRÉ session (2026-03-22, refactor+destin)

- [x] **Refactor source unique de vérité** — branche `refactor/simulation-json-source`
- [x] **Destinée du Monde — 8 chantiers livrés** (Oracle + Wyrd + détection crise + runDestinPhase + UI)

---

## 📁 Fichiers actifs
`InitScreen.jsx` · `Dashboard_p1.jsx` · `App.jsx` · `Settings.jsx`
