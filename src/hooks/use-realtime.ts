// src/hooks/use-realtime.ts
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '@/lib/socket'
import { useAuth } from '@/lib/auth'
import type { Alert, DashboardSummary, Metric } from '@/lib/api'

/**
 * Tiempo real: suscribe a eventos Socket.IO y sincroniza el cache de React Query.
 * - metric:new   → actualiza 'summary' (vitals/environment) y prepende a 'history'
 * - alert:new/updated → invalida 'alerts', 'summary', 'crew' (afectan health score)
 * El polling existente queda como respaldo; esto hace la actualización instantánea.
 */
export function useRealtime() {
  const qc = useQueryClient()
  const userId = useAuth().user?._id
  const [connected, setConnected] = useState(false)
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  useEffect(() => {
    const socket = getSocket()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    const upsertLatest = (list: Metric[], m: Metric) => {
      const i = list.findIndex((x) => x.type === m.type)
      if (i === -1) return [m, ...list]
      const copy = [...list]
      copy[i] = m
      return copy
    }

    const onMetric = (m: Metric & { astronaut?: string | null; missionId?: string }) => {
      // Summary: actualizar el último valor por tipo sin esperar refetch
      qc.setQueriesData<DashboardSummary>({ queryKey: ['summary'] }, (old) => {
        if (!old) return old
        if (m.scope === 'environment') {
          return { ...old, environment: upsertLatest(old.environment, m) }
        }
        if (m.astronaut && m.astronaut === old.astronaut?.id) {
          return { ...old, vitals: upsertLatest(old.vitals, m) }
        }
        return old
      })

      // History: prepend si la serie ya está en cache y le pertenece a este astronauta
      qc.setQueriesData<Metric[]>(
        {
          predicate: (q) =>
            q.queryKey[0] === 'history' &&
            q.queryKey[1] === m.type &&
            (m.scope === 'environment'
              ? q.queryKey[4] === 'environment'
              : (q.queryKey[3] ?? userIdRef.current) === m.astronaut),
        },
        (old) => {
          if (!old || old.some((x) => x._id === m._id)) return old
          return [m, ...old.slice(0, old.length - 1)]
        }
      )
    }

    const onAlert = (_a: Alert) => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
      qc.invalidateQueries({ queryKey: ['crew'] })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('metric:new', onMetric)
    socket.on('alert:new', onAlert)
    socket.on('alert:updated', onAlert)
    setConnected(socket.connected)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('metric:new', onMetric)
      socket.off('alert:new', onAlert)
      socket.off('alert:updated', onAlert)
    }
  }, [qc])

  return connected
}
