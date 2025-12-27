import React from "react";
import AudioManager from "@/components/AudioManager";
import GifObject from "@/components/GifObject";
import { RoomData, InteractiveObject, ThemeConfig } from "@/types";

interface RoomViewProps {
  room: RoomData;
  config: ThemeConfig;
  objects: InteractiveObject[];
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  handleLeaveRoom: () => void;
  handleObjectClick: (objectId: string, isMe: boolean) => void;
}

export default function RoomView({
  room,
  config,
  objects,
  isMuted,
  setIsMuted,
  handleLeaveRoom,
  handleObjectClick,
}: RoomViewProps) {
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
      <div className="absolute top-6 right-6 flex gap-4 z-50">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="hover:scale-110 transition-transform focus:outline-none"
        >
          <img 
            src={isMuted ? "/assets/mute.png" : "/assets/unmute.png"} 
            alt={isMuted ? "Unmute" : "Mute"} 
            className="w-14 h-14 drop-shadow-md"
          />
        </button>
        <button
          onClick={handleLeaveRoom}
          className="hover:scale-110 transition-transform focus:outline-none"
        >
          <img src="/assets/exit.png" alt="Leave Room" className="w-14 h-14 drop-shadow-md" />
        </button>
      </div>

      <div className="absolute top-6 left-6 z-50 font-mono select-none">
        <div className="bg-black/80 border-2 border-white/40 h-14 flex items-center px-4 gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col justify-center border-r border-white/20 pr-4 h-full">
            <h1 className="font-bold text-xs uppercase tracking-widest text-blue-300">
              {config.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase text-white/50 tracking-wider">ID</span>
            <span className="font-bold text-xl text-yellow-400 tracking-[0.1em] select-all cursor-text bg-white/5 px-2 py-0.5 border border-white/10">
              {room.id}
            </span>
          </div>
        </div>
      </div>

      {/* Game Window Container (16:9 Ratio) */}
      <div className="relative w-full max-w-6xl aspect-video bg-[#1a1a1a] shadow-2xl overflow-hidden border-4 border-gray-800 rounded-lg">
        {/* 1. Background Layer */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: config.bgImage
              ? `url('${config.bgImage}')`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            imageRendering: "pixelated", // Key for pixel art style
          }}
        >
          {/* If no background image, show default color */}
          {!config.bgImage && (
            <div className={`w-full h-full ${config.bgClass}`} />
          )}
        </div>

        {/* 2. Object Layer */}
        {objects.map((obj) => (
          <div
            key={obj.id}
            onClick={() => handleObjectClick(obj.id, obj.isMe)}
            className={`absolute transition-transform duration-300 select-none
                        ${
                          obj.isMe
                            ? "cursor-pointer z-20 hover:scale-105"
                            : "cursor-default z-10"
                        }
                        scale-100
                    `}
            style={{
              top: obj.position.top,
              left: obj.position.left,
              width: obj.size.width,
              height: "auto",
              transform: "translate(-50%, -50%)", // Center the positioning point
            }}
          >
            {/* Core logic change:
                        Do not switch images, use CSS Filter to indicate "inactive".
                        Inactive = Darkened + Grayscale
                        Active = Original color + Normal brightness
                     */}
            {obj.imagePath && (
              <div className="relative w-full h-full overflow-visible">
                <GifObject
                  src={obj.imagePath}
                  alt={obj.name}
                  isActive={obj.isActive}
                  className={`relative w-full h-full object-contain transition-all duration-500 z-10
                                  ${
                                    obj.isActive
                                      ? "grayscale-0 opacity-100"
                                      : "grayscale opacity-50 contrast-125"
                                  }
                                  ${
                                    obj.isMe
                                      ? "drop-shadow-[0_0_4px_rgba(60,130,250,1)] brightness-110"
                                      : obj.isActive
                                      ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                      : ""
                                  }
                              `}
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
