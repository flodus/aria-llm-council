# WORKFLOW — Collaboration Claude.ai × ARIA

## Comment fonctionne ce projet Claude

Ce projet utilise la base de connaissances de Claude.ai (RAG) :
Claude recherche les parties pertinentes de la base selon la question,
sans tout injecter d'un coup. Plus précis, moins gourmand en tokens.

---

## Ce qui vit dans la base de connaissances (stable, permanent)

- `CLAUDE.md` — règles ADD + architecture ARIA + règles de livraison
- `TODO.md` — backlog quotidien
- `ROADMAP.md` / `ROADMAP.fr.md` — vision globale
- `REFLEXIONS.md` — idées de fond
- `ARBORESCENCE.md` — structure du projet
- `SETTINGS_ARCHITECTURE.md` — comparaison avant/après refonte
- `ANALYSE_STRUCTURE_PAYS.md` — base pour normalizeCountry()
- Fichiers src/ clés : Dashboard_p1, Dashboard_p3, llmCouncilEngine, etc.

---

## Organisation des discussions

**Une discussion = une tâche délimitée**

✅ "Refonte Settings — section Gouvernement"
✅ "Bug B2 — context_mode pipeline"
✅ "Assess — normalizeCountry() architecture"
❌ Une discussion géante avec 80 messages sur tout le projet

**Thèmes suggérés :**
- Une discussion par feature ou section
- Une discussion par bug avec stacktrace
- Une discussion Assess avant chaque chantier majeur
- Une discussion architecture/vision (ici, Claude.ai)

---

## Répartition Claude.ai ↔ Claude Code

| Tâche | Outil |
|---|---|
| Architecture, décisions, vision | Claude.ai (ici) |
| Exécution, patches, bugs | Claude Code (terminal) |
| Git add + commit + push | Claude Code (automatique) |
| Assess avant chantier majeur | Claude.ai (ici) |

---

## Ce qui économise le plus de tokens

| Pratique | Impact |
|---|---|
| Discussions courtes et focalisées | ⬇️ Fort |
| Fichiers stables dans la base de connaissances | ⬇️ Fort |
| CLAUDE.md bien écrit | ⬇️ Moyen |
| Regrouper plusieurs questions en 1 message | ⬇️ Moyen |
| Re-uploader les mêmes fichiers | ⬆️ À éviter |

**Règle clé : la base de connaissances garde le contexte permanent.
Les discussions restent courtes et ciblées.**

---

## ADD Framework (rappel)
- 🔴 Assess — explorer sans presser
- 🟠 Decide — clarifier les trade-offs
- 🟢 Do — exécution chirurgicale

Claude.ai = Assess + Decide · Claude Code = Do
