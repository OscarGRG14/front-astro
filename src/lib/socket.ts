// src/lib/socket.ts
import { io, type Socket } from 'socket.io-client'
import { getToken } from './api'

let socket: Socket | null = null

// En dev: '/' (Vite proxya /socket.io con ws:true).
// En prod: VITE_WS_URL, o el origen de VITE_API_URL si el WS va al mismo host.
const socketUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl && /^https?:\/\//.test(apiUrl)) return new URL(apiUrl).origin
  return '/'
}

/** Socket lazy — se conecta al mismo origen (Vite proxya /socket.io al backend). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(socketUrl(), {
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
