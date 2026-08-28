import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { F1Car } from './F1Car';
import { ParticleSlipstream } from './ParticleSlipstream';
import { EnergyCore } from './EnergyCore';
import { NeonGrid } from './NeonGrid';

function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const targetX = Math.sin(t * 0.2) * 0.5 + mouse.current.x * 1.5;
    const targetY = 2.5 + mouse.current.y * 0.5;
    const targetZ = 6 + Math.sin(t * 0.15) * 0.5;

    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.position.z += (targetZ - camera.position.z) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return null;
}

function Scene({ boostPhase, particleSpeed }: { boostPhase: number; particleSpeed: number }) {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#00F5FF" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#FFB800" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.4}
        color="#00F5FF"
        castShadow={false}
      />

      <NeonGrid />

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <F1Car boostPhase={boostPhase} />
      </Float>

      <EnergyCore intensity={boostPhase} />
      <ParticleSlipstream speed={particleSpeed} />

      <fog attach="fog" args={['#05070B', 5, 25]} />
    </>
  );
}

interface HeroCanvas3DProps {
  boostPhase: number;
  particleSpeed: number;
}

export function HeroCanvas3D({ boostPhase, particleSpeed }: HeroCanvas3DProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 2.5, 6], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene boostPhase={boostPhase} particleSpeed={particleSpeed} />
        </Suspense>
      </Canvas>
    </div>
  );
}
