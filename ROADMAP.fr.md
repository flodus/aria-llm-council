# 🗺️ ARIA — Feuille de route stratégique

> *English: [ROADMAP.md](ROADMAP.md)*

```text
================================================================================
  ARIA FEUILLE DE ROUTE STRATÉGIQUE  —  base v7.5
  Dernière mise à jour : 2026-03
================================================================================

 ████████████████████████████████████████  LIVRÉ  ████████████████████████████

 [ MOTEUR PRINCIPAL ] ............................................. STATUT: ✅ FAIT
 ├─[✓] Conseil multi-LLM ........ [Claude/Gemini/Grok/OpenAI] ...... ■ 100%
 ├─[✓] Éditeur constitutionnel .. [Régime, Dirigeant, Prompts] ..... ■ 100%
 ├─[✓] Archétypes ministres ..... [12 ministres × 7 ministères] .... ■ 100%
 ├─[✓] Phare & Boussole ......... [Arbitrage présidentiel] .......... ■ 100%
 ├─[✓] Vote populaire ........... [Satisfaction + score ARIA] ....... ■ 100%
 └─[✓] Événements mondiaux ...... [Sécession, Nouvelles nations] .... ■ 100%

 [ CHRONOLOG ] ..................................................... STATUT: ✅ FAIT
 ├─[✓] Historique typé .......... [vote/sécession/constitution] ..... ■ 100%
 ├─[✓] Snapshots de cycle ....... [Deltas SAT + ARIA par cycle] ..... ■ 100%
 └─[✓] Auto-résumé .............. [Élagage contexte > 5 cycles] ..... ■ 100%

 [ INIT & CONFIGURATION ] ......................................... STATUT: ✅ FAIT
 ├─[✓] Config 4 providers ....... [Test inline + validation] ........ ■ 100%
 ├─[✓] Mode architecture IA ..... [ARIA / Solo / Personnalisé] ...... ■ 100%
 ├─[✓] Config LLM par rôle ...... [Provider + Modèle par étape] ..... ■ 100%
 ├─[✓] Constitution pré-lancement [Édition avant génération] ........ ■ 100%
 └─[✓] Registry LLM ............. [JSON Gist + fallback local] ...... ■ 100%

 ████████████████████████████████████████  À VENIR  ██████████████████████████

 [ PHASE V1 : CARTE DU MONDE ] .................................... STATUT: PLANIFIÉ
 │
 │  ⚠ CHANGEMENT DE CONCEPT : Hex-Grid remplacé par SVG procédural low-poly
 │  L'approche hex-grid originale (Phases V1/V4) a été abandonnée.
 │  Nouvelle direction : carte SVG par couches avec génération PRNG du terrain,
 │  assignation de polygones aux pays, et projection WebGL globe optionnelle.
 │  La logique hex (ZEE, friction frontalière) sera réinterprétée en
 │  adjacence de polygones et superpositions de zones navales — mêmes objectifs,
 │  meilleure compatibilité avec l'esthétique ARIA et le rendu React natif.
 │
 ├─[01] Carte SVG procédurale ... [Génération PRNG polygones] ....... ⬡ 0%
 │      └─> Formes des pays assignées depuis un pool de territoires
 ├─[02] Projection globe ........ [Robinson / sphère WebGL] ......... ⬡ 0%
 │      └─> Bascule entre planisphère plat et globe 3D
 ├─[03] Zoom dynamique .......... [Niveaux de détail x1-x5] ......... ⬡ 0%
 ├─[04] Zones maritimes ......... [Superposition adjacence navale] ... ⬡ 0%
 └─[05] Biomes de terrain ....... [Élévation style paper-craft] ..... ⬡ 0%
        └─> Style visuel : low-poly papier découpé, strates colorées

 [ PHASE V2 : DÉCLENCHEURS SYSTÉMIQUES ] ......................... STATUT: EN FILE
 ├─[06] Répercussions mondiales . [Effets croisés entre pays] ....... ⬡ 0%
 │      └─> "Si le Pays A taxe l'IA → le Pays B gagne en Commerce,
 │           perd en Diplomatie. Propagé dans le contexte du conseil."
 ├─[07] Protocole de crise ...... [Référendums d'urgence] ........... ⬡ 0%
 ├─[08] Hub de scénarios ........ [Présets historiques & sandbox] ... ⬡ 0%
 └─[09] Support i18n ............ [Bascule FR/EN au démarrage] ...... ⬡ 0%

 [ PHASE V3 : INFRASTRUCTURE LLM ] ............................... STATUT: EN FILE
 │
 │  Architecture décidée : registry hébergé sur Gist (llm-registry.json)
 │  comme source de vérité publique. localStorage comme couche de surcharge
 │  personnelle. Les deux fusionnent au démarrage. Aucun serveur, aucun token,
 │  aucun redéploiement nécessaire. Le Gist s'édite en 2 clics pour publier
 │  de nouveaux modèles à tous les utilisateurs.
 │
 ├─[10] Découverte dynamique .... [Énumération API après clé] ....... ⬡ 0%
 │      └─> Après saisie de clé dans Init, interroger le endpoint
 │           /models du provider pour enrichir le registry avec les
 │           IDs réellement disponibles. Marqueur ★ préservé sur défaut.
 ├─[11] Interface registry ...... [Gestionnaire sync Gist in-app] ... ⬡ 0%
 └─[12] Prompts open-source ..... [Bibliothèque publique d'agents] .. ⬡ 0%

 [ PHASE V4 : MULTIJOUEUR ] ...................................... STATUT: DISTANT
 │
 │  Principe de design (décidé 2026-03) :
 │  Chaque joueur gouverne une nation dans un monde partagé. Les joueurs
 │  NE partagent PAS le même écran — chacun a sa propre session de conseil
 │  et vote indépendamment. Les effets croisés se propagent via la couche
 │  de déclencheurs systémiques (Phase V2). Aucune synchronisation en temps
 │  réel n'est nécessaire : les tours se résolvent de manière asynchrone,
 │  l'état du monde fusionne à la clôture du cycle.
 │
 │  populationWeight déjà câblé dans handleVote() :
 │    total = population / 1_000_000 × 10 × 10_000
 │  Sera exposé proprement quand l'architecture serveur sera décidée.
 │
 │  Stack probable : relais Node.js léger + JSON monde partagé,
 │  ou serverless (Supabase / PocketBase) pour la sync d'état monde.
 │  Les clés API restent côté client — elles ne touchent jamais le serveur.
 │
 ├─[13] État monde partagé ...... [Serveur ou P2P world JSON] ....... ⬡ 0%
 ├─[14] Résolution tours async .. [Fusion monde à clôture cycle] .... ⬡ 0%
 ├─[15] Isolation nation joueur . [Chaque joueur = 1 conseil] ........ ⬡ 0%
 ├─[16] Événements inter-nations  [Sécession, Guerre, Alliance] ..... ⬡ 0%
 └─[17] Sauvegarde / Import ..... [Snapshots monde portables] ....... ⬡ 0%

 [ PHASE V5 : GUERRE & GÉOPOLITIQUE ] ........................... STATUT: DISTANT
 ├─[18] Friction frontalière .... [Conflit aux bords des polygones] .. ⬡ 0%
 ├─[19] La Grande Scission ...... [Sécession avec déchirement carte] . ⬡ 0%
 └─[20] Épuisement ressources ... [Rendements par territoire] ........ ⬡ 0%

================================================================================
 PROGRESSION : [████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] ~12%
 BASE : Moteur de délibération complet. Carte & multijoueur en attente.
================================================================================
```

---

## Journal des décisions d'architecture

### Registry LLM (2026-03)
**Décision :** `llm-registry.json` hébergé sur Gist public comme source de vérité partagée, `localStorage` comme couche de surcharge personnelle.

Les approches standard (Option A : localStorage seul / Option B : télécharger JSON → git push) ont toutes deux des défauts. L'architecture adoptée fusionne les deux proprement :

- `llm-registry.json` sur un Gist public = ce que tous les utilisateurs voient par défaut
- `localStorage` = surcharges personnelles, persistantes entre sessions, effaçables intentionnellement
- Fusion au démarrage : le Gist gagne sur les clés partagées, localStorage gagne sur les ajouts personnels
- Pour publier un nouveau modèle à tous les utilisateurs : éditer le Gist en 2 clics, aucun redéploiement
- Fallback codé en dur dans le bundle si le Gist est inaccessible (résilience aux pannes réseau)

**Amélioration future :** après saisie de la clé API dans Init, interroger l'endpoint `/models` de chaque provider pour découvrir les IDs de modèles réellement disponibles. Le registry devient alors une couche de défauts curatés, pas une contrainte.

### Carte du monde (2026-03)
**Décision :** Concept hex-grid (V1/V4 original) remplacé par SVG low-poly procédural.

Les hex-grids sont géométriquement élégants mais se heurtent au modèle de rendu SVG de React et à l'esthétique existante d'ARIA (globe PRNG polygonal, superposition paper-craft). La nouvelle direction préserve tous les objectifs de design originaux (logique ZEE → adjacence polygonale, biomes de terrain → strates d'élévation, friction frontalière → détection de conflit sur les arêtes) tout en restant natif au renderer existant.

### Multijoueur (2026-03)
**Décision :** Asynchrone, isolation par nation, clés LLM côté client.

La synchronisation en temps réel entre sessions de conseil est inutile et coûteuse. Chaque joueur exécute localement son conseil complet ; seuls les deltas d'état du monde (résultats de votes, changements territoriaux, événements diplomatiques) sont partagés. Les clés API ne quittent jamais le client — le serveur est un relais d'état monde léger, pas un proxy IA.

---

*Voir [README.md](README.md) pour l'installation · [README.fr.md](README.fr.md) pour la doc française*
