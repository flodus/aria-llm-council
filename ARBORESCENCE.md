# ARBORESCENCE — ARIA
_Mise à jour le 2026-03-18 · Exclut : `node_modules/` · `.git/` · `dist/`_

---

## Règle world/ vs map/

> **`features/world/`** = logique métier du monde simulé — ce qui *arrive* (moteur cycles, crises, données pays, panneau pays)
> **`features/map/`** = rendu visuel — comment on *dessine* la carte (hexagones SVG, géométrie, assemblage visuel)

Les deux communiquent : `map/HexGrid.jsx` importe les constantes géométriques de `world/WorldEngine.js`,
mais `map/` ne connaît rien de la logique de crise ou de gouvernance.

---

```
aria/
│
├── src/                              ← Code source React
│   │
│   ├── features/                    ← Domaines métier compartimentés
│   │   │
│   │   ├── chronolog/               ← Journal historique des cycles
│   │   │   ├── ChronologView.jsx    ← Vue onglet CHRONOLOG (accordéons cycle → pays → événement)
│   │   │   ├── useChronolog.js      ← Hook : pushEvent, pushCycleStats, resetChronolog
│   │   │   ├── components/          ← (TBD)
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   │
│   │   ├── council/                 ← Délibération LLM + constitution in-game
│   │   │   ├── components/
│   │   │   │   ├── ConstitutionModal.jsx       ← Modale constitution en cours de jeu
│   │   │   │   └── constitution/               ← Sous-composants (listes, détails, formulaires)
│   │   │   ├── contexts/
│   │   │   │   └── CouncilContext.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useConstitutionModal.js
│   │   │   └── services/
│   │   │       ├── constitutionValidator.js
│   │   │       └── deliberationEngine.js
│   │   │
│   │   ├── game/                    ← Cycle de jeu global
│   │   │   ├── GameProvider.jsx
│   │   │   ├── gameReducer.js
│   │   │   └── useGameCycle.js
│   │   │
│   │   ├── init/                    ← Écran de démarrage + configuration monde
│   │   │   ├── InitScreen.jsx       ← Composant racine écran init
│   │   │   ├── components/          ← ~26 composants (CountryConfig, ConstitutionTabs, etc.)
│   │   │   │   ├── api/             ← ProviderAccordion, KeyEntryRow, ModelSelector…
│   │   │   │   ├── flows/           ← DefaultAIFlow, DefaultLocalFlow, CustomFlow + sous-compos
│   │   │   │   ├── government/      ← Hint, ActiveToggle, ColorPicker, EmojiPicker, DeleteButton
│   │   │   │   └── screens/         ← NameScreen, ModeScreen, GeneratingScreen, PresetChoiceScreen
│   │   │   ├── hooks/               ← useConstitution, useCountryOverride, useIAConfig…
│   │   │   └── services/
│   │   │       ├── labels.js        ← getTerrainLabels, getRegimeLabels, getPaysLocaux
│   │   │       └── realCountries.js ← getRealCountries (liste statique offline)
│   │   │
│   │   ├── map/                     ← Rendu visuel de la carte hexagonale
│   │   │   ├── HexGrid.jsx          ← Grille SVG hexagonale (dessin, biomes, couleurs)
│   │   │   ├── ariaHexWorld.js      ← Calculs géométriques hex (aucun import React)
│   │   │   ├── components/          ← (TBD)
│   │   │   ├── hooks/               ← (TBD)
│   │   │   └── views/               ← (TBD)
│   │   │
│   │   ├── settings/                ← Page configuration (5 sections) — TBD
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   │
│   │   └── world/                   ← Logique métier du monde simulé
│   │       ├── LegitimiteOverlay.jsx← Overlay rapport légitimité ARIA (données Think-Tank + sim)
│   │       ├── components/
│   │       │   └── CountryPanel/    ← Panneau latéral pays sélectionné
│   │       │       ├── CountryPanel.jsx + CountryPanel{Header,Tabs,Map,Council,Timeline,Empty}
│   │       │       ├── council/     ← CouncilMinistryList, CouncilFooter, CouncilFreeQuestion…
│   │       │       ├── map/         ← MapARIAStats, MapActions, MapDemographics…
│   │       │       └── timeline/    ← TimelineHeader, TimelineEventList, TimelineEmpty…
│   │       ├── contexts/
│   │       │   └── WorldContext.jsx
│   │       ├── hooks/
│   │       │   └── useCountryPanel.js
│   │       ├── services/
│   │       │   ├── WorldEngine.js   ← Moteur monde : génération hex, biomes, placement pays
│   │       │   └── crisisEngine.js
│   │       └── utils/
│   │           └── countryHelpers.js
│   │
│   ├── shared/                      ← Composants et services transverses (jamais dépendant de features/)
│   │   ├── components/              ← BackButton, ButtonRow, Card, HeaderTitle, SubtitleCard, TitleCard
│   │   ├── constants/
│   │   │   ├── llmRegistry.js       ← Registre providers + modèles LLM (fallback offline)
│   │   │   └── llm-registry.json    ← Données fallback local (source de vérité : Gist distant)
│   │   ├── hooks/
│   │   │   └── useAriaOptions.js
│   │   ├── services/
│   │   │   ├── boardgame/           ← questionService, responseService
│   │   │   ├── country/             ← validation.js : rcMatch, validateCountryWithAI…
│   │   │   ├── llm/                 ← clients/ vides (claude, gemini, openai) — implémentation future
│   │   │   └── storage.js           ← localStorage : loadOpts/saveOpts, loadKeys…
│   │   └── theme/
│   │       ├── ariaTheme.js         ← COLOR, FONT, CARD_STYLE, labelStyle, BTN_*, REGIME_LABELS, TERRAIN_LABELS…
│   │       └── components.js        ← wrap, mCard, tag, wrapNarrow…
│   │
│   ├── App.jsx                      ← Shell principal : routing, topbar, états globaux
│   ├── App.css                      ← Styles globaux (topbar, layout, animations float)
│   ├── main.jsx                     ← Point d'entrée Vite
│   ├── index.css                    ← Reset + variables CSS globales
│   │
│   ├── ariaData.js                  ← Données statiques (REAL_COUNTRIES_DATA, FALLBACK…)  ⚠ legacy
│   ├── ariaI18n.js                  ← i18n FR/EN : t(), useLocale(), loadLang(), saveLang()
│   │
│   ├── Dashboard_p1.jsx             ← Moteur core : useARIA, callAI, generateWorld, doCycle  ⚠ monolithe
│   ├── Dashboard_p2.jsx             ← Assembleur MapSVG (délègue à HexGrid + WorldEngine)
│   ├── Dashboard_p3.jsx             ← Composant Dashboard final : modales, FAB, assemblage  ⚠ monolithe
│   │
│   ├── LLMCouncil.jsx               ← Vue onglet LLM COUNCIL (713 lignes — refactor à planifier)
│   ├── Settings.jsx                 ← Page configuration 5 sections (2055 lignes — gros chantier)
│   ├── Settings.css
│   └── llmCouncilEngine.js          ← Pipeline délibération 6 phases  ⚠ ne pas modifier sans demande
│
├── templates/                        ← Données JSON de base (agents, stats)
│   ├── base_agents.json              ← Agents FR : ministres, ministères, présidence
│   ├── base_agents_en.json
│   ├── base_stats.json
│   ├── base_stats_en.json
│   └── validate_i18n.js
│
├── public/                           ← Assets statiques
│   └── assets/audio/                 ← ambient_flow.mp3, emergency_protocol.mp3…
│
├── doc/                              ← Documentation & médias
│   ├── ARIA_Document_FR/EN.pdf/.docx
│   ├── images/                       ← Captures architecture + features
│   ├── screenshots/                  ← Captures UI récentes
│   └── artwork_concept/
│
├── .claude/                          ← Config Claude Code + skills ADD Framework
├── .github/workflows/deploy.yml      ← CI/CD GitHub Pages
│
├── CLAUDE.md                         ← Instructions Claude Code + ADD Framework
├── ARIA_CONTEXT.md                   ← Base de connaissances technique permanente
├── TODO.md / ROADMAP.md / REFLEXIONS.md
├── ARBORESCENCE.md                   ← Ce fichier
├── README.md / README.fr.md
├── vite.config.js                    ← base: '/aria-llm-council/'
└── server.js                         ← Dormant — base V5 multijoueur + proxy RSS
```

---

## Légende

| Dossier | Rôle |
|---------|------|
| `features/world/` | Logique métier monde : moteur, crises, données pays, panneau UI |
| `features/map/` | Rendu visuel carte : hexagones SVG, géométrie, assemblage graphique |
| `features/council/` | Délibération LLM + modification constitution en cours de jeu |
| `features/init/` | Écran démarrage, configuration monde, clés API |
| `features/chronolog/` | Journal historique des cycles et événements |
| `features/settings/` | Page configuration (TBD — Settings.jsx encore en racine) |
| `shared/` | Transverse — n'importe **jamais** depuis `features/` |
| `templates/` | JSON de base agents et stats (FR + EN) |
| `public/` | Assets statiques (audio, icônes) |
| `doc/` | Documentation, screenshots, artwork |

## Dettes techniques connues

| Fichier | Problème | Priorité |
|---------|----------|----------|
| `Dashboard_p1.jsx` (1736 lignes) | Monolithe — features importent depuis lui | Gros chantier |
| `Dashboard_p3.jsx` (1869 lignes) | Monolithe | Gros chantier |
| `Settings.jsx` (2055 lignes) | Trop gros, devrait aller dans `features/settings/` | Moyen |
| `LLMCouncil.jsx` (713 lignes) | Trop gros, devrait aller dans `features/council/` | Moyen |
| `ariaData.js` | Données statiques legacy couplées au monolithe | Gros chantier |
| `shared/services/llm/clients/` | Clients claude/gemini/openai vides | À implémenter |
