# Contribuer à ARIA

**[🇬🇧 English version](CONTRIBUTING.md)**

ARIA est une simulation de gouvernance pilotée par délibération multi-LLM. Contribuer, c'est éditer des fichiers JSON (aucun serveur requis), améliorer l'interface React, ou ajouter du contenu éditorial. Ce document explique la structure du projet et ce qu'attend chaque fichier.

---

## Démarrage rapide

```bash
git clone https://github.com/flodus/aria-llm-council.git
cd aria-llm-council
npm install
npm run dev       # Serveur de dev sur http://localhost:5173
npm run build     # Build de production
npm run lint      # Vérification ESLint
```

Pas de backend. Pas de base de données. Tout tourne dans le navigateur — le contenu vit dans des fichiers JSON sous `templates/`, la configuration dans le `localStorage`.

---

## Structure du dépôt

```
aria/
├── src/
│   ├── features/           # Modules fonctionnels (council, init, settings...)
│   │   └── council/
│   │       ├── components/ # Composants React
│   │       ├── hooks/      # useCouncilSession, useConstitutionModal
│   │       └── services/   # deliberationEngine, routingEngine, agentsManager...
│   ├── shared/             # Composants partagés + données + thème
│   └── Dashboard_p1.jsx    # Moteur core : callAI(), generateWorld(), doCycle()
├── templates/
│   └── languages/
│       ├── fr/             # Contenu français (canonique)
│       └── en/             # Contenu anglais (miroir)
└── doc/                    # Documentation interne
```

Tout le contenu éditorial vit dans `templates/languages/{lang}/`. Le moteur lit ces fichiers à l'exécution — éditer un JSON suffit pour changer ce que disent les ministres, quelles questions apparaissent, ou comment les pays sont simulés.

---

## Domaines de contribution

| Domaine | Fichiers à éditer | Complexité |
|---------|------------------|------------|
| Dialogue ministres & postures | `aria_reponses.json` | Faible |
| Questions de délibération | `aria_questions.json` | Faible |
| Synthèses du Conseil | `aria_syntheses.json` | Faible |
| Annotations du Cercle | `aria_annotations.json` | Faible |
| Événements (révoltes, crises...) | `local_events.json` | Faible |
| Pays (fictifs) | `local_countries.json` | Faible |
| Pays (réels) | `real_countries.json` | Moyen |
| Agents de gouvernance & prompts | `governance.json` | Moyen |
| Interface React | `src/features/` | Élevé |
| Moteur de simulation | `src/Dashboard_p1.jsx` | Élevé |

---

## Workflow Git

```bash
# Démarrer une branche (ne jamais commiter sur main)
git checkout main && git pull origin main
git checkout -b type/nom-court        # feat/nouveau-pays, fix/bug-vote, content/dialogue-ministre
git push -u origin type/nom-court

# Commiter
git add <fichiers spécifiques>
git commit -m "type: description courte"
git push

# Ouvrir une PR sur GitHub — le mainteneur merge
```

Types de branches : `feat/`, `fix/`, `content/`, `refactor/`, `docs/`

---

## Schémas JSON

Tous les fichiers ont un miroir FR et EN avec une structure identique. Éditez les deux, ou ouvrez une issue si vous ne parlez qu'une langue.

---

### `governance.json`

Définition des agents : ministres, ministères, figures présidentielles, module Destinée.

```json
{
  "presidency": {
    "phare": {
      "name": "Le Phare",
      "symbol": "☉",
      "subtitle": "Soleil · Volonté",
      "essence": "Prompt système injecté dans le LLM pour cette figure",
      "role_long": "Description longue affichée dans l'interface",
      "weight": 1
    },
    "boussole": { "...même structure..." }
  },

  "ministers": {
    "initiateur": {
      "name": "L'Initiateur",
      "sign": "Bélier",
      "emoji": "♈",
      "color": "#E05252",
      "weight": 1,
      "comm": "Style de communication injecté dans chaque prompt",
      "essence": "Personnalité centrale — injectée comme contexte système",
      "annotation": "Prompt utilisé pendant la phase Cercle",
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
      "mission": "Description utilisée dans l'UI et le contexte",
      "weight": 1,
      "ministers": ["arbitre", "enqueteur"],
      "ministerPrompts": {
        "arbitre":   "Override de prompt spécifique pour ce ministre dans ce ministère",
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

**Contraintes :**
- Le tableau `ministers` d'un ministère doit contenir exactement 2 IDs de ministres existants
- `posture_defaut` doit être : `prudent` · `radical` · `statu_quo`
- `keywords` sont utilisés pour le routage — plus de keywords = priorité plus haute pour ce ministère
- `base: true` marque les ministères toujours actifs (ne peuvent pas être désactivés)

**IDs de ministres valides :** `initiateur` · `gardien` · `communicant` · `protecteur` · `ambassadeur` · `analyste` · `arbitre` · `enqueteur` · `guide` · `stratege` · `inventeur` · `guerisseur` · `oracle` · `wyrd`

**Ministères actifs :** `justice` · `economie` · `defense` · `sante` · `education` · `ecologie` · `industrie`

---

### `aria_questions.json`

Questions proposées au joueur en mode Board Game (hors-ligne) et utilisées comme suggestions.

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
        "Faut-il automatiser les jugements pour réduire le temps d'attente ?",
        "..."
      ]
    }
  },

  "pool_transversal": {
    "quotidien": {
      "description": "Tensions du quotidien — proches du vécu citoyen",
      "questions": ["Le prix du pain a bondi de 15%...", "..."]
    },
    "crise_et_peur":    { "description": "...", "questions": ["..."] },
    "ideologique":      { "description": "...", "questions": ["..."] },
    "anomalie_et_scifi": { "description": "...", "questions": ["..."] }
  }
}
```

---

### `aria_reponses.json`

Réponses de secours hors-ligne pour chaque ministre, par régime et posture. C'est la bibliothèque de contenu du mode Board Game.

```json
{
  "_meta": { "version": "2.0" },

  "ministers": {
    "initiateur": {
      "reponses": {
        "democratie_liberale": {
          "prudent":   ["réponse 1", "réponse 2", "réponse 3"],
          "radical":   ["réponse 1", "..."],
          "statu_quo": ["réponse 1", "..."]
        },
        "junte_militaire": { "...même structure..." }
      }
    }
  },

  "presidence": {
    "phare":    { "styles": { "normal": ["..."], "crise": ["..."] } },
    "boussole": { "styles": { "normal": ["..."], "crise": ["..."] } }
  },

  "garbage": {
    "messages": ["Question non reconnue. Veuillez reformuler.", "..."]
  }
}
```

**Régimes valides :** `democratie_liberale` · `republique_federale` · `monarchie_constitutionnelle` · `technocratie_ia` · `junte_militaire` · `oligarchie` · `theocratie` · `monarchie_absolue` · `communisme` · `nationalisme_autoritaire` · `democratie_directe`

**Postures valides :** `prudent` · `radical` · `statu_quo`

Recommandation : au moins 3 réponses par combinaison régime×posture pour éviter les répétitions.

---

### `aria_syntheses.json`

Textes de synthèse ministérielle utilisés quand l'IA est indisponible (mode Board Game).

```json
{
  "_meta": { "version": "2.0" },

  "ministeres": {
    "justice": {
      "democratie_liberale": {
        "convergence": [
          "Le Conseil s'accorde : une réforme équilibrée est retenue...",
          "..."
        ],
        "divergence": [
          "Des désaccords persistent entre partisans de la fermeté...",
          "..."
        ]
      }
    }
  }
}
```

Les tableaux `convergence` et `divergence` doivent être présents pour chaque combinaison ministère×régime.

---

### `aria_annotations.json`

Courtes annotations produites par chaque ministère pendant la phase Cercle (quand il n'est pas le ministère principal).

```json
{
  "_meta": { "version": "2.0" },

  "ministeres": {
    "economie": {
      "democratie_liberale": [
        "L'efficacité économique et la justice sociale doivent être conciliées.",
        "L'impact budgétaire doit être chiffré et soumis au contrôle parlementaire.",
        "..."
      ]
    }
  }
}
```

---

### `local_countries.json`

Pays fictifs utilisés dans la génération aléatoire de monde.

```json
[
  {
    "id": "valoria",
    "nom": "République de Valoria",
    "emoji": "🏛️",
    "couleur": "#4A90D9",
    "regime": "democratie_liberale",
    "terrain": "coastal",
    "description": "Une nation née des Lumières...",
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

**Régimes valides :** voir les clés de `simulation.json → regimes`

**Terrains valides :** `coastal` · `inland` · `island` · `archipelago` · `highland` · `desert` · `foret` · `tropical` · `toundra`

---

### `real_countries.json`

Pays réels, enrichis d'un contexte sociologique spécifique à ARIA.

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
    "aria_sociology_logic": "Un État centralisé aux fortes traditions républicaines...",
    "triple_combo": "Contexte géographique + géopolitique + sociologique en un seul bloc",
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

`aria_acceptance_irl` (0–100) : estimation réelle de l'acceptation de la gouvernance assistée par IA.

`triple_combo` : injecté verbatim dans le contexte LLM — rédigez-le comme un paragraphe dense couvrant géographie, géopolitique et dynamiques sociales.

---

### `local_events.json`

Événements aléatoires déclenchés entre les cycles.

```json
{
  "revolte": [
    {
      "titre": "Grève générale",
      "texte": "La population descend dans les rues...",
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
      "titre": "Record d'excédent commercial",
      "texte": "Les exportations atteignent un niveau historique...",
      "severite": "info",
      "impact": { "satisfaction": 6, "popularite": 4 }
    }
  ]
}
```

**Catégories valides :** `revolte` · `demo_explosion` · `alliance_rompue` · `secession` · `menace_invisible` · `innovation_disruptive` · `prosperite` · `catastrophe_naturelle` · `ressource_critique`

**Sévérité valide :** `critical` · `warning` · `info`

---

### `local_deliberation.json`

Répliques de ministres hors-ligne utilisées quand aucune IA n'est disponible.

```json
{
  "ministers": {
    "initiateur": {
      "cycle_normal": [
        "Le statu quo est notre ennemi. Cinq ans d'hésitation...",
        "..."
      ],
      "crise":      ["La crise appelle l'action, pas la réflexion. Maintenant.", "..."],
      "secession":  ["..."],
      "diplomatie": ["..."],
      "referendum": ["..."]
    }
  }
}
```

**Contextes valides :** `cycle_normal` · `crise` · `secession` · `diplomatie` · `referendum`

---

### `simulation.json`

Coefficients de régimes, modificateurs de terrains, poids des ressources, et constantes de calcul des cycles. À modifier avec précaution — ces valeurs affectent toutes les simulations.

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

**Blocs valides :** `occident` · `techno` · `autoritaire` · `est`

---

## Conventions de code

- **React uniquement** — composants fonctionnels, hooks avec `useCallback`/`useMemo` sur les props
- **Styles inline uniquement** — pas de CSS modules, pas de fichiers `.css`, pas de Tailwind
- **Pas de TypeScript** — JavaScript pur
- **Français** — noms de variables, commentaires et contenu JSON en français (strings UI dans les deux langues via `ariaI18n.js`)
- **Composants** < ~300 lignes, moteurs < ~500–700 lignes — extraire avant d'ajouter

Ne pas modifier ces fichiers sans discussion préalable :
- `src/Dashboard_p1.jsx` — moteur core
- `src/shared/data/ariaData.js` — données statiques
- `src/shared/theme.js` — design tokens

---

## Ouvrir une issue

Avant toute PR, ouvrez une issue pour tout ce qui dépasse les petites éditions de contenu. Décrivez :
1. Ce que vous voulez changer et pourquoi
2. Les fichiers concernés
3. Si cela nécessite un changement d'UI, de moteur, ou seulement du JSON

*Voir [README.md](README.md) pour l'installation · [doc/ARIA_CONTEXT.md](doc/ARIA_CONTEXT.md) pour l'architecture en détail*
