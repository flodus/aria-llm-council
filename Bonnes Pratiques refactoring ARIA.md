Bonnes Pratiques ARIA — Guide Complet

Ce document rassemble l’ensemble des principes, décisions d’architecture et méthodes de travail adoptées pour le projet ARIA. Il servira de référence pour les développements en cours et à venir, ainsi que d’instruction pour Claude lors des refactorisations.

---

1. Architecture Globale

1.1 Structure par features

```
src/
├── features/                # Fonctionnalités métier isolées
│   ├── council/             # Conseil des ministres, délibération
│   │   ├── components/      # UI spécifique (MinistersList, DebateView…)
│   │   ├── hooks/           # Hooks métier (useCouncilDeliberation…)
│   │   ├── services/        # Logique interne (deliberationEngine…)
│   │   ├── contexts/        # État local (CouncilContext…)
│   │   └── types/           # Types (si TypeScript) / documentation
│   │
│   ├── world/               # Nations, géopolitique, sécessions
│   │   ├── components/      # CountryPanel, NationDetails…
│   │   ├── hooks/           # useNationState, useWorldGeneration…
│   │   ├── services/        # worldEngine, crisisEngine…
│   │   ├── contexts/        # WorldContext
│   │   └── types/
│   │
│   ├── map/                  # Rendu cartographique (3 vues)
│   │   ├── views/            # GlobeView, MercatorView, WarRoomView
│   │   ├── hooks/            # useMapData, useWarRoomZoom…
│   │   ├── components/       # CountryPolygon, NeonBorder, MapControls…
│   │   └── types/
│   │
│   ├── chronolog/            # Journal d’événements et historique
│   │   ├── components/       # ChronologView, EventEntry…
│   │   ├── hooks/            # useChronolog
│   │   ├── services/         # chronologSummarizer (peut appeler LLM)
│   │   ├── contexts/         # ChronologContext
│   │   └── types/
│   │
│   ├── settings/             # Configuration utilisateur
│   │   ├── components/       # InitScreen, ConstitutionModal, SettingsPanel…
│   │   ├── hooks/            # useApiKeys, useConstitution…
│   │   ├── services/         # settingsValidator…
│   │   └── types/
│   │
│   ├── init/                  # Écran de démarrage (hors settings car dédié à la création du monde)
│   │   ├── components/        # ARIAHeader, CountryInfoCard, APIKeyInline, ContextPanel, RecapAccordion, PreLaunchScreen, CountryConfig, steps…
│   │   ├── hooks/             # useInitState, useCountryValidation, useModelRegistry…
│   │   ├── services/          # countryValidation (validation des pays réels)…
│   │   └── types/
│   │
│   └── game/                   # Orchestration du cycle de jeu
│       ├── GameProvider.jsx    # Composition des contextes
│       ├── useGameCycle.js     # Orchestrateur Question → Délibération → Vote
│       ├── gameReducer.js      # (optionnel) si l’état d’orchestration devient complexe
│       └── types/
│
├── shared/                     # Code partagé entre plusieurs features
│   ├── components/             # Composants UI génériques (Button, Modal, Toast…)
│   ├── hooks/                  # Hooks génériques (useLocalStorage, useAriaOptions…)
│   ├── utils/                  # Fonctions utilitaires pures (formatters, helpers…)
│   ├── constants/              # Constantes globales (limites, noms…)
│   ├── data/                   # Données statiques (JSON de questions, réponses, pays…)
│   ├── services/               # Services métier partagés
│   │   ├── boardgame/          # Mode hors ligne
│   │   │   ├── questionService.js
│   │   │   └── responseService.js
│   │   └── llm/                # Couche LLM unifiée
│   │       ├── providerManager.js   # Orchestration, retry, rate-limit
│   │       ├── index.js             # API publique
│   │       └── clients/             # Wrappers spécifiques
│   │           ├── claudeClient.js
│   │           ├── geminiClient.js
│   │           └── openaiClient.js
│   └── theme/                  # Design system (ariaTheme.js)
│
├── App.jsx                      # Root : charge les providers, aiguille les vues
└── main.jsx                     # Point d’entrée (inchangé)
```

1.2 Règles fondamentales

· Chaque fichier ne doit pas dépasser 300 lignes environ. Si c’est le cas, découpez-le.
· Une feature = un dossier avec tout ce qui lui est propre (UI, logique, état).
· Le partage se fait via le dossier shared/ (composants génériques, utilitaires, services transverses).

---

2. Gestion de l’État

2.1 Principe général

Chaque feature gère son propre état via un contexte dédié.
Le dossier game/ orchestre le cycle sans posséder l’état des autres features.

```jsx
// GameProvider.jsx — composition de contextes
export const GameProvider = ({ children }) => (
  <CouncilProvider>
    <WorldProvider>
      <ChronologProvider>
        {children}
      </ChronologProvider>
    </WorldProvider>
  </CouncilProvider>
);
```

```jsx
// useGameCycle.js — orchestration
export const useGameCycle = () => {
  const council = useCouncil();
  const world = useWorld();
  const chronolog = useChronolog();
  // Logique de cycle
};
```

2.2 Alternative Zustand (si nécessaire)

Si les contextes React deviennent trop lourds (re-rendus excessifs, difficultés de test), on peut introduire Zustand pour certains domaines très mutables (ex: world, map).

Création d’un store :

```jsx
import { create } from 'zustand';
export const useWorldStore = create((set) => ({
  nations: [],
  updateNation: (id, data) => set(...),
}));
```

Avantages : pas de Provider, sélecteurs intégrés, pas de re-rendus cascadés.
Adoption progressive : on commence par remplacer un contexte complexe, on garde les autres en l’état.

---

3. Services Partagés

3.1 Couche LLM (shared/services/llm/)

· providerManager.js : point d’entrée unique pour tous les appels LLM (council, chronolog, world…). Gère la sélection du provider (depuis les settings), les retries, le rate-limiting.
· clients/ : chaque client encapsule l’API spécifique (Anthropic, Google, OpenAI…) et normalise les réponses.
· index.js : exporte l’API publique (ex: callLLM(prompt, options)).

3.2 Mode Board Game / Offline (shared/services/boardgame/)

· questionService.js : puise dans les JSON de questions (aria_questions.json, chatgpt-questions.json…) et gère l’anti-doublon.
· responseService.js : fournit des réponses pré-écrites (aria_reponses.json) adaptées au régime, à la posture, etc.

Ces services sont utilisés par le moteur de délibération quand le mode “board game” est actif, et servent aussi de fallback en mode IA en cas d’erreur.

---

4. Données Statiques vs État Dynamique

Type Exemple Emplacement
Données de référence Liste des pays réels, attributs fixes shared/data/countries.js
Questions / réponses pré-écrites aria_questions.json, aria_reponses.json shared/data/
Constantes applicatives MAX_NATIONS, SEUIL_REVOLTE shared/constants/
État mutable de jeu Population, satisfaction, alliances features/world/hooks/useNationState
État UI temporaire Panneau ouvert, pays sélectionné Local dans le composant ou la feature

Règle : ne jamais modifier les données statiques directement. Les copier dans l’état si besoin.

---

5. Processus de Refactoring Progressif

5.1 Déplacer un composant (étape par étape)

1. Créer le fichier destination (ex: src/features/init/components/MonComposant.jsx).
2. Copier le code du composant depuis le fichier source.
3. Ajuster les imports dans le fichier destination :
   · Compter le nombre de niveaux jusqu’à src/ (depuis src/features/init/components/ → ../../../).
   · Remplacer les chemins relatifs en conséquence.
4. Modifier le fichier source :
   · Supprimer la définition locale du composant.
   · Ajouter l’import pointant vers le nouveau fichier (chemin relatif depuis le source).
5. Tester immédiatement (voir §5.3).

5.2 Gestion des imports – méthode infaillible

Depuis src/features/init/components/MonComposant.jsx, pour importer un fichier situé :

· À la racine de src/ (ariaI18n.js, ariaTheme.js) → '../../../ariaI18n'
· Dans src/templates/ → '../../../templates/base_agents.json'
· Dans src/features/init/services/ → '../services/…'

Astuce : compter les niveaux : components/ (1) → init/ (2) → features/ (3) → src/ → 3 ../.

5.3 Tests après chaque déplacement

· Lancer l’appli (npm run dev) et vérifier que la page concernée s’affiche correctement.
· Tester les interactions (boutons, changements de langue, etc.).
· Ouvrir la console (F12) pour détecter d’éventuelles erreurs d’import ou d’exécution.
· Si le composant utilise des données, vérifier qu’elles sont toujours présentes.

---

6. Identification et Traitement des Fonctions Orphelines

Une fonction orpheline est définie mais jamais appelée. Elle alourdit le code et nuit à la maintenabilité.

Pendant le refactor

· Ne pas s’arrêter pour les supprimer. Si une fonction orpheline fait partie d’un composant déplacé, on l’emmène avec (pour garder le code identique).
· On note les endroits suspects dans un fichier TODO.md ou mentalement.

À la fin du refactor (phase de polish)

1. Recenser toutes les fonctions orphelines (outil comme eslint-plugin-unused-imports, ou recherche manuelle).
2. Vérifier si elles ont une utilité cachée (appelées dynamiquement, ou destinées à une utilisation future).
3. Supprimer les définitions inutiles et leurs imports associés.
4. Tester pour s’assurer que rien n’a cassé.

---

7. Simplification des Template Literals Imbriqués

Les template literals imbriqués ( `texte ${condition ? `autre ${var}` : '...'}` ) sont valides en JS mais :

· Peuvent faire planter certains parseurs (Claude, linters).
· Sont difficiles à lire et à maintenir.

Quand les simplifier ?

· Idéalement pendant le refactor si on tombe dessus et que la réécriture est simple.
· Sinon, à la fin en une passe dédiée.

Comment simplifier ?

Extraire les parties complexes dans des variables intermédiaires :

```javascript
// Avant
const style = `background: ${ok ? `rgba(100,200,120,${alpha})` : `rgba(220,80,80,${alpha})`}`;

// Après
const baseCouleur = ok ? `rgba(100,200,120,${alpha})` : `rgba(220,80,80,${alpha})`;
const style = `background: ${baseCouleur}`;
```

Ou utiliser des fonctions :

```javascript
const getStatusColor = (s) => {
  if (s === 'ok') return 'rgba(100,200,120,0.85)';
  if (s === 'error') return 'rgba(220,80,80,0.85)';
  return 'rgba(90,110,160,0.40)';
};
const color = getStatusColor(s);
```

---

8. Ce qu’on peut faire dès maintenant (pendant le refactor d’arborescence)

· Déplacer les composants un par un (en suivant le processus).
· Ajuster les imports avec la méthode des ../.
· Tester après chaque déplacement.
· Noter les fonctions orphelines et les template literals complexes pour plus tard.
· Créer les dossiers vides et les fichiers .gitkeep.

---

9. Ce qu’on fera à la fin du refactor

· Ménage des fonctions orphelines (suppression systématique).
· Simplification des template literals imbriqués sur l’ensemble du code.
· Vérification de la cohérence des imports (possibilité d’utiliser des alias avec Vite).
· Optimisation des performances (mémorisation, lazy loading si pertinent).
· Écriture de tests unitaires pour les services et hooks critiques.
· Documentation finale des décisions d’architecture (ce document mis à jour).

---

10. Rappels Importants

· Ne jamais tout réécrire d’un coup – on procède par petits pas.
· Toujours tester après chaque changement – l’application doit rester fonctionnelle.
· Communiquer clairement avec Claude : fournir le code à déplacer, les chemins exacts, les instructions précises.
· Versionner régulièrement (commits atomiques) pour pouvoir revenir en arrière si besoin.
· Garder une trace de l’avancement (ce document, un TODO.md, etc.).

---

Avec ces bonnes pratiques, le projet ARIA conservera sa flexibilité et sa robustesse tout en évoluant sereinement. Merci à tous les contributeurs (humains et IA) de suivre ces principes. 🚀
