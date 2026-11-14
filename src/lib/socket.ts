// src/lib/socket.ts
import { io, type Socket } from 'socket.io-client'
import { getToken } from './api'

let socket: Socket | null = null

/** Socket lazy — se conecta al mismo origen (Vite proxya /socket.io al backend). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 10000,
    })
  }
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
