import { NextResponse } from 'next/server';
import { createRoom, generateRoomId, initializeTables } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Ensure tables exist
    await initializeTables();

    const { theme } = await request.json();

    if (!theme || !['rainy', 'midnight', 'forest'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }

    const roomId = await generateRoomId();
    const room = await createRoom(roomId, theme);

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
