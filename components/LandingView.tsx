import React from "react";

interface LandingViewProps {
  onShowCreateModal: () => void;
  onShowJoinModal: () => void;
  error?: string;
}

export default function LandingView({
  onShowCreateModal,
  onShowJoinModal,
  error,
}: LandingViewProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-900 overflow-hidden">
      
      {/* 1. Background Image Layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/landing/landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated", 
          opacity: 0.85, 
        }}
      />

      {/* 2. Black Overlay Layer */}
      <div className="absolute inset-0 z-0 bg-black/60" />

      {/* 3. Content Layer */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-5xl px-4 -mt-20 md:-mt-32">
        
        {/* --- Logo Area --- */}
        <img
          src="/landing/logo-glow.png"
          alt="Co-Fi"
          className="w-[340px] md:w-[480px] drop-shadow-[0_0_25px_rgba(253,224,71,0.6)] animate-pulse"
          style={{ imageRendering: "pixelated" }}
        />

        {/* --- Subtitle --- */}
        <p
          className="text-orange-100 text-center text-lg md:text-2xl font-bold tracking-widest drop-shadow-md z-20 -mt-28 md:-mt-40"
          style={{ fontFamily: "'Courier New', Courier, monospace", textShadow: "2px 2px 0px #000" }}
        >
          Collaborative Lofi Music
        </p>

        {/* --- Button Area (Responsive) --- */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-4 mt-4 w-full">
          
          {/* Create Room Button */}
          <button
            onClick={onShowCreateModal}
            // Style Explanation:
            // w-[60vw]: Mobile width 60% of viewport
            // md:w-[22vw]: Desktop width 22% of viewport
            // aspect-[3/1]: Locked aspect ratio 3:1 (width:height)
            // max-w-[400px]: Max width to prevent excessive scaling on large screens
            className="w-[60vw] md:w-[22vw] max-w-[400px] aspect-[3/1] bg-contain bg-center bg-no-repeat transition-all hover:scale-105 active:scale-95 hover:brightness-110 filter drop-shadow-xl"
            style={{
              backgroundImage: "url('/landing/btn-create.png')",
              imageRendering: "pixelated",
            }}
          >
            <span className="sr-only">Create Room</span>
          </button>

          {/* Join Room Button */}
          <button
            onClick={onShowJoinModal}
            className="w-[60vw] md:w-[22vw] max-w-[400px] aspect-[3/1] bg-contain bg-center bg-no-repeat transition-all hover:scale-105 active:scale-95 hover:brightness-110 filter drop-shadow-xl"
            style={{
              backgroundImage: "url('/landing/btn-join.png')",
              imageRendering: "pixelated",
            }}
          >
            <span className="sr-only">Join Room</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute bottom-10 bg-red-900/90 border-4 border-red-500 text-white px-8 py-3 rounded-xl backdrop-blur-md animate-bounce font-bold text-xl shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}