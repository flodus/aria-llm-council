# ANALYSE — Structures d'objet pays (pré-normalizeCountry)
_Généré le 2026-03-12 — base de travail pour créer `normalizeCountry()`_

---

## 1. Sources et structures brutes

### 1.1 PAYS_LOCAUX (`ariaData.js`)

Pays fictifs utilisés en mode offline.

```js
{
  id:            string      // 'valoria'
  nom:           string      // 'République de Valoria'
  emoji:         string      // '🏛'
  couleur:       string      // '#4A7FC1'
  regime:        string ID   // 'republique_federale'
  terrain:       string ID   // 'coastal'
  description:   string
  leader:        string      // 'Premier Consul Aldric Maren'
  population:    number      // 12400000
  tauxNatalite:  float       // 11.2
  tauxMortalite: float       // 9.1
  satisfaction:  number      // 62
}
```

---

### 1.2 REAL_COUNTRIES_DATA (`ariaData.js`)

Pays réels pré-encodés dans la base.

```js
{
  id:                   string      // 'france'
  flag:                 emoji       // '🇫🇷'           ← NOM DIFFÉRENT (vs emoji)
  nom:                  string      // 'France'
  regime:               string ID   // 'democratie_liberale'
  terrain:              string ID   // 'coastal'
  population:           number      // 68000000
  pib_index:            number      // 78
  natalite:             float       // 10.7             ← NOM DIFFÉRENT (vs tauxNatalite)
  mortalite:            float       // 9.8              ← NOM DIFFÉRENT (vs tauxMortalite)
  aria_acceptance_irl:  number      // 38  (0-100)
  aria_sociology_logic: string      //                  ← NOM DIFFÉRENT (vs description)
  triple_combo:         string      //                  ← NOM DIFFÉRENT (vs description, fallback)
  secteurs:             string[]    // ['aéronautique', ...]
  ressources:           string[]    // ['agriculture', 'eau', ...]  ← ARRAY (vs objet {} ailleurs)
}
```

**Champs absents vs PAYS_LOCAUX** : `couleur`, `satisfaction`, `leader`, `tauxNatalite`, `tauxMortalite`, `description`, `emoji`

---

### 1.3 Prompt IA — `buildCountryPrompt()` (`Dashboard_p1.jsx`)

Ce que l'IA est censée retourner en JSON.

```json
{
  "nom":           "string",
  "emoji":         "emoji unique",
  "couleur":       "#RRGGBB",
  "regime":        "democratie_liberale | republique_federale | monarchie_constitutionnelle | monarchie_absolue | technocratie_ia | oligarchie | junte_militaire | regime_autoritaire | theocracie | communisme | nationalisme_autoritaire",
  "terrain":       "coastal | inland | island | archipelago | highland",
  "description":   "string 15-25 mots",
  "leader": {
    "nom":   "string",
    "titre": "string",
    "trait": "string"
  },
  "population":    "integer",
  "tauxNatalite":  "float 6.0-40.0",
  "tauxMortalite": "float 3.0-20.0",
  "satisfaction":  "integer 15-85",
  "aria_acceptance": "integer 10-90",
  "ressources": {
    "agriculture": "0|1", "bois": "0|1", "eau": "0|1",
    "energie": "0|1", "mineraux": "0|1", "peche": "0|1", "petrole": "0|1"
  },
  "coefficients": {
    "justice": "float", "economie": "float", "defense": "float",
    "sante": "float",   "education": "float", "ecologie": "float"
  }
}
```

**Particularités** :
- `leader` : objet `{nom, titre, trait}` — **aplatit en string** par `buildCountryFromAI()`
- `ressources` : objet `{"agriculture": "0|1"}` — différent de REAL_COUNTRIES_DATA (array de noms)
- `coefficients` : champ propre au mode IA, absent partout ailleurs

---

### 1.4 `buildCountryFromAI()` (`Dashboard_p1.jsx`)

Objet pays complet après parsage de la réponse IA.

```js
{
  // — Depuis réponse IA (normalisés) —
  id:            string      // généré depuis nom
  nom:           string
  emoji:         string      // fallback '🌍'
  couleur:       string      // fallback '#4A7EC8'
  regime:        string ID
  terrain:       string ID
  description:   string
  leader:        string      // aplatit {nom, titre, trait} → "titre nom"
  population:    number
  tauxNatalite:  float
  tauxMortalite: float
  satisfaction:  number      // fallback 55
  ressources:    object {}   // { agriculture: true, eau: false, ... }
  coefficients:  object {}   // { justice: 1.2, ... }

  // — Calculés au build —
  regimeName:    string      // getStats().regimes[regime].name
  regimeEmoji:   string      // getStats().regimes[regime].emoji
  terrainName:   string      // getStats().terrains[terrain].name
  coastal:       boolean
  humeur:        string
  humeur_color:  string
  popularite:    number      // depuis STATS.global_start
  annee:         number      // depuis STATS.global_start
  economie:      number      // 100
  aria_irl:      null        // calculé plus tard via calcAriaIRL()
  aria_current:  null

  // — Géométrie SVG —
  cx, cy, size:  number
  seed:          number
  svgPath:       string
  influenceRadius: number

  // — État initial —
  relations:     {}
  chronolog:     []
  isLocal:       false
}
```

---

### 1.5 `buildCountryFromLocal()` (`Dashboard_p1.jsx`)

Identique à `buildCountryFromAI()` avec ces différences :

```js
{
  // même structure complète, sauf :
  ressources:  object {}   // calculé via calcRessources(terrain, seed), pas fourni en input
  coefficients: object {}  // depuis regime.poids_ministeriel
  isLocal:     true        // ← seule vraie différence fonctionnelle
}
```

---

### 1.6 `normalizeRealCountryTemplate()` (`Dashboard_p1.jsx`) — existe déjà

```js
function normalizeRealCountryTemplate(rc) {
  return {
    id:            rc.id,
    nom:           rc.nom,
    emoji:         rc.flag || '🌍',           // flag → emoji
    couleur:       rc.couleur || `hsl(...)`,
    regime:        rc.regime || 'democratie_liberale',
    terrain:       rc.terrain || 'coastal',
    description:   rc.aria_sociology_logic || rc.triple_combo || '',
    leader:        rc.leader || null,
    population:    rc.population || 5_000_000,
    tauxNatalite:  rc.tauxNatalite ?? rc.natalite  ?? 11,   // natalite → tauxNatalite
    tauxMortalite: rc.tauxMortalite ?? rc.mortalite ?? 9,   // mortalite → tauxMortalite
    satisfaction:  rc.satisfaction ?? 55,
  };
}
```

**Cette fonction existe mais n'est pas exportée et ne couvre pas tous les cas** (pas de `ressources`, pas d'`aria_acceptance_irl`, etc.)

---

### 1.7 RestCountries API

Réponse brute (endpoint: `/v3.1/name/{name}?fields=name,flag,population,region`)

```js
{
  name: {
    common:   string   // 'France'
    official: string
  },
  flag:        emoji   // '🇫🇷'
  population:  number
  region:      string  // 'Europe'
  translations: {
    fra: { common: string, official: string },
    // ...
  }
}
```

**Champs utilisés dans le code** : `name.common`, `flag`, `population`, `region`

---

### 1.8 `rcDefautData` — résultat de `searchDefautCountry()` (`InitScreen.jsx`)

Objet stocké après validation d'un pays tapé librement.

```js
{
  id:         string      // canonical.toLowerCase().replace(/[^a-z0-9]/g, '-')
  nom:        string      // validé par IA
  flag:       emoji       // rc[0].flag || '🌐'
  regime:     'democratie_liberale'   // ⚠️ HARDCODÉ — RestCountries ne retourne pas ça
  terrain:    'coastal'               // ⚠️ HARDCODÉ — RestCountries ne retourne pas ça
  population: number      // rc[0].population || 5_000_000
  region:     string      // rc[0].region || ''
  _fromApi:   true
}
```

---

## 2. Tableau comparatif des champs

| Champ | PAYS_LOCAUX | REAL_COUNTRIES | Prompt IA | rcDefautData |
|---|---|---|---|---|
| `id` | ✓ | ✓ | — | ✓ généré |
| `nom` | ✓ | ✓ | ✓ | ✓ |
| `emoji` | ✓ | — (`flag`) | ✓ | — (`flag`) |
| `flag` | — | ✓ | — | ✓ |
| `couleur` | ✓ | — | ✓ | — |
| `regime` | ✓ ID | ✓ ID | ✓ enum | ⚠️ 'democratie_liberale' (hardcodé) |
| `terrain` | ✓ ID | ✓ ID | ✓ enum | ⚠️ 'coastal' (hardcodé) |
| `description` | ✓ | — (`aria_sociology_logic` / `triple_combo`) | ✓ | — |
| `leader` | ✓ string | — | ✓ `{nom,titre,trait}` → aplati | — |
| `population` | ✓ | ✓ | ✓ | ✓ |
| `tauxNatalite` | ✓ | — (`natalite`) | ✓ | — |
| `tauxMortalite` | ✓ | — (`mortalite`) | ✓ | — |
| `satisfaction` | ✓ | — | ✓ | — |
| `ressources` | — | ✓ array de noms | ✓ `{clé: 0\|1}` | — |
| `coefficients` | — | — | ✓ `{ministère: float}` | — |
| `aria_acceptance_irl` | — | ✓ | ✓ (`aria_acceptance`) | — |
| `region` | — | — | — | ✓ |
| `_fromApi` | — | — | — | ✓ |
| `pib_index` | — | ✓ | — | — |
| `secteurs` | — | ✓ | — | — |

---

## 3. Divergences critiques à corriger dans normalizeCountry()

### 3.1 Noms de champs incohérents

| Source | Champ natif | Champ cible |
|---|---|---|
| REAL_COUNTRIES_DATA | `flag` | → `emoji` |
| REAL_COUNTRIES_DATA | `natalite` | → `tauxNatalite` |
| REAL_COUNTRIES_DATA | `mortalite` | → `tauxMortalite` |
| REAL_COUNTRIES_DATA | `aria_sociology_logic` / `triple_combo` | → `description` |
| RestCountries / rcDefautData | `flag` | → `emoji` |
| Prompt IA | `leader: {nom, titre, trait}` | → `leader: string` (ou garder objet ?) |
| REAL_COUNTRIES_DATA | `ressources: string[]` | → `ressources: {clé: boolean}` |

### 3.2 Valeurs hardcodées dans rcDefautData

```
regime: 'democratie_liberale'  ← toujours, même pour la Chine ou l'Arabie Saoudite
terrain: 'coastal'             ← toujours, même pour la Suisse (pays enclavé)
```
→ À corriger : soit en interrogeant REAL_COUNTRIES_DATA si le pays existe, soit en laissant l'IA inférer le régime/terrain après validation.

### 3.3 Champ `ressources` — 3 formats différents

| Source | Format |
|---|---|
| REAL_COUNTRIES_DATA | `["agriculture", "eau", "energie"]` (array de noms actifs) |
| Prompt IA | `{"agriculture": "0", "eau": "1", ...}` (objet 0/1 string) |
| Objet pays final | `{"agriculture": false, "eau": true, ...}` (objet booléen) |

### 3.4 `aria_acceptance` — champ présent côté IA mais non persisté dans buildCountryFromAI

L'IA retourne `aria_acceptance` (10-90) mais `buildCountryFromAI()` ne le mappe pas dans l'objet final — la valeur est perdue.

### 3.5 `leader` — objet vs string

- Prompt IA → `{nom, titre, trait}` (objet riche)
- Objet pays final → string aplati `"titre nom"`
- PAYS_LOCAUX → string direct
- Décision à prendre : garder l'aplatissement ou migrer vers un objet `leader`

---

## 4. Interface cible pour normalizeCountry()

```ts
// Champs minimaux garantis après normalisation
interface NormalizedCountry {
  id:            string
  nom:           string
  emoji:         string           // toujours emoji, jamais 'flag'
  couleur:       string           // hex ou hsl fallback
  regime:        RegimeId         // toujours un ID valide
  terrain:       TerrainId        // toujours un ID valide
  description:   string           // toujours présent, peut être vide
  leader:        string | null    // aplati ou null
  population:    number
  tauxNatalite:  number
  tauxMortalite: number
  satisfaction:  number
  ressources:    Record<string, boolean>   // toujours objet booléen
  // Optionnels / calculés ensuite :
  aria_irl?:     number | null
  aria_current?: number | null
  coefficients?: Record<string, number>
}
```

---

## 5. Fichiers concernés

| Fichier | Rôle |
|---|---|
| `src/ariaData.js` | Sources PAYS_LOCAUX + REAL_COUNTRIES_DATA |
| `src/Dashboard_p1.jsx` | `buildCountryFromAI()`, `buildCountryFromLocal()`, `normalizeRealCountryTemplate()` |
| `src/InitScreen.jsx` | `buildCountryPrompt()`, `searchDefautCountry()`, `rcDefautData` |
