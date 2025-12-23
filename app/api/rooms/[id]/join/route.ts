import { NextResponse } from 'next/server';
import { getRoomById, generateUserId, getAvailableObjects, assignUserToObject, getUserObject } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { userId: existingUserId } = body;
    const roomId = id.toUpperCase();
    const room = getRoomById(roomId);
    
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Check if user already exists in this room
    if (existingUserId) {
      const existing = getUserObject(roomId, existingUserId);
      if (existing) {
        return NextResponse.json({ userId: existingUserId, userObject: existing });
      }
    }
    
    // Generate new user ID
    const userId = existingUserId || generateUserId();
    const availableObjects = getAvailableObjects(roomId, room.theme);
    
    if (availableObjects.length === 0) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      );
    }
    
    const assignedObject = availableObjects[Math.floor(Math.random() * availableObjects.length)];
    assignUserToObject(roomId, userId, assignedObject);
    
    const userObject = getUserObject(roomId, userId);
    
    return NextResponse.json({ userId, userObject });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
