import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function F1Car({ boostPhase }: { boostPhase: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const cyanMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#00F5FF'),
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      }),
    []
  );

  const edgeMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#00F5FF'),
        transparent: true,
        opacity: 0.6,
      }),
    []
  );

  const coreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(boostPhase > 0.5 ? '#FFB800' : '#00F5FF'),
        transparent: true,
        opacity: 0.7 + boostPhase * 0.3,
      }),
    [boostPhase]
  );

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
  });

  const bodyShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.2, 0);
    shape.lineTo(-1.8, 0.15);
    shape.lineTo(-0.8, 0.2);
    shape.lineTo(-0.3, 0.35);
    shape.lineTo(0.2, 0.38);
    shape.lineTo(0.8, 0.35);
    shape.lineTo(1.5, 0.25);
    shape.lineTo(2.2, 0.12);
    shape.lineTo(2.4, 0.05);
    shape.lineTo(2.2, 0);
    shape.lineTo(1.8, -0.05);
    shape.lineTo(-1.8, -0.05);
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      steps: 1,
      depth: 0.9,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 1,
    }),
    []
  );

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={0.7}>
      {/* Main body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, -0.45]}>
        <extrudeGeometry args={[bodyShape, extrudeSettings]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* Front wing */}
      <mesh position={[2.3, 0.02, 0]}>
        <boxGeometry args={[0.5, 0.03, 1.3]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>
      <mesh position={[2.55, 0.05, 0]}>
        <boxGeometry args={[0.15, 0.06, 1.1]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* Rear wing */}
      <mesh position={[-2.1, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.35, 0.9]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>
      <mesh position={[-2.25, 0.4, 0]}>
        <boxGeometry args={[0.3, 0.06, 0.95]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>
      <mesh position={[-2.1, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.08, 0.7]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* Halo */}
      <mesh position={[0.5, 0.55, 0]}>
        <torusGeometry args={[0.22, 0.02, 8, 16, Math.PI]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* Front wheels */}
      <mesh position={[1.6, 0.0, 0.55]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.12, 12]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>
      <mesh position={[1.6, 0.0, -0.55]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.12, 12]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* Rear wheels */}
      <mesh position={[-1.4, 0.0, 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.15, 12]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>
      <mesh position={[-1.4, 0.0, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.15, 12]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* Side pods */}
      <mesh position={[0.3, 0.18, 0.48]}>
        <boxGeometry args={[1.2, 0.18, 0.12]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>
      <mesh position={[0.3, 0.18, -0.48]}>
        <boxGeometry args={[1.2, 0.18, 0.12]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* ERS Energy Core (battery node) */}
      <mesh position={[-0.2, 0.2, 0]}>
        <octahedronGeometry args={[0.15, 0]} />
        <primitive object={coreMat} attach="material" />
      </mesh>
      <mesh position={[-0.6, 0.2, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <primitive object={coreMat} attach="material" />
      </mesh>
      <mesh position={[0.2, 0.2, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <primitive object={coreMat} attach="material" />
      </mesh>

      {/* Nose cone */}
      <mesh position={[2.6, 0.08, 0]}>
        <coneGeometry args={[0.06, 0.4, 4]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* Floor / diffuser */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[4.2, 0.02, 0.85]} />
        <primitive object={cyanMat} attach="material" />
      </mesh>

      {/* Wireframe edge highlights */}
      <lineSegments position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.ExtrudeGeometry(bodyShape, extrudeSettings)]} />
        <primitive object={edgeMat} attach="material" />
      </lineSegments>
    </group>
  );
}
