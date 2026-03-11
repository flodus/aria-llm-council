# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-03-11_

---

## ✅ COMPLÉTÉ — Session 11 mars 2026

- [x] theocracie clé corrigée dans REGIME_LABEL_KEYS (Settings.jsx)
- [x] Board Game Mode remplace tuile OFF (Settings.jsx)
- [x] Emoji fallback régime (CountryPanel, HexGrid, Dashboard_p1)
- [x] Select terrain/régime : background sombre (Dashboard_p3)
- [x] CycleConfirmModal : bloc ÉVOLUTIONS PASSIVES CE CYCLE 👥💰😊 (Dashboard_p3)
- [x] Icônes terrains dans RESOURCES BY TERRAIN (Settings.jsx)
- [x] MDI font via @import dans App.css
- [x] Son OFF par défaut + icône mdi header (App.jsx)
- [x] Navigation entre pays ‹ 1/3 › MAP + COUNCIL (CountryPanel + App.jsx)
- [x] Icônes MDI eye-lock clés API (InitScreen.jsx)
- [x] Boutons + Nouveau sticky (InitScreen.jsx)
- [x] Grille icônes ministères + focus/toggle (InitScreen.jsx)
- [x] Harmonisation complète onglets MINISTÈRES / MINISTRES :
  - Logique : 1er clic = focus (fiche remonte en tête de liste), ordre grille inchangé
  - 2e clic actif = désactive + icône glisse en bas de grille
  - 2e clic inactif = active + reste en haut
  - Toutes les fiches toujours visibles
  - Fiches inactives : aucun grisé sur la fiche, seule l'icône grille est grisée
  - Hint italique discret centré

---

## 🔴 PROCHAINE ÉTAPE

### ÉTAPE 6a-2 — InitScreen.jsx : perGov override par pays
- Constitution commune par défaut, override indépendant par pays via bouton "Personnaliser"
- États à refactoriser en `perGov[i]` : `activeMins`, `activePres`, `activeMinsters`, `plAgents`
- Badge visuel sur sélecteur de pays si override actif
- `saveAndLaunch` merge constitution commune + overrides par pays

### ÉTAPE 7 — WorldEngine.js
- `placeCountries()` : distance minimum entre centroïdes (`MIN_CENTROID_DIST = HEX_R * 8`)
- Retry avec seed modifié si overlap détecté

---

## 🔵 BACKLOG

- [ ] **Présidence — 1 à 3 présidents** _(étape future)_
  - Même logique focus/glissement que ministères/ministres (fiche en tête au focus, glisse en bas si désactivé)
  - Revoir l'opacité des fiches inactives à ce moment-là en prenant comme référence la valeur actuelle de la présidence (plus lisible que ministères/ministres)
- [ ] Delta économique 💰 dans CycleConfirmModal (coefficients croissance variables)
- [ ] Icônes terrain + régime dans listes déroulantes Init
- [ ] Icônes régime dans REGIME COEFFICIENTS (Settings.jsx)
- [ ] Dashboard_p3.jsx : remonter tous les imports en tête de fichier
- [ ] Init → Constitution → ajouter un président custom
- [ ] i18n : LegitimiteOverlay.jsx, HexGrid.jsx
- [ ] Phase V1 : Carte SVG procédurale low-poly

---

## 📁 Fichiers actifs
`InitScreen.jsx` · `Settings.jsx` · `CountryPanel.jsx` · `HexGrid.jsx` · `Dashboard_p1.jsx` · `Dashboard_p3.jsx` · `App.jsx` · `WorldEngine.js`
