# CLAUDE.md — ARIA + ADD Framework

> Langue de travail : français. Toutes les réponses et commentaires en français.
> Contexte technique complet : lire ARIA_CONTEXT.md à la racine du projet.

@ARIA_CONTEXT.md

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

## Workflow Git — Branches

Chaque chantier démarre sur une branche dédiée. Ne jamais commiter sur `main`.
Format : `type/nom-court` (ex: `refactor/init-screen-move`, `docs/arborescence`)
```bash
# Début de chantier
git checkout -b type/nom-court
git push -u origin type/nom-court

# Après chaque validation
git add -A
git commit -m "type: description courte"
git push
```

Un chantier = une branche.
La PR est créée manuellement sur GitHub par Flo après validation du chantier.

---

## Règles absolues

- Ne jamais modifier `llmCouncilEngine.js`, `ariaData.js`, `ariaTheme.js` sans demande explicite
- Ne jamais introduire de CSS modules, fichiers .css séparés, ou TypeScript
- `perGov[i] = null` = héritage commun, ne jamais initialiser autrement
- Commentaires et noms de variables en français
