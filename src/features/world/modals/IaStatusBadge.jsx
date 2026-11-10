// src/features/world/modals/IaStatusBadge.jsx
import { useState, useEffect, useRef } from 'react';
import { FONT } from '../../../shared/theme';
import { loadLang } from '../../../ariaI18n';
import { getIaStatus, getEtatsFournisseurs, reinitialiserEtats } from '../../../shared/services/iaStatusStore';
import { getOptions, saveOptions } from '../../../shared/config/options';

// ── Statut IA — badge persistant + toast reconnexion ─────────────────────────
export function useIaStatus(pushNotif) {
  const [iaStatus, setLocal] = useState(() => getIaStatus());
  const prevRef = useRef(iaStatus);
  const lang = loadLang();

  useEffect(() => {
    const handler = (e) => {
      const next = e.detail.status;
      const prev = prevRef.current;
      prevRef.current = next;
      setLocal(next);
      // Toast au retour de l'IA
      if (prev !== null && next === null) {
        pushNotif?.(
          lang === 'en' ? '✅ AI reconnected — Board Game mode disabled' : '✅ IA reconnectée — mode Board Game désactivé',
          'ok', 4000
        );
      }
    };
    window.addEventListener('aria:ia-status', handler);
    return () => window.removeEventListener('aria:ia-status', handler);
  }, [pushNotif, lang]);

  return iaStatus;
}

const NOMS_FOURNISSEURS = {
  claude: 'Claude', gemini: 'Gemini', grok: 'Grok', openai: 'OpenAI',
  openrouter: 'OpenRouter', 'personnalisé': 'Fournisseur personnalisé',
};
const RAISONS = {
  fr: { quota: 'quota dépassé', cle: 'clé refusée ou invalide', modele: 'modèle indisponible',
        panne: 'panne du fournisseur', reseau: 'hors connexion', erreur: 'erreur' },
  en: { quota: 'quota exceeded', cle: 'key refused or invalid', modele: 'model unavailable',
        panne: 'provider outage', reseau: 'offline', erreur: 'error' },
};

export function IaStatusBadge({ status }) {
  const lang = loadLang();
  const [etats, setEtats] = useState(() => getEtatsFournisseurs());

  useEffect(() => {
    const handler = (e) => setEtats(e.detail.etats || {});
    window.addEventListener('aria:ia-status', handler);
    return () => window.removeEventListener('aria:ia-status', handler);
  }, []);

  if (!status || Object.keys(etats).length === 0) return null;

  const textes = RAISONS[lang === 'en' ? 'en' : 'fr'];
  const passerBoardGame = () => {
    saveOptions({ ...getOptions(), ia_mode: 'none' });
    reinitialiserEtats();
  };

  return (
    <div style={{
      position: 'fixed', bottom: '1.4rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9000, width: 'min(520px, 92vw)',
      background: 'rgba(4,8,18,0.94)', border: '1px solid rgba(220,160,40,0.45)',
      borderRadius: '3px', padding: '0.8rem 1rem',
      fontFamily: FONT.mono, fontSize: '0.5rem', letterSpacing: '0.06em', lineHeight: 1.6,
      color: 'rgba(230,200,140,0.95)', boxShadow: '0 0 18px rgba(220,160,40,0.2)',
    }}>
      <div style={{ letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
        {lang === 'en' ? '⚠ AI PROVIDER UNAVAILABLE' : '⚠ FOURNISSEUR IA INDISPONIBLE'}
      </div>
      {Object.entries(etats).map(([fournisseur, etat]) => (
        <div key={fournisseur}>
          {NOMS_FOURNISSEURS[fournisseur] || fournisseur} : {textes[etat.raison] || textes.erreur}
          {etat.code ? ` (HTTP ${etat.code})` : ''}
          {etat.basculeVers ? (lang === 'en'
            ? ` → answers given by ${NOMS_FOURNISSEURS[etat.basculeVers]} instead`
            : ` → réponses données par ${NOMS_FOURNISSEURS[etat.basculeVers]} à la place`) : ''}
        </div>
      ))}
      <div style={{ margin: '0.5rem 0', color: 'rgba(200,190,160,0.8)' }}>
        {Object.values(etats).some(e => e.basculeVers)
          ? (lang === 'en'
            ? 'The council continues with the backup provider. Board Game mode works without AI.'
            : 'Le conseil continue avec le fournisseur de secours. Le mode Board Game fonctionne sans IA.')
          : (lang === 'en'
            ? 'The council cannot deliberate with this provider. Board Game mode works without AI.'
            : 'Le conseil ne peut plus délibérer avec ce fournisseur. Le mode Board Game fonctionne sans IA.')}
      </div>
      <button type="button" onClick={passerBoardGame} style={{
        background: 'rgba(220,160,40,0.12)', border: '1px solid rgba(220,160,40,0.6)',
        color: 'rgba(240,210,150,0.95)', padding: '0.4rem 0.8rem', cursor: 'pointer',
        fontFamily: FONT.mono, fontSize: '0.5rem', letterSpacing: '0.1em',
      }}>
        {lang === 'en' ? 'SWITCH TO BOARD GAME →' : 'PASSER EN MODE BOARD GAME →'}
      </button>
    </div>
  );
}

export function Toast({ notification }) {
  if (!notification) return null;
  const colors = {
    ok:   'rgba(58,191,122,0.85)',
    warn: 'rgba(200,120,48,0.85)',
    info: 'rgba(74,126,200,0.85)',
    err:  'rgba(200,58,58,0.85)',
  };
  return (
    <div style={{
      position: 'absolute', bottom: '1.2rem', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(8,14,26,0.94)',
      border: `1px solid ${colors[notification.type] || colors.info}`,
      borderRadius: '2px',
      padding: '0.45rem 1rem',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.52rem', letterSpacing: '0.09em',
      color: colors[notification.type] || colors.info,
      zIndex: 800, pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: `0 0 20px ${colors[notification.type] || colors.info}33`,
    }}>
      {notification.message}
    </div>
  );
}
