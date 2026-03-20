on continue avec l'analyste par contre il y des règles maintenant :
vu que je vais les mettre les uns à la suite des autres je veux ce format :
(pas d'ouverture d'accolade)
"analyste": {
...
}, (accolade et virgule)

de plus j'aime pas les tirets cadratins, donc on va établir une règle selon le contexte. A la place des tirets cadratins, tu mets :

Posture "prudent" → privilégie la virgule (fluidité, retenue)
Posture "radical" → alterne point et point d'exclamation selon l'intensité
Posture "statu_quo" → essaie de rester au point (neutre, stable)





et si au passage tu peux me faire un prompt sur l'idée générale de ce qu'on est en train de faire que je pourrais te redonner si je dois refaire un fil je prends.



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
