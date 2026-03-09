# ARIA — Todolist i18n FR → EN

> Base déjà faite : `ariaI18n.js` + hook `useLocale()` + switcher sur l'écran d'accueil.
> Défaut : FR. Chaque fichier nécessite `import { useLocale, t } from './ariaI18n'` + `const { lang } = useLocale()`.

---

## ✅ Déjà traduit
- InitScreen.jsx — navigation principale (52 clés t())
- ariaI18n.js — ~70 clés FR/EN

---

## 🔴 Priorité 1 — Visible immédiatement en jeu

### Dashboard_p3.jsx
- Écran chargement IA : "GÉNÉRATION DU MONDE EN COURS…"
- Modal cycle : "CONFIRMER LE CYCLE ⏭", "ANNULER", "DÉCISIONS PRISES CE CYCLE"
- Overlay sécession : "NOM DU NOUVEAU PAYS", "Ex : République du Levant…"
- Labels terrain : "Côtier", "Désert", "Forêt", "Démocratie libérale", "Démocratie directe"
- Dashboard : "DÉLIBÉRATION EN COURS…", "ADHÉSION ARIA", "IMPLICATIONS — CHANGEMENTS D'ÉTAT"

### CountryPanel.jsx
- "AUCUN TERRITOIRE SÉLECTIONNÉ", "Cliquez sur un territoire…"
- "CONSEIL DE DÉLIBÉRATION", "LÉGITIMITÉ ARIA", "ADHÉSION IN-GAME"
- "DÉMOGRAPHIE", "NATALITÉ", "MORTALITÉ", "MÉCONTENTS"
- "POPULATION", "MINISTÈRES", "QUESTIONS FRÉQUENTES"
- "Ouvrir le Conseil de délibération"

### LLMCouncil.jsx
- "CERCLE MINISTÉRIEL", "PRÉSIDENCE", "DÉLIBÉRATION MINISTÉRIELLE"
- "CONSEIL EN ATTENTE", "DÉLIBÉRATION EN COURS…"
- "QUESTION SOUMISE AU CONSEIL", "PROPOSITION SOUMISE AU VOTE"
- "SYNTHÈSE DU MINISTÈRE", "SYNTHÈSE EN COURS…", "RÉSULTAT"
- "VOTE DU PEUPLE", "SATISFACTION", "ADHÉSION ARIA"
- "ANNOTATIONS DES MINISTÈRES", "INSTANCE DE COORDINATION INTERMINISTÉRIELLE"

---

## 🟠 Priorité 2 — Settings & Constitution

### Settings.jsx (~117 strings — le plus gros chantier)
- "ARIA — CONFIGURATION", "ARCHITECTURE DE DÉLIBÉRATION"
- "CLÉS API & MODÈLES", "CONTEXTE PAYS DANS LES DÉLIBÉRATIONS"
- Tous les labels de champs, descriptions, boutons (Activé/Désactivé, Réinitialiser…)
- Options de mode IA : "Architecture multi-providers", "Assignation rôle par rôle"
- Descriptions de contexte : "Aucun contexte injecté…", "Appliqué à tous les nouveaux pays…"

### ConstitutionModal.jsx
- "CHEF D'ÉTAT", "MINISTRES ASSIGNÉS", "PROMPTS MINISTÉRIELS"
- "CONTEXTE DANS LES DÉLIBÉRATIONS", "CONTEXTE PERSONNALISÉ"
- "Essence — rôle et vision…", "Mission du ministère…", "Nom du ministère"
- Labels régime : "Démocratie libérale 🗳️", "Démocratie directe 🤝"…
- "Hérite", "Créer →", "IA à raisonner historiquement"

---

## 🟡 Priorité 3 — Données & Moteur

### ariaTheme.js
- `TERRAIN_LABELS` : 'Côtier 🌊', 'Continental 🏔', 'Insulaire 🏝'…
- `REGIME_LABELS` : 'Démocratie libérale 🗳️', 'Monarchie absolue 👑'…
- `RESOURCE_DEFS` labels : 'AGRICULTURE', 'EAU DOUCE', 'MINÉRAUX'…
- → **Rendre ces objets dynamiques** selon lang, ou dupliquer FR/EN dans ariaI18n.js

### ariaData.js
- Noms des pays fictifs prédéfinis (Confédération de Thalassia…)
- Données IRL des pays réels : descriptions, notes politiques
- Fallback quotes de délibération (ARIA quotes)
- → **Option** : garder FR pour la démo, traduire seulement les noms de pays fictifs

### Dashboard_p3.jsx (suite)
- Labels popup sécession, tooltips carte

### App.jsx
- "DÉMOCRATIE HOLISTIQUE" (sous-titre topbar)
- "Rapport de Légitimité Globale — ARIA" (tooltip)
- Tab labels : 'MAP-GRID', 'LLM COUNCIL', 'CHRONOLOG' (déjà en pseudo-anglais)

### Dashboard_p2.jsx
- "GÉNÉRATION DU MONDE…" (overlay chargement hexagonal)

---

## 🟢 Priorité 4 — Prompts IA (impact fort sur qualité EN)

### llmCouncilEngine.js (~20 strings critiques)
- Tous les prompts système envoyés à l'IA sont en FR
- En mode EN, les ministres répondront quand même en FR si les prompts sont FR
- **Fix requis** : injecter `lang` dans `buildMinisterPrompt()`, `buildSynthesisPrompt()` etc.
- Ajouter instruction `"Respond in English."` en tête de chaque prompt quand lang==='en'

### Dashboard_p1.jsx
- Prompts de génération pays : `buildCountryPrompt()` — injecter lang
- Fallback messages d'erreur : "DÉFAILLANCE SYNAPTIQUE…", "SILENCE RADIO…"
- `getRandomFallback()` — réponses locales pré-écrites à dupliquer EN

---

## 🔵 Optionnel / Long terme

### ChronologView.jsx
- "CHRONOLOG VIDE", "· résumé", "PRÉSIDENCE"
- Messages dynamiques générés (ex: `${ev.emoji} ${ev.nom} fondée`) → template strings à externaliser

### useChronolog.js
- Commentaires uniquement, pas de strings UI visibles

### LegitimiteOverlay.jsx
- Notes Think-Tank sur chaque pays (textes longs, analytiques)
- Noms de pays réels + leurs descriptions
- "RAPPORT DE LÉGITIMITÉ", "Monde Réel — Ancre Think-Tank", "Simulation en cours"

---

## 📋 Récap effort estimé

| Fichier              | Strings | Effort  |
|----------------------|---------|---------|
| Settings.jsx         | ~117    | 🔴 Grand |
| llmCouncilEngine.js  | ~20 + prompts | 🔴 Critique |
| Dashboard_p1.jsx     | ~14 + prompts | 🟠 Moyen |
| Dashboard_p3.jsx     | ~22     | 🟠 Moyen |
| CountryPanel.jsx     | ~20     | 🟠 Moyen |
| LLMCouncil.jsx       | ~15     | 🟠 Moyen |
| ConstitutionModal.jsx| ~20     | 🟠 Moyen |
| ariaTheme.js         | ~25     | 🟡 Petit (objets) |
| ariaData.js          | ~50+    | 🟡 Données |
| App.jsx              | ~4      | 🟢 Trivial |
| Dashboard_p2.jsx     | ~1      | 🟢 Trivial |
| ChronologView.jsx    | ~6      | 🟢 Trivial |

**Total estimé : ~300 strings + refactor prompts IA**
