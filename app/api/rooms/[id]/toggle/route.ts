import { NextResponse } from 'next/server';
import { toggleUserObject, getUserObject } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await request.json();
    const roomId = id.toUpperCase();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    toggleUserObject(roomId, userId);
    const userObject = getUserObject(roomId, userId);
    
    return NextResponse.json({ userObject });
  } catch (error) {
    console.error('Error toggling object:', error);
    return NextResponse.json(
      { error: 'Failed to toggle object' },
      { status: 500 }
    );
  }
}
