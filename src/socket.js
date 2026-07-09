import { io } from 'socket.io-client';
import { getToken, BASE } from './auth.js';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(BASE, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: { token: getToken() },
    });
  }
  return socket;
}

// Call this after the user logs in/out, or the token changes, so a socket
// opened before auth (there shouldn't be one, but just in case) reconnects
// with the right token.
export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
