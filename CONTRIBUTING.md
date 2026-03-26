# Contributing to ARIA

**[🇫🇷 Version française](CONTRIBUTING.fr.md)**

ARIA is a governance simulation powered by multi-LLM deliberation. Contributing means editing JSON files (no server needed), improving the React interface, or adding new content. This document explains exactly how the project is structured and what each file expects.

---

## Quick Setup

```bash
git clone https://github.com/flodus/aria-llm-council.git
cd aria-llm-council
npm install
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint check
```

No backend. No database. Everything runs in the browser — content lives in JSON files under `templates/`, configuration in `localStorage`.

---

## Repository Structure

```
aria/
├── src/
│   ├── features/           # Feature modules (council, init, settings...)
│   │   └── council/
│   │       ├── components/ # React UI components
│   │       ├── hooks/      # useCouncilSession, useConstitutionModal
│   │       └── services/   # deliberationEngine, routingEngine, agentsManager...
│   ├── shared/             # Reusable components + data + theme
│   └── Dashboard_p1.jsx    # Core engine: callAI(), generateWorld(), doCycle()
├── templates/
│   └── languages/
│       ├── fr/             # French content (canonical)
│       └── en/             # English content (mirror)
└── doc/                    # Internal documentation
```

All editorial content lives in `templates/languages/{lang}/`. The engine reads these files at runtime — editing a JSON is enough to change what ministers say, which questions appear, or how countries are simulated.

---

## Contribution Areas

| Area | Files to edit | Complexity |
|------|--------------|------------|
| Minister dialogue & postures | `aria_reponses.json` | Low |
| Deliberation questions | `aria_questions.json` | Low |
| Council syntheses | `aria_syntheses.json` | Low |
| Circle annotations | `aria_annotations.json` | Low |
| Events (revolts, crises...) | `local_events.json` | Low |
| Countries (fictional) | `local_countries.json` | Low |
| Countries (real-world) | `real_countries.json` | Medium |
| Governance agents & prompts | `governance.json` | Medium |
| React UI | `src/features/` | High |
| Simulation engine | `src/Dashboard_p1.jsx` | High |

---

## Git Workflow

```bash
# Start a branch (never commit to main)
git checkout main && git pull origin main
git checkout -b type/short-name       # feat/new-country, fix/vote-bug, content/minister-dialogue
git push -u origin type/short-name

# Commit
git add <specific files>
git commit -m "type: short description"
git push

# Open a PR on GitHub — maintainer merges
```

Branch types: `feat/`, `fix/`, `content/`, `refactor/`, `docs/`

---

## JSON Schemas

All files have FR and EN mirrors with identical structure. Edit both, or open an issue if you only speak one language.

---

### `governance.json`

Agent definitions: ministers, ministries, presidential figures, and the Destiny module.

```json
{
  "presidency": {
    "phare": {
      "name": "Le Phare",
      "symbol": "☉",
      "subtitle": "Sun · Will",
      "essence": "System prompt injected into the LLM for this figure",
      "role_long": "Extended description shown in the UI",
      "weight": 1
    },
    "boussole": { "...same structure..." }
  },

  "ministers": {
    "initiateur": {
      "name": "L'Initiateur",
      "sign": "Bélier",
      "emoji": "♈",
      "color": "#E05252",
      "weight": 1,
      "comm": "Communication style injected into every prompt",
      "essence": "Core personality — injected as system context",
      "annotation": "Prompt used during the Circle phase",
      "posture_defaut": "radical"
    }
  },

  "ministries": [
    {
      "id": "justice",
      "name": "Justice et Vérité",
      "emoji": "⚖️",
      "signs": ["Vierge", "Balance"],
      "color": "#A78BFA",
      "mission": "Description used in UI and context",
      "weight": 1,
      "ministers": ["arbitre", "enqueteur"],
      "ministerPrompts": {
        "arbitre":   "Specific prompt override for this minister in this ministry",
        "enqueteur": "..."
      },
      "keywords": ["loi", "droit", "justice", "tribunal"],
      "base": true
    }
  ],

  "destin": {
    "id": "destin",
    "name": "Destinée du Monde",
    "emoji": "👁️",
    "color": "#B87A00",
    "mission": "...",
    "agents": ["oracle", "wyrd"],
    "ministerPrompts": {
      "normal": { "oracle": "...", "wyrd": "..." },
      "crise":  { "oracle": "...", "wyrd": "..." }
    },
    "keywords": ["extraterrestre", "invasion", "catastrophe cosmique"]
  }
}
```

**Constraints:**
- `ministers` array in a ministry contains 1 or more existing minister IDs
- `posture_defaut` must be one of: `prudent` · `radical` · `statu_quo`
- `keywords` are used for routing — more keywords = higher priority for this ministry
- `base: true` flags a ministry as active by default

**Valid minister IDs:** `initiateur` · `gardien` · `communicant` · `protecteur` · `ambassadeur` · `analyste` · `arbitre` · `enqueteur` · `guide` · `stratege` · `inventeur` · `guerisseur` · `oracle` · `wyrd`

**Active ministries:** `justice` · `economie` · `defense` · `sante` · `education` · `ecologie` · `industrie`

---

### `aria_questions.json`

Questions shown to the player in Board Game mode and used as suggestions.

```json
{
  "_meta": {
    "version": "2.0",
    "ministeres_aria": ["justice", "economie", "defense", "sante", "education", "ecologie", "industrie", "destin"],
    "pool_categories": ["quotidien", "crise_et_peur", "ideologique", "anomalie_et_scifi"]
  },

  "par_ministere": {
    "justice": {
      "questions": [
        "Should AI be used to assist judicial decisions?",
        "..."
      ]
    }
  },

  "pool_transversal": {
    "quotidien": {
      "description": "Everyday citizen concerns",
      "questions": ["Bread prices jumped 15% this week. What response?", "..."]
    },
    "crise_et_peur":    { "description": "...", "questions": ["..."] },
    "ideologique":      { "description": "...", "questions": ["..."] },
    "anomalie_et_scifi": { "description": "...", "questions": ["..."] }
  }
}
```

---

### `aria_reponses.json`

Offline fallback responses for every minister, by regime and posture. This is the Board Game mode's content library.

```json
{
  "_meta": { "version": "2.0" },

  "ministers": {
    "initiateur": {
      "reponses": {
        "democratie_liberale": {
          "prudent":   ["response 1", "response 2", "response 3"],
          "radical":   ["response 1", "..."],
          "statu_quo": ["response 1", "..."]
        },
        "junte_militaire": { "...same structure..." }
      }
    }
  },

  "presidence": {
    "phare":    { "styles": { "normal": ["..."], "crise": ["..."] } },
    "boussole": { "styles": { "normal": ["..."], "crise": ["..."] } }
  },

  "garbage": {
    "messages": ["Unrecognized question. Please rephrase.", "..."]
  }
}
```

**Valid regimes:** `democratie_liberale` · `republique_federale` · `monarchie_constitutionnelle` · `technocratie_ia` · `junte_militaire` · `oligarchie` · `theocratie` · `monarchie_absolue` · `communisme` · `nationalisme_autoritaire` · `democratie_directe`

**Valid postures:** `prudent` · `radical` · `statu_quo`

Recommendation: at least 3 responses per regime×posture combination to avoid repetition.

---

### `aria_syntheses.json`

Ministerial synthesis texts used when AI is unavailable (Board Game mode).

```json
{
  "_meta": { "version": "2.0" },

  "ministeres": {
    "justice": {
      "democratie_liberale": {
        "convergence": [
          "The Council agrees: a balanced reform is retained...",
          "..."
        ],
        "divergence": [
          "Persistent disagreements pit advocates of firmness against...",
          "..."
        ]
      }
    }
  }
}
```

Both `convergence` and `divergence` arrays must be present for every ministry×regime combination.

---

### `aria_annotations.json`

Short annotations produced by each ministry during the Circle phase (when it's not the lead ministry).

```json
{
  "_meta": { "version": "2.0" },

  "ministeres": {
    "economie": {
      "democratie_liberale": [
        "Economic efficiency and social justice must be balanced.",
        "The budgetary impact must be quantified and submitted to parliamentary oversight.",
        "..."
      ]
    }
  }
}
```

---

### `local_countries.json`

Fictional countries used in random world generation.

```json
[
  {
    "id": "valoria",
    "nom": "République de Valoria",
    "emoji": "🏛️",
    "couleur": "#4A90D9",
    "regime": "democratie_liberale",
    "terrain": "coastal",
    "description": "A nation born from the Enlightenment...",
    "leader": {
      "nom": "Elena Vaskor",
      "titre": "Présidente",
      "trait": "Réformiste pragmatique"
    },
    "population": 8400000,
    "tauxNatalite": 13.2,
    "tauxMortalite": 8.8,
    "satisfaction": 68
  }
]
```

**Valid regimes:** see `simulation.json → regimes` keys

**Valid terrains:** `coastal` · `inland` · `island` · `archipelago` · `highland` · `desert` · `foret` · `tropical` · `toundra`

---

### `real_countries.json`

Real-world countries, enriched with ARIA-specific sociological context.

```json
[
  {
    "id": "france",
    "flag": "🇫🇷",
    "nom": "France",
    "regime": "democratie_liberale",
    "terrain": "coastal",
    "population": 68000000,
    "pib_index": 78,
    "natalite": 10.7,
    "mortalite": 9.1,
    "aria_acceptance_irl": 38,
    "aria_sociology_logic": "A centralized state with strong republican traditions...",
    "triple_combo": "Geographical + geopolitical + sociological context in one paragraph",
    "secteurs": ["aéronautique", "agroalimentaire", "luxe"],
    "ressources": ["agriculture", "eau", "energie"],
    "leader": {
      "nom": "Emmanuel Macron",
      "titre": "Président",
      "trait": "Libéral-européen"
    }
  }
]
```

`aria_acceptance_irl` (0–100): estimated real-world acceptance of AI-assisted governance.

`triple_combo`: injected verbatim into the LLM context — write it as a dense, factual paragraph covering geography, geopolitics, and social dynamics.

---

### `local_events.json`

Random events triggered between cycles.

```json
{
  "revolte": [
    {
      "titre": "General Strike",
      "texte": "The population takes to the streets...",
      "severite": "critical",
      "impact": {
        "satisfaction": -8,
        "popularite": -12,
        "population_delta": 0
      }
    }
  ],
  "prosperite": [
    {
      "titre": "Trade surplus record",
      "texte": "Exports hit a historic high...",
      "severite": "info",
      "impact": { "satisfaction": 6, "popularite": 4 }
    }
  ]
}
```

**Valid categories:** `revolte` · `demo_explosion` · `alliance_rompue` · `secession` · `menace_invisible` · `innovation_disruptive` · `prosperite` · `catastrophe_naturelle` · `ressource_critique`

**Valid severite:** `critical` · `warning` · `info`

---

### `local_deliberation.json`

Offline minister dialogue lines used when no AI is available.

```json
{
  "ministers": {
    "initiateur": {
      "cycle_normal": [
        "The status quo is our enemy. Five years of hesitation...",
        "..."
      ],
      "crise":      ["Crisis demands action, not reflection. Now.", "..."],
      "secession":  ["..."],
      "diplomatie": ["..."],
      "referendum": ["..."]
    }
  }
}
```

**Valid contexts:** `cycle_normal` · `crise` · `secession` · `diplomatie` · `referendum`

---

### `simulation.json`

Regime coefficients, terrain modifiers, resource weights, and cycle calculation constants. Edit with care — these values affect all simulations.

```json
{
  "regimes": {
    "democratie_liberale": {
      "name": "Démocratie Libérale",
      "emoji": "🗳️",
      "coeff_satisfaction": 1.2,
      "coeff_croissance": 1.0,
      "taux_natalite": 11.2,
      "taux_mortalite": 9.1,
      "poids_ministeriel": {
        "justice": 1.3, "economie": 1.0, "defense": 0.8,
        "sante": 1.2, "education": 1.2, "ecologie": 1.0, "industrie": 0.9
      },
      "aria_irl_base": 48,
      "sat_base": 62,
      "bloc": "occident",
      "couleur": "#4A90D9"
    }
  },

  "terrains": {
    "coastal": {
      "name": "Côtier",
      "modificateur_pop": 1.1,
      "modificateur_eco": 1.2,
      "ressources_garanties": ["peche"],
      "ressources_possibles": ["agriculture", "commerce"],
      "emoji": "🌊",
      "maritime": true,
      "pop_base": 8000000
    }
  },

  "calculs_cycles": {
    "derive_satisfaction_base": -1,
    "seuil_revolte": 20,
    "seuil_crise_demo": 80
  },

  "ressources": {
    "agriculture": { "name": "Agriculture", "emoji": "🌾" },
    "petrole":     { "name": "Pétrole",     "emoji": "🛢️" }
  }
}
```

**Valid blocs:** `occident` · `techno` · `autoritaire` · `est`

---

## Code Conventions

- **React only** — functional components, hooks with `useCallback`/`useMemo` on props
- **Inline styles only** — no CSS modules, no `.css` files, no Tailwind
- **No TypeScript** — plain JavaScript
- **French** — variable names, comments, and JSON content in French (UI strings in both langs via `ariaI18n.js`)
- **Components** under ~300 lines, engines under ~500–700 lines — extract before adding

Do not modify these files without prior discussion:
- `src/Dashboard_p1.jsx` — core engine
- `src/shared/data/ariaData.js` — static data
- `src/shared/theme.js` — design tokens

---

## Opening an Issue

Before opening a PR, open an issue for anything beyond small content edits. Describe:
1. What you want to change and why
2. Which files are affected
3. Whether it requires a UI change, an engine change, or just JSON

*See [README.md](README.md) for setup · [doc/ARIA_CONTEXT.md](doc/ARIA_CONTEXT.md) for architecture deep-dive*
