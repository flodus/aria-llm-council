// src/App.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  App.jsx — Shell principal ARIA
//  Routing, états globaux, topbar.
//  Tous les composants UI sont dans leurs propres fichiers.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BASE_AGENTS    from '../templates/languages/fr/governance.json';
import BASE_AGENTS_EN from '../templates/languages/en/governance.json';
import './App.css';

import Dashboard        from './features/world/Dashboard';
import Settings         from './features/settings';
import InitScreen       from './features/init/InitScreen';
import CountryPanel from './features/world/components/CountryPanel/CountryPanel';
import EmptyPanel from './features/world/components/CountryPanel/CountryPanelEmpty';
import { EventDetail } from './features/chronolog/ChronologView';
import LegitimiteOverlay from './features/world/LegitimiteOverlay';
import { FONT, COLOR }  from './shared/theme';
import { applyThemeVars } from './shared/theme/applyTheme';
applyThemeVars();
import { loadLang, t, useLocale } from './ariaI18n';
import { CURSEUR_DEFAUT, CURSEUR_POINTER } from './shared/utils/curseurs';
import { clearSession } from './features/world/services/sessionStore';
import { loadOpts, loadKeys, loadAgentsOverride, saveAgentsOverride } from './shared/services/storage';
import { lireStorage, ecrireStorage } from './shared/utils/storage';
import { STORAGE_KEYS } from './shared/services/storageKeys';
import RadioPlayer from './shared/components/RadioPlayer';

function getTabs() {
  return [
    { id: 'map',      label: '🗺 MAP-GRID'    },
    { id: 'council',  label: '⚖ LLM COUNCIL' },
    { id: 'timeline', label: '📜 CHRONOLOG'   },
  ];
}

export default function App() {
  // ── États globaux ─────────────────────────────────────────────────────


  const { lang } = useLocale();
  const [worldGenerated,  setWorldGenerated]  = useState(() => {
    try {
      const active = lireStorage(STORAGE_KEYS.SESSION_ACTIVE, null);
      if (!active) return false;
      const countries = lireStorage(STORAGE_KEYS.SESSION_COUNTRIES, []);
      return Array.isArray(countries) && countries.length > 0;
    }
    catch { return false; }
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isCrisis,        setIsCrisis]        = useState(false);
  const [activeTab,       setActiveTab]       = useState('map');
  const [page,            setPage]            = useState('dashboard');
  const [worldName,       setWorldName]       = useState('');
  const [showLegitimite,  setShowLegitimite]  = useState(false);
  const [currentYear,     setCurrentYear]     = useState(null);
  const [currentCycle,    setCurrentCycle]    = useState(0);
  const [liveCountries,   setLiveCountries]   = useState([]);
  const countryIndex = selectedCountry
    ? liveCountries.findIndex(c => c.id === selectedCountry.id)
    : -1;
  const [chronologKey,    setChronologKey]    = useState(0);
  const [overlayEvent,    setOverlayEvent]    = useState(null);
  const [resetKey,        setResetKey]        = useState(0);
  const [confirmReset,    setConfirmReset]    = useState(false);
  const [hasApiKeys,      setHasApiKeys]      = useState(() => {
    try { const k = loadKeys(); return !!(k.claude||k.gemini); }
    catch { return false; }
  });

  // ── Refs ──────────────────────────────────────────────────────────────
  const ariaRef      = useRef(null);
  const ambientRef   = useRef(null);
  const crisisRef    = useRef(null);
  const fadeTimerRef = useRef(null);
  const audioStarted = useRef(false);
  // GEMINI
  const SOUND_ENABLED = false; // Passe à true pour réactiver

  // ── Options interface (curseurs + radio) ──────────────────────────────
  const lireInterface = () => {
    try {
      const opts = loadOpts();
      return {
        custom_cursors: opts.interface?.custom_cursors !== false,
        radio_visible:  opts.interface?.radio_visible  !== false,
      };
    } catch { return { custom_cursors: true, radio_visible: true }; }
  };
  const [interfaceOpts, setInterfaceOpts] = useState(lireInterface);

  // Rafraîchit les options interface quand on revient du panneau Settings
  useEffect(() => {
    if (page === 'dashboard') setInterfaceOpts(lireInterface());
  }, [page]);

  const [audioMuted, setAudioMuted] = useState(() => {
    return lireStorage(STORAGE_KEYS.AUDIO_MUTED, true);
  });
  const toggleAudio = useCallback(() => {
    setAudioMuted(prev => {
      const next = !prev;
      ecrireStorage(STORAGE_KEYS.AUDIO_MUTED, next);
      if (next) {
        ambientRef.current?.pause();
        crisisRef.current?.pause();
      } else {
        if (!audioStarted.current && ambientRef.current) {
          audioStarted.current = true;
          ambientRef.current.volume = 1;
          ambientRef.current.play().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  // ── Audio ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // GEMINI Si le son est désactivé, on arrête tout immédiatement
    if (!SOUND_ENABLED) return;
    // Code Claude
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const ambient = new Audio(`${base}/assets/audio/ambient_flow.mp3`);
    const crisis  = new Audio(`${base}/assets/audio/emergency_protocol.mp3`);
    ambient.loop = crisis.loop = true;
    ambient.volume = crisis.volume = 0;
    ambientRef.current = ambient;
    crisisRef.current  = crisis;
    return () => { ambient.pause(); crisis.pause(); };
  }, []);

  // Cross-fade 2s au changement de mode crise
  useEffect(() => {
    const ambient = ambientRef.current;
    const crisis  = crisisRef.current;
    if (!ambient || !crisis || !audioStarted.current) return;
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    const entering = isCrisis ? crisis : ambient;
    const leaving  = isCrisis ? ambient : crisis;
    entering.currentTime = 0;
    entering.play().catch(() => {});
    let step = 0;
    fadeTimerRef.current = setInterval(() => {
      step++;
      const t = Math.min(step / 40, 1);
      entering.volume = t;
      leaving.volume  = 1 - t;
      if (step >= 40) {
        clearInterval(fadeTimerRef.current);
        leaving.pause();
        leaving.volume = 0;
      }
    }, 50);
    return () => clearInterval(fadeTimerRef.current);
  }, [isCrisis]);

  // ── Handlers de lancement ─────────────────────────────────────────────
  const startAudio = () => {
    if (!audioStarted.current && ambientRef.current) {
      audioStarted.current = true;
      ambientRef.current.volume = 1;
      ambientRef.current.play().catch(() => {});
    }
  };

  const handleLaunchLocal = useCallback((customDefs) => {
    setWorldGenerated(true);
    startAudio();
    setTimeout(() => ariaRef.current?.startLocal(customDefs, 1400, 800), 100);
  }, []);

  const handleLaunchAI = useCallback((defs) => {
    setWorldGenerated(true);
    startAudio();
    setTimeout(() => ariaRef.current?.startWithAI(defs, 1400, 800), 100);
  }, []);

  const handleAriaReady = useCallback((fns) => {
    ariaRef.current = fns;
    // Lecture initiale (sera vide si partie pas encore démarrée)
    const y  = fns.getYear?.();      if (y)               setCurrentYear(y);
    const c  = fns.getCycle?.();     if (c !== undefined)  setCurrentCycle(c);
    const cs = fns.getCountries?.(); if (cs?.length)       setLiveCountries(cs);
  }, []);

  // Callback appelé par Dashboard chaque fois que countries change
  const handleCountriesUpdate = useCallback((cs) => {
    if (!cs?.length) return;
    setLiveCountries(cs);
    // Resynchronise selectedCountry : porte toujours les dernières données du pays
    // (notamment governanceOverride injecté au lancement, crucial pour le council engine)
    setSelectedCountry(prev => {
      if (!prev) return prev;
      const fresh = cs.find(c => c.id === prev.id);
      return fresh ?? prev;
    });
    const y = cs[0]?.annee;
    if (y) setCurrentYear(y);
    const base = 2026;
    setCurrentCycle(Math.max(0, Math.round((y - base) / 5)));
  }, []);

  // handleNextCycle → ouvre le popup de confirmation dans Dashboard
  // (ne plus appeler advanceCycle directement — le popup s'en charge)
  const handleNextCycle = useCallback(() => {
    ariaRef.current?.openCyclePopup?.();
  }, []);

  const handleSecession    = useCallback(() => ariaRef.current?.openSecession?.(), []);
  const handleCrisisToggle = useCallback(() => setIsCrisis(p => !p), []);

  const handleReset = useCallback(() => {
    clearSession();
    // Réécrire aria_agents_override avec la langue courante
    try {
      const BASE = loadLang() === 'en' ? BASE_AGENTS_EN : BASE_AGENTS;
      const cur = loadAgentsOverride();
      const merged = JSON.parse(JSON.stringify(BASE));
      if (cur) {
        merged.active_ministries = cur.active_ministries;
        merged.active_presidency = cur.active_presidency;
        merged.active_ministers  = cur.active_ministers;
      }
      saveAgentsOverride(merged);
    } catch {}
    ariaRef.current?.resetChronolog?.();
    setWorldGenerated(false);
    setSelectedCountry(null);
    setActiveTab('map');        // démonte ChronologView → reset son state
    setChronologKey(k => k + 1); // force remount ChronologView
    setCurrentYear(null);
    setCurrentCycle(0);
    setLiveCountries([]);
    audioStarted.current = false;
    ambientRef.current?.pause();
    setResetKey(k => k + 1);
  }, []);

  // ── Rafraîchir hasApiKeys après saisie dans InitScreen ────────────────
  const refreshKeys = useCallback(() => {
    try {
      const k = loadKeys();
      const nowHasKeys = !!(k.claude||k.gemini||k.grok||k.openai);
      const hadKeys = hasApiKeys;
      setHasApiKeys(nowHasKeys);
      // Informe si le changement affecte une partie en cours
      if (worldGenerated && nowHasKeys !== hadKeys) {
        ariaRef.current?.pushNotif?.(
          nowHasKeys
            ? t('NOTIF_KEY_ADDED', loadLang())
            : t('NOTIF_KEY_REMOVED', loadLang()),
          'info', 6000
        );
      }
    }
    catch { setHasApiKeys(false); }
  }, [hasApiKeys, worldGenerated]);

  // ── Année + cycle pour le header ──────────────────────────────────────
  const yearLabel = currentYear
    ? (lang==='en' ? `YEAR ${currentYear} · Cycle ${currentCycle}` : `AN ${currentYear} · Cycle ${currentCycle}`)
    : null;

  // ── Rendu ─────────────────────────────────────────────────────────────
  return (
    <div className="app-shell" style={interfaceOpts.custom_cursors ? { cursor: CURSEUR_DEFAUT } : undefined}>
      {interfaceOpts.custom_cursors && (
        <style>{`
          button, a, [role="button"], .btn-icon, .tab-btn, label[style*="pointer"] { cursor: ${CURSEUR_POINTER} !important; }
        `}</style>
      )}

      {/* Settings — overlay par-dessus le dashboard (ne démonte pas) */}
      {page === 'settings' && (
        <div style={{ position:'fixed', inset:0, zIndex:8000 }}>
          <Settings onClose={() => setPage('dashboard')} />
        </div>
      )}

      {/* Écran init */}
      {!worldGenerated && page !== 'settings' && (
        <div className="init-overlay">
          <InitScreen
            key={resetKey}
            worldName={worldName} setWorldName={setWorldName}
            onLaunchLocal={handleLaunchLocal} onLaunchAI={handleLaunchAI}
            hasApiKeys={hasApiKeys} onRefreshKeys={refreshKeys}
          />
        </div>
      )}

      {/* Rapport légitimité */}
      {showLegitimite && (
        <LegitimiteOverlay liveCountries={liveCountries} onClose={() => setShowLegitimite(false)} />
      )}

      {/* Confirmation nouvelle partie */}
      {confirmReset && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.65)', backdropFilter:'blur(3px)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            background:'#0f1117', border:'1px solid rgba(200,164,74,0.35)',
            borderRadius:8, padding:'2rem 2.5rem', maxWidth:360, textAlign:'center',
            fontFamily: FONT.mono, color: COLOR.text,
          }}>
            <div style={{ fontSize:'1.1rem', marginBottom:'0.5rem', color: COLOR.gold }}>
              {lang === 'en' ? 'New game?' : 'Nouvelle partie ?'}
            </div>
            <div style={{ fontSize:'0.78rem', opacity:0.65, marginBottom:'1.8rem' }}>
              {lang === 'en'
                ? 'The current session will be lost.'
                : 'La session en cours sera perdue.'}
            </div>
            <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
              <button
                onClick={() => { setConfirmReset(false); handleReset(); }}
                style={{
                  fontFamily: FONT.mono, fontSize:'0.8rem', letterSpacing:'0.1em',
                  background:'rgba(200,164,74,0.15)', border:'1px solid rgba(200,164,74,0.5)',
                  color: COLOR.gold, borderRadius:4, padding:'0.5rem 1.2rem', cursor:'pointer',
                }}>
                {lang === 'en' ? 'Confirm' : 'Confirmer'}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  fontFamily: FONT.mono, fontSize:'0.8rem', letterSpacing:'0.1em',
                  background:'transparent', border:'1px solid rgba(255,255,255,0.15)',
                  color:'rgba(255,255,255,0.5)', borderRadius:4, padding:'0.5rem 1.2rem', cursor:'pointer',
                }}>
                {lang === 'en' ? 'Cancel' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <header className="topbar" style={{ visibility: page === 'settings' ? 'hidden' : 'visible' }}>
        <div className="topbar-logo"
          onClick={() => setShowLegitimite(true)}
          title={t('TOPBAR_LEGITIMITE', loadLang())}
          style={{ cursor:'pointer' }}>
          ARIA<small>{t('TOPBAR_SUBTITLE', loadLang())}</small>
        </div>

        <nav className="topbar-tabs">
          {getTabs().map(({ id, label }) => (
            <button key={id}
              className={`tab-btn${activeTab === id ? ' active' : ''}`}
              onClick={() => setActiveTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {/* Année + cycle — centré, plus visible */}
        {yearLabel && (
          <div style={{
            position:'absolute', left:'50%', transform:'translateX(-50%)',
            pointerEvents:'none', userSelect:'none',
            fontFamily: FONT.mono, fontSize:'0.62rem', letterSpacing:'0.20em',
            color:'rgba(200,164,74,0.75)',
          }}>
            {yearLabel}
          </div>
        )}

        <div className="topbar-actions">
          {interfaceOpts.radio_visible && <RadioPlayer />}
          {isCrisis && (
            <span style={{
              fontFamily:FONT.mono, fontSize:'0.48rem', letterSpacing:'0.13em',
              color: COLOR.red, border:'1px solid rgba(255,58,58,0.32)',
              padding:'0.22rem 0.55rem', animation:'pulse 1s ease-in-out infinite',
            }}>
              {t('CRISIS', loadLang())}
            </span>
          )}
          {worldGenerated && (
            <button className="btn-icon" onClick={() => setConfirmReset(true)}
              title={t('BTN_NEW_GAME', loadLang())}
              style={{ fontSize:'0.75rem', opacity:0.55, letterSpacing:'0.05em' }}>
              ↺
            </button>
          )}
          <button className="btn-icon" onClick={toggleAudio}
            title={audioMuted ? t('BTN_SOUND_ON', loadLang()) : t('BTN_SOUND_OFF', loadLang())}
            style={{ fontSize:'1rem', opacity: audioMuted ? 0.35 : 0.80, color: 'white' }}>
            {audioMuted
              ? <span className="mdi mdi-volume-off" />
              : <span className="mdi mdi-volume-high" />
            }
          </button>
          <button className="btn-icon" onClick={() => setPage('settings')} title={t('BTN_CONFIG', loadLang())}>⚙</button>
        </div>
      </header>

      {/* Carte — toujours montée pour préserver l'état */}
      <main className="map-canvas">
        <div className="ocean-bg" />
        <Dashboard
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          isCrisis={isCrisis}
          activeTab={activeTab}
          onGoToCouncil={() => setActiveTab('council')}
          onGoToSettings={() => setPage('settings')}
          onWorldStarted={() => setWorldGenerated(true)}
          onReady={handleAriaReady}
          onCountriesUpdate={handleCountriesUpdate}
          onReset={handleReset}
          chronologKey={chronologKey}
        />
      </main>

      {/* Panneau latéral */}

      <aside className="side-panel">
      {selectedCountry === null ? (
        // CAS 1: Pas de pays sélectionné
        <EmptyPanel
        activeTab={activeTab}
        liveCountries={liveCountries}
        onSelectCountry={setSelectedCountry}
        />
      ) : (
        // CAS 2: Un pays est sélectionné
        <CountryPanel
        // Données du pays
        country={selectedCountry}

        // États globaux
        isCrisis={isCrisis}
        activeTab={activeTab}

        // Actions de navigation/fermeture
        onClose={() => setSelectedCountry(null)}
        onGoToCouncil={() => setActiveTab('council')}
        onGoToMap={() => setActiveTab('map')}
        onGoToTimeline={() => setActiveTab('timeline')}

        // Overlay délibération
        onOpenEvent={ev => setOverlayEvent(ev)}

        // Actions métier (via ref)
        onSecession={handleSecession}
        onNextCycle={handleNextCycle}
        onCrisisToggle={handleCrisisToggle}
        onConstitution={() => ariaRef.current?.openConstitution?.()}
        onSubmitQuestion={(q, mid) => ariaRef.current?.submitQuestion?.(q, mid)}
        onAddFictionalCountry={() => ariaRef.current?.addFictionalCountry?.()}

        // Navigation entre pays
        countryIndex={countryIndex}
        countryTotal={liveCountries.length}
        onPrevCountry={() => {
          if (liveCountries.length < 2) return;
          const prev = (countryIndex - 1 + liveCountries.length) % liveCountries.length;
          setSelectedCountry(liveCountries[prev]);
        }}
        onNextCountry={() => {
          if (liveCountries.length < 2) return;
          const next = (countryIndex + 1) % liveCountries.length;
          setSelectedCountry(liveCountries[next]);
        }}
        />
      )}
      </aside>

      {/* ── Overlay délibération complète ────────────────────────────────── */}
      {overlayEvent && (
        <div
          onClick={() => setOverlayEvent(null)}
          style={{
            position:'fixed', inset:0, zIndex:9999,
            background:'rgba(3,6,12,0.82)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'1.5rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:'rgba(8,14,26,0.98)',
              border:'1px solid rgba(200,164,74,0.22)',
              borderRadius:'4px',
              width:'min(720px, 92vw)',
              maxHeight:'80vh',
              display:'flex', flexDirection:'column',
              overflow:'hidden',
            }}
          >
            {/* Header overlay */}
            <div style={{
              display:'flex', alignItems:'flex-start', gap:'0.6rem',
              padding:'0.70rem 0.90rem',
              borderBottom:'1px solid rgba(200,164,74,0.12)',
              flexShrink:0,
            }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:FONT.mono, fontSize:'0.34rem', letterSpacing:'0.16em',
                  color:'rgba(200,164,74,0.55)', marginBottom:'0.22rem' }}>
                  📜 {lang==='en' ? 'DELIBERATION' : 'DÉLIBÉRATION'}
                </div>
                {overlayEvent.question && (
                  <p style={{ fontFamily:FONT.mono, fontSize:'0.46rem',
                    color:'rgba(200,215,240,0.88)', lineHeight:1.55, margin:0 }}>
                    {overlayEvent.question}
                  </p>
                )}
              </div>
              <button
                onClick={() => setOverlayEvent(null)}
                style={{
                  background:'transparent', border:'none', cursor:'pointer',
                  fontFamily:FONT.mono, fontSize:'0.50rem',
                  color:'rgba(140,160,200,0.55)', padding:'0 0.2rem', flexShrink:0,
                  lineHeight:1,
                }}
              >✕</button>
            </div>

            {/* Corps délibération */}
            <div style={{ flex:1, overflowY:'auto', padding:'0' }}>
              <EventDetail ev={overlayEvent} isSummary={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
