import { neon } from '@netlify/neon';

const sql = neon();

// Initialize tables (call this on first request or in a setup script)
export async function initializeTables(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      theme TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS room_users (
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      object_id TEXT NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `;
}

export interface Room {
  id: string;
  theme: 'rainy' | 'midnight' | 'forest';
  created_at: string;
}

export interface RoomUser {
  room_id: string;
  user_id: string;
  object_id: string;
  is_active: boolean;
  joined_at: string;
  last_seen: string;
}

export async function createRoom(id: string, theme: Room['theme']): Promise<Room> {
  await sql`INSERT INTO rooms (id, theme) VALUES (${id}, ${theme})`;
  const room = await getRoomById(id);
  return room!;
}

export async function getRoomById(id: string): Promise<Room | null> {
  const rows = await sql`SELECT * FROM rooms WHERE id = ${id}`;
  return (rows[0] as Room) || null;
}

export async function generateRoomId(): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const existing = await getRoomById(id);
  if (existing) {
    return generateRoomId();
  }

  return id;
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function assignUserToObject(roomId: string, userId: string, objectId: string): Promise<void> {
  const existing = await getUserObject(roomId, userId);
  if (existing) {
    await updateUserActivity(roomId, userId);
    return;
  }

  await sql`
    INSERT INTO room_users (room_id, user_id, object_id, is_active, last_seen)
    VALUES (${roomId}, ${userId}, ${objectId}, FALSE, CURRENT_TIMESTAMP)
  `;
}

export async function getRoomUsers(roomId: string): Promise<RoomUser[]> {
  const users = await sql`SELECT * FROM room_users WHERE room_id = ${roomId}`;

  const now = Date.now();
  return (users as RoomUser[]).filter(user => {
    const lastSeen = new Date(user.last_seen).getTime();
    const isOnline = (now - lastSeen) < 30000;
    return isOnline;
  });
}

export async function updateUserActivity(roomId: string, userId: string): Promise<void> {
  await sql`
    UPDATE room_users
    SET last_seen = CURRENT_TIMESTAMP
    WHERE room_id = ${roomId} AND user_id = ${userId}
  `;
}

export async function cleanupInactiveUsers(roomId: string): Promise<void> {
  await sql`
    DELETE FROM room_users
    WHERE room_id = ${roomId}
    AND last_seen < CURRENT_TIMESTAMP - INTERVAL '30 seconds'
  `;
}

export async function getUserObject(roomId: string, userId: string): Promise<RoomUser | null> {
  const rows = await sql`
    SELECT * FROM room_users
    WHERE room_id = ${roomId} AND user_id = ${userId}
  `;
  return (rows[0] as RoomUser) || null;
}

export async function toggleUserObject(roomId: string, userId: string): Promise<void> {
  await sql`
    UPDATE room_users
    SET is_active = NOT is_active
    WHERE room_id = ${roomId} AND user_id = ${userId}
  `;
}

export async function getAvailableObjects(roomId: string, theme: Room['theme']): Promise<string[]> {
  const themeObjects: Record<Room['theme'], string[]> = {
    rainy: ['cat', 'kettle', 'computer', 'window'],
    midnight: ['neon', 'fridge', 'radio', 'vending'],
    forest: ['fire', 'tent', 'trees', 'guitar'],
  };

  const allObjects = themeObjects[theme];
  const users = await getRoomUsers(roomId);
  const assignedObjects = users.map(u => u.object_id);
  const available = allObjects.filter(obj => !assignedObjects.includes(obj));

  return available.length > 0 ? available : allObjects;
}
