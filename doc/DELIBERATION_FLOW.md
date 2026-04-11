# DÉLIBÉRATION DU CONSEIL — Pipeline ARIA

> Fichiers clés : `src/features/council/hooks/useCouncilSession.js` · `src/features/council/services/deliberationEngine.js`

---

## Vue d'ensemble

Chaque question soumise au Conseil traverse jusqu'à 5 phases séquentielles.
Le flow est déclenché par `useCouncilSession.launchCouncil()` et produit un état
final `session.voteReady = true` qui débloque le vote du peuple.

```
Question
  │
  ▼
[0] ROUTING ──────────── routeQuestion() → ministryId (ou null = orpheline)
  │
  ├─[CRISE]──────────── runCrisisPhase() ──► voteReady   (skip phases 1-4)
  │
  ▼
[1] MINISTÈRE ─────────── runMinisterePhase()
  │                          └─ 2 ministres délibèrent en parallèle (IA ou local)
  │                          └─ synthèse ministérielle
  ▼
[2] CERCLE ────────────── runCerclePhase()
  │                          └─ tous les autres ministères annotent (en parallèle)
  │
  ├─[DESTIN actif]────── runDestinPhase()     (si destiny_mode === true)
  │                          └─ Oracle + Wyrd s'expriment
  ▼
[3] PRÉSIDENCE ──────────── runPresidencePhase()
  │                          ├─ [N présidents ≥ 1] → Phare, Boussole, Trinaire...
  │                          └─ [0 présidents] → _runCollegialPhase() (vote collectif)
  ▼
voteReady — le peuple vote OUI / NON
```

---

## Phase 0 — Routing

**Fichier :** `useCouncilSession.js`
**Fonction :** `routeQuestion(question, ministryId)`

- Si `ministryId` fourni explicitement (pill ou liste) → utilisé tel quel.
- Sinon : matching par keywords → retourne l'id du ministère le plus pertinent.
- Si aucun match (garbage question) → `ministry = null` → question **orpheline**.

**Question orpheline :** toutes les phases reçoivent `ministry === null` et produisent
des réponses bureaucratiques de fallback (Agent Δ-1, Agent Δ-2, ICI).

---

## Phase CRISE (bypass)

**Fichier :** `deliberationEngine.js` · `runCrisisPhase(question, country)`

Déclenché si `crisis_mode !== false` **et** `detectCrisis(question)` retourne `true`.

- Lance `runMinisterePhase()` en parallèle pour **tous** les ministères.
- Skip phases CERCLE, DESTIN, PRÉSIDENCE.
- Produit `{ crisis: true, ministries: [...] }` → voteReady directement.

> **≠ Mode Destin** — le mode crise porte sur le format de la délibération (tous les
> ministères répondent en direct, sans cercle). Le mode Destin porte sur la présence
> d'agents spirituels (Oracle/Wyrd) avant la synthèse présidentielle.

---

## Phase 1 — Ministère

**Fichier :** `deliberationEngine.js` · `runMinisterePhase(ministry, question, country)`

**Input :** objet `ministry` (depuis `base_agents.json`), `question`, `country`
**Output :** `{ ministryId, ministryName, ministryEmoji, ministryColor, ministerA, ministerB, synthese, isOrphan? }`

1. Prépare les prompts pour les 2 ministres du ministère (ministerA, ministerB).
2. Lance les 2 appels IA en parallèle (`Promise.all`).
3. Fallback local si IA indisponible : `localMinisterFallback()` depuis `fallbacks.js`.
4. Lance la synthèse ministérielle (`buildSyntheseMinisterePrompt`).
5. Fallback synthèse : `localSyntheseFallback()`.

**Format réponse ministre :**
```json
{ "position": "2-3 phrases argumentées", "mot_cle": "1 mot résumant l'angle" }
```

**Format synthèse ministère :**
```json
{ "convergence": true, "synthese": "...", "tension_residuelle": null, "recommandation": "..." }
```

---

## Phase 2 — Cercle

**Fichier :** `deliberationEngine.js` · `runCerclePhase(targetMinistryId, question, synthese, country)`

**Input :** id du ministère principal, la question, la synthèse de phase 1, le pays
**Output :** `Array<{ ministryId, ministryName, ministryEmoji, ministryColor, annotation }>`

- Tous les ministères **sauf** le rapporteur annotent en parallèle.
- Chaque annotation = 1-2 phrases depuis l'angle propre au ministère.
- Fallback local : `localAnnotationFallback()` depuis `fallbacks.js`.

**Format réponse annotation :**
```json
{ "annotation": "1-2 phrases, ton sobre, angle spécifique au ministère" }
```

---

## Phase DESTIN (optionnelle)

**Fichier :** `deliberationEngine.js` · `runDestinPhase(question, country, crisisPrompts)`

**Condition :** `gov.destiny_mode === true` (réglé dans la gouvernance du pays).
**Output :** `{ oracle: { position, ... }, wyrd: { position, ... } }`

- Oracle et Wyrd répondent en parallèle (vision prophétique vs destin inéluctable).
- Injectés dans la phase Présidence via le paramètre `destinVoices`.
- Fallback local : `localMinisterFallback('oracle' | 'wyrd', ...)`.

> Oracle et Wyrd ne sont **pas** des ministères — ils vivent dans le bloc `destiny`
> de `base_agents.json`, pas dans `ministries[]`.

---

## Phase 3 — Présidence

**Fichier :** `deliberationEngine.js` · `runPresidencePhase(question, ministereResult, cercleAnnotations, country, destinVoices)`

**Input :** résultats de toutes les phases précédentes
**Output :** `{ phare?, boussole?, presidents, synthese, collegial? }`

### Cas N présidents ≥ 1 (mode normal)

- Lance N appels IA en parallèle (1 par président actif).
- ANGLES rhétoriques attribués selon la position (0 = vision, 1 = mémoire, 2+ = singulier).
- Fallback déterministe si IA indisponible : texte généré depuis satisfaction + question hash.
- Synthèse présidentielle : `buildSynthesePresidencePrompt()` + normalisation.

**Format réponse président :**
```json
{ "position": "2-3 phrases", "decision": "1 phrase — décision recommandée" }
```

**Format synthèse présidence :**
```json
{
  "convergence": true,
  "synthese": "...",
  "question_referendum": "Proposition OUI/NON soumise au peuple",
  "enjeu_principal": "..."
}
```

### Cas 0 présidents (mode collégial)

→ `_runCollegialPhase()` — synthèse constitutionnelle collective.
- Pas de Phare ni Boussole : le Conseil délibère sans arbitre.
- Vote de type `referendum` (OUI adopter / NON rejeter).
- Fallback : `getSyntheseCollegial()` depuis `responseService.js`.

---

## Providers IA utilisés par phase

| Phase | Type d'appel | Modèle préféré |
|-------|-------------|----------------|
| Ministère (×2) | `callAI(p, 'council_ministre')` | Claude ou Gemini |
| Synthèse ministère | `callAI(p, 'council_synthese_min')` | Claude ou Gemini |
| Cercle (×N) | `callAI(p, 'council_annotation')` | Claude ou Gemini |
| Oracle | `callAI(p, 'council_oracle')` | Claude ou Gemini |
| Wyrd | `callAI(p, 'council_wyrd')` | Claude ou Gemini |
| Président (×N) | `callAI(p, 'council_pres_{id}')` | Claude ou Gemini |
| Présidence synthèse | `callAI(p, 'council_synthese_pres')` | Claude ou Gemini |
| Mode collégial | `callAI(p, 'council_collegial')` | Claude ou Gemini |

Grok et OpenAI sont configurés dans l'UI mais pas encore câblés dans `callAI()` (chantier T1).

---

## Fallbacks locaux

Tous les fallbacks viennent de `src/features/council/services/fallbacks.js`
qui lit `templates/languages/{fr|en}/aria_reponses.json`.

| Situation | Fallback utilisé |
|-----------|-----------------|
| IA indisponible (ministre) | `localMinisterFallback(ministerId, question, regime)` |
| IA indisponible (synthèse) | `localSyntheseFallback(ministry, resA, resB, regime)` |
| IA indisponible (annotation) | `localAnnotationFallback(ministry, question, regime)` |
| Question orpheline | `FALLBACK_RESPONSES` (bureaucratique — ICI) |
| Mode board game | Identique aux fallbacks IA ci-dessus |

---

## Données de session (useCouncilSession)

L'état `session` est mis à jour après chaque phase :

```js
session = {
  question, ministryId, countryId, countryNom,
  ministere:  { ministerA, ministerB, synthese, ... },  // phase 1
  cercle:     [ { ministryId, annotation }, ... ],       // phase 2
  destin:     { oracle, wyrd },                          // phase DESTIN
  presidence: { phare, boussole, synthese, voteType },   // phase 3
  crisis:     { crisis: true, ministries: [...] },       // mode crise
  voteReady:  true                                       // débloque le vote
}
```
