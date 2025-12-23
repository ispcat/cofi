'use client';

import { useState } from 'react';

interface ThemeCardProps {
  title: string;
  icon: string;
  theme: 'rainy' | 'midnight' | 'forest';
  description: string;
  colorClass: string;
  onSelect: (theme: 'rainy' | 'midnight' | 'forest') => void;
}

export default function ThemeCard({ title, icon, theme, description, colorClass, onSelect }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`relative p-8 rounded-2xl transition-all duration-300 transform ${
        isHovered ? 'scale-105 shadow-2xl' : 'scale-100'
      } ${colorClass} hover:brightness-110`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(theme)}
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </button>
  );
}
