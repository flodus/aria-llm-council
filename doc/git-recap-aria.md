# Git — Récapitulatif de survie ARIA
_PC maison ↔ PC boulot · Branches · Nettoyage_

---

## 1 · Règle d'or

> **`main` ne se touche jamais directement.**
> Tout chantier = une branche dédiée → PR sur GitHub → merge → branche supprimée.

---

## 2 · Situation de départ (arriver sur un PC)

```bash
git fetch --prune        # Synchronise avec GitHub, supprime les refs mortes
git status               # Vérifie sur quelle branche tu es + si tu es en retard
git pull origin main     # Met main local à jour (si git status le signale)
```

---

## 3 · Démarrer un chantier

```bash
git checkout main                        # S'assurer d'être sur main
git pull origin main                     # Main à jour avant de brancher
git checkout -b type/nom-court           # Créer la branche locale
git push -u origin type/nom-court        # La pousser sur GitHub et lier
```

Format des noms : `refactor/country-panel` · `docs/integration-plan` · `fix/import-errors`

---

## 4 · Travailler et sauvegarder

```bash
git add -A                               # Ajouter tous les fichiers modifiés
git commit -m "type: description courte" # Commiter
git push                                 # Pousser sur GitHub
```

---

## 5 · Récupérer une branche distante sur un autre PC

```bash
git fetch --prune                        # Synchroniser d'abord
git branch -r                           # Voir les branches distantes disponibles
git checkout nom-de-la-branche          # Git crée la locale et la lie automatiquement
```

---

## 6 · Revenir sur main après un chantier mergé

```bash
git checkout main
git pull origin main
git branch -d nom-de-la-branche         # Supprimer la branche locale (propre)
```

Si git refuse avec `-d` → vérifier le contenu avant de forcer :
```bash
git log main..nom-de-la-branche --oneline   # Voir les commits non mergés
git branch -D nom-de-la-branche             # Forcer la suppression (si confirmé inutile)
```

---

## 7 · Nettoyage des branches mortes

```bash
git fetch --prune                            # Nettoie les refs distantes disparues
git branch -r --merged origin/main          # Voir les branches distantes déjà mergées
git push origin --delete nom-de-la-branche  # Supprimer une branche sur GitHub
```

---

## 8 · Diagnostic rapide

| Question | Commande |
|---|---|
| Sur quelle branche suis-je ? | `git branch` |
| Quelles branches existent sur GitHub ? | `git branch -r` |
| Mon main local est-il à jour ? | `git status` (après `git fetch`) |
| Cette branche est-elle mergée dans main ? | `git branch -r --merged origin/main` |
| Que contient ce commit ? | `git show <hash> --stat` |
| Commits non mergés sur cette branche ? | `git log main..nom-branche --oneline` |

---

## 9 · Workflow type PC maison → PC boulot → PC maison

```
[PC maison]
  git checkout -b refactor/mon-chantier
  git push -u origin refactor/mon-chantier
  # ... travail ...
  git add -A && git commit -m "..." && git push

[PC boulot]
  git fetch --prune
  git checkout refactor/mon-chantier     ← récupère la branche distante

[PC maison — retour]
  git fetch --prune
  git checkout main
  git pull origin main
  git branch -d refactor/mon-chantier   ← si mergée entre-temps
```

---

_Généré pour le projet ARIA · Mars 2026_
