'use client';

import { useState } from 'react';

interface ThemeCardProps {
  title: string;
  imageUrl: string;
  theme: 'rainy' | 'midnight' | 'forest';
  description: string;
  colorClass: string;
  onSelect: (theme: 'rainy' | 'midnight' | 'forest') => void;
}

export default function ThemeCard({ title, imageUrl, theme, description, colorClass, onSelect }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`relative w-full h-full p-8 rounded-2xl transition-all duration-300 transform ${
        isHovered ? 'scale-105 shadow-2xl' : 'scale-100'
      } ${colorClass} hover:brightness-110`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(theme)}
    >
      <img src={imageUrl} alt={title} className="w-16 h-16 mx-auto mb-4" style={{ imageRendering: 'pixelated' }} />
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </button>
  );
}
