import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function EnergyCore({ intensity }: { intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.8;
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
    }
    if (coreRef.current) {
      const scale = 0.8 + Math.sin(t * 2) * 0.2 * intensity;
      coreRef.current.scale.setScalar(scale);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      const phase = (Math.sin(t * 1.5) + 1) / 2;
      mat.color.setHex(phase > 0.5 ? 0xffb800 : 0x00f5ff);
      mat.opacity = 0.5 + phase * 0.5;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 1.2;
      ringRef1.current.rotation.z = t * 0.7;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = -t * 0.9;
      ringRef2.current.rotation.y = t * 1.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.15, 0]}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.12, 2]} />
        <meshBasicMaterial
          color="#00F5FF"
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>
      <mesh ref={ringRef1}>
        <torusGeometry args={[0.2, 0.005, 8, 32]} />
        <meshBasicMaterial
          color="#FFB800"
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[0.28, 0.004, 8, 32]} />
        <meshBasicMaterial
          color="#00F5FF"
          transparent
          opacity={0.3}
        />
      </mesh>
      <pointLight
        color={intensity > 0.5 ? '#FFB800' : '#00F5FF'}
        intensity={intensity * 2}
        distance={3}
        decay={2}
      />
    </group>
  );
}
