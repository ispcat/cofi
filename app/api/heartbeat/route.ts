import { NextResponse } from 'next/server';
import { updateSessionActivity } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Received heartbeat for session: ${sessionId}`);
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    updateSessionActivity(sessionId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating session heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to update session heartbeat' },
      { status: 500 }
    );
  }
}
