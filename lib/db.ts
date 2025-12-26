import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'rooms.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    theme TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS room_users (
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    object_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  )
`);

export interface Room {
  id: string;
  theme: 'rainy' | 'midnight' | 'forest';
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

export function createRoom(id: string, theme: Room['theme']): Room {
  const stmt = db.prepare('INSERT INTO rooms (id, theme) VALUES (?, ?)');
  stmt.run(id, theme);
  return getRoomById(id)!;
}

export function getRoomById(id: string): Room | null {
  const stmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
  const room = stmt.get(id) as Room | undefined;
  return room || null;
}

export function generateRoomId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  if (getRoomById(id)) {
    return generateRoomId();
  }
  
  return id;
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function assignUserToObject(roomId: string, userId: string, objectId: string): void {
  const existing = getUserObject(roomId, userId);
  if (existing) {
    // Update last_seen if user already exists
    updateUserActivity(roomId, userId);
    return;
  }
  
  const stmt = db.prepare('INSERT INTO room_users (room_id, user_id, object_id, is_active, last_seen) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)');
  stmt.run(roomId, userId, objectId);
}

export function getRoomUsers(roomId: string): RoomUser[] {
  const stmt = db.prepare('SELECT * FROM room_users WHERE room_id = ?');
  const users = stmt.all(roomId) as RoomUser[];
  
  // Filter out offline users (inactive for more than 30 seconds)
  const now = Date.now();
  return users.filter(user => {
    const lastSeen = new Date(user.last_seen + ' UTC').getTime();
    const isOnline = (now - lastSeen) < 30000; // 30 seconds timeout
    return isOnline;
  });
}

export function updateUserActivity(roomId: string, userId: string): void {
  const stmt = db.prepare('UPDATE room_users SET last_seen = CURRENT_TIMESTAMP WHERE room_id = ? AND user_id = ?');
  stmt.run(roomId, userId);
}

export function cleanupInactiveUsers(roomId: string): void {
  const stmt = db.prepare(`
    DELETE FROM room_users 
    WHERE room_id = ? 
    AND (julianday('now') - julianday(last_seen)) * 86400 > 30
  `);
  stmt.run(roomId);
}

export function getUserObject(roomId: string, userId: string): RoomUser | null {
  const stmt = db.prepare('SELECT * FROM room_users WHERE room_id = ? AND user_id = ?');
  return stmt.get(roomId, userId) as RoomUser | undefined || null;
}

export function toggleUserObject(roomId: string, userId: string): void {
  const stmt = db.prepare('UPDATE room_users SET is_active = NOT is_active WHERE room_id = ? AND user_id = ?');
  stmt.run(roomId, userId);
}

export function getAvailableObjects(roomId: string, theme: Room['theme']): string[] {
  const themeObjects: Record<Room['theme'], string[]> = {
    rainy: ['cat', 'kettle', 'computer', 'window'],
    midnight: ['neon', 'fridge', 'radio', 'vending'],
    forest: ['fire', 'tent', 'trees', 'guitar'],
  };
  
  const allObjects = themeObjects[theme];
  const assignedObjects = getRoomUsers(roomId).map(u => u.object_id);
  const available = allObjects.filter(obj => !assignedObjects.includes(obj));
  
  // If all objects are taken, allow reassignment (multiple users per object)
  return available.length > 0 ? available : allObjects;
}

export default db;
