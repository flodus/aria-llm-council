// src/shared/services/llm/aiService.js
// Moteur IA : callModel, callAI, prompts, clés API, validation

import { getOptions } from '../../config/options';
import { LOCAL_EVENTS, LOCAL_DELIBERATION, LOCAL_DELIBERATION_EN } from '../../data/ariaData';
import { loadLang, FALLBACK_PHRASES } from '../../../ariaI18n';
import { setIaStatus } from '../iaStatusStore';
import { getPrompts } from '../../../features/settings/utils/settingsStorage';
import { DEFAULT_MODELS } from '../../constants/models';
import { loadCustomProviders, loadKeys, loadPreferredModels } from '../storage';

// ── Validation clés ───────────────────────────────────────────────────────────

const KEY_FORMAT = {
  claude:     k => k.startsWith('sk-ant-') && k.length >= 20,
  gemini:     k => k.startsWith('AIza') && k.length >= 15,
  grok:       k => k.startsWith('xai-') && k.length >= 15,
  openai:     k => k.startsWith('sk-') && !k.startsWith('sk-ant-') && !k.startsWith('sk-or-') && k.length >= 15,
  openrouter: k => k.startsWith('sk-or-') && k.length >= 15,
};
const FAKE_PATTERNS = ['-test', '-fake', '-debug', '-demo', '-mock'];

export function isValidKeyFormat(provider, key) {
  const k = (key || '').trim();
  return !!(KEY_FORMAT[provider]?.(k));
}

export function isFakeKey(provider, key) {
  const k = (key || '').trim();
  if (!isValidKeyFormat(provider, k)) return false;
  return FAKE_PATTERNS.some(p => k.toLowerCase().includes(p));
}

/** Récupère les clés API (défaut/active) depuis localStorage */
export function getApiKeys() {
  try {
    const raw = loadKeys();
    const result = {};
    for (const [id, val] of Object.entries(raw)) {
      if (typeof val === 'string') result[id] = val;
      else if (Array.isArray(val) && val.length > 0) {
        const def = val.find(k => k.default) || val[0];
        result[id] = def?.key || '';
      }
    }
    return result;
  } catch { return {}; }
}

// Retourne les clés d'un provider ordonnées (default en premier)
function getProviderKeys(provider) {
  try {
    const raw = loadKeys();
    const val = raw[provider];
    if (!val) return [];
    if (typeof val === 'string') return val.trim() ? [{ key: val.trim(), model: null }] : [];
    if (Array.isArray(val)) {
      const valid = val.filter(k => k.key?.trim());
      return [...valid.filter(k => k.default), ...valid.filter(k => !k.default)];
    }
    return [];
  } catch { return []; }
}

// ── Prompts ───────────────────────────────────────────────────────────────────

/** Construit le prompt IA de création d'un pays */
export function buildCountryPrompt(type, nomDemande = '') {
  const isReal = type === 'reel' && nomDemande;

  const contextBlock = isReal
    ? `CONSIGNE — PAYS RÉEL :
Le joueur a demandé "${nomDemande}".
Génère son portrait ARIA basé sur tes connaissances actuelles :
- Régime politique actuel, dirigeant en fonction, situation économique réelle.
- Satisfaction populaire estimée selon la situation politique du moment.
- Terrain cohérent avec la géographie (coastal si accès mer, island si île...).
- Ressources naturelles dominantes réelles.
- Coefficients ministériels reflétant les priorités politiques actuelles.`
    : `CONSIGNE — PAYS FICTIF :
Crée un pays fictif crédible et original. Invente un nom, une histoire, une identité propre.`;

  return `Tu es un générateur de données géopolitiques pour le jeu de simulation ARIA.
${contextBlock}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires, sans texte avant ou après.
{
  "nom": "${isReal ? nomDemande : 'string — nom inventé, original'}",
  "emoji": "un seul emoji représentatif",
  "couleur": "#RRGGBB — couleur sombre et saturée, visible sur fond noir",
  "regime": "une valeur parmi : democratie_liberale | republique_federale | monarchie_constitutionnelle | monarchie_absolue | technocratie_ia | oligarchie | junte_militaire | regime_autoritaire | theocratie | communisme | nationalisme_autoritaire",
  "terrain": "une valeur parmi : coastal | inland | island | archipelago | highland",
  "description": "une phrase de 15-25 mots, ton journalistique, situation actuelle",
  "leader": {
    "nom": "prénom et nom ${isReal ? '(dirigeant actuel si connu)' : 'inventé'}",
    "titre": "titre officiel exact",
    "trait": "une phrase sur sa philosophie ou style de gouvernance"
  },
  "population": "entier — réaliste pour ce pays",
  "tauxNatalite": "float entre 6.0 et 40.0 — réaliste",
  "tauxMortalite": "float entre 3.0 et 20.0 — réaliste",
  "satisfaction": "entier 15-85 — cohérent avec la situation politique actuelle",
  "aria_acceptance": "entier 10-90 — probabilité d'acceptation d'un gouvernement IA délibératif par la population",
  "ressources": {
    "agriculture": "0 ou 1", "bois": "0 ou 1", "eau": "0 ou 1",
    "energie": "0 ou 1", "mineraux": "0 ou 1", "peche": "0 ou 1", "petrole": "0 ou 1"
  },
  "coefficients": {
    "justice": "float 0.6-1.5", "economie": "float 0.6-1.5", "defense": "float 0.6-1.5",
    "sante": "float 0.6-1.5", "education": "float 0.6-1.5", "ecologie": "float 0.6-1.5"
  }
}`;
}

/** Construit le prompt IA d'un événement narratif */
export function buildEventPrompt(trigger) {
  const { type, pays } = trigger;

  const contexts = {
    revolte: `Le pays "${pays.nom}" (${pays.regimeName}) est au bord de la révolte. Satisfaction à ${pays.satisfaction}%, population ${(pays.population / 1_000_000).toFixed(1)} M, année ${pays.annee}.`,
    demo_explosion: `Le pays "${pays.nom}" connaît une explosion démographique incontrôlée. Population passée de ${(pays.population * 0.5 / 1_000_000).toFixed(1)} M à ${(pays.population / 1_000_000).toFixed(1)} M en 5 ans.`,
    alliance_rompue: `L'alliance entre "${pays.nom}" et "${trigger.avec}" vient d'être rompue. Tensions diplomatiques maximales.`,
    secession: `La sécession de "${pays.nom}" depuis "${trigger.parent}" vient d'être validée. Une nouvelle entité politique naît.`,
  };

  return `Tu es l'IA de Gouvernance ARIA. Tu analyses les crises géopolitiques avec froideur et précision.

Situation : ${contexts[type] || `Événement critique dans le pays "${pays.nom}".`}

Génère une notification d'analyse en JSON :
{
  "titre": "4 à 6 mots, factuel et percutant",
  "texte": "exactement 2 phrases. Ton analytique, style rapport ARIA. Pas d'émotion, que des faits et des implications.",
  "severite": "une valeur parmi : info | warning | critical",
  "impact": { "satisfaction": "entier entre -15 et 5", "popularite": "entier entre -10 et 5" }
}`;
}

// ── Fallbacks ─────────────────────────────────────────────────────────────────
// FALLBACK_PHRASES importé depuis ariaI18n.js
const getRandomFallback = () => {
  const phrases = FALLBACK_PHRASES[loadLang()] || FALLBACK_PHRASES.fr;
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// Pioche une réponse locale (mode hors-ligne)
function getLocalResponse(type, context = {}) {
  const { ministerKey, ministryKey, role, situation = 'cycle_normal' } = context;
  const DELIB = loadLang() === 'en' ? LOCAL_DELIBERATION_EN : LOCAL_DELIBERATION;
  const silenceMsg = loadLang() === 'en' ? 'ARIA: Council radio silence.' : 'ARIA : Silence radio du Conseil.';
  let pool = [];

  if (type === 'ministre' && ministerKey)
    pool = DELIB.ministers?.[ministerKey]?.[situation] || [];
  else if (type === 'synthese_ministere' && ministryKey)
    pool = DELIB.ministries?.[ministryKey]?.[situation] || [];
  else if ((type === 'phare' || type === 'boussole') && role)
    pool = DELIB.presidency?.[role]?.[situation] || [];
  else if (type === 'synthese_presidence')
    pool = DELIB.presidency?.synthese?.[context.convergence ? 'convergence' : 'divergence'] || [];
  else if (type === 'evenement' && context.trigger)
    pool = LOCAL_EVENTS?.[context.trigger] || [];

  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : silenceMsg;
}

// ── callModel ─────────────────────────────────────────────────────────────────

async function callModel(model, prompt, keys, systemPrompt = '') {
  const hasKey = (p) => {
    const v = keys[p];
    return !!(v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.some(k => k.key?.trim()) : false));
  };
  const customProvIds = loadCustomProviders().filter(p => p.endpoint?.trim()).map(p => p.id);
  const KEY_PRIORITY = [...customProvIds, 'openrouter', 'gemini', 'claude', 'grok', 'openai'];
  if (!hasKey(model) && !customProvIds.includes(model)) model = KEY_PRIORITY.find(p => hasKey(p) || customProvIds.includes(p)) || model;

  const fullContent = systemPrompt
    ? `${systemPrompt}\n\n---\n\nDONNÉES À TRAITER :\n${prompt}`
    : prompt;

  if (model === 'claude') {
    const claudeKeys = getProviderKeys('claude');
    const prefModel = loadPreferredModels().claude || DEFAULT_MODELS.claude;
    for (const keyEntry of claudeKeys) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': keyEntry.key,
            'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
          body: JSON.stringify({ model: keyEntry.model || prefModel, max_tokens: 1000,
            messages: [{ role: 'user', content: fullContent }] }),
        });
        if (res.status === 429) { console.warn('[ARIA] Claude 429 — tentative clé suivante'); continue; }
        const data = await res.json();
        const text = data?.content?.[0]?.text || '';
        return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) {
        console.warn('[ARIA] Claude error:', e.message);
        if (claudeKeys.indexOf(keyEntry) < claudeKeys.length - 1) continue;
      }
    }
    return { error: true, msg: getRandomFallback() };
  }

  if (model === 'gemini') {
    const geminiKeys = getProviderKeys('gemini');
    const prefModel = loadPreferredModels().gemini || null;
    for (const keyEntry of geminiKeys) {
      const GEMINI_MODELS = [keyEntry.model || prefModel, DEFAULT_MODELS.gemini, 'gemini-1.5-flash', 'gemini-1.5-pro'].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
      let lastWas429 = false;
      for (const gModel of GEMINI_MODELS) {
        if (lastWas429) await new Promise(r => setTimeout(r, 1500));
        lastWas429 = false;
        let attempt = 0;
        while (attempt <= 2) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${keyEntry.key}`,
              { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: fullContent }] }],
                  generationConfig: { temperature: 0.8, maxOutputTokens: 1000 } }) }
            );
            if (!res.ok) {
              if (res.status === 429) {
                lastWas429 = true;
                if (attempt < 2) { await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt))); attempt++; continue; }
                break;
              }
              break;
            }
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return JSON.parse(text.replace(/```json|```/g, '').trim());
          } catch (e) { console.warn(`[ARIA] Gemini ${gModel} error:`, e.message); break; }
        }
      }
      console.warn('[ARIA] Gemini: modèles épuisés pour cette clé — tentative clé suivante');
    }
    const claudeKeys = getProviderKeys('claude');
    if (claudeKeys.length > 0) { console.warn('[ARIA] Gemini épuisé — fallback Claude'); return callModel('claude', prompt, keys, systemPrompt); }
    return { error: true, code: 429, msg: '⚠ Quota Gemini dépassé — tous les modèles épuisés.' };
  }

  if (model === 'grok') {
    const grokKeys = getProviderKeys('grok');
    const prefModel = loadPreferredModels().grok || DEFAULT_MODELS.grok;
    for (const keyEntry of grokKeys) {
      if (isFakeKey('grok', keyEntry.key)) return { error: true, msg: getRandomFallback() };
      if (!isValidKeyFormat('grok', keyEntry.key)) continue;
      try {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyEntry.key}` },
          body: JSON.stringify({ model: keyEntry.model || prefModel, max_tokens: 1000,
            messages: [{ role: 'user', content: fullContent }] }),
        });
        if (res.status === 429) { console.warn('[ARIA] Grok 429 — tentative clé suivante'); continue; }
        if (!res.ok) { console.warn('[ARIA] Grok erreur HTTP', res.status); continue; }
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || '';
        return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) { console.warn('[ARIA] Grok error:', e.message); continue; }
    }
    return { error: true, msg: getRandomFallback() };
  }

  if (model === 'openai') {
    const openaiKeys = getProviderKeys('openai');
    const prefModel = loadPreferredModels().openai || DEFAULT_MODELS.openai;
    for (const keyEntry of openaiKeys) {
      if (isFakeKey('openai', keyEntry.key)) return { error: true, msg: getRandomFallback() };
      if (!isValidKeyFormat('openai', keyEntry.key)) continue;
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyEntry.key}` },
          body: JSON.stringify({ model: keyEntry.model || prefModel, max_tokens: 1000,
            messages: [{ role: 'user', content: fullContent }] }),
        });
        if (res.status === 429) { console.warn('[ARIA] OpenAI 429 — tentative clé suivante'); continue; }
        if (!res.ok) { console.warn('[ARIA] OpenAI erreur HTTP', res.status); continue; }
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || '';
        return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) { console.warn('[ARIA] OpenAI error:', e.message); continue; }
    }
    return { error: true, msg: getRandomFallback() };
  }

  if (model === 'openrouter') {
    const orKeys = getProviderKeys('openrouter');
    const prefModel = loadPreferredModels().openrouter || DEFAULT_MODELS.openrouter;
    for (const keyEntry of orKeys) {
      if (isFakeKey('openrouter', keyEntry.key)) return { error: true, msg: getRandomFallback() };
      if (!isValidKeyFormat('openrouter', keyEntry.key)) continue;
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyEntry.key}`,
            'HTTP-Referer': 'https://flodus.github.io/aria-llm-council/', 'X-Title': 'ARIA' },
          body: JSON.stringify({ model: keyEntry.model || prefModel, max_tokens: 1000,
            messages: [{ role: 'user', content: fullContent }] }),
        });
        if (res.status === 429) { console.warn('[ARIA] OpenRouter 429 — tentative clé suivante'); continue; }
        if (!res.ok) { console.warn('[ARIA] OpenRouter erreur HTTP', res.status); continue; }
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || '';
        return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) { console.warn('[ARIA] OpenRouter error:', e.message); continue; }
    }
    return { error: true, msg: getRandomFallback() };
  }

  // ── Providers custom (OpenAI-compatible) ─────────────────────────────────
  const customProvs = loadCustomProviders();
  const customProv = customProvs.find(p => p.id === model);
  if (customProv) {
    const { endpoint, key, model: customModel } = customProv;
    if (!endpoint) return { error: true, msg: 'SYSTÈME : Endpoint manquant pour ce provider custom.' };
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (key?.trim()) headers['Authorization'] = `Bearer ${key.trim()}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: customModel || 'default', max_tokens: 1000,
          messages: [{ role: 'user', content: fullContent }] }),
      });
      if (!res.ok) { console.warn('[ARIA] Custom provider erreur HTTP', res.status); return { error: true, msg: getRandomFallback() }; }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.warn('[ARIA] Custom provider error:', e.message);
      return { error: true, msg: getRandomFallback() };
    }
  }

  return { error: true, msg: 'SYSTÈME : Aucune clé API valide détectée.' };
}

// ── callAI — point d'entrée unique ───────────────────────────────────────────

export async function callAI(prompt, type = 'standard', context = {}) {
  const opts       = getOptions();
  const promptsSys = getPrompts();
  const keys       = opts.api_keys;
  const roles      = opts.ia_roles;
  const hasKeyForProv = (v) => !!(v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.some(k => k.key?.trim()) : false));
  const customProviders = loadCustomProviders();
  const hasCustomProvider = customProviders.some(p => p.endpoint?.trim());
  const hasKeys = hasKeyForProv(keys.claude) || hasKeyForProv(keys.gemini) || hasKeyForProv(keys.grok) || hasKeyForProv(keys.openai) || hasKeyForProv(keys.openrouter) || hasCustomProvider;

  if (!hasKeys || opts.force_local || opts.ia_mode === 'none') {
    return getLocalResponse(type, context);
  }

  const _track = async (promise) => {
    try {
      const result = await promise;
      if (result?.error) {
        setIaStatus(result.code === 429 ? 'quota' : (!navigator.onLine ? 'offline' : 'quota'));
      } else if (result !== null && result !== undefined) {
        setIaStatus(null);
      }
      return result;
    } catch {
      setIaStatus(!navigator.onLine ? 'offline' : 'quota');
      return null;
    }
  };

  switch (type) {
    case 'ministre':           return _track(callModel(roles.ministre_model  || 'claude', prompt, keys));
    case 'synthese_ministere': return _track(callModel(roles.synthese_min    || 'gemini', prompt, keys, promptsSys.synthese_ministere));
    case 'phare':              return _track(callModel(roles.phare_model      || 'claude', prompt, keys));
    case 'boussole':           return _track(callModel(roles.boussole_model   || 'claude', prompt, keys));
    case 'synthese_presidence':return _track(callModel(roles.synthese_pres   || 'gemini', prompt, keys, promptsSys.synthese_presidence));
    case 'evenement':          return _track(callModel(roles.evenement_model  || 'claude', prompt, keys));
    case 'factcheck':          return _track(callModel(roles.factcheck_model  || 'gemini', prompt, keys, promptsSys.factcheck_evenement));
    case 'pays':               return _track(callModel(opts.solo_model        || 'claude', prompt, keys));
    default:                   return _track(callModel(opts.solo_model        || 'claude', prompt, keys));
  }
}
