'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { useScroll } from 'framer-motion';
import { Environment, Float, OrbitControls, Stars, Trail } from '@react-three/drei';

function Particles({ count = 100 }) {
  const positions = useRef(Array.from({ length: count }, () => ({
    position: [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    ],
    speed: Math.random() * 0.2 + 0.1
  })));

  useFrame((state) => {
    positions.current.forEach((particle) => {
      particle.position[1] -= particle.speed;
      if (particle.position[1] < -10) particle.position[1] = 10;
    });
  });

  return (
    <group>
      {positions.current.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#8B0000' : '#4B0082'} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Eye({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const eyeRef = useRef();

  useFrame((state) => {
    if (eyeRef.current) {
      eyeRef.current.lookAt(state.mouse.x * 5, state.mouse.y * 5, 5);
    }
  });

  return (
    <group ref={eyeRef} position={position} rotation={rotation}>
      {/* Eyeball */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#e9edc9"
          roughness={0.1}
          metalness={0.5}
          emissive="#d4a373"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Iris */}
      <mesh position={[0, 0, 0.25]}>
        <circleGeometry args={[0.25, 32]} />
        <meshStandardMaterial
          color="#8B0000"
          roughness={0.2}
          metalness={0.8}
          emissive="#4B0082"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Pupil */}
      <mesh position={[0, 0, 0.26]}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial
          color="#1a1510"
          roughness={0.1}
          metalness={0.9}
          emissive="#4B0082"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Blood vessels */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <Trail
            key={i}
            width={0.05}
            length={4}
            color="#8B0000"
            attenuation={(t) => t * t}
          >
            <mesh position={[
              Math.cos(angle) * 0.4,
              Math.sin(angle) * 0.4,
              0.1
            ]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#8B0000" />
            </mesh>
          </Trail>
        );
      })}
    </group>
  );
}

function FloatingEyes({ count = 8 }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 4;
        return (
          <Float
            key={i}
            speed={2} 
            rotationIntensity={2} 
            floatIntensity={2}
            position={[
              Math.cos(angle) * radius,
              Math.sin(i) * 2,
              Math.sin(angle) * radius
            ]}
          >
            <Eye rotation={[0, angle, 0]} />
          </Float>
        );
      })}
    </group>
  );
}

function Cubes({ count = 4, temp = new THREE.Object3D() }) {
  const particles = useRef();
  const { scrollYProgress } = useScroll();
  
  useFrame((state, delta) => {
    const scrollOffset = scrollYProgress.get();
    
    for (let i = 0; i < count; i++) {
      const id = i;
      const t = (id * Math.PI * 2) / count;
      const radius = 6;
      
      temp.position.set(
        Math.cos(t + state.clock.elapsedTime * 0.1) * radius,
        Math.sin(scrollOffset * Math.PI * 2 + id) * 2,
        Math.sin(t + state.clock.elapsedTime * 0.1) * radius
      );
      temp.rotation.x = Math.sin(state.clock.elapsedTime * 0.2 + id) * Math.PI;
      temp.rotation.y = Math.cos(state.clock.elapsedTime * 0.2 + id) * Math.PI;
      temp.updateMatrix();
      particles.current.setMatrixAt(id, temp.matrix);
    }
    particles.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={particles} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#4B0082"
        roughness={0.5}
        metalness={0.5}
        emissive="#8B0000"
        emissiveIntensity={0.3}
      />
    </instancedMesh>
  );
}

function FloatingSymbols() {
  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 8;
        return (
          <Float
            key={i}
            speed={1}
            rotationIntensity={1}
            floatIntensity={1}
            position={[
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 4,
              Math.sin(angle) * radius
            ]}
          >
            <mesh>
              <torusGeometry args={[0.3, 0.1, 16, 32]} />
              <meshStandardMaterial
                color="#8B0000"
                emissive="#4B0082"
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export function GameScene() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <color attach="background" args={['#1a1510']} />
        <fog attach="fog" args={['#1a1510', 5, 15]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#8B0000" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4B0082" />
        
        <Stars
          radius={50}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <Particles />
        <Cubes />
        <FloatingEyes />
        <FloatingSymbols />
        <Environment preset="night" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
