export interface RoomData {
  id: string;
  theme: "rainy" | "midnight" | "forest";
  created_at: string;
}

export interface RoomUser {
  room_id: string;
  user_id: string;
  object_id: string;
  is_active: number;
  joined_at: string;
  last_seen: string;
}

export interface InteractiveObject {
  id: string;
  name: string;
  imagePath: string; // Path to the GIF
  soundPath?: string; // Path to the sound file
  position: { top: string; left: string };
  size: { width: string };
  isActive: boolean;
  isMe: boolean;
  isAssigned: boolean;
}

export interface ThemeConfig {
  name: string;
  bgImage: string;
  bgClass: string;
  objects: Omit<InteractiveObject, "isActive" | "isMe" | "isAssigned">[];
  decorations?: {
    id: string;
    name: string;
    imagePath: string;
    position: { top: string; left: string };
    size: { width: string };
  }[];
}

export type ThemeConfigs = Record<string, ThemeConfig>;
