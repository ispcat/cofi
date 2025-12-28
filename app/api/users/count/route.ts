import { NextResponse } from 'next/server';
import { getActiveUserCount } from '@/lib/db';

export const revalidate = 0;

export async function GET() {
  try {
    const count = getActiveUserCount();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Returning active user count: ${count}`);
    }
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting active user count:', error);
    return NextResponse.json(
      { error: 'Failed to get active user count' },
      { status: 500 }
    );
  }
}
