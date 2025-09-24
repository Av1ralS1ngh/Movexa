'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from './GameScene';

interface GameCanvasProps {
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onOpenTrade?: (npcName: string) => void;
  onStartBattle?: () => void;
  onEndBattle?: () => void;
}

export default function GameCanvas({ 
  isPaused = false, 
  onPause, 
  onResume, 
  onOpenTrade,
  onStartBattle,
  onEndBattle 
}: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GameScene | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      // Calculate game size (70% of viewport width, maintain 4:3 ratio)
      const gameWidth = Math.min(window.innerWidth * 0.7, 1024);
      const gameHeight = (gameWidth / 4) * 3;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: GameScene,
        parent: 'game-container',
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      const game = new Phaser.Game(config);
      gameRef.current = game;

      // Get scene reference after creation
      game.events.on('ready', () => {
        const scene = game.scene.getScene('GameScene') as GameScene;
        sceneRef.current = scene;

        // Add event listeners
        scene.events.on('pause', () => {
          onPause?.();
        });

        scene.events.on('resume', () => {
          onResume?.();
        });

        scene.events.on('openTradeDialog', (npcName: string) => {
          onOpenTrade?.(npcName);
        });

        scene.events.on('startBattle', () => {
          onStartBattle?.();
        });

        scene.events.on('endBattle', () => {
          onEndBattle?.();
        });
      });

      // Handle resize
      const handleResize = () => {
        if (gameRef.current) {
          const newWidth = Math.min(window.innerWidth * 0.7, 1024);
          const newHeight = (newWidth / 4) * 3;
          gameRef.current.scale.resize(newWidth, newHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        game.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      };
    }
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      (window as any).gameScene = sceneRef.current;
    }
  }, [sceneRef.current]);

  useEffect(() => {
    if (sceneRef.current) {
      if (isPaused) {
        sceneRef.current.pauseGame();
      } else {
        sceneRef.current.resumeGame();
      }
    }
  }, [isPaused]);

  return (
    <div className="w-full h-full">
      <div id="game-container" className="rounded-lg overflow-hidden shadow-2xl w-full h-full" />
    </div>
  );
}
