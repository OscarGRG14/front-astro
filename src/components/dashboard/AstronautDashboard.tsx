import { Activity, BedDouble, Dumbbell, HeartPulse, Plus, Radiation, Stethoscope, Thermometer, Wind } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HealthScore } from '@/components/dashboard/HealthScore'
import { VitalCard } from '@/components/dashboard/VitalCard'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { InsightCard } from '@/components/dashboard/InsightCard'
import { ExerciseDialog, MetricDialog, MoodDialog, SleepDialog, SymptomDialog } from '@/components/dashboard/RecordDialogs'
import { useMetricHistory, useSummary } from '@/hooks/use-health'
import type { Metric } from '@/lib/api'

export const vitalStatus = (type: string, v?: number): 'ok' | 'warning' | 'critical' => {
  if (v === undefined) return 'ok'
  switch (type) {
    case 'spo2': return v < 88 ? 'critical' : v < 92 ? 'warning' : 'ok'
    case 'heart_rate': return v > 140 ? 'critical' : v > 110 || v < 40 ? 'warning' : 'ok'
    case 'body_temperature': return v > 39.5 ? 'critical' : v > 38 || v < 35.5 ? 'warning' : 'ok'
    case 'blood_pressure_systolic': return v > 180 ? 'critical' : v > 140 || v < 90 ? 'warning' : 'ok'
    case 'co2': return v > 5000 ? 'critical' : v > 2000 ? 'warning' : 'ok'
    default: return 'ok'
  }
}

const find = (metrics: Metric[], type: string) => metrics.find((m) => m.type === type)

/**
 * Dashboard de salud de un astronauta.
 * - Sin astronautId: vista propia (con botones de registro).
 * - Con astronautId: vista médico/control de un tripulante (solo lectura).
 */
export function AstronautDashboard({ astronautId, showActions = true }: { astronautId?: string; showActions?: boolean }) {
  const { data: summary, isLoading } = useSummary(astronautId)
  const hrHistory = useMetricHistory('heart_rate', 24, { astronautId })
  const spo2History = useMetricHistory('spo2', 24, { astronautId })

  if (isLoading || !summary) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div></div>
  }

  const v = summary.vitals
  const env = summary.environment
  const b = summary.baseline

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Salud</h1>
          <p className="text-sm text-muted-foreground">
            {summary.astronaut.nombre} · Misión {summary.astronaut.missionId} · telemetría en vivo
          </p>
        </div>
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <MetricDialog trigger={<Button size="sm" variant="outline"><Plus className="size-4" /> Vital</Button>} />
            <SleepDialog trigger={<Button size="sm" variant="outline"><BedDouble className="size-4" /> Sueño</Button>} />
            <ExerciseDialog trigger={<Button size="sm" variant="outline"><Dumbbell className="size-4" /> Ejercicio</Button>} />
            <MoodDialog trigger={<Button size="sm" variant="outline"><Stethoscope className="size-4" /> Cuestionario</Button>} />
            <SymptomDialog trigger={<Button size="sm" variant="outline"><Activity className="size-4" /> Síntoma</Button>} />
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex items-center justify-center">
          <CardContent className="flex flex-col items-center gap-3 pt-0">
            <HealthScore score={summary.healthScore} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Radiation className="size-4" />
              Radiación acumulada: <b className="text-foreground">{summary.radiationAccumulated_mSv} mSv</b>
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2"><InsightCard astronautId={astronautId} /></div>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <HeartPulse className="size-4" /> Signos vitales
          {v.length > 0 && <Badge variant="outline" className="text-xs">en vivo</Badge>}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <VitalCard title="Frecuencia cardíaca" icon={HeartPulse} latest={find(v, 'heart_rate')}
            history={hrHistory.data} baseline={b?.restingHeartRate} status={vitalStatus('heart_rate', find(v, 'heart_rate')?.value)} />
          <VitalCard title="SpO2" icon={Wind} latest={find(v, 'spo2')}
            history={spo2History.data} baseline={b?.spo2} status={vitalStatus('spo2', find(v, 'spo2')?.value)} />
          <VitalCard title="Temperatura" icon={Thermometer} latest={find(v, 'body_temperature')}
            baseline={b?.bodyTemperature} status={vitalStatus('body_temperature', find(v, 'body_temperature')?.value)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Ambiente de cabina</CardTitle>
            <CardDescription>Sensores de la misión</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {[
              { label: 'CO2', m: find(env, 'co2'), warn: (x?: number) => vitalStatus('co2', x) },
              { label: 'Humedad', m: find(env, 'humidity'), warn: () => 'ok' as const },
              { label: 'Temp', m: find(env, 'ambient_temperature'), warn: () => 'ok' as const },
            ].map((e) => (
              <div key={e.label} className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">{e.label}</p>
                <p className={`mt-1 text-xl font-bold tabular-nums ${e.warn(e.m?.value) === 'critical' ? 'text-red-400' : e.warn(e.m?.value) === 'warning' ? 'text-amber-400' : ''}`}>
                  {e.m ? e.m.value : '—'}
                </p>
                <p className="text-xs text-muted-foreground">{e.m?.unit}</p>
              </div>
            ))}
          </CardContent>
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BedDouble className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sueño prom. 7d:</span>
                <b>{summary.wellness7d.avgSleepMinutes ? `${Math.round(summary.wellness7d.avgSleepMinutes / 60)}h ${summary.wellness7d.avgSleepMinutes % 60}m` : '—'}</b>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ejercicio 7d:</span>
                <b>{summary.wellness7d.exerciseMinutes} min</b>
              </div>
            </div>
          </CardContent>
        </Card>
        <AlertsPanel alerts={summary.activeAlerts} />
      </div>
    </div>
  )
}
