const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const cors = require('cors');

app.use(cors());

// Store active rooms and their players
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle room joining
  socket.on('joinRoom', (roomName) => {
    console.log(`Player ${socket.id} attempting to join room ${roomName}`);
    
    // Leave current room if any
    const currentRoom = [...socket.rooms].find(room => room !== socket.id);
    if (currentRoom) {
      console.log(`Player ${socket.id} leaving current room ${currentRoom}`);
      socket.leave(currentRoom);
      // Remove player from old room
      if (rooms.has(currentRoom)) {
        const room = rooms.get(currentRoom);
        delete room.players[socket.id];
        if (Object.keys(room.players).length === 0) {
          rooms.delete(currentRoom);
        }
      }
    }

    // Join new room
    socket.join(roomName);
    console.log(`Player ${socket.id} joined room ${roomName}`);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomName)) {
      console.log(`Creating new room ${roomName}`);
      rooms.set(roomName, {
        players: {}
      });
    }

    // Add player to room with initial position
    const room = rooms.get(roomName);
    room.players[socket.id] = {
      x: Math.random() * 1000 + 400,
      y: Math.random() * 1000 + 400,
      animation: 'player-down',
      health: 100
    };

    console.log(`Room ${roomName} players:`, Object.keys(room.players));

    // Send current players to new player
    socket.emit('currentPlayers', room.players);
    console.log(`Sent current players to ${socket.id}:`, room.players);
    
    // Notify others about new player
    socket.to(roomName).emit('playerJoined', {
      id: socket.id,
      ...room.players[socket.id]
    });
    console.log(`Notified others in ${roomName} about new player ${socket.id}`);
  });

  // Handle player movement
  socket.on('playerMovement', (movementData) => {
    console.log('Received player movement:', movementData);
    const currentRoom = [...socket.rooms].find(room => room !== socket.id);
    if (!currentRoom || !rooms.has(currentRoom)) {
      console.log('Player not in a room or room not found:', socket.id);
      return;
    }

    const room = rooms.get(currentRoom);
    const player = room.players[socket.id];
    if (!player) {
      console.log('Player not found in room:', socket.id);
      return;
    }

    console.log(`Player ${socket.id} moved in room ${currentRoom}:`, movementData);

    // Update player position
    player.x = movementData.x;
    player.y = movementData.y;
    player.animation = movementData.animation;

    // Broadcast player movement to others in room
    socket.to(currentRoom).emit('playerMoved', {
      id: socket.id,
      x: player.x,
      y: player.y,
      animation: player.animation
    });

    console.log(`Broadcasted movement to room ${currentRoom}`);
  });

  // Handle player attack
  socket.on('playerAttack', (attackData) => {
    const currentRoom = [...socket.rooms].find(room => room !== socket.id);
    if (currentRoom) {
      console.log(`Player ${socket.id} attacked in room ${currentRoom}`);
      socket.to(currentRoom).emit('playerAttacked', {
        id: socket.id,
        ...attackData
      });
    }
  });

  // Handle player spell cast
  socket.on('playerSpell', (spellData) => {
    const currentRoom = [...socket.rooms].find(room => room !== socket.id);
    if (currentRoom) {
      console.log(`Player ${socket.id} cast spell in room ${currentRoom}`);
      socket.to(currentRoom).emit('playerCastSpell', {
        id: socket.id,
        ...spellData
      });
    }
  });

  // Handle player damage
  socket.on('playerDamage', (damageData) => {
    const currentRoom = [...socket.rooms].find(room => room !== socket.id);
    if (!currentRoom || !rooms.has(currentRoom)) return;

    const room = rooms.get(currentRoom);
    const player = room.players[socket.id];
    if (!player) return;

    // Update player health
    player.health = damageData.health;

    console.log(`Player ${socket.id} took damage in room ${currentRoom}`);

    // Broadcast damage to others in room
    socket.to(currentRoom).emit('playerDamaged', {
      id: socket.id,
      health: player.health
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from their room
    const currentRoom = [...socket.rooms].find(room => room !== socket.id);
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      delete room.players[socket.id];
      
      console.log(`Player ${socket.id} left room ${currentRoom}`);
      
      // Delete room if empty
      if (Object.keys(room.players).length === 0) {
        rooms.delete(currentRoom);
      }
      
      // Notify others about player leaving
      socket.to(currentRoom).emit('playerLeft', socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
