#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Création de l'arborescence Low-Poly Planet${NC}"

# Création du projet Vite si nécessaire
if [ ! -d "src" ]; then
  echo -e "${BLUE}📦 Création du projet Vite React...${NC}"
  npm create vite@latest . -- --template react
fi

# Nettoyage des fichiers par défaut
echo -e "${BLUE}🧹 Nettoyage...${NC}"
rm -f src/App.jsx src/App.css src/index.css
rm -rf src/assets

# Création de l'arborescence
echo -e "${BLUE}📁 Création de l'arborescence...${NC}"

# Dossier principal components et ses sous-dossiers
mkdir -p src/components/ui
mkdir -p src/components/planet
mkdir -p src/components/views

# Dossier data
mkdir -p src/data

# Dossier utils
mkdir -p src/utils

# Dossier styles
mkdir -p src/styles

# Fichiers de données
echo -e "${GREEN}   📄 Création src/data/continents.js${NC}"
cat > src/data/continents.js << 'EOF'
export const CONTINENTS = [
  {
    id: 'amerique-nord',
    name: 'Amérique du Nord',
    color: '#6b8e6b',
    borderColor: '#2a4a2a',
    coordinates: {
      x: 0.25, y: 0.65,  // X = Est-Ouest, Y = Nord-Sud
      size: 0.22
    },
    countries: [
      {
        id: 'canada',
        name: 'Canada',
        color: '#7b9e7b',
        path: [[0.2,0.7], [0.3,0.72], [0.32,0.68], [0.28,0.65], [0.22,0.67], [0.2,0.7]]
      },
      {
        id: 'usa',
        name: 'États-Unis',
        color: '#8bae8b',
        path: [[0.24,0.63], [0.34,0.64], [0.36,0.6], [0.3,0.58], [0.24,0.6], [0.24,0.63]]
      },
      {
        id: 'mexique',
        name: 'Mexique',
        color: '#5a8e5a',
        path: [[0.26,0.58], [0.32,0.59], [0.34,0.55], [0.28,0.54], [0.26,0.58]]
      }
    ]
  },
  {
    id: 'europe-afrique',
    name: 'Europe-Afrique',
    color: '#5a8e5a',
    borderColor: '#2a4a2a',
    coordinates: {
      x: 0.52, y: 0.55,
      size: 0.3
    },
    countries: [
      {
        id: 'europe',
        name: 'Europe',
        color: '#6b9e6b',
        path: [[0.48,0.68], [0.55,0.7], [0.58,0.65], [0.52,0.62], [0.46,0.64], [0.48,0.68]]
      },
      {
        id: 'afrique-nord',
        name: 'Afrique du Nord',
        color: '#7baa7b',
        path: [[0.5,0.58], [0.6,0.6], [0.62,0.52], [0.54,0.5], [0.48,0.54], [0.5,0.58]]
      },
      {
        id: 'afrique-sud',
        name: 'Afrique du Sud',
        color: '#4a7e4a',
        path: [[0.52,0.42], [0.64,0.44], [0.66,0.35], [0.56,0.33], [0.5,0.38], [0.52,0.42]]
      }
    ]
  },
  {
    id: 'asie-oceanie',
    name: 'Asie-Océanie',
    color: '#4a7e4a',
    borderColor: '#2a4a2a',
    coordinates: {
      x: 0.78, y: 0.5,
      size: 0.28
    },
    countries: [
      {
        id: 'asie',
        name: 'Asie',
        color: '#5a8e5a',
        path: [[0.72,0.62], [0.82,0.65], [0.85,0.58], [0.78,0.55], [0.7,0.58], [0.72,0.62]]
      },
      {
        id: 'asie-sud',
        name: 'Asie du Sud',
        color: '#6b9e6b',
        path: [[0.74,0.52], [0.84,0.54], [0.86,0.46], [0.76,0.44], [0.72,0.48], [0.74,0.52]]
      },
      {
        id: 'oceanie',
        name: 'Océanie',
        color: '#3a6e3a',
        path: [[0.8,0.38], [0.88,0.4], [0.9,0.32], [0.82,0.3], [0.78,0.34], [0.8,0.38]]
      }
    ]
  }
];
EOF

# Fichiers utils
echo -e "${GREEN}   📄 Création src/utils/geometry.js${NC}"
cat > src/utils/geometry.js << 'EOF'
import * as THREE from 'three';

export function createCountryShape(path, scale = 1) {
  const shape = new THREE.Shape();
  path.forEach((point, i) => {
    const x = (point[0] - 0.5) * 8 * scale;
    const y = (point[1] - 0.5) * 4 * scale;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return shape;
}

export function getContourEdges(shape) {
  return new THREE.EdgesGeometry(new THREE.ShapeGeometry(shape));
}
EOF

echo -e "${GREEN}   📄 Création src/utils/textures.js${NC}"
cat > src/utils/textures.js << 'EOF'
import * as THREE from 'three';

export function createOceanTexture(width = 2048, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#1a3f6a');
  gradient.addColorStop(0.5, '#2a4f7a');
  gradient.addColorStop(1, '#1a3f6a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return new THREE.CanvasTexture(canvas);
}
EOF

# Composants UI
echo -e "${GREEN}   📄 Création src/components/ui/Button.jsx${NC}"
cat > src/components/ui/Button.jsx << 'EOF'
import React from 'react';

export function Button({ onClick, children, style, disabled = false }) {
  return (
    <button onClick={onClick} style={style} disabled={disabled}>
      {children}
    </button>
  );
}
EOF

echo -e "${GREEN}   📄 Création src/components/ui/InfoPanel.jsx${NC}"
cat > src/components/ui/InfoPanel.jsx << 'EOF'
import React from 'react';

export function InfoPanel({ viewMode, selectedCountry, rotationEnabled, continents }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      color: 'white',
      backgroundColor: 'rgba(10,20,30,0.95)',
      padding: '20px',
      borderRadius: '8px',
      border: selectedCountry ? '2px solid #ff00ff' : '2px solid #4a7a4a',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      <div style={{ fontSize: '20px', color: '#8ab88a' }}>⬟ LOW-POLY WORLD</div>
      <div style={{ marginTop: '10px' }}>
        {viewMode === 'globe' ? '🌍 GLOBE 3D' : '🗺️ CARTE MERCATOR'}
      </div>
      {viewMode === 'mercator' && (
        <div style={{ color: '#8ab88a', fontSize: '12px', marginTop: '5px' }}>
          ←→ X: Est-Ouest • ↑↓ Y: Nord-Sud
        </div>
      )}
      {selectedCountry && (
        <div style={{
          marginTop: '10px',
          padding: '5px',
          backgroundColor: '#ff00ff20',
          border: '1px solid #ff00ff',
          color: '#ff88ff'
        }}>
          ✓ {selectedCountry.name}
        </div>
      )}
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#4a7a4a' }}>
        {continents.reduce((acc, c) => acc + c.countries.length, 0)} pays
      </div>
    </div>
  );
}
EOF

echo -e "${GREEN}   📄 Création src/components/ui/Controls.jsx${NC}"
cat > src/components/ui/Controls.jsx << 'EOF'
import React from 'react';
import { OrbitControls } from '@react-three/drei';

export function Controls({ viewMode }) {
  if (viewMode === 'globe') {
    return (
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        rotateSpeed={0.8}
        maxDistance={15}
        minDistance={3}
      />
    );
  }

  return (
    <OrbitControls
      enableZoom={true}
      enablePan={true}
      enableRotate={false}
      zoomSpeed={1.5}
      panSpeed={1.5}
      screenSpacePanning={true}
      maxDistance={20}
      minDistance={3}
    />
  );
}
EOF

# Composants Planet
echo -e "${GREEN}   📄 Création src/components/planet/Country.jsx${NC}"
cat > src/components/planet/Country.jsx << 'EOF'
import React, { useState } from 'react';
import * as THREE from 'three';
import { createCountryShape, getContourEdges } from '../../utils/geometry';

export function Country({ country, isSelected, onClick, isGlobeMode = false }) {
  const [isHovered, setIsHovered] = useState(false);

  const shape = createCountryShape(country.path);
  const edges = getContourEdges(shape);

  if (isGlobeMode) {
    return (
      <group
        onClick={(e) => { e.stopPropagation(); onClick(country); }}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <mesh position={[0, 0, 0.05]} castShadow receiveShadow>
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial
            color={isSelected ? "#ff00ff" : (isHovered ? "#00ffff" : country.color)}
            emissive={isSelected ? "#330033" : "#000000"}
            roughness={0.6}
            metalness={0.1}
            flatShading={true}
          />
        </mesh>
        <lineSegments position={[0, 0, 0.06]} geometry={edges}>
          <lineBasicMaterial color="#000000" linewidth={2} />
        </lineSegments>
      </group>
    );
  }

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onClick(country); }}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <mesh position={[0, 0, 0.1]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial
          color={isSelected ? "#ff00ff" : (isHovered ? "#00ffff" : country.color)}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments position={[0, 0, 0.11]} geometry={edges}>
        <lineBasicMaterial color="#000000" linewidth={2} />
      </lineSegments>
    </group>
  );
}
EOF

echo -e "${GREEN}   📄 Création src/components/planet/Continent.jsx${NC}"
cat > src/components/planet/Continent.jsx << 'EOF'
import React from 'react';
import { Country } from './Country';

export function Continent({ continent, selectedCountry, onCountryClick, isGlobeMode }) {
  return (
    <group>
      {continent.countries.map(country => (
        <Country
          key={country.id}
          country={country}
          isSelected={selectedCountry?.id === country.id}
          onClick={onCountryClick}
          isGlobeMode={isGlobeMode}
        />
      ))}
    </group>
  );
}
EOF

echo -e "${GREEN}   📄 Création src/components/planet/Ocean.jsx${NC}"
cat > src/components/planet/Ocean.jsx << 'EOF'
import React, { useMemo } from 'react';
import { createOceanTexture } from '../../utils/textures';

export function Ocean({ isGlobeMode }) {
  const texture = useMemo(() => createOceanTexture(), []);

  if (isGlobeMode) {
    return (
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2, 48, 32]} />
        <meshStandardMaterial
          map={texture}
          color="#1a3f6a"
          emissive="#0a1f3a"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[8, 4]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
EOF

echo -e "${GREEN}   📄 Création src/components/planet/Atmosphere.jsx${NC}"
cat > src/components/planet/Atmosphere.jsx << 'EOF'
import React from 'react';
import * as THREE from 'three';

export function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.1, 48, 32]} />
      <meshPhongMaterial
        color="#2a4f7a"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </mesh>
  );
}
EOF

# Composants Views
echo -e "${GREEN}   📄 Création src/components/views/GlobeView.jsx${NC}"
cat > src/components/views/GlobeView.jsx << 'EOF'
import React, { useRef, useFrame } from 'react';
import { Ocean } from '../planet/Ocean';
import { Continent } from '../planet/Continent';
import { Atmosphere } from '../planet/Atmosphere';

export function GlobeView({ continents, selectedCountry, onCountryClick, rotationEnabled }) {
  const globeRef = useRef();

  useFrame(() => {
    if (globeRef.current && rotationEnabled) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={globeRef}>
      <Ocean isGlobeMode={true} />
      {continents.map(continent => (
        <Continent
          key={continent.id}
          continent={continent}
          selectedCountry={selectedCountry}
          onCountryClick={onCountryClick}
          isGlobeMode={true}
        />
      ))}
      <Atmosphere />
    </group>
  );
}
EOF

echo -e "${GREEN}   📄 Création src/components/views/MercatorView.jsx${NC}"
cat > src/components/views/MercatorView.jsx << 'EOF'
import React from 'react';
import { Ocean } from '../planet/Ocean';
import { Continent } from '../planet/Continent';

export function MercatorView({ continents, selectedCountry, onCountryClick }) {
  return (
    <group>
      <Ocean isGlobeMode={false} />
      {continents.map(continent => (
        <Continent
          key={continent.id}
          continent={continent}
          selectedCountry={selectedCountry}
          onCountryClick={onCountryClick}
          isGlobeMode={false}
        />
      ))}
    </group>
  );
}
EOF

# Fichier principal App.jsx
echo -e "${GREEN}   📄 Création src/App.jsx${NC}"
cat > src/App.jsx << 'EOF'
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CONTINENTS } from './data/continents';
import { GlobeView } from './components/views/GlobeView';
import { MercatorView } from './components/views/MercatorView';
import { Controls } from './components/ui/Controls';
import { InfoPanel } from './components/ui/InfoPanel';
import { Button } from './components/ui/Button';

const buttonContainerStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  display: 'flex',
  gap: '10px',
  zIndex: 1000,
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease'
};

export function App() {
  const [viewMode, setViewMode] = useState('globe');
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    console.log('✅ Pays cliqué:', country.name);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={buttonContainerStyle}>
        <Button
          style={{
            ...buttonStyle,
            backgroundColor: viewMode === 'globe' ? '#4a7a4a' : '#1a3f6a',
          }}
          onClick={() => setViewMode('globe')}
        >
          🌍 Globe 3D
        </Button>
        <Button
          style={{
            ...buttonStyle,
            backgroundColor: viewMode === 'mercator' ? '#4a7a4a' : '#1a3f6a',
          }}
          onClick={() => setViewMode('mercator')}
        >
          🗺️ Mercator
        </Button>
        <Button
          style={{
            ...buttonStyle,
            backgroundColor: rotationEnabled ? '#8a4a4a' : '#4a4a4a',
            opacity: viewMode === 'mercator' ? 0.5 : 1,
          }}
          onClick={() => viewMode === 'globe' && setRotationEnabled(!rotationEnabled)}
          disabled={viewMode === 'mercator'}
        >
          {rotationEnabled && viewMode === 'globe' ? '⏸️ Pause' : '▶️ Rotation'}
        </Button>
      </div>

      <Canvas
        camera={{ position: viewMode === 'globe' ? [0, 0, 8] : [0, 0, 8] }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {viewMode === 'globe' ? (
          <GlobeView
            continents={CONTINENTS}
            selectedCountry={selectedCountry}
            onCountryClick={handleCountryClick}
            rotationEnabled={rotationEnabled}
          />
        ) : (
          <MercatorView
            continents={CONTINENTS}
            selectedCountry={selectedCountry}
            onCountryClick={handleCountryClick}
          />
        )}

        <Controls viewMode={viewMode} />
      </Canvas>

      <InfoPanel
        viewMode={viewMode}
        selectedCountry={selectedCountry}
        rotationEnabled={rotationEnabled}
        continents={CONTINENTS}
      />
    </div>
  );
}

export default App;
EOF

# Fichier main.jsx
echo -e "${GREEN}   📄 Création src/main.jsx${NC}"
cat > src/main.jsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Fichier CSS global
echo -e "${GREEN}   📄 Création src/styles/global.css${NC}"
cat > src/styles/global.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

button {
  font-family: inherit;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
EOF

# Installation des dépendances
echo -e "${BLUE}📦 Installation des dépendances...${NC}"
npm install three @react-three/fiber @react-three/drei

echo -e "${GREEN}✅ Arborescence créée avec succès !${NC}"
echo -e "${BLUE}📁 Structure finale :${NC}"
tree src -I node_modules --dirsfirst

echo -e "${GREEN}🚀 Pour lancer l'application :${NC}"
echo -e "   npm run dev"
