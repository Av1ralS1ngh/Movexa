'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

export function BlockModel() {
  const group = useRef<Group>(null);
  const cubesGroup = useRef<Group>(null);

  // Create multiple floating cubes
  const cubes = Array.from({ length: 8 }).map((_, i) => ({
    position: [
      Math.sin(i * Math.PI * 2 / 8) * 3,
      Math.cos(i * Math.PI * 2 / 8) * 3,
      0
    ],
    scale: Math.random() * 0.5 + 0.5,
    rotation: Math.random() * Math.PI
  }));

  useFrame(({ clock }) => {
    if (!group.current || !cubesGroup.current) return;
    
    // Rotate the entire group
    group.current.rotation.y = clock.getElapsedTime() * 0.1;
    
    // Animate individual cubes
    cubesGroup.current.children.forEach((cube, i) => {
      cube.position.y += Math.sin(clock.getElapsedTime() * 2 + i) * 0.005;
      cube.rotation.x += 0.02;
      cube.rotation.z += 0.02;
    });
  });

  return (
    <group ref={group}>
      {/* Main cube */}
      <mesh scale={1.5}>
        <boxGeometry />
        <meshStandardMaterial
          color="#676FFF"
          metalness={0.8}
          roughness={0.2}
          emissive="#676FFF"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Floating cubes */}
      <group ref={cubesGroup}>
        {cubes.map((cube, index) => (
          <mesh
            key={index}
            position={cube.position as [number, number, number]}
            scale={cube.scale}
          >
            <boxGeometry />
            <meshStandardMaterial
              color="#676FFF"
              metalness={0.8}
              roughness={0.2}
              emissive="#676FFF"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={`particle-${i}`}
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
          scale={0.05}
        >
          <sphereGeometry />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  );
}
