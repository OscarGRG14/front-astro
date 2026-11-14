// src/lib/auth.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { api, getToken, setToken, type User } from '@/lib/api'
import { disconnectSocket } from '@/lib/socket'

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const USER_KEY = 'astro_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: { id: string; nombre: string; email: string; role: User['role']; missionId: string } }>(
      '/auth/login', { email, password }
    )
    setToken(res.token)
    // Traer perfil completo
    const me = await api.get<User>('/auth/me')
    localStorage.setItem(USER_KEY, JSON.stringify(me))
    setUser(me)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem(USER_KEY)
    disconnectSocket()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fuera de AuthProvider')
  return ctx
}

export const isAuthenticated = () => Boolean(getToken())
