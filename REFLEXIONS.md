# REFLEXIONS — ARIA

Fichier de capture des idées de fond, questions de design et directions futures.
Ne pas implémenter sans Assess complet.

---

## Philosophie fondatrice

> "Aucun choix n'est irréversible. Le joueur voit toujours où il est,
> sait toujours où aller pour changer d'avis. Il ne se perd jamais
> dans des choix d'options différentes. Le codeur n'a pas à réinventer
> la roue ou trouver une aiguille dans une botte de foin.
> La simplicité est dans les JSON pour le codeur,
> dans l'interface pour le joueur."

---

## Pistes V2 / Backend

### Éditeur de données pays (piste V2 — nécessite backend)

Contexte : les données pays (ariaData.js, base_stats.json) sont hardcodées.
Quand les données réelles changent (nouveau régime, nouveau leader, etc.),
la mise à jour est manuelle dans le code.

Contrainte web : même en clone local, le navigateur ne peut pas écrire dans
src/templates/ — Vite bundle les JSON au build, ce ne sont pas des fichiers
accessibles au runtime. Impossible depuis le browser dans tous les cas.

Deux voies si ARIA évolue :

1. Backend Express (hébergement avec serveur)
   POST /api/update-country → écrase le JSON sur le disque.
   Formulaire ingame → fetch() → mise à jour visible par tous les joueurs.
   Deux routes suffisent (lecture + écriture).

2. Script Node standalone (utilisateurs qui clonent)
   scripts/edit-country.js — lit un JSON patch en argument, met à jour
   ariaData.js directement en terminal. Pas de formulaire, pas de serveur.
   Résout le problème "la France a changé en 2035" sans infrastructure.

Question ouverte : ARIA reste-t-il local-first pur, ou prend-il un backend ?
C'est cette décision qui détermine laquelle des deux voies implémenter.

Statut : réflexion. Aucune action avant décision architecture backend.

---

## ADD ↔ Agents ARIA

**Idée** : Enrichir les prompts de délibération avec la philosophie ADD.
- Phare → posture Assess/Decide (vision, exploration des possibilités)
- Boussole → posture Decide/ancrage (prudence, continuité, vérifier que la décision est fondée)
- Synthèse présidentielle → transition Decide→Do (transformer le débat en décision actionnable)

**Questions ouvertes avant implémentation** :
- Visible ou invisible au joueur ? (mécanique de jeu vs enrichissement silencieux)
- Statique ou dynamique ? (posture fixe par agent vs posture qui évolue selon le cycle)
- Touche llmCouncilEngine.js + base_agents.json — fichiers à risque

**Note Claude** : La Boussole telle qu'elle est codée ressemble davantage à un ancrage Decide qu'à un Do pur — elle vérifie que la décision est fondée avant engagement, elle ne l'exécute pas. Si on aligne les postures ADD sur les agents, il vaut mieux ne pas forcer Do sur la Boussole au risque de tordre son rôle narratif. La version dynamique (posture qui évolue selon le contexte du cycle) serait la plus cohérente avec ADD, mais c'est un chantier significatif qui mériterait sa propre session d'Assess.

---

## Mode Démo / Attracteur

Idée : un mode autonome pour les démos et présentations.
- Cycles automatiques avec intervalle configurable
- Questions de délibération générées automatiquement
- Vote aléatoire ou pondéré selon la satisfaction du pays
- Récap fin de cycle qui se valide automatiquement après X secondes (countdown visible)
- Événements narratifs IA actifs
- Pas d'interaction requise — le monde tourne tout seul

Briques existantes : `aria_options.gameplay.cycles_auto` + `cycles_interval` + `events_ia` + `doCycle()` + modal récap
Manque : auto-question, auto-vote, auto-validation récap, accélération animations
Complexité : moyenne — s'appuie sur l'infrastructure existante

Emplacement dans Settings : à définir lors de la refonte — candidat naturel
une section "MODES D'EXPÉRIENCE" qui regroupe Board Game Mode + Mode Démo
(les deux changent fondamentalement l'interaction avec ARIA)

⚠️ ATTENTION : ne pas implémenter avant que la refonte Settings soit validée

**Compte à rebours** :
- Settings : grande horloge/timer entre le bouton Sauvegarder et le bouton Mode Démo
  (visible uniquement quand le mode démo est actif)
- Header Dashboard : "⏱ Xs" à côté du numéro de cycle, décompte en live
- État partagé : `aria_options.gameplay.cycles_interval`

---

## Questions de délibération contextualisées (mode en ligne)

Idée : proposer des questions réelles et actuelles comme sujets de délibération.

- Pays réel : puiser dans les questions récentes de l'assemblée/parlement
  du pays concerné (ex: France → Assemblée Nationale, questions des
  dernières semaines)
- Pays fictif : melting pot de questions issues de plusieurs pays réels,
  mélangées et reformulées pour un contexte fictif
- Filtre anti-doublon : ne jamais reproposer une question qui a déjà fait
  l'objet d'un conseil dans la partie en cours (vérification via chronolog)

Briques existantes : chronolog ✅ · triple_combo / contextOverride ✅ · callAI() ✅
Manque : source de données questions parlementaires · moteur de suggestion · filtre chronolog
Complexité : haute — dépend d'une source de données externe fiable

Sources RSS identifiées :
- 🇫🇷 Assemblée Nationale → feeds.assemblee-nationale.fr
- 🇪🇺 Parlement Européen → flux RSS officiel
- 🇬🇧 UK Parliament → feeds.parliament.uk
- 🇩🇪 Bundestag → flux RSS disponible
- 🇨🇦 Parlement canadien → flux RSS disponible

Flux technique envisagé :
1. Au lancement conseil → fetch(flux_RSS_pays)
2. Parser XML → extraire titres/sujets questions récentes
3. Envoyer à l'IA → reformuler en questions de délibération ARIA
4. Filtrer via chronolog → exclure questions déjà débattues
5. Proposer au joueur

⚠️ Limite CORS : flux RSS pas toujours accessibles depuis navigateur directement
→ server.js comme proxy naturel — raison supplémentaire de le conserver

⚠️ ATTENTION : Assess dédié requis — source de données + proxy à identifier en premier

---

## Sauvegarde & Checkpoints

Idée : permettre au joueur de sauvegarder l'état complet d'une partie
à un moment précis et de le recharger plus tard.

- Checkpoint manuel : bouton "Sauvegarder ce moment" dans le dashboard
- Checkpoint auto : sauvegarde automatique à chaque fin de cycle
- Chargement : liste des checkpoints avec date, cycle, nom du monde
- Contenu d'un checkpoint : seed + état pays + chronolog + constitution + alliances
- Lien avec "Recommencer l'histoire" : un checkpoint cycle 0 = état initial

Briques existantes : seed déterministe ✅ · aria_session_world ✅
Manque : UI sauvegarde/chargement · format checkpoint · gestion multi-slots
Complexité : moyenne-haute

⚠️ ATTENTION : ne pas implémenter avant Assess dédié

---

## Droits fondamentaux / Constitution humaine

_(à développer)_

---

## Restructuration ministères + Destinée du Monde

### Changements ministères ✅ LIVRÉ (2026-03-22)
- Ministère "Chance et Imprévu" → remplacé par "Industrie et Infrastructures" dans `governance.json`
- `ministerPrompts.crise` par archétype → préservés dans `MIGRATION_NOTES.md` pour intégration future
- Routage par keywords opérationnel — `detectCrisis()` + `getBestMatch()`

### Mode Destinée ✅ LIVRÉ (2026-03-22)
- Oracle (👁️) et Wyrd (🕸️) dans `ministers{}`, bloc racine `destin` séparé de `ministries[]`
- Toggle `destiny_mode` dans Constitution + Settings (distinct de `crisis_mode`)
- `runDestinPhase()` → AI ou fallback `aria_reponses.json` · résultat injecté dans synthèse présidence
- Questions existentielles dans `aria_questions.json` par_ministere.destin

### Ce qui reste (rendu UI)
- Afficher le bloc `destin: { oracle, wyrd }` dans `LLMCouncil.jsx` quand présent
  (le résultat existe dans le retour de `runCouncilDeliberation` — seul l'affichage manque)
- `ministerPrompts.crise` par archétype à intégrer dans `governance.json` (voir MIGRATION_NOTES.md)

---

## ariaQA — Fichier questions/réponses hardcodées

Idée : un fichier dédié `aria_qa.json` (+ `aria_qa_en.json`) séparé de `ariaData.js`.

Structure cible :
```json
{
  "justice": {
    "questions": ["Faut-il réformer le système judiciaire ?", "..."],
    "reponses": {
      "arbitre":   ["réponse A", "réponse B", "réponse C"],
      "enqueteur": ["réponse A", "réponse B", "réponse C"]
    }
  }
}
```


Mécanique anti-répétition :
- Pool de N réponses par ministre par question
- Pioche aléatoire avec exclusion des dernières utilisées (via chronolog)
- Variantes selon le régime du pays (arbitre en démocratie ≠ arbitre en junte)

Board Game en offline :
- keywords (déjà dans gemini.json) routent vers le bon ministère
- Pool de réponses hardcodées s'affiche
- Le joueur choisit ou modifie librement

Chargement :
- Fichier local en fallback
- Ou depuis Gist (comme llm-registry.json) pour mise à jour sans redéploiement

Lien avec :
- gemini.json (keywords + questions déjà ébauchés)
- chronolog (filtre anti-doublon)
- normalizeCountry() (variantes par régime)

⚠️ Assess dédié requis avant implémentation
⚠️ À faire après intégration gemini.json dans base_agents.json

---

## Système de poids ministériels — V-future

Mécanique de convergence/divergence narrative pour le mode Board Game offline.
Née de la discussion sur aria_syntheses.json (2026-03-20).

### Principe

Chaque ministre commence avec un poids de `1`.
Le poids évolue dynamiquement selon le régime actif, le contexte géopolitique
et les votes citoyens passés.

Exemples de modificateurs :
- Junte militaire → initiateur `+3`, écologie `-3`
- Temps de guerre → initiateur `+5`
- Vote citoyen favorable → ministre porteur `+1`

### V1 — Matrice postures simple (implémentée dans responseService.js)
```
radical   + radical   → convergence
prudent   + prudent   → convergence
statu_quo + statu_quo → convergence
prudent   + statu_quo → convergence (tension faible)
radical   + prudent   → divergence
radical   + statu_quo → divergence
```

### V-future — Poids + régime + contexte

Sur un même ministère, si les deux postures donnent "convergence" mais que
les poids diffèrent → l'avis du ministre au poids le plus élevé l'emporte
et oriente la synthèse vers sa posture.

Modificateurs régime (exemples à affiner) :
- `junte_militaire` : initiateur/stratege/protecteur `+3` · ecologie/guide `-3`
- `technocratie_ia` : analyste/inventeur `+3` · communicant `-1`
- `theocracie` : guide/guerisseur `+3` · inventeur `-2`
- `democratie_liberale` : communicant/arbitre `+2` · stratege `-1`
- `oligarchie` : gardien/analyste `+3` · guerisseur/ecologie `-2`

Modificateurs contexte (exemples) :
- Guerre déclarée → initiateur/protecteur/stratege `+5`
- Crise sanitaire → guerisseur/gardien `+4`
- Effondrement économique → gardien/analyste `+3`
- Satisfaction < 30% (mode crise) → calcul coalition :
  somme des poids convergents vs somme des poids divergents
  → la coalition la plus lourde gagne, sa synthèse s'impose

### Règle de convergence présidentielle (V1)

Phare et Boussole ont chacun un pool de styles contextuels.
Si les deux piochent dans le même type de pool → convergence.
Si les pools sont opposés (action vs prudence) → divergence.

### Fichiers impactés (quand on implémentera)

- `responseService.js` → calcul poids + règle convergence
- `base_agents.json` → table des modificateurs par régime
- `aria_syntheses.json` → pools synthèse par ministère × régime × état
- Moteur de cycle → événements qui modifient les poids en temps réel
- Constitution → possible override de poids par pays

⚠️ Assess dédié requis avant implémentation
⚠️ Ne pas toucher deliberationEngine.js sans cette session

---

## Nouvelle partie vs Hard reset — table de vérité (décidé 2026-03-26)

| Donnée | Nouvelle partie | Hard reset |
|---|---|---|
| Cycles + historique | ✓ effacé | ✓ effacé |
| Pays + alliances + constitutions pays | ✓ effacé | ✓ effacé |
| `aria_options` (vision du monde) | ✗ conservé | ✓ effacé |
| Clés API | ✗ conservé | ✓ effacé |
| Seed / monde | ✗ conservé | ✓ effacé |
| Préférences modèles IA | ✗ conservé | ✓ effacé |
| Langue | ✗ conservé | ✓ effacé |

`clearSession()` efface uniquement la première colonne.
Au lancement d'une nouvelle partie, Init affiche `aria_options` actuel pré-rempli — le joueur peut modifier ou continuer.

---

## Mode collégial + Mode crise — spec moteur (Decide requis — 2026-03-26)

### B10 — Mode collégial

`runPresidencePhase()` s'exécute inconditionnellement dans `deliberationEngine.js`.
Quand `activePres = []` (mode collégial ✡), cette phase doit être court-circuitée.
La synthèse finale = issue du vote des 12 ministres directement, pas d'arbitrage présidentiel.

**Question ouverte** : faut-il un pool JSON de synthèses collégiales pour le board game,
ou un prompt IA suffisant ? À décider en session dédiée avant de toucher `deliberationEngine.js`.

### B11 — Mode crise

En mode crise, tous les ministres répondent directement.
`runCerclePhase` (annotations inter-ministérielles) et `runPresidencePhase` doivent être skippées.
Résultat : synthèse ministérielle de crise tous-ministres.

⚠️ Les deux touchent `deliberationEngine.js` — ne pas implémenter sans spec validée.

---

## Conventions UI

### Accordéons

> "Accordéons : fermés par défaut, sans exception, partout.
> Le joueur ouvre ce dont il a besoin.
> On ne décide jamais pour lui ce qui est important."
