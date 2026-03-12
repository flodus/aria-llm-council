# SETTINGS_ARCHITECTURE — Comparaison AVANT / APRÈS

Refonte complète de `src/Settings.jsx` — session 2026-03-12.
Référence AVANT : commit `9659158` · Référence APRÈS : commit `ebf610f`

---

## 1. Navigation principale

| # | AVANT | APRÈS |
|---|-------|-------|
| 1 | ⚙️ SYSTÈME | 🏛️ GOUVERNEMENT |
| 2 | 📜 CONSTITUTION | 📜 CONSTITUTION |
| 3 | 🏛️ CONSEIL | 🎲 SIMULATION |
| 4 | 🎲 SIMULATION | ⚙️ SYSTÈME |
| 5 | 🖥️ INTERFACE | ✦ À PROPOS |
| 6 | ✦ À PROPOS | _(supprimé)_ |

**Section active par défaut** : `systeme` → `conseil` (GOUVERNEMENT)
**INTERFACE** : supprimée — contenu fusionné dans SYSTÈME

---

## 2. Section SYSTÈME (⚙️)

```
AVANT                                  APRÈS
──────────────────────────────────────────────────────────────
Layout plat (settings-group-title)     Accordéons cliquables
│                                      │
├─ CLÉS API & MODÈLES                  ├─ [acc] LANGUE
│  ├─ 4 providers inline               │  └─ Select FR/EN
│  │  (champ + select modèle)          │
│  └─ Statut test inline               ├─ [acc] AFFICHAGE
│                                      │  └─ (vient de INTERFACE)
├─ Mode IA                             │
│  ├─ Radio cards ARIA/Solo/Custom     ├─ [acc] CLÉS API  [badge x/4]
│  └─ Select par rôle (si Custom)      │  ├─ [sub-acc] Anthropic — Claude
│                                      │  ├─ [sub-acc] Google — Gemini
└─ Toggle "Forcer textes locaux"       │  ├─ [sub-acc] xAI — Grok
                                       │  └─ [sub-acc] OpenAI — GPT
                                       │     (chaque sub-acc : clé + select
                                       │      modèle + toggle eye-lock)
                                       │
                                       ├─ [acc] EXPORT / IMPORT
                                       │
                                       ├─ Mode IA (radio cards, inchangé)
                                       │
                                       └─ Hard Reset (inline, pas accordéon)
```

**Clés API** : champs inline → sous-accordéons par fabricant avec icône statut
**LANGUE** : était dans INTERFACE → remontée dans SYSTÈME
**Hard Reset** : était dans INTERFACE → remontée dans SYSTÈME

---

## 3. Section CONSTITUTION (📜)

```
AVANT                                  APRÈS
──────────────────────────────────────────────────────────────
Layout plat                            3 accordéons

├─ Prompt système global (TextArea)    ├─ [acc] ARCHITECTURE DE DÉLIBÉRATION
├─ Ton de synthèse (TextArea)          │  ├─ Prompt système global
├─ Contexte géopolitique (TextArea)    │  ├─ Ton de synthèse
│                                      │  └─ Contexte géopolitique
└─ Prompts spéciaux (read-only) :      │
   Synthèse min / Synthèse prés /      ├─ [acc] ADN GLOBAL
   Fact-check                          │  └─ Prompts spéciaux (TextArea)
                                       │
                                       └─ [acc] PROMPTS ARIA — SYNTHÈSE
                                          └─ Prompts read-only (pré/post)
```

---

## 4. Section GOUVERNEMENT / CONSEIL (🏛️)

### 4a. Ordre des onglets

| AVANT (CONSEIL) | APRÈS (GOUVERNEMENT) |
|-----------------|----------------------|
| 1. Ministres    | 1. Gouvernance       |
| 2. Ministères   | 2. Présidence        |
| 3. Présidence   | 3. Ministères        |
| 4. Gouvernance  | 4. Ministres         |

### 4b. Onglet Ministres

```
AVANT                                  APRÈS
──────────────────────────────────────────────────────────────
<Select> dropdown (12 options)         Grille 12 tuiles cliquables
                                       (emoji + nom sans article Le/La/L')
                                       tooltip = nom complet + signe
└─ 3 TextArea (Essence/Comm/Annot)     └─ 3 TextArea (idem)
```

### 4c. Onglet Ministères

```
AVANT                                  APRÈS
──────────────────────────────────────────────────────────────
<Select> dropdown (7 options)          Grille 7 tuiles cliquables
                                       (emoji + nom court)
                                       tooltip = TOOLTIP_MINISTERES statique
└─ TextArea mission                    └─ TextArea mission
└─ TextArea rôle × 2 ministres         └─ TextArea rôle × 2 ministres
```

### 4d. Onglet Présidence

```
AVANT                                  APRÈS
──────────────────────────────────────────────────────────────
Layout plat                            2 accordéons avec symboles
├─ TextArea Phare (rôle + essence)     ├─ [acc] ☉ Le Phare
└─ TextArea Boussole (rôle + essence)  └─ [acc] ☽ La Boussole
```

### 4e. Onglet Gouvernance

```
AVANT                                  APRÈS
──────────────────────────────────────────────────────────────
Layout plat                            2 accordéons
├─ <Select> type de présidence         ├─ [acc] PRÉSIDENCE PAR DÉFAUT
│  (dropdown 4 options)                │  └─ 4 tuiles cliquables
│                                      │     ☉ Phare / ☽ Boussole /
│                                      │     ☉☽ Duale / ✡ Collégiale
│                                      │     + bloc description contextuel
│                                      │       (bordure dorée, italique)
│                                      │
└─ Checkboxes ministères actifs        └─ [acc] MINISTÈRES ACTIFS PAR DÉFAUT
                                          └─ Checkboxes (idem)
```

---

## 5. Section SIMULATION (🎲)

```
AVANT                                  APRÈS
──────────────────────────────────────────────────────────────
Layout plat (settings-group-title)     Accordéons cliquables

├─ VITESSE & CYCLES                    ├─ [acc] SEUILS CRITIQUES
│  ├─ Toggle cycles_auto               │  ├─ Seuil révolte
│  └─ NumberInput intervalle           │  ├─ Seuil explosion démographique
│                                      │  ├─ Bruit aléatoire max
├─ SEUILS CRITIQUES                    │  └─ Toggle events_ia  ← déplacé
│  ├─ Seuil révolte                    │
│  ├─ Seuil explosion démographique    ├─ [acc] COEFFICIENTS DES RÉGIMES
│  └─ Bruit aléatoire max             │  └─ (idem)
│                                      │
├─ Toggle events_ia (dans Seuils)      ├─ [acc] RESSOURCES PAR TERRAIN
│                                      │  └─ (idem)
├─ COEFFICIENTS DES RÉGIMES            │
│  └─ (idem)                           └─ DÉMO — mode autonome d'ARIA
│                                         (dans footer, pas accordéon)
└─ RESSOURCES PAR TERRAIN              ├─ Toggle cycles_auto  ← déplacé
   └─ (idem)                           └─ NumberInput intervalle (compact,
                                           largeur dynamique selon nb chiffres)
```

**VITESSE & CYCLES** : accordéon supprimé — `cycles_auto` + intervalle déplacés dans le footer de section sous le label **DÉMO**

---

## 6. Section INTERFACE (🖥️) → supprimée

```
AVANT                        DESTINATION APRÈS
──────────────────────────────────────────────
AFFICHAGE CARTE         →    [acc] AFFICHAGE dans SYSTÈME
EXPORT / IMPORT         →    [acc] EXPORT dans SYSTÈME
LANGUE                  →    [acc] LANGUE dans SYSTÈME
Hard Reset              →    Inline dans SYSTÈME (sous les accordéons)
```

---

## 7. Section À PROPOS (✦)

Inchangée structurellement — tableau IRL + citation + liens.

---

## 8. Composants UI — changements globaux

| Composant | AVANT | APRÈS |
|-----------|-------|-------|
| `TextArea` | `rows={2/3/4}` fixe | `rows={1}`, auto-resize via `scrollHeight` |
| `TextInput` (password) | Champ simple | + toggle œil `mdi-eye-lock` / `mdi-eye-lock-open` |
| `NumberInput` | Largeur fixe `90px` | + prop `style` optionnel (ex: largeur dynamique en `ch`) |
| Groupes de champs | `settings-group-title` (div statique) | Accordéons `openAcc` / `toggleAcc` |

---

_Généré le 2026-03-12 — à mettre à jour si la structure évolue_
