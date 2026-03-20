import React, { useState } from 'react';
import { Scene } from './components/canvas/Scene';
import './App.css';

function App() {
  const [isPlanar, setIsPlanar] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
    {/* Overlay UI */}
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 100,
      pointerEvents: 'none' // Pour ne pas bloquer le clic sur le canvas
    }}>
    <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>Planète Explorateur</h1>
    <button
    onClick={() => setIsPlanar(!isPlanar)}
    style={{
      marginTop: '10px',
      padding: '10px 20px',
      pointerEvents: 'auto',
      cursor: 'pointer',
      background: '#fff',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 'bold'
    }}
    >
    {isPlanar ? 'RETOUR AU GLOBE' : 'VOIR LE PLANISPHÈRE'}
    </button>
    </div>

    {/* Le rendu 3D */}
    <Scene isPlanar={isPlanar} />
    </div>
  );
}

export default App;
