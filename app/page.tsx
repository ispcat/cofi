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
  imagePath: string; // 這裡是 GIF 的路徑
  position: { top: string; left: string };
  size: { width: number; height: number };
  isActive: boolean;
  isMe: boolean;
  isAssigned: boolean;
}

// 設定檔：這裡我先幫你把 Rainy Room 的座標對應到你的新背景圖
const themeConfigs = {
  rainy: {
    name: 'Rainy Room',
    // 這裡改用 style 屬性直接吃圖片
    bgImage: '/assets/bg-main.png', 
    bgClass: 'bg-slate-900', // fallback color
    objects: [
      { 
        id: 'cat', 
        name: 'Vibing Cat',
        imagePath: '/assets/cat-strip.gif',
        // 根據你的新背景圖，貓咪大概在地毯位置
        position: { top: '68%', left: '42%' }, 
        size: { width: 140, height: 140 }
      },
      // 預留給之後的水壺 (目前先隱藏或你可以放暫位圖)
      { 
        id: 'kettle', 
        name: 'Kettle',
        imagePath: '', // 之後放 kettle.gif
        position: { top: '48%', left: '68%' }, // 桌子右邊
        size: { width: 100, height: 100 }
      },
      // 預留給之後的電腦
      { 
        id: 'computer', 
        name: 'Computer',
        imagePath: '', // 之後放 computer.gif
        position: { top: '42%', left: '55%' }, // 桌子左邊
        size: { width: 120, height: 120 }
      },
       // 預留給窗戶 (雨聲) - 這是一個隱形按鈕區域
       { 
        id: 'window', 
        name: 'Rain Window',
        imagePath: '', // 窗戶通常不需要圖，只要感應區
        position: { top: '35%', left: '20%' }, 
        size: { width: 300, height: 300 }
      },
    ],
  },
  // 其他房間先保持原樣，之後再改
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

  // ... (這裡的 useEffect 和 Polling 邏輯保持不變，為了版面簡潔我省略中間未變動的邏輯) ...
  // ... (請保留你原本的 useEffect, startPolling, handleJoinRoom 等函式) ...
  
  // ⚠️ 為了確保你可以直接複製貼上，這裡我把關鍵的 hook 邏輯補回來，請確認沒有遺漏
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
    // 安全檢查：如果 themeConfigs 沒有該主題的設定，給予預設值或跳過
    const config = themeConfigs[theme] || themeConfigs['rainy']; 
    
    // 對應 Server 回傳的 users 狀態與前端的 objects 設定
    const objectsWithState = config.objects.map(obj => {
      // 假設 user.object_id 對應 config.objects 裡的 id
      // 這裡有一個簡單的配對邏輯：如果後端 user 列表有這個 object_id，就代表被佔用了
      const user = users.find(u => u.object_id === obj.id);
      
      // 注意：這是一個簡單的 Hack，真實情況可能需要更嚴謹的分配邏輯
      // 這裡假設後端會分配 "cat", "window" 等 id 給使用者
      // 如果你的後端是用 0, 1, 2 索引，這裡需要修改
      
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
    // 這裡我們允許點擊自己的物件
    if (!isMe || !room) return;
    try {
      await fetch(`/api/rooms/${room.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      // 樂觀更新 UI
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

  const activeObjects = objects.reduce((acc, obj) => {
    acc[obj.id] = obj.isActive;
    return acc;
  }, {} as { [key: string]: boolean });

  if (isLoading && view === 'landing') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white animate-pulse">Loading...</div>;
  }

  // --- 渲染房間 (Room View) ---
  if (view === 'room' && room) {
    const config = themeConfigs[room.theme] || themeConfigs['rainy'];

    return (
      <div 
        className={`min-h-screen relative overflow-hidden flex items-center justify-center bg-black`}
      >
        <AudioManager 
          theme={room.theme}
          activeObjects={activeObjects}
          isMuted={isMuted}
          roomCreatedAt={room.created_at}
        />

        {/* 控制按鈕 UI */}
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

        {/* 遊戲視窗容器 (16:9 比例) */}
        <div className="relative w-full max-w-6xl aspect-video bg-[#1a1a1a] shadow-2xl overflow-hidden border-4 border-gray-800 rounded-lg">
            
            {/* 1. 背景層 */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: config.bgImage ? `url('${config.bgImage}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                imageRendering: 'pixelated', // 像素風關鍵
              }}
            >
                {/* 如果沒有背景圖，顯示預設顏色 */}
                {!config.bgImage && <div className={`w-full h-full ${config.bgClass}`} />}
            </div>

            {/* 2. 物件層 */}
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
                        height: obj.size.height,
                        transform: 'translate(-50%, -50%)', // 讓定位點在物件中心
                    }}
                >
                    {/* 核心邏輯修改：
                        不切換圖片，而是用 CSS Filter 來表示「未啟動」。
                        未啟動 = 變暗 + 黑白
                        啟動 = 原色 + 正常亮度
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

                    {/* 自己控制的物件會有一個指示器 */}
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

  // --- 著陸頁 (Landing View) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
        {/* Landing Page UI 保持不變 */}
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

        {/* 這裡保留你的 Modal 程式碼 (Create Room / Join Room) */}
        {showModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 p-8 rounded-2xl max-w-4xl w-full border border-gray-700">
                    <h2 className="text-3xl font-bold mb-6 text-center">Select Vibe</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* 這裡只讓 Rainy Room 能點擊 */}
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