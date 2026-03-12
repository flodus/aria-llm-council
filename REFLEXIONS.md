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
