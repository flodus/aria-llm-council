// ==================== src/components/views/GlobeView.jsx ====================
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { WORLD_DATA } from '../../data/world';
import { createGlobeTexture } from '../../utils/globeTexture';

function uvToSphere(u, v, radius = 2.0) {
  const lon = (u - 0.5) * Math.PI * 2;
  const lat = (0.5 - v) * Math.PI;

  return {
    x: radius * Math.cos(lat) * Math.cos(lon),
    y: radius * Math.sin(lat),
    z: radius * Math.cos(lat) * Math.sin(lon),
    lon,
    lat
  };
}

function ContinentWireframe({ continent }) {
  const points = useMemo(() => {
    return continent.path.map(point => {
      const u = point[0];
      const v = point[1];
      const { x, y, z } = uvToSphere(u, v, 2.02); // Légèrement au-dessus
      return new THREE.Vector3(x, y, z);
    });
  }, [continent]);

  // Créer une ligne qui suit le contour du continent
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    points.forEach(p => {
      vertices.push(p.x, p.y, p.z);
    });
    // Revenir au premier point pour fermer la boucle
    vertices.push(points[0].x, points[0].y, points[0].z);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [points]);

  return (
    <line geometry={lineGeometry}>
    <lineBasicMaterial color={continent.color} linewidth={3} />
    </line>
  );
}

function InvisiblePointField({ continent, onClick }) {
  const points = useMemo(() => {
    return continent.path;
  }, [continent]);

  return (
    <group>
    {points.map((point, index) => {
      const u = point[0];
      const v = point[1];

      const { x, y, z } = uvToSphere(u, v, 2.05);

      return (
        <mesh
        key={`${continent.id}-${index}`}
        position={[x, y, z]}
        onClick={() => {
          console.log(`🟢 Clic sur ${continent.name} - point ${index}`);
          console.log(`   UV: (${u.toFixed(3)}, ${v.toFixed(3)})`);
          console.log(`   Position: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`);
          onClick(continent);
        }}
        >
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ff00ff" opacity={1} transparent={false} />
        </mesh>
      );
    })}
    </group>
  );
}

export function GlobeView({ selectedCountry, onCountryClick, rotationEnabled }) {
  const globeRef = useRef();
  const texture = useMemo(() => createGlobeTexture(), []);

  useFrame(() => {
    if (globeRef.current && rotationEnabled) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={globeRef}>
    {/* Globe normal */}
    <mesh>
    <sphereGeometry args={[2, 64, 32]} />
    <meshStandardMaterial map={texture} flatShading={true} />
    </mesh>

    {/* Contours des continents en FIL DE FER */}
    {WORLD_DATA.continents.map(continent => (
      <ContinentWireframe key={`wire-${continent.id}`} continent={continent} />
    ))}

    {/* Points cliquables */}
    {WORLD_DATA.continents.map(continent => (
      <InvisiblePointField
      key={continent.id}
      continent={continent}
      onClick={onCountryClick}
      />
    ))}
    </group>
  );
}
