import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'rooms.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    theme TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Room {
  id: string;
  theme: 'rainy' | 'midnight' | 'forest';
  created_at: string;
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

export default db;
