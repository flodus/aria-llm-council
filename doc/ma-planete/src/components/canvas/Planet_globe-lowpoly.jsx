// src/components/canvas/Planet.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
uniform float uTransition;
uniform float uRadius;
uniform sampler2D uTexture;
varying vec2 vUv;
varying float vHeight;

void main() {
    vUv = uv;

    // 1. Lecture de la texture pour le relief
    vec4 texColor = texture2D(uTexture, uv);
    // On calcule la luminosité (l'herbe/terre est plus claire que l'eau)
    float brightness = (texColor.r + texColor.g + texColor.b) / 3.0;

    // 2. Création des paliers de relief (Style Low-Poly)
    float relief = 0.0;
    if(brightness > 0.4) {
        relief = 0.35; // Hauteur des continents
    }
    vHeight = relief; // On passe l'info au fragment shader pour colorer différemment

    // 3. Position Plan (XY)
    vec3 planePos = position;
    planePos.z += relief;

    // 4. Position Globe (Sphère)
    float lon = (uv.x * 2.0 - 1.0) * 3.14159265359;
    float lat = (uv.y - 0.5) * 3.14159265359;
    float r = uRadius + relief;

    vec3 spherePos;
    spherePos.x = r * cos(lat) * sin(lon);
    spherePos.y = r * sin(lat);
    spherePos.z = r * cos(lat) * cos(lon);

    // 5. Morphing
    vec3 finalPos = mix(spherePos, planePos, uTransition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
varying vec2 vUv;
varying float vHeight;

void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // On peut accentuer un peu la couleur si c'est du relief
    vec3 finalColor = texColor.rgb;
    if(vHeight > 0.0) {
        finalColor *= 1.1; // Rend les continents légèrement plus vibrants
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function Planet({ radius = 5, isPlanar = false, textureUrl }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [, getKeys] = useKeyboardControls();

    // Chargement texture
    const texture = useLoader(THREE.TextureLoader, textureUrl);

    const uniforms = useMemo(() => ({
        uTransition: { value: 0 },
        uRadius: { value: radius },
        uTexture: { value: texture },
    }), [radius, texture]);

    useFrame((state, delta) => {
        if (!meshRef.current || !groupRef.current) return;

        // Transition Globe / Plan
        const target = isPlanar ? 1.0 : 0.0;
        meshRef.current.material.uniforms.uTransition.value = THREE.MathUtils.lerp(
            meshRef.current.material.uniforms.uTransition.value, target, 0.05
        );

        // Mouvement clavier
        if (isPlanar) {
            const { forward, backward, left, right } = getKeys();
            const speed = 20 * delta;
            if (forward)  groupRef.current.position.y -= speed;
            if (backward) groupRef.current.position.y += speed;
            if (left)     groupRef.current.position.x += speed;
            if (right)    groupRef.current.position.x -= speed;
        } else {
            groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        }
    });

    return (
        <group ref={groupRef}>
        <mesh ref={meshRef}>
        {/* On garde une haute résolution pour que les bords des continents soient nets */}
        <planeGeometry args={[radius * 2 * Math.PI, radius * Math.PI, 512, 256]} />
        <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        flatShading={true} // L'effet facetté est activé ici !
        />
        </mesh>

        {isPlanar && (
            <mesh position={[0, 0, -0.2]}>
            <planeGeometry args={[radius * 2 * Math.PI + 2, radius * Math.PI + 2]} />
            <meshStandardMaterial color="#020202" />
            </mesh>
        )}
        </group>
    );
}
