import React from "react";

interface PixelatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function PixelatedInput({ ...props }: PixelatedInputProps) {
  return (
    <input
      {...props}
      className="w-full bg-gray-900 border-4 border-gray-700 rounded-none py-4 text-center text-3xl tracking-[0.5em] font-mono focus:outline-none focus:border-blue-500"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
