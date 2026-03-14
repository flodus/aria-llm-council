# CLAUDE.md — ARIA + ADD Framework

> Langue de travail : français. Toutes les réponses et commentaires en français.
> Contexte technique complet : lire ARIA_CONTEXT.md à la racine du projet.

## Commandes
```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build (outputs to dist/)
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```
No test suite. `base: '/aria-llm-council/'` dans vite.config.js = chemin GitHub Pages.

---

## ADD Framework

| Realm | Signaux | Posture |
|-------|---------|---------|
| **Assess** 🔴+ | "et si", "options", exploratoire | Explorer sans presser |
| **Decide** 🟠? | "lequel", "priorité", comparaison | Clarifier les trade-offs |
| **Do** 🟢- | "comment", "implémenter" | Exécution chirurgicale |

Ne jamais sauter Assess→Do sans Decide explicite.
Afficher à chaque fin d'échange : `[ADD Flow: {emoji} {Realm} | {observation}]`
Skills : `/add-status` · `/add-reflect`

---

## Règle 0 — Compréhension avant exécution
Avant toute modification de code :
1. Reformuler en 2-3 phrases ce qui a été compris
2. Lister les fichiers à toucher
3. Attendre confirmation explicite

Pas de code sans confirmation. Pas d'exception.

---

## Règles de livraison

1. **Analyse** — nom fichier + lignes concernées + pourquoi ça change
2. **Code** — patch chirurgical, uniquement les zones demandées  
3. **Suggestions** — lister séparément, ne pas appliquer
4. **Validation** — `npm run build` doit passer avant de déclarer terminé
5. **Git** — `git add + commit + push` automatiquement après chaque validation

---

## Règles absolues

- Ne jamais modifier `llmCouncilEngine.js`, `ariaData.js`, `ariaTheme.js` sans demande explicite
- Styles inline uniquement — pas de CSS modules, pas de TypeScript
- `perGov[i] = null` = héritage commun, ne jamais initialiser autrement
- Commentaires et noms de variables en français
