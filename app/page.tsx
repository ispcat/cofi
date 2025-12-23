'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeCard from '@/components/ThemeCard';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateRoom = async (theme: 'rainy' | 'midnight' | 'forest') => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      router.push(`/room/${data.room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: joinRoomId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join room');
      }

      router.push(`/room/${data.room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient noise-bg">
      <div className="text-center z-10">
        <h1 className="text-7xl font-bold mb-12 tracking-tight">
          Co<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">fi</span>
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-64 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Create Room
          </button>
          
          <button
            onClick={() => setShowJoinInput(true)}
            className="w-64 px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105"
          >
            Join Room
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-300 font-medium">{error}</p>
        )}
      </div>

      {/* Theme Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-3xl max-w-4xl w-full">
            <h2 className="text-4xl font-bold mb-8 text-center">Choose Your Vibe</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <ThemeCard
                title="Rainy Room"
                icon="☁️"
                theme="rainy"
                description="Cozy vibes with rain sounds"
                colorClass="bg-gradient-to-br from-rainy-bg to-rainy-accent"
                onSelect={handleCreateRoom}
              />
              
              <ThemeCard
                title="Midnight Mart"
                icon="🏪"
                theme="midnight"
                description="Late night convenience store"
                colorClass="bg-gradient-to-br from-midnight-bg to-midnight-accent"
                onSelect={handleCreateRoom}
              />
              
              <ThemeCard
                title="Forest Camp"
                icon="🔥"
                theme="forest"
                description="Warm campfire atmosphere"
                colorClass="bg-gradient-to-br from-forest-bg to-forest-accent"
                onSelect={handleCreateRoom}
              />
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              disabled={isLoading}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Join Room Input */}
      {showJoinInput && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-3xl max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6 text-center">Enter Room ID</h2>
            
            <form onSubmit={handleJoinRoom}>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="e.g. ABCD"
                maxLength={4}
                className="w-full px-6 py-4 bg-gray-800 rounded-full text-center text-2xl tracking-widest mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || joinRoomId.length !== 4}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors font-semibold"
                >
                  {isLoading ? 'Joining...' : 'Join Room'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinInput(false);
                    setJoinRoomId('');
                    setError('');
                  }}
                  disabled={isLoading}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
