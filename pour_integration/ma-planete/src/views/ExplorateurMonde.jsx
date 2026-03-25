// src/views/ExplorateurMonde.jsx
import React, { useState, useRef, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import * as THREE from 'three';
import { CURSEUR_DEFAUT, CURSEUR_POINTER, CURSEUR_GRAB, CURSEUR_GRABBING } from '../utils/curseurs.js';

const RAYON = 2;
const PI    = Math.PI;

// ─── Lazy loading des composants lourds 3D ───────────────────────────────────
// Ces composants ne seront chargés que quand on en a besoin

const SceneGlobeMercator = lazy(() => import('./SceneGlobeMercator'));
const SceneWarRoom = lazy(() => import('./SceneWarRoom'));
const SceneGlobeDecoupé = lazy(() => import('./SceneGlobeDecoupé'));
const LigneScan = lazy(() => import('./LigneScan'));

// ─── Composants légers (pas de Three.js) ─────────────────────────────────────
const Stars = lazy(() => import('@react-three/drei').then(module => ({ default: module.Stars })));
const Canvas = lazy(() => import('@react-three/fiber').then(module => ({ default: module.Canvas })));

// ─── Config pays (données légères) ───────────────────────────────────────────
const PAYS = {
  france:    { label:'FRANCE',     couleur:'#ff0d8c', scan:'rgba(255,13,140,0.25)',   NAME:'France',                  mainland:[-5.5,41.0,9.6,51.2],   bbox:[-5.5,41.0,9.6,51.2],      fragId:'france'    },
  usa:       { label:'ÉTATS-UNIS', couleur:'#7319ff', scan:'rgba(115,25,255,0.25)',   NAME:'United States of America', mainland:[-125,24.0,-66.0,50.0], bbox:[-125,24.0,-66.0,50.0],    fragId:'usa'       },
  chine:     { label:'CHINE',      couleur:'#ff2626', scan:'rgba(255,38,38,0.25)',    NAME:'China',                   mainland:null,                   bbox:[73.5,18.2,135.1,53.5],    fragId:'chine'     },
  russie:    { label:'RUSSIE',     couleur:'#a633ff', scan:'rgba(166,51,255,0.25)',   NAME:'Russia',                  mainland:null,                   bbox:[27.3,41.2,190.0,77.7],    fragId:'russie'    },
  bresil:    { label:'BRÉSIL',     couleur:'#26ff4d', scan:'rgba(38,255,77,0.25)',    NAME:'Brazil',                  mainland:null,                   bbox:[-73.1,-33.8,-29.3,5.3],   fragId:'bresil'    },
  inde:      { label:'INDE',       couleur:'#ff8000', scan:'rgba(255,128,0,0.25)',    NAME:'India',                   mainland:null,                   bbox:[68.1,7.9,97.4,35.7],      fragId:'inde'      },
  allemagne: { label:'ALLEMAGNE',  couleur:'#ffcc00', scan:'rgba(255,204,0,0.25)',    NAME:'Germany',                 mainland:null,                   bbox:[6.0,47.2,15.1,55.1],      fragId:'allemagne' },
  japon:     { label:'JAPON',      couleur:'#ff00bf', scan:'rgba(255,0,191,0.25)',    NAME:'Japan',                   mainland:null,                   bbox:[122.9,24.2,145.8,45.5],   fragId:'japon'     },
  nigeria:   { label:'NIGÉRIA',    couleur:'#d9ff00', scan:'rgba(217,255,0,0.25)',   NAME:'Nigeria',                 mainland:null,                   bbox:[2.7,4.3,14.7,13.9],       fragId:'nigeria'   },
  arabie:    { label:'ARABIE S.',  couleur:'#e6bf1a', scan:'rgba(230,191,26,0.25)',   NAME:'Saudi Arabia',            mainland:null,                   bbox:[34.6,16.4,55.7,32.2],     fragId:'arabie'    },
};

// ─── UI Styles (légers) ──────────────────────────────────────────────────────
const btnBase = {
  padding:'8px 16px',background:'rgba(0,15,35,0.75)',
  border:'1px solid rgba(0,200,255,0.3)',borderRadius:'4px',
  color:'rgba(0,210,255,0.85)',cursor:CURSEUR_POINTER,
  fontSize:'0.78rem',fontFamily:'monospace',letterSpacing:'0.06em',pointerEvents:'all',
};

const ui = {
  c:  { position:'absolute', inset:0, pointerEvents:'none', zIndex:100 },
  btn: {
    position:'absolute', top:'20px', left:'20px', pointerEvents:'all',
    padding:'8px 16px', background:'rgba(0,15,35,0.75)',
    border:'1px solid rgba(0,200,255,0.3)', borderRadius:'4px',
    color:'rgba(0,210,255,0.85)', cursor:CURSEUR_POINTER,
    fontSize:'0.88rem', fontFamily:'monospace', letterSpacing:'0.06em'
  },
  badge: {
    position:'absolute', top:'22px', left:'50%', transform:'translateX(-50%)',
    padding:'6px 18px', background:'rgba(0,10,25,0.8)', border:'1px solid', borderRadius:'3px',
    fontSize:'0.78rem', fontFamily:'monospace', letterSpacing:'0.2em', textTransform:'uppercase', whiteSpace:'nowrap'
  },
  ind: {
    position:'absolute', bottom:'28px', left:'50%', transform:'translateX(-50%)',
    color:'rgba(0,200,255,0.35)', fontSize:'0.78rem', fontFamily:'monospace',
    letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap', pointerEvents:'none'
  },
};

// ─── Fallback de chargement ──────────────────────────────────────────────────
const LoadingFallback = ({ message = "CHARGEMENT..." }) => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#020208',
    color: '#c8a44a',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    letterSpacing: '0.2em',
  }}>
  {message}
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────
export function ExplorateurMonde({ initialVue = 'globe', sansTransition = false }) {
  const [vue, setVue] = useState(initialVue);
  const [paysFocus, setPaysFocus] = useState(null);
  const [paysSurvolé, setPaysSurvolé] = useState(null);
  const [geo110, setGeo110] = useState(null);
  const [geo50, setGeo50] = useState(null);
  const [geo10, setGeo10] = useState(null);
  const [decoupage, setDecoupage] = useState(null);

  // Chargement des données GeoJSON (léger, pas de Three.js)
  useEffect(() => {
    Promise.all([
      fetch('/geojson/ne_110m_admin_0_countries.geojson').then(r => r.json()),
                fetch('/geojson/ne_50m_admin_0_countries.geojson').then(r => r.json()),
                fetch('/geojson/ne_10m_admin_0_countries.geojson').then(r => r.json()),
    ]).then(([d110, d50, d10]) => {
      setGeo110(d110);
      setGeo50(d50);
      setGeo10(d10);
    }).catch(console.error);
  }, []);

  const melanger = n => Array.from({length:n},(_,i)=>i).sort(()=>Math.random()-0.5);
  const actionDecouper4      = () => setDecoupage({ type:'4',      perm4:melanger(4), perm8:null });
  const actionDecouper4puis8 = () => setDecoupage({ type:'4puis8', perm4:melanger(4), perm8:melanger(8) });
  const actionReinit         = () => setDecoupage(null);

  const changerVue = useCallback((v) => {
    if (v === vue) return;
    setVue(v);
    setPaysSurvolé(null);
  }, [vue]);

  const estGlobe    = vue === 'globe';
  const estMercator = vue === 'mercator';
  const estWarRoom  = vue === 'warroom';

  const geoActuel = estMercator ? geo50 : geo110;
  const cfg = paysFocus ? PAYS[paysFocus] : null;

  // Rendu conditionnel avec lazy loading
  const renderCanvasContent = () => {
    if (!geoActuel && !estWarRoom) {
      return <LoadingFallback message="CHARGEMENT DES DONNÉES..." />;
    }

    if (decoupage && estGlobe) {
      return (
        <Suspense fallback={<LoadingFallback message="DÉCOUPE 3D..." />}>
        <SceneGlobeDecoupé geoData={geo110} decoupage={decoupage} />
        </Suspense>
      );
    }

    if (estWarRoom && cfg && geo10) {
      return (
        <Suspense fallback={<LoadingFallback message="WAR ROOM..." />}>
        <SceneWarRoom geoData={geo10} cfg={cfg} />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<LoadingFallback message="CHARGEMENT DE LA CARTE..." />}>
      <SceneGlobeMercator
      geoData={geoActuel}
      isPlanar={estMercator}
      paysSurvolé={paysSurvolé}
      onClickGlobe={id => setPaysSurvolé(id)}
      onSurvolMercator={id => setPaysSurvolé(id)}
      onEntrerMercator={id => {
        setPaysFocus(id);
        setVue('warroom');
      }}
      mercatorInstantane={sansTransition && initialVue === 'mercator'}
      />
      </Suspense>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', backgroundColor: '#000' }}>
    {!estWarRoom && (
      <div
      style={{ width: '100%', height: '100%' }}
      onDoubleClick={estGlobe ? () => changerVue('mercator') : undefined}
      >
      <Suspense fallback={<LoadingFallback message="INITIALISATION 3D..." />}>
      <Canvas camera={{ position: [0, 0, RAYON * 3], fov: 45 }}>
      <color attach="background" args={['#020208']} />
      <ambientLight intensity={0.15} />
      <Suspense fallback={null}>
      <Stars radius={130} depth={60} count={45000} factor={5} saturation={0} fade speed={0.4} />
      </Suspense>
      {renderCanvasContent()}
      </Canvas>
      </Suspense>
      </div>
    )}

    {estWarRoom && (
      <>
      <Suspense fallback={null}>
      <LigneScan couleur={cfg?.scan || '#00e5ff'} />
      </Suspense>
      <Suspense fallback={<LoadingFallback message="WAR ROOM..." />}>
      <Canvas camera={{ position: [0, 0, RAYON * 3], fov: 45 }}>
      <color attach="background" args={['#020208']} />
      <ambientLight intensity={0.1} />
      <Suspense fallback={null}>
      <Stars radius={130} depth={60} count={45000} factor={5} saturation={0} fade speed={0.2} />
      </Suspense>
      <SceneWarRoom geoData={geo10} cfg={cfg} />
      </Canvas>
      </Suspense>
      </>
    )}

    {/* UI — toujours présent, léger */}
    <div style={ui.c}>
    {estGlobe && (
      <>
      {!decoupage && paysSurvolé && (() => {
        const entry = Object.values(PAYS).find(c => c.NAME === paysSurvolé);
        return (
          <div style={{
            ...ui.badge,
            color: entry?.couleur || '#00e5ff',
            borderColor: entry?.scan || 'rgba(0,229,255,0.3)'
          }}>
          {paysSurvolé}
          </div>
        );
      })()}
      {decoupage && (
        <div style={{ ...ui.badge, color: '#ff8800', borderColor: 'rgba(255,136,0,0.4)' }}>
        {decoupage.type === '4' ? '◈ DÉCOUPE 1/4' : '◈ DÉCOUPE 1/4 → 1/8'}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: '60px', left: '20px', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'all' }}>
      <button style={btnBase} onClick={actionDecouper4}>Découpe 1/4</button>
      <button style={btnBase} onClick={actionDecouper4puis8}>Découpe 1/4 puis 1/8</button>
      {decoupage && (
        <button style={{ ...btnBase, color: 'rgba(255,140,0,0.9)', borderColor: 'rgba(255,140,0,0.35)' }} onClick={actionReinit}>
        ↺ Réinitialiser
        </button>
      )}
      </div>
      {!decoupage && <div style={ui.ind}>double-clic → planisphère · clic sur un pays pour le voir</div>}
      </>
    )}
    {estMercator && (
      <>
      <button style={ui.btn} onClick={() => changerVue('globe')}>← Globe</button>
      <div style={ui.ind}>
      {paysSurvolé
        ? <><span style={{ color: '#00e5ff' }}>{paysSurvolé}</span>{Object.values(PAYS).find(c => c.NAME === paysSurvolé) ? ' — double-clic pour entrer' : ''}</>
        : 'clic → pays · double-clic → entrer (FR/IT/TH)'
      }
      </div>
      </>
    )}
    {estWarRoom && cfg && (
      <>
      <button style={ui.btn} onClick={() => changerVue('mercator')}>← Planisphère</button>
      <div style={{
        ...ui.badge,
        color: cfg.couleur,
        borderColor: cfg.scan,
        boxShadow: `0 0 8px ${cfg.scan}`
      }}>
      ▶ {cfg.label} — WAR ROOM
      </div>
      <div style={ui.ind}>drag + molette</div>
      </>
    )}
    </div>
    </div>
  );
}
