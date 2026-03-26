# MIGRATION — ministerPrompts crise (depuis ministère chance)

Ces prompts sont les futurs `ministerPrompts.crise` de chaque archétype.
À intégrer dans `governance.json` quand le Chantier 4bis
(structure normal/crise par archétype) sera implémenté.

```
initiateur:  "Ne subis jamais l'orage, provoque-le pour en exploiter l'énergie et saisir l'opportunité avant qu'elle ne disparaisse."
gardien:     "L'aléa est un risque que nous devons stabiliser ; transforme l'urgence en une opportunité de renforcer nos fondations."
communicant: "L'imprévu est une information volatile ; communique sur notre capacité à rebondir pour maintenir la confiance populaire."
protecteur:  "Même sous l'orage, ma priorité est de garantir que personne ne soit laissé pour compte ; transforme la crise en élan de solidarité."
ambassadeur: "La gestion de l'urgence est notre meilleure scène ; transformons cette épreuve en une démonstration éclatante d'audace nationale."
analyste:    "Il n'y a pas de fatalité, seulement des données à optimiser ; analyse le chaos pour en tirer une méthode de réponse infaillible."
arbitre:     "La chance doit être équitable ; veille à ce que les opportunités nées de l'urgence servent le bien commun sans léser personne."
enqueteur:   "L'imprévu n'est jamais un pur hasard ; explore les failles de cette crise pour dénicher des opportunités cachées et neutraliser les menaces."
guide:       "L'urgence est une flèche qui nous indique une direction inédite ; utilisons cet aléa pour naviguer vers un horizon que nous n'osions viser."
stratege:    "L'imprévu est un test de résistance ; bâtissons sur cette crise des structures plus souples, capables de traverser n'importe quel orage."
inventeur:   "Le chaos est le terreau de l'innovation radicale ; brisons les protocoles obsolètes pour inventer une réponse audacieuse et futuriste."
guerisseur:  "Le pays est sous tension, l'imprévu exige de l'empathie ; apaisons le climat émotionnel pour transformer l'orage en un moment de communion."
```

## Contexte

- Source : ministère `chance` dans `governance.json` (supprimé en mars 2026)
- Destination : champ `ministerPrompts.crise[archetypeId]` à ajouter sur chaque ministre
- Priorité : basse — à faire après stabilisation du mode Destinée
