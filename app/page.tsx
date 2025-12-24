'use client';

import { useState, useEffect, useRef } from 'react';
import ThemeCard from '@/components/ThemeCard';
import AudioManager from '@/components/AudioManager';

type ViewState = 'landing' | 'room';

interface RoomData {
  id: string;
  theme: 'rainy' | 'midnight' | 'forest';
  created_at: string;
}

interface RoomUser {
  room_id: string;
  user_id: string;
  object_id: string;
  is_active: number;
  joined_at: string;
  last_seen: string;
}

interface InteractiveObject {
  id: string;
  name: string;
  imagePath: string;
  position: { top: string; left: string };
  size: { width: number; height: number };
  isActive: boolean;
  isMe: boolean;
  isAssigned: boolean;
}

const themeConfigs = {
  rainy: {
    name: 'Rainy Room',
    bgClass: 'bg-gradient-to-br from-slate-700 via-blue-900 to-slate-800',
    objects: [
      { 
        id: 'window', 
        name: 'Window',
        imagePath: '/assets/rainy/window.gif',
        position: { top: '15%', left: '20%' },
        size: { width: 200, height: 200 }
      },
      { 
        id: 'lamp', 
        name: 'Lamp',
        imagePath: '/assets/rainy/lamp.gif',
        position: { top: '25%', left: '75%' },
        size: { width: 150, height: 150 }
      },
      { 
        id: 'plant', 
        name: 'Plant',
        imagePath: '/assets/rainy/plant.gif',
        position: { top: '60%', left: '50%' },
        size: { width: 180, height: 180 }
      },
      { 
        id: 'book', 
        name: 'Book',
        imagePath: '/assets/rainy/book.gif',
        position: { top: '70%', left: '25%' },
        size: { width: 160, height: 160 }
      },
    ],
  },
  midnight: {
    name: 'Midnight Mart',
    bgClass: 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900',
    objects: [
      { 
        id: 'neon', 
        name: 'Neon Sign',
        imagePath: '/assets/midnight/neon.gif',
        position: { top: '15%', left: '50%' },
        size: { width: 220, height: 220 }
      },
      { 
        id: 'fridge', 
        name: 'Fridge',
        imagePath: '/assets/midnight/fridge.gif',
        position: { top: '45%', left: '20%' },
        size: { width: 180, height: 180 }
      },
      { 
        id: 'radio', 
        name: 'Radio',
        imagePath: '/assets/midnight/radio.gif',
        position: { top: '35%', left: '80%' },
        size: { width: 150, height: 150 }
      },
      { 
        id: 'vending', 
        name: 'Vending Machine',
        imagePath: '/assets/midnight/vending.gif',
        position: { top: '70%', left: '65%' },
        size: { width: 200, height: 200 }
      },
    ],
  },
  forest: {
    name: 'Forest Camp',
    bgClass: 'bg-gradient-to-br from-green-900 via-orange-900 to-green-800',
    objects: [
      { 
        id: 'fire', 
        name: 'Campfire',
        imagePath: '/assets/forest/fire.gif',
        position: { top: '55%', left: '50%' },
        size: { width: 200, height: 200 }
      },
      { 
        id: 'tent', 
        name: 'Tent',
        imagePath: '/assets/forest/tent.gif',
        position: { top: '40%', left: '25%' },
        size: { width: 180, height: 180 }
      },
      { 
        id: 'trees', 
        name: 'Trees',
        imagePath: '/assets/forest/trees.gif',
        position: { top: '20%', left: '15%' },
        size: { width: 220, height: 220 }
      },
      { 
        id: 'guitar', 
        name: 'Guitar',
        imagePath: '/assets/forest/guitar.gif',
        position: { top: '50%', left: '75%' },
        size: { width: 160, height: 160 }
      },
    ],
  },
};

export default function Home() {
  const [view, setView] = useState<ViewState>('landing');
  const [showModal, setShowModal] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [room, setRoom] = useState<RoomData | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [objects, setObjects] = useState<InteractiveObject[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedRoomId = localStorage.getItem('cofi_room_id');
    const savedUserId = localStorage.getItem('cofi_user_id');
    
    if (savedRoomId && savedUserId) {
      reconnectToRoom(savedRoomId, savedUserId);
    }
  }, []);

  useEffect(() => {
    if (view === 'room' && room && userId) {
      startPolling();
      startHeartbeat();
    } else {
      stopPolling();
      stopHeartbeat();
    }

    return () => {
      stopPolling();
      stopHeartbeat();
    };
  }, [view, room, userId]);

  const startPolling = () => {
    if (pollIntervalRef.current) return;
    
    pollIntervalRef.current = setInterval(async () => {
      if (!room || !userId) return;
      
      try {
        const response = await fetch(`/api/rooms/${room.id}`);
        const data = await response.json();
        
        if (response.ok) {
          updateObjects(room.theme, data.users, userId);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) return;
    
    heartbeatIntervalRef.current = setInterval(async () => {
      if (!room || !userId) return;
      
      try {
        await fetch(`/api/rooms/${room.id}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    }, 10000);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const reconnectToRoom = async (roomId: string, userId: string) => {
    setIsLoading(true);
    try {
      const joinResponse = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const joinData = await joinResponse.json();

      if (!joinResponse.ok) {
        throw new Error(joinData.error || 'Failed to rejoin room');
      }

      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();

      if (!roomResponse.ok) {
        throw new Error(roomData.error || 'Room not found');
      }

      setUserId(joinData.userId);
      setRoom(roomData.room);
      updateObjects(roomData.room.theme, roomData.users, joinData.userId);
      setView('room');
    } catch (err) {
      console.error('Failed to reconnect:', err);
      localStorage.removeItem('cofi_room_id');
      localStorage.removeItem('cofi_user_id');
    } finally {
      setIsLoading(false);
    }
  };

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

      await joinRoom(data.room.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinRoom(joinRoomId);
  };

  const joinRoom = async (roomId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const savedUserId = localStorage.getItem('cofi_user_id');
      
      const requestBody: { userId?: string } = {};
      if (savedUserId) {
        requestBody.userId = savedUserId;
      }
      
      const joinResponse = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const joinData = await joinResponse.json();

      if (!joinResponse.ok) {
        throw new Error(joinData.error || 'Failed to join room');
      }

      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();

      if (!roomResponse.ok) {
        throw new Error(roomData.error || 'Room not found');
      }

      localStorage.setItem('cofi_room_id', roomId);
      localStorage.setItem('cofi_user_id', joinData.userId);

      setUserId(joinData.userId);
      setRoom(roomData.room);
      updateObjects(roomData.room.theme, roomData.users, joinData.userId);
      setView('room');
      setShowModal(false);
      setShowJoinInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const updateObjects = (theme: RoomData['theme'], users: RoomUser[], currentUserId: string) => {
    const config = themeConfigs[theme];
    const objectsWithState = config.objects.map(obj => {
      const user = users.find(u => u.object_id === obj.id);
      return {
        ...obj,
        isActive: user ? user.is_active === 1 : false,
        isMe: user ? user.user_id === currentUserId : false,
        isAssigned: !!user,
      };
    });
    setObjects(objectsWithState);
  };

  const handleObjectClick = async (objectId: string, isMe: boolean) => {
    if (!isMe || !room) return;

    try {
      const response = await fetch(`/api/rooms/${room.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to toggle object');

      setObjects(prev =>
        prev.map(obj =>
          obj.id === objectId ? { ...obj, isActive: !obj.isActive } : obj
        )
      );
    } catch (err) {
      console.error('Error toggling object:', err);
    }
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem('cofi_room_id');
    localStorage.removeItem('cofi_user_id');
    setView('landing');
    setRoom(null);
    setUserId('');
    setObjects([]);
    setError('');
  };

  // Get active objects for audio manager
  const activeObjects = objects.reduce((acc, obj) => {
    acc[obj.id] = obj.isActive;
    return acc;
  }, {} as { [key: string]: boolean });

  if (isLoading && view === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (view === 'room' && room) {
    const config = themeConfigs[room.theme];

    return (
      <div className={`min-h-screen ${config.bgClass} relative overflow-hidden`}>
        {/* Audio Manager */}
        <AudioManager 
          theme={room.theme}
          activeObjects={activeObjects}
          isMuted={isMuted}
          roomCreatedAt={room.created_at}
        />

        <div className="absolute top-6 right-6 flex gap-3 z-10">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full bg-black bg-opacity-40 backdrop-blur-md hover:bg-opacity-60 transition-all flex items-center justify-center text-2xl border-2 border-white border-opacity-20"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={handleLeaveRoom}
            className="w-12 h-12 rounded-full bg-black bg-opacity-40 backdrop-blur-md hover:bg-opacity-60 transition-all flex items-center justify-center text-2xl border-2 border-white border-opacity-20"
            title="Leave Room"
          >
            ❌
          </button>
        </div>

        <div className="absolute top-6 left-6 z-10">
          <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl px-4 py-2 border-2 border-white border-opacity-20">
            <h1 className="text-xl font-bold">{config.name}</h1>
            <p className="text-sm opacity-70">ID: {room.id}</p>
            <p className="text-xs opacity-50 mt-1">
              {objects.filter(o => o.isAssigned).length} / {objects.length} players
            </p>
          </div>
        </div>

        <div className="h-screen w-screen relative">
          {objects.map((obj) => (
            <button
              key={obj.id}
              onClick={() => handleObjectClick(obj.id, obj.isMe)}
              disabled={!obj.isMe}
              className={`absolute transition-all duration-300 ${
                obj.isMe ? 'cursor-pointer hover:scale-110 animate-float' : 'cursor-default'
              } ${obj.isActive ? 'scale-110' : 'scale-100'}`}
              style={{ 
                top: obj.position.top, 
                left: obj.position.left,
                transform: 'translate(-50%, -50%)',
                width: `clamp(100px, ${obj.size.width}px, 20vw)`,
                height: `clamp(100px, ${obj.size.height}px, 20vw)`,
              }}
              title={obj.isMe ? `You are controlling this` : ''}
            >
              <div className="relative w-full h-full">
                {obj.isMe && (
                  <div className="absolute inset-0 bg-white rounded-lg opacity-30 blur-md animate-pulse-slow z-0"></div>
                )}
                
                <div className={`relative w-full h-full ${
                  obj.isMe ? 'ring-4 ring-white ring-opacity-50 rounded-lg' : ''
                } ${!obj.isAssigned ? 'grayscale opacity-40' : ''}`}>
                  {obj.isActive ? (
                    <img
                      src={obj.imagePath}
                      alt={obj.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <canvas
                      ref={(canvas) => {
                        if (canvas && !canvas.dataset.loaded) {
                          canvas.dataset.loaded = 'true';
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx?.drawImage(img, 0, 0);
                          };
                          img.src = obj.imagePath;
                        }
                      }}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {obj.isActive && obj.isAssigned && (
                  <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-10 animate-ping z-0"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
            50% { transform: translate(-50%, -50%) translateY(-10px); }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

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
