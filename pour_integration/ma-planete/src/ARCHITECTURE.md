# Architecture — `src/`

## Vues — `src/views/`

| Fichier | Lignes | Rôle |
|---|---|---|
| `ExplorateurMonde.jsx` | 790 ⚠️ | Vue principale. Globe ↔ Mercator morphé, clic pays, overlay WarRoom, scan line. Seule vue utilisée par App. |
| `MercatorView.jsx` | 296 | Planisphère standalone (hors App), drag/zoom, 3 pays néons. |
| `GlobeView.jsx` | ~220 | Globe standalone, OrbitControls, clic pays. |
| `WarRoomView.jsx` | ~170 | Cockpit néon, wrap de WarRoomMap (canvas/) + panneau burger. |

## Composants — `src/components/`

| Fichier | Lignes | Rôle |
|---|---|---|
| `RadioPlayer.jsx` | 385 | Lecteur radio persistant, stations par pays, toujours monté dans App. |
| `MorphingCanvas.jsx` | ~360 | Globe animé pendant le loading init, morph globe→mercator déclenché par `morphPret`. |
| `PlanetCanvas.jsx` | 229 | Canvas globe décoratif pour le fond de l'écran d'init. |
| `InitScreenLayout.jsx` | 19 | Wrapper HTML simple fond + enfant. |

## Composants Three.js d'origine — `src/components/canvas/` *(ne pas modifier)*

| Fichier | Rôle |
|---|---|
| `WarRoomMap.jsx` | Carte planar néon utilisée par WarRoomView |
| `Planet.jsx` / `Planet_geojson.jsx` / `Planet-shaderProcedural.jsx` | Versions originales du globe |
| `Scene.jsx` / `Marker.jsx` | Scène et marqueur originaux |

## Utilitaires — `src/utils/`

| Fichier | Lignes | Rôle |
|---|---|---|
| `worldGenerator.js` | 319 | Génère des données de monde fictif (noms, pays, stats) pour ARIA |
| `geoMaths.js` | 50 | Haversine, bbox, point-dans-polygone |
| `curseurs.js` | 8 | Constantes CSS curseur |

## Données / entry

| Fichier | Rôle |
|---|---|
| `src/data/defaultStations.json` | Stations radio par défaut |
| `App.jsx` (80L) | Routeur de phase : init → morph → globe |
| `main.jsx` | Point d'entrée React |

---

## Fichiers > 400 lignes — comment les découper

### `ExplorateurMonde.jsx` (790L) — priorité

Le fichier cumule 7 responsabilités. Découpage cible :

```
src/
├── utils/
│   └── geoExtraction.js       # extraireRemplissage, extraireSegmentsNeon,
│                              # trouverPays, pointDansRing
│                              # (partageable avec GlobeView, MercatorView...)
├── hooks/
│   ├── useGlobeOrbit.js       # useGlobeOrbit (L281-307)
│   └── useMercatorZoom.js     # useMercatorZoom (L310-318)
├── shaders/
│   └── explorateurShaders.js  # toutes les const de shaders GLSL
└── views/
    ├── ExplorateurMonde.jsx   # réduit à ~200L : orchestration + export
    └── SceneGlobeMercator.jsx # composant Three.js ~150L
```

**Gain : ExplorateurMonde passe de 790L à ~200L.**

### `RadioPlayer.jsx` (385L) — juste sous le seuil

À découper si ça grossit encore :

```
src/components/
├── radio/
│   ├── StationList.jsx    # liste + sélection des stations
│   └── RadioControls.jsx  # boutons play/prev/next/volume
└── RadioPlayer.jsx        # garde juste l'état et l'<audio>
```

---

## Note technique — remplissage des pays

Le fill utilise `THREE.ShapeUtils.triangulateShape` (et non `THREE.ShapeGeometry`) avec un `try/catch` par polygone. `THREE.ShapeGeometry` échoue silencieusement sur les polygones complexes (USA, Russie…). La triangulation directe est robuste et active dans les 5 vues : GlobeView, MercatorView, WarRoomView, MorphingCanvas, ExplorateurMonde.


  En résumé pour le fill — le vrai fix était de remplacer THREE.ShapeGeometry (qui échoue sur polygones complexes) par THREE.ShapeUtils.triangulateShape avec try/catch polygone par polygone. Maintenant actif dans les 5 vues.
  
● Build OK. Voici ce qui a changé :                                                                                                                                                                                                                                                                                                                                                                                                         
  
  Avant : uniquement des lineSegments → frontières visibles, intérieur vide.                                                                                                                                                                                                                                                                                                                                                                
                                                            
  Après :                                                                                                                                                                                                                                                                                                                                                                                                                                   
  - creerGeometrieRemplie() — triangule les polygones GeoJSON via THREE.Shape + THREE.Path (pour les trous/enclaves) → THREE.ShapeGeometry
  - Tous les pays sont remplis avec une teinte bleu-ocean semi-transparente (z=0.03)                                                                                                                                                                                                                                                                                                                                                        
  - Les 3 pays spéciaux (France, Italie, Thaïlande) ont en plus un remplissage néon pulsant légèrement (z=0.03)
  - Les frontières restent par-dessus (z=0.06)                                                                                                                                                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                                                                                                                                                                                            
  Les enclaves (ex : trous dans les pays) sont gérées via shape.holes.                                                                                                                                                                                                                                                                                                                                                                      
                                                                            
