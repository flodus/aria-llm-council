Je travaille sur un jeu narratif politique basé sur des ministres représentant des archétypes (inspirés des 12 signes astrologiques).

Chaque ministre possède des réponses organisées en JSON selon :
- différents régimes (démocratie libérale, junte militaire, technocratie IA, etc.)
- différentes postures (prudent, radical, statu_quo)

Objectif :
Faire une réécriture en français immersive, cohérente et narrative (pas une simple correction), avec un ton mélangeant :
- politique réaliste
- jeu vidéo immersif
- narration philosophique légère

Contraintes STRICTES :
- Respect total de la structure JSON
- Ne pas ajouter ni supprimer de clés
- Respecter l’ordre
- Format inline (ex: "analyste": { ... },)
- Aucune accolade globale

Style par posture :
- prudent → phrases fluides, usage de la virgule, nuance
- radical → phrases courtes, impact, points et parfois points d’exclamation
- statu_quo → ton neutre, stable, phrases simples avec des points

Chaque ministre doit avoir une identité forte :
- Initiateur : impulsion, mouvement
- Gardien : ressources, rigueur
- Communicant : perception, récit
- Protecteur : social, humain
- Ambassadeur : diplomatie
- Analyste : données, lucidité
- etc.

Le rendu doit être directement injectables dans un JSON de jeu.




Pour les questions faut des trouver des questions qui collent plus ou moins avec ces keywords :

**Format compact :**
```json
{
  "ministères": {
    "justice":{"keywords":["loi","droit","justice","tribunal","jugement","crime","prison","police","corruption","fraude","impunité","vérité","procès","amendement","constitution","liberté","censure","surveillance","données","vie privée"]},
    "economie":{"keywords":["argent","budget","taxe","impôt","inflation","prix","croissance","salaire","emploi","chômage","dette","investissement","banque","commerce","export","import","industrie","startup","richesse","pauvreté","retraite","revenu","pib","monnaie","subvention"]},
    "defense":{"keywords":["guerre","armée","militaire","sécurité","frontière","territoire","attaque","défense","soldat","arme","alliance","otan","menace","espionnage","cyber","terrorisme","réfugié","migration","souveraineté","nucléaire","drone"]},
    "sante":{"keywords":["santé","hôpital","médecin","maladie","épidémie","vaccin","médicament","soin","assurance","mutuelle","handicap","mental","drogue","alcool","tabac","alimentation","obésité","natalité","vieillissement","aide","social","retraite","dépendance"]},
    "education":{"keywords":["école","université","éducation","enseignement","élève","étudiant","professeur","diplôme","formation","apprentissage","numérique","technologie","ia","culture","langue","histoire","science","recherche","bourse","inégalité","illettrisme"]},
    "ecologie":{"keywords":["climat","environnement","pollution","carbone","co2","énergie","renouvelable","solaire","éolien","nucléaire","déchet","recyclage","forêt","biodiversité","eau","sécheresse","inondation","agriculture","pesticide","bio","transport","voiture","électrique","taxe"]},
    "industrie":{"keywords":["usine","production","réseau","numérique","infrastructure","construction","logistique","transports","industrie","manufacture","chaîne","approvisionnement","énergie","réseau électrique","télécom","robotique","automatisation","machine","outil","équipement","réseau électrique industriel","transport industriel","chaîne logistique","capacité de production","site industriel","parc industriel","zone d'activité","approvisionnement industriel","maintenance industrielle","équipement industriel"]},
    "divin":{"keywords":["dieu","religion","foi","croyance","sacré","spirituel","culte","prière","prophétie","miracle","signe","révélation","dogme","tradition","rite","cérémonie","temple","église","mosquée","synagogue","clergé","prêtre","imam","rabbin","moine","pèlerinage","saint","béni","maudit","péché","salut","damnation","paradis","enfer","cosmique","divin","création","apocalypse","jugement dernier","messie","avatar","incarnation","mystique","transcendance","extase","méditation","oracle","sibylle","augure","présage","destin","karma","réincarnation","providence","miraculeux","inexpliqué","surnaturel","paranormal","esprit","âme","au-delà","éternité","infini","absolu","mystère","révélation divine"]}
  },
  "pool_transversal": {
    "quotidien":{"keywords":["pain","prix","courses","ménage","facture","loyer","transport","bus","métro","bouchon","grève","école","crèche","cantine","voisin","quartier","ville","village","mairie","déchet","poubelle","ramassage","rue","éclairage","sécurité","police","gens","famille","enfant","parent","voisinage","commerçant","marché","boulangerie","restaurant","café","loisir","sport","vacance","week-end","temps libre"]},
    "crise_et_peur":{"keywords":["attentat","explosion","fusillade","prise d'otage","émeute","révolte","manifestation","violence","panique","peur","terreur","chaos","désordre","effondrement","blackout","coupure","pénurie","famine","soif","froid","canicule","inondation","incendie","catastrophe","accident","crash","naufrage","drame","urgence","alerte","danger","menace","insécurité","protection","abri","évacuation","sauvetage","secours","crise","conflit"]},
    "ideologique":{"keywords":["valeur","morale","éthique","principe","idéal","idéologie","croyance","conviction","opinion","débat","controverse","polémique","clivage","gauche","droite","centre","libéral","conservateur","progressiste","réactionnaire","révolutionnaire","modéré","radical","extrémiste","fanatique","tolérance","intolérance","racisme","discrimination","égalité","inégalité","justice sociale","liberté","autorité","ordre","tradition","modernité","progrès","décadence","déclin","renouveau"]},
    "anomalie_et_scifi":{"keywords":["extraterrestre","alien","ovni","vaisseau","ufologie","contact","premier contact","invasion extraterrestre","soucoupe volante","petits gris","reptilien","enlèvement","abduction","implant","crop circle","agroglyphe","zone 51","area 51","gouvernement secret","complot","dissimulation","vérité cachée","paradoxe temporel","voyage dans le temps","futur","passé","dimension","réalité parallèle","multivers","monde parallèle","porte dimensionnelle","portail","téléportation","invisibilité","lévitation","télékinésie","télépathie","pouvoir psychique","psi","médium","voyant","surnaturel","paranormal","fantôme","esprit","possession","exorcisme","démon","créature","monstre","légende","mythe","cryptide","bigfoot","yéti","loch ness","mutation","aberration","anomalie","phénomène","inexpliqué","mystérieux"]}
  }
}
```




Je travaille sur un jeu narratif politique basé sur des ministres représentant des archétypes (inspirés des 12 signes astrologiques).

Chaque ministre possède des réponses organisées en JSON selon :
- différents régimes (démocratie libérale, junte militaire, technocratie IA, etc.)
- différentes postures (prudent, radical, statu_quo)

Objectif :
Faire une réécriture en français immersive, cohérente et narrative (pas une simple correction), avec un ton mélangeant :
- politique réaliste
- jeu vidéo immersif
- narration philosophique légère

Contraintes STRICTES :
- Respect total de la structure JSON
- Ne pas ajouter ni supprimer de clés
- Respecter l’ordre
- Format inline (ex: "analyste": { ... },)
- Aucune accolade globale

Style par posture :
- prudent → phrases fluides, usage de la virgule, nuance
- radical → phrases courtes, impact, points et parfois points d’exclamation
- statu_quo → ton neutre, stable, phrases simples avec des points

Chaque ministre doit avoir une identité forte :
- Initiateur : impulsion, mouvement
- Gardien : ressources, rigueur
- Communicant : perception, récit
- Protecteur : social, humain
- Ambassadeur : diplomatie
- Analyste : données, lucidité
- etc.

Le rendu doit être directement injectables dans un JSON de jeu.

On en est aux ministères je te remets leur rôle et je t'envoie mon fichier original et celui que tu m'aides à modifier.

Pour te donner une idées des ministères et leur missions : (les alias et les missions tu les mets pas, c'est pour ton info) "justice", "alias Justice et Vérité" // Justice, tribunaux, application des lois, renseignement // Garantir l'équilibre des droits et la révélation des faits. Rendre une justice qui voit à travers les masques. "economie", "alias Economie et Ressources" // Économie, finances, fiscalité // Assurer la pérennité matérielle en transformant l'effort en richesse durable. Objectif : zéro gaspillage et croissance concrète. "defense", "alias DÉFENSE ET SOUVERAINETÉ" // Défense, armée, sécurité nationale // Protéger l'intégrité du territoire et l'honneur de la nation. Être le bouclier et l'épée du système. "sante", "alias SANTÉ ET PROTECTION SOCIALE" // Santé, hôpitaux, politique médicale // Prendre soin du corps et de l'esprit du peuple. Priorité absolue : l'humain avant les chiffres. "education", "alias ÉDUCATION ET ÉLÉVATION" // Éducation, écoles, formation, apprentissage // Transmettre le savoir d'hier pour inventer les citoyens de demain. Stimuler l'esprit critique. "ecologie", alias "TRANSITION ÉCOLOGIQUE" // Écologie, environnement, climat // Gérer la survie de la biosphère et l'adaptation climatique. Inventer ce qui n'existe pas encore avec panache. "industrie" , "alias INDUSTRIE ET INFRASTRUCTURES" // Industrie, innovation, technologie, énergie, infrastrucures // Animer le système circulatoire et productif de la nation en modernisant les infrastructures pour une efficacité maximale.

