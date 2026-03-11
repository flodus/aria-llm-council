# ARIA — TODO

## ✅ COMPLÉTÉ

### Init — Constitution (onglet MINISTÈRES + MINISTRES)
- [x] Grille d'icônes + focus/toggle dans les deux onglets
- [x] Harmonisation stricte : 1er clic = focus (remonte fiche), 2e clic = toggle actif/inactif
- [x] Si actif → désactive + retire focus (fiche descend en bas)
- [x] Si inactif → active + maintient focus en haut
- [x] Toutes les fiches toujours visibles (pas de filtre par sélection)
- [x] Fiches inactives : opacity 0.32 + saturate(0.15) — lisibles mais clairement en retrait
- [x] Hint : italique, centré, très discret (opacity 0.28), séparateur visuel
- [x] Tri dynamique : focused → actifs → inactifs en bas
- [x] États : `selectedMinistry`, `selectedMinister`

---

## 🔴 EN COURS

### ÉTAPE 6a-2 — InitScreen.jsx : perGov override par pays
- Constitution commune par défaut, override indépendant par pays via bouton "Personnaliser"
- États actuellement globaux à refactoriser : `activeMins`, `activePres`, `activeMinsters`, `plAgents`
- Nouveau : `perGov[i]` = override local par pays (index dans pendingDefs)
- Badge visuel sur sélecteur de pays si override actif
- `saveAndLaunch` merge constitution commune + overrides par pays

### ÉTAPE 7 — WorldEngine.js
- `placeCountries()` : contrainte distance minimum entre centroïdes (`MIN_CENTROID_DIST = HEX_R * 8`)
- Retry avec seed modifié si overlap détecté

---

## 🔵 BACKLOG

- [ ] Delta économique 💰 dans CycleConfirmModal
- [ ] Icônes terrain + régime dans listes déroulantes Init
- [ ] Icônes régime dans REGIME COEFFICIENTS (Settings.jsx)
- [ ] Dashboard_p3.jsx : remonter tous les imports en tête de fichier
- [ ] Init → Constitution → ajouter un président custom
- [ ] i18n : LegitimiteOverlay.jsx, HexGrid.jsx
- [ ] Phase V1 : Carte SVG procédurale low-poly
