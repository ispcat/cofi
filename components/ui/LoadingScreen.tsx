import React from "react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* 1. Background Image Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/landing/landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          opacity: 0.85,
        }}
      />
      {/* 2. Black Overlay Layer */}
      <div className="absolute inset-0 z-0 bg-black/60" />
      {/* 3. Content Layer */}
      <div className="z-10 flex flex-col items-center justify-center">
        <img
          src="/assets/ui/loading-spinner.gif"
          alt="Loading..."
          className="w-32 h-32"
          style={{ imageRendering: "pixelated" }}
        />
        <p
          className="text-orange-100 text-center text-2xl font-bold tracking-widest mt-4"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            textShadow: "2px 2px 0px #000",
          }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
