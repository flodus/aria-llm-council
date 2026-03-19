# INTEGRATION_GAMEPLAY.md
## Plan d'intégration des fichiers `pour_integration/Questions-Réponses/`

> Rédigé le 2026-03-19. À reprendre à la prochaine session.

---

## Fichiers sources

| Fichier | Rôle | Statut |
|---|---|---|
| `aria_questions.json` | Pool de questions par ministère + 4 catégories transversales | Prêt |
| `aria_reponses.json` | Réponses fallback par ministre → régime → posture | Prêt |
| `ministers.json` | Métadonnées ministères : keywords, prompts, archétypes | Prêt — section `destin` à garder pour plus tard |

### Sur la section `destin` dans `ministers.json`
**Laisser dans le fichier**, ça ne nuit pas. Quand on l'implémente (mode de jeu futur), on créera un fichier séparé `aria_destin.json` avec la config du mode + le bouton radio dans Settings. Pas de rush.

---

## Architecture destination (post-refactor)

```
src/shared/services/boardgame/
  questionService.js    ← VIDE → Chantier 1
  responseService.js    ← VIDE → Chantier 3

templates/
  base_agents.json      ← keywords + industrie → Chantier 2
  aria_questions.json   ← copier depuis pour_integration/
  aria_reponses.json    ← copier depuis pour_integration/
```

---

## Chantier 1 — questionService ✅ zéro risque moteur

**Branche :** `feature/question-service`

**Ce que ça fait :** Alimenter le pool de questions in-game depuis `aria_questions.json`.

**Étapes :**
1. Copier `aria_questions.json` → `templates/aria_questions.json`
2. Implémenter `questionService.js` :
   - `getQuestionForMinistry(ministryId)` → pioche dans `par_ministere[ministryId].questions[]`
   - `getTransversalQuestion(categorie?)` → pioche dans `pool_transversal[categorie]`
   - `getRandomQuestion()` → toutes catégories mélangées
   - Anti-doublon : vérifier contre le chronolog avant de proposer
3. Brancher sur le déclencheur de délibération (à identifier dans `useGameCycle.js`)

**Fichiers touchés :** `questionService.js`, `templates/aria_questions.json`
**Fichiers NON touchés :** moteur, agents, fallbacks

> ⚠️ **Nettoyage inclus :** supprimer les champs `questions: []` hardcodés dans `templates/base_agents.json` (chaque ministère en a un — ils sont remplacés par `aria_questions.json`). Faire dans le même commit.

---

## Chantier 2 — keywords + ministère industrie dans base_agents.json

**Branche :** `feature/ministries-keywords`

**Ce que ça fait :** Enrichir les métadonnées des ministères pour le routage local + finaliser le ministère `industrie`.

**Étapes :**
1. Pour chaque ministère dans `base_agents.json`, ajouter le champ `keywords: []` depuis `ministers.json`
2. Vérifier/compléter la définition du ministère `industrie` dans `base_agents.json` :
   - Ministers : `inventeur`, `stratege`, `analyste` (3 ministres — cas particulier)
   - Missions, prompts depuis `ministers.json`
3. Mettre à jour `base_agents_en.json` en parallèle (traduction keywords si nécessaire)

**Fichiers touchés :** `templates/base_agents.json`, `templates/base_agents_en.json`
**Fichiers NON touchés :** moteur, services

---

## Chantier 3 — responseService + mécanique posture

**Branche :** `feature/response-service`

**Ce que ça fait :** Remplacer les fallbacks bureaucratiques génériques par des réponses contextualisées (régime politique du pays × posture de l'archétype).

**Nouvelle mécanique — la posture :**
La posture n'est pas configurée par le joueur. Elle est déterminée par l'archétype du ministre :

| Archétype | Posture |
|---|---|
| initiateur, inventeur | radical |
| gardien, analyste | prudent |
| communicant, guide, ambassadeur | statu_quo |
| protecteur, guerisseur | prudent |
| stratege | radical |

*(à affiner selon le feeling gameplay)*

**Étapes :**
1. Copier `aria_reponses.json` → `templates/aria_reponses.json`
2. Implémenter `responseService.js` :
   - `getPostureForMinister(ministerId)` → lookup table archétype → posture
   - `getLocalResponse(ministerId, regime, posture)` → lookup dans `aria_reponses.json`
   - Fallback : si regime absent → utiliser le fallback mappé (`_meta.fallbacks`)
   - Fallback ultime : réponse bureaucratique actuelle (conserver)
3. Modifier `fallbacks.js` : remplacer `localMinisterFallback()` par appel `responseService`
4. Le `regime` est déjà dans `country.regime` — rien à ajouter

**Fichiers touchés :** `responseService.js`, `fallbacks.js`, `templates/aria_reponses.json`
**Fichiers NON touchés :** `deliberationEngine.js`, `agentsManager.js`

---

## Chantier 4 — ministerPrompts normal/crise ⚠️ touche deliberationEngine

**Branche :** `feature/minister-prompts-crise`

**Ce que ça fait :** Adapter les prompts LLM selon si la question est une crise ou non.

**Confirmation explicite requise avant de coder.**

**Ce que ça implique :**
- `ministers.json` définit `ministerPrompts.normal` et `ministerPrompts.crise` pour chaque archétype
- `deliberationEngine.js` choisit le prompt selon le contexte de la délibération
- Il faut un signal "mode crise" dans la question ou le pays — à définir

**Étapes (à détailler au moment du chantier) :**
1. Définir comment le mode crise est signalé (flag dans la question ? état du pays ?)
2. Enrichir `base_agents.json` avec la structure `ministerPrompts.normal/crise` depuis `ministers.json`
3. Modifier `deliberationEngine.js` : choisir `ministerPrompts[mode]` selon contexte

**Fichiers touchés :** `deliberationEngine.js`, `templates/base_agents.json`

---

## Ordre recommandé

```
Chantier 1 → Chantier 2 → Chantier 3 → Chantier 4
```

Chaque chantier est indépendant et livrable séparément.
Commencer par 1 débloque le gameplay immédiatement.

---

## Hors scope (pour une session dédiée)

- **Mode Destin** (oracle + wyrd) → bouton radio dans Settings, nouveau mode de jeu
- **Mode crise — annotations off** → tous les ministères répondent sans annoter
