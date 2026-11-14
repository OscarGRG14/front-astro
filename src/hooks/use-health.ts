// src/hooks/use-health.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  api,
  type Alert, type CrewMember, type DashboardSummary, type Device,
  type ExerciseLog, type Insight, type Metric, type MoodRecord,
  type SleepLog, type SymptomRecord, type User,
} from '@/lib/api'

const POLL = 5000 // telemetría en vivo cada 5s

// ---------- Dashboard ----------
export function useSummary(astronautId?: string) {
  return useQuery({
    queryKey: ['summary', astronautId || 'me'],
    queryFn: () => api.get<DashboardSummary>(`/dashboard/summary${astronautId ? `?astronautId=${astronautId}` : ''}`),
    refetchInterval: POLL,
  })
}

export function useCrew() {
  return useQuery({
    queryKey: ['crew'],
    queryFn: () => api.get<CrewMember[]>('/dashboard/crew'),
    refetchInterval: POLL,
  })
}

// ---------- Métricas ----------
export function useMetricHistory(type: string, limit = 30, opts: { enabled?: boolean; astronautId?: string; scope?: string } = {}) {
  const params = new URLSearchParams({ type, limit: String(limit) })
  if (opts.astronautId) params.set('astronautId', opts.astronautId)
  if (opts.scope) params.set('scope', opts.scope)
  return useQuery({
    queryKey: ['history', type, limit, opts.astronautId, opts.scope],
    queryFn: () => api.get<Metric[]>(`/metrics?${params}`),
    refetchInterval: POLL,
    enabled: opts.enabled !== false,
  })
}

// ---------- Alertas ----------
export function useAlerts(opts: { astronautId?: string; severity?: string; includeResolved?: boolean } = {}) {
  const params = new URLSearchParams()
  if (opts.astronautId) params.set('astronautId', opts.astronautId)
  if (opts.severity) params.set('severity', opts.severity)
  if (opts.includeResolved) params.set('includeResolved', 'true')
  return useQuery({
    queryKey: ['alerts', opts],
    queryFn: () => api.get<Alert[]>(`/alerts?${params}`),
    refetchInterval: POLL,
  })
}

const invalidateHealth = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['alerts'] })
  qc.invalidateQueries({ queryKey: ['summary'] })
  qc.invalidateQueries({ queryKey: ['crew'] })
}

export function useAckAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/alerts/${id}/acknowledge`),
    onSuccess: () => invalidateHealth(qc),
  })
}

export function useResolveAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/alerts/${id}/resolve`),
    onSuccess: () => invalidateHealth(qc),
  })
}

// ---------- Insights (IA) ----------
export function useInsight(astronautId?: string) {
  return useQuery({
    queryKey: ['insight', astronautId || 'me'],
    queryFn: () => api.get<{ insight: Insight; cached: boolean }>(`/insights/daily${astronautId ? `?astronautId=${astronautId}` : ''}`),
    staleTime: 60_000,
    retry: 1,
  })
}

export function useGenerateInsight(astronautId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/insights/generate', astronautId ? { astronautId } : {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insight', astronautId || 'me'] }),
  })
}

// ---------- Registros de bienestar ----------
type RecordKind = 'sleep' | 'exercise' | 'mood' | 'symptoms'
const recordTypes = { sleep: [] as SleepLog[], exercise: [] as ExerciseLog[], mood: [] as MoodRecord[], symptoms: [] as SymptomRecord[] }
export type RecordOf<K extends RecordKind> = (typeof recordTypes)[K][number]

export function useRecords<K extends RecordKind>(kind: K, astronautId?: string) {
  return useQuery({
    queryKey: ['records', kind, astronautId || 'me'],
    queryFn: () => api.get<RecordOf<K>[]>(`/records/${kind}${astronautId ? `?astronautId=${astronautId}` : ''}`),
    refetchInterval: POLL,
  })
}

export function useCreateRecord(kind: RecordKind) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post(`/records/${kind}`, data),
    onSuccess: () => {
      invalidateHealth(qc)
      qc.invalidateQueries({ queryKey: ['records', kind] })
    },
  })
}

export function useCreateMetric() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { type: string; value: number }) => api.post('/metrics', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['summary'] })
      qc.invalidateQueries({ queryKey: ['history'] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

// ---------- Admin: usuarios ----------
export function useUsers(role?: string) {
  return useQuery({
    queryKey: ['users', role || 'all'],
    queryFn: () => api.get<User[]>(`/users${role ? `?role=${role}` : ''}`),
  })
}

export function useRegisterUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/auth/register', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch<User>(`/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['crew'] })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['crew'] })
    },
  })
}

// ---------- Admin: dispositivos ----------
export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => api.get<Device[]>('/devices'),
    refetchInterval: 10_000,
  })
}

export function useRegisterDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<{ device: Device; apiKey: string }>('/devices', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  })
}

export function useUpdateDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch<Device>(`/devices/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  })
}

export function useRotateDeviceKey() {
  return useMutation({
    mutationFn: (id: string) => api.post<{ apiKey: string; deviceId: string }>(`/devices/${id}/rotate-key`),
  })
}

export function useDeleteDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/devices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  })
}
