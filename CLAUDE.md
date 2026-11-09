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
6. **TODO + ROADMAP** — mettre à jour `doc/TODO.md`, `doc/ROADMAP.fr.md` et `doc/ROADMAP.md` dans le même commit que chaque chantier livré. Jamais après coup. Si un item est déjà fait (ex: découvert en cours de session), le cocher immédiatement. Mettre à jour le % de progression (barre + chiffre) à chaque chantier significatif.

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

**Source de vérité unique : `src/App.css`** — tokens CSS vars + toutes les classes (`cp-act-btn`, `side-panel`, `resource-badge`, etc.)

**Règles :**
- Aucun style inline (`style={{ … }}`) dans le JSX : tout style passe par une classe de `App.css`
- Pas de CSS modules (`.module.css`) — jamais
- Pas de nouveau fichier `.css` séparé (`Settings.css` doit être fusionné dans `App.css`)
- Styles inline existants : dette à migrer dans `App.css` (voir TODO, section Dette)

---

## Règles absolues

- Ne jamais modifier `councilEngine.js` (`src/features/council/services/`), `ariaData.js`, `ariaTheme.js` sans demande explicite
- Pas de CSS modules, pas de TypeScript
- `perGov[i] = null` = héritage commun, ne jamais initialiser autrement
- Commentaires et noms de variables en français
