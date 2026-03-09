# ARIA — Architecture de Raisonnement Institutionnel par l'IA

> *"Et si les politiques d'un pays étaient soumises au peuple par l'intermédiaire d'un conseil des ministres IA ?"*

<div align="center">

![Version](https://img.shields.io/badge/version-7.0-C8A44A?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/licence-MIT-green?style=flat-square)

</div>

---

## Qu'est-ce qu'ARIA ?

ARIA est une **simulation de gouvernance** dans laquelle le joueur dirige un pays dont le conseil des ministres est incarné par des LLMs (Claude + Gemini). Chaque cycle de 5 ans, les ministres délibèrent, le Phare (Président) et la Boussole (Présidente) synthétisent leurs positions, et un référendum citoyen tranche.

Ce n'est pas un jeu de stratégie classique. C'est une **expérience de pensée interactive** sur la gouvernance algorithmique, la légitimité démocratique, et la co-décision humain/IA.

> *"La vraie question n'est pas de savoir si l'IA entrera dans la gouvernance — elle y entre déjà, de manière opaque et non régulée. La question est de savoir si nous choisirons de le faire délibérément, avec des garde-fous démocratiques, ou par défaut, sans eux."*

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 · Vite · CSS custom |
| Carte | SVG pur · grille hexagonale · PRNG reproductible (Mulberry32) |
| IA Pensée | Claude Sonnet (Anthropic API) |
| IA Synthèse | Gemini Pro (Google AI API) |
| Persistance | `localStorage` — zéro backend |
| Données | `base_agents.json` · `base_stats.json` · `ariaData.js` |

**Aucune dépendance cartographique externe.** Le monde est entièrement généré par `WorldEngine.js` via FBM (Fractal Brownian Motion) à partir d'un seed.

---

## Fonctionnement

### Le cycle de jeu

```
Lancer une partie
    └─ Choisir un pays (fictif ou réel)
           └─ Cycle +5 ans
                  ├─ Calcul démographique & économique
                  ├─ Delta satisfaction (ressources · alliances · régime)
                  ├─ Événements narratifs générés par l'IA
                  └─ Délibération du Conseil
                         ├─ Ministres (pensée individuelle)
                         ├─ Synthèse ministérielle
                         ├─ Phare + Boussole (présidence)
                         ├─ Synthèse présidentielle
                         └─ Référendum citoyen → OUI / NON
                                └─ Impact sur le taux d'adhésion ARIA IRL
```

### La délibération IA

Chaque délibération suit un pipeline structuré :

1. **Ministres** — chaque ministre exprime sa position selon son rôle (Initiateur, Gardien, Guérisseur, Protecteur…)
2. **Synthèse ministérielle** — un LLM produit la position officielle du ministère
3. **Le Phare** — vision long terme, direction stratégique
4. **La Boussole** — mémoire collective, protection des citoyens
5. **Synthèse présidentielle** — détecte convergence ou divergence → formate la question référendaire
6. **Référendum** — le joueur vote OUI ou NON au nom du peuple

### Le taux ARIA IRL

Chaque pays possède un taux d'adhésion à la gouvernance IA ancré dans une réalité sociologique (`aria_acceptance_irl`). Ce taux fluctue en jeu selon les votes, les crises, et la satisfaction populaire. Il sert de thermomètre politique interne.

---

## Modes de jeu

### Modes IA (selon les clés API disponibles)

| Configuration | Mode activé |
|---------------|-------------|
| Aucune clé | **Hors ligne** — délibération sur textes locaux pré-écrits (`ariaData.js`) |
| 1 seule clé | **Solo** — Claude ou Gemini joue tous les rôles |
| 2 clés | **ARIA** · **Solo** · **Personnalisé** (assignation rôle par rôle) |

### Mode Board Game

Active les textes locaux même avec des clés API valides. Utile pour tester l'interface sans consommer de tokens.

---

## Nations disponibles

### Nations fictives (hors ligne)

| Nation | Régime | Terrain | Leader |
|--------|--------|---------|--------|
| 🏛 **République de Valoria** | Démocratie fédérale | Côtier | Premier Consul Aldric Maren |
| ⛰ **Confédération d'Eldoria** | République fédérale | Montagneux | Archichancelier Vorn Daelith |
| 🌊 **Confédération de Thalassia** | Monarchie constitutionnelle | Archipel | Reine Seraphine II |

### Pays réels (mode en ligne)

18 pays préconfigurés avec données sociologiques ARIA : France · Allemagne · États-Unis · Chine · Inde · Japon · Brésil · Russie · Arabie Saoudite · Nigéria · et d'autres.

Chaque pays réel dispose d'une analyse `aria_sociology_logic` expliquant pourquoi sa population accepterait (ou résisterait à) une gouvernance algorithmique.

---

## Architecture des fichiers

```
src/
├── App.jsx                  # Shell principal — routing, topbar, états globaux
├── App.css                  # Styles globaux
│
├── Dashboard_p1.jsx         # Hook useARIA + toute la logique métier
│                            # (cycle, délibération, événements, ARIA IRL)
│                            # Exporte : PAYS_LOCAUX, REGIMES, doCycle, callAI…
│
├── Dashboard_p2.jsx         # MapSVG — assembleur carte
│                            # Génère le monde (WorldEngine) + place les pays
│
├── Dashboard_p3.jsx         # Composant Dashboard principal
│                            # Onglets Map / LLM Council / Chronolog
│                            # Modales sécession, diplomatie, constitution
│
├── WorldEngine.js           # Moteur de génération hexagonale pur JS
│                            # FBM heightmap · biomes · placement pays
│                            # Exports : generateWorld, placeCountries, BIOME…
│
├── HexGrid.jsx              # Rendu SVG (11 couches z-order)
│                            # Frontières néon · cercles d'influence · légendes
│
├── InitScreen.jsx           # Écran de démarrage
│                            # Flux : Nom → Mode → Config → Génération
│
├── Settings.jsx             # Panneau de configuration (5 sections)
│                            # Système · Constitution · Conseil · Simulation · Interface
│
├── ConstitutionModal.jsx    # Modale gouvernance par pays
│                            # Régime · ressources · relations diplomatiques
│
├── LegitimiteOverlay.jsx    # Rapport légitimité ARIA
│                            # Think-Tank réels vs simulation en cours
│
├── CountryPanel.jsx         # Panneau latéral pays sélectionné
│
├── ariaData.js              # Base de données locale
│                            # LOCAL_DELIBERATION · LOCAL_EVENTS
│                            # LOCAL_COUNTRIES · REAL_COUNTRIES_DATA
│
├── ariaTheme.js             # Tokens de design
│                            # FONT · COLOR · BTN_PRIMARY · CARD_STYLE…
│
├── ariaHexWorld.js          # (Ancien moteur — déprécié)
│
templates/
├── base_agents.json         # Ministres · Ministères · Présidence
└── base_stats.json          # Terrains · Régimes · Humeurs · Calculs cycles
```

---

## Persistance (localStorage)

| Clé | Contenu |
|-----|---------|
| `aria_options` | Config générale — clés API, mode IA, gameplay, world seed |
| `aria_api_keys` | `{ claude, gemini }` — sauvegardé par InitScreen |
| `aria_api_keys_status` | `{ claude: "ok"\|null, gemini: "ok"\|null }` — statut de connexion persisté |
| `aria_countries` | État complet des pays en cours de simulation |
| `aria_world` | Seed + métadonnées du monde généré |
| `aria_prompts` | Prompts système customisés (overrides des défauts) |
| `aria_agents` | Overrides personnages et ministères |
| `aria_sim` | Overrides paramètres de simulation |

---

## WorldEngine — Génération procédurale

Le monde est généré en 6 étapes déterministes à partir d'un seed entier :

1. **Grille hexagonale brute** — pointy-top, offset colonne impaire
2. **Heightmap FBM** — 4 octaves de bruit de valeur, PRNG Mulberry32
3. **Attribution biomes** — heightmap + latitude simulée → `OCEAN_DEEP / OCEAN_SHELF / LAND / HIGHLAND / MOUNTAIN / POLAR / DESERT`
4. **Détection continents** — flood-fill, classification continent/île/îlot
5. **Enveloppes** — précalcul des outlines pour le rendu SVG
6. **Placement pays** — BFS seedé, cohérence terrain (côtier → COASTAL, montagneux → HIGHLAND…)

**Le même seed produit toujours le même monde.** Les pays se placent de façon déterministe selon leur terrain et leur population (plus de population = plus d'hexagones).

---

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/aria.git
cd aria

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

### Clés API (optionnelles)

ARIA fonctionne **sans clé API** en mode hors ligne. Pour activer la délibération IA :

1. Lancer l'application
2. Ouvrir ⚙ **Settings → Système**
3. Renseigner votre clé Anthropic (`sk-ant-...`) et/ou Google (`AIza...`)
4. Tester la connexion → le statut se persiste automatiquement

> Les clés sont stockées uniquement dans votre `localStorage`, jamais transmises à un serveur tiers.

---

## Régimes disponibles

| Régime | Adhésion ARIA base |
|--------|-------------------|
| Technocratie IA | 72% |
| Démocratie libérale | 48% |
| République fédérale | 44% |
| Monarchie constitutionnelle | 38% |
| Communisme | 32% |
| Monarchie absolue | 28% |
| Oligarchie | 26% |
| Régime autoritaire | 20% |
| Junte militaire | 16% |
| Nationalisme autoritaire | 12% |

*Le taux de base est modulé en jeu par la satisfaction, l'économie, le terrain, et les votes référendaires.*

---

## Événements narratifs

L'IA génère des événements contextuels selon les seuils franchis :

- `revolte` — satisfaction < 20%
- `catastrophe_naturelle` — séismes, inondations, épidémies
- `menace_invisible` — cyber-attaques, espionnage, désinformation
- `innovation_disruptive` — percées technologiques
- `ressource_critique` — pénuries alimentaires, énergétiques, hydriques
- `prosperite` — excédents commerciaux, plein emploi, rayonnement culturel

En mode hors ligne, ces événements sont piochés dans `LOCAL_EVENTS` (ariaData.js). Avec une clé API, ils sont générés dynamiquement avec fact-check intégré.

---

## Flux InitScreen

```
Nom du monde
    └─ Mode
           ├─ HORS LIGNE
           │      ├─ Par défaut
           │      │      ├─ Nation fictive (Valoria / Eldoria / Thalassia)
           │      │      └─ Pays réel (liste prédéfinie)
           │      └─ Personnalisé (1–6 nations configurables)
           │
           └─ EN LIGNE (requiert ≥ 1 clé API)
                  ├─ Par défaut
                  │      ├─ Pays réel (dropdown + saisie libre → IA génère)
                  │      └─ Nation fictive (3 presets + création libre)
                  └─ Personnalisé (1–6 nations → IA génère les portraits)
```

---

## Roadmap

- [ ] Mode multijoueur (plusieurs pays simultanés avec relations diplomatiques actives)
- [ ] Export / import de sauvegarde complète
- [ ] Mode observateur (IA joue tous les rôles y compris le référendum)
- [ ] Événements historiques injectables (crises réelles comme contexte)
- [ ] Intégration de modèles locaux (Ollama)

---

## Licence

MIT — voir `LICENSE`

---

<div align="center">
<sub>ARIA — Simuler pour comprendre. Comprendre pour décider.</sub>
</div>
