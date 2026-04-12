# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-04-14_

---

## 🔴 BUGS ACTIFS — À traiter en priorité

_(aucun bug actif connu)_

---

## ✅ LIVRÉ cette session (2026-04-13) — Chronolog polish + fixes

- [x] **Fix styles ChronologView** : `C.dimmed` + `C.teal` absents de `colors.js` → tous les styles basés sur ces tokens étaient invisibles. Ajoutés comme tokens réels.
- [x] **EventRow CountryPanelTimeline redesign** : icônes 1.3rem, cards colorées par type (vote vert/rouge/or, sécession rouge, constitution violet, nouveau pays vert), labels majuscules, séparateurs nets.
- [x] **Overlay délibération** : clic sur un vote avec délibération dans CountryPanelTimeline → overlay plein écran centré avec `EventDetail` complet (question + toutes les phases). `EventDetail` exporté depuis ChronologView.
- [x] **Fix chroniqueur "premier cycle"** : le fallback déterministe écrivait toujours "entre dans son premier cycle" si pas de mémoire précédente, même au cycle 4+. Corrigé : texte "premier cycle" uniquement si `cycleNum === 1`.
- [x] **Fix cycleNum après nouvelle partie sans hard reset** : `clearSession()` ne supprimait pas `aria_cycle_num` ni `aria_chroniqueur`. Ajoutés. + `cycleNumRef` remis à 1 dans `resetChronolog` (Dashboard toujours monté, ref jamais relue depuis localStorage).
- [x] **Masquer tuile 🌐 Monde** dans ChronologView si snapshot contient 1 seul pays (redondant).

---

## ✅ LIVRÉ cette session (2026-04-12) — Chroniqueur + Chronolog phase 2

- [x] **C1 — Chroniqueur institutionnel** : agent mémoire narrative par pays
  - `useChroniqueur.js` : `runChroniqueur()` IA + fallback déterministe
  - Injection dans `buildCountryContext()` (résolution pays > global)
  - Stockage : `aria_chroniqueur = { [countryId]: { memoire, cycle } }`
  - Tout paramétrable partout : global (Settings) → init par pays (PreLaunchScreen/ContextPanel) → in-game (ConstitutionModal/TabRegime)
  - Provider/modèle : `chroniqueur_model` dans SectionConstitution avec les autres ia_roles
  - CycleConfirmModal option B : `onGenerate` async (spinner → narratives → confirm débloqué)
  - Dashboard : `onGenerate` (pushCycleStats + runChroniqueur) séparé de `onConfirm`, protection double-push

- [x] **Visibilité mémoire** :
  - CountryPanelTimeline : bloc 📜 en haut, polling 2s
  - ChronologView vue PAYS : bloc 📜 épinglé au-dessus des cycles quand pays sélectionné
  - LLMCouncil : accordéon 📜 après la question, avant les ministres

- [x] **B7 — cycleHistory persisté au reload** : hydratation depuis `aria_chronolog_cycles` au mount + `cycleNumRef` depuis localStorage

---

## ✅ LIVRÉ session précédente (2026-04-11)

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

- [x] **G4 — Settings : brancher GovernanceForm sur sections Gouvernement+Constitution**

- [x] **T1 — OpenRouter** : proxy OpenAI-compatible couvrant DeepSeek, Mistral, Llama, Grok, GPT, Gemini
  - `aiService.js` : bloc openrouter (endpoint openrouter.ai), KEY_FORMAT sk-or-, KEY_PRIORITY, hasKeys
  - `models.js` : DEFAULT_MODELS.openrouter = 'google/gemini-2.0-flash'
  - `options.js` : api_keys.openrouter dans DEFAULT_OPTIONS
  - `APIKeyInline` : provider openrouter + isValidKeyFormat openai exclut sk-or-
  - `SectionConstitution` : PROVIDERS + anyKey incluent openrouter
  - Ollama local : déféré session dédiée (pas de proxy public)

- [x] **U3 — Chronolog enrichi** : livré (résumé narratif, filtres, pagination, CountryPanel Timeline, délibération complète, B7 fix)

- [x] **C1 — Chroniqueur** : livré — voir section LIVRÉ ci-dessus

- [x] **U7 — Emoji picker pays** : choisir l'emoji à la création (InitScreen) et in-game (ConstitutionModal)

- [x] **D1 — Clarté Destinée vs Mode crise** : descriptions corrigées dans Settings (SectionGouvernanceDefaut) et ConstitutionModal — wording précis, indépendance des deux toggles explicitée

---

## 🟠 FONCTIONNEL MOYEN TERME
_(bloqué sur refonte carte V1)_

- [ ] **N1 — normalizeCountry()** : harmoniser les structures d'objet pays — risque élevé, session dédiée
  - Base : ANALYSE_STRUCTURE_PAYS.md · fichiers : ariaData.js · countryEngine.js · InitScreen.jsx

- [x] **F1 — Multi-pays mode fictif** : DefaultLocalFlow supporte déjà jusqu'à 6 pays (fictifs prédéfinis + créés à la main) — CustomFlow.jsx supprimé (fichier mort)
- [x] **F2 — Bloquer doublons pays réels** : déjà implémenté (disabled + ✗ + repoussé en bas dans RealCountryLocalSection + duplicate status dans RealCountryAISection)
- [x] **F3 — Settings gouvernement multi-pays** : Settings = global · PreLaunchScreen/ContextPanel = init par pays · ConstitutionModal = in-game par pays — architecture 3 niveaux déjà en place
- [x] **D2 — Diplomatie dans CountryPanel Timeline** : event type `diplomacy` dans `useChronolog` · `pushDiplomacy` appelé depuis `handleSetRelation` dans Dashboard · affiché dans CountryPanelTimeline + ChronologView · filtre inclut `paysB.id === countryId`

---

## 🔵 VISION / LONG TERME

- [x] **R1 — `dispatchEvent` vote** : `aria:vote-stored` dispatché dans `Dashboard.jsx:195`, écouté dans `CouncilMinistryQuestions.jsx:80` — survécu au refactor ✓

- [ ] **V1 — Refonte génération procédurale** : toute la carte est à reconstruire
- [ ] **V2 — Crises aléatoires** : protocole 6.2 (3 ministres validateurs · 3 ministres de sortie)
- [ ] **V3 — Sécession assistée** : délai négociation (3-12 cycles) + traité non-agression
- [x] **V4 — Présidence 0 à 3 présidents** : engine + Init + ConstitutionModal + tuile Trinaire + Settings (showTrinaire passé, import mort supprimé)
- [ ] **V5 — Refactor arborescence** : réorganiser src/ en components/ · engine/ · lib/ — session dédiée
- [ ] **V6 — Enrichir les prompts avec la philosophie ADD** — session dédiée
  - Phare → Assess/Decide · Boussole → Do/mémoire · Synthèse → transition Decide→Do
- [ ] **V8 — Optimisation moteur** : profiler re-renders, useCallback/useMemo, appels IA redondants
- [x] **V9 — i18n couverture complète** : migration complète livré (2026-04-12)
  - ~120 nouvelles clés : SECT_CONST_*, SYS_*, APROPOS_*, IFACE_*, CONST_MODAL_*, PRES_*, FORM_*
  - 39 fichiers modifiés — chaînes JSX complexes intentionnellement inline

---

## ✅ LIVRÉ cette session (2026-03-28)

- [x] **Refactor Settings** : Settings.jsx + Settings.css → `src/features/settings/` · composants dans `components/` · hook `useAccordion.js` · utils `settingsStorage.js` · `index.js` point d'entrée · App.jsx mis à jour
- [x] **Git cleanup** : branches `chore/todo-update` + `refactor/llmcouncil-split` mergées dans main et supprimées local + distant
- [x] **shared/hooks/useAccordion.js** : déplacé de `features/settings/hooks/` → `shared/hooks/` · branché sur Settings (4 sections) + GovernanceForm
- [x] **shared/utils/storage.js** : primitives `lireStorage` / `ecrireStorage` / `supprimerStorage` · settingsStorage.js migré dessus
- [x] **Dashboard_p1 — refactor** : extrait en 9 modules dans `src/features/world/` · constantes dans `src/shared/data/` · options dans `src/shared/config/` · fichier racine supprimé

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
`src/features/settings/` · `src/features/world/` · `App.jsx`
