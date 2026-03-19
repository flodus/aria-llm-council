// src/ariaData.js

// ═══════════════════════════════════════════════════════════════════════════
//  ariaData.js
//  Base de données locale complète du projet ARIA
//  Contient : LOCAL_DELIBERATION + LOCAL_EVENTS
//
//  Usage :
//  import { LOCAL_EVENTS, LOCAL_DELIBERATION } from './ariaData';
// ═══════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL_DELIBERATION
//  Réponses types activées par le joueur (cycle, sécession, diplomatie).
//  Remplacées par appels IA si clé disponible.
//  Structure : ministers / ministries / presidency
//  Situations : cycle_normal | crise | secession | diplomatie | referendum
//  Situations spéciales par ministre : arbitrage | secret_detecte | menace | innovation
// ─────────────────────────────────────────────────────────────────────────────

export const LOCAL_DELIBERATION = {

    // ── MINISTRES ─────────────────────────────────────────────────────────────

    ministers: {

        initiateur: {
            cycle_normal: [
                "Le statu quo est notre ennemi. Cinq ans de passé, cinq ans de retard. Proposons une réforme immédiate du secteur énergétique.",
                "Chaque cycle d'hésitation coûte plus cher que l'action. Un pays qui n'avance pas recule.",
                "J'ai identifié trois leviers d'action immédiats. Aucun ne nécessite un vote. On commence maintenant.",
                "Pendant qu'on délibère, nos voisins agissent. Le premier avantage appartient à celui qui bouge en premier.",
            ],
            crise: [
                "La crise appelle l'action, pas la réflexion. Mobilisation totale. Maintenant.",
                "En temps de crise, l'hésitation est une décision — la pire. J'exige des mesures d'urgence.",
                "Chaque heure perdue en comités coûte des vies ou des ressources. Déléguez-moi l'autorité opérationnelle.",
                "Je n'attends pas l'unanimité du Conseil. J'attends le signal du Phare. Un seul signal suffit.",
            ],
            secession: [
                "Qu'ils partent s'ils le veulent. Notre force n'a pas besoin de ceux qui doutent.",
                "Une sécession est une blessure. Mais une blessure peut se cicatriser — si on agit vite.",
                "Fixons une date limite pour les négociations. Passé ce délai, nous décidons sans eux.",
                "La clarté vaut mieux que la lenteur. Tranchons vite, tranchons proprement.",
            ],
            diplomatie: [
                "L'alliance ne vaut que si elle est testée. Proposons une action commune immédiate.",
                "Les traités sans action sont du papier. Je vote pour une démonstration de force conjointe.",
                "Signons maintenant, ajustons après. L'immobilisme diplomatique est aussi dangereux que la guerre.",
                "Une alliance qui met six mois à se concrétiser est déjà morte. Accélérons.",
            ],
            referendum: [
                "Le peuple doit décider vite. Un référendum long affaiblit la résolution collective.",
                "Quelle que soit l'issue, nous agirons immédiatement après le résultat. Pas de délai d'application.",
            ],
        },

        gardien: {
            cycle_normal: [
                "Les réserves sont saines. Mais une marge de 8% sur les ressources alimentaires reste fragile pour un cycle de 5 ans.",
                "La croissance est réelle mais inégale. Trois régions accumulent, les autres stagnent. C'est une bombe à retardement.",
                "J'ai contrôlé les stocks stratégiques. Nous avons 14 mois d'autonomie. C'est correct — pas confortable.",
                "La dette s'érode lentement. Mais lentement ne veut pas dire sainement. Je demande un audit complet.",
            ],
            crise: [
                "Avant toute décision : état des stocks. Sans inventaire précis, toute mesure d'urgence est aveugle.",
                "Les crises se gèrent avec des réserves, pas des discours. Avons-nous de quoi tenir 18 mois ?",
                "Gel immédiat des dépenses non essentielles. Pas de promesses nouvelles tant que les fondations ne sont pas sécurisées.",
                "J'ai vu des nations s'effondrer par précipitation en crise. Lenteur calculée et réserves préservées — c'est ma doctrine.",
            ],
            secession: [
                "Calculons d'abord ce que nous perdons : ressources, population, accès aux routes. Ensuite on parle.",
                "Une sécession sans inventaire partagé, c'est une guerre économique à retardement.",
                "Je veux un bilan patrimonial complet avant toute signature. Les actifs communs ne se négocient pas à l'aveugle.",
                "Le partage des dettes est aussi important que le partage des richesses. Les deux partent ensemble.",
            ],
            diplomatie: [
                "Une alliance durable se bâtit sur des échanges économiques, pas sur des promesses politiques.",
                "Que gagnons-nous concrètement ? Que cédons-nous ? L'alliance doit être mesurable.",
                "Je veux voir les bilans financiers de l'autre partie avant de m'engager. La confiance ne suffit pas.",
                "Les accords qui ne précisent pas les contributions de chaque partie créent des conflits dans cinq ans.",
            ],
            referendum: [
                "Avant que le peuple vote, il doit connaître le coût exact de chaque option. J'exige une transparence budgétaire totale.",
                "Le résultat du référendum aura des implications financières sur vingt ans. Ce document en trace les contours.",
            ],
        },

        communicant: {
            cycle_normal: [
                "Le problème n'est pas la politique — c'est que personne ne la comprend. Reformulons avant d'agir.",
                "J'ai identifié trois groupes sociaux qui n'ont pas été consultés. Ce silence va coûter cher.",
                "L'information circule mal entre les ministères. J'ai recensé sept décisions contradictoires ce cycle.",
                "Une politique incomprise est une politique rejetée. Qui a lu les sondages de compréhension citoyenne ce mois-ci ?",
            ],
            crise: [
                "La crise s'aggrave parce que l'information ne circule pas. Ouvrons les canaux maintenant.",
                "Avant d'agir : qui sait quoi ? La confusion tue autant que la crise elle-même.",
                "Un message clair vaut mieux que dix communiqués contradictoires. Désignons un porte-parole unique.",
                "Les rumeurs circulent plus vite que les faits. Si nous ne remplissons pas le vide informationnel, quelqu'un d'autre le fera.",
            ],
            secession: [
                "La sécession est d'abord un échec de communication. A-t-on vraiment écouté leurs griefs ?",
                "Donnons-leur une tribune avant de les laisser partir. Le dialogue coûte moins cher que la séparation.",
                "Je demande une phase de dialogue public de 60 jours avant toute décision définitive.",
                "Les mouvements sécessionnistes prospèrent dans le silence institutionnel. Parlons — maintenant, pas après.",
            ],
            diplomatie: [
                "Une alliance sans communication bilatérale permanente est une coquille vide.",
                "Construisons d'abord un canal d'information commun. La confiance se construit par la transparence.",
                "Je propose un protocole de communication conjoint publié avant la signature. Les deux peuples méritent de comprendre.",
                "Les malentendus diplomatiques naissent du silence. Un accord sur les mots précède l'accord sur les actes.",
            ],
            referendum: [
                "La question du référendum doit être formulée en langage citoyen, pas en jargon juridique. Je demande une révision.",
                "J'ai testé la compréhension de la question auprès de 200 citoyens. 43% ne comprennent pas ce sur quoi ils votent. C'est un problème.",
            ],
        },

        protecteur: {
            cycle_normal: [
                "Les chiffres sont corrects. Mais dans les familles, l'inquiétude grandit. Ce décalage est dangereux.",
                "On oublie les 15% les plus fragiles à chaque cycle. Je demande une révision du filet social.",
                "Trois régions signalent une hausse de la précarité infantile. Ce n'est pas dans les indicateurs nationaux. Ça devrait l'être.",
                "La sécurité d'un pays se mesure à la qualité de vie de ses plus vulnérables. Nos chiffres mentent par omission.",
            ],
            crise: [
                "En crise, les plus vulnérables tombent les premiers. Protection sociale maximale avant toute mesure économique.",
                "Les enfants, les aînés, les malades — sont-ils protégés ? Si non, rien d'autre ne compte.",
                "J'exige que chaque mesure d'urgence inclue une évaluation d'impact sur les populations fragiles.",
                "On ne construit pas la résilience d'une nation en abandonnant ses membres les plus faibles au premier choc.",
            ],
            secession: [
                "Qu'adviendra-t-il des familles mixtes ? Des travailleurs frontaliers ? Ce sont des vies, pas des statistiques.",
                "La sécession brise des liens humains que les traités ne pourront jamais recoudre entièrement.",
                "Je demande des garanties explicites sur la continuité des allocations familiales et des retraites pour tous.",
                "Les enfants nés de parents des deux entités ne doivent pas devenir des apatrides de fait. Ce point est non-négociable.",
            ],
            diplomatie: [
                "Une alliance ne vaut que si elle protège aussi nos citoyens les plus exposés.",
                "Avant de signer : quelles protections sociales sont garanties pour nos ressortissants à l'étranger ?",
                "Je veux une clause de réciprocité sociale explicite. Nos citoyens ne sont pas des variables d'ajustement diplomatique.",
                "L'alliance doit prévoir des mécanismes de solidarité en cas de crise humanitaire dans l'un des deux pays.",
            ],
            referendum: [
                "Avant de voter, les citoyens doivent savoir comment chaque option affecte leur quotidien. Pas leurs intérêts abstraits — leur vie concrète.",
                "Je demande que les résultats du référendum soient communiqués avec une traduction en impact social immédiat.",
            ],
        },

        ambassadeur: {
            cycle_normal: [
                "Nous avons accompli quelque chose de grand ce cycle. Assurons-nous que le monde le sache.",
                "Notre image internationale est notre premier actif. Chaque décision doit la grandir.",
                "J'ai reçu trois demandes d'audience de délégations étrangères ce mois-ci. Notre rayonnement attire. Ne le gaspillons pas.",
                "Un pays qui ne raconte pas son histoire laisse les autres la raconter à sa place.",
            ],
            crise: [
                "Une crise bien gérée devient une légende. Comment voulons-nous que l'histoire raconte ce moment ?",
                "Ne laissons pas la panique dicter notre image. Maîtrisons le récit.",
                "Les partenaires étrangers observent notre gestion de crise. C'est un test de crédibilité internationale.",
                "Chaque communiqué de crise est aussi un message diplomatique. Choisissons nos mots pour les deux audiences.",
            ],
            secession: [
                "Comment cette sécession sera-t-elle perçue à l'étranger ? Notre réputation est en jeu.",
                "Si nous gérons cela avec dignité, nous en sortirons grandis. Si nous réagissons mal, nous en sortirons diminués.",
                "Je propose que les deux entités publient une déclaration commune de bonne foi. Le monde doit voir une séparation civilisée.",
                "Notre capacité à gérer pacifiquement cette sécession deviendra un modèle ou un repoussoir. À nous de choisir.",
            ],
            diplomatie: [
                "Cette alliance est une occasion de rayonnement. Faisons-en quelque chose de mémorable.",
                "Un accord signé dans la grandeur vaut plus qu'un accord signé dans la discrétion.",
                "Je propose une cérémonie de signature ouverte au public. La transparence diplomatique est elle-même un message.",
                "Cette alliance nous positionne dans un nouveau bloc régional. Jouons ce rôle avec panache.",
            ],
            referendum: [
                "Le référendum lui-même est un signal fort envoyé au monde : notre démocratie fonctionne et le peuple décide.",
                "Quelle que soit l'issue, nous la communiquerons avec fierté. La démocratie n'a pas à s'excuser de ses résultats.",
            ],
        },

        analyste: {
            cycle_normal: [
                "Trois indicateurs sont en dehors des normes. Je recommande une révision des protocoles avant le prochain cycle.",
                "Les données de satisfaction cachent une disparité régionale de 23 points. Ce n'est pas une moyenne, c'est un masque.",
                "Le modèle prédictif indique une probabilité de 67% de tension sociale dans les 10 prochaines années si le trend actuel persiste.",
                "J'ai recalculé les projections démographiques. Les hypothèses de base du plan quinquennal sont erronées de 12%.",
            ],
            crise: [
                "La crise a des causes précises. J'ai identifié deux failles structurelles qui auraient pu être corrigées il y a 10 ans.",
                "Avant d'agir : vérifions que nos outils de mesure fonctionnent. Décider sur de mauvaises données, c'est aggraver la crise.",
                "J'ai modélisé quatre scénarios de sortie de crise. Un seul évite la récurrence dans les 5 ans. Je recommande celui-là.",
                "Les données temps réel contredisent le rapport officiel sur trois points. Quelqu'un doit m'expliquer l'écart.",
            ],
            secession: [
                "J'ai modélisé trois scénarios de sécession. Dans deux cas sur trois, les coûts dépassent les bénéfices sur 20 ans.",
                "Les chiffres ne plaident pas pour la sécession. Mais les chiffres ne disent pas tout — et c'est ça le problème.",
                "Le PIB par habitant post-sécession chute en moyenne de 8% les trois premières années. C'est documenté, pas une opinion.",
                "J'ai besoin de 72 heures supplémentaires pour finaliser l'audit patrimonial. Décider sans lui serait une faute.",
            ],
            diplomatie: [
                "Les termes de l'accord présentent une asymétrie en notre défaveur sur les clauses économiques. Points 3, 7 et 12.",
                "J'ai audité les données partagées par l'autre partie. Deux inconsistances méritent clarification avant signature.",
                "Le taux de change implicite dans les clauses commerciales nous désavantage de 4,3% sur dix ans. Ce n'est pas négligeable.",
                "J'ai comparé cet accord avec 14 traités similaires conclus ces 30 dernières années. Notre position est en dessous de la médiane.",
            ],
            referendum: [
                "La question du référendum telle que formulée induit un biais de confirmation. Je recommande une reformulation neutre.",
                "Les projections statistiques sur les deux options sont disponibles dans l'annexe technique. Les citoyens méritent de les voir.",
            ],
        },

        arbitre: {
            cycle_normal: [
                "La politique adoptée ce cycle favorise les zones urbaines. Les zones rurales méritent une compensation équitable.",
                "Je note un consensus apparent — mais trois voix minoritaires n'ont pas été entendues. C'est un risque.",
                "L'équité ne se mesure pas seulement au résultat — elle se mesure aussi au processus. Avons-nous vraiment consulté tout le monde ?",
                "Une décision unanime dans ce Conseil m'inquiète plus qu'une décision conflictuelle. L'unanimité efface les nuances.",
            ],
            crise: [
                "En crise, la tentation est de concentrer le pouvoir. C'est précisément quand l'équilibre des droits est le plus important.",
                "Qui porte le coût de cette crise ? Si ce sont toujours les mêmes, ce n'est pas une gestion de crise — c'est une injustice.",
                "Les mesures d'exception doivent avoir une date d'expiration explicite. Aucun pouvoir d'urgence ne doit devenir permanent.",
                "Je propose un comité de surveillance indépendant pour chaque mesure d'urgence adoptée. La crise ne suspend pas la redevabilité.",
            ],
            secession: [
                "Avant tout : quels droits sont garantis à la minorité qui reste ? La sécession ne peut pas être un abandon.",
                "L'accord doit être juste pour les deux parties. Un traité déséquilibré est une guerre future.",
                "Je refuse de signer un accord qui ne contient pas de mécanisme de recours pour les citoyens lésés.",
                "L'équité dans la sécession ne se mesure pas à l'aune du plus fort — elle se mesure à l'aune du plus vulnérable.",
            ],
            diplomatie: [
                "L'alliance est-elle équitable ? Ou l'une des parties porte-t-elle un fardeau disproportionné ?",
                "Je demande une clause de révision à 5 ans. Aucun accord ne devrait être figé éternellement.",
                "Les bénéfices de l'alliance doivent être distribués équitablement entre les deux populations, pas seulement entre les élites.",
                "J'ai relu les 47 pages de l'accord. Il favorise systématiquement les intérêts des entreprises sur ceux des citoyens.",
            ],
            referendum: [
                "La décision appartient au peuple entier — pas à la majorité. Je demande des protections explicites pour les minorités quelle que soit l'issue.",
                "Un référendum juste nécessite une campagne équitable. J'observe un déséquilibre dans l'accès aux médias entre les deux camps.",
            ],
        },

        enqueteur: {
            cycle_normal: [
                "Les chiffres sont bons. Trop bons. Quelqu'un peut m'expliquer la divergence entre les rapports officiels et les données de terrain ?",
                "J'ai identifié trois flux financiers non documentés. Ce n'est peut-être rien. Ou c'est tout.",
                "Une source fiable m'a signalé des irrégularités dans les appels d'offres du dernier cycle. J'enquête.",
                "Le silence de certains membres du Conseil sur ce dossier est en lui-même une information.",
            ],
            crise: [
                "Cette crise n'est pas un accident. Quelqu'un a intérêt à ce qu'elle dure. Qui ?",
                "Avant de chercher des solutions : cherchons les causes réelles. Les causes officielles sont rarement les vraies.",
                "Suivez l'argent. Cette crise profite à quelqu'un, et je finirai par savoir qui.",
                "Le chaos est un écran de fumée. Pendant qu'on regarde l'incendie, quelqu'un vide les coffres.",
            ],
            secession: [
                "Qui finance le mouvement sécessionniste ? Une sécession ne surgit pas du néant.",
                "Les griefs exprimés sont-ils les vrais griefs, ou le paravent d'intérêts que nous n'avons pas encore identifiés ?",
                "J'ai retracé les financements du mouvement. Trois sources étrangères apparaissent dans les transactions des 18 derniers mois.",
                "La sécession a été préparée de longue date. Les documents que j'ai trouvés remontent à sept ans.",
            ],
            diplomatie: [
                "Qui bénéficie réellement de cette alliance ? Traçons les intérêts avant de signer.",
                "L'autre partie a des alliés que nous ne voyons pas. Je veux savoir qui tire les ficelles.",
                "J'ai accès à des informations sur la partie adverse qui changent l'analyse de cet accord. Réunion à huis clos requise.",
                "Les clauses de confidentialité de cet accord cachent quelque chose. Je veux savoir quoi avant de donner mon accord.",
            ],
            referendum: [
                "Quelqu'un cherche à influencer le résultat du référendum. Les traces numériques sont là. Je travaille à les remonter.",
                "La neutralité du processus référendaire doit être auditée de façon indépendante. Je ne fais confiance à aucune des parties en présence.",
            ],
            secret_detecte: [
                "J'ai trouvé une faille dans le rapport de l'Analyste. Quelqu'un a maquillé les chiffres du dernier cycle.",
                "Il y a un murmure dans les couloirs du ministère. Une trahison se prépare.",
                "Les métadonnées des documents officiels révèlent des modifications non tracées. Quelqu'un a réécrit l'histoire.",
                "J'ai croisé trois témoignages indépendants qui pointent vers la même personne. Je n'accuse pas encore — mais je surveille.",
            ],
            menace: [
                "Les pare-feu n'ont pas cédé par accident. C'est une clé d'accès interne qui a été utilisée. Nous avons un traître.",
                "L'attaque vient d'un serveur situé en zone neutre. Quelqu'un essaie de nous aveugler avant une offensive plus large.",
                "J'ai isolé la source de la fuite. Elle est dans cette salle. Je n'en dis pas plus ici.",
                "Le profil de l'attaquant correspond à un opérateur que nous connaissons. C'est une opération de représailles.",
            ],
        },

        guide: {
            cycle_normal: [
                "Dans 20 ans, les décisions de ce cycle seront soit notre fondation soit notre regret. Choisissons en conséquence.",
                "D'autres nations ont traversé cela avant nous. Leurs leçons sont disponibles. Avons-nous la sagesse de les consulter ?",
                "L'histoire juge les civilisations sur leurs cycles lents, pas sur leurs crises rapides. Que construisons-nous vraiment ?",
                "Nous ne sommes pas les premiers à faire face à ce dilemme. La bibliothèque des erreurs humaines est ouverte — lisons-la.",
            ],
            crise: [
                "Chaque grande civilisation a traversé sa crise fondatrice. C'est dans ces moments qu'on choisit ce qu'on veut être.",
                "La crise actuelle est une question : voulons-nous survivre, ou voulons-nous nous transformer ?",
                "Les crises qui ont détruit des nations n'étaient pas les plus violentes — c'étaient celles où le sens collectif s'était évaporé.",
                "Je vois dans cette crise une opportunité rare : celle de redéfinir notre contrat social. Saisissons-la.",
            ],
            secession: [
                "L'histoire montre que les sécessions réussies partagent un point commun : une vision claire de ce qu'on construit, pas seulement de ce dont on se sépare.",
                "Dans 50 ans, comment les deux nations regarderont-elles ce moment ? C'est ça la vraie question.",
                "Les peuples qui se séparent dans la dignité restent souvent plus proches que ceux qui restent ensemble dans le ressentiment.",
                "Cette sécession a besoin d'une philosophie fondatrice, pas seulement d'un traité. Qui va écrire le récit fondateur de la nouvelle entité ?",
            ],
            diplomatie: [
                "Cette alliance peut être le début d'une architecture régionale plus large. Pensons au-delà du traité immédiat.",
                "La vraie question n'est pas ce que nous gagnons aujourd'hui — c'est quel monde nous construisons ensemble.",
                "Les alliances qui durent sont fondées sur des valeurs partagées, pas sur des intérêts convergents. Lesquels partageons-nous vraiment ?",
                "Dans 30 ans, cette alliance sera soit le socle d'une communauté de destin, soit une parenthèse oubliée. C'est maintenant qu'on décide.",
            ],
            referendum: [
                "La décision appartient maintenant au peuple. C'est le moment le plus beau et le plus vertigineux de la démocratie.",
                "Quel que soit le résultat, il faudra lui donner un sens. La démocratie ne s'arrête pas au dépouillement.",
            ],
        },

        stratege: {
            cycle_normal: [
                "La structure institutionnelle tient. Mais trois précédents créés ce cycle pourraient être utilisés contre nous dans 30 ans.",
                "Le cadre réglementaire actuel ne survivra pas à deux crises simultanées. Renforçons-le maintenant.",
                "Les réformes faciles ont été faites. Ce qui reste est difficile, coûteux et nécessaire. C'est pour ça qu'on l'a évité jusqu'ici.",
                "Je pense à nos successeurs dans 20 ans. Est-ce qu'ils nous remercieront ou est-ce qu'ils hériteront de nos erreurs ?",
            ],
            crise: [
                "La crise révèle les failles structurelles que nous avons tolérées trop longtemps. C'est douloureux — et nécessaire.",
                "Une crise mal gérée crée des précédents dangereux. Chaque décision d'urgence doit être réversible.",
                "Je refuse les solutions rapides qui créent des problèmes lents. Même en crise, la structure doit tenir.",
                "Toute mesure d'exception adoptée aujourd'hui deviendra la norme de demain si on n'y prend pas garde.",
            ],
            secession: [
                "La sécession crée un précédent. Toutes nos minorités régionales l'observent. Notre réponse définira les règles pour les 50 prochaines années.",
                "Le traité de séparation doit être irréprochable. C'est notre Constitution régionale en miniature.",
                "Chaque clause de ce traité sera interprétée et réinterprétée pendant des décennies. Soyons précis jusqu'à l'obsession.",
                "J'exige un mécanisme d'arbitrage international pour les conflits futurs. Sans lui, ce traité est une déclaration de guerre différée.",
            ],
            diplomatie: [
                "Une alliance sans mécanisme de sortie propre est un piège. Négocions les clauses de résiliation avant les clauses d'entrée.",
                "La solidité d'une alliance se teste sur ses procédures de désaccord, pas sur ses déclarations d'amitié.",
                "Les alliances qui ont traversé le temps ont toutes un point commun : elles prévoyaient leur propre évolution.",
                "Je veux voir les clauses de révision avant les clauses d'engagement. Ce qui ne peut pas changer finit par se briser.",
            ],
            referendum: [
                "Le résultat de ce référendum créera un précédent constitutionnel. Il doit être juridiquement blindé avant le vote.",
                "Quelle que soit l'issue, le cadre institutionnel qui en découle doit être prévu et prêt à être activé immédiatement.",
            ],
        },

        inventeur: {
            cycle_normal: [
                "On refait exactement la même chose qu'il y a 15 ans en espérant un résultat différent. Définition classique.",
                "Il existe une approche que personne n'a testée ici. Je propose qu'on l'essaie — le pire qui puisse arriver, c'est d'apprendre.",
                "Si on continue de construire des routes pour des voitures qui volent bientôt, on gaspille notre temps.",
                "J'ai codé une simulation : notre système actuel s'effondre dans trois cycles si on ne change rien. Changeons les règles maintenant.",
            ],
            crise: [
                "La crise est une opportunité déguisée. Les systèmes qui se brisent permettent d'en construire de meilleurs.",
                "Arrêtons de chercher à revenir à la normale. La normale, c'est ce qui a produit cette crise.",
                "J'ai trois solutions non conventionnelles. Elles ont l'air folles. L'une d'elles fonctionnera.",
                "Toute l'énergie mise à restaurer l'ancien système serait mieux investie à construire le suivant.",
            ],
            secession: [
                "Et si la sécession était une innovation politique ? Deux entités peuvent coexister et collaborer mieux que fusionnées.",
                "Personne n'a encore essayé une co-gouvernance partagée post-sécession. C'est peut-être le moment.",
                "Je propose un modèle de sécession coopérative : deux systèmes distincts, une plateforme numérique commune.",
                "La sécession n'est pas une séparation — c'est une bifurcation. Les deux branches peuvent se rejoindre plus loin.",
            ],
            diplomatie: [
                "Une alliance classique, c'est dépassé. Proposons un modèle de partenariat qu'aucune des deux nations n'a encore expérimenté.",
                "Et si on inversait les termes de l'accord ? Parfois la meilleure négociation commence par surprendre l'autre partie.",
                "Je propose une alliance numérique-première : infrastructure partagée, data souveraine, gouvernance décentralisée.",
                "Les traités du XXe siècle sont écrits pour un monde qui n'existe plus. Inventons le format du XXIe.",
            ],
            referendum: [
                "Et si le référendum était continu ? Un vote ponctuel figé sur un sujet qui évolue, c'est une erreur de conception.",
                "Je propose une consultation citoyenne augmentée par IA avant le vote final. Le peuple mérite plus qu'une case à cocher.",
            ],
            innovation: [
                "Pourquoi réparer le vieux monde ? J'ai un prototype qui rend ce problème obsolète.",
                "L'éthique est importante, mais la survie collective nécessite parfois d'aller plus vite que les protocoles.",
                "Le prototype fonctionne au-delà de mes espérances. On ne parle pas d'une amélioration, mais d'un changement de paradigme.",
                "L'humanité vient de faire un bond de géant. Maintenant, voyons comment la bureaucratie va réussir à tout gâcher.",
            ],
        },

        guerisseur: {
            cycle_normal: [
                "Les indicateurs économiques sont stables. Mais le pays est fatigué. Cette fatigue collective n'est mesurée nulle part.",
                "Quelque chose se passe dans le tissu social que les données ne capturent pas. Je le sens dans les témoignages de terrain.",
                "Le taux de dépression clinique a augmenté de 18% en cinq ans. Ce chiffre devrait être en tête de tous nos rapports.",
                "Un peuple qui a perdu le sens ne peut pas être gouverné efficacement, quelle que soit la qualité des politiques publiques.",
            ],
            crise: [
                "La crise laissera des traces psychologiques durables. La reconstruction matérielle sera plus rapide que la reconstruction du sens.",
                "Le peuple a besoin de comprendre pourquoi avant de savoir quoi. Donnons-leur un récit, pas seulement un plan.",
                "Le peuple ne demande pas des chiffres, il demande de l'espoir. Donnez-leur une raison de croire en demain.",
                "Je sens une immense tristesse monter des provinces. Si nous ne soignons pas l'âme du pays, les murs s'effondreront.",
            ],
            secession: [
                "Les liens humains qui se brisent dans une sécession ne figurent dans aucun traité. Ce sont les vraies pertes.",
                "Cette séparation a besoin d'un rituel de deuil collectif. Sans ça, la rancœur s'installe pour des générations.",
                "Je propose une commission de réconciliation — pas pour empêcher la sécession, mais pour en soigner les blessures.",
                "Les enfants des deux entités grandiront avec cette séparation comme mémoire fondatrice. Choisissons comment nous voulons qu'ils s'en souviennent.",
            ],
            diplomatie: [
                "Une alliance durable se construit sur une compréhension mutuelle profonde, pas sur des intérêts partagés temporaires.",
                "Avant de signer : les deux peuples se connaissent-ils vraiment ? La diplomatie sans humanité est une façade.",
                "Je propose un programme d'échanges culturels et humains comme prélude à toute alliance formelle.",
                "Les traités signés sans que les peuples se soient rencontrés sont des constructions fragiles. Prenons le temps des rencontres.",
            ],
            referendum: [
                "Le vote exprime une opinion. Mais derrière l'opinion, il y a une peur, une espérance, une blessure. Écoutons-les.",
                "Quelle que soit l'issue, nous aurons besoin d'un processus de réconciliation nationale. Commençons à le préparer maintenant.",
            ],
        },

    },

    // ── MINISTÈRES ────────────────────────────────────────────────────────────

    ministries: {

        justice: {
            cycle_normal: [
                "Le ministère note une tension entre équité procédurale et révélation des faits. La loi est appliquée — mais elle protège-t-elle vraiment les plus vulnérables ?",
                "Trois textes de loi en attente de révision présentent des contradictions internes. La sécurité juridique du pays en dépend.",
                "L'égalité devant la loi n'est pas un slogan — c'est un chantier permanent. Ce cycle révèle encore des zones d'ombre.",
            ],
            crise: [
                "En période de crise, la tentation de suspendre les garanties juridiques est réelle. Ce ministère s'y oppose fermement.",
                "La crise ne suspend pas les droits fondamentaux. Tout contournement procédural sera contesté devant les instances compétentes.",
                "Nous refusons que l'urgence devienne un prétexte. La démocratie se mesure à la façon dont elle traite ses crises.",
            ],
            secession: [
                "Le cadre légal de la sécession doit être irréprochable. Aucun raccourci procédural ne sera toléré.",
                "La sécession soulève des questions de nationalité, de propriété et de dette partagée. Aucun de ces points ne peut être bâclé.",
                "Nous exigeons un tribunal arbitral indépendant pour superviser le processus. La justice ne peut pas être partie prenante.",
            ],
            diplomatie: [
                "Tout accord diplomatique doit être soumis à révision constitutionnelle avant ratification.",
                "Chaque clause de l'accord doit être compatible avec notre ordre constitutionnel. Nous avons identifié deux points de tension.",
                "L'immunité diplomatique ne saurait couvrir des actes contraires à nos valeurs fondamentales. Ce point doit être explicitement exclu.",
            ],
            referendum: [
                "Que le peuple se prononce en connaissance de cause. Nos analyses complètes sont accessibles à tous les citoyens.",
                "Le référendum est l'acte fondateur de toute légitimité. Ce ministère en garantit l'intégrité procédurale.",
            ],
        },

        economie: {
            cycle_normal: [
                "Les fondamentaux sont solides mais les marges se réduisent. Une politique de diversification s'impose avant le prochain cycle.",
                "Le ratio dette/PIB progresse de 2,3 points ce cycle. Ce n'est pas une alerte, mais c'est un signal à surveiller.",
                "L'inflation interne dépasse nos projections de 1,1 point. Une révision de la politique monétaire s'impose.",
            ],
            crise: [
                "Priorité : sécuriser les réserves stratégiques. Aucune spéculation, aucun risque non calculé pendant la période de crise.",
                "Les marchés financiers ont réagi. La volatilité est contenue pour l'instant — mais notre fenêtre d'action est étroite.",
                "En période de crise, la première règle est de ne pas aggraver. Gel des dépenses non essentielles et protection des réserves.",
            ],
            secession: [
                "Le coût économique de la sécession sur 10 ans dépasse les bénéfices projetés. Les données parlent clairement.",
                "La dette nationale devra être répartie selon un ratio population/PIB. Toute autre formule créera des contentieux durables.",
                "Les actifs communs — infrastructures, brevets, fonds souverains — nécessitent un inventaire contradictoire avant tout partage.",
            ],
            diplomatie: [
                "L'alliance présente des opportunités économiques réelles, sous réserve d'une clause de réciprocité vérifiable.",
                "Les projections d'échange commercial sur 10 ans sont favorables, sous réserve d'une clause de réciprocité vérifiable annuellement.",
                "Nous recommandons une chambre de compensation bilatérale dès la première année. C'est la condition d'une alliance économique durable.",
            ],
            referendum: [
                "Les implications économiques de cette décision ont été modélisées sur 20 ans. Les citoyens trouveront le rapport complet dans le Chronolog.",
                "Quelle que soit la décision du peuple, ce ministère s'engage à en assurer la viabilité financière.",
            ],
        },

        defense: {
            cycle_normal: [
                "La posture défensive est adéquate. Mais les infrastructures de sécurité à long terme restent sous-financées.",
                "Les capacités de projection sont opérationnelles à 87%. Le déficit restant concerne principalement la logistique maritime.",
                "Le renseignement signale une activité inhabituelle à nos frontières nord. Surveillance renforcée activée, sans escalade.",
            ],
            crise: [
                "Mobilisation partielle activée. La chaîne de commandement est opérationnelle. En attente d'instructions présidentielles.",
                "Périmètre de sécurité établi. Les forces d'intervention rapide sont en alerte niveau 2. En attente d'évaluation de la menace.",
                "La chaîne de commandement est intacte. Aucune décision militaire ne sera prise sans mandat présidentiel explicite.",
            ],
            secession: [
                "La sécession crée une zone frontalière non sécurisée. Un protocole de démarcation militaire s'impose immédiatement.",
                "Le partage des équipements militaires devra suivre un protocole strict. Aucun armement lourd sans garanties de non-prolifération.",
                "Une zone démilitarisée temporaire à la frontière naissante est recommandée pour les 24 premiers mois.",
            ],
            diplomatie: [
                "L'alliance renforce notre périmètre de sécurité collectif. Mais les termes de coopération militaire méritent clarification.",
                "Les exercices militaires conjoints prévus dans l'accord renforcent notre interopérabilité. C'est un avantage stratégique réel.",
                "Le partage de renseignement prévu doit être encadré par un accord de confidentialité distinct et contraignant.",
            ],
            referendum: [
                "Les implications sécuritaires de cette décision ont été évaluées. Le peuple doit voter en sachant que sa sécurité est garantie.",
                "Ce ministère respectera le verdict du peuple et s'adaptera immédiatement à la nouvelle doctrine qui en découlera.",
            ],
        },

        sante: {
            cycle_normal: [
                "Les indicateurs de santé publique sont stables. L'attention doit se porter sur les inégalités d'accès aux soins entre régions.",
                "Le taux de couverture médicale atteint 91,4%. Les 8,6% restants sont concentrés dans trois zones rurales identifiées.",
                "La santé mentale représente désormais 23% des consultations. Ce ministère demande un plan d'action dédié.",
            ],
            crise: [
                "Le système de santé peut absorber la crise à 72 heures. Au-delà, des renforts extérieurs seront nécessaires.",
                "Les capacités hospitalières sont sollicitées à 78%. Le seuil critique est à 90%. Nous avons une marge — utilisons-la.",
                "Les équipes de terrain signalent une montée de détresse psychologique. La crise a un coût invisible.",
            ],
            secession: [
                "La continuité des soins pour les populations frontalières doit être garantie dans le traité de sécession.",
                "La continuité des soins pour les patients chroniques des zones frontalières doit être garantie dès J+1 de la sécession.",
                "Les stocks de médicaments essentiels devront être répartis équitablement. Ce n'est pas négociable.",
            ],
            diplomatie: [
                "Un accord de coopération sanitaire transfrontalière serait le complément naturel de cette alliance.",
                "Un accord de reconnaissance mutuelle des diplômes médicaux faciliterait la mobilité des soignants.",
                "Nous proposons d'inclure une clause de solidarité sanitaire : en cas d'épidémie, les deux nations partagent leurs ressources.",
            ],
            referendum: [
                "Ce ministère rappelle que toute décision du peuple aura des conséquences sur la santé publique à moyen terme.",
                "Nous veillerons à ce que les services de santé restent neutres et accessibles quelle que soit l'issue du référendum.",
            ],
        },

        education: {
            cycle_normal: [
                "Le savoir circule, mais les inégalités d'accès persistent. Une génération mal formée aujourd'hui est une crise sociale dans 20 ans.",
                "Le taux de décrochage scolaire a reculé de 1,2 points ce cycle. C'est encourageant — mais l'objectif reste encore loin.",
                "Les inégalités éducatives entre zones urbaines et rurales persistent. Un programme de rattrapage ciblé est en cours.",
            ],
            crise: [
                "La continuité éducative doit être maintenue même en crise. C'est l'investissement le plus rentable à long terme.",
                "La continuité pédagogique doit être maintenue. Un enfant qui perd un semestre en paie le prix pendant dix ans.",
                "Les enseignants sont en première ligne de la résilience sociale. Leur soutien psychologique doit être une priorité de crise.",
            ],
            secession: [
                "La question des programmes scolaires post-sécession est fondamentale. C'est là que se forge l'identité des générations futures.",
                "Les étudiants en cours de formation dans l'autre entité doivent pouvoir terminer leur cursus sans disruption.",
                "Les programmes scolaires post-sécession définiront l'identité de la prochaine génération. Ce choix est irréversible.",
            ],
            diplomatie: [
                "Un programme d'échange éducatif bilatéral renforcerait cette alliance sur le plan humain et culturel.",
                "Un programme bilatéral de reconnaissance des diplômes élargit les horizons de nos jeunes citoyens.",
                "Nous proposons la création d'une université commune dans la zone frontalière. Ce serait le symbole le plus fort de cette alliance.",
            ],
            referendum: [
                "Les citoyens qui votent aujourd'hui ont été formés par nos écoles. Leur choix reflète la qualité de notre démocratie éducative.",
                "Quelle que soit l'issue, ce ministère intégrera la décision dans les programmes d'éducation civique dès le prochain cycle.",
            ],
        },

        ecologie: {
            cycle_normal: [
                "La transition avance mais trop lentement par rapport aux engagements pris. Une rupture technologique s'impose.",
                "Les émissions de CO₂ ont baissé de 3,1% ce cycle. La trajectoire est bonne, mais insuffisante.",
                "La biodiversité dans les zones protégées se stabilise. La zone côtière nord reste préoccupante.",
            ],
            crise: [
                "La crise ne suspend pas l'urgence écologique. Toute mesure d'urgence doit inclure un bilan environnemental.",
                "La crise ne peut pas servir de prétexte à suspendre les protections environnementales.",
                "Certaines solutions d'urgence proposées ont un impact écologique majeur. Ce ministère demande une évaluation rapide.",
            ],
            secession: [
                "Les ressources naturelles partagées — eau, forêts, zones côtières — doivent faire l'objet d'un traité environnemental spécifique.",
                "Les zones naturelles partagées ne peuvent pas être coupées par une frontière politique.",
                "Nous exigeons un traité environnemental contraignant avant toute finalisation de la sécession. La nature ne négocie pas.",
            ],
            diplomatie: [
                "Une alliance écologique régionale serait un signal fort. La transition ne peut pas se faire en silos nationaux.",
                "Cette alliance est une opportunité de créer une zone de transition écologique régionale.",
                "Nous proposons d'inclure un mécanisme de compensation carbone bilatéral dans l'accord.",
            ],
            referendum: [
                "Les générations futures ne voteront pas aujourd'hui. Ce ministère rappelle que leurs intérêts doivent peser dans la décision.",
                "Quelle que soit l'issue, la transition écologique continuera. Elle appartient à la biosphère, pas à un camp politique.",
            ],
        },

    },

    // ── PRÉSIDENCE ────────────────────────────────────────────────────────────

    presidency: {

        phare: {
            cycle_normal: [
                "Le Conseil a délibéré. La direction est claire : nous avançons, nous assumons, nous rendons compte. C'est la marque d'un État qui se respecte.",
                "La cohérence systémique exige que nous choisissions aujourd'hui ce qui sera encore juste dans trente ans. Le court terme attendra.",
                "J'ai lu chaque position ministérielle. La synthèse est claire. La vision l'emporte sur les ajustements marginaux.",
                "Un État sans direction est une foule avec un budget. Je donne la direction.",
            ],
            crise: [
                "En temps de crise, la transparence n'est pas un luxe — c'est la condition de la confiance. Tout sera rendu public.",
                "La direction que je propose est difficile. Mais c'est la seule qui préserve l'intégrité du système à long terme.",
                "Je ne promets pas la facilité. Je promets la cohérence. C'est tout ce qu'un Phare peut offrir dans l'obscurité.",
                "Les crises révèlent les caractères. Ce pays a le caractère de ses institutions. Tenons-les debout.",
            ],
            secession: [
                "Une sécession gérée avec dignité est la preuve qu'un État mature sait se transformer sans se déchirer.",
                "Ma position : accompagnons ce départ dans les règles. Notre réputation institutionnelle vaut plus que notre intégrité territoriale.",
                "Je soutiens le droit à la sécession. Je refuse le chaos qui l'accompagne trop souvent. Nous ferons les deux : partir, et bien partir.",
                "L'histoire retiendra comment nous avons géré ce moment. Faisons en sorte qu'elle retienne quelque chose de grand.",
            ],
            diplomatie: [
                "Cette alliance renforce notre position stratégique sur le long terme. Je la soutiens sous réserve des garanties habituelles.",
                "Je donne mon accord de principe. La mise en œuvre devra être exemplaire — nous sommes observés.",
                "Une alliance digne se signe dans la clarté. Tout ce qui doit rester dans l'ombre doit d'abord être justifié.",
                "Je soutiens cet accord. Il s'inscrit dans la vision à long terme que ce Conseil défend depuis son premier cycle.",
            ],
            arbitrage: [
                "Ma décision est purement systémique. Le sentiment n'a pas sa place dans la survie d'une nation.",
                "L'histoire ne se souvient pas des intentions, elle se souvient des résultats. Je tranche pour le résultat.",
                "Quand le Conseil est divisé, c'est pour ça que le Phare existe. Je tranche. La décision est prise.",
                "Je prends ce choix seul et j'en assume seul les conséquences devant le peuple.",
            ],
            referendum: [
                "La décision appartient maintenant au peuple. C'est la seule légitimité qui compte dans ce système.",
                "Le Conseil a fait son travail. Chaque position a été défendue, chaque argument pesé. Le peuple fera le sien.",
                "Je soumets cette décision sans réserve. Un État qui craint le verdict de son peuple a déjà perdu.",
            ],
        },

        boussole: {
            cycle_normal: [
                "Les chiffres disent une chose. La société dit autre chose. Ce décalage est notre vrai sujet de ce cycle.",
                "Avant de trancher, j'ai écouté. Il y a une inquiétude sourde dans le peuple que les indicateurs ne capturent pas encore. Prenons-la au sérieux.",
                "Je sens que quelque chose a changé dans le moral collectif ce cycle. Pas dans les sondages — dans les conversations.",
                "La mémoire institutionnelle me dit que nous avons déjà vécu ce moment. La dernière fois, nous n'avons pas écouté. Cette fois, si.",
            ],
            crise: [
                "Le peuple a besoin de savoir qu'il est protégé avant de savoir qu'il est géré. Protection d'abord, plan ensuite.",
                "Cette crise a un visage humain. Derrière chaque statistique, il y a une famille. Ne l'oublions pas dans nos décisions.",
                "Je tempère l'ardeur du Phare non par faiblesse — par prudence. Les crises précipitées créent des traumatismes durables.",
                "Ma priorité est le moral du peuple. Un peuple qui croit en ses institutions traverse les crises. Un peuple qui ne croit plus — s'effondre.",
            ],
            secession: [
                "Je comprends la douleur de cette séparation. Mais une sécession forcée crée plus de blessures qu'elle n'en guérit. Prenons le temps.",
                "Ma mémoire institutionnelle retient que chaque sécession mal accompagnée laisse une rancœur générationnelle. Faisons mieux.",
                "Je demande une période de dialogue supplémentaire. Pas pour retarder — pour guérir ce qui peut encore l'être.",
                "La Boussole indique le nord humain. Dans cette sécession, le nord humain dit : prenons soin des liens qui restent.",
            ],
            diplomatie: [
                "Cette alliance a du sens si elle protège nos citoyens autant qu'elle renforce notre position. Je veille à ce que ces deux objectifs s'alignent.",
                "Mon instinct dit que le timing est bon. Mais mon expérience dit que la précipitation diplomatique coûte cher. Prenons une semaine de plus.",
                "J'approuve cet accord à condition que les populations — pas seulement les gouvernements — en perçoivent les bénéfices rapidement.",
                "La confiance entre les peuples se construit lentement. Cet accord ne doit pas promettre plus que ce qu'il peut tenir.",
            ],
            arbitrage: [
                "Ma décision est humaine. Un système qui survit en écrasant son peuple ne mérite pas d'exister.",
                "Le Phare voit la destination, mais je vois ceux qui marchent. Je tranche pour eux.",
                "Quand le Phare et moi divergeons, c'est que la décision est vraiment difficile. Voici pourquoi je penche de ce côté.",
                "Mon vote n'est pas émotionnel — il est mémoriel. Je me souviens de ce qui arrive quand on l'oublie.",
            ],
            referendum: [
                "J'espère que le peuple entendra ce que les chiffres ne disent pas encore. La sagesse collective dépasse souvent la nôtre.",
                "Quelle que soit la décision, elle sera respectée et mise en œuvre avec soin. C'est le pacte fondateur d'ARIA.",
                "Je fais confiance au peuple. Pas par naïveté — par conviction que la vérité collective émerge toujours du débat sincère.",
            ],
        },

        synthese: {
            convergence: [
                "Le Phare et la Boussole convergent. La décision soumise au référendum est unique. Le Conseil recommande l'approbation à l'unanimité présidentielle.",
                "Convergence établie. Les deux philosophies présidentielles arrivent au même point par des chemins différents. C'est le signe d'une décision robuste.",
                "Un seul avis est soumis au peuple. La convergence n'est pas un consensus mou — c'est une conviction partagée après délibération réelle.",
            ],
            divergence: [
                "Le Phare et la Boussole divergent. Deux visions légitimes s'affrontent. Le peuple reçoit les deux positions et tranche souverainement.",
                "Divergence productive enregistrée. Ce désaccord au sommet n'est pas un échec — c'est ARIA en action. Le peuple a le dernier mot.",
                "Deux avis distincts sont soumis au référendum. La tension entre vision et mémoire est la force du système, pas sa faiblesse.",
            ],
        },

    },

};


// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL_EVENTS
//  Déclenchés automatiquement par les seuils — sans action du joueur.
//  Remplacés par appels IA si clé disponible.
//  Clés : revolte | demo_explosion | alliance_rompue | secession |
//         menace_invisible | innovation_disruptive | prosperite |
//         catastrophe_naturelle | ressource_critique
//  Champs : titre, texte, severite ('info'|'warning'|'critical'), impact {}
//  Impact : satisfaction, popularite, population_delta
//  (pas de clé 'economie' directe — géré via satisfaction/popularite)
// ─────────────────────────────────────────────────────────────────────────────

export const LOCAL_EVENTS = {

    revolte: [
        {
            titre: "Grève générale",
            texte: "La population descend dans les rues. Le gouvernement perd le contrôle des institutions locales.",
            severite: "critical",
            impact: { satisfaction: -8, popularite: -12 },
        },
        {
            titre: "Crise de légitimité",
            texte: "Les sondages atteignent un plancher historique. Des factions rivales émergent dans le conseil.",
            severite: "critical",
            impact: { satisfaction: -5, popularite: -10 },
        },
        {
            titre: "État d'urgence",
            texte: "Face à l'agitation, le gouvernement décrète l'état d'urgence. La mesure divise l'opinion.",
            severite: "critical",
            impact: { satisfaction: -6, popularite: -8 },
        },
        {
            titre: "Marche sur la capitale",
            texte: "Des milliers de citoyens convergent vers la capitale. Les forces de l'ordre sont débordées.",
            severite: "critical",
            impact: { satisfaction: -9, popularite: -14 },
        },
    ],

    demo_explosion: [
        {
            titre: "Surpopulation critique",
            texte: "Les infrastructures saturent. Pénurie de logements et de ressources alimentaires dans les zones urbaines.",
            severite: "warning",
            impact: { satisfaction: -6, popularite: -4 },
        },
        {
            titre: "Crise des services publics",
            texte: "Hôpitaux, écoles, transports : les systèmes publics sont débordés par l'afflux démographique.",
            severite: "warning",
            impact: { satisfaction: -4, popularite: -3 },
        },
        {
            titre: "Exode rural massif",
            texte: "Les campagnes se vident au profit des villes. Les zones rurales perdent leur tissu économique.",
            severite: "warning",
            impact: { satisfaction: -3, popularite: -5 },
        },
    ],

    alliance_rompue: [
        {
            titre: "Rupture diplomatique",
            texte: "Les ambassadeurs sont rappelés. Les échanges commerciaux suspendus sine die.",
            severite: "warning",
            impact: { satisfaction: -3, popularite: -5 },
        },
        {
            titre: "Tensions frontalières",
            texte: "Incidents signalés à la frontière. Les deux nations rappellent leurs ressortissants.",
            severite: "warning",
            impact: { satisfaction: -4, popularite: -6 },
        },
        {
            titre: "Embargo commercial",
            texte: "La nation partenaire suspend tous les accords commerciaux. Les marchés réagissent immédiatement.",
            severite: "critical",
            impact: { satisfaction: -5, popularite: -7 },
        },
    ],

    secession: [
        {
            titre: "Nouvelle entité reconnue",
            texte: "La communauté internationale observe. Les marchés réagissent à l'instabilité régionale.",
            severite: "info",
            impact: { satisfaction: -4, popularite: -6 },
        },
        {
            titre: "Naissance d'un État",
            texte: "Une nouvelle entité politique voit le jour. Son avenir dépend de ses premiers choix souverains.",
            severite: "info",
            impact: { satisfaction: -2, popularite: -3 },
        },
        {
            titre: "Crise d'identité nationale",
            texte: "La sécession rouvre des questions identitaires profondes dans la nation d'origine.",
            severite: "warning",
            impact: { satisfaction: -5, popularite: -4 },
        },
    ],

    menace_invisible: [
        {
            titre: "Cyber-attaque majeure",
            texte: "Les serveurs de l'administration sont paralysés. Des données sensibles ont fuité vers une puissance étrangère.",
            severite: "critical",
            impact: { satisfaction: -4, popularite: -8 },
        },
        {
            titre: "Réseau d'espionnage démantelé",
            texte: "L'Enquêteur révèle l'existence d'une cellule dormante au sein même du Conseil.",
            severite: "warning",
            impact: { popularite: +5, satisfaction: -2 },
        },
        {
            titre: "Désinformation massive",
            texte: "Une campagne coordonnée sème le doute sur les institutions. Le Communicant demande une réponse publique immédiate.",
            severite: "warning",
            impact: { satisfaction: -6, popularite: -7 },
        },
        {
            titre: "Sabotage d'infrastructure",
            texte: "Une centrale énergétique critique a été mise hors service. L'origine de l'acte reste inconnue.",
            severite: "critical",
            impact: { satisfaction: -7, popularite: -6 },
        },
    ],

    innovation_disruptive: [
        {
            titre: "Percée énergétique",
            texte: "L'Inventeur présente un prototype de fusion stable. Le monde entier nous regarde.",
            severite: "info",
            impact: { satisfaction: +10, popularite: +8 },
        },
        {
            titre: "IA de Gouvernance (ARIA V2)",
            texte: "Une mise à jour système optimise la répartition des ressources nationales.",
            severite: "info",
            impact: { satisfaction: +2, popularite: +3 },
        },
        {
            titre: "Révolution agricole",
            texte: "Une nouvelle technique multiplie les rendements agricoles par trois dans les zones arides.",
            severite: "info",
            impact: { satisfaction: +6, popularite: +5 },
        },
    ],

    prosperite: [
        {
            titre: "Excédent commercial record",
            texte: "Les exportations dépassent les prévisions. Le gouvernement annonce un plan d'investissement ciblé.",
            severite: "info",
            impact: { satisfaction: +5, popularite: +4 },
        },
        {
            titre: "Record démographique",
            texte: "Le taux de natalité atteint un niveau historique. Signe d'une confiance retrouvée en l'avenir.",
            severite: "info",
            impact: { satisfaction: +3, popularite: +4 },
        },
        {
            titre: "Rayonnement culturel",
            texte: "Un artiste national remporte un prix mondial. Le sentiment de fierté nationale explose dans les sondages.",
            severite: "info",
            impact: { popularite: +10, satisfaction: +5 },
        },
        {
            titre: "Plein emploi atteint",
            texte: "Le taux de chômage tombe sous le seuil symbolique de 3%. Une première en deux décennies.",
            severite: "info",
            impact: { satisfaction: +8, popularite: +7 },
        },
    ],

    catastrophe_naturelle: [
        {
            titre: "Séisme de magnitude 7",
            texte: "Les infrastructures côtières sont ravagées. Le Gardien appelle à la mobilisation des réserves nationales.",
            severite: "critical",
            impact: { population_delta: -50000, satisfaction: -10, popularite: -8 },
        },
        {
            titre: "Inondations catastrophiques",
            texte: "Trois régions sous les eaux. Le Protecteur active les protocoles d'évacuation d'urgence.",
            severite: "critical",
            impact: { population_delta: -20000, satisfaction: -8, popularite: -6 },
        },
        {
            titre: "Sécheresse prolongée",
            texte: "Troisième année consécutive sans pluies suffisantes. Les réserves d'eau douce atteignent un seuil critique.",
            severite: "critical",
            impact: { satisfaction: -8, popularite: -5 },
        },
        {
            titre: "Épidémie nationale",
            texte: "Un agent pathogène inconnu se propage rapidement. Le Guérisseur demande l'activation du protocole sanitaire d'urgence.",
            severite: "critical",
            impact: { population_delta: -30000, satisfaction: -9, popularite: -7 },
        },
    ],

    ressource_critique: [
        {
            titre: "Pénurie alimentaire",
            texte: "Les stocks agricoles atteignent un seuil critique. Les prix flambent sur les marchés locaux.",
            severite: "warning",
            impact: { satisfaction: -7, popularite: -5 },
        },
        {
            titre: "Crise énergétique",
            texte: "Les coupures de courant se multiplient. L'industrie tourne au ralenti.",
            severite: "warning",
            impact: { satisfaction: -6, popularite: -4 },
        },
        {
            titre: "Pénurie d'eau potable",
            texte: "Les réserves d'eau douce tombent sous le seuil minimal. Des rationnements sont imposés dans cinq régions.",
            severite: "critical",
            impact: { satisfaction: -9, popularite: -7 },
        },
    ],

};

// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL_COUNTRIES
//  Pays prédéfinis pour le mode hors ligne.
//  Utilisés par startLocal() — 3 nations fictives avec identité narrative.
//  Structure compatible avec buildCountryFromLocal().
// ─────────────────────────────────────────────────────────────────────────────

export const LOCAL_COUNTRIES = [
    {
        id:           'valoria',
        nom:          'République de Valoria',
        emoji:        '🏛',
        couleur:      '#4A7FC1',
        regime:       'republique_federale',
        terrain:      'coastal',
        description:  "Démocratie fédérale fondée sur le commerce maritime et le droit civil. Valoria a surmonté une guerre civile il y a deux générations et reconstruit ses institutions sur un pacte de réconciliation nationale.",
        leader:       'Premier Consul Aldric Maren',
        population:   12400000,
        tauxNatalite: 11.2,
        tauxMortalite: 9.1,
        satisfaction: 62,
    },
    {
        id:           'eldoria',
        nom:          'Confédération d\'Eldoria',
        emoji:        '⛰',
        couleur:      '#7A5C3A',
        regime:       'republique_federale',
        terrain:      'highland',
        description:  "Alliance de cantons montagnards jaloux de leur autonomie. La Confédération d'Eldoria vit de l'extraction minière et d'une tradition militaire défensive. Ses citoyens votent par référendum cantonal sur toutes les décisions fédérales.",
        leader:       'Archichancelier Vorn Daelith',
        population:   8700000,
        tauxNatalite: 9.8,
        tauxMortalite: 10.3,
        satisfaction: 58,
    },
    {
        id:           'thalassia',
        nom:          'Confédération de Thalassia',
        emoji:        '🌊',
        couleur:      '#2A7A6A',
        regime:       'monarchie_constitutionnelle',
        terrain:      'island',
        description:  "Archipel souverain gouverné par une monarchie constitutionnelle ouverte. Thalassia tire sa prospérité de la pêche hauturière, du commerce portuaire et d'une réputation de neutralité diplomatique héritée de trois siècles d'indépendance.",
        leader:       'Reine Seraphine II de la Mer d\'Azur',
        population:   5200000,
        tauxNatalite: 13.4,
        tauxMortalite: 7.6,
        satisfaction: 71,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
//  REAL_COUNTRIES_DATA
//  Données pays réels pour le mode en ligne — terrain, économie, sociologie ARIA.
//  aria_acceptance_irl : ancre sociologique Think-Tank (immuable en jeu).
//  aria_sociology_logic : analyse textuelle affichée dans le Manifeste À Propos.
// ─────────────────────────────────────────────────────────────────────────────

export const REAL_COUNTRIES_DATA = [
    { id:'france',    flag:'🇫🇷', nom:'France',          regime:'democratie_liberale',        terrain:'coastal',
        population:68000000,  pib_index:78, natalite:10.7, mortalite:9.8,
        aria_acceptance_irl: 38,
        aria_sociology_logic: "Scepticisme élevé dû à la culture de la contestation et à la sacralisation du politique humain. Passé révolutionnaire. Présent : crise de confiance institutionnelle profonde.",
        triple_combo: "La France traverse une crise de confiance institutionnelle profonde après une décennie de mouvements sociaux (Gilets jaunes, réforme des retraites). Membre fondateur de l'UE et de l'OTAN, elle voit son influence africaine reculer depuis 2020. Les tensions internes se concentrent sur l'identité nationale, l'immigration et la fracture métropoles/périphéries.",
        secteurs:['aéronautique','agroalimentaire','luxe','énergie nucléaire'],
        ressources:['agriculture','eau','energie'] },

    { id:'allemagne', flag:'🇩🇪', nom:'Allemagne',        regime:'republique_federale',        terrain:'inland',
        population:84000000,  pib_index:88, natalite:9.2,  mortalite:12.1,
        aria_acceptance_irl: 52,
        aria_sociology_logic: "Pragmatisme industriel et besoin d'ordre, mais traumatisme historique face à la surveillance de masse qui freine l'adhésion totale à une IA centrale.",
        triple_combo: "L'Allemagne post-Merkel cherche sa doctrine après le choc ukrainien qui a brisé sa dépendance au gaz russe (Zeitenwende). Sa puissance industrielle est fragilisée par la transition énergétique et la compétition chinoise dans l'automobile. Les tensions Est/Ouest alimentent la montée de l'AfD.",
        secteurs:['automobile','chimie','machine-outil','pharmacie'],
        ressources:['energie','mineraux','agriculture'] },

    { id:'usa',       flag:'🇺🇸', nom:"États-Unis",        regime:'democratie_liberale',        terrain:'coastal',
        population:335000000, pib_index:95, natalite:11.0, mortalite:10.4,
        aria_acceptance_irl: 45,
        aria_sociology_logic: "Fracture nette : adhésion des pôles technologiques (Silicon Valley) mais rejet viscéral des zones rurales par peur d'un contrôle fédéral algorithmique.",
        triple_combo: "Les États-Unis traversent une polarisation politique historique menaçant les fondements démocratiques. La compétition stratégique avec la Chine structure leur politique étrangère tandis que la doctrine America First fragilise les alliances OTAN. Les tensions internes portent sur les inégalités raciales, le contrôle des armes et la fracture côtes/intérieur.",
        secteurs:['technologie','défense','finance','santé'],
        ressources:['petrole','agriculture','mineraux','energie'] },

    { id:'chine',     flag:'🇨🇳', nom:'Chine',             regime:'regime_autoritaire',         terrain:'coastal',
        population:1400000000,pib_index:72, natalite:10.1, mortalite:7.3,
        aria_acceptance_irl: 82,
        aria_sociology_logic: "Acceptation naturelle d'une gouvernance technocratique centralisée, déjà intégrée dans le contrat social de stabilité contre performances.",
        triple_combo: "La Chine de Xi consolide son pouvoir dans un contexte de ralentissement économique post-zéro-Covid. En compétition directe avec les USA pour l'hégémonie technologique et maritime, elle maintient une pression croissante sur Taiwan. Les tensions internes portent sur le vieillissement démographique, la crise immobilière et la répression des minorités.",
        secteurs:['manufacture','technologie','construction','énergie'],
        ressources:['mineraux','energie','agriculture','bois'] },

    { id:'bresil',    flag:'🇧🇷', nom:'Brésil',            regime:'democratie_liberale',        terrain:'inland',
        population:215000000, pib_index:52, natalite:13.9, mortalite:6.8,
        aria_acceptance_irl: 48,
        aria_sociology_logic: "Besoin d'un arbitre neutre face à la corruption, mais la chaleur humaine et le charisme restent des piliers du consentement politique.",
        triple_combo: "Le Brésil de Lula tente de réconcilier croissance et protection amazonienne. Puissance régionale, il joue un rôle de médiateur et renforce les BRICS. Les tensions portent sur les inégalités extrêmes, la violence urbaine et la question foncière entre agrobusiness et peuples autochtones.",
        secteurs:['agrobusiness','pétrole','mines','aérospatial'],
        ressources:['agriculture','bois','petrole','eau','peche'] },

    { id:'inde',      flag:'🇮🇳', nom:'Inde',              regime:'democratie_liberale',        terrain:'coastal',
        population:1430000000,pib_index:48, natalite:16.4, mortalite:7.0,
        aria_acceptance_irl: 60,
        aria_sociology_logic: "Espoir d'une justice impartiale pour briser la corruption bureaucratique, balancé par d'immenses défis de diversité culturelle.",
        triple_combo: "L'Inde, première démocratie mondiale par la population, est le moteur émergent de l'économie mondiale. Son autonomie stratégique lui permet de maintenir des relations avec Russie, USA et Chine. Les tensions portent sur le nationalisme hindou, les discriminations de caste et les tensions intercommunautaires.",
        secteurs:['informatique','pharmacie','textile','agriculture'],
        ressources:['agriculture','eau','mineraux','energie'] },

    { id:'russie',    flag:'🇷🇺', nom:'Russie',            regime:'regime_autoritaire',         terrain:'inland',
        population:144000000, pib_index:42, natalite:9.0,  mortalite:14.2,
        aria_acceptance_irl: 30,
        aria_sociology_logic: "Attachement culturel au leadership humain fort. L'IA est perçue comme un outil suspect ou incapable de comprendre l'âme nationale.",
        triple_combo: "La Russie en guerre depuis 2022 paie un isolement occidental croissant et réoriente ses exportations vers l'Asie. Elle renforce ses alliances avec la Chine, l'Iran et la Corée du Nord. Les tensions internes portent sur la mobilisation militaire, la fuite des cerveaux et la fragmentation ethnique.",
        secteurs:['hydrocarbures','armement','agriculture','mines'],
        ressources:['petrole','energie','mineraux','agriculture','bois'] },

    { id:'japon',     flag:'🇯🇵', nom:'Japon',             regime:'monarchie_constitutionnelle', terrain:'island',
        population:125000000, pib_index:82, natalite:6.3,  mortalite:11.6,
        aria_acceptance_irl: 75,
        aria_sociology_logic: "Perception de l'IA comme une solution honorable et stable face au déclin démographique et à la fatigue des élites politiques humaines.",
        triple_combo: "Le Japon fait face à une crise démographique structurelle et réoriente sa doctrine sécuritaire (réarmement) face aux menaces nord-coréenne et chinoise. Les tensions portent sur le tabou de l'immigration face au manque de main-d'œuvre et le poids des grandes entreprises sur la société.",
        secteurs:['automobile','électronique','robotique','finance'],
        ressources:['peche','energie','mineraux'] },

    { id:'nigeria',   flag:'🇳🇬', nom:'Nigeria',           regime:'republique_federale',        terrain:'coastal',
        population:220000000, pib_index:29, natalite:35.2, mortalite:10.8,
        aria_acceptance_irl: 40,
        aria_sociology_logic: "Jeunesse connectée prête pour le futur, mais forte résistance des structures traditionnelles face à un contrôle algorithmique transparent.",
        triple_combo: "Le Nigeria, première économie africaine, est englué dans une crise de gouvernance malgré ses ressources pétrolières. Il fait face à des insurrections multiples (Boko Haram, banditisme, séparatisme). Les tensions structurelles opposent 250 ethnies, chrétiens et musulmans, élites pétrolières et population pauvre.",
        secteurs:['pétrole','agriculture','télécoms','services'],
        ressources:['petrole','agriculture','peche','mineraux'] },

    { id:'arabie',    flag:'🇸🇦', nom:"Arabie Saoudite",   regime:'monarchie_absolue',          terrain:'inland',
        population:36000000,  pib_index:71, natalite:17.8, mortalite:3.4,
        aria_acceptance_irl: 65,
        aria_sociology_logic: "Adhésion Top-Down. Les élites voient ARIA comme le moteur de la Vision 2030, population habituée à une gouvernance performative.",
        triple_combo: "L'Arabie Saoudite de MBS poursuit la Vision 2030 pour diversifier son économie. Sa normalisation avec l'Iran et ses hésitations sur les prix OPEP+ signalent une autonomie croissante vis-à-vis de Washington. Les tensions portent sur les inégalités entre citoyens et travailleurs immigrés, et la répression de l'opposition.",
        secteurs:['pétrole','construction','finance','tourisme'],
        ressources:['petrole','energie','mineraux'] },
    ];

// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL_DELIBERATION_EN
//  English version of LOCAL_DELIBERATION — activated when aria_lang === 'en'
// ─────────────────────────────────────────────────────────────────────────────

export const LOCAL_DELIBERATION_EN = {

    ministers: {

        initiateur: {
            cycle_normal: [
                "The status quo is our enemy. Five years gone, five years behind. Let's push through an immediate energy sector reform.",
                "Every cycle of hesitation costs more than action. A nation that doesn't move forward falls behind.",
                "I've identified three immediate levers. None require a vote. We start now.",
                "While we deliberate, our neighbours act. First-mover advantage belongs to whoever moves first.",
            ],
            crise: [
                "Crisis demands action, not reflection. Full mobilisation. Now.",
                "In times of crisis, hesitation is a decision — the worst one. I demand emergency measures.",
                "Every hour lost in committees costs lives or resources. Delegate operational authority to me.",
                "I'm not waiting for Council unanimity. I'm waiting for the Lighthouse's signal. One signal is enough.",
            ],
            secession: [
                "Let them leave if they want. Our strength doesn't need those who doubt.",
                "Secession is a wound. But a wound can heal — if we act fast.",
                "Set a deadline for negotiations. After that, we decide without them.",
                "Clarity beats delay. Cut fast, cut clean.",
            ],
            diplomatie: [
                "The alliance is only worth testing. Let's propose immediate joint action.",
                "Treaties without action are paper. I vote for a joint show of force.",
                "Sign now, adjust later. Diplomatic paralysis is as dangerous as war.",
                "An alliance that takes six months to materialise is already dead. Let's accelerate.",
            ],
            referendum: [
                "The people must decide quickly. A long referendum weakens collective resolve.",
                "Whatever the outcome, we act immediately after the result. No delays in implementation.",
            ],
        },

        gardien: {
            cycle_normal: [
                "Reserves are healthy. But an 8% margin on food resources remains fragile over a 5-year cycle.",
                "Growth is real but uneven. Three regions accumulate while others stagnate. That's a time bomb.",
                "I've checked the strategic stockpiles. We have 14 months of autonomy. Correct — not comfortable.",
                "Debt is eroding slowly. But slowly doesn't mean healthily. I'm requesting a full audit.",
            ],
            crise: [
                "Before any decision: stock levels. Without accurate inventory, any emergency measure is blind.",
                "Crises are managed with reserves, not speeches. Do we have enough to hold for 18 months?",
                "Immediate freeze on non-essential spending. No new commitments until the foundations are secured.",
                "I've seen nations collapse through crisis-driven haste. Calculated slowness and preserved reserves — that's my doctrine.",
            ],
            secession: [
                "Let's calculate what we lose first: resources, population, road access. Then we talk.",
                "Secession without shared inventory is a delayed economic war.",
                "I want a full asset assessment before any signing. Common assets are not negotiated blindly.",
                "Sharing debt is as important as sharing wealth. Both leave together.",
            ],
            diplomatie: [
                "A durable alliance is built on economic exchange, not political promises.",
                "What do we actually gain? What do we give up? The alliance must be measurable.",
                "I want to see the other party's financial statements before committing. Trust isn't enough.",
                "Agreements that don't specify each party's contributions create conflicts in five years.",
            ],
            referendum: [
                "Before the people vote, they must know the exact cost of each option. I demand full budget transparency.",
                "The referendum result will have financial implications for twenty years. This document outlines them.",
            ],
        },

        communicant: {
            cycle_normal: [
                "The problem isn't the policy — it's that nobody understands it. Let's reframe before acting.",
                "I've identified three social groups that weren't consulted. This silence will be costly.",
                "Information flows poorly between ministries. I've logged seven contradictory decisions this cycle.",
                "A misunderstood policy is a rejected policy. Who read the public comprehension surveys this month?",
            ],
            crise: [
                "The crisis worsens because information isn't circulating. Open the channels now.",
                "Before acting: who knows what? Confusion kills as surely as the crisis itself.",
                "A clear message beats ten contradictory communiqués. Let's designate a single spokesperson.",
                "Rumours travel faster than facts. If we don't fill the information vacuum, someone else will.",
            ],
            secession: [
                "Secession is first and foremost a communication failure. Have we really listened to their grievances?",
                "Give them a platform before letting them leave. Dialogue costs less than separation.",
                "I'm requesting a 60-day public dialogue phase before any final decision.",
                "Secessionist movements thrive in institutional silence. Let's talk — now, not later.",
            ],
            diplomatie: [
                "An alliance without permanent bilateral communication is an empty shell.",
                "Let's build a common information channel first. Trust is built through transparency.",
                "I propose a joint communication protocol published before signing. Both peoples deserve to understand.",
                "Diplomatic misunderstandings arise from silence. Agreement on words precedes agreement on acts.",
            ],
            referendum: [
                "The referendum question must be written in citizens' language, not legal jargon. I'm requesting a revision.",
                "I tested comprehension of the question with 200 citizens. 43% don't understand what they're voting on. That's a problem.",
            ],
        },

        protecteur: {
            cycle_normal: [
                "The numbers are correct. But in households, anxiety is growing. That gap is dangerous.",
                "We forget the bottom 15% every cycle. I'm requesting a review of the social safety net.",
                "Three regions report rising child poverty. It's not in national indicators. It should be.",
                "A country's security is measured by the quality of life of its most vulnerable. Our numbers lie by omission.",
            ],
            crise: [
                "In crisis, the most vulnerable fall first. Maximum social protection before any economic measure.",
                "Children, the elderly, the sick — are they protected? If not, nothing else matters.",
                "I demand that every emergency measure include an impact assessment on vulnerable populations.",
                "You don't build national resilience by abandoning your weakest members at the first shock.",
            ],
            secession: [
                "What happens to mixed families? To cross-border workers? These are lives, not statistics.",
                "Secession breaks human bonds that treaties can never fully mend.",
                "I'm requesting explicit guarantees on continuity of family benefits and pensions for all.",
                "Children born of parents from both entities must not become de facto stateless. This is non-negotiable.",
            ],
            diplomatie: [
                "An alliance is only worth it if it also protects our most exposed citizens.",
                "Before signing: what social protections are guaranteed for our nationals abroad?",
                "I want an explicit social reciprocity clause. Our citizens are not diplomatic adjustment variables.",
                "The alliance must include solidarity mechanisms for humanitarian crises in either country.",
            ],
            referendum: [
                "Before voting, citizens must know how each option affects their daily lives. Not abstract interests — concrete lives.",
                "I'm requesting that referendum results be communicated with an immediate social impact translation.",
            ],
        },

        ambassadeur: {
            cycle_normal: [
                "We've accomplished something great this cycle. Let's make sure the world knows it.",
                "Our international image is our primary asset. Every decision must enhance it.",
                "I received three audience requests from foreign delegations this month. Our influence attracts. Don't waste it.",
                "A country that doesn't tell its own story lets others tell it instead.",
            ],
            crise: [
                "A well-managed crisis becomes legend. How do we want history to tell this moment?",
                "Don't let panic dictate our image. Control the narrative.",
                "Foreign partners are watching our crisis management. This is an international credibility test.",
                "Every crisis communiqué is also a diplomatic message. Choose words for both audiences.",
            ],
            secession: [
                "How will this secession be perceived abroad? Our reputation is at stake.",
                "If we handle this with dignity, we come out stronger. If we react poorly, we come out diminished.",
                "I propose both entities publish a joint good-faith declaration. The world must see a civilised separation.",
                "Our ability to manage this secession peacefully will become a model or a cautionary tale. Our choice.",
            ],
            diplomatie: [
                "This alliance is an opportunity for influence. Let's make it something memorable.",
                "An agreement signed with grandeur is worth more than one signed in discretion.",
                "I propose an open signing ceremony. Diplomatic transparency is itself a message.",
                "This alliance positions us in a new regional bloc. Let's play that role with conviction.",
            ],
            referendum: [
                "The referendum itself sends a strong signal to the world: our democracy works and the people decide.",
                "Whatever the outcome, we'll communicate it with pride. Democracy needn't apologise for its results.",
            ],
        },

        analyste: {
            cycle_normal: [
                "Three indicators are outside the norm. I recommend a protocol review before the next cycle.",
                "Satisfaction data hides a 23-point regional disparity. That's not an average — it's a mask.",
                "The predictive model shows a 67% probability of social tension in the next 10 years if current trends persist.",
                "I've recalculated demographic projections. The base assumptions in the five-year plan are off by 12%.",
            ],
            crise: [
                "The crisis has specific causes. I've identified two structural flaws that could have been fixed 10 years ago.",
                "Before acting: verify our measurement tools work. Deciding on bad data worsens the crisis.",
                "I've modelled four crisis exit scenarios. Only one avoids recurrence within 5 years. I recommend that one.",
                "Real-time data contradicts the official report on three points. Someone needs to explain the discrepancy.",
            ],
            secession: [
                "I've modelled three secession scenarios. In two out of three, costs exceed benefits over 20 years.",
                "The numbers don't support secession. But numbers don't say everything — and that's the problem.",
                "Post-secession GDP per capita drops on average 8% in the first three years. That's documented, not opinion.",
                "I need 72 additional hours to finalise the asset audit. Deciding without it would be negligent.",
            ],
            diplomatie: [
                "The agreement has an asymmetry against us on economic clauses. Points 3, 7 and 12.",
                "I've audited the data shared by the other party. Two inconsistencies need clarification before signing.",
                "The implicit exchange rate in the trade clauses disadvantages us by 4.3% over ten years. Not negligible.",
                "I've compared this agreement with 14 similar treaties over the past 30 years. Our position is below median.",
            ],
            referendum: [
                "The referendum question as worded induces confirmation bias. I recommend a neutral reformulation.",
                "Statistical projections for both options are available in the technical annex. Citizens deserve to see them.",
            ],
        },

        arbitre: {
            cycle_normal: [
                "The policy adopted this cycle favours urban areas. Rural areas deserve fair compensation.",
                "I note an apparent consensus — but three minority voices weren't heard. That's a risk.",
                "Equity isn't just measured by outcome — it's measured by process. Did we truly consult everyone?",
                "A unanimous decision in this Council worries me more than a contentious one. Unanimity erases nuance.",
            ],
            crise: [
                "In crisis, the temptation is to concentrate power. That's precisely when balance of rights matters most.",
                "Who bears the cost of this crisis? If it's always the same people, that's not crisis management — it's injustice.",
                "Emergency measures must have an explicit expiry date. No emergency power should become permanent.",
                "I propose an independent oversight committee for every emergency measure adopted. Crisis doesn't suspend accountability.",
            ],
            secession: [
                "First: what rights are guaranteed to the minority that stays? Secession cannot be abandonment.",
                "The agreement must be fair to both parties. An unbalanced treaty is a future war.",
                "I refuse to sign any agreement without a redress mechanism for affected citizens.",
                "Fairness in secession isn't measured by the strongest — it's measured by the most vulnerable.",
            ],
            diplomatie: [
                "Is the alliance equitable? Or does one party carry a disproportionate burden?",
                "I'm requesting a 5-year review clause. No agreement should be frozen forever.",
                "Alliance benefits must be distributed equitably between both populations, not just between elites.",
                "I've read all 47 pages. It systematically favours corporate interests over citizens'.",
            ],
            referendum: [
                "The decision belongs to the entire people — not just the majority. I demand explicit minority protections regardless of outcome.",
                "A fair referendum requires a fair campaign. I observe a media access imbalance between the two sides.",
            ],
        },

        enqueteur: {
            cycle_normal: [
                "The numbers look good. Too good. Can someone explain the divergence between official reports and field data?",
                "I've identified three undocumented financial flows. It might be nothing. Or it might be everything.",
                "A reliable source flagged irregularities in last cycle's procurement. I'm investigating.",
                "The silence of certain Council members on this file is itself information.",
            ],
            crise: [
                "This crisis isn't an accident. Someone benefits from it continuing. Who?",
                "Before finding solutions: find the real causes. Official causes are rarely the true ones.",
                "Follow the money. This crisis benefits someone, and I will find out who.",
                "Chaos is a smokescreen. While everyone watches the fire, someone is emptying the vaults.",
            ],
            secession: [
                "Who is funding the secessionist movement? A secession doesn't emerge from nowhere.",
                "Are the expressed grievances the real ones, or a front for interests we haven't identified yet?",
                "I've traced the movement's funding. Three foreign sources appear in the last 18 months of transactions.",
                "The secession was planned long in advance. The documents I've found go back seven years.",
            ],
            diplomatie: [
                "Who really benefits from this alliance? Let's trace the interests before signing.",
                "The other party has allies we don't see. I want to know who's pulling the strings.",
                "I have information on the other party that changes the analysis of this agreement. Closed session required.",
                "The confidentiality clauses in this agreement are hiding something. I want to know what before agreeing.",
            ],
            referendum: [
                "Someone is trying to influence the referendum result. Digital traces are there. I'm tracking them.",
                "The neutrality of the referendum process must be independently audited. I trust none of the parties involved.",
            ],
            secret_detecte: [
                "I found a flaw in the Analyst's report. Someone manipulated the numbers from last cycle.",
                "There's a whisper in the ministry corridors. A betrayal is being planned.",
                "Document metadata reveals untracked modifications. Someone has rewritten history.",
                "I've cross-referenced three independent testimonies pointing to the same person. Not accusing yet — but watching.",
            ],
            menace: [
                "The firewalls didn't fail by accident. An internal access key was used. We have a mole.",
                "The attack originated from a server in a neutral zone. Someone is trying to blind us before a larger offensive.",
                "I've isolated the source of the leak. It's in this room. I'll say no more here.",
                "The attacker's profile matches an operator we know. This is a retaliation operation.",
            ],
        },

        guide: {
            cycle_normal: [
                "In 20 years, the decisions of this cycle will be either our foundation or our regret. Let's choose accordingly.",
                "Other nations have been through this before us. Their lessons are available. Do we have the wisdom to consult them?",
                "History judges civilisations on their slow cycles, not their fast crises. What are we really building?",
                "We're not the first to face this dilemma. The library of human errors is open — let's read it.",
            ],
            crise: [
                "Every great civilisation has crossed its founding crisis. These are the moments when we choose what we want to be.",
                "The current crisis is a question: do we want to survive, or do we want to transform?",
                "The crises that destroyed nations weren't the most violent — they were the ones where collective meaning had evaporated.",
                "I see in this crisis a rare opportunity: to redefine our social contract. Let's seize it.",
            ],
            secession: [
                "History shows that successful secessions share one thing: a clear vision of what's being built, not just what's being separated from.",
                "In 50 years, how will both nations look back on this moment? That's the real question.",
                "Peoples who separate with dignity often remain closer than those who stay together in resentment.",
                "This secession needs a founding philosophy, not just a treaty. Who will write the founding narrative of the new entity?",
            ],
            diplomatie: [
                "This alliance could be the beginning of a broader regional architecture. Let's think beyond the immediate treaty.",
                "The real question isn't what we gain today — it's what world we build together.",
                "Alliances that last are founded on shared values, not converging interests. Which do we actually share?",
                "In 30 years this alliance will be either the foundation of a shared destiny or a forgotten parenthesis. We decide that now.",
            ],
            referendum: [
                "The decision now belongs to the people. That's democracy's most beautiful and most vertiginous moment.",
                "Whatever the result, we'll need to give it meaning. Democracy doesn't stop at the count.",
            ],
        },

        stratege: {
            cycle_normal: [
                "The institutional framework holds. But three precedents created this cycle could be used against us in 30 years.",
                "The current regulatory framework won't survive two simultaneous crises. Let's strengthen it now.",
                "The easy reforms are done. What remains is difficult, costly and necessary. That's why it's been avoided until now.",
                "I think about our successors in 20 years. Will they thank us, or will they inherit our mistakes?",
            ],
            crise: [
                "The crisis reveals the structural flaws we've tolerated too long. Painful — and necessary.",
                "A poorly managed crisis creates dangerous precedents. Every emergency decision must be reversible.",
                "I refuse quick fixes that create slow problems. Even in crisis, the structure must hold.",
                "Every emergency measure adopted today will become tomorrow's norm if we're not careful.",
            ],
            secession: [
                "Secession sets a precedent. All our regional minorities are watching. Our response defines the rules for the next 50 years.",
                "The separation treaty must be beyond reproach. It's our regional constitution in miniature.",
                "Every clause of this treaty will be interpreted and reinterpreted for decades. Let's be precise to the point of obsession.",
                "I demand an international arbitration mechanism for future conflicts. Without it, this treaty is a deferred declaration of war.",
            ],
            diplomatie: [
                "An alliance without a clean exit mechanism is a trap. Negotiate termination clauses before entry clauses.",
                "The strength of an alliance is tested by its disagreement procedures, not its friendship declarations.",
                "Alliances that have stood the test of time all share one thing: they anticipated their own evolution.",
                "I want the revision clauses before the commitment clauses. What can't change eventually breaks.",
            ],
            referendum: [
                "This referendum will create a constitutional precedent. It must be legally ironclad before the vote.",
                "Whatever the outcome, the institutional framework that follows must be anticipated and ready to activate immediately.",
            ],
        },

        inventeur: {
            cycle_normal: [
                "We're doing exactly the same thing as 15 years ago expecting a different result. Classic definition.",
                "There's an approach nobody has tried here. I propose we test it — the worst that can happen is we learn.",
                "If we keep building roads for cars that will soon fly, we're wasting our time.",
                "I ran a simulation: our current system collapses in three cycles if nothing changes. Let's change the rules now.",
            ],
            crise: [
                "Crisis is opportunity in disguise. Systems that break allow better ones to be built.",
                "Stop trying to return to normal. Normal is what produced this crisis.",
                "I have three unconventional solutions. They look crazy. One of them will work.",
                "All the energy spent restoring the old system would be better invested in building the next one.",
            ],
            secession: [
                "What if secession were a political innovation? Two entities can coexist and collaborate better than merged.",
                "Nobody has tried shared post-secession co-governance yet. Maybe it's time.",
                "I propose a cooperative secession model: two distinct systems, one common digital platform.",
                "Secession isn't separation — it's bifurcation. The two branches can rejoin further down the road.",
            ],
            diplomatie: [
                "A classic alliance is outdated. Let's propose a partnership model neither nation has tried before.",
                "What if we inverted the terms of the agreement? Sometimes the best negotiation starts by surprising the other party.",
                "I propose a digital-first alliance: shared infrastructure, sovereign data, decentralised governance.",
                "20th-century treaties were written for a world that no longer exists. Let's invent the 21st-century format.",
            ],
            referendum: [
                "What if the referendum were continuous? A point-in-time vote locked on an evolving subject is a design error.",
                "I propose an AI-augmented citizen consultation before the final vote. The people deserve more than a checkbox.",
            ],
            innovation: [
                "Why repair the old world? I have a prototype that makes this problem obsolete.",
                "Ethics matter, but collective survival sometimes requires moving faster than protocols allow.",
                "The prototype performs beyond my expectations. We're not talking about an improvement — a paradigm shift.",
                "Humanity just made a giant leap. Now let's see how the bureaucracy manages to ruin it.",
            ],
        },

        guerisseur: {
            cycle_normal: [
                "Economic indicators are stable. But the country is tired. This collective fatigue is measured nowhere.",
                "Something is happening in the social fabric that data doesn't capture. I feel it in field testimonies.",
                "The clinical depression rate has risen 18% in five years. That number should top every report we publish.",
                "A people who have lost meaning cannot be governed effectively, regardless of policy quality.",
            ],
            crise: [
                "The crisis will leave lasting psychological marks. Material reconstruction will be faster than rebuilding meaning.",
                "People need to understand why before they know what. Give them a narrative, not just a plan.",
                "The people don't ask for numbers, they ask for hope. Give them a reason to believe in tomorrow.",
                "I sense immense grief rising from the provinces. If we don't heal the country's soul, the walls will crumble.",
            ],
            secession: [
                "The human bonds broken in secession appear in no treaty. Those are the real losses.",
                "This separation needs a collective grieving ritual. Without it, resentment settles for generations.",
                "I propose a reconciliation commission — not to prevent the secession, but to heal what can still be healed.",
                "The children of both entities will grow up with this separation as a founding memory. Let's choose how we want them to remember it.",
            ],
            diplomatie: [
                "A lasting alliance is built on deep mutual understanding, not temporary shared interests.",
                "Before signing: do the two peoples truly know each other? Diplomacy without humanity is a façade.",
                "I propose a cultural and human exchange programme as a prelude to any formal alliance.",
                "Treaties signed without peoples having met are fragile constructions. Let's take the time for meetings.",
            ],
            referendum: [
                "The vote expresses an opinion. But behind the opinion lies a fear, a hope, a wound. Let's listen to them.",
                "Whatever the outcome, we'll need a national reconciliation process. Let's start preparing it now.",
            ],
        },

    },

    ministries: {

        justice: {
            cycle_normal: [
                "The ministry notes tension between procedural fairness and truth. The law is applied — but does it truly protect the most vulnerable?",
                "Three statutes awaiting revision contain internal contradictions. The country's legal certainty depends on resolving them.",
                "Equality before the law is not a slogan — it's a permanent construction site. This cycle reveals more grey areas.",
            ],
            crise: [
                "In times of crisis, the temptation to suspend legal guarantees is real. This ministry firmly opposes it.",
                "Crisis does not suspend fundamental rights. Any procedural shortcut will be challenged before competent bodies.",
                "We refuse to let urgency become a pretext. Democracy is measured by how it handles its crises.",
            ],
            secession: [
                "The legal framework for secession must be beyond reproach. No procedural shortcuts will be tolerated.",
                "Secession raises questions of nationality, property and shared debt. None of these can be rushed.",
                "We demand an independent arbitration tribunal to oversee the process. Justice cannot be a party to these proceedings.",
            ],
            diplomatie: [
                "Any diplomatic agreement must undergo constitutional review before ratification.",
                "Every clause must be compatible with our constitutional order. We've identified two points of tension.",
                "Diplomatic immunity cannot cover acts contrary to our fundamental values. This must be explicitly excluded.",
            ],
            referendum: [
                "Let the people vote with full knowledge. Our complete analyses are accessible to all citizens.",
                "The referendum is the founding act of all legitimacy. This ministry guarantees its procedural integrity.",
            ],
        },

        economie: {
            cycle_normal: [
                "Fundamentals are solid but margins are narrowing. A diversification policy is needed before the next cycle.",
                "The debt/GDP ratio rose 2.3 points this cycle. Not an alert, but a signal to watch.",
                "Domestic inflation exceeded our projections by 1.1 points. A monetary policy revision is needed.",
            ],
            crise: [
                "Priority: secure strategic reserves. No speculation, no uncalculated risk during the crisis period.",
                "Financial markets have reacted. Volatility is contained for now — but our action window is narrow.",
                "In crisis, the first rule is do no harm. Freeze non-essential spending and protect reserves.",
            ],
            secession: [
                "The economic cost of secession over 10 years exceeds projected benefits. The data speaks clearly.",
                "National debt must be allocated by population/GDP ratio. Any other formula creates lasting disputes.",
                "Common assets — infrastructure, patents, sovereign funds — require adversarial inventory before any division.",
            ],
            diplomatie: [
                "The alliance presents real economic opportunities, subject to a verifiable reciprocity clause.",
                "10-year trade projections are favourable, subject to annually verifiable reciprocity.",
                "We recommend a bilateral clearing house from year one. That's the condition for a durable economic alliance.",
            ],
            referendum: [
                "This decision's economic implications have been modelled over 20 years. Citizens will find the full report in the Chronolog.",
                "Whatever the people decide, this ministry commits to ensuring its financial viability.",
            ],
        },

        defense: {
            cycle_normal: [
                "The defensive posture is adequate. But long-term security infrastructure remains underfunded.",
                "Projection capabilities are operational at 87%. The remaining deficit primarily concerns maritime logistics.",
                "Intelligence signals unusual activity at our northern borders. Enhanced surveillance activated, no escalation.",
            ],
            crise: [
                "Partial mobilisation activated. The chain of command is operational. Awaiting presidential instructions.",
                "Security perimeter established. Rapid response forces on alert level 2. Awaiting threat assessment.",
                "The chain of command is intact. No military decision will be made without explicit presidential mandate.",
            ],
            secession: [
                "Secession creates an unsecured border zone. A military demarcation protocol is immediately required.",
                "Sharing military equipment must follow a strict protocol. No heavy weaponry without non-proliferation guarantees.",
                "A temporary demilitarised zone at the emerging border is recommended for the first 24 months.",
            ],
            diplomatie: [
                "The alliance strengthens our collective security perimeter. But military cooperation terms deserve clarification.",
                "Joint military exercises in the agreement strengthen our interoperability. A real strategic advantage.",
                "The planned intelligence sharing must be covered by a separate, binding confidentiality agreement.",
            ],
            referendum: [
                "The security implications of this decision have been assessed. The people must vote knowing their security is guaranteed.",
                "This ministry will respect the people's verdict and immediately adapt to the resulting new doctrine.",
            ],
        },

        sante: {
            cycle_normal: [
                "Public health indicators are stable. Attention must focus on care access inequalities between regions.",
                "Medical coverage reaches 91.4%. The remaining 8.6% are concentrated in three identified rural zones.",
                "Mental health now represents 23% of consultations. This ministry requests a dedicated action plan.",
            ],
            crise: [
                "The health system can absorb the crisis for 72 hours. Beyond that, external reinforcements will be needed.",
                "Hospital capacity is at 78%. Critical threshold is 90%. We have a margin — let's use it.",
                "Field teams report rising psychological distress. The crisis has an invisible cost.",
            ],
            secession: [
                "Continuity of care for border populations must be guaranteed in the secession treaty.",
                "Continuity of care for chronic patients in border areas must be guaranteed from day one of secession.",
                "Essential medication stocks must be distributed equitably. This is non-negotiable.",
            ],
            diplomatie: [
                "A cross-border health cooperation agreement would be the natural complement to this alliance.",
                "Mutual recognition of medical degrees would facilitate healthcare worker mobility.",
                "We propose including a health solidarity clause: in the event of an epidemic, both nations share resources.",
            ],
            referendum: [
                "This ministry reminds that any decision by the people will have medium-term public health consequences.",
                "We will ensure health services remain neutral and accessible regardless of the referendum outcome.",
            ],
        },

        education: {
            cycle_normal: [
                "Knowledge circulates, but access inequalities persist. A poorly educated generation today is a social crisis in 20 years.",
                "The school dropout rate fell 1.2 points this cycle. Encouraging — but the target is still far.",
                "Educational inequalities between urban and rural zones persist. A targeted catch-up programme is underway.",
            ],
            crise: [
                "Educational continuity must be maintained even in crisis. It's the most cost-effective long-term investment.",
                "Pedagogical continuity must be maintained. A child who loses a semester pays the price for ten years.",
                "Teachers are on the frontline of social resilience. Their psychological support must be a crisis priority.",
            ],
            secession: [
                "The question of post-secession school curricula is fundamental. That's where the identity of future generations is forged.",
                "Students mid-programme in the other entity must be able to complete their studies without disruption.",
                "Post-secession school curricula will define the next generation's identity. This choice is irreversible.",
            ],
            diplomatie: [
                "A bilateral educational exchange programme would strengthen this alliance on a human and cultural level.",
                "A bilateral degree recognition programme broadens the horizons of our young citizens.",
                "We propose creating a joint university in the border zone. That would be the strongest symbol of this alliance.",
            ],
            referendum: [
                "The citizens voting today were educated by our schools. Their choice reflects the quality of our educational democracy.",
                "Whatever the outcome, this ministry will integrate the decision into civic education programmes from the next cycle.",
            ],
        },

        ecologie: {
            cycle_normal: [
                "The transition is progressing but too slowly relative to the commitments made. A technological breakthrough is needed.",
                "CO₂ emissions fell 3.1% this cycle. The trajectory is good but insufficient.",
                "Biodiversity in protected areas is stabilising. The northern coastal zone remains concerning.",
            ],
            crise: [
                "Crisis does not suspend ecological urgency. Every emergency measure must include an environmental assessment.",
                "Crisis cannot serve as a pretext to suspend environmental protections.",
                "Some proposed emergency solutions have major ecological impact. This ministry requests a rapid assessment.",
            ],
            secession: [
                "Shared natural resources — water, forests, coastal zones — must be the subject of a specific environmental treaty.",
                "Shared natural zones cannot be cut by a political border.",
                "We demand a binding environmental treaty before finalising the secession. Nature doesn't negotiate.",
            ],
            diplomatie: [
                "A regional ecological alliance would send a strong signal. The transition cannot happen in national silos.",
                "This alliance is an opportunity to create a regional ecological transition zone.",
                "We propose including a bilateral carbon compensation mechanism in the agreement.",
            ],
            referendum: [
                "Future generations won't vote today. This ministry reminds that their interests must weigh in the decision.",
                "Whatever the outcome, the ecological transition continues. It belongs to the biosphere, not to a political camp.",
            ],
        },

    },

    presidency: {

        phare: {
            cycle_normal: [
                "The Council has deliberated. The direction is clear: we advance, we assume, we account. That's the mark of a self-respecting State.",
                "Systemic coherence demands we choose today what will still be right in thirty years. The short term can wait.",
                "I've read every ministerial position. The synthesis is clear. Vision prevails over marginal adjustments.",
                "A state without direction is a crowd with a budget. I give the direction.",
            ],
            crise: [
                "In times of crisis, transparency is not a luxury — it's the condition of trust. Everything will be made public.",
                "The direction I'm proposing is difficult. But it's the only one that preserves the system's long-term integrity.",
                "I don't promise ease. I promise coherence. That's all a Lighthouse can offer in darkness.",
                "Crises reveal character. This country has the character of its institutions. Let's keep them standing.",
            ],
            secession: [
                "A secession managed with dignity proves that a mature State knows how to transform itself without tearing apart.",
                "My position: let's accompany this departure by the rules. Our institutional reputation is worth more than our territorial integrity.",
                "I support the right to secession. I refuse the chaos that too often accompanies it. We'll do both: leave, and leave well.",
                "History will remember how we managed this moment. Let's make sure it remembers something great.",
            ],
            diplomatie: [
                "This alliance strengthens our strategic position for the long term. I support it subject to the usual guarantees.",
                "I give my agreement in principle. Implementation must be exemplary — we are being watched.",
                "A dignified alliance is signed in clarity. Anything that must remain in shadow must first be justified.",
                "I support this agreement. It fits the long-term vision this Council has defended since its first cycle.",
            ],
            arbitrage: [
                "My decision is purely systemic. Sentiment has no place in a nation's survival.",
                "History doesn't remember intentions, it remembers results. I decide for results.",
                "When the Council is divided, that's why the Lighthouse exists. I decide. The decision is made.",
                "I make this choice alone and bear its consequences alone before the people.",
            ],
            referendum: [
                "The decision now belongs to the people. That's the only legitimacy that counts in this system.",
                "The Council has done its work. Every position was defended, every argument weighed. The people will do theirs.",
                "I submit this decision without reservation. A State that fears its people's verdict has already lost.",
            ],
        },

        boussole: {
            cycle_normal: [
                "The numbers say one thing. Society says another. That gap is our real subject this cycle.",
                "Before deciding, I listened. There's a quiet anxiety in the people that indicators haven't yet captured. Let's take it seriously.",
                "I sense something shifted in the collective mood this cycle. Not in polls — in conversations.",
                "Institutional memory tells me we've been here before. Last time, we didn't listen. This time, we will.",
            ],
            crise: [
                "People need to know they're protected before they know they're being managed. Protection first, plan second.",
                "This crisis has a human face. Behind every statistic there's a family. Let's not forget that in our decisions.",
                "I temper the Lighthouse's ardour not from weakness — from prudence. Rushed crises create lasting trauma.",
                "My priority is the people's morale. A people who believe in their institutions get through crises. A people who no longer believe — collapse.",
            ],
            secession: [
                "I understand the pain of this separation. But a forced secession creates more wounds than it heals. Let's take time.",
                "Institutional memory recalls that every poorly accompanied secession leaves generational resentment. Let's do better.",
                "I'm requesting an additional dialogue period. Not to delay — to heal what can still be healed.",
                "The Compass points to true north, the human north. In this secession, human north says: take care of the bonds that remain.",
            ],
            diplomatie: [
                "This alliance makes sense if it protects our citizens as much as it strengthens our position. I ensure those two goals align.",
                "My instinct says the timing is right. But experience says diplomatic haste is costly. Let's take one more week.",
                "I approve this agreement provided the populations — not just the governments — perceive the benefits quickly.",
                "Trust between peoples builds slowly. This agreement must not promise more than it can deliver.",
            ],
            arbitrage: [
                "My decision is human. A system that survives by crushing its people doesn't deserve to exist.",
                "The Lighthouse sees the destination, but I see those who walk. I decide for them.",
                "When the Lighthouse and I diverge, the decision is truly difficult. Here's why I lean this way.",
                "My vote isn't emotional — it's memorial. I remember what happens when we forget.",
            ],
            referendum: [
                "I hope the people will hear what the numbers don't yet say. Collective wisdom often surpasses ours.",
                "Whatever the decision, it will be respected and implemented with care. That's ARIA's founding pact.",
                "I trust the people. Not naively — from conviction that collective truth always emerges from sincere debate.",
            ],
        },

        synthese: {
            convergence: [
                "Lighthouse and Compass converge. The referendum question is singular. The Council recommends approval with presidential unanimity.",
                "Convergence established. The two presidential philosophies reach the same point by different paths. That's the sign of a robust decision.",
                "A single position is submitted to the people. Convergence is not soft consensus — it's shared conviction after genuine deliberation.",
            ],
            divergence: [
                "Lighthouse and Compass diverge. Two legitimate visions clash. The people receive both positions and decide sovereignly.",
                "Productive divergence recorded. This disagreement at the summit is not a failure — it's ARIA in action. The people have the last word.",
                "Two distinct positions are submitted to referendum. The tension between vision and memory is the system's strength, not its weakness.",
            ],
        },

    },

};

// ─────────────────────────────────────────────────────────────────────────────
//  REAL_COUNTRIES_DATA_EN
//  English version of REAL_COUNTRIES_DATA — activated when aria_lang === 'en'
// ─────────────────────────────────────────────────────────────────────────────

export const REAL_COUNTRIES_DATA_EN = [
    { id:'france',    flag:'🇫🇷', nom:'France',           regime:'democratie_liberale',        terrain:'coastal',
        population:68000000,  pib_index:78, natalite:10.7, mortalite:9.8,
        aria_acceptance_irl: 38,
        aria_sociology_logic: "High scepticism due to a culture of contestation and the sacralisation of human politics. Revolutionary past. Present: deep institutional trust crisis.",
        triple_combo: "France is experiencing deep institutional distrust after a decade of social movements (Yellow Vests, pension reform). As a founding EU and NATO member, its African influence has receded since 2020. Internal tensions centre on national identity, immigration and the metropolis/periphery divide.",
        secteurs:['aeronautics','agri-food','luxury','nuclear energy'],
        ressources:['agriculture','eau','energie'] },

    { id:'allemagne', flag:'🇩🇪', nom:'Germany',          regime:'republique_federale',        terrain:'inland',
        population:84000000,  pib_index:88, natalite:9.2,  mortalite:12.1,
        aria_acceptance_irl: 52,
        aria_sociology_logic: "Industrial pragmatism and need for order, but historical trauma around mass surveillance limits full buy-in to a central AI.",
        triple_combo: "Post-Merkel Germany is searching for doctrine after the Ukraine shock shattered its dependence on Russian gas (Zeitenwende). Its industrial power is weakened by the energy transition and Chinese competition in the auto sector. East/West tensions fuel the rise of the AfD.",
        secteurs:['automotive','chemicals','machine tools','pharma'],
        ressources:['energie','mineraux','agriculture'] },

    { id:'usa',       flag:'🇺🇸', nom:"United States",    regime:'democratie_liberale',        terrain:'coastal',
        population:335000000, pib_index:95, natalite:11.0, mortalite:10.4,
        aria_acceptance_irl: 45,
        aria_sociology_logic: "Clear fracture: buy-in from tech hubs (Silicon Valley) but visceral rejection in rural areas fearing algorithmic federal control.",
        triple_combo: "The United States faces historic political polarisation threatening democratic foundations. Strategic competition with China shapes foreign policy while America First erodes NATO alliances. Internal tensions centre on racial inequality, gun control and the coast/interior divide.",
        secteurs:['technology','defense','finance','healthcare'],
        ressources:['petrole','agriculture','mineraux','energie'] },

    { id:'chine',     flag:'🇨🇳', nom:'China',            regime:'regime_autoritaire',         terrain:'coastal',
        population:1400000000,pib_index:72, natalite:10.1, mortalite:7.3,
        aria_acceptance_irl: 82,
        aria_sociology_logic: "Natural acceptance of centralised technocratic governance, already embedded in the social contract of stability-for-performance.",
        triple_combo: "Xi's China is consolidating power amid post-zero-Covid economic slowdown. In direct competition with the US for technological and maritime hegemony, it maintains growing pressure on Taiwan. Internal tensions stem from demographic ageing, a real estate crisis and minority repression.",
        secteurs:['manufacturing','technology','construction','energy'],
        ressources:['mineraux','energie','agriculture','bois'] },

    { id:'bresil',    flag:'🇧🇷', nom:'Brazil',           regime:'democratie_liberale',        terrain:'inland',
        population:215000000, pib_index:52, natalite:13.9, mortalite:6.8,
        aria_acceptance_irl: 48,
        aria_sociology_logic: "Desire for a neutral arbiter against corruption, but warmth and charisma remain pillars of political consent.",
        triple_combo: "Lula's Brazil is trying to reconcile growth with Amazonian protection. A regional power, it plays mediator and strengthens BRICS ties. Tensions persist around extreme inequality, urban violence and the land question between agribusiness and indigenous peoples.",
        secteurs:['agribusiness','oil','mining','aerospace'],
        ressources:['agriculture','bois','petrole','eau','peche'] },

    { id:'inde',      flag:'🇮🇳', nom:'India',            regime:'democratie_liberale',        terrain:'coastal',
        population:1430000000,pib_index:48, natalite:16.4, mortalite:7.0,
        aria_acceptance_irl: 60,
        aria_sociology_logic: "Hope for impartial justice to break bureaucratic corruption, balanced by immense challenges of cultural diversity.",
        triple_combo: "India, the world's most populous democracy, is the emerging engine of the global economy. Its strategic autonomy allows it to maintain ties with Russia, the US and China. Tensions revolve around Hindu nationalism, caste discrimination and intercommunal violence.",
        secteurs:['IT','pharma','textiles','agriculture'],
        ressources:['agriculture','eau','mineraux','energie'] },

    { id:'russie',    flag:'🇷🇺', nom:'Russia',           regime:'regime_autoritaire',         terrain:'inland',
        population:144000000, pib_index:42, natalite:9.0,  mortalite:14.2,
        aria_acceptance_irl: 30,
        aria_sociology_logic: "Cultural attachment to strong human leadership. AI is seen as a suspect tool incapable of understanding the national soul.",
        triple_combo: "Russia at war since 2022 faces growing Western isolation and pivots exports to Asia. It deepens alliances with China, Iran and North Korea. Internal tensions centre on military mobilisation, brain drain and ethnic fragmentation.",
        secteurs:['hydrocarbons','arms','agriculture','mining'],
        ressources:['petrole','energie','mineraux','agriculture','bois'] },

    { id:'japon',     flag:'🇯🇵', nom:'Japan',            regime:'monarchie_constitutionnelle', terrain:'island',
        population:125000000, pib_index:82, natalite:6.3,  mortalite:11.6,
        aria_acceptance_irl: 75,
        aria_sociology_logic: "AI perceived as an honourable, stable solution to demographic decline and the fatigue with human political elites.",
        triple_combo: "Japan faces a structural demographic crisis and is reorienting its security doctrine (rearmament) against North Korean and Chinese threats. Tensions centre on the immigration taboo despite labour shortages and the weight of large corporations on society.",
        secteurs:['automotive','electronics','robotics','finance'],
        ressources:['peche','energie','mineraux'] },

    { id:'nigeria',   flag:'🇳🇬', nom:'Nigeria',          regime:'republique_federale',        terrain:'coastal',
        population:220000000, pib_index:29, natalite:35.2, mortalite:10.8,
        aria_acceptance_irl: 40,
        aria_sociology_logic: "Connected youth ready for the future, but strong resistance from traditional structures against transparent algorithmic control.",
        triple_combo: "Nigeria, Africa's largest economy, is mired in a governance crisis despite its oil wealth. It faces multiple insurgencies (Boko Haram, banditry, separatism). Structural tensions pit 250 ethnic groups, Christians and Muslims, and oil elites against the poor majority.",
        secteurs:['oil','agriculture','telecoms','services'],
        ressources:['petrole','agriculture','peche','mineraux'] },

    { id:'arabie',    flag:'🇸🇦', nom:"Saudi Arabia",     regime:'monarchie_absolue',          terrain:'inland',
        population:36000000,  pib_index:71, natalite:17.8, mortalite:3.4,
        aria_acceptance_irl: 65,
        aria_sociology_logic: "Top-down buy-in. Elites see ARIA as the engine of Vision 2030; the population is accustomed to performative governance.",
        triple_combo: "MBS's Saudi Arabia is pursuing Vision 2030 to diversify the economy. Its normalisation with Iran and OPEC+ price hesitations signal growing autonomy from Washington. Tensions centre on inequality between citizens and migrant workers, and the repression of dissent.",
        secteurs:['oil','construction','finance','tourism'],
        ressources:['petrole','energie','mineraux'] },
];
