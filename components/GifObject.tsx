'use client';

import { useState, useEffect } from 'react';

interface GifObjectProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  isActive: boolean;
}

export default function GifObject({ src, alt, className, style, isActive }: GifObjectProps) {
  const [staticSrc, setStaticSrc] = useState<string | null>(null);

  useEffect(() => {
    // Generate static frame only once per source
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Drawing a GIF usually draws the first frame if done immediately upon load
        ctx.drawImage(img, 0, 0);
        try {
            setStaticSrc(canvas.toDataURL());
        } catch (e) {
            console.warn("Could not generate static frame for GIF", e);
        }
      }
    };
  }, [src]);

  return (
    <img 
      src={(isActive || !staticSrc) ? src : staticSrc} 
      alt={alt} 
      className={className} 
      style={style}
    />
  );
}
