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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      <div className="z-10 text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Co-Fi
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Collaborative Lofi Music Generator
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={onShowCreateModal}
            className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Create Room
          </button>
          <button
            onClick={onShowJoinModal}
            className="px-8 py-4 border-2 border-white/20 font-bold rounded-full hover:bg-white/10 transition-colors"
          >
            Join Room
          </button>
        </div>
        {error && (
          <p className="text-red-400 mt-4 bg-red-900/20 py-2 rounded">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
