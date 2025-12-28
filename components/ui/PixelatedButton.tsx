import React from "react";

interface PixelatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function PixelatedButton({
  children,
  ...props
}: PixelatedButtonProps) {
  return (
    <button
      {...props}
      className="w-full h-16 bg-contain bg-center bg-no-repeat transition-all hover:scale-105 active:scale-95 hover:brightness-110 filter drop-shadow-lg"
      style={{
        backgroundImage: "url('/assets/ui/button-bg_compressed.png')",
        imageRendering: "pixelated",
        backgroundSize: "100% 100%",
      }}
    >
      <span
        className="text-orange-100 text-center text-lg md:text-xl font-bold tracking-widest"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          textShadow: "2px 2px 0px #000",
        }}
      >
        {children}
      </span>
    </button>
  );
}
