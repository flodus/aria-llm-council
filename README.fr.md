Voici la version française complète et optimisée pour ton fichier README.fr.md. Elle intègre toutes nos dernières discussions : le relief par paliers, le registre dynamique, et bien sûr la référence à Karpathy.

ARIA — Architecture de Raisonnement Institutionnel par l'IA
"Et si les politiques d'un pays étaient soumises au peuple par l'intermédiaire d'un conseil des ministres piloté par l'IA ?"

<div align="center">

</div>

🌍 Qu'est-ce qu'ARIA ?
ARIA est une simulation de gouvernance systémique. Le joueur incarne le peuple souverain face à un conseil de ministres incarnés par des modèles de langage (LLMs). Chaque cycle, les ministres délibèrent, une instance de synthèse arbitre les positions divergentes, et le joueur tranche par référendum.

C'est une expérience de pensée interactive sur la gouvernance algorithmique, explorant la co-décision humain/IA au sein d'un moteur de monde généré de manière procédurale.

💡 Inspiration & Crédits
Le concept d'orchestration d'agents d'ARIA est une extension interactive et géopolitique du projet llm-council d'Andrej Karpathy. Alors que le projet original explore la délibération entre agents pour résoudre des problèmes logiques, ARIA transpose cette architecture à la simulation politique et à la gestion de crise à l'échelle d'une nation.

🚀 Fonctionnalités Clés
🧠 Orchestration Multi-Agents
Sélecteur Multi-LLM : Changez dynamiquement de moteur d'IA (Claude 3.5, Gemini 2.0, Grok-3, GPT-4o).

Constitution Personnalisée : Configurez le nombre de ministères, leurs traits de personnalité (prompts) et assignez des LLMs spécifiques à chaque rôle avant de lancer la simulation.

Synthèse Hiérarchisée : Une instance dédiée (Le Phare) compile les débats pour proposer une direction claire au joueur.

🗺️ Moteur de Rendu Cartographique
Topographie par paliers : Visualisation du relief par strates d'altitude avec ombres portées, simulant une carte tactique holographique de type "Paper-craft".

Géométrie Procédurale : Un globe et un planisphère basés sur un algorithme de "Jittered Grid" pour un rendu Low-Poly esthétique et performant.

Transition Fluide : Morphing temps réel entre la projection planisphère (Robinson) et la vue Globe 3D.

⚙️ Agilité Technique
Registre LLM Dynamique : ARIA récupère ses configurations de modèles via un registre JSON distant. Les nouveaux modèles sont intégrés sans mise à jour du code.

Local-First : Vos clés API et vos données de simulation restent exclusivement dans votre navigateur (localStorage).

🛠️ Stack Technique
Cœur : React 19 + Vite

Graphismes : Moteur Canvas 2D/3D sur mesure (Topographie Layered & Projections cartographiques).

Intelligence : Intégration modulaire des APIs Anthropic, Google Gemini, xAI (Grok) et OpenAI.

Déploiement : GitHub Pages avec intégration continue.

🌐 Démo Live
Lancer la simulation ARIA

🇺🇸 English Version
For the English documentation, please refer to README.md.

⚖️ Licence
Distribué sous licence MIT. Voir LICENSE pour plus d'informations.
