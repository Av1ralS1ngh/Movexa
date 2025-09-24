import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BattleSceneProps {
  isVisible: boolean;
  playerNFT: any;
  npcNFT: any;
  onBattleEnd: (playerWon: boolean) => void;
}

export default function BattleScene({ isVisible, playerNFT, npcNFT, onBattleEnd }: BattleSceneProps) {
  console.log("BattleScene", isVisible);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const battleCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const [showEndBattle, setShowEndBattle] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [showLightning, setShowLightning] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    // Setup Three.js scene for visual effects
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create lightning effect
    const createLightning = () => {
      const points = [];
      const segments = 10;
      for (let i = 0; i <= segments; i++) {
        points.push(new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          i / segments * 4 - 2,
          0
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
      return new THREE.Line(geometry, material);
    };

    // Add multiple lightning bolts
    const lightnings: THREE.Line[] = [];
    if (showLightning) {
      for (let i = 0; i < 5; i++) {
        const lightning = createLightning();
        scene.add(lightning);
        lightnings.push(lightning);
      }
    }

    // Animation loop
    const animate = () => {
      if (!isVisible || !showLightning) return;
      
      requestAnimationFrame(animate);

      // Animate lightning
      lightnings.forEach(lightning => {
        const positions = lightning.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * 0.1;
        }
        lightning.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Start checking battle status
    battleCheckInterval.current = setInterval(() => {
      const gameScene = (window as any).gameScene;
      if (gameScene && gameScene.isBattling) {
        // Check if either player or NPC is dead
        if (gameScene.playerHealth <= 0 || gameScene.npcHealth <= 0) {
          const won = gameScene.npcHealth <= 0;
          setPlayerWon(won);
          setShowLightning(true);
          setShowEndBattle(true);
          clearInterval(battleCheckInterval.current!);
        }
      }
    }, 100);

    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      // Clear battle check interval
      if (battleCheckInterval.current) {
        clearInterval(battleCheckInterval.current);
      }
    };
  }, [isVisible, showLightning]);

  const handleContinue = () => {
    const gameScene = (window as any).gameScene;
    if (gameScene) {
      gameScene.endNPCBattle();
      onBattleEnd(playerWon);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50">
          {/* Three.js container for effects */}
          <div ref={containerRef} className="absolute inset-0" />

          {/* Battle UI */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start px-[20%]">
            {/* Player Info */}
            <div className="bg-black bg-opacity-50 p-4 rounded-lg relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                YOU
              </div>
              <div className="w-32 h-32 relative mb-2">
                <Image
                  src={playerNFT.image}
                  alt={playerNFT.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="text-white text-center">{playerNFT.name}</div>
            </div>

            {/* Battle Instructions */}
            {!showEndBattle && (
              <div className="bg-black bg-opacity-50 p-4 rounded-lg text-white text-center">
                <p className="text-xl font-bold mb-2">Battle Controls</p>
                <p>SPACE - Sword Attack</p>
                <p>SHIFT - Cast Spell</p>
              </div>
            )}

            {/* NPC Info */}
            <div className="bg-black bg-opacity-50 p-4 rounded-lg relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                ENEMY
              </div>
              <div className="w-32 h-32 relative mb-2">
                <Image
                  src={npcNFT.image}
                  alt={npcNFT.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="text-white text-center">{npcNFT.name}</div>
            </div>
          </div>

          {/* Battle End UI */}
          {showEndBattle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 flex flex-col items-center justify-center"
            >
              <div className="text-4xl font-bold text-white mb-8">
                {playerWon ? "You Won!" : "You Lost!"}
              </div>
              <button
                onClick={handleContinue}
                className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400"
              >
                Continue
              </button>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
