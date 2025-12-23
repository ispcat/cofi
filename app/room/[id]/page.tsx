'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface RoomData {
  id: string;
  theme: 'rainy' | 'midnight' | 'forest';
  created_at: string;
}

interface InteractiveObject {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  isActive: boolean;
  sound?: string;
}

const themeConfigs = {
  rainy: {
    name: 'Rainy Room',
    bgClass: 'bg-gradient-to-br from-slate-700 via-blue-900 to-slate-800',
    objects: [
      { id: 'window', name: 'Window', icon: '🪟', x: 20, y: 20, isActive: false, sound: 'rain' },
      { id: 'lamp', name: 'Lamp', icon: '💡', x: 70, y: 30, isActive: false, sound: 'ambient' },
      { id: 'plant', name: 'Plant', icon: '🪴', x: 50, y: 60, isActive: false, sound: 'nature' },
      { id: 'book', name: 'Book', icon: '📖', x: 30, y: 70, isActive: false, sound: 'pages' },
    ],
  },
  midnight: {
    name: 'Midnight Mart',
    bgClass: 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900',
    objects: [
      { id: 'neon', name: 'Neon Sign', icon: '🏪', x: 50, y: 20, isActive: false, sound: 'buzz' },
      { id: 'fridge', name: 'Fridge', icon: '🧊', x: 25, y: 50, isActive: false, sound: 'hum' },
      { id: 'radio', name: 'Radio', icon: '📻', x: 75, y: 40, isActive: false, sound: 'lofi' },
      { id: 'vending', name: 'Vending Machine', icon: '🥤', x: 60, y: 70, isActive: false, sound: 'vending' },
    ],
  },
  forest: {
    name: 'Forest Camp',
    bgClass: 'bg-gradient-to-br from-green-900 via-orange-900 to-green-800',
    objects: [
      { id: 'fire', name: 'Campfire', icon: '🔥', x: 50, y: 60, isActive: false, sound: 'fire' },
      { id: 'tent', name: 'Tent', icon: '⛺', x: 30, y: 40, isActive: false, sound: 'rustling' },
      { id: 'trees', name: 'Trees', icon: '🌲', x: 20, y: 25, isActive: false, sound: 'wind' },
      { id: 'guitar', name: 'Guitar', icon: '🎸', x: 70, y: 55, isActive: false, sound: 'guitar' },
    ],
  },
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [objects, setObjects] = useState<InteractiveObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Room not found');
        }

        setRoom(data.room);
        setObjects(themeConfigs[data.room.theme].objects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRoom();
    }
  }, [params.id]);

  const toggleObject = (objectId: string) => {
    setObjects(prev =>
      prev.map(obj =>
        obj.id === objectId ? { ...obj, isActive: !obj.isActive } : obj
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-2xl">Loading room...</div>
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
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
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
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-black bg-opacity-30 backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold">{config.name}</h1>
          <p className="text-sm opacity-70">Room ID: {room.id}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all backdrop-blur-sm"
        >
          Leave Room
        </button>
      </div>

      {/* Interactive Objects */}
      <div className="h-screen relative">
        {objects.map((obj) => (
          <button
            key={obj.id}
            onClick={() => toggleObject(obj.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              obj.isActive
                ? 'scale-125 animate-pulse'
                : 'scale-100 hover:scale-110'
            }`}
            style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
            title={obj.name}
          >
            <div className="relative">
              <div className="text-6xl md:text-8xl filter drop-shadow-2xl">
                {obj.icon}
              </div>
              {obj.isActive && (
                <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
              )}
            </div>
            <p className="text-sm mt-2 font-medium">{obj.name}</p>
          </button>
        ))}
      </div>

      {/* Active Objects Display */}
      <div className="absolute bottom-6 left-6 right-6 bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-4">
        <p className="text-sm mb-2 opacity-70">Active Elements:</p>
        <div className="flex flex-wrap gap-2">
          {objects.filter(obj => obj.isActive).length === 0 ? (
            <span className="text-sm opacity-50">Click objects to activate sounds</span>
          ) : (
            objects
              .filter(obj => obj.isActive)
              .map(obj => (
                <span
                  key={obj.id}
                  className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm"
                >
                  {obj.icon} {obj.name}
                </span>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
