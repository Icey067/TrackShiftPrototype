import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GRID_SIZE = 40;
const GRID_DIVISIONS = 40;

export function NeonGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#00F5FF') },
        uColor2: { value: new THREE.Color('#0A0E17') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5));
          float alpha = smoothstep(0.5, 0.1, dist) * 0.15;
          float pulse = sin(uTime * 0.5 + dist * 5.0) * 0.5 + 0.5;
          vec3 color = mix(uColor2, uColor1, pulse * 0.3);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[GRID_SIZE, GRID_DIVISIONS, '#00F5FF', '#1A1F2E']}
      position={[0, -1.5, 0]}
      material-transparent
      material-opacity={0.15}
    />
  );
}
