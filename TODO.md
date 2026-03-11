# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-03-11_

---

## ✅ COMPLÉTÉ — Session 11 mars 2026

- [x] theocracie clé corrigée dans REGIME_LABEL_KEYS (Settings.jsx)
- [x] Board Game Mode remplace tuile OFF (Settings.jsx)
- [x] Emoji fallback régime au lieu de 🌍 (CountryPanel, HexGrid, Dashboard_p1)
- [x] Select terrain/régime : background sombre rgba(8,13,22,0.95) (Dashboard_p3)
- [x] CycleConfirmModal : bloc "ÉVOLUTIONS PASSIVES CE CYCLE" 👥💰😊 (Dashboard_p3)
- [x] Icônes terrains dans RESOURCES BY TERRAIN (Settings.jsx)

---

## 🔴 EN COURS

### ÉTAPE 4 — App.jsx
- [ ] Son OFF au lancement : `audioMuted` initialisé à `true`, persisté localStorage
- [ ] Icône 🔇/🔊 (mdi-volume-off / mdi-volume-high, blanche) dans header

### ÉTAPE 5 — CountryPanel.jsx
- [ ] Flèche discrète ‹ NomPays › pour naviguer entre pays (COUNCIL / MAP / CHRONOLOG)
- [ ] Props : `onPrevCountry`, `onNextCountry`, `countryIndex`, `countryTotal` depuis App.jsx

### ÉTAPE 6 — InitScreen.jsx
- [ ] 6a : Constitution par pays — perGov[i] indépendant
- [ ] 6b : Boutons + sticky ministères/ministres
- [ ] 6c : Icônes voir/masquer clés API (mdi-eye-lock)

### ÉTAPE 7 — WorldEngine.js
- [ ] Distance minimum entre centroïdes pays

---

## 🔵 BACKLOG — Plus tard
- [ ] Delta économique 💰 dans CycleConfirmModal (coefficients croissance variables)
- [ ] Icônes terrain + régime dans listes déroulantes (Init création monde, ajout pays fictif)
- [ ] Icônes régime dans REGIME COEFFICIENTS (Settings.jsx) — même principe que terrains
- [ ] Dashboard_p3.jsx : remonter tous les imports en tête de fichier
- [ ] Init → Constitution → ajouter un président custom
- [ ] Settings : icônes voir/masquer clés API (mdi-eye-lock)
- [ ] i18n
