// src/shared/utils/agentsOverrides.js
// Surcharges emoji/symbole sur les agents ARIA (ministres, ministères, présidents)
// getAgentsEffectifs() = getAgents() + overrides depuis aria_emoji_overrides

import { getAgents } from '../../Dashboard_p1';
import { lireStorage, ecrireStorage } from './storage';

const CLE = 'aria_emoji_overrides';

// Structure stockée : { ministers: {id: emoji}, ministries: {id: emoji}, presidency: {id: emoji} }
export function getEmojiOverrides() {
  return lireStorage(CLE, { ministers: {}, ministries: {}, presidency: {} });
}

// Sauvegarde un emoji pour un agent
// categorie : 'ministers' | 'ministries' | 'presidency'
// id        : clé de l'agent (ex: 'initiateur', 'economie', 'phare')
// emoji     : string
export function sauvegarderEmojiAgent(categorie, id, emoji) {
  const ov = getEmojiOverrides();
  if (!ov[categorie]) ov[categorie] = {};
  ov[categorie][id] = emoji;
  ecrireStorage(CLE, ov);
}

// Retourne les agents avec emojis overridés
// emojiLocaux : { ministers, ministries, presidency } — surcharges par pays (ConstitutionModal)
//              écrasent les surcharges globales qui écrasent les valeurs de base
export function getAgentsEffectifs(emojiLocaux = null) {
  const base    = getAgents();
  const global  = getEmojiOverrides();

  // Merge des overrides : local > global > base
  const minOv  = { ...(global.ministers  || {}), ...(emojiLocaux?.ministers  || {}) };
  const minsOv = { ...(global.ministries || {}), ...(emojiLocaux?.ministries || {}) };
  const presOv = { ...(global.presidency  || {}), ...(emojiLocaux?.presidency  || {}) };

  // Ministres
  const ministers = Object.fromEntries(
    Object.entries(base.ministers || {}).map(([id, m]) => [
      id, minOv[id] ? { ...m, emoji: minOv[id] } : m
    ])
  );

  // Ministères (tableau ou objet selon la langue)
  const ministriesBase = Array.isArray(base.ministries)
    ? base.ministries
    : Object.values(base.ministries || {});
  const ministries = ministriesBase.map(m =>
    minsOv[m.id] ? { ...m, emoji: minsOv[m.id] } : m
  );

  // Présidence
  const presidency = Object.fromEntries(
    Object.entries(base.presidency || {}).map(([id, p]) => [
      id, presOv[id] ? { ...p, emoji: presOv[id], symbol: presOv[id] } : p
    ])
  );

  return { ...base, ministers, ministries, presidency };
}
