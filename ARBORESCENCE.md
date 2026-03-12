# ARBORESCENCE — ARIA
_Générée le 2026-03-12 · Exclut : `node_modules/` · `.git/` · `dist/`_

---

```
aria/
│
├── src/                              ← Code source React
│   ├── main.jsx                      ← Point d'entrée Vite
│   ├── App.jsx                       ← Shell principal : routing, topbar, états globaux
│   ├── App.css                       ← Styles globaux (topbar, layout, animations)
│   ├── index.css                     ← Reset + variables CSS globales
│   │
│   ├── Dashboard_p1.jsx              ← Moteur core : useARIA, callAI, generateWorld, doCycle
│   ├── Dashboard_p2.jsx              ← Rendu SVG carte (chemins organiques)
│   ├── Dashboard_p3.jsx              ← Composant principal : modales, FAB, assemblage
│   │
│   ├── InitScreen.jsx                ← Écran de démarrage : config monde, clés API
│   ├── Settings.jsx                  ← Page configuration complète (5 sections)
│   ├── Settings.css                  ← Styles dédiés Settings
│   ├── CountryPanel.jsx              ← Panneau latéral pays sélectionné
│   ├── ConstitutionModal.jsx         ← Modale constitution par pays
│   ├── LegitimiteOverlay.jsx         ← Overlay rapport de légitimité
│   ├── ChronologView.jsx             ← Vue chronolog (onglet CHRONOLOG)
│   ├── LLMCouncil.jsx                ← Vue conseil LLM (onglet LLM COUNCIL)
│   ├── HexGrid.jsx                   ← Grille hexagonale (carte)
│   │
│   ├── llmCouncilEngine.js           ← Pipeline délibération 6 phases
│   ├── ariaData.js                   ← Données statiques + FALLBACK_RESPONSES
│   ├── ariaTheme.js                  ← Design tokens (FONT, COLOR, getRegimeLabel...)
│   ├── ariaI18n.js                   ← i18n FR/EN : t(), useLocale(), loadLang()
│   ├── ariaHexWorld.js               ← Génération monde hexagonal
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
├── SETTINGS_ARCHITECTURE.md         ← Comparaison AVANT/APRÈS refonte Settings
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

## Notes archi future (V5)

Refactor prévu (`TODO V5`) : réorganiser `src/` en :
- `src/components/` — UI (Dashboard_p3, CountryPanel, ConstitutionModal, Settings…)
- `src/engine/` — moteur (Dashboard_p1, llmCouncilEngine, ariaData, ariaTheme…)
- `src/lib/` — utilitaires (ariaI18n, helpers…)
