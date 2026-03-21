# REFLEXIONS — ARIA

Fichier de capture des idées de fond, questions de design et directions futures.
Ne pas implémenter sans Assess complet.

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

### Changements ministères
- Ministère "Chance et Imprévu" → remplacé par "Industrie et Infrastructures"
  (⚙️ Capricorne–Verseau–Vierge · ministres : Stratège, Inventeur, Analyste)
- Prompts normal/crise par ministre intégrés directement dans le JSON des ministères
  (base dans gemini.json — à intégrer dans base_agents.json + base_agents_en.json)
- Routage automatique par keywords : chaque ministère a sa liste de mots-clés
  pour suggérer le bon ministère selon la question posée

### Mode Destinée
- Oracle (👁️) et Tisseur de Wyrd (🕸️) = deux agents philosophiques optionnels
- Ne remplacent pas les 12 ministres — s'y ajoutent ponctuellement
- Activés par les joueurs qui croient que le destin guide les nations
- Pas un mode crise — un mode de jeu / posture philosophique
- Comment l'intégrer ? À définir :
  - Toggle "Croire au Destin" dans la Constitution ?
  - Bouton ponctuel dans le dashboard ?
  - Remplace le bouton "Gestion de Crise" ?
- Questions Destinée : événements exceptionnels (pandémie, météorite, IA incontrôlée...)

⚠️ Assess dédié requis avant implémentation
Fichiers impactés : base_agents.json · llmCouncilEngine.js · Settings.jsx · ConstitutionModal.jsx

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
