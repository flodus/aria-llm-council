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

## Droits fondamentaux / Constitution humaine

_(à développer)_
