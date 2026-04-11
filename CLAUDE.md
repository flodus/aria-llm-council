# CLAUDE.md — ARIA + ADD Framework

> Langue de travail : français. Toutes les réponses et commentaires en français.
> Contexte technique complet : lire doc/ARIA_CONTEXT.md

@doc/ARIA_CONTEXT.md

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

## Convention styles

**Source de vérité CSS :**
- `App.css` — tokens CSS vars + classes globales réutilisables (`cp-act-btn`, `side-panel`, `resource-badge`, etc.)
- Styles inline React — pour les styles ponctuels propres à un composant, non réutilisables ailleurs
- `Settings.css` — exception historique, à migrer en inline lors du refactor Settings

**Règles :**
- Ne jamais dupliquer dans du inline ce qui est déjà dans App.css
- Pas de CSS modules (`.module.css`) — jamais
- Pas de nouveaux fichiers `.css` séparés sans demande explicite
- Si un style inline est réutilisé à 3+ endroits → le promouvoir dans App.css

---

## Règles absolues

- Ne jamais modifier `llmCouncilEngine.js`, `ariaData.js`, `ariaTheme.js` sans demande explicite
- Pas de CSS modules, pas de TypeScript
- `perGov[i] = null` = héritage commun, ne jamais initialiser autrement
- Commentaires et noms de variables en français
