import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 600;

export function ParticleSlipstream({ speed }: { speed: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const cyanColor = new THREE.Color('#00F5FF');
    const amberColor = new THREE.Color('#FFB800');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 12;
      pos[i3 + 1] = (Math.random() - 0.5) * 6;
      pos[i3 + 2] = (Math.random() - 0.5) * 8;
      vel[i3] = -(2 + Math.random() * 4);
      vel[i3 + 1] = (Math.random() - 0.5) * 0.3;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.5;
      const t = Math.random();
      const c = t > 0.7 ? amberColor : cyanColor;
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return { positions: pos, velocities: vel, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const baseSpeed = 1 + speed * 3;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      arr[i3] += velocities[i3] * baseSpeed * delta;
      arr[i3 + 1] += velocities[i3 + 1] * delta;
      arr[i3 + 2] += velocities[i3 + 2] * delta;

      if (arr[i3] < -7) {
        arr[i3] = 7;
        arr[i3 + 1] = (Math.random() - 0.5) * 6;
        arr[i3 + 2] = (Math.random() - 0.5) * 8;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.04}
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
