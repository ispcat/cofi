"use client";

import { useEffect, useRef, useState } from "react";

interface InteractiveObject {
  id: string;
  name: string;
  imagePath: string;
  soundPath?: string;
  isActive: boolean;
}

interface AudioManagerProps {
  theme: "rainy" | "midnight" | "forest";
  objects: InteractiveObject[];
  isMuted: boolean;
  roomCreatedAt: string;
}

export default function AudioManager({
  theme,
  objects,
  isMuted,
  roomCreatedAt,
}: AudioManagerProps) {
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const objectAudiosRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [blocked, setBlocked] = useState(false);

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

  // Helper to resume/play audio manually
  const resumeAudio = () => {
    if (backgroundAudioRef.current) {
      const bgAudio = backgroundAudioRef.current;
      const syncTime = getSyncedPlaybackTime(bgAudio);
      // Only set time if significant drift or not started
      if (Math.abs(bgAudio.currentTime - syncTime) > 1) {
        bgAudio.currentTime = syncTime;
      }
      bgAudio.play().catch(console.error);
    }
    setBlocked(false);
  };

  // Initialize and start audio immediately when entering room
  useEffect(() => {
    if (isInitialized) return;

    // Create and start background audio
    const bgAudio = new Audio(`/sounds/room/${theme}/background.mp3`);
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    bgAudio.muted = isMuted;
    backgroundAudioRef.current = bgAudio;

    // Pre-load object sounds
    objects.forEach((obj) => {
      if (!obj.soundPath) return;
      const audio = new Audio(obj.soundPath);
      audio.loop = true;
      audio.volume = 0.7;
      audio.muted = isMuted;
      objectAudiosRef.current[obj.id] = audio;
    });

    // Wait for audio metadata to load, then sync playback position
    bgAudio.addEventListener("loadedmetadata", () => {
      const syncTime = getSyncedPlaybackTime(bgAudio);
      bgAudio.currentTime = syncTime;
      console.log(`Syncing background music to ${syncTime.toFixed(2)}s`);
    });

    // Start background music immediately
    const playPromise = bgAudio.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log("Background music autoplay blocked by browser.");
        setBlocked(true);

        // Fallback: also listen for global clicks just in case user ignores overlay
        const autoResume = () => {
          resumeAudio();
          document.removeEventListener("click", autoResume);
          document.removeEventListener("keydown", autoResume);
          document.removeEventListener("touchstart", autoResume);
        };

        document.addEventListener("click", autoResume, { once: true });
        document.addEventListener("keydown", autoResume, { once: true });
        document.addEventListener("touchstart", autoResume, { once: true });
      });
    }

    setIsInitialized(true);
  }, [theme, objects, isMuted, isInitialized, roomCreatedAt]);

  // Handle mute/unmute
  useEffect(() => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.muted = isMuted;
    }

    Object.values(objectAudiosRef.current).forEach((audio) => {
      audio.muted = isMuted;
    });
  }, [isMuted]);

  // Handle object sound activation
  useEffect(() => {
    if (!isInitialized) return;

    objects.forEach((obj) => {
      const audio = objectAudiosRef.current[obj.id];
      if (!audio) return;

      if (obj.isActive) {
        audio
          .play()
          .catch((err) => console.log("Object sound play error:", err));
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, [objects, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }

      Object.values(objectAudiosRef.current).forEach((audio) => {
        audio.pause();
      });
      objectAudiosRef.current = {};
    };
  }, []);

  if (!blocked) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
      onClick={resumeAudio}
    >
      <img
        src="/assets/control/play.png"
        alt="Click to Start Audio"
        className="w-24 h-24 hover:scale-110 transition-transform animate-pulse mb-4"
      />
      <p className="text-white/80 font-mono text-sm uppercase tracking-widest drop-shadow-md">
        Click to Start Audio
      </p>
    </div>
  );
}
