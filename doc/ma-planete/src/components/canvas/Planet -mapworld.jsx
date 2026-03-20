// src/components/canvas/Planet.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. Définition des Shaders (Morphing entre Sphère et Plan XY)
const vertexShader = `
uniform float uTransition; // 0 = Sphère, 1 = Plan
uniform float uRadius;
varying vec2 vUv;

void main() {
    vUv = uv;

    // A. Position Plan (XY par défaut dans Three.js PlaneGeometry)
    vec3 planePos = position;

    // B. Calcul de la position sphérique
    // uv.x (0->1) devient la longitude (-PI->PI)
    // uv.y (0->1) devient la latitude (-PI/2->PI/2)
    float lon = (uv.x * 2.0 - 1.0) * 3.14159265359;
    float lat = (uv.y - 0.5) * 3.14159265359;

    vec3 spherePos;
    // On oriente la sphère pour que le centre de la texture soit face à l'axe Z
    spherePos.x = uRadius * cos(lat) * sin(lon);
    spherePos.y = uRadius * sin(lat);
    spherePos.z = uRadius * cos(lat) * cos(lon);

    // C. Interpolation (Morphing)
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

export function Planet({ radius = 5, isPlanar = false, textureUrl }) {
    const meshRef = useRef();
    const groupRef = useRef();

    // Accès aux touches du clavier définies dans Scene.jsx (KeyboardControls)
    const [, getKeys] = useKeyboardControls();

    // Chargement de la texture
    const texture = useLoader(THREE.TextureLoader, textureUrl);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const uniforms = useMemo(() => ({
        uTransition: { value: 0 },
        uRadius: { value: radius },
        uTexture: { value: texture },
    }), [radius, texture]);

    useFrame((state, delta) => {
        if (!meshRef.current || !groupRef.current) return;

        // 1. Animation du morphing (Transition 0 <-> 1)
        const targetTransition = isPlanar ? 1.0 : 0.0;
        meshRef.current.material.uniforms.uTransition.value = THREE.MathUtils.lerp(
            meshRef.current.material.uniforms.uTransition.value,
            targetTransition,
            0.05
        );


        // 2. Contrôles Clavier (uniquement en mode Planisphère)

        if (isPlanar) {
            const { forward, backward, left, right } = getKeys();
            const moveSpeed = 15 * delta;

            // Déplacement XY pur
            if (forward)  groupRef.current.position.y -= moveSpeed;
            if (backward) groupRef.current.position.y += moveSpeed;
            if (left)     groupRef.current.position.x += moveSpeed;
            if (right)    groupRef.current.position.x -= moveSpeed;
        } else {
            // RESET : On ramène doucement la planète au centre (0,0,0) quand on quitte le mode plan
            groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);

            // On peut aussi remettre la rotation du groupe à zéro si besoin
            groupRef.current.rotation.set(0, 0, 0);
        }
    });

    return (
        <group ref={groupRef}>
        {/* Mesh principal avec le Shader */}
        <mesh ref={meshRef}>
        {/* Largeur = Circonférence (2*PI*R), Hauteur = Demi-circonférence (PI*R) */}
        <planeGeometry args={[radius * 2 * Math.PI, radius * Math.PI, 128, 64]} />
        <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        />
        </mesh>

        {/* Support (Fond noir) visible uniquement en mode plan */}
        {isPlanar && (
            <mesh position={[0, 0, -0.2]}>
            <planeGeometry args={[radius * 2 * Math.PI + 2, radius * Math.PI + 2]} />
            <meshStandardMaterial color="#050505" />
            </mesh>
        )}
        </group>
    );
}
