import { NextResponse } from 'next/server';
import { getRoomById, getRoomUsers } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = getRoomById(id.toUpperCase());
    
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    const users = getRoomUsers(id.toUpperCase());
    
    return NextResponse.json({ room, users });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}
