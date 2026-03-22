# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-03-22 (session refactor+destin)_

---

## 🔴 BUGS ACTIFS — À traiter en priorité

- [x] **B1 — Ajout pays in-game** : corrigé — `addFictionalCountry` dans `Dashboard_p1.jsx`

- [x] **B5 — Mode IA offline** : `navigator.onLine` + listeners `online`/`offline` dans `NameScreen.jsx` · badge "⚠ HORS LIGNE", toggle masqué, `computedMode` sécurisé dans `InitScreen.jsx`

- [x] **B6 — Corbeille suppression clé API** : `removeEntry` + `onRemoveEntry` implémentés dans `APIKeyInline.jsx`

- [x] **B3 — Accordéons invisibles InitScreen RÉSUMÉ**
  - Cause racine : `overflow:hidden` sur `.aria-accordion` supprime `min-height:auto` des flex children
  - Fix : `flex-shrink:0` sur `.aria-accordion` dans `index.css`

- [x] **B4 — Jauge LLM Council mal affichée** : corrigé dans `src/features/council/` (pas Dashboard_p3)

---

## 🟡 UX COURT TERME

- [x] **U5 — Confirmation nouvelle partie** : modale légère avant ↺ — livré 2026-03-12

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

- [ ] **U8 — Mécanique questions LLM Council**
  - Questions déjà posées : grisées + déplacées en bas de liste + badge "✓ Cycle X" au hover
  - Questions champ libre : ajoutées dans la liste avec badge "✏️ Personnalisée"
    et insérées dans le ministère vers lequel elles ont été redirigées
  - Routing champ libre :
    - Mode IA : l'IA route vers le bon ministère selon le contenu
    - Board Game : matching local via keywords (gemini.json) + correction manuelle possible
    - Dans les deux cas le joueur peut corriger le ministère suggéré
  - Lien : ariaQA.json (questions hardcodées) + chronolog (filtre cycle) + keywords (routing offline)
  - Assess dédié requis — touche LLMCouncil.jsx + llmCouncilEngine.js + chronolog

- [ ] **U7 — Emoji picker pays** : permettre au joueur de choisir l'emoji de son pays
  - À la création (InitScreen) : après génération IA, proposer de changer l'emoji suggéré
  - In-game (ConstitutionModal) : champ emoji modifiable dans l'onglet Gouvernance ou Résumé
  - UI : grille d'emojis thématiques (drapeaux, animaux, symboles) ou champ libre
  - Les pays réels et fictifs sont tous concernés

---

## 🟠 CHANTIERS BOARD GAME

- [x] **N2 — aria_syntheses.json** : synthèses offline Board Game — 7 ministères × 7 régimes × convergence/divergence + présidence
- [x] **N3 — aria_annotations.json** : annotations cercle offline — 7 ministères × 7 régimes × 4 phrases (FR + EN)
- [x] **Pipeline Board Game complet** : tout le contenu éditorial sorti du code → 4 fichiers JSON personnalisables
  (`aria_questions` · `aria_reponses` · `aria_syntheses` · `aria_annotations`)
  Seuls les fallbacks bureaucratiques orphelins restent hardcodés (dernier recours, jamais à changer)

---

## 🟠 FONCTIONNEL MOYEN TERME
_(bloqué sur refonte carte V1)_

- [ ] **N1 — normalizeCountry()** : harmoniser les structures d'objet pays
  - Base : ANALYSE_STRUCTURE_PAYS.md (généré 2026-03-12)
  - Interface cible définie dans le MD section 4
  - Fichiers : ariaData.js · Dashboard_p1.jsx · InitScreen.jsx
  - Patches individuels possibles en attendant (flag→emoji, natalite→tauxNatalite)
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
  - Fichier cible : futur module qui remplacera `handleVote` dans Dashboard_p3.jsx (ligne ~1408)



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

## ✅ LIVRÉ cette session (2026-03-22, session refactor+destin)

- [x] **Refactor source unique de vérité** — branche `refactor/simulation-json-source`
  - Toutes les constantes hardcodées supprimées (REGIME_ARIA_BASE_IRL, REGIME_BLOC, resMinisters, TERRAIN_COLORS, MARITIME, ARCHETYPE_POSTURE, REGIME_LABEL_KEYS, ALL_MINISTRY_IDS, etc.)
  - Chaque donnée lue depuis `governance.json` ou `simulation.json` via `getAgents()` / `getStats()`
  - `simulation.json` enrichi : `aria_irl_base`, `sat_base`, `bloc`, `couleur` par régime · `pop_base` + `maritime` par terrain
  - Industrie actif par défaut (remplace chance) — `useConstitution`, `DEFAULT_OPTIONS`, `ConstitutionModal`
  - `governance.json` (FR+EN) : ministère chance supprimé · industrie ajouté · oracle + wyrd dans ministers · bloc `destin` racine

- [x] **Destinée du Monde — 8 chantiers livrés**
  - C1 : `governance.json` FR+EN — bloc destin, oracle/wyrd, keywords 65 termes, `aria_questions.json` 7 questions crise existentielle
  - C2 : `agentsManager.getDestin()` — lecture lang-aware du bloc destin
  - C3 : `routingEngine.detectCrisis()` — détection synchrone, n'affecte pas le routage standard
  - C4 : `deliberationEngine` — `runDestinPhase()` (oracle+wyrd, AI+fallback local) · `runPresidencePhase(destinVoices)` · `councilEngine` câblage conditionnel `destiny_mode + crisis_mode`
  - C5 : `Settings.jsx` — deux accordions séparés (DESTINÉE DU MONDE · GESTION DE CRISE)
  - C6 : `ConstitutionModal.jsx` — `destiny_mode` + `crisis_mode` (remplace `crisis_ministry`)
  - C7 : `fallbacks.js` — annotation destin + industrie · chance supprimé
  - C7b : `aria_reponses.json` (FR+EN) — oracle + wyrd · 7 régimes × 3 postures
  - C8 : `ariaI18n.js` — GOV_DESTIN/DESTIN_LABEL/DESTIN_HINT · GOV_CRISIS_MODE/LABEL/HINT · GOV_CHANCE/CRISIS supprimés
  - `MIGRATION_NOTES.md` créé — 12 ministerPrompts.crise archétypes préservés pour chantier futur

---

## ✅ LIVRÉ cette session (2026-03-22, suite)

- [x] **B5b — Badge statut IA mid-session** : `iaStatusStore.js` singleton + event `aria:ia-status`
  `callAI` détecte erreurs réseau/quota → badge 🔴/⚠ centré bas de page
  Toast ✅ au retour IA · bouton Tester désactivé si offline seulement

---

## ✅ LIVRÉ cette session (2026-03-22)

- [x] **Routing Board Game enrichi** : questions sans keyword → ministère aléatoire (plus d'Agent Δ fantôme) · garbage/mismatch routé proprement
- [x] **useCouncilSession extrait** : hook dédié sorti de LLMCouncil.jsx
- [x] **aria_reponses.json enrichi** : réponses statu_quo renforcées (textes plus contextualisés par régime)
- [x] **aria_syntheses.json créé + intégré** : 7 ministères × 7 régimes × convergence/divergence + présidence (FR + EN) · `getSyntheseMinistere()` + `getSynthesePresidence()` dans responseService
- [x] **aria_annotations.json créé + intégré** : 7 ministères × 7 régimes × 4 phrases (FR + EN) · `getAnnotationMinistere()` dans responseService · `localAnnotationFallback` branché
- [x] **regime passé partout** : `country.regime` transmis aux 3 fallbacks (ministère, synthèse, annotation)

---

## ✅ LIVRÉ cette session (2026-03-13)

- [x] **Panel carte EmptyPanel** : liste pays cliquables quand aucun pays sélectionné (CountryPanel.jsx)
- [x] **Bug React "Expected static flag"** : `SaveBadge` — `useLocale()` appelé après `return null` → déplacé avant (Settings.jsx)
- [x] **RestCountries noms français** : Pass 1b via `/translation/` pour Allemagne, Espagne, Russie… (InitScreen.jsx)
- [x] **B3 — Accordéons invisibles** : `flex-shrink:0` sur `.aria-accordion` (index.css)
- [x] **Console temporaire supprimée** : `[ARIA MAP]` dans Dashboard_p3.jsx
- [x] **Mode IA — 0 clé** : seul Board Game disponible + ariaMode forcé à `none` (InitScreen.jsx)
- [x] **Mode IA — 1 clé** : Solo + Board Game uniquement, cartouche provider + boutons modèle (InitScreen.jsx + Settings.jsx)
- [x] **ariaMode init** : force `solo` si 1 provider et mode sauvegardé est `aria`/`custom` (InitScreen.jsx)

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
- [x] **U5 — Confirmation nouvelle partie** : modale ↺ dans App.jsx
- [x] **InitScreen récap — grille ministères supprimée** : grille 7 cartes non lisible retirée
- [x] **Board Game fusionné dans MODE IA** : suppression `mode_board_game` séparé,
  accordéon déplacé sous Contexte délibérations, option `🎲 Board Game` dans sélecteur MODE IA
- [x] **Accordéon MODE IA 64vh** : conteneur scrollable agrandi
- [x] **Card NOM DU MONDE unifiée** : CLÉS API + CONTINUER fusionnés dans la même card
- [x] **Accordéons providers InitScreen** : APIKeyInline — providers en accordéons (▸/▾, icône statut ✅/❌/⏳/🔑)
- [x] **Badge ✅ Settings CLÉS API & MODÈLES** : coche verte dans l'en-tête si au moins une clé valide

---

## 📁 Fichiers actifs
`InitScreen.jsx` · `Dashboard_p1.jsx` · `App.jsx` · `Settings.jsx`
