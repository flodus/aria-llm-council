# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-04-11_

---

## 🔴 BUGS ACTIFS — À traiter en priorité

_(aucun bug actif connu)_

---

## 🟢 PROCHAIN CHANTIER — Chronolog enrichi (U3)

- [ ] **Vue détaillée par cycle** : pour chacun des 5 derniers cycles, afficher la liste des décisions prises (vote, événement, sécession) avec leur impact chiffré (satisfaction Δ, popularité Δ)
- [ ] **Résumé narratif par cycle** : texte court généré depuis les entrées du chronolog (titre décision + pays + résultat)
- [ ] **Filtres / navigation** : trier par pays · par type d'entrée · pagination si > 5 cycles
- [ ] **Persistance** : vérifier que `aria_chronolog_cycles` est bien sauvegardé/restauré à la reprise de session
- [ ] **Composant ChronologView** : identifier les fichiers à toucher avant de coder

---

## ✅ LIVRÉ cette session (2026-04-11)

- [x] **Chantier qualité XS** : 6 items refactor sur `refactor/dashboard-p1`
  - `storageKeys.js` : inventaire centralisé de toutes les clés localStorage
  - `aria_lang` directs → `loadLang()` (4 fichiers : fallbacks, deliberationEngine, CycleConfirmModal, AIErrorModal)
  - `handleReset()` App.jsx simplifié → délègue à `clearSession()` · `clearSession()` étendue à `aria_chronolog_cycles`
  - `storage.js` vs `options.js` : commentaires rôles + `options.js` branché sur `storage.js` (plus de localStorage direct)
  - `DEFAULT_PROMPTS` : source unique dans `settingsStorage.js` — supprimé de `aiService.js` (-79L)
  - 4 fichiers morts supprimés : `crisisEngine`, `useAriaOptions`, `ariaHexWorld`, `WorldEngineCapsule`

---

## ✅ LIVRÉ cette session (2026-04-10)

- [x] **Fix destin jamais actif** : condition `detectCrisis(question)` sur la phase destin → Oracle/Wyrd ne s'exprimaient jamais (condition doublement impossible). Fix : `destiny_mode === true` suffit, sans vérification crise.
- [x] **G3 — AddCountryModal + SecessionModal** : formulaire 2 étapes · `[Hériter →]` / `[Personnaliser/S'en affranchir →]` ouvre ConstitutionModal du nouveau pays · `addFictionalCountry` retourne `newCountry`
- [x] **Fix CountryPanel tuiles blanches** : classes `cp-act-btn` + `resource-badge` supprimées par erreur lors du ménage App.css — restaurées + `background:transparent` sur la base

---

## ✅ LIVRÉ cette session (2026-04-07)

- [x] **Fix scrollbar horizontale** : `overflowX: hidden` sur `wrap`/`wrapNarrow`/`wrapWide` (shared/theme/components.js) + CustomFlow + RealWorldFlow + PreLaunchScreen (migré vers `wrapWide` — source unique)
- [x] **Fix validation RealWorldFlow** : pays réel obligatoire quel que soit le mode (condition `mode === 'ai'` bypassait la validation en mode démo)
- [x] **App.css ménage printemps** : 1057 → 289 lignes — suppression des classes mortes (ancienne carte SVG, ancienne UI sélection monde, modales/forms/sliders CSS, providers settings, keyframes orphelins, tokens topographie inutilisés)
- [x] **npm audit fix** + git nettoyé (main à jour, branches mergées supprimées)
- [x] **ConstitutionModal refactor** : 900L → hub ~200L + 5 onglets extraits (`TabRegime`, `TabPresidence`, `TabMinisteres`, `TabMinistres`, `TabDestin`) · `lireAgentsOverride`/`ecrireAgentsOverride` dans `shared/utils/storage.js`

---

## 🟡 UX COURT TERME

- [x] **G3 — AddCountryModal + SecessionModal : choix hériter/personnaliser à la création**
  - Formulaire en 2 étapes : step 1 = saisie · step 2 = résumé + choix
  - `[Hériter →]` : comportement existant · `[Personnaliser →]` / `[S'en affranchir →]` : ouvre ConstitutionModal du nouveau pays
  - `addFictionalCountry` retourne désormais `newCountry` (Dashboard_p1)

- [ ] **G4 — Settings : brancher GovernanceForm sur sections Gouvernement+Constitution**
  - GovernanceForm existe déjà · à faire lors du refactor Settings (session dédiée)

- [ ] **T1 — Ajout de provider + modèle custom** : DeepSeek, Mistral, Ollama local…
  - UI : bouton "+ Ajouter un provider" dans Init + Settings · nom, endpoint, clé API, modèle
  - Impacte `callAI()` · `aria_api_keys` · InitScreen · Settings — session dédiée

- [→] **U3 — Chronolog enrichi** : PROCHAIN CHANTIER — voir section dédiée ci-dessus

- [ ] **U7 — Emoji picker pays** : choisir l'emoji à la création (InitScreen) et in-game (ConstitutionModal)

---

## 🟠 FONCTIONNEL MOYEN TERME
_(bloqué sur refonte carte V1)_

- [ ] **N1 — normalizeCountry()** : harmoniser les structures d'objet pays — risque élevé, session dédiée
  - Base : ANALYSE_STRUCTURE_PAYS.md · fichiers : ariaData.js · Dashboard_p1.jsx · InitScreen.jsx

- [ ] **F1 — Minimum 2 pays en mode custom** : actuellement limité à 1 seul pays custom
- [x] **F2 — Bloquer doublons pays réels** : déjà implémenté (disabled + ✗ + repoussé en bas dans RealCountryLocalSection + duplicate status dans RealCountryAISection)
- [ ] **F3 — Settings gouvernement multi-pays** : constitution commune vs par pays

---

## 🔵 VISION / LONG TERME

- [ ] **R1 — Refactor : conserver `dispatchEvent` vote** ⚠️
  - Quand Dashboard_p3 est supprimé, dispatcher :
    `window.dispatchEvent(new CustomEvent('aria:vote-stored', { detail: { cycleNum } }))`
  - Nécessaire pour que `CouncilMinistryQuestions` se re-rende avec la couleur de résultat

- [ ] **V1 — Refonte génération procédurale** : toute la carte est à reconstruire
- [ ] **V2 — Crises aléatoires** : protocole 6.2 (3 ministres validateurs · 3 ministres de sortie)
- [ ] **V3 — Sécession assistée** : délai négociation (3-12 cycles) + traité non-agression
- [~] **V4 — Présidence 0 à 3 présidents** : engine + Init + ConstitutionModal ✓ — reste :
  - Settings.jsx : section présidence ne gère pas encore le 3e président custom
  - Icône tripartite : `PresidencyTiles` n'a pas de tuile "Trinaire" (☉☽★) pour 3 présidents actifs
- [ ] **V5 — Refactor arborescence** : réorganiser src/ en components/ · engine/ · lib/ — session dédiée
- [ ] **V6 — Enrichir les prompts avec la philosophie ADD** — session dédiée
  - Phare → Assess/Decide · Boussole → Do/mémoire · Synthèse → transition Decide→Do
- [ ] **V8 — Optimisation moteur** : profiler re-renders, useCallback/useMemo, appels IA redondants
- [ ] **V9 — i18n couverture complète** : ~300 strings inline restants
  - Settings.jsx (182 ternaires) → lors du refactor Settings (G4)
  - Voir `i18n_todolist.md` pour le détail

---

## ✅ LIVRÉ cette session (2026-03-28)

- [x] **Refactor Settings** : Settings.jsx + Settings.css → `src/features/settings/` · composants dans `components/` · hook `useAccordion.js` · utils `settingsStorage.js` · `index.js` point d'entrée · App.jsx mis à jour
- [x] **Git cleanup** : branches `chore/todo-update` + `refactor/llmcouncil-split` mergées dans main et supprimées local + distant
- [x] **shared/hooks/useAccordion.js** : déplacé de `features/settings/hooks/` → `shared/hooks/` · branché sur Settings (4 sections) + GovernanceForm
- [x] **shared/utils/storage.js** : primitives `lireStorage` / `ecrireStorage` / `supprimerStorage` · settingsStorage.js migré dessus
- [ ] **Dashboard_p1 — refactor futur** : extraire `getOptions/saveOptions` → `src/shared/utils/optionsStorage.js` · extraire les constantes (MINISTERS, MINISTRIES, REGIMES...) → `src/shared/data/` · Dashboard_p1 ne devrait plus être un fichier fourre-tout importé partout

---

## ✅ LIVRÉ cette session (2026-03-27)

- [x] **UX — Lisibilité** : `font-size: 22px` sur `:root` · textes plus grands sans tout retoucher
- [x] **Couleurs — source unique** : `colors.js` étendu (47 tokens) + `applyTheme.js` injecte tout en CSS vars
  — App.css `:root` ne déclare plus de couleurs · un seul endroit à modifier
- [x] **i18n council** : 22 clés ajoutées dans ariaI18n.js · LLMCouncil.jsx + councilStyles.js traduits
- [x] **i18n selectors** : "choisir" → "choose" (RealCountryLocalSection, ChronologView)
- [x] **i18n questions conseil** : CouncilMinistryQuestions charge aria_questions EN selon la langue
- [x] **Bug crash collègue** : `!== null` → `!= null` dans agentsManager.js (3 filtres)
- [x] **Bug getRegimeLabel** : import manquant dans Dashboard_p3.jsx ajouté
- [x] **Double barre dorée** : bordure gold `worldgen-bar` supprimée (cause : `--border` passé bleu→or)
- [x] **App.css** : bloc init-overlay commenté mort supprimé

---

## ✅ LIVRÉ session (2026-03-26)

- [x] **G0 — clearSession()** : conserve déjà `aria_options`, `aria_api_keys`, `aria_lang`, `aria_preferred_models`
- [x] **G1 — PreLaunchScreen** : bloc contextuel sous badge pays actif
- [x] **G2 — ConstitutionModal** : bandeau statut + bouton retour modèle monde
- [x] **B10 — Mode collégial** · **B11 — Mode crise** · **B13 — Bouton Actualiser**
- [x] **Curseurs SVG or** · **RadioPlayer** dans la topbar

---

## 📁 Fichiers actifs
`src/features/settings/` · `Dashboard_p1.jsx` · `App.jsx`
