import { useState } from 'react';
import multiplayerService from '@/lib/services/MultiplayerService';

interface RoomJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoomJoinModal({ isOpen, onClose }: RoomJoinModalProps) {
  const [roomName, setRoomName] = useState('');

  const handleJoinRoom = () => {
    if (roomName.trim()) {
      multiplayerService.joinRoom(roomName.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4 text-white">Join Game Room</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Enter room name..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleJoinRoom}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
