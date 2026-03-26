# ARIA — Document de présentation
*Simulation de gouvernance multi-agents · v7.5 · 2026*

---

## I. Ce qu'est ARIA

ARIA est un simulateur de gouvernance dans lequel vous dirigez une ou plusieurs nations à travers des cycles de délibération collective. Chaque décision est débattue par un **Conseil de 12 ministres**, arbitrée par une **Présidence configurable**, et soumise au **vote du peuple**.

Ce n'est pas un jeu de stratégie. C'est un espace de pensée politique expérimentale — pour explorer ce que donnerait une démocratie augmentée, une théocratie collégiale, ou un régime autoritaire confronté à une crise existentielle.

**ARIA peut fonctionner de deux façons :**
- **Avec des LLM** (Claude, Gemini, Grok, OpenAI) — chaque ministre délibère vraiment, les synthèses sont générées, les positions évoluent au fil des cycles.
- **Sans aucune IA** (Mode Board Game) — tout le contenu éditorial est préchargé dans des fichiers JSON. Zéro API, zéro latence, jouable hors connexion.

---

## II. Le Conseil — Architecture de la délibération

### Les 12 Ministres

Chaque ministre incarne un **archétype astrologique**. Ce n'est pas de la mystique : c'est une façon de donner à chaque agent une philosophie cohérente, une posture distinctive, une façon d'argumenter qui lui est propre.

| Ministre | Signe | Rôle dans le débat |
|---|---|---|
| ♈ L'Initiateur | Bélier | Rupture, action directe, urgence |
| ♉ Le Gardien | Taureau | Continuité, solidité, prudence patrimoniale |
| ♊ Le Communicant | Gémeaux | Liens, pluralité, information |
| ♋ Le Protecteur | Cancer | Sécurité, émotionnel, filet social |
| ♌ L'Ambassadeur | Lion | Prestige, rayonnement, consensus mou |
| ♍ L'Analyste | Vierge | Précision, audit, critique systémique |
| ♎ L'Arbitre | Balance | Équité, procédure, juste milieu |
| ♏ L'Enquêteur | Scorpion | Risques cachés, corruption, transformations |
| ♐ Le Guide | Sagittaire | Vision longue, philosophie, horizon 20 ans |
| ♑ Le Stratège | Capricorne | Durabilité, efficience, structures |
| ♒ L'Inventeur | Verseau | Rupture technologique, réinvention |
| ♓ Le Guérisseur | Poissons | Dimension humaine, soin, profondeur spirituelle |

Chaque ministre a une **posture par défaut** (radical · prudent · statu quo), une **essence**, un **style de communication**, et une **annotation** — la question qu'il pose systématiquement au Conseil.

Tout est **modifiable** : prompts, essences, postures, noms, couleurs. Chaque nation peut avoir ses propres ministres.

---

### Les 7 Ministères

| Ministère | Emoji | Domaine |
|---|---|---|
| Justice et Vérité | ⚖️ | Équité procédurale, lutte contre la corruption |
| Économie et Ressources | 💰 | Flux économiques, réserves, croissance |
| Défense et Souveraineté | ⚔️ | Sécurité nationale, stratégie longue durée |
| Santé et Protection Sociale | 🏥 | Filet social, bien-être, santé publique |
| Éducation et Élévation | 🎓 | Savoir, culture, transmission |
| Transition Écologique | 🌿 | Rupture sobre, biodiversité, énergie |
| Industrie et Infrastructures | ⚙️ | Production, systèmes circulatoires, infrastructure |

Chaque question posée est **routée automatiquement** vers le ministère compétent (par analyse sémantique ou keywords). Si la question est transversale ou inclassable, elle déclenche un **mode bureaucratique** qui engage le Conseil complet.

---

### La Présidence — 4 configurations

La Présidence arbitre après les délibérations des ministres. Ce n'est pas un chef : c'est un **synthétiseur de dernière instance**.

| Mode | Symbole | Résumé |
|---|---|---|
| **Solaire — Phare** | ☉ | Phare seul. Vision de long terme, autorité assumée, direction claire. |
| **Lunaire — Boussole** | ☽ | Boussole seule. Mémoire du peuple, intuition, protection instinctive. |
| **Duale** | ☉☽ | Phare + Boussole à égalité absolue. Pas de vice-président : deux voix souveraines. |
| **Collégiale** | ✡ | Aucune présidence. Les 12 ministres synthétisent directement. Vote constitutionnel. |

La présidence **n'est pas un décorateur** : en mode ARIA (LLM), chaque figure génère sa propre position avant la synthèse finale. En mode Board Game, les synthèses JSON sont différenciées par mode.

---

### Les 6 phases d'une délibération

```
1. PEUPLE        → la question entre dans le Conseil
2. MINISTÈRE     → 2 ministres assignés délibèrent
3. CERCLE        → les autres ministères annotent
4. [DESTINÉE]    → Oracle + Wyrd interviennent si crise détectée (optionnel)
5. PRÉSIDENCE    → synthèse arbitrale (ou constitutionnelle si ✡)
6. VOTE          → le peuple tranche. La satisfaction fluctue.
```

Le vote peut être **OUI/NON** (référendum) ou **PHARE/BOUSSOLE** (arbitrage binaire entre deux visions).

---

## III. Modes d'expérience

### Mode LLM — Délibération vivante

Chaque rôle peut être assigné à un provider et modèle différent :

| Rôle | Clé IA | Ce qu'il génère |
|---|---|---|
| Ministre A | Provider 1 | Position, argument, mot-clé |
| Ministre B | Provider 2 | Contre-position, nuance |
| Synthèse ministère | Provider 3 | Convergence ou divergence + recommandation |
| Cercle | Provider | Annotations courtes des autres ministères |
| Phare | Provider 4 | Vision présidentielle |
| Boussole | Provider 5 | Mémoire présidentielle |
| Synthèse présidence | Provider 6 | Arbitrage final + question au vote |

Modes d'architecture disponibles :
- **ARIA** — multi-provider orchestré
- **SOLO** — un seul provider pour tout (cohérence maximale)
- **CUSTOM** — assignation rôle par rôle

---

### Mode Board Game — Zéro IA

Activable depuis l'écran d'accueil. Aucune clé API requise.

Le contenu éditorial complet est embarqué dans des fichiers JSON :

- `aria_questions.json` — pools de questions par ministère + questions existentielles
- `aria_reponses.json` — réponses archétype × régime × posture (radical · prudent · statu quo)
- `aria_syntheses.json` — synthèses de délibération (ministère × régime × convergence)
- `aria_annotations.json` — annotations du cercle inter-ministériel

Tous ces fichiers ont un **miroir EN complet** sous `templates/languages/en/`.

En Mode Board Game :
- Les questions arrivent depuis le pool JSON (routage keyword ou aléatoire)
- Chaque ministre répond selon son archétype × le régime actif × sa posture
- Les synthèses et annotations sont extraites du JSON correspondant
- Le vote est calculé, la satisfaction fluctue, le chronolog s'alimente

**Jouable en solo, à plusieurs, ou en atelier** — sans connexion, sans serveur.

---

## IV. Les Nations — Personnalisation totale

### Ce qu'une nation contient

Chaque pays dans ARIA n'est pas seulement un nom et un drapeau. C'est une entité politique complète :

- **Régime politique** (parmi 12 — voir section VI)
- **Présidence configurée** (Phare · Boussole · Duale · Collégiale)
- **Constitution des ministères** (lesquels sont actifs, leurs prompts)
- **Agents personnalisés** (essences, styles, postures propres à cette nation)
- **Score ARIA** (indice de santé démocratique)
- **Satisfaction populaire** (fluctue à chaque vote)
- **Ressources, terrain, bloc géopolitique**

### Ce qui est personnalisable, partout, tout le temps

Depuis l'**écran Init**, avant le lancement :
- Choisir ou générer un monde (seed déterministe)
- Configurer la gouvernance globale du monde (présidence par défaut, ministères actifs)
- Surcharger la constitution de chaque pays indépendamment

Depuis la **modale Constitution** (in-game), en cours de partie :
- Changer le régime d'un pays
- Basculer la présidence
- Activer/désactiver des ministères et ministres individuellement
- Modifier les prompts de chaque agent
- Revenir au modèle monde par défaut

Depuis les **Settings**, à tout moment :
- Changer de mode IA
- Reconfigurer les assignations provider/modèle
- Modifier la gouvernance par défaut
- Activer ou désactiver la Destinée du Monde

Il n'y a pas de "configuration définitive". Tout peut être reconditionné entre deux cycles.

---

## V. La Destinée du Monde — Oracle & Wyrd

### Le contexte

Certaines crises ne sont pas du ressort d'un ministère. Elles sont **existentielles** — épidémie mondiale, effondrement climatique, découverte d'une intelligence non-humaine, contact extraterrestre. Le jeu politique ordinaire ne suffit pas.

La **Destinée du Monde** est un bloc séparé du Conseil — ni ministère, ni présidence. Ce sont deux voix philosophiques qui interviennent quand le tissu de la réalité se déchire.

### L'Oracle (👁️)

Lit les signes. Décode les probabilités cachées derrière la question posée. Voit ce que les ministres refusent de voir. L'Oracle ne tranche pas — il révèle ce qui est en train de se passer.

### La Trame / Wyrd (🕸️)

Retourne l'aléa en volonté. Ce que le destin vous impose, la Trame vous force à en faire un choix. Wyrd ne prédit pas — elle oblige à décider malgré l'incertitude.

### Déclenchement

- L'activation est **globale** (Settings > Gouvernance) ou **par pays** (Constitution)
- La détection de crise est **automatique** : si les keywords de la question recoupent les domaines existentiels, le mode crise s'enclenche
- En mode crise : **tous les ministères délibèrent en parallèle**, le cercle et la présidence sont court-circuités, les deux voix de la Destinée s'injectent dans la synthèse finale

### Lien avec la dimension spirituelle

La Destinée n'est pas religieuse au sens institutionnel. Mais elle occupe l'espace que certains systèmes de gouvernance confient à un Ministère du Culte ou des Affaires Religieuses — **les questions sans réponse rationnelle, les limites de la politique**.

Dans les régimes théocratiques, la Destinée est activée par défaut.

---

## VI. Les Régimes Politiques

12 régimes disponibles. Chacun affecte :
- Le **multiplicateur de satisfaction** (comment le peuple réagit aux décisions)
- Le **taux de croissance économique** par défaut
- Le **score ARIA de base** (mesure de santé démocratique)
- Les **synthèses JSON** des ministres et présidents (ton différent selon le régime)
- Les **réponses archétypées** de chaque agent (postures adaptées au contexte politique)

| Régime | Emoji | Bloc | Score ARIA | Satisfaction × |
|---|---|---|---|---|
| Démocratie Libérale | 🗳️ | Occident | 48 | 1.2× |
| Démocratie Directe | 🗳️ | Occident | 52 | 1.35× |
| République Fédérale | 🏛️ | Occident | 44 | 1.0× |
| Monarchie Constitutionnelle | 👑 | Occident | 38 | 0.9× |
| Technocratie ARIA | 🤖 | Techno | 72 | 0.85× |
| Communisme | ☭ | Est | 32 | 0.78× |
| Oligarchie | 💼 | Autoritaire | 26 | 0.75× |
| Monarchie Absolue | 👑 | Autoritaire | 28 | 0.72× |
| Théocratie | 🕌 | Autoritaire | 18 | 0.8× |
| Régime Autoritaire | 🔒 | Autoritaire | 20 | 0.65× |
| Nationalisme Autoritaire | ⚡ | Autoritaire | 14 | 0.68× |
| Junte Militaire | 🎖️ | Autoritaire | 16 | 0.7× |

Le **Score ARIA** n'est pas un jugement moral — c'est un indice de résilience systémique. Une théocratie bien gérée peut dépasser une démocratie en crise.

Chaque pays peut avoir son propre régime. Deux nations peuvent délibérer sur la même question avec des constitutions radicalement opposées — et obtenir des réponses incompatibles.

---

## VII. Le Chronolog

À chaque cycle, ARIA enregistre dans le **Chronolog** :
- La question soumise au Conseil
- Les positions des ministres
- La synthèse présidentielle
- Le résultat du vote
- L'impact sur la satisfaction et le score ARIA

Le Chronolog sert aussi de **mémoire injectée dans les prompts** : au bout de 5 cycles, les délibérations précédentes sont résumées et intégrées dans le contexte de chaque nouvelle question. Les agents se souviennent.

---

## VIII. Ce qui est jouable aujourd'hui

| Fonctionnalité | État |
|---|---|
| Conseil multi-LLM (6 phases) | ✅ Complet |
| Mode Board Game (zéro IA) | ✅ Complet |
| 4 modes de présidence | ✅ Complet |
| 12 régimes politiques | ✅ Complet |
| Mode crise (tous ministères) | ✅ Complet |
| Mode collégial (✡) | ✅ Complet |
| Destinée du Monde (Oracle + Wyrd) | ✅ Complet |
| Constitution par pays (in-game) | ✅ Complet |
| Personnalisation agents (prompts, essences) | ✅ Complet |
| Sécession et nouvelles nations | ✅ Complet |
| Chronolog avec snapshots de cycle | ✅ Complet |
| Carte du monde (génération procédurale) | ⬡ Refonte à venir |
| Multijoueur réseau | ⬡ Base server.js posée |

---

## IX. Ce qu'ARIA n'est pas

ARIA **n'est pas** un simulateur de stratégie où il faut maximiser des stats. La satisfaction peut rester basse pendant des dizaines de cycles si le régime est autoritaire — c'est cohérent, pas une erreur.

ARIA **n'est pas** un outil de propagande. Tous les régimes sont jouables, toutes les postures sont représentées. Le Guide libéral et l'Enquêteur d'une junte militaire utilisent le même moteur — seules les synthèses JSON changent.

ARIA **est** un espace de réflexion sur ce que gouverner veut dire — quelles questions méritent d'être posées, comment un système politique répond à la même crise selon ses valeurs fondamentales.

---

*Codebase en français — choix assumé. Contenu bilingue FR/EN (miroirs complets). Contributions bienvenues dans les deux langues.*
*[GitHub](https://github.com/flodus/aria-llm-council) · [Démo](https://flodus.github.io/aria-llm-council)*
