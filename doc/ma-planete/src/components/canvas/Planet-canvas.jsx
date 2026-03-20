// src/components/canvas/Planet.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. Shaders (identiques pour le morphing, mais acceptent une texture)
const vertexShader = `
uniform float uTransition;
uniform float uRadius;
varying vec2 vUv;

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
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(uTexture, vUv);
}
`;

export function Planet({ radius = 5, isPlanar = false }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [, getKeys] = useKeyboardControls();

    // 2. CRÉATION DU CANVAS DYNAMIQUE
    const dynamicTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048; // Haute résolution
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // --- DESSIN DE LA CARTE ---

        // A. Fond (Océan)
        ctx.fillStyle = '#102a44';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // B. Génération de "continents" aléatoires simples
        ctx.fillStyle = '#2d5a27';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const sizeX = Math.random() * 300 + 50;
        const sizeY = Math.random() * 200 + 50;

        ctx.beginPath();
        ctx.ellipse(x, y, sizeX, sizeY, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    // C. Ajout de détails (Grille de coordonnées par exemple)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    for(let i=0; i<canvas.width; i+=canvas.width/12) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let j=0; j<canvas.height; j+=canvas.height/6) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    // D. Texte dynamique
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("SECTEUR ALPHA - PROJET PLANÈTE", canvas.width / 2, 100);

    // Création de la texture Three.js à partir du canvas
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
    }, []);

    const uniforms = useMemo(() => ({
        uTransition: { value: 0 },
        uRadius: { value: radius },
        uTexture: { value: dynamicTexture },
    }), [radius, dynamicTexture]);

    useFrame((state, delta) => {
        if (!meshRef.current || !groupRef.current) return;

        // Animation transition
        const targetTransition = isPlanar ? 1.0 : 0.0;
        meshRef.current.material.uniforms.uTransition.value = THREE.MathUtils.lerp(
            meshRef.current.material.uniforms.uTransition.value,
            targetTransition,
            0.05
        );

        // Mouvement clavier en mode Plan
        if (isPlanar) {
            const { forward, backward, left, right } = getKeys();
            const moveSpeed = 15 * delta;
            if (forward)  groupRef.current.position.y -= moveSpeed;
            if (backward) groupRef.current.position.y += moveSpeed;
            if (left)     groupRef.current.position.x += moveSpeed;
            if (right)    groupRef.current.position.x -= moveSpeed;
        } else {
            groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        }
    });

    return (
        <group ref={groupRef}>
        <mesh ref={meshRef}>
        <planeGeometry args={[radius * 2 * Math.PI, radius * Math.PI, 128, 64]} />
        <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        />
        </mesh>

        {isPlanar && (
            <mesh position={[0, 0, -0.2]}>
            <planeGeometry args={[radius * 2 * Math.PI + 2, radius * Math.PI + 2]} />
            <meshStandardMaterial color="#050505" />
            </mesh>
        )}
        </group>
    );
}
