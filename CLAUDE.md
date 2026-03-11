# CLAUDE.md — ARIA + ADD Framework

> Langue de travail : français. Toutes les réponses, explications et 
> commentaires doivent être en français.

## Commands
```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build (outputs to dist/)
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

No test suite. `base: '/aria-llm-council/'` in `vite.config.js` = hardcoded GitHub Pages path.

---

## ADD Framework

Ce projet suit le framework Assess-Decide-Do de Dragos Roua.

À chaque interaction, détecter le realm de l'utilisateur et répondre en conséquence :

| Realm | Signaux | Posture |
|-------|---------|---------|
| **Assess** 🔴+ | "et si", "options", "je réfléchis à", exploratoire | Explorer sans presser vers une décision |
| **Decide** 🟠? | "je devrais", "lequel", "priorité", comparaison | Clarifier les trade-offs, ne pas décider à la place |
| **Do** 🟢- | "comment je fais", "prochaine étape", "implémenter" | Exécution nette, patch chirurgical |

Ne jamais sauter Assess→Do sans Decide explicite.

Skills disponibles à la demande : `/add-status` · `/add-reflect`

Afficher à chaque fin d'échange :
```
[ADD Flow: {emoji} {Realm} | {observation}]
```

---

## Architecture ARIA

**Stack** : React 19 + Vite, SPA pure client-side, pas de backend. Styles inline uniquement, pas de CSS modules, pas de TypeScript.

### Fichiers et rôles

- **`Dashboard_p1.jsx`** — Moteur core : `useARIA` hook, `callAI()`, `getApiKeys()`, `generateWorld()`, `buildCountryFromAI/Local()`, `doCycle()`, PRNG (`seededRand`, `strToSeed`)
- **`Dashboard_p2.jsx`** — Rendu SVG de la carte (chemins organiques)
- **`Dashboard_p3.jsx`** — Composant React principal : modales, FAB, assemblage final
- **`llmCouncilEngine.js`** — Pipeline de délibération en 6 phases : `routeQuestion` → `runMinisterePhase` → `runCerclePhase` → `runPresidencePhase` → vote → chronolog
- **`App.jsx`** — Shell global : routing InitScreen/Dashboard/Settings, `ariaRef` (API impérative de p3)
- **`ariaI18n.js`** — i18n FR/EN : `t('KEY', lang)` + `useLocale()` hook
- **`ariaTheme.js`** — Design tokens (`FONT`, `COLOR`)

### localStorage keys

| Clé | Contenu |
|-----|---------|
| `aria_lang` | `'fr'` \| `'en'` |
| `aria_api_keys` | `{ claude, gemini, grok, openai }` |
| `aria_options` | `ia_mode`, `ia_roles`, `solo_model`, `gameplay` |
| `aria_agents_override` | Prompts ministres/ministères custom |
| `aria_session_*` | Session active, pays, monde, alliances |
| `aria_chronolog_cycles` | Historique complet |

### Modes IA

- `'aria'` — multi-provider, rôle par rôle
- `'solo'` — modèle unique pour tout
- `'none'` / `force_local` / `mode_board_game` — offline, `FALLBACK_RESPONSES`

### perGov (gouvernance par pays)

`perGov[i] = null` = héritage de la gouvernance commune. Ne jamais initialiser à autre chose par défaut. Flux : `InitScreen.saveAndLaunch` → `defs[i].governanceOverride` → `Dashboard_p1.startLocal/startWithAI` → `llmCouncilEngine.getAgentsFor(country)`.

### Country Context

`buildCountryContext()` dans `llmCouncilEngine.js`. Contrôlé par `aria_options.gameplay.context_mode` (`'auto'`|`'rich'`|`'stats_only'`|`'off'`) et surchargeable par `country.contextOverride`.

---

## Fichiers de suivi

- **`TODO.md`** — Outil quotidien : bugs, prochaines étapes. Mettre à jour à chaque fin d'étape.
- **`ROADMAP.md`** + **`ROADMAP.fr.md`** — Vision globale GitHub. Modifier uniquement à la validation d'une étape majeure.
- **`REFLEXIONS.md`** — Capture des idées de fond, questions de design, directions futures. Ne pas implémenter sans Assess complet.

### Règles REFLEXIONS.md
- Réorganiser les idées pour qu'elles soient cohérentes et lisibles
- Signaler avec ⚠️ ATTENTION si une idée contredit quelque chose d'existant
- Signaler avec 🔁 REDONDANT si l'idée est déjà couverte ailleurs
- Signaler avec ❓ À PRÉCISER si l'idée est trop vague pour être actionnée
- Fusionner les idées similaires plutôt que les dupliquer

---

## Git

À chaque fin d'étape validée :
1. `git add` sur les fichiers modifiés
2. Commit avec message conventionnel (`feat:`, `fix:`, `chore:`, `refactor:`, etc.)
3. `git push` — sans attendre une demande explicite

## Règles de livraison

Pour chaque étape :
1. **Analyse** — avant toute modification, afficher :
   - Le nom du fichier concerné
   - Les lignes concernées (ex: "lignes 423-510")
   - Une phrase expliquant pourquoi ce bloc change
   - Attendre confirmation si la modification touche plus de 50 lignes
2. **Code** — patch chirurgical, uniquement les zones demandées
3. **Suggestions** — lister séparément, ne pas appliquer
4. **Vérification** — ce qu'il faut tester + commandes git

À chaque fin d'étape : livrer le `TODO.md` mis à jour dans un bloc de code séparé.

---

## Règles absolues

- Ne jamais modifier `llmCouncilEngine.js`, `ariaData.js`, `ariaTheme.js` sans demande explicite
- `npm run build` doit passer avant de déclarer une étape terminée
- Styles inline uniquement, pas de CSS modules, pas de TypeScript
- `perGov[i] = null` = héritage commun, ne jamais initialiser autrement
- Commentaires et noms de variables en français (convention du codebase)
