import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Settings from './Settings';

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD PLACEHOLDER
//  Phase 2 : remplace par   import Dashboard from './Dashboard';
//  Props déjà câblées pour zéro refactor.
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ selectedCountry, setSelectedCountry, isCrisis, activeTab }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '0.9rem', userSelect: 'none',
    }}>
    <div style={{ fontSize: '3.2rem', opacity: 0.10 }}>🌍</div>
    <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.56rem', letterSpacing: '0.30em', color: 'rgba(200,164,74,0.28)' }}>
    MOTEUR CARTOGRAPHIQUE — PHASE 2
    </div>
    {isCrisis && (
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.50rem', letterSpacing: '0.14em', color: 'rgba(255,58,58,0.55)', animation: 'pulse 1s ease-in-out infinite' }}>
      ⚠ MODE CRISE ACTIF
      </div>
    )}
    {/* Bouton de test panneau */}
    <button onClick={() => setSelectedCountry(MOCK_COUNTRY)} style={{ marginTop: '1.2rem', padding: '0.45rem 1.1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.50rem', letterSpacing: '0.14em', background: 'rgba(200,164,74,0.06)', border: '1px solid rgba(200,164,74,0.20)', color: 'rgba(200,164,74,0.60)', cursor: 'pointer' }}>
    TEST › Sélectionner un pays
    </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK — valide le rendu du panneau latéral
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_COUNTRY = {
  nom: 'République de Valoria', emoji: '🏛', terrain: 'coastal', annee: 2031,
  population: 4_280_000, tauxNatalite: 11.4, tauxMortalite: 8.2, satisfaction: 63,
  ressources: { agriculture: true, bois: true, eau: false, energie: true, mineraux: false, peche: true, petrole: false },
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'map',      label: 'MAP-GRID'       },
{ id: 'council',  label: 'LLM COUNCIL'     },
{ id: 'timeline', label: 'CHRONOLOG' },
];

const RESOURCE_DEFS = [
  { key: 'agriculture', icon: '🌾', label: 'AGRICULTURE', css: 'agriculture' },
{ key: 'bois',        icon: '🪵', label: 'BOIS',        css: 'bois'        },
{ key: 'eau',         icon: '💧', label: 'EAU DOUCE',   css: 'eau'         },
{ key: 'energie',     icon: '⚡', label: 'ÉNERGIE',     css: 'energie'     },
{ key: 'mineraux',    icon: '💎', label: 'MINÉRAUX',    css: 'mineraux'    },
{ key: 'peche',       icon: '🐟', label: 'PÊCHE',       css: 'peche'       },
{ key: 'petrole',     icon: '🛢️',  label: 'PÉTROLE',    css: 'petrole'     },
];

const TERRAIN_LABELS = { coastal: 'Côtier', inland: 'Enclavé', island: 'Insulaire', archipelago: 'Archipel', highland: 'Montagneux' };
const MARITIME = new Set(['coastal', 'island', 'archipelago']);

const satisfColor = (p) => p >= 70 ? '#3ABF7A' : p >= 45 ? '#C8A44A' : p >= 25 ? '#C05050' : '#8A2020';
const fmtPop = (n) => n >= 1e9 ? (n/1e9).toFixed(1)+' Md' : n >= 1e6 ? (n/1e6).toFixed(1)+' M' : n >= 1e3 ? Math.round(n/1e3)+' k' : String(n);


// ─────────────────────────────────────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [worldGenerated,  setWorldGenerated]  = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isCrisis,        setIsCrisis]        = useState(false);
  const [activeTab,       setActiveTab]       = useState('map');
  const [page,            setPage]            = useState('dashboard');
  const [worldName,       setWorldName]       = useState('');
  const [generating,      setGenerating]      = useState(false);
  const [genProgress,     setGenProgress]     = useState(0);

  // Refs audio — volume modifié hors du cycle React pour éviter les re-renders par frame
  const ambientRef   = useRef(null);
  const crisisRef    = useRef(null);
  const fadeTimerRef = useRef(null);
  const audioStarted = useRef(false);

  useEffect(() => {
    const ambient = new Audio('/assets/audio/ambient_flow.mp3');
    const crisis  = new Audio('/assets/audio/emergency_protocol.mp3');
    ambient.loop = crisis.loop = true;
    ambient.volume = crisis.volume = 0;
    ambientRef.current = ambient;
    crisisRef.current  = crisis;
    return () => { ambient.pause(); crisis.pause(); };
  }, []);

  // Cross-fade fluide 2 s (40 steps × 50 ms)
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

  const handleGenerate = useCallback(() => {
    if (!worldName.trim()) return;
    setGenerating(true);
    setGenProgress(0);
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setGenProgress(Math.round((current / 30) * 100));
      if (current >= 30) {
        clearInterval(timer);
        if (!audioStarted.current && ambientRef.current) {
          audioStarted.current = true;
          ambientRef.current.volume = 1;
          ambientRef.current.play().catch(() => {});
        }
        setTimeout(() => { setGenerating(false); setWorldGenerated(true); }, 300);
      }
    }, 60);
  }, [worldName]);

  const handleSecession    = useCallback(() => { console.info('[ARIA] Sécession :', selectedCountry?.nom); }, [selectedCountry]);
  const handleNextCycle    = useCallback(() => { console.info('[ARIA] Cycle +5 ans'); }, []);
  const handleCrisisToggle = useCallback(() => { setIsCrisis(p => !p); }, []);

  return (
    <div className="app-shell">

    {/* --- CONDITION : SI ON EST SUR LA PAGE SETTINGS --- */}
    {page === 'settings' ? (
      <Settings onClose={() => setPage('dashboard')} />
    ) : (
      /* --- SINON (PAGE DASHBOARD PAR DÉFAUT) --- */
      <>
      {!worldGenerated && (
        <div className="init-overlay">
        <InitScreen worldName={worldName} setWorldName={setWorldName} generating={generating} genProgress={genProgress} onGenerate={handleGenerate} />
        </div>
      )}

      <header className="topbar">
      <div className="topbar-logo" onClick={() => { setWorldGenerated(false); setSelectedCountry(null); }} title="Retour à l'init">
      ARIA<small>DÉMOCRATIE HOLISTIQUE</small>
      </div>
      <nav className="topbar-tabs">
      {TABS.map(({ id, label }) => (
        <button key={id} className={`tab-btn${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
      ))}
      </nav>
      <div className="topbar-actions">
      {isCrisis && (
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.48rem', letterSpacing: '0.13em', color: '#FF3A3A', border: '1px solid rgba(255,58,58,0.32)', padding: '0.22rem 0.55rem', animation: 'pulse 1s ease-in-out infinite' }}>
        ⚠ CRISE
        </span>
      )}
      {/* ICI : On change l'action du bouton pour changer de page */}
      <button
      className="btn-icon"
      onClick={() => setPage('settings')}
      title="Configuration ARIA"
      >
      ⚙
      </button>
      </div>
      </header>

      <main className="map-canvas">
      <div className="ocean-bg" />
      <Dashboard selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} isCrisis={isCrisis} activeTab={activeTab} />
      </main>

      <aside className="side-panel">
      {selectedCountry === null
        ? <EmptyPanel />
        : <CountryPanel country={selectedCountry} isCrisis={isCrisis} onClose={() => setSelectedCountry(null)} onSecession={handleSecession} onNextCycle={handleNextCycle} onCrisisToggle={handleCrisisToggle} />
      }
      </aside>
      </>
    )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  INIT SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function InitScreen({ worldName, setWorldName, generating, genProgress, onGenerate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', width: '100%', maxWidth: 480, padding: '2rem' }}>
    <div style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(2.8rem,7vw,5rem)', fontWeight: 700, letterSpacing: 'clamp(0.8rem,2vw,1.4rem)', color: '#C8A44A', textShadow: '0 0 80px rgba(200,164,74,0.45)', animation: 'float 4s ease-in-out infinite' }}>ARIA</div>
    <div style={{ fontFamily: "'Cinzel',serif", fontSize: '0.54rem', letterSpacing: '0.34em', color: '#3A4A62', marginTop: '0.55rem' }}>ARCHITECTURE DE RAISONNEMENT INSTITUTIONNEL PAR L'IA</div>
    <p style={{ fontSize: '0.82rem', color: '#5A6A8A', fontStyle: 'italic', marginTop: '1rem', lineHeight: 1.75, maxWidth: 380 }}>
    "Et si les politiques d'un pays étaient soumises au peuple par l'intermédiaire d'un conseil des ministres IA ?"
    </p>
    </div>

    {!generating ? (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div className="field">
      <label className="field-label">NOM DU MONDE</label>
      <input className="field-input" value={worldName} onChange={e => setWorldName(e.target.value)} onKeyDown={e => e.key === 'Enter' && onGenerate()} placeholder="Ex : Pangée Altérée, Archipel de la Paix…" autoFocus />
      </div>
      <button className="btn btn-gold btn-full" disabled={!worldName.trim()} onClick={onGenerate} style={{ letterSpacing: '0.22em' }}>
      GÉNÉRER LE MONDE →
      </button>
      </div>
    ) : (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.14em', color: '#C8A44A', animation: 'pulse 1.2s ease-in-out infinite' }}>GÉNÉRATION DE LA TOPOGRAPHIE…</div>
      <div className="worldgen-bar" style={{ width: '100%' }}>
      <div className="worldgen-fill" style={{ width: `${genProgress}%` }} />
      </div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.52rem', color: '#3A4A62', letterSpacing: '0.10em' }}>{genProgress} %</div>
      </div>
    )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EMPTY PANEL
// ─────────────────────────────────────────────────────────────────────────────
function EmptyPanel() {
  return (
    <div className="panel-empty">
    <div className="panel-empty-icon">🌍</div>
    <div className="panel-empty-label">AUCUN TERRITOIRE SÉLECTIONNÉ</div>
    <p className="panel-empty-hint">Cliquez sur un pays sur la carte pour afficher ses données, ressources et options de gouvernance.</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COUNTRY PANEL
// ─────────────────────────────────────────────────────────────────────────────
function CountryPanel({ country, isCrisis, onClose, onSecession, onNextCycle, onCrisisToggle }) {
  const { nom = 'Inconnu', emoji = '🌍', terrain = 'coastal', annee = 2026, population = 0, tauxNatalite = 0, tauxMortalite = 0, satisfaction = 50, ressources = {} } = country;
  const sc = satisfColor(satisfaction);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

    <div className="panel-header">
    <span className="panel-header-emoji">{emoji}</span>
    <div style={{ flex: 1 }}>
    <div className="panel-header-title">{nom}</div>
    <div className="panel-header-regime">{TERRAIN_LABELS[terrain] ?? terrain} · An {annee}</div>
    </div>
    <button className="btn-icon" onClick={onClose} title="Désélectionner" style={{ flexShrink: 0 }}>✕</button>
    </div>

    <div className="side-panel-scroll">
    <div className="panel-body">

    {/* Démographie */}
    <section>
    <div className="section-title">DÉMOGRAPHIE</div>
    <div className="stat-row"><span className="stat-label">POPULATION</span><span className="stat-value">{fmtPop(population)}</span></div>
    <div className="stat-row" style={{ marginTop: '0.36rem' }}><span className="stat-label">NATALITÉ</span><span className="stat-value">{tauxNatalite.toFixed(1)} ‰</span></div>
    <div className="stat-row" style={{ marginTop: '0.36rem' }}><span className="stat-label">MORTALITÉ</span><span className="stat-value">{tauxMortalite.toFixed(1)} ‰</span></div>
    </section>

    {/* Satisfaction */}
    <section>
    <div className="section-title">SATISFACTION POPULAIRE</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.72rem' }}>
    <div style={{ flex: 1, height: '7px', background: 'rgba(14,20,36,0.9)', borderRadius: '4px', overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${satisfaction}%`, background: `linear-gradient(90deg, #8A2020, ${sc})`, borderRadius: '4px', transition: 'width 0.65s cubic-bezier(0.25,0.46,0.45,0.94)' }} />
    </div>
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.80rem', fontWeight: 600, color: sc, minWidth: '40px', textAlign: 'right' }}>{satisfaction}%</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.44rem', color: '#3A4A62', marginTop: '0.26rem' }}>
    <span>MÉCONTENTS</span><span>SATISFAITS</span>
    </div>
    </section>

    {/* Ressources */}
    <section>
    <div className="section-title">RESSOURCES</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.30rem' }}>
    {RESOURCE_DEFS.map(({ key, icon, label, css }) => {
      const present = !!ressources[key];
      return (
        <span key={key} className={`resource-badge ${css}`} style={{ opacity: present ? 1 : 0.22 }} title={present ? label : `${label} — absent`}>
        <span className="r-icon">{icon}</span>
        <span className="r-name">{label}</span>
        </span>
      );
    })}
    </div>
    {!MARITIME.has(terrain) && (
      <div className="coastal-note" style={{ marginTop: '0.55rem' }}>⚠ Pays enclavé — aucune ZEE ni ressource maritime</div>
    )}
    </section>

    </div>
    </div>

    {/* Actions */}
    <div className="side-panel-footer">
    <div className="section-title" style={{ marginBottom: '0.08rem' }}>ACTIONS</div>
    <button className="cp-act-btn purple btn-full" onClick={onSecession} title="Simuler une sécession">✂️ SÉCESSION</button>
    <button className="cp-act-btn muted btn-full" onClick={onNextCycle} title="Avancer de 5 ans">⏭ CYCLE +5 ANS</button>
    <button className="cp-act-btn btn-full" onClick={onCrisisToggle}
    style={isCrisis ? { borderColor: '#FF3A3A', color: '#FF3A3A', background: 'rgba(255,58,58,0.07)' } : { borderColor: 'rgba(200,164,74,0.18)', color: '#4A5A72' }}>
    {isCrisis ? '🔴 DÉSACTIVER LA CRISE' : '⚠️ SIMULER UNE CRISE'}
    </button>
    </div>
    </div>
  );
}

