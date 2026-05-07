import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function Blob({ position, color, speed, distort, radius }) {
  const mesh = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.position.y = position[1] + Math.sin(time * speed) * 0.2;
    mesh.current.rotation.x = time * speed * 0.2;
    mesh.current.rotation.y = time * speed * 0.3;
  });

  return (
    <Float speed={speed} rotationIntensity={2} floatIntensity={2}>
      <Sphere ref={mesh} args={[radius, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={radius}
          roughness={0.1}
          metalness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.4}
          ior={1.2}
          thickness={1.5}
        />
      </Sphere>
    </Float>
  );
}

function Scene({ mouse }) {
  const group = useRef();

  useFrame((state) => {
    // Subtle mouse parallax
    const x = (mouse.current[0] * state.viewport.width) / 100;
    const y = (mouse.current[1] * state.viewport.height) / 100;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, x, 0.05);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, y, 0.05);
  });

  return (
    <group ref={group}>
      <Blob position={[-3, 2, -5]} color="#00f2fe" speed={0.8} distort={0.4} radius={2} />
      <Blob position={[4, -2, -6]} color="#0ea5e9" speed={0.6} distort={0.5} radius={2.5} />
      <Blob position={[-4, -3, -4]} color="#10b981" speed={0.7} distort={0.6} radius={1.5} />
      <Blob position={[3, 4, -7]} color="#4facfe" speed={0.5} distort={0.4} radius={1.8} />
    </group>
  );
}

export default function Background3D() {
  const mouse = useRef([0, 0]);

  const onMouseMove = (e) => {
    mouse.current = [
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    ];
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      onMouseMove={onMouseMove}
      style={{ background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)' }}
    >
      <Suspense fallback={null}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#00f2fe" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4facfe" />
          <Scene mouse={mouse} />
          <Environment preset="night" />
        </Canvas>
      </Suspense>
      {/* Deep overlay for dark theme */}
      <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px]" />
    </div>
  );
}
