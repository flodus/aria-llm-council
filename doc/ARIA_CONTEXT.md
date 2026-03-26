# ARIA_CONTEXT — Base de connaissances permanente
Simulation de gouvernance multi-LLM — React 19 + Vite + GitHub Pages
Session courante : Claude.ai (Assess/Decide) + Claude Code terminal (Do)

---

## Stack technique

- React 19 + Vite, SPA client-side, pas de backend
- Styles inline uniquement — pas de CSS modules, pas de TypeScript
- MDI icons (Material Design Icons via CDN)
- Mulberry32 PRNG — generateWorld() 100% déterministe
- localStorage comme couche de persistance principale
- GitHub Pages (déploiement statique)
- server.js — dormant, base pour V4 multijoueur + proxy RSS futur

---

## Architecture src/

| Fichier | Rôle |
|---------|------|
| Dashboard_p1.jsx | Moteur core : useARIA, callAI(), generateWorld(), doCycle() |
| Dashboard_p2.jsx | Rendu SVG carte |
| Dashboard_p3.jsx | Composant principal : modales, FAB, assemblage |
| App.jsx | Shell global, ariaRef (API impérative p3) |
| InitScreen.jsx | Écran démarrage : config monde, clés API |
| Settings.jsx | Configuration (5 sections : Gouvernement/Constitution/Simulation/Système/À Propos) |
| ConstitutionModal.jsx | Modale constitution par pays (in-game) |
| CountryPanel.jsx | Panneau latéral pays sélectionné |
| llmCouncilEngine.js | Pipeline délibération 6 phases ⚠️ ne pas modifier sans demande explicite |
| ariaData.js | Données statiques + FALLBACK_RESPONSES ⚠️ idem |
| ariaTheme.js | Design tokens ⚠️ idem |
| ariaI18n.js | i18n FR/EN : t(), useLocale(), loadLang() |

---

## Conventions de code

- Commentaires et noms de variables en français
- Styles inline uniquement — jamais de CSS modules
- Pas de TypeScript
- Composants fonctionnels React uniquement
- Hooks : useCallback/useMemo sur les fonctions passées en props

---

## Règles métier critiques

### perGov
```js
perGov[i] = null  // null = hérite constitution commune
// Flux : InitScreen.saveAndLaunch → defs[i].governanceOverride
//        → Dashboard_p1 → llmCouncilEngine.getAgentsFor(country)
```

### Country Context
- Contrôlé par `aria_options.gameplay.context_mode` ('auto'|'rich'|'stats_only'|'off')
- Hiérarchie : Settings global → Constitution par pays → contextOverride (remplace tout)
- `buildCountryContext()` dans llmCouncilEngine.js

### Providers IA
- Claude + Gemini : implémentés dans callModel()
- Grok + OpenAI : déclarés dans les sélecteurs, pas encore implémentés dans callModel()
- Clés debug : préfixe valide + contient -fake/-test/-debug/-demo → statut ⏳, pas d'appel API

### Présidence
- ☉ Phare = La Volonté (président seul)
- ☽ Boussole = L'Âme (co-présidente — égalité absolue, pas vice-présidente)
- ☉☽ Duale = Mode ARIA (Phare + Boussole à égalité)
- ✡ Collégiale = Vote des 12 ministres — Synthèse Constitutionnelle

### Ministères actifs (v2026-03)
justice · economie · defense · sante · education · ecologie · industrie
(Industrie remplace Chance — pas encore implémenté dans le moteur)

---

## LocalStorage — clés importantes

| Clé | Contenu |
|-----|---------|
| aria_options | gameplay, ia_mode, roles, governance |
| aria_api_keys | Clés API par provider |
| aria_api_keys_status | Statut test par provider |
| aria_session_world | Seed + dimensions monde |
| aria_session_countries | État pays en cours |
| aria_session_alliances | Alliances en cours |
| aria_preferred_models | Modèle préféré par provider |

---

## Fichiers de suivi
- doc/TODO.md — backlog quotidien
- doc/ROADMAP.fr.md — vision globale
- doc/REFLEXIONS.md — idées de fond (Assess requis)
- doc/MIGRATION_NOTES.md — notes de migration ministères / prompts

---

## Décisions d'architecture actées
- server.js conservé — base V4 multijoueur + proxy RSS futur
- Prompts JSON synthèse en français intentionnel — moteur parse un format strict
- Hard Reset inline dans Système — pas en accordéon
- Mode Démo dans footer Simulation — position définitive
- TextArea auto-resize (rows=1, overflow hidden, pas de minHeight)
- Trois niveaux de reset : "Recommencer l'histoire" / "Refonder" / "Rendez-vous en terres inconnues"
- generateWorld() 100% déterministe — soft reset trivial à implémenter
- Règle 0 : CR avant exécution — Claude Code reformule avant de coder

_Mettre à jour après chaque décision d'architecture majeure_
