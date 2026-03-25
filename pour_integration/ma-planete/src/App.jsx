// src/App.jsx
import React, { useState, useRef, lazy, Suspense } from 'react';
import { ExplorateurMonde } from './views/ExplorateurMonde';
import InitScreenLayout from './components/InitScreenLayout';
import PlanetCanvas from './components/PlanetCanvas';
// Supprime l'import statique de MorphingCanvas
// import MorphingCanvas from './components/MorphingCanvas';
import { InitScreenInner } from '../../aria/src/features/init/InitScreen';
import RadioPlayer from './components/RadioPlayer'

// Import dynamique
const MorphingCanvas = lazy(() => import('./components/MorphingCanvas'));

export default function App() {
  const [worldName, setWorldName] = useState('');
  const [phase,     setPhase]     = useState('init');
  const [morphPret, setMorphPret] = useState(false);
  const overlayRef = useRef(null);

  const handleLancement = () => {
    setMorphPret(true);
  };

  const handleMorphFini = () => {
    setPhase('attente');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'opacity 0.85s ease';
        overlayRef.current.style.opacity = '0';
      }
    }));
    setTimeout(() => setPhase('globe'), 3000);
  };

  // Le contenu principal change selon la phase
  const getMainContent = () => {
    if (phase === 'globe') {
      return <ExplorateurMonde initialVue="globe" />;
    }
    if (phase === 'attente') {
      return (
        <>
        <ExplorateurMonde initialVue="mercator" sansTransition />
        <div ref={overlayRef} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(2,2,8,1)',
              opacity: 1,
              pointerEvents: 'none',
        }} />
        </>
      );
    }
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <InitScreenLayout background={<PlanetCanvas />}>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '100vh' }}>
      <InitScreenInner
      worldName={worldName}
      setWorldName={setWorldName}
      onLaunchLocal={handleLancement}
      onLaunchAI={handleLancement}
      hasApiKeys={false}
      onRefreshKeys={() => {}}
      generatingBackground={(progress) => (
        <Suspense fallback={
          <div style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#020208',
            color: '#c8a44a',
            fontFamily: 'monospace',
            fontSize: '0.85rem'
          }}>
          CHARGEMENT DE LA CARTE 3D...
          </div>
        }>
        <MorphingCanvas
        progress={progress}
        morphPret={morphPret}
        onMorphFini={handleMorphFini}
        />
        </Suspense>
      )}
      />
      </div>
      </InitScreenLayout>
      </div>
    );
  };

  return (
    <>
    {getMainContent()}
    <RadioPlayer />  {/* RadioPlayer est TOUJOURS monté */}
    </>
  );
}
