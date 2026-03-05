// ═══════════════════════════════════════════════════════════════════════════
//  App.jsx — Shell principal ARIA
//  Routing, états globaux, topbar.
//  Tous les composants UI sont dans leurs propres fichiers.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

import Dashboard        from './Dashboard_p3';
import Settings         from './Settings';
import InitScreen       from './InitScreen';
import CountryPanel     from './CountryPanel';
import LegitimiteOverlay from './LegitimiteOverlay';
import { EmptyPanel }   from './CountryPanel';
import { FONT, COLOR }  from './ariaTheme';

const TABS = [
  { id: 'map',      label: 'MAP-GRID'    },
{ id: 'council',  label: 'LLM COUNCIL' },
{ id: 'timeline', label: 'CHRONOLOG'   },
];

export default function App() {
  // ── États globaux ─────────────────────────────────────────────────────
  const [worldGenerated,  setWorldGenerated]  = useState(() => {
    try { return !!JSON.parse(localStorage.getItem('aria_session_active') || 'false'); }
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

  // ── Audio ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const ambient = new Audio('/assets/audio/ambient_flow.mp3');
    const crisis  = new Audio('/assets/audio/emergency_protocol.mp3');
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

  const handleLaunchLocal = useCallback(() => {
    setWorldGenerated(true);
    try { localStorage.setItem('aria_session_active', 'true'); } catch {}
    startAudio();
    setTimeout(() => ariaRef.current?.startLocal(1400, 800), 100);
  }, []);

  const handleLaunchAI = useCallback((defs) => {
    setWorldGenerated(true);
    try { localStorage.setItem('aria_session_active', 'true'); } catch {}
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

  const handleNextCycle = useCallback(async () => {
    await ariaRef.current?.advanceCycle?.();
    const y  = ariaRef.current?.getYear?.();      if (y)              setCurrentYear(y);
    const c  = ariaRef.current?.getCycle?.();     if (c !== undefined) setCurrentCycle(c);
    const cs = ariaRef.current?.getCountries?.(); if (cs)              setLiveCountries(cs);
  }, []);

  const handleSecession    = useCallback(() => ariaRef.current?.doSecession?.(selectedCountry?.id, 'Nouvelle entité', 'Neutre'), [selectedCountry]);
  const handleCrisisToggle = useCallback(() => setIsCrisis(p => !p), []);

  const handleReset = useCallback(() => {
    setWorldGenerated(false);
    try { localStorage.removeItem('aria_session_active'); } catch {}
    setSelectedCountry(null);
    setCurrentYear(null);
    setCurrentCycle(0);
    setLiveCountries([]);
    audioStarted.current = false;
    ambientRef.current?.pause();
  }, []);

  // ── Rafraîchir hasApiKeys après saisie dans InitScreen ────────────────
  const refreshKeys = useCallback(() => {
    try { const k = JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); setHasApiKeys(!!(k.claude||k.gemini)); }
    catch { setHasApiKeys(false); }
  }, []);

  // ── Année + cycle pour le header ──────────────────────────────────────
  const yearLabel = currentYear
  ? `AN ${currentYear} · Cycle ${currentCycle}`
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
    title="Rapport de Légitimité Globale — ARIA"
    style={{ cursor:'pointer' }}>
    ARIA<small>DÉMOCRATIE HOLISTIQUE</small>
    </div>

    <nav className="topbar-tabs">
    {TABS.map(({ id, label }) => (
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
      ⚠ CRISE
      </span>
    )}
    <button className="btn-icon" onClick={() => setPage('settings')} title="Configuration ARIA">⚙</button>
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
    onReady={handleAriaReady}
    onCountriesUpdate={handleCountriesUpdate}
    onReset={handleReset}
    />
    </main>

    {/* Panneau latéral */}
    <aside className="side-panel">
    {selectedCountry === null
      ? <EmptyPanel />
      : <CountryPanel
      country={selectedCountry}
      isCrisis={isCrisis}
      onClose={() => setSelectedCountry(null)}
      onSecession={handleSecession}
      onNextCycle={handleNextCycle}
      onCrisisToggle={handleCrisisToggle}
      />
    }
    </aside>
    </div>
  );
}
