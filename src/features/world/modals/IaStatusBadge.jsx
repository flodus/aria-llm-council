// src/features/world/modals/IaStatusBadge.jsx
import { useState, useEffect, useRef } from 'react';
import { FONT } from '../../../shared/theme';
import { loadLang } from '../../../ariaI18n';
import { getIaStatus } from '../../../shared/services/iaStatusStore';

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

export function IaStatusBadge({ status }) {
  if (!status) return null;
  const lang = loadLang();
  const isOffline = status === 'offline';
  const color     = isOffline ? 'rgba(220,60,60,0.90)' : 'rgba(220,160,40,0.90)';
  const border    = isOffline ? 'rgba(220,60,60,0.35)' : 'rgba(220,160,40,0.35)';
  const label     = isOffline
    ? (lang === 'en' ? '🔴 AI OFFLINE — BOARD GAME MODE' : '🔴 IA HORS-LIGNE — MODE BOARD GAME')
    : (lang === 'en' ? '⚠ QUOTA EXCEEDED — BOARD GAME MODE' : '⚠ QUOTA DÉPASSÉ — MODE BOARD GAME');

  return (
    <div style={{
      position: 'fixed', bottom: '1.4rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9000, pointerEvents: 'none',
      background: 'rgba(4,8,18,0.88)', border: `1px solid ${border}`,
      borderRadius: '3px', padding: '0.3rem 0.9rem',
      fontFamily: FONT.mono, fontSize: '0.40rem', letterSpacing: '0.10em',
      color, boxShadow: `0 0 14px ${border}`,
      animation: 'fadeSlideInBadge 0.3s ease both',
    }}>
      {label}
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
