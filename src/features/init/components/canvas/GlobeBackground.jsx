// src/features/init/components/canvas/GlobeBackground.jsx
//
// Globe 3D de fond pour NameScreen — rotation automatique, frontières GeoJSON.
// Pas de contrôles utilisateur (pointerEvents: none).

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const RADIUS = 5;

function GlobeMesh() {
    const groupRef = useRef();
    const [geoData, setGeoData] = useState(null);

    // Chargement GeoJSON — chemin compatible GitHub Pages
    useEffect(() => {
        const base = import.meta.env.BASE_URL.replace(/\/$/, '');
        fetch(`${base}/countries-110m.geo.json`)
            .then(r => r.json())
            .then(setGeoData)
            .catch(() => {});
    }, []);

    // Texture cyber-grille canvas
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(512, 256, 10, 512, 256, 600);
        grad.addColorStop(0, '#0d1535');
        grad.addColorStop(1, '#040810');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);
        ctx.strokeStyle = 'rgba(0,180,255,0.06)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 1024; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        }
        for (let j = 0; j < 512; j += 32) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(1024, j); ctx.stroke();
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    // Géométrie frontières GeoJSON
    const borderGeom = useMemo(() => {
        if (!geoData) return null;
        const points = [];
        geoData.features.forEach(feat => {
            const type = feat.geometry.type;
            const polys = type === 'Polygon'
                ? [feat.geometry.coordinates]
                : feat.geometry.coordinates;
            polys.forEach(poly =>
                poly.forEach(ring => {
                    for (let i = 0; i < ring.length - 1; i++) {
                        points.push(
                            new THREE.Vector3(ring[i][0], ring[i][1], 0),
                            new THREE.Vector3(ring[i + 1][0], ring[i + 1][1], 0)
                        );
                    }
                })
            );
        });
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [geoData]);

    // Uniforms partagés (sphère fixe, uTransition = 0)
    const uniforms = useMemo(() => ({
        uTransition: { value: 0 },
        uRadius:     { value: RADIUS },
        uTexture:    { value: texture },
    }), [texture]);

    // Rotation automatique
    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
    });

    const vertexShader = `
        uniform float uTransition;
        uniform float uRadius;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            float lon = (uv.x * 2.0 - 1.0) * 3.14159265;
            float lat = (uv.y - 0.5) * 3.14159265;
            vec3 sph = vec3(uRadius * cos(lat) * sin(lon), uRadius * sin(lat), uRadius * cos(lat) * cos(lon));
            gl_Position = projectionMatrix * modelViewMatrix * vec4(sph, 1.0);
        }
    `;

    const borderVertexShader = `
        uniform float uTransition;
        uniform float uRadius;
        void main() {
            float lon = position.x * (3.14159265 / 180.0);
            float lat = position.y * (3.14159265 / 180.0);
            float r = uRadius + 0.03;
            vec3 sph = vec3(r * cos(lat) * sin(lon), r * sin(lat), r * cos(lat) * cos(lon));
            gl_Position = projectionMatrix * modelViewMatrix * vec4(sph, 1.0);
        }
    `;

    return (
        <group ref={groupRef}>
            {/* Surface planète */}
            <mesh>
                <planeGeometry args={[RADIUS * 2 * Math.PI, RADIUS * Math.PI, 64, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader="uniform sampler2D uTexture; varying vec2 vUv; void main() { gl_FragColor = texture2D(uTexture, vUv); }"
                    uniforms={uniforms}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Frontières GeoJSON cyan */}
            {borderGeom && (
                <lineSegments geometry={borderGeom}>
                    <shaderMaterial
                        uniforms={uniforms}
                        vertexShader={borderVertexShader}
                        fragmentShader="void main() { gl_FragColor = vec4(0.0, 0.65, 1.0, 0.35); }"
                        transparent
                    />
                </lineSegments>
            )}
        </group>
    );
}

export default function GlobeBackground() {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none',
        }}>
            <Canvas
                camera={{ position: [0, 0, 14], fov: 45 }}
                gl={{ alpha: true, antialias: true }}
                style={{ width: '100%', height: '100%' }}
            >
                <Stars radius={120} depth={60} count={6000} factor={3} fade />
                <ambientLight intensity={0.4} />
                <GlobeMesh />
            </Canvas>
        </div>
    );
}
