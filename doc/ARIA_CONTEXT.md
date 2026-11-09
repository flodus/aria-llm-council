# ARIA_CONTEXT — Base de connaissances permanente
Simulation de gouvernance multi-LLM — React 19 + Vite + GitHub Pages
Session courante : Claude.ai (Assess/Decide) + Claude Code terminal (Do)

---

## Stack technique

- React 19 + Vite, SPA client-side, pas de backend
- App.css = source de vérité (tokens + classes globales) · Inline = styles ponctuels non réutilisables · Jamais de CSS modules
- MDI icons (Material Design Icons via CDN)
- Mulberry32 PRNG — generateWorld() 100% déterministe
- localStorage comme couche de persistance principale
- GitHub Pages (déploiement statique)
- server.js — dormant, base pour V4 multijoueur + proxy RSS futur

---

## Architecture src/

_Chemins vérifiés le 2026-11-09. Anciens fichiers `Dashboard_p1/p2/p3` éclatés (V5)._

| Fichier | Rôle |
|---------|------|
| src/App.jsx | Shell global |
| src/features/world/Dashboard.jsx | Assemblage du monde : modales, FAB, boucle de cycle |
| src/features/world/hooks/useARIA.js | Hook central : useARIA, doCycle() |
| src/features/world/services/WorldEngine.js | generateWorld() |
| src/features/world/services/gameEngine.js | Logique de cycle |
| src/features/map/views/ExplorateurMonde.jsx | Globe 3D (monde réel) |
| src/features/map/views/ExplorateurMondeFictif.jsx | Globe hexagonal procédural (monde fictif) |
| src/features/init/InitScreen.jsx | Écran démarrage : config monde, clés API |
| src/features/settings/Settings.jsx | Configuration (5 sections : Gouvernement/Constitution/Simulation/Système/À Propos) |
| src/features/council/components/ConstitutionModal.jsx | Modale constitution par pays (in-game) |
| src/features/world/components/CountryPanel/CountryPanel.jsx | Panneau latéral pays sélectionné |
| src/features/council/services/councilEngine.js | Pipeline délibération (remplace l'ancien `llmCouncilEngine.js`) ⚠️ ne pas modifier sans demande explicite |
| src/shared/services/llm/aiService.js | Appels IA : callAI(), callModel() par provider |
| src/shared/data/ariaData.js | Données statiques + FALLBACK_RESPONSES ⚠️ ne pas modifier sans demande explicite |
| src/shared/theme/ariaTheme.js | Design tokens ⚠️ idem |
| src/ariaI18n.js | i18n FR/EN : t(), useLocale(), loadLang() ⚠️ idem |
| src/shared/services/storageKeys.js | Source de vérité des clés localStorage (`STORAGE_KEYS`) |

---

## Conventions de code

- Commentaires et noms de variables en français
- Styles inline uniquement — jamais de CSS modules
- Pas de TypeScript
- Composants fonctionnels React uniquement
- Hooks : useCallback/useMemo sur les fonctions passées en props

---

## Règles métier critiques

### perGov
```js
perGov[i] = null  // null = hérite constitution commune
// Flux : InitScreen.saveAndLaunch → defs[i].governanceOverride
//        → Dashboard.jsx / useARIA → councilEngine.getAgentsFor(country)
```

### Country Context
- Contrôlé par `aria_options.gameplay.context_mode` ('auto'|'rich'|'stats_only'|'off')
- Hiérarchie : Settings global → Constitution par pays → contextOverride (remplace tout)
- `buildCountryContext()` dans `features/council/services/contextBuilder.js` (ré-exporté via councilEngine.js)

### Providers IA
- Claude, Gemini, Grok, OpenAI : implémentés dans `callModel()` (`shared/services/llm/aiService.js`)
- OpenRouter : proxy OpenAI-compatible (T1), clé `sk-or-`
- Clés debug : préfixe valide + contient -fake/-test/-debug/-demo → statut ⏳, pas d'appel API

### Présidence
- ☉ Phare = La Volonté (président seul)
- ☽ Boussole = L'Âme (co-présidente — égalité absolue, pas vice-présidente)
- ☉☽ Duale = Mode ARIA (Phare + Boussole à égalité)
- ✡ Collégiale = Vote des 12 ministres — Synthèse Constitutionnelle

### Ministères actifs (v2026-03)
justice · economie · defense · sante · education · ecologie · industrie
(Industrie remplace Chance — présent dans `fallbacks.js` et `questionService.js` ; ROADMAP le marque livré)

---

## LocalStorage — clés importantes

| Clé | Contenu |
|-----|---------|
| aria_options | gameplay, ia_mode, roles, governance |
| aria_api_keys | Clés API par provider |
| aria_api_keys_status | Statut test par provider |
| aria_session_world | Seed + dimensions monde |
| aria_session_countries | État pays en cours |
| aria_session_alliances | Alliances en cours |
| aria_preferred_models | Modèle préféré par provider |
| aria_chronolog_cycles | Historique des cycles (Chronolog) |
| aria_chroniqueur | Mémoire narrative par pays (C1) |
| aria_cycle_num | Numéro du cycle en cours |
| aria_agents_override | Overrides des agents (constitution) |

_Liste complète : `src/shared/services/storageKeys.js`. Encore hors de ce fichier : `aria_agents`, `aria_emoji_overrides` (voir TODO, section Dette)._

---

## Fichiers de suivi
- doc/TODO.md — backlog quotidien
- doc/ROADMAP.fr.md — vision globale
- doc/REFLEXIONS.md — idées de fond (Assess requis)
- doc/MIGRATION_NOTES.md — notes de migration ministères / prompts

---

## Décisions d'architecture actées
- server.js conservé — base V4 multijoueur + proxy RSS futur
- Prompts JSON synthèse en français intentionnel — moteur parse un format strict
- Hard Reset inline dans Système — pas en accordéon
- Mode Démo dans footer Simulation — position définitive
- TextArea auto-resize (rows=1, overflow hidden, pas de minHeight)
- Trois niveaux de reset : "Recommencer l'histoire" / "Refonder" / "Rendez-vous en terres inconnues"
- generateWorld() 100% déterministe — soft reset trivial à implémenter
- Règle 0 : CR avant exécution — Claude Code reformule avant de coder

_Mettre à jour après chaque décision d'architecture majeure_
