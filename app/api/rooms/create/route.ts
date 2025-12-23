import { NextResponse } from 'next/server';
import { createRoom, generateRoomId } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { theme } = await request.json();
    
    if (!theme || !['rainy', 'midnight', 'forest'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }
    
    const roomId = generateRoomId();
    const room = createRoom(roomId, theme);
    
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
