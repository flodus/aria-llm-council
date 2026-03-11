# ARIA — TODO.md
_Outil de travail quotidien — mis à jour à chaque fin d'étape_
_Dernière mise à jour : 2026-03-11_

---

## ✅ COMPLÉTÉ cette session

- [x] governanceOverride lu par llmCouncilEngine (getAgentsFor + 3 helpers For)
- [x] Badges pays plus visibles dans Init (flag grand, nom lisible)
- [x] Bouton "Personnaliser" à gauche au-dessus des onglets
- [x] Bandeau statut inline : "CONSTITUTION INDÉPENDANTE — NOM" après les onglets

---

## 🔴 BUGS ACTIFS

### B1 — Création pays depuis dashboard map grid (F12)
- [ ] Investiguer l'erreur console lors de l'ajout d'un pays in-game

### B2 — Country Context in Deliberations
- [ ] Auditer buildCountryContext() : contenu, format, réception LLM
- [ ] Vérifier injection stats (régime, terrain, satisfaction, ressources)

---

## 🟡 UX COURT TERME

### U1 — Icônes régimes dans listes déroulantes
- [ ] Init création monde fictif + ajout pays in-game

### U2 — Résumé constitution : ligne signes zodiacaux redondante
- [ ] Décider : supprimer ou remplacer par noms des ministres actifs

### U3 — Harmonisation tuiles Init ↔ Settings ↔ popup in-game
- [ ] Même style tuiles ministres/ministères dans les 3 contextes

### U4 — Chronolog enrichi (5 derniers cycles)
- [ ] Satisfaction détaillée, décisions clés, événements par cycle

---

## 🟠 FONCTIONNEL MOYEN TERME

### F1 — Minimum 2 pays en mode custom
- [ ] Forcer min 2 nations à la création (mode custom)

### F2 — Settings gouvernement : repenser avec multi-pays
- [ ] Clarifier rôle : constitution commune par défaut ou supprimer

### F3 — Custom multi-pays : bloquer doublons pays réels
- [ ] Griser pays déjà sélectionnés dans le picker

### F4 — Révision constitutionnelle tous les +5 cycles
- [ ] Pop-up de rappel : "Réviser la constitution ?"

### F5 — Contexte historique dans délibérations
- [ ] Vérifier si chronolog est injecté dans les prompts LLM

---

## 🔵 GAMEPLAY LONG TERME

### G1 — Crises aléatoires (protocole 6.2)
- [ ] Déclenchement auto tous les N cycles (N aléatoire)
- [ ] 3 ministres validateurs + 3 ministres de sortie
- [ ] Critères : impact systémique / risque irréversible / délai / effondrement vital

### G2 — Bouton "Simuler une crise" : clarifier ou implémenter
- [ ] Audit de l'état actuel + décision

### G3 — Sécession assistée : protocole complet
- [ ] Délai négociation + traité non-agression avant sécession

### G4 — Présidence 1 à 3 présidents
- [ ] Config 1/2/3 présidents en Init et Settings
- [ ] Mode collégial (synthèse 3 voix) + affichage council adapté

---

## 🟣 VISION / À DISCUTER

### V1 — Décret vs référendum + Charte constitutionnelle
### V2 — Ministère du Culte (délibération ARIA interne)

---

## PROCHAINE ÉTAPE TECHNIQUE

### ÉTAPE 7 — WorldEngine.js
- [ ] Distance minimum entre centroïdes (MIN_CENTROID_DIST = HEX_R × 8)
- [ ] Retry seed si overlap

---

## 📁 Fichiers actifs
`InitScreen.jsx` · `llmCouncilEngine.js` · `WorldEngine.js`
