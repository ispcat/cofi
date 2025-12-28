'use client';

import { useEffect } from 'react';

// Replicate generateUserId as it's a simple client-side utility
function generateClientUserId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const SESSION_ID_KEY = 'cofi_session_id';

async function sendHeartbeat(sessionId: string) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Sending heartbeat for session: ${sessionId}`);
    }
    await fetch('/api/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });
  } catch (error) {
    console.error('Failed to send heartbeat:', error);
  }
}

export default function SessionManager() {
  useEffect(() => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      sessionId = generateClientUserId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    // Send an initial heartbeat immediately
    sendHeartbeat(sessionId);

    // Then send a heartbeat every 15 seconds
    const intervalId = setInterval(() => {
      if (sessionId) {
        sendHeartbeat(sessionId);
      }
    }, 15000); // 15 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return null; // This is a non-visual component
}
