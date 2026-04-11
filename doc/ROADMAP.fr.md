# 🗺️ ARIA — Feuille de route stratégique

> *English: [ROADMAP.md](ROADMAP.md)*

```text
================================================================================
  ARIA FEUILLE DE ROUTE STRATÉGIQUE  —  v8.0
  Dernière mise à jour : 2026-04-11
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

 [ MODE BOARD GAME — PIPELINE OFFLINE ] ........................... STATUT: ✅ FAIT
 ├─[✓] Questions ................. [aria_questions.json FR+EN] ........ ■ 100%
 ├─[✓] Réponses ministres ........ [aria_reponses.json — archétype × régime × posture] ■ 100%
 ├─[✓] Synthèses délibération .... [aria_syntheses.json — ministère × régime × convergence] ■ 100%
 ├─[✓] Annotations cercle ........ [aria_annotations.json — ministère × régime] ■ 100%
 └─[✓] Routing offline ........... [keywords → ministère · garbage → random] ■ 100%
        └─> 100% du contenu éditorial en JSON · zéro phrase hardcodée dans le moteur

 [ SOURCE UNIQUE DE VÉRITÉ ] ...................................... STATUT: ✅ FAIT
 ├─[✓] simulation.json enrichi ... [aria_irl_base · sat_base · bloc · couleur · pop_base] ■ 100%
 ├─[✓] governance.json nettoyé ... [chance supprimé · industrie · oracle · wyrd · destin] ■ 100%
 ├─[✓] Constantes hardcodées ..... [toutes supprimées → getStats()/getAgents() lookup] ■ 100%
 └─[✓] Industrie par défaut ...... [remplace chance dans toute l'UI et le moteur] ..... ■ 100%

 [ DESTINÉE DU MONDE ] ............................................ STATUT: ✅ FAIT
 ├─[✓] Oracle + Wyrd ............. [agents philosophiques dans ministers{}] ......... ■ 100%
 │      └─> Pas un ministère — bloc destin séparé de ministries[]
 ├─[✓] Détection crise ........... [detectCrisis() — keywords destin, sync, local] .. ■ 100%
 ├─[✓] runDestinPhase() .......... [AI + fallback aria_reponses.json] ............... ■ 100%
 ├─[✓] Injection présidence ...... [destinVoices → runPresidencePhase()] ............ ■ 100%
 ├─[✓] Toggles UI ................ [destiny_mode + crisis_mode dans Settings + Modal] ■ 100%
 ├─[✓] Réponses oracle/wyrd ...... [aria_reponses.json — 7 régimes × 3 postures, FR+EN] ■ 100%
 └─[✓] Questions destin .......... [aria_questions.json — 7 crises existentielles, FR+EN] ■ 100%

 [ MODE COLLÉGIAL + CRISE ] ...................................... STATUT: ✅ FAIT
 ├─[✓] B10 — Mode collégial ...... [?? null + active !== null dans agentsManager] ... ■ 100%
 │      └─> [] (présidence désactivée) déclenche bien _runCollegialPhase
 ├─[✓] B11 — Mode crise .......... [runCrisisPhase() — tous ministères || skip cercle+pres] ■ 100%
 ├─[✓] Synthèses collégiales JSON . [aria_syntheses.json collegial — 7 régimes, FR+EN] ■ 100%
 │      └─> getSyntheseCollegial() dans responseService · câblé dans _runCollegialPhase
 └─[✓] UI mode collégial ......... [SYNTHÈSE CONSTITUTIONNELLE · referendum non-littéral] ■ 100%

 [ INTERFACE UTILISATEUR ] ....................................... STATUT: ✅ FAIT
 ├─[✓] Curseurs SVG or ........... [4 curseurs #c6a24c · toggle Settings > INTERFACE] . ■ 100%
 ├─[✓] RadioPlayer topbar ........ [5 stations · localStorage · URL + fichier local] .. ■ 100%
 └─[✓] Settings > INTERFACE ....... [section dédiée : curseurs + radio] ............. ■ 100%

 [ DOCUMENTATION ] ............................................... STATUT: ✅ FAIT
 ├─[✓] CONTRIBUTING.md + .fr.md .. [schémas JSON 10 fichiers · contraintes vérifiées] ■ 100%
 └─[✓] doc/ réorganisé ........... [tous les .md de suivi dans doc/] ............... ■ 100%

 [ CONSTITUTION PAR PAYS ] ........................................ STATUT: ✅ FAIT
 ├─[✓] Override gouvernance ...... [Fork constitution indépendante] .. ■ 100%
 │      └─> Chaque nation peut avoir ses propres ministres, ministères, présidence
 ├─[✓] Routage moteur conseil ... [getAgentsFor(country)] ........... ■ 100%
 │      └─> Le conseil utilise toujours la bonne constitution par pays
 ├─[✓] UI Init peaufinée ........ [Glow, cartes sombres, emojis] .... ■ 100%
 │      └─> Style glow ministres/ministères · tags pays fictifs · accordéon récap
 └─[✓] Dialog récap monde ....... [Accordéon : prés/min/ministres] .. ■ 100%

 ████████████████████████████████████████  À VENIR  ██████████████████████████

 [ PHASE B0 : STABILISATION ] .................................... STATUT: ✅ TERMINÉ
 │
 ├─[B1] Bug ajout pays in-game .. [addFictionalCountry — Dashboard_p1] ✅ 100%
 └─[B2] Pipeline Country Context  [Init → délibérations in-game] ..... ✅ 100%

 [ PHASE B1 : STABILISATION II ] ................................ STATUT: ✅ TERMINÉ
 │  Bugs post-refactor + moteur délibération
 │
 ├─[B7]  setCurrentCycleQuestion → setCurrentCycleQuestions ......... ✅ corrigé
 ├─[B8]  getTerrainLabel non défini dans AddCountryModal ............. ✅ corrigé
 ├─[B13] Bouton Actualiser (💡) disparu dans les questions ........... ✅ corrigé
 └─[B9]  Routing ministère invalide sur question de liste ............ ✅ corrigé (refactor useCouncilSession)
 ├─[B12] Mode destin désactivé mais Oracle/Trame actifs .............. ✅ corrigé
 ├─[B14] Settings > Ministères : grille ministres par ministère ....... ✅ corrigé
 ├─[B15] ConstitutionModal > Présidence : prompts Phare/Boussole ..... ✅ corrigé
 ├─[B10] Mode collégial → synthèse présidentielle incorrecte ......... ✅ corrigé
 └─[B11] Mode crise : phases cercle + présidence non skippées ........ ✅ corrigé

 [ PHASE U1 : POLISH UX ] ........................................ STATUT: EN COURS
 ├─[U1] Icônes régimes ........... [Listes déroulantes Init + in-game] ✅ 100%
 ├─[U2] Harmonisation tuiles .... [PresidencyTiles partagé — 4 écrans] ✅ 100%
 │      └─> Settings · GovernanceForm · ConstitutionModal · PreLaunchScreen
 └─[U3] Chronolog enrichi ........ [Détail 5 derniers cycles] ........ ▶ PROCHAIN

 [ PHASE G1 : COHÉRENCE GOUVERNANCE ] ........................... STATUT: EN COURS
 │  Spec validée (2026-03-26) — GovernanceForm existe, wiring à compléter
 │
 ├─[G0] clearSession() : conserver aria_options + préférences ........ ✅ vérifié (aucun bug)
 ├─[G1] PreLaunchScreen : bloc contextuel ancré sous badge pays ...... ✅ 100%
 │      └─> Lambda ⚙️ + résumé présidence + [Personnaliser →] · Custom ✦ + résumé override
 ├─[G2] ConstitutionModal : bandeau lambda/custom + retour modèle .... ✅ 100%
 │      └─> Bandeau statut entre header/tabs · [↺ Revenir au modèle monde] + confirm
 ├─[G3] AddCountryModal + SecessionModal : choix hériter/personnaliser ⬡ 0%
 └─[G4] Settings : brancher GovernanceForm context='settings' ........ ⬡ 0%

 [ PHASE V1 : CARTE DU MONDE — REFONTE COMPLÈTE ] ................ STATUT: PLANIFIÉ
 │
 │  ⚠ REFONTE TOTALE : toute la génération procédurale est à reconstruire.
 │  L'approche hex-grid est abandonnée. La nouvelle direction est définie
 │  par l'architecte du projet. Le moteur de conseil et le modèle de données
 │  pays sont agnostiques à la carte et ne seront pas impactés.
 │
 ├─[01] Nouveau moteur procédural  [Architecture à définir] ......... ⬡ 0%
 ├─[02] Assignation polygones .... [Pool territoires → formes pays] .. ⬡ 0%
 ├─[03] Projection globe ......... [Planisphère / sphère WebGL] ...... ⬡ 0%
 ├─[04] Zoom dynamique ........... [Niveaux de détail x1-x5] ......... ⬡ 0%
 ├─[05] Zones maritimes .......... [Superposition adjacence navale] ... ⬡ 0%
 └─[06] Biomes de terrain ........ [Élévation style paper-craft] ..... ⬡ 0%

 [ PHASE F1 : FONCTIONNALITÉS MULTI-PAYS ] ....................... STATUT: EN FILE
 │
 │  Bloqué sur la refonte V1 — les interactions entre pays dépendent
 │  de la géographie.
 │
 ├─[F1] Min. 2 pays en custom .... [Mode custom limité à 1 actuellement] ⬡ 0%
 ├─[F2] Blocage doublons ......... [Pays réel sélectionnable une fois] ⬡ 0%
 └─[F3] Settings multi-pays ...... [Config commune vs par pays] ....... ⬡ 0%

 [ PHASE V2 : DÉCLENCHEURS SYSTÉMIQUES ] ......................... STATUT: EN FILE
 ├─[V6] Répercussions mondiales .. [Effets croisés entre pays] ....... ⬡ 0%
 │      └─> "Si le Pays A taxe l'IA → le Pays B gagne en Commerce,
 │           perd en Diplomatie. Propagé dans le contexte du conseil."
 ├─[V7] Protocole de crise ....... [Référendums d'urgence] ........... ⬡ 0%
 ├─[V8] Hub de scénarios ......... [Présets historiques & sandbox] ... ⬡ 0%
 └─[V9] i18n couverture complète .. [Audit → centraliser → traduire] . ⬡ 0%
        ├─> Audit des chaînes franglais inline (isEn ? '…' : '…')
        ├─> Centralisation ~300 chaînes + prompts IA vers ariaI18n.js
        ├─> Traduction complète FR/EN de toute l'interface
        ├─> Sync base_agents_en.json ↔ base_agents.json
        └─> ariaQA_en.json (quand ariaQA sera créé)

 [ PHASE V3 : INFRASTRUCTURE LLM ] ............................... STATUT: EN FILE
 ├─[V10] Découverte dynamique .... [Énumération API après clé] ....... ⬡ 0%
 ├─[V11] Interface registry ...... [Gestionnaire sync Gist in-app] ... ⬡ 0%
 └─[V12] Prompts open-source ..... [Bibliothèque publique d'agents] .. ⬡ 0%

 [ PHASE V4 : QUALITÉ & MAINTENABILITÉ ] ......................... STATUT: EN FILE
 ├─[V5] Refactor arborescence ... [src/components · engine · lib] .... ⬡ 0%
 └─[V8] Optimisation moteur ..... [Re-renders · useCallback · appels IA] ⬡ 0%

 [ PHASE V5 : MULTIJOUEUR ] ...................................... STATUT: DISTANT
 │
 │  Principe de design (décidé 2026-03) :
 │  Chaque joueur gouverne une nation dans un monde partagé.
 │  Tours asynchrones, sessions de conseil isolées par nation,
 │  clés API côté client uniquement.
 │
 ├─[V13] État monde partagé ...... [Serveur ou P2P world JSON] ....... ⬡ 0%
 ├─[V14] Résolution tours async .. [Fusion monde à clôture cycle] .... ⬡ 0%
 ├─[V15] Isolation nation joueur . [Chaque joueur = 1 conseil] ........ ⬡ 0%
 ├─[V16] Événements inter-nations  [Sécession, Guerre, Alliance] ..... ⬡ 0%
 └─[V17] Sauvegarde / Import ..... [Snapshots monde portables] ....... ⬡ 0%

 [ PHASE V5 : GUERRE & GÉOPOLITIQUE ] ........................... STATUT: DISTANT
 ├─[V18] Friction frontalière .... [Conflit aux bords des polygones] .. ⬡ 0%
 ├─[V19] La Grande Scission ...... [Sécession avec déchirement carte] . ⬡ 0%
 └─[V20] Épuisement ressources ... [Rendements par territoire] ........ ⬡ 0%

================================================================================
 PROGRESSION : [██████████░░░░░░░░░░░░░░░░░░░░░░░░] ~30%
 BASE : Moteur + constitution par pays complets.
        Init UX poli. Mode Board Game offline complet (pipeline 4 JSON).
        Source unique de vérité. Destinée du Monde opérationnelle.
        PresidencyTiles unifié. Mode collégial + crise opérationnels.
        Interface : curseurs SVG or + RadioPlayer topbar.
        Documentation : CONTRIBUTING complet + doc/ réorganisé.
        Phase B1 terminée — tous les bugs B1→B15 corrigés.
        Refactor qualité (2026-04-11) : arborescence src/ restructurée,
        fichiers morts supprimés, responsabilités storage/options clarifiées.
        Prochain : U3 Chronolog enrichi.
================================================================================
```

---

## Journal des décisions d'architecture

### Constitution par pays (2026-03)
**Décision :** Chaque pays porte son propre objet `governanceOverride`, résolu au moment de l'appel au conseil via `getAgentsFor(country)`.

L'approche naïve (une constitution globale pour tous les pays) a été dépassée dès que les mondes multi-pays ont nécessité une gouvernance indépendante. Le pattern adopté : `InitScreen` forke la constitution commune par pays → `Dashboard_p1` injecte `governanceOverride` dans chaque objet pays à la construction du monde → `llmCouncilEngine` résout la constitution effective à l'appel, avec fallback sur le localStorage global si aucun override n'existe. Cela maintient le moteur sans état et l'objet pays autonome.

### Registry LLM (2026-03)
**Décision :** `llm-registry.json` hébergé sur Gist public comme source de vérité partagée, `localStorage` comme couche de surcharge personnelle.

- Gist public = ce que tous les utilisateurs voient par défaut
- `localStorage` = surcharges personnelles, persistantes entre sessions
- Fusion au démarrage : le Gist gagne sur les clés partagées, localStorage sur les ajouts personnels
- Publier un nouveau modèle : éditer le Gist en 2 clics, aucun redéploiement
- Fallback codé en dur si le Gist est inaccessible

### Carte du monde (2026-03 → révisé)
**Décision :** Refonte complète de la génération procédurale. Les directions hex-grid et SVG low-poly sont toutes deux abandonnées. La nouvelle architecture est définie par l'architecte du projet. Le moteur de conseil et le modèle de données pays sont délibérément agnostiques à la carte et ne seront pas impactés par la refonte.

### Multijoueur (2026-03)
**Décision :** Asynchrone, isolation par nation, clés LLM côté client. Le serveur est un relais d'état monde léger uniquement — les clés API ne le traversent jamais.

---

*Voir [README.md](README.md) pour l'installation · [README.fr.md](README.fr.md) pour la doc française*
