# DEEPSEEK — Brief Chantier 1 : questionService.js
## Projet ARIA — React 19 + Vite, GitHub Pages

---

## Contexte du projet

ARIA est une simulation de gouvernance multi-LLM. Un conseil de ministres IA délibère sur des questions soumises par le joueur. Il existe deux modes :
- **Mode IA** (`ia_mode !== 'none'`) : l'IA génère les réponses via API (Claude, Gemini…)
- **Mode Board Game** (`ia_mode === 'none'`) : tout est local, réponses pré-écrites, zéro API

L'objectif de ce chantier est de **sortir les questions hardcodées** des fichiers moteur et de les servir depuis un JSON dédié via un service modulaire.

---

## Structure du projet (extraits pertinents)

```
src/
  ariaI18n.js                  ← loadLang() → 'fr' | 'en'
  Dashboard_p1.jsx             ← callAI(), getOptions(), getLocalResponse()
  Dashboard_p3.jsx             ← handleSubmitQuestion(question, ministryId)
  features/
    chronolog/
      useChronolog.js          ← useChronolog() → { pushEvent, getCycles, ... }
    council/
      services/
        routingEngine.js       ← routeQuestion(question, forceMinistryId)
  shared/
    services/
      boardgame/               ← DOSSIER CIBLE (créer questionService.js ici)
      llm/
        providerManager.js

templates/
  base_agents.json             ← { presidency, ministers, ministries[] }
  base_agents_en.json
  aria_questions.json          ← À COPIER depuis pour_integration/ (voir ci-dessous)
```

---

## Ce qu'il faut faire — 4 étapes dans l'ordre

### Étape 1 — Copier le fichier JSON

```bash
cp pour_integration/Questions-Réponses/aria_questions.json templates/aria_questions.json
```

> ⚠️ Utiliser le fichier `aria_questions.json` fourni dans ce brief (version fusionnée v1.1, 212 questions), pas l'ancien.

### Étape 2 — Créer `src/shared/services/boardgame/questionService.js`

Coller exactement ce code :

```javascript
// src/shared/services/boardgame/questionService.js
// ═══════════════════════════════════════════════════════════════════════════
//  questionService — Questions de délibération pour le mode Board Game
//  Sources  : templates/aria_questions.json (par_ministere + pool_transversal)
//  Anti-doublon : lit aria_chronolog_cycles dans localStorage
//  i18n     : charge _en.json si disponible, fallback FR
// ═══════════════════════════════════════════════════════════════════════════

import QUESTIONS_FR from '../../../templates/aria_questions.json';
import { loadLang } from '../../../ariaI18n';

const FALLBACK_QUESTIONS = [
  "Faut-il réformer le système judiciaire en profondeur ?",
  "Comment réduire les inégalités économiques sans freiner la croissance ?",
  "La sécurité nationale justifie-t-elle des restrictions de liberté ?",
  "Faut-il accélérer la transition écologique malgré le coût social ?",
  "L'éducation publique doit-elle rester gratuite à tous les niveaux ?",
];

const LS_KEY = 'aria_chronolog_cycles';

function loadQuestions() {
  try {
    // Quand aria_questions_en.json sera créé, ajouter ici :
    // if (loadLang() === 'en') { try { return QUESTIONS_EN; } catch {} }
    return QUESTIONS_FR;
  } catch {
    return null;
  }
}

function getDejaPosees(countryId = null) {
  try {
    const cycles = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    return cycles
      .flatMap(c => c.events || [])
      .filter(e => e.type === 'vote' && (!countryId || e.countryId === countryId))
      .map(e => e.question)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function filterDoublons(questions, dejaPosees) {
  if (!dejaPosees.length) return questions;
  const filtered = questions.filter(q => !dejaPosees.includes(q));
  return filtered.length > 0 ? filtered : questions; // reset si tout épuisé
}

function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pioche une question pour un ministère donné.
 * @param {string} ministryId  ex: 'justice', 'economie', 'industrie'
 * @param {string|null} countryId  pour l'anti-doublon par pays
 * @returns {string|null}
 */
export function getQuestionForMinistry(ministryId, countryId = null) {
  const data = loadQuestions();
  const pool = data?.par_ministere?.[ministryId]?.questions || [];
  if (!pool.length) return pickRandom(FALLBACK_QUESTIONS);
  return pickRandom(filterDoublons(pool, getDejaPosees(countryId)));
}

/**
 * Pioche une question transversale.
 * @param {string|null} categorie  'quotidien'|'crise_et_peur'|'ideologique'|'anomalie_et_scifi'|null
 * @param {string|null} countryId
 * @returns {string|null}
 */
export function getTransversalQuestion(categorie = null, countryId = null) {
  const data = loadQuestions();
  const transversal = data?.pool_transversal;
  if (!transversal) return pickRandom(FALLBACK_QUESTIONS);

  const categories = ['quotidien', 'crise_et_peur', 'ideologique', 'anomalie_et_scifi'];
  const cat = (categorie && categories.includes(categorie))
    ? categorie
    : pickRandom(categories);

  const pool = transversal[cat]?.questions || [];
  if (!pool.length) return pickRandom(FALLBACK_QUESTIONS);
  return pickRandom(filterDoublons(pool, getDejaPosees(countryId)));
}

/**
 * Pioche une question aléatoire toutes catégories confondues.
 * @param {string|null} countryId
 * @returns {string|null}
 */
export function getRandomQuestion(countryId = null) {
  const data = loadQuestions();
  if (!data) return pickRandom(FALLBACK_QUESTIONS);

  const toutes = [
    ...Object.values(data.par_ministere || {}).flatMap(m => m.questions || []),
    ...Object.values(data.pool_transversal || {}).flatMap(c => c.questions || []),
  ];

  if (!toutes.length) return pickRandom(FALLBACK_QUESTIONS);
  return pickRandom(filterDoublons(toutes, getDejaPosees(countryId)));
}

/**
 * Retourne toutes les questions d'un ministère (pour affichage liste ou debug).
 * @param {string} ministryId
 * @returns {string[]}
 */
export function getAllQuestionsForMinistry(ministryId) {
  const data = loadQuestions();
  return data?.par_ministere?.[ministryId]?.questions || [];
}
```

### Étape 3 — Nettoyer `templates/base_agents.json` et `base_agents_en.json`

Supprimer le champ `questions` dans chaque ministère (remplacé par `aria_questions.json`) :

```bash
# Vérifier d'abord la structure
cat templates/base_agents.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(list(d.keys()))"
# Doit afficher : ['presidency', 'ministers', 'ministries']

# Supprimer le champ questions de chaque ministère
jq 'del(.ministries[].questions)' templates/base_agents.json > tmp.json && mv tmp.json templates/base_agents.json
jq 'del(.ministries[].questions)' templates/base_agents_en.json > tmp.json && mv tmp.json templates/base_agents_en.json

# Vérifier que questions a disparu
cat templates/base_agents.json | python3 -c "import json,sys; d=json.load(sys.stdin); [print(m.get('id'), 'questions' in m) for m in d['ministries']]"
# Doit afficher False pour chaque ministère
```

### Étape 4 — Ajouter le bouton suggestion dans Dashboard_p3.jsx

Le service ne se branche PAS dans `handleSubmitQuestion` (c'est le déclencheur de délibération — ne pas toucher).

Il se branche dans l'**interface de saisie** existante, là où le joueur tape sa question. Chercher dans `Dashboard_p3.jsx` le bloc qui contient le `<textarea>` ou `<input>` de saisie de question, et ajouter un bouton "💡 Suggestion" qui appelle `getRandomQuestion`.

```javascript
// Import à ajouter en tête de Dashboard_p3.jsx
import { getQuestionForMinistry, getRandomQuestion } from './shared/services/boardgame/questionService';

// Dans l'options getOptions() de Dashboard_p1, ia_mode === 'none' = Board Game
// Utilisation dans le rendu (à adapter selon le composant de saisie existant) :
const isBoardGame = getOptions().ia_mode === 'none';

// Bouton à ajouter près du champ de saisie :
{isBoardGame && (
  <button onClick={() => setQuestionInput(getRandomQuestion(selectedCountry?.id))}>
    💡 Suggestion
  </button>
)}
```

> ⚠️ Ne pas créer de nouveau composant `CouncilFreeQuestion.jsx` — ajouter directement dans le composant existant.

---

## Règles absolues pour ce chantier

1. **Ne pas toucher** : `llmCouncilEngine.js`, `ariaData.js`, `ariaTheme.js`, `routingEngine.js`
2. **Ne pas toucher** : `handleSubmitQuestion` dans `Dashboard_p3.jsx`
3. **Commentaires en français** dans le code
4. **Pas de TypeScript**, pas de CSS modules, pas de fichiers `.css` séparés
5. **Un seul commit** à la fin : `feat: questionService + nettoyage base_agents questions`
6. Branche : `feature/question-service`

---

## Validation

```bash
npm run build  # doit passer sans erreur
# Test manuel Board Game :
# 1. Passer en mode Board Game dans Settings
# 2. Lancer une partie
# 3. Cliquer sur le bouton Suggestion → une question doit apparaître
# 4. Vérifier que la même question ne revient pas au cycle suivant (anti-doublon)
```

---

## Fichiers touchés résumé

| Fichier | Action |
|---|---|
| `templates/aria_questions.json` | CRÉER (copie depuis pour_integration/) |
| `src/shared/services/boardgame/questionService.js` | CRÉER |
| `templates/base_agents.json` | MODIFIER — supprimer champ questions[] |
| `templates/base_agents_en.json` | MODIFIER — supprimer champ questions[] |
| `src/Dashboard_p3.jsx` | MODIFIER — ajouter bouton suggestion (mini patch) |

**Fichiers NON touchés** : tout le reste.
