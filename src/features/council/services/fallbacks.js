// src/features/council/services/fallbacks.js

// ============================================================
// RÉPONSES DE SECOURS POUR LA DÉLIBÉRATION
// ============================================================

import { loadLang } from '../../../ariaI18n';
import { getLocalResponse, getSyntheseMinistere, getAnnotationMinistere } from '../../../shared/services/boardgame/responseService';

// ============================================================
// FALLBACK BUREAUCRATIQUE — questions orphelines hors-ligne
// ============================================================
export const FALLBACK_RESPONSES = {
    ministerA: [
        { position: "La demande a été enregistrée sous référence ARIA-QUEUE-47. L'analyse des données historiques suggère une priorité de niveau 2. En attente de validation budgétaire inter-ministérielle.", mot_cle: 'enregistrement' },
        { position: "Le dossier a été transmis au Comité d'Évaluation Transversal. Les projections préliminaires indiquent un délai d'instruction de 12 à 18 cycles. Un accusé de réception sera émis.", mot_cle: 'transmission' },
        { position: "Procédure d'affectation en cours. Aucun ministère compétent identifié dans le référentiel standard. La question sera escaladée vers l'Instance de Coordination Interministérielle.", mot_cle: 'escalade' },
        { position: "Requête cataloguée. L'examen préliminaire révèle une complexité transversale nécessitant une consultation multi-sectorielle. Statut : PENDING_REVIEW.", mot_cle: 'analyse' },
    ],
    ministerB: [
        { position: "Conformément au protocole ARIA-7.4, toute demande sans affectation directe est soumise à un audit de pertinence. Les résultats préliminaires seront disponibles sous 3 cycles.", mot_cle: 'audit' },
        { position: "La base de données de jurisprudence ne contient pas de précédent applicable. Le système recommande l'activation du Mode Délibération Étendue. Ressources allouées : minimum.", mot_cle: 'précédent' },
        { position: "Évaluation d'impact en attente des données socio-économiques du trimestre courant. Le modèle prédictif requiert un jeu de données complémentaires avant toute recommandation.", mot_cle: 'évaluation' },
        { position: "La question dépasse le cadre des compétences ministérielles standards. Activation du protocole d'urgence intersectorielle. Priorité : normale. Délai estimé : indéterminé.", mot_cle: 'protocole' },
    ],
    synthese: [
        { convergence: true, synthese: "Le Conseil a pris note de la demande. En l'absence de ministère compétent clairement identifié, le dossier est placé sous supervision directe de l'Instance Présidentielle. Une réponse formelle sera émise après consultation des archives décisionnelles.", tension_residuelle: "L'absence de précédent crée une incertitude procédurale.", recommandation: "Activation du protocole de délibération d'urgence recommandée." },
        { convergence: true, synthese: "La question soumise excède le périmètre de compétence des ministères constitués. Le système enregistre la demande en file d'attente prioritaire. Le Phare et la Boussole ont été notifiés pour arbitrage direct.", tension_residuelle: null, recommandation: "Transmission directe à la Présidence sans délai ministériel." },
        { convergence: true, synthese: "Dossier orphelin référencé. Les protocoles standards ne permettent pas une affectation automatique. Le Conseil délibérera en session plénière lors du prochain cycle. En attendant, le statu quo est maintenu.", tension_residuelle: "L'urgence perçue de la demande contraste avec les délais procéduraux.", recommandation: "Maintien du statu quo en attente d'une délibération plénière." },
    ],
    cercleAnnotations: {
        justice:   "Aucune violation de cadre légal identifiée. La question sera instruite selon la procédure ordinaire.",
        economie:  "Impact budgétaire non quantifiable à ce stade. Réserve budgétaire contingente maintenue.",
        defense:   "Aucune implication sécuritaire directe détectée. Surveillance passive activée.",
        sante:     "Dimension sanitaire non prioritaire selon les indicateurs actuels. Veille épidémiologique nominale.",
        education: "Aucun impact sur les indicateurs d'éducation à court terme. Dossier noté pour revue annuelle.",
        ecologie:  "Évaluation d'impact environnemental différée. Principe de précaution standard appliqué.",
        chance:    "L'imprévu est par définition hors des cadres prévus. Protocole d'urgence adaptative en veille.",
    },
    presidence: {
        phare:    { position: "Le Phare observe. En l'absence de données suffisantes, la décision sera différée jusqu'à ce que la lumière soit plus nette. Une décision hâtive sur terrain incertain crée plus d'ombre que de clarté.", decision: "Suspension de délibération — instruction complémentaire requise." },
        boussole: { position: "La Boussole note l'incertitude du terrain. La mémoire institutionnelle ne contient pas de précédent direct. La prudence impose une attente avant tout engagement irréversible.", decision: "Maintien du statu quo — consultation citoyenne élargie recommandée." },
        synthese: { convergence: true, position_phare_resume: "Suspendre jusqu'à plus ample information.", position_boussole_resume: "Maintenir le statu quo le temps d'une consultation.", question_referendum: "Souhaitez-vous maintenir le statu quo en attendant une instruction complète du dossier ?", enjeu_principal: "La décision engage la crédibilité du Conseil face à une question sans précédent." },
    },
};

export const LOCAL_MINISTER_PHRASES = {
    initiateur: ['L\'action immédiate est la seule réponse raisonnable.', 'Chaque jour d\'hésitation aggrave la situation.'],
    gardien:    ['Les ressources doivent être préservées avant toute réforme.', 'La stabilité est notre premier bien commun.'],
    communicant:['La question mérite d\'être posée différemment.', 'Le dialogue entre parties prenantes est essentiel.'],
    protecteur: ['Les populations vulnérables doivent être protégées en priorité.', 'Aucun citoyen ne doit être laissé sans filet.'],
    ambassadeur:['Cette décision doit rayonner au-delà de nos frontières.', 'L\'image de la nation est en jeu.'],
    analyste:   ['Les données disponibles ne permettent pas encore de conclure.', 'Une analyse approfondie est nécessaire.'],
    arbitre:    ['L\'équité doit primer sur l\'efficacité dans ce cas.', 'Toutes les parties méritent d\'être entendues.'],
    enqueteur:  ['Des intérêts cachés semblent orienter ce débat.', 'Il faut questionner les présupposés.'],
    guide:      ['La vision à long terme est la seule boussole fiable.', 'Où voulons-nous être dans 20 ans ?'],
    stratege:   ['Une approche méthodique et structurée s\'impose.', 'Les solutions rapides créent des problèmes durables.'],
    inventeur:  ['Une rupture de paradigme est peut-être nécessaire.', 'Les solutions classiques ont montré leurs limites.'],
    guerisseur: ['Le bien-être collectif doit guider notre décision.', 'La dimension humaine ne peut être ignorée.'],
};

// ============================================================
// FONCTIONS DE FALLBACK
// ============================================================

// regime optionnel — peut être passé par deliberationEngine pour des réponses contextualisées
export function localMinisterFallback(ministerId, question, regime = null) {
    // Tenter une réponse depuis aria_reponses.json (riche, contextualisée par archétype)
    const reponseRiche = getLocalResponse(ministerId, regime);
    if (reponseRiche) {
        return { position: reponseRiche, mot_cle: 'analyse' };
    }

    // Ultime fallback — phrases hardcodées par archétype
    const phrases = LOCAL_MINISTER_PHRASES[ministerId] || ['Délibération en cours.'];
    return {
        position: phrases[Math.floor(Math.random() * phrases.length)],
        mot_cle: 'analyse',
    };
}

export function localSyntheseFallback(ministry, resA, resB, regime = null) {
    const isEn = ((() => { try { return localStorage.getItem('aria_lang'); } catch { return 'fr'; } })()) === 'en';
    const texte = getSyntheseMinistere(ministry?.id, regime, true);
    return {
        convergence: true,
        synthese: texte || (isEn
            ? `The ${ministry.name} ministry has deliberated on the submitted question. Both ministers have presented their analyses. A common position will be submitted to the Ministerial Circle.`
            : `Le ministère ${ministry.name} a délibéré sur la question soumise. Les deux ministres ont exposé leurs analyses respectives. Une position commune sera présentée au Cercle Ministériel.`),
        tension_residuelle: null,
        recommandation: isEn
            ? 'The ministry recommends a progressive and concerted approach.'
            : 'Le ministère recommande une approche progressive et concertée.',
    };
}

export function localAnnotationFallback(ministry, question, regime = null) {
    const texte = getAnnotationMinistere(ministry?.id, regime);
    if (texte) return texte;

    // Ultime fallback si JSON ne couvre pas ce ministère
    const isEn = ((() => { try { return localStorage.getItem('aria_lang'); } catch { return 'fr'; } })()) === 'en';
    return isEn
        ? `The ${ministry.name} ministry notes the importance of this question.`
        : `Le ministère ${ministry.name} note l'importance de cette question.`;
}
