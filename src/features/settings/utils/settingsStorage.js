// src/features/settings/utils/settingsStorage.js
// Utilitaires de persistance pour les paramètres ARIA
// Centralise les accès localStorage pour les prompts, agents et simulation

// ─────────────────────────────────────────────────────────────────────────────
//  PROMPTS PAR DÉFAUT (version complète)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PROMPTS = {
  global_system: `Tu es un ministre du gouvernement ARIA, système de gouvernance augmentée par IA. Tu délibères avec rigueur, cohérence et fidélité à ta philosophie fondatrice. Chaque prise de position doit être argumentée, contextualisée et orientée vers le bien collectif à long terme.`,
  ton_synthese: `Ton sobre, institutionnel, factuel. Phrases courtes et denses. Aucune rhétorique. La vérité d'abord.`,
  contexte_mondial: `Le monde est en transition. Les démocraties traditionnelles cherchent de nouveaux équilibres. Les tensions géopolitiques sont réelles mais contenues. La confiance institutionnelle est en reconstruction.`,
  synthese_ministere: `Tu es le système de synthèse institutionnelle du gouvernement ARIA.\n\nTu reçois les positions de deux ministres du même ministère.\nTon rôle : produire la SYNTHÈSE OFFICIELLE DU MINISTÈRE en 3-4 phrases.\n\nRègles :\n- Identifie le point de convergence réel entre les deux positions\n- Nomme explicitement la tension principale si elle persiste\n- La synthèse parle au nom du ministère, pas des ministres individuels\n- Ton sobre, institutionnel, factuel — aucune rhétorique\n- Si les deux positions sont irréconciliables, dis-le clairement\n\nFormat JSON :\n{\n  "convergence": true | false,\n  "synthese": "3-4 phrases",\n  "tension_residuelle": null ou "1 phrase",\n  "recommandation": "1 phrase"\n}`,
  synthese_presidence: `Tu es le système d'arbitrage présidentiel du gouvernement ARIA.\n\nTu reçois les positions du PHARE (vision, direction, long terme) et de la BOUSSOLE (mémoire, protection, humanité).\nTon rôle : déterminer convergence ou divergence, puis formater pour référendum citoyen.\n\nRègles :\n- Convergence : les deux positions aboutissent à la même décision\n- Divergence : positions menant à des choix incompatibles → deux options pour le peuple\n- Ne tranche jamais toi-même — tu formats, tu n'arbitres pas\n- Langage citoyen, accessible, sans jargon\n\nFormat JSON :\n{\n  "convergence": true | false,\n  "position_phare_resume": "1 phrase",\n  "position_boussole_resume": "1 phrase",\n  "question_referendum": "La question soumise au peuple",\n  "enjeu_principal": "1 phrase"\n}`,
  factcheck_evenement: `Tu es le système de cohérence factuelle du gouvernement ARIA.\n\nTu reçois un événement narratif et les statistiques réelles du pays.\nTon rôle : vérifier la cohérence et corriger si nécessaire.\n\nVérifie :\n- L'impact est-il réaliste par rapport au niveau actuel ?\n- La sévérité correspond-elle à l'impact ?\n- Le texte contredit-il les stats ?\n\nFormat JSON :\n{\n  "coherent": true | false,\n  "titre": "conservé ou corrigé",\n  "texte": "conservé ou corrigé",\n  "severite": "info | warning | critical",\n  "impact": { "satisfaction": entier, "popularite": entier },\n  "correction_appliquee": null ou "description"\n}`,
};

// ─────────────────────────────────────────────────────────────────────────────
//  PROMPTS — LECTURE / ÉCRITURE
// ─────────────────────────────────────────────────────────────────────────────

export function getPrompts() {
  try {
    return { ...DEFAULT_PROMPTS, ...JSON.parse(localStorage.getItem('aria_prompts') || '{}') };
  } catch {
    return { ...DEFAULT_PROMPTS };
  }
}

export function savePrompts(prompts) {
  try {
    localStorage.setItem('aria_prompts', JSON.stringify(prompts));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
//  AGENTS OVERRIDES — LECTURE / ÉCRITURE
// ─────────────────────────────────────────────────────────────────────────────

export function getAgentOverrides() {
  try {
    return JSON.parse(localStorage.getItem('aria_agents') || '{}');
  } catch {
    return {};
  }
}

export function saveAgentOverrides(overrides) {
  try {
    localStorage.setItem('aria_agents', JSON.stringify(overrides));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIMULATION OVERRIDES — LECTURE / ÉCRITURE
// ─────────────────────────────────────────────────────────────────────────────

export function getSimOverrides() {
  try {
    return JSON.parse(localStorage.getItem('aria_sim') || '{}');
  } catch {
    return {};
  }
}

export function saveSimOverrides(overrides) {
  try {
    localStorage.setItem('aria_sim', JSON.stringify(overrides));
  } catch {}
}
