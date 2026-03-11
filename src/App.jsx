// ═══════════════════════════════════════════════════════════════════════════
//  App.jsx — Shell principal ARIA
//  Routing, états globaux, topbar.
//  Tous les composants UI sont dans leurs propres fichiers.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BASE_AGENTS    from '../templates/base_agents.json';
import BASE_AGENTS_EN from '../templates/base_agents_en.json';
import './App.css';

import Dashboard        from './Dashboard_p3';
import Settings         from './Settings';
import InitScreen       from './InitScreen';
import CountryPanel, { EmptyPanel } from './CountryPanel';
import LegitimiteOverlay from './LegitimiteOverlay';
import { FONT, COLOR }  from './ariaTheme';
import { loadLang, t, useLocale } from './ariaI18n';

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
      const active = localStorage.getItem('aria_session_active');
      if (!active) return false;
      const countries = JSON.parse(localStorage.getItem('aria_session_countries') || '[]');
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
  const [chronologKey,    setChronologKey]    = useState(0);
  const [resetKey,        setResetKey]        = useState(0);
  const [hasApiKeys,      setHasApiKeys]      = useState(() => {
    try { const k = JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); return !!(k.claude||k.gemini); }
    catch { return false; }
  });

  // ── Refs ──────────────────────────────────────────────────────────────
  const ariaRef      = useRef(null);
  const ambientRef   = useRef(null);
  const crisisRef    = useRef(null);
  const fadeTimerRef = useRef(null);
  const audioStarted = useRef(false);
  const [audioMuted, setAudioMuted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aria_audio_muted') ?? 'true'); }
    catch { return true; }
  });

  // ── Audio ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioMuted) return;
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
  const toggleAudio = useCallback(() => {
    setAudioMuted(prev => {
      const next = !prev;
      localStorage.setItem('aria_audio_muted', JSON.stringify(next));
      if (next) {
        ambientRef.current?.pause();
        crisisRef.current?.pause();
        audioStarted.current = false;
      } else {
        startAudio();
      }
      return next;
    });
  }, []);
  const handleReset = useCallback(() => {
    // Nettoyer toute la session persistée
    try {
      localStorage.removeItem('aria_session_active');
      localStorage.removeItem('aria_session_world');
      localStorage.removeItem('aria_session_countries');
      localStorage.removeItem('aria_session_alliances');
      localStorage.removeItem('aria_chronolog_cycles');
    } catch {}
    // Réécrire aria_agents_override avec la langue courante
    try {
      const BASE = loadLang() === 'en' ? BASE_AGENTS_EN : BASE_AGENTS;
      const cur = JSON.parse(localStorage.getItem('aria_agents_override') || 'null');
      const merged = JSON.parse(JSON.stringify(BASE));
      if (cur) {
        merged.active_ministries = cur.active_ministries;
        merged.active_presidency = cur.active_presidency;
        merged.active_ministers  = cur.active_ministers;
      }
      localStorage.setItem('aria_agents_override', JSON.stringify(merged));
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
      const k = JSON.parse(localStorage.getItem('aria_api_keys')||'{}');
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
    <div className="app-shell">

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
          {isCrisis && (
            <span style={{
              fontFamily:FONT.mono, fontSize:'0.48rem', letterSpacing:'0.13em',
              color: COLOR.red, border:'1px solid rgba(255,58,58,0.32)',
              padding:'0.22rem 0.55rem', animation:'pulse 1s ease-in-out infinite',
            }}>
              {t('CRISIS', loadLang())}
            </span>
          )}
          <button className="btn-icon" onClick={toggleAudio}
          title={audioMuted ? (lang==='en'?'Enable sound':'Activer le son') : (lang==='en'?'Mute sound':'Couper le son')}
          style={{ fontSize:'1rem', opacity: audioMuted ? 0.35 : 0.80, color: 'white' }}>
          {audioMuted
            ? <span className="mdi mdi-volume-off" />
            : <span className="mdi mdi-volume-high" />
          }
          </button>
          {worldGenerated && (
            <button className="btn-icon" onClick={handleReset}
            title={t('BTN_NEW_GAME', loadLang())}
            style={{ fontSize:'0.75rem', opacity:0.55, letterSpacing:'0.05em' }}>
            ↺
            </button>
          )}
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
        {selectedCountry === null
          ? <EmptyPanel activeTab={activeTab} liveCountries={liveCountries} onSelectCountry={setSelectedCountry} />
          : <CountryPanel
              country={selectedCountry}
              isCrisis={isCrisis}
              activeTab={activeTab}
              onClose={() => setSelectedCountry(null)}
              onSecession={handleSecession}
              onNextCycle={handleNextCycle}
              onCrisisToggle={handleCrisisToggle}
              onGoToCouncil={() => setActiveTab('council')}
              onGoToMap={() => setActiveTab('map')}
              onGoToTimeline={() => setActiveTab('timeline')}
              onConstitution={() => ariaRef.current?.openConstitution?.()}
              onSubmitQuestion={(q, mid) => ariaRef.current?.submitQuestion?.(q, mid)}
              onAddFictionalCountry={() => ariaRef.current?.addFictionalCountry?.()}
            />
        }
      </aside>
    </div>
  );
}
