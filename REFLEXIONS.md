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

## Droits fondamentaux / Constitution humaine

_(à développer)_
