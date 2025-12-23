'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
}

interface InteractiveObject {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  isActive: boolean;
  isMe: boolean;
}

const themeConfigs = {
  rainy: {
    name: 'Rainy Room',
    bgClass: 'bg-gradient-to-br from-slate-700 via-blue-900 to-slate-800',
    objects: [
      { id: 'window', name: 'Window', icon: '🪟', x: 20, y: 20 },
      { id: 'lamp', name: 'Lamp', icon: '💡', x: 70, y: 30 },
      { id: 'plant', name: 'Plant', icon: '🪴', x: 50, y: 60 },
      { id: 'book', name: 'Book', icon: '📖', x: 30, y: 70 },
    ],
  },
  midnight: {
    name: 'Midnight Mart',
    bgClass: 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900',
    objects: [
      { id: 'neon', name: 'Neon Sign', icon: '🏪', x: 50, y: 20 },
      { id: 'fridge', name: 'Fridge', icon: '🧊', x: 25, y: 50 },
      { id: 'radio', name: 'Radio', icon: '📻', x: 75, y: 40 },
      { id: 'vending', name: 'Vending Machine', icon: '🥤', x: 60, y: 70 },
    ],
  },
  forest: {
    name: 'Forest Camp',
    bgClass: 'bg-gradient-to-br from-green-900 via-orange-900 to-green-800',
    objects: [
      { id: 'fire', name: 'Campfire', icon: '🔥', x: 50, y: 60 },
      { id: 'tent', name: 'Tent', icon: '⛺', x: 30, y: 40 },
      { id: 'trees', name: 'Trees', icon: '🌲', x: 20, y: 25 },
      { id: 'guitar', name: 'Guitar', icon: '🎸', x: 70, y: 55 },
    ],
  },
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [objects, setObjects] = useState<InteractiveObject[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initRoom = async () => {
      try {
        const joinResponse = await fetch(`/api/rooms/${params.id}/join`, {
          method: 'POST',
        });
        const joinData = await joinResponse.json();

        if (!joinResponse.ok) {
          throw new Error(joinData.error || 'Failed to join room');
        }

        setUserId(joinData.userId);

        const roomResponse = await fetch(`/api/rooms/${params.id}`);
        const roomData = await roomResponse.json();

        if (!roomResponse.ok) {
          throw new Error(roomData.error || 'Room not found');
        }

        setRoom(roomData.room);
        updateObjects(roomData.room.theme, roomData.users, joinData.userId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      initRoom();
    }
  }, [params.id]);

  const updateObjects = (theme: RoomData['theme'], users: RoomUser[], currentUserId: string) => {
    const config = themeConfigs[theme];
    const objectsWithState = config.objects.map(obj => {
      const user = users.find(u => u.object_id === obj.id);
      return {
        ...obj,
        isActive: user ? user.is_active === 1 : false,
        isMe: user ? user.user_id === currentUserId : false,
      };
    });
    setObjects(objectsWithState);
  };

  const handleObjectClick = async (objectId: string, isMe: boolean) => {
    if (!isMe) return;

    try {
      const response = await fetch(`/api/rooms/${params.id}/toggle`, {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-2xl animate-pulse">Loading room...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-2xl text-red-400 mb-4">{error || 'Room not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const config = themeConfigs[room.theme];

  return (
    <div className={`min-h-screen ${config.bgClass} relative overflow-hidden`}>
      <div className="absolute top-6 right-6 flex gap-3 z-10">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-12 h-12 rounded-full bg-black bg-opacity-40 backdrop-blur-md hover:bg-opacity-60 transition-all flex items-center justify-center text-2xl border-2 border-white border-opacity-20"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          onClick={() => router.push('/')}
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
        </div>
      </div>

      <div className="h-screen relative">
        {objects.map((obj) => (
          <button
            key={obj.id}
            onClick={() => handleObjectClick(obj.id, obj.isMe)}
            disabled={!obj.isMe}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              obj.isMe ? 'cursor-pointer hover:scale-110 animate-float' : 'cursor-default'
            } ${obj.isActive ? 'scale-125' : 'scale-100'}`}
            style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
            title={obj.isMe ? `You are ${obj.name}` : obj.name}
          >
            <div className="relative">
              {obj.isMe && (
                <div className="absolute inset-0 bg-white rounded-lg opacity-30 blur-md animate-pulse-slow"></div>
              )}
              <div className={`text-6xl md:text-8xl filter drop-shadow-2xl ${
                obj.isMe ? 'border-4 border-white rounded-lg p-2 bg-black bg-opacity-20' : ''
              }`}>
                {obj.icon}
              </div>
              {obj.isActive && (
                <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-20 animate-ping"></div>
              )}
            </div>
            <p className={`text-sm mt-2 font-bold ${obj.isMe ? 'text-yellow-300' : ''}`}>
              {obj.isMe ? '👆 You' : obj.name}
            </p>
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
