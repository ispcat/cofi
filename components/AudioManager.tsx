'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioManagerProps {
  theme: 'rainy' | 'midnight' | 'forest';
  activeObjects: { [key: string]: boolean };
  isMuted: boolean;
  roomCreatedAt: string;
}

export default function AudioManager({ theme, activeObjects, isMuted, roomCreatedAt }: AudioManagerProps) {
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const objectAudiosRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate synchronized playback position based on room creation time
  const getSyncedPlaybackTime = (audio: HTMLAudioElement) => {
    const roomCreatedTime = new Date(roomCreatedAt).getTime();
    const now = Date.now();
    const elapsed = (now - roomCreatedTime) / 1000; // seconds
    
    if (audio.duration && !isNaN(audio.duration)) {
      return elapsed % audio.duration;
    }
    return 0;
  };

  // Initialize and start audio immediately when entering room
  useEffect(() => {
    if (isInitialized) return;

    // Create and start background audio
    const bgAudio = new Audio(`/sounds/${theme}/background.mp3`);
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    bgAudio.muted = isMuted;
    backgroundAudioRef.current = bgAudio;

    // Pre-load object sounds
    const objectKeys = Object.keys(activeObjects);
    objectKeys.forEach(key => {
      const audio = new Audio(`/sounds/${theme}/${key}.mp3`);
      audio.loop = true;
      audio.volume = 0.7;
      audio.muted = isMuted;
      objectAudiosRef.current[key] = audio;
    });

    // Wait for audio metadata to load, then sync playback position
    bgAudio.addEventListener('loadedmetadata', () => {
      const syncTime = getSyncedPlaybackTime(bgAudio);
      bgAudio.currentTime = syncTime;
      console.log(`Syncing background music to ${syncTime.toFixed(2)}s`);
    });

    // Start background music immediately
    const playPromise = bgAudio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('Background music autoplay blocked by browser, will play on first user interaction');
        
        // Fallback: play on first user interaction
        const playAudio = () => {
          const syncTime = getSyncedPlaybackTime(bgAudio);
          bgAudio.currentTime = syncTime;
          bgAudio.play().catch(e => console.log('Audio play error:', e));
          document.removeEventListener('click', playAudio);
          document.removeEventListener('keydown', playAudio);
          document.removeEventListener('touchstart', playAudio);
        };
        
        document.addEventListener('click', playAudio, { once: true });
        document.addEventListener('keydown', playAudio, { once: true });
        document.addEventListener('touchstart', playAudio, { once: true });
      });
    }

    setIsInitialized(true);
  }, [theme, activeObjects, isMuted, isInitialized, roomCreatedAt]);

  // Handle mute/unmute
  useEffect(() => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.muted = isMuted;
    }

    Object.values(objectAudiosRef.current).forEach(audio => {
      audio.muted = isMuted;
    });
  }, [isMuted]);

  // Handle object sound activation
  useEffect(() => {
    if (!isInitialized) return;

    Object.entries(activeObjects).forEach(([objectId, isActive]) => {
      const audio = objectAudiosRef.current[objectId];
      if (!audio) return;

      if (isActive) {
        audio.play().catch(err => console.log('Object sound play error:', err));
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, [activeObjects, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }

      Object.values(objectAudiosRef.current).forEach(audio => {
        audio.pause();
      });
      objectAudiosRef.current = {};
    };
  }, []);

  return null;
}
