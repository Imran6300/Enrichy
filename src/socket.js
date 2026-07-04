import { io } from 'socket.io-client';
import { getStoredApiKey } from './auth.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(BASE, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: { token: getStoredApiKey() },
    });
  }
  return socket;
}

// Call this after the user unlocks the dashboard with a freshly-verified
// key, or after the key changes, so a socket opened before auth (there
// shouldn't be one, but just in case) reconnects with the right token.
export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
