
// ==================== src/App.jsx ====================
import { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GlobeView } from './components/views/GlobeView';
import { MercatorView } from './components/views/MercatorView';

function CameraResetter({ viewMode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (viewMode === 'globe') {
      camera.position.set(0, 1, 8);
    } else {
      camera.position.set(0, 0, 5);
    }
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [viewMode, camera]);

  return null;
}

const buttonBaseStyle = {
  position: 'absolute',
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  zIndex: 1000,
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
};

export function App() {
  const [viewMode, setViewMode] = useState('globe');
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
    <button
    style={{
      ...buttonBaseStyle,
      top: '20px',
      left: '20px',
      backgroundColor: viewMode === 'globe' ? '#4a7a4a' : '#1a3f6a',
    }}
    onClick={() => setViewMode('globe')}
    >
    🌍 GLOBE
    </button>

    <button
    style={{
      ...buttonBaseStyle,
      top: '20px',
      right: '20px',
      backgroundColor: viewMode === 'mercator' ? '#4a7a4a' : '#1a3f6a',
    }}
    onClick={() => setViewMode('mercator')}
    >
    🗺️ MERCATOR
    </button>

    <button
    style={{
      ...buttonBaseStyle,
      bottom: '20px',
      right: '20px',
      backgroundColor: rotationEnabled ? '#8a4a4a' : '#4a4a4a',
    }}
    onClick={() => setRotationEnabled(!rotationEnabled)}
    >
    {rotationEnabled ? '⏸️' : '▶️'}
    </button>

    <Canvas>
    <CameraResetter viewMode={viewMode} />
    <ambientLight intensity={0.5} />

    {viewMode === 'globe' ? (
      <GlobeView
      selectedCountry={selectedCountry}
      onCountryClick={setSelectedCountry}
      rotationEnabled={rotationEnabled}
      />
    ) : (
      <MercatorView
      selectedCountry={selectedCountry}
      onCountryClick={setSelectedCountry}
      />
    )}

    <OrbitControls
    enableZoom={true}
    enablePan={viewMode === 'mercator'}
    enableRotate={viewMode === 'globe'}
    screenSpacePanning={true}
    />
    </Canvas>

    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      color: 'white',
      backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '15px',
          borderRadius: '8px',
          border: selectedCountry ? '2px solid #ff00ff' : '2px solid #4a7a4a'
    }}>
    <div style={{ fontSize: 18, marginBottom: '8px' }}>
    {viewMode === 'globe' ? '🌍 GLOBE' : '🗺️ MERCATOR'}
    </div>
    {viewMode === 'globe' && (
      <div style={{ fontSize: 12, color: '#888' }}>
      Rotation: {rotationEnabled ? 'auto' : 'manuelle'}
      </div>
    )}
    {selectedCountry && (
      <div style={{
        color: '#ff00ff',
        marginTop: '8px',
        padding: '4px 8px',
        backgroundColor: '#ff00ff20',
        borderRadius: '4px'
      }}>
      ✓ {selectedCountry.name}
      </div>
    )}
    </div>
    </div>
  );
}

export default App;
