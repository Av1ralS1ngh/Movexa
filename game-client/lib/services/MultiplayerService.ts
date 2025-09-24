import { io, Socket } from 'socket.io-client';

class MultiplayerService {
  private socket: Socket | null = null;
  private gameScene: any = null;
  private otherPlayers: Map<string, any> = new Map();
  private lastX: number | null = null;
  private lastY: number | null = null;
  private lastAnimation: string | null = null;
  private currentRoom: string | null = null;

  constructor() {
    try {
      console.log('Initializing MultiplayerService');
      this.socket = io('http://localhost:3001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to game server with ID:', this.socket?.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Failed to connect to game server:', error);
      });

      this.setupSocketListeners();
    } catch (error) {
      console.error('Error initializing MultiplayerService:', error);
    }
  }

  setGameScene(scene: any) {
    console.log('Setting game scene');
    this.gameScene = scene;
    
    // If we were in a room and reconnected, rejoin it
    if (this.currentRoom) {
      this.joinRoom(this.currentRoom);
    }
  }

  joinRoom(roomName: string) {
    if (!this.socket?.connected) {
      console.error('Cannot join room: not connected to server');
      return;
    }

    console.log('Joining room:', roomName);
    this.currentRoom = roomName;
    this.socket.emit('joinRoom', roomName);
  }

  private setupSocketListeners() {
    if (!this.socket) {
      console.error('Cannot setup listeners: socket is null');
      return;
    }

    // Handle current players in room
    this.socket.on('currentPlayers', (players) => {
      console.log('Received current players:', players);
      try {
        // Clear existing players first
        this.otherPlayers.forEach(player => player.destroy());
        this.otherPlayers.clear();

        // Create new players
        Object.entries(players).forEach(([id, playerData]: [string, any]) => {
          if (id !== this.socket?.id) {
            console.log('Creating other player:', id, playerData);
            this.createOtherPlayer(id, playerData);
          }
        });
      } catch (error) {
        console.error('Error handling currentPlayers:', error);
      }
    });

    // Handle new player joining
    this.socket.on('playerJoined', (playerInfo) => {
      console.log('New player joined:', playerInfo);
      try {
        if (playerInfo.id !== this.socket?.id) {
          this.createOtherPlayer(playerInfo.id, playerInfo);
        }
      } catch (error) {
        console.error('Error handling playerJoined:', error);
      }
    });

    // Handle player movement
    this.socket.on('playerMoved', (playerInfo) => {
      console.log('Received player movement:', playerInfo);
      try {
        console.log('Received player movement:', playerInfo);
        const otherPlayer = this.otherPlayers.get(playerInfo.id);
        
        if (!otherPlayer) {
          console.warn('Creating missing player:', playerInfo.id);
          this.createOtherPlayer(playerInfo.id, playerInfo);
          return;
        }

        // Use tweens for smooth movement
        this.gameScene.tweens.add({
          targets: otherPlayer,
          x: playerInfo.x,
          y: playerInfo.y,
          duration: 100,
          ease: 'Linear'
        });

        if (playerInfo.animation) {
          otherPlayer.play(playerInfo.animation, true);
        }
      } catch (error) {
        console.error('Error handling playerMoved:', error);
      }
    });

    // Handle player attack
    this.socket.on('playerAttacked', (attackInfo) => {
      const otherPlayer = this.otherPlayers.get(attackInfo.id);
      if (otherPlayer && this.gameScene) {
        // Create attack animation for other player
        const direction = otherPlayer.anims.currentAnim.key.split('-')[1];
        const offset = this.gameScene.getDirectionOffset(direction, 20);
        
        const attack = this.gameScene.playerAttacks.create(
          otherPlayer.x + offset.x,
          otherPlayer.y + offset.y,
          'sword'
        );
        
        attack.setScale(1.5);
        attack.lifespan = 200;
      }
    });

    // Handle player spell cast
    this.socket.on('playerCastSpell', (spellInfo) => {
      const otherPlayer = this.otherPlayers.get(spellInfo.id);
      if (otherPlayer && this.gameScene) {
        const direction = otherPlayer.anims.currentAnim.key.split('-')[1];
        const speed = 300;
        const velocity = this.gameScene.getDirectionOffset(direction, speed);

        const spell = this.gameScene.playerAttacks.create(otherPlayer.x, otherPlayer.y, 'spell');
        spell.setScale(1.5);
        spell.setVelocity(velocity.x, velocity.y);
        spell.lifespan = 1000;

        // Add particle effect
        const particles = this.gameScene.add.particles(spell.x, spell.y, 'spell-particle', {
          lifespan: 500,
          speed: { min: -50, max: 50 },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.6, end: 0 },
          blendMode: 'ADD',
          emitting: true,
          follow: spell
        });

        spell.on('destroy', () => {
          particles.destroy();
        });
      }
    });

    // Handle player damage
    this.socket.on('playerDamaged', (damageInfo) => {
      const otherPlayer = this.otherPlayers.get(damageInfo.id);
      if (otherPlayer && this.gameScene) {
        otherPlayer.health = damageInfo.health;
        this.gameScene.showDamageNumber(
          Math.floor(Math.random() * 20) + 10,
          otherPlayer.x,
          otherPlayer.y,
          0xff0000
        );
      }
    });

    // Handle player leaving
    this.socket.on('playerLeft', (playerId) => {
      console.log('Player left:', playerId);
      try {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (otherPlayer) {
          otherPlayer.destroy();
          this.otherPlayers.delete(playerId);
        }
      } catch (error) {
        console.error('Error handling playerLeft:', error);
      }
    });
  }

  private createOtherPlayer(id: string, playerData: any) {
    if (!this.gameScene) {
      console.error('Cannot create other player: game scene not set');
      return;
    }

    try {
      console.log('Creating other player with data:', playerData);

      // Remove existing player if any
      const existingPlayer = this.otherPlayers.get(id);
      if (existingPlayer) {
        console.log('Removing existing player:', id);
        existingPlayer.destroy();
        this.otherPlayers.delete(id);
      }

      const otherPlayer = this.gameScene.physics.add.sprite(
        playerData.x,
        playerData.y,
        'characters'
      );
      
      console.log('Created sprite at position:', otherPlayer.x, otherPlayer.y);
      
      otherPlayer.setScale(2);
      otherPlayer.health = playerData.health;

      // Make other players visually distinct
      otherPlayer.setTint(0x00ff00);
      
      // Ensure the sprite is visible
      otherPlayer.setDepth(1);
      otherPlayer.setAlpha(1);
      
      // Create animations if they don't exist
      ['down', 'left', 'right', 'up'].forEach(direction => {
        const key = `player-${direction}`;
        if (!this.gameScene.anims.exists(key)) {
          this.gameScene.anims.create({
            key,
            frames: this.gameScene.anims.generateFrameNumbers('characters', {
              frames: direction === 'down' ? [3, 4, 5] :
                      direction === 'left' ? [15, 16, 17] :
                      direction === 'right' ? [27, 28, 29] :
                      [39, 40, 41]
            }),
            frameRate: 10,
            repeat: -1
          });
        }
      });

      otherPlayer.play(playerData.animation || 'player-down');
      this.otherPlayers.set(id, otherPlayer);

      // Add collisions
      this.gameScene.physics.add.collider(otherPlayer, this.gameScene.obstacles);
      this.gameScene.physics.add.collider(otherPlayer, this.gameScene.player);

      console.log('Successfully created other player:', id);
      console.log('Current other players:', Array.from(this.otherPlayers.keys()));
    } catch (error) {
      console.error('Error creating other player:', error);
    }
  }

  updatePlayerMovement(x: number, y: number, animation: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot update movement: not connected to server');
      return;
    }

    // Only send movement if position actually changed
    const positionChanged = Math.abs(this.lastX - x) > 0.1 || Math.abs(this.lastY - y) > 0.1;
    const animationChanged = this.lastAnimation !== animation;

    if (positionChanged || animationChanged) {
      const movementData = { x, y, animation };
      console.log('Sending movement update:', movementData);
      this.socket.emit('playerMovement', movementData);
      
      this.lastX = x;
      this.lastY = y;
      this.lastAnimation = animation;
    }
  }

  emitAttack() {
    if (this.socket) {
      this.socket.emit('playerAttack', {});
    }
  }

  emitSpell() {
    if (this.socket) {
      this.socket.emit('playerSpell', {});
    }
  }

  emitDamage(health: number) {
    if (this.socket) {
      this.socket.emit('playerDamage', { health });
    }
  }
}

// Create a singleton instance
const multiplayerService = new MultiplayerService();
export default multiplayerService;
