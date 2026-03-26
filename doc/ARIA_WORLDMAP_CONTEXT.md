# ARIA — WorldMap Context
*Fichier vivant — Assess/Decide uniquement. Mis à jour en session Claude.ai.*
*Dernière mise à jour : 2026-03-20*

---

## Vision validée : Navigation à 3 niveaux

L'utilisateur navigue par **double-clic progressif** entre trois vues imbriquées.
Chaque vue est un niveau de zoom narratif et fonctionnel différent.

```
GlobeView  ──[dbl-clic n'importe où]──►  MercatorView  ──[dbl-clic pays contrôlé]──►  WarRoomView
   ▲                                           ▲                                             ▲
Vue "touriste"                          Vue géopolitique                           Vue "cockpit"
Sphère 3D rotative                      Planisphère plat                           Fond néon full-screen
Flux commerciaux                        Pays cliquables                            CountryPanel burger
Propagation événements                  NPC + joueurs                              Council + Chronolog
```

---

## GlobeView

**Technologie** : Three.js / react-three-fiber (à confirmer en phase Do)
**Rôle** : Vue d'entrée, ambiance "touriste de l'espace"
**Interaction** :
- Rotation libre (OrbitControls)
- Double-clic → transition vers MercatorView (animation morphing globe→plan)
- Aucune action fonctionnelle — vue contemplative

**Couches visuelles prévues (V2+)** :
- Flux commerciaux en pointillés entre pays
- Propagation pandémies / événements (expansion animée)
- Ces couches lisent les données de simulation ARIA (non encore implémentées)

**Rendu monde** : Voir section "Types de monde" ci-dessous.

---

## MercatorView

**Technologie** : TBD — Three.js (morphing fluide depuis Globe) ou SVG (plus simple)
*Trade-off à trancher : fluidité de la transition vs complexité technique*

**Rôle** : Vue géopolitique — exploration et sélection de pays
**Interaction** :
- Pays cliquables → info-bulle rapide (stats, régime, population)
- Double-clic sur pays **contrôlé par le joueur** → transition vers WarRoomView
- Double-clic sur pays **NPC** → info-bulle enrichie (pas de WarRoom)
- Pan + zoom (MapControls)

**Distinction joueur / NPC** :
- Pays joueurs : couleur régime + néon actif
- Pays NPC : silhouette atténuée, pas d'accès WarRoom

---

## WarRoomView

**Technologie** : SVG / Canvas (pas de 3D nécessaire)
**Rôle** : Cockpit de jeu — accès gouvernement, conseil, chronolog
**Visuel de référence** : Capture "France + Italie néon rose/vert" (Gemini image, session 2026-03-20)

**Composition** :
- Fond full-screen sombre
- Frontières du pays sélectionné en **néon coloré** (couleur = régime ou alliance)
- Pays voisins en silhouette atténuée (contexte géographique)
- Étoiles / grille cyber en arrière-plan (cohérence esthétique ARIA)

**CountryPanel — mode burger** :
- Overlay latéral **escamotable** via bouton ☰ (burger) en haut à droite
- Quand panel ouvert : fonctionnement identique au CountryPanel actuel (onglets map/council/chronolog)
- Quand panel fermé : WarRoomView plein écran, pur décor — immersion maximale
- Transition : slide-out / slide-in (pas de disparition brutale)

---

## Types de monde — choix à l'Init

Deux modes de monde, sélectionnable à l'écran d'initialisation :

| Mode | Description | Rendu Globe | Rendu Mercator |
|------|-------------|-------------|----------------|
| **Terre réelle** | Pays réels (GeoJSON officiel) | Globe terrestre avec frontières réelles | Planisphère GeoJSON standard |
| **Monde inconnu** | Pays fictifs ARIA sur planète procédurale | Sphère générée par fBm shader (Planet-shaderProcedural) | Planisphère des continents générés |

### Monde inconnu — deux sous-options (non tranchées)
- **Option A** : Continents procéduraux via fBm shader (Planet-shaderProcedural.jsx) — formes organiques, biomes colorés, pas de frontières réelles
- **Option B** : Monde hexagonal ARIA projeté sur sphère — cohérence avec WorldEngine.js existant, mais hexagones moins esthétiques en 3D

*Décision à prendre lors de la phase proto, selon le rendu visuel obtenu.*

---

## Architecture du proto isolé

**Localisation** : Repo séparé ou dossier `map-proto/` à la racine — **aucun import croisé avec ARIA actuel**
**Stack** : React 19 + Vite + Three.js/r3f + GeoJSON

```
map-proto/
├── src/
│   ├── views/
│   │   ├── GlobeView.jsx          # Sphère 3D + OrbitControls
│   │   ├── MercatorView.jsx       # Planisphère + MapControls + pays cliquables
│   │   └── WarRoomView.jsx        # Fond néon + CountryOverlay burger
│   ├── components/
│   │   ├── NeonBorder.jsx         # Rendu frontières néon (SVG ou shader)
│   │   ├── CountryOverlay.jsx     # Panel escamotable (burger)
│   │   └── FluxLayer.jsx          # Pointillés flux/événements (V2+)
│   ├── data/
│   │   └── countries.geo.json     # GeoJSON monde réel (déjà dans proto actuel)
│   └── App.jsx                    # Navigation entre les 3 vues + état global
├── package.json
└── vite.config.js
```

**État de navigation** (géré dans App.jsx) :
```js
const [view, setView] = useState('globe')        // 'globe' | 'mercator' | 'warroom'
const [selectedCountry, setSelectedCountry] = useState(null)
```

---

## Relation avec ARIA existant

Le proto est **isolé** pendant la phase d'exploration.
Une fois les choix technologiques validés (Three.js vs SVG pour Mercator, Option A vs B pour monde inconnu), on définira le plan d'intégration dans `features/map/`.

**Ce qui survivra du code actuel** :
- `WorldEngine.js` + `generateWorld()` — moteur PRNG, indépendant du rendu
- `CountryPanel` — réutilisé tel quel dans WarRoomView (mode burger)
- Données pays (`state_agent.json`, `base_agents.json`) — indépendantes du rendu

**Ce qui sera remplacé** :
- `HexGrid.jsx` + `MapSVG` (Dashboard_p2) → nouvelles vues `features/map/views/`
- La carte SVG hexagonale devient la WarRoomView (ou disparaît)

---

## Questions ouvertes

| # | Question | Bloquante ? |
|---|----------|-------------|
| Q1 | Three.js direct vs react-three-fiber ? | Non — à décider au proto |
| Q2 | MercatorView : Three.js (morphing) vs SVG (simplicité) ? | Non — trade-off visuel vs complexité |
| Q3 | Monde inconnu : fBm shader (Option A) vs hex projeté (Option B) ? | Non — à valider visuellement |
| Q4 | Couleur néon WarRoom = régime ou alliance ? | Non — cosmétique |
| Q5 | Animation transition Globe→Mercator : morphing shader ou cut + fade ? | Non — à expérimenter |

---

## Décisions NON prises (intentionnellement)

- Intégration dans ARIA principal : **après** validation du proto
- Suppression de HexGrid / Dashboard_p2 : **après** validation du proto
- TypeScript : question globale ARIA, pas spécifique à la map

---

*Ce fichier est mis à jour à chaque session Assess/Decide sur le chantier WorldMap.*
*Les décisions d'exécution vont dans les commits Claude Code.*
