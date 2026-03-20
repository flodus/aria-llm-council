// ==================== src/components/views/MercatorView.jsx ====================
import { useMemo } from 'react';
import * as THREE from 'three';
import { WORLD_DATA } from '../../data/world';

export function MercatorView({ selectedCountry, onCountryClick }) {
  const oceanTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a3f6a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Fonction pour gérer les clics sur le plan (partout)
  const handlePlaneClick = (e) => {
    const point = e.point;
    console.log(`🗺️ MERCATOR - Clic sur le plan`);
    console.log(`   Coordonnées: (${point.x.toFixed(3)}, ${point.y.toFixed(3)}, ${point.z.toFixed(3)})`);
    console.log(`   X (Est-Ouest): ${point.x.toFixed(3)}`);
    console.log(`   Y (Nord-Sud): ${point.y.toFixed(3)}`);
    console.log(`   Z (profondeur): ${point.z.toFixed(3)}`);
  };

  return (
    <group>
    {/* Plan cliquable partout */}
    <mesh position={[0, 0, 0]} onClick={handlePlaneClick}>
    <planeGeometry args={[5, 2.5]} />
    <meshBasicMaterial map={oceanTexture} side={THREE.DoubleSide} />
    </mesh>

    {/* Continents cliquables */}
    {WORLD_DATA.continents.map(continent => {
      const shape = new THREE.Shape();
      const points = [];

      continent.path.forEach((point, i) => {
        const x = (point[0] - 0.5) * 5;
        const y = (0.5 - point[1]) * 2.5;
        points.push({x, y});
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
        shape.closePath();

        const geometry = new THREE.ShapeGeometry(shape);
        const isSelected = selectedCountry?.id === continent.id;

        return (
          <mesh
          key={continent.id}
          geometry={geometry}
          position={[0, 0, 0.1]}
          onClick={(e) => {
            // Empêcher le clic de se propager au plan
            e.stopPropagation();
            const point = e.point;
            console.log(`🔵 MERCATOR - Clic sur ${continent.name}`);
            console.log(`   Coordonnées: (${point.x.toFixed(3)}, ${point.y.toFixed(3)}, ${point.z.toFixed(3)})`);
            console.log(`   X (Est-Ouest): ${point.x.toFixed(3)}`);
            console.log(`   Y (Nord-Sud): ${point.y.toFixed(3)}`);
            onCountryClick(continent);
          }}
          >
          <meshBasicMaterial
          color={isSelected ? '#ff00ff' : continent.color}
          side={THREE.DoubleSide}
          />
          </mesh>
        );
    })}

    {/* Contours noirs */}
    {WORLD_DATA.continents.map(continent => {
      const shape = new THREE.Shape();
      continent.path.forEach((point, i) => {
        const x = (point[0] - 0.5) * 5;
        const y = (0.5 - point[1]) * 2.5;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
        shape.closePath();

        const edges = new THREE.EdgesGeometry(new THREE.ShapeGeometry(shape));

        return (
          <lineSegments key={`border-${continent.id}`} geometry={edges} position={[0, 0, 0.2]}>
          <lineBasicMaterial color="#000000" linewidth={2} />
          </lineSegments>
        );
    })}
    </group>
  );
}
