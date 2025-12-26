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
  imagePath: string; // Path to the GIF
  soundPath?: string; // Path to the sound file
  position: { top: string; left: string };
  size: { width: string };
  isActive: boolean;
  isMe: boolean;
  isAssigned: boolean;
}

// Config: Mapping Rainy Room coordinates to the new background image
const themeConfigs = {
  rainy: {
    name: 'Rainy Room',
    // Using style attribute to directly load the image
    bgImage: '/assets/bg-main.png', 
    bgClass: 'bg-slate-900', // fallback color
    objects: [
      { 
        id: 'cat', 
        name: 'Vibing Cat',
        imagePath: '/assets/cat-strip.gif',
        soundPath: '/sounds/rainy/cat-strip.wav',
        // Based on the new background, the cat is around the carpet area
        position: { top: '68%', left: '42%' }, 
        size: { width: '12%' }
      },
      // Reserved for the kettle (currently hidden or use a placeholder)
      { 
        id: 'kettle', 
        name: 'Kettle',
        imagePath: '/assets/kettle-boiling.gif', 
        soundPath: '/sounds/rainy/kettle-boiling.wav',
        position: { top: '48%', left: '68%' }, // Right side of the table
        size: { width: '9%' }
      },
      // Reserved for the computer
      { 
        id: 'computer', 
        name: 'Computer',
        imagePath: '/assets/computer-running.gif', 
        soundPath: '/sounds/rainy/computer-running.wav',
        position: { top: '42%', left: '55%' }, // Left side of the table
        size: { width: '11%' }
      },
       // Reserved for the window (rain sound) - This is an invisible button area
       { 
        id: 'window', 
        name: 'Rain Window',
        imagePath: '/assets/window-raining.gif', 
        soundPath: '/sounds/rainy/window-raining.wav',
        position: { top: '35%', left: '20%' }, 
        size: { width: '26%' }
      },
    ],
  },
  // Keep other rooms as is for now, update later
  midnight: {
    name: 'Midnight Mart',
    bgImage: '',
    bgClass: 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900',
    objects: [],
  },
  forest: {
    name: 'Forest Camp',
    bgImage: '',
    bgClass: 'bg-gradient-to-br from-green-900 via-orange-900 to-green-800',
    objects: [],
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

  // ... (useEffect and Polling logic remains unchanged, omitted for brevity) ...
  // ... (Please keep your original useEffect, startPolling, handleJoinRoom, etc.) ...
  
  // ⚠️ To ensure you can copy-paste directly, I've added back the key hook logic. Please check for any omissions.
  useEffect(() => {
    const savedRoomId = localStorage.getItem('cofi_room_id');
    const savedUserId = localStorage.getItem('cofi_user_id');
    if (savedRoomId && savedUserId) reconnectToRoom(savedRoomId, savedUserId);
  }, []);

  useEffect(() => {
    if (view === 'room' && room && userId) {
      startPolling();
      startHeartbeat();
    } else {
      stopPolling();
      stopHeartbeat();
    }
    return () => { stopPolling(); stopHeartbeat(); };
  }, [view, room, userId]);

  const startPolling = () => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(async () => {
      if (!room || !userId) return;
      try {
        const response = await fetch(`/api/rooms/${room.id}`);
        const data = await response.json();
        if (response.ok) updateObjects(room.theme, data.users, userId);
      } catch (err) { console.error('Polling error:', err); }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
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
      } catch (err) { console.error('Heartbeat error:', err); }
    }, 10000);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) { clearInterval(heartbeatIntervalRef.current); heartbeatIntervalRef.current = null; }
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
        if (!joinResponse.ok) throw new Error(joinData.error || 'Failed to rejoin');
        
        const roomResponse = await fetch(`/api/rooms/${roomId}`);
        const roomData = await roomResponse.json();
        if (!roomResponse.ok) throw new Error(roomData.error || 'Room not found');

        setUserId(joinData.userId);
        setRoom(roomData.room);
        updateObjects(roomData.room.theme, roomData.users, joinData.userId);
        setView('room');
    } catch (err) {
        console.error(err);
        localStorage.removeItem('cofi_room_id');
        localStorage.removeItem('cofi_user_id');
    } finally { setIsLoading(false); }
  };

  const handleCreateRoom = async (theme: 'rainy' | 'midnight' | 'forest') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await joinRoom(data.room.id);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); setIsLoading(false); }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinRoom(joinRoomId);
  };

  const joinRoom = async (roomId: string) => {
    setIsLoading(true);
    try {
        const savedUserId = localStorage.getItem('cofi_user_id');
        const body = savedUserId ? { userId: savedUserId } : {};
        const joinResponse = await fetch(`/api/rooms/${roomId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const joinData = await joinResponse.json();
        if (!joinResponse.ok) throw new Error(joinData.error);

        const roomResponse = await fetch(`/api/rooms/${roomId}`);
        const roomData = await roomResponse.json();
        if (!roomResponse.ok) throw new Error(roomData.error);

        localStorage.setItem('cofi_room_id', roomId);
        localStorage.setItem('cofi_user_id', joinData.userId);

        setUserId(joinData.userId);
        setRoom(roomData.room);
        updateObjects(roomData.room.theme, roomData.users, joinData.userId);
        setView('room');
        setShowModal(false);
        setShowJoinInput(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); setIsLoading(false); }
  };

  const updateObjects = (theme: RoomData['theme'], users: RoomUser[], currentUserId: string) => {
    // Safety check: If themeConfigs doesn't have settings for this theme, use default or skip
    const config = themeConfigs[theme] || themeConfigs['rainy']; 
    
    // Map Server returned users status to frontend objects settings
    const objectsWithState = config.objects.map(obj => {
      // Assuming user.object_id corresponds to id in config.objects
      // Simple matching logic: If backend user list has this object_id, it is taken
      const user = users.find(u => u.object_id === obj.id);
      
      // Note: This is a simple hack. Real scenarios might need stricter assignment logic
      // Assuming backend assigns ids like "cat", "window" to users
      // If your backend uses 0, 1, 2 indices, modify here
      
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
    // We allow clicking on one's own object
    if (!isMe || !room) return;
    try {
      await fetch(`/api/rooms/${room.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      // Optimistic UI update
      setObjects(prev => prev.map(obj => obj.id === objectId ? { ...obj, isActive: !obj.isActive } : obj));
    } catch (err) { console.error(err); }
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

  if (isLoading && view === 'landing') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white animate-pulse">Loading...</div>;
  }

  // --- Render Room (Room View) ---
  if (view === 'room' && room) {
    const config = themeConfigs[room.theme] || themeConfigs['rainy'];

    return (
      <div 
        className={`min-h-screen relative overflow-hidden flex items-center justify-center bg-black`}
      >
        <AudioManager 
          theme={room.theme}
          objects={objects}
          isMuted={isMuted}
          roomCreatedAt={room.created_at}
        />

        {/* Control Button UI */}
        <div className="absolute top-6 right-6 flex gap-3 z-50">
          <button onClick={() => setIsMuted(!isMuted)} className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-2xl border-2 border-white/20 flex items-center justify-center transition-all">
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button onClick={handleLeaveRoom} className="w-12 h-12 rounded-full bg-red-900/50 hover:bg-red-900/70 text-xl border-2 border-white/20 flex items-center justify-center transition-all">
            🚪
          </button>
        </div>

        <div className="absolute top-6 left-6 z-50">
          <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-white">
             <h1 className="font-bold">{config.name}</h1>
             <p className="text-xs opacity-70">Room: {room.id}</p>
          </div>
        </div>

        {/* Game Window Container (16:9 Ratio) */}
        <div className="relative w-full max-w-6xl aspect-video bg-[#1a1a1a] shadow-2xl overflow-hidden border-4 border-gray-800 rounded-lg">
            
            {/* 1. Background Layer */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: config.bgImage ? `url('${config.bgImage}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                imageRendering: 'pixelated', // Key for pixel art style
              }}
            >
                {/* If no background image, show default color */}
                {!config.bgImage && <div className={`w-full h-full ${config.bgClass}`} />}
            </div>

            {/* 2. Object Layer */}
            {objects.map((obj) => (
                <div
                    key={obj.id}
                    onClick={() => handleObjectClick(obj.id, obj.isMe)}
                    className={`absolute transition-transform duration-300 select-none
                        ${obj.isMe ? 'cursor-pointer z-20 hover:scale-105' : 'cursor-default z-10'}
                        ${obj.isActive ? 'scale-100' : 'scale-95'}
                    `}
                    style={{ 
                        top: obj.position.top, 
                        left: obj.position.left,
                        width: obj.size.width,
                        height: 'auto',
                        transform: 'translate(-50%, -50%)', // Center the positioning point
                    }}
                >
                    {/* Core logic change:
                        Do not switch images, use CSS Filter to indicate "inactive".
                        Inactive = Darkened + Grayscale
                        Active = Original color + Normal brightness
                     */}
                    {obj.imagePath && (
                        <img 
                            src={obj.imagePath} 
                            alt={obj.name}
                            className={`w-full h-full object-contain transition-all duration-500
                                ${obj.isActive ? 'grayscale-0 opacity-100 drop-shadow-lg' : 'grayscale opacity-50 contrast-125'}
                            `}
                            style={{ imageRendering: 'pixelated' }}
                        />
                    )}

                    {/* Indicator for object controlled by self */}
                    {obj.isMe && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg animate-bounce">
                                YOU
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    );
  }

  // --- Landing Page (Landing View) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
        {/* Landing Page UI remains unchanged */}
        <div className="z-10 text-center space-y-8">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Co-Fi
            </h1>
            <p className="text-gray-400 text-lg mb-8">Collaborative Lofi Music Generator</p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                    Create Room
                </button>
                <button onClick={() => setShowJoinInput(true)} className="px-8 py-4 border-2 border-white/20 font-bold rounded-full hover:bg-white/10 transition-colors">
                    Join Room
                </button>
            </div>
            {error && <p className="text-red-400 mt-4 bg-red-900/20 py-2 rounded">{error}</p>}
        </div>

        {/* Keeping your Modal code (Create Room / Join Room) */}
        {showModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 p-8 rounded-2xl max-w-4xl w-full border border-gray-700">
                    <h2 className="text-3xl font-bold mb-6 text-center">Select Vibe</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Only allow clicking on Rainy Room */}
                        <ThemeCard 
                            title="Rainy Room" icon="🌧️" theme="rainy" 
                            description="Chill beats & Rain" 
                            colorClass="bg-blue-900/50 border-blue-500/50" 
                            onSelect={handleCreateRoom} 
                        />
                        <div className="opacity-50 cursor-not-allowed grayscale">
                             <ThemeCard title="Midnight Mart" icon="🏪" theme="midnight" description="Coming Soon" colorClass="bg-purple-900" onSelect={()=>{}} />
                        </div>
                        <div className="opacity-50 cursor-not-allowed grayscale">
                             <ThemeCard title="Forest Camp" icon="🔥" theme="forest" description="Coming Soon" colorClass="bg-orange-900" onSelect={()=>{}} />
                        </div>
                    </div>
                    <button onClick={() => setShowModal(false)} className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                </div>
            </div>
        )}

        {showJoinInput && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                 <form onSubmit={handleJoinRoom} className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-center">Enter Room ID</h2>
                    <input 
                        type="text" value={joinRoomId} onChange={e => setJoinRoomId(e.target.value.toUpperCase())}
                        maxLength={4} placeholder="ABCD"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg py-4 text-center text-3xl tracking-[1em] font-mono mb-6 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowJoinInput(false)} className="flex-1 py-3 bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-lg font-bold">Join</button>
                    </div>
                 </form>
            </div>
        )}
    </div>
  );
}