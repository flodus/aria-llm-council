# ARBORESCENCE — ARIA
_Générée le 2026-03-18 · Exclut : `node_modules/` · `.git/` · `dist/`_

---

```
aria/
│
├── src/                              ← Code source React
│   │
│   ├── features/                    ← Domaines métier
│   │   ├── chronolog/               ← Journal historique des cycles
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── council/                 ← Délibération LLM + constitution
│   │   │   ├── components/
│   │   │   │   └── constitution/
│   │   │   ├── ConstitutionModal.jsx
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── game/                    ← Cycle de jeu global
│   │   │   ├── GameProvider.jsx
│   │   │   ├── gameReducer.js
│   │   │   ├── useGameCycle.js
│   │   │   └── types/
│   │   ├── init/                    ← Écran de démarrage + config
│   │   │   ├── components/
│   │   │   │   ├── api/
│   │   │   │   ├── flows/
│   │   │   │   ├── government/
│   │   │   │   └── screens/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── map/                     ← Carte hexagonale
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── views/
│   │   ├── settings/                ← Page configuration (5 sections)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── world/                   ← Panneau pays + données monde
│   │       ├── components/
│   │       │   └── CountryPanel/
│   │       │       ├── council/
│   │       │       ├── map/
│   │       │       └── timeline/
│   │       ├── contexts/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       └── utils/
│   │
│   ├── shared/                      ← Composants et services transverses
│   │   ├── components/              ← BackButton, ButtonRow, Card, HeaderTitle, SubtitleCard, TitleCard
│   │   ├── constants/
│   │   │   └── llmRegistry.js
│   │   ├── data/
│   │   ├── hooks/
│   │   │   └── useAriaOptions.js
│   │   ├── services/
│   │   │   ├── boardgame/
│   │   │   ├── country/
│   │   │   ├── llm/
│   │   │   │   └── clients/
│   │   │   └── storage.js
│   │   └── theme/
│   │       ├── i18n/
│   │       ├── ariaTheme.js
│   │       └── components.js
│   │
│   ├── App.jsx                       ← Shell principal : routing, topbar, états globaux
│   ├── App.css                       ← Styles globaux (topbar, layout, animations)
│   ├── main.jsx                      ← Point d'entrée Vite
│   ├── index.css                     ← Reset + variables CSS globales
│   │
│   ├── ariaData.js                   ← Données statiques (à supprimer après vérification migration)
│   ├── ariaTheme.js                  ← Design tokens (à supprimer après vérification migration)
│   ├── ariaHexWorld.js               ← Génération monde hexagonal
│   ├── ariaI18n.js                   ← i18n FR/EN : t(), useLocale(), loadLang()
│   │
│   ├── Dashboard_p1.jsx              ← Moteur core : useARIA, callAI, generateWorld, doCycle
│   ├── Dashboard_p2.jsx              ← Rendu SVG carte (chemins organiques)
│   ├── Dashboard_p3.jsx              ← Composant principal : modales, FAB, assemblage
│   │
│   ├── ChronologView.jsx             ← Vue chronolog (onglet CHRONOLOG)
│   ├── HexGrid.jsx                   ← Grille hexagonale (carte)
│   ├── LegitimiteOverlay.jsx         ← Overlay rapport de légitimité
│   ├── LLMCouncil.jsx                ← Vue conseil LLM (onglet LLM COUNCIL)
│   │
│   ├── llmCouncilEngine.js           ← Pipeline délibération 6 phases
│   ├── Settings.jsx                  ← Page configuration complète (5 sections)
│   ├── Settings.css                  ← Styles dédiés Settings
│   ├── InitScreen.jsx                ← À déplacer — voir chantier refactor/init-screen-move
│   │
│   ├── WorldEngine.js                ← Moteur monde (cycles, stats, événements)
│   ├── useChronolog.js               ← Hook chronolog
│   └── llm-registry.json            ← Registre modèles LLM disponibles
│
├── templates/                        ← Données JSON de base (agents, stats)
│   ├── base_agents.json              ← Agents FR : ministres, ministères, présidence
│   ├── base_agents_en.json           ← Agents EN
│   ├── base_stats.json               ← Stats de départ pays FR
│   ├── base_stats_en.json            ← Stats de départ pays EN
│   └── validate_i18n.js             ← Script validation cohérence i18n
│
├── public/                           ← Assets statiques (servis tels quels)
│   ├── vite.svg
│   └── assets/
│       └── audio/
│           ├── ambient_flow.mp3
│           ├── emergency_protocol.mp3
│           ├── Chrono_Echoes.mp3
│           ├── Neon_Bloom.mp3
│           ├── Policy_Loop_Protocol.mp3
│           └── Policy_Loop_Protocol_2.mp3
│
├── doc/                              ← Documentation & médias
│   ├── ARIA_Document_FR.pdf / .docx
│   ├── ARIA_Document_EN.pdf / .docx
│   ├── images/                       ← Captures pour README/ROADMAP
│   │   ├── architecture.png
│   │   ├── aria_chronolog.png
│   │   ├── aria_constitution-ministries-setup.png
│   │   ├── aria_llm-answer-council.png
│   │   ├── aria_map-grid.png
│   │   ├── features.png
│   │   ├── flow.png
│   │   └── initscreen.png
│   ├── screenshots/                  ← Captures récentes UI
│   │   ├── aria_conf-simulation.png
│   │   ├── aria_constitution-*.png
│   │   ├── aria_llm-*.png
│   │   ├── aria_new-game.png
│   │   ├── aria_system-*.png
│   │   ├── aria_vote-result.png
│   │   └── old/                      ← Captures archivées
│   └── artwork_concept/              ← Concepts visuels (IA générative)
│
├── .claude/                          ← Config Claude Code
│   ├── settings.json
│   ├── settings.local.json
│   ├── statusline.sh
│   └── skills/                       ← Skills ADD Framework
│       ├── add-assess/SKILL.md
│       ├── add-decide/SKILL.md
│       ├── add-do/SKILL.md
│       ├── add-flow-check/SKILL.md
│       ├── add-imbalance/SKILL.md
│       ├── add-reflect/SKILL.md
│       └── add-status/SKILL.md
│
├── .github/
│   └── workflows/
│       └── deploy.yml                ← CI/CD GitHub Pages
│
│── Racine — Documentation & config
│
├── CLAUDE.md                         ← Instructions Claude Code + ADD Framework
├── TODO.md                           ← Backlog quotidien (bugs, UX, vision)
├── ROADMAP.md                        ← Vision globale EN (phases V0→V5)
├── ROADMAP.fr.md                     ← Vision globale FR
├── REFLEXIONS.md                     ← Idées de fond (Assess requis avant impl.)
├── ARBORESCENCE.md                   ← Ce fichier
├── CONTRIBUTING.md / .fr.md          ← Guide contribution EN/FR
├── README.md / README.fr.md          ← Documentation principale EN/FR
├── i18n_todolist.md                  ← Suivi traductions manquantes
├── bugs.txt                          ← Notes bugs informelles
│
├── index.html                        ← Entrée HTML Vite
├── vite.config.js                    ← Config Vite (base: '/aria-llm-council/')
├── eslint.config.js                  ← Config ESLint
├── package.json                      ← Dépendances npm
├── server.js                         ← Non utilisé en prod GitHub Pages — base pour V5 multijoueur
│
├── .add-session-history.md           ← Historique réflexions ADD (local)
├── .add-status                       ← État ADD courant (local)
└── .gitignore
```

---

## Légende

| Dossier | Rôle |
|---------|------|
| `src/` | Tout le code — moteur + UI + lib |
| `templates/` | JSON de base agents et stats (FR + EN) |
| `public/` | Assets statiques (audio, icônes) |
| `doc/` | Documentation, screenshots, artwork |
| `.claude/` | Config Claude Code + skills ADD |
| `.github/` | Pipeline CI/CD GitHub Pages |
