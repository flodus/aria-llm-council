// src/components/canvas/WarRoomMap.jsx
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Line } from '@react-three/drei'; // Drei est ton meilleur ami pour les néons

// 1. Outil mathématique (imprimé ici pour clarté, mais peut être importé)
// Version adaptée pour le morphing
const geoToWarRoom = (lat, lon, radius, uTransition) => {
    // Globe
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const spherePos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
                                        radius * Math.cos(phi),
                                        radius * Math.sin(phi) * Math.sin(theta)
    );

    // Plane XY (Standard Web Mercator simplifié)
    const planePos = new THREE.Vector3(
        (lon / 180) * (radius * Math.PI),
                                       (lat / 90) * (radius * Math.PI / 2),
                                       0.1 // Légère élévation pour ne pas clignoter
    );

    return new THREE.Vector3().lerpVectors(spherePos, planePos, uTransition);
};

// 2. Shaders inchangés pour le fond
const vertexShader = `
uniform float uTransition; uniform float uRadius; varying vec2 vUv;
void main() {
    vUv = uv;
    vec3 planePos = position;
    float lon = (uv.x * 2.0 - 1.0) * 3.14159265359;
    float lat = (uv.y - 0.5) * 3.14159265359;
    vec3 spherePos;
    spherePos.x = uRadius * cos(lat) * sin(lon);
    spherePos.y = uRadius * sin(lat);
    spherePos.z = uRadius * cos(lat) * cos(lon);
    vec3 finalPos = mix(spherePos, planePos, uTransition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture; varying vec2 vUv;
void main() { gl_FragColor = texture2D(uTexture, vUv); }
`;

export function WarRoomMap({ radius = 5, isPlanar = false }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const borderGroupRef = useRef();
    const highlightGroupRef = useRef();
    const [, getKeys] = useKeyboardControls();
    const [geoData, setGeoData] = useState(null);

    // 3. Charger le GeoJSON des frontières du monde
    useEffect(() => {
        fetch('/countries.geo.json') // Ton fichier léger dans public/
        .then(res => res.json())
        .then(data => setGeoData(data));
    }, []);

    // 4. Créer la Texture de Fond (Grille subtile) via Canvas
    const dynamicTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048; canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Fond Dégradé Sombre
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0a0d24'); gradient.addColorStop(1, '#050818');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grille Subtile (Data)
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.03)'; ctx.lineWidth = 1;
        for(let i=0; i<canvas.width; i+=50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
        for(let j=0; j<canvas.height; j+=50) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke(); }

        return new THREE.CanvasTexture(canvas);
    }, []);

    const uniforms = useMemo(() => ({
        uTransition: { value: 0 }, uRadius: { value: radius }, uTexture: { value: dynamicTexture },
    }), [radius, dynamicTexture]);

    // 5. Gérer les frontières (GeoJSON -> LineSegements)
    // C'est de la logique pure, on la met dans useMemo pour la performance
    const borderGeometry = useMemo(() => {
        if (!geoData) return null;
        const vertices = [];
        const radiusAdjusted = radius + 0.01; // Légèrement au-dessus du fond

        geoData.features.forEach(feature => {
            if (feature.geometry.type === "Polygon") {
                feature.geometry.coordinates.forEach(ring => {
                    ring.forEach((coord, i) => {
                        if (i < ring.length - 1) {
                            const p1 = geoToWarRoom(coord[1], coord[0], radiusAdjusted, 0); // Globe initial
                            const p2 = geoToWarRoom(ring[i+1][1], ring[i+1][0], radiusAdjusted, 0);
                            vertices.push(p1, p2);
                        }
                    });
                });
            }
        });
        return new THREE.BufferGeometry().setFromPoints(vertices);
    }, [geoData, radius]);

    // 6. Gérer les Highlights (La France et l'Italie, hardcodés pour le test)
    // Dans un vrai jeu, tu les extrairais du GeoJSON
    const FrancePoints = useMemo(() => [
        [-5, 48.5], [-4, 47], [0, 43], [3, 42.5], [6, 43.5], [7.5, 45], [7, 47.5], [6, 49], [3, 50], [0, 49], [-3, 50], [-5, 48.5]
    ], []); // Simplifié !
    const ItalyPoints = useMemo(() => [
        [12, 47], [14, 46], [16, 41], [18, 40], [17, 39], [15, 38], [12, 38], [10, 42], [10, 44.5], [12, 47]
    ], []); // Simplifié !

    const getHighlightLine = (points, uTransition) => {
        return points.map(coord => geoToWarRoom(coord[1], coord[0], radius + 0.05, uTransition));
    };

    useFrame((state, delta) => {
        if (!meshRef.current || !groupRef.current) return;
        const target = isPlanar ? 1.0 : 0.0;
        const currentTransition = meshRef.current.material.uniforms.uTransition.value;
        const newTransition = THREE.MathUtils.lerp(currentTransition, target, 0.05);
        meshRef.current.material.uniforms.uTransition.value = newTransition;

        // Mouvement clavier
        if (isPlanar) {
            const { forward, backward, left, right } = getKeys();
            const speed = 20 * delta;
            if (forward) groupRef.current.position.y -= speed;
            if (backward) groupRef.current.position.y += speed;
            if (left) groupRef.current.position.x += speed;
            if (right) groupRef.current.position.x -= speed;
        } else {
            groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        }

        // Mise à jour des frontières pour le morphing
        if(borderGroupRef.current && geoData){
            borderGroupRef.current.clear();
            // C'est coûteux de recalculer à chaque frame, mais nécessaire pour le morphing
            const vertices = [];
            const radiusAdjusted = radius + 0.01;
            geoData.features.forEach(feature => {
                if (feature.geometry.type === "Polygon") {
                    feature.geometry.coordinates.forEach(ring => {
                        ring.forEach((coord, i) => {
                            if (i < ring.length - 1) {
                                const p1 = geoToWarRoom(coord[1], coord[0], radiusAdjusted, newTransition);
                                const p2 = geoToWarRoom(ring[i+1][1], ring[i+1][0], radiusAdjusted, newTransition);
                                vertices.push(p1, p2);
                            }
                        });
                    });
                }
            });
            const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
            const material = new THREE.LineBasicMaterial({ color: '#2a2d3a', transparent: true, opacity: 0.5 });
            borderGroupRef.current.add(new THREE.LineSegments(geometry, material));
        }

        // Mise à jour des highlights pour le morphing
        if(highlightGroupRef.current){
            highlightGroupRef.current.clear();
            // France Néon Rose
            const france = getHighlightLine(FrancePoints, newTransition);
            // Drei `Line` gère le néon si on metlineWidth > 1
            // (Attention : le rendu néon "Bloom" doit être activé dans Scene.jsx pour briller vraiment)
            // Pour l'instant on fait juste des lignes larges et colorées
            const franceGeometry = new THREE.BufferGeometry().setFromPoints(france);
            const franceMaterial = new THREE.LineBasicMaterial({ color: '#ff1493', linewidth: 3 }); // Rose Fuchsia
            highlightGroupRef.current.add(new THREE.Line(franceGeometry, franceMaterial));

            // Italie Néon Vert
            const italy = getHighlightLine(ItalyPoints, newTransition);
            const italyGeometry = new THREE.BufferGeometry().setFromPoints(italy);
            const italyMaterial = new THREE.LineBasicMaterial({ color: '#32cd32', linewidth: 3 }); // Vert Lime
            highlightGroupRef.current.add(new THREE.Line(italyGeometry, italyMaterial));
        }
    });

    return (
        <group ref={groupRef}>
        {/* 1. Le Fond (Planet mesh) */}
        <mesh ref={meshRef}>
        <planeGeometry args={[radius * 2 * Math.PI, radius * Math.PI, 128, 64]} />
        <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} side={THREE.DoubleSide} />
        </mesh>

        {/* 2. La Couche Frontières Grises */}
        <group ref={borderGroupRef} />

        {/* 3. La Couche Néon Highlights */}
        <group ref={highlightGroupRef} />

        {/* Support noir mode plan */}
        {isPlanar && (
            <mesh position={[0, 0, -0.2]}>
            <planeGeometry args={[radius * 2 * Math.PI + 2, radius * Math.PI + 2]} />
            <meshStandardMaterial color="#020202" />
            </mesh>
        )}
        </group>
    );
}
