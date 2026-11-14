// src/lib/api.ts
// En dev: '/api/v1' (Vite proxya a localhost:3000).
// En prod: VITE_API_URL absoluta, p.ej. https://api.midominio.com/api/v1
const BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '')

const TOKEN_KEY = 'astro_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && token) setToken(null)
    throw new Error(body.message || `Error ${res.status}`)
  }
  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// ---- Tipos del dominio ----
export interface User {
  _id: string
  id?: string
  nombre: string
  apellido: string
  fullName?: string
  email: string
  role: 'astronaut' | 'medic' | 'admin'
  missionId: string
  isActive?: boolean
  perfil?: { edad?: number; sexo?: string; pesoKg?: number; alturaCm?: number }
  baseline?: { restingHeartRate?: number; spo2?: number; systolicBP?: number; diastolicBP?: number; bodyTemperature?: number }
}

export interface Metric {
  _id?: string
  type: string
  value: number
  unit: string
  recordedAt: string
  source?: 'device' | 'manual'
  scope?: 'vital' | 'environment'
}

export interface Alert {
  _id: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  ruleKey: string
  status: 'active' | 'acknowledged' | 'resolved'
  metricValue?: number
  createdAt: string
}

export interface Insight {
  content: {
    summary: string
    riskLevel: 'bajo' | 'moderado' | 'alto' | 'critico'
    recommendations: string[]
    focusAreas: string[]
  }
  generatedAt: string
}

export interface DashboardSummary {
  astronaut: { id: string; nombre: string; missionId: string }
  healthScore: number
  vitals: Metric[]
  baseline?: User['baseline']
  environment: Metric[]
  radiationAccumulated_mSv: number
  activeAlerts: Alert[]
  wellness7d: { avgSleepMinutes: number | null; exerciseMinutes: number; exerciseSessions: number }
  latestMood: { instrument: string; score: number; date: string }[]
  insight: Insight['content'] | null
}

export interface CrewMember {
  astronaut: { id: string; nombre: string }
  healthScore: number
  vitals: Metric[]
  activeAlertCount: number
  worstSeverity: 'info' | 'warning' | 'critical' | null
}

export interface Device {
  _id: string
  deviceId: string
  name?: string
  kind: 'wearable' | 'environment'
  assignedTo?: string | { _id: string; nombre: string; apellido: string }
  missionId: string
  sensors: string[]
  isActive: boolean
  lastSeen?: string
}

export interface SleepLog {
  _id: string
  date: string
  durationMinutes: number
  quality?: number
  awakenings?: number
  notes?: string
}

export interface ExerciseLog {
  _id: string
  date: string
  exerciseType: string
  durationMinutes: number
  intensity?: string
  notes?: string
}

export interface MoodRecord {
  _id: string
  instrument: string
  score: number
  notes?: string
  recordedAt: string
}

export interface SymptomRecord {
  _id: string
  description: string
  category?: string
  severity?: number
  bodyArea?: string
  recordedAt: string
}
