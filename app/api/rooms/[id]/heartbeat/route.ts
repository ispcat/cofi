import { NextResponse } from 'next/server';
import { updateUserActivity, initializeTables } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure tables exist
    await initializeTables();

    const { id } = await params;
    const { userId } = await request.json();
    const roomId = id.toUpperCase();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await updateUserActivity(roomId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    );
  }
}
